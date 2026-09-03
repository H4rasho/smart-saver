"use server";

import { client } from "@/database/database";
import { type CreateExpense, CreateExpenseSchema } from "@/types/income";
import { openai } from "@ai-sdk/openai";
import { currentUser } from "@clerk/nextjs/server";
import { generateObject } from "ai";
import { revalidateTag } from "next/cache";
import { z } from "zod";

export async function addExpense(
	_prevState: {
		message: string;
	},
	formData: FormData,
): Promise<{ message: string }> {
	const user = await currentUser();
	const userEmail = user?.emailAddresses[0].emailAddress;
	if (!userEmail) {
		throw new Error("User not found");
	}
	const userDb = await client.execute({
		sql: "SELECT * FROM users WHERE email = ?",
		args: [userEmail],
	});
	const userId = userDb.rows[0].id;

	//TODO: use zod to validate form data
	const form = Object.fromEntries(
		formData.entries(),
	) as unknown as CreateExpense;

	const { description, amount, category } = form;

	await client.execute({
		sql: "INSERT INTO expenses (user_id, name, amount, category_id) VALUES (?, ?, ?, ?)",
		args: [userId, description, amount, category],
	});

	return { message: "Expense added successfully" };
}

export async function addExpensesFromFile(
	_prevState: {
		message: string;
	},
	formData: FormData,
): Promise<void> {
	const file = formData.get("file") as File;
	if (!file) {
		throw new Error("No file uploaded");
	}
	const fileContent = await file.arrayBuffer();

	const result = await generateObject({
		model: openai("gpt-4o"),
		schema: z.object({
			expenses: CreateExpenseSchema.array(),
		}),
		messages: [
			{
				role: "user",
				content: [
					{
						type: "text",
						text: `Extract the expenses from the PDF file and categorize them based on the content of the file, if the category is not found. The categories are: 
            food, transport, health, education, insurance. If the category is not found, use "others".
          `,
					},
					{
						type: "file",
						data: fileContent,
						mediaType: "application/pdf",
						filename: file.name,
					},
				],
			},
		],
	});

	await addExpenses(result.object.expenses);
	revalidateTag("expenses", "max");
}

export async function addExpenses(expenses: CreateExpense[]) {
	const user = await currentUser();

	const userEmail = user?.emailAddresses[0].emailAddress;

	if (!userEmail) {
		throw new Error("User not found");
	}
	const userDb = await client.execute({
		sql: "SELECT * FROM users WHERE email = ?",
		args: [userEmail],
	});
	const userId = userDb.rows[0].id;

	const categories = await client.execute({
		sql: "SELECT * FROM categories WHERE user_id = ?",
		args: [userId],
	});

	//Create expenses list
	const expensesList = expenses.map((expense) => ({
		sql: "INSERT INTO expenses (user_id, name, amount, category_id, created_at) VALUES (?, ?, ?, ?, ?)",
		args: [
			userId,
			expense.description,
			expense.amount,
			categories.rows.find((category) => category.name === expense.category)
				?.id || null,
			expense.date,
		],
	}));

	console.log(expensesList);

	const result = await client.batch(expensesList);
	return result.entries();
}

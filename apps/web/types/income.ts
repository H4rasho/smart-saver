import { z } from "zod";

export interface Income {
	id: string;
	source: string;
	amount: string;
}

export interface UserCreateProfile {
	selectedCurrency: string;
	categories: string[];
	incomeSources: Income[];
	fixedExpenses: string[];
}

export const CreateExpenseSchema = z.object({
	description: z.string(),
	amount: z.number(),
	category: z.string(),
	date: z.string(),
});

export const CreateIncomeSchema = z.object({
	name: z.string(),
	amount: z.string(),
});

export const CategorySchema = z.object({
	id: z.number(),
	name: z.string(),
});

export type CreateExpense = z.infer<typeof CreateExpenseSchema>;
export type CreateIncome = z.infer<typeof CreateIncomeSchema>;
export type Category = z.infer<typeof CategorySchema>;

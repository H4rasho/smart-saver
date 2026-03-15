"use server";

import { getUserCategoriesAction } from "@/app/core/categories/actions/categories-actions";
import {
	getUserId,
	getUserOpenAIKey,
} from "@/app/core/user/actions/user-actions";
import { CONFIG } from "@/config/config";
import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { MovementTypeDict } from "../const/movement-type-dict";
import {
	createMovementForUser,
	validateMovementData,
} from "../functions/movement-function";
import {
	createManyMovements,
	deleteMovement,
	getAllMovements,
	getBalance,
	getTotalsByType,
	updateMovement,
} from "../repository/movements-repository";
import type {
	CreateMovement,
	CreateNotRecurringMovement,
	MovementWithCategoryAndMovementType,
} from "../types/movement-type";
import { CreateMovementSchema } from "../types/movement-type";

const { OPENAI_API_KEY } = CONFIG;

async function getOpenAIKeyForUser(): Promise<string | null> {
	const userOpenAIKey = await getUserOpenAIKey();
	return userOpenAIKey || OPENAI_API_KEY || null;
}

export async function createMovmentAction(
	_prevState: unknown,
	formData: FormData,
): Promise<{ success?: boolean; error?: string }> {
	try {
		const form = Object.fromEntries(formData);
		const userId = await getUserId();

		if (!userId) {
			return { error: "Usuario no autenticado" };
		}

		const movementType =
			MovementTypeDict[form.movementType as keyof typeof MovementTypeDict];

		const movementData: CreateNotRecurringMovement = {
			amount: Number(form.amount),
			name: form.description as string,
			movement_type_id: movementType,
			category_id: Number(form.category),
			transaction_date: form.date as string,
			created_at: Date.now().toString(),
		};

		validateMovementData(movementData);
		await createMovementForUser(movementData, userId.toString());

		revalidatePath("/home");
		return { success: true };
	} catch (error) {
		console.error(error);
		return {
			error:
				error instanceof Error ? error.message : "Error al crear el movimiento",
		};
	}
}

export async function getMovmentsAction(
	userId: string,
): Promise<MovementWithCategoryAndMovementType[]> {
	try {
		const movements = await getAllMovements(userId);
		if (!movements.length) return [];
		return movements.map((movements) => ({
			...movements,
			created_at: new Date(movements.created_at).toLocaleDateString("es-ES", {
				day: "2-digit",
				month: "2-digit",
				year: "numeric",
			}),
		}));
	} catch (error) {
		console.error(error);
		throw error;
	}
}

export async function getTotalsByTypeAction() {
	try {
		const userId = await getUserId();
		if (!userId) throw new Error("No user id");
		return await getTotalsByType(userId);
	} catch (error) {
		console.error(error);
		return { total_expenses: 0, total_income: 0 };
	}
}

export async function getBalanceAction() {
	try {
		const userId = await getUserId();
		if (!userId) throw new Error("No user id");
		return await getBalance(userId);
	} catch (error) {
		console.error(error);
		return 0;
	}
}

export async function addMovmentsFromFileAction(
	_prevState: {
		message: string;
	},
	formData: FormData,
): Promise<void> {
	const file = formData.get("file") as File;
	if (!file) {
		throw new Error("No file uploaded");
	}
	const userId = await getUserId();
	if (!userId) throw new Error("No user id");
	const userCategories = await getUserCategoriesAction(userId);
	const fileContent = await file.arrayBuffer();
	const categoriesDescription = userCategories
		.map((cat) => `${cat.name} (id: ${cat.id})`)
		.join(", ");

	const openAiKey = await getOpenAIKeyForUser();
	if (!openAiKey) {
		throw new Error("API key de OpenAI no configurada");
	}
	const scopedOpenAI = createOpenAI({ apiKey: openAiKey });
	const result = await generateObject({
		model: scopedOpenAI("gpt-4o"),
		schema: z.object({
			expenses: CreateMovementSchema.array(),
		}),
		messages: [
			{
				role: "user",
				content: [
					{
						type: "text",
						text: `Extract the expenses and incomes from the PDF file and categorize them using ONLY the following user-defined categories:
            ${categoriesDescription}.

            When categorizing an expense, you must use the corresponding category ID in the category_id field.
            If an expense doesn't clearly match any of these categories, use the category with the closest match.

            The identifier of movement_type_id is a number that represents the type of movement (income or expense), which can be either 1 for income or 3 for expense.
			Don't forget about the transaction_date field, it should be the date of the movement.

            Each expense should include all required fields from the schema, with the category_id being one of the IDs listed above.`,
					},
					{
						type: "file",
						data: fileContent,
						mimeType: "application/pdf",
						filename: file.name,
					},
				],
			},
		],
	});
	const movements = result.object.expenses;
	console.log(movements);
	await createManyMovements(movements);
	revalidateTag("movement");
}

export async function extractMovementsFromFileAction(
	_prevState: { movements: CreateMovement[]; error: string | null },
	formData: FormData,
): Promise<{ movements: CreateMovement[]; error: string | null }> {
	try {
		const file = formData.get("file") as File;
		if (!file) {
			return { movements: [], error: "No file uploaded" };
		}
		const userId = await getUserId();
		if (!userId) return { movements: [], error: "No user id" };
		const userCategories = await getUserCategoriesAction(userId);
		const fileContent = await file.arrayBuffer();
		const categoriesDescription = userCategories
			.map((cat) => `${cat.name} (id: ${cat.id})`)
			.join(", ");

		const openAiKey = await getOpenAIKeyForUser();
		if (!openAiKey) {
			return { movements: [], error: "API key de OpenAI no configurada" };
		}
		const scopedOpenAI = createOpenAI({ apiKey: openAiKey });
		const result = await generateObject({
			model: scopedOpenAI("gpt-4o"),
			schema: z.object({
				expenses: CreateMovementSchema.array(),
			}),
			messages: [
				{
					role: "user",
					content: [
						{
							type: "text",
							text: `Extract the expenses and incomes from the PDF file and categorize them using ONLY the following user-defined categories:
              ${categoriesDescription}. 

			  The incones or expenses could be in different columns, pages etc look for them all.
              When categorizing an expense, you must use the corresponding category ID in the category_id field.
              If an expense doesn't clearly match any of these categories, use the category with the closest match.

            The identifier of movement_type_id is a number that represents the type of movement (income or expense), which can be either 1 for income or 3 for expense.
  			Don't forget about the transaction_date field, it should be the date of the movement.

              Each expense should include all required fields from the schema, with the category_id being one of the IDs listed above.`,
						},
						{
							type: "file",
							data: fileContent,
							mimeType: "application/pdf",
							filename: file.name ?? "file.pdf",
						},
					],
				},
			],
		});
		const movementsRaw = result.object.expenses;
		const movements: CreateMovement[] = movementsRaw.map(
			(mov: CreateNotRecurringMovement) => ({
				clerk_id: String(userId),
				is_recurring: false,
				recurrence_period: null,
				recurrence_start: null,
				recurrence_end: null,
				...mov,
			}),
		);
		return { movements, error: null };
	} catch (e: unknown) {
		return {
			movements: [],
			error: e instanceof Error ? e.message : "Error al procesar el archivo",
		};
	}
}

export async function saveManyMovementsAction(
	movements: CreateMovement[],
): Promise<void> {
	if (!movements || movements.length === 0) return;
	await createManyMovements(movements);
	revalidateTag("movement");
}

export async function deleteMovmentAction(_prevState: unknown, id: number) {
	if (!id) throw new Error("No id provided");
	try {
		await deleteMovement(id);
		revalidateTag("movement");
	} catch (error) {
		console.error(error);
		throw error;
	}
}

export async function updateMovementAction(
	_prevState: unknown,
	formData: FormData,
): Promise<{ success: boolean; error?: string }> {
	const idRaw = formData.get("id");
	if (!idRaw) return { success: false, error: "No id provided" };
	const id = Number(idRaw);

	const name = String(formData.get("name") ?? "");
	const amount = Number(formData.get("amount") ?? 0);
	const categoryIdRaw = formData.get("category_id");
	const category_id = categoryIdRaw ? Number(categoryIdRaw) : null;
	const transaction_date = (formData.get("transaction_date") as string) ?? null;

	if (!name) return { success: false, error: "Name is required" };
	if (!Number.isFinite(amount))
		return { success: false, error: "Amount is invalid" };

	try {
		await updateMovement(id, { name, amount, category_id, transaction_date });
		revalidateTag("movement");
		return { success: true };
	} catch (error) {
		console.error(error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Error al actualizar",
		};
	}
}

export async function extractMovementsFromAudioAction(
	_prevState: { movements: CreateMovement[]; error: string | null },
	formData: FormData,
): Promise<{ movements: CreateMovement[]; error: string | null }> {
	try {
		const audioFile = formData.get("audio") as File;
		if (!audioFile) {
			return { movements: [], error: "No audio file provided" };
		}

		const userId = await getUserId();
		if (!userId) return { movements: [], error: "No user id" };

		const userCategories = await getUserCategoriesAction(userId);
		const categoriesDescription = userCategories
			.map((cat) => `${cat.name} (id: ${cat.id})`)
			.join(", ");
		const openAiKey = await getOpenAIKeyForUser();
		if (!openAiKey) {
			return { movements: [], error: "API key de OpenAI no configurada" };
		}
		const scopedOpenAI = createOpenAI({ apiKey: openAiKey });

		// Convert audio to text using OpenAI Whisper
		const arrayBuffer = await audioFile.arrayBuffer();
		const transcription = await fetch(
			"https://api.openai.com/v1/audio/transcriptions",
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${openAiKey}`,
				},
				body: (() => {
					const formData = new FormData();
					formData.append(
						"file",
						new Blob([arrayBuffer], { type: audioFile.type }),
						"audio.webm",
					);
					formData.append("model", "whisper-1");
					formData.append("language", "es");
					return formData;
				})(),
			},
		);

		if (!transcription.ok) {
			const errorBody = await transcription.text();
			console.error("Error transcribiendo audio en OpenAI", {
				status: transcription.status,
				statusText: transcription.statusText,
				body: errorBody,
			});
			throw new Error("Error al transcribir el audio");
		}

		const transcriptionData = await transcription.json();
		const text = transcriptionData.text;

		// Process the transcribed text to extract movements
		const result = await generateObject({
			model: scopedOpenAI("gpt-4o"),
			schema: z.object({
				expenses: CreateMovementSchema.array(),
			}),
			messages: [
				{
					role: "user",
					content: `Extract the expenses and incomes from the following transcribed audio text and categorize them using ONLY the following user-defined categories:
            ${categoriesDescription}.

            Audio transcription: "${text}"

            When categorizing an expense, you must use the corresponding category ID in the category_id field.
            If an expense doesn't clearly match any of these categories, use the category with the closest match.

            The identifier of movement_type_id is a number that represents the type of movement (income or expense), which can be either 1 for income or 3 for expense.
            
            For the transaction_date field, if no specific date is mentioned in the audio, use today's date.
            If a relative date is mentioned (like "yesterday", "last week"), calculate the appropriate date.

            Each expense should include all required fields from the schema, with the category_id being one of the IDs listed above.`,
				},
			],
		});

		const movementsRaw = result.object.expenses;
		const movements: CreateMovement[] = movementsRaw.map(
			(mov: CreateNotRecurringMovement) => ({
				clerk_id: String(userId),
				is_recurring: false,
				recurrence_period: null,
				recurrence_start: null,
				recurrence_end: null,
				...mov,
			}),
		);

		return { movements, error: null };
	} catch (e: unknown) {
		console.error("Error en extractMovementsFromAudioAction", e);
		return {
			movements: [],
			error: e instanceof Error ? e.message : "Error al procesar el audio",
		};
	}
}

"use server";
import { users } from "@/app/core/user/model/user-model";
import type { User } from "@/app/core/user/types/user-types";
import { db } from "@/database/database";
import { decrypt, encrypt } from "@/lib/encryption";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getCurrentUser(): Promise<User> {
	const userLogged = await currentUser();
	const clerkId = userLogged?.id;
	if (!clerkId) throw new Error("No clerk id found");
	const userDb = await db
		.select()
		.from(users)
		.where(eq(users.clerk_id, clerkId));
	const user = userDb[0] as User;
	return user;
}

export async function getUserId(): Promise<string | undefined> {
	const userLogged = await currentUser();
	const clerkId = userLogged?.id;
	return clerkId;
}

export const getUserCurrency = async (): Promise<string> => {
	const user = await getCurrentUser();
	return user?.currency || "CLP";
};

export const updateUserCurrency = async (
	currency: string,
): Promise<{ success: boolean; message: string }> => {
	try {
		const userLogged = await currentUser();
		const clerkId = userLogged?.id;
		if (!clerkId) throw new Error("No clerk id found");

		await db.update(users).set({ currency }).where(eq(users.clerk_id, clerkId));

		revalidatePath("/settings");
		revalidatePath("/home");

		return { success: true, message: "Moneda actualizada correctamente" };
	} catch (error) {
		console.error("Error updating currency:", error);
		return { success: false, message: "Error al actualizar la moneda" };
	}
};

export async function getUserOpenAIKey(): Promise<string | null> {
	try {
		const user = await getCurrentUser();
		const encryptedKey = user.openai_api_key;
		if (!encryptedKey) return null;
		return decrypt(encryptedKey);
	} catch (error) {
		console.error("Error getting OpenAI key:", error);
		return null;
	}
}

export async function getUserOpenAIKeyStatus(): Promise<boolean> {
	try {
		const user = await getCurrentUser();
		return Boolean(user.openai_api_key);
	} catch (error) {
		console.error("Error getting OpenAI key status:", error);
		return false;
	}
}

export async function updateUserOpenAIKey(
	apiKey: string,
): Promise<{ success: boolean; message: string }> {
	try {
		const userLogged = await currentUser();
		const clerkId = userLogged?.id;
		if (!clerkId) throw new Error("No clerk id found");
		const encryptedKey = encrypt(apiKey.trim());

		await db
			.update(users)
			.set({ openai_api_key: encryptedKey })
			.where(eq(users.clerk_id, clerkId));

		revalidatePath("/settings");
		return { success: true, message: "API key guardada correctamente" };
	} catch (error) {
		console.error("Error updating OpenAI key:", error);
		return { success: false, message: "Error al guardar la API key" };
	}
}

export async function deleteUserOpenAIKey(): Promise<{
	success: boolean;
	message: string;
}> {
	try {
		const userLogged = await currentUser();
		const clerkId = userLogged?.id;
		if (!clerkId) throw new Error("No clerk id found");

		await db
			.update(users)
			.set({ openai_api_key: null })
			.where(eq(users.clerk_id, clerkId));

		revalidatePath("/settings");
		return { success: true, message: "API key eliminada correctamente" };
	} catch (error) {
		console.error("Error deleting OpenAI key:", error);
		return { success: false, message: "Error al eliminar la API key" };
	}
}

export async function testUserOpenAIKey(): Promise<{
	success: boolean;
	message: string;
}> {
	try {
		const apiKey = await getUserOpenAIKey();
		if (!apiKey) {
			return { success: false, message: "No hay API key configurada" };
		}

		const response = await fetch("https://api.openai.com/v1/models", {
			headers: {
				Authorization: `Bearer ${apiKey}`,
			},
		});

		if (response.ok) {
			return { success: true, message: "API key válida y funcionando" };
		}

		const errorBody = await response.json();
		return {
			success: false,
			message: errorBody?.error?.message || "API key inválida",
		};
	} catch (error) {
		console.error("Error testing OpenAI key:", error);
		return { success: false, message: "Error al conectar con OpenAI" };
	}
}

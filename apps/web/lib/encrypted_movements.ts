/**
 * Encrypted Movements Helper
 * Provides utilities to encrypt/decrypt movement data fields
 */

import type {
	CreateNotRecurringMovement,
	Movement,
	MovementWithCategoryAndMovementType,
} from "@/app/core/movements/types/movement-type";
import { decrypt, decryptNumber, encrypt, encryptNumber } from "./encryption";

/**
 * Fields that should be encrypted in movements
 * Currently: name (description) and amount (financial data)
 */

/**
 * Encrypts sensitive fields in a movement before saving to database
 * @param movement - The movement data to encrypt
 * @returns Movement with encrypted fields
 */
export function encryptMovement<T extends CreateNotRecurringMovement>(
	movement: T,
): T {
	try {
		return {
			...movement,
			name: encrypt(movement.name),
			amount: encryptNumber(movement.amount),
		};
	} catch (error) {
		console.error("Error encrypting movement:", error);
		throw new Error("Failed to encrypt movement data");
	}
}

/**
 * Encrypts an array of movements
 * @param movements - Array of movements to encrypt
 * @returns Array of movements with encrypted fields
 */
export function encryptMovements<T extends CreateNotRecurringMovement>(
	movements: T[],
): T[] {
	return movements.map((movement) => encryptMovement(movement));
}

/**
 * Decrypts sensitive fields in a movement after reading from database
 * @param movement - The encrypted movement data
 * @returns Movement with decrypted fields
 */
export function decryptMovement<T extends Movement>(movement: T): T {
	try {
		return {
			...movement,
			name: decrypt(movement.name),
			amount: decryptNumber(movement.amount as unknown as string),
		};
	} catch (error) {
		console.error("Error decrypting movement:", error);
		// Return original data if decryption fails (backwards compatibility)
		return movement;
	}
}

/**
 * Decrypts an array of movements
 * @param movements - Array of encrypted movements
 * @returns Array of movements with decrypted fields
 */
export function decryptMovements<T extends Movement>(movements: T[]): T[] {
	return movements.map((movement) => decryptMovement(movement));
}

/**
 * Decrypts movements with category and movement type
 * @param movements - Array of encrypted movements with relations
 * @returns Array of movements with decrypted fields
 */
export function decryptMovementsWithRelations(
	movements: MovementWithCategoryAndMovementType[],
): MovementWithCategoryAndMovementType[] {
	return movements.map((movement) => ({
		...movement,
		name: decrypt(movement.name),
		amount: decryptNumber(movement.amount as unknown as string),
	}));
}

/**
 * Encrypts the update data for a movement
 * @param data - The update data
 * @returns Encrypted update data
 */
export function encryptMovementUpdateData(data: {
	name: string;
	amount: number;
	category_id: number | null;
	transaction_date: string | null;
}): {
	name: string;
	amount: string;
	category_id: number | null;
	transaction_date: string | null;
} {
	return {
		...data,
		name: encrypt(data.name),
		amount: encryptNumber(data.amount),
	};
}

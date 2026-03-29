import { createMovement } from "../repository/movements-repository";
import type {
	CreateMovement,
	CreateNotRecurringMovement,
	Movement,
} from "../types/movement-type";

/**
 * Creates a movement with the provided data and user ID
 * @param movementData - The movement data without clerk_id
 * @param userId - The user ID to associate with the movement
 * @returns Promise<Movement> - The created movement
 */
export async function createMovementForUser(
	movementData: CreateNotRecurringMovement,
	userId: string,
): Promise<Movement> {
	const newMovement: CreateMovement = {
		...movementData,
		clerk_id: userId,
		is_recurring: false,
		recurrence_period: null,
		recurrence_start: null,
		recurrence_end: null,
		created_at: new Date().toISOString(),
	};

	try {
		const createdMovement = await createMovement(newMovement);
		return createdMovement;
	} catch (error) {
		console.error("Error creating movement:", error);
		if (error instanceof Error) {
			throw error;
		}

		throw new Error("Failed to create movement");
	}
}

/**
 * Validates movement data before creation
 * @param movementData - The movement data to validate
 * @returns boolean - True if valid, throws error if invalid
 */
export function validateMovementData(
	movementData: CreateNotRecurringMovement,
): boolean {
	if (!movementData.name || movementData.name.trim() === "") {
		throw new Error("Movement name is required");
	}

	if (!Number.isFinite(movementData.amount) || movementData.amount <= 0) {
		throw new Error("Movement amount must be greater than 0");
	}

	if (
		!Number.isInteger(movementData.movement_type_id) ||
		movementData.movement_type_id <= 0
	) {
		throw new Error("Movement type is required");
	}

	if (
		movementData.category_id !== null &&
		(!Number.isInteger(movementData.category_id) ||
			movementData.category_id <= 0)
	) {
		throw new Error("Movement category is invalid");
	}

	if (!movementData.transaction_date) {
		throw new Error("Transaction date is required");
	}

	return true;
}

import { Movement, type NewMovement } from "../domain/movement.js";
import type { MovementRepository } from "../domain/movement_repository.js";

export class InvalidMovementReferenceError extends Error {}

export class Movements {
	constructor(private readonly repository: MovementRepository) {}

	list(userId: string): Promise<Movement[]> {
		return this.repository.listForUser(userId);
	}

	async create(userId: string, movement: NewMovement): Promise<Movement> {
		const entity = Movement.create(userId, movement);
		if (!(await this.repository.movementTypeExists(entity.type.value))) {
			throw new InvalidMovementReferenceError("Movement type is invalid");
		}
		if (
			entity.category !== null &&
			!(await this.repository.categoryBelongsToUser(
				entity.category.value,
				userId,
			))
		) {
			throw new InvalidMovementReferenceError("Category is invalid");
		}
		return this.repository.createForUser(userId, entity);
	}
}

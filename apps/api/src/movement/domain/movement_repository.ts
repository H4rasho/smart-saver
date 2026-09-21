import type { Movement } from "./movement.js";

export interface MovementRepository {
	listForUser(userId: string): Promise<Movement[]>;
	categoryBelongsToUser(categoryId: number, userId: string): Promise<boolean>;
	movementTypeExists(typeId: number): Promise<boolean>;
	createForUser(userId: string, movement: Movement): Promise<Movement>;
}

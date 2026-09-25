import type { Movement } from "./movement.js";

export interface MovementReference {
	id: number;
	name: string;
}

export interface MovementRepository {
	listForUser(userId: string): Promise<Movement[]>;
	listCategoriesForUser(userId: string): Promise<MovementReference[]>;
	listMovementTypes(): Promise<MovementReference[]>;
	categoryBelongsToUser(categoryId: number, userId: string): Promise<boolean>;
	movementTypeExists(typeId: number): Promise<boolean>;
	createForUser(userId: string, movement: Movement): Promise<Movement>;
}

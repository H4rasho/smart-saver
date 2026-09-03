import { z } from "zod";

export const MovementSchema = z.object({
	id: z.number().int().positive(),
	clerk_id: z.string(),
	category_id: z.number().int().positive().nullable(),
	movement_type_id: z.number().int().positive(),
	name: z.string(),
	amount: z.number(),
	is_recurring: z.boolean(),
	recurrence_period: z.string().nullable(), // Puede ser 'monthly', 'weekly', etc.
	recurrence_start: z.string().nullable(), // ISO date string
	recurrence_end: z.string().nullable(), // ISO date string
	created_at: z.string(), // ISO datetime string
	transaction_date: z.string().nullable(), // ISO date string
});

// Tipo TypeScript inferido
export type Movement = z.infer<typeof MovementSchema>;
export const CreateMovementSchema = MovementSchema.omit({
	id: true,
	is_recurring: true,
	recurrence_period: true,
	recurrence_start: true,
	recurrence_end: true,
	clerk_id: true,
});
export type CreateNotRecurringMovement = z.infer<typeof CreateMovementSchema>;
export type CreateMovement = Omit<Movement, "id">;

export type MovementWithCategoryAndMovementType = Movement & {
	category_name: string;
	movement_type_name: string;
	created_at: string;
};

export type MovementsGroupedByCategory = Array<{
	category_id: number | null;
	category_name: string;
	total_amount: number;
	total_expenses: number;
	total_income: number;
	movements_count: number;
	movements: MovementWithCategoryAndMovementType[];
}>;

export enum MovementType {
	INCOME = "INCOME",
	FIXED_EXPENSE = "FIXED_EXPENSE",
	EXPENSE = "EXPENSE",
}

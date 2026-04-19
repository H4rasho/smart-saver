import { isValidDateOnlyString } from "@/app/core/savings-goals/lib/savings_goals_date";
import { z } from "zod";

function normalizeOptionalDate(value: unknown): string | null {
	if (typeof value !== "string") {
		return null;
	}

	const trimmedValue = value.trim();

	if (trimmedValue === "") {
		return null;
	}

	return trimmedValue;
}

export const CreateSavingsGoalSchema = z.object({
	name: z
		.string()
		.trim()
		.min(2, "El nombre de la meta debe tener al menos 2 caracteres")
		.max(80, "El nombre de la meta no puede superar los 80 caracteres"),
	target_amount: z.coerce
		.number()
		.positive("El monto objetivo debe ser mayor a 0"),
	target_date: z
		.preprocess(normalizeOptionalDate, z.string().nullable())
		.refine(
			(value) => value === null || isValidDateOnlyString(value),
			"La fecha objetivo no es válida",
		),
});

export const CreateSavingsGoalContributionSchema = z.object({
	goal_id: z.coerce
		.number()
		.int()
		.positive("La meta seleccionada no es válida"),
	amount: z.coerce.number().positive("El abono debe ser mayor a 0"),
	contribution_date: z
		.string()
		.trim()
		.min(1, "La fecha del abono es obligatoria")
		.refine(isValidDateOnlyString, "La fecha del abono no es válida"),
});

export type CreateSavingsGoalInput = z.infer<typeof CreateSavingsGoalSchema>;

export type CreateSavingsGoalContributionInput = z.infer<
	typeof CreateSavingsGoalContributionSchema
>;

export interface SavingsGoalContribution {
	id: number;
	goal_id: number;
	clerk_id: string;
	amount: number;
	contribution_date: string;
	created_at: string;
	formatted_contribution_date: string;
}

export interface SavingsGoalSummary {
	id: number;
	clerk_id: string;
	name: string;
	target_amount: number;
	target_date: string | null;
	created_at: string;
	current_amount: number;
	remaining_amount: number;
	progress_percentage: number;
	contributions_count: number;
	formatted_target_date: string | null;
	formatted_created_at: string;
	contributions: SavingsGoalContribution[];
}

export interface SavingsGoalsOverview {
	goals: SavingsGoalSummary[];
	total_target_amount: number;
	total_saved_amount: number;
	global_progress_percentage: number;
}

export interface SavingsGoalActionState {
	success?: boolean;
	error?: string;
}

"use server";

import {
	SAVINGS_GOALS_CACHE_TAG,
	SAVINGS_GOALS_REVALIDATE_PATHS,
} from "@/app/core/savings-goals/const/savings-goals-cache";
import {
	createSavingsGoal,
	createSavingsGoalContribution,
	getSavingsGoalsOverview,
} from "@/app/core/savings-goals/repository/savings-goals-repository";
import {
	CreateSavingsGoalContributionSchema,
	CreateSavingsGoalSchema,
	type SavingsGoalActionState,
	type SavingsGoalsOverview,
} from "@/app/core/savings-goals/types/savings-goals-types";
import { getUserId } from "@/app/core/user/actions/user-actions";
import { revalidatePath, revalidateTag } from "next/cache";

function revalidateSavingsGoalViews(): void {
	revalidateTag(SAVINGS_GOALS_CACHE_TAG, "max");

	for (const path of SAVINGS_GOALS_REVALIDATE_PATHS) {
		revalidatePath(path);
	}
}

export async function createSavingsGoalAction(
	_prevState: SavingsGoalActionState | null,
	formData: FormData,
): Promise<SavingsGoalActionState> {
	try {
		const clerkId = await getUserId();

		if (!clerkId) {
			return { error: "Usuario no autenticado" };
		}

		const parsedData = CreateSavingsGoalSchema.safeParse({
			name: formData.get("name"),
			target_amount: formData.get("targetAmount"),
			target_date: formData.get("targetDate"),
		});

		if (!parsedData.success) {
			return {
				error: parsedData.error.issues[0]?.message ?? "Datos inválidos",
			};
		}

		await createSavingsGoal(clerkId, parsedData.data);
		revalidateSavingsGoalViews();

		return { success: true };
	} catch (error) {
		console.error("Error creating savings goal:", error);
		return {
			error:
				error instanceof Error
					? error.message
					: "No se pudo crear la meta de ahorro",
		};
	}
}

export async function createSavingsGoalContributionAction(
	_prevState: SavingsGoalActionState | null,
	formData: FormData,
): Promise<SavingsGoalActionState> {
	try {
		const clerkId = await getUserId();

		if (!clerkId) {
			return { error: "Usuario no autenticado" };
		}

		const parsedData = CreateSavingsGoalContributionSchema.safeParse({
			goal_id: formData.get("goalId"),
			amount: formData.get("amount"),
			contribution_date: formData.get("contributionDate"),
		});

		if (!parsedData.success) {
			return {
				error: parsedData.error.issues[0]?.message ?? "Datos inválidos",
			};
		}

		await createSavingsGoalContribution(clerkId, parsedData.data);
		revalidateSavingsGoalViews();

		return { success: true };
	} catch (error) {
		console.error("Error creating savings goal contribution:", error);
		return {
			error:
				error instanceof Error
					? error.message
					: "No se pudo registrar el abono",
		};
	}
}

export async function getSavingsGoalsOverviewAction(): Promise<SavingsGoalsOverview> {
	const clerkId = await getUserId();

	if (!clerkId) {
		return {
			goals: [],
			total_target_amount: 0,
			total_saved_amount: 0,
			global_progress_percentage: 0,
		};
	}

	return getSavingsGoalsOverview(clerkId);
}

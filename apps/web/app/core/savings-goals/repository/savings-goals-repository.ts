import { formatDateOnlyString } from "@/app/core/savings-goals/lib/savings_goals_date";
import {
	savings_goal_contributions,
	savings_goals,
} from "@/app/core/savings-goals/model/savings-goals-model";
import type {
	CreateSavingsGoalContributionInput,
	CreateSavingsGoalInput,
	SavingsGoalContribution,
	SavingsGoalSummary,
	SavingsGoalsOverview,
} from "@/app/core/savings-goals/types/savings-goals-types";
import { db } from "@/database/database";
import { and, desc, eq, inArray, sql } from "drizzle-orm";

function formatDateTime(value: string): string {
	return new Date(value).toLocaleDateString("es-ES", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	});
}

function clampProgress(value: number): number {
	if (!Number.isFinite(value) || value <= 0) {
		return 0;
	}

	if (value >= 100) {
		return 100;
	}

	return Number(value.toFixed(1));
}

function mapContribution(row: {
	id: number;
	goal_id: number;
	clerk_id: string;
	amount: number;
	contribution_date: string;
	created_at: string;
}): SavingsGoalContribution {
	return {
		...row,
		formatted_contribution_date: formatDateOnlyString(row.contribution_date),
	};
}

function mapGoalSummary(
	row: {
		id: number;
		clerk_id: string;
		name: string;
		target_amount: number;
		target_date: string | null;
		created_at: string;
		current_amount: number;
		contributions_count: number;
	},
	contributions: SavingsGoalContribution[],
): SavingsGoalSummary {
	const currentAmount = Number(row.current_amount ?? 0);
	const targetAmount = Number(row.target_amount ?? 0);
	const remainingAmount = Math.max(targetAmount - currentAmount, 0);
	const progressPercentage = clampProgress(
		(currentAmount / targetAmount) * 100,
	);

	return {
		...row,
		current_amount: currentAmount,
		remaining_amount: remainingAmount,
		progress_percentage: progressPercentage,
		formatted_target_date: row.target_date
			? formatDateOnlyString(row.target_date)
			: null,
		formatted_created_at: formatDateTime(row.created_at),
		contributions,
	};
}

async function getGoalContributionsByGoalIds(
	goalIds: number[],
	clerkId: string,
): Promise<Map<number, SavingsGoalContribution[]>> {
	const contributionsByGoalId = new Map<number, SavingsGoalContribution[]>();

	if (goalIds.length === 0) {
		return contributionsByGoalId;
	}

	const contributionRows = await db
		.select({
			id: savings_goal_contributions.id,
			goal_id: savings_goal_contributions.goal_id,
			clerk_id: savings_goal_contributions.clerk_id,
			amount: savings_goal_contributions.amount,
			contribution_date: savings_goal_contributions.contribution_date,
			created_at: savings_goal_contributions.created_at,
		})
		.from(savings_goal_contributions)
		.where(
			and(
				inArray(savings_goal_contributions.goal_id, goalIds),
				eq(savings_goal_contributions.clerk_id, clerkId),
			),
		)
		.orderBy(
			desc(savings_goal_contributions.contribution_date),
			desc(savings_goal_contributions.created_at),
		);

	for (const contributionRow of contributionRows) {
		const mappedContribution = mapContribution(contributionRow);
		const currentContributions =
			contributionsByGoalId.get(mappedContribution.goal_id) ?? [];

		currentContributions.push(mappedContribution);
		contributionsByGoalId.set(mappedContribution.goal_id, currentContributions);
	}

	return contributionsByGoalId;
}

async function getGoalSummaryRow(goalId: number, clerkId: string) {
	const [goal] = await db
		.select({
			id: savings_goals.id,
			clerk_id: savings_goals.clerk_id,
			name: savings_goals.name,
			target_amount: savings_goals.target_amount,
			target_date: savings_goals.target_date,
			created_at: savings_goals.created_at,
			current_amount:
				sql<number>`coalesce(sum(${savings_goal_contributions.amount}), 0)`.as(
					"current_amount",
				),
			contributions_count:
				sql<number>`count(${savings_goal_contributions.id})`.as(
					"contributions_count",
				),
		})
		.from(savings_goals)
		.leftJoin(
			savings_goal_contributions,
			eq(savings_goal_contributions.goal_id, savings_goals.id),
		)
		.where(
			and(eq(savings_goals.id, goalId), eq(savings_goals.clerk_id, clerkId)),
		)
		.groupBy(savings_goals.id);

	return goal ?? null;
}

export async function createSavingsGoal(
	clerkId: string,
	data: CreateSavingsGoalInput,
): Promise<number> {
	const [insertedGoal] = await db
		.insert(savings_goals)
		.values({
			clerk_id: clerkId,
			name: data.name,
			target_amount: data.target_amount,
			target_date: data.target_date,
			created_at: new Date().toISOString(),
		})
		.returning({ id: savings_goals.id });

	if (!insertedGoal) {
		throw new Error("No se pudo crear la meta de ahorro");
	}

	return insertedGoal.id;
}

export async function getSavingsGoalsOverview(
	clerkId: string,
): Promise<SavingsGoalsOverview> {
	const goalRows = await db
		.select({
			id: savings_goals.id,
			clerk_id: savings_goals.clerk_id,
			name: savings_goals.name,
			target_amount: savings_goals.target_amount,
			target_date: savings_goals.target_date,
			created_at: savings_goals.created_at,
			current_amount:
				sql<number>`coalesce(sum(${savings_goal_contributions.amount}), 0)`.as(
					"current_amount",
				),
			contributions_count:
				sql<number>`count(${savings_goal_contributions.id})`.as(
					"contributions_count",
				),
		})
		.from(savings_goals)
		.leftJoin(
			savings_goal_contributions,
			eq(savings_goal_contributions.goal_id, savings_goals.id),
		)
		.where(eq(savings_goals.clerk_id, clerkId))
		.groupBy(savings_goals.id)
		.orderBy(desc(savings_goals.created_at));

	const goalIds = goalRows.map((goal) => goal.id);
	const contributionsByGoalId = await getGoalContributionsByGoalIds(
		goalIds,
		clerkId,
	);
	const goals = goalRows.map((goal) =>
		mapGoalSummary(goal, contributionsByGoalId.get(goal.id) ?? []),
	);
	const totalTargetAmount = goals.reduce(
		(accumulator, goal) => accumulator + goal.target_amount,
		0,
	);
	const totalSavedAmount = goals.reduce(
		(accumulator, goal) => accumulator + goal.current_amount,
		0,
	);
	const globalProgressPercentage = clampProgress(
		(totalSavedAmount / Math.max(totalTargetAmount, 1)) * 100,
	);

	return {
		goals,
		total_target_amount: totalTargetAmount,
		total_saved_amount: totalSavedAmount,
		global_progress_percentage:
			goals.length === 0 ? 0 : globalProgressPercentage,
	};
}

export async function createSavingsGoalContribution(
	clerkId: string,
	data: CreateSavingsGoalContributionInput,
): Promise<number> {
	const goal = await getGoalSummaryRow(data.goal_id, clerkId);

	if (!goal) {
		throw new Error("No se encontró la meta de ahorro seleccionada");
	}

	const [insertedContribution] = await db
		.insert(savings_goal_contributions)
		.values({
			goal_id: data.goal_id,
			clerk_id: clerkId,
			amount: data.amount,
			contribution_date: data.contribution_date,
			created_at: new Date().toISOString(),
		})
		.returning({ id: savings_goal_contributions.id });

	if (!insertedContribution) {
		throw new Error("No se pudo registrar el abono");
	}

	return insertedContribution.id;
}

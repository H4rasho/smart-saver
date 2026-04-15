import {
	HomeRecentMovementsLoadingSkeleton,
	HomeSummaryCardsLoadingSkeleton,
} from "@/app/(auth)/components/loading_skeletons";
import {
	getBalanceAction,
	getMovmentsAction,
	getTotalsByTypeAction,
} from "@/app/core/movements/actions/movments-actions";
import FinancialMovementsList from "@/app/core/movements/components/mobile-list";
import { MovementsTable } from "@/app/core/movements/components/movements-table";
import { MOVEMENTS_CACHE_TAG } from "@/app/core/movements/const/movement-cache";
import {
	getUserCurrency,
	getUserId,
} from "@/app/core/user/actions/user-actions";
import { formatCurrencyAmount } from "@/app/core/user/lib/user-lib";
import { Scale, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { unstable_cache } from "next/cache";
import { redirect } from "next/navigation";
import { Suspense } from "react";

const getAllMovementsCached = unstable_cache(
	async (userId: string) => getMovmentsAction(userId),
	["movements-list"],
	{
		tags: [MOVEMENTS_CACHE_TAG],
		revalidate: 60,
	},
);

async function HomeSummaryCards() {
	const [{ total_expenses, total_income }, balance, userCurrency] =
		await Promise.all([
			getTotalsByTypeAction(),
			getBalanceAction(),
			getUserCurrency(),
		]);

	const formattedBalance = formatCurrencyAmount(balance, userCurrency, {
		maximumFractionDigits: 0,
	});
	const formattedIncome = formatCurrencyAmount(total_income, userCurrency, {
		maximumFractionDigits: 0,
	});
	const formattedExpenses = formatCurrencyAmount(total_expenses, userCurrency, {
		maximumFractionDigits: 0,
	});

	return (
		<div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
			<div className="rounded-xl border border-secondary-dark/20 bg-gradient-to-br from-secondary-light to-secondary p-6 shadow-sm">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-sm font-medium text-foreground/70">
							Balance Total
						</p>
						<p className="text-2xl font-bold text-foreground">
							{formattedBalance}
						</p>
					</div>
					<div className="rounded-lg bg-secondary-vibrant p-3">
						<Wallet className="h-6 w-6 text-white" />
					</div>
				</div>
			</div>

			<div className="rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-green-100 p-6 shadow-sm dark:border-green-700/40 dark:from-green-900/20 dark:to-green-800/30">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-sm font-medium text-green-700 dark:text-green-300">
							Ingresos
						</p>
						<p className="text-2xl font-bold text-green-800 dark:text-green-200">
							{formattedIncome}
						</p>
					</div>
					<div className="rounded-lg bg-green-500 p-3">
						<TrendingUp className="h-6 w-6 text-white" />
					</div>
				</div>
			</div>

			<div className="rounded-xl border border-red-200 bg-gradient-to-br from-red-50 to-red-100 p-6 shadow-sm dark:border-red-700/40 dark:from-red-900/20 dark:to-red-800/30">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-sm font-medium text-red-700 dark:text-red-300">
							Gastos
						</p>
						<p className="text-2xl font-bold text-red-800 dark:text-red-200">
							{formattedExpenses}
						</p>
					</div>
					<div className="rounded-lg bg-red-500 p-3">
						<TrendingDown className="h-6 w-6 text-white" />
					</div>
				</div>
			</div>

			<div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-6 shadow-sm dark:border-blue-700/40 dark:from-blue-900/20 dark:to-blue-800/30">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-sm font-medium text-blue-700 dark:text-blue-300">
							Ratio Ahorro
						</p>
						<p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
							{total_income > 0
								? ((balance / total_income) * 100).toFixed(1)
								: 0}
							%
						</p>
					</div>
					<div className="rounded-lg bg-blue-500 p-3">
						<Scale className="h-6 w-6 text-white" />
					</div>
				</div>
			</div>
		</div>
	);
}

async function RecentMovementsSection({ userId }: { userId: string }) {
	const [movements, userCurrency] = await Promise.all([
		getAllMovementsCached(userId),
		getUserCurrency(),
	]);

	return (
		<>
			<div className="md:hidden">
				<FinancialMovementsList
					movements={movements}
					userCurrency={userCurrency}
					showActions={false}
					maxItems={5}
				/>
			</div>

			<div className="hidden md:block">
				{movements.length === 0 ? (
					<div className="py-12 text-center">
						<h3 className="mb-2 text-lg font-semibold text-foreground">
							No hay movimientos
						</h3>
						<p className="text-sm text-muted-foreground">
							Agrega tu primer movimiento para comenzar
						</p>
					</div>
				) : (
					<MovementsTable
						movements={movements.slice(0, 5)}
						userCurrency={userCurrency}
					/>
				)}
			</div>
		</>
	);
}

export default async function Home() {
	const userId = await getUserId();

	if (!userId) {
		return redirect("/welcome");
	}

	return (
		<main className="mx-auto flex min-h-screen max-w-6xl flex-col py-10">
			<section>
				<div className="mb-6">
					<h2 className="mb-2 text-2xl font-bold text-foreground">Dashboard</h2>
					<p className="text-muted-foreground">
						Tu resumen financiero personal
					</p>
				</div>

				<Suspense fallback={<HomeSummaryCardsLoadingSkeleton />}>
					<HomeSummaryCards />
				</Suspense>
			</section>

			<section className="mt-6">
				<div className="mb-4">
					<h3 className="mb-2 text-xl font-semibold text-foreground">
						Movimientos Recientes
					</h3>
					<p className="text-sm text-muted-foreground">
						Gestiona tus transacciones
					</p>
				</div>

				<Suspense fallback={<HomeRecentMovementsLoadingSkeleton />}>
					<RecentMovementsSection userId={userId} />
				</Suspense>
			</section>
		</main>
	);
}

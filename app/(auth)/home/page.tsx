import {
	HomeRecentMovementsLoadingSkeleton,
	HomeSummaryCardsLoadingSkeleton,
} from "@/app/(auth)/components/loading_skeletons";
import {
	SUMMARY_STAT_TONES,
	SummaryStatCard,
} from "@/app/(auth)/components/summary_stat_card";
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
	const savingsRatio =
		total_income > 0 ? `${((balance / total_income) * 100).toFixed(1)}%` : "0%";

	const cards = [
		{
			eyebrow: "Panorama",
			label: "Balance total",
			value: formattedBalance,
			detail: "Disponible después de registrar ingresos y gastos.",
			icon: Wallet,
			...SUMMARY_STAT_TONES.violet,
		},
		{
			eyebrow: "Entrada",
			label: "Ingresos",
			value: formattedIncome,
			detail: "Lo que sumó a tu flujo durante el período actual.",
			icon: TrendingUp,
			...SUMMARY_STAT_TONES.emerald,
		},
		{
			eyebrow: "Salida",
			label: "Gastos",
			value: formattedExpenses,
			detail: "Tus egresos consolidados con una lectura más tranquila.",
			icon: TrendingDown,
			...SUMMARY_STAT_TONES.rose,
		},
		{
			eyebrow: "Ritmo",
			label: "Ratio ahorro",
			value: savingsRatio,
			detail: "Qué parte de tus ingresos logra quedarse contigo.",
			icon: Scale,
			...SUMMARY_STAT_TONES.sky,
		},
	] as const;

	return (
		<div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
			{cards.map((card) => (
				<SummaryStatCard key={card.label} {...card} />
			))}
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

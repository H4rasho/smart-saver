import {
	getBalanceAction,
	getMovmentsAction,
	getTotalsByTypeAction,
} from "@/app/core/movements/actions/movments-actions";
import FinancialMovementsList from "@/app/core/movements/components/mobile-list";
import { MovementsTable } from "@/app/core/movements/components/movements-table";
import {
	getCurrentUser,
	getUserCurrency,
} from "@/app/core/user/actions/user-actions";
import { formatCurrencyAmount } from "@/app/core/user/lib/user-lib";
import { Scale, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { unstable_cache } from "next/cache";
import { redirect } from "next/navigation";

export default async function Home() {
	const user = await getCurrentUser();
	if (!user) return redirect("/welcome");
	const userId = user.clerk_id;

	const getAllMovementsCached = unstable_cache(
		async (userId: string) => getMovmentsAction(userId),
		["movements-list"],
		{
			tags: ["movements"],
			revalidate: 60,
		},
	);
	const movements = await getAllMovementsCached(userId);
	const { total_expenses, total_income } = await getTotalsByTypeAction();
	const balance = await getBalanceAction();
	const userCurrency = await getUserCurrency();
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
		<main className="flex flex-col min-h-screen max-w-6xl mx-auto py-10">
			<section className="">
				<div className="mb-6">
					<h2 className="text-2xl font-bold text-foreground mb-2">Dashboard</h2>
					<p className="text-muted-foreground">
						Tu resumen financiero personal
					</p>
				</div>

				{/* Grid de tarjetas de resumen con nuevos colores */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
					<div className="bg-gradient-to-br from-secondary-light to-secondary p-6 rounded-xl border border-secondary-dark/20 shadow-sm">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-foreground/70 text-sm font-medium">
									Balance Total
								</p>
								<p className="text-2xl font-bold text-foreground">
									{formattedBalance}
								</p>
							</div>
							<div className="p-3 bg-secondary-vibrant rounded-lg">
								<Wallet className="h-6 w-6 text-white" />
							</div>
						</div>
					</div>

					<div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/30 p-6 rounded-xl border border-green-200 dark:border-green-700/40 shadow-sm">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-green-700 dark:text-green-300 text-sm font-medium">
									Ingresos
								</p>
								<p className="text-2xl font-bold text-green-800 dark:text-green-200">
									{formattedIncome}
								</p>
							</div>
							<div className="p-3 bg-green-500 rounded-lg">
								<TrendingUp className="h-6 w-6 text-white" />
							</div>
						</div>
					</div>

					<div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/30 p-6 rounded-xl border border-red-200 dark:border-red-700/40 shadow-sm">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-red-700 dark:text-red-300 text-sm font-medium">
									Gastos
								</p>
								<p className="text-2xl font-bold text-red-800 dark:text-red-200">
									{formattedExpenses}
								</p>
							</div>
							<div className="p-3 bg-red-500 rounded-lg">
								<TrendingDown className="h-6 w-6 text-white" />
							</div>
						</div>
					</div>

					<div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/30 p-6 rounded-xl border border-blue-200 dark:border-blue-700/40 shadow-sm">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-blue-700 dark:text-blue-300 text-sm font-medium">
									Ratio Ahorro
								</p>
								<p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
									{total_income > 0
										? ((balance / total_income) * 100).toFixed(1)
										: 0}
									%
								</p>
							</div>
							<div className="p-3 bg-blue-500 rounded-lg">
								<Scale className="h-6 w-6 text-white" />
							</div>
						</div>
					</div>
				</div>
			</section>

			<section className="mt-6">
				<div className="mb-4">
					<h3 className="text-xl font-semibold text-foreground mb-2">
						Movimientos Recientes
					</h3>
					<p className="text-muted-foreground text-sm">
						Gestiona tus transacciones
					</p>
				</div>
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
						<div className="text-center py-12">
							<h3 className="text-lg font-semibold text-foreground mb-2">
								No hay movimientos
							</h3>
							<p className="text-muted-foreground text-sm">
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
			</section>
		</main>
	);
}

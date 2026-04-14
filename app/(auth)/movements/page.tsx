export const dynamic = "force-dynamic";
export const revalidate = 0;

import { getUserCategoriesAction } from "@/app/core/categories/actions/categories-actions";
import { getMovmentsAction } from "@/app/core/movements/actions/movments-actions";
import FinancialMovementsList from "@/app/core/movements/components/mobile-list";
import { MovementsTable } from "@/app/core/movements/components/movements-table";
import {
	getUserCurrency,
	getUserId,
} from "@/app/core/user/actions/user-actions";
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import { ArrowLeftRight, List } from "lucide-react";

const DEFAULT_PAGE_SIZE = 10;

type SearchParamValue = string | string[] | undefined;

interface MovementsPageProps {
	searchParams?: Promise<{
		page?: SearchParamValue;
		pageSize?: SearchParamValue;
	}>;
}

function parsePositiveInteger(
	value: SearchParamValue,
	fallback: number,
): number {
	if (typeof value !== "string") {
		return fallback;
	}

	const parsedValue = Number.parseInt(value, 10);

	if (!Number.isFinite(parsedValue) || parsedValue < 1) {
		return fallback;
	}

	return parsedValue;
}

type PageItem = number | "ellipsis-start" | "ellipsis-end";

function getPageNumbers(currentPage: number, totalPages: number): PageItem[] {
	const pages: PageItem[] = [];

	if (totalPages <= 7) {
		for (let page = 1; page <= totalPages; page++) {
			pages.push(page);
		}

		return pages;
	}

	if (currentPage <= 4) {
		pages.push(1, 2, 3, 4, 5, "ellipsis-end", totalPages);
		return pages;
	}

	if (currentPage >= totalPages - 3) {
		pages.push(
			1,
			"ellipsis-start",
			totalPages - 4,
			totalPages - 3,
			totalPages - 2,
			totalPages - 1,
			totalPages,
		);
		return pages;
	}

	pages.push(
		1,
		"ellipsis-start",
		currentPage - 1,
		currentPage,
		currentPage + 1,
		"ellipsis-end",
		totalPages,
	);

	return pages;
}

export default async function Movements({ searchParams }: MovementsPageProps) {
	const resolvedSearchParams = await searchParams;
	const userId = await getUserId();
	if (!userId) return;
	const [movements, userCurrency, categories] = await Promise.all([
		getMovmentsAction(userId),
		getUserCurrency(),
		getUserCategoriesAction(userId),
	]);

	const pageSize = parsePositiveInteger(
		resolvedSearchParams?.pageSize,
		DEFAULT_PAGE_SIZE,
	);
	const requestedPage = parsePositiveInteger(resolvedSearchParams?.page, 1);
	const totalPages = Math.max(1, Math.ceil(movements.length / pageSize));
	const currentPage = Math.min(requestedPage, totalPages);
	const startIndex = (currentPage - 1) * pageSize;
	const endIndex = startIndex + pageSize;
	const paginatedMovements = movements.slice(startIndex, endIndex);
	const visibleStart = movements.length === 0 ? 0 : startIndex + 1;
	const visibleEnd = Math.min(endIndex, movements.length);

	function pageHref(targetPage: number): string {
		const params = new URLSearchParams();
		params.set("page", targetPage.toString());
		params.set("pageSize", pageSize.toString());
		return `?${params.toString()}`;
	}

	return (
		<main className="flex flex-col min-h-screen max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
			{/* Header mejorado */}
			<div className="mb-8">
				<div className="flex items-center gap-3 mb-3">
					<div className="p-2 bg-primary/10 rounded-lg">
						<ArrowLeftRight className="w-6 h-6 text-primary" />
					</div>
					<div>
						<h1 className="text-2xl font-bold text-foreground">Movimientos</h1>
						<p className="text-muted-foreground text-sm">
							Historial completo de transacciones
						</p>
					</div>
				</div>
			</div>

			{/* Estadísticas rápidas */}
			<div className="mb-6">
				<div className="bg-secondary p-4 rounded-xl border border-secondary-dark/20 shadow-sm">
					<div className="flex justify-between items-start">
						<div className="flex-1 min-w-0 pr-3">
							<div className="flex items-center gap-2 mb-2">
								<List className="w-4 h-4 text-secondary-foreground/70 flex-shrink-0" />
								<h3 className="font-semibold text-secondary-foreground text-sm truncate">
									Total de movimientos
								</h3>
							</div>
						</div>
						<div className="flex items-center gap-2 flex-shrink-0">
							<div className="text-sm font-bold text-secondary-foreground">
								{movements.length.toLocaleString()}
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Lista de movimientos */}
			<div className="md:hidden">
				<FinancialMovementsList
					movements={paginatedMovements}
					userCurrency={userCurrency}
					showActions={true}
					categories={categories}
				/>
			</div>
			<div className="hidden md:block">
				{movements.length === 0 ? (
					<div className="text-center py-16">
						<h3 className="text-lg font-semibold text-foreground mb-2">
							No hay movimientos
						</h3>
						<p className="text-muted-foreground text-sm">
							Agrega tu primer movimiento para comenzar
						</p>
					</div>
				) : (
					<MovementsTable
						movements={paginatedMovements}
						userCurrency={userCurrency}
					/>
				)}
			</div>

			{movements.length > 0 && (
				<div className="mt-6 flex flex-col gap-4 rounded-2xl border border-border bg-card/50 p-4 shadow-sm md:flex-row md:items-center md:justify-between">
					<div className="text-sm text-muted-foreground">
						Mostrando{" "}
						<span className="font-medium text-foreground">{visibleStart}</span>{" "}
						- <span className="font-medium text-foreground">{visibleEnd}</span>{" "}
						de{" "}
						<span className="font-medium text-foreground">
							{movements.length.toLocaleString()}
						</span>{" "}
						movimientos
					</div>

					{totalPages > 1 && (
						<Pagination className="md:justify-end">
							<PaginationContent>
								<PaginationItem>
									<PaginationPrevious
										aria-disabled={currentPage === 1}
										href={pageHref(Math.max(1, currentPage - 1))}
										tabIndex={currentPage === 1 ? -1 : 0}
									/>
								</PaginationItem>

								{getPageNumbers(currentPage, totalPages).map((page) =>
									typeof page === "string" ? (
										<PaginationItem key={page}>
											<PaginationEllipsis />
										</PaginationItem>
									) : (
										<PaginationItem key={page}>
											<PaginationLink
												href={pageHref(page)}
												isActive={currentPage === page}
											>
												{page}
											</PaginationLink>
										</PaginationItem>
									),
								)}

								<PaginationItem>
									<PaginationNext
										aria-disabled={currentPage === totalPages}
										href={pageHref(Math.min(totalPages, currentPage + 1))}
										tabIndex={currentPage === totalPages ? -1 : 0}
									/>
								</PaginationItem>
							</PaginationContent>
						</Pagination>
					)}
				</div>
			)}
		</main>
	);
}

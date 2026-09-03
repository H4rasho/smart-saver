import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import { type Payment, columns } from "./columns";
import { DataTable } from "./data-table";

interface HomeServerPaginationProps {
	data: Payment[];
	page: number;
	pageSize: number;
	totalCount: number;
	className?: string;
}

export function HomeServerPagination({
	data,
	page,
	pageSize,
	totalCount,
	className,
}: HomeServerPaginationProps) {
	const totalPages = Math.ceil(totalCount / pageSize);

	function getPageNumbers() {
		const pages = [];
		if (totalPages <= 7) {
			for (let i = 1; i <= totalPages; i++) pages.push(i);
		} else {
			if (page <= 4) {
				pages.push(1, 2, 3, 4, 5, "ellipsis", totalPages);
			} else if (page >= totalPages - 3) {
				pages.push(
					1,
					"ellipsis",
					totalPages - 4,
					totalPages - 3,
					totalPages - 2,
					totalPages - 1,
					totalPages,
				);
			} else {
				pages.push(
					1,
					"ellipsis",
					page - 1,
					page,
					page + 1,
					"ellipsis",
					totalPages,
				);
			}
		}
		return pages;
	}

	function pageHref(targetPage: number) {
		return `?page=${targetPage}&pageSize=${pageSize}`;
	}

	return (
		<div className={cn("flex flex-col gap-4", className)}>
			<DataTable columns={columns} data={data} />
			<Pagination>
				<PaginationContent>
					<PaginationItem>
						<PaginationPrevious
							aria-disabled={page === 1}
							href={pageHref(Math.max(1, page - 1))}
							tabIndex={page === 1 ? -1 : 0}
						/>
					</PaginationItem>
					{getPageNumbers().map((p) =>
						p === "ellipsis" ? (
							<PaginationItem key={`ellipsis-${p}`}>
								<PaginationEllipsis />
							</PaginationItem>
						) : (
							<PaginationItem key={p}>
								<PaginationLink
									isActive={page === p}
									href={pageHref(Number(p))}
								>
									{p}
								</PaginationLink>
							</PaginationItem>
						),
					)}
					<PaginationItem>
						<PaginationNext
							aria-disabled={page === totalPages}
							href={pageHref(Math.min(totalPages, page + 1))}
							tabIndex={page === totalPages ? -1 : 0}
						/>
					</PaginationItem>
				</PaginationContent>
			</Pagination>
		</div>
	);
}

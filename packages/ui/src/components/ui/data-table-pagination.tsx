import {
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight,
} from "lucide-react";
import { Button } from "./button.js";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./select.js";

export interface PaginationInfo {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
}

interface DataTablePaginationProps {
	pagination: PaginationInfo;
	onPageChange: (page: number) => void;
	onLimitChange?: (limit: number) => void;
	pageSizeOptions?: number[];
	showPageSizeSelector?: boolean;
}

export function DataTablePagination({
	pagination,
	onPageChange,
	onLimitChange,
	pageSizeOptions = [10, 20, 30, 50],
	showPageSizeSelector = true,
}: DataTablePaginationProps) {
	const { page, limit, total, totalPages, hasNextPage, hasPreviousPage } =
		pagination;

	return (
		<div className="flex items-center justify-between px-2 py-4">
			<div className="flex-1 text-sm text-muted-foreground">
				{total > 0 ? (
					<>
						Mostrando {(page - 1) * limit + 1} a {Math.min(page * limit, total)}{" "}
						de {total} resultados
					</>
				) : (
					"Sin resultados"
				)}
			</div>
			<div className="flex items-center gap-6 lg:gap-8">
				{showPageSizeSelector && onLimitChange && (
					<div className="flex items-center space-x-2">
						<p className="text-sm font-medium">Filas por página</p>
						<Select
							value={`${limit}`}
							onValueChange={(value) => onLimitChange(Number(value))}
						>
							<SelectTrigger className="h-8 w-[70px]">
								<SelectValue placeholder={limit} />
							</SelectTrigger>
							<SelectContent side="top">
								{pageSizeOptions.map((pageSize) => (
									<SelectItem key={pageSize} value={`${pageSize}`}>
										{pageSize}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				)}
				<div className="flex w-[100px] items-center justify-center text-sm font-medium">
					Página {page} de {totalPages || 1}
				</div>
				<div className="flex items-center space-x-2">
					<Button
						variant="outline"
						className="hidden h-8 w-8 p-0 lg:flex"
						onClick={() => onPageChange(1)}
						disabled={!hasPreviousPage}
					>
						<span className="sr-only">Ir a primera página</span>
						<ChevronsLeft className="h-4 w-4" />
					</Button>
					<Button
						variant="outline"
						className="h-8 w-8 p-0"
						onClick={() => onPageChange(page - 1)}
						disabled={!hasPreviousPage}
					>
						<span className="sr-only">Ir a página anterior</span>
						<ChevronLeft className="h-4 w-4" />
					</Button>
					<Button
						variant="outline"
						className="h-8 w-8 p-0"
						onClick={() => onPageChange(page + 1)}
						disabled={!hasNextPage}
					>
						<span className="sr-only">Ir a página siguiente</span>
						<ChevronRight className="h-4 w-4" />
					</Button>
					<Button
						variant="outline"
						className="hidden h-8 w-8 p-0 lg:flex"
						onClick={() => onPageChange(totalPages)}
						disabled={!hasNextPage}
					>
						<span className="sr-only">Ir a última página</span>
						<ChevronsRight className="h-4 w-4" />
					</Button>
				</div>
			</div>
		</div>
	);
}

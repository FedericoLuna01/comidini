import {
	closestCenter,
	DndContext,
	type DragEndEvent,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type {
	SelectProduct,
	SelectProductCategory,
} from "@repo/db/src/types/product";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@repo/ui/components/ui/accordion";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { toast } from "@repo/ui/components/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { GripVerticalIcon, ImageIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { reorderProducts } from "../../../../../api/categories";

interface ProductWithCategory extends SelectProduct {
	categoryName?: string;
}

interface ProductsSortableProps {
	products: ProductWithCategory[] | undefined;
	categories: SelectProductCategory[] | undefined;
	isLoading: boolean;
	shopId: number | undefined;
}

interface SortableProductItemProps {
	product: ProductWithCategory;
}

function SortableProductItem({ product }: SortableProductItemProps) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: product.id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={`${isDragging ? "opacity-50 z-50" : ""}`}
		>
			<Card className="mb-2">
				<CardContent className="flex items-center gap-3 p-3">
					<button
						type="button"
						className="cursor-grab touch-none focus:outline-none"
						{...attributes}
						{...listeners}
					>
						<GripVerticalIcon className="h-4 w-4 text-muted-foreground" />
					</button>
					<div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center overflow-hidden shrink-0">
						{product.images && product.images.length > 0 ? (
							<img
								src={product.images[0]}
								alt={product.name}
								className="h-full w-full object-cover"
							/>
						) : (
							<ImageIcon className="h-5 w-5 text-muted-foreground" />
						)}
					</div>
					<div className="flex-1 min-w-0">
						<p className="font-medium truncate">{product.name}</p>
						<p className="text-sm text-muted-foreground">${product.price}</p>
					</div>
					{!product.isActive && (
						<span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
							Inactivo
						</span>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

interface CategoryProductsProps {
	products: ProductWithCategory[];
	shopId: number | undefined;
}

function CategoryProducts({
	products: initialProducts,
	shopId,
}: CategoryProductsProps) {
	const [items, setItems] = useState<ProductWithCategory[]>([]);
	const queryClient = useQueryClient();

	useEffect(() => {
		// Sort by sortOrder
		const sorted = [...initialProducts].sort(
			(a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
		);
		setItems(sorted);
	}, [initialProducts]);

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	const reorderMutation = useMutation({
		mutationFn: async (productOrders: { id: number; sortOrder: number }[]) => {
			if (!shopId) throw new Error("Shop ID is required");
			return reorderProducts(shopId, productOrders);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["products", shopId] });
			toast.success("Productos reordenados exitosamente");
		},
		onError: () => {
			// Revert on error
			const sorted = [...initialProducts].sort(
				(a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
			);
			setItems(sorted);
			toast.error("Error al reordenar los productos");
		},
	});

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;

		if (over && active.id !== over.id) {
			setItems((prevItems) => {
				const oldIndex = prevItems.findIndex((item) => item.id === active.id);
				const newIndex = prevItems.findIndex((item) => item.id === over.id);

				const newItems = arrayMove(prevItems, oldIndex, newIndex);

				// Create the order updates
				const productOrders = newItems.map((item, index) => ({
					id: item.id,
					sortOrder: index,
				}));

				reorderMutation.mutate(productOrders);

				return newItems;
			});
		}
	};

	if (items.length === 0) {
		return (
			<p className="text-sm text-muted-foreground py-4 text-center">
				No hay productos en esta categoría
			</p>
		);
	}

	return (
		<DndContext
			sensors={sensors}
			collisionDetection={closestCenter}
			onDragEnd={handleDragEnd}
		>
			<SortableContext items={items} strategy={verticalListSortingStrategy}>
				<div className="space-y-2 pt-2">
					{items.map((product) => (
						<SortableProductItem key={product.id} product={product} />
					))}
				</div>
			</SortableContext>
		</DndContext>
	);
}

export function ProductsSortable({
	products,
	categories,
	isLoading,
	shopId,
}: ProductsSortableProps) {
	if (isLoading) {
		return (
			<div className="space-y-4">
				{[1, 2, 3].map((i) => (
					<Skeleton key={i} className="h-20 w-full" />
				))}
			</div>
		);
	}

	if (!categories || categories.length === 0) {
		return (
			<Card>
				<CardContent className="flex items-center justify-center p-8 text-muted-foreground">
					No hay categorías. Crea categorías primero para organizar productos.
				</CardContent>
			</Card>
		);
	}

	// Group products by category
	const productsByCategory = new Map<number | null, ProductWithCategory[]>();

	// Initialize with empty arrays for all categories
	for (const category of categories) {
		productsByCategory.set(category.id, []);
	}
	// Also track uncategorized products
	productsByCategory.set(null, []);

	// Group products
	if (products) {
		for (const product of products) {
			const categoryId = product.categoryId;
			const existing = productsByCategory.get(categoryId) || [];
			productsByCategory.set(categoryId, [...existing, product]);
		}
	}

	// Sort categories by sortOrder
	const sortedCategories = [...categories].sort(
		(a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
	);

	const uncategorizedProducts = productsByCategory.get(null) || [];

	return (
		<div className="space-y-4">
			<Accordion type="multiple" className="w-full">
				{sortedCategories.map((category) => {
					const categoryProducts = productsByCategory.get(category.id) || [];
					return (
						<AccordionItem key={category.id} value={String(category.id)}>
							<AccordionTrigger className="hover:no-underline">
								<div className="flex items-center gap-2">
									<span className="font-medium">{category.name}</span>
									<span className="text-sm text-muted-foreground">
										({categoryProducts.length} productos)
									</span>
								</div>
							</AccordionTrigger>
							<AccordionContent>
								<CategoryProducts products={categoryProducts} shopId={shopId} />
							</AccordionContent>
						</AccordionItem>
					);
				})}

				{uncategorizedProducts.length > 0 && (
					<AccordionItem value="uncategorized">
						<AccordionTrigger className="hover:no-underline">
							<div className="flex items-center gap-2">
								<span className="font-medium text-muted-foreground">
									Sin categoría
								</span>
								<span className="text-sm text-muted-foreground">
									({uncategorizedProducts.length} productos)
								</span>
							</div>
						</AccordionTrigger>
						<AccordionContent>
							<div className="space-y-2 pt-2">
								{uncategorizedProducts.map((product) => (
									<Card key={product.id} className="mb-2">
										<CardContent className="flex items-center gap-3 p-3">
											<div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center overflow-hidden shrink-0">
												{product.images && product.images.length > 0 ? (
													<img
														src={product.images[0]}
														alt={product.name}
														className="h-full w-full object-cover"
													/>
												) : (
													<ImageIcon className="h-5 w-5 text-muted-foreground" />
												)}
											</div>
											<div className="flex-1 min-w-0">
												<p className="font-medium truncate">{product.name}</p>
												<p className="text-sm text-muted-foreground">
													${product.price}
												</p>
											</div>
										</CardContent>
									</Card>
								))}
							</div>
						</AccordionContent>
					</AccordionItem>
				)}
			</Accordion>
		</div>
	);
}

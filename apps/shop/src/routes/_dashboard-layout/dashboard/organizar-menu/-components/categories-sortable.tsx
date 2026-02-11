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
import type { SelectProductCategory } from "@repo/db/src/types/product";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { toast } from "@repo/ui/components/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { GripVerticalIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { reorderCategories } from "../../../../../api/categories";

interface CategoriesSortableProps {
	categories: SelectProductCategory[] | undefined;
	isLoading: boolean;
	shopId: number | undefined;
}

interface SortableCategoryItemProps {
	category: SelectProductCategory;
}

function SortableCategoryItem({ category }: SortableCategoryItemProps) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: category.id });

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
				<CardContent className="flex items-center gap-3 p-4">
					<button
						type="button"
						className="cursor-grab touch-none focus:outline-none"
						{...attributes}
						{...listeners}
					>
						<GripVerticalIcon className="h-5 w-5 text-muted-foreground" />
					</button>
					<span className="font-medium">{category.name}</span>
					{!category.isActive && (
						<span className="ml-auto text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
							Inactiva
						</span>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

export function CategoriesSortable({
	categories,
	isLoading,
	shopId,
}: CategoriesSortableProps) {
	const [items, setItems] = useState<SelectProductCategory[]>([]);
	const queryClient = useQueryClient();

	// Sync local state with fetched data
	useEffect(() => {
		if (categories) {
			// Sort by sortOrder
			const sorted = [...categories].sort(
				(a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
			);
			setItems(sorted);
		}
	}, [categories]);

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	const reorderMutation = useMutation({
		mutationFn: async (categoryOrders: { id: number; sortOrder: number }[]) => {
			if (!shopId) throw new Error("Shop ID is required");
			return reorderCategories(shopId, categoryOrders);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["productCategories", shopId],
			});
			toast.success("Categorías reordenadas exitosamente");
		},
		onError: () => {
			// Revert to original order on error
			if (categories) {
				const sorted = [...categories].sort(
					(a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
				);
				setItems(sorted);
			}
			toast.error("Error al reordenar las categorías");
		},
	});

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;

		if (over && active.id !== over.id) {
			setItems((prevItems) => {
				const oldIndex = prevItems.findIndex((item) => item.id === active.id);
				const newIndex = prevItems.findIndex((item) => item.id === over.id);

				const newItems = arrayMove(prevItems, oldIndex, newIndex);

				// Create the order updates with new sortOrder values
				const categoryOrders = newItems.map((item, index) => ({
					id: item.id,
					sortOrder: index,
				}));

				// Trigger the API update
				reorderMutation.mutate(categoryOrders);

				return newItems;
			});
		}
	};

	if (isLoading) {
		return (
			<div className="space-y-2">
				{[1, 2, 3, 4].map((i) => (
					<Skeleton key={i} className="h-16 w-full" />
				))}
			</div>
		);
	}

	if (!items || items.length === 0) {
		return (
			<Card>
				<CardContent className="flex items-center justify-center p-8 text-muted-foreground">
					No hay categorías para organizar. Crea una categoría primero.
				</CardContent>
			</Card>
		);
	}

	return (
		<DndContext
			sensors={sensors}
			collisionDetection={closestCenter}
			onDragEnd={handleDragEnd}
		>
			<SortableContext items={items} strategy={verticalListSortingStrategy}>
				<div className="space-y-2">
					{items.map((category) => (
						<SortableCategoryItem key={category.id} category={category} />
					))}
				</div>
			</SortableContext>
		</DndContext>
	);
}

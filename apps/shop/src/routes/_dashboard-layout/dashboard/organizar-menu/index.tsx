import type {
	SelectProduct,
	SelectProductCategory,
} from "@repo/db/src/types/product";
import {
	Heading,
	HeadingDescription,
	HeadingSeparator,
	HeadingTitle,
} from "@repo/ui/components/ui/heading";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@repo/ui/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { getProductCategoriesByShopId } from "../../../../api/categories";
import { allProductsQueryOptions } from "../../../../api/products";
import { CategoriesSortable } from "./-components/categories-sortable";
import { ProductsSortable } from "./-components/products-sortable";

export const Route = createFileRoute(
	"/_dashboard-layout/dashboard/organizar-menu/",
)({
	component: RouteComponent,
});

function RouteComponent() {
	const { shop } = Route.useRouteContext();

	const { data: categories, isPending: categoriesPending } = useQuery<
		SelectProductCategory[]
	>({
		queryKey: ["productCategories", shop?.id],
		queryFn: () => getProductCategoriesByShopId(shop?.id),
		enabled: !!shop?.id,
	});

	const { data: productsData, isPending: productsPending } = useQuery(
		allProductsQueryOptions(shop?.id),
	);

	// Extract products from the joined data
	const products = productsData?.map(
		(item: {
			product: SelectProduct;
			product_category: SelectProductCategory | null;
		}) => ({
			...item.product,
			categoryName: item.product_category?.name,
		}),
	);

	return (
		<div>
			<Heading>
				<HeadingTitle>Organizar Menú</HeadingTitle>
				<HeadingDescription>
					Arrastra y suelta para reordenar las categorías y productos de tu
					menú.
				</HeadingDescription>
				<HeadingSeparator />
			</Heading>

			<Tabs defaultValue="categories" className="w-full">
				<TabsList className="grid w-full grid-cols-2 max-w-md">
					<TabsTrigger value="categories">Categorías</TabsTrigger>
					<TabsTrigger value="products">Productos</TabsTrigger>
				</TabsList>

				<TabsContent value="categories" className="mt-6">
					<CategoriesSortable
						categories={categories}
						isLoading={categoriesPending}
						shopId={shop?.id}
					/>
				</TabsContent>

				<TabsContent value="products" className="mt-6">
					<ProductsSortable
						products={products}
						categories={categories}
						isLoading={productsPending || categoriesPending}
						shopId={shop?.id}
					/>
				</TabsContent>
			</Tabs>
		</div>
	);
}

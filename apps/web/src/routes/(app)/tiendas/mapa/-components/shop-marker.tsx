import type { SelectShop } from "@repo/db/src/types/shop";
import { cn } from "@repo/ui/lib/utils";
import { AdvancedMarker } from "@vis.gl/react-google-maps";
import type Supercluster from "supercluster";
import { getCategoryColors, getCategoryIcon } from "../..";

export const ShopMarker = ({ shop }: { shop: Cluster }) => {
	const CategoryIcon = getCategoryIcon(shop.properties.category || "");
	const colors = getCategoryColors(shop.properties.category || "");
	return (
		<AdvancedMarker
			key={shop.id}
			position={{
				lat: Number(shop.properties.data?.latitude!),
				lng: Number(shop.properties.data?.longitude!),
			}}
		>
			<div className="bg-white p-1 h-10 flex items-center justify-center rounded-full relative border shadow-md">
				<CategoryIcon
					className={cn("w-8 h-8 p-1 rounded-full", colors.bg, colors.text)}
				/>
				<div className="h-0 w-fit border-l-10 border-r-10 border-t-10 border-transparent border-t-white absolute -bottom-[8px] drop-shadow-md" />
			</div>
		</AdvancedMarker>
	);
};

export type Cluster = Supercluster.PointFeature<{
	cluster: boolean;
	clusterId?: number;
	category?: string;
	data?: SelectShop;
	// Cluster properties from supercluster
	point_count?: number;
	abbreviated?: boolean;
}>;

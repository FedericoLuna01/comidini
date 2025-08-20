import { cn } from "@repo/ui/lib/utils";
import { AdvancedMarker } from "@vis.gl/react-google-maps";
import { getCategoryColors, getCategoryIcon } from "../..";
import type { Cluster } from "..";

export const ShopMarker = ({ shop }: { shop: Cluster }) => {
	const CategoryIcon = getCategoryIcon(shop.properties.data?.category || "");
	const colors = getCategoryColors(shop.properties.data?.category || "");
	return (
		<AdvancedMarker
			key={shop.id}
			position={{
				lat: shop.properties.data?.lat!,
				lng: shop.properties.data?.lng!,
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

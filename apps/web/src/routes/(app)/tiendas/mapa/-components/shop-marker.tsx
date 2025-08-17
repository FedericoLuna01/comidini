import { AdvancedMarker } from "@vis.gl/react-google-maps";
import { CookieIcon } from "lucide-react";
import type { exampleShops } from "../..";

export const ShopMarker = ({
	shop,
}: {
	shop: (typeof exampleShops)[number];
}) => {
	return (
		<AdvancedMarker key={shop.id} position={{ lat: shop.lat, lng: shop.lng }}>
			<div className="bg-white p-1 h-10 flex items-center justify-center rounded-full relative border shadow-md">
				<CookieIcon className="w-8 h-8 p-1 text-orange-900 bg-orange-200 rounded-full" />
				<div className="h-0 w-fit border-l-10 border-r-10 border-t-10 border-transparent border-t-white absolute -bottom-[8px] drop-shadow-md" />
			</div>
		</AdvancedMarker>
	);
};

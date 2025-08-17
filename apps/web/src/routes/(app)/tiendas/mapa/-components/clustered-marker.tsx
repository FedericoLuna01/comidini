import type { exampleShops } from "../..";
import { ShopMarker } from "./shop-marker";

export const ClusteredMarkers = ({ shops }: { shops: typeof exampleShops }) => {
	return (
		<div>
			{shops.map((shop) => (
				<ShopMarker key={shop.id} shop={shop} />
			))}
		</div>
	);
};

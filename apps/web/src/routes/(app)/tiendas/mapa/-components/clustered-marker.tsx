import { cn } from "@repo/ui/lib/utils";
import { AdvancedMarker } from "@vis.gl/react-google-maps";
import type Supercluster from "supercluster";
import { getCategoryColors, getCategoryIcon } from "../../index";
import type { Cluster } from "..";
import { ShopMarker } from "./shop-marker";

export const ClusteredMarkers = ({
	clusters,
	superCluster,
}: {
	clusters: Cluster[];
	superCluster: Supercluster<Cluster> | null;
}) => {
	return (
		<div>
			{clusters.map((cluster) => {
				if (cluster.properties.cluster) {
					const leaves = superCluster?.getLeaves(Number(cluster.id));
					console.log(leaves);
					return (
						<AdvancedMarker
							key={cluster.id}
							position={{
								lat: cluster.geometry.coordinates[1],
								lng: cluster.geometry.coordinates[0],
							}}
						>
							<div className="bg-white p-1 h-10 flex items-center justify-center rounded-full relative border shadow-md">
								{leaves?.map((leaf, index) => {
									// TODO: Arreglar este tipado
									const CategoryIcon = getCategoryIcon(
										// @ts-ignore
										leaf.properties.category || "",
									);
									const colors = getCategoryColors(
										// @ts-ignore
										leaf.properties.category || "",
									);

									return (
										<div key={`leaf-${index}`}>
											<CategoryIcon
												className={cn(
													"w-8 h-8 p-1 rounded-full",
													colors.bg,
													colors.text,
													{
														"-ml-4": leaf !== leaves[0],
													},
												)}
											/>
										</div>
									);
								})}
								<div className="h-0 w-fit border-l-10 border-r-10 border-t-10 border-transparent border-t-white absolute -bottom-[8px] drop-shadow-md" />
							</div>
						</AdvancedMarker>
					);
				} else {
					return (
						<ShopMarker key={cluster.properties.data?.id} shop={cluster} />
					);
				}
			})}
		</div>
	);
};

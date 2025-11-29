import type { SelectShop } from "@repo/db/src/types/shop";
import { Map as GoogleMap, useMap } from "@vis.gl/react-google-maps";
import useSupercluster from "use-supercluster";
import { useMapViewport } from "../../../../../hooks/use-map-viewport";
import { ClusteredMarkers } from "../-components/clustered-marker";

export function MapComponent({ shops }: { shops: SelectShop[] | undefined }) {
	const map = useMap();
	const { bbox, zoom, setZoom } = useMapViewport();
	const defaultCenter = { lat: -32.9526405, lng: -60.6776039 }; // Centro de Rosario

	const points = (shops || []).map((shop) => ({
		type: "Feature" as const,
		properties: {
			cluster: false,
			clusterId: shop.id,
			category: "test",
			data: {
				...shop,
			},
		},
		geometry: {
			type: "Point" as const,
			coordinates: [Number(shop.longitude), Number(shop.latitude)],
		},
	}));

	const { clusters, supercluster } = useSupercluster({
		points,
		// @ts-ignore
		bounds: bbox,
		zoom,
		options: { radius: 75 },
	});

	const handleClusterClick = (clusterId: number) => {
		const clusterZoom = supercluster?.getClusterExpansionZoom(clusterId);
		const cluster = clusters.find((c) => c.id === clusterId);
		if (!cluster || !clusterZoom) return;

		const newCenter = {
			lat: cluster.geometry.coordinates[1],
			lng: cluster.geometry.coordinates[0],
		};

		// Usar la instancia del mapa para hacer transiciones suaves
		if (map) {
			// Primero mover la cámara con animación
			map.panTo(newCenter);

			// Luego cambiar el zoom con animación después de un pequeño delay
			map.setZoom(clusterZoom);
		}

		// Actualizar el estado local
		if (clusterZoom) setZoom(clusterZoom);
	};

	return (
		<GoogleMap
			className="w-full h-full"
			mapId="314bbedb82bc2f8947b9d13c"
			defaultCenter={defaultCenter}
			defaultZoom={13}
			minZoom={13}
			gestureHandling={"greedy"}
			clickableIcons={false}
			disableDefaultUI={true}
		>
			<ClusteredMarkers
				clusters={clusters}
				// TODO: Arreglar este tipado
				// @ts-ignore
				superCluster={supercluster}
				handleClusterClick={handleClusterClick}
			/>
		</GoogleMap>
	);
}

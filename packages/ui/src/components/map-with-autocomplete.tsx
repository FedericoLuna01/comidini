import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandItem,
	CommandList,
} from "@repo/ui/components/ui/command";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import {
	Popover,
	PopoverAnchor,
	PopoverContent,
} from "@repo/ui/components/ui/popover";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { cn } from "@repo/ui/lib/utils";
import { Command as CommandPrimitive } from "cmdk";
import { MapPin } from "lucide-react";
import { type ChangeEvent, useCallback, useEffect, useState } from "react";

export interface MapLocation {
	lat: number;
	lng: number;
	address: string;
}

interface MapWithAutocompleteProps {
	/** Valor inicial de la dirección */
	initialAddress?: string;
	/** Latitud inicial */
	initialLat?: number;
	/** Longitud inicial */
	initialLng?: number;
	/** Callback cuando cambia la ubicación */
	onLocationChange: (location: MapLocation) => void;
	/** API Key de Google Maps */
	googleMapsApiKey: string;
	/** Map ID de Google Maps */
	googleMapsMapId?: string;
	/** Placeholder del input */
	placeholder?: string;
	/** Label para el campo de dirección */
	addressLabel?: string;
	/** Si el componente está deshabilitado */
	disabled?: boolean;
	/** Altura del mapa */
	mapHeight?: string;
	/** Centro por defecto del mapa */
	defaultCenter?: { lat: number; lng: number };
	/** Zoom por defecto */
	defaultZoom?: number;
	/** Restricción de ubicación para el autocomplete */
	locationRestriction?: {
		south: number;
		west: number;
		north: number;
		east: number;
	};
	/** Idioma para las sugerencias */
	language?: string;
	/** Región para las sugerencias */
	region?: string;
	/** Clase CSS adicional */
	className?: string;
}

// Hook para debounce
const useDebounce = <T,>(value: T, delay: number): T => {
	const [debouncedValue, setDebouncedValue] = useState(value);

	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedValue(value);
		}, delay);

		return () => {
			clearTimeout(handler);
		};
	}, [value, delay]);

	return debouncedValue;
};

// Tipos internos para evitar dependencia directa de @types/google.maps
interface PlaceSuggestion {
	placePrediction?: {
		text: { text: string };
		toPlace: () => {
			fetchFields: (options: { fields: string[] }) => Promise<void>;
			location?: { lat: () => number; lng: () => number };
		};
	};
}

// Componente interno para el mapa (requiere @vis.gl/react-google-maps)
interface GoogleMapInternalProps {
	apiKey: string;
	mapId?: string;
	center: { lat: number; lng: number };
	markerPosition: { lat: number; lng: number } | null;
	onCenterChange: (center: { lat: number; lng: number }) => void;
	onMapClick?: (lat: number, lng: number) => void;
	mapHeight: string;
	defaultZoom: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GoogleMapsModule = any;

// Este componente se renderiza cuando Google Maps está disponible
const GoogleMapInternal = ({
	apiKey,
	mapId,
	center,
	markerPosition,
	onCenterChange,
	onMapClick,
	mapHeight,
	defaultZoom,
}: GoogleMapInternalProps) => {
	const [MapComponents, setMapComponents] = useState<GoogleMapsModule | null>(
		null,
	);

	useEffect(() => {
		// Importar dinámicamente para evitar errores en SSR
		import("@vis.gl/react-google-maps")
			.then((module) => {
				setMapComponents({
					APIProvider: module.APIProvider,
					Map: module.Map,
					AdvancedMarker: module.AdvancedMarker,
				});
			})
			.catch((error) => {
				console.error("Error loading Google Maps:", error);
			});
	}, []);

	if (!MapComponents) {
		return (
			<div
				className={cn("w-full rounded-lg bg-muted animate-pulse")}
				style={{ height: mapHeight }}
			/>
		);
	}

	const { APIProvider, Map: GoogleMaps, AdvancedMarker } = MapComponents;

	return (
		<APIProvider apiKey={apiKey} libraries={["places", "marker"]} language="es">
			<div style={{ height: mapHeight, width: "100%" }}>
				<GoogleMaps
					className="w-full h-full rounded-lg"
					mapId={mapId}
					center={center}
					onCameraChanged={(e: {
						detail: { center: { lat: number; lng: number } };
					}) => onCenterChange(e.detail.center)}
					defaultZoom={defaultZoom}
					minZoom={10}
					gestureHandling="cooperative"
					disableDefaultUI={true}
					clickableIcons={false}
					onClick={(e: {
						detail: { latLng?: { lat: number; lng: number } | null };
					}) => {
						if (onMapClick && e.detail.latLng) {
							onMapClick(e.detail.latLng.lat, e.detail.latLng.lng);
						}
					}}
				>
					{markerPosition && <AdvancedMarker position={markerPosition} />}
				</GoogleMaps>
			</div>
		</APIProvider>
	);
};

// Helper para acceder a google maps de forma segura
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getGoogleMaps = (): any | undefined => {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	if (typeof window !== "undefined" && (window as any).google?.maps) {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		return (window as any).google.maps;
	}
	return undefined;
};

export const MapWithAutocomplete = ({
	initialAddress = "",
	initialLat,
	initialLng,
	onLocationChange,
	googleMapsApiKey,
	googleMapsMapId,
	placeholder = "Buscar dirección...",
	addressLabel = "Dirección",
	disabled = false,
	mapHeight = "16rem",
	defaultCenter = { lat: -32.9526405, lng: -60.6776039 },
	defaultZoom = 13,
	locationRestriction,
	language = "es",
	region = "AR",
	className,
}: MapWithAutocompleteProps) => {
	const [address, setAddress] = useState(initialAddress);
	const [isOpen, setIsOpen] = useState(false);
	const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [markerPosition, setMarkerPosition] = useState<{
		lat: number;
		lng: number;
	} | null>(
		initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null,
	);
	const [mapCenter, setMapCenter] = useState(
		initialLat && initialLng
			? { lat: initialLat, lng: initialLng }
			: defaultCenter,
	);

	const debouncedAddress = useDebounce(address, 650);

	// Fetch suggestions cuando cambia la dirección
	useEffect(() => {
		const fetchSuggestions = async () => {
			const maps = getGoogleMaps();
			if (!debouncedAddress || !maps?.places) {
				setSuggestions([]);
				return;
			}

			setIsLoading(true);

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const request: any = {
				input: debouncedAddress,
				language,
				region,
			};

			if (locationRestriction) {
				request.locationRestriction = new maps.LatLngBounds(
					new maps.LatLng(locationRestriction.south, locationRestriction.west),
					new maps.LatLng(locationRestriction.north, locationRestriction.east),
				);
			}

			try {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const AutocompleteSuggestion = (maps.places as any)
					.AutocompleteSuggestion;
				const response =
					await AutocompleteSuggestion.fetchAutocompleteSuggestions(request);
				setSuggestions(response.suggestions as PlaceSuggestion[]);
			} catch (error) {
				console.error("Error al buscar sugerencias:", error);
				setSuggestions([]);
			} finally {
				setIsLoading(false);
			}
		};

		fetchSuggestions();
	}, [debouncedAddress, language, region, locationRestriction]);

	const handleSelect = useCallback(
		async (suggestion: PlaceSuggestion) => {
			const newAddress = suggestion.placePrediction?.text.text || "";
			setAddress(newAddress);

			const place = suggestion.placePrediction?.toPlace();
			await place?.fetchFields({ fields: ["location"] });

			if (place?.location) {
				const newPosition = {
					lat: place.location.lat(),
					lng: place.location.lng(),
				};
				setMarkerPosition(newPosition);
				setMapCenter(newPosition);
				onLocationChange({
					lat: newPosition.lat,
					lng: newPosition.lng,
					address: newAddress,
				});
			}
		},
		[onLocationChange],
	);

	const handleMapClick = useCallback(
		async (lat: number, lng: number) => {
			setMarkerPosition({ lat, lng });

			// Opcional: hacer geocoding inverso para obtener la dirección
			const maps = getGoogleMaps();
			if (maps) {
				try {
					const geocoder = new maps.Geocoder();
					const response = await geocoder.geocode({ location: { lat, lng } });
					if (response.results[0]) {
						const newAddress = response.results[0].formatted_address;
						setAddress(newAddress);
						onLocationChange({ lat, lng, address: newAddress });
					}
				} catch (error) {
					console.error("Error en geocoding inverso:", error);
					onLocationChange({ lat, lng, address: address });
				}
			}
		},
		[address, onLocationChange],
	);

	return (
		<div className={cn("space-y-4", className)}>
			<div>
				<Label className="flex items-center gap-2 mb-2">
					<MapPin className="w-4 h-4" />
					{addressLabel}
				</Label>
				<Popover open={isOpen && !disabled} onOpenChange={setIsOpen}>
					<Command shouldFilter={false} className="w-full">
						<PopoverAnchor asChild>
							<CommandPrimitive.Input asChild>
								<Input
									placeholder={placeholder}
									value={address}
									onChange={(e: ChangeEvent<HTMLInputElement>) => {
										setAddress(e.target.value);
										setIsOpen(true);
									}}
									onFocus={() => setIsOpen(true)}
									disabled={disabled}
								/>
							</CommandPrimitive.Input>
						</PopoverAnchor>
						<PopoverContent
							asChild
							onOpenAutoFocus={(e: Event) => {
								e.preventDefault();
								e.stopPropagation();
							}}
							className="w-[var(--radix-popper-anchor-width)] p-0"
						>
							<CommandList>
								{address && isLoading && (
									<CommandPrimitive.Loading>
										<div className="p-1 space-y-1">
											<Skeleton className="h-6 w-full" />
											<Skeleton className="h-6 w-full" />
										</div>
									</CommandPrimitive.Loading>
								)}
								{address && suggestions.length > 0 && !isLoading ? (
									<CommandGroup>
										{suggestions.map((suggestion, index) => (
											<CommandItem
												key={index}
												onSelect={() => {
													handleSelect(suggestion);
													setIsOpen(false);
												}}
												onMouseDown={(e: React.MouseEvent) =>
													e.preventDefault()
												}
											>
												{suggestion.placePrediction?.text.text}
											</CommandItem>
										))}
									</CommandGroup>
								) : null}
								{address && !isLoading && suggestions.length === 0 ? (
									<CommandEmpty>No se encontraron resultados.</CommandEmpty>
								) : null}
							</CommandList>
						</PopoverContent>
					</Command>
				</Popover>
			</div>

			<div className="rounded-lg overflow-hidden">
				<GoogleMapInternal
					apiKey={googleMapsApiKey}
					mapId={googleMapsMapId}
					center={mapCenter}
					markerPosition={markerPosition}
					onCenterChange={setMapCenter}
					onMapClick={handleMapClick}
					mapHeight={mapHeight}
					defaultZoom={defaultZoom}
				/>
			</div>
		</div>
	);
};

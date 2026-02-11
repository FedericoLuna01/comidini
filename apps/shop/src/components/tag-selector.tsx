"use client";

import { Badge } from "@repo/ui/components/ui/badge";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@repo/ui/components/ui/collapsible";
import { Input } from "@repo/ui/components/ui/input";
import { ScrollArea } from "@repo/ui/components/ui/scroll-area";
import { cn } from "@repo/ui/lib/utils";
import {
	Check,
	ChevronDown,
	ChevronRight,
	Coffee,
	Globe,
	Leaf,
	Search,
	ShoppingBag,
	Store,
	UtensilsCrossed,
	X,
} from "lucide-react";
import { useMemo, useState } from "react";

// Definición de categorías y tags predefinidos expandidos
export const TAG_CATEGORIES = {
	comidas: {
		label: "Comidas",
		icon: UtensilsCrossed,
		tags: [
			"parrilla",
			"pizza",
			"hamburguesa",
			"empanadas",
			"milanesas",
			"pastas",
			"sushi",
			"tacos",
			"burritos",
			"shawarma",
			"kebab",
			"pollo",
			"mariscos",
			"pescado",
			"asado",
			"lomito",
			"choripan",
			"panchos",
			"sandwiches",
			"wraps",
			"ensaladas",
			"sopas",
			"guisos",
			"wok",
			"ramen",
			"poke",
			"ceviche",
			"tapas",
			"picadas",
			"medialunas",
			"facturas",
			"tostadas",
			"tortillas",
			"canelones",
			"lasagna",
			"ñoquis",
			"ravioles",
			"fideos",
			"arroz",
			"risotto",
			"curry",
			"falafel",
			"hummus",
		],
	},
	tipoLocal: {
		label: "Tipo de local",
		icon: Store,
		tags: [
			"restaurante",
			"cafeteria",
			"bodegon",
			"cerveceria",
			"pizzeria",
			"heladeria",
			"panaderia",
			"pasteleria",
			"rotiseria",
			"food truck",
			"bar",
			"pub",
			"bistro",
			"trattoria",
			"cantina",
			"taberna",
			"confiteria",
			"casa de comidas",
			"comedor",
			"buffet",
			"autoservicio",
			"delivery only",
			"dark kitchen",
			"cocina fantasma",
			"kiosco",
			"almacen",
			"vinoteca",
			"tea house",
			"juice bar",
			"smoothie bar",
		],
	},
	estiloComida: {
		label: "Estilo de comida",
		icon: Globe,
		tags: [
			"argentina",
			"italiana",
			"española",
			"francesa",
			"americana",
			"mexicana",
			"peruana",
			"brasileña",
			"colombiana",
			"venezolana",
			"chilena",
			"uruguaya",
			"oriental",
			"china",
			"japonesa",
			"coreana",
			"tailandesa",
			"vietnamita",
			"india",
			"turca",
			"arabe",
			"griega",
			"mediterranea",
			"fusion",
			"internacional",
			"criolla",
			"gourmet",
			"casera",
			"tradicional",
			"moderna",
			"de autor",
			"regional",
		],
	},
	bebidas: {
		label: "Bebidas",
		icon: Coffee,
		tags: [
			"cafe de especialidad",
			"te",
			"mate",
			"jugos naturales",
			"smoothies",
			"batidos",
			"licuados",
			"cerveza artesanal",
			"vinos",
			"cocktails",
			"tragos",
			"bebidas sin alcohol",
			"aguas saborizadas",
			"limonada",
			"chocolate caliente",
			"frappe",
		],
	},
	modalidad: {
		label: "Modalidad",
		icon: ShoppingBag,
		tags: [
			"take-away",
			"comer en el local",
			"delivery",
			"retiro en local",
			"reservas",
			"eventos",
			"catering",
			"pedidos anticipados",
			"mesa compartida",
			"terraza",
			"patio",
			"salon privado",
			"barra",
			"mostrador",
		],
	},
	especiales: {
		label: "Especiales / Dietéticos",
		icon: Leaf,
		tags: [
			"vegano",
			"vegetariano",
			"sin gluten",
			"sin tacc",
			"sin lactosa",
			"keto",
			"low carb",
			"proteico",
			"organico",
			"natural",
			"sin azucar",
			"apto diabeticos",
			"apto celiacos",
			"kosher",
			"halal",
			"plant based",
			"raw food",
			"macrobiotico",
			"ayurveda",
			"fit",
			"saludable",
			"light",
		],
	},
} as const;

// Lista plana de todos los tags predefinidos
const ALL_PREDEFINED_TAGS = Object.values(TAG_CATEGORIES).flatMap(
	(category) => category.tags,
);

// Función para encontrar la categoría de un tag
export const findTagCategory = (tag: string): keyof typeof TAG_CATEGORIES => {
	const normalizedTag = tag.toLowerCase().trim();
	for (const [categoryKey, category] of Object.entries(TAG_CATEGORIES)) {
		if (category.tags.some((t) => t.toLowerCase() === normalizedTag)) {
			return categoryKey as keyof typeof TAG_CATEGORIES;
		}
	}
	return "comidas"; // Default fallback
};

// Normalizar tag para comparación
const normalizeTag = (tag: string) => tag.toLowerCase().trim();

// Colores de tags basados en la paleta de Comidini
const TAG_COLORS: Record<
	keyof typeof TAG_CATEGORIES,
	{ bg: string; text: string }
> = {
	comidas: { bg: "oklch(0.92 0.08 12)", text: "oklch(0.35 0.12 12)" }, // Coral claro
	tipoLocal: { bg: "oklch(0.90 0.10 25)", text: "oklch(0.40 0.15 25)" }, // Naranja suave
	estiloComida: { bg: "oklch(0.88 0.12 45)", text: "oklch(0.45 0.18 45)" }, // Amarillo cálido
	bebidas: { bg: "oklch(0.88 0.08 80)", text: "oklch(0.40 0.12 80)" }, // Marrón café
	modalidad: { bg: "oklch(0.90 0.08 150)", text: "oklch(0.40 0.12 150)" }, // Verde menta
	especiales: { bg: "oklch(0.88 0.10 200)", text: "oklch(0.40 0.15 200)" }, // Azul cielo
};

export const getTagColor = (tag: string) => {
	const category = findTagCategory(tag);
	const color = TAG_COLORS[category];
	return { backgroundColor: color.bg, color: color.text };
};

interface TagSelectorProps {
	value: string[];
	onChange: (tags: string[]) => void;
	disabled?: boolean;
	className?: string;
}

export function TagSelector({
	value = [],
	onChange,
	disabled = false,
	className,
}: TagSelectorProps) {
	const [openCategories, setOpenCategories] = useState<string[]>([]);
	const [searchQuery, setSearchQuery] = useState("");

	// Agrupar los tags seleccionados por categoría
	const groupedSelectedTags = useMemo(() => {
		const groups: Record<keyof typeof TAG_CATEGORIES, string[]> = {
			comidas: [],
			tipoLocal: [],
			estiloComida: [],
			bebidas: [],
			modalidad: [],
			especiales: [],
		};

		for (const tag of value) {
			const category = findTagCategory(tag);
			groups[category].push(tag);
		}

		return groups;
	}, [value]);

	// Filtrar tags por búsqueda
	const filteredCategories = useMemo(() => {
		if (!searchQuery.trim()) {
			return TAG_CATEGORIES;
		}

		const query = normalizeTag(searchQuery);
		const filtered: Record<
			string,
			{ label: string; icon: typeof UtensilsCrossed; tags: readonly string[] }
		> = {};

		for (const [categoryKey, category] of Object.entries(TAG_CATEGORIES)) {
			const matchingTags = category.tags.filter((tag) =>
				normalizeTag(tag).includes(query),
			);

			if (matchingTags.length > 0) {
				filtered[categoryKey] = {
					...category,
					tags: matchingTags,
				};
			}
		}

		return filtered;
	}, [searchQuery]);

	// Contar resultados de búsqueda
	const searchResultsCount = useMemo(() => {
		if (!searchQuery.trim()) return ALL_PREDEFINED_TAGS.length;
		return Object.values(filteredCategories).reduce(
			(acc, cat) => acc + cat.tags.length,
			0,
		);
	}, [filteredCategories, searchQuery]);

	const toggleCategory = (categoryKey: string) => {
		setOpenCategories((prev) =>
			prev.includes(categoryKey)
				? prev.filter((key) => key !== categoryKey)
				: [...prev, categoryKey],
		);
	};

	const isTagSelected = (tag: string) => {
		return value.some(
			(selectedTag) => normalizeTag(selectedTag) === normalizeTag(tag),
		);
	};

	const handleTagClick = (tag: string) => {
		if (disabled) return;

		if (isTagSelected(tag)) {
			// Remover tag
			onChange(
				value.filter(
					(selectedTag) => normalizeTag(selectedTag) !== normalizeTag(tag),
				),
			);
		} else {
			// Agregar tag
			onChange([...value, tag]);
		}
	};

	// Expandir automáticamente categorías con resultados cuando se busca
	useMemo(() => {
		if (searchQuery.trim()) {
			const categoriesWithResults = Object.keys(filteredCategories);
			setOpenCategories(categoriesWithResults);
		}
	}, [searchQuery, filteredCategories]);

	return (
		<div className={cn("space-y-4", className)}>
			{/* Input de búsqueda */}
			<div className="relative">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
				<Input
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					placeholder="Buscar tags..."
					disabled={disabled}
					className="pl-10 pr-10"
				/>
				{searchQuery && (
					<button
						type="button"
						onClick={() => setSearchQuery("")}
						className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
					>
						<X className="h-4 w-4" />
					</button>
				)}
			</div>

			{/* Contador de resultados */}
			{searchQuery.trim() && (
				<p className="text-xs text-muted-foreground">
					{searchResultsCount}{" "}
					{searchResultsCount === 1 ? "resultado" : "resultados"} encontrados
				</p>
			)}

			{/* Tags seleccionados */}
			{value.length > 0 && (
				<div className="space-y-2">
					<p className="text-sm font-medium text-muted-foreground">
						Tags seleccionados ({value.length})
					</p>
					<div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
						{value.map((tag) => (
							<Badge
								key={tag}
								className="px-3 py-1.5 text-sm cursor-pointer transition-all hover:scale-105 hover:shadow-sm border-0 gap-1 capitalize"
								style={getTagColor(tag)}
								onClick={() => handleTagClick(tag)}
							>
								{tag}
								<X className="w-3 h-3 ml-1" />
							</Badge>
						))}
					</div>
				</div>
			)}

			{/* Categorías de tags con scroll */}
			<div className="space-y-2">
				<p className="text-sm font-medium text-muted-foreground">
					Selecciona tags por categoría
				</p>
				<ScrollArea className="h-[320px] rounded-lg border">
					<div className="p-2 space-y-1">
						{Object.keys(filteredCategories).length === 0 ? (
							<div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
								<Search className="h-8 w-8 mb-2 opacity-50" />
								<p className="text-sm">No se encontraron tags</p>
								<p className="text-xs">Intenta con otra búsqueda</p>
							</div>
						) : (
							Object.entries(filteredCategories).map(
								([categoryKey, category]) => {
									const Icon = category.icon;
									const isOpen = openCategories.includes(categoryKey);
									const selectedInCategory =
										groupedSelectedTags[
											categoryKey as keyof typeof TAG_CATEGORIES
										]?.length || 0;

									return (
										<Collapsible
											key={categoryKey}
											open={isOpen}
											onOpenChange={() => toggleCategory(categoryKey)}
										>
											<CollapsibleTrigger
												className={cn(
													"flex w-full items-center justify-between rounded-md p-2.5 text-sm font-medium transition-colors hover:bg-muted",
													isOpen && "bg-muted",
												)}
												disabled={disabled}
											>
												<div className="flex items-center gap-2">
													<Icon className="h-4 w-4 text-muted-foreground" />
													<span>{category.label}</span>
													<span className="text-xs text-muted-foreground">
														({category.tags.length})
													</span>
													{selectedInCategory > 0 && (
														<Badge
															variant="secondary"
															className="h-5 px-1.5 text-xs"
														>
															{selectedInCategory} selec.
														</Badge>
													)}
												</div>
												{isOpen ? (
													<ChevronDown className="h-4 w-4 text-muted-foreground" />
												) : (
													<ChevronRight className="h-4 w-4 text-muted-foreground" />
												)}
											</CollapsibleTrigger>
											<CollapsibleContent className="pt-2 pb-2 px-2">
												<div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-1">
													{category.tags.map((tag) => {
														const selected = isTagSelected(tag);
														return (
															<Badge
																key={tag}
																className={cn(
																	"px-2.5 py-1 text-xs cursor-pointer transition-all hover:scale-105 hover:shadow-sm border-0 gap-1 capitalize",
																	selected ? "" : "opacity-50 hover:opacity-80",
																)}
																style={getTagColor(tag)}
																onClick={() => handleTagClick(tag)}
															>
																{selected && <Check className="w-3 h-3" />}
																{tag}
															</Badge>
														);
													})}
												</div>
											</CollapsibleContent>
										</Collapsible>
									);
								},
							)
						)}
					</div>
				</ScrollArea>
			</div>
		</div>
	);
}

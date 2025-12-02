import type { SelectShop } from "@repo/db/src/types/shop";
import { Button } from "@repo/ui/components/ui/button";
import { cn } from "@repo/ui/lib/utils";
import { Link } from "@tanstack/react-router";
import { AdvancedMarker } from "@vis.gl/react-google-maps";
import { Globe, MapPin, Phone } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type Supercluster from "supercluster";
import { getCategoryColors, getCategoryIcon } from "../..";
import { useShopStore } from "../-store/shop-store";

export const ShopMarker = ({ shop }: { shop: Cluster }) => {
	const CategoryIcon = getCategoryIcon(shop.properties.category || "");
	const colors = getCategoryColors(shop.properties.category || "");
	const [isHovered, setIsHovered] = useState(false);

	const shopData = shop.properties.data;
	const logoId = `shop-logo-${shop.id}`;

	const { selectedShopId, toggleSelectedShop } = useShopStore();
	const isClicked = selectedShopId === shopData?.id;

	return (
		<AdvancedMarker
			key={shop.id}
			position={{
				lat: Number(shopData?.latitude!),
				lng: Number(shopData?.longitude!),
			}}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			onClick={() => toggleSelectedShop(shopData?.id!)}
		>
			<motion.button
				key="marker"
				className="bg-white flex p-2 items-center justify-center relative border shadow-md hover:cursor-pointer"
				type="button"
				animate={{
					width: isClicked ? "300px" : isHovered ? "88px" : "40px",
					height: isClicked ? "380px" : isHovered ? "88px" : "40px",
					borderRadius: isClicked ? "16px" : "50%",
				}}
				whileHover={{ scale: 1.05 }}
				transition={{ ease: "easeInOut", duration: 0.25 }}
			>
				<AnimatePresence mode="wait">
					{isClicked ? (
						<motion.div
							key="expanded"
							layout
							className="w-full h-full overflow-hidden rounded-lg"
						>
							{/* Image */}
							<div className="relative h-32 w-full">
								<img
									src={
										shopData?.banner ||
										shopData?.logo ||
										"https://via.placeholder.com/300x150"
									}
									alt={shopData?.name}
									className="w-full h-full object-cover"
								/>
								{shopData?.logo && (
									<motion.div
										className="absolute -bottom-6 left-4"
										layoutId={logoId}
										transition={{ type: "spring", stiffness: 300, damping: 25 }}
									>
										<img
											src={shopData.logo}
											alt={shopData?.name}
											className="size-16 rounded-full border-2 border-white object-cover shadow-md"
										/>
									</motion.div>
								)}
							</div>

							{/* Content */}
							<div className="p-4 pt-8 flex items-start flex-col text-left">
								<h3 className="font-semibold text-lg text-gray-900 mb-1 leading-tight">
									{shopData?.name}
								</h3>

								{shopData?.address && (
									<div className="flex items-start gap-2 text-gray-600 text-sm mb-2">
										<MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
										<span className="line-clamp-2">{shopData.address}</span>
									</div>
								)}

								{shopData?.phone && (
									<div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
										<Phone className="w-4 h-4 flex-shrink-0" />
										<span>{shopData.phone}</span>
									</div>
								)}

								{shopData?.website && (
									<div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
										<Globe className="w-4 h-4 flex-shrink-0" />
										<a
											href={shopData.website}
											target="_blank"
											rel="noopener noreferrer"
											className="text-blue-600 hover:underline truncate"
										>
											{shopData.website.replace(/^https?:\/\//, "")}
										</a>
									</div>
								)}

								{shopData?.description && (
									<p className="text-gray-500 text-sm mt-2 line-clamp-2">
										{shopData.description}
									</p>
								)}
								<Button className="w-full mt-2" size="sm">
									<Link
										to="/tiendas/$shopId"
										params={{ shopId: shopData?.id.toString() }}
									>
										Visitar tienda
									</Link>
								</Button>
							</div>
						</motion.div>
					) : (
						<AnimatePresence mode="wait">
							{isHovered ? (
								<motion.div
									key="logo"
									layoutId={logoId}
									initial={{ opacity: 0, scale: 0.8 }}
									animate={{ opacity: 1, scale: 1 }}
									exit={{ opacity: 0, scale: 0.8 }}
									transition={{ duration: 0.15 }}
								>
									<img
										src={shopData?.logo || "https://via.placeholder.com/40"}
										alt={shopData?.name}
										className="size-20 overflow-hidden rounded-full border object-cover"
									/>
								</motion.div>
							) : (
								<motion.div
									key="icon"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}
									transition={{ duration: 0.15 }}
								>
									<CategoryIcon
										className={cn(
											"w-8 h-8 p-1 rounded-full",
											colors.bg,
											colors.text,
										)}
									/>
								</motion.div>
							)}
						</AnimatePresence>
					)}
				</AnimatePresence>
				<div className="h-0 w-fit border-l-10 border-r-10 border-t-10 border-transparent border-t-white absolute -bottom-[8px] drop-shadow-md" />
			</motion.button>
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

import { create } from "zustand";

interface ShopPosition {
	lat: number;
	lng: number;
}

interface ShopStore {
	selectedShopId: number | null;
	selectedShopPosition: ShopPosition | null;
	setSelectedShopId: (id: number | null) => void;
	toggleSelectedShop: (id: number, position?: ShopPosition) => void;
}

export const useShopStore = create<ShopStore>((set, get) => ({
	selectedShopId: null,
	selectedShopPosition: null,
	setSelectedShopId: (id) =>
		set({ selectedShopId: id, selectedShopPosition: null }),
	toggleSelectedShop: (id, position) =>
		set({
			selectedShopId: get().selectedShopId === id ? null : id,
			selectedShopPosition:
				get().selectedShopId === id ? null : (position ?? null),
		}),
}));

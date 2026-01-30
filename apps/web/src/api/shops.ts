import type { SelectShop, SelectShopHours } from "@repo/db/src/types/shop";
import { queryOptions } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL;

const getAllShops = async (): Promise<SelectShop[]> => {
	const response = await fetch(`${API_URL}/shops`, {
		method: "GET",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
		},
	});

	if (!response.ok) {
		throw new Error("Error al obtener las tiendas");
	}

	return response.json();
};

export const allShopsQueryOptions = queryOptions({
	queryKey: ["get-all-shops"],
	queryFn: getAllShops,
});

// Obtener todos los horarios de todas las tiendas
const getAllShopsHours = async (): Promise<SelectShopHours[]> => {
	const response = await fetch(`${API_URL}/shops/all-hours`, {
		method: "GET",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
		},
	});

	if (!response.ok) {
		throw new Error("Error al obtener los horarios");
	}

	return response.json();
};

export const allShopsHoursQueryOptions = queryOptions({
	queryKey: ["get-all-shops-hours"],
	queryFn: getAllShopsHours,
});

const getShopById = async (shopId: number): Promise<SelectShop> => {
	const response = await fetch(`${API_URL}/shops/${shopId}`, {
		method: "GET",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
		},
	});

	if (!response.ok) {
		throw new Error("Error al obtener la tienda");
	}

	return response.json();
};

export const shopByIdQueryOptions = (shopId: number) =>
	queryOptions({
		queryKey: ["get-shop-by-id", shopId],
		queryFn: () => getShopById(shopId),
	});

// Obtener horarios de una tienda por ID
const getShopHours = async (shopId: number): Promise<SelectShopHours[]> => {
	const response = await fetch(`${API_URL}/shops/${shopId}/hours`, {
		method: "GET",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
		},
	});

	if (!response.ok) {
		throw new Error("Error al obtener los horarios");
	}

	return response.json();
};

export const shopHoursQueryOptions = (shopId: number) =>
	queryOptions({
		queryKey: ["get-shop-hours", shopId],
		queryFn: () => getShopHours(shopId),
	});

// Nombres de los días de la semana
const DAYS_OF_WEEK = [
	"Domingo",
	"Lunes",
	"Martes",
	"Miércoles",
	"Jueves",
	"Viernes",
	"Sábado",
];

// Helper para formatear hora de HH:MM a formato legible
export const formatTime = (time: string | null): string => {
	if (!time) return "";
	const [hours, minutes] = time.split(":");
	const hour = Number.parseInt(hours, 10);
	const suffix = hour >= 12 ? "pm" : "am";
	const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
	return `${displayHour}:${minutes}${suffix}`;
};

// Helper para verificar si la tienda está abierta ahora
export const isShopOpenNow = (hours: SelectShopHours[]): boolean => {
	const now = new Date();
	const currentDay = now.getDay(); // 0 = Domingo, 1 = Lunes, etc.
	const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

	const todayHours = hours.filter((h) => h.dayOfWeek === currentDay);

	if (todayHours.length === 0) return false;

	for (const slot of todayHours) {
		if (slot.isClosed) continue;
		if (!slot.openTime || !slot.closeTime) continue;

		// Manejar horarios que cruzan la medianoche
		if (slot.closeTime < slot.openTime) {
			// El turno cruza la medianoche
			if (currentTime >= slot.openTime || currentTime <= slot.closeTime) {
				return true;
			}
		} else {
			if (currentTime >= slot.openTime && currentTime <= slot.closeTime) {
				return true;
			}
		}
	}

	return false;
};

// Helper para obtener el próximo horario de apertura
export const getNextOpenTime = (
	hours: SelectShopHours[],
): { day: string; time: string } | null => {
	const now = new Date();
	const currentDay = now.getDay();
	const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

	// Buscar en los próximos 7 días
	for (let i = 0; i < 7; i++) {
		const dayToCheck = (currentDay + i) % 7;
		const dayHours = hours
			.filter((h) => h.dayOfWeek === dayToCheck && !h.isClosed)
			.sort((a, b) => (a.openTime || "").localeCompare(b.openTime || ""));

		for (const slot of dayHours) {
			if (!slot.openTime) continue;

			// Si es hoy, verificar que sea después de ahora
			if (i === 0 && slot.openTime <= currentTime) continue;

			return {
				day: i === 0 ? "Hoy" : i === 1 ? "Mañana" : DAYS_OF_WEEK[dayToCheck],
				time: formatTime(slot.openTime),
			};
		}
	}

	return null;
};

// Helper para agrupar horarios por día para mostrar en la UI
export type GroupedHours = {
	dayOfWeek: number;
	dayName: string;
	isClosed: boolean;
	timeSlots: Array<{ openTime: string; closeTime: string }>;
};

// Tipo para días consecutivos agrupados
export type ConsecutiveGroupedHours = {
	dayRange: string; // "Lunes a Viernes" o "Sábado"
	isClosed: boolean;
	timeSlots: Array<{ openTime: string; closeTime: string }>;
};

// Helper para comparar si dos días tienen los mismos horarios
const haveSameSchedule = (day1: GroupedHours, day2: GroupedHours): boolean => {
	if (day1.isClosed !== day2.isClosed) return false;
	if (day1.isClosed && day2.isClosed) return true;
	if (day1.timeSlots.length !== day2.timeSlots.length) return false;

	return day1.timeSlots.every((slot, idx) => {
		const otherSlot = day2.timeSlots[idx];
		return (
			slot.openTime === otherSlot.openTime &&
			slot.closeTime === otherSlot.closeTime
		);
	});
};

export const groupHoursByDay = (hours: SelectShopHours[]): GroupedHours[] => {
	const grouped = new Map<number, GroupedHours>();

	// Inicializar todos los días
	for (let i = 0; i < 7; i++) {
		grouped.set(i, {
			dayOfWeek: i,
			dayName: DAYS_OF_WEEK[i],
			isClosed: true,
			timeSlots: [],
		});
	}

	// Agrupar horarios
	for (const hour of hours) {
		const day = grouped.get(hour.dayOfWeek);
		if (day) {
			if (hour.isClosed) {
				day.isClosed = true;
			} else {
				day.isClosed = false;
				day.timeSlots.push({
					openTime: formatTime(hour.openTime),
					closeTime: formatTime(hour.closeTime),
				});
			}
		}
	}

	return Array.from(grouped.values());
};

// Helper para agrupar días consecutivos con los mismos horarios
export const groupConsecutiveDays = (
	hours: SelectShopHours[],
): ConsecutiveGroupedHours[] => {
	const dailyHours = groupHoursByDay(hours);
	const result: ConsecutiveGroupedHours[] = [];

	// Reordenar para empezar desde Lunes (1) hasta Domingo (0)
	const orderedDays = [
		...dailyHours.slice(1), // Lunes a Sábado
		dailyHours[0], // Domingo
	];

	let i = 0;
	while (i < orderedDays.length) {
		const startDay = orderedDays[i];
		let endIndex = i;

		// Buscar días consecutivos con el mismo horario
		while (
			endIndex + 1 < orderedDays.length &&
			haveSameSchedule(startDay, orderedDays[endIndex + 1])
		) {
			endIndex++;
		}

		const endDay = orderedDays[endIndex];

		// Crear el rango de días
		let dayRange: string;
		if (i === endIndex) {
			// Solo un día
			dayRange = startDay.dayName;
		} else {
			// Rango de días
			dayRange = `${startDay.dayName} a ${endDay.dayName}`;
		}

		result.push({
			dayRange,
			isClosed: startDay.isClosed,
			timeSlots: startDay.timeSlots,
		});

		i = endIndex + 1;
	}

	return result;
};

// Helper para obtener los horarios de una tienda específica desde el array de todos los horarios
export const getShopHoursFromAll = (
	allHours: SelectShopHours[],
	shopId: number,
): SelectShopHours[] => {
	return allHours.filter((h) => h.shopId === shopId);
};

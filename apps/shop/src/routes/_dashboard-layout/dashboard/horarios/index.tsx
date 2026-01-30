import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
} from "@repo/ui/components/ui/form";
import {
	Heading,
	HeadingDescription,
	HeadingSeparator,
	HeadingTitle,
} from "@repo/ui/components/ui/heading";
import { Input } from "@repo/ui/components/ui/input";
import { toast } from "@repo/ui/components/ui/sonner";
import { Switch } from "@repo/ui/components/ui/switch";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { getShopHours, updateShopHours } from "../../../../api/shops";

export const Route = createFileRoute("/_dashboard-layout/dashboard/horarios/")({
	component: RouteComponent,
});

const DAYS_OF_WEEK = [
	"Domingo",
	"Lunes",
	"Martes",
	"Miércoles",
	"Jueves",
	"Viernes",
	"Sábado",
];

const timeSlotSchema = z.object({
	openTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
	closeTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
});

const businessHoursSchema = z.object({
	dayOfWeek: z.number().min(0).max(6),
	isClosed: z.boolean(),
	timeSlots: z.array(timeSlotSchema),
});

type FormValues = {
	businessHours: z.infer<typeof businessHoursSchema>[];
};

// Convierte los datos del API al formato del formulario (agrupa por día)
const convertApiDataToForm = (
	apiData: Array<{
		dayOfWeek: number;
		openTime: string | null;
		closeTime: string | null;
		isClosed: boolean | null;
	}>,
): FormValues["businessHours"] => {
	const hoursMap = new Map<
		number,
		{
			isClosed: boolean;
			timeSlots: Array<{ openTime: string; closeTime: string }>;
		}
	>();

	// Inicializar todos los días
	for (let i = 0; i < 7; i++) {
		hoursMap.set(i, { isClosed: true, timeSlots: [] });
	}

	// Agrupar los horarios por día
	for (const hour of apiData) {
		const existing = hoursMap.get(hour.dayOfWeek);
		if (existing) {
			if (hour.isClosed) {
				existing.isClosed = true;
			} else {
				existing.isClosed = false;
				existing.timeSlots.push({
					openTime: hour.openTime || "09:00",
					closeTime: hour.closeTime || "18:00",
				});
			}
		}
	}

	// Asegurarse de que los días sin horarios tengan al menos un slot
	for (const [, value] of hoursMap) {
		if (!value.isClosed && value.timeSlots.length === 0) {
			value.timeSlots.push({ openTime: "09:00", closeTime: "18:00" });
		}
		if (value.isClosed && value.timeSlots.length === 0) {
			value.timeSlots.push({ openTime: "09:00", closeTime: "18:00" });
		}
	}

	return DAYS_OF_WEEK.map((_, index) => ({
		dayOfWeek: index,
		isClosed: hoursMap.get(index)?.isClosed ?? true,
		timeSlots: hoursMap.get(index)?.timeSlots || [
			{ openTime: "09:00", closeTime: "18:00" },
		],
	}));
};

// Convierte los datos del formulario al formato del API
const convertFormDataToApi = (
	formData: FormValues["businessHours"],
): Array<{
	dayOfWeek: number;
	openTime: string;
	closeTime: string;
	isClosed: boolean;
}> => {
	const result: Array<{
		dayOfWeek: number;
		openTime: string;
		closeTime: string;
		isClosed: boolean;
	}> = [];

	for (const day of formData) {
		if (day.isClosed) {
			result.push({
				dayOfWeek: day.dayOfWeek,
				openTime: "00:00",
				closeTime: "00:00",
				isClosed: true,
			});
		} else {
			for (const slot of day.timeSlots) {
				result.push({
					dayOfWeek: day.dayOfWeek,
					openTime: slot.openTime,
					closeTime: slot.closeTime,
					isClosed: false,
				});
			}
		}
	}

	return result;
};

function RouteComponent() {
	const { data, isLoading } = useQuery({
		queryFn: getShopHours,
		queryKey: ["shopHours"],
	});

	const form = useForm<FormValues>({
		resolver: zodResolver(
			z.object({
				businessHours: z.array(businessHoursSchema),
			}),
		),
		defaultValues: {
			businessHours: DAYS_OF_WEEK.map((_, index) => ({
				dayOfWeek: index,
				isClosed: index === 0,
				timeSlots: [{ openTime: "09:00", closeTime: "18:00" }],
			})),
		},
	});

	useEffect(() => {
		if (data) {
			form.reset({
				businessHours: convertApiDataToForm(data),
			});
		}
	}, [data, form.reset]);

	const mutation = useMutation({
		mutationFn: (
			formData: Array<{
				dayOfWeek: number;
				openTime: string;
				closeTime: string;
				isClosed: boolean;
			}>,
		) => updateShopHours(formData),
		onSuccess: () => {
			return toast.success("Horarios actualizados exitosamente");
		},
	});

	const onSubmit = async (formData: FormValues) => {
		const apiData = convertFormDataToApi(formData.businessHours);
		mutation.mutate(apiData);
	};

	const addTimeSlot = (dayIndex: number) => {
		const currentHours = form.getValues(`businessHours.${dayIndex}`);
		form.setValue(`businessHours.${dayIndex}.timeSlots`, [
			...currentHours.timeSlots,
			{ openTime: "14:00", closeTime: "22:00" },
		]);
	};

	const removeTimeSlot = (dayIndex: number, slotIndex: number) => {
		const currentHours = form.getValues(`businessHours.${dayIndex}`);
		if (currentHours.timeSlots.length > 1) {
			form.setValue(
				`businessHours.${dayIndex}.timeSlots`,
				currentHours.timeSlots.filter((_, i) => i !== slotIndex),
			);
		}
	};

	return (
		<div className="space-y-6">
			<Heading>
				<HeadingTitle>Horarios</HeadingTitle>
				<HeadingDescription>
					Administra los horarios de tu tienda
				</HeadingDescription>
				<HeadingSeparator />
			</Heading>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
					<div className="space-y-4">
						{DAYS_OF_WEEK.map((day, dayIndex) => {
							const isClosed = form.watch(`businessHours.${dayIndex}.isClosed`);
							const timeSlots =
								form.watch(`businessHours.${dayIndex}.timeSlots`) || [];

							return (
								<div key={dayIndex} className="p-4 border rounded-lg space-y-3">
									<div className="flex items-center gap-4">
										<FormField
											control={form.control}
											name={`businessHours.${dayIndex}.isClosed`}
											render={({ field }) => (
												<FormItem className="flex flex-row items-center gap-2">
													<FormControl>
														<Switch
															checked={!field.value}
															onCheckedChange={(checked) =>
																field.onChange(!checked)
															}
														/>
													</FormControl>
												</FormItem>
											)}
										/>
										<p className="w-28 font-medium">{day}</p>

										{!isClosed && (
											<div className="flex-1 space-y-2">
												{timeSlots.map((_, slotIndex) => (
													<div
														key={slotIndex}
														className="flex items-center gap-2"
													>
														<FormField
															control={form.control}
															name={`businessHours.${dayIndex}.timeSlots.${slotIndex}.openTime`}
															render={({ field }) => (
																<FormItem>
																	<FormControl>
																		<Input
																			type="time"
																			className="w-32"
																			{...field}
																		/>
																	</FormControl>
																</FormItem>
															)}
														/>
														<span className="text-sm text-gray-500">-</span>
														<FormField
															control={form.control}
															name={`businessHours.${dayIndex}.timeSlots.${slotIndex}.closeTime`}
															render={({ field }) => (
																<FormItem>
																	<FormControl>
																		<Input
																			type="time"
																			className="w-32"
																			{...field}
																		/>
																	</FormControl>
																</FormItem>
															)}
														/>
														{slotIndex === 0 ? (
															<Button
																type="button"
																variant="ghost"
																size="icon"
																onClick={() => addTimeSlot(dayIndex)}
																title="Agregar turno"
															>
																<Plus className="w-4 h-4" />
															</Button>
														) : (
															<Button
																type="button"
																variant="ghost"
																size="icon"
																onClick={() =>
																	removeTimeSlot(dayIndex, slotIndex)
																}
																title="Eliminar turno"
															>
																<Trash2 className="w-4 h-4" />
															</Button>
														)}
													</div>
												))}
											</div>
										)}
									</div>
								</div>
							);
						})}
					</div>
					<div className="flex justify-start">
						<Button type="submit" disabled={isLoading || mutation.isPending}>
							{mutation.isPending ? "Guardando..." : "Guardar Horarios"}
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
}

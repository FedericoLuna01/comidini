import { zodResolver } from "@hookform/resolvers/zod";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
} from "@repo/ui/components/ui/form";
import {
	Heading,
	HeadingButton,
	HeadingDescription,
	HeadingSeparator,
	HeadingTitle,
} from "@repo/ui/components/ui/heading";
import { Input } from "@repo/ui/components/ui/input";
import { toast } from "@repo/ui/components/ui/sonner";
import { Spinner } from "@repo/ui/components/ui/spinner";
import { Switch } from "@repo/ui/components/ui/switch";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Clock, Plus, Trash2 } from "lucide-react";
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

	if (isLoading) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
				<Spinner className="text-primary" />
				<p className="text-muted-foreground animate-pulse">
					Cargando horarios...
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-8 animate-in fade-in duration-500">
			<Heading>
				<HeadingTitle> Horarios de Atención</HeadingTitle>
				<HeadingDescription>
					Define cuándo está abierta tu tienda para recibir pedidos.
				</HeadingDescription>
				<HeadingButton asChild>
					<Button
						onClick={form.handleSubmit(onSubmit)}
						disabled={isLoading || mutation.isPending}
					>
						{mutation.isPending ? "Guardando..." : "Guardar Cambios"}
					</Button>
				</HeadingButton>
				<HeadingSeparator />
			</Heading>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
						{DAYS_OF_WEEK.map((day, dayIndex) => {
							const isClosed = form.watch(`businessHours.${dayIndex}.isClosed`);
							const timeSlots =
								form.watch(`businessHours.${dayIndex}.timeSlots`) || [];

							return (
								<Card
									key={dayIndex}
									className={`transition-all duration-300 overflow-hidden ${
										isClosed ? "bg-muted/30 border-muted opacity-80" : "bg-card"
									}`}
								>
									<CardHeader className="p-4 pb-2 border-b bg-muted/5">
										<div className="flex items-center justify-between gap-2">
											<div className="flex items-center gap-2">
												<CardTitle className="text-base font-bold">
													{day}
												</CardTitle>
												{isClosed ? (
													<Badge
														variant="secondary"
														className="text-[10px] uppercase tracking-wider font-black"
													>
														Cerrado
													</Badge>
												) : (
													<Badge
														variant="default"
														className="text-[10px] uppercase tracking-wider font-black bg-emerald-500 hover:bg-emerald-600"
													>
														Abierto
													</Badge>
												)}
											</div>
											<FormField
												control={form.control}
												name={`businessHours.${dayIndex}.isClosed`}
												render={({ field }) => (
													<FormItem>
														<FormControl>
															<Switch
																checked={!field.value}
																onCheckedChange={(checked) =>
																	field.onChange(!checked)
																}
																className="data-[state=checked]:bg-emerald-500"
															/>
														</FormControl>
													</FormItem>
												)}
											/>
										</div>
									</CardHeader>
									<CardContent className="p-4 pt-4 space-y-4">
										{!isClosed ? (
											<div className="space-y-3 min-h-[120px]">
												{timeSlots.map((_, slotIndex) => (
													<div
														key={slotIndex}
														className="group flex items-center gap-2 bg-muted/30 p-2 rounded-lg border border-transparent hover:border-primary/20 transition-all"
													>
														<div className="grid grid-cols-2 gap-2 flex-1">
															<FormField
																control={form.control}
																name={`businessHours.${dayIndex}.timeSlots.${slotIndex}.openTime`}
																render={({ field }) => (
																	<FormItem className="space-y-0.5">
																		<FormControl>
																			<div className="relative">
																				<Clock className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
																				<Input
																					type="time"
																					className="h-8 pl-7 text-xs border-none bg-background focus-visible:ring-1 focus-visible:ring-primary/30"
																					{...field}
																				/>
																			</div>
																		</FormControl>
																	</FormItem>
																)}
															/>
															<FormField
																control={form.control}
																name={`businessHours.${dayIndex}.timeSlots.${slotIndex}.closeTime`}
																render={({ field }) => (
																	<FormItem className="space-y-0.5">
																		<FormControl>
																			<div className="relative">
																				<Clock className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
																				<Input
																					type="time"
																					className="h-8 pl-7 text-xs border-none bg-background focus-visible:ring-1 focus-visible:ring-primary/30"
																					{...field}
																				/>
																			</div>
																		</FormControl>
																	</FormItem>
																)}
															/>
														</div>
														{slotIndex > 0 && (
															<Button
																type="button"
																variant="ghost"
																size="icon"
																className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
																onClick={() =>
																	removeTimeSlot(dayIndex, slotIndex)
																}
															>
																<Trash2 className="w-3.5 h-3.5" />
															</Button>
														)}
													</div>
												))}
												<Button
													type="button"
													variant="ghost"
													size="sm"
													className="w-full h-8 border border-dashed border-muted-foreground/20 text-muted-foreground hover:text-primary hover:border-primary/50 text-[11px] gap-1.5"
													onClick={() => addTimeSlot(dayIndex)}
												>
													<Plus className="w-3 h-3" />
													Añadir Turno
												</Button>
											</div>
										) : (
											<div className="flex flex-col items-center justify-center py-8 text-muted-foreground/40 space-y-2">
												<Clock className="w-10 h-10 stroke-[1]" />
												<span className="text-xs font-medium uppercase tracking-widest">
													Sin actividad
												</span>
											</div>
										)}
									</CardContent>
								</Card>
							);
						})}
					</div>

					<div className="flex justify-center md:hidden pb-10">
						<Button
							type="submit"
							className="w-full py-6 text-lg font-bold"
							disabled={isLoading || mutation.isPending}
						>
							{mutation.isPending ? "Guardando..." : "Guardar Horarios"}
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
}

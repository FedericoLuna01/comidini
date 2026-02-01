import { zodResolver } from "@hookform/resolvers/zod";
import {
	type CreateModifierGroupFormInput,
	type CreateModifierGroupWithOptionsSchema,
	createModifierGroupWithOptionsSchema,
	type ModifierOptionWithOptionalId,
} from "@repo/db/src/types/product";
import { Button } from "@repo/ui/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/ui/card";
import { Checkbox } from "@repo/ui/components/ui/checkbox";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@repo/ui/components/ui/form";
import { Input } from "@repo/ui/components/ui/input";
import { Separator } from "@repo/ui/components/ui/separator";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";

interface ModifierGroupFormProps {
	onSubmit: (data: CreateModifierGroupWithOptionsSchema) => void;
	onCancel?: () => void;
	initialData?: Partial<CreateModifierGroupWithOptionsSchema>;
	isSubmitting?: boolean;
}

const defaultOption: Omit<ModifierOptionWithOptionalId, "groupId"> = {
	name: "",
	description: undefined,
	priceAdjustment: "0",
	quantity: null,
	lowStockThreshold: null,
	isDefault: false,
	isActive: true,
	sortOrder: 0,
};

export function ModifierGroupForm({
	onSubmit,
	onCancel,
	initialData,
	isSubmitting,
}: ModifierGroupFormProps) {
	const form = useForm<CreateModifierGroupFormInput>({
		resolver: zodResolver(createModifierGroupWithOptionsSchema),
		defaultValues: {
			name: initialData?.name ?? "",
			description: initialData?.description ?? "",
			minSelection: initialData?.minSelection ?? 0,
			maxSelection: initialData?.maxSelection ?? 1,
			isActive: initialData?.isActive ?? true,
			sortOrder: initialData?.sortOrder ?? 0,
			options: initialData?.options ?? [{ ...defaultOption }],
		},
	});

	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: "options",
	});

	const handleAddOption = () => {
		append({ ...defaultOption, sortOrder: fields.length });
	};

	const minSelection = form.watch("minSelection") ?? 0;
	const maxSelection = form.watch("maxSelection") ?? 1;

	// Determine the selection type label
	const getSelectionTypeLabel = () => {
		if (minSelection >= 1 && maxSelection === 1) {
			return "Obligatorio (elegir 1)";
		}
		if (minSelection >= 1 && maxSelection > 1) {
			return `Obligatorio (elegir ${minSelection}-${maxSelection})`;
		}
		if (minSelection === 0 && maxSelection === 1) {
			return "Opcional (máx. 1)";
		}
		return `Opcional (máx. ${maxSelection})`;
	};

	const handleFormSubmit = (data: CreateModifierGroupFormInput) => {
		// Transform to the output type (Zod applies defaults)
		const parsed = createModifierGroupWithOptionsSchema.parse(data);
		onSubmit(parsed);
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(handleFormSubmit)}
				className="space-y-6"
			>
				<Card>
					<CardHeader>
						<CardTitle>Información del Grupo</CardTitle>
						<CardDescription>
							Define el nombre y las reglas de selección para este grupo de
							modificadores.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Nombre del grupo *</FormLabel>
										<FormControl>
											<Input
												placeholder="ej: Tamaño, Extras, Salsas"
												{...field}
												disabled={isSubmitting}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="description"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Descripción</FormLabel>
										<FormControl>
											<Input
												placeholder="ej: Elige el tamaño de tu bebida"
												{...field}
												disabled={isSubmitting}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<Separator />

						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<FormField
								control={form.control}
								name="minSelection"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Selección mínima</FormLabel>
										<FormControl>
											<Input
												type="number"
												min={0}
												{...field}
												onChange={(e) => field.onChange(Number(e.target.value))}
												disabled={isSubmitting}
											/>
										</FormControl>
										<FormDescription>
											0 = opcional, 1+ = obligatorio
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="maxSelection"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Selección máxima</FormLabel>
										<FormControl>
											<Input
												type="number"
												min={1}
												{...field}
												onChange={(e) => field.onChange(Number(e.target.value))}
												disabled={isSubmitting}
											/>
										</FormControl>
										<FormDescription>
											1 = única opción, 2+ = múltiples
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
							<div className="flex items-center">
								<div className="rounded-md bg-muted px-3 py-2 text-sm">
									{getSelectionTypeLabel()}
								</div>
							</div>
						</div>

						<FormField
							control={form.control}
							name="isActive"
							render={({ field }) => (
								<FormItem className="flex items-center gap-2">
									<FormControl>
										<Checkbox
											checked={field.value}
											onCheckedChange={field.onChange}
											disabled={isSubmitting}
										/>
									</FormControl>
									<FormLabel className="!mt-0">Grupo activo</FormLabel>
								</FormItem>
							)}
						/>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Opciones</CardTitle>
						<CardDescription>
							Agrega las opciones disponibles para este grupo. Por ejemplo:
							"Pequeño", "Mediano", "Grande".
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						{fields.map((field, index) => (
							<div
								key={field.id}
								className="flex items-start gap-2 p-4 border rounded-lg bg-background"
							>
								<div className="flex items-center h-10 cursor-grab">
									<GripVertical className="h-4 w-4 text-muted-foreground" />
								</div>
								<div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
									<FormField
										control={form.control}
										name={`options.${index}.name`}
										render={({ field }) => (
											<FormItem>
												<FormLabel>Nombre *</FormLabel>
												<FormControl>
													<Input
														placeholder="ej: Grande"
														{...field}
														disabled={isSubmitting}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name={`options.${index}.priceAdjustment`}
										render={({ field }) => (
											<FormItem>
												<FormLabel>Precio adicional</FormLabel>
												<FormControl>
													<Input
														type="number"
														step="0.01"
														placeholder="0.00"
														{...field}
														disabled={isSubmitting}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name={`options.${index}.isDefault`}
										render={({ field }) => (
											<FormItem className="flex items-center gap-2 pt-8">
												<FormControl>
													<Checkbox
														checked={field.value}
														onCheckedChange={field.onChange}
														disabled={isSubmitting}
													/>
												</FormControl>
												<FormLabel className="!mt-0 text-sm">
													Por defecto
												</FormLabel>
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name={`options.${index}.isActive`}
										render={({ field }) => (
											<FormItem className="flex items-center gap-2 pt-8">
												<FormControl>
													<Checkbox
														checked={field.value}
														onCheckedChange={field.onChange}
														disabled={isSubmitting}
													/>
												</FormControl>
												<FormLabel className="!mt-0 text-sm">Activo</FormLabel>
											</FormItem>
										)}
									/>
								</div>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									className="h-10 w-10 text-destructive hover:text-destructive"
									onClick={() => remove(index)}
									disabled={fields.length <= 1 || isSubmitting}
								>
									<Trash2 className="h-4 w-4" />
								</Button>
							</div>
						))}

						<Button
							type="button"
							variant="outline"
							onClick={handleAddOption}
							disabled={isSubmitting}
							className="w-full"
						>
							<Plus className="h-4 w-4 mr-2" />
							Agregar opción
						</Button>
					</CardContent>
				</Card>

				<div className="flex justify-end gap-2">
					{onCancel && (
						<Button
							type="button"
							variant="outline"
							onClick={onCancel}
							disabled={isSubmitting}
						>
							Cancelar
						</Button>
					)}
					<Button type="submit" disabled={isSubmitting}>
						{isSubmitting ? "Guardando..." : "Guardar grupo"}
					</Button>
				</div>
			</form>
		</Form>
	);
}

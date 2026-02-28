import { asc, eq, inArray } from "drizzle-orm";
import { db } from "../config";
import { modifierGroup, modifierOption } from "../schema";
import type {
	CreateModifierGroupWithOptionsSchema,
	ModifierGroupWithOptions,
} from "../types/product";

/**
 * Create a modifier group with its options for a product
 */
export const createModifierGroupWithOptions = async (
	productId: number,
	groupData: CreateModifierGroupWithOptionsSchema,
): Promise<ModifierGroupWithOptions | null> => {
	const { options, ...groupFields } = groupData;

	// Create the modifier group
	const [createdGroup] = await db
		.insert(modifierGroup)
		.values({
			...groupFields,
			productId,
		})
		.returning();

	if (!createdGroup) {
		return null;
	}

	// Create all options for this group
	const createdOptions = await db
		.insert(modifierOption)
		.values(
			options.map((option, index) => ({
				...option,
				groupId: createdGroup.id,
				sortOrder: option.sortOrder ?? index,
			})),
		)
		.returning();

	return {
		...createdGroup,
		options: createdOptions,
	};
};

/**
 * Get all modifier groups with their options for a product
 */
export const getModifierGroupsByProductId = async (
	productId: number,
): Promise<ModifierGroupWithOptions[]> => {
	const groups = await db
		.select()
		.from(modifierGroup)
		.where(eq(modifierGroup.productId, productId))
		.orderBy(asc(modifierGroup.sortOrder));

	if (groups.length === 0) {
		return [];
	}

	// Get all options for all groups in a single query
	const groupIds = groups.map((g) => g.id);
	const allOptions = await db
		.select()
		.from(modifierOption)
		.where(
			groupIds.length === 1
				? eq(modifierOption.groupId, groupIds[0] as number)
				: inArray(modifierOption.groupId, groupIds),
		)
		.orderBy(asc(modifierOption.sortOrder));

	// Group options by their group ID
	const optionsByGroup = allOptions.reduce(
		(acc, option) => {
			const groupId = option.groupId;
			if (!acc[groupId]) {
				acc[groupId] = [];
			}
			acc[groupId].push(option);
			return acc;
		},
		{} as Record<number, typeof allOptions>,
	);

	return groups.map((group) => ({
		...group,
		options: optionsByGroup[group.id] || [],
	}));
};

/**
 * Update a modifier group with its options
 */
export const updateModifierGroup = async (
	groupId: number,
	data: Partial<CreateModifierGroupWithOptionsSchema>,
) => {
	const { options, ...groupFields } = data;

	// Update the group
	const [updated] = await db
		.update(modifierGroup)
		.set({
			...groupFields,
			updatedAt: new Date(),
		})
		.where(eq(modifierGroup.id, groupId))
		.returning();

	// If options are provided, sync them
	if (options && Array.isArray(options)) {
		// Get existing options
		const existingOptions = await db
			.select()
			.from(modifierOption)
			.where(eq(modifierOption.groupId, groupId));

		const existingOptionIds = existingOptions.map((o) => o.id);
		const incomingOptionIds: number[] = [];

		// Update or create options
		for (let i = 0; i < options.length; i++) {
			const optionData = options[i];
			if (!optionData) continue;
			
			const optionWithId = optionData as typeof optionData & { id?: number };

			if (optionWithId.id && existingOptionIds.includes(optionWithId.id)) {
				// Update existing option
				incomingOptionIds.push(optionWithId.id);
				await db
					.update(modifierOption)
					.set({
						name: optionData.name,
						description: optionData.description,
						priceAdjustment: optionData.priceAdjustment,
						quantity: optionData.quantity,
						lowStockThreshold: optionData.lowStockThreshold,
						isDefault: optionData.isDefault,
						isActive: optionData.isActive,
						sortOrder: i,
						updatedAt: new Date(),
					})
					.where(eq(modifierOption.id, optionWithId.id));
			} else {
				// Create new option
				const [newOption] = await db
					.insert(modifierOption)
					.values({
						groupId,
						name: optionData.name,
						description: optionData.description,
						priceAdjustment: optionData.priceAdjustment,
						quantity: optionData.quantity,
						lowStockThreshold: optionData.lowStockThreshold,
						isDefault: optionData.isDefault,
						isActive: optionData.isActive,
						sortOrder: i,
					})
					.returning();
				if (newOption) {
					incomingOptionIds.push(newOption.id);
				}
			}
		}

		// Delete options that are no longer in the list
		const optionsToDelete = existingOptionIds.filter(
			(id) => !incomingOptionIds.includes(id),
		);
		for (const optionId of optionsToDelete) {
			await db.delete(modifierOption).where(eq(modifierOption.id, optionId));
		}
	}

	return updated;
};

/**
 * Delete a modifier group (cascades to options)
 */
export const deleteModifierGroup = async (groupId: number) => {
	await db.delete(modifierGroup).where(eq(modifierGroup.id, groupId));
};

/**
 * Create a modifier option
 */
export const createModifierOption = async (
	groupId: number,
	optionData: Omit<typeof modifierOption.$inferInsert, "groupId" | "id">,
) => {
	const [created] = await db
		.insert(modifierOption)
		.values({
			...optionData,
			groupId,
		})
		.returning();

	return created;
};

/**
 * Update a modifier option
 */
export const updateModifierOption = async (
	optionId: number,
	data: Partial<typeof modifierOption.$inferInsert>,
) => {
	const [updated] = await db
		.update(modifierOption)
		.set({
			...data,
			updatedAt: new Date(),
		})
		.where(eq(modifierOption.id, optionId))
		.returning();

	return updated;
};

/**
 * Delete a modifier option
 */
export const deleteModifierOption = async (optionId: number) => {
	await db.delete(modifierOption).where(eq(modifierOption.id, optionId));
};

/**
 * Get modifier option by ID
 */
export const getModifierOptionById = async (optionId: number) => {
	const [option] = await db
		.select()
		.from(modifierOption)
		.where(eq(modifierOption.id, optionId));

	return option;
};

/**
 * Get modifier group by ID with its options
 */
export const getModifierGroupById = async (
	groupId: number,
): Promise<ModifierGroupWithOptions | null> => {
	const [group] = await db
		.select()
		.from(modifierGroup)
		.where(eq(modifierGroup.id, groupId));

	if (!group) {
		return null;
	}

	const options = await db
		.select()
		.from(modifierOption)
		.where(eq(modifierOption.groupId, groupId))
		.orderBy(asc(modifierOption.sortOrder));

	return {
		...group,
		options,
	};
};

import { movement_types } from "@/app/core/movement-types.ts/model/model";
import type { MovementType } from "@/app/core/movement-types.ts/types/movement-type-types";
import { db } from "@/database/database";
import { eq } from "drizzle-orm";

export const getMovementTypes = async (): Promise<MovementType[]> => {
	const rows = await db.select().from(movement_types);
	return rows as MovementType[];
};

export const getMovementTypeByName = async (
	name: string,
): Promise<MovementType | null> => {
	const row = await db
		.select()
		.from(movement_types)
		.where(eq(movement_types.name, name));
	return row[0] as MovementType | null;
};

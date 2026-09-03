import { MovementType } from "../types/movement-type";

export const MovementTypeDict: Record<MovementType, number> = {
	[MovementType.INCOME]: 1,
	[MovementType.FIXED_EXPENSE]: 2,
	[MovementType.EXPENSE]: 3,
} as const;

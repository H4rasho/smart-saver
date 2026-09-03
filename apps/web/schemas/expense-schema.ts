"use client";

import { z } from "zod";

export const expenseSchema = z.object({
	amount: z.coerce.number(),
	category: z.string(),
});

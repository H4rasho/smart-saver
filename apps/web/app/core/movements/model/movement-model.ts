import { users } from "@/app/core/user/model/user-model";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const movement_types = sqliteTable("movement_types", {
	id: integer("id").primaryKey(),
	name: text("name").notNull(),
});

export const movements = sqliteTable("movements", {
	id: integer("id").primaryKey(),
	category_id: integer("category_id"),
	clerk_id: text("clerk_id").references(() => users.clerk_id),
	movement_type_id: integer("movement_type_id").references(
		() => movement_types.id,
	),
	name: text("name"),
	amount: real("amount"),
	is_recurring: integer("is_recurring"),
	recurrence_period: text("recurrence_period"),
	recurrence_start: text("recurrence_start"),
	recurrence_end: text("recurrence_end"),
	transaction_date: text("transaction_date"),
	created_at: text("created_at"),
});

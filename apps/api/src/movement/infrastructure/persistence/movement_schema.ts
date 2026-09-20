import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const movements = sqliteTable("movements", {
	id: integer("id").primaryKey(),
	clerkId: text("clerk_id"),
	categoryId: integer("category_id"),
	movementTypeId: integer("movement_type_id"),
	name: text("name"),
	// SQLite permits encrypted text in the existing REAL-affinity column.
	amount: text("amount"),
	isRecurring: integer("is_recurring"),
	recurrencePeriod: text("recurrence_period"),
	recurrenceStart: text("recurrence_start"),
	recurrenceEnd: text("recurrence_end"),
	transactionDate: text("transaction_date"),
	createdAt: text("created_at"),
});

export const categories = sqliteTable("categories", {
	id: integer("id").primaryKey(),
	name: text("name").notNull(),
	clerkId: text("clerk_id"),
});

export const movementTypes = sqliteTable("movement_types", {
	id: integer("id").primaryKey(),
	name: text("name").notNull(),
});

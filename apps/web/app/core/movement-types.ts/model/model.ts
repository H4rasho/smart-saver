import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const movement_types = sqliteTable("movement_types", {
	id: integer("id").primaryKey(),
	name: text("name").notNull(),
});

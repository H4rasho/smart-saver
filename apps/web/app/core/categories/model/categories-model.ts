import { users } from "@/app/core/user/model/user-model";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const categories = sqliteTable("categories", {
	id: integer("id").primaryKey(),
	name: text("name").notNull(),
	clerk_id: text("clerk_id").references(() => users.clerk_id),
});

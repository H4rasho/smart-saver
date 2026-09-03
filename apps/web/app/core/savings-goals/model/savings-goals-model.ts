import { users } from "@/app/core/user/model/user-model";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const savings_goals = sqliteTable("savings_goals", {
	id: integer("id").primaryKey(),
	clerk_id: text("clerk_id")
		.notNull()
		.references(() => users.clerk_id),
	name: text("name").notNull(),
	target_amount: real("target_amount").notNull(),
	target_date: text("target_date"),
	created_at: text("created_at").notNull(),
});

export const savings_goal_contributions = sqliteTable(
	"savings_goal_contributions",
	{
		id: integer("id").primaryKey(),
		goal_id: integer("goal_id")
			.notNull()
			.references(() => savings_goals.id),
		clerk_id: text("clerk_id")
			.notNull()
			.references(() => users.clerk_id),
		amount: real("amount").notNull(),
		contribution_date: text("contribution_date").notNull(),
		created_at: text("created_at").notNull(),
	},
);

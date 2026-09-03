CREATE TABLE `savings_goal_contributions` (
	`id` integer PRIMARY KEY NOT NULL,
	`goal_id` integer NOT NULL,
	`clerk_id` text NOT NULL,
	`amount` real NOT NULL,
	`contribution_date` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`goal_id`) REFERENCES `savings_goals`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`clerk_id`) REFERENCES `users`(`clerk_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `savings_goals` (
	`id` integer PRIMARY KEY NOT NULL,
	`clerk_id` text NOT NULL,
	`name` text NOT NULL,
	`target_amount` real NOT NULL,
	`target_date` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`clerk_id`) REFERENCES `users`(`clerk_id`) ON UPDATE no action ON DELETE no action
);

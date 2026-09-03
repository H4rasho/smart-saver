PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_movements` (
	`id` integer PRIMARY KEY NOT NULL,
	`category_id` integer,
	`clerk_id` text,
	`movement_type_id` integer,
	`name` text,
	`amount` real,
	`is_recurring` integer,
	`recurrence_period` text,
	`recurrence_start` text,
	`recurrence_end` text,
	`created_at` text,
	FOREIGN KEY (`clerk_id`) REFERENCES `users`(`clerk_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`movement_type_id`) REFERENCES `movement_types`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_movements`("id", "category_id", "clerk_id", "movement_type_id", "name", "amount", "is_recurring", "recurrence_period", "recurrence_start", "recurrence_end", "created_at") SELECT "id", "category_id", "clerk_id", "movement_type_id", "name", "amount", "is_recurring", "recurrence_period", "recurrence_start", "recurrence_end", "created_at" FROM `movements`;--> statement-breakpoint
DROP TABLE `movements`;--> statement-breakpoint
ALTER TABLE `__new_movements` RENAME TO `movements`;--> statement-breakpoint
PRAGMA foreign_keys=ON;
CREATE TABLE `categories` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`clerk_id` text,
	FOREIGN KEY (`clerk_id`) REFERENCES `users`(`clerk_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `movement_types` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `movements` (
	`id` integer PRIMARY KEY NOT NULL,
	`category_id` integer,
	`clerk_id` integer,
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
CREATE TABLE `users` (
	`id` integer PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`currency` text NOT NULL,
	`clerk_id` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_clerk_id_unique` ON `users` (`clerk_id`);
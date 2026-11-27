CREATE TABLE `mood_boards` (
	`id` text PRIMARY KEY NOT NULL,
	`invitation_id` text NOT NULL,
	`event_id` text NOT NULL,
	`data` text NOT NULL,
	`shot_token` text NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`invitation_id`) REFERENCES `invitations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `mood_boards_shot_token_unique` ON `mood_boards` (`shot_token`);--> statement-breakpoint
CREATE UNIQUE INDEX `mood_boards_event_idx` ON `mood_boards` (`invitation_id`,`event_id`);
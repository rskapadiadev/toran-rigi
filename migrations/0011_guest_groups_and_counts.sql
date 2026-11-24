CREATE TABLE `guest_groups` (
	`id` text PRIMARY KEY NOT NULL,
	`invitation_id` text NOT NULL,
	`kind` text DEFAULT 'group' NOT NULL,
	`name` text DEFAULT '' NOT NULL,
	`side` text,
	`token` text NOT NULL,
	`sort` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`invitation_id`) REFERENCES `invitations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `guest_groups_token_unique` ON `guest_groups` (`token`);--> statement-breakpoint
CREATE INDEX `guest_groups_inv_idx` ON `guest_groups` (`invitation_id`);--> statement-breakpoint
ALTER TABLE `guests` ADD `side` text;--> statement-breakpoint
ALTER TABLE `guests` ADD `group_id` text REFERENCES guest_groups(id);--> statement-breakpoint
ALTER TABLE `guests` ADD `note` text;--> statement-breakpoint
ALTER TABLE `guests` ADD `sent_at` text;--> statement-breakpoint
ALTER TABLE `invitation_events` ADD `audience` text;--> statement-breakpoint
ALTER TABLE `rsvps` ADD `counts` text;--> statement-breakpoint
ALTER TABLE `rsvps` ADD `manual` integer DEFAULT false NOT NULL;
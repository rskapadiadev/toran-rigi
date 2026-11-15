CREATE TABLE `templates` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`event_kind` text NOT NULL,
	`culture` text DEFAULT 'universal' NOT NULL,
	`theme_id` text,
	`invitation_id` text NOT NULL,
	`from_package` text DEFAULT 'signature' NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`is_featured` integer DEFAULT false NOT NULL,
	`sort` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`theme_id`) REFERENCES `themes`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`invitation_id`) REFERENCES `invitations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `templates_slug_unique` ON `templates` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `templates_invitation_id_unique` ON `templates` (`invitation_id`);--> statement-breakpoint
CREATE INDEX `templates_kind_idx` ON `templates` (`event_kind`,`status`);--> statement-breakpoint
-- Existing demo invitations become the first published templates (one per demo, named after its theme).
INSERT INTO `templates` (`id`, `slug`, `name`, `description`, `event_kind`, `culture`, `theme_id`, `invitation_id`, `from_package`, `status`, `is_featured`, `sort`)
SELECT 'tpl_' || substr(i.`slug`, 6), substr(i.`slug`, 6), coalesce(t.`name`, substr(i.`slug`, 6)), coalesce(t.`description`, ''),
       i.`event_kind`, i.`culture`, i.`theme_id`, i.`id`, coalesce(t.`from_package`, 'signature'), 'published', coalesce(t.`is_featured`, 0), coalesce(t.`sort`, 0)
FROM `invitations` i LEFT JOIN `themes` t ON t.`id` = i.`theme_id`
WHERE i.`is_demo` = 1 AND i.`slug` LIKE 'demo-%'
ON CONFLICT DO NOTHING;

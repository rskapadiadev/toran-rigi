CREATE TABLE `checkouts` (
	`id` text PRIMARY KEY NOT NULL,
	`customer_id` text NOT NULL,
	`template_id` text,
	`order_id` text,
	`invitation_id` text,
	`content` text,
	`events` text,
	`country` text,
	`currency` text NOT NULL,
	`amount` integer NOT NULL,
	`provider` text NOT NULL,
	`provider_order_id` text,
	`provider_payment_id` text,
	`status` text DEFAULT 'open' NOT NULL,
	`locked_at` text,
	`paid_at` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`template_id`) REFERENCES `templates`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`invitation_id`) REFERENCES `invitations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `checkouts_provider_order_id_unique` ON `checkouts` (`provider_order_id`);--> statement-breakpoint
CREATE INDEX `checkouts_status_idx` ON `checkouts` (`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `checkouts_customer_idx` ON `checkouts` (`customer_id`);
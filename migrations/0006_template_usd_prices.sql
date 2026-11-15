-- Outside India templates are priced in US dollars ($50 to start) and shown in the visitor's own
-- currency at a stored exchange rate; the separate dirham price is retired.
UPDATE `templates` SET `prices` = json_object('INR', coalesce(json_extract(`prices`, '$.INR'), 79900), 'USD', 5000);
--> statement-breakpoint
UPDATE `templates` SET `compare_prices` = NULL WHERE `compare_prices` IS NOT NULL AND json_extract(`compare_prices`, '$.INR') IS NULL;
--> statement-breakpoint
UPDATE `templates` SET `compare_prices` = json_object('INR', json_extract(`compare_prices`, '$.INR')) WHERE `compare_prices` IS NOT NULL;

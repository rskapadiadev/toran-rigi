-- Every template has music. Only those with none chosen are filled; a choice already made is kept,
-- including a deliberate 'no music'. Customers' own invitations are not touched.
UPDATE `invitations` SET `extras` = json_set(`extras`, '$.music', json('{"source":"generated","style":"santoor"}')) WHERE json_extract(`extras`, '$.music') IS NULL AND `id` IN (SELECT `invitation_id` FROM `templates` WHERE `slug` IN ('phoolwari', 'sitara', 'deepmala', 'deepmala-yatra', 'palace-walk', 'birthday-template'));
--> statement-breakpoint
UPDATE `invitations` SET `extras` = json_set(`extras`, '$.music', json('{"source":"generated","style":"shehnai"}')) WHERE json_extract(`extras`, '$.music') IS NULL AND `id` IN (SELECT `invitation_id` FROM `templates` WHERE `slug` IN ('heera', 'roshni', 'zari', 'haveli-walk'));
--> statement-breakpoint
UPDATE `invitations` SET `extras` = json_set(`extras`, '$.music', json('{"source":"generated","style":"bells"}')) WHERE json_extract(`extras`, '$.music') IS NULL AND `id` IN (SELECT `invitation_id` FROM `templates` WHERE `slug` IN ('deepam', 'himalaya-walk'));
--> statement-breakpoint
UPDATE `invitations` SET `extras` = json_set(`extras`, '$.music', json('{"source":"generated","style":"oud"}')) WHERE json_extract(`extras`, '$.music') IS NULL AND `id` IN (SELECT `invitation_id` FROM `templates` WHERE `slug` IN ('mashrabiya', 'noor'));
--> statement-breakpoint
UPDATE `invitations` SET `extras` = json_set(`extras`, '$.music', json('{"source":"generated","style":"piano"}')) WHERE json_extract(`extras`, '$.music') IS NULL AND `id` IN (SELECT `invitation_id` FROM `templates` WHERE `slug` IN ('patra', 'sona', 'kagaz', 'summit', 'garden-walk'));
--> statement-breakpoint
UPDATE `invitations` SET `extras` = json_set(`extras`, '$.music', json('{"source":"generated","style":"ambient"}')) WHERE json_extract(`extras`, '$.music') IS NULL AND `id` IN (SELECT `invitation_id` FROM `templates` WHERE `slug` IN ('smriti'));

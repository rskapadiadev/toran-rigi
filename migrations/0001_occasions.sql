-- Occasions: invitation content's wedding-only `couple` becomes `people` (same shape, `two` now optional).
-- Columns are unchanged: `event_kind` already stores the occasion id (default 'wedding').
UPDATE `invitations`
SET `content` = json_set(json_remove(`content`, '$.couple'), '$.people', json(json_extract(`content`, '$.couple')))
WHERE json_type(`content`, '$.couple') IS NOT NULL AND json_type(`content`, '$.people') IS NULL;

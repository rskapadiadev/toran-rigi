-- The PDF now comes with every invitation. Orders that already paid for it keep their invoice line.
UPDATE `addons` SET `is_active` = 0 WHERE `code` = 'pdf_invitation';

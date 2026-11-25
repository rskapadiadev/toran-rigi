-- Family links and print cards now come with every invitation. Orders that already paid for either
-- keep their invoice line.
UPDATE `addons` SET `is_active` = 0 WHERE `code` IN ('guest_links', 'qr_card');

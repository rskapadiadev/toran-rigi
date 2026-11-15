-- Templates are priced one by one (no packages in the shop). Every template without its own price
-- starts at ₹799 / AED 149; "was" prices from the package era are cleared.
UPDATE `templates` SET `prices` = '{"INR":79900,"AED":14900}' WHERE `prices` IS NULL;

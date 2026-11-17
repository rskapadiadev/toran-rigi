-- Template descriptions are written only when a template is first created, so the shop kept describing openings these designs no longer use. Refresh them from the catalogue, and restore two names that were overwritten.
--> statement-breakpoint
UPDATE templates SET description = 'Pull the gold chain and carved palace doors part onto jharokha arches in burnished gold and deep burgundy; the baraat ghodi brings the card and the doli carries the bride off.' WHERE slug = 'rajwada';
--> statement-breakpoint
UPDATE templates SET description = 'A tie-dye bloom of thousands of dots unfurls in kumkum red and marigold — pure Gujarat.' WHERE slug = 'bandhani';
--> statement-breakpoint
UPDATE templates SET description = 'A gota-edged dupatta floats away over dusty rose and champagne; watercolour gulmohar blooms, the ghodi into the ceremonies and the doli at the farewell.' WHERE slug = 'gulmohar';
--> statement-breakpoint
UPDATE templates SET description = 'Guests offer flowers and the lamp is lit in their memory: deep indigo night, a warm diya glow and softly drawn mandala.' WHERE slug = 'deepanjali';
--> statement-breakpoint
UPDATE templates SET description = 'Monochrome editorial tribute: generous white space, a fine olive branch, a life told plainly.' WHERE slug = 'smriti';
--> statement-breakpoint
UPDATE templates SET description = 'Soft peach and mint, a gift that unwraps, drifting clouds and butterflies for the little one on the way.' WHERE slug = 'palna';
--> statement-breakpoint
UPDATE templates SET description = 'Coral, teal and sunshine confetti: fireworks spell the name, then a party invite that keeps celebrating.' WHERE slug = 'utsav';
--> statement-breakpoint
UPDATE templates SET description = 'A leather-bound book opens on a lifetime of work: navy and burnished brass, art-deco steps and a note from the family.' WHERE slug = 'legacy';
--> statement-breakpoint
UPDATE templates SET description = 'Ring the ghanti three times: saffron and marigold swags, a glowing diya on every arch and a rangoli at the end.' WHERE slug = 'aarti';
--> statement-breakpoint
UPDATE templates SET description = 'Kumkum red and turmeric: molten gold drops fuse and flood the screen, then a kalash on every arch, for the janoi, mundan or any sanskar.' WHERE slug = 'mangal';
--> statement-breakpoint
UPDATE templates SET description = 'Midnight slate with electric accents: a hyperspace opening and sharp diagonal cuts for launches and summits.' WHERE slug = 'summit';
--> statement-breakpoint
UPDATE templates SET description = 'Moonlight for a little one: powder blue and silver stars, and an instant photo that develops into the name as guests rub it.' WHERE slug = 'chandni';
--> statement-breakpoint
UPDATE templates SET name = 'Utsav' WHERE slug = 'utsav' AND name = 'Editorial';
--> statement-breakpoint
UPDATE templates SET name = 'Summit' WHERE slug = 'summit' AND name = 'Mangal';

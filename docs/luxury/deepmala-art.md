# Deepmala: painted art brief

Deepmala's pages already work without paintings: each section draws its own ornament where one is
missing. These paintings lift it to the hand-painted tier. They must be **our own originals**. Never
upload, trace or "img2img" another studio's artwork, and don't ask a model to imitate a named studio.

## One style for every piece

Paste this at the start of every prompt so the set reads as one painter's hand:

> Indian miniature-inspired digital painting, warm gouache texture with fine gold-leaf highlights,
> soft painterly shading, crisp clean edges, rich saffron, marigold, vermilion, deep red and
> antique gold, lit by warm diya light. Isolated object on a fully transparent background, centred,
> no text, no watermark, no border, no ground shadow beyond a soft contact shadow.

Avoid: photo-realism, 3D-render plastic look, neon, purple glow, cartoon outlines, people's faces
(except the dress-code piece, from behind), any text or lettering.

## Specs

| File (put in `public/kits/deepmala/`) | Size (px) | Notes |
|---|---|---|
| `divider.webp` | 1280 × 200 | Very wide and short. Transparent. Under 60 KB |
| `pavilion-haldi.webp` | 1024 × 1024 | Transparent. Under 90 KB each |
| `pavilion-mehndi.webp` | 1024 × 1024 | |
| `pavilion-sangeet.webp` | 1024 × 1024 | |
| `pavilion-pheras.webp` | 1024 × 1024 | |
| `venue.webp` | 1600 × 1000 | Background **navy #0e1838** (not transparent): it runs edge to edge and fades in from the top |
| `dress.webp` | 1400 × 800 | Transparent |
| `blessing-arch-*.webp` | 900 × 1200 | Vetted sacred art only, see below |

Export as WebP at quality 82. Keep transparency (alpha) where the table says transparent.

## Prompts

**1. Diya garland divider (`divider.webp`)**
> [style] A long, symmetrical horizontal ornament: a single lit clay diya with a tall calm flame at
> the exact centre; on each side a deep-red paisley (buta) outlined in gold leaf with small gold
> dots, then round marigold flower heads and buds, then curling gold acanthus scrolls and small gold
> leaves tapering out to a fine point at each end. Perfect mirror symmetry, very wide and slim,
> like an ornamental rule on a wedding card.

**2. Ceremony pavilions (`pavilion-*.webp`)**: one prompt each, same camera and stage.
> [style] A small open-air ceremonial pavilion on a low carved sandstone platform, seen from a
> three-quarter view slightly above, like a stage model. Four slim carved pillars, marigold garlands
> swagged between them, brass lanterns hanging. [CEREMONY DETAIL]. Small lit diyas around the edge
> of the platform.

| Ceremony | [CEREMONY DETAIL] |
|---|---|
| Haldi | A low wooden chowki with a brass bowl of turmeric paste, mango leaves, yellow marigold petals scattered, yellow drapes |
| Mehndi | A low cushioned seat with green bolsters, a flower rangoli on the floor, a brass tray of mehndi cones |
| Sangeet | Red and gold floor cushions, a dholak and harmonium on a rug, strings of fairy lights between the pillars |
| Pheras | A sacred fire kund at the centre with a small flame, four banana-leaf pillars wrapped in marigold, two low seats facing the fire |

**3. Venue (`venue.webp`)**
> [style, but background solid navy #0e1838] A wide riverside haveli palace at night, pale sandstone
> with domed chhatris, arched jharokha windows glowing warm, marigold toran on every arch, thousands
> of small diyas lining the steps (ghats) down to calm water that reflects the lights. Front-on,
> symmetrical, the building filling the full width, water along the bottom fifth.

**4. Dress code (`dress.webp`)**
> [style] Seven members of an Indian family standing in a row, seen **from behind**, dressed for a
> wedding: lehengas and sarees in red, saffron, emerald and blush, men in sherwanis and kurtas, a
> turban, a dupatta over one shoulder, a little girl in pink. No faces visible. Small lit diyas on the
> ground at their feet. Even spacing, full figures.

## Blessing arch: sacred art is vetted, not generated

The arch shows a deity or sacred symbol (Ganesh, Ram Darbar, Radha-Krishna, Om, Ik Onkar…). Per the
studio's cultural rule, **this art is never AI-generated**. Use licensed art from an artist or a
stock library, check it with someone from that tradition, and record the licence. Until then the
arch shows the invitation's own vetted greeting with a lit diya, which already looks complete.

## Wiring the art in

When the files are in `public/kits/deepmala/`, add this to the Deepmala design in
`shared/themes-luxury.ts` (or set it per invitation in the editor), then re-run
`npm run db:seed:local` and `node scripts/dev/posters.mjs --all`:

```ts
art: {
    divider: '/kits/deepmala/divider.webp',
    venue: '/kits/deepmala/venue.webp',
    dress: '/kits/deepmala/dress.webp',
    pavilions: {
        haldi: '/kits/deepmala/pavilion-haldi.webp',
        mehndi: '/kits/deepmala/pavilion-mehndi.webp',
        sangeet: '/kits/deepmala/pavilion-sangeet.webp',
        pheras: '/kits/deepmala/pavilion-pheras.webp',
    },
},
```

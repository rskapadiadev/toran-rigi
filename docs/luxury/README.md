# Toran luxury component library

The premium layer on top of the invitation engine. It is built stage by stage, and each stage is
approved before the next one starts. New code lives in `src/invitation/luxury/<category>/` and
plugs into the existing engine: the `OpeningProps` contract, the `useInvite()` context and the
`--inv-*` theme tokens. Existing invitations, APIs and data models stay unchanged.

## Progress tracker

| Stage | Scope | Status |
|---|---|---|
| 01 | Opening & entry experiences | **Done: Jewellery Box. Waiting for approval** |
| 02 | Envelope & invitation reveal | Not started |
| 03 | Cinematic hero & couple introduction | Not started |
| 04 | Typography & decorative components | Not started |
| 05 | Photo & memory experiences | Not started |
| 06 | Wedding events & countdown | Not started |
| 07 | Interactive guest experiences | Not started |
| 08 | Advanced effects & transitions | Not started |
| 09 | Integration, optimisation & final polish | Not started |

Next session: read this file and `CLAUDE.md`, then continue at the first stage that isn't done.

---

## How the engine fits together (Stage 01 audit)

- **Stack.** TanStack Start (React 19) with Hono, Drizzle and Cloudflare D1/R2. Tailwind v4. Motion (`motion/react`, wrapped in a strict `LazyMotion` inside the invitation). GSAP is loaded on demand through `src/motion/gsap.ts`. OGL (a small WebGL library) is installed. There is no Three.js, Rive or Lottie.
- **Invitation rendering.** `src/invitation/InvitationView.tsx` renders the opening (`openings/Opening.tsx`) on top of the invitation. The invitation itself is already rendered and paused behind the opening (`data-staging`), so it takes over without a reload.
- **Opening contract.** An opening is any component taking `{ onBegin, onOpened }` (`openings/types.ts`).
  - `onBegin` must fire on the first gesture: it unlocks music. Sound never autoplays.
  - `onOpened` hands over to the invitation.
  - A generic "Skip ›" button is added by `Opening.tsx`.
- **Registration.**
  - The kind goes in `openingKinds` (`shared/schemas/invitation.ts`); the design data is validated with zod.
  - The editor and the Library read their entry in `openingChoices` (`shared/blocks.ts`).
  - The component is added to the registry in `openings/Opening.tsx`.
- **Theming.**
  - Each invitation has a palette (`bg, surface, ink, muted, primary, accent, gold`), fonts and a motion ceiling.
  - Inside `.inv-root` everything paints from the `--inv-*` variables.
  - `useInvite()` gives `names` (one, two, initials, title), `copy()` (localised interface strings in en, hi, gu, ar, ur, he, pa), `tier` and `culture`.
- **Motion tiers.**
  - `tier` is `full`, `lite` or `static`. It comes from the device and an FPS probe, and from `prefers-reduced-motion`.
  - Calm occasions (remembrance, prayer) cap the motion level.
  - Openings must degrade to a short fade on the `static` tier.
- **Existing openings.** There are 28, mostly 2D SVG and CSS: doors, envelope with a wax seal, ribbon or gift, curtain, veil, book, origami and others. Some of the concepts in the brief already exist in simpler 2D form.
- **Ownership.** `src/invitation/openings/*` is shared with a parallel session. New luxury work therefore lives in `src/invitation/luxury/`, and only the one-line registry entry touches that folder.

---

## Stage 01: opening concepts explored

| # | Concept | What makes it distinctive | Best technology | Verdict |
|---|---|---|---|---|
| 1 | **Jewellery box** | A real 3D lacquered case under a spotlight. The guest lifts the hinged lid by hand, light spills from the velvet, and the card rises out of its slot and turns to face them. Feels like a jeweller's presentation, not a "web animation". | CSS 3D (`preserve-3d` faces), with GSAP for the timeline | **Built first.** Nothing like it exists yet, and it needs no new library. |
| 2 | **Gift box with a real ribbon** | The ribbon is a simulated cloth strip with tension: it slides along the box edges, the bow loosens, and the tails drop under gravity. Then the lid lifts. | Verlet rope or strip simulation on canvas, over a CSS 3D box | Strong candidate for later. Needs the physics simulation to look real; today's ribbon opening is 2D. |
| 3 | **Wax seal that truly breaks** | Pressing the seal cracks it along generated fracture lines. The shards fall with rotation and shadow, and the flap peels open with paper curl (a shaded bend, not a flat rotation). | SVG fracture paths with GSAP physics; the flap as a CSS 3D bend | Stage 02 (envelope & reveal) is the natural home. |
| 4 | **Royal curtain in real cloth** | Two velvet curtains made from a cloth mesh that sways, gathers when drawn and lets light spill through the gap. | WebGL cloth (OGL plane with a vertex shader) | Good, but WebGL on the first screen costs load time. Only worth it with a static fallback first. |
| 5 | **Glass vitrine** | The invitation floats inside a museum glass case with real reflections. The guest's tilt (gyroscope) or cursor moves the reflections. Tapping lifts the glass dome. | CSS 3D with backdrop-filter glass and tilt input | Elegant, quiet and premium. Good partner for minimal themes. |
| 6 | **Calligraphy in light** | A pen of light writes the couple's names on dark paper. Ink bleeds into the fibres, then the page turns. | SVG stroke animation (DrawSVG-style), using our existing name paths | Pairs best with Stage 04 typography. |

**Technology choices**
- **CSS 3D + GSAP** for physical objects that must be crisp and instant on phones. It is real perspective with zero extra download (GSAP is already lazy-loaded).
- **Canvas simulation** where something must bend or fall: ribbon, cloth.
- **WebGL (OGL, already installed)** only for effects CSS cannot do, behind a static first frame.
- **Rive / Lottie:** not needed yet. Nothing in Stage 01 justifies a new runtime.

---

## Component: `JewelleryBoxOpening`

`src/invitation/luxury/opening/JewelleryBoxOpening.tsx`. Opening kind: `jewellery-box`.

**Purpose:** a premium first impression that feels like receiving jewellery: tactile, slow and lit like a showroom.

**Experience**
1. **Closed.** A dark showroom, a soft spotlight and a lacquered case on the table.
   - The lid has a fine double gold inlay and the couple's initials embossed in gold foil.
   - The front has a gold clasp; a gold satin pull tab hangs from the lid.
   - The names and date sit above the box in foil serif. A guest link adds "Dear …".
   - The prompt "Lift the lid" sits at the bottom.
2. **Lift.** The lid is hinged at the back and follows the finger or mouse, stiffening near fully open.
   - Inside: ivory satin walls and lining with the couple's crest, a velvet tray, and the card resting in its slot.
   - Warm light rises from the velvet as the lid opens.
   - Letting go early drops the lid back with a small bounce, like a weighted lid.
3. **Reveal.** Past about 28°, or on a plain tap, the hinge swings open with a slight overshoot.
   - The names above the box fade.
   - The card rises out of the velvet and turns to face the guest: initials in foil, names, date.
4. **Hand-off.** A gentle dolly-in while the scene dissolves into the invitation's own background colour. The invitation is revealed (about 3 s in total).

**Configuration** (no new props; everything comes from the invitation)
- **Palette:**
  - `primary` gives the lacquer (three tones) and the velvet.
  - `gold` gives the foil, inlay, clasp, crest and light.
  - The table is a near-black tinted by `primary`.
- **Content:** `names.initials` (monogram), `names.title`, the first event's date and the optional `guest` name.
- **Copy:** the `liftLid` string, localised in en, hi, gu, ar, ur, he and pa.
- **To use it:** set `design.opening = 'jewellery-box'` (editor → Design → Opening, or in a theme).

**Interaction states**
- **Idle:** the prompt pulses gently.
- **Lifting:** dragging moves the lid; the prompt hides.
- **Released early:** the lid bounces back.
- **Committed:** the timeline plays.
- **Keyboard:** Enter or Space opens.
- **Skip:** the shared Skip button.
- **Reduced motion or `static` tier:** a tap or Skip fades straight to the invitation (250 ms).

**How it's built**
- About 25 CSS planes in one `preserve-3d` box. Sizes are CSS variables (`--w`, `--d`, `--h`, `--lh`) based on `cqw`, so it scales with the phone or desktop container.
- The drag and the GSAP timeline write transforms directly to the elements (`applyPose`), never through React state. GSAP preloads while the box is closed.
- Materials are layered gradients:
  - lacquer with a specular band;
  - velvet with radial falloff and grain;
  - ivory satin with sheen;
  - paper with fine grain;
  - gold foil text clipped to a gradient.
- No WebGL, no SVG filters at runtime, no images. The grain textures are tiny inline SVGs that the browser draws once.

**Performance**

| Test | Frame rate | Slow frames |
|---|---|---|
| Phone 390×844, CPU slowed 4× | about 60 fps | none |
| Desktop 2880×1800 (headless, software drawing) | about 41 fps | only in the final hand-off, when the invitation takes over behind the veil |

The desktop hand-off cost is shared by every opening and is noted for Stage 09.

**Responsive:** the box is 76% of the container width, capped at 26 rem. Names and prompt use `svh`. No sideways scroll on phone or desktop. Arabic and Urdu read right-to-left correctly; Noor was tested.

**Usage (developers)**
```tsx
// Any opening kind is just a component taking the opening contract.
<JewelleryBoxOpening onBegin={startMusic} onOpened={showInvitation} />
```

**Known improvements (next pass)**
- Floating dust motes in the light shaft.
- A hint of the hinge's metal pins.
- Velvet sheen that shifts as the lid moves.
- Optional gyroscope parallax on phones.
- The desktop hand-off cost.

# Scroll walk: a film you walk through by scrolling

How Saath Studio's "Walk" invitation (`/invites/walk-ram-mandir`) works, what the reference frames in
`references/merge-images/` are, and how Toran builds its own version (with our own films only).

## 1. What the reference folder is

`references/merge-images/` holds **186 WebP frames** (`0001.webp`…`0186.webp`) plus `darshan.webp`.

| | |
|---|---|
| Frame size | 900 × 1600 (9:16 upright) |
| Weight | 51–370 KB each, median 76 KB, **22 MB in total** |
| Content | A walk-in: the temple at night from outside, then up the lit steps, through the pillared halls, to the sanctum doors |
| `darshan.webp` | 1536 × 2752, the final reveal: the Ram Darbar deities on their throne |

The frames are a short AI video cut into stills, one image per frame.

**We never use these files.** They are Saath's work. The frames depict a real place of worship. The
final image is an AI-generated depiction of deities, which our cultural rule forbids (sacred art comes
from licensed, vetted sources only). The folder is git-ignored and stays reference-only.

## 2. How Saath uses it (read from their public page and script)

The invitation is a full-screen `<canvas>` with a **scene script** behind it:
`window.SAATH.walk.scenes`, played by one plain-JS player (`walk.js`, ~260 KB, no GSAP or Lenis).

**Scenes, in order** (each has a length in "screens" of scrolling):

| Scene | Type | What it does |
|---|---|---|
| arrival | `still` | One painted still. The camera slowly moves from a framing box to another (Ken Burns) while the names fade in over the sky |
| temple | `film` | The frame sequence (`film-a2.json`). Scrolling scrubs it. The story text appears between 7.2 s and 8.6 s, in a set zone of the frame |
| sanctum | `still` | The camera pushes into the doors. The blessing shows over a dark veil, and the exit is a **zoom through a portal** (the door opening) into the next scene |
| darshan | `still` | The deity image, marked `blessing: true` |
| rooms | `room` | One painted arch "room" per ceremony (haldi, mehendi, sangeet…), each with its art, wall colour and accent |
| saryu | `film` | A second sequence by the river. The venue appears, then the RSVP |

**The frame manifest** (`film-a2.json`):

```json
{ "fps": 12, "count": 187, "width": 900, "height": 1600, "dir": "film-a2/", "ext": "webp",
  "duration": 15.625, "cuts": [0, 7.833, 15.625], "bytes": 14987816, "crop": [76, 0, 928, 1649] }
```

So the film runs at 12 fps, is 15.6 s long and weighs 15 MB. It is two AI clips joined: one cut at 7.8 s.

**How it plays**
- **Scroll is the timeline.** `secondsPerScreen` (5.2 for the temple film) sets how much film one
  screen of scrolling moves. Text blocks have an `at: [start, end]` window in film seconds and a
  `zone` box in frame fractions, so words land on calm ground in the picture.
- **Rests and settling.** When the guest stops scrolling, the player eases to the nearest rest point
  (`settleSoon`). A film can also "run on its own clock" while it sits on a rest, so the page never
  freezes on a dead frame.
- **Loading.** Frames load as separate images, 4 at a time, decoded off the main thread (`img.decode()`).
  Frames far from the current position are freed to save memory. On Save-Data or 2G
  connections it loads every other frame and blends between them, for half the bytes.
- **Tap to begin.** The first tap starts the music and the walk, and only real input releases the
  films (a scroll alone doesn't), so a restored page doesn't jump.
- **Chrome around it.**
  - A top bar (monogram, language, sound, "Details").
  - A bottom bar with the current chapter name, a **Next** button and a progress track with a tick per chapter.
  - "Skip the walk and read the invitation", which opens the full details as a sheet.
  - A tiny 24×42 blurred canvas behind the stage fills the sides on wide screens.
- **Video for WhatsApp.** They also sell an mp4 render of the same walk for sharing.

## 3. What Toran already has, and the gap

The **film behind the invitation**, now being built, is the same idea and is the foundation for this:

- the film behind the page, scrubbed by scroll (frames on a canvas, not `<video>`);
- **any library section** shown over a held moment (the `filmAt` per section), which is more flexible than
  Saath's fixed text blocks;
- frames in sprite sheets (540×960, 15 fps, about 3 MB for 9 s), smaller than their 15 MB.

What the walk adds on top:

| Walk feature | Toran today | To build |
|---|---|---|
| Several scenes in a row (still, film, film) | One film | A **scene list**: each scene is a film or a still, with its own frames |
| Camera move on stills (Ken Burns) | None | `camera: {from, to}` boxes, drawn on the same canvas |
| Portal zoom between scenes (through a door) | Cut only | `exit: zoom` into a box, plus fade and cut |
| Text placed in a zone of the frame at a moment | Sections scroll over a held frame | Keep sections, and add **"moment text"**: short lines (kicker, story line) pinned to a zone and a time window |
| Rest settling | None | Ease to the nearest chapter moment when scrolling stops (only with a light touch, never fighting the guest) |
| Chapter bar (name, Next, progress ticks) | None | A small bar over the stage for walk templates |
| Skip to the invitation | — | "Read the invitation" opens the normal sections |
| Ceremony rooms | Pavilions section | A `room` scene that reuses our pavilion paintings |
| mp4 for WhatsApp | Film opening mp4 | Render the walk to mp4 with the same Playwright + ffmpeg tooling |

## 4. Plan

**Stage 1, finish the film behind the invitation** (done, 2026-11-18)
- FilmStage canvas, travel between moments, film scene, the editor's Film moment control, the
  Deepmala Yatra template on our 9 s film.

**Stage 2, scenes** (done, 2026-11-19: Deepmala Yatra flies through the haveli door into the mandap courtyard)
- `design.film.scenes[]`: each scene is `{ kind: 'film' | 'still', frames | image, camera?, exit? }`.
  The stage plays them end to end on one timeline, so `filmAt` still works across scenes.
- Camera boxes for stills, zoom-portal and fade exits.
- The editor gets a scene list (add a film or a still, reorder, set the exit) in the Film panel.

**Stage 3, the walk feel** (done, 2026-11-19: words on the film, chapter bar, "Read the invitation", lighter loading on Data Saver or 2G, and opt-in settling, off by default)
- **Moment text**: short lines with a zone and a time window, placed in the editor by dragging a box over the frame.
- Gentle rest settling, a chapter bar with Next and progress ticks, and "Read the invitation".
- Lean loading: skip every other frame on Save-Data or 2G, and free far frames.

**Stage 4, our own walk films** (first one done, 2026-11-19: the **Haveli Walk** template, `/demo-haveli-walk`)
- An illustrated 20 s walk (`scripts/dev/films/haveli-walk/scene.html`): by boat to the ghats as the diyas
  light, fireworks over the haveli, up the steps, through the gate into a corridor of arches whose lamps
  light ahead, and into the mandap court. Painted cards in depth seen through one moving camera.
- Six chapters (3.6, 6.0, 9.6, 12.4, 15.2, 19.8 s) and five lines of words between them.
- Frames: 27 sheets at 12 fps, 8.4 MB (`render.mjs haveli-walk --frames --fps 12 --quality 0.72`);
  a light 720p mp4 for the studio preview, 3.1 MB (`--width 720 --crf 28`).
- Second walk done the same day: the **Palace Walk** (`/demo-palace-walk`). A lamp-lit road at dusk, the
  gate's studded doors swinging open, a pink courtyard of fountains, a hall of mirror mosaic that glints
  as the guest moves, and a marble terrace with fireworks over the city. 6.45 MB of frames, 2.75 MB mp4.
- Third walk, the same day: the **Garden Walk** (`/demo-garden-walk`), for any tradition (no sacred
  symbols; universal culture, its own demo wedding). Golden hour to blue hour: a lavender path to a rose
  archway, fairy lights through an avenue, a rose tunnel, a pool of floating candles, an aisle to a
  flower moon-gate by the lake. 6.18 MB of frames, 2.93 MB mp4.
- The walks share `scripts/dev/films/walk-kit.js` (camera path, cards, walls, lamps, arches) and one
  layout (`walkLayout`; the garden holds the invitation card where the others hold the blessing).
- Studio: **Library → Films** shows every film template; scroll the preview to walk through it.

Every film is our own original. Two ways to make them:
1. **AI video from our own prompts** (Veo, Kling, Runway): 2–4 clips of 6–8 s, chained by first-frame
   and last-frame so they join cleanly. Use invented, temple-inspired or palace architecture,
   **never a recognisable real temple**, and never deities. Cut the frames with
   `ffmpeg -i walk.mp4 -vf "fps=15,scale=540:-2" frames/%04d.webp`, then pack them into sheets
   (the render script will do both).
2. **Our illustrated scenes** (like the Deepmala film): fully owned, small, and re-renderable with
   new colours per template.

Ideas for first walks:
- **Haveli walk**: river ghats, then the gate, the courtyard of lamps and the mandap.
- **Palace walk**: Rajasthani gates, then the mirror hall and the terrace under the stars.
- **Garden walk**: for Christian, secular and Jain weddings.

**Sacred moment.** A "darshan" scene shows only licensed, vetted art chosen by the family (Ganesh,
Ram Darbar, Ik Onkar…), never AI-generated, with no zoom or effect over the deity itself.

## 5. Budgets (phones first)

| | Target |
|---|---|
| Frames per film | 15 fps, 540×960 WebP in 3×3 sheets |
| Weight | ≤ 4 MB per 10 s of film, and the first screen paints from one still |
| Memory | At most 3 decoded sheets at a time |
| Scroll | 60 fps on a mid-range Android, with no long tasks over 50 ms |
| Fallback | Low-power, reduced motion or 2G: stills at each moment with a soft fade |

## 6. Decisions

Made on 2026-11-19:
1. **Moment text**: built (Film panel, "Words on the film").
2. **Rest settling**: built, but off by default; a template can switch it on.
3. **Read the invitation**: a button under the chapter pill folds the walk away; the film rests, dimmed,
   on its last moment, and "Back to the film" returns. The guest keeps their place both ways.

4. **First walk films**: the illustrated haveli, palace and garden walks (done).

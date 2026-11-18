# Deepmala: the opening film brief

The Film opening plays one short upright clip: it waits on the first frame, a tap plays it, the
couple's names rise into the sky at its brightest moment, and it comes to rest on its last frame,
which becomes the cover. This brief is for making that clip with an AI video tool (Veo, Kling,
Runway, Sora, Luma, or similar). It must be **our own original**: never upload, trace or
"image-to-video" another studio's film or stills, and never name a studio or a real copyrighted
work in a prompt.

## What the clip has to do

| Beat | Time | What happens |
|---|---|---|
| Rest | 0.0 – 1.0 s | Dusk-blue night, almost still. Everything unlit. This frame is what guests see before they tap |
| Kindle | 1.0 – 4.0 s | Diyas light one after another down the river steps, warm light spreading towards the building |
| Bloom | 4.0 – 5.5 s | **The big moment**: the building's outline lights all at once. The names rise here (set "Names rise at" to about 4.6 s) |
| Settle | 5.5 – 8.0 s | A slow push-in eases to a stop. Reflections shimmer on the water |
| Hold | 8.0 – 9.0 s | Almost still. This last frame becomes the cover, so it must look like a finished painting |

**The top 35% of the frame stays empty sky** in every beat: the names, the kicker and the date sit
there. No moon, birds, fireworks or lanterns crossing that area.

## Specs

- **Upright 9:16**, 1080 × 1920 (720 × 1280 is fine). Frame rate 24 or 30.
- **8–10 seconds.** Silent: no audio track needed (the invitation's music plays separately).
- **Camera:** one slow, steady push-in or gentle rise. No cuts, no shake, no fast moves, no zoom pumping.
- **No text, logos, watermarks or people's faces.** Small distant figures are fine.
- **Final file:** H.264 MP4 under 4 MB (the uploader allows up to 12 MB, but small files open faster on phones).

## The style line

Start every prompt with this so takes look like one film:

> Cinematic vertical 9:16 night scene, photoreal with a painterly warm glow, deep navy blue sky
> with soft gradient to indigo, thousands of small clay diya oil lamps with warm amber flames,
> golden light reflected on still dark water, gentle film grain, shallow haze, slow steady camera,
> no people in foreground, no text, no watermark.

## Prompts

### Main: Ghats of a thousand lamps (recommended)

Use this one for Deepmala.

> [style line] A grand riverside haveli with sandstone domes, chhatris and arched jharokha windows
> stands on wide stone steps (ghats) leading down to a calm river. The top third of the frame is
> open empty night sky. It begins dark and still, everything unlit, deep blue dusk. Then small clay
> diyas light one after another down the steps, a wave of warm amber light rising towards the
> building. At the halfway point the whole building's outline glows gold at once, every window
> lit, the reflections blooming across the water. The camera pushes in slowly and comes to rest.
> The last second is almost completely still.

### Alternate A: Palace courtyard

> [style line] Looking down the length of a long reflecting pool in a Rajasthani palace courtyard,
> marigold torans on every arch, rows of diyas along both edges of the water. The top third is open
> night sky above the palace. It begins unlit and blue. Lamps catch along the pool from the camera
> towards the palace, then the palace facade lights up all at once in warm gold. The camera
> glides forward slowly and settles. The final second is still.

### Alternate B: Floating lamps

> [style line] A wide calm river at dusk with an old stone ghat and a small pavilion with a domed
> roof on the far bank. The top third is open night sky. Hundreds of leaf-boat diyas drift slowly
> towards the camera, their flames reflected. At the halfway point the pavilion and the whole far
> bank light up warm gold in one breath. The camera rises gently and stops. The final second is
> still.

### If the tool takes a negative prompt

> text, letters, watermark, logo, faces, close-up people, deity, idol, religious figure, fireworks,
> birds, moon in the upper frame, camera shake, fast motion, cuts, zoom, cartoon, oversaturated
> purple, neon, lens flare streaks

### Cultural care

- Keep the architecture **temple-inspired or palace-like, not a recognisable real temple**: real
  shrines (the Ram Mandir, the Golden Temple and others) are places of worship and their likeness
  can feel like misuse in a commercial product.
- **No deities or idols in the film.** Sacred art belongs in the blessing arch, from licensed and
  vetted art only.
- Fire stays calm: lamps, never flames that spread or burn things.

## Getting a good take

1. **Generate the two stills first** (with an image model, from the same prompt): the dark first
   frame and the lit last frame. Pick the pair you like.
2. **Animate between them** with the tool's first-frame and last-frame option, using the prompt
   above. This gives far more control over the "lights up" moment than text alone.
3. Make 4–6 takes and pick the one with the **cleanest sky** and the most **obvious bloom moment**.
4. If the last second isn't still enough, hold the final frame for a second when compressing (below).

## Trim, hold and compress

With [ffmpeg](https://ffmpeg.org) installed, this keeps the first 8 s, holds the last frame for one
more second, sizes it to 1080 × 1920, removes audio and compresses for phones:

```sh
ffmpeg -i take.mp4 -t 8 \
  -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,tpad=stop_mode=clone:stop_duration=1" \
  -an -c:v libx264 -profile:v high -pix_fmt yuv420p -crf 26 -preset slow -movflags +faststart \
  deepmala-film.mp4
```

If the file is over 4 MB, raise `-crf` to 28; if it looks soft, lower it to 24.

## Upload and check

1. Open the Deepmala template in the visual editor: **Design → Opening → Film → Upload film**.
2. The first and last frames are captured for you. Move **Names rise at** onto the bloom (about 4.6 s)
   and watch the preview.
3. Save, then open `/demo-deepmala` on a real phone and check:
   - the names never sit on top of the building;
   - the hand-off from the film to the cover is invisible;
   - it plays in WhatsApp's in-app browser and in iPhone low-power mode (it shows the still with the
     names if a phone refuses to play).

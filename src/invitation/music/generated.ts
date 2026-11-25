// Generated background music: an instrumental played live with Web Audio from the invitation's
// seed, so every couple's tune is their own and there is no file to license or download.
// Each style pairs a raga or scale with instruments synthesised from oscillators and noise.
import { rng } from '@shared/generative';
import type { MusicStyle } from '@shared/music';

import type { MusicPlayer } from './player';

type Instrument = 'reed' | 'santoor' | 'bell' | 'piano' | 'oud' | 'softBell';

interface StyleRecipe {
    /** Semitones above the tonic (Sa). */
    scale: number[];
    lead: Instrument;
    /** Beat length in seconds. */
    beat: number;
    tanpura: boolean;
    pad: boolean;
    /** How often the lead rests instead of playing (0–1). */
    rest: number;
}

const recipes: Record<MusicStyle, StyleRecipe> = {
    // Raag Yaman: Ni Re Ga Ma# Dha — evening, auspicious.
    shehnai: {
        scale: [0, 2, 4, 6, 7, 9, 11],
        lead: 'reed',
        beat: 0.62,
        tanpura: true,
        pad: false,
        rest: 0.18,
    },
    // Raag Bhupali: the pentatonic Sa Re Ga Pa Dha.
    santoor: {
        scale: [0, 2, 4, 7, 9],
        lead: 'santoor',
        beat: 0.34,
        tanpura: true,
        pad: false,
        rest: 0.12,
    },
    bells: {
        scale: [0, 2, 4, 7, 9],
        lead: 'bell',
        beat: 1.3,
        tanpura: true,
        pad: true,
        rest: 0.4,
    },
    piano: {
        scale: [0, 2, 4, 7, 9, 11],
        lead: 'piano',
        beat: 0.55,
        tanpura: false,
        pad: true,
        rest: 0.2,
    },
    // Maqam Hijaz: the augmented second between the 2nd and 3rd.
    oud: {
        scale: [0, 1, 4, 5, 7, 8, 10],
        lead: 'oud',
        beat: 0.42,
        tanpura: false,
        pad: true,
        rest: 0.22,
    },
    ambient: {
        scale: [0, 3, 5, 7, 10],
        lead: 'softBell',
        beat: 2.2,
        tanpura: false,
        pad: true,
        rest: 0.45,
    },
};

const hz = (tonic: number, semitones: number) => tonic * 2 ** (semitones / 12);

// A decaying-noise impulse: a warm hall without loading a sample.
function reverbImpulse(ctx: BaseAudioContext, seconds: number): AudioBuffer {
    const length = Math.floor(ctx.sampleRate * seconds);
    const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
        const data = buffer.getChannelData(ch);
        for (let i = 0; i < length; i++)
            data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** 2.6;
    }
    return buffer;
}

// A melody: a seeded walk along the scale that prefers steps, phrased A A' B A and always
// coming home to Sa (or Pa) at a phrase end.
function compose(seed: number, recipe: StyleRecipe): (number | null)[] {
    const r = rng(seed);
    const span = recipe.scale.length * 2;
    const degreeToSemis = (d: number) => {
        const octave = Math.floor(d / recipe.scale.length);
        const step =
            recipe.scale[((d % recipe.scale.length) + recipe.scale.length) % recipe.scale.length] ??
            0;
        return octave * 12 + step;
    };
    const phrase = (start: number): (number | null)[] => {
        const out: (number | null)[] = [];
        let d = start;
        for (let i = 0; i < 8; i++) {
            if (i > 0 && i < 7 && r.next() < recipe.rest) {
                out.push(null);
                continue;
            }
            const move = r.pick([-2, -1, -1, 1, 1, 2, 0, 3]);
            d = Math.max(0, Math.min(span, d + move));
            out.push(degreeToSemis(d));
        }
        // Resolve: the phrase ends on Sa or Pa.
        out[7] = degreeToSemis(
            r.next() > 0.5
                ? recipe.scale.length
                : recipe.scale.indexOf(7) >= 0
                  ? recipe.scale.indexOf(7)
                  : 0,
        );
        return out;
    };
    const a = phrase(recipe.scale.length);
    const variant = a.map((n, i) =>
        n !== null && i > 2 && i < 6 && r.next() > 0.6 ? n + (r.next() > 0.5 ? 2 : -1) : n,
    );
    const b = phrase(recipe.scale.length + 2);
    return [...a, ...variant, ...b, ...a];
}

class Engine {
    private ctx: BaseAudioContext | null = null;
    private live: AudioContext | null = null;
    private master: GainNode | null = null;
    private wet: GainNode | null = null;
    private timer: ReturnType<typeof setInterval> | undefined;
    private next = 0;
    private step = 0;
    private droneStep = 0;
    private nextDrone = 0;
    private readonly melody: (number | null)[];
    private readonly tonic: number;
    private readonly recipe: StyleRecipe;
    private readonly listeners = new Set<() => void>();
    playing = false;

    constructor(style: MusicStyle, seed: number) {
        this.recipe = recipes[style];
        this.melody = compose(seed, this.recipe);
        // Sa lands between C# and E, chosen by the seed, so neighbouring invitations differ in key too.
        this.tonic = hz(138.59, rng(seed + 7).int(0, 3));
    }

    private boot(): AudioContext {
        if (this.live) return this.live;
        const ctx = new AudioContext();
        this.wire(ctx, ctx.destination);
        this.live = ctx;
        return ctx;
    }

    private wire(ctx: BaseAudioContext, destination: AudioNode) {
        const master = ctx.createGain();
        master.gain.value = 0;
        const compressor = ctx.createDynamicsCompressor();
        compressor.threshold.value = -18;
        compressor.ratio.value = 3;
        const reverb = ctx.createConvolver();
        reverb.buffer = reverbImpulse(ctx, 3.2);
        const wet = ctx.createGain();
        wet.gain.value = 0.42;
        master.connect(compressor);
        wet.connect(reverb);
        reverb.connect(compressor);
        compressor.connect(destination);
        this.ctx = ctx;
        this.master = master;
        this.wet = wet;
    }

    // Every voice goes to the dry master and, a little quieter, into the reverb.
    private out(node: AudioNode) {
        if (this.master) node.connect(this.master);
        if (this.wet) node.connect(this.wet);
    }

    private voice(
        type: OscillatorType,
        freq: number,
        at: number,
        peak: number,
        attack: number,
        decay: number,
        detune = 0,
    ) {
        const ctx = this.ctx;
        if (!ctx) return null;
        const osc = ctx.createOscillator();
        osc.type = type;
        osc.frequency.value = freq;
        osc.detune.value = detune;
        const amp = ctx.createGain();
        amp.gain.setValueAtTime(0, at);
        amp.gain.linearRampToValueAtTime(peak, at + attack);
        amp.gain.exponentialRampToValueAtTime(0.0001, at + attack + decay);
        osc.connect(amp);
        this.out(amp);
        osc.start(at);
        osc.stop(at + attack + decay + 0.05);
        return {
            osc,
            amp,
        };
    }

    private play(instrument: Instrument, freq: number, at: number, length: number) {
        const ctx = this.ctx;
        if (!ctx) return;
        switch (instrument) {
            case 'reed': {
                // Shehnai: a bright reed through a nasal band-pass, with vibrato and a glide (meend).
                const osc = ctx.createOscillator();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(freq * 0.985, at);
                osc.frequency.exponentialRampToValueAtTime(freq, at + 0.09);
                const vibrato = ctx.createOscillator();
                vibrato.frequency.value = 5.4;
                const depth = ctx.createGain();
                depth.gain.value = freq * 0.006;
                vibrato.connect(depth).connect(osc.frequency);
                const band = ctx.createBiquadFilter();
                band.type = 'bandpass';
                band.frequency.value = 1300;
                band.Q.value = 1.4;
                const amp = ctx.createGain();
                amp.gain.setValueAtTime(0, at);
                amp.gain.linearRampToValueAtTime(0.12, at + 0.06);
                amp.gain.setTargetAtTime(0.0001, at + length * 0.9, 0.08);
                osc.connect(band).connect(amp);
                this.out(amp);
                osc.start(at);
                vibrato.start(at);
                osc.stop(at + length + 0.4);
                vibrato.stop(at + length + 0.4);
                break;
            }
            case 'santoor': {
                // Hammered strings: two quick strikes, the second softer, slightly detuned pairs.
                for (const [offset, level] of [
                    [0, 0.11],
                    [0.06, 0.05],
                ] as const) {
                    this.voice('triangle', freq * 2, at + offset, level, 0.004, 1.1, -4);
                    this.voice('sine', freq * 4, at + offset, level * 0.3, 0.003, 0.5, 5);
                }
                break;
            }
            case 'bell':
            case 'softBell': {
                // Inharmonic partials ring the way metal does.
                const level = instrument === 'bell' ? 0.07 : 0.035;
                [1, 2.76, 5.4, 8.93].forEach((ratio, i) => {
                    this.voice(
                        'sine',
                        freq * 2 * ratio,
                        at,
                        level / (i + 1),
                        0.005,
                        instrument === 'bell' ? 4.5 - i : 6 - i,
                    );
                });
                break;
            }
            case 'piano':
                this.voice('sine', freq * 2, at, 0.12, 0.006, 2.4);
                this.voice('triangle', freq * 4, at, 0.025, 0.004, 0.9);
                break;
            case 'oud': {
                // A plucked, slightly buzzy string that bends into the note.
                const pluck = this.voice('sawtooth', freq * 2, at, 0.05, 0.004, 0.9);
                if (pluck) {
                    pluck.osc.frequency.setValueAtTime(freq * 2 * 0.97, at);
                    pluck.osc.frequency.exponentialRampToValueAtTime(freq * 2, at + 0.05);
                }
                this.voice('triangle', freq * 2, at, 0.08, 0.004, 1.2);
                break;
            }
        }
    }

    // Tanpura: Pa, Sa', Sa', Sa — plucked in a slow cycle, long and buzzy.
    private drone(at: number) {
        const cycle = [7, 12, 12, 0];
        const semis = cycle[this.droneStep % cycle.length] ?? 0;
        this.droneStep++;
        const freq = hz(this.tonic / 2, semis);
        this.voice('sawtooth', freq, at, 0.03, 0.02, 3.6);
        this.voice('sine', freq, at, 0.05, 0.02, 3.8);
    }

    private pad(at: number) {
        const seconds = this.recipe.beat * 16;
        for (const semis of [0, 7, 12]) {
            this.voice(
                'sine',
                hz(this.tonic, semis),
                at,
                0.025,
                seconds * 0.4,
                seconds * 0.8,
                semis === 7 ? 6 : -4,
            );
        }
    }

    // A short look-ahead scheduler: notes are placed a fraction of a second ahead of the clock.
    private schedule = (until?: number) => {
        const ctx = this.ctx;
        if (!ctx) return;
        const horizon = until ?? ctx.currentTime + 0.35;
        while (this.next < horizon) {
            const note = this.melody[this.step % this.melody.length];
            if (note !== null && note !== undefined)
                this.play(this.recipe.lead, hz(this.tonic, note), this.next, this.recipe.beat);
            if (this.step % 16 === 0 && this.recipe.pad) this.pad(this.next);
            this.step++;
            this.next += this.recipe.beat;
        }
        if (this.recipe.tanpura) {
            while (this.nextDrone < horizon) {
                this.drone(this.nextDrone);
                this.nextDrone += 1.05;
            }
        }
    };

    async start() {
        const ctx = this.boot();
        await ctx.resume();
        const now = ctx.currentTime;
        this.master?.gain.cancelScheduledValues(now);
        this.master?.gain.setTargetAtTime(0.55, now, 1.2);
        this.next = Math.max(this.next, now + 0.1);
        this.nextDrone = Math.max(this.nextDrone, now + 0.05);
        clearInterval(this.timer);
        this.timer = setInterval(() => {
            this.schedule();
        }, 60);
        this.schedule();
        this.set(true);
    }

    // The whole stretch at once, for a video: from its first second at full voice.
    render(ctx: OfflineAudioContext, destination: AudioNode, seconds: number) {
        this.wire(ctx, destination);
        if (this.master) this.master.gain.value = 0.55;
        this.schedule(seconds);
    }

    stop() {
        const ctx = this.live;
        clearInterval(this.timer);
        if (ctx && this.master) {
            // Fade out rather than cut, then suspend so no notes keep ringing.
            this.master.gain.setTargetAtTime(0, ctx.currentTime, 0.25);
            setTimeout(() => void ctx.suspend(), 900);
        }
        this.set(false);
    }

    dispose() {
        clearInterval(this.timer);
        void this.live?.close();
        this.live = null;
        this.ctx = null;
        this.listeners.clear();
    }

    private set(playing: boolean) {
        this.playing = playing;
        for (const fn of this.listeners) fn();
    }

    subscribe(fn: () => void) {
        this.listeners.add(fn);
        return () => {
            this.listeners.delete(fn);
        };
    }
}

export function scheduleGenerated(
    ctx: OfflineAudioContext,
    destination: AudioNode,
    style: MusicStyle,
    seed: number,
    seconds: number,
) {
    new Engine(style, seed).render(ctx, destination, seconds);
}

export function generatedPlayer(style: MusicStyle, seed: number): MusicPlayer {
    const engine = new Engine(style, seed);
    return {
        play: () => engine.start(),
        pause: () => {
            engine.stop();
        },
        get playing() {
            return engine.playing;
        },
        subscribe: (fn) => engine.subscribe(fn),
        dispose: () => {
            engine.dispose();
        },
    };
}

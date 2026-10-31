import { signal } from "@preact/signals";

/**
 * Sound effects (platform/docs/sound.md): short sounds at moments, apart from lines. They play at
 * once, overlap one another, are never waited for, and are muted on their own. A repeat of the same
 * effect replaces itself (steps in quick succession don't pile up).
 *
 * Each is a small recipe the browser plays (Web Audio): nothing to store or license. A recipe can
 * be replaced by a recorded file under the same name; lessons and props name effects, never sounds.
 */

import { Effect } from "@chalk/content";

/** One tone of a recipe: a wave from one pitch to another, starting `at` seconds in. */
type Tone = {
  wave: OscillatorType | "noise";
  from: number;
  to?: number;
  at?: number;
  seconds: number;
  volume: number;
};

const RECIPES: Readonly<Record<Effect, readonly Tone[]>> = {
  [Effect.Step]: [{ wave: "noise", from: 1400, seconds: 0.05, volume: 0.25 }],
  [Effect.Tap]: [{ wave: "sine", from: 900, seconds: 0.05, volume: 0.2 }],
  [Effect.Correct]: [
    { wave: "sine", from: 660, seconds: 0.09, volume: 0.25 },
    { wave: "sine", from: 990, at: 0.09, seconds: 0.14, volume: 0.25 },
  ],
  [Effect.Wrong]: [{ wave: "triangle", from: 220, to: 170, seconds: 0.22, volume: 0.25 }],
  [Effect.Rise]: [{ wave: "sine", from: 300, to: 700, seconds: 0.35, volume: 0.18 }],
};

const MUTED_KEY = "chalk.isEffectsMuted";
const remembered = (): boolean => {
  try {
    return localStorage.getItem(MUTED_KEY) === "1";
  } catch {
    return false;
  }
};

/** Whether effects are off, for every board until turned on again (kept on this device). */
export const isEffectsMuted = signal(remembered());

export function setEffectsMuted(isOn: boolean): void {
  isEffectsMuted.value = isOn;
  try {
    localStorage.setItem(MUTED_KEY, isOn ? "1" : "0");
  } catch {}
}

let context: AudioContext | undefined;
/** The sounds playing, by effect: a repeat stops the one before. */
const playing = new Map<Effect, () => void>();

/** Plays an effect now (nothing when effects are muted, or the browser has no audio). */
export function playEffect(effect: Effect): void {
  if (isEffectsMuted.peek() || typeof AudioContext === "undefined") return;
  context ??= new AudioContext();
  const audio = context;
  if (audio.state === "suspended") void audio.resume().catch(() => undefined);
  playing.get(effect)?.();
  const now = audio.currentTime;
  const stops = RECIPES[effect].map((tone) => {
    const start = now + (tone.at ?? 0);
    const end = start + tone.seconds;
    const gain = audio.createGain();
    // A quick rise and a fall to silence: no clicks at either end.
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(tone.volume, start + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, end);
    gain.connect(audio.destination);
    const source = tone.wave === "noise" ? noise(audio, tone.from) : audio.createOscillator();
    if (source instanceof OscillatorNode) {
      source.type = tone.wave as OscillatorType;
      source.frequency.setValueAtTime(tone.from, start);
      if (tone.to !== undefined) source.frequency.exponentialRampToValueAtTime(tone.to, end);
      source.connect(gain);
    } else source.connect(gain);
    const node = source instanceof OscillatorNode ? source : source.input;
    node.start(start);
    node.stop(end);
    return () => {
      try {
        node.stop();
      } catch {}
    };
  });
  playing.set(effect, () => {
    for (const stop of stops) stop();
  });
}

/** A short burst of noise, shaped around `pitch` (a step, a tick). */
function noise(audio: AudioContext, pitch: number): { input: AudioBufferSourceNode } & AudioNode {
  const buffer = audio.createBuffer(1, Math.ceil(audio.sampleRate * 0.2), audio.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const input = audio.createBufferSource();
  input.buffer = buffer;
  const filter = audio.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = pitch;
  input.connect(filter);
  return Object.assign(filter, { input });
}

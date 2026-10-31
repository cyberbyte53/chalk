import { signal } from "@preact/signals";

/**
 * Sound effects (platform/docs/sound.md): short sounds at moments, apart from lines. They play at
 * once, overlap one another, are never waited for, and are muted on their own. A repeat of the same
 * effect replaces itself (steps in quick succession don't pile up).
 *
 * Each is a recording that ships with the code that uses it (a package's sounds/, with SOURCES.md):
 * its sound view names it (content's `effect`), and this plays whatever it points at.
 */

import type { Effect } from "@chalk/content";

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
/** Each recording, by its address: loading, decoded, or missing (null). */
const sounds = new Map<string, Promise<AudioBuffer | null>>();
/** The sounds playing, by effect: a repeat stops the one before. */
const playing = new Map<string, () => void>();

/** A recording, fetched and decoded once. */
function load(audio: AudioContext, url: string): Promise<AudioBuffer | null> {
  const known = sounds.get(url);
  if (known !== undefined) return known;
  const loading = fetch(url)
    .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(String(r.status)))))
    .then((bytes) => audio.decodeAudioData(bytes))
    .catch(() => null);
  sounds.set(url, loading);
  return loading;
}

/**
 * The browser lets a page make sound only after the student has touched it. The audio starts on
 * the first touch or key; until then effects are dropped, never saved up (an effect is a moment:
 * one that couldn't sound then is old news later).
 */
function unlock(): void {
  context ??= new AudioContext();
  if (context.state === "suspended") void context.resume().catch(() => undefined);
}
if (typeof window !== "undefined" && typeof AudioContext !== "undefined") {
  window.addEventListener("pointerdown", unlock, { capture: true, passive: true });
  window.addEventListener("keydown", unlock, { capture: true });
}

/** How loud effects play, under the voice. */
const VOLUME = 0.8;
/** How late a sound may still start, the first time it is fetched: later, its moment has passed. */
const LATE = 0.25;

/**
 * Plays an effect now: nothing when effects are muted or the page can't sound yet. Its recording is
 * fetched the first time it is needed (it ships with the code that uses it) and kept.
 */
export function playEffect(effect: Effect): void {
  const audio = context;
  if (isEffectsMuted.peek() || audio === undefined || audio.state !== "running") return;
  const asked = audio.currentTime;
  void load(audio, effect.url).then((buffer) => {
    if (buffer === null || audio.currentTime - asked > LATE) return;
    playing.get(effect.name)?.();
    const gain = audio.createGain();
    gain.gain.value = VOLUME;
    gain.connect(audio.destination);
    const source = audio.createBufferSource();
    source.buffer = buffer;
    source.connect(gain);
    source.start();
    // Stopped early (a repeat): a short fade, never a click.
    playing.set(effect.name, () => {
      const at = audio.currentTime;
      gain.gain.setValueAtTime(gain.gain.value, at);
      gain.gain.linearRampToValueAtTime(0, at + 0.02);
      source.stop(at + 0.02);
    });
  });
}

import type { Effect } from "@chalk/content";
import { type Signal, signal } from "@preact/signals";

/**
 * The sound engine (platform/docs/sound.md): one for every clip a board plays, voiced or chosen,
 * on every screen. One audio context, so the browser's first-touch rule is met once: a page can't
 * sound until it is touched, and from then on everything may. Clips are fetched whole and decoded
 * once (a chapter's download keeps them: they play offline). Two channels, each with its switch:
 * the voice (words) and sounds.
 */

export type Channel = "voice" | "sounds";

/** What became of a clip: heard, refused until the page's first touch, or broken (it didn't load). */
export type Played = "heard" | "blocked" | "broken";

const MUTED_KEYS: Readonly<Record<Channel, string>> = {
  voice: "chalk.isMuted",
  sounds: "chalk.isEffectsMuted",
};
const remembered = (channel: Channel): boolean => {
  try {
    return localStorage.getItem(MUTED_KEYS[channel]) === "1";
  } catch {
    return false;
  }
};

/** Whether each channel is off, for every board until turned on again (kept on this device). */
export const isMuted: Readonly<Record<Channel, Signal<boolean>>> = {
  voice: signal(remembered("voice")),
  sounds: signal(remembered("sounds")),
};

export function setMuted(channel: Channel, isOn: boolean): void {
  isMuted[channel].value = isOn;
  try {
    localStorage.setItem(MUTED_KEYS[channel], isOn ? "1" : "0");
  } catch {}
}

let context: AudioContext | undefined;
/** Whoever waits for the page to be allowed to sound. */
const waiting: (() => void)[] = [];

/**
 * The page's audio, made when first wanted. Where sound is already allowed (a lesson opened by a
 * tap, the editor's panel) it runs at once; else from the first touch. Whenever it starts running,
 * whoever waited for it goes on.
 */
const audioContext = (): AudioContext => {
  if (context === undefined) {
    const audio = new AudioContext();
    audio.addEventListener("statechange", () => {
      if (audio.state === "running") for (const go of waiting.splice(0)) go();
    });
    context = audio;
  }
  return context;
};

/** Whether the page may sound now. */
const isAudible = (): boolean => audioContext().state === "running";

/** On a touch or key, the audio is asked to start (the browser allows it from the first one). */
function unlock(): void {
  const audio = audioContext();
  if (audio.state !== "running") void audio.resume().catch(() => undefined);
}
if (typeof window !== "undefined" && typeof AudioContext !== "undefined") {
  window.addEventListener("pointerdown", unlock, { capture: true, passive: true });
  window.addEventListener("keydown", unlock, { capture: true });
}

/** Resolves once the page may sound (now, if it already may). Never, without Web Audio. */
export function whenAudible(): Promise<void> {
  if (isAudible()) return Promise.resolve();
  return new Promise((resolve) => waiting.push(resolve));
}

/** Each clip, by its address: fetched whole and decoded once; null when it can't be. */
const clips = new Map<string, Promise<AudioBuffer | null>>();

function load(url: string): Promise<AudioBuffer | null> {
  const known = clips.get(url);
  if (known !== undefined) return known;
  const loading = fetch(url)
    .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(String(r.status)))))
    .then((bytes) => audioContext().decodeAudioData(bytes))
    .catch(() => {
      clips.delete(url);
      return null;
    });
  clips.set(url, loading);
  return loading;
}

/** A clip playing: when it is over (and how), and how to stop it. */
export type Playing = { done: Promise<Played>; stop: () => void };

/** How loud each channel plays: sounds a little under the voice. */
const VOLUME: Readonly<Record<Channel, number>> = { voice: 1, sounds: 0.8 };

/** Plays a clip on a channel, from its start. Refused (blocked) until the page may sound. */
export function playClip(url: string, channel: Channel): Playing {
  let stopNow = (): void => undefined;
  const done = new Promise<Played>((resolve) => {
    if (!isAudible()) return resolve("blocked");
    let isOver = false;
    stopNow = () => {
      isOver = true;
      resolve("heard");
    };
    void load(url).then((buffer) => {
      if (isOver) return;
      if (buffer === null) return resolve("broken");
      const audio = audioContext();
      const gain = audio.createGain();
      gain.gain.value = VOLUME[channel];
      gain.connect(audio.destination);
      const source = audio.createBufferSource();
      source.buffer = buffer;
      source.connect(gain);
      source.onended = () => resolve("heard");
      source.start();
      // Stopped early: a short fade, never a click.
      stopNow = () => {
        if (isOver) return;
        isOver = true;
        const at = audio.currentTime;
        gain.gain.setValueAtTime(gain.gain.value, at);
        gain.gain.linearRampToValueAtTime(0, at + 0.02);
        source.stop(at + 0.02);
        resolve("heard");
      };
    });
  });
  return { done, stop: () => stopNow() };
}

/** Effects playing, by name: a repeat of the same one replaces it (fast taps don't pile up). */
const playingEffects = new Map<string, Playing>();
/** How late an effect may still start, the first time it is fetched: later, its moment has passed. */
const LATE_MS = 250;

/**
 * Plays an effect alongside anything else: nothing when sounds are off, or the page can't sound yet
 * (an effect is a moment: one that couldn't sound then is old news later).
 */
export function playEffect(effect: Effect): void {
  if (isMuted.sounds.peek() || !isAudible()) return;
  const asked = Date.now();
  void load(effect.url).then((buffer) => {
    if (buffer === null || Date.now() - asked > LATE_MS) return;
    playingEffects.get(effect.name)?.stop();
    const playing = playClip(effect.url, "sounds");
    playingEffects.set(effect.name, playing);
  });
}

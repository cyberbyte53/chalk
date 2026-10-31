import type { Sound } from "@chalk/content";
import { type Signal, signal } from "@preact/signals";

/**
 * The sound engine (platform/docs/sound.md): one for every clip a board plays, voiced or chosen,
 * on every screen. One audio context, so the browser's first-touch rule is met once: a page can't
 * sound until it is touched, and from then on everything may. Clips are fetched whole and kept (a
 * chapter's download keeps them: they play offline), decoded as they play. Two channels, each with its switch:
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

/** The browser's Web Audio, if it has one (older Safari names it webkitAudioContext). */
const AudioContextClass: typeof AudioContext | undefined =
  typeof window === "undefined"
    ? undefined
    : (window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext);

let context: AudioContext | undefined;
/** Whoever waits for the page to be allowed to sound. */
const waiting: (() => void)[] = [];

/**
 * The page's audio, made when first wanted. Where sound is already allowed (a lesson opened by a
 * tap, the editor's panel) it runs at once; else from the first touch. Whenever it starts running,
 * whoever waited for it goes on.
 */
const audioContext = (): AudioContext | undefined => {
  if (context === undefined && AudioContextClass !== undefined) {
    // On iPhones: play through the ring/silent switch, as a media player does.
    const session = (navigator as Navigator & { audioSession?: { type: string } }).audioSession;
    if (session !== undefined) session.type = "playback";
    const audio = new AudioContextClass();
    audio.addEventListener("statechange", () => {
      if (audio.state === "running") for (const go of waiting.splice(0)) go();
    });
    context = audio;
  }
  return context;
};

/** Whether the page may sound now: it has Web Audio, and the browser allows it. */
export const isAudible = (): boolean => audioContext()?.state === "running";

/** On a touch or key, the audio is asked to start (the browser allows it from the first one). */
function unlock(): void {
  const audio = audioContext();
  if (audio !== undefined && audio.state !== "running") void audio.resume().catch(() => undefined);
}
if (AudioContextClass !== undefined) {
  window.addEventListener("pointerdown", unlock, { capture: true, passive: true });
  window.addEventListener("keydown", unlock, { capture: true });
}

/** Resolves once the page may sound (now, if it already may; at once without Web Audio: nothing will). */
export function whenAudible(): Promise<void> {
  if (isAudible() || AudioContextClass === undefined) return Promise.resolve();
  return new Promise((resolve) => waiting.push(resolve));
}

/**
 * Each clip, by its address: fetched whole once, kept compressed (small: decoded, a chapter's clips
 * would take hundreds of megabytes), decoded each time it plays (milliseconds). Null when it isn't
 * there or isn't audio; a network failure is tried again next time.
 */
const clips = new Map<string, Promise<ArrayBuffer | null>>();

/** Fetches a clip ahead of playing it (a line's clips, before the line starts). */
export function prepare(url: string): Promise<unknown> {
  const known = clips.get(url);
  if (known !== undefined) return known;
  const loading = fetch(url)
    .then((r) => (r.ok ? r.arrayBuffer() : null))
    .catch(() => {
      clips.delete(url);
      return null;
    });
  clips.set(url, loading);
  return loading;
}

async function load(url: string): Promise<AudioBuffer | null> {
  await prepare(url);
  const bytes = await clips.get(url);
  const audio = audioContext();
  if (bytes == null || audio === undefined) return null;
  // Decoding takes the bytes it is given: it decodes a copy, the kept clip stays.
  return audio.decodeAudioData(bytes.slice(0)).catch(() => null);
}

/** A clip playing: when it is over (and how), and how to stop it. */
export type Playing = { done: Promise<Played>; stop: () => void };

/** How loud each channel plays: sounds a little under the voice. */
const VOLUME: Readonly<Record<Channel, number>> = { voice: 1, sounds: 0.8 };

/**
 * Each channel's volume: everything on it plays through it. Muting a channel turns it to nothing,
 * and that is all muting is: what plays still plays, and ends when it ends, just not heard.
 */
const channels = new Map<Channel, GainNode>();
function channelOf(audio: AudioContext, channel: Channel): GainNode {
  const known = channels.get(channel);
  if (known !== undefined) return known;
  const gain = audio.createGain();
  gain.connect(audio.destination);
  isMuted[channel].subscribe((muted) => {
    gain.gain.value = muted ? 0 : VOLUME[channel];
  });
  channels.set(channel, gain);
  return gain;
}

/** Plays a clip on a channel, from its start (looping, seamlessly, until stopped, if it lasts). Refused (blocked) until the page may sound. */
export function playClip(url: string, channel: Channel, lasts = false): Playing {
  let stopNow = (): void => undefined;
  const done = new Promise<Played>((resolve) => {
    if (AudioContextClass === undefined) return resolve("broken");
    if (!isAudible()) return resolve("blocked");
    let isOver = false;
    stopNow = () => {
      isOver = true;
      resolve("heard");
    };
    void load(url).then((buffer) => {
      if (isOver) return;
      const audio = audioContext();
      if (buffer === null || audio === undefined) return resolve("broken");
      // Its own gain, for fading it out when stopped early; then its channel's.
      const gain = audio.createGain();
      gain.connect(channelOf(audio, channel));
      const source = audio.createBufferSource();
      source.buffer = buffer;
      source.loop = lasts;
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

/** Sounds playing, by name: a repeat of the same one replaces it (fast taps don't pile up). */
const playingSounds = new Map<string, Playing>();
/** How late a sound may still start, the first time it is fetched: later, its moment has passed. */
const LATE_MS = 250;

/** A sound playing: when it is over (heard, stopped, or never played), and how to stop it. */
export type SoundPlaying = { done: Promise<void>; stop: () => void };

/**
 * Plays a sound at once, over anything else. A moment's sound plays then or not at all (the page
 * can't sound yet: later it is old news). A sound that lasts plays from the first touch until
 * stopped.
 */
export function playSound(sound: Sound, lasts = false): SoundPlaying {
  if (lasts) return playLasting(sound);
  if (!isAudible()) return { done: Promise.resolve(), stop: () => undefined };
  const asked = Date.now();
  let isStopped = false;
  let playing: Playing | undefined;
  const done = load(sound.url).then(async (buffer) => {
    if (isStopped || buffer === null || Date.now() - asked > LATE_MS) return;
    playingSounds.get(sound.name)?.stop();
    playing = playClip(sound.url, "sounds");
    playingSounds.set(sound.name, playing);
    await playing.done;
  });
  return {
    done,
    stop: () => {
      isStopped = true;
      playing?.stop();
    },
  };
}

/** A lasting sound: looping from when the page may sound until stopped. */
function playLasting(sound: Sound): SoundPlaying {
  let isStopped = false;
  let playing: Playing | undefined;
  let ended = (): void => undefined;
  const done = new Promise<void>((resolve) => {
    ended = resolve;
  });
  void whenAudible().then(() => {
    if (!isStopped) playing = playClip(sound.url, "sounds", true);
  });
  return {
    done,
    stop: () => {
      isStopped = true;
      playing?.stop();
      ended();
    },
  };
}

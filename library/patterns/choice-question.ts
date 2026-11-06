import { type Localized, shownOf } from "@chalk/content";

/** A multiple-choice question's options, and the order they come in. */

/** One option of a multiple-choice question; a wrong one says what it shows the learner missed. */
export type Option = {
  id: string;
  label: Localized;
  /** The note a student who picks it (wrongly) gets. */
  feedback?: Localized;
  /** What the voice says for the note, when it isn't the note as shown (it has maths, a sign). */
  feedbackSays?: Localized;
};

/**
 * A question's words in every language, in one fixed order: what its options' order is seeded by,
 * so the order differs from question to question, is the same in every language, and changes only
 * when the question does.
 */
export function wordsOf(prompt: Localized): string {
  return (
    Object.keys(prompt)
      .sort()
      // As shown: marking how a bit is said doesn't reshuffle the options.
      .map((locale) => shownOf(prompt[locale as keyof Localized]))
      .join("|")
  );
}

/** A stable whole number from a string (FNV-1a), to seed `settle`. */
export function seedOf(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}

/**
 * Options shuffled the same way every build (the same seed, the same order), the answer equally
 * likely anywhere. A question's id is its params' (author/id.ts), so the order never renames it.
 *
 * mulberry32, a generator whose every output bit depends on the seed: the old linear one took its
 * index from the low bits, which barely depend on the seed, and put the first-written option (every
 * question's answer) last in nearly every 4-option question.
 */
export function settle<T>(items: readonly T[], seed: number): T[] {
  const out = [...items];
  let s = Math.trunc(seed) >>> 0;
  const next = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [out[i], out[j]] = [out[j] as T, out[i] as T];
  }
  return out;
}

/** A wrong option: what it reads, and what it shows the learner missed. */
export type Wrong = { label: Localized; feedback?: Localized };

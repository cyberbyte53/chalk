import type { Localized } from "@chalk/content";

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
  return Object.keys(prompt)
    .sort()
    .map((locale) => prompt[locale as keyof Localized])
    .join("|");
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

/** Options shuffled the same way every build (so a question's id never changes), answer anywhere. */
export function settle<T>(items: readonly T[], seed: number): T[] {
  const out = [...items];
  // A negative seed (from signed coefficients) would make a negative index; positive seeds shuffle
  // exactly as before.
  let s = Math.abs(Math.trunc(seed));
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) % 2147483648;
    const j = s % (i + 1);
    [out[i], out[j]] = [out[j] as T, out[i] as T];
  }
  return out;
}

/** A wrong option: what it reads, and what it shows the learner missed. */
export type Wrong = { label: Localized; feedback?: Localized };

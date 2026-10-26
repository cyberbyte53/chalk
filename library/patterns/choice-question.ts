import type { BoardKit, PlacedOf } from "@chalk/author";
import type { Localized } from "@chalk/content";
import { QuestionAction, QuestionSignal } from "@chalk/prop";
import { ChoiceAction, choiceDef } from "@chalk/prop-basics";

/** One option of a multiple-choice question; a wrong one says what it shows the learner missed. */
export type Option = { id: string; label: Localized; feedback?: Localized };

/**
 * A multiple-choice question that lets the learner go on once it is answered right: the choice prop,
 * its witness (pick the answer, Check) and a note check for every wrong option that has feedback.
 * The concepts it tests are written in by the build.
 */
export function choiceQuestion(
  b: BoardKit,
  spec: {
    name?: string;
    prompt: Localized;
    options: readonly Option[];
    answer: string;
    /** Placed hidden: a rule shows it once something else on the page is done. */
    isHidden?: boolean;
    /**
     * Keep the options in the order written (for options that read as a sequence: numbers in
     * order). By default they are shuffled, the same way every build, so the answer isn't always
     * where the author happened to write it (usually first).
     */
    keepOrder?: boolean;
  },
): PlacedOf<typeof choiceDef> {
  if (!spec.options.some((o) => o.id === spec.answer)) {
    throw new Error(`choiceQuestion: the answer "${spec.answer}" is not one of the options`);
  }
  const ids = spec.options.map((o) => o.id);
  if (new Set(ids).size !== ids.length) throw new Error("choiceQuestion: two options share an id");
  const shown =
    spec.keepOrder === true
      ? spec.options
      : settle(spec.options, seedOf(`${spec.name ?? "ask"}|${spec.prompt.en}|${ids.join(",")}`));
  const ask = b.prop(
    choiceDef,
    spec.name ?? "ask",
    {
      prompt: spec.prompt,
      options: shown.map((o) =>
        o.feedback === undefined ? { id: o.id, label: o.label } : { ...o },
      ),
      answer: spec.answer,
    },
    { isHidden: spec.isHidden === true },
  );
  b.witness(
    ask.learner(ChoiceAction.Select, { option: spec.answer }),
    ask.learner(QuestionAction.Check),
  );
  for (const o of spec.options) {
    if (o.id === spec.answer || o.feedback === undefined) continue;
    b.noteCheck({
      steps: [
        ask.learner(ChoiceAction.Select, { option: o.id }),
        ask.learner(QuestionAction.Check),
      ],
      feedback: o.feedback,
    });
  }
  return ask;
}

/** A stable whole number from a string (FNV-1a), to seed `settle`. */
function seedOf(text: string): number {
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

/**
 * A multiple-choice question: the right option and the wrong ones by key (each key is that option's
 * id). Its options are shuffled the same way every build, unless `keepOrder` (then the right one
 * comes first, the wrong ones as written). Placed like any piece: `after(...)` shows it later.
 */
export function choice(
  b: BoardKit,
  spec: {
    name?: string;
    prompt: Localized;
    right: Localized;
    wrong: Readonly<Record<string, Wrong>>;
    keepOrder?: boolean;
  },
): PlacedOf<typeof choiceDef> {
  if (RIGHT in spec.wrong) throw new Error(`choice: "${RIGHT}" is the right option's key`);
  return choiceQuestion(b, {
    ...(spec.name !== undefined ? { name: spec.name } : {}),
    prompt: spec.prompt,
    options: [
      { id: RIGHT, label: spec.right },
      ...Object.entries(spec.wrong).map(([id, w]) => ({ id, ...w })),
    ],
    answer: RIGHT,
    ...(spec.keepOrder !== undefined ? { keepOrder: spec.keepOrder } : {}),
  });
}

/** The right option's id. */
const RIGHT = "right";

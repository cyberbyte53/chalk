import { actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";

/**
 * NCERT's "Think it over: disposable cups in trains". Tea on trains came, in turn, in plastic
 * glasses returned to the vendor, then disposable plastic cups (hailed for hygiene, but millions
 * thrown away a day), then kulhads (clay cups: made on a large scale they would cost fertile
 * topsoil), and now disposable paper cups. Each cup is compared on four questions.
 */

export const Cup = {
  Returnable: "returnable",
  DisposablePlastic: "disposablePlastic",
  Kulhad: "kulhad",
  Paper: "paper",
} as const;
export type Cup = (typeof Cup)[keyof typeof Cup];
/** In the order they were used on trains. */
export const CUPS: readonly Cup[] = [Cup.Returnable, Cup.DisposablePlastic, Cup.Kulhad, Cup.Paper];

export const CupQuestion = {
  Reused: "reused",
  Hygienic: "hygienic",
  PilesUp: "pilesUp",
  CostsTopsoil: "costsTopsoil",
} as const;
export type CupQuestion = (typeof CupQuestion)[keyof typeof CupQuestion];
export const CUP_QUESTIONS: readonly CupQuestion[] = Object.values(CupQuestion);

/** Each cup's answer to each question. `pilesUp`: leaves waste that stays for a long time. */
export const CUP_FACTS: Readonly<Record<Cup, Readonly<Record<CupQuestion, boolean>>>> = {
  returnable: { reused: true, hygienic: false, pilesUp: false, costsTopsoil: false },
  disposablePlastic: { reused: false, hygienic: true, pilesUp: true, costsTopsoil: false },
  kulhad: { reused: false, hygienic: true, pilesUp: false, costsTopsoil: true },
  paper: { reused: false, hygienic: true, pilesUp: false, costsTopsoil: false },
};

/** Whether the answer is the good one for the environment or health. */
export const isGood = (q: CupQuestion, yes: boolean): boolean =>
  q === CupQuestion.Reused || q === CupQuestion.Hygienic ? yes : !yes;

export const CupAction = { Pick: "pick", Clear: "clear" } as const;
export const CupSignal = { Picked: "picked" } as const;
export const CupDerived = { Facts: "facts", Problems: "problems" } as const;
export const CupPart = { Cups: "cups", Table: "table" } as const;

const cupState = z
  .object({
    selected: z.nativeEnum(Cup).nullable(),
    /** Every cup's row in the table at once, rather than just the selected one. */
    showAll: z.boolean(),
    canPick: z.boolean(),
  })
  .strict();
export type CupState = z.infer<typeof cupState>;

const NAMES: Readonly<Record<Cup, string>> = {
  returnable: "plastic glass returned to the vendor",
  disposablePlastic: "disposable plastic cup",
  kulhad: "kulhad (clay cup)",
  paper: "disposable paper cup",
};
const Q_WORDS: Readonly<Record<CupQuestion, [string, string]>> = {
  reused: ["is used again", "is used once"],
  hygienic: ["is clean for every passenger", "may not be clean (shared)"],
  pilesUp: ["leaves waste that stays for years", "doesn't leave lasting waste"],
  costsTopsoil: ["costs fertile topsoil when made in millions", "costs no topsoil"],
};

/** What's wrong with a cup, as question keys. */
export const problemsOf = (cup: Cup): CupQuestion[] =>
  CUP_QUESTIONS.filter((q) => !isGood(q, CUP_FACTS[cup][q]));

export function describeCups(s: CupState): string {
  const order = `Tea cups on trains, in order: ${CUPS.map((c) => NAMES[c]).join(", then ")}.`;
  if (s.selected === null) return `${order} None is selected.`;
  const f = CUP_FACTS[s.selected];
  return `${order} The ${NAMES[s.selected]}: ${CUP_QUESTIONS.map((q) => Q_WORDS[q][f[q] ? 0 : 1]).join("; ")}.`;
}

const act = actionsFor<CupState>();

export const cupChoice = defineProp({
  type: "cupChoice",
  describe:
    "NCERT's disposable-cups-in-trains comparison: the returnable plastic glass, the disposable plastic cup, the kulhad (clay cup) and the disposable paper cup, in the order they were used. Pick a cup to see whether it is used again, hygienic, leaves lasting waste, and costs fertile topsoil.",
  state: cupState,
  defaults: { selected: null, showAll: false, canPick: true },
  inputs: ["showAll", "canPick"],
  derived: {
    [CupDerived.Facts]: {
      describe: "The selected cup's answers: reused, hygienic, pilesUp, costsTopsoil",
      compute: (s) => (s.selected === null ? null : { ...CUP_FACTS[s.selected] }),
    },
    [CupDerived.Problems]: {
      describe: "What's wrong with the selected cup",
      compute: (s) => (s.selected === null ? [] : problemsOf(s.selected)),
    },
  },
  actions: {
    [CupAction.Pick]: act({
      describe: "Look at one cup",
      byLearner: true,
      args: z.object({ cup: z.nativeEnum(Cup) }).strict(),
      run: (_s, a) =>
        set(
          { selected: a.cup },
          { signal: CupSignal.Picked, payload: { cup: a.cup, problems: problemsOf(a.cup) } },
        ),
    }),
    [CupAction.Clear]: act({
      describe: "Pick no cup",
      args: z.object({}).strict(),
      run: () => set({ selected: null }),
    }),
  },
  signals: { [CupSignal.Picked]: { describe: "A cup was picked; the payload lists its problems" } },
  observe: (s) => ({
    summary: describeCups(s),
    elements: [{ id: CupPart.Table, value: describeCups(s) }],
  }),
  parts: () => [CupPart.Cups, CupPart.Table],
});

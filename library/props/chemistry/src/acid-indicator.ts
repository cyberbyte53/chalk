import { type Element, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import {
  INDICATORS,
  IndicatorId,
  NATURE_WORDS,
  SUBSTANCES,
  SubstanceId,
  natureOf,
  responseWords,
} from "./acid-data";

/**
 * Testing solutions with indicators (Activity 2.1, 2.2): a row of watch-glasses, each holding a
 * sample; the learner picks an indicator and adds a drop to a sample (or dips a paper strip, or
 * smells the cloth). Every test is remembered, so Table 2.1 fills in as you go.
 */

export const IndicatorAction = {
  Choose: "choose",
  Test: "test",
  Clear: "clear",
} as const;
export const IndicatorSignal = { Tested: "tested", AllTested: "allTested" } as const;
export const IndicatorDerived = {
  Results: "results",
  Natures: "natures",
  IsTableFull: "isTableFull",
} as const;
export const IndicatorPart = {
  Samples: "samples",
  Indicators: "indicators",
  Table: "table",
} as const;

/** One test: an indicator on a sample. */
const testShape = z
  .object({ sample: z.nativeEnum(SubstanceId), indicator: z.nativeEnum(IndicatorId) })
  .strict();

const indicatorState = z
  .object({
    /** The samples on the bench, left to right (1–6). */
    samples: z.array(z.nativeEnum(SubstanceId)).min(1).max(6),
    /** The indicators the learner may choose from (1–8), in order. */
    indicators: z.array(z.nativeEnum(IndicatorId)).min(1).max(8),
    /** The indicator in hand. */
    chosen: z.nativeEnum(IndicatorId),
    /** Every test done so far (latest last). A sample shows its latest test. */
    tests: z.array(testShape).max(64),
    /** Write each sample's name (and formula) under its glass. */
    showNames: z.boolean(),
    /** Show the results as a table (Table 2.1): samples down, indicators across. */
    showTable: z.boolean(),
    /** Once every indicator has been on a sample, say whether it is acidic, basic or neutral. */
    showNature: z.boolean(),
    /** The learner can choose indicators and test. */
    canTest: z.boolean(),
  })
  .strict();
export type IndicatorState = z.infer<typeof indicatorState>;

const key = (sample: SubstanceId, indicator: IndicatorId) => `${sample}:${indicator}`;

/** The latest test on each sample (or none). */
export function latestTest(s: IndicatorState, sample: SubstanceId): IndicatorId | null {
  for (let i = s.tests.length - 1; i >= 0; i--) {
    const t = s.tests[i];
    if (t !== undefined && t.sample === sample) return t.indicator;
  }
  return null;
}

/** Has this sample met this indicator? */
export const wasTested = (
  s: IndicatorState,
  sample: SubstanceId,
  indicator: IndicatorId,
): boolean => s.tests.some((t) => t.sample === sample && t.indicator === indicator);

/** Has every chosen indicator been tried on this sample? */
export const isSampleDone = (s: IndicatorState, sample: SubstanceId): boolean =>
  s.indicators.every((i) => wasTested(s, sample, i));

export function describeIndicator(s: IndicatorState): string {
  const names = s.samples.map((x) => SUBSTANCES[x].name.en).join(", ");
  const done = s.samples
    .map((x) => {
      const ind = latestTest(s, x);
      return ind === null
        ? null
        : `${INDICATORS[ind].name.en} on ${SUBSTANCES[x].name.en}: ${responseWords(ind, SUBSTANCES[x].pH).en}`;
    })
    .filter((x) => x !== null);
  return `Samples on watch-glasses: ${names}. In hand: ${INDICATORS[s.chosen].name.en}.${
    done.length > 0 ? ` Latest results: ${done.join("; ")}.` : " Nothing tested yet."
  }`;
}

const act = actionsFor<IndicatorState>();

export const acidIndicator = defineProp({
  type: "acidIndicator",
  describe:
    "Testing solutions with acid–base indicators (NCERT Class 10 Activities 2.1 and 2.2): samples on watch-glasses, and indicators to choose from (red and blue litmus paper, litmus solution, phenolphthalein, methyl orange, turmeric paper, red cabbage juice, universal indicator paper, and the olfactory indicators onion, vanilla and clove). Adding an indicator to a sample shows its colour there (or whether the smell stays); every test is kept, and a table of samples × indicators fills in (Table 2.1). It knows each sample's pH, and so whether it is acidic, basic or neutral.",
  state: indicatorState,
  defaults: {
    samples: [
      SubstanceId.HydrochloricAcid,
      SubstanceId.SodiumHydroxide,
      SubstanceId.DistilledWater,
    ],
    indicators: [IndicatorId.RedLitmus, IndicatorId.BlueLitmus],
    chosen: IndicatorId.RedLitmus,
    tests: [],
    showNames: true,
    showTable: false,
    showNature: false,
    canTest: true,
  },
  inputs: ["showNames", "showTable", "showNature", "canTest"],
  invariant: (s) =>
    s.indicators.includes(s.chosen)
      ? undefined
      : "the indicator in hand must be one of `indicators`",
  derived: {
    [IndicatorDerived.Results]: {
      describe:
        "Every test done, as { sample, indicator, result } where result is in words (turns blue, stays red, smell is gone, green (pH 7))",
      compute: (s) =>
        s.tests.map((t) => ({
          sample: t.sample,
          indicator: t.indicator,
          result: responseWords(t.indicator, SUBSTANCES[t.sample].pH).en,
        })),
    },
    [IndicatorDerived.Natures]: {
      describe:
        "For each sample, whether it is acidic, basic or neutral (always known to the prop; shown on screen only with showNature once every indicator was tried on it)",
      compute: (s) => Object.fromEntries(s.samples.map((x) => [x, natureOf(x)])),
    },
    [IndicatorDerived.IsTableFull]: {
      describe: "Every indicator has been tried on every sample",
      compute: (s) => s.samples.every((x) => isSampleDone(s, x)),
    },
  },
  actions: {
    [IndicatorAction.Choose]: act({
      describe: "Take up an indicator (one of the ones on offer)",
      byLearner: true,
      args: z.object({ indicator: z.nativeEnum(IndicatorId) }).strict(),
      run: (s, a) => (s.indicators.includes(a.indicator) ? set({ chosen: a.indicator }) : set({})),
    }),
    [IndicatorAction.Test]: act({
      describe:
        "Add the indicator in hand to one sample (a drop, a dipped strip or a sniff); the result shows on that glass and in the table",
      byLearner: true,
      args: z.object({ sample: z.nativeEnum(SubstanceId) }).strict(),
      run: (s, a) => {
        if (!s.samples.includes(a.sample)) return set({});
        const tests = [
          ...s.tests.filter((t) => key(t.sample, t.indicator) !== key(a.sample, s.chosen)),
          { sample: a.sample, indicator: s.chosen },
        ].slice(-64);
        const next = { ...s, tests };
        const full = next.samples.every((x) => isSampleDone(next, x));
        const wasFull = s.samples.every((x) => isSampleDone(s, x));
        const tested = {
          signal: IndicatorSignal.Tested,
          payload: {
            sample: a.sample,
            indicator: s.chosen,
            result: responseWords(s.chosen, SUBSTANCES[a.sample].pH).en,
          },
        };
        return full && !wasFull
          ? set({ tests }, tested, { signal: IndicatorSignal.AllTested, payload: {} })
          : set({ tests }, tested);
      },
    }),
    [IndicatorAction.Clear]: act({
      describe: "Wash the glasses: forget every test",
      byLearner: true,
      args: z.object({}).strict(),
      run: () => set({ tests: [] }),
    }),
  },
  signals: {
    [IndicatorSignal.Tested]: {
      describe: "An indicator was added to a sample; the payload has the result in words",
      isCommit: true,
    },
    [IndicatorSignal.AllTested]: {
      describe: "Every indicator on offer has now been tried on every sample",
    },
  },
  observe: (s) => {
    const elements: Element[] = s.samples.map((x) => {
      const ind = latestTest(s, x);
      const shown = s.showNature && isSampleDone(s, x) ? `; ${NATURE_WORDS[natureOf(x)].en}` : "";
      return {
        id: `sample-${x}`,
        value:
          ind === null
            ? `${SUBSTANCES[x].name.en}: untested`
            : `${SUBSTANCES[x].name.en}: ${INDICATORS[ind].name.en} ${responseWords(ind, SUBSTANCES[x].pH).en}${shown}`,
      };
    });
    if (s.canTest)
      elements.push({
        id: IndicatorPart.Indicators,
        value: `${s.indicators.map((i) => INDICATORS[i].name.en).join(", ")}; in hand: ${INDICATORS[s.chosen].name.en}`,
      });
    if (s.showTable)
      elements.push({
        id: IndicatorPart.Table,
        value: s.samples
          .map(
            (x) =>
              `${SUBSTANCES[x].name.en}: ${s.indicators
                .map((i) =>
                  wasTested(s, x, i)
                    ? `${INDICATORS[i].name.en} ${responseWords(i, SUBSTANCES[x].pH).en}`
                    : `${INDICATORS[i].name.en} ?`,
                )
                .join(", ")}`,
          )
          .join(" | "),
      });
    const untested = s.samples.flatMap((x) =>
      s.indicators
        .filter((i) => !wasTested(s, x, i))
        .map(
          (i) =>
            `${INDICATORS[i].name.en} on ${SUBSTANCES[x].name.en}: ${responseWords(i, SUBSTANCES[x].pH).en}`,
        ),
    );
    const natureHidden = s.samples
      .filter((x) => !(s.showNature && isSampleDone(s, x)))
      .map((x) => `${SUBSTANCES[x].name.en} is ${NATURE_WORDS[natureOf(x)].en}`);
    return {
      summary: describeIndicator(s),
      elements,
      hidden: { wouldShow: untested, natures: natureHidden },
    };
  },
  parts: (s) => [
    IndicatorPart.Samples,
    ...s.samples.map((x) => `sample-${x}`),
    ...(s.canTest ? [IndicatorPart.Indicators] : []),
    ...(s.showTable ? [IndicatorPart.Table] : []),
  ],
});

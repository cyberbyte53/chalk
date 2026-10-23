import type { BoardKit, PlacedOf } from "@chalk/author";
import { t } from "@chalk/author";
import type { Localized } from "@chalk/content";
import { type Option, choiceQuestion, settle } from "@chalk/patterns";
import {
  LabMetal,
  MetalSceneKind,
  PropertyAction,
  PropertySample,
  PropertyTest,
  ReactivityAction,
  Reagent,
  metalSceneDef,
  propertyTesterDef,
  reactivityLabDef,
} from "@chalk/prop-chemistry";

/** A chemical equation shown on its own line: the same in both languages. */
export const ce = (equation: string): Localized =>
  t(`$$\\ce{${equation}}$$`, `$$\\ce{${equation}}$$`);

/** State symbols, dropped from the longer displays so they fit a phone. */
const bare = (equation: string): string => equation.replace(/\((s|l|g|aq)\)/g, "");

/** A chemical equation that gives out heat: "… + heat" after it (without state symbols, to fit). */
export const ceHeat = (equation: string): Localized =>
  t(`$$\\ce{${bare(equation)}} + \\text{heat}$$`, `$$\\ce{${bare(equation)}} + \\text{ऊष्मा}$$`);

/** A chemical equation with a condition over its arrow ("Heat"…), without state symbols, to fit. */
export const ceOn = (left: string, right: string, over: Localized): Localized =>
  t(
    `$$\\ce{${bare(left)} ->[\\text{${over.en}}] ${bare(right)}}$$`,
    `$$\\ce{${bare(left)} ->[\\text{${over.hi}}] ${bare(right)}}$$`,
  );

/** A word equation, "A + B -> C + D", in each language. */
export const wordEq = (en: string, hi: string): Localized => {
  const tex = (s: string) =>
    `$$${s
      .split(" -> ")
      .map((side) =>
        side
          .split(" + ")
          .map((term) => `\\text{${term}}`)
          .join(" + "),
      )
      .join(" \\longrightarrow ")}$$`;
  return t(tex(en), tex(hi));
};

/** A story picture. */
export function sceneOn(
  b: BoardKit,
  name: string,
  scene: MetalSceneKind,
  says: string,
): PlacedOf<typeof metalSceneDef> {
  const picture = b.prop(metalSceneDef, name, { scene });
  b.standsFor(picture, says);
  return picture;
}

/** The property bench: the learner picks a sample and a test, and tries it. */
export function testerOn(
  b: BoardKit,
  name: string,
  options: {
    samples: readonly PropertySample[];
    tests: readonly PropertyTest[];
    sample?: PropertySample;
    test?: PropertyTest;
    showTable?: boolean;
  },
): PlacedOf<typeof propertyTesterDef> {
  const bench = b.prop(propertyTesterDef, name, {
    sample: options.sample ?? options.samples[0],
    test: options.test ?? options.tests[0],
    isTried: false,
    tried: [],
    samples: [...options.samples],
    tests: [...options.tests],
    showTable: options.showTable ?? true,
    showProperty: true,
    canChoose: true,
  });
  b.studentOnly(bench.action(PropertyAction.ChooseSample));
  b.studentOnly(bench.action(PropertyAction.ChooseTest));
  b.studentOnly(bench.action(PropertyAction.Try));
  return bench;
}

/** The reactivity bench: some metals, some reagents, the learner chooses and starts. */
export function labOn(
  b: BoardKit,
  name: string,
  options: {
    metals: readonly LabMetal[];
    reagents: readonly Reagent[];
    metal?: LabMetal;
    reagent?: Reagent;
    showThermometer?: boolean;
    showSeries?: boolean;
    showEquation?: boolean;
  },
): PlacedOf<typeof reactivityLabDef> {
  const lab = b.prop(reactivityLabDef, name, {
    metal: options.metal ?? options.metals[0],
    reagent: options.reagent ?? options.reagents[0],
    isStarted: false,
    metals: [...options.metals],
    reagents: [...options.reagents],
    showThermometer: options.showThermometer ?? false,
    showSeries: options.showSeries ?? false,
    showEquation: options.showEquation ?? true,
    canChoose: true,
  });
  b.studentOnly(lab.action(ReactivityAction.ChooseMetal));
  b.studentOnly(lab.action(ReactivityAction.ChooseReagent));
  b.studentOnly(lab.action(ReactivityAction.Start));
  b.studentOnly(lab.action(ReactivityAction.Reset));
  return lab;
}

export { LabMetal, MetalSceneKind, PropertySample, PropertyTest, Reagent };

/** A question-bank row: the right answer plus wrong ones (each with why it's wrong), shuffled by a seed. */
export function pickOne(
  b: BoardKit,
  spec: {
    prompt: Localized;
    right: Localized;
    wrong: readonly { label: Localized; why: Localized }[];
    seed: number;
  },
) {
  const options: Option[] = [
    { id: "right", label: spec.right },
    ...spec.wrong.map((w, i) => ({ id: `w${i}`, label: w.label, feedback: w.why })),
  ];
  return choiceQuestion(b, {
    prompt: spec.prompt,
    options: settle(options, spec.seed),
    answer: "right",
    keepOrder: true,
  });
}

/** A small stable number from a string, to seed the shuffle. */
export const seedOf = (...parts: string[]): number =>
  [...parts.join("|")].reduce((n, ch) => (n * 31 + ch.charCodeAt(0)) % 100003, 7);

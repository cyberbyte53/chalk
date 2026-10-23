import type { AnyPlaced, BoardKit, PlacedOf } from "@chalk/author";
import { t, theBoard } from "@chalk/author";
import type { Localized } from "@chalk/content";
import { type Option, choiceQuestion, settle } from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  Allotrope,
  AllotropeAction,
  type CarbonScene,
  ChainAction,
  type ChainState,
  CovalentAction,
  Fuel,
  LabAction,
  type LabKind,
  type Molecule,
  Series,
  SeriesAction,
  SoapAction,
  type SoapMode,
  allotropesDef,
  carbonChainDef,
  carbonLabDef,
  carbonSceneDef,
  chainOf,
  covalentBondDef,
  homologousSeriesDef,
  labOf,
  soapActionDef,
} from "@chalk/prop-carbon";

/** A chemical equation on its own line: the same in both languages. */
export const ce = (equation: string): Localized =>
  t(`$$\\ce{${equation}}$$`, `$$\\ce{${equation}}$$`);

/**
 * A chemical equation with a condition over its arrow. The condition is read by mhchem (so
 * formulas in it get their subscripts); Hindi words in it go in \\text{} by the caller.
 */
export const ceOn = (left: string, right: string, over: Localized): Localized =>
  t(`$$\\ce{${left} ->[${over.en}] ${right}}$$`, `$$\\ce{${left} ->[${over.hi}] ${right}}$$`);

/** A long equation on two lines, the arrow starting the second, so it fits a phone. */
export const ceTwo = (left: string, right: string, over?: Localized): Localized => {
  const arrow = (o?: string) => (o === undefined ? "->" : `->[${o}]`);
  return t(
    `$$\\ce{${left}}$$\n$$\\ce{${arrow(over?.en)} ${right}}$$`,
    `$$\\ce{${left}}$$\n$$\\ce{${arrow(over?.hi)} ${right}}$$`,
  );
};

/** A story picture. */
export function sceneOn(
  b: BoardKit,
  name: string,
  scene: CarbonScene,
  says: string,
): PlacedOf<typeof carbonSceneDef> {
  const picture = b.prop(carbonSceneDef, name, { scene });
  b.standsFor(picture, says);
  return picture;
}

/** An electron-dot molecule the learner steps from separate atoms to shared pairs to lines. */
export function dotsOn(
  b: BoardKit,
  name: string,
  molecule: Molecule,
  choices: readonly Molecule[] = [],
): PlacedOf<typeof covalentBondDef> {
  const m = b.prop(covalentBondDef, name, {
    molecule,
    step: 0,
    choices: [...choices],
    showShells: true,
    showCounts: true,
    canStep: true,
  });
  b.studentOnly(m.action(CovalentAction.Next));
  b.studentOnly(m.action(CovalentAction.Reset));
  if (choices.length > 0) b.studentOnly(m.action(CovalentAction.Pick));
  return m;
}

/** A carbon compound, with whichever controls the learner may use. */
export function chainOn(
  b: BoardKit,
  name: string,
  state: Partial<ChainState>,
): PlacedOf<typeof carbonChainDef> {
  const c = b.prop(carbonChainDef, name, chainOf(state));
  if (state.canSetCarbons === true) b.studentOnly(c.action(ChainAction.SetCarbons));
  if (state.canSetShape === true) b.studentOnly(c.action(ChainAction.SetShape));
  if (state.canSetBonds === true) b.studentOnly(c.action(ChainAction.SetBond));
  if (state.canSetGroup === true) b.studentOnly(c.action(ChainAction.SetGroup));
  return c;
}

/** A homologous series as a ladder of rows. */
export function seriesOn(
  b: BoardKit,
  name: string,
  options: {
    series?: Series;
    upTo?: number;
    choices?: readonly Series[];
    showBoiling?: boolean;
    showGeneral?: boolean;
    canGrow?: boolean;
  },
): PlacedOf<typeof homologousSeriesDef> {
  const series = options.series ?? Series.Alkanes;
  const s = b.prop(homologousSeriesDef, name, {
    series,
    upTo: options.upTo ?? 4,
    highlight: null,
    showMass: true,
    showStep: true,
    showBoiling: options.showBoiling ?? false,
    showGeneral: options.showGeneral ?? false,
    choices: [...(options.choices ?? [])],
    canGrow: options.canGrow ?? false,
  });
  b.studentOnly(s.action(SeriesAction.Highlight));
  if ((options.choices ?? []).length > 0) b.studentOnly(s.action(SeriesAction.Pick));
  if (options.canGrow === true) b.studentOnly(s.action(SeriesAction.Grow));
  return s;
}

/** The three allotropes, tap to compare. */
export function allotropesOn(b: BoardKit, name: string): PlacedOf<typeof allotropesDef> {
  const a = b.prop(allotropesDef, name, {
    kind: Allotrope.Diamond,
    showFacts: true,
    canPick: true,
    seen: [Allotrope.Diamond],
  });
  b.studentOnly(a.action(AllotropeAction.Pick));
  return a;
}

/** A stepped bench demonstration. */
export function labOn(
  b: BoardKit,
  name: string,
  kind: LabKind,
  options: { showEquation?: boolean; fuels?: readonly Fuel[] } = {},
): PlacedOf<typeof carbonLabDef> {
  const lab = b.prop(carbonLabDef, name, {
    ...labOf(kind, {}),
    showEquation: options.showEquation ?? true,
    fuels: [...(options.fuels ?? [Fuel.Alcohol, Fuel.Camphor, Fuel.Naphthalene])],
  });
  b.studentOnly(lab.action(LabAction.Next));
  b.studentOnly(lab.action(LabAction.Reset));
  b.studentOnly(lab.action(LabAction.SetFuel));
  b.studentOnly(lab.action(LabAction.SetAir));
  b.studentOnly(lab.action(LabAction.AddDrop));
  b.studentOnly(lab.action(LabAction.SetSun));
  return lab;
}

/** Soap at work: the molecule, the surface, a micelle, or hard water. */
export function soapOn(b: BoardKit, name: string, mode: SoapMode): PlacedOf<typeof soapActionDef> {
  const s = b.prop(soapActionDef, name, {
    mode,
    step: 0,
    water: "soft",
    cleaner: "soap",
    isShaken: false,
    showNames: true,
    canAct: true,
  });
  b.studentOnly(s.action(SoapAction.Next));
  b.studentOnly(s.action(SoapAction.Reset));
  b.studentOnly(s.action(SoapAction.SetWater));
  b.studentOnly(s.action(SoapAction.SetCleaner));
  b.studentOnly(s.action(SoapAction.Shake));
  return s;
}

/** A question-bank row: the right answer plus wrong ones (each with why), shuffled by a seed. */
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

/** A pair of strings, English then Hindi. */
export type L = readonly [string, string];

/** A wrong option: its label (en, hi) and why it's wrong (en, hi). */
export type Wrong = readonly [string, string, string, string];

/**
 * A multiple-choice question in a lesson: the right answer and the wrong ones with their
 * feedback; shuffled (the same way every build). Hidden and not passing unless said.
 */
export function ask(
  b: BoardKit,
  name: string,
  prompt: L,
  right: L,
  wrong: readonly Wrong[],
  options: { isHidden?: boolean; passes?: boolean } = {},
) {
  return choiceQuestion(b, {
    name,
    prompt: t(prompt[0], prompt[1]),
    options: [
      { id: "right", label: t(right[0], right[1]) },
      ...wrong.map((w, i) => ({ id: `w${i}`, label: t(w[0], w[1]), feedback: t(w[2], w[3]) })),
    ],
    answer: "right",
    isHidden: options.isHidden ?? false,
    passes: options.passes ?? false,
  });
}

/**
 * Questions answered one after another: each right answer shows the next; the last one shows
 * `then` (an explanation, a log) and lets the learner go on. Every question but the first should be
 * made hidden.
 */
export function oneByOne(
  b: BoardKit,
  questions: readonly ReturnType<typeof ask>[],
  then: readonly AnyPlaced[] = [],
): void {
  questions.forEach((q, i) => {
    const next = questions[i + 1];
    if (next !== undefined) b.when(q.on(QuestionSignal.Correct), theBoard.show(next));
    else
      b.when(q.on(QuestionSignal.Correct), [...then.map((p) => theBoard.show(p)), theBoard.pass()]);
  });
}

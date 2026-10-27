import { type Emit, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";

/**
 * NCERT's five R's to save the environment: Refuse, Reduce, Reuse, Repurpose and Recycle. Everyday
 * actions, one at a time, go into the R they belong to; each R carries NCERT's own meaning.
 */

export const R = {
  Refuse: "refuse",
  Reduce: "reduce",
  Reuse: "reuse",
  Repurpose: "repurpose",
  Recycle: "recycle",
} as const;
export type R = (typeof R)[keyof typeof R];
export const RS: readonly R[] = [R.Refuse, R.Reduce, R.Reuse, R.Repurpose, R.Recycle];

/** Everyday actions, each with the one R it shows (NCERT's own examples first). */
export const Deed = {
  NoPlasticBag: "noPlasticBag",
  RefuseFreebie: "refuseFreebie",
  SwitchOffFan: "switchOffFan",
  FixLeakyTap: "fixLeakyTap",
  NoFoodWaste: "noFoodWaste",
  EnvelopeAgain: "envelopeAgain",
  PickleJar: "pickleJar",
  CrackedCupPlanter: "crackedCupPlanter",
  BrokenCupBirdFeeder: "brokenCupBirdFeeder",
  SegregatePaper: "segregatePaper",
  OldBottlesToKabadi: "oldBottlesToKabadi",
  TyreSwing: "tyreSwing",
} as const;
export type Deed = (typeof Deed)[keyof typeof Deed];
export const DEEDS: readonly Deed[] = Object.values(Deed);

/** The R each action shows. */
export const R_OF: Readonly<Record<Deed, R>> = {
  noPlasticBag: R.Refuse,
  refuseFreebie: R.Refuse,
  switchOffFan: R.Reduce,
  fixLeakyTap: R.Reduce,
  noFoodWaste: R.Reduce,
  envelopeAgain: R.Reuse,
  pickleJar: R.Reuse,
  crackedCupPlanter: R.Repurpose,
  brokenCupBirdFeeder: R.Repurpose,
  tyreSwing: R.Repurpose,
  segregatePaper: R.Recycle,
  oldBottlesToKabadi: R.Recycle,
};

export const DEED_WORDS: Readonly<Record<Deed, { en: string; hi: string }>> = {
  noPlasticBag: {
    en: "Say no to a single-use plastic bag",
    hi: "एक बार इस्तेमाल वाली प्लास्टिक थैली को ना कहना",
  },
  refuseFreebie: {
    en: "Say no to a free gift you don't need",
    hi: "बिना ज़रूरत का मुफ़्त सामान ना लेना",
  },
  switchOffFan: {
    en: "Switch off a fan in an empty room",
    hi: "खाली कमरे का पंखा बंद करना",
  },
  fixLeakyTap: { en: "Get a leaky tap repaired", hi: "टपकता नल ठीक करवाना" },
  noFoodWaste: { en: "Take only as much food as you'll eat", hi: "उतना ही खाना लेना जितना खाओगे" },
  envelopeAgain: {
    en: "Turn a used envelope inside out and use it again",
    hi: "पुराने लिफ़ाफ़े को उलटकर फिर इस्तेमाल करना",
  },
  pickleJar: {
    en: "Store spices in an empty pickle jar",
    hi: "अचार की खाली बरनी में मसाले रखना",
  },
  crackedCupPlanter: {
    en: "Grow a small plant in a cracked cup",
    hi: "टूटे कप में छोटा पौधा उगाना",
  },
  brokenCupBirdFeeder: {
    en: "Make a bird feeder from a cup with a broken handle",
    hi: "टूटे हैंडल वाले कप से चिड़ियों का दाना-पात्र बनाना",
  },
  tyreSwing: { en: "Make a swing from an old tyre", hi: "पुराने टायर से झूला बनाना" },
  segregatePaper: {
    en: "Keep old newspapers apart so they can be made into new paper",
    hi: "पुराने अख़बार अलग रखना ताकि उनसे नया कागज़ बने",
  },
  oldBottlesToKabadi: {
    en: "Give glass bottles to be melted into new glass",
    hi: "काँच की बोतलें पिघलाकर नया काँच बनाने के लिए देना",
  },
};

export const R_WORDS: Readonly<Record<R, { en: string; hi: string }>> = {
  refuse: { en: "Refuse", hi: "मना करना" },
  reduce: { en: "Reduce", hi: "कम करना" },
  reuse: { en: "Reuse", hi: "दोबारा इस्तेमाल" },
  repurpose: { en: "Repurpose", hi: "नया उपयोग" },
  recycle: { en: "Recycle", hi: "पुनर्चक्रण" },
};

/** NCERT's meaning of each R, short. */
export const R_MEANING: Readonly<Record<R, { en: string; hi: string }>> = {
  refuse: {
    en: "say no to things you don't need",
    hi: "जिनकी ज़रूरत नहीं उन चीज़ों को ना कहना",
  },
  reduce: { en: "use less", hi: "कम इस्तेमाल करना" },
  reuse: { en: "use the same thing again and again", hi: "एक ही चीज़ बार-बार इस्तेमाल करना" },
  repurpose: {
    en: "use it for a different useful purpose",
    hi: "किसी दूसरे काम में लाना",
  },
  recycle: {
    en: "make new things from the old material",
    hi: "पुराने पदार्थ से नई चीज़ें बनाना",
  },
};

export const FiveRAction = { Put: "put", Reset: "reset" } as const;
export const FiveRSignal = { Put: "put", Sorted: "sorted" } as const;
export const FiveRDerived = {
  Next: "next",
  Right: "right",
  Wrong: "wrong",
  IsDone: "isDone",
  AllRight: "allRight",
} as const;
export const FiveRPart = { Card: "card", Bins: "bins" } as const;

const fiveRsState = z
  .object({
    deeds: z.array(z.nativeEnum(Deed)).min(1).max(10),
    /** What has been put where, in order. */
    placed: z.array(z.object({ deed: z.nativeEnum(Deed), r: z.nativeEnum(R) }).strict()),
    /** Which R's are offered as bins (lessons may start with fewer). */
    bins: z.array(z.nativeEnum(R)).min(2).max(5),
    showMeaning: z.boolean(),
    showFeedback: z.boolean(),
    canSort: z.boolean(),
  })
  .strict();
export type FiveRsState = z.infer<typeof fiveRsState>;

export const nextOf = (s: Pick<FiveRsState, "deeds" | "placed">): Deed | null =>
  s.deeds.find((d) => !s.placed.some((p) => p.deed === d)) ?? null;
export const rightOf = (s: Pick<FiveRsState, "placed">): number =>
  s.placed.filter((p) => R_OF[p.deed] === p.r).length;

export function describeFiveRs(s: FiveRsState): string {
  const next = nextOf(s);
  const bins = s.bins.map((r) => R_WORDS[r].en).join(", ");
  const head = `Sorting everyday actions into the R's: ${bins}.`;
  const done = `${s.placed.length} of ${s.deeds.length} sorted, ${rightOf(s)} right.`;
  return next === null
    ? `${head} All sorted: ${done}`
    : `${head} Next action: "${DEED_WORDS[next].en}". ${done}`;
}

const act = actionsFor<FiveRsState>();

export const fiveRs = defineProp({
  type: "fiveRs",
  describe:
    "NCERT's five R's to save the environment (Refuse, Reduce, Reuse, Repurpose, Recycle). Everyday actions come one at a time; the learner puts each into the R it shows. The bins can carry NCERT's meaning of each R; wrong placements are marked when feedback is on.",
  state: fiveRsState,
  defaults: {
    deeds: [
      Deed.NoPlasticBag,
      Deed.SwitchOffFan,
      Deed.EnvelopeAgain,
      Deed.CrackedCupPlanter,
      Deed.SegregatePaper,
    ],
    placed: [],
    bins: [...RS],
    showMeaning: true,
    showFeedback: true,
    canSort: true,
  },
  invariant: (s) => {
    if (new Set(s.deeds).size !== s.deeds.length) return "each action comes once";
    if (!s.deeds.every((d) => s.bins.includes(R_OF[d]))) return "every action's R must be a bin";
    if (s.placed.some((p) => !s.deeds.includes(p.deed))) return "placed an action not in the list";
    if (new Set(s.placed.map((p) => p.deed)).size !== s.placed.length) return "placed twice";
    return undefined;
  },
  inputs: ["deeds", "bins", "showMeaning", "showFeedback", "canSort"],
  derived: {
    [FiveRDerived.Next]: { describe: "The action waiting to be sorted, or null", compute: nextOf },
    [FiveRDerived.Right]: { describe: "How many are in the right R", compute: rightOf },
    [FiveRDerived.Wrong]: {
      describe: "How many are in a wrong R",
      compute: (s) => s.placed.length - rightOf(s),
    },
    [FiveRDerived.IsDone]: {
      describe: "Whether every action is sorted",
      compute: (s) => nextOf(s) === null,
    },
    [FiveRDerived.AllRight]: {
      describe: "Whether every action is sorted and all are right",
      compute: (s) => nextOf(s) === null && rightOf(s) === s.deeds.length,
    },
  },
  actions: {
    [FiveRAction.Put]: act({
      describe: "Put the next action into an R",
      byLearner: true,
      args: z.object({ r: z.nativeEnum(R) }).strict(),
      run: (s, a) => {
        const deed = nextOf(s);
        if (deed === null) return set({});
        const placed = [...s.placed, { deed, r: a.r }];
        const emit: Emit[] = [
          { signal: FiveRSignal.Put, payload: { deed, r: a.r, isRight: R_OF[deed] === a.r } },
        ];
        if (placed.length === s.deeds.length) {
          const right = rightOf({ placed });
          emit.push({
            signal: FiveRSignal.Sorted,
            payload: { right, allRight: right === s.deeds.length },
          });
        }
        return set({ placed }, ...emit);
      },
    }),
    [FiveRAction.Reset]: act({
      describe: "Take every action back out",
      byLearner: true,
      args: z.object({}).strict(),
      run: () => set({ placed: [] }),
    }),
  },
  signals: {
    [FiveRSignal.Put]: {
      describe: "An action was put into an R; the payload says if it was right",
    },
    [FiveRSignal.Sorted]: {
      describe: "Every action is sorted; the payload gives how many are right",
    },
  },
  observe: (s) => ({
    summary: describeFiveRs(s),
    elements: [
      { id: FiveRPart.Card, value: nextOf(s) ?? "none" },
      { id: FiveRPart.Bins, value: `${rightOf(s)} of ${s.placed.length} right` },
    ],
  }),
  parts: () => [FiveRPart.Card, FiveRPart.Bins],
});

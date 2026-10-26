import { type Emit, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";

/**
 * NCERT 16.3: water for all.
 * - Kulh mode: Himachal's kulhs carry stream water down the hillside; in the planting season the
 *   village farthest from the source gets water first, then villages progressively higher up.
 * - Khadin mode (Fig 16.4): monsoon rain runs off the catchment, collects behind an earthen
 *   embankment, soaks in and recharges the groundwater (the well rises), and a crop is grown on
 *   the moist bed.
 * - Compare mode: a big dam and canal vs local check dams, on NCERT's points.
 */

export const WaterMode = { Kulh: "kulh", Khadin: "khadin", Compare: "compare" } as const;
export type WaterMode = (typeof WaterMode)[keyof typeof WaterMode];

export const Scheme = { BigDam: "bigDam", CheckDam: "checkDam" } as const;
export type Scheme = (typeof Scheme)[keyof typeof Scheme];
export const SCHEMES: readonly Scheme[] = [Scheme.BigDam, Scheme.CheckDam];

export const SchemePoint = {
  StoredIn: "storedIn",
  Evaporates: "evaporates",
  Mosquitoes: "mosquitoes",
  Recharges: "recharges",
  WhoGets: "whoGets",
  Displaces: "displaces",
  Cost: "cost",
  Forest: "forest",
} as const;
export type SchemePoint = (typeof SchemePoint)[keyof typeof SchemePoint];
export const SCHEME_POINTS: readonly SchemePoint[] = Object.values(SchemePoint);

type W = { en: string; hi: string };
/** NCERT's points for each scheme; `good` marks the better answer for people and the land. */
export const SCHEME_FACTS: Readonly<
  Record<Scheme, Readonly<Record<SchemePoint, { w: W; good: boolean }>>>
> = {
  bigDam: {
    storedIn: { w: { en: "a big lake behind the dam", hi: "बाँध के पीछे बड़ी झील" }, good: false },
    evaporates: {
      w: { en: "surface water evaporates", hi: "सतह का पानी भाप बनता है" },
      good: false,
    },
    mosquitoes: {
      w: { en: "still water breeds mosquitoes", hi: "रुका पानी, मच्छर पनपते हैं" },
      good: false,
    },
    recharges: {
      w: { en: "doesn't recharge local wells much", hi: "स्थानीय कुएँ कम भरते हैं" },
      good: false,
    },
    whoGets: {
      w: {
        en: "people near the canal's head; the tail end often gets none",
        hi: "नहर के शुरू के लोग; आख़िर तक अक्सर पानी नहीं",
      },
      good: false,
    },
    displaces: {
      w: {
        en: "displaces peasants and tribals (social problem)",
        hi: "किसानों और आदिवासियों को उजाड़ता है (सामाजिक समस्या)",
      },
      good: false,
    },
    cost: {
      w: {
        en: "huge public money, benefits not in proportion (economic problem)",
        hi: "भारी सरकारी पैसा, उतना लाभ नहीं (आर्थिक समस्या)",
      },
      good: false,
    },
    forest: {
      w: {
        en: "floods forests, loses biodiversity (environmental problem)",
        hi: "जंगल डूबते हैं, जैव विविधता घटती है (पर्यावरणीय समस्या)",
      },
      good: false,
    },
  },
  checkDam: {
    storedIn: { w: { en: "mostly in the ground beneath", hi: "ज़्यादातर नीचे ज़मीन में" }, good: true },
    evaporates: {
      w: { en: "water underground doesn't evaporate", hi: "ज़मीन के नीचे का पानी भाप नहीं बनता" },
      good: true,
    },
    mosquitoes: {
      w: { en: "no stagnant water for mosquitoes", hi: "मच्छरों के लिए रुका पानी नहीं" },
      good: true,
    },
    recharges: {
      w: { en: "recharges wells over a wide area", hi: "दूर तक कुओं को भरता है" },
      good: true,
    },
    whoGets: {
      w: { en: "the local villagers who manage it", hi: "स्थानीय गाँव वाले, जो इसे सँभालते हैं" },
      good: true,
    },
    displaces: { w: { en: "no one is displaced", hi: "किसी को नहीं उजाड़ता" }, good: true },
    cost: { w: { en: "small, local cost", hi: "छोटा, स्थानीय ख़र्च" }, good: true },
    forest: { w: { en: "no forest drowned", hi: "कोई जंगल नहीं डूबता" }, good: true },
  },
};

export const KULH_VILLAGES = 4;
export const KHADIN_STEPS = 4;

export const WaterAction = { Next: "next", Reset: "reset", Pick: "pick" } as const;
export const WaterSignal = { Stepped: "stepped", Done: "done", Picked: "picked" } as const;
export const WaterDerived = {
  StepCount: "stepCount",
  IsDone: "isDone",
  Watered: "watered",
  WellLevel: "wellLevel",
  Problems: "problems",
} as const;
export const WaterPart = { Picture: "picture", Table: "table" } as const;

const waterState = z
  .object({
    mode: z.nativeEnum(WaterMode),
    step: z.number().int().min(0).max(KULH_VILLAGES),
    choice: z.nativeEnum(Scheme).nullable(),
    showNames: z.boolean(),
    canStep: z.boolean(),
    canPick: z.boolean(),
  })
  .strict();
export type WaterState = z.infer<typeof waterState>;

export const stepCountOf = (mode: WaterMode): number =>
  mode === WaterMode.Kulh ? KULH_VILLAGES + 1 : mode === WaterMode.Khadin ? KHADIN_STEPS : 1;
/** Kulh mode: which villages (1 = nearest the source … 4 = farthest) have water now. */
export const wateredOf = (s: Pick<WaterState, "mode" | "step">): number[] =>
  s.mode !== WaterMode.Kulh
    ? []
    : Array.from({ length: s.step }, (_, i) => KULH_VILLAGES - i).sort((a, b) => a - b);
/** Khadin mode: the well's water, 0 (low) to 2 (full). */
export const wellLevelOf = (s: Pick<WaterState, "mode" | "step">): number =>
  s.mode !== WaterMode.Khadin ? 0 : s.step >= 2 ? 2 : s.step >= 1 ? 1 : 0;
export const problemsOf = (choice: Scheme | null): SchemePoint[] =>
  choice === null ? [] : SCHEME_POINTS.filter((p) => !SCHEME_FACTS[choice][p].good);

const KHADIN_LINES = [
  "Monsoon rain falls on the slopes and runs downhill.",
  "The water collects behind the earthen embankment.",
  "It soaks into the ground: the groundwater rises and the well fills.",
  "When the water has soaked in, a crop is grown on the moist bed.",
];

export function describeWater(s: WaterState): string {
  if (s.mode === WaterMode.Kulh) {
    const w = wateredOf(s);
    return `A kulh carries stream water down the hill to ${KULH_VILLAGES} villages; in the planting season the farthest village gets water first. Villages with water: ${w.length === 0 ? "none yet" : w.join(", ")} (1 is nearest the source).`;
  }
  if (s.mode === WaterMode.Khadin)
    return `A khadin (Fig 16.4), step ${s.step + 1} of ${KHADIN_STEPS}: ${KHADIN_LINES[s.step] ?? ""}`;
  if (s.choice === null) return "A big dam and canal compared with local check dams. None picked.";
  const f = SCHEME_FACTS[s.choice];
  return `${s.choice === Scheme.BigDam ? "A big dam and canal" : "Local check dams"}: ${SCHEME_POINTS.map((p) => f[p].w.en).join("; ")}.`;
}

const act = actionsFor<WaterState>();

export const waterHarvest = defineProp({
  type: "waterHarvest",
  describe:
    "NCERT 16.3, water for all. Kulh mode: water from a Himachal kulh reaches the farthest village first, then villages higher up. Khadin mode (Fig 16.4): rain collects behind an embankment, soaks in to recharge the groundwater and the well, then a crop grows on the moist bed. Compare mode: a big dam and canal vs local check dams, on storage, evaporation, mosquitoes, recharge, who gets water, displacement, cost and forests.",
  state: waterState,
  defaults: {
    mode: WaterMode.Khadin,
    step: 0,
    choice: null,
    showNames: true,
    canStep: true,
    canPick: true,
  },
  inputs: ["mode", "showNames", "canStep", "canPick"],
  invariant: (s) =>
    s.step >= stepCountOf(s.mode) ? "step is past the last step for this mode" : undefined,
  derived: {
    [WaterDerived.StepCount]: {
      describe: "Steps in this mode",
      compute: (s) => stepCountOf(s.mode),
    },
    [WaterDerived.IsDone]: {
      describe: "Whether the last step is showing",
      compute: (s) => s.step === stepCountOf(s.mode) - 1,
    },
    [WaterDerived.Watered]: {
      describe: "Kulh mode: villages with water, 1 nearest the source",
      compute: wateredOf,
    },
    [WaterDerived.WellLevel]: {
      describe: "Khadin mode: the well, 0 low to 2 full",
      compute: wellLevelOf,
    },
    [WaterDerived.Problems]: {
      describe: "Compare mode: the picked scheme's points that are bad for people or the land",
      compute: (s) => problemsOf(s.choice),
    },
  },
  actions: {
    [WaterAction.Next]: act({
      describe: "Go to the next step",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        const last = stepCountOf(s.mode) - 1;
        if (s.step >= last) return set({});
        const step = s.step + 1;
        const emit: Emit[] = [{ signal: WaterSignal.Stepped, payload: { mode: s.mode, step } }];
        if (step === last) emit.push({ signal: WaterSignal.Done, payload: { mode: s.mode } });
        return set({ step }, ...emit);
      },
    }),
    [WaterAction.Reset]: act({
      describe: "Back to the first step",
      byLearner: true,
      args: z.object({}).strict(),
      run: () => set({ step: 0 }),
    }),
    [WaterAction.Pick]: act({
      describe: "Compare mode: look at one scheme",
      byLearner: true,
      args: z.object({ scheme: z.nativeEnum(Scheme) }).strict(),
      run: (_s, a) =>
        set(
          { choice: a.scheme },
          {
            signal: WaterSignal.Picked,
            payload: { scheme: a.scheme, problems: problemsOf(a.scheme) },
          },
        ),
    }),
  },
  signals: {
    [WaterSignal.Stepped]: { describe: "Moved on a step" },
    [WaterSignal.Done]: { describe: "Reached the last step" },
    [WaterSignal.Picked]: { describe: "A scheme was picked; the payload lists its problems" },
  },
  observe: (s) => ({
    summary: describeWater(s),
    elements:
      s.mode === WaterMode.Compare
        ? [{ id: WaterPart.Table, value: s.choice }]
        : [{ id: WaterPart.Picture, value: s.step }],
  }),
  parts: (s) => (s.mode === WaterMode.Compare ? [WaterPart.Table] : [WaterPart.Picture]),
});

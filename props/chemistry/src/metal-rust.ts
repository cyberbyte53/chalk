import { type Element, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import type { Words } from "./words";

/**
 * Rusting, and how to stop it (NCERT 3.5, Activity 3.14). In "conditions", three test tubes of
 * iron nails left for days: A with water and air (it rusts), B with boiled water under a layer of
 * oil (no air: no rust), C with dry air over anhydrous calcium chloride (no water: no rust). In
 * "protect", one nail in moist air with a coating (paint, grease, a zinc coat, a tin coat, chrome,
 * or made of stainless steel), whole or scratched: a scratched coat lets rust start, except zinc,
 * which is more reactive than iron and corrodes in its place.
 */

export const RustMode = { Conditions: "conditions", Protect: "protect" } as const;
export type RustMode = (typeof RustMode)[keyof typeof RustMode];

export const Coating = {
  None: "none",
  Paint: "paint",
  Grease: "grease",
  Zinc: "zinc",
  Tin: "tin",
  Chrome: "chrome",
  Stainless: "stainless",
} as const;
export type Coating = (typeof Coating)[keyof typeof Coating];
export const COATINGS: readonly Coating[] = Object.values(Coating);

export const COATING_WORDS: Record<Coating, Words> = {
  none: { en: "bare iron", hi: "खुला लोहा" },
  paint: { en: "painted", hi: "पेंट किया" },
  grease: { en: "greased", hi: "ग्रीस लगाया" },
  zinc: { en: "galvanised (zinc)", hi: "जस्तीकृत (जस्ता)" },
  tin: { en: "tin-plated", hi: "टिन चढ़ाया" },
  chrome: { en: "chrome-plated", hi: "क्रोम चढ़ाया" },
  stainless: { en: "stainless steel", hi: "स्टेनलेस स्टील" },
};

export const RustTube = { A: "A", B: "B", C: "C" } as const;
export type RustTube = (typeof RustTube)[keyof typeof RustTube];

export const TUBE_WORDS: Record<RustTube, Words> = {
  A: { en: "water and air", hi: "पानी और हवा" },
  B: { en: "boiled water under oil: no air", hi: "तेल के नीचे उबला पानी: हवा नहीं" },
  C: { en: "dry air: no water", hi: "सूखी हवा: पानी नहीं" },
};

/** Days until rust shows, and until it is heavy. */
export const RUST_STARTS = 2;
export const RUST_FULL = 6;
export const MAX_DAYS = 7;

/** Where rust appears: nowhere, only at a scratch, or all over. */
export const RustWhere = { None: "none", Scratch: "scratch", All: "all" } as const;
export type RustWhere = (typeof RustWhere)[keyof typeof RustWhere];

/** Where a nail with this coating rusts in moist air. */
export function rustWhere(coating: Coating, isScratched: boolean): RustWhere {
  if (coating === Coating.None) return RustWhere.All;
  if (coating === Coating.Stainless || coating === Coating.Zinc) return RustWhere.None;
  return isScratched ? RustWhere.Scratch : RustWhere.None;
}

/** Iron rusts only with both air and water: tube A. */
export const tubeRusts = (t: RustTube): boolean => t === RustTube.A;

/** How much rust has formed after this many days, 0 to 1, where it rusts at all. */
export const rustAmount = (days: number): number =>
  Math.max(0, Math.min(1, (days - RUST_STARTS + 1) / (RUST_FULL - RUST_STARTS + 1)));

export const RustAction = {
  Wait: "wait",
  SetCoating: "setCoating",
  Scratch: "scratch",
  Reset: "reset",
} as const;
export const RustSignal = { Waited: "waited" } as const;
export const RustDerived = {
  Rust: "rust",
  Where: "where",
  RustedTubes: "rustedTubes",
  ZincCorrodes: "zincCorrodes",
} as const;
export const RustPart = {
  Tubes: "tubes",
  Nail: "nail",
  Days: "days",
  Wait: "wait",
  Coatings: "coatings",
  Scratch: "scratch",
} as const;

const rustState = z
  .object({
    mode: z.nativeEnum(RustMode),
    days: z.number().int().min(0).max(MAX_DAYS),
    coating: z.nativeEnum(Coating),
    isScratched: z.boolean(),
    /** The coatings the learner may pick, in protect mode (none: no picking). */
    coatings: z.array(z.nativeEnum(Coating)),
    canScratch: z.boolean(),
    showLabels: z.boolean(),
  })
  .strict();
export type RustState = z.infer<typeof rustState>;

export function describeRust(s: RustState): string {
  const amount = rustAmount(s.days);
  if (s.mode === RustMode.Conditions) {
    const a = amount > 0 ? "the nails in A are rusting" : "no rust yet anywhere";
    return `Activity 3.14 after ${s.days} day${s.days === 1 ? "" : "s"}: tube A (water and air), B (boiled water under oil, no air), C (dry air, no water); ${a}${amount > 0 ? "; B and C stay rust-free" : ""}.`;
  }
  const where = rustWhere(s.coating, s.isScratched);
  const coat = `${COATING_WORDS[s.coating].en}${s.isScratched ? ", scratched" : ""}`;
  const rust =
    amount === 0 || where === RustWhere.None
      ? s.coating === Coating.Zinc && s.isScratched && amount > 0
        ? "no rust: the zinc around the scratch corrodes instead of the iron"
        : "no rust"
      : where === RustWhere.Scratch
        ? "rust is starting at the scratch"
        : "rust all over";
  return `An iron nail in moist air, ${coat}, after ${s.days} day${s.days === 1 ? "" : "s"}: ${rust}.`;
}

const act = actionsFor<RustState>();

export const rustLab = defineProp({
  type: "rustLab",
  describe:
    "Rusting and its prevention (NCERT 3.5, Activity 3.14). Conditions: three tubes of iron nails over days, A with water and air (rusts), B with boiled water under oil (no air: no rust), C with dry air over anhydrous calcium chloride (no water: no rust), so iron needs both air and water to rust. Protect: one nail in moist air, bare, painted, greased, galvanised (zinc), tin-plated, chrome-plated or stainless steel, whole or scratched; a scratched coat lets rust start, except zinc, which is more reactive than iron and corrodes instead; stainless steel (an alloy) does not rust.",
  state: rustState,
  defaults: {
    mode: RustMode.Conditions,
    days: 0,
    coating: Coating.None,
    isScratched: false,
    coatings: [],
    canScratch: true,
    showLabels: true,
  },
  inputs: ["mode", "coatings", "canScratch", "showLabels"],
  derived: {
    [RustDerived.Rust]: {
      describe:
        "How much rust has formed where it can, 0 to 1 (in protect mode, 0 where the coating stops it)",
      compute: (s) =>
        s.mode === RustMode.Protect && rustWhere(s.coating, s.isScratched) === RustWhere.None
          ? 0
          : rustAmount(s.days),
    },
    [RustDerived.Where]: {
      describe: "In protect mode, where the nail rusts: none, scratch or all",
      compute: (s) => (s.mode === RustMode.Protect ? rustWhere(s.coating, s.isScratched) : null),
    },
    [RustDerived.RustedTubes]: {
      describe: "In conditions mode, the tubes whose nails have rusted",
      compute: (s) =>
        s.mode === RustMode.Conditions && rustAmount(s.days) > 0
          ? Object.values(RustTube).filter(tubeRusts)
          : [],
    },
    [RustDerived.ZincCorrodes]: {
      describe: "A scratched zinc coat: the zinc corrodes, protecting the iron",
      compute: (s) =>
        s.mode === RustMode.Protect &&
        s.coating === Coating.Zinc &&
        s.isScratched &&
        rustAmount(s.days) > 0,
    },
  },
  actions: {
    [RustAction.Wait]: act({
      describe: "Leave it for another day",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        const days = Math.min(MAX_DAYS, s.days + 1);
        return set({ days }, { signal: RustSignal.Waited, payload: { days } });
      },
    }),
    [RustAction.SetCoating]: act({
      describe: "Protect mode: pick the nail's coating (back to day 0, not scratched)",
      byLearner: true,
      args: z.object({ coating: z.nativeEnum(Coating) }).strict(),
      run: (s, a) =>
        s.coatings.includes(a.coating)
          ? set({ coating: a.coating, days: 0, isScratched: false })
          : set({}),
    }),
    [RustAction.Scratch]: act({
      describe: "Protect mode: scratch through the coating (back to day 0)",
      byLearner: true,
      args: z.object({}).strict(),
      run: () => set({ isScratched: true, days: 0 }),
    }),
    [RustAction.Reset]: act({
      describe: "Back to day 0 with fresh nails",
      byLearner: true,
      args: z.object({}).strict(),
      run: () => set({ days: 0, isScratched: false }),
    }),
  },
  signals: {
    [RustSignal.Waited]: { describe: "A day passed; the payload has the day count" },
  },
  observe: (s) => {
    const amount = rustAmount(s.days);
    const elements: Element[] = [{ id: RustPart.Days, value: `${s.days} days` }];
    if (s.mode === RustMode.Conditions)
      elements.push({
        id: RustPart.Tubes,
        value: Object.values(RustTube)
          .map(
            (t) =>
              `${t} (${TUBE_WORDS[t].en}): ${tubeRusts(t) && amount > 0 ? "rusting" : "no rust"}`,
          )
          .join("; "),
      });
    else
      elements.push({
        id: RustPart.Nail,
        value: describeRust(s),
      });
    return { summary: describeRust(s), elements };
  },
  parts: (s) => [
    s.mode === RustMode.Conditions ? RustPart.Tubes : RustPart.Nail,
    RustPart.Days,
    RustPart.Wait,
    ...(s.mode === RustMode.Protect && s.coatings.length > 1 ? [RustPart.Coatings] : []),
    ...(s.mode === RustMode.Protect && s.canScratch && s.coating !== Coating.None
      ? [RustPart.Scratch]
      : []),
  ],
});

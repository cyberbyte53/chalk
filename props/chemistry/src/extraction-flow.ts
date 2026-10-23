import { type Element, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import { METAL_NAMES, MetalElement } from "./metal-data";
import type { Words } from "./words";

/**
 * Getting a metal out of its ore (NCERT 3.4, Figs 3.9 and 3.10): the method depends on where the
 * metal sits in the reactivity series. The most reactive by electrolysis of the molten ore; the
 * middle ones by roasting (sulphide ores) or calcination (carbonate ores) to the oxide, then
 * reduction with carbon; the least reactive by heating alone; gold and silver are found free.
 * Every route starts with concentrating the ore and ends with refining.
 */

export const ExtractMetal = {
  Sodium: MetalElement.Sodium,
  Magnesium: MetalElement.Magnesium,
  Aluminium: MetalElement.Aluminium,
  Zinc: MetalElement.Zinc,
  Iron: MetalElement.Iron,
  Lead: MetalElement.Lead,
  Copper: MetalElement.Copper,
  Mercury: MetalElement.Mercury,
  Silver: MetalElement.Silver,
  Gold: MetalElement.Gold,
} as const;
export type ExtractMetal = (typeof ExtractMetal)[keyof typeof ExtractMetal];
export const EXTRACT_METALS: readonly ExtractMetal[] = Object.values(ExtractMetal);

export const OreKind = { Sulphide: "sulphide", Carbonate: "carbonate" } as const;
export type OreKind = (typeof OreKind)[keyof typeof OreKind];

export const Method = {
  Electrolysis: "electrolysis",
  Carbon: "carbon",
  HeatAlone: "heatAlone",
  Native: "native",
} as const;
export type Method = (typeof Method)[keyof typeof Method];

export const METHOD_WORDS: Record<Method, Words> = {
  electrolysis: { en: "electrolysis", hi: "विद्युत अपघटन" },
  carbon: { en: "reduction using carbon", hi: "कार्बन से अपचयन" },
  heatAlone: { en: "heating alone", hi: "केवल गरम करके" },
  native: { en: "found free (native)", hi: "मुक्त अवस्था में मिलता है" },
};

export const methodOf = (m: ExtractMetal): Method =>
  m === "Na" || m === "Mg" || m === "Al"
    ? Method.Electrolysis
    : m === "Zn" || m === "Fe" || m === "Pb"
      ? Method.Carbon
      : m === "Cu" || m === "Hg"
        ? Method.HeatAlone
        : Method.Native;

export type FlowStep = { name: Words; detail: Words; equations: string[] };

const w = (en: string, hi: string): Words => ({ en, hi });

const concentrate: FlowStep = {
  name: w("Concentrate the ore", "अयस्क का सांद्रण"),
  detail: w(
    "Remove the gangue (soil, sand) mixed with the mined ore.",
    "खनन किए अयस्क में मिली गैंग (मिट्टी, रेत) हटाओ।",
  ),
  equations: [],
};
const refine = (m: ExtractMetal): FlowStep => ({
  name: w("Refine it", "परिष्करण"),
  detail: w(
    `The ${METAL_NAMES[m].en} is still impure: refine it, often by electrolysis.`,
    `${METAL_NAMES[m].hi} अभी अशुद्ध है: इसका परिष्करण करो, अक्सर विद्युत अपघटन से।`,
  ),
  equations: [],
});
const metalStep = (m: ExtractMetal): FlowStep => ({
  name: w(`${cap(METAL_NAMES[m].en)} metal`, `${METAL_NAMES[m].hi} धातु`),
  detail: w("The metal, out of its compound.", "धातु, अपने यौगिक से अलग।"),
  equations: [],
});
const cap = (x: string) => x.charAt(0).toUpperCase() + x.slice(1);

/** The steps from ore to pure metal, for this metal (and, for zinc, this kind of ore). */
export function pathOf(m: ExtractMetal, ore: OreKind): FlowStep[] {
  const name = METAL_NAMES[m];
  switch (methodOf(m)) {
    case Method.Native:
      return [
        {
          name: w(`Free ${name.en}`, `मुक्त ${name.hi}`),
          detail: w(
            `${cap(name.en)} is so unreactive that it is found as the metal itself, mixed with rock.`,
            `${name.hi} इतना कम अभिक्रियाशील है कि धातु के रूप में ही, चट्टान में मिला हुआ मिलता है।`,
          ),
          equations: [],
        },
        {
          name: w("Separate it from the rock", "चट्टान से अलग करो"),
          detail: w(
            "Remove the rock and soil around the metal.",
            "धातु के आसपास की चट्टान और मिट्टी हटाओ।",
          ),
          equations: [],
        },
        refine(m),
      ];
    case Method.HeatAlone: {
      const isHg = m === "Hg";
      return [
        {
          name: w(
            isHg ? "Ore: cinnabar, HgS" : "Ore: Cu₂S",
            isHg ? "अयस्क: सिनेबार, HgS" : "अयस्क: Cu₂S",
          ),
          detail: w("A sulphide ore.", "एक सल्फ़ाइड अयस्क।"),
          equations: [],
        },
        concentrate,
        {
          name: w("Heat it in air", "हवा में गरम करो"),
          detail: w(
            isHg
              ? "Heating turns it into mercuric oxide, which heating alone then reduces to mercury."
              : "Heating turns some of it into copper(I) oxide, which reacts with the rest to give copper.",
            isHg
              ? "गरम करने पर यह मर्क्यूरिक ऑक्साइड बनता है, जो और गरम करने पर ही पारे में अपचयित होता है।"
              : "गरम करने पर इसका कुछ भाग कॉपर(I) ऑक्साइड बनता है, जो बचे भाग से अभिक्रिया करके ताँबा देता है।",
          ),
          equations: isHg
            ? ["2HgS + 3O₂ → 2HgO + 2SO₂", "2HgO → 2Hg + O₂"]
            : ["2Cu₂S + 3O₂ → 2Cu₂O + 2SO₂", "2Cu₂O + Cu₂S → 6Cu + SO₂"],
        },
        metalStep(m),
        refine(m),
      ];
    }
    case Method.Carbon: {
      const isZn = m === "Zn";
      const sulphide = ore === OreKind.Sulphide;
      return [
        {
          name: w(
            isZn
              ? sulphide
                ? "Ore: ZnS (sulphide)"
                : "Ore: ZnCO₃ (carbonate)"
              : `Ore of ${name.en}`,
            isZn
              ? sulphide
                ? "अयस्क: ZnS (सल्फ़ाइड)"
                : "अयस्क: ZnCO₃ (कार्बोनेट)"
              : `${name.hi} का अयस्क`,
          ),
          detail: w(
            "Middle metals are found as oxides, sulphides or carbonates.",
            "बीच की धातुएँ ऑक्साइड, सल्फ़ाइड या कार्बोनेट के रूप में मिलती हैं।",
          ),
          equations: [],
        },
        concentrate,
        sulphide
          ? {
              name: w("Roasting", "भर्जन"),
              detail: w(
                "Heat the sulphide ore strongly in plenty of air: it becomes the oxide.",
                "सल्फ़ाइड अयस्क को भरपूर हवा में तेज़ गरम करो: यह ऑक्साइड बन जाता है।",
              ),
              equations: isZn ? ["2ZnS + 3O₂ → 2ZnO + 2SO₂"] : [],
            }
          : {
              name: w("Calcination", "निस्तापन"),
              detail: w(
                "Heat the carbonate ore strongly in a limited supply of air: it becomes the oxide.",
                "कार्बोनेट अयस्क को सीमित हवा में तेज़ गरम करो: यह ऑक्साइड बन जाता है।",
              ),
              equations: isZn ? ["ZnCO₃ → ZnO + CO₂"] : [],
            },
        {
          name: w(isZn ? "The oxide, ZnO" : "The metal oxide", isZn ? "ऑक्साइड, ZnO" : "धातु ऑक्साइड"),
          detail: w(
            "A metal is easier to get from its oxide than from its sulphide or carbonate.",
            "धातु को सल्फ़ाइड या कार्बोनेट की तुलना में ऑक्साइड से निकालना आसान है।",
          ),
          equations: [],
        },
        {
          name: w("Reduce it with carbon", "कार्बन से अपचयन"),
          detail: w(
            "Heat the oxide with carbon (coke): the carbon takes the oxygen.",
            "ऑक्साइड को कार्बन (कोक) के साथ गरम करो: कार्बन ऑक्सीजन ले लेता है।",
          ),
          equations: isZn ? ["ZnO + C → Zn + CO"] : [],
        },
        metalStep(m),
        refine(m),
      ];
    }
    case Method.Electrolysis:
      return [
        {
          name: w(
            m === "Al" ? "Ore: aluminium oxide" : `Ore: ${name.en} chloride`,
            m === "Al" ? "अयस्क: ऐलुमिनियम ऑक्साइड" : `अयस्क: ${name.hi} क्लोराइड`,
          ),
          detail: w(
            "The most reactive metals are never found free.",
            "सबसे अधिक अभिक्रियाशील धातुएँ कभी मुक्त नहीं मिलतीं।",
          ),
          equations: [],
        },
        concentrate,
        {
          name: w("Electrolysis of the molten ore", "पिघले अयस्क का विद्युत अपघटन"),
          detail: w(
            "Carbon can't take the oxygen from these metals: they hold it more strongly. So melt the compound and pass electricity: the metal collects at the cathode (−).",
            "कार्बन इन धातुओं से ऑक्सीजन नहीं ले सकता: ये उसे ज़्यादा मज़बूती से पकड़ती हैं। इसलिए यौगिक को पिघलाकर बिजली प्रवाहित करो: धातु कैथोड (−) पर जमा होती है।",
          ),
          equations:
            m === "Na"
              ? ["(−) Na⁺ + e⁻ → Na", "(+) 2Cl⁻ → Cl₂ + 2e⁻"]
              : m === "Mg"
                ? ["(−) Mg²⁺ + 2e⁻ → Mg", "(+) 2Cl⁻ → Cl₂ + 2e⁻"]
                : [],
        },
        metalStep(m),
        refine(m),
      ];
  }
}

export const FlowAction = {
  Next: "next",
  GoTo: "goTo",
  ChooseMetal: "chooseMetal",
  ChooseOre: "chooseOre",
} as const;
export const FlowSignal = { Stepped: "stepped" } as const;
export const FlowDerived = {
  Method: "method",
  Steps: "steps",
  IsDone: "isDone",
  StepName: "stepName",
} as const;
export const FlowPart = {
  Series: "series",
  Path: "path",
  Detail: "detail",
  Next: "next",
  Metals: "metals",
  Ores: "ores",
} as const;

const flowState = z
  .object({
    metal: z.nativeEnum(ExtractMetal),
    /** Only for zinc (and other middle metals): which kind of ore. */
    ore: z.nativeEnum(OreKind),
    /** The step reached along the path (0 = the ore). */
    step: z.number().int().min(0).max(7),
    canStep: z.boolean(),
    /** Show the series with its three bands (Fig 3.9) beside the path. */
    showSeries: z.boolean(),
    /** The metals the learner may pick (none: no picking). */
    metals: z.array(z.nativeEnum(ExtractMetal)),
  })
  .strict();
export type FlowState = z.infer<typeof flowState>;

export function describeFlow(s: FlowState): string {
  const path = pathOf(s.metal, s.ore);
  const at = path[Math.min(s.step, path.length - 1)] as FlowStep;
  return `Extracting ${METAL_NAMES[s.metal].en} (method: ${METHOD_WORDS[methodOf(s.metal)].en}): ${path.map((p) => p.name.en).join(" → ")}. Now at step ${Math.min(s.step, path.length - 1) + 1} of ${path.length}: ${at.name.en}. ${at.detail.en}${at.equations.length > 0 ? ` ${at.equations.join("; ")}.` : ""}`;
}

const act = actionsFor<FlowState>();

export const extractionFlow = defineProp({
  type: "extractionFlow",
  describe:
    "Getting a metal from its ore (NCERT 3.4, Figs 3.9 and 3.10), step by step. The method follows the reactivity series: Na, Mg, Al by electrolysis of the molten ore; Zn, Fe, Pb by roasting a sulphide ore or calcining a carbonate ore to the oxide, then reducing it with carbon; Hg and Cu from sulphide ores by heating alone; Ag and Au are found free. Every route starts by concentrating the ore (removing the gangue) and ends with refining. The equations NCERT gives are shown at each step.",
  state: flowState,
  defaults: {
    metal: ExtractMetal.Zinc,
    ore: OreKind.Sulphide,
    step: 0,
    canStep: true,
    showSeries: true,
    metals: [],
  },
  inputs: ["canStep", "showSeries", "metals"],
  invariant: (s) =>
    s.step < pathOf(s.metal, s.ore).length ? undefined : "the step must be on the metal's path",
  derived: {
    [FlowDerived.Method]: {
      describe: "How this metal is extracted: electrolysis, carbon, heatAlone or native",
      compute: (s) => methodOf(s.metal),
    },
    [FlowDerived.Steps]: {
      describe: "How many steps the path has",
      compute: (s) => pathOf(s.metal, s.ore).length,
    },
    [FlowDerived.IsDone]: {
      describe: "The last step (refining) is reached",
      compute: (s) => s.step === pathOf(s.metal, s.ore).length - 1,
    },
    [FlowDerived.StepName]: {
      describe: "The step now shown, in words",
      compute: (s) => (pathOf(s.metal, s.ore)[s.step] as FlowStep).name.en,
    },
  },
  actions: {
    [FlowAction.Next]: act({
      describe: "Go one step along the path (after refining, back to the ore)",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        const step = (s.step + 1) % pathOf(s.metal, s.ore).length;
        return set({ step }, { signal: FlowSignal.Stepped, payload: { step } });
      },
    }),
    [FlowAction.GoTo]: act({
      describe: "Show one step of the path",
      args: z.object({ step: z.number().int().min(0).max(7) }).strict(),
      run: (s, a) => {
        const step = Math.min(a.step, pathOf(s.metal, s.ore).length - 1);
        return set({ step }, { signal: FlowSignal.Stepped, payload: { step } });
      },
    }),
    [FlowAction.ChooseMetal]: act({
      describe: "Pick a metal (back to its ore)",
      byLearner: true,
      args: z.object({ metal: z.nativeEnum(ExtractMetal) }).strict(),
      run: (s, a) =>
        s.metals.includes(a.metal)
          ? set({ metal: a.metal, step: 0 }, { signal: FlowSignal.Stepped, payload: { step: 0 } })
          : set({}),
    }),
    [FlowAction.ChooseOre]: act({
      describe: "For a middle metal, pick a sulphide or a carbonate ore (back to the ore)",
      byLearner: true,
      args: z.object({ ore: z.nativeEnum(OreKind) }).strict(),
      run: (_s, a) =>
        set({ ore: a.ore, step: 0 }, { signal: FlowSignal.Stepped, payload: { step: 0 } }),
    }),
  },
  signals: {
    [FlowSignal.Stepped]: { describe: "The path moved to a step; the payload has the step" },
  },
  observe: (s) => {
    const path = pathOf(s.metal, s.ore);
    const at = path[s.step] as FlowStep;
    const elements: Element[] = [
      {
        id: FlowPart.Path,
        value: path.map((p, i) => (i === s.step ? `[${p.name.en}]` : p.name.en)).join(" → "),
      },
      {
        id: FlowPart.Detail,
        value: `${at.detail.en}${at.equations.length > 0 ? ` ${at.equations.join("; ")}` : ""}`,
      },
    ];
    if (s.showSeries)
      elements.push({
        id: FlowPart.Series,
        value: `K, Na, Ca, Mg, Al: electrolysis; Zn, Fe, Pb: reduction using carbon; Cu, Hg: heating alone; Ag, Au: found free. ${s.metal} picked out.`,
      });
    return { summary: describeFlow(s), elements };
  },
  parts: (s) => [
    ...(s.showSeries ? [FlowPart.Series] : []),
    FlowPart.Path,
    FlowPart.Detail,
    ...(s.canStep ? [FlowPart.Next] : []),
    ...(s.metals.length > 1 ? [FlowPart.Metals] : []),
    ...(methodOf(s.metal) === Method.Carbon ? [FlowPart.Ores] : []),
  ],
});

import { type Element, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import {
  METAL_NAMES,
  MetalElement,
  REACTIVITY_SERIES,
  isAboveHydrogen,
  isMoreReactive,
} from "./metal-data";
import type { Words } from "./words";

/**
 * How metals react (NCERT 3.2.1–3.2.5): a piece of one metal heated in air, dropped into cold
 * water, hot water, steam, dilute hydrochloric acid, or a solution of another metal's salt. What
 * is seen follows the reactivity series: how fast the bubbles come, a flame, the metal floating,
 * the tube warming, a coating and a colour change when one metal displaces another.
 */

/** The metals on the bench (mercury stays off it). */
export const LabMetal = {
  Potassium: MetalElement.Potassium,
  Sodium: MetalElement.Sodium,
  Calcium: MetalElement.Calcium,
  Magnesium: MetalElement.Magnesium,
  Aluminium: MetalElement.Aluminium,
  Zinc: MetalElement.Zinc,
  Iron: MetalElement.Iron,
  Lead: MetalElement.Lead,
  Copper: MetalElement.Copper,
  Silver: MetalElement.Silver,
  Gold: MetalElement.Gold,
} as const;
export type LabMetal = (typeof LabMetal)[keyof typeof LabMetal];
export const LAB_METALS: readonly LabMetal[] = Object.values(LabMetal);

export const Reagent = {
  Air: "air",
  ColdWater: "coldWater",
  HotWater: "hotWater",
  Steam: "steam",
  DiluteAcid: "diluteAcid",
  SodiumChloride: "NaCl",
  MagnesiumChloride: "MgCl2",
  ZincSulphate: "ZnSO4",
  IronSulphate: "FeSO4",
  CopperSulphate: "CuSO4",
  SilverNitrate: "AgNO3",
} as const;
export type Reagent = (typeof Reagent)[keyof typeof Reagent];
export const REAGENTS: readonly Reagent[] = Object.values(Reagent);

/** How strongly it reacts, from nothing to violent; NotDone: never tried on a school bench. */
export const Intensity = {
  None: 0,
  Slow: 1,
  Steady: 2,
  Fast: 3,
  Violent: 4,
} as const;
export type Intensity = (typeof Intensity)[keyof typeof Intensity];

type SaltInfo = {
  metal: MetalElement;
  formula: string;
  name: Words;
  anion: Words;
  /** The solution's colour class: colourless, pale green, blue. */
  colour: SolutionColour;
};

export const SolutionColour = {
  Colourless: "colourless",
  PaleGreen: "paleGreen",
  Blue: "blue",
} as const;
export type SolutionColour = (typeof SolutionColour)[keyof typeof SolutionColour];

const COLOUR_WORDS: Record<SolutionColour, Words> = {
  colourless: { en: "colourless", hi: "रंगहीन" },
  paleGreen: { en: "pale green", hi: "हल्का हरा" },
  blue: { en: "blue", hi: "नीला" },
};

export const SALTS: Record<
  Exclude<Reagent, "air" | "coldWater" | "hotWater" | "steam" | "diluteAcid">,
  SaltInfo
> = {
  NaCl: {
    metal: MetalElement.Sodium,
    formula: "NaCl",
    name: { en: "sodium chloride", hi: "सोडियम क्लोराइड" },
    anion: { en: "chloride", hi: "क्लोराइड" },
    colour: SolutionColour.Colourless,
  },
  MgCl2: {
    metal: MetalElement.Magnesium,
    formula: "MgCl₂",
    name: { en: "magnesium chloride", hi: "मैग्नीशियम क्लोराइड" },
    anion: { en: "chloride", hi: "क्लोराइड" },
    colour: SolutionColour.Colourless,
  },
  ZnSO4: {
    metal: MetalElement.Zinc,
    formula: "ZnSO₄",
    name: { en: "zinc sulphate", hi: "ज़िंक सल्फ़ेट" },
    anion: { en: "sulphate", hi: "सल्फ़ेट" },
    colour: SolutionColour.Colourless,
  },
  FeSO4: {
    metal: MetalElement.Iron,
    formula: "FeSO₄",
    name: { en: "iron(II) sulphate", hi: "आयरन(II) सल्फ़ेट" },
    anion: { en: "sulphate", hi: "सल्फ़ेट" },
    colour: SolutionColour.PaleGreen,
  },
  CuSO4: {
    metal: MetalElement.Copper,
    formula: "CuSO₄",
    name: { en: "copper(II) sulphate", hi: "कॉपर(II) सल्फ़ेट" },
    anion: { en: "sulphate", hi: "सल्फ़ेट" },
    colour: SolutionColour.Blue,
  },
  AgNO3: {
    metal: MetalElement.Silver,
    formula: "AgNO₃",
    name: { en: "silver nitrate", hi: "सिल्वर नाइट्रेट" },
    anion: { en: "nitrate", hi: "नाइट्रेट" },
    colour: SolutionColour.Colourless,
  },
};
type SaltReagent = keyof typeof SALTS;
export const isSalt = (r: Reagent): r is SaltReagent => r in SALTS;

export const REAGENT_NAMES: Record<Reagent, Words> = {
  air: { en: "heat in a flame", hi: "लौ में गरम करो" },
  coldWater: { en: "cold water", hi: "ठंडा पानी" },
  hotWater: { en: "hot water", hi: "गरम पानी" },
  steam: { en: "steam", hi: "भाप" },
  diluteAcid: { en: "dilute HCl", hi: "तनु HCl" },
  NaCl: { en: "NaCl solution", hi: "NaCl विलयन" },
  MgCl2: { en: "MgCl₂ solution", hi: "MgCl₂ विलयन" },
  ZnSO4: { en: "ZnSO₄ solution", hi: "ZnSO₄ विलयन" },
  FeSO4: { en: "FeSO₄ solution", hi: "FeSO₄ विलयन" },
  CuSO4: { en: "CuSO₄ solution", hi: "CuSO₄ विलयन" },
  AgNO3: { en: "AgNO₃ solution", hi: "AgNO₃ विलयन" },
};

/** The colour of each metal's salt in solution (for the colour a displacement leaves). */
const SALT_COLOUR_OF: Partial<Record<MetalElement, SolutionColour>> = {
  Fe: SolutionColour.PaleGreen,
  Cu: SolutionColour.Blue,
};

export type ReactionOutcome = {
  /** Null: not done on a school bench (it is too violent, or the metal reacts with the water). */
  intensity: Intensity | null;
  seen: Words;
  /** Hydrogen gas comes off. */
  givesHydrogen: boolean;
  /** It catches fire. */
  isOnFire: boolean;
  /** It floats on bubbles of hydrogen stuck to it. */
  floats: boolean;
  /** A salt solution: the metal displaced the salt's metal. */
  displaces: boolean;
  /** The metal deposited as a coat, for a displacement. */
  deposit: MetalElement | null;
  /** The solution's colour before and after. */
  colourBefore: SolutionColour | null;
  colourAfter: SolutionColour | null;
  /** The colour of a coat that forms on the metal in air: white, black or none. */
  coat: "white" | "black" | null;
  /** The NCERT equation, with Unicode subscripts, if it gives one. */
  equation: string | null;
};

const base = {
  givesHydrogen: false,
  isOnFire: false,
  floats: false,
  displaces: false,
  deposit: null,
  colourBefore: null,
  colourAfter: null,
  coat: null,
  equation: null,
} as const;

const w = (en: string, hi: string): Words => ({ en, hi });

function inAir(m: LabMetal): ReactionOutcome {
  switch (m) {
    case "K":
    case "Na":
      return {
        ...base,
        intensity: Intensity.Violent,
        isOnFire: true,
        coat: "white",
        seen: w(
          "it catches fire at once and burns: that's why it is kept under kerosene",
          "तुरंत आग पकड़कर जलता है: इसीलिए इसे केरोसिन में रखते हैं",
        ),
      };
    case "Ca":
      return {
        ...base,
        intensity: Intensity.Fast,
        isOnFire: true,
        coat: "white",
        seen: w(
          "it burns with a red flame, leaving a white oxide",
          "लाल लौ से जलता है, सफ़ेद ऑक्साइड बचता है",
        ),
      };
    case "Mg":
      return {
        ...base,
        intensity: Intensity.Fast,
        isOnFire: true,
        coat: "white",
        seen: w(
          "it burns with a dazzling white flame, leaving white ash (MgO)",
          "चौंधियाती सफ़ेद लौ से जलता है, सफ़ेद राख (MgO) बचती है",
        ),
        equation: "2Mg + O₂ → 2MgO",
      };
    case "Al":
      return {
        ...base,
        intensity: Intensity.Steady,
        coat: "white",
        seen: w(
          "a piece doesn't catch fire; it gets a white coat of aluminium oxide",
          "टुकड़ा आग नहीं पकड़ता; उस पर ऐलुमिनियम ऑक्साइड की सफ़ेद परत चढ़ती है",
        ),
        equation: "4Al + 3O₂ → 2Al₂O₃",
      };
    case "Zn":
      return {
        ...base,
        intensity: Intensity.Steady,
        coat: "white",
        seen: w(
          "strongly heated, it burns, leaving white zinc oxide",
          "तेज़ गरम करने पर जलता है, सफ़ेद ज़िंक ऑक्साइड बचता है",
        ),
      };
    case "Fe":
      return {
        ...base,
        intensity: Intensity.Slow,
        coat: "black",
        seen: w(
          "a nail doesn't burn, but iron filings sprinkled in the flame burn with sparks",
          "कील नहीं जलती, पर लौ पर छिड़का लोहे का बुरादा चिंगारियों के साथ जलता है",
        ),
      };
    case "Pb":
      return {
        ...base,
        intensity: Intensity.Slow,
        coat: "white",
        seen: w(
          "it doesn't burn; it gets a dull coat of oxide",
          "नहीं जलता; ऑक्साइड की फीकी परत चढ़ती है",
        ),
      };
    case "Cu":
      return {
        ...base,
        intensity: Intensity.Slow,
        coat: "black",
        seen: w(
          "it doesn't burn; the hot metal gets a black coat of copper(II) oxide",
          "नहीं जलता; गरम धातु पर कॉपर(II) ऑक्साइड की काली परत चढ़ती है",
        ),
        equation: "2Cu + O₂ → 2CuO",
      };
    case "Ag":
    case "Au":
      return {
        ...base,
        intensity: Intensity.None,
        seen: w("no change at all, even at a high temperature", "कोई बदलाव नहीं, ऊँचे ताप पर भी"),
      };
  }
}

const reactsWithColdWater = (m: LabMetal) => m === "K" || m === "Na" || m === "Ca";

function inWater(m: LabMetal, r: "coldWater" | "hotWater" | "steam"): ReactionOutcome {
  if (r !== "coldWater" && reactsWithColdWater(m))
    return {
      ...base,
      intensity: null,
      seen: w(
        "not needed: it already reacts with cold water",
        "ज़रूरत नहीं: यह ठंडे पानी से ही अभिक्रिया करता है",
      ),
    };
  if (m === "K" || m === "Na")
    return {
      ...base,
      intensity: Intensity.Violent,
      givesHydrogen: true,
      isOnFire: true,
      seen: w(
        "it reacts violently; so much heat that the hydrogen catches fire",
        "तीव्र अभिक्रिया; इतनी ऊष्मा कि हाइड्रोजन आग पकड़ लेती है",
      ),
      equation: m === "K" ? "2K + 2H₂O → 2KOH + H₂" : "2Na + 2H₂O → 2NaOH + H₂",
    };
  if (m === "Ca")
    return {
      ...base,
      intensity: Intensity.Steady,
      givesHydrogen: true,
      floats: true,
      seen: w(
        "it fizzes, less violently; hydrogen bubbles stick to it and it floats; no fire",
        "कम तेज़ी से बुलबुले; हाइड्रोजन के बुलबुले चिपककर इसे तैरा देते हैं; आग नहीं",
      ),
      equation: "Ca + 2H₂O → Ca(OH)₂ + H₂",
    };
  if (m === "Mg") {
    if (r === "coldWater")
      return {
        ...base,
        intensity: Intensity.None,
        seen: w("no reaction with cold water", "ठंडे पानी से कोई अभिक्रिया नहीं"),
      };
    if (r === "hotWater")
      return {
        ...base,
        intensity: Intensity.Steady,
        givesHydrogen: true,
        floats: true,
        seen: w(
          "it reacts with hot water: hydrogen bubbles, and it floats",
          "गरम पानी से अभिक्रिया: हाइड्रोजन के बुलबुले, और यह तैरने लगता है",
        ),
      };
    return {
      ...base,
      intensity: Intensity.Fast,
      givesHydrogen: true,
      seen: w("it reacts with steam: its oxide and hydrogen", "भाप से अभिक्रिया: ऑक्साइड और हाइड्रोजन"),
    };
  }
  if (m === "Al" || m === "Zn" || m === "Fe") {
    if (r !== "steam")
      return {
        ...base,
        intensity: Intensity.None,
        seen:
          r === "coldWater"
            ? w("no reaction with cold water", "ठंडे पानी से कोई अभिक्रिया नहीं")
            : w("no reaction, even with hot water", "गरम पानी से भी कोई अभिक्रिया नहीं"),
      };
    return {
      ...base,
      intensity: Intensity.Steady,
      givesHydrogen: true,
      seen: w(
        "it reacts with steam: the metal oxide and hydrogen",
        "भाप से अभिक्रिया: धातु ऑक्साइड और हाइड्रोजन",
      ),
      equation:
        m === "Al"
          ? "2Al + 3H₂O → Al₂O₃ + 3H₂"
          : m === "Fe"
            ? "3Fe + 4H₂O → Fe₃O₄ + 4H₂"
            : "Zn + H₂O → ZnO + H₂",
    };
  }
  return {
    ...base,
    intensity: Intensity.None,
    seen:
      r === "steam"
        ? w("no reaction, even with steam", "भाप से भी कोई अभिक्रिया नहीं")
        : w("no reaction with water", "पानी से कोई अभिक्रिया नहीं"),
  };
}

function inAcid(m: LabMetal): ReactionOutcome {
  switch (m) {
    case "K":
    case "Na":
      return {
        ...base,
        intensity: null,
        seen: w(
          "never done: it reacts violently even with water",
          "कभी नहीं करते: यह पानी से ही तीव्र अभिक्रिया करता है",
        ),
      };
    case "Ca":
      return {
        ...base,
        intensity: Intensity.Violent,
        givesHydrogen: true,
        seen: w("it fizzes very fast and gets very hot", "बहुत तेज़ बुलबुले, और बहुत गरम"),
      };
    case "Mg":
      return {
        ...base,
        intensity: Intensity.Fast,
        givesHydrogen: true,
        seen: w(
          "bubbles come fastest of all, and the tube gets the hottest",
          "सबसे तेज़ बुलबुले, और नली सबसे ज़्यादा गरम",
        ),
        equation: "Mg + 2HCl → MgCl₂ + H₂",
      };
    case "Al":
      return {
        ...base,
        intensity: Intensity.Fast,
        givesHydrogen: true,
        seen: w("quick bubbles, a little slower than magnesium", "तेज़ बुलबुले, मैग्नीशियम से थोड़े धीमे"),
        equation: "2Al + 6HCl → 2AlCl₃ + 3H₂",
      };
    case "Zn":
      return {
        ...base,
        intensity: Intensity.Steady,
        givesHydrogen: true,
        seen: w("steady bubbles of hydrogen", "हाइड्रोजन के लगातार बुलबुले"),
        equation: "Zn + 2HCl → ZnCl₂ + H₂",
      };
    case "Fe":
      return {
        ...base,
        intensity: Intensity.Slow,
        givesHydrogen: true,
        seen: w("slow bubbles of hydrogen", "हाइड्रोजन के धीमे बुलबुले"),
        equation: "Fe + 2HCl → FeCl₂ + H₂",
      };
    case "Pb":
      return {
        ...base,
        intensity: Intensity.Slow,
        givesHydrogen: true,
        seen: w("only a very few bubbles", "बस बहुत कम बुलबुले"),
      };
    case "Cu":
    case "Ag":
    case "Au":
      return {
        ...base,
        intensity: Intensity.None,
        seen: w(
          "no bubbles, and the temperature stays the same",
          "कोई बुलबुला नहीं, और ताप वही रहता है",
        ),
      };
  }
}

function inSalt(m: LabMetal, r: SaltReagent): ReactionOutcome {
  const salt = SALTS[r];
  const name = METAL_NAMES[m];
  const other = METAL_NAMES[salt.metal];
  const colourBefore = salt.colour;
  if (reactsWithColdWater(m))
    return {
      ...base,
      intensity: null,
      colourBefore,
      colourAfter: colourBefore,
      seen: w(
        "not done: it reacts with the water in the solution instead",
        "नहीं करते: यह विलयन के पानी से ही अभिक्रिया करता है",
      ),
    };
  if (m === salt.metal)
    return {
      ...base,
      intensity: Intensity.None,
      colourBefore,
      colourAfter: colourBefore,
      seen: w("no change: it is the same metal", "कोई बदलाव नहीं: वही धातु है"),
    };
  if (!isMoreReactive(m, salt.metal))
    return {
      ...base,
      intensity: Intensity.None,
      colourBefore,
      colourAfter: colourBefore,
      seen: w(
        `no change: ${name.en} is less reactive than ${other.en}`,
        `कोई बदलाव नहीं: ${name.hi}, ${other.hi} से कम अभिक्रियाशील है`,
      ),
    };
  const colourAfter = SALT_COLOUR_OF[m] ?? SolutionColour.Colourless;
  const colourChange =
    colourAfter === colourBefore
      ? w(
          `the solution stays ${COLOUR_WORDS[colourBefore].en}`,
          `विलयन ${COLOUR_WORDS[colourBefore].hi} ही रहता है`,
        )
      : w(
          `the ${COLOUR_WORDS[colourBefore].en} solution turns ${COLOUR_WORDS[colourAfter].en}`,
          `${COLOUR_WORDS[colourBefore].hi} विलयन ${COLOUR_WORDS[colourAfter].hi} हो जाता है`,
        );
  return {
    ...base,
    intensity: m === "Pb" ? Intensity.Slow : Intensity.Steady,
    displaces: true,
    deposit: salt.metal,
    colourBefore,
    colourAfter,
    seen: w(
      `a coat of ${other.en} forms on the ${name.en}, and ${colourChange.en}: ${name.en} displaces ${other.en}`,
      `${name.hi} पर ${other.hi} की परत जमती है, और ${colourChange.hi}: ${name.hi} ने ${other.hi} को विस्थापित किया`,
    ),
    equation:
      m === "Fe" && r === "CuSO4"
        ? "Fe + CuSO₄ → FeSO₄ + Cu"
        : m === "Zn" && r === "CuSO4"
          ? "Zn + CuSO₄ → ZnSO₄ + Cu"
          : m === "Zn" && r === "FeSO4"
            ? "Zn + FeSO₄ → ZnSO₄ + Fe"
            : m === "Cu" && r === "AgNO3"
              ? "Cu + 2AgNO₃ → Cu(NO₃)₂ + 2Ag"
              : null,
  };
}

/** What happens when this metal meets this reagent. */
export function reactionOf(m: LabMetal, r: Reagent): ReactionOutcome {
  if (r === Reagent.Air) return inAir(m);
  if (r === Reagent.ColdWater || r === Reagent.HotWater || r === Reagent.Steam)
    return inWater(m, r);
  if (r === Reagent.DiluteAcid) return inAcid(m);
  return inSalt(m, r);
}

export { COLOUR_WORDS as SOLUTION_COLOUR_WORDS };

export const ReactivityAction = {
  ChooseMetal: "chooseMetal",
  ChooseReagent: "chooseReagent",
  Start: "start",
  Reset: "reset",
} as const;
export const ReactivitySignal = { Started: "started" } as const;
export const ReactivityDerived = {
  Intensity: "intensity",
  GivesHydrogen: "givesHydrogen",
  Displaces: "displaces",
  IsAboveHydrogen: "isAboveHydrogen",
  Seen: "seen",
} as const;
export const ReactivityPart = {
  Apparatus: "apparatus",
  Seen: "seen",
  Equation: "equation",
  Thermometer: "thermometer",
  Series: "series",
  Metals: "metals",
  Reagents: "reagents",
  Start: "start",
} as const;

const reactivityState = z
  .object({
    metal: z.nativeEnum(LabMetal),
    reagent: z.nativeEnum(Reagent),
    isStarted: z.boolean(),
    /** The metals the learner may pick (in order). */
    metals: z.array(z.nativeEnum(LabMetal)).min(1),
    /** The reagents the learner may pick (in order). */
    reagents: z.array(z.nativeEnum(Reagent)).min(1),
    /** A thermometer in the tube (Activity 3.11). */
    showThermometer: z.boolean(),
    /** The reactivity series (Table 3.2) beside the bench, the metal picked out. */
    showSeries: z.boolean(),
    /** Show NCERT's equation once it has happened. */
    showEquation: z.boolean(),
    canChoose: z.boolean(),
  })
  .strict();
export type ReactivityState = z.infer<typeof reactivityState>;

export function describeReactivity(s: ReactivityState): string {
  const o = reactionOf(s.metal, s.reagent);
  const what = `${METAL_NAMES[s.metal].en} with ${REAGENT_NAMES[s.reagent].en}`;
  if (!s.isStarted) return `Ready: ${what}; not started.`;
  return `${what}: ${o.seen.en}.`;
}

const act = actionsFor<ReactivityState>();

export const reactivityLab = defineProp({
  type: "reactivityLab",
  describe:
    "How metals react (NCERT 3.2): a metal (K, Na, Ca, Mg, Al, Zn, Fe, Pb, Cu, Ag, Au) heated in a flame, in cold water, hot water, steam, dilute hydrochloric acid, or a solution of another metal's salt (NaCl, MgCl₂, ZnSO₄, FeSO₄, CuSO₄, AgNO₃). What is seen follows the reactivity series: K and Na catch fire in air and in water, Ca floats in cold water, Mg needs hot water, Al, Zn and Fe only steam; with acid the bubbles come fastest for Mg then Al, Zn, Fe, none for Cu; a metal coats itself with a less reactive metal from its salt and the solution changes colour. Not done on a school bench: K and Na with acid, and the reactive metals in salt solutions.",
  state: reactivityState,
  defaults: {
    metal: LabMetal.Magnesium,
    reagent: Reagent.DiluteAcid,
    isStarted: false,
    metals: [...LAB_METALS],
    reagents: [...REAGENTS],
    showThermometer: false,
    showSeries: false,
    showEquation: true,
    canChoose: true,
  },
  inputs: ["metals", "reagents", "showThermometer", "showSeries", "showEquation", "canChoose"],
  invariant: (s) =>
    s.metals.includes(s.metal) && s.reagents.includes(s.reagent)
      ? undefined
      : "the metal and the reagent must be among the ones offered",
  derived: {
    [ReactivityDerived.Intensity]: {
      describe:
        "Once started: how strongly it reacts, 0 (nothing) to 4 (violent); null if it isn't done on a school bench",
      compute: (s) => (s.isStarted ? reactionOf(s.metal, s.reagent).intensity : null),
    },
    [ReactivityDerived.GivesHydrogen]: {
      describe: "Once started: hydrogen gas comes off",
      compute: (s) => s.isStarted && reactionOf(s.metal, s.reagent).givesHydrogen,
    },
    [ReactivityDerived.Displaces]: {
      describe: "Once started, in a salt solution: the metal displaced the salt's metal",
      compute: (s) => s.isStarted && reactionOf(s.metal, s.reagent).displaces,
    },
    [ReactivityDerived.IsAboveHydrogen]: {
      describe: "The metal is above hydrogen in the reactivity series",
      compute: (s) => isAboveHydrogen(s.metal),
    },
    [ReactivityDerived.Seen]: {
      describe: "Once started, what is seen, in words; null before",
      compute: (s) => (s.isStarted ? reactionOf(s.metal, s.reagent).seen.en : null),
    },
  },
  actions: {
    [ReactivityAction.ChooseMetal]: act({
      describe: "Pick the metal (not started yet)",
      byLearner: true,
      args: z.object({ metal: z.nativeEnum(LabMetal) }).strict(),
      run: (s, a) =>
        set({ metal: s.metals.includes(a.metal) ? a.metal : s.metal, isStarted: false }),
    }),
    [ReactivityAction.ChooseReagent]: act({
      describe: "Pick what the metal goes into (not started yet)",
      byLearner: true,
      args: z.object({ reagent: z.nativeEnum(Reagent) }).strict(),
      run: (s, a) =>
        set({ reagent: s.reagents.includes(a.reagent) ? a.reagent : s.reagent, isStarted: false }),
    }),
    [ReactivityAction.Start]: act({
      describe: "Put the metal in (or in the flame) and watch",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        const o = reactionOf(s.metal, s.reagent);
        return set(
          { isStarted: true },
          {
            signal: ReactivitySignal.Started,
            payload: {
              metal: s.metal,
              reagent: s.reagent,
              intensity: o.intensity,
              displaces: o.displaces,
              givesHydrogen: o.givesHydrogen,
            },
          },
        );
      },
    }),
    [ReactivityAction.Reset]: act({
      describe: "Take the metal out and start again",
      byLearner: true,
      args: z.object({}).strict(),
      run: () => set({ isStarted: false }),
    }),
  },
  signals: {
    [ReactivitySignal.Started]: {
      describe:
        "A metal went into a reagent; the payload has the metal, the reagent, the intensity (0–4, or null if not done), whether it displaced and whether hydrogen came off",
    },
  },
  observe: (s) => {
    const o = reactionOf(s.metal, s.reagent);
    const elements: Element[] = [
      {
        id: ReactivityPart.Apparatus,
        value: `${METAL_NAMES[s.metal].en}, ${REAGENT_NAMES[s.reagent].en}`,
      },
    ];
    if (s.isStarted) elements.push({ id: ReactivityPart.Seen, value: o.seen.en });
    if (s.isStarted && s.showEquation && o.equation !== null)
      elements.push({ id: ReactivityPart.Equation, value: o.equation });
    if (s.showThermometer)
      elements.push({
        id: ReactivityPart.Thermometer,
        value: s.isStarted && (o.intensity ?? 0) > 0 ? "rises" : "steady",
      });
    if (s.showSeries)
      elements.push({
        id: ReactivityPart.Series,
        value: `${REACTIVITY_SERIES.join(", ")}, with [H] between Pb and Cu; ${s.metal} picked out`,
      });
    return {
      summary: describeReactivity(s),
      elements,
      hidden: s.isStarted ? {} : { willSee: o.seen.en },
    };
  },
  parts: (s) => [
    ReactivityPart.Apparatus,
    ...(s.isStarted ? [ReactivityPart.Seen] : []),
    ...(s.isStarted && s.showEquation && reactionOf(s.metal, s.reagent).equation !== null
      ? [ReactivityPart.Equation]
      : []),
    ...(s.showThermometer ? [ReactivityPart.Thermometer] : []),
    ...(s.showSeries ? [ReactivityPart.Series] : []),
    ...(s.canChoose && s.metals.length > 1 ? [ReactivityPart.Metals] : []),
    ...(s.canChoose && s.reagents.length > 1 ? [ReactivityPart.Reagents] : []),
    ReactivityPart.Start,
  ],
});

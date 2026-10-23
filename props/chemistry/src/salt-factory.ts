import { type Element, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import type { Words } from "./words";

/**
 * Chemicals from common salt (Section 2.4.3, Fig 2.8): a map from sodium chloride to what is made
 * from it. Electricity through brine gives sodium hydroxide, chlorine and hydrogen (the
 * chlor-alkali process); chlorine and slaked lime give bleaching powder; hydrogen and chlorine give
 * hydrochloric acid; salt, water, carbon dioxide and ammonia give baking soda, which heated gives
 * sodium carbonate, which with water of crystallisation is washing soda.
 */

export const Product = {
  SodiumHydroxide: "sodiumHydroxide",
  Chlorine: "chlorine",
  Hydrogen: "hydrogen",
  HydrochloricAcid: "hydrochloricAcid",
  BleachingPowder: "bleachingPowder",
  BakingSoda: "bakingSoda",
  SodiumCarbonate: "sodiumCarbonate",
  WashingSoda: "washingSoda",
} as const;
export type Product = (typeof Product)[keyof typeof Product];

/** The routes on the map, shown or hidden as a lesson reaches them. */
export const Route = {
  ChlorAlkali: "chlorAlkali",
  Bleaching: "bleaching",
  Acid: "acid",
  BakingSoda: "bakingSoda",
  WashingSoda: "washingSoda",
} as const;
export type Route = (typeof Route)[keyof typeof Route];

type Info = {
  formula: string;
  name: Words;
  route: Route;
  /** How it is made: the equation (digits are subscripts on screen). */
  equation: string;
  /** What is needed besides what the arrow comes from, in words. */
  how: Words;
  uses: readonly Words[];
};

const w = (en: string, hi: string): Words => ({ en, hi });
const CHLOR_ALKALI = "2NaCl + 2H2O → 2NaOH + Cl2 + H2";

export const PRODUCTS: Record<Product, Info> = {
  sodiumHydroxide: {
    formula: "NaOH",
    name: w("sodium hydroxide", "सोडियम हाइड्रॉक्साइड"),
    route: Route.ChlorAlkali,
    equation: CHLOR_ALKALI,
    how: w(
      "electricity through brine; it forms near the cathode",
      "लवणजल में विद्युत; यह कैथोड के पास बनता है",
    ),
    uses: [
      w("de-greasing metals", "धातुओं से चिकनाई हटाना"),
      w("soaps and detergents", "साबुन और अपमार्जक"),
      w("paper making", "कागज़ बनाना"),
      w("artificial fibres", "कृत्रिम रेशे"),
    ],
  },
  chlorine: {
    formula: "Cl2",
    name: w("chlorine", "क्लोरीन"),
    route: Route.ChlorAlkali,
    equation: CHLOR_ALKALI,
    how: w(
      "electricity through brine; it comes off at the anode",
      "लवणजल में विद्युत; यह ऐनोड पर निकलती है",
    ),
    uses: [
      w("water treatment, swimming pools", "जल शोधन, तरणताल"),
      w("PVC", "PVC"),
      w("disinfectants", "रोगाणुनाशक"),
      w("CFCs", "CFC"),
      w("pesticides", "पीड़कनाशी"),
    ],
  },
  hydrogen: {
    formula: "H2",
    name: w("hydrogen", "हाइड्रोजन"),
    route: Route.ChlorAlkali,
    equation: CHLOR_ALKALI,
    how: w(
      "electricity through brine; it comes off at the cathode",
      "लवणजल में विद्युत; यह कैथोड पर निकलती है",
    ),
    uses: [
      w("fuels", "ईंधन"),
      w("margarine", "मार्जरीन"),
      w("ammonia for fertilisers", "उर्वरकों के लिए अमोनिया"),
    ],
  },
  hydrochloricAcid: {
    formula: "HCl",
    name: w("hydrochloric acid", "हाइड्रोक्लोरिक अम्ल"),
    route: Route.Acid,
    equation: "H2 + Cl2 → 2HCl",
    how: w("hydrogen and chlorine combined", "हाइड्रोजन और क्लोरीन का संयोग"),
    uses: [
      w("cleaning steel", "इस्पात की सफ़ाई"),
      w("ammonium chloride", "अमोनियम क्लोराइड"),
      w("medicines and cosmetics", "दवाइयाँ और सौंदर्य प्रसाधन"),
    ],
  },
  bleachingPowder: {
    formula: "CaOCl2",
    name: w("bleaching powder", "विरंजक चूर्ण"),
    route: Route.Bleaching,
    equation: "Ca(OH)2 + Cl2 → CaOCl2 + H2O",
    how: w("chlorine on dry slaked lime", "सूखे बुझे चूने पर क्लोरीन"),
    uses: [
      w(
        "bleaching cotton, linen, wood pulp and washed clothes",
        "सूती, लिनन, लकड़ी की लुगदी और धुले कपड़ों का विरंजन",
      ),
      w("an oxidising agent in industry", "उद्योग में ऑक्सीकारक"),
      w("making drinking water free from germs", "पीने के पानी को रोगाणु-मुक्त करना"),
    ],
  },
  bakingSoda: {
    formula: "NaHCO3",
    name: w("baking soda", "खाने का सोडा"),
    route: Route.BakingSoda,
    equation: "NaCl + H2O + CO2 + NH3 → NH4Cl + NaHCO3",
    how: w("salt with water, carbon dioxide and ammonia", "नमक, पानी, कार्बन डाइऑक्साइड और अमोनिया"),
    uses: [
      w(
        "baking powder (with tartaric acid): cakes rise",
        "बेकिंग पाउडर (टार्टरिक अम्ल के साथ): केक फूलता है",
      ),
      w("antacids", "प्रतिअम्ल"),
      w("soda-acid fire extinguishers", "सोडा-अम्ल अग्निशामक"),
    ],
  },
  sodiumCarbonate: {
    formula: "Na2CO3",
    name: w("sodium carbonate", "सोडियम कार्बोनेट"),
    route: Route.WashingSoda,
    equation: "2NaHCO3 → Na2CO3 + H2O + CO2",
    how: w("baking soda heated", "खाने का सोडा गर्म करने पर"),
    uses: [w("industries (glass, soap, paper)", "उद्योग (काँच, साबुन, कागज़)")],
  },
  washingSoda: {
    formula: "Na2CO3.10H2O",
    name: w("washing soda", "धोने का सोडा"),
    route: Route.WashingSoda,
    equation: "Na2CO3 + 10H2O → Na2CO3.10H2O",
    how: w("sodium carbonate recrystallised with water", "पानी के साथ सोडियम कार्बोनेट का पुनःक्रिस्टलन"),
    uses: [
      w("glass, soap and paper industries", "काँच, साबुन और कागज़ उद्योग"),
      w("making borax", "बोरैक्स बनाना"),
      w("cleaning at home", "घर की सफ़ाई"),
      w("removing permanent hardness of water", "पानी की स्थायी कठोरता हटाना"),
    ],
  },
};

export const SaltFactoryAction = { Pick: "pick", Close: "close" } as const;
export const SaltFactorySignal = { Picked: "picked" } as const;
export const SaltFactoryDerived = { Equation: "equation", Uses: "uses", Shown: "shown" } as const;
export const SaltFactoryPart = { Map: "map", Card: "card", Cell: "cell" } as const;

const factoryState = z
  .object({
    /** The routes drawn on the map (the lesson adds them as it goes). */
    routes: z.array(z.nativeEnum(Route)).max(5),
    /** The product tapped, shown in a card, or null. */
    picked: z.nativeEnum(Product).nullable(),
    showEquation: z.boolean(),
    showUses: z.boolean(),
    /** For the chlor-alkali products, a picture of the cell (brine, anode, cathode). */
    showCell: z.boolean(),
    canPick: z.boolean(),
  })
  .strict();
export type SaltFactoryState = z.infer<typeof factoryState>;

/** The products on the map now. */
export const shownProducts = (s: Pick<SaltFactoryState, "routes">): Product[] =>
  (Object.keys(PRODUCTS) as Product[]).filter((p) => s.routes.includes(PRODUCTS[p].route));

export function describeSaltFactory(s: SaltFactoryState): string {
  const shown = shownProducts(s)
    .map((p) => `${PRODUCTS[p].name.en} (${PRODUCTS[p].formula})`)
    .join(", ");
  const map = `Chemicals from common salt (sodium chloride): ${shown === "" ? "nothing drawn yet" : shown}.`;
  if (s.picked === null) return map;
  const info = PRODUCTS[s.picked];
  return `${map} Picked: ${info.name.en}, made by ${info.how.en}${s.showEquation ? ` (${info.equation})` : ""}${s.showUses ? `; uses: ${info.uses.map((u) => u.en).join(", ")}` : ""}.`;
}

const act = actionsFor<SaltFactoryState>();

export const saltFactory = defineProp({
  type: "saltFactory",
  describe:
    "Chemicals from common salt (NCERT Class 10, Section 2.4.3 and Fig 2.8): a map from sodium chloride. The chlor-alkali process (electricity through brine) gives sodium hydroxide, chlorine and hydrogen; chlorine and slaked lime give bleaching powder; hydrogen and chlorine give hydrochloric acid; salt with water, carbon dioxide and ammonia gives baking soda, which heated gives sodium carbonate, which recrystallised with ten waters is washing soda. Tap a product for how it is made, its equation and its uses; the chlor-alkali products also show the cell (chlorine at the anode, hydrogen at the cathode, sodium hydroxide near the cathode).",
  state: factoryState,
  defaults: {
    routes: [Route.ChlorAlkali, Route.Bleaching, Route.Acid, Route.BakingSoda, Route.WashingSoda],
    picked: null,
    showEquation: true,
    showUses: true,
    showCell: true,
    canPick: true,
  },
  inputs: ["routes", "showEquation", "showUses", "showCell", "canPick"],
  derived: {
    [SaltFactoryDerived.Equation]: {
      describe: "The picked product's equation, or null",
      compute: (s) => (s.picked === null ? null : PRODUCTS[s.picked].equation),
    },
    [SaltFactoryDerived.Uses]: {
      describe: "The picked product's uses, in words",
      compute: (s) => (s.picked === null ? [] : PRODUCTS[s.picked].uses.map((u) => u.en)),
    },
    [SaltFactoryDerived.Shown]: {
      describe: "The products on the map now",
      compute: (s) => shownProducts(s),
    },
  },
  actions: {
    [SaltFactoryAction.Pick]: act({
      describe: "Tap a product on the map to see how it is made and what it is used for",
      byLearner: true,
      args: z.object({ product: z.nativeEnum(Product) }).strict(),
      run: (s, a) =>
        shownProducts(s).includes(a.product)
          ? set(
              { picked: a.product },
              { signal: SaltFactorySignal.Picked, payload: { product: a.product } },
            )
          : set({}),
    }),
    [SaltFactoryAction.Close]: act({
      describe: "Close the product's card",
      byLearner: true,
      args: z.object({}).strict(),
      run: () => set({ picked: null }),
    }),
  },
  signals: {
    [SaltFactorySignal.Picked]: {
      describe: "A product was tapped (payload: product)",
      isCommit: true,
    },
  },
  invariant: (s) =>
    s.picked === null || s.routes.includes(PRODUCTS[s.picked].route)
      ? undefined
      : "the picked product must be on the map",
  observe: (s) => {
    const elements: Element[] = [
      {
        id: SaltFactoryPart.Map,
        value: shownProducts(s)
          .map((p) => PRODUCTS[p].formula)
          .join(", "),
      },
    ];
    if (s.picked !== null) {
      const info = PRODUCTS[s.picked];
      elements.push({
        id: SaltFactoryPart.Card,
        value: `${info.name.en}: ${info.how.en}${s.showEquation ? `; ${info.equation}` : ""}${s.showUses ? `; uses: ${info.uses.map((u) => u.en).join(", ")}` : ""}`,
      });
      if (s.showCell && info.route === Route.ChlorAlkali)
        elements.push({
          id: SaltFactoryPart.Cell,
          value: "brine; chlorine at the anode, hydrogen at the cathode, NaOH near the cathode",
        });
    }
    return { summary: describeSaltFactory(s), elements };
  },
  parts: (s) => [
    SaltFactoryPart.Map,
    ...(s.picked !== null ? [SaltFactoryPart.Card] : []),
    ...(s.picked !== null && s.showCell && PRODUCTS[s.picked].route === Route.ChlorAlkali
      ? [SaltFactoryPart.Cell]
      : []),
  ],
});

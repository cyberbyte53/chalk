import { type Element, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import type { Words } from "./words";

/**
 * A bench for testing the physical properties of elements (NCERT Activities 3.1–3.7): a sample
 * (a metal or a non-metal) and a test (rub it with sandpaper, cut it with a knife, hammer it,
 * draw it into a wire, heat one end with a wax pin at the other, put it in a bulb circuit, strike
 * it). Each try shows what really happens, exceptions and all, and the results fill a table like
 * NCERT's Table 3.1.
 */

export const PropertySample = {
  Iron: "iron",
  Copper: "copper",
  Aluminium: "aluminium",
  Magnesium: "magnesium",
  Sodium: "sodium",
  Zinc: "zinc",
  Lead: "lead",
  Gold: "gold",
  Coal: "coal",
  Graphite: "graphite",
  Diamond: "diamond",
  Sulphur: "sulphur",
  Iodine: "iodine",
} as const;
export type PropertySample = (typeof PropertySample)[keyof typeof PropertySample];

export const PropertyTest = {
  Lustre: "lustre",
  Hardness: "hardness",
  Malleability: "malleability",
  Ductility: "ductility",
  Heat: "heat",
  Electricity: "electricity",
  Sonority: "sonority",
} as const;
export type PropertyTest = (typeof PropertyTest)[keyof typeof PropertyTest];

/** Does the sample show the metal's property here: yes, no, or only partly. */
export const Mark = { Yes: "yes", No: "no", Partly: "partly" } as const;
export type Mark = (typeof Mark)[keyof typeof Mark];

export const PropertyAction = {
  ChooseSample: "chooseSample",
  ChooseTest: "chooseTest",
  Try: "try",
  Reset: "reset",
} as const;
export const PropertySignal = { Tried: "tried" } as const;
export const PropertyDerived = {
  Mark: "mark",
  IsMetal: "isMetal",
  Result: "result",
  TriedCount: "triedCount",
} as const;
export const PropertyPart = {
  Bench: "bench",
  Result: "result",
  Samples: "samples",
  Tests: "tests",
  Try: "try",
  Table: "table",
} as const;

export const SAMPLE_ORDER: readonly PropertySample[] = Object.values(PropertySample);
export const TEST_ORDER: readonly PropertyTest[] = Object.values(PropertyTest);

type SampleInfo = { name: Words; isMetal: boolean; symbol: string };

export const SAMPLES: Record<PropertySample, SampleInfo> = {
  iron: { name: { en: "iron", hi: "लोहा" }, isMetal: true, symbol: "Fe" },
  copper: { name: { en: "copper", hi: "ताँबा" }, isMetal: true, symbol: "Cu" },
  aluminium: { name: { en: "aluminium", hi: "ऐलुमिनियम" }, isMetal: true, symbol: "Al" },
  magnesium: { name: { en: "magnesium", hi: "मैग्नीशियम" }, isMetal: true, symbol: "Mg" },
  sodium: { name: { en: "sodium", hi: "सोडियम" }, isMetal: true, symbol: "Na" },
  zinc: { name: { en: "zinc", hi: "जस्ता" }, isMetal: true, symbol: "Zn" },
  lead: { name: { en: "lead", hi: "सीसा" }, isMetal: true, symbol: "Pb" },
  gold: { name: { en: "gold", hi: "सोना" }, isMetal: true, symbol: "Au" },
  coal: { name: { en: "coal (carbon)", hi: "कोयला (कार्बन)" }, isMetal: false, symbol: "C" },
  graphite: {
    name: { en: "graphite (carbon)", hi: "ग्रेफ़ाइट (कार्बन)" },
    isMetal: false,
    symbol: "C",
  },
  diamond: { name: { en: "diamond (carbon)", hi: "हीरा (कार्बन)" }, isMetal: false, symbol: "C" },
  sulphur: { name: { en: "sulphur", hi: "गंधक" }, isMetal: false, symbol: "S" },
  iodine: { name: { en: "iodine", hi: "आयोडीन" }, isMetal: false, symbol: "I" },
};

export const TESTS: Record<PropertyTest, { name: Words; how: Words; property: Words }> = {
  lustre: {
    name: { en: "Rub", hi: "रगड़ो" },
    how: { en: "rub it with sandpaper", hi: "रेगमाल से रगड़ो" },
    property: { en: "lustre", hi: "चमक" },
  },
  hardness: {
    name: { en: "Cut", hi: "काटो" },
    how: { en: "try to cut it with a knife", hi: "चाकू से काटने की कोशिश करो" },
    property: { en: "hardness", hi: "कठोरता" },
  },
  malleability: {
    name: { en: "Hammer", hi: "हथौड़ा" },
    how: { en: "hit it four or five times with a hammer", hi: "हथौड़े से चार-पाँच बार मारो" },
    property: { en: "malleability", hi: "आघातवर्धनीयता" },
  },
  ductility: {
    name: { en: "Wire", hi: "तार" },
    how: { en: "try to draw it into a wire", hi: "खींचकर तार बनाने की कोशिश करो" },
    property: { en: "ductility", hi: "तन्यता" },
  },
  heat: {
    name: { en: "Heat", hi: "गरम" },
    how: {
      en: "heat one end; a pin is stuck with wax to the other",
      hi: "एक सिरा गरम करो; दूसरे सिरे पर मोम से पिन चिपकी है",
    },
    property: { en: "conducts heat", hi: "ऊष्मा का चालन" },
  },
  electricity: {
    name: { en: "Bulb", hi: "बल्ब" },
    how: { en: "put it in a circuit with a bulb", hi: "बल्ब वाले परिपथ में लगाओ" },
    property: { en: "conducts electricity", hi: "विद्युत का चालन" },
  },
  sonority: {
    name: { en: "Strike", hi: "ठोको" },
    how: { en: "strike it on a hard floor", hi: "कठोर फ़र्श पर ठोको" },
    property: { en: "sonority", hi: "ध्वानिकता" },
  },
};

/** What a try shows: whether it is the metal's property, and what is seen, in words. */
export type Outcome = { mark: Mark; seen: Words; isUnsafe?: boolean };

const yes = (en: string, hi: string): Outcome => ({ mark: Mark.Yes, seen: { en, hi } });
const no = (en: string, hi: string): Outcome => ({ mark: Mark.No, seen: { en, hi } });
const partly = (en: string, hi: string): Outcome => ({ mark: Mark.Partly, seen: { en, hi } });

const shines = yes("it shines after rubbing", "रगड़ने पर चमकता है");
const knifeScratches = yes("hard: the knife only scratches it", "कठोर: चाकू बस खरोंच डालता है");
const flattens = yes("it flattens into a thin sheet", "पिटकर पतली चादर बन जाता है");
const wire = yes("it draws into a thin wire", "खिंचकर पतला तार बन जाता है");
const pinDrops = yes("the wax melts and the pin drops", "मोम पिघलता है और पिन गिर जाती है");
const glows = yes("the bulb glows", "बल्ब जलता है");
const rings = yes("it rings", "यह खनकता है");
const dull = (en: string, hi: string) => no(en, hi);
const crumbles = no("brittle: it crumbles", "भंगुर: यह चूर-चूर हो जाता है");
const breaks = no("brittle: it breaks into pieces", "भंगुर: टुकड़े-टुकड़े हो जाता है");
const noWire = no("it snaps; no wire", "यह टूट जाता है; तार नहीं बनता");
const pinStays = no("the pin stays put", "पिन वहीं रहती है");
const noGlow = no("the bulb stays off", "बल्ब नहीं जलता");
const thud = no("a dull thud", "धप्प की धीमी आवाज़");

/** What really happens for every sample and test. */
export const OUTCOMES: Record<PropertySample, Record<PropertyTest, Outcome>> = {
  iron: {
    lustre: shines,
    hardness: knifeScratches,
    malleability: flattens,
    ductility: yes("it draws into wire (fences, nails)", "खिंचकर तार बनता है (बाड़, कीलें)"),
    heat: yes(
      "after a while the wax melts and the pin drops",
      "कुछ देर में मोम पिघलता है और पिन गिरती है",
    ),
    electricity: glows,
    sonority: rings,
  },
  copper: {
    lustre: yes("it shines a reddish brown after rubbing", "रगड़ने पर लाल-भूरी चमक आती है"),
    hardness: knifeScratches,
    malleability: flattens,
    ductility: yes("it draws into thin wire (electric wires)", "पतला तार बनता है (बिजली के तार)"),
    heat: yes(
      "the pin drops very soon: one of the best conductors",
      "पिन बहुत जल्दी गिरती है: सबसे अच्छे चालकों में से एक",
    ),
    electricity: glows,
    sonority: rings,
  },
  aluminium: {
    lustre: shines,
    hardness: knifeScratches,
    malleability: yes("it flattens into a thin sheet (foil)", "पिटकर पतली चादर बनता है (पन्नी)"),
    ductility: yes("it draws into wire (power lines)", "खिंचकर तार बनता है (बिजली की लाइनें)"),
    heat: yes("the pin drops soon", "पिन जल्दी गिरती है"),
    electricity: glows,
    sonority: rings,
  },
  magnesium: {
    lustre: shines,
    hardness: knifeScratches,
    malleability: partly("it bends and flattens a little", "थोड़ा मुड़ता और चपटा होता है"),
    ductility: wire,
    heat: pinDrops,
    electricity: glows,
    sonority: rings,
  },
  sodium: {
    lustre: yes(
      "shiny where freshly cut, but it dulls in air at once",
      "ताज़ा कटी जगह चमकती है, पर हवा में तुरंत फीकी पड़ जाती है",
    ),
    hardness: no("so soft it cuts like butter", "इतना नरम कि मक्खन की तरह कटता है"),
    malleability: yes("very soft: it squashes flat", "बहुत नरम: दबकर चपटा हो जाता है"),
    ductility: no("too soft: it smears instead", "बहुत नरम: तार की जगह फैल जाता है"),
    heat: {
      mark: Mark.Yes,
      seen: {
        en: "not heated here: sodium catches fire in a flame",
        hi: "यहाँ गरम नहीं करते: सोडियम लौ में आग पकड़ लेता है",
      },
      isUnsafe: true,
    },
    electricity: glows,
    sonority: no("too soft to ring: a dull thud", "खनकने के लिए बहुत नरम: धीमी धप्प"),
  },
  zinc: {
    lustre: shines,
    hardness: knifeScratches,
    malleability: partly(
      "it flattens a little, then cracks (easier when warm)",
      "थोड़ा चपटा होकर चटक जाता है (गरम होने पर आसान)",
    ),
    ductility: partly("it draws into wire only with difficulty", "मुश्किल से ही तार बनता है"),
    heat: pinDrops,
    electricity: glows,
    sonority: rings,
  },
  lead: {
    lustre: yes("it shines grey after rubbing", "रगड़ने पर धूसर चमक आती है"),
    hardness: partly("soft: the knife cuts into it", "नरम: चाकू इसमें धँस जाता है"),
    malleability: flattens,
    ductility: partly("a soft wire that breaks easily", "नरम तार जो आसानी से टूटता है"),
    heat: partly(
      "the pin drops only slowly: a poor conductor for a metal",
      "पिन धीरे-धीरे गिरती है: धातु होकर भी कमज़ोर चालक",
    ),
    electricity: glows,
    sonority: no("a dull thud, no ring", "धीमी धप्प, कोई खनक नहीं"),
  },
  gold: {
    lustre: shines,
    hardness: partly("fairly soft: the knife leaves a mark", "काफ़ी नरम: चाकू निशान छोड़ देता है"),
    malleability: yes(
      "the most malleable: it beats into a very thin leaf",
      "सबसे अधिक आघातवर्धनीय: पिटकर बहुत पतला वर्क बनता है",
    ),
    ductility: yes(
      "the most ductile: 1 g makes about 2 km of wire",
      "सबसे अधिक तन्य: 1 g से लगभग 2 km तार",
    ),
    heat: pinDrops,
    electricity: glows,
    sonority: rings,
  },
  coal: {
    lustre: dull("it stays dull black", "यह फीका काला ही रहता है"),
    hardness: crumbles,
    malleability: breaks,
    ductility: noWire,
    heat: pinStays,
    electricity: noGlow,
    sonority: thud,
  },
  graphite: {
    lustre: partly("dark grey with a slight shine", "हल्की चमक वाला गहरा धूसर"),
    hardness: no("soft: it flakes and marks paper", "नरम: परतें उतरती हैं, कागज़ पर निशान"),
    malleability: breaks,
    ductility: noWire,
    heat: partly("it warms slowly along its length", "धीरे-धीरे पूरी लंबाई में गरम होता है"),
    electricity: yes(
      "the bulb glows: graphite conducts (an exception)",
      "बल्ब जलता है: ग्रेफ़ाइट चालक है (अपवाद)",
    ),
    sonority: thud,
  },
  diamond: {
    lustre: yes("it sparkles (but it is not a metal)", "यह चमचमाता है (पर धातु नहीं है)"),
    hardness: yes(
      "the hardest natural substance: it scratches the knife",
      "सबसे कठोर प्राकृतिक पदार्थ: चाकू पर खरोंच डालता है",
    ),
    malleability: no("brittle: it shatters", "भंगुर: बिखर जाता है"),
    ductility: noWire,
    heat: yes(
      "the pin drops: diamond conducts heat very well (an exception)",
      "पिन गिरती है: हीरा ऊष्मा का बहुत अच्छा चालक है (अपवाद)",
    ),
    electricity: noGlow,
    sonority: thud,
  },
  sulphur: {
    lustre: dull("it stays a dull yellow", "यह फीका पीला ही रहता है"),
    hardness: crumbles,
    malleability: no("brittle: it breaks into powder", "भंगुर: चूरा बन जाता है"),
    ductility: noWire,
    heat: no("it melts and burns; the pin stays put", "यह पिघलकर जलता है; पिन वहीं रहती है"),
    electricity: noGlow,
    sonority: thud,
  },
  iodine: {
    lustre: yes(
      "it shines (iodine is lustrous: an exception)",
      "यह चमकता है (आयोडीन चमकदार है: अपवाद)",
    ),
    hardness: crumbles,
    malleability: breaks,
    ductility: noWire,
    heat: no(
      "it turns into violet vapour; the pin stays put",
      "बैंगनी वाष्प बन जाता है; पिन वहीं रहती है",
    ),
    electricity: noGlow,
    sonority: thud,
  },
};

const triedKey = (sample: PropertySample, test: PropertyTest) => `${sample}:${test}`;

const propertyState = z
  .object({
    sample: z.nativeEnum(PropertySample),
    test: z.nativeEnum(PropertyTest),
    /** The current sample has had the current test done to it. */
    isTried: z.boolean(),
    /** Every sample:test tried so far, for the table. */
    tried: z.array(z.string()).max(SAMPLE_ORDER.length * TEST_ORDER.length),
    /** The samples the learner may pick from, in order. */
    samples: z.array(z.nativeEnum(PropertySample)).min(1),
    /** The tests the learner may pick from, in order. */
    tests: z.array(z.nativeEnum(PropertyTest)).min(1),
    /** Show the table of results so far (like Table 3.1). */
    showTable: z.boolean(),
    /** Name the property (lustre, malleability…) with each test. */
    showProperty: z.boolean(),
    canChoose: z.boolean(),
  })
  .strict();
export type PropertyState = z.infer<typeof propertyState>;

export function outcomeOf(sample: PropertySample, test: PropertyTest): Outcome {
  return OUTCOMES[sample][test];
}

/** The table so far: for each sample tried, its mark per test (null: not tried). */
export function tableOf(
  s: Pick<PropertyState, "tried" | "samples">,
): { sample: PropertySample; marks: (Mark | null)[] }[] {
  const tried = new Set(s.tried);
  return SAMPLE_ORDER.filter((sample) =>
    TEST_ORDER.some((t) => tried.has(triedKey(sample, t))),
  ).map((sample) => ({
    sample,
    marks: TEST_ORDER.map((t) =>
      tried.has(triedKey(sample, t)) ? outcomeOf(sample, t).mark : null,
    ),
  }));
}

export function describeProperty(s: PropertyState): string {
  const info = SAMPLES[s.sample];
  const test = TESTS[s.test];
  const what = `${info.name.en} (${info.isMetal ? "a metal" : "a non-metal"}), test: ${test.how.en}`;
  return s.isTried
    ? `Testing ${what}: ${outcomeOf(s.sample, s.test).seen.en}.`
    : `Testing ${what}; not tried yet.`;
}

const act = actionsFor<PropertyState>();

export const propertyTester = defineProp({
  type: "propertyTester",
  describe:
    "A bench for the physical properties of elements (NCERT Activities 3.1–3.7). Pick a sample (iron, copper, aluminium, magnesium, sodium, zinc, lead, gold, coal, graphite, diamond, sulphur, iodine) and a test: rub with sandpaper (lustre), cut with a knife (hardness), hammer (malleability), draw into a wire (ductility), heat one end with a wax pin at the other (heat conduction), a bulb circuit (electrical conduction), strike on the floor (sonority). Each try shows what really happens, with the exceptions (sodium cuts like butter, lead doesn't ring, iodine is lustrous, graphite conducts electricity, diamond is the hardest). Results fill a table like Table 3.1.",
  state: propertyState,
  defaults: {
    sample: PropertySample.Iron,
    test: PropertyTest.Lustre,
    isTried: false,
    tried: [],
    samples: [...SAMPLE_ORDER],
    tests: [...TEST_ORDER],
    showTable: true,
    showProperty: true,
    canChoose: true,
  },
  inputs: ["samples", "tests", "showTable", "showProperty", "canChoose"],
  invariant: (s) =>
    s.samples.includes(s.sample) && s.tests.includes(s.test)
      ? undefined
      : "the sample and the test must be among the ones offered",
  derived: {
    [PropertyDerived.Mark]: {
      describe:
        "After a try: whether the sample showed the metal's property (yes, no, partly); null before",
      compute: (s) => (s.isTried ? outcomeOf(s.sample, s.test).mark : null),
    },
    [PropertyDerived.IsMetal]: {
      describe: "The sample is a metal",
      compute: (s) => SAMPLES[s.sample].isMetal,
    },
    [PropertyDerived.Result]: {
      describe: "After a try, what was seen, in words; null before",
      compute: (s) => (s.isTried ? outcomeOf(s.sample, s.test).seen.en : null),
    },
    [PropertyDerived.TriedCount]: {
      describe: "How many sample-and-test pairs have been tried",
      compute: (s) => s.tried.length,
    },
  },
  actions: {
    [PropertyAction.ChooseSample]: act({
      describe: "Put a sample on the bench (the test stays the same; not tried yet)",
      byLearner: true,
      args: z.object({ sample: z.nativeEnum(PropertySample) }).strict(),
      run: (s, a) =>
        set({
          sample: s.samples.includes(a.sample) ? a.sample : s.sample,
          isTried: false,
        }),
    }),
    [PropertyAction.ChooseTest]: act({
      describe: "Pick a test (the sample stays the same; not tried yet)",
      byLearner: true,
      args: z.object({ test: z.nativeEnum(PropertyTest) }).strict(),
      run: (s, a) => set({ test: s.tests.includes(a.test) ? a.test : s.test, isTried: false }),
    }),
    [PropertyAction.Try]: act({
      describe: "Do the test on the sample and see what happens; it goes into the table",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        const key = triedKey(s.sample, s.test);
        const outcome = outcomeOf(s.sample, s.test);
        return set(
          { isTried: true, tried: s.tried.includes(key) ? s.tried : [...s.tried, key] },
          {
            signal: PropertySignal.Tried,
            payload: {
              sample: s.sample,
              test: s.test,
              mark: outcome.mark,
              isMetal: SAMPLES[s.sample].isMetal,
            },
          },
        );
      },
    }),
    [PropertyAction.Reset]: act({
      describe: "Clear the table",
      args: z.object({}).strict(),
      run: () => set({ isTried: false, tried: [] }),
    }),
  },
  signals: {
    [PropertySignal.Tried]: {
      describe:
        "A test was done; the payload has the sample, the test, the mark (yes, no, partly) and whether the sample is a metal",
    },
  },
  observe: (s) => {
    const elements: Element[] = [
      {
        id: PropertyPart.Bench,
        value: `${SAMPLES[s.sample].name.en} ready for: ${TESTS[s.test].how.en}`,
      },
    ];
    if (s.isTried)
      elements.push({ id: PropertyPart.Result, value: outcomeOf(s.sample, s.test).seen.en });
    if (s.showTable && s.tried.length > 0)
      elements.push({
        id: PropertyPart.Table,
        value: tableOf(s)
          .map(
            (row) =>
              `${SAMPLES[row.sample].name.en}: ${row.marks
                .map((m, i) =>
                  m === null ? null : `${TESTS[TEST_ORDER[i] as PropertyTest].property.en} ${m}`,
                )
                .filter((x) => x !== null)
                .join(", ")}`,
          )
          .join("; "),
      });
    return {
      summary: describeProperty(s),
      elements,
      hidden: s.isTried ? {} : { result: outcomeOf(s.sample, s.test).seen.en },
    };
  },
  parts: (s) => [
    PropertyPart.Bench,
    ...(s.isTried ? [PropertyPart.Result] : []),
    ...(s.canChoose ? [PropertyPart.Samples, PropertyPart.Tests] : []),
    PropertyPart.Try,
    ...(s.showTable && s.tried.length > 0 ? [PropertyPart.Table] : []),
  ],
});

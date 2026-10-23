import { family, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Item, itemBoard, seedOf } from "../../quiz";

const items = {
  sameCurrent: {
    prompt: t(
      "In which combination is the current the same through every resistor?",
      "किस संयोजन में हर प्रतिरोधक में धारा एक जैसी होती है?",
    ),
    right: t("Series", "श्रेणीक्रम"),
    wrong: [
      {
        label: t("Parallel", "पार्श्वक्रम"),
        feedback: t(
          "In parallel the current divides among the branches.",
          "पार्श्वक्रम में धारा शाखाओं में बँट जाती है।",
        ),
      },
    ],
  },
  sameV: {
    prompt: t(
      "In which combination is the potential difference the same across every resistor?",
      "किस संयोजन में हर प्रतिरोधक पर विभवांतर एक जैसा होता है?",
    ),
    right: t("Parallel", "पार्श्वक्रम"),
    wrong: [
      {
        label: t("Series", "श्रेणीक्रम"),
        feedback: t(
          "In series the potential differences add up to the battery's.",
          "श्रेणीक्रम में विभवांतर जुड़कर बैटरी के बराबर होते हैं।",
        ),
      },
    ],
  },
  oneFails: {
    prompt: t(
      "One bulb in a string of fairy lights fuses and every bulb goes dark. How are they connected?",
      "झालर का एक बल्ब फ़्यूज़ होता है और हर बल्ब बुझ जाता है। वे कैसे जुड़े हैं?",
    ),
    right: t("In series", "श्रेणीक्रम में"),
    wrong: [
      {
        label: t("In parallel", "पार्श्वक्रम में"),
        feedback: t(
          "In parallel the others would stay lit on their own branches.",
          "पार्श्वक्रम में बाक़ी अपनी शाखाओं पर जलते रहते।",
        ),
      },
    ],
  },
  domestic: {
    prompt: t(
      "Why is the series arrangement not used for domestic circuits?",
      "घरेलू परिपथों में श्रेणीक्रम व्यवस्था क्यों नहीं लगती?",
    ),
    right: t(
      "One fault or switch would stop everything, and every appliance would get the same current",
      "एक ख़राबी या स्विच सब रोक देता, और हर उपकरण को एक ही धारा मिलती",
    ),
    wrong: [
      {
        label: t("Series circuits use too much wire", "श्रेणीक्रम परिपथों में बहुत तार लगता है"),
        feedback: t(
          "Wire isn't the problem. Appliances need different currents and must work independently.",
          "तार समस्या नहीं है। उपकरणों को अलग धाराएँ चाहिए और उन्हें स्वतंत्र रूप से चलना है।",
        ),
      },
    ],
  },
  bigger: {
    prompt: t(
      "When resistors are joined in series, the equivalent resistance is…",
      "जब प्रतिरोधक श्रेणीक्रम में जुड़ते हैं, तो तुल्य प्रतिरोध…",
    ),
    right: t("greater than any one of them", "उनमें से किसी से भी बड़ा होता है"),
    wrong: [
      {
        label: t("smaller than the smallest", "सबसे छोटे से भी कम होता है"),
        feedback: t("That's parallel. In series they add.", "वह पार्श्वक्रम है। श्रेणीक्रम में वे जुड़ते हैं।"),
      },
    ],
  },
  smaller: {
    prompt: t(
      "Judge the equivalent resistance of 1 Ω and 10⁶ Ω in parallel.",
      "1 Ω और 10⁶ Ω के पार्श्वक्रम का तुल्य प्रतिरोध आँको।",
    ),
    right: t("Just under 1 Ω", "1 Ω से थोड़ा कम"),
    wrong: [
      {
        label: t("About 10⁶ Ω", "लगभग 10⁶ Ω"),
        feedback: t(
          "In parallel the result is smaller than the smallest, so less than 1 Ω.",
          "पार्श्वक्रम में परिणाम सबसे छोटे से भी कम होता है, यानी 1 Ω से कम।",
        ),
      },
      {
        label: t("About 5 × 10⁵ Ω", "लगभग 5 × 10⁵ Ω"),
        feedback: t(
          "That's an average. Parallel resistance is below the smallest one.",
          "यह औसत है। पार्श्वक्रम प्रतिरोध सबसे छोटे से भी कम होता है।",
        ),
      },
    ],
  },
} satisfies Record<string, Item>;

type Key = keyof typeof items;

/** Telling series from parallel by what they do. */
export const seriesOrParallel = family({
  level: Level.Easy,
  tests: [Concept.ResistorsInSeries, Concept.ResistorsInParallel],
  params: z.object({ item: z.enum(Object.keys(items) as [Key, ...Key[]]) }).strict(),
  build: ({ item }, b) => itemBoard(b, items[item], seedOf(item)),
});

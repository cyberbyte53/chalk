import { family, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Item, itemBoard, seedOf } from "../../quiz";

const items = {
  cellLines: {
    prompt: t(
      "In the symbol for a cell, a long thin line and a short thick line. Which is the + terminal?",
      "सेल के प्रतीक में एक लंबी पतली और एक छोटी मोटी रेखा है। + सिरा कौन-सा है?",
    ),
    right: t("The long thin line", "लंबी पतली रेखा"),
    wrong: [
      {
        label: t("The short thick line", "छोटी मोटी रेखा"),
        feedback: t("The short thick line is the − terminal.", "छोटी मोटी रेखा − सिरा है।"),
      },
    ],
  },
  dot: {
    prompt: t(
      "In a circuit diagram, a dot where two wires meet means…",
      "परिपथ आरेख में, जहाँ दो तार मिलते हैं वहाँ बिंदु का अर्थ है…",
    ),
    right: t("The wires are joined there", "तार वहाँ जुड़े हैं"),
    wrong: [
      {
        label: t("The wires cross without joining", "तार बिना जुड़े एक-दूसरे को काटते हैं"),
        feedback: t(
          "Crossing without joining is drawn with a little hop and no dot.",
          "बिना जुड़े काटना एक छोटे उछाल से और बिना बिंदु के दिखाया जाता है।",
        ),
      },
    ],
  },
  closedKey: {
    prompt: t(
      "How does the symbol for a closed plug key differ from an open one?",
      "बंद प्लग कुंजी का प्रतीक खुली कुंजी से कैसे अलग है?",
    ),
    right: t(
      "It has a dot (the plug) between its two halves",
      "उसके दोनों हिस्सों के बीच एक बिंदु (प्लग) होता है",
    ),
    wrong: [
      {
        label: t("Its two halves are drawn further apart", "उसके दोनों हिस्से ज़्यादा दूर बनाए जाते हैं"),
        feedback: t(
          "The halves look the same in both. The closed key has the plug, a dot, between them.",
          "दोनों में हिस्से एक जैसे दिखते हैं। बंद कुंजी में उनके बीच प्लग, यानी बिंदु, होता है।",
        ),
      },
    ],
  },
  rheostat: {
    prompt: t(
      "A resistor symbol with an arrow drawn across it stands for…",
      "जिस प्रतिरोधक प्रतीक के आर-पार तीर बना हो, वह दर्शाता है…",
    ),
    right: t("A variable resistance (rheostat)", "परिवर्ती प्रतिरोध (धारा नियंत्रक)"),
    wrong: [
      {
        label: t("A broken resistor", "टूटा हुआ प्रतिरोधक"),
        feedback: t(
          "The arrow means its resistance can be changed.",
          "तीर का अर्थ है कि उसका प्रतिरोध बदला जा सकता है।",
        ),
      },
      {
        label: t("The direction of the current", "धारा की दिशा"),
        feedback: t(
          "Current directions aren't drawn through symbols. The arrow marks a resistance you can vary.",
          "धारा की दिशा प्रतीकों के आर-पार नहीं बनाई जाती। तीर ऐसे प्रतिरोध को दिखाता है जिसे बदल सकते हो।",
        ),
      },
    ],
  },
  meters: {
    prompt: t(
      "A circle with the letter A inside it is the symbol for…",
      "जिस वृत्त के अंदर A लिखा हो, वह किसका प्रतीक है…",
    ),
    right: t("An ammeter", "ऐमीटर"),
    wrong: [
      {
        label: t("A voltmeter", "वोल्टमीटर"),
        feedback: t("The voltmeter has a V in its circle.", "वोल्टमीटर के वृत्त में V होता है।"),
      },
      {
        label: t("A bulb", "बल्ब"),
        feedback: t(
          "A bulb is drawn as a circle with a filament loop or a cross, not a letter.",
          "बल्ब तंतु के लूप या क्रॉस वाले वृत्त से बनता है, अक्षर से नहीं।",
        ),
      },
    ],
  },
} satisfies Record<string, Item>;

type Key = keyof typeof items;

/** Reading NCERT Table 12.1's symbols. */
export const symbolMeaning = family({
  level: Level.Easy,
  tests: [Concept.CircuitDiagrams],
  params: z.object({ item: z.enum(Object.keys(items) as [Key, ...Key[]]) }).strict(),
  build: ({ item }, b) => itemBoard(b, items[item], seedOf(item)),
});

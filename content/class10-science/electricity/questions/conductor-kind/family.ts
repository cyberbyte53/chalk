import { family, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Item, itemBoard, seedOf } from "../../quiz";

const items = {
  halfV: {
    prompt: t(
      "A component's resistance stays constant while the potential difference across it is halved. What happens to the current?",
      "किसी भाग का प्रतिरोध स्थिर रहता है जबकि उसके सिरों पर विभवांतर आधा हो जाता है। धारा का क्या होता है?",
    ),
    right: t("It is halved", "आधी हो जाती है"),
    wrong: [
      {
        label: t("It doubles", "दोगुनी हो जाती है"),
        feedback: t("I = V/R: smaller V, smaller I.", "I = V/R: छोटा V, छोटा I।"),
      },
      {
        label: t("It stays the same", "वही रहती है"),
        feedback: t(
          "Current is proportional to V when R is fixed.",
          "R स्थिर हो तो धारा V के समानुपाती है।",
        ),
      },
    ],
  },
  doubleR: {
    prompt: t(
      "With the same battery, a resistor is replaced by one of twice the resistance. The current…",
      "उसी बैटरी के साथ, एक प्रतिरोधक की जगह दोगुने प्रतिरोध वाला लगाया जाता है। धारा…",
    ),
    right: t("halves", "आधी हो जाती है"),
    wrong: [
      {
        label: t("doubles", "दोगुनी हो जाती है"),
        feedback: t(
          "More resistance holds the current back: I = V/R.",
          "ज़्यादा प्रतिरोध धारा को रोकता है: I = V/R।",
        ),
      },
    ],
  },
  graph: {
    prompt: t(
      "What does a V–I graph look like for a wire that obeys Ohm's law?",
      "ओम के नियम को मानने वाले तार का V–I ग्राफ़ कैसा दिखता है?",
    ),
    right: t("A straight line through the origin", "मूल बिंदु से होकर जाने वाली सीधी रेखा"),
    wrong: [
      {
        label: t("A curve that flattens out", "एक वक्र जो चपटा होता जाता है"),
        feedback: t("V ∝ I gives a straight line.", "V ∝ I से सीधी रेखा मिलती है।"),
      },
      {
        label: t(
          "A straight line that doesn't pass through the origin",
          "सीधी रेखा जो मूल बिंदु से नहीं गुज़रती",
        ),
        feedback: t(
          "No potential difference, no current: the line starts at (0, 0).",
          "कोई विभवांतर नहीं, कोई धारा नहीं: रेखा (0, 0) से शुरू होती है।",
        ),
      },
    ],
  },
  insulator: {
    prompt: t(
      "Glass in the gap XY of NCERT's Activity 12.2 gives practically no current. Glass is…",
      "NCERT क्रियाकलाप 12.2 की खाली जगह XY में काँच लगभग कोई धारा नहीं देता। काँच है…",
    ),
    right: t("an insulator", "विद्युतरोधी"),
    wrong: [
      {
        label: t("a resistor", "प्रतिरोधक"),
        feedback: t(
          "A resistor lets an appreciable current through. Glass's resistance is far higher: an insulator.",
          "प्रतिरोधक उल्लेखनीय धारा जाने देता है। काँच का प्रतिरोध कहीं ज़्यादा है: विद्युतरोधी।",
        ),
      },
      {
        label: t("a good conductor", "अच्छा चालक"),
        feedback: t(
          "A good conductor has low resistance and a big current.",
          "अच्छे चालक का प्रतिरोध कम और धारा बड़ी होती है।",
        ),
      },
    ],
  },
  rheostat: {
    prompt: t("What is a rheostat used for?", "धारा नियंत्रक (रिओस्टेट) किसलिए उपयोग होता है?"),
    right: t(
      "To change the current by changing the resistance, without changing the source",
      "स्रोत बदले बिना, प्रतिरोध बदलकर धारा बदलने के लिए",
    ),
    wrong: [
      {
        label: t("To measure the current", "धारा मापने के लिए"),
        feedback: t("That's the ammeter.", "वह ऐमीटर है।"),
      },
    ],
  },
} satisfies Record<string, Item>;

type Key = keyof typeof items;

/** Ohm's law in words: proportions, the graph, conductors and insulators. */
export const conductorKind = family({
  level: Level.Easy,
  tests: [Concept.OhmsLaw],
  params: z.object({ item: z.enum(Object.keys(items) as [Key, ...Key[]]) }).strict(),
  build: ({ item }, b) => itemBoard(b, items[item], seedOf(item)),
});

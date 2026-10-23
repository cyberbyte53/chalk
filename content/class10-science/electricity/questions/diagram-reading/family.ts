import { family, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Item, itemBoard, seedOf } from "../../quiz";

const items = {
  resistors: {
    prompt: t(
      "A battery of three 2 V cells, resistors of 5 Ω, 8 Ω and 12 Ω and a plug key are all in series. How many resistor symbols does the diagram need?",
      "2 V के तीन सेलों की बैटरी, 5 Ω, 8 Ω और 12 Ω के प्रतिरोधक और एक प्लग कुंजी, सब श्रेणीक्रम में हैं। आरेख में कितने प्रतिरोधक प्रतीक चाहिए?",
    ),
    right: t("3", "3"),
    wrong: [
      {
        label: t("6", "6"),
        feedback: t(
          "Cells have their own symbol. There are three resistors.",
          "सेलों का अपना प्रतीक है। प्रतिरोधक तीन हैं।",
        ),
      },
      {
        label: t("1", "1"),
        feedback: t("Each resistor gets its own symbol.", "हर प्रतिरोधक का अपना प्रतीक होता है।"),
      },
    ],
  },
  batteryVolts: {
    prompt: t(
      "A battery is drawn as three cells of 2 V each, joined + to −. What is its potential difference?",
      "एक बैटरी 2 V के तीन सेलों से बनी दिखाई गई है, + से − जुड़े। उसका विभवांतर कितना है?",
    ),
    right: t("6 V", "6 V"),
    wrong: [
      {
        label: t("2 V", "2 V"),
        feedback: t(
          "Cells joined + to − add their pushes: 3 × 2 V.",
          "+ से − जुड़े सेलों के धक्के जुड़ते हैं: 3 × 2 V।",
        ),
      },
    ],
  },
  ammeterPlace: {
    prompt: t(
      "To measure the current through a 12 Ω resistor in a series circuit, where is the ammeter drawn?",
      "श्रेणीक्रम परिपथ में 12 Ω के प्रतिरोधक में धारा मापने के लिए ऐमीटर कहाँ बनाया जाता है?",
    ),
    right: t("Anywhere in the loop, in series", "लूप में कहीं भी, श्रेणीक्रम में"),
    wrong: [
      {
        label: t("Across the 12 Ω resistor", "12 Ω के प्रतिरोधक के आर-पार"),
        feedback: t(
          "Across is for a voltmeter. In series the current is the same everywhere, so the ammeter can go anywhere in the loop.",
          "आर-पार वोल्टमीटर के लिए है। श्रेणीक्रम में धारा हर जगह एक जैसी है, इसलिए ऐमीटर लूप में कहीं भी लग सकता है।",
        ),
      },
    ],
  },
  openKey: {
    prompt: t(
      "A diagram shows a cell, a bulb and an open plug key in one loop. Does the bulb glow?",
      "एक आरेख में एक लूप में एक सेल, एक बल्ब और एक खुली प्लग कुंजी है। क्या बल्ब जलता है?",
    ),
    right: t("No: the open key leaves a gap in the path", "नहीं: खुली कुंजी रास्ते में खाली जगह छोड़ती है"),
    wrong: [
      {
        label: t("Yes, dimly", "हाँ, धीमे"),
        feedback: t(
          "With a gap there is no closed circuit, so no current at all.",
          "खाली जगह के साथ कोई बंद परिपथ नहीं, इसलिए कोई धारा नहीं।",
        ),
      },
    ],
  },
} satisfies Record<string, Item>;

type Key = keyof typeof items;

/** Reading and drawing circuit diagrams (NCERT 12.3 and 12.6.1 in-text Q1). */
export const diagramReading = family({
  level: Level.Medium,
  tests: [Concept.CircuitDiagrams],
  params: z.object({ item: z.enum(Object.keys(items) as [Key, ...Key[]]) }).strict(),
  build: ({ item }, b) => itemBoard(b, items[item], seedOf(item)),
});

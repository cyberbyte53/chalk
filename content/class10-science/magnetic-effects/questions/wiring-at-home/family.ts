import { family, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Item, itemBoard, seedOf } from "../../quiz";

const items = {
  live: {
    prompt: t(
      "The live wire usually has insulation that is…",
      "जीवित तार का विद्युतरोधन प्रायः होता है…",
    ),
    right: t("red", "लाल"),
    wrong: [
      { label: t("green", "हरा"), feedback: t("Green is the earth wire.", "हरा भू-तार है।") },
      {
        label: t("black", "काला"),
        feedback: t("Black is the neutral wire.", "काला उदासीन तार है।"),
      },
    ],
  },
  volts: {
    prompt: t(
      "In India, the potential difference between the live and neutral wires is…",
      "भारत में जीवित और उदासीन तारों के बीच विभवांतर है…",
    ),
    right: t("220 V", "220 V"),
    wrong: [
      {
        label: t("50 V", "50 V"),
        feedback: t("50 is the frequency in hertz.", "50 हर्ट्ज़ में आवृत्ति है।"),
      },
      {
        label: t("15 V", "15 V"),
        feedback: t(
          "15 A is a circuit's current rating, not a voltage.",
          "15 A परिपथ का धारा अनुमतांक है, वोल्टेज नहीं।",
        ),
      },
    ],
  },
  short: {
    prompt: t(
      "At the time of a short circuit, the current in the circuit…",
      "लघुपथन के समय परिपथ में धारा…",
    ),
    right: t("increases heavily", "बहुत अधिक बढ़ जाती है"),
    wrong: [
      {
        label: t("reduces substantially", "बहुत कम हो जाती है"),
        feedback: t(
          "Live touching neutral leaves almost no resistance, so the current shoots up.",
          "जीवित के उदासीन को छूने से लगभग कोई प्रतिरोध नहीं रहता, इसलिए धारा एकदम बढ़ती है।",
        ),
      },
      {
        label: t("does not change", "नहीं बदलती"),
        feedback: t(
          "The fuse melts because the current jumps.",
          "धारा उछलती है इसीलिए फ़्यूज़ पिघलता है।",
        ),
      },
    ],
  },
  cause: {
    prompt: t("A short circuit occurs when…", "लघुपथन तब होता है जब…"),
    right: t(
      "the live and neutral wires come into direct contact",
      "जीवित और उदासीन तार सीधे संपर्क में आ जाएँ",
    ),
    wrong: [
      {
        label: t("an appliance is switched off", "कोई उपकरण बंद किया जाए"),
        feedback: t("Switching off just breaks one branch.", "बंद करने से बस एक शाखा टूटती है।"),
      },
    ],
  },
  parallel: {
    prompt: t(
      "Appliances in a house are connected in parallel so that…",
      "घर में उपकरण पार्श्वक्रम में जोड़े जाते हैं ताकि…",
    ),
    right: t(
      "each gets the same 220 V and has its own switch",
      "हर एक को वही 220 V मिले और उसका अपना स्विच हो",
    ),
    wrong: [
      {
        label: t("the total current is smaller", "कुल धारा कम रहे"),
        feedback: t("In parallel the currents add up.", "पार्श्वक्रम में धाराएँ जुड़ती हैं।"),
      },
    ],
  },
} satisfies Record<string, Item>;

type Key = keyof typeof items;

/** Domestic circuits (NCERT 13.7; in-text Q1, Q3; Exercises 5, 6(d), 17). */
export const wiringAtHome = family({
  level: Level.Easy,
  tests: [Concept.DomesticCircuits],
  params: z.object({ item: z.enum(Object.keys(items) as [Key, ...Key[]]) }).strict(),
  build: ({ item }, b) => itemBoard(b, items[item], seedOf(item)),
});

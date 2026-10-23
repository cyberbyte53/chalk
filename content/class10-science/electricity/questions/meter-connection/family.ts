import { family, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Item, itemBoard, seedOf } from "../../quiz";

const items = {
  ammeter: {
    prompt: t("How is an ammeter connected in a circuit?", "ऐमीटर परिपथ में कैसे जोड़ा जाता है?"),
    right: t("In series, so the current flows through it", "श्रेणीक्रम में, ताकि धारा उसमें से बहे"),
    wrong: [
      {
        label: t("In parallel, across a component", "पार्श्वक्रम में, किसी भाग के आर-पार"),
        feedback: t(
          "That's the voltmeter. An ammeter must have the current pass through it.",
          "वह वोल्टमीटर है। ऐमीटर में से धारा को गुज़रना होता है।",
        ),
      },
    ],
  },
  voltmeter: {
    prompt: t(
      "How is a voltmeter connected to measure the potential difference between two points?",
      "दो बिंदुओं के बीच विभवांतर मापने के लिए वोल्टमीटर कैसे जोड़ा जाता है?",
    ),
    right: t("In parallel, across the two points", "पार्श्वक्रम में, दोनों बिंदुओं के आर-पार"),
    wrong: [
      {
        label: t("In series with the component", "भाग के साथ श्रेणीक्रम में"),
        feedback: t(
          "A voltmeter compares two points, so its two ends go to those two points.",
          "वोल्टमीटर दो बिंदुओं की तुलना करता है, इसलिए उसके दो सिरे उन दो बिंदुओं पर जाते हैं।",
        ),
      },
    ],
  },
  volt: {
    prompt: t(
      "What is meant by saying that the potential difference between two points is 1 V?",
      "दो बिंदुओं के बीच विभवांतर 1 V होने का क्या अर्थ है?",
    ),
    right: t(
      "1 J of work is done to move 1 C of charge between them",
      "उनके बीच 1 C आवेश ले जाने में 1 J कार्य होता है",
    ),
    wrong: [
      {
        label: t("1 C of charge flows between them each second", "हर सेकंड उनके बीच 1 C आवेश बहता है"),
        feedback: t(
          "Coulombs per second is a current of 1 A. A volt is joules per coulomb.",
          "कूलॉम प्रति सेकंड 1 A धारा है। वोल्ट जूल प्रति कूलॉम है।",
        ),
      },
    ],
  },
  source: {
    prompt: t(
      "Name a device that helps to maintain a potential difference across a conductor.",
      "ऐसी युक्ति बताओ जो किसी चालक के सिरों पर विभवांतर बनाए रखती है।",
    ),
    right: t("A cell or battery", "सेल या बैटरी"),
    wrong: [
      {
        label: t("A voltmeter", "वोल्टमीटर"),
        feedback: t(
          "A voltmeter only measures the potential difference. A cell keeps it up.",
          "वोल्टमीटर केवल विभवांतर मापता है। सेल उसे बनाए रखता है।",
        ),
      },
      {
        label: t("A plug key", "प्लग कुंजी"),
        feedback: t("A key only closes or opens the path.", "कुंजी केवल रास्ता बंद या खोलती है।"),
      },
    ],
  },
} satisfies Record<string, Item>;

type Key = keyof typeof items;

/** Ammeter in series, voltmeter in parallel, and what a volt means. */
export const meterConnection = family({
  level: Level.Easy,
  tests: [Concept.PotentialDifference],
  params: z.object({ item: z.enum(Object.keys(items) as [Key, ...Key[]]) }).strict(),
  build: ({ item }, b) => itemBoard(b, items[item], seedOf(item)),
});

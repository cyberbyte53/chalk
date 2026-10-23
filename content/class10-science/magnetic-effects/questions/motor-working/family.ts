import { family, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Item, itemBoard, seedOf } from "../../quiz";

const items = {
  energy: {
    prompt: t("An electric motor converts…", "विद्युत मोटर बदलती है…"),
    right: t("electrical energy into mechanical energy", "विद्युत ऊर्जा को यांत्रिक ऊर्जा में"),
    wrong: [
      {
        label: t("mechanical energy into electrical energy", "यांत्रिक ऊर्जा को विद्युत ऊर्जा में"),
        feedback: t(
          "That's a generator. A motor takes a current and gives motion.",
          "यह जनित्र है। मोटर धारा लेकर गति देती है।",
        ),
      },
    ],
  },
  principle: {
    prompt: t(
      "An electric motor works on the principle that…",
      "विद्युत मोटर इस सिद्धांत पर काम करती है कि…",
    ),
    right: t(
      "a current-carrying conductor in a magnetic field feels a force",
      "चुंबकीय क्षेत्र में धारावाही चालक बल महसूस करता है",
    ),
    wrong: [
      {
        label: t("a moving magnet induces a current", "चलता चुंबक धारा प्रेरित करता है"),
        feedback: t("That's induction, the generator's principle.", "यह प्रेरण है, जनित्र का सिद्धांत।"),
      },
    ],
  },
  rock: {
    prompt: t(
      "A motor's split ring is replaced by two plain rings. The coil now…",
      "मोटर के विभक्त वलय की जगह दो सादे वलय लगा दिए जाते हैं। कुंडली अब…",
    ),
    right: t("only rocks to and fro", "बस आगे-पीछे डोलती है"),
    wrong: [
      {
        label: t("spins faster", "तेज़ घूमती है"),
        feedback: t(
          "Without the reversal, after half a turn the forces push it back.",
          "उलटाव के बिना, आधे चक्कर के बाद बल उसे वापस धकेलते हैं।",
        ),
      },
    ],
  },
  devices: {
    prompt: t(
      "Which of these does NOT contain an electric motor?",
      "इनमें से किसमें विद्युत मोटर नहीं होती?",
    ),
    right: t("An electric bulb", "बिजली का बल्ब"),
    wrong: [
      {
        label: t("A ceiling fan", "छत का पंखा"),
        feedback: t("A fan's blades are turned by a motor.", "पंखे के ब्लेड मोटर घुमाती है।"),
      },
      {
        label: t("A mixer", "मिक्सर"),
        feedback: t("A mixer's blades are turned by a motor.", "मिक्सर के ब्लेड मोटर घुमाती है।"),
      },
      {
        label: t("A washing machine", "वॉशिंग मशीन"),
        feedback: t("Its drum is turned by a motor.", "इसका ड्रम मोटर घुमाती है।"),
      },
    ],
  },
} satisfies Record<string, Item>;

type Key = keyof typeof items;

/** How an electric motor works (NCERT 13.4; in-text Q1, Q2; Exercises 6(a), 12). */
export const motorWorking = family({
  level: Level.Medium,
  tests: [Concept.ElectricMotor],
  params: z.object({ item: z.enum(Object.keys(items) as [Key, ...Key[]]) }).strict(),
  build: ({ item }, b) => itemBoard(b, items[item], seedOf(item)),
});

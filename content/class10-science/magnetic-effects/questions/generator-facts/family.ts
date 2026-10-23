import { family, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Item, itemBoard, seedOf } from "../../quiz";

const items = {
  device: {
    prompt: t(
      "The device used for producing electric current is a…",
      "विद्युत धारा उत्पन्न करने वाली युक्ति है…",
    ),
    right: t("generator", "जनित्र"),
    wrong: [
      {
        label: t("galvanometer", "गैल्वेनोमीटर"),
        feedback: t("A galvanometer detects a current.", "गैल्वेनोमीटर धारा का पता लगाता है।"),
      },
      {
        label: t("motor", "मोटर"),
        feedback: t("A motor uses a current to make motion.", "मोटर धारा से गति बनाती है।"),
      },
    ],
  },
  principle: {
    prompt: t(
      "True or false: an electric generator works on the principle of electromagnetic induction.",
      "सही या ग़लत: विद्युत जनित्र विद्युत चुंबकीय प्रेरण के सिद्धांत पर काम करता है।",
    ),
    right: t("True", "सही"),
    wrong: [
      {
        label: t("False", "ग़लत"),
        feedback: t(
          "A coil turning in a field has a current induced in it: that is induction.",
          "क्षेत्र में घूमती कुंडली में धारा प्रेरित होती है: यही प्रेरण है।",
        ),
      },
    ],
  },
  energy: {
    prompt: t("A generator converts…", "जनित्र बदलता है…"),
    right: t("mechanical energy into electrical energy", "यांत्रिक ऊर्जा को विद्युत ऊर्जा में"),
    wrong: [
      {
        label: t("electrical energy into mechanical energy", "विद्युत ऊर्जा को यांत्रिक ऊर्जा में"),
        feedback: t("That's a motor.", "यह मोटर है।"),
      },
    ],
  },
  brushes: {
    prompt: t("In a generator, the brushes…", "जनित्र में ब्रश…"),
    right: t(
      "carry the current from the rotating rings to the outside circuit",
      "घूमते वलयों से धारा बाहरी परिपथ तक ले जाते हैं",
    ),
    wrong: [
      {
        label: t("turn the coil", "कुंडली घुमाते हैं"),
        feedback: t(
          "The coil is turned by the axle; the brushes stay still and pass the current on.",
          "कुंडली धुरी घुमाती है; ब्रश स्थिर रहते हैं और धारा आगे भेजते हैं।",
        ),
      },
    ],
  },
} satisfies Record<string, Item>;

type Key = keyof typeof items;

/** The electric generator (NCERT 13.6; in-text Q1; Exercises 3, 6(b), 16). */
export const generatorFacts = family({
  level: Level.Easy,
  tests: [Concept.ElectricGenerator],
  params: z.object({ item: z.enum(Object.keys(items) as [Key, ...Key[]]) }).strict(),
  build: ({ item }, b) => itemBoard(b, items[item], seedOf(item)),
});

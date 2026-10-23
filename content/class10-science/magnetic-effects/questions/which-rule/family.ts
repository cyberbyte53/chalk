import { family, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Item, itemBoard, seedOf } from "../../quiz";

const items = {
  field: {
    prompt: t(
      "To find the direction of the field round a straight current-carrying wire, use…",
      "सीधे धारावाही तार के चारों ओर क्षेत्र की दिशा जानने के लिए उपयोग करो…",
    ),
    right: t("the right-hand thumb rule", "दक्षिण-हस्त अंगुष्ठ नियम"),
    wrong: [
      {
        label: t("Fleming's left-hand rule", "फ़्लेमिंग का वामहस्त नियम"),
        feedback: t(
          "That gives the force on a current in a field.",
          "वह क्षेत्र में धारा पर बल बताता है।",
        ),
      },
    ],
  },
  force: {
    prompt: t(
      "To find the force on a current-carrying wire in a magnetic field, use…",
      "चुंबकीय क्षेत्र में धारावाही तार पर बल जानने के लिए उपयोग करो…",
    ),
    right: t("Fleming's left-hand rule", "फ़्लेमिंग का वामहस्त नियम"),
    wrong: [
      {
        label: t("Fleming's right-hand rule", "फ़्लेमिंग का दक्षिण-हस्त नियम"),
        feedback: t("The right hand gives an induced current.", "दायाँ हाथ प्रेरित धारा बताता है।"),
      },
    ],
  },
  induced: {
    prompt: t(
      "To find the current induced in a coil rotating in a magnetic field, use…",
      "चुंबकीय क्षेत्र में घूमती कुंडली में प्रेरित धारा जानने के लिए उपयोग करो…",
    ),
    right: t("Fleming's right-hand rule", "फ़्लेमिंग का दक्षिण-हस्त नियम"),
    wrong: [
      {
        label: t("Fleming's left-hand rule", "फ़्लेमिंग का वामहस्त नियम"),
        feedback: t(
          "The left hand is for motors: force on a current.",
          "बायाँ हाथ मोटर के लिए है: धारा पर बल।",
        ),
      },
      {
        label: t("The right-hand thumb rule", "दक्षिण-हस्त अंगुष्ठ नियम"),
        feedback: t("That gives the field round a wire.", "वह तार के चारों ओर क्षेत्र बताता है।"),
      },
    ],
  },
} satisfies Record<string, Item>;

type Key = keyof typeof items;

/** Which rule to use: the thumb rule, the left hand or the right hand (NCERT Exercise 15). */
export const whichRule = family({
  level: Level.Medium,
  tests: [Concept.FieldOfAStraightWire, Concept.ForceOnACurrent, Concept.ElectromagneticInduction],
  params: z.object({ item: z.enum(Object.keys(items) as [Key, ...Key[]]) }).strict(),
  build: ({ item }, b) => itemBoard(b, items[item], seedOf(item)),
});

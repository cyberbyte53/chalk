import { family, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Item, itemBoard, seedOf } from "../../quiz";

const items = {
  inside: {
    prompt: t(
      "The magnetic field inside a long straight solenoid carrying a current is…",
      "धारावाही लंबी सीधी परिनालिका के अंदर चुंबकीय क्षेत्र…",
    ),
    right: t("the same at all points", "सभी बिंदुओं पर एक समान"),
    wrong: [
      {
        label: t("zero", "शून्य"),
        feedback: t(
          "Inside is where the field is strongest and uniform.",
          "अंदर ही क्षेत्र प्रबल और एकसमान होता है।",
        ),
      },
      {
        label: t("weaker towards the ends", "सिरों की ओर कमज़ोर"),
        feedback: t(
          "Inside, the lines are parallel and evenly spaced: uniform.",
          "अंदर रेखाएँ समांतर और बराबर दूरी पर हैं: एकसमान।",
        ),
      },
    ],
  },
  like: {
    prompt: t(
      "A current-carrying solenoid behaves like…",
      "धारावाही परिनालिका किसकी तरह व्यवहार करती है?",
    ),
    right: t(
      "a bar magnet, with a N pole at one end and a S pole at the other",
      "एक छड़ चुंबक, एक सिरे पर N ध्रुव और दूसरे पर S",
    ),
    wrong: [
      {
        label: t("a single straight wire", "एक अकेले सीधे तार"),
        feedback: t(
          "Its field outside matches a bar magnet's, end to end.",
          "बाहर इसका क्षेत्र एक सिरे से दूसरे तक छड़ चुंबक जैसा है।",
        ),
      },
    ],
  },
  turns: {
    prompt: t(
      "A circular coil has 4 turns instead of 1, with the same current. The field at its centre becomes…",
      "एक वृत्ताकार कुंडली में 1 की जगह 4 फेरे हैं, धारा वही। उसके केंद्र पर क्षेत्र हो जाता है…",
    ),
    right: t("4 times as large", "4 गुना"),
    wrong: [
      {
        label: t("a quarter as large", "एक-चौथाई"),
        feedback: t("Each turn adds its field the same way.", "हर फेरा अपना क्षेत्र उसी ओर जोड़ता है।"),
      },
      {
        label: t("unchanged", "अपरिवर्तित"),
        feedback: t("The fields of the turns add up.", "फेरों के क्षेत्र जुड़ जाते हैं।"),
      },
    ],
  },
  core: {
    prompt: t("The core of an electromagnet is made of…", "विद्युत चुंबक का क्रोड बनता है…"),
    right: t("soft iron", "नरम लोहे से"),
    wrong: [
      {
        label: t("copper", "ताँबे से"),
        feedback: t(
          "Copper isn't magnetic. Soft iron becomes a strong magnet while the current flows.",
          "ताँबा चुंबकीय नहीं है। नरम लोहा धारा बहने तक प्रबल चुंबक बनता है।",
        ),
      },
      {
        label: t("plastic", "प्लास्टिक से"),
        feedback: t("Plastic can't be magnetised.", "प्लास्टिक चुंबकित नहीं हो सकता।"),
      },
    ],
  },
  methods: {
    prompt: t(
      "Which are two ways of producing a magnetic field?",
      "चुंबकीय क्षेत्र उत्पन्न करने के दो तरीक़े कौन-से हैं?",
    ),
    right: t("A permanent magnet, and a current in a conductor", "स्थायी चुंबक, और चालक में धारा"),
    wrong: [
      {
        label: t("Heating a wire, and rubbing a rod", "तार गर्म करना, और छड़ रगड़ना"),
        feedback: t(
          "Heating makes heat, not a field. A magnet or a current makes a field.",
          "गर्म करने से गर्मी बनती है, क्षेत्र नहीं। चुंबक या धारा क्षेत्र बनाते हैं।",
        ),
      },
    ],
  },
} satisfies Record<string, Item>;

type Key = keyof typeof items;

/** Loops, solenoids and electromagnets (NCERT 13.2.3–13.2.4; in-text Q3; Exercises 6(c), 7, 8). */
export const solenoidFacts = family({
  level: Level.Easy,
  tests: [Concept.LoopsAndSolenoids],
  params: z.object({ item: z.enum(Object.keys(items) as [Key, ...Key[]]) }).strict(),
  build: ({ item }, b) => itemBoard(b, items[item], seedOf(item)),
});

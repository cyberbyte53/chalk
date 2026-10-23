import { family, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Item, itemBoard, seedOf } from "../../quiz";

const items = {
  largest: {
    prompt: t(
      "The force on a current-carrying conductor in a magnetic field is largest when…",
      "चुंबकीय क्षेत्र में धारावाही चालक पर बल सबसे अधिक कब होता है?",
    ),
    right: t("the current is at right angles to the field", "जब धारा क्षेत्र के लंबवत हो"),
    wrong: [
      {
        label: t("the current is along the field", "जब धारा क्षेत्र के साथ-साथ हो"),
        feedback: t("Along the field there is no force.", "क्षेत्र के साथ-साथ कोई बल नहीं होता।"),
      },
    ],
  },
  moreCurrent: {
    prompt: t(
      "In Activity 13.7 the current in rod AB is increased. The displacement of the rod…",
      "क्रियाकलाप 13.7 में छड़ AB की धारा बढ़ाई जाती है। छड़ का विस्थापन…",
    ),
    right: t("increases", "बढ़ता है"),
    wrong: [
      {
        label: t("decreases", "घटता है"),
        feedback: t("More current, bigger force, bigger swing.", "अधिक धारा, बड़ा बल, बड़ा झूलना।"),
      },
    ],
  },
  magnet: {
    prompt: t(
      "A stronger horse-shoe magnet is used. The rod's displacement…",
      "एक प्रबल नाल चुंबक लगाया जाता है। छड़ का विस्थापन…",
    ),
    right: t("increases", "बढ़ता है"),
    wrong: [
      {
        label: t("is unchanged", "नहीं बदलता"),
        feedback: t("A stronger field gives a bigger force.", "प्रबल क्षेत्र बड़ा बल देता है।"),
      },
    ],
  },
  proton: {
    prompt: t(
      "A proton moves freely in a magnetic field. Which can change?",
      "एक प्रोटॉन चुंबकीय क्षेत्र में मुक्त रूप से चलता है। क्या बदल सकता है?",
    ),
    right: t("Its velocity and momentum", "उसका वेग और संवेग"),
    wrong: [
      {
        label: t("Its mass and charge", "उसका द्रव्यमान और आवेश"),
        feedback: t(
          "Mass doesn't change. The force turns its direction, so velocity and momentum change.",
          "द्रव्यमान नहीं बदलता। बल उसकी दिशा मोड़ता है, इसलिए वेग और संवेग बदलते हैं।",
        ),
      },
      {
        label: t("Its speed, but not its direction", "उसकी चाल, पर दिशा नहीं"),
        feedback: t(
          "The force is at right angles to the motion, so it turns the proton without changing its speed.",
          "बल गति के लंबवत है, इसलिए वह चाल बदले बिना प्रोटॉन को मोड़ता है।",
        ),
      },
    ],
  },
} satisfies Record<string, Item>;

type Key = keyof typeof items;

/** What the force on a current depends on (NCERT 13.3; in-text Q1, Q2; Exercise 9). */
export const forceSize = family({
  level: Level.Easy,
  tests: [Concept.ForceOnACurrent],
  params: z.object({ item: z.enum(Object.keys(items) as [Key, ...Key[]]) }).strict(),
  build: ({ item }, b) => itemBoard(b, items[item], seedOf(item)),
});

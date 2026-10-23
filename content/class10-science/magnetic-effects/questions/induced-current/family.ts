import { family, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Item, itemBoard, seedOf } from "../../quiz";

const items = {
  push: {
    prompt: t(
      "A bar magnet's N pole is pushed into a coil joined to a galvanometer. The needle…",
      "गैल्वेनोमीटर से जुड़ी कुंडली में छड़ चुंबक का N ध्रुव धकेला जाता है। सुई…",
    ),
    right: t(
      "deflects for a moment, then returns to zero",
      "क्षण भर विक्षेपित होती है, फिर शून्य पर लौटती है",
    ),
    wrong: [
      {
        label: t("stays deflected as long as the key is closed", "कुंजी बंद रहने तक विक्षेपित रहती है"),
        feedback: t(
          "The current lasts only while the magnet moves.",
          "धारा केवल तब तक रहती है जब तक चुंबक चलता है।",
        ),
      },
      {
        label: t(
          "doesn't move at all, as nothing is changing",
          "बिल्कुल नहीं हिलती, क्योंकि कुछ नहीं बदल रहा",
        ),
        feedback: t(
          "Moving the magnet changes the field through the coil and induces a current.",
          "चुंबक चलाने से कुंडली से गुज़रता क्षेत्र बदलता है और धारा प्रेरित होती है।",
        ),
      },
    ],
  },
  withdraw: {
    prompt: t(
      "The magnet is now pulled out of the coil. The needle deflects…",
      "अब चुंबक कुंडली से बाहर खींचा जाता है। सुई विक्षेपित होती है…",
    ),
    right: t("the opposite way", "उलटी ओर"),
    wrong: [
      {
        label: t("the same way", "उसी ओर"),
        feedback: t(
          "Reversing the motion reverses the induced current.",
          "गति उलटने से प्रेरित धारा उलट जाती है।",
        ),
      },
    ],
  },
  still: {
    prompt: t(
      "The magnet is held still inside the coil. The galvanometer shows…",
      "चुंबक कुंडली के अंदर स्थिर रखा है। गैल्वेनोमीटर दिखाता है…",
    ),
    right: t("no deflection", "कोई विक्षेप नहीं"),
    wrong: [
      {
        label: t("a steady deflection", "स्थिर विक्षेप"),
        feedback: t(
          "Nothing is changing, so nothing is induced.",
          "कुछ नहीं बदल रहा, इसलिए कुछ प्रेरित नहीं होता।",
        ),
      },
    ],
  },
  coils: {
    prompt: t(
      "Two coils A and B are close together. The current in A is changed. Is a current induced in B?",
      "दो कुंडलियाँ A और B पास-पास हैं। A में धारा बदली जाती है। क्या B में धारा प्रेरित होगी?",
    ),
    right: t(
      "Yes: the changing field of A changes the field through B",
      "हाँ: A का बदलता क्षेत्र B से गुज़रता क्षेत्र बदलता है",
    ),
    wrong: [
      {
        label: t("No: the coils don't touch", "नहीं: कुंडलियाँ छूती नहीं"),
        feedback: t(
          "They don't need to touch. The changing magnetic field links them.",
          "उन्हें छूने की ज़रूरत नहीं। बदलता चुंबकीय क्षेत्र उन्हें जोड़ता है।",
        ),
      },
    ],
  },
  steady: {
    prompt: t(
      "In Activity 13.9 the key in coil 1 stays closed with a steady current. Coil 2's galvanometer shows…",
      "क्रियाकलाप 13.9 में कुंडली 1 की कुंजी स्थिर धारा के साथ बंद रहती है। कुंडली 2 का गैल्वेनोमीटर दिखाता है…",
    ),
    right: t("zero", "शून्य"),
    wrong: [
      {
        label: t("a steady current", "एक स्थिर धारा"),
        feedback: t(
          "Only a changing current in coil 1 induces one in coil 2.",
          "केवल कुंडली 1 में बदलती धारा ही कुंडली 2 में धारा प्रेरित करती है।",
        ),
      },
    ],
  },
} satisfies Record<string, Item>;

type Key = keyof typeof items;

/** Galvanometer kicks in Activity 13.8 and 13.9 (NCERT 13.5; Exercises 13, 14). */
export const inducedCurrent = family({
  level: Level.Easy,
  tests: [Concept.ElectromagneticInduction],
  params: z.object({ item: z.enum(Object.keys(items) as [Key, ...Key[]]) }).strict(),
  build: ({ item }, b) => itemBoard(b, items[item], seedOf(item)),
});

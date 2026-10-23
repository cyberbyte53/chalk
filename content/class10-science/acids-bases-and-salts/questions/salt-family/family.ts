import { family } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Item, askItem, seedOf, w, wrong } from "../../qkit";

const ITEMS = {
  sodium: {
    prompt: w("NaCl and Na₂SO₄ belong to the family of:", "NaCl और Na₂SO₄ किस कुल के हैं:"),
    right: w("Sodium salts", "सोडियम लवण"),
    wrong: [
      wrong(
        w("Chloride salts", "क्लोराइड लवण"),
        w(
          "Na₂SO₄ is not a chloride. What they share is sodium.",
          "Na₂SO₄ क्लोराइड नहीं है। साझा सोडियम है।",
        ),
      ),
    ],
  },
  chloride: {
    prompt: w("NaCl and KCl belong to the family of:", "NaCl और KCl किस कुल के हैं:"),
    right: w("Chloride salts", "क्लोराइड लवण"),
    wrong: [
      wrong(
        w("Sodium salts", "सोडियम लवण"),
        w("KCl has no sodium. What they share is chloride.", "KCl में सोडियम नहीं। साझा क्लोराइड है।"),
      ),
    ],
  },
  sulphate: {
    prompt: w("Which pair is in the same family?", "कौन-सा जोड़ा एक ही कुल का है?"),
    right: w("CuSO₄ and MgSO₄", "CuSO₄ और MgSO₄"),
    wrong: [
      wrong(
        w("CuSO₄ and NaCl", "CuSO₄ और NaCl"),
        w("They share no radical.", "इनका कोई मूलक साझा नहीं।"),
      ),
    ],
  },
  parentsK2so4: {
    prompt: w(
      "Potassium sulphate is made from which acid and base?",
      "पोटैशियम सल्फ़ेट किस अम्ल और क्षारक से बनता है?",
    ),
    right: w("Sulphuric acid and potassium hydroxide", "सल्फ़्यूरिक अम्ल और पोटैशियम हाइड्रॉक्साइड"),
    wrong: [
      wrong(
        w("Hydrochloric acid and potassium hydroxide", "हाइड्रोक्लोरिक अम्ल और पोटैशियम हाइड्रॉक्साइड"),
        w(
          "Hydrochloric acid gives chlorides; sulphate comes from sulphuric acid.",
          "हाइड्रोक्लोरिक अम्ल क्लोराइड देता है; सल्फ़ेट सल्फ़्यूरिक अम्ल से आता है।",
        ),
      ),
    ],
  },
  parentsNano3: {
    prompt: w(
      "Sodium nitrate is made from which acid and base?",
      "सोडियम नाइट्रेट किस अम्ल और क्षारक से बनता है?",
    ),
    right: w("Nitric acid and sodium hydroxide", "नाइट्रिक अम्ल और सोडियम हाइड्रॉक्साइड"),
    wrong: [
      wrong(
        w("Sulphuric acid and sodium hydroxide", "सल्फ़्यूरिक अम्ल और सोडियम हाइड्रॉक्साइड"),
        w(
          "Sulphuric acid gives sulphates; nitrate comes from nitric acid.",
          "सल्फ़्यूरिक अम्ल सल्फ़ेट देता है; नाइट्रेट नाइट्रिक अम्ल से आता है।",
        ),
      ),
    ],
  },
} satisfies Record<string, Item>;

type Key = keyof typeof ITEMS;
const KEYS = Object.keys(ITEMS) as [Key, ...Key[]];

/** Families of salts and their parents. */
export const saltFamily = family({
  level: Level.Easy,
  tests: [Concept.SaltsAndTheirPh],
  params: z.object({ item: z.enum(KEYS) }).strict(),
  build: ({ item }, b) => askItem(b, ITEMS[item], seedOf(item)),
});

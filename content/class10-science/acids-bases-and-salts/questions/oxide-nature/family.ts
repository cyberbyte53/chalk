import { family } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Item, askItem, seedOf, w, wrong } from "../../qkit";

const ITEMS = {
  cuo: {
    prompt: w(
      "Copper oxide, CuO, reacts with hydrochloric acid to give a salt and water. It is a:",
      "कॉपर ऑक्साइड, CuO, हाइड्रोक्लोरिक अम्ल से लवण और जल देता है। यह है:",
    ),
    right: w("Basic oxide", "क्षारकीय ऑक्साइड"),
    wrong: [
      wrong(
        w("Acidic oxide", "अम्लीय ऑक्साइड"),
        w(
          "It reacts with an acid, like a base. Metal oxides are basic.",
          "यह अम्ल से अभिक्रिया करता है, क्षारक की तरह। धातु ऑक्साइड क्षारकीय हैं।",
        ),
      ),
    ],
  },
  co2: {
    prompt: w(
      "Carbon dioxide reacts with lime water (a base) to give a salt and water. It is a:",
      "कार्बन डाइऑक्साइड चूने के पानी (एक क्षारक) से लवण और जल देती है। यह है:",
    ),
    right: w("Acidic oxide", "अम्लीय ऑक्साइड"),
    wrong: [
      wrong(
        w("Basic oxide", "क्षारकीय ऑक्साइड"),
        w(
          "It reacts with a base, like an acid. Non-metal oxides are acidic.",
          "यह क्षारक से अभिक्रिया करती है, अम्ल की तरह। अधातु ऑक्साइड अम्लीय हैं।",
        ),
      ),
    ],
  },
  mgo: {
    prompt: w(
      "Magnesium oxide, MgO, is an oxide of a metal. It is:",
      "मैग्नीशियम ऑक्साइड, MgO, एक धातु का ऑक्साइड है। यह है:",
    ),
    right: w("Basic", "क्षारकीय"),
    wrong: [wrong(w("Acidic", "अम्लीय"), w("Metal oxides are basic.", "धातु ऑक्साइड क्षारकीय होते हैं।"))],
  },
  so2: {
    prompt: w(
      "Sulphur dioxide, SO₂, is an oxide of a non-metal. It is:",
      "सल्फ़र डाइऑक्साइड, SO₂, एक अधातु का ऑक्साइड है। यह है:",
    ),
    right: w("Acidic", "अम्लीय"),
    wrong: [
      wrong(w("Basic", "क्षारकीय"), w("Non-metal oxides are acidic.", "अधातु ऑक्साइड अम्लीय होते हैं।")),
    ],
  },
} satisfies Record<string, Item>;

type Key = keyof typeof ITEMS;
const KEYS = Object.keys(ITEMS) as [Key, ...Key[]];

/** Acidic or basic oxide? */
export const oxideNature = family({
  level: Level.Easy,
  tests: [Concept.Neutralisation],
  params: z.object({ item: z.enum(KEYS) }).strict(),
  build: ({ item }, b) => askItem(b, ITEMS[item], seedOf(item)),
});

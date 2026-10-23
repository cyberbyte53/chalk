import { family } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Item, askItem, seedOf, w, wrong } from "../../qkit";

const ITEMS = {
  nacl: {
    prompt: w(
      "Sodium chloride (from HCl, strong, and NaOH, strong). Its solution is:",
      "सोडियम क्लोराइड (HCl, प्रबल, और NaOH, प्रबल से)। इसका विलयन है:",
    ),
    right: w("Neutral", "उदासीन"),
    wrong: [
      wrong(w("Basic", "क्षारकीय"), w("Both parents strong: neutral.", "दोनों जनक प्रबल: उदासीन।")),
    ],
  },
  kno3: {
    prompt: w(
      "Potassium nitrate (from HNO₃, strong, and KOH, strong). Its solution is:",
      "पोटैशियम नाइट्रेट (HNO₃, प्रबल, और KOH, प्रबल से)। इसका विलयन है:",
    ),
    right: w("Neutral", "उदासीन"),
    wrong: [
      wrong(w("Acidic", "अम्लीय"), w("Both parents strong: neutral.", "दोनों जनक प्रबल: उदासीन।")),
    ],
  },
  nh4cl: {
    prompt: w(
      "Ammonium chloride (from HCl, strong, and NH₄OH, weak). Its solution is:",
      "अमोनियम क्लोराइड (HCl, प्रबल, और NH₄OH, दुर्बल से)। इसका विलयन है:",
    ),
    right: w("Acidic", "अम्लीय"),
    wrong: [
      wrong(w("Basic", "क्षारकीय"), w("The strong parent is the acid.", "प्रबल जनक अम्ल है।")),
      wrong(
        w("Neutral", "उदासीन"),
        w("Neutral needs both parents strong.", "उदासीन के लिए दोनों जनक प्रबल चाहिए।"),
      ),
    ],
  },
  na2co3: {
    prompt: w(
      "Sodium carbonate (from carbonic acid, weak, and NaOH, strong). Its solution is:",
      "सोडियम कार्बोनेट (कार्बोनिक अम्ल, दुर्बल, और NaOH, प्रबल से)। इसका विलयन है:",
    ),
    right: w("Basic", "क्षारकीय"),
    wrong: [wrong(w("Acidic", "अम्लीय"), w("The strong parent is the base.", "प्रबल जनक क्षारक है।"))],
  },
  acetate: {
    prompt: w(
      "Sodium acetate (from acetic acid, weak, and NaOH, strong). Its solution is:",
      "सोडियम ऐसीटेट (ऐसीटिक अम्ल, दुर्बल, और NaOH, प्रबल से)। इसका विलयन है:",
    ),
    right: w("Basic", "क्षारकीय"),
    wrong: [
      wrong(
        w("Neutral", "उदासीन"),
        w("Neutral needs both parents strong.", "उदासीन के लिए दोनों जनक प्रबल चाहिए।"),
      ),
    ],
  },
  bakingSoda: {
    prompt: w("Baking soda, NaHCO₃, in water is:", "पानी में खाने का सोडा, NaHCO₃, है:"),
    right: w("Mildly basic", "हल्का क्षारकीय"),
    wrong: [
      wrong(
        w("Neutral, like table salt", "उदासीन, नमक की तरह"),
        w(
          "Its acid parent (carbonic acid) is weak, so it is basic.",
          "इसका अम्ल जनक (कार्बोनिक अम्ल) दुर्बल है, इसलिए यह क्षारकीय है।",
        ),
      ),
    ],
  },
} satisfies Record<string, Item>;

type Key = keyof typeof ITEMS;
const KEYS = Object.keys(ITEMS) as [Key, ...Key[]];

/** Is the salt's solution acidic, basic or neutral? */
export const saltNature = family({
  level: Level.Medium,
  tests: [Concept.SaltsAndTheirPh],
  params: z.object({ item: z.enum(KEYS) }).strict(),
  build: ({ item }, b) => askItem(b, ITEMS[item], seedOf(item)),
});

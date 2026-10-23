import { family } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Item, askItem, seedOf, w, wrong } from "../../qkit";

const ITEMS = {
  products: {
    prompt: w(
      "An acid neutralises a base. The products are:",
      "एक अम्ल किसी क्षारक को उदासीन करता है। उत्पाद हैं:",
    ),
    right: w("A salt and water", "लवण और जल"),
    wrong: [
      wrong(
        w("A salt and hydrogen", "लवण और हाइड्रोजन"),
        w(
          "Hydrogen comes from a metal. Acid + base gives salt + water.",
          "हाइड्रोजन धातु से आती है। अम्ल + क्षारक लवण + जल देते हैं।",
        ),
      ),
    ],
  },
  double: {
    prompt: w(
      "10 mL of NaOH needs 8 mL of an HCl solution. 20 mL of the same NaOH needs:",
      "10 mL NaOH को 8 mL HCl घोल चाहिए। उसी NaOH के 20 mL को चाहिए:",
    ),
    right: w("16 mL", "16 mL"),
    wrong: [
      wrong(
        w("8 mL", "8 mL"),
        w("Twice the base needs twice the acid.", "दोगुने क्षारक को दोगुना अम्ल चाहिए।"),
      ),
      wrong(
        w("4 mL", "4 mL"),
        w("More base needs more acid, not less.", "ज़्यादा क्षारक को ज़्यादा अम्ल चाहिए, कम नहीं।"),
      ),
    ],
  },
  half: {
    prompt: w(
      "10 mL of KOH needs 12 mL of an acid. 5 mL of the same KOH needs:",
      "10 mL KOH को 12 mL अम्ल चाहिए। उसी KOH के 5 mL को चाहिए:",
    ),
    right: w("6 mL", "6 mL"),
    wrong: [
      wrong(
        w("12 mL", "12 mL"),
        w("Half the base needs half the acid.", "आधे क्षारक को आधा अम्ल चाहिए।"),
      ),
      wrong(w("24 mL", "24 mL"), w("Less base needs less acid.", "कम क्षारक को कम अम्ल चाहिए।")),
    ],
  },
  pinkBack: {
    prompt: w(
      "A neutralised flask with phenolphthalein turns pink again. What was added?",
      "फ़िनॉल्फ़्थेलिन वाला उदासीन फ़्लास्क फिर गुलाबी हो गया। क्या डाला गया?",
    ),
    right: w("A little more base", "थोड़ा और क्षारक"),
    wrong: [
      wrong(
        w("A little more acid", "थोड़ा और अम्ल"),
        w(
          "Extra acid keeps phenolphthalein colourless. Pink means base.",
          "अतिरिक्त अम्ल फ़िनॉल्फ़्थेलिन को रंगहीन रखता है। गुलाबी मतलब क्षारक।",
        ),
      ),
    ],
  },
  example: {
    prompt: w("Which is a neutralisation reaction?", "कौन-सी उदासीनीकरण अभिक्रिया है?"),
    right: w("Ca(OH)₂ + 2HCl → CaCl₂ + 2H₂O", "Ca(OH)₂ + 2HCl → CaCl₂ + 2H₂O"),
    wrong: [
      wrong(
        w("Mg + 2HCl → MgCl₂ + H₂", "Mg + 2HCl → MgCl₂ + H₂"),
        w("That's a metal with an acid: it gives hydrogen.", "यह धातु और अम्ल है: यह हाइड्रोजन देता है।"),
      ),
    ],
  },
} satisfies Record<string, Item>;

type Key = keyof typeof ITEMS;
const KEYS = Object.keys(ITEMS) as [Key, ...Key[]];

/** Neutralisation: what's made, and how much acid is needed? */
export const neutralisationCheck = family({
  level: Level.Medium,
  tests: [Concept.Neutralisation],
  params: z.object({ item: z.enum(KEYS) }).strict(),
  build: ({ item }, b) => askItem(b, ITEMS[item], seedOf(item)),
});

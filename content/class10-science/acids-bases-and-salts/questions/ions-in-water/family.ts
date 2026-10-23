import { family } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Item, askItem, seedOf, w, wrong } from "../../qkit";

const ITEMS = {
  acidIon: {
    prompt: w("All acids give which ion in water?", "सभी अम्ल जल में कौन-सा आयन देते हैं?"),
    right: w("H⁺(aq), as H₃O⁺", "H⁺(aq), H₃O⁺ के रूप में"),
    wrong: [wrong(w("OH⁻", "OH⁻"), w("OH⁻ comes from bases.", "OH⁻ क्षारकों से आता है।"))],
  },
  baseIon: {
    prompt: w("All bases give which ion in water?", "सभी क्षारक जल में कौन-सा आयन देते हैं?"),
    right: w("OH⁻(aq)", "OH⁻(aq)"),
    wrong: [wrong(w("H⁺", "H⁺"), w("H⁺ comes from acids.", "H⁺ अम्लों से आता है।"))],
  },
  dryHcl: {
    prompt: w(
      "Dry HCl gas does not change dry blue litmus because:",
      "सूखी HCl गैस सूखे नीले लिटमस को नहीं बदलती क्योंकि:",
    ),
    right: w("H⁺ ions form only in water", "H⁺ आयन केवल जल में बनते हैं"),
    wrong: [
      wrong(
        w("HCl is a weak acid", "HCl दुर्बल अम्ल है"),
        w(
          "HCl is strong; it just needs water to give H⁺.",
          "HCl प्रबल है; उसे H⁺ देने के लिए बस पानी चाहिए।",
        ),
      ),
    ],
  },
  alkali: {
    prompt: w("An alkali is:", "क्षार है:"),
    right: w("A base that dissolves in water", "एक क्षारक जो जल में घुलता है"),
    wrong: [
      wrong(
        w("Any base", "कोई भी क्षारक"),
        w(
          "Not all bases dissolve. Only soluble ones are alkalis.",
          "सभी क्षारक नहीं घुलते। केवल घुलनशील क्षार हैं।",
        ),
      ),
    ],
  },
  dilute: {
    prompt: w(
      "An acid is diluted with water. The H₃O⁺ concentration:",
      "एक अम्ल को पानी से तनु किया गया। H₃O⁺ की सांद्रता:",
    ),
    right: w("Decreases", "घटती है"),
    wrong: [
      wrong(
        w("Increases", "बढ़ती है"),
        w(
          "The ions spread through more water: fewer per unit volume.",
          "आयन ज़्यादा पानी में फैलते हैं: प्रति इकाई आयतन कम।",
        ),
      ),
    ],
  },
  moreBase: {
    prompt: w(
      "Excess base is dissolved in sodium hydroxide solution. The OH⁻ concentration:",
      "सोडियम हाइड्रॉक्साइड घोल में अतिरिक्त क्षारक घोला गया। OH⁻ की सांद्रता:",
    ),
    right: w("Increases", "बढ़ती है"),
    wrong: [
      wrong(
        w("Decreases", "घटती है"),
        w("More base in the same water means more OH⁻.", "उसी पानी में ज़्यादा क्षारक मतलब ज़्यादा OH⁻।"),
      ),
    ],
  },
} satisfies Record<string, Item>;

type Key = keyof typeof ITEMS;
const KEYS = Object.keys(ITEMS) as [Key, ...Key[]];

/** Which ions, and what happens to them? */
export const ionsInWater = family({
  level: Level.Medium,
  tests: [Concept.AcidsAndBasesInWater, Concept.PhScale],
  params: z.object({ item: z.enum(KEYS) }).strict(),
  build: ({ item }, b) => askItem(b, ITEMS[item], seedOf(item)),
});

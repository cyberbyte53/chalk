import { family } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Item, askItem, seedOf, w, wrong } from "../../qkit";

const ITEMS = {
  caocl2: {
    prompt: w("CaOCl₂ is commonly called:", "CaOCl₂ का सामान्य नाम है:"),
    right: w("Bleaching powder", "विरंजक चूर्ण"),
    wrong: [
      wrong(
        w("Plaster of Paris", "प्लास्टर ऑफ़ पेरिस"),
        w("Plaster of Paris is CaSO₄·½H₂O.", "प्लास्टर ऑफ़ पेरिस CaSO₄·½H₂O है।"),
      ),
    ],
  },
  nahco3: {
    prompt: w("NaHCO₃ is commonly called:", "NaHCO₃ का सामान्य नाम है:"),
    right: w("Baking soda", "खाने का सोडा"),
    wrong: [
      wrong(
        w("Washing soda", "धावन सोडा"),
        w("Washing soda is Na₂CO₃·10H₂O.", "धावन सोडा Na₂CO₃·10H₂O है।"),
      ),
    ],
  },
  washing: {
    prompt: w("Na₂CO₃·10H₂O is commonly called:", "Na₂CO₃·10H₂O का सामान्य नाम है:"),
    right: w("Washing soda", "धावन सोडा"),
    wrong: [
      wrong(w("Baking soda", "खाने का सोडा"), w("Baking soda is NaHCO₃.", "खाने का सोडा NaHCO₃ है।")),
    ],
  },
  gypsum: {
    prompt: w("CaSO₄·2H₂O is commonly called:", "CaSO₄·2H₂O का सामान्य नाम है:"),
    right: w("Gypsum", "जिप्सम"),
    wrong: [
      wrong(
        w("Plaster of Paris", "प्लास्टर ऑफ़ पेरिस"),
        w(
          "Plaster of Paris has only half a water molecule per CaSO₄.",
          "प्लास्टर ऑफ़ पेरिस में प्रति CaSO₄ केवल आधा जल अणु है।",
        ),
      ),
    ],
  },
  pop: {
    prompt: w("CaSO₄·½H₂O is commonly called:", "CaSO₄·½H₂O का सामान्य नाम है:"),
    right: w("Plaster of Paris", "प्लास्टर ऑफ़ पेरिस"),
    wrong: [wrong(w("Gypsum", "जिप्सम"), w("Gypsum is CaSO₄·2H₂O.", "जिप्सम CaSO₄·2H₂O है।"))],
  },
  blue: {
    prompt: w("CuSO₄·5H₂O is:", "CuSO₄·5H₂O है:"),
    right: w("Blue copper sulphate crystals", "नीले कॉपर सल्फ़ेट क्रिस्टल"),
    wrong: [
      wrong(
        w("White copper sulphate powder", "सफ़ेद कॉपर सल्फ़ेट चूर्ण"),
        w(
          "The white powder has lost its water: plain CuSO₄.",
          "सफ़ेद चूर्ण अपना पानी खो चुका है: सादा CuSO₄।",
        ),
      ),
    ],
  },
} satisfies Record<string, Item>;

type Key = keyof typeof ITEMS;
const KEYS = Object.keys(ITEMS) as [Key, ...Key[]];

/** Match the formula to its common name. */
export const formulaName = family({
  level: Level.Medium,
  tests: [Concept.ChemicalsFromCommonSalt, Concept.WaterOfCrystallisation],
  params: z.object({ item: z.enum(KEYS) }).strict(),
  build: ({ item }, b) => askItem(b, ITEMS[item], seedOf(item)),
});

import { family } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Item, askItem, seedOf, w, wrong } from "../../qkit";

const ITEMS = {
  zincAcid: {
    prompt: w(
      "Zinc granules in dilute sulphuric acid. The gas is:",
      "तनु सल्फ़्यूरिक अम्ल में जिंक के दाने। गैस है:",
    ),
    right: w("Hydrogen", "हाइड्रोजन"),
    wrong: [
      wrong(
        w("Carbon dioxide", "कार्बन डाइऑक्साइड"),
        w(
          "Carbon dioxide comes from carbonates. A metal with acid gives hydrogen.",
          "कार्बन डाइऑक्साइड कार्बोनेट से आती है। धातु और अम्ल हाइड्रोजन देते हैं।",
        ),
      ),
      wrong(
        w("Oxygen", "ऑक्सीजन"),
        w("The metal pushes out hydrogen from the acid.", "धातु अम्ल से हाइड्रोजन बाहर धकेलती है।"),
      ),
    ],
  },
  magnesiumHcl: {
    prompt: w(
      "Magnesium ribbon in dilute hydrochloric acid. The gas is:",
      "तनु हाइड्रोक्लोरिक अम्ल में मैग्नीशियम रिबन। गैस है:",
    ),
    right: w("Hydrogen", "हाइड्रोजन"),
    wrong: [
      wrong(
        w("Chlorine", "क्लोरीन"),
        w(
          "The chlorine stays in the salt, magnesium chloride. The gas is hydrogen.",
          "क्लोरीन लवण, मैग्नीशियम क्लोराइड, में रहती है। गैस हाइड्रोजन है।",
        ),
      ),
    ],
  },
  zincNaoh: {
    prompt: w(
      "Zinc warmed with sodium hydroxide solution. The gas is:",
      "सोडियम हाइड्रॉक्साइड घोल के साथ गर्म किया जिंक। गैस है:",
    ),
    right: w("Hydrogen", "हाइड्रोजन"),
    wrong: [
      wrong(
        w("Oxygen", "ऑक्सीजन"),
        w(
          "It pops near a flame, like hydrogen. Sodium zincate forms too.",
          "यह लौ के पास 'पॉप' करती है, हाइड्रोजन की तरह। सोडियम ज़िंकेट भी बनता है।",
        ),
      ),
    ],
  },
  sodaHcl: {
    prompt: w(
      "Sodium carbonate with dilute hydrochloric acid. The gas is:",
      "तनु हाइड्रोक्लोरिक अम्ल के साथ सोडियम कार्बोनेट। गैस है:",
    ),
    right: w("Carbon dioxide", "कार्बन डाइऑक्साइड"),
    wrong: [
      wrong(
        w("Hydrogen", "हाइड्रोजन"),
        w(
          "No metal here: a carbonate with acid gives carbon dioxide.",
          "यहाँ कोई धातु नहीं: कार्बोनेट और अम्ल कार्बन डाइऑक्साइड देते हैं।",
        ),
      ),
    ],
  },
  marbleAcid: {
    prompt: w(
      "Marble chips in dilute hydrochloric acid. The gas is:",
      "तनु हाइड्रोक्लोरिक अम्ल में संगमरमर के टुकड़े। गैस है:",
    ),
    right: w("Carbon dioxide", "कार्बन डाइऑक्साइड"),
    wrong: [
      wrong(
        w("Hydrogen", "हाइड्रोजन"),
        w("Marble is calcium carbonate, not a metal.", "संगमरमर कैल्सियम कार्बोनेट है, धातु नहीं।"),
      ),
    ],
  },
  limeWaterTest: {
    prompt: w("A gas turns lime water milky. It is:", "एक गैस चूने के पानी को दूधिया कर देती है। यह है:"),
    right: w("Carbon dioxide", "कार्बन डाइऑक्साइड"),
    wrong: [
      wrong(
        w("Hydrogen", "हाइड्रोजन"),
        w(
          "Hydrogen is tested with a flame (a pop), not lime water.",
          "हाइड्रोजन की जाँच लौ से ('पॉप') होती है, चूने के पानी से नहीं।",
        ),
      ),
    ],
  },
  popTest: {
    prompt: w(
      "A gas burns with a pop near a candle. It is:",
      "एक गैस मोमबत्ती के पास 'पॉप' के साथ जलती है। यह है:",
    ),
    right: w("Hydrogen", "हाइड्रोजन"),
    wrong: [
      wrong(
        w("Carbon dioxide", "कार्बन डाइऑक्साइड"),
        w("Carbon dioxide puts a flame out.", "कार्बन डाइऑक्साइड लौ बुझाती है।"),
      ),
    ],
  },
} satisfies Record<string, Item>;

type Key = keyof typeof ITEMS;
const KEYS = Object.keys(ITEMS) as [Key, ...Key[]];

/** Which gas does the reaction give off? */
export const acidGas = family({
  level: Level.Easy,
  tests: [Concept.AcidsWithMetals],
  params: z.object({ item: z.enum(KEYS) }).strict(),
  build: ({ item }, b) => askItem(b, ITEMS[item], seedOf(item)),
});

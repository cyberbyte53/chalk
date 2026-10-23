import { family } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Item, askItem, seedOf, w, wrong } from "../../qkit";

const ITEMS = {
  hardWater: {
    prompt: w("Which removes the permanent hardness of water?", "जल की स्थायी कठोरता कौन हटाता है?"),
    right: w("Washing soda", "धावन सोडा"),
    wrong: [
      wrong(
        w("Baking soda", "खाने का सोडा"),
        w(
          "Baking soda is for cooking and antacids; washing soda softens water.",
          "खाने का सोडा पकाने और प्रतिअम्ल के लिए है; धावन सोडा पानी मृदु करता है।",
        ),
      ),
    ],
  },
  germs: {
    prompt: w("Which makes drinking water free from germs?", "पीने के पानी को कीटाणु-मुक्त कौन करता है?"),
    right: w("Bleaching powder", "विरंजक चूर्ण"),
    wrong: [
      wrong(
        w("Washing soda", "धावन सोडा"),
        w("Bleaching powder (from chlorine) kills germs.", "विरंजक चूर्ण (क्लोरीन से) कीटाणु मारता है।"),
      ),
    ],
  },
  cake: {
    prompt: w("Which makes a cake rise?", "केक को कौन फुलाता है?"),
    right: w(
      "Baking powder (baking soda + tartaric acid)",
      "बेकिंग पाउडर (खाने का सोडा + टार्टरिक अम्ल)",
    ),
    wrong: [
      wrong(
        w("Bleaching powder", "विरंजक चूर्ण"),
        w(
          "Bleaching powder bleaches. The rise is carbon dioxide from baking powder.",
          "विरंजक चूर्ण विरंजन करता है। फुलाव बेकिंग पाउडर की कार्बन डाइऑक्साइड से है।",
        ),
      ),
    ],
  },
  extinguisher: {
    prompt: w("A soda-acid fire extinguisher contains:", "सोडा-अम्ल अग्निशामक में होता है:"),
    right: w("Sodium hydrogencarbonate and an acid", "सोडियम हाइड्रोजनकार्बोनेट और एक अम्ल"),
    wrong: [
      wrong(
        w("Washing soda and water", "धावन सोडा और पानी"),
        w(
          "It needs an acid to free carbon dioxide from baking soda.",
          "खाने के सोडे से कार्बन डाइऑक्साइड निकालने को अम्ल चाहिए।",
        ),
      ),
    ],
  },
  chlorAlkali: {
    prompt: w("Electricity through brine gives:", "लवण-जल में बिजली गुज़ारने पर मिलते हैं:"),
    right: w("Sodium hydroxide, chlorine and hydrogen", "सोडियम हाइड्रॉक्साइड, क्लोरीन और हाइड्रोजन"),
    wrong: [
      wrong(
        w("Baking soda and ammonia", "खाने का सोडा और अमोनिया"),
        w(
          "That's how baking soda is made. Brine + electricity is the chlor-alkali process.",
          "वह खाने का सोडा बनाने का तरीका है। लवण-जल + बिजली क्लोर-क्षार प्रक्रिया है।",
        ),
      ),
    ],
  },
  anode: {
    prompt: w(
      "In the chlor-alkali process, which gas forms at the anode?",
      "क्लोर-क्षार प्रक्रिया में ऐनोड पर कौन-सी गैस बनती है?",
    ),
    right: w("Chlorine", "क्लोरीन"),
    wrong: [
      wrong(
        w("Hydrogen", "हाइड्रोजन"),
        w("Hydrogen forms at the cathode.", "हाइड्रोजन कैथोड पर बनती है।"),
      ),
    ],
  },
  bleachingMade: {
    prompt: w(
      "Bleaching powder is made by passing chlorine over:",
      "विरंजक चूर्ण बनाने के लिए क्लोरीन को किस पर गुज़ारते हैं:",
    ),
    right: w("Dry slaked lime, Ca(OH)₂", "सूखा बुझा चूना, Ca(OH)₂"),
    wrong: [
      wrong(
        w("Common salt", "साधारण नमक"),
        w(
          "Salt gave the chlorine; the chlorine then reacts with slaked lime.",
          "नमक ने क्लोरीन दी; फिर क्लोरीन बुझे चूने से अभिक्रिया करती है।",
        ),
      ),
    ],
  },
  glass: {
    prompt: w(
      "Which is used in the glass, soap and paper industries?",
      "काँच, साबुन और काग़ज़ उद्योगों में कौन इस्तेमाल होता है?",
    ),
    right: w("Washing soda", "धावन सोडा"),
    wrong: [
      wrong(
        w("Plaster of Paris", "प्लास्टर ऑफ़ पेरिस"),
        w(
          "Plaster of Paris is for casts and decorations.",
          "प्लास्टर ऑफ़ पेरिस पट्टियों और सजावट के लिए है।",
        ),
      ),
    ],
  },
} satisfies Record<string, Item>;

type Key = keyof typeof ITEMS;
const KEYS = Object.keys(ITEMS) as [Key, ...Key[]];

/** Which chemical from common salt does the job? */
export const saltChemicalUse = family({
  level: Level.Easy,
  tests: [Concept.ChemicalsFromCommonSalt],
  params: z.object({ item: z.enum(KEYS) }).strict(),
  build: ({ item }, b) => askItem(b, ITEMS[item], seedOf(item)),
});

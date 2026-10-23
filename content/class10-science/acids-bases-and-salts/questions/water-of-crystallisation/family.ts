import { family } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Item, askItem, seedOf, w, wrong } from "../../qkit";

const ITEMS = {
  heatBlue: {
    prompt: w(
      "Blue copper sulphate crystals are heated. They turn:",
      "नीले कॉपर सल्फ़ेट क्रिस्टल गर्म किए जाते हैं। वे हो जाते हैं:",
    ),
    right: w("White, and water droplets appear", "सफ़ेद, और पानी की बूँदें दिखती हैं"),
    wrong: [
      wrong(
        w("Black", "काले"),
        w(
          "They lose their water of crystallisation and turn white.",
          "वे अपना क्रिस्टलन का जल खोकर सफ़ेद हो जाते हैं।",
        ),
      ),
    ],
  },
  rewet: {
    prompt: w(
      "A few drops of water are added to the white copper sulphate. It turns:",
      "सफ़ेद कॉपर सल्फ़ेट में पानी की कुछ बूँदें डाली जाती हैं। यह हो जाता है:",
    ),
    right: w("Blue again", "फिर से नीला"),
    wrong: [
      wrong(
        w("Green", "हरा"),
        w(
          "It takes its water back and becomes blue CuSO₄·5H₂O.",
          "यह अपना पानी वापस लेकर नीला CuSO₄·5H₂O बन जाता है।",
        ),
      ),
    ],
  },
  count: {
    prompt: w(
      "How many water molecules are in one formula unit of copper sulphate crystals?",
      "कॉपर सल्फ़ेट क्रिस्टल की एक सूत्र इकाई में जल के कितने अणु हैं?",
    ),
    right: w("5", "5"),
    wrong: [
      wrong(w("10", "10"), w("10 is washing soda.", "10 धावन सोडे में है।")),
      wrong(w("2", "2"), w("2 is gypsum.", "2 जिप्सम में है।")),
    ],
  },
  wet: {
    prompt: w("Is washing soda, Na₂CO₃·10H₂O, wet?", "क्या धावन सोडा, Na₂CO₃·10H₂O, गीला है?"),
    right: w("No: the water is locked inside the crystal", "नहीं: पानी क्रिस्टल के अंदर बंद है"),
    wrong: [
      wrong(
        w("Yes: it contains water", "हाँ: इसमें पानी है"),
        w(
          "Water of crystallisation is part of the crystal, not wetness.",
          "क्रिस्टलन का जल क्रिस्टल का हिस्सा है, गीलापन नहीं।",
        ),
      ),
    ],
  },
  pop373: {
    prompt: w("Gypsum heated at 373 K gives:", "जिप्सम को 373 K पर गर्म करने से मिलता है:"),
    right: w("Plaster of Paris", "प्लास्टर ऑफ़ पेरिस"),
    wrong: [
      wrong(
        w("Bleaching powder", "विरंजक चूर्ण"),
        w(
          "Bleaching powder comes from chlorine and slaked lime.",
          "विरंजक चूर्ण क्लोरीन और बुझे चूने से बनता है।",
        ),
      ),
    ],
  },
  half: {
    prompt: w(
      "Why is plaster of Paris written with ½H₂O?",
      "प्लास्टर ऑफ़ पेरिस को ½H₂O के साथ क्यों लिखते हैं?",
    ),
    right: w(
      "Two formula units of CaSO₄ share one water molecule",
      "CaSO₄ की दो सूत्र इकाइयाँ एक जल अणु साझा करती हैं",
    ),
    wrong: [
      wrong(
        w("Half of each water molecule evaporates", "हर जल अणु का आधा भाप बन जाता है"),
        w(
          "Molecules can't be halved; one is shared between two.",
          "अणु आधे नहीं होते; एक दो के बीच साझा है।",
        ),
      ),
    ],
  },
  store: {
    prompt: w(
      "Plaster of Paris is stored in a moisture-proof container because:",
      "प्लास्टर ऑफ़ पेरिस को नमी-रोधी डिब्बे में रखते हैं क्योंकि:",
    ),
    right: w("Moisture turns it back into hard gypsum", "नमी इसे फिर से कठोर जिप्सम बना देती है"),
    wrong: [
      wrong(
        w("It catches fire in damp air", "यह नम हवा में आग पकड़ता है"),
        w("It doesn't burn; water simply makes it set.", "यह जलता नहीं; पानी बस इसे जमा देता है।"),
      ),
    ],
  },
} satisfies Record<string, Item>;

type Key = keyof typeof ITEMS;
const KEYS = Object.keys(ITEMS) as [Key, ...Key[]];

/** Water of crystallisation and plaster of Paris. */
export const waterOfCrystallisation = family({
  level: Level.Medium,
  tests: [Concept.WaterOfCrystallisation],
  params: z.object({ item: z.enum(KEYS) }).strict(),
  build: ({ item }, b) => askItem(b, ITEMS[item], seedOf(item)),
});

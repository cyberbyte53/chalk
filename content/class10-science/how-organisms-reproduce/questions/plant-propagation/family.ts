import { family } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Choice, askChoice, seedOf } from "../../kit";

const CASES = ["potatoBud", "moneyPlant", "seedless", "earlier", "callus", "spores"] as const;
type Case = (typeof CASES)[number];

const choices: Record<Case, Choice> = {
  potatoBud: {
    prompt: {
      en: "Potato pieces are placed on wet cotton. Which ones give fresh shoots and roots?",
      hi: "आलू के टुकड़े गीली रुई पर रखे जाते हैं। कौन-से नए अंकुर और जड़ें देते हैं?",
    },
    right: { en: "Pieces with a bud in a notch", hi: "जिन टुकड़ों के गड्ढे में कली है" },
    wrong: [
      { en: "Pieces without a bud, cut very thin", hi: "बिना कलिका वाले, बहुत पतले कटे टुकड़े" },
      { en: "Only the peeled pieces", hi: "केवल छिले हुए टुकड़े" },
    ],
    why: {
      en: "New shoots and roots grow from the buds (eyes) in the notches of the potato.",
      hi: "नए अंकुर और जड़ें आलू के गड्ढों की कलियों (आँखों) से उगते हैं।",
    },
  },
  moneyPlant: {
    prompt: {
      en: "Which money-plant pieces put in water grow fresh leaves?",
      hi: "पानी में रखे मनी प्लांट के कौन-से टुकड़े नई पत्तियाँ देते हैं?",
    },
    right: { en: "Pieces with at least one leaf", hi: "कम से कम एक पत्ती वाले टुकड़े" },
    wrong: [
      { en: "Pieces cut between two leaves", hi: "दो पत्तियों के बीच से कटे टुकड़े" },
      { en: "Any piece, equally", hi: "कोई भी टुकड़ा, बराबर" },
    ],
    why: {
      en: "New growth comes from where a leaf joins the stem, so the piece must include a leaf.",
      hi: "नई बढ़त वहाँ से होती है जहाँ पत्ती तने से जुड़ती है, इसलिए टुकड़े में पत्ती होनी चाहिए।",
    },
  },
  seedless: {
    prompt: {
      en: "Which of these must be grown by vegetative propagation because it has lost the capacity to make seeds?",
      hi: "इनमें से किसे कायिक प्रवर्धन से ही उगाना पड़ता है क्योंकि वह बीज बनाने की क्षमता खो चुका है?",
    },
    right: { en: "Banana", hi: "केला" },
    wrong: [
      { en: "Pea", hi: "मटर" },
      { en: "Mustard", hi: "सरसों" },
      { en: "Bengal gram", hi: "चना" },
    ],
    why: {
      en: "Banana, orange, rose and jasmine have lost the capacity to produce seeds, so they are propagated vegetatively.",
      hi: "केला, संतरा, गुलाब और चमेली बीज बनाने की क्षमता खो चुके हैं, इसलिए इनका कायिक प्रवर्धन होता है।",
    },
  },
  earlier: {
    prompt: {
      en: "Compared with plants grown from seeds, plants raised by vegetative propagation:",
      hi: "बीज से उगे पौधों की तुलना में कायिक प्रवर्धन से उगे पौधे:",
    },
    right: { en: "bear flowers and fruits earlier", hi: "जल्दी फूल और फल देते हैं" },
    wrong: [
      { en: "never flower", hi: "कभी फूल नहीं देते" },
      { en: "are very different from the parent", hi: "जनक से बहुत अलग होते हैं" },
    ],
    why: {
      en: "Vegetative plants flower and fruit earlier, and are genetically similar enough to the parent to have all its characteristics.",
      hi: "कायिक पौधे जल्दी फूल और फल देते हैं, और आनुवंशिक रूप से जनक जैसे होते हैं।",
    },
  },
  callus: {
    prompt: {
      en: "In tissue culture, the small group of rapidly dividing cells formed in the medium is the:",
      hi: "ऊतक संवर्धन में माध्यम में तेज़ी से बँटती कोशिकाओं का छोटा समूह कहलाता है:",
    },
    right: { en: "Callus", hi: "कैलस" },
    wrong: [
      { en: "Sporangium", hi: "बीजाणुधानी" },
      { en: "Zygote", hi: "युग्मनज" },
      { en: "Bud", hi: "कली" },
    ],
    why: {
      en: "Cells from the growing tip divide rapidly to form a callus, which with growth hormones forms plantlets.",
      hi: "बढ़ती नोक की कोशिकाएँ तेज़ी से बँटकर कैलस बनाती हैं, जो वृद्धि हॉर्मोन के साथ पादपक बनाता है।",
    },
  },
  spores: {
    prompt: {
      en: "How does Rhizopus benefit from reproducing by spores?",
      hi: "राइज़ोपस को बीजाणुओं से जनन करने का क्या लाभ है?",
    },
    right: {
      en: "Thick-walled spores last until they find moisture",
      hi: "मोटी भित्ति वाले बीजाणु नमी मिलने तक टिके रहते हैं",
    },
    wrong: [
      {
        en: "Spores can grow anywhere, even without any water at all",
        hi: "बीजाणु कहीं भी उग सकते हैं, बिना किसी पानी के भी",
      },
      { en: "Spores combine DNA from two parent moulds", hi: "बीजाणु दो जनक कवकों का DNA मिलाते हैं" },
    ],
    why: {
      en: "Spores are covered by thick walls that protect them until they come into contact with another moist surface and can begin to grow.",
      hi: "बीजाणु मोटी दीवारों से ढके होते हैं जो उन्हें तब तक बचाती हैं जब तक वे किसी नम सतह के संपर्क में आकर उगना शुरू न करें।",
    },
  },
};

/** NCERT 8.2.5–8.2.6 and the tissue-culture box: vegetative propagation methods and advantages, spores, and the potato and money-plant activities. */
export const plantPropagation = family({
  level: Level.Easy,
  tests: [Concept.PlantsFromParts],
  params: z.object({ case: z.enum(CASES) }).strict(),
  build: ({ case: c }, b) => askChoice(b, choices[c], seedOf(CASES, c)),
});

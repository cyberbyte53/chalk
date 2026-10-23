import { family } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Choice, askChoice, seedOf } from "../../kit";

const CASES = ["hotspot", "stable", "why", "authority", "monoculture"] as const;
type Case = (typeof CASES)[number];

const choices: Record<Case, Choice> = {
  hotspot: {
    prompt: {
      en: "Forests are called 'biodiversity hotspots' because…",
      hi: "वनों को 'जैव-विविधता के हॉटस्पॉट' क्यों कहते हैं?",
    },
    right: { en: "They hold a great range of life forms", hi: "उनमें जीवन के बहुत तरह के रूप होते हैं" },
    wrong: [
      { en: "They are the hottest places on the earth", hi: "वे धरती की सबसे गर्म जगहें हैं" },
      { en: "Only a single species can live in them", hi: "उनमें केवल एक ही प्रजाति रह सकती है" },
    ],
    why: {
      en: "Biodiversity is the number and range of species; forests have a great many.",
      hi: "जैव-विविधता प्रजातियों की संख्या और विविधता है; वनों में बहुत सारी होती हैं।",
    },
  },
  stable: {
    prompt: {
      en: "When an ecosystem loses biodiversity, it becomes…",
      hi: "जब किसी पारितंत्र की जैव-विविधता घटती है, तो वह…",
    },
    right: { en: "Less stable", hi: "कम स्थिर होता है" },
    wrong: [
      { en: "More stable", hi: "ज़्यादा स्थिर होता है" },
      { en: "Far more varied", hi: "कहीं ज़्यादा विविध होता है" },
    ],
    why: {
      en: "Loss of diversity may lead to a loss of ecological stability.",
      hi: "विविधता घटने से पारिस्थितिक स्थिरता घट सकती है।",
    },
  },
  why: {
    prompt: {
      en: "Exercise 5: why should we conserve forests and wildlife?",
      hi: "अभ्यास 5: हमें वनों और वन्यजीवों का संरक्षण क्यों करना चाहिए?",
    },
    right: {
      en: "To keep biodiversity and meet people's needs",
      hi: "जैव-विविधता बचाने और लोगों की ज़रूरतें पूरी करने के लिए",
    },
    wrong: [
      {
        en: "So industries can always get wood at cheaper rates",
        hi: "ताकि उद्योगों को हमेशा सस्ती दर पर लकड़ी मिले",
      },
      {
        en: "Because wild animals are only useful in zoos",
        hi: "क्योंकि जंगली जानवर केवल चिड़ियाघर में काम के हैं",
      },
    ],
    why: {
      en: "Forests hold biodiversity and keep ecosystems stable, and many people live from them.",
      hi: "वन जैव-विविधता सँभालते हैं, पारितंत्र को स्थिर रखते हैं, और बहुत से लोग उन पर जीते हैं।",
    },
  },
  authority: {
    prompt: {
      en: "Exercise 3: who should have the main say over forest produce?",
      hi: "अभ्यास 3: वन उपज पर मुख्य अधिकार किसका होना चाहिए?",
    },
    right: {
      en: "Local people, along with the Forest Department",
      hi: "स्थानीय लोग, वन विभाग के साथ मिलकर",
    },
    wrong: [
      {
        en: "Only the industries, as they buy most of the produce",
        hi: "केवल उद्योग, क्योंकि वे ज़्यादातर उपज ख़रीदते हैं",
      },
      { en: "Only visitors from the city who love wildlife", hi: "केवल शहर से आने वाले वन्यजीव-प्रेमी" },
    ],
    why: {
      en: "Those who live from the forest have a stake in keeping it; they should decide with the department.",
      hi: "जो वन पर जीते हैं, उसे बचाने में उनका हित है; उन्हें विभाग के साथ फ़ैसला करना चाहिए।",
    },
  },
  monoculture: {
    prompt: {
      en: "Replacing a mixed forest with only teak or eucalyptus…",
      hi: "मिश्रित वन की जगह केवल सागौन या यूकेलिप्टस लगाने से…",
    },
    right: { en: "Destroys its biodiversity", hi: "उसकी जैव-विविधता नष्ट होती है" },
    wrong: [
      { en: "Doubles the number of species", hi: "प्रजातियों की संख्या दोगुनी होती है" },
      { en: "Feeds local people better", hi: "स्थानीय लोगों का पेट बेहतर भरता है" },
    ],
    why: {
      en: "Monocultures wipe out the variety of life, and local people lose what they used.",
      hi: "एकल फ़सल वन जीवन की विविधता मिटा देते हैं, और स्थानीय लोग अपनी ज़रूरत की चीज़ें खो देते हैं।",
    },
  },
};

/** NCERT 16.2 and Exercises 3 and 5: why forests matter, and who decides. */
export const whyConserveForests = family({
  level: Level.Medium,
  tests: [Concept.ForestsAndStakeholders],
  params: z.object({ case: z.enum(CASES) }).strict(),
  build: ({ case: c }, b) => askChoice(b, choices[c], seedOf(CASES, c)),
});

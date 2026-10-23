import { family } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Choice, askChoice, seedOf } from "../../kit";

const CASES = ["bag", "fan", "walk", "compost"] as const;
type Case = (typeof CASES)[number];

const choices: Record<Case, Choice> = {
  bag: {
    prompt: { en: "Which is environment-friendly?", hi: "कौन-सी आदत पर्यावरण-अनुकूल है?" },
    right: { en: "Carrying a cloth bag to shop", hi: "ख़रीदारी पर कपड़े का थैला ले जाना" },
    wrong: [
      { en: "Taking a new plastic bag each time", hi: "हर बार नई प्लास्टिक थैली लेना" },
      { en: "Burning dry leaves in the lane", hi: "गली में सूखी पत्तियाँ जलाना" },
    ],
    why: {
      en: "A cloth bag is reused many times and cuts plastic waste.",
      hi: "कपड़े का थैला कई बार इस्तेमाल होता है और प्लास्टिक कचरा घटाता है।",
    },
  },
  fan: {
    prompt: { en: "Which saves energy at home?", hi: "घर पर कौन-सी आदत ऊर्जा बचाती है?" },
    right: { en: "Switching off unused fans", hi: "बेकार चलते पंखे बंद करना" },
    wrong: [
      { en: "Leaving the TV on standby", hi: "टीवी को स्टैंडबाय पर छोड़ना" },
      { en: "Keeping the fridge door open", hi: "फ़्रिज का दरवाज़ा खुला रखना" },
    ],
    why: {
      en: "Switching off unnecessary lights and fans saves energy.",
      hi: "बेकार की बत्तियाँ और पंखे बंद करने से ऊर्जा बचती है।",
    },
  },
  walk: {
    prompt: {
      en: "Which is the eco-friendly way to reach a school 1 km away?",
      hi: "1 km दूर स्कूल जाने का पर्यावरण-अनुकूल तरीक़ा कौन-सा है?",
    },
    right: { en: "Walking", hi: "पैदल" },
    wrong: [
      { en: "A car", hi: "कार से" },
      { en: "A scooter", hi: "स्कूटर से" },
    ],
    why: {
      en: "Walking uses no fuel and makes no smoke.",
      hi: "पैदल चलने में ईंधन नहीं लगता और धुआँ नहीं होता।",
    },
  },
  compost: {
    prompt: {
      en: "What should be done with kitchen peels?",
      hi: "रसोई के छिलकों का क्या करना चाहिए?",
    },
    right: { en: "Put them in a compost pit", hi: "खाद के गड्ढे में डालना" },
    wrong: [
      { en: "Burn them in the open", hi: "खुले में जलाना" },
      { en: "Mix them with plastic waste", hi: "प्लास्टिक कचरे में मिलाना" },
    ],
    why: {
      en: "Peels are biodegradable: composting returns them to the soil.",
      hi: "छिलके जैव निम्नीकरणीय हैं: खाद बनाने से वे मिट्टी में लौटते हैं।",
    },
  },
};

/** NCERT Exercise 3 and Activity 15.7: environment-friendly habits. */
export const ecoFriendlyPractice = family({
  level: Level.Easy,
  tests: [Concept.ManagingGarbage],
  params: z.object({ case: z.enum(CASES) }).strict(),
  build: ({ case: c }, b) => askChoice(b, choices[c], seedOf(CASES, c)),
});

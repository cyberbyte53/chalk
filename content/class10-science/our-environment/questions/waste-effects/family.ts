import { family } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Choice, askChoice, seedOf } from "../../kit";

const CASES = ["heap", "drain", "cow", "good"] as const;
type Case = (typeof CASES)[number];

const choices: Record<Case, Choice> = {
  heap: {
    prompt: {
      en: "A heap of biodegradable waste left in the open can…",
      hi: "खुले में छोड़ा जैव निम्नीकरणीय कचरे का ढेर…",
    },
    right: { en: "Smell and breed flies", hi: "बदबू देता, मक्खियाँ पैदा करता" },
    wrong: [
      { en: "Stay unchanged for years", hi: "सालों तक वैसा ही रहता" },
      { en: "Thin the ozone layer", hi: "ओज़ोन परत पतली करता" },
    ],
    why: {
      en: "It rots: until decomposers finish, it smells and breeds flies and germs.",
      hi: "यह सड़ता है: अपघटकों के काम पूरा करने तक बदबू देता और मक्खियाँ व रोगाणु पैदा करता है।",
    },
  },
  drain: {
    prompt: { en: "Plastic bags thrown in drains can…", hi: "नालियों में फेंकी प्लास्टिक थैलियाँ…" },
    right: { en: "Block them", hi: "उन्हें बंद कर देती हैं" },
    wrong: [
      { en: "Rot in a week", hi: "हफ़्ते में सड़ जाती हैं" },
      { en: "Feed the plants", hi: "पौधों को भोजन देती हैं" },
    ],
    why: {
      en: "They don't break down, so they pile up and clog drains.",
      hi: "ये टूटती नहीं, इसलिए जमा होकर नालियाँ बंद करती हैं।",
    },
  },
  cow: {
    prompt: {
      en: "A cow eating plastic from a heap can be harmed because…",
      hi: "ढेर से प्लास्टिक खाने वाली गाय को नुकसान हो सकता है क्योंकि…",
    },
    right: { en: "Plastic can't be digested", hi: "प्लास्टिक पचता नहीं" },
    wrong: [
      { en: "Plastic is very salty", hi: "प्लास्टिक बहुत नमकीन है" },
      { en: "Plastic gives too much energy", hi: "प्लास्टिक बहुत ज़्यादा ऊर्जा देता है" },
    ],
    why: {
      en: "No enzyme breaks plastic down, so it stays in the animal's stomach.",
      hi: "कोई एंज़ाइम प्लास्टिक को नहीं तोड़ता, इसलिए यह जानवर के पेट में रहता है।",
    },
  },
  good: {
    prompt: { en: "Composted biodegradable waste…", hi: "खाद बनाया गया जैव निम्नीकरणीय कचरा…" },
    right: { en: "Returns nutrients to soil", hi: "मिट्टी को पोषक लौटाता है" },
    wrong: [
      { en: "Pollutes the groundwater", hi: "भूजल प्रदूषित करता है" },
      { en: "Stays in soil for years", hi: "सालों मिट्टी में रहता है" },
    ],
    why: {
      en: "Broken down, its simple substances go back into the soil for plants.",
      hi: "टूटकर इसके सरल पदार्थ पौधों के लिए मिट्टी में लौटते हैं।",
    },
  },
};

/** NCERT 15.2.2 in-text Q2–Q3 and Exercise 7: how each kind of waste affects the environment. */
export const wasteEffects = family({
  level: Level.Medium,
  tests: [Concept.BiodegradableOrNot, Concept.ManagingGarbage],
  params: z.object({ case: z.enum(CASES) }).strict(),
  build: ({ case: c }, b) => askChoice(b, choices[c], seedOf(CASES, c)),
});

import { family } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Choice, askChoice, seedOf } from "../../kit";

const CASES = ["gap", "coliform", "home", "school", "pressure"] as const;
type Case = (typeof CASES)[number];

const choices: Record<Case, Choice> = {
  gap: {
    prompt: { en: "The Ganga Action Plan began in…", hi: "गंगा कार्य योजना शुरू हुई…" },
    right: { en: "1985", hi: "1985 में" },
    wrong: [
      { en: "1965", hi: "1965 में" },
      { en: "2005", hi: "2005 में" },
    ],
    why: {
      en: "It came about in 1985, because the Ganga's water was very poor.",
      hi: "यह 1985 में शुरू हुई, क्योंकि गंगा का पानी बहुत ख़राब था।",
    },
  },
  coliform: {
    prompt: {
      en: "Coliform bacteria in river water are a sign of…",
      hi: "नदी के पानी में कोलिफ़ॉर्म जीवाणु किसका संकेत हैं?",
    },
    right: { en: "Contamination by disease-causing microbes", hi: "रोग फैलाने वाले सूक्ष्मजीवों से संदूषण" },
    wrong: [
      {
        en: "Water that is far too acidic to drink safely",
        hi: "ऐसा पानी जो सुरक्षित पीने के लिए बहुत अम्लीय है",
      },
      {
        en: "Too many fish for the river's oxygen",
        hi: "नदी की ऑक्सीजन के हिसाब से बहुत ज़्यादा मछलियाँ",
      },
    ],
    why: {
      en: "Coliforms live in human intestines; in water they show contamination by disease-causing microorganisms.",
      hi: "कोलिफ़ॉर्म मानव आँतों में रहते हैं; पानी में ये रोग फैलाने वाले सूक्ष्मजीवों से संदूषण दिखाते हैं।",
    },
  },
  home: {
    prompt: {
      en: "Exercise 1: which change makes a home more environment-friendly?",
      hi: "अभ्यास 1: कौन-सा बदलाव घर को ज़्यादा पर्यावरण-हितैषी बनाता है?",
    },
    right: {
      en: "Fixing leaking taps and switching off idle fans",
      hi: "टपकते नल ठीक कराना और बेकार पंखे बंद करना",
    },
    wrong: [
      {
        en: "Running the AC with the windows open to air out",
        hi: "कमरे में हवा के लिए खिड़की खोलकर AC चलाना",
      },
      { en: "Buying new bags each time you go shopping", hi: "हर बार ख़रीदारी पर नई थैलियाँ लेना" },
    ],
    why: {
      en: "Saving water and electricity at home reduces what we take from nature.",
      hi: "घर में पानी और बिजली बचाने से प्रकृति से कम लेना पड़ता है।",
    },
  },
  school: {
    prompt: {
      en: "Exercise 2: which change makes a school more environment-friendly?",
      hi: "अभ्यास 2: कौन-सा बदलाव स्कूल को ज़्यादा पर्यावरण-हितैषी बनाता है?",
    },
    right: {
      en: "Using both sides of paper and composting leaves",
      hi: "कागज़ के दोनों तरफ़ लिखना और पत्तियों की खाद बनाना",
    },
    wrong: [
      {
        en: "Printing every notice on fresh, single-sided paper",
        hi: "हर सूचना नए, एक तरफ़ छपे कागज़ पर छापना",
      },
      {
        en: "Burning dry leaves in the playground each week",
        hi: "हर हफ़्ते मैदान में सूखी पत्तियाँ जलाना",
      },
    ],
    why: {
      en: "Less paper used and leaves turned to compost: fewer resources and less waste.",
      hi: "कम कागज़ और पत्तियों की खाद: कम संसाधन, कम कचरा।",
    },
  },
  pressure: {
    prompt: {
      en: "Exercise 6(b): which habit increases the pressure on natural resources?",
      hi: "अभ्यास 6(b): कौन-सी आदत प्राकृतिक संसाधनों पर दबाव बढ़ाती है?",
    },
    right: {
      en: "Taking a new plastic bag with every purchase",
      hi: "हर ख़रीद पर नई प्लास्टिक की थैली लेना",
    },
    wrong: [
      {
        en: "Walking to school instead of being driven there",
        hi: "गाड़ी से जाने के बजाय पैदल स्कूल जाना",
      },
      {
        en: "Mending a torn school bag rather than buying one",
        hi: "नया ख़रीदने के बजाय फटा बस्ता सिलवाना",
      },
    ],
    why: {
      en: "Every new bag uses more material and adds to garbage.",
      hi: "हर नई थैली ज़्यादा पदार्थ ख़र्च करती है और कचरा बढ़ाती है।",
    },
  },
};

/** NCERT 16.1 (the Ganga Action Plan) and Exercises 1, 2 and 6. */
export const riverAndHabits = family({
  level: Level.Medium,
  tests: [Concept.OneEarthOneFamily],
  params: z.object({ case: z.enum(CASES) }).strict(),
  build: ({ case: c }, b) => askChoice(b, choices[c], seedOf(CASES, c)),
});

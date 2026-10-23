import { family } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Choice, askChoice, seedOf } from "../../kit";

const CASES = ["travel", "light", "stairs", "cold", "reduce", "euro"] as const;
type Case = (typeof CASES)[number];

const choices: Record<Case, Choice> = {
  travel: {
    prompt: {
      en: "Exercise 4(c): which way to school uses the least petrol?",
      hi: "अभ्यास 4(c): स्कूल जाने का कौन-सा तरीक़ा सबसे कम पेट्रोल लेता है?",
    },
    right: { en: "Cycling or walking", hi: "साइकिल या पैदल" },
    wrong: [
      { en: "Being dropped by car", hi: "कार से छोड़ा जाना" },
      { en: "A motorbike ride", hi: "मोटरसाइकिल की सवारी" },
    ],
    why: {
      en: "Walking and cycling burn no fuel at all.",
      hi: "पैदल और साइकिल में कोई ईंधन नहीं जलता।",
    },
  },
  light: {
    prompt: {
      en: "Which gives the same light for the least electricity?",
      hi: "कौन-सा सबसे कम बिजली में उतनी ही रोशनी देता है?",
    },
    right: { en: "An LED bulb", hi: "LED बल्ब" },
    wrong: [
      { en: "A tube light", hi: "ट्यूब लाइट" },
      { en: "An old filament bulb", hi: "पुराना फ़िलामेंट बल्ब" },
    ],
    why: {
      en: "LEDs use the least electricity, so less coal is burnt at the power station.",
      hi: "LED सबसे कम बिजली लेते हैं, इसलिए बिजलीघर में कम कोयला जलता है।",
    },
  },
  stairs: {
    prompt: {
      en: "To go up two floors, which saves the most energy?",
      hi: "दो मंज़िल ऊपर जाने में कौन-सा सबसे ज़्यादा ऊर्जा बचाता है?",
    },
    right: { en: "Taking the stairs", hi: "सीढ़ियाँ चढ़ना" },
    wrong: [
      { en: "Taking the lift", hi: "लिफ़्ट लेना" },
      { en: "Taking the escalator", hi: "एस्केलेटर लेना" },
    ],
    why: {
      en: "The stairs use your own energy, not electricity.",
      hi: "सीढ़ियों में तुम्हारी अपनी ऊर्जा लगती है, बिजली नहीं।",
    },
  },
  cold: {
    prompt: {
      en: "On a cold evening, which saves the most energy?",
      hi: "ठंडी शाम को कौन-सा सबसे ज़्यादा ऊर्जा बचाता है?",
    },
    right: { en: "Wearing a sweater", hi: "स्वेटर पहनना" },
    wrong: [
      { en: "Running a heater", hi: "हीटर चलाना" },
      { en: "An electric blanket", hi: "बिजली का कंबल" },
    ],
    why: {
      en: "An extra sweater burns no fuel; a heater or sigri does.",
      hi: "एक और स्वेटर में ईंधन नहीं जलता; हीटर या सिगड़ी में जलता है।",
    },
  },
  reduce: {
    prompt: {
      en: "Exercise 5: which cuts your use of natural resources most directly?",
      hi: "अभ्यास 5: कौन-सा तुम्हारे प्राकृतिक संसाधनों के उपयोग को सबसे सीधे घटाता है?",
    },
    right: { en: "Buying less and using things longer", hi: "कम ख़रीदना और चीज़ें ज़्यादा समय चलाना" },
    wrong: [
      { en: "Recycling after buying more than you need", hi: "ज़रूरत से ज़्यादा ख़रीदकर पुनर्चक्रण करना" },
      { en: "Throwing out old things more often", hi: "पुरानी चीज़ें और जल्दी फेंकना" },
    ],
    why: {
      en: "Reducing what we use comes before recycling it.",
      hi: "इस्तेमाल घटाना पुनर्चक्रण से पहले आता है।",
    },
  },
  euro: {
    prompt: {
      en: "Activity 16.12: Euro norms for vehicles set limits on…",
      hi: "क्रियाकलाप 16.12: वाहनों के यूरो मानक किसकी सीमा तय करते हैं?",
    },
    right: { en: "What the exhaust may give out", hi: "धुएँ में क्या निकल सकता है" },
    wrong: [
      { en: "How fast the vehicle may be driven", hi: "वाहन कितनी तेज़ चलाया जा सकता है" },
      { en: "The price of petrol at the pump", hi: "पंप पर पेट्रोल का दाम" },
    ],
    why: {
      en: "They limit vehicle emissions, to reduce air pollution.",
      hi: "ये वाहनों के उत्सर्जन को सीमित करते हैं, ताकि वायु प्रदूषण घटे।",
    },
  },
};

/** NCERT 16.4, Activities 16.11 and 16.12, Exercises 4(c), 5 and 7: using less coal and petroleum. */
export const usingLessFuel = family({
  level: Level.Medium,
  tests: [Concept.CoalAndPetroleum],
  params: z.object({ case: z.enum(CASES) }).strict(),
  build: ({ case: c }, b) => askChoice(b, choices[c], seedOf(CASES, c)),
});

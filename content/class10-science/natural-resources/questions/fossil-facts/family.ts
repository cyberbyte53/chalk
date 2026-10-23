import { family } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Choice, askChoice, seedOf } from "../../kit";

const CASES = ["petroleum", "coal", "formed", "elements", "judicious"] as const;
type Case = (typeof CASES)[number];

const choices: Record<Case, Choice> = {
  petroleum: {
    prompt: {
      en: "At the present rate, known petroleum will last us about…",
      hi: "मौजूदा दर पर ज्ञात पेट्रोलियम लगभग कितने समय चलेगा?",
    },
    right: { en: "40 years", hi: "40 साल" },
    wrong: [
      { en: "4 years", hi: "4 साल" },
      { en: "200 years", hi: "200 साल" },
    ],
    why: {
      en: "NCERT estimates about forty years for petroleum.",
      hi: "NCERT पेट्रोलियम के लिए लगभग चालीस साल का अनुमान देता है।",
    },
  },
  coal: {
    prompt: {
      en: "At the present rate, known coal will last us about…",
      hi: "मौजूदा दर पर ज्ञात कोयला लगभग कितने समय चलेगा?",
    },
    right: { en: "200 years", hi: "200 साल" },
    wrong: [
      { en: "20 years", hi: "20 साल" },
      { en: "2,000 years", hi: "2,000 साल" },
    ],
    why: {
      en: "NCERT estimates about two hundred years for coal.",
      hi: "NCERT कोयले के लिए लगभग दो सौ साल का अनुमान देता है।",
    },
  },
  formed: {
    prompt: { en: "Coal and petroleum were formed from…", hi: "कोयला और पेट्रोलियम किससे बने?" },
    right: { en: "Biomass, millions of years ago", hi: "जैव-भार से, लाखों साल पहले" },
    wrong: [
      { en: "Volcanic rock, a few years ago", hi: "ज्वालामुखी चट्टान से, कुछ साल पहले" },
      { en: "Sea salt, over many centuries", hi: "समुद्री नमक से, कई सदियों में" },
    ],
    why: {
      en: "They formed from the degradation of biomass millions of years ago, so they will run out.",
      hi: "वे लाखों साल पहले जैव-भार के अपघटन से बने, इसलिए ख़त्म होंगे।",
    },
  },
  elements: {
    prompt: {
      en: "Besides carbon, coal and petroleum contain…",
      hi: "कार्बन के अलावा कोयले और पेट्रोलियम में होते हैं…",
    },
    right: { en: "Hydrogen, nitrogen and sulphur", hi: "हाइड्रोजन, नाइट्रोजन और सल्फ़र" },
    wrong: [
      { en: "Sodium, chlorine and calcium only", hi: "केवल सोडियम, क्लोरीन और कैल्शियम" },
      { en: "Iron, copper and some aluminium", hi: "लोहा, ताँबा और थोड़ा एल्युमिनियम" },
    ],
    why: {
      en: "Coming from biomass, they also contain hydrogen, nitrogen and sulphur.",
      hi: "जैव-भार से बने होने के कारण उनमें हाइड्रोजन, नाइट्रोजन और सल्फ़र भी होते हैं।",
    },
  },
  judicious: {
    prompt: {
      en: "Why must coal and petroleum be used judiciously?",
      hi: "कोयले और पेट्रोलियम का विवेकपूर्ण उपयोग क्यों ज़रूरी है?",
    },
    right: {
      en: "They will run out, and burning them pollutes",
      hi: "वे ख़त्म होंगे, और जलाने से प्रदूषण होता है",
    },
    wrong: [
      {
        en: "They grow back every year in the forests nearby",
        hi: "वे हर साल पास के जंगलों में फिर उग आते हैं",
      },
      {
        en: "Using them makes the soil far more fertile",
        hi: "इनके उपयोग से मिट्टी कहीं ज़्यादा उपजाऊ होती है",
      },
    ],
    why: {
      en: "They will be exhausted, and their combustion pollutes our environment.",
      hi: "वे ख़त्म होंगे, और उनका दहन हमारे पर्यावरण को प्रदूषित करता है।",
    },
  },
};

/** NCERT 16.4: coal and petroleum, how long they last and what burning them gives. */
export const fossilFacts = family({
  level: Level.Medium,
  tests: [Concept.CoalAndPetroleum],
  params: z.object({ case: z.enum(CASES) }).strict(),
  build: ({ case: c }, b) => askChoice(b, choices[c], seedOf(CASES, c)),
});

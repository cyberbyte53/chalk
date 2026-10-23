import { family } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Choice, askChoice, seedOf } from "../../kit";

const CASES = ["oneWay", "lost", "steps", "most", "remove"] as const;
type Case = (typeof CASES)[number];

const choices: Record<Case, Choice> = {
  oneWay: {
    prompt: { en: "Energy that passes to the herbivores…", hi: "शाकाहारियों तक गई ऊर्जा…" },
    right: { en: "never comes back to the plants", hi: "कभी पौधों तक वापस नहीं आती" },
    wrong: [
      { en: "goes back to plants as manure", hi: "खाद बनकर पौधों तक लौटती है" },
      { en: "returns to the Sun at night", hi: "रात में सूर्य तक लौटती है" },
    ],
    why: {
      en: "Energy flow is unidirectional: it never returns to an earlier level.",
      hi: "ऊर्जा का बहाव एक-दिशी है: वह कभी पिछले स्तर पर नहीं लौटती।",
    },
  },
  lost: {
    prompt: {
      en: "Where does most of the energy eaten at a level go?",
      hi: "किसी स्तर पर खाई गई ज़्यादातर ऊर्जा कहाँ जाती है?",
    },
    right: { en: "Lost as heat and used in work", hi: "ऊष्मा में खोती और काम में लगती है" },
    wrong: [
      { en: "Stored in the body to pass on", hi: "शरीर में जमा होकर आगे जाती है" },
      { en: "Returned to the soil as minerals", hi: "खनिज बनकर मिट्टी में लौटती है" },
    ],
    why: {
      en: "A great deal is lost as heat, some goes into digestion and work; only about 10% is built into the body.",
      hi: "बड़ा भाग ऊष्मा में खोता है, कुछ पाचन और काम में; केवल लगभग 10% शरीर में बनता है।",
    },
  },
  steps: {
    prompt: {
      en: "Food chains usually have how many steps?",
      hi: "आहार श्रृंखलाओं में आमतौर पर कितने कदम होते हैं?",
    },
    right: { en: "Three or four", hi: "तीन या चार" },
    wrong: [
      { en: "Six or seven", hi: "छह या सात" },
      { en: "Ten or more", hi: "दस या ज़्यादा" },
    ],
    why: {
      en: "So little energy is left after four levels that chains are short.",
      hi: "चार स्तरों के बाद इतनी कम ऊर्जा बचती है कि श्रृंखलाएँ छोटी होती हैं।",
    },
  },
  most: {
    prompt: {
      en: "Which level of an ecosystem usually has the most individuals?",
      hi: "पारितंत्र के किस स्तर पर आमतौर पर सबसे ज़्यादा जीव होते हैं?",
    },
    right: { en: "Producers", hi: "उत्पादक" },
    wrong: [
      { en: "Herbivores", hi: "शाकाहारी" },
      { en: "Top carnivores", hi: "शीर्ष मांसाहारी" },
    ],
    why: {
      en: "There are more individuals at the lower levels, the most of all at the producers.",
      hi: "निचले स्तरों पर ज़्यादा जीव होते हैं, सबसे ज़्यादा उत्पादकों पर।",
    },
  },
  remove: {
    prompt: {
      en: "If all herbivores were removed, what would happen to the plants first?",
      hi: "अगर सारे शाकाहारी हटा दिए जाएँ, तो पहले पौधों का क्या होगा?",
    },
    right: { en: "They would increase", hi: "वे बढ़ेंगे" },
    wrong: [
      { en: "They would die out", hi: "वे मर जाएँगे" },
      { en: "Nothing would change", hi: "कुछ नहीं बदलेगा" },
    ],
    why: {
      en: "With nothing eating them, the plants grow unchecked, while the carnivores above starve.",
      hi: "कोई उन्हें न खाए तो पौधे बेरोकटोक बढ़ते हैं, जबकि ऊपर के मांसाहारी भूखे रहते हैं।",
    },
  },
};

/** NCERT 15.1.1 and Fig 15.4: one-way flow, loss at each level, short chains, numbers at each level. */
export const energyFlowFacts = family({
  level: Level.Medium,
  tests: [Concept.EnergyFlow, Concept.FoodChainsAndWebs],
  params: z.object({ case: z.enum(CASES) }).strict(),
  build: ({ case: c }, b) => askChoice(b, choices[c], seedOf(CASES, c)),
});

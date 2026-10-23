import { family } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Choice, askChoice, seedOf } from "../../kit";

const CASES = ["locals", "dept", "industry", "enthusiasts", "count"] as const;
type Case = (typeof CASES)[number];

const choices: Record<Case, Choice> = {
  locals: {
    prompt: {
      en: "Who depends on the forest for firewood, fodder and small timber?",
      hi: "जलावन, चारे और छोटी लकड़ी के लिए वन पर कौन निर्भर है?",
    },
    right: { en: "People who live in and around it", hi: "उसमें और उसके आसपास रहने वाले लोग" },
    wrong: [
      { en: "The Forest Department's officers", hi: "वन विभाग के अधिकारी" },
      { en: "Nature lovers from the cities", hi: "शहरों के प्रकृति-प्रेमी" },
    ],
    why: {
      en: "Local people have always used the forest for their daily needs.",
      hi: "स्थानीय लोग हमेशा से रोज़ की ज़रूरतों के लिए वन का उपयोग करते आए हैं।",
    },
  },
  dept: {
    prompt: {
      en: "Which stakeholder owns the land and controls the forest's resources?",
      hi: "कौन-सा दावेदार ज़मीन का मालिक है और वन के संसाधनों को नियंत्रित करता है?",
    },
    right: { en: "The Forest Department", hi: "वन विभाग" },
    wrong: [
      { en: "The paper-mill owners", hi: "पेपर मिल के मालिक" },
      { en: "The nature enthusiasts", hi: "प्रकृति के प्रेमी" },
    ],
    why: {
      en: "The Forest Department of the government owns the land and controls the resources.",
      hi: "सरकार का वन विभाग ज़मीन का मालिक है और संसाधनों को नियंत्रित करता है।",
    },
  },
  industry: {
    prompt: {
      en: "Who sees the forest mainly as raw material, such as timber for paper?",
      hi: "कौन वन को मुख्य रूप से कच्चा माल, जैसे कागज़ के लिए लकड़ी, मानता है?",
    },
    right: { en: "Industries", hi: "उद्योग" },
    wrong: [
      { en: "Wildlife lovers", hi: "वन्यजीव-प्रेमी" },
      { en: "Villagers", hi: "गाँव वाले" },
    ],
    why: {
      en: "Industries treat the forest merely as a source of raw material.",
      hi: "उद्योग वन को केवल कच्चे माल का स्रोत मानते हैं।",
    },
  },
  enthusiasts: {
    prompt: {
      en: "Who want to conserve nature in its pristine form?",
      hi: "कौन प्रकृति को उसके मूल रूप में बचाना चाहते हैं?",
    },
    right: { en: "Nature and wildlife enthusiasts", hi: "प्रकृति और वन्यजीव प्रेमी" },
    wrong: [
      { en: "Industries that need cheap wood", hi: "सस्ती लकड़ी चाहने वाले उद्योग" },
      { en: "Contractors who fell the trees", hi: "पेड़ काटने वाले ठेकेदार" },
    ],
    why: {
      en: "Enthusiasts want nature kept as it is.",
      hi: "प्रेमी प्रकृति को जैसी है वैसी रखना चाहते हैं।",
    },
  },
  count: {
    prompt: {
      en: "How many main stakeholders of a forest does NCERT name?",
      hi: "NCERT वन के कितने मुख्य दावेदार बताता है?",
    },
    right: { en: "Four", hi: "चार" },
    wrong: [
      { en: "Three", hi: "तीन" },
      { en: "Six", hi: "छह" },
    ],
    why: {
      en: "Local people, the Forest Department, industries and nature enthusiasts: four.",
      hi: "स्थानीय लोग, वन विभाग, उद्योग और प्रकृति-प्रेमी: चार।",
    },
  },
};

/** NCERT 16.2.1: the four stakeholders of a forest. */
export const whoIsTheStakeholder = family({
  level: Level.Easy,
  tests: [Concept.ForestsAndStakeholders],
  params: z.object({ case: z.enum(CASES) }).strict(),
  build: ({ case: c }, b) => askChoice(b, choices[c], seedOf(CASES, c)),
});

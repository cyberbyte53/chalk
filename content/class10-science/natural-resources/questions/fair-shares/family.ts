import { family } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Choice, askChoice, seedOf } from "../../kit";

const CASES = ["why", "against", "groves", "slag"] as const;
type Case = (typeof CASES)[number];

const choices: Record<Case, Choice> = {
  why: {
    prompt: {
      en: "Exercise 4: why should resources be distributed equitably?",
      hi: "अभ्यास 4: संसाधनों का न्यायसंगत वितरण क्यों होना चाहिए?",
    },
    right: {
      en: "So the poor, not only the rich, can meet their needs",
      hi: "ताकि केवल अमीर नहीं, ग़रीब भी अपनी ज़रूरतें पूरी करें",
    },
    wrong: [
      {
        en: "So that rich people can always get the largest share",
        hi: "ताकि अमीर लोगों को हमेशा सबसे बड़ा हिस्सा मिले",
      },
      {
        en: "So that each resource gets used up even faster",
        hi: "ताकि हर संसाधन और भी जल्दी ख़त्म हो",
      },
    ],
    why: {
      en: "Everyone, rich and poor, should benefit from the earth's resources.",
      hi: "धरती के संसाधनों का लाभ अमीर-ग़रीब सबको मिलना चाहिए।",
    },
  },
  against: {
    prompt: {
      en: "Exercise 4: which force works against equitable distribution?",
      hi: "अभ्यास 4: कौन-सी शक्ति न्यायसंगत वितरण के विरुद्ध काम करती है?",
    },
    right: {
      en: "The rich and powerful wanting more for themselves",
      hi: "अमीरों और ताक़तवरों का अपने लिए ज़्यादा चाहना",
    },
    wrong: [
      {
        en: "Villagers sharing water by agreed turns each season",
        hi: "गाँव वालों का हर मौसम तय बारी से पानी बाँटना",
      },
      {
        en: "Laws that protect the rights of local people",
        hi: "स्थानीय लोगों के अधिकार बचाने वाले क़ानून",
      },
    ],
    why: {
      en: "Those with more power and money tend to grab a bigger share.",
      hi: "ज़्यादा ताक़त और पैसे वाले बड़ा हिस्सा हथिया लेते हैं।",
    },
  },
  groves: {
    prompt: { en: "Sacred groves were an old way of…", hi: "पवित्र उपवन किसका पुराना तरीक़ा थे?" },
    right: { en: "Protecting forests through custom", hi: "परंपरा से वनों की रक्षा" },
    wrong: [
      { en: "Clearing forests for new farmland", hi: "नए खेतों के लिए जंगल साफ़ करना" },
      { en: "Selling forest wood to factories", hi: "कारख़ानों को जंगल की लकड़ी बेचना" },
    ],
    why: {
      en: "Customs and rituals around sacred groves protected nature.",
      hi: "पवित्र उपवनों से जुड़ी परंपराओं और रीतियों ने प्रकृति की रक्षा की।",
    },
  },
  slag: {
    prompt: {
      en: "Mining pollutes the environment partly because…",
      hi: "खनन से पर्यावरण प्रदूषित होता है, आंशिक रूप से क्योंकि…",
    },
    right: { en: "Large amounts of slag are discarded", hi: "बहुत सारा धातुमल फेंक दिया जाता है" },
    wrong: [
      { en: "The ore gives off light when dug up", hi: "खोदने पर अयस्क से रोशनी निकलती है" },
      { en: "All metals dissolve fast in rainwater", hi: "सब धातुएँ बारिश के पानी में जल्दी घुल जाती हैं" },
    ],
    why: {
      en: "Extracting metal leaves large amounts of slag to be thrown away.",
      hi: "धातु निकालने से बहुत सारा धातुमल बचता है जो फेंका जाता है।",
    },
  },
};

/** NCERT 16.1.1 and Exercise 4: equitable distribution. */
export const fairShares = family({
  level: Level.Medium,
  tests: [Concept.WhyManageResources],
  params: z.object({ case: z.enum(CASES) }).strict(),
  build: ({ case: c }, b) => askChoice(b, choices[c], seedOf(CASES, c)),
});

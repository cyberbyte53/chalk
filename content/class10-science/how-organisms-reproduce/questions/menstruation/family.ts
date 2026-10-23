import { family } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Choice, askChoice, seedOf } from "../../kit";

const CASES = ["why", "eggLife", "duration", "lining"] as const;
type Case = (typeof CASES)[number];

const choices: Record<Case, Choice> = {
  why: {
    prompt: { en: "Why does menstruation occur?", hi: "ऋतुस्राव क्यों होता है?" },
    right: {
      en: "The egg isn't fertilised, so the thick lining breaks down",
      hi: "अंडाणु निषेचित नहीं होता, इसलिए मोटा अस्तर टूट जाता है",
    },
    wrong: [
      { en: "An infection in the uterus causes bleeding", hi: "गर्भाशय में संक्रमण से रक्तस्राव होता है" },
      {
        en: "The ovary is damaged and bleeds a little every single month",
        hi: "अंडाशय क्षतिग्रस्त होकर हर एक महीने थोड़ा रक्त बहाता है",
      },
    ],
    why: {
      en: "The lining prepared every month to nourish an embryo isn't needed if the egg is not fertilised, so it breaks down.",
      hi: "हर महीने भ्रूण के पोषण के लिए तैयार भित्ति की, अंड निषेचित न होने पर, ज़रूरत नहीं रहती, इसलिए वह टूट जाती है।",
    },
  },
  eggLife: {
    prompt: {
      en: "If the egg is not fertilised, about how long does it live?",
      hi: "अगर अंड निषेचित नहीं होता, तो वह लगभग कितने समय जीता है?",
    },
    right: { en: "About one day", hi: "लगभग एक दिन" },
    wrong: [
      { en: "About one month", hi: "लगभग एक महीना" },
      { en: "About nine months", hi: "लगभग नौ महीने" },
    ],
    why: {
      en: "An unfertilised egg lives for about one day.",
      hi: "निषेचित न हुआ अंड लगभग एक दिन जीता है।",
    },
  },
  duration: {
    prompt: {
      en: "Menstruation usually lasts about:",
      hi: "ऋतुस्राव आमतौर पर लगभग कितने दिन चलता है:",
    },
    right: { en: "two to eight days", hi: "दो से आठ दिन" },
    wrong: [
      { en: "one to two hours", hi: "एक से दो घंटे" },
      { en: "the whole month", hi: "पूरा महीना" },
    ],
    why: {
      en: "The cycle takes place roughly every month and menstruation usually lasts about two to eight days.",
      hi: "चक्र लगभग हर महीने होता है और ऋतुस्राव आमतौर पर लगभग दो से आठ दिन चलता है।",
    },
  },
  lining: {
    prompt: {
      en: "Every month, how does the uterus prepare to receive a fertilised egg?",
      hi: "हर महीने गर्भाशय निषेचित अंड को लेने की तैयारी कैसे करता है?",
    },
    right: {
      en: "Its lining grows thick and spongy, rich in blood",
      hi: "इसका अस्तर मोटा, स्पंजी और रक्त से भरपूर हो जाता है",
    },
    wrong: [
      {
        en: "It releases an egg into the oviduct each month",
        hi: "यह हर महीने अंडाणु को अंडवाहिनी में छोड़ता है",
      },
      {
        en: "It shrinks and its muscles relax completely",
        hi: "यह सिकुड़ जाता है और इसकी पेशियाँ पूरी तरह ढीली हो जाती हैं",
      },
    ],
    why: {
      en: "The lining thickens to nourish an embryo if fertilisation takes place; eggs are released by the ovary, not the uterus.",
      hi: "भित्ति मोटी होती है ताकि निषेचन होने पर भ्रूण को पोषण दे; अंड अंडाशय छोड़ता है, गर्भाशय नहीं।",
    },
  },
};

/** NCERT 8.3.3(c) and Exercise 6: what happens when the egg is not fertilised; why menstruation occurs. */
export const menstruation = family({
  level: Level.Easy,
  tests: [Concept.ReproductiveHealth],
  params: z.object({ case: z.enum(CASES) }).strict(),
  build: ({ case: c }, b) => askChoice(b, choices[c], seedOf(CASES, c)),
});

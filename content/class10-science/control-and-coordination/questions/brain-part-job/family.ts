import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { type Option, choiceQuestion, settle } from "@chalk/content-source/patterns";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

const Case = {
  Posture: "posture",
  BloodPressure: "bloodPressure",
  Thinking: "thinking",
  Pencil: "pencil",
  Cns: "cns",
  All: "all",
} as const;
type Case = (typeof Case)[keyof typeof Case];

type L = { en: string; hi: string };
const cases: Record<Case, { q: L; right: L; wrong: [L, L]; why: L }> = {
  posture: {
    q: {
      en: "Which part of the brain maintains posture and balance?",
      hi: "मस्तिष्क का कौन सा हिस्सा मुद्रा और संतुलन बनाए रखता है?",
    },
    right: { en: "Cerebellum", hi: "अनुमस्तिष्क" },
    wrong: [
      { en: "Medulla", hi: "मेडुला" },
      { en: "Fore-brain", hi: "अग्रमस्तिष्क" },
    ],
    why: {
      en: "The cerebellum, in the hind-brain, gives precision to voluntary actions and keeps posture and balance.",
      hi: "पश्चमस्तिष्क का अनुमस्तिष्क ऐच्छिक क्रियाओं को सटीकता देता है और मुद्रा व संतुलन बनाए रखता है।",
    },
  },
  bloodPressure: {
    q: { en: "Blood pressure is controlled by the…", hi: "रक्तचाप नियंत्रित करता है…" },
    right: { en: "medulla", hi: "मेडुला" },
    wrong: [
      { en: "cerebellum", hi: "अनुमस्तिष्क" },
      { en: "sensory areas of the fore-brain", hi: "अग्रमस्तिष्क के संवेदी क्षेत्र" },
    ],
    why: {
      en: "Involuntary actions like blood pressure, salivation and vomiting are controlled by the medulla.",
      hi: "रक्तचाप, लार आना और उल्टी जैसी अनैच्छिक क्रियाएँ मेडुला नियंत्रित करता है।",
    },
  },
  thinking: {
    q: {
      en: "The main thinking part of the brain is the…",
      hi: "मस्तिष्क का मुख्य सोचने वाला हिस्सा है…",
    },
    right: { en: "fore-brain", hi: "अग्रमस्तिष्क" },
    wrong: [
      { en: "hind-brain", hi: "पश्चमस्तिष्क" },
      { en: "spinal cord", hi: "मेरुरज्जु" },
    ],
    why: {
      en: "The fore-brain receives sensory impulses, interprets them and decides.",
      hi: "अग्रमस्तिष्क संवेदी आवेग पाता है, उनका अर्थ निकालता है और निर्णय लेता है।",
    },
  },
  pencil: {
    q: {
      en: "Picking up a pencil exactly is possible because of the…",
      hi: "पेंसिल को ठीक-ठीक उठाना संभव है…",
    },
    right: { en: "cerebellum", hi: "अनुमस्तिष्क से" },
    wrong: [
      { en: "medulla", hi: "मेडुला से" },
      { en: "spinal cord alone", hi: "केवल मेरुरज्जु से" },
    ],
    why: {
      en: "The cerebellum gives precision to voluntary actions.",
      hi: "अनुमस्तिष्क ऐच्छिक क्रियाओं को सटीकता देता है।",
    },
  },
  cns: {
    q: { en: "The central nervous system is made of…", hi: "केंद्रीय तंत्रिका तंत्र बना है…" },
    right: { en: "the brain and the spinal cord", hi: "मस्तिष्क और मेरुरज्जु से" },
    wrong: [
      { en: "the cranial and spinal nerves", hi: "कपाल और मेरु तंत्रिकाओं से" },
      { en: "the brain and the muscles", hi: "मस्तिष्क और पेशियों से" },
    ],
    why: {
      en: "The nerves arising from the brain and spinal cord make up the peripheral nervous system.",
      hi: "मस्तिष्क और मेरुरज्जु से निकलने वाली तंत्रिकाएँ परिधीय तंत्रिका तंत्र बनाती हैं।",
    },
  },
  all: {
    q: {
      en: "The brain is responsible for thinking, regulating the heartbeat and balancing the body. Which of these?",
      hi: "मस्तिष्क सोचने, दिल की धड़कन नियमित करने और शरीर का संतुलन बनाने के लिए ज़िम्मेदार है। इनमें से कौन सा?",
    },
    right: { en: "All of them", hi: "सभी" },
    wrong: [
      { en: "Only thinking", hi: "केवल सोचना" },
      { en: "Only balancing", hi: "केवल संतुलन" },
    ],
    why: {
      en: "The fore-brain thinks; the hind-brain regulates involuntary actions like the heartbeat and keeps balance.",
      hi: "अग्रमस्तिष्क सोचता है; पश्चमस्तिष्क दिल की धड़कन जैसी अनैच्छिक क्रियाएँ और संतुलन सँभालता है।",
    },
  },
};

/** NCERT 7.1.2, Fig. 7.3: parts of the brain and their jobs. */
export const brainPartJob = family({
  level: Level.Easy,
  tests: [Concept.BrainAndAction],
  params: z.object({ case: z.nativeEnum(Case) }).strict(),
  build: ({ case: c }, b) => {
    const k = cases[c];
    const options: Option[] = [
      { id: "right", label: t(k.right.en, k.right.hi) },
      ...k.wrong.map((w, i) => ({ id: `w${i}`, label: t(w.en, w.hi), feedback: k.why })),
    ];
    const ask = choiceQuestion(b, {
      prompt: t(k.q.en, k.q.hi),
      options: settle(options, c.length * 7 + 3),
      answer: "right",
    });
    return column([ask, space()]);
  },
});

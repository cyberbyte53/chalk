import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { type Option, choiceQuestion, settle } from "@chalk/patterns";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

const Case = {
  Acquired: "acquired",
  Travels: "travels",
  Converted: "converted",
  Gap: "gap",
  Muscle: "muscle",
  Form: "form",
} as const;
type Case = (typeof Case)[keyof typeof Case];

type L = { en: string; hi: string };
const cases: Record<Case, { q: L; right: L; wrong: [L, L]; why: L }> = {
  acquired: {
    q: {
      en: "In which part of a neuron is information acquired?",
      hi: "तंत्रिका कोशिका के किस हिस्से में सूचना प्राप्त होती है?",
    },
    right: { en: "The dendrite tips", hi: "द्रुमिका के सिरे" },
    wrong: [
      { en: "The axon", hi: "तंत्रिकाक्ष" },
      { en: "The nerve ending", hi: "तंत्रिका सिरा" },
    ],
    why: {
      en: "Information is picked up at the tips of the dendrites, where it sets off a chemical reaction that makes an electrical impulse.",
      hi: "सूचना द्रुमिकाओं के सिरों पर पकड़ी जाती है, जहाँ वह एक रासायनिक अभिक्रिया शुरू करती है जिससे विद्युत आवेग बनता है।",
    },
  },
  travels: {
    q: {
      en: "Through which part does information travel as an electrical impulse, over the longest stretch?",
      hi: "सूचना विद्युत आवेग के रूप में सबसे लंबी दूरी किस हिस्से से तय करती है?",
    },
    right: { en: "The axon", hi: "तंत्रिकाक्ष" },
    wrong: [
      { en: "The synapse", hi: "सिनेप्स" },
      { en: "The dendrite", hi: "द्रुमिका" },
    ],
    why: {
      en: "The impulse goes from the dendrite to the cell body and then along the long axon to its end.",
      hi: "आवेग द्रुमिका से कोशिका काय तक और फिर लंबे तंत्रिकाक्ष के साथ उसके अंत तक जाता है।",
    },
  },
  converted: {
    q: {
      en: "Where must the electrical impulse be turned into a chemical signal to pass the message on?",
      hi: "संदेश आगे भेजने के लिए विद्युत आवेग को कहाँ रासायनिक संकेत में बदलना पड़ता है?",
    },
    right: { en: "At the axon's end, at the synapse", hi: "तंत्रिकाक्ष के सिरे पर, सिनेप्स पर" },
    wrong: [
      { en: "In the cell body, near the nucleus", hi: "कोशिकाकाय में, केंद्रक के पास" },
      { en: "At the dendrite tips, where it starts", hi: "द्रुमिका सिरों पर, जहाँ यह शुरू होता है" },
    ],
    why: {
      en: "At the end of the axon the impulse releases chemicals, which cross the synapse to the next cell.",
      hi: "तंत्रिकाक्ष के अंत में आवेग रसायन छोड़ता है, जो सिनेप्स पार करके अगली कोशिका तक जाते हैं।",
    },
  },
  gap: {
    q: {
      en: "The gap between two neurons is called a…",
      hi: "दो तंत्रिका कोशिकाओं के बीच के अंतराल को कहते हैं…",
    },
    right: { en: "synapse", hi: "सिनेप्स" },
    wrong: [
      { en: "dendrite", hi: "द्रुमिका" },
      { en: "axon", hi: "तंत्रिकाक्ष" },
    ],
    why: {
      en: "The tiny gap between one neuron's nerve ending and the next neuron's dendrite is a synapse.",
      hi: "एक तंत्रिका कोशिका के तंत्रिका सिरे और अगली की द्रुमिका के बीच का छोटा अंतराल सिनेप्स है।",
    },
  },
  muscle: {
    q: {
      en: "How does a nerve message pass from a neuron to a muscle cell?",
      hi: "तंत्रिका संदेश तंत्रिका कोशिका से पेशी कोशिका तक कैसे जाता है?",
    },
    right: {
      en: "Across a synapse, as chemicals from the nerve ending",
      hi: "सिनेप्स के पार, तंत्रिका सिरे से निकले रसायनों के रूप में",
    },
    wrong: [
      {
        en: "The axon grows right into the muscle cell",
        hi: "तंत्रिकाक्ष सीधे पेशी कोशिका में बढ़ जाता है",
      },
      {
        en: "Through the blood, as a hormone sent from the brain",
        hi: "रक्त से, मस्तिष्क से भेजे गए हॉर्मोन के रूप में",
      },
    ],
    why: {
      en: "A similar synapse, the neuromuscular junction, passes the message on as chemicals.",
      hi: "ऐसा ही सिनेप्स, तंत्रिका-पेशी संधि, संदेश को रसायनों के रूप में आगे पहुँचाता है।",
    },
  },
  form: {
    q: { en: "Inside a neuron, the message travels as…", hi: "तंत्रिका कोशिका के अंदर संदेश चलता है…" },
    right: { en: "an electrical impulse", hi: "विद्युत आवेग के रूप में" },
    wrong: [
      { en: "a hormone in the blood", hi: "रुधिर में हॉर्मोन के रूप में" },
      { en: "water moving between cells", hi: "कोशिकाओं के बीच पानी के रूप में" },
    ],
    why: {
      en: "Along a neuron the message is electrical; only across the synapse is it chemical.",
      hi: "तंत्रिका कोशिका पर संदेश विद्युत होता है; केवल सिनेप्स के पार वह रासायनिक होता है।",
    },
  },
};

/** NCERT 7.1, Fig. 7.1: parts of a neuron and how a message travels. */
export const neuronParts = family({
  level: Level.Easy,
  tests: [Concept.RespondingToChange],
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

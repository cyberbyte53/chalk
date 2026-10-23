import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { type Option, choiceQuestion, settle } from "@chalk/content-source/patterns";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

const Case = {
  Where: "where",
  Order: "order",
  Why: "why",
  BrainRole: "brainRole",
  Sensory: "sensory",
  Injury: "injury",
} as const;
type Case = (typeof Case)[keyof typeof Case];

type L = { en: string; hi: string };
const cases: Record<Case, { q: L; right: L; wrong: [L, L]; why: L }> = {
  where: {
    q: { en: "Where are reflex arcs formed?", hi: "प्रतिवर्ती चाप कहाँ बनते हैं?" },
    right: { en: "In the spinal cord", hi: "मेरुरज्जु में" },
    wrong: [
      { en: "In the fore-brain", hi: "अग्रमस्तिष्क में" },
      { en: "In the muscle", hi: "पेशी में" },
    ],
    why: {
      en: "Nerves from all over the body meet in the spinal cord, so the link between input and output nerves is made there.",
      hi: "पूरे शरीर की तंत्रिकाएँ मेरुरज्जु में मिलती हैं, इसलिए आने और जाने वाली तंत्रिकाओं का जोड़ वहीं बनता है।",
    },
  },
  order: {
    q: {
      en: "Which is the correct order in a reflex arc?",
      hi: "प्रतिवर्ती चाप में सही क्रम कौन सा है?",
    },
    right: {
      en: "Receptor → sensory neuron → spinal cord → motor neuron → muscle",
      hi: "ग्राही → संवेदी तंत्रिका कोशिका → मेरुरज्जु → प्रेरक तंत्रिका कोशिका → पेशी",
    },
    wrong: [
      {
        en: "Muscle → motor neuron → spinal cord → receptor",
        hi: "पेशी → प्रेरक न्यूरॉन → मेरुरज्जु → ग्राही",
      },
      {
        en: "Receptor → sensory neuron → brain → thinking → motor neuron → muscle",
        hi: "ग्राही → संवेदी न्यूरॉन → मस्तिष्क → सोच → प्रेरक न्यूरॉन → पेशी",
      },
    ],
    why: {
      en: "The sensory neuron carries the message in, the spinal cord relays it, the motor neuron carries it out to the muscle.",
      hi: "संवेदी तंत्रिका कोशिका संदेश अंदर लाती है, मेरुरज्जु उसे आगे देता है, प्रेरक तंत्रिका कोशिका उसे पेशी तक ले जाती है।",
    },
  },
  why: {
    q: { en: "Why have reflex arcs evolved?", hi: "प्रतिवर्ती चाप क्यों विकसित हुए हैं?" },
    right: {
      en: "Thinking in the brain is too slow for danger",
      hi: "मस्तिष्क में सोचना खतरे के लिए बहुत धीमा है",
    },
    wrong: [
      {
        en: "The brain cannot feel pain, only the spine can",
        hi: "मस्तिष्क दर्द महसूस नहीं करता, केवल मेरुरज्जु करता है",
      },
      {
        en: "Muscles work better without any nerves at all",
        hi: "पेशियाँ बिना तंत्रिकाओं के बेहतर काम करती हैं",
      },
    ],
    why: {
      en: "Reflex arcs give quick responses without waiting for thought.",
      hi: "प्रतिवर्ती चाप सोच का इंतज़ार किए बिना तेज़ अनुक्रिया देते हैं।",
    },
  },
  brainRole: {
    q: {
      en: "In a reflex action, the information also reaches the brain. So…",
      hi: "प्रतिवर्ती क्रिया में सूचना मस्तिष्क तक भी पहुँचती है। इसलिए…",
    },
    right: {
      en: "we become aware of it after the hand moves",
      hi: "हाथ हटने के बाद हमें इसका पता चलता है",
    },
    wrong: [
      { en: "the brain alone decides to move the hand", hi: "केवल मस्तिष्क हाथ हटाने का निर्णय लेता है" },
      {
        en: "the reflex waits for the brain to decide first",
        hi: "प्रतिवर्त पहले मस्तिष्क के निर्णय की प्रतीक्षा करता है",
      },
    ],
    why: {
      en: "The spinal cord makes the response; the brain is informed but isn't needed for the quick action.",
      hi: "अनुक्रिया मेरुरज्जु करता है; मस्तिष्क को सूचना मिलती है पर तेज़ क्रिया के लिए उसकी ज़रूरत नहीं।",
    },
  },
  sensory: {
    q: {
      en: "In a reflex arc, which neuron carries the message from the skin to the spinal cord?",
      hi: "प्रतिवर्ती चाप में कौन सी तंत्रिका कोशिका संदेश त्वचा से मेरुरज्जु तक ले जाती है?",
    },
    right: { en: "The sensory neuron", hi: "संवेदी तंत्रिका कोशिका" },
    wrong: [
      { en: "The motor neuron", hi: "प्रेरक तंत्रिका कोशिका" },
      { en: "The relay neuron in the brain", hi: "मस्तिष्क की प्रसारण तंत्रिका कोशिका" },
    ],
    why: {
      en: "Sensory neurons carry messages in; motor neurons carry orders out to muscles.",
      hi: "संवेदी तंत्रिका कोशिकाएँ संदेश अंदर लाती हैं; प्रेरक तंत्रिका कोशिकाएँ आदेश पेशियों तक बाहर ले जाती हैं।",
    },
  },
  injury: {
    q: { en: "An injury to the spinal cord would disrupt…", hi: "मेरुरज्जु में चोट बाधित करेगी…" },
    right: {
      en: "reflex arcs and brain–body messages",
      hi: "प्रतिवर्ती चाप और मस्तिष्क–शरीर के संदेश",
    },
    wrong: [
      { en: "only thinking and memory in the brain", hi: "केवल मस्तिष्क में सोचना और याद रखना" },
      {
        en: "nothing, since the brain is safe in the skull",
        hi: "कुछ नहीं, क्योंकि मस्तिष्क खोपड़ी में सुरक्षित है",
      },
    ],
    why: {
      en: "The spinal cord makes reflex arcs and carries nerves to and from the brain.",
      hi: "मेरुरज्जु प्रतिवर्ती चाप बनाता है और मस्तिष्क से आने-जाने वाली तंत्रिकाएँ ले जाता है।",
    },
  },
};

/** NCERT 7.1.1, Fig. 7.2: the reflex arc. */
export const reflexPath = family({
  level: Level.Easy,
  tests: [Concept.ReflexActions],
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

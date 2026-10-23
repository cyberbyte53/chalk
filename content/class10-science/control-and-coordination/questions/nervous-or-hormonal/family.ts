import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { type Option, choiceQuestion, settle } from "@chalk/content-source/patterns";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

const Case = {
  Fast: "fast",
  Everywhere: "everywhere",
  Stagefright: "stagefright",
  HotPlate: "hotPlate",
  Need: "need",
} as const;
type Case = (typeof Case)[keyof typeof Case];

type L = { en: string; hi: string };
const cases: Record<Case, { q: L; right: L; wrong: [L, L]; why: L }> = {
  fast: {
    q: {
      en: "Which kind of control gives the fastest response?",
      hi: "किस तरह का नियंत्रण सबसे तेज़ अनुक्रिया देता है?",
    },
    right: { en: "Nervous control, by electrical impulses", hi: "तंत्रिका नियंत्रण, विद्युत आवेगों से" },
    wrong: [
      { en: "Hormonal control, through the blood", hi: "हॉर्मोन नियंत्रण, रुधिर से" },
      { en: "Both are equally fast in every case", hi: "दोनों हर स्थिति में बराबर तेज़ हैं" },
    ],
    why: {
      en: "Impulses along neurons are very fast; hormones in the blood are slower.",
      hi: "तंत्रिका कोशिकाओं पर आवेग बहुत तेज़ हैं; रुधिर में हॉर्मोन धीमे हैं।",
    },
  },
  everywhere: {
    q: {
      en: "Which kind of message can reach every cell of the body?",
      hi: "किस तरह का संदेश शरीर की हर कोशिका तक पहुँच सकता है?",
    },
    right: { en: "A hormone in the blood", hi: "रुधिर में हॉर्मोन" },
    wrong: [
      { en: "A nerve impulse from the brain", hi: "मस्तिष्क से तंत्रिका आवेग" },
      { en: "A reflex arc in the spinal cord", hi: "मेरुरज्जु में प्रतिवर्ती चाप" },
    ],
    why: {
      en: "Nerve impulses reach only connected cells; hormones travel everywhere in the blood.",
      hi: "तंत्रिका आवेग केवल जुड़ी कोशिकाओं तक पहुँचते हैं; हॉर्मोन रुधिर में हर जगह जाते हैं।",
    },
  },
  stagefright: {
    q: {
      en: "Before a stage show, your heart pounds and your breathing speeds up all at once. This is mainly…",
      hi: "मंच पर जाने से पहले तुम्हारा दिल धड़कता है और साँस एक साथ तेज़ होती है। यह मुख्यतः है…",
    },
    right: { en: "hormonal: adrenaline in the blood", hi: "हॉर्मोन वाला: रुधिर में एड्रीनलिन" },
    wrong: [
      { en: "a reflex arc in the spinal cord", hi: "मेरुरज्जु का प्रतिवर्ती चाप" },
      { en: "a voluntary action", hi: "एक ऐच्छिक क्रिया" },
    ],
    why: {
      en: "A change across the whole body at once is a hormone at work: adrenaline.",
      hi: "पूरे शरीर में एक साथ बदलाव किसी हॉर्मोन का काम है: एड्रीनलिन।",
    },
  },
  hotPlate: {
    q: {
      en: "You touch a hot plate and pull away. This is mainly…",
      hi: "तुम गरम प्लेट छूकर हाथ हटा लेते हो। यह मुख्यतः है…",
    },
    right: { en: "nervous: a reflex arc", hi: "तंत्रिका वाला: प्रतिवर्ती चाप" },
    wrong: [
      { en: "hormonal: adrenaline", hi: "हॉर्मोन वाला: एड्रीनलिन" },
      { en: "a growth movement", hi: "एक वृद्धि गति" },
    ],
    why: {
      en: "A quick reply of one muscle needs the speed of nerve impulses.",
      hi: "एक पेशी के तेज़ जवाब के लिए तंत्रिका आवेगों की तेज़ी चाहिए।",
    },
  },
  need: {
    q: {
      en: "Why does an organism need a system of control and coordination?",
      hi: "किसी जीव को नियंत्रण और समन्वय के तंत्र की ज़रूरत क्यों है?",
    },
    right: {
      en: "So each change gets the right response from all parts",
      hi: "ताकि हर बदलाव पर सभी भाग सही प्रतिक्रिया दें",
    },
    wrong: [
      { en: "So it can keep growing without ever stopping", hi: "ताकि यह बिना रुके बढ़ता रहे" },
      {
        en: "So its cells never need to talk to one another at all",
        hi: "ताकि इसकी कोशिकाओं को आपस में कभी बात न करनी पड़े",
      },
    ],
    why: {
      en: "Movement and growth must be the right ones for each change in the surroundings.",
      hi: "परिवेश के हर बदलाव के लिए सही गति और वृद्धि होनी चाहिए।",
    },
  },
};

/** NCERT Exercise 11: comparing nervous and hormonal control. */
export const nervousOrHormonal = family({
  level: Level.Easy,
  tests: [Concept.HormonesInAnimals, Concept.RespondingToChange],
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

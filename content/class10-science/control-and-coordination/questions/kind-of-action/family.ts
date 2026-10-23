import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { type Option, choiceQuestion, settle } from "@chalk/content-source/patterns";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

const Case = {
  Flame: "flame",
  Writing: "writing",
  Heart: "heart",
  Pupil: "pupil",
  Salivation: "salivation",
  Walking: "walking",
} as const;
type Case = (typeof Case)[keyof typeof Case];

type L = { en: string; hi: string };
const cases: Record<Case, { q: L; right: L; wrong: [L, L]; why: L }> = {
  flame: {
    q: { en: "Pulling your hand back from a flame is…", hi: "लौ से हाथ खींच लेना है…" },
    right: { en: "a reflex action", hi: "एक प्रतिवर्ती क्रिया" },
    wrong: [
      { en: "a voluntary action", hi: "एक ऐच्छिक क्रिया" },
      { en: "a growth movement", hi: "एक वृद्धि गति" },
    ],
    why: {
      en: "It happens suddenly, without thinking, through a reflex arc in the spinal cord.",
      hi: "यह अचानक, बिना सोचे, मेरुरज्जु के प्रतिवर्ती चाप से होता है।",
    },
  },
  writing: {
    q: { en: "Writing a letter is…", hi: "चिट्ठी लिखना है…" },
    right: { en: "a voluntary action", hi: "एक ऐच्छिक क्रिया" },
    wrong: [
      { en: "a reflex action", hi: "एक प्रतिवर्ती क्रिया" },
      { en: "an involuntary action", hi: "एक अनैच्छिक क्रिया" },
    ],
    why: {
      en: "We decide to write: it's a voluntary action, controlled by the fore-brain.",
      hi: "हम लिखने का निर्णय लेते हैं: यह ऐच्छिक क्रिया है, जिसे अग्रमस्तिष्क नियंत्रित करता है।",
    },
  },
  heart: {
    q: { en: "The heart beating is…", hi: "दिल का धड़कना है…" },
    right: { en: "an involuntary action", hi: "एक अनैच्छिक क्रिया" },
    wrong: [
      { en: "a voluntary action", hi: "एक ऐच्छिक क्रिया" },
      { en: "a reflex action", hi: "एक प्रतिवर्ती क्रिया" },
    ],
    why: {
      en: "It goes on all the time without our thinking control.",
      hi: "यह हमारे सोचने के नियंत्रण के बिना लगातार चलता है।",
    },
  },
  pupil: {
    q: {
      en: "The pupil getting smaller in bright light is…",
      hi: "तेज़ रोशनी में पुतली का छोटा होना है…",
    },
    right: { en: "a reflex action", hi: "एक प्रतिवर्ती क्रिया" },
    wrong: [
      { en: "a voluntary action", hi: "एक ऐच्छिक क्रिया" },
      { en: "a tropism", hi: "एक अनुवर्तन" },
    ],
    why: {
      en: "It is a sudden response to a stimulus, made without thinking.",
      hi: "यह किसी उद्दीपन पर बिना सोचे अचानक अनुक्रिया है।",
    },
  },
  salivation: {
    q: {
      en: "Your mouth watering when you see food you like is controlled by…",
      hi: "पसंद का खाना देखकर मुँह में पानी आना नियंत्रित करता है…",
    },
    right: { en: "the medulla", hi: "मेडुला" },
    wrong: [
      { en: "the cerebellum", hi: "अनुमस्तिष्क" },
      { en: "the motor areas of the fore-brain", hi: "अग्रमस्तिष्क के प्रेरक क्षेत्र" },
    ],
    why: {
      en: "Salivation is an involuntary action controlled by the medulla in the hind-brain.",
      hi: "लार आना पश्चमस्तिष्क के मेडुला द्वारा नियंत्रित अनैच्छिक क्रिया है।",
    },
  },
  walking: {
    q: {
      en: "How is walking different from a reflex action?",
      hi: "चलना प्रतिवर्ती क्रिया से कैसे अलग है?",
    },
    right: {
      en: "Walking is voluntary: we decide to do it",
      hi: "चलना ऐच्छिक है: हम उसका निर्णय लेते हैं",
    },
    wrong: [
      { en: "Walking uses no muscles", hi: "चलने में पेशियाँ नहीं लगतीं" },
      { en: "Walking happens in the spinal cord only", hi: "चलना केवल मेरुरज्जु में होता है" },
    ],
    why: {
      en: "A reflex is made without thinking; walking is decided on (and the cerebellum keeps it precise and balanced).",
      hi: "प्रतिवर्त बिना सोचे होता है; चलने का निर्णय लिया जाता है (और अनुमस्तिष्क उसे सटीक और संतुलित रखता है)।",
    },
  },
};

/** NCERT 7.1.1–7.1.2: reflex, voluntary and involuntary actions. */
export const kindOfAction = family({
  level: Level.Easy,
  tests: [Concept.ReflexActions, Concept.BrainAndAction],
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

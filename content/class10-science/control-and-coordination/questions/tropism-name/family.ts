import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { type Option, choiceQuestion, settle } from "@chalk/patterns";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

const Case = {
  PhotoShoot: "photoShoot",
  PhotoRoot: "photoRoot",
  Geo: "geo",
  Hydro: "hydro",
  Chemo: "chemo",
  Turned: "turned",
  Experiment: "experiment",
} as const;
type Case = (typeof Case)[keyof typeof Case];

type L = { en: string; hi: string };
const cases: Record<Case, { q: L; right: L; wrong: [L, L]; why: L }> = {
  photoShoot: {
    q: { en: "A shoot bends towards a window. This is…", hi: "प्ररोह खिड़की की ओर मुड़ता है। यह है…" },
    right: { en: "phototropism", hi: "प्रकाशानुवर्तन" },
    wrong: [
      { en: "geotropism", hi: "गुरुत्वानुवर्तन" },
      { en: "hydrotropism", hi: "जलानुवर्तन" },
    ],
    why: {
      en: "A response to light is phototropism; shoots bend towards light.",
      hi: "प्रकाश के प्रति अनुक्रिया प्रकाशानुवर्तन है; प्ररोह प्रकाश की ओर मुड़ते हैं।",
    },
  },
  photoRoot: {
    q: {
      en: "In Activity 7.2, which way do the roots bend?",
      hi: "क्रियाकलाप 7.2 में जड़ें किस ओर मुड़ती हैं?",
    },
    right: { en: "Away from the light", hi: "प्रकाश से दूर" },
    wrong: [
      { en: "Towards the light", hi: "प्रकाश की ओर" },
      { en: "They don't bend at all", hi: "वे बिल्कुल नहीं मुड़तीं" },
    ],
    why: {
      en: "Shoots bend towards light and roots bend away from it.",
      hi: "प्ररोह प्रकाश की ओर और जड़ें उससे दूर मुड़ती हैं।",
    },
  },
  geo: {
    q: {
      en: "Roots grow down and shoots grow up, in response to…",
      hi: "जड़ें नीचे और प्ररोह ऊपर बढ़ते हैं, जवाब में…",
    },
    right: { en: "gravity (geotropism)", hi: "गुरुत्व के (गुरुत्वानुवर्तन)" },
    wrong: [
      { en: "light (phototropism)", hi: "प्रकाश के (प्रकाशानुवर्तन)" },
      { en: "touch", hi: "स्पर्श के" },
    ],
    why: {
      en: "Growth in response to the pull of the earth is geotropism.",
      hi: "पृथ्वी के खिंचाव के जवाब में वृद्धि गुरुत्वानुवर्तन है।",
    },
  },
  hydro: {
    q: {
      en: "A root grows towards a wet patch of soil. This is…",
      hi: "जड़ मिट्टी के गीले हिस्से की ओर बढ़ती है। यह है…",
    },
    right: { en: "hydrotropism", hi: "जलानुवर्तन" },
    wrong: [
      { en: "chemotropism", hi: "रसायनानुवर्तन" },
      { en: "phototropism", hi: "प्रकाशानुवर्तन" },
    ],
    why: {
      en: "'Hydro' means water: directional growth towards water is hydrotropism.",
      hi: "'जल' यानी पानी: पानी की ओर दिशा वाली वृद्धि जलानुवर्तन है।",
    },
  },
  chemo: {
    q: {
      en: "A pollen tube growing towards an ovule is an example of…",
      hi: "बीजांड की ओर बढ़ती पराग नलिका उदाहरण है…",
    },
    right: { en: "chemotropism", hi: "रसायनानुवर्तन का" },
    wrong: [
      { en: "hydrotropism", hi: "जलानुवर्तन का" },
      { en: "geotropism", hi: "गुरुत्वानुवर्तन का" },
    ],
    why: {
      en: "'Chemo' refers to chemicals: the pollen tube grows in response to chemicals.",
      hi: "'रसायन' यानी रासायनिक पदार्थ: पराग नलिका रसायनों के जवाब में बढ़ती है।",
    },
  },
  turned: {
    q: {
      en: "In Activity 7.2 the flask is turned round. What happens to the old parts of the shoot?",
      hi: "क्रियाकलाप 7.2 में फ़्लास्क घुमाया जाता है। प्ररोह के पुराने हिस्सों का क्या होता है?",
    },
    right: {
      en: "They stay put; only new growth bends to the light",
      hi: "वे वैसे ही रहते हैं; केवल नई वृद्धि प्रकाश की ओर मुड़ती है",
    },
    wrong: [
      { en: "They straighten out at once and stand upright", hi: "वे तुरंत सीधे होकर खड़े हो जाते हैं" },
      {
        en: "The whole shoot turns round to face the light",
        hi: "पूरा प्ररोह घूमकर प्रकाश की ओर हो जाता है",
      },
    ],
    why: {
      en: "Tropic movement comes from growth, so only the new growth responds.",
      hi: "अनुवर्ती गति वृद्धि से होती है, इसलिए केवल नई वृद्धि अनुक्रिया करती है।",
    },
  },
  experiment: {
    q: { en: "Which experiment would show hydrotropism?", hi: "जलानुवर्तन कौन सा प्रयोग दिखाएगा?" },
    right: {
      en: "Seedlings in dry soil with water on one side only",
      hi: "सूखी मिट्टी में अंकुर, केवल एक ओर पानी",
    },
    wrong: [
      {
        en: "Seedlings in a dark box with a window on one side",
        hi: "एक ओर खिड़की वाले अँधेरे डिब्बे में अंकुर",
      },
      { en: "A pot of seedlings laid down on its side", hi: "अंकुरों का गमला करवट लिटाकर" },
    ],
    why: {
      en: "To test water, water must be the only thing that differs from side to side; then see which way the roots grow.",
      hi: "पानी को परखने के लिए केवल पानी ही एक ओर से दूसरी ओर अलग होना चाहिए; फिर देखो जड़ें किस ओर बढ़ती हैं।",
    },
  },
};

/** NCERT 7.2.2, Activity 7.2: tropisms. */
export const tropismName = family({
  level: Level.Easy,
  tests: [Concept.HowPlantsMove],
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

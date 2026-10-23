import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { type Option, choiceQuestion, settle } from "@chalk/content-source/patterns";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

const Case = {
  Smell: "smell",
  Taste: "taste",
  Cold: "cold",
  Stimulus: "stimulus",
  ReceptorJob: "receptorJob",
  Whisper: "whisper",
} as const;
type Case = (typeof Case)[keyof typeof Case];

type L = { en: string; hi: string };
const cases: Record<Case, { q: L; right: L; wrong: [L, L]; why: L }> = {
  smell: {
    q: {
      en: "Which receptors detect the smell of an agarbatti?",
      hi: "अगरबत्ती की गंध कौन से ग्राही पहचानते हैं?",
    },
    right: { en: "Olfactory receptors in the nose", hi: "नाक के घ्राणग्राही" },
    wrong: [
      { en: "Gustatory receptors on the tongue", hi: "जीभ के स्वादग्राही" },
      { en: "Receptors in the inner ear", hi: "भीतरी कान के ग्राही" },
    ],
    why: {
      en: "Olfactory receptors detect smell; gustatory receptors detect taste.",
      hi: "घ्राणग्राही गंध पहचानते हैं; स्वादग्राही स्वाद।",
    },
  },
  taste: {
    q: {
      en: "Which receptors detect the sweetness of sugar?",
      hi: "चीनी की मिठास कौन से ग्राही पहचानते हैं?",
    },
    right: { en: "Gustatory receptors", hi: "स्वादग्राही" },
    wrong: [
      { en: "Olfactory receptors", hi: "घ्राणग्राही" },
      { en: "Muscle cells", hi: "पेशी कोशिकाएँ" },
    ],
    why: {
      en: "Gustatory receptors on the tongue detect taste.",
      hi: "जीभ के स्वादग्राही स्वाद पहचानते हैं।",
    },
  },
  cold: {
    q: {
      en: "Food tastes of very little when you have a cold with a blocked nose. Why?",
      hi: "बंद नाक वाले ज़ुकाम में खाने का स्वाद बहुत कम लगता है। क्यों?",
    },
    right: {
      en: "Part of flavour is smell, which a blocked nose misses",
      hi: "स्वाद का एक भाग गंध है, जिसे बंद नाक नहीं पकड़ती",
    },
    wrong: [
      {
        en: "The tongue's taste receptors stop working",
        hi: "जीभ के स्वाद ग्राही काम करना बंद कर देते हैं",
      },
      {
        en: "The brain stops processing taste during a cold",
        hi: "सर्दी में मस्तिष्क स्वाद को संसाधित करना बंद कर देता है",
      },
    ],
    why: {
      en: "Activity 7.1: blocking the nose removes the smell part of what we think of as taste.",
      hi: "क्रियाकलाप 7.1: नाक बंद करने से वह गंध वाला हिस्सा हट जाता है जिसे हम स्वाद समझते हैं।",
    },
  },
  stimulus: {
    q: {
      en: "A cat sees a mouse and runs. The mouse appearing is the…",
      hi: "बिल्ली चूहा देखती है और दौड़ती है। चूहे का दिखना है…",
    },
    right: { en: "stimulus", hi: "उद्दीपन" },
    wrong: [
      { en: "response", hi: "अनुक्रिया" },
      { en: "receptor", hi: "ग्राही" },
    ],
    why: {
      en: "A stimulus is a change the animal detects; running is its response.",
      hi: "उद्दीपन वह बदलाव है जिसे जंतु पहचानता है; दौड़ना उसकी अनुक्रिया है।",
    },
  },
  receptorJob: {
    q: {
      en: "What is the function of receptors in our body?",
      hi: "हमारे शरीर में ग्राहियों का क्या काम है?",
    },
    right: { en: "To detect information from around us", hi: "आसपास की सूचना पहचानना" },
    wrong: [
      { en: "To move the muscles when the brain commands", hi: "मस्तिष्क के आदेश पर पेशियों को हिलाना" },
      { en: "To make hormones for the blood", hi: "रक्त के लिए हॉर्मोन बनाना" },
    ],
    why: {
      en: "Receptors are the special tips of some neurons that detect changes around us.",
      hi: "ग्राही कुछ तंत्रिका कोशिकाओं के ख़ास सिरे हैं जो हमारे आसपास के बदलाव पहचानते हैं।",
    },
  },
  whisper: {
    q: {
      en: "You whisper to a friend in class instead of shouting. This shows that…",
      hi: "तुम कक्षा में दोस्त से चिल्लाने की जगह फुसफुसाते हो। इससे पता चलता है कि…",
    },
    right: {
      en: "each situation gets a controlled, suitable response",
      hi: "हर स्थिति पर नियंत्रित, उचित अनुक्रिया होती है",
    },
    wrong: [
      { en: "movement is always caused by growth", hi: "गति हमेशा वृद्धि से होती है" },
      {
        en: "only reflexes, not our decisions, control what we do",
        hi: "केवल प्रतिवर्त, हमारे निर्णय नहीं, हमारे कार्य नियंत्रित करते हैं",
      },
    ],
    why: {
      en: "Movement in response to the surroundings is carefully controlled: that's why we need control and coordination.",
      hi: "परिवेश के जवाब में गति सावधानी से नियंत्रित होती है: इसीलिए हमें नियंत्रण और समन्वय चाहिए।",
    },
  },
};

/** NCERT 7.1 and Activity 7.1: receptors, stimulus and response. */
export const receptorSense = family({
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

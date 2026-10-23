import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { pickOne, seedOf } from "../../kit";

type W = { en: string; hi: string };

const STATEMENTS = {
  brittle: {
    en: "Ionic compounds are hard solids, but break into pieces when pressure is applied.",
    hi: "आयनिक यौगिक कठोर ठोस हैं, पर दबाव डालने पर टुकड़ों में टूट जाते हैं।",
    isTrue: true,
    why: { en: "They are somewhat hard and brittle.", hi: "वे कुछ कठोर और भंगुर हैं।" },
  },
  lowMelt: {
    en: "Ionic compounds melt at low temperatures.",
    hi: "आयनिक यौगिक कम ताप पर पिघलते हैं।",
    isTrue: false,
    why: {
      en: "Breaking the strong attraction between ions takes a lot of energy, so their melting points are high.",
      hi: "आयनों के बीच के प्रबल आकर्षण को तोड़ने में बहुत ऊर्जा लगती है, इसलिए उनके गलनांक ऊँचे हैं।",
    },
  },
  water: {
    en: "Ionic compounds are generally soluble in water.",
    hi: "आयनिक यौगिक सामान्यतः पानी में घुलनशील हैं।",
    isTrue: true,
    why: { en: "They generally dissolve in water.", hi: "वे सामान्यतः पानी में घुलते हैं।" },
  },
  petrol: {
    en: "Ionic compounds dissolve well in petrol and kerosene.",
    hi: "आयनिक यौगिक पेट्रोल और केरोसिन में अच्छी तरह घुलते हैं।",
    isTrue: false,
    why: {
      en: "They are insoluble in solvents such as kerosene and petrol.",
      hi: "वे केरोसिन और पेट्रोल जैसे विलायकों में अघुलनशील हैं।",
    },
  },
  molecules: {
    en: "Sodium chloride exists as separate NaCl molecules.",
    hi: "सोडियम क्लोराइड अलग-अलग NaCl अणुओं के रूप में रहता है।",
    isTrue: false,
    why: {
      en: "It is a collection of oppositely charged ions, not molecules.",
      hi: "यह विपरीत आवेश वाले आयनों का समूह है, अणु नहीं।",
    },
  },
  solidConducts: {
    en: "Solid ionic compounds conduct electricity.",
    hi: "ठोस आयनिक यौगिक विद्युत का चालन करते हैं।",
    isTrue: false,
    why: { en: "The ions can't move in the rigid solid.", hi: "कठोर ठोस में आयन चल नहीं सकते।" },
  },
} as const satisfies Record<string, W & { isTrue: boolean; why: W }>;
type Statement = keyof typeof STATEMENTS;

/** True or false: a statement about ionic compounds (section 3.3.1). */
export const ionicProperty = family({
  level: Level.Easy,
  tests: [Concept.PropertiesOfIonicCompounds],
  params: z
    .object({ statement: z.enum(Object.keys(STATEMENTS) as [Statement, ...Statement[]]) })
    .strict(),
  build: ({ statement }, b) => {
    const s = STATEMENTS[statement];
    const yes = t("True", "सही");
    const no = t("False", "ग़लत");
    const ask = pickOne(b, {
      prompt: t(`True or false? ${s.en}`, `सही या ग़लत? ${s.hi}`),
      right: s.isTrue ? yes : no,
      wrong: [{ label: s.isTrue ? no : yes, why: t(s.why.en, s.why.hi) }],
      seed: seedOf(statement),
    });
    return column([ask, space()]);
  },
});

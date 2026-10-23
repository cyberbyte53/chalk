import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { pickOne, seedOf } from "../../kit";

const SALTS = {
  NaCl: { en: "sodium chloride", hi: "सोडियम क्लोराइड" },
  KI: { en: "potassium iodide", hi: "पोटैशियम आयोडाइड" },
  BaCl2: { en: "barium chloride", hi: "बेरियम क्लोराइड" },
  CaCl2: { en: "calcium chloride", hi: "कैल्शियम क्लोराइड" },
} as const;
type Salt = keyof typeof SALTS;

const FORMS = {
  solid: {
    en: "as a dry solid",
    hi: "सूखे ठोस रूप में",
    conducts: false,
    why: {
      en: "In the solid the ions are held in a rigid structure and can't move.",
      hi: "ठोस में आयन एक कठोर ढाँचे में जकड़े रहते हैं और चल नहीं सकते।",
    },
  },
  water: {
    en: "dissolved in water",
    hi: "पानी में घुले रूप में",
    conducts: true,
    why: {
      en: "In water the ions are free to move to the electrodes.",
      hi: "पानी में आयन इलेक्ट्रोडों की ओर चलने को स्वतंत्र हैं।",
    },
  },
  molten: {
    en: "molten",
    hi: "पिघले रूप में",
    conducts: true,
    why: {
      en: "Heat overcomes the attraction between the ions, so they move freely.",
      hi: "ऊष्मा आयनों के बीच के आकर्षण को पार कर लेती है, इसलिए वे स्वतंत्र रूप से चलते हैं।",
    },
  },
  kerosene: {
    en: "stirred into kerosene",
    hi: "केरोसिन में चलाए रूप में",
    conducts: false,
    why: {
      en: "Ionic compounds don't dissolve in kerosene, so no ions are set free.",
      hi: "आयनिक यौगिक केरोसिन में नहीं घुलते, इसलिए कोई आयन मुक्त नहीं होते।",
    },
  },
} as const;
type Form = keyof typeof FORMS;

/** Does an ionic compound conduct electricity in this form? (Activity 3.13.) */
export const ionicConducts = family({
  level: Level.Medium,
  tests: [Concept.PropertiesOfIonicCompounds],
  params: z
    .object({
      salt: z.enum(Object.keys(SALTS) as [Salt, ...Salt[]]),
      form: z.enum(Object.keys(FORMS) as [Form, ...Form[]]),
    })
    .strict(),
  build: ({ salt, form }, b) => {
    const s = SALTS[salt];
    const f = FORMS[form];
    const yes = t("Yes, the bulb glows", "हाँ, बल्ब जलता है");
    const no = t("No, the bulb stays dark", "नहीं, बल्ब बुझा रहता है");
    const ask = pickOne(b, {
      prompt: t(
        `The two electrodes of a circuit with a bulb are put into ${s.en}, ${f.en}. Does it conduct electricity?`,
        `बल्ब वाले परिपथ के दो इलेक्ट्रोड ${s.hi} में डाले जाते हैं, ${f.hi}। क्या यह विद्युत का चालन करता है?`,
      ),
      right: f.conducts ? yes : no,
      wrong: [{ label: f.conducts ? no : yes, why: t(f.why.en, f.why.hi) }],
      seed: seedOf(salt, form),
    });
    return column([ask, space()]);
  },
});

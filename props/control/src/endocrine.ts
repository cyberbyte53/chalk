import { actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import type { Words } from "./draw";

/**
 * The endocrine glands of the human body (NCERT 7.3, Fig. 7.7 and Table 7.1): tap a gland to read
 * its hormone and what the hormone does. Glands secrete hormones straight into the blood, which
 * carries them all over the body. Male and female bodies differ only in the sex glands (testes or
 * ovaries). The pineal, parathyroid and thymus are in Fig. 7.7 but not described in the text
 * (Activity 7.3 asks students to find out about them); their notes say so.
 */

export const Gland = {
  Hypothalamus: "hypothalamus",
  Pituitary: "pituitary",
  Pineal: "pineal",
  Thyroid: "thyroid",
  Parathyroid: "parathyroid",
  Thymus: "thymus",
  Adrenal: "adrenal",
  Pancreas: "pancreas",
  Testes: "testes",
  Ovaries: "ovaries",
} as const;
export type Gland = (typeof Gland)[keyof typeof Gland];

export const Body = { Male: "male", Female: "female" } as const;
export type Body = (typeof Body)[keyof typeof Body];

export const GLANDS: Readonly<
  Record<Gland, { name: Words; hormone: Words; job: Words; inText: boolean }>
> = {
  [Gland.Hypothalamus]: {
    name: { en: "Hypothalamus", hi: "हाइपोथैलेमस" },
    hormone: { en: "Releasing hormones", hi: "मोचक हॉर्मोन" },
    job: {
      en: "Make the pituitary release its hormones. When growth hormone is low, it releases growth hormone releasing factor.",
      hi: "पीयूष ग्रंथि से उसके हॉर्मोन छुड़वाते हैं। जब वृद्धि हॉर्मोन कम होता है, यह वृद्धि हॉर्मोन मोचक कारक छोड़ता है।",
    },
    inText: true,
  },
  [Gland.Pituitary]: {
    name: { en: "Pituitary gland", hi: "पीयूष ग्रंथि" },
    hormone: { en: "Growth hormone", hi: "वृद्धि हॉर्मोन" },
    job: {
      en: "Regulates growth and development of the body. Too little of it in childhood leads to dwarfism.",
      hi: "शरीर की वृद्धि और विकास नियंत्रित करता है। बचपन में इसकी कमी से बौनापन होता है।",
    },
    inText: true,
  },
  [Gland.Pineal]: {
    name: { en: "Pineal gland", hi: "पीनियल ग्रंथि" },
    hormone: { en: "Melatonin", hi: "मेलाटोनिन" },
    job: {
      en: "Not described in the chapter (Activity 7.3 asks you to find out). Its hormone, melatonin, helps set the body's daily sleep–wake cycle.",
      hi: "अध्याय में इसका वर्णन नहीं है (क्रियाकलाप 7.3 तुमसे पता करने को कहता है)। इसका हॉर्मोन मेलाटोनिन शरीर के रोज़ के सोने-जागने के चक्र को नियंत्रित करने में मदद करता है।",
    },
    inText: false,
  },
  [Gland.Thyroid]: {
    name: { en: "Thyroid gland", hi: "थायरॉइड ग्रंथि" },
    hormone: { en: "Thyroxin", hi: "थायरॉक्सिन" },
    job: {
      en: "Regulates carbohydrate, protein and fat metabolism for the best balance for growth. It needs iodine to make thyroxin; too little iodine can cause goitre, a swollen neck.",
      hi: "वृद्धि के लिए सबसे अच्छे संतुलन हेतु कार्बोहाइड्रेट, प्रोटीन और वसा के उपापचय को नियंत्रित करता है। थायरॉक्सिन बनाने के लिए आयोडीन चाहिए; आयोडीन की कमी से गॉयटर (घेंघा), यानी सूजी हुई गर्दन, हो सकता है।",
    },
    inText: true,
  },
  [Gland.Parathyroid]: {
    name: { en: "Parathyroid glands", hi: "पैराथायरॉइड ग्रंथियाँ" },
    hormone: { en: "Parathormone", hi: "पैराथॉर्मोन" },
    job: {
      en: "Not described in the chapter (Activity 7.3). Four small glands on the thyroid; their hormone keeps the amount of calcium in the blood right.",
      hi: "अध्याय में वर्णन नहीं है (क्रियाकलाप 7.3)। थायरॉइड पर चार छोटी ग्रंथियाँ; इनका हॉर्मोन रुधिर में कैल्सियम की मात्रा ठीक रखता है।",
    },
    inText: false,
  },
  [Gland.Thymus]: {
    name: { en: "Thymus", hi: "थाइमस" },
    hormone: { en: "Thymosin", hi: "थाइमोसिन" },
    job: {
      en: "Not described in the chapter (Activity 7.3). It helps the body's defence (immune) system develop in children.",
      hi: "अध्याय में वर्णन नहीं है (क्रियाकलाप 7.3)। यह बच्चों में शरीर के रक्षा (प्रतिरक्षा) तंत्र के विकास में मदद करता है।",
    },
    inText: false,
  },
  [Gland.Adrenal]: {
    name: { en: "Adrenal glands", hi: "अधिवृक्क ग्रंथियाँ" },
    hormone: { en: "Adrenaline", hi: "एड्रिनलिन" },
    job: {
      en: "Gets the body ready for an emergency, to fight or run: the heart beats faster, breathing speeds up, and blood is sent from the digestive system and skin to the muscles.",
      hi: "आपात स्थिति, यानी लड़ने या भागने, के लिए शरीर को तैयार करता है: हृदय तेज़ धड़कता है, साँस तेज़ होती है, और रुधिर पाचन तंत्र और त्वचा से पेशियों की ओर भेजा जाता है।",
    },
    inText: true,
  },
  [Gland.Pancreas]: {
    name: { en: "Pancreas", hi: "अग्न्याशय" },
    hormone: { en: "Insulin", hi: "इंसुलिन" },
    job: {
      en: "Regulates the blood sugar level. If too little is made, the sugar in the blood rises (diabetes).",
      hi: "रुधिर में शर्करा का स्तर नियंत्रित करता है। यदि कम बने, तो रुधिर में शर्करा बढ़ जाती है (मधुमेह)।",
    },
    inText: true,
  },
  [Gland.Testes]: {
    name: { en: "Testes", hi: "वृषण" },
    hormone: { en: "Testosterone", hi: "टेस्टोस्टेरॉन" },
    job: {
      en: "Brings the changes of puberty in boys and the development of male sex organs.",
      hi: "लड़कों में यौवनारंभ के परिवर्तन और नर लैंगिक अंगों का विकास लाता है।",
    },
    inText: true,
  },
  [Gland.Ovaries]: {
    name: { en: "Ovaries", hi: "अंडाशय" },
    hormone: { en: "Oestrogen", hi: "एस्ट्रोजन" },
    job: {
      en: "Development of female sex organs, the changes of puberty in girls, and regulating the menstrual cycle.",
      hi: "मादा लैंगिक अंगों का विकास, लड़कियों में यौवनारंभ के परिवर्तन, और ऋतुस्राव चक्र का नियंत्रण।",
    },
    inText: true,
  },
};

export function glandsOf(body: Body): readonly Gland[] {
  return (Object.values(Gland) as Gland[]).filter((g) =>
    body === Body.Male ? g !== Gland.Ovaries : g !== Gland.Testes,
  );
}

export const EndocrineAction = { Tap: "tap", SetBody: "setBody", Clear: "clear" } as const;
export const EndocrineSignal = { Picked: "picked" } as const;
export const EndocrineDerived = { Hormone: "hormone", InText: "inText" } as const;
export const EndocrinePart = { Body: "body", Card: "card", Toggle: "toggle" } as const;

const endocrineState = z
  .object({
    body: z.nativeEnum(Body),
    selected: z.nativeEnum(Gland).nullable(),
    showNames: z.boolean(),
    canTap: z.boolean(),
    canSetBody: z.boolean(),
  })
  .strict();
export type EndocrineState = z.infer<typeof endocrineState>;

export function describeEndocrine(s: EndocrineState): string {
  const list = glandsOf(s.body)
    .map((g) => GLANDS[g].name.en)
    .join(", ");
  const picked =
    s.selected === null
      ? "None tapped yet."
      : `Tapped: ${GLANDS[s.selected].name.en}, which makes ${GLANDS[s.selected].hormone.en}: ${GLANDS[s.selected].job.en}`;
  return `An outline of a ${s.body} human body with its endocrine glands marked: ${list}. ${picked}`;
}

const act = actionsFor<EndocrineState>();

export const endocrineMap = defineProp({
  type: "endocrineMap",
  describe:
    "A human body outline (male or female) with the endocrine glands of NCERT Fig. 7.7: hypothalamus, pituitary, pineal, thyroid, parathyroid, thymus, adrenal glands, pancreas, and testes or ovaries. Tapping a gland shows its hormone and what it does (Table 7.1). The pineal, parathyroid and thymus notes say they are not described in the chapter.",
  state: endocrineState,
  defaults: {
    body: Body.Male,
    selected: null,
    showNames: true,
    canTap: true,
    canSetBody: true,
  },
  inputs: ["body", "showNames", "canTap", "canSetBody"],
  invariant: (s) =>
    s.selected === null || glandsOf(s.body).includes(s.selected)
      ? undefined
      : "the selected gland must be in this body",
  derived: {
    [EndocrineDerived.Hormone]: {
      describe: "The hormone of the tapped gland (English name), or null",
      compute: (s) => (s.selected === null ? null : GLANDS[s.selected].hormone.en),
    },
    [EndocrineDerived.InText]: {
      describe: "Whether the tapped gland is described in the chapter's text; null if none",
      compute: (s) => (s.selected === null ? null : GLANDS[s.selected].inText),
    },
  },
  actions: {
    [EndocrineAction.Tap]: act({
      describe: "Tap a gland to read its hormone and what it does",
      byLearner: true,
      args: z.object({ gland: z.nativeEnum(Gland) }).strict(),
      run: (s, a) => {
        if (!glandsOf(s.body).includes(a.gland)) return set({});
        return set(
          { selected: a.gland },
          { signal: EndocrineSignal.Picked, payload: { gland: a.gland } },
        );
      },
    }),
    [EndocrineAction.SetBody]: act({
      describe: "Show a male or a female body",
      byLearner: true,
      args: z.object({ body: z.nativeEnum(Body) }).strict(),
      run: (s, a) => {
        const keep = s.selected !== null && glandsOf(a.body).includes(s.selected);
        return set({ body: a.body, selected: keep ? s.selected : null });
      },
    }),
    [EndocrineAction.Clear]: act({
      describe: "Clear the tapped gland",
      byLearner: true,
      args: z.object({}).strict(),
      run: () => set({ selected: null }),
    }),
  },
  signals: {
    [EndocrineSignal.Picked]: { describe: "A gland was tapped; `gland` is which" },
  },
  observe: (s) => ({
    summary: describeEndocrine(s),
    elements: [{ id: EndocrinePart.Card, value: describeEndocrine(s) }],
  }),
  parts: (s) => [EndocrinePart.Body, EndocrinePart.Card, EndocrinePart.Toggle, ...glandsOf(s.body)],
});

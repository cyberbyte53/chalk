import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { pickOne, seedOf } from "../../kit";

type W = { en: string; hi: string };

const SETUPS = {
  tubeA: {
    en: "An iron nail in a corked test tube with some ordinary water (tube A of Activity 3.14)",
    hi: "थोड़े साधारण पानी वाली कॉर्क लगी परखनली में लोहे की कील (क्रियाकलाप 3.14 की परखनली A)",
    rusts: true,
    why: { en: "Both air and water reach the nail.", hi: "हवा और पानी दोनों कील तक पहुँचते हैं।" },
  },
  tubeB: {
    en: "An iron nail in boiled distilled water with a layer of oil on top (tube B)",
    hi: "उबले आसुत पानी में लोहे की कील, ऊपर तेल की परत के साथ (परखनली B)",
    rusts: false,
    why: {
      en: "Boiling removed the air, and the oil keeps air out: water alone isn't enough.",
      hi: "उबालने से हवा निकल गई, और तेल हवा को बाहर रखता है: केवल पानी काफ़ी नहीं।",
    },
  },
  tubeC: {
    en: "An iron nail in a corked tube with anhydrous calcium chloride (tube C)",
    hi: "निर्जल कैल्शियम क्लोराइड वाली कॉर्क लगी परखनली में लोहे की कील (परखनली C)",
    rusts: false,
    why: { en: "The air is dry: air alone isn't enough.", hi: "हवा सूखी है: केवल हवा काफ़ी नहीं।" },
  },
  painted: {
    en: "A painted iron gate left out in the rain",
    hi: "बारिश में खुला पड़ा पेंट किया लोहे का गेट",
    rusts: false,
    why: {
      en: "The paint keeps air and water off the iron.",
      hi: "पेंट हवा और पानी को लोहे से दूर रखता है।",
    },
  },
  galvanisedScratched: {
    en: "A galvanised (zinc-coated) iron bucket with a scratch through the zinc, left in damp air",
    hi: "नम हवा में रखी यशदलेपित (ज़िंक-लेपित) लोहे की बाल्टी, जिसकी ज़िंक परत में खरोंच है",
    rusts: false,
    why: {
      en: "Zinc is more reactive than iron, so it protects the iron even where the coat is broken.",
      hi: "ज़िंक लोहे से अधिक क्रियाशील है, इसलिए परत टूटी होने पर भी लोहे को बचाता है।",
    },
  },
  stainless: {
    en: "A stainless steel spoon left in a wet sink",
    hi: "गीले सिंक में पड़ी स्टेनलेस स्टील की चम्मच",
    rusts: false,
    why: {
      en: "Stainless steel, iron alloyed with nickel and chromium, does not rust.",
      hi: "स्टेनलेस स्टील, निकेल और क्रोमियम के साथ लोहे का मिश्रातु, ज़ंग नहीं खाता।",
    },
  },
  bareChain: {
    en: "A bicycle chain, never oiled, left out through the monsoon",
    hi: "कभी तेल न लगाई साइकिल की चेन, पूरे मानसून बाहर पड़ी",
    rusts: true,
    why: {
      en: "Bare iron with moist air: nothing stops the rusting.",
      hi: "नम हवा के साथ खुला लोहा: ज़ंग को कुछ नहीं रोकता।",
    },
  },
} as const satisfies Record<string, W & { rusts: boolean; why: W }>;
type Setup = keyof typeof SETUPS;

/** Will the iron rust? (Activity 3.14 and section 3.5.1.) */
export const willItRust = family({
  level: Level.Medium,
  tests: [Concept.CorrosionAndAlloys],
  params: z.object({ setup: z.enum(Object.keys(SETUPS) as [Setup, ...Setup[]]) }).strict(),
  build: ({ setup }, b) => {
    const s = SETUPS[setup];
    const yes = t("It rusts", "ज़ंग लगता है");
    const no = t("It doesn't rust", "ज़ंग नहीं लगता");
    const ask = pickOne(b, {
      prompt: t(
        `${s.en}. Will the iron rust in a few days?`,
        `${s.hi}। क्या कुछ दिनों में लोहे में ज़ंग लगेगा?`,
      ),
      right: s.rusts ? yes : no,
      wrong: [{ label: s.rusts ? no : yes, why: t(s.why.en, s.why.hi) }],
      seed: seedOf(setup),
    });
    return column([ask, space()]);
  },
});

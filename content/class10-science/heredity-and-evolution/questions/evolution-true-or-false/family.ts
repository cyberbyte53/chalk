import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { type Option, choiceQuestion, settle } from "@chalk/content-source/patterns";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

const Claim = {
  FromChimps: "fromChimps",
  Pinnacle: "pinnacle",
  Races: "races",
  Africa: "africa",
  EyeStages: "eyeStages",
  Feathers: "feathers",
  Cabbage: "cabbage",
  DnaDistance: "dnaDistance",
  OldDisappears: "oldDisappears",
} as const;
type Claim = (typeof Claim)[keyof typeof Claim];

type L = { en: string; hi: string };
const claims: Record<Claim, { say: L; isTrue: boolean; why: L }> = {
  fromChimps: {
    say: { en: "Human beings evolved from chimpanzees.", hi: "मनुष्य चिंपैंज़ियों से विकसित हुए।" },
    isTrue: false,
    why: {
      en: "Humans and chimpanzees share a common ancestor long ago, probably neither human nor chimpanzee; each line evolved separately.",
      hi: "मनुष्यों और चिंपैंज़ियों का बहुत पहले एक साझा पूर्वज था, शायद न मनुष्य न चिंपैंज़ी; हर शाखा अलग विकसित हुई।",
    },
  },
  pinnacle: {
    say: {
      en: "Human beings are the pinnacle (the top) of evolution.",
      hi: "मनुष्य जैव विकास का शिखर हैं।",
    },
    isTrue: false,
    why: {
      en: "Evolution is a branching tree, not a ladder. Humans are just one more species; simple bacteria thrive in the harshest places.",
      hi: "विकास शाखाओं वाला पेड़ है, सीढ़ी नहीं। मनुष्य बस एक और स्पीशीज़ हैं; सरल जीवाणु सबसे कठोर जगहों में फलते-फूलते हैं।",
    },
  },
  races: {
    say: {
      en: "People who look very different belong to different biological races.",
      hi: "बहुत अलग दिखने वाले लोग अलग जैविक नस्लों के हैं।",
    },
    isTrue: false,
    why: {
      en: "There is no biological basis to human races. All humans are a single species.",
      hi: "मानव नस्लों का कोई जैविक आधार नहीं। सारे मनुष्य एक ही स्पीशीज़ हैं।",
    },
  },
  africa: {
    say: {
      en: "The earliest members of Homo sapiens can be traced to Africa.",
      hi: "होमो सेपियंस के सबसे पहले सदस्य अफ़्रीका तक खोजे जा सकते हैं।",
    },
    isTrue: true,
    why: {
      en: "Our genetic footprints all trace back to Africa; some ancestors left it and slowly spread across the planet.",
      hi: "हमारे आनुवंशिक पदचिह्न सब अफ़्रीका तक जाते हैं; कुछ पूर्वज वहाँ से निकले और धीरे-धीरे धरती भर फैले।",
    },
  },
  eyeStages: {
    say: {
      en: "Even a simple eye-spot that only detects light can give an advantage.",
      hi: "केवल प्रकाश पहचानने वाला सरल नेत्र-बिंदु भी लाभ दे सकता है।",
    },
    isTrue: true,
    why: {
      en: "Planaria's eye-spots are useful already. That's how complex organs like the eye can be built up in stages.",
      hi: "प्लेनेरिया के नेत्र-बिंदु पहले से काम के हैं। इसी तरह आँख जैसे जटिल अंग चरणों में बन सकते हैं।",
    },
  },
  feathers: {
    say: {
      en: "Feathers first evolved for flying.",
      hi: "पंख सबसे पहले उड़ने के लिए विकसित हुए।",
    },
    isTrue: false,
    why: {
      en: "Feathers probably began as insulation; some dinosaurs had feathers but couldn't fly. Birds later adapted them for flight.",
      hi: "पंख शायद गर्मी बचाने के लिए शुरू हुए; कुछ डायनासोर के पंख थे पर वे उड़ नहीं सकते थे। पक्षियों ने बाद में उन्हें उड़ान के लिए अपनाया।",
    },
  },
  cabbage: {
    say: {
      en: "Cabbage, broccoli and cauliflower were all bred by people from wild cabbage.",
      hi: "पत्तागोभी, ब्रोकली और फूलगोभी सब मनुष्यों ने जंगली गोभी से बनाईं।",
    },
    isTrue: true,
    why: {
      en: "Over 2000 years farmers selected different features of the same wild plant: artificial selection.",
      hi: "2000 सालों में किसानों ने एक ही जंगली पौधे की अलग विशेषताओं का चयन किया: कृत्रिम चयन।",
    },
  },
  dnaDistance: {
    say: {
      en: "The more closely two species are related, the more differences there are in their DNA.",
      hi: "दो स्पीशीज़ जितनी क़रीबी संबंधित हों, उनके DNA में उतने ज़्यादा अंतर होते हैं।",
    },
    isTrue: false,
    why: {
      en: "It's the other way round: differences pile up over time, so more distantly related species differ more.",
      hi: "उल्टा है: अंतर समय के साथ जमा होते हैं, इसलिए दूर के संबंधियों में ज़्यादा अंतर होते हैं।",
    },
  },
  oldDisappears: {
    say: {
      en: "When a new species arises, the old one must disappear.",
      hi: "नई स्पीशीज़ बनने पर पुरानी को मिटना ही पड़ता है।",
    },
    isTrue: false,
    why: {
      en: "Not necessarily: whether the old species survives depends on the environment. Both can carry on.",
      hi: "ज़रूरी नहीं: पुरानी स्पीशीज़ बचती है या नहीं, यह परिवेश पर निर्भर है। दोनों चल सकती हैं।",
    },
  },
};

/** NCERT 9.5.3–9.6: true or false about evolution by stages, "progress" and human evolution. */
export const evolutionTrueOrFalse = family({
  level: Level.Medium,
  tests: [Concept.EvolutionByStages],
  params: z.object({ claim: z.nativeEnum(Claim) }).strict(),
  build: ({ claim }, b) => {
    const k = claims[claim];
    const options: Option[] = [
      k.isTrue
        ? { id: "right", label: t("True", "सही") }
        : { id: "true", label: t("True", "सही"), feedback: k.why },
      k.isTrue
        ? { id: "false", label: t("False", "ग़लत"), feedback: k.why }
        : { id: "right", label: t("False", "ग़लत") },
    ];
    const ask = choiceQuestion(b, {
      prompt: t(`True or false? ${k.say.en}`, `सही या ग़लत? ${k.say.hi}`),
      options: settle(options, claim.length * 2 + 7),
      answer: "right",
    });
    return column([ask, space()]);
  },
});

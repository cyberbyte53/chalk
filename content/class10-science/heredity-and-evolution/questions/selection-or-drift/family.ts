import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { type Option, choiceQuestion, settle } from "@chalk/patterns";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

const Case = {
  GreenBeetles: "greenBeetles",
  BlueElephant: "blueElephant",
  Starving: "starving",
  HeatBacteria: "heatBacteria",
  Flood: "flood",
  Tails: "tails",
} as const;
type Case = (typeof Case)[keyof typeof Case];

const Answer = { Selection: "selection", Drift: "drift", Neither: "neither" } as const;
type Answer = (typeof Answer)[keyof typeof Answer];

type L = { en: string; hi: string };
const cases: Record<Case, { story: L; answer: Answer; why: L }> = {
  greenBeetles: {
    story: {
      en: "On green bushes, crows eat red beetles but can't see green ones. Over generations, green beetles become common.",
      hi: "हरी झाड़ियों पर कौए लाल भृंग खाते हैं पर हरे नहीं देख पाते। पीढ़ियों में हरे भृंग आम हो जाते हैं।",
    },
    answer: Answer.Selection,
    why: {
      en: "Green gives a survival advantage against the crows: that's natural selection.",
      hi: "हरा रंग कौओं से बचने का लाभ देता है: यह प्राकृतिक वरण है।",
    },
  },
  blueElephant: {
    story: {
      en: "Crows see blue beetles as easily as red ones. An elephant tramples the bush; by chance most survivors are blue, and blue becomes common.",
      hi: "कौए नीले भृंग भी लाल जितनी आसानी से देखते हैं। एक हाथी झाड़ी रौंद देता है; संयोग से ज़्यादातर बचे भृंग नीले हैं, और नीला आम हो जाता है।",
    },
    answer: Answer.Drift,
    why: {
      en: "Blue gave no advantage; an accident in a small population changed the shares. That's genetic drift.",
      hi: "नीले ने कोई लाभ नहीं दिया; छोटी आबादी में एक दुर्घटना ने हिस्से बदले। यह आनुवंशिक अपवाह है।",
    },
  },
  starving: {
    story: {
      en: "For a few years food is scarce and the beetles are small. When food returns, the next beetles grow to normal size.",
      hi: "कुछ साल भोजन कम रहता है और भृंग छोटे रहते हैं। भोजन लौटने पर अगले भृंग सामान्य आकार के होते हैं।",
    },
    answer: Answer.Neither,
    why: {
      en: "Being small from hunger was acquired, not inherited; no gene changed, so this isn't evolution at all.",
      hi: "भूख से छोटा होना उपार्जित था, वंशानुगत नहीं; कोई जीन नहीं बदला, इसलिए यह जैव विकास है ही नहीं।",
    },
  },
  heatBacteria: {
    story: {
      en: "During a heat wave, only bacteria with a variation that lets them stand heat survive, and their kind takes over.",
      hi: "लू के दौरान केवल वे जीवाणु बचते हैं जिनमें गर्मी सहने की विभिन्नता है, और उनकी तरह के छा जाते हैं।",
    },
    answer: Answer.Selection,
    why: {
      en: "The heat-tolerance variation gives a survival advantage: natural selection.",
      hi: "गर्मी सहने की विभिन्नता बचे रहने का लाभ देती है: प्राकृतिक वरण।",
    },
  },
  flood: {
    story: {
      en: "A flood drowns most of a small group of snails at random. The few left happen to have striped shells, and stripes become common.",
      hi: "एक बाढ़ घोंघों के एक छोटे समूह के ज़्यादातर सदस्यों को बिना चुने डुबो देती है। बचे थोड़ों के खोल संयोग से धारीदार हैं, और धारियाँ आम हो जाती हैं।",
    },
    answer: Answer.Drift,
    why: {
      en: "Stripes didn't help them survive the flood; chance did. In a small population, that's drift.",
      hi: "धारियों ने उन्हें बाढ़ से नहीं बचाया; संयोग ने बचाया। छोटी आबादी में यह अपवाह है।",
    },
  },
  tails: {
    story: {
      en: "The tails of mice are cut off in every generation for years. Their young are still born with tails.",
      hi: "सालों तक हर पीढ़ी में चूहों की पूँछ काटी जाती है। उनकी संतान फिर भी पूँछ के साथ पैदा होती है।",
    },
    answer: Answer.Neither,
    why: {
      en: "Cutting a tail can't change the genes in the germ cells. An acquired change isn't inherited.",
      hi: "पूँछ काटने से जनन कोशिकाओं के जीन नहीं बदलते। उपार्जित बदलाव वंशानुगत नहीं होता।",
    },
  },
};

const labels: Record<Answer, L> = {
  selection: { en: "Natural selection for small size", hi: "छोटे आकार के लिए प्राकृतिक वरण" },
  drift: { en: "Genetic drift in a small group", hi: "छोटे समूह में आनुवंशिक विचलन" },
  neither: { en: "Neither: no inherited change", hi: "कोई नहीं: कोई वंशानुगत बदलाव नहीं" },
};

/** NCERT 9.3.1–9.3.2: selection, drift, or an acquired change that isn't evolution. */
export const selectionOrDrift = family({
  level: Level.Medium,
  tests: [Concept.NaturalSelectionAndDrift],
  params: z.object({ case: z.nativeEnum(Case) }).strict(),
  build: ({ case: c }, b) => {
    const k = cases[c];
    const options: Option[] = (Object.values(Answer) as Answer[]).map((a) =>
      a === k.answer
        ? { id: "right", label: t(labels[a].en, labels[a].hi) }
        : { id: a, label: t(labels[a].en, labels[a].hi), feedback: k.why },
    );
    const ask = choiceQuestion(b, {
      prompt: t(`${k.story.en} What is at work here?`, `${k.story.hi} यहाँ क्या काम कर रहा है?`),
      options: settle(options, c.length * 9 + 1),
      answer: "right",
    });
    return column([ask, space()]);
  },
});

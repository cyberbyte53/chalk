import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { type Option, choiceQuestion, settle } from "@chalk/content-source/patterns";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

const Case = {
  River: "river",
  Migrant: "migrant",
  Colours: "colours",
  SelfPollinating: "selfPollinating",
  Chromosomes: "chromosomes",
  Behaviour: "behaviour",
} as const;
type Case = (typeof Case)[keyof typeof Case];

type L = { en: string; hi: string };
const cases: Record<Case, { q: L; right: L; wrong: [L, L]; why: L }> = {
  river: {
    q: {
      en: "A new river splits a beetle population in two. Why does this make speciation more likely?",
      hi: "एक नई नदी भृंगों की आबादी को दो में बाँट देती है। इससे जाति-उद्भवन की संभावना क्यों बढ़ती है?",
    },
    right: {
      en: "It stops gene flow between the two groups",
      hi: "यह दोनों समूहों के बीच जीन प्रवाह रोकती है",
    },
    wrong: [
      { en: "River water changes their DNA", hi: "नदी का पानी उनका DNA बदलता है" },
      { en: "Beetles decide to become different", hi: "भृंग अलग होने का फ़ैसला करते हैं" },
    ],
    why: {
      en: "Cut off, the two groups no longer mix genes, so drift and selection carry each its own way.",
      hi: "कटकर दोनों समूह जीन नहीं मिलाते, इसलिए अपवाह और वरण हर एक को अपनी राह ले जाते हैं।",
    },
  },
  migrant: {
    q: {
      en: "A crow drops a beetle from one hill onto another, where it breeds. This is…",
      hi: "एक कौआ एक पहाड़ी का भृंग दूसरी पर गिरा देता है, जहाँ वह जनन करता है। यह है…",
    },
    right: { en: "gene flow", hi: "जीन प्रवाह" },
    wrong: [
      { en: "speciation", hi: "जाति-उद्भवन" },
      { en: "an acquired trait", hi: "एक उपार्जित लक्षण" },
    ],
    why: {
      en: "The migrant's genes enter the new population: gene flow, which keeps the two groups alike.",
      hi: "प्रवासी के जीन नई आबादी में आते हैं: जीन प्रवाह, जो दोनों समूहों को एक जैसा रखता है।",
    },
  },
  colours: {
    q: {
      en: "Red and green beetles in the same bush still breed with each other. Are they two species?",
      hi: "एक ही झाड़ी के लाल और हरे भृंग अब भी आपस में जनन करते हैं। क्या वे दो स्पीशीज़ हैं?",
    },
    right: { en: "No: they can still reproduce together", hi: "नहीं: वे अब भी साथ जनन कर सकते हैं" },
    wrong: [
      { en: "Yes: they look different from each other", hi: "हाँ: वे एक-दूसरे से अलग दिखते हैं" },
      {
        en: "Yes: one of them is better adapted to the bush",
        hi: "हाँ: उनमें से एक झाड़ी के लिए अधिक अनुकूलित है",
      },
    ],
    why: {
      en: "Looking different isn't enough. Two species are groups that can't reproduce with each other.",
      hi: "अलग दिखना काफ़ी नहीं। दो स्पीशीज़ वे समूह हैं जो आपस में जनन न कर सकें।",
    },
  },
  selfPollinating: {
    q: {
      en: "Will geographical isolation be a major factor in the speciation of a self-pollinating plant?",
      hi: "क्या भौगोलिक अलगाव स्व-परागण करने वाले पौधे के जाति-उद्भवन में बड़ा कारक होगा?",
    },
    right: {
      en: "No: it hardly exchanges genes with others anyway",
      hi: "नहीं: वह वैसे भी दूसरों से जीन कम ही बदलता है",
    },
    wrong: [
      {
        en: "Yes: isolation always matters most for every species",
        hi: "हाँ: हर जाति के लिए अलगाव ही सबसे अहम है",
      },
      {
        en: "Yes: plants can't cross rivers or mountains",
        hi: "हाँ: पौधे नदी या पहाड़ पार नहीं कर सकते",
      },
    ],
    why: {
      en: "Isolation matters by stopping gene flow. A self-pollinating plant has little gene flow to stop.",
      hi: "अलगाव जीन प्रवाह रोककर मायने रखता है। स्व-परागण करने वाले पौधे में रोकने लायक़ जीन प्रवाह कम है।",
    },
  },
  chromosomes: {
    q: {
      en: "The number of chromosomes changes in one isolated beetle group. Why might that make a new species?",
      hi: "एक अलग भृंग समूह में गुणसूत्रों की संख्या बदल जाती है। इससे नई स्पीशीज़ क्यों बन सकती है?",
    },
    right: {
      en: "Its germ cells may no longer fuse with the other group's",
      hi: "इसकी जनन कोशिकाएँ शायद दूसरे समूह की कोशिकाओं से न मिल सकें",
    },
    wrong: [
      {
        en: "More chromosomes make its beetles stronger than the others",
        hi: "अधिक गुणसूत्र इसके भृंगों को दूसरों से ताकतवर बनाते हैं",
      },
      {
        en: "It changes the beetles' colour so crows can't see them",
        hi: "यह भृंगों का रंग बदल देता है ताकि कौए उन्हें न देखें",
      },
    ],
    why: {
      en: "If the DNA changes are severe enough, like a different chromosome number, the two groups' germ cells can't fuse: they can't interbreed.",
      hi: "अगर DNA के बदलाव काफ़ी बड़े हों, जैसे गुणसूत्रों की अलग संख्या, तो दोनों समूहों की जनन कोशिकाएँ मिल नहीं पातीं: वे आपस में जनन नहीं कर सकते।",
    },
  },
  behaviour: {
    q: {
      en: "Green females start mating only with green males. A red male from another group can't breed with them. This is…",
      hi: "हरी मादाएँ केवल हरे नरों से जनन करने लगती हैं। दूसरे समूह का लाल नर उनसे जनन नहीं कर पाता। यह है…",
    },
    right: {
      en: "a behaviour that stops interbreeding",
      hi: "अंतःप्रजनन रोकने वाला एक व्यवहार",
    },
    wrong: [
      { en: "gene flow that mixes the two groups", hi: "दोनों समूहों को मिलाने वाला जीन प्रवाह" },
      { en: "an acquired trait picked up in life", hi: "जीवन में प्राप्त एक उपार्जित लक्षण" },
    ],
    why: {
      en: "A new mating behaviour stops reproduction between the groups: effectively, new species are forming.",
      hi: "जनन का एक नया व्यवहार समूहों के बीच जनन रोकता है: असल में नई स्पीशीज़ बन रही हैं।",
    },
  },
};

/** NCERT 9.4: gene flow, isolation, and what makes a new species. */
export const speciationCheck = family({
  level: Level.Medium,
  tests: [Concept.Speciation],
  params: z.object({ case: z.nativeEnum(Case) }).strict(),
  build: ({ case: c }, b) => {
    const k = cases[c];
    const options: Option[] = [
      { id: "right", label: t(k.right.en, k.right.hi) },
      ...k.wrong.map((w, i) => ({ id: `w${i}`, label: t(w.en, w.hi), feedback: k.why })),
    ];
    const ask = choiceQuestion(b, {
      prompt: t(k.q.en, k.q.hi),
      options: settle(options, c.length * 5 + 9),
      answer: "right",
    });
    return column([ask, space()]);
  },
});

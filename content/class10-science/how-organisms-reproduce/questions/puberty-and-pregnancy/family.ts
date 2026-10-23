import { family } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Choice, askChoice, seedOf } from "../../kit";

const CASES = ["girls", "puberty", "fertilisation", "placenta", "implant", "birth"] as const;
type Case = (typeof CASES)[number];

const choices: Record<Case, Choice> = {
  girls: {
    prompt: {
      en: "Which change at puberty does the textbook describe in girls?",
      hi: "पाठ्यपुस्तक यौवनारंभ में लड़कियों के किस बदलाव का वर्णन करती है?",
    },
    right: {
      en: "Breasts develop and menstruation begins",
      hi: "स्तन विकसित होते हैं और रजोधर्म शुरू होता है",
    },
    wrong: [
      {
        en: "The voice begins to crack and becomes much deeper",
        hi: "आवाज़ फटने लगती है और बहुत भारी हो जाती है",
      },
      { en: "Height stops changing at once", hi: "लंबाई तुरंत बढ़ना बंद हो जाती है" },
    ],
    why: {
      en: "In girls, breast size increases, the nipples darken and menstruation begins; the voice cracking is described in boys.",
      hi: "लड़कियों में स्तन बढ़ते हैं, चूचुक गहरे होते हैं और ऋतुस्राव शुरू होता है; आवाज़ फटना लड़कों में बताया गया है।",
    },
  },
  puberty: {
    prompt: {
      en: "The period in adolescence when reproductive tissues begin to mature is called:",
      hi: "किशोरावस्था का वह समय जब जनन ऊतक परिपक्व होने लगते हैं, कहलाता है:",
    },
    right: { en: "Puberty", hi: "यौवनारंभ" },
    wrong: [
      { en: "Germination", hi: "अंकुरण" },
      { en: "Regeneration", hi: "पुनर्जनन" },
    ],
    why: {
      en: "As general body growth slows, reproductive tissues begin to mature: this period is puberty.",
      hi: "सामान्य वृद्धि धीमी होने पर जनन ऊतक परिपक्व होने लगते हैं: यह समय यौवनारंभ है।",
    },
  },
  fertilisation: {
    prompt: {
      en: "In human beings, where does fertilisation take place?",
      hi: "मनुष्य में निषेचन कहाँ होता है?",
    },
    right: { en: "In the oviduct (fallopian tube)", hi: "अंडवाहिनी (फ़ैलोपियन नलिका) में" },
    wrong: [
      { en: "In the ovary, where eggs form", hi: "अंडाशय में, जहाँ अंडाणु बनते हैं" },
      { en: "In the vagina", hi: "योनि में" },
    ],
    why: {
      en: "Sperms travel up and reach the oviduct, where they may meet the egg.",
      hi: "शुक्राणु ऊपर जाकर अंडवाहिनी तक पहुँचते हैं, जहाँ वे अंड से मिल सकते हैं।",
    },
  },
  placenta: {
    prompt: {
      en: "How does the embryo get nourishment inside the mother's body?",
      hi: "माँ के शरीर में भ्रूण को पोषण कैसे मिलता है?",
    },
    right: { en: "Through the placenta, from the mother's blood", hi: "अपरा के ज़रिए, माँ के रुधिर से" },
    wrong: [
      {
        en: "By swallowing the fluid around it through its mouth",
        hi: "अपने चारों ओर का तरल मुँह से निगलकर",
      },
      { en: "Only from the egg's own store", hi: "केवल अंड के अपने भंडार से" },
    ],
    why: {
      en: "The placenta, with villi and blood spaces, gives a large surface for glucose and oxygen to pass from mother to embryo.",
      hi: "अपरा, दीर्घरोमों और रुधिर स्थानों के साथ, माँ से भ्रूण तक ग्लूकोज़ और ऑक्सीजन जाने के लिए बड़ी सतह देती है।",
    },
  },
  implant: {
    prompt: { en: "Where is the embryo implanted?", hi: "भ्रूण कहाँ रोपित होता है?" },
    right: { en: "In the lining of the uterus", hi: "गर्भाशय की भित्ति में" },
    wrong: [
      { en: "In the ovary, where eggs form", hi: "अंडाशय में, जहाँ अंडाणु बनते हैं" },
      { en: "In the oviduct, near the ovary", hi: "अंडवाहिनी में, अंडाशय के पास" },
    ],
    why: {
      en: "The embryo is implanted in the thickened lining of the uterus, where it grows and develops organs.",
      hi: "भ्रूण गर्भाशय की मोटी भित्ति में रोपित होता है, जहाँ वह बढ़कर अंग विकसित करता है।",
    },
  },
  birth: {
    prompt: {
      en: "About how long does the child develop inside the mother's body, and how is it born?",
      hi: "शिशु माँ के शरीर में लगभग कितने समय विकसित होता है, और उसका जन्म कैसे होता है?",
    },
    right: {
      en: "About nine months; by rhythmic contractions of the uterus muscles",
      hi: "लगभग नौ महीने; गर्भाशय की पेशियों के लयबद्ध संकुचन से",
    },
    wrong: [
      { en: "About nine weeks; by the placenta pushing", hi: "लगभग नौ हफ़्ते; अपरा के धकेलने से" },
      {
        en: "About nine weeks; by the ovary slowly releasing it from inside",
        hi: "लगभग नौ सप्ताह; अंडाशय द्वारा उसे धीरे-धीरे भीतर से छोड़ने से",
      },
    ],
    why: {
      en: "Development takes approximately nine months, and the child is born as a result of rhythmic contractions of the uterus muscles.",
      hi: "विकास में लगभग नौ महीने लगते हैं, और गर्भाशय की पेशियों के लयबद्ध संकुचन से शिशु का जन्म होता है।",
    },
  },
};

/** NCERT 8.3.3 and in-text questions 3 and 4: puberty, where fertilisation happens, implantation, the placenta and birth. */
export const pubertyAndPregnancy = family({
  level: Level.Medium,
  tests: [Concept.HumanReproduction],
  params: z.object({ case: z.enum(CASES) }).strict(),
  build: ({ case: c }, b) => askChoice(b, choices[c], seedOf(CASES, c)),
});

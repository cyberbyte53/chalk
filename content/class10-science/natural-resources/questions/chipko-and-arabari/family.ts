import { family } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Choice, askChoice, seedOf } from "../../kit";

const CASES = ["chipko", "reni", "arabari", "worth", "bishnoi"] as const;
type Case = (typeof CASES)[number];

const choices: Record<Case, Choice> = {
  chipko: {
    prompt: {
      en: "In the Chipko Andolan, women stopped the felling by…",
      hi: "चिपको आंदोलन में महिलाओं ने पेड़ कटाई कैसे रोकी?",
    },
    right: { en: "Hugging the trees", hi: "पेड़ों से चिपककर" },
    wrong: [
      { en: "Buying the forest", hi: "जंगल ख़रीदकर" },
      { en: "Planting new saplings", hi: "नए पौधे लगाकर" },
    ],
    why: {
      en: "They hugged the trees so the contractor's workers could not fell them.",
      hi: "उन्होंने पेड़ों से चिपककर ठेकेदार के मज़दूरों को काटने नहीं दिया।",
    },
  },
  reni: {
    prompt: {
      en: "The Chipko Andolan began in Reni, a village in…",
      hi: "चिपको आंदोलन रेनी गाँव से शुरू हुआ, जो कहाँ है?",
    },
    right: { en: "Garhwal, in the Himalayas", hi: "गढ़वाल, हिमालय में" },
    wrong: [
      { en: "The Thar desert of Rajasthan", hi: "राजस्थान के थार मरुस्थल में" },
      { en: "The sal forests of Bengal", hi: "बंगाल के साल वनों में" },
    ],
    why: {
      en: "Reni is high up in Garhwal, in the Himalayas; it began in the early 1970s.",
      hi: "रेनी हिमालय में गढ़वाल में ऊँचाई पर है; यह 1970 के दशक की शुरुआत में हुआ।",
    },
  },
  arabari: {
    prompt: {
      en: "In Arabari, villagers protected the sal forest in return for…",
      hi: "अराबाड़ी में गाँव वालों ने साल वन की रक्षा किसके बदले की?",
    },
    right: { en: "Work and a share of the harvest", hi: "काम और उपज में हिस्सा" },
    wrong: [
      { en: "Free land in the nearest city", hi: "पास के शहर में मुफ़्त ज़मीन" },
      { en: "Being paid to cut the old trees", hi: "पुराने पेड़ काटने के पैसे" },
    ],
    why: {
      en: "They got employment and a 25% share of the final harvest, and could collect firewood and fodder.",
      hi: "उन्हें काम और अंतिम उपज का 25% हिस्सा मिला, और वे जलावन और चारा ले सकते थे।",
    },
  },
  worth: {
    prompt: {
      en: "By 1983 the once-worthless Arabari forest was…",
      hi: "1983 तक अराबाड़ी का बेकार माना गया वन…",
    },
    right: { en: "Worth about 12.5 crore rupees", hi: "लगभग 12.5 करोड़ रुपये का था" },
    wrong: [
      { en: "Cleared for a large paper mill", hi: "एक बड़ी पेपर मिल के लिए साफ़ हो चुका था" },
      { en: "Turned into a teak plantation", hi: "सागौन का बाग़ान बन चुका था" },
    ],
    why: {
      en: "With the villagers' help the sal forest recovered and was valued at ₹12.5 crore.",
      hi: "गाँव वालों की मदद से साल वन फिर से पनपा और ₹12.5 करोड़ का आँका गया।",
    },
  },
  bishnoi: {
    prompt: {
      en: "Amrita Devi Bishnoi is remembered for…",
      hi: "अमृता देवी बिश्नोई को किसलिए याद किया जाता है?",
    },
    right: {
      en: "Giving her life to protect khejri trees",
      hi: "खेजड़ी के पेड़ बचाने के लिए जान देने के लिए",
    },
    wrong: [
      {
        en: "Starting the very first paper mill in India",
        hi: "भारत की सबसे पहली पेपर मिल शुरू करने के लिए",
      },
      { en: "Building check dams across Rajasthan", hi: "पूरे राजस्थान में रोक बाँध बनाने के लिए" },
    ],
    why: {
      en: "In 1731 she and 363 others gave their lives protecting khejri trees.",
      hi: "1731 में उन्होंने और 363 अन्य लोगों ने खेजड़ी के पेड़ बचाते हुए जान दी।",
    },
  },
};

/** NCERT 16.2.1: the Bishnois, Chipko Andolan and Arabari. */
export const chipkoAndArabari = family({
  level: Level.Medium,
  tests: [Concept.ManagingForestsWithPeople],
  params: z.object({ case: z.enum(CASES) }).strict(),
  build: ({ case: c }, b) => askChoice(b, choices[c], seedOf(CASES, c)),
});

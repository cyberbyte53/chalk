import { family, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Item, itemBoard, seedOf } from "../../quiz";

const items = {
  change: {
    prompt: t("A windmill changes…", "पवनचक्की बदलती है…"),
    right: t("the kinetic energy of wind into rotation", "पवन की गतिज ऊर्जा को घूर्णन में"),
    wrong: [
      {
        label: t("the heat of the air into chemical energy", "हवा की ऊष्मा को रासायनिक ऊर्जा में"),
        feedback: t(
          "Moving air pushes the blades: kinetic energy becomes rotation.",
          "चलती हवा पंखुड़ियाँ धकेलती है: गतिज ऊर्जा घूर्णन बनती है।",
        ),
      },
      {
        label: t("the light of the Sun into electric charge", "सूर्य के प्रकाश को विद्युत आवेश में"),
        feedback: t(
          "That's a solar cell. A windmill uses moving air.",
          "वह सौर सेल है। पवनचक्की चलती हवा का उपयोग करती है।",
        ),
      },
    ],
  },
  speed: {
    prompt: t(
      "For a wind generator to keep working, the wind speed should be above about…",
      "पवन जनित्र चलता रहे, इसके लिए पवन की चाल लगभग किससे ऊपर होनी चाहिए?",
    ),
    right: t("15 km/h", "15 km/h"),
    wrong: [
      {
        label: t("1 km/h", "1 km/h"),
        feedback: t(
          "That's barely a breeze; the blades won't turn usefully.",
          "यह मुश्किल से हवा है; पंखुड़ियाँ ठीक से नहीं घूमेंगी।",
        ),
      },
      {
        label: t("150 km/h", "150 km/h"),
        feedback: t(
          "That's a cyclone. About 15 km/h is enough.",
          "यह चक्रवात है। लगभग 15 km/h काफ़ी है।",
        ),
      },
    ],
  },
  limit: {
    prompt: t(
      "What is a limitation of wind energy? (Exercise 6a)",
      "पवन ऊर्जा की एक सीमा क्या है? (अभ्यास 6a)",
    ),
    right: t(
      "It needs steady wind, much land, and backup when the wind drops",
      "इसे स्थिर हवा, बहुत ज़मीन और हवा रुकने पर सहारा चाहिए",
    ),
    wrong: [
      {
        label: t(
          "It gives off smoke and greenhouse gases while the blades turn",
          "पंखुड़ियाँ घूमते समय यह धुआँ और ग्रीनहाउस गैसें छोड़ती है",
        ),
        feedback: t(
          "Wind energy is pollution-free while running.",
          "पवन ऊर्जा चलते समय प्रदूषण-मुक्त है।",
        ),
      },
      {
        label: t(
          "It will run out within a few years, once the wind is all used up",
          "कुछ वर्षों में ख़त्म हो जाएगी, जब सारी हवा उपयोग हो जाएगी",
        ),
        feedback: t(
          "Wind is renewable: the Sun keeps making it.",
          "पवन नवीकरणीय है: सूर्य इसे बनाता रहता है।",
        ),
      },
    ],
  },
  sun: {
    prompt: t(
      "Where does the energy of wind come from in the end?",
      "पवन की ऊर्जा अंततः कहाँ से आती है?",
    ),
    right: t("The Sun heating land and sea unequally", "सूर्य द्वारा स्थल और समुद्र का असमान तापन"),
    wrong: [
      {
        label: t("The Moon pulling on the air above us", "चंद्रमा का हमारे ऊपर की हवा को खींचना"),
        feedback: t("The Moon causes tides, not winds.", "चंद्रमा ज्वार लाता है, पवन नहीं।"),
      },
      {
        label: t("Heat rising from deep inside the earth", "पृथ्वी के गहरे भीतर से उठती ऊष्मा"),
        feedback: t(
          "That's geothermal energy. Winds come from the Sun.",
          "वह भूतापीय ऊर्जा है। पवन सूर्य से आती है।",
        ),
      },
    ],
  },
} satisfies Record<string, Item>;

type Key = keyof typeof items;

/** Wind energy and its limits (NCERT 14.2.4; Exercise 6a). */
export const windFacts = family({
  level: Level.Easy,
  tests: [Concept.WindEnergy],
  params: z.object({ item: z.enum(Object.keys(items) as [Key, ...Key[]]) }).strict(),
  build: ({ item }, b) => itemBoard(b, items[item], seedOf(item)),
});

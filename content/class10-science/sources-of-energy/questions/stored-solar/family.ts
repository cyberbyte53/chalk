import { family, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Item, itemBoard, seedOf } from "../../quiz";

const items = {
  notSun: {
    prompt: t(
      "Which source is NOT ultimately from the Sun? (Exercise 3)",
      "कौन-सा स्रोत अंततः सूर्य से नहीं है? (अभ्यास 3)",
    ),
    right: t("Geothermal energy", "भूतापीय ऊर्जा"),
    wrong: [
      {
        label: t("Wind energy", "पवन ऊर्जा"),
        feedback: t("Wind comes from the Sun's unequal heating.", "पवन सूर्य के असमान तापन से आती है।"),
      },
      {
        label: t("Biomass from forests", "जंगलों की जैव मात्रा"),
        feedback: t("Plants grew using sunlight.", "पौधे धूप से उगे।"),
      },
    ],
  },
  coal: {
    prompt: t("Why is coal called stored solar energy?", "कोयले को संचित सौर ऊर्जा क्यों कहते हैं?"),
    right: t(
      "It formed from ancient plants that grew in sunlight",
      "यह उन प्राचीन पौधों से बना जो धूप से उगे थे",
    ),
    wrong: [
      {
        label: t(
          "It is mined from the places that get the most sunshine",
          "इसे उन जगहों से खोदा जाता है जहाँ सबसे ज़्यादा धूप आती है",
        ),
        feedback: t(
          "Where it's mined doesn't matter; its plants used sunlight.",
          "कहाँ खोदा जाता है, फ़र्क़ नहीं; उसके पौधों ने धूप ली।",
        ),
      },
      {
        label: t(
          "It is black, so it soaks up sunlight in the mine",
          "यह काला है, इसलिए खदान में धूप सोखता है",
        ),
        feedback: t(
          "There's no sunlight in a mine; its energy came from ancient plants.",
          "खदान में धूप नहीं; इसकी ऊर्जा प्राचीन पौधों से आई।",
        ),
      },
    ],
  },
  hydro: {
    prompt: t("How is hydro energy linked to the Sun?", "जल ऊर्जा सूर्य से कैसे जुड़ी है?"),
    right: t(
      "The Sun evaporates water that rains into dams",
      "सूर्य पानी वाष्पित करता है जो बारिश बनकर बाँधों में गिरता है",
    ),
    wrong: [
      {
        label: t(
          "The Sun's heat makes the water in dams flow uphill",
          "सूर्य की ऊष्मा बाँधों का पानी ऊपर की ओर बहाती है",
        ),
        feedback: t(
          "Water flows down. The Sun's role is in the rain.",
          "पानी नीचे बहता है। सूर्य की भूमिका बारिश में है।",
        ),
      },
      {
        label: t(
          "It isn't linked; the Moon fills the dams each day",
          "यह जुड़ी नहीं है; चंद्रमा हर दिन बाँध भरता है",
        ),
        feedback: t(
          "The Moon causes tides, not rain. The Sun drives the water cycle.",
          "चंद्रमा ज्वार लाता है, बारिश नहीं। सूर्य जल चक्र चलाता है।",
        ),
      },
    ],
  },
  tidal: {
    prompt: t(
      "Tidal energy is different from most sources because it comes from…",
      "ज्वारीय ऊर्जा अधिकतर स्रोतों से अलग है क्योंकि यह आती है…",
    ),
    right: t("the Moon's pull", "चंद्रमा के खिंचाव से"),
    wrong: [
      {
        label: t("the Sun's light", "सूर्य के प्रकाश से"),
        feedback: t("Tides are raised mainly by the Moon.", "ज्वार मुख्यतः चंद्रमा उठाता है।"),
      },
      {
        label: t("the earth's heat", "पृथ्वी की ऊष्मा से"),
        feedback: t(
          "That's geothermal. Tides come from the Moon.",
          "वह भूतापीय है। ज्वार चंद्रमा से आते हैं।",
        ),
      },
    ],
  },
} satisfies Record<string, Item>;

type Key = keyof typeof items;

/** Which sources are stored solar energy (Activity 14.7; Exercise 3). */
export const storedSolar = family({
  level: Level.Easy,
  tests: [Concept.EnvironmentAndHowLong],
  params: z.object({ item: z.enum(Object.keys(items) as [Key, ...Key[]]) }).strict(),
  build: ({ item }, b) => itemBoard(b, items[item], seedOf(item)),
});

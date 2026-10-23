import { family, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Fact, askFact, factParams } from "../../kit";

const facts = {
  starHigher: {
    prompt: t(
      "Compared with its actual position, a star near the horizon appears…",
      "अपनी असली स्थिति की तुलना में क्षितिज के पास का तारा दिखता है…",
    ),
    right: t("slightly higher", "थोड़ा ऊपर"),
    wrong: [
      {
        label: t("slightly lower", "थोड़ा नीचे"),
        feedback: t(
          "Starlight bends down towards the normal as it enters denser air; traced back, it points higher.",
          "सघन हवा में आते हुए तारे का प्रकाश अभिलंब की ओर नीचे मुड़ता है; पीछे ले जाने पर वह ऊपर की ओर इंगित करता है।",
        ),
      },
      {
        label: t("exactly where it is", "ठीक वहीं"),
        feedback: t(
          "Only with no air. The atmosphere bends starlight.",
          "केवल बिना हवा के। वायुमंडल तारे के प्रकाश को मोड़ता है।",
        ),
      },
    ],
  },
  sunriseEarly: {
    prompt: t(
      "Because of atmospheric refraction, how much before the actual sunrise is the Sun visible?",
      "वायुमंडलीय अपवर्तन के कारण सूरज असली सूर्योदय से कितना पहले दिखता है?",
    ),
    right: t("About 2 minutes", "लगभग 2 मिनट"),
    wrong: [
      {
        label: t("About 2 hours", "लगभग 2 घंटे"),
        feedback: t("It's a small effect: about 2 minutes.", "यह छोटा प्रभाव है: लगभग 2 मिनट।"),
      },
      {
        label: t("It isn't: it's seen 2 minutes late", "पहले नहीं: वह 2 मिनट देर से दिखता है"),
        feedback: t(
          "The air bends sunlight over the horizon, so we see the Sun before it actually rises.",
          "हवा धूप को क्षितिज के ऊपर मोड़ती है, इसलिए हम सूरज को उसके असल में उगने से पहले देखते हैं।",
        ),
      },
    ],
  },
  sunsetLate: {
    prompt: t(
      "Because of the air, the Sun is still seen after it has actually set. For about how long?",
      "हवा के कारण सूरज असल में डूबने के बाद भी दिखता है। लगभग कितनी देर?",
    ),
    right: t("About 2 minutes", "लगभग 2 मिनट"),
    wrong: [
      {
        label: t("Not at all", "बिल्कुल नहीं"),
        feedback: t(
          "The same bending that gives an early sunrise gives a late sunset.",
          "जो मुड़ना जल्दी सूर्योदय देता है, वही देर से सूर्यास्त देता है।",
        ),
      },
    ],
  },
  dayLonger: {
    prompt: t(
      "How much longer is our day because of atmospheric refraction, roughly?",
      "वायुमंडलीय अपवर्तन के कारण हमारा दिन लगभग कितना लंबा है?",
    ),
    right: t("About 4 minutes", "लगभग 4 मिनट"),
    wrong: [
      {
        label: t("About 2 minutes", "लगभग 2 मिनट"),
        feedback: t(
          "2 minutes early at sunrise **plus** 2 minutes late at sunset.",
          "सूर्योदय पर 2 मिनट पहले **और** सूर्यास्त पर 2 मिनट बाद।",
        ),
      },
    ],
  },
  flattened: {
    prompt: t(
      "Why does the Sun's disc look slightly flattened at sunrise and sunset?",
      "सूर्योदय और सूर्यास्त पर सूरज की चकती थोड़ी चपटी क्यों दिखती है?",
    ),
    right: t("Atmospheric refraction near the horizon", "क्षितिज के पास वायुमंडलीय अपवर्तन"),
    wrong: [
      {
        label: t("Scattering of its light", "उसके प्रकाश का प्रकीर्णन"),
        feedback: t(
          "Scattering changes the Sun's colour. Its shape is changed by the bending.",
          "प्रकीर्णन सूरज का रंग बदलता है। आकार मुड़ने से बदलता है।",
        ),
      },
    ],
  },
} satisfies Record<string, Fact>;

/** Where stars and the Sun appear: higher, earlier, later, flattened (NCERT 11.5). */
export const apparentPosition = family({
  level: Level.Medium,
  tests: [Concept.AtmosphericRefraction],
  params: factParams(facts),
  build: ({ item }, b) => askFact(b, facts[item], item),
});

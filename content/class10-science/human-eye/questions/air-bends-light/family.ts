import { family, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Fact, askFact, factParams } from "../../kit";

const facts = {
  stars: {
    prompt: t("Why do stars twinkle?", "तारे क्यों टिमटिमाते हैं?"),
    right: t(
      "Atmospheric refraction: changing air keeps shifting the star's apparent position",
      "वायुमंडलीय अपवर्तन: बदलती हवा तारे की आभासी स्थिति खिसकाती रहती है",
    ),
    wrong: [
      {
        label: t(
          "Air molecules scatter their light, so less and less of it reaches us",
          "हवा के अणु उनका प्रकाश बिखेरते हैं, इसलिए कम-से-कम प्रकाश हम तक आता है",
        ),
        feedback: t(
          "Scattering makes the sky blue. Twinkling comes from the air bending starlight by changing amounts.",
          "प्रकीर्णन आसमान को नीला बनाता है। टिमटिमाहट हवा के तारे के प्रकाश को बदलती मात्रा में मोड़ने से आती है।",
        ),
      },
      {
        label: t(
          "Stars really get brighter and fainter as they burn",
          "जलते हुए तारे सचमुच तेज़ और मंद होते हैं",
        ),
        feedback: t(
          "Above the air, stars shine steadily. The flicker is our atmosphere's doing.",
          "हवा के ऊपर से तारे स्थिर चमकते हैं। झिलमिलाहट हमारे वायुमंडल की करतूत है।",
        ),
      },
    ],
  },
  planets: {
    prompt: t("Why don't planets twinkle?", "ग्रह क्यों नहीं टिमटिमाते?"),
    right: t(
      "Being nearer, they're discs, so the flickers of many points cancel",
      "पास होने से वे चकती हैं, इसलिए कई बिंदुओं की टिमटिमाहट मिट जाती है",
    ),
    wrong: [
      {
        label: t(
          "They make their own light, which is perfectly steady",
          "वे अपना प्रकाश बनाते हैं, जो पूरी तरह स्थिर होता है",
        ),
        feedback: t(
          "Planets only reflect sunlight. It's their size in the sky that stops the twinkle.",
          "ग्रह केवल धूप परावर्तित करते हैं। आसमान में उनका आकार टिमटिमाहट रोकता है।",
        ),
      },
      {
        label: t(
          "Their light comes to us above the air, not through it, so it's steady",
          "उनका प्रकाश हवा के ऊपर से आता है, उसके बीच से नहीं, इसलिए स्थिर है",
        ),
        feedback: t(
          "It comes through the same air. It just comes from a disc, not a point.",
          "वह उसी हवा से आता है। बस एक बिंदु से नहीं, चकती से आता है।",
        ),
      },
    ],
  },
  hotAir: {
    prompt: t(
      "Things seen through the hot air above a fire seem to waver. Why?",
      "आग के ऊपर की गर्म हवा से देखी चीज़ें डोलती लगती हैं। क्यों?",
    ),
    right: t(
      "The hot air's refractive index is lower and keeps changing as it moves",
      "गर्म हवा का अपवर्तनांक कम है और हिलने के साथ बदलता रहता है",
    ),
    wrong: [
      {
        label: t("The heat bends the objects", "गर्मी चीज़ों को मोड़ देती है"),
        feedback: t(
          "The objects stay still. Only their light's path through the moving hot air changes.",
          "चीज़ें स्थिर रहती हैं। बस हिलती गर्म हवा से उनके प्रकाश का रास्ता बदलता है।",
        ),
      },
    ],
  },
  hotDenser: {
    prompt: t(
      "Compared with the cooler air above it, the hot air just above a fire is…",
      "ऊपर की ठंडी हवा की तुलना में आग के ठीक ऊपर की गर्म हवा…",
    ),
    right: t(
      "less dense, with a slightly lower refractive index",
      "कम सघन है, थोड़े कम अपवर्तनांक के साथ",
    ),
    wrong: [
      {
        label: t("denser, with a higher refractive index", "ज़्यादा सघन है, ज़्यादा अपवर्तनांक के साथ"),
        feedback: t(
          "Hot air is lighter: that's why it rises. Less dense means a lower refractive index.",
          "गर्म हवा हल्की होती है: इसीलिए उठती है। कम सघन का मतलब कम अपवर्तनांक।",
        ),
      },
    ],
  },
  name: {
    prompt: t(
      "The bending of light by the earth's air is called…",
      "पृथ्वी की हवा द्वारा प्रकाश का मुड़ना कहलाता है…",
    ),
    right: t("atmospheric refraction", "वायुमंडलीय अपवर्तन"),
    wrong: [
      {
        label: t("scattering of light", "प्रकाश का प्रकीर्णन"),
        feedback: t(
          "Scattering sends light off in all directions. Bending is refraction.",
          "प्रकीर्णन प्रकाश को हर दिशा में भेजता है। मुड़ना अपवर्तन है।",
        ),
      },
      {
        label: t("dispersion", "विक्षेपण"),
        feedback: t("Dispersion is splitting into colours.", "विक्षेपण रंगों में बँटना है।"),
      },
    ],
  },
} satisfies Record<string, Fact>;

/** Hot air, twinkling stars and steady planets (NCERT 11.5; Exercises 10, 11). */
export const airBendsLight = family({
  level: Level.Medium,
  tests: [Concept.AtmosphericRefraction],
  params: factParams(facts),
  build: ({ item }, b) => askFact(b, facts[item], item),
});

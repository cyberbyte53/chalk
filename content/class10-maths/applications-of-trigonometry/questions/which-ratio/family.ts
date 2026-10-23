import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily } from "../../kit";

const tanR = t("tan (or cot)", "tan (या cot)");
const sinR = t("sin (or cosec)", "sin (या cosec)");
const cosR = t("cos (or sec)", "cos (या sec)");

/** Choosing the ratio: which two sides do you know and want? */
const items = {
  height: {
    prompt: t(
      "You know the distance along the ground and the angle of elevation; you want the height. Which ratio?",
      "तुम्हें ज़मीन पर की दूरी और उन्नयन कोण पता है; ऊँचाई चाहिए। कौन-सा अनुपात?",
    ),
    right: tanR,
    wrong: [
      {
        label: sinR,
        why: t(
          "sin needs the hypotenuse (the line of sight), which you don't know.",
          "sin को कर्ण (दृष्टि रेखा) चाहिए, जो तुम्हें पता नहीं।",
        ),
      },
      {
        label: cosR,
        why: t(
          "cos links the ground distance with the hypotenuse, not with the height.",
          "cos ज़मीन की दूरी को कर्ण से जोड़ता है, ऊँचाई से नहीं।",
        ),
      },
    ],
  },
  ladder: {
    prompt: t(
      "You know how high a ladder reaches and its angle with the ground; you want the ladder's length. Which ratio?",
      "तुम्हें पता है सीढ़ी कितनी ऊपर पहुँचती है और ज़मीन से उसका कोण; सीढ़ी की लंबाई चाहिए। कौन-सा अनुपात?",
    ),
    right: sinR,
    wrong: [
      {
        label: tanR,
        why: t(
          "tan links the two shorter sides. The ladder is the hypotenuse.",
          "tan दोनों छोटी भुजाओं को जोड़ता है। सीढ़ी कर्ण है।",
        ),
      },
      {
        label: cosR,
        why: t(
          "cos uses the side next to the angle (along the ground). The height is opposite it.",
          "cos कोण के पास वाली भुजा (ज़मीन पर) लेता है। ऊँचाई उसके सामने है।",
        ),
      },
    ],
  },
  foot: {
    prompt: t(
      "You know a slide's length and its angle with the ground; you want the ground length under it. Which ratio?",
      "तुम्हें फिसलपट्टी की लंबाई और ज़मीन से उसका कोण पता है; उसके नीचे ज़मीन की लंबाई चाहिए। कौन-सा अनुपात?",
    ),
    right: cosR,
    wrong: [
      {
        label: sinR,
        why: t(
          "sin gives the side opposite the angle: the height, not the ground length.",
          "sin कोण के सामने वाली भुजा देता है: ऊँचाई, ज़मीन की लंबाई नहीं।",
        ),
      },
      {
        label: tanR,
        why: t(
          "tan doesn't use the slide (the hypotenuse) at all, and that's what you know.",
          "tan में फिसलपट्टी (कर्ण) आती ही नहीं, और वही तुम्हें पता है।",
        ),
      },
    ],
  },
  measure: {
    prompt: t(
      "To find a minar's height from where you stand, which three things must you know?",
      "जहाँ खड़े हो वहीं से मीनार की ऊँचाई निकालने के लिए कौन-सी तीन बातें पता होनी चाहिए?",
    ),
    right: t(
      "Your distance, the elevation, your eye height",
      "तुम्हारी दूरी, उन्नयन कोण, तुम्हारी आँख की ऊँचाई",
    ),
    wrong: [
      {
        label: t(
          "Your distance, the line of sight, the elevation",
          "तुम्हारी दूरी, दृष्टि रेखा, उन्नयन कोण",
        ),
        why: t(
          "You can't measure the line of sight: it runs up through the air. And without your eye height you'd miss the bottom part.",
          "दृष्टि रेखा नापी नहीं जा सकती: वह हवा में ऊपर जाती है। और आँख की ऊँचाई के बिना नीचे का हिस्सा छूट जाएगा।",
        ),
      },
      {
        label: t(
          "The elevation, your eye height, the time of day",
          "उन्नयन कोण, तुम्हारी आँख की ऊँचाई, दिन का समय",
        ),
        why: t(
          "The time of day doesn't matter for a sighting. You need your distance from the foot.",
          "देखने के लिए दिन के समय से फ़र्क नहीं पड़ता। आधार से तुम्हारी दूरी चाहिए।",
        ),
      },
    ],
  },
} satisfies Record<string, Item>;

/** Choose the trigonometric ratio that links what you know to what you want. */
export const whichRatio = bankFamily(items, {
  level: Level.Easy,
  tests: [Concept.AngleOfElevation],
});

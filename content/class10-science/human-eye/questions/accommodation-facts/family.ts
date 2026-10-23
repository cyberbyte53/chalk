import { family, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Fact, askFact, factParams } from "../../kit";

const facts = {
  name: {
    prompt: t(
      "The ability of the eye lens to adjust its focal length is called…",
      "नेत्र लेंस की अपनी फ़ोकस दूरी समायोजित करने की क्षमता कहलाती है…",
    ),
    right: t("accommodation", "समंजन"),
    wrong: [
      {
        label: t("presbyopia", "जरा-दूरदृष्टिता"),
        feedback: t(
          "Presbyopia is the loss of this ability with age.",
          "जरा-दूरदृष्टिता उम्र के साथ इस क्षमता का खोना है।",
        ),
      },
      {
        label: t("dispersion", "विक्षेपण"),
        feedback: t(
          "Dispersion is white light splitting into colours.",
          "विक्षेपण सफ़ेद प्रकाश का रंगों में बँटना है।",
        ),
      },
    ],
  },
  nearPoint: {
    prompt: t(
      "The least distance of distinct vision for a young adult with normal vision is about…",
      "सामान्य दृष्टि वाले युवा के लिए स्पष्ट दृष्टि की न्यूनतम दूरी लगभग है…",
    ),
    right: t("25 cm", "25 सेमी"),
    wrong: [
      {
        label: t("25 m", "25 मीटर"),
        feedback: t("You read a book much closer than 25 m.", "तुम किताब 25 मीटर से कहीं पास पढ़ते हो।"),
      },
      {
        label: t("2.5 cm", "2.5 सेमी"),
        feedback: t("Try reading at 2.5 cm: it's a blur.", "2.5 सेमी पर पढ़कर देखो: सब धुँधला है।"),
      },
      {
        label: t("2.5 m", "2.5 मीटर"),
        feedback: t(
          "At 2.5 m you could hardly read a book's print. The near point is about 25 cm.",
          "2.5 मीटर पर किताब के अक्षर मुश्किल से पढ़ पाओगे। निकट बिंदु लगभग 25 सेमी है।",
        ),
      },
    ],
  },
  farPoint: {
    prompt: t("Where is the far point of a normal eye?", "सामान्य आँख का दूर बिंदु कहाँ है?"),
    right: t("At infinity", "अनंत पर"),
    wrong: [
      {
        label: t("At 25 cm", "25 सेमी पर"),
        feedback: t(
          "25 cm is the near point. A normal eye sees the stars, so its far point is infinity.",
          "25 सेमी निकट बिंदु है। सामान्य आँख तारे देखती है, इसलिए उसका दूर बिंदु अनंत है।",
        ),
      },
      {
        label: t("At about 2 m", "लगभग 2 मीटर पर"),
        feedback: t(
          "That would be a myopic eye. A normal eye sees clearly all the way to infinity.",
          "वह निकट-दृष्टि वाली आँख होती। सामान्य आँख अनंत तक साफ़ देखती है।",
        ),
      },
    ],
  },
  closer: {
    prompt: t(
      "Why can't a normal eye see clearly an object held closer than 25 cm?",
      "सामान्य आँख 25 सेमी से पास रखी वस्तु को साफ़ क्यों नहीं देख पाती?",
    ),
    right: t(
      "The focal length of the eye lens can't be made any shorter",
      "नेत्र लेंस की फ़ोकस दूरी और छोटी नहीं की जा सकती",
    ),
    wrong: [
      {
        label: t(
          "Too little light from a very near object can reach the eye",
          "बहुत पास की वस्तु से बहुत कम प्रकाश आँख तक पहुँच पाता है",
        ),
        feedback: t(
          "Brightness isn't the problem. The lens is already as thick as it can get.",
          "चमक समस्या नहीं है। लेंस पहले ही जितना मोटा हो सकता है उतना है।",
        ),
      },
      {
        label: t(
          "The retina is too close to the lens to catch it",
          "दृष्टिपटल लेंस के इतना पास है कि उसे पकड़ नहीं पाता",
        ),
        feedback: t(
          "The retina is where it always is. What runs out is the lens's ability to bend more.",
          "दृष्टिपटल हमेशा वहीं है। जो ख़त्म होती है वह लेंस की और मोड़ने की क्षमता है।",
        ),
      },
    ],
  },
  muscles: {
    prompt: t(
      "The change in focal length of the eye lens is caused by the action of the…",
      "नेत्र लेंस की फ़ोकस दूरी में बदलाव … की क्रिया से होता है",
    ),
    right: t("ciliary muscles", "पक्ष्माभी पेशियों"),
    wrong: [
      {
        label: t("iris", "परितारिका"),
        feedback: t("The iris changes the pupil.", "परितारिका पुतली बदलती है।"),
      },
      { label: t("pupil", "पुतली"), feedback: t("The pupil is a hole.", "पुतली एक छेद है।") },
      {
        label: t("retina", "दृष्टिपटल"),
        feedback: t("The retina is the screen.", "दृष्टिपटल पर्दा है।"),
      },
    ],
  },
  cataract: {
    prompt: t(
      "In old age the eye lens sometimes becomes milky and cloudy. What is this called, and how is it treated?",
      "बुढ़ापे में नेत्र लेंस कभी-कभी दूधिया और धुँधला हो जाता है। इसे क्या कहते हैं, और इसका इलाज कैसे होता है?",
    ),
    right: t("Cataract; by surgery", "मोतियाबिंद; शल्य-चिकित्सा से"),
    wrong: [
      {
        label: t("Myopia; with a concave lens", "निकट-दृष्टिता; अवतल लेंस से"),
        feedback: t(
          "Myopia is a focusing defect. A cloudy lens blocks the light: that's a cataract.",
          "निकट-दृष्टिता फ़ोकस का दोष है। धुँधला लेंस प्रकाश रोकता है: यह मोतियाबिंद है।",
        ),
      },
      {
        label: t("Presbyopia; with bifocals", "जरा-दूरदृष्टिता; द्विफ़ोकसी से"),
        feedback: t(
          "Glasses can't clear a cloudy lens. A cataract is removed by surgery.",
          "चश्मा धुँधले लेंस को साफ़ नहीं कर सकता। मोतियाबिंद शल्य-चिकित्सा से हटता है।",
        ),
      },
    ],
  },
} satisfies Record<string, Fact>;

/** Accommodation, the near and far points, and cataract (NCERT 11.1.1; Exercises 1, 3, 4, 8). */
export const accommodationFacts = family({
  level: Level.Easy,
  tests: [Concept.PowerOfAccommodation],
  params: factParams(facts),
  build: ({ item }, b) => askFact(b, facts[item], item),
});

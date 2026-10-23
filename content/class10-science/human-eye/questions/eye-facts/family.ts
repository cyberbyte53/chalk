import { family, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Fact, askFact, factParams } from "../../kit";

const facts = {
  imageKind: {
    prompt: t(
      "What kind of image does the eye lens form on the retina?",
      "नेत्र लेंस दृष्टिपटल पर कैसा प्रतिबिंब बनाता है?",
    ),
    right: t("Real and inverted", "वास्तविक और उल्टा"),
    wrong: [
      {
        label: t("Virtual and erect", "आभासी और सीधा"),
        feedback: t(
          "A virtual image can't land on a screen, and the retina is a screen. The image there is real, and upside down like the projector's.",
          "आभासी प्रतिबिंब पर्दे पर नहीं उतर सकता, और दृष्टिपटल एक पर्दा है। वहाँ प्रतिबिंब वास्तविक है, और प्रोजेक्टर की तरह उल्टा।",
        ),
      },
      {
        label: t("Real and erect", "वास्तविक और सीधा"),
        feedback: t(
          "A convex lens's real image is always inverted. The brain makes us see the world the right way up.",
          "उत्तल लेंस का वास्तविक प्रतिबिंब हमेशा उल्टा होता है। मस्तिष्क हमें दुनिया सीधी दिखाता है।",
        ),
      },
    ],
  },
  dimLight: {
    prompt: t("In dim light, what does the pupil do?", "मद्धम रोशनी में पुतली क्या करती है?"),
    right: t("It opens wide, to let more light in", "पूरी खुल जाती है, ताकि ज़्यादा प्रकाश आए"),
    wrong: [
      {
        label: t("It closes down, to protect the eye", "आँख की रक्षा के लिए सिकुड़ जाती है"),
        feedback: t(
          "That's bright light: less light is let in. In dim light the eye needs more.",
          "यह उजाले में होता है: कम प्रकाश आने दिया जाता है। मद्धम रोशनी में आँख को ज़्यादा चाहिए।",
        ),
      },
      {
        label: t("It stays the same; only the lens adjusts", "वैसी ही रहती है; केवल लेंस बदलता है"),
        feedback: t(
          "The iris changes the pupil's size with the light: that's why you can't see at first in a dark room.",
          "परितारिका प्रकाश के साथ पुतली का आकार बदलती है: इसीलिए अँधेरे कमरे में पहले कुछ नहीं दिखता।",
        ),
      },
    ],
  },
  brightLight: {
    prompt: t(
      "In very bright light, what does the iris do to the pupil?",
      "बहुत तेज़ रोशनी में परितारिका पुतली के साथ क्या करती है?",
    ),
    right: t("Makes it smaller, to let less light in", "उसे छोटा करती है, ताकि कम प्रकाश आए"),
    wrong: [
      {
        label: t("Makes it larger, to see more clearly", "ज़्यादा साफ़ देखने के लिए उसे बड़ा करती है"),
        feedback: t(
          "A larger pupil lets in more light: that's for dim light.",
          "बड़ी पुतली ज़्यादा प्रकाश आने देती है: यह मद्धम रोशनी के लिए है।",
        ),
      },
      {
        label: t("Makes the eye lens thicker", "नेत्र लेंस को मोटा करती है"),
        feedback: t(
          "The lens is shaped by the ciliary muscles. The iris only works on the pupil.",
          "लेंस को पक्ष्माभी पेशियाँ आकार देती हैं। परितारिका केवल पुतली पर काम करती है।",
        ),
      },
    ],
  },
  colours: {
    prompt: t(
      "Why is the eye called our most valuable sense organ?",
      "आँख को हमारी सबसे कीमती ज्ञानेंद्रिय क्यों कहा जाता है?",
    ),
    right: t(
      "Without it we can't tell colours at all; other senses can't do that",
      "इसके बिना हम रंग बिल्कुल नहीं पहचान सकते; दूसरी इंद्रियाँ यह नहीं कर सकतीं",
    ),
    wrong: [
      {
        label: t("It is the biggest sense organ", "यह सबसे बड़ी ज्ञानेंद्रिय है"),
        feedback: t(
          "Size isn't the reason. With eyes shut you can still smell, hear and touch things, but never see their colours.",
          "आकार कारण नहीं है। आँखें बंद करके भी तुम सूँघ, सुन और छू सकते हो, पर रंग कभी नहीं देख सकते।",
        ),
      },
    ],
  },
  twoEyes: {
    prompt: t(
      "About how wide is a person's field of view with both eyes open?",
      "दोनों आँखें खुली होने पर व्यक्ति का दृष्टि-क्षेत्र लगभग कितना चौड़ा होता है?",
    ),
    right: t("About 180°", "लगभग 180°"),
    wrong: [
      {
        label: t("About 150°", "लगभग 150°"),
        feedback: t(
          "That's with one eye. The second eye widens it to about 180°.",
          "यह एक आँख से है। दूसरी आँख इसे लगभग 180° तक बढ़ाती है।",
        ),
      },
      {
        label: t("About 360°", "लगभग 360°"),
        feedback: t(
          "We can't see behind our heads! Both eyes face forwards.",
          "हम सिर के पीछे नहीं देख सकते! दोनों आँखें आगे की ओर हैं।",
        ),
      },
    ],
  },
  depth: {
    prompt: t(
      "What do two eyes give us that one eye can't?",
      "दो आँखें हमें क्या देती हैं जो एक आँख नहीं दे सकती?",
    ),
    right: t("A sense of how near or far things are", "चीज़ें कितनी पास या दूर हैं, इसका बोध"),
    wrong: [
      {
        label: t("Colour vision in dim light", "मंद प्रकाश में रंग देखना"),
        feedback: t(
          "One eye sees colours perfectly well. Two slightly different views let the brain judge distance.",
          "एक आँख रंग पूरी तरह ठीक देखती है। दो थोड़े अलग दृश्य मस्तिष्क को दूरी आँकने देते हैं।",
        ),
      },
      {
        label: t("Sharper focus on very small print", "बहुत छोटे अक्षरों पर ज़्यादा साफ़ फ़ोकस"),
        feedback: t(
          "Each eye focuses on its own. Together they add depth and a wider view.",
          "हर आँख अपने आप फ़ोकस करती है। साथ मिलकर वे गहराई और चौड़ा दृश्य जोड़ती हैं।",
        ),
      },
    ],
  },
} satisfies Record<string, Fact>;

/** The image on the retina, the pupil in bright and dim light, and why two eyes (NCERT 11.1). */
export const eyeFacts = family({
  level: Level.Easy,
  tests: [Concept.TheHumanEye],
  params: factParams(facts),
  build: ({ item }, b) => askFact(b, facts[item], item),
});

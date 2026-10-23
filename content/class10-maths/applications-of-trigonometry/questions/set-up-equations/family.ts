import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, both } from "../../kit";

/** Setting up the two equations of a two-observation problem. */
const items = {
  ex5second: {
    prompt: t(
      "Example 5: tower h, short shadow x at 60°, long shadow x + 40 at 30°. Which equation comes from the 30° triangle?",
      "उदाहरण 5: मीनार h, 60° पर छोटी परछाई x, 30° पर लंबी परछाई x + 40। 30° वाले त्रिभुज से कौन-सा समीकरण आता है?",
    ),
    right: both("tan 30° = h / (x + 40)"),
    wrong: [
      {
        label: both("tan 30° = h / x"),
        why: t(
          "At 30° the Sun is lower, so the shadow is the long one, x + 40.",
          "30° पर सूर्य नीचे है, इसलिए परछाई लंबी वाली है, x + 40।",
        ),
      },
      {
        label: both("tan 30° = (x + 40) / h"),
        why: t(
          "tan is opposite over adjacent: the height over the shadow, not the other way.",
          "tan सम्मुख/आसन्न है: ऊँचाई बटा परछाई, उल्टा नहीं।",
        ),
      },
    ],
  },
  q11pair: {
    prompt: t(
      "Exercise 9.1 Q11: tower h, canal x. From the bank it's at 60°, from 20 m back at 30°. Which pair of equations fits?",
      "प्रश्नावली 9.1 प्र11: टावर h, नहर x। किनारे से 60° पर, 20 m पीछे से 30° पर। कौन-सा समीकरण-युग्म ठीक है?",
    ),
    right: both("h = x√3 and h√3 = x + 20"),
    wrong: [
      {
        label: both("h = x√3 and h√3 = x − 20"),
        why: t(
          "The second point is 20 m farther from the tower, so its distance is x + 20.",
          "दूसरा बिंदु टावर से 20 m और दूर है, इसलिए उसकी दूरी x + 20 है।",
        ),
      },
      {
        label: both("h√3 = x and h = x√3 + 20"),
        why: t(
          "At 60°, tan 60° = √3 = h/x, so h = x√3. The 20 belongs with the distance, not the height.",
          "60° पर tan 60° = √3 = h/x, तो h = x√3। 20 दूरी के साथ जुड़ता है, ऊँचाई के साथ नहीं।",
        ),
      },
    ],
  },
  shared: {
    prompt: t(
      "Example 7 (the bridge): the two banks are seen on opposite sides. What do the two right triangles share?",
      "उदाहरण 7 (पुल): दोनों किनारे विपरीत ओर दिखते हैं। दोनों समकोण त्रिभुजों में क्या साझा है?",
    ),
    right: t("The height PD of the bridge", "पुल की ऊँचाई PD"),
    wrong: [
      {
        label: t("The width AB of the river", "नदी की चौड़ाई AB"),
        why: t(
          "AB is what we want: it is AD + DB, one piece from each triangle.",
          "AB वही है जो चाहिए: यह AD + DB है, हर त्रिभुज से एक टुकड़ा।",
        ),
      },
      {
        label: t("The line of sight from P", "P से दृष्टि रेखा"),
        why: t(
          "There are two lines of sight, PA and PB, one in each triangle. The shared side is PD.",
          "दो दृष्टि रेखाएँ हैं, PA और PB, हर त्रिभुज में एक। साझा भुजा PD है।",
        ),
      },
    ],
  },
  eliminate: {
    prompt: t(
      "You have h = x√3 and h√3 = x + 40. What is the next step?",
      "तुम्हारे पास h = x√3 और h√3 = x + 40 है। अगला चरण क्या है?",
    ),
    right: t("Put h = x√3 into the second", "दूसरे में h = x√3 रखो"),
    wrong: [
      {
        label: t("Add the two equations", "दोनों समीकरण जोड़ो"),
        why: t(
          "Adding keeps both unknowns. Substituting removes h, leaving one equation in x.",
          "जोड़ने पर दोनों अज्ञात रहते हैं। रखने से h हट जाता है, x में एक समीकरण बचता है।",
        ),
      },
      {
        label: t("Square both equations", "दोनों समीकरणों का वर्ग करो"),
        why: t(
          "Squaring makes it harder. Replace h with x√3: 3x = x + 40.",
          "वर्ग करने से कठिन हो जाता है। h की जगह x√3 रखो: 3x = x + 40।",
        ),
      },
    ],
  },
} satisfies Record<string, Item>;

/** Write one equation per triangle, then eliminate an unknown. */
export const setUpEquations = bankFamily(items, {
  level: Level.Medium,
  tests: [Concept.TwoObservations],
});

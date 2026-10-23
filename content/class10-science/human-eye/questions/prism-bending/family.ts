import { family, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Fact, askFact, factParams } from "../../kit";

const towards = t("Towards the normal", "अभिलंब की ओर");
const away = t("Away from the normal", "अभिलंब से दूर");

const facts = {
  firstFace: {
    prompt: t(
      "At the first face of a prism, light goes from air into glass. Which way does it bend?",
      "प्रिज़्म के पहले फलक पर प्रकाश हवा से काँच में जाता है। वह किस ओर मुड़ता है?",
    ),
    right: towards,
    wrong: [
      {
        label: away,
        feedback: t(
          "Into a denser medium, light slows and bends towards the normal.",
          "सघन माध्यम में प्रकाश धीमा होकर अभिलंब की ओर मुड़ता है।",
        ),
      },
    ],
  },
  secondFace: {
    prompt: t(
      "At the second face of a prism, light goes from glass into air. Which way does it bend?",
      "प्रिज़्म के दूसरे फलक पर प्रकाश काँच से हवा में जाता है। वह किस ओर मुड़ता है?",
    ),
    right: away,
    wrong: [
      {
        label: towards,
        feedback: t(
          "Out into a rarer medium, light speeds up and bends away from the normal.",
          "विरल माध्यम में निकलते समय प्रकाश तेज़ होकर अभिलंब से दूर मुड़ता है।",
        ),
      },
    ],
  },
  slab: {
    prompt: t(
      "Why does a ray come out of a glass slab parallel to its incident direction, but out of a prism turned?",
      "किरण काँच के गुटके से अपनी आपतित दिशा के समानांतर क्यों निकलती है, पर प्रिज़्म से मुड़कर?",
    ),
    right: t(
      "A slab's faces are parallel, a prism's are inclined",
      "गुटके के फलक समानांतर हैं, प्रिज़्म के झुके हुए",
    ),
    wrong: [
      {
        label: t(
          "Prism glass always has a higher refractive index",
          "प्रिज़्म के काँच का अपवर्तनांक हमेशा ज़्यादा होता है",
        ),
        feedback: t(
          "They can be the same glass. It's the shape that matters.",
          "वे एक ही काँच के हो सकते हैं। आकार मायने रखता है।",
        ),
      },
      {
        label: t("A slab doesn't bend light at all", "गुटका प्रकाश को बिल्कुल नहीं मोड़ता"),
        feedback: t(
          "A slab does bend the ray, at both faces; the two bends just cancel, leaving it shifted sideways.",
          "गुटका किरण को दोनों फलकों पर मोड़ता है; दोनों मोड़ बस एक-दूसरे को काट देते हैं, उसे बग़ल में खिसकाकर।",
        ),
      },
    ],
  },
  slabShift: {
    prompt: t(
      "What happens to a ray that passes through a rectangular glass slab?",
      "आयताकार काँच के गुटके से गुज़रने वाली किरण का क्या होता है?",
    ),
    right: t(
      "It comes out parallel to its original direction, shifted sideways",
      "वह अपनी मूल दिशा के समानांतर, बग़ल में खिसकी हुई निकलती है",
    ),
    wrong: [
      {
        label: t(
          "It comes out turned through the angle of deviation",
          "वह विचलन कोण से मुड़कर निकलती है",
        ),
        feedback: t(
          "That's a prism, whose faces aren't parallel.",
          "यह प्रिज़्म है, जिसके फलक समानांतर नहीं।",
        ),
      },
    ],
  },
  base: {
    prompt: t(
      "Which way does a prism turn a ray of light, overall?",
      "कुल मिलाकर प्रिज़्म प्रकाश की किरण को किस ओर मोड़ता है?",
    ),
    right: t("Towards its base", "अपने आधार की ओर"),
    wrong: [
      {
        label: t("Towards its tip (the angle A)", "अपने शीर्ष (कोण A) की ओर"),
        feedback: t(
          "Both bends turn the ray the same way, towards the thicker part, the base.",
          "दोनों मोड़ किरण को एक ही ओर, मोटे भाग, आधार की ओर, मोड़ते हैं।",
        ),
      },
    ],
  },
} satisfies Record<string, Fact>;

/** How light bends at each face of a prism, and why a prism turns light but a slab doesn't. */
export const prismBending = family({
  level: Level.Medium,
  tests: [Concept.RefractionThroughAPrism],
  params: factParams(facts),
  build: ({ item }, b) => askFact(b, facts[item], item),
});

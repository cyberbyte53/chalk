import { family, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Fact, askFact, factParams } from "../../kit";

const angle = {
  i: t("The angle of incidence, i", "आपतन कोण, i"),
  r: t("The angle of refraction, r", "अपवर्तन कोण, r"),
  e: t("The angle of emergence, e", "निर्गत कोण, e"),
  a: t("The angle of the prism, A", "प्रिज़्म कोण, A"),
  d: t("The angle of deviation, D", "विचलन कोण, D"),
};
const what = {
  i: t(
    "i is between the incident ray and the normal at the first face.",
    "i पहले फलक पर आपतित किरण और अभिलंब के बीच है।",
  ),
  r: t(
    "r is between the ray inside the glass and the normal at the first face.",
    "r पहले फलक पर काँच के अंदर की किरण और अभिलंब के बीच है।",
  ),
  e: t(
    "e is between the emergent ray and the normal at the second face.",
    "e दूसरे फलक पर निर्गत किरण और अभिलंब के बीच है।",
  ),
  a: t("A is between the prism's two faces.", "A प्रिज़्म के दोनों फलकों के बीच है।"),
  d: t(
    "D is between the emergent ray and the direction the incident ray was going.",
    "D निर्गत किरण और उस दिशा के बीच है जिधर आपतित किरण जा रही थी।",
  ),
};
const not = (k: keyof typeof angle) => ({ label: angle[k], feedback: what[k] });

const facts = {
  betweenFaces: {
    prompt: t(
      "What is the angle between the two lateral faces of a prism that the light passes through called?",
      "प्रिज़्म के जिन दो पार्श्व फलकों से प्रकाश गुज़रता है, उनके बीच के कोण को क्या कहते हैं?",
    ),
    right: angle.a,
    wrong: [not("d"), not("i")],
  },
  turned: {
    prompt: t(
      "The emergent ray leaves a prism at an angle to the direction of the incident ray. What is this angle called?",
      "निर्गत किरण प्रिज़्म से आपतित किरण की दिशा से एक कोण पर निकलती है। इस कोण को क्या कहते हैं?",
    ),
    right: angle.d,
    wrong: [not("e"), not("a")],
  },
  emergent: {
    prompt: t(
      "Which angle is between the emergent ray and the normal at the second face?",
      "दूसरे फलक पर निर्गत किरण और अभिलंब के बीच कौन-सा कोण है?",
    ),
    right: angle.e,
    wrong: [not("d"), not("r")],
  },
  inside: {
    prompt: t(
      "Which angle is between the ray inside the glass and the normal at the first face?",
      "पहले फलक पर काँच के अंदर की किरण और अभिलंब के बीच कौन-सा कोण है?",
    ),
    right: angle.r,
    wrong: [not("i"), not("e")],
  },
  rayNames: {
    prompt: t(
      "In NCERT's Activity 11.1, PE meets the prism at E, EF crosses it and FS leaves it. What is EF?",
      "एनसीईआरटी की क्रियाकलाप 11.1 में PE प्रिज़्म से E पर मिलती है, EF उसे पार करती है और FS बाहर निकलती है। EF क्या है?",
    ),
    right: t("The refracted ray", "अपवर्तित किरण"),
    wrong: [
      {
        label: t("The emergent ray", "निर्गत किरण"),
        feedback: t(
          "FS, leaving the prism, is the emergent ray.",
          "प्रिज़्म से निकलती FS निर्गत किरण है।",
        ),
      },
      {
        label: t("The incident ray", "आपतित किरण"),
        feedback: t(
          "PE, arriving at the prism, is the incident ray.",
          "प्रिज़्म पर पहुँचती PE आपतित किरण है।",
        ),
      },
    ],
  },
} satisfies Record<string, Fact>;

/** Naming the angles and rays of refraction through a prism (NCERT 11.3, Activity 11.1). */
export const prismAngles = family({
  level: Level.Easy,
  tests: [Concept.RefractionThroughAPrism],
  params: factParams(facts),
  build: ({ item }, b) => askFact(b, facts[item], item),
});

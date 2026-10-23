import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { type Option, choiceQuestion, settle } from "@chalk/patterns";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

type L = ReturnType<typeof t>;
type Item = { prompt: L; right: L; wrong: { label: L; feedback: L }[] };

const items: Record<string, Item> = {
  converging: {
    prompt: t("Which lens is also called a converging lens?", "किस लेंस को अभिसारी लेंस भी कहते हैं?"),
    right: t("A convex lens", "उत्तल लेंस"),
    wrong: [
      {
        label: t("A concave lens", "अवतल लेंस"),
        feedback: t(
          "A concave lens spreads parallel rays apart: it is diverging.",
          "अवतल लेंस समानांतर किरणों को फैलाता है: वह अपसारी है।",
        ),
      },
      {
        label: t("A plane glass slab", "समतल काँच का गुटका"),
        feedback: t(
          "A slab only shifts a ray sideways; it doesn't bring rays together.",
          "गुटका किरण को केवल बग़ल में खिसकाता है; वह किरणों को इकट्ठा नहीं करता।",
        ),
      },
    ],
  },
  thicker: {
    prompt: t(
      "A lens is thicker at the edges than in the middle. What kind is it?",
      "एक लेंस बीच से किनारों पर मोटा है। वह किस तरह का है?",
    ),
    right: t("Concave, diverging", "अवतल, अपसारी"),
    wrong: [
      {
        label: t("Convex, converging", "उत्तल, अभिसारी"),
        feedback: t("A convex lens is thicker in the middle.", "उत्तल लेंस बीच में मोटा होता है।"),
      },
      {
        label: t("Concave, converging", "अवतल, अभिसारी"),
        feedback: t(
          "A concave lens spreads parallel rays apart, so it is diverging.",
          "अवतल लेंस समानांतर किरणों को फैलाता है, इसलिए वह अपसारी है।",
        ),
      },
    ],
  },
  centre: {
    prompt: t(
      "A ray passes through the optical centre O of a thin lens. What happens to it?",
      "एक किरण पतले लेंस के प्रकाशिक केंद्र O से होकर जाती है। उसका क्या होता है?",
    ),
    right: t("It goes straight on without bending", "वह बिना मुड़े सीधी चली जाती है"),
    wrong: [
      {
        label: t("It bends through the focus", "वह फोकस से होकर मुड़ती है"),
        feedback: t(
          "That's a ray parallel to the axis. Near O the two faces are almost parallel, like a thin slab.",
          "यह अक्ष के समानांतर किरण है। O के पास दोनों सतहें लगभग समानांतर हैं, पतले गुटके जैसी।",
        ),
      },
      {
        label: t("It comes out parallel to the axis", "वह अक्ष के समानांतर निकलती है"),
        feedback: t(
          "That's a ray through the focus. A ray through O isn't bent at all.",
          "यह फोकस से होकर आती किरण है। O से होकर जाती किरण बिल्कुल नहीं मुड़ती।",
        ),
      },
    ],
  },
  twoFoci: {
    prompt: t("Why does a lens have two principal foci?", "लेंस के दो मुख्य फोकस क्यों होते हैं?"),
    right: t("Light can pass through it from either side", "प्रकाश उसमें से किसी भी ओर से गुज़र सकता है"),
    wrong: [
      {
        label: t("It has two surfaces that reflect", "उसकी दो परावर्तक सतहें हैं"),
        feedback: t(
          "A lens lets light through rather than reflecting it. Send parallel light from the other side and it focuses on the other side.",
          "लेंस प्रकाश को परावर्तित नहीं, आर-पार जाने देता है। दूसरी ओर से समानांतर प्रकाश भेजो तो वह दूसरी ओर फोकस होता है।",
        ),
      },
      {
        label: t(
          "One focus is for real images, one for virtual",
          "एक फोकस वास्तविक प्रतिबिंबों का, एक आभासी का",
        ),
        feedback: t(
          "Both foci are found the same way, with parallel rays: one from each side.",
          "दोनों फोकस एक ही तरह, समानांतर किरणों से मिलते हैं: हर ओर से एक।",
        ),
      },
    ],
  },
  focalLength: {
    prompt: t("The focal length of a lens is the distance…", "लेंस की फोकस दूरी वह दूरी है…"),
    right: t("from the optical centre to a principal focus", "प्रकाशिक केंद्र से एक मुख्य फोकस तक"),
    wrong: [
      {
        label: t("between its two foci", "उसके दोनों फोकसों के बीच"),
        feedback: t(
          "That's two focal lengths. Measure from O to one focus.",
          "वह दो फोकस दूरियाँ है। O से एक फोकस तक नापो।",
        ),
      },
      {
        label: t("from the lens to its centre of curvature", "लेंस से उसके वक्रता केंद्र तक"),
        feedback: t(
          "That's a radius of curvature. The focal length goes to F, where parallel rays meet.",
          "वह वक्रता त्रिज्या है। फोकस दूरी F तक जाती है, जहाँ समानांतर किरणें मिलती हैं।",
        ),
      },
    ],
  },
  clay: {
    prompt: t("Which of these cannot be used to make a lens?", "इनमें से किससे लेंस नहीं बनाया जा सकता?"),
    right: t("Clay", "मिट्टी"),
    wrong: [
      {
        label: t("Water", "पानी"),
        feedback: t(
          "Water is transparent, so a drop of it can act as a lens. Clay lets no light through.",
          "पानी पारदर्शी है, इसलिए उसकी बूँद लेंस का काम कर सकती है। मिट्टी से कोई प्रकाश पार नहीं होता।",
        ),
      },
      {
        label: t("Glass", "काँच"),
        feedback: t(
          "Most lenses are glass. A lens must be transparent, and clay isn't.",
          "ज़्यादातर लेंस काँच के होते हैं। लेंस पारदर्शी होना चाहिए, और मिट्टी नहीं है।",
        ),
      },
    ],
  },
};

const asks = Object.keys(items) as [string, ...string[]];

/** The words of a lens: converging, diverging, optical centre, two foci, focal length; NCERT Ex 1. */
export const lensVocabulary = family({
  level: Level.Easy,
  tests: [Concept.Lenses],
  params: z.object({ ask: z.enum(asks) }).strict(),
  build: ({ ask }, b) => {
    const item = items[ask] as Item;
    const options: Option[] = [
      { id: "right", label: item.right },
      ...item.wrong.map((w, i) => ({ id: `w${i}`, label: w.label, feedback: w.feedback })),
    ];
    const q = choiceQuestion(b, {
      prompt: item.prompt,
      options: settle(options, ask.length * 13),
      answer: "right",
    });
    return column([q, space()]);
  },
});

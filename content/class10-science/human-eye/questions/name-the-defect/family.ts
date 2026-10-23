import { family, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Fact, askFact, factParams } from "../../kit";

const myopia = t("Myopia, corrected with a concave lens", "निकट-दृष्टिता, अवतल लेंस से ठीक");
const hyper = t("Hypermetropia, corrected with a convex lens", "दूर-दृष्टिता, उत्तल लेंस से ठीक");
const presby = t("Presbyopia, often corrected with bifocals", "जरा-दूरदृष्टिता, अक्सर द्विफ़ोकसी से ठीक");

const notMyopia = t(
  "Myopia is trouble with **far** things, fixed by a concave lens.",
  "निकट-दृष्टिता **दूर** की चीज़ों की परेशानी है, अवतल लेंस से ठीक।",
);
const notHyper = t(
  "Hypermetropia is trouble with **near** things, fixed by a convex lens.",
  "दूर-दृष्टिता **पास** की चीज़ों की परेशानी है, उत्तल लेंस से ठीक।",
);
const notPresby = t(
  "Presbyopia comes with age, as the ciliary muscles weaken and the lens stiffens.",
  "जरा-दूरदृष्टिता उम्र के साथ आती है, जब पक्ष्माभी पेशियाँ कमज़ोर और लेंस कठोर होता है।",
);

const facts = {
  blackboard: {
    prompt: t(
      "A student can't read the blackboard from the last row but reads her book easily. What is the defect, and its correction?",
      "एक विद्यार्थी आख़िरी पंक्ति से ब्लैकबोर्ड नहीं पढ़ पाती पर अपनी किताब आसानी से पढ़ लेती है। दोष क्या है, और उसका उपचार?",
    ),
    right: myopia,
    wrong: [
      { label: hyper, feedback: notHyper },
      { label: presby, feedback: notPresby },
    ],
  },
  newspaper: {
    prompt: t(
      "A 30-year-old must hold his newspaper at arm's length to read it, but sees far things clearly. What is the defect?",
      "एक 30 साल के व्यक्ति को अख़बार पढ़ने के लिए हाथ भर दूर पकड़ना पड़ता है, पर दूर की चीज़ें वह साफ़ देखता है। दोष क्या है?",
    ),
    right: hyper,
    wrong: [
      { label: myopia, feedback: notMyopia },
      {
        label: presby,
        feedback: t(
          "At 30 it isn't age. A near point too far, with far vision fine, is hypermetropia.",
          "30 की उम्र में यह बुढ़ापा नहीं है। दूर की दृष्टि ठीक हो और निकट बिंदु बहुत दूर, तो यह दूर-दृष्टिता है।",
        ),
      },
    ],
  },
  imageInFront: {
    prompt: t(
      "In someone's eye the image of a distant object forms in front of the retina. What is the defect?",
      "किसी की आँख में दूर की वस्तु का प्रतिबिंब दृष्टिपटल के आगे बनता है। दोष क्या है?",
    ),
    right: myopia,
    wrong: [
      {
        label: hyper,
        feedback: t(
          "In hypermetropia the image of a **near** object would form **behind** the retina.",
          "दूर-दृष्टिता में **पास** की वस्तु का प्रतिबिंब दृष्टिपटल के **पीछे** बनता।",
        ),
      },
    ],
  },
  imageBehind: {
    prompt: t(
      "In someone's eye, light from a nearby object would focus behind the retina. What is the defect?",
      "किसी की आँख में पास की वस्तु का प्रकाश दृष्टिपटल के पीछे फ़ोकस होता। दोष क्या है?",
    ),
    right: hyper,
    wrong: [
      {
        label: myopia,
        feedback: t(
          "In myopia the image of a **far** object forms **in front of** the retina.",
          "निकट-दृष्टिता में **दूर** की वस्तु का प्रतिबिंब दृष्टिपटल के **आगे** बनता है।",
        ),
      },
    ],
  },
  longEyeball: {
    prompt: t(
      "Which defect can be caused by an eyeball that is too long, or an eye lens that is too curved?",
      "कौन-सा दोष बहुत लंबे नेत्र गोलक, या बहुत ज़्यादा वक्रित नेत्र लेंस से हो सकता है?",
    ),
    right: myopia,
    wrong: [
      {
        label: hyper,
        feedback: t(
          "Hypermetropia comes from an eyeball that's too **small**, or a focal length that's too long.",
          "दूर-दृष्टिता बहुत **छोटे** नेत्र गोलक, या बहुत लंबी फ़ोकस दूरी से होती है।",
        ),
      },
      { label: presby, feedback: notPresby },
    ],
  },
  shortEyeball: {
    prompt: t(
      "Which defect can be caused by an eyeball that is too small, or an eye lens whose focal length is too long?",
      "कौन-सा दोष बहुत छोटे नेत्र गोलक, या बहुत लंबी फ़ोकस दूरी वाले नेत्र लेंस से हो सकता है?",
    ),
    right: hyper,
    wrong: [
      {
        label: myopia,
        feedback: t(
          "Myopia comes from an eyeball that's too **long**, or a lens that's too curved.",
          "निकट-दृष्टिता बहुत **लंबे** नेत्र गोलक, या बहुत वक्रित लेंस से होती है।",
        ),
      },
    ],
  },
  grandpa: {
    prompt: t(
      "A 65-year-old can no longer read without glasses, because his ciliary muscles have weakened and his lens is less flexible. What is it?",
      "एक 65 साल के व्यक्ति बिना चश्मे के अब पढ़ नहीं पाते, क्योंकि उनकी पक्ष्माभी पेशियाँ कमज़ोर और लेंस कम लचीला हो गया है। यह क्या है?",
    ),
    right: presby,
    wrong: [{ label: myopia, feedback: notMyopia }],
  },
} satisfies Record<string, Fact>;

/** From a symptom or a cause to the defect and its correction (NCERT 11.2; in-text Q4). */
export const nameTheDefect = family({
  level: Level.Medium,
  tests: [Concept.DefectsOfVision],
  params: factParams(facts),
  build: ({ item }, b) => askFact(b, facts[item], item),
});

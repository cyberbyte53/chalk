import { family, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Item, itemBoard, seedOf } from "../../quiz";

const items = {
  gas: {
    prompt: t(
      "Which gas makes up the largest part of biogas (up to 75%)?",
      "बायोगैस का सबसे बड़ा भाग (75% तक) कौन-सी गैस है?",
    ),
    right: t("Methane", "मीथेन"),
    wrong: [
      {
        label: t("Oxygen", "ऑक्सीजन"),
        feedback: t(
          "The digester has no oxygen; the microbes make mostly methane.",
          "पाचित्र में ऑक्सीजन नहीं; सूक्ष्मजीव ज़्यादातर मीथेन बनाते हैं।",
        ),
      },
      {
        label: t("Hydrogen", "हाइड्रोजन"),
        feedback: t(
          "Biogas has a little hydrogen, but mostly methane.",
          "बायोगैस में थोड़ी हाइड्रोजन है, पर ज़्यादातर मीथेन।",
        ),
      },
    ],
  },
  noAir: {
    prompt: t(
      "Why must the digester of a biogas plant be sealed from air?",
      "बायोगैस संयंत्र का पाचित्र हवा से बंद क्यों होना चाहिए?",
    ),
    right: t(
      "The microbes making methane work only without oxygen",
      "मीथेन बनाने वाले सूक्ष्मजीव केवल बिना ऑक्सीजन के काम करते हैं",
    ),
    wrong: [
      {
        label: t(
          "Air would make the slurry freeze solid inside the tank",
          "हवा से टैंक के अंदर घोल जमकर ठोस हो जाएगा",
        ),
        feedback: t(
          "Air doesn't freeze slurry; oxygen stops the anaerobic microbes.",
          "हवा घोल नहीं जमाती; ऑक्सीजन अवायवीय सूक्ष्मजीवों को रोकती है।",
        ),
      },
      {
        label: t(
          "Air would turn the methane straight back into cow dung",
          "हवा मीथेन को सीधे वापस गोबर में बदल देगी",
        ),
        feedback: t(
          "The reason is the microbes: they need no oxygen to work.",
          "कारण सूक्ष्मजीव हैं: उन्हें काम के लिए ऑक्सीजन नहीं चाहिए।",
        ),
      },
    ],
  },
  excellent: {
    prompt: t("Why is biogas called an excellent fuel?", "बायोगैस को उत्तम ईंधन क्यों कहते हैं?"),
    right: t(
      "It burns without smoke, gives good heat and leaves no ash",
      "यह बिना धुएँ के जलती है, अच्छी ऊष्मा देती है और राख नहीं छोड़ती",
    ),
    wrong: [
      {
        label: t(
          "It burns with thick smoke, which keeps the kitchen nice and warm",
          "यह घने धुएँ के साथ जलती है, जो रसोई को गर्म रखता है",
        ),
        feedback: t(
          "Biogas burns without smoke; that's why it's excellent.",
          "बायोगैस बिना धुएँ के जलती है; इसीलिए वह उत्तम है।",
        ),
      },
      {
        label: t(
          "It can be made only in big factories in cities, far from farms",
          "यह केवल शहरों के बड़े कारख़ानों में, खेतों से दूर बन सकती है",
        ),
        feedback: t(
          "It is made right in the village from dung and waste.",
          "यह गाँव में ही गोबर और कचरे से बनती है।",
        ),
      },
    ],
  },
  slurry: {
    prompt: t(
      "What is done with the slurry left in a biogas plant?",
      "बायोगैस संयंत्र में बचे घोल का क्या किया जाता है?",
    ),
    right: t(
      "It is used as manure, rich in nitrogen",
      "उसे खाद के रूप में उपयोग करते हैं, नाइट्रोजन से भरपूर",
    ),
    wrong: [
      {
        label: t(
          "It is burnt in chulhas as a smoky fuel for cooking",
          "उसे चूल्हों में धुएँ वाले ईंधन के रूप में जलाते हैं",
        ),
        feedback: t("The gas is the fuel; the slurry is good manure.", "गैस ईंधन है; घोल अच्छी खाद है।"),
      },
      {
        label: t(
          "It is poured into the river because it is poisonous",
          "उसे नदी में बहा देते हैं क्योंकि वह ज़हरीला है",
        ),
        feedback: t(
          "It's not poisonous: it's excellent manure for fields.",
          "यह ज़हरीला नहीं: खेतों के लिए उत्तम खाद है।",
        ),
      },
    ],
  },
} satisfies Record<string, Item>;

type Key = keyof typeof items;

/** The biogas plant (NCERT 14.2.3; in-text Q; Exercise 2). */
export const biogasFacts = family({
  level: Level.Easy,
  tests: [Concept.BiomassAndBiogas],
  params: z.object({ item: z.enum(Object.keys(items) as [Key, ...Key[]]) }).strict(),
  build: ({ item }, b) => itemBoard(b, items[item], seedOf(item)),
});

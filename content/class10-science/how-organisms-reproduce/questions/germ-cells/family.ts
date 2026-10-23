import { family } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Choice, askChoice, seedOf } from "../../kit";

const CASES = ["half", "meiosis", "doubling", "female", "advantage"] as const;
type Case = (typeof CASES)[number];

const choices: Record<Case, Choice> = {
  half: {
    prompt: {
      en: "Compared with body cells, germ cells have:",
      hi: "शरीर कोशिकाओं की तुलना में जनन कोशिकाओं में होते हैं:",
    },
    right: { en: "half the chromosomes and half the DNA", hi: "आधे गुणसूत्र और आधा DNA" },
    wrong: [
      { en: "twice the chromosomes and twice the DNA", hi: "दुगुने गुणसूत्र और दुगुना DNA" },
      { en: "the same chromosomes and the same DNA", hi: "उतने ही गुणसूत्र और उतना ही DNA" },
    ],
    why: {
      en: "Special lineages of cells carry half the chromosomes and DNA, so fusion restores the normal amount.",
      hi: "विशेष कोशिकाओं में आधे गुणसूत्र और DNA होते हैं, ताकि मिलने पर सामान्य मात्रा लौट आए।",
    },
  },
  meiosis: {
    prompt: {
      en: "The cell division that makes germ cells with half the chromosomes is:",
      hi: "आधे गुणसूत्रों वाली जनन कोशिकाएँ बनाने वाला कोशिका विभाजन है:",
    },
    right: { en: "Meiosis", hi: "अर्धसूत्री विभाजन (मिऑसिस)" },
    wrong: [
      { en: "Budding", hi: "मुकुलन" },
      { en: "Fragmentation", hi: "खंडन" },
    ],
    why: {
      en: "Halving the chromosome number for germ cells is done by meiosis.",
      hi: "जनन कोशिकाओं के लिए गुणसूत्र संख्या आधी करना अर्धसूत्री विभाजन करता है।",
    },
  },
  doubling: {
    prompt: {
      en: "If germ cells carried the full DNA of each parent, what would happen?",
      hi: "अगर जनन कोशिकाएँ हर जनक का पूरा DNA ले जातीं, तो क्या होता?",
    },
    right: { en: "The DNA would double in each generation", hi: "हर पीढ़ी में DNA दुगुना होता जाता" },
    wrong: [
      {
        en: "Nothing would change from one generation to the next",
        hi: "एक पीढ़ी से दूसरी तक कुछ नहीं बदलता",
      },
      { en: "The DNA would halve in each generation", hi: "हर पीढ़ी में DNA आधा होता जाता" },
    ],
    why: {
      en: "Combining two full DNA copies doubles the amount each generation, which would mess up the DNA's control of the cell.",
      hi: "दो पूरी DNA प्रतियाँ मिलाने से हर पीढ़ी में मात्रा दोगुनी होती, जो कोशिका पर DNA का नियंत्रण बिगाड़ देती।",
    },
  },
  female: {
    prompt: {
      en: "The large germ cell that contains the food stores is called the:",
      hi: "भोजन भंडार वाली बड़ी जनन कोशिका कहलाती है:",
    },
    right: { en: "Female gamete", hi: "मादा युग्मक" },
    wrong: [
      { en: "The male gamete", hi: "नर युग्मक" },
      { en: "Spore", hi: "बीजाणु" },
    ],
    why: {
      en: "By convention the large, food-storing germ cell is the female gamete; the small, motile one is the male gamete.",
      hi: "परंपरा से बड़ी, भोजन संग्रह करने वाली जनन कोशिका मादा युग्मक है; छोटी, गतिशील नर युग्मक।",
    },
  },
  advantage: {
    prompt: {
      en: "What is the main advantage of sexual reproduction over asexual reproduction?",
      hi: "अलैंगिक जनन की तुलना में लैंगिक जनन का मुख्य लाभ क्या है?",
    },
    right: {
      en: "It makes more variation by combining two parents' DNA",
      hi: "यह दो जनकों का DNA मिलाकर अधिक विभिन्नता लाता है",
    },
    wrong: [
      {
        en: "It needs only one parent, so it is faster",
        hi: "इसमें केवल एक जनक चाहिए, इसलिए यह तेज़ है",
      },
      {
        en: "It always makes offspring that are exact copies of the parent",
        hi: "यह हमेशा जनक की हूबहू प्रति वाली संतति बनाता है",
      },
    ],
    why: {
      en: "Combining variations already present in two living individuals makes new combinations quickly, which helps the species survive.",
      hi: "दो जीवित जीवों में पहले से मौजूद विभिन्नताओं को मिलाने से जल्दी नए मेल बनते हैं, जो स्पीशीज़ को बचाते हैं।",
    },
  },
};

/** NCERT 8.3.1: why sexual reproduction, the doubling problem, germ cells with half the chromosomes (meiosis), zygote, and male and female gametes. */
export const germCells = family({
  level: Level.Medium,
  tests: [Concept.WhyTwoParents],
  params: z.object({ case: z.enum(CASES) }).strict(),
  build: ({ case: c }, b) => askChoice(b, choices[c], seedOf(CASES, c)),
});

import { family, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Item, itemBoard, seedOf } from "../../quiz";

const items = {
  fission: {
    prompt: t("In nuclear fission…", "नाभिकीय विखंडन में…"),
    right: t("a heavy nucleus splits into lighter ones", "एक भारी नाभिक हल्के नाभिकों में टूटता है"),
    wrong: [
      {
        label: t("two light nuclei join into a heavier one", "दो हल्के नाभिक जुड़कर भारी नाभिक बनते हैं"),
        feedback: t("That's fusion, which powers the Sun.", "वह संलयन है, जो सूर्य को ऊर्जा देता है।"),
      },
      {
        label: t("an atom burns in oxygen to give out heat", "एक परमाणु ऑक्सीजन में जलकर ऊष्मा देता है"),
        feedback: t(
          "Burning is chemical. Fission is the nucleus splitting.",
          "जलना रासायनिक है। विखंडन नाभिक का टूटना है।",
        ),
      },
    ],
  },
  neutron: {
    prompt: t(
      "What starts the fission of a uranium-235 nucleus in a reactor?",
      "रिएक्टर में यूरेनियम-235 नाभिक का विखंडन किससे शुरू होता है?",
    ),
    right: t("A slow neutron", "एक धीमा न्यूट्रॉन"),
    wrong: [
      {
        label: t("A flame heating it up", "उसे गर्म करती एक लौ"),
        feedback: t(
          "Heat doesn't split nuclei; a slow neutron does.",
          "ऊष्मा नाभिक नहीं तोड़ती; धीमा न्यूट्रॉन तोड़ता है।",
        ),
      },
      {
        label: t("A spark of electricity", "बिजली की एक चिंगारी"),
        feedback: t(
          "Fission is started by a neutron, not electricity.",
          "विखंडन न्यूट्रॉन से शुरू होता है, बिजली से नहीं।",
        ),
      },
    ],
  },
  hazard: {
    prompt: t(
      "What is the major hazard of nuclear power generation? (Exercise 8)",
      "नाभिकीय विद्युत उत्पादन का मुख्य ख़तरा क्या है? (अभ्यास 8)",
    ),
    right: t("Storing radioactive spent fuel safely", "रेडियोधर्मी प्रयुक्त ईंधन का सुरक्षित भंडारण"),
    wrong: [
      {
        label: t("Thick black smoke from burning uranium fuel", "यूरेनियम ईंधन जलने से घना काला धुआँ"),
        feedback: t(
          "Uranium isn't burnt; the danger is radioactive waste.",
          "यूरेनियम जलता नहीं; ख़तरा रेडियोधर्मी कचरा है।",
        ),
      },
      {
        label: t("Large areas of land drowned by the reactor", "रिएक्टर द्वारा ज़मीन के बड़े क्षेत्र डूबना"),
        feedback: t(
          "That's a problem with dams, not reactors.",
          "वह बाँधों की समस्या है, रिएक्टरों की नहीं।",
        ),
      },
    ],
  },
  india: {
    prompt: t(
      "Which of these is a nuclear power plant in India?",
      "इनमें से कौन भारत का नाभिकीय विद्युत संयंत्र है?",
    ),
    right: t("Tarapur", "तारापुर"),
    wrong: [
      {
        label: t("Tehri", "टिहरी"),
        feedback: t("Tehri is a dam on the Bhagirathi.", "टिहरी भागीरथी पर एक बाँध है।"),
      },
      {
        label: t("Bhakra Nangal", "भाखड़ा नंगल"),
        feedback: t("Bhakra is a dam on the Sutlej.", "भाखड़ा सतलुज पर एक बाँध है।"),
      },
    ],
  },
} satisfies Record<string, Item>;

type Key = keyof typeof items;

/** Nuclear fission, reactors and their hazards (NCERT 14.3.4; Exercise 8). */
export const nuclearFacts = family({
  level: Level.Easy,
  tests: [Concept.NuclearEnergy],
  params: z.object({ item: z.enum(Object.keys(items) as [Key, ...Key[]]) }).strict(),
  build: ({ item }, b) => itemBoard(b, items[item], seedOf(item)),
});

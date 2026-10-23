import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  GermAction,
  GermMode,
  ReproductionScene,
  germCellsDef,
  reproductionSceneDef,
} from "@chalk/prop-reproduction";

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** Why do Grandpa's peas need flowers and bees, when the money plant doesn't? */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const peas = b.prop(reproductionSceneDef, "peas", { scene: ReproductionScene.BeeOnPeas });
  b.standsFor(
    peas,
    "Grandpa's pea plants on a frame, covered in flowers, a bee visiting; Kabir points",
  );
  return column([
    w.title(t("Why bother with flowers?", "फूलों का झंझट क्यों?")),
    peas,
    w.body(
      t(
        'Recap: 29 pots are filled, all from one parent each. Kabir points at Grandpa\'s pea plants, covered in flowers and buzzing with bees. "The money plant just needed a cut piece in water. Why do the peas need flowers, and bees, and weeks of waiting?"',
        'पिछली बार: 29 गमले भर चुके हैं, हर एक किसी एक जनक से। कबीर दादाजी के मटर के पौधों की ओर इशारा करता है, जो फूलों से भरे हैं और मधुमक्खियों से गूँज रहे हैं। "मनी प्लांट को तो बस पानी में एक कटा टुकड़ा चाहिए था। मटर को फूल, मधुमक्खियाँ और हफ़्तों का इंतज़ार क्यों चाहिए?"',
      ),
    ),
    w.body(
      t(
        'Grandpa smiles. "Because a pea seed comes from two germ cells joining." Why would any living thing take the slow, complicated road?',
        'दादाजी मुस्कुराते हैं। "क्योंकि मटर का बीज दो जनन कोशिकाओं के मिलने से बनता है।" कोई जीव धीमा, उलझा हुआ रास्ता क्यों चुनेगा?',
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Two individuals; sexual reproduction defined; combining variations. */
const twoParents = page(
  "two-parents",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "NCERT 8.3, 8.3.1: bulls alone can't make calves; sexual reproduction needs two individuals. DNA copying is precise enough that variation arises slowly; combining DNA from two individuals with different accumulated variations makes new combinations fast, which helps the species survive.",
    );
    const faster = choiceQuestion(b, {
      name: "faster",
      prompt: t(
        "Why does combining DNA from two individuals create variety faster than copying alone?",
        "दो जीवों का DNA मिलाने से अकेली नक़ल की तुलना में विविधता तेज़ी से क्यों बनती है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Each parent already carries its own different variations, so every child gets a new mix",
            "हर जनक पहले से अपनी अलग विभिन्नताएँ रखता है, इसलिए हर संतान को एक नया मेल मिलता है",
          ),
        },
        {
          id: "errors",
          label: t("It makes more copying mistakes", "इसमें नक़ल की ज़्यादा ग़लतियाँ होती हैं"),
          feedback: t(
            "More mistakes would kill many cells. The trick is mixing variations that two living parents have already built up, which are known not to be harmful.",
            "ज़्यादा ग़लतियाँ बहुत सी कोशिकाओं को मार देतीं। तरकीब है उन विभिन्नताओं को मिलाना जो दो जीवित जनकों में पहले से जमा हैं, और जो हानिकारक नहीं हैं।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Two individuals, one new life", "दो जीव, एक नया जीवन")),
      w.body(
        t(
          "Bulls alone can't produce calves, and hens alone can't produce chicks. Both sexes, **males** and **females**, are needed for a new generation.",
          "अकेले बैल बछड़े पैदा नहीं कर सकते, और अकेली मुर्गियाँ चूज़े नहीं। नई पीढ़ी के लिए दोनों लिंग, **नर** और **मादा**, चाहिए।",
        ),
      ),
      w.definition(
        t(
          "**Sexual reproduction.** Reproduction that involves **two individuals** in creating a new individual is **sexual reproduction**. It combines DNA from the two parents.",
          "**लैंगिक जनन।** वह जनन जिसमें नया जीव बनाने में **दो जीव** भाग लेते हैं, **लैंगिक जनन** है। इसमें दोनों जनकों का DNA मिलता है।",
        ),
      ),
      w.body(
        t(
          "Why? Recall that DNA copying makes variations, which help a species survive. But copying is precise enough that new variations appear only slowly. (If it were sloppier, many copies wouldn't work and the cells would die.) Two different individuals, though, have each built up their own pattern of variations over generations, and since both are alive, those variations aren't really harmful. Combining them gives a brand-new combination in every offspring, much faster.",
          "क्यों? याद करो कि DNA की नक़ल विभिन्नताएँ बनाती है, जो स्पीशीज़ को बचने में मदद करती हैं। पर नक़ल इतनी सटीक है कि नई विभिन्नताएँ धीरे-धीरे ही आती हैं। (अगर यह ज़्यादा लापरवाह होती, तो बहुत सी प्रतियाँ काम न करतीं और कोशिकाएँ मर जातीं।) पर दो अलग जीवों ने पीढ़ियों में अपनी-अपनी विभिन्नताएँ जमा की हैं, और क्योंकि दोनों ज़िंदा हैं, वे विभिन्नताएँ सचमुच हानिकारक नहीं हैं। उन्हें मिलाने से हर संतान में एक बिल्कुल नया मेल बनता है, कहीं ज़्यादा तेज़ी से।",
        ),
      ),
      faster,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The doubling problem, and the solution: germ cells with half the DNA. */
const half = page(
  "half",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "NCERT 8.3.1: if each new generation combined two full DNA copies, DNA would double every generation and mess up control of the cell. Solution: germ cells in special organs carry half the chromosomes and DNA (made by meiosis); fusion restores the normal number in the zygote.",
    );
    const cells = b.prop(germCellsDef, "cells", {
      mode: GermMode.Doubling,
      step: 0,
      showNames: true,
      canStep: true,
    });
    b.studentOnly(cells.action(GermAction.Next));
    b.studentOnly(cells.action(GermAction.Reset));
    b.standsFor(
      cells,
      "if parents passed on full sets, chromosomes would go 4, 8, 16 over generations: the doubling problem",
    );
    const fix = b.prop(germCellsDef, "fix", {
      mode: GermMode.Halving,
      step: 0,
      showNames: true,
      canStep: true,
    });
    b.studentOnly(fix.action(GermAction.Next));
    b.studentOnly(fix.action(GermAction.Reset));
    b.standsFor(
      fix,
      "each parent's body cell has 4 chromosomes; its germ cell carries 2; fusion of two germ cells gives a zygote with 4 again",
    );
    const zygote = choiceQuestion(b, {
      name: "zygote",
      prompt: t(
        "Step through the second picture. A body cell has 4 chromosomes. How many does the zygote have?",
        "दूसरा चित्र क़दम-दर-क़दम देखो। एक शरीर कोशिका में 4 गुणसूत्र हैं। युग्मनज में कितने हैं?",
      ),
      options: [
        { id: "right", label: t("4, the same as the parents", "4, जनकों जितने") },
        {
          id: "eight",
          label: t("8, twice the parents' number", "8, जनकों के दुगुने"),
          feedback: t(
            "That would happen if germ cells carried full sets. Each germ cell carries half (2), so the zygote gets 2 + 2 = 4.",
            "ऐसा तब होता अगर जनन कोशिकाएँ पूरे सेट ले जातीं। हर जनन कोशिका आधे (2) ले जाती है, इसलिए युग्मनज को 2 + 2 = 4 मिलते हैं।",
          ),
        },
        {
          id: "two",
          label: t("2, half the parents' number", "2, जनकों के आधे"),
          feedback: t(
            "2 is what each germ cell carries. Two germ cells fuse, so the zygote has 2 + 2 = 4.",
            "2 तो हर जनन कोशिका ले जाती है। दो जनन कोशिकाएँ मिलती हैं, इसलिए युग्मनज में 2 + 2 = 4 होते हैं।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("The doubling problem", "दोगुना होने की समस्या")),
      w.body(
        t(
          "There's a catch. If every new generation got the full DNA of *both* parents, it would have twice the DNA of the generation before. Step through what would happen.",
          "एक अड़चन है। अगर हर नई पीढ़ी को *दोनों* जनकों का पूरा DNA मिलता, तो उसमें पिछली पीढ़ी से दोगुना DNA होता। देखो क्या होता।",
        ),
      ),
      cells,
      w.body(
        t(
          "That much extra DNA would mess up the DNA's control of the cell. The solution many organisms use:",
          "इतना अतिरिक्त DNA कोशिका पर DNA के नियंत्रण को बिगाड़ देता। बहुत से जीव यह हल अपनाते हैं:",
        ),
      ),
      w.definition(
        t(
          "**Germ cells, meiosis and zygote.** Special organs make **germ cells** (also called **gametes**) with only **half** the number of chromosomes and half the DNA of the ordinary body cells. The cell division that halves them is **meiosis**. When two germ cells from two individuals fuse, the cell formed, the **zygote**, has the normal number again.",
          "**जनन कोशिकाएँ, अर्धसूत्री विभाजन और युग्मनज।** ख़ास अंग **जनन कोशिकाएँ** (जिन्हें **युग्मक** भी कहते हैं) बनाते हैं, जिनमें सामान्य शरीर कोशिकाओं के मुक़ाबले केवल **आधे** गुणसूत्र और आधा DNA होता है। जो कोशिका विभाजन उन्हें आधा करता है, वह **अर्धसूत्री विभाजन** (मिऑसिस) है। जब दो जीवों की दो जनन कोशिकाएँ मिलती हैं, तो बनी कोशिका, **युग्मनज**, में फिर से सामान्य संख्या होती है।",
        ),
      ),
      fix,
      zygote,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Gametes specialise: a big food-storing egg, a small motile sperm. */
const gametes = page(
  "gametes",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "NCERT 8.3.1: the zygote needs stored energy to develop. In very simple organisms the two germ cells are alike; in complex ones one is large with food stores (female gamete) and the other small and motile (male gamete).",
    );
    const pair = b.prop(germCellsDef, "pair", {
      mode: GermMode.Gametes,
      step: 0,
      showNames: true,
      canStep: true,
    });
    b.studentOnly(pair.action(GermAction.Next));
    b.studentOnly(pair.action(GermAction.Reset));
    b.standsFor(
      pair,
      "in a simple organism two alike germ cells; in a complex one a large egg with food stores and a small sperm with a tail",
    );
    const male = choiceQuestion(b, {
      name: "male",
      prompt: t(
        "Which germ cell is conventionally called the male gamete?",
        "परंपरा से किस जनन कोशिका को नर युग्मक कहा जाता है?",
      ),
      options: [
        { id: "right", label: t("The small one that can move", "छोटी वाली जो चल सकती है") },
        {
          id: "big",
          label: t("The large one with stored food", "बड़ी वाली जिसमें भोजन भंडार है"),
          feedback: t(
            "The large, food-storing germ cell is the female gamete. The small, motile one is the male gamete.",
            "बड़ी, भोजन संग्रह करने वाली जनन कोशिका मादा युग्मक है। छोटी, चलने वाली नर युग्मक है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Two kinds of germ cell", "दो तरह की जनन कोशिकाएँ")),
      w.body(
        t(
          "To grow into an organism with specialised tissues and organs, the zygote needs a good **store of energy**. In very simple organisms the two germ cells are much alike. As body designs get more complex, the germ cells specialise.",
          "विशिष्ट ऊतकों और अंगों वाले जीव में बढ़ने के लिए युग्मनज को ऊर्जा का अच्छा **भंडार** चाहिए। बहुत सरल जीवों में दोनों जनन कोशिकाएँ लगभग एक जैसी होती हैं। जैसे-जैसे शारीरिक संरचना जटिल होती है, जनन कोशिकाएँ विशिष्ट होती जाती हैं।",
        ),
      ),
      w.definition(
        t(
          "**Male and female gametes.** One germ cell is large and contains the food stores: by convention, the **female gamete**. The other is smaller and likely to move (**motile**): the **male gamete**. Making these two different gametes is why male and female reproductive organs differ, and in some species the bodies of males and females too.",
          "**नर और मादा युग्मक।** एक जनन कोशिका बड़ी होती है और उसमें भोजन भंडार होता है: परंपरा से, **मादा युग्मक**। दूसरी छोटी होती है और चल सकती है (**गतिशील**): **नर युग्मक**। ये दो अलग युग्मक बनाने के कारण ही नर और मादा जनन अंग अलग होते हैं, और कुछ स्पीशीज़ में नर और मादा के शरीर भी।",
        ),
      ),
      pair,
      male,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** Seedlings vary, cuttings don't. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const peas = b.prop(reproductionSceneDef, "peas", { scene: ReproductionScene.BeeOnPeas });
    b.standsFor(peas, "the pea plants in flower, a bee visiting");
    const differ = choiceQuestion(b, {
      name: "differ",
      prompt: t(
        "Riya notices: last year's pea seedlings came up a little different from each other, but the money-plant cuttings are all alike. Why?",
        "रिया देखती है: पिछले साल मटर के पौधे एक-दूसरे से थोड़े अलग निकले थे, पर मनी प्लांट की कलमें सब एक जैसी हैं। क्यों?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Each pea seed comes from two germ cells joining, often from two different plants; a cutting just copies one parent",
            "हर मटर का बीज दो जनन कोशिकाओं के मिलने से बनता है, अक्सर दो अलग पौधों से; कलम बस एक जनक की नक़ल है",
          ),
        },
        {
          id: "soil",
          label: t("The peas got different soil", "मटर को अलग मिट्टी मिली"),
          feedback: t(
            "Soil can change how well a plant grows, but the built-in differences come from the new mix of two parents' DNA in each seed.",
            "मिट्टी से पौधे की बढ़त बदल सकती है, पर अंतर्निहित अंतर हर बीज में दो जनकों के DNA के नए मेल से आते हैं।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const stop = w.definition(
      t(
        "**Stop 4 done.** Sexual reproduction combines DNA from two parents, giving new variations fast. Germ cells carry half the DNA, so the zygote has the normal amount; in complex organisms there is a big food-storing egg and a small motile sperm. Next stop: what exactly happens inside a pea flower.",
        "**पड़ाव 4 पूरा।** लैंगिक जनन दो जनकों का DNA मिलाता है, जिससे तेज़ी से नई विभिन्नताएँ बनती हैं। जनन कोशिकाओं में आधा DNA होता है, इसलिए युग्मनज में सामान्य मात्रा होती है; जटिल जीवों में भोजन संग्रह करने वाला बड़ा अंड और छोटा गतिशील शुक्राणु होता है। अगला पड़ाव: मटर के फूल के अंदर असल में क्या होता है।",
      ),
      "stop",
      { isHidden: true },
    );
    b.when(differ.on(QuestionSignal.Correct), [theBoard.show(stop), theBoard.pass()]);
    return column([
      w.title(t("Back among the peas", "फिर मटर के बीच")),
      peas,
      differ,
      stop,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** NCERT Exercise 4 and in-text Q5. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const advantage = choiceQuestion(b, {
      name: "advantage",
      prompt: t(
        "What is the main advantage of sexual reproduction over asexual reproduction?",
        "अलैंगिक जनन की तुलना में लैंगिक जनन का मुख्य लाभ क्या है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "It creates more variation, which helps the species survive",
            "यह ज़्यादा विभिन्नता बनाता है, जो स्पीशीज़ को बचने में मदद करती है",
          ),
        },
        {
          id: "quick",
          label: t("It is quicker and needs only one parent", "यह जल्दी होता है और एक ही जनक चाहिए"),
          feedback: t(
            "That describes asexual reproduction. Sexual reproduction is slower and needs two parents, but it mixes their DNA into new combinations.",
            "वह अलैंगिक जनन का वर्णन है। लैंगिक जनन धीमा है और दो जनक चाहिए, पर यह उनके DNA को नए मेलों में मिलाता है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const essential = choiceQuestion(b, {
      name: "essential",
      prompt: t(
        "Why is DNA copying an essential part of reproduction?",
        "DNA प्रतिकृति जनन का अनिवार्य भाग क्यों है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Each new individual needs its own copy of the blueprint for its body design",
            "हर नए जीव को अपनी शारीरिक संरचना के ख़ाके की अपनी प्रति चाहिए",
          ),
        },
        {
          id: "food",
          label: t("DNA is the cell's food", "DNA कोशिका का भोजन है"),
          feedback: t(
            "DNA isn't food; it's the information for making proteins. Each new individual must receive a copy of it.",
            "DNA भोजन नहीं है; यह प्रोटीन बनाने की सूचना है। हर नए जीव को इसकी एक प्रति मिलनी चाहिए।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ Sexual reproduction: two parents, DNA combined, faster variation. ✓ Germ cells carry half the chromosomes (meiosis); the zygote has the full number. ✓ Female gamete: big, with food. Male gamete: small, motile. Next: the pea flower, up close.",
        "**मिशन लॉग।** ✓ लैंगिक जनन: दो जनक, DNA मिलता है, तेज़ विभिन्नता। ✓ जनन कोशिकाओं में आधे गुणसूत्र (अर्धसूत्री विभाजन); युग्मनज में पूरी संख्या। ✓ मादा युग्मक: बड़ा, भोजन के साथ। नर युग्मक: छोटा, गतिशील। आगे: मटर का फूल, पास से।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(essential.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), advantage, essential, log, space()]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [hook, twoParents, half, gametes, inLife, yourTurn];

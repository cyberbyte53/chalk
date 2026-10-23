import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  HeredityScene,
  ShuffleAction,
  ShuffleMode,
  chromosomeShuffleDef,
  heredityStoryDef,
} from "@chalk/prop-heredity";

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** Kabir: but what *is* a T? */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const garden = b.prop(heredityStoryDef, "garden", { scene: HeredityScene.ShortSurprise });
  b.standsFor(garden, "Grandpa's row of tall and short pea plants");
  return column([
    w.title(t("What is a T, really?", "असल में T है क्या?")),
    garden,
    w.body(
      t(
        "**Stop 4.** So far: genes come in pairs, germ cells carry one copy, and different traits are shuffled separately. Kabir isn't satisfied. \"A plant doesn't have letters inside it. What actually makes a TT plant tall and a tt plant short? And how does a germ cell know to take just one of each pair?\"",
        '**पड़ाव 4।** अब तक: जीन जोड़ियों में आते हैं, जनन कोशिका में एक प्रति होती है, और अलग-अलग लक्षण अलग-अलग फेंटे जाते हैं। कबीर संतुष्ट नहीं है। "पौधे के अंदर अक्षर तो होते नहीं। असल में TT पौधे को लंबा और tt को बौना क्या बनाता है? और जनन कोशिका को कैसे पता कि हर जोड़ी से बस एक लेनी है?"',
      ),
    ),
    w.body(
      t(
        "Two good questions. This lesson goes inside the cell to answer both.",
        "दो अच्छे सवाल। इनका उत्तर पाने के लिए यह पाठ कोशिका के अंदर चलता है।",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** DNA → protein; a gene is the stretch of DNA for one protein; enzyme → hormone → height. */
const genesMakeProteins = page(
  "genes-make-proteins",
  (b) => {
    const w = wordsOn(b);
    const short = choiceQuestion(b, {
      name: "short",
      prompt: t(
        "The t version of the gene makes a less efficient enzyme. Why is a tt plant short?",
        "जीन का t रूप कम कुशल एंज़ाइम बनाता है। tt पौधा बौना क्यों होता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Less of the growth hormone is made, so it grows less",
            "वृद्धि हॉर्मोन कम बनता है, इसलिए वह कम बढ़ता है",
          ),
        },
        {
          id: "letter",
          label: t("The letter t tells the stem to stop", "अक्षर t तने को रुकने को कहता है"),
          feedback: t(
            "The letters are just our labels. Inside the plant, the gene is DNA that makes an enzyme; a weaker enzyme means less hormone, and less growth.",
            "अक्षर केवल हमारे नाम हैं। पौधे के अंदर जीन DNA है जो एंज़ाइम बनाता है; कमज़ोर एंज़ाइम यानी कम हॉर्मोन, और कम वृद्धि।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Genes make proteins", "जीन प्रोटीन बनाते हैं")),
      w.definition(
        t(
          "**Protein and gene.** Much of the work in a cell is done by **proteins**. Some proteins, called **enzymes**, speed up the cell's chemical reactions. The cell's DNA holds the information for making its proteins. A section of DNA that provides the information for **one protein** is called the **gene** for that protein.",
          "**प्रोटीन और जीन।** कोशिका का ज़्यादातर काम **प्रोटीन** करते हैं। कुछ प्रोटीन, जिन्हें **एंज़ाइम** कहते हैं, कोशिका की रासायनिक अभिक्रियाओं को तेज़ करते हैं। कोशिका के DNA में उसके प्रोटीन बनाने की जानकारी होती है। DNA का वह हिस्सा जो **एक प्रोटीन** बनाने की जानकारी देता है, उस प्रोटीन का **जीन** कहलाता है।",
        ),
      ),
      w.body(
        t(
          "Take tallness. Plants make **hormones** (chemical messengers) that trigger growth. How tall a plant grows can depend on how much of one growth hormone it makes. Making that hormone needs an enzyme. If the enzyme works well, lots of hormone is made and the plant is tall. If the gene for the enzyme has a change that makes the enzyme work poorly, less hormone is made and the plant is short.",
          "लंबाई को लो। पौधे **हॉर्मोन** (रासायनिक संदेशवाहक) बनाते हैं जो वृद्धि शुरू करते हैं। पौधा कितना लंबा होगा, यह इस पर निर्भर कर सकता है कि वह एक वृद्धि हॉर्मोन कितना बनाता है। वह हॉर्मोन बनाने के लिए एक एंज़ाइम चाहिए। अगर एंज़ाइम अच्छा काम करे, तो बहुत हॉर्मोन बनता है और पौधा लंबा होता है। अगर एंज़ाइम के जीन में ऐसा बदलाव हो कि एंज़ाइम ठीक से काम न करे, तो हॉर्मोन कम बनता है और पौधा बौना होता है।",
        ),
      ),
      w.body(t("gene → enzyme → hormone → height", "जीन → एंज़ाइम → हॉर्मोन → ऊँचाई")),
      w.body(
        t(
          "So **genes control traits**: through the proteins they make.",
          "तो **जीन लक्षणों को नियंत्रित करते हैं**: उन प्रोटीनों के ज़रिए जो वे बनाते हैं।",
        ),
      ),
      short,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Two sets of genes; chromosomes; germ cells take one of each pair; fusion restores the pairs. */
const chromosomes = page(
  "chromosomes",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "Body cells have chromosomes in pairs, one of each pair from each parent. A germ cell takes one chromosome from each pair; two germ cells fuse and the new cell has pairs again. Stepped by the learner.",
    );
    const cells = b.prop(chromosomeShuffleDef, "cells", {
      mode: ShuffleMode.Pairs,
      pairs: 3,
      step: 0,
      canStep: true,
      canShuffle: true,
    });
    b.standsFor(
      cells,
      "a mother's and a father's body cells with three chromosome pairs, stepped through: germ cells with one of each pair, fusion, the new cell with pairs again",
    );
    const half = choiceQuestion(b, {
      name: "half",
      prompt: t(
        "Step through to the end. A body cell has 3 pairs here. How many chromosomes does a germ cell have, and how many does the new cell have?",
        "अंत तक आगे बढ़ो। यहाँ एक शरीर कोशिका में 3 जोड़ियाँ हैं। जनन कोशिका में कितने गुणसूत्र हैं, और नई कोशिका में कितने?",
      ),
      options: [
        { id: "right", label: t("3, then 6 again", "3, फिर फिर से 6") },
        {
          id: "six",
          label: t("6, then 12", "6, फिर 12"),
          feedback: t(
            "If germ cells kept all 6, every generation would double the number. Each germ cell takes one of each pair: 3. Two of them make 6 again.",
            "अगर जनन कोशिकाएँ सारे 6 रखतीं, तो हर पीढ़ी में संख्या दुगुनी होती। हर जनन कोशिका हर जोड़ी से एक लेती है: 3। दो मिलकर फिर 6 बनाती हैं।",
          ),
        },
      ],
      answer: "right",
    });
    b.witness(
      cells.learner(ShuffleAction.Next),
      cells.learner(ShuffleAction.Next),
      cells.learner(ShuffleAction.Next),
    );
    return column([
      w.title(t("Chromosomes: genes in pieces", "गुणसूत्र: टुकड़ों में जीन")),
      w.body(
        t(
          "If both parents help decide each trait, each parent must give the child a copy of the same gene. So every pea plant has **two sets** of all its genes, one from each parent. For this to work, each germ cell must carry only **one set**.",
          "अगर दोनों जनक हर लक्षण तय करने में हाथ बँटाते हैं, तो हर जनक को बच्चे को उसी जीन की एक प्रति देनी होगी। इसलिए हर मटर के पौधे में अपने सारे जीनों के **दो सेट** होते हैं, हर जनक से एक। इसके लिए हर जनन कोशिका में केवल **एक सेट** होना चाहिए।",
        ),
      ),
      w.definition(
        t(
          "**Chromosome.** A cell's set of genes is not one long thread of DNA but several separate pieces, each called a **chromosome**. A body cell has **two copies of each chromosome**, a pair: one from the mother, one from the father.",
          "**गुणसूत्र।** कोशिका का जीन-सेट DNA का एक लंबा धागा नहीं, बल्कि कई अलग टुकड़े हैं, जिनमें से हर एक **गुणसूत्र** कहलाता है। शरीर की कोशिका में **हर गुणसूत्र की दो प्रतियाँ** होती हैं, एक जोड़ी: एक माँ से, एक पिता से।",
        ),
      ),
      w.definition(
        t(
          "**Fertilisation and zygote.** When a germ cell is made, it takes **one chromosome from each pair**. When two germ cells join (**fertilisation**), the new cell, the **zygote**, has pairs again. The zygote grows into the new individual.",
          "**निषेचन और युग्मनज।** जनन कोशिका बनते समय वह **हर जोड़ी से एक गुणसूत्र** लेती है। जब दो जनन कोशिकाएँ मिलती हैं (**निषेचन**), तो नई कोशिका, **युग्मनज**, में फिर से जोड़ियाँ होती हैं। युग्मनज बढ़कर नया जीव बनता है।",
        ),
      ),
      w.body(
        t(
          "Step through it: **next** moves from the parents' cells to the germ cells, then to fertilisation, then to the new cell.",
          "आगे बढ़कर देखो: **आगे** माता-पिता की कोशिकाओं से जनन कोशिकाओं तक, फिर निषेचन तक, फिर नई कोशिका तक ले जाता है।",
        ),
      ),
      cells,
      half,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Why separate chromosomes explain independent inheritance. */
const whyIndependent = page(
  "why-independent",
  (b) => {
    const w = wordsOn(b);
    const cells = b.prop(chromosomeShuffleDef, "cells", {
      mode: ShuffleMode.Pairs,
      pairs: 3,
      step: 1,
      canStep: true,
      canShuffle: true,
    });
    b.standsFor(
      cells,
      "germ cells being made: tapping New germ cells shows a different mix of mother's and father's chromosomes each time",
    );
    const mix = choiceQuestion(b, {
      name: "mix",
      prompt: t(
        "Tap New germ cells a few times. What do you notice?",
        "नई जनन कोशिकाएँ कुछ बार दबाओ। तुम क्या देखते हो?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Each pair sends its mother's or father's copy, by chance, separately",
            "हर जोड़ी संयोग से, अलग-अलग, माँ वाली या पिता वाली प्रति भेजती है",
          ),
        },
        {
          id: "whole",
          label: t(
            "A germ cell takes all the mother's chromosomes or all the father's",
            "जनन कोशिका या तो माँ के सारे गुणसूत्र लेती है या पिता के सारे",
          ),
          feedback: t(
            "Look at the colours: one germ cell can have a mother's copy from one pair and a father's from another.",
            "रंग देखो: एक ही जनन कोशिका में एक जोड़ी से माँ की और दूसरी से पिता की प्रति हो सकती है।",
          ),
        },
      ],
      answer: "right",
    });
    b.witness(cells.learner(ShuffleAction.Shuffle));
    return column([
      w.title(t("Why traits are inherited separately", "लक्षण अलग-अलग क्यों आते हैं")),
      w.body(
        t(
          "If a germ cell took one whole set from one parent, R and y from the round green grandparent would always stay together, and so would r and Y. Then wrinkled green seeds (rryy) could never appear, yet Mendel counted 32 of them. But a germ cell picks **one chromosome from each pair**, and each pick can be the mother's copy or the father's. Genes on different chromosomes are shuffled separately: that is independent inheritance.",
          "अगर जनन कोशिका एक जनक का पूरा सेट लेती, तो गोल हरे दादा-दादी पौधे के R और y हमेशा साथ रहते, और r और Y भी। तब झुर्रीदार हरे बीज (rryy) कभी नहीं बनते, फिर भी मेंडल ने उनमें से 32 गिने। पर जनन कोशिका **हर जोड़ी से एक गुणसूत्र** चुनती है, और हर चुनाव माँ की प्रति हो सकता है या पिता की। अलग गुणसूत्रों पर बने जीन अलग-अलग फेंटे जाते हैं: यही स्वतंत्र वंशागति है।",
        ),
      ),
      cells,
      mix,
      w.body(
        t(
          "And when two germ cells join, the normal number of chromosomes comes back, so the DNA of the species stays stable from generation to generation. All sexually reproducing organisms use this mechanism.",
          "और जब दो जनन कोशिकाएँ मिलती हैं, गुणसूत्रों की सामान्य संख्या लौट आती है, इसलिए स्पीशीज़ का DNA पीढ़ी-दर-पीढ़ी स्थिर रहता है। लैंगिक जनन करने वाले सारे जीव यही तरीक़ा अपनाते हैं।",
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** Kabir's two questions, answered. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const equal = choiceQuestion(b, {
      name: "equal",
      prompt: t(
        'Kabir: "So how do Mom and Dad each give me exactly half my genes?"',
        'कबीर: "तो मम्मी और पापा मुझे ठीक आधे-आधे जीन कैसे देते हैं?"',
      ),
      options: [
        {
          id: "right",
          label: t(
            "Each germ cell has one of every chromosome pair; egg and sperm join",
            "हर जनन कोशिका में हर गुणसूत्र जोड़ी से एक होता है; अंडा और शुक्राणु मिलते हैं",
          ),
        },
        {
          id: "more",
          label: t(
            "The mother gives more, because the baby grows in her",
            "माँ ज़्यादा देती है, क्योंकि बच्चा उसके अंदर बढ़ता है",
          ),
          feedback: t(
            "The baby grows in the mother, but the genes come equally: one chromosome of each pair from the egg, the other from the sperm.",
            "बच्चा माँ के अंदर बढ़ता है, पर जीन बराबर आते हैं: हर जोड़ी का एक गुणसूत्र अंडे से, दूसरा शुक्राणु से।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const stop = w.definition(
      t(
        "**Stop 4 done.** A gene is a stretch of DNA that makes a protein, and proteins build traits like height. Chromosomes come in pairs, germ cells carry one of each, and fertilisation makes pairs again. But wait: if Kabir got half his chromosomes from each parent, just like Riya, why is he a boy and she a girl? Next stop.",
        "**पड़ाव 4 पूरा।** जीन DNA का वह हिस्सा है जो प्रोटीन बनाता है, और प्रोटीन ऊँचाई जैसे लक्षण बनाते हैं। गुणसूत्र जोड़ियों में आते हैं, जनन कोशिका में हर जोड़ी से एक होता है, और निषेचन फिर जोड़ियाँ बनाता है। पर रुको: अगर कबीर को, रिया की तरह, हर जनक से आधे गुणसूत्र मिले, तो वह लड़का और वह लड़की क्यों? अगला पड़ाव।",
      ),
      "stop",
      { isHidden: true },
    );
    b.when(equal.on(QuestionSignal.Correct), [theBoard.show(stop), theBoard.pass()]);
    return column([
      w.title(t("Back on the terrace", "फिर छत पर")),
      w.body(
        t(
          "Riya explains it to Kabir with the peas. \"Grandpa's short plants have two copies of a gene that makes a weak enzyme, so they make less growth hormone. That's all t means.\"",
          'रिया कबीर को मटर से समझाती है। "दादाजी के बौने पौधों में उस जीन की दो प्रतियाँ हैं जो कमज़ोर एंज़ाइम बनाता है, इसलिए वे वृद्धि हॉर्मोन कम बनाते हैं। t का बस यही मतलब है।"',
        ),
      ),
      equal,
      stop,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Your turn, then the mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const gene = choiceQuestion(b, {
      name: "gene",
      prompt: t("A gene is…", "जीन है…"),
      options: [
        {
          id: "right",
          label: t(
            "a section of DNA with the information for one protein",
            "DNA का वह खंड जिसमें एक प्रोटीन की सूचना हो",
          ),
        },
        {
          id: "chromosome",
          label: t("a whole chromosome with all its DNA", "अपने पूरे DNA सहित एक पूरा गुणसूत्र"),
          feedback: t(
            "A chromosome is a long piece of DNA carrying many genes. A gene is one short section of it.",
            "गुणसूत्र DNA का लंबा टुकड़ा है जिसमें कई जीन होते हैं। जीन उसका एक छोटा हिस्सा है।",
          ),
        },
        {
          id: "trait",
          label: t(
            "the trait itself that we can see, like tallness",
            "वह लक्षण स्वयं जो दिखता है, जैसे लंबाई",
          ),
          feedback: t(
            "The trait is what we see. The gene is the DNA behind it, which makes a protein that shapes the trait.",
            "लक्षण वह है जो हम देखते हैं। जीन उसके पीछे का DNA है, जो एक प्रोटीन बनाता है जो लक्षण को आकार देता है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const count = choiceQuestion(b, {
      name: "count",
      prompt: t(
        "A body cell of an animal has 8 chromosomes (4 pairs). How many does each of its germ cells have?",
        "किसी जंतु की शरीर कोशिका में 8 गुणसूत्र (4 जोड़ियाँ) हैं। उसकी हर जनन कोशिका में कितने हैं?",
      ),
      options: [
        { id: "right", label: t("4", "4") },
        {
          id: "8",
          label: t("8", "8"),
          feedback: t(
            "Then the zygote would have 16, and the number would double every generation. A germ cell has one of each pair: 4.",
            "तब युग्मनज में 16 होते, और संख्या हर पीढ़ी दुगुनी होती। जनन कोशिका में हर जोड़ी से एक होता है: 4।",
          ),
        },
        {
          id: "2",
          label: t("2", "2"),
          feedback: t(
            "Each germ cell takes one from every pair, and there are 4 pairs: 4.",
            "हर जनन कोशिका हर जोड़ी से एक लेती है, और जोड़ियाँ 4 हैं: 4।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ A gene is the DNA for one protein; proteins (like enzymes) shape traits. ✓ Genes sit on chromosomes, which come in pairs, one from each parent. ✓ Germ cells take one of each pair, so traits are shuffled independently. ✓ Fertilisation restores the pairs, keeping the species' DNA stable. Next: boy or girl.",
        "**मिशन लॉग।** ✓ जीन एक प्रोटीन का DNA है; प्रोटीन (जैसे एंज़ाइम) लक्षणों को आकार देते हैं। ✓ जीन गुणसूत्रों पर होते हैं, जो जोड़ियों में आते हैं, हर जनक से एक। ✓ जनन कोशिकाएँ हर जोड़ी से एक लेती हैं, इसलिए लक्षण स्वतंत्र रूप से फेंटे जाते हैं। ✓ निषेचन जोड़ियाँ लौटाता है, जिससे स्पीशीज़ का DNA स्थिर रहता है। आगे: लड़का या लड़की।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(count.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), gene, count, log, space()]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [hook, genesMakeProteins, chromosomes, whyIndependent, inLife, yourTurn];

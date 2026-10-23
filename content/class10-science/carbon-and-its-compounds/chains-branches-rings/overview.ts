import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { goalQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import { CarbonScene, ChainAction, ChainDerived, Shape } from "@chalk/prop-carbon";
import { ask, chainOn, oneByOne, sceneOn } from "../kit";

/** Two kinds of butane in the cylinder. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const gas = sceneOn(
    b,
    "gas",
    CarbonScene.GasCylinder,
    "the LPG cylinder, with Riya holding a phone showing two different drawings both labelled C₄H₁₀",
  );
  return column([
    w.title(t("Same formula, two shapes", "एक सूत्र, दो आकार")),
    gas,
    w.body(
      t(
        'Last time: carbon atoms join each other in chains. Riya finds something odd while reading about the cylinder gas: butane, C₄H₁₀, is drawn in **two different ways** on two websites, and both are right. Kabir: "One of them must be a typo."',
        'पिछली बार: कार्बन परमाणु आपस में शृंखलाओं में जुड़ते हैं। सिलेंडर की गैस के बारे में पढ़ते हुए रिया को कुछ अजीब मिलता है: ब्यूटेन, C₄H₁₀, दो वेबसाइटों पर **दो अलग तरह** से बनाया गया है, और दोनों सही हैं। कबीर: "एक में ज़रूर ग़लती होगी।"',
      ),
    ),
    w.body(
      t(
        "Stop 4: how can carbon chains grow, branch and close into rings, and how can one formula have two shapes?",
        "पड़ाव 4: कार्बन शृंखलाएँ कैसे बढ़ती, शाखाएँ बनाती और वलयों में बंद होती हैं, और एक सूत्र के दो आकार कैसे हो सकते हैं?",
      ),
    ),
    space(),
  ]);
});

/** Table 4.2: methane to hexane. */
const chains = page(
  "chains",
  (b) => {
    const w = wordsOn(b);
    const c = chainOn(b, "c", {
      carbons: 1,
      canSetCarbons: true,
      showFormula: true,
      showName: true,
    });
    b.standsFor(
      c,
      "a straight chain of carbons that can be made one to six long; hydrogens fill in, and the name and formula update",
    );
    const goal = goalQuestion(b, {
      about: c,
      prompt: t("Grow the chain to six carbons.", "शृंखला को छह कार्बन तक बढ़ाओ।"),
      isMet: c.field("carbons").eq(6),
      solve: [c.learner(ChainAction.SetCarbons, { carbons: 6 })],
    });
    return column([
      w.title(t("Longer chains", "लंबी शृंखलाएँ")),
      w.body(
        t(
          "Add carbons one at a time, all joined by single bonds. NCERT Table 4.2 lists the first six: methane CH₄, ethane C₂H₆, propane C₃H₈, butane C₄H₁₀, pentane C₅H₁₂, hexane C₆H₁₄.",
          "एक-एक कार्बन जोड़ो, सब एकल आबंधों से जुड़े। NCERT तालिका 4.2 पहले छह बताती है: मेथेन CH₄, एथेन C₂H₆, प्रोपेन C₃H₈, ब्यूटेन C₄H₁₀, पेंटेन C₅H₁₂, हेक्सेन C₆H₁₄।",
        ),
      ),
      c,
      goal,
      w.definition(
        t(
          "**Hydrocarbons and alkanes.** Compounds of only **carbon and hydrogen** are **hydrocarbons**. The **saturated** hydrocarbons, with single bonds only, are **alkanes**. Unsaturated hydrocarbons with a double bond are **alkenes**; with a triple bond, **alkynes**.",
          "**हाइड्रोकार्बन और ऐल्केन।** केवल **कार्बन और हाइड्रोजन** के यौगिक **हाइड्रोकार्बन** हैं। **संतृप्त** हाइड्रोकार्बन, केवल एकल आबंधों वाले, **ऐल्केन** हैं। द्विआबंध वाले असंतृप्त हाइड्रोकार्बन **ऐल्कीन** हैं; त्रिआबंध वाले, **ऐल्काइन**।",
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Butane's two skeletons; structural isomers. */
const isomers = page(
  "isomers",
  (b) => {
    const w = wordsOn(b);
    const c = chainOn(b, "c", {
      carbons: 4,
      canSetShape: true,
      showFormula: true,
      showName: false,
    });
    b.standsFor(
      c,
      "four carbons that can be drawn as a straight chain or as a chain of three with one carbon branching off the middle; the molecular formula stays C₄H₁₀",
    );
    const goal = goalQuestion(b, {
      about: c,
      prompt: t(
        "Make the branched shape. Does the formula change?",
        "शाखित आकार बनाओ। क्या सूत्र बदलता है?",
      ),
      isMet: c.field("shape").eq(Shape.Branched),
      solve: [c.learner(ChainAction.SetShape, { shape: Shape.Branched })],
    });
    const q = ask(
      b,
      "q",
      ["Both butanes are C₄H₁₀. What is different?", "दोनों ब्यूटेन C₄H₁₀ हैं। क्या अलग है?"],
      ["How the carbons are joined", "कार्बन कैसे जुड़े हैं"],
      [
        [
          "The number of hydrogens on each",
          "हर एक पर हाइड्रोजन की संख्या",
          "Both have 10. Count them in the picture.",
          "दोनों में 10 हैं। चित्र में गिनो।",
        ],
        [
          "One of them has a double bond",
          "उनमें से एक में द्विबंध है",
          "Both have only single bonds: both are saturated.",
          "दोनों में केवल एकल आबंध हैं: दोनों संतृप्त हैं।",
        ],
      ],
      { isHidden: true },
    );
    const def = w.definition(
      t(
        "**Structural isomers.** Compounds with the **same molecular formula** but **different structures** are **structural isomers**. Butane has two. Pentane, C₅H₁₂, has three: a straight chain and two branched ones.",
        "**संरचनात्मक समावयव।** **एक ही आण्विक सूत्र** पर **अलग संरचना** वाले यौगिक **संरचनात्मक समावयव** हैं। ब्यूटेन के दो हैं। पेंटेन, C₅H₁₂, के तीन हैं: एक सीधी शृंखला और दो शाखित।",
      ),
      "def",
      { isHidden: true },
    );
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(q));
    oneByOne(b, [q], [def]);
    return column([
      w.title(t("Branches: isomers", "शाखाएँ: समावयव")),
      w.body(
        t(
          "With four carbons there is a choice: join all four in a row, or join three and hang the fourth off the middle carbon. Hydrogens fill whatever bonds are left.",
          "चार कार्बनों के साथ एक विकल्प है: चारों को एक पंक्ति में जोड़ो, या तीन जोड़कर चौथे को बीच वाले कार्बन से लटका दो। जो आबंध बचें उन्हें हाइड्रोजन भरते हैं।",
        ),
      ),
      c,
      goal,
      q,
      def,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Rings: cyclohexane and benzene. */
const rings = page(
  "rings",
  (b) => {
    const w = wordsOn(b);
    const c = chainOn(b, "c", {
      carbons: 6,
      shape: Shape.Ring,
      canSetBonds: true,
      showFormula: true,
      showName: true,
    });
    b.standsFor(
      c,
      "six carbons joined in a ring; the ring bonds can be all single (cyclohexane) or alternate single and double (benzene)",
    );
    const goal = goalQuestion(b, {
      about: c,
      prompt: t(
        "Put double bonds in the ring. What compound do you get?",
        "वलय में द्विआबंध डालो। कौन-सा यौगिक बनता है?",
      ),
      isMet: c.derived(ChainDerived.Saturated).eq(false),
      solve: [c.learner(ChainAction.SetBond, { index: 0, order: 2 })],
    });
    return column([
      w.title(t("Closing the chain: rings", "शृंखला को बंद करना: वलय")),
      w.body(
        t(
          "The two ends of a chain can join, making a **ring**. Six carbons in a ring with single bonds is **cyclohexane**, C₆H₁₂: each carbon now has two carbon neighbours, so it takes only two hydrogens.",
          "शृंखला के दोनों सिरे जुड़कर **वलय** बना सकते हैं। एकल आबंधों वाले वलय में छह कार्बन **साइक्लोहेक्सेन**, C₆H₁₂ है: हर कार्बन के अब दो कार्बन पड़ोसी हैं, इसलिए वह केवल दो हाइड्रोजन लेता है।",
        ),
      ),
      c,
      goal,
      w.definition(
        t(
          "**Benzene.** A ring of six carbons with **alternating single and double bonds** is **benzene**, C₆H₆. Chains (straight or branched) and rings can be saturated or unsaturated.",
          "**बेंज़ीन।** छह कार्बनों का वलय जिसमें **एकल और द्वि आबंध बारी-बारी** से हों, **बेंज़ीन**, C₆H₆ है। शृंखलाएँ (सीधी या शाखित) और वलय संतृप्त या असंतृप्त हो सकते हैं।",
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Back to the two drawings. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const q = ask(
      b,
      "q",
      [
        "So were the two butane drawings a typo, as Kabir thought?",
        "तो क्या दोनों ब्यूटेन चित्र ग़लती थे, जैसा कबीर ने सोचा?",
      ],
      [
        "No: they are two isomers, both C₄H₁₀, joined differently",
        "नहीं: वे दो समावयव हैं, दोनों C₄H₁₀, अलग ढंग से जुड़े",
      ],
      [
        [
          "Yes: one formula can only have one shape",
          "हाँ: एक सूत्र का केवल एक आकार हो सकता है",
          "Butane has two shapes with the same formula: structural isomers.",
          "ब्यूटेन के एक ही सूत्र के दो आकार हैं: संरचनात्मक समावयव।",
        ],
      ],
    );
    const q2 = ask(
      b,
      "q2",
      [
        "NCERT Exercise 2: what are the isomers you can draw for pentane, C₅H₁₂?",
        "NCERT अभ्यास 2: पेंटेन, C₅H₁₂, के कितने समावयव बना सकते हो?",
      ],
      ["Three: a straight chain and two branched", "तीन: एक सीधी शृंखला और दो शाखित"],
      [
        [
          "Two: a straight chain and one branched",
          "दो: एक सीधी शृंखला और एक शाखित",
          "That's butane. With five carbons there's one more branched way.",
          "वह ब्यूटेन है। पाँच कार्बनों में एक और शाखित तरीक़ा है।",
        ],
        [
          "Five: one for each place a branch could go",
          "पाँच: हर उस जगह के लिए एक जहाँ शाखा लग सकती है",
          "Five is the number of carbons, not isomers.",
          "पाँच कार्बनों की संख्या है, समावयवों की नहीं।",
        ],
      ],
      { isHidden: true },
    );
    const log = w.definition(
      t(
        "**Mission log.** ✓ Hydrocarbons: alkanes, alkenes, alkynes. ✓ Chains, branches (isomers) and rings (cyclohexane, benzene). Next: what happens when other atoms join a carbon chain.",
        "**मिशन लॉग।** ✓ हाइड्रोकार्बन: ऐल्केन, ऐल्कीन, ऐल्काइन। ✓ शृंखलाएँ, शाखाएँ (समावयव) और वलय (साइक्लोहेक्सेन, बेंज़ीन)। आगे: जब कार्बन शृंखला से दूसरे परमाणु जुड़ते हैं तो क्या होता है।",
      ),
      "log",
      { isHidden: true },
    );
    oneByOne(b, [q, q2], [log]);
    return column([w.title(t("Not a typo", "ग़लती नहीं")), q, q2, log, space()]);
  },
  { passOn: PassOn.Rules },
);

const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const q1 = ask(
      b,
      "q1",
      [
        "What is the formula of propane, the 3-carbon alkane?",
        "प्रोपेन, 3-कार्बन ऐल्केन, का सूत्र क्या है?",
      ],
      ["C₃H₈", "C₃H₈"],
      [
        ["C₃H₆", "C₃H₆", "That has a double bond: propene.", "उसमें द्विआबंध है: प्रोपीन।"],
        [
          "C₃H₁₀",
          "C₃H₁₀",
          "Each end carbon takes 3 hydrogens and the middle one 2: 3 + 2 + 3 = 8.",
          "हर सिरे का कार्बन 3 हाइड्रोजन लेता है और बीच वाला 2: 3 + 2 + 3 = 8।",
        ],
      ],
    );
    const q2 = ask(
      b,
      "q2",
      ["What is the formula of cyclohexane?", "साइक्लोहेक्सेन का सूत्र क्या है?"],
      ["C₆H₁₂", "C₆H₁₂"],
      [
        [
          "C₆H₁₄",
          "C₆H₁₄",
          "That's hexane, the open chain. Closing the ring removes two hydrogens.",
          "वह हेक्सेन है, खुली शृंखला। वलय बंद करने से दो हाइड्रोजन हटते हैं।",
        ],
        [
          "C₆H₆",
          "C₆H₆",
          "That's benzene, with double bonds in the ring.",
          "वह बेंज़ीन है, वलय में द्विआबंधों के साथ।",
        ],
      ],
      { isHidden: true },
    );
    const q3 = ask(
      b,
      "q3",
      ["Which hydrocarbon has a triple bond?", "किस हाइड्रोकार्बन में त्रिआबंध है?"],
      ["An alkyne", "एक ऐल्काइन"],
      [
        ["An alkane", "एक ऐल्केन", "Alkanes have single bonds only.", "ऐल्केन में केवल एकल आबंध होते हैं।"],
        ["An alkene", "एक ऐल्कीन", "Alkenes have a double bond.", "ऐल्कीन में द्विआबंध होता है।"],
      ],
      { isHidden: true },
    );
    oneByOne(b, [q1, q2, q3]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), q1, q2, q3, space()]);
  },
  { passOn: PassOn.Rules },
);

export const overview = [hook, chains, isomers, rings, inLife, yourTurn];

import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { goalQuestion, wordsOn } from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  CarbonScene,
  ChainAction,
  ChainDerived,
  CompoundClass,
  CovalentAction,
  CovalentDerived,
  Molecule,
} from "@chalk/prop-carbon";
import { ask, chainOn, dotsOn, oneByOne, sceneOn } from "../kit";

/** The LPG cylinder: one element, millions of compounds. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const gas = sceneOn(
    b,
    "gas",
    CarbonScene.GasCylinder,
    "the red LPG cylinder under the kitchen counter, with Kabir reading its label",
  );
  return column([
    w.title(t("Millions of compounds", "लाखों यौगिक")),
    gas,
    w.body(
      t(
        "Last time: diamond and graphite are both pure carbon. Now the soap mixture will need gentle heating, so Kabir reads the LPG cylinder's label: **butane**, a carbon compound. Riya looks it up: chemists know about **three million** carbon compounds, more than all the other elements' compounds put together.",
        "पिछली बार: हीरा और ग्रेफ़ाइट दोनों शुद्ध कार्बन हैं। अब साबुन के मिश्रण को धीमी आँच चाहिए होगी, इसलिए कबीर LPG सिलेंडर का लेबल पढ़ता है: **ब्यूटेन**, एक कार्बन यौगिक। रिया पता करती है: रसायनज्ञ लगभग **तीस लाख** कार्बन यौगिकों के बारे में जानते हैं, बाक़ी सब तत्वों के यौगिकों से भी ज़्यादा।",
      ),
    ),
    w.body(t("Stop 3: what makes carbon so special?", "पड़ाव 3: कार्बन को इतना ख़ास क्या बनाता है?")),
    space(),
  ]);
});

/** Catenation, tetravalency, small size; organic compounds. */
const special = page(
  "special",
  (b) => {
    const w = wordsOn(b);
    const q = ask(
      b,
      "q",
      ["What is catenation?", "शृंखलन क्या है?"],
      [
        "An element's atoms bonding to each other in long chains",
        "किसी तत्व के परमाणुओं का आपस में लंबी शृंखलाओं में जुड़ना",
      ],
      [
        [
          "An atom sharing all four of its outer electrons with hydrogen",
          "किसी परमाणु का अपने चारों बाहरी इलेक्ट्रॉन हाइड्रोजन से साझा करना",
          "That's tetravalency, the second reason.",
          "वह चतुःसंयोजकता है, दूसरा कारण।",
        ],
        [
          "Carbon bonding with oxygen in many ways",
          "कार्बन का ऑक्सीजन से कई तरह जुड़ना",
          "Catenation is carbon bonding with carbon.",
          "शृंखलन कार्बन का कार्बन से जुड़ना है।",
        ],
      ],
      { passes: true },
    );
    return column([
      w.title(t("Three reasons", "तीन कारण")),
      w.definition(
        t(
          "**(1) Catenation.** Carbon atoms can bond with other carbon atoms, forming long **chains**, **branched chains**, and even **rings**. This ability is **catenation**. No other element does it nearly as well: silicon makes chains of only seven or eight atoms, and they are reactive.",
          "**(1) शृंखलन।** कार्बन परमाणु दूसरे कार्बन परमाणुओं से जुड़कर लंबी **शृंखलाएँ**, **शाखित शृंखलाएँ** और **वलय** तक बना सकते हैं। इस क्षमता को **शृंखलन** कहते हैं। कोई दूसरा तत्व इसे इतना अच्छा नहीं कर पाता: सिलिकॉन केवल सात-आठ परमाणुओं की शृंखलाएँ बनाता है, और वे क्रियाशील होती हैं।",
        ),
      ),
      w.definition(
        t(
          "**(2) Tetravalency.** With valency 4, each carbon can bond with four other atoms: carbon, oxygen, hydrogen, nitrogen, sulphur, chlorine and others. So many different compounds are possible.",
          "**(2) चतुःसंयोजकता।** संयोजकता 4 होने से हर कार्बन चार दूसरे परमाणुओं से जुड़ सकता है: कार्बन, ऑक्सीजन, हाइड्रोजन, नाइट्रोजन, सल्फ़र, क्लोरीन और अन्य। इसलिए बहुत सारे अलग यौगिक संभव हैं।",
        ),
      ),
      w.definition(
        t(
          "**(3) Strong bonds.** Carbon is a small atom, so its nucleus holds the shared pairs strongly. Its bonds with most elements are very strong, and its compounds are very **stable**.",
          "**(3) प्रबल आबंध।** कार्बन छोटा परमाणु है, इसलिए उसका नाभिक साझा जोड़ियों को प्रबलता से पकड़ता है। अधिकांश तत्वों के साथ इसके आबंध बहुत प्रबल हैं, और इसके यौगिक बहुत **स्थायी** हैं।",
        ),
      ),
      w.note(
        t(
          "**Organic compounds.** Carbon compounds were once thought to come only from living things, so they were called **organic**. In 1828 Friedrich Wöhler made urea, an organic compound, from ammonium cyanate in a lab, and the idea was dropped. The name stayed.",
          "**कार्बनिक यौगिक।** कभी माना जाता था कि कार्बन यौगिक केवल जीवों से आते हैं, इसलिए उन्हें **कार्बनिक** कहा गया। 1828 में फ़्रेडरिक वोहलर ने प्रयोगशाला में अमोनियम सायनेट से यूरिया, एक कार्बनिक यौगिक, बनाया, और यह धारणा छोड़ दी गई। नाम बना रहा।",
        ),
      ),
      q,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Ethane, step by step, counting its bonds (Exercise 1). */
const ethane = page(
  "ethane",
  (b) => {
    const w = wordsOn(b);
    const m = dotsOn(b, "m", Molecule.C2H6);
    b.standsFor(
      m,
      "electron-dot structure of ethane: two carbons sharing a pair, each also sharing with three hydrogens",
    );
    const goal = goalQuestion(b, {
      about: m,
      prompt: t(
        "Step through until all the pairs are shared.",
        "आगे बढ़ो जब तक सारी जोड़ियाँ साझा न हो जाएँ।",
      ),
      isMet: m.derived(CovalentDerived.IsShared),
      solve: [m.learner(CovalentAction.Next)],
    });
    const q = ask(
      b,
      "q",
      [
        "NCERT Exercise 1: how many covalent bonds does ethane, C₂H₆, have?",
        "NCERT अभ्यास 1: एथेन, C₂H₆, में कितने सहसंयोजक आबंध हैं?",
      ],
      ["7: one C–C and six C–H", "7: एक C–C और छह C–H"],
      [
        [
          "6: the six C–H bonds only",
          "6: केवल छह C–H बंध",
          "Don't forget the bond between the two carbons.",
          "दोनों कार्बनों के बीच का आबंध मत भूलो।",
        ],
        [
          "8: two C–C and six C–H",
          "8: दो C–C और छह C–H",
          "There are 6 hydrogens and 1 carbon–carbon bond.",
          "6 हाइड्रोजन हैं और 1 कार्बन–कार्बन आबंध।",
        ],
      ],
      { isHidden: true },
    );
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(q));
    return column([
      w.title(t("Two carbons: ethane", "दो कार्बन: एथेन")),
      w.body(
        t(
          "Join two carbons with a single bond. Each still has three electrons to share, so each takes three hydrogens. That's **ethane**, C₂H₆.",
          "दो कार्बनों को एकल आबंध से जोड़ो। हर एक के पास अभी भी साझा करने को तीन इलेक्ट्रॉन हैं, इसलिए हर एक तीन हाइड्रोजन लेता है। यह **एथेन** है, C₂H₆।",
        ),
      ),
      m,
      goal,
      q,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Saturated vs unsaturated: build ethene and ethyne. */
const saturated = page(
  "saturated",
  (b) => {
    const w = wordsOn(b);
    const c = chainOn(b, "c", { carbons: 2, canSetBonds: true, showFormula: true, showName: true });
    b.standsFor(
      c,
      "a two-carbon compound whose carbon–carbon bond can be made single, double or triple; hydrogens fill in automatically and the name and formula update",
    );
    const goal = goalQuestion(b, {
      about: c,
      prompt: t(
        "Make the carbon–carbon bond a double bond. What happens to the hydrogens?",
        "कार्बन–कार्बन आबंध को द्विआबंध बनाओ। हाइड्रोजनों का क्या होता है?",
      ),
      isMet: c.derived(ChainDerived.Class).eq(CompoundClass.Alkene),
      solve: [c.learner(ChainAction.SetBond, { index: 0, order: 2 })],
    });
    return column([
      w.title(t("Single, double, triple", "एकल, द्वि, त्रि")),
      w.body(
        t(
          "Two carbons can also share **two** pairs, or **three**. Each extra shared pair uses one electron from **each** carbon, so each carbon holds one hydrogen fewer: ethane C₂H₆ → ethene C₂H₄ → ethyne C₂H₂.",
          "दो कार्बन **दो** जोड़ियाँ, या **तीन**, भी साझा कर सकते हैं। हर अतिरिक्त साझा जोड़ी **हर** कार्बन से एक इलेक्ट्रॉन लेती है, इसलिए हर कार्बन एक हाइड्रोजन कम पकड़ता है: एथेन C₂H₆ → एथीन C₂H₄ → एथाइन C₂H₂।",
        ),
      ),
      c,
      goal,
      w.definition(
        t(
          "**Saturated and unsaturated.** Compounds in which carbons are joined only by **single** bonds are **saturated** (ethane, C₂H₆). Compounds with a **double** or **triple** bond between carbons are **unsaturated**: ethene, C₂H₄ (double), and ethyne, C₂H₂ (triple). Unsaturated compounds are more reactive than saturated ones.",
          "**संतृप्त और असंतृप्त।** जिन यौगिकों में कार्बन केवल **एकल** आबंधों से जुड़े हों वे **संतृप्त** हैं (एथेन, C₂H₆)। कार्बनों के बीच **द्वि** या **त्रि** आबंध वाले यौगिक **असंतृप्त** हैं: एथीन, C₂H₄ (द्वि), और एथाइन, C₂H₂ (त्रि)। असंतृप्त यौगिक संतृप्त यौगिकों से अधिक क्रियाशील होते हैं।",
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Back to the cylinder. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const gas = sceneOn(b, "gas", CarbonScene.GasCylinder, "the LPG cylinder again");
    const q = ask(
      b,
      "q",
      [
        "Butane, in the cylinder, has only single bonds between its four carbons. Is it saturated or unsaturated?",
        "सिलेंडर की ब्यूटेन में उसके चार कार्बनों के बीच केवल एकल आबंध हैं। वह संतृप्त है या असंतृप्त?",
      ],
      ["Saturated", "संतृप्त"],
      [
        [
          "Unsaturated",
          "असंतृप्त",
          "Unsaturated needs a double or triple bond between carbons. Butane has none.",
          "असंतृप्त के लिए कार्बनों के बीच द्वि या त्रि आबंध चाहिए। ब्यूटेन में कोई नहीं।",
        ],
      ],
    );
    const q2 = ask(
      b,
      "q2",
      [
        "Why can carbon make butane, a chain of four carbons, when most elements can't make chains at all?",
        "कार्बन ब्यूटेन, चार कार्बनों की शृंखला, क्यों बना पाता है जबकि अधिकांश तत्व शृंखलाएँ बना ही नहीं पाते?",
      ],
      [
        "Catenation: carbon atoms bond strongly to each other",
        "शृंखलन: कार्बन परमाणु आपस में प्रबलता से जुड़ते हैं",
      ],
      [
        [
          "Because butane is a gas",
          "क्योंकि ब्यूटेन गैस है",
          "Being a gas is a property of butane, not the reason carbon forms chains.",
          "गैस होना ब्यूटेन का गुण है, कार्बन के शृंखला बनाने का कारण नहीं।",
        ],
      ],
      { isHidden: true },
    );
    const log = w.definition(
      t(
        "**Mission log.** ✓ Catenation, tetravalency, strong bonds: why carbon makes millions of compounds. ✓ Saturated (single bonds) vs unsaturated (double or triple). Next: longer chains, branches and rings.",
        "**मिशन लॉग।** ✓ शृंखलन, चतुःसंयोजकता, प्रबल आबंध: कार्बन लाखों यौगिक क्यों बनाता है। ✓ संतृप्त (एकल आबंध) बनाम असंतृप्त (द्वि या त्रि)। आगे: लंबी शृंखलाएँ, शाखाएँ और वलय।",
      ),
      "log",
      { isHidden: true },
    );
    oneByOne(b, [q, q2], [log]);
    return column([
      w.title(t("What's in the cylinder", "सिलेंडर में क्या है")),
      gas,
      q,
      q2,
      log,
      space(),
    ]);
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
      ["Which of these is unsaturated?", "इनमें से कौन असंतृप्त है?"],
      ["Ethyne, C₂H₂", "एथाइन, C₂H₂"],
      [
        ["Ethane, C₂H₆", "एथेन, C₂H₆", "Ethane has only single bonds.", "एथेन में केवल एकल आबंध हैं।"],
        [
          "Methane, CH₄",
          "मेथेन, CH₄",
          "Methane has one carbon, with four single bonds to hydrogen.",
          "मेथेन में एक कार्बन है, हाइड्रोजन से चार एकल आबंधों के साथ।",
        ],
      ],
    );
    const q2 = ask(
      b,
      "q2",
      ["Why are carbon compounds so stable?", "कार्बन यौगिक इतने स्थायी क्यों होते हैं?"],
      [
        "Carbon is small, so its nucleus holds the shared pairs strongly",
        "कार्बन छोटा है, इसलिए उसका नाभिक साझा जोड़ियों को प्रबलता से पकड़ता है",
      ],
      [
        [
          "Carbon is a metal, and metals hold atoms tightly",
          "कार्बन धातु है, और धातुएँ परमाणुओं को कसकर पकड़ती हैं",
          "Carbon is a non-metal; its strength comes from its small size.",
          "कार्बन अधातु है; उसकी प्रबलता उसके छोटे आकार से आती है।",
        ],
        [
          "Carbon compounds are ionic, so their bonds are strong",
          "कार्बन यौगिक आयनिक हैं, इसलिए उनके बंध मज़बूत हैं",
          "They are covalent.",
          "वे सहसंयोजक हैं।",
        ],
      ],
      { isHidden: true },
    );
    oneByOne(b, [q1, q2]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), q1, q2, space()]);
  },
  { passOn: PassOn.Rules },
);

export const overview = [hook, special, ethane, saturated, inLife, yourTurn];

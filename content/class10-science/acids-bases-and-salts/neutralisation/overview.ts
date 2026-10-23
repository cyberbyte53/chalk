import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, goalQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  AcidBenchKind,
  AcidSceneKind,
  IndicatorId,
  NeutraliseAction,
  NeutraliseDerived,
  neutraliserDef,
} from "@chalk/prop-chemistry";
import { benchOn, sceneOn } from "../kit";

const r = String.raw;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** Grandpa's acidity after the trial cake: lemon, vinegar or baking soda? */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const grandpa = sceneOn(
    b,
    "grandpa",
    AcidSceneKind.GrandpaAcidity,
    "Grandpa on the sofa holding his stomach after eating too much trial cake, with a lemon, a bottle of vinegar and a box of baking soda on the table",
  );
  return column([
    w.title(t("Too much cake", "बहुत ज़्यादा केक")),
    grandpa,
    w.body(
      t(
        'Mom bakes a trial cake for the party. Grandpa "tests" three slices, and an hour later he has a burning feeling in his chest: **acidity**. On the table are a lemon, a bottle of vinegar and a box of baking soda.',
        'मम्मी पार्टी के लिए एक आज़माइशी केक बनाती हैं। दादाजी तीन टुकड़े "जाँचते" हैं, और एक घंटे बाद उनके सीने में जलन है: **एसिडिटी**। मेज़ पर एक नींबू, सिरके की बोतल और खाने के सोडे का डिब्बा रखा है।',
      ),
    ),
    w.body(
      t(
        "Stop 3: which one would help him, and why? It depends on what happens when an acid meets a base.",
        "पड़ाव 3: इनमें से कौन उनकी मदद करेगा, और क्यों? यह इस पर निर्भर है कि अम्ल और क्षारक मिलने पर क्या होता है।",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Activity 2.6: NaOH with phenolphthalein, acid drop by drop. Neutralisation defined. */
const flask = page(
  "flask",
  (b) => {
    const w = wordsOn(b);
    const titr = b.prop(neutraliserDef, "titr", {
      baseMl: 10,
      acidMl: 0,
      acidPerBaseMl: 1,
      dropMl: 1,
      indicator: IndicatorId.Phenolphthalein,
      startBaseMl: 10,
      showPh: false,
      showVolumes: true,
      showIons: false,
      canAddAcid: true,
      canAddBase: true,
    });
    b.studentOnly(titr.action(NeutraliseAction.AddAcid));
    b.studentOnly(titr.action(NeutraliseAction.AddBase));
    b.studentOnly(titr.action(NeutraliseAction.Reset));
    b.standsFor(
      titr,
      "a flask of sodium hydroxide solution made pink with phenolphthalein, under a burette of dilute hydrochloric acid that adds one drop at a time",
    );
    const goal = goalQuestion(b, {
      about: titr,
      prompt: t(
        "Add acid drop by drop until the pink just disappears.",
        "बूँद-बूँद अम्ल डालो जब तक गुलाबी रंग ठीक-ठीक ग़ायब न हो जाए।",
      ),
      isMet: titr.derived(NeutraliseDerived.IsNeutral),
      solve: [titr.learner(NeutraliseAction.AddAcid, { ml: 10 })],
    });
    const back = w.body(
      t(
        "Now add one drop of sodium hydroxide: the pink comes back. Add a drop of acid: gone again. Each one undoes the other.",
        "अब सोडियम हाइड्रॉक्साइड की एक बूँद डालो: गुलाबी रंग लौट आता है। अम्ल की एक बूँद डालो: फिर ग़ायब। हर एक दूसरे का असर मिटा देता है।",
      ),
      "back",
      { isHidden: true },
    );
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(back));
    return column([
      w.title(t("An acid meets a base", "अम्ल और क्षारक का मिलना")),
      w.body(
        t(
          "NCERT Activity 2.6. Sodium hydroxide solution with two drops of phenolphthalein is pink: it is a base. Now dilute hydrochloric acid goes in, drop by drop.",
          "NCERT क्रियाकलाप 2.6। फ़िनॉल्फ़्थेलिन की दो बूँदों वाला सोडियम हाइड्रॉक्साइड का घोल गुलाबी है: यह क्षारक है। अब तनु हाइड्रोक्लोरिक अम्ल बूँद-बूँद अंदर जाता है।",
        ),
      ),
      titr,
      goal,
      back,
      w.body(
        t(
          "The acid cancels out the base. What is left is a salt and water:",
          "अम्ल क्षारक का असर मिटा देता है। जो बचता है वह लवण और जल है:",
        ),
      ),
      w.body(t(r`$$\ce{NaOH + HCl -> NaCl + H2O}$$`, r`$$\ce{NaOH + HCl -> NaCl + H2O}$$`)),
      w.definition(
        t(
          "**Neutralisation.** The reaction between an acid and a base that gives a salt and water is a **neutralisation reaction**. In general:",
          "**उदासीनीकरण।** अम्ल और क्षारक के बीच की वह अभिक्रिया जो लवण और जल देती है, **उदासीनीकरण अभिक्रिया** है। सामान्य रूप में:",
        ),
      ),
      w.body(
        t(
          r`$$\text{Base} + \text{Acid} \rightarrow \text{Salt} + \text{Water}$$`,
          r`$$\text{क्षारक} + \text{अम्ल} \rightarrow \text{लवण} + \text{जल}$$`,
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Activity 2.7: copper oxide and acid; metal oxides are basic. */
const oxides = page(
  "oxides",
  (b) => {
    const w = wordsOn(b);
    const bench = benchOn(b, "bench", AcidBenchKind.CopperOxideAcid);
    b.standsFor(
      bench,
      "black copper oxide in a beaker; dilute hydrochloric acid is stirred in and the solution turns blue-green as the oxide dissolves",
    );
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "Copper oxide reacts with an acid to give a salt and water, just as a base does. So copper oxide is:",
        "कॉपर ऑक्साइड अम्ल से अभिक्रिया करके लवण और जल देता है, ठीक क्षारक की तरह। तो कॉपर ऑक्साइड है:",
      ),
      options: [
        { id: "right", label: t("A basic oxide", "क्षारकीय ऑक्साइड") },
        {
          id: "acidic",
          label: t("An acidic oxide", "अम्लीय ऑक्साइड"),
          feedback: t(
            "It reacts with an acid, the way a base does. That makes it basic.",
            "यह अम्ल से वैसे ही अभिक्रिया करता है जैसे क्षारक। इसलिए यह क्षारकीय है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Metal oxides behave like bases", "धातु ऑक्साइड क्षारकों जैसे हैं")),
      w.definition(
        t(
          "**Oxide.** An **oxide** is a compound of an element with oxygen. Copper oxide, CuO, is a black powder.",
          "**ऑक्साइड।** **ऑक्साइड** किसी तत्व का ऑक्सीजन के साथ यौगिक है। कॉपर ऑक्साइड, CuO, एक काला चूर्ण है।",
        ),
      ),
      w.body(
        t(
          "NCERT Activity 2.7: dilute hydrochloric acid stirred slowly into copper oxide.",
          "NCERT क्रियाकलाप 2.7: तनु हाइड्रोक्लोरिक अम्ल धीरे-धीरे कॉपर ऑक्साइड में घोला गया।",
        ),
      ),
      bench,
      w.body(
        t(
          "The black oxide dissolves and the solution turns **blue-green**: that colour is the salt copper(II) chloride.",
          "काला ऑक्साइड घुल जाता है और घोल **नीला-हरा** हो जाता है: वह रंग लवण कॉपर(II) क्लोराइड का है।",
        ),
      ),
      w.body(t(r`$$\ce{CuO + 2HCl -> CuCl2 + H2O}$$`, r`$$\ce{CuO + 2HCl -> CuCl2 + H2O}$$`)),
      w.body(
        t(
          r`$$\text{Metal oxide} + \text{Acid} \rightarrow \text{Salt} + \text{Water}$$`,
          r`$$\text{धातु ऑक्साइड} + \text{अम्ल} \rightarrow \text{लवण} + \text{जल}$$`,
        ),
      ),
      w.body(
        t(
          "That's exactly what a base does with an acid. So metal oxides are called **basic oxides**.",
          "यह ठीक वही है जो क्षारक अम्ल के साथ करता है। इसलिए धातु ऑक्साइड **क्षारकीय ऑक्साइड** कहलाते हैं।",
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Section 2.1.6: carbon dioxide with lime water; non-metal oxides are acidic. */
const nonMetal = page(
  "non-metal",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "Carbon dioxide reacts with the base calcium hydroxide to give a salt and water. So carbon dioxide is:",
        "कार्बन डाइऑक्साइड क्षारक कैल्सियम हाइड्रॉक्साइड से अभिक्रिया करके लवण और जल देती है। तो कार्बन डाइऑक्साइड है:",
      ),
      options: [
        { id: "right", label: t("An acidic oxide", "अम्लीय ऑक्साइड") },
        {
          id: "basic",
          label: t("A basic oxide", "क्षारकीय ऑक्साइड"),
          feedback: t(
            "It reacts with a base, the way an acid does. That makes it acidic.",
            "यह क्षारक से वैसे ही अभिक्रिया करती है जैसे अम्ल। इसलिए यह अम्लीय है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Non-metal oxides behave like acids", "अधातु ऑक्साइड अम्लों जैसे हैं")),
      w.body(
        t(
          "Remember the lime water in the last lesson. Carbon dioxide, an oxide of the non-metal carbon, reacted with calcium hydroxide, a base:",
          "पिछले पाठ का चूने का पानी याद करो। कार्बन डाइऑक्साइड, अधातु कार्बन का ऑक्साइड, कैल्सियम हाइड्रॉक्साइड, एक क्षारक, से जुड़ी थी:",
        ),
      ),
      w.body(t(r`$$\ce{Ca(OH)2 + CO2 -> CaCO3 + H2O}$$`, r`$$\ce{Ca(OH)2 + CO2 -> CaCO3 + H2O}$$`)),
      w.body(
        t(
          "Base + oxide gives salt + water: the oxide played the part of an acid. So **non-metal oxides are acidic**, and metal oxides are basic.",
          "क्षारक + ऑक्साइड से लवण + जल: ऑक्साइड ने अम्ल का काम किया। इसलिए **अधातु ऑक्साइड अम्लीय** हैं, और धातु ऑक्साइड क्षारकीय।",
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** Grandpa's remedy, and curd in a brass pot. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "Grandpa's stomach has too much acid. What should he take?",
        "दादाजी के पेट में बहुत ज़्यादा अम्ल है। उन्हें क्या लेना चाहिए?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Baking soda solution: a mild base neutralises it",
            "बेकिंग सोडा का घोल: एक मृदु क्षारक उसे उदासीन करता है",
          ),
        },
        {
          id: "lemon",
          label: t(
            "Lemon juice: a weak acid soothes the stomach",
            "नींबू का रस: कमज़ोर अम्ल पेट को आराम देता है",
          ),
          feedback: t(
            "Lemon juice is an acid: it would add to the problem.",
            "नींबू का रस अम्ल है: यह परेशानी बढ़ाएगा।",
          ),
        },
        {
          id: "vinegar",
          label: t(
            "Vinegar: its acid cancels the burning feeling",
            "सिरका: उसका अम्ल जलन को ख़त्म करता है",
          ),
          feedback: t(
            "Vinegar is acetic acid: more acid, more burning.",
            "सिरका ऐसीटिक अम्ल है: और अम्ल, और जलन।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const brass = choiceQuestion(b, {
      name: "brass",
      prompt: t(
        "Mom never keeps curd or pickle in a brass or copper pot. Why?",
        "मम्मी दही या अचार कभी पीतल या ताँबे के बर्तन में नहीं रखतीं। क्यों?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Sour foods contain acids, which react with the metal and spoil the food",
            "खट्टी चीज़ों में अम्ल होते हैं, जो धातु से अभिक्रिया करके खाने को ख़राब कर देते हैं",
          ),
        },
        {
          id: "heavy",
          label: t("Brass pots are too heavy", "पीतल के बर्तन बहुत भारी हैं"),
          feedback: t(
            "Weight has nothing to do with it. Think of what acids do to metals.",
            "वज़न का इससे कोई लेना-देना नहीं। सोचो अम्ल धातुओं के साथ क्या करते हैं।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const done = w.body(
      t(
        "A spoon of baking soda in water, and Grandpa feels better. Medicines that do this are called **antacids**: bases that neutralise extra stomach acid. And the curd stays in a steel or glass bowl.",
        "पानी में एक चम्मच खाने का सोडा, और दादाजी बेहतर महसूस करते हैं। जो दवाइयाँ यह करती हैं वे **प्रतिअम्ल** (ऐन्टैसिड) कहलाती हैं: क्षारक जो पेट के अतिरिक्त अम्ल को उदासीन करते हैं। और दही स्टील या काँच के कटोरे में रहता है।",
      ),
      "done",
      { isHidden: true },
    );
    b.when(ask.on(QuestionSignal.Correct), theBoard.show(brass));
    b.when(brass.on(QuestionSignal.Correct), [theBoard.show(done), theBoard.pass()]);
    return column([w.title(t("Grandpa's remedy", "दादाजी का इलाज")), ask, brass, done, space()]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** NCERT Exercise 3 with the burette; Exercise 14; the mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const titr = b.prop(neutraliserDef, "titr", {
      baseMl: 20,
      acidMl: 0,
      acidPerBaseMl: 0.8,
      dropMl: 1,
      indicator: IndicatorId.Phenolphthalein,
      startBaseMl: 20,
      showPh: false,
      showVolumes: true,
      showIons: false,
      canAddAcid: true,
      canAddBase: false,
    });
    b.studentOnly(titr.action(NeutraliseAction.AddAcid));
    b.studentOnly(titr.action(NeutraliseAction.Reset));
    b.standsFor(
      titr,
      "a flask of 20 mL of the same sodium hydroxide solution, with phenolphthalein, under a burette of the same hydrochloric acid",
    );
    const ask1 = choiceQuestion(b, {
      name: "ask1",
      prompt: t(
        "NCERT Exercise 3. 10 mL of NaOH solution is neutralised by 8 mL of an HCl solution. How much of the same HCl will neutralise 20 mL of the same NaOH?",
        "NCERT अभ्यास 3। NaOH के 10 mL घोल को एक HCl घोल के 8 mL उदासीन करते हैं। उसी NaOH के 20 mL को उसी HCl के कितने mL उदासीन करेंगे?",
      ),
      options: [
        { id: "right", label: t("16 mL", "16 mL") },
        {
          id: "8",
          label: t("8 mL", "8 mL"),
          feedback: t("Twice the base needs twice the acid.", "दोगुने क्षारक को दोगुना अम्ल चाहिए।"),
        },
        {
          id: "12",
          label: t("12 mL", "12 mL"),
          feedback: t("Double 8 mL.", "8 mL को दोगुना करो।"),
        },
        {
          id: "4",
          label: t("4 mL", "4 mL"),
          feedback: t(
            "More base needs more acid, not less.",
            "ज़्यादा क्षारक को ज़्यादा अम्ल चाहिए, कम नहीं।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const check = w.body(
      t(
        "Check it in the burette: add 16 mL and the pink just disappears.",
        "ब्यूरेट में जाँचो: 16 mL डालो और गुलाबी रंग ठीक-ठीक ग़ायब हो जाता है।",
      ),
      "check",
      { isHidden: true },
    );
    const ask2 = choiceQuestion(b, {
      name: "ask2",
      prompt: t(
        "NCERT Exercise 14. Which of these is a neutralisation reaction?",
        "NCERT अभ्यास 14। इनमें से कौन-सी उदासीनीकरण अभिक्रिया है?",
      ),
      options: [
        {
          id: "right",
          label: t(r`$\ce{KOH + HNO3 -> KNO3 + H2O}$`, r`$\ce{KOH + HNO3 -> KNO3 + H2O}$`),
        },
        {
          id: "zn",
          label: t(r`$\ce{Zn + H2SO4 -> ZnSO4 + H2}$`, r`$\ce{Zn + H2SO4 -> ZnSO4 + H2}$`),
          feedback: t(
            "That's an acid with a metal: it gives hydrogen, not water.",
            "यह अम्ल और धातु है: यह जल नहीं, हाइड्रोजन देता है।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ Base + acid → salt + water: neutralisation. ✓ Metal oxides are basic; non-metal oxides are acidic. ✓ Grandpa is fine: baking soda, an antacid. Next: why every acid behaves alike.",
        "**मिशन लॉग।** ✓ क्षारक + अम्ल → लवण + जल: उदासीनीकरण। ✓ धातु ऑक्साइड क्षारकीय हैं; अधातु ऑक्साइड अम्लीय। ✓ दादाजी ठीक हैं: खाने का सोडा, एक प्रतिअम्ल। आगे: हर अम्ल एक जैसा व्यवहार क्यों करता है।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(ask1.on(QuestionSignal.Correct), [theBoard.show(check), theBoard.show(ask2)]);
    b.when(ask2.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([
      w.title(t("Your turn", "अब तुम्हारी बारी")),
      ask1,
      check,
      titr,
      ask2,
      log,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [hook, flask, oxides, nonMetal, inLife, yourTurn];

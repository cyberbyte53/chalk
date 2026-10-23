import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import { BenchKind, SwapAction, SwapKind, particleSwapDef } from "@chalk/prop-chemistry";
import { benchOn, equationOn } from "../kit";

const r = String.raw;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const pan = benchOn(b, "pan", BenchKind.CopperHeated);
  b.standsFor(pan, "shiny brown copper powder in a china dish over a flame turns black on top");
  return column([
    w.title(t("Black from a flame", "लौ से काला")),
    w.body(
      t(
        'Job 3 is the black silver anklets and the green copper diyas. Before tackling them, Riya notices something on the stove: Mom\'s shiny copper-bottomed pot has gone **black** underneath where the flame touches it. Nobody spilled anything. Grandpa: "Heat copper in air and it turns black. You can try it with copper powder." Press start.',
        'काम 3 काली पायलें और हरे दीये हैं। उनसे पहले रिया चूल्हे पर कुछ देखती है: मम्मी के चमकदार ताँबे की तली वाले बर्तन की तली, जहाँ लौ छूती है, **काली** पड़ गई है। किसी ने कुछ गिराया नहीं। दादाजी: "ताँबे को हवा में गर्म करो तो वह काला हो जाता है। ताँबे के चूर्ण से आज़मा सकते हो।" शुरू दबाओ।',
      ),
    ),
    pan,
    w.body(
      t(
        "Stop 7: what is the black stuff, and can it be turned back into copper?",
        "पड़ाव 7: यह काली चीज़ क्या है, और क्या इसे वापस ताँबे में बदला जा सकता है?",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Activity 1.11: copper gains oxygen. Oxidation defined. */
const oxidation = page(
  "oxidation",
  (b) => {
    const w = wordsOn(b);
    const copper = equationOn(b, "copper", "copperHeated", {
      balanced: true,
      showTally: true,
      showMolecules: true,
    });
    b.standsFor(copper, "2Cu + O₂ → 2CuO with the molecules drawn and the atom table balanced");
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t("In this reaction, what happens to copper?", "इस अभिक्रिया में ताँबे का क्या होता है?"),
      options: [
        {
          id: "right",
          label: t("It gains oxygen: it is oxidised", "इसे ऑक्सीजन मिलती है: इसका उपचयन होता है"),
        },
        {
          id: "loses",
          label: t("It loses oxygen", "यह ऑक्सीजन खोता है"),
          feedback: t(
            "Copper had no oxygen to begin with. It ends up joined to oxygen as CuO.",
            "ताँबे के पास शुरू में ऑक्सीजन थी ही नहीं। अंत में वह CuO के रूप में ऑक्सीजन से जुड़ता है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Gaining oxygen", "ऑक्सीजन पाना")),
      w.body(
        t(
          "Activity 1.11. The surface of heated copper powder gets coated with black **copper(II) oxide**, CuO (the II tells you which copper oxide it is; read it simply as copper oxide). Oxygen from the air has joined the copper:",
          "क्रियाकलाप 1.11। गर्म किए ताँबे के चूर्ण की सतह पर काले **कॉपर (II) ऑक्साइड**, CuO, की परत चढ़ जाती है (II बताता है कि ताँबे का कौन-सा ऑक्साइड है; इसे बस कॉपर ऑक्साइड पढ़ो)। हवा की ऑक्सीजन ताँबे से जुड़ गई है:",
        ),
      ),
      copper,
      w.definition(
        t(
          "**Oxidation.** If a substance **gains oxygen** during a reaction, it is **oxidised**. That process is **oxidation**.",
          "**उपचयन।** यदि किसी अभिक्रिया में कोई पदार्थ **ऑक्सीजन प्राप्त** करता है, तो उसका **उपचयन** होता है (वह उपचयित होता है)। यह प्रक्रिया **उपचयन** है।",
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Hydrogen over hot CuO: copper back. Reduction and redox defined. */
const reduction = page(
  "reduction",
  (b) => {
    const w = wordsOn(b);
    const back = benchOn(b, "back", BenchKind.CopperReduced);
    b.standsFor(
      back,
      "hydrogen gas passed over heated black copper(II) oxide; the black coating turns brown copper again",
    );
    const atoms = b.prop(particleSwapDef, "atoms", {
      kind: SwapKind.Redox,
      step: 0,
      canStep: true,
      showEquation: true,
      captions: [
        t("Copper oxide and a hydrogen molecule.", "कॉपर ऑक्साइड और एक हाइड्रोजन अणु।"),
        t(
          "The oxygen atom moves from copper to hydrogen…",
          "ऑक्सीजन परमाणु ताँबे से हाइड्रोजन की ओर जाता है…",
        ),
        t(
          "…copper loses oxygen (reduced), hydrogen gains it (oxidised).",
          "…ताँबा ऑक्सीजन खोता है (अपचयित), हाइड्रोजन उसे पाता है (उपचयित)।",
        ),
      ],
    });
    b.studentOnly(atoms.action(SwapAction.Next));
    b.standsFor(
      atoms,
      "CuO and H₂ drawn as balls; the oxygen atom moves from the copper to the hydrogen, leaving Cu and making H₂O",
    );
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        r`In $\ce{CuO + H2 -> Cu + H2O}$, which substance is oxidised?`,
        r`$\ce{CuO + H2 -> Cu + H2O}$ में किसका उपचयन होता है?`,
      ),
      options: [
        {
          id: "right",
          label: t(
            r`Hydrogen: it gains oxygen and becomes $\ce{H2O}$`,
            r`हाइड्रोजन: वह ऑक्सीजन पाकर $\ce{H2O}$ बनता है`,
          ),
        },
        {
          id: "cuo",
          label: t("Copper oxide", "कॉपर ऑक्साइड"),
          feedback: t(
            "Copper oxide loses its oxygen: that's reduction.",
            "कॉपर ऑक्साइड अपनी ऑक्सीजन खोता है: यह अपचयन है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Giving oxygen back", "ऑक्सीजन लौटाना")),
      w.body(
        t(
          "Pass hydrogen gas over the hot black powder. The black coating turns brown again: copper is back.",
          "गर्म काले चूर्ण के ऊपर से हाइड्रोजन गैस गुज़ारो। काली परत फिर भूरी हो जाती है: ताँबा लौट आया।",
        ),
      ),
      back,
      w.body(
        t(r`$$\ce{CuO + H2 ->[Heat] Cu + H2O}$$`, r`$$\ce{CuO + H2 ->[\text{ऊष्मा}] Cu + H2O}$$`),
      ),
      w.definition(
        t(
          "**Reduction and redox.** If a substance **loses oxygen** during a reaction, it is **reduced**: that is **reduction**. Here copper(II) oxide is reduced, and at the same moment hydrogen gains that oxygen and is oxidised. One reactant is oxidised while another is reduced: such reactions are **oxidation-reduction** or **redox** reactions.",
          "**अपचयन और रेडॉक्स।** यदि अभिक्रिया में कोई पदार्थ **ऑक्सीजन खोता** है, तो उसका **अपचयन** होता है: यह **अपचयन** है। यहाँ कॉपर (II) ऑक्साइड अपचयित होता है, और उसी क्षण हाइड्रोजन वह ऑक्सीजन पाकर उपचयित होता है। एक अभिकारक उपचयित और दूसरा अपचयित: ऐसी अभिक्रियाएँ **उपचयन-अपचयन** या **रेडॉक्स** अभिक्रियाएँ हैं।",
        ),
      ),
      atoms,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Hydrogen too: the wider definitions. ZnO + C; MnO₂ + HCl. */
const wider = page(
  "wider",
  (b) => {
    const w = wordsOn(b);
    const mn = equationOn(b, "mn", "manganeseDioxideHydrochloricAcid", {
      balanced: true,
      showTally: false,
    });
    b.standsFor(mn, "MnO₂ + 4HCl → MnCl₂ + 2H₂O + Cl₂");
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        r`In $\ce{MnO2 + 4HCl -> MnCl2 + 2H2O + Cl2}$, HCl becomes $\ce{Cl2}$. Is HCl oxidised or reduced?`,
        r`$\ce{MnO2 + 4HCl -> MnCl2 + 2H2O + Cl2}$ में HCl, $\ce{Cl2}$ बनता है। HCl का उपचयन होता है या अपचयन?`,
      ),
      options: [
        { id: "right", label: t("Oxidised: it loses hydrogen", "उपचयन: यह हाइड्रोजन खोता है") },
        {
          id: "reduced",
          label: t("Reduced: it gains nothing", "अपचयन: इसे कुछ नहीं मिलता"),
          feedback: t(
            "Losing hydrogen counts as oxidation, just like gaining oxygen.",
            "हाइड्रोजन खोना भी उपचयन माना जाता है, ठीक ऑक्सीजन पाने की तरह।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Oxygen, or hydrogen", "ऑक्सीजन, या हाइड्रोजन")),
      w.body(t("Zinc oxide heated with carbon:", "कार्बन के साथ गर्म किया जिंक ऑक्साइड:")),
      w.body(t(r`$$\ce{ZnO + C -> Zn + CO}$$`, r`$$\ce{ZnO + C -> Zn + CO}$$`)),
      w.body(
        t(
          "Carbon gains oxygen and is oxidised to CO; zinc oxide loses oxygen and is reduced to zinc. Now manganese dioxide with hydrochloric acid:",
          "कार्बन ऑक्सीजन पाकर CO में उपचयित होता है; जिंक ऑक्साइड ऑक्सीजन खोकर जिंक में अपचयित होता है। अब हाइड्रोक्लोरिक अम्ल के साथ मैंगनीज़ डाइऑक्साइड:",
        ),
      ),
      mn,
      w.definition(
        t(
          "**Oxidation and reduction, in full.** A substance is **oxidised** if it **gains oxygen or loses hydrogen**. A substance is **reduced** if it **loses oxygen or gains hydrogen**. Here MnO₂ loses oxygen (reduced to MnCl₂), and HCl loses hydrogen (oxidised to Cl₂). We always say which **reactant** is oxidised or reduced: in ZnO + C → Zn + CO it is zinc oxide that is reduced; zinc is only what it turns into.",
          "**उपचयन और अपचयन, पूरा।** किसी पदार्थ का **उपचयन** होता है यदि वह **ऑक्सीजन पाए या हाइड्रोजन खोए**। किसी पदार्थ का **अपचयन** होता है यदि वह **ऑक्सीजन खोए या हाइड्रोजन पाए**। यहाँ MnO₂ ऑक्सीजन खोता है (MnCl₂ में अपचयित), और HCl हाइड्रोजन खोता है (Cl₂ में उपचयित)। हम हमेशा बताते हैं कि कौन-सा **अभिकारक** उपचयित या अपचयित होता है: ZnO + C → Zn + CO में जिंक ऑक्साइड अपचयित होता है; जिंक तो बस वह है जिसमें वह बदलता है।",
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

const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const pot = choiceQuestion(b, {
      name: "pot",
      prompt: t(
        "So what is the black layer under Mom's copper pot?",
        "तो मम्मी के ताँबे के बर्तन के नीचे की काली परत क्या है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Copper(II) oxide: the hot copper was oxidised by air",
            "कॉपर (II) ऑक्साइड: गर्म ताँबे का हवा से उपचयन हुआ",
          ),
        },
        {
          id: "soot",
          label: t("Only soot from the gas flame", "केवल गैस की लौ की कालिख"),
          feedback: t(
            "A clean blue gas flame makes little soot. Heated copper turns black on its own, as the powder showed.",
            "साफ़ नीली गैस की लौ बहुत कम कालिख बनाती है। गर्म ताँबा अपने आप काला होता है, जैसा चूर्ण ने दिखाया।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const spark = choiceQuestion(b, {
      name: "spark",
      prompt: t(
        r`And the sparkler, $\ce{2Mg + O2 -> 2MgO}$: is magnesium oxidised or reduced?`,
        r`और फुलझड़ी, $\ce{2Mg + O2 -> 2MgO}$: मैग्नीशियम का उपचयन होता है या अपचयन?`,
      ),
      options: [
        { id: "right", label: t("Oxidised: it gains oxygen", "उपचयन: इसे ऑक्सीजन मिलती है") },
        {
          id: "reduced",
          label: t("Reduced", "अपचयन"),
          feedback: t(
            "Magnesium ends up joined to oxygen: it has gained oxygen.",
            "मैग्नीशियम अंत में ऑक्सीजन से जुड़ता है: इसने ऑक्सीजन पाई है।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const stop = w.definition(
      t(
        "**Stop 7 done.** Oxidation is gaining oxygen (or losing hydrogen); reduction is losing oxygen (or gaining hydrogen); in a redox reaction both happen together. The black pot, the sparkler and the black copper powder are all oxidation. Next, the last stop: what slowly eats away the gate, the anklets and the diyas, what turns the namkeen stale, and how to stop both.",
        "**पड़ाव 7 पूरा।** उपचयन ऑक्सीजन पाना (या हाइड्रोजन खोना) है; अपचयन ऑक्सीजन खोना (या हाइड्रोजन पाना) है; रेडॉक्स अभिक्रिया में दोनों साथ होते हैं। काला बर्तन, फुलझड़ी और काला ताँबे का चूर्ण, सब उपचयन हैं। अब आख़िरी पड़ाव: गेट, पायलों और दीयों को धीरे-धीरे क्या खा जाता है, नमकीन को बासी क्या बनाता है, और दोनों को कैसे रोकें।",
      ),
      "stop",
      { isHidden: true },
    );
    b.when(pot.on(QuestionSignal.Correct), theBoard.show(spark));
    b.when(spark.on(QuestionSignal.Correct), [theBoard.show(stop), theBoard.pass()]);
    return column([w.title(t("Back to the stove", "फिर चूल्हे पर")), pot, spark, stop, space()]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** NCERT in-text Q3, worked. */
const example = page("example", (b) => {
  const w = wordsOn(b);
  const na = equationOn(b, "na", "sodiumBurns", {
    balanced: true,
    showStates: true,
    showTally: false,
  });
  b.standsFor(na, "4Na(s) + O₂(g) → 2Na₂O(s)");
  return column([
    w.title(t("Example: oxidised or reduced?", "उदाहरण: उपचयित या अपचयित?")),
    w.body(
      t(
        "**Identify the substance oxidised and the substance reduced.**",
        "**उपचयित और अपचयित पदार्थ पहचानो।**",
      ),
    ),
    na,
    w.body(
      t(
        "(i) Sodium gains oxygen and becomes sodium oxide: **sodium is oxidised**.",
        "(i) सोडियम ऑक्सीजन पाकर सोडियम ऑक्साइड बनता है: **सोडियम का उपचयन** होता है।",
      ),
    ),
    w.body(
      t(r`$$\ce{CuO(s) + H2(g) -> Cu(s) + H2O(l)}$$`, r`$$\ce{CuO(s) + H2(g) -> Cu(s) + H2O(l)}$$`),
    ),
    w.body(
      t(
        "(ii) Copper(II) oxide loses oxygen: **CuO is reduced**. Hydrogen gains it: **H₂ is oxidised**.",
        "(ii) कॉपर (II) ऑक्साइड ऑक्सीजन खोता है: **CuO अपचयित** होता है। हाइड्रोजन उसे पाता है: **H₂ उपचयित** होता है।",
      ),
    ),
    space(),
  ]);
});

/** Exercise 1 and 17; then the mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const ask1 = choiceQuestion(b, {
      name: "ask1",
      prompt: t(
        r`$\ce{2PbO(s) + C(s) -> 2Pb(s) + CO2(g)}$. Which statements are **incorrect**? (a) Lead is getting reduced. (b) Carbon dioxide is getting oxidised. (c) Carbon is getting oxidised. (d) Lead oxide is getting reduced.`,
        r`$\ce{2PbO(s) + C(s) -> 2Pb(s) + CO2(g)}$। कौन-से कथन **ग़लत** हैं? (a) लेड अपचयित हो रहा है। (b) कार्बन डाइऑक्साइड उपचयित हो रहा है। (c) कार्बन उपचयित हो रहा है। (d) लेड ऑक्साइड अपचयित हो रहा है।`,
      ),
      options: [
        { id: "right", label: t("(a) and (b)", "(a) और (b)") },
        {
          id: "ac",
          label: t("(a) and (c)", "(a) और (c)"),
          feedback: t(
            "(c) is right: carbon gains oxygen. Look again at (b): CO₂ is a product, it isn't reacting.",
            "(c) सही है: कार्बन ऑक्सीजन पाता है। (b) फिर देखो: CO₂ उत्पाद है, वह अभिक्रिया नहीं कर रहा।",
          ),
        },
        {
          id: "abc",
          label: t("(a), (b) and (c)", "(a), (b) और (c)"),
          feedback: t(
            "(c) is correct: carbon gains oxygen, so it is oxidised.",
            "(c) सही है: कार्बन ऑक्सीजन पाता है, इसलिए उपचयित होता है।",
          ),
        },
        {
          id: "all",
          label: t("All", "सभी"),
          feedback: t(
            "(d) is correct: lead oxide loses oxygen. And (c) is correct too.",
            "(d) सही है: लेड ऑक्साइड ऑक्सीजन खोता है। और (c) भी सही है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const ask2 = choiceQuestion(b, {
      name: "ask2",
      prompt: t(
        "A shiny brown element X turns black when heated in air. Name X and the black compound.",
        "एक चमकदार भूरा तत्व X हवा में गर्म करने पर काला हो जाता है। X और काले यौगिक का नाम बताओ।",
      ),
      options: [
        {
          id: "right",
          label: t(
            "X is copper; the black compound is copper(II) oxide, CuO",
            "X ताँबा है; काला यौगिक कॉपर (II) ऑक्साइड, CuO है",
          ),
        },
        {
          id: "iron",
          label: t("X is iron; the black compound is rust", "X लोहा है; काला यौगिक ज़ंग है"),
          feedback: t(
            "Iron is grey, and rust is reddish brown, not black.",
            "लोहा स्लेटी है, और ज़ंग लाल-भूरा है, काला नहीं।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ Oxidation: gain of oxygen or loss of hydrogen. ✓ Reduction: loss of oxygen or gain of hydrogen. ✓ Redox: one is oxidised while the other is reduced. ✓ Mom's pot was blackened by oxidation. Next, the last stop: rust and stale namkeen.",
        "**मिशन लॉग।** ✓ उपचयन: ऑक्सीजन पाना या हाइड्रोजन खोना। ✓ अपचयन: ऑक्सीजन खोना या हाइड्रोजन पाना। ✓ रेडॉक्स: एक उपचयित जबकि दूसरा अपचयित। ✓ मम्मी का बर्तन उपचयन से काला हुआ। अब आख़िरी पड़ाव: ज़ंग और बासी नमकीन।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(ask1.on(QuestionSignal.Correct), theBoard.show(ask2));
    b.when(ask2.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), ask1, ask2, log, space()]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [hook, oxidation, reduction, wider, inLife, example, yourTurn];

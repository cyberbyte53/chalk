import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, multiChoiceQuestion, wordsOn } from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import { LabMetal, MetalSceneKind, Reagent, ce, labOn, sceneOn, wordEq } from "../kit";

const r = String.raw;

const SALT_REAGENTS = [
  Reagent.SodiumChloride,
  Reagent.MagnesiumChloride,
  Reagent.ZincSulphate,
  Reagent.IronSulphate,
  Reagent.CopperSulphate,
  Reagent.SilverNitrate,
] as const;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const desk = sceneOn(
    b,
    "desk",
    MetalSceneKind.CaseFile,
    "Riya and Kabir at the desk with the case file, planning a test-tube tournament",
  );
  return column([
    w.title(t("A tournament of metals", "धातुओं का टूर्नामेंट")),
    desk,
    w.body(
      t(
        'Burning sorted some metals, water sorted some more, and acid a few more. But each test left some metals tied. Kabir wants a proper league table: **"Every metal against every metal. Who beats whom?"**',
        'जलाने से कुछ धातुएँ छँटीं, पानी से कुछ और, और अम्ल से कुछ और। पर हर परीक्षण में कुछ धातुएँ बराबरी पर रहीं। कबीर एक ठीक-ठाक अंक तालिका चाहता है: **"हर धातु हर धातु के ख़िलाफ़। कौन किसको हराता है?"**',
      ),
    ),
    w.body(
      t(
        "Clue 4: how do you put all the metals in one order of reactivity, and where does gold end up?",
        "सुराग 4: सभी धातुओं को क्रियाशीलता के एक क्रम में कैसे लगाएँ, और सोना कहाँ पहुँचता है?",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Activity 3.12: iron in copper sulphate, copper in iron sulphate. */
const displace = page(
  "displace",
  (b) => {
    const w = wordsOn(b);
    const lab = labOn(b, "lab", {
      metals: [LabMetal.Iron, LabMetal.Copper],
      reagents: [Reagent.CopperSulphate, Reagent.IronSulphate],
      metal: LabMetal.Iron,
      reagent: Reagent.CopperSulphate,
    });
    b.standsFor(
      lab,
      "an iron nail in blue copper sulphate solution, or a copper wire in pale green iron sulphate solution; the learner runs each for twenty minutes",
    );
    const which = choiceQuestion(b, {
      name: "which",
      prompt: t(
        "Run both tubes. Which metal is more reactive, copper or iron?",
        "दोनों परखनलियाँ चलाओ। कौन-सी धातु अधिक क्रियाशील है, ताँबा या लोहा?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Iron: it displaces copper, but copper can't displace iron",
            "लोहा: यह ताँबे को विस्थापित करता है, पर ताँबा लोहे को नहीं कर सकता",
          ),
        },
        {
          id: "cu",
          label: t("Copper", "ताँबा"),
          feedback: t(
            "Look at the copper wire in iron sulphate: nothing happens. Copper loses.",
            "आयरन सल्फ़ेट में ताँबे का तार देखो: कुछ नहीं होता। ताँबा हारता है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Metal against metal", "धातु बनाम धातु")),
      w.body(
        t(
          "NCERT Activity 3.12. Put an iron nail in copper sulphate solution, and a clean copper wire in iron sulphate solution. Look after twenty minutes.",
          "NCERT क्रियाकलाप 3.12। कॉपर सल्फ़ेट विलयन में लोहे की कील, और आयरन सल्फ़ेट विलयन में ताँबे का साफ़ तार डालो। बीस मिनट बाद देखो।",
        ),
      ),
      lab,
      w.body(t("Only the nail reacts:", "केवल कील अभिक्रिया करती है:")),
      w.body(ce("Fe(s) + CuSO4(aq) -> FeSO4(aq) + Cu(s)")),
      w.definition(
        t(
          "**Displacement test.** Oxygen, water and acids don't react with every metal, so they can't rank them all. Displacement can. From Chapter 1: if metal A **displaces** metal B from a solution of B's salt, then **A is more reactive than B**.",
          "**विस्थापन परीक्षण।** ऑक्सीजन, पानी और अम्ल हर धातु से अभिक्रिया नहीं करते, इसलिए सबको क्रम में नहीं लगा सकते। विस्थापन लगा सकता है। अध्याय 1 से: अगर धातु A, B के लवण के विलयन से धातु B को **विस्थापित** करती है, तो **A, B से अधिक क्रियाशील है**।",
        ),
      ),
      w.body(
        wordEq(
          "Metal A + Salt solution of B -> Salt solution of A + Metal B",
          "धातु A + B के लवण का विलयन -> A के लवण का विलयन + धातु B",
        ),
      ),
      which,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Table 3.2, the reactivity series, built from the tournament. */
const series = page(
  "series",
  (b) => {
    const w = wordsOn(b);
    const lab = labOn(b, "lab", {
      metals: [
        LabMetal.Magnesium,
        LabMetal.Aluminium,
        LabMetal.Zinc,
        LabMetal.Iron,
        LabMetal.Lead,
        LabMetal.Copper,
        LabMetal.Silver,
        LabMetal.Gold,
      ],
      reagents: SALT_REAGENTS,
      metal: LabMetal.Zinc,
      reagent: Reagent.IronSulphate,
      showSeries: true,
    });
    b.standsFor(
      lab,
      "a test tube of a salt solution and a ladder of the reactivity series beside it; the learner drops any metal into any salt and sees whether it displaces the metal of the salt, with the metal highlighted on the ladder",
    );
    const h = choiceQuestion(b, {
      name: "h",
      prompt: t(
        "Hydrogen sits between lead and copper in the series. Which metals give hydrogen with dilute acids?",
        "श्रेणी में हाइड्रोजन लेड और ताँबे के बीच है। कौन-सी धातुएँ तनु अम्लों से हाइड्रोजन देती हैं?",
      ),
      options: [
        {
          id: "right",
          label: t("The metals above hydrogen", "हाइड्रोजन से ऊपर वाली धातुएँ"),
        },
        {
          id: "below",
          label: t("The metals below hydrogen", "हाइड्रोजन से नीचे वाली धातुएँ"),
          feedback: t(
            "Copper, silver and gold are below hydrogen, and none of them gave bubbles with dilute acid.",
            "ताँबा, चाँदी और सोना हाइड्रोजन से नीचे हैं, और किसी ने तनु अम्ल के साथ बुलबुले नहीं दिए।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("The reactivity series", "सक्रियता श्रेणी")),
      w.body(
        t(
          "Run the tournament: any metal into any salt solution. A metal displaces only the metals **below** it.",
          "टूर्नामेंट चलाओ: कोई भी धातु किसी भी लवण विलयन में। धातु केवल अपने से **नीचे** वाली धातुओं को विस्थापित करती है।",
        ),
      ),
      lab,
      w.definition(
        t(
          "**Reactivity series.** A list of metals arranged in **decreasing order of reactivity** is the **reactivity series** (or activity series). From displacement experiments: K, Na, Ca, Mg, Al, Zn, Fe, Pb, [H], Cu, Hg, Ag, Au. **Potassium** is the most reactive, **gold** the least. Hydrogen is put in for comparison: metals **above hydrogen** displace hydrogen from dilute acids; metals below it don't.",
          "**सक्रियता श्रेणी।** **क्रियाशीलता के घटते क्रम** में लगाई गई धातुओं की सूची **सक्रियता श्रेणी** है। विस्थापन प्रयोगों से: K, Na, Ca, Mg, Al, Zn, Fe, Pb, [H], Cu, Hg, Ag, Au। **पोटैशियम** सबसे अधिक क्रियाशील है, **सोना** सबसे कम। तुलना के लिए हाइड्रोजन रखी गई है: **हाइड्रोजन से ऊपर** की धातुएँ तनु अम्लों से हाइड्रोजन विस्थापित करती हैं; नीचे वाली नहीं।",
        ),
      ),
      h,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** NCERT's A, B, C, D puzzle (in-text Q3). */
const puzzle = page(
  "puzzle",
  (b) => {
    const w = wordsOn(b);
    const most = choiceQuestion(b, {
      name: "most",
      prompt: t(
        "Which of A, B, C, D is the most reactive?",
        "A, B, C, D में से कौन सबसे अधिक क्रियाशील है?",
      ),
      options: [
        { id: "right", label: t("B", "B") },
        {
          id: "a",
          label: t("A", "A"),
          feedback: t(
            "A couldn't displace iron, but B could. B is above iron, A below it.",
            "A लोहे को विस्थापित नहीं कर सका, पर B कर सका। B लोहे से ऊपर है, A नीचे।",
          ),
        },
        {
          id: "c",
          label: t("C", "C"),
          feedback: t(
            "C only beat silver, so it is quite low in the series.",
            "C ने केवल चाँदी को हराया, इसलिए वह श्रेणी में काफ़ी नीचे है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const bcu = choiceQuestion(b, {
      name: "bcu",
      prompt: t(
        "What would you see if B is added to copper(II) sulphate solution?",
        "अगर B को कॉपर(II) सल्फ़ेट विलयन में डाला जाए तो क्या दिखेगा?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "B displaces copper: a brown coat of copper forms and the blue colour fades",
            "B ताँबे को विस्थापित करता है: ताँबे की भूरी परत बनती है और नीला रंग फीका पड़ता है",
          ),
        },
        {
          id: "nothing",
          label: t("No reaction", "कोई अभिक्रिया नहीं"),
          feedback: t(
            "B displaces iron, and iron is above copper, so B must displace copper too.",
            "B लोहे को विस्थापित करता है, और लोहा ताँबे से ऊपर है, इसलिए B ताँबे को भी विस्थापित करेगा।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const order = choiceQuestion(b, {
      name: "order",
      prompt: t(
        "Arrange A, B, C, D in decreasing reactivity.",
        "A, B, C, D को घटती क्रियाशीलता में लगाओ।",
      ),
      options: [
        { id: "right", label: t("B > A > C > D", "B > A > C > D") },
        {
          id: "abcd",
          label: t("A > B > C > D", "A > B > C > D"),
          feedback: t(
            "B displaced iron and A didn't, so B comes before A.",
            "B ने लोहे को विस्थापित किया और A ने नहीं, इसलिए B, A से पहले है।",
          ),
        },
        {
          id: "bcad",
          label: t("B > C > A > D", "B > C > A > D"),
          feedback: t(
            "A displaced copper; C couldn't. So A comes before C.",
            "A ने ताँबे को विस्थापित किया; C नहीं कर सका। इसलिए A, C से पहले है।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
    });
    b.when(most.on(QuestionSignal.Correct), theBoard.show(bcu));
    b.when(bcu.on(QuestionSignal.Correct), theBoard.show(order));
    return column([
      w.title(t("Four mystery metals", "चार रहस्यमय धातुएँ")),
      w.body(
        t(
          "Four metals A, B, C and D were dropped one by one into four solutions. NCERT's results:",
          "चार धातुएँ A, B, C और D एक-एक करके चार विलयनों में डाली गईं। NCERT के परिणाम:",
        ),
      ),
      w.definition(
        t(
          "**A:** no reaction with iron(II) sulphate; **displaces** copper from copper(II) sulphate. **B:** **displaces** iron from iron(II) sulphate; no reaction with zinc sulphate. **C:** no reaction with iron, copper or zinc salts; **displaces** silver from silver nitrate. **D:** no reaction with any of the four.",
          "**A:** आयरन(II) सल्फ़ेट से कोई अभिक्रिया नहीं; कॉपर(II) सल्फ़ेट से ताँबे को **विस्थापित** करता है। **B:** आयरन(II) सल्फ़ेट से लोहे को **विस्थापित** करता है; ज़िंक सल्फ़ेट से कोई अभिक्रिया नहीं। **C:** लोहे, ताँबे या ज़िंक के लवणों से कोई अभिक्रिया नहीं; सिल्वर नाइट्रेट से चाँदी को **विस्थापित** करता है। **D:** चारों में से किसी से अभिक्रिया नहीं।",
        ),
      ),
      w.body(
        t(
          "Place each one on the ladder: B is between zinc and iron, A between iron and copper, C between copper and silver, D below silver.",
          "हर एक को सीढ़ी पर रखो: B ज़िंक और लोहे के बीच है, A लोहे और ताँबे के बीच, C ताँबे और चाँदी के बीच, D चाँदी से नीचे।",
        ),
      ),
      most,
      bcu,
      order,
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
    const lab = labOn(b, "lab", {
      metals: [LabMetal.Copper, LabMetal.Silver, LabMetal.Gold],
      reagents: [Reagent.SilverNitrate, Reagent.CopperSulphate],
      metal: LabMetal.Gold,
      reagent: Reagent.SilverNitrate,
      showSeries: true,
    });
    b.standsFor(
      lab,
      "gold, silver and copper tried in silver nitrate and copper sulphate solutions, with the series ladder",
    );
    const bottom = choiceQuestion(b, {
      name: "bottom",
      prompt: t(
        "Kabir drops gold into every salt solution in the tournament. How many metals does gold beat?",
        "कबीर टूर्नामेंट में हर लवण विलयन में सोना डालता है। सोना कितनी धातुओं को हराता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "None: gold is at the very bottom of the series",
            "किसी को नहीं: सोना श्रेणी में सबसे नीचे है",
          ),
        },
        {
          id: "silver",
          label: t("Only silver", "केवल चाँदी को"),
          feedback: t(
            "Silver is above gold. Try gold in silver nitrate: nothing happens.",
            "चाँदी, सोने से ऊपर है। सिल्वर नाइट्रेट में सोना आज़माओ: कुछ नहीं होता।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const notes = w.definition(
      t(
        "**Case notes.** ✓ Gold is the **least reactive** metal in the series: no oxygen, water, dilute acid or salt solution touches it. That's why only something as fierce as aqua regia could have taken seven grams. ? Why are some metals so eager to react and gold so lazy? Next clue: what happens inside the atoms.",
        "**केस नोट्स।** ✓ सोना श्रेणी की **सबसे कम क्रियाशील** धातु है: न ऑक्सीजन, न पानी, न तनु अम्ल, न कोई लवण विलयन इसे छूता है। इसीलिए सात ग्राम केवल अम्लराज जैसी तेज़ चीज़ ही ले जा सकती थी। ? कुछ धातुएँ अभिक्रिया के लिए इतनी उत्सुक और सोना इतना सुस्त क्यों है? अगला सुराग: परमाणुओं के अंदर क्या होता है।",
      ),
      "notes",
      { isHidden: true },
    );
    b.when(bottom.on(QuestionSignal.Correct), [theBoard.show(notes), theBoard.pass()]);
    return column([w.title(t("Gold comes last", "सोना सबसे आख़िर में")), lab, bottom, notes, space()]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** In-text Q5: zinc in iron(II) sulphate. */
const example = page("example", (b) => {
  const w = wordsOn(b);
  const lab = labOn(b, "lab", {
    metals: [LabMetal.Zinc],
    reagents: [Reagent.IronSulphate],
  });
  b.standsFor(lab, "a piece of zinc in pale green iron(II) sulphate solution");
  return column([
    w.title(t("Example: zinc in iron sulphate", "उदाहरण: आयरन सल्फ़ेट में ज़िंक")),
    w.body(
      t(
        "**What would you observe when zinc is added to a solution of iron(II) sulphate? Write the equation.**",
        "**आयरन(II) सल्फ़ेट के विलयन में ज़िंक डालने पर क्या दिखेगा? समीकरण लिखो।**",
      ),
    ),
    lab,
    w.body(
      t(
        "Zinc is above iron in the series, so it displaces iron. A grey-black coat of iron forms on the zinc, and the pale green solution becomes colourless zinc sulphate:",
        "श्रेणी में ज़िंक लोहे से ऊपर है, इसलिए यह लोहे को विस्थापित करता है। ज़िंक पर लोहे की धूसर-काली परत बनती है, और हल्का हरा विलयन रंगहीन ज़िंक सल्फ़ेट बन जाता है:",
      ),
    ),
    w.body(ce("Zn(s) + FeSO4(aq) -> ZnSO4(aq) + Fe(s)")),
    space(),
  ]);
});

/** Exercise 1. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const pairs = multiChoiceQuestion(b, {
      name: "pairs",
      prompt: t(
        "Which of these pairs will give a displacement reaction? Tick all.",
        "इनमें से कौन-सी जोड़ियाँ विस्थापन अभिक्रिया देंगी? सभी पर निशान लगाओ।",
      ),
      options: [
        {
          id: "a",
          label: t(r`$\ce{NaCl}$ solution and copper`, r`$\ce{NaCl}$ विलयन और ताँबा`),
          feedback: t("Copper is far below sodium.", "ताँबा सोडियम से बहुत नीचे है।"),
        },
        {
          id: "b",
          label: t(r`$\ce{MgCl2}$ solution and aluminium`, r`$\ce{MgCl2}$ विलयन और ऐलुमिनियम`),
          feedback: t("Aluminium is below magnesium.", "ऐलुमिनियम मैग्नीशियम से नीचे है।"),
        },
        {
          id: "c",
          label: t(r`$\ce{FeSO4}$ solution and silver`, r`$\ce{FeSO4}$ विलयन और चाँदी`),
          feedback: t("Silver is below iron.", "चाँदी लोहे से नीचे है।"),
        },
        { id: "d", label: t(r`$\ce{AgNO3}$ solution and copper`, r`$\ce{AgNO3}$ विलयन और ताँबा`) },
      ],
      answers: ["d"],
      missing: t("Look again at the series.", "श्रेणी फिर देखो।"),
      passes: false,
    });
    const notes = w.definition(
      t(
        "**Case notes.** ✓ A more reactive metal displaces a less reactive one from its salt solution. ✓ The series: K, Na, Ca, Mg, Al, Zn, Fe, Pb, [H], Cu, Hg, Ag, Au. ✓ Metals above hydrogen give hydrogen with dilute acids. Next clue: why metals react at all.",
        "**केस नोट्स।** ✓ अधिक क्रियाशील धातु कम क्रियाशील धातु को उसके लवण विलयन से विस्थापित करती है। ✓ श्रेणी: K, Na, Ca, Mg, Al, Zn, Fe, Pb, [H], Cu, Hg, Ag, Au। ✓ हाइड्रोजन से ऊपर की धातुएँ तनु अम्लों से हाइड्रोजन देती हैं। अगला सुराग: धातुएँ अभिक्रिया करती ही क्यों हैं।",
      ),
      "notes",
      { isHidden: true },
    );
    b.when(pairs.on(QuestionSignal.Correct), [theBoard.show(notes), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), pairs, notes, space()]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [hook, displace, series, puzzle, inLife, example, yourTurn];

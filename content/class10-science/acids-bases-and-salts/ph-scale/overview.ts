import { type BoardKit, PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, goalQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  AcidBenchKind,
  AcidSceneKind,
  PhAction,
  PhDerived,
  SubstanceId,
  phScaleDef,
} from "@chalk/prop-chemistry";
import { benchOn, sceneOn } from "../kit";

/** A pH strip with substances to test on universal indicator paper. */
function phOn(
  b: BoardKit,
  name: string,
  substances: (typeof SubstanceId)[keyof typeof SubstanceId][],
  options: { showIons?: boolean; canProbe?: boolean } = {},
) {
  const prop = b.prop(phScaleDef, name, {
    substances,
    picked: null,
    probe: null,
    showColours: true,
    showRegions: true,
    showIons: options.showIons ?? false,
    showTested: true,
    tested: [],
    band: null,
    canPick: substances.length > 0,
    canProbe: options.canProbe ?? false,
  });
  b.studentOnly(prop.action(PhAction.Pick));
  b.studentOnly(prop.action(PhAction.Probe));
  b.studentOnly(prop.action(PhAction.Clear));
  return prop;
}

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** A rainbow of potions needs more than "acid or base". */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const potions = sceneOn(
    b,
    "potions",
    AcidSceneKind.MagicPotions,
    "a row of glasses with potions in many colours, from red through green to purple",
  );
  return column([
    w.title(t("A rainbow, not two colours", "दो रंग नहीं, इंद्रधनुष")),
    potions,
    w.body(
      t(
        'Litmus gives only two answers: acid or base. Riya wants a **rainbow** of potions in a row. Grandpa hands her a strip of paper from his old lab kit: "This one tells you not just *whether* it\'s an acid, but *how strong*."',
        'लिटमस केवल दो उत्तर देता है: अम्ल या क्षारक। रिया को एक पंक्ति में घोलों का **इंद्रधनुष** चाहिए। दादाजी अपनी पुरानी प्रयोगशाला किट से एक काग़ज़ की पट्टी देते हैं: "यह न केवल बताती है *कि* अम्ल है या नहीं, बल्कि *कितना प्रबल* है।"',
      ),
    ),
    w.body(
      t(
        "Stop 5: how strong is an acid or a base, and how do we measure it?",
        "पड़ाव 5: कोई अम्ल या क्षारक कितना प्रबल है, और हम इसे कैसे मापें?",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Activity 2.10: dissolving is exothermic; acid into water; dilution. */
const dilution = page(
  "dilution",
  (b) => {
    const w = wordsOn(b);
    const right = benchOn(b, "right", AcidBenchKind.AcidIntoWater);
    b.standsFor(
      right,
      "concentrated acid poured slowly into a beaker of water while stirring; the beaker gets warm",
    );
    const wrong = benchOn(b, "wrong", AcidBenchKind.WaterIntoAcid);
    b.standsFor(
      wrong,
      "water poured into concentrated acid: the mixture spits and splashes out, with a warning",
    );
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "Why must acid always be added to water, and not water to acid?",
        "अम्ल को हमेशा पानी में क्यों डालना चाहिए, पानी को अम्ल में क्यों नहीं?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Water into acid heats a small amount so fast that it splashes out and can burn, or crack the glass",
            "अम्ल में पानी डालने से थोड़ी मात्रा इतनी तेज़ गर्म होती है कि छलककर जला सकती है, या काँच तोड़ सकती है",
          ),
        },
        {
          id: "slow",
          label: t("Acid into water mixes faster", "पानी में अम्ल जल्दी घुलता है"),
          feedback: t(
            "It's about safety, not speed: mixing gives out a lot of heat.",
            "बात सुरक्षा की है, गति की नहीं: मिलाने पर बहुत ऊष्मा निकलती है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Mixing acid with water", "अम्ल को पानी में मिलाना")),
      w.body(
        t(
          "NCERT Activity 2.10: a few drops of concentrated sulphuric acid swirled into water. The beaker gets warm. Dissolving an acid or a base in water is **highly exothermic**: it gives out a lot of heat.",
          "NCERT क्रियाकलाप 2.10: सांद्र सल्फ़्यूरिक अम्ल की कुछ बूँदें पानी में घुमाई गईं। बीकर गर्म हो जाता है। अम्ल या क्षारक को पानी में घोलना **अत्यधिक ऊष्माक्षेपी** है: इसमें बहुत ऊष्मा निकलती है।",
        ),
      ),
      right,
      wrong,
      w.definition(
        t(
          "**Dilution.** Mixing an acid or base with water lowers the number of ions (H₃O⁺ or OH⁻) in each unit of volume. This is **dilution**, and the acid or base is now **diluted**. Containers of concentrated acids and alkalis carry a **corrosive** warning sign.",
          "**तनुकरण।** अम्ल या क्षारक को पानी में मिलाने से हर इकाई आयतन में आयनों (H₃O⁺ या OH⁻) की संख्या घटती है। यह **तनुकरण** है, और अम्ल या क्षारक अब **तनु** है। सांद्र अम्लों और क्षारों के डिब्बों पर **संक्षारक** का चेतावनी चिह्न होता है।",
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Universal indicator and the pH scale. */
const scale = page(
  "scale",
  (b) => {
    const w = wordsOn(b);
    const strip = phOn(b, "strip", [], { showIons: true, canProbe: true });
    b.standsFor(
      strip,
      "a pH strip from 0 to 14 in universal indicator colours, red through green to purple, with bars showing more H⁺ at low pH and more OH⁻ at high pH; a pointer can be dragged along it",
    );
    const goal = goalQuestion(b, {
      about: strip,
      prompt: t(
        "Drag the pointer to the pH of a neutral solution.",
        "पॉइंटर को उदासीन विलयन के pH पर खींचो।",
      ),
      isMet: strip.derived(PhDerived.PH).eq(7),
      solve: [strip.learner(PhAction.Probe, { pH: 7 })],
    });
    return column([
      w.title(t("The pH scale", "pH स्केल")),
      w.definition(
        t(
          "**Universal indicator.** A **universal indicator** is a mixture of several indicators. It shows a different colour for each concentration of hydrogen ions, not just two colours. It usually comes soaked into paper: **pH paper**.",
          "**सार्वत्रिक सूचक।** **सार्वत्रिक सूचक** कई सूचकों का मिश्रण है। यह हाइड्रोजन आयनों की हर सांद्रता के लिए अलग रंग दिखाता है, केवल दो रंग नहीं। यह आमतौर पर काग़ज़ में सोखा होता है: **pH पत्र**।",
        ),
      ),
      w.definition(
        t(
          "**pH.** **pH** is a number, usually from **0** (very acidic) to **14** (very alkaline), that tells how acidic or basic a solution is. The *p* comes from the German *potenz*, power. **7 is neutral.** Below 7 is acidic; above 7 is basic. The more hydronium ions, the **lower** the pH. Every solution in water, even a basic one, has some H⁺ and some OH⁻ ions: pH tells you which there are more of.",
          "**pH।** **pH** एक संख्या है, आमतौर पर **0** (बहुत अम्लीय) से **14** (बहुत क्षारीय) तक, जो बताती है कि विलयन कितना अम्लीय या क्षारकीय है। *p* जर्मन *पोटेंज़*, यानी शक्ति, से आया है। **7 उदासीन है।** 7 से नीचे अम्लीय; 7 से ऊपर क्षारकीय। जितने ज़्यादा हाइड्रोनियम आयन, pH उतना **कम**। पानी में हर विलयन में, क्षारकीय में भी, कुछ H⁺ और कुछ OH⁻ आयन होते हैं: pH बताता है कि किसकी संख्या ज़्यादा है।",
        ),
      ),
      strip,
      goal,
      w.body(
        t(
          "From 7 up to 14, the OH⁻ concentration rises: the alkali gets stronger.",
          "7 से 14 तक, OH⁻ की सांद्रता बढ़ती है: क्षार प्रबल होता जाता है।",
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Activity 2.11 / Table 2.2: testing real substances. */
const table = page(
  "table",
  (b) => {
    const w = wordsOn(b);
    const strip = phOn(b, "strip", [
      SubstanceId.SalivaBeforeMeal,
      SubstanceId.LemonJuice,
      SubstanceId.AeratedDrink,
      SubstanceId.CarrotJuice,
      SubstanceId.Coffee,
      SubstanceId.TomatoJuice,
      SubstanceId.TapWater,
      SubstanceId.MilkOfMagnesia,
    ]);
    b.standsFor(
      strip,
      "the pH strip with everyday liquids to test: saliva, lemon juice, a colourless fizzy drink, carrot juice, coffee, tomato juice, tap water and milk of magnesia; each tested one is marked on the strip",
    );
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t("Test them all. Which is the most acidic?", "सबको जाँचो। सबसे ज़्यादा अम्लीय कौन है?"),
      options: [
        { id: "right", label: t("Lemon juice", "नींबू का रस") },
        {
          id: "coffee",
          label: t("Coffee", "कॉफ़ी"),
          feedback: t(
            "Coffee is only slightly acidic. Look for the lowest pH on the strip.",
            "कॉफ़ी केवल थोड़ी अम्लीय है। पट्टी पर सबसे कम pH ढूँढो।",
          ),
        },
        {
          id: "magnesia",
          label: t("Milk of magnesia", "मिल्क ऑफ़ मैग्नीशिया"),
          feedback: t(
            "Milk of magnesia is above 7: it's a base.",
            "मिल्क ऑफ़ मैग्नीशिया 7 से ऊपर है: यह क्षारक है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Testing everyday liquids", "रोज़ के द्रवों की जाँच")),
      w.body(
        t(
          "NCERT Activity 2.11. Tap each liquid to touch it to pH paper. The colour gives its approximate pH, and the pH gives its nature.",
          "NCERT क्रियाकलाप 2.11। हर द्रव पर टैप करके उसे pH पत्र से छुआओ। रंग उसका लगभग pH बताता है, और pH उसकी प्रकृति।",
        ),
      ),
      strip,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Strong and weak acids: magnesium in HCl and acetic acid (Exercise 10). */
const strength = page(
  "strength",
  (b) => {
    const w = wordsOn(b);
    const bench = benchOn(b, "bench", AcidBenchKind.MagnesiumStrongWeak);
    b.standsFor(
      bench,
      "equal magnesium ribbons in tube A with hydrochloric acid and tube B with acetic acid of the same concentration; A fizzes hard, B gently",
    );
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "NCERT Exercise 10. Why does tube A (hydrochloric acid) fizz harder than tube B (acetic acid), at the same concentration?",
        "NCERT अभ्यास 10। एक ही सांद्रता पर, परखनली A (हाइड्रोक्लोरिक अम्ल) परखनली B (ऐसीटिक अम्ल) से ज़्यादा क्यों सनसनाती है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "HCl is a strong acid: it gives far more H⁺ ions",
            "HCl प्रबल अम्ल है: यह कहीं ज़्यादा H⁺ आयन देता है",
          ),
        },
        {
          id: "more",
          label: t("Tube A has more acid", "परखनली A में ज़्यादा अम्ल है"),
          feedback: t(
            "Same amount, same concentration. The difference is how many H⁺ ions each acid gives.",
            "मात्रा और सांद्रता एक ही है। फ़र्क़ इसमें है कि हर अम्ल कितने H⁺ आयन देता है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Strong and weak acids", "प्रबल और दुर्बल अम्ल")),
      w.definition(
        t(
          "**Strong and weak.** Take hydrochloric acid and acetic acid at the **same concentration**. They give different numbers of H⁺ ions. An acid that gives **more** H⁺ ions is a **strong acid** (HCl); one that gives fewer is a **weak acid** (acetic acid). In the same way, a **strong base** gives more OH⁻ ions than a **weak base**.",
          "**प्रबल और दुर्बल।** हाइड्रोक्लोरिक अम्ल और ऐसीटिक अम्ल को **एक ही सांद्रता** पर लो। ये अलग-अलग संख्या में H⁺ आयन देते हैं। जो अम्ल **ज़्यादा** H⁺ आयन दे वह **प्रबल अम्ल** (HCl) है; जो कम दे वह **दुर्बल अम्ल** (ऐसीटिक अम्ल)। इसी तरह, **प्रबल क्षारक** **दुर्बल क्षारक** से ज़्यादा OH⁻ आयन देता है।",
        ),
      ),
      w.note(
        t(
          "Strong is not the same as concentrated. Concentration is how much acid is in the water; strength is how much of it splits into ions.",
          "प्रबल और सांद्र एक नहीं हैं। सांद्रता बताती है पानी में कितना अम्ल है; प्रबलता बताती है उसका कितना हिस्सा आयनों में टूटता है।",
        ),
      ),
      bench,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** The party table on pH paper. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const strip = phOn(b, "strip", [
      SubstanceId.AeratedDrink,
      SubstanceId.Milk,
      SubstanceId.SoapSolution,
      SubstanceId.BakingSodaSolution,
      SubstanceId.Vinegar,
    ]);
    b.standsFor(
      strip,
      "the pH strip with the party table's liquids: a fizzy drink, milk, soap solution, baking soda solution and vinegar",
    );
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "Riya lines up the potions from red to purple. Which one goes at the purple end?",
        "रिया घोलों को लाल से बैंगनी तक सजाती है। बैंगनी सिरे पर कौन जाएगा?",
      ),
      options: [
        {
          id: "right",
          label: t("Soap solution: the highest pH here", "साबुन का घोल: यहाँ सबसे ऊँचा pH"),
        },
        {
          id: "vinegar",
          label: t("Vinegar", "सिरका"),
          feedback: t(
            "Vinegar is acidic: it sits at the red end.",
            "सिरका अम्लीय है: यह लाल सिरे पर है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const done = w.body(
      t(
        "Act 3, the potion rainbow: vinegar and fizzy drink at the red end, milk near green, baking soda blue-green, soap at the purple end. Same paper, a whole scale of colours.",
        "करतब 3, घोलों का इंद्रधनुष: सिरका और फ़िज़ी ड्रिंक लाल सिरे पर, दूध हरे के पास, खाने का सोडा नीला-हरा, साबुन बैंगनी सिरे पर। एक ही काग़ज़, रंगों का पूरा स्केल।",
      ),
      "done",
      { isHidden: true },
    );
    b.when(ask.on(QuestionSignal.Correct), [theBoard.show(done), theBoard.pass()]);
    return column([
      w.title(t("The party table, tested", "पार्टी की मेज़, जाँची गई")),
      strip,
      ask,
      done,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** NCERT Exercises 1 and 9; in-text Q5–6; the mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const ask1 = choiceQuestion(b, {
      name: "ask1",
      prompt: t(
        "NCERT Exercise 1. A solution turns red litmus blue. Its pH is likely to be:",
        "NCERT अभ्यास 1। एक विलयन लाल लिटमस को नीला करता है। इसका pH संभवतः है:",
      ),
      options: [
        { id: "right", label: t("10", "10") },
        {
          id: "1",
          label: t("1", "1"),
          feedback: t(
            "Red to blue means a base: pH above 7.",
            "लाल से नीला मतलब क्षारक: pH 7 से ऊपर।",
          ),
        },
        {
          id: "4",
          label: t("4", "4"),
          feedback: t("4 is acidic. A base is above 7.", "4 अम्लीय है। क्षारक 7 से ऊपर होता है।"),
        },
        {
          id: "5",
          label: t("5", "5"),
          feedback: t("5 is acidic. A base is above 7.", "5 अम्लीय है। क्षारक 7 से ऊपर होता है।"),
        },
      ],
      answer: "right",
      passes: false,
    });
    const ask2 = choiceQuestion(b, {
      name: "ask2",
      prompt: t(
        "NCERT Exercise 9. Solutions A, B, C, D, E have pH 4, 1, 11, 7 and 9. Which is strongly alkaline?",
        "NCERT अभ्यास 9। विलयन A, B, C, D, E का pH 4, 1, 11, 7 और 9 है। प्रबल क्षारीय कौन है?",
      ),
      options: [
        { id: "right", label: t("C (pH 11)", "C (pH 11)") },
        {
          id: "e",
          label: t("E (pH 9)", "E (pH 9)"),
          feedback: t(
            "9 is alkaline, but only weakly. The further above 7, the stronger: 11.",
            "9 क्षारीय है, पर दुर्बल। 7 से जितना ऊपर, उतना प्रबल: 11।",
          ),
        },
        {
          id: "b",
          label: t("B (pH 1)", "B (pH 1)"),
          feedback: t("pH 1 is strongly acidic.", "pH 1 प्रबल अम्लीय है।"),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const ask3 = choiceQuestion(b, {
      name: "ask3",
      prompt: t(
        "Diluting an acid with water: what happens to the concentration of H₃O⁺ ions?",
        "अम्ल को पानी से तनु करने पर H₃O⁺ आयनों की सांद्रता का क्या होता है?",
      ),
      options: [
        { id: "right", label: t("It decreases", "घटती है") },
        {
          id: "up",
          label: t("It increases", "बढ़ती है"),
          feedback: t(
            "The same ions spread through more water: fewer per unit volume.",
            "वही आयन ज़्यादा पानी में फैल जाते हैं: प्रति इकाई आयतन कम।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ Always add acid to water. ✓ pH 0–14: below 7 acidic, 7 neutral, above 7 basic; more H⁺ means lower pH. ✓ Strong acids give more H⁺ than weak ones. ✓ Act 3, the potion rainbow: ready. Next: why pH matters to living things.",
        "**मिशन लॉग।** ✓ हमेशा अम्ल को पानी में डालो। ✓ pH 0–14: 7 से नीचे अम्लीय, 7 उदासीन, 7 से ऊपर क्षारकीय; ज़्यादा H⁺ मतलब कम pH। ✓ प्रबल अम्ल दुर्बल से ज़्यादा H⁺ देते हैं। ✓ करतब 3, घोलों का इंद्रधनुष: तैयार। आगे: सजीवों के लिए pH क्यों मायने रखता है।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(ask1.on(QuestionSignal.Correct), theBoard.show(ask2));
    b.when(ask2.on(QuestionSignal.Correct), theBoard.show(ask3));
    b.when(ask3.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), ask1, ask2, ask3, log, space()]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [hook, dilution, scale, table, strength, inLife, yourTurn];

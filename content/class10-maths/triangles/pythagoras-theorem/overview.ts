import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, goalQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  PythAction,
  PythDerived,
  PythMode,
  PythSide,
  TrianglesSceneKind,
  pythagorasDef,
} from "@chalk/prop-triangles";
import { sceneOn } from "../kit";

const r = String.raw;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** How long must the wire be? */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const plan = sceneOn(
    b,
    "plan",
    TrianglesSceneKind.WireToTank,
    "a plan of the wire from the top of the 15 m tank down to the top of the 3 m gate pillar, 16 m away, making a right triangle with the wire as its longest side",
  );
  return column([
    w.title(t("How long is the wire?", "तार कितना लंबा है?")),
    plan,
    w.body(
      t(
        "Now the lights. The tank is 15 m tall (by its shadow) and the gate pillar is 3 m. Kabir paces the ground between their feet: 16 m. The wire must run straight from the top of the tank to the top of the pillar. The electrician needs one number: how long?",
        "अब रोशनी। टंकी 15 m ऊँची है (छाया से) और गेट का खंभा 3 m। कबीर दोनों के आधारों के बीच ज़मीन नापता है: 16 m। तार को टंकी के ऊपर से खंभे के ऊपर तक सीधा जाना है। बिजली वाले को एक संख्या चाहिए: कितना लंबा?",
      ),
    ),
    w.body(
      t(
        "Riya draws a right triangle on the plan. Its longest side is the wire. This lesson proves the theorem that measures it, using similar triangles.",
        "रिया नक्शे पर एक समकोण त्रिभुज बनाती है। उसकी सबसे लंबी भुजा तार है। यह पाठ उस प्रमेय को सिद्ध करता है जो इसे नापती है, समरूप त्रिभुजों से।",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Theorem 6.7: the altitude to the hypotenuse makes similar triangles. */
const altitude = page(
  "altitude",
  (b) => {
    const w = wordsOn(b);
    const proof = b.prop(pythagorasDef, "proof", {
      mode: PythMode.Altitude,
      ab: 3,
      bc: 4,
      ca: 5,
      step: 0,
      names: ["A", "B", "C", "D"],
      canSetSides: false,
      canStep: true,
      showAreas: false,
    });
    b.studentOnly(proof.action(PythAction.Next));
    b.standsFor(
      proof,
      "a right triangle ABC, right-angled at B, with the perpendicular BD to the hypotenuse AC; each step shows one pair of similar triangles",
    );
    const goal = goalQuestion(b, {
      about: proof,
      prompt: t(
        "Step through the three similar pairs that BD makes.",
        "BD से बनने वाले तीनों समरूप जोड़ों को एक-एक करके देखो।",
      ),
      isMet: proof.field("step").eq(3),
      solve: Array.from({ length: 3 }, () => proof.learner(PythAction.Next, {})),
    });
    return column([
      w.title(t("A perpendicular to the hypotenuse", "कर्ण पर लंब")),
      w.definition(
        t(
          "**Right triangle words.** A **right triangle** has one angle of 90°. The side opposite the right angle is the **hypotenuse**; it is the longest side.",
          "**समकोण त्रिभुज के शब्द।** **समकोण त्रिभुज** में एक कोण 90° का होता है। समकोण के सामने वाली भुजा **कर्ण** है; यह सबसे लंबी भुजा होती है।",
        ),
      ),
      w.body(
        t(
          r`Take ∆ ABC right-angled at B, and draw BD ⊥ AC. In ∆ ADB and ∆ ABC: $$\angle A = \angle A, \quad \angle ADB = \angle ABC = 90^\circ$$ so by AA, ∆ ADB ~ ∆ ABC. In the same way, with the shared angle C, ∆ BDC ~ ∆ ABC. Both are similar to ABC, so they are similar to each other.`,
          r`∆ ABC लो जो B पर समकोण है, और BD ⊥ AC खींचो। ∆ ADB और ∆ ABC में: $$\angle A = \angle A, \quad \angle ADB = \angle ABC = 90^\circ$$ तो AA से ∆ ADB ~ ∆ ABC। इसी तरह, साझा कोण C से, ∆ BDC ~ ∆ ABC। दोनों ABC के समरूप हैं, इसलिए आपस में भी समरूप हैं।`,
        ),
      ),
      proof,
      goal,
      w.definition(
        t(
          "**Theorem 6.7.** If a perpendicular is drawn from the vertex of the right angle of a right triangle to the hypotenuse, then the triangles on both sides of the perpendicular are similar to the whole triangle and to each other.",
          "**प्रमेय 6.7।** यदि किसी समकोण त्रिभुज के समकोण वाले शीर्ष से कर्ण पर लंब डाला जाए, तो लंब के दोनों ओर के त्रिभुज पूरे त्रिभुज के और आपस में समरूप होते हैं।",
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Theorem 6.8: Pythagoras, proved by 6.7. Baudhayan. */
const theorem = page(
  "theorem",
  (b) => {
    const w = wordsOn(b);
    const step = choiceQuestion(b, {
      name: "step",
      prompt: t(
        "In the last step, why does AC (AD + CD) become AC · AC?",
        "अंतिम चरण में AC (AD + CD), AC · AC क्यों बन जाता है?",
      ),
      options: [
        {
          id: "right",
          label: t("D lies on AC, so AD + CD = AC", "D, AC पर है, तो AD + CD = AC"),
        },
        {
          id: "sim",
          label: t("∆ ADB ~ ∆ BDC", "∆ ADB ~ ∆ BDC"),
          feedback: t(
            "That similarity was used earlier. Here it's just lengths: D splits AC into AD and DC.",
            "वह समरूपता पहले काम आ चुकी। यहाँ केवल लंबाइयाँ हैं: D, AC को AD और DC में बाँटता है।",
          ),
        },
        {
          id: "mid",
          label: t("D is the mid-point of AC", "D, AC का मध्य-बिंदु है"),
          feedback: t(
            "D needn't be the mid-point. Whatever the split, AD + DC is the whole of AC.",
            "D का मध्य-बिंदु होना ज़रूरी नहीं। विभाजन कैसा भी हो, AD + DC पूरा AC है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("The Pythagoras theorem", "पाइथागोरस प्रमेय")),
      w.definition(
        t(
          "**Theorem 6.8 (Pythagoras theorem).** In a right triangle, the square of the hypotenuse is equal to the sum of the squares of the other two sides.",
          "**प्रमेय 6.8 (पाइथागोरस प्रमेय)।** समकोण त्रिभुज में कर्ण का वर्ग बाक़ी दो भुजाओं के वर्गों के योग के बराबर होता है।",
        ),
      ),
      w.body(
        t(
          r`**Given:** ∆ ABC right-angled at B. **To prove:** $$AC^2 = AB^2 + BC^2$$ **Construction:** draw BD ⊥ AC.`,
          r`**दिया है:** ∆ ABC जो B पर समकोण है। **सिद्ध करना है:** $$AC^2 = AB^2 + BC^2$$ **रचना:** BD ⊥ AC खींचो।`,
        ),
      ),
      w.body(
        t(
          r`**Proof.** By Theorem 6.7, ∆ ADB ~ ∆ ABC, so the sides are proportional: $$\frac{AD}{AB} = \frac{AB}{AC}$$ $$AD \cdot AC = AB^2 \quad (1)$$ Also ∆ BDC ~ ∆ ABC: $$\frac{CD}{BC} = \frac{BC}{AC}$$ $$CD \cdot AC = BC^2 \quad (2)$$ Add (1) and (2): $$AD \cdot AC + CD \cdot AC = AB^2 + BC^2$$ $$AC\,(AD + CD) = AB^2 + BC^2$$ $$AC \cdot AC = AB^2 + BC^2$$ $$AC^2 = AB^2 + BC^2$$`,
          r`**उपपत्ति।** प्रमेय 6.7 से ∆ ADB ~ ∆ ABC, इसलिए भुजाएँ समानुपाती हैं: $$\frac{AD}{AB} = \frac{AB}{AC}$$ $$AD \cdot AC = AB^2 \quad (1)$$ साथ ही ∆ BDC ~ ∆ ABC: $$\frac{CD}{BC} = \frac{BC}{AC}$$ $$CD \cdot AC = BC^2 \quad (2)$$ (1) और (2) को जोड़ो: $$AD \cdot AC + CD \cdot AC = AB^2 + BC^2$$ $$AC\,(AD + CD) = AB^2 + BC^2$$ $$AC \cdot AC = AB^2 + BC^2$$ $$AC^2 = AB^2 + BC^2$$`,
        ),
      ),
      step,
      w.note(
        t(
          "The Indian mathematician Baudhayan (about 800 BCE) gave this result earlier, in the form: the diagonal of a rectangle produces by itself the same area as its length and breadth together. So it is also called the Baudhayan theorem.",
          "भारतीय गणितज्ञ बौधायन (लगभग 800 ई.पू.) ने यह परिणाम पहले ही इस रूप में दिया था: किसी आयत का विकर्ण अकेले उतना ही क्षेत्रफल बनाता है जितना उसकी लंबाई और चौड़ाई मिलकर। इसलिए इसे बौधायन प्रमेय भी कहते हैं।",
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Squares on the sides: try your own right triangle. */
const squares = page(
  "squares",
  (b) => {
    const w = wordsOn(b);
    const sq = b.prop(pythagorasDef, "sq", {
      mode: PythMode.Squares,
      ab: 3,
      bc: 4,
      ca: 5,
      step: 0,
      names: ["A", "B", "C", "D"],
      sideStep: 1,
      unit: "m",
      canSetSides: true,
      canStep: false,
      showAreas: true,
    });
    b.studentOnly(sq.action(PythAction.NudgeSide));
    b.standsFor(
      sq,
      "a right triangle with a square drawn on each side and their areas shown; the learner changes the two shorter sides and the hypotenuse follows",
    );
    const goal = goalQuestion(b, {
      about: sq,
      prompt: t(
        "Make the shorter sides 6 m and 8 m. How long is the hypotenuse now?",
        "छोटी भुजाएँ 6 m और 8 m करो। अब कर्ण कितना लंबा है?",
      ),
      isMet: sq.derived(PythDerived.Hypotenuse).eq(10),
      solve: [
        ...Array.from({ length: 3 }, () =>
          sq.learner(PythAction.NudgeSide, { side: PythSide.AB, by: 1 }),
        ),
        ...Array.from({ length: 4 }, () =>
          sq.learner(PythAction.NudgeSide, { side: PythSide.BC, by: 1 }),
        ),
      ],
    });
    return column([
      w.title(t("Squares on the sides", "भुजाओं पर वर्ग")),
      sq,
      goal,
      w.body(
        t(
          r`$$6^2 + 8^2 = 36 + 64 = 100 = 10^2$$ The big square holds exactly the other two together, for every right triangle you try.`,
          r`$$6^2 + 8^2 = 36 + 64 = 100 = 10^2$$ बड़े वर्ग में बाक़ी दोनों ठीक-ठीक समा जाते हैं, हर उस समकोण त्रिभुज के लिए जिसे तुम आज़माओ।`,
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Theorem 6.9: the converse. */
const converse = page(
  "converse",
  (b) => {
    const w = wordsOn(b);
    const check = b.prop(pythagorasDef, "check", {
      mode: PythMode.Converse,
      ab: 7,
      bc: 24,
      ca: 23,
      step: 0,
      names: ["A", "B", "C", "D"],
      sideStep: 1,
      unit: "cm",
      canSetSides: true,
      canStep: false,
      showAreas: true,
    });
    b.studentOnly(check.action(PythAction.NudgeSide));
    b.standsFor(
      check,
      "a triangle with three sides the learner can change, the squares of the sides, and whether there is a right angle and where",
    );
    const goal = goalQuestion(b, {
      about: check,
      prompt: t(
        "Exercise 6.5 Q1 (i): sides 7 cm and 24 cm. Change the third side until the triangle has a right angle.",
        "प्रश्नावली 6.5 प्र1 (i): भुजाएँ 7 cm और 24 cm। तीसरी भुजा तब तक बदलो जब तक त्रिभुज में समकोण न बन जाए।",
      ),
      isMet: check.derived(PythDerived.IsRight).eq(true),
      solve: [
        check.learner(PythAction.NudgeSide, { side: PythSide.CA, by: 1 }),
        check.learner(PythAction.NudgeSide, { side: PythSide.CA, by: 1 }),
      ],
    });
    return column([
      w.title(t("The converse", "विलोम")),
      w.definition(
        t(
          "**Theorem 6.9 (converse of Pythagoras).** In a triangle, if the square of one side is equal to the sum of the squares of the other two sides, then the angle opposite the first side is a right angle.",
          "**प्रमेय 6.9 (पाइथागोरस का विलोम)।** किसी त्रिभुज में, यदि एक भुजा का वर्ग बाक़ी दो भुजाओं के वर्गों के योग के बराबर हो, तो पहली भुजा के सामने का कोण समकोण होता है।",
        ),
      ),
      w.body(
        t(
          r`**Given:** ∆ ABC with $AC^2 = AB^2 + BC^2$. **To prove:** ∠B = 90°. **Construction:** make ∆ PQR right-angled at Q with PQ = AB and QR = BC. **Proof.** In ∆ PQR, by Pythagoras, $$PR^2 = PQ^2 + QR^2 = AB^2 + BC^2$$ It is given that $$AC^2 = AB^2 + BC^2$$ so AC = PR. Now AB = PQ, BC = QR and AC = PR, so by SSS congruence ∆ ABC ≅ ∆ PQR, and ∠B = ∠Q = 90°.`,
          r`**दिया है:** ∆ ABC जिसमें $AC^2 = AB^2 + BC^2$। **सिद्ध करना है:** ∠B = 90°। **रचना:** Q पर समकोण वाला ∆ PQR बनाओ जिसमें PQ = AB और QR = BC। **उपपत्ति।** ∆ PQR में पाइथागोरस से, $$PR^2 = PQ^2 + QR^2 = AB^2 + BC^2$$ दिया है कि $$AC^2 = AB^2 + BC^2$$ इसलिए AC = PR। अब AB = PQ, BC = QR और AC = PR, तो SSS सर्वांगसमता से ∆ ABC ≅ ∆ PQR, और ∠B = ∠Q = 90°।`,
        ),
      ),
      check,
      goal,
      w.body(
        t(
          r`$$7^2 + 24^2 = 49 + 576 = 625 = 25^2$$ so the triangle with sides 7, 24, 25 cm is right-angled, with hypotenuse 25 cm.`,
          r`$$7^2 + 24^2 = 49 + 576 = 625 = 25^2$$ तो 7, 24, 25 cm भुजाओं वाला त्रिभुज समकोण है, कर्ण 25 cm।`,
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Example 11 (the ladder) and Example 12. */
const examples = page(
  "examples",
  (b) => {
    const w = wordsOn(b);
    const ladder = sceneOn(
      b,
      "ladder",
      TrianglesSceneKind.LadderPillar,
      "Grandpa's ladder leaning against the gate pillar, its foot out from the pillar, Kabir steadying it",
    );
    const q9 = choiceQuestion(b, {
      name: "q9",
      prompt: t(
        "Exercise 6.5 Q9: a 10 m ladder reaches a window 8 m up. How far is its foot from the wall?",
        "प्रश्नावली 6.5 प्र9: 10 m की सीढ़ी 8 m ऊपर खिड़की तक पहुँचती है। उसका पैर दीवार से कितनी दूर है?",
      ),
      options: [
        { id: "right", label: t("6 m", "6 m") },
        {
          id: "add",
          label: t("2 m", "2 m"),
          feedback: t(
            "Subtract the squares, not the lengths: 10² − 8² = 100 − 64 = 36, so 6 m.",
            "लंबाइयाँ नहीं, वर्ग घटाओ: 10² − 8² = 100 − 64 = 36, तो 6 m।",
          ),
        },
        {
          id: "hyp",
          label: t("12.8 m", "12.8 m"),
          feedback: t(
            "That treats the ladder as a shorter side. The ladder is the hypotenuse, the longest side.",
            "इसमें सीढ़ी को छोटी भुजा मान लिया गया। सीढ़ी कर्ण है, सबसे लंबी भुजा।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Ladders and walls", "सीढ़ियाँ और दीवारें")),
      ladder,
      w.body(
        t(
          r`**Example 11.** A ladder's foot is 2.5 m from a wall and its top reaches a window 6 m up. The ladder AB is the hypotenuse: $$AB^2 = BC^2 + CA^2 = 2.5^2 + 6^2$$ $$= 6.25 + 36 = 42.25$$ $$AB = 6.5 \text{ m}$$`,
          r`**उदाहरण 11।** एक सीढ़ी का पैर दीवार से 2.5 m दूर है और उसका ऊपरी सिरा 6 m ऊपर खिड़की तक पहुँचता है। सीढ़ी AB कर्ण है: $$AB^2 = BC^2 + CA^2 = 2.5^2 + 6^2$$ $$= 6.25 + 36 = 42.25$$ $$AB = 6.5 \text{ m}$$`,
        ),
      ),
      w.body(
        t(
          r`**Example 12.** If AD ⊥ BC, prove $AB^2 + CD^2 = BD^2 + AC^2$. From the right triangles ADC and ADB: $$AC^2 = AD^2 + CD^2 \quad (1)$$ $$AB^2 = AD^2 + BD^2 \quad (2)$$ Subtract (1) from (2): $$AB^2 - AC^2 = BD^2 - CD^2$$ $$AB^2 + CD^2 = BD^2 + AC^2$$`,
          r`**उदाहरण 12।** यदि AD ⊥ BC, तो सिद्ध करो $AB^2 + CD^2 = BD^2 + AC^2$। समकोण त्रिभुजों ADC और ADB से: $$AC^2 = AD^2 + CD^2 \quad (1)$$ $$AB^2 = AD^2 + BD^2 \quad (2)$$ (2) में से (1) घटाओ: $$AB^2 - AC^2 = BD^2 - CD^2$$ $$AB^2 + CD^2 = BD^2 + AC^2$$`,
        ),
      ),
      q9,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** The wire: drop 12 m, across 16 m. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const plan = sceneOn(
      b,
      "plan",
      TrianglesSceneKind.WireToTank,
      "the wire plan: tank top 15 m, pillar top 3 m, 16 m apart, the right triangle with the wire as hypotenuse",
    );
    const wire = choiceQuestion(b, {
      name: "wire",
      prompt: t(
        "The tank top is 15 m up, the pillar top 3 m, and they are 16 m apart. How long is the wire?",
        "टंकी का ऊपरी सिरा 15 m ऊपर है, खंभे का 3 m, और वे 16 m दूर हैं। तार कितना लंबा है?",
      ),
      options: [
        { id: "right", label: t("20 m", "20 m") },
        {
          id: "full",
          label: t("21.9 m", "21.9 m"),
          feedback: t(
            "That uses the full 15 m height. The wire ends at the pillar's top, so the drop is only 15 − 3 = 12 m.",
            "इसमें पूरी 15 m ऊँचाई ली गई। तार खंभे के ऊपर ख़त्म होता है, इसलिए गिरावट केवल 15 − 3 = 12 m है।",
          ),
        },
        {
          id: "sum",
          label: t("28 m", "28 m"),
          feedback: t(
            "Adding 12 + 16 goes along the two shorter sides. The straight wire is shorter: √(12² + 16²).",
            "12 + 16 जोड़ना दोनों छोटी भुजाओं के साथ चलना है। सीधा तार छोटा है: √(12² + 16²)।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const done = w.body(
      t(
        r`The drop is 15 − 3 = 12 m and the gap 16 m: $$\text{wire}^2 = 12^2 + 16^2 = 144 + 256 = 400$$ $$\text{wire} = 20 \text{ m}$$ The electrician cuts 20 m, plus a little for the knots. **Stop 6 done.**`,
        r`गिरावट 15 − 3 = 12 m है और दूरी 16 m: $$\text{तार}^2 = 12^2 + 16^2 = 144 + 256 = 400$$ $$\text{तार} = 20 \text{ m}$$ बिजली वाला 20 m काटता है, गाँठों के लिए थोड़ा और। **पड़ाव 6 पूरा।**`,
      ),
      "done",
      { isHidden: true },
    );
    b.when(wire.on(QuestionSignal.Correct), [theBoard.show(done), theBoard.pass()]);
    return column([w.title(t("The wire, at last", "आख़िरकार, तार")), plan, wire, done, space()]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Exercise 6.5 Q12 and Q1 (ii); mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const poles = choiceQuestion(b, {
      name: "poles",
      prompt: t(
        "Exercise 6.5 Q12: poles of 6 m and 11 m stand 12 m apart. How far apart are their tops?",
        "प्रश्नावली 6.5 प्र12: 6 m और 11 m के खंभे 12 m दूर खड़े हैं। उनके ऊपरी सिरों के बीच कितनी दूरी है?",
      ),
      options: [
        { id: "right", label: t("13 m", "13 m") },
        {
          id: "full",
          label: t("16.3 m", "16.3 m"),
          feedback: t(
            "Use the difference in height, 11 − 6 = 5 m, not 11 m: √(5² + 12²) = 13.",
            "ऊँचाई का अंतर लो, 11 − 6 = 5 m, 11 m नहीं: √(5² + 12²) = 13।",
          ),
        },
        {
          id: "plain",
          label: t("12 m", "12 m"),
          feedback: t(
            "12 m is along the ground. The tops differ in height, so the straight line between them is longer.",
            "12 m ज़मीन के साथ है। ऊपरी सिरों की ऊँचाई अलग है, इसलिए उनके बीच की सीधी रेखा ज़्यादा लंबी है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const right = choiceQuestion(b, {
      name: "right",
      prompt: t(
        "Exercise 6.5 Q1 (ii): is a triangle with sides 3 cm, 8 cm, 6 cm right-angled?",
        "प्रश्नावली 6.5 प्र1 (ii): क्या 3 cm, 8 cm, 6 cm भुजाओं वाला त्रिभुज समकोण है?",
      ),
      options: [
        { id: "right", label: t("No: 3² + 6² ≠ 8²", "नहीं: 3² + 6² ≠ 8²") },
        {
          id: "yes",
          label: t("Yes: 8 is the longest side", "हाँ: 8 सबसे लंबी भुजा है"),
          feedback: t(
            "Every triangle has a longest side. Test it: 3² + 6² = 45 but 8² = 64.",
            "हर त्रिभुज की एक सबसे लंबी भुजा होती है। जाँचो: 3² + 6² = 45 पर 8² = 64।",
          ),
        },
        {
          id: "near",
          label: t("Yes: 3 + 6 is close to 8", "हाँ: 3 + 6, 8 के क़रीब है"),
          feedback: t(
            "The test uses squares, not sums: 3² + 6² must equal 8², and 45 ≠ 64.",
            "कसौटी वर्गों से है, योग से नहीं: 3² + 6² को 8² के बराबर होना चाहिए, और 45 ≠ 64।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ The altitude to the hypotenuse makes similar triangles. ✓ Pythagoras, and its converse. ✓ The wire is 20 m. Last stop: a few challenges, and then Republic Day.",
        "**मिशन लॉग।** ✓ कर्ण पर शीर्षलंब समरूप त्रिभुज बनाता है। ✓ पाइथागोरस, और उसका विलोम। ✓ तार 20 m है। अंतिम पड़ाव: कुछ चुनौतियाँ, और फिर गणतंत्र दिवस।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(right.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), poles, right, log, space()]);
  },
  { passOn: PassOn.Rules },
);

export const overview = [hook, altitude, theorem, squares, converse, examples, inLife, yourTurn];

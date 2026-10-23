import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, goalQuestion, wordsOn } from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import { CoordinatesSceneKind, PlaneAction, PlaneDerived } from "@chalk/prop-coordinates";
import { planeOn, sceneOn } from "../kit";

const r = String.raw;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** The banyan: 36 m along, 15 m up. How far as the crow flies? */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const crow = sceneOn(
    b,
    "crow",
    CoordinatesSceneKind.CrowFlies,
    "the park from above: Kabir's footprints go 36 m along the wall from the gate and then 15 m up to the banyan; a dashed straight line from the gate to the banyan has a question mark, and a crow flies along it",
  );
  return column([
    w.title(t("As the crow flies", "सीधी उड़ान जितनी दूरी")),
    crow,
    w.body(
      t(
        "Stop 1 is done: every place in the park is two numbers. The best clue goes under the old banyan tree, 36 m east of the gate along the wall and 15 m north. On the map it is (36, 15).",
        "पड़ाव 1 पूरा: पार्क की हर जगह दो संख्याएँ है। सबसे अच्छा सुराग पुराने बरगद के नीचे जाएगा, जो गेट से दीवार के साथ 36 m पूर्व और 15 m उत्तर है। नक्शे पर यह (36, 15) है।",
      ),
    ),
    w.body(
      t(
        "Kabir paces it out: along the wall, then up. That's 36 + 15 = 51 m. A crow on the gate flies straight to the tree. How far does the crow fly? The tree is on neither axis, so last lesson's trick doesn't work directly.",
        "कबीर क़दमों से नापता है: दीवार के साथ, फिर ऊपर। यह 36 + 15 = 51 m है। गेट पर बैठा एक कौवा सीधा पेड़ तक उड़ता है। कौवा कितना उड़ता है? पेड़ किसी अक्ष पर नहीं है, तो पिछले पाठ की तरकीब सीधे नहीं चलती।",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** P(4, 6), Q(6, 8): drop perpendiculars and use Pythagoras. */
const firstQuadrant = page(
  "first-quadrant",
  (b) => {
    const w = wordsOn(b);
    const plane = planeOn(
      b,
      "plane",
      {
        points: [
          { name: "P", x: 4, y: 6 },
          { name: "Q", x: 6, y: 8 },
        ],
        window: [-1, 9, -1, 10],
        showTriangle: true,
      },
      "graph paper with P(4, 6) and Q(6, 8) joined, and the right triangle PTQ under PQ: PT goes 2 across from P to T(6, 6) and TQ goes 2 up to Q, with a right-angle mark at T",
    );
    const ts = choiceQuestion(b, {
      prompt: t(
        "QS = 8, the height of Q above the x-axis. Why is QT = 2?",
        "QS = 8, x-अक्ष से Q की ऊँचाई है। QT = 2 क्यों है?",
      ),
      options: [
        { id: "right", label: t("QT = QS − TS = 8 − 6", "QT = QS − TS = 8 − 6") },
        {
          id: "rs",
          label: t("QT = RS = 6 − 4", "QT = RS = 6 − 4"),
          feedback: t(
            "RS = 6 − 4 is the distance across, which is PT. QT goes up, from height 6 to height 8.",
            "RS = 6 − 4 आड़ी दूरी है, जो PT है। QT ऊपर जाती है, ऊँचाई 6 से ऊँचाई 8 तक।",
          ),
        },
        {
          id: "half",
          label: t("QT = QS ÷ 4 = 8 ÷ 4", "QT = QS ÷ 4 = 8 ÷ 4"),
          feedback: t(
            "The 2 isn't a quarter of anything. T is level with P, 6 up, so QT = 8 − 6.",
            "2 किसी का चौथाई नहीं है। T, P के बराबर ऊँचाई पर, 6 ऊपर है, तो QT = 8 − 6।",
          ),
        },
      ],
      answer: "right",
    });
    const qt = w.body(
      t(
        r`TS = PR = 6, because T is level with P. So $$QT = QS - TS = 8 - 6 = 2$$ PTQ is a right triangle, so by Pythagoras $$PQ^2 = PT^2 + QT^2 = 2^2 + 2^2 = 8$$ $$PQ = \sqrt{8} = 2\sqrt{2} \text{ units}$$`,
        r`TS = PR = 6, क्योंकि T, P के बराबर ऊँचाई पर है। तो $$QT = QS - TS = 8 - 6 = 2$$ PTQ एक समकोण त्रिभुज है, तो पाइथागोरस से $$PQ^2 = PT^2 + QT^2 = 2^2 + 2^2 = 8$$ $$PQ = \sqrt{8} = 2\sqrt{2} \text{ इकाई}$$`,
      ),
      "qt",
      { isHidden: true },
    );
    b.when(ts.on(QuestionSignal.Correct), theBoard.show(qt));
    return column([
      w.title(t("Two points in the first quadrant", "पहले चतुर्थांश में दो बिंदु")),
      w.body(
        t(
          "Take P(4, 6) and Q(6, 8). Draw PR and QS perpendicular to the x-axis, so R is (4, 0) and S is (6, 0). From P draw PT perpendicular to QS. Then",
          "P(4, 6) और Q(6, 8) लो। x-अक्ष पर लंब PR और QS खींचो, तो R (4, 0) और S (6, 0) है। P से QS पर लंब PT खींचो। तब",
        ),
      ),
      w.body(t(r`$$PT = RS = 6 - 4 = 2$$`, r`$$PT = RS = 6 - 4 = 2$$`)),
      plane,
      ts,
      qt,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** P(6, 4), Q(−5, −3): different quadrants, same triangle. */
const twoQuadrants = page(
  "two-quadrants",
  (b) => {
    const w = wordsOn(b);
    const plane = planeOn(
      b,
      "plane",
      {
        points: [
          { name: "P", x: 6, y: 4 },
          { name: "Q", x: -5, y: -3 },
        ],
        window: [-7, 8, -5, 6],
        showTriangle: true,
      },
      "graph paper with P(6, 4) in quadrant I and Q(−5, −3) in quadrant III joined, and the right triangle PTQ: PT is 11 across at the height of P and TQ is 7 down to Q",
    );
    const why = choiceQuestion(b, {
      prompt: t("Why is PT 11 units?", "PT 11 इकाई क्यों है?"),
      options: [
        { id: "right", label: t("6 − (−5) = 11", "6 − (−5) = 11") },
        {
          id: "pq",
          label: t("11 is the length of PQ", "11, PQ की लंबाई है"),
          feedback: t(
            "PQ is the slanting side, √170 ≈ 13. PT is the level side: from x = −5 to x = 6 is 6 − (−5).",
            "PQ तिरछी भुजा है, √170 ≈ 13। PT आड़ी भुजा है: x = −5 से x = 6 तक 6 − (−5)।",
          ),
        },
        {
          id: "sum",
          label: t("6 + 4 + 1 = 11", "6 + 4 + 1 = 11"),
          feedback: t(
            "PT runs across, so only the x-coordinates matter: 6 − (−5).",
            "PT आड़ी है, तो केवल x-निर्देशांक मायने रखते हैं: 6 − (−5)।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Two points in different quadrants", "अलग-अलग चतुर्थांशों में दो बिंदु")),
      w.body(
        t(
          "P(6, 4) is in quadrant I and Q(−5, −3) is in quadrant III. Draw the same right triangle: T is level with P and straight above Q. Then PT = 11 units and QT = 7 units, so",
          "P(6, 4) चतुर्थांश I में है और Q(−5, −3) चतुर्थांश III में। वही समकोण त्रिभुज बनाओ: T, P के बराबर ऊँचाई पर और Q के ठीक ऊपर है। तब PT = 11 इकाई और QT = 7 इकाई, तो",
        ),
      ),
      w.body(
        t(
          r`$$PQ^2 = 11^2 + 7^2 = 121 + 49 = 170$$ $$PQ = \sqrt{170} \text{ units}$$`,
          r`$$PQ^2 = 11^2 + 7^2 = 121 + 49 = 170$$ $$PQ = \sqrt{170} \text{ इकाई}$$`,
        ),
      ),
      plane,
      why,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The general derivation, stepped. */
const derive = page(
  "derive",
  (b) => {
    const w = wordsOn(b);
    const plane = planeOn(
      b,
      "plane",
      {
        points: [
          { name: "P", x: 2, y: 3 },
          { name: "Q", x: 7, y: 7 },
        ],
        window: [-1, 9, -1, 9],
        showCoords: false,
        proof: true,
      },
      "two points P(x₁, y₁) and Q(x₂, y₂) on graph paper; Next draws PR and QS down to the x-axis, then PT across to QS meeting it at T with a right angle, then writes PT and QT, then gives PQ² = (x₂ − x₁)² + (y₂ − y₁)²",
    );
    const goal = goalQuestion(b, {
      about: plane,
      prompt: t("Tap Next through all five steps.", "Next दबाकर पाँचों चरण देखो।"),
      isMet: plane.derived(PlaneDerived.Step).eq(4),
      solve: Array.from({ length: 4 }, () => plane.learner(PlaneAction.Next, {})),
    });
    return column([
      w.title(t("Any two points", "कोई भी दो बिंदु")),
      w.body(
        t(
          "Now do the same for any P(x₁, y₁) and Q(x₂, y₂). Each step of the picture is one line of the argument.",
          "अब यही किन्हीं भी P(x₁, y₁) और Q(x₂, y₂) के लिए करो। चित्र का हर चरण तर्क की एक पंक्ति है।",
        ),
      ),
      plane,
      goal,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The distance formula, the origin case, either order. */
const formula = page(
  "formula",
  (b) => {
    const w = wordsOn(b);
    const order = choiceQuestion(b, {
      prompt: t(
        "Why can we also write PQ = √((x₁ − x₂)² + (y₁ − y₂)²)?",
        "हम PQ = √((x₁ − x₂)² + (y₁ − y₂)²) भी क्यों लिख सकते हैं?",
      ),
      options: [
        { id: "right", label: t("(x₁ − x₂)² = (x₂ − x₁)²", "(x₁ − x₂)² = (x₂ − x₁)²") },
        {
          id: "swap",
          label: t("x₁ and x₂ are always equal", "x₁ और x₂ हमेशा बराबर होते हैं"),
          feedback: t(
            "They usually differ. But x₁ − x₂ is just −(x₂ − x₁), and squaring removes the minus.",
            "ये आमतौर पर अलग होते हैं। पर x₁ − x₂ बस −(x₂ − x₁) है, और वर्ग करने से ऋण हट जाता है।",
          ),
        },
        {
          id: "root",
          label: t("A root is never negative", "वर्गमूल कभी ऋणात्मक नहीं होता"),
          feedback: t(
            "True, but that's not the reason. Look inside the root: (x₁ − x₂)² = (x₂ − x₁)².",
            "सच है, पर कारण यह नहीं। मूल के अंदर देखो: (x₁ − x₂)² = (x₂ − x₁)²।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("The distance formula", "दूरी सूत्र")),
      w.definition(
        t(
          r`**Distance formula.** The distance between P(x₁, y₁) and Q(x₂, y₂) is $$PQ = \sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$$ A distance is never negative, so we take only the positive square root.`,
          r`**दूरी सूत्र।** P(x₁, y₁) और Q(x₂, y₂) के बीच की दूरी है $$PQ = \sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$$ दूरी कभी ऋणात्मक नहीं होती, इसलिए हम केवल धनात्मक वर्गमूल लेते हैं।`,
        ),
      ),
      w.body(
        t(
          r`**From the origin.** Put O(0, 0) for the first point: the distance of P(x, y) from the origin is $$OP = \sqrt{x^2 + y^2}$$`,
          r`**मूलबिंदु से।** पहले बिंदु की जगह O(0, 0) रखो: P(x, y) की मूलबिंदु से दूरी है $$OP = \sqrt{x^2 + y^2}$$`,
        ),
      ),
      order,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Drag Q until PQ = 5. */
const tryIt = page(
  "try-it",
  (b) => {
    const w = wordsOn(b);
    const plane = planeOn(
      b,
      "plane",
      {
        points: [
          { name: "P", x: 1, y: 1 },
          { name: "Q", x: 6, y: 3 },
        ],
        movable: [1],
        window: [-1, 9, -1, 8],
        showTriangle: true,
        showWorking: true,
      },
      "graph paper with P(1, 1) fixed and Q that the learner drags; the right triangle under PQ and the working of PQ² are shown and update as Q moves",
    );
    const goal = goalQuestion(b, {
      about: plane,
      prompt: t(
        "Drag Q so that PQ = 5, without putting Q straight across from P or straight above it.",
        "Q को ऐसे खिसकाओ कि PQ = 5 हो, पर Q, P की सीध में आड़ा या ठीक ऊपर न हो।",
      ),
      isMet: plane
        .derived(PlaneDerived.D2)
        .eq(25)
        .and(plane.derived(PlaneDerived.X1).neq(1))
        .and(plane.derived(PlaneDerived.Y1).neq(1)),
      solve: [plane.learner(PlaneAction.SetPoint, { i: 1, x: 4, y: 5, isSnapped: true })],
      notes: [
        {
          when: plane.derived(PlaneDerived.D2).eq(25).and(plane.derived(PlaneDerived.Y1).eq(1)),
          say: t(
            "That's 5 straight across, which is easy. Find one where both legs are whole numbers: 3² + 4² = 25.",
            "यह 5 सीधे आड़ा है, जो आसान है। ऐसा ढूँढो जहाँ दोनों भुजाएँ पूर्ण संख्याएँ हों: 3² + 4² = 25।",
          ),
          reach: [plane.learner(PlaneAction.SetPoint, { i: 1, x: 6, y: 1, isSnapped: true })],
        },
      ],
    });
    return column([
      w.title(t("Your own points", "तुम्हारे अपने बिंदु")),
      w.body(
        t(
          "Move Q and watch the triangle and the working change.",
          "Q को खिसकाओ और त्रिभुज और हल को बदलते देखो।",
        ),
      ),
      plane,
      goal,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** The banyan is 39 m from the gate (Ex 7.1 Q2). */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const plane = planeOn(
      b,
      "park",
      {
        points: [
          { name: "O", x: 0, y: 0 },
          { name: "B", x: 36, y: 15 },
        ],
        window: [-3, 40, -3, 18],
        showTriangle: true,
      },
      "the park map with the gate O(0, 0) and the banyan B(36, 15) joined by a straight line; the right triangle under it has legs 36 along the wall and 15 up",
    );
    const crow = choiceQuestion(b, {
      prompt: t(
        "How far does the crow fly from the gate O(0, 0) to the banyan B(36, 15)?",
        "कौवा गेट O(0, 0) से बरगद B(36, 15) तक कितना उड़ता है?",
      ),
      options: [
        { id: "right", label: t("39 m", "39 m") },
        {
          id: "walk",
          label: t("51 m", "51 m"),
          feedback: t(
            "51 m is Kabir's walk, 36 + 15, along two sides. The crow takes the hypotenuse.",
            "51 m कबीर की सैर है, 36 + 15, दो भुजाओं के साथ। कौवा कर्ण से जाता है।",
          ),
        },
        {
          id: "diff",
          label: t("21 m", "21 m"),
          feedback: t(
            "That's 36 − 15. Use OB = √(36² + 15²) = √(1296 + 225).",
            "यह 36 − 15 है। OB = √(36² + 15²) = √(1296 + 225) लो।",
          ),
        },
      ],
      answer: "right",
    });
    const answer = w.body(
      t(
        r`$$OB = \sqrt{36^2 + 15^2} = \sqrt{1521} = 39 \text{ m}$$ The crow saves 12 m on Kabir's walk. This is also NCERT's puzzle: town B is 36 km east and 15 km north of town A, so the towns are 39 km apart.`,
        r`$$OB = \sqrt{36^2 + 15^2} = \sqrt{1521} = 39 \text{ m}$$ कौवा कबीर की सैर से 12 m बचाता है। यही NCERT की पहेली भी है: शहर B, शहर A से 36 km पूर्व और 15 km उत्तर है, तो दोनों शहर 39 km दूर हैं।`,
      ),
      "answer",
      { isHidden: true },
    );
    b.when(crow.on(QuestionSignal.Correct), [theBoard.show(answer), theBoard.pass()]);
    return column([w.title(t("The crow's answer", "कौवे का जवाब")), plane, crow, answer, space()]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Exercise 7.1 Q1, then the mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const q1 = choiceQuestion(b, {
      name: "q1",
      prompt: t(
        "Exercise 7.1 Q1 (ii): find the distance between (−5, 7) and (−1, 3).",
        "प्रश्नावली 7.1 प्र1 (ii): (−5, 7) और (−1, 3) के बीच की दूरी ज्ञात करो।",
      ),
      options: [
        { id: "right", label: t("4√2", "4√2") },
        {
          id: "ten",
          label: t("√(36 + 100)", "√(36 + 100)"),
          feedback: t(
            "You added where you should subtract. x₂ − x₁ = −1 − (−5) = 4 and y₂ − y₁ = 3 − 7 = −4.",
            "जहाँ घटाना था वहाँ जोड़ दिया। x₂ − x₁ = −1 − (−5) = 4 और y₂ − y₁ = 3 − 7 = −4।",
          ),
        },
        {
          id: "eight",
          label: t("8", "8"),
          feedback: t(
            "That's 4 + 4, the two legs added. The distance is √(4² + 4²) = √32.",
            "यह 4 + 4 है, दोनों भुजाएँ जोड़ीं। दूरी √(4² + 4²) = √32 है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const q3 = choiceQuestion(b, {
      name: "q3",
      prompt: t(
        "Exercise 7.1 Q1 (iii): find the distance between (a, b) and (−a, −b).",
        "प्रश्नावली 7.1 प्र1 (iii): (a, b) और (−a, −b) के बीच की दूरी ज्ञात करो।",
      ),
      options: [
        { id: "right", label: t("2√(a² + b²)", "2√(a² + b²)") },
        {
          id: "zero",
          label: t("0", "0"),
          feedback: t(
            "The points are different (unless a = b = 0). x₂ − x₁ = −a − a = −2a, and the same for y.",
            "बिंदु अलग हैं (जब तक a = b = 0 न हो)। x₂ − x₁ = −a − a = −2a, और y के लिए भी ऐसा ही।",
          ),
        },
        {
          id: "one",
          label: t("√(a² + b²)", "√(a² + b²)"),
          feedback: t(
            "That's each point's distance from O. The gap is (−2a)² + (−2b)² = 4(a² + b²) under the root.",
            "यह हर बिंदु की O से दूरी है। दूरी के मूल के अंदर (−2a)² + (−2b)² = 4(a² + b²) है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ Stop 2: the distance formula works for any two points. The banyan is 39 m from the gate as the crow flies. Next: use distances to check Kabir's straight trail and to find a fair spot for the treasure.",
        "**मिशन लॉग।** ✓ पड़ाव 2: दूरी सूत्र किन्हीं भी दो बिंदुओं के लिए चलता है। बरगद गेट से सीधी रेखा में 39 m है। आगे: दूरियों से कबीर का सीधा रास्ता जाँचना और खज़ाने के लिए बराबर दूरी वाली जगह ढूँढना।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(q3.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), q1, q3, log, space()]);
  },
  { passOn: PassOn.Rules },
);

export const overview = [
  hook,
  firstQuadrant,
  twoQuadrants,
  derive,
  formula,
  tryIt,
  inLife,
  yourTurn,
];

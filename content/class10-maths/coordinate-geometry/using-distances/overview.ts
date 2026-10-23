import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, goalQuestion, wordsOn } from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import { CoordinatesSceneKind, PlaneAction, PlaneDerived } from "@chalk/prop-coordinates";
import { planeOn, sceneOn } from "../kit";

const r = String.raw;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** A straight trail of stones, and a fair spot for the treasure. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const stones = sceneOn(
    b,
    "stones",
    CoordinatesSceneKind.ClueStones,
    "Kabir sets down the third of three painted clue stones on the grass, with a dashed line through all three; Riya checks the map",
  );
  return column([
    w.title(t("Is the trail straight?", "क्या रास्ता सीधा है?")),
    stones,
    w.body(
      t(
        'Stop 2 gave us the distance formula. Now Kabir lays three painted stones at (3, 1), (6, 4) and (8, 6). "Follow the stones in a straight line," says his clue. But are they really in one line? By eye, it\'s hard to be sure.',
        'पड़ाव 2 से हमें दूरी सूत्र मिला। अब कबीर तीन रंगे पत्थर (3, 1), (6, 4) और (8, 6) पर रखता है। "पत्थरों के साथ सीधी रेखा में चलो," उसका सुराग कहता है। पर क्या वे सच में एक रेखा में हैं? आँख से पक्का कहना मुश्किल है।',
      ),
    ),
    w.body(
      t(
        "And Riya wants the treasure to be fair: on the central path, exactly as far from the swing at (6, 5) as from the slide at (−4, 3). Where on the path should it go?",
        "और रिया चाहती है कि खज़ाना निष्पक्ष हो: बीच वाले रास्ते पर, झूले (6, 5) से ठीक उतनी ही दूर जितना फिसलपट्टी (−4, 3) से। रास्ते पर इसे कहाँ रखें?",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Example 1: a right triangle by the converse of Pythagoras. */
const rightTriangle = page(
  "right-triangle",
  (b) => {
    const w = wordsOn(b);
    const plane = planeOn(
      b,
      "plane",
      {
        points: [
          { name: "P", x: 3, y: 2 },
          { name: "Q", x: -2, y: -3 },
          { name: "R", x: 2, y: 3 },
        ],
        window: [-4, 5, -5, 5],
        join: "polygon",
        showLengths: true,
      },
      "graph paper with the triangle P(3, 2), Q(−2, −3), R(2, 3) and its side lengths: PQ = 5√2, QR = 2√13, PR = √2",
    );
    const where = choiceQuestion(b, {
      prompt: t(
        "PQ² + PR² = QR². Which angle of ∆PQR is the right angle?",
        "PQ² + PR² = QR²। ∆PQR का कौन-सा कोण समकोण है?",
      ),
      options: [
        { id: "right", label: t("∠P", "∠P") },
        {
          id: "q",
          label: t("∠Q", "∠Q"),
          feedback: t(
            "The right angle is opposite the longest side, QR. The vertex not on QR is P.",
            "समकोण सबसे लंबी भुजा QR के सामने होता है। जो शीर्ष QR पर नहीं है, वह P है।",
          ),
        },
        {
          id: "r",
          label: t("∠R", "∠R"),
          feedback: t(
            "R is on the longest side QR. The right angle is opposite QR, at P.",
            "R सबसे लंबी भुजा QR पर है। समकोण QR के सामने, P पर है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Example 1: is it a right triangle?", "उदाहरण 1: क्या यह समकोण त्रिभुज है?")),
      w.body(
        t(
          "Do P(3, 2), Q(−2, −3) and R(2, 3) form a triangle, and if so, what kind? Find the three sides:",
          "क्या P(3, 2), Q(−2, −3) और R(2, 3) एक त्रिभुज बनाते हैं, और बनाते हैं तो कैसा? तीनों भुजाएँ निकालो:",
        ),
      ),
      w.body(
        t(
          r`$$PQ^2 = (-2 - 3)^2 + (-3 - 2)^2 = 25 + 25 = 50$$ $$QR^2 = (2 + 2)^2 + (3 + 3)^2 = 16 + 36 = 52$$ $$PR^2 = (2 - 3)^2 + (3 - 2)^2 = 1 + 1 = 2$$`,
          r`$$PQ^2 = (-2 - 3)^2 + (-3 - 2)^2 = 25 + 25 = 50$$ $$QR^2 = (2 + 2)^2 + (3 + 3)^2 = 16 + 36 = 52$$ $$PR^2 = (2 - 3)^2 + (3 - 2)^2 = 1 + 1 = 2$$`,
        ),
      ),
      w.body(
        t(
          "PQ ≈ 7.07, QR ≈ 7.21 and PR ≈ 1.41. Any two of them add up to more than the third, so the points do form a triangle. And 50 + 2 = 52, so by the converse of the Pythagoras theorem it is a right triangle.",
          "PQ ≈ 7.07, QR ≈ 7.21 और PR ≈ 1.41। इनमें से कोई भी दो मिलकर तीसरी से बड़ी हैं, तो बिंदु त्रिभुज बनाते हैं। और 50 + 2 = 52, तो पाइथागोरस प्रमेय के विलोम से यह समकोण त्रिभुज है।",
        ),
      ),
      plane,
      where,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Example 2 and Ex 7.1 Q5: is it a square? */
const square = page(
  "square",
  (b) => {
    const w = wordsOn(b);
    const plane = planeOn(
      b,
      "plane",
      {
        points: [
          { name: "A", x: 1, y: 7 },
          { name: "B", x: 4, y: 2 },
          { name: "C", x: -1, y: -1 },
          { name: "D", x: -4, y: 4 },
        ],
        window: [-6, 6, -3, 9],
        join: "polygon",
        showLengths: true,
      },
      "graph paper with the quadrilateral A(1, 7), B(4, 2), C(−1, −1), D(−4, 4) and its four sides, each √34",
    );
    const who = choiceQuestion(b, {
      prompt: t(
        "Exercise 7.1 Q5: four friends sit at A(3, 4), B(6, 7), C(9, 4) and D(6, 1). Champa says ABCD is a square; Chameli disagrees. Who is right?",
        "प्रश्नावली 7.1 प्र5: चार दोस्त A(3, 4), B(6, 7), C(9, 4) और D(6, 1) पर बैठे हैं। चंपा कहती है ABCD एक वर्ग है; चमेली असहमत है। कौन सही है?",
      ),
      options: [
        {
          id: "right",
          label: t("Champa: sides 3√2, diagonals 6", "चंपा: भुजाएँ 3√2, विकर्ण 6"),
        },
        {
          id: "chameli",
          label: t("Chameli: it is tilted", "चमेली: यह तिरछा है"),
          feedback: t(
            "A square can sit tilted on the grid. Check the lengths: AB = BC = CD = DA = 3√2 and AC = BD = 6.",
            "वर्ग ग्रिड पर तिरछा भी हो सकता है। लंबाइयाँ जाँचो: AB = BC = CD = DA = 3√2 और AC = BD = 6।",
          ),
        },
        {
          id: "rhombus",
          label: t("Chameli: it's a rhombus", "चमेली: यह समचतुर्भुज है"),
          feedback: t(
            "Equal sides alone give a rhombus, but here the diagonals are equal too (AC = BD = 6), so it's a square.",
            "केवल बराबर भुजाओं से समचतुर्भुज बनता है, पर यहाँ विकर्ण भी बराबर हैं (AC = BD = 6), तो यह वर्ग है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Example 2: is it a square?", "उदाहरण 2: क्या यह वर्ग है?")),
      w.body(
        t(
          "A square has four equal sides and equal diagonals. For A(1, 7), B(4, 2), C(−1, −1), D(−4, 4):",
          "वर्ग की चारों भुजाएँ बराबर और विकर्ण बराबर होते हैं। A(1, 7), B(4, 2), C(−1, −1), D(−4, 4) के लिए:",
        ),
      ),
      w.body(
        t(
          r`$$AB = \sqrt{3^2 + 5^2} = \sqrt{34}$$ $$BC = \sqrt{5^2 + 3^2} = \sqrt{34}$$ $$CD = \sqrt{3^2 + 5^2} = \sqrt{34}$$ $$DA = \sqrt{5^2 + 3^2} = \sqrt{34}$$ $$AC = \sqrt{2^2 + 8^2} = \sqrt{68}$$ $$BD = \sqrt{8^2 + 2^2} = \sqrt{68}$$`,
          r`$$AB = \sqrt{3^2 + 5^2} = \sqrt{34}$$ $$BC = \sqrt{5^2 + 3^2} = \sqrt{34}$$ $$CD = \sqrt{3^2 + 5^2} = \sqrt{34}$$ $$DA = \sqrt{5^2 + 3^2} = \sqrt{34}$$ $$AC = \sqrt{2^2 + 8^2} = \sqrt{68}$$ $$BD = \sqrt{8^2 + 2^2} = \sqrt{68}$$`,
        ),
      ),
      w.body(
        t(
          "All four sides are equal and both diagonals are equal, so ABCD is a square.",
          "चारों भुजाएँ बराबर हैं और दोनों विकर्ण बराबर हैं, तो ABCD एक वर्ग है।",
        ),
      ),
      plane,
      who,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Example 3: collinear by distances. */
const collinear = page(
  "collinear",
  (b) => {
    const w = wordsOn(b);
    const plane = planeOn(
      b,
      "plane",
      {
        points: [
          { name: "A", x: 3, y: 1 },
          { name: "B", x: 6, y: 4 },
          { name: "C", x: 8, y: 6 },
        ],
        window: [-1, 10, -1, 8],
        join: "path",
        showLengths: true,
      },
      "graph paper with A(3, 1), B(6, 4) and C(8, 6) joined A to B to C, with AB = 3√2 and BC = 2√2 written; they lie on one straight line",
    );
    const q3 = choiceQuestion(b, {
      prompt: t(
        "Exercise 7.1 Q3: are (1, 5), (2, 3) and (−2, −11) collinear? The distances are √5, √212 and √265.",
        "प्रश्नावली 7.1 प्र3: क्या (1, 5), (2, 3) और (−2, −11) संरेख हैं? दूरियाँ √5, √212 और √265 हैं।",
      ),
      options: [
        {
          id: "right",
          label: t("No: no two add up to the third", "नहीं: कोई दो मिलकर तीसरी नहीं बनतीं"),
        },
        {
          id: "yes",
          label: t("Yes: √5 + √212 = √265", "हाँ: √5 + √212 = √265"),
          feedback: t(
            "Roots don't add like that: √5 + √212 ≈ 2.24 + 14.56 = 16.80, but √265 ≈ 16.28.",
            "मूल ऐसे नहीं जुड़ते: √5 + √212 ≈ 2.24 + 14.56 = 16.80, पर √265 ≈ 16.28।",
          ),
        },
        {
          id: "squares",
          label: t("Yes: 5 + 212 is near 265", "हाँ: 5 + 212, 265 के पास है"),
          feedback: t(
            "Adding the squares tests for a right angle, not a line. For a line, the two shorter distances must add to the longest.",
            "वर्ग जोड़ना समकोण की जाँच है, रेखा की नहीं। रेखा के लिए दो छोटी दूरियाँ मिलकर सबसे बड़ी बननी चाहिए।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Example 3: three points in a line", "उदाहरण 3: एक रेखा में तीन बिंदु")),
      w.definition(
        t(
          "**Collinear.** Points that lie on one straight line are **collinear**. Three points A, B, C are collinear exactly when the two shorter distances add up to the longest, for example AB + BC = AC.",
          "**संरेख।** एक ही सीधी रेखा पर स्थित बिंदु **संरेख** कहलाते हैं। तीन बिंदु A, B, C ठीक तब संरेख होते हैं जब दो छोटी दूरियाँ मिलकर सबसे बड़ी के बराबर हों, जैसे AB + BC = AC।",
        ),
      ),
      w.body(
        t(
          "NCERT's Example 3 seats three desks at A(3, 1), B(6, 4) and C(8, 6). Are they in a line?",
          "NCERT का उदाहरण 3 तीन डेस्क A(3, 1), B(6, 4) और C(8, 6) पर रखता है। क्या वे एक रेखा में हैं?",
        ),
      ),
      w.body(
        t(
          r`$$AB = \sqrt{3^2 + 3^2} = \sqrt{18} = 3\sqrt{2}$$ $$BC = \sqrt{2^2 + 2^2} = \sqrt{8} = 2\sqrt{2}$$ $$AC = \sqrt{5^2 + 5^2} = \sqrt{50} = 5\sqrt{2}$$ $$AB + BC = 3\sqrt{2} + 2\sqrt{2} = 5\sqrt{2} = AC$$`,
          r`$$AB = \sqrt{3^2 + 3^2} = \sqrt{18} = 3\sqrt{2}$$ $$BC = \sqrt{2^2 + 2^2} = \sqrt{8} = 2\sqrt{2}$$ $$AC = \sqrt{5^2 + 5^2} = \sqrt{50} = 5\sqrt{2}$$ $$AB + BC = 3\sqrt{2} + 2\sqrt{2} = 5\sqrt{2} = AC$$`,
        ),
      ),
      w.body(t("So A, B and C are collinear.", "तो A, B और C संरेख हैं।")),
      plane,
      q3,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Example 4: every point equidistant from A and B satisfies x − y = 2. */
const equidistant = page(
  "equidistant",
  (b) => {
    const w = wordsOn(b);
    const q10 = choiceQuestion(b, {
      prompt: t(
        "Exercise 7.1 Q10: find a relation between x and y if (x, y) is equidistant from (3, 6) and (−3, 4).",
        "प्रश्नावली 7.1 प्र10: x और y में संबंध ज्ञात करो, यदि (x, y), (3, 6) और (−3, 4) से समदूरस्थ है।",
      ),
      options: [
        { id: "right", label: t("3x + y = 5", "3x + y = 5") },
        {
          id: "swap",
          label: t("x + 3y = 5", "x + 3y = 5"),
          feedback: t(
            "Expand both sides: −6x − 12y + 45 = 6x − 8y + 25. Collect the terms: 12x + 4y = 20.",
            "दोनों पक्ष खोलो: −6x − 12y + 45 = 6x − 8y + 25। पद इकट्ठे करो: 12x + 4y = 20।",
          ),
        },
        {
          id: "sign",
          label: t("3x − y = 5", "3x − y = 5"),
          feedback: t(
            "Check the y-terms: −12y on the left and −8y on the right give 4y on the side with 12x.",
            "y वाले पद जाँचो: बाएँ −12y और दाएँ −8y से 12x वाली ओर 4y आता है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(
        t("Example 4: points equally far from two points", "उदाहरण 4: दो बिंदुओं से बराबर दूर बिंदु"),
      ),
      w.body(
        t(
          "A point is **equidistant** from A and B when it is the same distance from both. Which points P(x, y) are equidistant from A(7, 1) and B(3, 5)? Set AP = BP and square both sides:",
          "कोई बिंदु A और B से **समदूरस्थ** है जब वह दोनों से बराबर दूरी पर हो। कौन-से बिंदु P(x, y), A(7, 1) और B(3, 5) से समदूरस्थ हैं? AP = BP लो और दोनों पक्षों का वर्ग करो:",
        ),
      ),
      w.body(
        t(
          r`$$(x - 7)^2 + (y - 1)^2 = (x - 3)^2 + (y - 5)^2$$ $$x^2 - 14x + 49 + y^2 - 2y + 1$$ $$= x^2 - 6x + 9 + y^2 - 10y + 25$$ $$-14x - 2y + 50 = -6x - 10y + 34$$ $$-8x + 8y = -16$$ $$x - y = 2$$`,
          r`$$(x - 7)^2 + (y - 1)^2 = (x - 3)^2 + (y - 5)^2$$ $$x^2 - 14x + 49 + y^2 - 2y + 1$$ $$= x^2 - 6x + 9 + y^2 - 10y + 25$$ $$-14x - 2y + 50 = -6x - 10y + 34$$ $$-8x + 8y = -16$$ $$x - y = 2$$`,
        ),
      ),
      w.note(
        t(
          "x − y = 2 is a straight line: the perpendicular bisector of AB. Every point on it is equidistant from A and B.",
          "x − y = 2 एक सीधी रेखा है: AB का लंब समद्विभाजक। इस पर हर बिंदु A और B से समदूरस्थ है।",
        ),
      ),
      q10,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** A point on an axis: Ex 7.1 Q7 worked, Q8 to try. */
const onAnAxis = page(
  "on-an-axis",
  (b) => {
    const w = wordsOn(b);
    const q8 = choiceQuestion(b, {
      prompt: t(
        "Exercise 7.1 Q8: find the values of y for which P(2, −3) and Q(10, y) are 10 units apart.",
        "प्रश्नावली 7.1 प्र8: y के वे मान ज्ञात करो जिनके लिए P(2, −3) और Q(10, y) में 10 इकाई की दूरी हो।",
      ),
      options: [
        { id: "right", label: t("y = 3 or −9", "y = 3 या −9") },
        {
          id: "one",
          label: t("y = 3 only", "केवल y = 3"),
          feedback: t(
            "(y + 3)² = 36 gives y + 3 = 6 or y + 3 = −6. Both work: Q can be above or below.",
            "(y + 3)² = 36 से y + 3 = 6 या y + 3 = −6। दोनों चलते हैं: Q ऊपर या नीचे हो सकता है।",
          ),
        },
        {
          id: "swap",
          label: t("y = 9 or −3", "y = 9 या −3"),
          feedback: t(
            "From y + 3 = ±6, subtract 3: y = 6 − 3 = 3 or y = −6 − 3 = −9.",
            "y + 3 = ±6 से 3 घटाओ: y = 6 − 3 = 3 या y = −6 − 3 = −9।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("A point on an axis", "अक्ष पर एक बिंदु")),
      w.body(
        t(
          "Exercise 7.1 Q7: find the point on the x-axis equidistant from (2, −5) and (−2, 9). A point on the x-axis is (x, 0), so there is only one unknown. Set the squared distances equal:",
          "प्रश्नावली 7.1 प्र7: x-अक्ष पर वह बिंदु ज्ञात करो जो (2, −5) और (−2, 9) से समदूरस्थ है। x-अक्ष पर का बिंदु (x, 0) है, तो केवल एक अज्ञात है। दूरियों के वर्ग बराबर रखो:",
        ),
      ),
      w.body(
        t(
          r`$$(x - 2)^2 + (0 + 5)^2 = (x + 2)^2 + (0 - 9)^2$$ $$x^2 - 4x + 4 + 25 = x^2 + 4x + 4 + 81$$ $$-8x = 56$$ $$x = -7$$`,
          r`$$(x - 2)^2 + (0 + 5)^2 = (x + 2)^2 + (0 - 9)^2$$ $$x^2 - 4x + 4 + 25 = x^2 + 4x + 4 + 81$$ $$-8x = 56$$ $$x = -7$$`,
        ),
      ),
      w.body(t("The point is (−7, 0).", "बिंदु (−7, 0) है।")),
      q8,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** Example 5: the fair spot on the central path is (0, 9). */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const plane = planeOn(
      b,
      "park",
      {
        points: [
          { name: "S", x: 6, y: 5 },
          { name: "T", x: 0, y: 2 },
          { name: "L", x: -4, y: 3 },
        ],
        movable: [1],
        window: [-6, 8, -1, 11],
        join: "path",
        showLengths: true,
      },
      "the park map with the swing S(6, 5), the slide L(−4, 3) and the treasure T that the learner drags; T is joined to both, with TS and TL written",
    );
    const goal = goalQuestion(b, {
      about: plane,
      prompt: t(
        "Drag the treasure T up the central path (the y-axis) until TS = TL.",
        "खज़ाने T को बीच वाले रास्ते (y-अक्ष) पर ऊपर ले जाओ जब तक TS = TL न हो।",
      ),
      isMet: plane.derived(PlaneDerived.X1).eq(0).and(plane.derived(PlaneDerived.Y1).eq(9)),
      solve: [plane.learner(PlaneAction.SetPoint, { i: 1, x: 0, y: 9, isSnapped: true })],
      notes: [
        {
          when: plane.derived(PlaneDerived.X1).neq(0),
          say: t(
            "The treasure has to stay on the central path, where x = 0.",
            "खज़ाना बीच वाले रास्ते पर ही रहना चाहिए, जहाँ x = 0 है।",
          ),
          reach: [plane.learner(PlaneAction.SetPoint, { i: 1, x: 1, y: 7, isSnapped: true })],
        },
      ],
    });
    const working = w.body(
      t(
        r`This is NCERT's Example 5. With T(0, y): $$36 + (5 - y)^2 = 16 + (3 - y)^2$$ $$61 - 10y = 25 - 6y$$ $$y = 9$$ Both distances are √52 ≈ 7.2 m. Riya marks **(0, 9)** for the treasure.`,
        r`यह NCERT का उदाहरण 5 है। T(0, y) से: $$36 + (5 - y)^2 = 16 + (3 - y)^2$$ $$61 - 10y = 25 - 6y$$ $$y = 9$$ दोनों दूरियाँ √52 ≈ 7.2 m हैं। रिया खज़ाने के लिए **(0, 9)** चिह्नित करती है।`,
      ),
      "working",
      { isHidden: true },
    );
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(working));
    return column([
      w.title(t("The fair spot", "निष्पक्ष जगह")),
      w.body(
        t(
          "First Kabir's stones: they are exactly Example 3's desks, so they are collinear. The trail is straight. Now the treasure: it must be on the central path, so it is T(0, y).",
          "पहले कबीर के पत्थर: ये ठीक उदाहरण 3 की डेस्कें हैं, तो ये संरेख हैं। रास्ता सीधा है। अब खज़ाना: इसे बीच वाले रास्ते पर होना है, तो यह T(0, y) है।",
        ),
      ),
      plane,
      goal,
      working,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Exercise 7.1 Q4 and Q6, then the mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const q4 = choiceQuestion(b, {
      name: "q4",
      prompt: t(
        "Exercise 7.1 Q4: are (5, −2), (6, 4) and (7, −2) the vertices of an isosceles triangle?",
        "प्रश्नावली 7.1 प्र4: क्या (5, −2), (6, 4) और (7, −2) एक समद्विबाहु त्रिभुज के शीर्ष हैं?",
      ),
      options: [
        { id: "right", label: t("Yes: two sides are √37", "हाँ: दो भुजाएँ √37 हैं") },
        {
          id: "equal",
          label: t("No: it is equilateral", "नहीं: यह समबाहु है"),
          feedback: t(
            "The third side, from (5, −2) to (7, −2), is only 2. Two sides equal, one different: isosceles.",
            "तीसरी भुजा, (5, −2) से (7, −2), केवल 2 है। दो भुजाएँ बराबर, एक अलग: समद्विबाहु।",
          ),
        },
        {
          id: "none",
          label: t("No: all sides differ", "नहीं: सब भुजाएँ अलग हैं"),
          feedback: t(
            "Work out both slanting sides: √(1² + 6²) = √37 each.",
            "दोनों तिरछी भुजाएँ निकालो: हर एक √(1² + 6²) = √37।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const q6 = choiceQuestion(b, {
      name: "q6",
      prompt: t(
        "Exercise 7.1 Q6 (ii): what do (−3, 5), (3, 1), (0, 3) and (−1, −4) form?",
        "प्रश्नावली 7.1 प्र6 (ii): (−3, 5), (3, 1), (0, 3) और (−1, −4) क्या बनाते हैं?",
      ),
      options: [
        {
          id: "right",
          label: t("No quadrilateral: three points are collinear", "कोई चतुर्भुज नहीं: तीन बिंदु संरेख हैं"),
        },
        {
          id: "para",
          label: t("A parallelogram with unequal sides", "असमान भुजाओं वाला समांतर चतुर्भुज"),
          feedback: t(
            "Check (−3, 5), (3, 1), (0, 3) first: √13 + √13 = 2√13, the distance from (−3, 5) to (3, 1). They are in a line.",
            "पहले (−3, 5), (3, 1), (0, 3) जाँचो: √13 + √13 = 2√13, जो (−3, 5) से (3, 1) की दूरी है। ये एक रेखा में हैं।",
          ),
        },
        {
          id: "square",
          label: t("A square with all its sides √13", "सब भुजाएँ √13 वाला एक वर्ग"),
          feedback: t(
            "Not all sides are √13: (0, 3) to (−1, −4) is √50. And (0, 3) lies on the line from (−3, 5) to (3, 1).",
            "सब भुजाएँ √13 नहीं हैं: (0, 3) से (−1, −4) √50 है। और (0, 3), (−3, 5) से (3, 1) की रेखा पर है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ Stop 3: Kabir's stones are collinear, so the trail is straight. ✓ The treasure goes at (0, 9), the same distance from the swing and the slide. Next: a clue a given part of the way along a path.",
        "**मिशन लॉग।** ✓ पड़ाव 3: कबीर के पत्थर संरेख हैं, तो रास्ता सीधा है। ✓ खज़ाना (0, 9) पर जाएगा, झूले और फिसलपट्टी से बराबर दूर। आगे: रास्ते पर दिए गए हिस्से जितनी दूर एक सुराग।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(q6.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), q4, q6, log, space()]);
  },
  { passOn: PassOn.Rules },
);

export const overview = [
  hook,
  rightTriangle,
  square,
  collinear,
  equidistant,
  onAnAxis,
  inLife,
  yourTurn,
];

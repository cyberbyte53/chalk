import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, goalQuestion, wordsOn } from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  CoordinatesSceneKind,
  PlaneAction,
  PlaneDerived,
  SectionAction,
  SectionDerived,
} from "@chalk/prop-coordinates";
import { dividerOn, planeOn, sceneOn } from "../kit";

const r = String.raw;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** The flower bed's missing corner. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const bed = sceneOn(
    b,
    "bed",
    CoordinatesSceneKind.FlowerBed,
    "a flower bed shaped like a parallelogram: three of its corners have little flags and the fourth has a question mark; Riya holds the map and a measuring tape, Kabir holds the last clue card",
  );
  return column([
    w.title(t("The missing corner", "छूटा हुआ कोना")),
    bed,
    w.body(
      t(
        "Stop 4 put Kabir's clue at (12, 5). The last clue goes at a corner of the flower bed, which is a parallelogram. Grandpa's map shows three corners, A(6, 1), B(8, 2) and C(9, 4), but the fourth corner D was smudged: only its y-coordinate, 3, is clear.",
        "पड़ाव 4 ने कबीर का सुराग (12, 5) पर रखा। आख़िरी सुराग फूलों की क्यारी के एक कोने पर जाएगा, जो एक समांतर चतुर्भुज है। दादाजी का नक्शा तीन कोने दिखाता है, A(6, 1), B(8, 2) और C(9, 4), पर चौथा कोना D धुँधला गया: केवल उसका y-निर्देशांक 3 साफ़ है।",
      ),
    ),
    w.body(
      t(
        "Riya wonders: the section formula gives a point from a ratio. Can it run backwards, and find a missing corner?",
        "रिया सोचती है: विभाजन सूत्र अनुपात से बिंदु देता है। क्या यह उलटा चलकर छूटा कोना ढूँढ सकता है?",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Example 7: find the ratio. */
const findRatio = page(
  "find-the-ratio",
  (b) => {
    const w = wordsOn(b);
    const seg = dividerOn(
      b,
      "segment",
      {
        a: [-6, 10],
        b: [3, -8],
        m: 2,
        n: 7,
        canRatio: false,
        showParts: true,
        window: [-8, 5, -10, 12],
      },
      "the segment from A(−6, 10) to B(3, −8) marked in 9 equal parts, with P(−4, 6) two parts from A and seven from B, and the section formula worked out for 2 : 7",
    );
    const q4 = choiceQuestion(b, {
      prompt: t(
        "Exercise 7.2 Q4: in what ratio does (−1, 6) divide the join of (−3, 10) and (6, −8)?",
        "प्रश्नावली 7.2 प्र4: (−1, 6), (−3, 10) और (6, −8) को मिलाने वाले रेखाखंड को किस अनुपात में बाँटता है?",
      ),
      options: [
        { id: "right", label: t("2 : 7", "2 : 7") },
        {
          id: "swap",
          label: t("7 : 2", "7 : 2"),
          feedback: t(
            "(−1, 6) is near (−3, 10), the first point, so AP is the small part. Solve −1 = (6m₁ − 3m₂)/(m₁ + m₂): 7m₁ = 2m₂.",
            "(−1, 6), पहले बिंदु (−3, 10) के पास है, तो AP छोटा भाग है। −1 = (6m₁ − 3m₂)/(m₁ + m₂) हल करो: 7m₁ = 2m₂।",
          ),
        },
        {
          id: "half",
          label: t("1 : 2", "1 : 2"),
          feedback: t(
            "Check it: 1 : 2 gives x = (6 − 6)/3 = 0, not −1.",
            "जाँचो: 1 : 2 से x = (6 − 6)/3 = 0, −1 नहीं।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Example 7: find the ratio", "उदाहरण 7: अनुपात ज्ञात करना")),
      w.body(
        t(
          "In what ratio does (−4, 6) divide the join of A(−6, 10) and B(3, −8)? Let the ratio be m₁ : m₂ and use the x-coordinate:",
          "(−4, 6), A(−6, 10) और B(3, −8) को मिलाने वाले रेखाखंड को किस अनुपात में बाँटता है? अनुपात m₁ : m₂ मानो और x-निर्देशांक लो:",
        ),
      ),
      w.body(
        t(
          r`$$-4 = \frac{3m_1 - 6m_2}{m_1 + m_2}$$ $$-4m_1 - 4m_2 = 3m_1 - 6m_2$$ $$7m_1 = 2m_2$$ $$m_1 : m_2 = 2 : 7$$`,
          r`$$-4 = \frac{3m_1 - 6m_2}{m_1 + m_2}$$ $$-4m_1 - 4m_2 = 3m_1 - 6m_2$$ $$7m_1 = 2m_2$$ $$m_1 : m_2 = 2 : 7$$`,
        ),
      ),
      w.body(
        t(
          "Check with y: (2 × (−8) + 7 × 10)/9 = 54/9 = 6. ✓ You can also take the ratio as k : 1, solve −4 = (3k − 6)/(k + 1) and get k = 2/7.",
          "y से जाँचो: (2 × (−8) + 7 × 10)/9 = 54/9 = 6। ✓ अनुपात k : 1 भी मान सकते हो, −4 = (3k − 6)/(k + 1) हल करो और k = 2/7 पाओ।",
        ),
      ),
      seg,
      q4,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Example 9: where an axis cuts a segment. */
const axisCuts = page(
  "axis-cuts",
  (b) => {
    const w = wordsOn(b);
    const q5 = choiceQuestion(b, {
      prompt: t(
        "Exercise 7.2 Q5: in what ratio does the x-axis divide the join of A(1, −5) and B(−4, 5), and where?",
        "प्रश्नावली 7.2 प्र5: x-अक्ष, A(1, −5) और B(−4, 5) को मिलाने वाले रेखाखंड को किस अनुपात में और कहाँ बाँटता है?",
      ),
      options: [
        { id: "right", label: t("1 : 1, at (−3/2, 0)", "1 : 1, (−3/2, 0) पर") },
        {
          id: "y",
          label: t("1 : 1, at (0, −3/2)", "1 : 1, (0, −3/2) पर"),
          feedback: t(
            "On the x-axis, y = 0. The point is ((−4 + 1)/2, 0).",
            "x-अक्ष पर y = 0। बिंदु ((−4 + 1)/2, 0) है।",
          ),
        },
        {
          id: "k",
          label: t("4 : 1, at (−3, 0)", "4 : 1, (−3, 0) पर"),
          feedback: t(
            "Use the y-coordinate, which must be 0: (5k − 5)/(k + 1) = 0 gives k = 1.",
            "y-निर्देशांक लो, जो 0 होना चाहिए: (5k − 5)/(k + 1) = 0 से k = 1।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Example 9: where an axis cuts", "उदाहरण 9: अक्ष कहाँ काटता है")),
      w.body(
        t(
          "In what ratio does the y-axis divide the join of (5, −6) and (−1, −4)? Let the ratio be k : 1. The point is on the y-axis, so its x-coordinate is 0:",
          "y-अक्ष, (5, −6) और (−1, −4) को मिलाने वाले रेखाखंड को किस अनुपात में बाँटता है? अनुपात k : 1 मानो। बिंदु y-अक्ष पर है, तो उसका x-निर्देशांक 0 है:",
        ),
      ),
      w.body(
        t(r`$$\frac{-k + 5}{k + 1} = 0$$ $$k = 5$$`, r`$$\frac{-k + 5}{k + 1} = 0$$ $$k = 5$$`),
      ),
      w.body(
        t(
          r`So the ratio is 5 : 1, and the point is $$\left(0, \frac{5 \times (-4) + (-6)}{6}\right) = \left(0, -\frac{13}{3}\right)$$`,
          r`तो अनुपात 5 : 1 है, और बिंदु है $$\left(0, \frac{5 \times (-4) + (-6)}{6}\right) = \left(0, -\frac{13}{3}\right)$$`,
        ),
      ),
      q5,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Example 8: points of trisection. */
const trisection = page(
  "trisection",
  (b) => {
    const w = wordsOn(b);
    const seg = dividerOn(
      b,
      "segment",
      {
        a: [2, -2],
        b: [-7, 4],
        m: 1,
        n: 2,
        showParts: true,
        window: [-9, 4, -4, 6],
      },
      "the segment from A(2, −2) to B(−7, 4) marked in thirds, with P that the learner moves; it starts at (−1, 0), the first point of trisection",
    );
    const goal = goalQuestion(b, {
      about: seg,
      prompt: t(
        "P is at (−1, 0), the point of trisection nearer A. Move it to the other point of trisection.",
        "P, (−1, 0) पर है, A के पास वाला समत्रिभाजन बिंदु। इसे दूसरे समत्रिभाजन बिंदु पर ले जाओ।",
      ),
      isMet: seg.derived(SectionDerived.M).eq(2).and(seg.derived(SectionDerived.N).eq(1)),
      solve: [seg.learner(SectionAction.SetAlong, { t: 2 / 3 })],
    });
    const found = w.body(
      t(
        "At 2 : 1 the formula gives Q(−4, 2). So the points of trisection are (−1, 0) and (−4, 2).",
        "2 : 1 पर सूत्र Q(−4, 2) देता है। तो समत्रिभाजन बिंदु (−1, 0) और (−4, 2) हैं।",
      ),
      "found",
      { isHidden: true },
    );
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(found));
    return column([
      w.title(t("Example 8: points of trisection", "उदाहरण 8: समत्रिभाजन बिंदु")),
      w.definition(
        t(
          "**Points of trisection.** The two points that cut a segment into three equal parts. From A, the first divides AB in 1 : 2 and the second in 2 : 1.",
          "**समत्रिभाजन बिंदु।** वे दो बिंदु जो रेखाखंड को तीन बराबर भागों में काटते हैं। A से, पहला AB को 1 : 2 में और दूसरा 2 : 1 में बाँटता है।",
        ),
      ),
      w.body(
        t(
          "Trisect the join of A(2, −2) and B(−7, 4).",
          "A(2, −2) और B(−7, 4) को मिलाने वाले रेखाखंड को समत्रिभाजित करो।",
        ),
      ),
      seg,
      goal,
      found,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Example 10: a parallelogram's diagonals bisect each other. */
const parallelogram = page(
  "parallelogram",
  (b) => {
    const w = wordsOn(b);
    const q6 = choiceQuestion(b, {
      prompt: t(
        "Exercise 7.2 Q6: (1, 2), (4, y), (x, 6) and (3, 5) are the vertices of a parallelogram, in order. Find x and y.",
        "प्रश्नावली 7.2 प्र6: (1, 2), (4, y), (x, 6) और (3, 5) क्रम से एक समांतर चतुर्भुज के शीर्ष हैं। x और y ज्ञात करो।",
      ),
      options: [
        { id: "right", label: t("x = 6, y = 3", "x = 6, y = 3") },
        {
          id: "swap",
          label: t("x = 3, y = 6", "x = 3, y = 6"),
          feedback: t(
            "Pair the opposite corners: (1, 2) with (x, 6), and (4, y) with (3, 5). Then (1 + x)/2 = 7/2 and 8/2 = (y + 5)/2.",
            "सम्मुख कोनों को जोड़ो: (1, 2) के साथ (x, 6), और (4, y) के साथ (3, 5)। तब (1 + x)/2 = 7/2 और 8/2 = (y + 5)/2।",
          ),
        },
        {
          id: "next",
          label: t("x = 6, y = 4", "x = 6, y = 4"),
          feedback: t(
            "x is right. For y: the mid-point of the first diagonal has y = (2 + 6)/2 = 4, so (y + 5)/2 = 4 and y = 3.",
            "x सही है। y के लिए: पहले विकर्ण के मध्य-बिंदु का y = (2 + 6)/2 = 4, तो (y + 5)/2 = 4 और y = 3।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Example 10: the fourth corner", "उदाहरण 10: चौथा कोना")),
      w.body(
        t(
          "The diagonals of a parallelogram bisect each other (Class 9), so both diagonals have the same mid-point. A(6, 1), B(8, 2), C(9, 4) and D(p, 3) are the vertices of a parallelogram ABCD, in order. Find p.",
          "समांतर चतुर्भुज के विकर्ण एक-दूसरे को समद्विभाजित करते हैं (कक्षा 9), तो दोनों विकर्णों का मध्य-बिंदु एक ही है। A(6, 1), B(8, 2), C(9, 4) और D(p, 3) क्रम से समांतर चतुर्भुज ABCD के शीर्ष हैं। p ज्ञात करो।",
        ),
      ),
      w.body(
        t(
          r`$$\text{mid-point of AC} = \left(\frac{6 + 9}{2}, \frac{1 + 4}{2}\right) = \left(\frac{15}{2}, \frac{5}{2}\right)$$ $$\text{mid-point of BD} = \left(\frac{8 + p}{2}, \frac{2 + 3}{2}\right)$$ $$\frac{8 + p}{2} = \frac{15}{2}$$ $$p = 7$$`,
          r`$$\text{AC का मध्य-बिंदु} = \left(\frac{6 + 9}{2}, \frac{1 + 4}{2}\right) = \left(\frac{15}{2}, \frac{5}{2}\right)$$ $$\text{BD का मध्य-बिंदु} = \left(\frac{8 + p}{2}, \frac{2 + 3}{2}\right)$$ $$\frac{8 + p}{2} = \frac{15}{2}$$ $$p = 7$$`,
        ),
      ),
      q6,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** The flower bed is Example 10: the last clue is at D(7, 3). */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const bed = planeOn(
      b,
      "bed",
      {
        points: [
          { name: "A", x: 6, y: 1 },
          { name: "B", x: 8, y: 2 },
          { name: "C", x: 9, y: 4 },
          { name: "D", x: 5, y: 4 },
        ],
        movable: [3],
        window: [3, 11, -1, 6],
        join: "polygon",
      },
      "the flower bed on the park map: corners A(6, 1), B(8, 2), C(9, 4) and the smudged corner D that the learner drags; the four are joined in order",
    );
    const goal = goalQuestion(b, {
      about: bed,
      prompt: t(
        "Drag D to the place that makes ABCD a parallelogram.",
        "D को उस जगह ले जाओ जहाँ ABCD समांतर चतुर्भुज बने।",
      ),
      isMet: bed.derived(PlaneDerived.X3).eq(7).and(bed.derived(PlaneDerived.Y3).eq(3)),
      solve: [bed.learner(PlaneAction.SetPoint, { i: 3, x: 7, y: 3, isSnapped: true })],
    });
    const answer = w.body(
      t(
        "D is at **(7, 3)**, just as in Example 10. Riya pushes the last clue card into the soil there.",
        "D **(7, 3)** पर है, ठीक उदाहरण 10 जैसा। रिया आख़िरी सुराग कार्ड वहीं मिट्टी में लगाती है।",
      ),
      "answer",
      { isHidden: true },
    );
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(answer));
    return column([w.title(t("The last clue", "आख़िरी सुराग")), bed, goal, answer, space()]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Exercise 7.2 Q3 (the flags) and Q7, then the mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const q3 = choiceQuestion(b, {
      name: "q3",
      prompt: t(
        "Exercise 7.2 Q3: on sports day, lines are chalked 1 m apart down the school ground AD, which is 100 m long. Niharika runs ¼ of AD on line 2 and posts a green flag; Preet runs ⅕ of AD on line 8 and posts a red flag. Taking A as the origin, line numbers as x and distance along AD as y, where does Rashmi post a blue flag exactly halfway between them?",
        "प्रश्नावली 7.2 प्र3: खेल दिवस पर स्कूल के मैदान AD पर, जो 100 m लंबा है, 1 m की दूरी पर चूने की रेखाएँ खींची हैं। निहारिका रेखा 2 पर AD का ¼ दौड़कर हरा झंडा लगाती है; प्रीत रेखा 8 पर AD का ⅕ दौड़कर लाल झंडा लगाती है। A को मूलबिंदु, रेखा की संख्या को x और AD के साथ दूरी को y मानो। रश्मि दोनों के ठीक बीच नीला झंडा कहाँ लगाए?",
      ),
      options: [
        { id: "right", label: t("(5, 22.5): line 5, 22.5 m", "(5, 22.5): रेखा 5, 22.5 m") },
        {
          id: "sum",
          label: t("(10, 45): line 10, 45 m", "(10, 45): रेखा 10, 45 m"),
          feedback: t(
            "You added the flags' coordinates but didn't halve. Green is (2, 25) and red is (8, 20); average them.",
            "तुमने झंडों के निर्देशांक जोड़े पर आधा नहीं किया। हरा (2, 25) और लाल (8, 20) है; इनका औसत लो।",
          ),
        },
        {
          id: "diff",
          label: t("(3, 2.5): line 3, 2.5 m", "(3, 2.5): रेखा 3, 2.5 m"),
          feedback: t(
            "That's half the gap between the flags, not the point between them. The mid-point averages: ((2 + 8)/2, (25 + 20)/2).",
            "यह झंडों के बीच के अंतर का आधा है, उनके बीच का बिंदु नहीं। मध्य-बिंदु औसत है: ((2 + 8)/2, (25 + 20)/2)।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const q7 = choiceQuestion(b, {
      name: "q7",
      prompt: t(
        "Exercise 7.2 Q7: AB is a diameter of a circle with centre (2, −3), and B is (1, 4). Find A.",
        "प्रश्नावली 7.2 प्र7: AB, केंद्र (2, −3) वाले वृत्त का व्यास है, और B (1, 4) है। A ज्ञात करो।",
      ),
      options: [
        { id: "right", label: t("(3, −10)", "(3, −10)") },
        {
          id: "mid",
          label: t("(1.5, 0.5)", "(1.5, 0.5)"),
          feedback: t(
            "That's the mid-point of the centre and B. The centre is the mid-point of A and B: (x + 1)/2 = 2 and (y + 4)/2 = −3.",
            "यह केंद्र और B का मध्य-बिंदु है। केंद्र, A और B का मध्य-बिंदु है: (x + 1)/2 = 2 और (y + 4)/2 = −3।",
          ),
        },
        {
          id: "sign",
          label: t("(3, 10)", "(3, 10)"),
          feedback: t(
            "Check y: (y + 4)/2 = −3 gives y + 4 = −6, so y = −10.",
            "y जाँचो: (y + 4)/2 = −3 से y + 4 = −6, तो y = −10।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ Stop 5: the section formula runs backwards too: it finds ratios, points of trisection and missing corners. The last clue is at the flower bed's corner D(7, 3). Next: Mom's herb patch needs mulch, so we need an area.",
        "**मिशन लॉग।** ✓ पड़ाव 5: विभाजन सूत्र उलटा भी चलता है: इससे अनुपात, समत्रिभाजन बिंदु और छूटे कोने मिलते हैं। आख़िरी सुराग क्यारी के कोने D(7, 3) पर है। आगे: मम्मी की जड़ी-बूटी की क्यारी को खाद चाहिए, तो हमें एक क्षेत्रफल चाहिए।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(q7.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), q3, q7, log, space()]);
  },
  { passOn: PassOn.Rules },
);

export const overview = [hook, findRatio, trisection, axisCuts, parallelogram, inLife, yourTurn];

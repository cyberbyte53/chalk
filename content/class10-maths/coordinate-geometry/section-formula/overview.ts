import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, goalQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import { CoordinatesSceneKind, SectionAction, SectionDerived } from "@chalk/prop-coordinates";
import { dividerOn, sceneOn } from "../kit";

const r = String.raw;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** A clue on the path, twice as far from the banyan as from the gate. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const flag = sceneOn(
    b,
    "flag",
    CoordinatesSceneKind.HalfwayClue,
    "the straight path from the gate to the banyan, split by small marks into three equal parts; Kabir pushes a clue flag in at the first mark, one part from the gate and two parts from the tree",
  );
  return column([
    w.title(t("A clue on the path", "रास्ते पर एक सुराग")),
    flag,
    w.body(
      t(
        "Stop 3 is done: the stone trail is straight and the treasure goes at (0, 9). Now Kabir wants a clue on the straight path from the gate O(0, 0) to the banyan B(36, 15), placed so that it is twice as far from the banyan as from the gate.",
        "पड़ाव 3 पूरा: पत्थरों का रास्ता सीधा है और खज़ाना (0, 9) पर जाएगा। अब कबीर गेट O(0, 0) से बरगद B(36, 15) तक के सीधे रास्ते पर एक सुराग चाहता है, ऐसे कि वह बरगद से गेट की तुलना में दोगुनी दूरी पर हो।",
      ),
    ),
    w.body(
      t(
        "He can't just halve the numbers: that would be the middle. What are the coordinates of the clue?",
        "वह संख्याओं को बस आधा नहीं कर सकता: वह तो बीच होगा। सुराग के निर्देशांक क्या हैं?",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Dividing a segment in a ratio. */
const ratio = page(
  "ratio",
  (b) => {
    const w = wordsOn(b);
    const seg = dividerOn(
      b,
      "segment",
      {
        a: [0, 0],
        b: [12, 4],
        m: 1,
        n: 1,
        window: [-1, 13, -2, 6],
        showParts: true,
        showWorking: false,
      },
      "a segment AB from (0, 0) to (12, 4) with the point P on it that the learner drags, or sets with the m₁ and m₂ buttons; AB is marked in m₁ + m₂ equal parts and the ratio AP : PB is written under it",
    );
    const goal = goalQuestion(b, {
      about: seg,
      prompt: t("Move P so that AP : PB = 3 : 1.", "P को ऐसे खिसकाओ कि AP : PB = 3 : 1 हो।"),
      isMet: seg.derived(SectionDerived.M).eq(3).and(seg.derived(SectionDerived.N).eq(1)),
      solve: [seg.learner(SectionAction.SetAlong, { t: 0.75 })],
      notes: [
        {
          when: seg.derived(SectionDerived.M).eq(1).and(seg.derived(SectionDerived.N).eq(3)),
          say: t(
            "That's 1 : 3: P is near A. The first number is AP, so P must be 3 parts from A.",
            "यह 1 : 3 है: P, A के पास है। पहली संख्या AP है, तो P को A से 3 भाग दूर होना है।",
          ),
          reach: [seg.learner(SectionAction.SetAlong, { t: 0.25 })],
        },
      ],
    });
    return column([
      w.title(t("Dividing a segment in a ratio", "रेखाखंड को एक अनुपात में बाँटना")),
      w.definition(
        t(
          "**Internal division.** A point P on the segment AB **divides AB internally in the ratio m₁ : m₂** when AP : PB = m₁ : m₂. Cut AB into m₁ + m₂ equal parts: P is m₁ parts from A and m₂ parts from B.",
          "**अंतः विभाजन।** रेखाखंड AB पर बिंदु P, **AB को m₁ : m₂ के अनुपात में अंतः विभाजित करता है** जब AP : PB = m₁ : m₂। AB को m₁ + m₂ बराबर भागों में काटो: P, A से m₁ भाग और B से m₂ भाग दूर है।",
        ),
      ),
      w.body(
        t(
          "Drag P along the segment (it settles on a simple ratio), or use the m₁ and m₂ buttons.",
          "P को रेखाखंड पर खिसकाओ (यह किसी सरल अनुपात पर रुकता है), या m₁ और m₂ के बटन दबाओ।",
        ),
      ),
      seg,
      goal,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** NCERT's relay tower: P divides OB in 1 : 2 by similar triangles. */
const tower = page(
  "tower",
  (b) => {
    const w = wordsOn(b);
    const seg = dividerOn(
      b,
      "segment",
      {
        a: [0, 0],
        b: [36, 15],
        names: ["O", "B", "P"],
        m: 1,
        n: 2,
        canRatio: false,
        window: [-2, 38, -2, 17],
        showSimilar: true,
        showWorking: false,
      },
      "the segment from O(0, 0) to B(36, 15) with P(12, 5) a third of the way along; two right triangles are drawn, the small one under OP and the big one under PB, with level and upright sides",
    );
    const why = choiceQuestion(b, {
      prompt: t(
        "Why are the small triangle under OP and the big one under PB similar?",
        "OP के नीचे का छोटा त्रिभुज और PB के नीचे का बड़ा त्रिभुज समरूप क्यों हैं?",
      ),
      options: [
        { id: "right", label: t("AA: two pairs of equal angles", "AA: कोणों के दो बराबर जोड़े") },
        {
          id: "sss",
          label: t("SSS: all sides in proportion", "SSS: सब भुजाएँ समानुपाती"),
          feedback: t(
            "We don't know the sides yet; that's what we're finding. We know angles: both have a right angle, and the slope makes the angles at O and P equal.",
            "भुजाएँ तो अभी हम ढूँढ रहे हैं। हमें कोण पता हैं: दोनों में समकोण है, और ढलान से O और P पर के कोण बराबर हैं।",
          ),
        },
        {
          id: "rhs",
          label: t("RHS: right angle, hypotenuse, side", "RHS: समकोण, कर्ण, भुजा"),
          feedback: t(
            "RHS is for congruent triangles, which are the same size. These are different sizes; they share their angles: AA.",
            "RHS सर्वांगसम त्रिभुजों के लिए है, जो बराबर आकार के होते हैं। ये अलग आकार के हैं; इनके कोण बराबर हैं: AA।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("The relay tower", "रिले टावर")),
      w.body(
        t(
          "NCERT's version of Kabir's puzzle: a phone company wants a relay tower P on the line between towns O(0, 0) and B(36, 15), twice as far from B as from O. So OP : PB = 1 : 2. Let P be (x, y).",
          "कबीर की पहेली का NCERT वाला रूप: एक फ़ोन कंपनी शहरों O(0, 0) और B(36, 15) के बीच की रेखा पर एक रिले टावर P चाहती है, जो O की तुलना में B से दोगुना दूर हो। तो OP : PB = 1 : 2। मान लो P (x, y) है।",
        ),
      ),
      seg,
      w.body(
        t(
          "The small right triangle under OP and the big one under PB are similar (AA, Chapter 6), so their sides are in the ratio OP : PB = 1 : 2:",
          "OP के नीचे का छोटा समकोण त्रिभुज और PB के नीचे का बड़ा समरूप हैं (AA, अध्याय 6), तो उनकी भुजाएँ OP : PB = 1 : 2 के अनुपात में हैं:",
        ),
      ),
      w.body(
        t(
          r`$$\frac{x}{36 - x} = \frac{1}{2} \quad\text{so}\quad 2x = 36 - x, \quad x = 12$$ $$\frac{y}{15 - y} = \frac{1}{2} \quad\text{so}\quad 2y = 15 - y, \quad y = 5$$`,
          r`$$\frac{x}{36 - x} = \frac{1}{2} \quad\text{तो}\quad 2x = 36 - x, \quad x = 12$$ $$\frac{y}{15 - y} = \frac{1}{2} \quad\text{तो}\quad 2y = 15 - y, \quad y = 5$$`,
        ),
      ),
      why,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The general section formula. */
const derive = page(
  "derive",
  (b) => {
    const w = wordsOn(b);
    const seg = dividerOn(
      b,
      "segment",
      {
        a: [1, 1],
        b: [10, 7],
        m: 2,
        n: 1,
        canRatio: false,
        showCoords: false,
        window: [-1, 11, -1, 8],
        showSimilar: true,
        showWorking: false,
      },
      "a segment from A to B with P two-thirds of the way along; the right triangle AQP has AQ level and QP upright, and the right triangle PCB has PC level and CB upright",
    );
    const which = choiceQuestion(b, {
      prompt: t(
        "In x = (m₁x₂ + m₂x₁)/(m₁ + m₂), which number multiplies x₂, the coordinate of B?",
        "x = (m₁x₂ + m₂x₁)/(m₁ + m₂) में x₂ (B का निर्देशांक) को कौन गुणा करता है?",
      ),
      options: [
        { id: "right", label: t("m₁ (the part AP)", "m₁ (भाग AP)") },
        {
          id: "m2",
          label: t("m₂ (the part PB)", "m₂ (भाग PB)"),
          feedback: t(
            "It's crossed over: m₁ goes with x₂ and m₂ with x₁. A big m₁ means P is far from A, so close to B, and B's coordinate counts more.",
            "यह उलटा जुड़ता है: m₁ के साथ x₂ और m₂ के साथ x₁। बड़ा m₁ मतलब P, A से दूर, यानी B के पास, तो B का निर्देशांक ज़्यादा गिना जाता है।",
          ),
        },
        {
          id: "sum",
          label: t("m₁ + m₂, the total", "m₁ + m₂, कुल"),
          feedback: t(
            "m₁ + m₂ is what we divide by. On top, x₂ is multiplied by m₁.",
            "m₁ + m₂ से हम भाग देते हैं। ऊपर, x₂ को m₁ से गुणा किया जाता है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("The section formula", "विभाजन सूत्र")),
      w.body(
        t(
          "Now any A(x₁, y₁) and B(x₂, y₂), and P(x, y) dividing AB internally in m₁ : m₂. Draw AQ level with A and PC level with P, meeting the uprights through P and B at Q and C. By AA, ∆PAQ ~ ∆BPC, so",
          "अब कोई भी A(x₁, y₁) और B(x₂, y₂), और AB को m₁ : m₂ में अंतः विभाजित करता P(x, y)। A के बराबर ऊँचाई पर AQ और P के बराबर ऊँचाई पर PC खींचो, जो P और B से जाने वाली खड़ी रेखाओं से Q और C पर मिलें। AA से ∆PAQ ~ ∆BPC, तो",
        ),
      ),
      seg,
      w.body(
        t(
          r`$$\frac{PA}{BP} = \frac{AQ}{PC} = \frac{PQ}{BC}$$ $$AQ = x - x_1, \quad PC = x_2 - x$$ $$PQ = y - y_1, \quad BC = y_2 - y$$ $$\frac{m_1}{m_2} = \frac{x - x_1}{x_2 - x}$$ $$m_1 x_2 - m_1 x = m_2 x - m_2 x_1$$ $$x = \frac{m_1 x_2 + m_2 x_1}{m_1 + m_2}$$`,
          r`$$\frac{PA}{BP} = \frac{AQ}{PC} = \frac{PQ}{BC}$$ $$AQ = x - x_1, \quad PC = x_2 - x$$ $$PQ = y - y_1, \quad BC = y_2 - y$$ $$\frac{m_1}{m_2} = \frac{x - x_1}{x_2 - x}$$ $$m_1 x_2 - m_1 x = m_2 x - m_2 x_1$$ $$x = \frac{m_1 x_2 + m_2 x_1}{m_1 + m_2}$$`,
        ),
      ),
      w.body(
        t(
          "Taking PA/BP = PQ/BC instead gives y in the same way.",
          "PA/BP = PQ/BC लेने से इसी तरह y मिलता है।",
        ),
      ),
      w.definition(
        t(
          r`**Section formula.** The point dividing the join of A(x₁, y₁) and B(x₂, y₂) internally in the ratio m₁ : m₂ is $$\left(\frac{m_1 x_2 + m_2 x_1}{m_1 + m_2}, \frac{m_1 y_2 + m_2 y_1}{m_1 + m_2}\right)$$`,
          r`**विभाजन सूत्र।** A(x₁, y₁) और B(x₂, y₂) को मिलाने वाले रेखाखंड को m₁ : m₂ के अनुपात में अंतः विभाजित करने वाला बिंदु है $$\left(\frac{m_1 x_2 + m_2 x_1}{m_1 + m_2}, \frac{m_1 y_2 + m_2 y_1}{m_1 + m_2}\right)$$`,
        ),
      ),
      which,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** k : 1 and the mid-point. */
const midpoint = page(
  "midpoint",
  (b) => {
    const w = wordsOn(b);
    const seg = dividerOn(
      b,
      "segment",
      {
        a: [-4, 1],
        b: [6, 5],
        m: 1,
        n: 3,
        window: [-6, 8, -1, 7],
      },
      "a segment from A(−4, 1) to B(6, 5) with P that the learner moves; the working of P's coordinates by the section formula updates with the ratio",
    );
    const goal = goalQuestion(b, {
      about: seg,
      prompt: t("Move P to the mid-point of AB.", "P को AB के मध्य-बिंदु पर ले जाओ।"),
      isMet: seg.derived(SectionDerived.IsMidpoint).eq(true),
      solve: [seg.learner(SectionAction.SetAlong, { t: 0.5 })],
    });
    const check = w.body(
      t(
        r`At 1 : 1 the formula gives $$\left(\frac{-4 + 6}{2}, \frac{1 + 5}{2}\right) = (1, 3)$$ the average of the x's and the average of the y's.`,
        r`1 : 1 पर सूत्र देता है $$\left(\frac{-4 + 6}{2}, \frac{1 + 5}{2}\right) = (1, 3)$$ x का औसत और y का औसत।`,
      ),
      "check",
      { isHidden: true },
    );
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(check));
    return column([
      w.title(t("The mid-point", "मध्य-बिंदु")),
      w.body(
        t(
          r`If the ratio is k : 1, put m₁ = k and m₂ = 1: $$P = \left(\frac{k x_2 + x_1}{k + 1}, \frac{k y_2 + y_1}{k + 1}\right)$$`,
          r`यदि अनुपात k : 1 है, तो m₁ = k और m₂ = 1 रखो: $$P = \left(\frac{k x_2 + x_1}{k + 1}, \frac{k y_2 + y_1}{k + 1}\right)$$`,
        ),
      ),
      w.definition(
        t(
          r`**Mid-point.** The mid-point divides a segment in the ratio 1 : 1. So the mid-point of the join of (x₁, y₁) and (x₂, y₂) is $$\left(\frac{x_1 + x_2}{2}, \frac{y_1 + y_2}{2}\right)$$`,
          r`**मध्य-बिंदु।** मध्य-बिंदु रेखाखंड को 1 : 1 के अनुपात में बाँटता है। तो (x₁, y₁) और (x₂, y₂) को मिलाने वाले रेखाखंड का मध्य-बिंदु है $$\left(\frac{x_1 + x_2}{2}, \frac{y_1 + y_2}{2}\right)$$`,
        ),
      ),
      seg,
      goal,
      check,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Example 6 worked; Exercise 7.2 Q1 to try. */
const example6 = page(
  "example-6",
  (b) => {
    const w = wordsOn(b);
    const seg = dividerOn(
      b,
      "segment",
      {
        a: [4, -3],
        b: [8, 5],
        m: 3,
        n: 1,
        canRatio: false,
        window: [2, 10, -5, 7],
      },
      "the segment from A(4, −3) to B(8, 5) with P(7, 3) three-quarters of the way along, and the section formula worked out for 3 : 1",
    );
    const q1 = choiceQuestion(b, {
      prompt: t(
        "Exercise 7.2 Q1: find the point dividing the join of (−1, 7) and (4, −3) in the ratio 2 : 3.",
        "प्रश्नावली 7.2 प्र1: (−1, 7) और (4, −3) को मिलाने वाले रेखाखंड को 2 : 3 में बाँटने वाला बिंदु ज्ञात करो।",
      ),
      options: [
        { id: "right", label: t("(1, 3)", "(1, 3)") },
        {
          id: "swap",
          label: t("(2, 1)", "(2, 1)"),
          feedback: t(
            "You used 3 : 2. Cross over: 2 multiplies the second point's coordinates, x = (2 × 4 + 3 × (−1))/5.",
            "तुमने 3 : 2 लिया। उलटा जोड़ो: 2 दूसरे बिंदु के निर्देशांकों से गुणा होता है, x = (2 × 4 + 3 × (−1))/5।",
          ),
        },
        {
          id: "mid",
          label: t("(1.5, 2)", "(1.5, 2)"),
          feedback: t(
            "That's the mid-point, ratio 1 : 1. Use 2 : 3 in the section formula.",
            "यह मध्य-बिंदु है, अनुपात 1 : 1। विभाजन सूत्र में 2 : 3 लो।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Example 6", "उदाहरण 6")),
      w.body(
        t(
          "Find the point dividing the join of (4, −3) and (8, 5) internally in the ratio 3 : 1. With m₁ = 3, m₂ = 1:",
          "(4, −3) और (8, 5) को मिलाने वाले रेखाखंड को 3 : 1 में अंतः विभाजित करने वाला बिंदु ज्ञात करो। m₁ = 3, m₂ = 1 से:",
        ),
      ),
      seg,
      w.body(t("So the point is (7, 3).", "तो बिंदु (7, 3) है।")),
      q1,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** Kabir's clue at (12, 5). */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const seg = dividerOn(
      b,
      "path",
      {
        a: [0, 0],
        b: [36, 15],
        names: ["O", "B", "P"],
        m: 1,
        n: 1,
        window: [-2, 38, -2, 17],
        showParts: true,
      },
      "the park map: the straight path from the gate O(0, 0) to the banyan B(36, 15), with the clue P that the learner moves along it; the path is marked in equal parts and P's coordinates are worked out",
    );
    const goal = goalQuestion(b, {
      about: seg,
      prompt: t(
        "Put Kabir's clue P where it is twice as far from the banyan as from the gate.",
        "कबीर के सुराग P को वहाँ रखो जहाँ वह गेट की तुलना में बरगद से दोगुना दूर हो।",
      ),
      isMet: seg.derived(SectionDerived.M).eq(1).and(seg.derived(SectionDerived.N).eq(2)),
      solve: [seg.learner(SectionAction.SetAlong, { t: 1 / 3 })],
      notes: [
        {
          when: seg.derived(SectionDerived.M).eq(2).and(seg.derived(SectionDerived.N).eq(1)),
          say: t(
            "Now P is twice as far from the gate. The clue should be nearer the gate: OP : PB = 1 : 2.",
            "अब P गेट से दोगुना दूर है। सुराग गेट के पास होना चाहिए: OP : PB = 1 : 2।",
          ),
          reach: [seg.learner(SectionAction.SetAlong, { t: 2 / 3 })],
        },
      ],
    });
    const answer = w.body(
      t(
        "The clue goes at **(12, 5)**: 12 m along the wall and 5 m up. Kabir checks with the distance formula: OP = 13 m and PB = 26 m, exactly twice.",
        "सुराग **(12, 5)** पर जाएगा: दीवार के साथ 12 m और 5 m ऊपर। कबीर दूरी सूत्र से जाँचता है: OP = 13 m और PB = 26 m, ठीक दोगुना।",
      ),
      "answer",
      { isHidden: true },
    );
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(answer));
    return column([w.title(t("Kabir's clue", "कबीर का सुराग")), seg, goal, answer, space()]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const q1 = choiceQuestion(b, {
      name: "q1",
      prompt: t(
        "Find the mid-point of the join of (−2, 4) and (6, −8).",
        "(−2, 4) और (6, −8) को मिलाने वाले रेखाखंड का मध्य-बिंदु ज्ञात करो।",
      ),
      options: [
        { id: "right", label: t("(2, −2)", "(2, −2)") },
        {
          id: "diff",
          label: t("(4, −6)", "(4, −6)"),
          feedback: t(
            "That's half the differences. The mid-point averages: (−2 + 6)/2 and (4 − 8)/2.",
            "यह अंतरों का आधा है। मध्य-बिंदु औसत लेता है: (−2 + 6)/2 और (4 − 8)/2।",
          ),
        },
        {
          id: "sum",
          label: t("(4, −4)", "(4, −4)"),
          feedback: t(
            "You added but didn't halve. Divide each sum by 2.",
            "तुमने जोड़ा पर आधा नहीं किया। हर योग को 2 से भाग दो।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const q2 = choiceQuestion(b, {
      name: "q2",
      prompt: t(
        "P divides the join of A(1, 2) and B(7, 11) in the ratio 2 : 1. Find P.",
        "P, A(1, 2) और B(7, 11) को मिलाने वाले रेखाखंड को 2 : 1 में बाँटता है। P ज्ञात करो।",
      ),
      options: [
        { id: "right", label: t("(5, 8)", "(5, 8)") },
        {
          id: "swap",
          label: t("(3, 5)", "(3, 5)"),
          feedback: t(
            "That's 1 : 2, nearer A. With AP : PB = 2 : 1, P is nearer B: x = (2 × 7 + 1 × 1)/3.",
            "यह 1 : 2 है, A के पास। AP : PB = 2 : 1 पर P, B के पास है: x = (2 × 7 + 1 × 1)/3।",
          ),
        },
        {
          id: "mid",
          label: t("(4, 6.5)", "(4, 6.5)"),
          feedback: t("That's the mid-point. Use 2 : 1.", "यह मध्य-बिंदु है। 2 : 1 लो।"),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ Stop 4: the section formula finds a point any ratio of the way along a path. Kabir's clue is at (12, 5). Next: run it backwards, to find a ratio or a missing corner.",
        "**मिशन लॉग।** ✓ पड़ाव 4: विभाजन सूत्र रास्ते पर किसी भी अनुपात वाला बिंदु ढूँढता है। कबीर का सुराग (12, 5) पर है। आगे: इसे उलटा चलाना, अनुपात या छूटा कोना ढूँढने के लिए।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(q2.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), q1, q2, log, space()]);
  },
  { passOn: PassOn.Rules },
);

export const overview = [hook, ratio, tower, derive, midpoint, example6, inLife, yourTurn];

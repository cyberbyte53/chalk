import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, goalQuestion, wordsOn } from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import { CoordinatesSceneKind, SectionAction, SectionDerived } from "@chalk/prop-coordinates";
import { areaOn, dividerOn, sceneOn } from "../kit";

const r = String.raw;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** Grandpa's bonus riddle. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const map = sceneOn(
    b,
    "map",
    CoordinatesSceneKind.ParkMap,
    "Grandpa's graph-paper map of the park on the table, with Riya and Kabir leaning in",
  );
  return column([
    w.title(t("Grandpa's riddle", "दादाजी की पहेली")),
    map,
    w.body(
      t(
        'Every clue is placed and Mom\'s patch is mulched. On Saturday night Grandpa adds a bonus for the older kids. He buries a second, smaller box and writes one riddle: "Three rose bushes stand at A(4, 2), B(6, 5) and C(1, 4). Dig where the three medians of ∆ABC meet."',
        'हर सुराग रख दिया गया है और मम्मी की क्यारी में खाद पड़ गई है। शनिवार रात दादाजी बड़े बच्चों के लिए एक बोनस जोड़ते हैं। वे एक दूसरा, छोटा डिब्बा गाड़ते हैं और एक पहेली लिखते हैं: "तीन गुलाब की झाड़ियाँ A(4, 2), B(6, 5) और C(1, 4) पर हैं। वहाँ खोदो जहाँ ∆ABC की तीनों माध्यिकाएँ मिलती हैं।"',
      ),
    ),
    w.body(
      t(
        "A **median** joins a vertex to the mid-point of the opposite side. This lesson is the textbook's optional Exercise 7.4: harder problems that mix everything so far. Where should the kids dig?",
        "**माध्यिका** एक शीर्ष को सामने की भुजा के मध्य-बिंदु से मिलाती है। यह पाठ पाठ्यपुस्तक की वैकल्पिक प्रश्नावली 7.4 है: कठिन प्रश्न जो अब तक का सब कुछ मिलाते हैं। बच्चों को कहाँ खोदना चाहिए?",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Ex 7.4 Q7: the centroid divides each median 2 : 1. */
const centroid = page(
  "centroid",
  (b) => {
    const w = wordsOn(b);
    const seg = dividerOn(
      b,
      "median",
      {
        a: [4, 2],
        b: [3.5, 4.5],
        names: ["A", "D", "P"],
        m: 1,
        n: 1,
        maxParts: 4,
        window: [2, 6, 1, 6],
      },
      "the median AD from A(4, 2) to D(7/2, 9/2), the mid-point of BC, with the point P on it that the learner moves; the ratio AP : PD and P's coordinates are shown",
    );
    const goal = goalQuestion(b, {
      about: seg,
      prompt: t("Move P so that AP : PD = 2 : 1.", "P को ऐसे खिसकाओ कि AP : PD = 2 : 1 हो।"),
      isMet: seg.derived(SectionDerived.M).eq(2).and(seg.derived(SectionDerived.N).eq(1)),
      solve: [seg.learner(SectionAction.SetAlong, { t: 2 / 3 })],
    });
    const rule = w.definition(
      t(
        r`P is (11/3, 11/3). Do the same on the medians from B and C and you land on the same point. **Centroid.** The three medians of a triangle meet at one point, the **centroid**, which divides each median in the ratio 2 : 1. For vertices (x₁, y₁), (x₂, y₂), (x₃, y₃) it is $$\left(\frac{x_1 + x_2 + x_3}{3}, \frac{y_1 + y_2 + y_3}{3}\right)$$`,
        r`P (11/3, 11/3) है। B और C से माध्यिकाओं पर यही करो तो उसी बिंदु पर पहुँचते हो। **केन्द्रक।** त्रिभुज की तीनों माध्यिकाएँ एक बिंदु पर मिलती हैं, **केन्द्रक**, जो हर माध्यिका को 2 : 1 में बाँटता है। शीर्ष (x₁, y₁), (x₂, y₂), (x₃, y₃) के लिए यह है $$\left(\frac{x_1 + x_2 + x_3}{3}, \frac{y_1 + y_2 + y_3}{3}\right)$$`,
      ),
      "rule",
      { isHidden: true },
    );
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(rule));
    return column([
      w.title(t("Where the medians meet", "जहाँ माध्यिकाएँ मिलती हैं")),
      w.body(
        t(
          r`Exercise 7.4 Q7. The median from A meets BC at its mid-point $$D = \left(\frac{6 + 1}{2}, \frac{5 + 4}{2}\right) = \left(\frac{7}{2}, \frac{9}{2}\right)$$ Now find the point P on AD with AP : PD = 2 : 1.`,
          r`प्रश्नावली 7.4 प्र7। A से माध्यिका BC को उसके मध्य-बिंदु पर मिलती है $$D = \left(\frac{6 + 1}{2}, \frac{5 + 4}{2}\right) = \left(\frac{7}{2}, \frac{9}{2}\right)$$ अब AD पर वह बिंदु P ज्ञात करो जिसमें AP : PD = 2 : 1 हो।`,
        ),
      ),
      seg,
      goal,
      rule,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Ex 7.4 Q1 and Q2: a line dividing a segment; collinear relation. */
const lineDivides = page(
  "line-divides",
  (b) => {
    const w = wordsOn(b);
    const q2 = choiceQuestion(b, {
      prompt: t(
        "Exercise 7.4 Q2: find a relation between x and y if (x, y), (1, 2) and (7, 0) are collinear.",
        "प्रश्नावली 7.4 प्र2: x और y में संबंध ज्ञात करो यदि (x, y), (1, 2) और (7, 0) संरेख हैं।",
      ),
      options: [
        { id: "right", label: t("x + 3y = 7", "x + 3y = 7") },
        {
          id: "swap",
          label: t("3x + y = 7", "3x + y = 7"),
          feedback: t(
            "Set the area to 0: x(2 − 0) + 1(0 − y) + 7(y − 2) = 2x + 6y − 14 = 0. Divide by 2.",
            "क्षेत्रफल 0 रखो: x(2 − 0) + 1(0 − y) + 7(y − 2) = 2x + 6y − 14 = 0। 2 से भाग दो।",
          ),
        },
        {
          id: "sign",
          label: t("x − 3y = 7", "x − 3y = 7"),
          feedback: t("Collect the y-terms: −y + 7y = +6y.", "y वाले पद इकट्ठे करो: −y + 7y = +6y।"),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("A line that cuts a segment", "रेखाखंड को काटती रेखा")),
      w.body(
        t(
          "Exercise 7.4 Q1: in what ratio does the line 2x + y − 4 = 0 divide the join of A(2, −2) and B(3, 7)? Let the ratio be k : 1. The point of division is",
          "प्रश्नावली 7.4 प्र1: रेखा 2x + y − 4 = 0, A(2, −2) और B(3, 7) को मिलाने वाले रेखाखंड को किस अनुपात में बाँटती है? अनुपात k : 1 मानो। विभाजन बिंदु है",
        ),
      ),
      w.body(
        t(
          r`$$\left(\frac{3k + 2}{k + 1}, \frac{7k - 2}{k + 1}\right)$$`,
          r`$$\left(\frac{3k + 2}{k + 1}, \frac{7k - 2}{k + 1}\right)$$`,
        ),
      ),
      w.body(
        t(
          "It lies on the line, so it satisfies 2x + y − 4 = 0. Multiply through by k + 1:",
          "यह रेखा पर है, तो 2x + y − 4 = 0 को संतुष्ट करता है। पूरे को k + 1 से गुणा करो:",
        ),
      ),
      w.body(
        t(
          r`$$2(3k + 2) + (7k - 2) - 4(k + 1) = 0$$ $$9k - 2 = 0$$ $$k = \frac{2}{9}$$`,
          r`$$2(3k + 2) + (7k - 2) - 4(k + 1) = 0$$ $$9k - 2 = 0$$ $$k = \frac{2}{9}$$`,
        ),
      ),
      w.body(t("So the ratio is 2 : 9.", "तो अनुपात 2 : 9 है।")),
      q2,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Ex 7.4 Q3 and Q4: the centre of a circle; a square's other corners. */
const centreAndSquare = page(
  "centre-and-square",
  (b) => {
    const w = wordsOn(b);
    const q4 = choiceQuestion(b, {
      prompt: t(
        "Exercise 7.4 Q4: two opposite vertices of a square are (−1, 2) and (3, 2). Find the other two.",
        "प्रश्नावली 7.4 प्र4: एक वर्ग के दो सम्मुख शीर्ष (−1, 2) और (3, 2) हैं। बाक़ी दो ज्ञात करो।",
      ),
      options: [
        { id: "right", label: t("(1, 0) and (1, 4)", "(1, 0) और (1, 4)") },
        {
          id: "side",
          label: t("(−1, 6) and (3, 6)", "(−1, 6) और (3, 6)"),
          feedback: t(
            "That treats the given points as neighbours, a side of length 4. They're opposite, so they form a diagonal.",
            "यह दिए गए बिंदुओं को पड़ोसी, यानी 4 लंबी भुजा, मानता है। वे सम्मुख हैं, तो विकर्ण बनाते हैं।",
          ),
        },
        {
          id: "near",
          label: t("(1, 1) and (1, 3)", "(1, 1) और (1, 3)"),
          feedback: t(
            "The diagonals of a square are equal and bisect each other: the other diagonal is 4 long too, so its ends are 2 from the centre (1, 2).",
            "वर्ग के विकर्ण बराबर होते हैं और एक-दूसरे को समद्विभाजित करते हैं: दूसरा विकर्ण भी 4 लंबा है, तो उसके सिरे केंद्र (1, 2) से 2 दूर हैं।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("A centre and a square", "एक केंद्र और एक वर्ग")),
      w.body(
        t(
          "Exercise 7.4 Q3: find the centre of the circle through (6, −6), (3, −7) and (3, 3). The centre O(x, y) is the same distance from all three. O is the same distance from (3, −7) and (3, 3), so it lies on their perpendicular bisector. They're one above the other, so that bisector is the level line through their mid-point (3, −2): y = −2. Then, from (6, −6) and (3, 3),",
          "प्रश्नावली 7.4 प्र3: (6, −6), (3, −7) और (3, 3) से जाने वाले वृत्त का केंद्र ज्ञात करो। केंद्र O(x, y) तीनों से बराबर दूर है। O, (3, −7) और (3, 3) से बराबर दूर है, तो वह उनके लंब समद्विभाजक पर है। वे एक के ऊपर एक हैं, तो वह समद्विभाजक उनके मध्य-बिंदु (3, −2) से जाने वाली क्षैतिज रेखा है: y = −2। फिर (6, −6) और (3, 3) से,",
        ),
      ),
      w.body(
        t(
          r`$$(x - 6)^2 + (-2 + 6)^2 = (x - 3)^2 + (-2 - 3)^2$$ $$x^2 - 12x + 52 = x^2 - 6x + 34$$ $$-6x = -18$$ $$x = 3$$`,
          r`$$(x - 6)^2 + (-2 + 6)^2 = (x - 3)^2 + (-2 - 3)^2$$ $$x^2 - 12x + 52 = x^2 - 6x + 34$$ $$-6x = -18$$ $$x = 3$$`,
        ),
      ),
      w.body(t("The centre is (3, −2), and the radius is 5.", "केंद्र (3, −2) है, और त्रिज्या 5।")),
      q4,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Ex 7.4 Q5 (Krishinagar), Q6 and Q8. */
const moreAreas = page(
  "more-areas",
  (b) => {
    const w = wordsOn(b);
    const lawn = areaOn(
      b,
      "lawn",
      {
        points: [
          { name: "P", x: 4, y: 6 },
          { name: "Q", x: 3, y: 2 },
          { name: "R", x: 6, y: 5 },
        ],
        window: [-1, 8, -1, 8],
      },
      "the Krishinagar lawn PQR with the corner A of the plot as the origin: P(4, 6), Q(3, 2), R(6, 5), and its area worked out as 9/2 square units",
    );
    const same = choiceQuestion(b, {
      name: "same",
      prompt: t(
        "Exercise 7.4 Q5: with corner C of the plot as the origin instead, the lawn's corners are P(12, 2), Q(13, 6), R(10, 3). Its area is now…",
        "प्रश्नावली 7.4 प्र5: प्लॉट के कोने C को मूलबिंदु लें, तो लॉन के कोने P(12, 2), Q(13, 6), R(10, 3) हैं। अब उसका क्षेत्रफल है…",
      ),
      options: [
        {
          id: "right",
          label: t("9/2 again: the origin doesn't matter", "फिर 9/2: मूलबिंदु से फ़र्क़ नहीं"),
        },
        {
          id: "bigger",
          label: t("Bigger, since the numbers are bigger", "बड़ा, क्योंकि संख्याएँ बड़ी हैं"),
          feedback: t(
            "Work it out: ½|12(6 − 3) + 13(3 − 2) + 10(2 − 6)| = ½|36 + 13 − 40| = 9/2. Moving the origin moves every corner the same way; the lawn itself doesn't change.",
            "निकालो: ½|12(6 − 3) + 13(3 − 2) + 10(2 − 6)| = ½|36 + 13 − 40| = 9/2। मूलबिंदु बदलने से हर कोना एक जैसा खिसकता है; लॉन ख़ुद नहीं बदलता।",
          ),
        },
        {
          id: "flip",
          label: t("−9/2, since it's seen from the other side", "−9/2, क्योंकि दूसरी ओर से देखा"),
          feedback: t(
            "An area is never negative. Work it out: it comes to 9/2, the same as before.",
            "क्षेत्रफल कभी ऋणात्मक नहीं होता। निकालो: यह 9/2 आता है, पहले जितना।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const q6 = choiceQuestion(b, {
      name: "q6",
      prompt: t(
        "Exercise 7.4 Q6: A(4, 6), B(1, 5), C(7, 2). D on AB and E on AC with AD/AB = AE/AC = 1/4. How does the area of ∆ADE compare with ∆ABC?",
        "प्रश्नावली 7.4 प्र6: A(4, 6), B(1, 5), C(7, 2)। AB पर D और AC पर E, जिनमें AD/AB = AE/AC = 1/4। ∆ADE का क्षेत्रफल ∆ABC से कैसा है?",
      ),
      options: [
        { id: "right", label: t("1 : 16 (15/32 and 15/2)", "1 : 16 (15/32 और 15/2)") },
        {
          id: "quarter",
          label: t("1 : 4 (15/8 and 15/2)", "1 : 4 (15/8 और 15/2)"),
          feedback: t(
            "DE ∥ BC, so the triangles are similar with sides in the ratio 1 : 4, and areas go by the square of that (Chapter 6): 1 : 16.",
            "DE ∥ BC, तो त्रिभुज समरूप हैं और भुजाएँ 1 : 4 में हैं, और क्षेत्रफल उसके वर्ग से चलते हैं (अध्याय 6): 1 : 16।",
          ),
        },
        {
          id: "half",
          label: t("1 : 8 (15/16 and 15/2)", "1 : 8 (15/16 और 15/2)"),
          feedback: t(
            "Find D(13/4, 23/4) and E(19/4, 5) by the section formula (1 : 3), then the area: 15/32. That's 1/16 of 15/2.",
            "विभाजन सूत्र (1 : 3) से D(13/4, 23/4) और E(19/4, 5) निकालो, फिर क्षेत्रफल: 15/32। यह 15/2 का 1/16 है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(
        t("Areas that don't move, and areas that shrink", "जो क्षेत्रफल नहीं बदलते, और जो सिकुड़ते हैं"),
      ),
      w.body(
        t(
          "Exercise 7.4 Q5: Class X of a school in Krishinagar has a rectangular garden plot with a triangular lawn PQR in it. Taking the plot's corner A as the origin:",
          "प्रश्नावली 7.4 प्र5: कृषिनगर के एक स्कूल की कक्षा X के पास एक आयताकार बगीचे का प्लॉट है जिसमें एक त्रिभुजाकार लॉन PQR है। प्लॉट के कोने A को मूलबिंदु मानकर:",
        ),
      ),
      lawn,
      same,
      q6,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Ex 7.4 Q8: the mid-points of a rectangle make a rhombus. */
const rectangleMidpoints = page(
  "rectangle-midpoints",
  (b) => {
    const w = wordsOn(b);
    const q8 = choiceQuestion(b, {
      prompt: t(
        "Exercise 7.4 Q8: ABCD is the rectangle A(−1, −1), B(−1, 4), C(5, 4), D(5, −1). P, Q, R, S are the mid-points of AB, BC, CD, DA. PQRS is…",
        "प्रश्नावली 7.4 प्र8: ABCD आयत A(−1, −1), B(−1, 4), C(5, 4), D(5, −1) है। P, Q, R, S क्रमशः AB, BC, CD, DA के मध्य-बिंदु हैं। PQRS है…",
      ),
      options: [
        { id: "right", label: t("a rhombus", "एक समचतुर्भुज") },
        {
          id: "square",
          label: t("a square", "एक वर्ग"),
          feedback: t(
            "All four sides are √61/2, but the diagonals PR = 6 and QS = 5 are unequal, so it's not a square.",
            "चारों भुजाएँ √61/2 हैं, पर विकर्ण PR = 6 और QS = 5 बराबर नहीं, तो यह वर्ग नहीं।",
          ),
        },
        {
          id: "rect",
          label: t("a rectangle", "एक आयत"),
          feedback: t(
            "A rectangle needs equal diagonals; here they're 6 and 5. The four equal sides make it a rhombus.",
            "आयत के विकर्ण बराबर होते हैं; यहाँ वे 6 और 5 हैं। चार बराबर भुजाएँ इसे समचतुर्भुज बनाती हैं।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("The rectangle's mid-points", "आयत के मध्य-बिंदु")),
      w.body(
        t(
          "By the mid-point formula, P(−1, 3/2), Q(2, 4), R(5, 3/2) and S(2, −1). By the distance formula each side of PQRS is √(9 + 25/4) = √61/2, while the diagonals are PR = 6 and QS = 5.",
          "मध्य-बिंदु सूत्र से P(−1, 3/2), Q(2, 4), R(5, 3/2) और S(2, −1)। दूरी सूत्र से PQRS की हर भुजा √(9 + 25/4) = √61/2 है, जबकि विकर्ण PR = 6 और QS = 5 हैं।",
        ),
      ),
      q8,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** The bonus is at the centroid of the rose bushes. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const dig = choiceQuestion(b, {
      prompt: t(
        "Grandpa's riddle: dig where the medians of ∆ABC meet, with A(4, 2), B(6, 5), C(1, 4). Where?",
        "दादाजी की पहेली: वहाँ खोदो जहाँ ∆ABC की माध्यिकाएँ मिलती हैं, जहाँ A(4, 2), B(6, 5), C(1, 4)। कहाँ?",
      ),
      options: [
        { id: "right", label: t("(11/3, 11/3)", "(11/3, 11/3)") },
        {
          id: "sum",
          label: t("(11, 11)", "(11, 11)"),
          feedback: t(
            "You added the coordinates; now divide by 3, because there are three vertices.",
            "तुमने निर्देशांक जोड़े; अब 3 से भाग दो, क्योंकि तीन शीर्ष हैं।",
          ),
        },
        {
          id: "mid",
          label: t("(7/2, 9/2)", "(7/2, 9/2)"),
          feedback: t(
            "That's D, the mid-point of BC: where the median from A ends. The medians meet two-thirds of the way from A to D.",
            "यह D है, BC का मध्य-बिंदु: जहाँ A से माध्यिका ख़त्म होती है। माध्यिकाएँ A से D तक दो-तिहाई पर मिलती हैं।",
          ),
        },
      ],
      answer: "right",
    });
    const found = w.body(
      t(
        "About 3.7 m along and 3.7 m up from the gate. Riya ties a ribbon to the spot so the older kids know where to dig.",
        "गेट से लगभग 3.7 m आगे और 3.7 m ऊपर। रिया उस जगह पर एक रिबन बाँधती है ताकि बड़े बच्चों को पता चले कि कहाँ खोदना है।",
      ),
      "found",
      { isHidden: true },
    );
    b.when(dig.on(QuestionSignal.Correct), [theBoard.show(found), theBoard.pass()]);
    return column([w.title(t("Where to dig", "कहाँ खोदें")), dig, found, space()]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Finale                                                               */
/* ------------------------------------------------------------------ */

/** Hunt day, and the chapter's mission log. */
const finale = page(
  "finale",
  (b) => {
    const w = wordsOn(b);
    const day = sceneOn(
      b,
      "day",
      CoordinatesSceneKind.HuntDay,
      "Sunday, hunt day: little kids with clue cards run across the park, a treasure box is dug up, Riya and Kabir grin, and Mom and Grandpa clap",
    );
    const recap = choiceQuestion(b, {
      prompt: t(
        "Last check: which tool tells you whether three clue stones are in a straight line?",
        "आख़िरी जाँच: कौन-सा तरीक़ा बताता है कि तीन सुराग-पत्थर एक सीधी रेखा में हैं?",
      ),
      options: [
        { id: "right", label: t("Area of the triangle = 0", "त्रिभुज का क्षेत्रफल = 0") },
        {
          id: "mid",
          label: t("The middle one is the mid-point", "बीच वाला मध्य-बिंदु है"),
          feedback: t(
            "Collinear points don't need equal gaps: (3, 1), (6, 4), (8, 6) are collinear, but (6, 4) isn't the mid-point.",
            "संरेख बिंदुओं में बराबर अंतर ज़रूरी नहीं: (3, 1), (6, 4), (8, 6) संरेख हैं, पर (6, 4) मध्य-बिंदु नहीं है।",
          ),
        },
        {
          id: "right2",
          label: t("Two sides squared add to the third", "दो भुजाओं के वर्ग तीसरी के बराबर"),
          feedback: t(
            "That's the test for a right angle. For a line, the area is 0 (or the two shorter distances add to the longest).",
            "यह समकोण की जाँच है। रेखा के लिए क्षेत्रफल 0 होता है (या दो छोटी दूरियाँ मिलकर सबसे बड़ी)।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log: complete.** ✓ Every place is two numbers. ✓ Distance formula: PQ = √((x₂ − x₁)² + (y₂ − y₁)²), for the crow's 39 m and the fair spot (0, 9). ✓ Section formula: the clue at (12, 5), the corner D(7, 3). ✓ Area from coordinates: Mom's 16 m², and 0 for points in a line. ✓ The centroid for Grandpa's bonus. The hunt takes 40 minutes, and every kid finds a sweet.",
        "**मिशन लॉग: पूरा।** ✓ हर जगह दो संख्याएँ है। ✓ दूरी सूत्र: PQ = √((x₂ − x₁)² + (y₂ − y₁)²), कौवे के 39 m और निष्पक्ष जगह (0, 9) के लिए। ✓ विभाजन सूत्र: (12, 5) पर सुराग, कोना D(7, 3)। ✓ निर्देशांकों से क्षेत्रफल: मम्मी के 16 m², और एक रेखा में बिंदुओं के लिए 0। ✓ दादाजी के बोनस के लिए केन्द्रक। खोज 40 मिनट चलती है, और हर बच्चे को मिठाई मिलती है।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(recap.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([
      w.title(t("Hunt day", "खोज का दिन")),
      day,
      w.body(
        t(
          "Sunday morning. The little kids race from the bench to the tap, along Kabir's straight trail of stones, to the clue at (12, 5) and the flower bed's corner, and dig up the box of sweets at (0, 9). The older kids crack Grandpa's riddle too.",
          "रविवार सुबह। छोटे बच्चे बेंच से नल तक, कबीर के पत्थरों के सीधे रास्ते से, (12, 5) वाले सुराग और क्यारी के कोने तक दौड़ते हैं, और (0, 9) पर मिठाई का डिब्बा खोद निकालते हैं। बड़े बच्चे दादाजी की पहेली भी सुलझा लेते हैं।",
        ),
      ),
      recap,
      log,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

export const overview = [
  hook,
  centroid,
  lineDivides,
  centreAndSquare,
  moreAreas,
  rectangleMidpoints,
  inLife,
  finale,
];

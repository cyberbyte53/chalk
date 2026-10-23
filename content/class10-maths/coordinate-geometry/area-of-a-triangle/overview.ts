import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, goalQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import { AreaAction, AreaDerived, CoordinatesSceneKind } from "@chalk/prop-coordinates";
import { areaOn, sceneOn } from "../kit";

const r = String.raw;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** Mom's triangular herb patch needs mulch. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const patch = sceneOn(
    b,
    "patch",
    CoordinatesSceneKind.HerbPatch,
    "Mom kneels by her triangular herb patch; three pegs mark its corners with string between them, a bag of mulch waits beside her, and Kabir reads the pegs' coordinates off the map",
  );
  return column([
    w.title(t("How big is the herb patch?", "जड़ी-बूटी की क्यारी कितनी बड़ी है?")),
    patch,
    w.body(
      t(
        "Stop 5 found the last clue's corner. While Riya and Kabir dig, Mom asks for help. Her herb patch is a triangle with pegs at (2, 1), (8, 3) and (4, 7), and one bag of mulch covers 8 m². How many bags does she need?",
        "पड़ाव 5 ने आख़िरी सुराग का कोना ढूँढ दिया। जब रिया और कबीर खोद रहे हैं, मम्मी मदद माँगती हैं। उनकी जड़ी-बूटी की क्यारी एक त्रिभुज है जिसके खूँटे (2, 1), (8, 3) और (4, 7) पर हैं, और खाद का एक थैला 8 m² ढकता है। उन्हें कितने थैले चाहिए?",
      ),
    ),
    w.body(
      t(
        "Kabir starts with ½ × base × height, but no side lies along the grid, so the height is hard to find. Heron's formula (Class 9) would need three messy square roots. There's an easier way straight from the coordinates.",
        "कबीर ½ × आधार × ऊँचाई से शुरू करता है, पर कोई भुजा ग्रिड के साथ नहीं है, तो ऊँचाई निकालना मुश्किल है। हीरोन का सूत्र (कक्षा 9) तीन उलझे वर्गमूल माँगेगा। निर्देशांकों से सीधा एक आसान तरीक़ा है।",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** The trapezium derivation, stepped. */
const derive = page(
  "derive",
  (b) => {
    const w = wordsOn(b);
    const tri = areaOn(
      b,
      "triangle",
      {
        points: [
          { name: "A", x: 4, y: 7 },
          { name: "B", x: 1, y: 2 },
          { name: "C", x: 8, y: 3 },
        ],
        window: [-1, 10, -1, 9],
        showCoords: false,
        showWorking: false,
        proof: true,
      },
      "a triangle ABC above the x-axis; Next drops AP, BQ and CR to the x-axis, shades the trapezia ABQP and APRC under the two upper sides, then takes away the trapezium BQRC under the long side, leaving the triangle",
    );
    const goal = goalQuestion(b, {
      about: tri,
      prompt: t("Tap Next through all five steps.", "Next दबाकर पाँचों चरण देखो।"),
      isMet: tri.derived(AreaDerived.Step).eq(4),
      solve: Array.from({ length: 4 }, () => tri.learner(AreaAction.Next, {})),
    });
    return column([
      w.title(t("A triangle from three trapezia", "तीन समलंबों से एक त्रिभुज")),
      w.body(
        t(
          "Take any triangle ABC with A(x₁, y₁), B(x₂, y₂) and C(x₃, y₃). A **trapezium** is a four-sided figure with one pair of parallel sides; its area is ½ × (sum of the parallel sides) × (the distance between them).",
          "कोई त्रिभुज ABC लो जिसमें A(x₁, y₁), B(x₂, y₂) और C(x₃, y₃) हैं। **समलंब** चार भुजाओं वाली आकृति है जिसकी भुजाओं का एक जोड़ा समांतर है; उसका क्षेत्रफल = ½ × (समांतर भुजाओं का योग) × (उनके बीच की दूरी)।",
        ),
      ),
      tri,
      goal,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The algebra, and the formula. */
const formula = page(
  "formula",
  (b) => {
    const w = wordsOn(b);
    const tri = areaOn(
      b,
      "triangle",
      {
        points: [
          { name: "A", x: 4, y: 7 },
          { name: "B", x: 1, y: 2 },
          { name: "C", x: 8, y: 3 },
        ],
        window: [-1, 10, -1, 9],
        showCoords: false,
        showWorking: false,
        proof: true,
        step: 4,
      },
      "the triangle ABC from the last page at its final step: feet P, Q, R on the x-axis below A, B, C, the trapezia ABQP and APRC added and BQRC taken away; Back steps through it again",
    );
    const why = choiceQuestion(b, {
      prompt: t(
        'Why does the formula say "the numerical value" of the expression?',
        'सूत्र व्यंजक का "संख्यात्मक मान" क्यों कहता है?',
      ),
      options: [
        { id: "right", label: t("It can come out negative", "यह ऋणात्मक आ सकता है") },
        {
          id: "round",
          label: t("It must be rounded off", "इसे पूर्णांक बनाना है"),
          feedback: t(
            'Areas can be fractions, like 21/2. "Numerical value" means drop a minus sign: −4 becomes 4.',
            'क्षेत्रफल भिन्न हो सकते हैं, जैसे 21/2। "संख्यात्मक मान" का मतलब ऋण चिह्न हटाना: −4, 4 बनता है।',
          ),
        },
        {
          id: "units",
          label: t("It has no units yet", "इसकी अभी इकाई नहीं है"),
          feedback: t(
            "Units are square units either way. Listing the vertices in a different order can flip the sign of the bracket, and an area can't be negative.",
            "इकाई तो वर्ग इकाई ही है। शीर्ष अलग क्रम में लेने से कोष्ठक का चिह्न बदल सकता है, और क्षेत्रफल ऋणात्मक नहीं हो सकता।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("The area formula", "क्षेत्रफल सूत्र")),
      tri,
      w.body(
        t(
          "In the picture, AP = y₁, BQ = y₂, CR = y₃, QP = x₁ − x₂, PR = x₃ − x₁ and QR = x₃ − x₂. So",
          "चित्र में AP = y₁, BQ = y₂, CR = y₃, QP = x₁ − x₂, PR = x₃ − x₁ और QR = x₃ − x₂। तो",
        ),
      ),
      w.body(
        t(
          r`$$\text{area } ABC = ABQP + APRC - BQRC$$ $$= \tfrac{1}{2}(y_2 + y_1)(x_1 - x_2)$$ $$+ \tfrac{1}{2}(y_1 + y_3)(x_3 - x_1)$$ $$- \tfrac{1}{2}(y_2 + y_3)(x_3 - x_2)$$ $$= \tfrac{1}{2}[x_1y_2 - x_2y_1 + x_3y_1 - x_1y_3 - x_3y_2 + x_2y_3]$$`,
          r`$$\text{क्षेत्रफल } ABC = ABQP + APRC - BQRC$$ $$= \tfrac{1}{2}(y_2 + y_1)(x_1 - x_2)$$ $$+ \tfrac{1}{2}(y_1 + y_3)(x_3 - x_1)$$ $$- \tfrac{1}{2}(y_2 + y_3)(x_3 - x_2)$$ $$= \tfrac{1}{2}[x_1y_2 - x_2y_1 + x_3y_1 - x_1y_3 - x_3y_2 + x_2y_3]$$`,
        ),
      ),
      w.body(
        t(
          "The terms x₁y₁, x₂y₂ and x₃y₃ each come once with + and once with −, so they cancel. Now group by x₁, x₂, x₃:",
          "पद x₁y₁, x₂y₂ और x₃y₃ हर एक बार + और एक बार − के साथ आते हैं, तो कट जाते हैं। अब x₁, x₂, x₃ के अनुसार समूह बनाओ:",
        ),
      ),
      w.body(
        t(
          r`$$= \tfrac{1}{2}\left[x_1(y_2 - y_3) + x_2(y_3 - y_1) + x_3(y_1 - y_2)\right]$$`,
          r`$$= \tfrac{1}{2}\left[x_1(y_2 - y_3) + x_2(y_3 - y_1) + x_3(y_1 - y_2)\right]$$`,
        ),
      ),
      w.body(
        t(
          "If you name the corners in the other order, say A, C, B, every bracket changes sign and the answer comes out negative. So we take its numerical value: −4 becomes 4. We write |−4| = 4 for the numerical value.",
          "अगर कोनों को दूसरे क्रम में लो, जैसे A, C, B, तो हर कोष्ठक का चिह्न बदल जाता है और उत्तर ऋणात्मक आता है। इसलिए हम उसका संख्यात्मक मान लेते हैं: −4, 4 बनता है। संख्यात्मक मान को हम |−4| = 4 लिखते हैं।",
        ),
      ),
      w.definition(
        t(
          r`**Area of a triangle.** The area of the triangle with vertices (x₁, y₁), (x₂, y₂) and (x₃, y₃) is the numerical value of $$\tfrac{1}{2}\left[x_1(y_2 - y_3) + x_2(y_3 - y_1) + x_3(y_1 - y_2)\right]$$`,
          r`**त्रिभुज का क्षेत्रफल।** शीर्ष (x₁, y₁), (x₂, y₂) और (x₃, y₃) वाले त्रिभुज का क्षेत्रफल इसका संख्यात्मक मान है: $$\tfrac{1}{2}\left[x_1(y_2 - y_3) + x_2(y_3 - y_1) + x_3(y_1 - y_2)\right]$$`,
        ),
      ),
      why,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Examples 11 and 12. */
const examples = page(
  "examples",
  (b) => {
    const w = wordsOn(b);
    const tri = areaOn(
      b,
      "triangle",
      {
        points: [
          { name: "A", x: 1, y: -1 },
          { name: "B", x: -4, y: 6 },
          { name: "C", x: -3, y: -5 },
        ],
        window: [-6, 3, -7, 8],
      },
      "the triangle with vertices (1, −1), (−4, 6) and (−3, −5) on graph paper, with its area worked out from the formula line by line: 24 square units",
    );
    const ex12 = choiceQuestion(b, {
      prompt: t(
        "Example 12: A(5, 2), B(4, 7), C(7, −4). The bracket works out to 55 − 24 − 35 = −4. What is the area?",
        "उदाहरण 12: A(5, 2), B(4, 7), C(7, −4)। कोष्ठक 55 − 24 − 35 = −4 आता है। क्षेत्रफल क्या है?",
      ),
      options: [
        { id: "right", label: t("2 square units", "2 वर्ग इकाई") },
        {
          id: "neg",
          label: t("−2 square units", "−2 वर्ग इकाई"),
          feedback: t(
            "An area can't be negative: take the numerical value, ½ × 4 = 2.",
            "क्षेत्रफल ऋणात्मक नहीं हो सकता: संख्यात्मक मान लो, ½ × 4 = 2।",
          ),
        },
        {
          id: "four",
          label: t("4 square units", "4 वर्ग इकाई"),
          feedback: t("Don't forget the ½ in front.", "आगे का ½ मत भूलो।"),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Examples 11 and 12", "उदाहरण 11 और 12")),
      w.body(
        t(
          "Example 11: find the area of the triangle with vertices (1, −1), (−4, 6) and (−3, −5).",
          "उदाहरण 11: शीर्ष (1, −1), (−4, 6) और (−3, −5) वाले त्रिभुज का क्षेत्रफल ज्ञात करो।",
        ),
      ),
      tri,
      ex12,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Area 0 means collinear: drag a vertex onto the line. */
const flat = page(
  "flat",
  (b) => {
    const w = wordsOn(b);
    const tri = areaOn(
      b,
      "triangle",
      {
        points: [
          { name: "A", x: 1, y: 1 },
          { name: "B", x: 3, y: 2 },
          { name: "C", x: 4, y: 5 },
        ],
        movable: [2],
        window: [-1, 9, -1, 7],
      },
      "a triangle ABC with C that the learner drags; the area is worked out as C moves, and when C falls on the line through A and B the area is 0 and the prop says the points are collinear",
    );
    const goal = goalQuestion(b, {
      about: tri,
      prompt: t(
        "Drag C until the area is 0. Where does C have to be?",
        "C को तब तक खिसकाओ जब तक क्षेत्रफल 0 न हो। C को कहाँ होना पड़ता है?",
      ),
      isMet: tri.derived(AreaDerived.IsCollinear).eq(true),
      solve: [tri.learner(AreaAction.SetPoint, { i: 2, x: 5, y: 3, isSnapped: true })],
    });
    const rule = w.definition(
      t(
        "**Collinear points.** Three points are collinear exactly when the triangle they make has area 0: ½[x₁(y₂ − y₃) + x₂(y₃ − y₁) + x₃(y₁ − y₂)] = 0.",
        "**संरेख बिंदु।** तीन बिंदु ठीक तब संरेख होते हैं जब उनसे बने त्रिभुज का क्षेत्रफल 0 हो: ½[x₁(y₂ − y₃) + x₂(y₃ − y₁) + x₃(y₁ − y₂)] = 0।",
      ),
      "rule",
      { isHidden: true },
    );
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(rule));
    return column([
      w.title(t("A triangle with no area", "बिना क्षेत्रफल का त्रिभुज")),
      w.body(
        t(
          "If C slides onto the line through A and B, the triangle squashes flat.",
          "यदि C खिसककर A और B से जाने वाली रेखा पर आ जाए, तो त्रिभुज चपटा हो जाता है।",
        ),
      ),
      tri,
      goal,
      rule,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Examples 13 and 14: collinear by area, and finding k. */
const findK = page(
  "find-k",
  (b) => {
    const w = wordsOn(b);
    const q2 = choiceQuestion(b, {
      prompt: t(
        "Exercise 7.3 Q2 (i): find k if (7, −2), (5, 1) and (3, k) are collinear.",
        "प्रश्नावली 7.3 प्र2 (i): k ज्ञात करो यदि (7, −2), (5, 1) और (3, k) संरेख हैं।",
      ),
      options: [
        { id: "right", label: t("k = 4", "k = 4") },
        {
          id: "neg",
          label: t("k = −4", "k = −4"),
          feedback: t(
            "Expand carefully: 7(1 − k) + 5(k + 2) + 3(−2 − 1) = 7 − 7k + 5k + 10 − 9 = 8 − 2k = 0.",
            "ध्यान से खोलो: 7(1 − k) + 5(k + 2) + 3(−2 − 1) = 7 − 7k + 5k + 10 − 9 = 8 − 2k = 0।",
          ),
        },
        {
          id: "one",
          label: t("k = 1", "k = 1"),
          feedback: t(
            "That's the y-coordinate of the middle point. Going from x = 7 to 5, y rises by 3; from 5 to 3 it rises by 3 again: k = 4.",
            "यह बीच वाले बिंदु का y है। x = 7 से 5 तक y, 3 बढ़ता है; 5 से 3 तक फिर 3: k = 4।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Examples 13 and 14", "उदाहरण 13 और 14")),
      w.body(
        t(
          "Example 13: the triangle P(−1.5, 3), Q(6, −2), R(−3, 4).",
          "उदाहरण 13: त्रिभुज P(−1.5, 3), Q(6, −2), R(−3, 4)।",
        ),
      ),
      w.body(
        t(
          r`$$\tfrac{1}{2}\left[-1.5(-2 - 4) + 6(4 - 3) + (-3)(3 + 2)\right]$$ $$= \tfrac{1}{2}(9 + 6 - 15) = 0$$`,
          r`$$\tfrac{1}{2}\left[-1.5(-2 - 4) + 6(4 - 3) + (-3)(3 + 2)\right]$$ $$= \tfrac{1}{2}(9 + 6 - 15) = 0$$`,
        ),
      ),
      w.body(
        t(
          "Area 0, so P, Q and R are collinear: there is no triangle.",
          "क्षेत्रफल 0, तो P, Q और R संरेख हैं: कोई त्रिभुज नहीं बनता।",
        ),
      ),
      w.body(
        t(
          "Example 14: find k if A(2, 3), B(4, k) and C(6, −3) are collinear. Set the area to 0:",
          "उदाहरण 14: k ज्ञात करो यदि A(2, 3), B(4, k) और C(6, −3) संरेख हैं। क्षेत्रफल 0 रखो:",
        ),
      ),
      w.body(
        t(
          r`$$\tfrac{1}{2}\left[2(k + 3) + 4(-3 - 3) + 6(3 - k)\right] = 0$$ $$2k + 6 - 24 + 18 - 6k = 0$$ $$-4k = 0$$ $$k = 0$$`,
          r`$$\tfrac{1}{2}\left[2(k + 3) + 4(-3 - 3) + 6(3 - k)\right] = 0$$ $$2k + 6 - 24 + 18 - 6k = 0$$ $$-4k = 0$$ $$k = 0$$`,
        ),
      ),
      q2,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Example 15: a quadrilateral as two triangles. */
const quadrilateral = page(
  "quadrilateral",
  (b) => {
    const w = wordsOn(b);
    const q4 = choiceQuestion(b, {
      prompt: t(
        "Exercise 7.3 Q4: find the area of the quadrilateral with vertices (−4, −2), (−3, −5), (3, −2) and (2, 3), in order.",
        "प्रश्नावली 7.3 प्र4: शीर्ष (−4, −2), (−3, −5), (3, −2) और (2, 3) (क्रम से) वाले चतुर्भुज का क्षेत्रफल ज्ञात करो।",
      ),
      options: [
        { id: "right", label: t("28 square units", "28 वर्ग इकाई") },
        {
          id: "diff",
          label: t("7 square units", "7 वर्ग इकाई"),
          feedback: t(
            "The diagonal from the first to the third vertex gives triangles of 10.5 and 17.5. They don't overlap, so add them: 10.5 + 17.5.",
            "पहले से तीसरे शीर्ष तक का विकर्ण 10.5 और 17.5 के त्रिभुज देता है। वे एक-दूसरे पर नहीं चढ़ते, तो जोड़ो: 10.5 + 17.5।",
          ),
        },
        {
          id: "double",
          label: t("56 square units", "56 वर्ग इकाई"),
          feedback: t(
            "Each triangle is ½ of its bracket: 21 ÷ 2 = 10.5 and 35 ÷ 2 = 17.5. Add those: 28.",
            "हर त्रिभुज अपने कोष्ठक का ½ है: 21 ÷ 2 = 10.5 और 35 ÷ 2 = 17.5। उन्हें जोड़ो: 28।",
          ),
        },
        {
          id: "half",
          label: t("14 square units", "14 वर्ग इकाई"),
          feedback: t(
            "That halves the total again. The two triangles are already 10.5 and 17.5, and 10.5 + 17.5 = 28.",
            "यह कुल को फिर से आधा करता है। दोनों त्रिभुज पहले ही 10.5 और 17.5 हैं, और 10.5 + 17.5 = 28।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Example 15: a quadrilateral", "उदाहरण 15: एक चतुर्भुज")),
      w.body(
        t(
          "A(−5, 7), B(−4, −5), C(−1, −6) and D(4, 5) are the vertices of a quadrilateral. Join the diagonal BD: it splits ABCD into ∆ABD and ∆BCD, which don't overlap.",
          "A(−5, 7), B(−4, −5), C(−1, −6) और D(4, 5) एक चतुर्भुज के शीर्ष हैं। विकर्ण BD मिलाओ: यह ABCD को ∆ABD और ∆BCD में बाँटता है, जो एक-दूसरे पर नहीं चढ़ते।",
        ),
      ),
      w.body(
        t(
          r`$$\triangle ABD = \tfrac{1}{2}\left|-5(-5 - 5) + (-4)(5 - 7) + 4(7 + 5)\right|$$ $$= \tfrac{1}{2}(50 + 8 + 48) = 53$$ $$\triangle BCD = \tfrac{1}{2}\left|-4(-6 - 5) + (-1)(5 + 5) + 4(-5 + 6)\right|$$ $$= \tfrac{1}{2}(44 - 10 + 4) = 19$$ $$ABCD = 53 + 19 = 72 \text{ square units}$$`,
          r`$$\triangle ABD = \tfrac{1}{2}\left|-5(-5 - 5) + (-4)(5 - 7) + 4(7 + 5)\right|$$ $$= \tfrac{1}{2}(50 + 8 + 48) = 53$$ $$\triangle BCD = \tfrac{1}{2}\left|-4(-6 - 5) + (-1)(5 + 5) + 4(-5 + 6)\right|$$ $$= \tfrac{1}{2}(44 - 10 + 4) = 19$$ $$ABCD = 53 + 19 = 72 \text{ वर्ग इकाई}$$`,
        ),
      ),
      w.note(
        t(
          "To find the area of any polygon, divide it into triangles that don't overlap and add their areas.",
          "किसी भी बहुभुज का क्षेत्रफल निकालने के लिए उसे ऐसे त्रिभुजों में बाँटो जो एक-दूसरे पर न चढ़ें, और उनके क्षेत्रफल जोड़ो।",
        ),
      ),
      q4,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** The herb patch is 16 m²: two bags. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const tri = areaOn(
      b,
      "patch",
      {
        points: [
          { name: "P", x: 2, y: 1 },
          { name: "Q", x: 8, y: 3 },
          { name: "R", x: 4, y: 7 },
        ],
        window: [0, 10, -1, 8],
        showWorking: false,
      },
      "Mom's herb patch on the park map: the triangle with pegs P(2, 1), Q(8, 3) and R(4, 7)",
    );
    const bags = choiceQuestion(b, {
      prompt: t(
        "Find the patch's area. One bag of mulch covers 8 m². How many bags does Mom need?",
        "क्यारी का क्षेत्रफल ज्ञात करो। खाद का एक थैला 8 m² ढकता है। मम्मी को कितने थैले चाहिए?",
      ),
      options: [
        { id: "right", label: t("2 bags (16 m²)", "2 थैले (16 m²)") },
        {
          id: "four",
          label: t("4 bags (32 m²)", "4 थैले (32 m²)"),
          feedback: t(
            "32 is the bracket: 2(3 − 7) + 8(7 − 1) + 4(1 − 3) = −8 + 48 − 8. Halve it.",
            "32 कोष्ठक है: 2(3 − 7) + 8(7 − 1) + 4(1 − 3) = −8 + 48 − 8। इसे आधा करो।",
          ),
        },
        {
          id: "one",
          label: t("1 bag (8 m²)", "1 थैला (8 m²)"),
          feedback: t(
            "Check the bracket: 2(3 − 7) + 8(7 − 1) + 4(1 − 3) = 32, so the area is 16 m².",
            "कोष्ठक जाँचो: 2(3 − 7) + 8(7 − 1) + 4(1 − 3) = 32, तो क्षेत्रफल 16 m² है।",
          ),
        },
      ],
      answer: "right",
    });
    const joke = w.body(
      t(
        'Kabir tries the formula on his three clue stones (3, 1), (6, 4), (8, 6) for fun: 3(4 − 6) + 6(6 − 1) + 8(1 − 4) = −6 + 30 − 24 = 0. "No area," says Riya, "because they\'re collinear. Your straight trail, checked a second way."',
        'कबीर मज़े के लिए अपने तीन सुराग-पत्थरों (3, 1), (6, 4), (8, 6) पर सूत्र लगाता है: 3(4 − 6) + 6(6 − 1) + 8(1 − 4) = −6 + 30 − 24 = 0। "कोई क्षेत्रफल नहीं," रिया कहती है, "क्योंकि वे संरेख हैं। तुम्हारा सीधा रास्ता, दूसरे तरीक़े से जाँचा गया।"',
      ),
      "joke",
      { isHidden: true },
    );
    b.when(bags.on(QuestionSignal.Correct), [theBoard.show(joke), theBoard.pass()]);
    return column([w.title(t("Mulch for the patch", "क्यारी के लिए खाद")), tri, bags, joke, space()]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Exercise 7.3 Q1 and Q5, then the mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const q1 = choiceQuestion(b, {
      name: "q1",
      prompt: t(
        "Exercise 7.3 Q1 (i): find the area of the triangle with vertices (2, 3), (−1, 0) and (2, −4).",
        "प्रश्नावली 7.3 प्र1 (i): शीर्ष (2, 3), (−1, 0) और (2, −4) वाले त्रिभुज का क्षेत्रफल ज्ञात करो।",
      ),
      options: [
        { id: "right", label: t("21/2 square units", "21/2 वर्ग इकाई") },
        {
          id: "21",
          label: t("21 square units", "21 वर्ग इकाई"),
          feedback: t(
            "21 is the bracket: 8 + 7 + 6. Halve it.",
            "21 कोष्ठक है: 8 + 7 + 6। इसे आधा करो।",
          ),
        },
        {
          id: "sign",
          label: t("7/2 square units", "7/2 वर्ग इकाई"),
          feedback: t(
            "Watch the middle term: (−1)(−4 − 3) = +7, not −7.",
            "बीच का पद देखो: (−1)(−4 − 3) = +7, −7 नहीं।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const q5 = choiceQuestion(b, {
      name: "q5",
      prompt: t(
        "Exercise 7.3 Q5: A(4, −6), B(3, −2), C(5, 2). The median from A meets BC at its mid-point D(4, 0). The areas of ∆ABD and ∆ADC are…",
        "प्रश्नावली 7.3 प्र5: A(4, −6), B(3, −2), C(5, 2)। A से माध्यिका BC को उसके मध्य-बिंदु D(4, 0) पर मिलती है। ∆ABD और ∆ADC के क्षेत्रफल हैं…",
      ),
      options: [
        { id: "right", label: t("3 and 3: the median halves it", "3 और 3: माध्यिका आधा करती है") },
        {
          id: "six",
          label: t("6 and 6: the same as ∆ABC", "6 और 6: ∆ABC जितने"),
          feedback: t(
            "∆ABC itself is 6. Each half is ½|4(−2 − 0) + 3(0 + 6) + 4(−6 + 2)| = 3.",
            "∆ABC ख़ुद 6 है। हर आधा ½|4(−2 − 0) + 3(0 + 6) + 4(−6 + 2)| = 3 है।",
          ),
        },
        {
          id: "uneven",
          label: t("2 and 4: B's side is smaller", "2 और 4: B वाला छोटा"),
          feedback: t(
            "Work both out: each is 3. A median always splits a triangle into two equal areas.",
            "दोनों निकालो: हर एक 3 है। माध्यिका त्रिभुज को हमेशा दो बराबर क्षेत्रफलों में बाँटती है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ Stop 6: the area of a triangle comes straight from its corners. Mom's patch is 16 m², so two bags of mulch. Area 0 means collinear. Next: hunt day, and the hardest clue of all.",
        "**मिशन लॉग।** ✓ पड़ाव 6: त्रिभुज का क्षेत्रफल सीधे उसके कोनों से मिलता है। मम्मी की क्यारी 16 m² है, तो खाद के दो थैले। क्षेत्रफल 0 मतलब संरेख। आगे: खोज का दिन, और सबसे कठिन सुराग।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(q5.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), q1, q5, log, space()]);
  },
  { passOn: PassOn.Rules },
);

export const overview = [
  hook,
  derive,
  formula,
  examples,
  flat,
  findK,
  quadrilateral,
  inLife,
  yourTurn,
];

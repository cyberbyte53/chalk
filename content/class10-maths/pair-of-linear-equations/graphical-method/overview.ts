import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import { EquationForm, LinearSceneKind, ShadeAxis } from "@chalk/prop-linear-equations";
import { CASH_BOX, equals, general, plane, scene } from "../kit";

const r = String.raw;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** Kabir's rides and games: he spent ₹20 and has forgotten how. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const rides = scene(
    b,
    "rides",
    LinearSceneKind.GiantWheel,
    "the mela rides: a giant wheel at ₹3 a ride and a hoopla stall at ₹4 a game; Kabir throws a ring while Riya counts coins",
  );
  return column([
    w.title(t("Where the lines cross", "जहाँ रेखाएँ कटती हैं")),
    w.body(
      t(
        "The cash box lines cross, so the answer exists. Now Riya wants to *find* it. A smaller puzzle turns up first: during his break, Kabir spent all his ₹20 on the Giant Wheel (₹3 a ride) and Hoopla (₹4 a game), playing Hoopla half as many times as he rode the wheel. Now he wants to boast, but he can't remember how many rides he had.",
        "गल्ले की रेखाएँ कटती हैं, तो उत्तर मौजूद है। अब रिया उसे *खोजना* चाहती है। पहले एक छोटी पहेली आती है: छुट्टी में कबीर ने अपने पूरे ₹20 बड़े झूले (₹3 की सवारी) और हूपला (₹4 का खेल) पर ख़र्च किए, और जितनी बार झूला झूला उसकी आधी बार हूपला खेला। अब वह शेख़ी बघारना चाहता है, पर याद नहीं कि कितनी सवारियाँ कीं।",
      ),
    ),
    rides,
    w.body(
      t(
        'Riya grins. "Two clues, two unknowns: we can draw a line for each clue. The answer must be sitting somewhere on that graph." But where, and why there?',
        'रिया मुस्कुराती है। "दो सुराग, दो अज्ञात: हर सुराग की एक रेखा खींच सकते हैं। उत्तर उसी ग्राफ़ पर कहीं बैठा होगा।" पर कहाँ, और वहीं क्यों?',
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** The crossing point is the only point on both lines: the solution. Verify (4, 2). */
const meet = page(
  "meet",
  (b) => {
    const w = wordsOn(b);
    const graph = plane(
      b,
      "graph",
      [general(1, -2, 0), equals(3, 4, 20)],
      { xMin: -2, xMax: 8, yMin: -2, yMax: 7 },
      { probe: [6, 5], canMoveProbe: true },
    );
    b.standsFor(
      graph,
      "the lines x − 2y = 0 and 3x + 4y = 20 with a test point the learner drags; the label says which equations the point satisfies",
    );
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "Drag the test point. Which point satisfies both equations?",
        "जाँच-बिंदु को खिसकाओ। कौन-सा बिंदु दोनों समीकरणों को संतुष्ट करता है?",
      ),
      options: [
        { id: "right", label: t("$(4, 2)$", "$(4, 2)$") },
        {
          id: "zero",
          label: t("$(0, 0)$", "$(0, 0)$"),
          feedback: t(
            "$(0, 0)$ is on $x - 2y = 0$, but $3(0) + 4(0) = 0$, not 20.",
            "$(0, 0)$ तो $x - 2y = 0$ पर है, पर $3(0) + 4(0) = 0$ है, 20 नहीं।",
          ),
        },
        {
          id: "five",
          label: t("$(0, 5)$", "$(0, 5)$"),
          feedback: t(
            "$(0, 5)$ is on $3x + 4y = 20$, but $0 - 2(5) = -10$, not 0.",
            "$(0, 5)$ तो $3x + 4y = 20$ पर है, पर $0 - 2(5) = -10$ है, 0 नहीं।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("The crossing point is the solution", "कटान-बिंदु ही हल है")),
      w.body(
        t(
          "A solution of a pair satisfies **both** equations. On a graph, the points that satisfy an equation are exactly the points of its line. So a solution of the pair must be a point on **both** lines, and when two lines intersect, there is just one such point: where they cross.",
          "युग्म का हल **दोनों** समीकरणों को संतुष्ट करता है। ग्राफ़ पर, किसी समीकरण को संतुष्ट करने वाले बिंदु ठीक उसकी रेखा के बिंदु हैं। इसलिए युग्म का हल **दोनों** रेखाओं पर पड़ने वाला बिंदु होना चाहिए, और जब दो रेखाएँ प्रतिच्छेद करती हैं, तो ऐसा केवल एक बिंदु होता है: जहाँ वे कटती हैं।",
        ),
      ),
      w.definition(
        t(
          "**Graphical method.** To solve a pair by drawing: draw both lines on the same graph and read off the point where they meet. Then **verify** it: put the values into both equations and check that each one holds.",
          "**ग्राफ़ीय विधि।** चित्र बनाकर युग्म हल करने के लिए: दोनों रेखाएँ एक ही ग्राफ़ पर खींचो और जहाँ वे मिलती हैं वह बिंदु पढ़ो। फिर उसकी **जाँच** करो: मानों को दोनों समीकरणों में रखो और देखो कि हर एक सही बैठता है।",
        ),
      ),
      graph,
      ask,
      w.body(
        t("Check $x = 4$, $y = 2$ in both equations:", "$x = 4$, $y = 2$ को दोनों समीकरणों में जाँचो:"),
      ),
      w.body(
        t(
          r`$$\begin{aligned} 4 - 2 \times 2 &= 0 \\ 3(4) + 4(2) &= 20 \end{aligned}$$`,
          r`$$\begin{aligned} 4 - 2 \times 2 &= 0 \\ 3(4) + 4(2) &= 20 \end{aligned}$$`,
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Consistent, inconsistent, dependent. */
const kinds = page(
  "kinds",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "The pencil bills, $2x + 3y = 9$ and $4x + 6y = 18$, coincide. What kind of pair is it?",
        "पेंसिल वाले बिल, $2x + 3y = 9$ और $4x + 6y = 18$, संपाती हैं। यह किस तरह का युग्म है?",
      ),
      options: [
        {
          id: "right",
          label: t("Dependent, and so consistent", "आश्रित, और इसलिए संगत"),
        },
        {
          id: "inconsistent",
          label: t("Inconsistent", "असंगत"),
          feedback: t(
            "Inconsistent means no solution at all. These have infinitely many.",
            "असंगत का अर्थ है कोई हल नहीं। इनके तो अपरिमित हल हैं।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Names for the three cases", "तीनों स्थितियों के नाम")),
      w.definition(
        t(
          "**Consistent, inconsistent, dependent.** A pair that has **at least one** solution is **consistent**. A pair with **no** solution is **inconsistent**. A pair of **equivalent** equations, which has infinitely many solutions, is **dependent**. A dependent pair is always consistent.",
          "**संगत, असंगत, आश्रित।** जिस युग्म का **कम से कम एक** हल हो, वह **संगत** है। जिसका **कोई** हल न हो, वह **असंगत** है। **तुल्य** समीकरणों का युग्म, जिसके अपरिमित हल होते हैं, **आश्रित** है। आश्रित युग्म हमेशा संगत होता है।",
        ),
      ),
      w.body(t("Putting the pictures and the names together:", "चित्रों और नामों को साथ रखें तो:")),
      w.body(
        t(
          "(i) Lines **intersect** at one point: a **unique** (exactly one) solution; the pair is **consistent**. (ii) Lines are **parallel**: **no** solution; the pair is **inconsistent**. (iii) Lines **coincide**: **infinitely many** solutions; the pair is **dependent** (and consistent).",
          "(i) रेखाएँ एक बिंदु पर **प्रतिच्छेद** करती हैं: **अद्वितीय** (ठीक एक) हल; युग्म **संगत** है। (ii) रेखाएँ **समांतर** हैं: **कोई** हल नहीं; युग्म **असंगत** है। (iii) रेखाएँ **संपाती** हैं: **अपरिमित** हल; युग्म **आश्रित** (और संगत) है।",
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The ratio test: tell the case without drawing (NCERT Table 3.4). */
const ratios = page(
  "ratios",
  (b) => {
    const w = wordsOn(b);
    const graph = plane(
      b,
      "graph",
      [general(1, 2, -4), general(2, 4, -12)],
      { xMin: -2, xMax: 8, yMin: -2, yMax: 6 },
      { form: EquationForm.General, showRatios: true, showSolution: true, editLine: 1 },
    );
    b.standsFor(
      graph,
      "two lines in general form with their ratios a₁/a₂, b₁/b₂, c₁/c₂ compared beside them; the learner changes the second line's a, b and c",
    );
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "Compare the ratios: $5x - 4y + 8 = 0$ and $7x + 6y - 9 = 0$. The lines…",
        "अनुपात मिलाओ: $5x - 4y + 8 = 0$ और $7x + 6y - 9 = 0$। रेखाएँ…",
      ),
      options: [
        { id: "right", label: t("intersect at a point", "एक बिंदु पर प्रतिच्छेद करती हैं") },
        {
          id: "parallel",
          label: t("are parallel", "समांतर हैं"),
          feedback: t(
            r`$\tfrac{a_1}{a_2} = \tfrac{5}{7}$ but $\tfrac{b_1}{b_2} = \tfrac{-4}{6} = -\tfrac{2}{3}$. They are not equal, so the lines intersect.`,
            r`$\tfrac{a_1}{a_2} = \tfrac{5}{7}$ पर $\tfrac{b_1}{b_2} = \tfrac{-4}{6} = -\tfrac{2}{3}$। ये बराबर नहीं, इसलिए रेखाएँ प्रतिच्छेद करती हैं।`,
          ),
        },
        {
          id: "same",
          label: t("coincide", "संपाती हैं"),
          feedback: t(
            "Coincident lines need all three ratios equal. Already the first two differ.",
            "संपाती रेखाओं के लिए तीनों अनुपात बराबर चाहिए। यहाँ पहले दो ही अलग हैं।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Telling the case without drawing", "बिना चित्र के स्थिति पहचानना")),
      w.body(
        t(
          "Drawing takes time. NCERT compares three fractions instead. Write the pair in general form, $a_1x + b_1y + c_1 = 0$ and $a_2x + b_2y + c_2 = 0$, and look at",
          "चित्र बनाने में समय लगता है। NCERT इसकी जगह तीन भिन्नों को मिलाती है। युग्म को व्यापक रूप में लिखो, $a_1x + b_1y + c_1 = 0$ और $a_2x + b_2y + c_2 = 0$, और देखो",
        ),
      ),
      w.body(
        t(
          r`$$\frac{a_1}{a_2},\quad \frac{b_1}{b_2},\quad \frac{c_1}{c_2}$$`,
          r`$$\frac{a_1}{a_2},\quad \frac{b_1}{b_2},\quad \frac{c_1}{c_2}$$`,
        ),
      ),
      w.definition(
        t(
          r`**The ratio test.** (i) If $\tfrac{a_1}{a_2} \neq \tfrac{b_1}{b_2}$, the lines **intersect**: one solution. (ii) If $\tfrac{a_1}{a_2} = \tfrac{b_1}{b_2} = \tfrac{c_1}{c_2}$, the lines **coincide**: infinitely many solutions. (iii) If $\tfrac{a_1}{a_2} = \tfrac{b_1}{b_2} \neq \tfrac{c_1}{c_2}$, the lines are **parallel**: no solution.`,
          r`**अनुपात परीक्षण।** (i) यदि $\tfrac{a_1}{a_2} \neq \tfrac{b_1}{b_2}$, तो रेखाएँ **प्रतिच्छेद** करती हैं: एक हल। (ii) यदि $\tfrac{a_1}{a_2} = \tfrac{b_1}{b_2} = \tfrac{c_1}{c_2}$, तो रेखाएँ **संपाती** हैं: अपरिमित हल। (iii) यदि $\tfrac{a_1}{a_2} = \tfrac{b_1}{b_2} \neq \tfrac{c_1}{c_2}$, तो रेखाएँ **समांतर** हैं: कोई हल नहीं।`,
        ),
      ),
      w.body(
        t(
          "Why it works: when $a$ and $b$ are in the same ratio, one left side is a multiple of the other, so the lines have the same tilt. Then $c$ decides whether they are the same line or two side by side. Change the second line below and watch the ratios and the picture together.",
          "यह क्यों चलता है: जब $a$ और $b$ एक ही अनुपात में हों, तो एक बायाँ पक्ष दूसरे का गुणज है, इसलिए रेखाओं का झुकाव एक है। फिर $c$ तय करता है कि वे एक ही रेखा हैं या साथ-साथ दो। नीचे दूसरी रेखा बदलो और अनुपात व चित्र साथ-साथ देखो।",
        ),
      ),
      graph,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** NCERT Example 4: x + 3y = 6 and 2x − 3y = 12 meet at (6, 0). */
const example4 = page(
  "example-4",
  (b) => {
    const w = wordsOn(b);
    const graph = plane(
      b,
      "graph",
      [equals(1, 3, 6), equals(2, -3, 12)],
      { xMin: -2, xMax: 8, yMin: -5, yMax: 4 },
      { showTables: true, showSolution: true },
    );
    b.standsFor(
      graph,
      "NCERT Fig 3.5: x + 3y = 6 through (0, 2) and (6, 0); 2x − 3y = 12 through (0, −4) and (3, −2); they meet at (6, 0)",
    );
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t("So the pair is consistent, and its solution is…", "तो युग्म संगत है, और उसका हल है…"),
      options: [
        { id: "right", label: t("$x = 6$, $y = 0$", "$x = 6$, $y = 0$") },
        {
          id: "swap",
          label: t("$x = 0$, $y = 6$", "$x = 0$, $y = 6$"),
          feedback: t(
            "The meeting point is 6 along the $x$-axis and 0 up: $(6, 0)$. The first number is always $x$.",
            "मिलन-बिंदु $x$-अक्ष पर 6 और ऊपर 0 है: $(6, 0)$। पहली संख्या हमेशा $x$ होती है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Example: a point on an axis", "उदाहरण: अक्ष पर एक बिंदु")),
      w.body(
        t(
          "NCERT's Example 4. Check graphically whether this pair is consistent; if so, solve it:",
          "NCERT का उदाहरण 4। ग्राफ़ से जाँचो कि यह युग्म संगत है या नहीं; अगर है, तो हल करो:",
        ),
      ),
      w.body(
        t(
          r`$$\begin{aligned} x + 3y &= 6 \quad (1) \\ 2x - 3y &= 12 \quad (2) \end{aligned}$$`,
          r`$$\begin{aligned} x + 3y &= 6 \quad (1) \\ 2x - 3y &= 12 \quad (2) \end{aligned}$$`,
        ),
      ),
      graph,
      w.body(
        t(
          "The point $B(6, 0)$ is on both lines: it is the common solution. A solution with $y = 0$ is perfectly allowed.",
          "बिंदु $B(6, 0)$ दोनों रेखाओं पर है: यही साझा हल है। $y = 0$ वाला हल पूरी तरह मान्य है।",
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** NCERT Example 5: one equation is the other times 5/3, so they coincide. */
const example5 = page(
  "example-5",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t("So how many solutions does this pair have?", "तो इस युग्म के कितने हल हैं?"),
      options: [
        { id: "right", label: t("Infinitely many", "अपरिमित रूप से अनेक") },
        {
          id: "none",
          label: t("None", "कोई नहीं"),
          feedback: t(
            "Once multiplied, the second equation *is* the first one. Every solution of one solves the other.",
            "गुणा करने पर दूसरा समीकरण वही पहला *है*। एक का हर हल दूसरे का भी हल है।",
          ),
        },
        {
          id: "one",
          label: t("Exactly one", "ठीक एक"),
          feedback: t(
            "Two equivalent equations are one line twice, not two crossing lines.",
            "दो तुल्य समीकरण एक ही रेखा दो बार हैं, दो कटती रेखाएँ नहीं।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Example: the same line in disguise", "उदाहरण: भेष बदले एक ही रेखा")),
      w.body(
        t(
          "NCERT's Example 5. Does this pair have no solution, a unique solution or infinitely many?",
          "NCERT का उदाहरण 5। इस युग्म का कोई हल नहीं है, एक अद्वितीय हल है, या अपरिमित हल हैं?",
        ),
      ),
      w.body(
        t(
          r`$$\begin{aligned} 5x - 8y + 1 &= 0 \quad (1) \\ 3x - \tfrac{24}{5}y + \tfrac{3}{5} &= 0 \quad (2) \end{aligned}$$`,
          r`$$\begin{aligned} 5x - 8y + 1 &= 0 \quad (1) \\ 3x - \tfrac{24}{5}y + \tfrac{3}{5} &= 0 \quad (2) \end{aligned}$$`,
        ),
      ),
      w.body(
        t(r`Multiply equation (2) by $\tfrac{5}{3}$:`, r`समीकरण (2) को $\tfrac{5}{3}$ से गुणा करो:`),
      ),
      w.body(t(r`$$5x - 8y + 1 = 0$$`, r`$$5x - 8y + 1 = 0$$`)),
      w.body(
        t("That is equation (1). The two lines coincide.", "यही समीकरण (1) है। दोनों रेखाएँ संपाती हैं।"),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** NCERT Example 6: Champa's pants and skirts, (1, 0). */
const champa = page(
  "champa",
  (b) => {
    const w = wordsOn(b);
    const graph = plane(
      b,
      "graph",
      [equals(2, -1, 2), equals(4, -1, 4)],
      { xMin: -2, xMax: 4, yMin: -5, yMax: 4 },
      { showTables: true, showSolution: true },
    );
    b.standsFor(
      graph,
      "NCERT Fig 3.6: y = 2x − 2 through (2, 2) and (0, −2), and y = 4x − 4 through (0, −4) and (1, 0); they meet at (1, 0)",
    );
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t("How many skirts did Champa buy?", "चंपा ने कितनी स्कर्ट ख़रीदीं?"),
      options: [
        {
          id: "right",
          label: t("None: the solution is $x = 1$, $y = 0$", "एक भी नहीं: हल $x = 1$, $y = 0$ है"),
        },
        {
          id: "one",
          label: t("One", "एक"),
          feedback: t(
            "1 is $x$, the pants. Skirts are $y$, which is 0.",
            "1 तो $x$ है, पैंट। स्कर्ट $y$ हैं, जो 0 है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Example: Champa at the sale", "उदाहरण: सेल में चंपा")),
      w.body(
        t(
          'NCERT\'s Example 6. Champa says: "The number of skirts is two less than twice the number of pants. Also, the number of skirts is four less than four times the number of pants." With $x$ pants and $y$ skirts:',
          'NCERT का उदाहरण 6। चंपा कहती है: "स्कर्ट की संख्या पैंट की संख्या के दोगुने से दो कम है। साथ ही, स्कर्ट की संख्या पैंट की संख्या के चार गुने से चार कम है।" $x$ पैंट और $y$ स्कर्ट हों तो:',
        ),
      ),
      w.body(
        t(
          r`$$\begin{aligned} y &= 2x - 2 \quad (1) \\ y &= 4x - 4 \quad (2) \end{aligned}$$`,
          r`$$\begin{aligned} y &= 2x - 2 \quad (1) \\ y &= 4x - 4 \quad (2) \end{aligned}$$`,
        ),
      ),
      w.body(
        t(
          "Below they are drawn in the form $ax + by = k$: $2x - y = 2$ and $4x - y = 4$, the same lines.",
          "नीचे इन्हें $ax + by = k$ रूप में खींचा गया है: $2x - y = 2$ और $4x - y = 4$, वही रेखाएँ।",
        ),
      ),
      graph,
      ask,
      w.note(
        t(
          "Always check an answer against the story: 0 skirts is 2 less than twice 1, and 4 less than four times 1. It fits.",
          "उत्तर को हमेशा कहानी से जाँचो: 0 स्कर्ट, 1 के दोगुने से 2 कम है, और 1 के चार गुने से 4 कम। सही बैठता है।",
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** The cash box, solved by drawing; and Kabir's rides. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const graph = plane(
      b,
      "graph",
      CASH_BOX,
      { xMin: -5, xMax: 60, yMin: -5, yMax: 55 },
      { showSolution: true, showTables: true },
    );
    b.standsFor(graph, "the cash box lines x + y = 50 and 10x + 15y = 600 meeting at (30, 20)");
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "Read the graph. How many glasses of lemonade and how many samosas did the stall sell?",
        "ग्राफ़ पढ़ो। स्टॉल ने नींबू पानी के कितने गिलास और कितने समोसे बेचे?",
      ),
      options: [
        { id: "right", label: t("30 glasses, 20 samosas", "30 गिलास, 20 समोसे") },
        {
          id: "swap",
          label: t("20 glasses, 30 samosas", "20 गिलास, 30 समोसे"),
          feedback: t(
            "Riya chose $x$ for lemonade. The point is $(30, 20)$, so $x = 30$. Check: 20 glasses and 30 samosas would be ₹650.",
            "रिया ने नींबू पानी के लिए $x$ चुना था। बिंदु $(30, 20)$ है, यानी $x = 30$। जाँचो: 20 गिलास और 30 समोसे ₹650 होते।",
          ),
        },
        {
          id: "half",
          label: t("25 glasses, 25 samosas", "25 गिलास, 25 समोसे"),
          feedback: t(
            "That makes 50 things, but $10(25) + 15(25) = 625$, not 600. It's on one line only.",
            "इससे 50 चीज़ें तो बनती हैं, पर $10(25) + 15(25) = 625$ है, 600 नहीं। यह केवल एक रेखा पर है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const after = w.body(
      t(
        r`Check: $30 + 20 = 50$ things, and $10(30) + 15(20) = 300 + 300 = 600$ rupees. And Kabir? He had **4 rides and 2 games**, the point $(4, 2)$. He announces it to everyone. But Riya isn't satisfied yet: here the crossing landed neatly on whole numbers. What if it hadn't?`,
        r`जाँच: $30 + 20 = 50$ चीज़ें, और $10(30) + 15(20) = 300 + 300 = 600$ रुपये। और कबीर? उसकी **4 सवारियाँ और 2 खेल** थे, बिंदु $(4, 2)$। वह सबको यह बताता फिरता है। पर रिया अभी संतुष्ट नहीं: यहाँ कटान ठीक पूर्ण संख्याओं पर पड़ा। अगर न पड़ता तो?`,
      ),
      "after",
      { isHidden: true },
    );
    b.when(ask.on(QuestionSignal.Correct), [theBoard.show(after), theBoard.pass()]);
    return column([
      w.title(t("The cash box, drawn", "गल्ला, चित्र से")),
      w.body(
        t(
          "Riya draws the cash box pair on graph paper, $x$ for glasses of lemonade and $y$ for samosas, and looks for the crossing.",
          "रिया गल्ले वाला युग्म ग्राफ़ पेपर पर खींचती है, नींबू पानी के गिलासों के लिए $x$ और समोसों के लिए $y$, और कटान ढूँढती है।",
        ),
      ),
      w.body(
        t(
          r`$$\begin{aligned} x + y &= 50 \\ 10x + 15y &= 600 \end{aligned}$$`,
          r`$$\begin{aligned} x + y &= 50 \\ 10x + 15y &= 600 \end{aligned}$$`,
        ),
      ),
      graph,
      ask,
      after,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Exercise 3.2: the quiz, the garden and the triangle; then the mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const triangle = plane(
      b,
      "triangle",
      [general(1, -1, 1), general(3, 2, -12)],
      { xMin: -2, xMax: 5, yMin: -1, yMax: 6 },
      { form: EquationForm.General, shade: ShadeAxis.X, showSolution: true },
    );
    b.standsFor(
      triangle,
      "Exercise 3.2 Q7: the lines x − y + 1 = 0 and 3x + 2y − 12 = 0 and the triangle they make with the x-axis, shaded",
    );
    const ask1 = choiceQuestion(b, {
      name: "ask1",
      prompt: t(
        "10 students took part in a quiz, and there were 4 more girls than boys. With $x$ boys and $y$ girls, the lines $x + y = 10$ and $y = x + 4$ meet at…",
        "एक क्विज़ में 10 विद्यार्थियों ने भाग लिया, और लड़कियाँ लड़कों से 4 ज़्यादा थीं। $x$ लड़के और $y$ लड़कियाँ हों, तो रेखाएँ $x + y = 10$ और $y = x + 4$ मिलती हैं…",
      ),
      options: [
        { id: "right", label: t("$(3, 7)$: 3 boys and 7 girls", "$(3, 7)$: 3 लड़के और 7 लड़कियाँ") },
        {
          id: "swap",
          label: t("$(7, 3)$: 7 boys and 3 girls", "$(7, 3)$: 7 लड़के और 3 लड़कियाँ"),
          feedback: t(
            "Then the girls would be fewer, not 4 more. Check $y = x + 4$.",
            "तब लड़कियाँ कम होतीं, 4 ज़्यादा नहीं। $y = x + 4$ जाँचो।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const ask2 = choiceQuestion(b, {
      name: "ask2",
      prompt: t(
        "The triangle above is made by $x - y + 1 = 0$, $3x + 2y - 12 = 0$ and the $x$-axis. Its corners are…",
        "ऊपर का त्रिभुज $x - y + 1 = 0$, $3x + 2y - 12 = 0$ और $x$-अक्ष से बना है। उसके शीर्ष हैं…",
      ),
      options: [
        {
          id: "right",
          label: t("$(-1, 0)$, $(4, 0)$ and $(2, 3)$", "$(-1, 0)$, $(4, 0)$ और $(2, 3)$"),
        },
        {
          id: "y",
          label: t("$(0, 1)$, $(0, 6)$ and $(2, 3)$", "$(0, 1)$, $(0, 6)$ और $(2, 3)$"),
          feedback: t(
            "Those are where the lines cut the $y$-axis. The triangle sits on the $x$-axis, where $y = 0$.",
            "वहाँ रेखाएँ $y$-अक्ष को काटती हैं। त्रिभुज $x$-अक्ष पर है, जहाँ $y = 0$।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ The solution of a pair is where its lines meet; always verify it in both equations. ✓ Consistent, inconsistent, dependent, and the ratio test. ✓ The cash box: 30 glasses of lemonade, 20 samosas. ✗ Drawing only works when the answer lands on neat numbers. Next: an exact method with no drawing.",
        "**मिशन लॉग।** ✓ युग्म का हल वहाँ है जहाँ उसकी रेखाएँ मिलती हैं; दोनों समीकरणों में हमेशा जाँचो। ✓ संगत, असंगत, आश्रित, और अनुपात परीक्षण। ✓ गल्ला: नींबू पानी के 30 गिलास, 20 समोसे। ✗ चित्र तभी काम आता है जब उत्तर साफ़ संख्याओं पर पड़े। आगे: बिना चित्र की एक सटीक विधि।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(ask1.on(QuestionSignal.Correct), theBoard.show(ask2));
    b.when(ask2.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), ask1, triangle, ask2, log, space()]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [hook, meet, kinds, ratios, example4, example5, champa, inLife, yourTurn];

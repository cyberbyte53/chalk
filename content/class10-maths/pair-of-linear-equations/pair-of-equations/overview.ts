import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import { LinearSceneKind } from "@chalk/prop-linear-equations";
import { CASH_BOX, equals, general, plane, scene } from "../kit";

const r = String.raw;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** Who, where, what: the school mela, the stall, the lost tally sheet. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const stall = scene(
    b,
    "stall",
    LinearSceneKind.MelaStall,
    "the school mela by day; Riya and Kabir behind their class's lemonade-and-samosa stall, a price board saying lemonade ₹10 and samosa ₹15, a small cash box on the table",
  );
  return column([
    w.title(t("Mela day", "मेले का दिन")),
    stall,
    w.body(
      t(
        "It's the first day of the school's two-day mela. Riya's class, 10B, runs a stall: lemonade at ₹10 a glass and samosas at ₹15 each. Riya takes the money, and her little brother Kabir, who begged to help, clicks a counter every time something is sold.",
        "आज स्कूल के दो दिन के मेले का पहला दिन है। रिया की कक्षा, 10B, एक स्टॉल चलाती है: नींबू पानी ₹10 का एक गिलास और समोसे ₹15 का एक। पैसे रिया लेती है, और उसका छोटा भाई कबीर, जिसने मदद करने की ज़िद की थी, हर बिक्री पर एक गिनती-मशीन दबाता है।",
      ),
    ),
    w.body(
      t(
        'At closing time the cash box holds **₹600** and the counter says **50** things were sold. Then the class teacher asks: "How many glasses of lemonade, and how many samosas? I need to know what to order for next year." Kabir had been writing that down too, on a sheet of paper. The sheet is gone.',
        'बंद होने के समय गल्ले में **₹600** हैं और गिनती-मशीन कहती है कि **50** चीज़ें बिकीं। तभी कक्षा-अध्यापिका पूछती हैं: "नींबू पानी के कितने गिलास, और कितने समोसे? मुझे अगले साल का सामान मँगाना है।" कबीर यह भी एक काग़ज़ पर लिख रहा था। काग़ज़ ग़ायब है।',
      ),
    ),
    space(),
  ]);
});

/** Why the chapter: two unknowns, two clues. The mission and the stops. */
const why = page("why", (b) => {
  const w = wordsOn(b);
  const night = scene(
    b,
    "night",
    LinearSceneKind.MelaNight,
    "the goal: mela night, the family round the open cash box with neat piles of notes and coins, Kabir cheering",
  );
  return column([
    w.title(t("Two unknowns, two clues", "दो अज्ञात, दो सुराग")),
    w.body(
      t(
        "Riya thinks about it. There are **two numbers she doesn't know**: how many glasses, and how many samosas. But she has **two clues**: together they make 50 things, and together they make ₹600. Could two clues be enough to find two unknown numbers?",
        "रिया सोचती है। **दो संख्याएँ उसे नहीं पता**: कितने गिलास, और कितने समोसे। पर उसके पास **दो सुराग** हैं: मिलकर वे 50 चीज़ें हैं, और मिलकर ₹600। क्या दो सुराग दो अनजानी संख्याएँ खोजने के लिए काफ़ी हो सकते हैं?",
      ),
    ),
    night,
    w.body(
      t(
        "That's the mission for this chapter: close the stall's accounts. Along the way the mela throws up more puzzles of the same kind, and each lesson gives Riya one more way to crack them.",
        "यही इस अध्याय का मिशन है: स्टॉल का हिसाब पूरा करना। रास्ते में मेला ऐसी ही और पहेलियाँ सामने लाता है, और हर पाठ रिया को उन्हें सुलझाने का एक और तरीक़ा देता है।",
      ),
    ),
    w.definition(
      t(
        "**The stops on the way.** (1) Writing clues as equations: *this lesson*. (2) The three ways two lines can sit. (3) Solving by drawing. (4) The substitution method. (5) The elimination method. (6) The cross-multiplication method. (7) Equations in disguise, and closing the accounts.",
        "**रास्ते के पड़ाव।** (1) सुरागों को समीकरण के रूप में लिखना: *यह पाठ*। (2) दो रेखाएँ किन तीन तरह से हो सकती हैं। (3) चित्र बनाकर हल। (4) प्रतिस्थापन विधि। (5) विलोपन विधि। (6) वज्र-गुणन विधि। (7) भेष बदले समीकरण, और हिसाब पूरा करना।",
      ),
    ),
    w.body(
      t(
        "First stop: how do you write a clue like that in the language of maths?",
        "पहला पड़ाव: ऐसे सुराग को गणित की भाषा में कैसे लिखें?",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Variable, linear equation in two variables, the form a x + b y + c = 0. */
const linear = page(
  "linear",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "Which of these is a linear equation in two variables?",
        "इनमें से कौन-सा दो चरों वाला रैखिक समीकरण है?",
      ),
      options: [
        { id: "right", label: t("$x - 2y - 3 = 0$", "$x - 2y - 3 = 0$") },
        {
          id: "square",
          label: t("$x^2 + y = 4$", "$x^2 + y = 4$"),
          feedback: t(
            "$x^2$ is $x$ multiplied by itself: a power higher than 1, so the equation is not linear.",
            "$x^2$ यानी $x$ गुणा ख़ुद $x$: घात 1 से बड़ी है, इसलिए समीकरण रैखिक नहीं है।",
          ),
        },
        {
          id: "times",
          label: t("$xy = 6$", "$xy = 6$"),
          feedback: t(
            "Here $x$ and $y$ are multiplied together. In a linear equation each variable is only multiplied by a number.",
            "यहाँ $x$ और $y$ आपस में गुणा हो रहे हैं। रैखिक समीकरण में हर चर केवल किसी संख्या से गुणा होता है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("A linear equation in two variables", "दो चरों वाला रैखिक समीकरण")),
      w.definition(
        t(
          "**Variable.** A letter that stands for a number we don't know yet, like $x$ or $y$, is a **variable**. An **equation** says that two expressions are equal, with an $=$ sign between them.",
          "**चर।** जो अक्षर किसी ऐसी संख्या के लिए खड़ा हो जो हमें अभी पता नहीं, जैसे $x$ या $y$, वह **चर** है। **समीकरण** बताता है कि दो व्यंजक बराबर हैं, उनके बीच $=$ चिह्न के साथ।",
        ),
      ),
      w.definition(
        t(
          r`**Linear equation in two variables.** An equation that can be written in the form $$ax + by + c = 0,$$ where $a$, $b$ and $c$ are real numbers and $a$ and $b$ are **not both zero**, is a **linear equation in two variables** $x$ and $y$. Each variable appears only multiplied by a number: no squares, no $xy$.`,
          r`**दो चरों वाला रैखिक समीकरण।** जो समीकरण इस रूप में लिखा जा सके, $$ax + by + c = 0,$$ जहाँ $a$, $b$ और $c$ वास्तविक संख्याएँ हैं और $a$ व $b$ **दोनों शून्य नहीं** हैं, वह $x$ और $y$ में **दो चरों वाला रैखिक समीकरण** है। हर चर केवल किसी संख्या से गुणा होकर आता है: न वर्ग, न $xy$।`,
        ),
      ),
      w.body(
        t(
          "Some examples, each one rearranged into that form:",
          "कुछ उदाहरण, हर एक उसी रूप में बदला हुआ:",
        ),
      ),
      w.body(
        t(
          r`$$\begin{aligned} 2x + 3y = 5 \quad&\text{is}\quad 2x + 3y - 5 = 0 \\ x - 2y - 3 = 0 \quad&\text{is already in the form} \\ x = 2 \quad&\text{is}\quad x + 0y - 2 = 0 \end{aligned}$$`,
          r`$$\begin{aligned} 2x + 3y = 5 \quad&\to\quad 2x + 3y - 5 = 0 \\ x - 2y - 3 = 0 \quad&\to\quad x - 2y - 3 = 0 \\ x = 2 \quad&\to\quad x + 0y - 2 = 0 \end{aligned}$$`,
        ),
      ),
      w.note(
        t(
          "In the last one $b = 0$, which is allowed: only $a$ and $b$ both being 0 is ruled out.",
          "आख़िरी में $b = 0$ है, जो चलता है: केवल $a$ और $b$ दोनों का 0 होना मना है।",
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** A solution is a pair; check it by substituting. 2x + 3y = 5 with (1, 1) and (1, 7). */
const solution = page(
  "solution",
  (b) => {
    const w = wordsOn(b);
    const line = plane(
      b,
      "line",
      [equals(2, 3, 5)],
      { xMin: -3, xMax: 6, yMin: -3, yMax: 8 },
      { probe: [1, 7], canMoveProbe: true },
    );
    b.standsFor(
      line,
      "the line 2x + 3y = 5 and a test point the learner drags; it says whether the point's x and y satisfy the equation",
    );
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "Is $x = 4$, $y = -1$ a solution of $2x + 3y = 5$?",
        "क्या $x = 4$, $y = -1$ समीकरण $2x + 3y = 5$ का हल है?",
      ),
      options: [
        {
          id: "right",
          label: t("Yes: $2(4) + 3(-1) = 8 - 3 = 5$", "हाँ: $2(4) + 3(-1) = 8 - 3 = 5$"),
        },
        {
          id: "no",
          label: t("No: $2(4) + 3(-1) = 11$", "नहीं: $2(4) + 3(-1) = 11$"),
          feedback: t(
            "$3 \\times (-1)$ is $-3$, not $+3$. Work it out again.",
            "$3 \\times (-1)$ होता है $-3$, $+3$ नहीं। फिर से निकालो।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("A solution is a pair of numbers", "हल संख्याओं का एक जोड़ा है")),
      w.definition(
        t(
          "**Solution.** A **solution** of a linear equation in two variables is a pair of values, one for $x$ and one for $y$, that makes the two sides of the equation equal. We write it as $x = 1$, $y = 1$, or as the pair $(1, 1)$.",
          "**हल।** दो चरों वाले रैखिक समीकरण का **हल** मानों का एक जोड़ा है, एक $x$ के लिए और एक $y$ के लिए, जो समीकरण के दोनों पक्षों को बराबर कर दे। इसे हम $x = 1$, $y = 1$ लिखते हैं, या जोड़े $(1, 1)$ के रूप में।",
        ),
      ),
      w.body(
        t(
          "To check a pair, put the numbers into the left-hand side (LHS) and see whether it equals the right-hand side (RHS). Try $x = 1$, $y = 1$ in $2x + 3y = 5$:",
          "किसी जोड़े को जाँचने के लिए संख्याएँ बाएँ पक्ष (LHS) में रखो और देखो कि वह दाएँ पक्ष (RHS) के बराबर है या नहीं। $2x + 3y = 5$ में $x = 1$, $y = 1$ रखकर देखो:",
        ),
      ),
      w.body(
        t(
          r`$$\text{LHS} = 2(1) + 3(1) = 5 = \text{RHS}$$`,
          r`$$\text{LHS} = 2(1) + 3(1) = 5 = \text{RHS}$$`,
        ),
      ),
      w.body(
        t(
          "So $(1, 1)$ is a solution. Now $x = 1$, $y = 7$:",
          "तो $(1, 1)$ एक हल है। अब $x = 1$, $y = 7$:",
        ),
      ),
      w.body(
        t(r`$$\text{LHS} = 2(1) + 3(7) = 23 \neq 5$$`, r`$$\text{LHS} = 2(1) + 3(7) = 23 \neq 5$$`),
      ),
      w.body(
        t(
          "So $(1, 7)$ is not. On the graph, the point $(1, 1)$ sits on the line of $2x + 3y = 5$, and $(1, 7)$ doesn't. **Drag the test point** around: the label under the graph says, each time, whether it's on the line.",
          "तो $(1, 7)$ हल नहीं है। ग्राफ़ पर, बिंदु $(1, 1)$ समीकरण $2x + 3y = 5$ की रेखा पर है, और $(1, 7)$ नहीं। **जाँच-बिंदु को खिसकाओ**: ग्राफ़ के नीचे का लेबल हर बार बताता है कि वह रेखा पर है या नहीं।",
        ),
      ),
      line,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Every solution is a point on the line and every point is a solution; two solutions draw it. */
const lineOf = page(
  "line",
  (b) => {
    const w = wordsOn(b);
    const line = plane(
      b,
      "line",
      [equals(3, 4, 20)],
      { xMin: -2, xMax: 8, yMin: -2, yMax: 7 },
      { showTables: true },
    );
    b.standsFor(
      line,
      "the line 3x + 4y = 20 drawn through two of its solutions, (0, 5) and (4, 2), with a small table of the two",
    );
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t("How many solutions does $3x + 4y = 20$ have?", "$3x + 4y = 20$ के कितने हल हैं?"),
      options: [
        {
          id: "right",
          label: t(
            "Infinitely many: one for every point on its line",
            "अपरिमित रूप से अनेक: उसकी रेखा के हर बिंदु के लिए एक",
          ),
        },
        {
          id: "two",
          label: t("Two: $(0, 5)$ and $(4, 2)$", "दो: $(0, 5)$ और $(4, 2)$"),
          feedback: t(
            "Those are just the two we picked to draw the line. Every other point on it works too.",
            "ये तो बस वे दो हैं जो रेखा खींचने के लिए चुने। उस पर हर दूसरा बिंदु भी चलता है।",
          ),
        },
        {
          id: "one",
          label: t("Exactly one", "ठीक एक"),
          feedback: t(
            "One equation with two variables has many solutions: choose any $x$ and you can find a $y$.",
            "दो चरों वाले एक समीकरण के कई हल होते हैं: कोई भी $x$ चुनो और एक $y$ मिल जाएगा।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Solutions make a line", "हल मिलकर रेखा बनाते हैं")),
      w.body(
        t(
          "You met this in Class 9: the graph of a linear equation in two variables is a **straight line**. That is why it is called *linear*.",
          "यह तुम कक्षा 9 में देख चुके हो: दो चरों वाले रैखिक समीकरण का ग्राफ़ एक **सीधी रेखा** होता है। इसीलिए इसे *रैखिक* कहते हैं।",
        ),
      ),
      w.definition(
        t(
          "**Solutions and points.** Every solution $(x, y)$ of $ax + by + c = 0$ is a point on the line that represents it, and every point on that line is a solution. So a linear equation in two variables has **infinitely many** solutions.",
          "**हल और बिंदु।** $ax + by + c = 0$ का हर हल $(x, y)$ उसे दर्शाने वाली रेखा पर एक बिंदु है, और उस रेखा का हर बिंदु एक हल है। इसलिए दो चरों वाले रैखिक समीकरण के **अपरिमित रूप से अनेक** हल होते हैं।",
        ),
      ),
      w.body(
        t(
          "To draw the line you need just **two** solutions. The easy way: put $x = 0$ and the equation becomes one in $y$ alone. In $3x + 4y = 20$, $x = 0$ gives",
          "रेखा खींचने के लिए बस **दो** हल चाहिए। आसान तरीक़ा: $x = 0$ रखो, तो समीकरण केवल $y$ का रह जाता है। $3x + 4y = 20$ में $x = 0$ से",
        ),
      ),
      w.body(t(r`$$4y = 20,\quad y = 5$$`, r`$$4y = 20,\quad y = 5$$`)),
      w.body(
        t(
          r`Putting $y = 0$ would give $x = \tfrac{20}{3}$, hard to plot exactly. So pick a $y$ that gives a whole number: $y = 2$ gives $3x = 12$, so $x = 4$. Plot $(0, 5)$ and $(4, 2)$ and join them.`,
          r`$y = 0$ रखने पर $x = \tfrac{20}{3}$ आता, जिसे ठीक-ठीक बिंदु बनाना मुश्किल है। इसलिए ऐसा $y$ चुनो जो पूर्ण संख्या दे: $y = 2$ से $3x = 12$, यानी $x = 4$। $(0, 5)$ और $(4, 2)$ बनाकर जोड़ दो।`,
        ),
      ),
      line,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** A pair of linear equations; the general form with a₁, b₁, c₁ and a₂, b₂, c₂. */
const pair = page(
  "pair",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "Write $3x + 4y = 20$ in the general form $a_1x + b_1y + c_1 = 0$. What is $c_1$?",
        "$3x + 4y = 20$ को व्यापक रूप $a_1x + b_1y + c_1 = 0$ में लिखो। $c_1$ क्या है?",
      ),
      options: [
        { id: "right", label: t("$-20$", "$-20$") },
        {
          id: "plus",
          label: t("$20$", "$20$"),
          feedback: t(
            "To get $= 0$ on the right, the 20 moves to the left: $3x + 4y - 20 = 0$.",
            "दाईं ओर $= 0$ लाने के लिए 20 बाईं ओर जाता है: $3x + 4y - 20 = 0$।",
          ),
        },
        {
          id: "four",
          label: t("$4$", "$4$"),
          feedback: t(
            "4 is $b_1$, the number with $y$. $c_1$ is the number on its own.",
            "4 तो $b_1$ है, $y$ के साथ वाली संख्या। $c_1$ अकेली संख्या है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("A pair of linear equations", "रैखिक समीकरणों का युग्म")),
      w.definition(
        t(
          "**Pair of linear equations in two variables.** Two linear equations in the **same** two variables $x$ and $y$, taken together, form a **pair of linear equations in two variables**. A solution of the pair is a pair of values that satisfies **both** equations at once.",
          "**दो चरों वाले रैखिक समीकरणों का युग्म।** **उन्हीं** दो चरों $x$ और $y$ में दो रैखिक समीकरण, एक साथ लिए जाएँ, तो वे **दो चरों वाले रैखिक समीकरणों का युग्म** बनाते हैं। युग्म का हल मानों का ऐसा जोड़ा है जो **दोनों** समीकरणों को एक साथ संतुष्ट करे।",
        ),
      ),
      w.body(
        t(
          "The **general form** of such a pair is written with small numbers under the letters, 1 for the first equation and 2 for the second:",
          "ऐसे युग्म का **व्यापक रूप** अक्षरों के नीचे छोटी संख्याओं के साथ लिखा जाता है, पहले समीकरण के लिए 1 और दूसरे के लिए 2:",
        ),
      ),
      w.body(
        t(
          r`$$\begin{aligned} a_1x + b_1y + c_1 &= 0 \\ a_2x + b_2y + c_2 &= 0 \end{aligned}$$`,
          r`$$\begin{aligned} a_1x + b_1y + c_1 &= 0 \\ a_2x + b_2y + c_2 &= 0 \end{aligned}$$`,
        ),
      ),
      w.body(
        t(
          "Here $a_1, b_1, c_1, a_2, b_2, c_2$ are real numbers, and in each equation the numbers with $x$ and $y$ are not both zero. Some pairs:",
          "यहाँ $a_1, b_1, c_1, a_2, b_2, c_2$ वास्तविक संख्याएँ हैं, और हर समीकरण में $x$ और $y$ वाली संख्याएँ दोनों शून्य नहीं हैं। कुछ युग्म:",
        ),
      ),
      w.body(
        t(
          r`$$\begin{aligned} &2x + 3y - 7 = 0 \text{ and } 9x - 2y + 8 = 0 \\ &5x = y \text{ and } -7x + 2y + 3 = 0 \\ &x + y = 7 \text{ and } 17 = y \end{aligned}$$`,
          r`$$\begin{aligned} &2x + 3y - 7 = 0,\ \ 9x - 2y + 8 = 0 \\ &5x = y,\ \ -7x + 2y + 3 = 0 \\ &x + y = 7,\ \ 17 = y \end{aligned}$$`,
        ),
      ),
      w.body(
        t(
          "Each equation is a line, so a pair is **two lines**, drawn on the same graph.",
          "हर समीकरण एक रेखा है, इसलिए युग्म **दो रेखाएँ** हैं, एक ही ग्राफ़ पर बनी हुईं।",
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** NCERT Example 1: Akhila at the fair, written algebraically and drawn. */
const akhila = page(
  "akhila",
  (b) => {
    const w = wordsOn(b);
    const graph = plane(
      b,
      "graph",
      [general(1, -2, 0), equals(3, 4, 20)],
      { xMin: -2, xMax: 8, yMin: -2, yMax: 7 },
      { showTables: true },
    );
    b.standsFor(
      graph,
      "NCERT Fig 3.2: the lines x − 2y = 0 (through (0, 0) and (2, 1)) and 3x + 4y = 20 (through (0, 5) and (4, 2)), each with its table of two solutions",
    );
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "Which equation says that Akhila spent ₹20?",
        "कौन-सा समीकरण कहता है कि अखिला ने ₹20 ख़र्च किए?",
      ),
      options: [
        { id: "right", label: t("$3x + 4y = 20$", "$3x + 4y = 20$") },
        {
          id: "sum",
          label: t("$x + y = 20$", "$x + y = 20$"),
          feedback: t(
            "$x + y$ counts rides and games. The money is ₹3 for each of the $x$ rides plus ₹4 for each of the $y$ games.",
            "$x + y$ झूले और खेल गिनता है। पैसे हैं: $x$ झूलों में से हर एक के ₹3 और $y$ खेलों में से हर एक के ₹4।",
          ),
        },
        {
          id: "swap",
          label: t("$4x + 3y = 20$", "$4x + 3y = 20$"),
          feedback: t(
            "$x$ is the rides, which cost ₹3 each, so it's $3x$.",
            "$x$ झूले हैं, जो ₹3 के हैं, इसलिए $3x$।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Words into equations, equations into lines", "शब्दों से समीकरण, समीकरणों से रेखाएँ")),
      w.body(
        t(
          "NCERT's Example 1. Akhila goes to a fair with ₹20. A ride on the Giant Wheel costs ₹3 and a game of Hoopla costs ₹4. She plays Hoopla half as many times as she rides the wheel, and spends all ₹20.",
          "NCERT का उदाहरण 1। अखिला ₹20 लेकर मेले जाती है। बड़े झूले की एक सवारी ₹3 की है और हूपला का एक खेल ₹4 का। वह जितनी बार झूला झूलती है, उसकी आधी बार हूपला खेलती है, और पूरे ₹20 ख़र्च करती है।",
        ),
      ),
      w.body(
        t(
          "Let the number of rides be $x$ and the number of Hoopla games be $y$. The two facts become two equations:",
          "मान लो सवारियों की संख्या $x$ है और हूपला खेलों की संख्या $y$। दोनों बातें दो समीकरण बन जाती हैं:",
        ),
      ),
      w.body(
        t(
          r`$$\begin{aligned} y = \tfrac{1}{2}x, \quad\text{i.e.}\quad x - 2y &= 0 \quad (1) \\ 3x + 4y &= 20 \quad (2) \end{aligned}$$`,
          r`$$\begin{aligned} y = \tfrac{1}{2}x, \quad\text{यानी}\quad x - 2y &= 0 \quad (1) \\ 3x + 4y &= 20 \quad (2) \end{aligned}$$`,
        ),
      ),
      w.body(
        t(
          "That is the pair written **algebraically**. To show it **graphically**, find two solutions of each equation, plot them, and draw the two lines:",
          "यह युग्म **बीजगणितीय रूप** में लिखा गया। इसे **ग्राफ़ द्वारा** दिखाने के लिए हर समीकरण के दो हल निकालो, उन्हें बिंदु बनाओ, और दोनों रेखाएँ खींचो:",
        ),
      ),
      graph,
      w.body(
        t(
          "The two lines cross at one point. What that point means is the next lessons' job.",
          "दोनों रेखाएँ एक बिंदु पर कटती हैं। उस बिंदु का क्या अर्थ है, यह अगले पाठों का काम है।",
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** Back to the stall: Riya writes the cash box clues as a pair. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const stall = scene(
      b,
      "stall",
      LinearSceneKind.MelaStall,
      "the stall again, the price board showing ₹10 and ₹15",
    );
    const graph = plane(b, "graph", CASH_BOX, { xMin: -5, xMax: 60, yMin: -5, yMax: 55 });
    b.standsFor(graph, "the two cash box lines, x + y = 50 and 10x + 15y = 600, drawn together");
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "Riya lets $x$ be the glasses of lemonade and $y$ the samosas. Which pair says what she knows?",
        "रिया नींबू पानी के गिलासों को $x$ और समोसों को $y$ मानती है। कौन-सा युग्म वह कहता है जो उसे पता है?",
      ),
      options: [
        {
          id: "right",
          label: t("$x + y = 50$ and $10x + 15y = 600$", "$x + y = 50$ और $10x + 15y = 600$"),
        },
        {
          id: "swap",
          label: t("$x + y = 600$ and $10x + 15y = 50$", "$x + y = 600$ और $10x + 15y = 50$"),
          feedback: t(
            "$x + y$ counts things sold, which is 50. The money, $10x + 15y$, is the ₹600.",
            "$x + y$ बिकी चीज़ें गिनता है, जो 50 हैं। पैसे, $10x + 15y$, ₹600 हैं।",
          ),
        },
        {
          id: "prices",
          label: t("$x + y = 50$ and $15x + 10y = 600$", "$x + y = 50$ और $15x + 10y = 600$"),
          feedback: t(
            "$x$ is lemonade, which is ₹10 a glass, so its money is $10x$.",
            "$x$ नींबू पानी है, जो ₹10 का गिलास है, इसलिए उसके पैसे $10x$ हैं।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const after = w.body(
      t(
        'That\'s the stall in two equations, and in the picture above, two lines. Kabir stares at the graph: "So the answer is where they cross?" Maybe. But first Riya wants to know: do two lines **always** cross?',
        'यह रहा स्टॉल दो समीकरणों में, और ऊपर के चित्र में, दो रेखाओं में। कबीर ग्राफ़ को घूरता है: "तो जवाब वहाँ है जहाँ ये कटती हैं?" शायद। पर पहले रिया जानना चाहती है: क्या दो रेखाएँ **हमेशा** कटती हैं?',
      ),
      "after",
      { isHidden: true },
    );
    b.when(ask.on(QuestionSignal.Correct), [theBoard.show(after), theBoard.pass()]);
    return column([
      w.title(t("The cash box, in maths", "गल्ला, गणित में")),
      stall,
      w.body(
        t(
          "Back at the stall, Riya turns the two clues into a pair of equations. Each glass of lemonade adds 1 to the count and ₹10 to the box; each samosa adds 1 and ₹15.",
          "स्टॉल पर लौटकर रिया दोनों सुरागों को समीकरणों के युग्म में बदलती है। नींबू पानी का हर गिलास गिनती में 1 और गल्ले में ₹10 जोड़ता है; हर समोसा 1 और ₹15।",
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

/** Exercise 3.1 Q1 and Q2 written as pairs; then the mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const ask1 = choiceQuestion(b, {
      name: "ask1",
      prompt: t(
        "A coach buys 3 bats and 6 balls for ₹3900, and later 1 bat and 3 balls for ₹1300. With a bat costing ₹$x$ and a ball ₹$y$, which pair is right?",
        "एक कोच ₹3900 में 3 बल्ले और 6 गेंदें ख़रीदती है, और बाद में ₹1300 में 1 बल्ला और 3 गेंदें। बल्ले का दाम ₹$x$ और गेंद का ₹$y$ हो, तो कौन-सा युग्म सही है?",
      ),
      options: [
        {
          id: "right",
          label: t("$3x + 6y = 3900$ and $x + 3y = 1300$", "$3x + 6y = 3900$ और $x + 3y = 1300$"),
        },
        {
          id: "swap",
          label: t("$6x + 3y = 3900$ and $3x + y = 1300$", "$6x + 3y = 3900$ और $3x + y = 1300$"),
          feedback: t(
            "$x$ goes with the bats: 3 bats is $3x$, 6 balls is $6y$.",
            "$x$ बल्लों के साथ है: 3 बल्ले यानी $3x$, 6 गेंदें यानी $6y$।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const ask2 = choiceQuestion(b, {
      name: "ask2",
      prompt: t(
        'Aftab tells his daughter: "Seven years ago I was seven times as old as you were then." Aftab is $s$ years old now and his daughter $t$. Which equation says this?',
        'आफ़ताब अपनी बेटी से कहते हैं: "सात साल पहले मैं तुमसे सात गुना बड़ा था।" आफ़ताब अभी $s$ वर्ष के हैं और बेटी $t$ वर्ष की। कौन-सा समीकरण यह कहता है?',
      ),
      options: [
        { id: "right", label: t("$s - 7 = 7(t - 7)$", "$s - 7 = 7(t - 7)$") },
        {
          id: "now",
          label: t("$s = 7t$", "$s = 7t$"),
          feedback: t(
            "That would be true today. The clue is about seven years ago, when both were 7 years younger.",
            "यह आज के लिए होता। सुराग सात साल पहले का है, जब दोनों 7 साल छोटे थे।",
          ),
        },
        {
          id: "half",
          label: t("$s - 7 = 7t - 7$", "$s - 7 = 7t - 7$"),
          feedback: t(
            "Seven years ago the daughter was $t - 7$, and that whole age is multiplied by 7.",
            "सात साल पहले बेटी $t - 7$ की थी, और यह पूरी उम्र 7 से गुणा होती है।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ A linear equation in two variables: $ax + by + c = 0$, with $a$ and $b$ not both zero. ✓ Its solutions are pairs $(x, y)$, and they make a straight line. ✓ The cash box is a pair: $x + y = 50$ and $10x + 15y = 600$. ✗ Not solved yet. Next: the three ways two lines can sit.",
        "**मिशन लॉग।** ✓ दो चरों वाला रैखिक समीकरण: $ax + by + c = 0$, जिसमें $a$ और $b$ दोनों शून्य नहीं। ✓ इसके हल जोड़े $(x, y)$ हैं, और वे एक सीधी रेखा बनाते हैं। ✓ गल्ला एक युग्म है: $x + y = 50$ और $10x + 15y = 600$। ✗ अभी हल नहीं हुआ। आगे: दो रेखाएँ किन तीन तरह से हो सकती हैं।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(ask1.on(QuestionSignal.Correct), theBoard.show(ask2));
    b.when(ask2.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), ask1, ask2, log, space()]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [hook, why, linear, solution, lineOf, pair, akhila, inLife, yourTurn];

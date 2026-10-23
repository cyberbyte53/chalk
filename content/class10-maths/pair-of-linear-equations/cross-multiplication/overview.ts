import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import { EquationForm, LinearSceneKind, Method } from "@chalk/prop-linear-equations";
import { equals, general, scene, working } from "../kit";

const r = String.raw;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** The bus home: two ticket bills, and Riya wants one formula for everything. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const bus = scene(
    b,
    "bus",
    LinearSceneKind.BusTickets,
    "the bus stop outside the school at dusk: a bus pulls in; Riya holds tickets of two colours; a sign shows a near stop and a far stop",
  );
  return column([
    w.title(t("Tickets home", "घर के टिकट")),
    w.body(
      t(
        "Elimination opened the cash box. At dusk the stall packs up and the class takes the bus home. Their teacher bought tickets in two goes: 2 tickets to the near stop and 3 to the far stop cost ₹46; then 3 to the near stop and 5 to the far stop cost ₹74.",
        "विलोपन ने गल्ला खोल दिया। शाम को स्टॉल समेटा जाता है और कक्षा बस से घर जाती है। अध्यापिका ने टिकट दो बार में ख़रीदे: पास वाले स्टॉप के 2 और दूर वाले के 3 टिकट ₹46 के; फिर पास वाले के 3 और दूर वाले के 5 टिकट ₹74 के।",
      ),
    ),
    bus,
    w.body(
      t(
        "Riya could pick multipliers again, but she's tired. \"Every pair needs its own trick. Isn't there **one formula** that just works for any pair?\" There is.",
        'रिया फिर से गुणक चुन सकती है, पर वह थक चुकी है। "हर युग्म के लिए अलग तरकीब चाहिए। क्या कोई **एक सूत्र** नहीं जो हर युग्म पर बस चल जाए?" है।',
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Elimination done once and for all: the general formula. */
const derive = page(
  "derive",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        r`Use the formula on $5x + 3y - 35 = 0$ and $2x + 4y - 28 = 0$. What is $x$, the cost of an orange?`,
        r`$5x + 3y - 35 = 0$ और $2x + 4y - 28 = 0$ पर सूत्र लगाओ। $x$, एक संतरे का दाम, क्या है?`,
      ),
      options: [
        { id: "right", label: t("₹4", "₹4") },
        {
          id: "five",
          label: t("₹5", "₹5"),
          feedback: t(
            r`That's $y$, the apple. For $x$: $\tfrac{b_1c_2 - b_2c_1}{a_1b_2 - a_2b_1} = \tfrac{3(-28) - 4(-35)}{5(4) - 2(3)} = \tfrac{56}{14} = 4$.`,
            r`यह $y$ है, सेब। $x$ के लिए: $\tfrac{b_1c_2 - b_2c_1}{a_1b_2 - a_2b_1} = \tfrac{3(-28) - 4(-35)}{5(4) - 2(3)} = \tfrac{56}{14} = 4$।`,
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Elimination, once and for all", "विलोपन, एक बार में सबके लिए")),
      w.body(
        t(
          "Do elimination on the general pair, with letters instead of numbers, and the answer comes out as a formula. Take",
          "विलोपन को व्यापक युग्म पर करो, संख्याओं की जगह अक्षरों के साथ, तो उत्तर एक सूत्र बनकर निकलता है। लो",
        ),
      ),
      w.body(
        t(
          r`$$\begin{aligned} a_1x + b_1y + c_1 &= 0 \quad (1) \\ a_2x + b_2y + c_2 &= 0 \quad (2) \end{aligned}$$`,
          r`$$\begin{aligned} a_1x + b_1y + c_1 &= 0 \quad (1) \\ a_2x + b_2y + c_2 &= 0 \quad (2) \end{aligned}$$`,
        ),
      ),
      w.body(
        t(
          "To make the $y$-terms the same, multiply (1) by $b_2$ and (2) by $b_1$:",
          "$y$ वाले पद एक जैसे करने के लिए (1) को $b_2$ से और (2) को $b_1$ से गुणा करो:",
        ),
      ),
      w.body(
        t(
          r`$$\begin{aligned} b_2a_1x + b_2b_1y + b_2c_1 &= 0 \quad (3) \\ b_1a_2x + b_1b_2y + b_1c_2 &= 0 \quad (4) \end{aligned}$$`,
          r`$$\begin{aligned} b_2a_1x + b_2b_1y + b_2c_1 &= 0 \quad (3) \\ b_1a_2x + b_1b_2y + b_1c_2 &= 0 \quad (4) \end{aligned}$$`,
        ),
      ),
      w.body(
        t("Subtract (4) from (3). The $y$-terms cancel:", "(3) में से (4) घटाओ। $y$ वाले पद कट जाते हैं:"),
      ),
      w.body(
        t(
          r`$$(a_1b_2 - a_2b_1)\,x = b_1c_2 - b_2c_1$$`,
          r`$$(a_1b_2 - a_2b_1)\,x = b_1c_2 - b_2c_1$$`,
        ),
      ),
      w.body(
        t(
          r`So, provided $a_1b_2 - a_2b_1 \neq 0$, we can divide to get $x$. To find $y$, make the $x$-terms the same instead: multiply (1) by $a_2$ and (2) by $a_1$, then subtract the first from the second. The $x$-terms cancel: $$\begin{aligned} a_1a_2x + a_1b_2y + a_1c_2 &= 0 \\ a_1a_2x + a_2b_1y + a_2c_1 &= 0 \\ (a_1b_2 - a_2b_1)\,y &= c_1a_2 - c_2a_1 \end{aligned}$$ So:`,
          r`इसलिए, यदि $a_1b_2 - a_2b_1 \neq 0$ हो, तो भाग देकर $x$ मिलता है। $y$ के लिए इस बार $x$ वाले पद एक जैसे करो: (1) को $a_2$ से और (2) को $a_1$ से गुणा करो, फिर दूसरे में से पहला घटाओ। $x$ वाले पद कट जाते हैं: $$\begin{aligned} a_1a_2x + a_1b_2y + a_1c_2 &= 0 \\ a_1a_2x + a_2b_1y + a_2c_1 &= 0 \\ (a_1b_2 - a_2b_1)\,y &= c_1a_2 - c_2a_1 \end{aligned}$$ तो:`,
        ),
      ),
      w.body(
        t(
          r`$$x = \frac{b_1c_2 - b_2c_1}{a_1b_2 - a_2b_1}, \qquad y = \frac{c_1a_2 - c_2a_1}{a_1b_2 - a_2b_1}$$`,
          r`$$x = \frac{b_1c_2 - b_2c_1}{a_1b_2 - a_2b_1}, \qquad y = \frac{c_1a_2 - c_2a_1}{a_1b_2 - a_2b_1}$$`,
        ),
      ),
      w.body(
        t(
          "NCERT tries it on 5 oranges and 3 apples for ₹35, and 2 oranges and 4 apples for ₹28: $5x + 3y - 35 = 0$ and $2x + 4y - 28 = 0$.",
          "NCERT इसे 5 संतरे और 3 सेब ₹35 के, और 2 संतरे और 4 सेब ₹28 के पर आज़माती है: $5x + 3y - 35 = 0$ और $2x + 4y - 28 = 0$।",
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The cross-multiplication form and its arrow diagram, worked on a pair. */
const diagram = page(
  "diagram",
  (b) => {
    const w = wordsOn(b);
    const steps = working(
      b,
      "steps",
      [equals(2, 1, 5), equals(3, 2, 8)],
      Method.CrossMultiplication,
    );
    b.standsFor(
      steps,
      "2x + y = 5 and 3x + 2y = 8 solved by cross-multiplication with the arrow diagram b₁ c₁ a₁ b₁ over b₂ c₂ a₂ b₂",
    );
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "So $2x + y = 5$ and $3x + 2y = 8$ give…",
        "तो $2x + y = 5$ और $3x + 2y = 8$ से मिलता है…",
      ),
      options: [
        { id: "right", label: t("$x = 2$, $y = 1$", "$x = 2$, $y = 1$") },
        {
          id: "swap",
          label: t("$x = 1$, $y = 2$", "$x = 1$, $y = 2$"),
          feedback: t("Check: $2(1) + 2 = 4$, not 5.", "जाँचो: $2(1) + 2 = 4$, 5 नहीं।"),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("The cross-multiplication method", "वज्र-गुणन विधि")),
      w.body(
        t(
          "The two answers have the same bottom, so NCERT writes them together in one line:",
          "दोनों उत्तरों का नीचे वाला भाग एक ही है, इसलिए NCERT उन्हें एक पंक्ति में साथ लिखती है:",
        ),
      ),
      w.body(
        t(
          r`$$\frac{x}{b_1c_2 - b_2c_1} = \frac{y}{c_1a_2 - c_2a_1} = \frac{1}{a_1b_2 - a_2b_1}$$`,
          r`$$\frac{x}{b_1c_2 - b_2c_1} = \frac{y}{c_1a_2 - c_2a_1} = \frac{1}{a_1b_2 - a_2b_1}$$`,
        ),
      ),
      w.definition(
        t(
          "**The cross-multiplication method.** (1) Write both equations in the form $ax + by + c = 0$. (2) Write the numbers in the arrow diagram: $b_1, c_1, a_1, b_1$ on top and $b_2, c_2, a_2, b_2$ below. Each bottom in the line above is one cross: multiply along the arrow going down, then subtract the product along the arrow going up. (3) Find $x$ and $y$, provided $a_1b_2 - a_2b_1 \\neq 0$.",
          "**वज्र-गुणन विधि।** (1) दोनों समीकरणों को $ax + by + c = 0$ रूप में लिखो। (2) संख्याएँ तीर-चित्र में लिखो: ऊपर $b_1, c_1, a_1, b_1$ और नीचे $b_2, c_2, a_2, b_2$। ऊपर की पंक्ति का हर नीचे वाला भाग एक क्रॉस है: नीचे जाते तीर के साथ गुणा करो, फिर ऊपर जाते तीर का गुणनफल घटाओ। (3) $x$ और $y$ निकालो, यदि $a_1b_2 - a_2b_1 \\neq 0$ हो।",
        ),
      ),
      w.body(
        t(
          "The name comes from step 2: you multiply across, in crosses. Tap through a pair:",
          "नाम चरण 2 से आता है: तुम आर-पार, क्रॉस में गुणा करते हो। एक युग्म पर आगे बढ़ो:",
        ),
      ),
      steps,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** When a₁b₂ − a₂b₁ = 0: back to the ratio test. */
const zero = page(
  "bottom-zero",
  (b) => {
    const w = wordsOn(b);
    const steps = working(
      b,
      "steps",
      [equals(3, -5, 20), equals(6, -10, 40)],
      Method.CrossMultiplication,
    );
    b.standsFor(
      steps,
      "3x − 5y = 20 and 6x − 10y = 40 by cross-multiplication: the last bottom is 0",
    );
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "For $3x - 5y = 20$ and $6x - 10y = 40$, $a_1b_2 - a_2b_1 = 0$ and all three ratios are equal. So the pair has…",
        "$3x - 5y = 20$ और $6x - 10y = 40$ के लिए $a_1b_2 - a_2b_1 = 0$ है और तीनों अनुपात बराबर हैं। तो युग्म के…",
      ),
      options: [
        { id: "right", label: t("infinitely many solutions", "अपरिमित हल") },
        {
          id: "none",
          label: t("no solution", "कोई हल नहीं"),
          feedback: t(
            "No solution needs $\\tfrac{c_1}{c_2}$ to be different. Here $\\tfrac{-20}{-40} = \\tfrac{1}{2}$, the same as the others.",
            "कोई हल न होने के लिए $\\tfrac{c_1}{c_2}$ अलग होना चाहिए। यहाँ $\\tfrac{-20}{-40} = \\tfrac{1}{2}$, बाक़ियों जैसा ही।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("When the bottom is zero", "जब नीचे शून्य हो")),
      w.body(
        t(
          "The formula needs $a_1b_2 - a_2b_1 \\neq 0$: you can't divide by zero. That bottom is zero exactly when",
          "सूत्र को $a_1b_2 - a_2b_1 \\neq 0$ चाहिए: शून्य से भाग नहीं हो सकता। वह नीचे वाला भाग ठीक तब शून्य होता है जब",
        ),
      ),
      w.body(t(r`$$\frac{a_1}{a_2} = \frac{b_1}{b_2}$$`, r`$$\frac{a_1}{a_2} = \frac{b_1}{b_2}$$`)),
      w.definition(
        t(
          r`**The two cases.** If $a_1b_2 - a_2b_1 \neq 0$, i.e. $\tfrac{a_1}{a_2} \neq \tfrac{b_1}{b_2}$: a **unique** solution. If $a_1b_2 - a_2b_1 = 0$, compare $\tfrac{c_1}{c_2}$ too. All three ratios equal: **infinitely many** solutions. $\tfrac{c_1}{c_2}$ different: **no** solution. It's the ratio test again.`,
          r`**दो स्थितियाँ।** यदि $a_1b_2 - a_2b_1 \neq 0$, यानी $\tfrac{a_1}{a_2} \neq \tfrac{b_1}{b_2}$: एक **अद्वितीय** हल। यदि $a_1b_2 - a_2b_1 = 0$, तो $\tfrac{c_1}{c_2}$ भी मिलाओ। तीनों अनुपात बराबर: **अपरिमित** हल। $\tfrac{c_1}{c_2}$ अलग: **कोई** हल नहीं। यह फिर से अनुपात परीक्षण है।`,
        ),
      ),
      steps,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** NCERT Example 15: p ≠ 4 for a unique solution. */
const forP = page(
  "unique-p",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "For which values of $p$ does $4x + py + 8 = 0$, $2x + 2y + 2 = 0$ have a unique solution?",
        "$p$ के किन मानों के लिए $4x + py + 8 = 0$, $2x + 2y + 2 = 0$ का अद्वितीय हल है?",
      ),
      options: [
        { id: "right", label: t("Every $p$ except 4", "4 को छोड़कर हर $p$") },
        {
          id: "four",
          label: t("Only $p = 4$", "केवल $p = 4$"),
          feedback: t(
            r`At $p = 4$, $\tfrac{a_1}{a_2} = \tfrac{4}{2} = \tfrac{b_1}{b_2}$: the lines have the same tilt, so no unique solution.`,
            r`$p = 4$ पर $\tfrac{a_1}{a_2} = \tfrac{4}{2} = \tfrac{b_1}{b_2}$: रेखाओं का झुकाव एक, तो अद्वितीय हल नहीं।`,
          ),
        },
        {
          id: "two",
          label: t("Every $p$ except 2", "2 को छोड़कर हर $p$"),
          feedback: t(
            r`Set $\tfrac{4}{2} = \tfrac{p}{2}$ and solve: that's the $p$ to avoid.`,
            r`$\tfrac{4}{2} = \tfrac{p}{2}$ रखकर हल करो: वही $p$ नहीं चलेगा।`,
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Example: a number to avoid", "उदाहरण: एक संख्या जिससे बचना है")),
      w.body(
        t(
          "NCERT's Example 15. A unique solution needs $\\tfrac{a_1}{a_2} \\neq \\tfrac{b_1}{b_2}$. Here $a_1 = 4$, $a_2 = 2$, $b_1 = p$, $b_2 = 2$:",
          "NCERT का उदाहरण 15। अद्वितीय हल के लिए $\\tfrac{a_1}{a_2} \\neq \\tfrac{b_1}{b_2}$ चाहिए। यहाँ $a_1 = 4$, $a_2 = 2$, $b_1 = p$, $b_2 = 2$:",
        ),
      ),
      w.body(
        t(
          r`$$\frac{4}{2} \neq \frac{p}{2}, \quad\text{i.e.}\quad p \neq 4$$`,
          r`$$\frac{4}{2} \neq \frac{p}{2}, \quad\text{यानी}\quad p \neq 4$$`,
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** NCERT Example 16: k = 6 for infinitely many. */
const forK = page(
  "infinite-k",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t("Why is $k = -6$ thrown out?", "$k = -6$ को क्यों छोड़ा गया?"),
      options: [
        {
          id: "right",
          label: t(
            r`It fails the second condition, $\tfrac{3}{k} = \tfrac{k-3}{k}$`,
            r`यह दूसरी शर्त $\tfrac{3}{k} = \tfrac{k-3}{k}$ पर खरा नहीं उतरता`,
          ),
        },
        {
          id: "negative",
          label: t("Because $k$ can't be negative", "क्योंकि $k$ ऋणात्मक नहीं हो सकता"),
          feedback: t(
            r`Negative numbers are allowed. Check it: at $k = -6$, $\tfrac{3}{k} = -\tfrac{1}{2}$ but $\tfrac{k-3}{k} = \tfrac{3}{2}$.`,
            r`ऋणात्मक संख्याएँ चलती हैं। जाँचो: $k = -6$ पर $\tfrac{3}{k} = -\tfrac{1}{2}$ पर $\tfrac{k-3}{k} = \tfrac{3}{2}$।`,
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Example: infinitely many", "उदाहरण: अपरिमित हल")),
      w.body(
        t(
          "NCERT's Example 16. For what $k$ does this pair have infinitely many solutions?",
          "NCERT का उदाहरण 16। $k$ के किस मान के लिए इस युग्म के अपरिमित हल हैं?",
        ),
      ),
      w.body(
        t(
          r`$$\begin{aligned} kx + 3y - (k - 3) &= 0 \\ 12x + ky - k &= 0 \end{aligned}$$`,
          r`$$\begin{aligned} kx + 3y - (k - 3) &= 0 \\ 12x + ky - k &= 0 \end{aligned}$$`,
        ),
      ),
      w.body(t("All three ratios must be equal:", "तीनों अनुपात बराबर होने चाहिए:")),
      w.body(
        t(
          r`$$\frac{k}{12} = \frac{3}{k} = \frac{k - 3}{k}$$`,
          r`$$\frac{k}{12} = \frac{3}{k} = \frac{k - 3}{k}$$`,
        ),
      ),
      w.body(
        t(
          r`From the first two, $k^2 = 36$, so $k = 6$ or $k = -6$. From the last two, $3k = k^2 - 3k$, so $k^2 = 6k$: $k = 0$ or $k = 6$. Only $k = 6$ passes both.`,
          r`पहले दो से $k^2 = 36$, तो $k = 6$ या $k = -6$। आख़िरी दो से $3k = k^2 - 3k$, तो $k^2 = 6k$: $k = 0$ या $k = 6$। केवल $k = 6$ दोनों में खरा उतरता है।`,
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

/** The bus fares, by cross-multiplication. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const steps = working(
      b,
      "steps",
      [general(2, 3, -46), general(3, 5, -74)],
      Method.CrossMultiplication,
      { form: EquationForm.General },
    );
    b.standsFor(
      steps,
      "the bus fares, 2x + 3y − 46 = 0 and 3x + 5y − 74 = 0, by cross-multiplication",
    );
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "With $x$ the fare to the near stop and $y$ to the far stop, what are the fares?",
        "पास वाले स्टॉप का किराया $x$ और दूर वाले का $y$ हो, तो किराए क्या हैं?",
      ),
      options: [
        { id: "right", label: t("Near ₹8, far ₹10", "पास ₹8, दूर ₹10") },
        {
          id: "swap",
          label: t("Near ₹10, far ₹8", "पास ₹10, दूर ₹8"),
          feedback: t(
            "Check the first bill: $2(10) + 3(8) = 44$, not 46.",
            "पहला बिल जाँचो: $2(10) + 3(8) = 44$, 46 नहीं।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const after = w.body(
      t(
        "Riya didn't choose a single multiplier: the formula did all the work. Kabir, half asleep against the window, is already asking about the boat on the river.",
        "रिया ने एक भी गुणक नहीं चुना: सारा काम सूत्र ने किया। खिड़की से टिककर आधा सोया कबीर अभी से नदी वाली नाव के बारे में पूछ रहा है।",
      ),
      "after",
      { isHidden: true },
    );
    b.when(ask.on(QuestionSignal.Correct), [theBoard.show(after), theBoard.pass()]);
    return column([
      w.title(t("The fares, by formula", "किराए, सूत्र से")),
      w.body(
        t(
          "On the bus, Riya writes the tickets in general form and fills in the diagram:",
          "बस में रिया टिकटों को व्यापक रूप में लिखती है और तीर-चित्र भरती है:",
        ),
      ),
      steps,
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

/** Exercise 3.5 Q2(ii) and Q4(i); then the mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const ask1 = choiceQuestion(b, {
      name: "ask1",
      prompt: t(
        "For which $k$ does $3x + y = 1$, $(2k - 1)x + (k - 1)y = 2k + 1$ have no solution?",
        "$k$ के किस मान के लिए $3x + y = 1$, $(2k - 1)x + (k - 1)y = 2k + 1$ का कोई हल नहीं है?",
      ),
      options: [
        { id: "right", label: t("$k = 2$", "$k = 2$") },
        {
          id: "one",
          label: t("$k = 1$", "$k = 1$"),
          feedback: t(
            r`At $k = 1$ the second equation is $x = 3$, which crosses $3x + y = 1$. Set $\tfrac{3}{2k-1} = \tfrac{1}{k-1}$.`,
            r`$k = 1$ पर दूसरा समीकरण $x = 3$ है, जो $3x + y = 1$ को काटता है। $\tfrac{3}{2k-1} = \tfrac{1}{k-1}$ रखो।`,
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const ask2 = choiceQuestion(b, {
      name: "ask2",
      prompt: t(
        "A hostel charges a fixed amount plus a cost per day of food. 20 days of food cost ₹1000 in all; 26 days cost ₹1180. What is the fixed charge?",
        "एक छात्रावास एक तय राशि और भोजन के हर दिन का अलग शुल्क लेता है। 20 दिन के भोजन पर कुल ₹1000 लगे; 26 दिन पर ₹1180। तय राशि क्या है?",
      ),
      options: [
        { id: "right", label: t("₹400 (and ₹30 a day)", "₹400 (और ₹30 प्रति दिन)") },
        {
          id: "rate",
          label: t("₹30", "₹30"),
          feedback: t(
            "₹30 is the cost per day: 6 more days cost ₹180. The fixed charge is $1000 - 20 \\times 30$.",
            "₹30 प्रति दिन का शुल्क है: 6 दिन ज़्यादा पर ₹180। तय राशि $1000 - 20 \\times 30$ है।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ Cross-multiplication: $\\tfrac{x}{b_1c_2 - b_2c_1} = \\tfrac{y}{c_1a_2 - c_2a_1} = \\tfrac{1}{a_1b_2 - a_2b_1}$. ✓ If $a_1b_2 - a_2b_1 = 0$, the ratio test decides: none or infinitely many. ✓ The bus fares: ₹8 and ₹10. ✗ Some equations aren't linear at all. Next: equations in disguise.",
        "**मिशन लॉग।** ✓ वज्र-गुणन: $\\tfrac{x}{b_1c_2 - b_2c_1} = \\tfrac{y}{c_1a_2 - c_2a_1} = \\tfrac{1}{a_1b_2 - a_2b_1}$। ✓ यदि $a_1b_2 - a_2b_1 = 0$, तो अनुपात परीक्षण तय करता है: कोई नहीं या अपरिमित। ✓ बस किराए: ₹8 और ₹10। ✗ कुछ समीकरण रैखिक होते ही नहीं। आगे: भेष बदले समीकरण।",
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
export const overview = [hook, derive, diagram, zero, forP, forK, inLife, yourTurn];

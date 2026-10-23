import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import { EquationForm, LinearSceneKind, Method } from "@chalk/prop-linear-equations";
import { equals, general, plane, scene, working } from "../kit";

const r = String.raw;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** Grandpa's riddle: numbers too big for the graph paper. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const stall = scene(
    b,
    "stall",
    LinearSceneKind.MelaStall,
    "the stall in the afternoon; Grandpa has come by and leans on the counter",
  );
  return column([
    w.title(t("Grandpa's riddle", "दादाजी की पहेली")),
    stall,
    w.body(
      t(
        'Last lesson, drawing found the cash box answer. Grandpa, who has come to see the mela, hears about it and sets a riddle of his own: "Your mother\'s age and mine add up to **112**. I am **28** years older than her. How old am I?"',
        'पिछले पाठ में चित्र बनाकर गल्ले का उत्तर मिला। दादाजी, जो मेला देखने आए हैं, यह सुनते हैं और अपनी एक पहेली देते हैं: "तुम्हारी मम्मी की उम्र और मेरी उम्र मिलाकर **112** है। मैं उनसे **28** साल बड़ा हूँ। मेरी उम्र क्या है?"',
      ),
    ),
    w.body(
      t(
        "Kabir reaches for the graph paper, and stops. The lines would have to reach past 100 on both axes. And even with a huge sheet, what if they crossed at something like $(69.6, 42.4)$, between the grid lines? You could never read that exactly off a drawing. Riya needs a way to solve a pair **without drawing**.",
        "कबीर ग्राफ़ पेपर की ओर हाथ बढ़ाता है, और रुक जाता है। रेखाओं को दोनों अक्षों पर 100 से आगे जाना होगा। और बहुत बड़े काग़ज़ पर भी, अगर वे ग्रिड रेखाओं के बीच $(69.6, 42.4)$ जैसी जगह कटीं तो? चित्र से वह कभी ठीक-ठीक नहीं पढ़ा जा सकता। रिया को **बिना चित्र** युग्म हल करने का तरीक़ा चाहिए।",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Why algebra: a crossing at an awkward point. */
const awkward = page("awkward", (b) => {
  const w = wordsOn(b);
  const graph = plane(b, "graph", [equals(7, -15, 2), equals(1, 2, 3)], {
    xMin: -1,
    xMax: 4,
    yMin: -1,
    yMax: 2,
  });
  b.standsFor(
    graph,
    "the lines 7x − 15y = 2 and x + 2y = 3 crossing at a point that is not on the grid lines, somewhere near (1.7, 0.7)",
  );
  return column([
    w.title(t("When drawing isn't enough", "जब चित्र काफ़ी न हो")),
    w.body(
      t(
        "Here are $7x - 15y = 2$ and $x + 2y = 3$. They clearly cross, but where exactly? Somewhere near $x = 1.7$, $y = 0.7$, between the grid lines. Reading a drawing gives a guess, not an answer.",
        "ये रहे $7x - 15y = 2$ और $x + 2y = 3$। ये साफ़ कटते हैं, पर ठीक कहाँ? कहीं $x = 1.7$, $y = 0.7$ के पास, ग्रिड-रेखाओं के बीच। चित्र पढ़ने से अनुमान मिलता है, उत्तर नहीं।",
      ),
    ),
    graph,
    w.body(
      t(
        "So we turn to **algebraic methods**: ways of solving a pair by working with the equations themselves. The first is the substitution method.",
        "इसलिए हम **बीजगणितीय विधियों** की ओर चलते हैं: समीकरणों के साथ ही काम करके युग्म हल करने के तरीक़े। पहली है प्रतिस्थापन विधि।",
      ),
    ),
    space(),
  ]);
});

/** The substitution method, step by step, on NCERT Example 7. */
const method = page(
  "method",
  (b) => {
    const w = wordsOn(b);
    const steps = working(b, "steps", [equals(7, -15, 2), equals(1, 2, 3)], Method.Substitution);
    b.standsFor(
      steps,
      "NCERT Example 7 worked by substitution: the learner picks which variable to write in terms of the other, then reveals each step",
    );
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t("So where do the lines cross?", "तो रेखाएँ कहाँ कटती हैं?"),
      options: [
        {
          id: "right",
          label: t(
            r`$x = \tfrac{49}{29}$, $y = \tfrac{19}{29}$`,
            r`$x = \tfrac{49}{29}$, $y = \tfrac{19}{29}$`,
          ),
        },
        {
          id: "guess",
          label: t("$x = 1.7$, $y = 0.7$", "$x = 1.7$, $y = 0.7$"),
          feedback: t(
            r`That's the guess from the drawing. Check it: $1.7 + 2(0.7) = 3.1$, not 3. The exact answer has 29 underneath.`,
            r`यह चित्र वाला अनुमान है। जाँचो: $1.7 + 2(0.7) = 3.1$, 3 नहीं। सटीक उत्तर में नीचे 29 है।`,
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("The substitution method", "प्रतिस्थापन विधि")),
      w.definition(
        t(
          "**Substitute.** To **substitute** is to put something in the place of something else. In maths: wherever a letter appears, write instead an expression it equals.",
          "**प्रतिस्थापित करना।** **प्रतिस्थापित** करना यानी किसी चीज़ की जगह कुछ और रखना। गणित में: जहाँ भी कोई अक्षर आए, उसकी जगह वह व्यंजक लिखो जिसके वह बराबर है।",
        ),
      ),
      w.definition(
        t(
          "**The substitution method.** (1) From either equation, write one variable in terms of the other, say $x$ in terms of $y$. (2) Substitute this into the **other** equation. Now it has only one variable: solve it. (3) Put that value back into the expression from step (1) to find the other variable. Then check the answer in both equations.",
          "**प्रतिस्थापन विधि।** (1) किसी भी समीकरण से एक चर को दूसरे के रूप में लिखो, जैसे $x$ को $y$ के रूप में। (2) इसे **दूसरे** समीकरण में प्रतिस्थापित करो। अब उसमें केवल एक चर है: उसे हल करो। (3) वह मान चरण (1) वाले व्यंजक में वापस रखकर दूसरा चर निकालो। फिर उत्तर को दोनों समीकरणों में जाँचो।",
        ),
      ),
      w.body(
        t(
          "NCERT's Example 7 is the awkward pair from the last page. Pick a variable to write in terms of the other (the easiest is $x$ from equation (2), since it has no number in front), then tap through the steps.",
          "NCERT का उदाहरण 7 पिछले पन्ने वाला अटपटा युग्म है। एक चर चुनो जिसे दूसरे के रूप में लिखना है (सबसे आसान है समीकरण (2) से $x$, क्योंकि उसके आगे कोई संख्या नहीं), फिर चरण दर चरण आगे बढ़ो।",
        ),
      ),
      steps,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** NCERT Example 8: Aftab and his daughter, by substitution. */
const ages = page(
  "ages",
  (b) => {
    const w = wordsOn(b);
    const steps = working(b, "steps", [general(1, -7, 42), equals(1, -3, 6)], Method.Substitution, {
      variables: ["s", "t"],
    });
    b.standsFor(steps, "NCERT Example 8, Aftab's ages, worked by substitution in s and t");
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t("How old are Aftab and his daughter?", "आफ़ताब और उनकी बेटी की उम्र कितनी है?"),
      options: [
        { id: "right", label: t("42 and 12", "42 और 12") },
        {
          id: "swap",
          label: t("12 and 42", "12 और 42"),
          feedback: t(
            "$s$ is Aftab, the father: he is the older one.",
            "$s$ आफ़ताब हैं, पिता: वे बड़े हैं।",
          ),
        },
        {
          id: "seven",
          label: t("35 and 5", "35 और 5"),
          feedback: t(
            "Those were their ages seven years ago. The question asks about now.",
            "वे सात साल पहले की उम्रें थीं। प्रश्न अभी का है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Example: Aftab's ages", "उदाहरण: आफ़ताब की उम्र")),
      w.body(
        t(
          'NCERT\'s Example 8. Aftab tells his daughter: "Seven years ago, I was seven times as old as you were then. Three years from now, I shall be three times as old as you will be." Let Aftab be $s$ years old and his daughter $t$:',
          'NCERT का उदाहरण 8। आफ़ताब अपनी बेटी से कहते हैं: "सात साल पहले मैं तुमसे सात गुना बड़ा था। तीन साल बाद मैं तुमसे तीन गुना बड़ा होऊँगा।" मान लो आफ़ताब $s$ वर्ष के हैं और बेटी $t$ वर्ष की:',
        ),
      ),
      w.body(
        t(
          r`$$\begin{aligned} s - 7 = 7(t - 7), \quad&\text{i.e.}\quad s - 7t + 42 = 0 \quad (1) \\ s + 3 = 3(t + 3), \quad&\text{i.e.}\quad s - 3t = 6 \quad (2) \end{aligned}$$`,
          r`$$\begin{aligned} s - 7 = 7(t - 7), \quad&\text{यानी}\quad s - 7t + 42 = 0 \quad (1) \\ s + 3 = 3(t + 3), \quad&\text{यानी}\quad s - 3t = 6 \quad (2) \end{aligned}$$`,
        ),
      ),
      steps,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** NCERT Example 9: the variable vanishes and leaves 18 = 18, true: infinitely many. */
const trueStatement = page(
  "always-true",
  (b) => {
    const w = wordsOn(b);
    const steps = working(b, "steps", [equals(2, 3, 9), equals(4, 6, 18)], Method.Substitution);
    b.standsFor(
      steps,
      "NCERT Example 9, the two pencil bills, worked by substitution until 18 = 18",
    );
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "The working ends with $18 = 18$ and no variable left. What does that mean?",
        "हल $18 = 18$ पर ख़त्म होता है और कोई चर नहीं बचता। इसका क्या अर्थ है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "It's true whatever $y$ is: infinitely many solutions",
            "$y$ कुछ भी हो, यह सही है: अपरिमित हल",
          ),
        },
        {
          id: "wrong",
          label: t("A mistake was made somewhere", "कहीं ग़लती हुई है"),
          feedback: t(
            "No mistake: the two equations are the same line, so every $y$ works.",
            "कोई ग़लती नहीं: दोनों समीकरण एक ही रेखा हैं, इसलिए हर $y$ चलता है।",
          ),
        },
        {
          id: "none",
          label: t("No solution", "कोई हल नहीं"),
          feedback: t(
            "$18 = 18$ is true. A *false* statement would mean no solution.",
            "$18 = 18$ सही है। *ग़लत* कथन का अर्थ होता कोई हल नहीं।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("When the variable disappears: true", "जब चर ग़ायब हो जाए: सही")),
      w.body(
        t(
          "NCERT's Example 9 brings back the pencil bills, $2x + 3y = 9$ and $4x + 6y = 18$. Work it through:",
          "NCERT का उदाहरण 9 पेंसिल वाले बिल वापस लाता है, $2x + 3y = 9$ और $4x + 6y = 18$। हल करके देखो:",
        ),
      ),
      steps,
      w.definition(
        t(
          "**A statement with no variable.** Sometimes in step 2 every variable cancels and a plain statement is left. If it is **true** (like $18 = 18$), the pair has **infinitely many** solutions: the lines coincide.",
          "**बिना चर का कथन।** कभी-कभी चरण 2 में हर चर कट जाता है और एक सादा कथन बचता है। यदि वह **सही** है (जैसे $18 = 18$), तो युग्म के **अपरिमित** हल हैं: रेखाएँ संपाती हैं।",
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** NCERT Example 10: the rails, −4 = 0, false: no solution. */
const falseStatement = page(
  "never-true",
  (b) => {
    const w = wordsOn(b);
    const steps = working(
      b,
      "steps",
      [general(1, 2, -4), general(2, 4, -12)],
      Method.Substitution,
      { form: EquationForm.General },
    );
    b.standsFor(steps, "NCERT Example 10, the two rails, worked by substitution until −4 = 0");
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t("Will the rails ever cross?", "क्या पटरियाँ कभी कटेंगी?"),
      options: [
        {
          id: "right",
          label: t(
            "No: $-4 = 0$ is false, so there is no common solution",
            "नहीं: $-4 = 0$ ग़लत है, तो कोई साझा हल नहीं",
          ),
        },
        {
          id: "yes",
          label: t("Yes, at $y = -4$", "हाँ, $y = -4$ पर"),
          feedback: t(
            "There's no $y$ left in $-4 = 0$: it's a statement about numbers, and it's false.",
            "$-4 = 0$ में कोई $y$ बचा ही नहीं: यह संख्याओं के बारे में कथन है, और ग़लत है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("When the variable disappears: false", "जब चर ग़ायब हो जाए: ग़लत")),
      w.body(
        t(
          "NCERT's Example 10 brings back the rails. Will they cross?",
          "NCERT का उदाहरण 10 पटरियों को वापस लाता है। क्या वे कटेंगी?",
        ),
      ),
      steps,
      w.definition(
        t(
          "If the plain statement left is **false** (like $-4 = 0$), no pair of numbers can make both equations true: the pair has **no solution**, and the lines are parallel.",
          "यदि बचा सादा कथन **ग़लत** है (जैसे $-4 = 0$), तो कोई भी संख्या-जोड़ा दोनों समीकरणों को सही नहीं कर सकता: युग्म का **कोई हल नहीं**, और रेखाएँ समांतर हैं।",
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

/** Grandpa's riddle, solved by substitution. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const steps = working(b, "steps", [equals(1, 1, 112), equals(1, -1, 28)], Method.Substitution, {
      variables: ["g", "m"],
    });
    b.standsFor(steps, "Grandpa's riddle: g + m = 112 and g − m = 28, worked by substitution");
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t("How old is Grandpa?", "दादाजी की उम्र क्या है?"),
      options: [
        { id: "right", label: t("70", "70") },
        {
          id: "mom",
          label: t("42", "42"),
          feedback: t(
            "That's $m$, Mom's age. Grandpa is 28 years older.",
            "यह $m$ है, मम्मी की उम्र। दादाजी 28 साल बड़े हैं।",
          ),
        },
        {
          id: "half",
          label: t("56", "56"),
          feedback: t(
            "Half of 112 would make them the same age, but Grandpa is 28 years older.",
            "112 का आधा तो दोनों को बराबर उम्र का बना देता, पर दादाजी 28 साल बड़े हैं।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const after = w.body(
      t(
        r`Check: $70 + 42 = 112$ and $70 - 42 = 28$. Grandpa is delighted and buys three samosas. No graph paper needed, and it would have worked just as well for an answer like $\tfrac{49}{29}$.`,
        r`जाँच: $70 + 42 = 112$ और $70 - 42 = 28$। दादाजी ख़ुश होकर तीन समोसे ख़रीदते हैं। ग्राफ़ पेपर की ज़रूरत नहीं पड़ी, और $\tfrac{49}{29}$ जैसे उत्तर के लिए भी यह उतना ही काम करता।`,
      ),
      "after",
      { isHidden: true },
    );
    b.when(ask.on(QuestionSignal.Correct), [theBoard.show(after), theBoard.pass()]);
    return column([
      w.title(t("Grandpa's riddle, solved", "दादाजी की पहेली, हल")),
      w.body(
        t(
          "Back at the stall, Riya lets Grandpa be $g$ years old and Mom $m$:",
          "स्टॉल पर लौटकर रिया दादाजी की उम्र $g$ वर्ष और मम्मी की $m$ वर्ष मानती है:",
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

/** Exercise 3.3: Q1(i), Q2 and the taxi; then the mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const ask1 = choiceQuestion(b, {
      name: "ask1",
      prompt: t(
        "Solve by substitution: $x + y = 14$ and $x - y = 4$.",
        "प्रतिस्थापन से हल करो: $x + y = 14$ और $x - y = 4$।",
      ),
      options: [
        { id: "right", label: t("$x = 9$, $y = 5$", "$x = 9$, $y = 5$") },
        {
          id: "swap",
          label: t("$x = 5$, $y = 9$", "$x = 5$, $y = 9$"),
          feedback: t("Check $x - y = 4$: $5 - 9 = -4$.", "$x - y = 4$ जाँचो: $5 - 9 = -4$।"),
        },
        {
          id: "seven",
          label: t("$x = 7$, $y = 7$", "$x = 7$, $y = 7$"),
          feedback: t("Check $x - y = 4$: $7 - 7 = 0$.", "$x - y = 4$ जाँचो: $7 - 7 = 0$।"),
        },
      ],
      answer: "right",
      passes: false,
    });
    const ask2 = choiceQuestion(b, {
      name: "ask2",
      prompt: t(
        "A taxi charges a fixed amount plus a charge per km. 10 km costs ₹105 and 15 km costs ₹155. How much does 25 km cost?",
        "टैक्सी का किराया एक तय राशि और हर km का अलग शुल्क है। 10 km के ₹105 और 15 km के ₹155 लगते हैं। 25 km के कितने लगेंगे?",
      ),
      options: [
        { id: "right", label: t("₹255", "₹255") },
        {
          id: "times",
          label: t("₹262.50", "₹262.50"),
          feedback: t(
            "That's ₹10.50 per km with no fixed charge. Let the fixed charge be $x$ and the rate $y$: $x + 10y = 105$, $x + 15y = 155$. Then $y = 10$ and $x = 5$.",
            "यह बिना तय राशि के ₹10.50 प्रति km है। तय राशि $x$ और दर $y$ मानो: $x + 10y = 105$, $x + 15y = 155$। तब $y = 10$ और $x = 5$।",
          ),
        },
        {
          id: "twenty",
          label: t("₹250", "₹250"),
          feedback: t(
            "₹10 a km for 25 km is ₹250, but don't forget the fixed ₹5.",
            "25 km के ₹10 प्रति km से ₹250, पर तय ₹5 मत भूलो।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ Substitution: write one variable in terms of the other, put it into the other equation, solve, put back. ✓ A true leftover statement means infinitely many solutions; a false one means none. ✓ Grandpa is 70. ✗ Some pairs make messy fractions when you substitute. Next: a method that removes a variable by adding.",
        "**मिशन लॉग।** ✓ प्रतिस्थापन: एक चर को दूसरे के रूप में लिखो, दूसरे समीकरण में रखो, हल करो, वापस रखो। ✓ बचा कथन सही हो तो अपरिमित हल; ग़लत हो तो कोई नहीं। ✓ दादाजी 70 के हैं। ✗ कुछ युग्मों में प्रतिस्थापन से उलझी भिन्नें बनती हैं। आगे: जोड़कर एक चर हटाने की विधि।",
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
export const overview = [
  hook,
  awkward,
  method,
  ages,
  trueStatement,
  falseStatement,
  inLife,
  yourTurn,
];

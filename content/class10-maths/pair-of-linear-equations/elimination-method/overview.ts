import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import { LinearSceneKind, Method } from "@chalk/prop-linear-equations";
import { equals, scene, working } from "../kit";

const r = String.raw;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** The cash box's number lock and Kabir's half-remembered code. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const lock = scene(
    b,
    "lock",
    LinearSceneKind.CashBoxLock,
    "evening at the stall: the metal cash box shut with a two-digit number lock, both dials showing question marks; Kabir scratches his head, Riya holds her notebook",
  );
  return column([
    w.title(t("The locked cash box", "बंद गल्ला")),
    w.body(
      t(
        "Substitution cracked Grandpa's riddle. Late in the evening there's a new problem. After the ₹600 was counted, Kabir locked the cash box with its two-digit number lock and set a fresh code to keep it safe. Now the teacher wants to carry the money to the school office, and Kabir can't remember the code.",
        "प्रतिस्थापन ने दादाजी की पहेली सुलझा दी। शाम को एक नई मुसीबत आती है। ₹600 गिने जाने के बाद कबीर ने गल्ले को उसके दो अंकों वाले ताले से बंद करके सुरक्षा के लिए नया कोड लगा दिया। अब अध्यापिका पैसे स्कूल के दफ़्तर ले जाना चाहती हैं, और कबीर को कोड याद नहीं।",
      ),
    ),
    lock,
    w.body(
      t(
        'All he remembers is the trick he used to pick it: "If you add the number to the number with its digits swapped, you get **66**. And its two digits differ by **2**." Two clues, two unknown digits. Riya opens her notebook.',
        'उसे बस वह तरकीब याद है जिससे उसने कोड चुना था: "संख्या में उसके अंक उलटकर बनी संख्या जोड़ो, तो **66** आता है। और उसके दोनों अंकों में **2** का अंतर है।" दो सुराग, दो अनजाने अंक। रिया अपनी कॉपी खोलती है।',
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** The elimination method on NCERT Example 11 (incomes in the ratio 9 : 7). */
const method = page(
  "method",
  (b) => {
    const w = wordsOn(b);
    const steps = working(
      b,
      "steps",
      [equals(9, -4, 2000), equals(7, -3, 2000)],
      Method.Elimination,
    );
    b.standsFor(
      steps,
      "NCERT Example 11 worked by elimination: the learner chooses which variable to remove, then reveals each step",
    );
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "The incomes were ₹$9x$ and ₹$7x$. What are they?",
        "आय ₹$9x$ और ₹$7x$ थीं। वे क्या हैं?",
      ),
      options: [
        { id: "right", label: t("₹18,000 and ₹14,000", "₹18,000 और ₹14,000") },
        {
          id: "x",
          label: t("₹2,000 and ₹4,000", "₹2,000 और ₹4,000"),
          feedback: t(
            "Those are $x$ and $y$. The incomes are $9x$ and $7x$: multiply.",
            "ये तो $x$ और $y$ हैं। आय $9x$ और $7x$ हैं: गुणा करो।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("The elimination method", "विलोपन विधि")),
      w.definition(
        t(
          "**Eliminate.** To **eliminate** is to remove. The elimination method removes one variable by adding or subtracting the two equations, once that variable has the same number in front of it in both.",
          "**विलोपन।** **विलोपन** करना यानी हटाना। विलोपन विधि दोनों समीकरणों को जोड़कर या घटाकर एक चर को हटा देती है, जब उस चर के आगे दोनों में एक ही संख्या हो।",
        ),
      ),
      w.definition(
        t(
          "**The elimination method.** (1) Multiply both equations by suitable non-zero numbers so that one variable's coefficients have the same size. (A **coefficient** is the number multiplying a variable: in $9x$ it is 9.) (2) Add or subtract the equations so that variable cancels. (3) Solve the equation in one variable that is left. (4) Put the value into either original equation to find the other variable.",
          "**विलोपन विधि।** (1) दोनों समीकरणों को उपयुक्त शून्येतर संख्याओं से गुणा करो ताकि एक चर के गुणांक एक ही आकार के हो जाएँ। (**गुणांक** वह संख्या है जो चर से गुणा होती है: $9x$ में यह 9 है।) (2) समीकरणों को जोड़ो या घटाओ ताकि वह चर कट जाए। (3) बचे एक चर वाले समीकरण को हल करो। (4) मान को किसी भी मूल समीकरण में रखकर दूसरा चर निकालो।",
        ),
      ),
      w.body(
        t(
          "NCERT's Example 11. Two people's incomes are in the ratio 9 : 7 and their spending in the ratio 4 : 3. Each saves ₹2000 a month. Write the incomes as ₹$9x$ and ₹$7x$, the spending as ₹$4y$ and ₹$3y$; savings are income minus spending, which gives equations (1) and (2) below.",
          "NCERT का उदाहरण 11। दो लोगों की आय 9 : 7 के अनुपात में है और उनका ख़र्च 4 : 3 के अनुपात में। हर एक हर महीने ₹2000 बचाता है। आय को ₹$9x$ और ₹$7x$ लिखो, ख़र्च को ₹$4y$ और ₹$3y$; बचत यानी आय घटा ख़र्च, जिससे नीचे के समीकरण (1) और (2) बनते हैं।",
        ),
      ),
      w.body(
        t(
          "Choose which variable to remove, and tap through. (NCERT removes $y$: times 3 and times 4 make both $12y$.)",
          "चुनो कौन-सा चर हटाना है, और आगे बढ़ो। (NCERT $y$ हटाती है: 3 और 4 से गुणा करके दोनों $12y$ बनते हैं।)",
        ),
      ),
      steps,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Add or subtract: same signs subtract, opposite signs add. */
const addOrSubtract = page(
  "add-or-subtract",
  (b) => {
    const w = wordsOn(b);
    const steps = working(b, "steps", [equals(3, 4, 10), equals(2, -2, 2)], Method.Elimination, {
      eliminate: 1,
      canChoose: false,
    });
    b.standsFor(steps, "3x + 4y = 10 and 2x − 2y = 2 worked by elimination, removing y");
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "To remove $y$ from $3x + 4y = 10$ and $2x - 2y = 2$, multiply the second by 2. Then…",
        "$3x + 4y = 10$ और $2x - 2y = 2$ से $y$ हटाने के लिए दूसरे को 2 से गुणा करो। फिर…",
      ),
      options: [
        {
          id: "right",
          label: t(
            "add the equations: $+4y$ and $-4y$ cancel",
            "समीकरणों को जोड़ो: $+4y$ और $-4y$ कट जाते हैं",
          ),
        },
        {
          id: "subtract",
          label: t("subtract the equations", "समीकरणों को घटाओ"),
          feedback: t(
            "$4y - (-4y) = 8y$: subtracting would double $y$, not remove it.",
            "$4y - (-4y) = 8y$: घटाने से $y$ दोगुना हो जाएगा, हटेगा नहीं।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Add or subtract?", "जोड़ें या घटाएँ?")),
      w.body(
        t(
          "Once a variable has the same size of coefficient in both equations, look at the signs:",
          "जब किसी चर का गुणांक दोनों समीकरणों में एक ही आकार का हो जाए, तो चिह्न देखो:",
        ),
      ),
      w.definition(
        t(
          "**Same sign, subtract; opposite signs, add.** $12y$ and $12y$ cancel when you subtract. $4y$ and $-4y$ cancel when you add.",
          "**एक चिह्न हो तो घटाओ; उलटे चिह्न हों तो जोड़ो।** $12y$ और $12y$ घटाने पर कटते हैं। $4y$ और $-4y$ जोड़ने पर कटते हैं।",
        ),
      ),
      steps,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** NCERT Example 12: 0 = 9, no solution. */
const none = page(
  "no-solution",
  (b) => {
    const w = wordsOn(b);
    const steps = working(b, "steps", [equals(2, 3, 8), equals(4, 6, 7)], Method.Elimination, {
      eliminate: 0,
      canChoose: false,
    });
    b.standsFor(
      steps,
      "NCERT Example 12, 2x + 3y = 8 and 4x + 6y = 7, worked by elimination until 0 = 9",
    );
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t("So the pair has…", "तो युग्म के…"),
      options: [
        { id: "right", label: t("no solution", "कोई हल नहीं") },
        {
          id: "many",
          label: t("infinitely many solutions", "अपरिमित हल"),
          feedback: t(
            "That would need a true statement like $9 = 9$. $0 = 9$ is false.",
            "उसके लिए $9 = 9$ जैसा सही कथन चाहिए। $0 = 9$ ग़लत है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Example: nothing left but 0 = 9", "उदाहरण: बचा बस 0 = 9")),
      w.body(
        t(
          "NCERT's Example 12. Find all possible solutions of $2x + 3y = 8$ and $4x + 6y = 7$. Multiply the first by 2 to make the $x$-coefficients equal, then subtract:",
          "NCERT का उदाहरण 12। $2x + 3y = 8$ और $4x + 6y = 7$ के सभी संभव हल निकालो। $x$ के गुणांक बराबर करने के लिए पहले को 2 से गुणा करो, फिर घटाओ:",
        ),
      ),
      steps,
      w.body(
        t(
          "Just as with substitution: if eliminating leaves a **false** statement, there is no solution; a **true** one means infinitely many.",
          "ठीक प्रतिस्थापन की तरह: विलोपन के बाद **ग़लत** कथन बचे तो कोई हल नहीं; **सही** बचे तो अपरिमित हल।",
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Two-digit numbers in expanded form; NCERT Example 13 (42 or 24). */
const digits = page(
  "digits",
  (b) => {
    const w = wordsOn(b);
    const steps = working(b, "steps", [equals(1, 1, 6), equals(1, -1, 2)], Method.Elimination, {
      eliminate: 1,
      canChoose: false,
    });
    b.standsFor(steps, "x + y = 6 and x − y = 2 solved by adding to remove y: x = 4, y = 2");
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "If instead $y - x = 2$, the digits come out the other way round. How many numbers fit both clues?",
        "अगर इसकी जगह $y - x = 2$ हो, तो अंक उलटे आते हैं। दोनों सुरागों पर कितनी संख्याएँ खरी उतरती हैं?",
      ),
      options: [
        { id: "right", label: t("Two: 42 and 24", "दो: 42 और 24") },
        {
          id: "one",
          label: t("One: 42", "एक: 42"),
          feedback: t(
            '"Differ by 2" doesn\'t say which digit is bigger. With $y - x = 2$ you get $x = 2$, $y = 4$: the number 24.',
            '"2 का अंतर" यह नहीं कहता कि कौन-सा अंक बड़ा है। $y - x = 2$ से $x = 2$, $y = 4$ आता है: संख्या 24।',
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Example: a number and its reverse", "उदाहरण: एक संख्या और उसका उलटा")),
      w.definition(
        t(
          "**Expanded form.** A two-digit number with tens digit $x$ and units digit $y$ is $10x + y$: for example, $56 = 10(5) + 6$. Swapping the digits gives $10y + x$: $65 = 10(6) + 5$.",
          "**विस्तारित रूप।** जिस दो अंकों वाली संख्या का दहाई का अंक $x$ और इकाई का अंक $y$ हो, वह $10x + y$ है: जैसे $56 = 10(5) + 6$। अंक उलटने पर $10y + x$ बनता है: $65 = 10(6) + 5$।",
        ),
      ),
      w.body(
        t(
          "NCERT's Example 13. A number plus its reverse is 66, and its digits differ by 2:",
          "NCERT का उदाहरण 13। एक संख्या और उसका उलटा मिलाकर 66 है, और उसके अंकों में 2 का अंतर है:",
        ),
      ),
      w.body(
        t(
          r`$$\begin{aligned} (10x + y) + (10y + x) &= 66 \\ 11(x + y) &= 66 \\ x + y &= 6 \quad (1) \end{aligned}$$`,
          r`$$\begin{aligned} (10x + y) + (10y + x) &= 66 \\ 11(x + y) &= 66 \\ x + y &= 6 \quad (1) \end{aligned}$$`,
        ),
      ),
      w.body(
        t(
          "The digits differ by 2: either $x - y = 2$ (2) or $y - x = 2$ (3). Take (1) and (2) first; adding removes $y$:",
          "अंकों में 2 का अंतर है: या तो $x - y = 2$ (2) या $y - x = 2$ (3)। पहले (1) और (2) लो; जोड़ने से $y$ हटता है:",
        ),
      ),
      steps,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** Back at the lock: two codes to try. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const lock = scene(
      b,
      "lock",
      LinearSceneKind.CashBoxLock,
      "the cash box with its two-digit lock",
    );
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "Kabir works out 42 from the clues and tries it. The lock doesn't open. What should he try next?",
        "कबीर सुरागों से 42 निकालकर लगाता है। ताला नहीं खुलता। अब वह क्या आज़माए?",
      ),
      options: [
        { id: "right", label: t("24", "24") },
        {
          id: "33",
          label: t("33", "33"),
          feedback: t(
            "$33 + 33 = 66$, but its digits are equal: they don't differ by 2.",
            "$33 + 33 = 66$, पर इसके अंक बराबर हैं: उनमें 2 का अंतर नहीं।",
          ),
        },
        {
          id: "nothing",
          label: t("Nothing: the clues must be wrong", "कुछ नहीं: सुराग ग़लत होंगे"),
          feedback: t(
            "The clues have two answers, not one. 42 was only the first.",
            "सुरागों के एक नहीं, दो उत्तर हैं। 42 बस पहला था।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const after = w.body(
      t(
        "Click. The lock opens on **24**. Kabir insists he knew all along. Riya notes the lesson: a puzzle can have more than one answer, and the maths will tell you if it does.",
        "क्लिक। ताला **24** पर खुल जाता है। कबीर ज़िद करता है कि उसे शुरू से पता था। रिया सबक़ लिख लेती है: पहेली के एक से ज़्यादा उत्तर हो सकते हैं, और गणित बता देता है कि ऐसा है या नहीं।",
      ),
      "after",
      { isHidden: true },
    );
    b.when(ask.on(QuestionSignal.Correct), [theBoard.show(after), theBoard.pass()]);
    return column([w.title(t("Opening the box", "गल्ला खोलना")), lock, ask, after, space()]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Exercise 3.4 Q2: Meena's notes and Nuri and Sonu; then the mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const ask1 = choiceQuestion(b, {
      name: "ask1",
      prompt: t(
        "Meena withdrew ₹2000 from a bank in ₹50 and ₹100 notes only, 25 notes in all. How many of each did she get?",
        "मीना ने बैंक से ₹2000 केवल ₹50 और ₹100 के नोटों में निकाले, कुल 25 नोट। उसे हर तरह के कितने नोट मिले?",
      ),
      options: [
        { id: "right", label: t("10 of ₹50 and 15 of ₹100", "₹50 के 10 और ₹100 के 15") },
        {
          id: "swap",
          label: t("15 of ₹50 and 10 of ₹100", "₹50 के 15 और ₹100 के 10"),
          feedback: t(
            "That's ₹750 + ₹1000 = ₹1750. Solve $x + y = 25$ and $50x + 100y = 2000$.",
            "यह ₹750 + ₹1000 = ₹1750 है। $x + y = 25$ और $50x + 100y = 2000$ हल करो।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const ask2 = choiceQuestion(b, {
      name: "ask2",
      prompt: t(
        "Five years ago, Nuri was thrice as old as Sonu. Ten years later, Nuri will be twice as old as Sonu. How old are they now?",
        "पाँच साल पहले नूरी, सोनू से तीन गुनी बड़ी थी। दस साल बाद नूरी, सोनू से दुगुनी बड़ी होगी। अभी उनकी उम्र क्या है?",
      ),
      options: [
        { id: "right", label: t("Nuri 50, Sonu 20", "नूरी 50, सोनू 20") },
        {
          id: "then",
          label: t("Nuri 45, Sonu 15", "नूरी 45, सोनू 15"),
          feedback: t(
            "Those were their ages five years ago. Add 5 to each.",
            "ये पाँच साल पहले की उम्रें थीं। हर एक में 5 जोड़ो।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ Elimination: make one variable's coefficients the same size, add or subtract to remove it, solve, put back. ✓ Same signs subtract, opposite signs add. ✓ The cash box is open: code 24. ✗ Every pair still needs its own choice of multipliers. Next: one formula that works for every pair.",
        "**मिशन लॉग।** ✓ विलोपन: एक चर के गुणांक एक आकार के करो, जोड़कर या घटाकर उसे हटाओ, हल करो, वापस रखो। ✓ एक चिह्न हों तो घटाओ, उलटे हों तो जोड़ो। ✓ गल्ला खुल गया: कोड 24। ✗ हर युग्म के लिए गुणक अलग से चुनने पड़ते हैं। आगे: एक सूत्र जो हर युग्म पर चले।",
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
export const overview = [hook, method, addOrSubtract, none, digits, inLife, yourTurn];

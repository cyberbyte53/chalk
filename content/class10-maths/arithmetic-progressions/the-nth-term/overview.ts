import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, goalQuestion, wordsOn } from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  ApSceneKind,
  NthAction,
  NthDerived,
  NthSignal,
  apSequenceDef,
  nthTermDef,
} from "@chalk/prop-ap";
import { sceneOn } from "../kit";

const r = String.raw;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** Recap, then the question: week 20, without writing twenty numbers. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const box = sceneOn(
    b,
    "box",
    ApSceneKind.MoneyBox,
    "Kabir at the table with the tin money box, counting on his fingers; Riya at the weekly chart on the wall",
  );
  return column([
    w.title(t("Week 20?", "हफ़्ता 20?")),
    box,
    w.body(
      t(
        'Kabir\'s savings are an AP: ₹100, 105, 110, …, with $a = 100$ and $d = 5$. Riya asks how much he will put in during week 20. Kabir starts counting: "105, 110, 115, 120, …" and loses his place at week 9.',
        'कबीर की बचत एक AP है: ₹100, 105, 110, …, जिसमें $a = 100$ और $d = 5$। रिया पूछती है कि हफ़्ते 20 में वह कितना डालेगा। कबीर गिनने लगता है: "105, 110, 115, 120, …" और हफ़्ते 9 पर गिनती भूल जाता है।',
      ),
    ),
    w.body(
      t(
        "Riya: \"There's a shortcut. You don't need the 19 weeks before it.\" This lesson finds it: a rule that gives **any** term of an AP straight away.",
        'रिया: "एक छोटा रास्ता है। उससे पहले के 19 हफ़्तों की ज़रूरत नहीं।" यह पाठ वही खोजता है: एक नियम जो AP का **कोई भी** पद सीधे दे देता है।',
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Reena's salary: the number of increments is one less than the year. */
const salary = page(
  "salary",
  (b) => {
    const w = wordsOn(b);
    const pay = b.prop(apSequenceDef, "pay", {
      a: 8000,
      d: 500,
      count: 5,
      canReveal: false,
      showGeneral: true,
      isEndless: true,
      unit: "₹",
    });
    b.standsFor(pay, "Reena's salary for years 1 to 5 as bars, ₹8000 rising by ₹500 a year");
    const fifteen = choiceQuestion(b, {
      name: "fifteen",
      prompt: t(
        "How many increments of ₹500 has Reena had by her 15th year?",
        "रीना को अपने 15वें साल तक ₹500 की कितनी वेतन-वृद्धियाँ मिल चुकी हैं?",
      ),
      options: [
        { id: "right", label: t("14", "14") },
        {
          id: "fifteen",
          label: t("15", "15"),
          feedback: t(
            "The first year has no increment yet. Year 2 has 1, year 3 has 2, …, so year 15 has 14.",
            "पहले साल में अभी कोई वृद्धि नहीं। साल 2 में 1, साल 3 में 2, …, तो साल 15 में 14।",
          ),
        },
        {
          id: "sixteen",
          label: t("16", "16"),
          feedback: t(
            "Count: the increments are always one fewer than the year number.",
            "गिनो: वृद्धियाँ हमेशा साल की संख्या से एक कम होती हैं।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Counting the steps", "क़दम गिनना")),
      w.body(
        t(
          "Reena starts a job at ₹8000 a month, with an increment (a rise) of ₹500 every year. Her salary year by year is an AP: 8000, 8500, 9000, ….",
          "रीना ₹8000 मासिक पर नौकरी शुरू करती है, हर साल ₹500 की वेतन-वृद्धि के साथ। उसका वेतन साल-दर-साल एक AP है: 8000, 8500, 9000, …।",
        ),
      ),
      pay,
      w.body(
        t(
          r`Look at how each year is made. $$\text{Year } 3 = 8000 + 2 \times 500 = 9000$$ $$\text{Year } 4 = 8000 + 3 \times 500 = 9500$$ $$\text{Year } 5 = 8000 + 4 \times 500 = 10000$$ In year 3 there are two 500s, in year 4 three, in year 5 four: **always one less than the year**.`,
          r`देखो हर साल कैसे बनता है। $$\text{साल } 3 = 8000 + 2 \times 500 = 9000$$ $$\text{साल } 4 = 8000 + 3 \times 500 = 9500$$ $$\text{साल } 5 = 8000 + 4 \times 500 = 10000$$ साल 3 में दो बार 500, साल 4 में तीन बार, साल 5 में चार बार: **हमेशा साल से एक कम**।`,
        ),
      ),
      fifteen,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The nth term, derived and defined; the last term l; Example 3 on the hop line. */
const formula = page(
  "formula",
  (b) => {
    const w = wordsOn(b);
    const hops = b.prop(nthTermDef, "hops", {
      a: 2,
      d: 5,
      n: 2,
      nMax: 20,
      canMoveN: true,
      showFormula: true,
    });
    b.studentOnly(hops.action(NthAction.NudgeN));
    b.standsFor(
      hops,
      "the AP 2, 7, 12, … as hops along a line from a₁ = 2; the learner moves n and reads aₙ = 2 + (n − 1) × 5",
    );
    const goal = goalQuestion(b, {
      about: hops,
      prompt: t(
        "Example 3: find the 10th term of 2, 7, 12, …. Move n to 10.",
        "उदाहरण 3: 2, 7, 12, … का 10वाँ पद ज्ञात करो। n को 10 पर ले जाओ।",
      ),
      isMet: hops.field("n").eq(10),
      solve: Array.from({ length: 8 }, () => hops.learner(NthAction.NudgeN, { by: 1 })),
    });
    return column([
      w.title(t("The nth term", "n वाँ पद")),
      w.body(
        t(
          r`The same counting works for any AP $a, a + d, a + 2d, \dots$: $$a_2 = a + (2 - 1)d$$ $$a_3 = a + (3 - 1)d$$ $$a_4 = a + (4 - 1)d$$ To reach the $n$th term from the first you take $n - 1$ steps of $d$.`,
          r`यही गिनती किसी भी AP $a, a + d, a + 2d, \dots$ पर चलती है: $$a_2 = a + (2 - 1)d$$ $$a_3 = a + (3 - 1)d$$ $$a_4 = a + (4 - 1)d$$ पहले पद से $n$ वें पद तक पहुँचने के लिए $d$ के $n - 1$ क़दम लगते हैं।`,
        ),
      ),
      w.definition(
        t(
          r`**The nth term.** In an AP with first term $a$ and common difference $d$, the $n$th term is $$a_n = a + (n - 1)d$$ It is also called the **general term**. If the AP has $m$ terms, $a_m$ is its **last term**, often written $l$.`,
          r`**n वाँ पद।** प्रथम पद $a$ और सार्व अंतर $d$ वाली AP में $n$ वाँ पद है $$a_n = a + (n - 1)d$$ इसे **व्यापक पद** भी कहते हैं। अगर AP में $m$ पद हों, तो $a_m$ उसका **अंतिम पद** है, जिसे अक्सर $l$ लिखते हैं।`,
        ),
      ),
      hops,
      goal,
      w.body(
        t(
          r`With $a = 2$, $d = 5$ and $n = 10$: $$a_{10} = 2 + (10 - 1) \times 5 = 2 + 45 = 47$$`,
          r`$a = 2$, $d = 5$ और $n = 10$ से: $$a_{10} = 2 + (10 - 1) \times 5 = 2 + 45 = 47$$`,
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Example 4: work backwards to find n; is any term 0? */
const backwards = page(
  "backwards",
  (b) => {
    const w = wordsOn(b);
    const solve = b.prop(nthTermDef, "solve", {
      a: 21,
      d: -3,
      n: 1,
      nMax: 40,
      canMoveN: false,
      showFormula: true,
      target: -81,
      canStep: true,
    });
    b.studentOnly(solve.action(NthAction.Next));
    b.standsFor(
      solve,
      "the AP 21, 18, 15, … with the question 'which term is −81?'; the learner steps through solving −81 = 21 + (n − 1)(−3)",
    );
    const done = w.body(
      t(
        r`So $n = 35$: −81 is the **35th term**. Is any term 0? Put $a_n = 0$: $$21 + (n - 1)(-3) = 0$$ $$3(n - 1) = 21$$ $$n = 8$$ The 8th term is 0.`,
        r`तो $n = 35$: −81 **35वाँ पद** है। क्या कोई पद 0 है? $a_n = 0$ रखो: $$21 + (n - 1)(-3) = 0$$ $$3(n - 1) = 21$$ $$n = 8$$ 8वाँ पद 0 है।`,
      ),
      "done",
      { isHidden: true },
    );
    b.when(solve.on(NthSignal.Solved), theBoard.show(done));
    const check = choiceQuestion(b, {
      name: "check",
      prompt: t(
        "Which term of the AP 3, 8, 13, 18, … is 78?",
        "AP 3, 8, 13, 18, … का कौन-सा पद 78 है?",
      ),
      options: [
        { id: "right", label: t("The 16th", "16वाँ") },
        {
          id: "fifteen",
          label: t("The 15th", "15वाँ"),
          feedback: t(
            r`$78 = 3 + (n - 1) \times 5$ gives $n - 1 = 15$. Don't forget to add the 1 back: $n = 16$.`,
            r`$78 = 3 + (n - 1) \times 5$ से $n - 1 = 15$। 1 वापस जोड़ना मत भूलो: $n = 16$।`,
          ),
        },
        {
          id: "26",
          label: t("The 26th", "26वाँ"),
          feedback: t(
            r`That's $78 \div 3$. Use $a_n = a + (n - 1)d$ with $a = 3$ and $d = 5$.`,
            r`यह $78 \div 3$ है। $a_n = a + (n - 1)d$ लो, जिसमें $a = 3$ और $d = 5$।`,
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Working backwards", "उलटा चलना")),
      w.body(
        t(
          r`The formula connects four things: $a_n$, $a$, $d$ and $n$. Know three and you can find the fourth. **Example 4:** which term of 21, 18, 15, … is −81? Here $a = 21$, $d = -3$, $a_n = -81$, and $n$ is unknown. Step through the solving.`,
          r`सूत्र चार चीज़ों को जोड़ता है: $a_n$, $a$, $d$ और $n$। तीन पता हों तो चौथी निकल आती है। **उदाहरण 4:** 21, 18, 15, … का कौन-सा पद −81 है? यहाँ $a = 21$, $d = -3$, $a_n = -81$, और $n$ अज्ञात है। हल क़दम-दर-क़दम देखो।`,
        ),
      ),
      solve,
      done,
      check,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Example 6: n must be a positive whole number, so 301 is not a term. */
const whole = page(
  "whole",
  (b) => {
    const w = wordsOn(b);
    const solve = b.prop(nthTermDef, "solve", {
      a: 5,
      d: 6,
      n: 1,
      nMax: 60,
      canMoveN: false,
      showFormula: false,
      target: 301,
      canStep: true,
    });
    b.studentOnly(solve.action(NthAction.Next));
    b.standsFor(
      solve,
      "the AP 5, 11, 17, 23, … with the question 'is 301 a term?'; solving gives n = 151/3",
    );
    const why = choiceQuestion(b, {
      name: "why",
      prompt: t(
        r`Solving gives $n = \tfrac{151}{3}$. Why does that mean 301 is **not** a term?`,
        r`हल करने पर $n = \tfrac{151}{3}$ मिलता है। इसका मतलब यह क्यों है कि 301 पद **नहीं** है?`,
      ),
      options: [
        {
          id: "right",
          label: t(
            "n counts terms (1st, 2nd, 3rd, …), so it must be a positive whole number",
            "n पदों को गिनता है (पहला, दूसरा, तीसरा, …), इसलिए यह धनात्मक पूर्ण संख्या होना चाहिए",
          ),
        },
        {
          id: "big",
          label: t("Because 151/3 is too big", "क्योंकि 151/3 बहुत बड़ा है"),
          feedback: t(
            "Size isn't the problem: an AP can have a 50th term. There is no 'fifty and a third'th term.",
            "आकार समस्या नहीं: AP का 50वाँ पद हो सकता है। 'साढ़े पचास' जैसा कोई पद नहीं होता।",
          ),
        },
        {
          id: "odd",
          label: t("Because 301 is odd", "क्योंकि 301 विषम है"),
          feedback: t(
            "Every term of this AP is odd (5, 11, 17, …), so that can't be it. The test is whether n comes out whole.",
            "इस AP का हर पद विषम है (5, 11, 17, …), तो यह कारण नहीं हो सकता। जाँच यह है कि n पूर्ण संख्या आता है या नहीं।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Is it a term at all?", "क्या यह पद है भी?")),
      w.body(
        t(
          r`**Example 6:** is 301 a term of 5, 11, 17, 23, …? It's an AP with $a = 5$, $d = 6$. Suppose 301 is the $n$th term and solve.`,
          r`**उदाहरण 6:** क्या 301, 5, 11, 17, 23, … का एक पद है? यह AP है, जिसमें $a = 5$, $d = 6$। मान लो 301, $n$ वाँ पद है, और हल करो।`,
        ),
      ),
      solve,
      why,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Example 5: two terms fix the AP, through a pair of linear equations (Chapter 3). */
const twoTerms = page(
  "two-terms",
  (b) => {
    const w = wordsOn(b);
    const ap = b.prop(apSequenceDef, "ap", {
      a: 3,
      d: 1,
      count: 7,
      canReveal: false,
      isEndless: true,
    });
    b.standsFor(ap, "the AP 3, 4, 5, 6, 7, 8, 9 as bars: its 3rd term is 5 and its 7th term is 9");
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "The 17th term of an AP is 7 more than its 10th term. What is d?",
        "किसी AP का 17वाँ पद उसके 10वें पद से 7 ज़्यादा है। d क्या है?",
      ),
      options: [
        { id: "right", label: t("1", "1") },
        {
          id: "seven",
          label: t("7", "7"),
          feedback: t(
            r`From the 10th to the 17th term is 7 steps of $d$: $7d = 7$.`,
            r`10वें से 17वें पद तक $d$ के 7 क़दम हैं: $7d = 7$।`,
          ),
        },
        {
          id: "half",
          label: t(r`$\tfrac{7}{27}$`, r`$\tfrac{7}{27}$`),
          feedback: t(
            r`Subtract the two terms: $(a + 16d) - (a + 9d) = 7d$. The $a$s cancel.`,
            r`दोनों पद घटाओ: $(a + 16d) - (a + 9d) = 7d$। $a$ कट जाते हैं।`,
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Two terms fix the AP", "दो पद AP तय कर देते हैं")),
      w.body(
        t(
          r`**Example 5:** an AP's 3rd term is 5 and its 7th term is 9. Find the AP. Each term gives an equation: $$a + 2d = 5$$ $$a + 6d = 9$$ That is a pair of linear equations, as in Chapter 3. Subtracting the first from the second gives $4d = 4$, so $d = 1$ and $a = 3$. The AP is 3, 4, 5, 6, 7, ….`,
          r`**उदाहरण 5:** किसी AP का तीसरा पद 5 है और 7वाँ पद 9। AP ज्ञात करो। हर पद एक समीकरण देता है: $$a + 2d = 5$$ $$a + 6d = 9$$ यह रैखिक समीकरणों का एक युग्म है, जैसे अध्याय 3 में। दूसरे में से पहला घटाने पर $4d = 4$, तो $d = 1$ और $a = 3$। AP है 3, 4, 5, 6, 7, …।`,
        ),
      ),
      ap,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** Kabir's week 20, the first ₹200 week, and why no week is ₹333. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const weeks = b.prop(nthTermDef, "weeks", {
      a: 100,
      d: 5,
      n: 1,
      nMax: 40,
      nStep: 1,
      canMoveN: true,
      showFormula: true,
      unit: "₹",
    });
    b.studentOnly(weeks.action(NthAction.NudgeN));
    b.standsFor(
      weeks,
      "Kabir's savings as hops from ₹100 in steps of ₹5; the learner moves the week n",
    );
    const goal = goalQuestion(b, {
      about: weeks,
      prompt: t(
        "Riya's first question: how much in week 20? Move n to 20.",
        "रिया का पहला सवाल: हफ़्ते 20 में कितना? n को 20 पर ले जाओ।",
      ),
      isMet: weeks.derived(NthDerived.Term).eq(195),
      solve: Array.from({ length: 19 }, () => weeks.learner(NthAction.NudgeN, { by: 1 })),
    });
    const first200 = choiceQuestion(b, {
      name: "first200",
      prompt: t(
        "In which week does a single week's saving first reach ₹200?",
        "किस हफ़्ते एक हफ़्ते की बचत पहली बार ₹200 तक पहुँचती है?",
      ),
      options: [
        { id: "right", label: t("Week 21", "हफ़्ता 21") },
        {
          id: "20",
          label: t("Week 20", "हफ़्ता 20"),
          feedback: t(
            "Week 20 is ₹195. One more step of ₹5 is needed.",
            "हफ़्ता 20 ₹195 है। ₹5 का एक क़दम और चाहिए।",
          ),
        },
        {
          id: "40",
          label: t("Week 40", "हफ़्ता 40"),
          feedback: t(
            r`That's $200 \div 5$. Solve $200 = 100 + (n - 1) \times 5$: $n - 1 = 20$.`,
            r`यह $200 \div 5$ है। $200 = 100 + (n - 1) \times 5$ हल करो: $n - 1 = 20$।`,
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const odd = w.body(
      t(
        r`Kabir: "Will any week be exactly ₹333?" Solve $333 = 100 + (n - 1) \times 5$: $$n - 1 = \tfrac{233}{5} = 46.6$$ Not a whole number, so no week is ₹333. Every week's amount ends in 0 or 5.`,
        r`कबीर: "क्या कोई हफ़्ता ठीक ₹333 का होगा?" $333 = 100 + (n - 1) \times 5$ हल करो: $$n - 1 = \tfrac{233}{5} = 46.6$$ पूर्ण संख्या नहीं, तो कोई हफ़्ता ₹333 का नहीं। हर हफ़्ते की रक़म 0 या 5 पर ख़त्म होती है।`,
      ),
      "odd",
      { isHidden: true },
    );
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(first200));
    b.when(first200.on(QuestionSignal.Correct), [theBoard.show(odd), theBoard.pass()]);
    return column([
      w.title(t("Back to the money box", "फिर गुल्लक पर")),
      w.body(
        t(
          r`Kabir's AP has $a = 100$ and $d = 5$, so week $n$ is $$a_n = 100 + (n - 1) \times 5$$`,
          r`कबीर की AP में $a = 100$ और $d = 5$, तो हफ़्ता $n$ है $$a_n = 100 + (n - 1) \times 5$$`,
        ),
      ),
      weeks,
      goal,
      first200,
      odd,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Exercise 5.2 picks: the 30th term, −150 not a term, the zero term; the mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const thirtieth = choiceQuestion(b, {
      name: "thirtieth",
      prompt: t("The 30th term of the AP 10, 7, 4, … is", "AP 10, 7, 4, … का 30वाँ पद है"),
      options: [
        { id: "right", label: t("−77", "−77") },
        {
          id: "97",
          label: t("97", "97"),
          feedback: t(
            r`The terms go down, so $d = 7 - 10 = -3$, not +3.`,
            r`पद घटते हैं, तो $d = 7 - 10 = -3$, +3 नहीं।`,
          ),
        },
        {
          id: "80",
          label: t("−80", "−80"),
          feedback: t(
            r`Use $n - 1 = 29$ steps, not 30: $10 + 29 \times (-3) = -77$.`,
            r`$n - 1 = 29$ क़दम लो, 30 नहीं: $10 + 29 \times (-3) = -77$।`,
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const minus150 = choiceQuestion(b, {
      name: "minus150",
      prompt: t("Is −150 a term of the AP 11, 8, 5, 2, …?", "क्या −150, AP 11, 8, 5, 2, … का पद है?"),
      options: [
        {
          id: "right",
          label: t(
            r`No: $n = \tfrac{164}{3}$ is not a whole number`,
            r`नहीं: $n = \tfrac{164}{3}$ पूर्ण संख्या नहीं`,
          ),
        },
        {
          id: "yes",
          label: t("Yes, the 54th term", "हाँ, 54वाँ पद"),
          feedback: t(
            r`Check: $a_{54} = 11 + 53 \times (-3) = -148$, not −150. Solving $-150 = 11 + (n - 1)(-3)$ gives $n - 1 = \tfrac{161}{3}$.`,
            r`जाँचो: $a_{54} = 11 + 53 \times (-3) = -148$, −150 नहीं। $-150 = 11 + (n - 1)(-3)$ हल करने पर $n - 1 = \tfrac{161}{3}$।`,
          ),
        },
        {
          id: "neg",
          label: t(
            "No, an AP can't reach negative numbers",
            "नहीं, AP ऋणात्मक संख्याओं तक नहीं पहुँच सकती",
          ),
          feedback: t(
            "It can: this AP passes 2, −1, −4, …. The reason is that n doesn't come out whole.",
            "पहुँच सकती है: यह AP 2, −1, −4, … से गुज़रती है। कारण यह है कि n पूर्ण नहीं आता।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const log = w.definition(
      t(
        r`**Mission log.** ✓ Any week, instantly: $a_n = 100 + (n - 1) \times 5$. ✓ Week 20 is ₹195; week 21 is the first ₹200 week. ✗ But how much is in the box altogether? Next stop: using the nth term on real problems, then adding the terms up.`,
        r`**मिशन लॉग।** ✓ कोई भी हफ़्ता, तुरंत: $a_n = 100 + (n - 1) \times 5$। ✓ हफ़्ता 20 ₹195 का है; हफ़्ता 21 पहला ₹200 वाला हफ़्ता है। ✗ पर गुल्लक में कुल कितना है? अगला पड़ाव: असली सवालों पर n वें पद का उपयोग, फिर पदों को जोड़ना।`,
      ),
      "log",
      { isHidden: true },
    );
    b.when(thirtieth.on(QuestionSignal.Correct), theBoard.show(minus150));
    b.when(minus150.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([
      w.title(t("Your turn", "अब तुम्हारी बारी")),
      w.body(
        t(
          r`**Worked: the 3rd and 9th terms of an AP are 4 and −8. Which term is zero?** $$a + 2d = 4, \qquad a + 8d = -8$$ Subtracting, $6d = -12$, so $d = -2$ and $a = 8$. Then $8 + (n - 1)(-2) = 0$ gives $n - 1 = 4$: the **5th** term is zero.`,
          r`**हल किया हुआ: किसी AP के तीसरे और 9वें पद 4 और −8 हैं। कौन-सा पद शून्य है?** $$a + 2d = 4, \qquad a + 8d = -8$$ घटाने पर $6d = -12$, तो $d = -2$ और $a = 8$। फिर $8 + (n - 1)(-2) = 0$ से $n - 1 = 4$: **5वाँ** पद शून्य है।`,
        ),
      ),
      thirtieth,
      minus150,
      log,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [hook, salary, formula, backwards, whole, twoTerms, inLife, yourTurn];

import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, goalQuestion, wordsOn } from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  QuadraticSceneKind,
  SplitAction,
  SplitDerived,
  SplitSignal,
  middleSplitDef,
  rootsGraphDef,
} from "@chalk/prop-quadratics";
import { sceneOn } from "../kit";

const r = String.raw;

/** A fixed graph of y = ax² + bx + c with its roots marked. */
const graph = (
  a: number,
  b: number,
  c: number,
  window: { xMin: number; xMax: number; yMin: number; yMax: number },
) => ({
  a,
  b,
  c,
  level: 0,
  levelLabel: "",
  variable: "x",
  yName: "y",
  window,
  canSet: [],
  canSetLevel: false,
  step: 1,
  showEquation: true,
  showDiscriminant: false,
  showRoots: true,
});

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** Recap: the plot's equation, found by trying. Is there a method, and is 12 the only answer? */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const ground = sceneOn(
    b,
    "ground",
    QuadraticSceneKind.StallPlot,
    "the stall's plot chalked on the ground, breadth x and length 2x + 1",
  );
  return column([
    w.title(t("Without guessing", "बिना अनुमान के")),
    ground,
    w.body(
      t(
        r`Last time Riya wrote the plot as $$2x^2 + x - 300 = 0$$ and found $x = 12$ by trying breadths one by one. Two things bother her. Is there a way to get 12 without trying? And is 12 the **only** number that works? She remembers the Polynomials chapter: factorising a quadratic polynomial gave its zeroes. This stop uses that to answer both.`,
        r`पिछली बार रिया ने प्लॉट को ऐसे लिखा: $$2x^2 + x - 300 = 0$$ और एक-एक चौड़ाई आज़माकर $x = 12$ पाया। दो बातें उसे खटकती हैं। क्या बिना आज़माए 12 पाने का कोई तरीक़ा है? और क्या 12 **अकेली** संख्या है जो चलती है? उसे बहुपद वाला अध्याय याद आता है: द्विघात बहुपद के गुणनखंड से उसके शून्यक मिलते थे। यह पड़ाव उसी से दोनों का उत्तर देता है।`,
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** A root, and roots = zeroes = where the graph meets the x-axis. At most two. */
const root = page(
  "root",
  (b) => {
    const w = wordsOn(b);
    const g = b.prop(
      rootsGraphDef,
      "graph",
      graph(2, -3, 1, { xMin: -1, xMax: 2.5, yMin: -1, yMax: 4 }),
    );
    b.standsFor(g, "the graph of y = 2x² − 3x + 1, crossing the x-axis at x = 1/2 and x = 1");
    const two = choiceQuestion(b, {
      name: "two",
      prompt: t(r`Is 2 a root of $2x^2 - 3x + 1 = 0$?`, r`क्या 2, $2x^2 - 3x + 1 = 0$ का मूल है?`),
      options: [
        { id: "right", label: t("No", "नहीं") },
        {
          id: "yes",
          label: t("Yes", "हाँ"),
          feedback: t(
            r`Put $x = 2$: $2 \times 4 - 3 \times 2 + 1 = 3$, not 0.`,
            r`$x = 2$ रखो: $2 \times 4 - 3 \times 2 + 1 = 3$, जो 0 नहीं है।`,
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("What a root is", "मूल क्या है")),
      w.definition(
        t(
          r`**Root.** A real number $\alpha$ is a **root** of $ax^2 + bx + c = 0$ if putting $x = \alpha$ makes the left side 0: $$a\alpha^2 + b\alpha + c = 0$$ We also say $x = \alpha$ is a **solution**, or that $\alpha$ **satisfies** the equation.`,
          r`**मूल।** एक वास्तविक संख्या $\alpha$, $ax^2 + bx + c = 0$ का **मूल** है, अगर $x = \alpha$ रखने पर बायाँ पक्ष 0 हो जाए: $$a\alpha^2 + b\alpha + c = 0$$ हम यह भी कहते हैं कि $x = \alpha$ एक **हल** है, या $\alpha$ समीकरण को **संतुष्ट** करता है।`,
        ),
      ),
      w.body(
        t(
          r`For example, 1 is a root of $2x^2 - 3x + 1 = 0$, because $$2 \times 1^2 - 3 \times 1 + 1 = 0$$ The roots of $ax^2 + bx + c = 0$ are exactly the **zeroes** of the polynomial $ax^2 + bx + c$ from Chapter 2: the places where its graph meets the $x$-axis. A quadratic polynomial has at most two zeroes, so **a quadratic equation has at most two roots**.`,
          r`उदाहरण के लिए, 1, $2x^2 - 3x + 1 = 0$ का मूल है, क्योंकि $$2 \times 1^2 - 3 \times 1 + 1 = 0$$ $ax^2 + bx + c = 0$ के मूल ठीक वही हैं जो अध्याय 2 में बहुपद $ax^2 + bx + c$ के **शून्यक** थे: जहाँ उसका आलेख $x$-अक्ष से मिलता है। द्विघात बहुपद के अधिक से अधिक दो शून्यक होते हैं, इसलिए **द्विघात समीकरण के अधिक से अधिक दो मूल होते हैं**।`,
        ),
      ),
      g,
      two,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** If a product is 0, one of the factors is 0. */
const zeroProduct = page(
  "zero-product",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        r`What are the roots of $(x - 4)(x + 7) = 0$?`,
        r`$(x - 4)(x + 7) = 0$ के मूल क्या हैं?`,
      ),
      options: [
        { id: "right", label: t("4 and −7", "4 और −7") },
        {
          id: "signs",
          label: t("−4 and 7", "−4 और 7"),
          feedback: t(
            r`$x - 4 = 0$ when $x = 4$, and $x + 7 = 0$ when $x = -7$. The root has the opposite sign to the number in the bracket.`,
            r`$x - 4 = 0$ जब $x = 4$, और $x + 7 = 0$ जब $x = -7$। मूल का चिह्न कोष्ठक की संख्या से उल्टा होता है।`,
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("When a product is zero", "जब गुणनफल शून्य हो")),
      w.definition(
        t(
          r`**Zero product rule.** If two numbers multiply to give 0, then at least one of them is 0. If $pq = 0$, then $p = 0$ or $q = 0$.`,
          r`**शून्य गुणनफल नियम।** अगर दो संख्याओं का गुणनफल 0 है, तो उनमें से कम से कम एक 0 है। अगर $pq = 0$, तो $p = 0$ या $q = 0$।`,
        ),
      ),
      w.body(
        t(
          r`That's why factorising helps. If we can write the quadratic as two brackets multiplied, each bracket set to 0 gives a root. For example, $$(2x - 3)(x - 1) = 0$$ means $2x - 3 = 0$ or $x - 1 = 0$, so $$x = \tfrac{3}{2} \quad \text{or} \quad x = 1$$`,
          r`इसीलिए गुणनखंड काम आता है। अगर द्विघात को दो कोष्ठकों के गुणनफल में लिख सकें, तो हर कोष्ठक को 0 रखने से एक मूल मिलता है। उदाहरण के लिए, $$(2x - 3)(x - 1) = 0$$ का अर्थ है $2x - 3 = 0$ या $x - 1 = 0$, तो $$x = \tfrac{3}{2} \quad \text{या} \quad x = 1$$`,
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Splitting the middle term (Example 3), done by the learner. */
const split = page(
  "split",
  (b) => {
    const w = wordsOn(b);
    const s = b.prop(middleSplitDef, "split", {
      a: 2,
      b: -5,
      c: 3,
      variable: "x",
      picked: null,
      choices: null,
      canPick: true,
      showWorking: true,
      showRoots: true,
    });
    b.studentOnly(s.action(SplitAction.Pick));
    b.standsFor(
      s,
      "2x² − 5x + 3: pick two numbers that multiply to 2 × 3 = 6 and add to −5; the right pair shows the grouping, the factors and the roots",
    );
    const goal = goalQuestion(b, {
      about: s,
      prompt: t(
        r`Find the pair that multiplies to $a \times c = 6$ and adds to $b = -5$.`,
        r`वह जोड़ी ढूँढो जिसका गुणनफल $a \times c = 6$ और योग $b = -5$ हो।`,
      ),
      isMet: s.derived(SplitDerived.IsRight),
      solve: [s.learner(SplitAction.Pick, { p: -2, q: -3 })],
    });
    return column([
      w.title(t("Splitting the middle term", "मध्य पद को तोड़ना")),
      w.definition(
        t(
          r`You met this in the Polynomials chapter; here is a quick recap. **Splitting the middle term.** To factorise $ax^2 + bx + c$, find two numbers $p$ and $q$ with $$pq = ac \quad \text{and} \quad p + q = b$$ Write $bx$ as $px + qx$, take a common factor from each pair of terms, and the same bracket appears twice. Take it out.`,
          r`यह तुमने बहुपद वाले अध्याय में देखा था; यहाँ एक छोटा दोहराव है। **मध्य पद को तोड़ना।** $ax^2 + bx + c$ का गुणनखंड करने के लिए दो संख्याएँ $p$ और $q$ ढूँढो जिनके लिए $$pq = ac \quad \text{और} \quad p + q = b$$ $bx$ को $px + qx$ लिखो, हर जोड़ी पदों से उभयनिष्ठ गुणनखंड निकालो, और एक ही कोष्ठक दो बार आएगा। उसे बाहर निकालो।`,
        ),
      ),
      w.body(
        t(
          r`Try it on NCERT's Example 3: $$2x^2 - 5x + 3 = 0$$ Here $a = 2$, $b = -5$, $c = 3$, so $ac = 6$.`,
          r`NCERT के उदाहरण 3 पर आज़माओ: $$2x^2 - 5x + 3 = 0$$ यहाँ $a = 2$, $b = -5$, $c = 3$, तो $ac = 6$।`,
        ),
      ),
      s,
      goal,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Example 4 on the learner's own, then its roots. */
const example4 = page(
  "example-4",
  (b) => {
    const w = wordsOn(b);
    const s = b.prop(middleSplitDef, "split", {
      a: 6,
      b: -1,
      c: -2,
      variable: "x",
      picked: null,
      choices: null,
      canPick: true,
      showWorking: true,
      showRoots: true,
    });
    b.studentOnly(s.action(SplitAction.Pick));
    b.standsFor(s, "6x² − x − 2: pick two numbers that multiply to −12 and add to −1");
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(r`What are the roots of $6x^2 - x - 2 = 0$?`, r`$6x^2 - x - 2 = 0$ के मूल क्या हैं?`),
      options: [
        {
          id: "right",
          label: t(r`$\tfrac{2}{3}$ and $-\tfrac{1}{2}$`, r`$\tfrac{2}{3}$ और $-\tfrac{1}{2}$`),
        },
        {
          id: "split",
          label: t("3 and −4", "3 और −4"),
          feedback: t(
            r`3 and −4 are the numbers that split the middle term, not the roots. The factors are $(3x - 2)(2x + 1)$: set each to 0.`,
            r`3 और −4 मध्य पद तोड़ने वाली संख्याएँ हैं, मूल नहीं। गुणनखंड हैं $(3x - 2)(2x + 1)$: हर एक को 0 रखो।`,
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Example: 6x² − x − 2 = 0", "उदाहरण: 6x² − x − 2 = 0")),
      w.body(
        t(
          r`Now $ac = 6 \times (-2) = -12$ and $b = -1$. Find the pair, then read off the roots.`,
          r`अब $ac = 6 \times (-2) = -12$ और $b = -1$। जोड़ी ढूँढो, फिर मूल पढ़ो।`,
        ),
      ),
      s,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Example 5: a repeated root, where the graph just touches the axis. */
const repeated = page(
  "repeated",
  (b) => {
    const w = wordsOn(b);
    const g = b.prop(rootsGraphDef, "graph", {
      ...graph(3, -2 * Math.sqrt(6), 2, { xMin: -1, xMax: 2.5, yMin: -1, yMax: 4 }),
      showEquation: false,
    });
    b.standsFor(g, "the graph of y = 3x² − 2√6x + 2, touching the x-axis at one point, x = √(2/3)");
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(r`What are the roots of $x^2 - 6x + 9 = 0$?`, r`$x^2 - 6x + 9 = 0$ के मूल क्या हैं?`),
      options: [
        { id: "right", label: t("3 and 3", "3 और 3") },
        {
          id: "pm",
          label: t("3 and −3", "3 और −3"),
          feedback: t(
            r`$x^2 - 6x + 9 = (x - 3)(x - 3)$. Both brackets give $x = 3$; −3 makes it $9 + 18 + 9 = 36$.`,
            r`$x^2 - 6x + 9 = (x - 3)(x - 3)$। दोनों कोष्ठक $x = 3$ देते हैं; −3 रखने पर $9 + 18 + 9 = 36$ आता है।`,
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("When both roots are the same", "जब दोनों मूल एक ही हों")),
      w.body(
        t(
          r`Sometimes both brackets are the same. NCERT's Example 5: $$3x^2 - 2\sqrt{6}\,x + 2 = 0$$ Split $-2\sqrt{6}\,x$ as $-\sqrt{6}\,x - \sqrt{6}\,x$: $$\sqrt{3}x(\sqrt{3}x - \sqrt{2}) - \sqrt{2}(\sqrt{3}x - \sqrt{2}) = 0$$ $$(\sqrt{3}x - \sqrt{2})(\sqrt{3}x - \sqrt{2}) = 0$$ Both brackets give $$x = \sqrt{\tfrac{2}{3}}$$`,
          r`कभी-कभी दोनों कोष्ठक एक जैसे होते हैं। NCERT का उदाहरण 5: $$3x^2 - 2\sqrt{6}\,x + 2 = 0$$ $-2\sqrt{6}\,x$ को $-\sqrt{6}\,x - \sqrt{6}\,x$ में तोड़ो: $$\sqrt{3}x(\sqrt{3}x - \sqrt{2}) - \sqrt{2}(\sqrt{3}x - \sqrt{2}) = 0$$ $$(\sqrt{3}x - \sqrt{2})(\sqrt{3}x - \sqrt{2}) = 0$$ दोनों कोष्ठक देते हैं $$x = \sqrt{\tfrac{2}{3}}$$`,
        ),
      ),
      w.definition(
        t(
          r`**Repeated root.** When both factors are the same, the equation has **two equal roots**: one value, counted twice. On the graph, the curve just **touches** the $x$-axis instead of crossing it.`,
          r`**दोहराया मूल।** जब दोनों गुणनखंड एक जैसे हों, तो समीकरण के **दो बराबर मूल** होते हैं: एक ही मान, दो बार गिना गया। आलेख पर वक्र $x$-अक्ष को काटता नहीं, बस **छूता** है।`,
        ),
      ),
      g,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** Example 6: the plot, factorised. 12 m, and why −12.5 is thrown away. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const s = b.prop(middleSplitDef, "split", {
      a: 2,
      b: 1,
      c: -300,
      variable: "x",
      picked: null,
      choices: [
        [-20, 30],
        [-24, 25],
        [24, -25],
        [-15, 40],
        [12, -50],
        [-12, 50],
      ],
      canPick: true,
      showWorking: true,
      showRoots: true,
    });
    b.studentOnly(s.action(SplitAction.Pick));
    b.standsFor(s, "2x² + x − 300: pick two numbers that multiply to −600 and add to 1");
    const pick = choiceQuestion(b, {
      name: "pick",
      prompt: t(
        r`The roots are $12$ and $-12.5$. Which one is the plot's breadth?`,
        r`मूल हैं $12$ और $-12.5$। प्लॉट की चौड़ाई कौन-सा है?`,
      ),
      options: [
        {
          id: "right",
          label: t("12 m: a breadth can't be negative", "12 m: चौड़ाई ऋणात्मक नहीं हो सकती"),
        },
        {
          id: "both",
          label: t("Both work", "दोनों चलते हैं"),
          feedback: t(
            "Both satisfy the equation, but a plot can't be −12.5 m wide. The situation throws that root away.",
            "दोनों समीकरण संतुष्ट करते हैं, पर प्लॉट −12.5 m चौड़ा नहीं हो सकता। स्थिति उस मूल को हटा देती है।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
    });
    const done = w.body(
      t(
        r`So the breadth is 12 m and the length is $$2 \times 12 + 1 = 25 \text{ m}$$ No guessing this time. And 12 **is** the only answer that fits the plot: the equation's other root is negative.`,
        r`तो चौड़ाई 12 m है और लंबाई $$2 \times 12 + 1 = 25 \text{ m}$$ इस बार कोई अनुमान नहीं। और 12 ही प्लॉट पर बैठने वाला **अकेला** उत्तर है: समीकरण का दूसरा मूल ऋणात्मक है।`,
      ),
      "done",
      { isHidden: true },
    );
    b.when(s.on(SplitSignal.Picked), theBoard.show(pick), s.derived(SplitDerived.IsRight));
    b.when(pick.on(QuestionSignal.Correct), [theBoard.show(done), theBoard.pass()]);
    return column([
      w.title(t("Back to the plot", "फिर प्लॉट पर")),
      w.body(
        t(
          r`Riya factorises $$2x^2 + x - 300 = 0$$ Here $ac = 2 \times (-300) = -600$ and $b = 1$. A few pairs that multiply to −600 are offered. Which adds to 1?`,
          r`रिया गुणनखंड करती है $$2x^2 + x - 300 = 0$$ यहाँ $ac = 2 \times (-300) = -600$ और $b = 1$। −600 गुणनफल वाली कुछ जोड़ियाँ दी गई हैं। किसका योग 1 है?`,
        ),
      ),
      s,
      pick,
      done,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Exercise 4.2 Q3 worked, Q5 to do, then the mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const triangle = choiceQuestion(b, {
      name: "triangle",
      prompt: t(
        r`The altitude of a right triangle is 7 cm less than its base, and the hypotenuse is 13 cm. With base $x$, $x^2 + (x - 7)^2 = 13^2$ simplifies to $x^2 - 7x - 60 = 0$. What are the base and the altitude?`,
        r`एक समकोण त्रिभुज का शीर्षलंब उसके आधार से 7 cm कम है, और कर्ण 13 cm है। आधार $x$ लेने पर $x^2 + (x - 7)^2 = 13^2$ सरल होकर $x^2 - 7x - 60 = 0$ बनता है। आधार और शीर्षलंब क्या हैं?`,
      ),
      options: [
        { id: "right", label: t("Base 12 cm, altitude 5 cm", "आधार 12 cm, शीर्षलंब 5 cm") },
        {
          id: "neg",
          label: t("Base −5 cm, altitude −12 cm", "आधार −5 cm, शीर्षलंब −12 cm"),
          feedback: t(
            r`$(x - 12)(x + 5) = 0$ gives 12 or −5, but a length can't be negative. So $x = 12$ and the altitude is $12 - 7 = 5$.`,
            r`$(x - 12)(x + 5) = 0$ से 12 या −5 मिलता है, पर लंबाई ऋणात्मक नहीं हो सकती। तो $x = 12$ और शीर्षलंब $12 - 7 = 5$।`,
          ),
        },
        {
          id: "swap",
          label: t("Base 5 cm, altitude 12 cm", "आधार 5 cm, शीर्षलंब 12 cm"),
          feedback: t(
            "The altitude is 7 less than the base, so the base is the bigger one.",
            "शीर्षलंब आधार से 7 कम है, तो आधार बड़ा वाला है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        r`**Mission log.** ✓ The plot is 12 m by 25 m, found without guessing. ✓ We can factorise by splitting the middle term, and throw away roots that don't fit the situation. ✗ Some equations won't split into whole numbers. Next stop: Grandpa's way, completing the square.`,
        r`**मिशन लॉग।** ✓ प्लॉट 12 m × 25 m है, बिना अनुमान के मिला। ✓ हम मध्य पद तोड़कर गुणनखंड कर सकते हैं, और स्थिति से मेल न खाने वाले मूल हटा सकते हैं। ✗ कुछ समीकरण पूर्ण संख्याओं में नहीं टूटते। अगला पड़ाव: दादाजी का तरीक़ा, पूर्ण वर्ग बनाना।`,
      ),
      "log",
      { isHidden: true },
    );
    b.when(triangle.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([
      w.title(t("Your turn", "अब तुम्हारी बारी")),
      w.body(
        t(
          r`**Worked: two numbers have sum 27 and product 182.** Call one $x$; the other is $27 - x$. Then $$x(27 - x) = 182$$ $$x^2 - 27x + 182 = 0$$ Two numbers that multiply to 182 and add to −27 are −13 and −14, so $$(x - 13)(x - 14) = 0$$ The numbers are 13 and 14.`,
          r`**हल किया हुआ: दो संख्याओं का योग 27 और गुणनफल 182 है।** एक को $x$ कहो; दूसरी $27 - x$ है। तब $$x(27 - x) = 182$$ $$x^2 - 27x + 182 = 0$$ 182 गुणनफल और −27 योग वाली संख्याएँ −13 और −14 हैं, तो $$(x - 13)(x - 14) = 0$$ संख्याएँ 13 और 14 हैं।`,
        ),
      ),
      triangle,
      log,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [hook, root, zeroProduct, split, example4, repeated, inLife, yourTurn];

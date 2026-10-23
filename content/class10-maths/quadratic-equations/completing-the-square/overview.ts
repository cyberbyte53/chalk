import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  QuadraticSceneKind,
  SplitAction,
  TilesAction,
  TilesSignal,
  middleSplitDef,
  rootsGraphDef,
  squareTilesDef,
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

/** An equation that won't split, and Grandpa's slate. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const slate = sceneOn(
    b,
    "slate",
    QuadraticSceneKind.GrandpaSlate,
    "Grandpa on the verandah with an old slate showing a square, a strip cut in half round two sides and a dashed corner; Riya and Kabir lean in",
  );
  const s = b.prop(middleSplitDef, "split", {
    a: 1,
    b: 4,
    c: -1,
    variable: "x",
    picked: null,
    choices: [
      [1, -1],
      [-1, 1],
    ],
    canPick: true,
    showWorking: true,
    showRoots: true,
  });
  b.studentOnly(s.action(SplitAction.Pick));
  b.standsFor(
    s,
    "x² + 4x − 1: the only whole pairs that multiply to −1 are 1 and −1, which add to 0, not 4",
  );
  return column([
    w.title(t("An equation that won't split", "एक समीकरण जो नहीं टूटता")),
    w.body(
      t(
        r`Practising at home, Riya hits $$x^2 + 4x - 1 = 0$$ She needs two numbers that multiply to −1 and add to 4. Try the pairs below: neither works, and there are no others in whole numbers.`,
        r`घर पर अभ्यास करते हुए रिया को मिलता है $$x^2 + 4x - 1 = 0$$ उसे दो संख्याएँ चाहिए जिनका गुणनफल −1 और योग 4 हो। नीचे की जोड़ियाँ आज़माओ: कोई नहीं चलती, और पूर्ण संख्याओं में और कोई जोड़ी है ही नहीं।`,
      ),
    ),
    s,
    slate,
    w.body(
      t(
        r`Grandpa looks over from his chair. **"In my school we were taught Sridharacharya's way. It never gets stuck."** He picks up his old slate and draws a square.`,
        r`दादाजी अपनी कुर्सी से झाँकते हैं। **"हमारे स्कूल में श्रीधराचार्य का तरीक़ा सिखाया जाता था। वह कभी नहीं अटकता।"** वे अपनी पुरानी स्लेट उठाकर एक वर्ग बनाते हैं।`,
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** When x sits inside a square, take square roots (±). */
const squares = page(
  "squares",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(r`Solve $(x - 1)^2 = 16$.`, r`$(x - 1)^2 = 16$ हल करो।`),
      options: [
        { id: "right", label: t("x = 5 or x = −3", "x = 5 या x = −3") },
        {
          id: "plus",
          label: t("x = 5 only", "केवल x = 5"),
          feedback: t(
            r`$x - 1$ could be $+4$ **or** $-4$, since both square to 16. The second gives $x = -3$.`,
            r`$x - 1$, $+4$ **या** $-4$ हो सकता है, क्योंकि दोनों का वर्ग 16 है। दूसरे से $x = -3$ मिलता है।`,
          ),
        },
        {
          id: "seventeen",
          label: t("x = 17", "x = 17"),
          feedback: t(
            r`Undo the square first: take the square root of both sides, $x - 1 = \pm 4$.`,
            r`पहले वर्ग हटाओ: दोनों पक्षों का वर्गमूल लो, $x - 1 = \pm 4$।`,
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("When x is inside a square", "जब x वर्ग के अंदर हो")),
      w.body(
        t(
          r`Some equations are easy. $$x^2 = 9$$ means $x$ is a number whose square is 9: $x = 3$ or $x = -3$. We write this as $x = \pm 3$, read "plus or minus 3".`,
          r`कुछ समीकरण आसान होते हैं। $$x^2 = 9$$ का अर्थ है $x$ ऐसी संख्या है जिसका वर्ग 9 है: $x = 3$ या $x = -3$। इसे $x = \pm 3$ लिखते हैं, पढ़ते हैं "धन या ऋण 3"।`,
        ),
      ),
      w.body(
        t(
          r`It works just as well when a whole bracket is squared: $$(x + 2)^2 = 9$$ means $$x + 2 = \pm 3$$ so $x = 1$ or $x = -5$.`,
          r`जब पूरा कोष्ठक वर्ग हो, तब भी यही चलता है: $$(x + 2)^2 = 9$$ का अर्थ है $$x + 2 = \pm 3$$ तो $x = 1$ या $x = -5$।`,
        ),
      ),
      w.body(
        t(
          r`So **if we can get $x$ completely inside one square**, any quadratic becomes easy. That is what completing the square does.`,
          r`तो **अगर हम $x$ को पूरी तरह एक वर्ग के अंदर ला सकें**, तो कोई भी द्विघात आसान हो जाता है। पूर्ण वर्ग बनाना यही करता है।`,
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Fig 4.2 with tiles, stepped by the learner: x² + 4x = (x + 2)² − 4. */
const tiles = page(
  "tiles",
  (b) => {
    const w = wordsOn(b);
    const tl = b.prop(squareTilesDef, "tiles", {
      b: 4,
      c: null,
      step: 0,
      canStep: true,
      canSetB: false,
      showAlgebra: true,
    });
    b.studentOnly(tl.action(TilesAction.Next));
    b.standsFor(
      tl,
      "tiles for x² + 4x: an x by x square and a 4 by x strip; step by step the strip is halved, the halves go round two sides, and a 2 by 2 corner is missing",
    );
    b.witness(
      tl.learner(TilesAction.Next),
      tl.learner(TilesAction.Next),
      tl.learner(TilesAction.Next),
    );
    const result = w.definition(
      t(
        r`**Completing the square.** The square with the missing corner is $(x + 2)^2$, and the corner is $2^2 = 4$. So $$x^2 + 4x = (x + 2)^2 - 4$$ In general, take **half the coefficient of $x$**, and square it: $$x^2 + bx = \left(x + \tfrac{b}{2}\right)^2 - \left(\tfrac{b}{2}\right)^2$$`,
        r`**पूर्ण वर्ग बनाना।** कोना छूटा हुआ वर्ग $(x + 2)^2$ है, और कोना $2^2 = 4$ है। तो $$x^2 + 4x = (x + 2)^2 - 4$$ आम तौर पर, **$x$ के गुणांक का आधा** लो, और उसका वर्ग करो: $$x^2 + bx = \left(x + \tfrac{b}{2}\right)^2 - \left(\tfrac{b}{2}\right)^2$$`,
      ),
      "result",
      { isHidden: true },
    );
    b.when(tl.on(TilesSignal.Completed), [theBoard.show(result), theBoard.pass()]);
    return column([
      w.title(t("Making a square from tiles", "टाइलों से वर्ग बनाना")),
      w.body(
        t(
          r`Think of $x^2$ as a square tile, $x$ by $x$, and $4x$ as a strip, 4 by $x$. Can we arrange them into one big square? **Tap next to go step by step.**`,
          r`$x^2$ को एक वर्ग टाइल मानो, $x$ गुणा $x$, और $4x$ को एक पट्टी, 4 गुणा $x$। क्या इन्हें एक बड़े वर्ग में सजा सकते हैं? **क़दम-क़दम जाने के लिए आगे दबाओ।**`,
        ),
      ),
      tl,
      result,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Solving x² + 4x − 5 = 0 by completing the square. */
const solve = page(
  "solve",
  (b) => {
    const w = wordsOn(b);
    const tl = b.prop(squareTilesDef, "tiles", {
      b: 4,
      c: -5,
      step: 3,
      canStep: false,
      canSetB: false,
      showAlgebra: true,
    });
    b.standsFor(tl, "the completed square for x² + 4x − 5 = 0, giving (x + 2)² = 9");
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(r`Complete the square: $x^2 + 6x = \;?$`, r`पूर्ण वर्ग बनाओ: $x^2 + 6x = \;?$`),
      options: [
        { id: "right", label: t(r`$(x + 3)^2 - 9$`, r`$(x + 3)^2 - 9$`) },
        {
          id: "six",
          label: t(r`$(x + 6)^2 - 36$`, r`$(x + 6)^2 - 36$`),
          feedback: t(
            r`Use **half** of 6. $(x + 6)^2 = x^2 + 12x + 36$, which has $12x$, not $6x$.`,
            r`6 का **आधा** लो। $(x + 6)^2 = x^2 + 12x + 36$, जिसमें $12x$ है, $6x$ नहीं।`,
          ),
        },
        {
          id: "plus",
          label: t(r`$(x + 3)^2 + 9$`, r`$(x + 3)^2 + 9$`),
          feedback: t(
            r`$(x + 3)^2 = x^2 + 6x + 9$ has an extra 9, so **subtract** it to get back $x^2 + 6x$.`,
            r`$(x + 3)^2 = x^2 + 6x + 9$ में 9 ज़्यादा है, इसलिए वापस $x^2 + 6x$ पाने के लिए उसे **घटाओ**।`,
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Solving with the completed square", "पूर्ण वर्ग से हल करना")),
      w.body(
        t(
          r`Take $$x^2 + 4x - 5 = 0$$ Replace $x^2 + 4x$ by $(x + 2)^2 - 4$: $$(x + 2)^2 - 4 - 5 = 0$$ $$(x + 2)^2 = 9$$ Now $x$ is inside one square, so $$x + 2 = \pm 3$$ which gives $x = 1$ or $x = -5$.`,
          r`लो $$x^2 + 4x - 5 = 0$$ $x^2 + 4x$ की जगह $(x + 2)^2 - 4$ रखो: $$(x + 2)^2 - 4 - 5 = 0$$ $$(x + 2)^2 = 9$$ अब $x$ एक वर्ग के अंदर है, तो $$x + 2 = \pm 3$$ जिससे $x = 1$ या $x = -5$।`,
        ),
      ),
      tl,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** When a ≠ 1: divide by a first (Example 7), or multiply to make a perfect square. */
const aNotOne = page(
  "a-not-one",
  (b) => {
    const w = wordsOn(b);
    const g = b.prop(
      rootsGraphDef,
      "graph",
      graph(2, -5, 3, { xMin: -0.5, xMax: 2.5, yMin: -1, yMax: 3 }),
    );
    b.standsFor(g, "the graph of y = 2x² − 5x + 3 crossing the x-axis at 1 and 3/2");
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        r`To complete the square in $3x^2 - 5x + 2 = 0$, what is the first step?`,
        r`$3x^2 - 5x + 2 = 0$ में पूर्ण वर्ग बनाने का पहला क़दम क्या है?`,
      ),
      options: [
        {
          id: "right",
          label: t(
            r`Divide every term by 3, so $x^2$ stands alone`,
            r`हर पद को 3 से भाग दो, ताकि $x^2$ अकेला रहे`,
          ),
        },
        {
          id: "half",
          label: t(r`Add $\left(\tfrac{5}{2}\right)^2$`, r`$\left(\tfrac{5}{2}\right)^2$ जोड़ो`),
          feedback: t(
            r`The half-and-square trick only works when the $x^2$ term is just $x^2$. Divide by 3 first (or multiply by 3 to get $(3x)^2$).`,
            r`आधा-और-वर्ग वाली तरकीब तभी चलती है जब $x^2$ वाला पद केवल $x^2$ हो। पहले 3 से भाग दो (या $(3x)^2$ पाने के लिए 3 से गुणा करो)।`,
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("When the x² has a number in front", "जब x² के आगे कोई संख्या हो")),
      w.body(
        t(
          r`The half-and-square trick needs the equation to start with $x^2$ alone. So first **divide every term by $a$**. NCERT's Example 7: $$2x^2 - 5x + 3 = 0$$ Divide by 2: $$x^2 - \tfrac{5}{2}x + \tfrac{3}{2} = 0$$ Half of $\tfrac{5}{2}$ is $\tfrac{5}{4}$, so $$\left(x - \tfrac{5}{4}\right)^2 - \tfrac{25}{16} + \tfrac{3}{2} = 0$$ $$\left(x - \tfrac{5}{4}\right)^2 = \tfrac{1}{16}$$ $$x - \tfrac{5}{4} = \pm \tfrac{1}{4}$$ So $x = \tfrac{3}{2}$ or $x = 1$, the same roots factorising gave.`,
          r`आधा-और-वर्ग वाली तरकीब के लिए समीकरण अकेले $x^2$ से शुरू होना चाहिए। इसलिए पहले **हर पद को $a$ से भाग दो**। NCERT का उदाहरण 7: $$2x^2 - 5x + 3 = 0$$ 2 से भाग देने पर: $$x^2 - \tfrac{5}{2}x + \tfrac{3}{2} = 0$$ $\tfrac{5}{2}$ का आधा $\tfrac{5}{4}$ है, तो $$\left(x - \tfrac{5}{4}\right)^2 - \tfrac{25}{16} + \tfrac{3}{2} = 0$$ $$\left(x - \tfrac{5}{4}\right)^2 = \tfrac{1}{16}$$ $$x - \tfrac{5}{4} = \pm \tfrac{1}{4}$$ तो $x = \tfrac{3}{2}$ या $x = 1$, वही मूल जो गुणनखंड से मिले थे।`,
        ),
      ),
      g,
      w.note(
        t(
          r`Another way: multiply by $a$ instead, so the first term is a perfect square. For $3x^2 - 5x + 2 = 0$, multiplying by 3 gives $9x^2 - 15x + 6 = 0$, and $9x^2 = (3x)^2$.`,
          r`दूसरा तरीक़ा: $a$ से गुणा करो, ताकि पहला पद पूर्ण वर्ग बने। $3x^2 - 5x + 2 = 0$ को 3 से गुणा करने पर $9x^2 - 15x + 6 = 0$, और $9x^2 = (3x)^2$।`,
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Example 8: roots that are irrational. */
const irrational = page("irrational", (b) => {
  const w = wordsOn(b);
  const g = b.prop(
    rootsGraphDef,
    "graph",
    graph(5, -6, -2, { xMin: -1, xMax: 2, yMin: -4, yMax: 4 }),
  );
  b.standsFor(g, "the graph of y = 5x² − 6x − 2 crossing the x-axis at about −0.27 and 1.47");
  return column([
    w.title(t("Roots that aren't neat", "मूल जो साफ़-सुथरे न हों")),
    w.body(
      t(
        r`NCERT's Example 8: $$5x^2 - 6x - 2 = 0$$ Multiply by 5 so the first term is $(5x)^2$: $$25x^2 - 30x - 10 = 0$$ $$(5x)^2 - 2 \times (5x) \times 3 + 3^2 - 3^2 - 10 = 0$$ $$(5x - 3)^2 = 19$$ $$5x - 3 = \pm\sqrt{19}$$ $$x = \frac{3 \pm \sqrt{19}}{5}$$`,
        r`NCERT का उदाहरण 8: $$5x^2 - 6x - 2 = 0$$ 5 से गुणा करो ताकि पहला पद $(5x)^2$ हो: $$25x^2 - 30x - 10 = 0$$ $$(5x)^2 - 2 \times (5x) \times 3 + 3^2 - 3^2 - 10 = 0$$ $$(5x - 3)^2 = 19$$ $$5x - 3 = \pm\sqrt{19}$$ $$x = \frac{3 \pm \sqrt{19}}{5}$$`,
      ),
    ),
    w.body(
      t(
        r`These roots are irrational, about 1.47 and −0.27. No pair of whole numbers could ever have split this one. Completing the square doesn't care.`,
        r`ये मूल अपरिमेय हैं, लगभग 1.47 और −0.27। कोई पूर्ण-संख्या जोड़ी इसे कभी नहीं तोड़ पाती। पूर्ण वर्ग बनाने को इससे फ़र्क़ नहीं पड़ता।`,
      ),
    ),
    g,
    space(),
  ]);
});

/** Example 9: a square equal to a negative number, so no real roots. */
const noReal = page(
  "no-real",
  (b) => {
    const w = wordsOn(b);
    const g = b.prop(
      rootsGraphDef,
      "graph",
      graph(4, 3, 5, { xMin: -2, xMax: 1.5, yMin: -1, yMax: 8 }),
    );
    b.standsFor(g, "the graph of y = 4x² + 3x + 5, entirely above the x-axis: it never meets it");
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        r`Why can't $\left(2x + \tfrac{3}{4}\right)^2$ equal $-\tfrac{71}{16}$?`,
        r`$\left(2x + \tfrac{3}{4}\right)^2$, $-\tfrac{71}{16}$ के बराबर क्यों नहीं हो सकता?`,
      ),
      options: [
        {
          id: "right",
          label: t(
            "The square of a real number is never negative",
            "किसी वास्तविक संख्या का वर्ग कभी ऋणात्मक नहीं होता",
          ),
        },
        {
          id: "fraction",
          label: t("Because it's a fraction", "क्योंकि यह भिन्न है"),
          feedback: t(
            r`Fractions can be squares ($\tfrac{1}{4} = (\tfrac{1}{2})^2$). The problem is the minus sign: positive × positive and negative × negative are both positive.`,
            r`भिन्न वर्ग हो सकती हैं ($\tfrac{1}{4} = (\tfrac{1}{2})^2$)। दिक़्क़त ऋण चिह्न है: धन × धन और ऋण × ऋण दोनों धनात्मक होते हैं।`,
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("When there is no real root", "जब कोई वास्तविक मूल न हो")),
      w.body(
        t(
          r`NCERT's Example 9: $$4x^2 + 3x + 5 = 0$$ Here $4x^2 = (2x)^2$, so build the square around $2x$: $$\begin{aligned} (2x)^2 + 2(2x)\left(\tfrac{3}{4}\right) + \tfrac{9}{16} - \tfrac{9}{16} + 5 &= 0 \\ \left(2x + \tfrac{3}{4}\right)^2 &= \tfrac{9}{16} - 5 = -\tfrac{71}{16} \end{aligned}$$ A square equal to a negative number.`,
          r`NCERT का उदाहरण 9: $$4x^2 + 3x + 5 = 0$$ यहाँ $4x^2 = (2x)^2$, तो वर्ग $2x$ के चारों ओर बनाओ: $$\begin{aligned} (2x)^2 + 2(2x)\left(\tfrac{3}{4}\right) + \tfrac{9}{16} - \tfrac{9}{16} + 5 &= 0 \\ \left(2x + \tfrac{3}{4}\right)^2 &= \tfrac{9}{16} - 5 = -\tfrac{71}{16} \end{aligned}$$ एक वर्ग जो ऋणात्मक संख्या के बराबर है।`,
        ),
      ),
      w.definition(
        t(
          r`**No real roots.** If completing the square gives (a square) = (a negative number), no real value of $x$ satisfies the equation. We say it has **no real roots**. Its graph never meets the $x$-axis.`,
          r`**कोई वास्तविक मूल नहीं।** अगर पूर्ण वर्ग बनाने पर (एक वर्ग) = (एक ऋणात्मक संख्या) मिले, तो $x$ का कोई वास्तविक मान समीकरण संतुष्ट नहीं करता। हम कहते हैं इसके **कोई वास्तविक मूल नहीं** हैं। इसका आलेख $x$-अक्ष से कभी नहीं मिलता।`,
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

/** Grandpa's slate: x² + 4x − 1 = 0 solved, and where the method comes from. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const tl = b.prop(squareTilesDef, "tiles", {
      b: 4,
      c: -1,
      step: 3,
      canStep: false,
      canSetB: false,
      showAlgebra: true,
    });
    b.standsFor(tl, "the completed square for x² + 4x − 1 = 0: (x + 2)² = 5");
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        r`So what are the roots of $x^2 + 4x - 1 = 0$?`,
        r`तो $x^2 + 4x - 1 = 0$ के मूल क्या हैं?`,
      ),
      options: [
        { id: "right", label: t(r`$-2 \pm \sqrt{5}$`, r`$-2 \pm \sqrt{5}$`) },
        {
          id: "sign",
          label: t(r`$2 \pm \sqrt{5}$`, r`$2 \pm \sqrt{5}$`),
          feedback: t(
            r`From $x + 2 = \pm\sqrt{5}$, subtract 2: $x = -2 \pm \sqrt{5}$.`,
            r`$x + 2 = \pm\sqrt{5}$ से 2 घटाओ: $x = -2 \pm \sqrt{5}$।`,
          ),
        },
        {
          id: "five",
          label: t(r`$-2 \pm 5$`, r`$-2 \pm 5$`),
          feedback: t(
            r`$(x + 2)^2 = 5$ means $x + 2$ is a square root of 5, which is $\pm\sqrt{5}$, not $\pm 5$.`,
            r`$(x + 2)^2 = 5$ का अर्थ है $x + 2$, 5 का वर्गमूल है, जो $\pm\sqrt{5}$ है, $\pm 5$ नहीं।`,
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Grandpa's slate", "दादाजी की स्लेट")),
      w.body(
        t(
          r`On his slate Grandpa writes Riya's equation, $x^2 + 4x - 1 = 0$, as $$(x + 2)^2 - 4 - 1 = 0$$ $$(x + 2)^2 = 5$$ "There," he says. "Now it's just a square root."`,
          r`अपनी स्लेट पर दादाजी रिया का समीकरण $x^2 + 4x - 1 = 0$ ऐसे लिखते हैं: $$(x + 2)^2 - 4 - 1 = 0$$ $$(x + 2)^2 = 5$$ "लो," वे कहते हैं। "अब बस वर्गमूल लेना है।"`,
        ),
      ),
      tl,
      ask,
      w.note(
        t(
          "Grandpa's history lesson: Brahmagupta (C.E. 598–665) gave a formula for equations like ax² + bx = c. Sridharacharya (C.E. 1025) solved quadratics by completing the square, as quoted by Bhaskara II. Al-Khwarizmi (about C.E. 800) also studied them.",
          "दादाजी का इतिहास-पाठ: ब्रह्मगुप्त (ई. 598–665) ने ax² + bx = c जैसे समीकरणों का सूत्र दिया। श्रीधराचार्य (ई. 1025) ने पूर्ण वर्ग बनाकर द्विघात हल किए, जैसा भास्कर द्वितीय ने उद्धृत किया। अल-ख़्वारिज़्मी (लगभग ई. 800) ने भी इनका अध्ययन किया।",
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Exercise 4.3 Q1: (i) worked, (ii) to do. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        r`By completing the square, $2x^2 + x - 4 = 0$ becomes $\left(x + \tfrac{1}{4}\right)^2 = \tfrac{33}{16}$. What are its roots?`,
        r`पूर्ण वर्ग बनाने पर $2x^2 + x - 4 = 0$ बनता है $\left(x + \tfrac{1}{4}\right)^2 = \tfrac{33}{16}$। इसके मूल क्या हैं?`,
      ),
      options: [
        {
          id: "right",
          label: t(r`$\dfrac{-1 \pm \sqrt{33}}{4}$`, r`$\dfrac{-1 \pm \sqrt{33}}{4}$`),
        },
        {
          id: "plus",
          label: t(r`$\dfrac{1 \pm \sqrt{33}}{4}$`, r`$\dfrac{1 \pm \sqrt{33}}{4}$`),
          feedback: t(
            r`$x + \tfrac{1}{4} = \pm\tfrac{\sqrt{33}}{4}$, so subtract $\tfrac{1}{4}$: the $1$ comes with a minus.`,
            r`$x + \tfrac{1}{4} = \pm\tfrac{\sqrt{33}}{4}$, तो $\tfrac{1}{4}$ घटाओ: $1$ ऋण के साथ आता है।`,
          ),
        },
        {
          id: "none",
          label: t("No real roots", "कोई वास्तविक मूल नहीं"),
          feedback: t(
            r`The right side, $\tfrac{33}{16}$, is positive, so the square root exists.`,
            r`दायाँ पक्ष, $\tfrac{33}{16}$, धनात्मक है, इसलिए वर्गमूल मौजूद है।`,
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        r`**Mission log.** ✓ Completing the square solves equations that won't split: $x^2 + 4x - 1 = 0$ gives $-2 \pm \sqrt{5}$. ✓ It can even tell us when there are no real roots. ✗ It takes many steps every time. Next stop: do it once for every equation, and get a formula.`,
        r`**मिशन लॉग।** ✓ पूर्ण वर्ग बनाना उन समीकरणों को हल करता है जो नहीं टूटते: $x^2 + 4x - 1 = 0$ से $-2 \pm \sqrt{5}$ मिलता है। ✓ यह यह भी बता सकता है कि कब कोई वास्तविक मूल नहीं। ✗ इसमें हर बार कई क़दम लगते हैं। अगला पड़ाव: इसे सब समीकरणों के लिए एक बार करो, और एक सूत्र पाओ।`,
      ),
      "log",
      { isHidden: true },
    );
    b.when(ask.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([
      w.title(t("Your turn", "अब तुम्हारी बारी")),
      w.body(
        t(
          r`**Worked: $2x^2 - 7x + 3 = 0$.** Divide by 2: $$x^2 - \tfrac{7}{2}x + \tfrac{3}{2} = 0$$ Half of $\tfrac{7}{2}$ is $\tfrac{7}{4}$: $$\left(x - \tfrac{7}{4}\right)^2 = \tfrac{49}{16} - \tfrac{24}{16} = \tfrac{25}{16}$$ $$x - \tfrac{7}{4} = \pm\tfrac{5}{4}$$ So $x = 3$ or $x = \tfrac{1}{2}$.`,
          r`**हल किया हुआ: $2x^2 - 7x + 3 = 0$।** 2 से भाग दो: $$x^2 - \tfrac{7}{2}x + \tfrac{3}{2} = 0$$ $\tfrac{7}{2}$ का आधा $\tfrac{7}{4}$ है: $$\left(x - \tfrac{7}{4}\right)^2 = \tfrac{49}{16} - \tfrac{24}{16} = \tfrac{25}{16}$$ $$x - \tfrac{7}{4} = \pm\tfrac{5}{4}$$ तो $x = 3$ या $x = \tfrac{1}{2}$।`,
        ),
      ),
      ask,
      log,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [
  hook,
  squares,
  tiles,
  solve,
  aNotOne,
  irrational,
  noReal,
  inLife,
  yourTurn,
];

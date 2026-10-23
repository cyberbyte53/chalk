import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  AreaAction,
  Coefficient,
  QuadraticSceneKind,
  RootsAction,
  areaBuilderDef,
  rootsGraphDef,
} from "@chalk/prop-quadratics";
import { sceneOn } from "../kit";

const r = String.raw;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** The toys' equation, and Riya wanting one rule instead of many steps. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const stall = sceneOn(
    b,
    "stall",
    QuadraticSceneKind.ToyStall,
    "a stall table with rows of small handmade toys and a price tag with a question mark; Riya doing sums while Mom counts notes",
  );
  return column([
    w.title(t("One rule for every equation", "हर समीकरण के लिए एक नियम")),
    stall,
    w.body(
      t(
        r`Next on the list: the toys. The class will make $x$ toys, and each will cost $55 - x$ rupees to make; the day's cost must be ₹750. That's $$x^2 - 55x + 750 = 0$$ Riya sighs. "Completing the square again, with 55 and 750?" Kabir: "Can't you just do it **once**, for every equation, and keep the answer?" She can. That's this stop.`,
        r`सूची में अगला: खिलौने। कक्षा $x$ खिलौने बनाएगी, और हर एक की लागत $55 - x$ रुपये होगी; दिन की लागत ₹750 होनी चाहिए। यानी $$x^2 - 55x + 750 = 0$$ रिया आह भरती है। "फिर से पूर्ण वर्ग, 55 और 750 के साथ?" कबीर: "क्या तुम इसे हर समीकरण के लिए **एक बार** करके उत्तर रख नहीं सकती?" कर सकती है। यही यह पड़ाव है।`,
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Completing the square on ax² + bx + c = 0, one step per line. */
const derive = page("derive", (b) => {
  const w = wordsOn(b);
  return column([
    w.title(t("Completing the square, once and for all", "पूर्ण वर्ग, एक बार हमेशा के लिए")),
    w.body(
      t(
        r`Start with any quadratic equation, with $a \neq 0$: $$ax^2 + bx + c = 0$$ Divide every term by $a$: $$x^2 + \frac{b}{a}x + \frac{c}{a} = 0$$ Half of $\frac{b}{a}$ is $\frac{b}{2a}$. Complete the square: $$\left(x + \frac{b}{2a}\right)^2 - \left(\frac{b}{2a}\right)^2 + \frac{c}{a} = 0$$ Move the numbers to the right, over a common denominator $4a^2$: $$\left(x + \frac{b}{2a}\right)^2 = \frac{b^2 - 4ac}{4a^2}$$`,
        r`कोई भी द्विघात समीकरण लो, $a \neq 0$ के साथ: $$ax^2 + bx + c = 0$$ हर पद को $a$ से भाग दो: $$x^2 + \frac{b}{a}x + \frac{c}{a} = 0$$ $\frac{b}{a}$ का आधा $\frac{b}{2a}$ है। पूर्ण वर्ग बनाओ: $$\left(x + \frac{b}{2a}\right)^2 - \left(\frac{b}{2a}\right)^2 + \frac{c}{a} = 0$$ संख्याओं को दाईं ओर ले जाओ, उभयनिष्ठ हर $4a^2$ पर: $$\left(x + \frac{b}{2a}\right)^2 = \frac{b^2 - 4ac}{4a^2}$$`,
      ),
    ),
    w.body(
      t(
        r`If $b^2 - 4ac \geq 0$, take square roots. The square root of $4a^2$ is $2a$ (the $\pm$ covers its sign): $$x + \frac{b}{2a} = \frac{\pm\sqrt{b^2 - 4ac}}{2a}$$ Subtract $\frac{b}{2a}$: $$x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$$`,
        r`अगर $b^2 - 4ac \geq 0$, तो वर्गमूल लो। $4a^2$ का वर्गमूल $2a$ है (उसका चिह्न $\pm$ सँभाल लेता है): $$x + \frac{b}{2a} = \frac{\pm\sqrt{b^2 - 4ac}}{2a}$$ $\frac{b}{2a}$ घटाओ: $$x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$$`,
      ),
    ),
    space(),
  ]);
});

/** The quadratic formula, stated, and tried on a graph. */
const formula = page(
  "formula",
  (b) => {
    const w = wordsOn(b);
    const g = b.prop(rootsGraphDef, "graph", {
      a: 1,
      b: -2,
      c: -3,
      level: 0,
      levelLabel: "",
      variable: "x",
      yName: "y",
      window: { xMin: -5, xMax: 5, yMin: -6, yMax: 6 },
      canSet: [Coefficient.A, Coefficient.B, Coefficient.C],
      canSetLevel: false,
      step: 1,
      showEquation: true,
      showDiscriminant: false,
      showRoots: true,
    });
    b.studentOnly(g.action(RootsAction.Nudge));
    b.standsFor(
      g,
      "the graph of y = ax² + bx + c with − and + buttons for a, b and c; the roots from the formula are marked where it meets the x-axis",
    );
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        r`For $3x^2 - 5x + 2 = 0$, what are $a$, $b$ and $c$?`,
        r`$3x^2 - 5x + 2 = 0$ के लिए $a$, $b$ और $c$ क्या हैं?`,
      ),
      options: [
        { id: "right", label: t(r`$a = 3,\ b = -5,\ c = 2$`, r`$a = 3,\ b = -5,\ c = 2$`) },
        {
          id: "sign",
          label: t(r`$a = 3,\ b = 5,\ c = 2$`, r`$a = 3,\ b = 5,\ c = 2$`),
          feedback: t(
            r`The sign belongs to the number: the term is $-5x$, so $b = -5$. Getting this sign wrong is the most common slip with the formula.`,
            r`चिह्न संख्या का हिस्सा है: पद $-5x$ है, तो $b = -5$। सूत्र में सबसे आम ग़लती यही चिह्न है।`,
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("The quadratic formula", "द्विघाती सूत्र")),
      w.definition(
        t(
          r`**The quadratic formula.** If $b^2 - 4ac \geq 0$, the roots of $ax^2 + bx + c = 0$ are $$x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$$ The $+$ gives one root and the $-$ the other. If $b^2 - 4ac < 0$, there are **no real roots**, because no real number squares to a negative.`,
          r`**द्विघाती सूत्र।** अगर $b^2 - 4ac \geq 0$, तो $ax^2 + bx + c = 0$ के मूल हैं $$x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$$ $+$ से एक मूल मिलता है और $-$ से दूसरा। अगर $b^2 - 4ac < 0$, तो **कोई वास्तविक मूल नहीं**, क्योंकि किसी वास्तविक संख्या का वर्ग ऋणात्मक नहीं होता।`,
        ),
      ),
      w.body(
        t(
          "Change a, b and c below. The marked roots are exactly what the formula gives; when the curve stops meeting the x-axis, the formula has no real answer either.",
          "नीचे a, b और c बदलो। चिह्नित मूल ठीक वही हैं जो सूत्र देता है; जब वक्र x-अक्ष से मिलना बंद करता है, तब सूत्र का भी कोई वास्तविक उत्तर नहीं होता।",
        ),
      ),
      g,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Example 10: the 528 m² plot, by the formula. */
const example10 = page("example-10", (b) => {
  const w = wordsOn(b);
  const plot = b.prop(areaBuilderDef, "plot", {
    x: 16,
    m: 2,
    n: 1,
    target: 528,
    step: 1,
    xMax: 20,
    unit: "m",
    canMove: true,
    showEquation: true,
  });
  b.studentOnly(plot.action(AreaAction.Nudge));
  b.standsFor(plot, "a plot of breadth 16 m and length 33 m, area 528 m²");
  return column([
    w.title(t("Example: a plot of 528 m²", "उदाहरण: 528 m² का प्लॉट")),
    w.body(
      t(
        r`A plot has area 528 m², and its length is one more than twice its breadth $x$. So $$2x^2 + x - 528 = 0$$ with $a = 2$, $b = 1$, $c = -528$. The formula gives $$x = \frac{-1 \pm \sqrt{1 + 4 \times 2 \times 528}}{4}$$ $$x = \frac{-1 \pm \sqrt{4225}}{4} = \frac{-1 \pm 65}{4}$$ so $x = 16$ or $x = -\tfrac{33}{2}$. A breadth can't be negative, so the breadth is 16 m and the length 33 m.`,
        r`एक प्लॉट का क्षेत्रफल 528 m² है, और उसकी लंबाई चौड़ाई $x$ के दुगुने से एक ज़्यादा है। तो $$2x^2 + x - 528 = 0$$ जहाँ $a = 2$, $b = 1$, $c = -528$। सूत्र देता है $$x = \frac{-1 \pm \sqrt{1 + 4 \times 2 \times 528}}{4}$$ $$x = \frac{-1 \pm \sqrt{4225}}{4} = \frac{-1 \pm 65}{4}$$ तो $x = 16$ या $x = -\tfrac{33}{2}$। चौड़ाई ऋणात्मक नहीं हो सकती, तो चौड़ाई 16 m और लंबाई 33 m।`,
      ),
    ),
    plot,
    w.note(
      t(
        "Try finding a pair that splits 2x² + x − 528 and you'll see why the formula is welcome.",
        "2x² + x − 528 को तोड़ने वाली जोड़ी ढूँढकर देखो, समझ आएगा कि सूत्र क्यों अच्छा है।",
      ),
    ),
    space(),
  ]);
});

/** Example 11: consecutive odd numbers. */
const example11 = page(
  "example-11",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        r`$x^2 + 2x - 143 = 0$ gives $x = 11$ or $x = -13$. The question asked for odd **positive** integers. What are they?`,
        r`$x^2 + 2x - 143 = 0$ से $x = 11$ या $x = -13$ मिलता है। प्रश्न विषम **धनात्मक** पूर्णांक पूछता है। वे क्या हैं?`,
      ),
      options: [
        { id: "right", label: t("11 and 13", "11 और 13") },
        {
          id: "neg",
          label: t("−13 and −11", "−13 और −11"),
          feedback: t(
            "These do have squares adding to 290, but they aren't positive. The question rules them out.",
            "इनके वर्गों का योग भी 290 है, पर ये धनात्मक नहीं हैं। प्रश्न इन्हें हटा देता है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Example: two odd numbers", "उदाहरण: दो विषम संख्याएँ")),
      w.body(
        t(
          r`Find two consecutive odd positive integers whose squares add to 290. Call the smaller one $x$; the next odd number is $x + 2$. $$x^2 + (x + 2)^2 = 290$$ $$2x^2 + 4x - 286 = 0$$ $$x^2 + 2x - 143 = 0$$ The formula gives $$x = \frac{-2 \pm \sqrt{4 + 572}}{2} = \frac{-2 \pm 24}{2}$$`,
          r`दो क्रमागत विषम धनात्मक पूर्णांक ढूँढो जिनके वर्गों का योग 290 हो। छोटे को $x$ कहो; अगली विषम संख्या $x + 2$ है। $$x^2 + (x + 2)^2 = 290$$ $$2x^2 + 4x - 286 = 0$$ $$x^2 + 2x - 143 = 0$$ सूत्र देता है $$x = \frac{-2 \pm \sqrt{4 + 572}}{2} = \frac{-2 \pm 24}{2}$$`,
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Example 13: three equations, three outcomes. */
const example13 = page(
  "example-13",
  (b) => {
    const w = wordsOn(b);
    const g = b.prop(rootsGraphDef, "graph", {
      a: 1,
      b: 4,
      c: 5,
      level: 0,
      levelLabel: "",
      variable: "x",
      yName: "y",
      window: { xMin: -5, xMax: 1, yMin: -1, yMax: 6 },
      canSet: [],
      canSetLevel: false,
      step: 1,
      showEquation: true,
      showDiscriminant: false,
      showRoots: true,
    });
    b.standsFor(
      g,
      "the graph of y = x² + 4x + 5, whose lowest point is at height 1: it never meets the x-axis",
    );
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(r`Which of these has no real roots?`, r`इनमें से किसके कोई वास्तविक मूल नहीं हैं?`),
      options: [
        { id: "right", label: t(r`$x^2 + 4x + 5 = 0$`, r`$x^2 + 4x + 5 = 0$`) },
        {
          id: "one",
          label: t(r`$3x^2 - 5x + 2 = 0$`, r`$3x^2 - 5x + 2 = 0$`),
          feedback: t(
            r`Here $b^2 - 4ac = 25 - 24 = 1$, which is positive, so the roots are 1 and $\tfrac{2}{3}$.`,
            r`यहाँ $b^2 - 4ac = 25 - 24 = 1$, जो धनात्मक है, तो मूल 1 और $\tfrac{2}{3}$ हैं।`,
          ),
        },
        {
          id: "zero",
          label: t(r`$2x^2 - 2\sqrt{2}x + 1 = 0$`, r`$2x^2 - 2\sqrt{2}x + 1 = 0$`),
          feedback: t(
            r`Here $b^2 - 4ac = 8 - 8 = 0$. The square root of 0 is 0, so both roots are $\tfrac{1}{\sqrt{2}}$: real and equal.`,
            r`यहाँ $b^2 - 4ac = 8 - 8 = 0$। 0 का वर्गमूल 0 है, तो दोनों मूल $\tfrac{1}{\sqrt{2}}$ हैं: वास्तविक और बराबर।`,
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Example: three equations", "उदाहरण: तीन समीकरण")),
      w.body(
        t(
          r`Always work out $b^2 - 4ac$ first. For $$x^2 + 4x + 5 = 0$$ it is $16 - 20 = -4$. The formula would need $\sqrt{-4}$, which is not a real number, so there are no real roots. The graph agrees: it stays above the $x$-axis.`,
          r`हमेशा पहले $b^2 - 4ac$ निकालो। $$x^2 + 4x + 5 = 0$$ के लिए यह $16 - 20 = -4$ है। सूत्र को $\sqrt{-4}$ चाहिए, जो वास्तविक संख्या नहीं है, तो कोई वास्तविक मूल नहीं। आलेख भी यही कहता है: वह $x$-अक्ष के ऊपर ही रहता है।`,
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

/** The toys: 25 or 30, and both make sense. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const stall = sceneOn(
      b,
      "stall",
      QuadraticSceneKind.ToyStall,
      "the toy stall with its price tag",
    );
    const price = choiceQuestion(b, {
      name: "price",
      prompt: t(
        "If the class makes 30 toys, how much does each one cost to make?",
        "अगर कक्षा 30 खिलौने बनाए, तो हर एक की लागत कितनी है?",
      ),
      options: [
        { id: "right", label: t("₹25", "₹25") },
        {
          id: "thirty",
          label: t("₹30", "₹30"),
          feedback: t(
            r`The cost per toy is $55 - x$. With $x = 30$, that's $55 - 30 = 25$.`,
            r`हर खिलौने की लागत $55 - x$ है। $x = 30$ पर यह $55 - 30 = 25$ है।`,
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const both = w.body(
      t(
        r`Check: $30 \times 25 = 750$ and $25 \times 30 = 750$. This time **both roots make sense**: 25 toys costing ₹30 each to make, or 30 toys costing ₹25 each. Riya picks 30 toys: more toys to sell for the same ₹750.`,
        r`जाँच: $30 \times 25 = 750$ और $25 \times 30 = 750$। इस बार **दोनों मूल समझ में आते हैं**: 25 खिलौने, हर एक बनाने में ₹30 का, या 30 खिलौने, हर एक ₹25 का। रिया 30 खिलौने चुनती है: उसी ₹750 में बेचने को ज़्यादा खिलौने।`,
      ),
      "both",
      { isHidden: true },
    );
    b.when(price.on(QuestionSignal.Correct), [theBoard.show(both), theBoard.pass()]);
    return column([
      w.title(t("Pricing the toys", "खिलौनों का दाम")),
      stall,
      w.body(
        t(
          r`Back to $$x^2 - 55x + 750 = 0$$ Here $a = 1$, $b = -55$, $c = 750$, and $$b^2 - 4ac = 3025 - 3000 = 25$$ So $$x = \frac{55 \pm 5}{2}$$ which is 30 or 25.`,
          r`फिर से $$x^2 - 55x + 750 = 0$$ यहाँ $a = 1$, $b = -55$, $c = 750$, और $$b^2 - 4ac = 3025 - 3000 = 25$$ तो $$x = \frac{55 \pm 5}{2}$$ जो 30 या 25 है।`,
        ),
      ),
      price,
      both,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Exercise 4.3 Q2 by the formula: one worked, one to do. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        r`Use the formula on $2x^2 + x + 4 = 0$. What do you find?`,
        r`$2x^2 + x + 4 = 0$ पर सूत्र लगाओ। क्या मिलता है?`,
      ),
      options: [
        { id: "right", label: t("No real roots", "कोई वास्तविक मूल नहीं") },
        {
          id: "roots",
          label: t(r`$x = \dfrac{-1 \pm \sqrt{33}}{4}$`, r`$x = \dfrac{-1 \pm \sqrt{33}}{4}$`),
          feedback: t(
            r`$b^2 - 4ac = 1 - 4 \times 2 \times 4 = 1 - 32 = -31$. Watch the sign of $c$: here it is $+4$.`,
            r`$b^2 - 4ac = 1 - 4 \times 2 \times 4 = 1 - 32 = -31$। $c$ का चिह्न देखो: यहाँ यह $+4$ है।`,
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        r`**Mission log.** ✓ One formula solves every quadratic equation: $x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$. ✓ The toys: make 30, each costing ₹25. ✗ Real problems rarely arrive as $ax^2 + bx + c = 0$. Next stop: equations in disguise, and the trip to the market.`,
        r`**मिशन लॉग।** ✓ एक सूत्र हर द्विघात समीकरण हल करता है: $x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$। ✓ खिलौने: 30 बनाओ, हर एक की लागत ₹25। ✗ असली समस्याएँ शायद ही कभी $ax^2 + bx + c = 0$ के रूप में आती हैं। अगला पड़ाव: छिपे समीकरण, और बाज़ार की यात्रा।`,
      ),
      "log",
      { isHidden: true },
    );
    b.when(ask.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([
      w.title(t("Your turn", "अब तुम्हारी बारी")),
      w.body(
        t(
          r`**Worked: $4x^2 + 4\sqrt{3}x + 3 = 0$.** Here $a = 4$, $b = 4\sqrt{3}$, $c = 3$. $$b^2 - 4ac = 48 - 48 = 0$$ So $$x = \frac{-4\sqrt{3} \pm 0}{8} = -\frac{\sqrt{3}}{2}$$ both times: two equal roots.`,
          r`**हल किया हुआ: $4x^2 + 4\sqrt{3}x + 3 = 0$।** यहाँ $a = 4$, $b = 4\sqrt{3}$, $c = 3$। $$b^2 - 4ac = 48 - 48 = 0$$ तो $$x = \frac{-4\sqrt{3} \pm 0}{8} = -\frac{\sqrt{3}}{2}$$ दोनों बार: दो बराबर मूल।`,
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
export const overview = [hook, derive, formula, example10, example11, example13, inLife, yourTurn];

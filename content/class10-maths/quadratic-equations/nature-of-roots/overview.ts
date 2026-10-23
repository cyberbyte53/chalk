import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  Coefficient,
  QuadraticSceneKind,
  RootsAction,
  rootsGraphDef,
} from "@chalk/prop-quadratics";
import { sceneOn } from "../kit";

const r = String.raw;

/** A fixed graph of y = ax² + bx + c, with D and the roots shown. */
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
  showDiscriminant: true,
  showRoots: true,
});

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** Kabir's rocket and his promise of 25 m. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const launch = sceneOn(
    b,
    "launch",
    QuadraticSceneKind.RocketLaunch,
    "Kabir's water-bottle rocket on its launcher, a dashed curved path rising and falling, a height mark at 15 m; Riya holds a stopwatch",
  );
  return column([
    w.title(t("Can it even get there?", "क्या यह वहाँ पहुँच भी सकता है?")),
    launch,
    w.body(
      t(
        r`Kabir tests his rocket on the school ground. From his science teacher he has a rule for its height after $t$ seconds, the same kind of rule as Riya's ball in the Polynomials chapter: $$h = 20t - 5t^2 \text{ metres}$$ He is telling everyone it will reach 25 m. Riya wonders: is that even possible? Before solving anything, can we tell whether an answer **exists**?`,
        r`कबीर स्कूल के मैदान में अपना रॉकेट आज़माता है। उसके विज्ञान शिक्षक ने $t$ सेकंड बाद उसकी ऊँचाई का नियम दिया है, वैसा ही नियम जैसा बहुपद वाले अध्याय में रिया की गेंद का था: $$h = 20t - 5t^2 \text{ मीटर}$$ वह सबको बता रहा है कि यह 25 m तक जाएगा। रिया सोचती है: क्या यह संभव भी है? कुछ भी हल करने से पहले, क्या हम बता सकते हैं कि उत्तर **है** या नहीं?`,
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** The discriminant and its three cases, explored on the graph. */
const discriminant = page(
  "discriminant",
  (b) => {
    const w = wordsOn(b);
    const g = b.prop(rootsGraphDef, "graph", {
      ...graph(1, -2, -3, { xMin: -3, xMax: 5, yMin: -5, yMax: 6 }),
      canSet: [Coefficient.C],
    });
    b.studentOnly(g.action(RootsAction.Nudge));
    b.standsFor(
      g,
      "the graph of y = x² − 2x + c with − and + buttons for c; D = b² − 4ac and the number of roots are shown as the curve moves up and down",
    );
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        r`Change $c$ until the curve just touches the $x$-axis. What is $D$ then?`,
        r`$c$ तब तक बदलो जब तक वक्र $x$-अक्ष को बस छुए। तब $D$ क्या है?`,
      ),
      options: [
        { id: "right", label: t("0", "0") },
        {
          id: "pos",
          label: t("A positive number", "एक धनात्मक संख्या"),
          feedback: t(
            "A positive D gives two different roots: the curve crosses the axis twice.",
            "धनात्मक D से दो अलग मूल मिलते हैं: वक्र अक्ष को दो बार काटता है।",
          ),
        },
        {
          id: "neg",
          label: t("A negative number", "एक ऋणात्मक संख्या"),
          feedback: t(
            "A negative D means no real roots: the curve doesn't reach the axis at all.",
            "ऋणात्मक D का अर्थ है कोई वास्तविक मूल नहीं: वक्र अक्ष तक पहुँचता ही नहीं।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("The discriminant", "विविक्तकर")),
      w.body(
        t(
          r`In the formula $$x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$$ everything hangs on the number under the square root.`,
          r`सूत्र $$x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$$ में सब कुछ वर्गमूल के नीचे की संख्या पर टिका है।`,
        ),
      ),
      w.definition(
        t(
          r`**Discriminant.** For $ax^2 + bx + c = 0$, the number $$D = b^2 - 4ac$$ is its **discriminant**: it decides what kind of roots the equation has. (1) $D > 0$: **two distinct real roots**. (2) $D = 0$: **two equal real roots**, both $-\frac{b}{2a}$. (3) $D < 0$: **no real roots**.`,
          r`**विविक्तकर।** $ax^2 + bx + c = 0$ के लिए संख्या $$D = b^2 - 4ac$$ इसका **विविक्तकर** है: यह तय करता है कि समीकरण के मूल किस प्रकार के हैं। (1) $D > 0$: **दो भिन्न वास्तविक मूल**। (2) $D = 0$: **दो बराबर वास्तविक मूल**, दोनों $-\frac{b}{2a}$। (3) $D < 0$: **कोई वास्तविक मूल नहीं**।`,
        ),
      ),
      w.body(
        t(
          "On the graph these are the three ways a curve can meet the x-axis: twice, once (just touching), or never. Change c and watch D.",
          "आलेख पर ये वक्र के x-अक्ष से मिलने के तीन तरीक़े हैं: दो बार, एक बार (बस छूकर), या कभी नहीं। c बदलो और D देखो।",
        ),
      ),
      g,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Examples 16 and 18: D < 0 and D = 0. */
const examples = page(
  "examples",
  (b) => {
    const w = wordsOn(b);
    const g = b.prop(
      rootsGraphDef,
      "graph",
      graph(2, -4, 3, { xMin: -1, xMax: 3, yMin: -1, yMax: 5 }),
    );
    b.standsFor(g, "the graph of y = 2x² − 4x + 3 with D = −8: it stays above the x-axis");
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        r`What is the nature of the roots of $3x^2 - 2x + \tfrac{1}{3} = 0$?`,
        r`$3x^2 - 2x + \tfrac{1}{3} = 0$ के मूलों की प्रकृति क्या है?`,
      ),
      options: [
        {
          id: "right",
          label: t(
            r`Two equal real roots, both $\tfrac{1}{3}$`,
            r`दो बराबर वास्तविक मूल, दोनों $\tfrac{1}{3}$`,
          ),
        },
        {
          id: "two",
          label: t("Two distinct real roots", "दो भिन्न वास्तविक मूल"),
          feedback: t(
            r`$D = (-2)^2 - 4 \times 3 \times \tfrac{1}{3} = 4 - 4 = 0$, so the roots are equal: $-\tfrac{b}{2a} = \tfrac{2}{6} = \tfrac{1}{3}$.`,
            r`$D = (-2)^2 - 4 \times 3 \times \tfrac{1}{3} = 4 - 4 = 0$, तो मूल बराबर हैं: $-\tfrac{b}{2a} = \tfrac{2}{6} = \tfrac{1}{3}$।`,
          ),
        },
        {
          id: "none",
          label: t("No real roots", "कोई वास्तविक मूल नहीं"),
          feedback: t(
            r`$D = 4 - 4 = 0$, which is not negative.`,
            r`$D = 4 - 4 = 0$, जो ऋणात्मक नहीं है।`,
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Examples", "उदाहरण")),
      w.body(
        t(
          r`NCERT's Example 16: $$2x^2 - 4x + 3 = 0$$ Here $a = 2$, $b = -4$, $c = 3$, so $$D = (-4)^2 - 4 \times 2 \times 3 = 16 - 24 = -8$$ $D < 0$, so there are no real roots. We didn't have to solve anything to know that.`,
          r`NCERT का उदाहरण 16: $$2x^2 - 4x + 3 = 0$$ यहाँ $a = 2$, $b = -4$, $c = 3$, तो $$D = (-4)^2 - 4 \times 2 \times 3 = 16 - 24 = -8$$ $D < 0$, तो कोई वास्तविक मूल नहीं। यह जानने के लिए हमें कुछ हल नहीं करना पड़ा।`,
        ),
      ),
      g,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Example 17: is it possible to put the pole there? */
const pole = page(
  "pole",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        r`$x^2 + 7x - 60 = 0$ has $D = 289$. Is it possible to place the pole, and where?`,
        r`$x^2 + 7x - 60 = 0$ का $D = 289$ है। क्या खंभा लगाना संभव है, और कहाँ?`,
      ),
      options: [
        {
          id: "right",
          label: t("Yes: 5 m from gate B and 12 m from gate A", "हाँ: गेट B से 5 m और गेट A से 12 m"),
        },
        {
          id: "no",
          label: t("No, it isn't possible", "नहीं, यह संभव नहीं है"),
          feedback: t(
            r`$D = 289 > 0$, so there are real roots: $x = \frac{-7 \pm 17}{2}$, which is 5 or −12. A distance can't be negative, so $x = 5$.`,
            r`$D = 289 > 0$, तो वास्तविक मूल हैं: $x = \frac{-7 \pm 17}{2}$, जो 5 या −12 है। दूरी ऋणात्मक नहीं हो सकती, तो $x = 5$।`,
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Is it possible?", "क्या यह संभव है?")),
      w.body(
        t(
          r`NCERT's Example 17. A circular park has diameter 13 m, with gates A and B at the ends of a diameter. A pole must stand on the boundary so that its distances from the two gates differ by 7 m. Let the pole be $x$ m from B; then it is $x + 7$ m from A. The angle at the pole, in a semicircle, is a right angle, so by Pythagoras $$(x + 7)^2 + x^2 = 13^2$$ $$x^2 + 7x - 60 = 0$$ It is possible exactly when this has a real root, that is, when $D \geq 0$.`,
          r`NCERT का उदाहरण 17। एक वृत्ताकार पार्क का व्यास 13 m है, और गेट A और B एक व्यास के सिरों पर हैं। सीमा पर एक खंभा ऐसे लगाना है कि दोनों गेटों से उसकी दूरियों का अंतर 7 m हो। खंभा B से $x$ m लो; तब A से $x + 7$ m। अर्धवृत्त में खंभे पर बना कोण समकोण है, तो पाइथागोरस से $$(x + 7)^2 + x^2 = 13^2$$ $$x^2 + 7x - 60 = 0$$ यह ठीक तब संभव है जब इसका वास्तविक मूल हो, यानी $D \geq 0$।`,
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Exercise 4.4 Q2: find k so that the roots are equal. */
const findK = page(
  "find-k",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        r`For which $k$ does $kx(x - 2) + 6 = 0$ have two equal roots?`,
        r`किस $k$ के लिए $kx(x - 2) + 6 = 0$ के दो बराबर मूल हैं?`,
      ),
      options: [
        { id: "right", label: t(r`$k = 6$`, r`$k = 6$`) },
        {
          id: "zero",
          label: t(r`$k = 0$ or $k = 6$`, r`$k = 0$ या $k = 6$`),
          feedback: t(
            r`$kx^2 - 2kx + 6 = 0$ gives $D = 4k^2 - 24k = 4k(k - 6)$. But $k = 0$ wipes out the $x^2$ term (and leaves $6 = 0$), so it isn't a quadratic. Only $k = 6$.`,
            r`$kx^2 - 2kx + 6 = 0$ से $D = 4k^2 - 24k = 4k(k - 6)$। पर $k = 0$, $x^2$ वाला पद मिटा देता है (और $6 = 0$ बचता है), तो वह द्विघात नहीं। केवल $k = 6$।`,
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Making the roots equal", "मूलों को बराबर बनाना")),
      w.body(
        t(
          r`We can also run it backwards: choose a number so that the roots are equal. For $2x^2 + kx + 3 = 0$, equal roots need $D = 0$: $$k^2 - 4 \times 2 \times 3 = 0$$ $$k^2 = 24$$ $$k = \pm 2\sqrt{6}$$`,
          r`हम इसे उल्टा भी चला सकते हैं: कोई संख्या ऐसे चुनो कि मूल बराबर हों। $2x^2 + kx + 3 = 0$ के लिए बराबर मूलों को $D = 0$ चाहिए: $$k^2 - 4 \times 2 \times 3 = 0$$ $$k^2 = 24$$ $$k = \pm 2\sqrt{6}$$`,
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

/** The rocket: 15 m twice, 20 m once (the top), 25 m never. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const g = b.prop(rootsGraphDef, "graph", {
      a: -5,
      b: 20,
      c: 0,
      level: 15,
      levelLabel: "15 m",
      variable: "t",
      yName: "h",
      window: { xMin: -0.5, xMax: 4.5, yMin: -3, yMax: 28 },
      canSet: [],
      canSetLevel: true,
      step: 5,
      showEquation: true,
      showDiscriminant: true,
      showRoots: true,
    });
    b.studentOnly(g.action(RootsAction.SetLevel));
    b.standsFor(
      g,
      "the rocket's height h = 20t − 5t² against time; a line at a chosen height (15 m to start) shows when the rocket is that high, with D for each height",
    );
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        r`Move the line to 25 m: $20t - 5t^2 = 25$, i.e. $t^2 - 4t + 5 = 0$. Can the rocket reach 25 m?`,
        r`रेखा को 25 m पर ले जाओ: $20t - 5t^2 = 25$, यानी $t^2 - 4t + 5 = 0$। क्या रॉकेट 25 m तक पहुँच सकता है?`,
      ),
      options: [
        { id: "right", label: t(r`No: $D = 16 - 20 = -4 < 0$`, r`नहीं: $D = 16 - 20 = -4 < 0$`) },
        {
          id: "yes",
          label: t("Yes, a little after 2 s", "हाँ, 2 s के थोड़ी देर बाद"),
          feedback: t(
            r`For $t^2 - 4t + 5 = 0$, $D = 16 - 20 = -4$. No real $t$ makes the height 25 m: the line sits above the top of the curve.`,
            r`$t^2 - 4t + 5 = 0$ के लिए $D = 16 - 20 = -4$। कोई वास्तविक $t$ ऊँचाई 25 m नहीं बनाता: रेखा वक्र के शिखर से ऊपर है।`,
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Kabir's promise", "कबीर का वादा")),
      w.body(
        t(
          r`When is the rocket 15 m up? $$20t - 5t^2 = 15$$ Divide by $-5$: $$t^2 - 4t + 3 = 0$$ $D = 16 - 12 = 4 > 0$: two times, $t = 1$ s and $t = 3$ s, once going up and once coming down. At 20 m, $t^2 - 4t + 4 = 0$ has $D = 0$: just once, at $t = 2$ s. That's the very top. (The graph works out $D$ before dividing by $-5$, so its numbers are bigger, but the sign is the same, and the sign is what matters.)`,
          r`रॉकेट 15 m ऊपर कब है? $$20t - 5t^2 = 15$$ $-5$ से भाग दो: $$t^2 - 4t + 3 = 0$$ $D = 16 - 12 = 4 > 0$: दो समय, $t = 1$ s और $t = 3$ s, एक बार ऊपर जाते और एक बार नीचे आते। 20 m पर, $t^2 - 4t + 4 = 0$ का $D = 0$: बस एक बार, $t = 2$ s पर। वही सबसे ऊँचा बिंदु है। (आलेख $-5$ से भाग देने से पहले $D$ निकालता है, इसलिए उसकी संख्याएँ बड़ी हैं, पर चिह्न वही है, और चिह्न ही मायने रखता है।)`,
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
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Exercise 4.4 Q3 worked, Q4 to do, then the log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        r`Two friends' ages add to 20. Four years ago, the product of their ages was 48. With one age $x$, this gives $x^2 - 20x + 112 = 0$. Is the situation possible?`,
        r`दो दोस्तों की आयु का योग 20 है। चार साल पहले उनकी आयु का गुणनफल 48 था। एक आयु $x$ लेने पर $x^2 - 20x + 112 = 0$ मिलता है। क्या यह स्थिति संभव है?`,
      ),
      options: [
        { id: "right", label: t(r`No: $D = 400 - 448 < 0$`, r`नहीं: $D = 400 - 448 < 0$`) },
        {
          id: "yes",
          label: t("Yes", "हाँ"),
          feedback: t(
            r`$D = (-20)^2 - 4 \times 112 = 400 - 448 = -48$. No real age works.`,
            r`$D = (-20)^2 - 4 \times 112 = 400 - 448 = -48$। कोई वास्तविक आयु नहीं चलती।`,
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        r`**Mission log.** ✓ The discriminant tells us, before solving, whether an answer exists. ✓ The rocket: 15 m at 1 s and 3 s, its top at 20 m, never 25 m. Kabir changes his poster to "20 metres!".`,
        r`**मिशन लॉग।** ✓ विविक्तकर हल करने से पहले बता देता है कि उत्तर है या नहीं। ✓ रॉकेट: 1 s और 3 s पर 15 m, शिखर 20 m, 25 m कभी नहीं। कबीर अपना पोस्टर बदलकर "20 मीटर!" कर देता है।`,
      ),
      "log",
      { isHidden: true },
    );
    b.when(ask.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([
      w.title(t("Your turn", "अब तुम्हारी बारी")),
      w.body(
        t(
          r`**Worked: a mango grove, twice as long as it is broad, with area 800 m².** With breadth $x$: $$2x^2 = 800$$ $$x^2 - 400 = 0$$ $D = 0 + 1600 > 0$, so it is possible: $x = 20$ (a breadth can't be $-20$). The grove is 20 m by 40 m.`,
          r`**हल किया हुआ: एक आम का बाग़, जिसकी लंबाई चौड़ाई की दुगुनी है और क्षेत्रफल 800 m²।** चौड़ाई $x$ लेने पर: $$2x^2 = 800$$ $$x^2 - 400 = 0$$ $D = 0 + 1600 > 0$, तो यह संभव है: $x = 20$ (चौड़ाई $-20$ नहीं हो सकती)। बाग़ 20 m × 40 m है।`,
        ),
      ),
      ask,
      log,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Mela day: every stop recapped. */
const finale = page("finale", (b) => {
  const w = wordsOn(b);
  const day = sceneOn(
    b,
    "day",
    QuadraticSceneKind.MelaDay,
    "mela day: 10B's stall with a banner and a crowd, toys on the table, Kabir's rocket high in the sky, the family cheering",
  );
  return column([
    w.title(t("Mela day", "मेले का दिन")),
    day,
    w.body(
      t(
        "The stall stands on its 12 m by 25 m plot. Thirty toys, each costing ₹25 to make, sit on the table. At the opening, Kabir's rocket shoots up, hangs at the top two seconds in, and lands right when Riya's stopwatch says four. The crowd cheers.",
        "स्टॉल अपने 12 m × 25 m के प्लॉट पर खड़ा है। मेज़ पर तीस खिलौने सजे हैं, हर एक बनाने में ₹25 का। उद्घाटन पर कबीर का रॉकेट ऊपर जाता है, दो सेकंड पर शिखर पर ठहरता है, और ठीक तब उतरता है जब रिया की स्टॉपवॉच चार दिखाती है। भीड़ तालियाँ बजाती है।",
      ),
    ),
    w.definition(
      t(
        r`**Mission complete.** (1) A **quadratic equation** is $ax^2 + bx + c = 0$ with $a \neq 0$; simplify before deciding. (2) **Factorising**: split the middle term, set each factor to 0. (3) **Completing the square**: half the coefficient of $x$, squared. (4) **The formula**: $x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$. (5) **Word problems**: name the unknown, clear denominators, reject roots that don't fit. (6) **The discriminant** $D = b^2 - 4ac$: two roots, one repeated root, or none.`,
        r`**मिशन पूरा।** (1) **द्विघात समीकरण** है $ax^2 + bx + c = 0$, जहाँ $a \neq 0$; तय करने से पहले सरल करो। (2) **गुणनखंड**: मध्य पद तोड़ो, हर गुणनखंड को 0 रखो। (3) **पूर्ण वर्ग**: $x$ के गुणांक का आधा, उसका वर्ग। (4) **सूत्र**: $x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$। (5) **शाब्दिक प्रश्न**: अज्ञात का नाम रखो, हर हटाओ, मेल न खाने वाले मूल हटाओ। (6) **विविक्तकर** $D = b^2 - 4ac$: दो मूल, एक दोहराया मूल, या कोई नहीं।`,
      ),
    ),
    space(),
  ]);
});

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [hook, discriminant, examples, pole, findK, inLife, yourTurn, finale];

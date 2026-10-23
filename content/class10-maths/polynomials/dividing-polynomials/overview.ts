import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import { BoxMode, PolyBoxAction, PolyBoxSignal, polyBoxDef } from "@chalk/prop-polynomials";

const r = String.raw;

/** NCERT Example 6: 2x² + 3x + 1 ÷ (x + 2), step by step in the box, like 51 = 21 × 2 + 9. */
const steps = page(
  "steps",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "Divide 2x² + 3x + 1 by x + 2 like numbers: each step matches the first term (what times x gives it?), multiplies back and takes away. Taking away a negative adds it. Stop when what's left has a lower degree than the divisor: 2x² + 3x + 1 = (x + 2)(2x − 1) + 3.",
    );
    const box = b.prop(polyBoxDef, "box", {
      mode: BoxMode.Divide,
      dividend: [2, 3, 1],
      side: [1, 2],
      steps: 0,
    });
    b.standsFor(box, "the box dividing 2x² + 3x + 1 by x + 2, one quotient term per tap");
    b.studentOnly(box.action(PolyBoxAction.Next));
    b.witness(box.learner(PolyBoxAction.Next), box.learner(PolyBoxAction.Next));
    const written = w.body(
      t(
        r`**What times $x$ gives $2x^2$?** $2x$. Take away $2x(x + 2)$: $$(2x^2 + 3x + 1) - (2x^2 + 4x) = -x + 1$$ **What times $x$ gives $-x$?** $-1$. Take away $-1(x + 2)$: $$(-x + 1) - (-x - 2) = 3$$`,
        r`**$x$ को किससे गुणा करें कि $2x^2$ मिले?** $2x$ से। $2x(x + 2)$ घटाओ: $$(2x^2 + 3x + 1) - (2x^2 + 4x) = -x + 1$$ **$x$ को किससे गुणा करें कि $-x$ मिले?** $-1$ से। $-1(x + 2)$ घटाओ: $$(-x + 1) - (-x - 2) = 3$$`,
      ),
      "written",
      { isHidden: true },
    );
    const minus = choiceQuestion(b, {
      name: "minus",
      prompt: t(r`In the last step, $1 - (-2) = $`, r`आख़िरी क़दम में, $1 - (-2) = $`),
      options: [
        { id: "right", label: t("3", "3") },
        {
          id: "neg",
          label: t(r`$-1$`, r`$-1$`),
          feedback: t(
            "Taking away a negative adds it: 1 + 2.",
            "ऋणात्मक घटाने का अर्थ है जोड़ना: 1 + 2।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const stop = w.body(
      t(
        r`3 has degree 0, lower than the divisor's degree 1, so no more $(x + 2)$s fit. Stop. The quotient is $2x - 1$ and the remainder is 3: $$2x^2 + 3x + 1 = (x + 2)(2x - 1) + 3$$ Just like $51 = 21 \times 2 + 9$, it is $$\text{dividend} = \text{divisor} \times \text{quotient} + \text{remainder}$$`,
        r`3 की घात 0 है, भाजक की घात 1 से कम, तो और $(x + 2)$ नहीं समाते। रुको। भागफल $2x - 1$ है और शेषफल 3: $$2x^2 + 3x + 1 = (x + 2)(2x - 1) + 3$$ बिल्कुल $51 = 21 \times 2 + 9$ की तरह, यह है $$\text{भाज्य} = \text{भाजक} \times \text{भागफल} + \text{शेषफल}$$`,
      ),
      "stop",
      { isHidden: true },
    );
    const long = w.body(
      t(
        r`In the exam, write the same steps as a long division: $$\begin{array}{r|l} & 2x - 1 \\ \hline x + 2 & 2x^2 + 3x + 1 \\ & -(2x^2 + 4x) \\ \hline & -x + 1 \\ & -(-x - 2) \\ \hline & 3 \end{array}$$`,
        r`परीक्षा में यही क़दम लंबे भाग की तरह लिखो: $$\begin{array}{r|l} & 2x - 1 \\ \hline x + 2 & 2x^2 + 3x + 1 \\ & -(2x^2 + 4x) \\ \hline & -x + 1 \\ & -(-x - 2) \\ \hline & 3 \end{array}$$`,
      ),
      "long",
      { isHidden: true },
    );
    b.when(box.on(PolyBoxSignal.Finished), [theBoard.show(written), theBoard.show(minus)]);
    b.when(minus.on(QuestionSignal.Correct), [
      theBoard.show(stop),
      theBoard.show(long),
      theBoard.pass(),
    ]);
    return column([
      w.title(t("Divide like numbers", "संख्याओं की तरह भाग")),
      w.body(
        t(
          r`You know $$51 = 21 \times 2 + 9$$ 51 is the **dividend**, the number being divided. 21 is the **divisor**, the number we divide by. 2 is the **quotient**, how many 21s fit. 9 is the **remainder**, what's left over. Polynomials divide the same way. Divide the dividend $2x^2 + 3x + 1$ by the divisor $x + 2$: take out as many $(x + 2)$s as you can, and see what's left. Tap → for each step.`,
          r`तुम जानते हो $$51 = 21 \times 2 + 9$$ 51 **भाज्य** है, वह संख्या जिसे भाग दिया जा रहा है। 21 **भाजक** है, वह संख्या जिससे भाग देते हैं। 2 **भागफल** है, कितने 21 समाते हैं। 9 **शेषफल** है, जो बचता है। बहुपदों में भी भाग ऐसे ही होता है। भाज्य $2x^2 + 3x + 1$ को भाजक $x + 2$ से भाग दो: जितने $(x + 2)$ निकाल सको निकालो, और देखो क्या बचता है। हर क़दम के लिए → दबाओ।`,
        ),
      ),
      box,
      written,
      minus,
      stop,
      long,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** NCERT Example 7: a quadratic divisor; keep going while what's left has degree 2 or more. The rule. */
const stop = page(
  "when-to-stop",
  (b) => {
    const w = wordsOn(b);
    const box = b.prop(polyBoxDef, "box", {
      mode: BoxMode.Divide,
      dividend: [3, 1, 2, 5],
      side: [1, 2, 1],
      steps: 0,
    });
    b.standsFor(box, "the box dividing 3x³ + x² + 2x + 5 by x² + 2x + 1");
    b.studentOnly(box.action(PolyBoxAction.Next));
    b.witness(box.learner(PolyBoxAction.Next), box.learner(PolyBoxAction.Next));
    const result = w.body(
      t(
        r`The quotient is $3x - 5$, and what's left is $9x + 10$, of degree 1: stop. $$\begin{aligned} &3x^3 + x^2 + 2x + 5 \\ &= (x^2 + 2x + 1)(3x - 5) + (9x + 10) \end{aligned}$$ You can check it by multiplying back. The rule for stopping is the same as for numbers, where the remainder must be smaller than the divisor: here the remainder's degree must be lower than the divisor's.`,
        r`भागफल $3x - 5$ है, और बचा $9x + 10$, घात 1: रुको। $$\begin{aligned} &3x^3 + x^2 + 2x + 5 \\ &= (x^2 + 2x + 1)(3x - 5) + (9x + 10) \end{aligned}$$ वापस गुणा करके जाँच सकते हो। रुकने का नियम संख्याओं जैसा ही है, जहाँ शेषफल भाजक से छोटा होना चाहिए: यहाँ शेषफल की घात भाजक की घात से कम होनी चाहिए।`,
      ),
      "result",
      { isHidden: true },
    );
    const rule = w.definition(
      t(
        r`**The division algorithm.** For polynomials $p(x)$ and $g(x)$, with $g(x) \ne 0$, there are $q(x)$ and $r(x)$ with $$p(x) = g(x) \times q(x) + r(x)$$ where $r(x) = 0$ or the degree of $r(x)$ is less than the degree of $g(x)$.`,
        r`**विभाजन एल्गोरिथ्म।** बहुपदों $p(x)$ और $g(x)$ के लिए, जहाँ $g(x) \ne 0$, ऐसे $q(x)$ और $r(x)$ होते हैं कि $$p(x) = g(x) \times q(x) + r(x)$$ जहाँ $r(x) = 0$ या $r(x)$ की घात $g(x)$ की घात से कम है।`,
      ),
      "rule",
      { isHidden: true },
    );
    b.when(box.on(PolyBoxSignal.Finished), [
      theBoard.show(result),
      theBoard.show(rule),
      theBoard.pass(),
    ]);
    return column([
      w.title(t("When to stop", "कब रुकें")),
      w.body(
        t(
          r`Divide $3x^3 + x^2 + 2x + 5$ by $x^2 + 2x + 1$. The divisor has degree 2 now, so keep going while what's left has degree 2 or more.`,
          r`$3x^3 + x^2 + 2x + 5$ को $x^2 + 2x + 1$ से भाग दो। भाजक की घात अब 2 है, तो तब तक चलते रहो जब तक बचे हुए की घात 2 या ज़्यादा हो।`,
        ),
      ),
      box,
      result,
      rule,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** NCERT Example 8 and Ex 2.3 Q1(iii): powers going down, and 0 for the gaps. */
const order = page(
  "order",
  (b) => {
    const w = wordsOn(b);
    const gaps = choiceQuestion(b, {
      name: "gaps",
      prompt: t(
        r`Before dividing $x^4 - 5x + 6$, what do you write?`,
        r`$x^4 - 5x + 6$ को भाग देने से पहले क्या लिखोगे?`,
      ),
      options: [
        {
          id: "right",
          label: t(r`$x^4 + 0x^3 + 0x^2 - 5x + 6$`, r`$x^4 + 0x^3 + 0x^2 - 5x + 6$`),
        },
        {
          id: "nothing",
          label: t("Nothing, start dividing", "कुछ नहीं, भाग शुरू करो"),
          feedback: t(
            r`With $x^3$ and $x^2$ missing, the terms won't line up when you take away. Fill the gaps with $0x^3$ and $0x^2$.`,
            r`$x^3$ और $x^2$ न होने से घटाते समय पद एक सीध में नहीं आएँगे। ख़ाली जगहें $0x^3$ और $0x^2$ से भरो।`,
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Get it in order first", "पहले क्रम में लाओ")),
      w.body(
        t(
          r`Each step looks at the first terms, so they must really be the highest powers. Write both in standard form, with powers going down: $$\begin{aligned} 3x^2 - x^3 - 3x + 5 &= -x^3 + 3x^2 - 3x + 5 \\ x - 1 - x^2 &= -x^2 + x - 1 \end{aligned}$$ Now divide step by step: $$\begin{aligned} -x^3 \div (-x^2) &= x: \quad (-x^3 + 3x^2 - 3x + 5) - x(-x^2 + x - 1) = 2x^2 - 2x + 5 \\ 2x^2 \div (-x^2) &= -2: \quad (2x^2 - 2x + 5) + 2(-x^2 + x - 1) = 3 \end{aligned}$$ So the quotient is $x - 2$ and the remainder is 3.`,
          r`हर क़दम पहले पदों को देखता है, तो वे सच में सबसे बड़ी घात वाले होने चाहिए। दोनों को मानक रूप में, घटती घातों में लिखो: $$\begin{aligned} 3x^2 - x^3 - 3x + 5 &= -x^3 + 3x^2 - 3x + 5 \\ x - 1 - x^2 &= -x^2 + x - 1 \end{aligned}$$ अब क़दम-दर-क़दम भाग दो: $$\begin{aligned} -x^3 \div (-x^2) &= x: \quad (-x^3 + 3x^2 - 3x + 5) - x(-x^2 + x - 1) = 2x^2 - 2x + 5 \\ 2x^2 \div (-x^2) &= -2: \quad (2x^2 - 2x + 5) + 2(-x^2 + x - 1) = 3 \end{aligned}$$ तो भागफल $x - 2$ और शेषफल 3 है।`,
        ),
      ),
      gaps,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Ex 2.3 Q1(i): x³ − 3x² + 5x − 3 ÷ (x² − 2). */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        r`Divide $x^3 - 3x^2 + 5x - 3$ by $x^2 - 2$. What are the quotient and the remainder?`,
        r`$x^3 - 3x^2 + 5x - 3$ को $x^2 - 2$ से भाग दो। भागफल और शेषफल क्या हैं?`,
      ),
      options: [
        {
          id: "right",
          label: t(r`$q = x - 3, \; r = 7x - 9$`, r`$q = x - 3, \; r = 7x - 9$`),
        },
        {
          id: "sign",
          label: t(r`$q = x - 3, \; r = 7x + 3$`, r`$q = x - 3, \; r = 7x + 3$`),
          feedback: t(
            r`The second step takes away $-3(x^2 - 2) = -3x^2 + 6$. Then $-3 - 6 = -9$.`,
            r`दूसरा क़दम $-3(x^2 - 2) = -3x^2 + 6$ घटाता है। तब $-3 - 6 = -9$।`,
          ),
        },
        {
          id: "early",
          label: t(r`$q = x, \; r = -3x^2 + 7x - 3$`, r`$q = x, \; r = -3x^2 + 7x - 3$`),
          feedback: t(
            "What's left still has degree 2, the same as the divisor. Divide once more.",
            "बचे हुए की घात अब भी 2 है, भाजक जितनी। एक बार और भाग दो।",
          ),
        },
      ],
      answer: "right",
    });
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), ask, space()]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order. */
export const overview = [steps, stop, order, yourTurn];

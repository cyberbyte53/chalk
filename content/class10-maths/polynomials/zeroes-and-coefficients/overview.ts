import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  BoxMode,
  PlaneForm,
  PolyBoxAction,
  PolyBoxSignal,
  ZeroPlaneAction,
  ZeroPlaneDerived,
  ZeroPlaneSignal,
  polyBoxDef,
  zeroPlaneDef,
} from "@chalk/prop-polynomials";

const r = String.raw;

/** The pattern hunt: four quadratics and their zeroes; then drag the zeroes to make the x-term go. */
const pattern = page(
  "pattern",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "Find the pattern before the rule: for x² + bx + c the zeroes add to −b and multiply to c. Then drag two zeroes and make the x-term disappear (zeroes that add to 0). Name the zeroes α and β.",
    );
    const connect = choiceQuestion(b, {
      name: "connect",
      prompt: t(
        "Look at the zeroes 2 and 3, then at the numbers 5 and 6 in the polynomial (ignore the minus for now). What's the connection?",
        "शून्यक 2 और 3 को देखो, फिर बहुपद की संख्याओं 5 और 6 को (अभी ऋण चिह्न छोड़ दो)। क्या संबंध है?",
      ),
      options: [
        {
          id: "right",
          label: t("The zeroes add to 5 and multiply to 6", "शून्यकों का योग 5 और गुणनफल 6 है"),
        },
        {
          id: "add6",
          label: t("The zeroes add to 6", "शून्यकों का योग 6 है"),
          feedback: t(
            r`$2 + 3 = 5$. Which number is $2 \times 3$?`,
            r`$2 + 3 = 5$। $2 \times 3$ कौन-सी संख्या है?`,
          ),
        },
        {
          id: "none",
          label: t("There's no connection", "कोई संबंध नहीं है"),
          feedback: t(
            "Try adding the zeroes, and multiplying them.",
            "शून्यकों को जोड़कर देखो, और गुणा करके भी।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const signs = w.body(
      t(
        r`Check it with the others: $3 + 4 = 7$ and $3 \times 4 = 12$. With the signs: the zeroes add to **minus** the coefficient of $x$, and multiply to the constant term. **Drag the zeroes, and make the $x$-term disappear.**`,
        r`बाक़ियों से जाँचो: $3 + 4 = 7$ और $3 \times 4 = 12$। चिह्नों के साथ: शून्यकों का योग $x$ के गुणांक का **ऋण** है, और गुणनफल अचर पद है। **शून्यकों को खींचो, और $x$ वाले पद को ग़ायब करो।**`,
      ),
      "signs",
      { isHidden: true },
    );
    const pair = b.prop(
      zeroPlaneDef,
      "pair",
      {
        form: PlaneForm.Zeroes,
        zeroes: [2, 3],
        snap: 0.5,
        isSumProductShown: true,
        window: { xMin: -5, xMax: 5, yMin: -8, yMax: 8 },
      },
      { isHidden: true },
    );
    b.standsFor(
      pair,
      "two zeroes to drag along the x-axis, with the parabola, x² + bx + c, and α + β and αβ",
    );
    b.studentOnly(pair.action(ZeroPlaneAction.MoveZero));
    b.witness(pair.learner(ZeroPlaneAction.MoveZero, { index: 0, to: -3 }));
    const named = w.definition(
      t(
        r`When the zeroes add to 0, there's no $x$-term. Call the two zeroes $\alpha$ (alpha) and $\beta$ (beta). For $x^2 + bx + c$: $$\alpha + \beta = -b, \qquad \alpha\beta = c$$`,
        r`जब शून्यकों का योग 0 हो, तो $x$ वाला पद नहीं रहता। दोनों शून्यकों को $\alpha$ (अल्फ़ा) और $\beta$ (बीटा) कहो। $x^2 + bx + c$ के लिए: $$\alpha + \beta = -b, \qquad \alpha\beta = c$$`,
      ),
      "named",
      { isHidden: true },
    );
    b.when(connect.on(QuestionSignal.Correct), [theBoard.show(signs), theBoard.show(pair)]);
    b.when(
      pair.on(ZeroPlaneSignal.Changed),
      [theBoard.show(named), theBoard.pass()],
      pair.derived(ZeroPlaneDerived.SumOfZeroes).eq(0),
    );
    return column([
      w.title(t("A pattern", "एक पैटर्न")),
      w.body(
        t(
          r`Here are four quadratics you can now factorise, with their zeroes: $$\begin{array}{lcl} x^2 - 5x + 6 & & 2,\; 3 \\ x^2 - 7x + 12 & & 3,\; 4 \\ x^2 + x - 6 & & 2,\; -3 \\ x^2 - 3x - 4 & & -1,\; 4 \end{array}$$`,
          r`ये चार द्विघात बहुपद हैं जिनके गुणनखंड तुम अब कर सकते हो, उनके शून्यकों के साथ: $$\begin{array}{lcl} x^2 - 5x + 6 & & 2,\; 3 \\ x^2 - 7x + 12 & & 3,\; 4 \\ x^2 + x - 6 & & 2,\; -3 \\ x^2 - 3x - 4 & & -1,\; 4 \end{array}$$`,
        ),
      ),
      connect,
      signs,
      pair,
      named,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Why: (x − 2)(x − 3) in the box, then (x − α)(x − β) with the same steps; match the two ways of writing it. */
const why = page(
  "why",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "Why the pattern holds: multiply (x − 2)(x − 3) in the box (the x-cells add to −(2 + 3)x, the corner is 2 × 3), then (x − α)(x − β) with the same steps. It's x² + bx + c written a second way, so the coefficients of x match and the constant terms match.",
    );
    const box = b.prop(polyBoxDef, "box", { mode: BoxMode.Multiply, side: [1, -2], top: [1, -3] });
    b.standsFor(box, "the box for (x − 2)(x − 3)");
    b.studentOnly(box.action(PolyBoxAction.Next));
    b.witness(
      box.learner(PolyBoxAction.Next),
      box.learner(PolyBoxAction.Next),
      box.learner(PolyBoxAction.Next),
      box.learner(PolyBoxAction.Next),
    );
    const numbers = w.body(
      t(
        r`$$(x - 2)(x - 3) = x^2 - 3x - 2x + 6 = x^2 - 5x + 6$$ The two middle cells add up to $-(2 + 3)x$, and the corner is $2 \times 3$.`,
        r`$$(x - 2)(x - 3) = x^2 - 3x - 2x + 6 = x^2 - 5x + 6$$ बीच के दो खाने जुड़कर $-(2 + 3)x$ बनते हैं, और कोना $2 \times 3$ है।`,
      ),
      "numbers",
      { isHidden: true },
    );
    const letters = w.body(
      t(
        r`Now the same steps with $\alpha$ and $\beta$: $$\begin{aligned} (x - \alpha)(x - \beta) &= x^2 - \beta x - \alpha x + \alpha\beta \\ &= x^2 - (\alpha + \beta)x + \alpha\beta \end{aligned}$$ This is $x^2 + bx + c$ written a second way. Both are the same polynomial, so they have the same coefficients: the coefficients of $x$ match, and the constant terms match: $$b = -(\alpha + \beta), \qquad c = \alpha\beta$$`,
        r`अब यही क़दम $\alpha$ और $\beta$ के साथ: $$\begin{aligned} (x - \alpha)(x - \beta) &= x^2 - \beta x - \alpha x + \alpha\beta \\ &= x^2 - (\alpha + \beta)x + \alpha\beta \end{aligned}$$ यह $x^2 + bx + c$ को दूसरे तरीक़े से लिखना है। दोनों एक ही बहुपद हैं, तो उनके गुणांक भी एक जैसे हैं: $x$ के गुणांक मेल खाते हैं, और अचर पद मेल खाते हैं: $$b = -(\alpha + \beta), \qquad c = \alpha\beta$$`,
      ),
      "letters",
      { isHidden: true },
    );
    b.when(box.on(PolyBoxSignal.Finished), [
      theBoard.show(numbers),
      theBoard.show(letters),
      theBoard.pass(),
    ]);
    return column([
      w.title(t("Why it works", "यह क्यों चलता है")),
      w.body(
        t(
          "Multiply the factors in the box. First with numbers: tap → to fill each cell.",
          "गुणनखंडों को डिब्बे में गुणा करो। पहले संख्याओं से: हर खाना भरने के लिए → दबाओ।",
        ),
      ),
      box,
      numbers,
      letters,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** a ≠ 1: take a out; the zeroes don't move, so they add to −b/a and multiply to c/a. */
const leading = page("leading", (b) => {
  const w = wordsOn(b);
  return column([
    w.title(t("When a isn't 1", "जब a, 1 न हो")),
    w.body(
      t(
        r`Take $$2x^2 - 8x + 6$$ Its zeroes are 1 and 3. They add to 4 and multiply to 3, but here $b = -8$ and $c = 6$. Take the 2 out: $$2x^2 - 8x + 6 = 2(x^2 - 4x + 3)$$ Multiplying by 2 doesn't change where it's 0, so the zeroes are the same. And inside the bracket $a = 1$, so the pattern works: they add to 4 and multiply to 3.`,
        r`लो $$2x^2 - 8x + 6$$ इसके शून्यक 1 और 3 हैं। उनका योग 4 और गुणनफल 3 है, पर यहाँ $b = -8$ और $c = 6$। 2 बाहर निकालो: $$2x^2 - 8x + 6 = 2(x^2 - 4x + 3)$$ 2 से गुणा करने से यह नहीं बदलता कि यह कहाँ 0 है, तो शून्यक वही रहते हैं। और कोष्ठक के अंदर $a = 1$, तो पैटर्न चलता है: योग 4 और गुणनफल 3।`,
      ),
    ),
    w.body(
      t(
        r`Any quadratic, with the same steps: $$ax^2 + bx + c = a\left(x^2 + \tfrac{b}{a}x + \tfrac{c}{a}\right)$$ Inside the bracket the $x$-coefficient is $\frac{b}{a}$ and the constant is $\frac{c}{a}$, so (as for $x^2 + bx + c$) the sum of the zeroes is $-\frac{b}{a}$ and their product is $\frac{c}{a}$.`,
        r`कोई भी द्विघात बहुपद, उन्हीं क़दमों से: $$ax^2 + bx + c = a\left(x^2 + \tfrac{b}{a}x + \tfrac{c}{a}\right)$$ कोष्ठक के अंदर $x$ का गुणांक $\frac{b}{a}$ है और अचर $\frac{c}{a}$, तो ($x^2 + bx + c$ की तरह) शून्यकों का योग $-\frac{b}{a}$ है और गुणनफल $\frac{c}{a}$।`,
      ),
    ),
    w.definition(
      t(
        r`**Zeroes and coefficients.** If $\alpha$ and $\beta$ are the zeroes of $ax^2 + bx + c$, then $$\alpha + \beta = -\frac{b}{a}, \qquad \alpha\beta = \frac{c}{a}$$`,
        r`**शून्यक और गुणांक।** यदि $\alpha$ और $\beta$, $ax^2 + bx + c$ के शून्यक हैं, तो $$\alpha + \beta = -\frac{b}{a}, \qquad \alpha\beta = \frac{c}{a}$$`,
      ),
    ),
    space(),
  ]);
});

/** NCERT Ex 2.2 Q1: verify; then the sum for 6x² − 3 − 7x with its traps. */
const verify = page(
  "verify",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        r`What is the sum of the zeroes of $6x^2 - 3 - 7x$?`,
        r`$6x^2 - 3 - 7x$ के शून्यकों का योग क्या है?`,
      ),
      options: [
        { id: "right", label: t(r`$\frac{7}{6}$`, r`$\frac{7}{6}$`) },
        {
          id: "sign",
          label: t(r`$-\frac{7}{6}$`, r`$-\frac{7}{6}$`),
          feedback: t(
            r`$b = -7$, so $-\frac{b}{a} = +\frac{7}{6}$. Mind the minus.`,
            r`$b = -7$, तो $-\frac{b}{a} = +\frac{7}{6}$। ऋण चिह्न का ध्यान रखो।`,
          ),
        },
        {
          id: "product",
          label: t(r`$-\frac{1}{2}$`, r`$-\frac{1}{2}$`),
          feedback: t(
            r`That's $\frac{c}{a} = \frac{-3}{6}$, the product.`,
            r`यह $\frac{c}{a} = \frac{-3}{6}$ है, गुणनफल।`,
          ),
        },
        {
          id: "order",
          label: t(r`$\frac{1}{2}$`, r`$\frac{1}{2}$`),
          feedback: t(
            r`Standard form first: $6x^2 - 7x - 3$, so $b$ is $-7$, not $-3$.`,
            r`पहले मानक रूप: $6x^2 - 7x - 3$, तो $b$, $-7$ है, $-3$ नहीं।`,
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Verify", "सत्यापन")),
      w.body(
        t(
          r`"Verify" means work out both sides and check they agree. $$x^2 - 2x - 8 = (x - 4)(x + 2)$$ So the zeroes are 4 and $-2$. $$\begin{aligned} \text{sum: } & 4 + (-2) = 2, && -\tfrac{b}{a} = -\tfrac{-2}{1} = 2 \\ \text{product: } & 4 \times (-2) = -8, && \tfrac{c}{a} = \tfrac{-8}{1} = -8 \end{aligned}$$`,
          r`"सत्यापन" का अर्थ है दोनों पक्ष निकालकर जाँचना कि वे मेल खाते हैं। $$x^2 - 2x - 8 = (x - 4)(x + 2)$$ तो शून्यक 4 और $-2$ हैं। $$\begin{aligned} \text{योग: } & 4 + (-2) = 2, && -\tfrac{b}{a} = -\tfrac{-2}{1} = 2 \\ \text{गुणनफल: } & 4 \times (-2) = -8, && \tfrac{c}{a} = \tfrac{-8}{1} = -8 \end{aligned}$$`,
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order. */
export const overview = [pattern, why, leading, verify];

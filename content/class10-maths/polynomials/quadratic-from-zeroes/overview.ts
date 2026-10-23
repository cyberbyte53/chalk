import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  PlaneForm,
  ZeroPlaneAction,
  ZeroPlaneDerived,
  ZeroPlaneSignal,
  zeroPlaneDef,
} from "@chalk/prop-polynomials";

const r = String.raw;

/** Sum −3, product 2: place the zeroes, then x² − (sum)x + (product). */
const backwards = page(
  "backwards",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "Run the relations backwards: zeroes with sum S and product P belong to x² − Sx + P. The learner places zeroes with sum −3 and product 2 (−1 and −2) and reads x² + 3x + 2.",
    );
    const pair = b.prop(zeroPlaneDef, "pair", {
      form: PlaneForm.Zeroes,
      zeroes: [1, 3],
      snap: 0.5,
      isSumProductShown: true,
      window: { xMin: -5, xMax: 5, yMin: -6, yMax: 8 },
    });
    b.standsFor(pair, "two zeroes to drag, with the parabola, its equation, α + β and αβ");
    b.studentOnly(pair.action(ZeroPlaneAction.MoveZero));
    b.witness(
      pair.learner(ZeroPlaneAction.MoveZero, { index: 0, to: -1 }),
      pair.learner(ZeroPlaneAction.MoveZero, { index: 1, to: -2 }),
    );
    const rule = w.body(
      t(
        r`From the last lesson, $x^2 + bx + c$ has $b = -(\text{sum})$ and $c = \text{product}$. So a quadratic with a given sum and product is $$x^2 - (\text{sum})\,x + (\text{product})$$ Here: $$x^2 - (-3)x + 2 = x^2 + 3x + 2$$ We didn't even need the zeroes themselves, only their sum and product.`,
        r`पिछले पाठ से, $x^2 + bx + c$ में $b = -(\text{योग})$ और $c = \text{गुणनफल}$। तो दिए गए योग और गुणनफल वाला द्विघात बहुपद है $$x^2 - (\text{योग})\,x + (\text{गुणनफल})$$ यहाँ: $$x^2 - (-3)x + 2 = x^2 + 3x + 2$$ हमें शून्यकों की ज़रूरत भी नहीं पड़ी, केवल उनका योग और गुणनफल।`,
      ),
      "rule",
      { isHidden: true },
    );
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "The zeroes add to 4 and multiply to 1. Which quadratic is it?",
        "शून्यकों का योग 4 और गुणनफल 1 है। कौन-सा द्विघात बहुपद है?",
      ),
      options: [
        { id: "right", label: t(r`$x^2 - 4x + 1$`, r`$x^2 - 4x + 1$`) },
        {
          id: "sign",
          label: t(r`$x^2 + 4x + 1$`, r`$x^2 + 4x + 1$`),
          feedback: t(
            r`The coefficient of $x$ is **minus** the sum.`,
            r`$x$ का गुणांक योग का **ऋण** है।`,
          ),
        },
        {
          id: "swap",
          label: t(r`$x^2 + x + 4$`, r`$x^2 + x + 4$`),
          feedback: t(
            r`The sum goes with $x$, and the product is the constant term. They're swapped.`,
            r`योग $x$ के साथ जाता है, और गुणनफल अचर पद है। ये उलट गए हैं।`,
          ),
        },
      ],
      answer: "right",
      isHidden: true,
    });
    b.when(
      pair.on(ZeroPlaneSignal.Changed),
      [theBoard.show(rule), theBoard.show(ask)],
      pair
        .derived(ZeroPlaneDerived.SumOfZeroes)
        .eq(-3)
        .and(pair.derived(ZeroPlaneDerived.ProductOfZeroes).eq(2)),
    );
    return column([
      w.title(t("Run it backwards", "उल्टा चलाओ")),
      w.body(
        t(
          "I'm thinking of a quadratic. Its zeroes add to −3 and multiply to 2. **Drag the zeroes until both match.**",
          "मैं एक द्विघात बहुपद सोच रहा हूँ। इसके शून्यकों का योग −3 और गुणनफल 2 है। **शून्यकों को तब तक खींचो जब तक दोनों मेल न खाएँ।**",
        ),
      ),
      pair,
      rule,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** k(x² + 3x + 2) keeps the zeroes; k clears fractions; a sum of 0 means no x-term. */
const anyK = page("any-k", (b) => {
  const w = wordsOn(b);
  const curve = b.prop(zeroPlaneDef, "curve", {
    form: PlaneForm.Zeroes,
    zeroes: [-1, -2],
    isDraggable: false,
    canSetLeading: true,
    leadingName: "k",
    window: { xMin: -5, xMax: 3, yMin: -6, yMax: 8 },
  });
  b.standsFor(curve, "y = k(x + 1)(x + 2), with k to change");
  b.studentOnly(curve.action(ZeroPlaneAction.SetLeading));
  return column([
    w.title(t("Not just one answer", "केवल एक उत्तर नहीं")),
    w.body(
      t(
        r`Is $x^2 + 3x + 2$ the only quadratic with these zeroes? **Multiply it by any number $k$: change $k$ below.**`,
        r`क्या $x^2 + 3x + 2$ ही इन शून्यकों वाला अकेला द्विघात बहुपद है? **इसे किसी भी संख्या $k$ से गुणा करो: नीचे $k$ बदलो।**`,
      ),
    ),
    curve,
    w.body(
      t(
        r`The curve stretches, and flips when $k$ is negative, but it still meets the x-axis at $-1$ and $-2$. Wherever $x^2 + 3x + 2$ is 0, $k$ times it is $k \times 0 = 0$ too. So any $$k(x^2 + 3x + 2), \qquad k \ne 0$$ has the same zeroes. With $k = 0$ it would be 0 everywhere, not a quadratic.`,
        r`वक्र खिंचता है, और $k$ ऋणात्मक हो तो उल्टा हो जाता है, पर फिर भी x-अक्ष से $-1$ और $-2$ पर मिलता है। जहाँ $x^2 + 3x + 2$ शून्य है, वहाँ $k$ गुणा भी $k \times 0 = 0$ है। तो कोई भी $$k(x^2 + 3x + 2), \qquad k \ne 0$$ के शून्यक वही हैं। $k = 0$ होने पर यह हर जगह 0 होता, द्विघात नहीं।`,
      ),
    ),
    w.body(
      t(
        r`**Use $k$ to clear fractions.** For sum $\frac{1}{4}$ and product $-1$: $$x^2 - \tfrac{1}{4}x - 1$$ Take $k = 4$: $$4x^2 - x - 4$$`,
        r`**भिन्न हटाने के लिए $k$ का उपयोग करो।** योग $\frac{1}{4}$ और गुणनफल $-1$ के लिए: $$x^2 - \tfrac{1}{4}x - 1$$ $k = 4$ लो: $$4x^2 - x - 4$$`,
      ),
    ),
    w.body(
      t(
        r`**A sum of 0 means no $x$-term.** For sum 0 and product $\sqrt{5}$: $$x^2 + \sqrt{5}$$`,
        r`**योग 0 का अर्थ है कोई $x$ वाला पद नहीं।** योग 0 और गुणनफल $\sqrt{5}$ के लिए: $$x^2 + \sqrt{5}$$`,
      ),
    ),
    space(),
  ]);
});

/** Ex 2.2 Q2: sum √2, product 1/3. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        r`Which quadratic has zeroes with sum $\sqrt{2}$ and product $\frac{1}{3}$?`,
        r`किस द्विघात बहुपद के शून्यकों का योग $\sqrt{2}$ और गुणनफल $\frac{1}{3}$ है?`,
      ),
      options: [
        { id: "right", label: t(r`$3x^2 - 3\sqrt{2}x + 1$`, r`$3x^2 - 3\sqrt{2}x + 1$`) },
        {
          id: "sign",
          label: t(r`$3x^2 + 3\sqrt{2}x + 1$`, r`$3x^2 + 3\sqrt{2}x + 1$`),
          feedback: t(
            r`The coefficient of $x$ is minus the sum: $x^2 - \sqrt{2}x + \frac{1}{3}$, times 3.`,
            r`$x$ का गुणांक योग का ऋण है: $x^2 - \sqrt{2}x + \frac{1}{3}$, गुणा 3।`,
          ),
        },
        {
          id: "swap",
          label: t(r`$3x^2 - x + 3\sqrt{2}$`, r`$3x^2 - x + 3\sqrt{2}$`),
          feedback: t(
            r`The sum goes with $x$, the product is the constant term.`,
            r`योग $x$ के साथ जाता है, गुणनफल अचर पद है।`,
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
export const overview = [backwards, anyK, yourTurn];

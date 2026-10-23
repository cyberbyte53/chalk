import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/content-source/patterns";
import {
  BoxMode,
  PlaneForm,
  ZeroPlaneAction,
  ZeroPlaneDerived,
  ZeroPlaneSignal,
  polyBoxDef,
  zeroPlaneDef,
} from "@chalk/prop-polynomials";

const r = String.raw;

/** The axis of symmetry sits midway between the zeroes, and at x = −b/2a: so α + β = −b/a. */
const midway = page(
  "midway",
  (b) => {
    const w = wordsOn(b);
    const plane = b.prop(zeroPlaneDef, "graph", {
      form: PlaneForm.Zeroes,
      zeroes: [-1, 3],
      isSymmetryShown: true,
      window: { xMin: -5, xMax: 6, yMin: -8, yMax: 8 },
    });
    b.studentOnly(plane.action(ZeroPlaneAction.MoveZero));
    const after = wordsOn(b).definition(
      t(
        r`The axis is at $x = \frac{\alpha + \beta}{2}$ and also at $x = -\frac{b}{2a}$. So for the zeroes $\alpha$, $\beta$ of $ax^2 + bx + c$: $$\alpha + \beta = -\frac{b}{a}.$$`,
        r`अक्ष $x = \frac{\alpha + \beta}{2}$ पर है और $x = -\frac{b}{2a}$ पर भी। इसलिए $ax^2 + bx + c$ के शून्यकों $\alpha$, $\beta$ के लिए: $$\alpha + \beta = -\frac{b}{a}.$$`,
      ),
      "after",
      { isHidden: true },
    );
    b.when(
      plane.on(ZeroPlaneSignal.Changed),
      [theBoard.show(after), theBoard.pass()],
      plane
        .derived(ZeroPlaneDerived.SumOfZeroes)
        .eq(4)
        .and(plane.derived(ZeroPlaneDerived.ZeroCount).eq(2)),
    );
    b.witness(plane.learner(ZeroPlaneAction.MoveZero, { index: 0, to: 1 }));
    return column([
      w.title(t("Midway between the zeroes", "शून्यकों के ठीक बीच")),
      w.body(
        t(
          r`A parabola is symmetric about its axis (the dashed line), so the axis sits exactly midway between the two zeroes. Watch the equation as you drag them: the $x$-term follows their **sum**.`,
          r`परवलय अपने अक्ष (बिंदुदार रेखा) के दोनों ओर एक-सा है, इसलिए अक्ष दोनों शून्यकों के ठीक बीच में रहता है। उन्हें खिसकाते हुए समीकरण देखो: $x$ वाला पद उनके **योग** के साथ बदलता है।`,
        ),
      ),
      w.body(
        t(
          r`Move the zeroes so the axis is at $x = 2$.`,
          r`शून्यकों को ऐसे खिसकाओ कि अक्ष $x = 2$ पर हो।`,
        ),
      ),
      plane,
      after,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Multiply out k(x − α)(x − β) and compare coefficients: both relations at once. */
const box = page("box", (b) => {
  const w = wordsOn(b);
  return column([
    w.title(t("Why: multiply the factors", "क्यों: गुणनखंडों को गुणा करो")),
    w.body(
      t(
        r`If $\alpha$ and $\beta$ are the zeroes, $x - \alpha$ and $x - \beta$ are factors, and $ax^2 + bx + c = k(x - \alpha)(x - \beta)$. Multiply in a box: $$\begin{array}{c|cc} \times & x & -\beta \\ \hline x & x^2 & -\beta x \\ -\alpha & -\alpha x & \alpha\beta \end{array}$$ The two $x$-cells add to $-(\alpha + \beta)x$. So $k(x^2 - (\alpha + \beta)x + \alpha\beta) = ax^2 + bx + c$, and comparing coefficients, $a = k$, $b = -k(\alpha + \beta)$, $c = k\alpha\beta$.`,
        r`यदि $\alpha$ और $\beta$ शून्यक हैं, तो $x - \alpha$ और $x - \beta$ गुणनखंड हैं, और $ax^2 + bx + c = k(x - \alpha)(x - \beta)$। डिब्बे में गुणा करो: $$\begin{array}{c|cc} \times & x & -\beta \\ \hline x & x^2 & -\beta x \\ -\alpha & -\alpha x & \alpha\beta \end{array}$$ $x$ वाले दो खाने जुड़कर $-(\alpha + \beta)x$ बनते हैं। इसलिए $k(x^2 - (\alpha + \beta)x + \alpha\beta) = ax^2 + bx + c$, और गुणांकों की तुलना से $a = k$, $b = -k(\alpha + \beta)$, $c = k\alpha\beta$।`,
      ),
    ),
    w.definition(
      t(
        r`For the zeroes $\alpha$, $\beta$ of $ax^2 + bx + c$: $$\alpha + \beta = -\frac{b}{a}, \qquad \alpha\beta = \frac{c}{a}.$$`,
        r`$ax^2 + bx + c$ के शून्यकों $\alpha$, $\beta$ के लिए: $$\alpha + \beta = -\frac{b}{a}, \qquad \alpha\beta = \frac{c}{a}.$$`,
      ),
    ),
    w.body(
      t(
        r`Example 2: $x^2 + 7x + 10 = (x + 2)(x + 5)$. The zeroes $-2$ and $-5$ add to $-7 = -\frac{7}{1}$ and multiply to $10 = \frac{10}{1}$. Fill the box to see the $7x$ form.`,
        r`उदाहरण 2: $x^2 + 7x + 10 = (x + 2)(x + 5)$। शून्यक $-2$ और $-5$ का योग $-7 = -\frac{7}{1}$ और गुणनफल $10 = \frac{10}{1}$ है। $7x$ बनते देखने के लिए डिब्बा भरो।`,
      ),
    ),
    b.prop(polyBoxDef, "box", { mode: BoxMode.Multiply, side: [1, 2], top: [1, 5] }),
    space(),
  ]);
});

/** p(0) = c: where the graph meets the y-axis is the product (with a = 1). */
const intercept = page("intercept", (b) => {
  const w = wordsOn(b);
  return column([
    w.title(t("The product on the graph", "ग्राफ़ पर गुणनफल")),
    w.body(
      t(
        r`The graph meets the $y$-axis at $p(0) = c$. With $a = 1$, $c = \alpha\beta$: the product of the zeroes is the height where the curve crosses the $y$-axis. Drag the zeroes and watch that point. Put one zero at $0$: the product is $0$, and the curve passes through the origin.`,
        r`ग्राफ़ $y$-अक्ष से $p(0) = c$ पर मिलता है। $a = 1$ होने पर $c = \alpha\beta$: शून्यकों का गुणनफल वह ऊँचाई है जहाँ वक्र $y$-अक्ष को काटता है। शून्यकों को खिसकाओ और वह बिंदु देखो। एक शून्यक $0$ पर रखो: गुणनफल $0$ है, और वक्र मूलबिंदु से गुज़रता है।`,
      ),
    ),
    b.prop(zeroPlaneDef, "graph", {
      form: PlaneForm.Zeroes,
      zeroes: [-2, 3],
      isInterceptShown: true,
      window: { xMin: -5, xMax: 5, yMin: -8, yMax: 8 },
    }),
    w.note(
      t(
        r`Zeroes of opposite signs give a negative product: the curve crosses the $y$-axis below the origin.`,
        r`विपरीत चिह्नों के शून्यकों का गुणनफल ऋणात्मक होता है: वक्र $y$-अक्ष को मूलबिंदु के नीचे काटता है।`,
      ),
    ),
    space(),
  ]);
});

/** Your turn: NCERT Ex 2.2 Q1(iii), with the sign of b as the trap. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
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
            r`Write it in standard form first: $6x^2 - 7x - 3$, so $b = -7$ and $-\frac{b}{a} = \frac{7}{6}$.`,
            r`पहले मानक रूप में लिखो: $6x^2 - 7x - 3$, इसलिए $b = -7$ और $-\frac{b}{a} = \frac{7}{6}$।`,
          ),
        },
        {
          id: "product",
          label: t(r`$-\frac{1}{2}$`, r`$-\frac{1}{2}$`),
          feedback: t(
            r`That is $\frac{c}{a} = \frac{-3}{6}$, the **product** of the zeroes.`,
            r`वह $\frac{c}{a} = \frac{-3}{6}$ है, शून्यकों का **गुणनफल**।`,
          ),
        },
      ],
      answer: "right",
    });
    return column([w.title(t("Your turn", "अब तुम")), ask, space()]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order. */
export const overview = [midway, box, intercept, yourTurn];

import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/content-source/patterns";
import { BoxMode, PolyBoxAction, PolyBoxSignal, polyBoxDef } from "@chalk/prop-polynomials";

const r = String.raw;

/** NCERT Example 6 as a box: 2x² + 3x + 1 ÷ (x + 2) = 2x − 1, remainder 3. */
const box = page(
  "box",
  (b) => {
    const w = wordsOn(b);
    const divide = b.prop(polyBoxDef, "box", {
      mode: BoxMode.Divide,
      side: [1, 2],
      dividend: [2, 3, 1],
    });
    b.studentOnly(divide.action(PolyBoxAction.Next));
    const after = wordsOn(b).body(
      t(
        r`What's left, $3$, has degree 0, less than the divisor's degree 1: stop. The quotient is $2x - 1$ and the remainder $3$, and $$2x^2 + 3x + 1 = (x + 2)(2x - 1) + 3.$$ Dividend = divisor × quotient + remainder, just like $a = bq + r$ for numbers.`,
        r`बचा हुआ, $3$, घात 0 का है, भाजक की घात 1 से कम: रुको। भागफल $2x - 1$ है और शेषफल $3$, और $$2x^2 + 3x + 1 = (x + 2)(2x - 1) + 3.$$ भाज्य = भाजक × भागफल + शेषफल, ठीक संख्याओं के $a = bq + r$ जैसा।`,
      ),
      "after",
      { isHidden: true },
    );
    b.when(divide.on(PolyBoxSignal.Finished), [theBoard.show(after), theBoard.pass()]);
    b.witness(divide.learner(PolyBoxAction.Next), divide.learner(PolyBoxAction.Next));
    return column([
      w.title(t("Dividing with a box", "डिब्बे से भाग")),
      w.body(
        t(
          r`Divide $2x^2 + 3x + 1$ by $x + 2$. The divisor goes down the side; the quotient grows along the top. Each step, ask: what times $x$ gives the first term of what's left? That term's column, divisor × term, is taken away. Tap → for each step.`,
          r`$2x^2 + 3x + 1$ को $x + 2$ से भाग दो। भाजक बग़ल में नीचे की ओर; भागफल ऊपर बढ़ता है। हर क़दम पर पूछो: $x$ को किससे गुणा करें कि बचे हुए का पहला पद मिले? उस पद का स्तंभ, भाजक × पद, घटा दिया जाता है। हर क़दम के लिए → दबाओ।`,
        ),
      ),
      divide,
      after,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** NCERT Example 7: a quadratic divisor, and the stopping rule deg r < deg g. */
const quadraticDivisor = page(
  "quadratic-divisor",
  (b) => {
    const w = wordsOn(b);
    const divide = b.prop(polyBoxDef, "box", {
      mode: BoxMode.Divide,
      side: [1, 2, 1],
      dividend: [3, 1, 2, 5],
    });
    b.studentOnly(divide.action(PolyBoxAction.Next));
    const after = wordsOn(b).definition(
      t(
        r`**The division algorithm.** For polynomials $p(x)$ and $g(x) \ne 0$ there are $q(x)$ and $r(x)$ with $$p(x) = g(x) \times q(x) + r(x),$$ where $r(x) = 0$ or $\deg r < \deg g$. Here: $$\begin{aligned} 3x^3 + x^2 &+ 2x + 5 \\ &= (x^2 + 2x + 1)(3x - 5) \\ &\quad + 9x + 10. \end{aligned}$$`,
        r`**विभाजन एल्गोरिथ्म।** बहुपदों $p(x)$ और $g(x) \ne 0$ के लिए ऐसे $q(x)$ और $r(x)$ होते हैं कि $$p(x) = g(x) \times q(x) + r(x),$$ जहाँ $r(x) = 0$ या $\deg r < \deg g$। यहाँ: $$\begin{aligned} 3x^3 + x^2 &+ 2x + 5 \\ &= (x^2 + 2x + 1)(3x - 5) \\ &\quad + 9x + 10. \end{aligned}$$`,
      ),
      "after",
      { isHidden: true },
    );
    b.when(divide.on(PolyBoxSignal.Finished), [theBoard.show(after), theBoard.pass()]);
    b.witness(divide.learner(PolyBoxAction.Next), divide.learner(PolyBoxAction.Next));
    return column([
      w.title(t("A quadratic divisor", "द्विघात भाजक")),
      w.body(
        t(
          r`Divide $3x^3 + x^2 + 2x + 5$ by $x^2 + 2x + 1$. The box has three rows now. Keep going while what's left has degree at least 2, the divisor's degree.`,
          r`$3x^3 + x^2 + 2x + 5$ को $x^2 + 2x + 1$ से भाग दो। अब डिब्बे में तीन पंक्तियाँ हैं। तब तक चलते रहो जब तक बचे हुए की घात कम से कम 2, यानी भाजक की घात, हो।`,
        ),
      ),
      divide,
      after,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** NCERT Example 8: standard form first. */
const standardForm = page("standard-form", (b) => {
  const w = wordsOn(b);
  return column([
    w.title(t("Standard form first", "पहले मानक रूप")),
    w.body(
      t(
        r`To divide $3x^2 - x^3 - 3x + 5$ by $x - 1 - x^2$, first write both with powers going down: $-x^3 + 3x^2 - 3x + 5$ and $-x^2 + x - 1$. The first terms decide each step, so they must really be the highest powers.`,
        r`$3x^2 - x^3 - 3x + 5$ को $x - 1 - x^2$ से भाग देने से पहले दोनों को घटती घातों में लिखो: $-x^3 + 3x^2 - 3x + 5$ और $-x^2 + x - 1$। हर क़दम पहले पदों से तय होता है, इसलिए वे सचमुच सबसे बड़ी घात वाले होने चाहिए।`,
      ),
    ),
    b.prop(polyBoxDef, "box", {
      mode: BoxMode.Divide,
      side: [-1, 1, -1],
      dividend: [-1, 3, -3, 5],
    }),
    w.note(
      t(
        r`Quotient $x - 2$, remainder $3$. Check: $(-x^2 + x - 1)(x - 2) + 3 = -x^3 + 3x^2 - 3x + 5$.`,
        r`भागफल $x - 2$, शेषफल $3$। जाँच: $(-x^2 + x - 1)(x - 2) + 3 = -x^3 + 3x^2 - 3x + 5$।`,
      ),
    ),
    space(),
  ]);
});

/** Your turn: NCERT Ex 2.3 Q1(i). */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      prompt: t(
        r`Divide $x^3 - 3x^2 + 5x - 3$ by $x^2 - 2$. What are the quotient and remainder?`,
        r`$x^3 - 3x^2 + 5x - 3$ को $x^2 - 2$ से भाग दो। भागफल और शेषफल क्या हैं?`,
      ),
      options: [
        {
          id: "subtract",
          label: t(r`$q = x - 3$, $\; r = 7x + 3$`, r`$q = x - 3$, $\; r = 7x + 3$`),
          feedback: t(
            r`The second column is $-3(x^2 - 2) = -3x^2 + 6$. Taking it away from $-3x^2 + 7x - 3$ leaves $7x - 9$: $-3 - 6 = -9$.`,
            r`दूसरा स्तंभ $-3(x^2 - 2) = -3x^2 + 6$ है। इसे $-3x^2 + 7x - 3$ में से घटाने पर $7x - 9$ बचता है: $-3 - 6 = -9$।`,
          ),
        },
        { id: "right", label: t(r`$q = x - 3$, $\; r = 7x - 9$`, r`$q = x - 3$, $\; r = 7x - 9$`) },
        {
          id: "early",
          label: t(r`$q = x$, $\; r = -3x^2 + 7x - 3$`, r`$q = x$, $\; r = -3x^2 + 7x - 3$`),
          feedback: t(
            r`What's left still has degree 2, the divisor's degree: divide once more.`,
            r`बचे हुए की घात अभी भी 2 है, भाजक जितनी: एक बार और भाग दो।`,
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Your turn", "अब तुम")),
      ask,
      b.prop(polyBoxDef, "box", {
        mode: BoxMode.Divide,
        side: [1, 0, -2],
        dividend: [1, -3, 5, -3],
      }),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order. */
export const overview = [box, quadraticDivisor, standardForm, yourTurn];

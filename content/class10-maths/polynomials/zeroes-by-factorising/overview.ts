import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/content-source/patterns";
import {
  BoxMode,
  PlaneForm,
  PolyBoxAction,
  PolyBoxSignal,
  polyBoxDef,
  zeroPlaneDef,
} from "@chalk/prop-polynomials";

const r = String.raw;

/** 2x² − 8x + 6 = (2x − 2)(x − 3): fill the box to check, then read the zeroes off the factors. */
const factor = page(
  "factor",
  (b) => {
    const w = wordsOn(b);
    const box = b.prop(polyBoxDef, "box", { mode: BoxMode.Multiply, side: [2, -2], top: [1, -3] });
    b.studentOnly(box.action(PolyBoxAction.Next));
    const graph = b.prop(
      zeroPlaneDef,
      "graph",
      {
        form: PlaneForm.Zeroes,
        leading: 2,
        zeroes: [1, 3],
        isDraggable: false,
        isFactoredShown: true,
        window: { xMin: -1, xMax: 5, yMin: -4, yMax: 8 },
      },
      { isHidden: true },
    );
    const after = wordsOn(b).body(
      t(
        r`A product is 0 only when one of its factors is 0: $x - 1 = 0$ or $x - 3 = 0$. So the zeroes are $1$ and $3$, and there the graph meets the axis.`,
        r`गुणनफल तभी 0 होता है जब उसका कोई गुणनखंड 0 हो: $x - 1 = 0$ या $x - 3 = 0$। इसलिए शून्यक $1$ और $3$ हैं, और वहीं ग्राफ़ अक्ष से मिलता है।`,
      ),
      "after",
      { isHidden: true },
    );
    b.when(box.on(PolyBoxSignal.Finished), [
      theBoard.show(graph),
      theBoard.show(after),
      theBoard.pass(),
    ]);
    b.witness(
      box.learner(PolyBoxAction.Next),
      box.learner(PolyBoxAction.Next),
      box.learner(PolyBoxAction.Next),
      box.learner(PolyBoxAction.Next),
    );
    return column([
      w.title(t("Factorise, then read the zeroes", "गुणनखंड करो, फिर शून्यक पढ़ो")),
      w.body(
        t(
          r`Split the middle term of $2x^2 - 8x + 6$: $$\begin{aligned} 2x^2 - 8x + 6 &= 2x^2 - 6x - 2x + 6 \\ &= 2x(x - 3) - 2(x - 3) \\ &= (2x - 2)(x - 3). \end{aligned}$$ Check it: fill the box, one cell at a time.`,
          r`$2x^2 - 8x + 6$ का मध्य पद तोड़ो: $$\begin{aligned} 2x^2 - 8x + 6 &= 2x^2 - 6x - 2x + 6 \\ &= 2x(x - 3) - 2(x - 3) \\ &= (2x - 2)(x - 3). \end{aligned}$$ जाँचो: डिब्बा भरो, एक-एक खाना।`,
        ),
      ),
      box,
      graph,
      after,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Zeroes need not be whole: ±√3, and a factor u gives the zero 0. */
const special = page("special", (b) => {
  const w = wordsOn(b);
  return column([
    w.title(t("Surds and zero", "करणी और शून्य")),
    w.body(
      t(
        r`$x^2 - 3$ is a difference of squares: $x^2 - 3 = (x - \sqrt{3})(x + \sqrt{3})$. Its zeroes are $\sqrt{3}$ and $-\sqrt{3}$, about $\pm 1.73$: a polynomial's zeroes needn't be whole numbers.`,
        r`$x^2 - 3$ वर्गों का अंतर है: $x^2 - 3 = (x - \sqrt{3})(x + \sqrt{3})$। इसके शून्यक $\sqrt{3}$ और $-\sqrt{3}$ हैं, लगभग $\pm 1.73$: बहुपद के शून्यक पूर्ण संख्याएँ हों, ज़रूरी नहीं।`,
      ),
    ),
    b.prop(zeroPlaneDef, "graph", {
      form: PlaneForm.Coefficients,
      fixed: [1, 0, -3],
      isDraggable: false,
      window: { xMin: -4, xMax: 4, yMin: -4, yMax: 6 },
    }),
    w.body(
      t(
        r`With no constant term, take out the common factor: $4u^2 + 8u = 4u(u + 2)$, so the zeroes are $0$ and $-2$. The graph passes through the origin.`,
        r`जब अचर पद न हो, तो उभयनिष्ठ गुणनखंड बाहर निकालो: $4u^2 + 8u = 4u(u + 2)$, इसलिए शून्यक $0$ और $-2$ हैं। ग्राफ़ मूलबिंदु से गुज़रता है।`,
      ),
    ),
    space(),
  ]);
});

/** Your turn: 6x² − 3 − 7x (NCERT Ex 2.2 Q1(iii)). */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      prompt: t(
        r`$6x^2 - 7x - 3 = (2x - 3)(3x + 1)$. What are its zeroes?`,
        r`$6x^2 - 7x - 3 = (2x - 3)(3x + 1)$। इसके शून्यक क्या हैं?`,
      ),
      options: [
        {
          id: "flip",
          label: t(r`$-\frac{3}{2}$ and $\frac{1}{3}$`, r`$-\frac{3}{2}$ और $\frac{1}{3}$`),
          feedback: t(
            r`Set each factor to 0: $2x - 3 = 0$ gives $x = \frac{3}{2}$, and $3x + 1 = 0$ gives $x = -\frac{1}{3}$.`,
            r`हर गुणनखंड को 0 रखो: $2x - 3 = 0$ से $x = \frac{3}{2}$, और $3x + 1 = 0$ से $x = -\frac{1}{3}$।`,
          ),
        },
        {
          id: "whole",
          label: t(r`$3$ and $-1$`, r`$3$ और $-1$`),
          feedback: t(
            r`$2x - 3 = 0$ means $2x = 3$, so $x = \frac{3}{2}$, not $3$. Divide by the coefficient of $x$ too.`,
            r`$2x - 3 = 0$ का अर्थ $2x = 3$, यानी $x = \frac{3}{2}$, $3$ नहीं। $x$ के गुणांक से भी भाग दो।`,
          ),
        },
        {
          id: "right",
          label: t(r`$\frac{3}{2}$ and $-\frac{1}{3}$`, r`$\frac{3}{2}$ और $-\frac{1}{3}$`),
        },
      ],
      answer: "right",
    });
    return column([w.title(t("Your turn", "अब तुम")), ask, space()]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order. */
export const overview = [factor, special, yourTurn];

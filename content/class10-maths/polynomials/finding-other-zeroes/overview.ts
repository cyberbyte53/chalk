import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  BoxMode,
  PlaneForm,
  PolyBoxAction,
  PolyBoxSignal,
  polyBoxDef,
  zeroPlaneDef,
} from "@chalk/prop-polynomials";

const r = String.raw;

/** 1 is a zero, so x − 1 divides exactly (the remainder is p(1) = 0); the quotient holds the rest. */
const oneKnown = page(
  "one-known",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "Why a known zero k makes x − k divide exactly: p(x) = (x − k)q(x) + r with r a number, and putting x = k gives r = p(k) = 0. Divide x³ − 3x² − x + 3 by x − 1 and factorise the quotient: zeroes 1, −1 and 3.",
    );
    const box = b.prop(polyBoxDef, "box", {
      mode: BoxMode.Divide,
      dividend: [1, -3, -1, 3],
      side: [1, -1],
      steps: 0,
    });
    b.standsFor(box, "the box dividing x³ − 3x² − x + 3 by x − 1");
    b.studentOnly(box.action(PolyBoxAction.Next));
    b.witness(
      box.learner(PolyBoxAction.Next),
      box.learner(PolyBoxAction.Next),
      box.learner(PolyBoxAction.Next),
    );
    const quotient = w.body(
      t(
        r`The remainder comes out 0: $$x^3 - 3x^2 - x + 3 = (x - 1)(x^2 - 2x - 3)$$`,
        r`शेषफल 0 आता है: $$x^3 - 3x^2 - x + 3 = (x - 1)(x^2 - 2x - 3)$$`,
      ),
      "quotient",
      { isHidden: true },
    );
    const rest = choiceQuestion(b, {
      name: "rest",
      prompt: t(
        r`The quotient is $x^2 - 2x - 3$. What are the other two zeroes?`,
        r`भागफल $x^2 - 2x - 3$ है। बाक़ी दो शून्यक क्या हैं?`,
      ),
      options: [
        { id: "right", label: t(r`$-1$ and $3$`, r`$-1$ और $3$`) },
        {
          id: "signs",
          label: t(r`$1$ and $-3$`, r`$1$ और $-3$`),
          feedback: t(
            r`$x^2 - 2x - 3 = (x + 1)(x - 3)$. Set each factor to 0.`,
            r`$x^2 - 2x - 3 = (x + 1)(x - 3)$। हर गुणनखंड को 0 रखो।`,
          ),
        },
      ],
      answer: "right",
      isHidden: true,
    });
    const all = w.body(
      t(r`So all three zeroes are 1, $-1$ and 3.`, r`तो तीनों शून्यक 1, $-1$ और 3 हैं।`),
      "all",
      { isHidden: true },
    );
    b.when(box.on(PolyBoxSignal.Finished), [theBoard.show(quotient), theBoard.show(rest)]);
    b.when(rest.on(QuestionSignal.Correct), theBoard.show(all));
    return column([
      w.title(t("One zero, then the rest", "एक शून्यक, फिर बाक़ी")),
      w.body(
        t(
          r`1 is a zero of $x^3 - 3x^2 - x + 3$. Find the other two.`,
          r`1, $x^3 - 3x^2 - x + 3$ का एक शून्यक है। बाक़ी दो ज्ञात करो।`,
        ),
      ),
      w.body(
        t(
          r`A zero gives a factor. Here's why. Divide by $x - 1$: $$p(x) = (x - 1)\,q(x) + r$$ The remainder $r$ is just a number, because its degree must be lower than 1. Now put $x = 1$: $$p(1) = 0 \times q(1) + r$$ $p(1) = 0$, so $r = 0$. **If $k$ is a zero, then $x - k$ divides exactly.**`,
          r`शून्यक से गुणनखंड मिलता है। क्यों, देखो। $x - 1$ से भाग दो: $$p(x) = (x - 1)\,q(x) + r$$ शेषफल $r$ बस एक संख्या है, क्योंकि उसकी घात 1 से कम होनी चाहिए। अब $x = 1$ रखो: $$p(1) = 0 \times q(1) + r$$ $p(1) = 0$, तो $r = 0$। **यदि $k$ शून्यक है, तो $x - k$ ठीक-ठीक भाग देता है।**`,
        ),
      ),
      w.body(t("Divide in the box: tap → for each step.", "डिब्बे में भाग दो: हर क़दम के लिए → दबाओ।")),
      box,
      quotient,
      rest,
      all,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** NCERT Example 9: ±√2 known; multiply their factors first, divide, factorise the quotient. */
const twoKnown = page("two-known", (b) => {
  const w = wordsOn(b);
  const curve = b.prop(zeroPlaneDef, "curve", {
    form: PlaneForm.Coefficients,
    fixed: [2, -3, -3, 6, -2],
    isDraggable: false,
    window: { xMin: -2, xMax: 2.5, yMin: -8, yMax: 4 },
  });
  b.standsFor(curve, "the graph of y = 2x⁴ − 3x³ − 3x² + 6x − 2, meeting the x-axis four times");
  return column([
    w.title(t("Two zeroes known", "दो शून्यक ज्ञात")),
    w.body(
      t(
        r`$\sqrt{2}$ and $-\sqrt{2}$ are zeroes of $2x^4 - 3x^3 - 3x^2 + 6x - 2$. Find the others. Each zero gives a factor. Multiply the two factors first, so there are no square roots to divide by: $$(x - \sqrt{2})(x + \sqrt{2}) = x^2 - 2$$ Divide by $x^2 - 2$: $$\begin{aligned} &2x^4 - 3x^3 - 3x^2 + 6x - 2 \\ &= (x^2 - 2)(2x^2 - 3x + 1) \end{aligned}$$`,
        r`$\sqrt{2}$ और $-\sqrt{2}$, $2x^4 - 3x^3 - 3x^2 + 6x - 2$ के शून्यक हैं। बाक़ी ज्ञात करो। हर शून्यक से एक गुणनखंड मिलता है। पहले दोनों गुणनखंडों को गुणा करो, ताकि वर्गमूल वाले गुणनखंड से भाग न देना पड़े: $$(x - \sqrt{2})(x + \sqrt{2}) = x^2 - 2$$ $x^2 - 2$ से भाग दो: $$\begin{aligned} &2x^4 - 3x^3 - 3x^2 + 6x - 2 \\ &= (x^2 - 2)(2x^2 - 3x + 1) \end{aligned}$$`,
      ),
    ),
    w.body(
      t(
        r`**Don't stop at the quotient: factorise it.** $$2x^2 - 3x + 1 = (2x - 1)(x - 1)$$ So the zeroes are $\sqrt{2}$, $-\sqrt{2}$, $\frac{1}{2}$ and 1. The graph meets the x-axis exactly there: degree 4, four zeroes, the most it can have.`,
        r`**भागफल पर मत रुको: उसके गुणनखंड करो।** $$2x^2 - 3x + 1 = (2x - 1)(x - 1)$$ तो शून्यक $\sqrt{2}$, $-\sqrt{2}$, $\frac{1}{2}$ और 1 हैं। ग्राफ़ x-अक्ष से ठीक वहीं मिलता है: घात 4, चार शून्यक, जितने अधिकतम हो सकते हैं।`,
      ),
    ),
    curve,
    space(),
  ]);
});

/** Ex 2.3 Q2: remainder 0 means a factor. */
const isFactor = page("is-it-a-factor", (b) => {
  const w = wordsOn(b);
  return column([
    w.title(t("Is it a factor?", "क्या यह गुणनखंड है?")),
    w.body(
      t(
        r`To check whether one polynomial is a factor of another, divide. Remainder 0 means yes. Is $t^2 - 3$ a factor of $2t^4 + 3t^3 - 2t^2 - 9t - 12$? Divide, one step at a time: $$\begin{aligned} \tfrac{2t^4}{t^2} = 2t^2 &: \quad \text{left } 3t^3 + 4t^2 - 9t - 12 \\ \tfrac{3t^3}{t^2} = 3t &: \quad \text{left } 4t^2 - 12 \\ \tfrac{4t^2}{t^2} = 4 &: \quad \text{left } 0 \end{aligned}$$ So $$\begin{aligned} &2t^4 + 3t^3 - 2t^2 - 9t - 12 \\ &= (t^2 - 3)(2t^2 + 3t + 4) + 0 \end{aligned}$$ The remainder is 0, so yes.`,
        r`कोई बहुपद दूसरे का गुणनखंड है या नहीं, यह जाँचने के लिए भाग दो। शेषफल 0 का अर्थ है हाँ। क्या $t^2 - 3$, $2t^4 + 3t^3 - 2t^2 - 9t - 12$ का गुणनखंड है? एक-एक क़दम भाग दो: $$\begin{aligned} \tfrac{2t^4}{t^2} = 2t^2 &: \quad \text{बचा } 3t^3 + 4t^2 - 9t - 12 \\ \tfrac{3t^3}{t^2} = 3t &: \quad \text{बचा } 4t^2 - 12 \\ \tfrac{4t^2}{t^2} = 4 &: \quad \text{बचा } 0 \end{aligned}$$ तो $$\begin{aligned} &2t^4 + 3t^3 - 2t^2 - 9t - 12 \\ &= (t^2 - 3)(2t^2 + 3t + 4) + 0 \end{aligned}$$ शेषफल 0 है, तो हाँ।`,
      ),
    ),
    space(),
  ]);
});

/** Ex 2.3 Q3: ±√(5/3) known; clear the fraction with k; (x + 1)² gives −1 twice. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t("What are the other two zeroes?", "बाक़ी दो शून्यक क्या हैं?"),
      options: [
        { id: "right", label: t(r`$-1$ and $-1$`, r`$-1$ और $-1$`) },
        {
          id: "plusminus",
          label: t(r`$1$ and $-1$`, r`$1$ और $-1$`),
          feedback: t(
            r`$x^2 + 2x + 1 = (x + 1)^2$, and both factors are $x + 1$.`,
            r`$x^2 + 2x + 1 = (x + 1)^2$, और दोनों गुणनखंड $x + 1$ हैं।`,
          ),
        },
        {
          id: "plus",
          label: t(r`$1$ and $1$`, r`$1$ और $1$`),
          feedback: t(r`$x + 1 = 0$ gives $x = -1$.`, r`$x + 1 = 0$ से $x = -1$।`),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Your turn", "अब तुम्हारी बारी")),
      w.body(
        t(
          r`$\sqrt{\frac{5}{3}}$ and $-\sqrt{\frac{5}{3}}$ are zeroes of $3x^4 + 6x^3 - 2x^2 - 10x - 5$. Multiply their factors: $$\left(x - \sqrt{\tfrac{5}{3}}\right)\left(x + \sqrt{\tfrac{5}{3}}\right) = x^2 - \tfrac{5}{3}$$ $3x^2 - 5 = 3\left(x^2 - \tfrac{5}{3}\right)$ has the same zeroes, so it is a factor too, and it has no fractions. Dividing by $3x^2 - 5$ gives $$x^2 + 2x + 1$$`,
          r`$\sqrt{\frac{5}{3}}$ और $-\sqrt{\frac{5}{3}}$, $3x^4 + 6x^3 - 2x^2 - 10x - 5$ के शून्यक हैं। इनके गुणनखंड गुणा करो: $$\left(x - \sqrt{\tfrac{5}{3}}\right)\left(x + \sqrt{\tfrac{5}{3}}\right) = x^2 - \tfrac{5}{3}$$ $3x^2 - 5 = 3\left(x^2 - \tfrac{5}{3}\right)$ के शून्यक वही हैं, तो यह भी एक गुणनखंड है, और इसमें भिन्न नहीं है। $3x^2 - 5$ से भाग देने पर मिलता है $$x^2 + 2x + 1$$`,
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order. */
export const overview = [oneKnown, twoKnown, isFactor, yourTurn];

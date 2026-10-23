import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import { BoxMode, polyBoxDef } from "@chalk/prop-polynomials";

const r = String.raw;

/** (x + 1)(x − 4) = 0 only when a factor is 0: a factor x − k gives the zero k. */
const factors = page(
  "factors",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "Find zeroes without trying numbers: x² − 3x − 4 = (x + 1)(x − 4), and a product is 0 only when one factor is 0, so the zeroes are −1 and 4. A factor x − k gives the zero k; for 2x − 3, divide by 2 as well.",
    );
    const must = choiceQuestion(b, {
      name: "must",
      prompt: t(
        r`$(x + 1)(x - 4) = 0$. What must be true?`,
        r`$(x + 1)(x - 4) = 0$। क्या सच होना चाहिए?`,
      ),
      options: [
        {
          id: "right",
          label: t(r`$x + 1 = 0$ or $x - 4 = 0$`, r`$x + 1 = 0$ या $x - 4 = 0$`),
        },
        {
          id: "both",
          label: t("Both must be 0", "दोनों 0 होने चाहिए"),
          feedback: t("One is enough: 0 times anything is 0.", "एक काफ़ी है: 0 गुणा कुछ भी 0 होता है।"),
        },
        {
          id: "xzero",
          label: t(r`$x = 0$`, r`$x = 0$`),
          feedback: t(
            r`Put $x = 0$ in: $1 \times (-4) = -4$, not 0.`,
            r`$x = 0$ रखो: $1 \times (-4) = -4$, 0 नहीं।`,
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const because = w.body(
      t(
        r`If two numbers multiply to 0, one of them must be 0, because two numbers that aren't 0 never multiply to 0. So each factor gives a zero: $$\begin{aligned} x + 1 &= 0, & x &= -1 \\ x - 4 &= 0, & x &= 4 \end{aligned}$$ The same $-1$ and $4$ as before. **A factor $x - k$ gives the zero $k$.**`,
        r`अगर दो संख्याओं का गुणनफल 0 है, तो उनमें से एक 0 होनी चाहिए, क्योंकि 0 के अलावा कोई दो संख्याएँ गुणा करके 0 नहीं देतीं। तो हर गुणनखंड एक शून्यक देता है: $$\begin{aligned} x + 1 &= 0, & x &= -1 \\ x - 4 &= 0, & x &= 4 \end{aligned}$$ वही $-1$ और $4$ जो पहले मिले। **गुणनखंड $x - k$ से शून्यक $k$ मिलता है।**`,
      ),
      "because",
      { isHidden: true },
    );
    const ball = w.body(
      t(
        r`Riya's ball works the same way: $$20t - 5t^2 = 5t(4 - t)$$ It's at height 0 when $5t = 0$ or $4 - t = 0$: at $t = 0$ and $t = 4$.`,
        r`रिया की गेंद भी ऐसे ही: $$20t - 5t^2 = 5t(4 - t)$$ इसकी ऊँचाई 0 है जब $5t = 0$ या $4 - t = 0$: $t = 0$ और $t = 4$ पर।`,
      ),
      "ball",
      { isHidden: true },
    );
    const check = choiceQuestion(b, {
      name: "check",
      prompt: t(r`What are the zeroes of $(2x - 3)(x + 5)$?`, r`$(2x - 3)(x + 5)$ के शून्यक क्या हैं?`),
      options: [
        { id: "right", label: t(r`$\frac{3}{2}$ and $-5$`, r`$\frac{3}{2}$ और $-5$`) },
        {
          id: "three",
          label: t(r`$3$ and $-5$`, r`$3$ और $-5$`),
          feedback: t(
            r`$2x - 3 = 0$ means $2x = 3$, so $x = \frac{3}{2}$. Divide by the 2 as well.`,
            r`$2x - 3 = 0$ का अर्थ $2x = 3$, तो $x = \frac{3}{2}$। 2 से भी भाग दो।`,
          ),
        },
        {
          id: "signs",
          label: t(r`$-\frac{3}{2}$ and $5$`, r`$-\frac{3}{2}$ और $5$`),
          feedback: t(
            r`Set each factor to 0: $2x - 3 = 0$ gives $+\frac{3}{2}$, and $x + 5 = 0$ gives $-5$.`,
            r`हर गुणनखंड को 0 रखो: $2x - 3 = 0$ से $+\frac{3}{2}$, और $x + 5 = 0$ से $-5$।`,
          ),
        },
      ],
      answer: "right",
      isHidden: true,
    });
    b.when(must.on(QuestionSignal.Correct), [
      theBoard.show(because),
      theBoard.show(ball),
      theBoard.show(check),
    ]);
    return column([
      w.title(t("Zeroes from factors", "गुणनखंडों से शून्यक")),
      w.body(
        t(
          r`Find the zeroes of $x^2 - 3x - 4$ without trying numbers or drawing it. Write it as a product: $$x^2 - 3x - 4 = (x + 1)(x - 4)$$ Writing a polynomial as a product like this is **factorising** it. Each part, $x + 1$ and $x - 4$, is a **factor**.`,
          r`$x^2 - 3x - 4$ के शून्यक बिना संख्याएँ आज़माए या ग्राफ़ बनाए ज्ञात करो। इसे गुणनफल के रूप में लिखो: $$x^2 - 3x - 4 = (x + 1)(x - 4)$$ किसी बहुपद को ऐसे गुणनफल के रूप में लिखना उसका **गुणनखंडन** है। हर भाग, $x + 1$ और $x - 4$, एक **गुणनखंड** है।`,
        ),
      ),
      must,
      because,
      ball,
      check,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Splitting the middle term of 2x² − 8x + 6 in the box: two parts that add to b and multiply to first × last. */
const split = page(
  "split",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "Split the middle term: the two middle cells of the box add to the middle term and multiply to first × last (a box's diagonals multiply to the same thing). For 2x² − 8x + 6: −2x and −6x, so 2x² − 8x + 6 = (2x − 6)(x − 1) = 2(x − 3)(x − 1), zeroes 1 and 3. Then 3x² + 5x − 2 = (3x − 1)(x + 2).",
    );
    const pick = choiceQuestion(b, {
      name: "pick",
      prompt: t(r`Which two parts does $-8x$ split into?`, r`$-8x$ किन दो भागों में टूटता है?`),
      options: [
        { id: "right", label: t(r`$-2x$ and $-6x$`, r`$-2x$ और $-6x$`) },
        {
          id: "sum",
          label: t(r`$-4x$ and $-4x$`, r`$-4x$ और $-4x$`),
          feedback: t(
            r`They add to $-8x$, but multiply to $16x^2$, not $12x^2$.`,
            r`इनका योग $-8x$ है, पर गुणनफल $16x^2$ है, $12x^2$ नहीं।`,
          ),
        },
        {
          id: "product",
          label: t(r`$-12x$ and $x$`, r`$-12x$ और $x$`),
          feedback: t(
            r`They multiply to $-12x^2$ and add to $-11x$. We need $12x^2$ and $-8x$.`,
            r`इनका गुणनफल $-12x^2$ और योग $-11x$ है। हमें $12x^2$ और $-8x$ चाहिए।`,
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const box = b.prop(
      polyBoxDef,
      "box",
      { mode: BoxMode.Multiply, side: [2, -6], top: [1, -1], steps: 4 },
      { isHidden: true },
    );
    b.standsFor(box, "the box for (2x − 6)(x − 1): cells 2x², −2x, −6x and 6");
    const working = w.body(
      t(
        r`The box's sides are the factors: $$\begin{aligned} 2x^2 - 8x + 6 &= 2x^2 - 2x - 6x + 6 \\ &= 2x(x - 1) - 6(x - 1) \\ &= (2x - 6)(x - 1) \\ &= 2(x - 3)(x - 1) \end{aligned}$$ So the zeroes are 1 and 3.`,
        r`डिब्बे की भुजाएँ गुणनखंड हैं: $$\begin{aligned} 2x^2 - 8x + 6 &= 2x^2 - 2x - 6x + 6 \\ &= 2x(x - 1) - 6(x - 1) \\ &= (2x - 6)(x - 1) \\ &= 2(x - 3)(x - 1) \end{aligned}$$ तो शून्यक 1 और 3 हैं।`,
      ),
      "working",
      { isHidden: true },
    );
    const second = w.body(
      t(
        r`One more, $3x^2 + 5x - 2$. The parts must add to $5x$ and multiply to $3x^2 \times (-2) = -6x^2$: that's $6x$ and $-x$. $$\begin{aligned} 3x^2 + 5x - 2 &= 3x^2 + 6x - x - 2 \\ &= 3x(x + 2) - (x + 2) \\ &= (3x - 1)(x + 2) \end{aligned}$$ So the zeroes are $\frac{1}{3}$ and $-2$.`,
        r`एक और, $3x^2 + 5x - 2$। भागों का योग $5x$ और गुणनफल $3x^2 \times (-2) = -6x^2$ होना चाहिए: यानी $6x$ और $-x$। $$\begin{aligned} 3x^2 + 5x - 2 &= 3x^2 + 6x - x - 2 \\ &= 3x(x + 2) - (x + 2) \\ &= (3x - 1)(x + 2) \end{aligned}$$ तो शून्यक $\frac{1}{3}$ और $-2$ हैं।`,
      ),
      "second",
      { isHidden: true },
    );
    b.when(pick.on(QuestionSignal.Correct), [
      theBoard.show(box),
      theBoard.show(working),
      theBoard.show(second),
      theBoard.pass(),
    ]);
    return column([
      w.title(t("Splitting the middle term", "मध्य पद को तोड़ना")),
      w.body(
        t(
          r`**The multiplication box.** To multiply $(x + 2)(x + 3)$, write one factor down the side and the other along the top. Each cell is its row times its column: $$\begin{array}{c|cc} \times & x & 3 \\ \hline x & x^2 & 3x \\ 2 & 2x & 6 \end{array}$$ Adding the cells gives the product: $$(x + 2)(x + 3) = x^2 + 3x + 2x + 6 = x^2 + 5x + 6$$`,
          r`**गुणा वाला डिब्बा।** $(x + 2)(x + 3)$ को गुणा करने के लिए, एक गुणनखंड बाईं ओर नीचे की तरफ़ और दूसरा ऊपर लिखो। हर खाना अपनी पंक्ति गुणा अपने स्तंभ है: $$\begin{array}{c|cc} \times & x & 3 \\ \hline x & x^2 & 3x \\ 2 & 2x & 6 \end{array}$$ खानों को जोड़ने पर गुणनफल मिलता है: $$(x + 2)(x + 3) = x^2 + 3x + 2x + 6 = x^2 + 5x + 6$$`,
        ),
      ),
      w.body(
        t(
          r`Now go the other way: from the polynomial to its factors. Take $$2x^2 - 8x + 6$$ In the box, the first term $2x^2$ and the last term $6$ sit in opposite corners. The middle term $-8x$ splits into the other two cells.`,
          r`अब उल्टा चलो: बहुपद से उसके गुणनखंडों तक। लो $$2x^2 - 8x + 6$$ डिब्बे में पहला पद $2x^2$ और आख़िरी पद $6$ आमने-सामने के कोनों में होते हैं। मध्य पद $-8x$ बाक़ी दो खानों में बँटता है।`,
        ),
      ),
      w.body(
        t(
          r`Which two parts? They must add to $-8x$. They must also multiply to the same as the corners do. In the box above, both diagonals multiply to the same thing: $$x^2 \times 6 = 6x^2, \qquad 3x \times 2x = 6x^2$$ That always happens, because each diagonal multiplies the same four parts: both side terms and both top terms. So here the two parts must multiply to $$2x^2 \times 6 = 12x^2$$`,
          r`कौन-से दो भाग? उनका योग $-8x$ होना चाहिए। उनका गुणनफल भी कोनों के गुणनफल जितना होना चाहिए। ऊपर वाले डिब्बे में दोनों विकर्णों का गुणनफल बराबर है: $$x^2 \times 6 = 6x^2, \qquad 3x \times 2x = 6x^2$$ ऐसा हमेशा होता है, क्योंकि हर विकर्ण उन्हीं चार भागों को गुणा करता है: बाईं ओर के दोनों पद और ऊपर के दोनों पद। तो यहाँ दोनों भागों का गुणनफल होना चाहिए $$2x^2 \times 6 = 12x^2$$`,
        ),
      ),
      pick,
      box,
      working,
      second,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Three shapes: no constant term, a difference of squares (surd zeroes), a perfect square (one zero). */
const shapes = page("shapes", (b) => {
  const w = wordsOn(b);
  return column([
    w.title(t("Three special shapes", "तीन ख़ास रूप")),
    w.body(
      t(
        r`**No constant term.** Then the variable itself is a factor, so 0 is a zero: $$4u^2 + 8u = 4u(u + 2)$$ The zeroes are 0 and $-2$.`,
        r`**कोई अचर पद नहीं।** तब चर ख़ुद एक गुणनखंड है, तो 0 एक शून्यक है: $$4u^2 + 8u = 4u(u + 2)$$ शून्यक 0 और $-2$ हैं।`,
      ),
    ),
    w.body(
      t(
        r`**A difference of squares.** Zeroes don't have to be whole numbers: $$t^2 - 15 = (t - \sqrt{15})(t + \sqrt{15})$$ The zeroes are $\sqrt{15}$ and $-\sqrt{15}$.`,
        r`**वर्गों का अंतर।** शून्यक पूर्ण संख्याएँ हों, ज़रूरी नहीं: $$t^2 - 15 = (t - \sqrt{15})(t + \sqrt{15})$$ शून्यक $\sqrt{15}$ और $-\sqrt{15}$ हैं।`,
      ),
    ),
    w.body(
      t(
        r`**A perfect square.** Both factors are the same, so there's only one zero: $$4s^2 - 4s + 1 = (2s - 1)^2$$ The zero is $\frac{1}{2}$. This is the curve that just touches the x-axis.`,
        r`**पूर्ण वर्ग।** दोनों गुणनखंड एक जैसे हैं, तो केवल एक शून्यक है: $$4s^2 - 4s + 1 = (2s - 1)^2$$ शून्यक $\frac{1}{2}$ है। यही वह वक्र है जो x-अक्ष को बस छूता है।`,
      ),
    ),
    space(),
  ]);
});

/** Ex 2.2 Q1: standard form first. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(r`Find the zeroes of $6x^2 - 3 - 7x$.`, r`$6x^2 - 3 - 7x$ के शून्यक ज्ञात करो।`),
      options: [
        {
          id: "right",
          label: t(r`$\frac{3}{2}$ and $-\frac{1}{3}$`, r`$\frac{3}{2}$ और $-\frac{1}{3}$`),
        },
        {
          id: "sign",
          label: t(r`$-\frac{3}{2}$ and $\frac{1}{3}$`, r`$-\frac{3}{2}$ और $\frac{1}{3}$`),
          feedback: t(
            r`$6x^2 - 7x - 3 = (2x - 3)(3x + 1)$. Set each factor to 0: $2x - 3 = 0$ gives $+\frac{3}{2}$.`,
            r`$6x^2 - 7x - 3 = (2x - 3)(3x + 1)$। हर गुणनखंड को 0 रखो: $2x - 3 = 0$ से $+\frac{3}{2}$।`,
          ),
        },
        {
          id: "divide",
          label: t(r`$3$ and $-1$`, r`$3$ और $-1$`),
          feedback: t(
            r`$6x^2 - 7x - 3 = (2x - 3)(3x + 1)$. Divide by the coefficient of $x$ in each factor: $2x = 3$ gives $\frac{3}{2}$.`,
            r`$6x^2 - 7x - 3 = (2x - 3)(3x + 1)$। हर गुणनखंड में $x$ के गुणांक से भाग दो: $2x = 3$ से $\frac{3}{2}$।`,
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Your turn", "अब तुम्हारी बारी")),
      w.body(
        t(
          r`Write it in standard form first, with powers going down, so you read $a$, $b$ and $c$ correctly.`,
          r`पहले इसे मानक रूप में, घटती घातों में लिखो, ताकि $a$, $b$ और $c$ सही पढ़ सको।`,
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order. */
export const overview = [factors, split, shapes, yourTurn];

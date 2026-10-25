import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/patterns";
import { ValueMachineAction, ValueMachineSignal, valueMachineDef } from "@chalk/prop-polynomials";

const r = String.raw;

/** Are 4, −2 and ½ the zeroes of 2x³ − 5x² − 14x + 8? Put them in; ½ worked through. */
const check = page(
  "check",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "Check claimed zeroes by putting them in: p(4) = p(−2) = p(½) = 0; once ½ is in, its working is written out. A cubic has at most three zeroes, so these are all of them.",
    );
    const machine = b.prop(valueMachineDef, "machine", {
      coefficients: [2, -5, -14, 8],
      step: 0.5,
      min: -4,
      max: 5,
      input: null,
      tried: [],
      window: { xMin: -3, xMax: 5, yMin: -30, yMax: 20 },
    });
    b.standsFor(machine, "the value machine for p(x) = 2x³ − 5x² − 14x + 8, in steps of ½");
    b.studentOnly(machine.action(ValueMachineAction.Put));
    b.studentOnly(machine.action(ValueMachineAction.Move));
    b.witness(machine.learner(ValueMachineAction.Put, { x: 0.5 }));
    const half = w.body(
      t(
        r`$$\begin{aligned} p\left(\tfrac{1}{2}\right) &= 2 \times \tfrac{1}{8} - 5 \times \tfrac{1}{4} - 14 \times \tfrac{1}{2} + 8 \\ &= \tfrac{1}{4} - \tfrac{5}{4} - 7 + 8 \\ &= 0 \end{aligned}$$ 4 and $-2$ give 0 too: all three are zeroes. A cubic has at most three zeroes, so 4, $-2$ and $\frac{1}{2}$ are all of them.`,
        r`$$\begin{aligned} p\left(\tfrac{1}{2}\right) &= 2 \times \tfrac{1}{8} - 5 \times \tfrac{1}{4} - 14 \times \tfrac{1}{2} + 8 \\ &= \tfrac{1}{4} - \tfrac{5}{4} - 7 + 8 \\ &= 0 \end{aligned}$$ 4 और $-2$ से भी 0 मिलता है: तीनों शून्यक हैं। त्रिघात बहुपद के अधिकतम तीन शून्यक होते हैं, तो 4, $-2$ और $\frac{1}{2}$ ही सब हैं।`,
      ),
      "half",
      { isHidden: true },
    );
    b.when(
      machine.on(ValueMachineSignal.FoundZero),
      [theBoard.show(half), theBoard.pass()],
      machine.field("input").eq(0.5),
    );
    return column([
      w.title(t("Checking the zeroes", "शून्यकों की जाँच")),
      w.body(
        t(
          r`Are 4, $-2$ and $\frac{1}{2}$ really the zeroes of $$p(x) = 2x^3 - 5x^2 - 14x + 8$$ A zero gives 0, so put each one into the machine.`,
          r`क्या 4, $-2$ और $\frac{1}{2}$ सच में $$p(x) = 2x^3 - 5x^2 - 14x + 8$$ के शून्यक हैं? शून्यक से 0 मिलता है, तो हर एक को मशीन में डालो।`,
        ),
      ),
      machine,
      half,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/**
 * Three zeroes, three relations: the cubic ax³ + bx² + cx + d written as a(x − α)(x − β)(x − γ),
 * multiplied out, the coefficients compared; then the numbers from the last page as a check.
 */
const relations = page("relations", (b) => {
  const w = wordsOn(b);
  return column([
    w.title(t("Three zeroes, three relations", "तीन शून्यक, तीन संबंध")),
    w.body(
      t(
        r`Take a cubic $$p(x) = ax^3 + bx^2 + cx + d, \quad a \neq 0$$ and call its zeroes $\alpha$, $\beta$ and $\gamma$ (alpha, beta, gamma). Each zero gives a factor, so $$p(x) = a(x - \alpha)(x - \beta)(x - \gamma)$$`,
        r`एक त्रिघात बहुपद लो $$p(x) = ax^3 + bx^2 + cx + d, \quad a \neq 0$$ और इसके शून्यकों को $\alpha$, $\beta$ और $\gamma$ (ऐल्फ़ा, बीटा, गामा) कहो। हर शून्यक से एक गुणनखंड मिलता है, तो $$p(x) = a(x - \alpha)(x - \beta)(x - \gamma)$$`,
      ),
    ),
    w.body(
      t(
        r`Multiply out the brackets. The first two you know from *Zeroes and coefficients*: $$\begin{aligned} &(x - \alpha)(x - \beta)(x - \gamma) \\ &= \big(x^2 - (\alpha + \beta)x + \alpha\beta\big)(x - \gamma) \\ &= x^3 - (\alpha + \beta)x^2 + \alpha\beta\,x \\ &\quad - \gamma x^2 + (\alpha + \beta)\gamma\,x - \alpha\beta\gamma \\ &= x^3 - (\alpha + \beta + \gamma)x^2 \\ &\quad + (\alpha\beta + \beta\gamma + \gamma\alpha)x - \alpha\beta\gamma \end{aligned}$$`,
        r`कोष्ठक खोलो। पहले दो *शून्यक और गुणांक* से पता हैं: $$\begin{aligned} &(x - \alpha)(x - \beta)(x - \gamma) \\ &= \big(x^2 - (\alpha + \beta)x + \alpha\beta\big)(x - \gamma) \\ &= x^3 - (\alpha + \beta)x^2 + \alpha\beta\,x \\ &\quad - \gamma x^2 + (\alpha + \beta)\gamma\,x - \alpha\beta\gamma \\ &= x^3 - (\alpha + \beta + \gamma)x^2 \\ &\quad + (\alpha\beta + \beta\gamma + \gamma\alpha)x - \alpha\beta\gamma \end{aligned}$$`,
      ),
    ),
    w.body(
      t(
        r`Times $a$, this is $ax^3 + bx^2 + cx + d$. Compare the two, term by term: $$\begin{array}{ll} x^2\text{:} & b = -a(\alpha + \beta + \gamma) \\ x\text{:} & c = a(\alpha\beta + \beta\gamma + \gamma\alpha) \\ \text{number:} & d = -a\,\alpha\beta\gamma \end{array}$$ Divide each by $a$:`,
        r`$a$ से गुणा करने पर यह $ax^3 + bx^2 + cx + d$ है। दोनों को पद-पद मिलाओ: $$\begin{array}{ll} x^2\text{:} & b = -a(\alpha + \beta + \gamma) \\ x\text{:} & c = a(\alpha\beta + \beta\gamma + \gamma\alpha) \\ \text{अचर:} & d = -a\,\alpha\beta\gamma \end{array}$$ हर एक को $a$ से भाग दो:`,
      ),
    ),
    w.definition(
      t(
        r`**For a cubic.** If $\alpha$, $\beta$ and $\gamma$ are the zeroes of $ax^3 + bx^2 + cx + d$, then $$\begin{aligned} \alpha + \beta + \gamma &= -\tfrac{b}{a} \\ \alpha\beta + \beta\gamma + \gamma\alpha &= \tfrac{c}{a} \\ \alpha\beta\gamma &= -\tfrac{d}{a} \end{aligned}$$`,
        r`**त्रिघात के लिए।** यदि $\alpha$, $\beta$ और $\gamma$, $ax^3 + bx^2 + cx + d$ के शून्यक हैं, तो $$\begin{aligned} \alpha + \beta + \gamma &= -\tfrac{b}{a} \\ \alpha\beta + \beta\gamma + \gamma\alpha &= \tfrac{c}{a} \\ \alpha\beta\gamma &= -\tfrac{d}{a} \end{aligned}$$`,
      ),
    ),
    w.body(
      t(
        r`Check it on the last page's cubic, $2x^3 - 5x^2 - 14x + 8$, with zeroes $4$, $-2$ and $\tfrac{1}{2}$. Here $a = 2$, $b = -5$, $c = -14$, $d = 8$: $$\begin{aligned} 4 + (-2) + \tfrac{1}{2} &= \tfrac{5}{2} = -\tfrac{-5}{2} \\ 4(-2) + (-2)\tfrac{1}{2} + \tfrac{1}{2}(4) &= -7 = \tfrac{-14}{2} \\ 4 \times (-2) \times \tfrac{1}{2} &= -4 = -\tfrac{8}{2} \end{aligned}$$`,
        r`पिछले पेज के त्रिघात $2x^3 - 5x^2 - 14x + 8$ पर जाँचो, जिसके शून्यक $4$, $-2$ और $\tfrac{1}{2}$ हैं। यहाँ $a = 2$, $b = -5$, $c = -14$, $d = 8$: $$\begin{aligned} 4 + (-2) + \tfrac{1}{2} &= \tfrac{5}{2} = -\tfrac{-5}{2} \\ 4(-2) + (-2)\tfrac{1}{2} + \tfrac{1}{2}(4) &= -7 = \tfrac{-14}{2} \\ 4 \times (-2) \times \tfrac{1}{2} &= -4 = -\tfrac{8}{2} \end{aligned}$$`,
      ),
    ),
    space(),
  ]);
});

/** Ex 2.4 Q2: sum 2, pairs −7, product −14. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "A cubic's zeroes add to 2, their pairs add to −7, and their product is −14. Which cubic is it?",
        "एक त्रिघात बहुपद के शून्यकों का योग 2, जोड़ों का योग −7, और गुणनफल −14 है। कौन-सा त्रिघात बहुपद है?",
      ),
      options: [
        { id: "right", label: t(r`$x^3 - 2x^2 - 7x + 14$`, r`$x^3 - 2x^2 - 7x + 14$`) },
        {
          id: "signs",
          label: t(r`$x^3 + 2x^2 - 7x - 14$`, r`$x^3 + 2x^2 - 7x - 14$`),
          feedback: t(
            r`The $x^2$-coefficient is minus the sum, and the constant term is minus the product.`,
            r`$x^2$ का गुणांक योग का ऋण है, और अचर पद गुणनफल का ऋण है।`,
          ),
        },
        {
          id: "pairs",
          label: t(r`$x^3 - 2x^2 + 7x + 14$`, r`$x^3 - 2x^2 + 7x + 14$`),
          feedback: t(
            r`The pairs sum has no minus sign: $c = -7$.`,
            r`जोड़ों वाले योग में ऋण चिह्न नहीं है: $c = -7$।`,
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
export const overview = [check, relations, yourTurn];

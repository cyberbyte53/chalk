import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import { ValueMachineAction, valueMachineDef } from "@chalk/prop-polynomials";

const r = String.raw;

/** Are 4, −2 and ½ the zeroes of 2x³ − 5x² − 14x + 8? Put them in; ½ worked through. */
const check = page(
  "check",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "Check claimed zeroes by putting them in: p(4) = p(−2) = p(½) = 0, ½ worked through with (½)³ = 1/8. A cubic has at most three zeroes, so these are all of them.",
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
    const cube = choiceQuestion(b, {
      name: "cube",
      prompt: t(
        r`For $\frac{1}{2}$ you need $\left(\frac{1}{2}\right)^3$. What is it?`,
        r`$\frac{1}{2}$ के लिए $\left(\frac{1}{2}\right)^3$ चाहिए। यह क्या है?`,
      ),
      options: [
        { id: "right", label: t(r`$\frac{1}{8}$`, r`$\frac{1}{8}$`) },
        {
          id: "times",
          label: t(r`$\frac{3}{2}$`, r`$\frac{3}{2}$`),
          feedback: t(
            r`Cubing means $\frac{1}{2} \times \frac{1}{2} \times \frac{1}{2}$, not $3 \times \frac{1}{2}$.`,
            r`घन का अर्थ $\frac{1}{2} \times \frac{1}{2} \times \frac{1}{2}$, न कि $3 \times \frac{1}{2}$।`,
          ),
        },
        {
          id: "six",
          label: t(r`$\frac{1}{6}$`, r`$\frac{1}{6}$`),
          feedback: t(
            r`Multiply the bottoms: $2 \times 2 \times 2 = 8$.`,
            r`नीचे वाले गुणा करो: $2 \times 2 \times 2 = 8$।`,
          ),
        },
      ],
      answer: "right",
    });
    const half = w.body(
      t(
        r`$$\begin{aligned} p\left(\tfrac{1}{2}\right) &= 2 \times \tfrac{1}{8} - 5 \times \tfrac{1}{4} - 14 \times \tfrac{1}{2} + 8 \\ &= \tfrac{1}{4} - \tfrac{5}{4} - 7 + 8 \\ &= 0 \end{aligned}$$ All three give 0. A cubic has at most three zeroes, so 4, $-2$ and $\frac{1}{2}$ are all of them.`,
        r`$$\begin{aligned} p\left(\tfrac{1}{2}\right) &= 2 \times \tfrac{1}{8} - 5 \times \tfrac{1}{4} - 14 \times \tfrac{1}{2} + 8 \\ &= \tfrac{1}{4} - \tfrac{5}{4} - 7 + 8 \\ &= 0 \end{aligned}$$ तीनों से 0 मिलता है। त्रिघात बहुपद के अधिकतम तीन शून्यक होते हैं, तो 4, $-2$ और $\frac{1}{2}$ ही सब हैं।`,
      ),
      "half",
      { isHidden: true },
    );
    b.when(cube.on(QuestionSignal.Correct), theBoard.show(half));
    return column([
      w.title(t("Checking the zeroes", "शून्यकों की जाँच")),
      w.body(
        t(
          r`Are 4, $-2$ and $\frac{1}{2}$ really the zeroes of $$p(x) = 2x^3 - 5x^2 - 14x + 8$$ A zero gives 0, so put each one into the machine.`,
          r`क्या 4, $-2$ और $\frac{1}{2}$ सच में $$p(x) = 2x^3 - 5x^2 - 14x + 8$$ के शून्यक हैं? शून्यक से 0 मिलता है, तो हर एक को मशीन में डालो।`,
        ),
      ),
      machine,
      cube,
      half,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Three zeroes, three relations: with the numbers first, then why (one more factor), then the rule. */
const relations = page("relations", (b) => {
  const w = wordsOn(b);
  return column([
    w.title(t("Three zeroes, three relations", "तीन शून्यक, तीन संबंध")),
    w.body(
      t(
        r`With two zeroes we had a sum and a product. With three zeroes there's one more: the **sum of pairs**. Take every pair of zeroes, multiply each pair, and add. Three zeroes make three pairs.`,
        r`दो शून्यकों के साथ एक योग और एक गुणनफल था। तीन शून्यकों के साथ एक और है: **जोड़ों का योग**। शून्यकों का हर जोड़ा लो, हर जोड़े को गुणा करो, और जोड़ दो। तीन शून्यकों से तीन जोड़े बनते हैं।`,
      ),
    ),
    w.body(
      t(
        r`First with the numbers, against $a = 2$, $b = -5$, $c = -14$, $d = 8$: $$\begin{aligned} \text{sum: } & 4 + (-2) + \tfrac{1}{2} = \tfrac{5}{2} = -\tfrac{b}{a} \\ \text{pairs: } & 4(-2) + (-2)\tfrac{1}{2} + \tfrac{1}{2}(4) = -7 = \tfrac{c}{a} \\ \text{product: } & 4 \times (-2) \times \tfrac{1}{2} = -4 = -\tfrac{d}{a} \end{aligned}$$`,
        r`पहले संख्याओं से, $a = 2$, $b = -5$, $c = -14$, $d = 8$ के सामने: $$\begin{aligned} \text{योग: } & 4 + (-2) + \tfrac{1}{2} = \tfrac{5}{2} = -\tfrac{b}{a} \\ \text{जोड़े: } & 4(-2) + (-2)\tfrac{1}{2} + \tfrac{1}{2}(4) = -7 = \tfrac{c}{a} \\ \text{गुणनफल: } & 4 \times (-2) \times \tfrac{1}{2} = -4 = -\tfrac{d}{a} \end{aligned}$$`,
      ),
    ),
    w.body(
      t(
        r`**Why.** From *Zeroes and coefficients*: $$(x - \alpha)(x - \beta) = x^2 - (\alpha + \beta)x + \alpha\beta$$ Call the third zero $\gamma$ (gamma), and multiply by one more factor, $(x - \gamma)$. Multiply the bracket first by $x$, then by $-\gamma$: $$\begin{aligned} &(x - \alpha)(x - \beta)(x - \gamma) \\ &= x\,\big(x^2 - (\alpha+\beta)x + \alpha\beta\big) - \gamma\,\big(x^2 - (\alpha+\beta)x + \alpha\beta\big) \\ &= x^3 - (\alpha+\beta)x^2 + \alpha\beta\,x - \gamma x^2 + (\alpha+\beta)\gamma\,x - \alpha\beta\gamma \end{aligned}$$ Now collect the $x^2$ terms and the $x$ terms: $(\alpha+\beta)\gamma = \beta\gamma + \gamma\alpha$, so $$\begin{aligned} &= x^3 - (\alpha + \beta + \gamma)x^2 \\ &\quad + (\alpha\beta + \beta\gamma + \gamma\alpha)x - \alpha\beta\gamma \end{aligned}$$`,
        r`**क्यों।** *शून्यक और गुणांक* से: $$(x - \alpha)(x - \beta) = x^2 - (\alpha + \beta)x + \alpha\beta$$ तीसरे शून्यक को $\gamma$ (गामा) कहो, और एक और गुणनखंड $(x - \gamma)$ से गुणा करो। कोष्ठक को पहले $x$ से, फिर $-\gamma$ से गुणा करो: $$\begin{aligned} &(x - \alpha)(x - \beta)(x - \gamma) \\ &= x\,\big(x^2 - (\alpha+\beta)x + \alpha\beta\big) - \gamma\,\big(x^2 - (\alpha+\beta)x + \alpha\beta\big) \\ &= x^3 - (\alpha+\beta)x^2 + \alpha\beta\,x - \gamma x^2 + (\alpha+\beta)\gamma\,x - \alpha\beta\gamma \end{aligned}$$ अब $x^2$ वाले और $x$ वाले पद इकट्ठे करो: $(\alpha+\beta)\gamma = \beta\gamma + \gamma\alpha$, तो $$\begin{aligned} &= x^3 - (\alpha + \beta + \gamma)x^2 \\ &\quad + (\alpha\beta + \beta\gamma + \gamma\alpha)x - \alpha\beta\gamma \end{aligned}$$`,
      ),
    ),
    w.definition(
      t(
        r`**For a cubic.** If $\alpha$, $\beta$ and $\gamma$ are the zeroes of $ax^3 + bx^2 + cx + d$, then $$\begin{aligned} \alpha + \beta + \gamma &= -\tfrac{b}{a} \\ \alpha\beta + \beta\gamma + \gamma\alpha &= \tfrac{c}{a} \\ \alpha\beta\gamma &= -\tfrac{d}{a} \end{aligned}$$`,
        r`**त्रिघात के लिए।** यदि $\alpha$, $\beta$ और $\gamma$, $ax^3 + bx^2 + cx + d$ के शून्यक हैं, तो $$\begin{aligned} \alpha + \beta + \gamma &= -\tfrac{b}{a} \\ \alpha\beta + \beta\gamma + \gamma\alpha &= \tfrac{c}{a} \\ \alpha\beta\gamma &= -\tfrac{d}{a} \end{aligned}$$`,
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

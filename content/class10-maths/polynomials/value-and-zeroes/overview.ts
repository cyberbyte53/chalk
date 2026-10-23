import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import { ValueMachineAction, ValueMachineSignal, valueMachineDef } from "@chalk/prop-polynomials";

const r = String.raw;

/** The ball's height as a hook, then the value machine on NCERT's x² − 3x − 4: p(2), p(−1). */
const value = page(
  "value",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "Define the value p(k) first: put k in place of x everywhere. The ball h(t) = 20t − 5t² is the reason to care (its height at 1 s, when it lands); the machine then takes any number, negatives too, with the substitution written out. p(2) = −6; p(−1) = 0 with the sign traps (−1)² = +1 and −3 × (−1) = +3.",
    );
    const ball = choiceQuestion(b, {
      name: "ball",
      prompt: t("How high is it after 1 second?", "1 सेकंड बाद यह कितनी ऊँची है?"),
      options: [
        { id: "right", label: t("15 m", "15 m") },
        {
          id: "added",
          label: t("25 m", "25 m"),
          feedback: t(r`$5t^2$ is taken away, not added.`, r`$5t^2$ घटाया जाता है, जोड़ा नहीं।`),
        },
        {
          id: "forgot",
          label: t("20 m", "20 m"),
          feedback: t(
            r`Don't forget the $5t^2$ term: at $t = 1$ it is 5.`,
            r`$5t^2$ वाला पद मत भूलो: $t = 1$ पर यह 5 है।`,
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const land = w.body(
      t(
        r`We put 1 in place of $t$: $$h(1) = 20 \times 1 - 5 \times 1^2 = 15$$ And when does it land? When its height is 0. Try $t = 4$: $$h(4) = 80 - 80 = 0$$ The ball is only in the air from $t = 0$ to $t = 4$. But the polynomial itself works for any number, negatives too. Here's a machine to try anything on.`,
        r`हमने $t$ की जगह 1 रखा: $$h(1) = 20 \times 1 - 5 \times 1^2 = 15$$ और यह ज़मीन पर कब आती है? जब इसकी ऊँचाई 0 हो। $t = 4$ आज़माओ: $$h(4) = 80 - 80 = 0$$ गेंद केवल $t = 0$ से $t = 4$ तक हवा में है। पर बहुपद ख़ुद किसी भी संख्या के लिए चलता है, ऋणात्मक के लिए भी। यह रही एक मशीन, कुछ भी आज़माने के लिए।`,
      ),
      "land",
      { isHidden: true },
    );
    const machine = b.prop(
      valueMachineDef,
      "machine",
      { coefficients: [1, -3, -4], input: null, tried: [] },
      { isHidden: true },
    );
    b.standsFor(machine, "the value machine for p(x) = x² − 3x − 4");
    b.studentOnly(machine.action(ValueMachineAction.Put));
    const putIn = w.body(
      t(
        r`It takes any number $x$ and gives back $p(x) = x^2 - 3x - 4$. Put in 2. What comes out?`,
        r`यह कोई भी संख्या $x$ लेकर $p(x) = x^2 - 3x - 4$ लौटाती है। 2 डालो। क्या निकलता है?`,
      ),
      "putIn",
      { isHidden: true },
    );
    const two = choiceQuestion(b, {
      name: "two",
      prompt: t(r`$p(2) = $`, r`$p(2) = $`),
      options: [
        { id: "right", label: t(r`$-6$`, r`$-6$`) },
        {
          id: "six",
          label: t(r`$6$`, r`$6$`),
          feedback: t(
            r`$4 - 6 = -2$, and taking away 4 more makes $-6$.`,
            r`$4 - 6 = -2$, और 4 और घटाने पर $-6$।`,
          ),
        },
        {
          id: "two",
          label: t(r`$2$`, r`$2$`),
          feedback: t(r`Square 2 first: $2^2 = 4$.`, r`पहले 2 का वर्ग करो: $2^2 = 4$।`),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const valueIs = w.body(
      t(r`$$p(2) = 2^2 - 3 \times 2 - 4 = -6$$`, r`$$p(2) = 2^2 - 3 \times 2 - 4 = -6$$`),
      "valueIs",
      { isHidden: true },
    );
    const minusOne = choiceQuestion(b, {
      name: "minusOne",
      prompt: t(r`Now put in $-1$. What is $p(-1)$?`, r`अब $-1$ डालो। $p(-1)$ क्या है?`),
      options: [
        { id: "right", label: t(r`$0$`, r`$0$`) },
        {
          id: "square",
          label: t(r`$-2$`, r`$-2$`),
          feedback: t(
            r`$(-1)^2 = +1$, not $-1$: a negative times a negative is positive.`,
            r`$(-1)^2 = +1$, $-1$ नहीं: ऋणात्मक गुणा ऋणात्मक धनात्मक होता है।`,
          ),
        },
        {
          id: "times",
          label: t(r`$-6$`, r`$-6$`),
          feedback: t(r`$-3 \times (-1) = +3$.`, r`$-3 \times (-1) = +3$।`),
        },
      ],
      answer: "right",
      isHidden: true,
    });
    const working = w.body(
      t(
        r`$$\begin{aligned} p(-1) &= (-1)^2 - 3 \times (-1) - 4 \\ &= 1 + 3 - 4 = 0 \end{aligned}$$`,
        r`$$\begin{aligned} p(-1) &= (-1)^2 - 3 \times (-1) - 4 \\ &= 1 + 3 - 4 = 0 \end{aligned}$$`,
      ),
      "working",
      { isHidden: true },
    );
    b.when(ball.on(QuestionSignal.Correct), [
      theBoard.show(land),
      theBoard.show(machine),
      theBoard.show(putIn),
      theBoard.show(two),
    ]);
    b.when(two.on(QuestionSignal.Correct), [theBoard.show(valueIs), theBoard.show(minusOne)]);
    b.when(minusOne.on(QuestionSignal.Correct), theBoard.show(working));
    return column([
      w.title(t("The value of a polynomial", "बहुपद का मान")),
      w.definition(
        t(
          r`**Value of a polynomial.** We often give a polynomial a name, like $p(x)$. The **value** of $p(x)$ at a number $k$ is what you get when you put $k$ in place of $x$ everywhere. It is written $p(k)$.`,
          r`**बहुपद का मान।** हम अक्सर बहुपद को एक नाम देते हैं, जैसे $p(x)$। किसी संख्या $k$ पर $p(x)$ का **मान** वह है जो $x$ की जगह हर जगह $k$ रखने पर मिलता है। इसे $p(k)$ लिखते हैं।`,
        ),
      ),
      w.body(
        t(
          r`Riya throws a ball straight up. After $t$ seconds, its height in metres is $$h(t) = 20t - 5t^2$$ Its height after 1 second is the value of $h(t)$ at 1, written $h(1)$.`,
          r`रिया एक गेंद सीधी ऊपर फेंकती है। $t$ सेकंड बाद उसकी ऊँचाई, मीटर में, है $$h(t) = 20t - 5t^2$$ 1 सेकंड बाद उसकी ऊँचाई 1 पर $h(t)$ का मान है, जिसे $h(1)$ लिखते हैं।`,
        ),
      ),
      ball,
      land,
      machine,
      putIn,
      two,
      valueIs,
      minusOne,
      working,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Find the other zero with the machine; the definition; p(0) is not "a zero". */
const zeroes = page(
  "zeroes",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "A zero is an input that gives 0. The learner hunts for the second zero of x² − 3x − 4 (4) with the machine, each try leaving a dot. Then the trap: p(0) = −4 is the value at 0, not a zero.",
    );
    const machine = b.prop(valueMachineDef, "machine", {
      coefficients: [1, -3, -4],
      input: -1,
      tried: [-1],
    });
    b.standsFor(machine, "the value machine for p(x) = x² − 3x − 4, with −1 already put in");
    b.studentOnly(machine.action(ValueMachineAction.Put));
    b.witness(machine.learner(ValueMachineAction.Put, { x: 4 }));
    const found = w.body(
      t(
        r`$$p(4) = 16 - 12 - 4 = 0$$ So $-1$ and $4$ are both zeroes of $x^2 - 3x - 4$.`,
        r`$$p(4) = 16 - 12 - 4 = 0$$ तो $-1$ और $4$ दोनों $x^2 - 3x - 4$ के शून्यक हैं।`,
      ),
      "found",
      { isHidden: true },
    );
    const careful = w.body(
      t(
        r`Careful: $p(0)$ and "a zero" are different things. $$p(0) = -4$$ That is just the value at 0. The zeroes are the inputs that give 0.`,
        r`सावधान: $p(0)$ और "एक शून्यक" अलग चीज़ें हैं। $$p(0) = -4$$ यह बस 0 पर मान है। शून्यक वे संख्याएँ हैं जिन्हें डालने पर 0 मिलता है।`,
      ),
      "careful",
      { isHidden: true },
    );
    const isZero = choiceQuestion(b, {
      name: "isZero",
      prompt: t(r`Is 0 a zero of $x^2 - 3x - 4$?`, r`क्या 0, $x^2 - 3x - 4$ का शून्यक है?`),
      options: [
        { id: "right", label: t("No", "नहीं") },
        {
          id: "yes",
          label: t("Yes", "हाँ"),
          feedback: t(r`$p(0) = -4$, not 0.`, r`$p(0) = -4$, 0 नहीं।`),
        },
      ],
      answer: "right",
      isHidden: true,
    });
    const next = w.note(
      t(
        "Look at your dots: the zeroes are the ones sitting on the x-axis. That's next.",
        "अपने बिंदु देखो: शून्यक वे हैं जो x-अक्ष पर बैठे हैं। यही आगे है।",
      ),
      "next",
      { isHidden: true },
    );
    b.when(
      machine.on(ValueMachineSignal.FoundZero),
      [theBoard.show(found), theBoard.show(careful), theBoard.show(isZero)],
      machine.field("input").eq(4),
    );
    b.when(isZero.on(QuestionSignal.Correct), theBoard.show(next));
    return column([
      w.title(t("Zeroes", "शून्यक")),
      w.definition(
        t(
          r`**Zero of a polynomial.** A number $k$ is a **zero** of $p(x)$ if $p(k) = 0$.`,
          r`**बहुपद का शून्यक।** कोई संख्या $k$, $p(x)$ का **शून्यक** है यदि $p(k) = 0$।`,
        ),
      ),
      w.body(
        t(
          r`$p(-1)$ came out as 0, so $-1$ is a zero of $x^2 - 3x - 4$. **Find another zero.** Try any numbers you like: every try leaves a dot.`,
          r`$p(-1)$ का मान 0 आया, तो $-1$, $x^2 - 3x - 4$ का एक शून्यक है। **एक और शून्यक खोजो।** जो चाहो आज़माओ: हर कोशिश एक बिंदु छोड़ती है।`,
        ),
      ),
      machine,
      found,
      careful,
      isZero,
      next,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The zero of 2x + 3, then of ax + b with the same steps: −b/a, which needs a ≠ 0. */
const linear = page(
  "linear",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(r`What is the zero of $3x - 6$?`, r`$3x - 6$ का शून्यक क्या है?`),
      options: [
        { id: "right", label: t("2", "2") },
        {
          id: "sign",
          label: t(r`$-2$`, r`$-2$`),
          feedback: t(
            r`Here $b = -6$, so $-\frac{b}{a} = \frac{6}{3} = 2$.`,
            r`यहाँ $b = -6$, तो $-\frac{b}{a} = \frac{6}{3} = 2$।`,
          ),
        },
        {
          id: "six",
          label: t("6", "6"),
          feedback: t(
            r`Divide by $a$ as well: $6 \div 3 = 2$.`,
            r`$a$ से भी भाग दो: $6 \div 3 = 2$।`,
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("The zero of a linear polynomial", "रैखिक बहुपद का शून्यक")),
      w.body(
        t(
          r`Find the zero of $2x + 3$: the $k$ that makes its value 0. $$\begin{aligned} 2k + 3 &= 0 \\ k &= -\tfrac{3}{2} \end{aligned}$$`,
          r`$2x + 3$ का शून्यक ज्ञात करो: वह $k$ जिससे इसका मान 0 हो। $$\begin{aligned} 2k + 3 &= 0 \\ k &= -\tfrac{3}{2} \end{aligned}$$`,
        ),
      ),
      w.body(
        t(
          r`Any linear polynomial $ax + b$, with the same steps: $$\begin{aligned} ak + b &= 0 \\ k &= -\tfrac{b}{a} \end{aligned}$$ To get there we divided by $a$. That works because $a \ne 0$: the same $a \ne 0$ that makes it linear.`,
          r`कोई भी रैखिक बहुपद $ax + b$, उन्हीं क़दमों से: $$\begin{aligned} ak + b &= 0 \\ k &= -\tfrac{b}{a} \end{aligned}$$ यहाँ तक पहुँचने के लिए हमने $a$ से भाग दिया। यह इसलिए चलता है क्योंकि $a \ne 0$: वही $a \ne 0$ जो इसे रैखिक बनाता है।`,
        ),
      ),
      w.definition(
        t(
          r`**The zero of $ax + b$ is $-\frac{b}{a}$.**`,
          r`**$ax + b$ का शून्यक $-\frac{b}{a}$ है।**`,
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order. */
export const overview = [value, zeroes, linear];

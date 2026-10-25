import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, multiChoiceQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";

const r = String.raw;

/** The definition first (terms, variable, coefficients, constant term, standard form), then NCERT 2.1's list to sort with it. */
const sort = page(
  "sort",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "Define a polynomial and its parts (term, variable, coefficient, constant term, standard form) on 2x² − 3x + 4, then sort NCERT's own expressions with it: 1/(x − 1) is a power −1 and √x a power ½, so they are not; √2 as a coefficient is fine, and 5 is 5x⁰.",
    );
    const which = multiChoiceQuestion(b, {
      name: "which",
      prompt: t("Tap every polynomial.", "हर बहुपद पर टैप करो।"),
      options: [
        { id: "linear", label: t(r`$4x + 2$`, r`$4x + 2$`) },
        { id: "quad", label: t(r`$2y^2 - 3y + 4$`, r`$2y^2 - 3y + 4$`) },
        {
          id: "recip",
          label: t(r`$\frac{1}{x - 1}$`, r`$\frac{1}{x - 1}$`),
          feedback: t(
            r`$\frac{1}{x - 1}$ is $(x - 1)$ to the power $-1$. A power in a polynomial can't be negative.`,
            r`$\frac{1}{x - 1}$, $(x - 1)$ की घात $-1$ है। बहुपद में घात ऋणात्मक नहीं हो सकती।`,
          ),
        },
        { id: "cubic", label: t(r`$5x^3 - 4x^2 + x - \sqrt{2}$`, r`$5x^3 - 4x^2 + x - \sqrt{2}$`) },
        {
          id: "root",
          label: t(r`$\sqrt{x} + 2$`, r`$\sqrt{x} + 2$`),
          feedback: t(
            r`$\sqrt{x}$ is $x$ to the power $\frac{1}{2}$. A power in a polynomial can't be a fraction.`,
            r`$\sqrt{x}$, $x$ की घात $\frac{1}{2}$ है। बहुपद में घात भिन्न नहीं हो सकती।`,
          ),
        },
        {
          id: "six",
          label: t(
            r`$7u^6 - \frac{3}{2}u^4 + 4u^2 + u - 8$`,
            r`$7u^6 - \frac{3}{2}u^4 + 4u^2 + u - 8$`,
          ),
        },
        { id: "five", label: t(r`$5$`, r`$5$`) },
      ],
      answers: ["linear", "quad", "cubic", "six", "five"],
      missing: t(
        r`Those are polynomials, but there are more. $\sqrt{2}$ is just a number on its own, like 4 or $-8$. And 5 is $5x^0$.`,
        r`ये बहुपद हैं, पर और भी हैं। $\sqrt{2}$ बस एक संख्या है, जैसे 4 या $-8$। और 5, $5x^0$ है।`,
      ),
      passes: false,
    });
    const powers = w.body(
      t(
        r`Here are the two that aren't, with their powers written out: $$\begin{aligned} \sqrt{x} + 2 &= x^{\frac{1}{2}} + 2x^0 \\ \tfrac{1}{x - 1} &= (x - 1)^{-1} \end{aligned}$$ One power is a fraction and one is negative, so neither is a polynomial.`,
        r`यह रहे वे दो जो बहुपद नहीं हैं, घातें लिखकर: $$\begin{aligned} \sqrt{x} + 2 &= x^{\frac{1}{2}} + 2x^0 \\ \tfrac{1}{x - 1} &= (x - 1)^{-1} \end{aligned}$$ एक घात भिन्न है और एक ऋणात्मक, इसलिए दोनों में से कोई भी बहुपद नहीं है।`,
      ),
      "powers",
      { isHidden: true },
    );
    b.when(which.on(QuestionSignal.Correct), [theBoard.show(powers), theBoard.pass()]);
    return column([
      w.title(t("Polynomials", "बहुपद")),
      w.definition(
        t(
          r`**Polynomial.** A polynomial in $x$ is a sum of **terms**. Each term is a number times a power of $x$, and every power is a whole number: 0, 1, 2, … The letter $x$ is the **variable**. It can be any letter, like $y$ or $u$. The number in front of a term is its **coefficient**. It can be any real number, like $-3$, $\frac{1}{2}$ or $\sqrt{2}$.`,
          r`**बहुपद।** $x$ में बहुपद **पदों** का योग है। हर पद एक संख्या गुणा $x$ की कोई घात है, और हर घात एक पूर्ण संख्या है: 0, 1, 2, … अक्षर $x$ **चर** है। यह कोई भी अक्षर हो सकता है, जैसे $y$ या $u$। किसी पद के आगे की संख्या उसका **गुणांक** है। यह कोई भी वास्तविक संख्या हो सकती है, जैसे $-3$, $\frac{1}{2}$ या $\sqrt{2}$।`,
        ),
      ),
      w.body(
        t(
          r`Take $2x^2 - 3x + 4$. Its terms are $2x^2$, $-3x$ and $4$, and their coefficients are 2, $-3$ and 4. The term 4 has no $x$ written, but it is $4x^0$, because $x^0 = 1$. Written with every power: $$2x^2 - 3x + 4 = 2x^2 - 3x^1 + 4x^0$$ A term with no $x$, like 4, is the **constant term**. Written like this, with the powers going down, the polynomial is in **standard form**.`,
          r`$2x^2 - 3x + 4$ लो। इसके पद $2x^2$, $-3x$ और $4$ हैं, और उनके गुणांक 2, $-3$ और 4 हैं। पद 4 में $x$ लिखा नहीं है, पर यह $4x^0$ है, क्योंकि $x^0 = 1$। हर घात लिखकर: $$2x^2 - 3x + 4 = 2x^2 - 3x^1 + 4x^0$$ बिना $x$ वाला पद, जैसे 4, **अचर पद** है। इस तरह घटती घातों में लिखा बहुपद **मानक रूप** में है।`,
        ),
      ),
      w.body(
        t(
          "Some of these expressions are polynomials and some are not. Check every power.",
          "इनमें से कुछ व्यंजक बहुपद हैं और कुछ नहीं। हर घात जाँचो।",
        ),
      ),
      which,
      powers,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Degree: the highest power, wherever it is written; a number alone has degree 0. */
const degree = page(
  "degree",
  (b) => {
    const w = wordsOn(b);
    const written = choiceQuestion(b, {
      name: "written",
      prompt: t(r`What is the degree of $6x - 3 + 2x^2$?`, r`$6x - 3 + 2x^2$ की घात क्या है?`),
      options: [
        { id: "right", label: t("2", "2") },
        {
          id: "one",
          label: t("1", "1"),
          feedback: t(
            r`The highest power is 2, in $2x^2$, even though that term is written last.`,
            r`सबसे बड़ी घात 2 है, $2x^2$ में, भले ही वह पद आख़िर में लिखा है।`,
          ),
        },
        {
          id: "three",
          label: t("3", "3"),
          feedback: t(
            "The degree is the highest power, not how many terms there are.",
            "घात सबसे बड़ी घात है, पदों की गिनती नहीं।",
          ),
        },
      ],
      answer: "right",
    });
    const five = choiceQuestion(b, {
      name: "five",
      prompt: t(r`What is the degree of $5$?`, r`$5$ की घात क्या है?`),
      options: [
        { id: "right", label: t("0", "0") },
        {
          id: "one",
          label: t("1", "1"),
          feedback: t(
            r`There is no $x$ in it: $5 = 5x^0$, so the power is 0.`,
            r`इसमें $x$ नहीं है: $5 = 5x^0$, इसलिए घात 0 है।`,
          ),
        },
        {
          id: "five",
          label: t("5", "5"),
          feedback: t(
            r`5 is the coefficient, not the power: $5 = 5x^0$.`,
            r`5 गुणांक है, घात नहीं: $5 = 5x^0$।`,
          ),
        },
      ],
      answer: "right",
      isHidden: true,
    });
    b.when(written.on(QuestionSignal.Correct), theBoard.show(five));
    return column([
      w.title(t("Degree", "घात")),
      w.body(
        t(
          r`The **degree** of a polynomial is the highest power of its variable. $$\begin{aligned} 4x + 2 &\quad \text{degree } 1 \\ 2y^2 - 3y + 4 &\quad \text{degree } 2 \\ 5x^3 - 4x^2 + x - \sqrt{2} &\quad \text{degree } 3 \\ 7u^6 - \tfrac{3}{2}u^4 + 4u^2 + u - 8 &\quad \text{degree } 6 \end{aligned}$$`,
          r`बहुपद की **घात** उसके चर की सबसे बड़ी घात है। $$\begin{aligned} 4x + 2 &\quad \text{घात } 1 \\ 2y^2 - 3y + 4 &\quad \text{घात } 2 \\ 5x^3 - 4x^2 + x - \sqrt{2} &\quad \text{घात } 3 \\ 7u^6 - \tfrac{3}{2}u^4 + 4u^2 + u - 8 &\quad \text{घात } 6 \end{aligned}$$`,
        ),
      ),
      written,
      five,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Linear, quadratic, cubic; the general forms, and why a can't be 0. */
const names = page(
  "names",
  (b) => {
    const w = wordsOn(b);
    const zero = choiceQuestion(b, {
      name: "zero",
      prompt: t(
        r`Why $a \ne 0$? What if $a = 0$ in $ax^2 + bx + c$?`,
        r`$a \ne 0$ क्यों? अगर $ax^2 + bx + c$ में $a = 0$ हो तो?`,
      ),
      options: [
        {
          id: "right",
          label: t(r`It becomes $bx + c$, which is linear`, r`यह $bx + c$ बन जाता है, जो रैखिक है`),
        },
        {
          id: "still",
          label: t("It's still quadratic", "यह फिर भी द्विघात है"),
          feedback: t(
            r`With $a = 0$ there's no $x^2$ term left, so the highest power is 1.`,
            r`$a = 0$ होने पर $x^2$ वाला पद नहीं बचता, इसलिए सबसे बड़ी घात 1 है।`,
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const why = w.body(
      t(
        r`So $a$ can't be 0: it's what makes the polynomial quadratic. But $b$ and $c$ can be 0. $x^2$ and $x^2 - 4$ are quadratics too.`,
        r`इसलिए $a$ शून्य नहीं हो सकता: यही बहुपद को द्विघात बनाता है। पर $b$ और $c$ शून्य हो सकते हैं। $x^2$ और $x^2 - 4$ भी द्विघात हैं।`,
      ),
      "why",
      { isHidden: true },
    );
    const forms = w.definition(
      t(
        r`**General forms.** Every linear, quadratic and cubic polynomial can be written like this, where the letters are real numbers and $a \ne 0$: $$\begin{aligned} \text{linear:} &\quad ax + b \\ \text{quadratic:} &\quad ax^2 + bx + c \\ \text{cubic:} &\quad ax^3 + bx^2 + cx + d \end{aligned}$$`,
        r`**व्यापक रूप।** हर रैखिक, द्विघात और त्रिघात बहुपद को ऐसे लिख सकते हैं, जहाँ अक्षर वास्तविक संख्याएँ हैं और $a \ne 0$: $$\begin{aligned} \text{रैखिक:} &\quad ax + b \\ \text{द्विघात:} &\quad ax^2 + bx + c \\ \text{त्रिघात:} &\quad ax^3 + bx^2 + cx + d \end{aligned}$$`,
      ),
      "forms",
    );
    const which = multiChoiceQuestion(b, {
      name: "which",
      prompt: t("Which of these are quadratic?", "इनमें से कौन-से द्विघात हैं?"),
      options: [
        { id: "square", label: t(r`$x^2$`, r`$x^2$`) },
        { id: "diff", label: t(r`$x^2 - 4$`, r`$x^2 - 4$`) },
        {
          id: "line",
          label: t(r`$3x + 1$`, r`$3x + 1$`),
          feedback: t("Degree 1: linear.", "घात 1: रैखिक।"),
        },
        {
          id: "cube",
          label: t(r`$2x^3 + x^2$`, r`$2x^3 + x^2$`),
          feedback: t(r`The highest power is 3: cubic.`, r`सबसे बड़ी घात 3 है: त्रिघात।`),
        },
        { id: "back", label: t(r`$5 - x^2$`, r`$5 - x^2$`) },
      ],
      answers: ["square", "diff", "back"],
      missing: t(
        r`Those are quadratic, but there are more. Look for every one whose highest power is 2, wherever it is written.`,
        r`ये द्विघात हैं, पर और भी हैं। हर वह देखो जिसकी सबसे बड़ी घात 2 हो, चाहे वह कहीं भी लिखा हो।`,
      ),
      isHidden: true,
    });
    b.when(zero.on(QuestionSignal.Correct), [theBoard.show(why), theBoard.show(which)]);
    return column([
      w.title(t("Linear, quadratic, cubic", "रैखिक, द्विघात, त्रिघात")),
      w.body(
        t(
          r`Polynomials of degree 1, 2 and 3 have names: $$\begin{array}{cll} \text{degree} & \text{name} & \text{for example} \\ \hline 1 & \textbf{linear} & 2x - 3, \; \sqrt{3}\,x + 5 \\ 2 & \textbf{quadratic} & 2x^2 + 3x - \tfrac{2}{5}, \; y^2 \\ 3 & \textbf{cubic} & 4x^3, \; 2 - x + x^3 \end{array}$$`,
          r`घात 1, 2 और 3 वाले बहुपदों के नाम हैं: $$\begin{array}{cll} \text{घात} & \text{नाम} & \text{उदाहरण} \\ \hline 1 & \textbf{रैखिक} & 2x - 3, \; \sqrt{3}\,x + 5 \\ 2 & \textbf{द्विघात} & 2x^2 + 3x - \tfrac{2}{5}, \; y^2 \\ 3 & \textbf{त्रिघात} & 4x^3, \; 2 - x + x^3 \end{array}$$`,
        ),
      ),
      forms,
      zero,
      why,
      which,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order. */
export const overview = [sort, degree, names];

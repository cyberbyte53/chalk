import { PassOn, column, page, space, t } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/content-source/patterns";

const r = String.raw;

/** NCERT Example 10 style: 5 − √3 is irrational, by isolating √3. */
const isolate = page("isolate", (b) => {
  const w = wordsOn(b);
  return column([
    w.title(t(r`Prove $5 - \sqrt{3}$ is irrational`, r`सिद्ध करो कि $5 - \sqrt{3}$ अपरिमेय है`)),
    w.body(
      t(
        r`Suppose it is rational: $5 - \sqrt{3} = \frac{a}{b}$, with $a$, $b$ integers and $b \ne 0$. Move everything except $\sqrt{3}$ to the other side: $$\sqrt{3} = 5 - \frac{a}{b} = \frac{5b - a}{b}.$$`,
        r`मान लो यह परिमेय है: $5 - \sqrt{3} = \frac{a}{b}$, जहाँ $a$, $b$ पूर्णांक हैं और $b \ne 0$। $\sqrt{3}$ के अलावा सब कुछ दूसरी तरफ़ ले जाओ: $$\sqrt{3} = 5 - \frac{a}{b} = \frac{5b - a}{b}.$$`,
      ),
    ),
    w.body(
      t(
        r`$5b - a$ and $b$ are integers, so the right side is rational, and then so is $\sqrt{3}$. But $\sqrt{3}$ is irrational. The contradiction shows the assumption was wrong: $5 - \sqrt{3}$ **is irrational.**`,
        r`$5b - a$ और $b$ पूर्णांक हैं, इसलिए दायाँ पक्ष परिमेय है, और तब $\sqrt{3}$ भी। पर $\sqrt{3}$ अपरिमेय है। यह विरोधाभास दिखाता है कि मान्यता ग़लत थी: $5 - \sqrt{3}$ **अपरिमेय है।**`,
      ),
    ),
    w.note(
      t(
        r`The move every time: assume it is rational, get the root alone, and the root would have to be rational.`,
        r`हर बार यही चाल: मान लो यह परिमेय है, मूल को अकेला करो, तो मूल को भी परिमेय होना पड़ेगा।`,
      ),
    ),
    space(),
  ]);
});

/** NCERT Ex 1.3 Q2: 3√2 and 1/√2; the general rule. */
const more = page("more", (b) => {
  const w = wordsOn(b);
  return column([
    w.title(t("Products and quotients too", "गुणनफल और भागफल भी")),
    w.body(
      t(
        r`$3\sqrt{2}$: If $3\sqrt{2} = \frac{a}{b}$, then $\sqrt{2} = \frac{a}{3b}$, rational: impossible. So $3\sqrt{2}$ is irrational.`,
        r`$3\sqrt{2}$: यदि $3\sqrt{2} = \frac{a}{b}$, तो $\sqrt{2} = \frac{a}{3b}$, परिमेय: असंभव। इसलिए $3\sqrt{2}$ अपरिमेय है।`,
      ),
    ),
    w.body(
      t(
        r`$\frac{1}{\sqrt{2}}$: If $\frac{1}{\sqrt{2}} = \frac{a}{b}$ (then $a \ne 0$), then $\sqrt{2} = \frac{b}{a}$, rational: impossible. So $\frac{1}{\sqrt{2}}$ is irrational.`,
        r`$\frac{1}{\sqrt{2}}$: यदि $\frac{1}{\sqrt{2}} = \frac{a}{b}$ (तो $a \ne 0$), तो $\sqrt{2} = \frac{b}{a}$, परिमेय: असंभव। इसलिए $\frac{1}{\sqrt{2}}$ अपरिमेय है।`,
      ),
    ),
    w.definition(
      t(
        r`The sum or difference of a rational and an irrational number is irrational. The product and quotient of a **non-zero** rational and an irrational number are irrational.`,
        r`एक परिमेय और एक अपरिमेय संख्या का योग या अंतर अपरिमेय होता है। एक **शून्येतर** परिमेय और एक अपरिमेय संख्या का गुणनफल और भागफल अपरिमेय होते हैं।`,
      ),
    ),
    w.note(
      t(
        r`Why non-zero: $0 \times \sqrt{2} = 0$ is rational.`,
        r`शून्येतर क्यों: $0 \times \sqrt{2} = 0$ परिमेय है।`,
      ),
    ),
    space(),
  ]);
});

/** Your turn: isolate √5 in 3 + 2√5 = r. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      prompt: t(
        r`To prove $3 + 2\sqrt{5}$ irrational, suppose $3 + 2\sqrt{5} = x$, a rational number. What is $\sqrt{5}$?`,
        r`$3 + 2\sqrt{5}$ को अपरिमेय सिद्ध करने के लिए मान लो $3 + 2\sqrt{5} = x$, एक परिमेय संख्या। $\sqrt{5}$ क्या है?`,
      ),
      options: [
        { id: "right", label: t(r`$\frac{x - 3}{2}$`, r`$\frac{x - 3}{2}$`) },
        {
          id: "flip",
          label: t(r`$\frac{3 - x}{2}$`, r`$\frac{3 - x}{2}$`),
          feedback: t(
            r`Check the sign: $2\sqrt{5} = x - 3$, since we take 3 away from both sides.`,
            r`चिह्न जाँचो: $2\sqrt{5} = x - 3$, क्योंकि दोनों तरफ़ से 3 घटाते हैं।`,
          ),
        },
        {
          id: "half",
          label: t(r`$\frac{x}{2} - 3$`, r`$\frac{x}{2} - 3$`),
          feedback: t(
            r`Take away the 3 first, then halve: $2\sqrt{5} = x - 3$, so $\sqrt{5} = \frac{x - 3}{2}$.`,
            r`पहले 3 घटाओ, फिर आधा करो: $2\sqrt{5} = x - 3$, इसलिए $\sqrt{5} = \frac{x - 3}{2}$।`,
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Your turn", "अब तुम")),
      ask,
      w.note(
        t(
          r`Then $\frac{x - 3}{2}$ is rational, so $\sqrt{5}$ would be rational: a contradiction.`,
          r`तब $\frac{x - 3}{2}$ परिमेय है, इसलिए $\sqrt{5}$ परिमेय होता: विरोधाभास।`,
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order. */
export const overview = [isolate, more, yourTurn];

import { PassOn, column, page, space, t } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/patterns";
import { BagShow, bagCompareDef } from "@chalk/prop-primes";

const r = String.raw;

/** For two numbers, HCF and LCM together hold exactly a's and b's beads. */
const together = page("together", (b) => {
  const w = wordsOn(b);
  return column([
    w.title(t("HCF and LCM share out the beads", "HCF और LCM मनके बाँट लेते हैं")),
    w.body(
      t(
        r`In each row, the HCF takes the smaller count and the LCM the larger. With two numbers, the smaller and the larger **are** the two counts. So between them, HCF and LCM hold exactly the beads of $a$ and $b$. Tap HCF × LCM.`,
        r`हर पंक्ति में HCF छोटी गिनती लेता है और LCM बड़ी। दो संख्याओं में छोटी और बड़ी गिनती **ही** दोनों संख्याओं की गिनतियाँ हैं। इसलिए HCF और LCM मिलकर ठीक $a$ और $b$ के ही मनके रखते हैं। HCF × LCM दबाओ।`,
      ),
    ),
    b.prop(bagCompareDef, "compare", { numbers: [26, 91], show: BagShow.Apart }),
    w.definition(
      t(
        r`For any two positive integers $a$ and $b$: $$\text{HCF}(a, b) \times \text{LCM}(a, b) = a \times b.$$`,
        r`किन्हीं दो धनात्मक पूर्णांकों $a$ और $b$ के लिए: $$\text{HCF}(a, b) \times \text{LCM}(a, b) = a \times b.$$`,
      ),
    ),
    w.note(
      t(
        r`Check: $13 \times 182 = 2366 = 26 \times 91$.`,
        r`जाँचो: $13 \times 182 = 2366 = 26 \times 91$।`,
      ),
    ),
    space(),
  ]);
});

/** NCERT Ex 1.2 Q4: LCM from the HCF; and the three-number warning. */
const use = page("use", (b) => {
  const w = wordsOn(b);
  return column([
    w.title(t("Using it", "इसका प्रयोग")),
    w.body(
      t(
        r`Given $\text{HCF}(306, 657) = 9$, find the LCM: $$\begin{aligned} \text{LCM}(306, 657) &= \frac{306 \times 657}{9} \\ &= 34 \times 657 = 22338. \end{aligned}$$`,
        r`दिया है $\text{HCF}(306, 657) = 9$, LCM ज्ञात करो: $$\begin{aligned} \text{LCM}(306, 657) &= \frac{306 \times 657}{9} \\ &= 34 \times 657 = 22338. \end{aligned}$$`,
      ),
    ),
    w.body(
      t(
        r`**Only for two numbers.** With three, a prime's middle count belongs to neither HCF nor LCM, so the beads don't add up. For 6, 72 and 120: $\text{HCF} \times \text{LCM} = 6 \times 360 = 2160$, but $6 \times 72 \times 120 = 51840$.`,
        r`**केवल दो संख्याओं के लिए।** तीन संख्याओं में किसी अभाज्य की बीच वाली गिनती न HCF में जाती है न LCM में, इसलिए मनके पूरे नहीं होते। 6, 72 और 120 के लिए: $\text{HCF} \times \text{LCM} = 6 \times 360 = 2160$, पर $6 \times 72 \times 120 = 51840$।`,
      ),
    ),
    b.prop(bagCompareDef, "compare", { numbers: [6, 72, 120], show: BagShow.Lcm }),
    space(),
  ]);
});

/** Your turn: can HCF 18 and LCM 380 go together? */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      prompt: t(
        "Can two numbers have HCF 18 and LCM 380?",
        "क्या दो संख्याओं का HCF 18 और LCM 380 हो सकता है?",
      ),
      options: [
        {
          id: "product",
          label: t(
            r`Yes: the numbers multiply to $18 \times 380$`,
            r`हाँ: संख्याओं का गुणनफल $18 \times 380$ है`,
          ),
          feedback: t(
            r`The HCF divides both numbers, and both divide the LCM, so the HCF must divide the LCM. Does 18 divide 380?`,
            r`HCF दोनों संख्याओं को विभाजित करता है, और दोनों LCM को, इसलिए HCF को LCM को विभाजित करना ही होगा। क्या 18, 380 को विभाजित करता है?`,
          ),
        },
        { id: "right", label: t("No: 18 doesn't divide 380", "नहीं: 18, 380 को विभाजित नहीं करता") },
        {
          id: "bigger",
          label: t("Yes, because the LCM is bigger than the HCF", "हाँ, क्योंकि LCM, HCF से बड़ा है"),
          feedback: t(
            r`Bigger isn't enough: every bead of the HCF must also be in the LCM. $18 = 2 \times 3^2$ but $380 = 2^2 \times 5 \times 19$ has no 3.`,
            r`बड़ा होना काफ़ी नहीं: HCF का हर मनका LCM में भी होना चाहिए। $18 = 2 \times 3^2$ पर $380 = 2^2 \times 5 \times 19$ में कोई 3 नहीं है।`,
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
export const overview = [together, use, yourTurn];

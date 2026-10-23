import { PassOn, column, page, space, t } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/patterns";
import { primeBagDef } from "@chalk/prop-primes";

const r = String.raw;

/** NCERT Example 5: 4ⁿ never ends in 0, because its bag is all 2s. */
const fourToTheN = page("four-to-the-n", (b) => {
  const w = wordsOn(b);
  return column([
    w.title(t(r`Can $4^n$ end with the digit 0?`, r`क्या $4^n$ का अंतिम अंक 0 हो सकता है?`)),
    w.body(
      t(
        r`A number ends in 0 exactly when 10 divides it, and $10 = 2 \times 5$. So its bag must hold a 2 **and** a 5.`,
        r`कोई संख्या 0 पर तभी ख़त्म होती है जब 10 उसे विभाजित करे, और $10 = 2 \times 5$। इसलिए उसकी थैली में एक 2 **और** एक 5 होना चाहिए।`,
      ),
    ),
    b.prop(primeBagDef, "bag", { base: 4, power: 3, isPowerShown: true }),
    w.body(
      t(
        r`Slide $k$. $4^k = (2^2)^k = 2^{2k}$: the bag is 4's bag again and again, only 2s. By uniqueness no other prime can ever turn up, so there is never a 5, and $4^n$ never ends in 0.`,
        r`$k$ खिसकाओ। $4^k = (2^2)^k = 2^{2k}$: थैली में बार-बार 4 की ही थैली है, केवल 2। अद्वितीयता से कोई और अभाज्य कभी नहीं आ सकता, इसलिए 5 कभी नहीं आता, और $4^n$ कभी 0 पर ख़त्म नहीं होता।`,
      ),
    ),
    w.note(
      t(
        "Type other numbers for n. Which powers end in 0? Exactly those whose bag has both a 2 and a 5.",
        "n के लिए दूसरी संख्याएँ लिखो। किन घातों का अंत 0 से होता है? ठीक उन्हीं का जिनकी थैली में 2 और 5 दोनों हों।",
      ),
    ),
    space(),
  ]);
});

/** NCERT Ex 1.2 Q6: composite, because a factor can be taken out. */
const composite = page("composite", (b) => {
  const w = wordsOn(b);
  return column([
    w.title(t("Prime or composite?", "अभाज्य या भाज्य?")),
    w.body(
      t(
        r`Is $7 \times 11 \times 13 + 13$ prime? Take out the 13 both terms share: $$7 \times 11 \times 13 + 13 = 13 \times (7 \times 11 + 1) = 13 \times 78.$$`,
        r`क्या $7 \times 11 \times 13 + 13$ अभाज्य है? दोनों पदों में साझा 13 बाहर निकालो: $$7 \times 11 \times 13 + 13 = 13 \times (7 \times 11 + 1) = 13 \times 78.$$`,
      ),
    ),
    w.body(
      t(
        r`It has factors other than 1 and itself, so it is **composite**. The same way: $$7 \times 6 \times 5 \times 4 \times 3 \times 2 \times 1 + 5 = 5 \times (7 \times 6 \times 4 \times 3 \times 2 + 1) = 5 \times 1009.$$`,
        r`इसके 1 और स्वयं के अलावा भी गुणनखंड हैं, इसलिए यह **भाज्य** है। इसी तरह: $$7 \times 6 \times 5 \times 4 \times 3 \times 2 \times 1 + 5 = 5 \times (7 \times 6 \times 4 \times 3 \times 2 + 1) = 5 \times 1009.$$`,
      ),
    ),
    space(),
  ]);
});

/** Your turn: 6ⁿ. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      prompt: t(
        r`Can $6^n$ end with the digit 0, for some natural number $n$?`,
        r`क्या किसी प्राकृत संख्या $n$ के लिए $6^n$ का अंतिम अंक 0 हो सकता है?`,
      ),
      options: [
        {
          id: "big",
          label: t(r`Yes, if $n$ is big enough`, r`हाँ, अगर $n$ काफ़ी बड़ा हो`),
          feedback: t(
            r`$6^n = 2^n \times 3^n$. However big $n$ gets, the bag has only 2s and 3s: no 5 ever appears.`,
            r`$6^n = 2^n \times 3^n$। $n$ कितना भी बड़ा हो, थैली में केवल 2 और 3 होते हैं: 5 कभी नहीं आता।`,
          ),
        },
        {
          id: "even",
          label: t(r`Yes, because $6^n$ is even`, r`हाँ, क्योंकि $6^n$ सम है`),
          feedback: t(
            r`Even means a 2 is in the bag. Ending in 0 needs a 5 as well, and $6^n$ never has one.`,
            r`सम का मतलब थैली में 2 है। 0 पर ख़त्म होने के लिए 5 भी चाहिए, और $6^n$ में वह कभी नहीं होता।`,
          ),
        },
        { id: "right", label: t("No, never", "नहीं, कभी नहीं") },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Your turn", "अब तुम")),
      b.prop(primeBagDef, "bag", { base: 6, power: 2, isPowerShown: true }),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order. */
export const overview = [fourToTheN, composite, yourTurn];

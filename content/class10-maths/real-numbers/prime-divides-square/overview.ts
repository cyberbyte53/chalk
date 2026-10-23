import { PassOn, column, page, space, t } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/patterns";
import { primeBagDef } from "@chalk/prop-primes";

const r = String.raw;

/** a²'s bag is a's bag twice: a prime in a² was already in a. Theorem 1.3. */
const twice = page("twice", (b) => {
  const w = wordsOn(b);
  return column([
    w.title(t(r`The bag of $a^2$`, r`$a^2$ की थैली`)),
    w.body(
      t(
        r`$a^2 = a \times a$, so the bag of $a^2$ is the bag of $a$, twice over. Type any $a$:`,
        r`$a^2 = a \times a$, इसलिए $a^2$ की थैली, $a$ की थैली दो बार है। कोई भी $a$ लिखो:`,
      ),
    ),
    b.prop(primeBagDef, "bag", { base: 30, power: 2, isPowerShown: true }),
    w.body(
      t(
        r`Every prime in $a^2$ came from one of the two copies of $a$. By uniqueness, $a^2$ can't hold a prime that $a$ doesn't.`,
        r`$a^2$ का हर अभाज्य, $a$ की दो प्रतियों में से किसी एक से आया है। अद्वितीयता से $a^2$ में ऐसा कोई अभाज्य नहीं हो सकता जो $a$ में न हो।`,
      ),
    ),
    w.definition(
      t(
        r`**Theorem.** Let $p$ be a prime. If $p$ divides $a^2$, then $p$ divides $a$, where $a$ is a positive integer.`,
        r`**प्रमेय।** मान लो $p$ एक अभाज्य है। यदि $p$, $a^2$ को विभाजित करता है, तो $p$, $a$ को भी विभाजित करता है, जहाँ $a$ एक धनात्मक पूर्णांक है।`,
      ),
    ),
    w.note(
      t(
        r`This is the step the proof that $\sqrt{2}$ is irrational leans on.`,
        r`$\sqrt{2}$ के अपरिमेय होने की उपपत्ति इसी कदम पर टिकी है।`,
      ),
    ),
    space(),
  ]);
});

/** Only for primes: 4 divides 36 but not 6. */
const onlyPrimes = page(
  "only-primes",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      prompt: t(
        r`9 divides $a^2$. Must 9 divide $a$?`,
        r`9, $a^2$ को विभाजित करता है। क्या 9 को $a$ को विभाजित करना ही होगा?`,
      ),
      options: [
        {
          id: "yes",
          label: t("Yes, by the theorem", "हाँ, प्रमेय से"),
          feedback: t(
            r`The theorem is for a **prime** $p$, and 9 isn't prime. Try $a = 3$: 9 divides $a^2 = 9$, but not 3.`,
            r`प्रमेय **अभाज्य** $p$ के लिए है, और 9 अभाज्य नहीं है। $a = 3$ लो: 9, $a^2 = 9$ को विभाजित करता है, पर 3 को नहीं।`,
          ),
        },
        { id: "right", label: t(r`No: $a = 3$ shows it`, r`नहीं: $a = 3$ से दिखता है`) },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Only for primes", "केवल अभाज्यों के लिए")),
      w.body(
        t(
          r`4 divides $36 = 6^2$, but 4 doesn't divide 6. Why: $4 = 2 \times 2$, and the two 2s in $36$ came **one from each copy** of 6. A single prime bead can't be split like that.`,
          r`4, $36 = 6^2$ को विभाजित करता है, पर 6 को नहीं। क्यों: $4 = 2 \times 2$, और $36$ के दो 2, 6 की **हर प्रति से एक-एक** आए। एक अकेला अभाज्य मनका ऐसे नहीं बँट सकता।`,
        ),
      ),
      b.prop(primeBagDef, "bag", { base: 6, power: 2, isPowerShown: true }),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order. */
export const overview = [twice, onlyPrimes];

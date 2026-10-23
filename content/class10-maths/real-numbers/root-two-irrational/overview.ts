import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, orderQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import { primeTowersDef } from "@chalk/prop-primes";

const r = String.raw;

/**
 * The goal (prove √2 is irrational), and the one fact the proof needs: if a prime divides a², it
 * divides a. First on numbers (12 and 144 have the same primes), then in general with the
 * Fundamental Theorem: squaring doubles every power but brings in no new prime.
 */
const intro = page(
  "intro",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "Set the goal: prove √2 can't be written as a/b. First the fact the proof needs, found on numbers: 144 = 12² has the same primes as 12, only with doubled powers. Then in general by the Fundamental Theorem: a prime p that divides a² is one of a²'s primes, so one of a's primes, so p divides a. Why prime: 4 divides 36 = 6² but not 6.",
    );
    const towers = b.prop(primeTowersDef, "towers", { numberA: 12, numberB: 144, choices: [] });
    b.standsFor(
      towers,
      "the prime factorisations of 12 and of 144 = 12²: the same primes, every power doubled",
    );
    const which = choiceQuestion(b, {
      name: "which",
      prompt: t(
        r`Which primes divide $144 = 2^4 \times 3^2$?`,
        r`कौन-से अभाज्य $144 = 2^4 \times 3^2$ को विभाजित करते हैं?`,
      ),
      options: [
        { id: "right", label: t("2 and 3", "2 और 3") },
        {
          id: "only2",
          label: t("Only 2", "केवल 2"),
          feedback: t(
            r`3 is in the factorisation too: $3^2 = 9$, and $144 = 9 \times 16$.`,
            r`3 भी गुणनखंडन में है: $3^2 = 9$, और $144 = 9 \times 16$।`,
          ),
        },
        {
          id: "more",
          label: t("2, 3 and 7", "2, 3 और 7"),
          feedback: t(
            r`7 isn't in $2^4 \times 3^2$, and the factorisation is the only one 144 has. So 7 doesn't divide 144: $144 = 7 \times 20 + 4$.`,
            r`7, $2^4 \times 3^2$ में नहीं है, और 144 का गुणनखंडन यही एक है। तो 7, 144 को विभाजित नहीं करता: $144 = 7 \times 20 + 4$।`,
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const same = w.body(
      t(
        r`**The same primes as 12.** Squaring doubled each power, but brought in no new prime.`,
        r`**वही अभाज्य जो 12 में हैं।** वर्ग करने से हर घात दुगनी हुई, पर कोई नया अभाज्य नहीं आया।`,
      ),
      "same",
      { isHidden: true },
    );
    const must = choiceQuestion(b, {
      name: "must",
      prompt: t(
        r`So if 7 divides $a^2$, must 7 divide $a$?`,
        r`तो अगर 7, $a^2$ को विभाजित करे, तो क्या 7 को $a$ को विभाजित करना ही होगा?`,
      ),
      options: [
        { id: "yes", label: t("Yes", "हाँ") },
        {
          id: "no",
          label: t("Not always", "हमेशा नहीं"),
          feedback: t(
            r`$a^2$ has exactly the primes of $a$. If 7 divides $a^2$, 7 is one of those primes, so it is one of $a$'s.`,
            r`$a^2$ में ठीक वही अभाज्य हैं जो $a$ में हैं। अगर 7, $a^2$ को विभाजित करे, तो 7 उन्हीं में से एक है, यानी $a$ का भी।`,
          ),
        },
      ],
      answer: "yes",
      isHidden: true,
      passes: false,
    });
    const general = w.body(
      t(
        r`**Why, for any $a$.** By the Fundamental Theorem of Arithmetic, write $a$ as a product of primes: $$a = p_1^{k_1} \times p_2^{k_2} \times \cdots \times p_n^{k_n}$$ Squaring doubles every power: $$a^2 = p_1^{2k_1} \times p_2^{2k_2} \times \cdots \times p_n^{2k_n}$$ If a prime $p$ divides $a^2$, it is one of the primes in this factorisation, because the factorisation is unique. So $p$ is one of $p_1, p_2, \ldots, p_n$, and $p$ divides $a$.`,
        r`**क्यों, हर $a$ के लिए।** अंकगणित की आधारभूत प्रमेय से $a$ को अभाज्यों के गुणनफल के रूप में लिखो: $$a = p_1^{k_1} \times p_2^{k_2} \times \cdots \times p_n^{k_n}$$ वर्ग करने से हर घात दुगनी होती है: $$a^2 = p_1^{2k_1} \times p_2^{2k_2} \times \cdots \times p_n^{2k_n}$$ अगर कोई अभाज्य $p$, $a^2$ को विभाजित करे, तो वह इस गुणनखंडन के अभाज्यों में से एक है, क्योंकि गुणनखंडन अद्वितीय है। तो $p$, $p_1, p_2, \ldots, p_n$ में से एक है, और $p$, $a$ को विभाजित करता है।`,
      ),
      "general",
      { isHidden: true },
    );
    const theorem = w.definition(
      t(
        r`**If a prime $p$ divides $a^2$, then $p$ divides $a$.**`,
        r`**यदि कोई अभाज्य $p$, $a^2$ को विभाजित करे, तो $p$, $a$ को विभाजित करता है।**`,
      ),
      "theorem",
      { isHidden: true },
    );
    const four = choiceQuestion(b, {
      name: "four",
      prompt: t(
        r`Does it work for 4, which isn't prime? 4 divides $36 = 6^2$. Does 4 divide 6?`,
        r`क्या यह 4 के लिए चलता है, जो अभाज्य नहीं? 4, $36 = 6^2$ को विभाजित करता है। क्या 4, 6 को विभाजित करता है?`,
      ),
      options: [
        {
          id: "yes",
          label: t("Yes", "हाँ"),
          feedback: t(r`$6 = 4 \times 1 + 2$: 2 is left over.`, r`$6 = 4 \times 1 + 2$: 2 बचता है।`),
        },
        { id: "no", label: t("No", "नहीं") },
      ],
      answer: "no",
      isHidden: true,
    });
    const prime = w.note(
      t(
        r`**So $p$ must be prime.** 4 is $2 \times 2$, and it needs two 2s. 6 has only one 2; squaring gave 36 two: $$6 = 2 \times 3, \quad 36 = 2^2 \times 3^2$$ A prime can't be split into smaller factors like this, so the rule holds for primes.`,
        r`**तो $p$ का अभाज्य होना ज़रूरी है।** 4, $2 \times 2$ है, और उसे दो 2 चाहिए। 6 में केवल एक 2 है; वर्ग करने से 36 में दो हो गए: $$6 = 2 \times 3, \quad 36 = 2^2 \times 3^2$$ अभाज्य को ऐसे छोटे गुणनखंडों में नहीं तोड़ा जा सकता, इसलिए नियम अभाज्यों के लिए सही है।`,
      ),
      "prime",
      { isHidden: true },
    );
    b.when(which.on(QuestionSignal.Correct), [theBoard.show(same), theBoard.show(must)]);
    b.when(must.on(QuestionSignal.Correct), [
      theBoard.show(general),
      theBoard.show(theorem),
      theBoard.show(four),
    ]);
    b.when(four.on(QuestionSignal.Correct), theBoard.show(prime));
    return column([
      w.title(t("Irrational numbers", "अपरिमेय संख्याएँ")),
      w.body(
        t(
          r`A **rational** number can be written as $\frac{a}{b}$, with $a$ and $b$ integers and $b \ne 0$. In Class 9 you were told $\sqrt{2}$ is **irrational**: it can't be written that way. Now we prove it.`,
          r`**परिमेय** संख्या को $\frac{a}{b}$ के रूप में लिख सकते हैं, जहाँ $a$ और $b$ पूर्णांक हैं और $b \ne 0$। कक्षा 9 में बताया गया था कि $\sqrt{2}$ **अपरिमेय** है: इसे ऐसे नहीं लिख सकते। अब हम इसे सिद्ध करते हैं।`,
        ),
      ),
      w.body(
        t(
          r`First, one fact the proof needs. Square 12 and look at its primes: $$\begin{aligned} 12 &= 2^2 \times 3 \\ 12^2 = 144 &= 2^4 \times 3^2 \end{aligned}$$`,
          r`पहले एक तथ्य जो उपपत्ति में चाहिए। 12 का वर्ग करो और उसके अभाज्य देखो: $$\begin{aligned} 12 &= 2^2 \times 3 \\ 12^2 = 144 &= 2^4 \times 3^2 \end{aligned}$$`,
        ),
      ),
      towers,
      which,
      same,
      must,
      general,
      theorem,
      four,
      prime,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The proof that √2 is irrational, built one question at a time. */
const proof = page(
  "proof",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "Build NCERT's proof that √2 is irrational: suppose √2 = a/b in lowest terms; then 2b² = a², so 2 divides a; a = 2c gives b² = 2c², so 2 divides b; but a and b had no common factor. Contradiction.",
    );
    const twoA = choiceQuestion(b, {
      name: "twoA",
      prompt: t(r`$2b^2 = a^2$. So 2 divides…`, r`$2b^2 = a^2$। तो 2 विभाजित करता है…`),
      options: [
        { id: "right", label: t(r`$a$, because 2 is prime`, r`$a$ को, क्योंकि 2 अभाज्य है`) },
        {
          id: "b",
          label: t(r`$b$`, r`$b$ को`),
          feedback: t(
            r`$2b^2$ has a 2 in it whatever $b$ is: it says nothing about $b$ yet. It says $a^2$ is a multiple of 2.`,
            r`$2b^2$ में 2 है, $b$ चाहे जो हो: यह अभी $b$ के बारे में कुछ नहीं कहता। यह कहता है कि $a^2$, 2 का गुणज है।`,
          ),
        },
        {
          id: "only",
          label: t(r`only $a^2$, not $a$`, r`केवल $a^2$ को, $a$ को नहीं`),
          feedback: t(
            r`2 is prime, and a prime that divides $a^2$ divides $a$.`,
            r`2 अभाज्य है, और जो अभाज्य $a^2$ को विभाजित करे, वह $a$ को भी करता है।`,
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const step2 = w.body(
      t(
        r`2 divides $a$, so $a$ is 2 times some integer $c$: $$a = 2c$$ Put it into $2b^2 = a^2$: $$2b^2 = (2c)^2 = 4c^2, \quad \text{so} \quad b^2 = 2c^2$$`,
        r`2, $a$ को भाग देता है, तो $a$ किसी पूर्णांक $c$ का 2 गुना है: $$a = 2c$$ इसे $2b^2 = a^2$ में रखो: $$2b^2 = (2c)^2 = 4c^2, \quad \text{तो} \quad b^2 = 2c^2$$`,
      ),
      "step2",
      { isHidden: true },
    );
    const twoB = choiceQuestion(b, {
      name: "twoB",
      prompt: t(r`$b^2 = 2c^2$. So…`, r`$b^2 = 2c^2$। तो…`),
      options: [
        { id: "right", label: t(r`2 divides $b$`, r`2, $b$ को विभाजित करता है`) },
        {
          id: "c",
          label: t(r`2 divides $c$`, r`2, $c$ को विभाजित करता है`),
          feedback: t(
            r`It's $b^2$ that is a multiple of 2 here. Same step as before, with $b$ in place of $a$.`,
            r`यहाँ $b^2$ ही 2 का गुणज है। पहले जैसा क़दम, $a$ की जगह $b$।`,
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const clash = choiceQuestion(b, {
      name: "clash",
      prompt: t(
        r`So 2 divides both $a$ and $b$. What's wrong with that?`,
        r`तो 2, $a$ और $b$ दोनों को विभाजित करता है। इसमें क्या गड़बड़ है?`,
      ),
      options: [
        {
          id: "right",
          label: t(
            r`We said $a$ and $b$ have no common factor`,
            r`हमने कहा था $a$ और $b$ का कोई साझा गुणनखंड नहीं`,
          ),
        },
        {
          id: "nothing",
          label: t("Nothing: numbers can share a 2", "कुछ नहीं: संख्याओं में 2 साझा हो सकता है"),
          feedback: t(
            r`They can, but we cancelled $\frac{a}{b}$ until $a$ and $b$ had no common factor. Now they share 2.`,
            r`हो सकता है, पर हमने $\frac{a}{b}$ को तब तक काटा था जब तक $a$ और $b$ का कोई साझा गुणनखंड न बचे। अब उनमें 2 साझा है।`,
          ),
        },
      ],
      answer: "right",
      isHidden: true,
    });
    const done = w.definition(
      t(
        r`That's a contradiction, so the supposition was wrong: $\sqrt{2}$ is **irrational**.`,
        r`यह विरोधाभास है, इसलिए हमारी मान्यता ग़लत थी: $\sqrt{2}$ **अपरिमेय** है।`,
      ),
      "done",
      { isHidden: true },
    );
    b.when(twoA.on(QuestionSignal.Correct), [theBoard.show(step2), theBoard.show(twoB)]);
    b.when(twoB.on(QuestionSignal.Correct), theBoard.show(clash));
    b.when(clash.on(QuestionSignal.Correct), theBoard.show(done));
    return column([
      w.title(t(r`$\sqrt{2}$ is irrational`, r`$\sqrt{2}$ अपरिमेय है`)),
      w.body(
        t(
          r`**Suppose it's rational.** We can't check every fraction one by one. Instead, suppose $\sqrt{2}$ can be written as a fraction, and show that this leads to something impossible: $$\sqrt{2} = \frac{a}{b}$$`,
          r`**मान लो यह परिमेय है।** हम हर भिन्न को एक-एक करके नहीं जाँच सकते। इसके बजाय मान लो $\sqrt{2}$ को भिन्न के रूप में लिख सकते हैं, और दिखाओ कि इससे कुछ असंभव निकलता है: $$\sqrt{2} = \frac{a}{b}$$`,
        ),
      ),
      w.body(
        t(
          r`Any fraction can be cancelled down, so take $\frac{a}{b}$ in lowest terms: $a$ and $b$ have **no common factor** other than 1.`,
          r`हर भिन्न को सरल किया जा सकता है, तो $\frac{a}{b}$ को न्यूनतम रूप में लो: $a$ और $b$ में 1 के सिवा **कोई उभयनिष्ठ गुणनखंड नहीं**।`,
        ),
      ),
      w.body(
        t(
          r`Square both sides, then multiply by $b^2$: $$\begin{aligned} 2 &= \frac{a^2}{b^2} \\ 2b^2 &= a^2 \end{aligned}$$`,
          r`दोनों पक्षों का वर्ग करो, फिर $b^2$ से गुणा करो: $$\begin{aligned} 2 &= \frac{a^2}{b^2} \\ 2b^2 &= a^2 \end{aligned}$$`,
        ),
      ),
      twoA,
      step2,
      twoB,
      clash,
      done,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The proof as it's written in the exam. */
const written = page("written", (b) => {
  const w = wordsOn(b);
  return column([
    w.title(t("The proof, written out", "उपपत्ति, लिखी हुई")),
    w.body(
      t(
        r`Suppose $\sqrt{2}$ is rational. Then for some integers $a$ and $b$, with $b \ne 0$ and no common factor other than 1, $$\sqrt{2} = \frac{a}{b}$$`,
        r`मान लो $\sqrt{2}$ परिमेय है। तब किन्हीं पूर्णांकों $a$ और $b$ के लिए, जहाँ $b \ne 0$ और 1 के सिवा कोई उभयनिष्ठ गुणनखंड नहीं, $$\sqrt{2} = \frac{a}{b}$$`,
      ),
    ),
    w.body(
      t(
        r`Squaring both sides, $$2b^2 = a^2$$ So 2 divides $a^2$. Since 2 is prime, 2 divides $a$.`,
        r`दोनों पक्षों का वर्ग करने पर $$2b^2 = a^2$$ तो 2, $a^2$ को भाग देता है। 2 अभाज्य है, इसलिए 2, $a$ को भाग देता है।`,
      ),
    ),
    w.body(
      t(
        r`So we can write $a = 2c$ for some integer $c$. Substituting, $$2b^2 = 4c^2, \quad \text{so} \quad b^2 = 2c^2$$ So 2 divides $b^2$. Since 2 is prime, 2 divides $b$.`,
        r`तो किसी पूर्णांक $c$ के लिए $a = 2c$ लिख सकते हैं। रखने पर $$2b^2 = 4c^2, \quad \text{तो} \quad b^2 = 2c^2$$ तो 2, $b^2$ को भाग देता है। 2 अभाज्य है, इसलिए 2, $b$ को भाग देता है।`,
      ),
    ),
    w.body(
      t(
        r`So 2 is a common factor of $a$ and $b$. This contradicts that $a$ and $b$ have no common factor other than 1. So our supposition is wrong, and $\sqrt{2}$ is irrational.`,
        r`तो 2, $a$ और $b$ का साझा गुणनखंड है। यह इस बात का खंडन करता है कि $a$ और $b$ का 1 के अलावा कोई साझा गुणनखंड नहीं। इसलिए हमारी मान्यता ग़लत है, और $\sqrt{2}$ अपरिमेय है।`,
      ),
    ),
    space(),
  ]);
});

/** Combinations: 5 − √3 and 3√2 (NCERT Examples 10 and 11). */
const combinations = page("combinations", (b) => {
  const w = wordsOn(b);
  return column([
    w.title(t("Example", "उदाहरण")),
    w.body(
      t(
        r`The proof for $\sqrt{2}$ works for $\sqrt{3}$ too: use 3 (also prime) in place of 2 at every step. So $\sqrt{3}$ is irrational as well.`,
        r`$\sqrt{2}$ वाली उपपत्ति $\sqrt{3}$ के लिए भी चलती है: हर चरण में 2 की जगह 3 (वह भी अभाज्य) रखो। तो $\sqrt{3}$ भी अपरिमेय है।`,
      ),
    ),
    w.body(
      t(
        r`**Q.** Show that $5 - \sqrt{3}$ is irrational.`,
        r`**प्र.** दिखाओ कि $5 - \sqrt{3}$ अपरिमेय है।`,
      ),
    ),
    w.body(
      t(
        r`**A.** Suppose it is rational. Then for some integers $a$ and $b$, with $b \ne 0$, $$5 - \sqrt{3} = \frac{a}{b}$$ Rearranging, $$\sqrt{3} = 5 - \frac{a}{b} = \frac{5b - a}{b}$$ Since $5b - a$ and $b$ are integers, this makes $\sqrt{3}$ rational. But $\sqrt{3}$ is irrational. This contradiction shows that $5 - \sqrt{3}$ is irrational.`,
        r`**उत्तर।** मान लो यह परिमेय है। तब किन्हीं पूर्णांकों $a$ और $b$ के लिए, जहाँ $b \ne 0$, $$5 - \sqrt{3} = \frac{a}{b}$$ पुनर्व्यवस्थित करने पर $$\sqrt{3} = 5 - \frac{a}{b} = \frac{5b - a}{b}$$ $5b - a$ और $b$ पूर्णांक हैं, तो इससे $\sqrt{3}$ परिमेय हो जाता है। पर $\sqrt{3}$ अपरिमेय है। यह विरोधाभास दिखाता है कि $5 - \sqrt{3}$ अपरिमेय है।`,
      ),
    ),
    w.body(
      t(
        r`The same works for $3\sqrt{2}$. If it were a fraction, then $\sqrt{2}$ would be one too: $$3\sqrt{2} = \frac{a}{b} \;\Rightarrow\; \sqrt{2} = \frac{a}{3b}$$`,
        r`$3\sqrt{2}$ के लिए भी यही चलता है। अगर यह भिन्न होता, तो $\sqrt{2}$ भी होता: $$3\sqrt{2} = \frac{a}{b} \;\Rightarrow\; \sqrt{2} = \frac{a}{3b}$$`,
      ),
    ),
    w.definition(
      t(
        r`**Adding or subtracting** a rational number and an irrational one gives an irrational number. So does **multiplying or dividing** an irrational number by a non-zero rational one.`,
        r`परिमेय और अपरिमेय संख्या को **जोड़ने या घटाने** पर अपरिमेय संख्या मिलती है। अपरिमेय को शून्येतर परिमेय से **गुणा या भाग** करने पर भी।`,
      ),
    ),
    space(),
  ]);
});

/** The pages, in reading order. */
export const overview = [intro, proof, written, combinations];

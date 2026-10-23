import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, multiChoiceQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import { StickMeasureAction, StickMeasureSignal, stickMeasureDef } from "@chalk/prop-primes";

const r = String.raw;

/** Which piece lengths cut both ribbons; the words for every piece row on these pages. */
const lengths = [1, 2, 3, 4, 5, 6, 7];
const fitWords = {
  fits: t("{stick} cm: {pieces}, nothing left over", "{stick} cm: {n} टुकड़े, कुछ नहीं बचा"),
  leaves: t("{stick} cm: {pieces}, {gap} cm left over", "{stick} cm: {n} टुकड़े, {gap} cm बचा"),
};
const lengthOptions = (feedback: Record<number, ReturnType<typeof t>>) =>
  lengths.map((n) => ({
    id: `l${n}`,
    label: t(`${n} cm`, `${n} cm`),
    ...(feedback[n] === undefined ? {} : { feedback: feedback[n] }),
  }));

/**
 * The problem first: two ribbons, pieces of one length with nothing left over. The student tries
 * lengths 1 to 7 on both, picks the ones that work, and meets the HCF as the longest of them.
 */
const story = page(
  "story",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "Find by trying which piece lengths cut both 18 and 12 with nothing left over (1, 2, 3, 6): the common factors. The longest, 6, is the HCF. Trying every length is slow for big numbers, which sets up Euclid's method.",
    );
    const ribbons = b.prop(stickMeasureDef, "ribbons", {
      stickA: 18,
      stickB: 12,
      canLay: false,
      pieceChoices: lengths,
      fitWords,
    });
    b.standsFor(ribbons, "ribbons of 18 cm and 12 cm, with pieces of 1 to 7 cm to mark on both");
    b.witness(ribbons.learner(StickMeasureAction.TryPiece, { length: 4 }));
    const which = multiChoiceQuestion(b, {
      name: "which",
      prompt: t(
        "Which lengths cut both ribbons with nothing left over?",
        "कौन-सी लंबाइयाँ दोनों रिबन को बिना कुछ बचे काटती हैं?",
      ),
      options: lengthOptions({
        4: t("4 cm leaves 2 cm on the 18 cm ribbon.", "4 cm से 18 cm के रिबन पर 2 cm बचता है।"),
        5: t(
          "5 cm leaves 3 cm on the 18 cm ribbon and 2 cm on the 12 cm one.",
          "5 cm से 18 cm के रिबन पर 3 cm और 12 cm वाले पर 2 cm बचता है।",
        ),
        7: t(
          "7 cm leaves 4 cm on the 18 cm ribbon and 5 cm on the 12 cm one.",
          "7 cm से 18 cm के रिबन पर 4 cm और 12 cm वाले पर 5 cm बचता है।",
        ),
      }),
      answers: ["l1", "l2", "l3", "l6"],
      missing: t(
        "Those work, but there are more. Try each length on both ribbons.",
        "ये चलती हैं, पर और भी हैं। हर लंबाई दोनों रिबन पर आज़माओ।",
      ),
      isHidden: true,
    });
    const hcf = w.definition(
      t(
        "1, 2, 3 and 6 each divide both 18 and 12: they are the **common factors** of 18 and 12. The longest, **6 cm**, is the **highest common factor**: HCF(18, 12) = 6.",
        "1, 2, 3 और 6, 18 और 12 दोनों को विभाजित करते हैं: ये 18 और 12 के **सार्व गुणनखंड** हैं। सबसे लंबा, **6 cm**, **महत्तम समापवर्तक** है: HCF(18, 12) = 6।",
      ),
      "hcf",
      { isHidden: true },
    );
    const slow = w.note(
      t(
        "Trying every length works for 18 and 12. For ribbons of 391 cm and 323 cm, it would take very long. Euclid found a faster way.",
        "18 और 12 के लिए हर लंबाई आज़माना चल जाता है। 391 cm और 323 cm के रिबन के लिए बहुत देर लगेगी। यूक्लिड ने एक तेज़ तरीक़ा खोजा।",
      ),
      "slow",
      { isHidden: true },
    );
    b.when(ribbons.on(StickMeasureSignal.Tried), theBoard.show(which));
    b.when(which.on(QuestionSignal.Correct), [theBoard.show(hcf), theBoard.show(slow)]);
    return column([
      w.title(t("Euclid's division algorithm", "यूक्लिड विभाजन एल्गोरिथ्म")),
      w.body(
        t(
          "Riya has two ribbons, **18 cm** and **12 cm** long. She wants to cut both into pieces of the **same length**, with **nothing left over**.",
          "रिया के पास दो रिबन हैं, **18 cm** और **12 cm** लंबे। वह दोनों को **एक ही लंबाई** के टुकड़ों में काटना चाहती है, और **कुछ न बचे**।",
        ),
      ),
      w.body(
        t(
          "Tap a length to mark pieces of it on both ribbons.",
          "किसी लंबाई को दबाओ, उसके टुकड़ों के निशान दोनों रिबन पर लगेंगे।",
        ),
      ),
      ribbons,
      which,
      hcf,
      slow,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Euclid's method as four short steps, run on 18 and 12 (6, as found by trying), then 51 and 21. */
const method = page(
  "method",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "Meet Euclid's method: lay the shorter along the longer, keep only the leftover, repeat until nothing is left over; the last one laid is the HCF. On 18 and 12 it gives 6, the answer found by trying; then 51 and 21 (3).",
    );
    const ribbons = b.prop(stickMeasureDef, "ribbons", { stickA: 18, stickB: 12 });
    b.studentOnly(ribbons.action(StickMeasureAction.Lay));
    b.studentOnly(ribbons.action(StickMeasureAction.Keep));
    b.standsFor(ribbons, "the two ribbons, 18 and 12, for Euclid's method");
    b.witness(
      ribbons.learner(StickMeasureAction.Lay),
      ribbons.learner(StickMeasureAction.Keep),
      ribbons.learner(StickMeasureAction.Lay),
    );
    const first = choiceQuestion(b, {
      name: "first",
      prompt: t("Nothing is left over. What is HCF(18, 12)?", "कुछ नहीं बचा। HCF(18, 12) क्या है?"),
      options: [
        { id: "six", label: t("6", "6") },
        {
          id: "twelve",
          label: t("12", "12"),
          feedback: t(
            "12 was laid first, but it leaves 6 cm on the 18 cm ribbon. The HCF is the last one laid.",
            "12 पहले रखा गया, पर उससे 18 cm के रिबन पर 6 cm बचता है। HCF आख़िरी रखा गया है।",
          ),
        },
        {
          id: "two",
          label: t("2", "2"),
          feedback: t(
            "2 cuts both, but it isn't the highest. The HCF is the last one laid.",
            "2 दोनों को काटता है, पर सबसे बड़ा नहीं है। HCF आख़िरी रखा गया है।",
          ),
        },
      ],
      answer: "six",
      isHidden: true,
      passes: false,
    });
    const same = w.body(
      t(
        "**6**, the same answer we found by trying every length, in two steps.",
        "**6**, वही उत्तर जो हर लंबाई आज़माकर मिला था, बस दो क़दमों में।",
      ),
      "same",
      { isHidden: true },
    );
    const again = w.body(
      t("Now ribbons of **51 cm** and **21 cm**.", "अब **51 cm** और **21 cm** के रिबन।"),
      "again",
      { isHidden: true },
    );
    const second = b.prop(
      stickMeasureDef,
      "second",
      { stickA: 51, stickB: 21 },
      { isHidden: true },
    );
    b.studentOnly(second.action(StickMeasureAction.Lay));
    b.studentOnly(second.action(StickMeasureAction.Keep));
    b.standsFor(second, "ribbons of 51 and 21, for Euclid's method");
    b.witness(
      second.learner(StickMeasureAction.Lay),
      second.learner(StickMeasureAction.Keep),
      second.learner(StickMeasureAction.Lay),
      second.learner(StickMeasureAction.Keep),
      second.learner(StickMeasureAction.Lay),
    );
    const longest = choiceQuestion(b, {
      name: "longest",
      prompt: t("What is HCF(51, 21)?", "HCF(51, 21) क्या है?"),
      options: [
        { id: "three", label: t("3", "3") },
        {
          id: "nine",
          label: t("9", "9"),
          feedback: t(
            "9 was a leftover, and 3 was laid along it. Keep going until nothing is left over.",
            "9 एक बचा हुआ टुकड़ा था, और उस पर 3 रखा गया। तब तक चलो जब तक कुछ न बचे।",
          ),
        },
        {
          id: "seven",
          label: t("7", "7"),
          feedback: t(
            r`7 cuts 21, but not 51. It leaves 2 cm: $$51 = 7 \times 7 + 2$$`,
            r`7, 21 को काटता है, पर 51 को नहीं। 2 cm बचता है: $$51 = 7 \times 7 + 2$$`,
          ),
        },
      ],
      answer: "three",
      isHidden: true,
    });
    const wonder = w.note(
      t(
        "No trying every length. But why does keeping only the leftover give the HCF? That's next.",
        "हर लंबाई आज़माए बिना। पर सिर्फ़ बचा हुआ टुकड़ा रखने से HCF क्यों मिलता है? यह आगे देखेंगे।",
      ),
      "wonder",
      { isHidden: true },
    );
    b.when(ribbons.on(StickMeasureSignal.Finished), theBoard.show(first));
    b.when(first.on(QuestionSignal.Correct), [
      theBoard.show(same),
      theBoard.show(again),
      theBoard.show(second),
    ]);
    b.when(second.on(StickMeasureSignal.Finished), theBoard.show(longest));
    b.when(longest.on(QuestionSignal.Correct), theBoard.show(wonder));
    const step = (n: number, en: string, hi: string) =>
      w.body(t(`**${n}.** ${en}`, `**${n}.** ${hi}`));
    return column([
      w.title(t("Euclid's method", "यूक्लिड का तरीक़ा")),
      w.body(
        t(
          "Euclid found the HCF without trying every length:",
          "यूक्लिड ने हर लंबाई आज़माए बिना HCF निकाला:",
        ),
      ),
      step(
        1,
        "Lay the shorter ribbon along the longer, as many times as it fits.",
        "छोटे रिबन को बड़े पर, जितनी बार आए, रखो।",
      ),
      step(2, "Keep only the leftover.", "सिर्फ़ बचा हुआ टुकड़ा रखो।"),
      step(
        3,
        "Now lay the leftover along the ribbon you just laid, and keep going.",
        "अब बचे टुकड़े को उस रिबन पर बिछाओ जो अभी बिछाया था, और ऐसे ही चलते रहो।",
      ),
      step(
        4,
        "When nothing is left over, the last ribbon you laid is the HCF.",
        "जब कुछ न बचे, आख़िरी रखा गया रिबन HCF है।",
      ),
      w.body(t("Try it on Riya's ribbons.", "रिया के रिबन पर आज़माओ।")),
      ribbons,
      first,
      same,
      again,
      second,
      longest,
      wonder,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Why keeping the leftover keeps the HCF: 12 and the leftover 6 have the same common factors. */
const why = page(
  "why",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "See that 12 and the leftover 6 are cut by the same lengths (1, 2, 3, 6) as 18 and 12: swapping the longer ribbon for its leftover keeps the common factors, so the HCF never changes as the ribbons shrink.",
    );
    const marks = b.prop(stickMeasureDef, "marks", {
      stickA: 18,
      stickB: 12,
      isLaid: true,
      canLay: false,
      pieceChoices: lengths,
      fitWords,
    });
    b.standsFor(marks, "12 laid along 18 with the leftover 6, and pieces of 1 to 7 cm to mark");
    b.witness(marks.learner(StickMeasureAction.TryPiece, { length: 3 }));
    const leftover = multiChoiceQuestion(b, {
      name: "leftover",
      prompt: t(
        "Which lengths cut both 12 and the leftover 6 with nothing left over?",
        "कौन-सी लंबाइयाँ 12 और बचे हुए 6 दोनों को बिना कुछ बचे काटती हैं?",
      ),
      options: lengthOptions({
        4: t("4 cm leaves 2 cm on the leftover 6.", "4 cm से बचे हुए 6 पर 2 cm बचता है।"),
        5: t(
          "5 cm leaves 2 cm on the 12 and 1 cm on the 6.",
          "5 cm से 12 पर 2 cm और 6 पर 1 cm बचता है।",
        ),
        7: t("7 cm is longer than the leftover 6.", "7 cm बचे हुए 6 से लंबा है।"),
      }),
      answers: ["l1", "l2", "l3", "l6"],
      missing: t(
        "Those work, but there are more. Try each length on the 12 and the 6.",
        "ये चलती हैं, पर और भी हैं। हर लंबाई 12 और 6 पर आज़माओ।",
      ),
      isHidden: true,
    });
    const same = w.definition(
      t(
        "**The same list: 1, 2, 3 and 6.** So HCF(18, 12) = HCF(12, 6).",
        "**वही सूची: 1, 2, 3 और 6।** तो HCF(18, 12) = HCF(12, 6)।",
      ),
      "same",
      { isHidden: true },
    );
    const because = w.body(
      t(
        r`**Why the same list?** Take 3 cm pieces. The 18 cm ribbon is 6 pieces. The 12 laid on it covers 4 of them, so the leftover is the other 2: whole pieces again. $$\underbrace{18}_{6 \text{ pieces}} = \underbrace{12}_{4 \text{ pieces}} + \underbrace{6}_{2 \text{ pieces}}$$ The same happens for any length that cuts both 18 and 12: it cuts the leftover too. And back: a length that cuts 12 and 6 cuts 18, because 18 is just 12 and 6 end to end.`,
        r`**सूची वही क्यों?** 3 cm के टुकड़े लो। 18 cm का रिबन 6 टुकड़े है। उस पर बिछाया 12 उनमें से 4 ढकता है, तो बचा हिस्सा बाक़ी 2 है: फिर से पूरे टुकड़े। $$\underbrace{18}_{6 \text{ टुकड़े}} = \underbrace{12}_{4 \text{ टुकड़े}} + \underbrace{6}_{2 \text{ टुकड़े}}$$ जो भी लंबाई 18 और 12 दोनों को काटे, उसके साथ यही होता है: वह बचे हिस्से को भी काटती है। और उल्टा: जो लंबाई 12 और 6 को काटे, वह 18 को भी काटती है, क्योंकि 18 बस 12 और 6 को जोड़कर बना है।`,
      ),
      "because",
      { isHidden: true },
    );
    const end = w.body(
      t(
        r`**Every step keeps the HCF.** So when nothing is left over, the last ribbon laid is the HCF.`,
        r`**हर क़दम HCF बनाए रखता है।** तो जब कुछ न बचे, आख़िरी बिछाया रिबन HCF है।`,
      ),
      "end",
      { isHidden: true },
    );
    b.when(marks.on(StickMeasureSignal.Tried), theBoard.show(leftover));
    b.when(leftover.on(QuestionSignal.Correct), [
      theBoard.show(same),
      theBoard.show(because),
      theBoard.show(end),
    ]);
    return column([
      w.title(t("Why it works", "यह क्यों काम करता है")),
      w.body(
        t(
          "Here is the 12 laid along the 18. The red piece is the leftover, 6 cm.",
          "यहाँ 12 को 18 पर रखा है। लाल टुकड़ा बचा हुआ है, 6 cm।",
        ),
      ),
      w.body(
        t(
          "Lengths 1, 2, 3 and 6 cut both 18 and 12. Tap lengths and see which cut the leftover too.",
          "लंबाइयाँ 1, 2, 3 और 6, 18 और 12 दोनों को काटती हैं। लंबाइयाँ दबाओ और देखो कौन-सी बचे हुए टुकड़े को भी काटती हैं।",
        ),
      ),
      marks,
      leftover,
      same,
      because,
      end,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Each step is a division; the general proof HCF(a, b) = HCF(b, r); the algorithm and why it stops. */
const division = page("division", (b) => {
  const w = wordsOn(b);
  const figure = b.prop(stickMeasureDef, "figure", {
    stickA: 17,
    stickB: 5,
    isLaid: true,
    canLay: false,
    letters: { long: "a", short: "b", left: "r" },
  });
  b.standsFor(figure, "b laid q times along a, with the leftover r");
  return column([
    w.title(t("Each step is a division", "हर क़दम एक भाग है")),
    w.body(
      t(
        r`$$\underbrace{51}_{\text{ribbon}} = \underbrace{21}_{\text{laid}} \times 2 + \underbrace{9}_{\text{leftover}}$$ This is $51 \div 21$: the leftover, 9, is the **remainder**, and it's shorter than 21. That's Euclid's division lemma. From here on we call it the remainder.`,
        r`$$\underbrace{51}_{\text{रिबन}} = \underbrace{21}_{\text{बिछाया}} \times 2 + \underbrace{9}_{\text{बचा}}$$ यह $51 \div 21$ है: बचा हुआ 9 **शेषफल** है, और 21 से छोटा है। यही यूक्लिड विभाजन प्रमेयिका है। आगे से हम इसे शेषफल कहेंगे।`,
      ),
    ),
    w.body(
      t(
        r`**In general**, take two numbers $a$ and $b$, with $a$ the bigger. Lay $b$ along $a$ as many times as it fits, $q$ times, and $r$ is left over: $$a = bq + r, \qquad 0 \le r < b$$`,
        r`**व्यापक रूप में**, दो संख्याएँ $a$ और $b$ लो, $a$ बड़ी। $b$ को $a$ पर जितनी बार हो सके, $q$ बार, बिछाओ, और $r$ बचता है: $$a = bq + r, \qquad 0 \le r < b$$`,
      ),
    ),
    figure,
    w.body(
      t(
        r`**Same common factors.** When 51 is divided by 21, the quotient is $q = 2$ and the remainder is $r = 9$: $$51 = 21 \times 2 + 9$$ We want to show: a common factor of 51 and 21 is also a factor of the remainder 9. Take 3, a common factor of 51 and 21. Write both as multiples of 3: $$51 = 3 \times 17, \qquad 21 = 3 \times 7$$ The remainder is what's left of 51 after two 21s: $$9 = 51 - 2 \times 21$$ Replace 51 and 21 by their multiples of 3, and take the 3 out: $$\begin{aligned} 9 &= 3 \times 17 - 2 \times (3 \times 7) \\ &= 3 \times (17 - 14) \\ &= 3 \times 3 \end{aligned}$$ So 3 is a factor of 9.`,
        r`**वही उभयनिष्ठ गुणनखंड।** 51 को 21 से भाग देने पर भागफल $q = 2$ और शेषफल $r = 9$ है: $$51 = 21 \times 2 + 9$$ हमें दिखाना है: 51 और 21 का उभयनिष्ठ गुणनखंड शेषफल 9 का भी गुणनखंड है। 3 लो, जो 51 और 21 का उभयनिष्ठ गुणनखंड है। दोनों को 3 के गुणजों में लिखो: $$51 = 3 \times 17, \qquad 21 = 3 \times 7$$ शेषफल वह है जो दो 21 के बाद 51 में से बचता है: $$9 = 51 - 2 \times 21$$ 51 और 21 की जगह 3 के गुणज रखो, और 3 बाहर निकालो: $$\begin{aligned} 9 &= 3 \times 17 - 2 \times (3 \times 7) \\ &= 3 \times (17 - 14) \\ &= 3 \times 3 \end{aligned}$$ तो 3, 9 का गुणनखंड है।`,
      ),
    ),
    w.body(
      t(
        r`**In general.** We want to show: a common factor of $a$ and $b$ is also a factor of the remainder $r$. Take $h$, a common factor of $a$ and $b$. Write both as multiples of $h$: $$a = hx, \qquad b = hy$$ The remainder is what's left of $a$ after $q$ copies of $b$: $$r = a - qb$$ Replace $a$ and $b$ by their multiples of $h$, and take the $h$ out: $$\begin{aligned} r &= hx - q \times hy \\ &= h(x - qy) \end{aligned}$$ So $h$ is a factor of $r$. It works the other way too: a common factor of $b$ and $r$ is a factor of $a = qb + r$, in the same way. So $a, b$ and $b, r$ have the same common factors, and the same HCF:`,
        r`**व्यापक रूप में।** हमें दिखाना है: $a$ और $b$ का उभयनिष्ठ गुणनखंड शेषफल $r$ का भी गुणनखंड है। $h$ लो, जो $a$ और $b$ का उभयनिष्ठ गुणनखंड है। दोनों को $h$ के गुणजों में लिखो: $$a = hx, \qquad b = hy$$ शेषफल वह है जो $q$ बार $b$ के बाद $a$ में से बचता है: $$r = a - qb$$ $a$ और $b$ की जगह $h$ के गुणज रखो, और $h$ बाहर निकालो: $$\begin{aligned} r &= hx - q \times hy \\ &= h(x - qy) \end{aligned}$$ तो $h$, $r$ का गुणनखंड है। उल्टा भी सही है: $b$ और $r$ का उभयनिष्ठ गुणनखंड इसी तरह $a = qb + r$ का भी गुणनखंड है। तो $a, b$ और $b, r$ के उभयनिष्ठ गुणनखंड वही हैं, और HCF भी वही:`,
      ),
    ),
    w.definition(
      t(r`$$\text{HCF}(a, b) = \text{HCF}(b, r).$$`, r`$$\text{HCF}(a, b) = \text{HCF}(b, r).$$`),
    ),
    w.definition(
      t(
        r`**Euclid's division algorithm.** To find the HCF of $a$ and $b$, with $a$ the bigger, divide: $$a = bq + r$$ If the remainder $r$ is 0, the HCF is $b$. If not, do the same with $b$ and $r$.`,
        r`**यूक्लिड विभाजन एल्गोरिथ्म।** $a$ और $b$ का HCF ज्ञात करने के लिए, $a$ बड़ी, भाग दो: $$a = bq + r$$ यदि शेषफल $r$ शून्य है, तो HCF $b$ है। नहीं तो $b$ और $r$ के साथ यही करो।`,
      ),
    ),
    w.body(
      t(
        r`**It always stops.** Each remainder is smaller than the number divided by, so the remainders keep getting smaller, and they can't go below 0.`,
        r`**यह हमेशा रुकता है।** हर शेषफल भाजक से छोटा है, तो शेषफल छोटे होते जाते हैं, और 0 से नीचे नहीं जा सकते।`,
      ),
    ),
    space(),
  ]);
});

/** The sticks handed over: any two, written as divisions. */
const play = page("play", (b) => {
  const w = wordsOn(b);
  const sandbox = b.prop(stickMeasureDef, "sandbox", {
    stickA: 391,
    stickB: 323,
    isEditable: true,
    showDivision: true,
  });
  b.standsFor(sandbox, "a sandbox: any two sticks, Euclid's method written as divisions");
  return column([
    w.title(t("Try it yourself", "ख़ुद आज़माओ")),
    w.body(t("Set any two lengths and follow the method.", "कोई भी दो लंबाइयाँ रखो और तरीक़ा अपनाओ।")),
    sandbox,
    space(),
  ]);
});

/** Example: NCERT Example 1, HCF(4052, 12576), as the exam answer. */
const exampleBig = page("example-big", (b) => {
  const w = wordsOn(b);
  return column([
    w.title(t("Example", "उदाहरण")),
    w.body(
      t(
        "**Q.** Use Euclid's algorithm to find the HCF of 4052 and 12576.",
        "**प्र.** यूक्लिड एल्गोरिथ्म से 4052 और 12576 का HCF ज्ञात करो।",
      ),
    ),
    w.body(
      t(
        r`**A.** 12576 is the bigger number, so divide it by 4052. Then keep dividing the last divisor by the last remainder: $$\begin{aligned} 12576 &= 4052 \times 3 + 420 \\ 4052 &= 420 \times 9 + 272 \\ 420 &= 272 \times 1 + 148 \\ 272 &= 148 \times 1 + 124 \\ 148 &= 124 \times 1 + 24 \\ 124 &= 24 \times 5 + 4 \\ 24 &= 4 \times 6 + 0 \end{aligned}$$`,
        r`**उत्तर।** 12576 बड़ी संख्या है, तो उसे 4052 से भाग दो। फिर पिछले भाजक को पिछले शेषफल से भाग देते रहो: $$\begin{aligned} 12576 &= 4052 \times 3 + 420 \\ 4052 &= 420 \times 9 + 272 \\ 420 &= 272 \times 1 + 148 \\ 272 &= 148 \times 1 + 124 \\ 148 &= 124 \times 1 + 24 \\ 124 &= 24 \times 5 + 4 \\ 24 &= 4 \times 6 + 0 \end{aligned}$$`,
      ),
    ),
    w.body(
      t(
        "The remainder is now 0, so the last divisor is the HCF: **HCF(4052, 12576) = 4**.",
        "शेषफल अब 0 है, इसलिए आख़िरी भाजक HCF है: **HCF(4052, 12576) = 4**।",
      ),
    ),
    space(),
  ]);
});

/** Example: NCERT Example 2, the sweet seller. */
const exampleSweets = page("example-sweets", (b) => {
  const w = wordsOn(b);
  return column([
    w.title(t("Example", "उदाहरण")),
    w.body(
      t(
        "**Q.** A sweet seller has 420 kaju barfis and 130 badam barfis. She wants to stack them so that each stack has the same number of barfis, of one kind, and they take up the least area of the tray. How many barfis should go in each stack?",
        "**प्र.** एक मिठाई वाली के पास 420 काजू बर्फ़ी और 130 बादाम बर्फ़ी हैं। वह इन्हें ऐसे ढेरों में रखना चाहती है कि हर ढेर में एक ही तरह की और बराबर बर्फ़ियाँ हों, और ट्रे में सबसे कम जगह घिरे। हर ढेर में कितनी बर्फ़ियाँ हों?",
      ),
    ),
    w.body(
      t(
        r`**A.** Every stack takes up the same space on the tray, so least area means as few stacks as possible: each stack as big as possible. Each stack's size must divide 420 (the kaju stacks) and 130 (the badam stacks). So it is the HCF of 420 and 130.`,
        r`**उत्तर।** हर ढेर ट्रे पर उतनी ही जगह लेता है, तो कम से कम जगह यानी जितने कम हो सकें उतने ढेर: हर ढेर जितना बड़ा हो सके। ढेर का आकार 420 (काजू के ढेर) और 130 (बादाम के ढेर) दोनों को भाग दे। तो यह 420 और 130 का HCF है।`,
      ),
    ),
    w.body(
      t(
        r`$$\begin{aligned} 420 &= 130 \times 3 + 30 \\ 130 &= 30 \times 4 + 10 \\ 30 &= 10 \times 3 + 0 \end{aligned}$$ So HCF(420, 130) = 10: **10 barfis in each stack**, making 42 stacks of kaju and 13 of badam.`,
        r`$$\begin{aligned} 420 &= 130 \times 3 + 30 \\ 130 &= 30 \times 4 + 10 \\ 30 &= 10 \times 3 + 0 \end{aligned}$$ इसलिए HCF(420, 130) = 10: **हर ढेर में 10 बर्फ़ियाँ**, यानी काजू के 42 और बादाम के 13 ढेर।`,
      ),
    ),
    space(),
  ]);
});

/** The pages, in reading order. */
export const overview = [story, method, why, division, play, exampleBig, exampleSweets];

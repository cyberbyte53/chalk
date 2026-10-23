import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, multiChoiceQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import { DecimalExpansionSignal, decimalExpansionDef } from "@chalk/prop-decimal";
import {
  BillSplitAction,
  BillSplitSignal,
  TenMakerAction,
  TenMakerSignal,
  billSplitDef,
  tenMakerDef,
} from "@chalk/prop-primes";

const r = String.raw;

const sizes = [2, 3, 4, 5, 6, 7, 8, 9, 10];
/** The shares that don't terminate, as far as the feedback writes them. */
const neverShare: Record<number, string> = { 3: "33.33", 6: "16.66", 7: "14.2857", 9: "11.11" };
const never = (n: number, share: string) =>
  t(`₹100 ÷ ${n} = ₹${share}…: it doesn't terminate.`, `₹100 ÷ ${n} = ₹${share}…: यह सांत नहीं है।`);

/**
 * The hook: a ₹100 bill shared equally. Some group sizes give a share that ends (₹12.50), some never
 * do (₹33.33…). The student tries sizes 2 to 10, picks the ones that end, and spots what they share:
 * only 2s and 5s.
 */
const bill = page(
  "bill",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "Discover the pattern before the rule: ₹100 shared by 2, 4, 5, 8 or 10 friends gives a share that ends; by 3, 6, 7 or 9 it never ends. The sizes that end have no prime except 2 and 5.",
    );
    const split = b.prop(billSplitDef, "split", {
      sizes,
      words: {
        friends: t("{n} friends", "{n} दोस्त"),
        ends: t("terminates", "सांत"),
        repeats: t("doesn't terminate", "असांत"),
      },
    });
    b.standsFor(split, "a ₹100 bill shared equally by 2 to 10 friends, each share written out");
    b.witness(
      split.learner(BillSplitAction.Split, { n: 4 }),
      split.learner(BillSplitAction.Split, { n: 3 }),
    );
    const which = multiChoiceQuestion(b, {
      name: "which",
      prompt: t(
        "For which group sizes does each share terminate?",
        "किन समूहों के लिए हर हिस्सा सांत है?",
      ),
      options: sizes.map((n) => {
        const repeats = neverShare[n];
        return {
          id: `n${n}`,
          label: t(String(n), String(n)),
          ...(repeats === undefined ? {} : { feedback: never(n, repeats) }),
        };
      }),
      answers: ["n2", "n4", "n5", "n8", "n10"],
      missing: t(
        "Those terminate, but there are more. Try every size.",
        "ये सांत हैं, पर और भी हैं। हर समूह आज़माओ।",
      ),
      isHidden: true,
      passes: false,
    });
    const common = choiceQuestion(b, {
      name: "common",
      prompt: t("What do 2, 4, 5, 8 and 10 have in common?", "2, 4, 5, 8 और 10 में क्या साझा है?"),
      options: [
        {
          id: "right",
          label: t("Their only prime factors are 2 and 5", "उनके अभाज्य गुणनखंड केवल 2 और 5 हैं"),
        },
        {
          id: "even",
          label: t("They're even", "वे सम हैं"),
          feedback: t(
            "5 isn't even, and 6 is even but ₹100 ÷ 6 doesn't terminate.",
            "5 सम नहीं है, और 6 सम है पर ₹100 ÷ 6 सांत नहीं है।",
          ),
        },
        {
          id: "small",
          label: t("They're small", "वे छोटे हैं"),
          feedback: t(
            "3 is small too, and ₹100 ÷ 3 doesn't terminate.",
            "3 भी छोटा है, और ₹100 ÷ 3 सांत नहीं है।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
    });
    const next = w.note(
      t(
        r`2, 4, 5, 8 and 10 are made only of 2s and 5s. 3, 6, 7 and 9 each have another prime: $$\begin{aligned} \text{Terminate:} &\quad 2,\ 2^2,\ 5,\ 2^3,\ 2 \times 5 \\ \text{Don't:} &\quad 3,\ 2 \times 3,\ 7,\ 3^2 \end{aligned}$$ Why should that matter? That's next.`,
        r`2, 4, 5, 8 और 10 केवल 2 और 5 से बने हैं। 3, 6, 7 और 9 में कोई और अभाज्य है: $$\begin{aligned} \text{सांत:} &\quad 2,\ 2^2,\ 5,\ 2^3,\ 2 \times 5 \\ \text{असांत:} &\quad 3,\ 2 \times 3,\ 7,\ 3^2 \end{aligned}$$ इससे फ़र्क़ क्यों पड़ता है? आगे देखो।`,
      ),
      "next",
      { isHidden: true },
    );
    b.when(split.on(BillSplitSignal.Split), theBoard.show(which));
    b.when(which.on(QuestionSignal.Correct), theBoard.show(common));
    b.when(common.on(QuestionSignal.Correct), theBoard.show(next));
    return column([
      w.title(t("Decimal expansions", "दशमलव प्रसार")),
      w.body(
        t(
          "Riya and her friends get a bill of **₹100** and share it equally. Sometimes each share **terminates**, like ₹25.00. Sometimes it doesn't, like ₹33.33…",
          "रिया और उसके दोस्तों का **₹100** का बिल आता है और वे इसे बराबर बाँटते हैं। कभी हर हिस्सा **सांत** होता है, जैसे ₹25.00। कभी नहीं, जैसे ₹33.33…",
        ),
      ),
      w.body(t("Tap how many friends share it.", "दबाओ कितने दोस्त बाँटते हैं।")),
      split,
      which,
      common,
      next,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/**
 * The story: which fractions end as decimals, without dividing? A decimal that ends is a fraction over
 * a power of 10, and a power of 10 is a 2-tower and a 5-tower of equal height. 3/8 tops up to
 * 375/1000; 7/30 can't, because of its 3. The rule: in lowest terms, q = 2ⁿ5ᵐ.
 */
const story = page(
  "story",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "Both directions: a terminating decimal over 10ⁿ cancels down to a denominator of only 2s and 5s; a denominator of only 2s and 5s pairs into tens once the missing partners are added (3/8 = 375/1000). Any other prime (7/30's 3) has no partner, so it never terminates.",
    );
    const eight = b.prop(tenMakerDef, "eight", { numerator: 3, denominator: 8 });
    b.studentOnly(eight.action(TenMakerAction.TopUp));
    b.standsFor(eight, "3/8, its denominator as prime towers, topped up to a power of 10");
    b.witness(
      eight.learner(TenMakerAction.Cancel),
      eight.learner(TenMakerAction.Pair),
      eight.learner(TenMakerAction.TopUp),
    );
    const thirtyIntro = w.body(
      t(
        r`**If the denominator has any other prime, the decimal never terminates.** The 3 in 30 has no partner to make a ten: $$\frac{7}{30} = \frac{7}{2 \times 3 \times 5}$$`,
        r`**अगर हर में कोई और अभाज्य है, तो दशमलव कभी सांत नहीं होता।** 30 के 3 का दस बनाने वाला कोई साथी नहीं: $$\frac{7}{30} = \frac{7}{2 \times 3 \times 5}$$`,
      ),
      "thirtyIntro",
      { isHidden: true },
    );
    const thirty = b.prop(
      tenMakerDef,
      "thirty",
      { numerator: 7, denominator: 30 },
      { isHidden: true },
    );
    b.studentOnly(thirty.action(TenMakerAction.Pair));
    b.standsFor(thirty, "7/30, whose denominator has a 3 that no power of 10 holds");
    b.witness(thirty.learner(TenMakerAction.Cancel), thirty.learner(TenMakerAction.Pair));
    const why = choiceQuestion(b, {
      name: "why",
      prompt: t(
        r`Why can't $\frac{7}{30}$ be written over a power of 10?`,
        r`$\frac{7}{30}$ को 10 की घात पर क्यों नहीं लिखा जा सकता?`,
      ),
      options: [
        {
          id: "right",
          label: t("30 has a 3, and no power of 10 has a 3", "30 में 3 है, और 10 की किसी घात में 3 नहीं"),
        },
        {
          id: "seven",
          label: t("7 is prime", "7 अभाज्य है"),
          feedback: t(
            r`The top doesn't matter: $\frac{7}{40}$ terminates. Look at the towers below the bar.`,
            r`ऊपर वाली संख्या से फ़र्क़ नहीं पड़ता: $\frac{7}{40}$ सांत है। नीचे वाली के स्तंभ देखो।`,
          ),
        },
        {
          id: "big",
          label: t("30 is too big", "30 बहुत बड़ा है"),
          feedback: t(
            r`$\frac{1}{3125}$ has a much bigger denominator and still terminates, because 3125 is only 5s: $$3125 = 5^5$$`,
            r`$\frac{1}{3125}$ का हर बहुत बड़ा है फिर भी सांत है, क्योंकि 3125 केवल 5 से बना है: $$3125 = 5^5$$`,
          ),
        },
      ],
      answer: "right",
      isHidden: true,
    });
    const rule = w.definition(
      t(
        r`**Terminating decimals.** A fraction $\frac{p}{q}$ in lowest terms terminates exactly when $q$ has no prime other than 2 and 5: $$q = 2^n 5^m$$ Here $n$ or $m$ can be 0, as in $\frac{1}{5}$ or $\frac{3}{8}$.`,
        r`**सांत दशमलव।** न्यूनतम रूप में भिन्न $\frac{p}{q}$ ठीक तब सांत होती है जब $q$ में 2 और 5 के सिवा कोई अभाज्य न हो: $$q = 2^n 5^m$$ यहाँ $n$ या $m$ शून्य भी हो सकते हैं, जैसे $\frac{1}{5}$ या $\frac{3}{8}$ में।`,
      ),
      "rule",
      { isHidden: true },
    );
    const lowest = w.note(
      t(
        r`Cancel to lowest terms first. 15 has a 3, yet $\frac{6}{15}$ terminates, because the 3 cancels: $$\frac{6}{15} = \frac{2}{5} = 0.4$$`,
        r`पहले न्यूनतम रूप में लाओ। 15 में 3 है, फिर भी $\frac{6}{15}$ सांत है, क्योंकि 3 कट जाता है: $$\frac{6}{15} = \frac{2}{5} = 0.4$$`,
      ),
      "lowest",
      { isHidden: true },
    );
    b.when(eight.on(TenMakerSignal.ToppedUp), [theBoard.show(thirtyIntro), theBoard.show(thirty)]);
    b.when(thirty.on(TenMakerSignal.CantTopUp), theBoard.show(why));
    b.when(why.on(QuestionSignal.Correct), [theBoard.show(rule), theBoard.show(lowest)]);
    return column([
      w.title(t("Terminating decimals", "सांत दशमलव")),
      w.body(
        t(
          r`**If a decimal terminates, its denominator has only 2s and 5s.** A terminating decimal is a fraction over 10, 100, 1000, …, and these are made of 2s and 5s. Cancelling can only take some of them away: $$\begin{aligned} 0.375 &= \frac{375}{1000} \\ &= \frac{3 \times 5^3}{2^3 \times 5^3} \\ &= \frac{3}{2^3} \end{aligned}$$`,
          r`**अगर दशमलव सांत है, तो उसके हर में केवल 2 और 5 हैं।** सांत दशमलव 10, 100, 1000, … पर भिन्न है, और ये 2 और 5 से बने हैं। काटने से इनमें से कुछ ही हटते हैं: $$\begin{aligned} 0.375 &= \frac{375}{1000} \\ &= \frac{3 \times 5^3}{2^3 \times 5^3} \\ &= \frac{3}{2^3} \end{aligned}$$`,
        ),
      ),
      w.note(t("Cancelling only removes 2s and 5s.", "काटने से केवल 2 और 5 ही हटते हैं।")),
      w.body(
        t(
          r`**If the denominator has only 2s and 5s, the decimal terminates.** Give every 2 a 5 to make tens: $$\begin{aligned} \frac{3}{8} = \frac{3}{2^3} &= \frac{3 \times 5^3}{2^3 \times 5^3} \\ &= \frac{375}{1000} = 0.375 \end{aligned}$$`,
          r`**अगर हर में केवल 2 और 5 हैं, तो दशमलव सांत है।** हर 2 को एक 5 देकर दस बनाओ: $$\begin{aligned} \frac{3}{8} = \frac{3}{2^3} &= \frac{3 \times 5^3}{2^3 \times 5^3} \\ &= \frac{375}{1000} = 0.375 \end{aligned}$$`,
        ),
      ),
      w.body(
        t(
          r`Each 2 pairs with a 5 to make a ten: $$2 \times 5 = 10$$ Tap **Cancel**, **Pair into tens**, **Add 5s**.`,
          r`हर 2 एक 5 के साथ मिलकर दस बनाता है: $$2 \times 5 = 10$$ **काटो**, **दहाई में जोड़ो**, **5 जोड़ो** दबाओ।`,
        ),
      ),
      eight,
      thirtyIntro,
      thirty,
      why,
      rule,
      lowest,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/**
 * Why the rest repeat. Each long-division step depends only on the remainder; the clock draws the
 * path of remainders. 3/8's path reaches 0 and stops; 1/7's comes back to 1 and goes round the same
 * loop forever. With only q − 1 remainders, a path that never reaches 0 has to loop.
 */
const repeats = page(
  "repeats",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "See the remainders as a path: 3/8 goes 3 → 6 → 4 → 0 and stops (terminates); 1/7 goes 1 → 3 → 2 → 6 → 4 → 5 → 1 and, because each step depends only on the remainder, repeats the same loop forever. Only q − 1 remainders exist, so a path that never reaches 0 must loop.",
    );
    const eight = b.prop(decimalExpansionDef, "eight", {
      numerator: 3,
      denominator: 8,
      isClockShown: true,
    });
    b.standsFor(eight, "3 ÷ 8 by long division, its remainders as a path on a clock of 0 to 7");
    b.witness(...Array.from({ length: 3 }, () => eight.learner("nextDigit")));
    const zero = w.body(
      t(
        r`**The remainder reached 0, so the division stops.** $$\frac{3}{8} = 0.375$$ **Each step uses only the remainder.** The first step was: $$\underbrace{3}_{\text{remainder}} \times 10 = 8 \times \underbrace{3}_{\text{digit}} + \underbrace{6}_{\text{new remainder}}$$ So the next digit and the next remainder depend only on the remainder. Now try $\frac{1}{7}$:`,
        r`**शेषफल 0 हो गया, तो भाग रुक जाता है।** $$\frac{3}{8} = 0.375$$ **हर क़दम केवल शेषफल का उपयोग करता है।** पहला क़दम था: $$\underbrace{3}_{\text{शेषफल}} \times 10 = 8 \times \underbrace{3}_{\text{अंक}} + \underbrace{6}_{\text{नया शेषफल}}$$ तो अगला अंक और अगला शेषफल केवल शेषफल पर निर्भर करते हैं। अब $\frac{1}{7}$ आज़माओ:`,
      ),
      "zero",
      { isHidden: true },
    );
    const seven = b.prop(
      decimalExpansionDef,
      "seven",
      { numerator: 1, denominator: 7, isClockShown: true },
      { isHidden: true },
    );
    b.standsFor(seven, "1 ÷ 7 by long division, its remainders as a path on a clock of 0 to 6");
    b.witness(...Array.from({ length: 6 }, () => seven.learner("nextDigit")));
    const predict = choiceQuestion(b, {
      name: "predict",
      prompt: t(
        r`The remainder is 1 again, just as at the start of $1 \div 7$. What will the next digit of $\frac{1}{7}$ be?`,
        r`शेषफल फिर से 1 है, ठीक $1 \div 7$ की शुरुआत की तरह। $\frac{1}{7}$ का अगला अंक क्या होगा?`,
      ),
      options: [
        { id: "right", label: t("1", "1") },
        {
          id: "seven",
          label: t("7", "7"),
          feedback: t(
            r`The next digit comes only from the remainder. From remainder 1, you get digit 1 and remainder 3, just like the first step: $$10 = 7 \times 1 + 3$$`,
            r`अगला अंक केवल शेषफल से आता है। शेषफल 1 से अंक 1 और शेषफल 3 मिलते हैं, बिल्कुल पहले क़दम की तरह: $$10 = 7 \times 1 + 3$$`,
          ),
        },
        {
          id: "cant",
          label: t("Can't tell", "नहीं कह सकते"),
          feedback: t(
            r`You can. The next digit comes only from the remainder. From remainder 1, you get digit 1 and remainder 3, just like the first step: $$10 = 7 \times 1 + 3$$`,
            r`बता सकते हो। अगला अंक केवल शेषफल से आता है। शेषफल 1 से अंक 1 और शेषफल 3 मिलते हैं, बिल्कुल पहले क़दम की तरह: $$10 = 7 \times 1 + 3$$`,
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const loop = w.body(
      t(
        r`**The remainder is 1 again, so the same digits come again.** $$\frac{1}{7} = 0.\overline{142857}$$`,
        r`**शेषफल फिर 1 है, तो फिर वही अंक आते हैं।** $$\frac{1}{7} = 0.\overline{142857}$$`,
      ),
      "loop",
      { isHidden: true },
    );
    const back = choiceQuestion(b, {
      name: "back",
      prompt: t(
        "Why did 1/7's path have to come back to a remainder it had seen?",
        "1/7 का रास्ता किसी देखे हुए शेषफल पर लौटना ही क्यों था?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "It never reached 0, and only 1 to 6 are possible",
            "वह कभी 0 पर नहीं पहुँचा, और केवल 1 से 6 संभव हैं",
          ),
        },
        {
          id: "prime",
          label: t("Because 7 is prime", "क्योंकि 7 अभाज्य है"),
          feedback: t(
            r`$\frac{1}{6}$ loops too, and 6 isn't prime. It's about how many remainders there are.`,
            r`$\frac{1}{6}$ भी चक्कर लगाता है, और 6 अभाज्य नहीं। बात यह है कि शेषफल कितने हो सकते हैं।`,
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const rule = w.definition(
      t(
        r`**Repeating decimals.** Take $\frac{p}{q}$ in lowest terms, where $q$ has a prime other than 2 and 5. It can't terminate, so the remainder never reaches 0. The only other remainders are 1, 2, and so on up to $q - 1$, so one of them comes back, and from there the digits repeat: **non-terminating repeating**.`,
        r`**आवर्ती दशमलव।** न्यूनतम रूप में $\frac{p}{q}$ लो, जहाँ $q$ में 2 और 5 के सिवा कोई अभाज्य है। यह सांत नहीं हो सकता, तो शेषफल कभी 0 नहीं होता। बाक़ी शेषफल केवल 1, 2, … से $q - 1$ तक हैं, तो उनमें से कोई लौट आता है, और वहाँ से अंक दोहराते हैं: **असांत आवर्ती**।`,
      ),
      "rule",
      { isHidden: true },
    );
    const tryOwn = w.body(
      t(
        "Try your own fraction: type p and q, tap the division, and see where the path goes.",
        "अपनी भिन्न आज़माओ: p और q लिखो, भाग पर टैप करो, और देखो रास्ता कहाँ जाता है।",
      ),
      "tryOwn",
      { isHidden: true },
    );
    const own = b.prop(
      decimalExpansionDef,
      "own",
      { numerator: 5, denominator: 12, isClockShown: true, isEditable: true },
      { isHidden: true },
    );
    b.standsFor(own, "a sandbox: any p ÷ q by long division, with the path of remainders");
    b.when(eight.on(DecimalExpansionSignal.Ended), [theBoard.show(zero), theBoard.show(seven)]);
    b.when(seven.on(DecimalExpansionSignal.Repeated), theBoard.show(predict));
    b.when(predict.on(QuestionSignal.Correct), [theBoard.show(loop), theBoard.show(back)]);
    b.when(back.on(QuestionSignal.Correct), [
      theBoard.show(rule),
      theBoard.show(tryOwn),
      theBoard.show(own),
      theBoard.pass(),
    ]);
    return column([
      w.title(t("Repeating decimals", "आवर्ती दशमलव")),
      w.body(
        t(
          r`**Do the digits follow a pattern?** We saw that $\frac{7}{30}$ never terminates, and neither does $\frac{1}{7}$. Long division shows what their digits do. Each step of the division gives a digit and a remainder; the clock marks each remainder, with an arrow per step.`,
          r`**क्या अंक किसी पैटर्न पर चलते हैं?** हमने देखा कि $\frac{7}{30}$ कभी सांत नहीं होता, और $\frac{1}{7}$ भी नहीं। लंबा भाग दिखाता है कि उनके अंक क्या करते हैं। भाग का हर क़दम एक अंक और एक शेषफल देता है; घड़ी हर शेषफल दिखाती है, हर क़दम पर एक तीर।`,
        ),
      ),
      w.body(
        t(
          r`Start with one that ends. Tap the division for $\frac{3}{8}$.`,
          r`एक ऐसी भिन्न से शुरू करो जो सांत है। $\frac{3}{8}$ के लिए भाग पर टैप करो।`,
        ),
      ),
      eight,
      zero,
      seven,
      predict,
      loop,
      back,
      rule,
      tryOwn,
      own,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Writing the decimal: 13/3125 and 17/8 (NCERT Example and Ex 1.4 Q2). */
const writing = page("writing", (b) => {
  const w = wordsOn(b);
  return column([
    w.title(t("Example", "उदाहरण")),
    w.body(
      t(
        r`**Q.** Write $\frac{13}{3125}$ as a decimal without dividing.`,
        r`**प्र.** बिना भाग दिए $\frac{13}{3125}$ को दशमलव में लिखो।`,
      ),
    ),
    w.body(
      t(
        r`**A.** 3125 is made only of 5s, so give it the same number of 2s to make tens. Multiply top and bottom by $2^5$: $$\begin{aligned} \frac{13}{3125} = \frac{13}{5^5} &= \frac{13 \times 2^5}{2^5 \times 5^5} \\ &= \frac{416}{10^5} = 0.00416 \end{aligned}$$`,
        r`**उत्तर।** 3125 केवल 5 से बना है, तो दस बनाने के लिए उतने ही 2 दो। ऊपर और नीचे $2^5$ से गुणा करो: $$\begin{aligned} \frac{13}{3125} = \frac{13}{5^5} &= \frac{13 \times 2^5}{2^5 \times 5^5} \\ &= \frac{416}{10^5} = 0.00416 \end{aligned}$$`,
      ),
    ),
    w.body(
      t(
        r`The taller tower decides the number of decimal places. 8 has three 2s, so $\frac{17}{8}$ has three places: $$\frac{17}{8} = \frac{17}{2^3} = \frac{17 \times 5^3}{10^3} = 2.125$$`,
        r`ऊँचा स्तंभ दशमलव स्थानों की संख्या तय करता है। 8 में तीन 2 हैं, तो $\frac{17}{8}$ में तीन स्थान हैं: $$\frac{17}{8} = \frac{17}{2^3} = \frac{17 \times 5^3}{10^3} = 2.125$$`,
      ),
    ),
    space(),
  ]);
});

/** Reading a decimal backwards: three kinds (NCERT Ex 1.4 Q3). */
const reading = page("reading", (b) => {
  const w = wordsOn(b);
  return column([
    w.title(t("Reading a decimal", "दशमलव को पढ़ना")),
    w.body(
      t(
        r`**Terminates** $$43.123456789 = \frac{43123456789}{10^9}$$ It's rational, and in lowest terms its denominator has only 2s and 5s.`,
        r`**सांत** $$43.123456789 = \frac{43123456789}{10^9}$$ यह परिमेय है, और न्यूनतम रूप में इसके हर में केवल 2 और 5 हैं।`,
      ),
    ),
    w.body(
      t(
        r`**Repeats** $$43.\overline{123456789}$$ It's rational too (every repeating decimal can be written as a fraction; you saw how in Class 9), but its denominator has a prime other than 2 and 5.`,
        r`**आवर्ती** $$43.\overline{123456789}$$ यह भी परिमेय है (हर आवर्ती दशमलव को भिन्न के रूप में लिखा जा सकता है; कैसे, यह तुमने कक्षा 9 में देखा), पर इसके हर में 2 और 5 के सिवा कोई अभाज्य है।`,
      ),
    ),
    w.body(
      t(
        r`**Neither** $$0.120120012000120000\ldots$$ It never terminates and never repeats, so it can't be a fraction: it's **irrational**.`,
        r`**दोनों नहीं** $$0.120120012000120000\ldots$$ यह न सांत है, न आवर्ती, तो यह भिन्न नहीं हो सकता: यह **अपरिमेय** है।`,
      ),
    ),
    space(),
  ]);
});

/** The ten-maker handed over: any fraction. */
const play = page("play", (b) => {
  const w = wordsOn(b);
  const maker = b.prop(tenMakerDef, "sandbox", { numerator: 7, denominator: 40, isEditable: true });
  b.standsFor(maker, "a sandbox: any fraction, its denominator as towers, topped up if it can be");
  return column([
    w.title(t("Try it yourself", "ख़ुद आज़माओ")),
    w.body(
      t(
        "Type any fraction and follow the buttons: cancel, pair into tens, add the missing partners.",
        "कोई भी भिन्न लिखो और बटन दबाते चलो: काटो, दहाई में जोड़ो, कम साथी जोड़ो।",
      ),
    ),
    maker,
    space(),
  ]);
});

/** The pages, in reading order. */
export const overview = [bill, story, repeats, writing, reading, play];

import { page, t } from "@chalk/author";
import { choice, multiChoiceQuestion, wordsOn } from "@chalk/patterns";
import { decimalExpansionDef } from "@chalk/prop-decimal";
import { billSplitDef, tenMakerDef } from "@chalk/prop-primes";

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
const bill = page("bill", (b) => {
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
  b.witness(split.learner.split({ n: 4 }), split.learner.split({ n: 3 }));
  const which = multiChoiceQuestion(b, {
    name: "which",
    prompt: t("For which group sizes does each share terminate?", "किन समूहों के लिए हर हिस्सा सांत है?"),
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
  });
  const common = choice(b, {
    name: "common",
    prompt: t(
      "What do 2, 4, 5, 8 and 10 have that 3, 6, 7 and 9 don't?",
      "2, 4, 5, 8 और 10 में ऐसा क्या है जो 3, 6, 7 और 9 में नहीं?",
    ),
    right: t("Their only prime factors are 2 and 5", "उनके अभाज्य गुणनखंड केवल 2 और 5 हैं"),
    wrong: {
      hundred: {
        label: t("Each of them divides 100 exactly", "हर एक 100 को पूरा-पूरा भाग देता है"),
        feedback: t(
          "8 doesn't: 100 ÷ 8 = 12.5. Yet ₹100 ÷ 8 = ₹12.50 terminates.",
          "8 नहीं देता: 100 ÷ 8 = 12.5। फिर भी ₹100 ÷ 8 = ₹12.50 सांत है।",
        ),
      },
      three: {
        label: t("None of them has 3 as a factor", "उनमें से किसी का गुणनखंड 3 नहीं है"),
        feedback: t(
          "7 has no 3 either, yet ₹100 ÷ 7 = ₹14.2857… doesn't terminate.",
          "7 में भी 3 नहीं है, फिर भी ₹100 ÷ 7 = ₹14.2857… सांत नहीं है।",
        ),
      },
    },
  });
  const next = w.note(
    t(
      r`2, 4, 5, 8 and 10 are made only of 2s and 5s. 3, 6, 7 and 9 each have another prime: $$\begin{aligned} \text{Terminate:} &\quad 2,\ 2^2,\ 5,\ 2^3,\ 2 \times 5 \\ \text{Don't:} &\quad 3,\ 2 \times 3,\ 7,\ 3^2 \end{aligned}$$ Why should that matter? That's next.`,
      r`2, 4, 5, 8 और 10 केवल 2 और 5 से बने हैं। 3, 6, 7 और 9 में कोई और अभाज्य है: $$\begin{aligned} \text{सांत:} &\quad 2,\ 2^2,\ 5,\ 2^3,\ 2 \times 5 \\ \text{असांत:} &\quad 3,\ 2 \times 3,\ 7,\ 3^2 \end{aligned}$$ इससे फ़र्क़ क्यों पड़ता है? आगे देखो।`,
    ),
    "next",
  );
  b.after(split.on.split, which);
  b.after(which, common);
  b.after(common, next);
  return [
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
  ];
});

/**
 * The story: which fractions end as decimals, without dividing? A decimal that ends is a fraction over
 * a power of 10, and a power of 10 is a 2-tower and a 5-tower of equal height. 3/8 tops up to
 * 375/1000; 7/30 can't, because of its 3. The rule: in lowest terms, q = 2ⁿ5ᵐ.
 */
const story = page("story", (b) => {
  const w = wordsOn(b);
  b.purpose(
    "Both directions: a terminating decimal over 10ⁿ cancels down to a denominator of only 2s and 5s; a denominator of only 2s and 5s pairs into tens once the missing partners are added (3/8 = 375/1000). Any other prime (7/30's 3) has no partner, so it never terminates.",
  );
  const eight = b.prop(tenMakerDef, "eight", { numerator: 3, denominator: 8 });
  b.standsFor(eight, "3/8, its denominator as prime towers, topped up to a power of 10");
  b.witness(eight.learner.cancel(), eight.learner.pair(), eight.learner.topUp());
  const thirtyIntro = w.body(
    t(
      r`**If the denominator has any other prime, the decimal never terminates.** The 3 in 30 has no partner to make a ten: $$\frac{7}{30} = \frac{7}{2 \times 3 \times 5}$$`,
      r`**अगर हर में कोई और अभाज्य है, तो दशमलव कभी सांत नहीं होता।** 30 के 3 का दस बनाने वाला कोई साथी नहीं: $$\frac{7}{30} = \frac{7}{2 \times 3 \times 5}$$`,
    ),
    "thirtyIntro",
  );
  const thirty = b.prop(tenMakerDef, "thirty", { numerator: 7, denominator: 30 });
  b.standsFor(thirty, "7/30, whose denominator has a 3 that no power of 10 holds");
  b.witness(thirty.learner.cancel(), thirty.learner.pair());
  const why = choice(b, {
    name: "why",
    prompt: t(
      r`Why can't $\frac{7}{30}$ be written over a power of 10?`,
      r`$\frac{7}{30}$ को 10 की घात पर क्यों नहीं लिखा जा सकता?`,
    ),
    right: t("30 has a 3, and no power of 10 has one", "30 में 3 है, और 10 की किसी घात में 3 नहीं"),
    wrong: {
      common: {
        label: t("7 and 30 share no factor other than 1", "7 और 30 का 1 के सिवा कोई सार्व गुणनखंड नहीं"),
        feedback: t(
          r`So do 7 and 40, and $\frac{7}{40}$ terminates: $$\frac{7}{40} = \frac{175}{1000} = 0.175$$`,
          r`7 और 40 का भी नहीं, और $\frac{7}{40}$ सांत है: $$\frac{7}{40} = \frac{175}{1000} = 0.175$$`,
        ),
      },
      power: {
        label: t("30 isn't itself a power of 10", "30 ख़ुद 10 की घात नहीं है"),
        feedback: t(
          r`Neither is 8, yet $\frac{3}{8}$ became $\frac{375}{1000}$. Look at the towers below the bar.`,
          r`8 भी नहीं है, फिर भी $\frac{3}{8}$, $\frac{375}{1000}$ बन गया। नीचे वाली संख्या के स्तंभ देखो।`,
        ),
      },
    },
  });
  const rule = w.definition(
    t(
      r`**Terminating decimals.** A fraction $\frac{p}{q}$ in lowest terms terminates exactly when $q$ has no prime other than 2 and 5: $$q = 2^n 5^m$$ Here $n$ or $m$ can be 0, as in $\frac{1}{5}$ or $\frac{3}{8}$.`,
      r`**सांत दशमलव।** न्यूनतम रूप में भिन्न $\frac{p}{q}$ ठीक तब सांत होती है जब $q$ में 2 और 5 के सिवा कोई अभाज्य न हो: $$q = 2^n 5^m$$ यहाँ $n$ या $m$ शून्य भी हो सकते हैं, जैसे $\frac{1}{5}$ या $\frac{3}{8}$ में।`,
    ),
    "rule",
  );
  const lowest = w.note(
    t(
      r`Cancel to lowest terms first. 15 has a 3, yet $\frac{6}{15}$ terminates, because the 3 cancels: $$\frac{6}{15} = \frac{2}{5} = 0.4$$`,
      r`पहले न्यूनतम रूप में लाओ। 15 में 3 है, फिर भी $\frac{6}{15}$ सांत है, क्योंकि 3 कट जाता है: $$\frac{6}{15} = \frac{2}{5} = 0.4$$`,
    ),
    "lowest",
  );
  b.after(eight.on.toppedUp, [thirtyIntro, thirty]);
  b.after(thirty.on.cantTopUp, why);
  b.after(why, [rule, lowest]);
  return [
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
  ];
});

/**
 * Why the rest repeat. Each long-division step depends only on the remainder; the clock draws the
 * path of remainders. 3/8's path reaches 0 and stops; 1/7's comes back to 1 and goes round the same
 * loop forever.
 */
const repeats = page("repeats", (b) => {
  const w = wordsOn(b);
  b.purpose(
    "See the remainders as a path: 3/8 goes 3 → 6 → 4 → 0 and stops (terminates); 1/7 goes 1 → 3 → 2 → 6 → 4 → 5 → 1 and, because each step depends only on the remainder, repeats the same loop forever.",
  );
  const eight = b.prop(decimalExpansionDef, "eight", {
    numerator: 3,
    denominator: 8,
    isClockShown: true,
  });
  b.standsFor(eight, "3 ÷ 8 by long division, its remainders as a path on a clock of 0 to 7");
  b.witness(...Array.from({ length: 3 }, () => eight.learner.nextDigit()));
  const zero = w.body(
    t(
      r`**The remainder reached 0, so the division stops.** $$\frac{3}{8} = 0.375$$ **Each step uses only the remainder.** The first step was: $$\underbrace{3}_{\text{remainder}} \times 10 = 8 \times \underbrace{3}_{\text{digit}} + \underbrace{6}_{\text{new remainder}}$$ So the next digit and the next remainder depend only on the remainder. Now try $\frac{1}{7}$:`,
      r`**शेषफल 0 हो गया, तो भाग रुक जाता है।** $$\frac{3}{8} = 0.375$$ **हर क़दम केवल शेषफल का उपयोग करता है।** पहला क़दम था: $$\underbrace{3}_{\text{शेषफल}} \times 10 = 8 \times \underbrace{3}_{\text{अंक}} + \underbrace{6}_{\text{नया शेषफल}}$$ तो अगला अंक और अगला शेषफल केवल शेषफल पर निर्भर करते हैं। अब $\frac{1}{7}$ आज़माओ:`,
    ),
    "zero",
  );
  const seven = b.prop(decimalExpansionDef, "seven", {
    numerator: 1,
    denominator: 7,
    isClockShown: true,
  });
  b.standsFor(seven, "1 ÷ 7 by long division, its remainders as a path on a clock of 0 to 6");
  b.witness(...Array.from({ length: 6 }, () => seven.learner.nextDigit()));
  const predict = choice(b, {
    name: "predict",
    prompt: t(
      r`The remainder is 1 again, just as at the start of $1 \div 7$. What will the next digit of $\frac{1}{7}$ be?`,
      r`शेषफल फिर से 1 है, ठीक $1 \div 7$ की शुरुआत की तरह। $\frac{1}{7}$ का अगला अंक क्या होगा?`,
    ),
    right: t("1", "1"),
    wrong: {
      seven: {
        label: t("7", "7"),
        feedback: t(
          r`The next digit comes only from the remainder. From remainder 1, you get digit 1 and remainder 3, just like the first step: $$10 = 7 \times 1 + 3$$`,
          r`अगला अंक केवल शेषफल से आता है। शेषफल 1 से अंक 1 और शेषफल 3 मिलते हैं, बिल्कुल पहले क़दम की तरह: $$10 = 7 \times 1 + 3$$`,
        ),
      },
      cant: {
        label: t("Can't tell", "नहीं कह सकते"),
        feedback: t(
          r`You can. The next digit comes only from the remainder. From remainder 1, you get digit 1 and remainder 3, just like the first step: $$10 = 7 \times 1 + 3$$`,
          r`बता सकते हो। अगला अंक केवल शेषफल से आता है। शेषफल 1 से अंक 1 और शेषफल 3 मिलते हैं, बिल्कुल पहले क़दम की तरह: $$10 = 7 \times 1 + 3$$`,
        ),
      },
    },
  });
  const loop = w.body(
    t(
      r`**The remainder is 1 again, so the same digits come again.** $$\frac{1}{7} = 0.\overline{142857}$$`,
      r`**शेषफल फिर 1 है, तो फिर वही अंक आते हैं।** $$\frac{1}{7} = 0.\overline{142857}$$`,
    ),
    "loop",
  );
  b.after(eight.on.ended, [zero, seven]);
  b.after(seven.on.repeated, predict);
  b.after(predict, loop);
  return [
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
  ];
});

/**
 * Why a path that never reaches 0 has to loop: dividing by q, the only remainders are 0 to q − 1. If
 * 0 never comes, one of the other q − 1 comes back, and from there the digits repeat. Then a sandbox.
 */
const whyRepeats = page("why-repeats", (b) => {
  const w = wordsOn(b);
  b.purpose(
    "The pigeonhole reason: dividing by 7, the remainders can only be 0 to 6. 1/7 never reaches 0, so within 6 steps a remainder comes back, and the digits repeat from there. In general only q − 1 non-zero remainders exist, so a fraction that doesn't terminate repeats.",
  );
  const back = choice(b, {
    name: "back",
    prompt: t(
      r`Why did the path of $1 \div 7$ have to come back to a remainder it had seen?`,
      r`$1 \div 7$ का रास्ता किसी देखे हुए शेषफल पर लौटना ही क्यों था?`,
    ),
    right: t(
      "It never hit 0, and only 1 to 6 can be remainders",
      "वह कभी 0 पर नहीं पहुँचा, और शेषफल केवल 1 से 6 हो सकते हैं",
    ),
    wrong: {
      prime: {
        label: t(
          "7 is prime, and dividing by a prime always repeats",
          "7 अभाज्य है, और अभाज्य से भाग हमेशा दोहराता है",
        ),
        feedback: t(
          r`5 is prime, but $\frac{1}{5} = 0.2$ stops. And $\frac{1}{6}$ repeats, though 6 isn't prime. It's about how many remainders there can be.`,
          r`5 अभाज्य है, पर $\frac{1}{5} = 0.2$ रुक जाता है। और $\frac{1}{6}$ दोहराता है, जबकि 6 अभाज्य नहीं। बात यह है कि शेषफल कितने हो सकते हैं।`,
        ),
      },
      start: {
        label: t(
          "Every division comes back to the remainder it began with",
          "हर भाग उसी शेषफल पर लौटता है जिससे वह शुरू हुआ",
        ),
        feedback: t(
          r`$\frac{3}{8}$ never came back: it reached 0 and stopped. And $\frac{1}{6} = 0.1\overline{6}$ comes back to 4, not to 1.`,
          r`$\frac{3}{8}$ कभी नहीं लौटा: वह 0 पर पहुँचकर रुक गया। और $\frac{1}{6} = 0.1\overline{6}$, 4 पर लौटता है, 1 पर नहीं।`,
        ),
      },
    },
  });
  const rule = w.definition(
    t(
      r`**Repeating decimals.** Take $\frac{p}{q}$ in lowest terms, where $q$ has a prime other than 2 and 5. It can't terminate, so the remainder never reaches 0. The only other remainders are 1, 2, and so on up to $q - 1$, so one of them comes back, and from there the digits repeat: **non-terminating repeating**.`,
      r`**आवर्ती दशमलव।** न्यूनतम रूप में $\frac{p}{q}$ लो, जहाँ $q$ में 2 और 5 के सिवा कोई अभाज्य है। यह सांत नहीं हो सकता, तो शेषफल कभी 0 नहीं होता। बाक़ी शेषफल केवल 1, 2, … से $q - 1$ तक हैं, तो उनमें से कोई लौट आता है, और वहाँ से अंक दोहराते हैं: **असांत आवर्ती**।`,
    ),
    "rule",
  );
  const tryOwn = w.body(
    t(
      "Try your own fraction: type p and q, tap the division, and see where the path goes.",
      "अपनी भिन्न आज़माओ: p और q लिखो, भाग पर टैप करो, और देखो रास्ता कहाँ जाता है।",
    ),
    "tryOwn",
  );
  const own = b.prop(decimalExpansionDef, "own", {
    numerator: 5,
    denominator: 12,
    isClockShown: true,
    isEditable: true,
  });
  b.standsFor(own, "a sandbox: any p ÷ q by long division, with the path of remainders");
  b.after(back, [rule, tryOwn, own]);
  return [
    w.title(t("Why the digits repeat", "अंक क्यों दोहराते हैं")),
    w.body(
      t(
        r`Dividing 1 by 7 gave these remainders, and then the same ones again: $$1 \to 3 \to 2 \to 6 \to 4 \to 5 \to 1$$ A remainder is always less than the divisor, so dividing by 7 it can only be 0, 1, 2, 3, 4, 5 or 6.`,
        r`1 को 7 से भाग देने पर ये शेषफल आए, और फिर वही दोबारा: $$1 \to 3 \to 2 \to 6 \to 4 \to 5 \to 1$$ शेषफल हमेशा भाजक से छोटा होता है, तो 7 से भाग देने पर वह केवल 0, 1, 2, 3, 4, 5 या 6 हो सकता है।`,
      ),
    ),
    back,
    rule,
    tryOwn,
    own,
  ];
});

/** Writing the decimal: 13/3125 and 17/8 (NCERT Example and Ex 1.4 Q2). */
const writing = page("writing", (b) => {
  const w = wordsOn(b);
  return [
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
  ];
});

/** Reading a decimal backwards: three kinds (NCERT Ex 1.4 Q3). */
const reading = page("reading", (b) => {
  const w = wordsOn(b);
  return [
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
  ];
});

/** The ten-maker handed over: any fraction. */
const play = page("play", (b) => {
  const w = wordsOn(b);
  const maker = b.prop(tenMakerDef, "sandbox", { numerator: 7, denominator: 40, isEditable: true });
  b.standsFor(maker, "a sandbox: any fraction, its denominator as towers, topped up if it can be");
  return [
    w.title(t("Try it yourself", "ख़ुद आज़माओ")),
    w.body(
      t(
        "Type any fraction and follow the buttons: cancel, pair into tens, add the missing partners.",
        "कोई भी भिन्न लिखो और बटन दबाते चलो: काटो, दहाई में जोड़ो, कम साथी जोड़ो।",
      ),
    ),
    maker,
  ];
});

/** The pages, in reading order. */
export const overview = [bill, story, repeats, whyRepeats, writing, reading, play];

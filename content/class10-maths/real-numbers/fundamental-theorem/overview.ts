import { page, t } from "@chalk/author";
import { choice, wordsOn } from "@chalk/patterns";
import { factorTreeDef, primeTowersDef } from "@chalk/prop-primes";

const r = String.raw;

/**
 * The story: Riya and Aman both break 360 down to primes, starting differently, and disagree about
 * whether they'll end with the same numbers. The learner finishes both trees and settles it: the
 * same primes. Then the theorem, and why the splitting always ends.
 */
const story = page("story", (b) => {
  const w = wordsOn(b);
  b.purpose(
    "Settle Riya and Aman's argument: 360 split from 10 × 36 and from 8 × 45 ends in the same primes, 2, 2, 2, 3, 3, 5. That is the Fundamental Theorem of Arithmetic: every composite number is a product of primes in exactly one way, apart from order.",
  );
  const riya = b.prop(factorTreeDef, "riya", {
    number: 360,
    splits: [{ node: "r", factor: 10 }],
  });
  b.standsFor(riya, "Riya's tree: 360 split first as 10 × 36");
  const pick = (on: typeof riya, node: string, factor: number) => [
    on.learner.select({ node }),
    on.learner.split({ node, factor }),
  ];
  b.witness(
    ...pick(riya, "r0", 2),
    ...pick(riya, "r1", 6),
    ...pick(riya, "r10", 2),
    ...pick(riya, "r11", 2),
  );
  const unsplit = choice(b, {
    name: "unsplit",
    prompt: t("2, 3 and 5 can't be split any more. Why?", "2, 3 और 5 को और नहीं तोड़ा जा सकता। क्यों?"),
    right: t("Each has no factors but 1 and itself", "हर एक के गुणनखंड केवल 1 और वह ख़ुद हैं"),
    wrong: {
      divide: {
        label: t("Each one divides 360 exactly", "हर एक 360 को पूरा-पूरा भाग देता है"),
        feedback: t(
          r`10 divides 360 too, but it splits: $$10 = 2 \times 5$$`,
          r`10 भी 360 को भाग देता है, पर वह टूटता है: $$10 = 2 \times 5$$`,
        ),
      },
      small: {
        label: t("Each one is smaller than 6", "हर एक 6 से छोटा है"),
        feedback: t(
          r`4 is smaller than 6 too, but it splits: $$4 = 2 \times 2$$`,
          r`4 भी 6 से छोटा है, पर वह टूटता है: $$4 = 2 \times 2$$`,
        ),
      },
    },
  });
  const primeIs = w.definition(
    t(
      "A number whose only factors are 1 and itself is a **prime**. So every tree ends in primes.",
      "जिस संख्या के गुणनखंड केवल 1 और वह ख़ुद हों, वह **अभाज्य** है। तो हर पेड़ अभाज्यों पर ख़त्म होता है।",
    ),
    "primeIs",
  );
  const amanIntro = w.body(
    t(
      r`Now Aman's tree. He started with $8 \times 45$.`,
      r`अब अमन का पेड़। उसने $8 \times 45$ से शुरू किया।`,
    ),
    "amanIntro",
  );
  const aman = b.prop(factorTreeDef, "aman", {
    number: 360,
    splits: [{ node: "r", factor: 8 }],
  });
  b.standsFor(aman, "Aman's tree: 360 split first as 8 × 45");
  b.witness(
    ...pick(aman, "r0", 2),
    ...pick(aman, "r01", 2),
    ...pick(aman, "r1", 3),
    ...pick(aman, "r11", 3),
  );
  const who = choice(b, {
    name: "who",
    prompt: t("Who was right?", "कौन सही था?"),
    right: t("Aman: the same primes", "अमन: वही अभाज्य"),
    wrong: {
      riya: {
        label: t("Riya: different primes", "रिया: अलग अभाज्य"),
        feedback: t(
          "The trees look different, but look at the primes at the ends: three 2s, two 3s and a 5 in both.",
          "पेड़ अलग दिखते हैं, पर सिरों के अभाज्य देखो: दोनों में तीन 2, दो 3 और एक 5।",
        ),
      },
      neither: {
        label: t("Neither: some primes match, some don't", "कोई नहीं: कुछ अभाज्य मिलते हैं, कुछ नहीं"),
        feedback: t(
          "Count each prime in both trees: three 2s, two 3s and a 5 every time.",
          "दोनों पेड़ों में हर अभाज्य गिनो: हर बार तीन 2, दो 3 और एक 5।",
        ),
      },
    },
  });
  const theorem = w.definition(
    t(
      r`**The Fundamental Theorem of Arithmetic.** Every composite number (a number bigger than 1 that isn't prime) can be written as a product of primes, and this factorisation is **unique**, apart from the order of the primes. $$360 = 2^3 \times 3^2 \times 5$$`,
      r`**अंकगणित की आधारभूत प्रमेय।** प्रत्येक भाज्य संख्या (1 से बड़ी संख्या जो अभाज्य नहीं है) को अभाज्य संख्याओं के गुणनफल के रूप में लिखा जा सकता है, और यह गुणनखंडन, अभाज्यों के क्रम को छोड़कर, **अद्वितीय** होता है। $$360 = 2^3 \times 3^2 \times 5$$`,
    ),
    "theorem",
  );
  const why = w.body(
    t(
      r`**Always stops:** each split gives smaller numbers, and they can't keep getting smaller forever. **Same primes every time:** you saw it for 360. It has been proved for every number; the proof comes in higher classes.`,
      r`**हमेशा रुकता है:** हर विभाजन छोटी संख्याएँ देता है, और वे हमेशा छोटी नहीं होती रह सकतीं। **हर बार वही अभाज्य:** तुमने 360 के लिए देखा। यह हर संख्या के लिए सिद्ध है; उपपत्ति आगे की कक्षाओं में आती है।`,
    ),
    "why",
  );
  b.after(riya.on.completed, unsplit);
  b.after(unsplit, [primeIs, amanIntro, aman]);
  b.after(aman.on.completed, who);
  b.after(who, [theorem, why]);
  return [
    w.title(t("The Fundamental Theorem of Arithmetic", "अंकगणित की आधारभूत प्रमेय")),
    w.body(
      t(
        "Riya and Aman play a game: take 360, split it into two factors, and keep splitting until nothing splits any more.",
        "रिया और अमन एक खेल खेलते हैं: 360 लो, उसे दो गुणनखंडों में तोड़ो, और तब तक तोड़ते रहो जब तक कुछ और न टूटे।",
      ),
    ),
    w.body(
      t(
        r`Riya starts with $10 \times 36$, Aman with $8 \times 45$.`,
        r`रिया $10 \times 36$ से शुरू करती है, अमन $8 \times 45$ से।`,
      ),
    ),
    w.body(
      t(
        `**Riya:** "We started differently, so we'll end with different numbers."`,
        `**रिया:** "हमने अलग शुरू किया, तो अंत में अलग संख्याएँ मिलेंगी।"`,
      ),
    ),
    w.body(t(`**Aman:** "We'll end with the same numbers."`, `**अमन:** "अंत में वही संख्याएँ मिलेंगी।"`)),
    w.body(
      t(
        "Finish Riya's tree: tap a number that isn't prime and pick two factors.",
        "रिया का पेड़ पूरा करो: जो संख्या अभाज्य नहीं है उस पर टैप करो और दो गुणनखंड चुनो।",
      ),
    ),
    riya,
    unsplit,
    primeIs,
    amanIntro,
    aman,
    who,
    theorem,
    why,
  ];
});

/** What the unique factorisation gives: d divides n exactly when d's prime towers fit inside n's. */
const fits = page("fits", (b) => {
  const w = wordsOn(b);
  b.purpose(
    "Because a number has only one prime factorisation, its prime towers show everything that divides it: d divides n exactly when each of d's towers fits inside n's. 6 = 2 × 3 fits inside 18 = 2 × 3²; 4 = 2² doesn't, since 18 has only one 2.",
  );
  const towers = b.prop(primeTowersDef, "towers", { numberA: 18, numberB: 6, choices: [] });
  b.standsFor(towers, "18's and 6's prime towers side by side: 6's fit inside 18's");
  const ten = choice(b, {
    name: "ten",
    prompt: t(r`Does 10 divide $2^5 \times 3^2$?`, r`क्या 10, $2^5 \times 3^2$ को भाग देता है?`),
    right: t("No", "नहीं"),
    wrong: {
      yes: {
        label: t("Yes", "हाँ"),
        feedback: t(
          r`10 needs a 5-tower, and this number has none: $$10 = 2 \times 5$$`,
          r`10 को 5 का स्तंभ चाहिए, और इस संख्या में वह नहीं है: $$10 = 2 \times 5$$`,
        ),
      },
    },
  });
  return [
    w.title(t("Divides = fits inside", "भाग देना = अंदर समाना")),
    w.body(
      t(
        r`Draw each prime in a factorisation as a **tower**, as tall as its power. In $18 = 2 \times 3^2$ the 2-tower is 1 high and the 3-tower is 2 high. A number has only one prime factorisation, so its towers show everything that divides it. $$18 = 2 \times 3^2, \qquad 6 = 2 \times 3$$`,
        r`गुणनखंडन के हर अभाज्य को एक **स्तंभ** की तरह बनाओ, उसकी घात जितना ऊँचा। $18 = 2 \times 3^2$ में 2 का स्तंभ 1 ऊँचा है और 3 का स्तंभ 2 ऊँचा। किसी संख्या का अभाज्य गुणनखंडन एक ही होता है, तो उसके स्तंभ दिखाते हैं कि कौन-कौन उसे भाग देता है। $$18 = 2 \times 3^2, \qquad 6 = 2 \times 3$$`,
      ),
    ),
    towers,
    w.body(
      t(
        r`**6 fits inside 18:** each of 6's towers is no taller than 18's. $$18 = 6 \times 3$$`,
        r`**6, 18 के अंदर समाता है:** 6 का हर स्तंभ 18 के स्तंभ से ऊँचा नहीं। $$18 = 6 \times 3$$`,
      ),
    ),
    w.body(
      t(
        r`**4 doesn't fit inside 18.** 4 needs two 2s, and 18 has only one: $$4 = 2^2, \qquad 18 = 2 \times 3^2$$`,
        r`**4, 18 के अंदर नहीं समाता।** 4 को दो 2 चाहिए, और 18 में केवल एक है: $$4 = 2^2, \qquad 18 = 2 \times 3^2$$`,
      ),
    ),
    w.definition(
      t(
        r`**$d$ divides $n$** exactly when every prime tower of $d$ fits inside $n$'s: no prime of $d$ is missing from $n$, or taller in $d$.`,
        r`**$d$, $n$ को भाग देता है** ठीक तब जब $d$ का हर अभाज्य स्तंभ $n$ के स्तंभ में समाए: $d$ का कोई अभाज्य $n$ में ग़ायब न हो, न $d$ में ज़्यादा ऊँचा हो।`,
      ),
    ),
    ten,
  ];
});

/** NCERT Example 4: 32760 by dividing out the smallest primes. */
const ladder = page("ladder", (b) => {
  const w = wordsOn(b);
  return [
    w.title(t("Prime factorisation", "अभाज्य गुणनखंडन")),
    w.body(
      t(
        r`**Divide by the smallest prime, again and again.** Each division takes out one prime:`,
        r`**सबसे छोटे अभाज्य से बार-बार भाग दो।** हर भाग एक अभाज्य निकालता है:`,
      ),
    ),
    w.body(
      t(
        r`$$\begin{aligned} 32760 &= 2 \times 16380 \\ &= 2 \times 2 \times 8190 \\ &= 2 \times 2 \times 2 \times 4095 \\ &= 2^3 \times 3 \times 1365 \\ &= 2^3 \times 3^2 \times 455 \\ &= 2^3 \times 3^2 \times 5 \times 91 \\ &= 2^3 \times 3^2 \times 5 \times 7 \times 13 \end{aligned}$$`,
        r`$$\begin{aligned} 32760 &= 2 \times 16380 \\ &= 2 \times 2 \times 8190 \\ &= 2 \times 2 \times 2 \times 4095 \\ &= 2^3 \times 3 \times 1365 \\ &= 2^3 \times 3^2 \times 455 \\ &= 2^3 \times 3^2 \times 5 \times 91 \\ &= 2^3 \times 3^2 \times 5 \times 7 \times 13 \end{aligned}$$`,
      ),
    ),
  ];
});

/** The factor tree handed over: any number, split any way. */
const play = page("play", (b) => {
  const w = wordsOn(b);
  const tree = b.prop(factorTreeDef, "sandbox", { number: 180, isEditable: true });
  b.standsFor(tree, "a sandbox: any number, split into primes any way the learner likes");
  return [
    w.title(t("Try it yourself", "ख़ुद आज़माओ")),
    w.body(
      t(
        "Type any number and break it into primes. Start again and split it a different way.",
        "कोई भी संख्या लिखो और उसे अभाज्यों में तोड़ो। फिर से शुरू करो और किसी और तरह तोड़ो।",
      ),
    ),
    tree,
  ];
});

/** NCERT Example 5: 4ⁿ never ends in 0, because its only prime is 2. */
const fourToTheN = page("four-to-the-n", (b) => {
  const w = wordsOn(b);
  return [
    w.title(t("Example", "उदाहरण")),
    w.body(
      t(
        r`**Q.** Can $4^n$ end with the digit 0, for any natural number $n$?`,
        r`**प्र.** क्या किसी प्राकृत संख्या $n$ के लिए $4^n$ का अंतिम अंक 0 हो सकता है?`,
      ),
    ),
    w.body(
      t(
        r`**A.** Ending with 0 means 10 divides it. Then 10's towers would have to fit inside $4^n$'s, and 10 has a 5-tower: $$10 = 2 \times 5$$`,
        r`**उत्तर।** 0 पर ख़त्म होने का अर्थ है 10 इसे भाग देता है। तब 10 के स्तंभ $4^n$ के स्तंभों में समाने चाहिए, और 10 में 5 का स्तंभ है: $$10 = 2 \times 5$$`,
      ),
    ),
    w.body(
      t(
        r`But $4^n$ is made only of 2s, with no 5-tower: $$4^n = (2^2)^n = 2^{2n}$$ So $4^n$ **never ends with 0**.`,
        r`पर $4^n$ केवल 2 से बना है, 5 का कोई स्तंभ नहीं: $$4^n = (2^2)^n = 2^{2n}$$ तो $4^n$ **कभी 0 पर ख़त्म नहीं होता**।`,
      ),
    ),
  ];
});

/** NCERT Ex 1.2 Q6: composite, because a factor can be taken out. */
const composite = page("composite", (b) => {
  const w = wordsOn(b);
  return [
    w.title(t("Example", "उदाहरण")),
    w.body(
      t(
        r`**Q.** Is $7 \times 11 \times 13 + 13$ prime or composite?`,
        r`**प्र.** $7 \times 11 \times 13 + 13$ अभाज्य है या भाज्य?`,
      ),
    ),
    w.body(
      t(
        r`**A.** Both terms have a 13. Take it out: $$\begin{aligned} 7 \times 11 \times 13 + 13 &= 13 \times (7 \times 11 + 1) \\ &= 13 \times 78. \end{aligned}$$ It has a factor other than 1 and itself, so it is **composite**.`,
        r`**उ.** दोनों पदों में 13 है। उसे बाहर निकालो: $$\begin{aligned} 7 \times 11 \times 13 + 13 &= 13 \times (7 \times 11 + 1) \\ &= 13 \times 78. \end{aligned}$$ इसका 1 और स्वयं के अलावा भी गुणनखंड है, इसलिए यह **भाज्य** है।`,
      ),
    ),
  ];
});

/** The pages, in reading order. */
export const overview = [story, fits, play, ladder, fourToTheN, composite];

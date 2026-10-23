import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, goalQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import { ApSceneKind, GaussAction, GaussMode, gaussSumDef } from "@chalk/prop-ap";
import { sceneOn } from "../kit";

const r = String.raw;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** Recap, then the total: how much is in the box after 20 weeks? */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const box = sceneOn(
    b,
    "box",
    ApSceneKind.MoneyBox,
    "Kabir shaking the tin money box; Riya with a long column of numbers on a sheet",
  );
  return column([
    w.title(t("How much altogether?", "कुल कितना?")),
    box,
    w.body(
      t(
        r`We can find any single week now: week 20 is ₹195. But Kabir wants the **total**: how much is in the box after 20 weeks? Riya starts writing 100 + 105 + 110 + … and stops. Twenty numbers to add, and later it will be more.`,
        r`अब हम कोई भी एक हफ़्ता निकाल सकते हैं: हफ़्ता 20 ₹195 का है। पर कबीर को **कुल** चाहिए: 20 हफ़्तों बाद गुल्लक में कितना है? रिया 100 + 105 + 110 + … लिखने लगती है और रुक जाती है। जोड़ने को बीस संख्याएँ, और बाद में और ज़्यादा।`,
      ),
    ),
    w.body(
      t(
        'Grandpa smiles. "A ten-year-old boy once added a hundred numbers in a few seconds. Let me show you how."',
        'दादाजी मुस्कुराते हैं। "एक दस साल के लड़के ने एक बार सौ संख्याएँ कुछ ही सेकंड में जोड़ दी थीं। मैं दिखाता हूँ कैसे।"',
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Gauss: 1 + 2 + … + 100, forwards and backwards. */
const gauss = page(
  "gauss",
  (b) => {
    const w = wordsOn(b);
    const slate = sceneOn(
      b,
      "slate",
      ApSceneKind.GaussSlate,
      "Grandpa's slate: 1 + 2 + … + 100 written forwards, then backwards under it, each pair making 101, and 5050 circled",
    );
    const pairs = b.prop(gaussSumDef, "pairs", {
      mode: GaussMode.Pairs,
      a: 1,
      d: 1,
      n: 100,
      nMax: 100,
      step: 0,
      canStep: true,
    });
    b.studentOnly(pairs.action(GaussAction.Next));
    b.studentOnly(pairs.action(GaussAction.Back));
    b.standsFor(
      pairs,
      "the sum 1 + 2 + … + 100 written forwards, then backwards; adding them pairs every term to make 101",
    );
    const goal = goalQuestion(b, {
      about: pairs,
      prompt: t("Step through Gauss's trick to the end.", "गॉस की तरकीब अंत तक क़दम-दर-क़दम देखो।"),
      isMet: pairs.field("step").eq(3),
      solve: [
        pairs.learner(GaussAction.Next),
        pairs.learner(GaussAction.Next),
        pairs.learner(GaussAction.Next),
      ],
    });
    return column([
      w.title(t("Gauss's trick", "गॉस की तरकीब")),
      slate,
      w.body(
        t(
          r`At ten, Gauss was asked to add the whole numbers from 1 to 100. He wrote the sum $S$ forwards, then backwards under it: $$S = 1 + 2 + 3 + \dots + 99 + 100$$ $$S = 100 + 99 + 98 + \dots + 2 + 1$$ Adding the two lines, each pair of terms makes 101, and there are 100 pairs.`,
          r`दस साल की उम्र में गॉस से 1 से 100 तक की पूर्ण संख्याएँ जोड़ने को कहा गया। उन्होंने योग $S$ सीधा लिखा, फिर उसके नीचे उलटा: $$S = 1 + 2 + 3 + \dots + 99 + 100$$ $$S = 100 + 99 + 98 + \dots + 2 + 1$$ दोनों पंक्तियाँ जोड़ने पर हर जोड़ी 101 बनाती है, और 100 जोड़ियाँ हैं।`,
        ),
      ),
      pairs,
      goal,
      w.body(
        t(
          r`So $2S = 100 \times 101$, and $S = 5050$.`,
          r`तो $2S = 100 \times 101$, और $S = 5050$।`,
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The staircase picture, then the formula for any AP, both forms. */
const formula = page(
  "formula",
  (b) => {
    const w = wordsOn(b);
    const stairs = b.prop(gaussSumDef, "stairs", {
      mode: GaussMode.Bars,
      a: 1,
      d: 1,
      n: 6,
      nMax: 12,
      step: 0,
      canStep: true,
      canSetN: true,
    });
    b.studentOnly(stairs.action(GaussAction.Next));
    b.studentOnly(stairs.action(GaussAction.Back));
    b.studentOnly(stairs.action(GaussAction.NudgeN));
    b.standsFor(
      stairs,
      "the sum 1 + 2 + … + 6 as a staircase of bars; a copy is turned upside down and slid on top, making a rectangle 6 wide and 7 tall, and the sum is half of it",
    );
    const goal = goalQuestion(b, {
      about: stairs,
      prompt: t(
        "Step until the staircase and its copy make a rectangle.",
        "तब तक क़दम बढ़ाओ जब तक सीढ़ी और उसकी नक़ल एक आयत न बना दें।",
      ),
      isMet: stairs.field("step").eq(3),
      solve: [
        stairs.learner(GaussAction.Next),
        stairs.learner(GaussAction.Next),
        stairs.learner(GaussAction.Next),
      ],
    });
    const which = choiceQuestion(b, {
      name: "which",
      prompt: t(
        r`You know the first term $a$, the last term $l$ and the number of terms $n$, but not $d$. Which form is quickest?`,
        r`तुम्हें प्रथम पद $a$, अंतिम पद $l$ और पदों की संख्या $n$ पता है, पर $d$ नहीं। कौन-सा रूप सबसे जल्दी काम करेगा?`,
      ),
      options: [
        { id: "right", label: t(r`$S = \frac{n}{2}(a + l)$`, r`$S = \frac{n}{2}(a + l)$`) },
        {
          id: "long",
          label: t(r`$S = \frac{n}{2}[2a + (n - 1)d]$`, r`$S = \frac{n}{2}[2a + (n - 1)d]$`),
          feedback: t(
            r`That needs $d$, which you don't have. Since $a + (n - 1)d = l$, the other form uses $l$ directly.`,
            r`उसमें $d$ चाहिए, जो तुम्हारे पास नहीं। क्योंकि $a + (n - 1)d = l$, दूसरा रूप सीधे $l$ लेता है।`,
          ),
        },
        {
          id: "nth",
          label: t(r`$a_n = a + (n - 1)d$`, r`$a_n = a + (n - 1)d$`),
          feedback: t("That gives one term, not the sum.", "वह एक पद देता है, योग नहीं।"),
        },
      ],
      answer: "right",
      isHidden: true,
    });
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(which));
    return column([
      w.title(t("The sum of the first n terms", "पहले n पदों का योग")),
      w.body(
        t(
          "Here is the same trick as a picture. Each term is a column of blocks, making a staircase. Turn a copy upside down and slide it on top: together they make a rectangle, and the sum is half of it. Change n and try again.",
          "यही तरकीब एक चित्र में। हर पद ब्लॉकों का एक स्तंभ है, जिससे सीढ़ी बनती है। एक नक़ल को उलटकर ऊपर खिसकाओ: दोनों मिलकर एक आयत बनाते हैं, और योग उसका आधा है। n बदलकर फिर आज़माओ।",
        ),
      ),
      stairs,
      goal,
      w.body(
        t(
          r`Now any AP $a, a + d, \dots$ with $n$ terms. Write the sum forwards and backwards: $$S = a + (a + d) + \dots + [a + (n - 1)d]$$ $$S = [a + (n - 1)d] + \dots + (a + d) + a$$ Add the two lines term by term, top with bottom. First pair: $a + [a + (n - 1)d]$. Second pair: $(a + d) + [a + (n - 2)d]$. Each step adds $d$ on top and takes $d$ off the bottom, so every pair is $2a + (n - 1)d$, and there are $n$ pairs, so $2S = n[2a + (n - 1)d]$.`,
          r`अब कोई भी AP $a, a + d, \dots$, जिसमें $n$ पद हों। योग सीधा और उलटा लिखो: $$S = a + (a + d) + \dots + [a + (n - 1)d]$$ $$S = [a + (n - 1)d] + \dots + (a + d) + a$$ दोनों पंक्तियों को पद-दर-पद जोड़ो, ऊपर वाला नीचे वाले से। पहली जोड़ी: $a + [a + (n - 1)d]$। दूसरी जोड़ी: $(a + d) + [a + (n - 2)d]$। हर क़दम पर ऊपर $d$ बढ़ता है और नीचे $d$ घटता है, तो हर जोड़ी $2a + (n - 1)d$ है, और $n$ जोड़ियाँ हैं, तो $2S = n[2a + (n - 1)d]$।`,
        ),
      ),
      w.definition(
        t(
          r`**Sum of the first n terms.** For an AP with first term $a$ and common difference $d$, the sum of the first $n$ terms is $$S_n = \frac{n}{2}\,[2a + (n - 1)d]$$ Since $a + (n - 1)d$ is the last of those terms, $l$, this is also $$S_n = \frac{n}{2}\,(a + l)$$`,
          r`**पहले n पदों का योग।** प्रथम पद $a$ और सार्व अंतर $d$ वाली AP के पहले $n$ पदों का योग है $$S_n = \frac{n}{2}\,[2a + (n - 1)d]$$ क्योंकि $a + (n - 1)d$ इन पदों में अंतिम, $l$, है, यह भी है $$S_n = \frac{n}{2}\,(a + l)$$`,
        ),
      ),
      which,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Shakila's money box and Example 11 (a negative sum). */
const examples = page(
  "examples",
  (b) => {
    const w = wordsOn(b);
    const neg = b.prop(gaussSumDef, "neg", {
      mode: GaussMode.Pairs,
      a: 8,
      d: -5,
      n: 22,
      nMax: 22,
      step: 0,
      canStep: true,
    });
    b.studentOnly(neg.action(GaussAction.Next));
    b.studentOnly(neg.action(GaussAction.Back));
    b.standsFor(
      neg,
      "the sum of the first 22 terms of 8, 3, −2, … written forwards and backwards; each pair adds to −89",
    );
    const sign = choiceQuestion(b, {
      name: "sign",
      prompt: t(
        "Why is the sum of the first 22 terms of 8, 3, −2, … negative?",
        "8, 3, −2, … के पहले 22 पदों का योग ऋणात्मक क्यों है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Only the first two terms are positive; the other 20 are negative and outweigh them",
            "सिर्फ़ पहले दो पद धनात्मक हैं; बाक़ी 20 ऋणात्मक हैं और उन पर भारी पड़ते हैं",
          ),
        },
        {
          id: "d",
          label: t(
            "Because d is negative, every sum is negative",
            "क्योंकि d ऋणात्मक है, हर योग ऋणात्मक होता है",
          ),
          feedback: t(
            "Not every sum: the first two terms alone add to 8 + 3 = 11. It depends on how many terms you take.",
            "हर योग नहीं: अकेले पहले दो पदों का योग 8 + 3 = 11 है। यह इस पर निर्भर है कि कितने पद लो।",
          ),
        },
        {
          id: "mistake",
          label: t(
            "It shouldn't be: sums are always positive",
            "ऐसा नहीं होना चाहिए: योग हमेशा धनात्मक होता है",
          ),
          feedback: t(
            "Adding negative numbers gives a negative total. There's no rule that a sum must be positive.",
            "ऋणात्मक संख्याएँ जोड़ने से कुल ऋणात्मक आता है। ऐसा कोई नियम नहीं कि योग धनात्मक हो।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Using the formula", "सूत्र का उपयोग")),
      w.body(
        t(
          r`**Shakila's money box.** ₹100 on her daughter's first birthday, then ₹50 more each year. How much by the 21st birthday? $a = 100$, $d = 50$, $n = 21$: $$S_{21} = \frac{21}{2}[2 \times 100 + 20 \times 50]$$ $$= \frac{21}{2} \times 1200 = 12600$$ ₹12,600, without adding 21 numbers.`,
          r`**शकीला की गुल्लक।** बेटी के पहले जन्मदिन पर ₹100, फिर हर साल ₹50 ज़्यादा। 21वें जन्मदिन तक कितना? $a = 100$, $d = 50$, $n = 21$: $$S_{21} = \frac{21}{2}[2 \times 100 + 20 \times 50]$$ $$= \frac{21}{2} \times 1200 = 12600$$ ₹12,600, 21 संख्याएँ जोड़े बिना।`,
        ),
      ),
      w.body(
        t(
          r`**Example 11:** the sum of the first 22 terms of 8, 3, −2, …. Here $a = 8$, $d = -5$: $$S_{22} = \frac{22}{2}[16 + 21 \times (-5)]$$ $$= 11 \times (-89) = -979$$ Step through the pairs to see why each pair is −89.`,
          r`**उदाहरण 11:** 8, 3, −2, … के पहले 22 पदों का योग। यहाँ $a = 8$, $d = -5$: $$S_{22} = \frac{22}{2}[16 + 21 \times (-5)]$$ $$= 11 \times (-89) = -979$$ जोड़ियाँ क़दम-दर-क़दम देखो कि हर जोड़ी −89 क्यों है।`,
        ),
      ),
      neg,
      sign,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Example 14: the first n positive integers. */
const integers = page(
  "integers",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t("What is 1 + 2 + 3 + … + 1000?", "1 + 2 + 3 + … + 1000 कितना है?"),
      options: [
        { id: "right", label: t("500500", "500500") },
        {
          id: "1001000",
          label: t("1001000", "1001000"),
          feedback: t(
            r`That's $1000 \times 1001$, which is $2S$. Halve it.`,
            r`यह $1000 \times 1001$ है, जो $2S$ है। आधा करो।`,
          ),
        },
        {
          id: "500000",
          label: t("500000", "500000"),
          feedback: t(
            r`Use $\frac{n(n + 1)}{2}$ with $n = 1000$: $500 \times 1001 = 500500$.`,
            r`$\frac{n(n + 1)}{2}$ में $n = 1000$ रखो: $500 \times 1001 = 500500$।`,
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Adding 1 to n", "1 से n तक जोड़ना")),
      w.body(
        t(
          r`**Example 14:** the sum of the first $n$ positive integers, $1 + 2 + \dots + n$. It's an AP with $a = 1$ and last term $l = n$, so $$S_n = \frac{n}{2}(1 + n) = \frac{n(n + 1)}{2}$$ Gauss's 5050 is this with $n = 100$.`,
          r`**उदाहरण 14:** पहले $n$ धन पूर्णांकों का योग, $1 + 2 + \dots + n$। यह AP है, जिसमें $a = 1$ और अंतिम पद $l = n$, तो $$S_n = \frac{n}{2}(1 + n) = \frac{n(n + 1)}{2}$$ गॉस का 5050 यही है, $n = 100$ पर।`,
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** Kabir's box after 20 weeks: ₹2,950, not yet ₹4,000. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const box = b.prop(gaussSumDef, "box", {
      mode: GaussMode.Bars,
      a: 100,
      d: 5,
      n: 20,
      nMax: 24,
      step: 0,
      canStep: true,
      unit: "₹",
    });
    b.studentOnly(box.action(GaussAction.Next));
    b.studentOnly(box.action(GaussAction.Back));
    b.standsFor(
      box,
      "Kabir's 20 weeks of savings, ₹100 to ₹195, as a staircase; the copy on top makes a rectangle 20 wide and ₹295 tall",
    );
    const goal = goalQuestion(b, {
      about: box,
      prompt: t(
        "Step through to find what is in the box after 20 weeks.",
        "क़दम-दर-क़दम चलकर पता करो कि 20 हफ़्तों बाद गुल्लक में कितना है।",
      ),
      isMet: box.field("step").eq(3),
      solve: [
        box.learner(GaussAction.Next),
        box.learner(GaussAction.Next),
        box.learner(GaussAction.Next),
      ],
    });
    const enough = choiceQuestion(b, {
      name: "enough",
      prompt: t(
        "After 20 weeks, is there enough for the ₹4,000 cycle?",
        "20 हफ़्तों बाद, क्या ₹4,000 की साइकिल के लिए काफ़ी है?",
      ),
      options: [
        { id: "right", label: t("No: ₹2,950, ₹1,050 short", "नहीं: ₹2,950, ₹1,050 कम") },
        {
          id: "yes",
          label: t("Yes", "हाँ"),
          feedback: t(
            r`$S_{20} = 10[200 + 19 \times 5] = 2950$. That's less than 4,000.`,
            r`$S_{20} = 10[200 + 19 \times 5] = 2950$। यह 4,000 से कम है।`,
          ),
        },
        {
          id: "195",
          label: t("No: only ₹195", "नहीं: सिर्फ़ ₹195"),
          feedback: t(
            "₹195 is what goes in during week 20. The box holds all 20 weeks added up.",
            "₹195 सिर्फ़ हफ़्ते 20 में डाला जाता है। गुल्लक में सारे 20 हफ़्तों का जोड़ है।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
    });
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(enough));
    return column([
      w.title(t("Back to the money box", "फिर गुल्लक पर")),
      w.body(
        t(
          r`Kabir's first 20 weeks: $a = 100$, $d = 5$, $n = 20$. $$S_{20} = \frac{20}{2}[2 \times 100 + 19 \times 5]$$ $$= 10 \times 295 = 2950$$ Watch the same total appear as half a rectangle.`,
          r`कबीर के पहले 20 हफ़्ते: $a = 100$, $d = 5$, $n = 20$। $$S_{20} = \frac{20}{2}[2 \times 100 + 19 \times 5]$$ $$= 10 \times 295 = 2950$$ यही कुल एक आयत के आधे के रूप में देखो।`,
        ),
      ),
      box,
      goal,
      enough,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Exercise 5.3 Q1–Q2 picks; the mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const ten = choiceQuestion(b, {
      name: "ten",
      prompt: t(
        "Find the sum of 2, 7, 12, … to 10 terms.",
        "2, 7, 12, … के 10 पदों का योग ज्ञात करो।",
      ),
      options: [
        { id: "right", label: t("245", "245") },
        {
          id: "47",
          label: t("47", "47"),
          feedback: t(
            "47 is the 10th term. The sum adds all ten.",
            "47 दसवाँ पद है। योग में सारे दस जुड़ते हैं।",
          ),
        },
        {
          id: "270",
          label: t("270", "270"),
          feedback: t(
            r`Use $n - 1 = 9$ in the bracket: $5[4 + 9 \times 5] = 5 \times 49 = 245$.`,
            r`कोष्ठक में $n - 1 = 9$ लो: $5[4 + 9 \times 5] = 5 \times 49 = 245$।`,
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const down = choiceQuestion(b, {
      name: "down",
      prompt: t("Find 34 + 32 + 30 + … + 10.", "34 + 32 + 30 + … + 10 ज्ञात करो।"),
      options: [
        { id: "right", label: t("286", "286") },
        {
          id: "264",
          label: t("264", "264"),
          feedback: t(
            r`Count the terms first: $10 = 34 + (n - 1)(-2)$ gives $n = 13$, not 12. Then $\frac{13}{2}(34 + 10) = 286$.`,
            r`पहले पद गिनो: $10 = 34 + (n - 1)(-2)$ से $n = 13$, 12 नहीं। फिर $\frac{13}{2}(34 + 10) = 286$।`,
          ),
        },
        {
          id: "44",
          label: t("44", "44"),
          feedback: t(
            r`$34 + 10 = 44$ is one pair. There are 13 terms, so $\frac{13}{2}$ pairs' worth.`,
            r`$34 + 10 = 44$ एक जोड़ी है। 13 पद हैं, तो $\frac{13}{2}$ जोड़ियों जितना।`,
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const log = w.definition(
      t(
        r`**Mission log.** ✓ Any total, fast: $S_n = \frac{n}{2}[2a + (n - 1)d]$. ✓ After 20 weeks Kabir has ₹2,950. ✗ He still doesn't know which week the box reaches ₹4,000. Next stop: using the sum backwards.`,
        r`**मिशन लॉग।** ✓ कोई भी कुल, तेज़ी से: $S_n = \frac{n}{2}[2a + (n - 1)d]$। ✓ 20 हफ़्तों बाद कबीर के पास ₹2,950 हैं। ✗ उसे अब भी नहीं पता कि गुल्लक किस हफ़्ते ₹4,000 तक पहुँचेगी। अगला पड़ाव: योग का उलटा उपयोग।`,
      ),
      "log",
      { isHidden: true },
    );
    b.when(ten.on(QuestionSignal.Correct), theBoard.show(down));
    b.when(down.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([
      w.title(t("Your turn", "अब तुम्हारी बारी")),
      w.body(
        t(
          r`**Worked: −37, −33, −29, … to 12 terms.** $a = -37$, $d = 4$, $n = 12$: $$S_{12} = 6[-74 + 11 \times 4] = 6 \times (-30) = -180$$`,
          r`**हल किया हुआ: −37, −33, −29, … के 12 पद।** $a = -37$, $d = 4$, $n = 12$: $$S_{12} = 6[-74 + 11 \times 4] = 6 \times (-30) = -180$$`,
        ),
      ),
      ten,
      down,
      log,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [hook, gauss, formula, examples, integers, inLife, yourTurn];

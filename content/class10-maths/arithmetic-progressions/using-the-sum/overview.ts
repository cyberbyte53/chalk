import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, goalQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import { ApSceneKind, GaussAction, GaussDerived, GaussMode, gaussSumDef } from "@chalk/prop-ap";
import { sceneOn } from "../kit";

const r = String.raw;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** Recap, then the last question: which week does the box reach ₹4,000? */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const shop = sceneOn(
    b,
    "shop",
    ApSceneKind.CycleShop,
    "the cycle shop again: the blue ₹4,000 cycle in the window, Kabir pressing his nose to the glass",
  );
  return column([
    w.title(t("Which week?", "कौन-सा हफ़्ता?")),
    shop,
    w.body(
      t(
        r`After 20 weeks the box holds ₹2,950. Kabir walks past the cycle shop every day. "So which week does it reach ₹4,000?" This time we know the **sum** and want $n$: the formula has to be used backwards.`,
        r`20 हफ़्तों बाद गुल्लक में ₹2,950 हैं। कबीर रोज़ साइकिल की दुकान के सामने से गुज़रता है। "तो किस हफ़्ते यह ₹4,000 तक पहुँचेगी?" इस बार हमें **योग** पता है और $n$ चाहिए: सूत्र को उलटा चलाना होगा।`,
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Four quantities S, a, d, n: know three, find the fourth. Example 12. */
const fourth = page(
  "fourth",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "In an AP, d = 5 and the sum of the first 9 terms is 75. What is the first term a?",
        "किसी AP में d = 5 है और पहले 9 पदों का योग 75 है। प्रथम पद a क्या है?",
      ),
      options: [
        { id: "right", label: t(r`$-\tfrac{35}{3}$`, r`$-\tfrac{35}{3}$`) },
        {
          id: "neg",
          label: t(r`$\tfrac{35}{3}$`, r`$\tfrac{35}{3}$`),
          feedback: t(
            r`$75 = \frac{9}{2}[2a + 40]$ gives $2a + 40 = \frac{50}{3}$, so $2a = -\frac{70}{3}$: $a$ is negative.`,
            r`$75 = \frac{9}{2}[2a + 40]$ से $2a + 40 = \frac{50}{3}$, तो $2a = -\frac{70}{3}$: $a$ ऋणात्मक है।`,
          ),
        },
        {
          id: "five",
          label: t("−5", "−5"),
          feedback: t(
            r`Check: with $a = -5$, $S_9 = \frac{9}{2}[-10 + 40] = 135$, not 75.`,
            r`जाँचो: $a = -5$ पर $S_9 = \frac{9}{2}[-10 + 40] = 135$, 75 नहीं।`,
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Know three, find the fourth", "तीन पता, चौथा निकालो")),
      w.body(
        t(
          r`The sum formula $S_n = \frac{n}{2}[2a + (n - 1)d]$ ties together four quantities: $S$, $a$, $d$ and $n$. Know any three and you can find the fourth.`,
          r`योग का सूत्र $S_n = \frac{n}{2}[2a + (n - 1)d]$ चार राशियों को जोड़ता है: $S$, $a$, $d$ और $n$। कोई तीन पता हों तो चौथी निकल आती है।`,
        ),
      ),
      w.body(
        t(
          r`**Example 12:** the sum of the first 14 terms of an AP is 1050 and its first term is 10. Find the 20th term. $$1050 = \frac{14}{2}[20 + 13d] = 140 + 91d$$ So $91d = 910$ and $d = 10$. Then $$a_{20} = 10 + 19 \times 10 = 200$$`,
          r`**उदाहरण 12:** किसी AP के पहले 14 पदों का योग 1050 है और उसका प्रथम पद 10 है। 20वाँ पद ज्ञात करो। $$1050 = \frac{14}{2}[20 + 13d] = 140 + 91d$$ तो $91d = 910$ और $d = 10$। फिर $$a_{20} = 10 + 19 \times 10 = 200$$`,
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Example 13: finding n gives a quadratic; two answers, and why both work. */
const quadratic = page(
  "quadratic",
  (b) => {
    const w = wordsOn(b);
    const sum = b.prop(gaussSumDef, "sum", {
      mode: GaussMode.Pairs,
      a: 24,
      d: -3,
      n: 4,
      nMax: 13,
      step: 3,
      canStep: false,
      canSetN: true,
    });
    b.studentOnly(sum.action(GaussAction.NudgeN));
    b.standsFor(
      sum,
      "the sum of the first n terms of 24, 21, 18, … worked out by pairing; the learner changes n and sees the sum",
    );
    const goal = goalQuestion(b, {
      about: sum,
      prompt: t(
        "The sum is 78 at n = 4. Change n and find the other n that also gives 78.",
        "n = 4 पर योग 78 है। n बदलो और वह दूसरा n खोजो जिस पर भी योग 78 आता है।",
      ),
      isMet: sum.field("n").eq(13),
      solve: Array.from({ length: 9 }, () => sum.learner(GaussAction.NudgeN, { by: 1 })),
    });
    const why = choiceQuestion(b, {
      name: "why",
      prompt: t(
        "Why do 4 terms and 13 terms give the same sum?",
        "4 पद और 13 पद एक ही योग क्यों देते हैं?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "The 5th to the 13th terms add up to zero: positives and negatives cancel",
            "5वें से 13वें पद तक का योग शून्य है: धनात्मक और ऋणात्मक कट जाते हैं",
          ),
        },
        {
          id: "wrong",
          label: t("One of the answers must be wrong", "कोई एक उत्तर ग़लत होगा"),
          feedback: t(
            "Both check out: 24 + 21 + 18 + 15 = 78, and the 13-term sum is 78 too.",
            "दोनों सही हैं: 24 + 21 + 18 + 15 = 78, और 13 पदों का योग भी 78 है।",
          ),
        },
        {
          id: "quad",
          label: t("Every quadratic has two answers", "हर द्विघात के दो उत्तर होते हैं"),
          feedback: t(
            "Not every root makes sense as a number of terms (it can be negative or a fraction). Here both happen to be positive whole numbers because terms cancel.",
            "हर मूल पदों की संख्या के रूप में सही नहीं होता (वह ऋणात्मक या भिन्न हो सकता है)। यहाँ दोनों धन पूर्ण संख्याएँ हैं क्योंकि पद कट जाते हैं।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
    });
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(why));
    return column([
      w.title(t("Finding n gives a quadratic", "n निकालने पर द्विघात मिलता है")),
      w.body(
        t(
          r`**Example 13:** how many terms of 24, 21, 18, … must be taken to get a sum of 78? Here $a = 24$, $d = -3$, $S_n = 78$: $$78 = \frac{n}{2}[48 + (n - 1)(-3)]$$ $$78 = \frac{n}{2}[51 - 3n]$$ $$3n^2 - 51n + 156 = 0$$ $$n^2 - 17n + 52 = 0$$ $$(n - 4)(n - 13) = 0$$ So $n = 4$ or $n = 13$. This is the quadratic equation from Chapter 4, and **both** answers work.`,
          r`**उदाहरण 13:** 24, 21, 18, … के कितने पद लेने पर योग 78 होगा? यहाँ $a = 24$, $d = -3$, $S_n = 78$: $$78 = \frac{n}{2}[48 + (n - 1)(-3)]$$ $$78 = \frac{n}{2}[51 - 3n]$$ $$3n^2 - 51n + 156 = 0$$ $$n^2 - 17n + 52 = 0$$ $$(n - 4)(n - 13) = 0$$ तो $n = 4$ या $n = 13$। यह अध्याय 4 का द्विघात समीकरण है, और **दोनों** उत्तर सही हैं।`,
        ),
      ),
      sum,
      goal,
      why,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Example 15 and the Remark: a list given by its nth term; aₙ = Sₙ − Sₙ₋₁. */
const rule = page(
  "rule",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        r`The sum of the first $n$ terms of an AP is $4n - n^2$. What is its second term?`,
        r`किसी AP के पहले $n$ पदों का योग $4n - n^2$ है। इसका दूसरा पद क्या है?`,
      ),
      options: [
        { id: "right", label: t("1", "1") },
        {
          id: "four",
          label: t("4", "4"),
          feedback: t(
            r`4 is $S_2$, the sum of the first two terms. The second term is $S_2 - S_1 = 4 - 3 = 1$.`,
            r`4, $S_2$ है, पहले दो पदों का योग। दूसरा पद है $S_2 - S_1 = 4 - 3 = 1$।`,
          ),
        },
        {
          id: "three",
          label: t("3", "3"),
          feedback: t(
            r`3 is $S_1$, the first term. Then $a_2 = S_2 - S_1 = 1$.`,
            r`3, $S_1$ है, यानी पहला पद। फिर $a_2 = S_2 - S_1 = 1$।`,
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("From a rule to a sum", "नियम से योग तक")),
      w.body(
        t(
          r`**Example 15:** find the sum of the first 24 terms of the list whose $n$th term is $a_n = 3 + 2n$. Put in $n = 1, 2, 3$: the list is 5, 7, 9, …, an AP with $a = 5$, $d = 2$. $$S_{24} = 12[10 + 23 \times 2] = 12 \times 56 = 672$$`,
          r`**उदाहरण 15:** उस सूची के पहले 24 पदों का योग ज्ञात करो जिसका $n$ वाँ पद $a_n = 3 + 2n$ है। $n = 1, 2, 3$ रखो: सूची 5, 7, 9, … है, $a = 5$, $d = 2$ वाली AP। $$S_{24} = 12[10 + 23 \times 2] = 12 \times 56 = 672$$`,
        ),
      ),
      w.definition(
        t(
          r`**From sums back to terms.** The sum of the first $n$ terms is the sum of the first $n - 1$ terms plus the $n$th term. So $$a_n = S_n - S_{n-1}$$`,
          r`**योग से वापस पद।** पहले $n$ पदों का योग, पहले $n - 1$ पदों के योग और $n$ वें पद को मिलाकर बनता है। तो $$a_n = S_n - S_{n-1}$$`,
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Example 16: TV production, two terms then a term then a sum. */
const tv = page(
  "tv",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "A factory made 600 TV sets in year 3 and 700 in year 7, rising by the same number each year. How many in the first 7 years altogether?",
        "एक कारख़ाने ने तीसरे साल 600 और 7वें साल 700 टीवी सेट बनाए, हर साल उतनी ही बढ़ोतरी के साथ। पहले 7 सालों में कुल कितने?",
      ),
      options: [
        { id: "right", label: t("4375", "4375") },
        {
          id: "4550",
          label: t("4550", "4550"),
          feedback: t(
            r`That uses 650 as the average. First find $a$: $a + 2d = 600$ and $a + 6d = 700$ give $d = 25$, $a = 550$. Then $S_7 = \frac{7}{2}(550 + 700) = 4375$.`,
            r`इसमें 650 को औसत माना। पहले $a$ निकालो: $a + 2d = 600$ और $a + 6d = 700$ से $d = 25$, $a = 550$। फिर $S_7 = \frac{7}{2}(550 + 700) = 4375$।`,
          ),
        },
        {
          id: "700",
          label: t("775", "775"),
          feedback: t(
            r`775 is the 10th year's production, $550 + 9 \times 25$. The question asks for the total of the first 7 years.`,
            r`775 दसवें साल का उत्पादन है, $550 + 9 \times 25$। सवाल पहले 7 सालों का कुल पूछता है।`,
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Putting it all together", "सब कुछ एक साथ")),
      w.body(
        t(
          r`**Example 16** uses everything at once. Two terms give $a$ and $d$ (a pair of linear equations); the nth term gives any year; the sum gives a total. $$a + 2d = 600, \qquad a + 6d = 700$$ So $d = 25$ and $a = 550$: 550 sets in the first year, and $550 + 9 \times 25 = 775$ in the 10th.`,
          r`**उदाहरण 16** सब कुछ एक साथ इस्तेमाल करता है। दो पद $a$ और $d$ देते हैं (रैखिक समीकरणों का युग्म); n वाँ पद कोई भी साल देता है; योग कुल देता है। $$a + 2d = 600, \qquad a + 6d = 700$$ तो $d = 25$ और $a = 550$: पहले साल 550 सेट, और 10वें साल $550 + 9 \times 25 = 775$।`,
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

/** Kabir's ₹4,000: n² + 39n − 1600 = 0, week 25. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const box = b.prop(gaussSumDef, "box", {
      mode: GaussMode.Pairs,
      a: 100,
      d: 5,
      n: 20,
      nMax: 30,
      step: 3,
      canStep: false,
      canSetN: true,
      unit: "₹",
    });
    b.studentOnly(box.action(GaussAction.NudgeN));
    b.standsFor(
      box,
      "the total of Kabir's first n weeks worked out by pairing; the learner adds weeks one at a time",
    );
    const goal = goalQuestion(b, {
      about: box,
      prompt: t(
        "Add weeks until the total is exactly ₹4,000.",
        "हफ़्ते जोड़ते जाओ जब तक कुल ठीक ₹4,000 न हो जाए।",
      ),
      isMet: box.derived(GaussDerived.Sum).eq(4000),
      solve: Array.from({ length: 5 }, () => box.learner(GaussAction.NudgeN, { by: 1 })),
    });
    const reject = choiceQuestion(b, {
      name: "reject",
      prompt: t(
        r`The equation $(n - 25)(n + 64) = 0$ gives $n = 25$ or $n = -64$. Why do we throw away −64?`,
        r`समीकरण $(n - 25)(n + 64) = 0$ से $n = 25$ या $n = -64$ मिलता है। हम −64 को क्यों छोड़ देते हैं?`,
      ),
      options: [
        {
          id: "right",
          label: t(
            "n counts weeks: it must be a positive whole number",
            "n हफ़्ते गिनता है: यह धनात्मक पूर्ण संख्या होना चाहिए",
          ),
        },
        {
          id: "big",
          label: t("Because 64 weeks is too long to wait", "क्योंकि 64 हफ़्ते इंतज़ार बहुत लंबा है"),
          feedback: t(
            "It's not about being long: it's −64, a negative number of weeks, which can't happen.",
            "बात लंबे होने की नहीं: यह −64 है, ऋणात्मक हफ़्ते, जो हो ही नहीं सकते।",
          ),
        },
        {
          id: "mistake",
          label: t("It means we made a mistake", "इसका मतलब हमसे ग़लती हुई"),
          feedback: t(
            "The algebra is right; a quadratic simply has two roots. We keep the one that makes sense.",
            "बीजगणित सही है; द्विघात के बस दो मूल होते हैं। हम वह रखते हैं जो समझ में आए।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
    });
    const solved = w.body(
      t(
        r`Factorising: $$(n - 25)(n + 64) = 0$$ After **week 25** the box holds exactly ₹4,000. Kabir's birthday is in week 30. Riya: "You'll make it, with five weeks to spare."`,
        r`गुणनखंड करने पर: $$(n - 25)(n + 64) = 0$$ **हफ़्ता 25** के बाद गुल्लक में ठीक ₹4,000 होंगे। कबीर का जन्मदिन हफ़्ता 30 में है। रिया: "तुम पहुँच जाओगे, पाँच हफ़्ते बचाकर।"`,
      ),
      "solved",
      { isHidden: true },
    );
    b.when(goal.on(QuestionSignal.Correct), [theBoard.show(solved), theBoard.show(reject)]);
    return column([
      w.title(t("Back to the money box", "फिर गुल्लक पर")),
      w.body(
        t(
          r`Kabir needs $S_n = 4000$ with $a = 100$, $d = 5$: $$\frac{n}{2}[200 + 5(n - 1)] = 4000$$ $$n^2 + 39n - 1600 = 0$$ Before solving it, add weeks below and watch the total.`,
          r`कबीर को चाहिए $S_n = 4000$, जहाँ $a = 100$, $d = 5$: $$\frac{n}{2}[200 + 5(n - 1)] = 4000$$ $$n^2 + 39n - 1600 = 0$$ हल करने से पहले, नीचे हफ़्ते जोड़ो और कुल देखो।`,
        ),
      ),
      box,
      goal,
      solved,
      reject,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** School-week word problems: the tree drive, the log stack, the potato race. */
const school = page(
  "school",
  (b) => {
    const w = wordsOn(b);
    const trees = sceneOn(
      b,
      "trees",
      ApSceneKind.TreeDrive,
      "students of every class planting saplings around the school, the older classes carrying more",
    );
    const treeQ = choiceQuestion(b, {
      name: "treeQ",
      prompt: t(
        "Each section of Class I plants 1 tree, Class II 2 trees, …, Class XII 12 trees. Every class has 3 sections. How many trees in all?",
        "कक्षा I का हर वर्ग 1 पेड़ लगाता है, कक्षा II 2 पेड़, …, कक्षा XII 12 पेड़। हर कक्षा के 3 वर्ग हैं। कुल कितने पेड़?",
      ),
      options: [
        { id: "right", label: t("234", "234") },
        {
          id: "78",
          label: t("78", "78"),
          feedback: t(
            "78 = 1 + 2 + … + 12 is one section from each class. There are 3 sections per class.",
            "78 = 1 + 2 + … + 12, हर कक्षा का एक वर्ग है। हर कक्षा के 3 वर्ग हैं।",
          ),
        },
        {
          id: "36",
          label: t("36", "36"),
          feedback: t(
            "That's 12 classes × 3 sections, the number of sections. Each section plants as many trees as its class number.",
            "यह 12 कक्षाएँ × 3 वर्ग है, यानी वर्गों की संख्या। हर वर्ग अपनी कक्षा की संख्या जितने पेड़ लगाता है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const logs = sceneOn(
      b,
      "logs",
      ApSceneKind.LogStack,
      "a stack of logs in Grandpa's village, 20 in the bottom row and one fewer in each row above",
    );
    const logQ = choiceQuestion(b, {
      name: "logQ",
      prompt: t(
        r`200 logs: 20 in the bottom row, 19 in the next, and so on. The sum gives $n^2 - 41n + 400 = 0$, so $n = 16$ or $25$. How many rows are there?`,
        r`200 लट्ठे: नीचे की पंक्ति में 20, अगली में 19, और इसी तरह। योग से $n^2 - 41n + 400 = 0$, तो $n = 16$ या $25$। कितनी पंक्तियाँ हैं?`,
      ),
      options: [
        {
          id: "right",
          label: t("16 rows, with 5 logs on top", "16 पंक्तियाँ, ऊपर 5 लट्ठे"),
        },
        {
          id: "25",
          label: t("25 rows", "25 पंक्तियाँ"),
          feedback: t(
            r`The 25th row would hold $20 - 24 = -4$ logs. A row can't have a negative number of logs.`,
            r`25वीं पंक्ति में $20 - 24 = -4$ लट्ठे होते। किसी पंक्ति में ऋणात्मक लट्ठे नहीं हो सकते।`,
          ),
        },
        {
          id: "both",
          label: t("Either 16 or 25", "16 या 25, कोई भी"),
          feedback: t(
            "Unlike Example 13, here the extra terms would be negative logs. Only 16 makes sense.",
            "उदाहरण 13 से अलग, यहाँ अतिरिक्त पद ऋणात्मक लट्ठे होते। सिर्फ़ 16 समझ में आता है।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    b.when(treeQ.on(QuestionSignal.Correct), theBoard.show(logQ));
    b.when(logQ.on(QuestionSignal.Correct), theBoard.pass());
    return column([
      w.title(t("A week of sums", "योगों वाला हफ़्ता")),
      w.body(
        t(
          "That week, sums turn up everywhere. On Monday the school starts a tree-planting drive.",
          "उस हफ़्ते योग हर जगह मिलते हैं। सोमवार को स्कूल में पेड़ लगाने का अभियान शुरू होता है।",
        ),
      ),
      trees,
      treeQ,
      w.body(
        t(
          "On Saturday, at Grandpa's village, there is a stack of logs by the road.",
          "शनिवार को, दादाजी के गाँव में, सड़क किनारे लट्ठों का एक ढेर है।",
        ),
      ),
      logs,
      logQ,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** The potato race worked; Exercise 5.3 Q4 and Q15; the mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const race = sceneOn(
      b,
      "race",
      ApSceneKind.PotatoRace,
      "Sports Day potato race: a bucket at the start, potatoes in a line 5 m, 8 m, 11 m, … away, Kabir running",
    );
    const q4 = choiceQuestion(b, {
      name: "q4",
      prompt: t(
        "How many terms of 9, 17, 25, … must be taken to give a sum of 636?",
        "9, 17, 25, … के कितने पद लेने पर योग 636 होगा?",
      ),
      options: [
        { id: "right", label: t("12", "12") },
        {
          id: "13",
          label: t("13", "13"),
          feedback: t(
            r`$\frac{n}{2}[18 + 8(n - 1)] = 636$ gives $4n^2 + 5n - 636 = 0$. Check $n = 12$: $6[18 + 88] = 636$.`,
            r`$\frac{n}{2}[18 + 8(n - 1)] = 636$ से $4n^2 + 5n - 636 = 0$। $n = 12$ जाँचो: $6[18 + 88] = 636$।`,
          ),
        },
        {
          id: "71",
          label: t("71", "71"),
          feedback: t(
            r`That's $636 \div 9$, as if every term were 9. The terms grow by 8 each time.`,
            r`यह $636 \div 9$ है, मानो हर पद 9 हो। पद हर बार 8 बढ़ते हैं।`,
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const penalty = choiceQuestion(b, {
      name: "penalty",
      prompt: t(
        "A contractor's penalty is ₹200 for the first day late, ₹250 for the second, ₹300 for the third, and so on. What is the penalty for 30 days?",
        "एक ठेकेदार का जुर्माना देरी के पहले दिन ₹200, दूसरे दिन ₹250, तीसरे दिन ₹300, और इसी तरह है। 30 दिनों का जुर्माना कितना है?",
      ),
      options: [
        { id: "right", label: t("₹27,750", "₹27,750") },
        {
          id: "1650",
          label: t("₹1,650", "₹1,650"),
          feedback: t(
            "₹1,650 is the 30th day's penalty alone. Add all 30 days.",
            "₹1,650 सिर्फ़ 30वें दिन का जुर्माना है। सारे 30 दिन जोड़ो।",
          ),
        },
        {
          id: "28500",
          label: t("₹28,500", "₹28,500"),
          feedback: t(
            r`Use $n - 1 = 29$: $15[400 + 29 \times 50] = 15 \times 1850 = 27750$.`,
            r`$n - 1 = 29$ लो: $15[400 + 29 \times 50] = 15 \times 1850 = 27750$।`,
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const log = w.definition(
      t(
        r`**Mission log.** ✓ The sum works backwards too: know three of $S$, $a$, $d$, $n$ and find the fourth. ✓ Kabir's box reaches ₹4,000 after week 25, five weeks before his birthday. Next: a few of Grandpa's challenges while we wait, and the birthday itself.`,
        r`**मिशन लॉग।** ✓ योग उलटा भी चलता है: $S$, $a$, $d$, $n$ में से तीन पता हों तो चौथा निकालो। ✓ कबीर की गुल्लक हफ़्ता 25 के बाद ₹4,000 तक पहुँचती है, जन्मदिन से पाँच हफ़्ते पहले। आगे: इंतज़ार करते हुए दादाजी की कुछ चुनौतियाँ, और ख़ुद जन्मदिन।`,
      ),
      "log",
      { isHidden: true },
    );
    b.when(q4.on(QuestionSignal.Correct), theBoard.show(penalty));
    b.when(penalty.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([
      w.title(t("Your turn", "अब तुम्हारी बारी")),
      race,
      w.body(
        t(
          r`**Worked: the potato race.** The bucket is 5 m from the first potato and the potatoes are 3 m apart; there are 10. For each potato Kabir runs there and back, so the distances are $2 \times 5$, $2 \times 8$, $2 \times 11$, …. $$2(5 + 8 + \dots + 32) = 2 \times \frac{10}{2}(5 + 32) = 370$$ He runs **370 m**.`,
          r`**हल किया हुआ: आलू दौड़।** बाल्टी पहले आलू से 5 m दूर है और आलू 3 m के अंतर पर हैं; कुल 10 हैं। हर आलू के लिए कबीर जाता है और लौटता है, तो दूरियाँ हैं $2 \times 5$, $2 \times 8$, $2 \times 11$, …। $$2(5 + 8 + \dots + 32) = 2 \times \frac{10}{2}(5 + 32) = 370$$ वह **370 m** दौड़ता है।`,
        ),
      ),
      q4,
      penalty,
      log,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [hook, fourth, quadratic, rule, tv, inLife, school, yourTurn];

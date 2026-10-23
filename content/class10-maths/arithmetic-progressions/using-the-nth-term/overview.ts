import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, goalQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import { ApSceneKind, NthAction, NthSignal, apSequenceDef, nthTermDef } from "@chalk/prop-ap";
import { sceneOn } from "../kit";

const r = String.raw;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** Recap, then Mom's flower bed: how many rows? */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const bed = sceneOn(
    b,
    "bed",
    ApSceneKind.FlowerBed,
    "Mom's rose bed in rows, each row a little shorter than the one before; Mom and Riya beside it",
  );
  return column([
    w.title(t("How many rows?", "कितनी पंक्तियाँ?")),
    bed,
    w.body(
      t(
        r`Last stop gave us any term at once: $a_n = a + (n - 1)d$. On Sunday Mom plants her rose bed: 23 plants in the first row, 21 in the second, 19 in the third, and so on, down to 5 in the last row. "How many rows will that be?" she asks.`,
        r`पिछले पड़ाव ने हमें कोई भी पद तुरंत दे दिया: $a_n = a + (n - 1)d$। रविवार को मम्मी गुलाब की क्यारी लगाती हैं: पहली पंक्ति में 23 पौधे, दूसरी में 21, तीसरी में 19, और इसी तरह, आख़िरी पंक्ति में 5 तक। "कितनी पंक्तियाँ बनेंगी?" वे पूछती हैं।`,
      ),
    ),
    w.body(
      t(
        "This lesson uses the nth term to count, to work from the end of a list, and to answer questions like Mom's.",
        "यह पाठ n वें पद से गिनना, सूची के अंत से चलना, और मम्मी जैसे सवालों के जवाब देना सिखाता है।",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Example 7: counting with the nth term: two-digit numbers divisible by 3. */
const counting = page(
  "counting",
  (b) => {
    const w = wordsOn(b);
    const solve = b.prop(nthTermDef, "solve", {
      a: 12,
      d: 3,
      n: 1,
      nMax: 40,
      canMoveN: false,
      showFormula: false,
      target: 99,
      canStep: true,
    });
    b.studentOnly(solve.action(NthAction.Next));
    b.standsFor(
      solve,
      "the AP 12, 15, 18, …, 99 with the question 'which term is 99?'; the learner steps through solving for n",
    );
    const done = w.body(
      t(
        "So 99 is the 30th term: there are **30** two-digit numbers divisible by 3. The number of the last term is how many terms there are.",
        "तो 99, 30वाँ पद है: 3 से विभाज्य दो अंकों वाली **30** संख्याएँ हैं। अंतिम पद की क्रम-संख्या ही पदों की कुल संख्या है।",
      ),
      "done",
      { isHidden: true },
    );
    b.when(solve.on(NthSignal.Solved), theBoard.show(done));
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "How many multiples of 4 lie between 10 and 250?",
        "10 और 250 के बीच 4 के कितने गुणज हैं?",
      ),
      options: [
        { id: "right", label: t("60", "60") },
        {
          id: "62",
          label: t("62", "62"),
          feedback: t(
            r`$250 \div 4$ is about 62, but the list starts at 12 (the first multiple after 10) and ends at 248: $248 = 12 + (n - 1) \times 4$ gives $n = 60$.`,
            r`$250 \div 4$ लगभग 62 है, पर सूची 12 (10 के बाद पहला गुणज) से शुरू होकर 248 पर ख़त्म होती है: $248 = 12 + (n - 1) \times 4$ से $n = 60$।`,
          ),
        },
        {
          id: "59",
          label: t("59", "59"),
          feedback: t(
            r`You found $n - 1 = 59$. Add 1: $n = 60$.`,
            r`तुम्हें $n - 1 = 59$ मिला। 1 जोड़ो: $n = 60$।`,
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Counting with the nth term", "n वें पद से गिनना")),
      w.body(
        t(
          r`**Example 7:** how many two-digit numbers are divisible by 3? Write them in order: 12, 15, 18, …, 99. That is an AP with $a = 12$, $d = 3$ and last term 99. Find which term 99 is.`,
          r`**उदाहरण 7:** दो अंकों की कितनी संख्याएँ 3 से विभाज्य हैं? उन्हें क्रम में लिखो: 12, 15, 18, …, 99। यह AP है, जिसमें $a = 12$, $d = 3$ और अंतिम पद 99। पता करो कि 99 कौन-सा पद है।`,
        ),
      ),
      solve,
      done,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Example 8: the 11th term from the end; reverse the AP. */
const fromEnd = page(
  "from-end",
  (b) => {
    const w = wordsOn(b);
    const back = b.prop(apSequenceDef, "back", {
      a: -62,
      d: 3,
      count: 6,
      canReveal: false,
      showGeneral: false,
      isEndless: true,
    });
    b.standsFor(back, "the AP 10, 7, 4, …, −62 written backwards: −62, −59, −56, … with d = 3");
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "Why is the 11th term from the end the **15th** term, and not the 14th?",
        "अंत से 11वाँ पद **15वाँ** पद क्यों है, 14वाँ क्यों नहीं?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "The last term (25th) is the 1st from the end, so the 11th from the end is 25 − 11 + 1",
            "अंतिम पद (25वाँ) अंत से पहला है, इसलिए अंत से 11वाँ है 25 − 11 + 1",
          ),
        },
        {
          id: "minus",
          label: t(
            "Because 25 − 11 = 14 is always one too few",
            "क्योंकि 25 − 11 = 14 हमेशा एक कम होता है",
          ),
          feedback: t(
            "It is one too few, but say why: the count from the end starts at the last term itself, the 25th, as number 1.",
            "यह एक कम है, पर कारण बताओ: अंत से गिनती अंतिम पद, 25वें, को ही 1 मानकर शुरू होती है।",
          ),
        },
        {
          id: "d",
          label: t("Because d is negative", "क्योंकि d ऋणात्मक है"),
          feedback: t(
            "The sign of d doesn't matter here; it's only about counting positions from the end.",
            "यहाँ d के चिह्न से कोई फ़र्क़ नहीं; बात सिर्फ़ अंत से स्थान गिनने की है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Counting from the end", "अंत से गिनना")),
      w.body(
        t(
          r`**Example 8:** find the 11th term from the last of 10, 7, 4, …, −62. Here $a = 10$, $d = -3$, $l = -62$. First count the terms: $$-62 = 10 + (n - 1)(-3) \quad\Rightarrow\quad n = 25$$ The 11th from the end is the 15th term: $$a_{15} = 10 + 14 \times (-3) = -32$$`,
          r`**उदाहरण 8:** 10, 7, 4, …, −62 का अंतिम पद से 11वाँ पद ज्ञात करो। यहाँ $a = 10$, $d = -3$, $l = -62$। पहले पद गिनो: $$-62 = 10 + (n - 1)(-3) \quad\Rightarrow\quad n = 25$$ अंत से 11वाँ पद 15वाँ पद है: $$a_{15} = 10 + 14 \times (-3) = -32$$`,
        ),
      ),
      w.definition(
        t(
          r`**A shortcut: reverse the AP.** Read the list backwards and it is still an AP, starting at the last term with the opposite difference: $a = -62$, $d = 3$. Then the 11th term from the end is simply $$-62 + 10 \times 3 = -32$$`,
          r`**एक छोटा रास्ता: AP उलटो।** सूची उलटी पढ़ो, तो वह फिर भी AP है, जो अंतिम पद से उलटे अंतर के साथ शुरू होती है: $a = -62$, $d = 3$। तब अंत से 11वाँ पद सीधे है $$-62 + 10 \times 3 = -32$$`,
        ),
      ),
      back,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Example 9: simple interest grows in an AP. */
const interest = page(
  "interest",
  (b) => {
    const w = wordsOn(b);
    const si = b.prop(apSequenceDef, "si", {
      a: 80,
      d: 80,
      count: 5,
      canReveal: false,
      showGeneral: false,
      isEndless: true,
      unit: "₹",
    });
    b.standsFor(si, "the interest at the end of years 1 to 5 as bars: ₹80, 160, 240, 320, 400");
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "₹1000 earns 8% simple interest a year. What is the interest at the end of 30 years?",
        "₹1000 पर 8% सालाना साधारण ब्याज मिलता है। 30 साल के अंत में ब्याज कितना है?",
      ),
      options: [
        { id: "right", label: t("₹2400", "₹2400") },
        {
          id: "2320",
          label: t("₹2320", "₹2320"),
          feedback: t(
            r`$a_{30} = 80 + 29 \times 80$. That's 30 lots of 80, not 29.`,
            r`$a_{30} = 80 + 29 \times 80$। यह 80 के 30 हिस्से हैं, 29 नहीं।`,
          ),
        },
        {
          id: "240",
          label: t("₹240", "₹240"),
          feedback: t(
            "That's after 3 years. Use the 30th term of 80, 160, 240, ….",
            "यह 3 साल बाद का है। 80, 160, 240, … का 30वाँ पद लो।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Interest that grows evenly", "बराबर बढ़ता ब्याज")),
      w.body(
        t(
          r`**Example 9:** ₹1000 is invested at 8% simple interest a year. The interest after 1, 2, 3, … years is $$\frac{1000 \times 8 \times 1}{100} = 80, \quad 160, \quad 240, \quad \dots$$ Each year adds another ₹80, so the interests form an AP with $a = 80$, $d = 80$.`,
          r`**उदाहरण 9:** ₹1000, 8% सालाना साधारण ब्याज पर लगाए गए। 1, 2, 3, … साल बाद ब्याज है $$\frac{1000 \times 8 \times 1}{100} = 80, \quad 160, \quad 240, \quad \dots$$ हर साल ₹80 और जुड़ते हैं, तो ब्याज $a = 80$, $d = 80$ वाली AP बनाते हैं।`,
        ),
      ),
      si,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** Example 10 (the flower bed) and Grandpa's ladder, explained. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const rows = b.prop(nthTermDef, "rows", {
      a: 23,
      d: -2,
      n: 1,
      nMax: 15,
      canMoveN: true,
      showFormula: true,
    });
    b.studentOnly(rows.action(NthAction.NudgeN));
    b.standsFor(
      rows,
      "Mom's rose rows 23, 21, 19, … as hops in steps of −2; the learner moves the row number n until the row has 5 plants",
    );
    const goal = goalQuestion(b, {
      about: rows,
      prompt: t(
        "Find the row with only 5 plants: move n until the term is 5.",
        "सिर्फ़ 5 पौधों वाली पंक्ति खोजो: n को तब तक बदलो जब तक पद 5 न हो जाए।",
      ),
      isMet: rows.field("n").eq(10),
      solve: Array.from({ length: 9 }, () => rows.learner(NthAction.NudgeN, { by: 1 })),
    });
    const ladder = choiceQuestion(b, {
      name: "ladder",
      prompt: t(
        "Grandpa's ladder has 8 rungs. The bottom one is 45 cm and each is 2 cm shorter than the one below. How long is the top rung?",
        "दादाजी की सीढ़ी में 8 डंडे हैं। सबसे नीचे वाला 45 cm का है और हर डंडा नीचे वाले से 2 cm छोटा है। सबसे ऊपर वाला डंडा कितना लंबा है?",
      ),
      options: [
        { id: "right", label: t("31 cm", "31 cm") },
        {
          id: "29",
          label: t("29 cm", "29 cm"),
          feedback: t(
            r`From the 1st rung to the 8th is 7 steps: $45 + 7 \times (-2) = 31$.`,
            r`पहले से 8वें डंडे तक 7 क़दम हैं: $45 + 7 \times (-2) = 31$।`,
          ),
        },
        {
          id: "61",
          label: t("61 cm", "61 cm"),
          feedback: t(
            "The rungs get shorter going up, so d = −2.",
            "ऊपर जाते हुए डंडे छोटे होते हैं, तो d = −2।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
    });
    const solved = w.body(
      t(
        r`Solving: $-18 = (n - 1)(-2)$, so $n - 1 = 9$ and $n = 10$. Mom's bed has **10 rows**. Then Grandpa wants to check his ladder.`,
        r`हल: $-18 = (n - 1)(-2)$, तो $n - 1 = 9$ और $n = 10$। मम्मी की क्यारी में **10 पंक्तियाँ** हैं। फिर दादाजी अपनी सीढ़ी जाँचना चाहते हैं।`,
      ),
      "solved",
      { isHidden: true },
    );
    b.when(goal.on(QuestionSignal.Correct), [theBoard.show(solved), theBoard.show(ladder)]);
    return column([
      w.title(t("Back to the garden", "फिर बग़ीचे में")),
      w.body(
        t(
          r`Mom's rows, 23, 21, 19, …, 5, are an AP with $a = 23$ and $d = -2$. The last row is the $n$th term, with $a_n = 5$: $$5 = 23 + (n - 1)(-2)$$ Try it on the hops first.`,
          r`मम्मी की पंक्तियाँ, 23, 21, 19, …, 5, एक AP हैं, जिसमें $a = 23$ और $d = -2$। आख़िरी पंक्ति $n$ वाँ पद है, जहाँ $a_n = 5$: $$5 = 23 + (n - 1)(-2)$$ पहले छलाँगों पर आज़माओ।`,
        ),
      ),
      rows,
      goal,
      solved,
      ladder,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Exercise 5.2: three-digit multiples of 7, Subba Rao, Ramkali; the mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const seven = choiceQuestion(b, {
      name: "seven",
      prompt: t(
        "How many three-digit numbers are divisible by 7?",
        "तीन अंकों की कितनी संख्याएँ 7 से विभाज्य हैं?",
      ),
      options: [
        { id: "right", label: t("128", "128") },
        {
          id: "129",
          label: t("129", "129"),
          feedback: t(
            r`The list is 105, 112, …, 994. $994 = 105 + (n - 1) \times 7$ gives $n - 1 = 127$, $n = 128$.`,
            r`सूची है 105, 112, …, 994। $994 = 105 + (n - 1) \times 7$ से $n - 1 = 127$, $n = 128$।`,
          ),
        },
        {
          id: "142",
          label: t("142", "142"),
          feedback: t(
            r`That counts multiples of 7 from 7 to 994. Start at the first three-digit one, 105.`,
            r`यह 7 से 994 तक के 7 के गुणज गिनता है। पहले तीन-अंकीय गुणज, 105, से शुरू करो।`,
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const ramkali = choiceQuestion(b, {
      name: "ramkali",
      prompt: t(
        "Ramkali saved ₹5 in the first week and raised her weekly saving by ₹1.75 each week. In which week did she save ₹20.75?",
        "रामकली ने पहले हफ़्ते ₹5 बचाए और हर हफ़्ते अपनी बचत ₹1.75 बढ़ाई। किस हफ़्ते उसने ₹20.75 बचाए?",
      ),
      options: [
        { id: "right", label: t("Week 10", "हफ़्ता 10") },
        {
          id: "9",
          label: t("Week 9", "हफ़्ता 9"),
          feedback: t(
            r`$20.75 = 5 + (n - 1) \times 1.75$ gives $n - 1 = 9$, so $n = 10$.`,
            r`$20.75 = 5 + (n - 1) \times 1.75$ से $n - 1 = 9$, तो $n = 10$।`,
          ),
        },
        {
          id: "12",
          label: t("Week 12", "हफ़्ता 12"),
          feedback: t(
            r`That's $20.75 \div 1.75$, rounded. Start from her first week's ₹5.`,
            r`यह $20.75 \div 1.75$ है, पूर्णांकित। उसके पहले हफ़्ते के ₹5 से शुरू करो।`,
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const log = w.definition(
      t(
        r`**Mission log.** ✓ The nth term counts: how many terms, which term from the end, which week. ✓ Mom's bed has 10 rows; the ladder's top rung is 31 cm. ✗ The money box still needs a total, not just one week. Next stop: adding the terms up, fast.`,
        r`**मिशन लॉग।** ✓ n वाँ पद गिनता है: कितने पद, अंत से कौन-सा पद, कौन-सा हफ़्ता। ✓ मम्मी की क्यारी में 10 पंक्तियाँ हैं; सीढ़ी का सबसे ऊपर का डंडा 31 cm का है। ✗ गुल्लक के लिए अब भी कुल चाहिए, सिर्फ़ एक हफ़्ता नहीं। अगला पड़ाव: पदों को तेज़ी से जोड़ना।`,
      ),
      "log",
      { isHidden: true },
    );
    b.when(seven.on(QuestionSignal.Correct), theBoard.show(ramkali));
    b.when(ramkali.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([
      w.title(t("Your turn", "अब तुम्हारी बारी")),
      w.body(
        t(
          r`**Worked: Subba Rao started work in 1995 at ₹5000 a year, rising by ₹200 a year. In which year did his income reach ₹7000?** $$7000 = 5000 + (n - 1) \times 200$$ $$n - 1 = 10, \quad n = 11$$ The 11th year counting 1995 as the first is **2005**.`,
          r`**हल किया हुआ: सुब्बा राव ने 1995 में ₹5000 सालाना पर काम शुरू किया, हर साल ₹200 की बढ़ोतरी के साथ। किस साल उनकी आय ₹7000 पहुँची?** $$7000 = 5000 + (n - 1) \times 200$$ $$n - 1 = 10, \quad n = 11$$ 1995 को पहला साल मानकर 11वाँ साल **2005** है।`,
        ),
      ),
      seven,
      ramkali,
      log,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [hook, counting, fromEnd, interest, inLife, yourTurn];

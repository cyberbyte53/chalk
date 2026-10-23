import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, goalQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  ApSceneKind,
  NthAction,
  NthDerived,
  SequenceAction,
  SequenceDerived,
  Verdict,
  apSequenceDef,
  nthTermDef,
} from "@chalk/prop-ap";
import { sceneOn } from "../kit";

const r = String.raw;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** Recap, then the wait: Grandpa's puzzles until the birthday. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const slate = sceneOn(
    b,
    "slate",
    ApSceneKind.GaussSlate,
    "Grandpa at his slate with a new puzzle chalked up, Kabir watching",
  );
  return column([
    w.title(t("Five weeks to wait", "पाँच हफ़्तों का इंतज़ार")),
    slate,
    w.body(
      t(
        r`The plan works: the box reaches ₹4,000 after week 25, and Kabir's birthday is in week 30. Five weeks of waiting is too long for Kabir, so Grandpa keeps him busy with puzzles. Each one uses everything so far: the nth term, the sum, and a little algebra.`,
        r`योजना काम करती है: हफ़्ता 25 के बाद गुल्लक ₹4,000 तक पहुँचती है, और कबीर का जन्मदिन हफ़्ता 30 में है। कबीर के लिए पाँच हफ़्ते का इंतज़ार बहुत लंबा है, तो दादाजी उसे पहेलियों में उलझाए रखते हैं। हर पहेली में अब तक का सब कुछ लगता है: n वाँ पद, योग, और थोड़ा बीजगणित।`,
      ),
    ),
    w.note(
      t(
        "These are NCERT's optional exercises (Exercise 5.4): good practice, not needed for the exam.",
        "ये NCERT के वैकल्पिक अभ्यास (प्रश्नावली 5.4) हैं: अच्छा अभ्यास, परीक्षा के लिए ज़रूरी नहीं।",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Exercise 5.4 Q1: the first negative term, from an inequality on n. */
const negative = page(
  "negative",
  (b) => {
    const w = wordsOn(b);
    const hops = b.prop(nthTermDef, "hops", {
      a: 121,
      d: -4,
      n: 28,
      nMax: 40,
      canMoveN: true,
      showFormula: true,
    });
    b.studentOnly(hops.action(NthAction.NudgeN));
    b.standsFor(
      hops,
      "the AP 121, 117, 113, … as hops of −4; the learner moves n and reads the term",
    );
    const goal = goalQuestion(b, {
      about: hops,
      prompt: t("Move n to the first term that is negative.", "n को पहले ऋणात्मक पद तक ले जाओ।"),
      isMet: hops.derived(NthDerived.Term).eq(-3),
      solve: Array.from({ length: 4 }, () => hops.learner(NthAction.NudgeN, { by: 1 })),
      notes: [
        {
          when: hops.derived(NthDerived.Term).gt(-1),
          say: t(
            "This term is not negative yet. Move n further.",
            "यह पद अभी ऋणात्मक नहीं है। n आगे बढ़ाओ।",
          ),
          reach: [],
        },
        {
          when: hops.derived(NthDerived.Term).lt(-3),
          say: t(
            "This term is negative, but is it the first? Check the one before it.",
            "यह पद ऋणात्मक है, पर क्या यह पहला है? इससे पहले वाला जाँचो।",
          ),
          reach: Array.from({ length: 6 }, () => hops.learner(NthAction.NudgeN, { by: 1 })),
        },
      ],
    });
    return column([
      w.title(t("The first negative term", "पहला ऋणात्मक पद")),
      w.body(
        t(
          r`**Which term of 121, 117, 113, … is its first negative term?** Here $a = 121$, $d = -4$, so $a_n = 125 - 4n$. We want $a_n < 0$: $$125 - 4n < 0 \quad\Rightarrow\quad n > 31\tfrac{1}{4}$$ The first whole number bigger than $31\frac{1}{4}$ is 32.`,
          r`**121, 117, 113, … का कौन-सा पद उसका पहला ऋणात्मक पद है?** यहाँ $a = 121$, $d = -4$, तो $a_n = 125 - 4n$। हमें चाहिए $a_n < 0$: $$125 - 4n < 0 \quad\Rightarrow\quad n > 31\tfrac{1}{4}$$ $31\frac{1}{4}$ से बड़ी पहली पूर्ण संख्या 32 है।`,
        ),
      ),
      hops,
      goal,
      w.body(
        t(
          r`$a_{31} = 1$ and $a_{32} = -3$: the **32nd** term is the first negative one.`,
          r`$a_{31} = 1$ और $a_{32} = -3$: **32वाँ** पद पहला ऋणात्मक पद है।`,
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The note to the reader: the arithmetic mean. */
const mean = page(
  "mean",
  (b) => {
    const w = wordsOn(b);
    const three = b.prop(apSequenceDef, "three", {
      values: [6, 10, 14],
      canReveal: true,
      isEndless: false,
    });
    b.studentOnly(three.action(SequenceAction.Reveal));
    b.standsFor(
      three,
      "three numbers 6, 10, 14 as bars; the middle one is halfway between the others",
    );
    const goal = goalQuestion(b, {
      about: three,
      prompt: t("Check that 6, 10, 14 is an AP.", "जाँचो कि 6, 10, 14 एक AP है।"),
      isMet: three.derived(SequenceDerived.Verdict).eq(Verdict.IsAP),
      solve: [three.learner(SequenceAction.Reveal), three.learner(SequenceAction.Reveal)],
    });
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t("What is the arithmetic mean of 13 and 27?", "13 और 27 का समांतर माध्य क्या है?"),
      options: [
        { id: "right", label: t("20", "20") },
        {
          id: "14",
          label: t("14", "14"),
          feedback: t(
            r`14 is the gap $27 - 13$. The mean is halfway: $\frac{13 + 27}{2} = 20$.`,
            r`14 अंतर $27 - 13$ है। माध्य बीच में है: $\frac{13 + 27}{2} = 20$।`,
          ),
        },
        {
          id: "40",
          label: t("40", "40"),
          feedback: t("40 is the total. Halve it.", "40 योग है। आधा करो।"),
        },
      ],
      answer: "right",
      isHidden: true,
    });
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(ask));
    return column([
      w.title(t("The middle term", "बीच का पद")),
      w.body(
        t(
          r`If three numbers $a, b, c$ are in AP, then $b - a = c - b$. That gives $2b = a + c$, so the middle one is exactly halfway: $$b = \frac{a + c}{2}$$`,
          r`अगर तीन संख्याएँ $a, b, c$ AP में हैं, तो $b - a = c - b$। इससे $2b = a + c$, तो बीच वाली ठीक आधे रास्ते पर है: $$b = \frac{a + c}{2}$$`,
        ),
      ),
      w.definition(
        t(
          r`**Arithmetic mean.** If $a, b, c$ are in AP, $b = \frac{a + c}{2}$ is called the **arithmetic mean** of $a$ and $c$.`,
          r`**समांतर माध्य।** अगर $a, b, c$ AP में हैं, तो $b = \frac{a + c}{2}$ को $a$ और $c$ का **समांतर माध्य** कहते हैं।`,
        ),
      ),
      three,
      goal,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Exercise 5.4 Q2: sum and product of two terms; two APs. */
const puzzle = page(
  "puzzle",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        r`With $d = \tfrac{1}{2}$ we get $a = 1$. What is the sum of the first 16 terms?`,
        r`$d = \tfrac{1}{2}$ पर $a = 1$ मिलता है। पहले 16 पदों का योग क्या है?`,
      ),
      options: [
        { id: "right", label: t("76", "76") },
        {
          id: "20",
          label: t("20", "20"),
          feedback: t(
            r`20 belongs to the other AP ($d = -\tfrac{1}{2}$, $a = 5$). Here $S_{16} = 8[2 + 15 \times \tfrac{1}{2}] = 76$.`,
            r`20 दूसरी AP का है ($d = -\tfrac{1}{2}$, $a = 5$)। यहाँ $S_{16} = 8[2 + 15 \times \tfrac{1}{2}] = 76$।`,
          ),
        },
        {
          id: "8.5",
          label: t(r`$8\tfrac{1}{2}$`, r`$8\tfrac{1}{2}$`),
          feedback: t(
            r`That's the 16th term, $1 + 15 \times \tfrac{1}{2}$. The sum adds all 16.`,
            r`यह 16वाँ पद है, $1 + 15 \times \tfrac{1}{2}$। योग में सारे 16 जुड़ते हैं।`,
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Grandpa's puzzle", "दादाजी की पहेली")),
      w.body(
        t(
          r`**The 3rd and 7th terms of an AP add to 6 and multiply to 8. Find the sum of the first 16 terms.** Adding: $(a + 2d) + (a + 6d) = 6$, so $a + 4d = 3$. Then the two terms are $3 - 2d$ and $3 + 2d$: $$(3 - 2d)(3 + 2d) = 8$$ $$9 - 4d^2 = 8 \quad\Rightarrow\quad d = \pm\tfrac{1}{2}$$`,
          r`**किसी AP के तीसरे और 7वें पदों का योग 6 और गुणनफल 8 है। पहले 16 पदों का योग ज्ञात करो।** जोड़ने पर: $(a + 2d) + (a + 6d) = 6$, तो $a + 4d = 3$। तब दोनों पद हैं $3 - 2d$ और $3 + 2d$: $$(3 - 2d)(3 + 2d) = 8$$ $$9 - 4d^2 = 8 \quad\Rightarrow\quad d = \pm\tfrac{1}{2}$$`,
        ),
      ),
      w.body(
        t(
          r`Two answers for $d$ mean **two different APs** fit. With $d = -\tfrac{1}{2}$, $a = 5$ and $S_{16} = 20$. Now the other one.`,
          r`$d$ के दो उत्तरों का मतलब है **दो अलग AP** फ़िट होती हैं। $d = -\tfrac{1}{2}$ पर $a = 5$ और $S_{16} = 20$। अब दूसरी वाली।`,
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Exercise 5.4 Q3 and Q4: the ladder's wood, the house numbers. */
const ladderAndHouses = page(
  "ladder-and-houses",
  (b) => {
    const w = wordsOn(b);
    const ladder = sceneOn(
      b,
      "ladder",
      ApSceneKind.GrandpaLadder,
      "a ladder whose rungs shrink evenly from 45 cm at the bottom to 25 cm at the top, 25 cm apart",
    );
    const wood = choiceQuestion(b, {
      name: "wood",
      prompt: t(
        r`A ladder's rungs are 25 cm apart, the top and bottom ones $2\tfrac{1}{2}$ m apart, shrinking evenly from 45 cm to 25 cm. How much wood do the rungs need?`,
        r`एक सीढ़ी के डंडे 25 cm के अंतर पर हैं, सबसे ऊपर और नीचे वाले $2\tfrac{1}{2}$ m दूर, 45 cm से 25 cm तक बराबर घटते हुए। डंडों के लिए कितनी लकड़ी चाहिए?`,
      ),
      options: [
        { id: "right", label: t("385 cm", "385 cm") },
        {
          id: "350",
          label: t("350 cm", "350 cm"),
          feedback: t(
            r`There are $\frac{250}{25} + 1 = 11$ rungs, not 10: count both ends. Then $\frac{11}{2}(45 + 25) = 385$.`,
            r`$\frac{250}{25} + 1 = 11$ डंडे हैं, 10 नहीं: दोनों सिरे गिनो। फिर $\frac{11}{2}(45 + 25) = 385$।`,
          ),
        },
        {
          id: "70",
          label: t("70 cm", "70 cm"),
          feedback: t(
            "That's just the top and bottom rungs together. Add all 11.",
            "यह सिर्फ़ सबसे ऊपर और नीचे के डंडे मिलाकर है। सारे 11 जोड़ो।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const houses = choiceQuestion(b, {
      name: "houses",
      prompt: t(
        r`Houses in a row are numbered 1 to 49. For house $x$, the numbers before it add up to the same as the numbers after it. Using $\frac{(x - 1)x}{2} = 1225 - \frac{x(x + 1)}{2}$, what is $x$?`,
        r`एक पंक्ति के घरों पर 1 से 49 तक संख्याएँ हैं। घर $x$ के लिए, उससे पहले की संख्याओं का योग उसके बाद की संख्याओं के योग के बराबर है। $\frac{(x - 1)x}{2} = 1225 - \frac{x(x + 1)}{2}$ से $x$ क्या है?`,
      ),
      options: [
        { id: "right", label: t("35", "35") },
        {
          id: "25",
          label: t("25", "25"),
          feedback: t(
            "25 is the middle house, but the numbers after it are bigger, so their sum is bigger. Simplifying gives x² = 1225.",
            "25 बीच का घर है, पर उसके बाद की संख्याएँ बड़ी हैं, तो उनका योग बड़ा है। सरल करने पर x² = 1225।",
          ),
        },
        {
          id: "1225",
          label: t("1225", "1225"),
          feedback: t(
            r`1225 is $1 + 2 + \dots + 49$, and also $x^2$. So $x = \sqrt{1225} = 35$.`,
            r`1225, $1 + 2 + \dots + 49$ है, और $x^2$ भी। तो $x = \sqrt{1225} = 35$।`,
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    b.when(wood.on(QuestionSignal.Correct), theBoard.show(houses));
    b.when(houses.on(QuestionSignal.Correct), theBoard.pass());
    return column([w.title(t("Two more puzzles", "दो और पहेलियाँ")), ladder, wood, houses, space()]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** The finale: the box opened, the cycle bought, all the stops. */
const finale = page(
  "finale",
  (b) => {
    const w = wordsOn(b);
    const ride = sceneOn(
      b,
      "ride",
      ApSceneKind.CycleDay,
      "Kabir's birthday: Kabir riding the new blue cycle home, the family waving, the empty tin money box on the step",
    );
    const left = choiceQuestion(b, {
      name: "left",
      prompt: t(
        "Kabir kept saving his ₹5-more-each-week plan until his birthday, week 30. How much was in the box then?",
        "कबीर ने अपनी हर हफ़्ते ₹5 ज़्यादा वाली योजना जन्मदिन, हफ़्ता 30, तक जारी रखी। तब गुल्लक में कितना था?",
      ),
      options: [
        { id: "right", label: t("₹5,175", "₹5,175") },
        {
          id: "4000",
          label: t("₹4,000", "₹4,000"),
          feedback: t(
            "₹4,000 was after week 25. He kept going for 5 more weeks.",
            "₹4,000 हफ़्ता 25 के बाद था। वह 5 हफ़्ते और चलता रहा।",
          ),
        },
        {
          id: "245",
          label: t("₹245", "₹245"),
          feedback: t(
            r`₹245 is week 30's saving alone, $100 + 29 \times 5$. The box holds all 30 weeks: $15[200 + 29 \times 5] = 5175$.`,
            r`₹245 सिर्फ़ हफ़्ते 30 की बचत है, $100 + 29 \times 5$। गुल्लक में सारे 30 हफ़्ते हैं: $15[200 + 29 \times 5] = 5175$।`,
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Kabir's birthday", "कबीर का जन्मदिन")),
      ride,
      w.body(
        t(
          "Week 30. The tin is opened on the kitchen table, the notes counted twice, and by evening Kabir is riding the blue cycle home from the shop on the main road, ringing the bell all the way.",
          "हफ़्ता 30। रसोई की मेज़ पर डिब्बा खोला जाता है, नोट दो बार गिने जाते हैं, और शाम तक कबीर मुख्य सड़क की दुकान से नीली साइकिल पर घर लौट रहा है, पूरे रास्ते घंटी बजाते हुए।",
        ),
      ),
      w.definition(
        t(
          r`**Mission complete.** (1) **Spot the pattern:** an AP adds the same $d$ each time; test a list by its differences. (2) **Any term:** $a_n = a + (n - 1)d$, so week 20 was ₹195. (3) **Using it:** count terms, work from the end, decide whether a number is a term at all. (4) **The total:** $S_n = \frac{n}{2}[2a + (n - 1)d] = \frac{n}{2}(a + l)$, so 20 weeks made ₹2,950. (5) **Backwards:** $S_n = 4000$ gave a quadratic, and week 25.`,
          r`**मिशन पूरा।** (1) **पैटर्न पहचानो:** AP हर बार वही $d$ जोड़ती है; सूची को उसके अंतरों से जाँचो। (2) **कोई भी पद:** $a_n = a + (n - 1)d$, तो हफ़्ता 20 ₹195 का था। (3) **उपयोग:** पद गिनो, अंत से चलो, तय करो कि कोई संख्या पद है भी या नहीं। (4) **कुल:** $S_n = \frac{n}{2}[2a + (n - 1)d] = \frac{n}{2}(a + l)$, तो 20 हफ़्तों में ₹2,950 बने। (5) **उलटा:** $S_n = 4000$ से एक द्विघात मिला, और हफ़्ता 25।`,
        ),
      ),
      left,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Exercise 5.4 Q5: the terrace's concrete. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const terrace = choiceQuestion(b, {
      name: "terrace",
      prompt: t(
        r`A terrace has 15 steps, each 50 m long, with a rise of $\tfrac{1}{4}$ m and a tread of $\tfrac{1}{2}$ m. The first step needs $\tfrac{1}{4} \times \tfrac{1}{2} \times 50$ m³ of concrete, the second twice that, and so on. How much concrete in all?`,
        r`एक सीढ़ीदार चबूतरे में 15 सीढ़ियाँ हैं, हर एक 50 m लंबी, $\tfrac{1}{4}$ m ऊँचाई और $\tfrac{1}{2}$ m चौड़ाई वाली। पहली सीढ़ी में $\tfrac{1}{4} \times \tfrac{1}{2} \times 50$ m³ कंक्रीट लगता है, दूसरी में उसका दुगुना, और इसी तरह। कुल कितना कंक्रीट?`,
      ),
      options: [
        { id: "right", label: t("750 m³", "750 m³") },
        {
          id: "93.75",
          label: t("93.75 m³", "93.75 m³"),
          feedback: t(
            r`That's the 15th step alone, $15 \times 6.25$. Add all 15: $6.25 \times (1 + 2 + \dots + 15) = 6.25 \times 120$.`,
            r`यह सिर्फ़ 15वीं सीढ़ी है, $15 \times 6.25$। सारी 15 जोड़ो: $6.25 \times (1 + 2 + \dots + 15) = 6.25 \times 120$।`,
          ),
        },
        {
          id: "375",
          label: t("375 m³", "375 m³"),
          feedback: t(
            r`$1 + 2 + \dots + 15 = \frac{15 \times 16}{2} = 120$, not 60.`,
            r`$1 + 2 + \dots + 15 = \frac{15 \times 16}{2} = 120$, 60 नहीं।`,
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Your turn", "अब तुम्हारी बारी")),
      w.body(
        t(
          r`One last puzzle from Grandpa, from the football ground's terrace. Each step's concrete is a block $\tfrac{1}{4}$ m high, $\tfrac{1}{2}$ m deep and 50 m long, stacked: the volumes are $6.25, 12.5, 18.75, \dots$ m³, an AP with $a = d = 6.25$.`,
          r`दादाजी की आख़िरी पहेली, फ़ुटबॉल मैदान के चबूतरे से। हर सीढ़ी का कंक्रीट एक ब्लॉक है, $\tfrac{1}{4}$ m ऊँचा, $\tfrac{1}{2}$ m गहरा और 50 m लंबा, एक के ऊपर एक: आयतन हैं $6.25, 12.5, 18.75, \dots$ m³, $a = d = 6.25$ वाली AP।`,
        ),
      ),
      terrace,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [hook, negative, mean, puzzle, ladderAndHouses, yourTurn, finale];

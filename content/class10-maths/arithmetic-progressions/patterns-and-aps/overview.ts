import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, goalQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  ApSceneKind,
  SequenceAction,
  SequenceDerived,
  Verdict,
  apSequenceDef,
} from "@chalk/prop-ap";
import { sceneOn } from "../kit";

const r = String.raw;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** Who, where, what: after the mela, Kabir's share goes into a tin, and a cycle plan. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const box = sceneOn(
    b,
    "box",
    ApSceneKind.MoneyBox,
    "Kabir dropping a note into an old tin money box on the table; Riya beside a chart on the wall whose bars grow by the same step each week",
  );
  return column([
    w.title(t("Kabir's money box", "कबीर की गुल्लक")),
    box,
    w.body(
      t(
        "The mela is over, and 10B's stall made a profit. Every helper gets a share, and Kabir's ₹100 goes straight into an old tin money box. He has seen a cycle in the shop on the main road, ₹4,000, and he announces that he will buy it himself, by his next birthday.",
        "मेला ख़त्म हो गया, और 10B के स्टॉल को मुनाफ़ा हुआ। हर मददगार को हिस्सा मिला, और कबीर के ₹100 सीधे एक पुराने टिन के डिब्बे वाली गुल्लक में गए। उसने मुख्य सड़क की दुकान में ₹4,000 की एक साइकिल देखी है, और वह घोषणा करता है कि अगले जन्मदिन तक वह उसे ख़ुद ख़रीदेगा।",
      ),
    ),
    w.definition(
      t(
        "**Kabir's plan.** Each week, put in a little more than the week before: ₹100 the first week, ₹105 the second, ₹110 the third, and so on, ₹5 more each time. His ₹100 mela share is week 1. After that, Grandpa matches whatever he earns from odd jobs, so each week can be ₹5 more.",
        "**कबीर की योजना।** हर हफ़्ते पिछले हफ़्ते से थोड़ा ज़्यादा डालना: पहले हफ़्ते ₹100, दूसरे में ₹105, तीसरे में ₹110, और इसी तरह, हर बार ₹5 ज़्यादा। मेले से मिला ₹100 का हिस्सा पहला हफ़्ता है। उसके बाद छोटे-मोटे कामों से वह जितना कमाता है, दादाजी उतना ही और दे देते हैं, तो हर हफ़्ते ₹5 ज़्यादा डाल सकता है।",
      ),
    ),
    w.body(
      t(
        "Riya, who planned the whole stall, has questions. How much will he put in during week 20? How much will be in the box after 20 weeks? And in which week will the box finally hold ₹4,000?",
        "रिया, जिसने पूरे स्टॉल की योजना बनाई थी, के पास सवाल हैं। हफ़्ते 20 में वह कितना डालेगा? 20 हफ़्तों बाद गुल्लक में कितना होगा? और किस हफ़्ते गुल्लक में आख़िरकार ₹4,000 होंगे?",
      ),
    ),
    space(),
  ]);
});

/** Why this chapter: lists of numbers that grow by the same step. The stops. */
const why = page("why", (b) => {
  const w = wordsOn(b);
  const shop = sceneOn(
    b,
    "shop",
    ApSceneKind.CycleShop,
    "the goal: a blue cycle in the shop window with a ₹4,000 price tag, Kabir and Mom looking at it",
  );
  return column([
    w.title(t("What this chapter is for", "यह अध्याय किसलिए है")),
    shop,
    w.body(
      t(
        "Kabir's savings make a **list of numbers** with a pattern: 100, 105, 110, …. Each one is the one before plus 5. Lists like this, where you add the same number every time, are called **arithmetic progressions**. This chapter is about them: spotting them, finding any number in the list without writing them all, and adding them up fast.",
        "कबीर की बचत एक पैटर्न वाली **संख्याओं की सूची** बनाती है: 100, 105, 110, …। हर संख्या पिछली संख्या में 5 जोड़कर बनती है। ऐसी सूचियाँ, जिनमें हर बार वही संख्या जोड़ी जाती है, **समांतर श्रेढ़ी** कहलाती हैं। यह अध्याय इन्हीं के बारे में है: इन्हें पहचानना, सारी संख्याएँ लिखे बिना सूची की कोई भी संख्या निकालना, और इन्हें तेज़ी से जोड़ना।",
      ),
    ),
    w.definition(
      t(
        "**The stops on the way.** (1) Spotting the pattern: *this lesson*. (2) Any term, instantly: the nth term. (3) Using the nth term to count and to answer real questions. (4) The total: the sum of the first n terms. (5) Using the sum, all the way to ₹4,000. Then a few challenges, and Kabir's birthday.",
        "**रास्ते के पड़ाव।** (1) पैटर्न पहचानना: *यह पाठ*। (2) कोई भी पद, तुरंत: n वाँ पद। (3) n वें पद से गिनना और असली सवालों के जवाब देना। (4) कुल: पहले n पदों का योग। (5) योग का उपयोग, ₹4,000 तक। फिर कुछ चुनौतियाँ, और कबीर का जन्मदिन।",
      ),
    ),
    w.body(
      t(
        "First stop: which lists of numbers are arithmetic progressions, and how can you tell?",
        "पहला पड़ाव: संख्याओं की कौन-सी सूचियाँ समांतर श्रेढ़ी हैं, और यह कैसे पता चले?",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Lists and terms; NCERT 5.1's everyday patterns, some adding a fixed number and some not. */
const patterns = page(
  "patterns",
  (b) => {
    const w = wordsOn(b);
    const which = choiceQuestion(b, {
      name: "which",
      prompt: t(
        "In which of these lists is each number got by **adding the same number** to the one before?",
        "इनमें से किस सूची में हर संख्या पिछली संख्या में **वही संख्या जोड़कर** मिलती है?",
      ),
      options: [
        {
          id: "right",
          label: t("Ladder rungs: 45, 43, 41, 39, … cm", "सीढ़ी के डंडे: 45, 43, 41, 39, … cm"),
        },
        {
          id: "save",
          label: t("Savings: 10000, 12500, 15625, …", "बचत: 10000, 12500, 15625, …"),
          feedback: t(
            "These are got by multiplying by 5/4 each time: the jumps (2500, then 3125) are not the same.",
            "ये हर बार 5/4 से गुणा करके मिलते हैं: उछाल (2500, फिर 3125) एक जैसे नहीं हैं।",
          ),
        },
        {
          id: "rabbit",
          label: t("Rabbit pairs: 1, 1, 2, 3, 5, 8", "ख़रगोशों के जोड़े: 1, 1, 2, 3, 5, 8"),
          feedback: t(
            "The jumps are 0, 1, 1, 2, 3: they keep changing. Each number is the sum of the two before it.",
            "उछाल 0, 1, 1, 2, 3 हैं: वे बदलते रहते हैं। हर संख्या अपने से पहले की दो संख्याओं का योग है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Lists with a pattern", "पैटर्न वाली सूचियाँ")),
      w.definition(
        t(
          "**List and term.** A **list of numbers** is numbers written in a fixed order: a first, a second, a third, and so on. Each number in the list is called a **term**.",
          "**सूची और पद।** **संख्याओं की सूची** एक तय क्रम में लिखी संख्याएँ हैं: पहली, दूसरी, तीसरी, और इसी तरह। सूची की हर संख्या को **पद** कहते हैं।",
        ),
      ),
      w.body(
        t(
          "Patterns turn up everywhere in daily life. Here are six lists of numbers.",
          "पैटर्न रोज़ की ज़िंदगी में हर जगह मिलते हैं। यहाँ संख्याओं की छह सूचियाँ हैं।",
        ),
      ),
      w.definition(
        t(
          "**(i)** Reena's monthly salary, year by year: ₹8000, 8500, 9000, …. **(ii)** The rungs of a ladder, bottom to top: 45, 43, 41, 39, 37, 35, 33, 31 cm. **(iii)** ₹8000 in a scheme that makes it 5/4 times every 3 years. After 3, 6, 9 and 12 years it is: 10000, 12500, 15625, 19531.25. **(iv)** Unit squares in squares of side 1, 2, 3, …: $1^2, 2^2, 3^2, …$ **(v)** Shakila's money box, ₹100 on her daughter's first birthday, ₹50 more each year: 100, 150, 200, 250, …. **(vi)** Pairs of rabbits, month by month: 1, 1, 2, 3, 5, 8.",
          "**(i)** रीना का मासिक वेतन, साल-दर-साल: ₹8000, 8500, 9000, …। **(ii)** एक सीढ़ी के डंडे, नीचे से ऊपर: 45, 43, 41, 39, 37, 35, 33, 31 cm। **(iii)** एक योजना में ₹8000, जो हर 3 साल में 5/4 गुना हो जाते हैं। 3, 6, 9 और 12 साल बाद ये हैं: 10000, 12500, 15625, 19531.25। **(iv)** भुजा 1, 2, 3, … वाले वर्गों में इकाई वर्ग: $1^2, 2^2, 3^2, …$ **(v)** शकीला की गुल्लक, बेटी के पहले जन्मदिन पर ₹100, हर साल ₹50 ज़्यादा: 100, 150, 200, 250, …। **(vi)** ख़रगोशों के जोड़े, महीने-दर-महीने: 1, 1, 2, 3, 5, 8।",
        ),
      ),
      w.body(
        t(
          "In some lists the next term comes from **adding a fixed number**. In others it comes from **multiplying** by a fixed number, or the terms are squares, or something else. This chapter is about the first kind.",
          "कुछ सूचियों में अगला पद **एक तय संख्या जोड़कर** आता है। दूसरों में वह किसी तय संख्या से **गुणा** करके आता है, या पद वर्ग होते हैं, या कुछ और। यह अध्याय पहली तरह की सूचियों के बारे में है।",
        ),
      ),
      which,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Arithmetic progression and common difference, defined; d positive, negative or zero. */
const ap = page(
  "ap",
  (b) => {
    const w = wordsOn(b);
    const seq = b.prop(apSequenceDef, "seq", {
      a: 6,
      d: 3,
      count: 5,
      canSetA: true,
      canSetD: true,
      canReveal: false,
      isEndless: true,
    });
    b.studentOnly(seq.action(SequenceAction.NudgeA));
    b.studentOnly(seq.action(SequenceAction.NudgeD));
    b.standsFor(
      seq,
      "an AP drawn as bars, built from a first term a and a common difference d, both of which the learner can change",
    );
    const zero = choiceQuestion(b, {
      name: "zero",
      prompt: t("Make d = 0. What does the AP look like?", "d = 0 करो। समांतर श्रेढ़ी कैसी दिखती है?"),
      options: [
        { id: "right", label: t("Every term is the same", "हर पद एक जैसा है") },
        {
          id: "stop",
          label: t("It is not an AP any more", "यह अब समांतर श्रेढ़ी नहीं रही"),
          feedback: t(
            "It still is: you add the same number, 0, every time. The common difference can be zero.",
            "अभी भी है: तुम हर बार वही संख्या, 0, जोड़ते हो। सार्व अंतर शून्य हो सकता है।",
          ),
        },
        {
          id: "down",
          label: t("The terms go down", "पद घटते जाते हैं"),
          feedback: t(
            "That happens when d is negative. With d = 0 nothing is added or taken away.",
            "ऐसा तब होता है जब d ऋणात्मक हो। d = 0 पर न कुछ जुड़ता है न घटता है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Arithmetic progression", "समांतर श्रेढ़ी")),
      w.definition(
        t(
          "**Arithmetic progression (AP).** A list of numbers in which each term, except the first, is got by **adding a fixed number** to the term before it. The fixed number is the **common difference** of the AP, written $d$. It can be **positive, negative or zero**.",
          "**समांतर श्रेढ़ी (AP)।** संख्याओं की ऐसी सूची जिसमें पहले पद को छोड़कर हर पद अपने से पहले वाले पद में **एक तय संख्या जोड़कर** मिलता है। यह तय संख्या श्रेढ़ी का **सार्व अंतर** है, जिसे $d$ लिखते हैं। यह **धनात्मक, ऋणात्मक या शून्य** हो सकता है।",
        ),
      ),
      w.body(
        t(
          "So 1, 2, 3, 4, … is an AP with $d = 1$. And 100, 70, 40, 10, … is an AP with $d = -30$: adding −30 is the same as taking away 30. Below, each term is a bar. Change the first term $a$ and the common difference $d$: try a negative $d$, then $d = 0$.",
          "तो 1, 2, 3, 4, … एक AP है, जिसमें $d = 1$। और 100, 70, 40, 10, … एक AP है, जिसमें $d = -30$: −30 जोड़ना 30 घटाने जैसा ही है। नीचे हर पद एक पट्टी है। पहला पद $a$ और सार्व अंतर $d$ बदलो: ऋणात्मक $d$ आज़माओ, फिर $d = 0$।",
        ),
      ),
      seq,
      zero,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Naming: a₁, a₂, …, aₙ; d = aₖ₊₁ − aₖ; general form; finite and infinite; you need a and d. */
const names = page(
  "names",
  (b) => {
    const w = wordsOn(b);
    const seq = b.prop(apSequenceDef, "seq", {
      a: 6,
      d: -3,
      count: 5,
      canSetA: false,
      canSetD: false,
      canReveal: false,
      showGeneral: true,
      isEndless: true,
    });
    b.standsFor(
      seq,
      "the AP 6, 3, 0, −3, −6, … as bars with the general form a, a + d, a + 2d, … written under them",
    );
    const finite = choiceQuestion(b, {
      name: "finite",
      prompt: t(
        "The heights of students in a queue are 147, 148, 149, …, 157 cm. What kind of AP is this?",
        "एक कतार में छात्रों की ऊँचाइयाँ 147, 148, 149, …, 157 cm हैं। यह किस तरह की AP है?",
      ),
      options: [
        { id: "right", label: t("A finite AP, last term 157", "परिमित AP, अंतिम पद 157") },
        {
          id: "infinite",
          label: t("An infinite AP", "अपरिमित AP"),
          feedback: t(
            "The list stops at 157: it has a last term, so it is finite.",
            "सूची 157 पर रुकती है: इसका एक अंतिम पद है, इसलिए यह परिमित है।",
          ),
        },
        {
          id: "not",
          label: t("Not an AP", "AP नहीं है"),
          feedback: t(
            "Each height is 1 cm more than the one before: it is an AP with d = 1.",
            "हर ऊँचाई पिछली से 1 cm ज़्यादा है: यह d = 1 वाली AP है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Naming the terms", "पदों के नाम")),
      w.definition(
        t(
          r`**Notation.** The first term is written $a_1$, the second $a_2$, and the $n$th term $a_n$. Since each term is the one before plus $d$: $$a_2 - a_1 = a_3 - a_2 = \dots = a_n - a_{n-1} = d$$ The first term is also called $a$.`,
          r`**संकेत।** पहले पद को $a_1$ लिखते हैं, दूसरे को $a_2$, और $n$ वें पद को $a_n$। क्योंकि हर पद पिछले पद में $d$ जोड़कर बनता है: $$a_2 - a_1 = a_3 - a_2 = \dots = a_n - a_{n-1} = d$$ पहले पद को $a$ भी कहते हैं।`,
        ),
      ),
      w.definition(
        t(
          r`**General form.** Starting at $a$ and adding $d$ again and again gives $$a,\ a + d,\ a + 2d,\ a + 3d,\ \dots$$ This is the **general form** of an AP.`,
          r`**व्यापक रूप।** $a$ से शुरू करके बार-बार $d$ जोड़ने पर मिलता है $$a,\ a + d,\ a + 2d,\ a + 3d,\ \dots$$ यह AP का **व्यापक रूप** है।`,
        ),
      ),
      seq,
      w.definition(
        t(
          "**Finite and infinite.** An AP with only a fixed number of terms is a **finite AP**; it has a **last term**. An AP that goes on for ever (written with dots, …, at the end) is an **infinite AP**; it has no last term.",
          "**परिमित और अपरिमित।** जिस AP में पदों की संख्या सीमित हो, वह **परिमित AP** है; इसका एक **अंतिम पद** होता है। जो AP हमेशा चलती रहे (अंत में बिंदु, …, लिखकर), वह **अपरिमित AP** है; इसका कोई अंतिम पद नहीं होता।",
        ),
      ),
      w.body(
        t(
          "To know an AP you need **both** the first term $a$ and the common difference $d$. With $a = 6$ and $d = 3$ the AP is 6, 9, 12, 15, …; with $a = 6$ and $d = -3$ it is 6, 3, 0, −3, …. Same start, different AP.",
          "किसी AP को जानने के लिए **दोनों** चाहिए: पहला पद $a$ और सार्व अंतर $d$। $a = 6$ और $d = 3$ से AP है 6, 9, 12, 15, …; $a = 6$ और $d = -3$ से 6, 3, 0, −3, …। शुरुआत वही, AP अलग।",
        ),
      ),
      finite,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Testing a list: subtract each term from the next; one unequal difference and it is not an AP. */
const test = page(
  "test",
  (b) => {
    const w = wordsOn(b);
    const yes = b.prop(apSequenceDef, "yes", {
      values: [4, 10, 16, 22],
      canReveal: true,
      showNext: 2,
      isEndless: true,
    });
    b.studentOnly(yes.action(SequenceAction.Reveal));
    b.standsFor(yes, "the list 4, 10, 16, 22, … as bars; the learner reveals each difference");
    const goal = goalQuestion(b, {
      about: yes,
      prompt: t(
        "Check each difference, one at a time, until you can say whether 4, 10, 16, 22, … is an AP.",
        "हर अंतर एक-एक करके जाँचो, जब तक तुम बता न सको कि 4, 10, 16, 22, … AP है या नहीं।",
      ),
      isMet: yes.derived(SequenceDerived.Verdict).eq(Verdict.IsAP),
      solve: [
        yes.learner(SequenceAction.Reveal),
        yes.learner(SequenceAction.Reveal),
        yes.learner(SequenceAction.Reveal),
      ],
    });
    const no = b.prop(apSequenceDef, "no", {
      values: [-2, 2, -2, 2, -2],
      canReveal: true,
      isEndless: true,
    });
    b.studentOnly(no.action(SequenceAction.Reveal));
    b.standsFor(no, "the list −2, 2, −2, 2, −2, … as bars; the learner reveals each difference");
    const flip = choiceQuestion(b, {
      name: "flip",
      prompt: t("Is −2, 2, −2, 2, −2, … an AP?", "क्या −2, 2, −2, 2, −2, … एक AP है?"),
      options: [
        {
          id: "right",
          label: t("No: the first difference is 4, the next is −4", "नहीं: पहला अंतर 4 है, अगला −4"),
        },
        {
          id: "yes",
          label: t("Yes, d = 4", "हाँ, d = 4"),
          feedback: t(
            "Check the second difference: −2 − 2 = −4, not 4. One different difference is enough to say no.",
            "दूसरा अंतर जाँचो: −2 − 2 = −4, 4 नहीं। एक भी अलग अंतर 'नहीं' कहने के लिए काफ़ी है।",
          ),
        },
        {
          id: "zero",
          label: t("Yes, d = 0, since it keeps coming back", "हाँ, d = 0, क्योंकि यह लौटता रहता है"),
          feedback: t(
            "d = 0 would mean every term is the same. Here the terms keep changing by +4 and −4.",
            "d = 0 का मतलब होता कि हर पद एक जैसा है। यहाँ पद +4 और −4 से बदलते रहते हैं।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Is this list an AP?", "क्या यह सूची AP है?")),
      w.definition(
        t(
          r`**How to test a list.** Subtract each term from **the next one**: $a_2 - a_1$, $a_3 - a_2$, $a_4 - a_3$, …. If every difference is the same, the list is an AP and that difference is $d$. If even one difference is different, it is **not** an AP.`,
          r`**सूची की जाँच कैसे करें।** हर पद को **अगले पद** में से घटाओ: $a_2 - a_1$, $a_3 - a_2$, $a_4 - a_3$, …। अगर हर अंतर एक जैसा है, तो सूची AP है और वही अंतर $d$ है। अगर एक भी अंतर अलग है, तो यह AP **नहीं** है।`,
        ),
      ),
      w.note(
        t(
          "Always the next term minus this one, even when the next one is smaller. For 6, 3, 0, −3, …, the difference is 3 − 6 = −3, not 6 − 3.",
          "हमेशा अगला पद घटा यह पद, तब भी जब अगला छोटा हो। 6, 3, 0, −3, … में अंतर 3 − 6 = −3 है, 6 − 3 नहीं।",
        ),
      ),
      yes,
      goal,
      w.body(
        t(
          "Now a list that keeps flipping. Check its differences too.",
          "अब एक सूची जो उलटती-पलटती रहती है। इसके अंतर भी जाँचो।",
        ),
      ),
      no,
      flip,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Example 1: a fractional AP; d from any two neighbours once you know it's an AP. */
const fractions = page(
  "fractions",
  (b) => {
    const w = wordsOn(b);
    const seq = b.prop(apSequenceDef, "seq", {
      values: [1.5, 0.5, -0.5, -1.5],
      labels: [r`\tfrac{3}{2}`, r`\tfrac{1}{2}`, r`-\tfrac{1}{2}`, r`-\tfrac{3}{2}`],
      canReveal: true,
      isEndless: true,
    });
    b.studentOnly(seq.action(SequenceAction.Reveal));
    b.standsFor(seq, "the AP 3/2, 1/2, −1/2, −3/2, … as bars");
    const dq = choiceQuestion(b, {
      name: "dq",
      prompt: t(
        r`For the AP $\tfrac{3}{2}, \tfrac{1}{2}, -\tfrac{1}{2}, -\tfrac{3}{2}, \dots$, what are $a$ and $d$?`,
        r`AP $\tfrac{3}{2}, \tfrac{1}{2}, -\tfrac{1}{2}, -\tfrac{3}{2}, \dots$ के लिए $a$ और $d$ क्या हैं?`,
      ),
      options: [
        { id: "right", label: t(r`$a = \tfrac{3}{2}$, $d = -1$`, r`$a = \tfrac{3}{2}$, $d = -1$`) },
        {
          id: "plus",
          label: t(r`$a = \tfrac{3}{2}$, $d = 1$`, r`$a = \tfrac{3}{2}$, $d = 1$`),
          feedback: t(
            r`That's this term minus the next. Take the next minus this one: $\tfrac{1}{2} - \tfrac{3}{2} = -1$.`,
            r`यह इस पद में से अगला घटाना है। अगले में से यह घटाओ: $\tfrac{1}{2} - \tfrac{3}{2} = -1$।`,
          ),
        },
        {
          id: "half",
          label: t(r`$a = \tfrac{1}{2}$, $d = -1$`, r`$a = \tfrac{1}{2}$, $d = -1$`),
          feedback: t(r`$a$ is the first term, $\tfrac{3}{2}$.`, r`$a$ पहला पद है, $\tfrac{3}{2}$।`),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Fractions work the same way", "भिन्नें भी ऐसे ही चलती हैं")),
      w.body(
        t(
          "Terms don't have to be whole numbers. Reveal the differences: each one is $\\tfrac{1}{2} - \\tfrac{3}{2} = -1$. Once you know a list is an AP, any two neighbouring terms give you $d$.",
          "पद पूर्ण संख्याएँ होना ज़रूरी नहीं। अंतर खोलो: हर एक $\\tfrac{1}{2} - \\tfrac{3}{2} = -1$ है। जब पता हो कि सूची AP है, तो कोई भी दो पड़ोसी पद $d$ दे देते हैं।",
        ),
      ),
      seq,
      dq,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** Back to the family's lists: Kabir's savings and the ladder are APs; the scheme and rabbits aren't. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const savings = b.prop(apSequenceDef, "savings", {
      values: [100, 105, 110, 115, 120, 125],
      canReveal: true,
      showNext: 2,
      isEndless: true,
      unit: "₹",
    });
    b.studentOnly(savings.action(SequenceAction.Reveal));
    b.standsFor(savings, "Kabir's weekly savings ₹100, 105, 110, 115, 120, 125 as bars");
    const goal = goalQuestion(b, {
      about: savings,
      prompt: t("Check Kabir's savings: is it an AP?", "कबीर की बचत जाँचो: क्या यह AP है?"),
      isMet: savings.derived(SequenceDerived.Verdict).eq(Verdict.IsAP),
      solve: Array.from({ length: 5 }, () => savings.learner(SequenceAction.Reveal)),
    });
    const ladder = sceneOn(
      b,
      "ladder",
      ApSceneKind.GrandpaLadder,
      "Grandpa's wooden ladder, its rungs getting shorter from 45 cm at the bottom to 31 cm at the top",
    );
    const which = choiceQuestion(b, {
      name: "which",
      prompt: t(
        "Grandpa's ladder: 45, 43, 41, …, 31 cm, bottom to top. What is its common difference?",
        "दादाजी की सीढ़ी: 45, 43, 41, …, 31 cm, नीचे से ऊपर। इसका सार्व अंतर क्या है?",
      ),
      options: [
        { id: "right", label: t("−2 cm", "−2 cm") },
        {
          id: "plus",
          label: t("2 cm", "2 cm"),
          feedback: t(
            "The rungs get shorter: next minus this is 43 − 45 = −2.",
            "डंडे छोटे होते जाते हैं: अगला घटा यह 43 − 45 = −2 है।",
          ),
        },
        {
          id: "none",
          label: t("It has none; it's not an AP", "कोई नहीं; यह AP नहीं है"),
          feedback: t(
            "Every rung is 2 cm shorter than the one below: that is a fixed number added each time, −2.",
            "हर डंडा नीचे वाले से 2 cm छोटा है: यह हर बार जोड़ी गई तय संख्या है, −2।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
    });
    const yes = w.body(
      t(
        'Yes: an AP with $a = 100$ and $d = 5$. Grandpa, listening, points at his old ladder: "So is this."',
        'हाँ: $a = 100$ और $d = 5$ वाली AP। दादाजी, जो सुन रहे थे, अपनी पुरानी सीढ़ी की ओर इशारा करते हैं: "यह भी है।"',
      ),
      "yes",
      { isHidden: true },
    );
    b.when(goal.on(QuestionSignal.Correct), [theBoard.show(yes), theBoard.show(which)]);
    return column([
      w.title(t("Back to the money box", "फिर गुल्लक पर")),
      w.body(
        t(
          "Riya writes out the first six weeks of Kabir's plan. Is it really an arithmetic progression?",
          "रिया कबीर की योजना के पहले छह हफ़्ते लिखती है। क्या यह सचमुच समांतर श्रेढ़ी है?",
        ),
      ),
      savings,
      goal,
      yes,
      ladder,
      which,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Example 2 (iv) worked; Exercise 5.1 picks; the mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const taxi = choiceQuestion(b, {
      name: "taxi",
      prompt: t(
        "A taxi charges ₹15 for the first km and ₹8 for each km after that. Do the fares after 1, 2, 3, … km make an AP?",
        "एक टैक्सी पहले km के ₹15 और उसके बाद हर km के ₹8 लेती है। क्या 1, 2, 3, … km के बाद के किराए AP बनाते हैं?",
      ),
      options: [
        { id: "right", label: t("Yes: 15, 23, 31, …, d = 8", "हाँ: 15, 23, 31, …, d = 8") },
        {
          id: "no",
          label: t("No, the first km costs more", "नहीं, पहला km महँगा है"),
          feedback: t(
            "The first term can be anything. What matters is that each later fare is the one before plus 8.",
            "पहला पद कुछ भी हो सकता है। ज़रूरी यह है कि हर अगला किराया पिछले में 8 जोड़कर बने।",
          ),
        },
        {
          id: "d15",
          label: t("Yes, d = 15", "हाँ, d = 15"),
          feedback: t(
            "15 is the first term. The fares go 15, 23, 31, …: they rise by 8.",
            "15 पहला पद है। किराए 15, 23, 31, … चलते हैं: वे 8 से बढ़ते हैं।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const roots = choiceQuestion(b, {
      name: "roots",
      prompt: t(
        r`Is $\sqrt{2}, \sqrt{8}, \sqrt{18}, \sqrt{32}, \dots$ an AP?`,
        r`क्या $\sqrt{2}, \sqrt{8}, \sqrt{18}, \sqrt{32}, \dots$ एक AP है?`,
      ),
      options: [
        {
          id: "right",
          label: t(r`Yes, $d = \sqrt{2}$`, r`हाँ, $d = \sqrt{2}$`),
        },
        {
          id: "no",
          label: t("No, square roots never make an AP", "नहीं, वर्गमूल कभी AP नहीं बनाते"),
          feedback: t(
            r`Simplify first: $\sqrt{8} = 2\sqrt{2}$, $\sqrt{18} = 3\sqrt{2}$, $\sqrt{32} = 4\sqrt{2}$. The list is $\sqrt{2}, 2\sqrt{2}, 3\sqrt{2}, 4\sqrt{2}$.`,
            r`पहले सरल करो: $\sqrt{8} = 2\sqrt{2}$, $\sqrt{18} = 3\sqrt{2}$, $\sqrt{32} = 4\sqrt{2}$। सूची है $\sqrt{2}, 2\sqrt{2}, 3\sqrt{2}, 4\sqrt{2}$।`,
          ),
        },
        {
          id: "six",
          label: t(r`Yes, $d = \sqrt{6}$`, r`हाँ, $d = \sqrt{6}$`),
          feedback: t(
            r`$\sqrt{8} - \sqrt{2}$ is not $\sqrt{6}$: square roots don't subtract that way. $\sqrt{8} = 2\sqrt{2}$, so the difference is $2\sqrt{2} - \sqrt{2} = \sqrt{2}$.`,
            r`$\sqrt{8} - \sqrt{2}$, $\sqrt{6}$ नहीं है: वर्गमूल ऐसे नहीं घटते। $\sqrt{8} = 2\sqrt{2}$, तो अंतर $2\sqrt{2} - \sqrt{2} = \sqrt{2}$ है।`,
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ Kabir's savings, 100, 105, 110, …, are an AP with $a = 100$ and $d = 5$. ✓ We can test any list: the next term minus this one, every time the same. ✗ Week 20 is still a long way down the list. Next stop: any term, without writing them all.",
        "**मिशन लॉग।** ✓ कबीर की बचत, 100, 105, 110, …, एक AP है, जिसमें $a = 100$ और $d = 5$। ✓ हम किसी भी सूची की जाँच कर सकते हैं: अगला पद घटा यह पद, हर बार वही। ✗ हफ़्ता 20 अभी सूची में बहुत आगे है। अगला पड़ाव: सारे पद लिखे बिना कोई भी पद।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(taxi.on(QuestionSignal.Correct), theBoard.show(roots));
    b.when(roots.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([
      w.title(t("Your turn", "अब तुम्हारी बारी")),
      w.body(
        t(
          "**Worked: is 1, 1, 1, 2, 2, 2, 3, 3, 3, … an AP?** The differences are $1 - 1 = 0$, $1 - 1 = 0$, then $2 - 1 = 1$. The first two match but the third does not, so it is **not** an AP.",
          "**हल किया हुआ: क्या 1, 1, 1, 2, 2, 2, 3, 3, 3, … एक AP है?** अंतर हैं $1 - 1 = 0$, $1 - 1 = 0$, फिर $2 - 1 = 1$। पहले दो मिलते हैं पर तीसरा नहीं, इसलिए यह AP **नहीं** है।",
        ),
      ),
      taxi,
      roots,
      log,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [hook, why, patterns, ap, names, test, fractions, inLife, yourTurn];

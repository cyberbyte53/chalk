import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, goalQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import { DataSceneKind, MeanAction, Method, meanTableDef } from "@chalk/prop-data";
import { classes, heading, sceneOn } from "../kit";

const r = String.raw;

/** Table 14.3: the marks in classes of 15. */
const MARKS = classes(10, 15, [2, 3, 7, 6, 6, 6]);
/** Example 2: female teachers (%), classes of 10. */
const TEACHERS = classes(15, 10, [6, 11, 7, 4, 4, 2, 1]);
/** Example 3: wickets taken by 45 bowlers, unequal classes. */
const WICKETS = [
  { lo: 20, hi: 60, f: 7, label: null },
  { lo: 60, hi: 100, f: 5, label: null },
  { lo: 100, hi: 150, f: 16, label: null },
  { lo: 150, hi: 250, f: 12, label: null },
  { lo: 250, hi: 350, f: 2, label: null },
  { lo: 350, hi: 450, f: 3, label: null },
];

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** Kabir's almanac: numbers too big to multiply comfortably. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const ground = sceneOn(
    b,
    "ground",
    DataSceneKind.Cricket,
    "Kabir bowling at the stumps on the school ground; a scoreboard lists wickets per match in groups; Riya keeps the scorebook",
  );
  return column([
    w.title(t("Big numbers", "बड़ी संख्याएँ")),
    ground,
    w.body(
      t(
        'Box one says "about 62". Now Kabir wants a sports corner on the poster, from his cricket almanac, which lists the one-day career wickets of 45 international bowlers. The classes are 20 – 60, 60 – 100, 100 – 150, 150 – 250, …, up to 450.',
        'पहले बक्से में "लगभग 62" लिखा है। अब कबीर पोस्टर पर एक खेल कोना चाहता है, अपनी क्रिकेट पंचांग-पुस्तिका से, जिसमें 45 अंतरराष्ट्रीय गेंदबाज़ों के वनडे करियर के विकेट हैं। वर्ग हैं 20 – 60, 60 – 100, 100 – 150, 150 – 250, …, 450 तक।',
      ),
    ),
    w.body(
      t(
        "Riya starts the direct method and groans: 16 × 125, 12 × 200, 3 × 400. Every product is big, and one slip spoils the answer. Is there a way to make the numbers smaller first?",
        "रिया प्रत्यक्ष विधि शुरू करती है और कराहती है: 16 × 125, 12 × 200, 3 × 400। हर गुणनफल बड़ा है, और एक भी चूक उत्तर बिगाड़ देती है। क्या पहले संख्याओं को छोटा करने का कोई तरीक़ा है?",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** The assumed-mean method, derived and worked (Table 14.4). */
const assumed = page(
  "assumed",
  (b) => {
    const w = wordsOn(b);
    const table = b.prop(meanTableDef, "table", {
      rows: MARKS,
      isGrouped: true,
      method: Method.Assumed,
      a: 47.5,
      step: 0,
      classHeading: heading("Marks", "अंक"),
      freqHeading: heading("Students (fᵢ)", "विद्यार्थी (fᵢ)"),
      canStep: true,
    });
    b.studentOnly(table.action(MeanAction.Next));
    b.studentOnly(table.action(MeanAction.Back));
    b.standsFor(
      table,
      "the class marks table of Example 1 by the assumed-mean method with a = 47.5: deviations dᵢ = xᵢ − 47.5 (−30, −15, 0, 15, 30, 45), products fᵢdᵢ adding to 435, and the mean 47.5 + 435/30 = 62",
    );
    const goal = goalQuestion(b, {
      about: table,
      prompt: t(
        "Step through xᵢ, dᵢ and fᵢdᵢ to the mean.",
        "xᵢ, dᵢ और fᵢdᵢ से होते हुए माध्य तक जाओ।",
      ),
      isMet: table.field("step").eq(4),
      solve: [
        table.learner(MeanAction.Next),
        table.learner(MeanAction.Next),
        table.learner(MeanAction.Next),
        table.learner(MeanAction.Next),
      ],
    });
    return column([
      w.title(t("The assumed-mean method", "कल्पित माध्य विधि")),
      w.body(
        t(
          "We can't change the frequencies, but we can make each $x_i$ smaller by subtracting the same number from all of them.",
          "बारंबारताएँ हम नहीं बदल सकते, पर हर $x_i$ से एक ही संख्या घटाकर उसे छोटा कर सकते हैं।",
        ),
      ),
      w.definition(
        t(
          r`**Assumed mean and deviation.** Choose one class mark, preferably one near the middle, and call it the **assumed mean** $a$. The **deviation** of each class mark from it is $$d_i = x_i - a$$`,
          r`**कल्पित माध्य और विचलन।** एक वर्ग चिह्न चुनो, बेहतर हो बीच के पास वाला, और उसे **कल्पित माध्य** $a$ कहो। हर वर्ग चिह्न का उससे **विचलन** है $$d_i = x_i - a$$`,
        ),
      ),
      w.body(
        t(
          r`Why does this help? Start from the mean of the deviations and use $d_i = x_i - a$:`,
          r`इससे मदद क्यों मिलती है? विचलनों के माध्य से शुरू करो और $d_i = x_i - a$ का उपयोग करो:`,
        ),
      ),
      w.body(
        t(
          r`$$\begin{aligned}\frac{\Sigma f_i d_i}{\Sigma f_i} &= \frac{\Sigma f_i (x_i - a)}{\Sigma f_i}\\ &= \frac{\Sigma f_i x_i - a\,\Sigma f_i}{\Sigma f_i}\\ &= \frac{\Sigma f_i x_i}{\Sigma f_i} - a\,\frac{\Sigma f_i}{\Sigma f_i}\\ &= \bar{x} - a\end{aligned}$$`,
          r`$$\begin{aligned}\frac{\Sigma f_i d_i}{\Sigma f_i} &= \frac{\Sigma f_i (x_i - a)}{\Sigma f_i}\\ &= \frac{\Sigma f_i x_i - a\,\Sigma f_i}{\Sigma f_i}\\ &= \frac{\Sigma f_i x_i}{\Sigma f_i} - a\,\frac{\Sigma f_i}{\Sigma f_i}\\ &= \bar{x} - a\end{aligned}$$`,
        ),
      ),
      w.definition(
        t(
          r`**The assumed-mean method.** Adding $a$ back gives $$\bar{x} = a + \frac{\Sigma f_i d_i}{\Sigma f_i}$$`,
          r`**कल्पित माध्य विधि।** $a$ वापस जोड़ने पर $$\bar{x} = a + \frac{\Sigma f_i d_i}{\Sigma f_i}$$`,
        ),
      ),
      w.body(t("Riya's marks again, with a = 47.5:", "रिया के अंक फिर से, a = 47.5 लेकर:")),
      table,
      goal,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Activity 1: any class mark as a gives the same mean. */
const anyA = page(
  "any-a",
  (b) => {
    const w = wordsOn(b);
    const table = b.prop(meanTableDef, "table", {
      rows: MARKS,
      isGrouped: true,
      method: Method.Assumed,
      a: 17.5,
      step: 4,
      classHeading: heading("Marks", "अंक"),
      freqHeading: heading("Students (fᵢ)", "विद्यार्थी (fᵢ)"),
      canStep: false,
      canSetA: true,
    });
    b.studentOnly(table.action(MeanAction.NudgeA));
    b.standsFor(
      table,
      "the assumed-mean table worked in full, with buttons to move the assumed mean a to another class mark; the deviations change but the mean stays 62",
    );
    const same = choiceQuestion(b, {
      name: "same",
      prompt: t(
        "Move a to a few different class marks. What happens to the mean?",
        "a को कुछ अलग-अलग वर्ग चिह्नों पर ले जाओ। माध्य का क्या होता है?",
      ),
      options: [
        { id: "right", label: t("It stays 62 every time", "हर बार 62 ही रहता है") },
        {
          id: "follows",
          label: t("It moves up as a moves up", "a बढ़ने पर बढ़ता है"),
          feedback: t(
            "The deviations shrink as a grows, but a is added back: a + Σfᵢdᵢ/Σfᵢ always lands on 62.",
            "a बढ़ने पर विचलन घटते हैं, पर a वापस जुड़ता है: a + Σfᵢdᵢ/Σfᵢ हमेशा 62 पर आता है।",
          ),
        },
        {
          id: "middle",
          label: t("It's right only for the middle a", "सिर्फ़ बीच वाले a पर सही है"),
          feedback: t(
            "Any a gives 62. The middle one just keeps the numbers smallest.",
            "कोई भी a 62 देता है। बीच वाला बस संख्याओं को सबसे छोटा रखता है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Does the choice of a matter?", "क्या a का चुनाव मायने रखता है?")),
      w.body(
        t(
          "Activity 1: take each class mark in turn as a. Use − and + to move it.",
          "क्रियाकलाप 1: हर वर्ग चिह्न को बारी-बारी से a लो। उसे खिसकाने के लिए − और + दबाओ।",
        ),
      ),
      table,
      same,
      w.note(
        t(
          "The mean doesn't depend on the choice of a. A middle class mark just gives the smallest deviations.",
          "माध्य a के चुनाव पर निर्भर नहीं करता। बीच का वर्ग चिह्न बस सबसे छोटे विचलन देता है।",
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The step-deviation method (Table 14.5). */
const stepDev = page(
  "step-deviation",
  (b) => {
    const w = wordsOn(b);
    const table = b.prop(meanTableDef, "table", {
      rows: MARKS,
      isGrouped: true,
      method: Method.Step,
      a: 47.5,
      h: 15,
      step: 0,
      classHeading: heading("Marks", "अंक"),
      freqHeading: heading("Students (fᵢ)", "विद्यार्थी (fᵢ)"),
      canStep: true,
    });
    b.studentOnly(table.action(MeanAction.Next));
    b.studentOnly(table.action(MeanAction.Back));
    b.standsFor(
      table,
      "the marks table by the step-deviation method, a = 47.5 and h = 15: dᵢ, then uᵢ = dᵢ/15 (−2, −1, 0, 1, 2, 3), then fᵢuᵢ adding to 29, and the mean 47.5 + 15 × 29/30 = 62",
    );
    const goal = goalQuestion(b, {
      about: table,
      prompt: t(
        "Step through dᵢ, uᵢ and fᵢuᵢ to the mean.",
        "dᵢ, uᵢ और fᵢuᵢ से होते हुए माध्य तक जाओ।",
      ),
      isMet: table.field("step").eq(5),
      solve: [
        table.learner(MeanAction.Next),
        table.learner(MeanAction.Next),
        table.learner(MeanAction.Next),
        table.learner(MeanAction.Next),
        table.learner(MeanAction.Next),
      ],
    });
    return column([
      w.title(t("The step-deviation method", "पग-विचलन विधि")),
      w.body(
        t(
          "In the last table every deviation, −30, −15, 0, 15, 30, 45, is a multiple of 15, the class size. Dividing them all by 15 makes them smaller still.",
          "पिछली तालिका में हर विचलन, −30, −15, 0, 15, 30, 45, वर्ग माप 15 का गुणज है। सबको 15 से भाग देने पर वे और छोटे हो जाते हैं।",
        ),
      ),
      w.definition(
        t(
          r`**Step deviation.** With $h$ the class size (or another convenient number), let $$u_i = \frac{x_i - a}{h}$$`,
          r`**पग-विचलन।** $h$ को वर्ग माप (या कोई और सुविधाजनक संख्या) लेकर, मानो $$u_i = \frac{x_i - a}{h}$$`,
        ),
      ),
      w.body(
        t(
          r`Then $x_i - a = h u_i$, so $\Sigma f_i d_i = h\,\Sigma f_i u_i$. Putting this into the assumed-mean formula:`,
          r`तब $x_i - a = h u_i$, तो $\Sigma f_i d_i = h\,\Sigma f_i u_i$। इसे कल्पित माध्य वाले सूत्र में रखने पर:`,
        ),
      ),
      w.definition(
        t(
          r`**The step-deviation method.** $$\bar{x} = a + h \times \frac{\Sigma f_i u_i}{\Sigma f_i}$$`,
          r`**पग-विचलन विधि।** $$\bar{x} = a + h \times \frac{\Sigma f_i u_i}{\Sigma f_i}$$`,
        ),
      ),
      table,
      goal,
      w.note(
        t(
          "All three methods give the same mean. The assumed-mean and step-deviation methods are just the direct method with easier numbers.",
          "तीनों विधियाँ एक ही माध्य देती हैं। कल्पित माध्य और पग-विचलन विधियाँ बस आसान संख्याओं वाली प्रत्यक्ष विधि हैं।",
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Example 2: the same mean three ways; choosing a method. */
const threeWays = page(
  "three-ways",
  (b) => {
    const w = wordsOn(b);
    const table = b.prop(meanTableDef, "table", {
      rows: TEACHERS,
      isGrouped: true,
      method: Method.Direct,
      a: 50,
      h: 10,
      step: 3,
      classHeading: heading("Female teachers (%)", "महिला शिक्षिकाएँ (%)"),
      freqHeading: heading("States/U.T.", "राज्य/संघ क्षेत्र"),
      canStep: true,
      canSetMethod: true,
    });
    b.studentOnly(table.action(MeanAction.Next));
    b.studentOnly(table.action(MeanAction.Back));
    b.studentOnly(table.action(MeanAction.SetMethod));
    b.standsFor(
      table,
      "NCERT Example 2, the percentage of female teachers in rural primary schools in 35 states and union territories, with buttons for the direct, assumed-mean (a = 50) and step-deviation (h = 10) methods; each ends at the mean 39.71",
    );
    const choose = choiceQuestion(b, {
      name: "choose",
      prompt: t(
        "The class marks are 20, 30, …, 80 and the frequencies are small. Which method is the natural choice here?",
        "वर्ग चिह्न 20, 30, …, 80 हैं और बारंबारताएँ छोटी हैं। यहाँ स्वाभाविक चुनाव कौन-सी विधि है?",
      ),
      options: [
        {
          id: "right",
          label: t("Direct: the numbers are already small", "प्रत्यक्ष: संख्याएँ पहले से छोटी हैं"),
        },
        {
          id: "step",
          label: t("Step deviation: it is always the best", "पग-विचलन: यह हमेशा सबसे अच्छी है"),
          feedback: t(
            "Step deviation helps when the numbers are big. With small xᵢ and fᵢ, the direct method is simplest.",
            "पग-विचलन तब मदद करता है जब संख्याएँ बड़ी हों। छोटे xᵢ और fᵢ के साथ प्रत्यक्ष विधि सबसे सरल है।",
          ),
        },
        {
          id: "assumed",
          label: t("Assumed mean: it is the most exact", "कल्पित माध्य: यह सबसे सटीक है"),
          feedback: t(
            "All three give exactly the same mean, 39.71. The choice is only about easier arithmetic.",
            "तीनों ठीक एक ही माध्य, 39.71, देती हैं। चुनाव सिर्फ़ आसान गणना का है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("One table, three methods", "एक तालिका, तीन विधियाँ")),
      w.body(
        t(
          "NCERT Example 2: the percentage of female teachers in rural primary schools, in 35 states and union territories. Switch between the methods and step each one through.",
          "NCERT उदाहरण 2: ग्रामीण प्राथमिक स्कूलों में महिला शिक्षिकाओं का प्रतिशत, 35 राज्यों और संघ क्षेत्रों में। विधियाँ बदलो और हर एक को क़दम-दर-क़दम चलाओ।",
        ),
      ),
      table,
      w.body(
        t(
          r`Each one ends the same way: $$\begin{aligned}\bar{x} &= \frac{1390}{35}\\ &= 50 + \frac{-360}{35}\\ &= 50 + 10 \times \frac{-36}{35}\\ &= 39.71\end{aligned}$$`,
          r`हर एक इसी पर पहुँचती है: $$\begin{aligned}\bar{x} &= \frac{1390}{35}\\ &= 50 + \frac{-360}{35}\\ &= 50 + 10 \times \frac{-36}{35}\\ &= 39.71\end{aligned}$$`,
        ),
      ),
      choose,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Example 3: unequal classes, step deviation with h = 20. */
const unequal = page(
  "unequal",
  (b) => {
    const w = wordsOn(b);
    const table = b.prop(meanTableDef, "table", {
      rows: WICKETS,
      isGrouped: true,
      method: Method.Step,
      a: 200,
      h: 20,
      step: 0,
      classHeading: heading("Wickets", "विकेट"),
      freqHeading: heading("Bowlers (fᵢ)", "गेंदबाज़ (fᵢ)"),
      canStep: true,
    });
    b.studentOnly(table.action(MeanAction.Next));
    b.studentOnly(table.action(MeanAction.Back));
    b.standsFor(
      table,
      "NCERT Example 3, wickets taken by 45 bowlers in classes of unequal size, by step deviation with a = 200 and h = 20: uᵢ = −8, −6, −3.75, 0, 5, 10, Σfᵢuᵢ = −106, mean 200 + 20 × (−106/45) = 152.89",
    );
    const goal = goalQuestion(b, {
      about: table,
      prompt: t("Work the table through to the mean.", "तालिका को माध्य तक चलाओ।"),
      isMet: table.field("step").eq(5),
      solve: [
        table.learner(MeanAction.Next),
        table.learner(MeanAction.Next),
        table.learner(MeanAction.Next),
        table.learner(MeanAction.Next),
        table.learner(MeanAction.Next),
      ],
    });
    return column([
      w.title(t("When the classes aren't equal", "जब वर्ग बराबर न हों")),
      w.body(
        t(
          "Kabir's table has classes of different sizes: 40, 40, 50, 100, 100, 100. There is no single class size, but the step-deviation method doesn't need one: any convenient $h$ gives the same mean. With $a = 200$, the deviations are −160, −120, −75, 0, 100, 200. NCERT takes $h = 20$, which makes most $u_i$ whole numbers (−75 ÷ 20 = −3.75 is the one exception).",
          "कबीर की तालिका में वर्ग अलग-अलग माप के हैं: 40, 40, 50, 100, 100, 100। कोई एक वर्ग माप नहीं, पर पग-विचलन विधि को इसकी ज़रूरत भी नहीं: कोई भी सुविधाजनक $h$ वही माध्य देता है। $a = 200$ लेने पर विचलन −160, −120, −75, 0, 100, 200 हैं। NCERT $h = 20$ लेता है, जिससे ज़्यादातर $u_i$ पूर्ण संख्याएँ बनते हैं (−75 ÷ 20 = −3.75 अकेला अपवाद है)।",
        ),
      ),
      table,
      goal,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                      */
/* ------------------------------------------------------------------ */

/** The sports corner: what 152.89 wickets means. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const ground = sceneOn(
      b,
      "ground",
      DataSceneKind.Cricket,
      "the school ground with Kabir bowling and Riya keeping the scorebook",
    );
    const mean = choiceQuestion(b, {
      name: "mean",
      prompt: t(
        "The mean is 152.89 wickets. What does that tell the poster's readers?",
        "माध्य 152.89 विकेट है। इससे पोस्टर पढ़ने वालों को क्या पता चलता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "On average, a bowler here took about 153 wickets",
            "औसतन, यहाँ एक गेंदबाज़ ने लगभग 153 विकेट लिए",
          ),
        },
        {
          id: "most",
          label: t("Most bowlers took exactly 153 wickets", "ज़्यादातर गेंदबाज़ों ने ठीक 153 विकेट लिए"),
          feedback: t(
            "The mean is an average, not the most common value. The busiest class is 100 – 150.",
            "माध्य औसत है, सबसे आम मान नहीं। सबसे भरा वर्ग 100 – 150 है।",
          ),
        },
        {
          id: "half",
          label: t(
            "Half the bowlers took more than 153 wickets",
            "आधे गेंदबाज़ों ने 153 से ज़्यादा विकेट लिए",
          ),
          feedback: t(
            "That would be the middle value, the median: a later stop. The mean is the average.",
            "वह बीच का मान, माध्यक, होगा: एक बाद का पड़ाव। माध्य औसत है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("The sports corner", "खेल कोना")),
      ground,
      w.body(
        t(
          "With $u_i$ the products are tiny: −56, −30, −60, 0, 10, 30. Riya adds them to −106 in her head and finishes in a minute. Kabir is impressed and pretends not to be.",
          "$u_i$ के साथ गुणनफल बहुत छोटे हैं: −56, −30, −60, 0, 10, 30। रिया उन्हें मन में −106 तक जोड़ लेती है और एक मिनट में ख़त्म कर देती है। कबीर प्रभावित है पर ऐसा दिखाता नहीं।",
        ),
      ),
      mean,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Exercise 14.1 Q2 and Q4; mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const wages = choiceQuestion(b, {
      name: "wages",
      prompt: t(
        r`Exercise 14.1 Q2. Daily wages (₹) of 50 workers: 500 – 520: 12, 520 – 540: 14, 540 – 560: 8, 560 – 580: 6, 580 – 600: 10. With $a = 550$ and $h = 20$, $\Sigma f_iu_i = -12$. What is the mean daily wage?`,
        r`प्रश्नावली 14.1 प्र2। 50 मज़दूरों की दैनिक मज़दूरी (₹): 500 – 520: 12, 520 – 540: 14, 540 – 560: 8, 560 – 580: 6, 580 – 600: 10। $a = 550$ और $h = 20$ लेने पर $\Sigma f_iu_i = -12$। औसत दैनिक मज़दूरी क्या है?`,
      ),
      options: [
        { id: "right", label: t("₹545.20", "₹545.20") },
        {
          id: "noh",
          label: t("₹549.76", "₹549.76"),
          feedback: t(
            "That forgets to multiply by h: 550 + 20 × (−12/50) = 550 − 4.8 = 545.20.",
            "इसमें h से गुणा करना छूट गया: 550 + 20 × (−12/50) = 550 − 4.8 = 545.20।",
          ),
        },
        {
          id: "sign",
          label: t("₹554.80", "₹554.80"),
          feedback: t(
            "Σfᵢuᵢ is negative, so the mean is below a: 550 − 4.8 = 545.20.",
            "Σfᵢuᵢ ऋणात्मक है, तो माध्य a से कम है: 550 − 4.8 = 545.20।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const heart = choiceQuestion(b, {
      name: "heart",
      prompt: t(
        r`Exercise 14.1 Q4. Heartbeats per minute of 30 women: 65 – 68: 2, 68 – 71: 4, 71 – 74: 3, 74 – 77: 8, 77 – 80: 7, 80 – 83: 4, 83 – 86: 2. With $a = 75.5$ and $h = 3$, $\Sigma f_iu_i = 4$. What is the mean?`,
        r`प्रश्नावली 14.1 प्र4। 30 महिलाओं की प्रति मिनट धड़कनें: 65 – 68: 2, 68 – 71: 4, 71 – 74: 3, 74 – 77: 8, 77 – 80: 7, 80 – 83: 4, 83 – 86: 2। $a = 75.5$ और $h = 3$ लेने पर $\Sigma f_iu_i = 4$। माध्य क्या है?`,
      ),
      options: [
        { id: "right", label: t("75.9", "75.9") },
        {
          id: "noh",
          label: t("75.63", "75.63"),
          feedback: t(
            "Multiply by h = 3 as well: 75.5 + 3 × 4/30 = 75.5 + 0.4 = 75.9.",
            "h = 3 से भी गुणा करो: 75.5 + 3 × 4/30 = 75.5 + 0.4 = 75.9।",
          ),
        },
        {
          id: "seven",
          label: t("77.21", "77.21"),
          feedback: t(
            "Divide by Σfᵢ = 30 women, not by the 7 classes: 75.5 + 3 × 4/30 = 75.9.",
            "Σfᵢ = 30 महिलाओं से भाग दो, 7 वर्गों से नहीं: 75.5 + 3 × 4/30 = 75.9।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ Two shortcuts: $\\bar{x} = a + \\Sigma f_id_i/\\Sigma f_i$ and $\\bar{x} = a + h\\,\\Sigma f_iu_i/\\Sigma f_i$, the same mean every time. ✓ Sports corner: about 153 wickets. ✗ The second box asks for the most common family size, and an average can't tell her that. Next: the mode.",
        "**मिशन लॉग।** ✓ दो छोटे रास्ते: $\\bar{x} = a + \\Sigma f_id_i/\\Sigma f_i$ और $\\bar{x} = a + h\\,\\Sigma f_iu_i/\\Sigma f_i$, हर बार वही माध्य। ✓ खेल कोना: लगभग 153 विकेट। ✗ दूसरा बक्सा सबसे आम परिवार का आकार माँगता है, और औसत यह नहीं बता सकता। आगे: बहुलक।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(wages.on(QuestionSignal.Correct), theBoard.show(heart));
    b.when(heart.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), wages, heart, log, space()]);
  },
  { passOn: PassOn.Rules },
);

export const overview = [hook, assumed, anyA, stepDev, threeWays, unequal, inLife, yourTurn];

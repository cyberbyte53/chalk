import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, goalQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  CfKind,
  DataSceneKind,
  Given,
  MedianAction,
  type Row,
  medianTableDef,
} from "@chalk/prop-data";
import { classes, heading, sceneOn } from "../kit";

const r = String.raw;

/** Table 14.11: marks out of 50 of 100 students, ungrouped and in order. */
const RAW: Row[] = [20, 25, 28, 29, 33, 38, 42, 43].map((x, i) => ({
  lo: x,
  hi: x,
  f: [6, 20, 24, 28, 15, 4, 2, 1][i] ?? 0,
  label: { en: String(x), hi: String(x) },
}));
/** Table 14.12: marks of 53 students in classes of 10. */
const MARKS = classes(0, 10, [5, 3, 4, 3, 3, 4, 7, 9, 7, 8]);
/** Example 7: heights (cm) of 51 girls, given as "less than" counts. */
const HEIGHTS: Row[] = classes(135, 5, [4, 7, 18, 11, 6, 5]).map((row, i) =>
  i === 0 ? { ...row, label: { en: "Below 140", hi: "140 से कम" } } : row,
);
/** Example 8: life-insurance sums with x = 9 and y = 15 filled in. */
const SUMS = classes(0, 100, [2, 5, 9, 12, 17, 20, 15, 9, 7, 4]);
/** Exercise 14.3 Q1: monthly electricity use (units) of 68 consumers. */
const UNITS = classes(65, 20, [4, 5, 13, 20, 14, 8, 4]);

const marksHeadings = {
  classHeading: heading("Marks", "अंक"),
  freqHeading: heading("Students", "विद्यार्थी"),
};

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const queue = sceneOn(
    b,
    "queue",
    DataSceneKind.HeightQueue,
    "the girls of 10B lined up from shortest to tallest for the class photo, with Riya counting along to the girl in the middle",
  );
  return column([
    w.title(t("The girl in the middle", "बीच वाली लड़की")),
    queue,
    w.body(
      t(
        'Box three is "middle", and Riya picks the girls\' height for it. The photographer lines the girls up from shortest to tallest. Whoever stands exactly in the middle has the middle height: half the girls are shorter, half are taller.',
        'तीसरा बक्सा है "बीच वाला", और रिया इसके लिए लड़कियों की लंबाई चुनती है। फ़ोटोग्राफ़र लड़कियों को सबसे छोटी से सबसे लंबी तक खड़ा करता है। जो ठीक बीच में खड़ी है, उसकी लंबाई बीच वाली है: आधी लड़कियाँ उससे छोटी हैं, आधी लंबी।',
      ),
    ),
    w.body(
      t(
        "But the school sends the heights of the 51 girls of all three Class 10 sections only as counts: below 140 cm, below 145 cm, and so on. No one is standing in a line. How do we find the middle now?",
        "पर स्कूल कक्षा 10 के तीनों वर्गों की 51 लड़कियों की लंबाइयाँ सिर्फ़ गिनती के रूप में भेजता है: 140 सेमी से कम, 145 सेमी से कम, इत्यादि। कोई क़तार में खड़ा नहीं। अब बीच वाला मान कैसे ढूँढें?",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** The median of ungrouped data (Table 14.11). */
const recap = page(
  "recap",
  (b) => {
    const w = wordsOn(b);
    const table = b.prop(medianTableDef, "table", {
      rows: RAW,
      given: Given.Frequencies,
      cfKind: CfKind.LessThan,
      step: 1,
      picked: null,
      ...marksHeadings,
      canStep: false,
      canPick: false,
    });
    b.standsFor(
      table,
      "Table 14.11, marks out of 50 of 100 students in order (20, 25, 28, 29, 33, 38, 42, 43) with frequencies 6, 20, 24, 28, 15, 4, 2, 1 and a running total 6, 26, 50, 78, 93, 97, 99, 100",
    );
    const middle = choiceQuestion(b, {
      name: "middle",
      prompt: t(
        "n = 100 is even, so the median is the mean of the 50th and 51st observations. The running total reaches 50 at 28 and 78 at 29. What is the median?",
        "n = 100 सम है, तो माध्यक 50वें और 51वें प्रेक्षणों का माध्य है। चलता योग 28 पर 50 और 29 पर 78 तक पहुँचता है। माध्यक क्या है?",
      ),
      options: [
        { id: "right", label: t("28.5 marks", "28.5 अंक") },
        {
          id: "most",
          label: t("29.0 marks", "29.0 अंक"),
          feedback: t(
            "29 is the 51st mark, and also the mode. The 50th is 28, so the median is (28 + 29)/2 = 28.5.",
            "29 इक्यावनवाँ अंक है, और बहुलक भी। पचासवाँ 28 है, तो माध्यक (28 + 29)/2 = 28.5 है।",
          ),
        },
        {
          id: "range",
          label: t("31.5 marks", "31.5 अंक"),
          feedback: t(
            "That is halfway between the lowest and highest marks. The median is the middle observation: (28 + 29)/2 = 28.5.",
            "यह सबसे कम और सबसे ज़्यादा अंकों के बीच का आधा है। माध्यक बीच वाला प्रेक्षण है: (28 + 29)/2 = 28.5।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("The median, so far", "अब तक का माध्यक")),
      w.definition(
        t(
          r`**Median.** The **median** is the middle observation once the data is in order. For $n$ observations it is the $\left(\frac{n+1}{2}\right)$th one when $n$ is odd, and the mean of the $\frac{n}{2}$th and $\left(\frac{n}{2}+1\right)$th when $n$ is even.`,
          r`**माध्यक।** आँकड़ों को क्रम में लगाने पर बीच वाला प्रेक्षण **माध्यक** है। $n$ प्रेक्षणों में, $n$ विषम हो तो यह $\left(\frac{n+1}{2}\right)$वाँ है, और $n$ सम हो तो $\frac{n}{2}$वें और $\left(\frac{n}{2}+1\right)$वें का माध्य।`,
        ),
      ),
      w.body(
        t(
          "With a frequency table, a running total of the frequencies tells us where each position falls.",
          "बारंबारता तालिका में, बारंबारताओं का चलता योग बताता है कि हर स्थान कहाँ पड़ता है।",
        ),
      ),
      table,
      middle,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Cumulative frequency, less-than and more-than (Tables 14.13, 14.14). */
const cumulativePage = page(
  "cumulative",
  (b) => {
    const w = wordsOn(b);
    const less = b.prop(medianTableDef, "less", {
      rows: MARKS,
      given: Given.Frequencies,
      cfKind: CfKind.LessThan,
      step: 0,
      picked: null,
      ...marksHeadings,
      canStep: true,
      canPick: false,
    });
    b.studentOnly(less.action(MedianAction.Next));
    b.studentOnly(less.action(MedianAction.Back));
    b.standsFor(
      less,
      "Table 14.12, marks of 53 students in classes of 10 from 0 to 100, frequencies 5, 3, 4, 3, 3, 4, 7, 9, 7, 8; the next step adds the less-than cumulative frequencies 5, 8, 12, 15, 18, 22, 29, 38, 45, 53",
    );
    const goal = goalQuestion(b, {
      about: less,
      prompt: t("Add the cumulative frequency column.", "संचयी बारंबारता का स्तंभ जोड़ो।"),
      isMet: less.field("step").eq(1),
      solve: [less.learner(MedianAction.Next)],
    });
    const more = b.prop(medianTableDef, "more", {
      rows: MARKS,
      given: Given.Frequencies,
      cfKind: CfKind.MoreThan,
      step: 1,
      picked: null,
      ...marksHeadings,
      canStep: false,
      canPick: false,
    });
    b.standsFor(
      more,
      "the same marks with the more-than cumulative frequencies, counted from the top: 53, 48, 45, 41, 38, 35, 31, 24, 15, 8",
    );
    const read = choiceQuestion(b, {
      name: "read",
      prompt: t(
        "From the more-than table: how many students scored 60 or more?",
        "अधिक-प्रकार की तालिका से: कितने विद्यार्थियों ने 60 या ज़्यादा अंक पाए?",
      ),
      options: [
        { id: "right", label: t("31 students", "31 विद्यार्थी") },
        {
          id: "less",
          label: t("22 students", "22 विद्यार्थी"),
          feedback: t(
            "22 scored less than 60: that's the less-than count. 53 − 22 = 31 scored 60 or more.",
            "22 के 60 से कम आए: यह कम-प्रकार की गिनती है। 53 − 22 = 31 के 60 या ज़्यादा आए।",
          ),
        },
        {
          id: "one",
          label: t("7 students", "7 विद्यार्थी"),
          feedback: t(
            "7 is only the 60 – 70 class. Add the classes above it too: 7 + 9 + 7 + 8 = 31.",
            "7 सिर्फ़ 60 – 70 वर्ग है। उसके ऊपर के वर्ग भी जोड़ो: 7 + 9 + 7 + 8 = 31।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Cumulative frequency", "संचयी बारंबारता")),
      w.definition(
        t(
          "**Cumulative frequency.** The **cumulative frequency** (cf) of a class is the total of the frequencies of that class and every class before it. In a **less-than** table it counts the observations below each upper limit.",
          "**संचयी बारंबारता।** किसी वर्ग की **संचयी बारंबारता** (cf) उस वर्ग और उससे पहले के सभी वर्गों की बारंबारताओं का योग है। **से कम प्रकार** की तालिका में यह हर उपरी सीमा से नीचे के प्रेक्षण गिनती है।",
        ),
      ),
      less,
      goal,
      w.definition(
        t(
          "**More-than cumulative frequency.** Counting from the top instead gives the number of observations at or above each lower limit: a **more-than** table.",
          "**से अधिक प्रकार की संचयी बारंबारता।** ऊपर से गिनने पर हर निम्न सीमा पर या उससे ऊपर के प्रेक्षणों की संख्या मिलती है: **से अधिक प्रकार** की तालिका।",
        ),
      ),
      more,
      read,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The median class and the formula (Table 14.15). */
const formula = page(
  "formula",
  (b) => {
    const w = wordsOn(b);
    const table = b.prop(medianTableDef, "table", {
      rows: MARKS,
      given: Given.Frequencies,
      cfKind: CfKind.LessThan,
      step: 0,
      picked: null,
      ...marksHeadings,
      canStep: true,
      canPick: true,
    });
    b.studentOnly(table.action(MedianAction.Next));
    b.studentOnly(table.action(MedianAction.Back));
    b.studentOnly(table.action(MedianAction.Pick));
    b.standsFor(
      table,
      "Table 14.12 with its cumulative frequencies; the learner taps the median class 60 – 70 (the first cf above n/2 = 26.5 is 29), then l = 60, cf = 22, f = 7, h = 10 and the median 66.43",
    );
    const goal = goalQuestion(b, {
      about: table,
      prompt: t(
        "Add the cf column, tap the median class, then step to the median.",
        "cf का स्तंभ जोड़ो, माध्यक वर्ग पर टैप करो, फिर माध्यक तक बढ़ो।",
      ),
      isMet: table.field("step").eq(4),
      solve: [
        table.learner(MedianAction.Next),
        table.learner(MedianAction.Pick, { index: 6 }),
        table.learner(MedianAction.Next),
        table.learner(MedianAction.Next),
      ],
    });
    return column([
      w.title(t("The median of grouped data", "वर्गीकृत आँकड़ों का माध्यक")),
      w.definition(
        t(
          r`**Median class.** Find $\frac{n}{2}$. The **median class** is the class whose cumulative frequency is the first one greater than (or equal to) $\frac{n}{2}$. The median lies inside it.`,
          r`**माध्यक वर्ग।** $\frac{n}{2}$ निकालो। **माध्यक वर्ग** वह वर्ग है जिसकी संचयी बारंबारता पहली बार $\frac{n}{2}$ से अधिक (या बराबर) होती है। माध्यक इसी के अंदर होता है।`,
        ),
      ),
      w.definition(
        t(
          r`**Median of grouped data.** $$\text{Median} = l + \left(\frac{\frac{n}{2} - cf}{f}\right) \times h$$ where $l$ is the lower limit of the median class, $n$ the number of observations, $cf$ the cumulative frequency of the class before the median class, $f$ the frequency of the median class and $h$ the class size.`,
          r`**वर्गीकृत आँकड़ों का माध्यक।** $$\text{माध्यक} = l + \left(\frac{\frac{n}{2} - cf}{f}\right) \times h$$ जहाँ $l$ माध्यक वर्ग की निम्न सीमा है, $n$ प्रेक्षणों की संख्या, $cf$ माध्यक वर्ग से पहले वाले वर्ग की संचयी बारंबारता, $f$ माध्यक वर्ग की बारंबारता और $h$ वर्ग माप।`,
        ),
      ),
      w.body(
        t(
          r`**Why this works.** Up to the start of the median class we've counted $cf$ students. We need $rac{n}{2} - cf$ more. The class holds $f$ students spread over $h$ marks, so go $rac{n/2 - cf}{f}$ of the way across it.`,
          r`**यह क्यों काम करता है।** माध्यक वर्ग की शुरुआत तक हम $cf$ विद्यार्थी गिन चुके हैं। हमें $rac{n}{2} - cf$ और चाहिए। वर्ग में $f$ विद्यार्थी $h$ अंकों में फैले हैं, तो उसके $rac{n/2 - cf}{f}$ हिस्से तक आगे बढ़ो।`,
        ),
      ),
      table,
      goal,
      w.body(
        t(
          r`$$\begin{aligned}\text{Median} &= 60 + \left(\frac{26.5 - 22}{7}\right) \times 10\\ &= 60 + 6.43\\ &= 66.43\end{aligned}$$`,
          r`$$\begin{aligned}\text{माध्यक} &= 60 + \left(\frac{26.5 - 22}{7}\right) \times 10\\ &= 60 + 6.43\\ &= 66.43\end{aligned}$$`,
        ),
      ),
      w.note(
        t(
          "So about half the students scored below 66.43 and half above it.",
          "यानी लगभग आधे विद्यार्थियों के 66.43 से कम अंक आए और आधों के ज़्यादा।",
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Example 7: the girls' heights, given as cumulative counts. */
const heights = page(
  "heights",
  (b) => {
    const w = wordsOn(b);
    const table = b.prop(medianTableDef, "table", {
      rows: HEIGHTS,
      given: Given.Cumulative,
      cfKind: CfKind.LessThan,
      step: 0,
      picked: null,
      classHeading: heading("Height (cm)", "लंबाई (सेमी)"),
      freqHeading: heading("Girls", "लड़कियाँ"),
      canStep: true,
      canPick: false,
    });
    b.studentOnly(table.action(MedianAction.Next));
    b.studentOnly(table.action(MedianAction.Back));
    b.standsFor(
      table,
      "NCERT Example 7, heights of 51 girls given as less than 140, 145, …, 165 cm with counts 4, 11, 29, 40, 46, 51; the steps find the frequencies 4, 7, 18, 11, 6, 5, the median class 145 – 150 (n/2 = 25.5), and the median 145 + (25.5 − 11)/18 × 5 = 149.03 cm",
    );
    const goal = goalQuestion(b, {
      about: table,
      prompt: t("Step through to the median height.", "बीच वाली लंबाई तक बढ़ो।"),
      isMet: table.field("step").eq(4),
      solve: [
        table.learner(MedianAction.Next),
        table.learner(MedianAction.Next),
        table.learner(MedianAction.Next),
        table.learner(MedianAction.Next),
      ],
    });
    return column([
      w.title(t("Box three", "तीसरा बक्सा")),
      w.body(
        t(
          "Riya's data is already cumulative: 4 girls below 140 cm, 11 below 145, 29 below 150, and so on. The frequency of each class is the difference between neighbouring counts, for example 11 − 4 = 7 for 140 – 145.",
          "रिया के आँकड़े पहले से संचयी हैं: 140 सेमी से कम 4 लड़कियाँ, 145 से कम 11, 150 से कम 29, इत्यादि। हर वर्ग की बारंबारता पड़ोसी गिनतियों का अंतर है, जैसे 140 – 145 के लिए 11 − 4 = 7।",
        ),
      ),
      table,
      goal,
      w.body(
        t(
          r`$$\begin{aligned}\text{Median} &= 145 + \left(\frac{25.5 - 11}{18}\right) \times 5\\ &= 145 + \frac{72.5}{18}\\ &= 149.03\end{aligned}$$`,
          r`$$\begin{aligned}\text{माध्यक} &= 145 + \left(\frac{25.5 - 11}{18}\right) \times 5\\ &= 145 + \frac{72.5}{18}\\ &= 149.03\end{aligned}$$`,
        ),
      ),
      w.note(
        t(
          "The median height is about 149 cm: half the girls are shorter and half are taller.",
          "बीच वाली लंबाई लगभग 149 सेमी है: आधी लड़कियाँ इससे छोटी हैं और आधी लंबी।",
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Example 8: missing frequencies from a known median. */
const missing = page(
  "missing",
  (b) => {
    const w = wordsOn(b);
    const table = b.prop(
      medianTableDef,
      "table",
      {
        rows: SUMS,
        given: Given.Frequencies,
        cfKind: CfKind.LessThan,
        step: 4,
        picked: null,
        classHeading: heading("Sum assured (₹ thousand)", "बीमित राशि (₹ हज़ार)"),
        freqHeading: heading("Policies", "पॉलिसियाँ"),
        canStep: false,
        canPick: false,
      },
      { isHidden: true },
    );
    b.standsFor(
      table,
      "NCERT Example 8 with the missing frequencies filled in, x = 9 and y = 15: 100 policies, median class 500 – 600, and the median 500 + (50 − 45)/20 × 100 = 525",
    );
    const findX = choiceQuestion(b, {
      name: "x",
      prompt: t(
        "Solve for x, then use x + y = 24. What are x and y?",
        "x के लिए हल करो, फिर x + y = 24 लगाओ। x और y क्या हैं?",
      ),
      options: [
        { id: "right", label: t("x = 9, so y = 15", "x = 9, तो y = 15") },
        {
          id: "swap",
          label: t("x = 15, so y = 9", "x = 15, तो y = 9"),
          feedback: t(
            "Solve for x: 25 = (14 − x) × 5, so 14 − x = 5 and x = 9. Then y = 24 − 9 = 15.",
            "x के लिए हल करो: 25 = (14 − x) × 5, तो 14 − x = 5 और x = 9। फिर y = 24 − 9 = 15।",
          ),
        },
        {
          id: "five",
          label: t("x = 5, so y = 19", "x = 5, तो y = 19"),
          feedback: t(
            "5 is 14 − x, not x. From 14 − x = 5 we get x = 9 and y = 15.",
            "5 तो 14 − x है, x नहीं। 14 − x = 5 से x = 9 और y = 15 मिलता है।",
          ),
        },
      ],
      answer: "right",
    });
    b.when(findX.on(QuestionSignal.Correct), theBoard.show(table));
    return column([
      w.title(t("Working backwards", "उल्टा चलना")),
      w.body(
        t(
          "NCERT Example 8: 100 life-insurance policies, classes of ₹100 thousand from 0 to 1000. Two frequencies are lost, x for 200 – 300 and y for 600 – 700, but the median is known to be 525.",
          "NCERT उदाहरण 8: 100 जीवन-बीमा पॉलिसियाँ, 0 से 1000 तक ₹100 हज़ार के वर्ग। दो बारंबारताएँ खो गई हैं, 200 – 300 की x और 600 – 700 की y, पर माध्यक 525 पता है।",
        ),
      ),
      w.body(t("The known frequencies add to 76, so:", "ज्ञात बारंबारताओं का योग 76 है, तो:")),
      w.body(
        t(
          r`$$76 + x + y = 100 \quad\Rightarrow\quad x + y = 24$$`,
          r`$$76 + x + y = 100 \quad\Rightarrow\quad x + y = 24$$`,
        ),
      ),
      w.body(
        t(
          "525 lies in 500 – 600, so that is the median class: l = 500, f = 20, h = 100, and the cf before it is 2 + 5 + x + 12 + 17 = 36 + x. Put these into the median formula:",
          "525, 500 – 600 में है, तो वही माध्यक वर्ग है: l = 500, f = 20, h = 100, और उससे पहले का cf है 2 + 5 + x + 12 + 17 = 36 + x। इन्हें माध्यक के सूत्र में रखो:",
        ),
      ),
      w.body(
        t(
          r`$$525 = 500 + \left(\frac{50 - (36 + x)}{20}\right) \times 100$$`,
          r`$$525 = 500 + \left(\frac{50 - (36 + x)}{20}\right) \times 100$$`,
        ),
      ),
      findX,
      table,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The empirical relation between the three measures. */
const empirical = page(
  "empirical",
  (b) => {
    const w = wordsOn(b);
    const table = b.prop(medianTableDef, "table", {
      rows: UNITS,
      given: Given.Frequencies,
      cfKind: CfKind.LessThan,
      step: 4,
      picked: null,
      classHeading: heading("Units used", "खपत इकाइयाँ"),
      freqHeading: heading("Consumers", "उपभोक्ता"),
      canStep: false,
      canPick: false,
    });
    b.standsFor(
      table,
      "Exercise 14.3 Q1, monthly electricity use of 68 consumers in classes of 20 from 65 to 205, worked to the median 137 units",
    );
    const estimate = choiceQuestion(b, {
      name: "estimate",
      prompt: t(
        "For the same data the mode is 135.76 and the mean is 137.05. What does the relation predict for the median?",
        "इन्हीं आँकड़ों का बहुलक 135.76 और माध्य 137.05 है। संबंध माध्यक के लिए क्या अनुमान देता है?",
      ),
      options: [
        { id: "right", label: t("About 136.6", "लगभग 136.6") },
        {
          id: "plain",
          label: t("About 136.4", "लगभग 136.4"),
          feedback: t(
            "That's the plain average of mode and mean. The mean counts twice: (135.76 + 2 × 137.05)/3 ≈ 136.6.",
            "यह बहुलक और माध्य का सीधा औसत है। माध्य दो बार गिना जाता है: (135.76 + 2 × 137.05)/3 ≈ 136.6।",
          ),
        },
        {
          id: "flip",
          label: t("About 136.2", "लगभग 136.2"),
          feedback: t(
            "That counts the mode twice instead of the mean: (135.76 + 2 × 137.05)/3 ≈ 136.6.",
            "इसमें माध्य की बजाय बहुलक दो बार गिना गया: (135.76 + 2 × 137.05)/3 ≈ 136.6।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Three measures together", "तीनों माप एक साथ")),
      w.definition(
        t(
          r`**Empirical relation.** For many sets of data the three measures of central tendency are related, roughly, by $$3\,\text{Median} = \text{Mode} + 2\,\text{Mean}$$`,
          r`**आनुभविक संबंध।** बहुत से आँकड़ों में केंद्रीय प्रवृत्ति के तीनों माप लगभग इस संबंध से जुड़े होते हैं: $$3\,\text{माध्यक} = \text{बहुलक} + 2\,\text{माध्य}$$`,
        ),
      ),
      w.body(
        t(
          "It is an observed pattern, not an exact rule, but it lets us estimate one measure from the other two.",
          "यह एक देखा गया पैटर्न है, सटीक नियम नहीं, पर इससे दो मापों से तीसरे का अनुमान लगा सकते हैं।",
        ),
      ),
      table,
      estimate,
      w.note(
        t(
          "The formula gave 137; the relation gives about 136.6. Close, but not the same.",
          "सूत्र से 137 मिला; संबंध लगभग 136.6 देता है। पास है, पर बराबर नहीं।",
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                      */
/* ------------------------------------------------------------------ */

const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const queue = sceneOn(
      b,
      "queue",
      DataSceneKind.HeightQueue,
      "the class photo taken, with the girl in the middle of the line marked 149 cm",
    );
    const which = choiceQuestion(b, {
      name: "which",
      prompt: t(
        "In one village most families earn little and two earn crores. Which measure best describes a typical income?",
        "एक गाँव में ज़्यादातर परिवार कम कमाते हैं और दो करोड़ों कमाते हैं। आम आय को कौन-सा माप सबसे अच्छी तरह बताता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "The median: the two rich families barely move it",
            "माध्यक: दो अमीर परिवार इसे मुश्किल से हिलाते हैं",
          ),
        },
        {
          id: "mean",
          label: t(
            "The mean: it uses every income in the village",
            "माध्य: यह गाँव की हर आय का उपयोग करता है",
          ),
          feedback: t(
            "Using every value is the problem here: two huge incomes drag the mean far above what most families earn.",
            "हर मान का उपयोग ही यहाँ दिक़्क़त है: दो बड़ी आयें माध्य को ज़्यादातर परिवारों की कमाई से बहुत ऊपर खींच लेती हैं।",
          ),
        },
        {
          id: "big",
          label: t(
            "The largest: it shows what the village can earn",
            "सबसे बड़ा मान: यह दिखाता है कि गाँव कितना कमा सकता है",
          ),
          feedback: t(
            "The largest income is the least typical value. The middle income, the median, is not pulled by extremes.",
            "सबसे बड़ी आय सबसे कम आम मान है। बीच वाली आय, माध्यक, छोर के मानों से नहीं खिंचती।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Which measure when?", "कब कौन-सा माप?")),
      queue,
      w.body(
        t(
          'Riya writes "Middle height: 149 cm". Each measure answers its own question:',
          'रिया लिखती है "बीच वाली लंबाई: 149 सेमी"। हर माप अपने सवाल का उत्तर देता है:',
        ),
      ),
      w.body(
        t(
          "The **mean** shares everything out equally, so it suits comparing averages, like two sections' marks. The **median** is the middle, so it suits data with a few very large or very small values, like incomes. The **mode** is the most common, so it suits questions like the most popular size or dish.",
          "**माध्य** सब कुछ बराबर बाँट देता है, तो यह औसतों की तुलना के लिए ठीक है, जैसे दो सेक्शनों के अंक। **माध्यक** बीच का मान है, तो यह उन आँकड़ों के लिए ठीक है जिनमें कुछ बहुत बड़े या बहुत छोटे मान हों, जैसे आय। **बहुलक** सबसे आम मान है, तो यह सबसे लोकप्रिय नाप या पकवान जैसे सवालों के लिए ठीक है।",
        ),
      ),
      which,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Exercise 14.3 Q7 and Q2; mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const weights = choiceQuestion(b, {
      name: "weights",
      prompt: t(
        "Exercise 14.3 Q7. Weights (kg) of 30 students: 40 – 45: 2, 45 – 50: 3, 50 – 55: 8, 55 – 60: 6, 60 – 65: 6, 65 – 70: 3, 70 – 75: 2. What is the median weight?",
        "प्रश्नावली 14.3 प्र7। 30 विद्यार्थियों का भार (किग्रा): 40 – 45: 2, 45 – 50: 3, 50 – 55: 8, 55 – 60: 6, 60 – 65: 6, 65 – 70: 3, 70 – 75: 2। माध्यक भार क्या है?",
      ),
      options: [
        { id: "right", label: t("56.67 kg", "56.67 किग्रा") },
        {
          id: "own",
          label: t("51.67 kg", "51.67 किग्रा"),
          feedback: t(
            "cf is the total before the median class, 13, not its own 19: 55 + (15 − 13)/6 × 5 = 56.67.",
            "cf माध्यक वर्ग से पहले का योग 13 है, उसका अपना 19 नहीं: 55 + (15 − 13)/6 × 5 = 56.67।",
          ),
        },
        {
          id: "class",
          label: t("56.25 kg", "56.25 किग्रा"),
          feedback: t(
            "n/2 = 15 and the cf first passes 15 in 55 – 60 (cf 19), not 50 – 55 (cf 13). So 55 + 2/6 × 5 = 56.67.",
            "n/2 = 15 और cf पहली बार 55 – 60 (cf 19) में 15 पार करता है, 50 – 55 (cf 13) में नहीं। तो 55 + 2/6 × 5 = 56.67।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const xy = choiceQuestion(b, {
      name: "xy",
      prompt: t(
        "Exercise 14.3 Q2. 60 observations with median 28.5: 0 – 10: 5, 10 – 20: x, 20 – 30: 20, 30 – 40: 15, 40 – 50: y, 50 – 60: 5. Find x and y.",
        "प्रश्नावली 14.3 प्र2। 60 प्रेक्षण, माध्यक 28.5: 0 – 10: 5, 10 – 20: x, 20 – 30: 20, 30 – 40: 15, 40 – 50: y, 50 – 60: 5। x और y ज्ञात करो।",
      ),
      options: [
        { id: "right", label: t("x = 8, y = 7", "x = 8, y = 7") },
        {
          id: "swap",
          label: t("x = 7, y = 8", "x = 7, y = 8"),
          feedback: t(
            "From 28.5 = 20 + (30 − 5 − x)/20 × 10 we get 25 − x = 17, so x = 8 and y = 15 − 8 = 7.",
            "28.5 = 20 + (30 − 5 − x)/20 × 10 से 25 − x = 17, तो x = 8 और y = 15 − 8 = 7।",
          ),
        },
        {
          id: "half",
          label: t("x = 5, y = 10", "x = 5, y = 10"),
          feedback: t(
            "Use the median: 8.5 = (25 − x)/2, so x = 8. Then x + y = 15 gives y = 7.",
            "माध्यक लगाओ: 8.5 = (25 − x)/2, तो x = 8। फिर x + y = 15 से y = 7।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ Cumulative frequency, less-than and more-than. ✓ Median = $l + \\frac{n/2 - cf}{f} \\times h$. ✓ Box three: 149 cm. ✗ The big graph is still empty, and so far we only have tables. Next: ogives.",
        "**मिशन लॉग।** ✓ संचयी बारंबारता, से कम और से अधिक प्रकार। ✓ माध्यक = $l + \\frac{n/2 - cf}{f} \\times h$। ✓ तीसरा बक्सा: 149 सेमी। ✗ बड़ा ग्राफ़ अभी ख़ाली है, और अभी हमारे पास सिर्फ़ तालिकाएँ हैं। आगे: तोरण।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(weights.on(QuestionSignal.Correct), theBoard.show(xy));
    b.when(xy.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), weights, xy, log, space()]);
  },
  { passOn: PassOn.Rules },
);

export const overview = [
  hook,
  recap,
  cumulativePage,
  formula,
  heights,
  missing,
  empirical,
  inLife,
  yourTurn,
];

import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, goalQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import { DataSceneKind, MeanAction, Method, meanTableDef } from "@chalk/prop-data";
import { classes, heading, sceneOn } from "../kit";

const r = String.raw;

/** NCERT Example 1: the 30 marks, ungrouped (Table 14.1). */
const RAW = [
  [10, 1],
  [20, 1],
  [36, 3],
  [40, 4],
  [50, 3],
  [56, 2],
  [60, 4],
  [70, 4],
  [72, 1],
  [80, 1],
  [88, 2],
  [92, 3],
  [95, 1],
].map(([x, f]) => ({ lo: x as number, hi: x as number, f: f as number, label: null }));

/** The same marks grouped in classes of 15 (Table 14.2). */
const GROUPED = classes(10, 15, [2, 3, 7, 6, 6, 6]);

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** Who, where, what: Fun Fair Week and the empty poster. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const poster = sceneOn(
    b,
    "poster",
    DataSceneKind.Poster,
    "Riya pinning up a big blank chart headed '10B in Numbers', with empty boxes for 'average', 'most common' and 'middle'; Kabir hands her pins",
  );
  return column([
    w.title(t("10B in Numbers", "10B अंकों में")),
    poster,
    w.body(
      t(
        "It's Fun Fair Week at school: Annual Day on Friday, the fun fair on Saturday. Every class must put up a poster about itself, and Riya has volunteered for 10B's. She calls it **10B in Numbers**: three boxes, for the class's **average**, the **most common** value and the **middle** value, and one big graph.",
        "स्कूल में फ़न फ़ेयर वीक है: शुक्रवार को वार्षिक दिवस, शनिवार को फ़न फ़ेयर। हर कक्षा को अपने बारे में एक पोस्टर लगाना है, और रिया ने 10B के पोस्टर की ज़िम्मेदारी ली है। उसका नाम है **10B अंकों में**: तीन बक्से, कक्षा के **औसत**, **सबसे आम** मान और **बीच के** मान के लिए, और एक बड़ा ग्राफ़।",
      ),
    ),
    w.body(
      t(
        "Kabir, two classes below, is running a games stall at the fair and keeps stealing her pins. The first box should be easy: the class's average marks in the last maths test. But the teacher hands over the marks only in groups: \"10 to 25: two students, 25 to 40: three students, …\". Nobody's exact marks.",
        'कबीर, दो कक्षा नीचे, फ़ेयर में खेलों का स्टॉल चला रहा है और बार-बार उसकी पिनें उठा लेता है। पहला बक्सा आसान होना चाहिए: पिछले गणित टेस्ट में कक्षा के औसत अंक। पर टीचर अंक सिर्फ़ समूहों में देती हैं: "10 से 25: दो विद्यार्थी, 25 से 40: तीन विद्यार्थी, …"। किसी के ठीक-ठीक अंक नहीं।',
      ),
    ),
    space(),
  ]);
});

/** Why this chapter: the three boxes and the graph are its stops. */
const why = page("why", (b) => {
  const w = wordsOn(b);
  return column([
    w.title(t("What this chapter is for", "यह अध्याय किसलिए है")),
    w.body(
      t(
        "In Class IX you found the average, the most common value and the middle value of a list of numbers. Real data, though, usually arrives **grouped**: marks in bands, ages in ranges, incomes in slabs. This chapter is about finding the same three numbers from grouped data, and drawing a graph that shows the whole picture.",
        "कक्षा IX में तुमने संख्याओं की सूची का औसत, सबसे आम मान और बीच का मान निकाला था। पर असली आँकड़े ज़्यादातर **समूहों में** आते हैं: अंक दायरों में, उम्र सीमाओं में, आमदनी स्लैबों में। यह अध्याय समूहों वाले आँकड़ों से वही तीन संख्याएँ निकालने, और पूरी तस्वीर दिखाने वाला ग्राफ़ बनाने के बारे में है।",
      ),
    ),
    w.definition(
      t(
        "**The stops on the way.** (1) The average of grouped data: *this lesson*. (2) Shortcuts for big numbers. (3) The most common value. (4) The middle value. (5) The graph, and the poster goes up.",
        "**रास्ते के पड़ाव।** (1) समूहों वाले आँकड़ों का औसत: *यह पाठ*। (2) बड़ी संख्याओं के लिए छोटे रास्ते। (3) सबसे आम मान। (4) बीच का मान। (5) ग्राफ़, और पोस्टर लग जाता है।",
      ),
    ),
    w.body(
      t(
        "First stop: how do you find an average when you don't know anyone's exact marks?",
        "पहला पड़ाव: जब किसी के ठीक-ठीक अंक पता न हों, तब औसत कैसे निकालें?",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Recap: the mean of ungrouped data with frequencies (Example 1, Table 14.1). */
const recap = page(
  "recap",
  (b) => {
    const w = wordsOn(b);
    const table = b.prop(meanTableDef, "table", {
      rows: RAW,
      isGrouped: false,
      method: Method.Direct,
      step: 0,
      classHeading: heading("Marks (xᵢ)", "अंक (xᵢ)"),
      freqHeading: heading("Students (fᵢ)", "विद्यार्थी (fᵢ)"),
      canStep: true,
    });
    b.studentOnly(table.action(MeanAction.Next));
    b.studentOnly(table.action(MeanAction.Back));
    b.standsFor(
      table,
      "the marks of 30 students as a frequency table (each mark xᵢ with how many got it, fᵢ), worked column by column to the products fᵢxᵢ and the mean 1779 ÷ 30 = 59.3",
    );
    const goal = goalQuestion(b, {
      about: table,
      prompt: t(
        "Step through the table until the mean appears.",
        "तालिका में तब तक आगे बढ़ो जब तक माध्य न दिखे।",
      ),
      isMet: table.field("step").eq(3),
      solve: [
        table.learner(MeanAction.Next),
        table.learner(MeanAction.Next),
        table.learner(MeanAction.Next),
      ],
    });
    return column([
      w.title(t("The mean, from Class IX", "माध्य, कक्षा IX से")),
      w.definition(
        t(
          "**Observation and frequency.** Each value in the data is an **observation**. The **frequency** of a value is how many times it occurs. If the values $x_1, x_2, \\dots, x_n$ occur $f_1, f_2, \\dots, f_n$ times, the data is a **frequency table**.",
          "**प्रेक्षण और बारंबारता।** आँकड़ों का हर मान एक **प्रेक्षण** है। किसी मान की **बारंबारता** यह है कि वह कितनी बार आता है। यदि मान $x_1, x_2, \\dots, x_n$ क्रमशः $f_1, f_2, \\dots, f_n$ बार आते हैं, तो आँकड़े एक **बारंबारता तालिका** हैं।",
        ),
      ),
      w.definition(
        t(
          r`**Mean.** The **mean** (average) is the sum of all the observations divided by how many there are. The sum of all the values is $f_1x_1 + f_2x_2 + \dots + f_nx_n$, and there are $f_1 + f_2 + \dots + f_n$ of them. The Greek letter $\Sigma$ (sigma) means "add up all of these", so $$\bar{x} = \frac{\Sigma f_i x_i}{\Sigma f_i}$$`,
          r`**माध्य।** **माध्य** (औसत) सभी प्रेक्षणों का योग, उनकी गिनती से भाग देकर मिलता है। सभी मानों का योग $f_1x_1 + f_2x_2 + \dots + f_nx_n$ है, और वे कुल $f_1 + f_2 + \dots + f_n$ हैं। यूनानी अक्षर $\Sigma$ (सिग्मा) का अर्थ है "इन सबको जोड़ो", तो $$\bar{x} = \frac{\Sigma f_i x_i}{\Sigma f_i}$$`,
        ),
      ),
      w.body(
        t(
          "Suppose we could peek at the teacher's register, which Riya never sees. These are the exact marks of the 30 students, out of 100. Each row is one mark and how many students got it.",
          "मान लो हम शिक्षक का रजिस्टर झाँककर देख सकें, जो रिया कभी नहीं देखती। ये 30 विद्यार्थियों के ठीक-ठीक अंक हैं, 100 में से। हर पंक्ति एक अंक है और कितने विद्यार्थियों को वह मिला।",
        ),
      ),
      table,
      goal,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Grouping: class intervals and the class mark (Table 14.2). */
const grouped = page(
  "grouped",
  (b) => {
    const w = wordsOn(b);
    const mark = choiceQuestion(b, {
      name: "mark",
      prompt: t("What is the class mark of 25 – 40?", "25 – 40 का वर्ग चिह्न क्या है?"),
      options: [
        { id: "right", label: t("32.5", "32.5") },
        {
          id: "width",
          label: t("15", "15"),
          feedback: t(
            "15 is the class size, 40 − 25. The class mark is the middle: (25 + 40) ÷ 2.",
            "15 वर्ग माप है, 40 − 25। वर्ग चिह्न बीच का मान है: (25 + 40) ÷ 2।",
          ),
        },
        {
          id: "upper",
          label: t("40", "40"),
          feedback: t(
            "40 is the upper limit. The class mark is halfway between 25 and 40.",
            "40 उपरि सीमा है। वर्ग चिह्न 25 और 40 के ठीक बीच में है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Grouped data and the class mark", "वर्गीकृत आँकड़े और वर्ग चिह्न")),
      w.definition(
        t(
          "**Class interval.** When data is large, we put it in groups like 10 – 25, 25 – 40, …, called **class intervals** (classes). In 10 – 25, 10 is the **lower limit** and 25 the **upper limit**; their difference, 15, is the **class size**. A value on an upper limit goes in the next class: a mark of 40 counts in 40 – 55, not 25 – 40.",
          "**वर्ग अंतराल।** जब आँकड़े बहुत ज़्यादा हों, तो हम उन्हें 10 – 25, 25 – 40, … जैसे समूहों में रखते हैं, जिन्हें **वर्ग अंतराल** (वर्ग) कहते हैं। 10 – 25 में 10 **निम्न सीमा** है और 25 **उपरि सीमा**; उनका अंतर, 15, **वर्ग माप** है। उपरि सीमा वाला मान अगले वर्ग में जाता है: 40 अंक 40 – 55 में गिने जाते हैं, 25 – 40 में नहीं।",
        ),
      ),
      w.body(
        t(
          "Grouped in 15s, the same 30 marks become: 10 – 25: 2, 25 – 40: 3, 40 – 55: 7, 55 – 70: 6, 70 – 85: 6, 85 – 100: 6. This is all the teacher gave Riya. Inside a class we no longer know the separate marks, so we need one number to stand for the whole class.",
          "15-15 के समूहों में, वही 30 अंक बनते हैं: 10 – 25: 2, 25 – 40: 3, 40 – 55: 7, 55 – 70: 6, 70 – 85: 6, 85 – 100: 6। टीचर ने रिया को बस इतना ही दिया। किसी वर्ग के अंदर अब अलग-अलग अंक नहीं पता, तो पूरे वर्ग के लिए एक संख्या चाहिए।",
        ),
      ),
      w.definition(
        t(
          r`**Class mark.** We assume the values in a class are spread evenly around its middle, so the middle stands for the class. This middle is the **class mark**: $$\text{class mark} = \frac{\text{upper limit} + \text{lower limit}}{2}$$ For 10 – 25 it is $\frac{10 + 25}{2} = 17.5$.`,
          r`**वर्ग चिह्न।** हम मान लेते हैं कि किसी वर्ग के मान उसके बीच के आसपास बराबर फैले हैं, तो बीच का मान पूरे वर्ग का प्रतिनिधि है। यही बीच का मान **वर्ग चिह्न** है: $$\text{वर्ग चिह्न} = \frac{\text{उपरि सीमा} + \text{निम्न सीमा}}{2}$$ 10 – 25 के लिए यह $\frac{10 + 25}{2} = 17.5$ है।`,
        ),
      ),
      mark,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The direct method (Table 14.3): 62. */
const direct = page(
  "direct",
  (b) => {
    const w = wordsOn(b);
    const table = b.prop(meanTableDef, "table", {
      rows: GROUPED,
      isGrouped: true,
      method: Method.Direct,
      step: 0,
      classHeading: heading("Marks", "अंक"),
      freqHeading: heading("Students (fᵢ)", "विद्यार्थी (fᵢ)"),
      canStep: true,
    });
    b.studentOnly(table.action(MeanAction.Next));
    b.studentOnly(table.action(MeanAction.Back));
    b.standsFor(
      table,
      "the marks grouped in classes of 15, worked by the direct method: class marks xᵢ (17.5, 32.5, …), products fᵢxᵢ, totals Σfᵢ = 30 and Σfᵢxᵢ = 1860, and the mean 1860 ÷ 30 = 62",
    );
    const goal = goalQuestion(b, {
      about: table,
      prompt: t(
        "Show the class marks, then fᵢxᵢ, then the mean.",
        "पहले वर्ग चिह्न, फिर fᵢxᵢ, फिर माध्य दिखाओ।",
      ),
      isMet: table.field("step").eq(3),
      solve: [
        table.learner(MeanAction.Next),
        table.learner(MeanAction.Next),
        table.learner(MeanAction.Next),
      ],
    });
    return column([
      w.title(t("The direct method", "प्रत्यक्ष विधि")),
      w.body(
        t(
          "Now each class mark $x_i$ stands for its class, with the class's frequency $f_i$. The data looks just like the Class IX table, so the same formula works.",
          "अब हर वर्ग चिह्न $x_i$ अपने वर्ग का प्रतिनिधि है, वर्ग की बारंबारता $f_i$ के साथ। आँकड़े बिल्कुल कक्षा IX की तालिका जैसे दिखते हैं, तो वही सूत्र काम करता है।",
        ),
      ),
      w.definition(
        t(
          r`**The direct method.** Write the class marks $x_i$, multiply each by its frequency to get $f_ix_i$, and add both columns: $$\bar{x} = \frac{\Sigma f_i x_i}{\Sigma f_i}$$`,
          r`**प्रत्यक्ष विधि।** वर्ग चिह्न $x_i$ लिखो, हर एक को उसकी बारंबारता से गुणा करके $f_ix_i$ पाओ, और दोनों स्तंभ जोड़ो: $$\bar{x} = \frac{\Sigma f_i x_i}{\Sigma f_i}$$`,
        ),
      ),
      table,
      goal,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** 62 or 59.3? The class-mark assumption. */
const which = page(
  "which",
  (b) => {
    const w = wordsOn(b);
    const exact = choiceQuestion(b, {
      name: "exact",
      prompt: t(
        "From the same 30 marks, Table 14.1 gives 59.3 and the grouped table gives 62. Which is the exact mean?",
        "उन्हीं 30 अंकों से, तालिका 14.1 से 59.3 मिलता है और वर्गीकृत तालिका से 62। ठीक-ठीक माध्य कौन-सा है?",
      ),
      options: [
        {
          id: "right",
          label: t("59.3, from the real marks", "59.3, असली अंकों से"),
        },
        {
          id: "grouped",
          label: t("62, from the class marks", "62, वर्ग चिह्नों से"),
          feedback: t(
            "62 assumes every class is centred on its class mark, which isn't quite true. It's a close estimate, not the exact value.",
            "62 मानता है कि हर वर्ग अपने वर्ग चिह्न पर केंद्रित है, जो पूरी तरह सच नहीं। यह क़रीबी अनुमान है, ठीक मान नहीं।",
          ),
        },
        {
          id: "both",
          label: t("Both: they're equally exact", "दोनों: वे बराबर ठीक हैं"),
          feedback: t(
            "They can't both be exact: they differ. Only the real marks give the exact mean.",
            "दोनों ठीक नहीं हो सकते: वे अलग हैं। सिर्फ़ असली अंक ठीक माध्य देते हैं।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Why 62 and not 59.3?", "62 क्यों, 59.3 क्यों नहीं?")),
      w.body(
        t(
          "Both tables came from the same marks and used the same formula, yet they give different means.",
          "दोनों तालिकाएँ उन्हीं अंकों से बनीं और उसी सूत्र का उपयोग किया, फिर भी अलग माध्य देती हैं।",
        ),
      ),
      w.body(
        t(
          "The reason is the class mark. The grouped table pretends that, say, the 7 students in 40 – 55 all scored 47.5. Really they scored 40, 40, 40, 40, 50, 50 and 50. The class-mark assumption makes the grouped mean an **approximation**.",
          "कारण वर्ग चिह्न है। वर्गीकृत तालिका ऐसा मानती है कि, मान लो, 40 – 55 वाले 7 विद्यार्थियों सबके 47.5 आए। असल में उनके 40, 40, 40, 40, 50, 50 और 50 आए। वर्ग चिह्न वाली धारणा वर्गीकृत माध्य को एक **सन्निकटन** (लगभग मान) बना देती है।",
        ),
      ),
      exact,
      w.note(
        t(
          "When the exact values are lost, the grouped mean is the best we can do, and it is usually close.",
          "जब ठीक-ठीक मान खो जाएँ, तो वर्गीकृत माध्य ही सबसे अच्छा है, और यह अक्सर क़रीब होता है।",
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

/** The first box: "class average about 62". */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const sheet = sceneOn(
      b,
      "sheet",
      DataSceneKind.MarksSheet,
      "Riya at her desk with the grouped marks sheet and tally marks, working it out with a pencil while Grandpa looks over her shoulder",
    );
    const write = choiceQuestion(b, {
      name: "write",
      prompt: t(
        "What should Riya write in the poster's first box, using only the grouped marks?",
        "सिर्फ़ वर्गीकृत अंकों से, रिया पोस्टर के पहले बक्से में क्या लिखे?",
      ),
      options: [
        { id: "right", label: t("Class average: about 62", "कक्षा का औसत: लगभग 62") },
        {
          id: "exact",
          label: t("Class average: exactly 62", "कक्षा का औसत: ठीक 62"),
          feedback: t(
            'From grouped marks the mean is an estimate. The register\'s exact average could be a little different, so "about" is honest.',
            'वर्गीकृत अंकों से माध्य एक अनुमान है। रजिस्टर का ठीक-ठीक औसत थोड़ा अलग हो सकता है, इसलिए "लगभग" लिखना ईमानदार है।',
          ),
        },
        {
          id: "middle",
          label: t("Class average: 47.5 to 55", "कक्षा का औसत: 47.5 से 55"),
          feedback: t(
            "47.5 is just one class mark. The mean weighs every class by its frequency: 1860 ÷ 30 = 62.",
            "47.5 बस एक वर्ग चिह्न है। माध्य हर वर्ग को उसकी बारंबारता से तौलता है: 1860 ÷ 30 = 62।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("The first box", "पहला बक्सा")),
      sheet,
      w.body(
        t(
          'Riya makes the table: class marks, then $f_ix_i$, then the totals 30 and 1860. Grandpa checks her division. "Sixty-two," he says, "give or take. You don\'t know their exact marks, so it can only be an estimate, but it\'s a good one."',
          'रिया तालिका बनाती है: वर्ग चिह्न, फिर $f_ix_i$, फिर योग 30 और 1860। दादाजी उसका भाग जाँचते हैं। "बासठ," वे कहते हैं, "थोड़ा ऊपर-नीचे। तुम्हें उनके ठीक-ठीक अंक नहीं पता, तो यह अनुमान ही हो सकता है, पर अच्छा अनुमान है।"',
        ),
      ),
      write,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Exercise 14.1 Q1 (plants) and Q3 (missing frequency); mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const plants = choiceQuestion(b, {
      name: "plants",
      prompt: t(
        r`Exercise 14.1 Q1. Plants in 20 houses: 0 – 2: 1, 2 – 4: 2, 4 – 6: 1, 6 – 8: 5, 8 – 10: 6, 10 – 12: 2, 12 – 14: 3. The class marks are 1, 3, 5, …, 13 and $\Sigma f_ix_i = 162$. What is the mean number of plants per house?`,
        r`प्रश्नावली 14.1 प्र1। 20 घरों में पौधे: 0 – 2: 1, 2 – 4: 2, 4 – 6: 1, 6 – 8: 5, 8 – 10: 6, 10 – 12: 2, 12 – 14: 3। वर्ग चिह्न 1, 3, 5, …, 13 हैं और $\Sigma f_ix_i = 162$। प्रति घर पौधों का माध्य क्या है?`,
      ),
      options: [
        { id: "right", label: t("8.1", "8.1") },
        {
          id: "seven",
          label: t("23.1", "23.1"),
          feedback: t(
            "That divides by 7, the number of classes. Divide by Σfᵢ = 20, the number of houses: 162 ÷ 20 = 8.1.",
            "यह 7 से भाग देता है, जो वर्गों की गिनती है। Σfᵢ = 20 से भाग दो, जो घरों की गिनती है: 162 ÷ 20 = 8.1।",
          ),
        },
        {
          id: "mid",
          label: t("7.0", "7.0"),
          feedback: t(
            "7 is the middle class mark. The mean weighs each class by its houses: 162 ÷ 20 = 8.1.",
            "7 बीच का वर्ग चिह्न है। माध्य हर वर्ग को उसके घरों से तौलता है: 162 ÷ 20 = 8.1।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        '**Mission log.** ✓ The average of grouped data: class marks, then $\\bar{x} = \\Sigma f_ix_i / \\Sigma f_i$, the direct method. ✓ Box one: "class average about 62". ✗ Kabir\'s cricket almanac has numbers in the hundreds; multiplying them by hand will be slow. Next: shortcuts.',
        '**मिशन लॉग।** ✓ वर्गीकृत आँकड़ों का औसत: वर्ग चिह्न, फिर $\\bar{x} = \\Sigma f_ix_i / \\Sigma f_i$, प्रत्यक्ष विधि। ✓ पहला बक्सा: "कक्षा का औसत लगभग 62"। ✗ कबीर की क्रिकेट पंचांग-पुस्तिका में सैकड़ों वाली संख्याएँ हैं; उन्हें हाथ से गुणा करना धीमा होगा। आगे: छोटे रास्ते।',
      ),
      "log",
      { isHidden: true },
    );
    b.when(plants.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), plants, log, space()]);
  },
  { passOn: PassOn.Rules },
);

export const overview = [hook, why, recap, grouped, direct, which, inLife, yourTurn];

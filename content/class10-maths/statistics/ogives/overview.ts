import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, goalQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import { DataSceneKind, OgiveAction, OgiveShow, ogiveDef } from "@chalk/prop-data";
import { classes, heading, sceneOn } from "../kit";

/** Table 14.12: marks of 53 students in classes of 10. */
const MARKS = classes(0, 10, [5, 3, 4, 3, 3, 4, 7, 9, 7, 8]);
/** Example 9: annual profits (₹ lakh) of 30 shops. */
const PROFITS = classes(5, 5, [2, 12, 2, 4, 3, 4, 3]);
/** Exercise 14.4 Q1: daily income (₹) of 50 workers. */
const INCOME = classes(100, 20, [12, 14, 8, 6, 10]);

const marksHeadings = {
  classHeading: heading("Marks", "अंक"),
  freqHeading: heading("Students", "विद्यार्थी"),
};

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const sheet = sceneOn(
    b,
    "sheet",
    DataSceneKind.MarksSheet,
    "Grandpa's old shop ledger open on the desk beside the poster, a hand-drawn rising curve on its last page",
  );
  return column([
    w.title(t("The big graph", "बड़ा ग्राफ़")),
    sheet,
    w.body(
      t(
        'Three boxes done; the big graph is still empty. Grandpa opens his old shop ledger. On the last page is a curve that only ever climbs. "Every year I plotted how many customers had spent less than ₹100, less than ₹200, and so on," he says. "Then I could read the middle straight off the graph, without any formula."',
        'तीन बक्से पूरे; बड़ा ग्राफ़ अभी ख़ाली है। दादाजी अपनी पुरानी दुकान का बही-खाता खोलते हैं। आख़िरी पन्ने पर एक वक्र है जो बस ऊपर ही चढ़ता है। "हर साल मैं बनाता था कि कितने ग्राहकों ने ₹100 से कम, ₹200 से कम, इत्यादि ख़र्च किए," वे कहते हैं। "फिर बीच वाला मान बिना किसी सूत्र के सीधे ग्राफ़ से पढ़ लेता था।"',
      ),
    ),
    w.body(
      t(
        "Riya has exactly that kind of data: the cumulative frequencies from the last stop. Can a graph of them give the median?",
        "रिया के पास ठीक ऐसे ही आँकड़े हैं: पिछले पड़ाव की संचयी बारंबारताएँ। क्या उनका ग्राफ़ माध्यक दे सकता है?",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** The less-than ogive. */
const lessThan = page(
  "less-than",
  (b) => {
    const w = wordsOn(b);
    const graph = b.prop(ogiveDef, "graph", {
      rows: MARKS,
      show: OgiveShow.LessThan,
      plotted: 0,
      isMedianShown: false,
      ...marksHeadings,
      canPlot: true,
      canShowMedian: false,
    });
    b.studentOnly(graph.action(OgiveAction.PlotNext));
    b.studentOnly(graph.action(OgiveAction.PlotAll));
    b.studentOnly(graph.action(OgiveAction.Reset));
    b.standsFor(
      graph,
      "a graph of Table 14.12: the less-than points (10, 5), (20, 8), (30, 12), (40, 15), (50, 18), (60, 22), (70, 29), (80, 38), (90, 45), (100, 53), plotted one by one and joined into a rising curve",
    );
    const goal = goalQuestion(b, {
      about: graph,
      prompt: t("Plot all ten points.", "सभी दस बिंदु आलेखित करो।"),
      isMet: graph.field("plotted").eq(10),
      solve: [graph.learner(OgiveAction.PlotAll)],
    });
    return column([
      w.title(t("The less-than ogive", "से कम प्रकार का तोरण")),
      w.definition(
        t(
          "**Ogive.** An **ogive** (or cumulative frequency curve) is the graph of a cumulative frequency distribution.",
          "**तोरण।** **तोरण** (या संचयी बारंबारता वक्र) किसी संचयी बारंबारता बंटन का ग्राफ़ है।",
        ),
      ),
      w.definition(
        t(
          "**Less-than ogive.** Plot each **upper class limit** against its less-than cumulative frequency, (upper limit, cf), and join the points.",
          "**से कम प्रकार का तोरण।** हर **उपरी वर्ग सीमा** को उसकी से कम प्रकार की संचयी बारंबारता के सामने आलेखित करो, (उपरी सीमा, cf), और बिंदुओं को मिलाओ।",
        ),
      ),
      graph,
      goal,
      w.note(
        t(
          "The curve never goes down: each cumulative frequency is at least the one before it. It ends at n = 53.",
          "वक्र कभी नीचे नहीं जाता: हर संचयी बारंबारता पिछली से कम नहीं होती। यह n = 53 पर ख़त्म होता है।",
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The more-than ogive. */
const moreThan = page(
  "more-than",
  (b) => {
    const w = wordsOn(b);
    const graph = b.prop(ogiveDef, "graph", {
      rows: MARKS,
      show: OgiveShow.MoreThan,
      plotted: 0,
      isMedianShown: false,
      ...marksHeadings,
      canPlot: true,
      canShowMedian: false,
    });
    b.studentOnly(graph.action(OgiveAction.PlotNext));
    b.studentOnly(graph.action(OgiveAction.PlotAll));
    b.studentOnly(graph.action(OgiveAction.Reset));
    b.standsFor(
      graph,
      "the more-than points of Table 14.12: (0, 53), (10, 48), (20, 45), (30, 41), (40, 38), (50, 35), (60, 31), (70, 24), (80, 15), (90, 8), joined into a falling curve",
    );
    const goal = goalQuestion(b, {
      about: graph,
      prompt: t("Plot all ten points.", "सभी दस बिंदु आलेखित करो।"),
      isMet: graph.field("plotted").eq(10),
      solve: [graph.learner(OgiveAction.PlotAll)],
    });
    const shape = choiceQuestion(b, {
      name: "shape",
      prompt: t(
        "Why does the more-than ogive fall from left to right?",
        "से अधिक प्रकार का तोरण बाएँ से दाएँ क्यों गिरता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Fewer students score at or above each higher mark",
            "हर ऊँचे अंक पर या उससे ऊपर कम विद्यार्थी होते हैं",
          ),
        },
        {
          id: "plot",
          label: t("Its points are plotted from right to left", "इसके बिंदु दाएँ से बाएँ आलेखित होते हैं"),
          feedback: t(
            "The order of plotting doesn't change a graph. It falls because the count at or above a mark shrinks as the mark grows.",
            "आलेखन का क्रम ग्राफ़ नहीं बदलता। यह इसलिए गिरता है कि अंक बढ़ने पर उस पर या उससे ऊपर की गिनती घटती है।",
          ),
        },
        {
          id: "neg",
          label: t(
            "More-than frequencies are negative numbers",
            "से अधिक प्रकार की बारंबारताएँ ऋणात्मक होती हैं",
          ),
          feedback: t(
            "Every count here is positive: 53, 48, 45, …, 8. They just get smaller as the lower limit rises.",
            "यहाँ हर गिनती धनात्मक है: 53, 48, 45, …, 8। वे बस निम्न सीमा बढ़ने पर छोटी होती जाती हैं।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("The more-than ogive", "से अधिक प्रकार का तोरण")),
      w.definition(
        t(
          "**More-than ogive.** Plot each **lower class limit** against its more-than cumulative frequency, (lower limit, cf), and join the points.",
          "**से अधिक प्रकार का तोरण।** हर **निम्न वर्ग सीमा** को उसकी से अधिक प्रकार की संचयी बारंबारता के सामने आलेखित करो, (निम्न सीमा, cf), और बिंदुओं को मिलाओ।",
        ),
      ),
      graph,
      goal,
      shape,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Reading the median off the less-than ogive. */
const readMedian = page(
  "read-median",
  (b) => {
    const w = wordsOn(b);
    const graph = b.prop(ogiveDef, "graph", {
      rows: MARKS,
      show: OgiveShow.LessThan,
      plotted: 10,
      isMedianShown: false,
      ...marksHeadings,
      canPlot: false,
      canShowMedian: true,
    });
    b.studentOnly(graph.action(OgiveAction.ShowMedian));
    b.standsFor(
      graph,
      "the less-than ogive of Table 14.12; showing the median draws a line across from n/2 = 26.5 to the curve and down to the x-axis at 66.4",
    );
    const goal = goalQuestion(b, {
      about: graph,
      prompt: t("Read the median off the graph.", "ग्राफ़ से माध्यक पढ़ो।"),
      isMet: graph.field("isMedianShown").eq(true),
      solve: [graph.learner(OgiveAction.ShowMedian)],
    });
    const agree = choiceQuestion(b, {
      name: "agree",
      prompt: t(
        "The formula gave 66.43 for this data. What does the graph give?",
        "इन आँकड़ों के लिए सूत्र से 66.43 मिला था। ग्राफ़ क्या देता है?",
      ),
      options: [
        { id: "right", label: t("The same, about 66.4", "वही, लगभग 66.4") },
        {
          id: "half",
          label: t("26.5, where we started", "26.5, जहाँ से शुरू किया"),
          feedback: t(
            "26.5 is n/2 on the y-axis. The median is the x-value below the point on the curve: 66.4.",
            "26.5 y-अक्ष पर n/2 है। माध्यक वक्र के उस बिंदु के नीचे का x-मान है: 66.4।",
          ),
        },
        {
          id: "class",
          label: t("65, the middle of 60 – 70", "65, 60 – 70 का बीच"),
          feedback: t(
            "The reading lands inside 60 – 70, but not at its middle: the curve gives 66.4, matching the formula.",
            "पढ़ा गया मान 60 – 70 के अंदर है, पर उसके बीच में नहीं: वक्र 66.4 देता है, सूत्र जैसा ही।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("The median from the graph", "ग्राफ़ से माध्यक")),
      w.body(
        t(
          "Half the students is n/2 = 26.5. Go across from 26.5 on the y-axis to the curve, then straight down. The x-value there has half the students below it: the median.",
          "आधे विद्यार्थी n/2 = 26.5 हैं। y-अक्ष पर 26.5 से वक्र तक आड़े चलो, फिर सीधे नीचे। वहाँ के x-मान से नीचे आधे विद्यार्थी हैं: यही माध्यक है।",
        ),
      ),
      graph,
      goal,
      agree,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Both ogives cross at the median (Example 9). */
const both = page(
  "both",
  (b) => {
    const w = wordsOn(b);
    const graph = b.prop(ogiveDef, "graph", {
      rows: PROFITS,
      show: OgiveShow.Both,
      plotted: 0,
      isMedianShown: false,
      classHeading: heading("Profit (₹ lakh)", "लाभ (₹ लाख)"),
      freqHeading: heading("Shops", "दुकानें"),
      canPlot: true,
      canShowMedian: true,
    });
    b.studentOnly(graph.action(OgiveAction.PlotNext));
    b.studentOnly(graph.action(OgiveAction.PlotAll));
    b.studentOnly(graph.action(OgiveAction.ShowMedian));
    b.studentOnly(graph.action(OgiveAction.Reset));
    b.standsFor(
      graph,
      "NCERT Example 9, annual profits of 30 shops in classes of ₹5 lakh from 5 to 40, frequencies 2, 12, 2, 4, 3, 4, 3, with both ogives drawn; they cross above 17.5, the median",
    );
    const goal = goalQuestion(b, {
      about: graph,
      prompt: t(
        "Plot both ogives, then show where they cross.",
        "दोनों तोरण आलेखित करो, फिर दिखाओ कि वे कहाँ काटते हैं।",
      ),
      isMet: graph.field("isMedianShown").eq(true),
      solve: [graph.learner(OgiveAction.PlotAll), graph.learner(OgiveAction.ShowMedian)],
    });
    const cross = choiceQuestion(b, {
      name: "cross",
      prompt: t(
        "The ogives cross at a height of 15. Why 15?",
        "तोरण 15 की ऊँचाई पर काटते हैं। 15 ही क्यों?",
      ),
      options: [
        {
          id: "right",
          label: t("It's half the 30 shops: n/2", "यह 30 दुकानों का आधा है: n/2"),
        },
        {
          id: "class",
          label: t("It's the lower limit of 15 – 20", "यह 15 – 20 की निम्न सीमा है"),
          feedback: t(
            "The 15 here is on the y-axis, a count of shops. Below the crossing, as many shops are under the profit as at or over it: 15 each, n/2.",
            "यहाँ 15 y-अक्ष पर है, दुकानों की गिनती। काटने के बिंदु पर, उस लाभ से कम जितनी दुकानें हैं उतनी ही उस पर या उससे ज़्यादा: 15-15, यानी n/2।",
          ),
        },
        {
          id: "mode",
          label: t("It's the biggest single frequency", "यह सबसे बड़ी अकेली बारंबारता है"),
          feedback: t(
            "The biggest frequency is 12. The curves cross at n/2 = 15, where the two counts are equal.",
            "सबसे बड़ी बारंबारता 12 है। वक्र n/2 = 15 पर काटते हैं, जहाँ दोनों गिनतियाँ बराबर हैं।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Two curves, one median", "दो वक्र, एक माध्यक")),
      w.body(
        t(
          "NCERT Example 9: the profits of 30 shops in a shopping complex. Draw both ogives on the same axes. Where they cross, the number of shops below a profit equals the number at or above it, so the x-value of the crossing is the median.",
          "NCERT उदाहरण 9: एक शॉपिंग कॉम्प्लेक्स की 30 दुकानों का लाभ। दोनों तोरण एक ही अक्षों पर बनाओ। जहाँ वे काटते हैं, वहाँ किसी लाभ से कम वाली दुकानें उस पर या उससे ज़्यादा वालों के बराबर हैं, तो काटने के बिंदु का x-मान माध्यक है।",
        ),
      ),
      graph,
      goal,
      cross,
      w.note(
        t(
          "The median profit is ₹17.5 lakh. The formula agrees: 15 + ((15 − 14)/2) × 5 = 17.5.",
          "माध्यक लाभ ₹17.5 लाख है। सूत्र भी यही देता है: 15 + ((15 − 14)/2) × 5 = 17.5।",
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
    const poster = sceneOn(
      b,
      "poster",
      DataSceneKind.Poster,
      "the finished '10B in Numbers' poster: three filled boxes and a big ogive with a dotted line down from its middle",
    );
    const read = choiceQuestion(b, {
      name: "read",
      prompt: t(
        'A visitor asks: "How many of you scored below 50?" How can Riya answer from the less-than ogive?',
        'एक आगंतुक पूछता है: "तुममें से कितनों के 50 से कम अंक आए?" रिया से कम प्रकार के तोरण से कैसे उत्तर दे?',
      ),
      options: [
        {
          id: "right",
          label: t("Read the height of the curve above 50", "50 के ऊपर वक्र की ऊँचाई पढ़े"),
        },
        {
          id: "across",
          label: t("Go across from 50 on the y-axis", "y-अक्ष पर 50 से आड़े चले"),
          feedback: t(
            "50 is a mark, so it belongs on the x-axis. Go up from 50 to the curve and read the height: 18 students.",
            "50 एक अंक है, तो यह x-अक्ष पर है। 50 से वक्र तक ऊपर जाओ और ऊँचाई पढ़ो: 18 विद्यार्थी।",
          ),
        },
        {
          id: "more",
          label: t("Read the more-than curve at 50 instead", "इसकी बजाय 50 पर से अधिक वाला वक्र पढ़े"),
          feedback: t(
            "The more-than curve counts those at or above 50. For below 50, read the less-than curve: 18.",
            "से अधिक वाला वक्र 50 पर या उससे ऊपर वालों को गिनता है। 50 से कम के लिए से कम वाला वक्र पढ़ो: 18।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("The poster is up", "पोस्टर लग गया")),
      poster,
      w.body(
        t(
          'Riya draws the less-than ogive of the 53 students\' marks across the bottom of the poster and drops a dotted line from the middle. An ogive answers more than the median: any "how many below …?" question is one look at the curve.',
          'रिया पोस्टर के नीचे 53 विद्यार्थियों के अंकों का से कम प्रकार का तोरण बनाती है और बीच से एक बिंदुदार रेखा गिराती है। तोरण माध्यक से ज़्यादा बताता है: "… से कम कितने?" वाला हर सवाल वक्र पर एक नज़र है।',
        ),
      ),
      read,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Exercise 14.4 Q1, Q2 and Q3; mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const graph = b.prop(ogiveDef, "graph", {
      rows: INCOME,
      show: OgiveShow.LessThan,
      plotted: 0,
      isMedianShown: false,
      classHeading: heading("Daily income (₹)", "दैनिक आय (₹)"),
      freqHeading: heading("Workers", "मज़दूर"),
      canPlot: true,
      canShowMedian: true,
    });
    b.studentOnly(graph.action(OgiveAction.PlotNext));
    b.studentOnly(graph.action(OgiveAction.PlotAll));
    b.studentOnly(graph.action(OgiveAction.ShowMedian));
    b.studentOnly(graph.action(OgiveAction.Reset));
    b.standsFor(
      graph,
      "Exercise 14.4 Q1, daily income of 50 workers in classes of ₹20 from 100 to 200 with frequencies 12, 14, 8, 6, 10, as a less-than ogive through (120, 12), (140, 26), (160, 34), (180, 40), (200, 50)",
    );
    const goal = goalQuestion(b, {
      about: graph,
      prompt: t(
        "Exercise 14.4 Q1. Draw the less-than ogive of the workers' daily income and read its median.",
        "प्रश्नावली 14.4 प्र1। मज़दूरों की दैनिक आय का से कम प्रकार का तोरण बनाओ और उसका माध्यक पढ़ो।",
      ),
      isMet: graph.field("isMedianShown").eq(true),
      solve: [graph.learner(OgiveAction.PlotAll), graph.learner(OgiveAction.ShowMedian)],
    });
    const weights = choiceQuestion(b, {
      name: "weights",
      prompt: t(
        "Exercise 14.4 Q2. Weights of 35 students: less than 38 kg: 0, 40: 3, 42: 5, 44: 9, 46: 14, 48: 28, 50: 32, 52: 35. Going across from 17.5 on the less-than ogive, where do you land?",
        "प्रश्नावली 14.4 प्र2। 35 विद्यार्थियों का भार: 38 किग्रा से कम: 0, 40: 3, 42: 5, 44: 9, 46: 14, 48: 28, 50: 32, 52: 35। से कम प्रकार के तोरण पर 17.5 से आड़े चलने पर कहाँ पहुँचते हो?",
      ),
      options: [
        { id: "right", label: t("46.5 kg", "46.5 किग्रा") },
        {
          id: "class",
          label: t("47.0 kg", "47.0 किग्रा"),
          feedback: t(
            "47 is the middle of 46 – 48. The count climbs from 14 to 28 there, so 17.5 is reached at 46 + 3.5/14 × 2 = 46.5.",
            "47, 46 – 48 का बीच है। वहाँ गिनती 14 से 28 तक चढ़ती है, तो 17.5 पर पहुँचते हैं 46 + 3.5/14 × 2 = 46.5 पर।",
          ),
        },
        {
          id: "low",
          label: t("44.4 kg", "44.4 किग्रा"),
          feedback: t(
            "Below 46 there are only 14 students, so 17.5 is past 46: 46 + 3.5/14 × 2 = 46.5.",
            "46 से नीचे सिर्फ़ 14 विद्यार्थी हैं, तो 17.5, 46 के बाद है: 46 + 3.5/14 × 2 = 46.5।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const farms = choiceQuestion(b, {
      name: "farms",
      prompt: t(
        "Exercise 14.4 Q3. Yield (kg/ha) of 100 farms: 50 – 55: 2, 55 – 60: 8, 60 – 65: 12, 65 – 70: 24, 70 – 75: 38, 75 – 80: 16. Which point is on the more-than ogive?",
        "प्रश्नावली 14.4 प्र3। 100 खेतों की उपज (किग्रा/हेक्टेयर): 50 – 55: 2, 55 – 60: 8, 60 – 65: 12, 65 – 70: 24, 70 – 75: 38, 75 – 80: 16। से अधिक प्रकार के तोरण पर कौन-सा बिंदु है?",
      ),
      options: [
        { id: "right", label: t("(65, 78)", "(65, 78)") },
        {
          id: "upper",
          label: t("(70, 78)", "(70, 78)"),
          feedback: t(
            "A more-than ogive uses lower limits: 78 farms yield 65 or more, so the point is (65, 78).",
            "से अधिक प्रकार का तोरण निम्न सीमाएँ लेता है: 78 खेतों की उपज 65 या ज़्यादा है, तो बिंदु (65, 78) है।",
          ),
        },
        {
          id: "less",
          label: t("(65, 22)", "(65, 22)"),
          feedback: t(
            "22 farms yield less than 65: that's a less-than point. 100 − 22 = 78 yield 65 or more: (65, 78).",
            "22 खेतों की उपज 65 से कम है: यह से कम प्रकार का बिंदु है। 100 − 22 = 78 की 65 या ज़्यादा: (65, 78)।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ Less-than and more-than ogives. ✓ The median from a graph: across from n/2, or down from where the two ogives cross. ✓ The poster is up: about 62, about 3, 149 cm, and the big graph.",
        "**मिशन लॉग।** ✓ से कम और से अधिक प्रकार के तोरण। ✓ ग्राफ़ से माध्यक: n/2 से आड़े चलकर, या दोनों तोरणों के कटान से नीचे। ✓ पोस्टर लग गया: लगभग 62, लगभग 3, 149 सेमी, और बड़ा ग्राफ़।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(weights));
    b.when(weights.on(QuestionSignal.Correct), theBoard.show(farms));
    b.when(farms.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([
      w.title(t("Your turn", "अब तुम्हारी बारी")),
      graph,
      goal,
      weights,
      farms,
      log,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Saturday: the fair, and Kabir's stall. */
const finale = page("finale", (b) => {
  const w = wordsOn(b);
  const fair = sceneOn(
    b,
    "fair",
    DataSceneKind.Finale,
    "Saturday's fun fair: the 10B poster on the wall, and Kabir's games stall in front of it with a spinner, dice and a crowd",
  );
  return column([
    w.title(t("Saturday", "शनिवार")),
    fair,
    w.body(
      t(
        'Friday: the poster wins a cheer at Annual Day. Saturday: the fun fair. Kabir\'s games stall is right under it, with a spinner, two dice and a hand-written sign: "Win a prize! Easy!"',
        'शुक्रवार: वार्षिकोत्सव में पोस्टर पर तालियाँ बजती हैं। शनिवार: मेला। कबीर का खेल स्टॉल ठीक उसके नीचे है, एक चकरी, दो पासे और हाथ से लिखे बोर्ड के साथ: "इनाम जीतो! आसान!"',
      ),
    ),
    w.body(
      t(
        "Riya watches a few rounds and frowns. Statistics describes what has already happened. But is Kabir's game really easy to win? To answer that, she will need the mathematics of what is likely to happen: probability.",
        "रिया कुछ दौर देखती है और माथे पर बल पड़ते हैं। सांख्यिकी बताती है कि क्या हो चुका है। पर क्या कबीर का खेल सच में जीतना आसान है? इसका उत्तर देने के लिए उसे इस गणित की ज़रूरत होगी कि क्या होने की संभावना है: प्रायिकता।",
      ),
    ),
    space(),
  ]);
});

export const overview = [hook, lessThan, moreThan, readMedian, both, inLife, yourTurn, finale];

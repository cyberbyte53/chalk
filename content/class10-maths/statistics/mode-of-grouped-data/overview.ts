import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, goalQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  DataSceneKind,
  MeanAction,
  Method,
  ModeAction,
  meanTableDef,
  modeChartDef,
} from "@chalk/prop-data";
import { classes, heading, sceneOn } from "../kit";

const r = String.raw;

/** Example 4: wickets in 10 matches, as a frequency table. */
const WICKETS = [0, 1, 2, 3, 4, 5, 6].map((x, i) => ({
  lo: x,
  hi: x,
  f: [1, 1, 3, 2, 1, 1, 1][i] ?? 0,
  label: null,
}));
/** Example 5: family sizes of 20 households. */
const FAMILIES = classes(1, 2, [7, 8, 2, 2, 1]);
/** Table 14.3: the marks, for Example 6. */
const MARKS = classes(10, 15, [2, 3, 7, 6, 6, 6]);

const familyHeadings = {
  classHeading: heading("Family size", "परिवार का आकार"),
  freqHeading: heading("Families", "परिवार"),
};

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const survey = sceneOn(
    b,
    "survey",
    DataSceneKind.FamilySurvey,
    "Meera with a clipboard outside a row of houses, counting the members of each family for the poster",
  );
  return column([
    w.title(t("The most common family", "सबसे आम परिवार")),
    survey,
    w.body(
      t(
        'Box two of the poster is "most common". Riya picks family size, and her friend Meera from the next lane surveyed 20 households and grouped the answers: 1 – 3 members, 3 – 5, 5 – 7, 7 – 9, 9 – 11.',
        'पोस्टर का दूसरा बक्सा है "सबसे आम"। रिया परिवार का आकार चुनती है, और बगल की गली की उसकी सहेली मीरा ने 20 घरों का सर्वे किया और उत्तरों को वर्गों में बाँटा: 1 – 3 सदस्य, 3 – 5, 5 – 7, 7 – 9, 9 – 11।',
      ),
    ),
    w.body(
      t(
        'An average won\'t do: "3.4 people" is no family anyone lives in. Riya needs the value that turns up most often. But once data is grouped, the separate values are gone. Which one turns up most?',
        'औसत काम नहीं आएगा: "3.4 लोग" किसी का परिवार नहीं होता। रिया को वह मान चाहिए जो सबसे ज़्यादा बार आता है। पर वर्गों में बाँटने के बाद अलग-अलग मान खो जाते हैं। तो सबसे ज़्यादा कौन-सा आता है?',
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** The mode of ungrouped data (Example 4). */
const recap = page(
  "recap",
  (b) => {
    const w = wordsOn(b);
    const table = b.prop(meanTableDef, "table", {
      rows: WICKETS,
      isGrouped: false,
      method: Method.Direct,
      a: null,
      h: null,
      step: 0,
      classHeading: heading("Wickets", "विकेट"),
      freqHeading: heading("Matches", "मैच"),
      canStep: false,
      canSetMethod: false,
      canSetA: false,
    });
    b.standsFor(
      table,
      "NCERT Example 4 as a frequency table: wickets taken by a bowler in 10 matches, 0 to 6 wickets, with 2 wickets taken in 3 matches and every other number in at most 2",
    );
    const mode = choiceQuestion(b, {
      name: "mode",
      prompt: t(
        "A bowler's wickets in 10 matches: 2, 6, 4, 5, 0, 2, 1, 3, 2, 3. What is the mode?",
        "एक गेंदबाज़ के 10 मैचों में विकेट: 2, 6, 4, 5, 0, 2, 1, 3, 2, 3। बहुलक क्या है?",
      ),
      options: [
        { id: "right", label: t("2 wickets", "2 विकेट") },
        {
          id: "freq",
          label: t("3 wickets", "3 विकेट"),
          feedback: t(
            "3 is how often the mode turns up. The mode is the value itself: 2 wickets, in 3 matches.",
            "3 यह है कि बहुलक कितनी बार आता है। बहुलक ख़ुद मान है: 2 विकेट, 3 मैचों में।",
          ),
        },
        {
          id: "big",
          label: t("6 wickets", "6 विकेट"),
          feedback: t(
            "6 is the largest value, but it turns up once. 2 turns up three times.",
            "6 सबसे बड़ा मान है, पर एक बार आता है। 2 तीन बार आता है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("The mode, so far", "अब तक का बहुलक")),
      w.definition(
        t(
          "**Mode.** The **mode** is the value of the observation that occurs most often, the one with the highest frequency.",
          "**बहुलक।** **बहुलक** उस प्रेक्षण का मान है जो सबसे ज़्यादा बार आता है, यानी जिसकी बारंबारता सबसे अधिक हो।",
        ),
      ),
      w.body(
        t(
          "With ungrouped data you read it straight off the table: find the biggest frequency.",
          "अवर्गीकृत आँकड़ों में इसे सीधे तालिका से पढ़ लेते हैं: सबसे बड़ी बारंबारता ढूँढो।",
        ),
      ),
      table,
      mode,
      w.note(
        t(
          "Data can have more than one mode: if two values tie for the highest frequency, both are modes.",
          "आँकड़ों में एक से ज़्यादा बहुलक हो सकते हैं: अगर दो मानों की बारंबारता बराबर और सबसे अधिक हो, तो दोनों बहुलक हैं।",
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The modal class: tap the tallest bar. */
const modalClass = page(
  "modal-class",
  (b) => {
    const w = wordsOn(b);
    const chart = b.prop(modeChartDef, "chart", {
      rows: FAMILIES,
      step: 0,
      picked: null,
      ...familyHeadings,
      canStep: false,
      canPick: true,
      showMean: false,
    });
    b.studentOnly(chart.action(ModeAction.Pick));
    b.standsFor(
      chart,
      "a histogram of Meera's 20 families in classes 1 – 3, 3 – 5, 5 – 7, 7 – 9, 9 – 11 with frequencies 7, 8, 2, 2, 1; the learner taps the tallest bar, 3 – 5",
    );
    const goal = goalQuestion(b, {
      about: chart,
      prompt: t("Tap the modal class.", "बहुलक वर्ग पर टैप करो।"),
      isMet: chart.field("step").eq(1),
      solve: [chart.learner(ModeAction.Pick, { index: 1 })],
    });
    return column([
      w.title(t("The modal class", "बहुलक वर्ग")),
      w.body(
        t(
          "With grouped data we can't see single values, but we can see which class is fullest.",
          "वर्गीकृत आँकड़ों में अकेले मान नहीं दिखते, पर यह दिखता है कि कौन-सा वर्ग सबसे भरा है।",
        ),
      ),
      w.definition(
        t(
          "**Modal class.** The class interval with the highest frequency is the **modal class**. The mode lies somewhere inside it.",
          "**बहुलक वर्ग।** सबसे अधिक बारंबारता वाला वर्ग अंतराल **बहुलक वर्ग** है। बहुलक इसी के अंदर कहीं होता है।",
        ),
      ),
      chart,
      goal,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The mode formula, worked on Example 5. */
const formula = page(
  "formula",
  (b) => {
    const w = wordsOn(b);
    const chart = b.prop(modeChartDef, "chart", {
      rows: FAMILIES,
      step: 1,
      picked: 1,
      ...familyHeadings,
      canStep: true,
      canPick: false,
      showMean: false,
    });
    b.studentOnly(chart.action(ModeAction.Next));
    b.studentOnly(chart.action(ModeAction.Back));
    b.standsFor(
      chart,
      "the family-size histogram with the modal class 3 – 5 picked out; the next steps mark l = 3, h = 2, f₁ = 8, f₀ = 7, f₂ = 2 and work the mode out to 3.286, inside the modal class and leaning towards the 1 – 3 bar",
    );
    const goal = goalQuestion(b, {
      about: chart,
      prompt: t(
        "Step on to mark the pieces and find the mode.",
        "आगे बढ़कर हिस्से चिह्नित करो और बहुलक निकालो।",
      ),
      isMet: chart.field("step").eq(3),
      solve: [chart.learner(ModeAction.Next), chart.learner(ModeAction.Next)],
    });
    return column([
      w.title(t("Where in the class?", "वर्ग में कहाँ?")),
      w.body(
        t(
          "The mode leans towards the busier neighbour. Here the class before (7 families) is much fuller than the class after (2), so the mode sits nearer 3 than 5.",
          "बहुलक ज़्यादा भरे पड़ोसी की ओर झुकता है। यहाँ पहले वाला वर्ग (7 परिवार) बाद वाले (2) से कहीं ज़्यादा भरा है, तो बहुलक 5 की बजाय 3 के पास है।",
        ),
      ),
      w.definition(
        t(
          r`**Mode of grouped data.** $$\text{Mode} = l + \left(\frac{f_1 - f_0}{2f_1 - f_0 - f_2}\right) \times h$$ where $l$ is the lower limit of the modal class, $h$ the class size, $f_1$ the frequency of the modal class, $f_0$ that of the class before it and $f_2$ that of the class after it.`,
          r`**वर्गीकृत आँकड़ों का बहुलक।** $$\text{बहुलक} = l + \left(\frac{f_1 - f_0}{2f_1 - f_0 - f_2}\right) \times h$$ जहाँ $l$ बहुलक वर्ग की निम्न सीमा है, $h$ वर्ग माप, $f_1$ बहुलक वर्ग की बारंबारता, $f_0$ उससे पहले वाले वर्ग की और $f_2$ उसके बाद वाले वर्ग की बारंबारता।`,
        ),
      ),
      chart,
      goal,
      w.body(t("Example 5 in full:", "उदाहरण 5 पूरा:")),
      w.body(
        t(
          r`$$\begin{aligned}\text{Mode} &= 3 + \left(\frac{8 - 7}{2 \times 8 - 7 - 2}\right) \times 2\\ &= 3 + \frac{2}{7}\\ &= 3.286\end{aligned}$$`,
          r`$$\begin{aligned}\text{बहुलक} &= 3 + \left(\frac{8 - 7}{2 \times 8 - 7 - 2}\right) \times 2\\ &= 3 + \frac{2}{7}\\ &= 3.286\end{aligned}$$`,
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Example 6: the marks' mode (52) against their mean (62). */
const modeVsMean = page(
  "mode-vs-mean",
  (b) => {
    const w = wordsOn(b);
    const chart = b.prop(modeChartDef, "chart", {
      rows: MARKS,
      step: 0,
      picked: null,
      classHeading: heading("Marks", "अंक"),
      freqHeading: heading("Students", "विद्यार्थी"),
      canStep: true,
      canPick: true,
      showMean: true,
    });
    b.studentOnly(chart.action(ModeAction.Pick));
    b.studentOnly(chart.action(ModeAction.Next));
    b.studentOnly(chart.action(ModeAction.Back));
    b.standsFor(
      chart,
      "a histogram of Riya's marks (classes of 15 from 10 to 100, frequencies 2, 3, 7, 6, 6, 6) with a line at the mean 62; the modal class is 40 – 55 and the mode works out to 52",
    );
    const goal = goalQuestion(b, {
      about: chart,
      prompt: t("Pick the modal class and find the mode.", "बहुलक वर्ग चुनो और बहुलक निकालो।"),
      isMet: chart.field("step").eq(3),
      solve: [
        chart.learner(ModeAction.Pick, { index: 2 }),
        chart.learner(ModeAction.Next),
        chart.learner(ModeAction.Next),
      ],
    });
    const compare = choiceQuestion(b, {
      name: "compare",
      prompt: t(
        "The mode is 52 and the mean is 62. Which statement fits?",
        "बहुलक 52 है और माध्य 62। कौन-सा कथन ठीक बैठता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "The commonest score was about 52; the average was 62",
            "सबसे आम अंक लगभग 52 था; औसत 62 था",
          ),
        },
        {
          id: "wrong",
          label: t(
            "One of the two has to be a calculation mistake",
            "दोनों में से एक गणना की ग़लती होनी चाहिए",
          ),
          feedback: t(
            "Both are right. They answer different questions, so they needn't agree.",
            "दोनों सही हैं। वे अलग-अलग सवालों के उत्तर हैं, तो उनका बराबर होना ज़रूरी नहीं।",
          ),
        },
        {
          id: "swap",
          label: t(
            "The commonest score was about 62; the average was 52",
            "सबसे आम अंक लगभग 62 था; औसत 52 था",
          ),
          feedback: t(
            "Swapped: the mode (52) is the most common score, the mean (62) the average.",
            "उलट गया: बहुलक (52) सबसे आम अंक है, माध्य (62) औसत।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Mode or mean?", "बहुलक या माध्य?")),
      w.body(
        t(
          "NCERT Example 6 goes back to Riya's marks, whose mean we found was 62. The dashed line marks it.",
          "NCERT उदाहरण 6 रिया के अंकों पर लौटता है, जिनका माध्य हमने 62 पाया था। धराशायी रेखा उसे दिखाती है।",
        ),
      ),
      chart,
      goal,
      w.body(
        t(
          r`$$\begin{aligned}\text{Mode} &= 40 + \left(\frac{7 - 3}{14 - 3 - 6}\right) \times 15\\ &= 40 + 12\\ &= 52\end{aligned}$$`,
          r`$$\begin{aligned}\text{बहुलक} &= 40 + \left(\frac{7 - 3}{14 - 3 - 6}\right) \times 15\\ &= 40 + 12\\ &= 52\end{aligned}$$`,
        ),
      ),
      compare,
      w.note(
        t(
          "The mean and the mode of a set of data can be different. Use the one that answers your question.",
          "किसी आँकड़े का माध्य और बहुलक अलग हो सकते हैं। जो तुम्हारे सवाल का उत्तर दे, वही लो।",
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
    const survey = sceneOn(
      b,
      "survey",
      DataSceneKind.FamilySurvey,
      "Meera's lane of houses, the clipboard now showing a bar chart of family sizes",
    );
    const use = choiceQuestion(b, {
      name: "use",
      prompt: t(
        "A shoe shop wants to know which size to stock the most of. Which measure should it use?",
        "एक जूते की दुकान जानना चाहती है कि कौन-सा नाप सबसे ज़्यादा रखे। उसे कौन-सा माप लेना चाहिए?",
      ),
      options: [
        {
          id: "right",
          label: t("The mode: the size most people buy", "बहुलक: वह नाप जो सबसे ज़्यादा लोग लेते हैं"),
        },
        {
          id: "mean",
          label: t("The mean: the average of all sizes sold", "माध्य: बिके सभी नापों का औसत"),
          feedback: t(
            "An average size like 7.4 may be one nobody wears. The shop wants the most common size: the mode.",
            "7.4 जैसा औसत नाप शायद कोई पहनता ही न हो। दुकान को सबसे आम नाप चाहिए: बहुलक।",
          ),
        },
        {
          id: "big",
          label: t(
            "The largest: the size that sells at the highest price",
            "सबसे बड़ा: जो नाप सबसे महँगा बिकता है",
          ),
          feedback: t(
            "The price doesn't say how many people need that size. The most common size is the mode.",
            "क़ीमत से यह पता नहीं चलता कि कितने लोगों को वह नाप चाहिए। सबसे आम नाप बहुलक है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Box two", "दूसरा बक्सा")),
      survey,
      w.body(
        t(
          'Riya writes "Most families in Meera\'s lane have about 3 members". It is a real family size, which is exactly what she wanted. Shops, bus timetables and clothes makers ask the same kind of question.',
          'रिया लिखती है "मीरा की गली के ज़्यादातर परिवारों में लगभग 3 सदस्य हैं"। यह एक असली परिवार का आकार है, ठीक वही जो वह चाहती थी। दुकानें, बसों की समय-सारणी और कपड़े बनाने वाले भी ऐसा ही सवाल पूछते हैं।',
        ),
      ),
      use,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Exercise 14.2 Q2 and Q1; mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const bulbs = choiceQuestion(b, {
      name: "bulbs",
      prompt: t(
        "Exercise 14.2 Q2. Lifetimes (hours) of 225 components: 0 – 20: 10, 20 – 40: 35, 40 – 60: 52, 60 – 80: 61, 80 – 100: 38, 100 – 120: 29. What is the modal lifetime?",
        "प्रश्नावली 14.2 प्र2। 225 पुर्ज़ों का जीवनकाल (घंटे): 0 – 20: 10, 20 – 40: 35, 40 – 60: 52, 60 – 80: 61, 80 – 100: 38, 100 – 120: 29। बहुलक जीवनकाल क्या है?",
      ),
      options: [
        { id: "right", label: t("65.625 hours", "65.625 घंटे") },
        {
          id: "swap",
          label: t("74.375 hours", "74.375 घंटे"),
          feedback: t(
            "f₀ and f₂ are swapped. f₀ = 52 is the class before: 60 + (61 − 52)/(122 − 52 − 38) × 20 = 65.625.",
            "f₀ और f₂ उलट गए। f₀ = 52 पहले वाला वर्ग है: 60 + (61 − 52)/(122 − 52 − 38) × 20 = 65.625।",
          ),
        },
        {
          id: "mark",
          label: t("70.000 hours", "70.000 घंटे"),
          feedback: t(
            "That's just the class mark of 60 – 80. Use the formula: 60 + 9/32 × 20 = 65.625.",
            "यह बस 60 – 80 का वर्ग चिह्न है। सूत्र लगाओ: 60 + 9/32 × 20 = 65.625।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const ages = choiceQuestion(b, {
      name: "ages",
      prompt: t(
        "Exercise 14.2 Q1. Ages (years) of patients admitted in a year: 5 – 15: 6, 15 – 25: 11, 25 – 35: 21, 35 – 45: 23, 45 – 55: 14, 55 – 65: 5. What is the mode?",
        "प्रश्नावली 14.2 प्र1। एक वर्ष में भर्ती मरीज़ों की आयु (वर्ष): 5 – 15: 6, 15 – 25: 11, 25 – 35: 21, 35 – 45: 23, 45 – 55: 14, 55 – 65: 5। बहुलक क्या है?",
      ),
      options: [
        { id: "right", label: t("36.8 years", "36.8 वर्ष") },
        {
          id: "noh",
          label: t("35.2 years", "35.2 वर्ष"),
          feedback: t(
            "Multiply by h = 10 too: 35 + 2/11 × 10 = 36.8.",
            "h = 10 से भी गुणा करो: 35 + 2/11 × 10 = 36.8।",
          ),
        },
        {
          id: "mean",
          label: t("35.4 years", "35.4 वर्ष"),
          feedback: t(
            "35.37 is the mean of this data. The mode is 35 + (23 − 21)/(46 − 21 − 14) × 10 = 36.8.",
            "35.37 इन आँकड़ों का माध्य है। बहुलक है 35 + (23 − 21)/(46 − 21 − 14) × 10 = 36.8।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ The modal class is the fullest class. ✓ Mode = $l + \\frac{f_1 - f_0}{2f_1 - f_0 - f_2} \\times h$. ✓ Box two: about 3 members. ✗ Box three wants the middle height of the Class 10 girls, and neither mean nor mode gives the middle. Next: the median.",
        "**मिशन लॉग।** ✓ बहुलक वर्ग सबसे भरा वर्ग है। ✓ बहुलक = $l + \\frac{f_1 - f_0}{2f_1 - f_0 - f_2} \\times h$। ✓ दूसरा बक्सा: लगभग 3 सदस्य। ✗ तीसरा बक्सा कक्षा 10 की लड़कियों की बीच वाली लंबाई माँगता है, और न माध्य न बहुलक बीच वाला मान देता है। आगे: माध्यक।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(bulbs.on(QuestionSignal.Correct), theBoard.show(ages));
    b.when(ages.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), bulbs, ages, log, space()]);
  },
  { passOn: PassOn.Rules },
);

export const overview = [hook, recap, modalClass, formula, modeVsMean, inLife, yourTurn];

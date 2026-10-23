import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, goalQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  Coefficient,
  EquationForm,
  LinePairAction,
  LinePairDerived,
  LinearSceneKind,
  Relation,
} from "@chalk/prop-linear-equations";
import { equals, general, plane, scene } from "../kit";

const r = String.raw;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** Two bills that look like two clues but say the same thing; and the rails that never meet. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const bills = scene(
    b,
    "bills",
    LinearSceneKind.TwoBills,
    "two stationery bills on a table: 2 pencils and 3 erasers for ₹9, and 4 pencils and 6 erasers for ₹18",
  );
  return column([
    w.title(t("Two bills, one puzzle", "दो बिल, एक पहेली")),
    w.body(
      t(
        "Last lesson, the cash box became two lines on a graph. Before Riya trusts the crossing point, she wants to be sure two clues always give an answer. At the mela's stationery stall she finds two bills on the counter.",
        "पिछले पाठ में गल्ला ग्राफ़ पर दो रेखाएँ बन गया। कटान-बिंदु पर भरोसा करने से पहले रिया पक्का करना चाहती है कि दो सुराग हमेशा जवाब देते हैं। मेले की स्टेशनरी की दुकान पर उसे काउंटर पर दो बिल मिलते हैं।",
      ),
    ),
    bills,
    w.body(
      t(
        "One customer paid ₹9 for 2 pencils and 3 erasers. Another paid ₹18 for 4 pencils and 6 erasers. Two clues, so surely Riya can work out the price of one pencil? She tries, and gets nowhere. Why?",
        "एक ग्राहक ने 2 पेंसिल और 3 रबर के ₹9 दिए। दूसरे ने 4 पेंसिल और 6 रबर के ₹18। दो सुराग हैं, तो रिया एक पेंसिल का दाम ज़रूर निकाल लेगी? वह कोशिश करती है, और कहीं नहीं पहुँचती। क्यों?",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Two lines in a plane: intersecting, parallel or coincident; find each by changing line 2. */
const threeWays = page(
  "three-ways",
  (b) => {
    const w = wordsOn(b);
    const graph = plane(
      b,
      "graph",
      [equals(1, 2, 4), equals(2, 3, 12)],
      { xMin: -2, xMax: 10, yMin: -2, yMax: 7 },
      { editLine: 1, showSolution: true },
    );
    b.standsFor(
      graph,
      "the lines x + 2y = 4 and 2x + 3y = 12, with − and + buttons that change a, b and c of the second line",
    );
    const goal = goalQuestion(b, {
      about: graph,
      prompt: t(
        "Change only the second line's numbers until the two lines are parallel.",
        "केवल दूसरी रेखा की संख्याएँ बदलकर दोनों रेखाओं को समांतर बनाओ।",
      ),
      isMet: graph.derived(LinePairDerived.Relation).eq(Relation.Parallel),
      solve: [
        graph.learner(LinePairAction.SetCoefficient, {
          line: 1,
          coefficient: Coefficient.B,
          value: 4,
        }),
      ],
      notes: [
        {
          when: graph.derived(LinePairDerived.Relation).eq(Relation.Coincident),
          say: t(
            "Now they lie on top of each other: the same line. Parallel lines never meet at all. Change $c$ so it's no longer the same line.",
            "अब वे एक-दूसरे पर पड़ी हैं: एक ही रेखा। समांतर रेखाएँ कभी मिलती ही नहीं। $c$ बदलो ताकि यह वही रेखा न रहे।",
          ),
          reach: [
            graph.learner(LinePairAction.SetCoefficient, {
              line: 1,
              coefficient: Coefficient.A,
              value: 1,
            }),
            graph.learner(LinePairAction.SetCoefficient, {
              line: 1,
              coefficient: Coefficient.B,
              value: 2,
            }),
            graph.learner(LinePairAction.SetCoefficient, {
              line: 1,
              coefficient: Coefficient.C,
              value: -4,
            }),
          ],
        },
      ],
    });
    return column([
      w.title(t("Two lines can sit in three ways", "दो रेखाएँ तीन तरह से हो सकती हैं")),
      w.body(
        t(
          "A pair of linear equations is two lines on the same graph. From Class 9 you know that two lines in a plane can sit in only three ways:",
          "रैखिक समीकरणों का युग्म एक ही ग्राफ़ पर दो रेखाएँ हैं। कक्षा 9 से तुम जानते हो कि एक तल में दो रेखाएँ केवल तीन तरह से हो सकती हैं:",
        ),
      ),
      w.definition(
        t(
          "**Intersecting, parallel, coincident.** (1) The lines **intersect**: they cross at exactly one point. (2) The lines are **parallel**: they never meet, however far you draw them. (3) The lines are **coincident**: they lie exactly on top of each other, so they are really the same line.",
          "**प्रतिच्छेदी, समांतर, संपाती।** (1) रेखाएँ **प्रतिच्छेद** करती हैं: वे ठीक एक बिंदु पर कटती हैं। (2) रेखाएँ **समांतर** हैं: वे कभी नहीं मिलतीं, चाहे जितनी लंबी खींचो। (3) रेखाएँ **संपाती** हैं: वे ठीक एक-दूसरे के ऊपर पड़ी हैं, यानी असल में एक ही रेखा।",
        ),
      ),
      w.body(
        t(
          "Use the − and + buttons under the graph to change $a$, $b$ and $c$ of the second line. Watch how the lines move, and find all three cases.",
          "ग्राफ़ के नीचे − और + बटन से दूसरी रेखा के $a$, $b$ और $c$ बदलो। देखो रेखाएँ कैसे खिसकती हैं, और तीनों स्थितियाँ खोजो।",
        ),
      ),
      graph,
      goal,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** NCERT Example 2: the two bills, drawn; the lines coincide. */
const bills = page(
  "pencils",
  (b) => {
    const w = wordsOn(b);
    const graph = plane(
      b,
      "graph",
      [equals(2, 3, 9), equals(4, 6, 18)],
      { xMin: -1, xMax: 6, yMin: -1, yMax: 5 },
      { showTables: true, showSolution: true },
    );
    b.standsFor(
      graph,
      "NCERT Fig 3.3: 2x + 3y = 9 drawn through (0, 3) and (4.5, 0), and 4x + 6y = 18 through (0, 3) and (3, 1): the same line",
    );
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t("Why do the two lines lie on top of each other?", "दोनों रेखाएँ एक-दूसरे पर क्यों पड़ी हैं?"),
      options: [
        {
          id: "right",
          label: t(
            "$4x + 6y = 18$ is just $2x + 3y = 9$ multiplied by 2",
            "$4x + 6y = 18$ बस $2x + 3y = 9$ को 2 से गुणा किया हुआ है",
          ),
        },
        {
          id: "point",
          label: t("They share the point $(0, 3)$", "दोनों में बिंदु $(0, 3)$ है"),
          feedback: t(
            "Sharing one point only means they meet there. These share every point.",
            "एक बिंदु साझा करने का अर्थ बस यह है कि वे वहाँ मिलती हैं। ये तो हर बिंदु साझा करती हैं।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Two equations, one line", "दो समीकरण, एक रेखा")),
      w.body(
        t(
          "NCERT's Example 2 is the pair of bills. Let one pencil cost ₹$x$ and one eraser ₹$y$:",
          "NCERT का उदाहरण 2 यही दो बिल हैं। मान लो एक पेंसिल ₹$x$ की और एक रबर ₹$y$ का है:",
        ),
      ),
      w.body(
        t(
          r`$$\begin{aligned} 2x + 3y &= 9 \quad (1) \\ 4x + 6y &= 18 \quad (2) \end{aligned}$$`,
          r`$$\begin{aligned} 2x + 3y &= 9 \quad (1) \\ 4x + 6y &= 18 \quad (2) \end{aligned}$$`,
        ),
      ),
      w.body(
        t(
          "Find two solutions of each, plot them and draw the lines. They **coincide**.",
          "हर एक के दो हल निकालो, बिंदु बनाओ और रेखाएँ खींचो। वे **संपाती** हैं।",
        ),
      ),
      graph,
      w.body(
        t(
          "The two equations are **equivalent**: one can be got from the other by multiplying or dividing by a number. Buying twice as much for twice the price tells you nothing new.",
          "दोनों समीकरण **तुल्य** हैं: एक को दूसरे से किसी संख्या से गुणा या भाग करके पाया जा सकता है। दोगुना सामान दोगुने दाम में ख़रीदना कोई नई बात नहीं बताता।",
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** NCERT Example 3: two rails, drawn; the lines are parallel. */
const rails = page(
  "rails",
  (b) => {
    const w = wordsOn(b);
    const graph = plane(
      b,
      "graph",
      [general(1, 2, -4), general(2, 4, -12)],
      { xMin: -1, xMax: 8, yMin: -1, yMax: 5 },
      { showTables: true, showSolution: true, form: EquationForm.General },
    );
    b.standsFor(
      graph,
      "NCERT Fig 3.4: the rails x + 2y − 4 = 0 through (0, 2) and (4, 0), and 2x + 4y − 12 = 0 through (0, 3) and (6, 0): parallel lines",
    );
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "How many pairs $(x, y)$ satisfy both rail equations?",
        "कितने जोड़े $(x, y)$ दोनों पटरी-समीकरणों को संतुष्ट करते हैं?",
      ),
      options: [
        { id: "right", label: t("None: the lines never meet", "एक भी नहीं: रेखाएँ कभी नहीं मिलतीं") },
        {
          id: "many",
          label: t("Infinitely many", "अपरिमित रूप से अनेक"),
          feedback: t(
            "That's for lines lying on top of each other. These run side by side and never touch.",
            "वह एक-दूसरे पर पड़ी रेखाओं के लिए है। ये साथ-साथ चलती हैं और कभी नहीं छूतीं।",
          ),
        },
        {
          id: "one",
          label: t("Exactly one", "ठीक एक"),
          feedback: t(
            "A common solution would be a point on both lines. Parallel lines have no point in common.",
            "साझा हल दोनों रेखाओं पर एक बिंदु होता। समांतर रेखाओं में कोई साझा बिंदु नहीं होता।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Two equations, no meeting", "दो समीकरण, कोई मिलन नहीं")),
      w.body(
        t(
          "NCERT's Example 3: two rails of a railway track are represented by",
          "NCERT का उदाहरण 3: रेल की पटरी की दो रेलें इनसे दर्शाई जाती हैं",
        ),
      ),
      w.body(
        t(
          r`$$\begin{aligned} x + 2y - 4 &= 0 \quad (1) \\ 2x + 4y - 12 &= 0 \quad (2) \end{aligned}$$`,
          r`$$\begin{aligned} x + 2y - 4 &= 0 \quad (1) \\ 2x + 4y - 12 &= 0 \quad (2) \end{aligned}$$`,
        ),
      ),
      graph,
      w.body(
        t(
          "The lines are **parallel**. The left sides look alike, $2x + 4y$ is twice $x + 2y$, but the numbers on their own don't match: twice 4 would be 8, not 12. Same tilt, different place.",
          "रेखाएँ **समांतर** हैं। बाएँ पक्ष मिलते-जुलते हैं, $2x + 4y$ तो $x + 2y$ का दोगुना है, पर अकेली संख्याएँ मेल नहीं खातीं: 4 का दोगुना 8 होता, 12 नहीं। झुकाव वही, जगह अलग।",
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The three cases summed up: one, none, infinitely many solutions. */
const howMany = page(
  "how-many",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "A pair of linear equations has exactly two solutions. Is that possible?",
        "रैखिक समीकरणों के एक युग्म के ठीक दो हल हैं। क्या ऐसा हो सकता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "No: two different common points would make the lines the same line",
            "नहीं: दो अलग साझा बिंदु होते ही रेखाएँ एक ही रेखा बन जाएँगी",
          ),
        },
        {
          id: "yes",
          label: t("Yes, if the lines cross twice", "हाँ, अगर रेखाएँ दो बार कटें"),
          feedback: t(
            "Two straight lines can't cross twice. Through two points there is only one straight line.",
            "दो सीधी रेखाएँ दो बार नहीं कट सकतीं। दो बिंदुओं से होकर केवल एक सीधी रेखा जाती है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("One, none or infinitely many", "एक, कोई नहीं, या अपरिमित")),
      w.body(
        t(
          "A solution of the pair is a point on **both** lines. So the way the lines sit tells you how many solutions there are:",
          "युग्म का हल **दोनों** रेखाओं पर पड़ने वाला बिंदु है। इसलिए रेखाओं की स्थिति बताती है कि कितने हल हैं:",
        ),
      ),
      w.definition(
        t(
          "**How many solutions.** Intersecting lines: exactly **one** solution, the crossing point. Parallel lines: **no** solution. Coincident lines: **infinitely many** solutions, every point of the line.",
          "**कितने हल।** प्रतिच्छेदी रेखाएँ: ठीक **एक** हल, कटान-बिंदु। समांतर रेखाएँ: **कोई** हल नहीं। संपाती रेखाएँ: **अपरिमित रूप से अनेक** हल, रेखा का हर बिंदु।",
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

/** Back to the stationery stall and the railway beside the ground. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const rails = scene(
      b,
      "rails",
      LinearSceneKind.RailTracks,
      "the railway track beside the mela ground, two straight rails side by side with a train coming",
    );
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "Riya asks the shopkeeper for one more clue. Which one would let her find the price of one pencil?",
        "रिया दुकानदार से एक और सुराग माँगती है। किससे वह एक पेंसिल का दाम निकाल पाएगी?",
      ),
      options: [
        {
          id: "right",
          label: t("1 pencil and 1 eraser cost ₹4", "1 पेंसिल और 1 रबर ₹4 के"),
        },
        {
          id: "double",
          label: t("6 pencils and 9 erasers cost ₹27", "6 पेंसिल और 9 रबर ₹27 के"),
          feedback: t(
            "That's the first bill times 3: the same line again, still infinitely many answers.",
            "यह पहले बिल का तीन गुना है: फिर वही रेखा, फिर अपरिमित उत्तर।",
          ),
        },
        {
          id: "parallel",
          label: t("2 pencils and 3 erasers cost ₹12", "2 पेंसिल और 3 रबर ₹12 के"),
          feedback: t(
            "Same items, different total: a parallel line. That clue contradicts the first bill, so there'd be no answer at all.",
            "वही सामान, अलग जोड़: एक समांतर रेखा। यह सुराग पहले बिल को काटता है, तो कोई उत्तर ही नहीं होता।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const after = w.body(
      t(
        r`Riya had two bills but only **one** clue: her two lines were the same line. "1 pencil and 1 eraser for ₹4" is a genuinely new line that crosses the first, at pencil ₹3 and eraser ₹1. And the rails outside? They are parallel on purpose: if their equations ever had a common solution, the train would fall off. For the cash box, $x + y = 50$ and $10x + 15y = 600$ cross, so Riya's answer exists.`,
        r`रिया के पास दो बिल थे पर सुराग **एक** ही: उसकी दोनों रेखाएँ एक ही थीं। "1 पेंसिल और 1 रबर ₹4 के" सचमुच नई रेखा है जो पहली को काटती है, पेंसिल ₹3 और रबर ₹1 पर। और बाहर की पटरियाँ? वे जान-बूझकर समांतर हैं: अगर उनके समीकरणों का कभी कोई साझा हल होता, तो रेल गिर जाती। गल्ले के लिए $x + y = 50$ और $10x + 15y = 600$ कटती हैं, इसलिए रिया का उत्तर मौजूद है।`,
      ),
      "after",
      { isHidden: true },
    );
    b.when(ask.on(QuestionSignal.Correct), [theBoard.show(after), theBoard.pass()]);
    return column([
      w.title(t("Back at the mela", "वापस मेले में")),
      w.body(
        t(
          "Now Riya sees what went wrong with the bills, and what the trains on the track next door have to do with it.",
          "अब रिया समझती है कि बिलों में क्या गड़बड़ थी, और बगल की पटरी की रेलगाड़ियों का इससे क्या लेना-देना है।",
        ),
      ),
      rails,
      ask,
      after,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Exercise 3.1 Q2 and Q3 drawn; then the mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const ask1 = choiceQuestion(b, {
      name: "ask1",
      prompt: t(
        "2 kg of apples and 1 kg of grapes cost ₹160. A month later 4 kg of apples and 2 kg of grapes cost ₹300. How do the two lines sit?",
        "2 kg सेब और 1 kg अंगूर ₹160 के हैं। एक महीने बाद 4 kg सेब और 2 kg अंगूर ₹300 के। दोनों रेखाएँ कैसे हैं?",
      ),
      options: [
        { id: "right", label: t("Parallel", "समांतर") },
        {
          id: "same",
          label: t("Coincident", "संपाती"),
          feedback: t(
            "Twice the first bill would be ₹320, not ₹300. Same left side doubled, different right side: parallel.",
            "पहले बिल का दोगुना ₹320 होता, ₹300 नहीं। बायाँ पक्ष दोगुना, दायाँ अलग: समांतर।",
          ),
        },
        {
          id: "cross",
          label: t("Intersecting", "प्रतिच्छेदी"),
          feedback: t(
            "$4x + 2y$ is exactly twice $2x + y$, so the lines have the same tilt. They can't cross.",
            "$4x + 2y$ ठीक $2x + y$ का दोगुना है, तो रेखाओं का झुकाव एक है। वे नहीं कट सकतीं।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const ask2 = choiceQuestion(b, {
      name: "ask2",
      prompt: t(
        "3 bats and 6 balls cost ₹3900; 1 bat and 3 balls cost ₹1300. How many solutions does this pair have?",
        "3 बल्ले और 6 गेंदें ₹3900 की; 1 बल्ला और 3 गेंदें ₹1300 की। इस युग्म के कितने हल हैं?",
      ),
      options: [
        { id: "right", label: t("Exactly one", "ठीक एक") },
        {
          id: "none",
          label: t("None", "कोई नहीं"),
          feedback: t(
            "$3x + 6y$ is not a multiple of $x + 3y$ (3 times it would be $3x + 9y$), so the lines tilt differently and cross.",
            "$3x + 6y$ तो $x + 3y$ का कोई गुणज नहीं (उसका 3 गुना $3x + 9y$ होता), इसलिए रेखाओं का झुकाव अलग है और वे कटती हैं।",
          ),
        },
        {
          id: "many",
          label: t("Infinitely many", "अपरिमित रूप से अनेक"),
          feedback: t(
            "That needs one equation to be a multiple of the other. Is $3x + 6y = 3900$ a multiple of $x + 3y = 1300$?",
            "इसके लिए एक समीकरण दूसरे का गुणज होना चाहिए। क्या $3x + 6y = 3900$, $x + 3y = 1300$ का गुणज है?",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ Two lines intersect (one solution), are parallel (no solution) or coincide (infinitely many). ✓ Two bills that are multiples of each other are only one clue. ✓ The cash box lines cross, so the answer exists. ✗ Not found yet. Next: reading the answer off the graph.",
        "**मिशन लॉग।** ✓ दो रेखाएँ प्रतिच्छेद करती हैं (एक हल), समांतर हैं (कोई हल नहीं) या संपाती हैं (अपरिमित)। ✓ एक-दूसरे के गुणज वाले दो बिल केवल एक सुराग हैं। ✓ गल्ले की रेखाएँ कटती हैं, तो उत्तर मौजूद है। ✗ अभी मिला नहीं। आगे: ग्राफ़ से उत्तर पढ़ना।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(ask1.on(QuestionSignal.Correct), theBoard.show(ask2));
    b.when(ask2.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), ask1, ask2, log, space()]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [hook, threeWays, bills, rails, howMany, inLife, yourTurn];

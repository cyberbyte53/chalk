import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  AreaAction,
  QuadraticSceneKind,
  areaBuilderDef,
  rootsGraphDef,
} from "@chalk/prop-quadratics";
import { sceneOn } from "../kit";

const r = String.raw;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** The trip to the wholesale market: a question that doesn't look quadratic at all. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const ride = sceneOn(
    b,
    "ride",
    QuadraticSceneKind.MarketRide,
    "Riya cycling towards the wholesale market with a box tied on the carrier; a milestone shows the distance",
  );
  return column([
    w.title(t("The trip to the market", "बाज़ार की यात्रा")),
    ride,
    w.body(
      t(
        r`Riya cycles 24 km to the wholesale market for the stall's supplies. Coming back with heavy boxes, she rides 2 km/h slower and takes 1 hour longer. Mom asks, "How fast do you usually ride?" There's no $x^2$ anywhere in that sentence. Yet the answer comes from a quadratic equation, in disguise. This stop is about finding it.`,
        r`रिया स्टॉल का सामान लेने 24 km साइकिल चलाकर थोक बाज़ार जाती है। भारी डिब्बों के साथ लौटते हुए वह 2 km/h धीमी चलती है और 1 घंटा ज़्यादा लगता है। मम्मी पूछती हैं, "तुम आम तौर पर कितनी तेज़ चलाती हो?" उस वाक्य में कहीं $x^2$ नहीं है। फिर भी उत्तर एक छिपे द्विघात समीकरण से आता है। यह पड़ाव उसे ढूँढने के बारे में है।`,
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Example 14: x in a denominator. Multiply through, and say what x can't be. */
const disguise = page(
  "disguise",
  (b) => {
    const w = wordsOn(b);
    const g = b.prop(rootsGraphDef, "graph", {
      a: 1,
      b: -3,
      c: 1,
      level: 0,
      levelLabel: "",
      variable: "x",
      yName: "y",
      window: { xMin: -1, xMax: 4, yMin: -2, yMax: 4 },
      canSet: [],
      canSetLevel: false,
      step: 1,
      showEquation: true,
      showDiscriminant: false,
      showRoots: true,
    });
    b.standsFor(g, "the graph of y = x² − 3x + 1 crossing the x-axis at (3 − √5)/2 and (3 + √5)/2");
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        r`Multiply $\dfrac{1}{x} - \dfrac{1}{x - 2} = 3$ by $x(x - 2)$. Which quadratic do you get?`,
        r`$\dfrac{1}{x} - \dfrac{1}{x - 2} = 3$ को $x(x - 2)$ से गुणा करो। कौन-सा द्विघात मिलता है?`,
      ),
      options: [
        { id: "right", label: t(r`$3x^2 - 6x + 2 = 0$`, r`$3x^2 - 6x + 2 = 0$`) },
        {
          id: "forgot",
          label: t(r`$3x^2 - 6x - 2 = 0$`, r`$3x^2 - 6x - 2 = 0$`),
          feedback: t(
            r`The left side becomes $(x - 2) - x = -2$, and the right $3x(x - 2) = 3x^2 - 6x$. So $-2 = 3x^2 - 6x$: move the $-2$ across and it turns into $+2$.`,
            r`बायाँ पक्ष $(x - 2) - x = -2$ बनता है, और दायाँ $3x(x - 2) = 3x^2 - 6x$। तो $-2 = 3x^2 - 6x$: $-2$ को उस पार ले जाओ तो वह $+2$ बन जाता है।`,
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Equations in disguise", "छिपे हुए समीकरण")),
      w.body(
        t(
          r`NCERT's Example 14: $$x + \frac{1}{x} = 3$$ It has $x$ in a denominator, so it isn't a quadratic equation yet. Multiply every term by $x$: $$x^2 + 1 = 3x$$ $$x^2 - 3x + 1 = 0$$ Now the formula gives $$x = \frac{3 \pm \sqrt{5}}{2}$$`,
          r`NCERT का उदाहरण 14: $$x + \frac{1}{x} = 3$$ इसमें हर में $x$ है, इसलिए यह अभी द्विघात समीकरण नहीं है। हर पद को $x$ से गुणा करो: $$x^2 + 1 = 3x$$ $$x^2 - 3x + 1 = 0$$ अब सूत्र देता है $$x = \frac{3 \pm \sqrt{5}}{2}$$`,
        ),
      ),
      w.definition(
        t(
          r`**Clearing denominators.** When $x$ appears in a denominator, multiply every term by all the denominators to get a quadratic. First write down the values $x$ **can't** take (those that make a denominator 0, like $x \neq 0$ here), and throw out any root that equals one of them.`,
          r`**हर हटाना।** जब $x$ किसी हर में हो, तो द्विघात पाने के लिए हर पद को सभी हरों से गुणा करो। पहले लिख लो कि $x$ कौन-से मान **नहीं** ले सकता (जो किसी हर को 0 कर दें, जैसे यहाँ $x \neq 0$), और जो मूल उनमें से किसी के बराबर हो उसे हटा दो।`,
        ),
      ),
      g,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The method for word problems, with Example 12 (the park). */
const method = page("method", (b) => {
  const w = wordsOn(b);
  const park = b.prop(areaBuilderDef, "park", {
    x: 4,
    m: 1,
    n: 3,
    target: 28,
    step: 1,
    xMax: 10,
    unit: "m",
    canMove: true,
    showEquation: false,
  });
  b.studentOnly(park.action(AreaAction.Nudge));
  b.standsFor(
    park,
    "a rectangular park with breadth x and length x + 3; at x = 4 its area is 28 m²",
  );
  return column([
    w.title(t("Words into an equation", "शब्दों से समीकरण")),
    w.definition(
      t(
        "**Solving a word problem.** (1) Name the unknown x, and say what it means and its unit. (2) Write every other quantity in terms of x. (3) Write the equation the words describe. (4) Bring it to standard form and solve. (5) Check each root against the situation: a length, speed or age can't be negative, and a count must be a whole number.",
        "**शाब्दिक प्रश्न हल करना।** (1) अज्ञात को x नाम दो, और बताओ उसका अर्थ और इकाई क्या है। (2) बाक़ी हर राशि x में लिखो। (3) शब्द जो समीकरण बताते हैं, वह लिखो। (4) उसे मानक रूप में लाकर हल करो। (5) हर मूल को स्थिति से जाँचो: लंबाई, चाल या आयु ऋणात्मक नहीं हो सकती, और गिनती पूर्ण संख्या होनी चाहिए।",
      ),
    ),
    w.body(
      t(
        r`NCERT's Example 12. A rectangular park's breadth is 3 m less than its length, and its area is 4 m² more than a triangular park with base equal to that breadth and altitude 12 m. (1) Let the breadth be $x$ m. (2) Length $x + 3$; triangle's area $\tfrac{1}{2} \times x \times 12 = 6x$. (3) $$x(x + 3) = 6x + 4$$ (4) $$x^2 - 3x - 4 = 0$$ so $x = 4$ or $x = -1$. (5) A breadth can't be $-1$, so the park is 4 m by 7 m: area 28 m², which is 24 + 4.`,
        r`NCERT का उदाहरण 12। एक आयताकार पार्क की चौड़ाई उसकी लंबाई से 3 m कम है, और उसका क्षेत्रफल उस त्रिभुजाकार पार्क से 4 m² ज़्यादा है जिसका आधार वही चौड़ाई और शीर्षलंब 12 m है। (1) चौड़ाई $x$ m लो। (2) लंबाई $x + 3$; त्रिभुज का क्षेत्रफल $\tfrac{1}{2} \times x \times 12 = 6x$। (3) $$x(x + 3) = 6x + 4$$ (4) $$x^2 - 3x - 4 = 0$$ तो $x = 4$ या $x = -1$। (5) चौड़ाई $-1$ नहीं हो सकती, तो पार्क 4 m × 7 m है: क्षेत्रफल 28 m², जो 24 + 4 है।`,
      ),
    ),
    park,
    space(),
  ]);
});

/** Example 15: the motor boat, with speeds and times. */
const boat = page(
  "boat",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        r`$x^2 + 48x - 324 = 0$ gives $x = 6$ or $x = -54$. What is the speed of the stream?`,
        r`$x^2 + 48x - 324 = 0$ से $x = 6$ या $x = -54$ मिलता है। धारा की चाल क्या है?`,
      ),
      options: [
        { id: "right", label: t("6 km/h", "6 km/h") },
        {
          id: "neg",
          label: t("54 km/h", "54 km/h"),
          feedback: t(
            "The root is −54, and a speed can't be negative; besides, a stream faster than the boat's 18 km/h would carry it backwards.",
            "मूल −54 है, और चाल ऋणात्मक नहीं हो सकती; और नाव की 18 km/h से तेज़ धारा तो उसे पीछे बहा ले जाती।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Speed, distance and time", "चाल, दूरी और समय")),
      w.body(
        t(
          r`For journeys, use $$\text{time} = \frac{\text{distance}}{\text{speed}}$$ NCERT's Example 15: a boat goes 18 km/h in still water, and takes 1 hour more to go 24 km upstream than to come back. Let the stream's speed be $x$ km/h. Upstream the boat's speed is $18 - x$, downstream $18 + x$. So $$\frac{24}{18 - x} - \frac{24}{18 + x} = 1$$ Multiply by $(18 - x)(18 + x)$: $$24(18 + x) - 24(18 - x) = 324 - x^2$$ $$x^2 + 48x - 324 = 0$$`,
          r`यात्राओं के लिए यह लो: $$\text{समय} = \frac{\text{दूरी}}{\text{चाल}}$$ NCERT का उदाहरण 15: एक नाव स्थिर पानी में 18 km/h चलती है, और 24 km धारा के विरुद्ध जाने में लौटने से 1 घंटा ज़्यादा लेती है। धारा की चाल $x$ km/h लो। धारा के विरुद्ध नाव की चाल $18 - x$ है, धारा के साथ $18 + x$। तो $$\frac{24}{18 - x} - \frac{24}{18 + x} = 1$$ $(18 - x)(18 + x)$ से गुणा करो: $$24(18 + x) - 24(18 - x) = 324 - x^2$$ $$x^2 + 48x - 324 = 0$$`,
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

/** Riya's ride: 24 km each way, 2 km/h slower back, 1 hour longer. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const ride = sceneOn(b, "ride", QuadraticSceneKind.MarketRide, "Riya cycling to the market");
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        r`$v^2 - 2v - 48 = 0$. How fast does Riya usually ride?`,
        r`$v^2 - 2v - 48 = 0$। रिया आम तौर पर कितनी तेज़ चलाती है?`,
      ),
      options: [
        { id: "right", label: t("8 km/h", "8 km/h") },
        {
          id: "six",
          label: t("6 km/h", "6 km/h"),
          feedback: t(
            r`$(v - 8)(v + 6) = 0$ gives 8 or −6, and a speed can't be negative. 6 km/h is her slower speed coming back, $8 - 2$.`,
            r`$(v - 8)(v + 6) = 0$ से 8 या −6 मिलता है, और चाल ऋणात्मक नहीं हो सकती। 6 km/h तो लौटते समय की धीमी चाल है, $8 - 2$।`,
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const check = w.body(
      t(
        r`Check: going, $24 \div 8 = 3$ hours; coming back, $24 \div 6 = 4$ hours. One hour longer, as Riya said.`,
        r`जाँच: जाते समय $24 \div 8 = 3$ घंटे; लौटते समय $24 \div 6 = 4$ घंटे। एक घंटा ज़्यादा, जैसा रिया ने कहा।`,
      ),
      "check",
      { isHidden: true },
    );
    b.when(ask.on(QuestionSignal.Correct), [theBoard.show(check), theBoard.pass()]);
    return column([
      w.title(t("Riya's ride", "रिया की सवारी")),
      ride,
      w.body(
        t(
          r`Let her usual speed be $v$ km/h. Going takes $\frac{24}{v}$ hours; coming back at $v - 2$ takes $\frac{24}{v - 2}$, which is 1 hour more: $$\frac{24}{v - 2} - \frac{24}{v} = 1, \quad v \neq 0, 2$$ Multiply by $v(v - 2)$: $$24v - 24(v - 2) = v(v - 2)$$ $$48 = v^2 - 2v$$ $$v^2 - 2v - 48 = 0$$`,
          r`उसकी आम चाल $v$ km/h लो। जाने में $\frac{24}{v}$ घंटे लगते हैं; $v - 2$ पर लौटने में $\frac{24}{v - 2}$, जो 1 घंटा ज़्यादा है: $$\frac{24}{v - 2} - \frac{24}{v} = 1, \quad v \neq 0, 2$$ $v(v - 2)$ से गुणा करो: $$24v - 24(v - 2) = v(v - 2)$$ $$48 = v^2 - 2v$$ $$v^2 - 2v - 48 = 0$$`,
        ),
      ),
      ask,
      check,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Exercise 4.3 Q5 worked, Q8 to do. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        r`A train travels 360 km at a steady speed $v$. Had it gone 5 km/h faster, it would have taken 1 hour less. This gives $v^2 + 5v - 1800 = 0$. What is $v$?`,
        r`एक ट्रेन एकसमान चाल $v$ से 360 km चलती है। अगर वह 5 km/h तेज़ होती, तो 1 घंटा कम लगता। इससे $v^2 + 5v - 1800 = 0$ मिलता है। $v$ क्या है?`,
      ),
      options: [
        { id: "right", label: t("40 km/h", "40 km/h") },
        {
          id: "fortyfive",
          label: t("45 km/h", "45 km/h"),
          feedback: t(
            r`$(v - 40)(v + 45) = 0$, so $v = 40$ or $v = -45$. The roots are 40 and −45. −45 is negative, so it's out; 45 is the *faster* speed, 40 + 5.`,
            r`$(v - 40)(v + 45) = 0$, तो $v = 40$ या $v = -45$। मूल 40 और −45 हैं। −45 ऋणात्मक है, तो वह बाहर; 45 *तेज़* वाली चाल है, 40 + 5।`,
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        r`**Mission log.** ✓ Riya's usual speed is 8 km/h, found from an equation in disguise. ✓ We can turn words into a quadratic and throw out the roots that don't fit. ✗ Kabir's rocket: will it even reach the heights he's promising? Next stop: telling, before solving, whether an answer exists.`,
        r`**मिशन लॉग।** ✓ रिया की आम चाल 8 km/h है, एक छिपे समीकरण से मिली। ✓ हम शब्दों को द्विघात में बदल सकते हैं और मेल न खाने वाले मूल हटा सकते हैं। ✗ कबीर का रॉकेट: क्या वह उन ऊँचाइयों तक पहुँचेगा भी जिनका वह वादा कर रहा है? अगला पड़ाव: हल करने से पहले बताना कि उत्तर है या नहीं।`,
      ),
      "log",
      { isHidden: true },
    );
    b.when(ask.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([
      w.title(t("Your turn", "अब तुम्हारी बारी")),
      w.body(
        t(
          r`**Worked: Shefali's marks.** Her Maths and English marks add to 30. With 2 more in Maths and 3 fewer in English, their product would be 210. Let Maths be $x$; English is $30 - x$. $$(x + 2)(27 - x) = 210$$ $$x^2 - 25x + 156 = 0$$ $$(x - 12)(x - 13) = 0$$ So Maths 12 and English 18, or Maths 13 and English 17. Both fit.`,
          r`**हल किया हुआ: शेफाली के अंक।** उसके गणित और अंग्रेज़ी के अंकों का योग 30 है। गणित में 2 ज़्यादा और अंग्रेज़ी में 3 कम होते, तो गुणनफल 210 होता। गणित $x$ लो; अंग्रेज़ी $30 - x$। $$(x + 2)(27 - x) = 210$$ $$x^2 - 25x + 156 = 0$$ $$(x - 12)(x - 13) = 0$$ तो गणित 12 और अंग्रेज़ी 18, या गणित 13 और अंग्रेज़ी 17। दोनों ठीक बैठते हैं।`,
        ),
      ),
      ask,
      log,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [hook, disguise, method, boat, inLife, yourTurn];

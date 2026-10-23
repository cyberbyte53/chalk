import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, goalQuestion, wordsOn } from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  SPECIAL_WORKING,
  SpecialAction,
  SpecialDerived,
  SpecialMode,
  TrigSceneKind,
  specialAnglesDef,
} from "@chalk/prop-trigonometry";
import { sceneOn } from "../kit";

const r = String.raw;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** The clinometer shows 30°, 45°, 60°: Riya wants exact ratios for them. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const clino = sceneOn(
    b,
    "clino",
    TrigSceneKind.Clinometer,
    "Grandpa's clinometer held up to the eye, the thread hanging across the degree marks",
  );
  return column([
    w.title(t("A card for the clinometer", "क्लाइनोमीटर के लिए एक कार्ड")),
    clino,
    w.body(
      t(
        "Riya can now get every ratio of an angle from one of them. But on the hill she won't have a triangle to measure: she'll have the clinometer, and it will show an angle, like 30°, 45° or 60°. So she wants a small card taped to the clinometer with the exact sin, cos and tan of those angles.",
        "रिया अब किसी कोण के एक अनुपात से उसके सारे अनुपात निकाल सकती है। पर पहाड़ी पर उसके पास नापने को कोई त्रिभुज नहीं होगा: उसके पास क्लाइनोमीटर होगा, और वह एक कोण दिखाएगा, जैसे 30°, 45° या 60°। इसलिए वह क्लाइनोमीटर पर चिपका एक छोटा कार्ड चाहती है जिस पर इन कोणों के सटीक sin, cos और tan हों।",
      ),
    ),
    w.body(
      t(
        'How do you find the exact sine of 30° without measuring anything? Grandpa: "Cut a square in half. Then cut a triangle with equal sides in half."',
        'बिना कुछ नापे 30° की सटीक साइन कैसे निकालोगे? दादाजी: "एक वर्ग को आधा काटो। फिर बराबर भुजाओं वाले त्रिभुज को आधा काटो।"',
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** 45° from half a square (Fig 8.14). */
const square = page(
  "square",
  (b) => {
    const w = wordsOn(b);
    const sp = b.prop(specialAnglesDef, "sp", {
      mode: SpecialMode.Square,
      step: 0,
      filled: [],
      rows: ["sin", "cos", "tan", "cosec", "sec", "cot"],
      showTable: true,
      canStep: true,
      canTurn: false,
    });
    b.studentOnly(sp.action(SpecialAction.Next));
    b.standsFor(
      sp,
      "a square cut along its diagonal into a right triangle ABC with BC = AB = a; the working shows AC = a√2 and the ratios of 45°, line by line, and the 45° column of the table fills",
    );
    const goal = goalQuestion(b, {
      about: sp,
      prompt: t(
        "Step through the working until the 45° column fills.",
        "हल को आगे बढ़ाओ, जब तक 45° का स्तंभ न भर जाए।",
      ),
      isMet: sp.field("step").eq(SPECIAL_WORKING[SpecialMode.Square].length),
      solve: SPECIAL_WORKING[SpecialMode.Square].map(() => sp.learner(SpecialAction.Next, {})),
    });
    return column([
      w.title(t("45°: half a square", "45°: आधा वर्ग")),
      w.body(
        t(
          "In ∆ ABC right-angled at B, let ∠A = 45°. The angles add up to 180°, so ∠C = 45° too. Equal angles face equal sides, so BC = AB. Call each a.",
          "∆ ABC में, जो B पर समकोण है, मान लो ∠A = 45°। कोणों का योग 180° है, इसलिए ∠C भी 45° है। बराबर कोणों के सामने बराबर भुजाएँ होती हैं, इसलिए BC = AB। दोनों को a कहो।",
        ),
      ),
      sp,
      goal,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** 30° and 60° from half an equilateral triangle (Fig 8.15). */
const equilateral = page(
  "equilateral",
  (b) => {
    const w = wordsOn(b);
    const sp = b.prop(specialAnglesDef, "sp", {
      mode: SpecialMode.Equilateral,
      step: 0,
      filled: [45],
      rows: ["sin", "cos", "tan", "cosec", "sec", "cot"],
      showTable: true,
      canStep: true,
      canTurn: false,
    });
    b.studentOnly(sp.action(SpecialAction.Next));
    b.standsFor(
      sp,
      "an equilateral triangle ABC of side 2a with the altitude AD; the working shows ∆ ABD ≅ ∆ ACD, BD = a, AD = a√3 and the ratios of 30° and 60°, and those columns of the table fill",
    );
    const goal = goalQuestion(b, {
      about: sp,
      prompt: t(
        "Step through the working until the 30° and 60° columns fill.",
        "हल को आगे बढ़ाओ, जब तक 30° और 60° के स्तंभ न भर जाएँ।",
      ),
      isMet: sp.field("step").eq(SPECIAL_WORKING[SpecialMode.Equilateral].length),
      solve: SPECIAL_WORKING[SpecialMode.Equilateral].map(() => sp.learner(SpecialAction.Next, {})),
    });
    return column([
      w.title(t("30° and 60°: half an equilateral triangle", "30° और 60°: आधा समबाहु त्रिभुज")),
      w.definition(
        t(
          "**Equilateral triangle.** All three sides are equal, so all three angles are equal: each is 60°.",
          "**समबाहु त्रिभुज।** तीनों भुजाएँ बराबर हैं, इसलिए तीनों कोण भी बराबर हैं: हर एक 60°।",
        ),
      ),
      w.body(
        t(
          "Take one with side 2a and draw the perpendicular AD from A to BC. Then ∆ ABD ≅ ∆ ACD (RHS: right angles at D, hypotenuses AB = AC, and AD common). So BD = DC = a, and AD cuts ∠A into two angles of 30°. In ∆ ABD the angles are 30°, 60° and 90°.",
          "भुजा 2a वाला एक ऐसा त्रिभुज लो और A से BC पर लंब AD खींचो। तब ∆ ABD ≅ ∆ ACD (RHS: D पर समकोण, कर्ण AB = AC, और AD उभयनिष्ठ)। इसलिए BD = DC = a, और AD कोण A को 30° के दो कोणों में बाँटता है। ∆ ABD में कोण 30°, 60° और 90° हैं।",
        ),
      ),
      sp,
      goal,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** 0° and 90° as limits (Figs 8.16–8.18); what is not defined. */
const limits = page(
  "limits",
  (b) => {
    const w = wordsOn(b);
    const sp = b.prop(specialAnglesDef, "sp", {
      mode: SpecialMode.Limits,
      step: 0,
      angle: 30,
      angleStep: 15,
      filled: [30, 45, 60],
      rows: ["sin", "cos", "tan"],
      showTable: true,
      canStep: false,
      canTurn: true,
    });
    b.studentOnly(sp.action(SpecialAction.Nudge));
    b.standsFor(
      sp,
      "a right triangle whose angle A the learner shrinks towards 0° or grows towards 90°, with sin A, cos A and tan A shown; reaching 0° or 90° fills that column of the table",
    );
    const goal = goalQuestion(b, {
      about: sp,
      prompt: t(
        "Shrink angle A all the way to 0°, then grow it all the way to 90°.",
        "कोण A को घटाकर 0° तक ले जाओ, फिर बढ़ाकर 90° तक।",
      ),
      isMet: sp.derived(SpecialDerived.IsDone).eq(true),
      solve: [
        sp.learner(SpecialAction.Nudge, { by: -1 }),
        sp.learner(SpecialAction.Nudge, { by: -1 }),
        ...Array.from({ length: 6 }, () => sp.learner(SpecialAction.Nudge, { by: 1 })),
      ],
    });
    const after = w.body(
      t(
        r`As A shrinks, BC shrinks to nothing and AC comes down onto AB: $$\sin 0^\circ = 0, \quad \cos 0^\circ = 1, \quad \tan 0^\circ = 0$$ As A grows, AB shrinks to nothing and AC lies along BC: $$\sin 90^\circ = 1, \quad \cos 90^\circ = 0$$ tan 90° would divide by AB = 0, so **tan 90° is not defined**. In the same way cot 0°, cosec 0° and sec 90° are not defined.`,
        r`A घटने पर BC शून्य तक सिकुड़ती है और AC, AB पर आ जाती है: $$\sin 0^\circ = 0, \quad \cos 0^\circ = 1, \quad \tan 0^\circ = 0$$ A बढ़ने पर AB शून्य तक सिकुड़ती है और AC, BC के साथ आ जाती है: $$\sin 90^\circ = 1, \quad \cos 90^\circ = 0$$ tan 90° में AB = 0 से भाग देना पड़ता, इसलिए **tan 90° परिभाषित नहीं है**। इसी तरह cot 0°, cosec 0° और sec 90° भी परिभाषित नहीं हैं।`,
      ),
      "after",
      { isHidden: true },
    );
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(after));
    return column([
      w.title(t("0° and 90°: squash the triangle", "0° और 90°: त्रिभुज को दबाओ")),
      w.body(
        t(
          "A right triangle can't really have an angle of 0° or 90° at A. But we can see where the ratios are heading as A gets closer and closer to them.",
          "किसी समकोण त्रिभुज के A पर सच में 0° या 90° का कोण नहीं हो सकता। पर A के उनके और क़रीब पहुँचने पर हम देख सकते हैं कि अनुपात किधर जा रहे हैं।",
        ),
      ),
      sp,
      goal,
      after,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Table 8.1 complete; sin rises, cos falls. */
const table = page(
  "table",
  (b) => {
    const w = wordsOn(b);
    const sp = b.prop(specialAnglesDef, "sp", {
      mode: SpecialMode.Square,
      step: 0,
      filled: [0, 30, 45, 60, 90],
      rows: ["sin", "cos", "tan", "cosec", "sec", "cot"],
      showTable: true,
      canStep: false,
      canTurn: false,
    });
    b.standsFor(sp, "NCERT Table 8.1, complete: all six ratios of 0°, 30°, 45°, 60° and 90°");
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "As A goes from 0° to 90°, what does cos A do?",
        "जब A, 0° से 90° तक जाता है, तो cos A क्या करता है?",
      ),
      options: [
        { id: "right", label: t("It falls from 1 to 0", "यह 1 से घटकर 0 हो जाता है") },
        {
          id: "rise",
          label: t("It rises from 0 to 1", "यह 0 से बढ़कर 1 हो जाता है"),
          feedback: t(
            "That's sin A. Read the cos row: 1, √3/2, 1/√2, 1/2, 0.",
            "वह sin A है। cos की पंक्ति पढ़ो: 1, √3/2, 1/√2, 1/2, 0।",
          ),
        },
        {
          id: "flat",
          label: t("It stays at 1/√2 throughout", "यह पूरे समय 1/√2 पर रहता है"),
          feedback: t(
            "Only at 45° is cos A equal to 1/√2. Elsewhere the row changes.",
            "केवल 45° पर cos A, 1/√2 के बराबर है। बाक़ी जगह पंक्ति बदलती है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Table 8.1, complete", "सारणी 8.1, पूरी")),
      sp,
      w.body(
        t(
          "Read across: as A grows from 0° to 90°, sin A grows from 0 to 1 and cos A falls from 1 to 0. tan A grows from 0 and has no value at 90°.",
          "पंक्ति के साथ पढ़ो: जब A, 0° से 90° तक बढ़ता है, sin A, 0 से 1 तक बढ़ता है और cos A, 1 से 0 तक घटता है। tan A, 0 से बढ़ता है और 90° पर उसका कोई मान नहीं होता।",
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

/** The ratio card on the clinometer: string 100 m at 30° means a 50 m high kite. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const card = sceneOn(
      b,
      "card",
      TrigSceneKind.RatioCard,
      "Riya's ratio card taped to the clinometer, a small table of sin, cos and tan for 0°, 30°, 45°, 60° and 90°; Kabir reading it",
    );
    const kite = choiceQuestion(b, {
      name: "kite",
      prompt: t(
        "Kabir's string is 100 m and the clinometer shows it rising at 30° to the ground. How high is the kite?",
        "कबीर की डोर 100 m है और क्लाइनोमीटर दिखाता है कि वह ज़मीन से 30° पर उठ रही है। पतंग कितनी ऊँची है?",
      ),
      options: [
        { id: "right", label: t("50 m, as sin 30° = 1/2", "50 m, क्योंकि sin 30° = 1/2") },
        {
          id: "cos",
          label: t("about 87 m, as cos 30° = √3/2", "लगभग 87 m, क्योंकि cos 30° = √3/2"),
          feedback: t(
            "cos gives the side along the ground. The height is opposite the 30° angle, so use sin.",
            "cos ज़मीन के साथ वाली भुजा देता है। ऊँचाई 30° कोण के सम्मुख है, इसलिए sin लो।",
          ),
        },
        {
          id: "tan",
          label: t("about 58 m, as tan 30° = 1/√3", "लगभग 58 m, क्योंकि tan 30° = 1/√3"),
          feedback: t(
            "tan would need the ground distance, not the string. The string is the hypotenuse, so use sin.",
            "tan के लिए ज़मीनी दूरी चाहिए, डोर नहीं। डोर कर्ण है, इसलिए sin लो।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const done = w.body(
      t(
        r`$$\text{height} = 100 \times \sin 30^\circ = 100 \times \dfrac{1}{2} = 50 \text{ m}$$ The card works: an angle on the clinometer and one length give the height. **Stop 3 done.** Grandpa then asks a riddle: why do the sin row and the cos row of the card hold the same numbers, just backwards?`,
        r`$$\text{ऊँचाई} = 100 \times \sin 30^\circ = 100 \times \dfrac{1}{2} = 50 \text{ m}$$ कार्ड काम करता है: क्लाइनोमीटर पर एक कोण और एक लंबाई से ऊँचाई मिल जाती है। **पड़ाव 3 पूरा।** फिर दादाजी एक पहेली पूछते हैं: कार्ड की sin वाली पंक्ति और cos वाली पंक्ति में वही संख्याएँ उलटे क्रम में क्यों हैं?`,
      ),
      "done",
      { isHidden: true },
    );
    b.when(kite.on(QuestionSignal.Correct), [theBoard.show(done), theBoard.pass()]);
    return column([w.title(t("The ratio card", "अनुपात-कार्ड")), card, kite, done, space()]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Examples 6–8. */
const examples = page(
  "examples",
  (b) => {
    const w = wordsOn(b);
    const ex6 = choiceQuestion(b, {
      name: "ex6",
      prompt: t(
        "Example 6: in ∆ ABC right-angled at B, AB = 5 cm and ∠ACB = 30°. How long is AC?",
        "उदाहरण 6: ∆ ABC में, जो B पर समकोण है, AB = 5 cm और ∠ACB = 30°। AC कितना लंबा है?",
      ),
      options: [
        { id: "right", label: t("10 cm, from sin 30° = 5/AC", "10 cm, sin 30° = 5/AC से") },
        {
          id: "bc",
          label: t("5√3 cm, from tan 30° = 5/AC", "5√3 cm, tan 30° = 5/AC से"),
          feedback: t(
            "5√3 cm is BC, from tan 30° = AB/BC. AC is the hypotenuse, so use sin 30° = AB/AC.",
            "5√3 cm, BC है, tan 30° = AB/BC से। AC कर्ण है, इसलिए sin 30° = AB/AC लो।",
          ),
        },
        {
          id: "half",
          label: t("2.5 cm, from 5 × sin 30°", "2.5 cm, 5 × sin 30° से"),
          feedback: t(
            "The hypotenuse is the longest side, so it must be more than 5 cm. AC = 5 ÷ (1/2) = 10.",
            "कर्ण सबसे लंबी भुजा है, इसलिए 5 cm से ज़्यादा होना चाहिए। AC = 5 ÷ (1/2) = 10।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const ex7 = choiceQuestion(b, {
      name: "ex7",
      prompt: t(
        "Example 7: in ∆ PQR right-angled at Q, PQ = 3 cm and PR = 6 cm. What is ∠QPR?",
        "उदाहरण 7: ∆ PQR में, जो Q पर समकोण है, PQ = 3 cm और PR = 6 cm। ∠QPR क्या है?",
      ),
      options: [
        { id: "right", label: t("60°, as cos P = 3/6 = 1/2", "60°, क्योंकि cos P = 3/6 = 1/2") },
        {
          id: "thirty",
          label: t("30°, as sin P = 3/6 = 1/2", "30°, क्योंकि sin P = 3/6 = 1/2"),
          feedback: t(
            "PQ touches angle P, so it is adjacent, not opposite. 3/6 is cos P, and cos 60° = 1/2.",
            "PQ कोण P को छूती है, इसलिए वह संलग्न है, सम्मुख नहीं। 3/6, cos P है, और cos 60° = 1/2।",
          ),
        },
        {
          id: "fortyfive",
          label: t("45°, as the sides are 3 and 6", "45°, क्योंकि भुजाएँ 3 और 6 हैं"),
          feedback: t(
            "45° needs the two shorter sides equal. Here PQ/PR = 1/2 = cos 60°.",
            "45° के लिए दोनों छोटी भुजाएँ बराबर होनी चाहिए। यहाँ PQ/PR = 1/2 = cos 60°।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const ex8 = choiceQuestion(b, {
      name: "ex8",
      prompt: t(
        r`Example 8: $\sin(A-B) = \tfrac{1}{2}$ and $\cos(A+B) = \tfrac{1}{2}$, with A + B ≤ 90° and A > B. What are A and B?`,
        r`उदाहरण 8: $\sin(A-B) = \tfrac{1}{2}$ और $\cos(A+B) = \tfrac{1}{2}$, जहाँ A + B ≤ 90° और A > B। A और B क्या हैं?`,
      ),
      options: [
        { id: "right", label: t("A = 45°, B = 15°", "A = 45°, B = 15°") },
        {
          id: "swap",
          label: t("A = 15°, B = 45°", "A = 15°, B = 45°"),
          feedback: t(
            "A > B is given. A − B = 30° and A + B = 60°: adding, 2A = 90°.",
            "A > B दिया है। A − B = 30° और A + B = 60°: जोड़ने पर 2A = 90°।",
          ),
        },
        {
          id: "wrongsum",
          label: t("A = 60°, B = 30°", "A = 60°, B = 30°"),
          feedback: t(
            "Then A + B = 90° and cos 90° = 0, not 1/2. cos(A + B) = 1/2 means A + B = 60°.",
            "तब A + B = 90° और cos 90° = 0, 1/2 नहीं। cos(A + B) = 1/2 का अर्थ A + B = 60°।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Examples 6, 7 and 8", "उदाहरण 6, 7 और 8")),
      w.body(
        t(
          "Each one: find the right-triangle ratio that links what you know to what you want, then read its value from the table.",
          "हर एक में: वह अनुपात ढूँढो जो पता चीज़ को चाही गई चीज़ से जोड़े, फिर सारणी से उसका मान पढ़ो।",
        ),
      ),
      ex6,
      ex7,
      ex8,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Exercise 8.2 Q1, Q4; mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const q1 = choiceQuestion(b, {
      name: "q1",
      prompt: t(
        r`Exercise 8.2 Q1 (i): evaluate $\sin 60^\circ \cos 30^\circ + \sin 30^\circ \cos 60^\circ$.`,
        r`प्रश्नावली 8.2 प्र1 (i): $\sin 60^\circ \cos 30^\circ + \sin 30^\circ \cos 60^\circ$ का मान निकालो।`,
      ),
      options: [
        { id: "right", label: t(r`$1$`, r`$1$`) },
        {
          id: "half",
          label: t(r`$\dfrac{1}{2}$`, r`$\dfrac{1}{2}$`),
          feedback: t(
            r`$\dfrac{\sqrt3}{2} \cdot \dfrac{\sqrt3}{2} = \dfrac{3}{4}$ and $\dfrac12 \cdot \dfrac12 = \dfrac14$; together they make 1.`,
            r`$\dfrac{\sqrt3}{2} \cdot \dfrac{\sqrt3}{2} = \dfrac{3}{4}$ और $\dfrac12 \cdot \dfrac12 = \dfrac14$; दोनों मिलकर 1।`,
          ),
        },
        {
          id: "root",
          label: t(r`$\dfrac{\sqrt{3}}{2}$`, r`$\dfrac{\sqrt{3}}{2}$`),
          feedback: t(
            "Multiply each pair first: 3/4 + 1/4. Don't add the values before multiplying.",
            "पहले हर जोड़ी का गुणा करो: 3/4 + 1/4। गुणा से पहले मान मत जोड़ो।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const q4 = choiceQuestion(b, {
      name: "q4",
      prompt: t(
        "Exercise 8.2 Q4 (i): sin(A + B) = sin A + sin B. True or false?",
        "प्रश्नावली 8.2 प्र4 (i): sin(A + B) = sin A + sin B। सत्य या असत्य?",
      ),
      options: [
        { id: "right", label: t("False: try A = B = 45°", "असत्य: A = B = 45° लेकर देखो") },
        {
          id: "true",
          label: t("True: sin spreads over the plus sign", "सत्य: sin धन चिह्न पर बँट जाता है"),
          feedback: t(
            "sin is not a number to multiply out. A = B = 45°: sin 90° = 1, but 1/√2 + 1/√2 = √2.",
            "sin कोई संख्या नहीं जिसे गुणा करके फैलाया जाए। A = B = 45°: sin 90° = 1, पर 1/√2 + 1/√2 = √2।",
          ),
        },
        {
          id: "small",
          label: t("True, but only for small angles", "सत्य, पर केवल छोटे कोणों के लिए"),
          feedback: t(
            "Even A = B = 30° fails: sin 60° = √3/2, but 1/2 + 1/2 = 1.",
            "A = B = 30° पर भी नहीं चलता: sin 60° = √3/2, पर 1/2 + 1/2 = 1।",
          ),
        },
      ],
      answer: "right",
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ 45° from half a square; 30° and 60° from half an equilateral triangle. ✓ 0° and 90°, and what isn't defined. ✓ The ratio card is on the clinometer. Next stop: Grandpa's riddle about sin and cos.",
        "**मिशन लॉग।** ✓ आधे वर्ग से 45°; आधे समबाहु त्रिभुज से 30° और 60°। ✓ 0° और 90°, और क्या परिभाषित नहीं है। ✓ अनुपात-कार्ड क्लाइनोमीटर पर लगा है। अगला पड़ाव: sin और cos के बारे में दादाजी की पहेली।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(q4.on(QuestionSignal.Correct), theBoard.show(log));
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), q1, q4, log, space()]);
  },
  { passOn: PassOn.Rules },
);

export const overview = [hook, square, equilateral, limits, table, inLife, examples, yourTurn];

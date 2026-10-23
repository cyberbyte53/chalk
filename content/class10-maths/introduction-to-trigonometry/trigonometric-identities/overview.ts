import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import {
  choiceQuestion,
  goalQuestion,
  orderQuestion,
  wordsOn,
} from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import { DivideBy, IdentityAction, TrigSceneKind, unitIdentityDef } from "@chalk/prop-trigonometry";
import { sceneOn } from "../kit";

const r = String.raw;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** One rule ties all the ratios together: Pythagoras, divided. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const clino = sceneOn(
    b,
    "clino",
    TrigSceneKind.Clinometer,
    "Grandpa holding up the finished clinometer with Riya's card on it; the kids leaning in",
  );
  return column([
    w.title(t("One rule for every angle", "हर कोण के लिए एक नियम")),
    clino,
    w.body(
      t(
        'The card has its numbers and Riya knows the pairs. Grandpa has one last trick before the festival: "Every right triangle obeys Pythagoras. Divide that by one side, and you get a rule the ratios obey for **every** angle. Then you can check any value on your card in your head."',
        'कार्ड पर संख्याएँ हैं और रिया जोड़ियाँ जानती है। त्योहार से पहले दादाजी के पास एक आख़िरी तरकीब है: "हर समकोण त्रिभुज पाइथागोरस को मानता है। उसे किसी एक भुजा से भाग दो, और तुम्हें एक ऐसा नियम मिलता है जिसे अनुपात **हर** कोण के लिए मानते हैं। फिर तुम अपने कार्ड का कोई भी मान मन में जाँच सकती हो।"',
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** What an identity is; divide Pythagoras by AC²: cos²A + sin²A = 1. */
const first = page(
  "first",
  (b) => {
    const w = wordsOn(b);
    const unit = b.prop(unitIdentityDef, "unit", {
      angle: 35,
      divideBy: DivideBy.Hypotenuse,
      showSquares: true,
      canSetAngle: true,
      canDivide: false,
    });
    b.studentOnly(unit.action(IdentityAction.NudgeAngle));
    b.standsFor(
      unit,
      "a right triangle with hypotenuse 1, so its legs are cos A and sin A, with squares drawn on all three sides; the learner turns angle A and the two small squares always add up to the big one, 1",
    );
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "Turn angle A a few times. What stays the same?",
        "कोण A को कुछ बार घुमाओ। क्या वही रहता है?",
      ),
      options: [
        {
          id: "right",
          label: t(r`$\cos^2 A + \sin^2 A$, always 1`, r`$\cos^2 A + \sin^2 A$, हमेशा 1`),
        },
        {
          id: "sum",
          label: t(r`$\cos A + \sin A$, always 1`, r`$\cos A + \sin A$, हमेशा 1`),
          feedback: t(
            "At 45° that sum is 1/√2 + 1/√2 = √2, not 1. It's the squares that add to 1.",
            "45° पर यह योग 1/√2 + 1/√2 = √2 है, 1 नहीं। वर्गों का योग 1 होता है।",
          ),
        },
        {
          id: "each",
          label: t(r`$\sin A$ and $\cos A$ separately`, r`$\sin A$ और $\cos A$ अलग-अलग`),
          feedback: t(
            "Each one changes as A turns: one grows, the other shrinks. Only the sum of their squares is fixed.",
            "A घूमने पर हर एक बदलता है: एक बढ़ता है, दूसरा घटता है। केवल उनके वर्गों का योग तय रहता है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("The first identity", "पहली सर्वसमिका")),
      w.definition(
        t(
          "**Identity.** An equation is an **identity** if it is true for **all** values of the angle (or variable) for which both sides are defined. A trigonometric identity is one that uses trigonometric ratios.",
          "**सर्वसमिका।** कोई समीकरण **सर्वसमिका** है अगर वह कोण (या चर) के उन **सभी** मानों के लिए सत्य हो जिनके लिए दोनों पक्ष परिभाषित हैं। त्रिकोणमितीय सर्वसमिका वह है जिसमें त्रिकोणमितीय अनुपात हों।",
        ),
      ),
      w.body(
        t(
          r`In ∆ ABC right-angled at B: $$AB^2 + BC^2 = AC^2$$ Divide every term by AC²: $$\left(\dfrac{AB}{AC}\right)^2 + \left(\dfrac{BC}{AC}\right)^2 = 1$$ $$\cos^2 A + \sin^2 A = 1$$ This holds for every A with 0° ≤ A ≤ 90°.`,
          r`∆ ABC में, जो B पर समकोण है: $$AB^2 + BC^2 = AC^2$$ हर पद को AC² से भाग दो: $$\left(\dfrac{AB}{AC}\right)^2 + \left(\dfrac{BC}{AC}\right)^2 = 1$$ $$\cos^2 A + \sin^2 A = 1$$ यह 0° ≤ A ≤ 90° वाले हर A के लिए सही है।`,
        ),
      ),
      unit,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Divide by AB² and by BC² instead: the other two identities, and where they hold. */
const others = page(
  "others",
  (b) => {
    const w = wordsOn(b);
    const unit = b.prop(unitIdentityDef, "unit", {
      angle: 35,
      divideBy: DivideBy.Hypotenuse,
      showSquares: true,
      canSetAngle: false,
      canDivide: true,
    });
    b.studentOnly(unit.action(IdentityAction.Divide));
    b.standsFor(
      unit,
      "the same right triangle and its squares, with a switch to divide every side by the hypotenuse, the adjacent side or the opposite side, showing the identity each division gives",
    );
    const goal = goalQuestion(b, {
      about: unit,
      prompt: t(
        "Divide by the opposite side instead. Which identity appears?",
        "इसके बजाय सम्मुख भुजा से भाग दो। कौन-सी सर्वसमिका आती है?",
      ),
      isMet: unit.field("divideBy").eq(DivideBy.Opposite),
      solve: [unit.learner(IdentityAction.Divide, { by: DivideBy.Opposite })],
    });
    return column([
      w.title(t("Two more, by dividing differently", "दो और, अलग भाग देकर")),
      w.body(
        t(
          r`Divide $AB^2 + BC^2 = AC^2$ by AB² instead: $$1 + \tan^2 A = \sec^2 A, \quad 0^\circ \le A < 90^\circ$$ (tan A and sec A are not defined at 90°). Divide by BC²: $$\cot^2 A + 1 = \operatorname{cosec}^2 A, \quad 0^\circ < A \le 90^\circ$$ (cot A and cosec A are not defined at 0°).`,
          r`$AB^2 + BC^2 = AC^2$ को इसके बजाय AB² से भाग दो: $$1 + \tan^2 A = \sec^2 A, \quad 0^\circ \le A < 90^\circ$$ (90° पर tan A और sec A परिभाषित नहीं)। BC² से भाग दो: $$\cot^2 A + 1 = \operatorname{cosec}^2 A, \quad 0^\circ < A \le 90^\circ$$ (0° पर cot A और cosec A परिभाषित नहीं)।`,
        ),
      ),
      unit,
      goal,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Example 12: every ratio through one (cot, sec, tan in terms of sin). */
const express = page(
  "express",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        r`Using $\sin^2 A + \cos^2 A = 1$, what is $\cos A$ in terms of $\sin A$?`,
        r`$\sin^2 A + \cos^2 A = 1$ से, $\sin A$ के रूप में $\cos A$ क्या है?`,
      ),
      options: [
        { id: "right", label: t(r`$\sqrt{1 - \sin^2 A}$`, r`$\sqrt{1 - \sin^2 A}$`) },
        {
          id: "plain",
          label: t(r`$1 - \sin A$`, r`$1 - \sin A$`),
          feedback: t(
            "The identity uses squares: cos²A = 1 − sin²A, then take the square root.",
            "सर्वसमिका में वर्ग हैं: cos²A = 1 − sin²A, फिर वर्गमूल लो।",
          ),
        },
        {
          id: "sq",
          label: t(r`$1 - \sin^2 A$`, r`$1 - \sin^2 A$`),
          feedback: t(
            "That's cos²A. Take the square root to get cos A itself.",
            "यह cos²A है। cos A पाने के लिए वर्गमूल लो।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Every ratio through one", "एक के ज़रिए हर अनुपात")),
      w.body(
        t(
          r`The identities let you write every ratio in terms of any one of them. **Example 12**, through sin A: $$\cot A = \dfrac{\cos A}{\sin A} = \dfrac{\sqrt{1 - \sin^2 A}}{\sin A}$$ $$\sec A = \dfrac{1}{\cos A} = \dfrac{1}{\sqrt{1 - \sin^2 A}}$$ $$\tan A = \dfrac{\sin A}{\sqrt{1 - \sin^2 A}}$$`,
          r`सर्वसमिकाओं से हर अनुपात को किसी एक अनुपात के रूप में लिखा जा सकता है। **उदाहरण 12**, sin A के ज़रिए: $$\cot A = \dfrac{\cos A}{\sin A} = \dfrac{\sqrt{1 - \sin^2 A}}{\sin A}$$ $$\sec A = \dfrac{1}{\cos A} = \dfrac{1}{\sqrt{1 - \sin^2 A}}$$ $$\tan A = \dfrac{\sin A}{\sqrt{1 - \sin^2 A}}$$`,
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Example 13 as a proof, one step per line; put the steps in order. */
const proof = page(
  "proof",
  (b) => {
    const w = wordsOn(b);
    const order = orderQuestion(b, {
      name: "order",
      prompt: t(
        "Example 13: prove that sec A (1 − sin A)(sec A + tan A) = 1. Put the steps in order.",
        "उदाहरण 13: सिद्ध करो कि sec A (1 − sin A)(sec A + tan A) = 1। कदमों को क्रम में रखो।",
      ),
      steps: [
        {
          id: "write",
          label: t(
            r`LHS $= \dfrac{1}{\cos A}(1 - \sin A)\left(\dfrac{1}{\cos A} + \dfrac{\sin A}{\cos A}\right)$`,
            r`LHS $= \dfrac{1}{\cos A}(1 - \sin A)\left(\dfrac{1}{\cos A} + \dfrac{\sin A}{\cos A}\right)$`,
          ),
        },
        {
          id: "combine",
          label: t(
            r`$= \dfrac{(1 - \sin A)(1 + \sin A)}{\cos^2 A}$`,
            r`$= \dfrac{(1 - \sin A)(1 + \sin A)}{\cos^2 A}$`,
          ),
          hint: t(
            "First write sec and tan through sin and cos.",
            "पहले sec और tan को sin और cos में लिखो।",
          ),
        },
        {
          id: "square",
          label: t(r`$= \dfrac{1 - \sin^2 A}{\cos^2 A}$`, r`$= \dfrac{1 - \sin^2 A}{\cos^2 A}$`),
          hint: t(
            "Multiply out (1 − sin A)(1 + sin A) only after combining the fractions.",
            "भिन्नों को मिलाने के बाद ही (1 − sin A)(1 + sin A) का गुणा करो।",
          ),
        },
        {
          id: "identity",
          label: t(
            r`$= \dfrac{\cos^2 A}{\cos^2 A} = 1 =$ RHS`,
            r`$= \dfrac{\cos^2 A}{\cos^2 A} = 1 =$ RHS`,
          ),
          hint: t(
            "Use 1 − sin²A = cos²A once the top is 1 − sin²A.",
            "ऊपर 1 − sin²A आने के बाद 1 − sin²A = cos²A लगाओ।",
          ),
        },
      ],
      shown: ["square", "identity", "write", "combine"],
      answers: [["write", "combine", "square", "identity"]],
    });
    return column([
      w.title(t("A proof, step by step", "एक उपपत्ति, कदम-दर-कदम")),
      w.body(
        t(
          "To prove an identity, start from one side (usually the messier one), turn everything into sin and cos, and simplify until you reach the other side.",
          "सर्वसमिका सिद्ध करने के लिए एक पक्ष से शुरू करो (आमतौर पर उलझे हुए से), सब कुछ sin और cos में बदलो, और दूसरे पक्ष तक पहुँचने तक सरल करो।",
        ),
      ),
      order,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Examples 14 and 15. */
const examples = page(
  "examples",
  (b) => {
    const w = wordsOn(b);
    const ex14 = choiceQuestion(b, {
      name: "ex14",
      prompt: t(
        r`Example 14: prove $\dfrac{\cot A - \cos A}{\cot A + \cos A} = \dfrac{\operatorname{cosec} A - 1}{\operatorname{cosec} A + 1}$. After writing cot A as cos A / sin A, what is the next move?`,
        r`उदाहरण 14: सिद्ध करो $\dfrac{\cot A - \cos A}{\cot A + \cos A} = \dfrac{\operatorname{cosec} A - 1}{\operatorname{cosec} A + 1}$। cot A को cos A / sin A लिखने के बाद अगला कदम क्या है?`,
      ),
      options: [
        {
          id: "right",
          label: t(
            "Take cos A out of top and bottom, then cancel it",
            "ऊपर और नीचे से cos A बाहर निकालो, फिर काट दो",
          ),
        },
        {
          id: "square",
          label: t(
            "Square both sides so sin² + cos² appears",
            "दोनों पक्षों का वर्ग करो ताकि sin² + cos² आए",
          ),
          feedback: t(
            "No squares are needed here. cos A is a common factor of every term, so it cancels.",
            "यहाँ वर्ग की ज़रूरत नहीं। cos A हर पद का उभयनिष्ठ गुणनखंड है, इसलिए कट जाता है।",
          ),
        },
        {
          id: "cross",
          label: t(
            "Cross-multiply the two sides of the equation",
            "समीकरण के दोनों पक्षों का वज्र-गुणन करो",
          ),
          feedback: t(
            "We are proving the equation, so we can't treat it as true yet. Work on one side only.",
            "हम समीकरण सिद्ध कर रहे हैं, इसलिए उसे अभी सत्य नहीं मान सकते। केवल एक पक्ष पर काम करो।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Examples 14 and 15", "उदाहरण 14 और 15")),
      w.body(
        t(
          r`**Example 14.** $$\text{LHS} = \dfrac{\tfrac{\cos A}{\sin A} - \cos A}{\tfrac{\cos A}{\sin A} + \cos A}$$ $$= \dfrac{\cos A\left(\tfrac{1}{\sin A} - 1\right)}{\cos A\left(\tfrac{1}{\sin A} + 1\right)}$$ $$= \dfrac{\operatorname{cosec} A - 1}{\operatorname{cosec} A + 1}$$`,
          r`**उदाहरण 14।** $$\text{LHS} = \dfrac{\tfrac{\cos A}{\sin A} - \cos A}{\tfrac{\cos A}{\sin A} + \cos A}$$ $$= \dfrac{\cos A\left(\tfrac{1}{\sin A} - 1\right)}{\cos A\left(\tfrac{1}{\sin A} + 1\right)}$$ $$= \dfrac{\operatorname{cosec} A - 1}{\operatorname{cosec} A + 1}$$`,
        ),
      ),
      w.body(
        t(
          r`**Example 15.** Prove $$\dfrac{\sin\theta - \cos\theta + 1}{\sin\theta + \cos\theta - 1} = \dfrac{1}{\sec\theta - \tan\theta}$$ The right side has sec and tan, so divide top and bottom by cos θ: $$\text{LHS} = \dfrac{\tan\theta - 1 + \sec\theta}{\tan\theta + 1 - \sec\theta} = \dfrac{(\tan\theta + \sec\theta) - 1}{(\tan\theta - \sec\theta) + 1}$$ Multiply top and bottom by $(\tan\theta - \sec\theta)$. The top becomes $$(\tan^2\theta - \sec^2\theta) - (\tan\theta - \sec\theta) = -1 - \tan\theta + \sec\theta$$ using $\sec^2\theta - \tan^2\theta = 1$. So $$\text{LHS} = \dfrac{-(\tan\theta - \sec\theta + 1)}{(\tan\theta - \sec\theta + 1)(\tan\theta - \sec\theta)}$$ Cancel the bracket: $$= \dfrac{-1}{\tan\theta - \sec\theta} = \dfrac{1}{\sec\theta - \tan\theta} = \text{RHS}$$ The idea is the same as before: turn it into one or two ratios, then use an identity.`,
          r`**उदाहरण 15।** सिद्ध करो $$\dfrac{\sin\theta - \cos\theta + 1}{\sin\theta + \cos\theta - 1} = \dfrac{1}{\sec\theta - \tan\theta}$$ दाएँ पक्ष में sec और tan हैं, तो ऊपर और नीचे को cos θ से भाग दो: $$\text{LHS} = \dfrac{\tan\theta - 1 + \sec\theta}{\tan\theta + 1 - \sec\theta} = \dfrac{(\tan\theta + \sec\theta) - 1}{(\tan\theta - \sec\theta) + 1}$$ ऊपर और नीचे को $(\tan\theta - \sec\theta)$ से गुणा करो। ऊपर बनता है $$(\tan^2\theta - \sec^2\theta) - (\tan\theta - \sec\theta) = -1 - \tan\theta + \sec\theta$$ क्योंकि $\sec^2\theta - \tan^2\theta = 1$। तो $$\text{LHS} = \dfrac{-(\tan\theta - \sec\theta + 1)}{(\tan\theta - \sec\theta + 1)(\tan\theta - \sec\theta)}$$ कोष्ठक काटो: $$= \dfrac{-1}{\tan\theta - \sec\theta} = \dfrac{1}{\sec\theta - \tan\theta} = \text{RHS}$$ विचार पहले जैसा ही है: इसे एक-दो अनुपातों में बदलो, फिर कोई सर्वसमिका लगाओ।`,
        ),
      ),
      ex14,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** Checking the card with the identity. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const card = sceneOn(
      b,
      "card",
      TrigSceneKind.RatioCard,
      "Riya's finished ratio card on the clinometer; Kabir checking one column",
    );
    const check = choiceQuestion(b, {
      name: "check",
      prompt: t(
        "Kabir copies the card and writes sin 60° = 1/2 and cos 60° = 1/2. Does the identity catch the mistake?",
        "कबीर कार्ड की नक़ल करता है और sin 60° = 1/2 और cos 60° = 1/2 लिखता है। क्या सर्वसमिका ग़लती पकड़ लेती है?",
      ),
      options: [
        {
          id: "right",
          label: t("Yes: the squares add to 1/2, not 1", "हाँ: वर्गों का योग 1/2 है, 1 नहीं"),
        },
        {
          id: "no",
          label: t("No: 1/2 + 1/2 = 1, so it passes", "नहीं: 1/2 + 1/2 = 1, तो यह सही है"),
          feedback: t(
            "The identity adds the squares: 1/4 + 1/4 = 1/2. sin 60° should be √3/2, giving 3/4 + 1/4 = 1.",
            "सर्वसमिका वर्गों को जोड़ती है: 1/4 + 1/4 = 1/2। sin 60° = √3/2 होना चाहिए, जिससे 3/4 + 1/4 = 1।",
          ),
        },
        {
          id: "only45",
          label: t("No: it only works at 45°", "नहीं: यह केवल 45° पर चलती है"),
          feedback: t(
            "An identity holds for every angle. That's exactly why it can check any column.",
            "सर्वसमिका हर कोण के लिए सही होती है। इसी कारण यह किसी भी स्तंभ को जाँच सकती है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const done = w.body(
      t(
        "Every column of the card passes: sin² + cos² = 1 at 0°, 30°, 45°, 60° and 90°. **Stop 5 done**: the card is complete and checked, and the clinometer is ready for the hill.",
        "कार्ड का हर स्तंभ सही निकलता है: 0°, 30°, 45°, 60° और 90° पर sin² + cos² = 1। **पड़ाव 5 पूरा**: कार्ड पूरा है और जाँचा हुआ है, और क्लाइनोमीटर पहाड़ी के लिए तैयार है।",
      ),
      "done",
      { isHidden: true },
    );
    b.when(check.on(QuestionSignal.Correct), [theBoard.show(done), theBoard.pass()]);
    return column([w.title(t("Checking the card", "कार्ड की जाँच")), card, check, done, space()]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Exercise 8.4 Q3 and Q4; the Ch 8 finale and hand-over to Ch 9. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const q4i = choiceQuestion(b, {
      name: "q4i",
      prompt: t(
        r`Exercise 8.4 Q4 (i): $9\sec^2 A - 9\tan^2 A$ is equal to?`,
        r`प्रश्नावली 8.4 प्र4 (i): $9\sec^2 A - 9\tan^2 A$ किसके बराबर है?`,
      ),
      options: [
        { id: "right", label: t(r`$9$`, r`$9$`) },
        {
          id: "one",
          label: t(r`$1$`, r`$1$`),
          feedback: t(
            "sec²A − tan²A = 1, but there is a 9 in front: 9 × 1 = 9.",
            "sec²A − tan²A = 1, पर आगे 9 है: 9 × 1 = 9।",
          ),
        },
        {
          id: "zero",
          label: t(r`$0$`, r`$0$`),
          feedback: t(
            "sec²A and tan²A are not equal: they differ by exactly 1, from 1 + tan²A = sec²A.",
            "sec²A और tan²A बराबर नहीं: 1 + tan²A = sec²A से वे ठीक 1 से अलग हैं।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const q3 = choiceQuestion(b, {
      name: "q3",
      prompt: t(
        r`Exercise 8.4 Q3 (i): evaluate $\dfrac{\sin^2 63^\circ + \sin^2 27^\circ}{\cos^2 17^\circ + \cos^2 73^\circ}$.`,
        r`प्रश्नावली 8.4 प्र3 (i): $\dfrac{\sin^2 63^\circ + \sin^2 27^\circ}{\cos^2 17^\circ + \cos^2 73^\circ}$ का मान निकालो।`,
      ),
      options: [
        { id: "right", label: t(r`$1$`, r`$1$`) },
        {
          id: "two",
          label: t(r`$2$`, r`$2$`),
          feedback: t(
            "sin 27° = cos 63°, so the top is sin²63° + cos²63° = 1. The bottom is 1 too.",
            "sin 27° = cos 63°, तो ऊपर sin²63° + cos²63° = 1। नीचे भी 1 है।",
          ),
        },
        {
          id: "ratio",
          label: t(r`$\dfrac{63}{17}$`, r`$\dfrac{63}{17}$`),
          feedback: t(
            "Ratios don't divide like the angles. Use the complementary pairs, then sin² + cos² = 1.",
            "अनुपात कोणों की तरह भाग नहीं होते। पूरक जोड़ियाँ लगाओ, फिर sin² + cos² = 1।",
          ),
        },
      ],
      answer: "right",
    });
    const log = w.definition(
      t(
        "**Mission log: the tool is built.** ✓ (1) The six ratios, fixed by the angle. ✓ (2) All of them from one. ✓ (3) 0°, 30°, 45°, 60°, 90° on the card. ✓ (4) Complementary angles. ✓ (5) Identities to check it all. Next chapter: Makar Sankranti on the hill, and Riya points the clinometer at the fort's tower.",
        "**मिशन लॉग: औज़ार तैयार।** ✓ (1) छह अनुपात, कोण से तय। ✓ (2) एक से सारे। ✓ (3) कार्ड पर 0°, 30°, 45°, 60°, 90°। ✓ (4) पूरक कोण। ✓ (5) सब जाँचने के लिए सर्वसमिकाएँ। अगला अध्याय: पहाड़ी पर मकर संक्रांति, और रिया क्लाइनोमीटर क़िले की मीनार की ओर करती है।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(q3.on(QuestionSignal.Correct), theBoard.show(log));
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), q4i, q3, log, space()]);
  },
  { passOn: PassOn.Rules },
);

export const overview = [hook, first, others, express, proof, examples, inLife, yourTurn];

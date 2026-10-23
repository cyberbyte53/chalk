import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, goalQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  Ratio,
  RatioReference,
  RatiosAction,
  TrigSceneKind,
  trigRatiosDef,
} from "@chalk/prop-trigonometry";
import { sceneOn } from "../kit";

const r = String.raw;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** Grandpa's riddle: why is sin 60° = cos 30°? */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const card = sceneOn(
    b,
    "card",
    TrigSceneKind.RatioCard,
    "Riya's ratio card on the clinometer, with rows for sin, cos and tan of 0°, 30°, 45°, 60° and 90°",
  );
  return column([
    w.title(t("Grandpa's riddle", "दादाजी की पहेली")),
    card,
    w.body(
      t(
        'Grandpa looks at Riya\'s ratio card and smiles. "Read me the sin row." 0, 1/2, 1/√2, √3/2, 1. "Now the cos row." 1, √3/2, 1/√2, 1/2, 0. The same numbers, backwards. "So sin 60° is cos 30°. Is that luck?"',
        'दादाजी रिया का अनुपात-कार्ड देखकर मुस्कुराते हैं। "sin वाली पंक्ति पढ़ो।" 0, 1/2, 1/√2, √3/2, 1। "अब cos वाली।" 1, √3/2, 1/√2, 1/2, 0। वही संख्याएँ, उलटे क्रम में। "तो sin 60°, cos 30° के बराबर है। क्या यह संयोग है?"',
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Complementary angles; in a right triangle C = 90° − A; swap the reference. */
const pair = page(
  "pair",
  (b) => {
    const w = wordsOn(b);
    const tri = b.prop(trigRatiosDef, "tri", {
      angle: 30,
      size: 8,
      shown: [Ratio.Sin, Ratio.Cos, Ratio.Tan],
      showSides: true,
      showValues: true,
      showPairs: true,
      canSetAngle: false,
      canScale: false,
      canSwap: true,
    });
    b.studentOnly(tri.action(RatiosAction.Swap));
    b.standsFor(
      tri,
      "the right triangle with angle A = 30°, its sides labelled and sin, cos, tan listed; a button swaps the reference to the other acute angle C = 90° − A, and each ratio is shown beside the ratio of the other angle it equals",
    );
    const goal = goalQuestion(b, {
      about: tri,
      prompt: t(
        "Swap to angle C. Which side was BC for A, and which is it for C?",
        "कोण C पर बदलो। BC, A के लिए कौन-सी भुजा थी, और C के लिए कौन-सी है?",
      ),
      isMet: tri.field("reference").eq(RatioReference.C),
      solve: [tri.learner(RatiosAction.Swap, {})],
    });
    const after = w.body(
      t(
        r`BC was opposite A and is adjacent to C. So what is sin for one angle is cos for the other: $$\sin A = \dfrac{BC}{AC} = \cos C = \cos(90^\circ - A)$$`,
        r`BC, A के सम्मुख थी और C के संलग्न है। इसलिए जो एक कोण की sin है, वह दूसरे की cos है: $$\sin A = \dfrac{BC}{AC} = \cos C = \cos(90^\circ - A)$$`,
      ),
      "after",
      { isHidden: true },
    );
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(after));
    return column([
      w.title(t("Two angles that share a triangle", "एक त्रिभुज बाँटने वाले दो कोण")),
      w.definition(
        t(
          "**Complementary angles.** Two angles are complementary if they add up to 90°.",
          "**पूरक कोण।** दो कोण पूरक होते हैं अगर उनका योग 90° हो।",
        ),
      ),
      w.body(
        t(
          "In ∆ ABC right-angled at B, ∠A + ∠C = 180° − 90° = 90°. So the two acute angles of a right triangle are always complementary: ∠C = 90° − ∠A.",
          "∆ ABC में, जो B पर समकोण है, ∠A + ∠C = 180° − 90° = 90°। इसलिए समकोण त्रिभुज के दोनों न्यून कोण हमेशा पूरक होते हैं: ∠C = 90° − ∠A।",
        ),
      ),
      tri,
      goal,
      after,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The six relations, and the check at 0° and 90°. */
const six = page(
  "six",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t("Which of these is equal to sec 40°?", "इनमें से कौन sec 40° के बराबर है?"),
      options: [
        {
          id: "right",
          label: t(r`$\operatorname{cosec} 50^\circ$`, r`$\operatorname{cosec} 50^\circ$`),
        },
        {
          id: "cos",
          label: t(r`$\cos 50^\circ$`, r`$\cos 50^\circ$`),
          feedback: t(
            "Complementary pairs swap sec with cosec, not with cos. cos 50° equals sin 40°.",
            "पूरक जोड़ियाँ sec को cosec से बदलती हैं, cos से नहीं। cos 50°, sin 40° के बराबर है।",
          ),
        },
        {
          id: "sec",
          label: t(r`$\sec 50^\circ$`, r`$\sec 50^\circ$`),
          feedback: t(
            "The angle changes to 90° − 40° = 50°, and the ratio changes too: sec becomes cosec.",
            "कोण 90° − 40° = 50° हो जाता है, और अनुपात भी बदलता है: sec, cosec बन जाता है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Six pairs", "छह जोड़ियाँ")),
      w.definition(
        t(
          r`**Ratios of complementary angles.** For an acute angle A: $$\sin(90^\circ - A) = \cos A$$ $$\cos(90^\circ - A) = \sin A$$ $$\tan(90^\circ - A) = \cot A$$ $$\cot(90^\circ - A) = \tan A$$ $$\sec(90^\circ - A) = \operatorname{cosec} A$$ $$\operatorname{cosec}(90^\circ - A) = \sec A$$`,
          r`**पूरक कोणों के अनुपात।** किसी न्यून कोण A के लिए: $$\sin(90^\circ - A) = \cos A$$ $$\cos(90^\circ - A) = \sin A$$ $$\tan(90^\circ - A) = \cot A$$ $$\cot(90^\circ - A) = \tan A$$ $$\sec(90^\circ - A) = \operatorname{cosec} A$$ $$\operatorname{cosec}(90^\circ - A) = \sec A$$`,
        ),
      ),
      w.body(
        t(
          "They hold at the ends too: sin 0° = cos 90° = 0 and cos 0° = sin 90° = 1. (tan 90° and cot 0° are not defined, so that pair is left out at the ends.)",
          "ये छोरों पर भी सही हैं: sin 0° = cos 90° = 0 और cos 0° = sin 90° = 1। (tan 90° और cot 0° परिभाषित नहीं हैं, इसलिए छोरों पर वह जोड़ी छोड़ दी जाती है।)",
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

/** The riddle answered; why the card's rows run backwards. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const riddle = choiceQuestion(b, {
      name: "riddle",
      prompt: t(
        "So why is sin 60° = cos 30° on Riya's card?",
        "तो रिया के कार्ड पर sin 60° = cos 30° क्यों है?",
      ),
      options: [
        {
          id: "right",
          label: t("60° and 30° share a right triangle", "60° और 30° एक ही समकोण त्रिभुज में हैं"),
        },
        {
          id: "luck",
          label: t("Those two values just happen to match", "वे दो मान बस संयोग से मिल गए"),
          feedback: t(
            "It happens for every pair adding to 90°: sin 45° = cos 45°, sin 90° = cos 0°.",
            "यह 90° जोड़ने वाली हर जोड़ी में होता है: sin 45° = cos 45°, sin 90° = cos 0°।",
          ),
        },
        {
          id: "double",
          label: t("60° is twice 30°, so the sine doubles", "60°, 30° का दुगुना है, तो साइन दुगुनी"),
          feedback: t(
            "Ratios don't double with the angle: sin 60° = √3/2, not 2 × sin 30° = 1.",
            "कोण के साथ अनुपात दुगुने नहीं होते: sin 60° = √3/2, 2 × sin 30° = 1 नहीं।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const done = w.body(
      t(
        '60° and 30° are the two acute angles of one right triangle. The side opposite 60° is adjacent to 30°, so sin 60° and cos 30° are the same ratio. Read the card from the other end and the sin row becomes the cos row. **Stop 4 done.** Grandpa is pleased: "Now let\'s see what the three sides can tell you all at once."',
        '60° और 30° एक ही समकोण त्रिभुज के दो न्यून कोण हैं। 60° के सम्मुख भुजा 30° के संलग्न है, इसलिए sin 60° और cos 30° एक ही अनुपात हैं। कार्ड को दूसरे छोर से पढ़ो तो sin की पंक्ति cos की पंक्ति बन जाती है। **पड़ाव 4 पूरा।** दादाजी ख़ुश हैं: "अब देखते हैं कि तीनों भुजाएँ एक साथ क्या बता सकती हैं।"',
      ),
      "done",
      { isHidden: true },
    );
    b.when(riddle.on(QuestionSignal.Correct), [theBoard.show(done), theBoard.pass()]);
    return column([w.title(t("The riddle, solved", "पहेली हल")), riddle, done, space()]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Examples 9–11. */
const examples = page(
  "examples",
  (b) => {
    const w = wordsOn(b);
    const ex10 = choiceQuestion(b, {
      name: "ex10",
      prompt: t(
        r`Example 10: $\sin 3A = \cos(A - 26^\circ)$, where 3A is acute. Find A.`,
        r`उदाहरण 10: $\sin 3A = \cos(A - 26^\circ)$, जहाँ 3A न्यून है। A निकालो।`,
      ),
      options: [
        { id: "right", label: t(r`$29^\circ$`, r`$29^\circ$`) },
        {
          id: "equal",
          label: t(r`$-13^\circ$`, r`$-13^\circ$`),
          feedback: t(
            "Setting 3A = A − 26° treats sin and cos as the same ratio. Write sin 3A as cos(90° − 3A) first.",
            "3A = A − 26° रखना sin और cos को एक ही अनुपात मानना है। पहले sin 3A को cos(90° − 3A) लिखो।",
          ),
        },
        {
          id: "sum",
          label: t(r`$16^\circ$`, r`$16^\circ$`),
          feedback: t(
            "90° − 3A = A − 26° gives 4A = 116°, so A = 29°. Check the arithmetic.",
            "90° − 3A = A − 26° से 4A = 116°, तो A = 29°। गणना फिर से जाँचो।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const ex11 = choiceQuestion(b, {
      name: "ex11",
      prompt: t(
        r`Example 11: write $\cot 85^\circ + \cos 75^\circ$ using ratios of angles between 0° and 45°.`,
        r`उदाहरण 11: $\cot 85^\circ + \cos 75^\circ$ को 0° और 45° के बीच के कोणों के अनुपातों में लिखो।`,
      ),
      options: [
        {
          id: "right",
          label: t(r`$\tan 5^\circ + \sin 15^\circ$`, r`$\tan 5^\circ + \sin 15^\circ$`),
        },
        {
          id: "same",
          label: t(r`$\cot 5^\circ + \cos 15^\circ$`, r`$\cot 5^\circ + \cos 15^\circ$`),
          feedback: t(
            "Changing the angle to 90° − A also changes the ratio: cot becomes tan, cos becomes sin.",
            "कोण को 90° − A करने पर अनुपात भी बदलता है: cot, tan बनता है, cos, sin बनता है।",
          ),
        },
        {
          id: "swap",
          label: t(r`$\tan 15^\circ + \sin 5^\circ$`, r`$\tan 15^\circ + \sin 5^\circ$`),
          feedback: t(
            "90° − 85° = 5° goes with the cot term, and 90° − 75° = 15° with the cos term.",
            "90° − 85° = 5°, cot वाले पद के साथ जाता है, और 90° − 75° = 15°, cos वाले के साथ।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Examples 9, 10 and 11", "उदाहरण 9, 10 और 11")),
      w.body(
        t(
          r`**Example 9.** $$\dfrac{\tan 65^\circ}{\cot 25^\circ} = \dfrac{\cot(90^\circ - 65^\circ)}{\cot 25^\circ} = \dfrac{\cot 25^\circ}{\cot 25^\circ} = 1$$`,
          r`**उदाहरण 9।** $$\dfrac{\tan 65^\circ}{\cot 25^\circ} = \dfrac{\cot(90^\circ - 65^\circ)}{\cot 25^\circ} = \dfrac{\cot 25^\circ}{\cot 25^\circ} = 1$$`,
        ),
      ),
      w.body(
        t(
          r`**Example 10.** Write the sine as a cosine: $$\sin 3A = \cos(90^\circ - 3A)$$ $$\cos(90^\circ - 3A) = \cos(A - 26^\circ)$$ Both angles are acute, so they are equal.`,
          r`**उदाहरण 10।** साइन को कोसाइन लिखो: $$\sin 3A = \cos(90^\circ - 3A)$$ $$\cos(90^\circ - 3A) = \cos(A - 26^\circ)$$ दोनों कोण न्यून हैं, इसलिए बराबर हैं।`,
        ),
      ),
      ex10,
      ex11,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Exercise 8.3 Q3, Q4, Q6; mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const q3 = choiceQuestion(b, {
      name: "q3",
      prompt: t(
        r`Exercise 8.3 Q3: $\tan 2A = \cot(A - 18^\circ)$, where 2A is acute. Find A.`,
        r`प्रश्नावली 8.3 प्र3: $\tan 2A = \cot(A - 18^\circ)$, जहाँ 2A न्यून है। A निकालो।`,
      ),
      options: [
        { id: "right", label: t(r`$36^\circ$`, r`$36^\circ$`) },
        {
          id: "neg",
          label: t(r`$-18^\circ$`, r`$-18^\circ$`),
          feedback: t(
            "tan and cot are different ratios. Write tan 2A = cot(90° − 2A), then 90° − 2A = A − 18°.",
            "tan और cot अलग अनुपात हैं। tan 2A = cot(90° − 2A) लिखो, फिर 90° − 2A = A − 18°।",
          ),
        },
        {
          id: "slip",
          label: t(r`$24^\circ$`, r`$24^\circ$`),
          feedback: t(
            "90° − 2A = A − 18° gives 3A = 108°, so A = 36°.",
            "90° − 2A = A − 18° से 3A = 108°, तो A = 36°।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const q4 = choiceQuestion(b, {
      name: "q4",
      prompt: t(
        "Exercise 8.3 Q4: tan A = cot B, for acute angles A and B. What can you say?",
        "प्रश्नावली 8.3 प्र4: न्यून कोणों A और B के लिए tan A = cot B। क्या कह सकते हो?",
      ),
      options: [
        { id: "right", label: t("A + B = 90°", "A + B = 90°") },
        {
          id: "eq",
          label: t("A = B", "A = B"),
          feedback: t(
            "That would need tan A = tan B. cot B = tan(90° − B), so A = 90° − B.",
            "उसके लिए tan A = tan B चाहिए। cot B = tan(90° − B), इसलिए A = 90° − B।",
          ),
        },
        {
          id: "diff",
          label: t("A − B = 90°", "A − B = 90°"),
          feedback: t(
            "Both are acute, so their difference is less than 90°. A = 90° − B means they add to 90°.",
            "दोनों न्यून हैं, इसलिए अंतर 90° से कम है। A = 90° − B का अर्थ है योग 90°।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const q6 = choiceQuestion(b, {
      name: "q6",
      prompt: t(
        r`Exercise 8.3 Q6: A, B and C are the angles of ∆ ABC. What is $\sin\left(\tfrac{B+C}{2}\right)$ equal to?`,
        r`प्रश्नावली 8.3 प्र6: A, B और C, ∆ ABC के कोण हैं। $\sin\left(\tfrac{B+C}{2}\right)$ किसके बराबर है?`,
      ),
      options: [
        { id: "right", label: t(r`$\cos \dfrac{A}{2}$`, r`$\cos \dfrac{A}{2}$`) },
        {
          id: "sin",
          label: t(r`$\sin \dfrac{A}{2}$`, r`$\sin \dfrac{A}{2}$`),
          feedback: t(
            "(B + C)/2 = 90° − A/2, a complementary angle, so the sine turns into a cosine.",
            "(B + C)/2 = 90° − A/2, एक पूरक कोण है, इसलिए साइन कोसाइन बन जाती है।",
          ),
        },
        {
          id: "cosA",
          label: t(r`$\cos A$`, r`$\cos A$`),
          feedback: t(
            "B + C = 180° − A, so half of it is 90° − A/2. The angle is A/2, not A.",
            "B + C = 180° − A, तो उसका आधा 90° − A/2 है। कोण A/2 है, A नहीं।",
          ),
        },
      ],
      answer: "right",
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ The two acute angles of a right triangle are complementary. ✓ sin(90° − A) = cos A, and the other five pairs. ✓ The riddle is solved. Next stop: identities, and the card is complete.",
        "**मिशन लॉग।** ✓ समकोण त्रिभुज के दोनों न्यून कोण पूरक होते हैं। ✓ sin(90° − A) = cos A, और बाक़ी पाँच जोड़ियाँ। ✓ पहेली हल। अगला पड़ाव: सर्वसमिकाएँ, और कार्ड पूरा।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(q6.on(QuestionSignal.Correct), theBoard.show(log));
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), q3, q4, q6, log, space()]);
  },
  { passOn: PassOn.Rules },
);

export const overview = [hook, pair, six, inLife, examples, yourTurn];

import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, goalQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  GIVEN_STEPS,
  Ratio,
  RatiosAction,
  TrigSceneKind,
  trigRatiosDef,
} from "@chalk/prop-trigonometry";
import { figureOn, sceneOn } from "../kit";

const r = String.raw;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** The ladder in the fort courtyard: one ratio known, the height wanted. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const ladder = sceneOn(
    b,
    "ladder",
    TrigSceneKind.LadderCourtyard,
    "a ladder leaning against the old fort wall, making a right triangle with the wall and the ground; Riya measuring the ladder's foot from the wall with a tape, Kabir holding the ladder",
  );
  return column([
    w.title(t("One ratio is enough", "एक अनुपात काफ़ी है")),
    ladder,
    w.body(
      t(
        "Last time Riya learnt that the ratios of a right triangle depend only on its angle. In the fort courtyard, the caretaker's ladder leans against the wall. The ladder is 5 m long and its foot is 3 m from the wall, so for the angle A it makes with the ground, she already knows one ratio: adjacent ÷ hypotenuse = 3/5.",
        "पिछली बार रिया ने सीखा कि समकोण त्रिभुज के अनुपात केवल उसके कोण पर निर्भर करते हैं। क़िले के आँगन में चौकीदार की सीढ़ी दीवार से टिकी है। सीढ़ी 5 m लंबी है और उसका निचला सिरा दीवार से 3 m दूर है, तो ज़मीन के साथ बने कोण A का एक अनुपात उसे पहले से पता है: संलग्न ÷ कर्ण = 3/5।",
      ),
    ),
    w.body(
      t(
        "How high up the wall does the ladder reach? In other words: if you know just **one** ratio of an angle, can you find all the others?",
        "सीढ़ी दीवार पर कितनी ऊँचाई तक पहुँचती है? दूसरे शब्दों में: अगर किसी कोण का केवल **एक** अनुपात पता हो, तो क्या बाक़ी सब निकाले जा सकते हैं?",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** sin A = 1/3: sides k and 3k, Pythagoras for the third, then every ratio. */
const method = page(
  "method",
  (b) => {
    const w = wordsOn(b);
    const tri = b.prop(trigRatiosDef, "tri", {
      given: { ratio: Ratio.Sin, num: 1, den: 3 },
      shown: [Ratio.Sin, Ratio.Cos, Ratio.Tan, Ratio.Cosec, Ratio.Sec, Ratio.Cot],
      showSides: true,
      showValues: true,
      canSetAngle: false,
      canScale: false,
      canStep: true,
    });
    b.studentOnly(tri.action(RatiosAction.Next));
    b.standsFor(
      tri,
      "a right triangle fixed by sin A = 1/3: the sides written as k and 3k, then the third side from Pythagoras, then all six ratios, one line at a time",
    );
    const goal = goalQuestion(b, {
      about: tri,
      prompt: t(
        "Step through the working until all six ratios appear.",
        "हल को एक-एक कदम आगे बढ़ाओ, जब तक छहों अनुपात न दिख जाएँ।",
      ),
      isMet: tri.field("step").eq(GIVEN_STEPS),
      solve: Array.from({ length: GIVEN_STEPS }, () => tri.learner(RatiosAction.Next, {})),
    });
    const why = w.body(
      t(
        r`Why k? Only the ratio is known, not the sizes: BC could be 1 m and AC 3 m, or 2 m and 6 m. So write BC = k and AC = 3k, where k is any positive number. Then by Pythagoras: $$AB^2 = AC^2 - BC^2 = (3k)^2 - k^2 = 8k^2$$ $$AB = 2\sqrt{2}\,k$$ We take the positive root only, because AB is a length. The k cancels in every ratio, which is exactly why the size doesn't matter.`,
        r`k क्यों? केवल अनुपात पता है, माप नहीं: BC 1 m और AC 3 m हो सकते हैं, या 2 m और 6 m। इसलिए BC = k और AC = 3k लिखो, जहाँ k कोई भी धनात्मक संख्या है। फिर पाइथागोरस से: $$AB^2 = AC^2 - BC^2 = (3k)^2 - k^2 = 8k^2$$ $$AB = 2\sqrt{2}\,k$$ हम केवल धनात्मक मूल लेते हैं, क्योंकि AB एक लंबाई है। हर अनुपात में k कट जाता है, और यही कारण है कि माप से फ़र्क़ नहीं पड़ता।`,
      ),
      "why",
      { isHidden: true },
    );
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(why));
    return column([
      w.title(
        t(r`From $\sin A = \tfrac{1}{3}$ to every ratio`, r`$\sin A = \dfrac{1}{3}$ से हर अनुपात तक`),
      ),
      w.body(
        t(
          "sin A = opposite ÷ hypotenuse, so sin A = 1/3 says BC : AC = 1 : 3. Draw any right triangle with that, find its third side, and read off the rest.",
          "sin A = सम्मुख ÷ कर्ण, तो sin A = 1/3 का अर्थ है BC : AC = 1 : 3। ऐसा कोई भी समकोण त्रिभुज बनाओ, उसकी तीसरी भुजा निकालो, और बाक़ी अनुपात पढ़ लो।",
        ),
      ),
      tri,
      goal,
      why,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** sin and cos never pass 1; sec and cosec never fall below 1. */
const bounds = page(
  "bounds",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "Which of these can never be a value of cos A, for an acute angle A?",
        "न्यून कोण A के लिए, इनमें से कौन-सा cos A का मान कभी नहीं हो सकता?",
      ),
      options: [
        { id: "right", label: t(r`$\dfrac{5}{4}$`, r`$\dfrac{5}{4}$`) },
        {
          id: "small",
          label: t(r`$\dfrac{1}{10}$`, r`$\dfrac{1}{10}$`),
          feedback: t(
            "A short adjacent side and a long hypotenuse give a small cos A. That's fine: cos A just has to stay below 1.",
            "छोटी संलग्न भुजा और लंबा कर्ण छोटा cos A देते हैं। यह ठीक है: cos A को बस 1 से कम रहना है।",
          ),
        },
        {
          id: "near",
          label: t(r`$\dfrac{9}{10}$`, r`$\dfrac{9}{10}$`),
          feedback: t(
            "A small angle A has a long adjacent side, close to the hypotenuse, so cos A close to 1 is possible.",
            "छोटे कोण A की संलग्न भुजा लंबी, कर्ण के क़रीब होती है, इसलिए 1 के क़रीब cos A संभव है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Never more than 1", "कभी 1 से ज़्यादा नहीं")),
      w.definition(
        t(
          r`**Bounds.** The hypotenuse is the longest side of a right triangle, and sin A and cos A both divide a shorter side by it. So for every acute angle A: $$0 < \sin A < 1, \quad 0 < \cos A < 1$$ Their reciprocals go the other way: $$\sec A > 1, \quad \operatorname{cosec} A > 1$$ tan A and cot A can be any positive number.`,
          r`**सीमाएँ।** समकोण त्रिभुज में कर्ण सबसे लंबी भुजा है, और sin A तथा cos A दोनों किसी छोटी भुजा को उससे भाग देते हैं। इसलिए हर न्यून कोण A के लिए: $$0 < \sin A < 1, \quad 0 < \cos A < 1$$ इनके व्युत्क्रम उलटी ओर जाते हैं: $$\sec A > 1, \quad \operatorname{cosec} A > 1$$ tan A और cot A कोई भी धनात्मक संख्या हो सकते हैं।`,
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Example 1: tan A = 4/3. */
const example1 = page(
  "example-1",
  (b) => {
    const w = wordsOn(b);
    const tri = b.prop(trigRatiosDef, "tri", {
      given: { ratio: Ratio.Tan, num: 4, den: 3 },
      shown: [Ratio.Sin, Ratio.Cos, Ratio.Tan, Ratio.Cosec, Ratio.Sec, Ratio.Cot],
      showSides: true,
      showValues: true,
      canSetAngle: false,
      canScale: false,
      canStep: true,
    });
    b.studentOnly(tri.action(RatiosAction.Next));
    b.standsFor(
      tri,
      "a right triangle fixed by tan A = 4/3: BC = 4k, AB = 3k, then AC = 5k, then the six ratios, one line at a time",
    );
    const sin = choiceQuestion(b, {
      name: "sin",
      prompt: t(
        r`Example 1: $\tan A = \tfrac{4}{3}$. What is $\sin A$?`,
        r`उदाहरण 1: $\tan A = \tfrac{4}{3}$। $\sin A$ क्या है?`,
      ),
      options: [
        { id: "right", label: t(r`$\dfrac{4}{5}$`, r`$\dfrac{4}{5}$`) },
        {
          id: "cos",
          label: t(r`$\dfrac{3}{5}$`, r`$\dfrac{3}{5}$`),
          feedback: t(
            "3/5 is adjacent ÷ hypotenuse, which is cos A. Sine uses the opposite side, 4k.",
            "3/5 संलग्न ÷ कर्ण है, यानी cos A। साइन में सम्मुख भुजा, 4k, आती है।",
          ),
        },
        {
          id: "flip",
          label: t(r`$\dfrac{5}{4}$`, r`$\dfrac{5}{4}$`),
          feedback: t(
            "5/4 is hypotenuse ÷ opposite, which is cosec A. It's more than 1, so it can't be a sine.",
            "5/4 कर्ण ÷ सम्मुख है, यानी cosec A। यह 1 से ज़्यादा है, इसलिए साइन नहीं हो सकता।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Example 1", "उदाहरण 1")),
      w.body(
        t(
          r`Given $\tan A = \tfrac{4}{3}$, find the other ratios. BC : AB = 4 : 3, so take BC = 4k and AB = 3k. Then: $$AC^2 = (4k)^2 + (3k)^2 = 25k^2, \quad AC = 5k$$ Use the steps below to see every ratio.`,
          r`दिया है $\tan A = \tfrac{4}{3}$, बाक़ी अनुपात निकालो। BC : AB = 4 : 3, तो BC = 4k और AB = 3k लो। फिर: $$AC^2 = (4k)^2 + (3k)^2 = 25k^2, \quad AC = 5k$$ हर अनुपात देखने के लिए नीचे के कदम चलाओ।`,
        ),
      ),
      tri,
      sin,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Example 2: sin B = sin Q gives B = Q. */
const example2 = page(
  "example-2",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "In the proof, why does AC/PR = AB/PQ = k lead to BC/QR = k?",
        "उपपत्ति में AC/PR = AB/PQ = k से BC/QR = k क्यों निकलता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Pythagoras writes BC and QR through AB, AC and PQ, PR",
            "पाइथागोरस BC और QR को AB, AC और PQ, PR से लिखता है",
          ),
        },
        {
          id: "angles",
          label: t(
            "Because the angles at B and Q are already equal",
            "क्योंकि B और Q के कोण पहले से बराबर हैं",
          ),
          feedback: t(
            "That's what we are proving, so we can't use it. The step comes from Pythagoras.",
            "यही तो सिद्ध करना है, इसलिए इसका उपयोग नहीं कर सकते। यह कदम पाइथागोरस से आता है।",
          ),
        },
        {
          id: "given",
          label: t(
            "Because it is given in the question as a fact",
            "क्योंकि यह प्रश्न में तथ्य के रूप में दिया है",
          ),
          feedback: t(
            "Only sin B = sin Q is given. BC/QR = k has to be worked out, using Pythagoras.",
            "केवल sin B = sin Q दिया है। BC/QR = k निकालना पड़ता है, पाइथागोरस से।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Example 2: equal sines, equal angles", "उदाहरण 2: बराबर साइन, बराबर कोण")),
      w.body(
        t(
          "∠B and ∠Q are acute angles of ∆ ABC and ∆ PQR, right-angled at C and R. If sin B = sin Q, prove that ∠B = ∠Q.",
          "∠B और ∠Q, ∆ ABC और ∆ PQR के न्यून कोण हैं, जो C और R पर समकोण हैं। अगर sin B = sin Q, तो सिद्ध करो कि ∠B = ∠Q।",
        ),
      ),
      figureOn(b, "figure", {
        points: [
          { name: "A", at: [0, 2.25] },
          { name: "B", at: [3, 0] },
          { name: "C", at: [0, 0] },
          { name: "P", at: [4.2, 1.58] },
          { name: "Q", at: [6.3, 0] },
          { name: "R", at: [4.2, 0] },
        ],
        items: [
          { kind: "seg", a: "B", b: "C" },
          { kind: "seg", a: "Q", b: "R" },
          { kind: "seg", a: "A", b: "C", tone: "accent" },
          { kind: "seg", a: "P", b: "R", tone: "accent" },
          { kind: "seg", a: "A", b: "B", tone: "result" },
          { kind: "seg", a: "P", b: "Q", tone: "result" },
          { kind: "right", at: "C", p: "A", q: "B" },
          { kind: "right", at: "R", p: "P", q: "Q" },
          { kind: "angle", at: "B", p: "A", q: "C" },
          { kind: "angle", at: "Q", p: "P", q: "R" },
        ],
        captions: [
          {
            en: "sin B = AC/AB and sin Q = PR/PQ: opposite side over hypotenuse.",
            hi: "sin B = AC/AB और sin Q = PR/PQ: सम्मुख भुजा बटा कर्ण।",
          },
        ],
        about:
          "Two right triangles side by side: ABC right-angled at C and PRQ right-angled at R, with angles B and Q marked; AC and PR (the sides opposite B and Q) and the hypotenuses AB and PQ are highlighted.",
        height: 180,
      }),
      w.body(
        t(
          r`**Proof.** sin B = sin Q gives: $$\dfrac{AC}{AB} = \dfrac{PR}{PQ}, \quad \text{so} \quad \dfrac{AC}{PR} = \dfrac{AB}{PQ} = k$$ By Pythagoras: $$BC = \sqrt{AB^2 - AC^2}$$ $$= \sqrt{k^2PQ^2 - k^2PR^2}$$ $$= k\sqrt{PQ^2 - PR^2} = k\,QR$$ So $$\dfrac{AC}{PR} = \dfrac{AB}{PQ} = \dfrac{BC}{QR}$$ Then ∆ ACB ~ ∆ PRQ (SSS), and so ∠B = ∠Q.`,
          r`**उपपत्ति।** sin B = sin Q से: $$\dfrac{AC}{AB} = \dfrac{PR}{PQ}, \quad \text{इसलिए} \quad \dfrac{AC}{PR} = \dfrac{AB}{PQ} = k$$ पाइथागोरस से: $$BC = \sqrt{AB^2 - AC^2}$$ $$= \sqrt{k^2PQ^2 - k^2PR^2}$$ $$= k\sqrt{PQ^2 - PR^2} = k\,QR$$ इसलिए $$\dfrac{AC}{PR} = \dfrac{AB}{PQ} = \dfrac{BC}{QR}$$ तब ∆ ACB ~ ∆ PRQ (SSS), और इसलिए ∠B = ∠Q।`,
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Examples 3–5: the 29-21-20 triangle, tan A = 1, and OQ − PQ = 1. */
const examples = page(
  "examples",
  (b) => {
    const w = wordsOn(b);
    const ex3 = choiceQuestion(b, {
      name: "ex3",
      prompt: t(
        r`Example 3: AB = 29, BC = 21 and ∠C = 90°, with ∠ABC = θ. What is $\cos^2\theta - \sin^2\theta$?`,
        r`उदाहरण 3: AB = 29, BC = 21 और ∠C = 90°, ∠ABC = θ। $\cos^2\theta - \sin^2\theta$ क्या है?`,
      ),
      options: [
        { id: "right", label: t(r`$\dfrac{41}{841}$`, r`$\dfrac{41}{841}$`) },
        {
          id: "one",
          label: t(r`$1$`, r`$1$`),
          feedback: t(
            "1 is cos²θ + sin²θ, the sum. The difference is (441 − 400)/841.",
            "1, cos²θ + sin²θ है, यानी योग। अंतर (441 − 400)/841 है।",
          ),
        },
        {
          id: "plain",
          label: t(r`$\dfrac{1}{29}$`, r`$\dfrac{1}{29}$`),
          feedback: t(
            "That's cos θ − sin θ = (21 − 20)/29, without squaring. Square each first.",
            "यह बिना वर्ग किए cos θ − sin θ = (21 − 20)/29 है। पहले हर एक का वर्ग करो।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const ex5 = choiceQuestion(b, {
      name: "ex5",
      prompt: t(
        "Example 5: in ∆ OPQ, right-angled at P, OP = 7 cm and OQ − PQ = 1 cm. What is sin Q?",
        "उदाहरण 5: ∆ OPQ में, जो P पर समकोण है, OP = 7 cm और OQ − PQ = 1 cm। sin Q क्या है?",
      ),
      options: [
        { id: "right", label: t(r`$\dfrac{7}{25}$`, r`$\dfrac{7}{25}$`) },
        {
          id: "cos",
          label: t(r`$\dfrac{24}{25}$`, r`$\dfrac{24}{25}$`),
          feedback: t(
            "24/25 is PQ/OQ, which is cos Q. The side opposite Q is OP = 7.",
            "24/25, PQ/OQ है, यानी cos Q। Q के सम्मुख भुजा OP = 7 है।",
          ),
        },
        {
          id: "tan",
          label: t(r`$\dfrac{7}{24}$`, r`$\dfrac{7}{24}$`),
          feedback: t(
            "7/24 is opposite ÷ adjacent, which is tan Q. Sine divides by the hypotenuse OQ = 25.",
            "7/24 सम्मुख ÷ संलग्न है, यानी tan Q। साइन कर्ण OQ = 25 से भाग देती है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Examples 3, 4 and 5", "उदाहरण 3, 4 और 5")),
      w.body(
        t(
          r`**Example 3.** First the third side: $$AC = \sqrt{29^2 - 21^2} = \sqrt{(29-21)(29+21)}$$ $$= \sqrt{400} = 20$$ So $\sin\theta = \tfrac{20}{29}$ and $\cos\theta = \tfrac{21}{29}$.`,
          r`**उदाहरण 3।** पहले तीसरी भुजा: $$AC = \sqrt{29^2 - 21^2} = \sqrt{(29-21)(29+21)}$$ $$= \sqrt{400} = 20$$ तो $\sin\theta = \tfrac{20}{29}$ और $\cos\theta = \tfrac{21}{29}$।`,
        ),
      ),
      ex3,
      w.body(
        t(
          r`**Example 4.** If $\tan A = 1$, then BC = AB, say both are k, and AC = √2 k. So: $$\sin A = \cos A = \dfrac{1}{\sqrt 2}$$ $$2\sin A\cos A = 2 \cdot \dfrac{1}{\sqrt 2} \cdot \dfrac{1}{\sqrt 2} = 1$$`,
          r`**उदाहरण 4।** अगर $\tan A = 1$, तो BC = AB, मान लो दोनों k हैं, और AC = √2 k। तो: $$\sin A = \cos A = \dfrac{1}{\sqrt 2}$$ $$2\sin A\cos A = 2 \cdot \dfrac{1}{\sqrt 2} \cdot \dfrac{1}{\sqrt 2} = 1$$`,
        ),
      ),
      w.body(
        t(
          r`**Example 5.** Let PQ = x, so OQ = x + 1. By Pythagoras: $$(x+1)^2 = x^2 + 7^2$$ $$2x + 1 = 49, \quad x = 24$$ So PQ = 24 cm and OQ = 25 cm.`,
          r`**उदाहरण 5।** मान लो PQ = x, तो OQ = x + 1। पाइथागोरस से: $$(x+1)^2 = x^2 + 7^2$$ $$2x + 1 = 49, \quad x = 24$$ तो PQ = 24 cm और OQ = 25 cm।`,
        ),
      ),
      ex5,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** The ladder: cos A = 3/5 gives sin A = 4/5, so the top is 4 m up. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const tri = b.prop(trigRatiosDef, "tri", {
      given: { ratio: Ratio.Cos, num: 3, den: 5 },
      shown: [Ratio.Sin, Ratio.Cos, Ratio.Tan],
      showSides: true,
      showValues: true,
      canSetAngle: false,
      canScale: false,
      canStep: true,
    });
    b.studentOnly(tri.action(RatiosAction.Next));
    b.standsFor(
      tri,
      "the ladder as a right triangle fixed by cos A = 3/5 (ground 3k, ladder 5k), stepping to the wall side 4k and the other ratios",
    );
    const high = choiceQuestion(b, {
      name: "high",
      prompt: t(
        "The ladder is 5 m and cos A = 3/5. How high up the wall does it reach?",
        "सीढ़ी 5 m की है और cos A = 3/5। यह दीवार पर कितनी ऊँचाई तक पहुँचती है?",
      ),
      options: [
        { id: "right", label: t("4 m, from sin A = 4/5", "4 m, sin A = 4/5 से") },
        {
          id: "three",
          label: t("3 m, from cos A = 3/5", "3 m, cos A = 3/5 से"),
          feedback: t(
            "3 m is along the ground, the side adjacent to A. The wall is the side opposite A.",
            "3 m ज़मीन के साथ है, A की संलग्न भुजा। दीवार A की सम्मुख भुजा है।",
          ),
        },
        {
          id: "five",
          label: t("5 m, the ladder's own length", "5 m, सीढ़ी की अपनी लंबाई"),
          feedback: t(
            "The ladder slopes, so it reaches less high than its length. It's the hypotenuse.",
            "सीढ़ी तिरछी है, इसलिए अपनी लंबाई से कम ऊँचाई तक पहुँचती है। यह कर्ण है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const done = w.body(
      t(
        r`Ground 3k, ladder 5k, so the wall side is $$\sqrt{(5k)^2 - (3k)^2} = 4k$$ and $$\sin A = \dfrac{4k}{5k} = \dfrac{4}{5}$$ $$\text{height} = 5 \times \dfrac{4}{5} = 4 \text{ m}$$ One ratio, and Riya has the whole triangle. **Stop 2 done.** Next she needs the ratios of the angles the clinometer will actually show.`,
        r`ज़मीन 3k, सीढ़ी 5k, तो दीवार वाली भुजा $$\sqrt{(5k)^2 - (3k)^2} = 4k$$ है और $$\sin A = \dfrac{4k}{5k} = \dfrac{4}{5}$$ $$\text{ऊँचाई} = 5 \times \dfrac{4}{5} = 4 \text{ m}$$ एक अनुपात, और रिया के पास पूरा त्रिभुज है। **पड़ाव 2 पूरा।** अब उसे उन कोणों के अनुपात चाहिए जो क्लाइनोमीटर सच में दिखाएगा।`,
      ),
      "done",
      { isHidden: true },
    );
    b.when(high.on(QuestionSignal.Correct), [theBoard.show(done), theBoard.pass()]);
    return column([w.title(t("Up the wall", "दीवार पर ऊपर")), tri, high, done, space()]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Exercise 8.1 Q3, Q4, Q6; mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const q3 = choiceQuestion(b, {
      name: "q3",
      prompt: t(
        r`Exercise 8.1 Q3: $\sin A = \tfrac{3}{4}$. What is $\cos A$?`,
        r`प्रश्नावली 8.1 प्र3: $\sin A = \tfrac{3}{4}$। $\cos A$ क्या है?`,
      ),
      options: [
        { id: "right", label: t(r`$\dfrac{\sqrt{7}}{4}$`, r`$\dfrac{\sqrt{7}}{4}$`) },
        {
          id: "quarter",
          label: t(r`$\dfrac{1}{4}$`, r`$\dfrac{1}{4}$`),
          feedback: t(
            "Sides don't subtract like that. AB² = 16k² − 9k² = 7k², so AB = √7 k.",
            "भुजाएँ ऐसे नहीं घटतीं। AB² = 16k² − 9k² = 7k², तो AB = √7 k।",
          ),
        },
        {
          id: "five",
          label: t(r`$\dfrac{4}{5}$`, r`$\dfrac{4}{5}$`),
          feedback: t(
            "Here 4 is the hypotenuse, not a leg: the third side is √(16 − 9) = √7, not 5.",
            "यहाँ 4 कर्ण है, पाद नहीं: तीसरी भुजा √(16 − 9) = √7 है, 5 नहीं।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const q4 = choiceQuestion(b, {
      name: "q4",
      prompt: t(
        r`Exercise 8.1 Q4: $15 \cot A = 8$. What is $\sec A$?`,
        r`प्रश्नावली 8.1 प्र4: $15 \cot A = 8$। $\sec A$ क्या है?`,
      ),
      options: [
        { id: "right", label: t(r`$\dfrac{17}{8}$`, r`$\dfrac{17}{8}$`) },
        {
          id: "sin",
          label: t(r`$\dfrac{15}{17}$`, r`$\dfrac{15}{17}$`),
          feedback: t(
            "15/17 is opposite ÷ hypotenuse, sin A. sec A is hypotenuse ÷ adjacent.",
            "15/17 सम्मुख ÷ कर्ण है, sin A। sec A, कर्ण ÷ संलग्न है।",
          ),
        },
        {
          id: "cot",
          label: t(r`$\dfrac{8}{15}$`, r`$\dfrac{8}{15}$`),
          feedback: t(
            "8/15 is cot A itself. Find the hypotenuse, √(8² + 15²) = 17, then hypotenuse ÷ adjacent.",
            "8/15 तो cot A ही है। कर्ण निकालो, √(8² + 15²) = 17, फिर कर्ण ÷ संलग्न।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const q6 = choiceQuestion(b, {
      name: "q6",
      prompt: t(
        "Exercise 8.1 Q6: A and B are acute angles with cos A = cos B. What follows?",
        "प्रश्नावली 8.1 प्र6: A और B न्यून कोण हैं और cos A = cos B। इससे क्या निकलता है?",
      ),
      options: [
        { id: "right", label: t("∠A = ∠B, as in Example 2", "∠A = ∠B, जैसे उदाहरण 2 में") },
        {
          id: "comp",
          label: t("∠A + ∠B = 90°, as the angles pair up", "∠A + ∠B = 90°, क्योंकि कोण जोड़ी बनाते हैं"),
          feedback: t(
            "That would be cos A = sin B. Equal cosines mean similar triangles, so equal angles.",
            "वह cos A = sin B होता। बराबर कोसाइन का मतलब समरूप त्रिभुज, इसलिए बराबर कोण।",
          ),
        },
        {
          id: "none",
          label: t(
            "Nothing, unless the triangles are the same size",
            "कुछ नहीं, जब तक त्रिभुज एक माप के न हों",
          ),
          feedback: t(
            "Size doesn't matter: the ratios fix the shape, as Example 2 showed for sines.",
            "माप से फ़र्क़ नहीं पड़ता: अनुपात आकार तय करते हैं, जैसा उदाहरण 2 ने साइन के लिए दिखाया।",
          ),
        },
      ],
      answer: "right",
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ One ratio gives the whole triangle: sides in k, Pythagoras for the third. ✓ sin and cos stay below 1. ✓ The ladder reaches 4 m. Next stop: the exact ratios of 30°, 45° and 60°.",
        "**मिशन लॉग।** ✓ एक अनुपात से पूरा त्रिभुज: भुजाएँ k में, तीसरी पाइथागोरस से। ✓ sin और cos 1 से कम रहते हैं। ✓ सीढ़ी 4 m तक पहुँचती है। अगला पड़ाव: 30°, 45° और 60° के सटीक अनुपात।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(q6.on(QuestionSignal.Correct), theBoard.show(log));
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), q3, q4, q6, log, space()]);
  },
  { passOn: PassOn.Rules },
);

export const overview = [hook, method, bounds, example1, example2, examples, inLife, yourTurn];

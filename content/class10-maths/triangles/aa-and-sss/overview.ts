import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, goalQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  MatchAction,
  MatchDerived,
  MatchEdit,
  MatchSide,
  TrianglesSceneKind,
  sidesFromBaseAngles,
  triangleMatchDef,
} from "@chalk/prop-triangles";
import { AAA_SKETCH } from "../figures";
import { figureOn, sceneOn } from "../kit";

const r = String.raw;
const NAMES = ["A", "B", "C", "D", "E", "F"];

/** Activity 4's triangles: base 3 cm and 5 cm, angles at the base 60° and 40° (the second starts at 50°). */
const first4 = sidesFromBaseAngles(3, 60, 40) ?? { ab: 1.96, bc: 3, ca: 2.64 };
const second4 = sidesFromBaseAngles(5, 60, 50) ?? { ab: 4.08, bc: 5, ca: 4.61 };

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** Do we have to check all six parts every time? */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const tank = sceneOn(
    b,
    "tank",
    TrianglesSceneKind.WaterTank,
    "the foot of the water tank, with Kabir looking up and Grandpa shaking his head",
  );
  return column([
    w.title(t("Six checks, or fewer?", "छह जाँचें, या कम?")),
    tank,
    w.body(
      t(
        "Riya has a plan for the tank: build a small triangle she can measure that is similar to a huge triangle she can't. But to be sure two triangles are similar, must she check all three angles **and** all three side ratios? At the tank she can't even reach most of the big triangle.",
        "रिया के पास टंकी के लिए एक योजना है: एक छोटा त्रिभुज बनाना जिसे वह नाप सके और जो उस बड़े त्रिभुज के समरूप हो जिसे वह नहीं नाप सकती। पर दो त्रिभुजों के समरूप होने का पक्का पता करने के लिए क्या उसे तीनों कोण **और** भुजाओं के तीनों अनुपात जाँचने होंगे? टंकी पर तो बड़े त्रिभुज के ज़्यादातर हिस्से तक वह पहुँच भी नहीं सकती।",
      ),
    ),
    w.body(
      t(
        "For congruence, Class IX gave short tests that use just three parts (SSS, SAS, ASA). This lesson finds short tests for similarity.",
        "सर्वांगसमता के लिए कक्षा IX ने ऐसी छोटी कसौटियाँ दीं जो सिर्फ़ तीन हिस्से लेती हैं (SSS, SAS, ASA)। यह पाठ समरूपता के लिए छोटी कसौटियाँ ढूँढता है।",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** The ~ notation; the order of the letters matters. */
const notation = page(
  "notation",
  (b) => {
    const w = wordsOn(b);
    const order = choiceQuestion(b, {
      name: "order",
      prompt: t(
        "Here A ↔ D, B ↔ E and C ↔ F. Which statement is written correctly?",
        "यहाँ A ↔ D, B ↔ E और C ↔ F। कौन-सा कथन सही लिखा है?",
      ),
      options: [
        { id: "right", label: t("∆ BAC ~ ∆ EDF", "∆ BAC ~ ∆ EDF") },
        {
          id: "edf",
          label: t("∆ ABC ~ ∆ EDF", "∆ ABC ~ ∆ EDF"),
          feedback: t(
            "This pairs A with E, but A corresponds to D. The letters must line up in matching order.",
            "यह A को E से जोड़ता है, पर A, D के संगत है। अक्षर मेल खाते क्रम में होने चाहिए।",
          ),
        },
        {
          id: "fed",
          label: t("∆ ABC ~ ∆ FED", "∆ ABC ~ ∆ FED"),
          feedback: t(
            "This pairs A with F and C with D. Read it place by place: first with first, second with second.",
            "यह A को F से और C को D से जोड़ता है। जगह-जगह पढ़ो: पहला पहले से, दूसरा दूसरे से।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Writing it down", "इसे लिखना")),
      w.definition(
        t(
          '**Notation.** If in triangles ABC and DEF, ∠A = ∠D, ∠B = ∠E, ∠C = ∠F and AB/DE = BC/EF = CA/FD, we write **∆ ABC ~ ∆ DEF** and read it "triangle ABC is similar to triangle DEF". The sign ~ means "is similar to", just as ≅ means "is congruent to".',
          '**संकेत।** यदि त्रिभुज ABC और DEF में ∠A = ∠D, ∠B = ∠E, ∠C = ∠F और AB/DE = BC/EF = CA/FD हो, तो हम लिखते हैं **∆ ABC ~ ∆ DEF** और पढ़ते हैं "त्रिभुज ABC, त्रिभुज DEF के समरूप है"। चिह्न ~ का अर्थ है "के समरूप है", जैसे ≅ का अर्थ है "के सर्वांगसम है"।',
        ),
      ),
      w.body(
        t(
          "The order of the letters is the correspondence: the first letter on each side match, then the second, then the third. Writing ∆ ABC ~ ∆ EDF would wrongly pair A with E.",
          "अक्षरों का क्रम ही संगतता है: दोनों ओर का पहला अक्षर मेल खाता है, फिर दूसरा, फिर तीसरा। ∆ ABC ~ ∆ EDF लिखना A को ग़लत तरीक़े से E से जोड़ देगा।",
        ),
      ),
      order,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Activity 4: equal angles force proportional sides; AAA and AA. */
const angles = page(
  "angles",
  (b) => {
    const w = wordsOn(b);
    const pair = b.prop(triangleMatchDef, "pair", {
      first: first4,
      second: second4,
      edit: MatchEdit.Angles,
      step: 0.5,
      names: NAMES,
      showSides: true,
      showAngles: true,
      showRatios: true,
      showVerdict: true,
    });
    b.studentOnly(pair.action(MatchAction.NudgeAngle));
    b.studentOnly(pair.action(MatchAction.NudgeSide));
    b.standsFor(
      pair,
      "triangle ABC with BC = 3 cm, ∠B = 60°, ∠C = 40°, and triangle DEF with EF = 5 cm whose base angles E and F the learner can change, with all sides, angles and the side ratios shown",
    );
    const goal = goalQuestion(b, {
      about: pair,
      prompt: t(
        "Activity 4: ∠E is already 60°. Change ∠F until it equals ∠C = 40°, and watch the side ratios.",
        "क्रियाकलाप 4: ∠E पहले से 60° है। ∠F को तब तक बदलो जब तक वह ∠C = 40° के बराबर न हो, और भुजाओं के अनुपात देखो।",
      ),
      isMet: pair.derived(MatchDerived.IsSimilar).eq(true),
      solve: [
        pair.learner(MatchAction.NudgeAngle, { at: 2, by: -1 }),
        pair.learner(MatchAction.NudgeAngle, { at: 2, by: -1 }),
      ],
    });
    return column([
      w.title(t("Equal angles", "बराबर कोण")),
      w.body(
        t(
          "Activity 4. Draw BC = 3 cm and EF = 5 cm. At B and E make angles of 60°; at C and F make angles of 40°. The rays meet at A and D.",
          "क्रियाकलाप 4। BC = 3 cm और EF = 5 cm खींचो। B और E पर 60° के कोण बनाओ; C और F पर 40° के कोण। किरणें A और D पर मिलती हैं।",
        ),
      ),
      pair,
      goal,
      w.body(
        t(
          r`Once the angles match, $$\frac{AB}{DE} = \frac{BC}{EF} = \frac{CA}{FD} = \frac{3}{5} = 0.6$$ The sides came out in one ratio by themselves: nobody set them.`,
          r`जब कोण मिल जाते हैं, $$\frac{AB}{DE} = \frac{BC}{EF} = \frac{CA}{FD} = \frac{3}{5} = 0.6$$ भुजाएँ अपने आप एक अनुपात में आ गईं: किसी ने उन्हें तय नहीं किया।`,
        ),
      ),
      w.definition(
        t(
          "**Theorem 6.3 (AAA similarity).** If in two triangles the corresponding angles are equal, then their corresponding sides are in the same ratio, and so the triangles are similar.",
          "**प्रमेय 6.3 (AAA समरूपता)।** यदि दो त्रिभुजों में संगत कोण बराबर हों, तो उनकी संगत भुजाएँ एक ही अनुपात में होती हैं, और इसलिए त्रिभुज समरूप होते हैं।",
        ),
      ),
      figureOn(b, "sketch", AAA_SKETCH),
      w.body(
        t(
          r`**Why (sketch).** Cut DP = AB and DQ = AC on DE and DF. Then ∆ ABC ≅ ∆ DPQ (SAS), so ∠P = ∠B = ∠E, which makes PQ ∥ EF. By the BPT, $$\frac{DP}{PE} = \frac{DQ}{QF}$$ By Example 1's trick (add 1, flip), $$\frac{DP}{DE} = \frac{DQ}{DF}$$ and DP = AB, DQ = AC, so $$\frac{AB}{DE} = \frac{AC}{DF}$$ The same argument at another corner gives the third ratio.`,
          r`**क्यों (रूपरेखा)।** DE और DF पर DP = AB और DQ = AC काटो। तब ∆ ABC ≅ ∆ DPQ (SAS), तो ∠P = ∠B = ∠E, जिससे PQ ∥ EF। BPT से $$\frac{DP}{PE} = \frac{DQ}{QF}$$ उदाहरण 1 की तरकीब से (1 जोड़ो, उलटो), $$\frac{DP}{DE} = \frac{DQ}{DF}$$ और DP = AB, DQ = AC, इसलिए $$\frac{AB}{DE} = \frac{AC}{DF}$$ दूसरे कोने पर यही तर्क तीसरा अनुपात देता है।`,
        ),
      ),
      w.definition(
        t(
          "**AA similarity.** The angles of a triangle add up to 180°, so if two angles of one triangle equal two angles of another, the third angles are equal too. So **two pairs of equal angles are enough**.",
          "**AA समरूपता।** त्रिभुज के कोणों का योग 180° होता है, इसलिए अगर एक त्रिभुज के दो कोण दूसरे के दो कोणों के बराबर हों, तो तीसरे कोण भी बराबर होते हैं। तो **बराबर कोणों के दो जोड़े काफ़ी हैं**।",
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Activity 5: sides in one ratio force equal angles; SSS. */
const sides = page(
  "sides",
  (b) => {
    const w = wordsOn(b);
    const pair = b.prop(triangleMatchDef, "pair", {
      first: { ab: 3, bc: 6, ca: 8 },
      second: { ab: 4.5, bc: 9, ca: 11 },
      edit: MatchEdit.Sides,
      step: 0.5,
      names: NAMES,
      showSides: true,
      showAngles: true,
      showRatios: true,
      showVerdict: true,
    });
    b.studentOnly(pair.action(MatchAction.NudgeSide));
    b.standsFor(
      pair,
      "triangle ABC with sides 3, 6 and 8 cm, and triangle DEF with DE = 4.5, EF = 9 and FD = 11 cm, whose sides the learner can change, with the angles and the side ratios shown",
    );
    const goal = goalQuestion(b, {
      about: pair,
      prompt: t(
        "Activity 5: change FD so that all three ratios are equal, then compare the angles.",
        "क्रियाकलाप 5: FD को बदलो ताकि तीनों अनुपात बराबर हों, फिर कोणों की तुलना करो।",
      ),
      isMet: pair.derived(MatchDerived.IsSimilar).eq(true),
      solve: [
        pair.learner(MatchAction.NudgeSide, { side: MatchSide.CA, by: 1 }),
        pair.learner(MatchAction.NudgeSide, { side: MatchSide.CA, by: 1 }),
      ],
    });
    return column([
      w.title(t("Sides in one ratio", "एक अनुपात में भुजाएँ")),
      w.body(
        t(
          "Now the other way. Activity 5: AB = 3, BC = 6, CA = 8 cm, and DE = 4.5, EF = 9 cm. What must FD be?",
          "अब उल्टी दिशा। क्रियाकलाप 5: AB = 3, BC = 6, CA = 8 cm, और DE = 4.5, EF = 9 cm। FD कितना होना चाहिए?",
        ),
      ),
      pair,
      goal,
      w.body(
        t(
          r`With FD = 12 cm, $$\frac{AB}{DE} = \frac{BC}{EF} = \frac{CA}{FD} = \frac{2}{3}$$ and now ∠A = ∠D, ∠B = ∠E and ∠C = ∠F. The angles matched by themselves.`,
          r`FD = 12 cm के साथ, $$\frac{AB}{DE} = \frac{BC}{EF} = \frac{CA}{FD} = \frac{2}{3}$$ और अब ∠A = ∠D, ∠B = ∠E और ∠C = ∠F। कोण अपने आप मिल गए।`,
        ),
      ),
      w.definition(
        t(
          "**Theorem 6.4 (SSS similarity).** If in two triangles the sides of one are proportional to (in the same ratio as) the sides of the other, then their corresponding angles are equal, and so the triangles are similar.",
          "**प्रमेय 6.4 (SSS समरूपता)।** यदि दो त्रिभुजों में एक की भुजाएँ दूसरे की भुजाओं के समानुपाती (उसी अनुपात में) हों, तो उनके संगत कोण बराबर होते हैं, और इसलिए त्रिभुज समरूप होते हैं।",
        ),
      ),
      w.note(
        t(
          "For polygons both conditions were needed. For triangles, one condition brings the other with it: equal angles give proportional sides (6.3), and proportional sides give equal angles (6.4).",
          "बहुभुजों के लिए दोनों शर्तें ज़रूरी थीं। त्रिभुजों के लिए एक शर्त दूसरी को साथ ले आती है: बराबर कोण समानुपाती भुजाएँ देते हैं (6.3), और समानुपाती भुजाएँ बराबर कोण देती हैं (6.4)।",
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Example 5: find ∠P from SSS. */
const example = page(
  "example",
  (b) => {
    const w = wordsOn(b);
    const angleP = choiceQuestion(b, {
      name: "angleP",
      prompt: t(
        "Example 5: in ∆ ABC, AB = 3.8, BC = 6, CA = 3√3, ∠A = 80°, ∠B = 60°. In ∆ PQR, RQ = 7.6, QP = 12, PR = 6√3. Find ∠P.",
        "उदाहरण 5: ∆ ABC में AB = 3.8, BC = 6, CA = 3√3, ∠A = 80°, ∠B = 60°। ∆ PQR में RQ = 7.6, QP = 12, PR = 6√3। ∠P ज्ञात करो।",
      ),
      options: [
        { id: "right", label: t("∠P = 40°", "∠P = 40°") },
        {
          id: "a",
          label: t("∠P = 80°", "∠P = 80°"),
          feedback: t(
            "P isn't paired with A. AB ↔ RQ, BC ↔ QP, CA ↔ PR, so ∆ ABC ~ ∆ RQP and C ↔ P.",
            "P, A से नहीं जुड़ता। AB ↔ RQ, BC ↔ QP, CA ↔ PR, तो ∆ ABC ~ ∆ RQP और C ↔ P।",
          ),
        },
        {
          id: "b",
          label: t("∠P = 60°", "∠P = 60°"),
          feedback: t(
            "P matches C, not B. ∠C = 180° − 80° − 60° = 40°.",
            "P, C से मेल खाता है, B से नहीं। ∠C = 180° − 80° − 60° = 40°।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("An example", "एक उदाहरण")),
      w.body(
        t(
          r`**Example 5.** Match the sides by their ratios: $$\frac{AB}{RQ} = \frac{3.8}{7.6} = \frac{1}{2}, \quad \frac{BC}{QP} = \frac{6}{12} = \frac{1}{2}, \quad \frac{CA}{PR} = \frac{3\sqrt3}{6\sqrt3} = \frac{1}{2}$$ So by SSS, $$\triangle ABC \sim \triangle RQP$$ The order shows that C corresponds to P, so ∠P = ∠C.`,
          r`**उदाहरण 5।** भुजाओं को उनके अनुपात से मिलाओ: $$\frac{AB}{RQ} = \frac{3.8}{7.6} = \frac{1}{2}, \quad \frac{BC}{QP} = \frac{6}{12} = \frac{1}{2}, \quad \frac{CA}{PR} = \frac{3\sqrt3}{6\sqrt3} = \frac{1}{2}$$ तो SSS से, $$\triangle ABC \sim \triangle RQP$$ क्रम से दिखता है कि C, P के संगत है, इसलिए ∠P = ∠C।`,
        ),
      ),
      angleP,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** Grandpa's set-squares: AA makes two triangles similar at a glance. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const sq = choiceQuestion(b, {
      name: "sq",
      prompt: t(
        "Grandpa has an old wooden set-square and Kabir a small plastic one, both with angles 90°, 60° and 30°. The wooden one's shortest side is 12 cm, the plastic one's 4 cm. Are they similar, and what is the scale factor?",
        "दादाजी के पास लकड़ी का पुराना सेट-स्क्वेयर है और कबीर के पास प्लास्टिक का छोटा, दोनों के कोण 90°, 60° और 30°। लकड़ी वाले की सबसे छोटी भुजा 12 cm है, प्लास्टिक वाले की 4 cm। क्या वे समरूप हैं, और पैमाना गुणक क्या है?",
      ),
      options: [
        { id: "right", label: t("Yes, by AA; every side is 3×", "हाँ, AA से; हर भुजा 3 गुनी") },
        {
          id: "sides",
          label: t("Can't say: other sides unknown", "नहीं कह सकते: बाक़ी भुजाएँ अज्ञात"),
          feedback: t(
            "The angles already decide it: two pairs of equal angles make them similar, and then every side has the same ratio, 12/4 = 3.",
            "कोण ही तय कर देते हैं: बराबर कोणों के दो जोड़े उन्हें समरूप बनाते हैं, और तब हर भुजा का अनुपात वही है, 12/4 = 3।",
          ),
        },
        {
          id: "plus",
          label: t("Yes; every side is 8 cm longer", "हाँ; हर भुजा 8 cm लंबी"),
          feedback: t(
            "Similar sides are multiplied by one number, not increased by one amount. 12 = 3 × 4.",
            "समरूप भुजाएँ एक संख्या से गुणा होती हैं, एक मात्रा से बढ़ती नहीं। 12 = 3 × 4।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const next = w.body(
      t(
        "This is the key to the tank. Riya doesn't need to reach the big triangle's sides: if she can show its **angles** match a small triangle's, the sides follow. **Stop 3 done.**",
        "यही टंकी की कुंजी है। रिया को बड़े त्रिभुज की भुजाओं तक पहुँचने की ज़रूरत नहीं: अगर वह दिखा सके कि उसके **कोण** एक छोटे त्रिभुज के कोणों से मिलते हैं, तो भुजाएँ अपने आप मिल जाएँगी। **पड़ाव 3 पूरा।**",
      ),
      "next",
      { isHidden: true },
    );
    b.when(sq.on(QuestionSignal.Correct), [theBoard.show(next), theBoard.pass()]);
    return column([w.title(t("Two set-squares", "दो सेट-स्क्वेयर")), sq, next, space()]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Exercise 6.3 Q2 and the criteria; mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const q2 = choiceQuestion(b, {
      name: "q2",
      prompt: t(
        "Exercise 6.3 Q2: ∆ ODC ~ ∆ OBA, ∠BOC = 125° and ∠CDO = 70°. Find ∠OAB.",
        "प्रश्नावली 6.3 प्र2: ∆ ODC ~ ∆ OBA, ∠BOC = 125° और ∠CDO = 70°। ∠OAB ज्ञात करो।",
      ),
      options: [
        { id: "right", label: t("55°", "55°") },
        {
          id: "70",
          label: t("70°", "70°"),
          feedback: t(
            "70° is ∠CDO, which matches ∠OBA. ∠OAB matches ∠OCD.",
            "70° तो ∠CDO है, जो ∠OBA से मेल खाता है। ∠OAB, ∠OCD से मेल खाता है।",
          ),
        },
        {
          id: "125",
          label: t("125°", "125°"),
          feedback: t(
            "∠DOC = 180° − 125° = 55° (a straight line), and ∠DCO = 180° − 70° − 55° = 55°, which equals ∠OAB.",
            "∠DOC = 180° − 125° = 55° (सरल रेखा), और ∠DCO = 180° − 70° − 55° = 55°, जो ∠OAB के बराबर है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ Notation ∆ ABC ~ ∆ DEF, letters in matching order. ✓ AA: two equal angles are enough. ✓ SSS: three sides in one ratio are enough. Next: a third test, and then the tank itself.",
        "**मिशन लॉग।** ✓ संकेत ∆ ABC ~ ∆ DEF, अक्षर मेल खाते क्रम में। ✓ AA: दो बराबर कोण काफ़ी हैं। ✓ SSS: एक अनुपात में तीन भुजाएँ काफ़ी हैं। आगे: एक तीसरी कसौटी, और फिर ख़ुद टंकी।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(q2.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), q2, log, space()]);
  },
  { passOn: PassOn.Rules },
);

export const overview = [hook, notation, angles, sides, example, inLife, yourTurn];

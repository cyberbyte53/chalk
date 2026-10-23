import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import { CirclesSceneKind, TangentsAction, tangentsFromPointDef } from "@chalk/prop-circles";
import { figureOn, sceneOn } from "../kit";

const r = String.raw;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** Rim and tyre: circles inside circles. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const chain = sceneOn(
    b,
    "chain",
    CirclesSceneKind.ChainSprockets,
    "Kabir by the cycle with the chain cover off, the chain leaving the two sprockets along tangents",
  );
  return column([
    w.title(t("The tricky parts of the poster", "पोस्टर के कठिन हिस्से")),
    chain,
    w.body(
      t(
        "Last time: two tangents from one outside point are equal. Riya's poster sketch is getting crowded. The tyre and the metal rim are two circles with the same centre. Extend the chain's two straight runs past the small sprocket and they meet at a point: two tangents from one point, and an angle between them. Kabir asks: \"Can your two theorems tell us anything about these?\"",
        'पिछली बार: बाहर के एक बिंदु से दोनों स्पर्श रेखाएँ बराबर होती हैं। रिया का पोस्टर का ख़ाका भरता जा रहा है। टायर और धातु का रिम एक ही केंद्र वाले दो वृत्त हैं। चेन के दोनों सीधे हिस्सों को छोटे स्प्रॉकेट के आगे बढ़ाओ तो वे एक बिंदु पर मिलते हैं: एक बिंदु से दो स्पर्श रेखाएँ, और उनके बीच एक कोण। कबीर पूछता है: "क्या तुम्हारे दो प्रमेय इनके बारे में कुछ बता सकते हैं?"',
      ),
    ),
    w.body(
      t(
        "They can. This lesson works through NCERT's three examples and then the exercise, using only Theorem 10.1 (tangent ⟂ radius) and Theorem 10.2 (equal tangents).",
        "बता सकते हैं। यह पाठ NCERT के तीन उदाहरण और फिर प्रश्नावली हल करता है, केवल प्रमेय 10.1 (स्पर्श रेखा ⟂ त्रिज्या) और प्रमेय 10.2 (बराबर स्पर्श रेखाएँ) से।",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Example 1: concentric circles, the chord is bisected. */
const concentric = page(
  "concentric",
  (b) => {
    const w = wordsOn(b);
    const step = choiceQuestion(b, {
      name: "step",
      prompt: t("Why is OP ⊥ AB in this proof?", "इस उपपत्ति में OP ⊥ AB क्यों है?"),
      options: [
        {
          id: "right",
          label: t("AB is a tangent to the small circle at P", "AB, छोटे वृत्त की P पर स्पर्श रेखा है"),
        },
        {
          id: "chord",
          label: t("AB is a chord of the large circle", "AB, बड़े वृत्त की एक जीवा है"),
          feedback: t(
            "Being a chord alone doesn't make it perpendicular to OP. It's perpendicular because it touches the small circle at P (Theorem 10.1).",
            "केवल जीवा होने से वह OP पर लंब नहीं होती। वह लंब इसलिए है क्योंकि वह छोटे वृत्त को P पर छूती है (प्रमेय 10.1)।",
          ),
        },
        {
          id: "mid",
          label: t("P is the midpoint of the chord AB", "P, जीवा AB का मध्य-बिंदु है"),
          feedback: t(
            "That's what we're proving, so we can't use it. We get OP ⊥ AB from the tangent first.",
            "यही तो सिद्ध करना है, इसलिए इसे काम में नहीं ले सकते। OP ⊥ AB हमें पहले स्पर्श रेखा से मिलता है।",
          ),
        },
      ],
      answer: "right",
    });
    const rings = figureOn(b, "rings", {
      points: [
        { name: "O", at: [0, 0], prefer: 0 },
        { name: "A", at: [-2.4, -1.8], prefer: 180 },
        { name: "B", at: [2.4, -1.8], prefer: 0 },
        { name: "P", at: [0, -1.8], prefer: 90 },
      ],
      items: [
        { kind: "circle", c: "O", r: 3 },
        { kind: "circle", c: "O", r: 1.8, tone: "muted" },
        { kind: "seg", a: "A", b: "B", tone: "accent" },
        { kind: "seg", a: "O", b: "P", tone: "result" },
        { kind: "right", at: "P", p: "O", q: "B" },
        { kind: "ticks", a: "A", b: "P", step: 1 },
        { kind: "ticks", a: "P", b: "B", step: 1 },
      ],
      captions: [
        {
          en: "AB is a chord of the big circle and touches the small one at P. OP is a radius of the small circle, so OP ⊥ AB.",
          hi: "AB बड़े वृत्त की जीवा है और छोटे वृत्त को P पर छूती है। OP छोटे वृत्त की त्रिज्या है, इसलिए OP ⊥ AB।",
        },
        {
          en: "The perpendicular from the centre bisects the chord: AP = PB.",
          hi: "केंद्र से लंब जीवा को समद्विभाजित करता है: AP = PB।",
        },
      ],
      about:
        "Two concentric circles with centre O; the chord AB of the larger circle touches the smaller circle at P, OP is drawn with a right-angle mark at P, and the next step marks AP and PB equal",
      height: 220,
    });
    return column([
      w.title(t("Example 1: circles with one centre", "उदाहरण 1: एक केंद्र वाले वृत्त")),
      w.definition(
        t(
          "**Concentric circles.** Circles with the same centre are **concentric**. A tyre and its rim are concentric.",
          "**संकेंद्रीय वृत्त।** एक ही केंद्र वाले वृत्त **संकेंद्रीय** होते हैं। टायर और उसका रिम संकेंद्रीय हैं।",
        ),
      ),
      w.body(
        t(
          "**Prove** that in two concentric circles, the chord of the larger circle which touches the smaller circle is bisected at the point of contact.",
          "**सिद्ध करो** कि दो संकेंद्रीय वृत्तों में बड़े वृत्त की वह जीवा जो छोटे वृत्त को छूती है, स्पर्श बिंदु पर समद्विभाजित होती है।",
        ),
      ),
      rings,
      w.body(
        t(
          r`**Given:** concentric circles with centre O, and a chord AB of the larger circle touching the smaller circle at P. **To prove:** AP = BP. **Proof.** Join OP. AB is a tangent to the smaller circle at P, and OP is its radius, so by Theorem 10.1 $$OP \perp AB$$ AB is a chord of the larger circle, and the perpendicular from the centre to a chord bisects it, so $$AP = BP$$`,
          r`**दिया है:** केंद्र O वाले संकेंद्रीय वृत्त, और बड़े वृत्त की जीवा AB जो छोटे वृत्त को P पर छूती है। **सिद्ध करना है:** AP = BP। **उपपत्ति।** OP को मिलाओ। AB छोटे वृत्त की P पर स्पर्श रेखा है, और OP उसकी त्रिज्या, इसलिए प्रमेय 10.1 से $$OP \perp AB$$ AB बड़े वृत्त की जीवा है, और केंद्र से जीवा पर लंब उसे समद्विभाजित करता है, इसलिए $$AP = BP$$`,
        ),
      ),
      step,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Example 2 and Exercise 10.2 Q10: angles between tangents. */
const angles = page(
  "angles",
  (b) => {
    const w = wordsOn(b);
    const point = b.prop(tangentsFromPointDef, "point", {
      r: 3,
      d: 6,
      step: 1,
      names: ["O", "T", "P", "Q"],
      canMove: true,
      showRadii: true,
      showLengths: false,
      showBisector: false,
      showAngles: true,
      showCount: false,
    });
    b.studentOnly(point.action(TangentsAction.Move));
    b.standsFor(
      point,
      "a circle with centre O and an outside point T with tangents TP and TQ, the radii OP and OQ with right-angle marks, and the angle PTQ between the tangents and the angle POQ at the centre written; the learner can move T",
    );
    const sum = choiceQuestion(b, {
      name: "sum",
      prompt: t(
        "Move T and watch the two angles. What is always true?",
        "T को खिसकाओ और दोनों कोण देखो। हमेशा क्या सच रहता है?",
      ),
      options: [
        { id: "right", label: t("∠PTQ + ∠POQ = 180°", "∠PTQ + ∠POQ = 180°") },
        {
          id: "equal",
          label: t("∠PTQ = ∠POQ", "∠PTQ = ∠POQ"),
          feedback: t(
            "Read the two numbers: when one grows the other shrinks. They add up to 180°.",
            "दोनों संख्याएँ पढ़ो: एक बढ़ता है तो दूसरा घटता है। उनका योग 180° है।",
          ),
        },
        {
          id: "ninety",
          label: t("∠PTQ + ∠POQ = 90°", "∠PTQ + ∠POQ = 90°"),
          feedback: t(
            "Add the two readings at any position: you get 180°, not 90°.",
            "किसी भी स्थिति के दोनों पाठ जोड़ो: 180° आता है, 90° नहीं।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Angles made by two tangents", "दो स्पर्श रेखाओं से बने कोण")),
      point,
      sum,
      w.body(
        t(
          r`**Exercise 10.2 Q10, proved.** In quadrilateral OPTQ the angles add to 360°, and the angles at P and Q are 90° (Theorem 10.1): $$\angle PTQ + \angle POQ + 90^\circ + 90^\circ = 360^\circ$$ $$\angle PTQ + \angle POQ = 180^\circ$$ The angle between the two tangents is **supplementary** to the angle the segment PQ subtends at the centre.`,
          r`**प्रश्नावली 10.2 प्र10, सिद्ध।** चतुर्भुज OPTQ में कोणों का योग 360° है, और P तथा Q पर कोण 90° हैं (प्रमेय 10.1): $$\angle PTQ + \angle POQ + 90^\circ + 90^\circ = 360^\circ$$ $$\angle PTQ + \angle POQ = 180^\circ$$ दोनों स्पर्श रेखाओं के बीच का कोण, रेखाखंड PQ द्वारा केंद्र पर अंतरित कोण का **संपूरक** है।`,
        ),
      ),
      w.body(
        t(
          r`**Example 2: prove ∠PTQ = 2∠OPQ.** Let ∠PTQ = θ. By Theorem 10.2, TP = TQ, so ∆ TPQ is isosceles: $$\angle TPQ = \angle TQP = \tfrac{1}{2}(180^\circ - \theta) = 90^\circ - \tfrac{1}{2}\theta$$ By Theorem 10.1, ∠OPT = 90°, so $$\angle OPQ = \angle OPT - \angle TPQ$$ $$= 90^\circ - \left(90^\circ - \tfrac{1}{2}\theta\right) = \tfrac{1}{2}\theta$$ That is, $$\angle PTQ = 2\angle OPQ$$`,
          r`**उदाहरण 2: सिद्ध करो ∠PTQ = 2∠OPQ।** मान लो ∠PTQ = θ। प्रमेय 10.2 से TP = TQ, इसलिए ∆ TPQ समद्विबाहु है: $$\angle TPQ = \angle TQP = \tfrac{1}{2}(180^\circ - \theta) = 90^\circ - \tfrac{1}{2}\theta$$ प्रमेय 10.1 से ∠OPT = 90°, इसलिए $$\angle OPQ = \angle OPT - \angle TPQ$$ $$= 90^\circ - \left(90^\circ - \tfrac{1}{2}\theta\right) = \tfrac{1}{2}\theta$$ अर्थात् $$\angle PTQ = 2\angle OPQ$$`,
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Example 3: TP = 20/3 cm. */
const example3 = page(
  "example-3",
  (b) => {
    const w = wordsOn(b);
    const or = choiceQuestion(b, {
      name: "or",
      prompt: t(
        "In Example 3, the chord PQ = 8 cm and the radius is 5 cm. How long is OR, from the centre to the chord?",
        "उदाहरण 3 में जीवा PQ = 8 cm और त्रिज्या 5 cm है। केंद्र से जीवा तक OR कितना है?",
      ),
      options: [
        { id: "right", label: t("3 cm", "3 cm") },
        {
          id: "four",
          label: t("4 cm", "4 cm"),
          feedback: t(
            "4 cm is PR, half the chord. OR is the other side: √(5² − 4²).",
            "4 cm, PR है, जीवा का आधा। OR दूसरी भुजा है: √(5² − 4²)।",
          ),
        },
        {
          id: "root41",
          label: t("√41 cm", "√41 cm"),
          feedback: t(
            "OP = 5 is the hypotenuse of ∆ ORP, so subtract the squares: 25 − 16 = 9.",
            "OP = 5, ∆ ORP का कर्ण है, इसलिए वर्ग घटाओ: 25 − 16 = 9।",
          ),
        },
      ],
      answer: "right",
    });
    const fig = figureOn(b, "figure", {
      points: [
        { name: "O", at: [0, 0], prefer: 180 },
        { name: "P", at: [3, 4], prefer: 90 },
        { name: "Q", at: [3, -4], prefer: 270 },
        { name: "R", at: [3, 0], prefer: 225 },
        { name: "T", at: [8.33, 0], prefer: 0 },
      ],
      items: [
        { kind: "poly", pts: ["O", "R", "P"], tone: "result", step: 1 },
        { kind: "poly", pts: ["T", "R", "P"], tone: "accent", step: 2 },
        { kind: "circle", c: "O", r: 5 },
        { kind: "seg", a: "P", b: "Q" },
        { kind: "seg", a: "T", b: "P" },
        { kind: "seg", a: "T", b: "Q" },
        { kind: "seg", a: "O", b: "T", dashed: true },
        { kind: "seg", a: "O", b: "P", tone: "accent" },
        { kind: "right", at: "P", p: "O", q: "T" },
        { kind: "right", at: "R", p: "P", q: "T" },
        { kind: "note", at: [3.5, 2], text: "4", prefer: 0 },
        { kind: "note", at: [1.3, 2.4], text: "5", prefer: 135 },
        { kind: "angle", at: "P", p: "R", q: "O", count: 1, tone: "result", step: 2 },
        { kind: "angle", at: "T", p: "P", q: "R", count: 1, tone: "accent", step: 2 },
      ],
      captions: [
        {
          en: "OT meets the chord PQ at R, at right angles, so PR = 4 cm. The radius OP = 5 cm, and OP ⊥ TP.",
          hi: "OT जीवा PQ से R पर समकोण पर मिलता है, इसलिए PR = 4 cm। त्रिज्या OP = 5 cm है, और OP ⊥ TP।",
        },
        {
          en: "Right ∆ ORP: its hypotenuse is OP = 5 and one side is PR = 4. Find OR.",
          hi: "समकोण ∆ ORP: इसका कर्ण OP = 5 है और एक भुजा PR = 4। OR निकालो।",
        },
        {
          en: "∠RPO = ∠PTR (both marked), so right ∆ TRP ~ right ∆ PRO.",
          hi: "∠RPO = ∠PTR (दोनों चिह्नित), इसलिए समकोण ∆ TRP ~ समकोण ∆ PRO।",
        },
      ],
      about:
        "A circle with centre O and radius 5; the chord PQ is upright, the tangents at P and Q meet at T to the right, and OT cuts PQ at R with right angles at P and R; the steps shade triangle ORP, then triangle TRP with the equal angles RPO and PTR marked",
      height: 240,
    });
    const orIs = w.body(
      t(
        r`In right ∆ ORP: $$OR = \sqrt{OP^2 - PR^2} = \sqrt{5^2 - 4^2} = 3 \text{ cm}$$`,
        r`समकोण ∆ ORP में: $$OR = \sqrt{OP^2 - PR^2} = \sqrt{5^2 - 4^2} = 3 \text{ cm}$$`,
      ),
      "orIs",
      { isHidden: true },
    );
    const similar = w.body(
      t(
        r`Now ∠TPR + ∠RPO = 90° (tangent ⟂ radius) and ∠TPR + ∠PTR = 90° (angles of right ∆ TRP), so ∠RPO = ∠PTR. So right ∆ TRP ~ right ∆ PRO by AA, and $$\frac{TP}{PO} = \frac{RP}{RO}$$ $$\frac{TP}{5} = \frac{4}{3}$$ $$TP = \frac{20}{3} \text{ cm}$$`,
        r`अब ∠TPR + ∠RPO = 90° (स्पर्श रेखा ⟂ त्रिज्या) और ∠TPR + ∠PTR = 90° (समकोण ∆ TRP के कोण), इसलिए ∠RPO = ∠PTR। तो AA से समकोण ∆ TRP ~ समकोण ∆ PRO, और $$\frac{TP}{PO} = \frac{RP}{RO}$$ $$\frac{TP}{5} = \frac{4}{3}$$ $$TP = \frac{20}{3} \text{ cm}$$`,
      ),
      "similar",
      { isHidden: true },
    );
    const ncert = w.note(
      t(
        "NCERT also finds TP with Pythagoras: with TP = x and TR = y, use ∆ PRT and ∆ OPT to get two equations, subtract them to find y = 16/3, then x = 20/3.",
        "NCERT, TP को पाइथागोरस से भी निकालती है: TP = x और TR = y लेकर ∆ PRT और ∆ OPT से दो समीकरण बनाओ, उन्हें घटाकर y = 16/3 पाओ, फिर x = 20/3।",
      ),
      "ncert",
      { isHidden: true },
    );
    b.when(or.on(QuestionSignal.Correct), [
      theBoard.show(orIs),
      theBoard.show(similar),
      theBoard.show(ncert),
    ]);
    return column([
      w.title(t("Example 3: how long is TP?", "उदाहरण 3: TP कितना लंबा है?")),
      w.body(
        t(
          "PQ is a chord of length 8 cm of a circle of radius 5 cm. The tangents at P and Q meet at T. Find TP.",
          "PQ, 5 cm त्रिज्या वाले वृत्त की 8 cm लंबी जीवा है। P और Q पर स्पर्श रेखाएँ T पर मिलती हैं। TP ज्ञात करो।",
        ),
      ),
      fig,
      w.body(
        t(
          r`Join OT; it meets PQ at R. ∆ TPQ is isosceles (TP = TQ) and TO bisects ∠PTQ, so OT ⊥ PQ and OT bisects PQ: $$PR = RQ = 4 \text{ cm}$$`,
          r`OT को मिलाओ; यह PQ से R पर मिलता है। ∆ TPQ समद्विबाहु है (TP = TQ) और TO, ∠PTQ को समद्विभाजित करता है, इसलिए OT ⊥ PQ और OT, PQ को समद्विभाजित करता है: $$PR = RQ = 4 \text{ cm}$$`,
        ),
      ),
      or,
      orIs,
      similar,
      ncert,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Circles inside polygons: Exercise 10.2 Q8 and Q11. */
const inscribed = page(
  "inscribed",
  (b) => {
    const w = wordsOn(b);
    const rhombus = choiceQuestion(b, {
      name: "rhombus",
      prompt: t(
        "Exercise 10.2 Q11: a parallelogram ABCD circumscribes a circle. AB + CD = AD + BC, and opposite sides of a parallelogram are equal. What must ABCD be?",
        "प्रश्नावली 10.2 प्र11: समांतर चतुर्भुज ABCD एक वृत्त के परिगत है। AB + CD = AD + BC, और समांतर चतुर्भुज की सम्मुख भुजाएँ बराबर हैं। ABCD क्या होना चाहिए?",
      ),
      options: [
        { id: "right", label: t("A rhombus", "समचतुर्भुज") },
        {
          id: "rect",
          label: t("A rectangle", "आयत"),
          feedback: t(
            "With AB = CD and AD = BC, the equation gives 2AB = 2AD, so all four sides are equal. That's a rhombus; nothing forces right angles.",
            "AB = CD और AD = BC से समीकरण 2AB = 2AD देता है, तो चारों भुजाएँ बराबर हैं। यह समचतुर्भुज है; समकोण के लिए कोई बाध्यता नहीं।",
          ),
        },
        {
          id: "trap",
          label: t("A trapezium", "समलंब"),
          feedback: t(
            "It's given as a parallelogram, and then the tangent lengths make all four sides equal: a rhombus.",
            "यह समांतर चतुर्भुज दिया है, और फिर स्पर्श रेखा की लंबाइयाँ चारों भुजाएँ बराबर कर देती हैं: समचतुर्भुज।",
          ),
        },
      ],
      answer: "right",
    });
    const quad = figureOn(b, "quad", {
      points: [
        { name: "O", at: [0, 0], prefer: 0 },
        { name: "A", at: [-1.25, 2.41], prefer: 135 },
        { name: "B", at: [2.14, 1.5], prefer: 45 },
        { name: "C", at: [1.77, -2.77], prefer: 315 },
        { name: "D", at: [-2.56, -1.2], prefer: 225 },
        { name: "P", at: [0.52, 1.93], prefer: 90 },
        { name: "Q", at: [1.99, -0.17], prefer: 0 },
        { name: "R", at: [-0.68, -1.88], prefer: 270 },
        { name: "S", at: [-1.88, 0.68], prefer: 180 },
      ],
      items: [
        { kind: "circle", c: "O", r: 2, tone: "muted" },
        { kind: "seg", a: "A", b: "P", tone: "accent" },
        { kind: "seg", a: "A", b: "S", tone: "accent" },
        { kind: "ticks", a: "A", b: "P", count: 1 },
        { kind: "ticks", a: "A", b: "S", count: 1 },
        { kind: "seg", a: "B", b: "P", tone: "result" },
        { kind: "seg", a: "B", b: "Q", tone: "result" },
        { kind: "ticks", a: "B", b: "P", count: 1 },
        { kind: "ticks", a: "B", b: "Q", count: 1 },
        { kind: "seg", a: "C", b: "Q", tone: "accent" },
        { kind: "seg", a: "C", b: "R", tone: "accent" },
        { kind: "ticks", a: "C", b: "Q", count: 2 },
        { kind: "ticks", a: "C", b: "R", count: 2 },
        { kind: "seg", a: "D", b: "R", tone: "result" },
        { kind: "seg", a: "D", b: "S", tone: "result" },
        { kind: "ticks", a: "D", b: "R", count: 2 },
        { kind: "ticks", a: "D", b: "S", count: 2 },
      ],
      captions: [
        {
          en: "The sides touch the circle at P, Q, R, S. The two tangents from each corner are equal, drawn in the same colour and marks: AP = AS, BP = BQ, CQ = CR, DR = DS.",
          hi: "भुजाएँ वृत्त को P, Q, R, S पर छूती हैं। हर कोने से दोनों स्पर्श रेखाएँ बराबर हैं, एक ही रंग और निशान में: AP = AS, BP = BQ, CQ = CR, DR = DS।",
        },
      ],
      about:
        "A quadrilateral ABCD drawn round a circle with centre O, touching it at P on AB, Q on BC, R on CD and S on DA; the two tangent pieces from each corner are drawn in the same colour with the same tick marks",
      height: 240,
    });
    return column([
      w.title(t("A circle inside a shape", "किसी आकृति के अंदर वृत्त")),
      w.definition(
        t(
          "**Circumscribe.** A polygon **circumscribes** a circle (is drawn around it) when every side of the polygon is a tangent to the circle.",
          "**परिगत।** कोई बहुभुज एक वृत्त के **परिगत** होता है (उसके चारों ओर बना होता है) जब बहुभुज की हर भुजा वृत्त की स्पर्श रेखा हो।",
        ),
      ),
      quad,
      w.body(
        t(
          r`**Exercise 10.2 Q8: prove AB + CD = AD + BC** for a quadrilateral ABCD circumscribing a circle. Let the sides touch at P (on AB), Q (on BC), R (on CD), S (on DA). From each vertex, the two tangents are equal (Theorem 10.2): $$AP = AS, \quad BP = BQ$$ $$CR = CQ, \quad DR = DS$$ Add them: $$(AP + BP) + (CR + DR)$$ $$= (AS + DS) + (BQ + CQ)$$ $$AB + CD = AD + BC$$`,
          r`**प्रश्नावली 10.2 प्र8: सिद्ध करो AB + CD = AD + BC**, जहाँ चतुर्भुज ABCD एक वृत्त के परिगत है। भुजाएँ P (AB पर), Q (BC पर), R (CD पर), S (DA पर) छूती हैं। हर शीर्ष से दोनों स्पर्श रेखाएँ बराबर हैं (प्रमेय 10.2): $$AP = AS, \quad BP = BQ$$ $$CR = CQ, \quad DR = DS$$ इन्हें जोड़ो: $$(AP + BP) + (CR + DR)$$ $$= (AS + DS) + (BQ + CQ)$$ $$AB + CD = AD + BC$$`,
        ),
      ),
      rhombus,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Exercise 10.2 Q12: the sides of a triangle round a circle of radius 4 cm. */
const incircle = page("incircle", (b) => {
  const w = wordsOn(b);
  const tri = figureOn(b, "triangle", {
    points: [
      { name: "A", at: [9, 12], prefer: 90 },
      { name: "B", at: [0, 0], prefer: 225 },
      { name: "C", at: [14, 0], prefer: 315 },
      { name: "O", at: [8, 4], prefer: 45 },
      { name: "D", at: [8, 0], prefer: 270 },
      { name: "E", at: [11.69, 5.54], prefer: 0 },
      { name: "F", at: [4.8, 6.4], prefer: 180 },
    ],
    items: [
      { kind: "poly", pts: ["O", "B", "C"], tone: "accent", step: 2 },
      { kind: "poly", pts: ["O", "C", "A"], tone: "result", step: 3 },
      { kind: "poly", pts: ["O", "A", "B"], tone: "accent", step: 4 },
      { kind: "circle", c: "O", r: 4, tone: "muted" },
      { kind: "seg", a: "A", b: "B" },
      { kind: "seg", a: "B", b: "C" },
      { kind: "seg", a: "C", b: "A" },
      { kind: "note", at: [6.26, 9.68], text: "x", prefer: 135 },
      { kind: "note", at: [11.09, 9.08], text: "x", prefer: 45 },
      { kind: "note", at: [1.76, 3.68], text: "8", prefer: 135 },
      { kind: "note", at: [4, -0.8], text: "8", prefer: 90 },
      { kind: "note", at: [11, -0.8], text: "6", prefer: 90 },
      { kind: "note", at: [13.59, 3.08], text: "6", prefer: 45 },
      { kind: "seg", a: "O", b: "D", tone: "result", step: 1 },
      { kind: "seg", a: "O", b: "E", tone: "result", step: 1 },
      { kind: "seg", a: "O", b: "F", tone: "result", step: 1 },
      { kind: "right", at: "D", p: "O", q: "C", step: 1 },
      { kind: "right", at: "E", p: "O", q: "A", step: 1 },
      { kind: "right", at: "F", p: "O", q: "B", step: 1 },
      { kind: "note", at: [8.6, 2], text: "4", prefer: 0, step: 1 },
      { kind: "seg", a: "O", b: "B", dashed: true, step: 2 },
      { kind: "seg", a: "O", b: "C", dashed: true, step: 2 },
      { kind: "seg", a: "O", b: "A", dashed: true, step: 3 },
    ],
    captions: [
      {
        en: "Equal tangents from each corner: BF = BD = 8, CE = CD = 6, and the two from A are both x.",
        hi: "हर कोने से बराबर स्पर्श रेखाएँ: BF = BD = 8, CE = CD = 6, और A से दोनों x हैं।",
      },
      {
        en: "The radii OD, OE, OF are 4 cm, and each is ⟂ to its side (Theorem 10.1).",
        hi: "त्रिज्याएँ OD, OE, OF 4 cm हैं, और हर एक अपनी भुजा पर ⟂ है (प्रमेय 10.1)।",
      },
      {
        en: "∆ OBC: base BC, height OD = 4.",
        hi: "∆ OBC: आधार BC, ऊँचाई OD = 4।",
      },
      {
        en: "∆ OCA: base CA, height OE = 4.",
        hi: "∆ OCA: आधार CA, ऊँचाई OE = 4।",
      },
      {
        en: "∆ OAB: base AB, height OF = 4. The three together make ∆ ABC.",
        hi: "∆ OAB: आधार AB, ऊँचाई OF = 4। तीनों मिलकर ∆ ABC बनाते हैं।",
      },
    ],
    about:
      "Triangle ABC round a circle with centre O and radius 4, touching BC at D, CA at E and AB at F; the tangent lengths x, x, 8, 8, 6, 6 are written on the sides; the steps draw the radii OD, OE, OF with right angles, then shade triangles OBC, OCA and OAB in turn",
    height: 280,
  });
  return column([
    w.title(t("A circle inside a triangle", "त्रिभुज के अंदर वृत्त")),
    w.body(
      t(
        "**Exercise 10.2 Q12.** A triangle ABC is drawn round a circle of radius 4 cm. The point of contact D splits BC into BD = 8 cm and DC = 6 cm. Find AB and AC.",
        "**प्रश्नावली 10.2 प्र12।** त्रिभुज ABC, 4 cm त्रिज्या वाले वृत्त के परिगत है। स्पर्श बिंदु D, BC को BD = 8 cm और DC = 6 cm में बाँटता है। AB और AC ज्ञात करो।",
      ),
    ),
    tri,
    w.body(
      t(
        r`Let the two tangents from A be x. Then $$AB = x + 8, \quad AC = x + 6, \quad BC = 14$$ **Area, way 1.** The three shaded triangles each have height 4: $$\text{area} = \tfrac{1}{2} \cdot 4 \cdot BC + \tfrac{1}{2} \cdot 4 \cdot CA + \tfrac{1}{2} \cdot 4 \cdot AB$$ $$= 2(14 + x + 6 + x + 8) = 4(x + 14)$$`,
        r`मान लो A से दोनों स्पर्श रेखाएँ x हैं। तब $$AB = x + 8, \quad AC = x + 6, \quad BC = 14$$ **क्षेत्रफल, तरीका 1।** तीनों छायांकित त्रिभुजों की ऊँचाई 4 है: $$\text{क्षेत्रफल} = \tfrac{1}{2} \cdot 4 \cdot BC + \tfrac{1}{2} \cdot 4 \cdot CA + \tfrac{1}{2} \cdot 4 \cdot AB$$ $$= 2(14 + x + 6 + x + 8) = 4(x + 14)$$`,
      ),
    ),
    w.body(
      t(
        r`**Area, way 2: Heron's formula.** The semi-perimeter is $$s = \tfrac{1}{2}(2x + 28) = x + 14$$ $$s - BC = x, \quad s - CA = 8, \quad s - AB = 6$$ $$\text{area} = \sqrt{(x + 14) \cdot x \cdot 8 \cdot 6}$$`,
        r`**क्षेत्रफल, तरीका 2: हीरोन का सूत्र।** अर्धपरिमाप है $$s = \tfrac{1}{2}(2x + 28) = x + 14$$ $$s - BC = x, \quad s - CA = 8, \quad s - AB = 6$$ $$\text{क्षेत्रफल} = \sqrt{(x + 14) \cdot x \cdot 8 \cdot 6}$$`,
      ),
    ),
    w.body(
      t(
        r`**Equate and solve.** Square both: $$48x(x + 14) = 16(x + 14)^2$$ Divide both sides by $16(x + 14)$: $$3x = x + 14, \quad x = 7$$ So AB = 7 + 8 = 15 cm and AC = 7 + 6 = 13 cm.`,
        r`**बराबर रखकर हल करो।** दोनों का वर्ग करो: $$48x(x + 14) = 16(x + 14)^2$$ दोनों पक्षों को $16(x + 14)$ से भाग दो: $$3x = x + 14, \quad x = 7$$ तो AB = 7 + 8 = 15 cm और AC = 7 + 6 = 13 cm।`,
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** Exercise 10.2 Q7 as the rim and the tyre. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const wheel = sceneOn(
      b,
      "wheel",
      CirclesSceneKind.WheelRoad,
      "the cycle's front wheel: the tyre and the metal rim are two circles with the same centre",
    );
    const chord = choiceQuestion(b, {
      name: "chord",
      prompt: t(
        "On the poster, the tyre is a circle of radius 5 cm and the rim a circle of radius 3 cm with the same centre. Riya draws a chord of the tyre that just touches the rim. How long is it? (Exercise 10.2 Q7)",
        "पोस्टर पर टायर 5 cm त्रिज्या का वृत्त है और रिम उसी केंद्र वाला 3 cm त्रिज्या का वृत्त। रिया टायर की एक जीवा खींचती है जो रिम को बस छूती है। वह कितनी लंबी है? (प्रश्नावली 10.2 प्र7)",
      ),
      options: [
        { id: "right", label: t("8 cm", "8 cm") },
        {
          id: "four",
          label: t("4 cm", "4 cm"),
          feedback: t(
            "4 cm is half of it, from the point of contact to one end. The chord is bisected there, so double it.",
            "4 cm उसका आधा है, स्पर्श बिंदु से एक सिरे तक। जीवा वहाँ समद्विभाजित होती है, इसलिए दोगुना करो।",
          ),
        },
        {
          id: "two",
          label: t("2 cm", "2 cm"),
          feedback: t(
            "That's 5 − 3, the gap between the circles. Use the right angle: half-chord² = 5² − 3² = 16.",
            "यह 5 − 3 है, दोनों वृत्तों के बीच का अंतर। समकोण लो: आधी-जीवा² = 5² − 3² = 16।",
          ),
        },
      ],
      answer: "right",
    });
    const done = w.body(
      t(
        r`The chord touches the rim, so by Example 1 it is bisected at the point of contact, and the radius there is perpendicular to it: $$\text{half-chord} = \sqrt{5^2 - 3^2} = 4 \text{ cm}$$ $$\text{chord} = 8 \text{ cm}$$ Riya pencils it onto the wheel.`,
        r`जीवा रिम को छूती है, इसलिए उदाहरण 1 से वह स्पर्श बिंदु पर समद्विभाजित होती है, और वहाँ त्रिज्या उस पर लंब है: $$\text{आधी जीवा} = \sqrt{5^2 - 3^2} = 4 \text{ cm}$$ $$\text{जीवा} = 8 \text{ cm}$$ रिया इसे पहिये पर पेंसिल से बना देती है।`,
      ),
      "done",
      { isHidden: true },
    );
    b.when(chord.on(QuestionSignal.Correct), theBoard.show(done));
    return column([w.title(t("Tyre and rim", "टायर और रिम")), wheel, chord, done, space()]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Exercise 10.2 Q2, Q3, Q4, Q9, Q13; the chapter's mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const q2 = choiceQuestion(b, {
      name: "q2",
      prompt: t(
        "Exercise 10.2 Q2: TP and TQ are tangents to a circle with centre O, and ∠POQ = 110°. Find ∠PTQ.",
        "प्रश्नावली 10.2 प्र2: TP और TQ केंद्र O वाले वृत्त की स्पर्श रेखाएँ हैं, और ∠POQ = 110°। ∠PTQ ज्ञात करो।",
      ),
      options: [
        { id: "right", label: t("70°", "70°") },
        {
          id: "sixty",
          label: t("60°", "60°"),
          feedback: t(
            "The two angles add to 180°: 180° − 110°.",
            "दोनों कोणों का योग 180° है: 180° − 110°।",
          ),
        },
        {
          id: "eighty",
          label: t("80°", "80°"),
          feedback: t(
            "Check with OPTQ: 110° + 90° + 90° + ∠PTQ = 360°.",
            "OPTQ से जाँचो: 110° + 90° + 90° + ∠PTQ = 360°।",
          ),
        },
        {
          id: "ninety",
          label: t("90°", "90°"),
          feedback: t(
            "90° is the angle at P and at Q. The angle at T is 180° − 110°.",
            "90° का कोण P और Q पर है। T पर कोण 180° − 110° है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const q3 = choiceQuestion(b, {
      name: "q3",
      prompt: t(
        "Exercise 10.2 Q3: tangents PA and PB make an angle of 80° with each other. Find ∠POA.",
        "प्रश्नावली 10.2 प्र3: स्पर्श रेखाएँ PA और PB आपस में 80° का कोण बनाती हैं। ∠POA ज्ञात करो।",
      ),
      options: [
        { id: "right", label: t("50°", "50°") },
        {
          id: "hundred",
          label: t("100°", "100°"),
          feedback: t(
            "100° is the whole ∠AOB. OP bisects it, so ∠POA is half: 50°.",
            "100° पूरा ∠AOB है। OP उसे समद्विभाजित करता है, इसलिए ∠POA आधा है: 50°।",
          ),
        },
        {
          id: "forty",
          label: t("40°", "40°"),
          feedback: t(
            "40° is ∠OPA, half the angle at P. In ∆ OAP: ∠POA = 90° − 40° = 50°.",
            "40°, ∠OPA है, P पर के कोण का आधा। ∆ OAP में: ∠POA = 90° − 40° = 50°।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const q4 = choiceQuestion(b, {
      name: "q4",
      prompt: t(
        "Exercise 10.2 Q4: why are the tangents at the two ends of a diameter parallel?",
        "प्रश्नावली 10.2 प्र4: व्यास के दोनों सिरों पर स्पर्श रेखाएँ समांतर क्यों होती हैं?",
      ),
      options: [
        {
          id: "right",
          label: t("Both are perpendicular to the same diameter", "दोनों एक ही व्यास पर लंब हैं"),
        },
        {
          id: "equal",
          label: t("Both are tangents of the same length", "दोनों एक ही लंबाई की स्पर्श रेखाएँ हैं"),
          feedback: t(
            "Tangent lines have no fixed length here. They're parallel because each is ⟂ to the diameter (Theorem 10.1).",
            "यहाँ स्पर्श रेखाओं की कोई तय लंबाई नहीं। वे समांतर इसलिए हैं क्योंकि हर एक व्यास पर ⟂ है (प्रमेय 10.1)।",
          ),
        },
        {
          id: "touch",
          label: t("Both touch the circle at exactly one point", "दोनों वृत्त को ठीक एक बिंदु पर छूती हैं"),
          feedback: t(
            "Every tangent touches at one point, and most pairs aren't parallel. The reason is the shared perpendicular.",
            "हर स्पर्श रेखा एक बिंदु पर छूती है, और ज़्यादातर जोड़े समांतर नहीं होते। कारण साझा लंब है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const q9 = choiceQuestion(b, {
      name: "q9",
      prompt: t(
        "Exercise 10.2 Q9: XY and X′Y′ are parallel tangents, and the tangent AB touches at C, meeting them at A and B. What is ∠AOB?",
        "प्रश्नावली 10.2 प्र9: XY और X′Y′ समांतर स्पर्श रेखाएँ हैं, और स्पर्श रेखा AB, C पर छूती है और उनसे A और B पर मिलती है। ∠AOB क्या है?",
      ),
      options: [
        { id: "right", label: t("90°", "90°") },
        {
          id: "oneeighty",
          label: t("180°", "180°"),
          feedback: t(
            "From A there are two tangents to the circle: AC and the piece AP of XY. As on the bisect page, OA halves the angle between them. Same at B. Those two angles add to 180° (co-interior), so ∠OAB + ∠OBA = 90°, leaving 90° for ∠AOB.",
            "A से वृत्त पर दो स्पर्श रेखाएँ हैं: AC और XY का टुकड़ा AP। समद्विभाजन वाले पेज की तरह, OA उनके बीच के कोण को आधा करता है। B पर भी ऐसा ही। वे दोनों कोण मिलकर 180° हैं (सह-आंतरिक), तो ∠OAB + ∠OBA = 90°, और ∠AOB के लिए 90° बचता है।",
          ),
        },
        {
          id: "sixty",
          label: t("60°", "60°"),
          feedback: t(
            "∠OAB + ∠OBA = ½ × 180° = 90°, so in ∆ AOB the angle at O is 90°.",
            "∠OAB + ∠OBA = ½ × 180° = 90°, इसलिए ∆ AOB में O पर कोण 90° है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const q9fig = figureOn(b, "q9Figure", {
      points: [
        { name: "O", at: [0, 0], prefer: 180 },
        { name: "X", at: [-3, 2], prefer: 90 },
        { name: "Y", at: [4.2, 2], prefer: 90 },
        { name: "X′", at: [-3, -2], prefer: 270 },
        { name: "Y′", at: [4.2, -2], prefer: 270 },
        { name: "P", at: [0, 2], prefer: 90 },
        { name: "Q", at: [0, -2], prefer: 270 },
        { name: "A", at: [1.4, 2], prefer: 60 },
        { name: "B", at: [2.86, -2], prefer: 300 },
        { name: "C", at: [1.88, 0.68], prefer: 0 },
      ],
      items: [
        { kind: "circle", c: "O", r: 2 },
        { kind: "seg", a: "X", b: "Y" },
        { kind: "seg", a: "X′", b: "Y′" },
        { kind: "seg", a: "A", b: "B", tone: "accent" },
        { kind: "seg", a: "O", b: "A", tone: "result" },
        { kind: "seg", a: "O", b: "B", tone: "result" },
        { kind: "seg", a: "O", b: "P", dashed: true },
        { kind: "seg", a: "O", b: "Q", dashed: true },
        { kind: "seg", a: "O", b: "C", dashed: true },
      ],
      captions: [
        {
          en: "XY and X′Y′ touch the circle at P and Q. AB touches it at C. Find ∠AOB.",
          hi: "XY और X′Y′ वृत्त को P और Q पर छूती हैं। AB इसे C पर छूती है। ∠AOB निकालो।",
        },
      ],
      about:
        "A circle with centre O between two parallel tangents, XY on top touching at P and X′Y′ below touching at Q; a third tangent touches at C and meets XY at A and X′Y′ at B; OA and OB are joined",
      height: 220,
    });
    const log = w.definition(
      t(
        "**Mission log: Chapter 10 done.** (1) A line meets a circle in 0, 1 or 2 points. (2) Exactly one tangent at each point; it is a secant whose two points have met. (3) Theorem 10.1: tangent ⟂ radius, which is why the hub glides straight. (4) Theorem 10.2: two tangents from an outside point are equal. (5) With them: the tyre's chord, the angles at the chain, circles inside shapes. Riya knows how every part touches. Next chapter: draw it all exactly, with compass and ruler.",
        "**मिशन लॉग: अध्याय 10 पूरा।** (1) रेखा वृत्त से 0, 1 या 2 बिंदुओं पर मिलती है। (2) हर बिंदु पर ठीक एक स्पर्श रेखा; यह वह छेदक है जिसके दोनों बिंदु मिल गए। (3) प्रमेय 10.1: स्पर्श रेखा ⟂ त्रिज्या, इसीलिए हब सीधा सरकता है। (4) प्रमेय 10.2: बाहर के बिंदु से दोनों स्पर्श रेखाएँ बराबर। (5) इनसे: टायर की जीवा, चेन पर कोण, आकृतियों के अंदर वृत्त। रिया जानती है कि हर हिस्सा कैसे छूता है। अगला अध्याय: सब कुछ परकार और रूलर से ठीक-ठीक बनाना।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(q9.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), q2, q3, q4, q9fig, q9, log, space()]);
  },
  { passOn: PassOn.Rules },
);

export const overview = [hook, concentric, angles, example3, inscribed, incircle, inLife, yourTurn];

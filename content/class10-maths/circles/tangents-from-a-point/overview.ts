import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, goalQuestion, wordsOn } from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  CirclesSceneKind,
  TangentsAction,
  TangentsDerived,
  tangentsFromPointDef,
} from "@chalk/prop-circles";
import { sceneOn } from "../kit";

const r = String.raw;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** The chain leaves the sprocket along tangents. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const chain = sceneOn(
    b,
    "chain",
    CirclesSceneKind.ChainSprockets,
    "Kabir by the cycle with the chain cover off: the chain's two straight runs leave the big front sprocket and the small rear sprocket, each just touching them",
  );
  return column([
    w.title(t("Two straight runs", "दो सीधे हिस्से")),
    chain,
    w.body(
      t(
        "Last time: the radius at the point of contact is perpendicular to the tangent. Now Kabir takes the chain cover off. The chain wraps round each sprocket and leaves it in two straight runs, one above and one below, each a tangent to the sprocket.",
        "पिछली बार: स्पर्श बिंदु पर त्रिज्या स्पर्श रेखा पर लंब है। अब कबीर चेन का ढक्कन खोलता है। चेन हर गरारी पर लिपटती है और उसे दो सीधे हिस्सों में छोड़ती है, एक ऊपर और एक नीचे, हर एक गरारी की स्पर्श रेखा।",
      ),
    ),
    w.body(
      t(
        "Riya wonders about a simpler picture for the poster: one point outside a circle. How many tangents can you draw from it, and how do they compare?",
        "रिया पोस्टर के लिए एक आसान चित्र सोचती है: वृत्त के बाहर एक बिंदु। उससे कितनी स्पर्श रेखाएँ खींच सकते हैं, और उनकी तुलना कैसी है?",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Activity 3: P inside, on, outside. */
const cases = page(
  "cases",
  (b) => {
    const w = wordsOn(b);
    const point = b.prop(tangentsFromPointDef, "point", {
      r: 3,
      d: 1,
      step: 1,
      names: ["O", "P", "Q", "R"],
      canMove: true,
      showRadii: false,
      showLengths: false,
      showBisector: false,
      showAngles: false,
      showCount: true,
    });
    b.studentOnly(point.action(TangentsAction.Move));
    b.standsFor(
      point,
      "a circle with centre O and a point P that the learner moves away from the centre; the picture draws every tangent from P and says how many there are",
    );
    const goal = goalQuestion(b, {
      about: point,
      prompt: t(
        "Move P out from the centre until two tangents can be drawn from it.",
        "P को केंद्र से बाहर की ओर तब तक ले जाओ जब तक उससे दो स्पर्श रेखाएँ न खिंच सकें।",
      ),
      isMet: point.derived(TangentsDerived.TangentCount).eq(2),
      solve: Array.from({ length: 3 }, () => point.learner(TangentsAction.Move, { by: 1 })),
    });
    return column([
      w.title(t("Inside, on, outside", "अंदर, पर, बाहर")),
      w.body(
        t(
          "Activity 3. Take a point P and try to draw tangents to the circle through it. Start with P inside the circle.",
          "क्रियाकलाप 3। एक बिंदु P लो और उससे वृत्त की स्पर्श रेखाएँ खींचने की कोशिश करो। शुरुआत P को वृत्त के अंदर रखकर करो।",
        ),
      ),
      point,
      goal,
      w.definition(
        t(
          "**Tangents from a point.** **Case 1:** through a point **inside** a circle there is **no** tangent; every line through it cuts the circle twice. **Case 2:** through a point **on** the circle there is **one and only one** tangent. **Case 3:** through a point **outside** the circle there are **exactly two** tangents.",
          "**एक बिंदु से स्पर्श रेखाएँ।** **स्थिति 1:** वृत्त के **अंदर** के बिंदु से **कोई** स्पर्श रेखा नहीं जाती; उससे होकर जाने वाली हर रेखा वृत्त को दो बार काटती है। **स्थिति 2:** वृत्त **पर** के बिंदु से **एक और केवल एक** स्पर्श रेखा जाती है। **स्थिति 3:** वृत्त के **बाहर** के बिंदु से **ठीक दो** स्पर्श रेखाएँ जाती हैं।",
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Length of a tangent; the two lengths look equal. */
const length = page(
  "length",
  (b) => {
    const w = wordsOn(b);
    const point = b.prop(tangentsFromPointDef, "point", {
      r: 3,
      d: 5,
      step: 1,
      names: ["O", "P", "Q", "R"],
      canMove: true,
      showRadii: false,
      showLengths: true,
      showBisector: false,
      showAngles: false,
      showCount: false,
    });
    b.studentOnly(point.action(TangentsAction.Move));
    b.standsFor(
      point,
      "a circle with centre O and a point P outside it with the two tangents PQ and PR; both lengths are written, and the learner can move P nearer or farther",
    );
    const same = choiceQuestion(b, {
      name: "same",
      prompt: t(
        "Move P nearer and farther. What do you notice about PQ and PR?",
        "P को पास और दूर ले जाओ। PQ और PR के बारे में तुम्हें क्या दिखता है?",
      ),
      options: [
        { id: "right", label: t("They are always equal", "वे हमेशा बराबर हैं") },
        {
          id: "upper",
          label: t("The upper one is always longer", "ऊपर वाली हमेशा लंबी है"),
          feedback: t(
            "Read the two numbers again at a few places: they match every time.",
            "कुछ जगहों पर दोनों संख्याएँ फिर पढ़ो: हर बार वे मिलती हैं।",
          ),
        },
        {
          id: "near",
          label: t("They're equal only when P is near", "वे केवल P के पास होने पर बराबर हैं"),
          feedback: t(
            "Try P far away too: the two lengths grow together and stay equal.",
            "P को दूर भी ले जाओ: दोनों लंबाइयाँ साथ बढ़ती हैं और बराबर रहती हैं।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("The length of a tangent", "स्पर्श रेखा की लंबाई")),
      w.definition(
        t(
          "**Length of a tangent.** For a point P outside a circle, the segment of a tangent from P to its point of contact is called the **length of the tangent** from P to the circle. With two tangents PQ and PR, their lengths are PQ and PR.",
          "**स्पर्श रेखा की लंबाई।** वृत्त के बाहर के बिंदु P के लिए, P से स्पर्श बिंदु तक के स्पर्श रेखा-खंड को P से वृत्त तक **स्पर्श रेखा की लंबाई** कहते हैं। दो स्पर्श रेखाएँ PQ और PR हों तो उनकी लंबाइयाँ PQ और PR हैं।",
        ),
      ),
      point,
      same,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Theorem 10.2 by RHS. */
const theorem = page(
  "theorem",
  (b) => {
    const w = wordsOn(b);
    const point = b.prop(tangentsFromPointDef, "point", {
      r: 3,
      d: 5,
      step: 1,
      names: ["O", "P", "Q", "R"],
      canMove: false,
      showRadii: true,
      showLengths: false,
      showBisector: true,
      showAngles: false,
      showCount: false,
    });
    b.standsFor(
      point,
      "a circle with centre O and a point P outside it, the tangents PQ and PR, the radii OQ and OR with right-angle marks at Q and R, and the segment OP",
    );
    const rule = choiceQuestion(b, {
      name: "rule",
      prompt: t(
        "Which congruence rule does the proof use for ∆ OQP and ∆ ORP?",
        "उपपत्ति ∆ OQP और ∆ ORP के लिए कौन-सा सर्वांगसमता नियम लेती है?",
      ),
      options: [
        { id: "right", label: t("RHS", "RHS") },
        {
          id: "sss",
          label: t("SSS", "SSS"),
          feedback: t(
            "SSS needs all three sides equal, but PQ = PR is what we're trying to prove. We know a right angle, the hypotenuse OP and one side.",
            "SSS के लिए तीनों भुजाएँ बराबर चाहिए, पर PQ = PR तो हमें सिद्ध करना है। हम एक समकोण, कर्ण OP और एक भुजा जानते हैं।",
          ),
        },
        {
          id: "asa",
          label: t("ASA", "ASA"),
          feedback: t(
            "We only know one angle in each (the right angle). What we have is a right angle, the hypotenuse and a side: RHS.",
            "हम हर एक में केवल एक कोण जानते हैं (समकोण)। हमारे पास समकोण, कर्ण और एक भुजा है: RHS।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Theorem 10.2", "प्रमेय 10.2")),
      w.definition(
        t(
          "**Theorem 10.2.** The lengths of tangents drawn from an external point to a circle are equal.",
          "**प्रमेय 10.2।** किसी बाह्य बिंदु से वृत्त पर खींची गई स्पर्श रेखाओं की लंबाइयाँ बराबर होती हैं।",
        ),
      ),
      point,
      w.body(
        t(
          "**Given:** a circle with centre O, a point P outside it and two tangents PQ, PR. **To prove:** PQ = PR.",
          "**दिया है:** केंद्र O वाला एक वृत्त, उसके बाहर एक बिंदु P और दो स्पर्श रेखाएँ PQ, PR। **सिद्ध करना है:** PQ = PR।",
        ),
      ),
      w.body(
        t(
          r`**Proof.** Join OP, OQ and OR. By Theorem 10.1, the radius is perpendicular to the tangent at the point of contact: $$\angle OQP = \angle ORP = 90^\circ$$ In right triangles OQP and ORP: $$OQ = OR \quad \text{(radii of the same circle)}$$ $$OP = OP \quad \text{(common)}$$ So, by RHS congruence, $$\triangle OQP \cong \triangle ORP$$ and corresponding parts of congruent triangles are equal: $$PQ = PR$$`,
          r`**उपपत्ति।** OP, OQ और OR को मिलाओ। प्रमेय 10.1 से, स्पर्श बिंदु पर त्रिज्या स्पर्श रेखा पर लंब है: $$\angle OQP = \angle ORP = 90^\circ$$ समकोण त्रिभुजों OQP और ORP में: $$OQ = OR \quad \text{(एक ही वृत्त की त्रिज्याएँ)}$$ $$OP = OP \quad \text{(उभयनिष्ठ)}$$ तो RHS सर्वांगसमता से, $$\triangle OQP \cong \triangle ORP$$ और सर्वांगसम त्रिभुजों के संगत भाग बराबर होते हैं: $$PQ = PR$$`,
        ),
      ),
      rule,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Remarks: a Pythagoras proof, and OP bisects ∠QPR. */
const bisect = page(
  "bisect",
  (b) => {
    const w = wordsOn(b);
    const point = b.prop(tangentsFromPointDef, "point", {
      r: 3,
      d: 5,
      step: 1,
      names: ["O", "P", "Q", "R"],
      canMove: true,
      showRadii: true,
      showLengths: false,
      showBisector: true,
      showAngles: true,
      showCount: false,
    });
    b.studentOnly(point.action(TangentsAction.Move));
    b.standsFor(
      point,
      "a circle with centre O, a point P outside it with tangents PQ and PR, the segment OP, and the angle QPR between the tangents and the angle QOR at the centre marked; the learner can move P",
    );
    const half = choiceQuestion(b, {
      name: "half",
      prompt: t(
        "The tangents from P make ∠QPR = 60°. What is ∠OPQ?",
        "P से स्पर्श रेखाएँ ∠QPR = 60° बनाती हैं। ∠OPQ क्या है?",
      ),
      options: [
        { id: "right", label: t("30°", "30°") },
        {
          id: "sixty",
          label: t("60°", "60°"),
          feedback: t(
            "OP splits ∠QPR into two equal halves, so each is 60° ÷ 2.",
            "OP, ∠QPR को दो बराबर आधों में बाँटता है, तो हर एक 60° ÷ 2 है।",
          ),
        },
        {
          id: "onetwenty",
          label: t("120°", "120°"),
          feedback: t(
            "120° is the angle at the centre, ∠QOR. ∠OPQ is half the angle at P: 60° ÷ 2.",
            "120° केंद्र पर का कोण ∠QOR है। ∠OPQ, P पर के कोण का आधा है: 60° ÷ 2।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("More from the same picture", "उसी चित्र से और")),
      w.body(
        t(
          r`**Another proof, by Pythagoras.** In the right triangles OQP and ORP, $$PQ^2 = OP^2 - OQ^2$$ $$PR^2 = OP^2 - OR^2$$ Since OQ = OR, the right sides are equal, so $$PQ^2 = PR^2$$ $$PQ = PR$$`,
          r`**एक और उपपत्ति, पाइथागोरस से।** समकोण त्रिभुजों OQP और ORP में, $$PQ^2 = OP^2 - OQ^2$$ $$PR^2 = OP^2 - OR^2$$ क्योंकि OQ = OR, दाएँ पक्ष बराबर हैं, इसलिए $$PQ^2 = PR^2$$ $$PQ = PR$$`,
        ),
      ),
      w.definition(
        t(
          "**OP bisects the angle.** From the congruence, ∠OPQ = ∠OPR. So OP is the **angle bisector** of ∠QPR: the centre lies on the bisector of the angle between the two tangents.",
          "**OP कोण को समद्विभाजित करता है।** सर्वांगसमता से ∠OPQ = ∠OPR। तो OP, ∠QPR का **कोण समद्विभाजक** है: केंद्र दोनों स्पर्श रेखाओं के बीच के कोण के समद्विभाजक पर होता है।",
        ),
      ),
      point,
      half,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** A rope over the well pulley, tied to a peg. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const well = sceneOn(
      b,
      "well",
      CirclesSceneKind.WellPulley,
      "Grandpa's well, with the rope over the round pulley",
    );
    const rope = choiceQuestion(b, {
      name: "rope",
      prompt: t(
        "Grandpa loops a rope round the pulley and pulls both ends tight to one peg P on the frame. The two straight pieces run from P to the rim. Which is true?",
        "दादाजी रस्सी को घिरनी पर लपेटकर दोनों सिरे फ़्रेम की एक खूँटी P पर कसकर खींचते हैं। दोनों सीधे टुकड़े P से किनारे तक जाते हैं। कौन-सा सच है?",
      ),
      options: [
        { id: "right", label: t("The two pieces are equal", "दोनों टुकड़े बराबर हैं") },
        {
          id: "longer",
          label: t("The piece on the lower side is longer", "नीचे वाला टुकड़ा लंबा है"),
          feedback: t(
            "Each piece is a tangent from the same point P, and tangents from one external point are equal.",
            "हर टुकड़ा एक ही बिंदु P से स्पर्श रेखा है, और एक बाह्य बिंदु से स्पर्श रेखाएँ बराबर होती हैं।",
          ),
        },
        {
          id: "depends",
          label: t("It depends on the pulley's size", "यह घिरनी के आकार पर निर्भर है"),
          feedback: t(
            "The size changes how long both pieces are, not whether they match. From one point, the two tangents are always equal.",
            "आकार से दोनों टुकड़ों की लंबाई बदलती है, उनका बराबर होना नहीं। एक बिंदु से दोनों स्पर्श रेखाएँ हमेशा बराबर होती हैं।",
          ),
        },
      ],
      answer: "right",
    });
    const poster = w.body(
      t(
        "And the peg sits on the line through the pulley's centre that halves the angle between the pieces. Riya draws it for the poster: **two tangents from one point are equal, and the centre is on the bisector.**",
        "और खूँटी घिरनी के केंद्र से जाने वाली उस रेखा पर है जो दोनों टुकड़ों के बीच के कोण को आधा करती है। रिया इसे पोस्टर के लिए बनाती है: **एक बिंदु से दो स्पर्श रेखाएँ बराबर, और केंद्र समद्विभाजक पर।**",
      ),
      "poster",
      { isHidden: true },
    );
    b.when(rope.on(QuestionSignal.Correct), theBoard.show(poster));
    return column([
      w.title(t("The peg and the pulley", "खूँटी और घिरनी")),
      well,
      rope,
      poster,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Exercise 10.2 Q1 and Q6; the mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const q1 = choiceQuestion(b, {
      name: "q1",
      prompt: t(
        "Exercise 10.2 Q1: from a point Q, the tangent is 24 cm long and Q is 25 cm from the centre. Find the radius.",
        "प्रश्नावली 10.2 प्र1: बिंदु Q से स्पर्श रेखा 24 cm लंबी है और Q केंद्र से 25 cm दूर है। त्रिज्या ज्ञात करो।",
      ),
      options: [
        { id: "right", label: t("7 cm", "7 cm") },
        {
          id: "one",
          label: t("1 cm", "1 cm"),
          feedback: t(
            "Subtract the squares, not the lengths: r² = 25² − 24² = 49.",
            "लंबाइयाँ नहीं, वर्ग घटाओ: r² = 25² − 24² = 49।",
          ),
        },
        {
          id: "twelve",
          label: t("12 cm", "12 cm"),
          feedback: t(
            "That's half of 24. The radius, the tangent and OQ form a right triangle with OQ = 25 as hypotenuse.",
            "यह 24 का आधा है। त्रिज्या, स्पर्श रेखा और OQ एक समकोण त्रिभुज बनाते हैं जिसका कर्ण OQ = 25 है।",
          ),
        },
        {
          id: "half",
          label: t("24.5 cm", "24.5 cm"),
          feedback: t(
            "That's the average of 24 and 25. Use the right angle at the point of contact.",
            "यह 24 और 25 का औसत है। स्पर्श बिंदु पर समकोण का उपयोग करो।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const q6 = choiceQuestion(b, {
      name: "q6",
      prompt: t(
        "Exercise 10.2 Q6: a point A is 5 cm from the centre and the tangent from A is 4 cm. Find the radius.",
        "प्रश्नावली 10.2 प्र6: बिंदु A केंद्र से 5 cm दूर है और A से स्पर्श रेखा 4 cm है। त्रिज्या ज्ञात करो।",
      ),
      options: [
        { id: "right", label: t("3 cm", "3 cm") },
        {
          id: "root41",
          label: t("√41 cm", "√41 cm"),
          feedback: t(
            "You added the squares. The 5 cm is the hypotenuse, so subtract: r² = 5² − 4² = 9.",
            "तुमने वर्ग जोड़ दिए। 5 cm कर्ण है, इसलिए घटाओ: r² = 5² − 4² = 9।",
          ),
        },
        {
          id: "one",
          label: t("1 cm", "1 cm"),
          feedback: t(
            "That's 5 − 4. With a right angle, subtract the squares: 25 − 16 = 9.",
            "यह 5 − 4 है। समकोण हो तो वर्ग घटाओ: 25 − 16 = 9।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ No tangent from inside, one from a point on the circle, two from outside. ✓ Theorem 10.2: the two tangents from an outside point are equal, and the centre lies on the bisector of the angle between them. Next: put both theorems to work on the poster's trickier shapes.",
        "**मिशन लॉग।** ✓ अंदर से कोई स्पर्श रेखा नहीं, वृत्त पर के बिंदु से एक, बाहर से दो। ✓ प्रमेय 10.2: बाहर के बिंदु से दोनों स्पर्श रेखाएँ बराबर हैं, और केंद्र उनके बीच के कोण के समद्विभाजक पर है। आगे: दोनों प्रमेयों को पोस्टर की कठिन आकृतियों पर लगाना।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(q6.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), q1, q6, log, space()]);
  },
  { passOn: PassOn.Rules },
);

export const overview = [hook, cases, length, theorem, bisect, inLife, yourTurn];

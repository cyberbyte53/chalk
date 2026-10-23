import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, goalQuestion, wordsOn } from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  CirclesSceneKind,
  LineCircleAction,
  LineCircleMode,
  lineCircleDef,
} from "@chalk/prop-circles";
import { sceneOn } from "../kit";

const r = String.raw;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** Fig 10.4: the spoke at the point of contact. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const wheel = sceneOn(
    b,
    "wheel",
    CirclesSceneKind.WheelRoad,
    "close up of the front wheel on the road: the spoke to the point of contact stands straight up from the road, with a small right-angle mark",
  );
  return column([
    w.title(t("The spoke stands straight", "तीली सीधी खड़ी है")),
    wheel,
    w.body(
      t(
        "Last time: every point of the wheel has exactly one tangent, and the road is the tangent at the point that touches it. Kabir lies on the floor and looks along the road. The spoke that goes down to the touching point stands straight up, at right angles to the road.",
        "पिछली बार: पहिये के हर बिंदु पर ठीक एक स्पर्श रेखा है, और सड़क उस बिंदु की स्पर्श रेखा है जो उसे छूता है। कबीर फ़र्श पर लेटकर सड़क की सीध में देखता है। जो तीली नीचे छूने वाले बिंदु तक जाती है, वह सड़क से समकोण पर सीधी खड़ी है।",
      ),
    ),
    w.body(
      t(
        "He rolls the cycle a little and looks again. Still straight up. Is the radius to the point of contact always perpendicular to the tangent? Looking isn't proof. This lesson proves it.",
        "वह साइकिल थोड़ा लुढ़काकर फिर देखता है। अब भी सीधी खड़ी। क्या स्पर्श बिंदु तक की त्रिज्या हमेशा स्पर्श रेखा पर लंब होती है? देखना प्रमाण नहीं है। यह पाठ इसे सिद्ध करता है।",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** The shortest distance from O to the tangent. */
const shortest = page(
  "shortest",
  (b) => {
    const w = wordsOn(b);
    const line = b.prop(lineCircleDef, "line", {
      mode: LineCircleMode.Shortest,
      r: 3,
      along: 3,
      step: 0.75,
      names: ["O", "P", "Q", "X", "Y"],
      canMove: true,
      showKind: false,
      showRadius: true,
      showChord: false,
    });
    b.studentOnly(line.action(LineCircleAction.Move));
    b.standsFor(
      line,
      "a circle with centre O and the tangent XY at the point P; a point Q slides along the tangent and the length OQ is written, always more than the radius OP except when Q is at P",
    );
    const goal = goalQuestion(b, {
      about: line,
      prompt: t(
        "Slide Q along the tangent to the place where OQ is shortest.",
        "Q को स्पर्श रेखा पर उस जगह खिसकाओ जहाँ OQ सबसे छोटा हो।",
      ),
      isMet: line.field("along").eq(0),
      solve: Array.from({ length: 4 }, () => line.learner(LineCircleAction.Move, { by: -1 })),
    });
    const seen = w.body(
      t(
        "OQ is shortest when Q is at P, and there it equals the radius OP. Everywhere else on the tangent, Q is outside the circle, so OQ is longer.",
        "OQ सबसे छोटा तब है जब Q, P पर हो, और वहाँ वह त्रिज्या OP के बराबर है। स्पर्श रेखा पर बाक़ी हर जगह Q वृत्त के बाहर है, इसलिए OQ लंबा है।",
      ),
      "seen",
      { isHidden: true },
    );
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(seen));
    return column([
      w.title(t("The shortest way to the line", "रेखा तक सबसे छोटा रास्ता")),
      w.definition(
        t(
          "**Shortest distance to a line.** Of all the segments from a point to a line, the shortest is the perpendicular one. (You met this in Class 9.) The length of that perpendicular is called the distance of the point from the line.",
          "**किसी रेखा तक सबसे छोटी दूरी।** किसी बिंदु से एक रेखा तक के सभी रेखाखंडों में सबसे छोटा वह है जो लंब हो। (यह तुमने कक्षा 9 में देखा था।) उस लंब की लंबाई को बिंदु की रेखा से दूरी कहते हैं।",
        ),
      ),
      w.body(
        t(
          "Here XY is the tangent at P. Slide Q along XY and watch the length OQ.",
          "यहाँ XY, P पर स्पर्श रेखा है। Q को XY पर खिसकाओ और लंबाई OQ देखो।",
        ),
      ),
      line,
      goal,
      seen,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Theorem 10.1, proved one step per line. */
const proof = page(
  "proof",
  (b) => {
    const w = wordsOn(b);
    const line = b.prop(lineCircleDef, "line", {
      mode: LineCircleMode.Shortest,
      r: 3,
      along: 2,
      step: 0.75,
      names: ["O", "P", "Q", "X", "Y"],
      canMove: true,
      showKind: false,
      showRadius: true,
      showChord: false,
    });
    b.studentOnly(line.action(LineCircleAction.Move));
    b.standsFor(
      line,
      "the circle with centre O and the tangent XY at P, with a point Q on XY away from P and the length OQ written beside the radius OP; Q can still be slid",
    );
    const why = choiceQuestion(b, {
      name: "why",
      prompt: t(
        "In the proof, why must Q lie outside the circle?",
        "उपपत्ति में Q को वृत्त के बाहर क्यों होना चाहिए?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "If Q were inside, XY would cut the circle twice",
            "Q अंदर होता तो XY वृत्त को दो बार काटती",
          ),
        },
        {
          id: "far",
          label: t("Because Q is far away from the point P", "क्योंकि Q, बिंदु P से बहुत दूर है"),
          feedback: t(
            "Q can be very close to P. It's outside because a line through a point inside the circle would be a secant, not a tangent.",
            "Q, P के बहुत पास भी हो सकता है। वह बाहर इसलिए है क्योंकि वृत्त के अंदर के बिंदु से जाने वाली रेखा छेदक होती, स्पर्श रेखा नहीं।",
          ),
        },
        {
          id: "on",
          label: t("Because OQ is the same as the radius", "क्योंकि OQ त्रिज्या के बराबर है"),
          feedback: t(
            "If OQ equalled the radius, Q would be on the circle, a second common point. That's the very thing that can't happen.",
            "अगर OQ त्रिज्या के बराबर होता तो Q वृत्त पर होता, एक दूसरा साझा बिंदु। ठीक यही तो नहीं हो सकता।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Theorem 10.1", "प्रमेय 10.1")),
      line,
      w.definition(
        t(
          "**Theorem 10.1.** The tangent at any point of a circle is perpendicular to the radius through the point of contact.",
          "**प्रमेय 10.1।** वृत्त के किसी बिंदु पर स्पर्श रेखा, स्पर्श बिंदु से जाने वाली त्रिज्या पर लंब होती है।",
        ),
      ),
      w.body(
        t(
          "**Given:** a circle with centre O and a tangent XY at the point P. **To prove:** OP ⊥ XY.",
          "**दिया है:** केंद्र O वाला एक वृत्त और बिंदु P पर स्पर्श रेखा XY। **सिद्ध करना है:** OP ⊥ XY।",
        ),
      ),
      w.body(
        t(
          r`**Proof.** Take any point Q on XY other than P, and join OQ. Q must lie outside the circle: if it were inside, XY would be a secant, not a tangent. So OQ is longer than the radius OP of the circle: $$OQ > OP$$ This is true for every point of XY except P. So OP is the shortest of all the distances from O to the points of XY. The shortest distance from a point to a line is the perpendicular one, so $$OP \perp XY$$`,
          r`**उपपत्ति।** XY पर P के अलावा कोई बिंदु Q लो, और OQ को मिलाओ। Q को वृत्त के बाहर होना ही चाहिए: अंदर होता तो XY एक छेदक होती, स्पर्श रेखा नहीं। इसलिए OQ वृत्त की त्रिज्या OP से लंबा है: $$OQ > OP$$ यह XY के P को छोड़कर हर बिंदु के लिए सच है। तो O से XY के बिंदुओं तक की सभी दूरियों में OP सबसे छोटी है। किसी बिंदु से रेखा तक की सबसे छोटी दूरी लंब वाली होती है, इसलिए $$OP \perp XY$$`,
        ),
      ),
      why,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The two remarks: one tangent at a point, and the normal. */
const normal = page(
  "normal",
  (b) => {
    const w = wordsOn(b);
    const through = choiceQuestion(b, {
      name: "through",
      prompt: t(
        "At P, draw the line perpendicular to the tangent. Which point must it pass through?",
        "P पर स्पर्श रेखा पर लंब रेखा खींचो। उसे किस बिंदु से होकर जाना ही होगा?",
      ),
      options: [
        { id: "right", label: t("The centre O", "केंद्र O") },
        {
          id: "top",
          label: t("The point opposite P on the tangent", "स्पर्श रेखा पर P के सामने वाला बिंदु"),
          feedback: t(
            "The perpendicular at P leaves the tangent at P; it doesn't meet the tangent anywhere else.",
            "P पर लंब स्पर्श रेखा को P पर छोड़ देता है; वह स्पर्श रेखा से कहीं और नहीं मिलता।",
          ),
        },
        {
          id: "chord",
          label: t("The midpoint of any chord", "किसी भी जीवा का मध्य-बिंदु"),
          feedback: t(
            "Only chords perpendicular to it are bisected by it. What it always passes through is the centre, since OP ⊥ tangent.",
            "यह केवल अपने पर लंब जीवाओं को समद्विभाजित करता है। यह हमेशा केंद्र से जाता है, क्योंकि OP ⊥ स्पर्श रेखा।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Two things that follow", "दो बातें जो आगे निकलती हैं")),
      w.definition(
        t(
          "**Remarks.** (1) At any point on a circle there is one and only one tangent: the line through that point perpendicular to the radius. (2) The line containing the radius through the point of contact is called the **normal** to the circle at that point.",
          "**टिप्पणियाँ।** (1) वृत्त के किसी भी बिंदु पर एक और केवल एक स्पर्श रेखा होती है: उस बिंदु से त्रिज्या पर लंब रेखा। (2) स्पर्श बिंदु से जाने वाली त्रिज्या जिस रेखा पर है, उसे उस बिंदु पर वृत्त का **अभिलंब** कहते हैं।",
        ),
      ),
      w.body(
        t(
          "So the perpendicular to a tangent at its point of contact always passes through the centre. (This is Exercise 10.2 Q5.)",
          "इसलिए स्पर्श रेखा पर उसके स्पर्श बिंदु पर खींचा गया लंब हमेशा केंद्र से होकर जाता है। (यह प्रश्नावली 10.2 प्र5 है।)",
        ),
      ),
      through,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** Back to the wheel: the spoke and the hub. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const wheel = sceneOn(
      b,
      "wheel",
      CirclesSceneKind.WheelRoad,
      "the front wheel on the road, the spoke to the point of contact at right angles to the road",
    );
    const hub = choiceQuestion(b, {
      name: "hub",
      prompt: t(
        "The road is flat. As the wheel rolls, how does the hub (the centre) move?",
        "सड़क समतल है। पहिया लुढ़कता है तो हब (केंद्र) कैसे चलता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "In a straight line, one radius above the road",
            "सीधी रेखा में, सड़क से एक त्रिज्या ऊपर",
          ),
        },
        {
          id: "bob",
          label: t(
            "Up and down, rising as each spoke comes round",
            "ऊपर-नीचे, हर तीली के घूमकर आने पर उठता हुआ",
          ),
          feedback: t(
            "The radius to the touching point is always perpendicular to the road, so the centre is always exactly one radius straight above it.",
            "छूने वाले बिंदु तक की त्रिज्या हमेशा सड़क पर लंब है, इसलिए केंद्र हमेशा उसके ठीक एक त्रिज्या ऊपर रहता है।",
          ),
        },
        {
          id: "lower",
          label: t("Slowly lower, as the tyre flattens out", "धीरे-धीरे नीचे, जैसे-जैसे टायर चपटा होता है"),
          feedback: t(
            "A round wheel doesn't flatten. Its centre stays one radius above the road, along the perpendicular.",
            "गोल पहिया चपटा नहीं होता। उसका केंद्र लंब के साथ सड़क से एक त्रिज्या ऊपर रहता है।",
          ),
        },
      ],
      answer: "right",
    });
    const smooth = w.body(
      t(
        "That's why the ride is smooth: the hub, where Kabir's weight rests, glides along a straight line. Riya draws the spoke with a little square at the road and writes: **tangent ⟂ radius at the point of contact.**",
        "इसीलिए सवारी आरामदेह है: हब, जिस पर कबीर का भार टिका है, एक सीधी रेखा पर सरकता है। रिया तीली को सड़क पर एक छोटे वर्ग के साथ बनाती है और लिखती है: **स्पर्श बिंदु पर स्पर्श रेखा ⟂ त्रिज्या।**",
      ),
      "smooth",
      { isHidden: true },
    );
    b.when(hub.on(QuestionSignal.Correct), theBoard.show(smooth));
    return column([
      w.title(t("Why the ride is smooth", "सवारी आरामदेह क्यों है")),
      wheel,
      hub,
      smooth,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Exercise 10.1 Q3, worked, then the mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const pq = choiceQuestion(b, {
      name: "pq",
      prompt: t(
        "Exercise 10.1 Q3: the tangent PQ at P meets a line through the centre O at Q. The radius is 5 cm and OQ = 12 cm. Find PQ.",
        "प्रश्नावली 10.1 प्र3: P पर स्पर्श रेखा PQ, केंद्र O से जाने वाली रेखा से Q पर मिलती है। त्रिज्या 5 cm है और OQ = 12 cm। PQ ज्ञात करो।",
      ),
      options: [
        { id: "right", label: t("√119 cm", "√119 cm") },
        {
          id: "thirteen",
          label: t("13 cm", "13 cm"),
          feedback: t(
            "13 would be the hypotenuse if 5 and 12 were the two shorter sides. Here OQ = 12 is the hypotenuse, opposite the right angle at P.",
            "13 कर्ण होता अगर 5 और 12 दो छोटी भुजाएँ होतीं। यहाँ OQ = 12 कर्ण है, P पर समकोण के सामने।",
          ),
        },
        {
          id: "seven",
          label: t("7 cm", "7 cm"),
          feedback: t(
            "Subtract the squares, not the lengths: PQ² = 12² − 5² = 119.",
            "लंबाइयाँ नहीं, वर्ग घटाओ: PQ² = 12² − 5² = 119।",
          ),
        },
        {
          id: "half",
          label: t("8.5 cm", "8.5 cm"),
          feedback: t(
            "That's the average of 5 and 12. Use the right angle at P: PQ² = OQ² − OP².",
            "यह 5 और 12 का औसत है। P पर समकोण लो: PQ² = OQ² − OP²।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const worked = w.body(
      t(
        r`The radius OP is perpendicular to the tangent, so ∆ OPQ has a right angle at P and OQ is its hypotenuse: $$PQ^2 = OQ^2 - OP^2 = 12^2 - 5^2$$ $$PQ^2 = 144 - 25 = 119$$ $$PQ = \sqrt{119} \text{ cm}$$`,
        r`त्रिज्या OP स्पर्श रेखा पर लंब है, इसलिए ∆ OPQ में P पर समकोण है और OQ उसका कर्ण है: $$PQ^2 = OQ^2 - OP^2 = 12^2 - 5^2$$ $$PQ^2 = 144 - 25 = 119$$ $$PQ = \sqrt{119} \text{ cm}$$`,
      ),
      "worked",
      { isHidden: true },
    );
    b.when(pq.on(QuestionSignal.Correct), theBoard.show(worked));
    const angle = choiceQuestion(b, {
      name: "angle",
      prompt: t(
        "A tangent touches a circle at A, and O is the centre. What is ∠OAT, for any point T on the tangent other than A?",
        "एक स्पर्श रेखा वृत्त को A पर छूती है, और O केंद्र है। स्पर्श रेखा पर A के अलावा किसी भी बिंदु T के लिए ∠OAT क्या है?",
      ),
      options: [
        { id: "right", label: t("90°", "90°") },
        {
          id: "depends",
          label: t("It depends on T", "यह T पर निर्भर है"),
          feedback: t(
            "Moving T along the tangent doesn't change the line AT, and OA ⊥ that line.",
            "T को स्पर्श रेखा पर खिसकाने से रेखा AT नहीं बदलती, और OA ⊥ उस रेखा।",
          ),
        },
        {
          id: "acute",
          label: t("Less than 90°", "90° से कम"),
          feedback: t(
            "By Theorem 10.1 the radius meets the tangent at exactly 90°.",
            "प्रमेय 10.1 से त्रिज्या स्पर्श रेखा से ठीक 90° पर मिलती है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ Theorem 10.1: tangent ⟂ radius at the point of contact. ✓ The perpendicular to a tangent at its point of contact passes through the centre. ✓ That's why the hub glides straight. Next: the chain leaves each sprocket along two tangents. How long are they?",
        "**मिशन लॉग।** ✓ प्रमेय 10.1: स्पर्श बिंदु पर स्पर्श रेखा ⟂ त्रिज्या। ✓ स्पर्श बिंदु पर स्पर्श रेखा पर लंब केंद्र से होकर जाता है। ✓ इसीलिए हब सीधा सरकता है। आगे: चेन हर गरारी से दो स्पर्श रेखाओं के साथ निकलती है। वे कितनी लंबी हैं?",
      ),
      "log",
      { isHidden: true },
    );
    b.when(angle.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), pq, worked, angle, log, space()]);
  },
  { passOn: PassOn.Rules },
);

export const overview = [hook, shortest, proof, normal, inLife, yourTurn];

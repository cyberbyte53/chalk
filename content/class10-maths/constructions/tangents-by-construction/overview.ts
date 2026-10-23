import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import { CirclesSceneKind, ConstructionKind } from "@chalk/prop-circles";
import { constructionOn, sceneOn } from "../kit";

const r = String.raw;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** The chain's straight runs: tangents, but where exactly do they touch? */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const chain = sceneOn(
    b,
    "chain",
    CirclesSceneKind.ChainSprockets,
    "Kabir kneeling by the cycle with the chain cover off: the chain's straight runs leave each sprocket just touching it",
  );
  return column([
    w.title(t("Drawing the chain", "चेन बनाना")),
    chain,
    w.body(
      t(
        "Last stop for the poster outline: the chain. Kabir took the cover off to look. Its straight runs leave each sprocket just touching it, so on paper they must be **tangents**. In the circles chapter we proved what a tangent is. Now Riya has to **draw** one exactly, with only a compass and ruler, and from a point outside the circle she can't just guess where it touches.",
        "पोस्टर की रूपरेखा का आख़िरी पड़ाव: चेन। कबीर ने देखने के लिए कवर हटाया। उसके सीधे हिस्से हर स्प्रॉकेट को बस छूते हुए निकलते हैं, तो काग़ज़ पर वे **स्पर्श रेखाएँ** होने चाहिए। वृत्त वाले अध्याय में हमने सिद्ध किया कि स्पर्श रेखा क्या है। अब रिया को केवल परकार और रूलर से उसे ठीक-ठीक **खींचना** है, और वृत्त के बाहर के बिंदु से वह अंदाज़ा नहीं लगा सकती कि वह कहाँ छूएगी।",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** The tangent at a point on the circle: radius, then the perpendicular at its end. */
const atPoint = page(
  "at-point",
  (b) => {
    const w = wordsOn(b);
    const { figure, goal } = constructionOn(
      b,
      "atPoint",
      { kind: ConstructionKind.TangentAtPoint, r: 3 },
      "a circle with centre O and a point P on it; the radius OP is drawn, then the line through P perpendicular to OP: the tangent at P",
      t("Tap next to draw the tangent at P.", "P पर स्पर्श रेखा खींचने के लिए आगे दबाओ।"),
    );
    return column([
      w.title(t("The tangent at a point of the circle", "वृत्त के किसी बिंदु पर स्पर्श रेखा")),
      w.definition(
        t(
          "**Recall (Chapter 10).** A **tangent** is a line that meets a circle at exactly one point, its **point of contact**. The tangent at any point is **perpendicular** to the radius through that point. From a point inside the circle there is no tangent; from a point on it, exactly one; from a point outside, exactly two.",
          "**याद करो (अध्याय 10)।** **स्पर्श रेखा** वह रेखा है जो वृत्त से ठीक एक बिंदु पर मिलती है, उसका **स्पर्श बिंदु**। किसी भी बिंदु पर स्पर्श रेखा उस बिंदु से गई त्रिज्या पर **लंब** होती है। वृत्त के अंदर के बिंदु से कोई स्पर्श रेखा नहीं; वृत्त पर के बिंदु से ठीक एक; बाहर के बिंदु से ठीक दो।",
        ),
      ),
      w.body(
        t(
          "So for a point P on the circle the construction is short: draw the radius OP, then draw the line through P perpendicular to OP.",
          "तो वृत्त पर के बिंदु P के लिए रचना छोटी है: त्रिज्या OP खींचो, फिर P से OP पर लंब रेखा खींचो।",
        ),
      ),
      figure,
      goal,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Construction 11.3: tangents from an outside point, with the justification. */
const fromOutside = page(
  "from-outside",
  (b) => {
    const w = wordsOn(b);
    const { figure, goal } = constructionOn(
      b,
      "outside",
      { kind: ConstructionKind.TangentsFromPoint, r: 6, d: 10 },
      "Construction 11.3 on a circle of radius 6 cm with P 10 cm from O: PO is bisected at M, the circle with centre M through O cuts the given circle at Q and R, and PQ and PR are drawn",
      t(
        "Tap next until both tangents PQ and PR are drawn.",
        "आगे दबाते रहो जब तक दोनों स्पर्श रेखाएँ PQ और PR न बन जाएँ।",
      ),
    );
    const why = w.body(
      t(
        r`**Why it works.** Join OQ. PO is a diameter of the circle centred at M, so $\angle PQO$ is an angle in a semicircle: $$\angle PQO = 90^\circ$$ So PQ ⊥ OQ. OQ is a radius of the given circle, and a line through the end of a radius, perpendicular to it, is the tangent there. So PQ is a tangent. In the same way, PR is a tangent.`,
        r`**यह क्यों काम करता है।** OQ मिलाओ। M केंद्र वाले वृत्त का PO व्यास है, तो $\angle PQO$ अर्धवृत्त में बना कोण है: $$\angle PQO = 90^\circ$$ अतः PQ ⊥ OQ। OQ दिए गए वृत्त की त्रिज्या है, और त्रिज्या के सिरे से उस पर लंब रेखा वहाँ की स्पर्श रेखा होती है। तो PQ स्पर्श रेखा है। इसी तरह PR भी स्पर्श रेखा है।`,
      ),
      "why",
      { isHidden: true },
    );
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(why));
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "Why does the construction draw a circle on PO as diameter?",
        "रचना PO को व्यास मानकर वृत्त क्यों खींचती है?",
      ),
      options: [
        {
          id: "right",
          label: t("So the angle at Q is 90°: PQ ⊥ OQ", "तो Q पर का कोण 90° है: PQ ⊥ OQ"),
        },
        {
          id: "equal",
          label: t("It makes PQ and OQ equal in length", "इससे PQ और OQ बराबर लंबे हो जाते हैं"),
          feedback: t(
            "PQ and OQ are usually different lengths (8 and 6 here). The circle is there for the right angle.",
            "PQ और OQ आमतौर पर अलग लंबाई के होते हैं (यहाँ 8 और 6)। वृत्त समकोण के लिए है।",
          ),
        },
        {
          id: "mid",
          label: t("It puts Q on the line PO", "इससे Q रेखा PO पर आ जाता है"),
          feedback: t(
            "Q is off the line PO: it's where the two circles cross. What matters is the 90° angle at Q.",
            "Q रेखा PO पर नहीं है: वह दोनों वृत्तों के कटने का बिंदु है। ज़रूरी है Q पर 90° का कोण।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    return column([
      w.title(
        t("Construction 11.3: tangents from an outside point", "रचना 11.3: बाहर के बिंदु से स्पर्श रेखाएँ"),
      ),
      w.body(
        t(
          "Given a circle with centre O and a point P outside it. The steps: join PO and bisect it; call the midpoint M. With centre M and radius MO, draw a circle; it cuts the given circle at Q and R. Join PQ and PR. These are the two tangents.",
          "केंद्र O वाला वृत्त और उसके बाहर बिंदु P दिया है। चरण: PO मिलाओ और उसे समद्विभाजित करो; मध्य-बिंदु M कहो। केंद्र M और त्रिज्या MO से वृत्त खींचो; यह दिए गए वृत्त को Q और R पर काटता है। PQ और PR मिलाओ। यही दो स्पर्श रेखाएँ हैं।",
        ),
      ),
      figure,
      goal,
      why,
      ask,
      w.note(
        t(
          "If the centre isn't given, find it first: draw any two chords that aren't parallel and draw their perpendicular bisectors. The centre is where the two bisectors meet.",
          "यदि केंद्र नहीं दिया, तो पहले उसे ढूँढो: कोई दो जीवाएँ खींचो जो समांतर न हों, और उनके लंब समद्विभाजक खींचो। केंद्र वहाँ है जहाँ दोनों समद्विभाजक मिलते हैं।",
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Exercise 11.2 Q4: a pair of tangents inclined at 60°. */
const atAngle = page(
  "at-angle",
  (b) => {
    const w = wordsOn(b);
    const { figure, goal } = constructionOn(
      b,
      "angle",
      { kind: ConstructionKind.TangentsAtAngle, r: 5, angle: 60 },
      "a circle of radius 5 cm with two radii OA and OB at 120° to each other; the tangents at A and B are drawn perpendicular to the radii and meet at P at 60°",
      t(
        "Tap next until the two tangents meet at 60°.",
        "आगे दबाते रहो जब तक दोनों स्पर्श रेखाएँ 60° पर न मिलें।",
      ),
    );
    return column([
      w.title(t("Two tangents at a given angle", "दिए गए कोण पर दो स्पर्श रेखाएँ")),
      w.body(
        t(
          r`Exercise 11.2 Q4 asks for two tangents to a circle of radius 5 cm that meet at 60°. Work backwards. If the tangents touch at A and B and meet at P, then in the quadrilateral OAPB the angles at A and B are 90°. The four angles add to 360°, so $$\angle AOB = 360^\circ - 90^\circ - 90^\circ - 60^\circ = 120^\circ$$ So: draw two radii at 120°, and the tangents at their ends (perpendicular to each radius).`,
          r`प्रश्नावली 11.2 प्र.4 त्रिज्या 5 cm के वृत्त पर ऐसी दो स्पर्श रेखाएँ माँगता है जो 60° पर मिलें। उलटी ओर से सोचो। यदि स्पर्श रेखाएँ A और B पर छूएँ और P पर मिलें, तो चतुर्भुज OAPB में A और B के कोण 90° हैं। चारों कोणों का योग 360° है, तो $$\angle AOB = 360^\circ - 90^\circ - 90^\circ - 60^\circ = 120^\circ$$ यानी: 120° पर दो त्रिज्याएँ खींचो, और उनके सिरों पर स्पर्श रेखाएँ (हर त्रिज्या पर लंब)।`,
        ),
      ),
      figure,
      goal,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** The chain's straight run, measured. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "Exercise 11.2 Q1: radius 6 cm, P is 10 cm from the centre. How long is each tangent PQ?",
        "प्रश्नावली 11.2 प्र.1: त्रिज्या 6 cm, P केंद्र से 10 cm दूर। हर स्पर्श रेखा PQ कितनी लंबी है?",
      ),
      options: [
        { id: "right", label: t("8 cm", "8 cm") },
        {
          id: "four",
          label: t("4 cm", "4 cm"),
          feedback: t(
            "10 − 6 is the gap from P to the circle along PO, not the tangent. Use the right angle at Q.",
            "10 − 6, PO के साथ P से वृत्त तक की दूरी है, स्पर्श रेखा नहीं। Q पर का समकोण लो।",
          ),
        },
        {
          id: "root",
          label: t("√136 cm", "√136 cm"),
          feedback: t(
            "PO is the hypotenuse, so subtract: PQ² = 10² − 6².",
            "PO कर्ण है, तो घटाओ: PQ² = 10² − 6²।",
          ),
        },
      ],
      answer: "right",
    });
    const check = w.body(
      t(
        r`In $\triangle PQO$ the right angle is at Q, so $$PQ^2 = PO^2 - OQ^2 = 10^2 - 6^2 = 64$$ $$PQ = 8 \text{ cm}$$ and PR is 8 cm too. Riya measures both straight runs on her drawing: 8 cm each, as the construction promised.`,
        r`$\triangle PQO$ में समकोण Q पर है, तो $$PQ^2 = PO^2 - OQ^2 = 10^2 - 6^2 = 64$$ $$PQ = 8 \text{ cm}$$ और PR भी 8 cm। रिया अपने चित्र पर दोनों सीधे हिस्से नापती है: हर एक 8 cm, जैसा रचना ने वादा किया था।`,
      ),
      "check",
      { isHidden: true },
    );
    b.when(ask.on(QuestionSignal.Correct), theBoard.show(check));
    return column([
      w.title(t("The chain on paper", "काग़ज़ पर चेन")),
      w.body(
        t(
          "On the poster, the front sprocket is a circle of radius 6 cm, and the chain's runs head towards a point P 10 cm from its centre. Riya bisects PO, draws the circle on it, and joins P to the two crossing points. The chain now leaves the sprocket exactly where it should.",
          "पोस्टर पर अगला स्प्रॉकेट 6 cm त्रिज्या का वृत्त है, और चेन के हिस्से उसके केंद्र से 10 cm दूर एक बिंदु P की ओर जाते हैं। रिया PO को समद्विभाजित करती है, उस पर वृत्त खींचती है, और P को दोनों कटान-बिंदुओं से मिलाती है। अब चेन स्प्रॉकेट को ठीक वहीं से छोड़ती है जहाँ उसे छोड़ना चाहिए।",
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

/** Exercise 11.2 Q2, Q3, and the chapter's mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const q2 = choiceQuestion(b, {
      name: "q2",
      prompt: t(
        "Exercise 11.2 Q2: a tangent to a circle of radius 4 cm is drawn from a point on the concentric circle of radius 6 cm. How long is it?",
        "प्रश्नावली 11.2 प्र.2: 4 cm त्रिज्या के वृत्त पर, 6 cm त्रिज्या के संकेंद्री वृत्त के एक बिंदु से स्पर्श रेखा खींची है। वह कितनी लंबी है?",
      ),
      options: [
        { id: "right", label: t("2√5 cm, about 4.5 cm", "2√5 cm, लगभग 4.5 cm") },
        {
          id: "two",
          label: t("2 cm, the gap between circles", "2 cm, वृत्तों के बीच की दूरी"),
          feedback: t(
            "6 − 4 is the gap along a radius. The tangent is the leg of a right triangle: √(6² − 4²).",
            "6 − 4 त्रिज्या के साथ की दूरी है। स्पर्श रेखा समकोण त्रिभुज की एक भुजा है: √(6² − 4²)।",
          ),
        },
        {
          id: "big",
          label: t("2√13 cm, about 7.2 cm", "2√13 cm, लगभग 7.2 cm"),
          feedback: t(
            "That's √(6² + 4²). The point is 6 cm from O, the hypotenuse, so subtract the squares.",
            "वह √(6² + 4²) है। बिंदु O से 6 cm दूर है, यानी कर्ण, तो वर्ग घटाओ।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const q3 = choiceQuestion(b, {
      name: "q3",
      prompt: t(
        "Exercise 11.2 Q3: radius 3 cm, P and Q on the extended diameter, each 7 cm from the centre. How many tangents are drawn in all?",
        "प्रश्नावली 11.2 प्र.3: त्रिज्या 3 cm, P और Q बढ़ाए गए व्यास पर, हर एक केंद्र से 7 cm दूर। कुल कितनी स्पर्श रेखाएँ खींची जाती हैं?",
      ),
      options: [
        { id: "right", label: t("Four: two from P, two from Q", "चार: दो P से, दो Q से") },
        {
          id: "two",
          label: t("Two: one from P, one from Q", "दो: एक P से, एक Q से"),
          feedback: t(
            "Each outside point has two tangents. P and Q are both outside, so 2 + 2.",
            "बाहर के हर बिंदु से दो स्पर्श रेखाएँ होती हैं। P और Q दोनों बाहर हैं, तो 2 + 2।",
          ),
        },
        {
          id: "none",
          label: t("Two, shared by both P and Q", "दो, जो P और Q दोनों की साझा हैं"),
          feedback: t(
            "P and Q are on opposite sides of the circle, so their tangents are different lines: 2 + 2.",
            "P और Q वृत्त के उलटी ओर हैं, तो उनकी स्पर्श रेखाएँ अलग रेखाएँ हैं: 2 + 2।",
          ),
        },
      ],
      answer: "right",
    });
    const log = w.definition(
      t(
        "**Mission log: the poster outline is drawn.** ✓ The top tube split 3 : 2. ✓ The handout frame at 3/4 and the poster frame at 5/3, the same shape. ✓ The chain's straight runs as tangents, 8 cm each, touching exactly where they should. Every line was made with a compass and a ruler, and every one has a reason. Next: colouring the poster, which means working out the areas of the parts of circles it uses.",
        "**मिशन लॉग: पोस्टर की रूपरेखा बन गई।** ✓ ऊपरी नली 3 : 2 में बँटी। ✓ पर्चे वाला फ़्रेम 3/4 और पोस्टर वाला 5/3 नाप में, वही आकार। ✓ चेन के सीधे हिस्से स्पर्श रेखाओं की तरह, हर एक 8 cm, ठीक वहीं छूते हुए जहाँ छूना चाहिए। हर रेखा परकार और रूलर से बनी, और हर एक के पीछे कारण है। आगे: पोस्टर में रंग भरना, जिसके लिए उसमें लगे वृत्त के हिस्सों के क्षेत्रफल निकालने होंगे।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(q3.on(QuestionSignal.Correct), theBoard.show(log));
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), q2, q3, log, space()]);
  },
  { passOn: PassOn.Rules },
);

export const overview = [hook, atPoint, fromOutside, atAngle, inLife, yourTurn];

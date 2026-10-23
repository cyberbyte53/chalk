import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, goalQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  CirclesSceneKind,
  LineCircleAction,
  LineCircleDerived,
  LineCircleMode,
  LineKind,
  lineCircleDef,
} from "@chalk/prop-circles";
import { sceneOn } from "../kit";

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** Every point of the tyre touches the road once a turn. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const wheel = sceneOn(
    b,
    "wheel",
    CirclesSceneKind.WheelRoad,
    "the cycle's front wheel on the road, touching it at one point, with Kabir pointing at the spot",
  );
  return column([
    w.title(t("One spot at a time", "एक बार में एक जगह")),
    wheel,
    w.body(
      t(
        "Last time: the road is a tangent to the wheel. Kabir chalks a dot on the tyre and pushes the cycle forward. The dot goes round and touches the road once every turn. Then the next bit of tyre touches, and the next.",
        "पिछली बार: सड़क पहिये की स्पर्श रेखा है। कबीर टायर पर चॉक से एक बिंदु लगाता है और साइकिल को आगे धकेलता है। बिंदु घूमकर हर चक्कर में एक बार सड़क को छूता है। फिर टायर का अगला भाग छूता है, फिर उसके बाद वाला।",
      ),
    ),
    w.body(
      t(
        "So every point of the circle gets its turn to touch the road. Does every point of a circle have a tangent? And how many tangents can one point have?",
        "तो वृत्त का हर बिंदु बारी-बारी से सड़क को छूता है। क्या वृत्त के हर बिंदु पर एक स्पर्श रेखा होती है? और एक बिंदु पर कितनी स्पर्श रेखाएँ हो सकती हैं?",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Activity 1: a line turning about P. */
const turn = page(
  "turn",
  (b) => {
    const w = wordsOn(b);
    const line = b.prop(lineCircleDef, "line", {
      mode: LineCircleMode.Rotate,
      r: 3,
      turn: 45,
      turnStep: 15,
      names: ["O", "P", "Q", "X", "Y"],
      canMove: true,
      showKind: true,
      showRadius: false,
      showChord: false,
    });
    b.studentOnly(line.action(LineCircleAction.Move));
    b.standsFor(
      line,
      "a circle with a straight wire fixed at a point P on it; the learner turns the wire about P, and it cuts the circle again at a second point Q, which moves as the wire turns",
    );
    const goal = goalQuestion(b, {
      about: line,
      prompt: t(
        "Turn the line about P until Q runs into P.",
        "रेखा को P के चारों ओर तब तक घुमाओ जब तक Q, P में न मिल जाए।",
      ),
      isMet: line.derived(LineCircleDerived.Kind).eq(LineKind.Tangent),
      solve: Array.from({ length: 3 }, () => line.learner(LineCircleAction.Move, { by: -1 })),
    });
    const after = w.body(
      t(
        "In just one position the line meets the circle at P only: that is the tangent at P. Turn it a little further either way and it cuts the circle again at a new point. So there is a tangent at P, and only one.",
        "बस एक ही स्थिति में रेखा वृत्त से केवल P पर मिलती है: वही P पर स्पर्श रेखा है। उसे किसी भी ओर थोड़ा और घुमाओ और वह वृत्त को फिर एक नए बिंदु पर काटती है। तो P पर एक स्पर्श रेखा है, और केवल एक।",
      ),
      "after",
      { isHidden: true },
    );
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(after));
    return column([
      w.title(t("Turning a line about a point", "एक बिंदु के चारों ओर रेखा घुमाना")),
      w.body(
        t(
          "Activity 1. Fix a straight wire to a point P of a circular wire so that it can turn about P. In most positions the wire is a secant: it cuts the circle at P and at another point Q.",
          "क्रियाकलाप 1। एक सीधे तार को वृत्ताकार तार के बिंदु P पर ऐसे लगाओ कि वह P के चारों ओर घूम सके। ज़्यादातर स्थितियों में तार एक छेदक रेखा है: वह वृत्त को P पर और एक दूसरे बिंदु Q पर काटता है।",
        ),
      ),
      line,
      goal,
      after,
      w.definition(
        t(
          "**Tangent as a secant.** As the secant turns, the two ends of its chord come closer and closer, and finally coincide at P. **The tangent to a circle is the special case of a secant when the two end points of its chord coincide.** At any point of a circle there is exactly one tangent.",
          "**छेदक के रूप में स्पर्श रेखा।** छेदक घूमती है तो उसकी जीवा के दोनों सिरे पास-पास आते जाते हैं, और अंत में P पर मिल जाते हैं। **वृत्त की स्पर्श रेखा छेदक रेखा की वह विशेष स्थिति है जब उसकी जीवा के दोनों अंत-बिंदु संपाती हो जाएँ।** वृत्त के किसी भी बिंदु पर ठीक एक स्पर्श रेखा होती है।",
        ),
      ),
      w.note(
        t(
          "The word tangent comes from the Latin tangere, to touch. The Danish mathematician Thomas Fineke introduced it in 1583.",
          "शब्द tangent लैटिन के tangere से आया है, जिसका अर्थ है छूना। डेनमार्क के गणितज्ञ थॉमस फ़ाइनेक ने इसे 1583 में चलाया।",
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Activity 2: parallel lines, at most two tangents. */
const parallel = page(
  "parallel",
  (b) => {
    const w = wordsOn(b);
    const line = b.prop(lineCircleDef, "line", {
      mode: LineCircleMode.Slide,
      r: 3,
      offset: 0,
      step: 0.75,
      names: ["O", "P", "Q", "X", "Y"],
      canMove: true,
      showKind: true,
      showRadius: false,
      showChord: true,
    });
    b.studentOnly(line.action(LineCircleAction.Move));
    b.standsFor(
      line,
      "a circle with a horizontal secant through its centre that the learner slides up or down, keeping its direction; the chord it cuts is written on it",
    );
    const goal = goalQuestion(b, {
      about: line,
      prompt: t(
        "Slide the line, keeping its direction, until the chord shrinks to nothing.",
        "रेखा को उसकी दिशा बनाए रखते हुए तब तक खिसकाओ जब तक जीवा घटकर शून्य न हो जाए।",
      ),
      isMet: line.derived(LineCircleDerived.Kind).eq(LineKind.Tangent),
      solve: Array.from({ length: 4 }, () => line.learner(LineCircleAction.Move, { by: 1 })),
    });
    const howMany = choiceQuestion(b, {
      name: "howMany",
      prompt: t(
        "How many tangents can a circle have that are parallel to this line?",
        "किसी वृत्त की कितनी स्पर्श रेखाएँ इस रेखा के समांतर हो सकती हैं?",
      ),
      options: [
        { id: "right", label: t("Two, one on each side", "दो, हर ओर एक") },
        {
          id: "one",
          label: t("Only the one you found", "केवल वही जो तुमने पाई"),
          feedback: t(
            "Slide the line the other way: the chord shrinks to nothing on that side too.",
            "रेखा को दूसरी ओर खिसकाओ: उस ओर भी जीवा घटकर शून्य हो जाती है।",
          ),
        },
        {
          id: "many",
          label: t("As many as you like", "जितनी चाहो उतनी"),
          feedback: t(
            "Only two positions of the sliding line touch the circle; all the others cut it or miss it.",
            "खिसकती रेखा की केवल दो स्थितियाँ वृत्त को छूती हैं; बाक़ी सब उसे काटती हैं या उससे दूर रहती हैं।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
    });
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(howMany));
    return column([
      w.title(t("Lines parallel to a secant", "छेदक के समांतर रेखाएँ")),
      w.body(
        t(
          "Activity 2. Draw a secant, then lines parallel to it on both sides. The chords they cut get shorter and shorter.",
          "क्रियाकलाप 2। एक छेदक रेखा खींचो, फिर दोनों ओर उसके समांतर रेखाएँ। उनसे कटी जीवाएँ छोटी होती जाती हैं।",
        ),
      ),
      line,
      goal,
      howMany,
      w.definition(
        t(
          "**Point of contact.** The common point of a tangent and the circle is the **point of contact**, and the tangent is said to **touch** the circle there. A circle has at most two tangents parallel to a given line, one on each side.",
          "**स्पर्श बिंदु।** स्पर्श रेखा और वृत्त का साझा बिंदु **स्पर्श बिंदु** है, और कहते हैं कि स्पर्श रेखा वहाँ वृत्त को **स्पर्श करती** है। किसी दी हुई रेखा के समांतर वृत्त की अधिक से अधिक दो स्पर्श रेखाएँ होती हैं, हर ओर एक।",
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** Exercise 10.1 Q1 on the wheel. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const wheel = sceneOn(
      b,
      "wheel",
      CirclesSceneKind.WheelRoad,
      "the cycle's front wheel touching the road at one point",
    );
    const many = choiceQuestion(b, {
      name: "many",
      prompt: t(
        "Exercise 10.1 Q1, on the wheel: how many tangents can a circle have?",
        "प्रश्नावली 10.1 प्र1, पहिये पर: किसी वृत्त की कितनी स्पर्श रेखाएँ हो सकती हैं?",
      ),
      options: [
        { id: "right", label: t("Infinitely many, one at each point", "अनगिनत, हर बिंदु पर एक") },
        {
          id: "two",
          label: t("Two, one on each side of it", "दो, उसके दोनों ओर एक-एक"),
          feedback: t(
            "Two is the most that are parallel to one given line. Turn the direction and you get another pair, and so on.",
            "दो अधिकतम वे हैं जो एक दी हुई रेखा के समांतर हों। दिशा बदलो तो एक और जोड़ा मिलता है, और ऐसे ही आगे।",
          ),
        },
        {
          id: "one",
          label: t("One, where it meets the road", "एक, जहाँ यह सड़क से मिलता है"),
          feedback: t(
            "One at each point, and a circle has infinitely many points: every bit of tyre touches the road in turn.",
            "हर बिंदु पर एक, और वृत्त के अनगिनत बिंदु हैं: टायर का हर भाग बारी-बारी से सड़क को छूता है।",
          ),
        },
      ],
      answer: "right",
    });
    const roll = w.body(
      t(
        "As the wheel rolls, a new point touches the road each moment, and at that point the road is the one tangent. Riya adds to the poster: **a circle has a tangent at every point, exactly one.**",
        "पहिया लुढ़कता है तो हर पल एक नया बिंदु सड़क को छूता है, और उस बिंदु पर सड़क ही वह एक स्पर्श रेखा है। रिया पोस्टर में जोड़ती है: **वृत्त के हर बिंदु पर एक स्पर्श रेखा होती है, ठीक एक।**",
      ),
      "roll",
      { isHidden: true },
    );
    b.when(many.on(QuestionSignal.Correct), theBoard.show(roll));
    return column([w.title(t("The rolling wheel", "लुढ़कता पहिया")), wheel, many, roll, space()]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Exercise 10.1 Q2 (i), (iii), (iv) and Q4; the mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const meets = choiceQuestion(b, {
      name: "meets",
      prompt: t(
        "Exercise 10.1 Q2 (i): a tangent to a circle intersects it in … point(s).",
        "प्रश्नावली 10.1 प्र2 (i): वृत्त की स्पर्श रेखा उसे … बिंदु(ओं) पर काटती है।",
      ),
      options: [
        { id: "right", label: t("one", "एक") },
        {
          id: "two",
          label: t("two", "दो"),
          feedback: t("Two points make it a secant.", "दो बिंदु हों तो वह छेदक रेखा है।"),
        },
        {
          id: "zero",
          label: t("no", "शून्य"),
          feedback: t(
            "A line with no common point is non-intersecting. A tangent touches at one.",
            "जिस रेखा का कोई साझा बिंदु न हो वह अप्रतिच्छेदी है। स्पर्श रेखा एक पर छूती है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const contact = choiceQuestion(b, {
      name: "contact",
      prompt: t(
        "Exercise 10.1 Q2 (iv): the common point of a tangent to a circle and the circle is called the …",
        "प्रश्नावली 10.1 प्र2 (iv): वृत्त की स्पर्श रेखा और वृत्त का साझा बिंदु कहलाता है …",
      ),
      options: [
        { id: "right", label: t("point of contact", "स्पर्श बिंदु") },
        {
          id: "centre",
          label: t("centre", "केंद्र"),
          feedback: t(
            "The centre is inside the circle; a tangent never reaches it.",
            "केंद्र वृत्त के अंदर है; स्पर्श रेखा उस तक कभी नहीं पहुँचती।",
          ),
        },
        {
          id: "end",
          label: t("end point", "अंत-बिंदु"),
          feedback: t(
            "A line has no end points. The special name for the touching point is point of contact.",
            "रेखा का कोई अंत-बिंदु नहीं होता। छूने वाले बिंदु का विशेष नाम स्पर्श बिंदु है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const parallelQ = choiceQuestion(b, {
      name: "parallelQ",
      prompt: t(
        "Exercise 10.1 Q4: you draw two lines parallel to a given line, one a tangent and one a secant. Where must the secant be?",
        "प्रश्नावली 10.1 प्र4: तुम किसी दी हुई रेखा के समांतर दो रेखाएँ खींचते हो, एक स्पर्श रेखा और एक छेदक। छेदक कहाँ होनी चाहिए?",
      ),
      options: [
        {
          id: "right",
          label: t("Less than one radius from the centre", "केंद्र से एक त्रिज्या से कम दूरी पर"),
        },
        {
          id: "equal",
          label: t("Exactly one radius from the centre", "केंद्र से ठीक एक त्रिज्या की दूरी पर"),
          feedback: t(
            "A line exactly one radius from the centre touches: that's the tangent, not the secant.",
            "केंद्र से ठीक एक त्रिज्या दूर की रेखा छूती है: वह स्पर्श रेखा है, छेदक नहीं।",
          ),
        },
        {
          id: "far",
          label: t("More than one radius from the centre", "केंद्र से एक त्रिज्या से अधिक दूरी पर"),
          feedback: t(
            "Farther than a radius, the line misses the circle: it's non-intersecting.",
            "त्रिज्या से अधिक दूर रेखा वृत्त से नहीं मिलती: वह अप्रतिच्छेदी है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ A tangent is a secant whose two points have come together. ✓ Exactly one tangent at each point of a circle; at most two parallel to a given line. Next: the spoke at the point of contact looked straight up. Is it always at right angles?",
        "**मिशन लॉग।** ✓ स्पर्श रेखा वह छेदक है जिसके दोनों बिंदु एक हो गए हैं। ✓ वृत्त के हर बिंदु पर ठीक एक स्पर्श रेखा; किसी दी हुई रेखा के समांतर अधिक से अधिक दो। आगे: स्पर्श बिंदु पर तीली सीधी खड़ी दिख रही थी। क्या वह हमेशा समकोण पर होती है?",
      ),
      "log",
      { isHidden: true },
    );
    b.when(parallelQ.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([
      w.title(t("Your turn", "अब तुम्हारी बारी")),
      meets,
      contact,
      parallelQ,
      log,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

export const overview = [hook, turn, parallel, inLife, yourTurn];

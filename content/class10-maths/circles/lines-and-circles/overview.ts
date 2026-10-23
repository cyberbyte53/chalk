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

/** The science fair notice, and Kabir's cycle. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const notice = sceneOn(
    b,
    "notice",
    CirclesSceneKind.FairNotice,
    "the school notice board announcing the science fair on 'How a cycle works', with Kabir beside his new cycle and Riya pointing at the notice",
  );
  return column([
    w.title(t("How does a cycle work?", "साइकिल कैसे चलती है?")),
    notice,
    w.body(
      t(
        "The kites are packed away after Sankranti, and a new notice is up on the school board: **Science Fair. Theme: How a cycle works.** Kabir has the perfect exhibit. It's the cycle he saved ₹100, ₹105, ₹110, … a week for. Riya will draw the poster.",
        "संक्रांति के बाद पतंगें रख दी गई हैं, और स्कूल के बोर्ड पर नई सूचना लगी है: **विज्ञान मेला। विषय: साइकिल कैसे चलती है।** कबीर के पास सबसे बढ़िया नमूना है। यह वही साइकिल है जिसके लिए उसने हर हफ़्ते ₹100, ₹105, ₹110, … बचाए थे। पोस्टर रिया बनाएगी।",
      ),
    ),
    w.body(
      t(
        'Kabir wheels it to the board and spins the front wheel. "See how smoothly it rolls? Why doesn\'t it bump?" Riya looks closely at where the tyre meets the ground. The wheel is a circle and the road is a straight line. How do the two meet?',
        'कबीर उसे बोर्ड तक लाता है और अगला पहिया घुमाता है। "देखो कितना आराम से घूमता है। यह उछलता क्यों नहीं?" रिया ध्यान से देखती है कि टायर ज़मीन से कहाँ मिलता है। पहिया एक वृत्त है और सड़क एक सीधी रेखा। ये दोनों कैसे मिलते हैं?',
      ),
    ),
    space(),
  ]);
});

/** The mission and the roadmap across Ch 10–12. */
const why = page("why", (b) => {
  const w = wordsOn(b);
  return column([
    w.title(t("What this chapter is for", "यह अध्याय किसलिए है")),
    w.body(
      t(
        "A cycle is full of circles meeting straight lines: the wheel on the road, the chain leaving the sprockets, a rope over a pulley. To explain them on a poster, Riya needs to know exactly how a straight line can sit against a circle. Then she has to draw it, and then measure it.",
        "साइकिल में बहुत से वृत्त सीधी रेखाओं से मिलते हैं: सड़क पर पहिया, गरारियों से निकलती चेन, घिरनी पर रस्सी। पोस्टर पर इन्हें समझाने के लिए रिया को ठीक-ठीक जानना होगा कि एक सीधी रेखा किसी वृत्त के साथ कैसे रह सकती है। फिर उसे यह बनाना होगा, और फिर नापना होगा।",
      ),
    ),
    w.definition(
      t(
        "**The mission: Kabir's cycle poster.** Three chapters, one poster. **Chapter 10, Circles** (this chapter): (1) a line and a circle; (2) the tangent at a point; (3) why the tangent is perpendicular to the radius; (4) tangents from a point outside; (5) using the tangent theorems. **Chapter 11, Constructions:** draw it all to scale with compass and ruler. **Chapter 12, Areas related to circles:** how far one turn of the wheel goes, and the area of the poster's designs.",
        "**मिशन: कबीर की साइकिल का पोस्टर।** तीन अध्याय, एक पोस्टर। **अध्याय 10, वृत्त** (यह अध्याय): (1) रेखा और वृत्त; (2) एक बिंदु पर स्पर्श रेखा; (3) स्पर्श रेखा त्रिज्या पर लंब क्यों है; (4) बाहर के बिंदु से स्पर्श रेखाएँ; (5) स्पर्श रेखा प्रमेयों का उपयोग। **अध्याय 11, रचनाएँ:** परकार और रूलर से सब कुछ पैमाने पर बनाना। **अध्याय 12, वृत्तों से संबंधित क्षेत्रफल:** पहिये का एक चक्कर कितनी दूर जाता है, और पोस्टर के डिज़ाइनों का क्षेत्रफल।",
      ),
    ),
    w.body(
      t(
        "First stop: how many ways can a straight line and a circle meet?",
        "पहला पड़ाव: एक सीधी रेखा और एक वृत्त कितनी तरह से मिल सकते हैं?",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Class 9 words, recalled. */
const recap = page(
  "recap",
  (b) => {
    const w = wordsOn(b);
    const chord = choiceQuestion(b, {
      name: "chord",
      prompt: t(
        "A segment joins two points on a circle and passes through the centre. What is it called?",
        "एक रेखाखंड वृत्त के दो बिंदुओं को जोड़ता है और केंद्र से होकर जाता है। इसे क्या कहते हैं?",
      ),
      options: [
        { id: "right", label: t("A diameter", "व्यास") },
        {
          id: "radius",
          label: t("A radius", "त्रिज्या"),
          feedback: t(
            "A radius goes from the centre to one point on the circle. This joins two points on the circle, through the centre.",
            "त्रिज्या केंद्र से वृत्त के एक बिंदु तक जाती है। यह वृत्त के दो बिंदुओं को जोड़ता है, केंद्र से होकर।",
          ),
        },
        {
          id: "arc",
          label: t("An arc", "चाप"),
          feedback: t(
            "An arc is a curved piece of the circle itself. This is a straight segment.",
            "चाप वृत्त का ही एक मुड़ा हुआ टुकड़ा है। यह एक सीधा रेखाखंड है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Circle words, from Class 9", "वृत्त के शब्द, कक्षा 9 से")),
      w.definition(
        t(
          "**Circle.** A **circle** is the set of all points in a plane at a fixed distance from a fixed point. The fixed point is the **centre** (usually O), and the fixed distance is the **radius**. A segment from the centre to a point on the circle is also called a radius.",
          "**वृत्त।** **वृत्त** किसी तल के उन सभी बिंदुओं का समूह है जो एक स्थिर बिंदु से एक स्थिर दूरी पर हैं। स्थिर बिंदु **केंद्र** है (प्रायः O), और स्थिर दूरी **त्रिज्या**। केंद्र से वृत्त के किसी बिंदु तक का रेखाखंड भी त्रिज्या कहलाता है।",
        ),
      ),
      w.definition(
        t(
          "**Chord and diameter.** A segment joining two points of a circle is a **chord**. A chord through the centre is a **diameter**; it is twice the radius.",
          "**जीवा और व्यास।** वृत्त के दो बिंदुओं को जोड़ने वाला रेखाखंड **जीवा** है। केंद्र से होकर जाने वाली जीवा **व्यास** है; यह त्रिज्या की दोगुनी होती है।",
        ),
      ),
      w.body(
        t(
          "One more fact from Class 9 that this chapter uses: the perpendicular from the centre to a chord bisects the chord.",
          "कक्षा 9 का एक और तथ्य जो यह अध्याय काम में लेता है: केंद्र से किसी जीवा पर डाला गया लंब जीवा को समद्विभाजित करता है।",
        ),
      ),
      chord,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Fig 10.1: non-intersecting, secant, tangent. */
const three = page(
  "three",
  (b) => {
    const w = wordsOn(b);
    const line = b.prop(lineCircleDef, "line", {
      mode: LineCircleMode.Slide,
      r: 3,
      offset: 4.5,
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
      "a circle with centre O and a horizontal line below it that the learner slides up and down; the picture says how many points the line shares with the circle, and writes the chord's length when it cuts",
    );
    const goal = goalQuestion(b, {
      about: line,
      prompt: t(
        "Slide the line until it shares exactly one point with the circle.",
        "रेखा को तब तक खिसकाओ जब तक वह वृत्त के साथ ठीक एक बिंदु साझा न करे।",
      ),
      isMet: line.derived(LineCircleDerived.Kind).eq(LineKind.Tangent),
      solve: [
        line.learner(LineCircleAction.Move, { by: -1 }),
        line.learner(LineCircleAction.Move, { by: -1 }),
      ],
    });
    return column([
      w.title(t("Three ways a line can sit", "रेखा के तीन तरह से रहने के ढंग")),
      w.body(
        t(
          "Take a circle and a straight line in the same plane. Slide the line across the circle and count the points they have in common.",
          "एक ही तल में एक वृत्त और एक सीधी रेखा लो। रेखा को वृत्त के आर-पार खिसकाओ और गिनो कि उनके कितने बिंदु साझा हैं।",
        ),
      ),
      line,
      goal,
      w.definition(
        t(
          "**Three cases.** A line with **no** common point with the circle is a **non-intersecting line**. A line with **two** common points is a **secant**; the part between the two points is a chord. A line with exactly **one** common point is a **tangent** to the circle.",
          "**तीन स्थितियाँ।** जिस रेखा का वृत्त से **कोई** साझा बिंदु न हो, वह **अप्रतिच्छेदी रेखा** है। जिसके **दो** साझा बिंदु हों, वह **छेदक रेखा** है; दोनों बिंदुओं के बीच का भाग एक जीवा है। जिसका ठीक **एक** साझा बिंदु हो, वह वृत्त की **स्पर्श रेखा** है।",
        ),
      ),
      w.body(
        t(
          "There is no fourth case: a straight line can't meet a circle in three points.",
          "कोई चौथी स्थिति नहीं है: एक सीधी रेखा किसी वृत्त से तीन बिंदुओं पर नहीं मिल सकती।",
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

/** Grandpa's well pulley (Fig 10.2). */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const well = sceneOn(
      b,
      "well",
      CirclesSceneKind.WellPulley,
      "Grandpa's village well, with the rope running over a round pulley; each straight part of the rope just touches the rim",
    );
    const rope = choiceQuestion(b, {
      name: "rope",
      prompt: t(
        "Think of the pulley as a circle and each straight part of the rope as a line. What is each straight part of the rope?",
        "घिरनी को एक वृत्त और रस्सी के हर सीधे भाग को एक रेखा मानो। रस्सी का हर सीधा भाग क्या है?",
      ),
      options: [
        { id: "right", label: t("A tangent to the circle", "वृत्त की स्पर्श रेखा") },
        {
          id: "secant",
          label: t("A secant of the circle", "वृत्त की छेदक रेखा"),
          feedback: t(
            "A secant would cut through the pulley at two points. The rope only touches the rim where it leaves it.",
            "छेदक रेखा घिरनी को दो बिंदुओं पर काटती। रस्सी तो बस वहीं किनारे को छूती है जहाँ से वह निकलती है।",
          ),
        },
        {
          id: "none",
          label: t("A non-intersecting line", "एक अप्रतिच्छेदी रेखा"),
          feedback: t(
            "A non-intersecting line never meets the circle. The rope does touch the rim, at one point.",
            "अप्रतिच्छेदी रेखा वृत्त से कभी नहीं मिलती। रस्सी किनारे को छूती है, एक बिंदु पर।",
          ),
        },
      ],
      answer: "right",
    });
    const road = w.body(
      t(
        "The cycle is the same. The road is a tangent to the wheel: they meet at exactly one point, and that is why a round wheel rolls without bumping. Riya writes it on the poster: **wheel and road, rope and pulley: tangents.**",
        "साइकिल भी ऐसी ही है। सड़क पहिये की स्पर्श रेखा है: वे ठीक एक बिंदु पर मिलते हैं, और इसीलिए गोल पहिया बिना उछले लुढ़कता है। रिया पोस्टर पर लिखती है: **पहिया और सड़क, रस्सी और घिरनी: स्पर्श रेखाएँ।**",
      ),
      "road",
      { isHidden: true },
    );
    b.when(rope.on(QuestionSignal.Correct), theBoard.show(road));
    return column([
      w.title(t("Grandpa's well", "दादाजी का कुआँ")),
      w.body(
        t(
          "On Sunday the family visits Grandpa's village. At the well, the rope runs over a round pulley.",
          "रविवार को परिवार दादाजी के गाँव जाता है। कुएँ पर रस्सी एक गोल घिरनी के ऊपर से जाती है।",
        ),
      ),
      well,
      rope,
      road,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Exercise 10.1 Q2 (ii), a count question; the mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const name = choiceQuestion(b, {
      name: "name",
      prompt: t(
        "Exercise 10.1 Q2 (ii): a line intersecting a circle in two points is called a …",
        "प्रश्नावली 10.1 प्र2 (ii): किसी वृत्त को दो बिंदुओं पर काटने वाली रेखा कहलाती है …",
      ),
      options: [
        { id: "right", label: t("secant", "छेदक रेखा") },
        {
          id: "tangent",
          label: t("tangent", "स्पर्श रेखा"),
          feedback: t(
            "A tangent meets the circle at only one point.",
            "स्पर्श रेखा वृत्त से केवल एक बिंदु पर मिलती है।",
          ),
        },
        {
          id: "chord",
          label: t("chord", "जीवा"),
          feedback: t(
            "A chord is only the segment between the two points. The whole line through them is a secant.",
            "जीवा केवल दोनों बिंदुओं के बीच का रेखाखंड है। उनसे होकर जाने वाली पूरी रेखा छेदक रेखा है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const most = choiceQuestion(b, {
      name: "most",
      prompt: t(
        "At most how many points can a straight line share with a circle?",
        "एक सीधी रेखा किसी वृत्त के साथ अधिक से अधिक कितने बिंदु साझा कर सकती है?",
      ),
      options: [
        { id: "right", label: t("2", "2") },
        {
          id: "one",
          label: t("1", "1"),
          feedback: t(
            "One is a tangent. A secant shares two.",
            "एक बिंदु स्पर्श रेखा का है। छेदक रेखा दो साझा करती है।",
          ),
        },
        {
          id: "three",
          label: t("3", "3"),
          feedback: t(
            "Slide the line again: it never meets the circle in three points.",
            "रेखा को फिर खिसकाओ: वह वृत्त से कभी तीन बिंदुओं पर नहीं मिलती।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ A line and a circle meet in 0, 1 or 2 points: non-intersecting, tangent, secant. ✓ Road and wheel, rope and pulley are tangents. Next: what exactly happens at the one point where a tangent touches?",
        "**मिशन लॉग।** ✓ रेखा और वृत्त 0, 1 या 2 बिंदुओं पर मिलते हैं: अप्रतिच्छेदी, स्पर्श रेखा, छेदक। ✓ सड़क और पहिया, रस्सी और घिरनी स्पर्श रेखाएँ हैं। आगे: जिस एक बिंदु पर स्पर्श रेखा छूती है, वहाँ ठीक-ठीक क्या होता है?",
      ),
      "log",
      { isHidden: true },
    );
    b.when(most.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), name, most, log, space()]);
  },
  { passOn: PassOn.Rules },
);

export const overview = [hook, why, recap, three, inLife, yourTurn];

import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, goalQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  CircleAreaAction,
  CircleAreaMode,
  CirclesSceneKind,
  PiValue,
  circleAreaDef,
} from "@chalk/prop-circles";
import { sceneOn } from "../kit";

const r = String.raw;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** The poster is drawn; now it needs numbers. How far does one turn of the wheel go? */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const lane = sceneOn(
    b,
    "lane",
    CirclesSceneKind.WheelRoll,
    "Kabir wheels his cycle forward one full turn of the wheel down the colony lane; two chalk lines on the road mark how far one turn carried it",
  );
  return column([
    w.title(t("How far does one turn go?", "एक चक्कर कितनी दूर ले जाता है?")),
    lane,
    w.body(
      t(
        'The science fair is a week away. Riya has drawn the poster "How a cycle works" to scale with compass and ruler: the wheels, the chain on its sprockets, the mudguard. But a poster at a science fair needs numbers, and Kabir keeps asking questions Riya can\'t answer yet.',
        'विज्ञान मेला एक हफ़्ते दूर है। रिया ने परकार और रूलर से "साइकिल कैसे चलती है" पोस्टर पैमाने पर बना लिया है: पहिये, स्प्रॉकेट पर चेन, मडगार्ड। पर विज्ञान मेले के पोस्टर में संख्याएँ चाहिए, और कबीर ऐसे सवाल पूछता रहता है जिनका जवाब रिया अभी नहीं दे सकती।',
      ),
    ),
    w.body(
      t(
        'He marks the tyre with chalk, wheels the cycle forward one full turn and marks the road again. "So how far is that? And how many turns to get to school?"',
        'वह टायर पर चॉक से निशान लगाता है, साइकिल को एक पूरा चक्कर आगे बढ़ाता है और सड़क पर फिर निशान लगाता है। "तो यह कितनी दूर हुआ? और स्कूल तक कितने चक्कर?"',
      ),
    ),
    space(),
  ]);
});

/** The chapter's job: the last three numbers the poster needs. */
const why = page("why", (b) => {
  const w = wordsOn(b);
  return column([
    w.title(t("What this chapter is for", "यह अध्याय किसलिए है")),
    w.body(
      t(
        "Chapter 10 explained why the wheel and chain work, and Chapter 11 drew them. This chapter measures them: the distance a wheel covers, the length of a mudguard and the area of a reflector, and how much paint the poster's border designs need. Every one of these is a length or an area of a circle, or of a piece of one.",
        "अध्याय 10 ने समझाया कि पहिया और चेन क्यों काम करते हैं, और अध्याय 11 ने उन्हें बनाया। यह अध्याय उन्हें नापता है: पहिया कितनी दूरी तय करता है, मडगार्ड कितना लंबा है और रिफ़्लेक्टर का क्षेत्रफल कितना है, और पोस्टर के किनारे की डिज़ाइनों में कितना रंग लगेगा। इनमें से हर एक किसी वृत्त, या उसके किसी हिस्से, की लंबाई या क्षेत्रफल है।",
      ),
    ),
    w.definition(
      t(
        "**The stops on the way.** (1) The circumference and area of a circle: *this lesson*. (2) Sectors and segments, the slices of a circle. (3) Sectors in real life: clocks, wipers, lighthouses. (4) Shapes made of circles and squares together, and then the fair.",
        "**रास्ते के पड़ाव।** (1) वृत्त की परिधि और क्षेत्रफल: *यह पाठ*। (2) त्रिज्यखंड और वृत्तखंड, वृत्त के टुकड़े। (3) जीवन में त्रिज्यखंड: घड़ी, वाइपर, प्रकाश-स्तंभ। (4) वृत्त और वर्ग मिलकर बनी आकृतियाँ, और फिर मेला।",
      ),
    ),
    w.body(
      t(
        "First stop, starting with what you already know: the distance round a circle, and the space inside it.",
        "पहला पड़ाव, जो तुम पहले से जानते हो उससे शुरू: वृत्त के चारों ओर की दूरी, और उसके अंदर की जगह।",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Circumference = π × diameter, by rolling a wheel along the road. */
const circumference = page(
  "circumference",
  (b) => {
    const w = wordsOn(b);
    const wheel = b.prop(circleAreaDef, "wheel", {
      mode: CircleAreaMode.Roll,
      r: 35,
      rolled: 0,
      pi: PiValue.Sevenths,
      canChange: true,
      showWorking: true,
    });
    b.studentOnly(wheel.action(CircleAreaAction.Roll));
    b.standsFor(
      wheel,
      "a wheel of radius 35 cm rolling along a road an eighth of a turn per tap; its rim unrolls into a straight line, which after one full turn is the circumference, 2πr = 220 cm",
    );
    const goal = goalQuestion(b, {
      about: wheel,
      prompt: t(
        "Roll the wheel one full turn, until its whole rim lies on the road.",
        "पहिये को एक पूरा चक्कर घुमाओ, जब तक उसकी पूरी परिधि सड़क पर न बिछ जाए।",
      ),
      isMet: wheel.field("rolled").eq(8),
      solve: Array.from({ length: 8 }, () => wheel.learner(CircleAreaAction.Roll, { by: 1 })),
    });
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        r`A wheel has diameter 70 cm. Taking $\pi = \frac{22}{7}$, how far does one turn carry it?`,
        r`एक पहिये का व्यास 70 cm है। $\pi = \frac{22}{7}$ लेकर, एक चक्कर उसे कितनी दूर ले जाता है?`,
      ),
      options: [
        { id: "right", label: t("220 cm", "220 cm") },
        {
          id: "110",
          label: t("110 cm", "110 cm"),
          feedback: t(
            r`That's $\pi \times 35$, using the radius. The circumference is $\pi \times$ diameter $= \frac{22}{7} \times 70$.`,
            r`यह $\pi \times 35$ है, त्रिज्या लेकर। परिधि $\pi \times$ व्यास $= \frac{22}{7} \times 70$ है।`,
          ),
        },
        {
          id: "3850",
          label: t("3850 cm", "3850 cm"),
          feedback: t(
            r`That's $\pi r^2$, the area inside the wheel. One turn covers the rim's length, $2\pi r$.`,
            r`यह $\pi r^2$ है, पहिये के अंदर का क्षेत्रफल। एक चक्कर परिधि की लंबाई तय करता है, $2\pi r$।`,
          ),
        },
      ],
      answer: "right",
      isHidden: true,
    });
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(ask));
    return column([
      w.title(t("The distance round a circle", "वृत्त के चारों ओर की दूरी")),
      w.definition(
        t(
          r`**Circumference and π.** The distance once round a circle is its **perimeter**, called its **circumference**. For every circle, big or small, the circumference divided by the diameter is the same number, called **π** (pi): $$\frac{\text{circumference}}{\text{diameter}} = \pi$$ So, with radius $r$ (the diameter is $2r$): $$\text{circumference} = 2\pi r$$`,
          r`**परिधि और π।** वृत्त के एक बार चारों ओर की दूरी उसका **परिमाप** है, जिसे उसकी **परिधि** कहते हैं। हर वृत्त के लिए, छोटा हो या बड़ा, परिधि को व्यास से भाग देने पर एक ही संख्या आती है, जिसे **π** (पाई) कहते हैं: $$\frac{\text{परिधि}}{\text{व्यास}} = \pi$$ तो त्रिज्या $r$ हो (व्यास $2r$ है): $$\text{परिधि} = 2\pi r$$`,
        ),
      ),
      w.body(
        t(
          r`π is irrational: its decimals never end and never repeat. Aryabhata (476–550 CE) gave $\pi = \frac{62832}{20000}$, nearly 3.1416. For working, we take $\pi = \frac{22}{7}$ or 3.14. Roll the wheel and watch its rim unroll.`,
          r`π अपरिमेय है: इसके दशमलव न कभी ख़त्म होते हैं, न दोहराते हैं। आर्यभट (476–550 ई.) ने $\pi = \frac{62832}{20000}$ दिया, लगभग 3.1416। गणना के लिए हम $\pi = \frac{22}{7}$ या 3.14 लेते हैं। पहिया घुमाओ और उसकी परिधि को खुलते देखो।`,
        ),
      ),
      wheel,
      goal,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Area = πr², by cutting the disc into slices and laying them out as a near-rectangle. */
const area = page(
  "area",
  (b) => {
    const w = wordsOn(b);
    const disc = b.prop(circleAreaDef, "disc", {
      mode: CircleAreaMode.Slices,
      r: 7,
      slices: 8,
      isArranged: false,
      pi: PiValue.Sevenths,
      canChange: true,
      showWorking: true,
    });
    b.studentOnly(disc.action(CircleAreaAction.SetSlices));
    b.studentOnly(disc.action(CircleAreaAction.Arrange));
    b.standsFor(
      disc,
      "a disc of radius 7 cm cut into equal slices; laid out pointing up and down, the slices make a near-rectangle πr long and r high, closer to a true rectangle as the slices get thinner",
    );
    const goal = goalQuestion(b, {
      about: disc,
      prompt: t(
        "Lay the slices out in a row. Then cut more slices and lay them out again.",
        "टुकड़ों को एक पंक्ति में बिछाओ। फिर और टुकड़े काटकर दोबारा बिछाओ।",
      ),
      isMet: disc.field("isArranged").eq(true),
      solve: [disc.learner(CircleAreaAction.Arrange, {})],
    });
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        r`Why is the long side of the near-rectangle $\pi r$?`,
        r`लगभग-आयत की लंबी भुजा $\pi r$ क्यों है?`,
      ),
      options: [
        {
          id: "right",
          label: t(
            "Half the slices' curved edges lie along it: half of 2πr",
            "आधे टुकड़ों के वक्र किनारे उस पर हैं: 2πr का आधा",
          ),
        },
        {
          id: "all",
          label: t(
            "All the slices' curved edges lie along it: all of 2πr",
            "सारे टुकड़ों के वक्र किनारे उस पर हैं: पूरा 2πr",
          ),
          feedback: t(
            "Half the slices point up and half point down, so the rim is split between the top side and the bottom side.",
            "आधे टुकड़े ऊपर और आधे नीचे की ओर हैं, तो परिधि ऊपर और नीचे की भुजा में बँट जाती है।",
          ),
        },
        {
          id: "radius",
          label: t(
            "Each slice's straight edge, a radius, lies along it",
            "हर टुकड़े का सीधा किनारा, एक त्रिज्या, उस पर है",
          ),
          feedback: t(
            "The straight edges are the slanting sides. The radius is the short side, the height r.",
            "सीधे किनारे तिरछी भुजाएँ हैं। त्रिज्या छोटी भुजा है, ऊँचाई r।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
    });
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(ask));
    return column([
      w.title(t("The space inside a circle", "वृत्त के अंदर की जगह")),
      w.body(
        t(
          "Cut a circle into equal slices, like a pizza, and lay them out pointing up and down in turn. They make a shape that is nearly a rectangle. The thinner the slices, the closer it gets.",
          "एक वृत्त को पिज़्ज़ा की तरह बराबर टुकड़ों में काटो, और उन्हें बारी-बारी से ऊपर और नीचे की ओर करके बिछाओ। वे लगभग एक आयत बनाते हैं। टुकड़े जितने पतले, उतना ही आयत के क़रीब।",
        ),
      ),
      disc,
      goal,
      w.definition(
        t(
          r`**Area of a circle.** The near-rectangle is half the circumference long and one radius high: $$\text{area} = \tfrac{1}{2} \times 2\pi r \times r$$ $$= \pi r^2$$ The **area** of a circle (the region inside it) is $\pi r^2$.`,
          r`**वृत्त का क्षेत्रफल।** लगभग-आयत परिधि की आधी लंबाई का और एक त्रिज्या ऊँचा है: $$\text{क्षेत्रफल} = \tfrac{1}{2} \times 2\pi r \times r$$ $$= \pi r^2$$ वृत्त का **क्षेत्रफल** (उसके अंदर का क्षेत्र) $\pi r^2$ है।`,
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Example 1: from the cost of a fence to the cost of ploughing. */
const example = page(
  "example",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        r`A circular park's boundary is 132 m long. What is its radius? (Take $\pi = \frac{22}{7}$.)`,
        r`एक वृत्ताकार पार्क की सीमा 132 m लंबी है। उसकी त्रिज्या क्या है? ($\pi = \frac{22}{7}$ लो।)`,
      ),
      options: [
        { id: "right", label: t("21 m", "21 m") },
        {
          id: "42",
          label: t("42 m", "42 m"),
          feedback: t(
            r`42 m is the diameter, $\frac{132}{\pi}$. The radius is half of it: $2\pi r = 132$ gives $r = 21$.`,
            r`42 m व्यास है, $\frac{132}{\pi}$। त्रिज्या उसका आधा है: $2\pi r = 132$ से $r = 21$।`,
          ),
        },
        {
          id: "66",
          label: t("66 m", "66 m"),
          feedback: t(
            r`66 is half of 132, but you must also divide by π: $r = \frac{132 \times 7}{2 \times 22}$.`,
            r`66, 132 का आधा है, पर π से भी भाग देना होगा: $r = \frac{132 \times 7}{2 \times 22}$।`,
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("From a fence to a field", "बाड़ से खेत तक")),
      w.body(
        t(
          r`**Example 1.** Fencing a circular field at ₹24 per metre costs ₹5280. Ploughing it costs ₹0.50 per m². Find the cost of ploughing. ($\pi = \frac{22}{7}$)`,
          r`**उदाहरण 1।** एक वृत्ताकार खेत की बाड़ ₹24 प्रति मीटर की दर से ₹5280 में लगती है। जुताई ₹0.50 प्रति m² की दर से होती है। जुताई का ख़र्च ज्ञात करो। ($\pi = \frac{22}{7}$)`,
        ),
      ),
      w.body(
        t(
          r`The fence goes round the field, so its length is the circumference: $$2\pi r = \frac{5280}{24} = 220$$ $$r = \frac{220 \times 7}{2 \times 22} = 35 \text{ m}$$ Ploughing covers the area: $$\pi r^2 = \frac{22}{7} \times 35 \times 35 = 3850 \text{ m}^2$$ $$\text{cost} = 3850 \times 0.50 = 1925$$ So ploughing costs ₹1925.`,
          r`बाड़ खेत के चारों ओर लगती है, तो उसकी लंबाई परिधि है: $$2\pi r = \frac{5280}{24} = 220$$ $$r = \frac{220 \times 7}{2 \times 22} = 35 \text{ m}$$ जुताई क्षेत्रफल पर होती है: $$\pi r^2 = \frac{22}{7} \times 35 \times 35 = 3850 \text{ m}^2$$ $$\text{ख़र्च} = 3850 \times 0.50 = 1925$$ तो जुताई में ₹1925 लगते हैं।`,
        ),
      ),
      w.note(
        t(
          "A boundary, fence or rim is a length: use the circumference. Ploughing, painting or covering is an area: use πr².",
          "सीमा, बाड़ या किनारा एक लंबाई है: परिधि लो। जुताई, रंगाई या ढकना क्षेत्रफल है: πr² लो।",
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

/** Kabir's wheel: 220 cm a turn, 500 turns to school. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const lane = sceneOn(
      b,
      "lane",
      CirclesSceneKind.WheelRoll,
      "the chalk marks on the lane: one turn of Kabir's wheel, 220 cm",
    );
    const turns = choiceQuestion(b, {
      name: "turns",
      prompt: t(
        "Kabir's school is 1.1 km away. How many turns does each wheel make on the way?",
        "कबीर का स्कूल 1.1 km दूर है। रास्ते में हर पहिया कितने चक्कर लगाता है?",
      ),
      options: [
        { id: "right", label: t("500", "500") },
        {
          id: "5",
          label: t("5", "5"),
          feedback: t(
            "Change 1.1 km into centimetres first: 1.1 km = 110000 cm. Then 110000 ÷ 220.",
            "पहले 1.1 km को सेंटीमीटर में बदलो: 1.1 km = 110000 cm। फिर 110000 ÷ 220।",
          ),
        },
        {
          id: "1000",
          label: t("1000", "1000"),
          feedback: t(
            "That uses 110 cm a turn, π × 35. One turn covers the whole circumference, 2 × 22/7 × 35 = 220 cm.",
            "इसमें एक चक्कर 110 cm लिया, π × 35। एक चक्कर पूरी परिधि तय करता है, 2 × 22/7 × 35 = 220 cm।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Back to the chalk marks", "फिर चॉक के निशानों पर")),
      lane,
      w.body(
        t(
          r`Riya measures the wheel: radius 35 cm, spokes to tyre. One turn lays the whole rim on the road, so the gap between the chalk lines is $$2\pi r = 2 \times \frac{22}{7} \times 35 = 220 \text{ cm}$$ Kabir checks with a tape: 2 m 20 cm. "It works!"`,
          r`रिया पहिया नापती है: त्रिज्या 35 cm, तीलियों से टायर तक। एक चक्कर पूरी परिधि को सड़क पर बिछा देता है, तो चॉक की रेखाओं के बीच की दूरी है $$2\pi r = 2 \times \frac{22}{7} \times 35 = 220 \text{ cm}$$ कबीर फ़ीते से जाँचता है: 2 m 20 cm। "यह तो सही निकला!"`,
        ),
      ),
      turns,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Exercise 12.1 Q1 worked, Q5 to try; then the mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const equal = choiceQuestion(b, {
      name: "equal",
      prompt: t(
        "A circle's perimeter and area are the same number. What is its radius?",
        "एक वृत्त का परिमाप और क्षेत्रफल एक ही संख्या है। उसकी त्रिज्या क्या है?",
      ),
      options: [
        { id: "right", label: t("2 units", "2 इकाई") },
        {
          id: "pi",
          label: t("π units", "π इकाई"),
          feedback: t(
            r`Set them equal: $2\pi r = \pi r^2$. Divide both sides by $\pi r$: $r = 2$. π cancels out.`,
            r`दोनों बराबर रखो: $2\pi r = \pi r^2$। दोनों ओर $\pi r$ से भाग दो: $r = 2$। π कट जाता है।`,
          ),
        },
        {
          id: "7",
          label: t("7 units", "7 इकाई"),
          feedback: t(
            r`7 comes from $\pi = \frac{22}{7}$, but π cancels: $2\pi r = \pi r^2$ gives $r = 2$.`,
            r`7, $\pi = \frac{22}{7}$ से आता है, पर π कट जाता है: $2\pi r = \pi r^2$ से $r = 2$।`,
          ),
        },
        {
          id: "4",
          label: t("4 units", "4 इकाई"),
          feedback: t(
            r`4 is the diameter of the right circle. Divide $2\pi r = \pi r^2$ by $\pi r$ to get $r$ itself.`,
            r`4 सही वृत्त का व्यास है। $2\pi r = \pi r^2$ को $\pi r$ से भाग देकर $r$ ख़ुद निकालो।`,
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        r`**Mission log.** ✓ One turn of the wheel: $2\pi r = 220$ cm, so 500 turns to school. ✓ Area of a circle: $\pi r^2$. ✗ The mudguard runs over only a slice of the wheel. How long is its strip, and how big is a slice? Next stop: sectors and segments.`,
        r`**मिशन लॉग।** ✓ पहिये का एक चक्कर: $2\pi r = 220$ cm, तो स्कूल तक 500 चक्कर। ✓ वृत्त का क्षेत्रफल: $\pi r^2$। ✗ मडगार्ड पहिये के सिर्फ़ एक टुकड़े के ऊपर चलता है। उसकी पट्टी कितनी लंबी है, और एक टुकड़ा कितना बड़ा है? अगला पड़ाव: त्रिज्यखंड और वृत्तखंड।`,
      ),
      "log",
      { isHidden: true },
    );
    b.when(equal.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([
      w.title(t("Your turn", "अब तुम्हारी बारी")),
      w.body(
        t(
          r`**Worked (Exercise 12.1, Q1).** Circles of radius 19 cm and 9 cm. Which circle has a circumference equal to the sum of theirs? $$2\pi R = 2\pi \times 19 + 2\pi \times 9$$ Divide every term by $2\pi$: $$R = 19 + 9 = 28 \text{ cm}$$`,
          r`**हल किया हुआ (प्रश्नावली 12.1, प्र 1)।** 19 cm और 9 cm त्रिज्या के वृत्त। किस वृत्त की परिधि इन दोनों की परिधियों के योग के बराबर है? $$2\pi R = 2\pi \times 19 + 2\pi \times 9$$ हर पद को $2\pi$ से भाग दो: $$R = 19 + 9 = 28 \text{ cm}$$`,
        ),
      ),
      w.body(
        t(
          r`For areas it's different: radii 8 and 6 give $\pi R^2 = 64\pi + 36\pi$, so $R^2 = 100$ and $R = 10$, not 14.`,
          r`क्षेत्रफल के लिए अलग है: त्रिज्याएँ 8 और 6 से $\pi R^2 = 64\pi + 36\pi$, तो $R^2 = 100$ और $R = 10$, 14 नहीं।`,
        ),
      ),
      equal,
      log,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [hook, why, circumference, area, example, inLife, yourTurn];

import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, goalQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  SimilarAction,
  SimilarDerived,
  SimilarPair,
  SimilarShape,
  TrianglesSceneKind,
  similarFiguresDef,
} from "@chalk/prop-triangles";
import { sceneOn } from "../kit";

const r = String.raw;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** Who, where, what: the colony's Republic Day lights, and the jobs that need maths. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const notice = sceneOn(
    b,
    "notice",
    TrianglesSceneKind.NoticeBoard,
    "the colony gate's notice board asking for volunteers to string Republic Day lights from the water tank to the gate pillar; Riya and Kabir reading it, the tall tank behind them",
  );
  return column([
    w.title(t("Lights on the water tank", "पानी की टंकी पर रोशनी")),
    notice,
    w.body(
      t(
        "It is Republic Day week. A notice goes up on the colony gate: this year a string of lights will run from the very top of the water tank down to the top of the gate pillar, and a big photo of the colony will go on the notice board. Volunteers wanted.",
        "गणतंत्र दिवस का हफ़्ता है। कॉलोनी के गेट पर एक नोटिस लगता है: इस साल रोशनी की एक लड़ी पानी की टंकी के बिल्कुल ऊपर से गेट के खंभे के ऊपर तक लगेगी, और नोटिस बोर्ड पर कॉलोनी की एक बड़ी फ़ोटो लगेगी। स्वयंसेवक चाहिए।",
      ),
    ),
    w.body(
      t(
        "Riya and Kabir sign up at once. Grandpa offers his ladder; Mom offers to deal with the print shop. But there are questions nobody can answer by looking. How tall is the tank, when nobody is allowed to climb it? How long must the wire be? Will the bigger photo really look like the small one?",
        "रिया और कबीर तुरंत नाम लिखा देते हैं। दादाजी अपनी सीढ़ी देने को कहते हैं; मम्मी फ़ोटो की दुकान सँभालने को। पर कुछ सवाल हैं जिनका जवाब देखकर कोई नहीं दे सकता। टंकी कितनी ऊँची है, जब उस पर चढ़ने की इजाज़त ही नहीं? तार कितना लंबा होना चाहिए? क्या बड़ी फ़ोटो सच में छोटी जैसी दिखेगी?",
      ),
    ),
    space(),
  ]);
});

/** Why this chapter: shapes that match without being the same size. The stops. */
const why = page("why", (b) => {
  const w = wordsOn(b);
  const tank = sceneOn(
    b,
    "tank",
    TrianglesSceneKind.WaterTank,
    "the foot of the water tank, its ladder locked; Kabir craning his neck, Grandpa shaking his head",
  );
  return column([
    w.title(t("What this chapter is for", "यह अध्याय किसलिए है")),
    tank,
    w.body(
      t(
        "Every one of these questions is answered the same way: find **two shapes with the same shape but different sizes**, one you can measure and one you can't. Surveyors find the heights of mountains this way, without ever climbing them. This chapter is about such shapes, mostly triangles.",
        "इन सब सवालों का जवाब एक ही तरीक़े से मिलता है: **एक जैसे आकार पर अलग-अलग माप वाली दो आकृतियाँ** ढूँढो, एक जिसे तुम नाप सको और एक जिसे नहीं। सर्वेक्षक पहाड़ों की ऊँचाई ऐसे ही निकालते हैं, बिना चढ़े। यह अध्याय ऐसी आकृतियों के बारे में है, ज़्यादातर त्रिभुजों के।",
      ),
    ),
    w.definition(
      t(
        "**The stops on the way.** (1) Similar figures: *this lesson*, and the photo. (2) A line parallel to one side of a triangle. (3) Triangles similar by their angles or by their sides. (4) A third test, and the tank's height. (5) Areas, and what a bigger banner costs. (6) Pythagoras, and the length of the wire. (7) A few challenges, and lights on.",
        "**रास्ते के पड़ाव।** (1) समरूप आकृतियाँ: *यह पाठ*, और फ़ोटो। (2) त्रिभुज की एक भुजा के समांतर रेखा। (3) कोणों से या भुजाओं से समरूप त्रिभुज। (4) एक तीसरी कसौटी, और टंकी की ऊँचाई। (5) क्षेत्रफल, और बड़े बैनर का ख़र्च। (6) पाइथागोरस, और तार की लंबाई। (7) कुछ चुनौतियाँ, और रोशनी।",
      ),
    ),
    w.body(
      t(
        'First stop: what exactly does "the same shape" mean?',
        'पहला पड़ाव: "एक जैसा आकार" का ठीक-ठीक मतलब क्या है?',
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Congruent recalled; similar defined; all circles, squares, equilateral triangles are similar. */
const sameShape = page(
  "same-shape",
  (b) => {
    const w = wordsOn(b);
    const always = choiceQuestion(b, {
      name: "always",
      prompt: t(
        "Which two figures are **always** similar, whatever their sizes?",
        "कौन-सी दो आकृतियाँ **हमेशा** समरूप होती हैं, चाहे उनके माप कुछ भी हों?",
      ),
      options: [
        { id: "right", label: t("Two equilateral triangles", "दो समबाहु त्रिभुज") },
        {
          id: "iso",
          label: t("Two isosceles triangles", "दो समद्विबाहु त्रिभुज"),
          feedback: t(
            "One isosceles triangle can be tall and thin, another short and wide: same kind, different shapes.",
            "एक समद्विबाहु त्रिभुज लंबा और पतला हो सकता है, दूसरा छोटा और चौड़ा: एक ही तरह के, पर अलग आकार।",
          ),
        },
        {
          id: "rect",
          label: t("Two rectangles", "दो आयत"),
          feedback: t(
            "A long thin rectangle and a nearly square one have different shapes.",
            "एक लंबा पतला आयत और लगभग वर्ग जैसा आयत अलग आकार के हैं।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Same shape, any size", "एक जैसा आकार, कोई भी माप")),
      w.definition(
        t(
          "**Congruent figures** (from Class IX) have the same shape **and** the same size: one fits exactly on top of the other. All circles with the same radius are congruent; so are all squares with the same side.",
          "**सर्वांगसम आकृतियाँ** (कक्षा IX से) का आकार **और** माप दोनों एक जैसे होते हैं: एक दूसरी पर बिल्कुल ठीक बैठ जाती है। एक ही त्रिज्या वाले सारे वृत्त सर्वांगसम हैं; एक ही भुजा वाले सारे वर्ग भी।",
        ),
      ),
      w.definition(
        t(
          "**Similar figures** have the same shape but not necessarily the same size. Any two circles are similar; so are any two squares, and any two equilateral triangles.",
          "**समरूप आकृतियों** का आकार एक जैसा होता है, पर माप ज़रूरी नहीं कि एक जैसा हो। कोई भी दो वृत्त समरूप हैं; कोई भी दो वर्ग भी, और कोई भी दो समबाहु त्रिभुज भी।",
        ),
      ),
      w.body(
        t(
          "So every pair of congruent figures is similar, but similar figures need not be congruent. A circle and a square are never similar, and neither are a triangle and a square: you can see it at a glance.",
          "तो सर्वांगसम आकृतियों का हर जोड़ा समरूप है, पर समरूप आकृतियाँ ज़रूरी नहीं कि सर्वांगसम हों। एक वृत्त और एक वर्ग कभी समरूप नहीं होते, न ही एक त्रिभुज और एक वर्ग: यह एक नज़र में दिख जाता है।",
        ),
      ),
      always,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The test for polygons: equal angles and sides in one ratio; the scale factor. */
const polygons = page(
  "polygons",
  (b) => {
    const w = wordsOn(b);
    const pair = b.prop(similarFiguresDef, "pair", {
      pair: SimilarPair.Enlarged,
      shape: SimilarShape.Quadrilateral,
      scale: 1.5,
      firstNames: ["A", "B", "C", "D"],
      secondNames: ["P", "Q", "R", "S"],
      canScale: true,
      showAngles: true,
      showRatios: true,
      showVerdict: true,
    });
    b.studentOnly(pair.action(SimilarAction.NudgeScale));
    b.standsFor(
      pair,
      "a quadrilateral ABCD and its enlargement PQRS, with every angle and the ratio of each pair of matching sides shown; the learner changes the scale factor",
    );
    const goal = goalQuestion(b, {
      about: pair,
      prompt: t(
        "Make PQRS exactly twice the size of ABCD: every side of PQRS twice the matching side of ABCD.",
        "PQRS को ABCD का ठीक दुगुना बनाओ: PQRS की हर भुजा ABCD की संगत भुजा की दुगुनी।",
      ),
      isMet: pair.field("scale").eq(2),
      solve: [
        pair.learner(SimilarAction.NudgeScale, { by: 1 }),
        pair.learner(SimilarAction.NudgeScale, { by: 1 }),
      ],
    });
    return column([
      w.title(t("When are two polygons similar?", "दो बहुभुज कब समरूप होते हैं?")),
      w.body(
        t(
          'A photographer prints the same picture in stamp size, passport size and postcard size. Every line in the small print is stretched by the same number in the big one, and the angles between lines don\'t change. That is what "the same shape" means.',
          'एक फ़ोटोग्राफ़र वही तस्वीर स्टैम्प, पासपोर्ट और पोस्टकार्ड माप में छापती है। छोटी फ़ोटो की हर रेखा बड़ी में एक ही संख्या से खिंच जाती है, और रेखाओं के बीच के कोण नहीं बदलते। "एक जैसा आकार" का यही मतलब है।',
        ),
      ),
      w.definition(
        t(
          "**Similar polygons.** Two polygons with the same number of sides are similar if (i) their **corresponding angles are equal** and (ii) their **corresponding sides are in the same ratio** (in proportion). **Corresponding** means matching: the parts that sit in the same place in the two figures.",
          "**समरूप बहुभुज।** समान संख्या की भुजाओं वाले दो बहुभुज समरूप होते हैं यदि (i) उनके **संगत कोण बराबर हों** और (ii) उनकी **संगत भुजाएँ एक ही अनुपात में हों** (समानुपाती हों)। **संगत** का मतलब है मेल खाते: वे हिस्से जो दोनों आकृतियों में एक ही जगह पर हैं।",
        ),
      ),
      w.definition(
        t(
          "**Scale factor.** That one ratio of corresponding sides is called the **scale factor** (or representative fraction). Maps and building plans are drawn to a scale factor.",
          "**पैमाना गुणक।** संगत भुजाओं के उस एक अनुपात को **पैमाना गुणक** (या प्रतिनिधि भिन्न) कहते हैं। नक्शे और भवनों के नक्शे एक पैमाना गुणक पर बनाए जाते हैं।",
        ),
      ),
      pair,
      goal,
      w.body(
        t(
          r`At scale factor 2: $$\frac{PQ}{AB} = \frac{QR}{BC} = \frac{RS}{CD} = \frac{SP}{DA} = 2$$ and every angle of PQRS equals the matching angle of ABCD. Both conditions hold, so the quadrilaterals are similar.`,
          r`पैमाना गुणक 2 पर: $$\frac{PQ}{AB} = \frac{QR}{BC} = \frac{RS}{CD} = \frac{SP}{DA} = 2$$ और PQRS का हर कोण ABCD के संगत कोण के बराबर है। दोनों शर्तें पूरी हैं, इसलिए चतुर्भुज समरूप हैं।`,
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Fig 6.6 and 6.7: one condition alone isn't enough for polygons. */
const twoConditions = page(
  "two-conditions",
  (b) => {
    const w = wordsOn(b);
    const rect = b.prop(similarFiguresDef, "rect", {
      pair: SimilarPair.SquareRectangle,
      firstNames: ["A", "B", "C", "D"],
      secondNames: ["P", "Q", "R", "S"],
      canScale: false,
      showAngles: true,
      showRatios: true,
      showVerdict: true,
    });
    b.standsFor(
      rect,
      "a square and a rectangle: all angles 90° in both, but the sides are not in one ratio",
    );
    const rhombus = b.prop(similarFiguresDef, "rhombus", {
      pair: SimilarPair.SquareRhombus,
      angle: 60,
      firstNames: ["A", "B", "C", "D"],
      secondNames: ["P", "Q", "R", "S"],
      canScale: false,
      canSetAngle: true,
      showAngles: true,
      showRatios: true,
      showVerdict: true,
    });
    b.studentOnly(rhombus.action(SimilarAction.NudgeAngle));
    b.standsFor(
      rhombus,
      "a square and a rhombus with equal sides in one ratio, whose angle the learner can open or close",
    );
    const goal = goalQuestion(b, {
      about: rhombus,
      prompt: t(
        "Change the rhombus's angle until it is similar to the square.",
        "समचतुर्भुज का कोण तब तक बदलो जब तक वह वर्ग के समरूप न हो जाए।",
      ),
      isMet: rhombus.derived(SimilarDerived.IsSimilar).eq(true),
      solve: [
        rhombus.learner(SimilarAction.NudgeAngle, { by: 1 }),
        rhombus.learner(SimilarAction.NudgeAngle, { by: 1 }),
        rhombus.learner(SimilarAction.NudgeAngle, { by: 1 }),
      ],
    });
    return column([
      w.title(t("Both conditions, not one", "दोनों शर्तें, एक नहीं")),
      w.body(
        t(
          "A square and a rectangle: every angle is 90° in both, so the angles match. But the square's sides are all equal and the rectangle's are not, so the sides are **not** in one ratio. They are not similar.",
          "एक वर्ग और एक आयत: दोनों में हर कोण 90° है, तो कोण मेल खाते हैं। पर वर्ग की सारी भुजाएँ बराबर हैं और आयत की नहीं, इसलिए भुजाएँ एक अनुपात में **नहीं** हैं। वे समरूप नहीं हैं।",
        ),
      ),
      rect,
      w.body(
        t(
          "A square and a rhombus: all sides equal in both, so the sides are in one ratio. But a rhombus's angles need not be 90°.",
          "एक वर्ग और एक समचतुर्भुज: दोनों में सारी भुजाएँ बराबर हैं, तो भुजाएँ एक अनुपात में हैं। पर समचतुर्भुज के कोण 90° हों, यह ज़रूरी नहीं।",
        ),
      ),
      rhombus,
      goal,
      w.note(
        t(
          "So for polygons, equal angles alone are not enough, and sides in one ratio alone are not enough. Both conditions must hold.",
          "तो बहुभुजों के लिए, केवल बराबर कोण काफ़ी नहीं, और केवल एक अनुपात वाली भुजाएँ भी काफ़ी नहीं। दोनों शर्तें पूरी होनी चाहिए।",
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Activity 1: a card's shadow under a bulb is an enlargement; vertex correspondence. */
const shadow = page(
  "shadow",
  (b) => {
    const w = wordsOn(b);
    const bulb = b.prop(similarFiguresDef, "bulb", {
      pair: SimilarPair.Shadow,
      shape: SimilarShape.Quadrilateral,
      scale: 1.5,
      firstNames: ["A", "B", "C", "D"],
      secondNames: ["A′", "B′", "C′", "D′"],
      canScale: true,
      showAngles: false,
      showRatios: true,
      showVerdict: true,
    });
    b.studentOnly(bulb.action(SimilarAction.NudgeScale));
    b.standsFor(
      bulb,
      "a bulb O above a cardboard quadrilateral ABCD held parallel to the table, and its shadow A′B′C′D′ on the table, each shadow corner on the ray from O through the card's corner",
    );
    const why = choiceQuestion(b, {
      name: "why",
      prompt: t(
        "Why does the shadow keep the card's shape, only bigger?",
        "छाया का आकार कार्ड जैसा ही क्यों रहता है, बस बड़ा?",
      ),
      options: [
        {
          id: "right",
          label: t("Light travels in straight lines from O", "प्रकाश O से सीधी रेखाओं में चलता है"),
        },
        {
          id: "near",
          label: t("The table is close below the card", "मेज़ कार्ड के ठीक नीचे पास है"),
          feedback: t(
            "Move the card and the shadow's size changes, but its shape stays. The reason is how light travels.",
            "कार्ड खिसकाओ तो छाया का माप बदलता है, पर आकार वही रहता है। कारण यह है कि प्रकाश कैसे चलता है।",
          ),
        },
        {
          id: "bright",
          label: t("The bulb is brighter than the room", "बल्ब कमरे से ज़्यादा चमकीला है"),
          feedback: t(
            "Brightness makes the shadow darker, not the same shape. A′ lies on the straight ray OA, B′ on OB, and so on.",
            "चमक से छाया गहरी होती है, आकार वही नहीं। A′ सीधी किरण OA पर है, B′ OB पर, और इसी तरह।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("A shadow is an enlargement", "छाया एक बड़ा रूप है")),
      w.body(
        t(
          "Activity 1. Hang a bulb at O on the ceiling. Hold a cardboard quadrilateral ABCD flat, parallel to the table, between the bulb and the table. Its shadow A′B′C′D′ falls on the table. Move the card up and down.",
          "क्रियाकलाप 1। छत पर O पर एक बल्ब लटकाओ। गत्ते का एक चतुर्भुज ABCD, मेज़ के समांतर, बल्ब और मेज़ के बीच सपाट पकड़ो। उसकी छाया A′B′C′D′ मेज़ पर पड़ती है। कार्ड को ऊपर-नीचे करो।",
        ),
      ),
      bulb,
      w.body(
        t(
          r`A′ lies on the ray OA, B′ on OB, C′ on OC and D′ on OD. Vertex A′ corresponds to A, written A′ ↔ A, and so on. Measuring shows $$\angle A = \angle A', \ \angle B = \angle B', \ \angle C = \angle C', \ \angle D = \angle D'$$ $$\frac{AB}{A'B'} = \frac{BC}{B'C'} = \frac{CD}{C'D'} = \frac{DA}{D'A'}$$ So the shadow is similar to the card.`,
          r`A′ किरण OA पर है, B′ OB पर, C′ OC पर और D′ OD पर। शीर्ष A′ शीर्ष A के संगत है, लिखते हैं A′ ↔ A, और इसी तरह। नापने पर $$\angle A = \angle A', \ \angle B = \angle B', \ \angle C = \angle C', \ \angle D = \angle D'$$ $$\frac{AB}{A'B'} = \frac{BC}{B'C'} = \frac{CD}{C'D'} = \frac{DA}{D'A'}$$ तो छाया कार्ड के समरूप है।`,
        ),
      ),
      why,
      w.note(
        t(
          "If a first polygon is similar to a second, and the second to a third, then the first is similar to the third.",
          "अगर पहला बहुभुज दूसरे के समरूप है, और दूसरा तीसरे के, तो पहला तीसरे के समरूप है।",
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

/** The photo shop's prints: which one is a true enlargement? */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const shop = sceneOn(
      b,
      "shop",
      TrianglesSceneKind.PhotoShop,
      "a photo shop counter with three prints of the colony photo in different sizes and one print stretched sideways; Riya holding up the stretched one",
    );
    const stretched = choiceQuestion(b, {
      name: "stretched",
      prompt: t(
        "The original photo is 10 cm wide and 8 cm tall. The shop offers a print 15 cm wide and 10 cm tall. Is it similar to the original?",
        "मूल फ़ोटो 10 cm चौड़ी और 8 cm ऊँची है। दुकान 15 cm चौड़ा और 10 cm ऊँचा प्रिंट देती है। क्या यह मूल के समरूप है?",
      ),
      options: [
        {
          id: "right",
          label: t("No: 15/10 is not 10/8", "नहीं: 15/10, 10/8 के बराबर नहीं"),
        },
        {
          id: "angles",
          label: t("Yes: all its corners are 90°", "हाँ: इसके सारे कोने 90° हैं"),
          feedback: t(
            "Equal angles alone are not enough for rectangles: the sides must be in one ratio too, and 1.5 ≠ 1.25.",
            "आयतों के लिए केवल बराबर कोण काफ़ी नहीं: भुजाएँ भी एक अनुपात में होनी चाहिए, और 1.5 ≠ 1.25।",
          ),
        },
        {
          id: "bigger",
          label: t("Yes: both sides got bigger", "हाँ: दोनों भुजाएँ बड़ी हुईं"),
          feedback: t(
            "Bigger isn't enough: both must grow by the same number. Width grew 1.5 times, height 1.25 times.",
            "बड़ा होना काफ़ी नहीं: दोनों एक ही संख्या से बढ़नी चाहिए। चौड़ाई 1.5 गुना बढ़ी, ऊँचाई 1.25 गुना।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const fixed = w.body(
      t(
        r`That is the stretched print: the tank looks fat in it. Riya asks for 15 cm by 12 cm instead: $$\frac{15}{10} = \frac{12}{8} = 1.5$$ Same angles, one ratio: a true enlargement, scale factor 1.5. **Stop 1 done.**`,
        r`यही खिंचा हुआ प्रिंट है: इसमें टंकी मोटी दिखती है। रिया इसकी जगह 15 cm × 12 cm माँगती है: $$\frac{15}{10} = \frac{12}{8} = 1.5$$ वही कोण, एक अनुपात: सच्चा बड़ा रूप, पैमाना गुणक 1.5। **पड़ाव 1 पूरा।**`,
      ),
      "fixed",
      { isHidden: true },
    );
    b.when(stretched.on(QuestionSignal.Correct), [theBoard.show(fixed), theBoard.pass()]);
    return column([
      w.title(t("Back at the photo shop", "फिर फ़ोटो की दुकान पर")),
      shop,
      w.body(
        t(
          "Mom brings home three sample prints of the colony photo for the notice board. Two look right. In the third, the water tank looks strangely fat.",
          "मम्मी नोटिस बोर्ड के लिए कॉलोनी की फ़ोटो के तीन नमूना प्रिंट घर लाती हैं। दो ठीक दिखते हैं। तीसरे में पानी की टंकी अजीब तरह से मोटी दिखती है।",
        ),
      ),
      stretched,
      fixed,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Exercise 6.1: the definitions, as fill-in questions; then the mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const squares = choiceQuestion(b, {
      name: "squares",
      prompt: t(
        "Exercise 6.1 Q1 (ii): all squares are ______.",
        "प्रश्नावली 6.1 प्र1 (ii): सभी वर्ग ______ होते हैं।",
      ),
      options: [
        { id: "right", label: t("similar", "समरूप") },
        {
          id: "cong",
          label: t("congruent", "सर्वांगसम"),
          feedback: t(
            "A 2 cm square and a 5 cm square have the same shape but not the same size.",
            "2 cm का वर्ग और 5 cm का वर्ग एक ही आकार के हैं, पर एक ही माप के नहीं।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const which = choiceQuestion(b, {
      name: "which",
      prompt: t(
        "Exercise 6.1 Q1 (iii): all ______ triangles are similar.",
        "प्रश्नावली 6.1 प्र1 (iii): सभी ______ त्रिभुज समरूप होते हैं।",
      ),
      options: [
        { id: "right", label: t("equilateral", "समबाहु") },
        {
          id: "iso",
          label: t("isosceles", "समद्विबाहु"),
          feedback: t(
            "Isosceles triangles can have any top angle, so their shapes differ. Equilateral ones are all 60°, 60°, 60°.",
            "समद्विबाहु त्रिभुजों का शीर्ष कोण कुछ भी हो सकता है, इसलिए आकार अलग होते हैं। समबाहु सारे 60°, 60°, 60° होते हैं।",
          ),
        },
        {
          id: "right-angled",
          label: t("right-angled", "समकोण"),
          feedback: t(
            "A right triangle can be 90°, 45°, 45° or 90°, 60°, 30°: different shapes.",
            "समकोण त्रिभुज 90°, 45°, 45° या 90°, 60°, 30° हो सकता है: अलग आकार।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ Similar means same shape: corresponding angles equal and corresponding sides in one ratio. ✓ The photo print is fixed: 15 cm by 12 cm. Next: the tank still needs measuring, and that starts with a line parallel to one side of a triangle.",
        "**मिशन लॉग।** ✓ समरूप का मतलब एक जैसा आकार: संगत कोण बराबर और संगत भुजाएँ एक अनुपात में। ✓ फ़ोटो प्रिंट ठीक हो गया: 15 cm × 12 cm। आगे: टंकी अब भी नापनी है, और इसकी शुरुआत त्रिभुज की एक भुजा के समांतर रेखा से होती है।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(which.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), squares, which, log, space()]);
  },
  { passOn: PassOn.Rules },
);

export const overview = [hook, why, sameShape, polygons, twoConditions, shadow, inLife, yourTurn];

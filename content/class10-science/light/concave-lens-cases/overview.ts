import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, goalQuestion, wordsOn } from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  LensAction,
  LensDerived,
  LensKind,
  LensRay,
  SceneKind,
  lensDef,
  lightSceneDef,
} from "@chalk/prop-light";

const still = { isLit: true, canToggle: false } as const;
const concave = { kind: LensKind.Concave, focalLength: 10, showLabels: true } as const;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** Where the mission stands, and the peephole: could a lens that spreads light project? */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const shapes = b.prop(lightSceneDef, "shapes", { scene: SceneKind.LensShapes, ...still });
  b.standsFor(
    shapes,
    "two lenses cut in half: a convex one, thicker in the middle, bringing rays together, and a concave one, thinner in the middle, spreading them apart",
  );
  return column([
    w.title(t("The peephole", "दरवाज़े की झाँकी")),
    w.body(
      t(
        "Stop 4, lenses. Friday night, and the shoebox projector works: with Grandpa's magnifying glass at the front and the phone slid into the right spot, the movie lands on the wall. But the box is big. Kabir wants a smaller one, and in the toolbox he has found the little glass peephole from the old front door.",
        "पड़ाव 4, लेंस। शुक्रवार रात, और जूते के डिब्बे वाला प्रोजेक्टर चल रहा है: आगे दादाजी का आवर्धक काँच, और फ़ोन सही जगह खिसकाने पर फ़िल्म दीवार पर उतर आती है। पर डिब्बा बड़ा है। कबीर को छोटा वाला चाहिए, और औज़ारों के डिब्बे में उसे पुराने दरवाज़े की छोटी काँच वाली झाँकी मिली है।",
      ),
    ),
    shapes,
    w.body(
      t(
        "Look through the peephole and the whole room is tiny, upright, squeezed into a circle. The peephole is the other kind of lens, the one on the right: thinner in the middle. Can a lens like that throw the movie onto a wall?",
        "झाँकी से देखो तो पूरा कमरा नन्हा, सीधा, एक गोले में सिमटा दिखता है। झाँकी दूसरी तरह का लेंस है, दाईं ओर वाला: बीच में पतला। क्या ऐसा लेंस फ़िल्म को दीवार पर डाल सकता है?",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** The concave lens and its three rays (NCERT 10.3.5, Figs 10.13–10.15 b). */
const rays = page(
  "rays",
  (b) => {
    const w = wordsOn(b);
    const g = b.prop(lensDef, "lens", {
      ...concave,
      object: { x: -30, height: 5 },
      rays: [LensRay.Parallel, LensRay.Focal, LensRay.Centre],
      showImage: true,
    });
    b.studentOnly(g.action(LensAction.MoveObject));
    b.standsFor(
      g,
      "a concave lens (f = 10 cm) with the three standard rays from the object's tip; after the lens they spread apart, and their dashed lines meet on the object's side",
    );
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "A ray parallel to the axis passes through a concave lens. After the lens it…",
        "अक्ष के समानांतर एक किरण अवतल लेंस से गुज़रती है। लेंस के बाद वह…",
      ),
      options: [
        {
          id: "right",
          label: t(
            "spreads away, as if it came from F₁ on the object's side",
            "दूर फैलती है, मानो वस्तु वाली ओर F₁ से आई हो",
          ),
        },
        {
          id: "f2",
          label: t(
            "passes through F₂ on the far side, like a convex lens",
            "उत्तल लेंस की तरह दूसरी ओर F₂ से गुज़रती है",
          ),
          feedback: t(
            "That's a convex lens, which brings rays together. A concave lens spreads them apart.",
            "यह उत्तल लेंस है, जो किरणों को इकट्ठा करता है। अवतल लेंस उन्हें फैलाता है।",
          ),
        },
        {
          id: "straight",
          label: t("goes straight on, without bending at all", "बिल्कुल बिना मुड़े सीधी चली जाती है"),
          feedback: t(
            "Only the ray through O goes straight on.",
            "केवल O से होकर जाती किरण सीधी जाती है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("A lens that spreads light", "प्रकाश फैलाने वाला लेंस")),
      w.definition(
        t(
          "**Concave lens.** A lens that is **thinner in the middle** than at its edges is a **concave lens**. It bends rays **away** from each other, so it is also called a **diverging lens**. Parallel rays come out spreading, as if they all started from one point on the side the light came from. That point is its focus **F₁**.",
          "**अवतल लेंस।** जो लेंस किनारों से **बीच में पतला** हो, वह **अवतल लेंस** है। यह किरणों को एक-दूसरे से **दूर** मोड़ता है, इसलिए इसे **अपसारी लेंस** भी कहते हैं। समानांतर किरणें फैलती हुई निकलती हैं, मानो सब उस ओर के एक बिंदु से चली हों जिधर से प्रकाश आया। वह बिंदु इसका फोकस **F₁** है।",
        ),
      ),
      w.definition(
        t(
          "**Its three easy rays.** **1.** A ray **parallel to the axis** comes out as if from **F₁**. **2.** A ray heading **towards F₂** comes out **parallel** to the axis. **3.** A ray **through O** goes **straight on**. The rays after the lens never meet, so we extend them backwards as dashed lines. Where the dashed lines meet is the image.",
          "**इसकी तीन आसान किरणें।** **1.** **अक्ष के समानांतर** किरण ऐसे निकलती है मानो **F₁** से आई हो। **2.** **F₂ की ओर** जाती किरण अक्ष के **समानांतर** निकलती है। **3.** **O से होकर** जाती किरण **सीधी** जाती है। लेंस के बाद किरणें कभी नहीं मिलतीं, इसलिए हम उन्हें बिंदुदार रेखाओं से पीछे बढ़ाते हैं। जहाँ बिंदुदार रेखाएँ मिलती हैं, वहीं प्रतिबिंब है।",
        ),
      ),
      g,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** NCERT Activity 10.13: drag the candle anywhere; always virtual, erect, diminished. */
const candle = page(
  "candle",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "NCERT Activity 10.13: a concave lens has only one kind of image. Wherever the object is, the image is on the same side, between F1 and O, virtual, erect and diminished; the farther the object, the smaller the image and the closer to F1.",
    );
    const guess = choiceQuestion(b, {
      name: "guess",
      prompt: t(
        "A burning candle stands in front of a concave lens. Will its image ever land on a screen, wherever the candle is?",
        "एक जलती मोमबत्ती अवतल लेंस के सामने है। क्या उसका प्रतिबिंब कभी पर्दे पर उतरेगा, मोमबत्ती कहीं भी हो?",
      ),
      options: [
        { id: "right", label: t("No, never", "नहीं, कभी नहीं") },
        {
          id: "far",
          label: t("Yes, once the candle is far enough", "हाँ, जब मोमबत्ती काफ़ी दूर हो"),
          feedback: t(
            "A concave lens always spreads the rays apart, so they never meet. Try it below.",
            "अवतल लेंस किरणों को हमेशा फैलाता है, इसलिए वे कभी नहीं मिलतीं। नीचे आज़माओ।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const g = b.prop(
      lensDef,
      "lens",
      {
        ...concave,
        object: { x: -25, height: 5 },
        rays: [LensRay.Parallel, LensRay.Centre],
        showImage: true,
      },
      { isHidden: true },
    );
    b.studentOnly(g.action(LensAction.MoveObject));
    b.standsFor(
      g,
      "a concave lens (f = 10 cm), a candle as the blue arrow and its image on the same side",
    );
    const seen = w.body(
      t(
        "Drag the candle anywhere. No screen ever catches anything: after the lens the rays always spread apart. Traced back, they meet on the candle's side, **between F₁ and O**. So the image is always **virtual, erect and diminished**. The farther the candle, the smaller the image, and the closer it gets to F₁.",
        "मोमबत्ती को कहीं भी खिसकाओ। कोई पर्दा कभी कुछ नहीं पकड़ता: लेंस के बाद किरणें हमेशा फैलती हैं। पीछे बढ़ाने पर वे मोमबत्ती वाली ओर, **F₁ और O के बीच** मिलती हैं। इसलिए प्रतिबिंब हमेशा **आभासी, सीधा और छोटा** होता है। मोमबत्ती जितनी दूर, प्रतिबिंब उतना छोटा, और F₁ के उतना पास।",
      ),
      "seen",
      { isHidden: true },
    );
    b.when(guess.on(QuestionSignal.Correct), [
      theBoard.show(g),
      theBoard.show(seen),
      theBoard.pass(),
    ]);
    return column([
      w.title(t("Try it: the candle", "करके देखो: मोमबत्ती")),
      w.body(
        t(
          "NCERT's activity: put a candle in front of a concave lens, try to catch its image on a screen, then move the candle farther away and watch the image.",
          "NCERT की गतिविधि: अवतल लेंस के सामने एक मोमबत्ती रखो, उसका प्रतिबिंब पर्दे पर पकड़ने की कोशिश करो, फिर मोमबत्ती को दूर ले जाओ और प्रतिबिंब देखो।",
        ),
      ),
      guess,
      g,
      seen,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Draw a concave-lens diagram yourself: two rays, extend them back, mark the image. */
const drawIt = page(
  "draw-it",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "Draw a concave-lens ray diagram yourself: object 20 cm from a concave lens of f = 10 cm; switch on two rays, follow their dashed extensions back, and drag the ? where they meet. The image is at v = −6.7 cm, tip at +1.7 cm: virtual, erect, diminished.",
    );
    const g = b.prop(lensDef, "lens", {
      ...concave,
      object: { x: -20, height: 5 },
      rays: [],
      showImage: false,
      canPickRays: true,
      markImage: true,
    });
    b.studentOnly(g.action(LensAction.ToggleRay));
    b.studentOnly(g.action(LensAction.MoveMark));
    b.standsFor(
      g,
      "a concave lens (f = 10 cm) with an object 20 cm to the left, buttons 1, 2, 3 to switch on the standard rays, and a ? marker to drop where the image's tip is",
    );
    const goal = goalQuestion(b, {
      about: g,
      prompt: t(
        "Switch on any two rays. They spread apart after the lens, so follow their dashed lines back. Drag the ? to where the dashed lines meet.",
        "कोई दो किरणें चालू करो। लेंस के बाद वे फैलती हैं, इसलिए उनकी बिंदुदार रेखाएँ पीछे की ओर देखो। ? को वहाँ खींचो जहाँ बिंदुदार रेखाएँ मिलती हैं।",
      ),
      isMet: g.derived(LensDerived.MarkOnImage),
      solve: [
        g.learner(LensAction.ToggleRay, { ray: LensRay.Parallel }),
        g.learner(LensAction.ToggleRay, { ray: LensRay.Centre }),
        g.learner(LensAction.MoveMark, { x: -6.67, y: 1.67 }),
      ],
    });
    const found = w.body(
      t(
        "Found it: about 6.7 cm from the lens, on the object's own side, above the axis. Virtual, erect and smaller, just as the candle showed.",
        "मिल गया: लेंस से लगभग 6.7 सेमी पर, वस्तु की अपनी ओर, अक्ष के ऊपर। आभासी, सीधा और छोटा, ठीक जैसा मोमबत्ती ने दिखाया।",
      ),
      "found",
      { isHidden: true },
    );
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(found));
    return column([w.title(t("Draw it yourself", "ख़ुद बनाओ")), g, goal, found, space()]);
  },
  { passOn: PassOn.Rules },
);

/** NCERT Table 10.5, then all four (two mirrors, two lenses) side by side. */
const table = page(
  "table",
  (b) => {
    const w = wordsOn(b);
    const real = choiceQuestion(b, {
      name: "real",
      prompt: t(
        "Which of these can never make a real image?",
        "इनमें से कौन कभी वास्तविक प्रतिबिंब नहीं बना सकता?",
      ),
      options: [
        { id: "right", label: t("A convex mirror and a concave lens", "उत्तल दर्पण और अवतल लेंस") },
        {
          id: "concave",
          label: t("A concave mirror and a concave lens", "अवतल दर्पण और अवतल लेंस"),
          feedback: t(
            "A concave mirror makes real images whenever the object is beyond F.",
            "अवतल दर्पण वास्तविक प्रतिबिंब बनाता है जब भी वस्तु F से परे हो।",
          ),
        },
        {
          id: "convex",
          label: t("A convex mirror and a convex lens", "उत्तल दर्पण और उत्तल लेंस"),
          feedback: t(
            "A convex lens makes real images whenever the object is beyond F₁.",
            "उत्तल लेंस वास्तविक प्रतिबिंब बनाता है जब भी वस्तु F₁ से परे हो।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("The concave lens, summed up", "अवतल लेंस, सार में")),
      w.body(
        t(
          "**Object at infinity** → image at F₁: virtual, erect, point-sized",
          "**वस्तु अनंत पर** → प्रतिबिंब F₁ पर: आभासी, सीधा, बिंदु जैसा",
        ),
      ),
      w.body(
        t(
          "**Object anywhere else** → image between F₁ and O, on the same side: virtual, erect, diminished",
          "**वस्तु और कहीं भी** → प्रतिबिंब F₁ और O के बीच, उसी ओर: आभासी, सीधा, छोटा",
        ),
      ),
      w.definition(
        t(
          "**Two that gather, two that spread.** The **concave mirror** and the **convex lens** bring light together. They make real, inverted images, and a virtual, erect, enlarged one only when the object is closer than F. The **convex mirror** and the **concave lens** only spread light apart. Their image is always virtual, erect and diminished.",
          "**दो जो इकट्ठा करते, दो जो फैलाते।** **अवतल दर्पण** और **उत्तल लेंस** प्रकाश को इकट्ठा करते हैं। वे वास्तविक, उल्टे प्रतिबिंब बनाते हैं, और आभासी, सीधा, बड़ा प्रतिबिंब तभी जब वस्तु F से पास हो। **उत्तल दर्पण** और **अवतल लेंस** प्रकाश को केवल फैलाते हैं। उनका प्रतिबिंब हमेशा आभासी, सीधा और छोटा होता है।",
        ),
      ),
      real,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** The peephole explained; Kabir's smaller projector won't work. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const peep = b.prop(lensDef, "peep", {
      ...concave,
      object: { x: -40, height: 7 },
      rays: [LensRay.Parallel, LensRay.Centre],
      showImage: true,
    });
    b.standsFor(
      peep,
      "a concave lens (f = 10 cm) and a tall object far away: its image is small, upright and close to the lens on the object's side",
    );
    const box = choiceQuestion(b, {
      name: "box",
      prompt: t(
        "Kabir swaps the magnifying glass for the peephole. What appears on the wall?",
        "कबीर आवर्धक काँच की जगह झाँकी लगा देता है। दीवार पर क्या दिखता है?",
      ),
      options: [
        {
          id: "right",
          label: t("No picture: the image is virtual", "कोई तस्वीर नहीं: प्रतिबिंब आभासी है"),
        },
        {
          id: "small",
          label: t("A small, upright picture, a little blurry", "एक छोटी, सीधी तस्वीर, थोड़ी धुँधली"),
          feedback: t(
            "Small and upright, yes, but virtual: the rays spread apart and never meet on the wall.",
            "छोटी और सीधी, हाँ, पर आभासी: किरणें फैल जाती हैं और दीवार पर कभी नहीं मिलतीं।",
          ),
        },
        {
          id: "big",
          label: t(
            "A big, upside-down picture, like a projector's",
            "प्रोजेक्टर जैसी एक बड़ी, उल्टी तस्वीर",
          ),
          feedback: t(
            "That needs a lens that brings light together. A concave lens only spreads it.",
            "इसके लिए प्रकाश इकट्ठा करने वाला लेंस चाहिए। अवतल लेंस उसे केवल फैलाता है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const stop = w.definition(
      t(
        "**Stop 4, one more piece.** A lens that spreads light can never project, so the peephole goes back in the toolbox. Only things that **bring light together**, a concave mirror or a convex lens, can put a picture on a wall. The magnifying glass stays.",
        "**पड़ाव 4, एक और टुकड़ा।** प्रकाश फैलाने वाला लेंस कभी प्रोजेक्ट नहीं कर सकता, इसलिए झाँकी वापस औज़ारों के डिब्बे में जाती है। केवल वे चीज़ें जो **प्रकाश को इकट्ठा करती** हैं, अवतल दर्पण या उत्तल लेंस, दीवार पर तस्वीर डाल सकती हैं। आवर्धक काँच ही रहेगा।",
      ),
      "stop",
      { isHidden: true },
    );
    b.when(box.on(QuestionSignal.Correct), [theBoard.show(stop), theBoard.pass()]);
    return column([
      w.title(t("Back to the peephole", "फिर झाँकी")),
      w.body(
        t(
          "Now the peephole makes sense. It is a strong concave lens. Someone standing far outside the door is the object, and the lens makes a tiny, upright, virtual image of them close to the glass. Your eye looks at that image. That's why you see the whole corridor, small, and why nothing ever lands on a wall.",
          "अब झाँकी समझ आती है। यह एक तेज़ अवतल लेंस है। दरवाज़े के बाहर दूर खड़ा कोई व्यक्ति वस्तु है, और लेंस काँच के पास उसका नन्हा, सीधा, आभासी प्रतिबिंब बनाता है। तुम्हारी आँख उस प्रतिबिंब को देखती है। इसीलिए पूरा गलियारा छोटा दिखता है, और इसीलिए दीवार पर कभी कुछ नहीं उतरता।",
        ),
      ),
      peep,
      box,
      stop,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** A worked description from a diagram. */
const example = page("example", (b) => {
  const w = wordsOn(b);
  const diagram = b.prop(lensDef, "diagram", {
    ...concave,
    object: { x: -10, height: 5 },
    rays: [LensRay.Parallel, LensRay.Centre],
    showImage: true,
    showDistances: true,
  });
  b.standsFor(
    diagram,
    "a concave lens (f = 10 cm) with the object exactly at F₁, 10 cm away; its image is halfway between F₁ and O, upright and half the size",
  );
  return column([
    w.title(t("Example", "उदाहरण")),
    w.body(
      t(
        "**An object is placed at F₁ of a concave lens of focal length 10 cm. Describe the image.**",
        "**10 सेमी फोकस दूरी वाले अवतल लेंस के F₁ पर एक वस्तु रखी है। प्रतिबिंब का वर्णन करो।**",
      ),
    ),
    w.body(
      t(
        "A concave lens has only one kind of image, so the answer starts the same as always: **virtual, erect, diminished**, on the object's side, between F₁ and O. Draw the two rays to find exactly where. The parallel ray comes out as if from F₁, and the ray through O goes straight on. Their dashed lines meet **halfway between F₁ and O**, 5 cm from the lens, and the image is **half** the object's height.",
        "अवतल लेंस का केवल एक तरह का प्रतिबिंब होता है, इसलिए उत्तर हमेशा की तरह शुरू होता है: **आभासी, सीधा, छोटा**, वस्तु वाली ओर, F₁ और O के बीच। ठीक जगह जानने के लिए दो किरणें बनाओ। समानांतर किरण ऐसे निकलती है मानो F₁ से आई हो, और O से होकर जाती किरण सीधी जाती है। उनकी बिंदुदार रेखाएँ **F₁ और O के ठीक बीच**, लेंस से 5 सेमी पर मिलती हैं, और प्रतिबिंब वस्तु की ऊँचाई का **आधा** है।",
      ),
    ),
    diagram,
    space(),
  ]);
});

/** Your turn (NCERT Exercise 1), then the mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "A lens gives a virtual, erect, diminished image wherever the object is placed. What kind of lens is it?",
        "एक लेंस वस्तु को कहीं भी रखो, आभासी, सीधा, छोटा प्रतिबिंब देता है। यह किस तरह का लेंस है?",
      ),
      options: [
        { id: "right", label: t("Concave", "अवतल") },
        {
          id: "convex",
          label: t("Convex", "उत्तल"),
          feedback: t(
            "A convex lens gives real, inverted images when the object is beyond F₁, and its virtual image is enlarged.",
            "उत्तल लेंस वस्तु F₁ से परे हो तो वास्तविक, उल्टे प्रतिबिंब देता है, और उसका आभासी प्रतिबिंब बड़ा होता है।",
          ),
        },
        {
          id: "either",
          label: t("Either kind", "कोई भी"),
          feedback: t(
            "Only one kind always gives the same kind of image. Look back at the summary.",
            "केवल एक तरह का लेंस हमेशा एक ही तरह का प्रतिबिंब देता है। सार फिर देखो।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ A concave lens spreads light, so its images are always virtual: the peephole can't project. ✓ The convex magnifying glass stays at the front of the box. ? The phone still has to be slid around until the picture is sharp. Can Riya work out the exact spot with a number?",
        "**मिशन लॉग।** ✓ अवतल लेंस प्रकाश फैलाता है, इसलिए उसके प्रतिबिंब हमेशा आभासी होते हैं: झाँकी प्रोजेक्ट नहीं कर सकती। ✓ उत्तल आवर्धक काँच डिब्बे के आगे ही रहेगा। ? फ़ोन को अब भी तब तक खिसकाना पड़ता है जब तक तस्वीर साफ़ न हो। क्या रिया ठीक जगह एक संख्या से निकाल सकती है?",
      ),
      "log",
      { isHidden: true },
    );
    b.when(ask.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), ask, log, space()]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [hook, rays, candle, drawIt, table, inLife, example, yourTurn];

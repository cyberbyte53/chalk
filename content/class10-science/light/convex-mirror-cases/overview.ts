import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, goalQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  MirrorKind,
  Ray,
  SceneKind,
  SphericalMirrorAction,
  SphericalMirrorDerived,
  lightSceneDef,
  sphericalMirrorDef,
} from "@chalk/prop-light";

/** The convex mirror every page uses: f = 10 cm, so F is 10 cm and C 20 cm behind it. */
const mirror = { kind: MirrorKind.Convex, focalLength: 10, showLabels: true } as const;

/** Hook: the mission so far, and the bulging bus mirror. */
const bus = page("bus", (b) => {
  const w = wordsOn(b);
  const view = b.prop(lightSceneDef, "view", {
    scene: SceneKind.SideMirror,
    isLit: true,
    canToggle: false,
  });
  b.standsFor(
    view,
    "a vehicle's bulging side mirror showing a small, upright, wide view of the road behind",
  );
  return column([
    w.title(t("The bus mirror", "बस का दर्पण")),
    w.body(
      t(
        "We're still on **stop 2: curved mirrors**. On Monday night Mom's make-up mirror, a concave mirror, threw the movie onto the wall: big and real, but upside down, and aimed back at the people watching.",
        "हम अब भी **पड़ाव 2: मुड़े हुए दर्पण** पर हैं। सोमवार रात माँ के मेकअप वाले दर्पण, एक अवतल दर्पण, ने फ़िल्म दीवार पर डाल दी थी: बड़ी और वास्तविक, पर उल्टी, और देखने वालों की ओर वापस।",
      ),
    ),
    view,
    w.body(
      t(
        'Tuesday, on the school bus, Kabir has the window seat next to the big side mirror. It bulges **out**, like the back of a spoon. In it he can see the whole road behind, a bus following them included: tiny, and the right way up. **"Mom\'s mirror caves in. This one bulges out. Maybe it makes a better projector?"** To find out, we need to know what pictures a bulging mirror makes.',
        'मंगलवार, स्कूल बस में, कबीर बड़े साइड दर्पण के पास वाली खिड़की की सीट पर है। वह चम्मच की पीठ की तरह **बाहर** उभरा है। उसमें उसे पीछे की पूरी सड़क दिखती है, पीछे आती एक बस समेत: नन्ही, और सीधी। **"माँ का दर्पण अंदर धँसा है। यह बाहर उभरा है। शायद यह बेहतर प्रोजेक्टर बने?"** यह जानने के लिए हमें पता होना चाहिए कि उभरा दर्पण कैसी तस्वीरें बनाता है।',
      ),
    ),
    space(),
  ]);
});

/** NCERT Activity 10.5: drag the pencil anywhere; the image is always behind, erect, smaller. */
const pencil = page(
  "pencil",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "NCERT Activity 10.5: a convex mirror has only one kind of image. Wherever the object is, the image is behind the mirror between P and F, virtual, erect and diminished; the farther the object, the smaller the image and the closer it gets to F.",
    );
    const guess = choiceQuestion(b, {
      name: "guess",
      prompt: t(
        "A pencil is moved slowly away from a convex mirror. Can its image ever become larger than the pencil?",
        "एक पेंसिल को उत्तल दर्पण से धीरे-धीरे दूर ले जाया जाता है। क्या उसका प्रतिबिंब कभी पेंसिल से बड़ा हो सकता है?",
      ),
      options: [
        { id: "right", label: t("No, never", "नहीं, कभी नहीं") },
        {
          id: "close",
          label: t("Yes, very close to the mirror", "हाँ, दर्पण के बहुत पास"),
          feedback: t(
            "Close up it is less small, but never larger. Try it on the mirror below.",
            "पास आने पर वह कम छोटा होता है, पर कभी बड़ा नहीं। नीचे दर्पण पर आज़माओ।",
          ),
        },
        {
          id: "far",
          label: t("Yes, far from the mirror", "हाँ, दर्पण से दूर"),
          feedback: t(
            "Far away it shrinks towards a dot. Try it on the mirror below.",
            "दूर जाने पर वह सिकुड़कर बिंदु जैसा हो जाता है। नीचे दर्पण पर आज़माओ।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const m = b.prop(
      sphericalMirrorDef,
      "mirror",
      {
        ...mirror,
        object: { x: -25, height: 5 },
        rays: [Ray.Parallel, Ray.Centre],
        showImage: true,
      },
      { isHidden: true },
    );
    b.studentOnly(m.action(SphericalMirrorAction.MoveObject));
    b.standsFor(
      m,
      "a convex mirror (f = 10 cm), a pencil as the blue arrow, and its image behind the mirror",
    );
    const seen = w.body(
      t(
        "Drag the pencil anywhere. The reflected rays always spread apart, so they never meet in front. Their dashed lines always meet **behind the mirror, between P and F**. So the image is always **virtual, erect and diminished**. The farther the pencil, the smaller the image, and the closer it gets to F.",
        "पेंसिल को कहीं भी खिसकाओ। परावर्तित किरणें हमेशा फैलती हैं, इसलिए सामने कभी नहीं मिलतीं। उनकी बिंदुदार रेखाएँ हमेशा **दर्पण के पीछे, P और F के बीच** मिलती हैं। इसलिए प्रतिबिंब हमेशा **आभासी, सीधा और छोटा** होता है। पेंसिल जितनी दूर, प्रतिबिंब उतना छोटा, और F के उतना पास।",
      ),
      "seen",
      { isHidden: true },
    );
    b.when(guess.on(QuestionSignal.Correct), [
      theBoard.show(m),
      theBoard.show(seen),
      theBoard.pass(),
    ]);
    return column([
      w.title(t("Images in a convex mirror", "उत्तल दर्पण में प्रतिबिंब")),
      w.definition(
        t(
          "**Recall: a convex mirror's rays.** A **convex** mirror bulges towards the light, so its F and C are **behind** it. We find its images with the same rays as before. **Ray 1**, parallel to the principal axis, reflects as if it **came from F**. **Ray 3**, heading towards C, hits the mirror along the normal and **comes straight back**. Behind the mirror we draw them as dashed lines.",
          "**याद करो: उत्तल दर्पण की किरणें।** **उत्तल** दर्पण प्रकाश की ओर उभरा होता है, इसलिए उसके F और C उसके **पीछे** होते हैं। इसके प्रतिबिंब हम पहले वाली किरणों से ही ढूँढते हैं। **किरण 1**, मुख्य अक्ष के समानांतर, ऐसे परावर्तित होती है मानो **F से आई** हो। **किरण 3**, C की ओर जाती हुई, अभिलंब के साथ दर्पण से टकराती है और **सीधी लौट आती है**। दर्पण के पीछे हम उन्हें बिंदुदार रेखाओं से बनाते हैं।",
        ),
      ),
      w.body(
        t(
          "NCERT Activity 10.5 does this with a pencil in front of the back of a spoon. Guess first, then try it.",
          "NCERT क्रियाकलाप 10.5 यही चम्मच की पीठ के सामने पेंसिल रखकर करता है। पहले अनुमान लगाओ, फिर आज़माओ।",
        ),
      ),
      guess,
      m,
      seen,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** NCERT Table 10.2: the two positions. */
const table = page("table", (b) => {
  const w = wordsOn(b);
  const sun = b.prop(sphericalMirrorDef, "sun", {
    ...mirror,
    object: { x: -25, height: 5 },
    rays: [],
    showImage: false,
    beam: true,
  });
  b.standsFor(
    sun,
    "parallel rays from a very distant object spreading off a convex mirror, as if from F",
  );
  return column([
    w.title(t("Only two cases", "बस दो स्थितियाँ")),
    sun,
    w.body(
      t(
        "**At infinity** → image at F, behind the mirror: virtual, erect, point-sized",
        "**अनंत पर** → प्रतिबिंब F पर, दर्पण के पीछे: आभासी, सीधा, बिंदु जैसा",
      ),
    ),
    w.body(
      t(
        "**Anywhere else** → between P and F, behind the mirror: virtual, erect, diminished",
        "**और कहीं भी** → P और F के बीच, दर्पण के पीछे: आभासी, सीधा, छोटा",
      ),
    ),
    w.body(
      t(
        "A very distant object sends parallel rays, and by ray 1 they seem to come from F. Any nearer object gives an image between P and F. A convex mirror can never make a real image, because its reflected rays always spread apart.",
        "बहुत दूर की वस्तु समानांतर किरणें भेजती है, और किरण 1 से वे F से आती हुई लगती हैं। पास की कोई भी वस्तु P और F के बीच प्रतिबिंब देती है। उत्तल दर्पण कभी वास्तविक प्रतिबिंब नहीं बना सकता, क्योंकि उसकी परावर्तित किरणें हमेशा फैलती हैं।",
      ),
    ),
    space(),
  ]);
});

/** NCERT Activity 10.6 and the uses: a whole tree in a small mirror; rear-view mirrors. */
const uses = page(
  "uses",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "Why are convex mirrors used as rear-view mirrors in vehicles?",
        "गाड़ियों में पीछे देखने के लिए उत्तल दर्पण क्यों लगाए जाते हैं?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "They always give an erect image, and show a much wider area",
            "वे हमेशा सीधा प्रतिबिंब देते हैं, और बहुत बड़ा क्षेत्र दिखाते हैं",
          ),
        },
        {
          id: "big",
          label: t(
            "They make cars behind look bigger and so easier to see",
            "वे पीछे की गाड़ियों को बड़ा और इसलिए आसानी से दिखने लायक बनाते हैं",
          ),
          feedback: t(
            "A convex mirror's image is always smaller. Its point is that it is erect and fits a wide view.",
            "उत्तल दर्पण का प्रतिबिंब हमेशा छोटा होता है। ख़ासियत यह है कि वह सीधा है और चौड़ा दृश्य समा लेता है।",
          ),
        },
        {
          id: "real",
          label: t(
            "They make a real image that the driver can focus on",
            "वे वास्तविक प्रतिबिंब बनाते हैं जिस पर चालक फ़ोकस कर सके",
          ),
          feedback: t(
            "A convex mirror's image is always virtual: its rays spread apart.",
            "उत्तल दर्पण का प्रतिबिंब हमेशा आभासी होता है: उसकी किरणें फैलती हैं।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("A wide view", "चौड़ा दृश्य")),
      w.body(
        t(
          "Look at a tall, distant tree in a small plane mirror: you see only part of it. A concave mirror is no better: a far-away tree's image in it is tiny, upside down and out in front of the mirror, not a wide view. A small **convex** mirror shows the **whole tree**: it curves outwards, so it takes in light from a much wider area and makes it small. At Agra Fort, a small convex mirror in a wall shows the whole Taj Mahal.",
          "किसी ऊँचे, दूर के पेड़ को छोटे समतल दर्पण में देखो: उसका कुछ हिस्सा ही दिखता है। अवतल दर्पण भी बेहतर नहीं: दूर के पेड़ का प्रतिबिंब उसमें नन्हा, उल्टा और दर्पण के सामने बनता है, चौड़ा दृश्य नहीं। छोटा **उत्तल** दर्पण **पूरा पेड़** दिखाता है: वह बाहर की ओर मुड़ा है, इसलिए बहुत बड़े क्षेत्र से प्रकाश लेकर उसे छोटा कर देता है। आगरा के क़िले की दीवार में लगा एक छोटा उत्तल दर्पण पूरा ताजमहल दिखाता है।",
        ),
      ),
      w.body(
        t(
          "**Rear-view (wing) mirrors.** A driver needs to see the traffic behind, the right way up, and as much of the road as possible. A convex mirror always gives an erect image, though smaller, and shows a much wider area than a plane mirror. Because the image is smaller, cars behind look farther away than they really are, so drivers have to judge carefully.",
          "**पीछे देखने वाले (साइड) दर्पण।** चालक को पीछे का ट्रैफ़िक सीधा दिखना चाहिए, और सड़क का जितना हो सके उतना हिस्सा। उत्तल दर्पण हमेशा सीधा प्रतिबिंब देता है, भले छोटा, और समतल दर्पण से बहुत बड़ा क्षेत्र दिखाता है। प्रतिबिंब छोटा होने से पीछे की गाड़ियाँ असल से दूर लगती हैं, इसलिए चालकों को ध्यान से अंदाज़ा लगाना पड़ता है।",
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** See it in life: Kabir's ladle and card, and the bus he saw, explained. */
const ladle = page(
  "ladle",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "Back to the story: Kabir tries the back of a steel ladle as a projector. The learner slides a card in front of the convex mirror and the picture never sharpens, because the reflected rays spread apart and never really meet: its image is virtual.",
    );
    const m = b.prop(sphericalMirrorDef, "mirror", {
      ...mirror,
      object: { x: -20, height: 8 },
      rays: [Ray.Parallel, Ray.Centre],
      showImage: false,
      screen: -10,
      canMoveScreen: true,
    });
    b.studentOnly(m.action(SphericalMirrorAction.MoveScreen));
    b.standsFor(
      m,
      "the phone as an arrow in front of a convex mirror (the ladle), and a white card the learner slides to try to catch a picture",
    );
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "Slide the card everywhere in front of the ladle. Can Kabir get a sharp picture?",
        "कार्ड को कलछी के सामने हर जगह खिसकाओ। क्या कबीर को साफ़ तस्वीर मिलती है?",
      ),
      options: [
        {
          id: "right",
          label: t("No, never: just a faint patch of light", "नहीं, कभी नहीं: बस रोशनी का हल्का धब्बा"),
        },
        {
          id: "close",
          label: t("Yes, very close to the mirror, in front of it", "हाँ, दर्पण के बहुत पास, उसके सामने"),
          feedback: t(
            "Close up the patch is just smaller. Follow the rays after they bounce: they spread apart and never meet.",
            "पास में धब्बा बस छोटा होता है। उछलने के बाद किरणों का पीछा करो: वे फैलती हैं और कभी नहीं मिलतीं।",
          ),
        },
        {
          id: "far",
          label: t("Yes, far from the mirror", "हाँ, दर्पण से दूर"),
          feedback: t(
            "Far away the patch just spreads more. The reflected rays never come back together.",
            "दूर धब्बा और फैलता है। परावर्तित किरणें कभी दोबारा इकट्ठी नहीं होतीं।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const why = w.body(
      t(
        "Just as the theory says: a convex mirror's image is always **virtual**. Its rays spread apart and only seem to meet behind the glass, so there is nothing in front for a card to catch. And the bus Kabir saw following them, tiny and upright? That was the convex mirror's usual image: virtual, erect, diminished, between P and F behind the glass. Great for seeing the whole road; no use as a projector.",
        "जैसा सिद्धांत कहता है: उत्तल दर्पण का प्रतिबिंब हमेशा **आभासी** होता है। उसकी किरणें फैलती हैं और केवल काँच के पीछे मिलती हुई लगती हैं, इसलिए सामने कार्ड के पकड़ने के लिए कुछ नहीं है। और पीछे आती वह बस जो कबीर ने देखी, नन्ही और सीधी? वह उत्तल दर्पण का आम प्रतिबिंब था: आभासी, सीधा, छोटा, काँच के पीछे P और F के बीच। पूरी सड़क देखने के लिए बढ़िया; प्रोजेक्टर के लिए बेकार।",
      ),
      "why",
      { isHidden: true },
    );
    b.when(ask.on(QuestionSignal.Correct), [theBoard.show(why), theBoard.pass()]);
    return column([
      w.title(t("Kabir's ladle", "कबीर की कलछी")),
      w.body(
        t(
          "That evening Kabir tries his idea anyway. He holds the phone in front of the back of a steel ladle, a convex mirror, and Riya hunts for the picture with a white card.",
          "उस शाम कबीर अपना विचार आज़माता ही है। वह फ़ोन को स्टील की कलछी की पीठ, एक उत्तल दर्पण, के सामने पकड़ता है, और रिया एक सफ़ेद कार्ड से तस्वीर ढूँढती है।",
        ),
      ),
      m,
      ask,
      why,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Practice: draw the image yourself for an object 15 cm in front of a convex mirror (f = 10 cm). */
const example = page(
  "example",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "Draw it yourself: object 15 cm in front of a convex mirror of focal length 10 cm, 5 cm tall. Rays 1 and 3 spread apart; their dashed lines meet 6 cm behind the mirror, 2 cm tall and erect.",
    );
    const m = b.prop(sphericalMirrorDef, "mirror", {
      ...mirror,
      object: { x: -15, height: 5 },
      rays: [],
      showImage: false,
      canPickRays: true,
      markImage: true,
    });
    b.studentOnly(m.action(SphericalMirrorAction.ToggleRay));
    b.studentOnly(m.action(SphericalMirrorAction.MoveMark));
    b.standsFor(
      m,
      "a convex mirror with an object 15 cm in front, no rays drawn yet, ray buttons, and a ? marker to drag to where the image's tip is",
    );
    const goal = goalQuestion(b, {
      about: m,
      prompt: t(
        "Switch on rays 1 and 3. Where their dashed lines meet behind the mirror is the image's tip: drag the ? there.",
        "किरण 1 और 3 चालू करो। दर्पण के पीछे जहाँ उनकी बिंदुदार रेखाएँ मिलती हैं, वहीं प्रतिबिंब की नोक है: ? को वहाँ खिसकाओ।",
      ),
      isMet: m.derived(SphericalMirrorDerived.MarkOnImage),
      solve: [
        m.learner(SphericalMirrorAction.ToggleRay, { ray: Ray.Parallel }),
        m.learner(SphericalMirrorAction.ToggleRay, { ray: Ray.Centre }),
        m.learner(SphericalMirrorAction.MoveMark, { x: 6, y: 2 }),
      ],
    });
    const read = w.body(
      t(
        "The image is about **6 cm behind** the mirror, between P and F, and about **2 cm** tall: virtual, erect and diminished, as always for a convex mirror.",
        "प्रतिबिंब दर्पण के लगभग **6 सेमी पीछे** है, P और F के बीच, और लगभग **2 सेमी** ऊँचा: आभासी, सीधा और छोटा, जैसा उत्तल दर्पण में हमेशा होता है।",
      ),
      "read",
      { isHidden: true },
    );
    b.when(goal.on(QuestionSignal.Correct), [theBoard.show(read), theBoard.pass()]);
    return column([
      w.title(t("Example: draw it yourself", "उदाहरण: ख़ुद बनाओ")),
      w.body(
        t(
          "**A 5 cm object is 15 cm in front of a convex mirror of focal length 10 cm. Draw the ray diagram and describe the image.**",
          "**5 सेमी की वस्तु 10 सेमी फोकस दूरी वाले उत्तल दर्पण के सामने 15 सेमी पर है। किरण आरेख बनाओ और प्रतिबिंब का वर्णन करो।**",
        ),
      ),
      m,
      goal,
      read,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** NCERT Ex 5 and 8: which mirror. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const erect = choiceQuestion(b, {
      name: "erect",
      prompt: t(
        "No matter how far you stand from a mirror, your image is erect. The mirror is…",
        "दर्पण से तुम चाहे जितनी दूर खड़े हो, तुम्हारा प्रतिबिंब सीधा है। दर्पण है…",
      ),
      options: [
        { id: "right", label: t("either plane or convex", "समतल या उत्तल") },
        {
          id: "plane",
          label: t("only plane mirrors", "केवल समतल दर्पण"),
          feedback: t(
            "A plane mirror always gives an erect image, but so does a convex one.",
            "समतल दर्पण हमेशा सीधा प्रतिबिंब देता है, पर उत्तल भी देता है।",
          ),
        },
        {
          id: "concave",
          label: t("only concave mirrors", "केवल अवतल दर्पण"),
          feedback: t(
            "A concave mirror gives an erect image only when you are closer than F. Farther away you are upside down.",
            "अवतल दर्पण सीधा प्रतिबिंब तभी देता है जब तुम F से पास हो। दूर होने पर तुम उल्टे दिखते हो।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const which = choiceQuestion(b, {
      name: "which",
      prompt: t(
        "Which mirror is used in a car's headlights, which as its side mirror, and which in a solar furnace?",
        "कार की हेडलाइट में, उसके साइड दर्पण में, और सौर भट्टी में कौन-सा दर्पण लगता है?",
      ),
      options: [
        { id: "right", label: t("concave, convex, concave", "अवतल, उत्तल, अवतल") },
        {
          id: "swap",
          label: t("convex, concave, concave", "उत्तल, अवतल, अवतल"),
          feedback: t(
            "Headlights need a parallel beam from a bulb at F: that's concave. The side mirror needs an erect, wide view: convex.",
            "हेडलाइट को F पर रखे बल्ब से समानांतर किरण-पुंज चाहिए: यह अवतल है। साइड दर्पण को सीधा, चौड़ा दृश्य चाहिए: उत्तल।",
          ),
        },
        {
          id: "furnace",
          label: t("concave, convex, convex", "अवतल, उत्तल, उत्तल"),
          feedback: t(
            "A solar furnace has to bring sunlight together at one hot point. Only a concave mirror does that.",
            "सौर भट्टी को धूप एक गर्म बिंदु पर इकट्ठी करनी होती है। यह केवल अवतल दर्पण करता है।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
    });
    const log = w.definition(
      t(
        "**Mission log, stop 2.** ✗ Convex mirrors never project: their image is always virtual, upright and smaller. Great for seeing the whole road, useless for movie night. The concave mirror is still the only thing that worked. On the bus home, Kabir has a question: that bus behind looked tiny in the side mirror, so how far behind the glass was its picture, really? Next: answering that with numbers.",
        "**मिशन लॉग, पड़ाव 2।** ✗ उत्तल दर्पण कभी प्रोजेक्ट नहीं करते: उनका प्रतिबिंब हमेशा आभासी, सीधा और छोटा होता है। पूरी सड़क देखने के लिए बढ़िया, मूवी नाइट के लिए बेकार। अब भी केवल अवतल दर्पण ही काम आया। घर लौटती बस में कबीर का एक सवाल है: पीछे वाली बस साइड दर्पण में नन्ही दिखी, तो उसकी तस्वीर काँच के पीछे असल में कितनी दूर थी? आगे: इसका जवाब संख्याओं से।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(erect.on(QuestionSignal.Correct), theBoard.show(which));
    b.when(which.on(QuestionSignal.Correct), theBoard.show(log));
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), erect, which, log, space()]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [bus, pencil, table, uses, ladle, example, yourTurn];

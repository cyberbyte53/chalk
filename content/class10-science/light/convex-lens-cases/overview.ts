import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import type { Localized } from "@chalk/content";
import { choiceQuestion, goalQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  LensAction,
  LensDerived,
  LensKind,
  LensPlace,
  LensRay,
  SceneKind,
  lensDef,
  lightSceneDef,
} from "@chalk/prop-light";

/** The convex lens every page uses: f = 10 cm, so 2F is 20 cm from O. */
const lens = { kind: LensKind.Convex, focalLength: 10, showLabels: true } as const;
const r = String.raw;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** Stop 4, continued: the shoebox projector, built, and only a blur. */
const build = page(
  "build",
  (b) => {
    const w = wordsOn(b);
    const box = b.prop(lightSceneDef, "box", {
      scene: SceneKind.ShoeboxBlurry,
      isLit: true,
      canToggle: false,
    });
    b.standsFor(
      box,
      "a cut-away shoebox projector with the magnifying glass in the front hole; on the wall only a big blurry bright patch, and Kabir scratching his head",
    );
    const guess = choiceQuestion(b, {
      name: "guess",
      prompt: t(
        "First try: Kabir has taped the phone just 5 cm from the lens. On the wall there's only a bright blur. What's wrong?",
        "पहली कोशिश: कबीर ने फ़ोन लेंस से बस 5 सेमी पर चिपकाया है। दीवार पर बस एक चमकीला धब्बा है। गड़बड़ क्या है?",
      ),
      options: [
        {
          id: "right",
          label: t("The phone is in the wrong place", "फ़ोन ग़लत जगह पर है"),
        },
        {
          id: "broken",
          label: t("Grandpa's lens is broken", "दादाजी का लेंस टूटा है"),
          feedback: t(
            "The lens burned a leaf yesterday: it brings light together just fine. Think about where the phone is.",
            "कल इसी लेंस ने पत्ती जलाई थी: यह प्रकाश को ठीक से इकट्ठा करता है। सोचो फ़ोन कहाँ है।",
          ),
        },
        {
          id: "nothing",
          label: t(
            "The lens is too weak to bring light together",
            "लेंस इतना कमज़ोर है कि प्रकाश इकट्ठा नहीं कर पाता",
          ),
          feedback: t(
            "It burned a leaf yesterday, so it's strong enough. Think about where the phone sits compared with F₁.",
            "इसने कल पत्ता जला दिया था, इसलिए यह काफ़ी शक्तिशाली है। सोचो, फ़ोन F₁ की तुलना में कहाँ रखा है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const hint = w.body(
      t(
        "Grandpa's magnifier has a focal length of about 10 cm, so at 5 cm the phone is **closer than F₁**. Where the phone sits decides everything. This lesson finds the right spot: for every place you can put an object in front of a convex lens, where does its image land, and what is it like?",
        "दादाजी के आवर्धक की फोकस दूरी लगभग 10 सेमी है, इसलिए 5 सेमी पर फ़ोन **F₁ से पास** है। फ़ोन कहाँ है, इसी पर सब निर्भर है। यह पाठ सही जगह ढूँढता है: उत्तल लेंस के सामने वस्तु को जहाँ भी रखो, उसका प्रतिबिंब कहाँ बनता है, और कैसा होता है?",
      ),
      "hint",
      { isHidden: true },
    );
    b.when(guess.on(QuestionSignal.Correct), [theBoard.show(hint), theBoard.pass()]);
    return column([
      w.title(t("The shoebox projector", "जूते के डिब्बे वाला प्रोजेक्टर")),
      w.body(
        t(
          "**Stop 4: lenses, continued.** They have the lens: Grandpa's convex magnifying glass, focal length about 10 cm. Now they build. Friday after school. Riya takes a shoebox **30 cm long**, cuts a round hole in one end and tapes Grandpa's magnifying glass over it (Grandpa has been promised it back by Sunday). The phone goes inside, screen facing the lens. Kabir paints the inside black. It looks like a real projector. Sort of.",
          "**पड़ाव 4: लेंस, आगे।** उनके पास लेंस है: दादाजी का उत्तल आवर्धक काँच, फोकस दूरी लगभग 10 सेमी। अब वे बनाते हैं। शुक्रवार, स्कूल के बाद। रिया **30 सेमी लंबा** एक जूते का डिब्बा लेती है, उसके एक सिरे पर गोल छेद काटती है और उस पर दादाजी का आवर्धक काँच चिपका देती है (दादाजी से रविवार तक लौटाने का वादा हुआ है)। फ़ोन अंदर, स्क्रीन लेंस की ओर। कबीर अंदर काला रंग पोतता है। यह असली प्रोजेक्टर जैसा दिखता है। कुछ-कुछ।",
        ),
      ),
      box,
      guess,
      hint,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** The three rays for lenses, each with its reason, on both kinds of lens. */
const rays = page(
  "rays",
  (b) => {
    const w = wordsOn(b);
    const convex = b.prop(lensDef, "convex", {
      ...lens,
      object: { x: -30, height: 5 },
      rays: [LensRay.Parallel, LensRay.Focal, LensRay.Centre],
      showImage: true,
    });
    b.studentOnly(convex.action(LensAction.MoveObject));
    b.standsFor(
      convex,
      "a convex lens with the three standard rays from the object's tip meeting at the image",
    );
    const concave = b.prop(lensDef, "concave", {
      kind: LensKind.Concave,
      focalLength: 10,
      showLabels: true,
      object: { x: -30, height: 5 },
      rays: [LensRay.Parallel, LensRay.Focal, LensRay.Centre],
      showImage: true,
    });
    b.studentOnly(concave.action(LensAction.MoveObject));
    b.standsFor(
      concave,
      "a concave lens with the three standard rays, their dashed lines meeting at the image on the object's side",
    );
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "A ray passes through F₁ of a convex lens. After the lens it…",
        "एक किरण उत्तल लेंस के F₁ से होकर जाती है। लेंस के बाद वह…",
      ),
      options: [
        { id: "right", label: t("comes out parallel to the axis", "अक्ष के समानांतर निकलती है") },
        {
          id: "f2",
          label: t("passes through F₂ on the far side", "दूसरी ओर F₂ से होकर जाती है"),
          feedback: t(
            "That's the ray that came in parallel. The ray through F₁ is that ray run backwards.",
            "यह वह किरण है जो समानांतर आई थी। F₁ से होकर आती किरण वही किरण उल्टी है।",
          ),
        },
        {
          id: "straight",
          label: t("goes straight on without bending", "बिना मुड़े सीधी चली जाती है"),
          feedback: t(
            "Only the ray through O goes straight on.",
            "केवल O से होकर जाती किरण सीधी जाती है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Ray diagrams for lenses", "लेंसों के किरण आरेख")),
      w.body(
        t(
          "To **predict** where an image lands, we draw rays. Just as with mirrors, any two rays from the tip of the object find the tip of its image. For a lens there are three easy ones, each with a reason you already know.",
          "प्रतिबिंब कहाँ बनेगा, यह **पहले से बताने** के लिए हम किरणें खींचते हैं। दर्पणों की तरह, वस्तु की नोक से कोई भी दो किरणें उसके प्रतिबिंब की नोक ढूँढ लेती हैं। लेंस के लिए तीन आसान किरणें हैं, हर एक का कारण तुम पहले से जानते हो।",
        ),
      ),
      w.definition(
        t(
          "**1.** A ray **parallel to the axis** passes **through F₂** after a convex lens, or seems to come **from F₁** after a concave lens. That's what F means. **2.** A ray **through F₁** (convex), or heading **towards F₂** (concave), comes out **parallel** to the axis: ray 1 run backwards. **3.** A ray **through O** goes **straight on**, without bending.",
          "**1.** **अक्ष के समानांतर** किरण उत्तल लेंस के बाद **F₂ से होकर** जाती है, या अवतल लेंस के बाद **F₁ से** आती हुई लगती है। F का अर्थ यही है। **2.** **F₁ से होकर** आती किरण (उत्तल), या **F₂ की ओर** जाती किरण (अवतल), अक्ष के **समानांतर** निकलती है: किरण 1 उल्टी। **3.** **O से होकर** जाती किरण बिना मुड़े **सीधी** जाती है।",
        ),
      ),
      convex,
      concave,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** NCERT Activity 10.4 for lenses: pick two rays, see where they cross, mark the image yourself. */
const drawIt = page(
  "draw-it",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "Draw a lens ray diagram yourself (NCERT Activity 10.4): an object 30 cm from a convex lens of f = 10 cm; switch on two of the three rays, see where they cross, and drag the ? there. The image is at v = +15 cm, tip at height −2.5 cm: real, inverted, diminished.",
    );
    const g = b.prop(lensDef, "lens", {
      ...lens,
      object: { x: -30, height: 5 },
      rays: [],
      showImage: false,
      canPickRays: true,
      markImage: true,
    });
    b.studentOnly(g.action(LensAction.ToggleRay));
    b.studentOnly(g.action(LensAction.MoveMark));
    b.standsFor(
      g,
      "a convex lens (f = 10 cm) with an object 30 cm to the left, buttons 1, 2, 3 to switch on the standard rays, and a ? marker to drop where the image's tip is",
    );
    const goal = goalQuestion(b, {
      about: g,
      prompt: t(
        "Switch on any two rays with the buttons 1, 2, 3. Where they cross is the tip of the image. Drag the ? there.",
        "बटन 1, 2, 3 से कोई दो किरणें चालू करो। जहाँ वे काटती हैं, वहीं प्रतिबिंब की नोक है। ? को वहाँ खींचो।",
      ),
      isMet: g.derived(LensDerived.MarkOnImage),
      solve: [
        g.learner(LensAction.ToggleRay, { ray: LensRay.Parallel }),
        g.learner(LensAction.ToggleRay, { ray: LensRay.Centre }),
        g.learner(LensAction.MoveMark, { x: 15, y: -2.5 }),
      ],
    });
    const found = w.body(
      t(
        "Found it: 15 cm on the far side, below the axis. A real, inverted, smaller image. Any two rays give the same point, which is how you know you've drawn them right.",
        "मिल गया: दूसरी ओर 15 सेमी पर, अक्ष के नीचे। एक वास्तविक, उल्टा, छोटा प्रतिबिंब। कोई भी दो किरणें यही बिंदु देती हैं, इसी से पता चलता है कि तुमने ठीक बनाया है।",
      ),
      "found",
      { isHidden: true },
    );
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(found));
    return column([
      w.title(t("Draw it yourself", "ख़ुद बनाओ")),
      w.body(
        t(
          "Now draw one yourself. An object stands 30 cm from a convex lens of focal length 10 cm. Find its image with two rays.",
          "अब एक ख़ुद बनाओ। एक वस्तु 10 सेमी फोकस दूरी वाले उत्तल लेंस से 30 सेमी पर खड़ी है। दो किरणों से उसका प्रतिबिंब ढूँढो।",
        ),
      ),
      g,
      goal,
      found,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** NCERT Activity 10.12: bring the candle in; the image crosses to the same side once inside F1. */
const candle = page(
  "candle",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "NCERT Activity 10.12 on the prop: move the object in from far left; outside F1 the image is real and inverted on the far side (a screen there catches it); inside F1 it appears on the object's own side, virtual, erect and enlarged: a magnifying glass.",
    );
    const g = b.prop(lensDef, "lens", {
      ...lens,
      object: { x: -35, height: 5 },
      rays: [LensRay.Parallel, LensRay.Centre],
      showImage: true,
    });
    b.studentOnly(g.action(LensAction.MoveObject));
    b.standsFor(
      g,
      "a convex lens (f = 10 cm) with 2F₁, F₁, F₂ and 2F₂ marked, a candle as the blue arrow and its image",
    );
    const goal = goalQuestion(b, {
      about: g,
      prompt: t(
        "Drag the candle towards the lens until its image is on the **same side** as the candle and the right way up.",
        "मोमबत्ती को लेंस की ओर तब तक खिसकाओ जब तक उसका प्रतिबिंब मोमबत्ती वाली **ओर ही** और सीधा न हो जाए।",
      ),
      isMet: g.derived(LensDerived.IsReal).not().and(g.derived(LensDerived.V).neq(null)),
      solve: [g.learner(LensAction.MoveObject, { x: -5 })],
      notes: [
        {
          when: g.derived(LensDerived.U).lt(-10.5),
          say: t(
            "The image is still on the far side and upside down. Keep coming in, past F₁.",
            "प्रतिबिंब अभी भी दूसरी ओर और उल्टा है। और पास आओ, F₁ के पार।",
          ),
          reach: [g.learner(LensAction.MoveObject, { x: -14 })],
        },
      ],
    });
    const wrap = w.body(
      t(
        "**F₁ is the switch,** just as F was for the concave mirror. Farther than F₁, the rays really meet on the **other side** of the lens: a **real, inverted** image that a screen can catch. Closer than F₁, they spread out after the lens. Traced back, they meet on the **same side** as the candle: a **virtual, erect, enlarged** image. That's a magnifying glass.",
        "**F₁ ही स्विच है,** जैसे अवतल दर्पण के लिए F था। F₁ से दूर, किरणें लेंस की **दूसरी ओर** सचमुच मिलती हैं: एक **वास्तविक, उल्टा** प्रतिबिंब जिसे पर्दा पकड़ सकता है। F₁ से पास, लेंस के बाद वे फैल जाती हैं। पीछे बढ़ाने पर वे मोमबत्ती वाली **ओर ही** मिलती हैं: **आभासी, सीधा, बड़ा** प्रतिबिंब। यही आवर्धक काँच है।",
      ),
      "wrap",
      { isHidden: true },
    );
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(wrap));
    return column([
      w.title(t("Images in a convex lens", "उत्तल लेंस में प्रतिबिंब")),
      w.body(
        t(
          "NCERT's experiment: mark a table at F and 2F on both sides of a convex lens, 2F₁ and F₁ on the candle's side, F₂ and 2F₂ on the other. Put a burning candle far to the left, catch its image on a screen on the right, then bring the candle closer, step by step, moving the screen to keep the image sharp. Try it on the picture: drag the candle (the blue arrow).",
          "NCERT का प्रयोग: उत्तल लेंस के दोनों ओर मेज़ पर F और 2F पर निशान लगाओ, मोमबत्ती वाली ओर 2F₁ और F₁, दूसरी ओर F₂ और 2F₂। एक जलती मोमबत्ती बाईं ओर दूर रखो, उसका प्रतिबिंब दाईं ओर पर्दे पर लो, फिर मोमबत्ती को क़दम-क़दम पास लाओ, और प्रतिबिंब साफ़ रखने के लिए पर्दा खिसकाते जाओ। चित्र पर आज़माओ: मोमबत्ती (नीला तीर) खिसकाओ।",
        ),
      ),
      g,
      goal,
      wrap,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** At infinity: the beam meets at F2. */
const atInfinity = page("case-infinity", (b) => {
  const w = wordsOn(b);
  const g = b.prop(lensDef, "lens", {
    ...lens,
    object: { x: -35, height: 5 },
    rays: [],
    beam: true,
    showImage: false,
  });
  b.standsFor(g, "parallel rays from a very distant object meeting at F₂");
  return column([
    w.title(t("Case 1: object at infinity", "स्थिति 1: वस्तु अनंत पर")),
    g,
    w.definition(
      t(
        "**Image at F₂: real, inverted, highly diminished, point-sized.**",
        "**प्रतिबिंब F₂ पर: वास्तविक, उल्टा, बहुत छोटा, बिंदु के आकार का।**",
      ),
    ),
    w.body(
      t(
        "A very distant object sends parallel rays, and by ray 1 they all meet at F₂: the bright spot of the Sun on paper.",
        "बहुत दूर की वस्तु समानांतर किरणें भेजती है, और किरण 1 से वे सब F₂ पर मिलती हैं: कागज़ पर सूरज का चमकीला बिंदु।",
      ),
    ),
    space(),
  ]);
});

/** One textbook position for the convex lens. */
function casePage(
  name: string,
  at: string,
  x: number,
  title: Localized,
  nature: Localized,
  why: Localized,
) {
  return page(name, (b) => {
    const w = wordsOn(b);
    const g = b.prop(lensDef, "lens", {
      ...lens,
      object: { x, height: 5 },
      rays: [LensRay.Parallel, LensRay.Centre],
      showImage: true,
    });
    b.studentOnly(g.action(LensAction.MoveObject));
    b.standsFor(g, `the object ${at} of a convex lens, with rays 1 and 3 and the image`);
    return column([w.title(title), g, w.definition(nature), w.body(why), space()]);
  });
}

const beyond2F = casePage(
  "case-beyond-2f",
  LensPlace.BeyondTwoF,
  -30,
  t("Case 2: object beyond 2F₁", "स्थिति 2: वस्तु 2F₁ से परे"),
  t(
    "**Image between F₂ and 2F₂: real, inverted, diminished.**",
    "**प्रतिबिंब F₂ और 2F₂ के बीच: वास्तविक, उल्टा, छोटा।**",
  ),
  t(
    "Ray 1 bends through F₂ and ray 3 goes straight through O. They cross between F₂ and 2F₂, below the axis. This is how a camera makes a small picture of a large scene.",
    "किरण 1, F₂ से होकर मुड़ती है और किरण 3, O से होकर सीधी जाती है। वे F₂ और 2F₂ के बीच, अक्ष के नीचे काटती हैं। कैमरा बड़े दृश्य की छोटी तस्वीर ऐसे ही बनाता है।",
  ),
);

const at2F = casePage(
  "case-at-2f",
  LensPlace.AtTwoF,
  -20,
  t("Case 3: object at 2F₁", "स्थिति 3: वस्तु 2F₁ पर"),
  t(
    "**Image at 2F₂: real, inverted, the same size.**",
    "**प्रतिबिंब 2F₂ पर: वास्तविक, उल्टा, बराबर आकार।**",
  ),
  t(
    "2F plays the part C played for the concave mirror: the one place where the image is the same size as the object.",
    "2F यहाँ वही काम करता है जो अवतल दर्पण के लिए C करता था: अकेली जगह जहाँ प्रतिबिंब वस्तु के बराबर होता है।",
  ),
);

const between = casePage(
  "case-between-2f-f",
  LensPlace.BetweenTwoFAndF,
  -15,
  t("Case 4: object between 2F₁ and F₁", "स्थिति 4: वस्तु 2F₁ और F₁ के बीच"),
  t("**Image beyond 2F₂: real, inverted, enlarged.**", "**प्रतिबिंब 2F₂ से परे: वास्तविक, उल्टा, बड़ा।**"),
  t(
    "Case 2 run backwards: object and image have swapped places, so a small object gives a big picture far away. This is how a projector works.",
    "स्थिति 2 उल्टी: वस्तु और प्रतिबिंब ने जगह बदल ली है, इसलिए छोटी वस्तु दूर एक बड़ी तस्वीर देती है। प्रोजेक्टर ऐसे ही काम करता है।",
  ),
);

const atF = casePage(
  "case-at-f",
  LensPlace.AtF,
  -10,
  t("Case 5: object at F₁", "स्थिति 5: वस्तु F₁ पर"),
  t(
    "**Image at infinity: real, inverted, highly enlarged.**",
    "**प्रतिबिंब अनंत पर: वास्तविक, उल्टा, बहुत बड़ा।**",
  ),
  t(
    "Case 1 run backwards. Every ray from F₁ comes out parallel (ray 2), so the rays never meet.",
    "स्थिति 1 उल्टी। F₁ से आती हर किरण समानांतर निकलती है (किरण 2), इसलिए किरणें कभी नहीं मिलतीं।",
  ),
);

const inside = casePage(
  "case-inside-f",
  LensPlace.BetweenFAndO,
  -5,
  t("Case 6: object between F₁ and O", "स्थिति 6: वस्तु F₁ और O के बीच"),
  t(
    "**Image on the same side as the object: virtual, erect, enlarged.**",
    "**प्रतिबिंब वस्तु वाली ओर ही: आभासी, सीधा, बड़ा।**",
  ),
  t(
    "After the lens the rays spread apart, so nothing lands on the wall. Your eye on the far side traces them back, and they seem to come from a large, upright image behind the real object. This is how a magnifying glass works: the print sits inside F₁.",
    "लेंस के बाद किरणें फैल जाती हैं, इसलिए दीवार पर कुछ नहीं उतरता। दूसरी ओर तुम्हारी आँख उन्हें पीछे ले जाती है, और वे असली वस्तु के पीछे एक बड़े, सीधे प्रतिबिंब से आती हुई लगती हैं। आवर्धक काँच ऐसे ही काम करता है: छपाई F₁ के अंदर होती है।",
  ),
);

/** NCERT Table 10.4: all six cases in one place. */
const table = page(
  "table",
  (b) => {
    const w = wordsOn(b);
    const same = choiceQuestion(b, {
      name: "switch",
      prompt: t(
        "Which point decides whether a convex lens makes a real image or a virtual one?",
        "कौन-सा बिंदु तय करता है कि उत्तल लेंस वास्तविक प्रतिबिंब बनाएगा या आभासी?",
      ),
      options: [
        { id: "right", label: t("F₁, the focus on the object's side", "F₁, वस्तु वाली ओर का फोकस") },
        {
          id: "twoF",
          label: t("2F₁, twice the focal length away", "2F₁, फ़ोकस दूरी के दोगुने पर"),
          feedback: t(
            "At 2F₁ the image just becomes the same size. It stays real on both sides of 2F₁.",
            "2F₁ पर प्रतिबिंब बस बराबर आकार का होता है। 2F₁ के दोनों ओर वह वास्तविक ही रहता है।",
          ),
        },
        {
          id: "o",
          label: t("O, the optical centre", "O, प्रकाशिक केंद्र"),
          feedback: t(
            "Look at cases 5 and 6: the image changes from real to virtual as the object crosses F₁.",
            "स्थिति 5 और 6 देखो: वस्तु के F₁ पार करते ही प्रतिबिंब वास्तविक से आभासी हो जाता है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    b.when(same.on(QuestionSignal.Correct), theBoard.pass());
    return column([
      w.title(t("All six cases", "सभी छह स्थितियाँ")),
      w.note(
        t(
          "Where the object is → where the image is: its nature and size.",
          "वस्तु कहाँ है → प्रतिबिंब कहाँ है: उसकी प्रकृति और आकार।",
        ),
      ),
      w.body(
        t(
          "**At infinity** → at F₂: real, inverted, point-sized",
          "**अनंत पर** → F₂ पर: वास्तविक, उल्टा, बिंदु जैसा",
        ),
      ),
      w.body(
        t(
          "**Beyond 2F₁** → between F₂ and 2F₂: real, inverted, diminished",
          "**2F₁ से परे** → F₂ और 2F₂ के बीच: वास्तविक, उल्टा, छोटा",
        ),
      ),
      w.body(
        t(
          "**At 2F₁** → at 2F₂: real, inverted, same size",
          "**2F₁ पर** → 2F₂ पर: वास्तविक, उल्टा, बराबर आकार",
        ),
      ),
      w.body(
        t(
          "**Between F₁ and 2F₁** → beyond 2F₂: real, inverted, enlarged",
          "**F₁ और 2F₁ के बीच** → 2F₂ से परे: वास्तविक, उल्टा, बड़ा",
        ),
      ),
      w.body(
        t(
          "**At F₁** → at infinity: real, inverted, highly enlarged",
          "**F₁ पर** → अनंत पर: वास्तविक, उल्टा, बहुत बड़ा",
        ),
      ),
      w.body(
        t(
          "**Between F₁ and O** → same side as the object: virtual, erect, enlarged",
          "**F₁ और O के बीच** → वस्तु वाली ओर: आभासी, सीधा, बड़ा",
        ),
      ),
      w.body(
        t(
          "It's the same story as the concave mirror, with 2F in place of C and the real images on the far side of the lens.",
          "यह अवतल दर्पण वाली ही कहानी है, C की जगह 2F, और वास्तविक प्रतिबिंब लेंस की दूसरी ओर।",
        ),
      ),
      same,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** Back to the shoebox: phone at 15 cm is case 4; focus the screen; turn the phone upside down. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "Focus the projector, like NCERT Activity 10.12's screen: the phone 15 cm from the lens (f = 10 cm) makes a real image at 30 cm on the far side; the learner slides the screen until the picture is sharp; before or beyond 30 cm the rays haven't met yet, or have crossed already, and the picture blurs.",
    );
    const g = b.prop(lensDef, "lens", {
      ...lens,
      object: { x: -15, height: 5 },
      objectStyle: "phone",
      rays: [LensRay.Parallel, LensRay.Centre],
      showImage: false,
      screen: 20,
      canMoveScreen: true,
    });
    b.studentOnly(g.action(LensAction.MoveScreen));
    b.standsFor(
      g,
      "the phone 15 cm to the left of the magnifying glass (f = 10 cm), with a white screen on the right that the learner slides to catch a sharp picture",
    );
    const goal = goalQuestion(b, {
      about: g,
      prompt: t(
        "Slide the screen until the picture on it is sharp.",
        "पर्दे को तब तक खिसकाओ जब तक उस पर तस्वीर साफ़ न हो जाए।",
      ),
      isMet: g.derived(LensDerived.IsSharp),
      solve: [g.learner(LensAction.MoveScreen, { x: 30 })],
      notes: [
        {
          when: g.field("screen").lt(29.4),
          say: t(
            "Still blurred: the rays haven't met yet. Move the screen farther from the lens.",
            "अभी भी धुँधला: किरणें अभी मिली नहीं हैं। पर्दे को लेंस से और दूर ले जाओ।",
          ),
          reach: [g.learner(LensAction.MoveScreen, { x: 20 })],
        },
        {
          when: g.field("screen").gt(30.6),
          say: t(
            "Blurred again: the rays have already crossed and are spreading out. Bring the screen back towards the lens.",
            "फिर धुँधला: किरणें पहले ही काटकर फैल रही हैं। पर्दे को लेंस की ओर वापस लाओ।",
          ),
          reach: [g.learner(LensAction.MoveScreen, { x: 33 })],
        },
      ],
    });
    const why = w.body(
      t(
        "Sharp at one place only: 30 cm from the lens, beyond 2F₂. The phone at 15 cm is between F₁ and 2F₁, so this is **case 4**: a **real, inverted, enlarged** image beyond 2F₂. Anywhere else each point of the phone lands as a smudge. But the movie is **upside down**.",
        "केवल एक जगह साफ़: लेंस से 30 सेमी पर, 2F₂ से परे। 15 सेमी पर फ़ोन F₁ और 2F₁ के बीच है, इसलिए यह **स्थिति 4** है: 2F₂ से परे एक **वास्तविक, उल्टा, बड़ा** प्रतिबिंब। कहीं और फ़ोन का हर बिंदु धब्बा बनकर उतरता है। पर फ़िल्म **उल्टी** है।",
      ),
      "why",
      { isHidden: true },
    );
    const flip = choiceQuestion(b, {
      name: "flip",
      prompt: t(
        "The movie on the wall is upside down. What should Riya do?",
        "दीवार पर फ़िल्म उल्टी है। रिया को क्या करना चाहिए?",
      ),
      options: [
        {
          id: "right",
          label: t("Put the phone in upside down", "फ़ोन को उल्टा रख दे"),
        },
        {
          id: "inside",
          label: t("Move the phone inside F₁", "फ़ोन को F₁ के अंदर ले जाए"),
          feedback: t(
            "Inside F₁ the image is virtual: nothing lands on the wall at all. That was the first try.",
            "F₁ के अंदर प्रतिबिंब आभासी है: दीवार पर कुछ भी नहीं उतरता। पहली कोशिश यही थी।",
          ),
        },
        {
          id: "concave",
          label: t("Swap in a concave lens", "अवतल लेंस लगा दे"),
          feedback: t(
            "A concave lens never makes a real image, so there would be no picture on the wall.",
            "अवतल लेंस कभी वास्तविक प्रतिबिंब नहीं बनाता, इसलिए दीवार पर कोई तस्वीर नहीं होगी।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const works = w.body(
      t(
        "A real image is inverted, so turn the phone upside down and the movie comes out the right way up. Every real projector does exactly this.",
        "वास्तविक प्रतिबिंब उल्टा होता है, इसलिए फ़ोन को उल्टा कर दो और फ़िल्म सीधी निकलती है। हर असली प्रोजेक्टर ठीक यही करता है।",
      ),
      "works",
      { isHidden: true },
    );
    b.when(goal.on(QuestionSignal.Correct), [theBoard.show(why), theBoard.show(flip)]);
    b.when(flip.on(QuestionSignal.Correct), [theBoard.show(works), theBoard.pass()]);
    return column([
      w.title(t("Back to the shoebox", "फिर जूते का डिब्बा")),
      w.body(
        t(
          "Second try: Riya moves the phone back to 15 cm from the lens, beyond F₁. Kabir holds up a white card as the screen and moves it closer and farther, the way a real projector's focus knob does.",
          "दूसरी कोशिश: रिया फ़ोन को लेंस से 15 सेमी पीछे ले जाती है, F₁ से परे। कबीर पर्दे की तरह एक सफ़ेद कार्ड पकड़ता है और उसे पास और दूर करता है, जैसे असली प्रोजेक्टर का फ़ोकस वाला बटन करता है।",
        ),
      ),
      g,
      goal,
      why,
      flip,
      works,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** A worked case with its figure, then NCERT's two questions and the mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const fig = b.prop(lensDef, "fig", {
      kind: LensKind.Convex,
      focalLength: 10,
      showLabels: true,
      object: { x: -25, height: 4 },
      rays: [LensRay.Parallel, LensRay.Centre],
      showImage: true,
    });
    b.standsFor(
      fig,
      "an object 25 cm from a convex lens of focal length 10 cm, beyond 2F₁, with rays 1 and 3 meeting between F₂ and 2F₂ below the axis",
    );
    const same = choiceQuestion(b, {
      name: "same",
      prompt: t(
        "Where should an object be placed in front of a convex lens to get a real image the same size as the object?",
        "उत्तल लेंस के सामने वस्तु कहाँ रखें कि वस्तु के बराबर वास्तविक प्रतिबिंब मिले?",
      ),
      options: [
        { id: "right", label: t("At twice the focal length", "फोकस दूरी के दोगुने पर") },
        {
          id: "f",
          label: t("At the principal focus", "मुख्य फोकस पर"),
          feedback: t("At F₁ the image is at infinity.", "F₁ पर प्रतिबिंब अनंत पर होता है।"),
        },
        {
          id: "inside",
          label: t("Between O and F₁", "O और F₁ के बीच"),
          feedback: t(
            "Inside F₁ the image is virtual and enlarged.",
            "F₁ के अंदर प्रतिबिंब आभासी और बड़ा होता है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const reading = choiceQuestion(b, {
      name: "reading",
      prompt: t(
        "To read small letters in a dictionary, which lens would you use?",
        "शब्दकोश के छोटे अक्षर पढ़ने के लिए तुम कौन-सा लेंस लोगे?",
      ),
      options: [
        {
          id: "right",
          label: t("A convex lens of focal length 5 cm", "5 सेमी फोकस दूरी का उत्तल लेंस"),
        },
        {
          id: "fifty",
          label: t("A convex lens of focal length 50 cm", "50 सेमी फोकस दूरी का उत्तल लेंस"),
          feedback: t(
            "To magnify, the page must be inside F. With f = 50 cm you'd hold the lens far from the page, and it would hardly enlarge. A short focal length works close up.",
            "आवर्धन के लिए पन्ना F के अंदर होना चाहिए। f = 50 सेमी के साथ लेंस पन्ने से बहुत दूर रखना पड़ता, और वह मुश्किल से बड़ा करता। छोटी फोकस दूरी पास से काम करती है।",
          ),
        },
        {
          id: "concave",
          label: t("A concave lens of focal length 5 cm", "5 सेमी फोकस दूरी का अवतल लेंस"),
          feedback: t(
            "A concave lens always makes things look smaller.",
            "अवतल लेंस हमेशा चीज़ों को छोटा दिखाता है।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ The phone goes **between F₁ and 2F₁**, upside down. The lens makes a real, enlarged, inverted image beyond 2F₂, so the wall gets a big, sharp, right-way-up movie. ? The wall is about 2 m from the box. Exactly how far from the lens must the phone be? Riya wants a number, not a guess.",
        "**मिशन लॉग।** ✓ फ़ोन **F₁ और 2F₁ के बीच** जाता है, उल्टा। लेंस 2F₂ से परे एक वास्तविक, बड़ा, उल्टा प्रतिबिंब बनाता है, इसलिए दीवार पर बड़ी, साफ़, सीधी फ़िल्म आती है। ? दीवार डिब्बे से लगभग 2 मीटर दूर है। फ़ोन लेंस से ठीक कितनी दूर हो? रिया को अंदाज़ा नहीं, संख्या चाहिए।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(same.on(QuestionSignal.Correct), theBoard.show(reading));
    b.when(reading.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([
      w.title(t("Your turn", "अब तुम्हारी बारी")),
      w.body(
        t(
          "**Example. An object is 25 cm from a convex lens of focal length 10 cm. Where is the image, and what is it like?**",
          "**उदाहरण। एक वस्तु 10 सेमी फोकस दूरी वाले उत्तल लेंस से 25 सेमी पर है। प्रतिबिंब कहाँ है, और कैसा है?**",
        ),
      ),
      fig,
      w.body(
        t(
          r`Here $f = 10$ cm, so $F_1$ is 10 cm from the lens and $2F_1$ is 20 cm. The object, at 25 cm, is **beyond $2F_1$**: case 2. So the image is **between $F_2$ and $2F_2$**, on the far side: **real, inverted and diminished**. Rays 1 and 3 in the figure cross there, below the axis.`,
          r`यहाँ $f = 10$ सेमी, इसलिए $F_1$ लेंस से 10 सेमी पर है और $2F_1$ 20 सेमी पर। 25 सेमी पर वस्तु **$2F_1$ से परे** है: स्थिति 2। इसलिए प्रतिबिंब दूसरी ओर **$F_2$ और $2F_2$ के बीच** है: **वास्तविक, उल्टा और छोटा**। चित्र में किरण 1 और 3 वहीं, अक्ष के नीचे, काटती हैं।`,
        ),
      ),
      w.note(
        t(
          "First find F and 2F from the focal length, then see which gap the object is in.",
          "पहले फोकस दूरी से F और 2F निकालो, फिर देखो वस्तु किस हिस्से में है।",
        ),
      ),
      same,
      reading,
      log,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [
  build,
  rays,
  drawIt,
  candle,
  atInfinity,
  beyond2F,
  at2F,
  between,
  atF,
  inside,
  table,
  inLife,
  yourTurn,
];

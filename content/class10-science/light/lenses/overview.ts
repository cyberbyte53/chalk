import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  LensAction,
  LensKind,
  LensRay,
  SceneKind,
  lensDef,
  lightSceneDef,
} from "@chalk/prop-light";

const r = String.raw;
const still = { isLit: true, canToggle: false } as const;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** Stop 4 begins: the curved glass they need is on Grandpa's newspaper. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const table = b.prop(lightSceneDef, "table", { scene: SceneKind.Glasses, ...still });
  b.standsFor(
    table,
    "Grandpa's reading glasses next to a magnifying glass lying on a newspaper; under the magnifying glass the print looks much bigger",
  );
  return column([
    w.title(t("Grandpa's magnifying glass", "दादाजी का आवर्धक काँच")),
    table,
    w.body(
      t(
        "**Stop 4: lenses.** So far: mirrors send the picture back towards the phone, a flat slab of glass can't bring light to a point, and glass is the right material. What they need is a **curved piece of glass** that light goes through.",
        "**पड़ाव 4: लेंस।** अब तक: दर्पण तस्वीर को फ़ोन की ओर ही लौटा देते हैं, काँच का सपाट गुटका प्रकाश को एक बिंदु पर नहीं ला सकता, और काँच सही पदार्थ है। उन्हें चाहिए **काँच का एक मुड़ा हुआ टुकड़ा** जिससे होकर प्रकाश जाए।",
      ),
    ),
    w.body(
      t(
        "Thursday morning, on the balcony, Grandpa reads the newspaper the way he always does: reading glasses on his nose, and a round magnifying glass for the tiny print. Riya and Kabir look at each other. **That's the curved glass.** But what exactly is it, and what does it do to light?",
        "गुरुवार सुबह, बालकनी में, दादाजी हमेशा की तरह अख़बार पढ़ रहे हैं: नाक पर पढ़ने का चश्मा, और छोटे अक्षरों के लिए एक गोल आवर्धक काँच। रिया और कबीर एक-दूसरे को देखते हैं। **यही वह मुड़ा हुआ काँच है।** पर यह ठीक-ठीक है क्या, और प्रकाश के साथ क्या करता है?",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Lens, convex (converging), concave (diverging): defined first. */
const kinds = page(
  "kinds",
  (b) => {
    const w = wordsOn(b);
    const shapes = b.prop(lightSceneDef, "shapes", { scene: SceneKind.LensShapes, ...still });
    b.standsFor(
      shapes,
      "side views of two lenses cut in half: a convex lens, thicker in the middle, bringing three parallel rays together; and a concave lens, thinner in the middle, spreading them apart",
    );
    const clay = choiceQuestion(b, {
      name: "clay",
      prompt: t("Which of these can't be used to make a lens?", "इनमें से किससे लेंस नहीं बनाया जा सकता?"),
      options: [
        { id: "right", label: t("Clay", "मिट्टी") },
        {
          id: "water",
          label: t("Water", "पानी"),
          feedback: t(
            "Water is transparent: a drop of water on a leaf works as a small lens. Remember the lemon in the glass.",
            "पानी पारदर्शी है: पत्ती पर पानी की बूँद एक छोटे लेंस का काम करती है। गिलास वाला नींबू याद करो।",
          ),
        },
        {
          id: "plastic",
          label: t("Clear plastic", "पारदर्शी प्लास्टिक"),
          feedback: t(
            "Clear plastic is transparent, and many spectacle lenses are plastic.",
            "पारदर्शी प्लास्टिक पारदर्शी है, और चश्मे के कई लेंस प्लास्टिक के होते हैं।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("What a lens is", "लेंस क्या है")),
      w.definition(
        t(
          "**Lens.** A piece of transparent material bounded by two surfaces, at least one of them spherical (part of a sphere). A lens with both surfaces bulging **outwards** is a **convex lens**: it is thicker in the middle than at the edges. A lens with both surfaces curved **inwards** is a **concave lens**: it is thicker at the edges than in the middle.",
          "**लेंस।** किसी पारदर्शी पदार्थ का टुकड़ा जो दो सतहों से घिरा हो, जिनमें कम से कम एक गोलीय (किसी गोले का हिस्सा) हो। जिस लेंस की दोनों सतहें **बाहर** की ओर उभरी हों, वह **उत्तल लेंस** है: वह किनारों से बीच में मोटा होता है। जिस लेंस की दोनों सतहें **अंदर** की ओर मुड़ी हों, वह **अवतल लेंस** है: वह बीच से किनारों पर मोटा होता है।",
        ),
      ),
      w.body(
        t(
          "Here are the two kinds cut in half and seen from the side, with three parallel rays going through each. Look at what each one does to the rays.",
          "यहाँ दोनों तरह के लेंस बीच से कटे हुए, बग़ल से दिखाए गए हैं, और हर एक से होकर तीन समानांतर किरणें जा रही हैं। देखो हर एक किरणों के साथ क्या करता है।",
        ),
      ),
      shapes,
      w.body(
        t(
          "A mirror sends light **back**. A lens lets light **through**, and bends it by refraction at both of its surfaces. The convex lens bends the rays **together**; the concave lens spreads them **apart**. Lenses are everywhere: spectacles, magnifying glasses, cameras, microscopes, and the little glass a watchmaker screws into one eye.",
          "दर्पण प्रकाश को **लौटा** देता है। लेंस प्रकाश को **आर-पार** जाने देता है, और अपनी दोनों सतहों पर अपवर्तन से उसे मोड़ता है। उत्तल लेंस किरणों को **पास** लाता है; अवतल लेंस उन्हें **दूर** फैलाता है। लेंस हर जगह हैं: चश्मे, आवर्धक काँच, कैमरे, सूक्ष्मदर्शी, और वह छोटा काँच जो घड़ीसाज़ एक आँख में लगाता है।",
        ),
      ),
      clay,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Centres of curvature, principal axis, optical centre (a ray through it goes straight), aperture. */
const parts = page("parts", (b) => {
  const w = wordsOn(b);
  const glass = b.prop(lensDef, "glass", {
    kind: LensKind.Convex,
    focalLength: 10,
    object: { x: -30, height: 5 },
    rays: [LensRay.Centre],
    showImage: false,
    showLabels: false,
    showCentres: true,
  });
  b.studentOnly(glass.action(LensAction.MoveObject));
  b.standsFor(
    glass,
    "a convex lens drawn from two faint spheres with their centres C₁ and C₂ marked, the principal axis through them, and one ray from the object passing straight through the lens's centre O",
  );
  return column([
    w.title(t("The parts of a lens", "लेंस के हिस्से")),
    w.body(
      t(
        "Most of the names match the spherical mirror's, with one new point.",
        "ज़्यादातर नाम गोलीय दर्पण वाले जैसे ही हैं, बस एक नया बिंदु है।",
      ),
    ),
    w.definition(
      t(
        r`**Parts.** Each spherical surface of a lens is part of a sphere. The centres of those spheres are the lens's two **centres of curvature**, $C_1$ and $C_2$. The straight line through them is the **principal axis**. The central point of the lens, where the principal axis crosses its middle, is its **optical centre**, $O$. The width of the lens's circular outline is its **aperture**.`,
        r`**हिस्से।** लेंस की हर गोलीय सतह एक गोले का हिस्सा है। उन गोलों के केंद्र लेंस के दो **वक्रता केंद्र** $C_1$ और $C_2$ हैं। उनसे होकर जाने वाली सीधी रेखा **मुख्य अक्ष** है। लेंस का केंद्रीय बिंदु, जहाँ मुख्य अक्ष उसके बीच को काटता है, उसका **प्रकाशिक केंद्र** $O$ है। लेंस की गोल रूपरेखा की चौड़ाई उसका **द्वारक** है।`,
      ),
    ),
    w.body(
      t(
        r`In the picture the two faint circles are those spheres, and their centres are marked $C_1$ and $C_2$. The lens is the piece where the two spheres overlap.`,
        r`चित्र में दो हल्के वृत्त वही गोले हैं, और उनके केंद्र $C_1$ और $C_2$ लिखे हैं। लेंस वह टुकड़ा है जहाँ दोनों गोले एक-दूसरे पर चढ़ते हैं।`,
      ),
    ),
    glass,
    w.definition(
      t(
        "**Thin lens.** A lens whose thickness is very small compared with how far away its centres of curvature are, and whose aperture is small too. Every lens in this chapter is a thin lens.",
        "**पतला लेंस।** ऐसा लेंस जिसकी मोटाई उसके वक्रता केंद्रों की दूरी की तुलना में बहुत कम हो, और जिसका द्वारक भी छोटा हो। इस अध्याय का हर लेंस पतला लेंस है।",
      ),
    ),
    w.body(
      t(
        r`**A ray through $O$ goes straight on.** Near its centre, the two faces of a thin lens are almost parallel, like a thin glass slab. A slab only shifts a ray sideways, and in a thin lens that shift is too small to see. Drag the object: the ray crossing the axis at $O$ never bends.`,
        r`**$O$ से होकर जाने वाली किरण सीधी चलती है।** केंद्र के पास पतले लेंस की दोनों सतहें लगभग समानांतर होती हैं, एक पतले काँच के गुटके जैसी। गुटका किरण को केवल बग़ल में खिसकाता है, और पतले लेंस में यह खिसकाव दिखने लायक़ नहीं होता। वस्तु को खिसकाओ: $O$ पर अक्ष को काटती किरण कभी नहीं मुड़ती।`,
      ),
    ),
    space(),
  ]);
});

/** NCERT Activity 10.11: sunlight through a convex lens meets at F; two foci F1 and F2; f = OF. */
const focus = page(
  "focus",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "The principal focus of a lens from NCERT Activity 10.11: parallel sunlight through a convex lens meets at one point on the far side (the bright spot, a real image of the Sun), F; through a concave lens it spreads as if from a point on the near side. A lens has two foci, F1 and F2; f = OF.",
    );
    const sun = b.prop(lensDef, "sun", {
      kind: LensKind.Convex,
      focalLength: 10,
      object: { x: -30, height: 5 },
      rays: [],
      beam: true,
      showImage: false,
      showLabels: false,
    });
    b.standsFor(
      sun,
      "parallel sunlight passing through a convex lens and meeting at one point on the far side",
    );
    const where = choiceQuestion(b, {
      name: "where",
      prompt: t(
        "Where does the convex lens bring the sunlight together?",
        "उत्तल लेंस धूप को कहाँ इकट्ठा करता है?",
      ),
      options: [
        {
          id: "right",
          label: t("At one point on the far side of the lens", "लेंस के दूसरी ओर एक बिंदु पर"),
        },
        {
          id: "same",
          label: t("At one point on the same side as the Sun", "सूरज वाली ओर ही एक बिंदु पर"),
          feedback: t(
            "A lens lets the light through. Look on the right of the lens.",
            "लेंस प्रकाश को आर-पार जाने देता है। लेंस के दाईं ओर देखो।",
          ),
        },
        {
          id: "nowhere",
          label: t("Nowhere: the rays stay parallel", "कहीं नहीं: किरणें समानांतर रहती हैं"),
          feedback: t(
            "Only the ray through O goes straight on. The others bend in towards the axis.",
            "केवल O से होकर जाती किरण सीधी जाती है। बाक़ी अक्ष की ओर मुड़ती हैं।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const focusIs = w.definition(
      t(
        r`**Principal focus of a lens.** Rays parallel to the principal axis, after refraction through a convex lens, meet at a point on the axis. Through a concave lens they spread out as if they came from a point on the axis. That point is the **principal focus**. Light can come from either side, so a lens has **two** principal foci, $F_1$ on the side the light comes from (the object's side, on the left) and $F_2$ on the far side (on the right). The distance from $O$ to a focus is the **focal length**, $f$. We also mark the points at **twice** the focal length, $2F_1$ on the left and $2F_2$ on the right: we'll need them for images.`,
        r`**लेंस का मुख्य फोकस।** मुख्य अक्ष के समानांतर किरणें उत्तल लेंस से अपवर्तित होकर अक्ष पर एक बिंदु पर मिलती हैं। अवतल लेंस से वे ऐसे फैलती हैं मानो अक्ष के एक बिंदु से आ रही हों। वह बिंदु **मुख्य फोकस** है। प्रकाश दोनों ओर से आ सकता है, इसलिए लेंस के **दो** मुख्य फोकस $F_1$ उस ओर जिधर से प्रकाश आता है (वस्तु की ओर, बाईं ओर) और $F_2$ दूसरी ओर (दाईं ओर)। $O$ से फोकस तक की दूरी **फोकस दूरी** $f$ है। हम फोकस दूरी के **दोगुने** पर भी बिंदु लगाते हैं, बाईं ओर $2F_1$ और दाईं ओर $2F_2$: प्रतिबिंबों के लिए इनकी ज़रूरत पड़ेगी।`,
      ),
      "focusIs",
      { isHidden: true },
    );
    const concave = b.prop(
      lensDef,
      "concaveSun",
      {
        kind: LensKind.Concave,
        focalLength: 10,
        object: { x: -30, height: 5 },
        rays: [],
        beam: true,
        showImage: false,
        showLabels: true,
      },
      { isHidden: true },
    );
    b.standsFor(
      concave,
      "the same parallel rays through a concave lens: they spread out, and their dashed lines meet at F₁ on the near side",
    );
    const names = w.body(
      t(
        r`A convex lens brings parallel rays together, so it is also called a **converging lens**. A concave lens spreads parallel rays apart, so it is a **diverging lens**. From now on the pictures label $F_1$, $F_2$, $2F_1$ and $2F_2$.`,
        r`उत्तल लेंस समानांतर किरणों को इकट्ठा करता है, इसलिए उसे **अभिसारी लेंस** भी कहते हैं। अवतल लेंस समानांतर किरणों को फैला देता है, इसलिए वह **अपसारी लेंस** है। अब से चित्रों में $F_1$, $F_2$, $2F_1$ और $2F_2$ लिखे होंगे।`,
      ),
      "names",
      { isHidden: true },
    );
    b.when(where.on(QuestionSignal.Correct), [
      theBoard.show(focusIs),
      theBoard.show(concave),
      theBoard.show(names),
      theBoard.pass(),
    ]);
    return column([
      w.title(t("The principal focus", "मुख्य फोकस")),
      w.note(
        t(
          "Never look at the Sun directly or through a lens. It can damage your eyes.",
          "सूरज को कभी सीधे या लेंस से होकर मत देखो। इससे आँखों को नुक़सान हो सकता है।",
        ),
      ),
      w.body(
        t(
          "NCERT's experiment: hold a convex lens towards the Sun and a sheet of paper behind it. Move the paper until the light on it shrinks to a tiny, dazzling spot. Hold it there and the paper starts to smoke, and can catch fire. The Sun is so far away that its rays arrive **parallel**. The picture shows what the lens does to them.",
          "NCERT का प्रयोग: एक उत्तल लेंस को सूरज की ओर करो और उसके पीछे एक कागज़ रखो। कागज़ को तब तक खिसकाओ जब तक उस पर प्रकाश एक नन्हे, चकाचौंध भरे बिंदु में न सिमट जाए। उसे वहीं रखो तो कागज़ से धुआँ उठने लगता है, और वह जल भी सकता है। सूरज इतनी दूर है कि उसकी किरणें **समानांतर** आती हैं। चित्र दिखाता है कि लेंस उनके साथ क्या करता है।",
        ),
      ),
      sun,
      where,
      focusIs,
      concave,
      names,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** Kabir burns a leaf: the spot is at F, so Grandpa's lens has f ≈ 10 cm, and it is convex. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const kind = choiceQuestion(b, {
      name: "kind",
      prompt: t(
        "Grandpa's magnifying glass is thicker in the middle and brought the sunlight to a spot. What kind of lens is it?",
        "दादाजी का आवर्धक काँच बीच में मोटा है और उसने धूप को एक बिंदु पर इकट्ठा किया। यह किस तरह का लेंस है?",
      ),
      options: [
        { id: "right", label: t("Convex: a converging lens", "उत्तल: अभिसारी लेंस") },
        {
          id: "concave",
          label: t("Concave: a diverging lens", "अवतल: अपसारी लेंस"),
          feedback: t(
            "A concave lens is thinner in the middle and spreads light apart. It could never make a burning spot.",
            "अवतल लेंस बीच में पतला होता है और प्रकाश को फैलाता है। वह कभी जलाने वाला बिंदु नहीं बना सकता।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const howFar = choiceQuestion(b, {
      name: "howFar",
      prompt: t(
        "The dazzling spot was sharpest with the leaf about 10 cm from the glass. What does that tell them?",
        "चकाचौंध भरा बिंदु तब सबसे साफ़ था जब पत्ती काँच से लगभग 10 सेमी पर थी। इससे उन्हें क्या पता चलता है?",
      ),
      options: [
        {
          id: "right",
          label: t("The focal length is about 10 cm", "फोकस दूरी लगभग 10 सेमी है"),
        },
        {
          id: "aperture",
          label: t("The aperture is about 10 cm", "द्वारक लगभग 10 सेमी है"),
          feedback: t(
            "The aperture is the width of the lens. The spot sits at the focus, so 10 cm is the distance from O to F.",
            "द्वारक लेंस की चौड़ाई है। बिंदु फोकस पर बनता है, इसलिए 10 सेमी O से F तक की दूरी है।",
          ),
        },
        {
          id: "radius",
          label: t("The centre of curvature is 10 cm away", "वक्रता केंद्र 10 सेमी दूर है"),
          feedback: t(
            "Parallel rays meet at the principal focus, not at the centre of curvature.",
            "समानांतर किरणें मुख्य फोकस पर मिलती हैं, वक्रता केंद्र पर नहीं।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const learned = w.body(
      t(
        "So Grandpa's magnifying glass is a **convex** lens with a focal length of about 10 cm. Like the concave mirror, it brings light together, but on the **far side**, away from where the light came in. That's exactly what a projector needs: the phone on one side, the wall on the other.",
        "तो दादाजी का आवर्धक काँच लगभग 10 सेमी फोकस दूरी वाला एक **उत्तल** लेंस है। अवतल दर्पण की तरह यह प्रकाश को इकट्ठा करता है, पर **दूसरी ओर**, उस ओर से दूर जहाँ से प्रकाश आया। प्रोजेक्टर को ठीक यही चाहिए: फ़ोन एक ओर, दीवार दूसरी ओर।",
      ),
      "learned",
      { isHidden: true },
    );
    b.when(kind.on(QuestionSignal.Correct), theBoard.show(howFar));
    b.when(howFar.on(QuestionSignal.Correct), [theBoard.show(learned), theBoard.pass()]);
    return column([
      w.title(t("Smoke from a leaf", "पत्ती से धुआँ")),
      w.body(
        t(
          "Grandpa nods off. Kabir borrows the magnifying glass, holds it towards the Sun and catches the light on a dry leaf. He moves the glass until the light shrinks to a tiny, dazzling spot. A few seconds later a thin curl of smoke rises from the leaf. Grandpa wakes up, and the magnifying glass goes back on the newspaper. But Riya has learned two things.",
          "दादाजी को झपकी आ जाती है। कबीर आवर्धक काँच उठाता है, उसे सूरज की ओर करता है और प्रकाश को एक सूखी पत्ती पर लेता है। वह काँच को तब तक खिसकाता है जब तक प्रकाश एक नन्हे, चकाचौंध भरे बिंदु में न सिमट जाए। कुछ सेकंड बाद पत्ती से धुएँ की एक पतली लकीर उठती है। दादाजी जाग जाते हैं, और आवर्धक काँच वापस अख़बार पर। पर रिया ने दो बातें सीख ली हैं।",
        ),
      ),
      kind,
      howFar,
      learned,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** A worked reading of a lens figure, then two quick checks. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const fig = b.prop(lensDef, "fig", {
      kind: LensKind.Concave,
      focalLength: 10,
      object: { x: -30, height: 5 },
      rays: [],
      beam: true,
      showImage: false,
      showLabels: true,
    });
    b.standsFor(
      fig,
      "parallel rays through a concave lens: they spread out, and their dashed lines meet at F₁, on the side the light comes from",
    );
    const thin = choiceQuestion(b, {
      name: "thin",
      prompt: t(
        "A lens is thinner in the middle than at its edges. It is…",
        "एक लेंस किनारों से बीच में पतला है। वह है…",
      ),
      options: [
        { id: "right", label: t("concave, and diverging", "अवतल, और अपसारी") },
        {
          id: "convex",
          label: t("convex, and converging", "उत्तल, और अभिसारी"),
          feedback: t("A convex lens is thicker in the middle.", "उत्तल लेंस बीच में मोटा होता है।"),
        },
        {
          id: "mixed",
          label: t("concave, and converging", "अवतल, और अभिसारी"),
          feedback: t(
            "Thinner in the middle bends rays apart: diverging.",
            "बीच में पतला किरणों को फैलाता है: अपसारी।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const how = choiceQuestion(b, {
      name: "how",
      prompt: t(
        "A ray goes through the optical centre of a thin convex lens. After the lens it…",
        "एक किरण पतले उत्तल लेंस के प्रकाशिक केंद्र से होकर जाती है। लेंस के बाद वह…",
      ),
      options: [
        { id: "right", label: t("goes straight on", "सीधी चली जाती है") },
        {
          id: "focus",
          label: t("bends through the focus", "मुड़कर फोकस से होकर जाती है"),
          feedback: t(
            "That's what a ray parallel to the axis does. At O the two faces are almost parallel, so the ray doesn't bend.",
            "ऐसा अक्ष के समानांतर किरण करती है। O पर दोनों सतहें लगभग समानांतर हैं, इसलिए किरण नहीं मुड़ती।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ Grandpa's magnifying glass is a **convex**, converging lens, with a focal length of about 10 cm. It brings light together, like the concave mirror, but on the **far side**, away from where the light came in. So in a shoebox projector the phone goes on one side of the lens and the wall on the other. ? Where exactly should the phone go? Tomorrow they build it.",
        "**मिशन लॉग।** ✓ दादाजी का आवर्धक काँच एक **उत्तल**, अभिसारी लेंस है, जिसकी फोकस दूरी लगभग 10 सेमी है। यह प्रकाश को इकट्ठा करता है, अवतल दर्पण की तरह, पर **दूसरी ओर**, उस ओर से दूर जहाँ से प्रकाश आया। इसलिए जूते के डिब्बे वाले प्रोजेक्टर में फ़ोन लेंस की एक ओर होगा और दीवार दूसरी ओर। ? फ़ोन ठीक कहाँ रखें? कल वे इसे बनाएँगे।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(thin.on(QuestionSignal.Correct), theBoard.show(how));
    b.when(how.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([
      w.title(t("Your turn", "अब तुम्हारी बारी")),
      w.body(
        t(
          "**Example.** Read the figure: what kind of lens is this, and where is its principal focus?",
          "**उदाहरण।** चित्र पढ़ो: यह किस तरह का लेंस है, और इसका मुख्य फोकस कहाँ है?",
        ),
      ),
      fig,
      w.body(
        t(
          r`The parallel rays spread apart after the lens, so it is a **concave**, diverging lens. No real ray passes through a focus here. Trace the spreading rays backwards (the dashed lines): they meet at $F_1$, on the side the light **came from**. That is the principal focus of a concave lens.`,
          r`लेंस के बाद समानांतर किरणें फैल जाती हैं, इसलिए यह **अवतल**, अपसारी लेंस है। यहाँ कोई असली किरण फोकस से होकर नहीं जाती। फैलती किरणों को पीछे बढ़ाओ (बिंदुदार रेखाएँ): वे $F_1$ पर मिलती हैं, उस ओर जहाँ से प्रकाश **आया**। यही अवतल लेंस का मुख्य फोकस है।`,
        ),
      ),
      thin,
      how,
      log,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [hook, kinds, parts, focus, inLife, yourTurn];

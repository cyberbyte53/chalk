import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import { MirrorKind, Ray, SphericalMirrorAction, sphericalMirrorDef } from "@chalk/prop-light";

/** The convex mirror every page uses: f = 10 cm, so F is 10 cm and C 20 cm behind it. */
const mirror = { kind: MirrorKind.Convex, focalLength: 10, showLabels: true } as const;

/** The story: the shop's security mirror, and the one thing it can never do. */
const story = page(
  "story",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "Feel that a convex mirror has only one case: wherever the object is, the image is virtual, erect and diminished, between P and F behind the mirror; the student tries and fails to make it large.",
    );
    const guess = choiceQuestion(b, {
      name: "guess",
      prompt: t(
        "In the shop's round mirror, can you ever make your face look **larger** than it is?",
        "दुकान के गोल दर्पण में, क्या तुम कभी अपना चेहरा असल से **बड़ा** दिखा सकते हो?",
      ),
      options: [
        {
          id: "close",
          label: t("Yes, by coming very close", "हाँ, बहुत पास आकर"),
          feedback: t(
            "Coming close makes it less tiny, but never larger than life. Try it on the mirror below.",
            "पास आने से यह उतना नन्हा नहीं रहता, पर असल से बड़ा कभी नहीं होता। नीचे दर्पण पर आज़माओ।",
          ),
        },
        {
          id: "far",
          label: t("Yes, by standing far back", "हाँ, दूर खड़े होकर"),
          feedback: t(
            "Far back it shrinks to a dot. Try it on the mirror below.",
            "दूर जाने पर वह बिंदु भर रह जाता है। नीचे दर्पण पर आज़माओ।",
          ),
        },
        { id: "never", label: t("No, never", "नहीं, कभी नहीं") },
      ],
      answer: "never",
      passes: false,
    });
    const m = b.prop(
      sphericalMirrorDef,
      "mirror",
      {
        ...mirror,
        object: { x: -25, height: 5 },
        rays: [Ray.Parallel, Ray.Focal],
        showImage: true,
      },
      { isHidden: true },
    );
    b.studentOnly(m.action(SphericalMirrorAction.MoveObject));
    b.standsFor(
      m,
      "the shop's convex security mirror (f = 10 cm): the blue arrow is the student, the orange one their image",
    );
    const seen = w.definition(
      t(
        "**Never.** Drag the object anywhere, far or near: the image stays **behind the mirror, erect, and smaller** than the object, always between P and F. That is why the shop uses it: a small, upright picture of the whole shop fits in one round mirror.",
        "**कभी नहीं।** वस्तु को कहीं भी खींचो, दूर या पास: प्रतिबिंब **दर्पण के पीछे, सीधा और वस्तु से छोटा** रहता है, हमेशा P और F के बीच। इसीलिए दुकान इसे लगाती है: पूरी दुकान की छोटी, सीधी तस्वीर एक गोल दर्पण में समा जाती है।",
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
      w.body(
        t(
          "High in the corner of a shop hangs a round, bulging mirror. In it the shopkeeper sees every aisle at once, small and the right way up. It is the back of the spoon made large: a **convex** mirror.",
          "दुकान के कोने में ऊँचाई पर एक गोल, उभरा हुआ दर्पण टँगा है। उसमें दुकानदार को हर गलियारा एक साथ दिखता है, छोटा और सीधा। यह चम्मच की पीठ का बड़ा रूप है: **उत्तल** दर्पण।",
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

/** The rays for a convex mirror: the same rules, aimed at F and C behind the mirror. */
const rules = page("rules", (b) => {
  const w = wordsOn(b);
  const m = b.prop(sphericalMirrorDef, "mirror", {
    ...mirror,
    object: { x: -20, height: 5 },
    rays: [Ray.Parallel, Ray.Focal, Ray.Centre, Ray.Pole],
    showImage: true,
  });
  b.standsFor(
    m,
    "an object in front of a convex mirror with all four standard rays, their dashed extensions meeting at the virtual image behind",
  );
  return column([
    w.title(t("Drawing the rays", "किरणें बनाना")),
    w.body(
      t(
        "The rules are the ones you know, with F and C now **behind** the mirror. A ray **parallel to the axis** reflects as if it came **from F**: draw the reflected ray away from F, and dash its extension back to F. A ray **aimed at F** reflects **parallel** to the axis. A ray **aimed at C** comes back **along itself**. A ray to the **pole** reflects at the same angle on the other side.",
        "नियम वही हैं जो तुम जानते हो, बस F और C अब दर्पण के **पीछे** हैं। **अक्ष के समानांतर** किरण ऐसे परावर्तित होती है मानो **F से** आई हो: परावर्तित किरण F से दूर जाती हुई बनाओ, और उसका विस्तार बिंदुदार रेखा से पीछे F तक बनाओ। **F की ओर तानी** किरण अक्ष के **समानांतर** परावर्तित होती है। **C की ओर तानी** किरण **उसी रास्ते** लौटती है। **ध्रुव** पर पड़ी किरण दूसरी ओर उतना ही कोण बनाकर लौटती है।",
      ),
    ),
    m,
    w.definition(
      t(
        "The reflected rays all **spread apart**, so they never meet in front. Their dashed extensions meet **behind** the mirror, between P and F: that is the image, **virtual, erect and diminished**, for every position of the object. An object **at infinity** gives a point image **at F**.",
        "परावर्तित किरणें सब **फैल जाती हैं**, इसलिए सामने कभी नहीं मिलतीं। उनके बिंदुदार विस्तार दर्पण के **पीछे**, P और F के बीच मिलते हैं: वही प्रतिबिंब है, **आभासी, सीधा और छोटा**, वस्तु की हर स्थिति के लिए। **अनंत** पर रखी वस्तु का बिंदु-प्रतिबिंब **F पर** बनता है।",
      ),
    ),
    w.body(
      t(
        "Only two cases to remember, then: the object at infinity (image at F, a point), and the object anywhere else (image between P and F, diminished). Drag the object and see the image never leave that short stretch.",
        "तो याद रखने को बस दो स्थितियाँ: वस्तु अनंत पर (प्रतिबिंब F पर, एक बिंदु), और वस्तु कहीं और (प्रतिबिंब P और F के बीच, छोटा)। वस्तु को खिसकाओ और देखो प्रतिबिंब उस छोटे से हिस्से से कभी बाहर नहीं जाता।",
      ),
    ),
    space(),
  ]);
});

/** Example: a ray diagram for an object in front of a convex mirror. */
const example = page("example", (b) => {
  const w = wordsOn(b);
  return column([
    w.title(t("Example", "उदाहरण")),
    w.body(
      t(
        "**An object is placed 20 cm in front of a convex mirror of focal length 10 cm. Draw a ray diagram and describe the image.**",
        "**10 सेमी फोकस दूरी वाले उत्तल दर्पण के सामने 20 सेमी पर एक वस्तु रखी है। किरण आरेख बनाओ और प्रतिबिंब का वर्णन करो।**",
      ),
    ),
    w.body(
      t(
        "Draw the mirror bulging towards the object, the axis, P, and F 10 cm and C 20 cm **behind** the mirror. Stand the object 20 cm in front. From its tip draw the parallel ray; after reflection it heads away from F, so dash its extension back to F. Then draw the ray aimed at C; it reflects straight back, so dash its extension on to C.",
        "दर्पण को वस्तु की ओर उभरा हुआ बनाओ, अक्ष, P, और दर्पण के **पीछे** 10 सेमी पर F व 20 सेमी पर C। वस्तु को 20 सेमी सामने खड़ा करो। उसकी नोक से समानांतर किरण बनाओ; परावर्तन के बाद वह F से दूर जाती है, इसलिए उसका विस्तार बिंदुदार रेखा से पीछे F तक बनाओ। फिर C की ओर तानी किरण बनाओ; वह सीधी लौटती है, इसलिए उसका विस्तार C तक बिंदुदार बनाओ।",
      ),
    ),
    w.body(
      t(
        "The two dashed lines cross behind the mirror, above the axis, between P and F. So the image is **virtual, erect and diminished, between P and F behind the mirror**. (With the mirror formula, which comes later, you would find it exactly 6.7 cm behind and one-third the size.)",
        "दोनों बिंदुदार रेखाएँ दर्पण के पीछे, अक्ष के ऊपर, P और F के बीच मिलती हैं। इसलिए प्रतिबिंब **आभासी, सीधा और छोटा, दर्पण के पीछे P और F के बीच** है। (दर्पण सूत्र से, जो बाद में आता है, तुम इसे ठीक 6.7 सेमी पीछे और एक-तिहाई आकार का पाओगे।)",
      ),
    ),
    space(),
  ]);
});

/** Question: which mirror gave this image. */
const questionWhich = page(
  "question-which",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "which",
      prompt: t(
        "No matter where you stand, a mirror shows you upright and smaller than you are. Which mirror is it?",
        "तुम चाहे कहीं भी खड़े हो, एक दर्पण तुम्हें सीधा और असल से छोटा दिखाता है। वह कौन-सा दर्पण है?",
      ),
      options: [
        {
          id: "plane",
          label: t("Plane", "समतल"),
          feedback: t(
            "A plane mirror shows you the same size.",
            "समतल दर्पण तुम्हें बराबर आकार में दिखाता है।",
          ),
        },
        {
          id: "concave",
          label: t("Concave", "अवतल"),
          feedback: t(
            "A concave mirror shows you upside down from most places, and large and upright from close up.",
            "अवतल दर्पण तुम्हें ज़्यादातर जगहों से उल्टा, और पास से बड़ा और सीधा दिखाता है।",
          ),
        },
        { id: "convex", label: t("Convex", "उत्तल") },
      ],
      answer: "convex",
    });
    return column([w.title(t("Question", "प्रश्न")), ask, space()]);
  },
  { passOn: PassOn.Rules },
);

/** Question: the image's place for a convex mirror. */
const questionPlace = page(
  "question-place",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "place",
      prompt: t(
        "An object is 50 cm in front of a convex mirror of focal length 15 cm. Where is its image?",
        "15 सेमी फोकस दूरी वाले उत्तल दर्पण के सामने 50 सेमी पर एक वस्तु है। उसका प्रतिबिंब कहाँ है?",
      ),
      options: [
        {
          id: "behind",
          label: t("Behind the mirror, between P and F", "दर्पण के पीछे, P और F के बीच"),
        },
        {
          id: "front",
          label: t("In front of the mirror, between F and C", "दर्पण के सामने, F और C के बीच"),
          feedback: t(
            "That is where a concave mirror puts it. A convex mirror's rays never meet in front.",
            "वहाँ अवतल दर्पण रखता है। उत्तल दर्पण की किरणें सामने कभी नहीं मिलतीं।",
          ),
        },
        {
          id: "beyondF",
          label: t("Behind the mirror, beyond F", "दर्पण के पीछे, F से परे"),
          feedback: t(
            "The image never gets as far back as F; F is where it would be for an object infinitely far away.",
            "प्रतिबिंब कभी F जितना पीछे नहीं जाता; F वहाँ है जहाँ अनंत दूर वस्तु का प्रतिबिंब होता।",
          ),
        },
      ],
      answer: "behind",
    });
    return column([w.title(t("Question", "प्रश्न")), ask, space()]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order. */
export const overview = [story, rules, example, questionWhich, questionPlace];

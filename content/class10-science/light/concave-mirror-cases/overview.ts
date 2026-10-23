import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import type { Localized } from "@chalk/content";
import { choiceQuestion, goalQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  MirrorKind,
  Place,
  Ray,
  SceneKind,
  SphericalMirrorAction,
  SphericalMirrorDerived,
  lightSceneDef,
  sphericalMirrorDef,
} from "@chalk/prop-light";

const r = String.raw;

/** The concave mirror every page uses: f = 10 cm, so C is 20 cm in front. */
const mirror = { kind: MirrorKind.Concave, focalLength: 10, showLabels: true } as const;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** Stop 2, continued: the picture lands where Riya said, but it's small. Where should the phone go? */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const room = b.prop(lightSceneDef, "room", {
    scene: SceneKind.PhoneCard,
    isLit: true,
    canToggle: false,
  });
  b.standsFor(
    room,
    "night: the phone showing a bright movie in front of Mom's make-up mirror, and Kabir holding a white card with a small upside-down copy of the picture on it",
  );
  return column([
    w.title(t("Bigger, please", "और बड़ी, प्लीज़")),
    w.body(
      t(
        "**Stop 2, continued.** Riya's rays told Kabir exactly where to hold the card, and the picture was sharp. But it was **tiny**, about the size of a stamp. Nobody watches a movie on a stamp.",
        "**पड़ाव 2, आगे।** रिया की किरणों ने कबीर को ठीक बता दिया कि कार्ड कहाँ रखना है, और तस्वीर साफ़ थी। पर वह **नन्ही** थी, लगभग डाक टिकट जितनी। डाक टिकट पर कोई फ़िल्म नहीं देखता।",
      ),
    ),
    room,
    w.body(
      t(
        "Kabir moves the phone closer to the mirror, and the picture on the card changes size. So the question for this lesson: **where must the object be to get a big, real picture?** Let's go through every position, one at a time.",
        "कबीर फ़ोन को दर्पण के पास ले जाता है, और कार्ड पर तस्वीर का आकार बदल जाता है। तो इस पाठ का सवाल: **बड़ी, वास्तविक तस्वीर के लिए वस्तु कहाँ होनी चाहिए?** चलो हर जगह को एक-एक करके देखें।",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Three things to say about any image, defined before any case uses them. */
const describe = page("describe", (b) => {
  const w = wordsOn(b);
  return column([
    w.title(t("Describing an image", "प्रतिबिंब का वर्णन")),
    w.body(
      t(
        "To compare images we always say the same three things about each one.",
        "प्रतिबिंबों की तुलना के लिए हम हर एक के बारे में हमेशा यही तीन बातें कहते हैं।",
      ),
    ),
    w.definition(
      t(
        "**Position.** **Where** the image is: for example, between F and C, or behind the mirror.",
        "**स्थिति।** प्रतिबिंब **कहाँ** है: जैसे, F और C के बीच, या दर्पण के पीछे।",
      ),
    ),
    w.definition(
      t(
        "**Size.** **Enlarged** (bigger than the object), **diminished** (smaller), or **the same size**.",
        "**आकार।** **बड़ा** (वस्तु से बड़ा), **छोटा** (वस्तु से छोटा), या **बराबर आकार**।",
      ),
    ),
    w.definition(
      t(
        "**Nature.** **Real** (the rays really meet, so a screen can catch it) or **virtual** (they only seem to). And **erect** (the right way up) or **inverted** (upside down).",
        "**प्रकृति।** **वास्तविक** (किरणें सचमुच मिलती हैं, इसलिए पर्दा उसे पकड़ सकता है) या **आभासी** (केवल मिलती हुई लगती हैं)। और **सीधा** या **उल्टा**।",
      ),
    ),
    space(),
  ]);
});

/** Catch a real image on a screen: sharp only where the rays really meet. */
const card = page(
  "screen",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "Catch a real image on a screen (NCERT Activity 10.3): an object 15 cm from a concave mirror of focal length 10 cm; the learner slides a screen until the picture is sharp, at 30 cm, where the rays really meet. Nearer or farther, the rays haven't met yet or have crossed already, so the picture blurs.",
    );
    const m = b.prop(sphericalMirrorDef, "mirror", {
      ...mirror,
      object: { x: -15, height: 6 },
      rays: [Ray.Parallel, Ray.Focal],
      showImage: false,
      screen: -24,
      canMoveScreen: true,
    });
    b.studentOnly(m.action(SphericalMirrorAction.MoveScreen));
    b.standsFor(
      m,
      "an object as an arrow 15 cm from a concave mirror (f = 10 cm), and a white screen the learner slides to catch its image, blurred until it is in the right place",
    );
    const goal = goalQuestion(b, {
      about: m,
      prompt: t(
        "Slide the screen until the image on it is **sharp**.",
        "पर्दे को तब तक खिसकाओ जब तक उस पर प्रतिबिंब **साफ़** न हो जाए।",
      ),
      isMet: m.derived(SphericalMirrorDerived.IsSharp),
      solve: [m.learner(SphericalMirrorAction.MoveScreen, { x: -30 })],
      notes: [
        {
          when: m.field("screen").gt(-30),
          say: t(
            "Still blurred: the rays haven't come together yet. Move the screen farther from the mirror.",
            "अभी भी धुँधला: किरणें अभी तक मिली नहीं हैं। पर्दे को दर्पण से और दूर ले जाओ।",
          ),
          reach: [m.learner(SphericalMirrorAction.MoveScreen, { x: -24 })],
        },
      ],
    });
    const why = w.body(
      t(
        "Sharp at 30 cm, and nowhere else. Follow the two rays: they **really meet** at one point. Put the screen there, and all the light from the object's tip lands on one spot. Nearer, and the rays haven't met yet. Farther, and they've already crossed and spread out again. Either way the tip becomes a smear. So this image is at 30 cm, **enlarged**, **real** and **inverted**.",
        "30 सेमी पर साफ़, और कहीं नहीं। दोनों किरणों का पीछा करो: वे एक बिंदु पर **सचमुच मिलती** हैं। पर्दा वहाँ रखो, तो वस्तु की नोक का सारा प्रकाश एक जगह पड़ता है। पास, तो किरणें अभी मिली नहीं हैं। दूर, तो वे मिलकर फिर फैल चुकी हैं। दोनों ही बार नोक धब्बा बन जाती है। इसलिए यह प्रतिबिंब 30 सेमी पर, **बड़ा**, **वास्तविक** और **उल्टा** है।",
      ),
      "why",
      { isHidden: true },
    );
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(why));
    return column([
      w.title(t("Catch it on a screen", "पर्दे पर पकड़ो")),
      w.body(
        t(
          "NCERT's activity: put a lit candle in front of a concave mirror and catch its image on a white screen. Here the object is 15 cm from a mirror of focal length 10 cm.",
          "NCERT का प्रयोग: अवतल दर्पण के सामने एक जलती मोमबत्ती रखो और उसका प्रतिबिंब एक सफ़ेद पर्दे पर पकड़ो। यहाँ वस्तु 10 सेमी फोकस दूरी वाले दर्पण से 15 सेमी पर है।",
        ),
      ),
      m,
      goal,
      why,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** NCERT Activity 10.3: bring the object in; the image is real until F, then jumps behind. */
const candle = page(
  "move",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "NCERT Activity 10.3 on the prop: move the object in from far away; while it is outside F the image is real and inverted, in front of the mirror (a screen catches it); once it crosses F the image jumps behind the mirror, virtual, erect and enlarged. F is the switch.",
    );
    const m = b.prop(sphericalMirrorDef, "mirror", {
      ...mirror,
      object: { x: -35, height: 5 },
      rays: [Ray.Parallel, Ray.Focal],
      showImage: true,
    });
    b.studentOnly(m.action(SphericalMirrorAction.MoveObject));
    b.standsFor(
      m,
      "a concave mirror (f = 10 cm) and the object as the blue arrow; the orange arrow is its image",
    );
    const goal = goalQuestion(b, {
      about: m,
      prompt: t(
        "Drag the object towards the mirror until its image is **behind** the mirror and the right way up.",
        "वस्तु को दर्पण की ओर तब तक खिसकाओ जब तक उसका प्रतिबिंब दर्पण के **पीछे** और सीधा न हो जाए।",
      ),
      isMet: m
        .derived(SphericalMirrorDerived.IsReal)
        .not()
        .and(m.derived(SphericalMirrorDerived.V).neq(null)),
      solve: [m.learner(SphericalMirrorAction.MoveObject, { x: -5 })],
      notes: [
        {
          when: m.derived(SphericalMirrorDerived.U).lt(-10.5),
          say: t(
            "The image is still in front of the mirror and upside down. Keep coming in, past F.",
            "प्रतिबिंब अभी भी दर्पण के सामने और उल्टा है। और पास आओ, F के पार।",
          ),
          reach: [m.learner(SphericalMirrorAction.MoveObject, { x: -14 })],
        },
      ],
    });
    const wrap = w.body(
      t(
        "**F is the switch.** While the object is farther than F, the reflected rays really meet in front of the mirror: the image is **real** and **inverted**, and a screen there would catch it. Once the object is closer than F, the reflected rays spread apart. Only their dashed lines meet, behind the mirror: the image is **virtual**, **erect** and **enlarged**.",
        "**F ही स्विच है।** जब तक वस्तु F से दूर है, परावर्तित किरणें दर्पण के सामने सचमुच मिलती हैं: प्रतिबिंब **वास्तविक** और **उल्टा** है, और वहाँ रखा पर्दा उसे पकड़ लेता। वस्तु F से पास आते ही परावर्तित किरणें फैल जाती हैं। केवल उनकी बिंदुदार रेखाएँ दर्पण के पीछे मिलती हैं: प्रतिबिंब **आभासी**, **सीधा** और **बड़ा** है।",
      ),
      "wrap",
      { isHidden: true },
    );
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(wrap));
    return column([
      w.title(t("Bring the object in", "वस्तु को पास लाओ")),
      w.body(
        t(
          "The blue arrow is the object, and the orange arrow is its image, found with rays 1 and 2. Bring the object in from far away and watch the image. Far away it's small and upside down. Closer, it grows. Then, suddenly, it jumps behind the mirror.",
          "नीला तीर वस्तु है, और नारंगी तीर उसका प्रतिबिंब, जो किरण 1 और 2 से मिला है। वस्तु को दूर से पास लाओ और प्रतिबिंब देखो। दूर पर वह छोटा और उल्टा है। पास आने पर बढ़ता है। फिर अचानक वह दर्पण के पीछे कूद जाता है।",
        ),
      ),
      m,
      goal,
      wrap,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** At infinity: the sun beam meets at F, a point-sized real image. */
const atInfinity = page("case-infinity", (b) => {
  const w = wordsOn(b);
  const m = b.prop(sphericalMirrorDef, "mirror", {
    ...mirror,
    object: { x: -35, height: 5 },
    rays: [],
    showImage: false,
    beam: true,
  });
  b.standsFor(m, "parallel rays from a very distant object meeting at F");
  return column([
    w.title(t("Case 1: object at infinity", "स्थिति 1: वस्तु अनंत पर")),
    w.body(
      t(
        "An object very, very far away, like the Sun, is said to be **at infinity**. Its rays arrive parallel to the axis, and by ray 1 they all meet at F.",
        "बहुत-बहुत दूर की वस्तु, जैसे सूरज, **अनंत पर** कही जाती है। उसकी किरणें अक्ष के समानांतर आती हैं, और किरण 1 से वे सब F पर मिलती हैं।",
      ),
    ),
    m,
    w.definition(
      t(
        "**Image at F: real, inverted, highly diminished, point-sized.** This is the bright spot that burns paper.",
        "**प्रतिबिंब F पर: वास्तविक, उल्टा, बहुत छोटा, बिंदु के आकार का।** यही वह चमकीला बिंदु है जो कागज़ जलाता है।",
      ),
    ),
    space(),
  ]);
});

/** One textbook position: the object placed by name, rays 1 and 2, the image, its nature, why. */
function casePage(
  name: string,
  at: Place,
  x: number,
  title: Localized,
  nature: Localized,
  why: Localized,
  look: { rays?: Ray[]; height?: number; span?: number } = {},
) {
  return page(name, (b) => {
    const w = wordsOn(b);
    const m = b.prop(sphericalMirrorDef, "mirror", {
      ...mirror,
      object: { x, height: look.height ?? 5 },
      rays: look.rays ?? [Ray.Parallel, Ray.Focal],
      showImage: true,
      ...(look.span === undefined ? {} : { span: look.span }),
    });
    b.studentOnly(m.action(SphericalMirrorAction.MoveObject));
    b.standsFor(m, `the object ${at} of a concave mirror, with two standard rays and the image`);
    return column([w.title(title), m, w.definition(nature), w.body(why), space()]);
  });
}

const beyondC = casePage(
  "case-beyond-c",
  Place.BeyondCentre,
  -30,
  t("Case 2: object beyond C", "स्थिति 2: वस्तु C से परे"),
  t(
    "**Image between F and C: real, inverted, diminished.**",
    "**प्रतिबिंब F और C के बीच: वास्तविक, उल्टा, छोटा।**",
  ),
  t(
    "Ray 1 goes through F, and ray 2 comes back parallel below the axis. They cross between F and C, below the axis, so the image is upside down. Drag the object farther: the image shrinks and creeps towards F, the way case 1 ends.",
    "किरण 1, F से होकर जाती है, और किरण 2 अक्ष के नीचे समानांतर लौटती है। वे F और C के बीच, अक्ष के नीचे, एक-दूसरे को काटती हैं, इसलिए प्रतिबिंब उल्टा है। वस्तु को और दूर खींचो: प्रतिबिंब छोटा होकर F की ओर सरकता है, जैसा स्थिति 1 में होता है।",
  ),
);

const atC = casePage(
  "case-at-c",
  Place.AtCentre,
  -20,
  t("Case 3: object at C", "स्थिति 3: वस्तु C पर"),
  t(
    "**Image at C: real, inverted, the same size.**",
    "**प्रतिबिंब C पर: वास्तविक, उल्टा, बराबर आकार।**",
  ),
  t(
    "Light can always run backwards along its own path, so an object and its image can swap places. In case 2 the image is nearer than C, and in case 4 it is farther, so they swap round at C. At C the object and its image must sit in the same place, the image flipped below the axis and exactly the same size. It is the one place where the mirror neither enlarges nor shrinks.",
    "प्रकाश हमेशा अपने ही रास्ते पर उल्टा चल सकता है, इसलिए वस्तु और उसका प्रतिबिंब जगह बदल सकते हैं। स्थिति 2 में प्रतिबिंब C से पास है, और स्थिति 4 में दूर, इसलिए C पर वे आपस में बदलते हैं। C पर वस्तु और उसका प्रतिबिंब एक ही जगह होने चाहिए, प्रतिबिंब अक्ष के नीचे पलटा हुआ और ठीक बराबर आकार का। यही अकेली जगह है जहाँ दर्पण न बड़ा करता है न छोटा।",
  ),
);

const betweenCF = casePage(
  "case-between-c-f",
  Place.BetweenCentreAndFocus,
  -15,
  t("Case 4: object between C and F", "स्थिति 4: वस्तु C और F के बीच"),
  t("**Image beyond C: real, inverted, enlarged.**", "**प्रतिबिंब C से परे: वास्तविक, उल्टा, बड़ा।**"),
  t(
    "This is case 2 run backwards: light retraces its path, so object and image have swapped places. Drag the object closer to F and the image grows and runs farther away. This is the only place that gives a picture that is both **real and enlarged**: a big picture a screen can catch.",
    "यह स्थिति 2 उल्टी है: प्रकाश अपना रास्ता उल्टा चलता है, इसलिए वस्तु और प्रतिबिंब ने जगह बदल ली है। वस्तु को F के पास लाओ: प्रतिबिंब बड़ा होकर और दूर भागता है। केवल यही जगह ऐसी तस्वीर देती है जो **वास्तविक भी हो और बड़ी भी**: एक बड़ी तस्वीर जिसे पर्दा पकड़ सकता है।",
  ),
  { height: 3, span: 40 },
);

const atF = casePage(
  "case-at-f",
  Place.AtFocus,
  -10,
  t("Case 5: object at F", "स्थिति 5: वस्तु F पर"),
  t(
    "**Image at infinity: real, inverted, highly enlarged.**",
    "**प्रतिबिंब अनंत पर: वास्तविक, उल्टा, बहुत बड़ा।**",
  ),
  t(
    "This is case 1 run backwards. Every ray from F leaves parallel to the axis, so the reflected rays never meet. Ray 2 can't even be drawn here, so the picture uses rays 1 and 3: they leave parallel to each other. We say the image is at infinity.",
    "यह स्थिति 1 उल्टी है। F से आती हर किरण अक्ष के समानांतर निकलती है, इसलिए परावर्तित किरणें कभी नहीं मिलतीं। यहाँ किरण 2 बन ही नहीं सकती, इसलिए चित्र में किरण 1 और 3 हैं: वे एक-दूसरे के समानांतर निकलती हैं। हम कहते हैं कि प्रतिबिंब अनंत पर है।",
  ),
  { rays: [Ray.Parallel, Ray.Centre], height: 3 },
);

const insideF = casePage(
  "case-inside-f",
  Place.BetweenFocusAndPole,
  -5,
  t("Case 6: object between F and P", "स्थिति 6: वस्तु F और P के बीच"),
  t(
    "**Image behind the mirror: virtual, erect, enlarged.**",
    "**प्रतिबिंब दर्पण के पीछे: आभासी, सीधा, बड़ा।**",
  ),
  t(
    "Now the reflected rays spread apart and never meet in front. Their dashed lines meet behind the mirror, above the axis. No light goes there, so no screen can catch this image. You see it by looking into the mirror.",
    "अब परावर्तित किरणें फैल जाती हैं और सामने कभी नहीं मिलतीं। उनकी बिंदुदार रेखाएँ दर्पण के पीछे, अक्ष के ऊपर मिलती हैं। वहाँ कोई प्रकाश नहीं जाता, इसलिए कोई पर्दा इस प्रतिबिंब को नहीं पकड़ सकता। इसे दर्पण में देखकर ही देखा जाता है।",
  ),
  { height: 3 },
);

/** NCERT Table 10.1, read as one story. */
const table = page("table", (b) => {
  const w = wordsOn(b);
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
        "**At infinity** → image at F: real, inverted, point-sized",
        "**अनंत पर** → प्रतिबिंब F पर: वास्तविक, उल्टा, बिंदु जैसा",
      ),
    ),
    w.body(
      t(
        "**Beyond C** → between F and C: real, inverted, diminished",
        "**C से परे** → F और C के बीच: वास्तविक, उल्टा, छोटा",
      ),
    ),
    w.body(
      t("**At C** → at C: real, inverted, same size", "**C पर** → C पर: वास्तविक, उल्टा, बराबर आकार"),
    ),
    w.body(
      t(
        "**Between C and F** → beyond C: real, inverted, enlarged",
        "**C और F के बीच** → C से परे: वास्तविक, उल्टा, बड़ा",
      ),
    ),
    w.body(
      t(
        "**At F** → at infinity: real, inverted, highly enlarged",
        "**F पर** → अनंत पर: वास्तविक, उल्टा, बहुत बड़ा",
      ),
    ),
    w.body(
      t(
        "**Between F and P** → behind the mirror: virtual, erect, enlarged",
        "**F और P के बीच** → दर्पण के पीछे: आभासी, सीधा, बड़ा",
      ),
    ),
    w.body(
      t(
        "Read it top to bottom as one story. As the object comes in from infinity, the image goes out from F. They pass each other at C. When the object reaches F, the image has run off to infinity. Closer than F, the image appears behind the mirror, the right way up.",
        "इसे ऊपर से नीचे एक कहानी की तरह पढ़ो। वस्तु जैसे-जैसे अनंत से अंदर आती है, प्रतिबिंब F से बाहर जाता है। C पर दोनों एक-दूसरे को पार करते हैं। वस्तु F पर पहुँचती है तो प्रतिबिंब अनंत तक भाग चुका होता है। F से पास आने पर प्रतिबिंब दर्पण के पीछे, सीधा, दिखता है।",
      ),
    ),
    w.definition(
      t(
        "**Two patterns.** Every **real** image is **inverted**, and the one **virtual** image is **erect**. The image is **enlarged** whenever the object is **closer than C**.",
        "**दो पैटर्न।** हर **वास्तविक** प्रतिबिंब **उल्टा** है, और अकेला **आभासी** प्रतिबिंब **सीधा** है। जब भी वस्तु **C से पास** हो, प्रतिबिंब **बड़ा** होता है।",
      ),
    ),
    space(),
  ]);
});

/** Each use is one of the cases. */
const uses = page(
  "uses",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "A dentist holds a small concave mirror close to a tooth to see it large and the right way up. Where is the tooth?",
        "दंत चिकित्सक एक छोटा अवतल दर्पण दाँत के पास रखता है ताकि उसे बड़ा और सीधा देख सके। दाँत कहाँ है?",
      ),
      options: [
        { id: "right", label: t("Between F and P", "F और P के बीच") },
        {
          id: "cf",
          label: t("Between C and F", "C और F के बीच"),
          feedback: t(
            "That gives an enlarged image, but real and upside down. The only erect image is from inside F.",
            "इससे बड़ा प्रतिबिंब मिलता है, पर वास्तविक और उल्टा। अकेला सीधा प्रतिबिंब F के अंदर से बनता है।",
          ),
        },
        {
          id: "c",
          label: t("At C", "C पर"),
          feedback: t(
            "At C the image is the same size and upside down.",
            "C पर प्रतिबिंब बराबर आकार का और उल्टा होता है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Uses of concave mirrors", "अवतल दर्पण के उपयोग")),
      w.body(
        t(
          "**Torches, searchlights and headlights.** The bulb sits at F, so its light leaves as a strong parallel beam (case 5).",
          "**टॉर्च, सर्चलाइट और हेडलाइट।** बल्ब F पर होता है, इसलिए उसका प्रकाश एक तेज़ समानांतर किरण-पुंज बनकर निकलता है (स्थिति 5)।",
        ),
      ),
      w.body(
        t(
          "**Make-up and shaving mirrors, and dentists' mirrors.** The face or tooth is closer than F, so it is seen large and the right way up (case 6).",
          "**मेकअप और शेविंग दर्पण, और दंत चिकित्सक के दर्पण।** चेहरा या दाँत F से पास होता है, इसलिए वह बड़ा और सीधा दिखता है (स्थिति 6)।",
        ),
      ),
      w.body(
        t(
          "**Solar furnaces.** A large concave mirror brings the Sun's parallel rays together at F, where it gets very hot (case 1).",
          "**सौर भट्टी।** बड़ा अवतल दर्पण सूरज की समानांतर किरणों को F पर इकट्ठा करता है, जहाँ बहुत गर्मी होती है (स्थिति 1)।",
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

/** Back to the projector: which case? Then the catch: the picture comes back at the audience. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const m = b.prop(sphericalMirrorDef, "mirror", {
      ...mirror,
      object: { x: -13, height: 2 },
      rays: [Ray.Parallel, Ray.Focal],
      showImage: true,
      span: 50,
    });
    b.studentOnly(m.action(SphericalMirrorAction.MoveObject));
    b.standsFor(
      m,
      "the phone between C and F of Mom's mirror, and its big upside-down image far in front",
    );
    const which = choiceQuestion(b, {
      name: "which",
      prompt: t(
        "Kabir wants a big, real picture of the phone on the wall. Where should the phone go?",
        "कबीर दीवार पर फ़ोन की बड़ी, वास्तविक तस्वीर चाहता है। फ़ोन कहाँ रखा जाए?",
      ),
      options: [
        { id: "right", label: t("Between C and F", "C और F के बीच") },
        {
          id: "inside",
          label: t("Between F and the mirror", "F और दर्पण के बीच"),
          feedback: t(
            "That image is big, but virtual: it's behind the mirror and no wall can catch it.",
            "वह प्रतिबिंब बड़ा है, पर आभासी: वह दर्पण के पीछे है और कोई दीवार उसे नहीं पकड़ सकती।",
          ),
        },
        {
          id: "beyond",
          label: t("Beyond C", "C से परे"),
          feedback: t(
            "That's where it was: the picture is real but smaller than the phone.",
            "वहीं तो वह था: तस्वीर वास्तविक है पर फ़ोन से छोटी।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const catchIs = w.body(
      t(
        "Case 4. Kabir slides the phone to just outside F, and across the room a big picture appears on the wall. It's **upside down**, so he turns the phone upside down. Then Grandpa walks in front of it. The mirror throws the picture **back** past the phone, right through the room where everyone sits, so someone's head is always in the way. And Mom wants her mirror back. They need something that sends light **through** instead of back.",
        "स्थिति 4। कबीर फ़ोन को F के ठीक बाहर ले जाता है, और कमरे के उस पार दीवार पर बड़ी तस्वीर बन जाती है। वह **उल्टी** है, इसलिए वह फ़ोन को उल्टा कर देता है। तभी दादाजी उसके सामने से गुज़रते हैं। दर्पण तस्वीर को फ़ोन के पास से **वापस** फेंकता है, ठीक उस कमरे से होकर जहाँ सब बैठे हैं, इसलिए किसी न किसी का सिर बीच में आ ही जाता है। और माँ को अपना दर्पण वापस चाहिए। उन्हें कुछ ऐसा चाहिए जो प्रकाश को वापस नहीं, **आर-पार** भेजे।",
      ),
      "catchIs",
      { isHidden: true },
    );
    b.when(which.on(QuestionSignal.Correct), [theBoard.show(catchIs), theBoard.pass()]);
    return column([w.title(t("Back to the projector", "फिर प्रोजेक्टर")), m, which, catchIs, space()]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Example: an object at C, worked from f. */
const example = page("example", (b) => {
  const w = wordsOn(b);
  const m = b.prop(sphericalMirrorDef, "mirror", {
    kind: MirrorKind.Concave,
    focalLength: 15,
    showLabels: true,
    object: { x: -30, height: 3 },
    rays: [Ray.Parallel, Ray.Focal],
    showImage: true,
  });
  b.standsFor(
    m,
    "the example drawn to scale: a 3 cm object at C, 30 cm from a concave mirror of focal length 15 cm, with rays 1 and 2 meeting at C below the axis",
  );
  return column([
    w.title(t("Example", "उदाहरण")),
    w.body(
      t(
        "**A 3 cm tall object is 30 cm in front of a concave mirror of focal length 15 cm. Describe the image.**",
        "**3 सेमी ऊँची वस्तु 15 सेमी फोकस दूरी वाले अवतल दर्पण के सामने 30 सेमी पर है। प्रतिबिंब का वर्णन करो।**",
      ),
    ),
    w.body(
      t(
        r`First find where the object stands. C is at twice the focal length: $$2 \times 15 = 30 \text{ cm}$$ The object is 30 cm away, so it is **at C**: case 3.`,
        r`पहले देखो वस्तु कहाँ है। C, फोकस दूरी के दोगुने पर है: $$2 \times 15 = 30 \text{ सेमी}$$ वस्तु 30 सेमी दूर है, इसलिए वह **C पर** है: स्थिति 3।`,
      ),
    ),
    w.body(
      t(
        "Draw ray 1 from the tip, reflected through F, and ray 2 through F, reflected parallel. They cross at C, below the axis. So the image is **at C, 30 cm in front of the mirror: real, inverted, and the same size, 3 cm tall**.",
        "नोक से किरण 1 बनाओ, जो F से होकर परावर्तित होती है, और किरण 2, जो F से होकर आकर समानांतर परावर्तित होती है। वे C पर, अक्ष के नीचे काटती हैं। इसलिए प्रतिबिंब **C पर, दर्पण से 30 सेमी सामने: वास्तविक, उल्टा, और बराबर आकार का, 3 सेमी ऊँचा** है।",
      ),
    ),
    m,
    space(),
  ]);
});

/** Questions: nature at 18 cm with f = 12; NCERT Ex 7, the range for an erect image. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const nature = choiceQuestion(b, {
      name: "nature",
      prompt: t(
        "An object is 18 cm in front of a concave mirror of focal length 12 cm. The image is…",
        "12 सेमी फोकस दूरी वाले अवतल दर्पण के सामने 18 सेमी पर वस्तु है। प्रतिबिंब है…",
      ),
      options: [
        { id: "right", label: t("real, inverted, enlarged", "वास्तविक, उल्टा, बड़ा") },
        {
          id: "small",
          label: t("real, inverted, diminished", "वास्तविक, उल्टा, छोटा"),
          feedback: t(
            "That's for an object beyond C. Here C is at 24 cm, and 18 cm is between C and F.",
            "यह C से परे वाली वस्तु के लिए है। यहाँ C, 24 सेमी पर है, और 18 सेमी C और F के बीच है।",
          ),
        },
        {
          id: "virtual",
          label: t("virtual, erect, enlarged", "आभासी, सीधा, बड़ा"),
          feedback: t(
            "A virtual image needs the object closer than F, under 12 cm.",
            "आभासी प्रतिबिंब के लिए वस्तु F से पास, 12 सेमी से कम पर, चाहिए।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const range = choiceQuestion(b, {
      name: "range",
      prompt: t(
        "You want an erect image from a concave mirror of focal length 15 cm. How far from the mirror must the object be?",
        "तुम्हें 15 सेमी फोकस दूरी वाले अवतल दर्पण से सीधा प्रतिबिंब चाहिए। वस्तु दर्पण से कितनी दूर होनी चाहिए?",
      ),
      options: [
        { id: "right", label: t("Less than 15 cm", "15 सेमी से कम") },
        {
          id: "between",
          label: t("Between 15 cm and 30 cm", "15 सेमी और 30 सेमी के बीच"),
          feedback: t(
            "That's between F and C: the image is enlarged but real and inverted.",
            "यह F और C के बीच है: प्रतिबिंब बड़ा है पर वास्तविक और उल्टा।",
          ),
        },
        {
          id: "beyond",
          label: t("More than 30 cm", "30 सेमी से ज़्यादा"),
          feedback: t(
            "Beyond C the image is real, inverted and smaller.",
            "C से परे प्रतिबिंब वास्तविक, उल्टा और छोटा होता है।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
    });
    const after = w.body(
      t(
        "Inside F the image is **virtual, erect and larger** than the object, as in case 6.",
        "F के अंदर प्रतिबिंब **आभासी, सीधा और वस्तु से बड़ा** होता है, जैसे स्थिति 6 में।",
      ),
      "after",
      { isHidden: true },
    );
    b.when(nature.on(QuestionSignal.Correct), theBoard.show(range));
    const log = w.definition(
      t(
        "**Mission log.** ✓ A concave mirror can project: with the phone between C and F, the wall gets a big, real picture, as long as the phone goes in upside down. ✗ But the mirror throws the picture **back** towards the phone and the people, so somebody's head is always in the way. And Mom wants her mirror back.",
        "**मिशन लॉग।** ✓ अवतल दर्पण प्रोजेक्ट कर सकता है: फ़ोन C और F के बीच हो, तो दीवार पर बड़ी, वास्तविक तस्वीर बनती है, बशर्ते फ़ोन उल्टा रखा जाए। ✗ पर दर्पण तस्वीर को फ़ोन और लोगों की ओर **वापस** फेंकता है, इसलिए किसी न किसी का सिर बीच में आ ही जाता है। और माँ को अपना दर्पण वापस चाहिए।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(range.on(QuestionSignal.Correct), [theBoard.show(after), theBoard.show(log)]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), nature, range, after, log, space()]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [
  hook,
  describe,
  card,
  candle,
  atInfinity,
  beyondC,
  atC,
  betweenCF,
  atF,
  insideF,
  table,
  uses,
  inLife,
  example,
  yourTurn,
];

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

const r = String.raw;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** Stop 2, continued: hunting for the sharp picture by sliding a card. Can we know in advance? */
const hunt = page("hunt", (b) => {
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
    w.title(t("Stop guessing", "अंदाज़ा लगाना बंद")),
    w.body(
      t(
        "**Stop 2, continued.** A concave mirror can put a real picture on a screen. Mom hands her make-up mirror back, on one condition: **no more burning things.**",
        "**पड़ाव 2, आगे।** अवतल दर्पण पर्दे पर वास्तविक तस्वीर डाल सकता है। माँ अपना मेकअप दर्पण लौटा देती हैं, एक शर्त पर: **अब कुछ नहीं जलाना।**",
      ),
    ),
    room,
    w.body(
      t(
        'Kabir props the phone in front of it and slides a white card back and forth, hunting for the sharp picture. Forward, back, forward. Riya has had enough. "There has to be a way to know where the picture lands **before** we try."',
        'कबीर फ़ोन को उसके सामने टिकाता है और एक सफ़ेद कार्ड आगे-पीछे खिसकाता है, साफ़ तस्वीर ढूँढते हुए। आगे, पीछे, आगे। रिया ऊब चुकी है। "कोई तरीक़ा होना चाहिए कि आज़माने से **पहले** पता चल जाए तस्वीर कहाँ बनेगी।"',
      ),
    ),
    w.body(
      t("There is: draw the rays. This lesson shows how.", "है: किरणें बनाओ। यह पाठ दिखाता है कैसे।"),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Why two rays are enough, and why we pick these four. */
const two = page("two", (b) => {
  const w = wordsOn(b);
  return column([
    w.title(t("Two rays are enough", "दो किरणें काफ़ी हैं")),
    w.body(
      t(
        "Every point of an object sends out rays in all directions. To find the image of one point, say the tip of an arrow, we don't need all of them. **Two rays are enough.** Where they meet after reflecting, or seem to come from, is the image of the tip.",
        "किसी वस्तु का हर बिंदु हर दिशा में किरणें भेजता है। किसी एक बिंदु का, जैसे तीर की नोक का, प्रतिबिंब ढूँढने के लिए हमें सब नहीं चाहिए। **दो किरणें काफ़ी हैं।** परावर्तन के बाद वे जहाँ मिलती हैं, या जहाँ से आती हुई लगती हैं, वहीं नोक का प्रतिबिंब है।",
      ),
    ),
    w.body(
      t(
        "Any ray obeys the law of reflection, but working out its angles takes ages. So we use four special rays whose path after reflection we know straight away. Each one is still just the law of reflection at the point where it hits. The next pages show why.",
        "हर किरण परावर्तन के नियम को मानती है, पर उसके कोण निकालने में बहुत समय लगता है। इसलिए हम चार ख़ास किरणें लेते हैं जिनका परावर्तन के बाद का रास्ता हमें तुरंत पता है। हर एक फिर भी उसी बिंदु पर परावर्तन का नियम ही है जहाँ वह पड़ती है। अगले पन्ने दिखाते हैं क्यों।",
      ),
    ),
    w.note(
      t(
        "Remember two facts from the last lesson: rays parallel to the axis meet at F (or seem to come from F), and the line from C to any point of the mirror is the normal there.",
        "पिछले पाठ की दो बातें याद रखो: अक्ष के समानांतर किरणें F पर मिलती हैं (या F से आती हुई लगती हैं), और C से दर्पण के किसी भी बिंदु तक की रेखा वहाँ अभिलंब है।",
      ),
    ),
    space(),
  ]);
});

/** One page per standard ray: the ray alone on both mirrors, its rule, its reason, a check. */
function rayPage(spec: {
  name: string;
  ray: Ray;
  title: ReturnType<typeof t>;
  rule: ReturnType<typeof t>;
  reason: ReturnType<typeof t>;
  check: Parameters<typeof choiceQuestion>[1];
  object?: { x: number; height: number };
}) {
  return page(
    spec.name,
    (b) => {
      const w = wordsOn(b);
      const object = spec.object ?? { x: -30, height: 5 };
      const m = b.prop(sphericalMirrorDef, "mirror", {
        kind: MirrorKind.Concave,
        focalLength: 10,
        object,
        rays: [spec.ray],
        showImage: false,
        showLabels: true,
        canSetKind: true,
      });
      b.studentOnly(m.action(SphericalMirrorAction.MoveObject));
      b.studentOnly(m.action(SphericalMirrorAction.SetKind));
      b.standsFor(
        m,
        `one standard ray (${spec.ray}) from the object's tip, on a mirror the learner can switch between concave and convex`,
      );
      const ask = choiceQuestion(b, spec.check);
      return column([
        w.title(spec.title),
        w.definition(spec.rule),
        m,
        w.body(spec.reason),
        ask,
        space(),
      ]);
    },
    { passOn: PassOn.Rules },
  );
}

const parallel = rayPage({
  name: "parallel",
  ray: Ray.Parallel,
  title: t("Ray 1: parallel to the axis", "किरण 1: अक्ष के समानांतर"),
  rule: t(
    "**A ray parallel to the principal axis**, after reflection, **passes through F** (concave mirror), or **seems to come from F** behind the mirror (convex mirror).",
    "**मुख्य अक्ष के समानांतर किरण** परावर्तन के बाद **F से होकर जाती** है (अवतल दर्पण), या दर्पण के पीछे **F से आती हुई लगती** है (उत्तल दर्पण)।",
  ),
  reason: t(
    "**Why:** this is what F means. F is the point where rays parallel to the axis meet, or seem to come from. Switch the mirror to convex and see the dashed line go back to F.",
    "**क्यों:** F का अर्थ ही यही है। F वह बिंदु है जहाँ अक्ष के समानांतर किरणें मिलती हैं, या जहाँ से आती हुई लगती हैं। दर्पण को उत्तल करो और देखो कि बिंदुदार रेखा पीछे F तक जाती है।",
  ),
  check: {
    name: "ask",
    prompt: t(
      "A ray parallel to the principal axis hits a convex mirror. After reflection it…",
      "मुख्य अक्ष के समानांतर एक किरण उत्तल दर्पण पर पड़ती है। परावर्तन के बाद वह…",
    ),
    options: [
      {
        id: "right",
        label: t("seems to come from F behind the mirror", "दर्पण के पीछे F से आती हुई लगती है"),
      },
      {
        id: "through",
        label: t("passes through F in front of the mirror", "दर्पण के सामने F से गुज़रती है"),
        feedback: t(
          "That's the concave mirror. A convex mirror spreads rays apart, and its F is behind it.",
          "यह अवतल दर्पण है। उत्तल दर्पण किरणों को फैलाता है, और उसका F उसके पीछे है।",
        ),
      },
      {
        id: "back",
        label: t("goes straight back along its own path", "अपने ही रास्ते सीधी लौट जाती है"),
        feedback: t(
          "Only a ray along the normal goes straight back. This ray is parallel to the axis but not on it.",
          "केवल अभिलंब के साथ आई किरण सीधी लौटती है। यह किरण अक्ष के समानांतर है, उस पर नहीं।",
        ),
      },
    ],
    answer: "right",
  },
});

const focal = rayPage({
  name: "focal",
  ray: Ray.Focal,
  title: t("Ray 2: through F", "किरण 2: F से होकर"),
  rule: t(
    "**A ray passing through F** (concave mirror), or **heading towards F** behind the mirror (convex mirror), after reflection **comes out parallel** to the principal axis.",
    "**F से होकर आती किरण** (अवतल दर्पण), या दर्पण के पीछे **F की ओर जाती किरण** (उत्तल दर्पण), परावर्तन के बाद मुख्य अक्ष के **समानांतर निकलती** है।",
  ),
  reason: t(
    "**Why:** it's ray 1 run backwards. If light goes along a path one way, it can go back along the same path the other way, because the angles at the mirror are still equal. Ray 1 comes in parallel and leaves through F, so a ray coming in through F leaves parallel.",
    "**क्यों:** यह किरण 1 उल्टी चलती है। प्रकाश यदि किसी रास्ते पर एक ओर जा सकता है, तो उसी रास्ते पर उल्टा भी लौट सकता है, क्योंकि दर्पण पर कोण फिर भी बराबर रहते हैं। किरण 1 समानांतर आती है और F से होकर निकलती है, इसलिए F से होकर आती किरण समानांतर निकलती है।",
  ),
  check: {
    name: "ask",
    prompt: t(
      "A torch bulb sits at the focus F of a concave mirror. How does its light leave the mirror?",
      "टॉर्च का बल्ब अवतल दर्पण के फोकस F पर है। उसका प्रकाश दर्पण से कैसे निकलता है?",
    ),
    options: [
      { id: "right", label: t("As a parallel beam", "समानांतर किरण-पुंज के रूप में") },
      {
        id: "point",
        label: t("Brought together at one point", "एक बिंदु पर इकट्ठा होकर"),
        feedback: t(
          "Rays from F are ray 2: each leaves parallel to the axis.",
          "F से आती किरणें किरण 2 हैं: हर एक अक्ष के समानांतर निकलती है।",
        ),
      },
      {
        id: "spread",
        label: t("Spreading out", "फैलती हुई"),
        feedback: t(
          "Rays from F are ray 2: each leaves parallel to the axis, so the beam doesn't spread.",
          "F से आती किरणें किरण 2 हैं: हर एक अक्ष के समानांतर निकलती है, इसलिए किरण-पुंज नहीं फैलता।",
        ),
      },
    ],
    answer: "right",
  },
});

const centre = rayPage({
  name: "centre",
  ray: Ray.Centre,
  title: t("Ray 3: through C", "किरण 3: C से होकर"),
  rule: t(
    "**A ray passing through C** (concave mirror), or **heading towards C** behind the mirror (convex mirror), after reflection **comes straight back along the same path**.",
    "**C से होकर आती किरण** (अवतल दर्पण), या दर्पण के पीछे **C की ओर जाती किरण** (उत्तल दर्पण), परावर्तन के बाद **उसी रास्ते सीधी वापस** आती है।",
  ),
  reason: t(
    r`**Why:** a radius meets a sphere at right angles, so the line from $C$ to any point of the mirror is the normal there. This ray travels along that line, so it meets the mirror **along the normal**. Its angle of incidence is 0, so its angle of reflection is 0 too, and it goes straight back.`,
    r`**क्यों:** त्रिज्या गोले से समकोण पर मिलती है, इसलिए $C$ से दर्पण के किसी भी बिंदु तक की रेखा वहाँ अभिलंब है। यह किरण उसी रेखा पर चलती है, इसलिए दर्पण से **अभिलंब के साथ** मिलती है। इसका आपतन कोण 0 है, तो परावर्तन कोण भी 0, और यह सीधी लौट जाती है।`,
  ),
  check: {
    name: "ask",
    prompt: t(
      "Why does a ray through C come straight back?",
      "C से होकर आती किरण सीधी वापस क्यों आती है?",
    ),
    options: [
      {
        id: "right",
        label: t("It meets the mirror along the normal", "वह अभिलंब के साथ दर्पण से मिलती है"),
      },
      {
        id: "focus",
        label: t("It passes through F, like every ray", "वह हर किरण की तरह F से गुज़रती है"),
        feedback: t(
          "This ray goes through C, not F. What is special about a line from C to the mirror?",
          "यह किरण C से होकर जाती है, F से नहीं। C से दर्पण तक की रेखा में क्या ख़ास है?",
        ),
      },
      {
        id: "pole",
        label: t("It hits the pole, where i is zero", "वह ध्रुव पर पड़ती है, जहाँ i शून्य है"),
        feedback: t(
          "Drag the object: this ray hits the mirror above or below P, and still comes straight back.",
          "वस्तु को खिसकाओ: यह किरण P के ऊपर या नीचे पड़ती है, फिर भी सीधी लौटती है।",
        ),
      },
    ],
    answer: "right",
  },
});

const pole = rayPage({
  name: "pole",
  ray: Ray.Pole,
  title: t("Ray 4: to the pole", "किरण 4: ध्रुव पर"),
  rule: t(
    "**A ray hitting the mirror at P**, slanting to the axis, **reflects at the same angle on the other side of the axis**.",
    "**P पर दर्पण से मिलती किरण**, जो अक्ष से तिरछी हो, **अक्ष के दूसरी ओर उतने ही कोण पर परावर्तित** होती है।",
  ),
  reason: t(
    "**Why:** the principal axis is the normal at P. So the angles this ray makes with the axis are exactly its angles of incidence and reflection, and they are equal.",
    "**क्यों:** मुख्य अक्ष P पर अभिलंब है। इसलिए यह किरण अक्ष से जो कोण बनाती है, वही उसके आपतन और परावर्तन कोण हैं, और वे बराबर हैं।",
  ),
  check: {
    name: "ask",
    prompt: t(
      "A ray hits a concave mirror at P, making 20° with the principal axis. What angle does the reflected ray make with the axis?",
      "एक किरण अवतल दर्पण पर P पर पड़ती है और मुख्य अक्ष से 20° बनाती है। परावर्तित किरण अक्ष से कितना कोण बनाती है?",
    ),
    options: [
      { id: "right", label: t("20°, on the other side", "20°, दूसरी ओर") },
      {
        id: "seventy",
        label: t("70°, on the other side", "70°, दूसरी ओर"),
        feedback: t(
          "At P the axis itself is the normal, so 20° is already the angle of incidence.",
          "P पर अक्ष ख़ुद अभिलंब है, इसलिए 20° पहले से ही आपतन कोण है।",
        ),
      },
      {
        id: "forty",
        label: t("40°, on the same side", "40°, उसी ओर"),
        feedback: t(
          "40° is the angle between the two rays. Each makes 20° with the axis.",
          "40° दोनों किरणों के बीच का कोण है। हर एक अक्ष से 20° बनाती है।",
        ),
      },
    ],
    answer: "right",
  },
});

/** All four together: they meet at one point however the object moves. */
const together = page(
  "together",
  (b) => {
    const w = wordsOn(b);
    const m = b.prop(sphericalMirrorDef, "mirror", {
      kind: MirrorKind.Concave,
      focalLength: 10,
      object: { x: -30, height: 5 },
      rays: [Ray.Parallel, Ray.Centre],
      showImage: true,
      showLabels: true,
      canSetKind: true,
      canPickRays: true,
    });
    b.studentOnly(m.action(SphericalMirrorAction.MoveObject));
    b.studentOnly(m.action(SphericalMirrorAction.SetKind));
    b.studentOnly(m.action(SphericalMirrorAction.ToggleRay));
    b.standsFor(
      m,
      "rays 1 and 3 from the object's tip meeting at the image tip, with buttons to add rays 2 and 4",
    );
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "Turn on rays 2 and 4 with the buttons, then drag the object and switch the mirror. Do all the rays agree on where the image is?",
        "बटनों से किरण 2 और 4 भी चालू करो, फिर वस्तु को खिसकाओ और दर्पण बदलो। क्या सारी किरणें प्रतिबिंब की जगह पर सहमत रहती हैं?",
      ),
      options: [
        {
          id: "right",
          label: t("Yes, they always meet at one point", "हाँ, वे हमेशा एक बिंदु पर मिलती हैं"),
        },
        {
          id: "no",
          label: t("No, they meet at different points", "नहीं, वे अलग-अलग बिंदुओं पर मिलती हैं"),
          feedback: t(
            "Look closely at the tip of the image arrow: every ray, or its dashed line, passes through it.",
            "प्रतिबिंब वाले तीर की नोक ध्यान से देखो: हर किरण, या उसकी बिंदुदार रेखा, उससे होकर जाती है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    b.when(ask.on(QuestionSignal.Correct), theBoard.pass());
    return column([
      w.title(t("All four together", "चारों एक साथ")),
      w.body(
        t(
          "Here are rays 1 and 3 from the arrow's tip. They meet at one point: the tip of the image. Add rays 2 and 4 with the buttons: they go through the same point. With a convex mirror the rays spread apart, and their dashed lines meet behind the mirror. In an exam, draw **any two**. Rays 1 and 3 can always be drawn. Ray 2 can't be drawn when the object is exactly at F, because the line from the tip through F never reaches the mirror.",
          "यहाँ तीर की नोक से किरण 1 और 3 हैं। वे एक बिंदु पर मिलती हैं: प्रतिबिंब की नोक। बटनों से किरण 2 और 4 जोड़ो: वे भी उसी बिंदु से होकर जाती हैं। उत्तल दर्पण के साथ किरणें फैल जाती हैं, और उनकी बिंदुदार रेखाएँ दर्पण के पीछे मिलती हैं। परीक्षा में **कोई भी दो** बनाओ। किरण 1 और 3 हमेशा बनाई जा सकती हैं। जब वस्तु ठीक F पर हो, तो किरण 2 नहीं बनती, क्योंकि नोक से F होकर जाती रेखा दर्पण तक पहुँचती ही नहीं।",
        ),
      ),
      m,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** NCERT Activity 10.4: the student picks two rays and marks where the image is. */
const draw = page(
  "draw",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "Draw it yourself (NCERT Activity 10.4): the image is hidden; the learner switches on two rays, sees where they cross, and drags the ? there. Object 25 cm in front of a concave mirror of focal length 10 cm: the image is 16.7 cm in front, inverted, 3.3 cm tall.",
    );
    const m = b.prop(sphericalMirrorDef, "mirror", {
      kind: MirrorKind.Concave,
      focalLength: 10,
      object: { x: -25, height: 5 },
      rays: [],
      showImage: false,
      showLabels: true,
      canPickRays: true,
      markImage: true,
    });
    b.studentOnly(m.action(SphericalMirrorAction.ToggleRay));
    b.studentOnly(m.action(SphericalMirrorAction.MoveMark));
    b.standsFor(
      m,
      "a concave mirror with the object 25 cm in front, no rays drawn yet, ray buttons 1–4, and a ? marker to drag to where the image's tip is",
    );
    const goal = goalQuestion(b, {
      about: m,
      prompt: t(
        "Switch on any two rays. Where they cross is the tip of the image: drag the ? there.",
        "कोई भी दो किरणें चालू करो। जहाँ वे काटती हैं, वहीं प्रतिबिंब की नोक है: ? को वहाँ खिसकाओ।",
      ),
      isMet: m.derived(SphericalMirrorDerived.MarkOnImage),
      solve: [
        m.learner(SphericalMirrorAction.ToggleRay, { ray: Ray.Parallel }),
        m.learner(SphericalMirrorAction.ToggleRay, { ray: Ray.Centre }),
        m.learner(SphericalMirrorAction.MoveMark, { x: -16.7, y: -3.3 }),
      ],
    });
    const done = w.body(
      t(
        "The rays cross 16.7 cm in front of the mirror, below the axis: the image is **real** and **inverted**, and smaller than the object.",
        "किरणें दर्पण से 16.7 सेमी सामने, अक्ष के नीचे काटती हैं: प्रतिबिंब **वास्तविक** और **उल्टा** है, और वस्तु से छोटा।",
      ),
      "done",
      { isHidden: true },
    );
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(done));
    return column([
      w.title(t("Draw it yourself", "ख़ुद बनाओ")),
      w.body(
        t(
          "This time nothing is drawn for you. An object stands 25 cm in front of a concave mirror of focal length 10 cm. Pick two rays, find where they cross, and mark the image.",
          "इस बार तुम्हारे लिए कुछ नहीं बना है। 10 सेमी फोकस दूरी वाले अवतल दर्पण के सामने 25 सेमी पर एक वस्तु है। दो किरणें चुनो, देखो वे कहाँ काटती हैं, और प्रतिबिंब पर निशान लगाओ।",
        ),
      ),
      m,
      goal,
      done,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** Riya's graph paper: the drawing tells Kabir where to hold the card. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const m = b.prop(sphericalMirrorDef, "mirror", {
      kind: MirrorKind.Concave,
      focalLength: 10,
      object: { x: -25, height: 5 },
      rays: [Ray.Parallel, Ray.Centre],
      showImage: true,
      showLabels: true,
      screen: -16.7,
    });
    b.standsFor(
      m,
      "Riya's drawing: the phone 25 cm from Mom's mirror (f = 10 cm), rays 1 and 3 meeting 16.7 cm in front, and the card placed exactly there",
    );
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "Riya draws it on graph paper: the phone 25 cm from Mom's mirror, focal length 10 cm. Kabir holds the card exactly where her rays cross. What does he see?",
        "रिया इसे ग्राफ़ पेपर पर बनाती है: फ़ोन माँ के दर्पण से 25 सेमी पर, फोकस दूरी 10 सेमी। कबीर कार्ड ठीक वहाँ रखता है जहाँ उसकी किरणें काटती हैं। उसे क्या दिखता है?",
      ),
      options: [
        {
          id: "right",
          label: t("A sharp, small, upside-down picture", "एक साफ़, छोटी, उल्टी तस्वीर"),
        },
        {
          id: "blur",
          label: t("Still a blur", "अब भी धुँधली"),
          feedback: t(
            "Where the rays really cross, all the light from the tip lands on one spot. That's a sharp picture.",
            "जहाँ किरणें सचमुच काटती हैं, वहाँ नोक का सारा प्रकाश एक जगह पड़ता है। यही साफ़ तस्वीर है।",
          ),
        },
        {
          id: "upright",
          label: t("A sharp picture the right way up", "एक साफ़ और सीधी तस्वीर"),
          feedback: t(
            "The rays cross below the axis, so the picture is upside down.",
            "किरणें अक्ष के नीचे काटती हैं, इसलिए तस्वीर उल्टी है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const after = w.body(
      t(
        "First try, no sliding. But the picture is small, and the projector needs it big. Riya's next question: where should the phone go to make the picture **bigger**?",
        "पहली बार में, बिना खिसकाए। पर तस्वीर छोटी है, और प्रोजेक्टर को बड़ी चाहिए। रिया का अगला सवाल: तस्वीर को **बड़ा** करने के लिए फ़ोन कहाँ रखा जाए?",
      ),
      "after",
      { isHidden: true },
    );
    b.when(ask.on(QuestionSignal.Correct), [theBoard.show(after), theBoard.pass()]);
    return column([w.title(t("Riya's graph paper", "रिया का ग्राफ़ पेपर")), m, ask, after, space()]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Worked: which two rays, and what they give, for a convex mirror. */
const example = page("example", (b) => {
  const w = wordsOn(b);
  const m = b.prop(sphericalMirrorDef, "mirror", {
    kind: MirrorKind.Convex,
    focalLength: 10,
    object: { x: -20, height: 5 },
    rays: [Ray.Parallel, Ray.Centre],
    showImage: true,
    showLabels: true,
  });
  b.standsFor(
    m,
    "a convex mirror (f = 10 cm) with an object 20 cm in front: ray 1 reflects as if from F behind, ray 3 heads towards C and comes straight back; their dashed lines meet behind the mirror at a small upright image",
  );
  return column([
    w.title(t("Example", "उदाहरण")),
    w.body(
      t(
        "**An object stands 20 cm in front of a convex mirror of focal length 10 cm. Find its image with two rays.**",
        "**10 सेमी फोकस दूरी वाले उत्तल दर्पण के सामने 20 सेमी पर एक वस्तु है। दो किरणों से उसका प्रतिबिंब ढूँढो।**",
      ),
    ),
    m,
    w.body(
      t(
        "**Ray 1:** from the tip, parallel to the axis. After reflection it spreads out as if it came from F, 10 cm behind the mirror. Draw that line dashed behind the mirror.",
        "**किरण 1:** नोक से, अक्ष के समानांतर। परावर्तन के बाद यह ऐसे फैलती है जैसे दर्पण के 10 सेमी पीछे F से आई हो। दर्पण के पीछे वह रेखा बिंदुदार बनाओ।",
      ),
    ),
    w.body(
      t(
        "**Ray 3:** from the tip, heading towards C, 20 cm behind the mirror. It meets the mirror along the normal and comes straight back. Its dashed line runs on to C.",
        "**किरण 3:** नोक से, दर्पण के 20 सेमी पीछे C की ओर। यह दर्पण से अभिलंब के साथ मिलती है और सीधी लौट आती है। इसकी बिंदुदार रेखा C तक जाती है।",
      ),
    ),
    w.body(
      t(
        "The two dashed lines meet behind the mirror, above the axis. So the image is **behind the mirror, virtual, erect and smaller** than the object.",
        "दोनों बिंदुदार रेखाएँ दर्पण के पीछे, अक्ष के ऊपर मिलती हैं। इसलिए प्रतिबिंब **दर्पण के पीछे, आभासी, सीधा और वस्तु से छोटा** है।",
      ),
    ),
    space(),
  ]);
});

/** Your turn: a ray heading for F behind a convex mirror; then the mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const fig = b.prop(sphericalMirrorDef, "mirror", {
      kind: MirrorKind.Convex,
      focalLength: 10,
      object: { x: -25, height: 5 },
      rays: [Ray.Focal],
      showImage: false,
      showLabels: true,
    });
    b.standsFor(
      fig,
      "a convex mirror with one ray from the object's tip heading towards F behind the mirror",
    );
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "A ray heads towards F behind a convex mirror. After reflection it…",
        "एक किरण उत्तल दर्पण के पीछे F की ओर जाती है। परावर्तन के बाद वह…",
      ),
      options: [
        { id: "right", label: t("comes out parallel to the axis", "अक्ष के समानांतर निकलती है") },
        {
          id: "back",
          label: t("comes straight back along its own path", "अपने ही रास्ते सीधी लौटती है"),
          feedback: t(
            "Only a ray heading for C comes straight back. This one is ray 2.",
            "केवल C की ओर जाती किरण सीधी लौटती है। यह किरण 2 है।",
          ),
        },
        {
          id: "f",
          label: t("passes through F", "F से होकर जाती है"),
          feedback: t(
            "F is behind a convex mirror: no light gets there. This is ray 2: it leaves parallel.",
            "उत्तल दर्पण का F पीछे है: वहाँ कोई प्रकाश नहीं पहुँचता। यह किरण 2 है: यह समानांतर निकलती है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ Two rays from the tip of the phone are enough to find where its picture lands, with no card-sliding at all. ? Next: where should the **phone** go to get a picture that's big?",
        "**मिशन लॉग।** ✓ फ़ोन की नोक से दो किरणें यह ढूँढने के लिए काफ़ी हैं कि उसकी तस्वीर कहाँ बनती है, कार्ड खिसकाए बिना। ? आगे: बड़ी तस्वीर के लिए **फ़ोन** कहाँ रखा जाए?",
      ),
      "log",
      { isHidden: true },
    );
    b.when(ask.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), fig, ask, log, space()]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [
  hunt,
  two,
  parallel,
  focal,
  centre,
  pole,
  together,
  draw,
  inLife,
  example,
  yourTurn,
];

import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  MirrorKind,
  Ray,
  SceneAction,
  SceneDerived,
  SceneKind,
  SceneSignal,
  SphericalMirrorAction,
  lightSceneDef,
  sphericalMirrorDef,
} from "@chalk/prop-light";

const r = String.raw;
const still = { isLit: true, canToggle: false } as const;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** Stop 2 begins: Mom's make-up mirror throws a small, upside-down window onto a tissue box in front of it. */
const wall = page(
  "wall",
  (b) => {
    const w = wordsOn(b);
    const room = b.prop(lightSceneDef, "room", { scene: SceneKind.MakeupMirror, ...still });
    b.standsFor(
      room,
      "morning sun through a window, Mom's round make-up mirror on her dressing table facing it, and a small, upside-down picture of the window and the tree outside glowing on a white tissue box standing just in front of the mirror",
    );
    const what = choiceQuestion(b, {
      name: "what",
      prompt: t(
        "A flat mirror could never put a picture on a box or a wall. What's different about Mom's mirror?",
        "सपाट दर्पण कभी डिब्बे या दीवार पर तस्वीर नहीं डाल सकता था। माँ के दर्पण में क्या अलग है?",
      ),
      options: [
        { id: "right", label: t("It's curved", "वह मुड़ा हुआ है") },
        {
          id: "bigger",
          label: t("It's bigger", "वह बड़ा है"),
          feedback: t(
            "A bigger flat mirror still makes a virtual image. Look at its shape.",
            "बड़ा सपाट दर्पण भी आभासी प्रतिबिंब ही बनाता है। उसका आकार देखो।",
          ),
        },
        {
          id: "sun",
          label: t("Sunlight is brighter than a torch", "धूप टॉर्च से तेज़ है"),
          feedback: t(
            "Bright light in a flat mirror still only gives a picture behind the glass. Look at the mirror's shape.",
            "सपाट दर्पण में तेज़ रोशनी भी केवल काँच के पीछे तस्वीर देती है। दर्पण का आकार देखो।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("A picture on a tissue box", "टिशू के डिब्बे पर तस्वीर")),
      w.body(
        t(
          "**Stop 2: curved mirrors.** The flat mirror let the team down: its image is virtual, so it can never land on a wall. The projector needs a picture that is **real**.",
          "**पड़ाव 2: मुड़े हुए दर्पण।** सपाट दर्पण से काम नहीं बना: उसका प्रतिबिंब आभासी है, इसलिए वह कभी दीवार पर नहीं उतर सकता। प्रोजेक्टर को ऐसी तस्वीर चाहिए जो **वास्तविक** हो।",
        ),
      ),
      w.body(
        t(
          "Monday morning, Kabir yells from Mom's room. On the white tissue box standing just in front of Mom's round make-up mirror, there's a small **picture of the window**: glowing, sharp, and **upside down**. Even the tree outside is upside down. The light comes in through the window, hits the mirror on her dressing table, and lands back on the box.",
          "सोमवार सुबह, कबीर माँ के कमरे से चिल्लाता है। माँ के गोल मेकअप दर्पण के ठीक सामने रखे सफ़ेद टिशू के डिब्बे पर **खिड़की की** एक छोटी **तस्वीर** है: चमकती, साफ़, और **उल्टी**। बाहर का पेड़ भी उल्टा है। प्रकाश खिड़की से आता है, ड्रेसिंग टेबल पर रखे दर्पण से टकराता है, और लौटकर डिब्बे पर पड़ता है।",
        ),
      ),
      room,
      what,
      w.body(
        t(
          "A mirror that puts a real picture on a screen is exactly what the projector needs. To use it, we first need to understand curved mirrors.",
          "पर्दे पर वास्तविक तस्वीर डालने वाला दर्पण ठीक वही है जो प्रोजेक्टर को चाहिए। इसे काम में लेने के लिए पहले मुड़े हुए दर्पणों को समझना होगा।",
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Spherical, concave, convex: a mirror cut from a ball, stepped through. */
const sphere = page(
  "sphere",
  (b) => {
    const w = wordsOn(b);
    const ball = b.prop(lightSceneDef, "ball", {
      scene: SceneKind.MirrorFromSphere,
      ...still,
      step: 0,
      canStep: true,
    });
    b.studentOnly(ball.action(SceneAction.Next));
    b.standsFor(
      ball,
      "a shiny steel ball; tapping next slices a small cap off it, then shows the cap alone: shiny inside (concave) and shiny outside (convex)",
    );
    b.witness(ball.learner(SceneAction.Next), ball.learner(SceneAction.Next));
    const kinds = w.definition(
      t(
        "**Spherical mirror.** A mirror whose reflecting surface is a small piece cut from the surface of a sphere is a **spherical mirror**. If the reflecting surface is curved **inwards**, like the inside of a bowl, the mirror is **concave**. If it is curved **outwards**, like the back of a bowl, the mirror is **convex**.",
        "**गोलीय दर्पण।** जिस दर्पण की परावर्तक सतह किसी गोले की सतह से काटा गया एक छोटा टुकड़ा हो, वह **गोलीय दर्पण** है। यदि परावर्तक सतह **अंदर** की ओर मुड़ी हो, कटोरे के अंदर जैसी, तो दर्पण **अवतल** है। यदि वह **बाहर** की ओर मुड़ी हो, कटोरे की पीठ जैसी, तो दर्पण **उत्तल** है।",
      ),
      "kinds",
      { isHidden: true },
    );
    const which = choiceQuestion(b, {
      name: "which",
      prompt: t(
        "A mirror is shiny on its bulging side. What kind is it?",
        "एक दर्पण अपनी उभरी हुई तरफ़ चमकदार है। वह किस तरह का है?",
      ),
      options: [
        { id: "right", label: t("Convex", "उत्तल") },
        {
          id: "concave",
          label: t("Concave", "अवतल"),
          feedback: t(
            "Concave is shiny on the hollow side, curved inwards. A bulge curves outwards.",
            "अवतल खोखली तरफ़ चमकदार होता है, जो अंदर की ओर मुड़ी है। उभार बाहर की ओर मुड़ा होता है।",
          ),
        },
        {
          id: "plane",
          label: t("Plane", "समतल"),
          feedback: t(
            "A plane mirror is flat, with no bulge.",
            "समतल दर्पण सपाट होता है, बिना उभार के।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
    });
    b.when(
      ball.on(SceneSignal.Stepped),
      [theBoard.show(kinds), theBoard.show(which)],
      ball.derived(SceneDerived.Step).eq(2),
    );
    return column([
      w.title(t("Mirrors cut from a ball", "गेंद से कटे दर्पण")),
      w.definition(
        t(
          "**Sphere.** A **sphere** is a perfectly round ball, like a cricket ball or a steel ball bearing. Every point on its surface is the same distance from its centre.",
          "**गोला।** **गोला** एक पूरी तरह गोल गेंद है, जैसे क्रिकेट की गेंद या स्टील की गोली। उसकी सतह का हर बिंदु उसके केंद्र से बराबर दूरी पर है।",
        ),
      ),
      w.body(
        t(
          "Imagine a polished steel ball: its whole surface is a mirror. Now slice a small cap off it. **Tap next** to see what that cap is.",
          "चमकाई हुई स्टील की गेंद की कल्पना करो: उसकी पूरी सतह एक दर्पण है। अब उससे एक छोटी टोपी जैसा टुकड़ा काटो। वह टुकड़ा क्या है, देखने के लिए **आगे दबाओ**।",
        ),
      ),
      ball,
      kinds,
      which,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Both kinds in the kitchen drawer: a spoon. Plus the drawing conventions. */
const spoonPage = page(
  "spoon",
  (b) => {
    const w = wordsOn(b);
    const spoon = b.prop(lightSceneDef, "spoon", { scene: SceneKind.Spoon, ...still });
    b.standsFor(
      spoon,
      "two shiny spoons: in the hollow side a small upside-down face, on the back a small upright face",
    );
    const back = choiceQuestion(b, {
      name: "back",
      prompt: t(
        "The back of a shiny spoon bulges out towards you. What kind of mirror is it?",
        "चमकदार चम्मच की पीठ तुम्हारी ओर उभरी होती है। यह किस तरह का दर्पण है?",
      ),
      options: [
        { id: "right", label: t("Convex", "उत्तल") },
        {
          id: "concave",
          label: t("Concave", "अवतल"),
          feedback: t(
            "Concave is the hollow side, curved inwards. The back curves outwards.",
            "अवतल खोखला हिस्सा है, जो अंदर की ओर मुड़ा है। पीठ बाहर की ओर मुड़ी है।",
          ),
        },
        {
          id: "plane",
          label: t("Plane", "समतल"),
          feedback: t(
            "A plane mirror is flat. The spoon is curved.",
            "समतल दर्पण सपाट होता है। चम्मच मुड़ी हुई है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Both kinds in one spoon", "एक चम्मच में दोनों तरह")),
      w.body(
        t(
          "A shiny steel spoon is a rough spherical mirror on both sides. Look at your face in the **hollow**: it's upside down. Turn the spoon over: on the **back** you're small and the right way up. Same spoon, two mirrors. The only difference is which way the surface curves.",
          "चमकदार स्टील की चम्मच दोनों तरफ़ लगभग एक गोलीय दर्पण है। **खोखले** हिस्से में अपना चेहरा देखो: वह उल्टा है। चम्मच पलटो: **पीठ** पर तुम छोटे और सीधे दिखते हो। एक ही चम्मच, दो दर्पण। फ़र्क़ केवल इतना कि सतह किस ओर मुड़ी है।",
        ),
      ),
      spoon,
      back,
      w.note(
        t(
          "In drawings of mirrors, the back of the mirror is shaded, and light always comes from the left.",
          "दर्पणों के चित्रों में दर्पण की पीठ छायादार होती है, और प्रकाश हमेशा बाईं ओर से आता है।",
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Pole, centre and radius of curvature, principal axis, aperture: on both mirrors. */
const parts = page("parts", (b) => {
  const w = wordsOn(b);
  const ball = b.prop(lightSceneDef, "ball", {
    scene: SceneKind.MirrorFromSphere,
    ...still,
    step: 2,
    canStep: false,
  });
  b.standsFor(
    ball,
    "the cap on its own, with the faint ball it came from behind it: its centre C, the radius R from C to the cap, and P, the middle of the cap",
  );
  const concave = b.prop(sphericalMirrorDef, "concave", {
    kind: MirrorKind.Concave,
    focalLength: 10,
    object: { x: -28, height: 3 },
    rays: [],
    showImage: false,
    showLabels: true,
    showObject: false,
    showFocus: false,
  });
  const convex = b.prop(sphericalMirrorDef, "convex", {
    kind: MirrorKind.Convex,
    focalLength: 10,
    object: { x: -30, height: 4 },
    rays: [],
    showImage: false,
    showLabels: true,
    showObject: false,
    showFocus: false,
  });
  b.standsFor(
    concave,
    "a concave mirror on its principal axis, with P and C marked in front of it",
  );
  b.standsFor(
    convex,
    "a convex mirror on its principal axis, with P at the mirror and C behind it",
  );
  return column([
    w.title(t("The parts of a spherical mirror", "गोलीय दर्पण के हिस्से")),
    w.body(
      t(
        "To talk about a curved mirror we need names for its parts. Picture the whole sphere the mirror was cut from.",
        "मुड़े हुए दर्पण की बात करने के लिए उसके हिस्सों के नाम चाहिए। उस पूरे गोले की कल्पना करो जिससे दर्पण काटा गया।",
      ),
    ),
    ball,
    w.definition(
      t(
        r`**Pole, centre, radius.** The middle of the mirror's surface is its **pole**, $P$. The centre of the sphere the mirror was cut from is the **centre of curvature**, $C$. The radius of that sphere is the **radius of curvature**, $R$. It is the distance from $P$ to $C$.`,
        r`**ध्रुव, केंद्र, त्रिज्या।** दर्पण की सतह का बीच का बिंदु उसका **ध्रुव** $P$ है। जिस गोले से दर्पण काटा गया, उसका केंद्र **वक्रता केंद्र** $C$ है। उस गोले की त्रिज्या **वक्रता त्रिज्या** $R$ है। यह $P$ से $C$ तक की दूरी है।`,
      ),
    ),
    w.definition(
      t(
        r`**Axis and width.** The straight line through $P$ and $C$ is the **principal axis**. The width of the mirror's reflecting surface is its **aperture**.`,
        r`**अक्ष और चौड़ाई।** $P$ और $C$ से होकर जाने वाली सीधी रेखा **मुख्य अक्ष** है। दर्पण की परावर्तक सतह की चौड़ाई उसका **द्वारक** है।`,
      ),
    ),
    w.body(
      t(
        "Here are the same parts drawn the way this chapter draws mirrors: side on, with light coming from the left.",
        "यही हिस्से उस तरह बने हैं जैसे यह अध्याय दर्पण बनाता है: बग़ल से, प्रकाश बाईं ओर से आता हुआ।",
      ),
    ),
    concave,
    w.body(
      t(
        r`$C$ is not on the mirror. For a concave mirror it is **in front**, on the side the light comes from.`,
        r`$C$ दर्पण पर नहीं है। अवतल दर्पण के लिए वह **सामने** है, उस ओर जिधर से प्रकाश आता है।`,
      ),
    ),
    convex,
    w.body(
      t(
        r`For a convex mirror $C$ is **behind** the mirror.`,
        r`उत्तल दर्पण के लिए $C$ दर्पण के **पीछे** है।`,
      ),
    ),
    w.note(
      t(
        "We only use mirrors whose aperture is small compared with their radius of curvature, like the ones drawn here.",
        "हम केवल ऐसे दर्पण लेते हैं जिनका द्वारक उनकी वक्रता त्रिज्या की तुलना में छोटा हो, जैसे यहाँ बने हैं।",
      ),
    ),
    space(),
  ]);
});

/** Circle geometry: a radius meets the circle at right angles, so the line from C is the normal. */
const normal = page(
  "normal",
  (b) => {
    const w = wordsOn(b);
    const m = b.prop(sphericalMirrorDef, "mirror", {
      kind: MirrorKind.Concave,
      focalLength: 10,
      object: { x: -12, height: 2 },
      rays: [Ray.Centre],
      showImage: false,
      showLabels: true,
    });
    b.studentOnly(m.action(SphericalMirrorAction.MoveObject));
    b.standsFor(
      m,
      "a concave mirror with a line from C through the object's tip to the mirror: the line from C meets the mirror square on, so it is the normal at that point",
    );
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "A is a point on a concave mirror, above the pole. Which line is the normal to the mirror at A?",
        "A अवतल दर्पण पर ध्रुव के ऊपर एक बिंदु है। A पर दर्पण का अभिलंब कौन-सी रेखा है?",
      ),
      options: [
        { id: "right", label: t("The line from A to C", "A से C तक की रेखा") },
        {
          id: "axis",
          label: t("The principal axis", "मुख्य अक्ष"),
          feedback: t(
            "The principal axis is the normal only at P. At A, the radius to A is the normal.",
            "मुख्य अक्ष केवल P पर अभिलंब है। A पर, A तक की त्रिज्या अभिलंब है।",
          ),
        },
        {
          id: "parallel",
          label: t("A line through A parallel to the axis", "A से होकर अक्ष के समानांतर रेखा"),
          feedback: t(
            "That line meets the curved mirror at a slant. The normal must meet it square on: the radius does.",
            "वह रेखा मुड़े दर्पण से तिरछी मिलती है। अभिलंब को समकोण पर मिलना चाहिए: त्रिज्या ऐसा करती है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("The normal on a curved mirror", "मुड़े दर्पण पर अभिलंब")),
      w.body(
        t(
          "The laws of reflection measure angles from the **normal**, the line at right angles to the surface. On a flat mirror the normal points the same way everywhere. On a curved mirror it changes from point to point. So where is it?",
          "परावर्तन के नियम कोण **अभिलंब** से नापते हैं, यानी सतह पर समकोण बनाती रेखा से। सपाट दर्पण पर अभिलंब हर जगह एक ही दिशा में होता है। मुड़े दर्पण पर वह हर बिंदु पर बदलता है। तो वह कहाँ है?",
        ),
      ),
      w.definition(
        t(
          r`**A radius meets the circle at right angles.** Think of the spokes of a bicycle wheel: each one runs from the centre and meets the rim square on, never at a slant. In the same way, a line from the centre of a sphere to any point on its surface is at right angles to the surface there. So **the line from $C$ to any point of a spherical mirror is the normal at that point.** At the pole, that line is the principal axis.`,
          r`**त्रिज्या वृत्त से समकोण पर मिलती है।** साइकिल के पहिये की तीलियों के बारे में सोचो: हर तीली केंद्र से चलती है और रिम से सीधी, समकोण पर मिलती है, कभी तिरछी नहीं। इसी तरह, गोले के केंद्र से उसकी सतह के किसी भी बिंदु तक की रेखा वहाँ सतह से समकोण पर होती है। इसलिए **$C$ से गोलीय दर्पण के किसी भी बिंदु तक की रेखा उस बिंदु पर अभिलंब है।** ध्रुव पर यह रेखा मुख्य अक्ष है।`,
        ),
      ),
      w.body(
        t(
          "Here a line runs from C, through the object's tip, to the mirror. Drag the object: wherever the line lands, it meets the mirror square on, so it is the normal there.",
          "यहाँ एक रेखा C से, वस्तु की नोक से होकर, दर्पण तक जाती है। वस्तु को खिसकाओ: रेखा जहाँ भी पड़े, वह दर्पण से समकोण पर मिलती है, इसलिए वहाँ अभिलंब है।",
        ),
      ),
      m,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** NCERT Activity 10.2: parallel rays meet at F (concave); seem to come from F (convex). f = PF. */
const focus = page(
  "focus",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "The principal focus from NCERT Activity 10.2: sunlight is parallel rays; a concave mirror brings them together at one point on the axis (the bright spot that burns paper), F; a convex mirror spreads them as if from a point F behind it. Focal length f = PF.",
    );
    const guess = choiceQuestion(b, {
      name: "guess",
      prompt: t(
        "Hold a concave mirror facing the Sun and catch the reflected light on a sheet of paper. Move the paper until you get a small, very bright spot. After a while the paper starts to smoke. Why?",
        "अवतल दर्पण को सूरज की ओर करो और परावर्तित प्रकाश को एक कागज़ पर लो। कागज़ को तब तक खिसकाओ जब तक एक छोटा, बहुत चमकीला बिंदु न मिले। कुछ देर बाद कागज़ से धुआँ उठने लगता है। क्यों?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "The mirror brings all the sunlight together at one small spot",
            "दर्पण सारी धूप को एक छोटे बिंदु पर इकट्ठा कर देता है",
          ),
        },
        {
          id: "hot",
          label: t(
            "The mirror itself gets hot and warms the paper",
            "दर्पण ख़ुद गर्म होकर कागज़ को गर्म करता है",
          ),
          feedback: t(
            "The mirror stays cool: it sends the light away. The heat is where all the light ends up together.",
            "दर्पण ठंडा रहता है: वह प्रकाश को लौटा देता है। गर्मी वहाँ है जहाँ सारा प्रकाश एक साथ पहुँचता है।",
          ),
        },
        {
          id: "spread",
          label: t(
            "The mirror spreads the light over the paper",
            "दर्पण प्रकाश को कागज़ पर फैला देता है",
          ),
          feedback: t(
            "Spread-out light would warm the paper less, not more. The spot is small and bright.",
            "फैला हुआ प्रकाश कागज़ को कम गर्म करता, ज़्यादा नहीं। बिंदु छोटा और चमकीला है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const sun = b.prop(
      sphericalMirrorDef,
      "sun",
      {
        kind: MirrorKind.Concave,
        focalLength: 10,
        object: { x: -30, height: 4 },
        rays: [],
        showImage: false,
        showLabels: true,
        beam: true,
      },
      { isHidden: true },
    );
    b.standsFor(
      sun,
      "sunlight as five rays parallel to the principal axis, reflecting off a concave mirror and all meeting at F",
    );
    const focusIs = w.definition(
      t(
        r`**Principal focus.** Rays parallel to the principal axis, after reflecting off a concave mirror, all meet at one point on the axis. That point is the **principal focus**, $F$. The distance $PF$ is the **focal length**, $f$.`,
        r`**मुख्य फोकस।** मुख्य अक्ष के समानांतर किरणें अवतल दर्पण से परावर्तित होकर अक्ष पर एक बिंदु पर मिलती हैं। वह बिंदु **मुख्य फोकस** $F$ है। दूरी $PF$ **फोकस दूरी** $f$ है।`,
      ),
      "focusIs",
      { isHidden: true },
    );
    const spot = w.body(
      t(
        "The bright spot on the paper is where all the light meets, so it is at F. In fact it is a tiny **image of the Sun**. It is real, because the rays really meet there. So measuring from the mirror to the spot gives the focal length roughly.",
        "कागज़ पर चमकीला बिंदु वहीं है जहाँ सारा प्रकाश मिलता है, यानी F पर। असल में यह **सूरज का** एक नन्हा **प्रतिबिंब** है। यह वास्तविक है, क्योंकि किरणें वहाँ सचमुच मिलती हैं। इसलिए दर्पण से बिंदु तक नापने पर फोकस दूरी लगभग मिल जाती है।",
      ),
      "spot",
      { isHidden: true },
    );
    const convex = b.prop(
      sphericalMirrorDef,
      "convexSun",
      {
        kind: MirrorKind.Convex,
        focalLength: 10,
        object: { x: -30, height: 4 },
        rays: [],
        showImage: false,
        showLabels: true,
        beam: true,
      },
      { isHidden: true },
    );
    b.standsFor(
      convex,
      "the same parallel rays on a convex mirror: they spread out, and their dashed extensions meet at F behind the mirror",
    );
    const convexF = w.body(
      t(
        r`A convex mirror spreads the same rays apart. Traced back, they **seem to come from** one point behind the mirror. That point is the convex mirror's principal focus $F$, and again $f = PF$. No light really goes there, so a convex mirror can't burn paper.`,
        r`उत्तल दर्पण उन्हीं किरणों को फैला देता है। पीछे बढ़ाने पर वे दर्पण के पीछे एक बिंदु से **आती हुई लगती** हैं। वह बिंदु उत्तल दर्पण का मुख्य फोकस $F$ है, और फिर से $f = PF$। वहाँ सचमुच कोई प्रकाश नहीं जाता, इसलिए उत्तल दर्पण कागज़ नहीं जला सकता।`,
      ),
      "convexF",
      { isHidden: true },
    );
    b.when(guess.on(QuestionSignal.Correct), [
      theBoard.show(sun),
      theBoard.show(focusIs),
      theBoard.show(spot),
      theBoard.show(convex),
      theBoard.show(convexF),
      theBoard.pass(),
    ]);
    return column([
      w.title(t("The principal focus", "मुख्य फोकस")),
      w.note(
        t(
          "Never look at the Sun directly, or into a mirror reflecting sunlight. It can damage your eyes.",
          "सूरज को कभी सीधे मत देखो, न ही धूप परावर्तित करते दर्पण में। इससे आँखों को नुक़सान हो सकता है।",
        ),
      ),
      w.body(
        t(
          "The Sun is so far away that its rays reach us **parallel** to each other, and to the principal axis when the mirror faces it.",
          "सूरज इतना दूर है कि उसकी किरणें हम तक एक-दूसरे के **समानांतर** पहुँचती हैं, और जब दर्पण उसकी ओर हो, तो मुख्य अक्ष के भी समानांतर।",
        ),
      ),
      guess,
      sun,
      focusIs,
      spot,
      convex,
      convexF,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Read PF and PC for a few mirrors: PC is always twice PF. Then R = 2f. */
const twice = page(
  "twice",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "Find R = 2f by reading the ruler: change the mirror (its focal length) and read PF and PC each time; PC is always twice PF, so F is halfway between P and C. Stated for small apertures.",
    );
    const m = b.prop(sphericalMirrorDef, "mirror", {
      kind: MirrorKind.Concave,
      focalLength: 20,
      object: { x: -30, height: 4 },
      rays: [],
      showImage: false,
      showLabels: true,
      beam: true,
      showRuler: true,
      canSetFocal: true,
      span: 85,
    });
    b.studentOnly(m.action(SphericalMirrorAction.SetFocalLength));
    b.standsFor(
      m,
      "a concave mirror with a ruler along the axis, P, F and C marked, and buttons to change the mirror",
    );
    const notice = choiceQuestion(b, {
      name: "notice",
      prompt: t(
        "Change the mirror a few times. Each time read PF and PC on the ruler. What do you notice?",
        "दर्पण को कुछ बार बदलो। हर बार रूलर पर PF और PC पढ़ो। तुम्हें क्या दिखता है?",
      ),
      options: [
        { id: "right", label: t("PC is always twice PF", "PC हमेशा PF का दोगुना है") },
        {
          id: "same",
          label: t("PC and PF are equal", "PC और PF बराबर हैं"),
          feedback: t(
            "Look at the ruler: C is farther from the mirror than F.",
            "रूलर देखो: C, F से दर्पण से ज़्यादा दूर है।",
          ),
        },
        {
          id: "fixed",
          label: t("PC stays the same", "PC वही रहता है"),
          feedback: t(
            "C moves when you change the mirror. Compare it with PF each time.",
            "दर्पण बदलने पर C खिसकता है। हर बार उसकी तुलना PF से करो।",
          ),
        },
      ],
      answer: "right",
    });
    const rule = w.definition(
      t(
        r`**Radius and focal length.** For a spherical mirror of small aperture, the radius of curvature is twice the focal length. $$R = 2f$$ So the principal focus lies **halfway** between the pole and the centre of curvature.`,
        r`**त्रिज्या और फोकस दूरी।** छोटे द्वारक वाले गोलीय दर्पण की वक्रता त्रिज्या उसकी फोकस दूरी की दोगुनी होती है। $$R = 2f$$ इसलिए मुख्य फोकस ध्रुव और वक्रता केंद्र के **ठीक बीच** में होता है।`,
      ),
      "rule",
      { isHidden: true },
    );
    b.when(notice.on(QuestionSignal.Correct), theBoard.show(rule));
    return column([
      w.title(t("Where F sits", "F कहाँ होता है")),
      w.body(
        t(
          "A more curved mirror has its C closer, and its F closer too. Is there a pattern between them?",
          "ज़्यादा मुड़े दर्पण का C पास होता है, और उसका F भी। क्या दोनों के बीच कोई पैटर्न है?",
        ),
      ),
      m,
      notice,
      rule,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** Back to Mom's mirror: the far-off window is nearly parallel light, so its picture lands near F. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const room = b.prop(lightSceneDef, "room", { scene: SceneKind.MakeupMirror, ...still });
    b.standsFor(
      room,
      "Mom's make-up mirror throwing the small upside-down window onto the tissue box in front of it again",
    );
    const kind = choiceQuestion(b, {
      name: "kind",
      prompt: t(
        "So what kind of mirror is Mom's make-up mirror?",
        "तो माँ का मेकअप दर्पण किस तरह का दर्पण है?",
      ),
      options: [
        { id: "right", label: t("Concave", "अवतल") },
        {
          id: "convex",
          label: t("Convex", "उत्तल"),
          feedback: t(
            "A convex mirror's light only seems to come from F, behind it. Nothing real reaches the box.",
            "उत्तल दर्पण का प्रकाश केवल पीछे F से आता हुआ लगता है। कोई वास्तविक प्रकाश डिब्बे तक नहीं पहुँचता।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const why = w.body(
      t(
        "It's **concave**: it brings light together, so the light really meets, and a real picture can land on a screen. The window and the tree are far away, so their light arrives almost parallel. It comes together close to F, which is why the picture landed on the box just in front of the mirror, not across the room.",
        "यह **अवतल** है: यह प्रकाश को इकट्ठा करता है, इसलिए प्रकाश सचमुच मिलता है, और वास्तविक तस्वीर पर्दे पर उतर सकती है। खिड़की और पेड़ दूर हैं, इसलिए उनका प्रकाश लगभग समानांतर आता है। वह F के पास इकट्ठा होता है, इसीलिए तस्वीर दर्पण के ठीक सामने रखे डिब्बे पर बनी, कमरे के दूसरी ओर नहीं।",
      ),
      "why",
      { isHidden: true },
    );
    const card = choiceQuestion(b, {
      name: "card",
      prompt: t(
        "Kabir holds a card 10 cm in front of the mirror and catches a tiny, sharp picture of a far-off tree. Roughly what are the mirror's focal length and radius of curvature?",
        "कबीर दर्पण के सामने 10 सेमी पर एक कार्ड रखता है और दूर के एक पेड़ की नन्ही, साफ़ तस्वीर पकड़ता है। दर्पण की फोकस दूरी और वक्रता त्रिज्या लगभग कितनी हैं?",
      ),
      options: [
        { id: "right", label: t("f ≈ 10 cm, R ≈ 20 cm", "f ≈ 10 सेमी, R ≈ 20 सेमी") },
        {
          id: "half",
          label: t("f ≈ 5 cm, R ≈ 10 cm", "f ≈ 5 सेमी, R ≈ 10 सेमी"),
          feedback: t(
            "Light from far away meets at F, so the card at 10 cm is at F: f is about 10 cm.",
            "दूर का प्रकाश F पर मिलता है, इसलिए 10 सेमी पर रखा कार्ड F पर है: f लगभग 10 सेमी है।",
          ),
        },
        {
          id: "same",
          label: t("f ≈ 10 cm, R ≈ 10 cm", "f ≈ 10 सेमी, R ≈ 10 सेमी"),
          feedback: t("R is twice f.", "R, f का दोगुना है।"),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const smoke = w.body(
      t(
        "Then Kabir turns the mirror straight at the Sun. The spot on the card gets brighter, and brighter, and the card starts to smoke. Mom takes her mirror back.",
        "फिर कबीर दर्पण को सीधे सूरज की ओर कर देता है। कार्ड पर बिंदु और चमकीला होता जाता है, और कार्ड से धुआँ उठने लगता है। माँ अपना दर्पण वापस ले लेती हैं।",
      ),
      "smoke",
      { isHidden: true },
    );
    b.when(kind.on(QuestionSignal.Correct), [theBoard.show(why), theBoard.show(card)]);
    b.when(card.on(QuestionSignal.Correct), [theBoard.show(smoke), theBoard.pass()]);
    return column([
      w.title(t("Back to Mom's mirror", "फिर माँ का दर्पण")),
      room,
      kind,
      why,
      card,
      smoke,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** NCERT in-text: R = 20 cm; and back the other way. */
const example = page("example", (b) => {
  const w = wordsOn(b);
  const m = b.prop(sphericalMirrorDef, "mirror", {
    kind: MirrorKind.Concave,
    focalLength: 10,
    object: { x: -30, height: 4 },
    rays: [],
    showImage: false,
    showLabels: true,
    showRuler: true,
    beam: true,
    span: 45,
  });
  b.standsFor(m, "a concave mirror with a ruler: C at 20 cm and F halfway, at 10 cm");
  return column([
    w.title(t("Example", "उदाहरण")),
    w.body(
      t(
        "**The radius of curvature of a spherical mirror is 20 cm. What is its focal length?**",
        "**एक गोलीय दर्पण की वक्रता त्रिज्या 20 सेमी है। उसकी फोकस दूरी क्या है?**",
      ),
    ),
    m,
    w.body(
      t(
        "F is halfway from P to C, so the focal length is half the radius.",
        "F, P से C के बीच आधे रास्ते पर है, इसलिए फोकस दूरी त्रिज्या की आधी है।",
      ),
    ),
    w.body(
      t(
        r`$$f = \frac{R}{2} = \frac{20}{2} = 10 \text{ cm}$$`,
        r`$$f = \frac{R}{2} = \frac{20}{2} = 10 \text{ सेमी}$$`,
      ),
    ),
    w.body(
      t(
        "**The other way.** A concave mirror has a focal length of 15 cm. Its radius of curvature is twice that.",
        "**उल्टी दिशा में।** एक अवतल दर्पण की फोकस दूरी 15 सेमी है। उसकी वक्रता त्रिज्या उसकी दोगुनी है।",
      ),
    ),
    w.body(
      t(r`$$R = 2f = 2 \times 15 = 30 \text{ cm}$$`, r`$$R = 2f = 2 \times 15 = 30 \text{ सेमी}$$`),
    ),
    w.body(
      t(
        "So its centre of curvature is 30 cm in front of the pole.",
        "इसलिए उसका वक्रता केंद्र ध्रुव से 30 सेमी सामने है।",
      ),
    ),
    space(),
  ]);
});

/** NCERT in-text: convex mirror, R = 32 cm. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const fig = b.prop(sphericalMirrorDef, "mirror", {
      kind: MirrorKind.Convex,
      focalLength: 16,
      object: { x: -30, height: 4 },
      rays: [],
      showImage: false,
      showLabels: false,
      beam: true,
      span: 45,
    });
    b.standsFor(
      fig,
      "a convex mirror with parallel rays spreading out from it, F and C not marked",
    );
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "A convex mirror has a radius of curvature of 32 cm. What is its focal length, and where is its focus?",
        "एक उत्तल दर्पण की वक्रता त्रिज्या 32 सेमी है। उसकी फोकस दूरी क्या है, और फोकस कहाँ है?",
      ),
      options: [
        { id: "right", label: t("16 cm, behind the mirror", "16 सेमी, दर्पण के पीछे") },
        {
          id: "front",
          label: t("16 cm, in front of the mirror", "16 सेमी, दर्पण के सामने"),
          feedback: t(
            "A convex mirror's F is where the spread-out rays seem to come from: behind the mirror.",
            "उत्तल दर्पण का F वहाँ है जहाँ से फैली किरणें आती हुई लगती हैं: दर्पण के पीछे।",
          ),
        },
        {
          id: "double",
          label: t("64 cm, behind the mirror", "64 सेमी, दर्पण के पीछे"),
          feedback: t(
            "R is twice f, so f is half of R, not double it.",
            "R, f का दोगुना है, इसलिए f, R का आधा है, दोगुना नहीं।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ A concave mirror brings parallel light together at F, and that light **really meets**, so it can land on a screen. That's what the flat mirror couldn't do. ? But the window on the box was tiny and upside down, and sharp only at one distance from the mirror. For a far-off window that's F, about 10 cm away. For something nearer, like a phone, where must the screen be? Next: drawing the rays.",
        "**मिशन लॉग।** ✓ अवतल दर्पण समानांतर प्रकाश को F पर इकट्ठा करता है, और वह प्रकाश **सचमुच मिलता** है, इसलिए वह पर्दे पर उतर सकता है। सपाट दर्पण यही नहीं कर पाया था। ? पर डिब्बे पर खिड़की नन्ही और उल्टी थी, और दर्पण से केवल एक दूरी पर साफ़ थी। दूर की खिड़की के लिए वह F है, लगभग 10 सेमी दूर। किसी पास की चीज़, जैसे फ़ोन, के लिए पर्दा कहाँ होना चाहिए? आगे: किरणें बनाना।",
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
  wall,
  sphere,
  spoonPage,
  parts,
  normal,
  focus,
  twice,
  inLife,
  example,
  yourTurn,
];

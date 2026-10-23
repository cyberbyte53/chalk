import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, goalQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  LateralMirrorAction,
  LateralMirrorDerived,
  MirrorImageAction,
  PlaneMirrorAction,
  PlaneMirrorDerived,
  PlaneMirrorSignal,
  SceneAction,
  SceneKind,
  TORCH_HEIGHT,
  lateralMirrorDef,
  lightSceneDef,
  mirrorImageDef,
  planeMirrorDef,
  rayAngleDef,
} from "@chalk/prop-light";

const r = String.raw;
const still = { isLit: true, canToggle: false } as const;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** Who, where, what: the family's movie night on one small phone. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const sofa = b.prop(lightSceneDef, "sofa", { scene: SceneKind.TinyScreen, ...still });
  b.standsFor(
    sofa,
    "the family squeezed on the sofa round one small phone; the big wall in front is bare",
  );
  return column([
    w.title(t("Movie night", "मूवी नाइट")),
    sofa,
    w.body(
      t(
        "Saturday night. Riya, her little brother Kabir, Mom and Grandpa have finally agreed on a movie. The only screen in the house that works is Riya's phone, so all four squeeze together on the sofa, heads almost touching, squinting at a picture the size of a playing card. Grandpa can barely see a thing.",
        "शनिवार की रात। रिया, उसका छोटा भाई कबीर, मम्मी और दादाजी आख़िरकार एक फ़िल्म पर राज़ी हुए हैं। घर में चलने वाली इकलौती स्क्रीन रिया का फ़ोन है, इसलिए चारों सोफ़े पर सटकर बैठ जाते हैं, सिर लगभग टकराते हुए, ताश के पत्ते जितनी तस्वीर को आँखें सिकोड़कर देखते हुए। दादाजी को लगभग कुछ नहीं दिखता।",
      ),
    ),
    space(),
  ]);
});

/** Then the power goes: dark, the charger lost, and Kabir's idea. */
const dark = page("dark", (b) => {
  const w = wordsOn(b);
  const room = b.prop(lightSceneDef, "room", {
    scene: SceneKind.PowerCut,
    isLit: false,
    canToggle: false,
  });
  b.standsFor(
    room,
    "the room in a power cut: a phone at 2% glows on the table; the charger beside it can hardly be seen",
  );
  return column([
    w.title(t("Then the power goes", "फिर बिजली चली जाती है")),
    room,
    w.body(
      t(
        "Twenty minutes in, the power cuts out. The phone drops to 2%. Riya knows exactly where the charger is, on the table a metre away, but in the dark she can't see it at all.",
        "बीस मिनट बाद बिजली चली जाती है। फ़ोन 2% पर आ जाता है। रिया को ठीक पता है कि चार्जर कहाँ है, एक मीटर दूर मेज़ पर, पर अँधेरे में वह उसे बिल्कुल नहीं देख पाती।",
      ),
    ),
    w.body(
      t(
        'Kabir, in the dark: **"Even when the lights come back, that screen is tiny. Why can\'t we throw the movie onto the wall, big, like a real cinema?"**',
        'अँधेरे में कबीर: **"बिजली आ भी जाए, तो वह स्क्रीन नन्ही-सी है। हम फ़िल्म को दीवार पर क्यों नहीं डाल सकते, बड़ी, असली सिनेमा की तरह?"**',
      ),
    ),
    space(),
  ]);
});

/** Why this chapter: a projector is light doing three things; the stops on the way. */
const why = page("why", (b) => {
  const w = wordsOn(b);
  const goal = b.prop(lightSceneDef, "goal", { scene: SceneKind.MovieNight, ...still });
  b.standsFor(
    goal,
    "the goal: the family watching the movie as a big picture on the wall, thrown by a shoebox projector",
  );
  return column([
    w.title(t("What this chapter is for", "यह अध्याय किसलिए है")),
    goal,
    w.body(
      t(
        "That's the mission for this chapter: build a projector out of a shoebox, and put the movie on the wall. It sounds like a gadget, but a projector is just **light** doing three things: travelling in **straight lines**, **bouncing** off mirrors, and **bending** through lenses. Learn those three, and you can build one.",
        "यही इस अध्याय का मिशन है: जूते के डिब्बे से एक प्रोजेक्टर बनाना, और फ़िल्म को दीवार पर डालना। यह कोई जादुई यंत्र लगता है, पर प्रोजेक्टर बस **प्रकाश** है जो तीन काम करता है: **सीधी रेखाओं** में चलना, दर्पणों से **उछलना**, और लेंसों से गुज़रकर **मुड़ना**। ये तीन बातें सीखो, और तुम एक बना सकते हो।",
      ),
    ),
    w.definition(
      t(
        "**The stops on the way.** (1) How we see anything at all, and how flat mirrors work: *this lesson*. (2) Curved mirrors, which can make a picture land on a screen. (3) How light bends when it goes into glass or water. (4) Lenses, which bend light to make a picture. (5) Our projector, built.",
        "**रास्ते के पड़ाव।** (1) हम कुछ भी कैसे देखते हैं, और सपाट दर्पण कैसे काम करते हैं: *यह पाठ*। (2) मुड़े हुए दर्पण, जो तस्वीर को पर्दे पर उतार सकते हैं। (3) काँच या पानी में जाते समय प्रकाश कैसे मुड़ता है। (4) लेंस, जो प्रकाश को मोड़कर तस्वीर बनाते हैं। (5) हमारा प्रोजेक्टर, तैयार।",
      ),
    ),
    w.body(
      t(
        "First stop, starting from zero: why couldn't Riya see the charger? How do we see anything at all?",
        "पहला पड़ाव, बिल्कुल शुरू से: रिया को चार्जर क्यों नहीं दिखा? हम कुछ भी देखते कैसे हैं?",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** How we see: luminous sources; everything else is seen by the light it reflects into our eyes. */
const howWeSee = page(
  "how-we-see",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "NCERT's opening idea: we see an object because it reflects the light falling on it, and that reflected light reaches our eyes. Luminous objects make light; non-luminous ones are seen only by reflected light.",
    );
    const anim = b.prop(lightSceneDef, "anim", { scene: SceneKind.HowWeSee, ...still });
    b.standsFor(
      anim,
      "an animation: a torch sends light in straight lines to a charger; the light bounces off the charger in all directions and one bounced ray travels into an eye",
    );
    const moon = choiceQuestion(b, {
      name: "moon",
      prompt: t(
        "Which of these do we see only because of the light it reflects?",
        "इनमें से किसे हम केवल उसके परावर्तित प्रकाश से देखते हैं?",
      ),
      options: [
        { id: "right", label: t("The Moon", "चाँद") },
        {
          id: "sun",
          label: t("The Sun", "सूरज"),
          feedback: t(
            "The Sun makes its own light: it is luminous.",
            "सूरज अपना प्रकाश ख़ुद बनाता है: वह दीप्त है।",
          ),
        },
        {
          id: "candle",
          label: t("A candle flame", "मोमबत्ती की लौ"),
          feedback: t(
            "A flame makes its own light: it is luminous.",
            "लौ अपना प्रकाश ख़ुद बनाती है: वह दीप्त है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const moonWhy = w.body(
      t(
        "The Moon makes no light of its own. Sunlight falls on it, bounces off, and some of that light reaches us.",
        "चाँद का अपना कोई प्रकाश नहीं है। सूरज का प्रकाश उस पर पड़ता है, उछलता है, और उसका कुछ हिस्सा हम तक पहुँचता है।",
      ),
      "moonWhy",
      { isHidden: true },
    );
    b.when(moon.on(QuestionSignal.Correct), [theBoard.show(moonWhy), theBoard.pass()]);
    return column([
      w.title(t("How we see things", "हम चीज़ें कैसे देखते हैं")),
      w.definition(
        t(
          "**Light** is what lets us see. Things that make their own light, like the Sun, a bulb or a candle flame, are **luminous**. Things that don't, like a book, a chair or you, are **non-luminous**.",
          "**प्रकाश** वह है जिससे हम देख पाते हैं। जो चीज़ें अपना प्रकाश ख़ुद बनाती हैं, जैसे सूरज, बल्ब या मोमबत्ती की लौ, वे **दीप्त** हैं। जो नहीं बनातीं, जैसे किताब, कुर्सी या तुम, वे **अदीप्त** हैं।",
        ),
      ),
      w.definition(
        t(
          "**How we see a non-luminous thing.** Light from a source falls on it. The thing sends some of that light back out, in all directions. When some of it **reaches our eyes**, we see the thing. Light bouncing back off a surface like this is called **reflection**.",
          "**अदीप्त चीज़ को हम कैसे देखते हैं।** किसी स्रोत का प्रकाश उस पर पड़ता है। वह चीज़ उस प्रकाश का कुछ हिस्सा हर दिशा में वापस भेजती है। जब उसका कुछ हिस्सा **हमारी आँखों तक पहुँचता** है, तब हम उसे देखते हैं। किसी सतह से प्रकाश के इस तरह वापस उछलने को **परावर्तन** कहते हैं।",
        ),
      ),
      anim,
      w.body(
        t(
          "Watch the light: it leaves the torch, hits the charger, bounces off in every direction, and one bit of it travels into the eye. No light from the torch means nothing to bounce, and nothing reaches the eye.",
          "प्रकाश को देखो: वह टॉर्च से निकलता है, चार्जर से टकराता है, हर दिशा में उछलता है, और उसका एक हिस्सा आँख में जाता है। टॉर्च से प्रकाश नहीं, तो उछलने को कुछ नहीं, और आँख तक कुछ नहीं पहुँचता।",
        ),
      ),
      moon,
      moonWhy,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Light travels in straight lines: sharp shadows. Ray and beam. */
const straight = page(
  "straight",
  (b) => {
    const w = wordsOn(b);
    const anim = b.prop(lightSceneDef, "anim", { scene: SceneKind.StraightLines, ...still });
    b.standsFor(
      anim,
      "an animation: light from a small bulb travels in straight lines; the rays that just graze a ball carry straight on to the edge of a sharp shadow on the wall",
    );
    const beam = b.prop(lightSceneDef, "beam", { scene: SceneKind.RayBeam, ...still });
    b.standsFor(
      beam,
      "a torch's beam drawn as five straight lines with arrows, one of them highlighted: each line is a ray",
    );
    const why = choiceQuestion(b, {
      name: "why",
      prompt: t(
        "A small bulb gives a ball a sharp-edged shadow. What does that tell us?",
        "छोटा बल्ब गेंद की तीखे किनारों वाली छाया बनाता है। इससे क्या पता चलता है?",
      ),
      options: [
        { id: "right", label: t("Light travels in straight lines", "प्रकाश सीधी रेखाओं में चलता है") },
        {
          id: "bend",
          label: t("Light bends around the ball", "प्रकाश गेंद के चारों ओर मुड़ जाता है"),
          feedback: t(
            "If light bent around the ball, it would get into the shadow and blur its edge. The edge is sharp.",
            "प्रकाश अगर गेंद के चारों ओर मुड़ता, तो छाया में घुसकर किनारा धुँधला कर देता। किनारा तीखा है।",
          ),
        },
        {
          id: "dark",
          label: t("The ball makes darkness", "गेंद अँधेरा बनाती है"),
          feedback: t(
            "A shadow isn't made by the ball: it's just the place no light can reach.",
            "छाया गेंद नहीं बनाती: वह बस वह जगह है जहाँ कोई प्रकाश नहीं पहुँच पाता।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Light travels in straight lines", "प्रकाश सीधी रेखाओं में चलता है")),
      w.body(
        t(
          "Put a ball in front of a small bulb. The light that just misses the ball's edge carries straight on, and the light that hits the ball stops there. So the shadow on the wall has a **sharp edge**. If light could bend round the ball, the edge would be blurred.",
          "छोटे बल्ब के सामने एक गेंद रखो। जो प्रकाश गेंद के किनारे को छूकर निकलता है, वह सीधा आगे चलता है, और जो गेंद से टकराता है वह वहीं रुक जाता है। इसलिए दीवार पर छाया का **किनारा तीखा** होता है। अगर प्रकाश गेंद के चारों ओर मुड़ पाता, तो किनारा धुँधला होता।",
        ),
      ),
      anim,
      w.definition(
        t(
          "**Ray and beam.** A single straight line along which light travels is a **ray**. We draw it as a line with an arrow pointing the way the light goes. A bundle of rays travelling together, like the light from a torch, is a **beam**.",
          "**किरण और किरण-पुंज।** जिस एक सीधी रेखा पर प्रकाश चलता है, वह **किरण** है। उसे हम तीर वाली रेखा से दिखाते हैं, जो प्रकाश के चलने की दिशा बताता है। साथ-साथ चलती किरणों का गुच्छा, जैसे टॉर्च का प्रकाश, **किरण-पुंज** है।",
        ),
      ),
      beam,
      why,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Transparent, translucent, opaque. */
const through = page(
  "through",
  (b) => {
    const w = wordsOn(b);
    const panes = b.prop(lightSceneDef, "panes", { scene: SceneKind.SeeThrough, ...still });
    b.standsFor(
      panes,
      "three panes in front of lamps: clear glass shows the lamp sharply, butter paper only a fuzzy glow, a wooden board nothing at all and a shadow behind",
    );
    const which = choiceQuestion(b, {
      name: "which",
      prompt: t(
        "A frosted bathroom window lets light in, but you can't see clearly through it. It is…",
        "बाथरूम की धुँधली खिड़की से रोशनी आती है, पर उसके आर-पार साफ़ नहीं दिखता। वह है…",
      ),
      options: [
        { id: "right", label: t("translucent", "पारभासी") },
        {
          id: "transparent",
          label: t("transparent", "पारदर्शी"),
          feedback: t(
            "Through something transparent you'd see clearly. This only lets some light through.",
            "पारदर्शी चीज़ के आर-पार साफ़ दिखता। यह केवल कुछ प्रकाश जाने देती है।",
          ),
        },
        {
          id: "opaque",
          label: t("opaque", "अपारदर्शी"),
          feedback: t(
            "Some light does get through it, so it isn't opaque.",
            "इससे कुछ प्रकाश पार जाता है, इसलिए यह अपारदर्शी नहीं है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Through, or not", "आर-पार, या नहीं")),
      w.definition(
        t(
          "**Transparent, translucent, opaque.** A material that lets light pass straight through, so you see clearly through it, is **transparent**: glass, clean water, air. One that lets some light through but not a clear picture is **translucent**: butter paper, frosted glass. One that lets no light through is **opaque**: wood, a wall, your hand.",
          "**पारदर्शी, पारभासी, अपारदर्शी।** जो पदार्थ प्रकाश को सीधा आर-पार जाने दे, ताकि उसके पार साफ़ दिखे, वह **पारदर्शी** है: काँच, साफ़ पानी, हवा। जो कुछ प्रकाश जाने दे पर साफ़ तस्वीर नहीं, वह **पारभासी** है: बटर पेपर, धुँधला काँच। जो कोई प्रकाश न जाने दे, वह **अपारदर्शी** है: लकड़ी, दीवार, तुम्हारा हाथ।",
        ),
      ),
      panes,
      which,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Mirror, plane mirror; the parts of a bounce, named one at a time on a labelled diagram. */
const names = page(
  "names",
  (b) => {
    const w = wordsOn(b);
    const room = b.prop(planeMirrorDef, "room", {
      torchX: 20,
      strike: 45,
      target: null,
      showNormal: true,
      showAngles: true,
      showStrikeAt: false,
      labelStep: 0,
    });
    b.studentOnly(room.action(PlaneMirrorAction.NextLabel));
    b.standsFor(
      room,
      "a torch shining down on a flat mirror with a ruler along it; tapping next labels, one by one, the incident ray, the point of incidence, the normal, the reflected ray, i and r",
    );
    b.witness(...Array.from({ length: 6 }, () => room.learner(PlaneMirrorAction.NextLabel)));
    const allNamed = w.definition(
      t(
        "**The parts of a bounce.** The ray coming to the mirror is the **incident ray**. It meets the mirror at the **point of incidence**. The line drawn there **at right angles to the mirror** is the **normal**. The ray going away is the **reflected ray**.",
        "**उछाल के हिस्से।** दर्पण की ओर आती किरण **आपतित किरण** है। वह दर्पण से **आपतन बिंदु** पर मिलती है। वहाँ दर्पण पर **समकोण बनाती हुई** खींची गई रेखा **अभिलंब** है। दूर जाती किरण **परावर्तित किरण** है।",
      ),
      "allNamed",
      { isHidden: true },
    );
    const angles = w.definition(
      t(
        r`**Angles.** The **angle of incidence**, $i$, is between the incident ray and the normal. The **angle of reflection**, $r$, is between the reflected ray and the normal.`,
        r`**कोण।** **आपतन कोण** $i$ आपतित किरण और अभिलंब के बीच का कोण है। **परावर्तन कोण** $r$ परावर्तित किरण और अभिलंब के बीच का कोण है।`,
      ),
      "angles",
      { isHidden: true },
    );
    const fromNormal = w.body(
      t(
        "Both angles are measured **from the normal**, never from the mirror. Questions often give you the angle with the mirror instead: watch for that.",
        "दोनों कोण **अभिलंब से** नापे जाते हैं, दर्पण से कभी नहीं। प्रश्न अक्सर दर्पण से बना कोण देते हैं: इस पर ध्यान रखो।",
      ),
      "fromNormal",
      { isHidden: true },
    );
    b.when(
      room.on(PlaneMirrorSignal.LabelShown),
      [theBoard.show(allNamed), theBoard.show(angles), theBoard.show(fromNormal), theBoard.pass()],
      room.derived(PlaneMirrorDerived.LabelStep).eq(6),
    );
    return column([
      w.title(t("A ray meets a mirror", "किरण दर्पण से मिलती है")),
      w.definition(
        t(
          "**Mirror.** The outside face of a thing is its **surface**. A **mirror** is a very smooth, polished surface that reflects almost all the light falling on it. A **plane** surface is a flat one, so a flat mirror is a **plane mirror**.",
          "**दर्पण।** किसी चीज़ का बाहरी चेहरा उसकी **सतह** है। **दर्पण** एक बहुत चिकनी, चमकाई हुई सतह है जो उस पर पड़ने वाला लगभग सारा प्रकाश परावर्तित कर देती है। **समतल** सतह सपाट सतह होती है, इसलिए सपाट दर्पण **समतल दर्पण** है।",
        ),
      ),
      w.body(
        t(
          "Here a torch shines on a plane mirror lying on the floor. Every bounce has the same six parts. **Tap next to name them one at a time.**",
          "यहाँ एक टॉर्च फ़र्श पर रखे समतल दर्पण पर चमक रही है। हर उछाल के यही छह हिस्से होते हैं। **एक-एक करके नाम देखने के लिए आगे दबाओ।**",
        ),
      ),
      room,
      allNamed,
      angles,
      fromNormal,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Find i = r: light the target at the torch's height. */
const star = page(
  "star",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "Find the law of reflection before it is stated: a target at the torch's height lights only when the beam lands halfway, because the beam leaves at exactly the angle it arrived (i = r).",
    );
    const room = b.prop(planeMirrorDef, "room", {
      torchX: 20,
      strike: 35,
      target: { x: 80, y: TORCH_HEIGHT },
      showNormal: true,
      showAngles: true,
    });
    b.studentOnly(room.action(PlaneMirrorAction.Aim));
    b.standsFor(
      room,
      "a torch 20 cm from the left, a mirror on the floor with a ruler, a star 80 cm from the left at the torch's height, with i and r shown",
    );
    const goal = goalQuestion(b, {
      about: room,
      prompt: t(
        "Drag where the beam lands on the mirror until the star lights up.",
        "किरण दर्पण पर जहाँ पड़ती है, उसे तब तक खिसकाओ जब तक तारा जल न जाए।",
      ),
      isMet: room.derived(PlaneMirrorDerived.IsLit),
      solve: [room.learner(PlaneMirrorAction.Aim, { strike: 50 })],
      notes: [
        {
          when: room.field("strike").lt(48),
          say: t(
            "The beam bounces back up too steeply and comes down before the star. Move it to the right.",
            "किरण बहुत तीखी उछलती है और तारे से पहले नीचे आ जाती है। इसे दाईं ओर खिसकाओ।",
          ),
          reach: [room.learner(PlaneMirrorAction.Aim, { strike: 35 })],
        },
        {
          when: room.field("strike").gt(52),
          say: t(
            "The beam is too flat and flies past the star. Move it to the left.",
            "किरण बहुत सपाट है और तारे के पार निकल जाती है। इसे बाईं ओर खिसकाओ।",
          ),
          reach: [room.learner(PlaneMirrorAction.Aim, { strike: 65 })],
        },
      ],
    });
    const found = w.body(
      t(
        r`It lights at 50 cm on the ruler, exactly halfway between the torch and the star. And while you dragged, the two angles were **always equal**: $$i = r$$ The beam leaves the mirror at exactly the angle it arrived. The star is as high as the torch, so the bounce has to be right in the middle.`,
        r`यह रूलर पर 50 सेमी पर जलता है, टॉर्च और तारे के ठीक बीच में। और खिसकाते समय दोनों कोण **हमेशा बराबर** थे: $$i = r$$ किरण दर्पण से ठीक उसी कोण पर निकलती है जिस पर आई थी। तारा टॉर्च जितना ऊँचा है, इसलिए उछाल ठीक बीच में ही होना चाहिए।`,
      ),
      "found",
      { isHidden: true },
    );
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(found));
    return column([
      w.title(t("Try it: light the star", "करके देखो: तारा जलाओ")),
      w.body(
        t(
          "A torch, a mirror on the floor, and a star on the far wall exactly as high as the torch. You can't point the torch at the star: you have to bounce the light off the mirror. Where must the beam land?",
          "एक टॉर्च, फ़र्श पर एक दर्पण, और सामने की दीवार पर ठीक टॉर्च जितनी ऊँचाई पर एक तारा। टॉर्च तारे की ओर नहीं कर सकते: प्रकाश को दर्पण से उछालना होगा। किरण कहाँ पड़नी चाहिए?",
        ),
      ),
      room,
      goal,
      found,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The two laws, the second explained; along the normal, straight back; free play. */
const laws = page("laws", (b) => {
  const w = wordsOn(b);
  const room = b.prop(planeMirrorDef, "room", {
    torchX: 50,
    strike: 50,
    target: null,
    showNormal: true,
    showAngles: true,
  });
  b.studentOnly(room.action(PlaneMirrorAction.Aim));
  b.standsFor(
    room,
    "a sandbox: the torch in the middle, the beam free to aim either way, with i and r shown",
  );
  return column([
    w.title(t("The laws of reflection", "परावर्तन के नियम")),
    w.definition(
      t(
        r`**The laws of reflection.** (1) The angle of incidence is equal to the angle of reflection. $$i = r$$ (2) The incident ray, the normal at the point of incidence and the reflected ray all lie in the same flat sheet (the same **plane**).`,
        r`**परावर्तन के नियम।** (1) आपतन कोण परावर्तन कोण के बराबर होता है। $$i = r$$ (2) आपतित किरण, आपतन बिंदु पर अभिलंब और परावर्तित किरण, तीनों एक ही सपाट चादर में (एक ही **तल** में) होते हैं।`,
      ),
    ),
    w.body(
      t(
        "The second law says the ray doesn't twist sideways when it bounces: a ray that comes in on this page goes out on this page. That's why a drawing on flat paper is enough to show where light goes.",
        "दूसरा नियम कहता है कि उछलते समय किरण बग़ल में नहीं मुड़ती: जो किरण इस पन्ने पर आती है, वह इसी पन्ने पर जाती है। इसीलिए सपाट कागज़ पर बना चित्र यह दिखाने के लिए काफ़ी है कि प्रकाश कहाँ जाता है।",
      ),
    ),
    w.body(
      t(
        r`These laws hold for **every** reflecting surface, flat or curved. Try it below: aim the beam anywhere. Send it straight down, along the normal. Then $i = 0$, so $r = 0$ too, and the ray goes straight back the way it came.`,
        r`ये नियम **हर** परावर्तक सतह पर लागू होते हैं, सपाट हो या मुड़ी हुई। नीचे आज़माओ: किरण को कहीं भी तानो। उसे सीधे नीचे, अभिलंब के साथ भेजो। तब $i = 0$, तो $r = 0$ भी, और किरण जिस रास्ते आई थी उसी रास्ते सीधी लौट जाती है।`,
      ),
    ),
    room,
    space(),
  ]);
});

/** Object and image: the eye traces light back in straight lines. */
const image = page(
  "image",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "What an image is: light from the tip of the object spreads out; two rays bounce by i = r and reach the eye; the eye traces each back in a straight line, and they seem to come from one point behind the mirror. That point is the image. Moving the eye doesn't move it.",
    );
    const scene = b.prop(mirrorImageDef, "scene", {
      distance: 15,
      height: 8,
      eye: { x: 30, y: 15 },
      rays: 2,
      showExtensions: true,
      showImage: true,
      showDistances: false,
      canMoveEye: true,
    });
    b.studentOnly(scene.action(MirrorImageAction.MoveEye));
    b.standsFor(
      scene,
      "an object 15 cm in front of a plane mirror and an eye: two rays from the object's tip reflect into the eye, and their dashed extensions meet behind the mirror at the image",
    );
    const moved = choiceQuestion(b, {
      name: "moved",
      prompt: t(
        "Drag the eye to a few places. What happens to the point where the dashed lines meet?",
        "आँख को कुछ जगहों पर खिसकाओ। जहाँ बिंदुदार रेखाएँ मिलती हैं, उस बिंदु का क्या होता है?",
      ),
      options: [
        { id: "right", label: t("It stays in the same place", "वह उसी जगह रहता है") },
        {
          id: "follows",
          label: t("It moves with the eye", "वह आँख के साथ चलता है"),
          feedback: t(
            "Look again: different rays reach the eye, but traced back they all meet at the same point behind the mirror.",
            "फिर देखो: आँख तक अलग किरणें पहुँचती हैं, पर पीछे बढ़ाने पर सब पीछे एक ही बिंदु पर मिलती हैं।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Object and image", "वस्तु और प्रतिबिंब")),
      w.body(
        t(
          "Look into a bathroom mirror and there seems to be a whole second room behind the glass, with a second you in it. But behind the glass is only a wall. So what are you seeing? To answer that, follow the light.",
          "बाथरूम के दर्पण में देखो, तो काँच के पीछे एक पूरा दूसरा कमरा दिखता है, उसमें एक दूसरे तुम। पर काँच के पीछे तो बस दीवार है। तो तुम देख क्या रहे हो? इसका उत्तर पाने के लिए प्रकाश का पीछा करो।",
        ),
      ),
      w.definition(
        t(
          "**Object.** The thing in front of the mirror whose light we follow is the **object**. In the picture it's an arrow.",
          "**वस्तु।** दर्पण के सामने वह चीज़ जिसके प्रकाश का हम पीछा करते हैं, **वस्तु** है। चित्र में यह एक तीर है।",
        ),
      ),
      w.body(
        t(
          "Light from the arrow's tip spreads out in every direction. Follow two of those rays: each bounces off the mirror with the angle of incidence equal to the angle of reflection, and reaches the eye. Now the key idea: the eye has no idea the light bounced. It always traces light back **in a straight line**. Traced back, the two rays seem to come from one point **behind** the mirror, and that's where the eye sees the tip. That's your second room: the light seems to come from behind the glass, though none ever goes there.",
          "तीर की नोक से प्रकाश हर दिशा में फैलता है। उनमें से दो किरणों का पीछा करो: हर एक आपतन कोण बराबर परावर्तन कोण के साथ दर्पण से उछलकर आँख तक पहुँचती है। अब मुख्य बात: आँख को पता ही नहीं कि प्रकाश उछला है। वह प्रकाश को हमेशा **सीधी रेखा में** पीछे ले जाती है। पीछे बढ़ाने पर दोनों किरणें दर्पण के **पीछे** एक बिंदु से आती हुई लगती हैं, और आँख को नोक वहीं दिखती है। यही तुम्हारा दूसरा कमरा है: प्रकाश काँच के पीछे से आता लगता है, जबकि वहाँ कभी कोई प्रकाश जाता ही नहीं।",
        ),
      ),
      w.definition(
        t(
          "**Image.** The point where rays from one point of an object meet after reflection, or seem to come from, is the **image** of that point. Every point of the object has its own image point, and together they make the image.",
          "**प्रतिबिंब।** किसी वस्तु के एक बिंदु से आई किरणें परावर्तन के बाद जिस बिंदु पर मिलती हैं, या जहाँ से आती हुई लगती हैं, वह उस बिंदु का **प्रतिबिंब** है। वस्तु के हर बिंदु का अपना प्रतिबिंब-बिंदु होता है, और सब मिलकर प्रतिबिंब बनाते हैं।",
        ),
      ),
      scene,
      moved,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Real and virtual, defined first; then the paper behind the mirror stays dark. */
const realVirtual = page(
  "real-virtual",
  (b) => {
    const w = wordsOn(b);
    const paper = b.prop(mirrorImageDef, "paper", {
      distance: 15,
      height: 8,
      eye: { x: 30, y: 12 },
      rays: 2,
      showExtensions: true,
      showImage: true,
      showDistances: false,
      canMoveEye: false,
      showPaper: true,
    });
    b.standsFor(
      paper,
      "the object, the mirror and a sheet of paper behind the mirror exactly where the image is: the paper stays dark, only the dashed lines pass through it",
    );
    const screen = choiceQuestion(b, {
      name: "screen",
      prompt: t(
        "A sheet of paper is put behind a plane mirror, exactly where the image is. What appears on the paper?",
        "समतल दर्पण के पीछे, ठीक प्रतिबिंब की जगह, एक कागज़ रखा जाता है। कागज़ पर क्या दिखता है?",
      ),
      options: [
        { id: "right", label: t("Nothing: the paper stays dark", "कुछ नहीं: कागज़ अँधेरा रहता है") },
        {
          id: "faint",
          label: t("A faint, blurry image", "एक धुँधला, फीका प्रतिबिंब"),
          feedback: t(
            "Not even faint: no light at all goes behind the mirror.",
            "फीका भी नहीं: दर्पण के पीछे कोई प्रकाश जाता ही नहीं।",
          ),
        },
        {
          id: "sharp",
          label: t("A sharp copy of the object", "वस्तु की साफ़ नक़ल"),
          feedback: t(
            "All the light bounces back in front of the mirror. Only the dashed lines are behind it, and they aren't light.",
            "सारा प्रकाश दर्पण के सामने उछल जाता है। पीछे केवल बिंदुदार रेखाएँ हैं, और वे प्रकाश नहीं हैं।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Real and virtual images", "वास्तविक और आभासी प्रतिबिंब")),
      w.definition(
        t(
          "**Real and virtual.** If the rays **really meet** at the image, the image is **real**. Light actually gets there, so it can be caught on a screen, like a projector's picture on a wall. If the rays only **seem to come from** the image, it is **virtual**. No light gets there, so no screen can catch it: you can only see it by looking into the mirror.",
          "**वास्तविक और आभासी।** यदि किरणें प्रतिबिंब पर **सचमुच मिलती** हैं, तो प्रतिबिंब **वास्तविक** है। प्रकाश सचमुच वहाँ पहुँचता है, इसलिए उसे पर्दे पर लिया जा सकता है, जैसे दीवार पर प्रोजेक्टर की तस्वीर। यदि किरणें प्रतिबिंब से केवल **आती हुई लगती** हैं, तो वह **आभासी** है। वहाँ कोई प्रकाश नहीं पहुँचता, इसलिए कोई पर्दा उसे नहीं पकड़ सकता: उसे केवल दर्पण में देखकर ही देखा जा सकता है।",
        ),
      ),
      w.body(
        t(
          "In a plane mirror the reflected rays spread apart and never meet. Only their dashed extensions meet, behind the mirror. So the image in a plane mirror is **virtual**. The picture shows what happens if you put paper there.",
          "समतल दर्पण में परावर्तित किरणें फैलती जाती हैं और कभी नहीं मिलतीं। केवल उनके बिंदुदार विस्तार दर्पण के पीछे मिलते हैं। इसलिए समतल दर्पण का प्रतिबिंब **आभासी** होता है। चित्र दिखाता है कि वहाँ कागज़ रखने पर क्या होता है।",
        ),
      ),
      paper,
      screen,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The plane mirror's image found by dragging: as far behind, same size, erect. */
const planeImage = page(
  "plane-image",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "The image in a plane mirror, found with the scene: drag the object; the image stays as far behind as the object is in front, the same size and erect.",
    );
    const scene = b.prop(mirrorImageDef, "scene", {
      distance: 12,
      height: 8,
      eye: { x: 30, y: 15 },
      rays: 2,
      showExtensions: true,
      showImage: true,
      showDistances: true,
      canMoveEye: false,
    });
    b.studentOnly(scene.action(MirrorImageAction.MoveObject));
    b.standsFor(
      scene,
      "the object and its image in a plane mirror, with both distances marked on the floor",
    );
    const far = choiceQuestion(b, {
      name: "far",
      prompt: t(
        "Drag the object nearer and farther. Where is the image each time?",
        "वस्तु को पास और दूर खिसकाओ। हर बार प्रतिबिंब कहाँ है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "As far behind the mirror as the object is in front",
            "दर्पण के पीछे उतनी ही दूर जितनी वस्तु सामने है",
          ),
        },
        {
          id: "fixed",
          label: t(
            "Always at the same place behind, wherever the object is",
            "वस्तु कहीं भी हो, पीछे हमेशा एक ही जगह",
          ),
          feedback: t(
            "Watch the two distances on the floor as you drag: the image moves too.",
            "खिसकाते समय फ़र्श पर दोनों दूरियाँ देखो: प्रतिबिंब भी चलता है।",
          ),
        },
        {
          id: "half",
          label: t(
            "Half as far behind the mirror as in front",
            "सामने की दूरी से आधी दूरी पर दर्पण के पीछे",
          ),
          feedback: t(
            "Read the two distances on the floor: they are equal.",
            "फ़र्श पर दोनों दूरियाँ पढ़ो: वे बराबर हैं।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const props = w.definition(
      t(
        "**The image in a plane mirror** is (1) **virtual**, (2) **erect**, the right way up, (3) **the same size** as the object, (4) **as far behind the mirror** as the object is in front, and (5) **laterally inverted**: left and right are swapped. The next page shows what that last one means.",
        "**समतल दर्पण का प्रतिबिंब** (1) **आभासी** होता है, (2) **सीधा** होता है, (3) वस्तु के **बराबर आकार** का होता है, (4) दर्पण के **पीछे उतनी ही दूरी** पर होता है जितनी पर वस्तु सामने है, और (5) **पार्श्व उल्टा** होता है: बायाँ और दायाँ अदल-बदल जाते हैं। अगला पन्ना दिखाता है कि आख़िरी बात का क्या अर्थ है।",
      ),
      "props",
      { isHidden: true },
    );
    const twoM = choiceQuestion(b, {
      name: "twoM",
      prompt: t(
        "You stand 2 m in front of a plane mirror. How far are you from your image?",
        "तुम समतल दर्पण के सामने 2 मीटर पर खड़े हो। तुम अपने प्रतिबिंब से कितनी दूर हो?",
      ),
      options: [
        { id: "right", label: t("4 m", "4 मीटर") },
        {
          id: "two",
          label: t("2 m", "2 मीटर"),
          feedback: t(
            "2 m is your distance from the mirror. The image is another 2 m behind it, so add the two.",
            "2 मीटर तुम्हारी दर्पण से दूरी है। प्रतिबिंब उसके पीछे और 2 मीटर पर है, इसलिए दोनों जोड़ो।",
          ),
        },
        {
          id: "one",
          label: t("1 m", "1 मीटर"),
          feedback: t(
            "The image is as far behind the mirror as you are in front, not half as far.",
            "प्रतिबिंब दर्पण के पीछे उतनी ही दूर है जितने तुम सामने हो, आधी दूर नहीं।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
    });
    b.when(far.on(QuestionSignal.Correct), [theBoard.show(props), theBoard.show(twoM)]);
    return column([
      w.title(t("The image in a plane mirror", "समतल दर्पण में प्रतिबिंब")),
      w.body(
        t(
          "Every point of the object has its image found the same way, so the whole object has an image. Where is it, and how big? Drag the object and read the floor.",
          "वस्तु के हर बिंदु का प्रतिबिंब इसी तरह मिलता है, इसलिए पूरी वस्तु का प्रतिबिंब बनता है। वह कहाँ है, और कितना बड़ा? वस्तु को खिसकाओ और फ़र्श पढ़ो।",
        ),
      ),
      scene,
      far,
      props,
      twoM,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Lateral inversion, shown: raise a hand, read a word, then the ambulance trick. */
const lateral = page(
  "lateral",
  (b) => {
    const w = wordsOn(b);
    const mirror = b.prop(lateralMirrorDef, "mirror", {
      word: "RIYA",
      raised: "none",
      writing: "normal",
    });
    b.studentOnly(mirror.action(LateralMirrorAction.Raise));
    b.studentOnly(mirror.action(LateralMirrorAction.SetWord));
    b.studentOnly(mirror.action(LateralMirrorAction.SetWriting));
    b.standsFor(
      mirror,
      "a girl in front of a big mirror with a word on her T-shirt; her reflection shows the word backwards and raises the opposite hand",
    );
    const hand = choiceQuestion(b, {
      name: "hand",
      prompt: t(
        "Raise her right hand. Which hand does the girl in the mirror raise, from her own point of view?",
        "उसका दायाँ हाथ उठाओ। दर्पण वाली लड़की अपनी नज़र से कौन-सा हाथ उठाती है?",
      ),
      options: [
        { id: "right", label: t("Her left hand", "अपना बायाँ हाथ") },
        {
          id: "same",
          label: t("Her right hand", "अपना दायाँ हाथ"),
          feedback: t(
            "Imagine standing where the reflection stands, facing out of the mirror: the raised hand is on your left.",
            "सोचो कि तुम प्रतिबिंब की जगह खड़े हो, दर्पण से बाहर की ओर मुँह करके: उठा हुआ हाथ तुम्हारे बाईं ओर है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const swapped = w.definition(
      t(
        "**Lateral inversion.** In a plane mirror, left and right are swapped. Your right hand becomes the image's left hand, and writing reads backwards. This is **lateral inversion**: *lateral* means sideways.",
        "**पार्श्व उत्क्रमण।** समतल दर्पण में बायाँ और दायाँ अदल-बदल जाते हैं। तुम्हारा दायाँ हाथ प्रतिबिंब का बायाँ हाथ बन जाता है, और लिखावट उल्टी पढ़ी जाती है। यह **पार्श्व उत्क्रमण** है: *पार्श्व* का अर्थ है बग़ल।",
      ),
      "swapped",
      { isHidden: true },
    );
    const ambulance = choiceQuestion(b, {
      name: "ambulance",
      prompt: t(
        "Switch the word to AMBULANCE, then try both ways of printing it. Why is AMBULANCE painted back to front on the front of an ambulance?",
        "शब्द को AMBULANCE करो, फिर उसे छापने के दोनों तरीक़े आज़माओ। एम्बुलेंस के आगे AMBULANCE उल्टा क्यों लिखा होता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "So the driver in front reads it the right way in the rear-view mirror",
            "ताकि आगे वाला चालक उसे पीछे देखने वाले दर्पण में सीधा पढ़ सके",
          ),
        },
        {
          id: "style",
          label: t(
            "Just for style, to look different from other vans",
            "बस दिखावे के लिए, दूसरी गाड़ियों से अलग दिखने को",
          ),
          feedback: t(
            "Look at the reflection when the word is printed backwards: it reads correctly.",
            "जब शब्द उल्टा छपा हो तब प्रतिबिंब देखो: वह सीधा पढ़ा जाता है।",
          ),
        },
        {
          id: "people",
          label: t(
            "So people walking in front of it can read it the right way",
            "ताकि आगे पैदल चलते लोग उसे सीधा पढ़ सकें",
          ),
          feedback: t(
            "People looking straight at it would read it backwards. It is meant to be read in a mirror.",
            "सीधे देखने वालों को यह उल्टा दिखेगा। यह दर्पण में पढ़ने के लिए है।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
    });
    b.when(hand.on(QuestionSignal.Correct), [theBoard.show(swapped), theBoard.show(ambulance)]);
    b.witness(mirror.learner(LateralMirrorAction.Raise, { hand: "right" }));
    return column([
      w.title(t("Left and right swap", "बायाँ-दायाँ अदल-बदल")),
      w.body(
        t(
          "The image in a plane mirror is the same size and the right way up, but something is odd about it. Use the buttons: raise a hand, and change the word.",
          "समतल दर्पण का प्रतिबिंब बराबर आकार का और सीधा होता है, पर उसमें कुछ अजीब है। बटन आज़माओ: एक हाथ उठाओ, और शब्द बदलो।",
        ),
      ),
      mirror,
      hand,
      swapped,
      ambulance,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** Back to the story: the charger explained; can a plane mirror be the projector? */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const room = b.prop(lightSceneDef, "room", {
      scene: SceneKind.PowerCut,
      isLit: false,
      canToggle: true,
    });
    b.studentOnly(room.action(SceneAction.ToggleTorch));
    b.standsFor(
      room,
      "the dark room again, with a torch that can be switched on to light the charger",
    );
    const charger = choiceQuestion(b, {
      name: "charger",
      prompt: t(
        "So why couldn't Riya see the charger in the power cut?",
        "तो बिजली जाने पर रिया को चार्जर क्यों नहीं दिखा?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "No light fell on it, so no light bounced off it into her eyes",
            "उस पर कोई प्रकाश नहीं पड़ा, इसलिए कोई प्रकाश उछलकर उसकी आँखों तक नहीं गया",
          ),
        },
        {
          id: "eyes",
          label: t("Eyes don't work in the dark", "अँधेरे में आँखें काम नहीं करतीं"),
          feedback: t(
            "Her eyes are fine: switch the torch on and she sees it at once.",
            "उसकी आँखें ठीक हैं: टॉर्च जलाओ और उसे तुरंत दिख जाता है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const torch = w.body(
      t(
        "Tap the torch. Light travels in a straight line to the charger, bounces off it in every direction, and some of it reaches her eyes. Charger found, phone saved.",
        "टॉर्च पर टैप करो। प्रकाश सीधी रेखा में चार्जर तक जाता है, उससे हर दिशा में उछलता है, और उसका कुछ हिस्सा उसकी आँखों तक पहुँचता है। चार्जर मिल गया, फ़ोन बच गया।",
      ),
      "torch",
      { isHidden: true },
    );
    const wall = choiceQuestion(b, {
      name: "wall",
      prompt: t(
        "Kabir props up a big plane mirror in front of the phone. Will the movie appear on the wall behind him?",
        "कबीर फ़ोन के सामने एक बड़ा समतल दर्पण टिका देता है। क्या उसके पीछे की दीवार पर फ़िल्म दिखेगी?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "No: the image is virtual, so no wall can catch it",
            "नहीं: प्रतिबिंब आभासी है, इसलिए कोई दीवार उसे पकड़ नहीं सकती",
          ),
        },
        {
          id: "big",
          label: t("Yes, and bigger, because the mirror is big", "हाँ, और बड़ी, क्योंकि दर्पण बड़ा है"),
          feedback: t(
            "A plane mirror's image is the same size, and it is virtual: no light actually gets to where it seems to be.",
            "समतल दर्पण का प्रतिबिंब बराबर आकार का होता है, और आभासी: जहाँ वह दिखता है वहाँ सचमुच कोई प्रकाश नहीं पहुँचता।",
          ),
        },
        {
          id: "same",
          label: t(
            "Yes, the same size as on the phone, just upright",
            "हाँ, फ़ोन जितनी ही बड़ी, बस सीधी",
          ),
          feedback: t(
            "Same size, yes, but the image is virtual. Remember the paper behind the mirror: it stayed dark.",
            "बराबर आकार, हाँ, पर प्रतिबिंब आभासी है। दर्पण के पीछे का कागज़ याद करो: वह अँधेरा ही रहा।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const stop = w.definition(
      t(
        "**Stop 1 done.** We know how we see, and how a flat mirror makes an image. But a flat mirror can't be our projector: its image is virtual and no bigger. We need an image that is **real**, so it lands on the wall, and **bigger**. Next stop: mirrors that are curved.",
        "**पड़ाव 1 पूरा।** हम जानते हैं कि हम कैसे देखते हैं, और सपाट दर्पण प्रतिबिंब कैसे बनाता है। पर सपाट दर्पण हमारा प्रोजेक्टर नहीं बन सकता: उसका प्रतिबिंब आभासी है और बड़ा नहीं होता। हमें ऐसा प्रतिबिंब चाहिए जो **वास्तविक** हो, ताकि दीवार पर उतरे, और **बड़ा** हो। अगला पड़ाव: मुड़े हुए दर्पण।",
      ),
      "stop",
      { isHidden: true },
    );
    b.when(charger.on(QuestionSignal.Correct), [theBoard.show(torch), theBoard.show(wall)]);
    b.when(wall.on(QuestionSignal.Correct), [theBoard.show(stop), theBoard.pass()]);
    return column([
      w.title(t("Back to the power cut", "फिर बिजली गुल")),
      room,
      charger,
      torch,
      wall,
      stop,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Two worked angles, each with its figure. */
const examples = page("examples", (b) => {
  const w = wordsOn(b);
  const fig1 = b.prop(rayAngleDef, "fig1", {
    i: 30,
    showReflected: true,
    normalLabel: "value",
    surfaceLabel: null,
    reflectLabel: "?",
    betweenLabel: "?",
  });
  b.standsFor(
    fig1,
    "a ray at 30° to the normal of a plane mirror; the angle of reflection and the angle between the two rays marked with question marks",
  );
  const fig2 = b.prop(rayAngleDef, "fig2", {
    i: 65,
    showReflected: true,
    normalLabel: "?",
    surfaceLabel: "value",
    reflectLabel: "?",
    betweenLabel: null,
  });
  b.standsFor(
    fig2,
    "a ray making 25° with the mirror's surface; the angles with the normal marked with question marks",
  );
  return column([
    w.title(t("Two examples", "दो उदाहरण")),
    w.body(
      t(
        "**A ray strikes a plane mirror at 30° to the normal. Find the angle of reflection, and the angle between the incident and reflected rays.**",
        "**एक किरण समतल दर्पण पर अभिलंब से 30° पर पड़ती है। परावर्तन कोण, और आपतित व परावर्तित किरणों के बीच का कोण ज्ञात करो।**",
      ),
    ),
    fig1,
    w.body(
      t(
        r`The angle is already measured from the normal, so the angle of incidence is 30°. By the first law: $$r = i = 30°$$ The two rays are on opposite sides of the normal, so the angle between them is $$i + r = 30° + 30° = 60°$$`,
        r`कोण पहले से अभिलंब से नापा गया है, इसलिए आपतन कोण 30° है। पहले नियम से: $$r = i = 30°$$ दोनों किरणें अभिलंब के दोनों ओर हैं, इसलिए उनके बीच का कोण है $$i + r = 30° + 30° = 60°$$`,
      ),
    ),
    w.body(
      t(
        "**A ray makes an angle of 25° with the surface of a plane mirror. Find the angle of reflection.**",
        "**एक किरण समतल दर्पण की सतह से 25° का कोण बनाती है। परावर्तन कोण ज्ञात करो।**",
      ),
    ),
    fig2,
    w.body(
      t(
        r`This angle is from the **surface**, not the normal. In the figure, the 25° and the angle of incidence together make the right angle between the surface and the normal. So $$i = 90° - 25° = 65°$$ By the first law: $$r = i = 65°$$`,
        r`यह कोण **सतह** से है, अभिलंब से नहीं। चित्र में 25° और आपतन कोण मिलकर सतह और अभिलंब के बीच का समकोण बनाते हैं। इसलिए $$i = 90° - 25° = 65°$$ पहले नियम से: $$r = i = 65°$$`,
      ),
    ),
    w.note(
      t(
        'When a question says "with the mirror" or "with the surface", take it away from 90° first.',
        'जब प्रश्न "दर्पण से" या "सतह से" कहे, तो पहले उसे 90° में से घटाओ।',
      ),
    ),
    space(),
  ]);
});

/** Your turn, with its figure; then the mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const fig = b.prop(rayAngleDef, "fig", {
      i: 50,
      showReflected: true,
      normalLabel: null,
      surfaceLabel: "value",
      reflectLabel: "?",
      betweenLabel: null,
    });
    b.standsFor(
      fig,
      "a ray making 40° with the mirror's surface; the angle of reflection marked with a question mark",
    );
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "A ray makes 40° with the surface of a plane mirror. What is the angle of reflection?",
        "एक किरण समतल दर्पण की सतह से 40° बनाती है। परावर्तन कोण क्या है?",
      ),
      options: [
        { id: "right", label: t("50°", "50°") },
        {
          id: "forty",
          label: t("40°", "40°"),
          feedback: t(
            "40° is the angle with the surface. The angle of reflection is measured from the normal: 90° − 40°.",
            "40° सतह से बना कोण है। परावर्तन कोण अभिलंब से नापा जाता है: 90° − 40°।",
          ),
        },
        {
          id: "hundred",
          label: t("100°", "100°"),
          feedback: t(
            "100° is the angle between the two rays. The question asks for the angle of reflection alone.",
            "100° दोनों किरणों के बीच का कोण है। प्रश्न अकेला परावर्तन कोण पूछता है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ We see things by the light they reflect into our eyes. ✓ Light travels in straight lines and bounces with the angle of incidence equal to the angle of reflection. ✗ A plane mirror can't project: its image is virtual, the same size, and laterally inverted. Next: a mirror that's curved.",
        "**मिशन लॉग।** ✓ हम चीज़ों को उनके द्वारा हमारी आँखों तक परावर्तित प्रकाश से देखते हैं। ✓ प्रकाश सीधी रेखाओं में चलता है और आपतन कोण बराबर परावर्तन कोण के साथ उछलता है। ✗ समतल दर्पण प्रोजेक्ट नहीं कर सकता: उसका प्रतिबिंब आभासी, बराबर आकार का, और पार्श्व उल्टा है। आगे: मुड़ा हुआ दर्पण।",
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
  hook,
  dark,
  why,
  howWeSee,
  straight,
  through,
  names,
  star,
  laws,
  image,
  realVirtual,
  planeImage,
  lateral,
  inLife,
  examples,
  yourTurn,
];

void LateralMirrorDerived;

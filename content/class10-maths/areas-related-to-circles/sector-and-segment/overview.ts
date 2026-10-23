import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, goalQuestion, wordsOn } from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  CirclesSceneKind,
  PiValue,
  SectorAction,
  SectorShow,
  sectorSegmentDef,
} from "@chalk/prop-circles";
import { sceneOn } from "../kit";

const r = String.raw;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** The mudguard covers only a slice of the wheel; the reflector is cut off by a straight edge. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const back = sceneOn(
    b,
    "back",
    CirclesSceneKind.Mudguard,
    "the back of Kabir's cycle: the mudguard covers a slice of the wheel between two spokes, and a red reflector on the spokes is cut off by a straight edge; Riya measures the mudguard's angle with a protractor",
  );
  return column([
    w.title(t("Only a slice", "बस एक टुकड़ा")),
    back,
    w.body(
      t(
        "Last time we found the whole wheel: 220 cm round, πr² inside. But the mudguard doesn't run all the way round. It sits over just a slice of the wheel between two spokes, like a piece of pizza. And the red reflector is a different shape again: a curved edge cut off by a straight one.",
        "पिछली बार हमने पूरा पहिया निकाला: 220 cm परिधि, अंदर πr²। पर मडगार्ड पूरे पहिये पर नहीं चलता। वह दो तीलियों के बीच पहिये के बस एक टुकड़े के ऊपर है, पिज़्ज़ा के टुकड़े की तरह। और लाल रिफ़्लेक्टर फिर एक अलग आकार है: एक वक्र किनारा, जिसे एक सीधा किनारा काटता है।",
      ),
    ),
    w.body(
      t(
        "Riya puts a protractor on the mudguard. If she knows its angle, can she find how long its curved strip is?",
        "रिया मडगार्ड पर चाँदा रखती है। अगर उसे इसका कोण पता हो, तो क्या वह निकाल सकती है कि इसकी वक्र पट्टी कितनी लंबी है?",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Sector, segment; minor and major. */
const parts = page(
  "parts",
  (b) => {
    const w = wordsOn(b);
    const slice = b.prop(sectorSegmentDef, "slice", {
      r: 21,
      theta: 120,
      step: 15,
      show: SectorShow.Sector,
      showMajor: false,
      showArc: false,
      pi: PiValue.Sevenths,
      canTurn: true,
      showWorking: false,
    });
    b.studentOnly(slice.action(SectorAction.Turn));
    b.studentOnly(slice.action(SectorAction.SetAngle));
    b.standsFor(
      slice,
      "a circle with centre O and radii OA and OB; the sector OAB between the two radii and the arc is shaded, and the learner turns OB to change the angle AOB",
    );
    const which = choiceQuestion(b, {
      name: "which",
      prompt: t(
        "The red reflector is the part of a circle between a chord and its arc. What is it?",
        "लाल रिफ़्लेक्टर वृत्त का वह भाग है जो एक जीवा और उसके चाप के बीच है। यह क्या है?",
      ),
      options: [
        { id: "right", label: t("A segment", "एक वृत्तखंड") },
        {
          id: "sector",
          label: t("A sector", "एक त्रिज्यखंड"),
          feedback: t(
            "A sector is bounded by two radii and an arc. The reflector has a chord, a straight line across the circle, instead of radii.",
            "त्रिज्यखंड दो त्रिज्याओं और एक चाप से घिरा होता है। रिफ़्लेक्टर में त्रिज्याओं की जगह एक जीवा है, वृत्त के आर-पार एक सीधी रेखा।",
          ),
        },
        {
          id: "quadrant",
          label: t("A quadrant", "एक चतुर्थांश"),
          feedback: t(
            "A quadrant is a sector with a 90° angle: two radii and an arc. The reflector is cut off by a chord.",
            "चतुर्थांश 90° कोण वाला त्रिज्यखंड है: दो त्रिज्याएँ और एक चाप। रिफ़्लेक्टर एक जीवा से कटा है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Slices of a circle", "वृत्त के टुकड़े")),
      w.definition(
        t(
          "**Sector.** The part of a circle enclosed by two radii and the arc between them is a **sector**. The angle between the two radii, ∠AOB, is the **angle of the sector**. The smaller sector is the **minor sector**; the rest of the circle, with angle 360° − ∠AOB, is the **major sector**.",
          "**त्रिज्यखंड।** दो त्रिज्याओं और उनके बीच के चाप से घिरा वृत्त का भाग **त्रिज्यखंड** है। दोनों त्रिज्याओं के बीच का कोण, ∠AOB, **त्रिज्यखंड का कोण** है। छोटा त्रिज्यखंड **लघु त्रिज्यखंड** है; बाक़ी वृत्त, जिसका कोण 360° − ∠AOB है, **दीर्घ त्रिज्यखंड** है।",
        ),
      ),
      slice,
      w.definition(
        t(
          "**Segment.** A **chord** is a straight line joining two points of a circle. The part of the circle between a chord and its arc is a **segment**. The smaller one is the **minor segment**, the larger the **major segment**. When we just say sector or segment, we mean the minor one.",
          "**वृत्तखंड।** **जीवा** वृत्त के दो बिंदुओं को जोड़ने वाली सीधी रेखा है। जीवा और उसके चाप के बीच का वृत्त का भाग **वृत्तखंड** है। छोटा **लघु वृत्तखंड**, बड़ा **दीर्घ वृत्तखंड** है। जब हम सिर्फ़ त्रिज्यखंड या वृत्तखंड कहते हैं, तो उसका मतलब लघु वाला है।",
        ),
      ),
      which,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Area of a sector and length of its arc, by the unitary method. */
const sector = page(
  "sector",
  (b) => {
    const w = wordsOn(b);
    const slice = b.prop(sectorSegmentDef, "slice", {
      r: 14,
      theta: 120,
      step: 15,
      show: SectorShow.Sector,
      showMajor: false,
      showArc: true,
      pi: PiValue.Sevenths,
      canTurn: true,
      showWorking: true,
    });
    b.studentOnly(slice.action(SectorAction.Turn));
    b.studentOnly(slice.action(SectorAction.SetAngle));
    b.standsFor(
      slice,
      "a sector of a circle of radius 14 cm with its area θ/360 × πr² and its arc length θ/360 × 2πr worked out as the learner turns the angle",
    );
    const goal = goalQuestion(b, {
      about: slice,
      prompt: t(
        "Turn the angle to 90°: a quarter of the circle.",
        "कोण को 90° पर घुमाओ: वृत्त का एक चौथाई।",
      ),
      isMet: slice.field("theta").eq(90),
      solve: [
        slice.learner(SectorAction.Turn, { by: -1 }),
        slice.learner(SectorAction.Turn, { by: -1 }),
      ],
    });
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        r`What is the area of this quarter circle, with $r = 14$ cm?`,
        r`$r = 14$ cm वाले इस चौथाई वृत्त का क्षेत्रफल क्या है?`,
      ),
      options: [
        { id: "right", label: t("154 cm²", "154 cm²") },
        {
          id: "616",
          label: t("616 cm²", "616 cm²"),
          feedback: t(
            r`616 cm² is the whole circle, $\pi \times 14^2$. A 90° sector is $\frac{90}{360} = \frac{1}{4}$ of it.`,
            r`616 cm² पूरा वृत्त है, $\pi \times 14^2$। 90° का त्रिज्यखंड इसका $\frac{90}{360} = \frac{1}{4}$ है।`,
          ),
        },
        {
          id: "22",
          label: t("22 cm²", "22 cm²"),
          feedback: t(
            r`22 cm is the arc length, $\frac{1}{4} \times 2\pi r$, and it's a length. The area uses $\pi r^2$.`,
            r`22 cm चाप की लंबाई है, $\frac{1}{4} \times 2\pi r$, और यह लंबाई है। क्षेत्रफल में $\pi r^2$ लगता है।`,
          ),
        },
      ],
      answer: "right",
      isHidden: true,
    });
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(ask));
    return column([
      w.title(t("How big is a sector?", "त्रिज्यखंड कितना बड़ा है?")),
      w.body(
        t(
          r`Think of the whole circle as a sector with angle 360°. Then use the unitary method: $$360° \;\to\; \pi r^2$$ $$1° \;\to\; \frac{\pi r^2}{360}$$ $$\theta \;\to\; \frac{\theta}{360} \times \pi r^2$$`,
          r`पूरे वृत्त को 360° कोण वाला त्रिज्यखंड मानो। फिर ऐकिक नियम लगाओ: $$360° \;\to\; \pi r^2$$ $$1° \;\to\; \frac{\pi r^2}{360}$$ $$\theta \;\to\; \frac{\theta}{360} \times \pi r^2$$`,
        ),
      ),
      w.definition(
        t(
          r`**Sector and arc.** For a circle of radius $r$ and a sector of angle $\theta$ degrees: $$\text{area of the sector} = \frac{\theta}{360} \times \pi r^2$$ The same reasoning with the circumference gives $$\text{length of the arc} = \frac{\theta}{360} \times 2\pi r$$`,
          r`**त्रिज्यखंड और चाप।** त्रिज्या $r$ के वृत्त और $\theta$ डिग्री कोण वाले त्रिज्यखंड के लिए: $$\text{त्रिज्यखंड का क्षेत्रफल} = \frac{\theta}{360} \times \pi r^2$$ यही तर्क परिधि के साथ देता है $$\text{चाप की लंबाई} = \frac{\theta}{360} \times 2\pi r$$`,
        ),
      ),
      slice,
      goal,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Segment = sector − triangle; Example 3. */
const segment = page(
  "segment",
  (b) => {
    const w = wordsOn(b);
    const cut = b.prop(sectorSegmentDef, "cut", {
      r: 21,
      theta: 120,
      step: 15,
      show: SectorShow.Segment,
      showMajor: false,
      showArc: false,
      pi: PiValue.Sevenths,
      canTurn: false,
      showWorking: true,
    });
    b.standsFor(
      cut,
      "a circle of radius 21 cm with ∠AOB = 120°; the segment between the chord AB and the arc is shaded, worked out as the sector OAB minus the triangle OAB",
    );
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "Why is the area of the segment the sector minus the triangle?",
        "वृत्तखंड का क्षेत्रफल त्रिज्यखंड घटा त्रिभुज क्यों है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "The sector is the triangle OAB plus the segment",
            "त्रिज्यखंड, त्रिभुज OAB और वृत्तखंड का योग है",
          ),
        },
        {
          id: "plus",
          label: t(
            "The segment is the triangle OAB plus the sector",
            "वृत्तखंड, त्रिभुज OAB और त्रिज्यखंड का योग है",
          ),
          feedback: t(
            "The segment is smaller than the sector, so it can't contain it. Cut the sector along the chord AB: one piece is the triangle, the other is the segment.",
            "वृत्तखंड त्रिज्यखंड से छोटा है, तो उसमें त्रिज्यखंड नहीं समा सकता। त्रिज्यखंड को जीवा AB पर काटो: एक भाग त्रिभुज है, दूसरा वृत्तखंड।",
          ),
        },
        {
          id: "half",
          label: t(
            "The triangle OAB is always half of the sector",
            "त्रिभुज OAB हमेशा त्रिज्यखंड का आधा होता है",
          ),
          feedback: t(
            "Not always: here the sector is 462 cm² and the triangle about 191 cm². The chord AB just splits the sector into the triangle and the segment.",
            "हमेशा नहीं: यहाँ त्रिज्यखंड 462 cm² और त्रिभुज लगभग 191 cm² है। जीवा AB बस त्रिज्यखंड को त्रिभुज और वृत्तखंड में बाँटती है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("The area of a segment", "वृत्तखंड का क्षेत्रफल")),
      w.body(
        t(
          "The chord AB cuts the sector OAB into two pieces: the triangle OAB and the segment. So the segment is what is left of the sector when the triangle is taken away.",
          "जीवा AB त्रिज्यखंड OAB को दो भागों में काटती है: त्रिभुज OAB और वृत्तखंड। तो वृत्तखंड वह है जो त्रिज्यखंड में से त्रिभुज हटाने पर बचता है।",
        ),
      ),
      w.definition(
        t(
          r`**Area of a segment.** $$\text{segment} = \text{sector } OAB - \triangle OAB$$ $$= \frac{\theta}{360} \times \pi r^2 - \text{area of } \triangle OAB$$`,
          r`**वृत्तखंड का क्षेत्रफल।** $$\text{वृत्तखंड} = \text{त्रिज्यखंड } OAB - \triangle OAB$$ $$= \frac{\theta}{360} \times \pi r^2 - \triangle OAB \text{ का क्षेत्रफल}$$`,
        ),
      ),
      cut,
      w.body(
        t(
          r`**Example 3.** $r = 21$ cm, $\angle AOB = 120°$. The sector: $$\frac{120}{360} \times \frac{22}{7} \times 21 \times 21 = 462 \text{ cm}^2$$ For the triangle, draw $OM \perp AB$. Then $\angle AOM = 60°$, so $$OM = 21 \cos 60° = \frac{21}{2}$$ $$AM = 21 \sin 60° = \frac{21\sqrt{3}}{2}, \quad AB = 21\sqrt{3}$$ $$\triangle OAB = \tfrac{1}{2} \times 21\sqrt{3} \times \frac{21}{2} = \frac{441}{4}\sqrt{3}$$ So the segment is $\left(462 - \frac{441}{4}\sqrt{3}\right)$ cm².`,
          r`**उदाहरण 3।** $r = 21$ cm, $\angle AOB = 120°$। त्रिज्यखंड: $$\frac{120}{360} \times \frac{22}{7} \times 21 \times 21 = 462 \text{ cm}^2$$ त्रिभुज के लिए $OM \perp AB$ खींचो। तब $\angle AOM = 60°$, तो $$OM = 21 \cos 60° = \frac{21}{2}$$ $$AM = 21 \sin 60° = \frac{21\sqrt{3}}{2}, \quad AB = 21\sqrt{3}$$ $$\triangle OAB = \tfrac{1}{2} \times 21\sqrt{3} \times \frac{21}{2} = \frac{441}{4}\sqrt{3}$$ तो वृत्तखंड $\left(462 - \frac{441}{4}\sqrt{3}\right)$ cm² है।`,
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Major sector and major segment; Example 2. */
const major = page(
  "major",
  (b) => {
    const w = wordsOn(b);
    const big = b.prop(sectorSegmentDef, "big", {
      r: 4,
      theta: 30,
      step: 15,
      show: SectorShow.Sector,
      showMajor: true,
      showArc: false,
      pi: PiValue.Decimal,
      canTurn: false,
      showWorking: true,
    });
    b.standsFor(
      big,
      "a circle of radius 4 cm with a 30° sector; the major sector, the rest of the circle with angle 330°, is shaded",
    );
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "A minor sector has angle 30°. What is the angle of the major sector?",
        "एक लघु त्रिज्यखंड का कोण 30° है। दीर्घ त्रिज्यखंड का कोण क्या है?",
      ),
      options: [
        { id: "right", label: t("330°", "330°") },
        {
          id: "150",
          label: t("150°", "150°"),
          feedback: t(
            "150° = 180° − 30°, but the two sectors fill the whole circle, 360°.",
            "150° = 180° − 30°, पर दोनों त्रिज्यखंड पूरा वृत्त भरते हैं, 360°।",
          ),
        },
        {
          id: "60",
          label: t("60°", "60°"),
          feedback: t(
            "The major sector is the rest of the circle: 360° − 30° = 330°.",
            "दीर्घ त्रिज्यखंड बाक़ी पूरा वृत्त है: 360° − 30° = 330°।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("The bigger pieces", "बड़े टुकड़े")),
      w.definition(
        t(
          r`**Major sector and segment.** Each is the whole circle less its minor partner: $$\text{major sector} = \pi r^2 - \text{minor sector}$$ $$\text{major segment} = \pi r^2 - \text{minor segment}$$`,
          r`**दीर्घ त्रिज्यखंड और वृत्तखंड।** हर एक पूरा वृत्त घटा उसका लघु साथी है: $$\text{दीर्घ त्रिज्यखंड} = \pi r^2 - \text{लघु त्रिज्यखंड}$$ $$\text{दीर्घ वृत्तखंड} = \pi r^2 - \text{लघु वृत्तखंड}$$`,
        ),
      ),
      big,
      w.body(
        t(
          r`**Example 2.** $r = 4$ cm, $\theta = 30°$, $\pi = 3.14$. $$\text{sector} = \frac{30}{360} \times 3.14 \times 16 = 4.19 \text{ cm}^2$$ $$\text{major sector} = 3.14 \times 16 - 4.19 = 46.1 \text{ cm}^2$$ Or directly, with angle $360° - 30° = 330°$: $$\frac{330}{360} \times 3.14 \times 16 = 46.1 \text{ cm}^2$$`,
          r`**उदाहरण 2।** $r = 4$ cm, $\theta = 30°$, $\pi = 3.14$। $$\text{त्रिज्यखंड} = \frac{30}{360} \times 3.14 \times 16 = 4.19 \text{ cm}^2$$ $$\text{दीर्घ त्रिज्यखंड} = 3.14 \times 16 - 4.19 = 46.1 \text{ cm}^2$$ या सीधे, कोण $360° - 30° = 330°$ से: $$\frac{330}{360} \times 3.14 \times 16 = 46.1 \text{ cm}^2$$`,
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

/** The mudguard: a 90° sector of the 35 cm wheel. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const guard = b.prop(sectorSegmentDef, "guard", {
      r: 35,
      theta: 90,
      step: 15,
      show: SectorShow.Sector,
      showMajor: false,
      showArc: true,
      pi: PiValue.Sevenths,
      canTurn: false,
      showWorking: true,
    });
    b.standsFor(
      guard,
      "the 90° slice of the 35 cm wheel under the mudguard, with the mudguard's curved strip (the arc) marked",
    );
    const strip = choiceQuestion(b, {
      name: "strip",
      prompt: t(
        "How long is the mudguard's curved strip, along the arc?",
        "मडगार्ड की वक्र पट्टी, चाप के साथ-साथ, कितनी लंबी है?",
      ),
      options: [
        { id: "right", label: t("55 cm", "55 cm") },
        {
          id: "220",
          label: t("220 cm", "220 cm"),
          feedback: t(
            r`220 cm is the whole rim. The strip covers $\frac{90}{360} = \frac{1}{4}$ of it.`,
            r`220 cm पूरी परिधि है। पट्टी उसका $\frac{90}{360} = \frac{1}{4}$ ढकती है।`,
          ),
        },
        {
          id: "962",
          label: t("962.5 cm", "962.5 cm"),
          feedback: t(
            r`962.5 is the sector's area in cm². The strip is a length: $\frac{90}{360} \times 2\pi r$.`,
            r`962.5, त्रिज्यखंड का क्षेत्रफल cm² में है। पट्टी एक लंबाई है: $\frac{90}{360} \times 2\pi r$।`,
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const reflector = b.prop(sectorSegmentDef, "reflector", {
      r: 7,
      theta: 90,
      step: 15,
      show: SectorShow.Segment,
      showMajor: false,
      showArc: false,
      pi: PiValue.Sevenths,
      canTurn: false,
      showWorking: true,
    });
    b.standsFor(
      reflector,
      "the red reflector as the minor segment of a 7 cm circle, cut off by a chord that makes 90° at the centre",
    );
    const red = choiceQuestion(b, {
      name: "red",
      prompt: t(
        "The reflector is a segment of a 7 cm circle, its chord making 90° at the centre. What is its area?",
        "रिफ़्लेक्टर 7 cm वृत्त का एक वृत्तखंड है, जिसकी जीवा केंद्र पर 90° बनाती है। उसका क्षेत्रफल क्या है?",
      ),
      options: [
        { id: "right", label: t("14 cm²", "14 cm²") },
        {
          id: "sector",
          label: t("38.5 cm²", "38.5 cm²"),
          feedback: t(
            r`38.5 cm² is the whole 90° sector. The reflector stops at the chord, so take away the triangle, $\tfrac{1}{2} \times 7 \times 7 = 24.5$.`,
            r`38.5 cm² पूरा 90° त्रिज्यखंड है। रिफ़्लेक्टर जीवा पर रुकता है, इसलिए त्रिभुज घटाओ, $\tfrac{1}{2} \times 7 \times 7 = 24.5$।`,
          ),
        },
        {
          id: "triangle",
          label: t("24.5 cm²", "24.5 cm²"),
          feedback: t(
            "24.5 cm² is the triangle. The reflector is the sector less the triangle: 38.5 − 24.5.",
            "24.5 cm² त्रिभुज है। रिफ़्लेक्टर त्रिज्यखंड घटा त्रिभुज है: 38.5 − 24.5।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Back to the cycle", "फिर साइकिल पर")),
      w.body(
        t(
          "The protractor reads 90°: the mudguard runs over a quarter of the 35 cm wheel. It is a curved strip, so what Riya needs for it is a length, the arc.",
          "चाँदा 90° दिखाता है: मडगार्ड 35 cm पहिये के एक चौथाई के ऊपर चलता है। यह एक वक्र पट्टी है, इसलिए रिया को इसकी लंबाई, यानी चाप, चाहिए।",
        ),
      ),
      guard,
      strip,
      w.body(
        t(
          "The red reflector is a flat piece with an area. Riya measures it: a circle of radius 7 cm, cut off by a chord that makes 90° at the centre.",
          "लाल रिफ़्लेक्टर एक चपटा टुकड़ा है जिसका क्षेत्रफल है। रिया उसे नापती है: 7 cm त्रिज्या का वृत्त, जिसे एक जीवा काटती है जो केंद्र पर 90° बनाती है।",
        ),
      ),
      reflector,
      red,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Exercise 12.2 Q1 worked; Q4 (i) to try; the mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const minor = choiceQuestion(b, {
      name: "minor",
      prompt: t(
        r`A chord of a circle of radius 10 cm makes a right angle at the centre. Find the minor segment. ($\pi = 3.14$)`,
        r`10 cm त्रिज्या के वृत्त की एक जीवा केंद्र पर समकोण बनाती है। लघु वृत्तखंड ज्ञात करो। ($\pi = 3.14$)`,
      ),
      options: [
        { id: "right", label: t("28.5 cm²", "28.5 cm²") },
        {
          id: "78.5",
          label: t("78.5 cm²", "78.5 cm²"),
          feedback: t(
            r`78.5 cm² is the whole sector. Take away the right triangle, $\tfrac{1}{2} \times 10 \times 10 = 50$.`,
            r`78.5 cm² पूरा त्रिज्यखंड है। समकोण त्रिभुज घटाओ, $\tfrac{1}{2} \times 10 \times 10 = 50$।`,
          ),
        },
        {
          id: "235.5",
          label: t("235.5 cm²", "235.5 cm²"),
          feedback: t(
            r`235.5 cm² is the major sector, $314 - 78.5$. The minor segment is the small piece: $78.5 - 50$.`,
            r`235.5 cm² दीर्घ त्रिज्यखंड है, $314 - 78.5$। लघु वृत्तखंड छोटा भाग है: $78.5 - 50$।`,
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        r`**Mission log.** ✓ A sector: $\frac{\theta}{360}\pi r^2$, and its arc $\frac{\theta}{360} 2\pi r$. ✓ A segment: the sector less the triangle. ✓ The mudguard's strip is 55 cm, and the reflector is 14 cm². Next stop: sectors all around us, from clocks to lighthouses.`,
        r`**मिशन लॉग।** ✓ त्रिज्यखंड: $\frac{\theta}{360}\pi r^2$, और उसका चाप $\frac{\theta}{360} 2\pi r$। ✓ वृत्तखंड: त्रिज्यखंड घटा त्रिभुज। ✓ मडगार्ड की पट्टी 55 cm है, और रिफ़्लेक्टर 14 cm²। अगला पड़ाव: हमारे चारों ओर त्रिज्यखंड, घड़ी से प्रकाश-स्तंभ तक।`,
      ),
      "log",
      { isHidden: true },
    );
    b.when(minor.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([
      w.title(t("Your turn", "अब तुम्हारी बारी")),
      w.body(
        t(
          r`**Worked (Exercise 12.2, Q1).** Radius 6 cm, angle 60°: $$\frac{60}{360} \times \frac{22}{7} \times 6 \times 6 = \frac{132}{7} = 18\tfrac{6}{7} \text{ cm}^2$$`,
          r`**हल किया हुआ (प्रश्नावली 12.2, प्र 1)।** त्रिज्या 6 cm, कोण 60°: $$\frac{60}{360} \times \frac{22}{7} \times 6 \times 6 = \frac{132}{7} = 18\tfrac{6}{7} \text{ cm}^2$$`,
        ),
      ),
      minor,
      log,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [hook, parts, sector, segment, major, inLife, yourTurn];

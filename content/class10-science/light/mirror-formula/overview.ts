import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  MirrorKind,
  Ray,
  SceneKind,
  SphericalMirrorAction,
  lightSceneDef,
  sphericalMirrorDef,
} from "@chalk/prop-light";

const r = String.raw;

/** Hook: Kabir's bus question, and Riya's notes that don't say which side. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const view = b.prop(lightSceneDef, "view", {
    scene: SceneKind.SideMirror,
    isLit: true,
    canToggle: false,
  });
  b.standsFor(view, "the bus's bulging side mirror with a tiny bus in it");
  return column([
    w.title(t("How far behind the glass?", "काँच के कितने पीछे?")),
    view,
    w.body(
      t(
        "Wednesday morning, the last piece of **stop 2: curved mirrors**. Kabir is still stuck on yesterday's question: how far behind the side mirror was that tiny bus's picture? Riya gets out their notes from Monday night: **\"Phone 15 cm from the mirror. Picture 30 cm.\"** But Monday's picture was **in front** of the mirror, and the bus's picture was **behind** the glass.",
        'बुधवार सुबह, **पड़ाव 2: मुड़े हुए दर्पण** का आख़िरी टुकड़ा। कबीर अब भी कल के सवाल पर अटका है: साइड दर्पण के पीछे उस नन्ही बस की तस्वीर कितनी दूर थी? रिया सोमवार रात के नोट्स निकालती है: **"फ़ोन दर्पण से 15 सेमी। तस्वीर 30 सेमी।"** पर सोमवार की तस्वीर दर्पण के **सामने** थी, और बस की तस्वीर काँच के **पीछे**।',
      ),
    ),
    w.body(
      t(
        "If we could put numbers into one rule, Riya could place the phone and the card exactly, without sliding anything. This lesson builds that rule: the mirror formula.",
        "अगर हम संख्याओं को एक नियम में डाल सकें, तो रिया फ़ोन और कार्ड की ठीक जगह, कुछ खिसकाए बिना, निकाल सकती है। यह पाठ वही नियम बनाता है: दर्पण सूत्र।",
      ),
    ),
    space(),
  ]);
});

/** Why we need signs, then the New Cartesian sign convention. */
const signs = page(
  "signs",
  (b) => {
    const w = wordsOn(b);
    const m = b.prop(sphericalMirrorDef, "mirror", {
      kind: MirrorKind.Concave,
      focalLength: 10,
      object: { x: -30, height: 4 },
      rays: [Ray.Parallel, Ray.Focal],
      showImage: true,
      showLabels: true,
      showSigns: true,
    });
    b.standsFor(
      m,
      "a concave mirror with the New Cartesian axes drawn at the pole: +x to the right, −x to the left, +y up, −y down",
    );
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "A concave mirror has a focal length of 15 cm. With its sign, what is f?",
        "एक अवतल दर्पण की फोकस दूरी 15 सेमी है। चिह्न के साथ f क्या है?",
      ),
      options: [
        { id: "right", label: t("−15 cm", "−15 सेमी") },
        {
          id: "plus",
          label: t("+15 cm", "+15 सेमी"),
          feedback: t(
            "A concave mirror's F is in front, on the left of P, the side the light comes from. Left is negative.",
            "अवतल दर्पण का F सामने है, P के बाईं ओर, जिधर से प्रकाश आता है। बायाँ ऋणात्मक है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Distances with signs", "चिह्नों के साथ दूरियाँ")),
      w.body(
        t(
          'A distance alone doesn\'t say enough. "30 cm from the mirror": in front of it, or behind it? To work with mirrors in numbers, every distance needs to say which side it is on. We use signs, like on a number line.',
          'अकेली दूरी काफ़ी नहीं बताती। "दर्पण से 30 सेमी": उसके सामने, या पीछे? दर्पणों का हिसाब संख्याओं में करने के लिए हर दूरी को बताना होगा कि वह किस ओर है। हम चिह्न लेते हैं, जैसे संख्या रेखा पर।',
        ),
      ),
      w.definition(
        t(
          "**The New Cartesian sign convention.** The pole P is the origin, and the principal axis is the x-axis. (1) The object is always on the left, so light comes from the left. (2) All distances along the axis are measured from P. (3) Distances to the **right** of P are **positive**; to the **left**, **negative**. (4) Heights **above** the axis are **positive**; (5) **below**, **negative**.",
          "**नई कार्तीय चिह्न परिपाटी।** ध्रुव P मूल बिंदु है, और मुख्य अक्ष x-अक्ष है। (1) वस्तु हमेशा बाईं ओर होती है, इसलिए प्रकाश बाईं ओर से आता है। (2) अक्ष के साथ सभी दूरियाँ P से नापी जाती हैं। (3) P के **दाईं** ओर की दूरियाँ **धनात्मक** हैं; **बाईं** ओर की **ऋणात्मक**। (4) अक्ष के **ऊपर** की ऊँचाइयाँ **धनात्मक** हैं; (5) **नीचे** की **ऋणात्मक**।",
        ),
      ),
      m,
      w.body(
        t(
          "So the object, always on the left, has a negative distance. A concave mirror's F and C are on the left too, so its focal length is negative. A convex mirror's F and C are behind it, on the right, so its focal length is positive. An image in front of the mirror has a negative distance, and one behind has a positive distance.",
          "तो वस्तु, जो हमेशा बाईं ओर है, की दूरी ऋणात्मक है। अवतल दर्पण के F और C भी बाईं ओर हैं, इसलिए उसकी फोकस दूरी ऋणात्मक है। उत्तल दर्पण के F और C उसके पीछे, दाईं ओर हैं, इसलिए उसकी फोकस दूरी धनात्मक है। दर्पण के सामने बने प्रतिबिंब की दूरी ऋणात्मक है, और पीछे बने की धनात्मक।",
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** u and v defined; the formula found from readings, worked numbers first. */
const formula = page(
  "formula",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "Find the mirror formula from the prop's readings: u = −30, v = −15, f = −10 worked through first; then the learner drags to 15 cm, reads v = −30 and works 1/u + 1/v = −1/10 again. Then 1/v + 1/u = 1/f stated, for every spherical mirror and position, with signs.",
    );
    const m = b.prop(sphericalMirrorDef, "mirror", {
      kind: MirrorKind.Concave,
      focalLength: 10,
      object: { x: -30, height: 4 },
      rays: [Ray.Parallel, Ray.Focal],
      showImage: true,
      showLabels: true,
      showDistances: true,
    });
    b.studentOnly(m.action(SphericalMirrorAction.MoveObject));
    b.standsFor(m, "a concave mirror (f = 10 cm) with u, v and f read out with their signs");
    const second = choiceQuestion(b, {
      name: "second",
      prompt: t(
        r`Drag the object to 15 cm in front. The readout shows $v = -30$ cm. What is $\frac{1}{u} + \frac{1}{v}$ now?`,
        r`वस्तु को 15 सेमी सामने खिसकाओ। रीडआउट में $v = -30$ सेमी है। अब $\frac{1}{u} + \frac{1}{v}$ क्या है?`,
      ),
      options: [
        { id: "right", label: t(r`$-\frac{1}{10}$`, r`$-\frac{1}{10}$`) },
        {
          id: "plus",
          label: t(r`$\frac{1}{10}$`, r`$\frac{1}{10}$`),
          feedback: t(
            r`Both $u$ and $v$ are negative here, so both fractions are negative.`,
            r`यहाँ $u$ और $v$ दोनों ऋणात्मक हैं, इसलिए दोनों भिन्न ऋणात्मक हैं।`,
          ),
        },
        {
          id: "add",
          label: t(r`$-\frac{1}{45}$`, r`$-\frac{1}{45}$`),
          feedback: t(
            r`Adding fractions isn't adding the bottoms. Use 30 as the common bottom: $-\frac{2}{30} - \frac{1}{30}$.`,
            r`भिन्न जोड़ना हरों को जोड़ना नहीं है। 30 को साझा हर लो: $-\frac{2}{30} - \frac{1}{30}$।`,
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const rule = w.definition(
      t(
        r`**The mirror formula.** For every spherical mirror and every position of the object, $$\frac{1}{v} + \frac{1}{u} = \frac{1}{f}$$ Put in $u$, $v$ and $f$ with their signs.`,
        r`**दर्पण सूत्र।** हर गोलीय दर्पण और वस्तु की हर स्थिति के लिए $$\frac{1}{v} + \frac{1}{u} = \frac{1}{f}$$ $u$, $v$ और $f$ को उनके चिह्नों के साथ रखो।`,
      ),
      "rule",
      { isHidden: true },
    );
    const convex = w.body(
      t(
        r`It works for a convex mirror too. With $f = +10$ cm and the object at $u = -10$ cm, the image is at $v = +5$ cm, behind: $$\frac{1}{-10} + \frac{1}{5} = -\frac{1}{10} + \frac{2}{10} = \frac{1}{10}$$`,
        r`यह उत्तल दर्पण के लिए भी चलता है। $f = +10$ सेमी और वस्तु $u = -10$ सेमी पर हो, तो प्रतिबिंब $v = +5$ सेमी पर, पीछे है: $$\frac{1}{-10} + \frac{1}{5} = -\frac{1}{10} + \frac{2}{10} = \frac{1}{10}$$`,
      ),
      "convex",
      { isHidden: true },
    );
    b.when(second.on(QuestionSignal.Correct), [
      theBoard.show(rule),
      theBoard.show(convex),
      theBoard.pass(),
    ]);
    return column([
      w.title(t("The mirror formula", "दर्पण सूत्र")),
      w.definition(
        t(
          r`**Object and image distances.** The distance of the object from the pole is the **object distance**, $u$. The distance of the image from the pole is the **image distance**, $v$.`,
          r`**वस्तु और प्रतिबिंब की दूरियाँ।** ध्रुव से वस्तु की दूरी **वस्तु दूरी** $u$ है। ध्रुव से प्रतिबिंब की दूरी **प्रतिबिंब दूरी** $v$ है।`,
        ),
      ),
      w.definition(
        t(
          r`**Reciprocal.** The **reciprocal** of a number is 1 divided by that number. The reciprocal of 4 is $\frac{1}{4}$, and the reciprocal of $-30$ is $$\frac{1}{-30} = -\frac{1}{30}$$`,
          r`**व्युत्क्रम।** किसी संख्या का **व्युत्क्रम** 1 भाग उस संख्या है। 4 का व्युत्क्रम $\frac{1}{4}$ है, और $-30$ का व्युत्क्रम है $$\frac{1}{-30} = -\frac{1}{30}$$`,
        ),
      ),
      w.body(
        t(
          r`For a given mirror, $u$, $v$ and $f$ are linked. Read them off for the object at 30 cm: $$u = -30, \qquad v = -15, \qquad f = -10$$ Now add the reciprocals of $u$ and $v$: $$\begin{aligned} \frac{1}{u} + \frac{1}{v} &= \frac{1}{-30} + \frac{1}{-15} \\ &= -\frac{1}{30} - \frac{2}{30} \\ &= -\frac{3}{30} = -\frac{1}{10} \end{aligned}$$ That is exactly $\frac{1}{f}$.`,
          r`किसी दर्पण के लिए $u$, $v$ और $f$ आपस में जुड़े हैं। वस्तु 30 सेमी पर हो तो पढ़ो: $$u = -30, \qquad v = -15, \qquad f = -10$$ अब $u$ और $v$ के व्युत्क्रम जोड़ो: $$\begin{aligned} \frac{1}{u} + \frac{1}{v} &= \frac{1}{-30} + \frac{1}{-15} \\ &= -\frac{1}{30} - \frac{2}{30} \\ &= -\frac{3}{30} = -\frac{1}{10} \end{aligned}$$ यह ठीक $\frac{1}{f}$ है।`,
        ),
      ),
      m,
      second,
      rule,
      convex,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Magnification: m = h′/h, also −v/u; what its sign says. */
const magnification = page(
  "magnification",
  (b) => {
    const w = wordsOn(b);
    const m = b.prop(sphericalMirrorDef, "mirror", {
      kind: MirrorKind.Concave,
      focalLength: 10,
      object: { x: -30, height: 4 },
      rays: [Ray.Parallel, Ray.Focal],
      showImage: true,
      showLabels: true,
      showDistances: true,
    });
    b.studentOnly(m.action(SphericalMirrorAction.MoveObject));
    b.standsFor(m, "a concave mirror with u, v, f and both heights read out with their signs");
    const plane = choiceQuestion(b, {
      name: "plane",
      prompt: t(
        "The magnification of a plane mirror is +1. What does that tell you?",
        "समतल दर्पण का आवर्धन +1 है। इससे क्या पता चलता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "The image is the same size and erect (virtual)",
            "प्रतिबिंब बराबर आकार का और सीधा (आभासी) है",
          ),
        },
        {
          id: "bigger",
          label: t("The image is one centimetre bigger", "प्रतिबिंब एक सेंटीमीटर बड़ा है"),
          feedback: t(
            "m is a ratio: image height ÷ object height. 1 means equal.",
            "m एक अनुपात है: प्रतिबिंब की ऊँचाई ÷ वस्तु की ऊँचाई। 1 का अर्थ है बराबर।",
          ),
        },
        {
          id: "real",
          label: t(
            "The image is real and can be caught on a screen",
            "प्रतिबिंब वास्तविक है और पर्दे पर लिया जा सकता है",
          ),
          feedback: t(
            "A positive m means the image is erect, and an erect image from a mirror is virtual.",
            "धनात्मक m का अर्थ है प्रतिबिंब सीधा है, और दर्पण का सीधा प्रतिबिंब आभासी होता है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Magnification", "आवर्धन")),
      w.definition(
        t(
          r`**Magnification.** How many times larger the image is than the object: $$m = \frac{\text{height of the image}}{\text{height of the object}} = \frac{h'}{h}$$`,
          r`**आवर्धन।** प्रतिबिंब वस्तु से कितने गुना बड़ा है: $$m = \frac{\text{प्रतिबिंब की ऊँचाई}}{\text{वस्तु की ऊँचाई}} = \frac{h'}{h}$$`,
        ),
      ),
      m,
      w.body(
        t(
          r`Read the heights with the object at 30 cm: $h = +4$ and $h' = -2$, because the image hangs below the axis. So $$m = \frac{-2}{+4} = -0.5$$ Now try the distances: $$-\frac{v}{u} = -\frac{-15}{-30} = -0.5$$ The same. It always is, so $$m = \frac{h'}{h} = -\frac{v}{u}$$`,
          r`वस्तु 30 सेमी पर हो तो ऊँचाइयाँ पढ़ो: $h = +4$ और $h' = -2$, क्योंकि प्रतिबिंब अक्ष के नीचे लटका है। इसलिए $$m = \frac{-2}{+4} = -0.5$$ अब दूरियों से देखो: $$-\frac{v}{u} = -\frac{-15}{-30} = -0.5$$ वही। हमेशा यही होता है, इसलिए $$m = \frac{h'}{h} = -\frac{v}{u}$$`,
        ),
      ),
      w.body(
        t(
          "The sign of m tells you the nature. **Negative m**: the image is below the axis, inverted, and real. **Positive m**: the image is erect and virtual. The size of the number tells you how big: more than 1 is enlarged, less than 1 is diminished.",
          "m का चिह्न प्रकृति बताता है। **ऋणात्मक m**: प्रतिबिंब अक्ष के नीचे, उल्टा, और वास्तविक है। **धनात्मक m**: प्रतिबिंब सीधा और आभासी है। संख्या का माप बताता है कितना बड़ा: 1 से ज़्यादा यानी बड़ा, 1 से कम यानी छोटा।",
        ),
      ),
      plane,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** See it in life: Riya's Monday notes, now with signs: the make-up mirror's focal length. */
const notes = page(
  "notes",
  (b) => {
    const w = wordsOn(b);
    const card = b.prop(lightSceneDef, "card", {
      scene: SceneKind.PhoneCard,
      isLit: true,
      canToggle: false,
    });
    b.standsFor(
      card,
      "Monday night: Mom's round make-up mirror on the table, the phone in front of it, and Kabir holding a card 30 cm from the mirror that catches an enlarged, upside-down copy of the movie",
    );
    const f = choiceQuestion(b, {
      name: "f",
      prompt: t(
        r`Riya's notes, with signs: the phone was at $u = -15$ cm and the sharp picture on the card at $v = -30$ cm. What is the make-up mirror's focal length?`,
        r`रिया के नोट्स, चिह्नों के साथ: फ़ोन $u = -15$ सेमी पर था और कार्ड पर साफ़ तस्वीर $v = -30$ सेमी पर। मेकअप वाले दर्पण की फोकस दूरी क्या है?`,
      ),
      options: [
        { id: "right", label: t("−10 cm", "−10 सेमी") },
        {
          id: "plus",
          label: t("+10 cm", "+10 सेमी"),
          feedback: t(
            r`Both $u$ and $v$ are negative, so $\frac{1}{f}$ is negative too. A concave mirror's $f$ is always negative.`,
            r`$u$ और $v$ दोनों ऋणात्मक हैं, इसलिए $\frac{1}{f}$ भी ऋणात्मक है। अवतल दर्पण का $f$ हमेशा ऋणात्मक होता है।`,
          ),
        },
        {
          id: "sum",
          label: t("−45 cm", "−45 सेमी"),
          feedback: t(
            r`The formula adds the reciprocals, not the distances: $\frac{1}{-15} + \frac{1}{-30}$.`,
            r`सूत्र व्युत्क्रम जोड़ता है, दूरियाँ नहीं: $\frac{1}{-15} + \frac{1}{-30}$।`,
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const work = w.body(
      t(
        r`$$\begin{aligned} \frac{1}{f} &= \frac{1}{v} + \frac{1}{u} = \frac{1}{-30} + \frac{1}{-15} \\ &= -\frac{1}{30} - \frac{2}{30} = -\frac{3}{30} = -\frac{1}{10} \end{aligned}$$ So $f = -10$ cm: Mom's mirror is concave, with F 10 cm in front of it. Same answer as Kabir's tree test on Monday morning. Now Riya can put the phone anywhere and work out where the card goes, before touching anything. And Kabir's bus? That's the first example on the next page.`,
        r`$$\begin{aligned} \frac{1}{f} &= \frac{1}{v} + \frac{1}{u} = \frac{1}{-30} + \frac{1}{-15} \\ &= -\frac{1}{30} - \frac{2}{30} = -\frac{3}{30} = -\frac{1}{10} \end{aligned}$$ इसलिए $f = -10$ सेमी: माँ का दर्पण अवतल है, जिसका F उसके 10 सेमी सामने है। सोमवार सुबह कबीर के पेड़ वाले प्रयोग जैसा ही उत्तर। अब रिया फ़ोन कहीं भी रखकर, कुछ छुए बिना, निकाल सकती है कि कार्ड कहाँ जाएगा। और कबीर की बस? वह अगले पन्ने का पहला उदाहरण है।`,
      ),
      "work",
      { isHidden: true },
    );
    b.when(f.on(QuestionSignal.Correct), [theBoard.show(work), theBoard.pass()]);
    return column([
      w.title(t("Back to Monday's notes", "सोमवार के नोट्स पर वापस")),
      card,
      w.body(
        t(
          "Riya rewrites Monday night's card test in the new language: phone 15 cm from the mirror, sharp picture on the card at 30 cm. The phone and the picture were both in front of the mirror, on the left, so both distances are negative.",
          "रिया सोमवार रात का कार्ड वाला प्रयोग नई भाषा में दोबारा लिखती है: फ़ोन दर्पण से 15 सेमी पर, कार्ड पर साफ़ तस्वीर 30 सेमी पर। फ़ोन और तस्वीर दोनों दर्पण के सामने, बाईं ओर, थे, इसलिए दोनों दूरियाँ ऋणात्मक हैं।",
        ),
      ),
      f,
      work,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** NCERT Example 10.1: the bus in a convex rear-view mirror. */
const exampleBus = page("example-bus", (b) => {
  const w = wordsOn(b);
  const m = b.prop(sphericalMirrorDef, "mirror", {
    kind: MirrorKind.Convex,
    focalLength: 10,
    span: 40,
    showLabels: true,
    object: { x: -33, height: 8 },
    rays: [Ray.Parallel, Ray.Centre],
    showImage: true,
  });
  b.standsFor(
    m,
    "the bus problem drawn at one fifteenth of the real size: a convex mirror with F 10 cm and C 20 cm behind it, the bus about 33 cm in front, and its small upright image behind the mirror",
  );
  return column([
    w.title(t("Example: the rear-view mirror", "उदाहरण: पीछे देखने वाला दर्पण")),
    w.body(
      t(
        "Kabir's bus question, with real numbers from NCERT.",
        "कबीर का बस वाला सवाल, NCERT की असली संख्याओं के साथ।",
      ),
    ),
    w.body(
      t(
        "**A convex rear-view mirror has a radius of curvature of 3.00 m. A bus is 5.00 m from it. Find the position, nature and size of the image.**",
        "**पीछे देखने वाले उत्तल दर्पण की वक्रता त्रिज्या 3.00 मीटर है। एक बस उससे 5.00 मीटर दूर है। प्रतिबिंब की स्थिति, प्रकृति और आकार ज्ञात करो।**",
      ),
    ),
    w.body(
      t(
        r`Write each quantity with its sign. The mirror is convex, so its F is behind, on the right: $$R = +3.00 \text{ m}, \qquad f = \frac{R}{2} = +1.50 \text{ m}$$ The bus is in front, on the left: $$u = -5.00 \text{ m}$$`,
        r`हर राशि को उसके चिह्न के साथ लिखो। दर्पण उत्तल है, इसलिए उसका F पीछे, दाईं ओर है: $$R = +3.00 \text{ मीटर}, \qquad f = \frac{R}{2} = +1.50 \text{ मीटर}$$ बस सामने, बाईं ओर है: $$u = -5.00 \text{ मीटर}$$`,
      ),
    ),
    w.body(
      t(
        r`From the mirror formula, take $\frac{1}{u}$ to the other side. To add the two fractions, give them a common bottom, $1.50 \times 5.00 = 7.50$: $$\begin{aligned} \frac{1}{v} &= \frac{1}{f} - \frac{1}{u} \\ &= \frac{1}{1.50} + \frac{1}{5.00} \\ &= \frac{5.00}{7.50} + \frac{1.50}{7.50} \\ &= \frac{6.50}{7.50} \\ v &= \frac{7.50}{6.50} = +1.15 \text{ m} \end{aligned}$$ $v$ is positive, so the image is 1.15 m **behind** the mirror.`,
        r`दर्पण सूत्र से, $\frac{1}{u}$ को दूसरी ओर ले जाओ। दोनों भिन्न जोड़ने के लिए उन्हें साझा हर दो, $1.50 \times 5.00 = 7.50$: $$\begin{aligned} \frac{1}{v} &= \frac{1}{f} - \frac{1}{u} \\ &= \frac{1}{1.50} + \frac{1}{5.00} \\ &= \frac{5.00}{7.50} + \frac{1.50}{7.50} \\ &= \frac{6.50}{7.50} \\ v &= \frac{7.50}{6.50} = +1.15 \text{ मीटर} \end{aligned}$$ $v$ धनात्मक है, इसलिए प्रतिबिंब दर्पण के 1.15 मीटर **पीछे** है।`,
      ),
    ),
    w.body(
      t(
        r`$$m = -\frac{v}{u} = -\frac{1.15}{-5.00} = +0.23$$ $m$ is positive and less than 1: the image is **virtual, erect, and 0.23 times the size** of the bus. The picture below shows the same set-up, shrunk to fit the screen.`,
        r`$$m = -\frac{v}{u} = -\frac{1.15}{-5.00} = +0.23$$ $m$ धनात्मक है और 1 से कम: प्रतिबिंब **आभासी, सीधा, और बस के आकार का 0.23 गुना** है। नीचे का चित्र यही व्यवस्था दिखाता है, स्क्रीन में समाने के लिए छोटा करके।`,
      ),
    ),
    m,
    space(),
  ]);
});

/** NCERT Example 10.2: where to put the screen. */
const exampleScreen = page("example-screen", (b) => {
  const w = wordsOn(b);
  const m = b.prop(sphericalMirrorDef, "mirror", {
    kind: MirrorKind.Concave,
    focalLength: 15,
    showLabels: true,
    object: { x: -25, height: 4 },
    rays: [Ray.Parallel, Ray.Focal],
    showImage: true,
    screen: -37.5,
  });
  b.standsFor(
    m,
    "the example drawn to scale: a 4 cm object 25 cm in front of a concave mirror of focal length 15 cm, and a screen 37.5 cm in front catching a sharp, inverted 6 cm image",
  );
  return column([
    w.title(t("Example: where to put the screen", "उदाहरण: पर्दा कहाँ रखें")),
    w.body(
      t(
        "This is Riya's card problem, with different numbers. No more sliding: work it out.",
        "यह रिया की कार्ड वाली समस्या है, अलग संख्याओं के साथ। अब खिसकाना नहीं: हिसाब लगाओ।",
      ),
    ),
    w.body(
      t(
        "**A 4.0 cm object is 25.0 cm in front of a concave mirror of focal length 15.0 cm. Where should a screen go to catch a sharp image? Find the nature and size of the image.**",
        "**4.0 सेमी की वस्तु 15.0 सेमी फोकस दूरी वाले अवतल दर्पण के सामने 25.0 सेमी पर है। साफ़ प्रतिबिंब पाने के लिए पर्दा कहाँ रखें? प्रतिबिंब की प्रकृति और आकार ज्ञात करो।**",
      ),
    ),
    w.body(
      t(
        r`With signs: the object is above the axis and on the left, and a concave mirror's F is on the left: $$\begin{aligned} h &= +4.0 \text{ cm} \\ u &= -25.0 \text{ cm} \\ f &= -15.0 \text{ cm} \end{aligned}$$`,
        r`चिह्नों के साथ: वस्तु अक्ष के ऊपर और बाईं ओर है, और अवतल दर्पण का F बाईं ओर है: $$\begin{aligned} h &= +4.0 \text{ सेमी} \\ u &= -25.0 \text{ सेमी} \\ f &= -15.0 \text{ सेमी} \end{aligned}$$`,
      ),
    ),
    w.body(
      t(
        r`$$\begin{aligned} \frac{1}{v} &= \frac{1}{f} - \frac{1}{u} \\ &= -\frac{1}{15.0} + \frac{1}{25.0} \\ &= \frac{-5.0 + 3.0}{75.0} = -\frac{2.0}{75.0} \\ v &= -37.5 \text{ cm} \end{aligned}$$ $v$ is negative, so the image is 37.5 cm **in front** of the mirror. Put the screen there. The image is real.`,
        r`$$\begin{aligned} \frac{1}{v} &= \frac{1}{f} - \frac{1}{u} \\ &= -\frac{1}{15.0} + \frac{1}{25.0} \\ &= \frac{-5.0 + 3.0}{75.0} = -\frac{2.0}{75.0} \\ v &= -37.5 \text{ सेमी} \end{aligned}$$ $v$ ऋणात्मक है, इसलिए प्रतिबिंब दर्पण के 37.5 सेमी **सामने** है। पर्दा वहीं रखो। प्रतिबिंब वास्तविक है।`,
      ),
    ),
    w.body(
      t(
        r`For the size, use $\frac{h'}{h} = -\frac{v}{u}$: $$\begin{aligned} h' &= -\frac{v}{u} \times h \\ &= -\frac{-37.5}{-25.0} \times 4.0 = -6.0 \text{ cm} \end{aligned}$$ The image is 6.0 cm tall, **inverted** (negative) and **enlarged**.`,
        r`आकार के लिए $\frac{h'}{h} = -\frac{v}{u}$ लो: $$\begin{aligned} h' &= -\frac{v}{u} \times h \\ &= -\frac{-37.5}{-25.0} \times 4.0 = -6.0 \text{ सेमी} \end{aligned}$$ प्रतिबिंब 6.0 सेमी ऊँचा, **उल्टा** (ऋणात्मक) और **बड़ा** है।`,
      ),
    ),
    m,
    space(),
  ]);
});

/** NCERT in-text Q2 and Ex 12. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const three = choiceQuestion(b, {
      name: "three",
      prompt: t(
        "A concave mirror makes a real image three times the size of an object placed 10 cm in front of it. Where is the image?",
        "एक अवतल दर्पण अपने सामने 10 सेमी पर रखी वस्तु का तीन गुना बड़ा वास्तविक प्रतिबिंब बनाता है। प्रतिबिंब कहाँ है?",
      ),
      options: [
        { id: "right", label: t("30 cm in front of the mirror", "दर्पण के 30 सेमी सामने") },
        {
          id: "behind",
          label: t("30 cm behind the mirror", "दर्पण के 30 सेमी पीछे"),
          feedback: t(
            r`A real image has $m = -3$. Then $v = 3u = -30$ cm: negative, in front.`,
            r`वास्तविक प्रतिबिंब का $m = -3$ है। तब $v = 3u = -30$ सेमी: ऋणात्मक, सामने।`,
          ),
        },
        {
          id: "third",
          label: t("3.3 cm in front of the mirror", "दर्पण के 3.3 सेमी सामने"),
          feedback: t(
            r`Three times the size means $v$ is three times $u$, not a third of it.`,
            r`तीन गुना आकार का अर्थ है $v$, $u$ का तीन गुना है, तिहाई नहीं।`,
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const convex = choiceQuestion(b, {
      name: "convex",
      prompt: t(
        "An object is 10 cm from a convex mirror of focal length 15 cm. Where is the image?",
        "एक वस्तु 15 सेमी फोकस दूरी वाले उत्तल दर्पण से 10 सेमी पर है। प्रतिबिंब कहाँ है?",
      ),
      options: [
        { id: "right", label: t("6 cm behind the mirror", "दर्पण के 6 सेमी पीछे") },
        {
          id: "thirty",
          label: t("30 cm behind the mirror", "दर्पण के 30 सेमी पीछे"),
          feedback: t(
            r`Check the sign of $u$: $\frac{1}{v} = \frac{1}{15} - \frac{1}{-10} = \frac{1}{15} + \frac{1}{10}$.`,
            r`$u$ का चिह्न जाँचो: $\frac{1}{v} = \frac{1}{15} - \frac{1}{-10} = \frac{1}{15} + \frac{1}{10}$।`,
          ),
        },
        {
          id: "front",
          label: t("6 cm in front of the mirror", "दर्पण के 6 सेमी सामने"),
          feedback: t(
            r`$v$ comes out positive, +6 cm, so the image is behind. A convex mirror's image always is.`,
            r`$v$ धनात्मक आता है, +6 सेमी, इसलिए प्रतिबिंब पीछे है। उत्तल दर्पण का प्रतिबिंब हमेशा पीछे होता है।`,
          ),
        },
      ],
      answer: "right",
      passes: false,
      isHidden: true,
    });
    const working = w.body(
      t(
        r`$$\begin{aligned} \frac{1}{v} &= \frac{1}{f} - \frac{1}{u} = \frac{1}{15} - \frac{1}{-10} \\ &= \frac{2}{30} + \frac{3}{30} = \frac{5}{30} = \frac{1}{6} \end{aligned}$$ So $v = +6$ cm. The image is virtual and erect, behind the mirror.`,
        r`$$\begin{aligned} \frac{1}{v} &= \frac{1}{f} - \frac{1}{u} = \frac{1}{15} - \frac{1}{-10} \\ &= \frac{2}{30} + \frac{3}{30} = \frac{5}{30} = \frac{1}{6} \end{aligned}$$ इसलिए $v = +6$ सेमी। प्रतिबिंब आभासी और सीधा है, दर्पण के पीछे।`,
      ),
      "working",
      { isHidden: true },
    );
    b.when(three.on(QuestionSignal.Correct), theBoard.show(convex));
    const log = w.definition(
      t(
        "**Mission log, end of stop 2.** ✓ With the mirror formula, Riya can place the phone and the card exactly, before anyone touches them. ✗ But every mirror sends the picture back towards the side the light came from: towards the phone, and towards the people watching. A projector needs something that light goes **through**, so the picture lands on the far side. Next: **stop 3, bending**.",
        "**मिशन लॉग, पड़ाव 2 का अंत।** ✓ दर्पण सूत्र से रिया फ़ोन और कार्ड की ठीक जगह, छूने से पहले ही, निकाल सकती है। ✗ पर हर दर्पण तस्वीर को उसी ओर लौटाता है जिधर से प्रकाश आया: फ़ोन की ओर, और देखने वालों की ओर। प्रोजेक्टर को ऐसी चीज़ चाहिए जिसके **आर-पार** प्रकाश जाए, ताकि तस्वीर दूसरी ओर बने। आगे: **पड़ाव 3, मुड़ना**।",
      ),
      "log",
      { isHidden: true },
    );
    const ex14 = choiceQuestion(b, {
      name: "ex14",
      prompt: t(
        "A 5.0 cm tall object is 20 cm in front of a convex mirror of radius of curvature 30 cm. Where is the image, and how tall is it?",
        "5.0 सेमी ऊँची वस्तु 30 सेमी वक्रता त्रिज्या वाले उत्तल दर्पण के सामने 20 सेमी पर है। प्रतिबिंब कहाँ है, और कितना ऊँचा है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "8.6 cm behind the mirror, 2.1 cm tall, erect",
            "दर्पण के 8.6 सेमी पीछे, 2.1 सेमी ऊँचा, सीधा",
          ),
        },
        {
          id: "radius",
          label: t(
            "12 cm behind the mirror, 3.0 cm tall, erect",
            "दर्पण के 12 सेमी पीछे, 3.0 सेमी ऊँचा, सीधा",
          ),
          feedback: t(
            r`That uses $f = 30$ cm. The focal length is half the radius: $f = +15$ cm.`,
            r`इसमें $f = 30$ सेमी लिया गया। फोकस दूरी त्रिज्या की आधी है: $f = +15$ सेमी।`,
          ),
        },
        {
          id: "sign",
          label: t(
            "60 cm behind the mirror, 15 cm tall, erect",
            "दर्पण के 60 सेमी पीछे, 15 सेमी ऊँचा, सीधा",
          ),
          feedback: t(
            r`The object is on the left, so $u = -20$ cm, and $\frac{1}{v} = \frac{1}{15} + \frac{1}{20}$.`,
            r`वस्तु बाईं ओर है, इसलिए $u = -20$ सेमी, और $\frac{1}{v} = \frac{1}{15} + \frac{1}{20}$।`,
          ),
        },
      ],
      answer: "right",
      passes: false,
      isHidden: true,
    });
    const ex14work = w.body(
      t(
        r`$$\begin{aligned} f &= \frac{R}{2} = +15 \text{ cm}, \qquad u = -20 \text{ cm} \\ \frac{1}{v} &= \frac{1}{15} - \frac{1}{-20} = \frac{4}{60} + \frac{3}{60} = \frac{7}{60} \\ v &= +8.6 \text{ cm} \\ h' &= -\frac{v}{u} \times h = -\frac{8.6}{-20} \times 5.0 = +2.1 \text{ cm} \end{aligned}$$ Virtual, erect and diminished, behind the mirror.`,
        r`$$\begin{aligned} f &= \frac{R}{2} = +15 \text{ सेमी}, \qquad u = -20 \text{ सेमी} \\ \frac{1}{v} &= \frac{1}{15} - \frac{1}{-20} = \frac{4}{60} + \frac{3}{60} = \frac{7}{60} \\ v &= +8.6 \text{ सेमी} \\ h' &= -\frac{v}{u} \times h = -\frac{8.6}{-20} \times 5.0 = +2.1 \text{ सेमी} \end{aligned}$$ आभासी, सीधा और छोटा, दर्पण के पीछे।`,
      ),
      "ex14work",
      { isHidden: true },
    );
    const ex15 = choiceQuestion(b, {
      name: "ex15",
      prompt: t(
        "A 7.0 cm tall object is 27 cm in front of a concave mirror of focal length 18 cm. Where should a screen go to catch a sharp image, and how tall is the image?",
        "7.0 सेमी ऊँची वस्तु 18 सेमी फोकस दूरी वाले अवतल दर्पण के सामने 27 सेमी पर है। साफ़ प्रतिबिंब पकड़ने के लिए पर्दा कहाँ रखें, और प्रतिबिंब कितना ऊँचा है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "54 cm in front of the mirror; 14 cm tall, inverted",
            "दर्पण के 54 सेमी सामने; 14 सेमी ऊँचा, उल्टा",
          ),
        },
        {
          id: "sign",
          label: t(
            "10.8 cm behind the mirror; 2.8 cm tall, erect",
            "दर्पण के 10.8 सेमी पीछे; 2.8 सेमी ऊँचा, सीधा",
          ),
          feedback: t(
            r`A concave mirror's focal length is negative: $f = -18$ cm.`,
            r`अवतल दर्पण की फोकस दूरी ऋणात्मक है: $f = -18$ सेमी।`,
          ),
        },
        {
          id: "erect",
          label: t(
            "54 cm in front of the mirror; 14 cm tall, erect",
            "दर्पण के 54 सेमी सामने; 14 सेमी ऊँचा, सीधा",
          ),
          feedback: t(
            r`$h'$ comes out $-14$ cm. Negative means below the axis: inverted.`,
            r`$h'$ का मान $-14$ सेमी आता है। ऋणात्मक यानी अक्ष के नीचे: उल्टा।`,
          ),
        },
      ],
      answer: "right",
      passes: false,
      isHidden: true,
    });
    const ex15work = w.body(
      t(
        r`$$\begin{aligned} \frac{1}{v} &= \frac{1}{f} - \frac{1}{u} = -\frac{1}{18} + \frac{1}{27} \\ &= -\frac{3}{54} + \frac{2}{54} = -\frac{1}{54} \\ v &= -54 \text{ cm} \\ h' &= -\frac{v}{u} \times h = -\frac{-54}{-27} \times 7.0 = -14 \text{ cm} \end{aligned}$$ Put the screen 54 cm in front of the mirror. The image is real, inverted and enlarged.`,
        r`$$\begin{aligned} \frac{1}{v} &= \frac{1}{f} - \frac{1}{u} = -\frac{1}{18} + \frac{1}{27} \\ &= -\frac{3}{54} + \frac{2}{54} = -\frac{1}{54} \\ v &= -54 \text{ सेमी} \\ h' &= -\frac{v}{u} \times h = -\frac{-54}{-27} \times 7.0 = -14 \text{ सेमी} \end{aligned}$$ पर्दा दर्पण के 54 सेमी सामने रखो। प्रतिबिंब वास्तविक, उल्टा और बड़ा है।`,
      ),
      "ex15work",
      { isHidden: true },
    );
    b.when(convex.on(QuestionSignal.Correct), [theBoard.show(working), theBoard.show(ex14)]);
    b.when(ex14.on(QuestionSignal.Correct), [theBoard.show(ex14work), theBoard.show(ex15)]);
    b.when(ex15.on(QuestionSignal.Correct), [
      theBoard.show(ex15work),
      theBoard.show(log),
      theBoard.pass(),
    ]);
    return column([
      w.title(t("Your turn", "अब तुम्हारी बारी")),
      three,
      convex,
      working,
      ex14,
      ex14work,
      ex15,
      ex15work,
      log,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [
  hook,
  signs,
  formula,
  magnification,
  notes,
  exampleBus,
  exampleScreen,
  yourTurn,
];

import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  LensAction,
  LensCover,
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

/** Saturday morning: the wall is 2 m away; where exactly does the phone go? */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const box = b.prop(lightSceneDef, "box", { scene: SceneKind.Shoebox, ...still });
  b.standsFor(
    box,
    "the shoebox projector cut open: the phone upside down at the back, the magnifying glass at the front, and a big picture on the wall",
  );
  return column([
    w.title(t("A number, not a guess", "अंदाज़ा नहीं, संख्या")),
    w.body(
      t(
        "Stop 4, lenses. Saturday morning. The projector works, but only after ten minutes of sliding the phone back and forth until the picture goes sharp. Tonight is the real movie night, and Riya wants it perfect first time.",
        "पड़ाव 4, लेंस। शनिवार सुबह। प्रोजेक्टर चलता है, पर तभी जब फ़ोन को दस मिनट आगे-पीछे खिसकाओ और तस्वीर साफ़ हो जाए। आज रात असली मूवी नाइट है, और रिया चाहती है कि पहली बार में सब ठीक हो।",
      ),
    ),
    box,
    w.body(
      t(
        "The wall will be **2 m** from the box, and the magnifying glass has a focal length of 10 cm. Where exactly should the phone go, and how big will the movie be? For mirrors, a formula answered questions like this. This lesson finds the one for lenses.",
        "दीवार डिब्बे से **2 मीटर** दूर होगी, और आवर्धक काँच की फोकस दूरी 10 सेमी है। फ़ोन ठीक कहाँ रखें, और फ़िल्म कितनी बड़ी होगी? दर्पणों के लिए ऐसे सवालों का जवाब एक सूत्र देता था। यह पाठ लेंसों वाला सूत्र ढूँढता है।",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** The sign convention for lenses: from O; f + convex, − concave; v + far side. */
const signs = page(
  "signs",
  (b) => {
    const w = wordsOn(b);
    const g = b.prop(lensDef, "lens", {
      kind: LensKind.Convex,
      focalLength: 10,
      object: { x: -30, height: 4 },
      rays: [LensRay.Parallel, LensRay.Centre],
      showImage: true,
      showLabels: true,
      showDistances: true,
    });
    b.studentOnly(g.action(LensAction.MoveObject));
    b.standsFor(g, "a convex lens with u, v and f read out with their signs");
    const both = choiceQuestion(b, {
      name: "both",
      prompt: t(
        "A spherical mirror and a thin lens each have a focal length of −15 cm. What are they?",
        "एक गोलीय दर्पण और एक पतले लेंस, दोनों की फोकस दूरी −15 सेमी है। वे क्या हैं?",
      ),
      options: [
        { id: "right", label: t("both concave", "दोनों अवतल") },
        {
          id: "convex",
          label: t("both convex", "दोनों उत्तल"),
          feedback: t(
            "A convex mirror's F is behind it, on the right, and a convex lens has a positive focal length: both would be +15 cm.",
            "उत्तल दर्पण का F पीछे, दाईं ओर है, और उत्तल लेंस की फोकस दूरी धनात्मक है: दोनों +15 सेमी होते।",
          ),
        },
        {
          id: "mixed",
          label: t("a concave mirror and a convex lens", "अवतल दर्पण और उत्तल लेंस"),
          feedback: t(
            "A convex lens has a positive focal length. Negative means a concave lens.",
            "उत्तल लेंस की फोकस दूरी धनात्मक होती है। ऋणात्मक का अर्थ है अवतल लेंस।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Signs for lenses", "लेंसों के लिए चिह्न")),
      w.definition(
        t(
          "**Signs for lenses.** Lenses use the same New Cartesian sign convention as mirrors, except that every distance is measured from the **optical centre O**. Light comes from the left, so the object distance $u$ is negative. A convex lens's focal length is **positive**, and a concave lens's is **negative**. An image on the far side of the lens has a **positive** $v$, and it is real. An image on the object's side has a **negative** $v$, and it is virtual.",
          "**लेंसों के लिए चिह्न।** लेंसों के लिए भी दर्पणों वाली नई कार्तीय चिह्न परिपाटी है, बस हर दूरी **प्रकाशिक केंद्र O** से नापी जाती है। प्रकाश बाईं ओर से आता है, इसलिए वस्तु दूरी $u$ ऋणात्मक है। उत्तल लेंस की फोकस दूरी **धनात्मक** है, और अवतल लेंस की **ऋणात्मक**। लेंस की दूसरी ओर बने प्रतिबिंब का $v$ **धनात्मक** है, और वह वास्तविक है। वस्तु वाली ओर बने प्रतिबिंब का $v$ **ऋणात्मक** है, और वह आभासी है।",
        ),
      ),
      g,
      both,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The lens formula from readings, worked numbers first; note the minus. */
const formula = page(
  "formula",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "Find the lens formula from the readings: f = +10, u = −30, v = +15 worked first (1/v − 1/u = 1/15 + 1/30 = 1/10); the learner drags to u = −15, reads v = +30 and checks it. Then 1/v − 1/u = 1/f stated, with a minus where the mirror has a plus.",
    );
    const g = b.prop(lensDef, "lens", {
      kind: LensKind.Convex,
      focalLength: 10,
      object: { x: -30, height: 4 },
      rays: [LensRay.Parallel, LensRay.Centre],
      showImage: true,
      showLabels: true,
      showDistances: true,
    });
    b.studentOnly(g.action(LensAction.MoveObject));
    b.standsFor(g, "a convex lens (f = +10 cm) with u, v and f read out");
    const second = choiceQuestion(b, {
      name: "second",
      prompt: t(
        r`Drag the object to 15 cm. The readout shows $v = +30$ cm. What is $\frac{1}{v} - \frac{1}{u}$?`,
        r`वस्तु को 15 सेमी पर खिसकाओ। रीडआउट में $v = +30$ सेमी है। $\frac{1}{v} - \frac{1}{u}$ क्या है?`,
      ),
      options: [
        { id: "right", label: t(r`$\frac{1}{10}$`, r`$\frac{1}{10}$`) },
        {
          id: "plus",
          label: t(r`$-\frac{1}{30}$`, r`$-\frac{1}{30}$`),
          feedback: t(
            r`Taking away $\frac{1}{-15}$ adds $\frac{1}{15}$: $\frac{1}{30} + \frac{2}{30}$.`,
            r`$\frac{1}{-15}$ घटाने का अर्थ है $\frac{1}{15}$ जोड़ना: $\frac{1}{30} + \frac{2}{30}$।`,
          ),
        },
        {
          id: "mirror",
          label: t(r`$\frac{1}{45}$`, r`$\frac{1}{45}$`),
          feedback: t(
            "Fractions don't add by adding the bottoms. Use 30 as the common bottom.",
            "भिन्न हरों को जोड़कर नहीं जुड़तीं। 30 को साझा हर लो।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const rule = w.definition(
      t(
        r`**The lens formula.** For every thin spherical lens and every position of the object, $$\frac{1}{v} - \frac{1}{u} = \frac{1}{f}$$ Careful: a **minus** here, where the mirror formula has a plus. Put in every value with its sign.`,
        r`**लेंस सूत्र।** हर पतले गोलीय लेंस और वस्तु की हर स्थिति के लिए $$\frac{1}{v} - \frac{1}{u} = \frac{1}{f}$$ ध्यान दो: यहाँ **ऋण** है, जहाँ दर्पण सूत्र में धन है। हर मान उसके चिह्न के साथ रखो।`,
      ),
      "rule",
      { isHidden: true },
    );
    b.when(second.on(QuestionSignal.Correct), [theBoard.show(rule), theBoard.pass()]);
    return column([
      w.title(t("The lens formula", "लेंस सूत्र")),
      w.body(
        t(
          r`Read the values for the object at 30 cm: $$u = -30, \qquad v = +15, \qquad f = +10$$ This time try the difference of the reciprocals: $$\begin{aligned} \frac{1}{v} - \frac{1}{u} &= \frac{1}{15} - \frac{1}{-30} \\ &= \frac{2}{30} + \frac{1}{30} = \frac{3}{30} = \frac{1}{10} \end{aligned}$$ That is $\frac{1}{f}$.`,
          r`वस्तु 30 सेमी पर हो तो मान पढ़ो: $$u = -30, \qquad v = +15, \qquad f = +10$$ इस बार व्युत्क्रमों का अंतर लो: $$\begin{aligned} \frac{1}{v} - \frac{1}{u} &= \frac{1}{15} - \frac{1}{-30} \\ &= \frac{2}{30} + \frac{1}{30} = \frac{3}{30} = \frac{1}{10} \end{aligned}$$ यह $\frac{1}{f}$ है।`,
        ),
      ),
      g,
      second,
      rule,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Magnification for a lens: m = h′/h = v/u, no minus. */
const magnification = page(
  "magnification",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "A lens gives m = −2. What is the image like?",
        "एक लेंस m = −2 देता है। प्रतिबिंब कैसा है?",
      ),
      options: [
        { id: "right", label: t("Real, inverted, twice the size", "वास्तविक, उल्टा, दोगुना बड़ा") },
        {
          id: "virtual",
          label: t("Virtual, erect, twice the size", "आभासी, सीधा, दोगुना बड़ा"),
          feedback: t(
            "A negative m means the image is below the axis: inverted, and real.",
            "ऋणात्मक m का अर्थ है प्रतिबिंब अक्ष के नीचे है: उल्टा, और वास्तविक।",
          ),
        },
        {
          id: "half",
          label: t("Real, inverted, half the size", "वास्तविक, उल्टा, आधे आकार का"),
          feedback: t(
            "The size of m is 2, so the image is twice as tall, not half.",
            "m का माप 2 है, इसलिए प्रतिबिंब दोगुना ऊँचा है, आधा नहीं।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Magnification for a lens", "लेंस का आवर्धन")),
      w.definition(
        t(
          r`**Magnification.** As for mirrors, $$m = \frac{h'}{h}$$ For a lens it is also $$m = \frac{v}{u}$$ with no minus sign.`,
          r`**आवर्धन।** दर्पणों की तरह, $$m = \frac{h'}{h}$$ लेंस के लिए यह भी है $$m = \frac{v}{u}$$ बिना ऋण चिह्न के।`,
        ),
      ),
      w.body(
        t(
          r`Check it with the object at 30 cm: $$m = \frac{v}{u} = \frac{+15}{-30} = -0.5$$ Negative, so the image is inverted and real, and half the size. That's what the picture shows. As with mirrors, **negative m** means real and inverted, and **positive m** means virtual and erect.`,
          r`वस्तु 30 सेमी पर रखकर जाँचो: $$m = \frac{v}{u} = \frac{+15}{-30} = -0.5$$ ऋणात्मक, इसलिए प्रतिबिंब उल्टा और वास्तविक है, और आधे आकार का। चित्र यही दिखाता है। दर्पणों की तरह, **ऋणात्मक m** का अर्थ है वास्तविक और उल्टा, और **धनात्मक m** का अर्थ है आभासी और सीधा।`,
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

/** The mission's own numbers: the wall 2 m away, f = 10 cm: where the phone goes, how big the picture is. */
const projector = page(
  "projector",
  (b) => {
    const w = wordsOn(b);
    const setup = b.prop(lensDef, "setup", {
      kind: LensKind.Convex,
      focalLength: 10,
      object: { x: -12, height: 3 },
      objectStyle: "phone",
      rays: [LensRay.Parallel, LensRay.Centre],
      showImage: true,
      showLabels: false,
      showFocus: false,
      showDistances: true,
      screen: 60,
      span: 70,
    });
    b.standsFor(
      setup,
      "the projector to scale with the wall 60 cm away: the phone 12 cm from a lens of f = 10 cm, and a sharp picture five times taller, upside down, on the screen",
    );
    const closer = choiceQuestion(b, {
      name: "closer",
      prompt: t(
        "Mom says the box has to sit on the bookshelf, so the wall is only 1 m away. Where should the phone go now?",
        "माँ कहती हैं डिब्बा किताबों की अलमारी पर रखना होगा, इसलिए दीवार केवल 1 मीटर दूर है। अब फ़ोन कहाँ जाए?",
      ),
      options: [
        { id: "right", label: t("11.1 cm from the lens", "लेंस से 11.1 सेमी पर") },
        {
          id: "sign",
          label: t("9.1 cm from the lens", "लेंस से 9.1 सेमी पर"),
          feedback: t(
            r`That's adding $\frac{1}{v}$ and $\frac{1}{f}$. The formula gives $\frac{1}{u} = \frac{1}{v} - \frac{1}{f} = \frac{1}{100} - \frac{1}{10}$.`,
            r`यह $\frac{1}{v}$ और $\frac{1}{f}$ को जोड़ना है। सूत्र देता है $\frac{1}{u} = \frac{1}{v} - \frac{1}{f} = \frac{1}{100} - \frac{1}{10}$।`,
          ),
        },
        {
          id: "same",
          label: t("Still 10.5 cm", "फिर भी 10.5 सेमी"),
          feedback: t(
            "Move the wall and the image distance v changes, so u changes too. Work it out with v = +100 cm.",
            "दीवार खिसकाओ तो प्रतिबिंब दूरी v बदलती है, इसलिए u भी बदलता है। v = +100 सेमी लेकर निकालो।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Where the phone goes", "फ़ोन कहाँ जाए")),
      w.body(
        t(
          r`Now Riya's own question. The magnifying glass has $f = +10$ cm. The wall is where the sharp picture must land, 2 m = 200 cm on the far side: $$v = +200 \text{ cm}, \qquad f = +10 \text{ cm}$$`,
          r`अब रिया का अपना सवाल। आवर्धक काँच की $f = +10$ सेमी है। साफ़ तस्वीर दीवार पर बननी है, दूसरी ओर 2 मीटर = 200 सेमी पर: $$v = +200 \text{ सेमी}, \qquad f = +10 \text{ सेमी}$$`,
        ),
      ),
      w.body(
        t(
          r`From the lens formula, $\frac{1}{u} = \frac{1}{v} - \frac{1}{f}$: $$\begin{aligned} \frac{1}{u} &= \frac{1}{200} - \frac{1}{10} \\ &= \frac{1}{200} - \frac{20}{200} = -\frac{19}{200} \\ u &= -\frac{200}{19} \approx -10.5 \text{ cm} \end{aligned}$$ The phone goes on its own side of the lens, **10.5 cm** from it: just outside $F_1$, between $F_1$ and $2F_1$, exactly the projector case.`,
          r`लेंस सूत्र से, $\frac{1}{u} = \frac{1}{v} - \frac{1}{f}$: $$\begin{aligned} \frac{1}{u} &= \frac{1}{200} - \frac{1}{10} \\ &= \frac{1}{200} - \frac{20}{200} = -\frac{19}{200} \\ u &= -\frac{200}{19} \approx -10.5 \text{ सेमी} \end{aligned}$$ फ़ोन लेंस की अपनी ओर, उससे **10.5 सेमी** पर जाता है: $F_1$ से ज़रा बाहर, $F_1$ और $2F_1$ के बीच, ठीक प्रोजेक्टर वाली स्थिति।`,
        ),
      ),
      w.body(
        t(
          r`And how big is the movie? $$m = \frac{v}{u} = \frac{200}{-10.5} \approx -19$$ The picture on the wall is **19 times** taller than the phone's screen. A 7 cm screen becomes a picture about 1.3 m tall. The minus sign says it's upside down, which is why the phone goes in upside down.`,
          r`और फ़िल्म कितनी बड़ी होगी? $$m = \frac{v}{u} = \frac{200}{-10.5} \approx -19$$ दीवार पर तस्वीर फ़ोन की स्क्रीन से **19 गुना** ऊँची है। 7 सेमी की स्क्रीन लगभग 1.3 मीटर ऊँची तस्वीर बन जाती है। ऋण चिह्न बताता है कि यह उल्टी है, इसीलिए फ़ोन उल्टा रखा जाता है।`,
        ),
      ),
      w.body(
        t(
          r`A 2 m wall won't fit on this screen, so here is the same set-up with the wall only 60 cm away. Then $$\frac{1}{u} = \frac{1}{60} - \frac{1}{10} = -\frac{5}{60}, \qquad u = -12 \text{ cm}$$ and the picture is $m = \frac{60}{-12} = -5$: five times taller, upside down. Move the wall farther and the phone creeps closer to $F_1$, and the picture grows.`,
          r`2 मीटर की दीवार इस स्क्रीन पर नहीं समाती, इसलिए यहाँ वही व्यवस्था है जिसमें दीवार केवल 60 सेमी दूर है। तब $$\frac{1}{u} = \frac{1}{60} - \frac{1}{10} = -\frac{5}{60}, \qquad u = -12 \text{ सेमी}$$ और तस्वीर $m = \frac{60}{-12} = -5$ है: पाँच गुना ऊँची, उल्टी। दीवार और दूर करो तो फ़ोन $F_1$ की ओर सरकता है, और तस्वीर बढ़ती है।`,
        ),
      ),
      setup,
      closer,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** NCERT Exercise 9: half the lens covered. */
const covered = page(
  "covered",
  (b) => {
    const w = wordsOn(b);
    const g = b.prop(lensDef, "lens", {
      kind: LensKind.Convex,
      focalLength: 10,
      object: { x: -30, height: 5 },
      rays: [LensRay.Parallel, LensRay.Centre],
      showImage: true,
      showLabels: true,
      cover: LensCover.Top,
    });
    b.studentOnly(g.action(LensAction.MoveObject));
    b.standsFor(
      g,
      "a convex lens with its top half covered by black paper; rays still pass through the bottom half and the whole image still forms, dimmer",
    );
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "Kabir's thumb covers half the lens. Does the wall still show the whole movie?",
        "कबीर का अँगूठा आधे लेंस को ढक देता है। क्या दीवार पर फिर भी पूरी फ़िल्म दिखती है?",
      ),
      options: [
        { id: "right", label: t("Yes, the whole picture, but dimmer", "हाँ, पूरी तस्वीर, पर मद्धम") },
        {
          id: "half",
          label: t("No, only half the picture", "नहीं, केवल आधी तस्वीर"),
          feedback: t(
            "Light from every point of the object still passes through the open half and meets at that point's image. Only less of it gets through.",
            "वस्तु के हर बिंदु से प्रकाश फिर भी खुले आधे हिस्से से गुज़रता है और उस बिंदु के प्रतिबिंब पर मिलता है। बस कम प्रकाश पार होता है।",
          ),
        },
        {
          id: "none",
          label: t("No picture at all, just a shadow", "कोई तस्वीर नहीं, बस एक छाया"),
          feedback: t(
            "The open half still bends light. Look at the rays through it in the picture.",
            "खुला आधा हिस्सा फिर भी प्रकाश मोड़ता है। चित्र में उससे होकर जाती किरणें देखो।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Kabir's thumb", "कबीर का अँगूठा")),
      w.body(
        t(
          "Testing again, Kabir grabs the front of the box and his thumb ends up over half the magnifying glass. Riya expects half the movie to vanish. It doesn't. Every point of the phone sends rays through every part of the lens. Cover the top half, and the rays through the bottom half still meet at the same image points. So the whole image still forms. It is dimmer, because less light gets through. (This is NCERT's half-covered lens.)",
          "फिर से परखते हुए कबीर डिब्बे का अगला हिस्सा पकड़ता है और उसका अँगूठा आधे आवर्धक काँच पर आ जाता है। रिया को लगता है आधी फ़िल्म ग़ायब हो जाएगी। ऐसा नहीं होता। फ़ोन का हर बिंदु लेंस के हर हिस्से से होकर किरणें भेजता है। ऊपरी आधा ढको, तो निचले आधे से होकर जाती किरणें फिर भी उन्हीं प्रतिबिंब-बिंदुओं पर मिलती हैं। इसलिए पूरा प्रतिबिंब फिर भी बनता है। वह मद्धम होता है, क्योंकि कम प्रकाश पार होता है। (यही NCERT का आधा ढका लेंस है।)",
        ),
      ),
      g,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** NCERT Example 10.3: concave lens, image at 10 cm. */
const exampleConcave = page("example-concave", (b) => {
  const w = wordsOn(b);
  const diagram = b.prop(lensDef, "diagram", {
    kind: LensKind.Concave,
    focalLength: 15,
    object: { x: -30, height: 5 },
    rays: [LensRay.Parallel, LensRay.Centre],
    showImage: true,
    showLabels: true,
    showDistances: true,
  });
  b.standsFor(
    diagram,
    "the ray diagram for this example: a concave lens of f = 15 cm, the object 30 cm to the left, and its virtual, erect, smaller image 10 cm from the lens on the same side",
  );
  return column([
    w.title(t("Example: a concave lens", "उदाहरण: अवतल लेंस")),
    w.body(
      t(
        "**A concave lens has a focal length of 15 cm. Where should the object be so that the image forms 10 cm from the lens? Find the magnification.**",
        "**एक अवतल लेंस की फोकस दूरी 15 सेमी है। वस्तु कहाँ रखी जाए कि प्रतिबिंब लेंस से 10 सेमी पर बने? आवर्धन ज्ञात करो।**",
      ),
    ),
    w.body(
      t(
        r`A concave lens always makes a virtual image on the object's side, so $v$ is negative. Its focal length is negative too: $$v = -10 \text{ cm}, \qquad f = -15 \text{ cm}$$`,
        r`अवतल लेंस हमेशा वस्तु वाली ओर आभासी प्रतिबिंब बनाता है, इसलिए $v$ ऋणात्मक है। उसकी फोकस दूरी भी ऋणात्मक है: $$v = -10 \text{ सेमी}, \qquad f = -15 \text{ सेमी}$$`,
      ),
    ),
    w.body(
      t(
        r`From the lens formula, $\frac{1}{u} = \frac{1}{v} - \frac{1}{f}$: $$\begin{aligned} \frac{1}{u} &= \frac{1}{-10} - \frac{1}{-15} \\ &= -\frac{3}{30} + \frac{2}{30} = -\frac{1}{30} \\ u &= -30 \text{ cm} \end{aligned}$$ The object is 30 cm from the lens.`,
        r`लेंस सूत्र से, $\frac{1}{u} = \frac{1}{v} - \frac{1}{f}$: $$\begin{aligned} \frac{1}{u} &= \frac{1}{-10} - \frac{1}{-15} \\ &= -\frac{3}{30} + \frac{2}{30} = -\frac{1}{30} \\ u &= -30 \text{ सेमी} \end{aligned}$$ वस्तु लेंस से 30 सेमी पर है।`,
      ),
    ),
    w.body(
      t(
        r`$$m = \frac{v}{u} = \frac{-10}{-30} = +\frac{1}{3}$$ Positive: the image is virtual and erect, one third the size of the object. Here is the ray diagram:`,
        r`$$m = \frac{v}{u} = \frac{-10}{-30} = +\frac{1}{3}$$ धनात्मक: प्रतिबिंब आभासी और सीधा है, वस्तु का एक-तिहाई। यह रहा किरण आरेख:`,
      ),
    ),
    diagram,
    space(),
  ]);
});

/** NCERT Example 10.4: convex lens, 2 cm object at 15 cm. */
const exampleConvex = page("example-convex", (b) => {
  const w = wordsOn(b);
  const diagram = b.prop(lensDef, "diagram", {
    kind: LensKind.Convex,
    focalLength: 10,
    object: { x: -15, height: 2 },
    rays: [LensRay.Parallel, LensRay.Centre],
    showImage: true,
    showLabels: true,
    showDistances: true,
  });
  b.standsFor(
    diagram,
    "the ray diagram for this example: a convex lens of f = 10 cm, a 2 cm object 15 cm to the left, and its real, inverted image 4 cm tall, 30 cm on the other side",
  );
  return column([
    w.title(t("Example: a convex lens", "उदाहरण: उत्तल लेंस")),
    w.body(
      t(
        "**A 2.0 cm tall object stands 15 cm from a convex lens of focal length 10 cm. Find the position, size and nature of the image, and the magnification.**",
        "**2.0 सेमी ऊँची वस्तु 10 सेमी फोकस दूरी वाले उत्तल लेंस से 15 सेमी पर खड़ी है। प्रतिबिंब की स्थिति, आकार और प्रकृति, और आवर्धन ज्ञात करो।**",
      ),
    ),
    w.body(
      t(
        r`$$\begin{aligned} h &= +2.0 \text{ cm} \\ f &= +10 \text{ cm} \\ u &= -15 \text{ cm} \end{aligned}$$ From the lens formula, $\frac{1}{v} = \frac{1}{f} + \frac{1}{u}$: $$\begin{aligned} \frac{1}{v} &= \frac{1}{10} + \frac{1}{-15} \\ &= \frac{3}{30} - \frac{2}{30} = \frac{1}{30} \\ v &= +30 \text{ cm} \end{aligned}$$ Positive: the image is 30 cm on the **other side** of the lens, so it is real.`,
        r`$$\begin{aligned} h &= +2.0 \text{ सेमी} \\ f &= +10 \text{ सेमी} \\ u &= -15 \text{ सेमी} \end{aligned}$$ लेंस सूत्र से, $\frac{1}{v} = \frac{1}{f} + \frac{1}{u}$: $$\begin{aligned} \frac{1}{v} &= \frac{1}{10} + \frac{1}{-15} \\ &= \frac{3}{30} - \frac{2}{30} = \frac{1}{30} \\ v &= +30 \text{ सेमी} \end{aligned}$$ धनात्मक: प्रतिबिंब लेंस की **दूसरी ओर** 30 सेमी पर है, इसलिए वह वास्तविक है।`,
      ),
    ),
    w.body(
      t(
        r`$$\begin{aligned} m &= \frac{v}{u} = \frac{+30}{-15} = -2 \\ h' &= m \times h = -2 \times 2.0 = -4.0 \text{ cm} \end{aligned}$$ The image is real, inverted, 4.0 cm tall: twice the size of the object. Here is the ray diagram:`,
        r`$$\begin{aligned} m &= \frac{v}{u} = \frac{+30}{-15} = -2 \\ h' &= m \times h = -2 \times 2.0 = -4.0 \text{ सेमी} \end{aligned}$$ प्रतिबिंब वास्तविक, उल्टा, 4.0 सेमी ऊँचा है: वस्तु का दोगुना। यह रहा किरण आरेख:`,
      ),
    ),
    diagram,
    space(),
  ]);
});

/** NCERT Exercises 10 and 11. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const where = choiceQuestion(b, {
      name: "where",
      prompt: t(
        "A 5 cm object is 25 cm from a converging lens of focal length 10 cm. Where is the image?",
        "5 सेमी की वस्तु 10 सेमी फोकस दूरी वाले अभिसारी लेंस से 25 सेमी पर है। प्रतिबिंब कहाँ है?",
      ),
      options: [
        { id: "right", label: t("16.7 cm on the other side", "दूसरी ओर 16.7 सेमी पर") },
        {
          id: "mirror",
          label: t("7.1 cm on the other side", "दूसरी ओर 7.1 सेमी पर"),
          feedback: t(
            r`That's from adding $\frac{1}{u}$ as the mirror formula does. For a lens, $\frac{1}{v} = \frac{1}{f} + \frac{1}{u} = \frac{1}{10} - \frac{1}{25}$.`,
            r`यह दर्पण सूत्र की तरह $\frac{1}{u}$ जोड़ने से आया। लेंस के लिए $\frac{1}{v} = \frac{1}{f} + \frac{1}{u} = \frac{1}{10} - \frac{1}{25}$।`,
          ),
        },
        {
          id: "same",
          label: t("16.7 cm on the same side", "उसी ओर 16.7 सेमी पर"),
          feedback: t(
            "v comes out positive, so the image is on the far side: real.",
            "v धनात्मक आता है, इसलिए प्रतिबिंब दूसरी ओर है: वास्तविक।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const working = w.body(
      t(
        r`$$\begin{aligned} \frac{1}{v} &= \frac{1}{10} + \frac{1}{-25} = \frac{5}{50} - \frac{2}{50} = \frac{3}{50} \\ v &= +16.7 \text{ cm} \\ m &= \frac{v}{u} = \frac{16.7}{-25} = -0.67 \\ h' &= -0.67 \times 5 = -3.3 \text{ cm} \end{aligned}$$ The image is real, inverted and smaller, 3.3 cm tall.`,
        r`$$\begin{aligned} \frac{1}{v} &= \frac{1}{10} + \frac{1}{-25} = \frac{5}{50} - \frac{2}{50} = \frac{3}{50} \\ v &= +16.7 \text{ सेमी} \\ m &= \frac{v}{u} = \frac{16.7}{-25} = -0.67 \\ h' &= -0.67 \times 5 = -3.3 \text{ सेमी} \end{aligned}$$ प्रतिबिंब वास्तविक, उल्टा और छोटा, 3.3 सेमी ऊँचा है।`,
      ),
      "working",
      { isHidden: true },
    );
    const log = w.definition(
      t(
        '**Mission log.** ✓ With the wall 2 m away, the phone sits about **10.5 cm** from the lens, upside down, and the movie comes out about 19 times bigger. No more sliding. ? One last offer from Grandpa: "Why not use my reading glasses instead of my magnifier?"',
        '**मिशन लॉग।** ✓ दीवार 2 मीटर दूर हो, तो फ़ोन लेंस से लगभग **10.5 सेमी** पर, उल्टा, रहता है, और फ़िल्म लगभग 19 गुना बड़ी निकलती है। अब खिसकाना नहीं। ? दादाजी का एक आख़िरी सुझाव: "मेरे आवर्धक काँच की जगह मेरा पढ़ने का चश्मा क्यों नहीं?"',
      ),
      "log",
      { isHidden: true },
    );
    b.when(where.on(QuestionSignal.Correct), [
      theBoard.show(working),
      theBoard.show(log),
      theBoard.pass(),
    ]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), where, working, log, space()]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [
  hook,
  signs,
  formula,
  magnification,
  projector,
  covered,
  exampleConcave,
  exampleConvex,
  yourTurn,
];

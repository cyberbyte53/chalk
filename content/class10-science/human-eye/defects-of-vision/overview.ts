import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, goalQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  EyeAction,
  EyeDefect,
  EyeDerived,
  EyeSceneKind,
  eyeFor,
  eyeModelDef,
  eyeSceneDef,
} from "@chalk/prop-eye";

const r = String.raw;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** Saturday at the optician's. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const test = b.prop(eyeSceneDef, "test", { scene: EyeSceneKind.EyeTest });
  b.standsFor(
    test,
    "the optician's room: Riya behind a trial frame reading a letter chart on the far wall while the optician slides in lenses; Kabir watches",
  );
  return column([
    w.title(t("At the optician's", "चश्मे की दुकान पर")),
    test,
    w.body(
      t(
        "**Stop 3.** On Saturday Riya and Grandpa go for their eye test. The optician sits Riya in front of a chart of letters on the far wall and slips lenses into a trial frame, one after another, asking each time: *better, or worse?*",
        "**पड़ाव 3।** शनिवार को रिया और दादाजी आँखों की जाँच के लिए जाते हैं। ऑप्टिशियन रिया को सामने की दीवार पर अक्षरों के चार्ट के आगे बिठाती है और एक परीक्षण फ़्रेम में एक के बाद एक लेंस डालती है, और हर बार पूछती है: *बेहतर, या ख़राब?*",
      ),
    ),
    w.body(
      t(
        "Now we know a normal eye sees clearly from 25 cm to infinity. Riya's eye can't reach far, and Grandpa's can't reach near. What exactly has gone wrong in each, and how does a lens in front of the eye put it right?",
        "अब हम जानते हैं कि सामान्य आँख 25 सेमी से अनंत तक साफ़ देखती है। रिया की आँख दूर तक नहीं पहुँचती, और दादाजी की पास तक नहीं। हर एक में ठीक-ठीक क्या गड़बड़ है, और आँख के आगे रखा लेंस उसे कैसे ठीक करता है?",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Myopia: far things blur; the image forms in front of the retina; a concave lens fixes it. */
const myopia = page(
  "myopia",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "Myopia (near-sightedness): the far point is nearer than infinity; the image of a far object forms in front of the retina; causes: too much curvature of the eye lens, or a longer eyeball; corrected by a concave lens of suitable power.",
    );
    const eye = b.prop(
      eyeModelDef,
      "eye",
      eyeFor(EyeDefect.Myopia, {
        farPointCm: 200,
        objectCm: null,
        showNames: false,
        showRays: true,
        showSees: true,
        showReadout: true,
        canMoveObject: false,
        canSetCorrection: true,
      }),
    );
    b.studentOnly(eye.action(EyeAction.SetCorrection));
    b.standsFor(
      eye,
      "Riya's myopic eye, far point 2 m, looking at something far away: the rays meet in front of the retina and spread again, so the chart is blurred; a spectacle lens can be put in front and its power changed in quarter dioptres",
    );
    const goal = goalQuestion(b, {
      about: eye,
      prompt: t(
        "This is Riya's eye: she sees clearly only up to 2 m. Put a lens in front of it and change its power until the far chart is sharp. Then Check.",
        "यह रिया की आँख है: वह केवल 2 मीटर तक साफ़ देखती है। इसके आगे एक लेंस रखो और उसकी क्षमता तब तक बदलो जब तक दूर का चार्ट साफ़ न हो जाए। फिर जाँचो।",
      ),
      isMet: eye.derived(EyeDerived.CanSeeFar),
      solve: [eye.learner(EyeAction.SetCorrection, { power: -0.5 })],
      notes: [
        {
          when: eye.derived(EyeDerived.ImageAt).eq("inFront"),
          say: t(
            "The rays still meet in front of the retina: they are being bent too much. You need a lens that spreads them out a little first: a concave lens, with a minus power. Try more minus.",
            "किरणें अब भी दृष्टिपटल के आगे मिल रही हैं: वे ज़्यादा मुड़ रही हैं। तुम्हें ऐसा लेंस चाहिए जो उन्हें पहले थोड़ा फैला दे: अवतल लेंस, ऋण क्षमता वाला। और ऋण आज़माओ।",
          ),
          reach: [eye.learner(EyeAction.SetCorrection, { power: 1 })],
        },
      ],
    });
    const why = w.body(
      t(
        "A **−0.5 D** lens, a concave lens, does it. It spreads the light from a far object just enough that it seems to come from the eye's own far point, 2 m away, where the eye can focus. So the image lands back on the retina.",
        "**−0.5 D** का लेंस, एक अवतल लेंस, काम कर देता है। यह दूर की वस्तु से आए प्रकाश को ठीक इतना फैलाता है कि वह आँख के अपने दूर बिंदु, 2 मीटर, से आता लगे, जहाँ आँख फ़ोकस कर सकती है। इसलिए प्रतिबिंब वापस दृष्टिपटल पर आ जाता है।",
      ),
      "why",
      { isHidden: true },
    );
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(why));
    return column([
      w.title(t("Myopia: far things blur", "निकट-दृष्टिता: दूर की चीज़ें धुँधली")),
      w.definition(
        t(
          "**Defects of vision.** Sometimes the eye gradually loses some of its power of accommodation, and the picture blurs. These are **refractive defects** of vision: the eye bends light wrongly. The three common ones are **myopia**, **hypermetropia** and **presbyopia**. Each is corrected with a suitable spherical lens.",
          "**दृष्टि दोष।** कभी-कभी आँख धीरे-धीरे अपनी समंजन क्षमता का कुछ हिस्सा खो देती है, और तस्वीर धुँधली हो जाती है। ये दृष्टि के **अपवर्तक दोष** हैं: आँख प्रकाश को गलत मोड़ती है। तीन आम दोष हैं **निकट-दृष्टिता**, **दूर-दृष्टिता** और **जरा-दूरदृष्टिता**। हर एक उपयुक्त गोलीय लेंस से ठीक होता है।",
        ),
      ),
      w.definition(
        t(
          "**Myopia** (near-sightedness). A myopic person sees **near** things clearly but **far** things blur. The **far point is nearer than infinity**: perhaps a few metres. The image of a far object forms **in front of the retina**. Causes: (i) the eye lens is **too curved**, or (ii) the **eyeball is too long**. Correction: a **concave lens** of suitable power.",
          "**निकट-दृष्टिता** (मायोपिया)। निकट-दृष्टि वाला व्यक्ति **पास** की चीज़ें साफ़ देखता है पर **दूर** की धुँधली। **दूर बिंदु अनंत से पास** होता है: शायद कुछ मीटर। दूर की वस्तु का प्रतिबिंब **दृष्टिपटल के आगे** बनता है। कारण: (i) नेत्र लेंस का **बहुत ज़्यादा वक्रित** होना, या (ii) **नेत्र गोलक का लंबा** होना। उपचार: उपयुक्त क्षमता का **अवतल लेंस**।",
        ),
      ),
      eye,
      goal,
      why,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The power for myopia, worked: f = −(far point). */
const myopiaPower = page(
  "myopia-power",
  (b) => {
    const w = wordsOn(b);
    const sign = choiceQuestion(b, {
      name: "sign",
      prompt: t(
        "Another myopic eye's far point is 80 cm. What is the power of the lens it needs?",
        "किसी दूसरी निकट-दृष्टि वाली आँख का दूर बिंदु 80 सेमी है। उसे कितनी क्षमता का लेंस चाहिए?",
      ),
      options: [
        { id: "right", label: t("−1.25 D (concave)", "−1.25 D (अवतल)") },
        {
          id: "plus",
          label: t("+1.25 D (convex)", "+1.25 D (उत्तल)"),
          feedback: t(
            "A convex lens would bend the light even more, and this eye already bends too much. Myopia needs a concave lens: minus power.",
            "उत्तल लेंस प्रकाश को और ज़्यादा मोड़ेगा, और यह आँख पहले ही ज़्यादा मोड़ती है। निकट-दृष्टिता को अवतल लेंस चाहिए: ऋण क्षमता।",
          ),
        },
        {
          id: "two",
          label: t("−0.8 D", "−0.8 D"),
          feedback: t(
            r`−0.8 m is the focal length. Power is 1 divided by the focal length **in metres**: $P = \dfrac{1}{-0.8} = -1.25$ D.`,
            r`−0.8 मी फ़ोकस दूरी है। क्षमता 1 को **मीटर में** फ़ोकस दूरी से भाग देकर मिलती है: $P = \dfrac{1}{-0.8} = -1.25$ D।`,
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("How strong a lens?", "कितना तेज़ लेंस?")),
      w.body(
        t(
          "The lens must take light from a very far object and make it seem to come from the eye's far point. That is just what a concave lens does with parallel light: it spreads it so it seems to come from its focus. So the focus of the lens must sit at the far point:",
          "लेंस को बहुत दूर की वस्तु से आए प्रकाश को ऐसा बनाना है कि वह आँख के दूर बिंदु से आता लगे। समानांतर प्रकाश के साथ अवतल लेंस ठीक यही करता है: वह उसे फैलाता है ताकि वह उसके फ़ोकस से आता लगे। तो लेंस का फ़ोकस दूर बिंदु पर होना चाहिए:",
        ),
      ),
      w.body(t(r`$$f = -(\text{far point})$$`, r`$$f = -(\text{दूर बिंदु})$$`)),
      w.body(
        t(
          "The minus sign says the lens is concave. Then, from the light chapter, the power in dioptres is 1 over the focal length in metres. For Riya's far point of 2 m:",
          "ऋण चिह्न बताता है कि लेंस अवतल है। फिर, प्रकाश वाले अध्याय से, डायॉप्टर में क्षमता 1 बटा मीटर में फ़ोकस दूरी है। रिया के 2 मीटर वाले दूर बिंदु के लिए:",
        ),
      ),
      w.body(
        t(
          r`$$P = \frac{1}{f} = \frac{1}{-2\ \text{m}} = -0.5\ \text{D}$$`,
          r`$$P = \frac{1}{f} = \frac{1}{-2\ \text{मी}} = -0.5\ \text{D}$$`,
        ),
      ),
      sign,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Hypermetropia: near things blur; the image falls behind the retina; a convex lens fixes it. */
const hyper = page(
  "hypermetropia",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "Hypermetropia (far-sightedness): the near point is farther than 25 cm; light from a near object would focus behind the retina; causes: focal length of the eye lens too long, or the eyeball too short; corrected by a convex lens.",
    );
    const eye = b.prop(
      eyeModelDef,
      "eye",
      eyeFor(EyeDefect.Hypermetropia, {
        objectCm: 25,
        showNames: false,
        showRays: true,
        showSees: true,
        showReadout: true,
        canMoveObject: false,
        canSetCorrection: true,
      }),
    );
    b.studentOnly(eye.action(EyeAction.SetCorrection));
    b.standsFor(
      eye,
      "a hypermetropic eye with its near point at 1 m looking at a page 25 cm away: the rays would meet behind the retina, so the page is blurred; a spectacle lens can be put in front",
    );
    const goal = goalQuestion(b, {
      about: eye,
      prompt: t(
        "This eye's near point is 1 m. Put a lens in front so it reads the page at 25 cm. Then Check.",
        "इस आँख का निकट बिंदु 1 मीटर है। इसके आगे एक लेंस रखो ताकि यह 25 सेमी पर पन्ना पढ़ सके। फिर जाँचो।",
      ),
      isMet: eye.derived(EyeDerived.IsSharp),
      solve: [eye.learner(EyeAction.SetCorrection, { power: 3 })],
      notes: [
        {
          when: eye.derived(EyeDerived.ImageAt).eq("behind"),
          say: t(
            "The rays still reach the retina before they meet: they need more bending. Add a convex lens with a plus power, and try more plus.",
            "किरणें अब भी मिलने से पहले दृष्टिपटल तक पहुँच रही हैं: उन्हें और मोड़ना है। धन क्षमता वाला उत्तल लेंस लगाओ, और ज़्यादा धन आज़माओ।",
          ),
          reach: [eye.learner(EyeAction.SetCorrection, { power: -1 })],
        },
      ],
    });
    return column([
      w.title(t("Hypermetropia: near things blur", "दूर-दृष्टिता: पास की चीज़ें धुँधली")),
      w.definition(
        t(
          "**Hypermetropia** (far-sightedness). A hypermetropic person sees **far** things clearly but **near** things blur. The **near point is farther than 25 cm**, so reading matter has to be held far away. Light from a near object would focus **behind the retina**. Causes: (i) the **focal length of the eye lens is too long**, or (ii) the **eyeball is too small**. Correction: a **convex lens** of suitable power, which adds the extra bending the eye can't supply.",
          "**दूर-दृष्टिता** (हाइपरमेट्रोपिया)। दूर-दृष्टि वाला व्यक्ति **दूर** की चीज़ें साफ़ देखता है पर **पास** की धुँधली। **निकट बिंदु 25 सेमी से दूर** होता है, इसलिए पढ़ने की चीज़ दूर पकड़नी पड़ती है। पास की वस्तु से आया प्रकाश **दृष्टिपटल के पीछे** फ़ोकस होता। कारण: (i) **नेत्र लेंस की फ़ोकस दूरी बहुत लंबी** होना, या (ii) **नेत्र गोलक का बहुत छोटा** होना। उपचार: उपयुक्त क्षमता का **उत्तल लेंस**, जो वह अतिरिक्त मोड़ देता है जो आँख नहीं दे पाती।",
        ),
      ),
      eye,
      goal,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The power for hypermetropia, worked with the lens formula. */
const hyperPower = page("hyper-power", (b) => {
  const w = wordsOn(b);
  return column([
    w.title(t("Working out +3 D", "+3 D निकालना")),
    w.body(
      t(
        "The convex lens must take a page held at the normal near point, 25 cm, and make a virtual image of it at the eye's own near point, 1 m, where the eye can focus. In the lens formula from the light chapter, the page and its virtual image are both on the **same side of the lens**, the side away from the eye, so both distances are negative:",
        "उत्तल लेंस को सामान्य निकट बिंदु, 25 सेमी, पर रखे पन्ने का आभासी प्रतिबिंब आँख के अपने निकट बिंदु, 1 मीटर, पर बनाना है, जहाँ आँख फ़ोकस कर सकती है। प्रकाश वाले अध्याय के लेंस सूत्र में पन्ना और उसका आभासी प्रतिबिंब दोनों **लेंस की एक ही ओर** हैं, आँख से दूर वाली ओर, इसलिए दोनों दूरियाँ ऋणात्मक हैं:",
      ),
    ),
    w.body(
      t(
        r`$$u = -25\ \text{cm}, \qquad v = -100\ \text{cm}$$`,
        r`$$u = -25\ \text{सेमी}, \qquad v = -100\ \text{सेमी}$$`,
      ),
    ),
    w.body(t("Then", "तब")),
    w.body(
      t(
        r`$$\frac{1}{f} = \frac{1}{v} - \frac{1}{u} = -\frac{1}{100} + \frac{1}{25} = \frac{3}{100}$$`,
        r`$$\frac{1}{f} = \frac{1}{v} - \frac{1}{u} = -\frac{1}{100} + \frac{1}{25} = \frac{3}{100}$$`,
      ),
    ),
    w.body(
      t(
        r`So $f = \dfrac{100}{3}$ cm $= \dfrac{1}{3}$ m, and the power is`,
        r`तो $f = \dfrac{100}{3}$ सेमी $= \dfrac{1}{3}$ मी, और क्षमता है`,
      ),
    ),
    w.body(t(r`$$P = \frac{1}{f} = +3\ \text{D}$$`, r`$$P = \frac{1}{f} = +3\ \text{D}$$`)),
    w.note(
      t(
        "This is NCERT Exercise 7. Plus, so convex: just what the eye model needed.",
        "यह एनसीईआरटी का अभ्यास 7 है। धन, इसलिए उत्तल: ठीक वही जो आँख के मॉडल को चाहिए था।",
      ),
    ),
    space(),
  ]);
});

/** Presbyopia, bifocals, and modern fixes. */
const presbyopia = page(
  "presbyopia",
  (b) => {
    const w = wordsOn(b);
    const bifocal = b.prop(eyeSceneDef, "bifocal", { scene: EyeSceneKind.Bifocals });
    b.standsFor(
      bifocal,
      "Grandpa wearing bifocals: an inset of one lens shows the upper part marked 'far' and the lower part marked 'near'; he looks up at the TV and down at a book",
    );
    const lower = choiceQuestion(b, {
      name: "lower",
      prompt: t(
        "In a common bifocal lens, which part is the convex lens, and what is it for?",
        "आम द्विफ़ोकसी लेंस में कौन-सा भाग उत्तल लेंस है, और वह किसलिए है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "The lower part, for reading (near vision)",
            "निचला भाग, पढ़ने (पास की दृष्टि) के लिए",
          ),
        },
        {
          id: "upper",
          label: t("The upper part, for distant vision", "ऊपरी भाग, दूर की दृष्टि के लिए"),
          feedback: t(
            "Far vision needs the concave part, at the top. You look down to read, so the convex part is at the bottom.",
            "दूर की दृष्टि को अवतल भाग चाहिए, ऊपर। तुम पढ़ने के लिए नीचे देखते हो, इसलिए उत्तल भाग नीचे है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Presbyopia: eyes that grow old", "जरा-दूरदृष्टिता: बूढ़ी होती आँखें")),
      w.definition(
        t(
          "**Presbyopia.** With age, the power of accommodation usually decreases: the **ciliary muscles weaken** and the **eye lens becomes less flexible**. The near point slowly moves away, and reading without glasses gets hard. This is **presbyopia**. It is corrected with a **convex lens**, just like hypermetropia. If the person also needs help with far things, they wear **bifocals**.",
          "**जरा-दूरदृष्टिता।** उम्र के साथ समंजन क्षमता आमतौर पर घटती है: **पक्ष्माभी पेशियाँ कमज़ोर** पड़ती हैं और **नेत्र लेंस का लचीलापन कम** हो जाता है। निकट बिंदु धीरे-धीरे दूर खिसकता है, और बिना चश्मे के पढ़ना कठिन हो जाता है। यह **जरा-दूरदृष्टिता** है। यह **उत्तल लेंस** से ठीक होती है, ठीक दूर-दृष्टिता की तरह। अगर दूर की चीज़ों के लिए भी मदद चाहिए, तो **द्विफ़ोकसी** लेंस पहने जाते हैं।",
        ),
      ),
      w.definition(
        t(
          "**Bifocal lenses.** Some people have both myopia and hypermetropia. They need **bifocals**: the **upper** part is a **concave** lens for distant vision, the **lower** part a **convex** lens for near vision. Today defects can also be corrected with **contact lenses** or by **surgery**.",
          "**द्विफ़ोकसी लेंस।** कुछ लोगों को निकट-दृष्टिता और दूर-दृष्टिता दोनों होती हैं। उन्हें **द्विफ़ोकसी** चश्मे चाहिए: **ऊपरी** भाग दूर की दृष्टि के लिए **अवतल** लेंस, **निचला** भाग पास की दृष्टि के लिए **उत्तल** लेंस। आजकल दोष **कॉन्टैक्ट लेंस** या **शल्य-चिकित्सा** से भी ठीक हो सकते हैं।",
        ),
      ),
      bifocal,
      lower,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Eye donation: NCERT's "Think it over" box. */
const donate = page(
  "donate",
  (b) => {
    const w = wordsOn(b);
    const pledge = b.prop(eyeSceneDef, "pledge", { scene: EyeSceneKind.EyePledge });
    b.standsFor(
      pledge,
      "Mom signing an eye-donation pledge form at a table while Riya watches; a poster says one pair of eyes gives sight to up to four people",
    );
    const four = choiceQuestion(b, {
      name: "four",
      prompt: t(
        "One pair of donated eyes can give sight to up to how many people with corneal blindness?",
        "दान की गई एक जोड़ी आँखें कॉर्निया-अंधता वाले अधिकतम कितने लोगों को दृष्टि दे सकती हैं?",
      ),
      options: [
        { id: "right", label: t("Four", "चार") },
        {
          id: "one",
          label: t("One", "एक"),
          feedback: t(
            "More than that: the cornea can be shared, so one pair helps up to four people.",
            "उससे ज़्यादा: कॉर्निया बाँटा जा सकता है, इसलिए एक जोड़ी चार लोगों तक की मदद करती है।",
          ),
        },
        {
          id: "two",
          label: t("Two", "दो"),
          feedback: t(
            "Up to four, according to NCERT: one pair gives sight to up to four corneal-blind people.",
            "एनसीईआरटी के अनुसार चार तक: एक जोड़ी चार कॉर्निया-अंध लोगों तक को दृष्टि देती है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Passing on the gift of sight", "दृष्टि का उपहार आगे देना")),
      pledge,
      w.body(
        t(
          "While Riya waits for her glasses, Mom picks up a leaflet at the counter. Our eyes can live on after we die. About 4.5 million people with **corneal blindness** (a damaged cornea) could be cured with donated eyes, and 60% of them are children under 12.",
          "जब रिया अपने चश्मे का इंतज़ार कर रही है, मम्मी काउंटर से एक पर्चा उठाती हैं। हमारी आँखें हमारे मरने के बाद भी जी सकती हैं। **कॉर्निया-अंधता** (क्षतिग्रस्त कॉर्निया) वाले लगभग 45 लाख लोग दान की गई आँखों से ठीक हो सकते हैं, और उनमें 60% 12 साल से छोटे बच्चे हैं।",
        ),
      ),
      w.definition(
        t(
          "**About eye donation.** Donors can be of any age or sex, even people who wear glasses or had cataract surgery. Eyes must be removed within 4–6 hours after death, so the nearest eye bank must be told at once. Removal takes 10–15 minutes and causes no disfigurement. People who had certain infections (such as AIDS, hepatitis B or C, rabies) cannot donate. Donor and receiver stay anonymous.",
          "**नेत्रदान के बारे में।** दाता किसी भी उम्र या लिंग का हो सकता है, चश्मा पहनने वाले या मोतियाबिंद की शल्य-चिकित्सा करा चुके लोग भी। आँखें मृत्यु के 4–6 घंटे के अंदर निकालनी होती हैं, इसलिए पास के नेत्र बैंक को तुरंत बताना चाहिए। इसमें 10–15 मिनट लगते हैं और चेहरा बिगड़ता नहीं। कुछ संक्रमणों (जैसे एड्स, हेपेटाइटिस बी या सी, रेबीज़) वाले लोग दान नहीं कर सकते। दाता और पाने वाले की पहचान गुप्त रहती है।",
        ),
      ),
      four,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** Back at the optician's: the two prescriptions. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const riya = choiceQuestion(b, {
      name: "riya",
      prompt: t(
        "The optician confirms that Riya sees clearly only up to 2 m. What does her prescription say?",
        "ऑप्टिशियन पक्का करती है कि रिया केवल 2 मीटर तक साफ़ देखती है। उसके पर्चे में क्या लिखा है?",
      ),
      options: [
        {
          id: "right",
          label: t("Myopia: a concave lens of −0.5 D", "निकट-दृष्टिता: −0.5 D का अवतल लेंस"),
        },
        {
          id: "hyper",
          label: t("Hypermetropia: a convex lens of +0.5 D", "दूर-दृष्टिता: +0.5 D का उत्तल लेंस"),
          feedback: t(
            "Her trouble is with far things, the blackboard. That's myopia, and it needs a concave lens.",
            "उसकी परेशानी दूर की चीज़ों, ब्लैकबोर्ड, से है। यह निकट-दृष्टिता है, और इसे अवतल लेंस चाहिए।",
          ),
        },
        {
          id: "power",
          label: t("Myopia: a concave lens of −2 D", "निकट-दृष्टिता: −2 D का अवतल लेंस"),
          feedback: t(
            r`2 m is the far point, so $f = -2$ m. The power is $\dfrac{1}{-2} = -0.5$ D.`,
            r`2 मीटर दूर बिंदु है, इसलिए $f = -2$ मी। क्षमता $\dfrac{1}{-2} = -0.5$ D है।`,
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const grandpa = choiceQuestion(b, {
      name: "grandpa",
      prompt: t(
        "Grandpa sees far things fine, but his near point is now 1 m. He also says the TV looks a little fuzzy lately. What does the optician suggest?",
        "दादाजी दूर की चीज़ें ठीक देखते हैं, पर उनका निकट बिंदु अब 1 मीटर है। वे यह भी कहते हैं कि हाल में टीवी थोड़ा धुँधला दिखता है। ऑप्टिशियन क्या सुझाती है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Bifocals: concave on top for the TV, +3 D convex below for reading",
            "द्विफ़ोकसी: टीवी के लिए ऊपर अवतल, पढ़ने के लिए नीचे +3 D उत्तल",
          ),
        },
        {
          id: "concave",
          label: t(
            "A single strong concave lens, worn all day for every distance",
            "एक ही तेज़ अवतल लेंस, हर दूरी के लिए दिन भर पहना हुआ",
          ),
          feedback: t(
            "A concave lens would make reading even harder. Reading needs the convex part.",
            "अवतल लेंस पढ़ना और कठिन कर देगा। पढ़ने के लिए उत्तल भाग चाहिए।",
          ),
        },
        {
          id: "nothing",
          label: t(
            "Nothing: old eyes simply can't be corrected",
            "कुछ नहीं: बूढ़ी आँखें ठीक नहीं की जा सकतीं",
          ),
          feedback: t(
            "Presbyopia is common with age, but glasses correct it easily.",
            "उम्र के साथ जरा-दूरदृष्टिता आम है, पर चश्मे इसे आसानी से ठीक कर देते हैं।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
    });
    b.when(riya.on(QuestionSignal.Correct), theBoard.show(grandpa));
    return column([
      w.title(t("Two prescriptions", "दो पर्चे")),
      w.body(
        t(
          "Back at the optician's, the trial lenses give their answers. Riya reads the far chart through a concave lens and smiles. Grandpa reads the small print through a convex one and grumbles that it is too easy.",
          "ऑप्टिशियन के यहाँ परीक्षण लेंस अपने जवाब देते हैं। रिया अवतल लेंस से दूर का चार्ट पढ़ती है और मुस्कुराती है। दादाजी उत्तल लेंस से छोटे अक्षर पढ़ते हैं और बड़बड़ाते हैं कि यह तो बहुत आसान है।",
        ),
      ),
      riya,
      grandpa,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** NCERT in-text Q2 and Exercise 5, worked. */
const examples = page("examples", (b) => {
  const w = wordsOn(b);
  return column([
    w.title(t("Two worked examples", "दो हल किए उदाहरण")),
    w.body(
      t(
        "**A person with a myopic eye cannot see objects beyond 1.2 m distinctly. What lens corrects it?**",
        "**निकट-दृष्टि वाली आँख का व्यक्ति 1.2 मीटर से आगे की वस्तुएँ साफ़ नहीं देख पाता। कौन-सा लेंस इसे ठीक करेगा?**",
      ),
    ),
    w.body(
      t(
        "Myopia needs a concave lens, with its focus at the far point:",
        "निकट-दृष्टिता को अवतल लेंस चाहिए, जिसका फ़ोकस दूर बिंदु पर हो:",
      ),
    ),
    w.body(
      t(
        r`$$f = -1.2\ \text{m}, \qquad P = \frac{1}{-1.2} \approx -0.83\ \text{D}$$`,
        r`$$f = -1.2\ \text{मी}, \qquad P = \frac{1}{-1.2} \approx -0.83\ \text{D}$$`,
      ),
    ),
    w.body(
      t(
        "**A person needs a lens of power −5.5 D for distant vision and +1.5 D for near vision. Find the focal length of each.**",
        "**किसी व्यक्ति को दूर की दृष्टि के लिए −5.5 D और पास की दृष्टि के लिए +1.5 D क्षमता का लेंस चाहिए। हर एक की फ़ोकस दूरी ज्ञात करो।**",
      ),
    ),
    w.body(
      t(
        r`Turn the power round: $f = \dfrac{1}{P}$, in metres.`,
        r`क्षमता को उलटो: $f = \dfrac{1}{P}$, मीटर में।`,
      ),
    ),
    w.body(
      t(
        r`$$f_\text{far} = \frac{1}{-5.5} \approx -0.182\ \text{m} = -18.2\ \text{cm}$$`,
        r`$$f_\text{दूर} = \frac{1}{-5.5} \approx -0.182\ \text{मी} = -18.2\ \text{सेमी}$$`,
      ),
    ),
    w.body(
      t(
        r`$$f_\text{near} = \frac{1}{1.5} \approx 0.667\ \text{m} = +66.7\ \text{cm}$$`,
        r`$$f_\text{पास} = \frac{1}{1.5} \approx 0.667\ \text{मी} = +66.7\ \text{सेमी}$$`,
      ),
    ),
    w.note(
      t(
        "A concave lens for distance, a convex one for reading: this person needs bifocals.",
        "दूर के लिए अवतल, पढ़ने के लिए उत्तल: इस व्यक्ति को द्विफ़ोकसी चश्मा चाहिए।",
      ),
    ),
    space(),
  ]);
});

/** Your turn: NCERT in-text Q4 and Exercise 6, then the mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const last = choiceQuestion(b, {
      name: "last",
      prompt: t(
        "A student has difficulty reading the blackboard from the last row. What is the defect, and how is it corrected?",
        "एक विद्यार्थी को आख़िरी पंक्ति से ब्लैकबोर्ड पढ़ने में कठिनाई होती है। दोष क्या है, और इसे कैसे ठीक करते हैं?",
      ),
      options: [
        {
          id: "right",
          label: t("Myopia, corrected with a concave lens", "निकट-दृष्टिता, अवतल लेंस से ठीक"),
        },
        {
          id: "hyper",
          label: t("Hypermetropia, corrected with a convex lens", "दूर-दृष्टिता, उत्तल लेंस से ठीक"),
          feedback: t(
            "The blackboard is far away. Trouble with far things is myopia.",
            "ब्लैकबोर्ड दूर है। दूर की चीज़ों में परेशानी निकट-दृष्टिता है।",
          ),
        },
        {
          id: "presby",
          label: t("Presbyopia, corrected with bifocals", "जरा-दूरदृष्टिता, द्विफ़ोकसी से ठीक"),
          feedback: t(
            "Presbyopia comes with age and affects near vision. A student struggling with far things has myopia.",
            "जरा-दूरदृष्टिता उम्र के साथ आती है और पास की दृष्टि पर असर डालती है। दूर की चीज़ों में परेशान विद्यार्थी को निकट-दृष्टिता है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log: Part A done.** ✓ Myopia: far point too near, image in front of the retina, a concave lens (Riya: −0.5 D). ✓ Hypermetropia: near point too far, image behind the retina, a convex lens. ✓ Presbyopia (Grandpa): near point moved out to 1 m with age, a convex +3 D lens for reading; with a fuzzy TV too, bifocals. Next, the hills. Part B starts with the first page of Kabir's notebook: what does a glass prism do to light?",
        "**मिशन लॉग: भाग A पूरा।** ✓ निकट-दृष्टिता: दूर बिंदु बहुत पास, प्रतिबिंब दृष्टिपटल के आगे, अवतल लेंस (रिया: −0.5 D)। ✓ दूर-दृष्टिता: निकट बिंदु बहुत दूर, प्रतिबिंब दृष्टिपटल के पीछे, उत्तल लेंस। ✓ जरा-दूरदृष्टिता (दादाजी): उम्र के साथ निकट बिंदु 1 मीटर तक खिसका, पढ़ने के लिए +3 D का उत्तल लेंस; टीवी भी धुँधला हो तो द्विफ़ोकसी। आगे, पहाड़। भाग B कबीर की कॉपी के पहले पन्ने से शुरू होता है: काँच का प्रिज़्म प्रकाश के साथ क्या करता है?",
      ),
      "log",
      { isHidden: true },
    );
    b.when(last.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), last, log, space()]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [
  hook,
  myopia,
  myopiaPower,
  hyper,
  hyperPower,
  presbyopia,
  donate,
  inLife,
  examples,
  yourTurn,
];

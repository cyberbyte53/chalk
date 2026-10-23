import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import { EyeAction, EyeSceneKind, Light, eyeModelDef, eyeSceneDef } from "@chalk/prop-eye";

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** Who, where: the morning after movie night, and Riya's thought about her own eye. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const room = b.prop(eyeSceneDef, "room", { scene: EyeSceneKind.MovieEye });
  b.standsFor(
    room,
    "movie night: the shoebox projector throws the film on the wall while Riya imagines her own eye beside it, a lens at the front and an upside-down picture at the back",
  );
  return column([
    w.title(t("An eye like a shoebox", "जूते के डिब्बे जैसी आँख")),
    room,
    w.body(
      t(
        "Remember movie night? Riya, her little brother Kabir, Mom and Grandpa finally watched the movie big on the wall, thrown there by the shoebox projector Riya and Kabir built. As the last scenes played, Riya had a strange thought: **her own eye works just like that box.** A lens at the front, and a real, upside-down picture on a screen at the back.",
        "मूवी नाइट याद है? रिया, उसका छोटा भाई कबीर, मम्मी और दादाजी ने आख़िरकार फ़िल्म दीवार पर बड़ी देखी, जिसे रिया और कबीर के बनाए जूते के डिब्बे वाले प्रोजेक्टर ने वहाँ डाला था। आख़िरी दृश्यों के दौरान रिया के मन में एक अजीब बात आई: **उसकी अपनी आँख ठीक उसी डिब्बे की तरह काम करती है।** आगे एक लेंस, और पीछे एक पर्दे पर वास्तविक, उल्टी तस्वीर।",
      ),
    ),
    space(),
  ]);
});

/** Then two eyes go wrong in one week, and a trip is coming. */
const trouble = page("trouble", (b) => {
  const w = wordsOn(b);
  const board = b.prop(eyeSceneDef, "blackboard", { scene: EyeSceneKind.Blackboard });
  b.standsFor(
    board,
    "a classroom from the back: the blackboard writing is a blur from the last row, where Riya sits squinting",
  );
  const paper = b.prop(eyeSceneDef, "paper", { scene: EyeSceneKind.GrandpaPaper });
  b.standsFor(paper, "Grandpa on the sofa holding the newspaper at arm's length, squinting");
  return column([
    w.title(t("Two eyes in trouble", "मुश्किल में दो आँखें")),
    board,
    w.body(
      t(
        "On Monday the class is moved around and Riya ends up in the last row. The teacher writes on the blackboard, and for Riya it's just a blur. From the front row she can read every word.",
        "सोमवार को कक्षा में जगहें बदलती हैं और रिया आख़िरी पंक्ति में पहुँच जाती है। शिक्षिका ब्लैकबोर्ड पर लिखती हैं, और रिया के लिए वह बस धुँधलापन है। आगे की पंक्ति से वह हर शब्द पढ़ लेती है।",
      ),
    ),
    paper,
    w.body(
      t(
        "At home, Grandpa has the opposite problem. He reads the newspaper holding it as far away as his arms will go. Kabir finds this very funny. Grandpa does not.",
        "घर पर दादाजी की परेशानी उल्टी है। वे अख़बार को जितना दूर हाथ जाएँ उतना दूर पकड़कर पढ़ते हैं। कबीर को यह बहुत मज़ेदार लगता है। दादाजी को नहीं।",
      ),
    ),
    space(),
  ]);
});

/** Why this chapter: the eye test, then the trip to the hills and Kabir's notebook. */
const why = page("why", (b) => {
  const w = wordsOn(b);
  const drive = b.prop(eyeSceneDef, "drive", { scene: EyeSceneKind.HillDrive });
  b.standsFor(
    drive,
    "the family car winding up a hill road, Kabir in the back holding up a notebook marked 'why?'",
  );
  return column([
    w.title(t("What this chapter is for", "यह अध्याय किसलिए है")),
    drive,
    w.body(
      t(
        "Mom books an eye test for Riya and Grandpa before the family's trip to the hills, where they plan to watch the sunrise. Kabir has already started a notebook for the trip, titled **WHY?**",
        "पहाड़ों की सैर से पहले, जहाँ परिवार सूर्योदय देखने जा रहा है, मम्मी रिया और दादाजी की आँखों की जाँच तय करती हैं। कबीर ने सफ़र के लिए पहले ही एक कॉपी शुरू कर दी है, जिसका नाम है **क्यों?**",
      ),
    ),
    w.body(
      t(
        "So the mission has two parts. **Part A, the eye:** understand how an eye focuses, what has gone wrong with Riya's and Grandpa's eyes, and which glasses fix them. **Part B, the colourful world:** answer every question in Kabir's notebook: rainbows, twinkling stars, a blue sky and a red sunrise.",
        "तो मिशन के दो हिस्से हैं। **भाग A, आँख:** समझना कि आँख फ़ोकस कैसे करती है, रिया और दादाजी की आँखों में क्या गड़बड़ है, और कौन-से चश्मे उन्हें ठीक करते हैं। **भाग B, रंगबिरंगा संसार:** कबीर की कॉपी के हर सवाल का जवाब: इंद्रधनुष, टिमटिमाते तारे, नीला आसमान और लाल सूर्योदय।",
      ),
    ),
    w.definition(
      t(
        "**The stops on the way.** *Part A:* (1) What is inside an eye: *this lesson*. (2) How the eye focuses near and far. (3) Faulty eyes and the glasses that fix them. *Part B:* (4) Light through a glass prism. (5) Colours and the rainbow. (6) How the air bends light. (7) How the air scatters light: the blue sky and the red Sun.",
        "**रास्ते के पड़ाव।** *भाग A:* (1) आँख के अंदर क्या है: *यह पाठ*। (2) आँख पास और दूर पर फ़ोकस कैसे करती है। (3) दोषपूर्ण आँखें और उन्हें ठीक करने वाले चश्मे। *भाग B:* (4) काँच के प्रिज़्म से होकर प्रकाश। (5) रंग और इंद्रधनुष। (6) हवा प्रकाश को कैसे मोड़ती है। (7) हवा प्रकाश को कैसे बिखेरती है: नीला आसमान और लाल सूर्य।",
      ),
    ),
    w.body(
      t(
        "First stop: what is actually inside an eye, and how does it make a picture?",
        "पहला पड़ाव: आँख के अंदर असल में क्या है, और यह तस्वीर कैसे बनाती है?",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** The parts of the eye, named on the side view. */
const parts = page(
  "parts",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "The parts of the human eye (NCERT 11.1): cornea, iris and pupil, crystalline lens, ciliary muscles, retina, optic nerve, each with its job.",
    );
    const eye = b.prop(eyeModelDef, "eye", {
      objectCm: null,
      showNames: true,
      showRays: true,
      showSees: false,
      canMoveObject: false,
    });
    b.standsFor(
      eye,
      "the human eye from the side with every part named: cornea, iris, pupil, eye lens, ciliary muscles, retina and optic nerve; rays from far away meet on the retina",
    );
    const most = choiceQuestion(b, {
      name: "most",
      prompt: t(
        "Light is bent at the cornea and again at the eye lens. Where does **most** of the bending happen?",
        "प्रकाश कॉर्निया पर और फिर नेत्र लेंस पर मुड़ता है। **सबसे ज़्यादा** मुड़ना कहाँ होता है?",
      ),
      options: [
        { id: "right", label: t("At the cornea", "कॉर्निया पर") },
        {
          id: "lens",
          label: t("At the eye lens", "नेत्र लेंस पर"),
          feedback: t(
            "The eye lens only makes the fine adjustment. Most of the bending happens where light first enters, at the outer surface of the cornea.",
            "नेत्र लेंस केवल बारीक समायोजन करता है। सबसे ज़्यादा मुड़ना वहीं होता है जहाँ प्रकाश पहले घुसता है, कॉर्निया की बाहरी सतह पर।",
          ),
        },
        {
          id: "retina",
          label: t("At the retina", "दृष्टिपटल पर"),
          feedback: t(
            "The retina is the screen where the picture forms. The bending has to happen before the light gets there.",
            "दृष्टिपटल वह पर्दा है जहाँ तस्वीर बनती है। मुड़ना वहाँ पहुँचने से पहले होना चाहिए।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Inside the eye: the front", "आँख के अंदर: आगे का भाग")),
      w.body(
        t(
          "The **eyeball** is roughly a ball, about 2.3 cm across. Light travels through it from front to back. Follow it in the picture.",
          "**नेत्र गोलक** लगभग एक गेंद है, करीब 2.3 सेमी चौड़ी। प्रकाश इसमें आगे से पीछे की ओर जाता है। चित्र में उसका पीछा करो।",
        ),
      ),
      eye,
      w.definition(
        t(
          "**Cornea.** The thin, clear skin that bulges at the front of the eye. Light enters through it, and its outer surface does **most of the bending** of the light.",
          "**कॉर्निया (स्वच्छमंडल)।** आँख के आगे उभरी हुई पतली, पारदर्शी झिल्ली। प्रकाश इसी से अंदर आता है, और इसकी बाहरी सतह प्रकाश का **ज़्यादातर मोड़** करती है।",
        ),
      ),
      w.definition(
        t(
          "**Iris and pupil.** Behind the cornea is the **iris**, the coloured, muscular ring of the eye. The hole in its middle is the **pupil**. The iris makes the pupil bigger or smaller, and so controls how much light gets in.",
          "**परितारिका और पुतली।** कॉर्निया के पीछे **परितारिका** है, आँख का रंगीन, पेशीय छल्ला। इसके बीच का छेद **पुतली** है। परितारिका पुतली को बड़ा या छोटा करती है, और इस तरह तय करती है कि कितना प्रकाश अंदर आए।",
        ),
      ),
      most,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The back of the eye: the eye lens with its ciliary muscles, the retina and the optic nerve. */
const back = page(
  "back",
  (b) => {
    const w = wordsOn(b);
    const eye = b.prop(eyeModelDef, "eye", {
      objectCm: null,
      showNames: true,
      showRays: true,
      showSees: false,
      canMoveObject: false,
    });
    b.standsFor(
      eye,
      "the same eye with every part named; this page is about the eye lens, the ciliary muscles holding it, the retina at the back and the optic nerve",
    );
    const holds = choiceQuestion(b, {
      name: "holds",
      prompt: t(
        "Which part holds the eye lens and changes its shape?",
        "कौन-सा भाग नेत्र लेंस को थामता है और उसका आकार बदलता है?",
      ),
      options: [
        { id: "right", label: t("The ciliary muscles", "पक्ष्माभी पेशियाँ") },
        {
          id: "iris",
          label: t("The iris muscles", "परितारिका की पेशियाँ"),
          feedback: t(
            "The iris changes the size of the pupil, the hole in front of the lens. The lens is held by the ring of ciliary muscles.",
            "परितारिका पुतली का आकार बदलती है, लेंस के आगे वाला छेद। लेंस को पक्ष्माभी पेशियों का छल्ला थामता है।",
          ),
        },
        {
          id: "nerve",
          label: t("The optic nerve", "दृक् तंत्रिका"),
          feedback: t(
            "The optic nerve carries messages from the retina to the brain. It doesn't touch the lens.",
            "दृक् तंत्रिका दृष्टिपटल से संदेश मस्तिष्क तक ले जाती है। वह लेंस को नहीं छूती।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Inside the eye: the back", "आँख के अंदर: पीछे का भाग")),
      eye,
      w.definition(
        t(
          "**Eye lens and ciliary muscles.** Behind the pupil is the **eye lens** (the crystalline lens), a convex lens made of a clear, jelly-like material. A ring of **ciliary muscles** holds it. The lens makes the **fine adjustment** that brings things at different distances into focus.",
          "**नेत्र लेंस और पक्ष्माभी पेशियाँ।** पुतली के पीछे **नेत्र लेंस** (क्रिस्टलीय लेंस) है, एक पारदर्शी, जेली जैसे पदार्थ का उत्तल लेंस। **पक्ष्माभी पेशियों** का एक छल्ला उसे थामे रहता है। अलग-अलग दूरी की चीज़ों को फ़ोकस में लाने का **बारीक समायोजन** लेंस करता है।",
        ),
      ),
      w.definition(
        t(
          "**Retina and optic nerve.** The back of the eye is lined by the **retina**, a delicate screen packed with light-sensitive cells. The **optic nerve** carries messages from the retina to the brain.",
          "**दृष्टिपटल और दृक् तंत्रिका।** आँख का पिछला भाग **दृष्टिपटल** (रेटिना) से ढका है, प्रकाश-सुग्राही कोशिकाओं से भरा एक नाज़ुक पर्दा। **दृक् तंत्रिका** दृष्टिपटल से संदेश मस्तिष्क तक ले जाती है।",
        ),
      ),
      holds,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The eye is a camera: a real, inverted image on the retina, read by the brain. */
const picture = page(
  "picture",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "The eye like a camera: the lens system forms a real, inverted image on the retina; light-sensitive cells make electrical signals, sent by the optic nerve to the brain, which makes sense of them.",
    );
    const eye = b.prop(eyeModelDef, "eye", {
      objectCm: 50,
      showNames: false,
      showRays: true,
      showSees: true,
      canMoveObject: false,
    });
    b.standsFor(
      eye,
      "an eye looking at an object 50 cm away: rays from the object cross inside the eye and meet on the retina, upside down; a small inset shows the sharp chart the person sees",
    );
    const where = choiceQuestion(b, {
      name: "where",
      prompt: t(
        "The human eye forms the image of an object on its…",
        "मानव नेत्र किसी वस्तु का प्रतिबिंब अपने… पर बनाता है",
      ),
      options: [
        { id: "right", label: t("retina", "दृष्टिपटल") },
        {
          id: "cornea",
          label: t("cornea", "कॉर्निया"),
          feedback: t(
            "The cornea is where light enters and bends. The picture forms on the screen at the back.",
            "कॉर्निया से प्रकाश अंदर आता और मुड़ता है। तस्वीर पीछे के पर्दे पर बनती है।",
          ),
        },
        {
          id: "pupil",
          label: t("pupil", "पुतली"),
          feedback: t(
            "The pupil is only a hole that lets light in.",
            "पुतली केवल एक छेद है जो प्रकाश को अंदर आने देता है।",
          ),
        },
        {
          id: "iris",
          label: t("iris", "परितारिका"),
          feedback: t(
            "The iris is the coloured ring that sets the pupil's size.",
            "परितारिका वह रंगीन छल्ला है जो पुतली का आकार तय करता है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("A camera inside your head", "सिर के अंदर एक कैमरा")),
      w.body(
        t(
          "The eye is like a camera. Its lenses (the cornea and the eye lens together act like one convex lens) bring the light from each point of an object together again on the retina. You know this kind of image from the light chapter: it is **real and inverted**, like the movie on the wall.",
          "आँख एक कैमरे जैसी है। इसके लेंस (कॉर्निया और नेत्र लेंस मिलकर एक उत्तल लेंस की तरह काम करते हैं) किसी वस्तु के हर बिंदु से आए प्रकाश को दृष्टिपटल पर फिर से इकट्ठा करते हैं। यह प्रतिबिंब तुम प्रकाश वाले अध्याय से जानते हो: यह **वास्तविक और उल्टा** होता है, दीवार पर फ़िल्म की तरह।",
        ),
      ),
      eye,
      w.definition(
        t(
          "**From light to seeing.** The light-sensitive cells of the retina switch on when light falls on them, and make **electrical signals**. The optic nerve carries these signals to the **brain**. The brain reads them and makes sense of them, so we see things as they are, the right way up.",
          "**प्रकाश से देखने तक।** प्रकाश पड़ते ही दृष्टिपटल की प्रकाश-सुग्राही कोशिकाएँ सक्रिय होकर **विद्युत संकेत** बनाती हैं। दृक् तंत्रिका इन संकेतों को **मस्तिष्क** तक ले जाती है। मस्तिष्क उन्हें पढ़कर समझता है, इसलिए हम चीज़ों को जैसी हैं वैसी, सीधी देखते हैं।",
        ),
      ),
      w.note(
        t(
          "Damage to any part of this chain (cornea, pupil, lens, the clear fluids inside the eye, the retina or the optic nerve) causes loss of vision.",
          "इस कड़ी के किसी भी हिस्से (कॉर्निया, पुतली, लेंस, आँख के अंदर के पारदर्शी द्रव, दृष्टिपटल या दृक् तंत्रिका) को नुकसान से दृष्टि खो सकती है।",
        ),
      ),
      where,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The iris sets the pupil: small in bright light, large in dim light. */
const pupil = page(
  "pupil",
  (b) => {
    const w = wordsOn(b);
    const eye = b.prop(eyeModelDef, "eye", {
      objectCm: null,
      light: Light.Bright,
      showNames: true,
      showRays: false,
      showSees: false,
      canMoveObject: false,
      canSetLight: true,
    });
    b.studentOnly(eye.action(EyeAction.SetLight));
    b.standsFor(
      eye,
      "the eye from the side with a bright/dim switch: in bright light the iris closes the pupil down; in dim light it opens wide",
    );
    b.witness(eye.learner(EyeAction.SetLight, { light: Light.Dim }));
    const dim = choiceQuestion(b, {
      name: "dim",
      prompt: t(
        "Switch between bright and dim. What does the iris do in **dim** light?",
        "उजाले और मद्धम के बीच बदलो। **मद्धम** रोशनी में परितारिका क्या करती है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Makes the pupil larger, to let more light in",
            "अधिक प्रकाश आने देने के लिए पुतली बड़ी करती है",
          ),
        },
        {
          id: "small",
          label: t(
            "Makes the pupil smaller, to keep the eye safe in the dark",
            "अँधेरे में आँख को सुरक्षित रखने के लिए पुतली छोटी करती है",
          ),
          feedback: t(
            "That's what happens in bright light, to let less light in. In dim light the eye needs all the light it can get.",
            "ऐसा उजाले में होता है, कम प्रकाश आने देने के लिए। मद्धम रोशनी में आँख को जितना प्रकाश मिल सके, चाहिए।",
          ),
        },
        {
          id: "lens",
          label: t("Makes the eye lens thicker to focus", "फ़ोकस के लिए नेत्र लेंस मोटा करती है"),
          feedback: t(
            "The lens is changed by the ciliary muscles, not the iris. The iris only sets the size of the pupil.",
            "लेंस को पक्ष्माभी पेशियाँ बदलती हैं, परितारिका नहीं। परितारिका केवल पुतली का आकार तय करती है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("A window that opens and closes", "खुलने-बंद होने वाली खिड़की")),
      w.body(
        t(
          "The pupil works like the adjustable opening (the **aperture**) of a camera. When the light is very bright, the iris closes the pupil down to let less light in. In dim light the iris relaxes and the pupil opens wide to let more light in. Try it.",
          "पुतली कैमरे के घटने-बढ़ने वाले छेद (**द्वारक**) की तरह काम करती है। जब रोशनी बहुत तेज़ होती है, परितारिका पुतली को छोटा कर देती है ताकि कम प्रकाश आए। मद्धम रोशनी में परितारिका ढीली पड़ती है और पुतली पूरी खुल जाती है ताकि ज़्यादा प्रकाश आए। आज़माकर देखो।",
        ),
      ),
      eye,
      dim,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Why two eyes: a wider view and depth. */
const twoEyes = page(
  "two-eyes",
  (b) => {
    const w = wordsOn(b);
    const depth = choiceQuestion(b, {
      name: "depth",
      prompt: t(
        "Shut one eye and try to touch two pencil tips together. Why is it harder?",
        "एक आँख बंद करके दो पेंसिलों की नोक मिलाने की कोशिश करो। यह ज़्यादा मुश्किल क्यों है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "One eye gives the brain only one view, so it can't judge depth well",
            "एक आँख मस्तिष्क को केवल एक दृश्य देती है, इसलिए वह गहराई ठीक से नहीं आँक पाता",
          ),
        },
        {
          id: "light",
          label: t("Less light gets in", "कम प्रकाश अंदर आता है"),
          feedback: t(
            "There's plenty of light to see the pencils. What's missing is the second, slightly different view.",
            "पेंसिलें देखने के लिए प्रकाश काफ़ी है। जो कम है वह दूसरा, थोड़ा अलग दृश्य है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Why two eyes?", "दो आँखें क्यों?")),
      w.body(
        t(
          "With one eye a person sees about 150° from side to side. With two, about 180°: a **wider field of view**. Two detectors also catch fainter things.",
          "एक आँख से व्यक्ति अगल-बगल लगभग 150° तक देखता है। दो से लगभग 180°: **ज़्यादा चौड़ा दृष्टि-क्षेत्र**। दो संसूचक धुँधली चीज़ें भी पकड़ लेते हैं।",
        ),
      ),
      w.body(
        t(
          "Our eyes sit a few centimetres apart, so each sees a slightly different picture. The brain combines the two and uses the difference to judge how near or far things are: **depth**. Shut one eye and the world looks flat. (Many prey animals have eyes on the sides of the head instead, for the widest possible view.)",
          "हमारी आँखें कुछ सेंटीमीटर दूर हैं, इसलिए हर एक थोड़ी अलग तस्वीर देखती है। मस्तिष्क दोनों को जोड़ता है और अंतर से आँकता है कि चीज़ें कितनी पास या दूर हैं: **गहराई**। एक आँख बंद करो और दुनिया सपाट दिखती है। (कई शिकार होने वाले जानवरों की आँखें इसके बजाय सिर के दोनों ओर होती हैं, ताकि सबसे चौड़ा दृश्य मिले।)",
        ),
      ),
      depth,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** Riya steps from the sunny verandah into the dark storeroom. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const store = b.prop(eyeSceneDef, "store", { scene: EyeSceneKind.BrightToDim });
    b.standsFor(
      store,
      "Riya stepping from the sunny verandah into a dim storeroom, where she can barely see anything at first",
    );
    const blind = choiceQuestion(b, {
      name: "blind",
      prompt: t(
        "Riya runs in from the sunny verandah to fetch the suitcase from the storeroom, and for a few seconds she can't see a thing. Why?",
        "रिया धूप वाले बरामदे से भागकर स्टोररूम से सूटकेस लाने जाती है, और कुछ सेकंड तक उसे कुछ नहीं दिखता। क्यों?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Her pupils are still small from the sunlight and need time to widen",
            "धूप के कारण उसकी पुतलियाँ अभी छोटी हैं और फैलने में समय लगता है",
          ),
        },
        {
          id: "lens",
          label: t(
            "Her eye lens has to change shape for the dark room before she sees",
            "देखने से पहले उसके नेत्र लेंस को अँधेरे कमरे के लिए आकार बदलना है",
          ),
          feedback: t(
            "The lens changes shape for near and far things, not for bright and dim. Brightness is the iris's job.",
            "लेंस पास और दूर की चीज़ों के लिए आकार बदलता है, उजाले और अँधेरे के लिए नहीं। रोशनी का काम परितारिका का है।",
          ),
        },
        {
          id: "dark",
          label: t(
            "The room has no light at all, so nothing can be seen",
            "कमरे में कोई प्रकाश नहीं है, इसलिए कुछ नहीं दिखता",
          ),
          feedback: t(
            "After a while she sees everything in the room, so some light is there. Her eyes just need time.",
            "थोड़ी देर बाद उसे कमरे में सब दिखता है, इसलिए कुछ प्रकाश वहाँ है। उसकी आँखों को बस समय चाहिए।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const colours = choiceQuestion(b, {
      name: "colours",
      prompt: t(
        "Suitcase in hand, Riya steps back out onto the bright verandah. What is her iris doing?",
        "सूटकेस लेकर रिया फिर से चमकीले बरामदे में आती है। उसकी परितारिका क्या कर रही है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Closing the pupil down to let less light in",
            "पुतली को छोटा करके कम प्रकाश अंदर जाने दे रही है",
          ),
        },
        {
          id: "open",
          label: t(
            "Opening the pupil wide to let more light in",
            "पुतली को बड़ा करके ज़्यादा प्रकाश अंदर जाने दे रही है",
          ),
          feedback: t(
            "That's what happened in the dark storeroom. In bright light the iris makes the pupil small.",
            "ऐसा अँधेरे स्टोररूम में हुआ था। तेज़ प्रकाश में परितारिका पुतली को छोटा कर देती है।",
          ),
        },
        {
          id: "lens",
          label: t("Making the eye lens thicker", "नेत्र लेंस को मोटा कर रही है"),
          feedback: t(
            "The lens shape is changed by the ciliary muscles, for focusing. The iris controls how much light gets in.",
            "लेंस का आकार पक्ष्माभी पेशियाँ फ़ोकस के लिए बदलती हैं। परितारिका तय करती है कि कितना प्रकाश अंदर जाए।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
    });
    b.when(blind.on(QuestionSignal.Correct), theBoard.show(colours));
    return column([
      w.title(t("Packing for the hills", "पहाड़ों के लिए पैकिंग")),
      store,
      blind,
      colours,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Your turn, then the mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const job = choiceQuestion(b, {
      name: "job",
      prompt: t(
        "Which part of the eye turns the picture on the retina into signals for the brain, and which part carries them?",
        "आँख का कौन-सा हिस्सा दृष्टिपटल की तस्वीर को मस्तिष्क के लिए संकेतों में बदलता है, और कौन-सा उन्हें ले जाता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "The retina's cells make them; the optic nerve carries them",
            "दृष्टिपटल की कोशिकाएँ बनाती हैं; दृक् तंत्रिका ले जाती है",
          ),
        },
        {
          id: "lens",
          label: t(
            "The eye lens makes them; the iris carries them to the brain",
            "नेत्र लेंस बनाता है; परितारिका उन्हें मस्तिष्क तक ले जाती है",
          ),
          feedback: t(
            "The lens only focuses the light, and the iris only sets the pupil. The signals start in the retina.",
            "लेंस केवल प्रकाश को फ़ोकस करता है, और परितारिका केवल पुतली तय करती है। संकेत दृष्टिपटल से शुरू होते हैं।",
          ),
        },
        {
          id: "cornea",
          label: t(
            "The cornea makes them; the pupil carries them",
            "कॉर्निया बनाता है; पुतली ले जाती है",
          ),
          feedback: t(
            "The cornea bends light at the front of the eye. Nothing is turned into signals until the light reaches the retina.",
            "कॉर्निया आँख के आगे प्रकाश मोड़ता है। प्रकाश के दृष्टिपटल तक पहुँचने से पहले कुछ भी संकेत में नहीं बदलता।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ The eye works like a camera: the cornea and the eye lens make a real, inverted picture on the retina, and the brain reads it. ✓ The iris sets the pupil for bright and dim light. ? One lens has to focus both the blackboard and a book. How? Next stop: focusing near and far.",
        "**मिशन लॉग।** ✓ आँख कैमरे की तरह काम करती है: कॉर्निया और नेत्र लेंस दृष्टिपटल पर वास्तविक, उल्टी तस्वीर बनाते हैं, और मस्तिष्क उसे पढ़ता है। ✓ परितारिका उजाले और मद्धम रोशनी के लिए पुतली तय करती है। ? एक ही लेंस को ब्लैकबोर्ड और किताब, दोनों पर फ़ोकस करना है। कैसे? अगला पड़ाव: पास और दूर पर फ़ोकस।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(job.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), job, log, space()]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [
  hook,
  trouble,
  why,
  parts,
  back,
  picture,
  pupil,
  twoEyes,
  inLife,
  yourTurn,
];

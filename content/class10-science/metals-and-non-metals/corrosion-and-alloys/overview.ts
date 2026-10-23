import type { BoardKit } from "@chalk/author";
import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, multiChoiceQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  AlloyMetal,
  CaratAction,
  Coating,
  RustAction,
  RustMode,
  goldCaratDef,
  rustLabDef,
} from "@chalk/prop-chemistry";
import { MetalSceneKind, sceneOn } from "../kit";

/** The rust lab: Activity 3.14's tubes, or a nail with a coating to test. */
function rustOn(b: BoardKit, name: string, mode: RustMode, coatings: Coating[] = []) {
  const lab = b.prop(rustLabDef, name, {
    mode,
    days: 0,
    coating: coatings[0] ?? Coating.None,
    isScratched: false,
    coatings,
    canScratch: mode === RustMode.Protect,
    showLabels: true,
  });
  b.studentOnly(lab.action(RustAction.Wait));
  b.studentOnly(lab.action(RustAction.Reset));
  if (mode === RustMode.Protect) {
    b.studentOnly(lab.action(RustAction.SetCoating));
    b.studentOnly(lab.action(RustAction.Scratch));
  }
  return lab;
}

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const pillar = sceneOn(
    b,
    "pillar",
    MetalSceneKind.IronPillar,
    "Riya and Kabir on a school trip beside the iron pillar near the Qutub Minar, the tower in the background",
  );
  return column([
    w.title(t("A pillar that never rusted", "एक स्तंभ जिसमें कभी ज़ंग नहीं लगा")),
    pillar,
    w.body(
      t(
        "On a school trip to the Qutub Minar, Kabir stands beside the famous iron pillar. Back home his bicycle chain is orange with rust after one rainy month, yet this iron has stood in the open for over **1600 years**. And the jeweller's last words are still in Riya's head: \"Your bangles were 22 carat, never pure gold.\"",
        'क़ुतुब मीनार की स्कूल यात्रा पर कबीर प्रसिद्ध लौह स्तंभ के पास खड़ा है। घर पर उसकी साइकिल की चेन एक बरसाती महीने में ही ज़ंग से नारंगी हो गई है, फिर भी यह लोहा **1600 साल** से अधिक से खुले में खड़ा है। और सुनार की आख़िरी बात अब भी रिया के दिमाग़ में है: "तुम्हारी चूड़ियाँ 22 कैरेट की थीं, कभी शुद्ध सोना नहीं।"',
      ),
    ),
    w.body(
      t(
        "Last clue: why do metals corrode, how do we stop it, and why mix metals into alloys?",
        "आख़िरी सुराग: धातुओं का संक्षारण क्यों होता है, हम उसे कैसे रोकते हैं, और धातुओं को मिलाकर मिश्रातु क्यों बनाते हैं?",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Corrosion recap, and Activity 3.14: what iron needs to rust. */
const conditions = page(
  "conditions",
  (b) => {
    const w = wordsOn(b);
    const lab = rustOn(b, "lab", RustMode.Conditions);
    b.standsFor(
      lab,
      "three corked test tubes with iron nails: A with ordinary water and air, B with boiled water under a layer of oil, C with dry air over calcium chloride; waiting day by day, only the nail in A rusts",
    );
    const need = choiceQuestion(b, {
      name: "need",
      prompt: t(
        "Wait a few days. What does iron need in order to rust?",
        "कुछ दिन इंतज़ार करो। ज़ंग लगने के लिए लोहे को क्या चाहिए?",
      ),
      options: [
        { id: "right", label: t("Both air and water", "हवा और पानी दोनों") },
        {
          id: "water",
          label: t("Water alone", "केवल पानी"),
          feedback: t(
            "Tube B has water but no air, and its nail doesn't rust.",
            "परखनली B में पानी है पर हवा नहीं, और उसकी कील में ज़ंग नहीं लगता।",
          ),
        },
        {
          id: "air",
          label: t("Air alone", "केवल हवा"),
          feedback: t(
            "Tube C has dry air, and its nail doesn't rust.",
            "परखनली C में सूखी हवा है, और उसकी कील में ज़ंग नहीं लगता।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("What makes iron rust?", "लोहे में ज़ंग किससे लगता है?")),
      w.definition(
        t(
          "**Corrosion.** When a metal is attacked by substances around it, such as moisture and acids, it **corrodes**: this is **corrosion**. The anklets' puzzle, solved: **silver** goes black (it reacts with sulphur in the air to form **silver sulphide**); **copper** gets a green coat (**basic copper carbonate**, from moist carbon dioxide); **iron**, left in moist air, gets a brown flaky coat of **rust**.",
          "**संक्षारण।** जब किसी धातु पर आसपास के पदार्थ, जैसे नमी और अम्ल, हमला करते हैं, तो उसका **संक्षारण** होता है। पायलों की पहेली हल: **चाँदी** काली पड़ती है (हवा के सल्फ़र से अभिक्रिया करके **सिल्वर सल्फ़ाइड** बनाती है); **ताँबे** पर हरी परत चढ़ती है (**क्षारकीय कॉपर कार्बोनेट**, नम कार्बन डाइऑक्साइड से); नम हवा में छोड़े **लोहे** पर भूरी, परतदार **ज़ंग** लगती है।",
        ),
      ),
      w.body(
        t(
          "NCERT Activity 3.14: clean iron nails in three tubes. **A**: water, corked. **B**: boiled water (no dissolved air) with oil floating on top to keep air out. **C**: dry air, with **anhydrous** (water-free) calcium chloride to soak up moisture.",
          "NCERT क्रियाकलाप 3.14: तीन परखनलियों में लोहे की साफ़ कीलें। **A**: पानी, कॉर्क लगा। **B**: उबला पानी (कोई घुली हवा नहीं), ऊपर तेल की परत ताकि हवा न आए। **C**: सूखी हवा, नमी सोखने के लिए **निर्जल** (पानी-रहित) कैल्शियम क्लोराइड के साथ।",
        ),
      ),
      lab,
      need,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Prevention: paint, oil, grease, galvanising, chrome plating, anodising, alloys. */
const prevent = page(
  "prevent",
  (b) => {
    const w = wordsOn(b);
    const lab = rustOn(b, "lab", RustMode.Protect, [
      Coating.None,
      Coating.Paint,
      Coating.Grease,
      Coating.Zinc,
      Coating.Chrome,
      Coating.Stainless,
    ]);
    b.standsFor(
      lab,
      "an iron nail with a chosen coating (none, paint, grease, zinc, chrome) or made of stainless steel; the learner can scratch the coating and wait day by day to see whether it rusts",
    );
    const scratch = choiceQuestion(b, {
      name: "scratch",
      prompt: t(
        "Scratch the zinc coat and wait. Why doesn't the iron rust, even though it's exposed?",
        "ज़िंक की परत खुरचो और इंतज़ार करो। लोहा खुला होने पर भी उसमें ज़ंग क्यों नहीं लगता?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Zinc is more reactive than iron, so the zinc corrodes first and protects the iron",
            "ज़िंक लोहे से अधिक क्रियाशील है, इसलिए पहले ज़िंक का संक्षारण होता है और वह लोहे को बचाता है",
          ),
        },
        {
          id: "seal",
          label: t("The scratch seals itself", "खरोंच अपने आप बंद हो जाती है"),
          feedback: t(
            "The scratch stays open. It's the reactivity series that protects the iron.",
            "खरोंच खुली रहती है। लोहे को सक्रियता श्रेणी बचाती है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Stopping rust", "ज़ंग रोकना")),
      w.body(
        t(
          "Rusting can be prevented by **painting, oiling, greasing, galvanising, chrome plating, anodising** or **making alloys**. Try each coating, and try scratching it.",
          "ज़ंग को **पेंट करने, तेल लगाने, ग्रीज़ लगाने, यशदलेपन, क्रोमियम लेपन, ऐनोडीकरण** या **मिश्रातु बनाने** से रोका जा सकता है। हर परत आज़माओ, और उसे खुरचकर भी देखो।",
        ),
      ),
      lab,
      w.definition(
        t(
          "**Galvanising.** Coating steel or iron with a thin layer of **zinc** is **galvanisation**. A galvanised article is protected against rusting **even if the zinc coating is broken**, because zinc is more reactive than iron.",
          "**यशदलेपन।** स्टील या लोहे पर **ज़िंक** की पतली परत चढ़ाना **यशदलेपन** है। यशदलेपित वस्तु **ज़िंक की परत टूट जाने पर भी** ज़ंग से बची रहती है, क्योंकि ज़िंक लोहे से अधिक क्रियाशील है।",
        ),
      ),
      scratch,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Alloys: steel, stainless steel, amalgam, brass, bronze, solder. */
const alloys = page(
  "alloys",
  (b) => {
    const w = wordsOn(b);
    const solder = choiceQuestion(b, {
      name: "solder",
      prompt: t(
        "Solder, an alloy of lead and tin, is used for joining electrical wires. Which property makes it useful?",
        "सोल्डर, लेड और टिन का मिश्रातु, बिजली के तार जोड़ने में उपयोग होता है। कौन-सा गुण इसे उपयोगी बनाता है?",
      ),
      options: [
        { id: "right", label: t("A low melting point", "कम गलनांक") },
        {
          id: "hard",
          label: t("It is very hard", "यह बहुत कठोर है"),
          feedback: t(
            "What matters is that it melts easily, so it can flow over the joint.",
            "ज़रूरी यह है कि यह आसानी से पिघलता है, ताकि जोड़ पर फैल सके।",
          ),
        },
        {
          id: "conduct",
          label: t("It conducts better than copper", "यह ताँबे से बेहतर चालन करता है"),
          feedback: t(
            "Alloys conduct less well than pure metals. Solder is chosen for its low melting point.",
            "मिश्रातु शुद्ध धातुओं से कम चालन करते हैं। सोल्डर अपने कम गलनांक के लिए चुना जाता है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Alloys", "मिश्रातु")),
      w.definition(
        t(
          "**Alloy.** An **alloy** is a **homogeneous mixture** (the same all through) of two or more metals, or of a metal and a non-metal. It is made by melting the main metal and dissolving the others in it in definite proportions, then cooling it. Alloying is a very good way to improve a metal's properties.",
          "**मिश्रातु।** **मिश्रातु** दो या अधिक धातुओं, या एक धातु और एक अधातु का **समांगी मिश्रण** (हर जगह एक-सा) है। इसे मुख्य धातु को पिघलाकर, उसमें दूसरों को निश्चित अनुपात में घोलकर, फिर ठंडा करके बनाते हैं। मिश्रातु बनाना किसी धातु के गुण सुधारने का बहुत अच्छा तरीक़ा है।",
        ),
      ),
      w.body(
        t(
          "**Iron** is never used pure: pure iron is very soft and stretches easily when hot. Mixed with a little **carbon** (about 0.05%) it becomes hard and strong: **steel**. Mixed with **nickel and chromium** it becomes **stainless steel**, hard and rust-free. If one of the metals is **mercury**, the alloy is an **amalgam**.",
          "**लोहा** कभी शुद्ध रूप में उपयोग नहीं होता: शुद्ध लोहा बहुत नरम है और गर्म होने पर आसानी से खिंच जाता है। थोड़ा **कार्बन** (लगभग 0.05%) मिलाने पर यह कठोर और मज़बूत हो जाता है: **स्टील**। **निकेल और क्रोमियम** मिलाने पर यह **स्टेनलेस स्टील** बनता है, कठोर और ज़ंग-रहित। अगर कोई धातु **पारा** हो, तो मिश्रातु **अमलगम** कहलाता है।",
        ),
      ),
      w.body(
        t(
          "An alloy's **electrical conductivity and melting point are lower** than those of the pure metals. **Brass** (copper and zinc) and **bronze** (copper and tin) are not good conductors, so copper itself is used for circuits. **Solder** (lead and tin) melts easily and is used for joining electrical wires.",
          "मिश्रातु की **विद्युत चालकता और गलनांक** शुद्ध धातुओं से **कम** होते हैं। **पीतल** (ताँबा और ज़िंक) और **काँसा** (ताँबा और टिन) अच्छे चालक नहीं हैं, इसलिए परिपथों के लिए ख़ुद ताँबा उपयोग होता है। **सोल्डर** (लेड और टिन) आसानी से पिघलता है और बिजली के तार जोड़ने में उपयोग होता है।",
        ),
      ),
      solder,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** 24 and 22 carat gold. */
const carat = page(
  "carat",
  (b) => {
    const w = wordsOn(b);
    const grid = b.prop(goldCaratDef, "grid", {
      carat: 22,
      other: AlloyMetal.Copper,
      canChoose: true,
    });
    b.studentOnly(grid.action(CaratAction.SetCarat));
    b.studentOnly(grid.action(CaratAction.SetMetal));
    b.standsFor(
      grid,
      "24 squares, some gold and the rest copper or silver; choosing 24, 22, 18 or 14 carat changes how many are gold, and a bar shows how hard the metal is",
    );
    const parts = choiceQuestion(b, {
      name: "parts",
      prompt: t("What does 22 carat gold mean?", "22 कैरेट सोने का क्या अर्थ है?"),
      options: [
        {
          id: "right",
          label: t(
            "22 parts of pure gold alloyed with 2 parts of copper or silver",
            "22 भाग शुद्ध सोना, 2 भाग ताँबे या चाँदी के साथ मिश्रातु बनाया हुआ",
          ),
        },
        {
          id: "percent",
          label: t("22% gold", "22% सोना"),
          feedback: t(
            "Carats count parts out of 24, not out of 100.",
            "कैरेट 24 में से भाग गिनते हैं, 100 में से नहीं।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Why 22 carat?", "22 कैरेट क्यों?")),
      w.definition(
        t(
          "**Carat.** Pure gold is called **24 carat** gold. It is **very soft**, so it isn't suitable for jewellery. It is alloyed with **silver or copper** to make it hard. In India, **22 carat** gold is generally used for ornaments: 22 parts of pure gold alloyed with 2 parts of copper or silver.",
          "**कैरेट।** शुद्ध सोने को **24 कैरेट** सोना कहते हैं। यह **बहुत नरम** है, इसलिए गहनों के लिए उपयुक्त नहीं। इसे कठोर बनाने के लिए **चाँदी या ताँबे** के साथ मिश्रातु बनाया जाता है। भारत में गहनों के लिए सामान्यतः **22 कैरेट** सोना उपयोग होता है: 22 भाग शुद्ध सोना, 2 भाग ताँबे या चाँदी के साथ।",
        ),
      ),
      grid,
      parts,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const pillar = sceneOn(
      b,
      "pillar",
      MetalSceneKind.IronPillar,
      "the iron pillar near the Qutub Minar",
    );
    const old = choiceQuestion(b, {
      name: "old",
      prompt: t(
        "What does the iron pillar show about ancient Indian iron workers?",
        "लौह स्तंभ प्राचीन भारतीय लोहारों के बारे में क्या दिखाता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "More than 1600 years ago they developed a process that kept iron from rusting",
            "1600 से अधिक साल पहले उन्होंने एक प्रक्रम विकसित किया जो लोहे को ज़ंग से बचाता था",
          ),
        },
        {
          id: "gold",
          label: t("It is gold painted to look like iron", "यह सोना है जिसे लोहे जैसा रंगा गया है"),
          feedback: t(
            "It is iron: 8 m high and 6 tonnes. What's special is how it was made.",
            "यह लोहा है: 8 m ऊँचा और 6 टन। ख़ास यह है कि इसे कैसे बनाया गया।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const bike = choiceQuestion(b, {
      name: "bike",
      prompt: t(
        "Kabir's bicycle chain rusts but it has to bend, so paint would crack. Which way of protecting it suits a chain best?",
        "कबीर की साइकिल की चेन में ज़ंग लगता है, पर उसे मुड़ना पड़ता है, इसलिए पेंट चटक जाएगा। चेन को बचाने का कौन-सा तरीक़ा सबसे उपयुक्त है?",
      ),
      options: [
        { id: "right", label: t("Oiling or greasing it", "तेल या ग्रीज़ लगाना") },
        {
          id: "paint",
          label: t("Painting it", "पेंट करना"),
          feedback: t(
            "Paint cracks on a moving chain. Oil or grease keeps air and water off and still lets it move.",
            "चलती चेन पर पेंट चटक जाता है। तेल या ग्रीज़ हवा और पानी को दूर रखता है और चेन चलती भी रहती है।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const notes = w.definition(
      t(
        "**Case notes.** ✓ Iron rusts only with both air and water; paint, oil, zinc, chrome or alloying keep it away. ✓ Jewellery gold is an alloy: 22 carat is harder than soft 24 carat. Every clue is in. Time to close the case.",
        "**केस नोट्स।** ✓ लोहे में ज़ंग केवल हवा और पानी दोनों से लगता है; पेंट, तेल, ज़िंक, क्रोमियम या मिश्रातु उसे दूर रखते हैं। ✓ गहनों का सोना एक मिश्रातु है: 22 कैरेट नरम 24 कैरेट से कठोर है। सारे सुराग आ गए। मामला बंद करने का समय।",
      ),
      "notes",
      { isHidden: true },
    );
    b.when(old.on(QuestionSignal.Correct), theBoard.show(bike));
    b.when(bike.on(QuestionSignal.Correct), [theBoard.show(notes), theBoard.pass()]);
    return column([
      w.title(t("Back from the trip", "यात्रा से लौटकर")),
      pillar,
      old,
      bike,
      notes,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Exercises 2, 4, 12, 13 and 16. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const pan = choiceQuestion(b, {
      name: "pan",
      prompt: t(
        "Which method suits an iron frying pan to stop it rusting?",
        "लोहे की कड़ाही को ज़ंग से बचाने के लिए कौन-सा तरीक़ा उपयुक्त है?",
      ),
      options: [
        {
          id: "right",
          label: t("All of these: grease, paint, a coating of zinc", "ये सभी: ग्रीज़, पेंट, ज़िंक की परत"),
        },
        {
          id: "grease",
          label: t("Only applying grease", "केवल ग्रीज़ लगाना"),
          feedback: t(
            "Grease works, but so do paint and zinc. NCERT's answer is all of them.",
            "ग्रीज़ काम करता है, पर पेंट और ज़िंक भी। NCERT का उत्तर है सभी।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const cans = choiceQuestion(b, {
      name: "cans",
      prompt: t(
        "Food cans are coated with tin and not with zinc because…",
        "खाने के डिब्बों पर ज़िंक की नहीं, टिन की परत चढ़ाई जाती है क्योंकि…",
      ),
      options: [
        { id: "right", label: t("zinc is more reactive than tin", "ज़िंक टिन से अधिक क्रियाशील है") },
        {
          id: "cost",
          label: t("zinc is costlier than tin", "ज़िंक टिन से महँगा है"),
          feedback: t(
            "Cost isn't the reason. Zinc is more reactive, so it could react with the food.",
            "क़ीमत कारण नहीं है। ज़िंक अधिक क्रियाशील है, इसलिए खाने से अभिक्रिया कर सकता है।",
          ),
        },
        {
          id: "less",
          label: t("zinc is less reactive than tin", "ज़िंक टिन से कम क्रियाशील है"),
          feedback: t("It's the other way round in the series.", "श्रेणी में उल्टा है।"),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const lemon = choiceQuestion(b, {
      name: "lemon",
      prompt: t(
        "Tarnished copper vessels are cleaned with lemon or tamarind. Why does that work?",
        "फीके पड़े ताँबे के बर्तन नींबू या इमली से साफ़ किए जाते हैं। यह क्यों काम करता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "They are acidic, and the acid dissolves the basic copper carbonate coat",
            "वे अम्लीय हैं, और अम्ल क्षारकीय कॉपर कार्बोनेट की परत को घोल देता है",
          ),
        },
        {
          id: "scrub",
          label: t("They are rough and scrub it off", "वे खुरदरे हैं और रगड़कर हटा देते हैं"),
          feedback: t(
            "It's chemistry, not scrubbing: the green coat is basic, and sour juices are acids.",
            "यह रसायन है, रगड़ना नहीं: हरी परत क्षारकीय है, और खट्टे रस अम्ल हैं।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const jewel = multiChoiceQuestion(b, {
      name: "jewel",
      prompt: t(
        "Why are platinum, gold and silver used to make jewellery? Tick all that apply.",
        "प्लैटिनम, सोना और चाँदी गहने बनाने में क्यों उपयोग होते हैं? जो लागू हों सभी पर निशान लगाओ।",
      ),
      options: [
        { id: "lustre", label: t("They are lustrous", "वे चमकीले हैं") },
        {
          id: "inert",
          label: t(
            "They hardly react, so they don't corrode easily",
            "वे मुश्किल से अभिक्रिया करते हैं, इसलिए आसानी से संक्षारित नहीं होते",
          ),
        },
        { id: "malleable", label: t("They are malleable and ductile", "वे आघातवर्ध्य और तन्य हैं") },
        {
          id: "soft",
          label: t("They melt on your palm", "वे हथेली पर पिघल जाते हैं"),
          feedback: t("That's gallium and caesium.", "वह गैलियम और सीज़ियम है।"),
        },
      ],
      answers: ["lustre", "inert", "malleable"],
      missing: t("Right so far: there's another reason.", "अब तक सही: एक और कारण है।"),
      isHidden: true,
      passes: false,
    });
    b.when(pan.on(QuestionSignal.Correct), theBoard.show(cans));
    b.when(cans.on(QuestionSignal.Correct), theBoard.show(lemon));
    b.when(lemon.on(QuestionSignal.Correct), theBoard.show(jewel));
    b.when(jewel.on(QuestionSignal.Correct), theBoard.pass());
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), pan, cans, lemon, jewel, space()]);
  },
  { passOn: PassOn.Rules },
);

/** Exercise 15, solved: the case closed. */
const finale = page(
  "finale",
  (b) => {
    const w = wordsOn(b);
    const closed = sceneOn(
      b,
      "closed",
      MetalSceneKind.CaseClosed,
      "the whole family on the sofa, Riya holding up the case file with a big tick, the bangles on the table",
    );
    const solution = choiceQuestion(b, {
      name: "solution",
      prompt: t(
        "Play the detective one last time: what solution did the man use?",
        "आख़िरी बार जासूस बनो: आदमी ने कौन-सा विलयन उपयोग किया?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Aqua regia: it dissolved the dull outer layer of gold, so the bangles shone but lost weight",
            "अम्लराज: इसने सोने की फीकी बाहरी परत घोल दी, इसलिए चूड़ियाँ चमकीं पर भार घट गया",
          ),
        },
        {
          id: "acid",
          label: t("Dilute hydrochloric acid", "तनु हाइड्रोक्लोरिक अम्ल"),
          feedback: t(
            "Gold is below hydrogen: dilute acid doesn't touch it.",
            "सोना हाइड्रोजन से नीचे है: तनु अम्ल उसे नहीं छूता।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const closedNote = w.definition(
      t(
        "**Case closed.** (1) The bangles were still metal: lustrous, malleable, sonorous. (2) Gold never tarnishes and can't be burnt off. (3) Water and dilute acids don't touch it; only **aqua regia**, 3 : 1 concentrated HCl and HNO₃, dissolves gold. (4) Gold is at the bottom of the reactivity series. (5) Metals react by losing electrons; gold holds on to its electrons tightly. (6) The salt on the desk taught how ions form and behave. (7) Gold is found free in nature. (8) It is refined electrolytically, and dissolved gold can be recovered, which is why the trick paid. (9) Jewellery is 22 carat, an alloy. The man dissolved a thin layer of the bangles in aqua regia and took the gold away in his bowl.",
        "**मामला बंद।** (1) चूड़ियाँ अब भी धातु थीं: चमकीली, आघातवर्ध्य, ध्वानिक। (2) सोना कभी फीका नहीं पड़ता और जलाकर हटाया नहीं जा सकता। (3) पानी और तनु अम्ल उसे नहीं छूते; केवल **अम्लराज**, 3 : 1 सांद्र HCl और HNO₃, सोने को घोलता है। (4) सोना सक्रियता श्रेणी में सबसे नीचे है। (5) धातुएँ इलेक्ट्रॉन खोकर अभिक्रिया करती हैं; सोना अपने इलेक्ट्रॉनों को कसकर पकड़ता है। (6) मेज़ पर पड़े नमक ने सिखाया कि आयन कैसे बनते और व्यवहार करते हैं। (7) सोना प्रकृति में मुक्त मिलता है। (8) इसका विद्युत अपघटनी परिष्करण होता है, और घुला सोना वापस निकाला जा सकता है, इसीलिए चाल फ़ायदे की थी। (9) गहने 22 कैरेट के होते हैं, एक मिश्रातु। आदमी ने चूड़ियों की एक पतली परत अम्लराज में घोल दी और सोना अपने कटोरे में ले गया।",
      ),
      "closedNote",
      { isHidden: true },
    );
    const warn = w.body(
      t(
        "Riya writes a notice for the society board: **\"Never hand gold to anyone at the door. Buy and repair gold only at a real jeweller, and check the hallmark.\"** Grandpa reads it twice and says it's the best chemistry he's seen all year.",
        'रिया सोसाइटी के बोर्ड के लिए एक सूचना लिखती है: **"दरवाज़े पर किसी को सोना कभी न दें। सोना केवल असली सुनार से ख़रीदें और ठीक कराएँ, और हॉलमार्क जाँचें।"** दादाजी उसे दो बार पढ़ते हैं और कहते हैं कि यह साल भर में देखा सबसे अच्छा रसायन है।',
      ),
      "warn",
      { isHidden: true },
    );
    b.when(solution.on(QuestionSignal.Correct), [
      theBoard.show(closedNote),
      theBoard.show(warn),
      theBoard.pass(),
    ]);
    return column([
      w.title(t("The case of the shrinking bangles", "सिकुड़ती चूड़ियों का मामला")),
      closed,
      solution,
      closedNote,
      warn,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice, finale. */
export const overview = [hook, conditions, prevent, alloys, carat, inLife, yourTurn, finale];

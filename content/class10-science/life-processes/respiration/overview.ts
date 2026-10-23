import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  GasSource,
  LeafAction,
  LeafMode,
  LifeScene,
  RespirationAction,
  RespirationMode,
  Route,
  leafLabDef,
  lifeSceneDef,
  respirationPathsDef,
} from "@chalk/prop-life";

const r = String.raw;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** The cramp on the last lap. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const track = b.prop(lifeSceneDef, "track", { scene: LifeScene.Cramp });
  b.standsFor(track, "on the track: Kabir sits holding his cramped calf; Riya kneels beside him");
  return column([
    w.title(t("The cramp", "ऐंठन")),
    track,
    w.body(
      t(
        "After stop 4, Kabir's breakfast is glucose in his blood, delivered to every cell. On the third practice he feels great and sprints the last lap flat out. Halfway round, his calf locks in a painful cramp. Walking, he never gets cramps. Why only when he sprints?",
        "पड़ाव 4 के बाद कबीर का नाश्ता उसके रुधिर में ग्लूकोज़ बनकर हर कोशिका तक पहुँच चुका है। तीसरे अभ्यास में वह बढ़िया महसूस करता है और आख़िरी चक्कर पूरी ताक़त से दौड़ता है। आधे रास्ते में उसकी पिंडली दर्दनाक ऐंठन में जकड़ जाती है। चलते हुए उसे कभी ऐंठन नहीं होती। केवल तेज़ दौड़ने पर ही क्यों?",
      ),
    ),
    w.body(
      t(
        "This stop: **how cells get energy out of food**, and what goes wrong in a sprint.",
        "इस पड़ाव का सवाल: **कोशिकाएँ भोजन से ऊर्जा कैसे निकालती हैं**, और तेज़ दौड़ में क्या गड़बड़ होती है।",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Breathed-out air has more carbon dioxide (Activity 6.4). */
const limeWater = page(
  "lime-water",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "NCERT Activity 6.4: lime water turns milky much faster with breathed-out air than with ordinary air pushed by a pichkari, so the air we breathe out has much more carbon dioxide.",
    );
    const glass = b.prop(respirationPathsDef, "glass", {
      mode: RespirationMode.LimeWater,
      source: GasSource.Breath,
      bubbles: 0,
      canSetSource: true,
    });
    b.studentOnly(glass.action(RespirationAction.Bubble));
    b.studentOnly(glass.action(RespirationAction.SetSource));
    b.studentOnly(glass.action(RespirationAction.Reset));
    b.standsFor(
      glass,
      "lime water with gas bubbled through it: breathed-out air, or ordinary air from a pichkari",
    );
    const faster = choiceQuestion(b, {
      name: "faster",
      prompt: t(
        "Try both. Which turns the lime water milky faster, and what does that tell us?",
        "दोनों आज़माओ। चूने का पानी किससे जल्दी दूधिया होता है, और इससे क्या पता चलता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Breathed-out air: it has much more carbon dioxide than ordinary air",
            "बाहर छोड़ी साँस: इसमें साधारण हवा से कहीं ज़्यादा कार्बन डाइऑक्साइड है",
          ),
        },
        {
          id: "pichkari",
          label: t("The pichkari's air", "पिचकारी की हवा"),
          feedback: t(
            "Count the rounds: breathed-out air turns it milky in a few, while the pichkari's air hardly clouds it.",
            "चक्कर गिनो: बाहर छोड़ी साँस कुछ ही में दूधिया कर देती है, जबकि पिचकारी की हवा मुश्किल से धुँधला करती है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("What we breathe out", "हम क्या बाहर छोड़ते हैं")),
      w.definition(
        t(
          "**Lime water test.** Clear **lime water** (a solution of calcium hydroxide) turns **milky** when carbon dioxide is bubbled through it. The more carbon dioxide, the faster it turns milky.",
          "**चूने के पानी का परीक्षण।** साफ़ **चूने का पानी** (कैल्शियम हाइड्रॉक्साइड का विलयन) कार्बन डाइऑक्साइड गुज़ारने पर **दूधिया** हो जाता है। जितनी ज़्यादा कार्बन डाइऑक्साइड, उतनी जल्दी दूधिया।",
        ),
      ),
      w.body(
        t(
          "NCERT Activity 6.4: blow your breath through a straw into lime water, and push ordinary air through another tube with a pichkari (syringe).",
          "NCERT क्रियाकलाप 6.4: स्ट्रॉ से चूने के पानी में साँस फूँको, और दूसरी नली में पिचकारी से साधारण हवा भेजो।",
        ),
      ),
      glass,
      faster,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Glucose → pyruvate → three routes; aerobic and anaerobic. */
const pathways = page(
  "pathways",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "NCERT Fig. 6.8: glucose (6 carbon) → pyruvate (3 carbon) in the cytoplasm, then (a) with oxygen in mitochondria → CO₂ + water + lots of energy, (b) in yeast without oxygen → ethanol + CO₂, (c) in muscle short of oxygen → lactic acid.",
    );
    const cell = b.prop(respirationPathsDef, "cell", {
      mode: RespirationMode.Pathways,
      route: Route.Aerobic,
      step: 0,
      canStep: true,
      canSetRoute: true,
    });
    b.studentOnly(cell.action(RespirationAction.Next));
    b.studentOnly(cell.action(RespirationAction.SetRoute));
    b.studentOnly(cell.action(RespirationAction.Reset));
    b.standsFor(
      cell,
      "glucose broken down step by step in a cell, then along one of three routes: with oxygen, in yeast, or in a muscle",
    );
    const where = choiceQuestion(b, {
      name: "where",
      prompt: t(
        "The breakdown of pyruvate using oxygen, giving carbon dioxide, water and energy, takes place in the…",
        "ऑक्सीजन से पाइरुवेट का टूटना, जिससे कार्बन डाइऑक्साइड, पानी और ऊर्जा मिलती है, कहाँ होता है…",
      ),
      options: [
        { id: "right", label: t("mitochondria", "माइटोकॉन्ड्रिया") },
        {
          id: "cyto",
          label: t("cytoplasm", "कोशिकाद्रव्य"),
          feedback: t(
            "Only the first step, glucose to pyruvate, happens in the cytoplasm. Breaking pyruvate with oxygen happens in the mitochondria.",
            "केवल पहला कदम, ग्लूकोज़ से पाइरुवेट, कोशिकाद्रव्य में होता है। ऑक्सीजन से पाइरुवेट का टूटना माइटोकॉन्ड्रिया में होता है।",
          ),
        },
        {
          id: "chloro",
          label: t("chloroplast", "क्लोरोप्लास्ट"),
          feedback: t(
            "Chloroplasts make food by photosynthesis. Respiration with oxygen is in the mitochondria.",
            "क्लोरोप्लास्ट प्रकाश संश्लेषण से भोजन बनाते हैं। ऑक्सीजन वाला श्वसन माइटोकॉन्ड्रिया में होता है।",
          ),
        },
        {
          id: "nucleus",
          label: t("nucleus", "केंद्रक"),
          feedback: t(
            "The nucleus holds the DNA. Respiration with oxygen is in the mitochondria.",
            "केंद्रक में DNA होता है। ऑक्सीजन वाला श्वसन माइटोकॉन्ड्रिया में होता है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Breaking down glucose", "ग्लूकोज़ का टूटना")),
      w.definition(
        t(
          "**Respiration (in cells).** Inside cells, food (glucose) is broken down to release energy. This is **cellular respiration**. The first step is always the same: **glucose**, a molecule with six carbon atoms, is broken into **pyruvate**, a three-carbon molecule. This happens in the **cytoplasm**.",
          "**श्वसन (कोशिकाओं में)।** कोशिकाओं के अंदर भोजन (ग्लूकोज़) को ऊर्जा निकालने के लिए तोड़ा जाता है। यह **कोशिकीय श्वसन** है। पहला कदम हमेशा एक-सा है: **ग्लूकोज़**, छह कार्बन परमाणुओं वाला अणु, **पाइरुवेट** में टूटता है, जो तीन कार्बन वाला अणु है। यह **कोशिकाद्रव्य** में होता है।",
        ),
      ),
      w.definition(
        t(
          '**Aerobic and anaerobic.** What happens to pyruvate next depends on oxygen. With oxygen, in the **mitochondria** (tiny energy-releasing parts of the cell), pyruvate is broken down to **carbon dioxide and water**. This is **aerobic respiration** ("with air"), and it releases a lot of energy. Without oxygen, it is **anaerobic respiration** ("without air"), which releases much less.',
          '**वायवीय और अवायवीय।** पाइरुवेट का आगे क्या होगा, यह ऑक्सीजन पर निर्भर है। ऑक्सीजन हो तो **माइटोकॉन्ड्रिया** (कोशिका के ऊर्जा निकालने वाले नन्हे भाग) में पाइरुवेट **कार्बन डाइऑक्साइड और पानी** में टूटता है। यह **वायवीय श्वसन** ("हवा के साथ") है, और यह बहुत ऊर्जा देता है। ऑक्सीजन के बिना **अवायवीय श्वसन** ("हवा के बिना") होता है, जो बहुत कम ऊर्जा देता है।',
        ),
      ),
      w.body(t("Aerobic respiration, in words:", "वायवीय श्वसन, शब्दों में:")),
      w.body(
        t(
          r`$$\begin{aligned} \text{glucose} &\xrightarrow{\text{cytoplasm}} \text{pyruvate} \\ &\xrightarrow[\text{mitochondria}]{\text{oxygen}} \text{carbon dioxide} \\ &\qquad + \text{water} + \text{energy} \end{aligned}$$`,
          r`$$\begin{aligned} \text{ग्लूकोज़} &\xrightarrow{\text{कोशिकाद्रव्य}} \text{पाइरुवेट} \\ &\xrightarrow[\text{माइटोकॉन्ड्रिया}]{\text{ऑक्सीजन}} \text{कार्बन डाइऑक्साइड} \\ &\qquad + \text{पानी} + \text{ऊर्जा} \end{aligned}$$`,
        ),
      ),
      w.body(t("Step through each route below.", "नीचे हर रास्ते के कदम चलो।")),
      cell,
      where,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Yeast: fermentation (Activity 6.5). */
const yeast = page(
  "yeast",
  (b) => {
    const w = wordsOn(b);
    const tube = b.prop(respirationPathsDef, "tube", {
      mode: RespirationMode.LimeWater,
      source: GasSource.Yeast,
      bubbles: 0,
      canSetSource: false,
    });
    b.studentOnly(tube.action(RespirationAction.Bubble));
    b.studentOnly(tube.action(RespirationAction.Reset));
    b.standsFor(tube, "gas from yeast in sugar solution bubbled into lime water");
    const products = choiceQuestion(b, {
      name: "products",
      prompt: t(
        "The lime water turns milky. What are the products of fermentation in yeast?",
        "चूने का पानी दूधिया होता है। यीस्ट में किण्वन के उत्पाद क्या हैं?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Ethanol and carbon dioxide (and a little energy)",
            "एथेनॉल और कार्बन डाइऑक्साइड (और थोड़ी ऊर्जा)",
          ),
        },
        {
          id: "lactic",
          label: t("Lactic acid", "लैक्टिक अम्ल"),
          feedback: t(
            "Lactic acid is made in our muscles when oxygen runs short. Yeast makes ethanol and carbon dioxide; the carbon dioxide turned the lime water milky.",
            "लैक्टिक अम्ल हमारी मांसपेशियों में ऑक्सीजन कम पड़ने पर बनता है। यीस्ट एथेनॉल और कार्बन डाइऑक्साइड बनाता है; कार्बन डाइऑक्साइड ने चूने का पानी दूधिया किया।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Yeast: life without oxygen", "यीस्ट: ऑक्सीजन के बिना जीवन")),
      w.body(
        t(
          "NCERT Activity 6.5: add **yeast** (a tiny single-celled fungus) to fruit juice or sugar solution in a corked tube. Lead its gas through a bent glass tube into lime water.",
          "NCERT क्रियाकलाप 6.5: फलों के रस या चीनी के घोल में **यीस्ट** (एक नन्हा एककोशिकीय कवक) डालकर नली को कॉर्क से बंद करो। उसकी गैस को मुड़ी काँच की नली से चूने के पानी में ले जाओ।",
        ),
      ),
      w.definition(
        t(
          "**Fermentation.** In yeast, without oxygen, pyruvate is turned into **ethanol** (an alcohol) and **carbon dioxide**. This anaerobic respiration in yeast is called **fermentation**.",
          "**किण्वन।** यीस्ट में, ऑक्सीजन के बिना, पाइरुवेट **एथेनॉल** (एक ऐल्कोहॉल) और **कार्बन डाइऑक्साइड** में बदलता है। यीस्ट के इस अवायवीय श्वसन को **किण्वन** कहते हैं।",
        ),
      ),
      tube,
      products,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Muscles short of oxygen: lactic acid and cramps. */
const muscle = page(
  "muscle",
  (b) => {
    const w = wordsOn(b);
    const cell = b.prop(respirationPathsDef, "cell", {
      mode: RespirationMode.Pathways,
      route: Route.Muscle,
      step: 0,
      canStep: true,
      canSetRoute: false,
    });
    b.studentOnly(cell.action(RespirationAction.Next));
    b.studentOnly(cell.action(RespirationAction.Reset));
    b.standsFor(
      cell,
      "glucose broken down in a muscle cell that is short of oxygen, ending in lactic acid",
    );
    const when = choiceQuestion(b, {
      name: "when",
      prompt: t(
        "When do our muscle cells turn pyruvate into lactic acid?",
        "हमारी मांसपेशी कोशिकाएँ पाइरुवेट को लैक्टिक अम्ल में कब बदलती हैं?",
      ),
      options: [
        {
          id: "right",
          label: t("When they run short of oxygen", "जब उनमें ऑक्सीजन कम पड़ जाती है"),
        },
        {
          id: "always",
          label: t("All the time", "हर समय"),
          feedback: t(
            "Normally, with enough oxygen, they use the aerobic route. Lactic acid is the fall-back when oxygen runs short, as in sudden hard activity.",
            "सामान्यतः, पर्याप्त ऑक्सीजन होने पर, वे वायवीय रास्ता अपनाती हैं। लैक्टिक अम्ल तब बनता है जब ऑक्सीजन कम पड़ जाए, जैसे अचानक कड़ी मेहनत में।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Muscles short of oxygen", "ऑक्सीजन की कमी में मांसपेशियाँ")),
      w.body(
        t(
          "Sometimes, during sudden hard activity, our muscle cells can't get oxygen fast enough. Then they take another route: pyruvate is turned into **lactic acid**, another three-carbon molecule. Little energy is released, and the **build-up of lactic acid in the muscles causes cramps**.",
          "कभी-कभी अचानक कड़ी मेहनत में हमारी मांसपेशी कोशिकाओं को ऑक्सीजन जल्दी नहीं मिल पाती। तब वे दूसरा रास्ता लेती हैं: पाइरुवेट **लैक्टिक अम्ल** में बदलता है, जो एक और तीन-कार्बन अणु है। थोड़ी ऊर्जा निकलती है, और **मांसपेशियों में लैक्टिक अम्ल जमा होने से ऐंठन होती है**।",
        ),
      ),
      cell,
      when,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** ATP, the energy currency. */
const atp = page(
  "atp",
  (b) => {
    const w = wordsOn(b);
    const currency = choiceQuestion(b, {
      name: "currency",
      prompt: t(
        'Why is ATP called the cell\'s "energy currency"?',
        'ATP को कोशिका की "ऊर्जा मुद्रा" क्यों कहते हैं?',
      ),
      options: [
        {
          id: "right",
          label: t(
            "Energy from respiration is stored in it, then spent on any job the cell needs",
            "श्वसन की ऊर्जा इसमें जमा होती है, फिर कोशिका के किसी भी काम पर ख़र्च होती है",
          ),
        },
        {
          id: "food",
          label: t("It is the food we eat", "यह वह भोजन है जो हम खाते हैं"),
          feedback: t(
            "Food is broken down in respiration; the energy released is used to make ATP, which the cell then spends.",
            "श्वसन में भोजन टूटता है; निकली ऊर्जा से ATP बनता है, जिसे कोशिका फिर ख़र्च करती है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("ATP: the cell's energy currency", "ATP: कोशिका की ऊर्जा मुद्रा")),
      w.definition(
        t(
          "**ATP.** The energy released in respiration is used at once to make a molecule called **ATP**. ATP then fuels all other activities in the cell: when it is broken down, it gives a fixed amount of energy that drives the cell's **endothermic** (energy-absorbing) reactions.",
          "**ATP।** श्वसन में निकली ऊर्जा से तुरंत **ATP** नाम का अणु बनाया जाता है। ATP फिर कोशिका की बाक़ी सारी गतिविधियों को ईंधन देता है: जब यह टूटता है, तो एक निश्चित मात्रा में ऊर्जा देता है जो कोशिका की **ऊष्माशोषी** (ऊर्जा सोखने वाली) अभिक्रियाओं को चलाती है।",
        ),
      ),
      w.note(
        t(
          "**More to know.** ATP is made from ADP and inorganic phosphate using energy from respiration. Breaking its last phosphate link with water releases about 30.5 kJ/mol. Like a battery that can run a fan, a light or a radio, ATP powers many jobs: muscle contraction, making proteins, carrying nerve impulses.",
          "**और जानो।** श्वसन की ऊर्जा से ADP और अकार्बनिक फ़ॉस्फ़ेट से ATP बनता है। पानी से इसकी आख़िरी फ़ॉस्फ़ेट कड़ी तोड़ने पर लगभग 30.5 kJ/mol ऊर्जा निकलती है। जैसे एक बैटरी पंखा, बत्ती या रेडियो चला सकती है, वैसे ही ATP कई काम चलाता है: मांसपेशियों का सिकुड़ना, प्रोटीन बनाना, तंत्रिका आवेग ले जाना।",
        ),
      ),
      currency,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Plants respire too: gas exchange by day and night. */
const plants = page(
  "plants",
  (b) => {
    const w = wordsOn(b);
    const leaf = b.prop(leafLabDef, "leaf", {
      mode: LeafMode.DayNight,
      step: 0,
      isDay: true,
      canStep: false,
      canToggle: true,
    });
    b.studentOnly(leaf.action(LeafAction.SetDay));
    b.standsFor(leaf, "a leaf's gas exchange by day and by night");
    const night = choiceQuestion(b, {
      name: "night",
      prompt: t(
        "Switch to night. What is the main gas a leaf gives out at night, and why?",
        "रात पर जाओ। पत्ती रात में मुख्य रूप से कौन-सी गैस छोड़ती है, और क्यों?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Carbon dioxide: it still respires, but there's no photosynthesis to use it",
            "कार्बन डाइऑक्साइड: यह अब भी श्वसन करती है, पर उसे उपयोग करने को प्रकाश संश्लेषण नहीं",
          ),
        },
        {
          id: "oxygen",
          label: t("Oxygen, as in the day", "ऑक्सीजन, दिन की तरह"),
          feedback: t(
            "Oxygen comes from photosynthesis, which stops in the dark. At night, the carbon dioxide from respiration is let out.",
            "ऑक्सीजन प्रकाश संश्लेषण से आती है, जो अँधेरे में रुक जाता है। रात में श्वसन से बनी कार्बन डाइऑक्साइड बाहर निकलती है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Plants respire too", "पौधे भी श्वसन करते हैं")),
      w.body(
        t(
          "Aerobic respiration needs oxygen, so plants must take it in too. They exchange gases through the stomata, and large air spaces between their cells keep every cell in contact with air. Carbon dioxide and oxygen move by diffusion, in whichever direction conditions and the plant's needs decide.",
          "वायवीय श्वसन को ऑक्सीजन चाहिए, इसलिए पौधों को भी उसे लेना पड़ता है। वे रंध्रों से गैसों का आदान-प्रदान करते हैं, और उनकी कोशिकाओं के बीच के बड़े वायु-स्थान हर कोशिका को हवा के संपर्क में रखते हैं। कार्बन डाइऑक्साइड और ऑक्सीजन विसरण से चलती हैं, उस दिशा में जो परिस्थितियाँ और पौधे की ज़रूरतें तय करें।",
        ),
      ),
      w.body(
        t(
          "By **day**, the carbon dioxide made by respiration is used up in photosynthesis, so none is released; oxygen release is the main event. At **night**, with no photosynthesis, getting rid of carbon dioxide is the main exchange.",
          "**दिन** में श्वसन से बनी कार्बन डाइऑक्साइड प्रकाश संश्लेषण में ख़र्च हो जाती है, इसलिए वह बाहर नहीं निकलती; मुख्य घटना ऑक्सीजन का निकलना है। **रात** में, प्रकाश संश्लेषण न होने से, कार्बन डाइऑक्साइड निकालना मुख्य आदान-प्रदान है।",
        ),
      ),
      leaf,
      night,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** The cramp explained. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const track = b.prop(lifeSceneDef, "track", { scene: LifeScene.Cramp });
    b.standsFor(track, "Kabir holding his cramped calf on the track");
    const why = choiceQuestion(b, {
      name: "why",
      prompt: t(
        "So why did Kabir's calf cramp in the sprint, but never while walking?",
        "तो कबीर की पिंडली में तेज़ दौड़ में ऐंठन क्यों हुई, चलते हुए कभी क्यों नहीं?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Short of oxygen, his muscles made lactic acid",
            "ऑक्सीजन की कमी में उसकी पेशियों ने लैक्टिक अम्ल बनाया",
          ),
        },
        {
          id: "food",
          label: t("He had run out of food and glucose", "उसका भोजन और ग्लूकोज़ खत्म हो गया था"),
          feedback: t(
            "He had eaten well. The problem was oxygen: the muscles couldn't get it fast enough, so they switched to the route that makes lactic acid.",
            "उसने अच्छा खाया था। समस्या ऑक्सीजन की थी: मांसपेशियों को वह जल्दी नहीं मिली, इसलिए वे उस रास्ते पर चली गईं जिससे लैक्टिक अम्ल बनता है।",
          ),
        },
        {
          id: "co2",
          label: t(
            "Carbon dioxide built up in his calf muscle",
            "उसकी पिंडली की पेशी में कार्बन डाइऑक्साइड जमा हो गई",
          ),
          feedback: t(
            "Cramps come from lactic acid, made when muscles respire without enough oxygen.",
            "ऐंठन लैक्टिक अम्ल से होती है, जो पर्याप्त ऑक्सीजन के बिना श्वसन करने पर बनता है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const stop = w.definition(
      t(
        "**Stop 5 done.** Kabir's cells burn glucose for energy, stored as ATP. With enough oxygen they use the aerobic route and get lots of energy; flat out, his muscles run short and make lactic acid, which cramps. Riya's plan: build up speed slowly over the three weeks. But how does more oxygen reach the muscles? Next stop: breathing.",
        "**पड़ाव 5 पूरा।** कबीर की कोशिकाएँ ऊर्जा के लिए ग्लूकोज़ जलाती हैं, जो ATP के रूप में जमा होती है। पर्याप्त ऑक्सीजन हो तो वे वायवीय रास्ता लेती हैं और ख़ूब ऊर्जा पाती हैं; पूरी ताक़त में उसकी मांसपेशियों में ऑक्सीजन कम पड़ती है और लैक्टिक अम्ल बनता है, जिससे ऐंठन होती है। रिया की योजना: तीन हफ़्तों में धीरे-धीरे रफ़्तार बढ़ाना। पर मांसपेशियों तक ज़्यादा ऑक्सीजन पहुँचती कैसे है? अगला पड़ाव: साँस लेना।",
      ),
      "stop",
      { isHidden: true },
    );
    b.when(why.on(QuestionSignal.Correct), [theBoard.show(stop), theBoard.pass()]);
    return column([w.title(t("Back on the track", "फिर ट्रैक पर")), track, why, stop, space()]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** NCERT in-text Q2 and Exercise 8. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const differ = choiceQuestion(b, {
      name: "differ",
      prompt: t(
        "Which is a correct difference between aerobic and anaerobic respiration?",
        "वायवीय और अवायवीय श्वसन में कौन-सा अंतर सही है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Aerobic uses oxygen and releases much more energy; anaerobic needs no oxygen and releases less",
            "वायवीय ऑक्सीजन लेता है और कहीं ज़्यादा ऊर्जा देता है; अवायवीय को ऑक्सीजन नहीं चाहिए और कम ऊर्जा देता है",
          ),
        },
        {
          id: "first",
          label: t(
            "They differ in the first step: aerobic doesn't make pyruvate",
            "पहले कदम में अंतर है: वायवीय पाइरुवेट नहीं बनाता",
          ),
          feedback: t(
            "The first step, glucose to pyruvate in the cytoplasm, is the same for all. They differ in what happens to pyruvate.",
            "पहला कदम, कोशिकाद्रव्य में ग्लूकोज़ से पाइरुवेट, सबमें एक-सा है। अंतर पाइरुवेट के आगे के सफ़र में है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const organism = choiceQuestion(b, {
      name: "organism",
      prompt: t(
        "Name an organism that uses the anaerobic mode of respiration.",
        "अवायवीय श्वसन करने वाले किसी जीव का नाम बताओ।",
      ),
      options: [
        { id: "right", label: t("Yeast", "यीस्ट") },
        {
          id: "fish",
          label: t("Fish", "मछली"),
          feedback: t(
            "Fish take oxygen from water and respire aerobically. Yeast ferments sugar without oxygen.",
            "मछलियाँ पानी से ऑक्सीजन लेकर वायवीय श्वसन करती हैं। यीस्ट ऑक्सीजन के बिना शर्करा का किण्वन करता है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ Breathed-out air has more carbon dioxide. ✓ Glucose → pyruvate (cytoplasm), then: with oxygen → carbon dioxide + water + lots of energy (mitochondria); yeast → ethanol + carbon dioxide; muscle short of oxygen → lactic acid (cramps). ✓ The energy is stored as ATP. ✓ Plants release carbon dioxide at night. Next: breathing.",
        "**मिशन लॉग।** ✓ बाहर छोड़ी साँस में ज़्यादा कार्बन डाइऑक्साइड होती है। ✓ ग्लूकोज़ → पाइरुवेट (कोशिकाद्रव्य), फिर: ऑक्सीजन के साथ → कार्बन डाइऑक्साइड + पानी + बहुत ऊर्जा (माइटोकॉन्ड्रिया); यीस्ट → एथेनॉल + कार्बन डाइऑक्साइड; ऑक्सीजन की कमी में मांसपेशी → लैक्टिक अम्ल (ऐंठन)। ✓ ऊर्जा ATP के रूप में जमा होती है। ✓ पौधे रात में कार्बन डाइऑक्साइड छोड़ते हैं। आगे: साँस लेना।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(organism.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), differ, organism, log, space()]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [hook, limeWater, pathways, yeast, muscle, atp, plants, inLife, yourTurn];

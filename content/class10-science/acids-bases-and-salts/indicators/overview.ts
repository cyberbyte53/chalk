import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, goalQuestion, wordsOn } from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import { AcidSceneKind, IndicatorDerived, IndicatorId, SubstanceId } from "@chalk/prop-chemistry";
import { fillTable, indicatorOn, sceneOn } from "../kit";

const r = String.raw;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** Who, where, what: Kabir's birthday, and Riya's rash promise of a magic show. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const plan = sceneOn(
    b,
    "plan",
    AcidSceneKind.PartyPlan,
    "Riya and Kabir at the dining table planning Kabir's birthday party, a list of magic-show acts beside the cake order",
  );
  return column([
    w.title(t("A magic show for Kabir", "कबीर के लिए जादू का शो")),
    plan,
    w.body(
      t(
        "Diwali is over, and the house still shines. Next on the calendar is **Kabir's birthday**. Riya, in Class 10, has made a rash promise: the party will end with a **magic show**. Potions that change colour, a volcano that fizzes, a fire put out by a bottle, and a keepsake handprint that sets hard as stone.",
        "दिवाली बीत गई, और घर अब भी चमक रहा है। कैलेंडर पर अगला है **कबीर का जन्मदिन**। दसवीं में पढ़ने वाली रिया ने एक जल्दबाज़ी का वादा कर दिया है: पार्टी **जादू के शो** से ख़त्म होगी। रंग बदलने वाले घोल, सनसनाता ज्वालामुखी, बोतल से बुझती आग, और पत्थर जैसी सख़्त हो जाने वाली हाथ की छाप।",
      ),
    ),
    w.body(
      t(
        'Grandpa, reading over her shoulder, smiles. "No magic needed. All of it is **acids, bases and salts**. Learn them, and every trick will work, and you\'ll know why."',
        'दादाजी उसके कंधे के ऊपर से पढ़कर मुस्कुराते हैं। "जादू की कोई ज़रूरत नहीं। यह सब **अम्ल, क्षारक और लवण** हैं। इन्हें सीखो, तो हर करतब चलेगा, और तुम जानोगी क्यों।"',
      ),
    ),
    space(),
  ]);
});

/** Why the chapter, and the stops on the way. */
const why = page("why", (b) => {
  const w = wordsOn(b);
  const potions = sceneOn(
    b,
    "potions",
    AcidSceneKind.MagicPotions,
    "a row of glasses of purple red-cabbage juice turning pink and green as Riya adds things to them",
  );
  return column([
    w.title(t("What this chapter is for", "यह अध्याय किसलिए है")),
    potions,
    w.body(
      t(
        "That's the mission for this chapter: put on Kabir's magic show, and be able to explain every act. Each lesson gives Riya one more trick, and the science behind it.",
        "यही इस अध्याय का मिशन है: कबीर का जादू का शो करना, और हर करतब समझा पाना। हर पाठ रिया को एक और करतब देता है, और उसके पीछे का विज्ञान।",
      ),
    ),
    w.definition(
      t(
        "**The stops on the way.** (1) Acid, base or neither? Indicators: *this lesson*. (2) Acids with metals and carbonates. (3) Acids and bases cancel each other out. (4) What all acids share: ions in water. (5) How strong? The pH scale. (6) pH in living things. (7) Salts and their pH. (8) Chemicals made from common salt. (9) Salts with water inside them: plaster of Paris.",
        "**रास्ते के पड़ाव।** (1) अम्ल, क्षारक या कोई नहीं? सूचक: *यह पाठ*। (2) धातुओं और कार्बोनेटों से अम्ल। (3) अम्ल और क्षारक एक-दूसरे का असर मिटाते हैं। (4) सब अम्लों में साझा क्या है: जल में आयन। (5) कितना प्रबल? pH स्केल। (6) सजीवों में pH। (7) लवण और उनका pH। (8) साधारण नमक से बने रसायन। (9) अपने अंदर पानी रखने वाले लवण: प्लास्टर ऑफ़ पेरिस।",
      ),
    ),
    w.body(
      t(
        "First stop, from the beginning: how can you tell an acid from a base without tasting it?",
        "पहला पड़ाव, शुरू से: बिना चखे अम्ल और क्षारक को कैसे पहचानें?",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Class 9 recap: sour is acid, bitter is base; never taste; what an indicator is. */
const recap = page(
  "recap",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "Why do chemists use indicators instead of tasting?",
        "रसायनज्ञ चखने के बजाय सूचक क्यों इस्तेमाल करते हैं?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Many acids and bases burn or poison: tasting is dangerous",
            "कई अम्ल और क्षारक जलाते या ज़हरीले होते हैं: चखना ख़तरनाक है",
          ),
        },
        {
          id: "slow",
          label: t("Tasting takes too long", "चखने में बहुत समय लगता है"),
          feedback: t(
            "Speed isn't the reason. A strong acid or alkali can burn your tongue.",
            "कारण गति नहीं है। प्रबल अम्ल या क्षार जीभ जला सकता है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Sour, bitter, and a safer test", "खट्टा, कड़वा, और एक सुरक्षित जाँच")),
      w.body(
        t(
          "From earlier classes: lemon juice and vinegar taste **sour** because they contain **acids**. Soap and baking soda taste **bitter** because they contain **bases**. Plenty of things are neither, like pure water or sugar.",
          "पिछली कक्षाओं से: नींबू का रस और सिरका **खट्टे** लगते हैं क्योंकि उनमें **अम्ल** होते हैं। साबुन और खाने का सोडा **कड़वे** लगते हैं क्योंकि उनमें **क्षारक** होते हैं। बहुत-सी चीज़ें इनमें से कोई नहीं, जैसे शुद्ध पानी या चीनी।",
        ),
      ),
      w.body(
        t(
          "But in a lab you **never taste or touch** a chemical. The acids and bases there can burn skin and eyes. So we need a test that only looks.",
          "पर प्रयोगशाला में किसी रसायन को **कभी चखते या छूते नहीं**। वहाँ के अम्ल और क्षारक त्वचा और आँखें जला सकते हैं। इसलिए हमें ऐसी जाँच चाहिए जो बस देखकर हो।",
        ),
      ),
      w.definition(
        t(
          "**Indicator.** An **indicator** is a dye (or a mix of dyes) whose colour, or sometimes smell, is different in an acid and in a base. Add a drop and watch: the indicator tells you whether a substance is **acidic**, **basic**, or **neutral** (neither).",
          "**सूचक।** **सूचक** एक रंजक (या रंजकों का मिश्रण) है जिसका रंग, या कभी-कभी गंध, अम्ल और क्षारक में अलग होता है। एक बूँद डालो और देखो: सूचक बताता है कि पदार्थ **अम्लीय** है, **क्षारकीय** है, या **उदासीन** (कोई नहीं)।",
        ),
      ),
      w.definition(
        t(
          "**Litmus.** The best-known indicator is **litmus**, a purple dye taken from a **lichen** (a tiny plant-like living thing). Litmus is red in acid, blue in base, and purple when neither. It is sold as a purple **solution**, and as strips of **red litmus paper** and **blue litmus paper**: acids turn blue litmus red; bases turn red litmus blue.",
          "**लिटमस।** सबसे जाना-माना सूचक **लिटमस** है, **लाइकेन** (एक छोटा पौधे-जैसा सजीव) से निकाला गया बैंगनी रंजक। लिटमस अम्ल में लाल, क्षारक में नीला, और दोनों न होने पर बैंगनी होता है। यह बैंगनी **विलयन** के रूप में, और **लाल लिटमस पत्र** व **नीले लिटमस पत्र** की पट्टियों के रूप में मिलता है: अम्ल नीले लिटमस को लाल करते हैं; क्षारक लाल लिटमस को नीला करते हैं।",
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

const LAB = [
  SubstanceId.HydrochloricAcid,
  SubstanceId.AceticAcid,
  SubstanceId.SodiumHydroxide,
  SubstanceId.AmmoniumHydroxide,
];

/** Activity 2.1 with litmus papers: the learner fills the table. */
const litmus = page(
  "litmus",
  (b) => {
    const w = wordsOn(b);
    const papers = [IndicatorId.RedLitmus, IndicatorId.BlueLitmus];
    const lab = indicatorOn(b, "lab", LAB, papers);
    b.standsFor(
      lab,
      "four watch-glasses: hydrochloric acid, acetic acid, sodium hydroxide and ammonium hydroxide; red and blue litmus strips to dip in each; a table filling in",
    );
    const goal = goalQuestion(b, {
      about: lab,
      prompt: t(
        "Pick a litmus paper, then tap each glass to dip it. Fill the whole table.",
        "एक लिटमस पत्र चुनो, फिर हर काँच पर टैप करके उसे डुबाओ। पूरी तालिका भरो।",
      ),
      isMet: lab.derived(IndicatorDerived.IsTableFull),
      solve: fillTable(lab, LAB, papers),
    });
    const read = w.body(
      t(
        "Read the table. The two **acids** (hydrochloric and acetic) turn **blue litmus red** and leave red litmus red. The two **bases** (sodium hydroxide and ammonium hydroxide) turn **red litmus blue** and leave blue litmus blue.",
        "तालिका पढ़ो। दोनों **अम्ल** (हाइड्रोक्लोरिक और ऐसीटिक) **नीले लिटमस को लाल** करते हैं और लाल लिटमस को लाल ही रहने देते हैं। दोनों **क्षारक** (सोडियम हाइड्रॉक्साइड और अमोनियम हाइड्रॉक्साइड) **लाल लिटमस को नीला** करते हैं और नीले को नीला रहने देते हैं।",
      ),
      "read",
      { isHidden: true },
    );
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(read));
    return column([
      w.title(t("Testing with litmus", "लिटमस से जाँच")),
      w.body(
        t(
          "NCERT Activity 2.1. A drop of each lab solution sits on a watch-glass. Its formula is written under it.",
          "NCERT क्रियाकलाप 2.1। हर प्रयोगशाला विलयन की एक बूँद एक वॉच-ग्लास पर है। उसका सूत्र उसके नीचे लिखा है।",
        ),
      ),
      lab,
      goal,
      read,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Phenolphthalein and methyl orange: synthetic indicators. */
const synthetic = page(
  "synthetic",
  (b) => {
    const w = wordsOn(b);
    const dyes = [IndicatorId.Phenolphthalein, IndicatorId.MethylOrange];
    const lab = indicatorOn(b, "lab", LAB, dyes);
    b.standsFor(
      lab,
      "the same four glasses, now with phenolphthalein and methyl orange solutions to drop in",
    );
    const goal = goalQuestion(b, {
      about: lab,
      prompt: t("Try both dyes on every glass.", "दोनों रंजक हर काँच पर आज़माओ।"),
      isMet: lab.derived(IndicatorDerived.IsTableFull),
      solve: fillTable(lab, LAB, dyes),
    });
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "A clear solution turns phenolphthalein pink. What is it?",
        "एक साफ़ विलयन फ़िनॉल्फ़्थेलिन को गुलाबी कर देता है। वह क्या है?",
      ),
      options: [
        { id: "right", label: t("A base", "क्षारक") },
        {
          id: "acid",
          label: t("An acid", "अम्ल"),
          feedback: t(
            "Check the table: phenolphthalein stays colourless in both acids.",
            "तालिका देखो: दोनों अम्लों में फ़िनॉल्फ़्थेलिन रंगहीन रहता है।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
    });
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(ask));
    return column([
      w.title(t("Indicators made in a factory", "कारख़ाने में बने सूचक")),
      w.definition(
        t(
          "**Natural and synthetic indicators.** Litmus comes from a living thing: it is a **natural** indicator. **Phenolphthalein** and **methyl orange** are made in factories: they are **synthetic** indicators.",
          "**प्राकृतिक और संश्लेषित सूचक।** लिटमस एक सजीव से आता है: यह **प्राकृतिक** सूचक है। **फ़िनॉल्फ़्थेलिन** और **मेथिल ऑरेंज** कारख़ानों में बनते हैं: ये **संश्लेषित** सूचक हैं।",
        ),
      ),
      lab,
      goal,
      w.body(
        t(
          "**Phenolphthalein** stays colourless in acid and turns **pink** in base. **Methyl orange** turns **red** in acid and **yellow** in base.",
          "**फ़िनॉल्फ़्थेलिन** अम्ल में रंगहीन रहता है और क्षारक में **गुलाबी** हो जाता है। **मेथिल ऑरेंज** अम्ल में **लाल** और क्षारक में **पीला** हो जाता है।",
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

const KITCHEN = [SubstanceId.LemonJuice, SubstanceId.SoapSolution, SubstanceId.DistilledWater];

/** Turmeric and red cabbage: indicators from the kitchen. */
const natural = page(
  "natural",
  (b) => {
    const w = wordsOn(b);
    const plants = [IndicatorId.Turmeric, IndicatorId.RedCabbage];
    const kitchen = indicatorOn(b, "kitchen", KITCHEN, plants);
    b.standsFor(
      kitchen,
      "lemon juice, soap solution and distilled water on watch-glasses; turmeric paper and red cabbage juice to test them",
    );
    const goal = goalQuestion(b, {
      about: kitchen,
      prompt: t(
        "Test the three kitchen liquids with both plant indicators.",
        "तीनों रसोई के द्रवों को दोनों पौधों के सूचकों से जाँचो।",
      ),
      isMet: kitchen.derived(IndicatorDerived.IsTableFull),
      solve: fillTable(kitchen, KITCHEN, plants),
    });
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "Turmeric turned reddish brown in one glass only. Which one?",
        "हल्दी केवल एक काँच में लाल-भूरी हुई। किसमें?",
      ),
      options: [
        { id: "right", label: t("The soap solution: a base", "साबुन का घोल: क्षारक") },
        {
          id: "lemon",
          label: t("The lemon juice: an acid", "नींबू का रस: एक अम्ल"),
          feedback: t(
            "Turmeric stays yellow in acids. It changes only in a base.",
            "अम्लों में हल्दी पीली रहती है। यह केवल क्षारक में बदलती है।",
          ),
        },
        {
          id: "water",
          label: t("The distilled water: neutral", "आसुत जल: उदासीन"),
          feedback: t(
            "Water is neutral: no indicator changes in it.",
            "पानी उदासीन है: इसमें कोई सूचक नहीं बदलता।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
    });
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(ask));
    return column([
      w.title(t("Indicators from the kitchen", "रसोई से सूचक")),
      w.body(
        t(
          "Many plants make dyes that act as indicators: **turmeric**, **red cabbage** leaves, and the coloured petals of flowers like **Hydrangea**, **Petunia** and **Geranium**. All are natural indicators.",
          "कई पौधे ऐसे रंजक बनाते हैं जो सूचक का काम करते हैं: **हल्दी**, **लाल पत्तागोभी** की पत्तियाँ, और **हाइड्रेंजिया**, **पेटूनिया** व **जेरेनियम** जैसे फूलों की रंगीन पंखुड़ियाँ। ये सब प्राकृतिक सूचक हैं।",
        ),
      ),
      kitchen,
      goal,
      w.body(
        t(
          "**Turmeric** is yellow and turns **reddish brown** in a base. **Red cabbage** juice is purple; it turns **pink-red** in acid and **green** in base.",
          "**हल्दी** पीली है और क्षारक में **लाल-भूरी** हो जाती है। **लाल पत्तागोभी** का रस बैंगनी है; यह अम्ल में **गुलाबी-लाल** और क्षारक में **हरा** हो जाता है।",
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

const SMELL_SAMPLES = [SubstanceId.HydrochloricAcid, SubstanceId.SodiumHydroxide];

/** Activity 2.2: olfactory indicators. */
const smell = page(
  "smell",
  (b) => {
    const w = wordsOn(b);
    const smells = [IndicatorId.Onion, IndicatorId.Vanilla, IndicatorId.Clove];
    const nose = indicatorOn(b, "nose", SMELL_SAMPLES, smells);
    b.standsFor(
      nose,
      "dilute hydrochloric acid and dilute sodium hydroxide; onion-soaked cloth, vanilla essence and clove oil to add, and a note of whether each smell stays",
    );
    const goal = goalQuestion(b, {
      about: nose,
      prompt: t(
        "Add each smell to the acid and to the base. Does the smell stay?",
        "हर गंध को अम्ल में और क्षारक में डालो। क्या गंध बनी रहती है?",
      ),
      isMet: nose.derived(IndicatorDerived.IsTableFull),
      solve: fillTable(nose, SMELL_SAMPLES, smells),
    });
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "Which of these can be used as olfactory indicators?",
        "इनमें से किन्हें गंधीय सूचक की तरह इस्तेमाल कर सकते हैं?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "All three: each smell is lost in a base but stays in an acid",
            "तीनों: हर गंध क्षारक में चली जाती है पर अम्ल में बनी रहती है",
          ),
        },
        {
          id: "onion",
          label: t("Only onion", "केवल प्याज़"),
          feedback: t(
            "Look at the table again: vanilla and clove behave the same way.",
            "तालिका फिर देखो: वनीला और लौंग भी ऐसा ही करते हैं।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
    });
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(ask));
    return column([
      w.title(t("Indicators you can smell", "सूंघकर पहचानने वाले सूचक")),
      w.definition(
        t(
          "**Olfactory indicator.** *Olfactory* means to do with smell. An **olfactory indicator** is a substance whose **smell** changes in an acid or a base. It is useful for someone who cannot see colours.",
          "**गंधीय सूचक।** *गंधीय* का अर्थ है गंध से जुड़ा। **गंधीय सूचक** ऐसा पदार्थ है जिसकी **गंध** अम्ल या क्षारक में बदल जाती है। यह उनके काम आता है जो रंग नहीं देख सकते।",
        ),
      ),
      w.body(
        t(
          "NCERT Activity 2.2: cloth strips kept overnight with chopped onion, dilute vanilla essence, and clove oil.",
          "NCERT क्रियाकलाप 2.2: रात भर कटे प्याज़ के साथ रखी कपड़े की पट्टियाँ, तनु वनीला एसेंस, और लौंग का तेल।",
        ),
      ),
      nose,
      goal,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** The curry stain, explained; and the first act of the show. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const stain = sceneOn(
      b,
      "stain",
      AcidSceneKind.CurryStain,
      "Kabir's white shirt with a yellow curry stain turning reddish brown where Mom scrubs it with soap",
    );
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "Why does the yellow curry stain turn reddish brown when Mom scrubs it with soap?",
        "मम्मी के साबुन से रगड़ने पर पीला करी का दाग़ लाल-भूरा क्यों हो जाता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "The turmeric in the curry is an indicator, and soap is a base",
            "करी की हल्दी एक सूचक है, और साबुन एक क्षारक",
          ),
        },
        {
          id: "dirt",
          label: t("Soap makes the stain dirtier", "साबुन दाग़ को और गंदा करता है"),
          feedback: t(
            "It's not dirt: rinse with plenty of water and it turns yellow again. A colour that changes and changes back is an indicator at work.",
            "यह गंदगी नहीं है: ख़ूब पानी से धोओ और यह फिर पीला हो जाता है। रंग जो बदले और वापस आए, वह सूचक का काम है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const why = w.body(
      t(
        "Turmeric is yellow, and turns reddish brown in a base. Soap is basic. Wash the soap away with plenty of water and the stain goes back to yellow. And the first act of the show is ready: a jug of **red cabbage juice** turns pink in lemon juice and green in soapy water.",
        "हल्दी पीली है, और क्षारक में लाल-भूरी हो जाती है। साबुन क्षारकीय है। ख़ूब पानी से साबुन धो दो, तो दाग़ फिर पीला हो जाता है। और शो का पहला करतब तैयार है: **लाल पत्तागोभी के रस** का जग नींबू के रस में गुलाबी और साबुन वाले पानी में हरा हो जाता है।",
      ),
      "why",
      { isHidden: true },
    );
    b.when(ask.on(QuestionSignal.Correct), [theBoard.show(why), theBoard.pass()]);
    return column([
      w.title(t("The curry stain", "करी का दाग़")),
      stain,
      w.body(
        t(
          "At lunch Kabir drops dal on his white party shirt. Mom scrubs the yellow stain with soap, and it turns **reddish brown**. Kabir panics.",
          "दोपहर के खाने में कबीर अपनी सफ़ेद पार्टी वाली क़मीज़ पर दाल गिरा देता है। मम्मी पीले दाग़ को साबुन से रगड़ती हैं, और वह **लाल-भूरा** हो जाता है। कबीर घबरा जाता है।",
        ),
      ),
      ask,
      why,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** NCERT in-text Q1: only red litmus, three test tubes. Then the mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const ask1 = choiceQuestion(b, {
      name: "ask1",
      prompt: t(
        "Three test tubes hold distilled water, an acid and a base. You have only red litmus paper. Dip it in each: one tube turns it blue. What next?",
        "तीन परखनलियों में आसुत जल, एक अम्ल और एक क्षारक है। तुम्हारे पास केवल लाल लिटमस पत्र है। हर एक में डुबाओ: एक परखनली उसे नीला कर देती है। आगे क्या?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "That tube is the base. Dip the blue paper in the other two: the one that turns it red is the acid; the last is water",
            "वह परखनली क्षारक है। नीले हुए पत्र को बाक़ी दो में डुबाओ: जो उसे लाल करे वह अम्ल है; बची हुई पानी है",
          ),
        },
        {
          id: "stuck",
          label: t("You can't tell the acid from the water", "अम्ल और पानी में फ़र्क़ नहीं कर सकते"),
          feedback: t(
            "You can: the paper that turned blue in the base is now blue litmus. An acid turns it back to red.",
            "कर सकते हो: क्षारक में नीला हुआ पत्र अब नीला लिटमस है। अम्ल उसे वापस लाल कर देता है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const ask2 = choiceQuestion(b, {
      name: "ask2",
      prompt: t(
        "A solution turns methyl orange red. What is it?",
        "एक विलयन मेथिल ऑरेंज को लाल कर देता है। वह क्या है?",
      ),
      options: [
        { id: "right", label: t("An acid", "अम्ल") },
        {
          id: "base",
          label: t("A base", "क्षारक"),
          feedback: t("In a base, methyl orange turns yellow.", "क्षारक में मेथिल ऑरेंज पीला हो जाता है।"),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ Acids turn blue litmus red; bases turn red litmus blue. ✓ Phenolphthalein: colourless in acid, pink in base. Methyl orange: red in acid, yellow in base. ✓ Turmeric and red cabbage are kitchen indicators; onion, vanilla and clove are smell indicators. ✓ Act 1, colour-changing potions: ready. Next: what acids do to metals.",
        "**मिशन लॉग।** ✓ अम्ल नीले लिटमस को लाल करते हैं; क्षारक लाल लिटमस को नीला। ✓ फ़िनॉल्फ़्थेलिन: अम्ल में रंगहीन, क्षारक में गुलाबी। मेथिल ऑरेंज: अम्ल में लाल, क्षारक में पीला। ✓ हल्दी और लाल पत्तागोभी रसोई के सूचक हैं; प्याज़, वनीला और लौंग गंध वाले सूचक। ✓ करतब 1, रंग बदलते घोल: तैयार। आगे: अम्ल धातुओं के साथ क्या करते हैं।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(ask1.on(QuestionSignal.Correct), theBoard.show(ask2));
    b.when(ask2.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), ask1, ask2, log, space()]);
  },
  { passOn: PassOn.Rules },
);

void r;

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [hook, why, recap, litmus, synthetic, natural, smell, inLife, yourTurn];

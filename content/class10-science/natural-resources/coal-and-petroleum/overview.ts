import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { goalQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  Air,
  CHOICES,
  CHOICE_OPTIONS,
  FossilAction,
  FossilDerived,
  FossilMode,
  ResScene,
  fossilClockDef,
} from "@chalk/prop-resources";
import { ask, sceneOn } from "../kit";

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** The queue of scooters to a market 2 km away. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const queue = sceneOn(
    b,
    "queue",
    ResScene.ScooterQueue,
    "a queue of scooters at the village petrol pump, with the market visible two kilometres down the road",
  );
  return column([
    w.title(t("The scooter queue", "स्कूटरों की क़तार")),
    queue,
    w.body(
      t(
        "On market day there's a queue at the petrol pump. Half the village rides a scooter to a market two kilometres away, some to buy one packet of tea. Grandpa, who used to walk it with a cloth bag, shakes his head. Kabir does a sum on the audit sheet and gets stuck on a question: **how long will all this petrol last?**",
        "बाज़ार के दिन पेट्रोल पंप पर क़तार लगी है। आधा गाँव दो किलोमीटर दूर बाज़ार स्कूटर से जाता है, कुछ लोग बस चाय का एक पैकेट लेने। दादाजी, जो कपड़े का थैला लेकर पैदल जाया करते थे, सिर हिलाते हैं। कबीर ऑडिट शीट पर हिसाब लगाता है और एक सवाल पर अटक जाता है: **यह सारा पेट्रोल कब तक चलेगा?**",
      ),
    ),
    w.body(
      t(
        "Stop 7, the last: a resource that runs out however carefully we use it.",
        "पड़ाव 7, आख़िरी: एक संसाधन जो कितनी भी सावधानी से इस्तेमाल करें, ख़त्म होगा ही।",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Formed from biomass, so they will run out: how long? */
const last = page(
  "last",
  (b) => {
    const w = wordsOn(b);
    const clock = b.prop(fossilClockDef, "clock", {
      mode: FossilMode.Last,
      cut: 0,
      canSetCut: true,
      canSetAir: false,
      canPick: false,
    });
    b.studentOnly(clock.action(FossilAction.SetCut));
    b.standsFor(
      clock,
      "two bars: how many years petroleum (about 40) and coal (about 200) last at the present rate, with a slider for using less",
    );
    const goal = goalQuestion(b, {
      about: clock,
      prompt: t(
        "How much less would we have to use for petroleum to last about 80 years?",
        "पेट्रोलियम लगभग 80 साल चले, इसके लिए हमें कितना कम इस्तेमाल करना होगा?",
      ),
      isMet: clock.derived(FossilDerived.PetroleumYears).ge(80),
      solve: [clock.learner(FossilAction.SetCut, { cut: 50 })],
    });
    return column([
      w.title(t("Fuel that runs out", "ख़त्म होने वाला ईंधन")),
      w.body(
        t(
          "Forests, wildlife and water can meet our needs for ever if we use them sustainably. **Coal and petroleum** are different. They were formed from the breakdown of biomass over millions of years, and we are using them far faster than that, so they **will run out** some day, however carefully we use them, and we will need other sources of energy.",
          "वन, वन्यजीव और पानी, अगर संपोषित ढंग से इस्तेमाल हों, तो हमेशा हमारी ज़रूरतें पूरी कर सकते हैं। **कोयला और पेट्रोलियम** अलग हैं। वे लाखों सालों में जैव-भार के अपघटन से बने, और हम उन्हें उससे कहीं तेज़ी से इस्तेमाल कर रहे हैं, इसलिए वे किसी दिन **ख़त्म होंगे ही**, कितनी भी सावधानी से इस्तेमाल करें, और हमें ऊर्जा के दूसरे स्रोत चाहिए होंगे।",
        ),
      ),
      w.body(
        t(
          "At the present rate of use, our known **petroleum** is estimated to last about **forty years**, and **coal** about **two hundred years**. Using less stretches them: slide below.",
          "उपयोग की मौजूदा दर पर हमारा ज्ञात **पेट्रोलियम** लगभग **चालीस साल** और **कोयला** लगभग **दो सौ साल** चलने का अनुमान है। कम इस्तेमाल करने से वे लंबा चलते हैं: नीचे खिसकाओ।",
        ),
      ),
      clock,
      goal,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** What burning them gives. */
const burn = page(
  "burn",
  (b) => {
    const w = wordsOn(b);
    const flame = b.prop(fossilClockDef, "flame", {
      mode: FossilMode.Burn,
      air: Air.Enough,
      canSetCut: false,
      canSetAir: true,
      canPick: false,
    });
    b.studentOnly(flame.action(FossilAction.SetAir));
    b.standsFor(
      flame,
      "coal or petroleum burning: carbon, hydrogen, nitrogen and sulphur in; the products out; a switch for enough or too little air",
    );
    const goal = goalQuestion(b, {
      about: flame,
      prompt: t(
        "Burn the fuel in too little air, and see what changes.",
        "ईंधन को कम हवा में जलाओ, और देखो क्या बदलता है।",
      ),
      isMet: flame.field("air").eq(Air.Little),
      solve: [flame.learner(FossilAction.SetAir, { air: Air.Little })],
    });
    const q = ask(b, {
      name: "co",
      prompt: t(
        "With too little air, what forms instead of carbon dioxide?",
        "कम हवा में कार्बन डाइऑक्साइड की जगह क्या बनता है?",
      ),
      right: t("Carbon monoxide", "कार्बन मोनोऑक्साइड"),
      wrong: [
        [
          t("Sulphur dioxide", "सल्फ़र डाइऑक्साइड"),
          t(
            "Oxides of sulphur form either way, from the sulphur. Too little air turns CO₂ into CO.",
            "सल्फ़र के ऑक्साइड दोनों तरह बनते हैं, सल्फ़र से। कम हवा में CO₂ की जगह CO बनती है।",
          ),
        ],
        [
          t("Pure hydrogen gas", "शुद्ध हाइड्रोजन गैस"),
          t(
            "The hydrogen still burns to water. It is carbon monoxide that forms instead of carbon dioxide.",
            "हाइड्रोजन तब भी जलकर पानी बनता है। कार्बन डाइऑक्साइड की जगह कार्बन मोनोऑक्साइड बनती है।",
          ),
        ],
      ],
      isHidden: true,
    });
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(q));
    return column([
      w.title(t("What burning gives", "जलाने से क्या मिलता है")),
      w.body(
        t(
          "Coal and petroleum come from biomass, so besides **carbon** they contain **hydrogen, nitrogen and sulphur**. Burnt, they give **carbon dioxide, water, oxides of nitrogen and oxides of sulphur**. In too little air (oxygen), **carbon monoxide** forms instead of carbon dioxide.",
          "कोयला और पेट्रोलियम जैव-भार से बने हैं, इसलिए **कार्बन** के अलावा इनमें **हाइड्रोजन, नाइट्रोजन और सल्फ़र** भी होते हैं। जलने पर ये **कार्बन डाइऑक्साइड, पानी, नाइट्रोजन के ऑक्साइड और सल्फ़र के ऑक्साइड** देते हैं। कम हवा (ऑक्सीजन) में कार्बन डाइऑक्साइड की जगह **कार्बन मोनोऑक्साइड** बनती है।",
        ),
      ),
      flame,
      goal,
      q,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Poisons and global warming. */
const warming = page(
  "warming",
  (b) => {
    const w = wordsOn(b);
    const q = ask(b, {
      name: "greenhouse",
      prompt: t(
        "Which product of burning is the greenhouse gas that NCERT warns about?",
        "जलने से बनने वाली कौन-सी गैस वह ग्रीनहाउस गैस है जिसकी NCERT चेतावनी देता है?",
      ),
      right: t("Carbon dioxide", "कार्बन डाइऑक्साइड"),
      wrong: [
        [
          t("Hydrogen gas", "हाइड्रोजन गैस"),
          t(
            "Hydrogen burns to water; it isn't among the products NCERT warns about. Carbon dioxide is the greenhouse gas.",
            "हाइड्रोजन जलकर पानी बनती है; यह उन उत्पादों में नहीं जिनकी NCERT चेतावनी देता है। ग्रीनहाउस गैस कार्बन डाइऑक्साइड है।",
          ),
        ],
        [
          t("Oxides of sulphur", "सल्फ़र के ऑक्साइड"),
          t(
            "Oxides of sulphur are poisonous at high levels. The greenhouse gas NCERT names is carbon dioxide.",
            "सल्फ़र के ऑक्साइड ज़्यादा मात्रा में ज़हरीले हैं। NCERT जिस ग्रीनहाउस गैस का नाम लेता है, वह कार्बन डाइऑक्साइड है।",
          ),
        ],
      ],
    });
    return column([
      w.title(t("Poisons and a warmer planet", "ज़हर और गर्म होती धरती")),
      w.body(
        t(
          "Of these products, **carbon monoxide** and the **oxides of sulphur and nitrogen** are poisonous at high concentrations, and **carbon dioxide** is a **greenhouse gas**.",
          "इन उत्पादों में **कार्बन मोनोऑक्साइड** और **सल्फ़र और नाइट्रोजन के ऑक्साइड** ज़्यादा मात्रा में ज़हरीले हैं, और **कार्बन डाइऑक्साइड** एक **ग्रीनहाउस गैस** है।",
        ),
      ),
      w.definition(
        t(
          "**Global warming.** Coal and petroleum are huge stores of carbon. If all of it were turned into carbon dioxide, the carbon dioxide in the atmosphere would rise, causing **intense global warming**: the earth getting hotter. So these resources must be used **judiciously**, with care.",
          "**वैश्विक ऊष्मण।** कोयला और पेट्रोलियम कार्बन के विशाल भंडार हैं। अगर यह सारा कार्बन डाइऑक्साइड में बदल जाए, तो वायुमंडल में कार्बन डाइऑक्साइड बढ़ेगी, जिससे **तीव्र वैश्विक ऊष्मण** होगा: धरती का और गर्म होना। इसलिए इन संसाधनों को **विवेक से**, सावधानी से, इस्तेमाल करना चाहिए।",
        ),
      ),
      q,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Everyday choices (Activity 16.11). */
const choices = page(
  "choices",
  (b) => {
    const w = wordsOn(b);
    const board = b.prop(fossilClockDef, "everyday", {
      mode: FossilMode.Choices,
      picks: [],
      choices: [...CHOICES],
      canSetCut: false,
      canSetAir: false,
      canPick: true,
    });
    b.studentOnly(board.action(FossilAction.Pick));
    b.studentOnly(board.action(FossilAction.Reset));
    b.standsFor(
      board,
      "NCERT's four everyday choices: bus, own vehicle or walk/cycle; LED or tube light; lift or stairs; sweater or heater",
    );
    const goal = goalQuestion(b, {
      about: board,
      prompt: t(
        "For each of the four choices, pick the one that uses the least coal and petroleum.",
        "चारों विकल्पों में हर एक के लिए वह चुनो जिसमें सबसे कम कोयला और पेट्रोलियम लगे।",
      ),
      isMet: board.derived(FossilDerived.Saved).eq(4),
      solve: CHOICES.map((c) =>
        board.learner(FossilAction.Pick, { choice: c, option: CHOICE_OPTIONS[c].best }),
      ),
    });
    return column([
      w.title(t("Small choices add up", "छोटे फ़ैसले जुड़ते हैं")),
      w.body(
        t(
          "Coal runs thermal power stations; petrol and diesel run motor vehicles, ships and aeroplanes. We can't imagine life without electricity and transport, but simple choices change how much we use. NCERT asks us to weigh four of them.",
          "कोयले से ताप बिजलीघर चलते हैं; पेट्रोल और डीज़ल से मोटर वाहन, जहाज़ और हवाई जहाज़। हम बिजली और परिवहन के बिना जीवन की कल्पना नहीं कर सकते, पर सरल फ़ैसले बदल देते हैं कि हम कितना इस्तेमाल करते हैं। NCERT हमसे इनमें से चार पर सोचने को कहता है।",
        ),
      ),
      board,
      goal,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Efficient engines and emission norms; the overview (16.5). */
const engines = page(
  "engines",
  (b) => {
    const w = wordsOn(b);
    const q = ask(b, {
      name: "complete",
      prompt: t(
        "Engine research aims at complete combustion. Why?",
        "इंजनों पर शोध पूर्ण दहन का लक्ष्य रखता है। क्यों?",
      ),
      right: t(
        "More energy from the fuel, and less air pollution",
        "ईंधन से ज़्यादा ऊर्जा, और कम वायु प्रदूषण",
      ),
      wrong: [
        [
          t(
            "So the engine can burn more fuel every single hour",
            "ताकि इंजन हर एक घंटे में ज़्यादा ईंधन जला सके",
          ),
          t(
            "The aim is the opposite: more efficiency, so less fuel and less pollution.",
            "लक्ष्य उल्टा है: ज़्यादा दक्षता, यानी कम ईंधन और कम प्रदूषण।",
          ),
        ],
        [
          t(
            "So the exhaust gives out more carbon monoxide",
            "ताकि धुएँ से ज़्यादा कार्बन मोनोऑक्साइड निकले",
          ),
          t(
            "Carbon monoxide comes from incomplete burning. Complete combustion reduces it.",
            "कार्बन मोनोऑक्साइड अधूरे दहन से बनती है। पूर्ण दहन इसे घटाता है।",
          ),
        ],
      ],
    });
    return column([
      w.title(t("Better engines, and the big picture", "बेहतर इंजन, और पूरी तस्वीर")),
      w.body(
        t(
          "Managing coal and petroleum also means making our machines **efficient**. Fuel is mostly burnt in internal combustion engines for transport, and research aims at **complete combustion** in them, to get more out of the fuel and reduce air pollution. The **Euro norms** for vehicle emissions (Activity 16.12) set limits on what an engine may give out.",
          "कोयला और पेट्रोलियम के प्रबंधन का अर्थ अपनी मशीनों को **दक्ष** बनाना भी है। ईंधन ज़्यादातर परिवहन के अंतर्दहन इंजनों में जलता है, और शोध उनमें **पूर्ण दहन** का लक्ष्य रखता है, ताकि ईंधन से ज़्यादा मिले और वायु प्रदूषण घटे। वाहनों के उत्सर्जन के **यूरो मानक** (क्रियाकलाप 16.12) तय करते हैं कि इंजन कितना छोड़ सकता है।",
        ),
      ),
      w.definition(
        t(
          "**The big picture (16.5).** Sustainable management is difficult. We must keep an open mind about every stakeholder's interests, and accept that people put their own interests first. But going beyond laws and rules, we need to shape our needs, as individuals and together, so the benefits of development reach **everyone, now and for all generations to come**.",
          "**पूरी तस्वीर (16.5)।** संपोषित प्रबंधन कठिन है। हमें हर दावेदार के हितों के प्रति खुला मन रखना होगा, और मानना होगा कि लोग अपने हित पहले रखते हैं। पर क़ानूनों और नियमों से आगे बढ़कर, हमें अपनी ज़रूरतों को, अकेले और मिलकर, ऐसे ढालना होगा कि विकास के लाभ **सबको, अभी और आने वाली सभी पीढ़ियों को** मिलें।",
        ),
      ),
      q,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** The scooter queue, explained. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const q = ask(b, {
      name: "market",
      prompt: t(
        "For a 2 km trip to buy tea, which choice saves the most petrol?",
        "चाय लेने के लिए 2 km की यात्रा में कौन-सा विकल्प सबसे ज़्यादा पेट्रोल बचाता है?",
      ),
      right: t("Walking or cycling with a cloth bag", "कपड़े का थैला लेकर पैदल या साइकिल से"),
      wrong: [
        [
          t("Riding a scooter, but filling it up less often", "स्कूटर से जाना, पर कम बार टंकी भराना"),
          t(
            "Filling up less often doesn't save fuel if you still ride. Walking or cycling uses none.",
            "कम बार टंकी भराने से ईंधन नहीं बचता अगर स्कूटर चलाते रहो। पैदल या साइकिल में कुछ नहीं लगता।",
          ),
        ],
        [
          t(
            "Going in a car, since it can carry more at once",
            "कार से जाना, क्योंकि वह एक साथ ज़्यादा ले जा सकती है",
          ),
          t(
            "For one packet of tea a car burns far more petrol. Walking or cycling burns none.",
            "चाय के एक पैकेट के लिए कार कहीं ज़्यादा पेट्रोल जलाती है। पैदल या साइकिल में कुछ नहीं।",
          ),
        ],
      ],
    });
    const row = w.body(
      t(
        "**Audit sheet, row 6: fuel.** What's wrong: short trips by scooter burn petrol that will run out and puts carbon dioxide and poisonous gases into the air. What would fix it: walk or cycle to the market on most days, share rides for the heavy loads, LEDs in every house, and a sweater before a heater. The audit sheet is full.",
        "**ऑडिट शीट, पंक्ति 6: ईंधन।** क्या गड़बड़ है: स्कूटर की छोटी यात्राएँ वह पेट्रोल जलाती हैं जो ख़त्म होगा, और हवा में कार्बन डाइऑक्साइड और ज़हरीली गैसें छोड़ती हैं। क्या ठीक करेगा: ज़्यादातर दिन बाज़ार पैदल या साइकिल से, भारी सामान के लिए मिलकर एक वाहन, हर घर में LED, और हीटर से पहले स्वेटर। ऑडिट शीट भर गई।",
      ),
      "row",
      { isHidden: true },
    );
    b.when(q.on(QuestionSignal.Correct), theBoard.show(row));
    return column([w.title(t("Two kilometres", "दो किलोमीटर")), q, row, space()]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Exercises 4 and 7. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const four = ask(b, {
      name: "contribute",
      prompt: t(
        "Exercise 4(c): how can you, as one person, help manage coal and petroleum?",
        "अभ्यास 4(c): तुम एक व्यक्ति के रूप में कोयला और पेट्रोलियम के प्रबंधन में कैसे मदद कर सकते हो?",
      ),
      right: t(
        "Switch off lights you aren't using and walk short trips",
        "बेकार की बत्तियाँ बंद करना और छोटी दूरी पैदल चलना",
      ),
      wrong: [
        [
          t(
            "Buy a bigger vehicle so that far fewer trips are ever needed",
            "बड़ा वाहन ख़रीदना ताकि कभी बहुत कम चक्कर लगाने पड़ें",
          ),
          t(
            "A bigger vehicle burns more fuel on every trip. Using less is what helps.",
            "बड़ा वाहन हर चक्कर में ज़्यादा ईंधन जलाता है। कम इस्तेमाल ही मदद करता है।",
          ),
        ],
        [
          t(
            "Nothing: only governments can change fuel use",
            "कुछ नहीं: केवल सरकारें ईंधन का उपयोग बदल सकती हैं",
          ),
          t(
            "NCERT says each of us can make a difference with simple everyday choices.",
            "NCERT कहता है कि हम में से हर कोई रोज़ के सरल फ़ैसलों से फ़र्क़ ला सकता है।",
          ),
        ],
      ],
      passes: false,
    });
    const seven = ask(b, {
      name: "lifestyle",
      prompt: t(
        "Exercise 7: which change moves a lifestyle towards sustainable use?",
        "अभ्यास 7: कौन-सा बदलाव जीवनशैली को संपोषित उपयोग की ओर ले जाता है?",
      ),
      right: t(
        "Mending and reusing things before buying new ones",
        "नई चीज़ ख़रीदने से पहले पुरानी की मरम्मत और दोबारा इस्तेमाल",
      ),
      wrong: [
        [
          t(
            "Replacing phones every year to have the latest one",
            "सबसे नया पाने के लिए हर साल फ़ोन बदलना",
          ),
          t(
            "That uses more resources and makes more waste. Mending and reusing uses less.",
            "इससे ज़्यादा संसाधन लगते हैं और ज़्यादा कचरा बनता है। मरम्मत और दोबारा इस्तेमाल में कम लगता है।",
          ),
        ],
        [
          t(
            "Using disposable plates to save washing water",
            "धोने का पानी बचाने के लिए डिस्पोज़ेबल प्लेटें इस्तेमाल करना",
          ),
          t(
            "Disposables use up material and add to garbage. The five R's start with refusing them.",
            "डिस्पोज़ेबल चीज़ें पदार्थ ख़र्च करती हैं और कचरा बढ़ाती हैं। पाँच R इन्हें मना करने से शुरू होते हैं।",
          ),
        ],
      ],
      isHidden: true,
      passes: false,
    });
    const log = w.definition(
      t(
        "**Audit log, stop 7.** ✓ Coal and petroleum will run out: petroleum in about 40 years, coal in about 200, at today's rate. ✓ Burning them gives poisonous gases and carbon dioxide, a greenhouse gas. ✓ Every row of the audit sheet is filled. Next: the gram sabha.",
        "**ऑडिट लॉग, पड़ाव 7।** ✓ कोयला और पेट्रोलियम ख़त्म होंगे: आज की दर पर पेट्रोलियम लगभग 40 साल में, कोयला लगभग 200 में। ✓ इन्हें जलाने से ज़हरीली गैसें और कार्बन डाइऑक्साइड, एक ग्रीनहाउस गैस, बनती हैं। ✓ ऑडिट शीट की हर पंक्ति भर गई। आगे: ग्राम सभा।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(four.on(QuestionSignal.Correct), theBoard.show(seven));
    b.when(seven.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), four, seven, log, space()]);
  },
  { passOn: PassOn.Rules },
);

/** The gram sabha: the audit presented, and the close of the science book. */
const finale = page(
  "finale",
  (b) => {
    const w = wordsOn(b);
    const sabha = sceneOn(
      b,
      "sabha",
      ResScene.GramSabha,
      "the gram sabha under a big tree: villagers sitting on mats, Riya and Kabir holding up the audit sheet",
    );
    const q = ask(b, {
      name: "close",
      prompt: t(
        "Which idea runs through every row of the village's audit?",
        "गाँव के ऑडिट की हर पंक्ति में कौन-सा विचार है?",
      ),
      right: t("Use it so it lasts, and share it fairly", "ऐसे इस्तेमाल करो कि टिके, और न्यायसंगत बाँटो"),
      wrong: [
        [
          t("Let the government handle every resource", "हर संसाधन सरकार पर छोड़ दो"),
          t(
            "Every fix in the audit worked by bringing local people in, not by leaving it to others.",
            "ऑडिट का हर सुधार स्थानीय लोगों को साथ लेकर चला, दूसरों पर छोड़कर नहीं।",
          ),
        ],
        [
          t("Use as much as we can while it's still there", "जब तक है, जितना हो सके इस्तेमाल कर लो"),
          t(
            "That's the short-term view the whole chapter warns against.",
            "यही वह अल्पकालिक दृष्टि है जिससे पूरा अध्याय सावधान करता है।",
          ),
        ],
      ],
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission complete.** (1) The river: treat sewage before it reaches the river, and the five R's at home. (2) Our habits: resources aren't unlimited; take a long view and share fairly. (3) The grove: four stakeholders, and the people who live from it must have a say. (4) A grove committee, Chipko's lesson and Arabari's deal. (5) The canal: turns the kulh way, tail end first. (6) The well: a check dam to recharge the ground. (7) Fuel: walk, cycle, LEDs and sweaters; coal and petroleum will run out.",
        "**मिशन पूरा।** (1) नदी: मल-जल का नदी तक पहुँचने से पहले उपचार, और घर में पाँच R। (2) हमारी आदतें: संसाधन असीमित नहीं; दीर्घकालिक दृष्टि रखो और न्यायसंगत बाँटो। (3) उपवन: चार दावेदार, और जो इससे जीते हैं उनकी आवाज़ होनी चाहिए। (4) उपवन समिति, चिपको की सीख और अराबाड़ी का समझौता। (5) नहर: कुल्ह की तरह बारी, आख़िरी छोर पहले। (6) कुआँ: ज़मीन भरने के लिए रोक बाँध। (7) ईंधन: पैदल, साइकिल, LED और स्वेटर; कोयला और पेट्रोलियम ख़त्म होंगे।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(q.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([
      w.title(t("The gram sabha", "ग्राम सभा")),
      sabha,
      w.body(
        t(
          "On the last Sunday of the summer, the whole village sits on mats under the big tree. Riya reads the audit sheet, row by row. Ramesh Kaka stands up for turns on the canal. Kamla Didi agrees to lead the grove committee. The sarpanch promises the check dam before the next monsoon, with the villagers' own labour. And Grandpa's family? Cloth bags, LEDs, and a cycle to the market.",
          "गर्मियों के आख़िरी रविवार को पूरा गाँव बड़े पेड़ के नीचे दरियों पर बैठता है। रिया ऑडिट शीट पंक्ति-दर-पंक्ति पढ़ती है। रमेश काका नहर पर बारी के समर्थन में खड़े होते हैं। कमला दीदी उपवन समिति की अगुवाई के लिए मान जाती हैं। सरपंच अगले मानसून से पहले, गाँव वालों की अपनी मेहनत से, रोक बाँध का वादा करते हैं। और दादाजी का परिवार? कपड़े के थैले, LED, और बाज़ार के लिए साइकिल।",
        ),
      ),
      w.body(
        t(
          'On the way home Kabir counts up the year on his fingers. Diwali\'s chemistry. The phone projector on the wall. Grandpa\'s peas. The 1500 m. The bill cut in half, and the crank torch. The Green Fair\'s soap and the card wall. The sealed pond jar. And now a whole village. "It\'s all the same thing, isn\'t it?" he says. "One earth." Grandpa smiles: **"One family."**',
          'घर लौटते हुए कबीर उँगलियों पर पूरा साल गिनता है। दिवाली का रसायन। दीवार पर फ़ोन का प्रोजेक्टर। दादाजी की मटर। 1500 मीटर की दौड़। आधा हुआ बिजली का बिल, और हाथ से घुमाने वाली टॉर्च। ग्रीन फ़ेयर का साबुन और कार्डों की दीवार। तालाब वाला बंद जार। और अब पूरा एक गाँव। "सब एक ही बात है, है ना?" वह कहता है। "एक धरती।" दादाजी मुस्कुराते हैं: **"एक परिवार।"**',
        ),
      ),
      q,
      log,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice, finale. */
export const overview = [hook, last, burn, warming, choices, engines, inLife, yourTurn, finale];

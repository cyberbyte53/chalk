import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, goalQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  EnergyScene,
  RIGHT_BIN,
  SortBy,
  SorterAction,
  SorterDerived,
  Source,
  energySorterDef,
} from "@chalk/prop-energy";
import { sceneOn } from "../kit";

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** The night before the panchayat meeting. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const pic = sceneOn(
    b,
    "pic",
    EnergyScene.Panchayat,
    "the village panchayat gathered under a big tree; the sarpanch sits in front and villagers sit on mats",
  );
  return column([
    w.title(t("The last day", "आख़िरी दिन")),
    pic,
    w.body(
      t(
        "Tomorrow is the panchayat meeting. Riya's notebook is full: biogas, charcoal, solar panels, a solar cooker; no dam, no coal plant, no nuclear. But Shanti Aunty's son asks a sharp question: \"Is any of this really clean? And will it last, or will we be back where we started in twenty years?\" Before the meeting, Riya needs answers to both.",
        'कल पंचायत की बैठक है। रिया की कॉपी भरी है: बायोगैस, काठ-कोयला, सौर पैनल, सौर कुकर; कोई बाँध नहीं, कोई कोयला संयंत्र नहीं, कोई नाभिकीय नहीं। पर शांति आंटी का बेटा एक तीखा सवाल पूछता है: "क्या इनमें से कुछ सच में साफ़ है? और क्या यह चलेगा, या बीस साल में हम फिर वहीं होंगे?" बैठक से पहले रिया को दोनों के उत्तर चाहिए।',
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Every source disturbs the environment: "cleaner", not "clean". */
const cleaner = page(
  "cleaner",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      prompt: t(
        "Can any source of energy be completely pollution-free?",
        "क्या कोई ऊर्जा स्रोत पूरी तरह प्रदूषण-मुक्त हो सकता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "No: even making the device harms the environment somewhere",
            "नहीं: युक्ति बनाने में भी कहीं न कहीं पर्यावरण को हानि होती है",
          ),
        },
        {
          id: "solar",
          label: t(
            "Yes: solar cells are pollution-free from start to finish",
            "हाँ: सौर सेल शुरू से अंत तक प्रदूषण-मुक्त हैं",
          ),
          feedback: t(
            "Running a solar cell is pollution-free, but making it causes some environmental damage.",
            "सौर सेल चलाना प्रदूषण-मुक्त है, पर उसे बनाने में कुछ पर्यावरणीय हानि होती है।",
          ),
        },
        {
          id: "renew",
          label: t(
            "Yes: every renewable source is pollution-free by definition",
            "हाँ: हर नवीकरणीय स्रोत परिभाषा से प्रदूषण-मुक्त है",
          ),
          feedback: t(
            "Renewable is about lasting, not about being clean. Dams, for example, drown land and give off methane.",
            "नवीकरणीय का संबंध टिकने से है, साफ़ होने से नहीं। जैसे बाँध ज़मीन डुबोते हैं और मीथेन छोड़ते हैं।",
          ),
        },
      ],
      answer: "right",
    });
    const h2 = choiceQuestion(b, {
      name: "hydrogen",
      prompt: t(
        "Hydrogen is used as a rocket fuel. Is it a cleaner fuel than CNG?",
        "हाइड्रोजन रॉकेट ईंधन के रूप में उपयोग होती है। क्या यह सीएनजी से ज़्यादा स्वच्छ ईंधन है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Yes: burning hydrogen gives only water, with no CO₂",
            "हाँ: हाइड्रोजन जलने से केवल पानी बनता है, CO₂ नहीं",
          ),
        },
        {
          id: "no",
          label: t(
            "No: burning hydrogen gives more CO₂ than burning CNG",
            "नहीं: हाइड्रोजन जलने से सीएनजी से ज़्यादा CO₂ बनती है",
          ),
          feedback: t(
            "Hydrogen has no carbon, so it can't make CO₂. It burns to water.",
            "हाइड्रोजन में कार्बन नहीं, इसलिए वह CO₂ नहीं बना सकती। वह जलकर पानी बनती है।",
          ),
        },
        {
          id: "same",
          label: t(
            "Neither: both burn to give exactly the same products",
            "कोई नहीं: दोनों जलकर ठीक वही उत्पाद देते हैं",
          ),
          feedback: t(
            "CNG (mostly methane) gives CO₂ and water; hydrogen gives only water.",
            "सीएनजी (ज़्यादातर मीथेन) CO₂ और पानी देती है; हाइड्रोजन केवल पानी।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
    });
    b.when(ask.on(QuestionSignal.Correct), theBoard.show(h2));
    return column([
      w.title(t("Cleaner, not clean", "ज़्यादा साफ़, पूरी तरह साफ़ नहीं")),
      w.definition(
        t(
          '**Environmental consequences.** Using **any** source of energy **disturbs the environment** in some way. Which source we choose depends on **how easy and cheap it is to get the energy**, **how efficient the technology** is, and **how much environmental damage** it causes. We speak of "clean" fuels like CNG, but it is more exact to say one source is **cleaner** than another.',
          '**पर्यावरणीय परिणाम।** **किसी भी** ऊर्जा स्रोत का उपयोग किसी न किसी तरह **पर्यावरण को बिगाड़ता** है। हम कौन-सा स्रोत चुनते हैं यह इस पर निर्भर है कि **ऊर्जा पाना कितना आसान और सस्ता है**, **तकनीक कितनी दक्ष** है, और वह **कितनी पर्यावरणीय हानि** करता है। हम सीएनजी जैसे "स्वच्छ" ईंधनों की बात करते हैं, पर अधिक सही यह कहना है कि एक स्रोत दूसरे से **ज़्यादा स्वच्छ** है।',
        ),
      ),
      w.body(
        t(
          "A solar cell runs without pollution, but making it caused some environmental damage. Research goes on to make longer-lasting devices that do less harm over their whole life.",
          "सौर सेल बिना प्रदूषण के चलता है, पर उसे बनाने में कुछ पर्यावरणीय हानि हुई। ऐसी लंबी चलने वाली युक्तियाँ बनाने का शोध जारी है जो अपने पूरे जीवन में कम हानि करें।",
        ),
      ),
      ask,
      h2,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Exhaustible vs renewable (14.5); sort the sources. */
const howLong = page(
  "how-long",
  (b) => {
    const w = wordsOn(b);
    const sources = [
      Source.Coal,
      Source.Wind,
      Source.Petroleum,
      Source.Solar,
      Source.Biogas,
      Source.Nuclear,
      Source.Hydro,
      Source.NaturalGas,
    ];
    const sorter = b.prop(energySorterDef, "sorter", {
      by: SortBy.Renewable,
      sources,
      showMarks: true,
      canSort: true,
    });
    b.studentOnly(sorter.action(SorterAction.Select));
    b.studentOnly(sorter.action(SorterAction.Place));
    b.studentOnly(sorter.action(SorterAction.Clear));
    b.standsFor(
      sorter,
      "a tray of eight energy sources and two bins, renewable and non-renewable; the learner picks up each source and drops it in a bin",
    );
    const goal = goalQuestion(b, {
      about: sorter,
      prompt: t(
        "Sort every source into renewable or non-renewable.",
        "हर स्रोत को नवीकरणीय या अनवीकरणीय में छाँटो।",
      ),
      isMet: sorter.derived(SorterDerived.IsAllRight),
      solve: sources.flatMap((source) => [
        sorter.learner(SorterAction.Select, { source }),
        sorter.learner(SorterAction.Place, { bin: RIGHT_BIN.renewable[source] }),
      ]),
    });
    const worry = w.body(
      t(
        "So, should we worry? 200 years is only a few lifetimes: coal could run out while your great-great-grandchildren are alive. 5 billion years is so long that the Sun counts as a source that will never run out.",
        "तो, क्या चिंता करें? 200 वर्ष बस कुछ ही जीवनकाल हैं: कोयला तुम्हारे परपोतों के बच्चों के जीते-जी ख़त्म हो सकता है। 5 अरब वर्ष इतना लंबा है कि सूर्य को कभी ख़त्म न होने वाला स्रोत माना जाता है।",
      ),
      "worry",
      { isHidden: true },
    );
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(worry));
    return column([
      w.title(t("How long will it last?", "यह कब तक चलेगा?")),
      w.definition(
        t(
          "**Exhaustible and renewable.** Sources that **will be used up some day**, like the fossil fuels, are **exhaustible** or **non-renewable** sources. Sources that **can be regenerated**, like biomass if we replace the trees we cut, are **renewable** sources. Renewable energy is available in nature as **continuing or repeating flows of energy** (sunlight, wind, flowing water), or is stored in such **huge reservoirs** that taking energy out hardly makes a difference.",
          "**समाप्य और नवीकरणीय।** जो स्रोत **किसी दिन ख़त्म हो जाएँगे**, जैसे जीवाश्म ईंधन, वे **समाप्य** या **अनवीकरणीय** स्रोत हैं। जो स्रोत **फिर से बन सकते हैं**, जैसे जैव मात्रा अगर हम काटे गए पेड़ों की जगह नए लगाएँ, वे **नवीकरणीय** स्रोत हैं। नवीकरणीय ऊर्जा प्रकृति में **लगातार या बार-बार आने वाले ऊर्जा प्रवाहों** (धूप, पवन, बहता पानी) के रूप में मिलती है, या ऐसे **विशाल भंडारों** में होती है कि ऊर्जा निकालने से लगभग कोई फ़र्क़ नहीं पड़ता।",
        ),
      ),
      w.body(
        t(
          "Activity 14.9 asks: coal reserves may last another **200 years**; the Sun another **5 billion years**. Should we worry about either running out?",
          "क्रियाकलाप 14.9 पूछता है: कोयले के भंडार शायद **200 वर्ष** और चलें; सूर्य **5 अरब वर्ष** और। क्या हमें किसी के ख़त्म होने की चिंता करनी चाहिए?",
        ),
      ),
      sorter,
      goal,
      worry,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Most sources are stored solar energy (Activity 14.7). */
const fromSun = page(
  "from-sun",
  (b) => {
    const w = wordsOn(b);
    const sources = [
      Source.Wood,
      Source.Wind,
      Source.Hydro,
      Source.OceanThermal,
      Source.Geothermal,
      Source.Nuclear,
    ];
    const sorter = b.prop(energySorterDef, "sorter", {
      by: SortBy.Sun,
      sources,
      showMarks: true,
      canSort: true,
    });
    b.studentOnly(sorter.action(SorterAction.Select));
    b.studentOnly(sorter.action(SorterAction.Place));
    b.studentOnly(sorter.action(SorterAction.Clear));
    b.standsFor(
      sorter,
      "a tray of six sources and two bins, energy from the Sun and not from the Sun",
    );
    const goal = goalQuestion(b, {
      about: sorter,
      prompt: t(
        "Sort each source: does its energy come from the Sun or not?",
        "हर स्रोत छाँटो: उसकी ऊर्जा सूर्य से आती है या नहीं?",
      ),
      isMet: sorter.derived(SorterDerived.IsAllRight),
      solve: sources.flatMap((source) => [
        sorter.learner(SorterAction.Select, { source }),
        sorter.learner(SorterAction.Place, { bin: RIGHT_BIN.sun[source] }),
      ]),
    });
    const found = w.body(
      t(
        "Biomass grew by photosynthesis, wind comes from the Sun's unequal heating, rain refills the dams, and the Sun warms the sea's surface: all **stored solar energy**. **Geothermal and nuclear energy are different**: they come from inside the earth and inside atoms, not from the Sun.",
        "जैव मात्रा प्रकाश संश्लेषण से उगी, पवन सूर्य के असमान तापन से आती है, बारिश बाँधों को भरती है, और सूर्य समुद्र की सतह गर्म करता है: सब **संचित सौर ऊर्जा** है। **भूतापीय और नाभिकीय ऊर्जा अलग हैं**: वे पृथ्वी के अंदर और परमाणुओं के अंदर से आती हैं, सूर्य से नहीं।",
      ),
      "found",
      { isHidden: true },
    );
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(found));
    return column([
      w.title(t("Most of it is sunshine", "इसका ज़्यादातर भाग धूप है")),
      w.body(
        t(
          "Activity 14.7 asks: what is the ultimate source of the energy in biomass, wind and ocean thermal energy? Are geothermal and nuclear energy different? Where do hydro and wave energy fit?",
          "क्रियाकलाप 14.7 पूछता है: जैव मात्रा, पवन और महासागरीय तापीय ऊर्जा का अंतिम स्रोत क्या है? क्या भूतापीय और नाभिकीय ऊर्जा अलग हैं? जल विद्युत और तरंग ऊर्जा कहाँ आती हैं?",
        ),
      ),
      sorter,
      goal,
      found,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** The panchayat meeting: Riya presents the plan. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const pic = sceneOn(
      b,
      "pic",
      EnergyScene.Panchayat,
      "Riya standing in front of the panchayat under the big tree, holding up her notebook, with Kabir beside her",
    );
    const ask = choiceQuestion(b, {
      prompt: t(
        'Shanti Aunty\'s son asks: "Will your plan still work in twenty years?" What is the best answer?',
        'शांति आंटी का बेटा पूछता है: "क्या तुम्हारी योजना बीस साल बाद भी चलेगी?" सबसे अच्छा उत्तर क्या है?',
      ),
      options: [
        {
          id: "right",
          label: t(
            "Yes: sunlight and dung keep coming; we just look after the gas plants and panels",
            "हाँ: धूप और गोबर आते रहेंगे; बस गैस संयंत्रों और पैनलों की देखभाल करनी है",
          ),
        },
        {
          id: "coal",
          label: t(
            "Yes: coal will last 200 years, so it can't run out on us",
            "हाँ: कोयला 200 वर्ष चलेगा, इसलिए हमारे लिए ख़त्म नहीं होगा",
          ),
          feedback: t(
            "The plan uses no coal at all. It rests on renewable sources: sunlight and biogas.",
            "योजना में कोयला है ही नहीं। यह नवीकरणीय स्रोतों पर टिकी है: धूप और बायोगैस।",
          ),
        },
        {
          id: "no",
          label: t(
            "No: renewable sources always run out within a few short years",
            "नहीं: नवीकरणीय स्रोत हमेशा कुछ वर्षों में ख़त्म हो जाते हैं",
          ),
          feedback: t(
            "Renewable means they are regenerated: the Sun shines and cattle give dung every day.",
            "नवीकरणीय का अर्थ है वे फिर बनते हैं: सूर्य हर दिन चमकता है और पशु हर दिन गोबर देते हैं।",
          ),
        },
      ],
      answer: "right",
    });
    const plan = w.definition(
      t(
        "**The village energy plan.** (1) **Gobar-gas plants** for families who keep cattle; the slurry goes to the fields as manure. (2) **Charcoal or improved chulhas** for the rest, to cut the smoke. (3) **Solar panels with batteries** on the school roof for the evening classes. (4) A **solar cooker** for the mid-day meal on sunny days. (5) **Wind** only as a summer help. (6) **No new dam**, no coal plant, no nuclear. (7) **Save energy**: switch off what isn't needed.",
        "**गाँव की ऊर्जा योजना।** (1) पशु रखने वाले परिवारों के लिए **गोबर गैस संयंत्र**; घोल खाद बनकर खेतों में जाए। (2) बाक़ी के लिए धुआँ घटाने को **काठ-कोयला या सुधरे चूल्हे**। (3) शाम की कक्षाओं के लिए स्कूल की छत पर **बैटरियों के साथ सौर पैनल**। (4) धूप वाले दिनों में मध्याह्न भोजन के लिए **सौर कुकर**। (5) **पवन** केवल गर्मी की मदद के रूप में। (6) **कोई नया बाँध नहीं**, कोई कोयला संयंत्र नहीं, कोई नाभिकीय नहीं। (7) **ऊर्जा बचाओ**: जो ज़रूरी नहीं, उसे बंद करो।",
      ),
      "plan",
      { isHidden: true },
    );
    b.when(ask.on(QuestionSignal.Correct), theBoard.show(plan));
    return column([
      w.title(t("The panchayat meeting", "पंचायत की बैठक")),
      pic,
      w.body(
        t(
          "Under the big tree, with the whole village watching, Riya reads out the plan. The sarpanch listens, then nods at the school roof.",
          "बड़े पेड़ के नीचे, पूरे गाँव के सामने, रिया योजना पढ़ती है। सरपंच सुनते हैं, फिर स्कूल की छत की ओर सिर हिलाते हैं।",
        ),
      ),
      ask,
      plan,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Exercises 3, 7 and 10, and in-text Qs. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const q1 = choiceQuestion(b, {
      name: "q1",
      prompt: t(
        "Which of these is NOT ultimately derived from the Sun's energy?",
        "इनमें से कौन अंततः सूर्य की ऊर्जा से नहीं आता?",
      ),
      options: [
        { id: "right", label: t("Nuclear energy", "नाभिकीय ऊर्जा") },
        {
          id: "wind",
          label: t("Wind energy", "पवन ऊर्जा"),
          feedback: t(
            "Wind comes from the Sun heating land and water unequally.",
            "पवन सूर्य द्वारा स्थल और जल के असमान तापन से आती है।",
          ),
        },
        {
          id: "bio",
          label: t("Biomass", "जैव मात्रा"),
          feedback: t(
            "Plants grew using sunlight, so biomass is stored solar energy.",
            "पौधे धूप से उगे, इसलिए जैव मात्रा संचित सौर ऊर्जा है।",
          ),
        },
        {
          id: "hydro",
          label: t("Hydro energy", "जल ऊर्जा"),
          feedback: t(
            "The Sun evaporates water that falls as rain and fills the dams.",
            "सूर्य पानी वाष्पित करता है जो बारिश बनकर बाँध भरता है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const q2 = choiceQuestion(b, {
      name: "q2",
      prompt: t(
        "Name two sources you would consider exhaustible.",
        "दो ऐसे स्रोत बताओ जिन्हें तुम समाप्य मानोगे।",
      ),
      options: [
        { id: "right", label: t("Coal and petroleum", "कोयला और पेट्रोलियम") },
        {
          id: "sunwind",
          label: t("Sunlight and wind", "धूप और पवन"),
          feedback: t(
            "These keep coming as long as the Sun shines. Coal and petroleum will run out.",
            "जब तक सूर्य चमकता है, ये आते रहेंगे। कोयला और पेट्रोलियम ख़त्म होंगे।",
          ),
        },
        {
          id: "biowater",
          label: t("Biogas and hydro", "बायोगैस और जल"),
          feedback: t(
            "Both are renewable: dung keeps coming, rain refills dams. Coal and petroleum are exhaustible.",
            "दोनों नवीकरणीय हैं: गोबर आता रहता है, बारिश बाँध भरती है। कोयला और पेट्रोलियम समाप्य हैं।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const q3 = choiceQuestion(b, {
      name: "q3",
      prompt: t(
        "Which step would best reduce our energy consumption?",
        "कौन-सा कदम हमारी ऊर्जा खपत सबसे अच्छी तरह घटाएगा?",
      ),
      options: [
        {
          id: "right",
          label: t("Switch off lights and fans when leaving", "जाते समय बत्ती और पंखे बंद करना"),
        },
        {
          id: "more",
          label: t("Build more power stations near cities", "शहरों के पास और बिजलीघर बनाना"),
          feedback: t(
            "That supplies more energy; it doesn't use less. Saving starts with switching things off.",
            "इससे ज़्यादा ऊर्जा मिलती है; कम उपयोग नहीं होती। बचत चीज़ें बंद करने से शुरू होती है।",
          ),
        },
        {
          id: "car",
          label: t("Take a car for every short trip", "हर छोटी दूरी के लिए कार लेना"),
          feedback: t(
            "That uses more fuel. Walking, cycling or sharing rides saves energy.",
            "इससे ज़्यादा ईंधन लगता है। पैदल, साइकिल या साझा सवारी ऊर्जा बचाती है।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    b.when(q1.on(QuestionSignal.Correct), theBoard.show(q2));
    b.when(q2.on(QuestionSignal.Correct), theBoard.show(q3));
    const done = w.body(t("On to the finale.", "अब समापन।"), "done", { isHidden: true });
    b.when(q3.on(QuestionSignal.Correct), [theBoard.show(done), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), q1, q2, q3, done, space()]);
  },
  { passOn: PassOn.Rules },
);

/** Finale: the school's first evening class under solar lights. */
const finale = page("finale", (b) => {
  const w = wordsOn(b);
  const pic = sceneOn(
    b,
    "pic",
    EnergyScene.SchoolLit,
    "the village school at night, its windows glowing with electric light, solar panels on the roof, children reading inside",
  );
  return column([
    w.title(t("Lights in the school", "स्कूल में रोशनी")),
    pic,
    w.body(
      t(
        'Months later, a photo arrives on Riya\'s phone: the village school at night, **solar panels on the roof**, every window glowing, children bent over their books with no smoky lamp in sight. Underneath, Shanti Aunty has added: "Cooking on gobar-gas now. No more smoke in my eyes."',
        'महीनों बाद रिया के फ़ोन पर एक फ़ोटो आती है: रात में गाँव का स्कूल, **छत पर सौर पैनल**, हर खिड़की रोशन, बच्चे किताबों पर झुके, कहीं कोई धुएँ वाला लैंप नहीं। नीचे शांति आंटी ने लिखा है: "अब गोबर गैस पर खाना बनता है। आँखों में अब धुआँ नहीं।"',
      ),
    ),
    w.definition(
      t(
        "**Mission complete.** (1) A **good source** does much work per kilogram, is easy to get, store and carry, and is cheap; every use spreads energy out. (2) **Fossil fuels** are limited and polluting; a **thermal plant** burns them to spin a steam turbine. (3) **Hydro power** is renewable but big dams drown land. (4) **Biomass**: charcoal and **biogas** (up to 75% methane) are better than wood and dung. (5) **Wind** farms need steady wind above 15 km/h and much land. (6) The **Sun**: black absorbs, the cooker traps heat under glass, and **solar cells** make electricity. (7) The **sea and the earth**: tides, waves, ocean heat and geothermal steam, at few sites. (8) **Nuclear** fission gives huge energy (E = Δmc²) but leaves radioactive waste. (9) No source is perfectly clean; renewable sources last, exhaustible ones won't.",
        "**मिशन पूरा।** (1) **अच्छा स्रोत** प्रति किलोग्राम बहुत कार्य करता है, आसानी से मिलता, रखा और ढोया जाता है, और सस्ता है; हर उपयोग ऊर्जा फैलाता है। (2) **जीवाश्म ईंधन** सीमित और प्रदूषक हैं; **तापीय संयंत्र** उन्हें जलाकर भाप टरबाइन घुमाता है। (3) **जल विद्युत** नवीकरणीय है पर बड़े बाँध ज़मीन डुबोते हैं। (4) **जैव मात्रा**: काठ-कोयला और **बायोगैस** (75% तक मीथेन) लकड़ी और उपलों से बेहतर हैं। (5) **पवन** फ़ार्मों को 15 km/h से ऊपर स्थिर हवा और बहुत ज़मीन चाहिए। (6) **सूर्य**: काला सोखता है, कुकर काँच के नीचे ऊष्मा रोकता है, और **सौर सेल** बिजली बनाते हैं। (7) **समुद्र और पृथ्वी**: ज्वार, लहरें, समुद्री ऊष्मा और भूतापीय भाप, कम जगहों पर। (8) **नाभिकीय** विखंडन अपार ऊर्जा देता है (E = Δmc²) पर रेडियोधर्मी कचरा छोड़ता है। (9) कोई स्रोत पूरी तरह साफ़ नहीं; नवीकरणीय स्रोत टिकते हैं, समाप्य नहीं।",
      ),
    ),
    space(),
  ]);
});

export const overview = [hook, cleaner, howLong, fromSun, inLife, yourTurn, finale];

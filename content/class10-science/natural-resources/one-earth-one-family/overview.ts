import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { goalQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  Deed,
  FiveRAction,
  FiveRDerived,
  R_OF,
  ResScene,
  RiverAction,
  RiverDerived,
  RiverMode,
  Sample,
  Source,
  fiveRsDef,
  riverHealthDef,
} from "@chalk/prop-resources";
import { ask, sceneOn } from "../kit";

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** Who and where: the eco-club's last project of the year. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const notice = sceneOn(
    b,
    "notice",
    ResScene.AuditNotice,
    "the eco-club notice: the year's last project, a resource audit of one real place",
  );
  return column([
    w.title(t("The last project of the year", "साल का आख़िरी प्रोजेक्ट")),
    notice,
    w.body(
      t(
        "Kabir's sealed jar lived its 30 days, and the eco-club has pinned up one last project before the year ends: **a resource audit of one real place.** Pick a village or a neighbourhood, find out how it uses its water, its trees, its river and its fuel, and suggest what would make that use last. Riya, in Class 10, and her little brother Kabir pick the one place they will be in all summer: Grandpa's home village.",
        "कबीर का बंद जार अपने 30 दिन जी गया, और इको-क्लब ने साल ख़त्म होने से पहले एक आख़िरी प्रोजेक्ट लगाया है: **किसी एक असली जगह का संसाधन ऑडिट।** कोई गाँव या मोहल्ला चुनो, पता करो कि वह अपना पानी, अपने पेड़, अपनी नदी और अपना ईंधन कैसे इस्तेमाल करता है, और सुझाओ कि यह इस्तेमाल लंबे समय तक कैसे चले। दसवीं में पढ़ने वाली रिया और उसका छोटा भाई कबीर वह जगह चुनते हैं जहाँ वे पूरी गर्मियाँ रहेंगे: दादाजी का पुश्तैनी गाँव।",
      ),
    ),
    space(),
  ]);
});

/** Grandpa's first visit in twenty years: what has changed. */
const village = page("village", (b) => {
  const w = wordsOn(b);
  const back = sceneOn(
    b,
    "back",
    ResScene.VillageReturn,
    "Grandpa back in his village after twenty years: new concrete houses and a new road",
  );
  return column([
    w.title(t("Twenty years later", "बीस साल बाद")),
    back,
    w.body(
      t(
        "Grandpa hasn't been back in twenty years. He hardly recognises the place: a tar road, concrete houses, a mobile tower. Then the troubles come out, one by one. The old well dries up by March. The grove behind the temple is half cut. The canal from the big dam never reaches the farms at the far end. The river ghat is dirty. And everyone rides a scooter to a market two kilometres away.",
        "दादाजी बीस साल से यहाँ नहीं आए। वे जगह को मुश्किल से पहचान पाते हैं: पक्की सड़क, कंक्रीट के घर, एक मोबाइल टावर। फिर एक-एक करके परेशानियाँ सामने आती हैं। पुराना कुआँ मार्च तक सूख जाता है। मंदिर के पीछे का उपवन आधा कट चुका है। बड़े बाँध से आई नहर दूर के खेतों तक कभी नहीं पहुँचती। नदी का घाट गंदा है। और हर कोई दो किलोमीटर दूर बाज़ार स्कूटर से जाता है।",
      ),
    ),
    space(),
  ]);
});

/** Why this chapter: the audit sheet and the stops on the way. */
const why = page("why", (b) => {
  const w = wordsOn(b);
  return column([
    w.title(t("What this chapter is for", "यह अध्याय किसलिए है")),
    w.body(
      t(
        "That's the mission: fill in an **audit sheet** for the village, one row for each problem (the river, our habits, the grove, the canal, the well, and the fuel), each with what's going wrong and what would fix it. At the end of the summer the kids present it at the **gram sabha**, the meeting of the whole village.",
        "यही मिशन है: गाँव के लिए एक **ऑडिट शीट** भरना, हर समस्या की एक पंक्ति (नदी, हमारी आदतें, उपवन, नहर, कुआँ, और ईंधन), हर एक में क्या गड़बड़ है और क्या उसे ठीक करेगा। गर्मियों के अंत में बच्चे इसे **ग्राम सभा** में, पूरे गाँव की बैठक में, रखेंगे।",
      ),
    ),
    w.definition(
      t(
        "**The stops on the way.** (1) One earth, one family: the river and our habits, *this lesson*. (2) Why manage resources at all. (3) Who wants the forest. (4) People who saved forests. (5) Water for all. (6) Catch every drop. (7) Fuel that runs out, and then the gram sabha.",
        "**रास्ते के पड़ाव।** (1) एक धरती, एक परिवार: नदी और हमारी आदतें, *यह पाठ*। (2) संसाधनों का प्रबंधन क्यों। (3) जंगल किसे चाहिए। (4) जंगल बचाने वाले लोग। (5) सबके लिए पानी। (6) हर बूँद सहेजो। (7) ख़त्म होने वाला ईंधन, और फिर ग्राम सभा।",
      ),
    ),
    w.body(
      t(
        "First stop: the dirty ghat. What makes a river dirty, and how would we even measure it?",
        "पहला पड़ाव: गंदा घाट। नदी को गंदा क्या करता है, और हम इसे नापेंगे कैसे?",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Natural resources; living in harmony; laws and organisations. */
const oneFamily = page(
  "one-family",
  (b) => {
    const w = wordsOn(b);
    const q = ask(b, {
      name: "meaning",
      prompt: t("What does 'Vasudhaiv kutumbakam' mean?", "'वसुधैव कुटुम्बकम्' का क्या अर्थ है?"),
      right: t("The entire earth is one family", "पूरी धरती एक परिवार है"),
      wrong: [
        [
          t("Each family should own its land", "हर परिवार की अपनी ज़मीन होनी चाहिए"),
          t(
            "It says the opposite: the whole earth is one family, so its resources are shared.",
            "यह उल्टा कहता है: पूरी धरती एक परिवार है, इसलिए उसके संसाधन साझा हैं।",
          ),
        ],
        [
          t("Protect forests before rivers", "नदियों से पहले जंगल बचाओ"),
          t(
            "It doesn't rank resources. It means the entire earth is one family.",
            "यह संसाधनों की तुलना नहीं करता। इसका अर्थ है पूरी धरती एक परिवार है।",
          ),
        ],
      ],
    });
    return column([
      w.title(t("One earth, one family", "एक धरती, एक परिवार")),
      w.definition(
        t(
          "**Natural resources.** Things we get from nature and use: soil, air, water, forests and wildlife, coal and petroleum. In Class 9 we saw how soil, air and water are cycled in nature; in Ch15 we saw how our activities pollute them.",
          "**प्राकृतिक संसाधन।** वे चीज़ें जो हमें प्रकृति से मिलती हैं और जिन्हें हम इस्तेमाल करते हैं: मिट्टी, हवा, पानी, वन और वन्यजीव, कोयला और पेट्रोलियम। कक्षा 9 में हमने देखा कि मिट्टी, हवा और पानी प्रकृति में कैसे चक्रित होते हैं; अध्याय 15 में देखा कि हमारी गतिविधियाँ इन्हें कैसे प्रदूषित करती हैं।",
        ),
      ),
      w.body(
        t(
          "Living in harmony with nature is not new to India. It runs through our traditions, festivals, crafts and beliefs, and through a Sanskrit phrase from the Maha Upanishad: **'Vasudhaiv kutumbakam'**, the entire earth is one family.",
          "प्रकृति के साथ तालमेल में रहना भारत के लिए नया नहीं है। यह हमारी परंपराओं, त्योहारों, शिल्प और मान्यताओं में है, और महा उपनिषद के एक संस्कृत वाक्य में: **'वसुधैव कुटुम्बकम्'**, पूरी धरती एक परिवार है।",
        ),
      ),
      w.body(
        t(
          "Environmental problems often feel too big to touch. But there are international laws and rules, our own national laws and acts, and organisations at every level working to protect the environment, and each of us can act too.",
          "पर्यावरण की समस्याएँ अक्सर इतनी बड़ी लगती हैं कि हाथ नहीं लगाया जा सकता। पर अंतरराष्ट्रीय क़ानून और नियम हैं, हमारे अपने राष्ट्रीय क़ानून और अधिनियम हैं, और हर स्तर पर संगठन पर्यावरण बचाने में लगे हैं; और हम में से हर कोई भी कुछ कर सकता है।",
        ),
      ),
      q,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The Ganga Action Plan, coliform, what pollutes the river. */
const ganga = page(
  "ganga",
  (b) => {
    const w = wordsOn(b);
    const river = b.prop(riverHealthDef, "river", {
      mode: RiverMode.River,
      sources: [Source.Sewage, Source.Garbage, Source.Bathing, Source.Ashes, Source.Industry],
      isTreated: false,
    });
    b.studentOnly(river.action(RiverAction.SetSource));
    b.studentOnly(river.action(RiverAction.SetTreatment));
    b.standsFor(
      river,
      "a river past a town with five pollution sources switched on and no sewage treatment; coliform very high, fish dying",
    );
    const goal = goalQuestion(b, {
      about: river,
      prompt: t(
        "Make the river safe to bathe in: low coliform and no toxic chemicals.",
        "नदी को नहाने लायक़ बनाओ: कम कोलिफ़ॉर्म और कोई ज़हरीला रसायन नहीं।",
      ),
      isMet: river.derived(RiverDerived.IsSafeToBathe),
      solve: [
        river.learner(RiverAction.SetSource, { source: Source.Industry, on: false }),
        river.learner(RiverAction.SetSource, { source: Source.Garbage, on: false }),
        river.learner(RiverAction.SetSource, { source: Source.Ashes, on: false }),
        river.learner(RiverAction.SetTreatment, { on: true }),
      ],
    });
    return column([
      w.title(t("A river turned into a drain", "नाला बनती नदी")),
      w.body(
        t(
          "The **Ganga Action Plan**, a project of many crores of rupees, began in **1985** because the water of the Ganga had become very poor. The river runs over 2500 km, from Gangotri in the Himalayas to Ganga Sagar in the Bay of Bengal, and more than a hundred towns and cities in Uttar Pradesh, Bihar and West Bengal pour their garbage and excreta into it.",
          "**गंगा कार्य योजना**, करोड़ों रुपये की एक परियोजना, **1985** में शुरू हुई क्योंकि गंगा का पानी बहुत ख़राब हो चुका था। नदी 2500 km से ज़्यादा बहती है, हिमालय में गंगोत्री से बंगाल की खाड़ी में गंगा सागर तक, और उत्तर प्रदेश, बिहार और पश्चिम बंगाल के सौ से ज़्यादा क़स्बे और शहर अपना कचरा और मल इसमें डालते हैं।",
        ),
      ),
      w.definition(
        t(
          "**Coliform.** A group of bacteria found in human intestines. Coliform in water shows that the water is contaminated with disease-causing microorganisms.",
          "**कोलिफ़ॉर्म।** जीवाणुओं का एक समूह जो मनुष्य की आँतों में पाया जाता है। पानी में कोलिफ़ॉर्म होने का मतलब है कि पानी रोग पैदा करने वाले सूक्ष्मजीवों से दूषित है।",
        ),
      ),
      w.body(
        t(
          "What goes into the river: largely untreated sewage every day; bathing and washing clothes; immersion of ashes or unburnt bodies; and chemical effluents from industries, whose toxicity kills fish in large stretches. Switch the sources off and on below, and try the treatment plant.",
          "नदी में क्या जाता है: रोज़ ज़्यादातर बिना उपचार का मल-जल; नहाना और कपड़े धोना; राख या अधजले शवों का प्रवाह; और उद्योगों के रासायनिक अपशिष्ट, जिनका ज़हर बड़े हिस्सों में मछलियों को मार देता है। नीचे स्रोतों को बंद-चालू करो, और उपचार संयंत्र आज़माओ।",
        ),
      ),
      river,
      goal,
      w.note(
        t(
          "In June 2014 the Union Government approved the **Namami Gange Programme** to reduce the pollution and revive the river. The National Mission for Clean Ganga, set up in October 2016, carries it out.",
          "जून 2014 में केंद्र सरकार ने प्रदूषण घटाने और नदी को फिर जीवित करने के लिए **नमामि गंगे कार्यक्रम** को मंज़ूरी दी। अक्टूबर 2016 में बना राष्ट्रीय स्वच्छ गंगा मिशन इसे लागू करता है।",
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Measuring pollution: pH with universal indicator (Activity 16.3). */
const ph = page(
  "ph",
  (b) => {
    const w = wordsOn(b);
    const bench = b.prop(riverHealthDef, "bench", {
      mode: RiverMode.Ph,
      sources: [],
      samples: [
        { sample: Sample.Tap, ph: 7 },
        { sample: Sample.River, ph: 7 },
      ],
      tested: [],
      canToggle: false,
      canTreat: false,
    });
    b.studentOnly(bench.action(RiverAction.Test));
    b.standsFor(
      bench,
      "two water samples on a bench, tap water and river water, each to be tested with a drop of universal indicator",
    );
    const q = ask(b, {
      name: "enough",
      prompt: t(
        "The ghat's water shows pH 7, the same as the tap water. Is it safe?",
        "घाट के पानी का pH 7 है, नल के पानी जितना। क्या वह सुरक्षित है?",
      ),
      right: t("Not proven: pH can't show coliform", "पक्का नहीं: pH कोलिफ़ॉर्म नहीं दिखाता"),
      wrong: [
        [
          t("Yes: a pH of 7 means it's pure water", "हाँ: 7 का pH मतलब यह शुद्ध पानी है"),
          t(
            "pH only tells acid or base. Water at pH 7 can still carry germs or harmful substances.",
            "pH केवल अम्ल या क्षार बताता है। pH 7 वाले पानी में भी रोगाणु या हानिकारक पदार्थ हो सकते हैं।",
          ),
        ],
        [
          t("No: river water is never safe", "नहीं: नदी का पानी कभी सुरक्षित नहीं"),
          t(
            "That's too strong. One pH reading can't prove it either way; other tests are needed.",
            "यह ज़रूरत से ज़्यादा है। एक pH माप किसी भी ओर कुछ साबित नहीं करता; दूसरी जाँचें चाहिए।",
          ),
        ],
      ],
    });
    return column([
      w.title(t("Can we measure dirty water?", "क्या गंदे पानी को नापा जा सकता है?")),
      w.body(
        t(
          "Some factors can be measured to tell how good water is. Some pollutants are harmful even in tiny amounts and need special equipment to detect. But one thing is easy to check, as we learnt in Ch2: the **pH** of water, with **universal indicator**.",
          "पानी कितना अच्छा है, यह बताने के लिए कुछ कारक नापे जा सकते हैं। कुछ प्रदूषक बहुत थोड़ी मात्रा में भी हानिकारक होते हैं और उन्हें पकड़ने के लिए ख़ास उपकरण चाहिए। पर एक चीज़ आसानी से जाँची जा सकती है, जैसा हमने अध्याय 2 में सीखा: पानी का **pH**, **सार्वत्रिक सूचक** से।",
        ),
      ),
      w.body(
        t(
          "NCERT Activity 16.3: test the water supplied to your house and the water of a local pond, river or lake. Test both samples below.",
          "NCERT क्रियाकलाप 16.3: अपने घर में आने वाले पानी और किसी स्थानीय तालाब, नदी या झील के पानी की जाँच करो। नीचे दोनों नमूनों की जाँच करो।",
        ),
      ),
      bench,
      q,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The five R's, each defined; sort the family's actions. */
const fiveRs = page(
  "five-rs",
  (b) => {
    const w = wordsOn(b);
    const deeds = [
      Deed.NoPlasticBag,
      Deed.FixLeakyTap,
      Deed.EnvelopeAgain,
      Deed.BrokenCupBirdFeeder,
      Deed.SegregatePaper,
    ] as const;
    const sorter = b.prop(fiveRsDef, "sorter", {
      deeds: [...deeds],
      placed: [],
      showMeaning: true,
      showFeedback: true,
    });
    b.studentOnly(sorter.action(FiveRAction.Put));
    b.studentOnly(sorter.action(FiveRAction.Reset));
    b.standsFor(
      sorter,
      "five everyday actions, one at a time, to be put into the five R's: Refuse, Reduce, Reuse, Repurpose, Recycle",
    );
    const goal = goalQuestion(b, {
      about: sorter,
      prompt: t("Put each action into the R it shows.", "हर काम को उस R में रखो जो वह दिखाता है।"),
      isMet: sorter.derived(FiveRDerived.AllRight),
      solve: deeds.map((d) => sorter.learner(FiveRAction.Put, { r: R_OF[d] })),
    });
    return column([
      w.title(t("The five R's", "पाँच R")),
      w.body(
        t(
          "We needn't feel powerless. There are five R's to save the environment.",
          "हमें बेबस महसूस करने की ज़रूरत नहीं। पर्यावरण बचाने के पाँच R हैं।",
        ),
      ),
      w.definition(
        t(
          "**Refuse:** say no to what you don't need, like single-use plastic bags.",
          "**मना करना (Refuse):** जिसकी ज़रूरत नहीं उसे ना कहो, जैसे एक बार इस्तेमाल वाली प्लास्टिक थैलियाँ।",
        ),
      ),
      w.definition(
        t(
          "**Reduce:** use less: switch off fans you don't need, fix leaky taps, don't waste food.",
          "**कम करना (Reduce):** कम इस्तेमाल करो: बेकार के पंखे बंद करो, टपकते नल ठीक करो, खाना बर्बाद न करो।",
        ),
      ),
      w.definition(
        t(
          "**Reuse:** use the same thing again, like a jam bottle kept for storing. It beats recycling, which uses some energy.",
          "**दोबारा इस्तेमाल (Reuse):** एक ही चीज़ फिर से इस्तेमाल करो, जैसे सामान रखने के लिए रखी जैम की बोतल। यह पुनर्चक्रण से बेहतर है, जिसमें कुछ ऊर्जा लगती है।",
        ),
      ),
      w.definition(
        t(
          "**Repurpose:** give a thing a new job when it can't do its first one, like a cracked cup as a plant pot.",
          "**नया उपयोग (Repurpose):** जब कोई चीज़ अपना पहला काम न कर सके, उसे नया काम दो, जैसे दरका कप पौधे का गमला।",
        ),
      ),
      w.definition(
        t(
          "**Recycle:** collect plastic, paper, glass and metal to be made into new things. First **segregate** your waste, so the recyclable part isn't dumped with the rest.",
          "**पुनर्चक्रण (Recycle):** प्लास्टिक, कागज़, काँच और धातु इकट्ठा करो ताकि उनसे नई चीज़ें बनें। पहले अपना कचरा **अलग-अलग** करो, ताकि पुनर्चक्रण लायक़ हिस्सा बाक़ी के साथ न फेंका जाए।",
        ),
      ),
      sorter,
      goal,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Sustainable development. */
const sustainable = page(
  "sustainable",
  (b) => {
    const w = wordsOn(b);
    const q = ask(b, {
      name: "sustainable",
      prompt: t("Which of these is sustainable development?", "इनमें से संपोषित विकास कौन-सा है?"),
      right: t(
        "Meeting today's needs while saving enough for the future",
        "आज की ज़रूरतें पूरी करना और भविष्य के लिए भी बचाना",
      ),
      wrong: [
        [
          t(
            "Using up every resource fully now, while prices are still low",
            "अभी, जब दाम अभी भी कम हैं, हर संसाधन पूरा ख़र्च कर देना",
          ),
          t(
            "That leaves nothing for the next generations. Sustainable means it lasts.",
            "इससे अगली पीढ़ियों के लिए कुछ नहीं बचता। संपोषित का अर्थ है जो टिके।",
          ),
        ],
        [
          t(
            "Stopping all growth so that nothing is ever used",
            "सारी वृद्धि रोकना ताकि कभी कुछ इस्तेमाल न हो",
          ),
          t(
            "It doesn't stop growth: it is growth that meets basic needs and still preserves resources.",
            "यह वृद्धि नहीं रोकता: यह ऐसी वृद्धि है जो बुनियादी ज़रूरतें पूरी करे और संसाधन भी बचाए।",
          ),
        ],
      ],
    });
    return column([
      w.title(t("Growth that lasts", "टिकाऊ वृद्धि")),
      w.definition(
        t(
          "**Sustainable development.** Growth that meets people's basic needs today **while preserving resources** for the needs of future generations. Economic development and environmental conservation are linked.",
          "**संपोषित विकास।** ऐसी वृद्धि जो लोगों की आज की बुनियादी ज़रूरतें पूरी करे **और संसाधनों को बचाए भी**, ताकि भविष्य की पीढ़ियों की ज़रूरतें पूरी हो सकें। आर्थिक विकास और पर्यावरण संरक्षण आपस में जुड़े हैं।",
        ),
      ),
      w.body(
        t(
          "So it means a change in every part of life. It depends on people being willing to see things differently, and on each of us being ready to change how we use natural resources today. Even everyday choices count, once we know how they affect the environment: some effects are immediate, some long-term, some reach far away.",
          "इसलिए इसका मतलब है जीवन के हर हिस्से में बदलाव। यह इस पर निर्भर है कि लोग चीज़ों को अलग ढंग से देखने को तैयार हों, और हम में से हर कोई आज प्राकृतिक संसाधनों के इस्तेमाल का तरीक़ा बदलने को तैयार हो। रोज़ के छोटे फ़ैसले भी मायने रखते हैं, जब हम जानें कि उनका पर्यावरण पर क्या असर होता है: कुछ असर तुरंत होते हैं, कुछ लंबे समय में, कुछ दूर तक पहुँचते हैं।",
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

/** The dirty ghat, explained; the family's first week. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const ghat = sceneOn(
      b,
      "ghat",
      ResScene.DirtyGhat,
      "the village ghat: a drain pouring into the river, plastic and flowers floating, people washing clothes",
    );
    const q = ask(b, {
      name: "drain",
      prompt: t(
        "A drain from the houses pours straight into the river beside the ghat. Which fix cuts the coliform most?",
        "घरों का एक नाला घाट के पास सीधे नदी में गिरता है। कौन-सा उपाय कोलिफ़ॉर्म सबसे ज़्यादा घटाएगा?",
      ),
      right: t(
        "Treating the drain's sewage before it reaches the river",
        "नाले के मल-जल का नदी तक पहुँचने से पहले उपचार",
      ),
      wrong: [
        [
          t(
            "Painting the ghat steps and putting up shiny new railings",
            "घाट की सीढ़ियाँ रँगना और चमचमाती नई रेलिंग लगाना",
          ),
          t(
            "That looks nicer but changes nothing in the water. Coliform comes from human waste.",
            "इससे घाट सुंदर दिखेगा पर पानी में कुछ नहीं बदलेगा। कोलिफ़ॉर्म मानव मल से आता है।",
          ),
        ],
        [
          t("Checking the river's pH once a week with litmus", "हर हफ़्ते लिटमस से नदी का pH जाँचना"),
          t(
            "Measuring doesn't clean anything, and pH can't show coliform anyway.",
            "नापने से कुछ साफ़ नहीं होता, और pH वैसे भी कोलिफ़ॉर्म नहीं दिखाता।",
          ),
        ],
      ],
    });
    const row = w.body(
      t(
        "**Audit sheet, row 1: the river.** What's wrong: untreated sewage from the houses, garbage and washing at the ghat. What would fix it: treat the drain before it reaches the river, keep garbage out. And at home, the family starts its own five R's week: cloth bags, the leaky tap fixed, the pickle jars kept.",
        "**ऑडिट शीट, पंक्ति 1: नदी।** क्या गड़बड़ है: घरों का बिना उपचार का मल-जल, घाट पर कचरा और कपड़े धोना। क्या ठीक करेगा: नाले को नदी तक पहुँचने से पहले साफ़ करना, कचरा बाहर रखना। और घर पर परिवार अपना पाँच R वाला हफ़्ता शुरू करता है: कपड़े के थैले, टपकता नल ठीक, अचार की बरनियाँ सँभालकर।",
      ),
      "row",
      { isHidden: true },
    );
    b.when(q.on(QuestionSignal.Correct), theBoard.show(row));
    return column([w.title(t("Back at the ghat", "फिर घाट पर")), ghat, q, row, space()]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Exercises 5 and 6; the mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const reduce = ask(b, {
      name: "reduce",
      prompt: t(
        "Exercise 5: which of these reduces your use of natural resources?",
        "अभ्यास 5: इनमें से कौन-सा तुम्हारे प्राकृतिक संसाधनों के इस्तेमाल को कम करता है?",
      ),
      right: t("Switching off the fan when you leave a room", "कमरे से जाते समय पंखा बंद करना"),
      wrong: [
        [
          t("Buying a new bottle of water at every stop", "हर पड़ाव पर पानी की नई बोतल ख़रीदना"),
          t(
            "That uses more plastic. Refill one bottle instead.",
            "इससे और प्लास्टिक लगता है। एक ही बोतल भरते रहो।",
          ),
        ],
        [
          t("Printing notes on one side of the paper only", "नोट्स कागज़ के केवल एक तरफ़ छापना"),
          t(
            "That doubles the paper used. Printing on both sides reduces it.",
            "इससे कागज़ दुगुना लगता है। दोनों तरफ़ छापने से कम लगता है।",
          ),
        ],
      ],
      passes: false,
    });
    const pressure = ask(b, {
      name: "pressure",
      prompt: t(
        "Exercise 6(b): which of these increases the pressure on our resources?",
        "अभ्यास 6(b): इनमें से कौन-सा हमारे संसाधनों पर दबाव बढ़ाता है?",
      ),
      right: t("Leaving the tap running while brushing your teeth", "दाँत ब्रश करते समय नल खुला छोड़ना"),
      wrong: [
        [
          t(
            "Carrying a cloth bag along to the vegetable market",
            "सब्ज़ी बाज़ार अपने साथ कपड़े का थैला ले जाना",
          ),
          t(
            "That refuses plastic bags: it takes pressure off, not on.",
            "इससे प्लास्टिक थैली को मना होता है: दबाव घटता है, बढ़ता नहीं।",
          ),
        ],
        [
          t("Giving old newspapers to be made into paper", "पुराने अख़बार नया कागज़ बनाने के लिए देना"),
          t(
            "That's recycling: fewer trees are cut for fresh paper.",
            "यह पुनर्चक्रण है: नए कागज़ के लिए कम पेड़ कटते हैं।",
          ),
        ],
      ],
      isHidden: true,
      passes: false,
    });
    const log = w.definition(
      t(
        "**Audit log, stop 1.** ✓ The river row is filled in: sewage needs treating before it reaches the river. ✓ The family's five R's week has begun. ✗ But why should a whole village bother to manage anything? Next: why manage our resources at all.",
        "**ऑडिट लॉग, पड़ाव 1।** ✓ नदी वाली पंक्ति भर गई: मल-जल का नदी तक पहुँचने से पहले उपचार ज़रूरी है। ✓ परिवार का पाँच R वाला हफ़्ता शुरू। ✗ पर पूरे गाँव को किसी चीज़ का प्रबंधन करने की परवाह क्यों हो? आगे: संसाधनों का प्रबंधन क्यों।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(reduce.on(QuestionSignal.Correct), theBoard.show(pressure));
    b.when(pressure.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), reduce, pressure, log, space()]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [
  hook,
  village,
  why,
  oneFamily,
  ganga,
  ph,
  fiveRs,
  sustainable,
  inLife,
  yourTurn,
];

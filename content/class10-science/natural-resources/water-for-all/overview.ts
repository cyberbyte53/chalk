import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { goalQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  ResScene,
  Scheme,
  WaterAction,
  WaterDerived,
  WaterMode,
  waterHarvestDef,
} from "@chalk/prop-resources";
import { ask, sceneOn } from "../kit";

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** The canal that never reaches the far farms. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const tail = sceneOn(
    b,
    "tail",
    ResScene.TailEnd,
    "a canal from a big dam: green sugarcane fields near its start, dry cracked fields at the far end",
  );
  return column([
    w.title(t("The canal that stops short", "बीच में रुकती नहर")),
    tail,
    w.body(
      t(
        'A canal from the big dam runs past the village. Near its start the fields are green with sugarcane and rice. Kabir walks along it with Ramesh Kaka, whose farm is at the far end: by the time the channel gets there, it\'s a dry ditch. "They promised us water when the dam was built," says Kaka. "Twenty years. Not one season."',
        'बड़े बाँध से एक नहर गाँव के पास से गुज़रती है। उसके शुरू में खेत गन्ने और धान से हरे हैं। कबीर रमेश काका के साथ उसके किनारे चलता है, जिनका खेत आख़िरी छोर पर है: वहाँ पहुँचते-पहुँचते नाली सूखी खाई बन जाती है। "बाँध बनते समय हमसे पानी का वादा किया था," काका कहते हैं। "बीस साल। एक भी मौसम नहीं।"',
      ),
    ),
    w.body(
      t(
        "Stop 5: how should water be shared, and are big dams the answer?",
        "पड़ाव 5: पानी कैसे बँटना चाहिए, और क्या बड़े बाँध इसका उत्तर हैं?",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Rain is concentrated; why groundwater fails. */
const monsoon = page(
  "monsoon",
  (b) => {
    const w = wordsOn(b);
    const q = ask(b, {
      name: "fail",
      prompt: t(
        "Which is NOT one of NCERT's reasons groundwater fails to last?",
        "इनमें से कौन-सा NCERT के अनुसार भूजल न टिकने का कारण नहीं है?",
      ),
      right: t("Too much rain in the monsoon", "मानसून में बहुत ज़्यादा बारिश"),
      wrong: [
        [
          t("Loss of the vegetation cover", "वनस्पति आवरण का घटना"),
          t(
            "Loss of vegetation is one of NCERT's reasons: less water soaks into the ground.",
            "वनस्पति का घटना NCERT के कारणों में है: ज़मीन में कम पानी रिसता है।",
          ),
        ],
        [
          t("Growing crops that need lots of water", "बहुत पानी माँगने वाली फ़सलें"),
          t(
            "Diverting water to high water-demanding crops is one of NCERT's reasons.",
            "ज़्यादा पानी माँगने वाली फ़सलों की ओर पानी मोड़ना NCERT के कारणों में है।",
          ),
        ],
      ],
    });
    return column([
      w.title(t("Rain in a few months", "कुछ महीनों की बारिश")),
      w.body(
        t(
          "Water is a basic need of all life on land. Regions short of water in India closely match regions of deep poverty. But rainfall maps don't tell the whole story: India's rain comes mostly from the **monsoon**, so most of it falls in a few months of the year.",
          "पानी ज़मीन पर हर जीवन की बुनियादी ज़रूरत है। भारत में पानी की कमी वाले इलाक़े गहरी ग़रीबी वाले इलाक़ों से काफ़ी मेल खाते हैं। पर बारिश के नक़्शे पूरी कहानी नहीं बताते: भारत की बारिश ज़्यादातर **मानसून** से आती है, इसलिए उसका बड़ा हिस्सा साल के कुछ ही महीनों में गिरता है।",
        ),
      ),
      w.body(
        t(
          "Despite the monsoon, water underground hasn't lasted, mainly because of: the **loss of vegetation cover**; diverting water to **crops that need a lot of water**; and **pollution** from industrial effluents and city waste.",
          "मानसून के बावजूद ज़मीन के नीचे का पानी टिका नहीं, मुख्यतः इन कारणों से: **वनस्पति आवरण का घटना**; पानी को **बहुत पानी माँगने वाली फ़सलों** की ओर मोड़ना; और उद्योगों के अपशिष्ट और शहरी कचरे से **प्रदूषण**।",
        ),
      ),
      q,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Local systems vs the mega-projects. */
const local = page(
  "local",
  (b) => {
    const w = wordsOn(b);
    const q = ask(b, {
      name: "mega",
      prompt: t(
        "What happened to local irrigation when the mega-projects came?",
        "महा-परियोजनाओं के आने पर स्थानीय सिंचाई का क्या हुआ?",
      ),
      right: t(
        "It was neglected and people lost control of it",
        "उसकी अनदेखी हुई और लोगों का नियंत्रण छिन गया",
      ),
      wrong: [
        [
          t("It was joined to the big dams and worked better", "वह बड़े बाँधों से जुड़कर और अच्छी चलने लगी"),
          t(
            "NCERT says the mega-projects led to the neglect of local methods, not to their improvement.",
            "NCERT कहता है कि महा-परियोजनाओं से स्थानीय तरीक़ों की अनदेखी हुई, सुधार नहीं।",
          ),
        ],
        [
          t("It was handed over to the villagers to run", "उसे चलाने का काम गाँव वालों को सौंपा गया"),
          t(
            "The opposite: the government took over, and local people lost control of their water.",
            "उल्टा: सरकार ने कमान ले ली, और स्थानीय लोगों का अपने पानी पर नियंत्रण छिन गया।",
          ),
        ],
      ],
    });
    return column([
      w.title(t("Local first, then mega", "पहले स्थानीय, फिर महा")),
      w.body(
        t(
          "Dams, tanks and canals have been used in India since ancient times. These were **local** works run by local people, making sure the basic needs of farming and daily life were met all year. The stored water was strictly shared out, cropping was planned around it from centuries of experience, and the villagers maintained the systems themselves.",
          "बाँध, तालाब और नहरें भारत में प्राचीन काल से इस्तेमाल होती रही हैं। ये **स्थानीय** काम थे जिन्हें स्थानीय लोग चलाते थे, ताकि खेती और रोज़ के जीवन की बुनियादी ज़रूरतें साल भर पूरी हों। जमा पानी सख़्ती से बाँटा जाता था, सदियों के अनुभव से फ़सलें उसके हिसाब से तय होती थीं, और गाँव वाले ख़ुद इन प्रणालियों की देखरेख करते थे।",
        ),
      ),
      w.body(
        t(
          "The British first planned and built **large dams** and canals running over long distances, and independent India carried on with these **mega-projects**. Local methods were neglected, the government took over, and local people lost control of their own water.",
          "अंग्रेज़ों ने पहली बार लंबी दूरी तक जाने वाली **बड़े बाँधों** और नहरों की योजना बनाई और उन्हें बनाया, और स्वतंत्र भारत ने इन **महा-परियोजनाओं** को आगे बढ़ाया। स्थानीय तरीक़ों की अनदेखी हुई, सरकार ने कमान ले ली, और स्थानीय लोगों का अपने ही पानी पर नियंत्रण छिन गया।",
        ),
      ),
      q,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Kulhs in Himachal Pradesh: the farthest village first. */
const kulh = page(
  "kulh",
  (b) => {
    const w = wordsOn(b);
    const hill = b.prop(waterHarvestDef, "hill", {
      mode: WaterMode.Kulh,
      step: 0,
      canStep: true,
      canPick: false,
    });
    b.studentOnly(hill.action(WaterAction.Next));
    b.studentOnly(hill.action(WaterAction.Reset));
    b.standsFor(
      hill,
      "a kulh carrying stream water down a hillside to four villages; stepping on lets the water reach the villages in turn",
    );
    const goal = goalQuestion(b, {
      about: hill,
      prompt: t(
        "Let the kulh water reach all four villages, in the order the villages agreed.",
        "कुल्ह का पानी चारों गाँवों तक पहुँचाओ, उसी क्रम में जो गाँवों ने तय किया।",
      ),
      isMet: hill.derived(WaterDerived.IsDone),
      solve: [
        hill.learner(WaterAction.Next),
        hill.learner(WaterAction.Next),
        hill.learner(WaterAction.Next),
        hill.learner(WaterAction.Next),
      ],
    });
    const q = ask(b, {
      name: "first",
      prompt: t(
        "In the planting season, which village used the kulh water first?",
        "बुआई के मौसम में कुल्ह का पानी सबसे पहले किस गाँव ने इस्तेमाल किया?",
      ),
      right: t("The village farthest from the source", "स्रोत से सबसे दूर वाला गाँव"),
      wrong: [
        [
          t("The village nearest to the source", "स्रोत के सबसे नज़दीक वाला गाँव"),
          t(
            "The kulh worked the other way round: the farthest village first, then those higher up.",
            "कुल्ह उल्टा चलता था: सबसे दूर वाला गाँव पहले, फिर ऊपर वाले।",
          ),
        ],
        [
          t("The village that paid the most", "सबसे ज़्यादा पैसे देने वाला गाँव"),
          t(
            "It was shared by common agreement: farthest village first, not by who paid most.",
            "पानी आपसी सहमति से बँटता था: सबसे दूर वाला पहले, ज़्यादा पैसे वाला नहीं।",
          ),
        ],
      ],
      isHidden: true,
    });
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(q));
    return column([
      w.title(t("Kulhs: the farthest first", "कुल्ह: सबसे दूर वाला पहले")),
      w.definition(
        t(
          "**Kulh.** A local canal-irrigation system that parts of Himachal Pradesh built over **four hundred years ago**. Stream water was diverted into man-made channels that carried it to many villages down the hillside, shared by common agreement among all the villages and run by two or three people the villagers paid.",
          "**कुल्ह।** स्थानीय नहर-सिंचाई की एक प्रणाली जो हिमाचल प्रदेश के कुछ हिस्सों ने **चार सौ साल से भी पहले** बनाई। नदी-नालों का पानी मानव-निर्मित नालियों में मोड़ा जाता, जो उसे पहाड़ी के नीचे कई गाँवों तक ले जातीं; पानी सभी गाँवों की आपसी सहमति से बँटता और दो-तीन लोग उसे सँभालते, जिन्हें गाँव वाले पैसे देते थे।",
        ),
      ),
      hill,
      goal,
      q,
      w.note(
        t(
          "Kulh water also soaked into the soil and fed springs along the way. After the Irrigation Department took over the kulhs, most stopped working, and the friendly sharing ended.",
          "कुल्ह का पानी मिट्टी में रिसकर रास्ते में झरनों को भी भरता था। सिंचाई विभाग के कुल्ह अपने हाथ में लेने के बाद ज़्यादातर बंद हो गए, और मिल-जुलकर बाँटना ख़त्म हो गया।",
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Big dams: what they give, and who gets it. */
const dams = page(
  "dams",
  (b) => {
    const w = wordsOn(b);
    const q = ask(b, {
      name: "share",
      prompt: t(
        "Along a big canal, who usually gets the water, according to NCERT?",
        "NCERT के अनुसार बड़ी नहर के किनारे पानी आमतौर पर किसे मिलता है?",
      ),
      right: t(
        "People near the source, growing sugarcane and rice",
        "स्रोत के पास के लोग, जो गन्ना और धान उगाते हैं",
      ),
      wrong: [
        [
          t(
            "Everyone living along it, in exactly equal shares",
            "उसके किनारे रहने वाले सब लोग, बिल्कुल बराबर हिस्से में",
          ),
          t(
            "NCERT says there's no equitable distribution: those near the source take most.",
            "NCERT कहता है कि बँटवारा न्यायसंगत नहीं: स्रोत के पास वाले सबसे ज़्यादा ले लेते हैं।",
          ),
        ],
        [
          t("Farmers at the far end, who need it most", "आख़िरी छोर के किसान, जिन्हें सबसे ज़्यादा ज़रूरत है"),
          t(
            "Sadly, people farther downstream often get no water at all.",
            "दुख की बात है कि नीचे दूर के लोगों को अक्सर पानी मिलता ही नहीं।",
          ),
        ],
      ],
    });
    return column([
      w.title(t("Why build big dams?", "बड़े बाँध क्यों?")),
      w.body(
        t(
          "Large **dams** store enough water not just for irrigation but also to generate electricity (Ch14), and canals from them carry water over great distances. The **Indira Gandhi Canal**, for example, has brought greenery to large areas of Rajasthan.",
          "बड़े **बाँध** केवल सिंचाई ही नहीं, बिजली बनाने (अध्याय 14) के लिए भी पर्याप्त पानी जमा करते हैं, और उनसे निकली नहरें पानी बहुत दूर तक ले जाती हैं। उदाहरण के लिए, **इंदिरा गांधी नहर** ने राजस्थान के बड़े इलाक़ों को हरा-भरा किया है।",
        ),
      ),
      w.body(
        t(
          "But mismanagement has let a few people corner the benefits. There is no fair distribution: people close to the source grow water-hungry crops like sugarcane and rice, while people farther downstream get no water at all. Their anger, at benefits promised and never delivered, adds to that of the people displaced by the dam and its canals.",
          "पर कुप्रबंधन से लाभ कुछ लोगों तक सिमट गए। बँटवारा न्यायसंगत नहीं: स्रोत के पास वाले गन्ना और धान जैसी बहुत पानी माँगने वाली फ़सलें उगाते हैं, जबकि नीचे दूर वालों को पानी मिलता ही नहीं। जिन लाभों का वादा हुआ पर जो कभी नहीं मिले, उन पर इन लोगों का ग़ुस्सा, बाँध और उसकी नहरों से उजड़े लोगों के ग़ुस्से में जुड़ जाता है।",
        ),
      ),
      q,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The three problems with large dams. */
const problems = page(
  "problems",
  (b) => {
    const w = wordsOn(b);
    const table = b.prop(waterHarvestDef, "table", {
      mode: WaterMode.Compare,
      step: 0,
      choice: null,
      canStep: false,
      canPick: true,
    });
    b.studentOnly(table.action(WaterAction.Pick));
    b.standsFor(
      table,
      "a big dam and canal compared with local check dams, point by point; pick one to see its points",
    );
    const goal = goalQuestion(b, {
      about: table,
      prompt: t("Pick the big dam and read its points.", "बड़ा बाँध चुनो और उसके बिंदु पढ़ो।"),
      isMet: table.field("choice").eq(Scheme.BigDam),
      solve: [table.learner(WaterAction.Pick, { scheme: Scheme.BigDam })],
    });
    const q = ask(b, {
      name: "kind",
      prompt: t(
        "A dam floods a forest and its wildlife. Which kind of problem is that?",
        "एक बाँध जंगल और उसके वन्यजीवों को डुबो देता है। यह किस तरह की समस्या है?",
      ),
      right: t("Environmental", "पर्यावरणीय"),
      wrong: [
        [
          t("Economic", "आर्थिक"),
          t(
            "The economic problem is huge public money without proportionate benefits.",
            "आर्थिक समस्या है भारी सरकारी पैसा लगना पर उतना लाभ न होना।",
          ),
        ],
        [
          t("Social", "सामाजिक"),
          t(
            "The social problem is displacing peasants and tribals. Losing forest and wildlife is environmental.",
            "सामाजिक समस्या है किसानों और आदिवासियों को उजाड़ना। जंगल और वन्यजीव खोना पर्यावरणीय है।",
          ),
        ],
      ],
      isHidden: true,
    });
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(q));
    return column([
      w.title(t("Three problems with big dams", "बड़े बाँधों की तीन समस्याएँ")),
      w.body(
        t(
          "There have been protests against large dams, like the **Tehri Dam** on the Ganga, and the **Narmada Bachao Andolan** ('Save the Narmada Movement') against raising the **Sardar Sarovar Dam** on the Narmada. Critics point to three problems.",
          "बड़े बाँधों के ख़िलाफ़ विरोध हुए हैं, जैसे गंगा पर **टिहरी बाँध** के, और नर्मदा पर **सरदार सरोवर बाँध** की ऊँचाई बढ़ाने के ख़िलाफ़ **नर्मदा बचाओ आंदोलन**। आलोचक तीन समस्याएँ गिनाते हैं।",
        ),
      ),
      w.definition(
        t(
          "**(i) Social:** they displace large numbers of peasants and tribals without enough compensation or rehabilitation. **(ii) Economic:** they swallow huge amounts of public money without proportionate benefits. **(iii) Environmental:** they add enormously to deforestation and the loss of biodiversity.",
          "**(i) सामाजिक:** वे बड़ी संख्या में किसानों और आदिवासियों को पर्याप्त मुआवज़े या पुनर्वास के बिना उजाड़ते हैं। **(ii) आर्थिक:** वे भारी सरकारी पैसा निगल जाते हैं पर उतना लाभ नहीं देते। **(iii) पर्यावरणीय:** वे वनोन्मूलन और जैव विविधता के नुक़सान को बहुत बढ़ाते हैं।",
        ),
      ),
      table,
      goal,
      q,
      w.note(
        t(
          "The people displaced are mostly poor tribals who get no benefit from these projects. The oustees of the **Tawa Dam**, built in the 1970s, are still fighting for the benefits they were promised.",
          "उजड़ने वाले ज़्यादातर ग़रीब आदिवासी हैं जिन्हें इन परियोजनाओं से कोई लाभ नहीं मिलता। 1970 के दशक में बने **तवा बाँध** के विस्थापित आज भी उन लाभों के लिए लड़ रहे हैं जिनका उनसे वादा हुआ था।",
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** Ramesh Kaka's dry ditch, explained. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const tail = sceneOn(
      b,
      "tail",
      ResScene.TailEnd,
      "the canal: green at the start, dry at the far end",
    );
    const q = ask(b, {
      name: "kaka",
      prompt: t(
        "Which idea from the kulhs would get water to Ramesh Kaka's farm?",
        "कुल्ह का कौन-सा विचार रमेश काका के खेत तक पानी पहुँचाएगा?",
      ),
      right: t(
        "Agreed turns, with the far end served first",
        "तय बारी, जिसमें आख़िरी छोर को पहले पानी",
      ),
      wrong: [
        [
          t("A bigger canal so more water flows near the start", "बड़ी नहर ताकि शुरू में और पानी बहे"),
          t(
            "More water at the start just grows more sugarcane there. The problem is the sharing.",
            "शुरू में और पानी से वहाँ बस और गन्ना उगेगा। समस्या बँटवारे की है।",
          ),
        ],
        [
          t(
            "Letting each farmer take water whenever he likes",
            "हर किसान को जब चाहे तब पानी लेने देना",
          ),
          t(
            "That is how the near end takes it all. The kulhs worked by agreed turns.",
            "इसी तरह तो शुरू वाले सब ले लेते हैं। कुल्ह तय बारी से चलते थे।",
          ),
        ],
      ],
    });
    const row = w.body(
      t(
        "**Audit sheet, row 4: the canal.** What's wrong: no equitable distribution; the near end grows water-hungry crops and the tail end gets nothing. What would fix it: a water users' group that sets turns the kulh way, tail end first, and crops that suit the water there is.",
        "**ऑडिट शीट, पंक्ति 4: नहर।** क्या गड़बड़ है: बँटवारा न्यायसंगत नहीं; शुरू वाले बहुत पानी माँगने वाली फ़सलें उगाते हैं और आख़िरी छोर को कुछ नहीं मिलता। क्या ठीक करेगा: पानी इस्तेमाल करने वालों का एक समूह जो कुल्ह की तरह बारी तय करे, आख़िरी छोर पहले, और ऐसी फ़सलें जो उपलब्ध पानी के हिसाब से हों।",
      ),
      "row",
      { isHidden: true },
    );
    b.when(q.on(QuestionSignal.Correct), theBoard.show(row));
    return column([
      w.title(t("The dry end, explained", "सूखा छोर, समझ में आया")),
      tail,
      q,
      row,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Activity 16.9 and the mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const q = ask(b, {
      name: "park",
      prompt: t(
        "Activity 16.9: a water theme park is surrounded by villages short of water. Why is that a poor use?",
        "क्रियाकलाप 16.9: पानी वाले एक मनोरंजन पार्क के चारों ओर पानी की कमी वाले गाँव हैं। यह ख़राब उपयोग क्यों है?",
      ),
      right: t(
        "Basic needs nearby go unmet while water is used for fun",
        "पास की बुनियादी ज़रूरतें अधूरी, जबकि पानी मनोरंजन में",
      ),
      wrong: [
        [
          t(
            "Theme parks use no water at all, so it makes no difference",
            "मनोरंजन पार्क बिल्कुल पानी इस्तेमाल नहीं करते, तो कोई फ़र्क़ नहीं",
          ),
          t(
            "A water park uses a great deal of water, in a region where villages lack it.",
            "वाटर पार्क बहुत पानी इस्तेमाल करता है, उस इलाक़े में जहाँ गाँवों को पानी नहीं मिलता।",
          ),
        ],
        [
          t(
            "The villages could easily move closer to the park",
            "गाँव आसानी से पार्क के पास जाकर बस सकते हैं",
          ),
          t(
            "The question is fair sharing: water is a basic need, and the villages lack it.",
            "सवाल न्यायसंगत बँटवारे का है: पानी बुनियादी ज़रूरत है, और गाँवों के पास नहीं।",
          ),
        ],
      ],
      passes: false,
    });
    const log = w.definition(
      t(
        "**Audit log, stop 5.** ✓ Rain comes in a few months; groundwater fails when vegetation goes and water-hungry crops grow. ✓ Kulhs shared water fairly; big dams store a lot but have social, economic and environmental problems. ✗ The old well still dries up by March. Next: catch every drop.",
        "**ऑडिट लॉग, पड़ाव 5।** ✓ बारिश कुछ महीनों में आती है; वनस्पति घटने और पानी माँगने वाली फ़सलों से भूजल ख़त्म होता है। ✓ कुल्ह पानी न्यायसंगत बाँटते थे; बड़े बाँध बहुत पानी जमा करते हैं पर उनकी सामाजिक, आर्थिक और पर्यावरणीय समस्याएँ हैं। ✗ पुराना कुआँ अब भी मार्च तक सूख जाता है। आगे: हर बूँद सहेजो।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(q.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), q, log, space()]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [hook, monsoon, local, kulh, dams, problems, inLife, yourTurn];

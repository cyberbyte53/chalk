import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, goalQuestion, wordsOn } from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  EnergyScene,
  Level,
  OceanAction,
  OceanDerived,
  OceanKind,
  PlantAction,
  PlantKind,
  oceanEnergyDef,
  powerPlantDef,
} from "@chalk/prop-energy";
import { sceneOn } from "../kit";

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** Cousin Meera by the sea, and the hot spring on the trek. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const pic = sceneOn(
    b,
    "pic",
    EnergyScene.HotSpring,
    "a steaming hot spring among rocks on a mountain trek; Kabir dipping a hand in and pulling it back",
  );
  return column([
    w.title(t("Hot water from the rocks", "चट्टानों से गर्म पानी")),
    pic,
    w.body(
      t(
        'On a trek up the valley, Kabir finds a pool of water **steaming among the rocks**, too hot to keep his hand in, with no fire anywhere. That evening their cousin **Meera** calls from her town on the coast: "Here the sea goes up and down twice a day, by metres!" Two new ideas for the notebook: heat from inside the earth, and energy from the sea.',
        'घाटी में ट्रेक पर कबीर को **चट्टानों के बीच भाप छोड़ता** पानी का एक कुंड मिलता है, इतना गर्म कि हाथ नहीं रख सकता, और कहीं कोई आग नहीं। उस शाम उनकी चचेरी बहन **मीरा** तट के अपने शहर से फ़ोन करती है: "यहाँ समुद्र दिन में दो बार ऊपर-नीचे होता है, मीटरों तक!" कॉपी के लिए दो नए विचार: पृथ्वी के अंदर से ऊष्मा, और समुद्र से ऊर्जा।',
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Tidal energy. */
const tidal = page(
  "tidal",
  (b) => {
    const w = wordsOn(b);
    const sea = b.prop(oceanEnergyDef, "sea", {
      kind: OceanKind.Tidal,
      sea: Level.Low,
      basin: Level.Low,
      isFlowing: false,
      wave: 2,
      surface: 28,
      deep: 5,
      showNames: true,
      canAct: true,
    });
    b.studentOnly(sea.action(OceanAction.NextTide));
    b.studentOnly(sea.action(OceanAction.OpenGate));
    b.standsFor(
      sea,
      "a tidal dam across a narrow opening to the sea, with a turbine in the gate; the sea and the basin behind the dam are both at low tide; the learner can let the tide turn and open the gate",
    );
    const goal = goalQuestion(b, {
      about: sea,
      prompt: t(
        "Make the turbine turn. (Opening the gate does nothing while the levels match.)",
        "टरबाइन घुमाओ। (जब तक स्तर बराबर हैं, फाटक खोलने से कुछ नहीं होता।)",
      ),
      isMet: sea.derived(OceanDerived.Works),
      solve: [sea.learner(OceanAction.NextTide), sea.learner(OceanAction.OpenGate)],
    });
    return column([
      w.title(t("Tidal energy", "ज्वारीय ऊर्जा")),
      w.definition(
        t(
          "**Tides and tidal energy.** Mainly because of the **Moon's gravitational pull** on the spinning earth, the level of the sea **rises and falls**: **high and low tides**. The difference in sea levels gives **tidal energy**. It is harnessed by building a **dam across a narrow opening to the sea**, with a **turbine** at the opening.",
          "**ज्वार और ज्वारीय ऊर्जा।** मुख्यतः घूमती पृथ्वी पर **चंद्रमा के गुरुत्वाकर्षण खिंचाव** के कारण समुद्र का स्तर **चढ़ता और उतरता** है: **ज्वार और भाटा**। समुद्र के स्तरों का अंतर **ज्वारीय ऊर्जा** देता है। इसे **समुद्र के एक संकरे मुहाने पर बाँध** बनाकर, मुहाने पर **टरबाइन** लगाकर उपयोग किया जाता है।",
        ),
      ),
      sea,
      goal,
      w.body(
        t(
          "Only a **few places** have a suitable narrow opening, so tidal dams are limited.",
          "केवल **कुछ जगहों** पर उपयुक्त संकरा मुहाना है, इसलिए ज्वारीय बाँध सीमित हैं।",
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Wave energy and ocean thermal energy. */
const waves = page(
  "waves",
  (b) => {
    const w = wordsOn(b);
    const otec = b.prop(oceanEnergyDef, "otec", {
      kind: OceanKind.Thermal,
      sea: Level.High,
      basin: Level.Low,
      isFlowing: false,
      wave: 2,
      surface: 22,
      deep: 8,
      showNames: true,
      canAct: true,
    });
    b.studentOnly(otec.action(OceanAction.SetSurface));
    b.studentOnly(otec.action(OceanAction.SetDeep));
    b.standsFor(
      otec,
      "an ocean thermal energy plant: warm surface water boils ammonia, the vapour turns a turbine, cold water from 2 km down condenses it; the learner sets the surface and deep temperatures",
    );
    const goal = goalQuestion(b, {
      about: otec,
      prompt: t(
        "This sea is too cool on top for the plant to work. Find a surface temperature at which it can work.",
        "इस समुद्र की ऊपरी सतह संयंत्र चलाने के लिए बहुत ठंडी है। ऐसा सतही तापमान ढूँढो जिस पर यह चल सके।",
      ),
      isMet: otec.derived(OceanDerived.Works),
      solve: [otec.learner(OceanAction.SetSurface, { surface: 28 })],
    });
    const ask = choiceQuestion(b, {
      name: "why20",
      prompt: t(
        "For an ocean thermal plant to work, the surface must be warmer than the water 2 km down by at least…",
        "समुद्री तापीय संयंत्र चलने के लिए सतह 2 km नीचे के पानी से कम से कम कितनी गर्म होनी चाहिए…",
      ),
      options: [
        { id: "right", label: t("20 °C", "20 °C") },
        {
          id: "two",
          label: t("2 °C", "2 °C"),
          feedback: t("Far more is needed: 20 °C or more.", "कहीं ज़्यादा चाहिए: 20 °C या अधिक।"),
        },
        {
          id: "hundred",
          label: t("100 °C", "100 °C"),
          feedback: t(
            "The sea never gets that hot. 20 °C is enough, because ammonia boils easily.",
            "समुद्र कभी इतना गर्म नहीं होता। 20 °C काफ़ी है, क्योंकि अमोनिया आसानी से उबलती है।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
    });
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(ask));
    return column([
      w.title(t("Waves and warm water", "लहरें और गर्म पानी")),
      w.definition(
        t(
          "**Wave energy.** The **kinetic energy of huge waves** near the shore, raised by strong winds over the sea, can be trapped to turn turbines. It is worth it **only where waves are very strong**.",
          "**तरंग ऊर्जा।** समुद्र पर तेज़ हवाओं से उठी, तट के पास की **विशाल लहरों की गतिज ऊर्जा** टरबाइन घुमाने के लिए पकड़ी जा सकती है। यह **केवल वहीं उपयोगी है जहाँ लहरें बहुत तेज़ हों**।",
        ),
      ),
      w.definition(
        t(
          "**Ocean thermal energy.** The Sun heats the surface of the sea while the deep water stays cold. **Ocean-thermal-energy conversion (OTEC)** plants use this difference. They work only if the **surface is at least 20 °C warmer than the water down to 2 km**. (Scientists write a temperature *difference* like this as 20 K, kelvin: a difference of 1 K is the same as 1 °C.) The warm water **boils a volatile liquid like ammonia**; its vapour **runs the turbine**; cold water pumped up from the depths **condenses it back to liquid**.",
          "**महासागरीय तापीय ऊर्जा।** सूर्य समुद्र की सतह गर्म करता है जबकि गहरा पानी ठंडा रहता है। **महासागरीय तापीय ऊर्जा रूपांतरण (OTEC)** संयंत्र इसी अंतर का उपयोग करते हैं। वे तभी चलते हैं जब **सतह 2 km तक के पानी से कम से कम 20 °C गर्म** हो। (वैज्ञानिक तापमान के ऐसे *अंतर* को 20 K, केल्विन, लिखते हैं: 1 K का अंतर 1 °C के अंतर के बराबर है।) गर्म पानी **अमोनिया जैसे वाष्पशील द्रव को उबालता** है; उसकी वाष्प **टरबाइन चलाती** है; गहराई से पंप किया ठंडा पानी **उसे वापस द्रव बनाता** है।",
        ),
      ),
      otec,
      goal,
      ask,
      w.note(
        t(
          "The energy in the sea (tidal, wave and ocean thermal) is quite large, but using it efficiently on a commercial scale is difficult.",
          "समुद्र में ऊर्जा (ज्वारीय, तरंग और महासागरीय तापीय) काफ़ी अधिक है, पर उसे व्यावसायिक पैमाने पर दक्षता से उपयोग करना कठिन है।",
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Geothermal energy. */
const geothermal = page(
  "geothermal",
  (b) => {
    const w = wordsOn(b);
    const plant = b.prop(powerPlantDef, "plant", {
      kind: PlantKind.Geothermal,
      step: 0,
      isOn: false,
      level: 3,
      showChain: true,
      canStep: true,
      canSwitch: true,
      canSetLevel: false,
    });
    b.studentOnly(plant.action(PlantAction.Next));
    b.studentOnly(plant.action(PlantAction.Switch));
    b.studentOnly(plant.action(PlantAction.Reset));
    b.standsFor(
      plant,
      "a geothermal plant: molten rock heats underground water into steam, the steam rises through a pipe to a turbine and generator; next steps through the chain",
    );
    const ask = choiceQuestion(b, {
      prompt: t("What is geothermal energy?", "भूतापीय ऊर्जा क्या है?"),
      options: [
        {
          id: "right",
          label: t(
            "Heat from molten rock at hot spots inside the earth",
            "पृथ्वी के अंदर पिघली चट्टानों के तप्त स्थलों की ऊष्मा",
          ),
        },
        {
          id: "sun",
          label: t(
            "Heat stored in the ground's surface layers by the Sun",
            "सूर्य द्वारा ज़मीन की सतह में संचित ऊष्मा",
          ),
          feedback: t(
            "Geothermal heat comes from deep inside the earth, from molten rock pushed up into hot spots, not from the Sun.",
            "भूतापीय ऊष्मा पृथ्वी के गहरे अंदर से आती है, तप्त स्थलों में ऊपर धकेली पिघली चट्टानों से, सूर्य से नहीं।",
          ),
        },
        {
          id: "fire",
          label: t(
            "Heat from coal seams burning deep under the ground",
            "ज़मीन के नीचे गहराई में जलते कोयले की ऊष्मा",
          ),
          feedback: t(
            "Nothing burns. Molten rock heats underground water into steam.",
            "कुछ नहीं जलता। पिघली चट्टानें भूमिगत पानी को भाप बनाती हैं।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Heat from inside the earth", "पृथ्वी के अंदर से ऊष्मा")),
      w.definition(
        t(
          "**Geothermal energy.** Because of geological changes, **molten rock** deep in the earth's crust is pushed up and trapped in regions called **hot spots**. Underground water touching a hot spot turns to **steam**. Sometimes hot water finds its way to the surface: a **hot spring**. The trapped steam can be piped to a **turbine** to make electricity.",
          "**भूतापीय ऊर्जा।** भूगर्भीय परिवर्तनों के कारण पृथ्वी की पर्पटी में गहरी **पिघली चट्टानें** ऊपर धकेली जाकर **तप्त स्थल** कहलाने वाले क्षेत्रों में फँस जाती हैं। तप्त स्थल को छूने वाला भूमिगत पानी **भाप** बन जाता है। कभी-कभी गर्म पानी सतह तक रास्ता बना लेता है: **गर्म झरना**। फँसी भाप को पाइप से **टरबाइन** तक ले जाकर बिजली बनाई जा सकती है।",
        ),
      ),
      plant,
      w.body(
        t(
          "Making electricity this way **doesn't cost much**, but there are **very few places** where it pays. New Zealand and the USA run several geothermal power plants.",
          "इस तरह बिजली बनाना **ज़्यादा महँगा नहीं**, पर **बहुत कम जगहें** हैं जहाँ यह लाभदायक है। न्यूज़ीलैंड और अमेरिका कई भूतापीय बिजलीघर चलाते हैं।",
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

/** Why none of these suits the hill village. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const pic = sceneOn(b, "pic", EnergyScene.HotSpring, "the steaming hot spring on the trek");
    const ask = choiceQuestion(b, {
      prompt: t(
        "The village has a small hot spring and no sea. Should the plan include a geothermal power plant?",
        "गाँव में एक छोटा गर्म झरना है और समुद्र नहीं। क्या योजना में भूतापीय बिजलीघर होना चाहिए?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Not yet: one small spring doesn't prove the site works",
            "अभी नहीं: छोटा झरना साबित नहीं करता कि जगह उपयोगी है",
          ),
        },
        {
          id: "yes",
          label: t(
            "Yes: any hot spring can run a large power plant for us",
            "हाँ: कोई भी गर्म झरना बड़ा बिजलीघर चला सकता है",
          ),
          feedback: t(
            "Very few sites are commercially viable. One small spring isn't enough to know.",
            "बहुत कम जगहें व्यावसायिक रूप से उपयोगी हैं। एक छोटा झरना जानने के लिए काफ़ी नहीं।",
          ),
        },
        {
          id: "tidal",
          label: t(
            "No, but a tidal dam on the stream would work instead",
            "नहीं, पर धारा पर ज्वारीय बाँध उसकी जगह काम करेगा",
          ),
          feedback: t(
            "Tides happen in the sea, not in a mountain stream.",
            "ज्वार समुद्र में आते हैं, पहाड़ी धारा में नहीं।",
          ),
        },
      ],
      answer: "right",
    });
    const note = w.body(
      t(
        "Tides, waves and ocean heat need a coast; the spring is a nice bath, not a power station. Riya notes: **sea and geothermal energy don't suit this village.** Stop 7 done.",
        "ज्वार, लहरें और समुद्री ऊष्मा के लिए तट चाहिए; झरना नहाने के लिए अच्छा है, बिजलीघर के लिए नहीं। रिया लिखती है: **समुद्री और भूतापीय ऊर्जा इस गाँव के लिए उपयुक्त नहीं।** पड़ाव 7 पूरा।",
      ),
      "note",
      { isHidden: true },
    );
    b.when(ask.on(QuestionSignal.Correct), theBoard.show(note));
    return column([w.title(t("For the village?", "गाँव के लिए?")), pic, ask, note, space()]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** In-text Q2 and Exercise 6(b–c), then the mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const q1 = choiceQuestion(b, {
      name: "q1",
      prompt: t(
        "Which is a limitation of getting energy from tides?",
        "ज्वार से ऊर्जा पाने की एक सीमा कौन-सी है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Few coasts have a narrow opening for a dam",
            "कम तटों पर बाँध के लिए संकरा मुहाना है",
          ),
        },
        {
          id: "run",
          label: t("The tides will stop within a few decades", "ज्वार कुछ दशकों में रुक जाएँगे"),
          feedback: t(
            "Tides will go on as long as the Moon pulls on the earth. The limit is the few suitable sites.",
            "जब तक चंद्रमा पृथ्वी को खींचता है, ज्वार आते रहेंगे। सीमा उपयुक्त जगहों की कमी है।",
          ),
        },
        {
          id: "smoke",
          label: t("The turbines give off a lot of smoke", "टरबाइन बहुत धुआँ छोड़ते हैं"),
          feedback: t(
            "Nothing is burnt. The limit is that suitable sites are few.",
            "कुछ नहीं जलता। सीमा यह है कि उपयुक्त जगहें कम हैं।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const q2 = choiceQuestion(b, {
      name: "q2",
      prompt: t(
        "Which is a limitation of extracting energy from waves?",
        "लहरों से ऊर्जा निकालने की एक सीमा कौन-सी है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "It is worth it only where waves are very strong",
            "यह वहीं उपयोगी है जहाँ लहरें बहुत तेज़ हों",
          ),
        },
        {
          id: "night",
          label: t(
            "It works only during the day, when the Sun shines",
            "यह केवल दिन में, धूप में चलता है",
          ),
          feedback: t(
            "Waves come day and night, raised by wind. The limit is that they must be very strong.",
            "लहरें दिन-रात आती हैं, हवा से उठती हैं। सीमा यह है कि उन्हें बहुत तेज़ होना चाहिए।",
          ),
        },
        {
          id: "warm",
          label: t(
            "It needs the surface 20 °C warmer than the depths",
            "इसके लिए सतह गहराई से 20 °C गर्म होनी चाहिए",
          ),
          feedback: t(
            "That is the condition for ocean thermal energy. Wave energy needs very strong waves.",
            "यह महासागरीय तापीय ऊर्जा की शर्त है। तरंग ऊर्जा को बहुत तेज़ लहरें चाहिए।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    b.when(q1.on(QuestionSignal.Correct), theBoard.show(q2));
    const log = w.definition(
      t(
        "**Mission log.** ✓ Tidal energy: a dam across a narrow opening, the tide turns a turbine; few sites. ✓ Wave energy: only where waves are very strong. ✓ Ocean thermal: a surface at least 20 °C warmer than 2 km down boils ammonia to turn a turbine. ✓ Geothermal: steam from hot spots of molten rock; cheap to run but few viable sites. ✗ None of these suits a hill village. Next stop: the news on Grandpa's radio.",
        "**मिशन लॉग।** ✓ ज्वारीय ऊर्जा: संकरे मुहाने पर बाँध, ज्वार टरबाइन घुमाता है; कम जगहें। ✓ तरंग ऊर्जा: केवल जहाँ लहरें बहुत तेज़ हों। ✓ महासागरीय तापीय: 2 km नीचे से कम से कम 20 °C गर्म सतह अमोनिया उबालकर टरबाइन घुमाती है। ✓ भूतापीय: पिघली चट्टानों के तप्त स्थलों की भाप; चलाना सस्ता पर उपयोगी जगहें कम। ✗ इनमें से कोई पहाड़ी गाँव के लिए उपयुक्त नहीं। अगला पड़ाव: दादाजी के रेडियो पर ख़बर।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(q2.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), q1, q2, log, space()]);
  },
  { passOn: PassOn.Rules },
);

export const overview = [hook, tidal, waves, geothermal, inLife, yourTurn];

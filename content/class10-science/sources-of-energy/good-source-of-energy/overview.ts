import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, goalQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  EnergyScene,
  Fuel,
  FuelAction,
  FuelDerived,
  Place,
  fuelCompareDef,
} from "@chalk/prop-energy";
import { sceneOn } from "../kit";

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** Who, where, what: the village in the hills, dark at night. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const pic = sceneOn(
    b,
    "pic",
    EnergyScene.VillageArrival,
    "the family arriving at Grandpa's village in the hills at dusk; only a few windows are lit",
  );
  return column([
    w.title(t("Grandpa's village", "दादाजी का गाँव")),
    pic,
    w.body(
      t(
        "The crank torch works, the bill is down, and the summer holidays have begun. Riya, Kabir, Mom and Grandpa take the bus up to **Grandpa's village in the hills**. By the time they arrive it is getting dark, and only a few windows are lit.",
        "क्रैंक टॉर्च चल रही है, बिल कम हो गया है, और गर्मी की छुट्टियाँ शुरू हो गई हैं। रिया, कबीर, मम्मी और दादाजी बस से **पहाड़ों में दादाजी के गाँव** जाते हैं। पहुँचते-पहुँचते अँधेरा होने लगता है, और बस कुछ ही खिड़कियाँ रोशन हैं।",
      ),
    ),
    w.body(
      t(
        "\"The lights come for four hours a day, if we're lucky,\" says Grandpa's neighbour. The village school runs its evening classes by a smoky kerosene lamp. In every kitchen the women cook on a chulha burning wood and dung cakes, and the smoke stings everyone's eyes.",
        '"बिजली दिन में चार घंटे आती है, किस्मत अच्छी हो तो," दादाजी के पड़ोसी कहते हैं। गाँव का स्कूल अपनी शाम की कक्षाएँ धुएँ वाले मिट्टी के तेल के लैंप से चलाता है। हर रसोई में औरतें लकड़ी और उपले जलाने वाले चूल्हे पर खाना बनाती हैं, और धुआँ सबकी आँखों में चुभता है।',
      ),
    ),
    space(),
  ]);
});

/** The sarpanch's request: the mission and the stops. */
const why = page("why", (b) => {
  const w = wordsOn(b);
  const pic = sceneOn(
    b,
    "pic",
    EnergyScene.SmokyChulha,
    "a village kitchen: a woman cooking on a chulha that burns wood and dung cakes, smoke filling the room",
  );
  return column([
    w.title(t("The energy plan", "ऊर्जा योजना")),
    pic,
    w.body(
      t(
        'Next morning the **sarpanch**, the head of the village council, hears that Grandpa\'s grandchildren fixed their own electricity bill. He laughs: "Then make us a plan too. Light for the school, clean fuel for our kitchens. Present it at the panchayat meeting on your last day." Riya opens a new notebook: **the village energy plan**.',
        '**सरपंच**, यानी पंचायत के मुखिया, सुबह सुनते हैं कि दादाजी के पोते-पोती ने अपना बिजली का बिल ठीक किया था। वे हँसते हैं: "तो हमारे लिए भी योजना बनाओ। स्कूल के लिए रोशनी, हमारी रसोइयों के लिए साफ़ ईंधन। अपने आख़िरी दिन पंचायत की बैठक में बताना।" रिया एक नई कॉपी खोलती है: **गाँव की ऊर्जा योजना**।',
      ),
    ),
    w.definition(
      t(
        "**The stops on the way.** (1) What makes a good source of energy: *this lesson*. (2) Fossil fuels and the thermal power plant. (3) Hydro power. (4) Biomass and biogas. (5) Wind. (6) The Sun. (7) The sea and the earth's heat. (8) Nuclear energy. (9) The environment, how long sources last, and the plan.",
        "**रास्ते के पड़ाव।** (1) ऊर्जा का अच्छा स्रोत क्या है: *यह पाठ*। (2) जीवाश्म ईंधन और तापीय विद्युत संयंत्र। (3) जल विद्युत। (4) जैव मात्रा और बायोगैस। (5) पवन। (6) सूर्य। (7) समुद्र और पृथ्वी की ऊष्मा। (8) नाभिकीय ऊर्जा। (9) पर्यावरण, स्रोत कब तक चलेंगे, और योजना।",
      ),
    ),
    w.body(
      t(
        "Kabir is puzzled before they even start: we learnt that energy can't be destroyed. So why is there ever a shortage of it?",
        "शुरू करने से पहले ही कबीर उलझन में है: हमने सीखा था कि ऊर्जा नष्ट नहीं हो सकती। तो फिर उसकी कभी कमी क्यों होती है?",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** The riddle: energy is conserved, but usable energy spreads out. */
const riddle = page(
  "riddle",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      prompt: t(
        "100 mL of water at 75 °C is left in a room at 25 °C. It cools. Can we collect the heat it gave the room and make the water hot again?",
        "75 °C का 100 mL पानी 25 °C के कमरे में छोड़ा जाता है। वह ठंडा हो जाता है। क्या कमरे को दी गई उसकी ऊष्मा इकट्ठा करके पानी फिर से गर्म कर सकते हैं?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "No: the heat has spread through the room in a form we can't use",
            "नहीं: ऊष्मा पूरे कमरे में ऐसे रूप में फैल गई है जिसे हम उपयोग नहीं कर सकते",
          ),
        },
        {
          id: "yes",
          label: t(
            "Yes: the heat is still in the room, so we can gather it back",
            "हाँ: ऊष्मा अब भी कमरे में है, इसलिए उसे वापस इकट्ठा कर सकते हैं",
          ),
          feedback: t(
            "The energy is still there, but spread thinly through the whole room. There is no practical way to gather it back into the water.",
            "ऊर्जा अब भी वहीं है, पर पूरे कमरे में पतली-सी फैली हुई। उसे वापस पानी में इकट्ठा करने का कोई व्यावहारिक तरीका नहीं है।",
          ),
        },
        {
          id: "gone",
          label: t(
            "No: the heat was destroyed as the water cooled down",
            "नहीं: पानी के ठंडा होते समय ऊष्मा नष्ट हो गई",
          ),
          feedback: t(
            "Energy is never destroyed. It went into the room's air, just too spread out to use.",
            "ऊर्जा कभी नष्ट नहीं होती। वह कमरे की हवा में गई, बस उपयोग के लिए बहुत फैली हुई।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("If energy can't be destroyed…", "अगर ऊर्जा नष्ट नहीं होती…")),
      w.body(
        t(
          "In Class 9 we learnt that the **total energy stays the same** in any physical or chemical process; it only changes form. A dropped plate's potential energy becomes mostly sound. A burning candle's chemical energy becomes heat and light. So why do we hear about an energy crisis?",
          "कक्षा 9 में हमने सीखा कि किसी भी भौतिक या रासायनिक प्रक्रम में **कुल ऊर्जा वही रहती है**; बस उसका रूप बदलता है। गिरती प्लेट की स्थितिज ऊर्जा ज़्यादातर ध्वनि बन जाती है। जलती मोमबत्ती की रासायनिक ऊर्जा ऊष्मा और प्रकाश बन जाती है। तो फिर ऊर्जा संकट की बात क्यों होती है?",
        ),
      ),
      w.body(
        t(
          "Try to run the candle backwards: could you gather its heat, light and smoke and turn them back into wax? You can't. The same happens every time.",
          "मोमबत्ती को उल्टा चलाने की कोशिश करो: क्या उसकी ऊष्मा, प्रकाश और धुआँ इकट्ठा करके वापस मोम बना सकते हो? नहीं बना सकते। हर बार यही होता है।",
        ),
      ),
      w.definition(
        t(
          "**Why energy runs out.** Whenever we use energy, the **usable form spreads out into the surroundings in less usable forms**. The total stays the same, but we can't use it again. So any source of energy we use to do work is **used up**.",
          "**ऊर्जा ख़त्म क्यों होती है।** जब भी हम ऊर्जा उपयोग करते हैं, उसका **उपयोगी रूप कम उपयोगी रूपों में आसपास फैल जाता है**। कुल ऊर्जा वही रहती है, पर हम उसे फिर उपयोग नहीं कर सकते। इसलिए काम करने के लिए हम जो भी ऊर्जा स्रोत उपयोग करते हैं, वह **ख़र्च हो जाता** है।",
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** A source of energy, and a fuel (Activity 14.1). */
const source = page(
  "source",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      prompt: t(
        "Riya cycles to school. Where does the energy in her muscles come from?",
        "रिया साइकिल से स्कूल जाती है। उसकी मांसपेशियों की ऊर्जा कहाँ से आती है?",
      ),
      options: [
        { id: "right", label: t("From the food she ate", "उसके खाए भोजन से") },
        {
          id: "cycle",
          label: t("From the cycle's wheels", "साइकिल के पहियों से"),
          feedback: t(
            "The wheels turn because she pushes the pedals. Her muscles get their energy from food.",
            "पहिये इसलिए घूमते हैं क्योंकि वह पैडल दबाती है। उसकी मांसपेशियों को ऊर्जा भोजन से मिलती है।",
          ),
        },
        {
          id: "air",
          label: t("From the air she breathes", "जो हवा वह साँस में लेती है उससे"),
          feedback: t(
            "Air brings the oxygen, but the energy is stored in the food it burns in her cells.",
            "हवा ऑक्सीजन लाती है, पर ऊर्जा उस भोजन में संचित है जो उसकी कोशिकाओं में जलता है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Where energy comes from", "ऊर्जा कहाँ से आती है")),
      w.body(
        t(
          "From waking up to reaching school we use many forms of energy: electricity for the light and the fan, chemical energy of a fuel to cook breakfast or run the bus, and the energy of our muscles to walk or cycle. Each comes from somewhere.",
          "जागने से स्कूल पहुँचने तक हम ऊर्जा के कई रूप उपयोग करते हैं: बत्ती और पंखे के लिए विद्युत, नाश्ता पकाने या बस चलाने के लिए ईंधन की रासायनिक ऊर्जा, और चलने या साइकिल चलाने के लिए हमारी मांसपेशियों की ऊर्जा। हर एक कहीं से आती है।",
        ),
      ),
      w.definition(
        t(
          "**Source of energy and fuel.** A **source of energy** is anything from which we can get energy in a usable form, like coal, flowing water, wind or the Sun. A **fuel** is a substance that we burn to get heat, like wood, LPG or petrol.",
          "**ऊर्जा स्रोत और ईंधन।** **ऊर्जा स्रोत** वह कुछ भी है जिससे हम उपयोगी रूप में ऊर्जा पा सकते हैं, जैसे कोयला, बहता पानी, पवन या सूर्य। **ईंधन** वह पदार्थ है जिसे हम ऊष्मा पाने के लिए जलाते हैं, जैसे लकड़ी, एलपीजी या पेट्रोल।",
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The four qualities of a good source, tested on the fuel chart. */
const qualities = page(
  "qualities",
  (b) => {
    const w = wordsOn(b);
    const chart = b.prop(fuelCompareDef, "chart", {
      fuels: [Fuel.CowDung, Fuel.Wood, Fuel.Charcoal, Fuel.Kerosene, Fuel.Lpg, Fuel.Biogas],
      picked: null,
      place: Place.Village,
      showChecks: true,
      showSmoke: true,
      canPick: true,
      canSetPlace: false,
    });
    b.studentOnly(chart.action(FuelAction.Pick));
    b.standsFor(
      chart,
      "a bar chart of six fuels by heat per gram; tapping a fuel shows its smoke and which of the four good-source checks it passes in the village",
    );
    const goal = goalQuestion(b, {
      about: chart,
      prompt: t(
        "Tap the fuels. Find one that passes all four checks in the village.",
        "ईंधनों पर टैप करो। ऐसा ईंधन ढूँढो जो गाँव में चारों जाँच पास करे।",
      ),
      isMet: chart.derived(FuelDerived.Passed).eq(4),
      solve: [chart.learner(FuelAction.Pick, { fuel: Fuel.Charcoal })],
    });
    const found = w.body(
      t(
        "**Charcoal** passes all four here. LPG gives the most heat but has to be brought up from town in cylinders; biogas is clean but hard to carry; wood and dung cakes give little heat and lots of smoke. Remember charcoal: it comes back in stop 4.",
        "यहाँ **काठ-कोयला** चारों जाँच पास करता है। एलपीजी सबसे ज़्यादा ऊष्मा देती है पर उसे शहर से सिलेंडरों में लाना पड़ता है; बायोगैस साफ़ है पर ढोना मुश्किल; लकड़ी और उपले कम ऊष्मा और बहुत धुआँ देते हैं। काठ-कोयला याद रखो: वह पड़ाव 4 में लौटेगा।",
      ),
      "found",
      { isHidden: true },
    );
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(found));
    return column([
      w.title(t("What makes a source good?", "स्रोत अच्छा कैसे होता है?")),
      w.definition(
        t(
          "**A good source of energy** is one that (1) **does a large amount of work per unit mass or volume**, (2) is **easily available**, (3) is **easy to store and transport**, and, perhaps most importantly, (4) is **economical** (cheap). For a fuel we also ask: does it give a lot of **smoke**?",
          "**ऊर्जा का अच्छा स्रोत** वह है जो (1) **प्रति एकांक द्रव्यमान या आयतन अधिक कार्य करे**, (2) **आसानी से उपलब्ध** हो, (3) **भंडारण और परिवहन में आसान** हो, और, शायद सबसे ज़रूरी, (4) **किफ़ायती** (सस्ता) हो। ईंधन के लिए हम यह भी पूछते हैं: क्या वह बहुत **धुआँ** देता है?",
        ),
      ),
      w.body(
        t(
          "The chart shows how much heat each fuel gives per gram, in kilojoules (kJ). A fuel giving 30 kJ/g or more counts as giving a lot of heat.",
          "चार्ट दिखाता है कि हर ईंधन प्रति ग्राम कितनी ऊष्मा देता है, किलोजूल (kJ) में। 30 kJ/g या अधिक देने वाला ईंधन बहुत ऊष्मा देने वाला माना जाता है।",
        ),
      ),
      chart,
      goal,
      found,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The best choice depends on where you live and the job (Activity 14.2). */
const choose = page(
  "choose",
  (b) => {
    const w = wordsOn(b);
    const chart = b.prop(fuelCompareDef, "chart", {
      fuels: [Fuel.Wood, Fuel.Charcoal, Fuel.Kerosene, Fuel.Lpg, Fuel.Cng, Fuel.Biogas],
      picked: Fuel.Lpg,
      place: Place.City,
      showChecks: true,
      showSmoke: true,
      canPick: true,
      canSetPlace: true,
    });
    b.studentOnly(chart.action(FuelAction.Pick));
    b.studentOnly(chart.action(FuelAction.SetPlace));
    b.standsFor(
      chart,
      "the fuel chart with LPG picked and the place set to a city; the learner can switch between village and city and pick other fuels",
    );
    const ask = choiceQuestion(b, {
      prompt: t(
        "Switch the place between village and city with LPG picked. Which check changes?",
        "एलपीजी चुनकर जगह गाँव और शहर के बीच बदलो। कौन-सी जाँच बदलती है?",
      ),
      options: [
        { id: "right", label: t("Whether it is easy to get", "क्या वह आसानी से मिलता है") },
        {
          id: "heat",
          label: t("How much heat it gives", "वह कितनी ऊष्मा देता है"),
          feedback: t(
            "A gram of LPG gives the same heat anywhere. What changes is whether you can get it there.",
            "एक ग्राम एलपीजी हर जगह उतनी ही ऊष्मा देती है। बदलता यह है कि वहाँ वह मिल सकती है या नहीं।",
          ),
        },
        {
          id: "smoke",
          label: t("How much smoke it gives", "वह कितना धुआँ देता है"),
          feedback: t(
            "LPG burns with little smoke everywhere. What changes is whether it is easy to get.",
            "एलपीजी हर जगह कम धुएँ से जलती है। बदलता यह है कि वह आसानी से मिलती है या नहीं।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("It depends where you live", "यह इस पर निर्भर है कि तुम कहाँ रहते हो")),
      w.body(
        t(
          "Which fuel would you choose for cooking if you lived (a) in a forest, (b) in a remote mountain village or a small island, (c) in New Delhi, (d) five centuries ago? In a forest, wood is free and close by. In Delhi, LPG and CNG come by pipe or cylinder. Five centuries ago, there was no LPG at all.",
          "अगर तुम (a) जंगल में, (b) किसी दूर के पहाड़ी गाँव या छोटे द्वीप पर, (c) नई दिल्ली में, (d) पाँच सौ साल पहले रहते, तो खाना पकाने के लिए कौन-सा ईंधन चुनते? जंगल में लकड़ी मुफ़्त और पास है। दिल्ली में एलपीजी और सीएनजी पाइप या सिलेंडर से आती हैं। पाँच सौ साल पहले एलपीजी थी ही नहीं।",
        ),
      ),
      chart,
      w.definition(
        t(
          "**Choosing a source.** The best source for a task depends on **where you are** and **what the job is**. We might even choose one fuel for cooking and another for heating a room in winter.",
          "**स्रोत चुनना।** किसी काम के लिए सबसे अच्छा स्रोत इस पर निर्भर है कि **तुम कहाँ हो** और **काम क्या है**। हम खाना पकाने के लिए एक ईंधन और सर्दी में कमरा गर्म करने के लिए दूसरा भी चुन सकते हैं।",
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

/** Why the village burns wood, and what's wrong with it. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const pic = sceneOn(
      b,
      "pic",
      EnergyScene.SmokyChulha,
      "the smoky village kitchen again, a chulha burning wood and dung cakes",
    );
    const ask = choiceQuestion(b, {
      prompt: t(
        "Why does the village still cook on wood and dung cakes?",
        "गाँव अब भी लकड़ी और उपलों पर खाना क्यों पकाता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "They are easy to get here and cost almost nothing",
            "वे यहाँ आसानी से मिलते हैं और लगभग मुफ़्त हैं",
          ),
        },
        {
          id: "heat",
          label: t(
            "They give more heat per gram than LPG or kerosene does",
            "वे एलपीजी से ज़्यादा ऊष्मा प्रति ग्राम देते हैं",
          ),
          feedback: t(
            "The chart shows the opposite: wood and dung cakes give far less heat per gram.",
            "चार्ट उल्टा दिखाता है: लकड़ी और उपले प्रति ग्राम कहीं कम ऊष्मा देते हैं।",
          ),
        },
        {
          id: "smoke",
          label: t("They burn cleanly without making any smoke at all", "वे बिना धुआँ बनाए साफ़ जलते हैं"),
          feedback: t(
            "Their big drawback is the smoke. People use them because they are easy to get and cheap.",
            "उनकी बड़ी कमी धुआँ ही है। लोग उन्हें इसलिए उपयोग करते हैं क्योंकि वे आसानी से मिलते और सस्ते हैं।",
          ),
        },
      ],
      answer: "right",
    });
    const note = w.body(
      t(
        "Riya writes the first line of the plan: **a good kitchen fuel for this village must be easy to get here and cheap, but give more heat and much less smoke than wood.** Charcoal and biogas both look promising. Stop 1 done.",
        "रिया योजना की पहली पंक्ति लिखती है: **इस गाँव के लिए रसोई का अच्छा ईंधन यहाँ आसानी से मिलने वाला और सस्ता हो, पर लकड़ी से ज़्यादा ऊष्मा और बहुत कम धुआँ दे।** काठ-कोयला और बायोगैस दोनों आशाजनक लगते हैं। पड़ाव 1 पूरा।",
      ),
      "note",
      { isHidden: true },
    );
    b.when(ask.on(QuestionSignal.Correct), theBoard.show(note));
    return column([w.title(t("Back in the kitchen", "रसोई में वापस")), pic, ask, note, space()]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** In-text Q1–3 and Exercise 8, then the mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const q1 = choiceQuestion(b, {
      name: "q1",
      prompt: t("What is a good fuel?", "अच्छा ईंधन क्या है?"),
      options: [
        {
          id: "right",
          label: t(
            "One that gives much heat, little smoke, and is cheap and easy to get",
            "जो बहुत ऊष्मा, कम धुआँ दे, और सस्ता व आसानी से मिलने वाला हो",
          ),
        },
        {
          id: "fast",
          label: t(
            "One that catches fire fast, burns quickly and needs no air to burn",
            "जो जल्दी आग पकड़े, तेज़ी से जले और जलने के लिए हवा न माँगे",
          ),
          feedback: t(
            "Burning fast isn't the point. A good fuel gives much heat, little smoke, and is cheap and easy to get and store.",
            "तेज़ जलना मुद्दा नहीं है। अच्छा ईंधन बहुत ऊष्मा, कम धुआँ दे, और सस्ता, आसानी से मिलने और रखने वाला हो।",
          ),
        },
        {
          id: "rare",
          label: t(
            "One that is costly and rare, so that people use only a little of it",
            "जो महँगा और दुर्लभ हो, ताकि लोग उसका थोड़ा ही उपयोग करें",
          ),
          feedback: t(
            "Being economical and easy to get are two of the qualities of a good fuel, not drawbacks.",
            "किफ़ायती और आसानी से मिलना अच्छे ईंधन के गुण हैं, कमियाँ नहीं।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const q2 = choiceQuestion(b, {
      name: "q2",
      prompt: t(
        "Which of these is NOT one of the qualities of an ideal source of energy?",
        "इनमें से कौन-सा आदर्श ऊर्जा स्रोत का गुण नहीं है?",
      ),
      options: [
        { id: "right", label: t("Its use spreads energy out", "इसका उपयोग ऊर्जा फैलाता है") },
        {
          id: "work",
          label: t("Much work per unit mass", "प्रति एकांक द्रव्यमान अधिक कार्य"),
          feedback: t(
            "That is one of the qualities. Spreading energy out happens with every source; it isn't a quality.",
            "यह एक गुण है। ऊर्जा का फैलना हर स्रोत के साथ होता है; यह गुण नहीं है।",
          ),
        },
        {
          id: "store",
          label: t("Easy to store and carry", "भंडारण और ढोने में आसान"),
          feedback: t("That is one of the four qualities.", "यह चार गुणों में से एक है।"),
        },
        {
          id: "cheap",
          label: t("Economical to use", "उपयोग में किफ़ायती"),
          feedback: t(
            "That is one of the four qualities, perhaps the most important.",
            "यह चार गुणों में से एक है, शायद सबसे ज़रूरी।",
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
        "**Mission log.** ✓ Energy is never destroyed, but every use spreads it out into forms we can't use again: that is why sources run out. ✓ A good source does a lot of work per kilogram, is easy to get, easy to store and carry, and cheap. ✓ The best choice depends on where you live. Next stop: where the village's electricity comes from.",
        "**मिशन लॉग।** ✓ ऊर्जा कभी नष्ट नहीं होती, पर हर उपयोग उसे ऐसे रूपों में फैला देता है जिन्हें हम फिर उपयोग नहीं कर सकते: इसीलिए स्रोत ख़त्म होते हैं। ✓ अच्छा स्रोत प्रति किलोग्राम बहुत कार्य करता है, आसानी से मिलता है, रखने-ढोने में आसान और सस्ता है। ✓ सबसे अच्छा चुनाव इस पर निर्भर है कि तुम कहाँ रहते हो। अगला पड़ाव: गाँव की बिजली कहाँ से आती है।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(q2.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), q1, q2, log, space()]);
  },
  { passOn: PassOn.Rules },
);

export const overview = [hook, why, riddle, source, qualities, choose, inLife, yourTurn];

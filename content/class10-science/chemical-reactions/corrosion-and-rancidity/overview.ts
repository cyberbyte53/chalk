import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, multiChoiceQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import { ChemistrySceneKind, chemistrySceneDef } from "@chalk/prop-chemistry";

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const gate = b.prop(chemistrySceneDef, "gate", { scene: ChemistrySceneKind.RustyGate });
  b.standsFor(
    gate,
    "Grandpa beside the front gate, its iron bars spotted with reddish-brown rust, a paint tin in his hand",
  );
  return column([
    w.title(t("The last jobs", "आख़िरी काम")),
    gate,
    w.body(
      t(
        "Diwali is two days away. The walls shine, the sparklers are ready. Three jobs are left on Mom's list: the **rusty gate**, the **black anklets and green diyas**, and the **namkeen** that has started to smell odd in its open jar. Grandpa has a tin of paint; Mom has an airtight box. Riya wants to know why they work.",
        "दिवाली दो दिन दूर है। दीवारें चमक रही हैं, फुलझड़ियाँ तैयार हैं। मम्मी की सूची में तीन काम बचे हैं: **ज़ंग लगा गेट**, **काली पायलें और हरे दीये**, और खुले जार में रखा **नमकीन** जिसकी गंध अजीब होने लगी है। दादाजी के पास पेंट का डिब्बा है; मम्मी के पास हवाबंद डिब्बा। रिया जानना चाहती है कि ये काम क्यों करते हैं।",
      ),
    ),
    w.body(
      t(
        "Stop 8, the last: how metals get slowly eaten away, how food goes stale, and how to stop both.",
        "पड़ाव 8, आख़िरी: धातुएँ धीरे-धीरे कैसे खाई जाती हैं, भोजन बासी कैसे होता है, और दोनों को कैसे रोकें।",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

const corrosion = page(
  "corrosion",
  (b) => {
    const w = wordsOn(b);
    const silver = b.prop(chemistrySceneDef, "silver", {
      scene: ChemistrySceneKind.TarnishedSilver,
    });
    b.standsFor(
      silver,
      "a plate with two silver anklets gone black and two copper diyas with green patches, Mom looking at them",
    );
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t("Which of these is corrosion?", "इनमें से कौन-सा संक्षारण है?"),
      options: [
        {
          id: "right",
          label: t("A green coating forming on a copper diya", "ताँबे के दीये पर हरी परत बनना"),
        },
        {
          id: "dust",
          label: t("Dust settling on a steel almirah", "स्टील की अलमारी पर धूल जमना"),
          feedback: t(
            "Dust just sits on top and wipes off. In corrosion the metal itself is attacked and changes.",
            "धूल बस ऊपर बैठती है और पोंछ जाती है। संक्षारण में धातु ख़ुद प्रभावित होकर बदलती है।",
          ),
        },
        {
          id: "bent",
          label: t("A steel spoon getting bent out of shape", "स्टील का चम्मच मुड़कर बेडौल होना"),
          feedback: t(
            "Bending changes the shape, not the substance: a physical change.",
            "मुड़ने से आकार बदलता है, पदार्थ नहीं: भौतिक परिवर्तन।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Metals that get eaten away", "धातुएँ जो खाई जाती हैं")),
      w.body(
        t(
          "New iron articles are shiny, but left for some time in damp air they get coated with a reddish-brown powder: this is the **rusting** of iron. Other metals get tarnished in a similar way: silver gets a black coating, copper a green one.",
          "लोहे की नई चीज़ें चमकदार होती हैं, पर कुछ समय नम हवा में छोड़ने पर उन पर लाल-भूरे चूर्ण की परत चढ़ जाती है: यह लोहे में **ज़ंग लगना** है। दूसरी धातुएँ भी इसी तरह मलिन होती हैं: चाँदी पर काली परत चढ़ती है, ताँबे पर हरी।",
        ),
      ),
      silver,
      w.definition(
        t(
          "**Corrosion.** When a metal is attacked by substances around it, such as moisture and acids, it is said to **corrode**, and the process is **corrosion**. The black coating on silver and the green coating on copper are corrosion; rusting is the corrosion of iron, and it needs oxygen and moisture. Silver's black coat forms differently, with sulphur compounds in the air: the metals chapter explains it.",
          "**संक्षारण।** जब कोई धातु अपने आसपास के पदार्थों, जैसे नमी और अम्लों, से प्रभावित होती है, तो उसका **संक्षारण** होता है, और यह प्रक्रिया **संक्षारण** है। चाँदी पर काली परत और ताँबे पर हरी परत संक्षारण हैं; ज़ंग लगना लोहे का संक्षारण है, और इसके लिए ऑक्सीजन और नमी चाहिए। चाँदी की काली परत अलग तरह से बनती है, हवा में मौजूद सल्फ़र के यौगिकों से: धातुओं वाला अध्याय इसे समझाता है।",
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The cost of corrosion; why paint works. */
const paint = page(
  "paint",
  (b) => {
    const w = wordsOn(b);
    const gate = b.prop(chemistrySceneDef, "gate", { scene: ChemistrySceneKind.RustyGate });
    b.standsFor(gate, "the rusty gate and Grandpa with a paint tin");
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t("Why do we apply paint on iron articles?", "हम लोहे की चीज़ों पर पेंट क्यों लगाते हैं?"),
      options: [
        {
          id: "right",
          label: t(
            "Paint keeps air and moisture away from the iron, so it can't rust",
            "पेंट हवा और नमी को लोहे से दूर रखता है, ताकि ज़ंग न लगे",
          ),
        },
        {
          id: "look",
          label: t(
            "Only to make them look nice and new for Diwali",
            "केवल दिवाली के लिए उन्हें सुंदर और नया दिखाने के लिए",
          ),
          feedback: t(
            "It does look nicer, but the main job is protection: rust needs air and water to reach the iron.",
            "सुंदर तो दिखता है, पर मुख्य काम सुरक्षा है: ज़ंग के लिए हवा और पानी का लोहे तक पहुँचना ज़रूरी है।",
          ),
        },
        {
          id: "react",
          label: t(
            "Paint reacts with rust and turns it back into iron",
            "पेंट ज़ंग से अभिक्रिया करके उसे वापस लोहा बना देता है",
          ),
          feedback: t(
            "Paint doesn't undo rust. It covers the metal so new rust can't form.",
            "पेंट ज़ंग को पलटता नहीं। यह धातु को ढकता है ताकि नया ज़ंग न बने।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Why it matters, and paint", "यह क्यों मायने रखता है, और पेंट")),
      w.body(
        t(
          "Corrosion damages car bodies, bridges, iron railings, ships and every object made of metal, especially iron. Every year an enormous amount of money is spent replacing damaged iron. Rusting needs both **air** (oxygen) and **moisture** to reach the iron's surface.",
          "संक्षारण कार के ढाँचों, पुलों, लोहे की रेलिंग, जहाज़ों और धातु, ख़ासकर लोहे, से बनी हर चीज़ को नुकसान पहुँचाता है। हर साल ख़राब हुए लोहे को बदलने पर बहुत बड़ी रक़म ख़र्च होती है। ज़ंग लगने के लिए लोहे की सतह तक **हवा** (ऑक्सीजन) और **नमी** दोनों का पहुँचना ज़रूरी है।",
        ),
      ),
      gate,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Rancidity; antioxidants, airtight boxes, nitrogen in chip packets. */
const rancid = page(
  "rancid",
  (b) => {
    const w = wordsOn(b);
    const jar = b.prop(chemistrySceneDef, "jar", { scene: ChemistrySceneKind.NamkeenStale });
    b.standsFor(
      jar,
      "an open jar of namkeen giving off a stale smell beside a puffed-up sealed chips packet marked N₂",
    );
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "Why are bags of chips flushed with nitrogen?",
        "चिप्स के पैकेटों में नाइट्रोजन क्यों भरी जाती है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Nitrogen pushes out oxygen, so the oil in the chips isn't oxidised",
            "नाइट्रोजन ऑक्सीजन बाहर कर देती है, इसलिए चिप्स का तेल ऑक्सीकृत नहीं होता",
          ),
        },
        {
          id: "air",
          label: t(
            "To puff the packet up so it looks fuller on the shelf",
            "पैकेट फुलाने के लिए ताकि दुकान में भरा दिखे",
          ),
          feedback: t(
            "It does cushion the chips, but the reason in this chapter is keeping oxygen out.",
            "यह चिप्स को गद्दी भी देती है, पर इस अध्याय का कारण ऑक्सीजन को बाहर रखना है।",
          ),
        },
        {
          id: "flavour",
          label: t(
            "Nitrogen reacts with the oil and adds a salty flavour",
            "नाइट्रोजन तेल से अभिक्रिया करके नमकीन स्वाद जोड़ती है",
          ),
          feedback: t(
            "Nitrogen has no taste. It's there so that nothing reacts with the chips.",
            "नाइट्रोजन का कोई स्वाद नहीं। यह इसलिए है कि चिप्स से कुछ अभिक्रिया न करे।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("When oil goes off", "जब तेल ख़राब हो जाए")),
      w.body(
        t(
          "Have you smelt namkeen or fried snacks left open for a long time? The smell and taste change.",
          "क्या तुमने बहुत समय तक खुले छोड़े नमकीन या तले नाश्ते की गंध ली है? गंध और स्वाद बदल जाते हैं।",
        ),
      ),
      jar,
      w.definition(
        t(
          "**Rancidity.** When fats and oils are **oxidised**, they become **rancid**: their smell and taste change. This is **rancidity**.",
          "**विकृतगंधिता।** जब वसा और तेलों का **उपचयन** होता है, तो वे **विकृतगंधी** हो जाते हैं: उनकी गंध और स्वाद बदल जाते हैं। यह **विकृतगंधिता** है।",
        ),
      ),
      w.definition(
        t(
          "**Slowing it down.** (1) **Antioxidants**, substances that prevent oxidation, are added to foods containing fats and oils. (2) Keeping food in **airtight containers** slows oxidation. (3) Chip makers flush the bags with a gas such as **nitrogen**, which doesn't react with the food.",
          "**इसे धीमा करना।** (1) वसा और तेल वाले भोजन में **प्रतिऑक्सीकारक**, उपचयन रोकने वाले पदार्थ, मिलाए जाते हैं। (2) भोजन को **हवाबंद डिब्बों** में रखने से उपचयन धीमा होता है। (3) चिप्स बनाने वाले पैकेटों में **नाइट्रोजन** जैसी गैस भरते हैं, जो भोजन से अभिक्रिया नहीं करती।",
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

const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const ask = multiChoiceQuestion(b, {
      name: "ask",
      prompt: t(
        "The last jobs get done. Which of them work by keeping oxygen (and moisture) away?",
        "आख़िरी काम हो जाते हैं। इनमें से कौन-से ऑक्सीजन (और नमी) को दूर रखकर काम करते हैं?",
      ),
      options: [
        { id: "paint", label: t("Grandpa paints the gate", "दादाजी गेट पर पेंट करते हैं") },
        {
          id: "box",
          label: t(
            "Mom moves fresh namkeen into an airtight box",
            "मम्मी ताज़ा नमकीन हवाबंद डिब्बे में रखती हैं",
          ),
        },
        {
          id: "polish",
          label: t("Riya polishes the anklets and diyas", "रिया पायलें और दीये चमकाती है"),
          feedback: t(
            "Polishing rubs off the corroded layer that has already formed. It doesn't keep oxygen away, so they'll tarnish again.",
            "चमकाने से पहले से बनी संक्षारित परत रगड़कर हटती है। यह ऑक्सीजन को दूर नहीं रखता, इसलिए वे फिर मलिन होंगी।",
          ),
        },
      ],
      answers: ["paint", "box"],
      missing: t("There's one more: think about the namkeen.", "एक और है: नमकीन के बारे में सोचो।"),
      passes: false,
    });
    const done = w.definition(
      t(
        "**Stop 8 done.** Rust, black silver and green copper are corrosion; stale namkeen is rancidity. Rusting and rancidity are both slow oxidation. Paint keeps air and moisture off the gate, and the airtight box keeps air off the namkeen. The anklets and diyas just need polishing, which rubs the coating off: Mom does it herself on Diwali morning. The old namkeen, sadly, can't be un-oxidised: Kabir is told to throw it away.",
        "**पड़ाव 8 पूरा।** ज़ंग, काली चाँदी और हरा ताँबा संक्षारण हैं; बासी नमकीन विकृतगंधिता है। ज़ंग लगना और विकृतगंधिता दोनों धीमा उपचयन हैं। पेंट गेट से हवा और नमी दूर रखता है, और हवाबंद डिब्बा नमकीन से हवा दूर रखता है। पायलों और दीयों को बस चमकाना है, जिससे परत रगड़कर उतर जाती है: दिवाली की सुबह मम्मी ख़ुद यह करती हैं। पुराने नमकीन का, अफ़सोस, उपचयन पलटा नहीं जा सकता: कबीर से उसे फेंकने को कहा जाता है।",
      ),
      "done",
      { isHidden: true },
    );
    b.when(ask.on(QuestionSignal.Correct), [theBoard.show(done), theBoard.pass()]);
    return column([w.title(t("Finishing the list", "सूची पूरी करना")), ask, done, space()]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const ask1 = choiceQuestion(b, {
      name: "ask1",
      prompt: t(
        "Butter left open in a warm kitchen starts to smell sour and odd. Which word describes this?",
        "गर्म रसोई में खुला छोड़ा मक्खन खट्टी और अजीब गंध देने लगता है। इसे कौन-सा शब्द बताता है?",
      ),
      options: [
        { id: "right", label: t("Rancidity", "विकृतगंधिता") },
        {
          id: "corrosion",
          label: t("Corrosion", "संक्षारण"),
          feedback: t(
            "Corrosion is for metals. Fats and oils going off is rancidity.",
            "संक्षारण धातुओं के लिए है। वसा और तेल का ख़राब होना विकृतगंधिता है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const ask2 = choiceQuestion(b, {
      name: "ask2",
      prompt: t(
        "Both corrosion and rancidity are examples of…",
        "संक्षारण और विकृतगंधिता दोनों किसके उदाहरण हैं?",
      ),
      options: [
        { id: "right", label: t("oxidation", "उपचयन") },
        {
          id: "reduction",
          label: t("reduction", "अपचयन"),
          feedback: t(
            "The metal or the oil gains oxygen: that's oxidation.",
            "धातु या तेल ऑक्सीजन पाते हैं: यह उपचयन है।",
          ),
        },
        {
          id: "decomposition",
          label: t("decomposition", "वियोजन"),
          feedback: t(
            "Nothing is simply breaking apart: oxygen from the air is joining in.",
            "कुछ बस टूट नहीं रहा: हवा की ऑक्सीजन जुड़ रही है।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ Corrosion: a metal attacked by moisture, acids and air (rust, black silver, green copper). ✓ Rancidity: fats and oils oxidised. ✓ Stop them with paint, airtight containers, antioxidants and nitrogen. Every job on the list ✓.",
        "**मिशन लॉग।** ✓ संक्षारण: नमी, अम्लों और हवा से धातु का प्रभावित होना (ज़ंग, काली चाँदी, हरा ताँबा)। ✓ विकृतगंधिता: वसा और तेलों का उपचयन। ✓ इन्हें पेंट, हवाबंद डिब्बों, प्रतिऑक्सीकारकों और नाइट्रोजन से रोको। सूची का हर काम ✓।",
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

/** The finale: Diwali night, and every stop tied together. */
const finale = page("finale", (b) => {
  const w = wordsOn(b);
  const night = b.prop(chemistrySceneDef, "night", { scene: ChemistrySceneKind.DiwaliNight });
  b.standsFor(
    night,
    "Diwali night: the house with shiny white walls, a row of glowing diyas, Grandpa and Mom at the door, Kabir with a sparkler",
  );
  return column([
    w.title(t("Diwali night", "दिवाली की रात")),
    night,
    w.body(
      t(
        "The diyas are lit, the walls gleam, the gate is freshly painted and the namkeen is crisp. Kabir lights a sparkler and announces its equation to the guests. Grandpa was right: every job was chemistry.",
        "दीये जल रहे हैं, दीवारें चमक रही हैं, गेट पर ताज़ा पेंट है और नमकीन कुरकुरा है। कबीर फुलझड़ी जलाकर मेहमानों को उसका समीकरण सुनाता है। दादाजी सही थे: हर काम रसायन था।",
      ),
    ),
    w.definition(
      t(
        "**Mission complete.** (1) A **chemical reaction** makes new substances: watch for a change in state, colour or temperature, or a gas. (2) Write it as a **chemical equation**: reactants → products. (3) **Balance** it with coefficients, so atoms are conserved. (4) **Combination**: the whitewash, CaO + H₂O → Ca(OH)₂, exothermic. (5) **Decomposition**: the lime kiln and the photo album, endothermic. (6) **Displacement** and **double displacement**: Kabir's copper-plated nails, and precipitates. (7) **Oxidation and reduction**: the black pot and the sparkler. (8) **Corrosion and rancidity**: the gate, the anklets and the namkeen.",
        "**मिशन पूरा।** (1) **रासायनिक अभिक्रिया** नए पदार्थ बनाती है: अवस्था, रंग या ताप में परिवर्तन, या गैस पर ध्यान दो। (2) इसे **रासायनिक समीकरण** के रूप में लिखो: अभिकारक → उत्पाद। (3) गुणांकों से इसे **संतुलित** करो, ताकि परमाणु संरक्षित रहें। (4) **संयोजन**: सफ़ेदी, CaO + H₂O → Ca(OH)₂, ऊष्माक्षेपी। (5) **वियोजन**: चूने की भट्टी और फ़ोटो एल्बम, ऊष्माशोषी। (6) **विस्थापन** और **द्विविस्थापन**: कबीर की ताँबा चढ़ी कीलें, और अवक्षेप। (7) **उपचयन और अपचयन**: काला बर्तन और फुलझड़ी। (8) **संक्षारण और विकृतगंधिता**: गेट, पायलें और नमकीन।",
      ),
    ),
    space(),
  ]);
});

/** The pages, in reading order: hook, learn, see it in life, practice, finale. */
export const overview = [hook, corrosion, paint, rancid, inLife, yourTurn, finale];

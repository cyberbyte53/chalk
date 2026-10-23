import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, goalQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  Appliance,
  Fault,
  MagnetismScene,
  WiringAction,
  homeWiringDef,
} from "@chalk/prop-magnetism";
import { sceneOn } from "../kit";

const r = String.raw;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** Mom's iron gives a tingle. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const pic = sceneOn(
    b,
    "pic",
    MagnetismScene.IronTingle,
    "Mom ironing clothes and pulling her hand back from the iron's metal body with a startled look; a loose green wire hangs from the plug",
  );
  return column([
    w.title(t("The iron that bites", "काटने वाली इस्त्री")),
    pic,
    w.body(
      t(
        "With the crank torch ready, one job is left on the list. For a week, Mom's iron has given her a small **tingle** whenever she touches its metal base. Riya opens the plug: one of its three wires, the **green** one, has come loose. Is that wire important if the iron still heats up without it? And what do the three wires in every plug actually do?",
        "क्रैंक टॉर्च तैयार होने के बाद सूची में एक काम बचा है। एक हफ़्ते से मम्मी की इस्त्री का धातु वाला तला छूने पर उन्हें हल्की **झनझनाहट** लगती है। रिया प्लग खोलती है: उसके तीन तारों में से एक, **हरा** वाला, ढीला निकल आया है। अगर इस्त्री उसके बिना भी गर्म होती है, तो क्या वह तार ज़रूरी है? और हर प्लग के तीन तार असल में करते क्या हैं?",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** The mains: live, neutral, earth; meter, main fuse, main switch. */
const mains = page(
  "mains",
  (b) => {
    const w = wordsOn(b);
    const pic = sceneOn(
      b,
      "pic",
      MagnetismScene.MeterBoard,
      "the house meter board: red, black and green wires going into the meter, main fuse and main switch",
    );
    const ask = choiceQuestion(b, {
      prompt: t("Which wire is the live wire?", "जीवित तार कौन-सा है?"),
      options: [
        { id: "right", label: t("The red one", "लाल वाला") },
        {
          id: "black",
          label: t("The black one", "काला वाला"),
          feedback: t("Black is the neutral wire.", "काला उदासीन तार है।"),
        },
        {
          id: "green",
          label: t("The green one", "हरा वाला"),
          feedback: t(
            "Green is the earth wire, the safety wire. Live is red.",
            "हरा भू-तार है, सुरक्षा वाला तार। जीवित लाल है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("What comes into the house", "घर में क्या आता है")),
      pic,
      w.definition(
        t(
          "**The mains.** Electricity reaches homes through the **main supply (mains)**, by overhead poles or underground cables. One wire, usually with **red** insulation, is the **live wire** (NCERT also calls it the *positive* wire). Another, with **black** insulation, is the **neutral wire** (the *negative* wire). With AC these names don't mean the current flows one way: the live wire's potential swings above and below the neutral's, 50 times a second. In India the potential difference between them is **220 V**.",
          "**मुख्य आपूर्ति।** बिजली घरों तक **मुख्य आपूर्ति (मेन्स)** से, ऊपर के खंभों या ज़मीन के नीचे की केबलों से पहुँचती है। एक तार, प्रायः **लाल** विद्युतरोधन वाला, **जीवित तार** है (NCERT इसे *धनात्मक* तार भी कहती है)। दूसरा, **काले** विद्युतरोधन वाला, **उदासीन तार** है (*ऋणात्मक* तार)। AC में इन नामों का अर्थ यह नहीं कि धारा एक ही दिशा में बहती है: जीवित तार का विभव उदासीन तार के विभव से ऊपर-नीचे झूलता रहता है, एक सेकंड में 50 बार। भारत में इनके बीच विभवांतर **220 V** है।",
        ),
      ),
      w.definition(
        t(
          "**The meter board.** The wires pass through a **main fuse** into the **electricity meter**, then through the **main switch** to the line wires of the house.",
          "**मीटर बोर्ड।** तार एक **मुख्य फ़्यूज़** से होकर **बिजली मीटर** में जाते हैं, फिर **मुख्य स्विच** से होकर घर के लाइन तारों तक।",
        ),
      ),
      w.definition(
        t(
          "**The earth wire.** A third wire, with **green** insulation, is the **earth wire**. It is connected to a metal plate buried deep in the ground near the house.",
          "**भू-तार।** तीसरा तार, **हरे** विद्युतरोधन वाला, **भू-तार** है। यह घर के पास ज़मीन में गहरे गड़ी धातु की प्लेट से जुड़ा होता है।",
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Two circuits, appliances in parallel. */
const circuits = page(
  "circuits",
  (b) => {
    const w = wordsOn(b);
    const wiring = b.prop(homeWiringDef, "wiring", {
      on: [Appliance.Bulb, Appliance.Fan],
      canToggle: true,
      showCurrents: true,
    });
    b.studentOnly(wiring.action(WiringAction.Toggle));
    b.standsFor(
      wiring,
      "the house circuit (NCERT Fig 13.20): mains, meter, fuse and switch, then a 5 A circuit with a bulb, fan and TV and a 15 A circuit with a geyser, cooler and iron, all in parallel; the learner switches appliances on and off and reads the currents",
    );
    const ask = choiceQuestion(b, {
      prompt: t(
        "Switch appliances on and off. Why are they connected in parallel?",
        "उपकरणों को चालू-बंद करो। वे पार्श्वक्रम में क्यों जुड़े हैं?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "So each gets the full 220 V and can be switched on or off on its own",
            "ताकि हर एक को पूरे 220 V मिलें और हर एक अलग से चालू-बंद हो सके",
          ),
        },
        {
          id: "less",
          label: t("So that the total current is smaller", "ताकि कुल धारा कम रहे"),
          feedback: t(
            "In parallel the currents add up: watch the reading rise as you switch more on. The reason is equal voltage and separate switching.",
            "पार्श्वक्रम में धाराएँ जुड़ती हैं: और चालू करने पर पाठ्यांक बढ़ता देखो। कारण है बराबर वोल्टेज और अलग-अलग चालू-बंद करना।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Circuits in the house", "घर के परिपथ")),
      w.definition(
        t(
          "**Two circuits.** Usually there are two separate circuits: one with a **15 A** current rating for high-power appliances like geysers and air coolers, and one of **5 A** for bulbs, fans and so on. In each, every appliance is connected across the live and neutral wires, **in parallel**, with its own switch.",
          "**दो परिपथ।** प्रायः दो अलग परिपथ होते हैं: एक **15 A** धारा अनुमतांक वाला, अधिक शक्ति वाले उपकरणों जैसे गीज़र और कूलर के लिए, और एक **5 A** का, बल्ब, पंखे आदि के लिए। हर परिपथ में हर उपकरण जीवित और उदासीन तारों के बीच **पार्श्वक्रम** में जुड़ा होता है, अपने स्विच के साथ।",
        ),
      ),
      wiring,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The earth wire on a metal body. */
const earth = page(
  "earth",
  (b) => {
    const w = wordsOn(b);
    const wiring = b.prop(homeWiringDef, "wiring", {
      on: [Appliance.Iron],
      fault: Fault.Leak,
      hasEarth: false,
      canToggle: false,
      canEarth: true,
      showCurrents: true,
    });
    b.studentOnly(wiring.action(WiringAction.SetEarth));
    b.studentOnly(wiring.action(WiringAction.Touch));
    b.studentOnly(wiring.action(WiringAction.ReplaceFuse));
    b.standsFor(
      wiring,
      "the house circuit with the iron's live wire touching its metal body and no earth wire; the learner can touch the iron, connect the earth wire, and replace the fuse",
    );
    const goal = goalQuestion(b, {
      about: wiring,
      prompt: t(
        "The live wire inside the iron is touching its metal body. Touch the iron to see the danger, then connect the earth wire.",
        "इस्त्री के अंदर जीवित तार उसके धातु के तले को छू रहा है। ख़तरा देखने के लिए इस्त्री छुओ, फिर भू-तार जोड़ो।",
      ),
      isMet: wiring.field("hasEarth").eq(true),
      solve: [wiring.learner(WiringAction.SetEarth, { hasEarth: true })],
    });
    const ask = choiceQuestion(b, {
      name: "job",
      prompt: t(
        "With the earth wire connected, the 15 A fuse melts. Why is that safe?",
        "भू-तार जोड़ने पर 15 A का फ़्यूज़ पिघल जाता है। यह सुरक्षित क्यों है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "The leak runs to earth through the low-resistance wire, not through a person, and the big current melts the fuse and cuts the supply",
            "रिसाव कम प्रतिरोध वाले तार से धरती में जाता है, किसी व्यक्ति से नहीं, और बड़ी धारा फ़्यूज़ पिघलाकर आपूर्ति काट देती है",
          ),
        },
        {
          id: "store",
          label: t("The earth wire stores the extra electricity", "भू-तार अतिरिक्त बिजली जमा करता है"),
          feedback: t(
            "Nothing is stored. The earth wire is an easy path to the ground, which keeps the body at the earth's potential.",
            "कुछ जमा नहीं होता। भू-तार ज़मीन तक एक आसान रास्ता है, जो तले को पृथ्वी के विभव पर रखता है।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
    });
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(ask));
    return column([
      w.title(t("Why the earth wire matters", "भू-तार क्यों ज़रूरी है")),
      wiring,
      goal,
      w.definition(
        t(
          "**Earthing.** Appliances with a **metal body**, like an electric iron, toaster, table fan or refrigerator, have their body connected to the **earth wire**. It gives a **low-resistance path** for any current that leaks to the body, and keeps the body at the **potential of the earth**, so the user does not get a severe shock.",
          "**भू-संपर्कण।** **धातु के खोल** वाले उपकरणों, जैसे इस्त्री, टोस्टर, टेबल पंखा या फ़्रिज, का खोल **भू-तार** से जुड़ा होता है। यह खोल तक रिसने वाली किसी भी धारा को **कम प्रतिरोध का रास्ता** देता है, और खोल को **पृथ्वी के विभव** पर रखता है, ताकि उपयोगकर्ता को गंभीर झटका न लगे।",
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Short circuits and overloading; the fuse. */
const overload = page(
  "overload",
  (b) => {
    const w = wordsOn(b);
    const wiring = b.prop(homeWiringDef, "wiring", {
      on: [Appliance.Geyser, Appliance.Iron],
      canToggle: true,
      canFault: true,
      showCurrents: true,
    });
    b.studentOnly(wiring.action(WiringAction.Toggle));
    b.studentOnly(wiring.action(WiringAction.SetFault));
    b.studentOnly(wiring.action(WiringAction.ReplaceFuse));
    b.standsFor(
      wiring,
      "the house circuit; the learner can switch appliances on, make a short circuit in the iron, and replace a melted fuse",
    );
    const ask = choiceQuestion(b, {
      prompt: t(
        "Make a short circuit in the iron. At the moment of a short circuit, the current in the circuit…",
        "इस्त्री में लघुपथन करो। लघुपथन के क्षण पर परिपथ में धारा…",
      ),
      options: [
        { id: "right", label: t("increases heavily", "बहुत अधिक बढ़ जाती है") },
        {
          id: "drops",
          label: t("reduces a lot", "बहुत कम हो जाती है"),
          feedback: t(
            "Live touching neutral leaves almost no resistance in the path, so the current shoots up.",
            "जीवित के उदासीन को छूने से रास्ते में लगभग कोई प्रतिरोध नहीं रहता, इसलिए धारा एकदम बढ़ जाती है।",
          ),
        },
        {
          id: "same",
          label: t("does not change", "नहीं बदलती"),
          feedback: t(
            "Watch the fuse: the current becomes so big that it melts at once.",
            "फ़्यूज़ देखो: धारा इतनी बड़ी हो जाती है कि वह तुरंत पिघल जाता है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Too much current", "बहुत अधिक धारा")),
      w.definition(
        t(
          "**Short circuit and overloading.** If the live and neutral wires come into direct contact (damaged insulation, or a fault in an appliance), the current suddenly becomes very large: a **short circuit**. **Overloading** can also come from an accidental rise in the supply voltage, or from connecting **too many appliances to one socket**.",
          "**लघुपथन और अतिभारण।** अगर जीवित और उदासीन तार सीधे संपर्क में आ जाएँ (ख़राब विद्युतरोधन, या उपकरण में ख़राबी), तो धारा अचानक बहुत बड़ी हो जाती है: **लघुपथन**। **अतिभारण** आपूर्ति वोल्टेज के अचानक बढ़ने से, या **एक ही सॉकेट में बहुत सारे उपकरण** जोड़ने से भी हो सकता है।",
        ),
      ),
      wiring,
      ask,
      w.definition(
        t(
          "**The fuse.** The fuse is the most important safety device. When too large a current flows, Joule heating (Ch 12) **melts the fuse wire** and breaks the circuit, which protects the wiring and the appliances.",
          "**फ़्यूज़।** फ़्यूज़ सबसे महत्वपूर्ण सुरक्षा युक्ति है। जब बहुत बड़ी धारा बहती है, जूल तापन (अध्याय 12) **फ़्यूज़ के तार को पिघला** देता है और परिपथ तोड़ देता है, जिससे वायरिंग और उपकरण बचते हैं।",
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** In-text Q2: a 2 kW oven on a 5 A circuit. */
const oven = page(
  "oven",
  (b) => {
    const w = wordsOn(b);
    const wiring = b.prop(homeWiringDef, "wiring", {
      on: [],
      oven: "none",
      canToggle: false,
      canPlugOven: true,
      showCurrents: true,
    });
    b.studentOnly(wiring.action(WiringAction.PlugOven));
    b.studentOnly(wiring.action(WiringAction.ReplaceFuse));
    b.standsFor(
      wiring,
      "the house circuit with a 2 kW oven that the learner can plug into the 5 A circuit or the 15 A circuit",
    );
    const ask = choiceQuestion(b, {
      prompt: t(
        "A 2 kW oven is run on a 220 V domestic circuit rated 5 A. What do you expect? (Try it.)",
        "2 kW का एक ओवन 5 A अनुमतांक वाले 220 V घरेलू परिपथ पर चलाया जाता है। क्या होगा? (आज़माओ।)",
      ),
      options: [
        {
          id: "right",
          label: t(
            "The fuse melts: the oven needs about 9 A",
            "फ़्यूज़ पिघल जाता है: ओवन को लगभग 9 A चाहिए",
          ),
        },
        {
          id: "slow",
          label: t("The oven works, just more slowly", "ओवन चलता है, बस धीरे"),
          feedback: t(
            r`The oven draws $I = P/V = 2000/220 \approx 9.1$ A, almost twice the circuit's 5 A, so the fuse melts.`,
            r`ओवन $I = P/V = 2000/220 \approx 9.1$ A लेता है, परिपथ के 5 A का लगभग दुगना, इसलिए फ़्यूज़ पिघल जाता है।`,
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("The oven on the wrong circuit", "ग़लत परिपथ पर ओवन")),
      wiring,
      ask,
      w.body(
        t(
          r`The current the oven draws is $$I = \frac{P}{V} = \frac{2000 \text{ W}}{220 \text{ V}} \approx 9.1 \text{ A}$$ That is more than the 5 A rating, so the fuse melts. On the 15 A circuit it works safely.`,
          r`ओवन जो धारा लेता है वह है $$I = \frac{P}{V} = \frac{2000 \text{ W}}{220 \text{ V}} \approx 9.1 \text{ A}$$ यह 5 A के अनुमतांक से अधिक है, इसलिए फ़्यूज़ पिघल जाता है। 15 A परिपथ पर यह सुरक्षित चलता है।`,
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

/** Mom's iron, explained and fixed. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const pic = sceneOn(
      b,
      "pic",
      MagnetismScene.IronTingle,
      "Mom's iron with its loose green wire",
    );
    const ask = choiceQuestion(b, {
      name: "tingle",
      prompt: t(
        "So why did Mom feel a tingle from the iron?",
        "तो मम्मी को इस्त्री से झनझनाहट क्यों लगी?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "A little current leaked to the metal body, and with the earth wire loose it went through her instead",
            "थोड़ी धारा धातु के तले तक रिसी, और भू-तार ढीला होने से वह उनके शरीर से होकर गई",
          ),
        },
        {
          id: "hot",
          label: t("The iron was too hot", "इस्त्री बहुत गर्म थी"),
          feedback: t(
            "Heat burns; it doesn't tingle. A tingle is a small current through the body.",
            "गर्मी जलाती है; झनझनाती नहीं। झनझनाहट शरीर से होकर बहती छोटी धारा है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const fix = choiceQuestion(b, {
      name: "fix",
      prompt: t(
        "What should Riya do before Mom uses the iron again?",
        "मम्मी के फिर से इस्त्री उपयोग करने से पहले रिया को क्या करना चाहिए?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Reconnect the green earth wire firmly, and get the leak inside the iron repaired",
            "हरे भू-तार को मज़बूती से फिर जोड़े, और इस्त्री के अंदर का रिसाव ठीक करवाए",
          ),
        },
        {
          id: "cut",
          label: t(
            "Cut the green wire off; the iron works without it",
            "हरा तार काट दे; इस्त्री उसके बिना चलती है",
          ),
          feedback: t(
            "The iron heats without it, but the earth wire is what keeps the body safe. It must be connected.",
            "इस्त्री उसके बिना गर्म होती है, पर भू-तार ही तले को सुरक्षित रखता है। वह जुड़ा होना चाहिए।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    b.when(ask.on(QuestionSignal.Correct), theBoard.show(fix));
    b.when(fix.on(QuestionSignal.Correct), theBoard.pass());
    return column([w.title(t("The iron fixed", "इस्त्री ठीक")), pic, ask, fix, space()]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Worked: in-text Q1, Q3 and Exercises 17, 18. */
const examples = page("examples", (b) => {
  const w = wordsOn(b);
  return column([
    w.title(t("Worked answers", "हल किए गए उत्तर")),
    w.body(
      t(
        "**Name two safety measures used in electric circuits and appliances.** (1) An **electric fuse** in each circuit. (2) **Earthing** the metal bodies of appliances with the earth wire.",
        "**विद्युत परिपथों और उपकरणों में उपयोग होने वाले दो सुरक्षा उपाय बताओ।** (1) हर परिपथ में **विद्युत फ़्यूज़**। (2) भू-तार से उपकरणों के धातु के खोलों का **भू-संपर्कण**।",
      ),
    ),
    w.body(
      t(
        "**What precaution should be taken to avoid overloading?** Don't connect too many appliances to one socket, use high-power appliances on the 15 A circuit, and use a fuse of the right rating.",
        "**अतिभारण से बचने के लिए क्या सावधानी रखनी चाहिए?** एक सॉकेट में बहुत सारे उपकरण मत जोड़ो, अधिक शक्ति वाले उपकरण 15 A परिपथ पर चलाओ, और सही अनुमतांक का फ़्यूज़ लगाओ।",
      ),
    ),
    w.body(
      t(
        "**When does a short circuit occur?** When the live wire and the neutral wire come into direct contact, because the insulation is damaged or there is a fault in an appliance.",
        "**लघुपथन कब होता है?** जब जीवित तार और उदासीन तार सीधे संपर्क में आ जाएँ, क्योंकि विद्युतरोधन ख़राब हो या किसी उपकरण में ख़राबी हो।",
      ),
    ),
    w.body(
      t(
        "**What is the function of an earth wire? Why must metallic appliances be earthed?** The earth wire gives a low-resistance path to the ground for any current that leaks to an appliance's metal body. It keeps the body at the earth's potential, so a person touching it does not get a severe shock.",
        "**भू-तार का क्या काम है? धातु के उपकरणों का भू-संपर्कण क्यों ज़रूरी है?** भू-तार उपकरण के धातु के खोल तक रिसने वाली किसी भी धारा को ज़मीन तक कम प्रतिरोध का रास्ता देता है। यह खोल को पृथ्वी के विभव पर रखता है, ताकि उसे छूने वाले को गंभीर झटका न लगे।",
      ),
    ),
    space(),
  ]);
});

/** Your turn, then the mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      prompt: t(
        "True or false: a wire with green insulation is usually the live wire of an electric supply.",
        "सही या ग़लत: हरे विद्युतरोधन वाला तार प्रायः विद्युत आपूर्ति का जीवित तार होता है।",
      ),
      options: [
        {
          id: "true",
          label: t("True", "सही"),
          feedback: t(
            "Green is the earth wire. The live wire is red.",
            "हरा भू-तार है। जीवित तार लाल है।",
          ),
        },
        { id: "right", label: t("False", "ग़लत") },
      ],
      answer: "right",
      keepOrder: true,
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ Live (red), neutral (black), 220 V; earth (green) to a plate in the ground. ✓ Appliances in parallel on 5 A and 15 A circuits. ✓ The earth wire protects metal bodies; the fuse melts on a short circuit or overload. ✓ Mom's iron is safe again. Mission almost done.",
        "**मिशन लॉग।** ✓ जीवित (लाल), उदासीन (काला), 220 V; भू-तार (हरा) ज़मीन की प्लेट तक। ✓ 5 A और 15 A परिपथों पर उपकरण पार्श्वक्रम में। ✓ भू-तार धातु के खोलों को बचाता है; लघुपथन या अतिभारण पर फ़्यूज़ पिघलता है। ✓ मम्मी की इस्त्री फिर सुरक्षित है। मिशन लगभग पूरा।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(ask.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), ask, log, space()]);
  },
  { passOn: PassOn.Rules },
);

/** The finale: the next power cut, and all eight stops. */
const finale = page("finale", (b) => {
  const w = wordsOn(b);
  const pic = sceneOn(
    b,
    "pic",
    MagnetismScene.CrankTorch,
    "the next power cut: Kabir cranks the home-made torch and its beam lights up the room while the family smiles",
  );
  return column([
    w.title(t("Never again in the dark", "फिर कभी अँधेरा नहीं")),
    pic,
    w.body(
      t(
        'Two weeks later, the lights go out once more. Nobody hunts for cells. Kabir grabs the crank torch and turns the handle, and a beam lights up the room. Grandpa laughs: "My father\'s lamp, only better."',
        'दो हफ़्ते बाद बत्ती एक बार फिर चली जाती है। कोई सेल नहीं ढूँढता। कबीर क्रैंक टॉर्च उठाकर हैंडल घुमाता है, और एक किरण कमरा रोशन कर देती है। दादाजी हँसते हैं: "मेरे पिताजी का लैंप, बस और बेहतर।"',
      ),
    ),
    w.definition(
      t(
        "**Mission complete.** (1) A **magnet** has a field, shown by field lines from N to S. (2) A **current** makes a field: circles round a straight wire, by the right-hand thumb rule. (3) A **solenoid** acts like a bar magnet; with a soft iron core it is an **electromagnet**. (4) A magnet **pushes on a current**: Fleming's left-hand rule. (5) The **motor** uses that push, with a split ring to keep it turning. (6) A changing field **induces a current**: Fleming's right-hand rule. (7) The **generator** turns motion into AC (or DC with a split ring). (8) At home: live, neutral and earth, appliances in parallel, and the fuse.",
        "**मिशन पूरा।** (1) **चुंबक** का एक क्षेत्र होता है, जिसे N से S की क्षेत्र रेखाएँ दिखाती हैं। (2) **धारा** क्षेत्र बनाती है: सीधे तार के चारों ओर वृत्त, दक्षिण-हस्त अंगुष्ठ नियम से। (3) **परिनालिका** छड़ चुंबक की तरह व्यवहार करती है; नरम लोहे के क्रोड के साथ वह **विद्युत चुंबक** है। (4) चुंबक **धारा को धकेलता है**: फ़्लेमिंग का वामहस्त नियम। (5) **मोटर** उसी धक्के का उपयोग करती है, विभक्त वलय से घूमती रहती है। (6) बदलता क्षेत्र **धारा प्रेरित करता है**: फ़्लेमिंग का दक्षिण-हस्त नियम। (7) **जनित्र** गति को AC में बदलता है (विभक्त वलय से DC)। (8) घर में: जीवित, उदासीन और भू-तार, पार्श्वक्रम में उपकरण, और फ़्यूज़।",
      ),
    ),
    space(),
  ]);
});

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [
  hook,
  mains,
  circuits,
  earth,
  overload,
  oven,
  inLife,
  examples,
  yourTurn,
  finale,
];

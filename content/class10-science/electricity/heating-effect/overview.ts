import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, goalQuestion, wordsOn } from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  Appliance,
  ElectricityScene,
  HeatAction,
  HeatMode,
  jouleHeatingDef,
} from "@chalk/prop-electricity";
import { sceneOn } from "../kit";

const r = String.raw;

/* Hook */

const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const pic = sceneOn(
    b,
    "pic",
    ElectricityScene.FuseBlown,
    "the house dark at night; Grandpa reaches up to the fuse box, while an iron, a heater and the geyser stand switched off",
  );
  return column([
    w.title(t("The night the fuse blew", "जिस रात फ़्यूज़ उड़ा")),
    pic,
    w.body(
      t(
        'A cold Sunday evening. Grandpa\'s heater is on, Mom is ironing school uniforms, and Kabir switches on the geyser for a hot bath. Snap: the whole house goes dark. Grandpa takes a torch to the fuse box: **"The fuse wire has melted."** Melted? From electricity? Eighth stop: **the heating effect of electric current**.',
        'ठंडी रविवार की शाम। दादाजी का हीटर चल रहा है, मम्मी स्कूल की वर्दियाँ इस्त्री कर रही हैं, और कबीर गर्म पानी से नहाने के लिए गीज़र चालू करता है। चटाक: पूरा घर अँधेरा। दादाजी टॉर्च लेकर फ़्यूज़ बॉक्स तक जाते हैं: **"फ़्यूज़ का तार पिघल गया।"** पिघल गया? बिजली से? आठवाँ पड़ाव: **विद्युत धारा का तापीय प्रभाव**।',
      ),
    ),
    space(),
  ]);
});

/* Learn */

/** Where the cell's energy goes: P = VI, H = VIt = I²Rt. */
const heat = page(
  "heat",
  (b) => {
    const w = wordsOn(b);
    const coil = b.prop(jouleHeatingDef, "coil", {
      mode: HeatMode.Coil,
      amps: 2,
      ohms: 10,
      seconds: 60,
      showWorking: true,
      canSetAmps: false,
      canSetOhms: false,
      canSetSeconds: false,
    });
    b.studentOnly(coil.action(HeatAction.Run));
    b.standsFor(
      coil,
      "a 10 Ω resistor coil in a beaker of water carrying 2 A, with a thermometer; running it for 60 s warms the water",
    );
    const ask = choiceQuestion(b, {
      prompt: t(
        "Run it. In a circuit of resistors only, where does all the energy from the source go?",
        "चलाओ। केवल प्रतिरोधकों वाले परिपथ में स्रोत की सारी ऊर्जा कहाँ जाती है?",
      ),
      options: [
        { id: "right", label: t("It becomes heat in the resistors", "प्रतिरोधकों में गर्मी बन जाती है") },
        {
          id: "charge",
          label: t("It is stored in the charges", "आवेशों में जमा हो जाती है"),
          feedback: t(
            "The charges come round again with nothing extra. The energy leaves as heat: look at the thermometer.",
            "आवेश बिना कुछ अतिरिक्त लिए फिर घूम आते हैं। ऊर्जा गर्मी बनकर निकलती है: थर्मामीटर देखो।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Current makes heat", "धारा गर्मी बनाती है")),
      w.body(
        t(
          "A cell keeps a current going by spending energy (stop 2). Where does that energy go? Some may do useful work, like turning a fan's blades. But in a **purely resistive circuit**, one with only resistors joined to the source, all of it ends up as heat.",
          "सेल ऊर्जा ख़र्च करके धारा चलाए रखता है (पड़ाव 2)। वह ऊर्जा कहाँ जाती है? कुछ उपयोगी काम कर सकती है, जैसे पंखे के ब्लेड घुमाना। पर **शुद्ध प्रतिरोधी परिपथ** में, जिसमें स्रोत से केवल प्रतिरोधक जुड़े हों, सारी ऊर्जा गर्मी बन जाती है।",
        ),
      ),
      w.definition(
        t(
          r`**Heating effect.** Moving a charge $Q$ through a potential difference $V$ takes work $VQ$. If that happens in time $t$, with $Q = It$, the energy the source supplies is $$H = VIt$$ In a resistor it all becomes heat. Using $V = IR$: $$H = I^2Rt$$ This is **Joule's law of heating**. Turning electrical energy into heat in a resistor is the **heating effect of electric current**.`,
          r`**तापीय प्रभाव।** आवेश $Q$ को विभवांतर $V$ से होकर ले जाने में कार्य $VQ$ लगता है। यदि यह समय $t$ में हो, जहाँ $Q = It$, तो स्रोत द्वारा दी गई ऊर्जा है $$H = VIt$$ प्रतिरोधक में यह सब गर्मी बन जाती है। $V = IR$ लगाकर: $$H = I^2Rt$$ यह **जूल का तापन नियम** है। प्रतिरोधक में विद्युत ऊर्जा का गर्मी में बदलना **विद्युत धारा का तापीय प्रभाव** है।`,
        ),
      ),
      coil,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The three proportionalities. */
const factors = page(
  "factors",
  (b) => {
    const w = wordsOn(b);
    const coil = b.prop(jouleHeatingDef, "coil", {
      mode: HeatMode.Coil,
      amps: 2,
      ohms: 10,
      seconds: 60,
      showWorking: true,
      canSetAmps: true,
      canSetOhms: true,
      canSetSeconds: true,
    });
    b.studentOnly(coil.action(HeatAction.SetAmps));
    b.studentOnly(coil.action(HeatAction.SetOhms));
    b.studentOnly(coil.action(HeatAction.SetSeconds));
    b.studentOnly(coil.action(HeatAction.Run));
    b.standsFor(
      coil,
      "the coil in water with its current, resistance and time each adjustable; the heat H = I²Rt is worked out",
    );
    const ask = choiceQuestion(b, {
      prompt: t(
        "Change the current from 2 A to 4 A, keeping R and t the same. What happens to the heat?",
        "R और t वही रखते हुए धारा को 2 A से 4 A करो। गर्मी का क्या होता है?",
      ),
      options: [
        { id: "right", label: t("It becomes 4 times as much", "4 गुना हो जाती है") },
        {
          id: "double",
          label: t("It doubles", "दोगुनी हो जाती है"),
          feedback: t(
            "The current is squared: (2 × I)² = 4 × I². Read the working.",
            "धारा का वर्ग होता है: (2 × I)² = 4 × I²। हल पढ़ो।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("What the heat depends on", "गर्मी किस पर निर्भर है")),
      w.definition(
        t(
          r`**Reading $H = I^2Rt$.** The heat produced in a resistor is (i) directly proportional to the **square of the current**, for a given resistance; (ii) directly proportional to the **resistance**, for a given current; (iii) directly proportional to the **time** the current flows.`,
          r`**$H = I^2Rt$ को पढ़ना।** प्रतिरोधक में बनी गर्मी (i) दिए गए प्रतिरोध पर **धारा के वर्ग** के अनुक्रमानुपाती है; (ii) दी गई धारा पर **प्रतिरोध** के अनुक्रमानुपाती है; (iii) धारा बहने के **समय** के अनुक्रमानुपाती है।`,
        ),
      ),
      coil,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Cord and element: same current, different R. */
const cord = page(
  "cord",
  (b) => {
    const w = wordsOn(b);
    const heater = b.prop(jouleHeatingDef, "heater", { mode: HeatMode.Cord, showWorking: true });
    b.standsFor(
      heater,
      "a heater on 220 V: the same current flows through a 0.05 Ω copper cord and a 24 Ω nichrome element (a 2000 W heater); the element glows red hot and the cord stays cool",
    );
    const ask = choiceQuestion(b, {
      prompt: t(
        "Why does the heater's cord not glow while its element does?",
        "हीटर का तार क्यों नहीं चमकता जबकि उसका तत्व चमकता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Same current, but the element's resistance is far bigger, so it makes far more heat (H = I²Rt)",
            "धारा वही, पर तत्व का प्रतिरोध कहीं ज़्यादा है, इसलिए वह कहीं ज़्यादा गर्मी बनाता है (H = I²Rt)",
          ),
        },
        {
          id: "less",
          label: t("Less current flows in the cord", "तार में कम धारा बहती है"),
          feedback: t(
            "The cord and element are in series, so the same current flows through both. The difference is R.",
            "तार और तत्व श्रेणीक्रम में हैं, इसलिए दोनों में वही धारा बहती है। अंतर R का है।",
          ),
        },
      ],
      answer: "right",
    });
    const why = w.body(
      t(
        "Same current through both, but H = I²Rt grows with R. The 24 Ω element makes about 500 times the heat of the 0.05 Ω cord. That's why the cord is thick copper: Stop 5's coil-and-cord answer, now in numbers.",
        "दोनों में वही धारा, पर H = I²Rt, R के साथ बढ़ता है। 24 Ω का तत्व 0.05 Ω के तार से लगभग 500 गुना गर्मी बनाता है। इसीलिए तार मोटे ताँबे का है: पाँचवें पड़ाव का कुंडली-और-तार वाला उत्तर, अब संख्याओं में।",
      ),
      "why",
      { isHidden: true },
    );
    b.when(ask.on(QuestionSignal.Correct), theBoard.show(why));
    return column([
      w.title(t("Why the cord stays cool", "तार ठंडा क्यों रहता है")),
      heater,
      ask,
      why,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Uses: heaters, bulbs (tungsten), and why. */
const uses = page(
  "uses",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      prompt: t(
        "Why is tungsten used almost only for the filaments of electric bulbs?",
        "बिजली के बल्बों के तंतु के लिए लगभग केवल टंगस्टन ही क्यों उपयोग होता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "It is strong and has a very high melting point (3380 °C), so it can glow white hot without melting",
            "यह मज़बूत है और इसका गलनांक बहुत ऊँचा (3380 °C) है, इसलिए यह पिघले बिना सफ़ेद-गर्म चमक सकता है",
          ),
        },
        {
          id: "copper",
          label: t("It is the best conductor", "यह सबसे अच्छा चालक है"),
          feedback: t(
            "Silver and copper conduct better. A filament must get extremely hot and survive, which needs a very high melting point.",
            "चाँदी और ताँबा बेहतर चालक हैं। तंतु को बहुत गर्म होकर भी टिके रहना है, जिसके लिए बहुत ऊँचा गलनांक चाहिए।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Heat on purpose", "जानबूझकर गर्मी")),
      w.body(
        t(
          "The heating is often unwanted: it wastes energy and warms up parts. But many devices use it on purpose: the electric iron, toaster, oven, kettle and heater all work by Joule heating.",
          "गर्मी अक्सर अनचाही होती है: ऊर्जा बर्बाद करती है और भागों को गर्म करती है। पर कई युक्तियाँ जानबूझकर इसका उपयोग करती हैं: बिजली की इस्त्री, टोस्टर, ओवन, केतली और हीटर सब जूल तापन से चलते हैं।",
        ),
      ),
      w.definition(
        t(
          "**The bulb.** A bulb makes light by heating: its filament gets so hot that it glows. It must keep as much heat as possible and must not melt, so it is made of **tungsten** (melting point 3380 °C), held on insulating supports. Bulbs are filled with chemically inactive **nitrogen** and **argon** to make the filament last. Even so, most of the power becomes heat; only a little becomes light.",
          "**बल्ब।** बल्ब गर्म करके रोशनी बनाता है: उसका तंतु इतना गर्म होता है कि चमकने लगता है। उसे जितनी हो सके गर्मी रोकनी है और पिघलना नहीं है, इसलिए वह **टंगस्टन** (गलनांक 3380 °C) का बनता है, विद्युतरोधी आधारों पर टिका। तंतु की उम्र बढ़ाने के लिए बल्बों में रासायनिक रूप से निष्क्रिय **नाइट्रोजन** और **आर्गन** भरी जाती है। फिर भी ज़्यादातर शक्ति गर्मी बनती है; केवल थोड़ी रोशनी बनती है।",
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The fuse. */
const fuse = page(
  "fuse",
  (b) => {
    const w = wordsOn(b);
    const mains = b.prop(jouleHeatingDef, "mains", {
      mode: HeatMode.Fuse,
      on: [],
      rating: 15,
      isBlown: false,
      canSwitch: true,
      canSetRating: false,
    });
    b.studentOnly(mains.action(HeatAction.Toggle));
    b.studentOnly(mains.action(HeatAction.ReplaceFuse));
    b.standsFor(
      mains,
      "the house's 220 V mains through a 15 A fuse, with a bulb, fan, TV, iron, heater and geyser that can be switched on one by one; the line current is shown",
    );
    const goal = goalQuestion(b, {
      about: mains,
      prompt: t(
        "Recreate Sunday night: switch on the heater, the iron and the geyser.",
        "रविवार की रात दोहराओ: हीटर, इस्त्री और गीज़र चालू करो।",
      ),
      isMet: mains.field("isBlown").eq(true),
      solve: [
        mains.learner(HeatAction.Toggle, { appliance: Appliance.Heater }),
        mains.learner(HeatAction.Toggle, { appliance: Appliance.Iron }),
        mains.learner(HeatAction.Toggle, { appliance: Appliance.Geyser }),
      ],
    });
    const found = w.body(
      t(
        "Heater, iron and geyser: 2000 W + 1000 W + 2000 W = 5000 W. On 220 V that draws 5000 ÷ 220 ≈ 22.7 A, more than the fuse's 15 A. The fuse wire got hot enough to melt, and broke the circuit before the house wiring could overheat.",
        "हीटर, इस्त्री और गीज़र: 2000 W + 1000 W + 2000 W = 5000 W। 220 V पर यह 5000 ÷ 220 ≈ 22.7 A लेता है, फ़्यूज़ के 15 A से ज़्यादा। फ़्यूज़ का तार इतना गर्म हुआ कि पिघल गया, और घर की वायरिंग ज़्यादा गर्म होने से पहले परिपथ तोड़ दिया।",
      ),
      "found",
      { isHidden: true },
    );
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(found));
    return column([
      w.title(t("The fuse", "फ़्यूज़")),
      w.body(
        t(
          "First, a shortcut. From H = VIt, the energy a device uses each second is V × I. That is its **power** in watts (you met watts in Class 9), so the current it draws is **I = P ÷ V**. Stop 9 does this properly.",
          "पहले एक छोटा रास्ता। H = VIt से, कोई युक्ति हर सेकंड जो ऊर्जा लेती है वह V × I है। यही उसकी वॉट में **शक्ति** है (वॉट तुम कक्षा 9 में पढ़ चुके हो), इसलिए वह जो धारा लेती है वह **I = P ÷ V** है। नौवाँ पड़ाव इसे ठीक से करेगा।",
        ),
      ),
      w.definition(
        t(
          "**Fuse.** A **fuse** protects circuits and appliances by stopping any unduly high current. It is a piece of wire of a metal or alloy with a suitable melting point (aluminium, copper, iron, lead…), placed **in series** with the device, usually inside a porcelain cartridge. If the current goes above its rating, the wire heats up, melts, and breaks the circuit. Home fuses are rated 1 A, 2 A, 3 A, 5 A, 10 A and so on.",
          "**फ़्यूज़।** **फ़्यूज़** किसी भी अनुचित रूप से बड़ी धारा को रोककर परिपथों और उपकरणों की रक्षा करता है। यह उपयुक्त गलनांक वाली धातु या मिश्रातु (ऐलुमिनियम, ताँबा, लोहा, सीसा…) का एक तार है, जो युक्ति के साथ **श्रेणीक्रम** में, आम तौर पर चीनी मिट्टी के कार्ट्रिज के अंदर लगता है। यदि धारा उसकी रेटिंग से ऊपर जाए, तो तार गर्म होकर पिघलता है और परिपथ तोड़ देता है। घरेलू फ़्यूज़ 1 A, 2 A, 3 A, 5 A, 10 A आदि रेटिंग के होते हैं।",
        ),
      ),
      mains,
      goal,
      found,
      w.note(
        t(
          "Choosing a fuse: a 1 kW iron on 220 V draws 1000 ÷ 220 ≈ 4.54 A, so it needs a 5 A fuse: just above its working current.",
          "फ़्यूज़ चुनना: 220 V पर 1 kW की इस्त्री 1000 ÷ 220 ≈ 4.54 A लेती है, इसलिए उसे 5 A का फ़्यूज़ चाहिए: उसकी काम की धारा से थोड़ा ऊपर।",
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* See it in life */

const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const pic = sceneOn(
      b,
      "pic",
      ElectricityScene.FuseBlown,
      "Grandpa at the fuse box in the dark house",
    );
    const ask = choiceQuestion(b, {
      prompt: t(
        'Kabir: "Let\'s just put in a thicker copper wire so it never blows again." Why is that a bad idea?',
        'कबीर: "बस मोटा ताँबे का तार लगा देते हैं ताकि यह फिर कभी न उड़े।" यह बुरा विचार क्यों है?',
      ),
      options: [
        {
          id: "right",
          label: t(
            "Then nothing would stop a dangerously large current: the wiring could overheat and catch fire",
            "तब ख़तरनाक रूप से बड़ी धारा को कुछ नहीं रोकेगा: वायरिंग ज़्यादा गर्म होकर आग पकड़ सकती है",
          ),
        },
        {
          id: "bill",
          label: t("It would make the bill higher", "इससे बिल बढ़ जाएगा"),
          feedback: t(
            "The fuse wire uses almost no energy. Its job is safety: it must melt before the house wiring gets too hot.",
            "फ़्यूज़ का तार लगभग कोई ऊर्जा नहीं लेता। उसका काम सुरक्षा है: उसे घर की वायरिंग के ज़्यादा गर्म होने से पहले पिघलना है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const answer = w.body(
      t(
        "Grandpa fits a new fuse wire of the right rating and makes a rule: heater, iron and geyser never all at once. Riya notes the bigger lesson for the bill: the heater, iron and geyser are exactly the big-current, big-heat gadgets. Next stop: how fast each one uses energy, and what the meter counts.",
        "दादाजी सही रेटिंग का नया फ़्यूज़ तार लगाते हैं और नियम बनाते हैं: हीटर, इस्त्री और गीज़र कभी एक साथ नहीं। रिया बिल के लिए बड़ा सबक लिखती है: हीटर, इस्त्री और गीज़र ठीक वही बड़ी-धारा, बड़ी-गर्मी वाले उपकरण हैं। अगला पड़ाव: हर एक कितनी तेज़ी से ऊर्जा ख़र्च करता है, और मीटर क्या गिनता है।",
      ),
      "answer",
      { isHidden: true },
    );
    b.when(ask.on(QuestionSignal.Correct), [theBoard.show(answer), theBoard.pass()]);
    return column([
      w.title(t("The fuse box, explained", "फ़्यूज़ बॉक्स, समझाकर")),
      pic,
      ask,
      answer,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* Practice */

/** Worked: NCERT Examples 12.10 and 12.11. */
const examples = page("examples", (b) => {
  const w = wordsOn(b);
  return column([
    w.title(t("Two worked examples", "दो हल किए गए उदाहरण")),
    w.body(
      t(
        "**An iron uses energy at 840 W on its highest setting and 360 W on its lowest, at 220 V. Find the current and resistance in each case.**",
        "**एक इस्त्री 220 V पर अपनी सबसे ऊँची सेटिंग पर 840 W और सबसे नीची पर 360 W की दर से ऊर्जा लेती है। हर स्थिति में धारा और प्रतिरोध निकालो।**",
      ),
    ),
    w.body(
      t(
        r`The power supplied is $P = VI$ (energy per second, from $H = VIt$), so $I = P/V$. Highest: $$I = \frac{840}{220} = 3.82 \text{ A} \qquad R = \frac{220}{3.82} = 57.6\ \Omega$$ Lowest: $$I = \frac{360}{220} = 1.64 \text{ A} \qquad R = \frac{220}{1.64} = 134.2\ \Omega$$ More resistance, less current, less heat.`,
        r`दी गई शक्ति $P = VI$ है (प्रति सेकंड ऊर्जा, $H = VIt$ से), इसलिए $I = P/V$। सबसे ऊँची: $$I = \frac{840}{220} = 3.82 \text{ A} \qquad R = \frac{220}{3.82} = 57.6\ \Omega$$ सबसे नीची: $$I = \frac{360}{220} = 1.64 \text{ A} \qquad R = \frac{220}{1.64} = 134.2\ \Omega$$ ज़्यादा प्रतिरोध, कम धारा, कम गर्मी।`,
      ),
    ),
    w.body(
      t(
        "**100 J of heat is produced each second in a 4 Ω resistance. Find the potential difference across it.**",
        "**4 Ω के प्रतिरोध में हर सेकंड 100 J गर्मी बनती है। उसके सिरों पर विभवांतर निकालो।**",
      ),
    ),
    w.body(
      t(
        r`From $H = I^2Rt$ with $t = 1$ s: $$I = \sqrt{\frac{H}{Rt}} = \sqrt{\frac{100}{4 \times 1}} = 5 \text{ A}$$ Then $$V = IR = 5 \text{ A} \times 4\ \Omega = 20 \text{ V}$$`,
        r`$H = I^2Rt$ से, $t = 1$ s लेकर: $$I = \sqrt{\frac{H}{Rt}} = \sqrt{\frac{100}{4 \times 1}} = 5 \text{ A}$$ फिर $$V = IR = 5 \text{ A} \times 4\ \Omega = 20 \text{ V}$$`,
      ),
    ),
    space(),
  ]);
});

/** Your turn (in-text Q2, Q3; Exercise 17), then the mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const q1 = choiceQuestion(b, {
      name: "q1",
      prompt: t(
        "An iron of resistance 20 Ω takes a current of 5 A. How much heat is produced in 30 s?",
        "20 Ω प्रतिरोध की इस्त्री 5 A धारा लेती है। 30 s में कितनी गर्मी बनती है?",
      ),
      options: [
        { id: "right", label: t("15 000 J", "15 000 J") },
        {
          id: "noSquare",
          label: t("3000 J", "3000 J"),
          feedback: t("The current is squared: 5² × 20 × 30.", "धारा का वर्ग होता है: 5² × 20 × 30।"),
        },
      ],
      answer: "right",
      passes: false,
    });
    const q2 = choiceQuestion(b, {
      name: "q2",
      prompt: t(
        "96 000 C of charge is moved in one hour through a potential difference of 50 V. How much heat is generated?",
        "एक घंटे में 50 V विभवांतर से होकर 96 000 C आवेश ले जाया जाता है। कितनी गर्मी बनती है?",
      ),
      options: [
        { id: "right", label: t("4.8 × 10⁶ J", "4.8 × 10⁶ J") },
        {
          id: "time",
          label: t("1333 J", "1333 J"),
          feedback: t(
            "You don't need the time here: H = VIt = VQ, since It = Q. So 50 × 96 000.",
            "यहाँ समय नहीं चाहिए: H = VIt = VQ, क्योंकि It = Q। तो 50 × 96 000।",
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
        "A heater of resistance 8 Ω draws 15 A from the mains for 2 hours. At what rate is heat developed?",
        "8 Ω प्रतिरोध का हीटर मेन्स से 2 घंटे तक 15 A लेता है। गर्मी किस दर से बनती है?",
      ),
      options: [
        { id: "right", label: t("1800 J each second (1800 W)", "हर सेकंड 1800 J (1800 W)") },
        {
          id: "total",
          label: t("1.3 × 10⁷ J", "1.3 × 10⁷ J"),
          feedback: t(
            "That's the total over 2 hours. The rate is heat per second: I²R = 15² × 8.",
            "यह 2 घंटे का कुल है। दर प्रति सेकंड गर्मी है: I²R = 15² × 8।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ In a resistor, electrical energy becomes heat: H = VIt = I²Rt. ✓ Heaters, irons, kettles and bulbs use it; a fuse melts to stop too much current. ✓ The heater, iron and geyser are the big heat makers. Next stop: power, and what the meter really counts.",
        "**मिशन लॉग।** ✓ प्रतिरोधक में विद्युत ऊर्जा गर्मी बनती है: H = VIt = I²Rt। ✓ हीटर, इस्त्री, केतली और बल्ब इसका उपयोग करते हैं; फ़्यूज़ ज़्यादा धारा रोकने के लिए पिघलता है। ✓ हीटर, इस्त्री और गीज़र सबसे ज़्यादा गर्मी बनाते हैं। अगला पड़ाव: शक्ति, और मीटर असल में क्या गिनता है।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(q1.on(QuestionSignal.Correct), theBoard.show(q2));
    b.when(q2.on(QuestionSignal.Correct), theBoard.show(q3));
    b.when(q3.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), q1, q2, q3, log, space()]);
  },
  { passOn: PassOn.Rules },
);

export const overview = [hook, heat, factors, cord, uses, fuse, inLife, examples, yourTurn];

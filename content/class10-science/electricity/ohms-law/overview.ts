import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, goalQuestion, wordsOn } from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  ElectricityScene,
  GapItem,
  OhmAction,
  OhmDerived,
  OhmMode,
  ohmLabDef,
} from "@chalk/prop-electricity";
import { sceneOn } from "../kit";

const r = String.raw;

/* Hook */

const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const pic = sceneOn(
    b,
    "pic",
    ElectricityScene.FanRegulator,
    "a ceiling fan turning slowly; Riya turns the round regulator knob on the wall while Grandpa watches",
  );
  return column([
    w.title(t("Same push, different current", "एक ही धक्का, अलग धारा")),
    pic,
    w.body(
      t(
        "Grandpa's old fan has a round regulator. Turn the knob and the fan slows down, though the socket still gives the same 220 V. And Riya has read that the room heater draws about fifty times the current of a bulb, from the very same socket. So the push isn't the whole story. What else decides how much current flows? Fourth stop: **Ohm's law**.",
        "दादाजी के पुराने पंखे पर एक गोल रेगुलेटर है। घुंडी घुमाओ और पंखा धीमा हो जाता है, जबकि सॉकेट अब भी वही 220 V देता है। और रिया ने पढ़ा है कि रूम हीटर उसी सॉकेट से बल्ब की लगभग पचास गुना धारा लेता है। तो धक्का ही पूरी कहानी नहीं है। और क्या तय करता है कि कितनी धारा बहेगी? चौथा पड़ाव: **ओम का नियम**।",
      ),
    ),
    space(),
  ]);
});

/* Learn */

/** Activity 12.1: 1–4 cells across nichrome, record V and I. */
const activity = page(
  "activity",
  (b) => {
    const w = wordsOn(b);
    const lab = b.prop(ohmLabDef, "lab", {
      mode: OhmMode.Cells,
      cells: 1,
      isKeyClosed: false,
      wireOhms: 2,
      rows: [],
      showTable: true,
      showGraph: true,
      showRatio: true,
      canSetCells: true,
      canRecord: true,
      canChooseGap: false,
    });
    b.studentOnly(lab.action(OhmAction.SetCells));
    b.studentOnly(lab.action(OhmAction.SetKey));
    b.studentOnly(lab.action(OhmAction.Record));
    b.studentOnly(lab.action(OhmAction.ClearTable));
    b.standsFor(
      lab,
      "NCERT Fig 12.2: cells, a plug key, an ammeter, and a nichrome wire XY with a voltmeter across it; a table and a V–I graph fill in as readings are recorded",
    );
    const goal = goalQuestion(b, {
      about: lab,
      prompt: t(
        "Plug in the key and record a reading with 1, 2, 3 and 4 cells.",
        "कुंजी में प्लग लगाओ और 1, 2, 3 और 4 सेलों के साथ एक-एक पाठ्यांक लिखो।",
      ),
      isMet: lab.derived(OhmDerived.RowCount).ge(4),
      solve: [
        lab.learner(OhmAction.SetKey, { isClosed: true }),
        lab.learner(OhmAction.Record),
        lab.learner(OhmAction.SetCells, { cells: 2 }),
        lab.learner(OhmAction.Record),
        lab.learner(OhmAction.SetCells, { cells: 3 }),
        lab.learner(OhmAction.Record),
        lab.learner(OhmAction.SetCells, { cells: 4 }),
        lab.learner(OhmAction.Record),
      ],
    });
    const found = w.body(
      t(
        "Look at the last column: V/I comes out the **same** every time. And the points on the V–I graph lie on a **straight line through the origin**. Double the potential difference, and the current doubles too.",
        "आख़िरी कॉलम देखो: V/I हर बार **एक जैसा** आता है। और V–I ग्राफ़ के बिंदु **मूल बिंदु से होकर जाने वाली सीधी रेखा** पर हैं। विभवांतर दोगुना करो, और धारा भी दोगुनी हो जाती है।",
      ),
      "found",
      { isHidden: true },
    );
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(found));
    return column([
      w.title(t("Try it: push harder, measure the current", "करके देखो: ज़्यादा धक्का, धारा मापो")),
      w.body(
        t(
          "NCERT Activity 12.1. A nichrome wire XY (nichrome is an alloy, a mixture of metals) is joined to cells, a plug key and an ammeter, with a voltmeter across the wire. Use 1 cell, then 2, 3 and 4, and record the current I and the potential difference V each time.",
          "NCERT क्रियाकलाप 12.1। एक नाइक्रोम तार XY (नाइक्रोम एक मिश्रातु है, यानी धातुओं का मिश्रण) सेलों, एक प्लग कुंजी और एक ऐमीटर से जुड़ा है, और तार के आर-पार एक वोल्टमीटर है। 1 सेल, फिर 2, 3 और 4 सेल लगाओ, और हर बार धारा I और विभवांतर V लिखो।",
        ),
      ),
      lab,
      goal,
      found,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Ohm's law, resistance and the ohm. */
const law = page(
  "law",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      prompt: t(
        "A resistor's resistance stays the same while the potential difference across it is halved. What happens to the current?",
        "किसी प्रतिरोधक का प्रतिरोध वही रहता है जबकि उसके सिरों पर विभवांतर आधा कर दिया जाता है। धारा का क्या होता है?",
      ),
      options: [
        { id: "right", label: t("It is halved", "आधी हो जाती है") },
        {
          id: "double",
          label: t("It doubles", "दोगुनी हो जाती है"),
          feedback: t(
            r`$I = V/R$: with $R$ fixed, a smaller $V$ means a smaller $I$.`,
            r`$I = V/R$: $R$ स्थिर होने पर, छोटा $V$ यानी छोटा $I$।`,
          ),
        },
        {
          id: "same",
          label: t("It stays the same", "वही रहती है"),
          feedback: t(
            "The current follows the push: V and I are proportional.",
            "धारा धक्के के साथ चलती है: V और I समानुपाती हैं।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Ohm's law", "ओम का नियम")),
      w.definition(
        t(
          r`**Ohm's law.** In 1827 Georg Simon Ohm found that the potential difference $V$ across the ends of a metal wire is **directly proportional** to the current $I$ through it, provided its temperature stays the same: $$V \propto I$$ So $V/I$ is a constant, which we call $R$: $$V = IR$$`,
          r`**ओम का नियम।** 1827 में जॉर्ज साइमन ओम ने पाया कि धातु के तार के सिरों पर विभवांतर $V$ उसमें बहने वाली धारा $I$ के **अनुक्रमानुपाती** होता है, बशर्ते उसका ताप वही रहे: $$V \propto I$$ इसलिए $V/I$ एक स्थिरांक है, जिसे हम $R$ कहते हैं: $$V = IR$$`,
        ),
      ),
      w.definition(
        t(
          r`**Resistance.** $R$ is the **resistance** of the wire: its property of resisting the flow of charge through it. It is measured in **ohms** ($\Omega$). A wire has a resistance of 1 Ω if a potential difference of 1 V across it drives a current of 1 A: $$1\ \Omega = \frac{1 \text{ V}}{1 \text{ A}}$$`,
          r`**प्रतिरोध।** $R$ तार का **प्रतिरोध** है: उसमें से आवेश के बहने का विरोध करने का गुण। यह **ओम** ($\Omega$) में मापा जाता है। किसी तार का प्रतिरोध 1 Ω है यदि उसके सिरों पर 1 V का विभवांतर उसमें 1 A धारा बहाता है: $$1\ \Omega = \frac{1 \text{ V}}{1 \text{ A}}$$`,
        ),
      ),
      w.body(
        t(
          r`Rearranged, Ohm's law gives the current: $$I = \frac{V}{R}$$ The current is **inversely proportional** to the resistance: double $R$ and the current halves.`,
          r`दोबारा लिखने पर, ओम का नियम धारा देता है: $$I = \frac{V}{R}$$ धारा प्रतिरोध के **व्युत्क्रमानुपाती** है: $R$ दोगुना करो और धारा आधी हो जाती है।`,
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Activity 12.2: different things in the gap; conductors to insulators; the rheostat. */
const gap = page(
  "gap",
  (b) => {
    const w = wordsOn(b);
    const lab = b.prop(ohmLabDef, "lab", {
      mode: OhmMode.Gap,
      isKeyClosed: true,
      inGap: GapItem.Nichrome,
      showTable: false,
      showGraph: false,
      showRatio: false,
      canSetCells: false,
      canRecord: false,
      canChooseGap: true,
    });
    b.studentOnly(lab.action(OhmAction.PutInGap));
    b.studentOnly(lab.action(OhmAction.SetKey));
    b.standsFor(
      lab,
      "NCERT Fig 12.4: four cells, a key and an ammeter with a gap XY; nichrome, a torch bulb, a 10 W bulb, copper, rubber or glass can be put in the gap and the ammeter read",
    );
    const ask = choiceQuestion(b, {
      prompt: t(
        "Try each thing in the gap. Which one lets the smallest current through (other than rubber and glass)?",
        "हर चीज़ को खाली जगह में रखकर देखो। रबड़ और काँच को छोड़कर, कौन-सी सबसे कम धारा जाने देती है?",
      ),
      options: [
        { id: "right", label: t("The 10 W bulb", "10 W का बल्ब") },
        {
          id: "nichrome",
          label: t("The nichrome wire", "नाइक्रोम तार"),
          feedback: t(
            "Nichrome gives well over 1 A here. Try the 10 W bulb: its filament has a very large resistance.",
            "नाइक्रोम यहाँ 1 A से काफ़ी ज़्यादा देता है। 10 W का बल्ब आज़माओ: उसके तंतु का प्रतिरोध बहुत बड़ा है।",
          ),
        },
        {
          id: "copper",
          label: t("The copper wire", "ताँबे का तार"),
          feedback: t(
            "Copper sends the needle off the scale: it has almost no resistance.",
            "ताँबा सुई को पैमाने से बाहर भेज देता है: उसका प्रतिरोध लगभग शून्य है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Some things resist more", "कुछ चीज़ें ज़्यादा रोकती हैं")),
      w.body(
        t(
          "NCERT Activity 12.2. With the same four cells, put different things in the gap XY and read the ammeter. The push is the same each time, but the current is not.",
          "NCERT क्रियाकलाप 12.2। उन्हीं चार सेलों के साथ, खाली जगह XY में अलग-अलग चीज़ें रखो और ऐमीटर पढ़ो। धक्का हर बार वही है, पर धारा नहीं।",
        ),
      ),
      lab,
      w.definition(
        t(
          "**Why currents differ.** Electrons in a conductor aren't completely free: the atoms they move among attract them and slow them down. That is resistance. For pieces of the same size: one with **low** resistance is a **good conductor**; one with some appreciable resistance is a **resistor**; one with higher resistance is a **poor conductor**; an **insulator** (rubber, glass) has even higher resistance and lets practically no current through.",
          "**धाराएँ अलग क्यों हैं।** चालक में इलेक्ट्रॉन पूरी तरह स्वतंत्र नहीं होते: जिन परमाणुओं के बीच वे चलते हैं वे उन्हें आकर्षित करके धीमा करते हैं। यही प्रतिरोध है। एक ही आकार के टुकड़ों में: **कम** प्रतिरोध वाला **अच्छा चालक** है; कुछ उल्लेखनीय प्रतिरोध वाला **प्रतिरोधक** है; ज़्यादा प्रतिरोध वाला **हीन चालक** है; **विद्युतरोधी** (रबड़, काँच) का प्रतिरोध और भी ज़्यादा होता है और वह लगभग कोई धारा नहीं जाने देता।",
        ),
      ),
      w.definition(
        t(
          "**Rheostat.** Often we need to raise or lower the current without changing the cells. A part whose resistance can be changed is a **variable resistance**; the common one used in circuits is the **rheostat**.",
          "**धारा नियंत्रक।** अक्सर सेल बदले बिना धारा बढ़ानी या घटानी होती है। जिस भाग का प्रतिरोध बदला जा सके वह **परिवर्ती प्रतिरोध** है; परिपथों में आम तौर पर प्रयुक्त **धारा नियंत्रक** (रिओस्टेट) है।",
        ),
      ),
      ask,
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
      ElectricityScene.FanRegulator,
      "the fan and its round regulator on the wall",
    );
    const ask = choiceQuestion(b, {
      name: "regulator",
      prompt: t(
        "The socket's push stays 220 V. How does turning Grandpa's old regulator slow the fan?",
        "सॉकेट का धक्का 220 V ही रहता है। दादाजी का पुराना रेगुलेटर घुमाने से पंखा धीमा कैसे होता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "It adds resistance in the fan's path, so less current flows",
            "यह पंखे के रास्ते में प्रतिरोध जोड़ता है, इसलिए कम धारा बहती है",
          ),
        },
        {
          id: "volts",
          label: t("It changes the socket's voltage", "यह सॉकेट का वोल्टेज बदल देता है"),
          feedback: t(
            "The socket still gives 220 V. The regulator works like a rheostat: more resistance, less current.",
            "सॉकेट अब भी 220 V देता है। रेगुलेटर धारा नियंत्रक की तरह काम करता है: ज़्यादा प्रतिरोध, कम धारा।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const heater = choiceQuestion(b, {
      name: "heater",
      prompt: t(
        r`From the same 220 V, a bulb filament of $1200\ \Omega$ draws 0.18 A and Grandpa's heater coil of $24\ \Omega$ draws about 9 A. Why does the heater draw more?`,
        r`उसी 220 V से $1200\ \Omega$ का बल्ब तंतु 0.18 A लेता है और दादाजी के हीटर की $24\ \Omega$ की कुंडली लगभग 9 A लेती है। हीटर ज़्यादा क्यों लेता है?`,
      ),
      options: [
        {
          id: "right",
          label: t("Its resistance is smaller", "उसका प्रतिरोध कम है"),
        },
        {
          id: "bigger",
          label: t("It is bigger and heavier", "वह बड़ा और भारी है"),
          feedback: t(
            r`Size isn't what Ohm's law uses. $I = V/R$: same $V$, smaller $R$, bigger $I$.`,
            r`ओम का नियम आकार नहीं देखता। $I = V/R$: वही $V$, छोटा $R$, बड़ा $I$।`,
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const clue = w.body(
      t(
        "Riya circles the heater on her list. Big current, every evening, for hours. Suspect number one for the bill.",
        "रिया अपनी सूची में हीटर पर गोला बनाती है। बड़ी धारा, हर शाम, घंटों तक। बिल के लिए पहला संदिग्ध।",
      ),
      "clue",
      { isHidden: true },
    );
    b.when(ask.on(QuestionSignal.Correct), theBoard.show(heater));
    b.when(heater.on(QuestionSignal.Correct), [theBoard.show(clue), theBoard.pass()]);
    return column([
      w.title(t("The regulator and the heater", "रेगुलेटर और हीटर")),
      pic,
      ask,
      heater,
      clue,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* Practice */

/** Worked: NCERT Examples 12.3 and 12.4. */
const examples = page("examples", (b) => {
  const w = wordsOn(b);
  return column([
    w.title(t("Two worked examples", "दो हल किए गए उदाहरण")),
    w.body(
      t(
        "**(a) How much current does a bulb draw from 220 V if its filament's resistance is 1200 Ω? (b) A heater coil of 100 Ω?**",
        "**(a) यदि बल्ब के तंतु का प्रतिरोध 1200 Ω है तो वह 220 V से कितनी धारा लेता है? (b) 100 Ω की हीटर कुंडली?**",
      ),
    ),
    w.body(
      t(
        r`Use $I = V/R$ each time: $$I_{\text{bulb}} = \frac{220 \text{ V}}{1200\ \Omega} = 0.18 \text{ A}$$ $$I_{\text{heater}} = \frac{220 \text{ V}}{100\ \Omega} = 2.2 \text{ A}$$ Same socket, about twelve times the current.`,
        r`हर बार $I = V/R$ लगाओ: $$I_{\text{bulb}} = \frac{220 \text{ V}}{1200\ \Omega} = 0.18 \text{ A}$$ $$I_{\text{heater}} = \frac{220 \text{ V}}{100\ \Omega} = 2.2 \text{ A}$$ वही सॉकेट, लगभग बारह गुना धारा।`,
      ),
    ),
    w.body(
      t(
        "**A heater draws 4 A when the potential difference across it is 60 V. What current will it draw at 120 V?**",
        "**एक हीटर 60 V विभवांतर पर 4 A लेता है। 120 V पर वह कितनी धारा लेगा?**",
      ),
    ),
    w.body(
      t(
        r`First find its resistance: $$R = \frac{V}{I} = \frac{60 \text{ V}}{4 \text{ A}} = 15\ \Omega$$ Then at 120 V: $$I = \frac{120 \text{ V}}{15\ \Omega} = 8 \text{ A}$$ Double the push, double the current.`,
        r`पहले उसका प्रतिरोध निकालो: $$R = \frac{V}{I} = \frac{60 \text{ V}}{4 \text{ A}} = 15\ \Omega$$ फिर 120 V पर: $$I = \frac{120 \text{ V}}{15\ \Omega} = 8 \text{ A}$$ धक्का दोगुना, धारा दोगुनी।`,
      ),
    ),
    space(),
  ]);
});

/** NCERT Exercise 7: plot the data, find R. */
const graph = page(
  "graph",
  (b) => {
    const w = wordsOn(b);
    const lab = b.prop(ohmLabDef, "lab", {
      mode: OhmMode.Data,
      rows: [
        { cells: 0, amps: 0.5, volts: 1.6 },
        { cells: 0, amps: 1, volts: 3.4 },
        { cells: 0, amps: 2, volts: 6.7 },
        { cells: 0, amps: 3, volts: 10.2 },
        { cells: 0, amps: 4, volts: 13.2 },
      ],
      showTable: true,
      showGraph: true,
      showRatio: true,
      canSetCells: false,
      canRecord: false,
      canChooseGap: false,
    });
    b.standsFor(
      lab,
      "NCERT Exercise 7's readings in a table, plotted as V against I: the points lie close to a straight line through the origin",
    );
    const ask = choiceQuestion(b, {
      prompt: t(
        "From the graph, what is the resistance of this resistor?",
        "ग्राफ़ से, इस प्रतिरोधक का प्रतिरोध कितना है?",
      ),
      options: [
        { id: "right", label: t("About 3.4 Ω", "लगभग 3.4 Ω") },
        {
          id: "inverse",
          label: t("About 0.3 Ω", "लगभग 0.3 Ω"),
          feedback: t(
            "That's I/V. Resistance is V/I: for example 10.2 V ÷ 3 A.",
            "यह I/V है। प्रतिरोध V/I है: जैसे 10.2 V ÷ 3 A।",
          ),
        },
        {
          id: "volts",
          label: t("13.2 Ω", "13.2 Ω"),
          feedback: t(
            "13.2 is the last voltage reading, not V/I. Divide it by its current, 4 A.",
            "13.2 आख़िरी वोल्टेज पाठ्यांक है, V/I नहीं। इसे इसकी धारा, 4 A, से भाग दो।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Reading R from a graph", "ग्राफ़ से R पढ़ना")),
      w.body(
        t(
          "NCERT Exercise 7 gives these readings for one resistor. Real readings wobble a little, so we draw the best straight line through them. Its slope, V ÷ I, is the resistance.",
          "NCERT अभ्यास 7 एक प्रतिरोधक के ये पाठ्यांक देता है। असली पाठ्यांक थोड़ा डगमगाते हैं, इसलिए हम उनसे होकर सबसे अच्छी सीधी रेखा खींचते हैं। उसकी ढलान, V ÷ I, ही प्रतिरोध है।",
        ),
      ),
      lab,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Your turn (Exercise 8), then the mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      prompt: t(
        "A 12 V battery connected across an unknown resistor drives a current of 2.5 mA. What is the resistance?",
        "एक अज्ञात प्रतिरोधक के सिरों पर जुड़ी 12 V की बैटरी 2.5 mA धारा बहाती है। प्रतिरोध कितना है?",
      ),
      options: [
        { id: "right", label: t("4800 Ω", "4800 Ω") },
        {
          id: "ma",
          label: t("4.8 Ω", "4.8 Ω"),
          feedback: t(
            "Change mA into A first: 2.5 mA = 0.0025 A. Then 12 ÷ 0.0025.",
            "पहले mA को A में बदलो: 2.5 mA = 0.0025 A। फिर 12 ÷ 0.0025।",
          ),
        },
        {
          id: "times",
          label: t("30 Ω", "30 Ω"),
          feedback: t("That's 12 × 2.5. Resistance is V ÷ I.", "यह 12 × 2.5 है। प्रतिरोध V ÷ I है।"),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ Ohm's law: V = IR, so I = V/R. ✓ Resistance holds the current back; it is measured in ohms. ✓ From the same socket, a small resistance (the heater) draws a big current. Next stop: why is the heater's coil nichrome, and what decides a wire's resistance?",
        "**मिशन लॉग।** ✓ ओम का नियम: V = IR, इसलिए I = V/R। ✓ प्रतिरोध धारा को रोकता है; यह ओम में मापा जाता है। ✓ उसी सॉकेट से कम प्रतिरोध (हीटर) बड़ी धारा लेता है। अगला पड़ाव: हीटर की कुंडली नाइक्रोम की क्यों है, और तार का प्रतिरोध कौन तय करता है?",
      ),
      "log",
      { isHidden: true },
    );
    b.when(ask.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), ask, log, space()]);
  },
  { passOn: PassOn.Rules },
);

export const overview = [hook, activity, law, gap, inLife, examples, graph, yourTurn];

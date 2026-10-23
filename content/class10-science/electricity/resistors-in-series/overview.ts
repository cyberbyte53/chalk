import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, goalQuestion, wordsOn } from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  ComboAction,
  ComboMode,
  ElectricityScene,
  MAIN,
  PartKind,
  resistorComboDef,
} from "@chalk/prop-electricity";
import { sceneOn } from "../kit";

const r = String.raw;
const resistor = (ohms: number) => ({ ohms, kind: PartKind.Resistor, isBroken: false });
const bulb = (ohms: number) => ({ ohms, kind: PartKind.Bulb, isBroken: false });

/* Hook */

const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const pic = sceneOn(
    b,
    "pic",
    ElectricityScene.FairyLights,
    "a dark wedding canopy next door strung with a line of fairy lights, all of them dark; an electrician on a ladder checks the bulbs one by one while Kabir watches",
  );
  return column([
    w.title(t("The fairy lights", "झालर की बत्तियाँ")),
    pic,
    w.body(
      t(
        'Saturday: a wedding next door, and the whole canopy is strung with fairy lights. At nine o\'clock every single bulb goes dark at once. The electrician climbs a ladder and tests the bulbs one by one, for an hour, until he finds the one dead bulb. Kabir: **"One bulb broke. Why did all of them go out?"** Sixth stop: **resistors in series**.',
        'शनिवार: पड़ोस में शादी है, और पूरा शामियाना झालर की बत्तियों से सजा है। नौ बजे हर एक बल्ब एक साथ बुझ जाता है। बिजली वाला सीढ़ी पर चढ़कर एक-एक बल्ब जाँचता है, एक घंटे तक, जब तक उसे वह एक ख़राब बल्ब नहीं मिल जाता। कबीर: **"एक बल्ब टूटा। सब क्यों बुझ गए?"** छठा पड़ाव: **श्रेणीक्रम में प्रतिरोधक**।',
      ),
    ),
    space(),
  ]);
});

/* Learn */

/** Two ways of joining: series and parallel. */
const twoWays = page(
  "two-ways",
  (b) => {
    const w = wordsOn(b);
    const series = b.prop(resistorComboDef, "series", {
      mode: ComboMode.Series,
      parts: [resistor(1), resistor(2), resistor(3)],
      volts: 6,
      ammeterAt: MAIN,
      voltmeterAcross: null,
      showValues: false,
      showEquivalent: false,
      canEdit: false,
      canMoveMeters: false,
      canBreak: false,
    });
    b.standsFor(
      series,
      "three resistors R₁, R₂, R₃ joined end to end in one line with a battery: in series",
    );
    const parallel = b.prop(resistorComboDef, "parallel", {
      mode: ComboMode.Parallel,
      parts: [resistor(5), resistor(10), resistor(30)],
      volts: 12,
      ammeterAt: MAIN,
      voltmeterAcross: null,
      showValues: false,
      showEquivalent: false,
      canEdit: false,
      canMoveMeters: false,
      canBreak: false,
    });
    b.standsFor(
      parallel,
      "three resistors each joined between the same two points X and Y, side by side: in parallel",
    );
    const ask = choiceQuestion(b, {
      prompt: t(
        "In the first circuit, how many paths can the current take through the resistors?",
        "पहले परिपथ में, धारा प्रतिरोधकों से होकर कितने रास्ते ले सकती है?",
      ),
      options: [
        {
          id: "right",
          label: t("Just one: through all three in turn", "बस एक: बारी-बारी से तीनों में से"),
        },
        {
          id: "three",
          label: t("Three, one through each", "तीन, हर एक से एक"),
          feedback: t(
            "That's the second circuit, the parallel one. In series there's a single path.",
            "वह दूसरा परिपथ है, पार्श्वक्रम वाला। श्रेणीक्रम में एक ही रास्ता होता है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Two ways to join resistors", "प्रतिरोधकों को जोड़ने के दो तरीक़े")),
      w.definition(
        t(
          "**Series.** Resistors joined **end to end**, one after another, so the current has only one path through them all, are **in series** (NCERT Fig. 12.6).",
          "**श्रेणीक्रम।** **सिरे से सिरा** मिलाकर, एक के बाद एक जुड़े प्रतिरोधक, ताकि धारा के पास उन सबसे होकर केवल एक रास्ता हो, **श्रेणीक्रम** में हैं (NCERT चित्र 12.6)।",
        ),
      ),
      series,
      w.definition(
        t(
          "**Parallel.** Resistors each joined **between the same two points**, side by side, are **in parallel** (Fig. 12.7). The next lesson is about them.",
          "**पार्श्वक्रम।** हर प्रतिरोधक **उन्हीं दो बिंदुओं के बीच**, अगल-बगल, जुड़ा हो तो वे **पार्श्वक्रम** में हैं (चित्र 12.7)। अगला पाठ उनके बारे में है।",
        ),
      ),
      parallel,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Activity 12.4: the same current everywhere. */
const sameCurrent = page(
  "same-current",
  (b) => {
    const w = wordsOn(b);
    const combo = b.prop(resistorComboDef, "combo", {
      mode: ComboMode.Series,
      parts: [resistor(1), resistor(2), resistor(3)],
      volts: 6,
      ammeterAt: MAIN,
      voltmeterAcross: null,
      showValues: false,
      showEquivalent: false,
      canEdit: false,
      canMoveMeters: true,
      canBreak: false,
    });
    b.studentOnly(combo.action(ComboAction.MoveAmmeter));
    b.standsFor(
      combo,
      "NCERT Activity 12.4: 1 Ω, 2 Ω and 3 Ω resistors in series on a 6 V battery; the ammeter can be moved to the main line or beside any resistor",
    );
    const goal = goalQuestion(b, {
      about: combo,
      prompt: t(
        "Move the ammeter to sit next to R₃, the last resistor.",
        "ऐमीटर को R₃, आख़िरी प्रतिरोधक, के बगल में ले जाओ।",
      ),
      isMet: combo.field("ammeterAt").eq(2),
      solve: [combo.learner(ComboAction.MoveAmmeter, { at: 2 })],
    });
    const ask = choiceQuestion(b, {
      name: "same",
      prompt: t(
        "Try every position. What do you notice about the ammeter reading?",
        "हर जगह आज़माओ। ऐमीटर के पाठ्यांक में तुम्हें क्या दिखता है?",
      ),
      options: [
        { id: "right", label: t("It's 1 A everywhere", "हर जगह 1 A है") },
        {
          id: "drops",
          label: t("It gets smaller after each resistor", "हर प्रतिरोधक के बाद कम होता जाता है"),
          feedback: t(
            "Look again: 1 A in every position. Current isn't used up by a resistor; the same charge flows through each one.",
            "फिर देखो: हर जगह 1 A। प्रतिरोधक धारा को ख़र्च नहीं करता; वही आवेश हर एक में से बहता है।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
    });
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(ask));
    return column([
      w.title(t("The current in series", "श्रेणीक्रम में धारा")),
      w.body(
        t(
          "NCERT Activity 12.4. Three resistors, 1 Ω, 2 Ω and 3 Ω, in series with a 6 V battery. Move the ammeter around the circuit.",
          "NCERT क्रियाकलाप 12.4। तीन प्रतिरोधक, 1 Ω, 2 Ω और 3 Ω, 6 V की बैटरी के साथ श्रेणीक्रम में। ऐमीटर को परिपथ में इधर-उधर ले जाओ।",
        ),
      ),
      combo,
      goal,
      ask,
      w.note(
        t(
          "In a series combination, **the current is the same in every part of the circuit**: the same current flows through each resistor.",
          "श्रेणीक्रम संयोजन में **परिपथ के हर भाग में धारा एक जैसी होती है**: हर प्रतिरोधक में वही धारा बहती है।",
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Activity 12.5: the potential differences add up. */
const voltages = page(
  "voltages",
  (b) => {
    const w = wordsOn(b);
    const combo = b.prop(resistorComboDef, "combo", {
      mode: ComboMode.Series,
      parts: [resistor(1), resistor(2), resistor(3)],
      volts: 6,
      ammeterAt: MAIN,
      voltmeterAcross: MAIN,
      showValues: false,
      showEquivalent: false,
      canEdit: false,
      canMoveMeters: true,
      canBreak: false,
    });
    b.studentOnly(combo.action(ComboAction.MoveVoltmeter));
    b.standsFor(
      combo,
      "the same series circuit with a voltmeter that can be placed across the whole combination or across R₁, R₂ or R₃",
    );
    const ask = choiceQuestion(b, {
      prompt: t(
        "Put the voltmeter across R₁, then R₂, then R₃: 1 V, 2 V and 3 V. Across the whole combination it reads 6 V. What is the rule?",
        "वोल्टमीटर को R₁, फिर R₂, फिर R₃ के सिरों पर लगाओ: 1 V, 2 V और 3 V। पूरे संयोजन के सिरों पर यह 6 V पढ़ता है। नियम क्या है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "The total potential difference is the sum: V = V₁ + V₂ + V₃",
            "कुल विभवांतर योग है: V = V₁ + V₂ + V₃",
          ),
        },
        {
          id: "each",
          label: t("Each resistor gets the full 6 V", "हर प्रतिरोधक को पूरे 6 V मिलते हैं"),
          feedback: t(
            "Read the voltmeter across R₁: only 1 V. In series the battery's push is shared out.",
            "R₁ के सिरों पर वोल्टमीटर पढ़ो: केवल 1 V। श्रेणीक्रम में बैटरी का धक्का बँट जाता है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("The push is shared", "धक्का बँट जाता है")),
      w.body(
        t(
          "NCERT Activity 12.5. Now move a voltmeter instead: across the whole series combination, then across each resistor in turn.",
          "NCERT क्रियाकलाप 12.5। अब वोल्टमीटर को इधर-उधर करो: पूरे श्रेणीक्रम संयोजन के सिरों पर, फिर बारी-बारी से हर प्रतिरोधक के सिरों पर।",
        ),
      ),
      combo,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Rs = R1 + R2 + R3. */
const rule = page(
  "rule",
  (b) => {
    const w = wordsOn(b);
    const combo = b.prop(resistorComboDef, "combo", {
      mode: ComboMode.Series,
      parts: [resistor(1), resistor(2), resistor(3)],
      volts: 6,
      ammeterAt: MAIN,
      voltmeterAcross: null,
      showValues: true,
      showEquivalent: true,
      canEdit: true,
      canMoveMeters: false,
      canBreak: false,
    });
    b.studentOnly(combo.action(ComboAction.SetOhms));
    b.standsFor(
      combo,
      "the series circuit with each resistor's value adjustable; the equivalent resistance and the current from the battery are shown",
    );
    const ask = choiceQuestion(b, {
      prompt: t(
        "Resistors of 5 Ω and 10 Ω are joined in series. What is the equivalent resistance?",
        "5 Ω और 10 Ω के प्रतिरोधक श्रेणीक्रम में जुड़े हैं। तुल्य प्रतिरोध कितना है?",
      ),
      options: [
        { id: "right", label: t("15 Ω", "15 Ω") },
        {
          id: "par",
          label: t("3.3 Ω", "3.3 Ω"),
          feedback: t(
            "That's the parallel rule. In series, just add: 5 + 10.",
            "यह पार्श्वक्रम का नियम है। श्रेणीक्रम में बस जोड़ो: 5 + 10।",
          ),
        },
        {
          id: "max",
          label: t("10 Ω", "10 Ω"),
          feedback: t(
            "The combination is more than the biggest one: both resistors are in the current's path.",
            "संयोजन सबसे बड़े से भी ज़्यादा होता है: दोनों प्रतिरोधक धारा के रास्ते में हैं।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("The series rule", "श्रेणीक्रम का नियम")),
      w.definition(
        t(
          "**Equivalent resistance.** The single resistor that could replace a combination, drawing the same current from the same battery, is its **equivalent resistance**.",
          "**तुल्य प्रतिरोध।** वह एक प्रतिरोधक जो किसी संयोजन की जगह ले सके, उसी बैटरी से वही धारा लेते हुए, उसका **तुल्य प्रतिरोध** है।",
        ),
      ),
      w.body(
        t(
          r`The current $I$ is the same through each resistor, so by Ohm's law $$V_1 = IR_1 \qquad V_2 = IR_2 \qquad V_3 = IR_3$$ The potential differences add up to $V$, and for the equivalent resistor $V = IR_s$: $$IR_s = IR_1 + IR_2 + IR_3$$ Divide by $I$: $$R_s = R_1 + R_2 + R_3$$`,
          r`धारा $I$ हर प्रतिरोधक में एक जैसी है, इसलिए ओम के नियम से $$V_1 = IR_1 \qquad V_2 = IR_2 \qquad V_3 = IR_3$$ विभवांतर जुड़कर $V$ बनते हैं, और तुल्य प्रतिरोधक के लिए $V = IR_s$: $$IR_s = IR_1 + IR_2 + IR_3$$ $I$ से भाग दो: $$R_s = R_1 + R_2 + R_3$$`,
        ),
      ),
      w.definition(
        t(
          "**In series, resistances add.** The equivalent resistance is the sum of the individual resistances, so it is **greater than any one of them**.",
          "**श्रेणीक्रम में प्रतिरोध जुड़ते हैं।** तुल्य प्रतिरोध अलग-अलग प्रतिरोधों का योग है, इसलिए यह **उनमें से किसी से भी बड़ा** होता है।",
        ),
      ),
      combo,
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
    const lights = b.prop(resistorComboDef, "lights", {
      mode: ComboMode.Series,
      parts: [bulb(10), bulb(10), bulb(10)],
      volts: 6,
      ammeterAt: MAIN,
      voltmeterAcross: null,
      showValues: false,
      showEquivalent: false,
      canEdit: false,
      canMoveMeters: false,
      canBreak: true,
    });
    b.studentOnly(lights.action(ComboAction.ToggleBreak));
    b.standsFor(
      lights,
      "three bulbs in series on a battery, all glowing; tapping a bulb breaks its filament",
    );
    const ask = choiceQuestion(b, {
      prompt: t(
        "Tap one bulb to break it. Why do all the fairy lights go dark?",
        "एक बल्ब को टैप करके तोड़ो। झालर की सारी बत्तियाँ क्यों बुझ जाती हैं?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "They're in series: one broken filament breaks the only path",
            "वे श्रेणीक्रम में हैं: एक टूटा तंतु अकेले रास्ते को तोड़ देता है",
          ),
        },
        {
          id: "power",
          label: t("The broken bulb uses up all the current", "टूटा बल्ब सारी धारा ख़र्च कर लेता है"),
          feedback: t(
            "A broken bulb carries no current at all. And with one path, if it carries none, nobody does.",
            "टूटा बल्ब कोई धारा नहीं ले जाता। और एक रास्ते में, अगर वह नहीं ले जाता, तो कोई नहीं ले जाता।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const why = w.body(
      t(
        "That's why the electrician had to test every bulb: nothing told him which one had gone. Series has one more problem: every part gets the same current, so you can't put a bulb and a heater in series, since they need very different currents. Is the wiring in our house like this? Riya flips the TV off: the fan keeps turning. So no. Next stop.",
        "इसीलिए बिजली वाले को हर बल्ब जाँचना पड़ा: कुछ भी नहीं बताता था कि कौन-सा गया। श्रेणीक्रम की एक और समस्या है: हर भाग को वही धारा मिलती है, इसलिए बल्ब और हीटर को श्रेणीक्रम में नहीं लगा सकते, क्योंकि उन्हें बहुत अलग धाराएँ चाहिए। क्या हमारे घर की वायरिंग ऐसी है? रिया टीवी बंद करती है: पंखा चलता रहता है। तो नहीं। अगला पड़ाव।",
      ),
      "why",
      { isHidden: true },
    );
    b.when(ask.on(QuestionSignal.Correct), [theBoard.show(why), theBoard.pass()]);
    return column([
      w.title(t("The dead fairy lights, explained", "बुझी झालर, समझाकर")),
      lights,
      ask,
      why,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* Practice */

/** Worked: NCERT Example 12.7. */
const example = page("example", (b) => {
  const w = wordsOn(b);
  const combo = b.prop(resistorComboDef, "combo", {
    mode: ComboMode.Series,
    parts: [
      { ohms: 20, kind: PartKind.Bulb, isBroken: false, label: { en: "lamp", hi: "लैंप" } },
      { ohms: 4, kind: PartKind.Resistor, isBroken: false },
    ],
    volts: 6,
    ammeterAt: MAIN,
    voltmeterAcross: null,
    showValues: true,
    showEquivalent: true,
    canEdit: false,
    canMoveMeters: false,
    canBreak: false,
  });
  b.standsFor(combo, "NCERT Fig 12.9: a 20 Ω lamp and a 4 Ω resistor in series with a 6 V battery");
  return column([
    w.title(t("A worked example", "एक हल किया गया उदाहरण")),
    w.body(
      t(
        "**A lamp of 20 Ω and a conductor of 4 Ω are connected in series to a 6 V battery. Find (a) the total resistance, (b) the current, (c) the potential difference across the lamp and across the conductor.**",
        "**20 Ω का एक लैंप और 4 Ω का एक चालक 6 V की बैटरी से श्रेणीक्रम में जुड़े हैं। निकालो (a) कुल प्रतिरोध, (b) धारा, (c) लैंप और चालक के सिरों पर विभवांतर।**",
      ),
    ),
    combo,
    w.body(
      t(
        r`(a) In series, resistances add: $$R_s = 20\ \Omega + 4\ \Omega = 24\ \Omega$$ (b) By Ohm's law: $$I = \frac{V}{R_s} = \frac{6 \text{ V}}{24\ \Omega} = 0.25 \text{ A}$$ (c) The same current goes through each: $$V_1 = 20\ \Omega \times 0.25 \text{ A} = 5 \text{ V}$$ $$V_2 = 4\ \Omega \times 0.25 \text{ A} = 1 \text{ V}$$ And 5 V + 1 V = 6 V, the battery's push.`,
        r`(a) श्रेणीक्रम में प्रतिरोध जुड़ते हैं: $$R_s = 20\ \Omega + 4\ \Omega = 24\ \Omega$$ (b) ओम के नियम से: $$I = \frac{V}{R_s} = \frac{6 \text{ V}}{24\ \Omega} = 0.25 \text{ A}$$ (c) हर एक में वही धारा जाती है: $$V_1 = 20\ \Omega \times 0.25 \text{ A} = 5 \text{ V}$$ $$V_2 = 4\ \Omega \times 0.25 \text{ A} = 1 \text{ V}$$ और 5 V + 1 V = 6 V, बैटरी का धक्का।`,
      ),
    ),
    space(),
  ]);
});

/** Your turn (in-text Q2 and Exercise 9), then the mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const q1 = choiceQuestion(b, {
      name: "q1",
      prompt: t(
        "Three cells of 2 V each drive a current through 5 Ω, 8 Ω and 12 Ω resistors in series. What does an ammeter in the circuit read?",
        "2 V के तीन सेल श्रेणीक्रम में 5 Ω, 8 Ω और 12 Ω के प्रतिरोधकों में धारा बहाते हैं। परिपथ में ऐमीटर कितना पढ़ता है?",
      ),
      options: [
        { id: "right", label: t("0.24 A", "0.24 A") },
        {
          id: "two",
          label: t("0.08 A", "0.08 A"),
          feedback: t(
            "Three cells of 2 V make 6 V, not 2 V. Then I = 6 ÷ 25.",
            "2 V के तीन सेल 6 V बनाते हैं, 2 V नहीं। फिर I = 6 ÷ 25।",
          ),
        },
        {
          id: "big",
          label: t("4.2 A", "4.2 A"),
          feedback: t(
            "In series, add the resistances first: 5 + 8 + 12 = 25 Ω.",
            "श्रेणीक्रम में पहले प्रतिरोध जोड़ो: 5 + 8 + 12 = 25 Ω।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const q2 = choiceQuestion(b, {
      name: "q2",
      prompt: t(
        "And what does a voltmeter across the 12 Ω resistor read?",
        "और 12 Ω के प्रतिरोधक के सिरों पर वोल्टमीटर कितना पढ़ता है?",
      ),
      options: [
        { id: "right", label: t("2.88 V", "2.88 V") },
        {
          id: "six",
          label: t("6 V", "6 V"),
          feedback: t(
            "6 V is across all three together. Across one resistor: V = IR = 0.24 × 12.",
            "6 V तीनों के सिरों पर मिलाकर है। एक प्रतिरोधक पर: V = IR = 0.24 × 12।",
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
        "A 9 V battery is in series with resistors of 0.2 Ω, 0.3 Ω, 0.4 Ω, 0.5 Ω and 12 Ω. How much current flows through the 12 Ω resistor?",
        "9 V की बैटरी 0.2 Ω, 0.3 Ω, 0.4 Ω, 0.5 Ω और 12 Ω के प्रतिरोधकों के साथ श्रेणीक्रम में है। 12 Ω के प्रतिरोधक में कितनी धारा बहती है?",
      ),
      options: [
        { id: "right", label: t("About 0.67 A", "लगभग 0.67 A") },
        {
          id: "alone",
          label: t("0.75 A", "0.75 A"),
          feedback: t(
            "That treats the 12 Ω as if it were alone. All five are in the path: 13.4 Ω in total.",
            "इसमें 12 Ω को अकेला मान लिया। पाँचों रास्ते में हैं: कुल 13.4 Ω।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ In series: one path, the same current everywhere, and the potential differences add up. ✓ Rs = R₁ + R₂ + R₃. ✓ One broken part stops everything, which is why the fairy lights died together. Next stop: how our house is really wired.",
        "**मिशन लॉग।** ✓ श्रेणीक्रम में: एक रास्ता, हर जगह वही धारा, और विभवांतर जुड़ते हैं। ✓ Rs = R₁ + R₂ + R₃। ✓ एक टूटा भाग सब रोक देता है, इसीलिए झालर एक साथ बुझी। अगला पड़ाव: हमारे घर की वायरिंग असल में कैसी है।",
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

export const overview = [hook, twoWays, sameCurrent, voltages, rule, inLife, example, yourTurn];

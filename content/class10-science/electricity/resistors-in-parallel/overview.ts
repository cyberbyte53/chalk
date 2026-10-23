import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, goalQuestion, wordsOn } from "@chalk/patterns";
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

/** NCERT Fig 12.10: 5, 10 and 30 Ω in parallel on 12 V. */
const fig1210 = {
  mode: ComboMode.Parallel,
  parts: [resistor(5), resistor(10), resistor(30)],
  volts: 12,
  ammeterAt: MAIN,
  voltmeterAcross: null,
  showValues: false,
  showEquivalent: false,
  canEdit: false,
  canMoveMeters: true,
  canBreak: false,
};

/* Hook */

const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const pic = sceneOn(
    b,
    "pic",
    ElectricityScene.MessyWiring,
    "the switchboard on the wall with its wires behind it; Riya and Kabir look at it",
  );
  return column([
    w.title(t("How is our house wired?", "हमारे घर की वायरिंग कैसी है?")),
    pic,
    w.body(
      t(
        "If the house were wired in series, switching off the TV would switch off everything, like the fairy lights. It doesn't: the fan keeps turning, the fridge keeps humming. And each gadget seems to get the full 220 V. So the house must be wired the other way. Seventh stop: **resistors in parallel**.",
        "अगर घर की वायरिंग श्रेणीक्रम में होती, तो टीवी बंद करने से सब कुछ बंद हो जाता, झालर की तरह। ऐसा नहीं होता: पंखा चलता रहता है, फ़्रिज गुनगुनाता रहता है। और हर उपकरण को पूरे 220 V मिलते लगते हैं। तो घर की वायरिंग दूसरे तरीक़े से होनी चाहिए। सातवाँ पड़ाव: **पार्श्वक्रम में प्रतिरोधक**।",
      ),
    ),
    space(),
  ]);
});

/* Learn */

/** Activity 12.6: the currents add up. */
const currents = page(
  "currents",
  (b) => {
    const w = wordsOn(b);
    const combo = b.prop(resistorComboDef, "combo", fig1210);
    b.studentOnly(combo.action(ComboAction.MoveAmmeter));
    b.standsFor(
      combo,
      "NCERT Activity 12.6: 5 Ω, 10 Ω and 30 Ω resistors in parallel on a 12 V battery; the ammeter can be put in the main line or in any one branch",
    );
    const goal = goalQuestion(b, {
      about: combo,
      prompt: t("Put the ammeter in the branch with R₁.", "ऐमीटर को R₁ वाली शाखा में लगाओ।"),
      isMet: combo.field("ammeterAt").eq(0),
      solve: [combo.learner(ComboAction.MoveAmmeter, { at: 0 })],
    });
    const ask = choiceQuestion(b, {
      name: "sum",
      prompt: t(
        "Read the main line (4 A), then each branch: 2.4 A, 1.2 A, 0.4 A. What's the rule?",
        "मुख्य तार (4 A) पढ़ो, फिर हर शाखा: 2.4 A, 1.2 A, 0.4 A। नियम क्या है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "The total current is the sum of the branch currents: I = I₁ + I₂ + I₃",
            "कुल धारा शाखाओं की धाराओं का योग है: I = I₁ + I₂ + I₃",
          ),
        },
        {
          id: "same",
          label: t("Every branch carries the same current", "हर शाखा में एक जैसी धारा है"),
          feedback: t(
            "That's series. Here the branches carry different currents: the smallest resistance takes the most.",
            "वह श्रेणीक्रम है। यहाँ शाखाओं में अलग धाराएँ हैं: सबसे कम प्रतिरोध सबसे ज़्यादा लेता है।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
    });
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(ask));
    return column([
      w.title(t("The current divides", "धारा बँट जाती है")),
      w.body(
        t(
          "NCERT Activity 12.6. Three resistors, 5 Ω, 10 Ω and 30 Ω, are joined in parallel between points X and Y, on a 12 V battery. The ammeter can go in the main line or in any one branch.",
          "NCERT क्रियाकलाप 12.6। तीन प्रतिरोधक, 5 Ω, 10 Ω और 30 Ω, 12 V की बैटरी पर बिंदुओं X और Y के बीच पार्श्वक्रम में जुड़े हैं। ऐमीटर मुख्य तार में या किसी भी एक शाखा में लग सकता है।",
        ),
      ),
      combo,
      goal,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The same V across each branch. */
const sameV = page(
  "same-v",
  (b) => {
    const w = wordsOn(b);
    const combo = b.prop(resistorComboDef, "combo", { ...fig1210, voltmeterAcross: MAIN });
    b.studentOnly(combo.action(ComboAction.MoveVoltmeter));
    b.standsFor(
      combo,
      "the parallel circuit with a voltmeter that can be placed across the whole combination or across one resistor",
    );
    const ask = choiceQuestion(b, {
      prompt: t(
        "Move the voltmeter across each resistor. What does it read?",
        "वोल्टमीटर को हर प्रतिरोधक के सिरों पर ले जाओ। यह क्या पढ़ता है?",
      ),
      options: [
        {
          id: "right",
          label: t("12 V across every one", "हर एक पर 12 V"),
        },
        {
          id: "shared",
          label: t("4 V across each: the 12 V is shared", "हर एक पर 4 V: 12 V बँट जाते हैं"),
          feedback: t(
            "Sharing happens in series. In parallel each resistor is joined straight across X and Y, so each gets the full 12 V.",
            "बँटवारा श्रेणीक्रम में होता है। पार्श्वक्रम में हर प्रतिरोधक सीधे X और Y के बीच जुड़ा है, इसलिए हर एक को पूरे 12 V मिलते हैं।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("The same push across each", "हर एक पर वही धक्का")),
      combo,
      ask,
      w.note(
        t(
          "In parallel, the **potential difference across each resistor is the same**, equal to the potential difference across the combination.",
          "पार्श्वक्रम में **हर प्रतिरोधक पर विभवांतर एक जैसा होता है**, संयोजन के सिरों के विभवांतर के बराबर।",
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** 1/Rp = 1/R1 + 1/R2 + 1/R3. */
const rule = page(
  "rule",
  (b) => {
    const w = wordsOn(b);
    const combo = b.prop(resistorComboDef, "combo", {
      ...fig1210,
      showValues: true,
      showEquivalent: true,
      canEdit: true,
      canMoveMeters: false,
    });
    b.studentOnly(combo.action(ComboAction.SetOhms));
    b.standsFor(
      combo,
      "the parallel circuit with each resistor's value adjustable; each branch's current and the equivalent resistance are shown",
    );
    const ask = choiceQuestion(b, {
      prompt: t(
        "Change the values and watch the equivalent resistance. How does it compare with the smallest resistor?",
        "मान बदलो और तुल्य प्रतिरोध देखो। यह सबसे छोटे प्रतिरोधक की तुलना में कैसा है?",
      ),
      options: [
        { id: "right", label: t("Always smaller than the smallest", "हमेशा सबसे छोटे से भी कम") },
        {
          id: "between",
          label: t("Somewhere between the smallest and largest", "सबसे छोटे और सबसे बड़े के बीच कहीं"),
          feedback: t(
            "Each extra branch is an extra path, so the combination lets more current through than any branch alone: less resistance than the smallest.",
            "हर अतिरिक्त शाखा एक अतिरिक्त रास्ता है, इसलिए संयोजन किसी भी अकेली शाखा से ज़्यादा धारा जाने देता है: सबसे छोटे से भी कम प्रतिरोध।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("The parallel rule", "पार्श्वक्रम का नियम")),
      w.body(
        t(
          r`Each resistor has the full $V$ across it, so by Ohm's law $$I_1 = \frac{V}{R_1} \qquad I_2 = \frac{V}{R_2} \qquad I_3 = \frac{V}{R_3}$$ The branch currents add up to $I$, and for the equivalent resistor $I = V/R_p$: $$\frac{V}{R_p} = \frac{V}{R_1} + \frac{V}{R_2} + \frac{V}{R_3}$$ Divide by $V$: $$\frac{1}{R_p} = \frac{1}{R_1} + \frac{1}{R_2} + \frac{1}{R_3}$$`,
          r`हर प्रतिरोधक पर पूरा $V$ है, इसलिए ओम के नियम से $$I_1 = \frac{V}{R_1} \qquad I_2 = \frac{V}{R_2} \qquad I_3 = \frac{V}{R_3}$$ शाखाओं की धाराएँ जुड़कर $I$ बनती हैं, और तुल्य प्रतिरोधक के लिए $I = V/R_p$: $$\frac{V}{R_p} = \frac{V}{R_1} + \frac{V}{R_2} + \frac{V}{R_3}$$ $V$ से भाग दो: $$\frac{1}{R_p} = \frac{1}{R_1} + \frac{1}{R_2} + \frac{1}{R_3}$$`,
        ),
      ),
      w.definition(
        t(
          "**In parallel, reciprocals add.** The **reciprocal** of a number is 1 divided by it (the reciprocal of 5 is 1/5). For resistors in parallel, the reciprocal of the equivalent resistance is the sum of the reciprocals of the individual resistances.",
          "**पार्श्वक्रम में व्युत्क्रम जुड़ते हैं।** किसी संख्या का **व्युत्क्रम** 1 को उससे भाग देने पर मिलता है (5 का व्युत्क्रम 1/5 है)। पार्श्वक्रम में प्रतिरोधकों के लिए, तुल्य प्रतिरोध का व्युत्क्रम अलग-अलग प्रतिरोधों के व्युत्क्रमों का योग है।",
        ),
      ),
      combo,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Mixed: NCERT Example 12.9. */
const mixed = page(
  "mixed",
  (b) => {
    const w = wordsOn(b);
    const combo = b.prop(resistorComboDef, "combo", {
      mode: ComboMode.Mixed,
      parts: [resistor(10), resistor(40), resistor(30), resistor(20), resistor(60)],
      volts: 12,
      ammeterAt: MAIN,
      voltmeterAcross: null,
      showValues: false,
      showEquivalent: false,
      canEdit: false,
      canMoveMeters: true,
      canBreak: false,
    });
    b.studentOnly(combo.action(ComboAction.MoveAmmeter));
    b.studentOnly(combo.action(ComboAction.MoveVoltmeter));
    b.standsFor(
      combo,
      "NCERT Fig 12.12: R₁ = 10 Ω and R₂ = 40 Ω in parallel, followed in series by R₃ = 30 Ω, R₄ = 20 Ω and R₅ = 60 Ω in parallel, on a 12 V battery",
    );
    const ask = choiceQuestion(b, {
      prompt: t(
        r`$R_1 \parallel R_2$ gives $R' = 8\ \Omega$ and $R_3 \parallel R_4 \parallel R_5$ gives $R'' = 10\ \Omega$. What is the total resistance?`,
        r`$R_1 \parallel R_2$ से $R' = 8\ \Omega$ और $R_3 \parallel R_4 \parallel R_5$ से $R'' = 10\ \Omega$ मिलता है। कुल प्रतिरोध कितना है?`,
      ),
      options: [
        { id: "right", label: t("18 Ω", "18 Ω") },
        {
          id: "par",
          label: t("4.4 Ω", "4.4 Ω"),
          feedback: t(
            "R′ and R″ are one after another (in series), so they add: 8 + 10.",
            "R′ और R″ एक के बाद एक (श्रेणीक्रम में) हैं, इसलिए जुड़ते हैं: 8 + 10।",
          ),
        },
        {
          id: "all",
          label: t("160 Ω", "160 Ω"),
          feedback: t(
            "That adds all five as if they were in series. Combine each parallel group first.",
            "इसमें पाँचों को श्रेणीक्रम मानकर जोड़ दिया। पहले हर पार्श्वक्रम समूह को मिलाओ।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Mixed circuits", "मिश्रित परिपथ")),
      w.body(
        t(
          "Real circuits mix the two. To solve one, replace each parallel group by its equivalent resistor, then add the groups that are in series. NCERT Example 12.9:",
          "असली परिपथ दोनों को मिलाते हैं। ऐसा परिपथ हल करने के लिए हर पार्श्वक्रम समूह की जगह उसका तुल्य प्रतिरोधक रखो, फिर श्रेणीक्रम वाले समूहों को जोड़ो। NCERT उदाहरण 12.9:",
        ),
      ),
      combo,
      w.body(
        t(
          r`$$\frac{1}{R'} = \frac{1}{10} + \frac{1}{40} = \frac{5}{40}, \quad R' = 8\ \Omega$$ $$\frac{1}{R''} = \frac{1}{30} + \frac{1}{20} + \frac{1}{60} = \frac{6}{60}, \quad R'' = 10\ \Omega$$`,
          r`$$\frac{1}{R'} = \frac{1}{10} + \frac{1}{40} = \frac{5}{40}, \quad R' = 8\ \Omega$$ $$\frac{1}{R''} = \frac{1}{30} + \frac{1}{20} + \frac{1}{60} = \frac{6}{60}, \quad R'' = 10\ \Omega$$`,
        ),
      ),
      ask,
      w.note(
        t(
          "Then the current from the battery is I = 12 V ÷ 18 Ω ≈ 0.67 A. Move the ammeter to check.",
          "तब बैटरी से धारा I = 12 V ÷ 18 Ω ≈ 0.67 A है। जाँचने के लिए ऐमीटर खिसकाओ।",
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
    const house = b.prop(resistorComboDef, "house", {
      mode: ComboMode.Parallel,
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
    b.studentOnly(house.action(ComboAction.ToggleBreak));
    b.standsFor(
      house,
      "three bulbs in parallel on a battery, all glowing; tapping a bulb breaks its filament",
    );
    const ask = choiceQuestion(b, {
      prompt: t(
        "Break one bulb here. Why is a house wired in parallel and not in series?",
        "यहाँ एक बल्ब तोड़ो। घर की वायरिंग श्रेणीक्रम की जगह पार्श्वक्रम में क्यों होती है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Each gadget gets the full voltage, takes its own current, and works even if another is off",
            "हर उपकरण को पूरा वोल्टेज मिलता है, वह अपनी धारा लेता है, और दूसरा बंद हो तब भी चलता है",
          ),
        },
        {
          id: "cheap",
          label: t("It uses less wire", "इसमें कम तार लगता है"),
          feedback: t(
            "Wire isn't the reason. In series, one switch off or one bulb gone would stop everything, and everything would share one current.",
            "तार कारण नहीं है। श्रेणीक्रम में एक स्विच बंद या एक बल्ब ख़राब होने से सब रुक जाता, और सबको एक ही धारा बाँटनी पड़ती।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const answer = w.body(
      t(
        "Every socket in the house sits across the same two mains wires: in parallel. The heater takes its big current, the bulb its small one, and each has its own switch. But there's a catch for the bill: every gadget switched on adds another branch, and the **total current** from the mains keeps growing.",
        "घर का हर सॉकेट उन्हीं दो मुख्य तारों के बीच लगा है: पार्श्वक्रम में। हीटर अपनी बड़ी धारा लेता है, बल्ब अपनी छोटी, और हर एक का अपना स्विच है। पर बिल के लिए एक पेच है: हर चालू उपकरण एक और शाखा जोड़ता है, और मुख्य तार से **कुल धारा** बढ़ती जाती है।",
      ),
      "answer",
      { isHidden: true },
    );
    b.when(ask.on(QuestionSignal.Correct), [theBoard.show(answer), theBoard.pass()]);
    return column([w.title(t("The house, explained", "घर, समझाकर")), house, ask, answer, space()]);
  },
  { passOn: PassOn.Rules },
);

/* Practice */

/** Worked: NCERT Example 12.8. */
const example = page("example", (b) => {
  const w = wordsOn(b);
  return column([
    w.title(t("A worked example", "एक हल किया गया उदाहरण")),
    w.body(
      t(
        "**Resistors of 5 Ω, 10 Ω and 30 Ω are in parallel on a 12 V battery. Find (a) the current through each, (b) the total current, (c) the total resistance.**",
        "**5 Ω, 10 Ω और 30 Ω के प्रतिरोधक 12 V की बैटरी पर पार्श्वक्रम में हैं। निकालो (a) हर एक में धारा, (b) कुल धारा, (c) कुल प्रतिरोध।**",
      ),
    ),
    w.body(
      t(
        r`(a) Each has the full 12 V across it: $$I_1 = \frac{12}{5} = 2.4 \text{ A}$$ $$I_2 = \frac{12}{10} = 1.2 \text{ A}$$ $$I_3 = \frac{12}{30} = 0.4 \text{ A}$$ (b) The currents add: $$I = 2.4 + 1.2 + 0.4 = 4 \text{ A}$$ (c) The reciprocals add: $$\frac{1}{R_p} = \frac{1}{5} + \frac{1}{10} + \frac{1}{30} = \frac{6 + 3 + 1}{30} = \frac{1}{3}$$ So $R_p = 3\ \Omega$. Check: $12 \text{ V} / 3\ \Omega = 4$ A.`,
        r`(a) हर एक पर पूरे 12 V हैं: $$I_1 = \frac{12}{5} = 2.4 \text{ A}$$ $$I_2 = \frac{12}{10} = 1.2 \text{ A}$$ $$I_3 = \frac{12}{30} = 0.4 \text{ A}$$ (b) धाराएँ जुड़ती हैं: $$I = 2.4 + 1.2 + 0.4 = 4 \text{ A}$$ (c) व्युत्क्रम जुड़ते हैं: $$\frac{1}{R_p} = \frac{1}{5} + \frac{1}{10} + \frac{1}{30} = \frac{6 + 3 + 1}{30} = \frac{1}{3}$$ इसलिए $R_p = 3\ \Omega$। जाँच: $12 \text{ V} / 3\ \Omega = 4$ A।`,
      ),
    ),
    space(),
  ]);
});

/** Combining to a target: in-text Q4 and Exercise 11. */
const combine = page(
  "combine",
  (b) => {
    const w = wordsOn(b);
    const q1 = choiceQuestion(b, {
      name: "q1",
      prompt: t(
        "How can three resistors of 2 Ω, 3 Ω and 6 Ω be connected to give a total of 4 Ω?",
        "2 Ω, 3 Ω और 6 Ω के तीन प्रतिरोधकों को कुल 4 Ω पाने के लिए कैसे जोड़ा जा सकता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "3 Ω and 6 Ω in parallel (2 Ω), then in series with 2 Ω",
            "3 Ω और 6 Ω पार्श्वक्रम में (2 Ω), फिर 2 Ω के साथ श्रेणीक्रम में",
          ),
        },
        {
          id: "all",
          label: t("All three in parallel", "तीनों पार्श्वक्रम में"),
          feedback: t(
            "All three in parallel: 1/2 + 1/3 + 1/6 = 1, so 1 Ω. That's the other target.",
            "तीनों पार्श्वक्रम में: 1/2 + 1/3 + 1/6 = 1, यानी 1 Ω। यह दूसरा लक्ष्य है।",
          ),
        },
        {
          id: "series",
          label: t("All three in series", "तीनों श्रेणीक्रम में"),
          feedback: t(
            "In series they make 2 + 3 + 6 = 11 Ω.",
            "श्रेणीक्रम में वे 2 + 3 + 6 = 11 Ω बनाते हैं।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const q2 = choiceQuestion(b, {
      name: "q2",
      prompt: t(
        "Three resistors of 6 Ω each. How do you get 9 Ω?",
        "6 Ω के तीन प्रतिरोधक। 9 Ω कैसे पाओगे?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Two in parallel (3 Ω), in series with the third",
            "दो पार्श्वक्रम में (3 Ω), तीसरे के साथ श्रेणीक्रम में",
          ),
        },
        {
          id: "other",
          label: t(
            "Two in series (12 Ω), in parallel with the third",
            "दो श्रेणीक्रम में (12 Ω), तीसरे के साथ पार्श्वक्रम में",
          ),
          feedback: t(
            "12 Ω in parallel with 6 Ω gives 12 × 6 ÷ 18 = 4 Ω. That's how to get 4 Ω, not 9.",
            "12 Ω के साथ पार्श्वक्रम में 6 Ω से 12 × 6 ÷ 18 = 4 Ω मिलता है। यह 4 Ω पाने का तरीक़ा है, 9 नहीं।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    b.when(q1.on(QuestionSignal.Correct), theBoard.show(q2));
    b.when(q2.on(QuestionSignal.Correct), theBoard.pass());
    return column([
      w.title(t("Hitting a target", "लक्ष्य तक पहुँचना")),
      w.note(
        t(
          "Two equal resistors in parallel give half of one. For two resistors, Rp = R₁R₂ ÷ (R₁ + R₂).",
          "दो बराबर प्रतिरोधक पार्श्वक्रम में एक का आधा देते हैं। दो प्रतिरोधकों के लिए Rp = R₁R₂ ÷ (R₁ + R₂)।",
        ),
      ),
      q1,
      q2,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Your turn (Exercises 13 and 10), then the mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const q1 = choiceQuestion(b, {
      name: "q1",
      prompt: t(
        "A hot plate on a 220 V line has two coils of 24 Ω each. What current flows when the two coils are used in parallel?",
        "220 V लाइन पर एक हॉट प्लेट में 24 Ω की दो कुंडलियाँ हैं। दोनों कुंडलियों को पार्श्वक्रम में लगाने पर कितनी धारा बहती है?",
      ),
      options: [
        { id: "right", label: t("About 18.3 A", "लगभग 18.3 A") },
        {
          id: "one",
          label: t("About 9.2 A", "लगभग 9.2 A"),
          feedback: t(
            "That's one coil on its own (220 ÷ 24). Two in parallel make 12 Ω, so twice the current.",
            "यह अकेली एक कुंडली है (220 ÷ 24)। दो पार्श्वक्रम में 12 Ω बनाती हैं, इसलिए दोगुनी धारा।",
          ),
        },
        {
          id: "series",
          label: t("About 4.6 A", "लगभग 4.6 A"),
          feedback: t(
            "That's the two in series (48 Ω). In parallel the resistance is 12 Ω.",
            "यह दोनों श्रेणीक्रम में हैं (48 Ω)। पार्श्वक्रम में प्रतिरोध 12 Ω है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const q2 = choiceQuestion(b, {
      name: "q2",
      prompt: t(
        "How many 176 Ω resistors in parallel are needed to carry 5 A on a 220 V line?",
        "220 V लाइन पर 5 A ले जाने के लिए 176 Ω के कितने प्रतिरोधक पार्श्वक्रम में चाहिए?",
      ),
      options: [
        { id: "right", label: t("4", "4") },
        {
          id: "five",
          label: t("5", "5"),
          feedback: t(
            "Each one takes 220 ÷ 176 = 1.25 A. How many 1.25 A make 5 A?",
            "हर एक 220 ÷ 176 = 1.25 A लेता है। कितने 1.25 A मिलकर 5 A बनाते हैं?",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ In parallel: the same potential difference across each branch, and the branch currents add. ✓ 1/Rp = 1/R₁ + 1/R₂ + 1/R₃, smaller than the smallest. ✓ The house is wired in parallel, so every gadget switched on adds to the total current. Next stop: where all that current turns into heat.",
        "**मिशन लॉग।** ✓ पार्श्वक्रम में: हर शाखा पर वही विभवांतर, और शाखाओं की धाराएँ जुड़ती हैं। ✓ 1/Rp = 1/R₁ + 1/R₂ + 1/R₃, सबसे छोटे से भी कम। ✓ घर की वायरिंग पार्श्वक्रम में है, इसलिए हर चालू उपकरण कुल धारा बढ़ाता है। अगला पड़ाव: वह सारी धारा कहाँ गर्मी बनती है।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(q1.on(QuestionSignal.Correct), theBoard.show(q2));
    b.when(q2.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), q1, q2, log, space()]);
  },
  { passOn: PassOn.Rules },
);

export const overview = [hook, currents, sameV, rule, mixed, inLife, example, combine, yourTurn];

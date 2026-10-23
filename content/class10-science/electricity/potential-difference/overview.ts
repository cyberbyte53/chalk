import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, goalQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  ElectricityScene,
  Pipe,
  TankAction,
  TankDerived,
  waterTankDef,
} from "@chalk/prop-electricity";
import { figure121, sceneOn } from "../kit";

const r = String.raw;

/* Hook */

/** The roof tank: water needs a difference in level to flow. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const pic = sceneOn(
    b,
    "pic",
    ElectricityScene.RoofTank,
    "the house with the black water tank on the roof, a pipe running down to a tap where Riya fills a bucket",
  );
  return column([
    w.title(t("What pushes the current?", "धारा को कौन धकेलता है?")),
    pic,
    w.body(
      t(
        "Stop 1 showed that a current is charge going round a closed circuit, and that the charge comes back. Next morning, filling a bucket from the tap, Riya wonders: why does the water come out at all? Because the tank is up on the roof. If the tank sat on the ground, level with the tap, nothing would flow.",
        "पड़ाव 1 ने दिखाया कि धारा एक बंद परिपथ में घूमता आवेश है, और आवेश वापस आ जाता है। अगली सुबह नल से बाल्टी भरते हुए रिया सोचती है: पानी निकलता ही क्यों है? क्योंकि टंकी छत पर है। अगर टंकी ज़मीन पर नल के बराबर रखी होती, तो कुछ नहीं बहता।",
      ),
    ),
    w.body(
      t(
        "Kabir holds up a torch cell: **\"It says 1.5 V. Is that the cell's 'height'?\"** Second stop: **potential difference**, the push that makes charge flow.",
        "कबीर टॉर्च का एक सेल उठाता है: **\"इस पर 1.5 V लिखा है। क्या यह सेल की 'ऊँचाई' है?\"** दूसरा पड़ाव: **विभवांतर**, वह धक्का जो आवेश को बहाता है।",
      ),
    ),
    space(),
  ]);
});

/* Learn */

/** The water picture: flow needs a difference of level. */
const water = page(
  "water",
  (b) => {
    const w = wordsOn(b);
    const tank = b.prop(waterTankDef, "tank", {
      level: 0,
      pipe: Pipe.Wide,
      isOpen: true,
      showTwin: false,
      showLinks: false,
      canSetLevel: true,
      canSetPipe: false,
      canOpen: true,
    });
    b.studentOnly(tank.action(TankAction.SetLevel));
    b.studentOnly(tank.action(TankAction.SetTap));
    b.standsFor(
      tank,
      "a water tank joined by a pipe to an open tap; the tank starts level with the tap, so no water flows; the tank can be raised",
    );
    const goal = goalQuestion(b, {
      about: tank,
      prompt: t(
        "The tap is open but nothing comes out. Make the water flow.",
        "नल खुला है पर कुछ नहीं निकलता। पानी बहाओ।",
      ),
      isMet: tank.derived(TankDerived.IsFlowing),
      solve: [tank.learner(TankAction.SetLevel, { level: 2 })],
    });
    const found = w.body(
      t(
        "Water flows only when there is a **difference in level** (a pressure difference) between the two ends of the pipe. The higher the tank, the harder the push.",
        "पानी तभी बहता है जब पाइप के दोनों सिरों के बीच **स्तर में अंतर** (दाब का अंतर) हो। टंकी जितनी ऊँची, धक्का उतना ज़ोरदार।",
      ),
      "found",
      { isHidden: true },
    );
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(found));
    return column([
      w.title(t("Water needs a difference in level", "पानी को स्तर में अंतर चाहिए")),
      w.body(
        t(
          "Water in a perfectly level pipe doesn't flow by itself. Try it.",
          "बिल्कुल समतल पाइप में पानी अपने आप नहीं बहता। आज़माकर देखो।",
        ),
      ),
      tank,
      goal,
      found,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Potential difference: the electric push; V = W/Q; the volt. */
const push = page(
  "push",
  (b) => {
    const w = wordsOn(b);
    const tank = b.prop(waterTankDef, "tank", {
      level: 2,
      pipe: Pipe.Wide,
      isOpen: true,
      showTwin: true,
      showLinks: true,
      canSetLevel: true,
      canSetPipe: false,
      canOpen: true,
    });
    b.studentOnly(tank.action(TankAction.SetLevel));
    b.studentOnly(tank.action(TankAction.SetTap));
    b.standsFor(
      tank,
      "the tank and tap beside their circuit twin: cells, a resistor, a key and an ammeter; raising the tank raises the cells' push (potential difference) and the current",
    );
    const ask = choiceQuestion(b, {
      prompt: t(
        "Set the tank level with the tap. What does the circuit twin show?",
        "टंकी को नल के बराबर करो। परिपथ जुड़वाँ क्या दिखाता है?",
      ),
      options: [
        {
          id: "right",
          label: t("0 V across the circuit, so no current", "परिपथ पर 0 V, इसलिए कोई धारा नहीं"),
        },
        {
          id: "some",
          label: t("A small current still flows", "थोड़ी धारा फिर भी बहती है"),
          feedback: t(
            "Look at the ammeter: 0 A. No potential difference, no flow, just like the water.",
            "ऐमीटर देखो: 0 A। कोई विभवांतर नहीं, कोई बहाव नहीं, ठीक पानी की तरह।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Potential difference", "विभवांतर")),
      w.definition(
        t(
          '**Potential difference.** Charges in a wire don\'t flow by themselves either. They move only if there is a difference of electric "pressure" between the ends of the conductor. This is called the **potential difference**. Gravity plays no part: the push is electric.',
          '**विभवांतर।** तार में आवेश भी अपने आप नहीं बहते। वे तभी चलते हैं जब चालक के सिरों के बीच विद्युत "दाब" में अंतर हो। इसे **विभवांतर** कहते हैं। इसमें गुरुत्व की कोई भूमिका नहीं: धक्का विद्युत का है।',
        ),
      ),
      w.definition(
        t(
          "**What a cell does.** Chemical action inside a cell keeps a potential difference between its two terminals, even when no current is drawn. Join it to a circuit and charges start to move. To keep the current going, the cell uses up its stored chemical energy. That energy is what runs out in an old cell.",
          "**सेल क्या करता है।** सेल के अंदर की रासायनिक क्रिया उसके दोनों सिरों के बीच विभवांतर बनाए रखती है, तब भी जब कोई धारा न ली जा रही हो। इसे परिपथ से जोड़ो और आवेश चलने लगते हैं। धारा चलाए रखने के लिए सेल अपनी जमा रासायनिक ऊर्जा ख़र्च करता है। पुराने सेल में यही ऊर्जा ख़त्म होती है।",
        ),
      ),
      w.body(
        t(
          "Here is the tank beside its circuit twin: the tank's height plays the cells' potential difference, the flow of water plays the current, and the tap plays the key.",
          "यहाँ टंकी अपने परिपथ जुड़वाँ के बगल में है: टंकी की ऊँचाई सेलों के विभवांतर का, पानी का बहाव धारा का, और नल कुंजी का काम करते हैं।",
        ),
      ),
      tank,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** V = W/Q and the volt. */
const volt = page(
  "volt",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      prompt: t(
        "How much energy is given to each coulomb of charge passing through a 6 V battery?",
        "6 V की बैटरी में से गुज़रने वाले हर कूलॉम आवेश को कितनी ऊर्जा मिलती है?",
      ),
      options: [
        { id: "right", label: t("6 J", "6 J") },
        {
          id: "one",
          label: t("1 J", "1 J"),
          feedback: t(
            "1 V gives 1 J to each coulomb. This battery is 6 V.",
            "1 V हर कूलॉम को 1 J देता है। यह बैटरी 6 V की है।",
          ),
        },
        {
          id: "sixth",
          label: t("1/6 J", "1/6 J"),
          feedback: t(
            "Volts are joules per coulomb, so 6 V means 6 J for every coulomb, not 1/6.",
            "वोल्ट यानी जूल प्रति कूलॉम, इसलिए 6 V का अर्थ है हर कूलॉम के लिए 6 J, 1/6 नहीं।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Measuring the push: the volt", "धक्के को मापना: वोल्ट")),
      w.definition(
        t(
          r`**Potential difference, in symbols.** The potential difference $V$ between two points is the **work done** to move one unit of charge from one point to the other. If moving a charge $Q$ takes work $W$, then $$V = \frac{W}{Q}$$ Work is measured in joules (J), the unit of energy you met in Class 9.`,
          r`**विभवांतर, प्रतीकों में।** दो बिंदुओं के बीच विभवांतर $V$ एक इकाई आवेश को एक बिंदु से दूसरे तक ले जाने में किया गया **कार्य** है। यदि आवेश $Q$ को ले जाने में कार्य $W$ लगता है, तो $$V = \frac{W}{Q}$$ कार्य जूल (J) में मापा जाता है, ऊर्जा का वह मात्रक जो तुमने कक्षा 9 में पढ़ा।`,
        ),
      ),
      w.definition(
        t(
          r`**The volt.** Potential difference is measured in **volts** (V). One volt is the potential difference between two points when 1 joule of work moves 1 coulomb of charge between them: $$1 \text{ V} = \frac{1 \text{ J}}{1 \text{ C}}$$ So a 1.5 V cell gives each coulomb that passes through it 1.5 J of energy.`,
          r`**वोल्ट।** विभवांतर **वोल्ट** (V) में मापा जाता है। दो बिंदुओं के बीच विभवांतर एक वोल्ट है जब 1 जूल कार्य 1 कूलॉम आवेश को उनके बीच ले जाता है: $$1 \text{ V} = \frac{1 \text{ J}}{1 \text{ C}}$$ इसलिए 1.5 V का सेल अपने में से गुज़रने वाले हर कूलॉम को 1.5 J ऊर्जा देता है।`,
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The voltmeter, always in parallel. */
const voltmeter = page(
  "voltmeter",
  (b) => {
    const w = wordsOn(b);
    const c = figure121(b, "circuit", { isClosed: true, withVoltmeter: true });
    b.standsFor(
      c,
      "the cell, bulb, ammeter and key circuit with a voltmeter connected across the bulb on its own side path, from one end of the bulb to the other",
    );
    const ask = choiceQuestion(b, {
      prompt: t(
        "How is the voltmeter connected to measure the potential difference across the bulb?",
        "बल्ब के सिरों के बीच विभवांतर मापने के लिए वोल्टमीटर कैसे जोड़ा गया है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "In parallel: its two ends join the bulb's two ends",
            "पार्श्वक्रम में: इसके दोनों सिरे बल्ब के दोनों सिरों से जुड़े हैं",
          ),
        },
        {
          id: "series",
          label: t("In series, in the same path as the bulb", "श्रेणीक्रम में, बल्ब के उसी रास्ते में"),
          feedback: t(
            "That's how the ammeter goes. The voltmeter compares two points, so it bridges across them.",
            "ऐमीटर ऐसे लगता है। वोल्टमीटर दो बिंदुओं की तुलना करता है, इसलिए उनके आर-पार पुल की तरह लगता है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("The voltmeter", "वोल्टमीटर")),
      w.definition(
        t(
          "**Voltmeter.** A **voltmeter** measures the potential difference between two points. It is always connected **in parallel** across those points: one end of the voltmeter to each point, on a path of its own.",
          "**वोल्टमीटर।** **वोल्टमीटर** दो बिंदुओं के बीच विभवांतर मापता है। इसे हमेशा उन बिंदुओं के आर-पार **पार्श्वक्रम** में जोड़ा जाता है: वोल्टमीटर का एक सिरा हर बिंदु से, अपने अलग रास्ते पर।",
        ),
      ),
      c,
      w.note(
        t(
          "Ammeter: in series, because the current must go through it. Voltmeter: in parallel, because it compares the two ends.",
          "ऐमीटर: श्रेणीक्रम में, क्योंकि धारा को उसमें से जाना है। वोल्टमीटर: पार्श्वक्रम में, क्योंकि वह दोनों सिरों की तुलना करता है।",
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* See it in life */

/** Back to the tank and Kabir's cell. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const pic = sceneOn(b, "pic", ElectricityScene.RoofTank, "the roof tank and the tap again");
    const ask = choiceQuestion(b, {
      name: "flat",
      prompt: t(
        'Kabir\'s torch has gone dim again, and this time the spring is fine. Mom says the cells are "flat". In terms of this lesson, what has happened?',
        'कबीर की टॉर्च फिर धीमी हो गई है, और इस बार स्प्रिंग ठीक है। मम्मी कहती हैं सेल "ख़त्म" हो गए। इस पाठ के हिसाब से क्या हुआ है?',
      ),
      options: [
        {
          id: "right",
          label: t(
            "Their chemical energy is used up, so they can't keep up the potential difference",
            "उनकी रासायनिक ऊर्जा ख़त्म हो गई, इसलिए वे विभवांतर बनाए नहीं रख सकते",
          ),
        },
        {
          id: "charge",
          label: t("They have run out of charge", "उनका आवेश ख़त्म हो गया"),
          feedback: t(
            "Charge goes round and comes back (stop 1). What a cell spends is energy, to keep pushing the charge round.",
            "आवेश घूमकर वापस आता है (पड़ाव 1)। सेल ऊर्जा ख़र्च करता है, आवेश को घुमाते रहने के लिए।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const answer = w.body(
      t(
        "Riya writes it down: **a cell is like a pump that keeps the tank full**. The 1.5 V on Kabir's cell means every coulomb it pushes round gets 1.5 J of energy. And that is a clue for the bill: what we pay for must be **energy**, not charge.",
        "रिया लिखती है: **सेल उस पंप जैसा है जो टंकी को भरा रखता है**। कबीर के सेल पर 1.5 V का अर्थ है कि वह जो भी कूलॉम घुमाता है उसे 1.5 J ऊर्जा मिलती है। और यह बिल के लिए एक सुराग है: हम जिसका भुगतान करते हैं वह **ऊर्जा** होनी चाहिए, आवेश नहीं।",
      ),
      "answer",
      { isHidden: true },
    );
    b.when(ask.on(QuestionSignal.Correct), [theBoard.show(answer), theBoard.pass()]);
    return column([w.title(t("The pump on the roof", "छत का पंप")), pic, ask, answer, space()]);
  },
  { passOn: PassOn.Rules },
);

/* Practice */

/** Worked: NCERT Example 12.2. */
const example = page("example", (b) => {
  const w = wordsOn(b);
  return column([
    w.title(t("A worked example", "एक हल किया गया उदाहरण")),
    w.body(
      t(
        "**How much work is done in moving a charge of 2 C across two points with a potential difference of 12 V?**",
        "**12 V विभवांतर वाले दो बिंदुओं के बीच 2 C आवेश ले जाने में कितना कार्य होता है?**",
      ),
    ),
    w.body(
      t(
        r`From $V = W/Q$, the work is $$W = V \times Q$$ So $$W = 12 \text{ V} \times 2 \text{ C} = 24 \text{ J}$$`,
        r`$V = W/Q$ से, कार्य है $$W = V \times Q$$ इसलिए $$W = 12 \text{ V} \times 2 \text{ C} = 24 \text{ J}$$`,
      ),
    ),
    w.body(
      t(
        "**What is meant by saying that the potential difference between two points is 1 V?**",
        "**दो बिंदुओं के बीच विभवांतर 1 V होने का क्या अर्थ है?**",
      ),
    ),
    w.body(
      t(
        "It means 1 joule of work is done to move 1 coulomb of charge from one point to the other.",
        "इसका अर्थ है कि 1 कूलॉम आवेश को एक बिंदु से दूसरे तक ले जाने में 1 जूल कार्य होता है।",
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
    const device = choiceQuestion(b, {
      name: "device",
      prompt: t(
        "Name a device that helps to maintain a potential difference across a conductor.",
        "ऐसी युक्ति बताओ जो किसी चालक के सिरों पर विभवांतर बनाए रखने में मदद करती है।",
      ),
      options: [
        { id: "right", label: t("A cell or a battery", "सेल या बैटरी") },
        {
          id: "ammeter",
          label: t("An ammeter", "ऐमीटर"),
          feedback: t(
            "An ammeter only measures the current. Something has to push it: a cell.",
            "ऐमीटर केवल धारा मापता है। उसे धकेलने के लिए कुछ चाहिए: सेल।",
          ),
        },
        {
          id: "switch",
          label: t("A switch", "स्विच"),
          feedback: t(
            "A switch only closes or opens the path. The push comes from a cell or battery.",
            "स्विच केवल रास्ता बंद या खोलता है। धक्का सेल या बैटरी से आता है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const work = choiceQuestion(b, {
      name: "work",
      prompt: t(
        "A 9 V battery moves 5 C of charge round a circuit. How much energy does it give?",
        "9 V की बैटरी परिपथ में 5 C आवेश घुमाती है। वह कितनी ऊर्जा देती है?",
      ),
      options: [
        { id: "right", label: t("45 J", "45 J") },
        {
          id: "div",
          label: t("1.8 J", "1.8 J"),
          feedback: t(
            "That's 9 ÷ 5. Each coulomb gets 9 J, so 5 coulombs get 9 × 5.",
            "यह 9 ÷ 5 है। हर कूलॉम को 9 J मिलते हैं, तो 5 कूलॉम को 9 × 5।",
          ),
        },
        {
          id: "sum",
          label: t("14 J", "14 J"),
          feedback: t("Energy is W = V × Q, not V + Q.", "ऊर्जा W = V × Q है, V + Q नहीं।"),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ Charge flows only when there is a potential difference. ✓ A cell keeps one up by spending chemical energy. ✓ V = W/Q, measured in volts; a voltmeter goes in parallel. ✓ Clue: the bill must be for energy. Next stop: drawing circuits the quick way.",
        "**मिशन लॉग।** ✓ आवेश तभी बहता है जब विभवांतर हो। ✓ सेल रासायनिक ऊर्जा ख़र्च करके उसे बनाए रखता है। ✓ V = W/Q, वोल्ट में मापा जाता है; वोल्टमीटर पार्श्वक्रम में लगता है। ✓ सुराग: बिल ऊर्जा का होना चाहिए। अगला पड़ाव: परिपथ जल्दी बनाने का तरीक़ा।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(device.on(QuestionSignal.Correct), theBoard.show(work));
    b.when(work.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), device, work, log, space()]);
  },
  { passOn: PassOn.Rules },
);

export const overview = [hook, water, push, volt, voltmeter, inLife, example, yourTurn];

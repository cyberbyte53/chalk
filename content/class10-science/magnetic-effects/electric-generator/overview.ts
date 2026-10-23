import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import { GeneratorAction, MagnetismScene, Rings, generatorDef } from "@chalk/prop-magnetism";
import { sceneOn } from "../kit";

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** The plan for the crank torch. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const pic = sceneOn(
    b,
    "pic",
    MagnetismScene.CrankTorch,
    "the goal: a home-made torch with a hand crank, shining in the dark",
  );
  return column([
    w.title(t("Plan for the crank torch", "क्रैंक टॉर्च की योजना")),
    pic,
    w.body(
      t(
        "The dynamo glows only while the wheel turns, and it's stuck on a bicycle. Riya sketches a plan: a coil of wire between two magnets from the pair of dead speakers in Grandpa's toolbox, a handle to **turn the coil round and round**, and a bulb. Kabir worries: as the coil turns, its arms move up, then down, then up again. Won't the current keep changing direction? And does that matter?",
        "डायनेमो केवल पहिया घूमते समय जलता है, और वह साइकिल पर अटका है। रिया एक योजना बनाती है: दादाजी के औज़ार-बक्से में पड़े दो ख़राब स्पीकरों के दो चुंबकों के बीच तार की एक कुंडली, **कुंडली को गोल-गोल घुमाने** के लिए एक हैंडल, और एक बल्ब। कबीर चिंतित है: कुंडली घूमते समय उसकी भुजाएँ ऊपर जाती हैं, फिर नीचे, फिर ऊपर। क्या धारा बार-बार दिशा नहीं बदलेगी? और क्या इससे फ़र्क पड़ता है?",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** The parts of a generator (Fig. 13.19). */
const parts = page(
  "parts",
  (b) => {
    const w = wordsOn(b);
    const gen = b.prop(generatorDef, "gen", {
      angle: 0,
      rings: Rings.Slip,
      showCurrent: false,
      showGraph: false,
      showLabels: true,
      canTurn: false,
      canRun: false,
    });
    b.standsFor(
      gen,
      "an electric generator seen end-on: coil arms AB and CD between N and S poles, slip rings R1 and R2, brushes B1 and B2 and a galvanometer outside",
    );
    const ask = choiceQuestion(b, {
      prompt: t("What is the principle of an electric generator?", "विद्युत जनित्र का सिद्धांत क्या है?"),
      options: [
        {
          id: "right",
          label: t(
            "Electromagnetic induction: a coil turned in a magnetic field has a current induced in it",
            "विद्युत चुंबकीय प्रेरण: चुंबकीय क्षेत्र में घुमाई गई कुंडली में धारा प्रेरित होती है",
          ),
        },
        {
          id: "force",
          label: t("The force on a current in a magnetic field", "चुंबकीय क्षेत्र में धारा पर बल"),
          feedback: t(
            "That is the motor's principle. A generator works the other way: motion in a field induces a current.",
            "यह मोटर का सिद्धांत है। जनित्र उलटा काम करता है: क्षेत्र में गति से धारा प्रेरित होती है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("The electric generator", "विद्युत जनित्र")),
      w.definition(
        t(
          "**Electric generator.** A device in which **mechanical energy is used to rotate a conductor in a magnetic field to produce electricity**. It works by electromagnetic induction.",
          "**विद्युत जनित्र।** एक युक्ति जिसमें **चुंबकीय क्षेत्र में एक चालक को घुमाने के लिए यांत्रिक ऊर्जा का उपयोग करके विद्युत उत्पन्न की जाती है**। यह विद्युत चुंबकीय प्रेरण से काम करता है।",
        ),
      ),
      w.definition(
        t(
          "**Its parts.** A rectangular **coil ABCD** turns between the poles of a permanent magnet. Its two ends are joined to two **rings, R1 and R2** (slip rings), fixed on the axle and insulated from it. Two fixed **brushes, B1 and B2**, press on R1 and R2 and carry the current to the outside circuit, here a galvanometer.",
          "**इसके भाग।** एक आयताकार **कुंडली ABCD** एक स्थायी चुंबक के ध्रुवों के बीच घूमती है। इसके दोनों सिरे धुरी पर लगे, उससे विद्युतरोधी, दो **वलयों R1 और R2** (सर्पी वलय) से जुड़े हैं। दो स्थिर **ब्रश, B1 और B2**, R1 और R2 पर दबे रहते हैं और धारा को बाहरी परिपथ तक ले जाते हैं, यहाँ एक गैल्वेनोमीटर।",
        ),
      ),
      gen,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Turn the coil: the current reverses every half turn (AC). */
const turn = page(
  "turn",
  (b) => {
    const w = wordsOn(b);
    const gen = b.prop(generatorDef, "gen", {
      angle: 0,
      rings: Rings.Slip,
      showCurrent: true,
      showGraph: true,
      showLabels: true,
      canTurn: true,
      canRun: true,
    });
    b.studentOnly(gen.action(GeneratorAction.Turn));
    b.studentOnly(gen.action(GeneratorAction.Run));
    b.standsFor(
      gen,
      "the generator with slip rings; the learner turns the coil clockwise and a graph traces the outside current against the coil's angle",
    );
    const goal = choiceQuestion(b, {
      name: "goal",
      prompt: t(
        "With arm AB moving up, the current flows A → B, and outside from B2 to B1. Turn the coil half a turn (two 90° turns). Which way does the outside current flow now?",
        "भुजा AB ऊपर जाने पर धारा A → B बहती है, और बाहर B2 से B1। कुंडली को आधा चक्कर (दो बार 90°) घुमाओ। अब बाहरी धारा किस ओर बहती है?",
      ),
      options: [
        { id: "right", label: t("From B1 to B2: it has reversed", "B1 से B2: वह उलट गई है") },
        {
          id: "same",
          label: t("Still from B2 to B1", "अब भी B2 से B1"),
          feedback: t(
            "After half a turn AB is moving down, so its induced current reverses. Watch the galvanometer and the graph.",
            "आधे चक्कर के बाद AB नीचे जा रही है, इसलिए उसकी प्रेरित धारा उलट जाती है। गैल्वेनोमीटर और ग्राफ़ देखो।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const ask = choiceQuestion(b, {
      name: "howOften",
      prompt: t(
        "A coil is rotated in a magnetic field. The induced current changes direction once in each…",
        "एक कुंडली चुंबकीय क्षेत्र में घुमाई जाती है। प्रेरित धारा की दिशा हर … में एक बार बदलती है।",
      ),
      options: [
        { id: "right", label: t("half revolution", "आधे चक्कर") },
        {
          id: "one",
          label: t("one revolution", "एक चक्कर"),
          feedback: t(
            "Look at the graph: it crosses zero twice in each turn. After half a turn, AB is moving down instead of up.",
            "ग्राफ़ देखो: वह हर चक्कर में दो बार शून्य पार करता है। आधे चक्कर के बाद AB ऊपर की जगह नीचे जा रही होती है।",
          ),
        },
        {
          id: "two",
          label: t("two revolutions", "दो चक्कर"),
          feedback: t("Much more often: every half turn.", "इससे कहीं अधिक बार: हर आधे चक्कर पर।"),
        },
        {
          id: "quarter",
          label: t("one-fourth revolution", "एक-चौथाई चक्कर"),
          feedback: t(
            "At a quarter turn the current is only zero for an instant; it reverses at the half turn.",
            "चौथाई चक्कर पर धारा केवल पल भर के लिए शून्य होती है; वह आधे चक्कर पर उलटती है।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
    });
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(ask));
    return column([
      w.title(t("Turn the handle", "हैंडल घुमाओ")),
      gen,
      goal,
      w.definition(
        t(
          "**Alternating current (AC).** After half a turn, CD moves up and AB moves down, so the induced currents in both arms reverse: the current flows **DCBA**, and outside from B1 to B2. A current that **changes direction after equal intervals of time** is an **alternating current (AC)**, and this device is an **AC generator**.",
          "**प्रत्यावर्ती धारा (AC)।** आधे चक्कर के बाद CD ऊपर और AB नीचे जाती है, इसलिए दोनों भुजाओं में प्रेरित धाराएँ उलट जाती हैं: धारा **DCBA** बहती है, और बाहर B1 से B2। जो धारा **बराबर समय-अंतराल के बाद दिशा बदलती** है, वह **प्रत्यावर्ती धारा (AC)** है, और यह युक्ति **AC जनित्र** है।",
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** A split ring gives direct current (DC). */
const dc = page(
  "dc",
  (b) => {
    const w = wordsOn(b);
    const gen = b.prop(generatorDef, "gen", {
      angle: 0,
      rings: Rings.Split,
      showCurrent: true,
      showGraph: true,
      showLabels: true,
      canTurn: true,
      canRun: true,
      canSetRings: true,
    });
    b.studentOnly(gen.action(GeneratorAction.Turn));
    b.studentOnly(gen.action(GeneratorAction.Run));
    b.studentOnly(gen.action(GeneratorAction.SetRings));
    b.standsFor(
      gen,
      "the generator with a split ring; the learner turns it, watches the graph and can switch back to slip rings",
    );
    const ask = choiceQuestion(b, {
      prompt: t(
        "With the split ring, turn the coil a full turn. What does the graph show?",
        "विभक्त वलय के साथ कुंडली को पूरा एक चक्कर घुमाओ। ग्राफ़ क्या दिखाता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "The current never goes below zero: it always flows one way",
            "धारा कभी शून्य से नीचे नहीं जाती: वह हमेशा एक ओर बहती है",
          ),
        },
        {
          id: "same",
          label: t("The same up-and-down wave as before", "पहले जैसी ही ऊपर-नीचे की लहर"),
          feedback: t(
            "Compare with slip rings: with the split ring the half-waves below zero are flipped up.",
            "सर्पी वलयों से तुलना करो: विभक्त वलय के साथ शून्य से नीचे की आधी लहरें ऊपर पलट जाती हैं।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("One-way current", "एक दिशा वाली धारा")),
      w.definition(
        t(
          "**Direct current (DC) and the DC generator.** A current that **does not change direction** is a **direct current (DC)**. To get DC from a generator, use a **split-ring commutator**, as in the motor: then one brush always touches the arm moving up and the other the arm moving down. This is a **DC generator**.",
          "**दिष्ट धारा (DC) और DC जनित्र।** जो धारा **दिशा नहीं बदलती**, वह **दिष्ट धारा (DC)** है। जनित्र से DC पाने के लिए मोटर की तरह **विभक्त वलय दिक्परिवर्तक** लगाओ: तब एक ब्रश हमेशा ऊपर जाती भुजा को और दूसरा नीचे जाती भुजा को छूता है। यह **DC जनित्र** है।",
        ),
      ),
      gen,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** AC in India: 50 Hz, and why AC is used. */
const mains = page(
  "mains",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      prompt: t(
        "The essential difference between an AC generator and a DC generator is that…",
        "AC जनित्र और DC जनित्र में मूल अंतर यह है कि…",
      ),
      options: [
        {
          id: "right",
          label: t(
            "the AC generator has slip rings, the DC generator a split-ring commutator",
            "AC जनित्र में सर्पी वलय होते हैं, DC जनित्र में विभक्त वलय दिक्परिवर्तक",
          ),
        },
        {
          id: "magnet",
          label: t(
            "the AC generator has an electromagnet, the DC generator a permanent magnet",
            "AC जनित्र में विद्युत चुंबक होता है, DC जनित्र में स्थायी चुंबक",
          ),
          feedback: t(
            "Either can use either magnet. What changes is how the coil is joined to the brushes.",
            "दोनों में से कोई भी चुंबक लग सकता है। बदलता यह है कि कुंडली ब्रशों से कैसे जुड़ी है।",
          ),
        },
        {
          id: "volts",
          label: t("the DC generator gives a higher voltage", "DC जनित्र अधिक वोल्टेज देता है"),
          feedback: t(
            "Voltage depends on turns, field and speed, not on AC or DC. The difference is the rings.",
            "वोल्टेज फेरों, क्षेत्र और चाल पर निर्भर करता है, AC या DC पर नहीं। अंतर वलयों का है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("AC at home", "घर में AC")),
      w.body(
        t(
          "Most power stations today produce AC. In India the AC changes direction every **1/100 second**, so it completes 50 back-and-forth cycles each second: its **frequency is 50 Hz**. An important advantage of AC over DC is that electric power can be **sent over long distances without much loss of energy**.",
          "आजकल अधिकांश बिजलीघर AC बनाते हैं। भारत में AC हर **1/100 सेकंड** में दिशा बदलती है, इसलिए वह हर सेकंड 50 आगे-पीछे के चक्र पूरे करती है: उसकी **आवृत्ति 50 Hz** है। DC की तुलना में AC का एक बड़ा लाभ यह है कि विद्युत शक्ति को **बिना अधिक ऊर्जा हानि के लंबी दूरी तक भेजा जा सकता है**।",
        ),
      ),
      w.definition(
        t(
          "**Frequency.** The number of complete back-and-forth cycles an alternating current makes each second is its **frequency**, measured in **hertz (Hz)**: 1 Hz = 1 cycle per second. In India each cycle takes 1/50 s, and the current changes direction twice in every cycle, so it reverses every 1/100 s.",
          "**आवृत्ति।** प्रत्यावर्ती धारा हर सेकंड जितने पूरे आगे-पीछे के चक्र करती है, वह उसकी **आवृत्ति** है, जो **हर्ट्ज़ (Hz)** में मापी जाती है: 1 Hz = 1 चक्र प्रति सेकंड। भारत में हर चक्र 1/50 s लेता है, और हर चक्र में धारा दो बार दिशा बदलती है, इसलिए वह हर 1/100 s में उलटती है।",
        ),
      ),
      w.definition(
        t(
          "**Sources.** **DC** comes from cells, batteries (such as a car battery) and DC generators. **AC** comes from AC generators, such as the ones in power stations.",
          "**स्रोत।** **DC** सेलों, बैटरियों (जैसे कार की बैटरी) और DC जनित्रों से मिलती है। **AC** AC जनित्रों से मिलती है, जैसे बिजलीघरों वाले।",
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

/** The crank torch is built. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const pic = sceneOn(
      b,
      "pic",
      MagnetismScene.CrankTorch,
      "Kabir cranking the home-made torch, its bulb glowing",
    );
    const ask = choiceQuestion(b, {
      name: "built",
      prompt: t(
        "Riya and Kabir wind 200 turns of wire on a frame between the two speaker magnets, add a handle and a bulb, and crank. The bulb glows. What energy change happens in the torch?",
        "रिया और कबीर स्पीकरों के दोनों चुंबकों के बीच एक ढाँचे पर तार के 200 फेरे लपेटते हैं, एक हैंडल और बल्ब लगाते हैं, और घुमाते हैं। बल्ब जलता है। टॉर्च में ऊर्जा का क्या बदलाव होता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Mechanical energy (cranking) → electrical energy → light",
            "यांत्रिक ऊर्जा (घुमाना) → विद्युत ऊर्जा → प्रकाश",
          ),
        },
        {
          id: "chem",
          label: t("Chemical energy → light", "रासायनिक ऊर्जा → प्रकाश"),
          feedback: t(
            "There is no cell, so no chemical energy. The energy comes from Kabir's arm.",
            "कोई सेल नहीं है, इसलिए रासायनिक ऊर्जा नहीं। ऊर्जा कबीर की बाँह से आती है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const flicker = choiceQuestion(b, {
      name: "flicker",
      prompt: t(
        "When Kabir cranks slowly, the bulb flickers: bright, dim, bright, dim. Why?",
        "जब कबीर धीरे घुमाता है, बल्ब टिमटिमाता है: तेज़, मद्धम, तेज़, मद्धम। क्यों?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "The current rises and falls through zero twice every turn; slowly, you can see it",
            "धारा हर चक्कर में दो बार बढ़ती-घटती और शून्य से गुज़रती है; धीरे घुमाने पर यह दिखता है",
          ),
        },
        {
          id: "loose",
          label: t("A loose wire", "कोई ढीला तार"),
          feedback: t(
            "Look at the graph from this lesson: the current falls to zero every half turn. At slow speed the bulb has time to dim.",
            "इस पाठ का ग्राफ़ देखो: धारा हर आधे चक्कर पर शून्य तक गिरती है। धीमी गति पर बल्ब को मद्धम होने का समय मिलता है।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const next = w.note(
      t(
        "The torch works. Fast cranking gives a steady light. One last job before the next power cut: Mom's iron has been giving her a tingle. Next stop: the wiring at home.",
        "टॉर्च चलती है। तेज़ घुमाने पर रोशनी स्थिर रहती है। अगली बिजली कटौती से पहले एक आख़िरी काम: मम्मी की इस्त्री उन्हें झनझनाहट दे रही है। अगला पड़ाव: घर की वायरिंग।",
      ),
      "next",
      { isHidden: true },
    );
    b.when(ask.on(QuestionSignal.Correct), theBoard.show(flicker));
    b.when(flicker.on(QuestionSignal.Correct), [theBoard.show(next), theBoard.pass()]);
    return column([w.title(t("The crank torch", "क्रैंक टॉर्च")), pic, ask, flicker, next, space()]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Worked: Exercise 16 and in-text Q2, Q3. */
const examples = page("examples", (b) => {
  const w = wordsOn(b);
  return column([
    w.title(t("Worked answers", "हल किए गए उत्तर")),
    w.body(
      t(
        "**Explain the principle and working of an electric generator. What is the function of the brushes?** Principle: electromagnetic induction. Working: the coil ABCD is turned in the field; by Fleming's right-hand rule, when AB moves up and CD down, currents are induced along AB and CD, so a current flows round ABCD and outside from B2 to B1. After half a turn the arms swap, and the current reverses: AC. The **brushes** press on the rotating rings and carry the current from the coil to the outside circuit.",
        "**विद्युत जनित्र का सिद्धांत और कार्यविधि समझाओ। ब्रशों का क्या काम है?** सिद्धांत: विद्युत चुंबकीय प्रेरण। कार्यविधि: कुंडली ABCD को क्षेत्र में घुमाया जाता है; फ़्लेमिंग के दक्षिण-हस्त नियम से, जब AB ऊपर और CD नीचे जाती है, AB और CD में धाराएँ प्रेरित होती हैं, इसलिए धारा ABCD में घूमती है और बाहर B2 से B1 बहती है। आधे चक्कर के बाद भुजाएँ जगह बदलती हैं, और धारा उलट जाती है: AC। **ब्रश** घूमते वलयों पर दबे रहते हैं और कुंडली से धारा को बाहरी परिपथ तक ले जाते हैं।",
      ),
    ),
    w.body(
      t(
        "**Name some sources of direct current.** Cells, batteries, DC generators. **Which sources produce alternating current?** AC generators, such as those in power stations.",
        "**दिष्ट धारा के कुछ स्रोत बताओ।** सेल, बैटरियाँ, DC जनित्र। **कौन-से स्रोत प्रत्यावर्ती धारा देते हैं?** AC जनित्र, जैसे बिजलीघरों वाले।",
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
        "The device used for producing electric current is called a…",
        "विद्युत धारा उत्पन्न करने वाली युक्ति कहलाती है…",
      ),
      options: [
        { id: "right", label: t("generator", "जनित्र") },
        {
          id: "galvo",
          label: t("galvanometer", "गैल्वेनोमीटर"),
          feedback: t(
            "A galvanometer detects a current; it doesn't produce one.",
            "गैल्वेनोमीटर धारा का पता लगाता है; उसे बनाता नहीं।",
          ),
        },
        {
          id: "ammeter",
          label: t("ammeter", "ऐमीटर"),
          feedback: t("An ammeter measures a current.", "ऐमीटर धारा मापता है।"),
        },
        {
          id: "motor",
          label: t("motor", "मोटर"),
          feedback: t("A motor uses a current to make motion.", "मोटर धारा से गति बनाती है।"),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ A generator turns a coil in a magnetic field: motion becomes electricity. ✓ With slip rings the current reverses every half turn: AC (50 Hz at home). ✓ With a split ring it flows one way: DC. ✓ The crank torch works. Next stop: making the house wiring safe.",
        "**मिशन लॉग।** ✓ जनित्र चुंबकीय क्षेत्र में कुंडली घुमाता है: गति विद्युत बन जाती है। ✓ सर्पी वलयों से धारा हर आधे चक्कर पर उलटती है: AC (घर में 50 Hz)। ✓ विभक्त वलय से वह एक ओर बहती है: DC। ✓ क्रैंक टॉर्च चलती है। अगला पड़ाव: घर की वायरिंग सुरक्षित करना।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(ask.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), ask, log, space()]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [hook, parts, turn, dc, mains, inLife, examples, yourTurn];

import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, goalQuestion, wordsOn } from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  Carrier,
  Dir,
  MagnetismScene,
  RodAction,
  Rule,
  RuleAction,
  forceOnRodDef,
  handRuleDef,
} from "@chalk/prop-magnetism";
import { sceneOn } from "../kit";

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** Grandpa's dead mixer, and Ampère's question. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const pic = sceneOn(
    b,
    "pic",
    MagnetismScene.MixerOpen,
    "Grandpa's old mixer opened on the table: two curved magnets and a coil of copper wire on a shaft",
  );
  return column([
    w.title(t("Inside the old mixer", "पुराने मिक्सर के अंदर")),
    pic,
    w.body(
      t(
        "Grandpa's old mixer has stopped working, and he lets the kids open it. Inside: two curved magnets, and between them a coil of copper wire on a shaft. Plug it in, and that coil spins. Riya thinks back to stop 2: a current pushed a compass needle, a magnet. **If a current pushes a magnet, does a magnet push back on a current?**",
        "दादाजी का पुराना मिक्सर बंद हो गया है, और वे बच्चों को उसे खोलने देते हैं। अंदर: दो मुड़े हुए चुंबक, और उनके बीच एक धुरी पर ताँबे के तार की कुंडली। प्लग लगाओ, और वह कुंडली घूमती है। रिया पड़ाव 2 याद करती है: धारा ने दिक्सूचक की सुई, यानी एक चुंबक, को धकेला था। **अगर धारा चुंबक को धकेलती है, तो क्या चुंबक भी धारा को वापस धकेलता है?**",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Activity 13.7: the rod in the horse-shoe magnet jumps. */
const rod = page(
  "rod",
  (b) => {
    const w = wordsOn(b);
    const swing = b.prop(forceOnRodDef, "swing", {
      isKeyClosed: false,
      canFlip: false,
      canSetCurrent: false,
    });
    b.studentOnly(swing.action(RodAction.SetKey));
    b.standsFor(
      swing,
      "an aluminium rod AB hanging between the poles of a horse-shoe magnet, seen end-on, with the field upwards; the learner can close the key to send a current from B to A",
    );
    const ask = choiceQuestion(b, {
      prompt: t("Close the key. What does the rod do?", "कुंजी बंद करो। छड़ क्या करती है?"),
      options: [
        {
          id: "right",
          label: t(
            "It swings sideways: a force acts on it",
            "वह बगल की ओर झूलती है: उस पर बल लगता है",
          ),
        },
        {
          id: "nothing",
          label: t("Nothing: aluminium isn't magnetic", "कुछ नहीं: ऐलुमिनियम चुंबकीय नहीं है"),
          feedback: t(
            "Aluminium isn't attracted by a magnet, yet the rod moves when the current flows. The force is on the current.",
            "ऐलुमिनियम चुंबक से आकर्षित नहीं होता, फिर भी धारा बहने पर छड़ हिलती है। बल धारा पर है।",
          ),
        },
        {
          id: "up",
          label: t("It is pulled up towards the S pole", "वह ऊपर S ध्रुव की ओर खिंचती है"),
          feedback: t(
            "Watch again: it moves sideways, at right angles to the field, not along it.",
            "फिर देखो: वह बगल की ओर हिलती है, क्षेत्र के लंबवत, उसके साथ-साथ नहीं।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("A magnet pushes a current", "चुंबक धारा को धकेलता है")),
      w.body(
        t(
          "The French scientist André-Marie Ampère suggested that if a current exerts a force on a magnet, the magnet must exert an equal and opposite force on the current. Activity 13.7 tests it. A small aluminium rod AB hangs from two wires between the poles of a strong horse-shoe magnet, N below and S above, so the field points **up**. We look at the rod end-on.",
          "फ़्रांसीसी वैज्ञानिक आंद्रे-मारी ऐम्पियर ने सुझाया कि अगर धारा चुंबक पर बल लगाती है, तो चुंबक को भी धारा पर बराबर और विपरीत बल लगाना चाहिए। क्रियाकलाप 13.7 इसे परखता है। ऐलुमिनियम की एक छोटी छड़ AB दो तारों से एक प्रबल नाल चुंबक के ध्रुवों के बीच लटकी है, N नीचे और S ऊपर, यानी क्षेत्र **ऊपर** की ओर है। हम छड़ को सिरे की ओर से देख रहे हैं।",
        ),
      ),
      swing,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Reversing the current or the field reverses the force. */
const reverse = page(
  "reverse",
  (b) => {
    const w = wordsOn(b);
    const swing = b.prop(forceOnRodDef, "swing", {
      isKeyClosed: true,
      canFlip: true,
      canSetCurrent: true,
    });
    b.studentOnly(swing.action(RodAction.SetCurrent));
    b.studentOnly(swing.action(RodAction.FlipMagnet));
    b.standsFor(
      swing,
      "the rod in the horse-shoe magnet with the current on; the learner can reverse the current and turn the magnet over",
    );
    const ask = choiceQuestion(b, {
      prompt: t(
        "Reverse the current, then turn the magnet over. What does each change do to the swing?",
        "धारा उलटो, फिर चुंबक पलटो। हर बदलाव झूलने पर क्या करता है?",
      ),
      options: [
        {
          id: "right",
          label: t("Each one reverses the direction of the swing", "हर एक झूलने की दिशा उलट देता है"),
        },
        {
          id: "current",
          label: t("Only reversing the current matters", "केवल धारा उलटने से फ़र्क पड़ता है"),
          feedback: t(
            "Turn the magnet over too: the rod swings the other way. The force depends on both.",
            "चुंबक भी पलटो: छड़ उलटी ओर झूलती है। बल दोनों पर निर्भर है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Which way does it swing?", "वह किस ओर झूलती है?")),
      swing,
      ask,
      w.definition(
        t(
          "**Force on a current in a magnetic field.** A current-carrying conductor in a magnetic field feels a force. Its direction depends on **the direction of the current and the direction of the field**: reverse either and the force reverses. The force is **largest when the current is at right angles to the field**.",
          "**चुंबकीय क्षेत्र में धारा पर बल।** चुंबकीय क्षेत्र में रखा धारावाही चालक एक बल महसूस करता है। इसकी दिशा **धारा की दिशा और क्षेत्र की दिशा** पर निर्भर करती है: किसी एक को उलटो तो बल उलट जाता है। बल **सबसे अधिक तब होता है जब धारा क्षेत्र के लंबवत हो**।",
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** NCERT in-text Q2: more current, a stronger magnet, a longer rod. */
const bigger = page(
  "bigger",
  (b) => {
    const w = wordsOn(b);
    const swing = b.prop(forceOnRodDef, "swing", {
      current: 1,
      isKeyClosed: true,
      canFlip: false,
      canSetCurrent: true,
      canSetMagnet: true,
      canSetLength: true,
    });
    b.studentOnly(swing.action(RodAction.SetCurrent));
    b.studentOnly(swing.action(RodAction.SetMagnet));
    b.studentOnly(swing.action(RodAction.SetLength));
    b.standsFor(
      swing,
      "the rod in the horse-shoe magnet; the learner can raise the current, use a stronger magnet and use a longer rod",
    );
    const ask = choiceQuestion(b, {
      prompt: t(
        "Try more current, the stronger magnet and the longer rod. What does each do to the displacement of the rod?",
        "अधिक धारा, प्रबल चुंबक और लंबी छड़ आज़माओ। हर एक छड़ के विस्थापन पर क्या करता है?",
      ),
      options: [
        {
          id: "right",
          label: t("Each one makes the rod swing further", "हर एक से छड़ और दूर झूलती है"),
        },
        {
          id: "length",
          label: t(
            "A longer rod swings less, because it is heavier",
            "लंबी छड़ कम झूलती है, क्योंकि वह भारी है",
          ),
          feedback: t(
            "A longer rod has more of its length in the field, so the force on it is bigger. It swings further.",
            "लंबी छड़ की अधिक लंबाई क्षेत्र में होती है, इसलिए उस पर बल अधिक होता है। वह और दूर झूलती है।",
          ),
        },
      ],
      answer: "right",
    });
    const rule = w.body(
      t(
        "The force on the rod gets bigger with **more current**, a **stronger field**, and **more length of wire inside the field**.",
        "छड़ पर बल **अधिक धारा**, **प्रबल क्षेत्र** और **क्षेत्र के अंदर तार की अधिक लंबाई** से बढ़ता है।",
      ),
      "rule",
      { isHidden: true },
    );
    b.when(ask.on(QuestionSignal.Correct), theBoard.show(rule));
    return column([w.title(t("A bigger push", "बड़ा धक्का")), swing, ask, rule, space()]);
  },
  { passOn: PassOn.Rules },
);

/** Fleming's left-hand rule. */
const fleming = page(
  "fleming",
  (b) => {
    const w = wordsOn(b);
    const hand = b.prop(handRuleDef, "hand", {
      rule: Rule.FlemingLeft,
      first: Dir.Up,
      second: Dir.Out,
      carrier: Carrier.Current,
      isRevealed: true,
    });
    b.studentOnly(hand.action(RuleAction.SetFirst));
    b.studentOnly(hand.action(RuleAction.SetSecond));
    b.standsFor(
      hand,
      "Fleming's left-hand rule: the learner sets the field (first finger) and the current (middle finger), and the thumb shows the force",
    );
    const goal = goalQuestion(b, {
      about: hand,
      prompt: t(
        "Keep the field up the page. Set the current so that the force points to the **right**.",
        "क्षेत्र को पृष्ठ पर ऊपर रखो। धारा को ऐसे सेट करो कि बल **दाईं** ओर हो।",
      ),
      isMet: hand.field("first").eq(Dir.Up).and(hand.field("second").eq(Dir.In)),
      solve: [hand.learner(RuleAction.SetSecond, { dir: Dir.In })],
    });
    return column([
      w.title(t("Fleming's left-hand rule", "फ़्लेमिंग का वामहस्त नियम")),
      w.definition(
        t(
          "**Fleming's left-hand rule.** Stretch the thumb, forefinger and middle finger of your **left hand** so they are at right angles to each other. If the **first finger points along the field** and the **second (middle) finger along the current**, the **thumb points along the force** (the way the conductor moves).",
          "**फ़्लेमिंग का वामहस्त नियम।** अपने **बाएँ हाथ** का अँगूठा, तर्जनी और मध्यमा ऐसे फैलाओ कि वे एक-दूसरे के लंबवत हों। यदि **तर्जनी क्षेत्र की दिशा में** और **मध्यमा धारा की दिशा में** हो, तो **अँगूठा बल की दिशा** (चालक के चलने की दिशा) दिखाता है।",
        ),
      ),
      w.body(
        t(
          "In Activity 13.7 the field was up and the current came out of the page: the rule gives a force to the left, just as the rod swung.",
          "क्रियाकलाप 13.7 में क्षेत्र ऊपर था और धारा पृष्ठ से बाहर आ रही थी: नियम बाईं ओर बल देता है, ठीक जैसे छड़ झूली थी।",
        ),
      ),
      hand,
      goal,
      w.note(
        t(
          "Devices that use the force on a current in a magnetic field include electric motors, loudspeakers, microphones and measuring instruments.",
          "जो उपकरण चुंबकीय क्षेत्र में धारा पर बल का उपयोग करते हैं, उनमें विद्युत मोटर, लाउडस्पीकर, माइक्रोफ़ोन और मापक यंत्र शामिल हैं।",
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Moving electrons: current is the opposite way (Example 13.2). */
const electron = page(
  "electron",
  (b) => {
    const w = wordsOn(b);
    const hand = b.prop(handRuleDef, "hand", {
      rule: Rule.FlemingLeft,
      first: Dir.Up,
      second: Dir.Right,
      carrier: Carrier.Electron,
      isRevealed: false,
      canSetFirst: false,
      canSetSecond: false,
      canReveal: true,
    });
    b.studentOnly(hand.action(RuleAction.Reveal));
    b.standsFor(
      hand,
      "an electron moving to the right across a magnetic field that points up the page; the learner can reveal the force",
    );
    const ask = choiceQuestion(b, {
      prompt: t(
        "An electron moves to the right, at right angles to a field that points up the page. Which way is the force on it? (Then press Show the answer.)",
        "एक इलेक्ट्रॉन दाईं ओर चलता है, पृष्ठ पर ऊपर की ओर वाले क्षेत्र के लंबवत। उस पर बल किस ओर है? (फिर उत्तर दिखाओ दबाओ।)",
      ),
      options: [
        { id: "right", label: t("Into the page", "पृष्ठ के अंदर") },
        {
          id: "out",
          label: t("Out of the page", "पृष्ठ से बाहर"),
          feedback: t(
            "That would be for a current to the right. An electron moving right is a current to the **left**.",
            "यह दाईं ओर की धारा के लिए होता। दाईं ओर चलता इलेक्ट्रॉन **बाईं** ओर की धारा है।",
          ),
        },
        {
          id: "left",
          label: t("To the left", "बाईं ओर"),
          feedback: t(
            "The force is at right angles to both the motion and the field, so it can't be along the motion.",
            "बल गति और क्षेत्र दोनों के लंबवत होता है, इसलिए वह गति की दिशा में नहीं हो सकता।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("When electrons move", "जब इलेक्ट्रॉन चलते हैं")),
      w.body(
        t(
          "The rule uses the direction of the **current**. Electrons are negative, so the current is taken **opposite** to the way electrons move (as in Ch 12). Example 13.2:",
          "नियम **धारा** की दिशा लेता है। इलेक्ट्रॉन ऋणात्मक हैं, इसलिए धारा इलेक्ट्रॉनों के चलने की **उलटी** दिशा में मानी जाती है (जैसे अध्याय 12 में)। उदाहरण 13.2:",
        ),
      ),
      hand,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** Back to the mixer: wires in a magnet's field are pushed. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const pic = sceneOn(b, "pic", MagnetismScene.MixerOpen, "the opened mixer: magnets and a coil");
    const ask = choiceQuestion(b, {
      name: "push",
      prompt: t(
        "In the mixer, the coil's wires sit in the field between the two magnets. What happens when a current flows in them?",
        "मिक्सर में कुंडली के तार दोनों चुंबकों के बीच क्षेत्र में हैं। उनमें धारा बहने पर क्या होता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "The field pushes on the wires, so the coil starts to move",
            "क्षेत्र तारों को धकेलता है, इसलिए कुंडली हिलने लगती है",
          ),
        },
        {
          id: "stick",
          label: t("The coil sticks to one magnet", "कुंडली एक चुंबक से चिपक जाती है"),
          feedback: t(
            "Copper isn't attracted by a magnet. The force is on the current, sideways to the field.",
            "ताँबा चुंबक से आकर्षित नहीं होता। बल धारा पर है, क्षेत्र के बगल की ओर।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const next = w.note(
      t(
        "A push moves the coil a little. But how does it keep spinning round and round? Next stop: the electric motor.",
        "एक धक्का कुंडली को थोड़ा हिलाता है। पर वह बार-बार घूमती कैसे रहती है? अगला पड़ाव: विद्युत मोटर।",
      ),
      "next",
      { isHidden: true },
    );
    b.when(ask.on(QuestionSignal.Correct), [theBoard.show(next), theBoard.pass()]);
    return column([w.title(t("Back to the mixer", "फिर मिक्सर")), pic, ask, next, space()]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Worked: in-text Q1, Q3 and Exercise 10. */
const examples = page("examples", (b) => {
  const w = wordsOn(b);
  return column([
    w.title(t("Worked answers", "हल किए गए उत्तर")),
    w.body(
      t(
        "**A proton moves freely in a magnetic field. Which of its properties can change: mass, speed, velocity, momentum?**",
        "**एक प्रोटॉन चुंबकीय क्षेत्र में मुक्त रूप से चलता है। उसका कौन-सा गुण बदल सकता है: द्रव्यमान, चाल, वेग, संवेग?**",
      ),
    ),
    w.body(
      t(
        "The force is always at right angles to the motion, so it **changes the direction** of motion. Velocity and momentum include direction, so **velocity and momentum change**. Mass doesn't change, and since the force only turns the proton, its speed stays the same.",
        "बल हमेशा गति के लंबवत होता है, इसलिए वह गति की **दिशा बदलता है**। वेग और संवेग में दिशा शामिल है, इसलिए **वेग और संवेग बदलते हैं**। द्रव्यमान नहीं बदलता, और चूँकि बल प्रोटॉन को केवल मोड़ता है, उसकी चाल वही रहती है।",
      ),
    ),
    w.body(
      t(
        "**An alpha particle (positive) is shot towards the west and is deflected towards the north by a magnetic field. Which way is the field?** A positive particle moving west is a current to the west. Second finger west, thumb north: the first finger points **upward**. The field is upward.",
        "**एक ऐल्फ़ा कण (धनावेशित) पश्चिम की ओर फेंका जाता है और चुंबकीय क्षेत्र से उत्तर की ओर मुड़ जाता है। क्षेत्र किस ओर है?** पश्चिम की ओर चलता धन कण पश्चिम की ओर धारा है। मध्यमा पश्चिम, अँगूठा उत्तर: तर्जनी **ऊपर** इशारा करती है। क्षेत्र ऊपर की ओर है।",
      ),
    ),
    w.body(
      t(
        "**You sit with your back to one wall. An electron beam moves horizontally from the back wall to the front wall and is deflected to your right. Which way is the field?** The beam moves forward, so the current points **backward**. Middle finger backward, thumb to your right: the first finger points **vertically downward**. The field is downward.",
        "**तुम एक दीवार की ओर पीठ करके बैठे हो। एक इलेक्ट्रॉन किरण पुंज पीछे की दीवार से सामने की दीवार की ओर क्षैतिज चलता है और तुम्हारी दाईं ओर मुड़ जाता है। क्षेत्र किस ओर है?** पुंज आगे चलता है, इसलिए धारा **पीछे** की ओर है। मध्यमा पीछे, अँगूठा तुम्हारी दाईं ओर: तर्जनी **ऊर्ध्वाधर नीचे** इशारा करती है। क्षेत्र नीचे की ओर है।",
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
        "When is the force on a current-carrying conductor in a magnetic field largest?",
        "चुंबकीय क्षेत्र में धारावाही चालक पर बल सबसे अधिक कब होता है?",
      ),
      options: [
        {
          id: "right",
          label: t("When the current is at right angles to the field", "जब धारा क्षेत्र के लंबवत हो"),
        },
        {
          id: "along",
          label: t("When the current is along the field", "जब धारा क्षेत्र के साथ-साथ हो"),
          feedback: t(
            "Along the field there is no force at all. It is largest at right angles.",
            "क्षेत्र के साथ-साथ कोई बल नहीं होता। लंबवत होने पर बल सबसे अधिक होता है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ A magnet pushes on a current: the force is at right angles to both the current and the field. ✓ Reverse either one and the force reverses. ✓ Fleming's left-hand rule gives the direction. Next stop: how that push turns a motor.",
        "**मिशन लॉग।** ✓ चुंबक धारा को धकेलता है: बल धारा और क्षेत्र दोनों के लंबवत होता है। ✓ किसी एक को उलटो तो बल उलट जाता है। ✓ फ़्लेमिंग का वामहस्त नियम दिशा बताता है। अगला पड़ाव: यह धक्का मोटर कैसे घुमाता है।",
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
export const overview = [hook, rod, reverse, bigger, fleming, electron, inLife, examples, yourTurn];

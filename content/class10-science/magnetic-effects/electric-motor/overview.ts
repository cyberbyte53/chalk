import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import { MagnetismScene, MotorAction, motorDef } from "@chalk/prop-magnetism";
import { sceneOn } from "../kit";

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** The mixer again: a push, but how does it keep turning? */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const pic = sceneOn(
    b,
    "pic",
    MagnetismScene.MixerOpen,
    "Grandpa's opened mixer: the coil on its shaft between two magnets, with a small ring of copper strips at one end",
  );
  return column([
    w.title(t("Round and round", "गोल-गोल")),
    pic,
    w.body(
      t(
        "Stop 4 explained the push: the magnets push on the current in the mixer's coil. But Kabir spots a problem. A push on one side of a coil would turn it **half a turn**, and then that side is on the other side, and the same push would turn it back. So why does the mixer keep spinning the same way, thousands of times a minute? Riya notices a small ring of copper strips at the end of the shaft, with two springs pressing on it.",
        "पड़ाव 4 ने धक्का समझाया: चुंबक मिक्सर की कुंडली की धारा को धकेलते हैं। पर कबीर को एक समस्या दिखती है। कुंडली के एक ओर का धक्का उसे **आधा चक्कर** घुमाएगा, और फिर वह भाग दूसरी ओर पहुँच जाएगा, और वही धक्का उसे वापस घुमा देगा। तो मिक्सर एक ही दिशा में, एक मिनट में हज़ारों बार, क्यों घूमता रहता है? रिया धुरी के सिरे पर ताँबे की पट्टियों का एक छोटा छल्ला देखती है, जिस पर दो स्प्रिंग दबी हुई हैं।",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** The parts of a simple motor (Fig. 13.15). */
const parts = page(
  "parts",
  (b) => {
    const w = wordsOn(b);
    const motor = b.prop(motorDef, "motor", {
      angle: 0,
      showForces: false,
      showLabels: true,
      canTurn: false,
      canRun: false,
    });
    b.standsFor(
      motor,
      "a simple electric motor seen end-on: coil arms AB and CD between N and S poles, the split ring halves P and Q, and the brushes X and Y",
    );
    const ask = choiceQuestion(b, {
      prompt: t("What does an electric motor do?", "विद्युत मोटर क्या करती है?"),
      options: [
        {
          id: "right",
          label: t(
            "Turns electrical energy into mechanical energy (motion)",
            "विद्युत ऊर्जा को यांत्रिक ऊर्जा (गति) में बदलती है",
          ),
        },
        {
          id: "back",
          label: t("Turns motion into electrical energy", "गति को विद्युत ऊर्जा में बदलती है"),
          feedback: t(
            "That is the opposite device, the generator (stop 7). A motor takes a current and gives motion.",
            "यह उलटा उपकरण है, जनित्र (पड़ाव 7)। मोटर धारा लेकर गति देती है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("A simple electric motor", "एक सरल विद्युत मोटर")),
      w.definition(
        t(
          "**Electric motor.** A rotating device that converts **electrical energy into mechanical energy**. It is inside fans, refrigerators, mixers, washing machines, computers and more.",
          "**विद्युत मोटर।** एक घूमने वाला उपकरण जो **विद्युत ऊर्जा को यांत्रिक ऊर्जा में** बदलता है। यह पंखों, फ़्रिज, मिक्सर, वॉशिंग मशीन, कंप्यूटर आदि के अंदर होती है।",
        ),
      ),
      w.definition(
        t(
          "**Its parts.** A rectangular **coil ABCD** of insulated copper wire sits between the poles of a magnet, with arms AB and CD at right angles to the field. The coil's two ends go to the two halves, **P and Q, of a split ring**, fixed to the axle. Two fixed conducting **brushes, X and Y**, press on P and Q. The current comes in through brush X and goes back through brush Y.",
          "**इसके भाग।** विद्युतरोधी ताँबे के तार की एक आयताकार **कुंडली ABCD** एक चुंबक के ध्रुवों के बीच होती है, भुजाएँ AB और CD क्षेत्र के लंबवत। कुंडली के दोनों सिरे **विभक्त वलय के दो अर्धभागों P और Q** से जुड़े होते हैं, जो धुरी पर लगे हैं। दो स्थिर चालक **ब्रश, X और Y**, P और Q पर दबे रहते हैं। धारा ब्रश X से अंदर आती है और ब्रश Y से वापस जाती है।",
        ),
      ),
      w.body(
        t(
          "Here we look along the axle: arm AB is the left crossing and CD the right one. The dashed lines are the field, from N to S.",
          "यहाँ हम धुरी के साथ-साथ देख रहे हैं: भुजा AB बायाँ और CD दायाँ बिंदु है। बिंदुदार रेखाएँ क्षेत्र हैं, N से S की ओर।",
        ),
      ),
      motor,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The forces on AB and CD turn the coil anticlockwise. */
const forces = page(
  "forces",
  (b) => {
    const w = wordsOn(b);
    const motor = b.prop(motorDef, "motor", {
      angle: 0,
      showForces: true,
      showLabels: true,
      canTurn: false,
      canRun: false,
    });
    b.standsFor(
      motor,
      "the motor with the current going A to B in arm AB; arrows show the force on AB pushing down and on CD pushing up",
    );
    const ask = choiceQuestion(b, {
      prompt: t(
        "Current flows A → B in arm AB and C → D in arm CD. Fleming's left-hand rule gives AB a push down and CD a push up. Which way does the coil turn?",
        "भुजा AB में धारा A → B और भुजा CD में C → D बहती है। फ़्लेमिंग का वामहस्त नियम AB को नीचे और CD को ऊपर धक्का देता है। कुंडली किस ओर घूमती है?",
      ),
      options: [
        { id: "right", label: t("Anticlockwise", "वामावर्त") },
        {
          id: "cw",
          label: t("Clockwise", "दक्षिणावर्त"),
          feedback: t(
            "Left side pushed down, right side pushed up: like turning a steering wheel to the left. That's anticlockwise.",
            "बायाँ भाग नीचे, दायाँ ऊपर: जैसे स्टीयरिंग को बाईं ओर घुमाना। यह वामावर्त है।",
          ),
        },
        {
          id: "none",
          label: t("It doesn't turn: the forces cancel", "नहीं घूमती: बल एक-दूसरे को रद्द कर देते हैं"),
          feedback: t(
            "The two forces are opposite but on opposite sides of the axle, so together they twist the coil.",
            "दोनों बल उलटे हैं पर धुरी के दोनों ओर हैं, इसलिए मिलकर वे कुंडली को मरोड़ते हैं।",
          ),
        },
      ],
      answer: "right",
    });
    return column([w.title(t("Two pushes make a turn", "दो धक्के, एक घुमाव")), motor, ask, space()]);
  },
  { passOn: PassOn.Rules },
);

/** The split ring reverses the current every half turn: the commutator. */
const commutator = page(
  "commutator",
  (b) => {
    const w = wordsOn(b);
    const motor = b.prop(motorDef, "motor", {
      angle: 0,
      showForces: true,
      showLabels: true,
      canTurn: true,
      canRun: false,
    });
    b.studentOnly(motor.action(MotorAction.Turn));
    b.standsFor(
      motor,
      "the motor; the learner turns the coil by hand, 45° or 90° at a time, and watches the current in AB and the forces",
    );
    const goal = choiceQuestion(b, {
      name: "goal",
      prompt: t(
        "Turn the coil step by step through half a turn (two 90° turns). What happens to the current in arm AB?",
        "कुंडली को एक-एक क़दम आधा चक्कर (दो बार 90°) घुमाओ। भुजा AB में धारा का क्या होता है?",
      ),
      options: [
        {
          id: "right",
          label: t("It reverses: now it flows B → A", "वह उलट जाती है: अब B → A बहती है"),
        },
        {
          id: "same",
          label: t("It still flows A → B", "वह अब भी A → B बहती है"),
          feedback: t(
            "Watch the brushes: after half a turn, brush X touches Q instead of P, so the current enters the coil at the other end.",
            "ब्रश देखो: आधे चक्कर के बाद ब्रश X, P की जगह Q को छूता है, इसलिए धारा कुंडली में दूसरे सिरे से आती है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const ask = choiceQuestion(b, {
      name: "role",
      prompt: t(
        "What is the role of the split ring in a motor?",
        "मोटर में विभक्त वलय की क्या भूमिका है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "It reverses the current in the coil every half turn, so the coil keeps turning one way",
            "यह हर आधे चक्कर पर कुंडली में धारा उलट देता है, जिससे कुंडली एक ही ओर घूमती रहती है",
          ),
        },
        {
          id: "hold",
          label: t("It holds the coil on the axle", "यह कुंडली को धुरी पर थामता है"),
          feedback: t(
            "Its job is electrical: at each half turn it swaps which brush touches which end of the coil.",
            "इसका काम विद्युत का है: हर आधे चक्कर पर यह बदल देता है कि कौन-सा ब्रश कुंडली के किस सिरे को छूता है।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
    });
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(ask));
    return column([
      w.title(t("The trick: reverse the current", "तरकीब: धारा उलटो")),
      motor,
      goal,
      w.definition(
        t(
          "**Commutator.** At half a turn, half-ring **Q** comes to brush X and **P** to brush Y, so the current in the coil reverses and flows **D → C → B → A**. That reverses the forces too: AB, which was pushed down, is now pushed up. So the coil turns **another half turn the same way**, and this repeats every half turn. A device that reverses the direction of the current in a circuit is a **commutator**. In a motor, **the split ring is the commutator**.",
          "**दिक्परिवर्तक।** आधे चक्कर पर अर्धवलय **Q** ब्रश X पर और **P** ब्रश Y पर आ जाता है, इसलिए कुंडली में धारा उलटकर **D → C → B → A** बहती है। इससे बल भी उलट जाते हैं: AB, जिसे नीचे धकेला जा रहा था, अब ऊपर धकेला जाता है। इसलिए कुंडली **उसी ओर आधा चक्कर और** घूमती है, और हर आधे चक्कर पर यही दोहराता है। जो युक्ति परिपथ में धारा की दिशा उलट दे, वह **दिक्परिवर्तक** है। मोटर में **विभक्त वलय ही दिक्परिवर्तक है**।",
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Without the split ring, the coil only rocks. */
const plain = page(
  "plain",
  (b) => {
    const w = wordsOn(b);
    const motor = b.prop(motorDef, "motor", {
      angle: 0,
      hasSplitRing: false,
      showForces: true,
      showLabels: true,
      canTurn: true,
      canRun: true,
      canSwapRings: true,
    });
    b.studentOnly(motor.action(MotorAction.Turn));
    b.studentOnly(motor.action(MotorAction.Run));
    b.studentOnly(motor.action(MotorAction.SetRings));
    b.standsFor(
      motor,
      "the motor with two plain rings instead of a split ring; the learner can run it, turn it and switch back to the split ring",
    );
    const ask = choiceQuestion(b, {
      prompt: t(
        "With plain rings, run the motor. What does the coil do, and why?",
        "सादे वलयों के साथ मोटर चलाओ। कुंडली क्या करती है, और क्यों?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "It only rocks to and fro: the current never reverses, so after half a turn the push brings it back",
            "वह बस आगे-पीछे डोलती है: धारा कभी नहीं उलटती, इसलिए आधे चक्कर के बाद धक्का उसे वापस ले आता है",
          ),
        },
        {
          id: "faster",
          label: t("It spins faster, with nothing in the way", "वह तेज़ घूमती है, कोई रुकावट नहीं"),
          feedback: t(
            "Watch the forces after half a turn: they now push it back the way it came.",
            "आधे चक्कर के बाद बल देखो: अब वे उसे वापस उसी ओर धकेलते हैं जिधर से आई।",
          ),
        },
      ],
      answer: "right",
    });
    return column([w.title(t("Without the split ring", "विभक्त वलय के बिना")), motor, ask, space()]);
  },
  { passOn: PassOn.Rules },
);

/** Commercial motors: electromagnet, many turns, soft iron core: the armature. */
const real = page(
  "real",
  (b) => {
    const w = wordsOn(b);
    const motor = b.prop(motorDef, "motor", {
      angle: 0,
      showForces: true,
      showLabels: false,
      canTurn: false,
      canRun: true,
    });
    b.studentOnly(motor.action(MotorAction.Run));
    b.standsFor(motor, "the motor; the learner can let it run by itself");
    const ask = choiceQuestion(b, {
      prompt: t(
        "Why do real motors use many turns of wire on a soft iron core?",
        "असली मोटरें नरम लोहे के क्रोड पर तार के अनेक फेरे क्यों लगाती हैं?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Together they make the forces much bigger: a more powerful motor",
            "मिलकर वे बलों को बहुत बड़ा कर देते हैं: अधिक शक्तिशाली मोटर",
          ),
        },
        {
          id: "cheap",
          label: t("To make the motor cheaper", "मोटर सस्ती बनाने के लिए"),
          feedback: t(
            "Each turn adds its own push, and the iron core strengthens the field. They are for power, not price.",
            "हर फेरा अपना धक्का जोड़ता है, और लोहे का क्रोड क्षेत्र को प्रबल करता है। ये शक्ति के लिए हैं, क़ीमत के लिए नहीं।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Real motors", "असली मोटरें")),
      motor,
      w.definition(
        t(
          "**Commercial motors** use (1) an **electromagnet** in place of a permanent magnet, (2) a **large number of turns** of wire in the coil, and (3) a **soft iron core** on which the coil is wound. The soft iron core together with the coil is the **armature**. These make the motor more powerful.",
          "**व्यावसायिक मोटरें** उपयोग करती हैं (1) स्थायी चुंबक की जगह **विद्युत चुंबक**, (2) कुंडली में तार के **बहुत अधिक फेरे**, और (3) एक **नरम लोहे का क्रोड** जिस पर कुंडली लपेटी जाती है। नरम लोहे का क्रोड और कुंडली मिलकर **आर्मेचर** कहलाते हैं। ये मोटर को अधिक शक्तिशाली बनाते हैं।",
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

/** The mixer's copper ring is the commutator; the worn brush. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const pic = sceneOn(
      b,
      "pic",
      MagnetismScene.MixerOpen,
      "the opened mixer with its copper ring and two springs",
    );
    const ask = choiceQuestion(b, {
      name: "ring",
      prompt: t(
        "What are the mixer's ring of copper strips and the two spring-loaded blocks pressing on it?",
        "मिक्सर का ताँबे की पट्टियों वाला छल्ला और उस पर दबे दो स्प्रिंग वाले टुकड़े क्या हैं?",
      ),
      options: [
        {
          id: "right",
          label: t("The commutator and the brushes", "दिक्परिवर्तक और ब्रश"),
        },
        {
          id: "magnet",
          label: t("Two more magnets", "दो और चुंबक"),
          feedback: t(
            "They carry the current into the spinning coil and reverse it at the right moments: commutator and brushes.",
            "वे घूमती कुंडली में धारा पहुँचाते हैं और सही क्षण पर उसे उलटते हैं: दिक्परिवर्तक और ब्रश।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const fault = choiceQuestion(b, {
      name: "fault",
      prompt: t(
        "Grandpa finds one brush worn down so far that it no longer touches the ring. Why did the mixer stop?",
        "दादाजी पाते हैं कि एक ब्रश इतना घिस गया है कि अब छल्ले को छूता ही नहीं। मिक्सर क्यों रुका?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "No current can reach the coil, so there is no force on it",
            "कुंडली तक कोई धारा नहीं पहुँच सकती, इसलिए उस पर कोई बल नहीं",
          ),
        },
        {
          id: "magnet",
          label: t("The magnets lost their magnetism", "चुंबकों का चुंबकत्व चला गया"),
          feedback: t(
            "The magnets are fine. The brush is the coil's only way in for the current.",
            "चुंबक ठीक हैं। ब्रश ही धारा का कुंडली तक पहुँचने का एकमात्र रास्ता है।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const next = w.note(
      t(
        "A new carbon brush, and the mixer whirs again. But the kids want the opposite: not current into motion, but **motion into current**. Next stop: electromagnetic induction.",
        "एक नया कार्बन ब्रश, और मिक्सर फिर घूमने लगता है। पर बच्चों को उलटा चाहिए: धारा से गति नहीं, **गति से धारा**। अगला पड़ाव: विद्युत चुंबकीय प्रेरण।",
      ),
      "next",
      { isHidden: true },
    );
    b.when(ask.on(QuestionSignal.Correct), theBoard.show(fault));
    b.when(fault.on(QuestionSignal.Correct), [theBoard.show(next), theBoard.pass()]);
    return column([w.title(t("The mixer fixed", "मिक्सर ठीक")), pic, ask, fault, next, space()]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Worked: in-text Q2 and Exercise 12. */
const examples = page("examples", (b) => {
  const w = wordsOn(b);
  return column([
    w.title(t("Worked answers", "हल किए गए उत्तर")),
    w.body(
      t(
        "**What is the principle of an electric motor?** A current-carrying conductor placed in a magnetic field feels a force (direction by Fleming's left-hand rule). In a coil, the forces on its two arms are opposite, so they turn it; the split ring reverses the current every half turn so the turning continues.",
        "**विद्युत मोटर का सिद्धांत क्या है?** चुंबकीय क्षेत्र में रखा धारावाही चालक एक बल महसूस करता है (दिशा फ़्लेमिंग के वामहस्त नियम से)। कुंडली में उसकी दोनों भुजाओं पर बल उलटे होते हैं, इसलिए वे उसे घुमाते हैं; विभक्त वलय हर आधे चक्कर पर धारा उलट देता है ताकि घूमना जारी रहे।",
      ),
    ),
    w.body(
      t(
        "**Name some devices in which electric motors are used.** Electric fans, mixers, washing machines, refrigerators, water pumps, computers (disc drives and cooling fans), MP3 players and toys.",
        "**कुछ उपकरणों के नाम बताओ जिनमें विद्युत मोटर का उपयोग होता है।** बिजली के पंखे, मिक्सर, वॉशिंग मशीन, फ़्रिज, पानी के पंप, कंप्यूटर (डिस्क ड्राइव और ठंडा करने वाले पंखे), MP3 प्लेयर और खिलौने।",
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
        "True or false: an electric motor converts mechanical energy into electrical energy.",
        "सही या ग़लत: विद्युत मोटर यांत्रिक ऊर्जा को विद्युत ऊर्जा में बदलती है।",
      ),
      options: [
        {
          id: "true",
          label: t("True", "सही"),
          feedback: t(
            "It's the other way round: a motor turns electrical energy into motion.",
            "यह उलटा है: मोटर विद्युत ऊर्जा को गति में बदलती है।",
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
        "**Mission log.** ✓ A motor turns electrical energy into motion: the forces on its two arms twist the coil. ✓ The split ring (commutator) reverses the current every half turn, so it keeps turning one way. ✓ Real motors: electromagnets, many turns, a soft iron armature. Next stop: turning motion into a current.",
        "**मिशन लॉग।** ✓ मोटर विद्युत ऊर्जा को गति में बदलती है: दोनों भुजाओं पर बल कुंडली को मरोड़ते हैं। ✓ विभक्त वलय (दिक्परिवर्तक) हर आधे चक्कर पर धारा उलट देता है, इसलिए वह एक ही ओर घूमती रहती है। ✓ असली मोटरें: विद्युत चुंबक, अनेक फेरे, नरम लोहे का आर्मेचर। अगला पड़ाव: गति को धारा में बदलना।",
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
export const overview = [hook, parts, forces, commutator, plain, real, inLife, examples, yourTurn];

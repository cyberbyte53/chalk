import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, goalQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  Carrier,
  Dir,
  InductionAction,
  InductionMode,
  MagnetismScene,
  Mover,
  Place,
  Rule,
  RuleAction,
  handRuleDef,
  inductionDef,
} from "@chalk/prop-magnetism";
import { sceneOn } from "../kit";

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** Kabir's bicycle dynamo. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const pic = sceneOn(
    b,
    "pic",
    MagnetismScene.BicycleDynamo,
    "Kabir's bicycle at night with a small dynamo pressed against the tyre; the front lamp shines as the wheel turns",
  );
  return column([
    w.title(t("The lamp with no cell", "बिना सेल का लैंप")),
    pic,
    w.body(
      t(
        "Kabir remembers Grandpa's story and digs out his own old bicycle. On the front fork there's a small bottle-shaped **dynamo** that presses on the tyre. He spins the wheel, and the lamp glows: no cell anywhere. Stop 4 showed that a magnet and a current together make **motion**. Could motion and a magnet together make a **current**?",
        "कबीर को दादाजी की कहानी याद आती है और वह अपनी पुरानी साइकिल निकालता है। आगे के फ़ोर्क पर बोतल जैसा एक छोटा **डायनेमो** है जो टायर पर दबा रहता है। वह पहिया घुमाता है, और लैंप जल उठता है: कहीं कोई सेल नहीं। पड़ाव 4 ने दिखाया कि चुंबक और धारा मिलकर **गति** बनाते हैं। क्या गति और चुंबक मिलकर **धारा** बना सकते हैं?",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Activity 13.8: move a magnet towards a coil and the galvanometer kicks. */
const magnet = page(
  "magnet",
  (b) => {
    const w = wordsOn(b);
    const coil = b.prop(inductionDef, "coil", {
      mode: InductionMode.Magnet,
      pole: "N",
      at: Place.Away,
      canFlip: false,
    });
    b.studentOnly(coil.action(InductionAction.Move));
    b.studentOnly(coil.action(InductionAction.Hold));
    b.standsFor(
      coil,
      "a coil AB joined to a galvanometer, and a bar magnet with its N pole facing end B; the learner moves the magnet closer, inside, or away, or holds it still",
    );
    const goal = goalQuestion(b, {
      about: coil,
      prompt: t(
        "Push the magnet's N pole all the way into the coil, and watch the galvanometer.",
        "चुंबक के N ध्रुव को कुंडली में पूरा अंदर धकेलो, और गैल्वेनोमीटर देखो।",
      ),
      isMet: coil.field("at").eq(Place.Inside),
      solve: [coil.learner(InductionAction.Move, { to: Place.Inside })],
    });
    const still = choiceQuestion(b, {
      name: "still",
      prompt: t(
        "Now press Hold still, with the magnet inside the coil. What does the needle show?",
        "अब चुंबक को कुंडली के अंदर रखकर स्थिर रखो दबाओ। सुई क्या दिखाती है?",
      ),
      options: [
        {
          id: "right",
          label: t("Zero: no current while nothing moves", "शून्य: जब कुछ नहीं चलता तब कोई धारा नहीं"),
        },
        {
          id: "steady",
          label: t(
            "A steady current, because the magnet is inside",
            "एक स्थिर धारा, क्योंकि चुंबक अंदर है",
          ),
          feedback: t(
            "The needle returns to zero the moment the magnet stops. Only motion makes a current.",
            "चुंबक के रुकते ही सुई शून्य पर लौट आती है। केवल गति से धारा बनती है।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
    });
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(still));
    return column([
      w.title(t("A moving magnet makes a current", "चलता चुंबक धारा बनाता है")),
      w.definition(
        t(
          "**Galvanometer.** An instrument that detects a current in a circuit. Its pointer rests at **zero, in the middle of the scale**, when no current flows, and swings **left or right** depending on the direction of the current.",
          "**गैल्वेनोमीटर।** एक यंत्र जो परिपथ में धारा का पता लगाता है। धारा न होने पर उसका संकेतक **पैमाने के बीच, शून्य पर** रहता है, और धारा की दिशा के अनुसार **बाएँ या दाएँ** घूमता है।",
        ),
      ),
      w.body(
        t(
          "Activity 13.8. A coil AB with many turns is joined to a galvanometer. There is no cell in this circuit.",
          "क्रियाकलाप 13.8। अनेक फेरों वाली एक कुंडली AB एक गैल्वेनोमीटर से जुड़ी है। इस परिपथ में कोई सेल नहीं है।",
        ),
      ),
      coil,
      goal,
      still,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Pulling out reverses the kick; an S pole reverses it too. */
const reverse = page(
  "reverse",
  (b) => {
    const w = wordsOn(b);
    const coil = b.prop(inductionDef, "coil", {
      mode: InductionMode.Magnet,
      pole: "N",
      at: Place.Inside,
      canFlip: true,
    });
    b.studentOnly(coil.action(InductionAction.Move));
    b.studentOnly(coil.action(InductionAction.Hold));
    b.studentOnly(coil.action(InductionAction.FlipMagnet));
    b.standsFor(
      coil,
      "the coil and galvanometer with the magnet inside; the learner can pull it out, push it in, hold it, or turn the magnet round so its S pole faces the coil",
    );
    const ask = choiceQuestion(b, {
      prompt: t(
        "Pull the N pole out, then turn the magnet round and push its S pole in. What do you find?",
        "N ध्रुव बाहर खींचो, फिर चुंबक पलटकर उसका S ध्रुव अंदर धकेलो। तुम्हें क्या मिलता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Pulling out kicks the needle the other way, and so does using the S pole",
            "बाहर खींचने पर सुई उलटी ओर झटका देती है, और S ध्रुव से भी",
          ),
        },
        {
          id: "same",
          label: t("The needle always kicks the same way", "सुई हमेशा एक ही ओर झटका देती है"),
          feedback: t(
            "Watch the needle: in = right, out = left for the N pole. The current's direction follows the motion and the pole.",
            "सुई देखो: N ध्रुव के लिए अंदर = दाएँ, बाहर = बाएँ। धारा की दिशा गति और ध्रुव के अनुसार बदलती है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("In, out, and the other pole", "अंदर, बाहर, और दूसरा ध्रुव")),
      coil,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Moving the coil instead of the magnet: relative motion. */
const relative = page(
  "relative",
  (b) => {
    const w = wordsOn(b);
    const coil = b.prop(inductionDef, "coil", {
      mode: InductionMode.Magnet,
      pole: "N",
      at: Place.Away,
      mover: Mover.Coil,
      canFlip: false,
      canSetMover: true,
    });
    b.studentOnly(coil.action(InductionAction.Move));
    b.studentOnly(coil.action(InductionAction.Hold));
    b.studentOnly(coil.action(InductionAction.SetMover));
    b.standsFor(
      coil,
      "the magnet held still near the coil while the learner moves the coil towards it or away",
    );
    const ask = choiceQuestion(b, {
      prompt: t(
        "Keep the magnet still and move the coil towards it instead. What happens?",
        "चुंबक को स्थिर रखो और इसकी जगह कुंडली को उसकी ओर ले जाओ। क्या होता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "The needle kicks just the same: only the relative motion matters",
            "सुई वैसे ही झटका देती है: केवल सापेक्ष गति मायने रखती है",
          ),
        },
        {
          id: "none",
          label: t("Nothing: the magnet has to move", "कुछ नहीं: चुंबक को चलना होगा"),
          feedback: t(
            "Try it: moving the coil towards the N pole kicks the needle right, as pushing the magnet in did.",
            "आज़माओ: कुंडली को N ध्रुव की ओर ले जाने पर सुई दाएँ झटका देती है, जैसे चुंबक अंदर धकेलने पर।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Move the coil instead", "कुंडली को चलाओ")),
      coil,
      ask,
      w.definition(
        t(
          "**Induced current.** When a magnet and a coil move **relative to each other**, a potential difference is **induced** in the coil, and it sets up an **induced current** in the circuit. If nothing moves, there is no induced current.",
          "**प्रेरित धारा।** जब चुंबक और कुंडली **एक-दूसरे के सापेक्ष** चलते हैं, तो कुंडली में एक विभवांतर **प्रेरित** होता है, जो परिपथ में **प्रेरित धारा** बनाता है। अगर कुछ नहीं चलता, तो कोई प्रेरित धारा नहीं होती।",
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Activity 13.9: switching a primary coil on and off induces a current in the secondary. */
const coils = page(
  "coils",
  (b) => {
    const w = wordsOn(b);
    const coil = b.prop(inductionDef, "coil", {
      mode: InductionMode.TwoCoils,
      isClosed: false,
    });
    b.studentOnly(coil.action(InductionAction.SetKey));
    b.studentOnly(coil.action(InductionAction.Hold));
    b.standsFor(
      coil,
      "two coils on one paper roll: coil 1 with a battery and a key, coil 2 with a galvanometer; the learner closes and opens the key",
    );
    const ask = choiceQuestion(b, {
      prompt: t(
        "Close the key, wait, then open it. When does the galvanometer in coil 2 move?",
        "कुंजी बंद करो, रुको, फिर खोलो। कुंडली 2 का गैल्वेनोमीटर कब हिलता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Only at the moments the current in coil 1 starts or stops",
            "केवल उन क्षणों में जब कुंडली 1 में धारा शुरू होती है या रुकती है",
          ),
        },
        {
          id: "always",
          label: t("All the time the key is closed", "जब तक कुंजी बंद है, हर समय"),
          feedback: t(
            "Once the current in coil 1 is steady, the needle is back at zero. Only a changing current induces one.",
            "कुंडली 1 में धारा स्थिर होते ही सुई शून्य पर लौट आती है। केवल बदलती धारा ही धारा प्रेरित करती है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("No magnet at all", "कोई चुंबक नहीं")),
      w.body(
        t(
          "Activity 13.9. Two coils are wound on the same paper roll. Coil 1 (more turns) is joined to a battery and a key; coil 2 to a galvanometer. The two circuits don't touch.",
          "क्रियाकलाप 13.9। एक ही काग़ज़ के बेलन पर दो कुंडलियाँ लपेटी गई हैं। कुंडली 1 (अधिक फेरे) एक बैटरी और कुंजी से जुड़ी है; कुंडली 2 एक गैल्वेनोमीटर से। दोनों परिपथ एक-दूसरे को नहीं छूते।",
        ),
      ),
      coil,
      ask,
      w.definition(
        t(
          "**Electromagnetic induction.** Coil 1 is the **primary coil** and coil 2 the **secondary coil**. When the current in the primary changes, its magnetic field changes, so the field lines through the secondary change, and that induces a current in it. The process by which **a changing magnetic field in a conductor induces a current in another conductor** is **electromagnetic induction**. We can induce a current by moving a coil in a field, or by changing the field around it.",
          "**विद्युत चुंबकीय प्रेरण।** कुंडली 1 **प्राथमिक कुंडली** है और कुंडली 2 **द्वितीयक कुंडली**। जब प्राथमिक में धारा बदलती है, उसका चुंबकीय क्षेत्र बदलता है, इसलिए द्वितीयक से गुज़रने वाली क्षेत्र रेखाएँ बदलती हैं, और इससे उसमें धारा प्रेरित होती है। जिस प्रक्रिया से **किसी चालक में बदलता चुंबकीय क्षेत्र दूसरे चालक में धारा प्रेरित करता है**, वह **विद्युत चुंबकीय प्रेरण** है। हम किसी कुंडली को क्षेत्र में चलाकर, या उसके आसपास का क्षेत्र बदलकर, धारा प्रेरित कर सकते हैं।",
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Fleming's right-hand rule for the induced current. */
const rightHand = page(
  "right-hand",
  (b) => {
    const w = wordsOn(b);
    const hand = b.prop(handRuleDef, "hand", {
      rule: Rule.FlemingRight,
      first: Dir.Right,
      second: Dir.Up,
      carrier: Carrier.Current,
      isRevealed: false,
      canReveal: true,
    });
    b.studentOnly(hand.action(RuleAction.SetFirst));
    b.studentOnly(hand.action(RuleAction.SetSecond));
    b.studentOnly(hand.action(RuleAction.Reveal));
    b.standsFor(
      hand,
      "Fleming's right-hand rule: the learner sets the field (first finger) and the conductor's motion (thumb), and can reveal the induced current (middle finger)",
    );
    const ask = choiceQuestion(b, {
      prompt: t(
        "The field points to the right and a wire moves up the page. Which way is the induced current? (Then press Show the answer.)",
        "क्षेत्र दाईं ओर है और एक तार पृष्ठ पर ऊपर की ओर चलता है। प्रेरित धारा किस ओर है? (फिर उत्तर दिखाओ दबाओ।)",
      ),
      options: [
        { id: "right", label: t("Into the page", "पृष्ठ के अंदर") },
        {
          id: "out",
          label: t("Out of the page", "पृष्ठ से बाहर"),
          feedback: t(
            "Use the right hand, not the left: forefinger right, thumb up, and the middle finger points into the page.",
            "दायाँ हाथ लो, बायाँ नहीं: तर्जनी दाएँ, अँगूठा ऊपर, और मध्यमा पृष्ठ के अंदर इशारा करती है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Fleming's right-hand rule", "फ़्लेमिंग का दक्षिण-हस्त नियम")),
      w.definition(
        t(
          "**Fleming's right-hand rule.** The induced current is largest when the conductor moves at right angles to the field. Stretch the thumb, forefinger and middle finger of your **right hand** at right angles to each other. If the **forefinger points along the field** and the **thumb along the motion of the conductor**, the **middle finger points along the induced current**.",
          "**फ़्लेमिंग का दक्षिण-हस्त नियम।** प्रेरित धारा सबसे अधिक तब होती है जब चालक क्षेत्र के लंबवत चलता है। अपने **दाएँ हाथ** का अँगूठा, तर्जनी और मध्यमा एक-दूसरे के लंबवत फैलाओ। यदि **तर्जनी क्षेत्र की दिशा में** और **अँगूठा चालक की गति की दिशा में** हो, तो **मध्यमा प्रेरित धारा की दिशा** दिखाती है।",
        ),
      ),
      hand,
      ask,
      w.note(
        t(
          "**Michael Faraday (1791–1867)** discovered electromagnetic induction in 1831. He had no formal education: as a boy he worked in a book-binding shop and read the books that came in. He sent careful notes of Humphry Davy's lectures to Davy and became his assistant at the Royal Institution. He turned down many honours; he loved his science more.",
          "**माइकल फ़ैराडे (1791–1867)** ने 1831 में विद्युत चुंबकीय प्रेरण की खोज की। उन्हें कोई औपचारिक शिक्षा नहीं मिली थी: बचपन में वे जिल्दसाज़ी की दुकान में काम करते थे और आने वाली किताबें पढ़ते थे। उन्होंने हम्फ़्री डेवी के व्याख्यानों के सावधान नोट्स डेवी को भेजे और रॉयल इंस्टीट्यूशन में उनके सहायक बने। उन्होंने कई सम्मान ठुकरा दिए; उन्हें अपना विज्ञान अधिक प्यारा था।",
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

/** The dynamo explained. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const pic = sceneOn(
      b,
      "pic",
      MagnetismScene.BicycleDynamo,
      "the bicycle dynamo lighting the lamp",
    );
    const ask = choiceQuestion(b, {
      name: "dynamo",
      prompt: t(
        "Inside the dynamo, the tyre spins a small magnet next to a coil of wire. Why does the lamp glow only while the wheel turns?",
        "डायनेमो के अंदर टायर एक कुंडली के पास एक छोटे चुंबक को घुमाता है। लैंप केवल पहिया घूमते समय ही क्यों जलता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Only a moving magnet changes the field through the coil and induces a current",
            "केवल चलता चुंबक कुंडली से गुज़रता क्षेत्र बदलता है और धारा प्रेरित करता है",
          ),
        },
        {
          id: "store",
          label: t(
            "The dynamo stores charge while you pedal",
            "पैडल मारते समय डायनेमो आवेश जमा करता है",
          ),
          feedback: t(
            "It stores nothing: stop the wheel and the lamp goes out at once. No motion, no induced current.",
            "वह कुछ जमा नहीं करता: पहिया रोको और लैंप तुरंत बुझ जाता है। गति नहीं, प्रेरित धारा नहीं।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const faster = choiceQuestion(b, {
      name: "faster",
      prompt: t(
        "Kabir pedals faster and the lamp gets brighter. Why?",
        "कबीर तेज़ पैडल मारता है और लैंप और चमकीला हो जाता है। क्यों?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "The field through the coil changes faster, inducing a bigger current",
            "कुंडली से गुज़रता क्षेत्र तेज़ी से बदलता है, जिससे बड़ी धारा प्रेरित होती है",
          ),
        },
        {
          id: "heat",
          label: t("The tyre heats the lamp", "टायर लैंप को गर्म करता है"),
          feedback: t(
            "The lamp's energy comes through the wires as an induced current. Faster motion, faster change, bigger current.",
            "लैंप की ऊर्जा तारों से प्रेरित धारा के रूप में आती है। तेज़ गति, तेज़ बदलाव, बड़ी धारा।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const next = w.note(
      t(
        "That's Grandpa's lamp: a tiny generator. To light a room, the kids need a bigger one they can turn by hand. Next stop: the electric generator.",
        "यही था दादाजी का लैंप: एक नन्हा जनित्र। कमरा रोशन करने के लिए बच्चों को एक बड़ा जनित्र चाहिए जिसे हाथ से घुमा सकें। अगला पड़ाव: विद्युत जनित्र।",
      ),
      "next",
      { isHidden: true },
    );
    b.when(ask.on(QuestionSignal.Correct), theBoard.show(faster));
    b.when(faster.on(QuestionSignal.Correct), [theBoard.show(next), theBoard.pass()]);
    return column([
      w.title(t("The dynamo explained", "डायनेमो का रहस्य")),
      pic,
      ask,
      faster,
      next,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Worked: in-text Q and Exercises 13, 14. */
const examples = page("examples", (b) => {
  const w = wordsOn(b);
  return column([
    w.title(t("Worked answers", "हल किए गए उत्तर")),
    w.body(
      t(
        "**Explain different ways to induce a current in a coil.** (1) Move a magnet towards or away from the coil. (2) Move the coil towards or away from a magnet. (3) Change the current in a nearby coil (switch it on or off, or vary it). (4) Rotate the coil in a magnetic field.",
        "**कुंडली में धारा प्रेरित करने के विभिन्न तरीक़े समझाओ।** (1) चुंबक को कुंडली की ओर या उससे दूर ले जाओ। (2) कुंडली को चुंबक की ओर या उससे दूर ले जाओ। (3) पास की किसी कुंडली में धारा बदलो (चालू-बंद करो, या घटाओ-बढ़ाओ)। (4) कुंडली को चुंबकीय क्षेत्र में घुमाओ।",
      ),
    ),
    w.body(
      t(
        "**A coil is joined to a galvanometer. What happens if a bar magnet is (i) pushed into the coil, (ii) withdrawn from inside it, (iii) held still inside it?** (i) The needle kicks one way for a moment. (ii) It kicks the opposite way for a moment. (iii) No deflection: nothing is changing.",
        "**एक कुंडली गैल्वेनोमीटर से जुड़ी है। क्या होगा यदि एक छड़ चुंबक (i) कुंडली में धकेला जाए, (ii) अंदर से बाहर खींचा जाए, (iii) अंदर स्थिर रखा जाए?** (i) सुई क्षण भर के लिए एक ओर झटका देती है। (ii) क्षण भर के लिए उलटी ओर। (iii) कोई विक्षेप नहीं: कुछ नहीं बदल रहा।",
      ),
    ),
    w.body(
      t(
        "**Two coils A and B are close to each other. If the current in A is changed, is a current induced in B?** Yes. Changing the current in A changes its magnetic field, and so the field through B, which induces a current in B.",
        "**दो कुंडलियाँ A और B एक-दूसरे के पास हैं। यदि A में धारा बदली जाए, तो क्या B में धारा प्रेरित होगी?** हाँ। A में धारा बदलने से उसका चुंबकीय क्षेत्र बदलता है, और इसलिए B से गुज़रता क्षेत्र, जो B में धारा प्रेरित करता है।",
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
      prompt: t("Electromagnetic induction is…", "विद्युत चुंबकीय प्रेरण है…"),
      options: [
        {
          id: "right",
          label: t(
            "inducing a current in a coil by moving a magnet and coil relative to each other",
            "चुंबक और कुंडली को एक-दूसरे के सापेक्ष चलाकर कुंडली में धारा प्रेरित करना",
          ),
        },
        {
          id: "charge",
          label: t("the process of charging a body", "किसी वस्तु को आवेशित करने की प्रक्रिया"),
          feedback: t(
            "Charging a body is static electricity, not induction of a current.",
            "वस्तु को आवेशित करना स्थिर विद्युत है, धारा का प्रेरण नहीं।",
          ),
        },
        {
          id: "field",
          label: t(
            "making a magnetic field by passing a current through a coil of wire",
            "तार की कुंडली में धारा भेजकर चुंबकीय क्षेत्र बनाना",
          ),
          feedback: t(
            "That's the magnetic effect of a current (stops 2 and 3), the other way round.",
            "यह धारा का चुंबकीय प्रभाव है (पड़ाव 2 और 3), उलटी बात।",
          ),
        },
        {
          id: "motor",
          label: t("rotating the coil of an electric motor", "विद्युत मोटर की कुंडली घुमाना"),
          feedback: t(
            "A motor turns a current into motion. Induction turns motion into a current.",
            "मोटर धारा को गति में बदलती है। प्रेरण गति को धारा में बदलता है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ A moving magnet (or a changing current nearby) induces a current in a coil. ✓ No change, no current; reverse the motion or the pole and the current reverses. ✓ Fleming's right-hand rule gives its direction. ✓ That's how the dynamo lights the lamp. Next stop: a generator for the torch.",
        "**मिशन लॉग।** ✓ चलता चुंबक (या पास की बदलती धारा) कुंडली में धारा प्रेरित करता है। ✓ बदलाव नहीं, धारा नहीं; गति या ध्रुव उलटो तो धारा उलटती है। ✓ फ़्लेमिंग का दक्षिण-हस्त नियम उसकी दिशा बताता है। ✓ ऐसे ही डायनेमो लैंप जलाता है। अगला पड़ाव: टॉर्च के लिए जनित्र।",
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
export const overview = [
  hook,
  magnet,
  reverse,
  relative,
  coils,
  rightHand,
  inLife,
  examples,
  yourTurn,
];

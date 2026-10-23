import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  Dir,
  FieldAction,
  MagnetismScene,
  Rule,
  RuleAction,
  Source,
  handRuleDef,
  magneticFieldDef,
} from "@chalk/prop-magnetism";
import { sceneOn } from "../kit";

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** Recap, and the question: is the wire making a magnetic field? */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const pic = sceneOn(
    b,
    "pic",
    MagnetismScene.CompassJumps,
    "Kabir's compass beside the single long wire of his battery circuit, its needle swung round",
  );
  return column([
    w.title(t("The wire and the compass", "तार और दिक्सूचक")),
    pic,
    w.body(
      t(
        "Stop 1 gave us the tool: a compass needle turns only when a magnetic field acts on it. So by Kabir's wire there **must** be a magnetic field, but only while the switch is closed, that is, only while a current flows. Kabir tries it again with the compass on the other side of the wire, and the needle swings the **other way**. What kind of field does a current make, and which way does it point?",
        "पड़ाव 1 ने हमें औज़ार दिया: दिक्सूचक की सुई तभी घूमती है जब उस पर कोई चुंबकीय क्षेत्र काम करे। तो कबीर के तार के पास चुंबकीय क्षेत्र **होना ही चाहिए**, पर केवल स्विच बंद रहने तक, यानी केवल तब तक जब तक धारा बहती है। कबीर दिक्सूचक को तार के दूसरी ओर रखकर फिर आज़माता है, और सुई **उलटी ओर** घूमती है। धारा किस तरह का क्षेत्र बनाती है, और वह किस ओर होता है?",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Activity 13.1 and Oersted: a current deflects a compass. */
const oersted = page(
  "oersted",
  (b) => {
    const w = wordsOn(b);
    const field = b.prop(magneticFieldDef, "field", {
      source: Source.StraightWire,
      current: 0,
      compass: { x: 3, y: 0 },
      showLines: false,
      showArrows: false,
      canPlace: false,
      canSetCurrent: true,
    });
    b.studentOnly(field.action(FieldAction.SetCurrent));
    b.standsFor(
      field,
      "a thick copper wire standing straight up through the page, seen from above, with a compass beside it; the learner can switch a current on and change it",
    );
    const ask = choiceQuestion(b, {
      prompt: t(
        "Switch the current on (More current). The needle turns. What does that show?",
        "धारा चालू करो (अधिक धारा)। सुई घूमती है। इससे क्या पता चलता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "A current in a wire makes a magnetic field around it",
            "तार में धारा अपने चारों ओर चुंबकीय क्षेत्र बनाती है",
          ),
        },
        {
          id: "heat",
          label: t(
            "The wire gets hot and heat turns the needle",
            "तार गर्म होता है और गर्मी सुई घुमाती है",
          ),
          feedback: t(
            "Heat doesn't turn a compass. Reverse the current and the needle turns the other way: that is a magnetic effect.",
            "गर्मी दिक्सूचक नहीं घुमाती। धारा उलटो और सुई उलटी ओर घूमती है: यह चुंबकीय प्रभाव है।",
          ),
        },
        {
          id: "copper",
          label: t("Copper is a magnetic metal", "ताँबा एक चुंबकीय धातु है"),
          feedback: t(
            "With the current off, the copper wire does nothing to the needle. It's the current that matters.",
            "धारा बंद होने पर ताँबे का तार सुई पर कुछ नहीं करता। असर धारा का है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("A current makes a magnetic field", "धारा चुंबकीय क्षेत्र बनाती है")),
      w.body(
        t(
          "Activity 13.1. A thick copper wire is held straight, at right angles to the page, with a small compass beside it. Here we look down on it from above: the dot in the middle is the wire.",
          "क्रियाकलाप 13.1। एक मोटा ताँबे का तार पृष्ठ के लंबवत सीधा रखा है, उसके बगल में एक छोटा दिक्सूचक है। यहाँ हम उसे ऊपर से देख रहे हैं: बीच का बिंदु तार है।",
        ),
      ),
      field,
      ask,
      w.note(
        t(
          "In 1820 Hans Christian Oersted noticed exactly this by accident: a compass needle moved when a current flowed in a wire nearby. It showed that **electricity and magnetism are linked**. The unit of magnetic field strength, the oersted, is named after him.",
          "1820 में हैंस क्रिश्चियन ओर्स्टेड ने संयोग से ठीक यही देखा: पास के तार में धारा बहने पर दिक्सूचक की सुई हिली। इससे पता चला कि **विद्युत और चुंबकत्व जुड़े हुए हैं**। चुंबकीय क्षेत्र की प्रबलता का मात्रक, ओर्स्टेड, उनके नाम पर है।",
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Activity 13.5: concentric circles; the field reverses with the current. */
const circles = page(
  "circles",
  (b) => {
    const w = wordsOn(b);
    const field = b.prop(magneticFieldDef, "field", {
      source: Source.StraightWire,
      current: 2,
      showFilings: true,
      showLines: true,
      showArrows: true,
      compass: null,
      canPlace: true,
      canSetCurrent: true,
    });
    b.studentOnly(field.action(FieldAction.SetCurrent));
    b.studentOnly(field.action(FieldAction.PlaceCompass));
    b.standsFor(
      field,
      "a current-carrying wire through a card seen from above, with iron filings in concentric circles round it and arrows on the circles; the learner can reverse the current and place a compass",
    );
    const shape = choiceQuestion(b, {
      name: "shape",
      prompt: t(
        "What shape are the field lines round a straight wire?",
        "सीधे तार के चारों ओर क्षेत्र रेखाओं का आकार क्या है?",
      ),
      options: [
        {
          id: "right",
          label: t("Concentric circles with the wire at the centre", "संकेंद्री वृत्त, जिनके केंद्र में तार है"),
        },
        {
          id: "radial",
          label: t("Straight lines spreading out from the wire", "तार से बाहर फैलती सीधी रेखाएँ"),
          feedback: t(
            "Look at the filings: they curl round the wire, they don't point away from it.",
            "बुरादे को देखो: वह तार के चारों ओर घूमता है, उससे दूर इशारा नहीं करता।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const flip = choiceQuestion(b, {
      name: "flip",
      prompt: t(
        "Press Reverse current. What happens to the arrows on the circles?",
        "धारा उलटो दबाओ। वृत्तों पर तीरों का क्या होता है?",
      ),
      options: [
        {
          id: "right",
          label: t("They turn round: the field reverses", "वे पलट जाते हैं: क्षेत्र उलट जाता है"),
        },
        {
          id: "same",
          label: t("Nothing: the field stays the same", "कुछ नहीं: क्षेत्र वैसा ही रहता है"),
          feedback: t(
            "Watch the compass too: it swings round. Reversing the current reverses the field.",
            "दिक्सूचक भी देखो: वह घूम जाता है। धारा उलटने से क्षेत्र उलट जाता है।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
    });
    b.when(shape.on(QuestionSignal.Correct), theBoard.show(flip));
    return column([
      w.title(t("Circles round the wire", "तार के चारों ओर वृत्त")),
      w.body(
        t(
          "Activity 13.5. The wire goes straight down through a card. Sprinkle iron filings on the card, pass a current, and tap the card.",
          "क्रियाकलाप 13.5। तार एक कार्ड में से सीधा नीचे जाता है। कार्ड पर लोहे का बुरादा छिड़को, धारा बहाओ, और कार्ड को थपथपाओ।",
        ),
      ),
      field,
      shape,
      flip,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Bigger current, stronger field; farther away, weaker. */
const strength = page(
  "strength",
  (b) => {
    const w = wordsOn(b);
    const field = b.prop(magneticFieldDef, "field", {
      source: Source.StraightWire,
      current: 1,
      showLines: true,
      showArrows: true,
      showStrength: true,
      compass: { x: 2, y: 0 },
      canPlace: true,
      canSetCurrent: true,
    });
    b.studentOnly(field.action(FieldAction.SetCurrent));
    b.studentOnly(field.action(FieldAction.PlaceCompass));
    b.standsFor(
      field,
      "a current-carrying wire seen from above with a compass and a strength meter; the learner can change the current and move the compass",
    );
    const ask = choiceQuestion(b, {
      prompt: t(
        "Change the current, then move the compass farther from the wire. What do you find?",
        "धारा बदलो, फिर दिक्सूचक को तार से दूर ले जाओ। तुम्हें क्या मिलता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "More current makes the field stronger; farther from the wire it is weaker",
            "अधिक धारा से क्षेत्र प्रबल होता है; तार से दूर वह कमज़ोर होता है",
          ),
        },
        {
          id: "same",
          label: t(
            "The field is the same everywhere round the wire, near or far",
            "तार के चारों ओर क्षेत्र हर जगह समान है, पास हो या दूर",
          ),
          feedback: t(
            "Watch the meter as you move the compass out: it drops. The circles also spread farther apart.",
            "दिक्सूचक बाहर ले जाते समय मीटर देखो: वह गिरता है। वृत्त भी और दूर-दूर हो जाते हैं।",
          ),
        },
        {
          id: "less",
          label: t(
            "More current makes the field weaker; farther away it is stronger",
            "ज़्यादा धारा क्षेत्र कमज़ोर करती है; दूर जाने पर वह तेज़ होता है",
          ),
          feedback: t(
            "Turn the current up with the compass in one place: the meter rises.",
            "दिक्सूचक एक जगह रखकर धारा बढ़ाओ: मीटर बढ़ता है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("How strong is it?", "वह कितना प्रबल है?")),
      field,
      ask,
      w.definition(
        t(
          "**The field of a straight wire.** Its field lines are **concentric circles** round the wire. The field at a point **increases when the current increases**, and **decreases as you move away** from the wire.",
          "**सीधे तार का क्षेत्र।** इसकी क्षेत्र रेखाएँ तार के चारों ओर **संकेंद्री वृत्त** हैं। किसी बिंदु पर क्षेत्र **धारा बढ़ने पर बढ़ता है**, और तार से **दूर जाने पर घटता है**।",
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The right-hand thumb rule (Maxwell's corkscrew). */
const thumb = page(
  "thumb",
  (b) => {
    const w = wordsOn(b);
    const rule = b.prop(handRuleDef, "rule", {
      rule: Rule.ThumbRule,
      first: Dir.Up,
      second: Dir.Right,
      isRevealed: false,
      canReveal: true,
    });
    b.studentOnly(rule.action(RuleAction.SetFirst));
    b.studentOnly(rule.action(RuleAction.SetSecond));
    b.studentOnly(rule.action(RuleAction.Reveal));
    b.standsFor(
      rule,
      "the right-hand thumb rule: a wire with the current up the page and a point to its right; the learner sets the current and the point, and can reveal the field there",
    );
    const ask = choiceQuestion(b, {
      prompt: t(
        "Current flows **up the page** in a wire. At a point just to the **right** of the wire, which way is the field? (Then press Show the answer.)",
        "एक तार में धारा **पृष्ठ पर ऊपर** की ओर बहती है। तार के ठीक **दाईं ओर** के एक बिंदु पर क्षेत्र किस ओर है? (फिर उत्तर दिखाओ दबाओ।)",
      ),
      options: [
        { id: "right", label: t("Into the page", "पृष्ठ के अंदर") },
        {
          id: "out",
          label: t("Out of the page", "पृष्ठ से बाहर"),
          feedback: t(
            "Curl your right hand round the wire with the thumb up: on the right side your fingers go into the page.",
            "अपना दायाँ हाथ तार के चारों ओर लपेटो, अँगूठा ऊपर: दाईं ओर तुम्हारी उँगलियाँ पृष्ठ के अंदर जाती हैं।",
          ),
        },
        {
          id: "up",
          label: t("Up, along the wire", "ऊपर, तार के साथ"),
          feedback: t(
            "The field circles round the wire; it never points along it.",
            "क्षेत्र तार के चारों ओर घूमता है; वह कभी तार के साथ-साथ नहीं होता।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("The right-hand thumb rule", "दक्षिण-हस्त अंगुष्ठ नियम")),
      w.definition(
        t(
          "**Right-hand thumb rule.** Imagine holding the wire in your **right hand** with your **thumb pointing along the current**. Your **fingers curl round the wire in the direction of the field lines**. (It is also called **Maxwell's corkscrew rule**: drive a corkscrew along the current, and the way it turns is the way the field goes round.)",
          "**दक्षिण-हस्त अंगुष्ठ नियम।** कल्पना करो कि तुमने तार को **दाएँ हाथ** में पकड़ा है और **अँगूठा धारा की दिशा में** है। तुम्हारी **उँगलियाँ तार के चारों ओर क्षेत्र रेखाओं की दिशा में मुड़ती हैं**। (इसे **मैक्सवेल का कॉर्कस्क्रू नियम** भी कहते हैं: कॉर्कस्क्रू को धारा की दिशा में घुमाकर आगे बढ़ाओ, वह जिस ओर घूमता है, क्षेत्र उसी ओर घूमता है।)",
        ),
      ),
      rule,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** Kabir's wire explained. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const pic = sceneOn(
      b,
      "pic",
      MagnetismScene.CompassJumps,
      "Kabir's compass beside the single wire of his battery circuit",
    );
    const ask = choiceQuestion(b, {
      name: "why",
      prompt: t(
        "So why did the needle swing only while the switch was closed, and the other way on the other side of the wire?",
        "तो सुई केवल स्विच बंद रहने पर क्यों घूमी, और तार के दूसरी ओर उलटी क्यों?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "The current in the wire makes circular field lines, which point opposite ways on the two sides",
            "तार की धारा वृत्ताकार क्षेत्र रेखाएँ बनाती है, जो दोनों ओर उलटी दिशा में होती हैं",
          ),
        },
        {
          id: "magnet",
          label: t("The battery has a magnet inside", "बैटरी के अंदर एक चुंबक है"),
          feedback: t(
            "A magnet would act all the time, switch open or closed. The effect switches with the current.",
            "चुंबक हमेशा असर करता, स्विच खुला हो या बंद। यह असर धारा के साथ चालू-बंद होता है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const far = choiceQuestion(b, {
      name: "far",
      prompt: t(
        "Kabir moves the compass a metre away from the wire. What happens to the swing?",
        "कबीर दिक्सूचक को तार से एक मीटर दूर ले जाता है। सुई के घूमने का क्या होता है?",
      ),
      options: [
        { id: "right", label: t("It becomes much smaller", "वह बहुत कम हो जाता है") },
        {
          id: "bigger",
          label: t("It gets bigger", "वह बढ़ जाता है"),
          feedback: t(
            "The field of a wire weakens as you move away from it.",
            "तार से दूर जाने पर उसका क्षेत्र कमज़ोर होता जाता है।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const next = w.note(
      t(
        "One wire makes only a weak field. Next stop: how to make a strong one, strong enough to lift a car.",
        "एक तार केवल कमज़ोर क्षेत्र बनाता है। अगला पड़ाव: प्रबल क्षेत्र कैसे बनाएँ, इतना प्रबल कि कार उठा ले।",
      ),
      "next",
      { isHidden: true },
    );
    b.when(ask.on(QuestionSignal.Correct), theBoard.show(far));
    b.when(far.on(QuestionSignal.Correct), [theBoard.show(next), theBoard.pass()]);
    return column([w.title(t("The wire explained", "तार का रहस्य")), pic, ask, far, next, space()]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Worked: NCERT Example 13.1. */
const examples = page("examples", (b) => {
  const w = wordsOn(b);
  return column([
    w.title(t("A worked example", "एक हल किया गया उदाहरण")),
    w.body(
      t(
        "**A current in a horizontal power line flows from east to west. What is the direction of the magnetic field at a point directly below it, and at a point directly above it?**",
        "**एक क्षैतिज बिजली की लाइन में धारा पूर्व से पश्चिम की ओर बहती है। उसके ठीक नीचे के बिंदु पर और ठीक ऊपर के बिंदु पर चुंबकीय क्षेत्र की दिशा क्या है?**",
      ),
    ),
    w.body(
      t(
        "Point your right thumb along the current, towards the west. Your fingers curl round the line. Looking along the line from the east end, they turn **clockwise**; looking from the west end, **anticlockwise**. So the field circles the wire in a plane at right angles to it.",
        "अपना दायाँ अँगूठा धारा की दिशा में, पश्चिम की ओर रखो। तुम्हारी उँगलियाँ लाइन के चारों ओर मुड़ती हैं। पूर्वी सिरे से लाइन के साथ देखने पर वे **दक्षिणावर्त** घूमती हैं; पश्चिमी सिरे से देखने पर **वामावर्त**। यानी क्षेत्र तार के लंबवत तल में उसके चारों ओर घूमता है।",
      ),
    ),
    w.body(
      t(
        "Directly **below** the line, the fingers point **south**. Directly **above** it, they point **north**.",
        "लाइन के ठीक **नीचे** उँगलियाँ **दक्षिण** की ओर हैं। ठीक **ऊपर** वे **उत्तर** की ओर हैं।",
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
        "Which correctly describes the magnetic field near a long straight wire?",
        "लंबे सीधे तार के पास चुंबकीय क्षेत्र का सही वर्णन कौन-सा है?",
      ),
      options: [
        {
          id: "right",
          label: t("Concentric circles centred on the wire", "तार पर केंद्रित संकेंद्री वृत्त"),
        },
        {
          id: "perp",
          label: t("Straight lines perpendicular to the wire", "तार के लंबवत सीधी रेखाएँ"),
          feedback: t(
            "The lines curl round the wire: circles, not straight lines.",
            "रेखाएँ तार के चारों ओर मुड़ती हैं: वृत्त, सीधी रेखाएँ नहीं।",
          ),
        },
        {
          id: "parallel",
          label: t("Straight lines parallel to the wire", "तार के समांतर सीधी रेखाएँ"),
          feedback: t("The field never points along the wire.", "क्षेत्र कभी तार के साथ-साथ नहीं होता।"),
        },
        {
          id: "radial",
          label: t("Radial lines starting from the wire", "तार से निकलती त्रिज्य रेखाएँ"),
          feedback: t(
            "Field lines don't start on a wire; around a wire they are closed circles.",
            "क्षेत्र रेखाएँ तार से शुरू नहीं होतीं; तार के चारों ओर वे बंद वृत्त हैं।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ A current makes a magnetic field: that's what swung the needle. ✓ Round a straight wire the lines are circles; more current, stronger; farther away, weaker. ✓ The right-hand thumb rule gives the direction. Next stop: coils, and a magnet you can switch on and off.",
        "**मिशन लॉग।** ✓ धारा चुंबकीय क्षेत्र बनाती है: इसी ने सुई घुमाई। ✓ सीधे तार के चारों ओर रेखाएँ वृत्त हैं; अधिक धारा, अधिक प्रबल; दूर, कमज़ोर। ✓ दक्षिण-हस्त अंगुष्ठ नियम दिशा बताता है। अगला पड़ाव: कुंडलियाँ, और एक चुंबक जिसे चालू-बंद किया जा सके।",
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
export const overview = [hook, oersted, circles, strength, thumb, inLife, examples, yourTurn];

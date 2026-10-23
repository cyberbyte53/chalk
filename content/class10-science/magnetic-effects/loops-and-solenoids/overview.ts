import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import { FieldAction, MagnetismScene, Source, magneticFieldDef } from "@chalk/prop-magnetism";
import { sceneOn } from "../kit";

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** The scrapyard crane that lifts a car with no hook. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const pic = sceneOn(
    b,
    "pic",
    MagnetismScene.ScrapCrane,
    "a scrapyard crane holding up an old car by a large round disc with no hook; Riya and Kabir watching",
  );
  return column([
    w.title(t("A crane with no hook", "बिना हुक की क्रेन")),
    pic,
    w.body(
      t(
        "On the way to buy wire for the torch, Riya and Kabir pass the kabadiwala's yard. A crane lowers a flat round disc onto an old car, the operator presses a button, and the whole car rises into the air, stuck to the disc. He swings it over a pile and presses the button again: **the car drops**. A magnet strong enough to lift a car, that lets go when you want? Stop 2 showed that one wire's field is weak. So how is a field this strong made, and how can it be switched off?",
        "टॉर्च के लिए तार ख़रीदने जाते हुए रिया और कबीर कबाड़ीवाले के अहाते से गुज़रते हैं। एक क्रेन एक चपटी गोल तश्तरी पुरानी कार पर उतारती है, चालक एक बटन दबाता है, और पूरी कार तश्तरी से चिपककर हवा में उठ जाती है। वह उसे एक ढेर के ऊपर ले जाकर फिर बटन दबाता है: **कार गिर जाती है**। इतना ताक़तवर चुंबक कि कार उठा ले, और जब चाहो छोड़ दे? पड़ाव 2 ने दिखाया कि एक तार का क्षेत्र कमज़ोर होता है। तो इतना प्रबल क्षेत्र कैसे बनता है, और उसे बंद कैसे किया जाता है?",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** A circular loop: every part adds to the field inside; n turns, n times the field. */
const loop = page(
  "loop",
  (b) => {
    const w = wordsOn(b);
    const field = b.prop(magneticFieldDef, "field", {
      source: Source.Loop,
      current: 2,
      turns: 1,
      showLines: true,
      showArrows: true,
      showStrength: true,
      compass: { x: 0, y: 0 },
      canPlace: true,
      canSetTurns: true,
    });
    b.studentOnly(field.action(FieldAction.SetTurns));
    b.studentOnly(field.action(FieldAction.PlaceCompass));
    b.standsFor(
      field,
      "a circular loop of wire cut through its middle, so it crosses the page at two points (one current out, one in); field lines circle each crossing and run straight through the middle; the learner can add turns and move a compass",
    );
    const ask = choiceQuestion(b, {
      prompt: t(
        "Keep the compass at the centre and go from 1 turn to 3 turns, with the same current in each. What happens to the field there?",
        "दिक्सूचक को केंद्र पर रखो और हर फेरे में वही धारा रखते हुए 1 फेरे से 3 फेरों पर जाओ। वहाँ क्षेत्र का क्या होता है?",
      ),
      options: [
        { id: "right", label: t("It becomes 3 times as strong", "वह 3 गुना प्रबल हो जाता है") },
        {
          id: "same",
          label: t("It stays the same", "वह वैसा ही रहता है"),
          feedback: t(
            "Each turn carries current the same way, so each adds its own field. The fields add up.",
            "हर फेरे में धारा एक ही ओर बहती है, इसलिए हर फेरा अपना क्षेत्र जोड़ता है। क्षेत्र जुड़ जाते हैं।",
          ),
        },
        {
          id: "third",
          label: t("It becomes a third as strong", "वह एक-तिहाई रह जाता है"),
          feedback: t(
            "Watch the meter: it rises with each turn.",
            "मीटर देखो: वह हर फेरे के साथ बढ़ता है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Bend the wire into a loop", "तार को पाश में मोड़ो")),
      w.body(
        t(
          "Bend the straight wire into a circle. We cut the loop through its middle and look at the cut: the wire crosses the page twice, with the current coming out at one crossing (⊙) and going in at the other (⊗).",
          "सीधे तार को वृत्त में मोड़ो। हम पाश को उसके बीच से काटकर कटी जगह देखते हैं: तार पृष्ठ को दो बार पार करता है, एक जगह धारा बाहर आती है (⊙) और दूसरी जगह अंदर जाती है (⊗)।",
        ),
      ),
      field,
      w.definition(
        t(
          "**The field of a loop.** Near the wire the field lines are small circles, as for a straight wire. Towards the centre the circles grow so large that they look like **straight lines**. By the thumb rule, **every part of the loop sends its field the same way through the middle**, so the parts add up. A **coil** of **n turns** gives a field **n times** as large as one turn.",
          "**पाश का क्षेत्र।** तार के पास क्षेत्र रेखाएँ छोटे वृत्त हैं, जैसे सीधे तार के लिए। केंद्र की ओर वृत्त इतने बड़े हो जाते हैं कि **सीधी रेखाओं** जैसे दिखते हैं। अंगुष्ठ नियम से, **पाश का हर भाग अपना क्षेत्र बीच में एक ही दिशा में भेजता है**, इसलिए सब जुड़ जाते हैं। **n फेरों** की **कुंडली** एक फेरे से **n गुना** क्षेत्र देती है।",
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The solenoid: like a bar magnet, with a uniform field inside. */
const solenoid = page(
  "solenoid",
  (b) => {
    const w = wordsOn(b);
    const field = b.prop(magneticFieldDef, "field", {
      source: Source.Solenoid,
      current: 2,
      showLines: true,
      showArrows: true,
      showPoles: false,
      canPlace: true,
      compass: { x: 0, y: 0 },
    });
    b.studentOnly(field.action(FieldAction.PlaceCompass));
    b.standsFor(
      field,
      "a solenoid seen side-on with its field lines: parallel straight lines inside, curving round outside from one end to the other like a bar magnet's; the learner can move a compass",
    );
    const ask = choiceQuestion(b, {
      prompt: t(
        "The magnetic field inside a long straight solenoid carrying a current is…",
        "धारावाही लंबी सीधी परिनालिका के अंदर चुंबकीय क्षेत्र…",
      ),
      options: [
        { id: "right", label: t("the same at all points", "सभी बिंदुओं पर एक समान होता है") },
        {
          id: "zero",
          label: t("zero", "शून्य होता है"),
          feedback: t(
            "Move the compass inside: it turns hard. The field inside is strong, not zero.",
            "दिक्सूचक को अंदर ले जाओ: वह ज़ोर से घूमता है। अंदर क्षेत्र प्रबल है, शून्य नहीं।",
          ),
        },
        {
          id: "drops",
          label: t("weaker towards its ends", "सिरों की ओर कमज़ोर होता है"),
          feedback: t(
            "Inside, the lines are parallel and evenly spaced all along: the same field everywhere.",
            "अंदर रेखाएँ पूरी लंबाई में समांतर और बराबर दूरी पर हैं: हर जगह एक जैसा क्षेत्र।",
          ),
        },
        {
          id: "grows",
          label: t("stronger towards its ends", "सिरों की ओर प्रबल होता है"),
          feedback: t(
            "Evenly spaced parallel lines mean the same field everywhere inside.",
            "बराबर दूरी वाली समांतर रेखाओं का अर्थ है अंदर हर जगह एक जैसा क्षेत्र।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("The solenoid", "परिनालिका")),
      w.definition(
        t(
          "**Solenoid.** A coil of many circular turns of insulated copper wire, wound closely in the shape of a cylinder, is a **solenoid**.",
          "**परिनालिका।** विद्युतरोधी ताँबे के तार के अनेक वृत्ताकार फेरों वाली कुंडली, जो बेलन के आकार में पास-पास लपेटी गई हो, **परिनालिका** कहलाती है।",
        ),
      ),
      field,
      w.body(
        t(
          "Compare it with the bar magnet's field from stop 1: outside, the lines curve from one end to the other, just the same. **One end of a solenoid behaves as a north pole and the other as a south pole.** Inside, the lines are **parallel straight lines**, evenly spaced.",
          "इसकी तुलना पड़ाव 1 के छड़ चुंबक के क्षेत्र से करो: बाहर रेखाएँ एक सिरे से दूसरे सिरे तक ठीक वैसे ही मुड़ती हैं। **परिनालिका का एक सिरा उत्तर ध्रुव और दूसरा दक्षिण ध्रुव की तरह व्यवहार करता है।** अंदर रेखाएँ **समांतर सीधी रेखाएँ** हैं, बराबर दूरी पर।",
        ),
      ),
      w.definition(
        t(
          "**Uniform field.** A field that has the same size and direction at every point is **uniform**. It is drawn as parallel, equally spaced straight lines. The field inside a solenoid is uniform.",
          "**एकसमान क्षेत्र।** जिस क्षेत्र का परिमाण और दिशा हर बिंदु पर एक जैसे हों, वह **एकसमान** है। उसे समांतर, बराबर दूरी वाली सीधी रेखाओं से दिखाते हैं। परिनालिका के अंदर क्षेत्र एकसमान होता है।",
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Which end is N: reverse the current and the poles swap; finding them with a bar magnet. */
const poles = page(
  "poles",
  (b) => {
    const w = wordsOn(b);
    const field = b.prop(magneticFieldDef, "field", {
      source: Source.Solenoid,
      current: 2,
      showLines: true,
      showArrows: true,
      showPoles: true,
      canPlace: false,
      canSetCurrent: true,
    });
    b.studentOnly(field.action(FieldAction.SetCurrent));
    b.standsFor(
      field,
      "a solenoid with its N and S ends marked; the learner can reverse the current",
    );
    const flip = choiceQuestion(b, {
      name: "flip",
      prompt: t(
        "Reverse the current. What happens to the poles?",
        "धारा उलटो। ध्रुवों का क्या होता है?",
      ),
      options: [
        { id: "right", label: t("They swap ends", "वे सिरे बदल लेते हैं") },
        {
          id: "stay",
          label: t("They stay where they were", "वे जहाँ थे वहीं रहते हैं"),
          feedback: t(
            "The field lines inside now point the other way, so the end they come out of, the N pole, is now the other end.",
            "अंदर क्षेत्र रेखाएँ अब उलटी ओर हैं, इसलिए जिस सिरे से वे निकलती हैं, यानी N ध्रुव, अब दूसरा सिरा है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const test = choiceQuestion(b, {
      name: "test",
      prompt: t(
        "You bring the N pole of a bar magnet near one end of a current-carrying solenoid hung freely, and that end is pushed away. Which pole is that end?",
        "तुम छड़ चुंबक का N ध्रुव एक मुक्त लटकी धारावाही परिनालिका के एक सिरे के पास लाते हो, और वह सिरा दूर धकेला जाता है। वह सिरा कौन-सा ध्रुव है?",
      ),
      options: [
        { id: "right", label: t("North", "उत्तर") },
        {
          id: "south",
          label: t("South", "दक्षिण"),
          feedback: t(
            "Only like poles repel. Being pushed away by N means the end is also N.",
            "केवल सजातीय ध्रुव प्रतिकर्षित करते हैं। N द्वारा दूर धकेले जाने का अर्थ है वह सिरा भी N है।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
    });
    b.when(flip.on(QuestionSignal.Correct), theBoard.show(test));
    return column([
      w.title(t("Which end is north?", "उत्तर कौन-सा सिरा है?")),
      field,
      flip,
      test,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The electromagnet: a soft iron core inside a solenoid. */
const electromagnet = page(
  "electromagnet",
  (b) => {
    const w = wordsOn(b);
    const field = b.prop(magneticFieldDef, "field", {
      source: Source.Solenoid,
      current: 3,
      showLines: true,
      showArrows: true,
      showPoles: true,
      canPlace: false,
      canSetCurrent: true,
    });
    b.studentOnly(field.action(FieldAction.SetCurrent));
    b.standsFor(
      field,
      "a solenoid with a strong current; the learner can turn the current down to zero, when the field disappears",
    );
    const ask = choiceQuestion(b, {
      prompt: t(
        "Set the current to 0. What happens to the field, and so to an electromagnet?",
        "धारा 0 कर दो। क्षेत्र का क्या होता है, और इसलिए विद्युत चुंबक का?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "The field disappears, so the electromagnet stops being a magnet",
            "क्षेत्र ग़ायब हो जाता है, इसलिए विद्युत चुंबक चुंबक नहीं रहता",
          ),
        },
        {
          id: "stays",
          label: t("The field stays, like a bar magnet's", "क्षेत्र बना रहता है, छड़ चुंबक की तरह"),
          feedback: t(
            "The solenoid's field comes from its current. No current, no field: that is what makes an electromagnet switchable.",
            "परिनालिका का क्षेत्र उसकी धारा से आता है। धारा नहीं, क्षेत्र नहीं: इसी से विद्युत चुंबक को चालू-बंद किया जा सकता है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("The electromagnet", "विद्युत चुंबक")),
      w.body(
        t(
          "The strong field inside a solenoid can **magnetise** a piece of magnetic material, such as soft iron, placed inside the coil: the iron becomes a magnet while the current flows.",
          "परिनालिका के अंदर का प्रबल क्षेत्र कुंडली के अंदर रखे किसी चुंबकीय पदार्थ, जैसे नरम लोहे, को **चुंबकित** कर सकता है: जब तक धारा बहती है, लोहा चुंबक बना रहता है।",
        ),
      ),
      w.definition(
        t(
          "**Electromagnet.** A core of **soft iron** wrapped with a coil of insulated copper wire. When a current flows in the coil the core becomes a strong magnet; when the current stops, it loses most of its magnetism.",
          "**विद्युत चुंबक।** **नरम लोहे** का एक क्रोड जिस पर विद्युतरोधी ताँबे के तार की कुंडली लपेटी हो। कुंडली में धारा बहने पर क्रोड प्रबल चुंबक बन जाता है; धारा रुकने पर उसका अधिकांश चुंबकत्व चला जाता है।",
        ),
      ),
      field,
      ask,
      w.note(
        t(
          "**Magnetism in medicine.** Every current makes a magnetic field, even the tiny ion currents along our nerves. In the body these fields are very weak, about a billionth of the Earth's, and they matter most in the heart and the brain. **Magnetic Resonance Imaging (MRI)** uses magnetic fields inside the body to take pictures of body parts that help doctors diagnose illness.",
          "**चिकित्सा में चुंबकत्व।** हर धारा चुंबकीय क्षेत्र बनाती है, हमारी तंत्रिकाओं में बहने वाली नन्ही आयन धाराएँ भी। शरीर में ये क्षेत्र बहुत कमज़ोर होते हैं, पृथ्वी के क्षेत्र का लगभग अरबवाँ भाग, और हृदय तथा मस्तिष्क में सबसे महत्वपूर्ण होते हैं। **चुंबकीय अनुनाद प्रतिबिंबन (MRI)** शरीर के अंदर चुंबकीय क्षेत्रों से अंगों के चित्र लेता है, जो डॉक्टरों को रोग पहचानने में मदद करते हैं।",
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

/** The crane explained. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const pic = sceneOn(b, "pic", MagnetismScene.ScrapCrane, "the scrapyard crane lifting the car");
    const ask = choiceQuestion(b, {
      name: "disc",
      prompt: t(
        "What is the crane's round disc, and what does the operator's button do?",
        "क्रेन की गोल तश्तरी क्या है, और चालक का बटन क्या करता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "An electromagnet; the button switches its current on and off",
            "एक विद्युत चुंबक; बटन उसकी धारा चालू-बंद करता है",
          ),
        },
        {
          id: "bar",
          label: t(
            "A huge permanent magnet that the button pushes away",
            "एक विशाल स्थायी चुंबक जिसे बटन दूर धकेलता है",
          ),
          feedback: t(
            "A permanent magnet can't simply let go. Switching off the current switches off the field, so the car drops.",
            "स्थायी चुंबक ऐसे ही नहीं छोड़ सकता। धारा बंद करने से क्षेत्र बंद होता है, इसलिए कार गिरती है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const more = choiceQuestion(b, {
      name: "more",
      prompt: t(
        "The yard wants an even stronger lift. Which change helps?",
        "अहाते वाले और भी ताक़तवर उठान चाहते हैं। कौन-सा बदलाव मदद करेगा?",
      ),
      options: [
        {
          id: "right",
          label: t("More turns of wire, or more current", "तार के और फेरे, या अधिक धारा"),
        },
        {
          id: "copper",
          label: t("A copper core instead of soft iron", "नरम लोहे की जगह ताँबे का क्रोड"),
          feedback: t(
            "Copper isn't magnetic, so it can't be magnetised. More turns or more current make the field stronger.",
            "ताँबा चुंबकीय नहीं है, इसलिए वह चुंबकित नहीं होता। अधिक फेरे या अधिक धारा क्षेत्र को प्रबल बनाते हैं।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const next = w.note(
      t(
        "A current makes a magnetic field. Then does a magnet push back on a current? Next stop: the force on a current.",
        "धारा चुंबकीय क्षेत्र बनाती है। तो क्या चुंबक भी धारा को वापस धकेलता है? अगला पड़ाव: धारा पर बल।",
      ),
      "next",
      { isHidden: true },
    );
    b.when(ask.on(QuestionSignal.Correct), theBoard.show(more));
    b.when(more.on(QuestionSignal.Correct), [theBoard.show(next), theBoard.pass()]);
    return column([
      w.title(t("The crane explained", "क्रेन का रहस्य")),
      pic,
      ask,
      more,
      next,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Worked: NCERT in-text Q1, Q2 and Exercise 7. */
const examples = page("examples", (b) => {
  const w = wordsOn(b);
  return column([
    w.title(t("Worked answers", "हल किए गए उत्तर")),
    w.body(
      t(
        "**A circular loop of wire lies flat on the table, and the current goes round it clockwise (seen from above). Find the direction of the field inside and outside the loop.**",
        "**तार का एक वृत्ताकार पाश मेज़ पर सपाट रखा है, और धारा उसमें (ऊपर से देखने पर) दक्षिणावर्त घूमती है। पाश के अंदर और बाहर क्षेत्र की दिशा ज्ञात करो।**",
      ),
    ),
    w.body(
      t(
        "Take any short piece of the wire and apply the thumb rule, thumb along the clockwise current. On the inside of the loop your fingers point **down, into the table**; on the outside they point **up, out of the table**. Every piece agrees, so the field inside is into the table and outside it is out of the table.",
        "तार का कोई छोटा टुकड़ा लो और अंगुष्ठ नियम लगाओ, अँगूठा दक्षिणावर्त धारा की दिशा में। पाश के अंदर की ओर तुम्हारी उँगलियाँ **नीचे, मेज़ के अंदर** इशारा करती हैं; बाहर की ओर **ऊपर, मेज़ से बाहर**। हर टुकड़ा यही बताता है, इसलिए अंदर क्षेत्र मेज़ के अंदर है और बाहर मेज़ से बाहर।",
      ),
    ),
    w.body(
      t(
        "**The magnetic field in a region is uniform. Draw a diagram to represent it.** Draw parallel straight lines, equally spaced, all with arrows the same way.",
        "**किसी क्षेत्र में चुंबकीय क्षेत्र एकसमान है। इसे दिखाने के लिए आरेख बनाओ।** समांतर सीधी रेखाएँ बनाओ, बराबर दूरी पर, सबके तीर एक ही ओर।",
      ),
    ),
    w.body(
      t(
        "**List two methods of producing magnetic fields.** (1) A permanent magnet, such as a bar magnet. (2) A current in a conductor, such as a straight wire, a coil or a solenoid (an electromagnet).",
        "**चुंबकीय क्षेत्र उत्पन्न करने की दो विधियाँ लिखो।** (1) स्थायी चुंबक, जैसे छड़ चुंबक। (2) किसी चालक में धारा, जैसे सीधा तार, कुंडली या परिनालिका (विद्युत चुंबक)।",
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
        "True or false: the field at the centre of a long circular coil carrying a current is made of parallel straight lines.",
        "सही या ग़लत: धारावाही लंबी वृत्ताकार कुंडली के केंद्र पर क्षेत्र समांतर सीधी रेखाओं से बना होता है।",
      ),
      options: [
        { id: "right", label: t("True", "सही") },
        {
          id: "false",
          label: t("False", "ग़लत"),
          feedback: t(
            "At the centre the big circles from every part of the coil look straight and run the same way: parallel straight lines.",
            "केंद्र पर कुंडली के हर भाग के बड़े वृत्त सीधे दिखते हैं और एक ही ओर चलते हैं: समांतर सीधी रेखाएँ।",
          ),
        },
      ],
      answer: "right",
      keepOrder: true,
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ A loop adds up its field in the middle; n turns, n times stronger. ✓ A solenoid acts like a bar magnet, with a uniform field inside. ✓ An electromagnet is a magnet you switch on with a current: that's the crane. Next stop: does a magnet push a current?",
        "**मिशन लॉग।** ✓ पाश बीच में अपना क्षेत्र जोड़ता है; n फेरे, n गुना प्रबल। ✓ परिनालिका छड़ चुंबक की तरह व्यवहार करती है, अंदर एकसमान क्षेत्र के साथ। ✓ विद्युत चुंबक एक चुंबक है जिसे धारा से चालू करते हैं: यही क्रेन है। अगला पड़ाव: क्या चुंबक धारा को धकेलता है?",
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
export const overview = [hook, loop, solenoid, poles, electromagnet, inLife, examples, yourTurn];

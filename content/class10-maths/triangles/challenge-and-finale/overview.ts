import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import { TrianglesSceneKind } from "@chalk/prop-triangles";
import { BISECTOR, CHORDS, OBTUSE } from "../figures";
import { figureOn, sceneOn } from "../kit";

const r = String.raw;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** The night before: Grandpa's puzzles. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const lamp = sceneOn(
    b,
    "lamp",
    TrianglesSceneKind.StreetLamp,
    "evening in the colony lane: Kabir walking away from a street lamp with his shadow stretching ahead, Riya beside him with a notebook",
  );
  return column([
    w.title(t("Grandpa's puzzles", "दादाजी की पहेलियाँ")),
    lamp,
    w.body(
      t(
        'Everything is ready for tomorrow. On the evening walk Grandpa, pleased, sets the two of them a few harder puzzles "for after the lights are on". These are NCERT\'s optional Exercise 6.6: not for the exam, but good practice with every tool from this chapter.',
        'कल के लिए सब तैयार है। शाम की सैर पर दादाजी, ख़ुश होकर, दोनों को कुछ कठिन पहेलियाँ देते हैं, "रोशनी लगने के बाद के लिए"। ये NCERT की वैकल्पिक प्रश्नावली 6.6 हैं: परीक्षा के लिए नहीं, पर इस अध्याय के हर औज़ार का अच्छा अभ्यास।',
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Exercise 6.6 Q1: the angle bisector theorem. */
const bisector = page(
  "bisector",
  (b) => {
    const w = wordsOn(b);
    const why = choiceQuestion(b, {
      name: "why",
      prompt: t("In the proof, why is ∠PRT = ∠PTR?", "उपपत्ति में ∠PRT = ∠PTR क्यों है?"),
      options: [
        {
          id: "right",
          label: t("Both equal half of ∠QPR", "दोनों ∠QPR के आधे के बराबर हैं"),
        },
        {
          id: "right-angle",
          label: t("Both are right angles", "दोनों समकोण हैं"),
          feedback: t(
            "Nothing here is a right angle. ∠PTR = ∠QPS (corresponding) and ∠PRT = ∠SPR (alternate), and PS halves ∠QPR.",
            "यहाँ कुछ भी समकोण नहीं। ∠PTR = ∠QPS (संगत) और ∠PRT = ∠SPR (एकांतर), और PS, ∠QPR को आधा करती है।",
          ),
        },
        {
          id: "vert",
          label: t("They are vertically opposite", "वे शीर्षाभिमुख हैं"),
          feedback: t(
            "They sit at different corners, R and T. They are equal because each equals half of ∠QPR.",
            "वे अलग कोनों पर हैं, R और T। वे इसलिए बराबर हैं क्योंकि हर एक ∠QPR के आधे के बराबर है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("The angle bisector", "कोण समद्विभाजक")),
      w.definition(
        t(
          "**Angle bisector.** A line that cuts an angle into two equal angles **bisects** it.",
          "**कोण समद्विभाजक।** जो रेखा किसी कोण को दो बराबर कोणों में काटे, वह उसे **समद्विभाजित** करती है।",
        ),
      ),
      figureOn(b, "figure", BISECTOR),
      w.body(
        t(
          r`**Exercise 6.6 Q1.** PS bisects ∠QPR of ∆ PQR, meeting QR at S. Prove $$\frac{QS}{SR} = \frac{PQ}{PR}$$ **Construction:** through R draw a line parallel to SP, meeting QP extended at T. **Proof.** Since PS ∥ TR: $$\angle PTR = \angle QPS \quad \text{(corresponding)}$$ $$\angle PRT = \angle SPR \quad \text{(alternate)}$$ PS bisects ∠QPR, so ∠QPS = ∠SPR, and therefore $$\angle PTR = \angle PRT$$ Sides opposite equal angles are equal: PT = PR. In ∆ QTR, PS ∥ TR, so by the BPT $$\frac{QS}{SR} = \frac{QP}{PT} = \frac{PQ}{PR}$$`,
          r`**प्रश्नावली 6.6 प्र1।** PS, ∆ PQR के ∠QPR को समद्विभाजित करती है और QR से S पर मिलती है। सिद्ध करो $$\frac{QS}{SR} = \frac{PQ}{PR}$$ **रचना:** R से SP के समांतर एक रेखा खींचो, जो बढ़ाई गई QP से T पर मिले। **उपपत्ति।** चूँकि PS ∥ TR: $$\angle PTR = \angle QPS \quad \text{(संगत)}$$ $$\angle PRT = \angle SPR \quad \text{(एकांतर)}$$ PS, ∠QPR को समद्विभाजित करती है, तो ∠QPS = ∠SPR, और इसलिए $$\angle PTR = \angle PRT$$ बराबर कोणों की सम्मुख भुजाएँ बराबर होती हैं: PT = PR। ∆ QTR में PS ∥ TR, इसलिए BPT से $$\frac{QS}{SR} = \frac{QP}{PT} = \frac{PQ}{PR}$$`,
        ),
      ),
      why,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Exercise 6.6 Q3 and Q4: Pythagoras for obtuse and acute angles. */
const obtuse = page(
  "obtuse",
  (b) => {
    const w = wordsOn(b);
    const sign = choiceQuestion(b, {
      name: "sign",
      prompt: t(
        "If ∠B is greater than 90°, how does AC² compare with AB² + BC²?",
        "अगर ∠B, 90° से बड़ा हो, तो AC² की AB² + BC² से तुलना कैसी है?",
      ),
      options: [
        { id: "right", label: t("AC² is bigger", "AC² बड़ा है") },
        {
          id: "equal",
          label: t("AC² is equal", "AC² बराबर है"),
          feedback: t(
            "Equality holds only when ∠B = 90°. Opening the angle wider makes AC longer: + 2 BC · BD.",
            "बराबरी केवल तब है जब ∠B = 90°। कोण चौड़ा करने से AC लंबी होती है: + 2 BC · BD।",
          ),
        },
        {
          id: "less",
          label: t("AC² is smaller", "AC² छोटा है"),
          feedback: t(
            "That's the acute case (Q4). For an obtuse angle the extra term is added.",
            "यह न्यून कोण वाली स्थिति है (प्र4)। अधिक कोण के लिए अतिरिक्त पद जुड़ता है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("When the angle isn't 90°", "जब कोण 90° न हो")),
      w.definition(
        t(
          "**Obtuse and acute.** An **obtuse** angle is more than 90°; an **acute** angle is less than 90°.",
          "**अधिक और न्यून।** **अधिक कोण** 90° से बड़ा होता है; **न्यून कोण** 90° से छोटा।",
        ),
      ),
      figureOn(b, "figure", OBTUSE),
      w.body(
        t(
          r`**Exercise 6.6 Q3.** ∠ABC > 90° and AD ⊥ CB extended. In right ∆ ADC and right ∆ ADB: $$AC^2 = AD^2 + DC^2 = AD^2 + (DB + BC)^2$$ $$= AD^2 + DB^2 + BC^2 + 2\,BC \cdot BD$$ Since $AD^2 + DB^2 = AB^2$: $$AC^2 = AB^2 + BC^2 + 2\,BC \cdot BD$$`,
          r`**प्रश्नावली 6.6 प्र3।** ∠ABC > 90° और AD ⊥ बढ़ाई गई CB। समकोण ∆ ADC और समकोण ∆ ADB में: $$AC^2 = AD^2 + DC^2 = AD^2 + (DB + BC)^2$$ $$= AD^2 + DB^2 + BC^2 + 2\,BC \cdot BD$$ चूँकि $AD^2 + DB^2 = AB^2$: $$AC^2 = AB^2 + BC^2 + 2\,BC \cdot BD$$`,
        ),
      ),
      w.body(
        t(
          r`**Q4**, with ∠ABC < 90° and D on BC, is the same with DC = BC − BD: $$AC^2 = AB^2 + BC^2 - 2\,BC \cdot BD$$`,
          r`**प्र4**, जिसमें ∠ABC < 90° और D, BC पर है, वही है, बस DC = BC − BD: $$AC^2 = AB^2 + BC^2 - 2\,BC \cdot BD$$`,
        ),
      ),
      sign,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Exercise 6.6 Q7: intersecting chords. */
const chords = page(
  "chords",
  (b) => {
    const w = wordsOn(b);
    const ap = choiceQuestion(b, {
      name: "ap",
      prompt: t(
        "Chords AB and CD meet at P inside a circle. AP = 4, PB = 6, CP = 3. Find DP.",
        "जीवाएँ AB और CD एक वृत्त के अंदर P पर मिलती हैं। AP = 4, PB = 6, CP = 3। DP ज्ञात करो।",
      ),
      options: [
        { id: "right", label: t("8", "8") },
        {
          id: "sum",
          label: t("7", "7"),
          feedback: t(
            "It's products, not sums: AP · PB = CP · DP, so 24 = 3 · DP.",
            "यह गुणनफल है, योग नहीं: AP · PB = CP · DP, तो 24 = 3 · DP।",
          ),
        },
        {
          id: "ratio",
          label: t("4.5", "4.5"),
          feedback: t(
            "That sets AP/PB = CP/DP. The similar triangles give AP/DP = CP/PB instead, so AP · PB = CP · DP.",
            "इसमें AP/PB = CP/DP लिया गया। समरूप त्रिभुज AP/DP = CP/PB देते हैं, इसलिए AP · PB = CP · DP।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Crossing chords", "काटती जीवाएँ")),
      w.definition(
        t(
          "**Chord.** A chord of a circle is a line segment joining two points on the circle.",
          "**जीवा।** वृत्त की जीवा वृत्त के दो बिंदुओं को जोड़ने वाला रेखाखंड है।",
        ),
      ),
      figureOn(b, "figure", CHORDS),
      w.body(
        t(
          r`**Exercise 6.6 Q7.** Chords AB and CD meet at P. In ∆ APC and ∆ DPB: $$\angle APC = \angle DPB \quad \text{(vertically opposite)}$$ $$\angle CAP = \angle BDP \quad \text{(same segment)}$$ So by AA, ∆ APC ~ ∆ DPB, and $$\frac{AP}{DP} = \frac{CP}{PB}$$ $$AP \cdot PB = CP \cdot DP$$`,
          r`**प्रश्नावली 6.6 प्र7।** जीवाएँ AB और CD, P पर मिलती हैं। ∆ APC और ∆ DPB में: $$\angle APC = \angle DPB \quad \text{(शीर्षाभिमुख)}$$ $$\angle CAP = \angle BDP \quad \text{(एक ही वृत्तखंड)}$$ तो AA से ∆ APC ~ ∆ DPB, और $$\frac{AP}{DP} = \frac{CP}{PB}$$ $$AP \cdot PB = CP \cdot DP$$`,
        ),
      ),
      ap,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Exercise 6.6 Q10: Nazima's fishing line. */
const fishing = page(
  "fishing",
  (b) => {
    const w = wordsOn(b);
    const line = choiceQuestion(b, {
      name: "line",
      prompt: t(
        "Nazima's rod tip is 1.8 m above the water, and the fly is 2.4 m from the point under the tip. How much string is out?",
        "नाज़िमा की छड़ का सिरा पानी से 1.8 m ऊपर है, और मक्खी सिरे के नीचे वाले बिंदु से 2.4 m दूर है। कितना धागा बाहर है?",
      ),
      options: [
        { id: "right", label: t("3 m", "3 m") },
        {
          id: "sum",
          label: t("4.2 m", "4.2 m"),
          feedback: t(
            "That adds the two shorter sides. The taut string is the hypotenuse: √(1.8² + 2.4²) = 3.",
            "यह दोनों छोटी भुजाओं को जोड़ता है। तना हुआ धागा कर्ण है: √(1.8² + 2.4²) = 3।",
          ),
        },
        {
          id: "far",
          label: t("3.6 m", "3.6 m"),
          feedback: t(
            "3.6 m is the fly's distance from Nazima herself, along the water. The string runs from the rod's tip.",
            "3.6 m, मक्खी की नाज़िमा से दूरी है, पानी पर। धागा छड़ के सिरे से जाता है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Nazima goes fishing", "नाज़िमा मछली पकड़ने जाती है")),
      w.body(
        t(
          "**Exercise 6.6 Q10.** Nazima is fly fishing. Her rod's tip is 1.8 m above the water, and the fly rests 3.6 m from her and 2.4 m from the point directly under the tip. The string is taut.",
          "**प्रश्नावली 6.6 प्र10।** नाज़िमा फ़्लाई फ़िशिंग कर रही है। उसकी छड़ का सिरा पानी से 1.8 m ऊपर है, और मक्खी उससे 3.6 m दूर तथा सिरे के ठीक नीचे वाले बिंदु से 2.4 m दूर पानी पर है। धागा तना हुआ है।",
        ),
      ),
      line,
      w.body(
        t(
          r`$$\text{string}^2 = 1.8^2 + 2.4^2 = 3.24 + 5.76 = 9$$ so 3 m is out. She pulls in 5 cm a second, so after 12 s, 60 cm less: 2.4 m. Then the fly's distance from the point under the tip is $$\sqrt{2.4^2 - 1.8^2} = \sqrt{2.52} \approx 1.59 \text{ m}$$ The tip is 3.6 − 2.4 = 1.2 m out from Nazima, so the fly is about 1.59 + 1.2 = 2.79 m from her.`,
          r`$$\text{धागा}^2 = 1.8^2 + 2.4^2 = 3.24 + 5.76 = 9$$ तो 3 m बाहर है। वह हर सेकंड 5 cm खींचती है, तो 12 s बाद 60 cm कम: 2.4 m। तब मक्खी की सिरे के नीचे वाले बिंदु से दूरी $$\sqrt{2.4^2 - 1.8^2} = \sqrt{2.52} \approx 1.59 \text{ m}$$ है। सिरा नाज़िमा से 3.6 − 2.4 = 1.2 m आगे है, तो मक्खी उससे लगभग 1.59 + 1.2 = 2.79 m दूर है।`,
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

/** Republic Day night: every stop recapped. */
const finale = page(
  "finale",
  (b) => {
    const w = wordsOn(b);
    const night = sceneOn(
      b,
      "night",
      TrianglesSceneKind.RepublicNight,
      "Republic Day night: the water tank glowing with a string of lights down to the gate pillar, the flag flying, the family and neighbours cheering",
    );
    const which = choiceQuestion(b, {
      name: "which",
      prompt: t(
        "Which idea measured the tank without anyone climbing it?",
        "किस विचार ने बिना किसी के चढ़े टंकी को नापा?",
      ),
      options: [
        {
          id: "right",
          label: t("Similar triangles, by AA, from shadows", "छाया से, AA द्वारा समरूप त्रिभुज"),
        },
        {
          id: "pyth",
          label: t("Pythagoras, from the wire's length", "पाइथागोरस, तार की लंबाई से"),
          feedback: t(
            "Pythagoras came after: it needed the tank's height to find the wire. The height came from the stick's shadow.",
            "पाइथागोरस बाद में आया: तार निकालने के लिए उसे टंकी की ऊँचाई चाहिए थी। ऊँचाई छड़ी की छाया से आई।",
          ),
        },
        {
          id: "area",
          label: t("Areas, from the banner's ink", "क्षेत्रफल, बैनर की स्याही से"),
          feedback: t(
            "The areas theorem priced the banner. The height came from the stick and its shadow, by AA.",
            "क्षेत्रफल प्रमेय ने बैनर का दाम बताया। ऊँचाई छड़ी और उसकी छाया से, AA द्वारा, आई।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission complete.** (1) Similar figures: same angles, sides in one ratio; the photo print fixed. (2) A line parallel to one side cuts the others in the same ratio; the flag stripes. (3) AA and SSS. (4) SAS, and the tank: 15 m by its shadow. (5) Areas go by the square of the side ratio; the banner's ink. (6) Pythagoras and its converse; the 20 m wire. (7) Grandpa's puzzles. And on Republic Day night, the lights come on.",
        "**मिशन पूरा।** (1) समरूप आकृतियाँ: वही कोण, एक अनुपात में भुजाएँ; फ़ोटो प्रिंट ठीक हुआ। (2) एक भुजा के समांतर रेखा बाक़ी को एक ही अनुपात में काटती है; झंडियों की पट्टियाँ। (3) AA और SSS। (4) SAS, और टंकी: छाया से 15 m। (5) क्षेत्रफल भुजा-अनुपात के वर्ग से चलते हैं; बैनर की स्याही। (6) पाइथागोरस और उसका विलोम; 20 m का तार। (7) दादाजी की पहेलियाँ। और गणतंत्र दिवस की रात, रोशनी जल उठती है।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(which.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([
      w.title(t("Lights on", "रोशनी जल उठी")),
      night,
      w.body(
        t(
          "Republic Day. At dusk the electrician flips the switch, and a 20 m string of lights runs from the top of the 15 m tank down to the gate pillar. The banner, twice as wide and twice as tall, hangs on the gate. Grandpa, who still hasn't climbed anything, looks very pleased.",
          "गणतंत्र दिवस। शाम को बिजली वाला स्विच दबाता है, और 20 m की रोशनी की लड़ी 15 m ऊँची टंकी के ऊपर से गेट के खंभे तक जगमगा उठती है। दोगुना चौड़ा और दोगुना ऊँचा बैनर गेट पर टँगा है। दादाजी, जो अब तक कहीं नहीं चढ़े, बहुत ख़ुश दिखते हैं।",
        ),
      ),
      which,
      log,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Exercise 6.6 Q6: the parallelogram law, as a check. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const para = choiceQuestion(b, {
      name: "para",
      prompt: t(
        "Exercise 6.6 Q6 says: in a parallelogram, the sum of the squares of the diagonals equals the sum of the squares of the sides. A rectangle is 6 by 8. Check it: what is the sum of the squares of its diagonals?",
        "प्रश्नावली 6.6 प्र6 कहता है: समांतर चतुर्भुज में विकर्णों के वर्गों का योग भुजाओं के वर्गों के योग के बराबर होता है। एक आयत 6 × 8 है। जाँचो: उसके विकर्णों के वर्गों का योग क्या है?",
      ),
      options: [
        { id: "right", label: t("200", "200") },
        {
          id: "100",
          label: t("100", "100"),
          feedback: t(
            "That's one diagonal: 6² + 8² = 100. There are two diagonals, so 200, matching 6² + 8² + 6² + 8².",
            "यह एक विकर्ण है: 6² + 8² = 100। विकर्ण दो हैं, तो 200, जो 6² + 8² + 6² + 8² से मेल खाता है।",
          ),
        },
        {
          id: "20",
          label: t("20", "20"),
          feedback: t(
            "That adds the diagonals (10 + 10), not their squares: 10² + 10² = 200.",
            "यह विकर्णों को जोड़ता है (10 + 10), उनके वर्गों को नहीं: 10² + 10² = 200।",
          ),
        },
      ],
      answer: "right",
    });
    return column([w.title(t("One more", "एक और")), para, space()]);
  },
  { passOn: PassOn.Rules },
);

export const overview = [hook, bisector, obtuse, chords, fishing, yourTurn, finale];

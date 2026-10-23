import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import { ChargeAction, ChargeShow, ElectricityScene, chargeFlowDef } from "@chalk/prop-electricity";
import { figure121, sceneOn } from "../kit";

const r = String.raw;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** Who, where, what: the January bill and Mom's deal. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const pic = sceneOn(
    b,
    "pic",
    ElectricityScene.BillShock,
    "Mom at the table holding up an electricity bill for ₹3,240; Grandpa, Riya and Kabir look at it, a room heater in the corner",
  );
  return column([
    w.title(t("The bill", "बिल")),
    pic,
    w.body(
      t(
        "January. Mom opens the electricity bill and reads it twice: **₹3,240**. Last winter it was half that. Riya and Kabir watch her face change. Grandpa quietly turns down his room heater. Kabir's new notebook from the hills has one question so far, *how does my torch make light?*, and Mom's bill is about to add a bigger one.",
        "जनवरी। मम्मी बिजली का बिल खोलती हैं और दो बार पढ़ती हैं: **₹3,240**। पिछली सर्दी यह इसका आधा था। रिया और कबीर मम्मी का चेहरा बदलते देखते हैं। दादाजी चुपचाप अपना रूम हीटर धीमा कर देते हैं। पहाड़ों से लौटकर कबीर की नई कॉपी में अब तक एक ही सवाल है, *मेरी टॉर्च रोशनी कैसे बनाती है?*, और मम्मी का बिल उसमें एक बड़ा सवाल जोड़ने वाला है।",
      ),
    ),
    w.body(
      t(
        'Then Mom makes a deal. **"Find out where the electricity goes, and bring the next bill down. Whatever you save, you keep half."** Riya wants new earphones. Kabir wants a cricket bat.',
        'फिर मम्मी एक सौदा करती हैं। **"पता करो कि बिजली कहाँ जाती है, और अगला बिल कम करो। जितना बचाओगे, उसका आधा तुम्हारा।"** रिया को नए ईयरफ़ोन चाहिए। कबीर को क्रिकेट बैट।',
      ),
    ),
    space(),
  ]);
});

/** Why this chapter: to save electricity you must know what it is; the nine stops. */
const why = page("why", (b) => {
  const w = wordsOn(b);
  const pic = sceneOn(
    b,
    "pic",
    ElectricityScene.MeterBox,
    "the electricity meter by the front door showing 04172 kW h, and Riya with a notebook",
  );
  return column([
    w.title(t("What this chapter is for", "यह अध्याय किसलिए है")),
    pic,
    w.body(
      t(
        'By the front door a meter ticks up all day, counting something it calls "units". To bring the bill down, Riya and Kabir first need to know what is flowing through the wires, what pushes it, what holds it back, where it turns into heat, and what exactly the meter counts. That is this chapter.',
        'मुख्य दरवाज़े के पास एक मीटर दिन भर आगे बढ़ता रहता है, किसी चीज़ को गिनता है जिसे वह "यूनिट" कहता है। बिल कम करने के लिए रिया और कबीर को पहले जानना होगा कि तारों में क्या बहता है, उसे क्या धकेलता है, क्या रोकता है, वह कहाँ गर्मी बन जाता है, और मीटर ठीक-ठीक क्या गिनता है। यही यह अध्याय है।',
      ),
    ),
    w.definition(
      t(
        "**The stops on the way.** (1) What an electric current is: *this lesson*. (2) What pushes it: potential difference. (3) Drawing circuits with symbols. (4) Ohm's law: how push and current are linked. (5) What resistance depends on. (6) Resistors in series. (7) Resistors in parallel. (8) The heating effect, and the fuse. (9) Power, and reading the bill.",
        "**रास्ते के पड़ाव।** (1) विद्युत धारा क्या है: *यह पाठ*। (2) उसे क्या धकेलता है: विभवांतर। (3) प्रतीकों से परिपथ बनाना। (4) ओम का नियम: धक्का और धारा कैसे जुड़े हैं। (5) प्रतिरोध किन बातों पर निर्भर है। (6) श्रेणीक्रम में प्रतिरोधक। (7) पार्श्वक्रम में प्रतिरोधक। (8) तापीय प्रभाव, और फ़्यूज़। (9) शक्ति, और बिल पढ़ना।",
      ),
    ),
    space(),
  ]);
});

/** The first puzzle: Kabir's torch. */
const torch = page("torch", (b) => {
  const w = wordsOn(b);
  const pic = sceneOn(
    b,
    "pic",
    ElectricityScene.TorchDead,
    "Kabir in a dark room shaking a torch that will not light, two cells on the floor",
  );
  return column([
    w.title(t("Kabir's torch", "कबीर की टॉर्च")),
    pic,
    w.body(
      t(
        "That evening Kabir wants to inspect the meter by torchlight. He slides the switch on. Nothing. The cells are new, the bulb is fine, he has checked both. So what does a torch actually need to glow? And what is it that flows through the wires and the bulb? First stop: **electric current**.",
        "उस शाम कबीर टॉर्च की रोशनी में मीटर देखना चाहता है। वह स्विच ऑन करता है। कुछ नहीं। सेल नए हैं, बल्ब ठीक है, उसने दोनों जाँच लिए हैं। तो टॉर्च को जलने के लिए ठीक-ठीक क्या चाहिए? और तारों और बल्ब में से होकर बहता क्या है? पहला पड़ाव: **विद्युत धारा**।",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Charge, conductors, and current as a flow of charge. */
const flow = page(
  "flow",
  (b) => {
    const w = wordsOn(b);
    const wire = b.prop(chargeFlowDef, "wire", {
      amps: 0.5,
      show: ChargeShow.Conventional,
      showCount: false,
      canSetCurrent: false,
      canCount: false,
    });
    b.standsFor(
      wire,
      "a length of metal wire with charges drifting steadily along it past a marked cross-section",
    );
    const ask = choiceQuestion(b, {
      prompt: t("What is an electric current?", "विद्युत धारा क्या है?"),
      options: [
        { id: "right", label: t("A flow of electric charge", "विद्युत आवेश का प्रवाह") },
        {
          id: "wire",
          label: t("The metal the wire is made of", "वह धातु जिससे तार बना है"),
          feedback: t(
            "The metal is the conductor: the road. The current is what moves along it.",
            "धातु चालक है: सड़क। धारा वह है जो उस पर चलती है।",
          ),
        },
        {
          id: "heat",
          label: t("The heat a wire gives out", "तार से निकलने वाली गर्मी"),
          feedback: t(
            "Heat can come from a current (stop 8), but the current itself is charge moving.",
            "गर्मी धारा से आ सकती है (पड़ाव 8), पर धारा स्वयं गतिमान आवेश है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("A current is charge on the move", "धारा यानी चलता हुआ आवेश")),
      w.definition(
        t(
          "**Charge.** From earlier classes: everything is made of atoms, and atoms contain tiny particles that carry **electric charge**. Charge comes in two kinds, positive (+) and negative (−). An **electron** carries a small negative charge.",
          "**आवेश।** पिछली कक्षाओं से: हर चीज़ परमाणुओं से बनी है, और परमाणुओं में नन्हे कण होते हैं जिन पर **विद्युत आवेश** होता है। आवेश दो तरह का होता है, धनात्मक (+) और ऋणात्मक (−)। **इलेक्ट्रॉन** पर एक छोटा ऋणात्मक आवेश होता है।",
        ),
      ),
      w.definition(
        t(
          "**Conductor and current.** A material that lets charge move through it is a **conductor**: metals like copper and aluminium are good ones, because some of their electrons are free to move. When charge flows through a conductor, we say there is an **electric current** in it, just as flowing water makes a water current in a river.",
          "**चालक और धारा।** जो पदार्थ आवेश को अपने में से चलने देता है, वह **चालक** है: ताँबा और ऐलुमिनियम जैसी धातुएँ अच्छे चालक हैं, क्योंकि उनके कुछ इलेक्ट्रॉन चलने के लिए स्वतंत्र होते हैं। जब किसी चालक में आवेश बहता है, तो कहते हैं कि उसमें **विद्युत धारा** है, जैसे बहता पानी नदी में जलधारा बनाता है।",
        ),
      ),
      wire,
      w.body(
        t(
          "Watch the charges drift along the wire. The dashed ring marks one **cross-section**: an imaginary slice straight across the wire. The current is about how much charge crosses that slice.",
          "आवेशों को तार में बहते देखो। बिंदुदार छल्ला एक **अनुप्रस्थ काट** दिखाता है: तार के आर-पार एक काल्पनिक टुकड़ा। धारा इस बारे में है कि कितना आवेश उस टुकड़े को पार करता है।",
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** A circuit is a closed path; a switch makes or breaks it. */
const circuit = page(
  "circuit",
  (b) => {
    const w = wordsOn(b);
    const c = figure121(b, "torch", { isClosed: false });
    b.standsFor(
      c,
      "a cell, a bulb, an ammeter and a plug key joined in one loop; the key is open, so the bulb is dark. Tapping the key closes it",
    );
    const ask = choiceQuestion(b, {
      prompt: t(
        "Tap the key to open and close it. Why does the bulb go dark when the key is open?",
        "कुंजी को टैप करके खोलो और बंद करो। कुंजी खुली होने पर बल्ब क्यों बुझ जाता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "The path is broken, so no charge can flow round it",
            "रास्ता टूट जाता है, इसलिए कोई आवेश उसमें घूम नहीं सकता",
          ),
        },
        {
          id: "used",
          label: t("The cell's charge gets used up", "सेल का आवेश ख़त्म हो जाता है"),
          feedback: t(
            "Close the key again and the bulb glows at once: the cell is fine. Only the path changed.",
            "कुंजी फिर बंद करो और बल्ब तुरंत जलता है: सेल ठीक है। केवल रास्ता बदला।",
          ),
        },
        {
          id: "slow",
          label: t("The current slows down", "धारा धीमी हो जाती है"),
          feedback: t(
            "It doesn't slow: it stops completely. With a gap, there is no complete path at all.",
            "वह धीमी नहीं होती: पूरी तरह रुक जाती है। खाली जगह के साथ कोई पूरा रास्ता ही नहीं बचता।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("A closed path: the circuit", "बंद रास्ता: परिपथ")),
      w.definition(
        t(
          "**Electric circuit.** A continuous, closed path along which an electric current flows is an **electric circuit**. Break the path anywhere, and the current stops everywhere.",
          "**विद्युत परिपथ।** एक लगातार, बंद रास्ता जिस पर विद्युत धारा बहती है, **विद्युत परिपथ** है। रास्ता कहीं भी तोड़ो, और धारा हर जगह रुक जाती है।",
        ),
      ),
      w.definition(
        t(
          "**Cell and switch.** A **cell** (or several cells joined, a **battery**) is what makes the charge flow; the next lesson says how. A **switch**, or **plug key**, makes or breaks the conducting link: closed, the path is complete; open, there is a gap.",
          "**सेल और स्विच।** **सेल** (या कई सेल जुड़कर, **बैटरी**) वह है जो आवेश को बहाता है; अगला पाठ बताएगा कैसे। **स्विच**, या **प्लग कुंजी**, चालक कड़ी को जोड़ती या तोड़ती है: बंद होने पर रास्ता पूरा होता है; खुली होने पर बीच में खाली जगह होती है।",
        ),
      ),
      c,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** I = Q/t; the coulomb and the ampere. */
const howMuch = page(
  "how-much",
  (b) => {
    const w = wordsOn(b);
    const wire = b.prop(chargeFlowDef, "wire", {
      amps: 2,
      countFor: 10,
      show: ChargeShow.Conventional,
      showCount: true,
      canSetCurrent: true,
      canCount: true,
    });
    b.studentOnly(wire.action(ChargeAction.SetCurrent));
    b.studentOnly(wire.action(ChargeAction.Count));
    b.studentOnly(wire.action(ChargeAction.Reset));
    b.standsFor(
      wire,
      "the wire with a current of 2 A; a counter adds up the charge crossing the section over 10 seconds, and the current can be changed",
    );
    const ask = choiceQuestion(b, {
      prompt: t(
        "A current of 2 A flows for 10 s. How much charge crosses the section? Count it to check.",
        "2 A की धारा 10 s तक बहती है। अनुप्रस्थ काट को कितना आवेश पार करता है? गिनकर जाँचो।",
      ),
      options: [
        { id: "right", label: t("20 C", "20 C") },
        {
          id: "five",
          label: t("5 C", "5 C"),
          feedback: t(
            "That's 10 ÷ 2. Each second, 2 C crosses, so in 10 seconds it's 2 × 10.",
            "यह 10 ÷ 2 है। हर सेकंड 2 C पार करता है, तो 10 सेकंड में 2 × 10।",
          ),
        },
        {
          id: "two",
          label: t("2 C", "2 C"),
          feedback: t(
            "2 C is what crosses in one second. The current flowed for 10 seconds.",
            "2 C एक सेकंड में पार करता है। धारा 10 सेकंड बही।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Measuring a current", "धारा को मापना")),
      w.definition(
        t(
          r`**Current, in symbols.** If a charge $Q$ crosses a cross-section of a conductor in a time $t$, the current $I$ is the charge that crosses each second: $$I = \frac{Q}{t}$$ So current is the **rate of flow of charge**.`,
          r`**धारा, प्रतीकों में।** यदि किसी चालक की अनुप्रस्थ काट को समय $t$ में आवेश $Q$ पार करता है, तो धारा $I$ वह आवेश है जो हर सेकंड पार करता है: $$I = \frac{Q}{t}$$ इसलिए धारा **आवेश के बहने की दर** है।`,
        ),
      ),
      w.definition(
        t(
          "**Units.** Charge is measured in **coulombs** (C). Current is measured in **amperes** (A). One ampere is one coulomb crossing each second: 1 A = 1 C/s. Small currents use the **milliampere** (1 mA = 10⁻³ A) and the **microampere** (1 µA = 10⁻⁶ A).",
          "**मात्रक।** आवेश **कूलॉम** (C) में मापा जाता है। धारा **ऐम्पियर** (A) में मापी जाती है। एक ऐम्पियर यानी हर सेकंड एक कूलॉम का पार होना: 1 A = 1 C/s। छोटी धाराओं के लिए **मिलीऐम्पियर** (1 mA = 10⁻³ A) और **माइक्रोऐम्पियर** (1 µA = 10⁻⁶ A)।",
        ),
      ),
      w.body(
        t(
          r`Turn it round, and the charge that crosses in time $t$ is $$Q = I \times t$$ Set a current and count it below.`,
          r`इसे उलटो, और समय $t$ में पार होने वाला आवेश है $$Q = I \times t$$ नीचे धारा तय करो और गिनो।`,
        ),
      ),
      wire,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Electrons, how many in a coulomb, and conventional current's direction. */
const direction = page(
  "direction",
  (b) => {
    const w = wordsOn(b);
    const wire = b.prop(chargeFlowDef, "wire", {
      amps: 1,
      show: ChargeShow.Both,
      showCount: false,
      showElectrons: true,
      canSetCurrent: false,
      canCount: false,
    });
    b.standsFor(
      wire,
      "the wire drawn with both the conventional current arrow (from + to −) and the electrons drifting the opposite way",
    );
    const ask = choiceQuestion(b, {
      prompt: t(
        "In a copper wire, which way do the electrons move compared with the current arrow?",
        "ताँबे के तार में, धारा के तीर की तुलना में इलेक्ट्रॉन किस ओर चलते हैं?",
      ),
      options: [
        { id: "right", label: t("The opposite way", "उलटी ओर") },
        {
          id: "same",
          label: t("The same way", "उसी ओर"),
          feedback: t(
            "The arrow follows the old idea of positive charges moving. Electrons are negative, so they go the other way.",
            "तीर धनावेश के चलने वाले पुराने विचार के अनुसार है। इलेक्ट्रॉन ऋणात्मक हैं, इसलिए वे दूसरी ओर जाते हैं।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Which way does it flow?", "यह किस ओर बहती है?")),
      w.definition(
        t(
          "**How many electrons?** One electron carries a charge of 1.6 × 10⁻¹⁹ C. So one coulomb is the charge of about 6 × 10¹⁸ electrons: six million million million.",
          "**कितने इलेक्ट्रॉन?** एक इलेक्ट्रॉन पर 1.6 × 10⁻¹⁹ C आवेश होता है। इसलिए एक कूलॉम लगभग 6 × 10¹⁸ इलेक्ट्रॉनों का आवेश है: छह लाख करोड़ करोड़।",
        ),
      ),
      w.definition(
        t(
          "**Conventional current.** In metal wires it is electrons that flow. But electricity was studied before anyone knew about electrons, and current was taken to be a flow of positive charge, from the + terminal of the cell round to the − terminal. We still draw it that way: the **direction of current** is opposite to the direction the electrons move.",
          "**परंपरागत धारा।** धातु के तारों में इलेक्ट्रॉन बहते हैं। पर बिजली का अध्ययन इलेक्ट्रॉनों के बारे में किसी के जानने से पहले हुआ, और धारा को धनावेश का प्रवाह माना गया, सेल के + सिरे से घूमकर − सिरे तक। हम आज भी ऐसे ही दिखाते हैं: **धारा की दिशा** इलेक्ट्रॉनों के चलने की दिशा के उलटी होती है।",
        ),
      ),
      wire,
      w.note(
        t(
          "Surprising fact: in a typical wire the electrons drift at only about 1 mm per second. Yet a bulb lights the instant you switch on, because the whole wire is already full of electrons and they all start moving together.",
          "चौंकाने वाली बात: एक सामान्य तार में इलेक्ट्रॉन केवल लगभग 1 mm प्रति सेकंड से खिसकते हैं। फिर भी स्विच दबाते ही बल्ब जल उठता है, क्योंकि पूरा तार पहले से इलेक्ट्रॉनों से भरा है और वे सब एक साथ चलने लगते हैं।",
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The ammeter, always in series. */
const ammeter = page(
  "ammeter",
  (b) => {
    const w = wordsOn(b);
    const c = figure121(b, "circuit", { isClosed: true });
    b.standsFor(
      c,
      "Fig 12.1: a cell, a bulb, an ammeter and a closed plug key in one loop, the ammeter in the same path as the bulb",
    );
    const ask = choiceQuestion(b, {
      prompt: t("How is an ammeter connected?", "ऐमीटर को कैसे जोड़ा जाता है?"),
      options: [
        {
          id: "right",
          label: t(
            "In series: in the same path, so the current goes through it",
            "श्रेणीक्रम में: उसी रास्ते में, ताकि धारा उसमें से होकर जाए",
          ),
        },
        {
          id: "side",
          label: t("To the side of the bulb, on a separate branch", "बल्ब के बगल में, अलग शाखा पर"),
          feedback: t(
            "Then the current wouldn't pass through it. To measure the current, the current must flow through the meter.",
            "तब धारा उसमें से नहीं गुज़रेगी। धारा मापने के लिए धारा को मीटर में से बहना होगा।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("The ammeter", "ऐमीटर")),
      w.definition(
        t(
          "**Ammeter.** An **ammeter** measures the current in a circuit. It is always connected **in series**: placed in the same path, so that the current to be measured flows through it.",
          "**ऐमीटर।** **ऐमीटर** परिपथ में धारा मापता है। इसे हमेशा **श्रेणीक्रम** में जोड़ा जाता है: उसी रास्ते में रखा जाता है, ताकि जिस धारा को मापना है वह इसमें से बहे।",
        ),
      ),
      w.body(
        t(
          "Here is NCERT's first circuit (Fig. 12.1): a cell, a bulb, an ammeter and a plug key. The current flows from the cell's + terminal, through the bulb and the ammeter, back to its − terminal. Tap the key or the bulb and watch the ammeter.",
          "यह NCERT का पहला परिपथ (चित्र 12.1) है: एक सेल, एक बल्ब, एक ऐमीटर और एक प्लग कुंजी। धारा सेल के + सिरे से बल्ब और ऐमीटर से होकर उसके − सिरे पर लौटती है। कुंजी या बल्ब को टैप करो और ऐमीटर देखो।",
        ),
      ),
      c,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** Back to the torch: a loose spring broke the path. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const pic = sceneOn(
      b,
      "pic",
      ElectricityScene.TorchDead,
      "Kabir in the dark with the torch that will not light",
    );
    const ask = choiceQuestion(b, {
      name: "torch",
      prompt: t(
        "Riya unscrews the torch's back cap. The little spring that should press on the last cell has slipped sideways. Why does that stop the bulb glowing?",
        "रिया टॉर्च का पिछला ढक्कन खोलती है। जो छोटी स्प्रिंग आख़िरी सेल को दबानी चाहिए, वह एक ओर खिसक गई है। इससे बल्ब जलना क्यों रुकता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "It leaves a gap, so the circuit isn't closed",
            "इससे खाली जगह बनती है, इसलिए परिपथ बंद नहीं होता",
          ),
        },
        {
          id: "push",
          label: t("The spring was what made the current", "स्प्रिंग ही धारा बनाती थी"),
          feedback: t(
            "The cells make the charge flow. The spring is just part of the path, and now the path has a gap.",
            "सेल आवेश को बहाते हैं। स्प्रिंग बस रास्ते का हिस्सा है, और अब रास्ते में खाली जगह है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const fixed = w.body(
      t(
        "Riya bends the spring back. Click: the torch lights. A torch is a circuit: cells, a switch, a bulb and metal strips in one closed loop, and the switch is just a deliberate gap you can close.",
        "रिया स्प्रिंग को वापस मोड़ती है। क्लिक: टॉर्च जल उठती है। टॉर्च एक परिपथ है: सेल, स्विच, बल्ब और धातु की पट्टियाँ एक बंद लूप में, और स्विच बस एक जानबूझकर छोड़ी गई खाली जगह है जिसे तुम बंद कर सकते हो।",
      ),
      "fixed",
      { isHidden: true },
    );
    const meter = choiceQuestion(b, {
      name: "meter",
      prompt: t(
        'Kabir shines the torch on the meter: "So the meter counts all the charge that flows into our house?" Is he right?',
        'कबीर मीटर पर टॉर्च डालता है: "तो मीटर हमारे घर में बहने वाला सारा आवेश गिनता है?" क्या वह सही है?',
      ),
      options: [
        {
          id: "right",
          label: t(
            "Not quite: the charge flows back out again; something else is counted",
            "पूरी तरह नहीं: आवेश वापस बाहर भी बहता है; कुछ और गिना जाता है",
          ),
        },
        {
          id: "yes",
          label: t("Yes, the bill is for the charge", "हाँ, बिल आवेश का है"),
          feedback: t(
            "A circuit is a loop: every coulomb that comes in goes back out. Charge isn't used up, so it can't be what we pay for. Stop 9 shows what is.",
            "परिपथ एक लूप है: जो भी कूलॉम अंदर आता है, वापस बाहर जाता है। आवेश ख़र्च नहीं होता, इसलिए हम उसका भुगतान नहीं कर सकते। पड़ाव 9 बताता है किसका करते हैं।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const next = w.note(
      t(
        "Charge goes round and comes back. So what is used up? Something must push the charge round, and that push costs energy. Next stop: what pushes the current.",
        "आवेश घूमकर वापस आता है। तो ख़र्च क्या होता है? कुछ तो आवेश को घुमाकर धकेलता है, और उस धक्के में ऊर्जा लगती है। अगला पड़ाव: धारा को क्या धकेलता है।",
      ),
      "next",
      { isHidden: true },
    );
    b.when(ask.on(QuestionSignal.Correct), [theBoard.show(fixed), theBoard.show(meter)]);
    b.when(meter.on(QuestionSignal.Correct), [theBoard.show(next), theBoard.pass()]);
    return column([
      w.title(t("Back to the dead torch", "फिर बंद टॉर्च")),
      pic,
      ask,
      fixed,
      meter,
      next,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Worked: NCERT Example 12.1 and in-text question 3. */
const examples = page("examples", (b) => {
  const w = wordsOn(b);
  return column([
    w.title(t("Two worked examples", "दो हल किए गए उदाहरण")),
    w.body(
      t(
        "**A bulb's filament draws a current of 0.5 A for 10 minutes. How much charge flows through the circuit?**",
        "**एक बल्ब का तंतु 10 मिनट तक 0.5 A की धारा लेता है। परिपथ में कितना आवेश बहता है?**",
      ),
    ),
    w.body(
      t(
        r`Time must be in seconds: $$t = 10 \text{ min} = 10 \times 60 \text{ s} = 600 \text{ s}$$ Then $$Q = I \times t = 0.5 \text{ A} \times 600 \text{ s} = 300 \text{ C}$$`,
        r`समय सेकंड में होना चाहिए: $$t = 10 \text{ min} = 10 \times 60 \text{ s} = 600 \text{ s}$$ तब $$Q = I \times t = 0.5 \text{ A} \times 600 \text{ s} = 300 \text{ C}$$`,
      ),
    ),
    w.body(
      t(
        "**How many electrons make up one coulomb of charge?**",
        "**एक कूलॉम आवेश में कितने इलेक्ट्रॉन होते हैं?**",
      ),
    ),
    w.body(
      t(
        r`Each electron carries $1.6 \times 10^{-19}$ C. The number of electrons is the total charge divided by the charge on one: $$n = \frac{1 \text{ C}}{1.6 \times 10^{-19} \text{ C}} = 6.25 \times 10^{18}$$ That is about $6 \times 10^{18}$, as NCERT says.`,
        r`हर इलेक्ट्रॉन पर $1.6 \times 10^{-19}$ C होता है। इलेक्ट्रॉनों की संख्या कुल आवेश को एक के आवेश से भाग देकर मिलती है: $$n = \frac{1 \text{ C}}{1.6 \times 10^{-19} \text{ C}} = 6.25 \times 10^{18}$$ यानी लगभग $6 \times 10^{18}$, जैसा NCERT कहती है।`,
      ),
    ),
    w.note(
      t(
        "Always change minutes and hours into seconds before using Q = It.",
        "Q = It लगाने से पहले मिनट और घंटों को हमेशा सेकंड में बदलो।",
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
        "Kabir's torch bulb draws 0.4 A. How much charge flows through it in 5 minutes?",
        "कबीर की टॉर्च का बल्ब 0.4 A लेता है। 5 मिनट में उसमें से कितना आवेश बहता है?",
      ),
      options: [
        { id: "right", label: t("120 C", "120 C") },
        {
          id: "two",
          label: t("2 C", "2 C"),
          feedback: t(
            "That uses 5 as the time. Change 5 minutes into seconds first: 300 s.",
            "इसमें समय 5 लिया गया है। पहले 5 मिनट को सेकंड में बदलो: 300 s।",
          ),
        },
        {
          id: "big",
          label: t("750 C", "750 C"),
          feedback: t(
            "That's 300 ÷ 0.4. Charge is current times time: 0.4 × 300.",
            "यह 300 ÷ 0.4 है। आवेश = धारा × समय: 0.4 × 300।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ A current is a flow of charge, measured in amperes: I = Q/t. ✓ It needs a closed circuit; a switch makes or breaks it. ✓ The ammeter goes in series. ✓ Charge comes back round, so it isn't what the meter counts. Next stop: what pushes the charge.",
        "**मिशन लॉग।** ✓ धारा आवेश का प्रवाह है, ऐम्पियर में मापी जाती है: I = Q/t। ✓ इसे बंद परिपथ चाहिए; स्विच उसे जोड़ता या तोड़ता है। ✓ ऐमीटर श्रेणीक्रम में लगता है। ✓ आवेश घूमकर वापस आता है, इसलिए मीटर उसे नहीं गिनता। अगला पड़ाव: आवेश को क्या धकेलता है।",
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
  why,
  torch,
  flow,
  circuit,
  howMuch,
  direction,
  ammeter,
  inLife,
  examples,
  yourTurn,
];

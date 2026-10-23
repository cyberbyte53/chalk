import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import { LensAction, LensKind, SceneKind, lensDef, lightSceneDef } from "@chalk/prop-light";

const r = String.raw;
const still = { isLit: true, canToggle: false } as const;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** Saturday afternoon: Grandpa wants his magnifier back and offers his reading glasses, "+2.0 D". */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const glasses = b.prop(lightSceneDef, "glasses", { scene: SceneKind.Glasses, ...still });
  b.standsFor(
    glasses,
    "Grandpa's reading glasses beside his magnifying glass on a newspaper; through the magnifying glass the print looks much bigger",
  );
  return column([
    w.title(t("Grandpa's offer", "दादाजी का सुझाव")),
    w.body(
      t(
        'Stop 4, the last piece. Saturday afternoon, a few hours before movie night. Grandpa wants his magnifying glass back to read the share prices in the newspaper. "Use my reading glasses instead," he says. "They\'re lenses too."',
        'पड़ाव 4, आख़िरी टुकड़ा। शनिवार दोपहर, मूवी नाइट से कुछ घंटे पहले। दादाजी को अख़बार में शेयर के भाव पढ़ने के लिए अपना आवर्धक काँच वापस चाहिए। "मेरा पढ़ने का चश्मा ले लो," वे कहते हैं। "वह भी तो लेंस है।"',
      ),
    ),
    glasses,
    w.body(
      t(
        "Their case says **+2.0 D**. What does that mean, and would those glasses work in the shoebox? To answer, we need a way to say how strongly a lens bends light.",
        "उसकी डिब्बी पर लिखा है **+2.0 D**। इसका क्या अर्थ है, और क्या यह चश्मा जूते के डिब्बे में काम करेगा? जवाब के लिए हमें यह कहने का तरीक़ा चाहिए कि लेंस प्रकाश को कितनी तेज़ी से मोड़ता है।",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** A stronger lens bends more: shorter f. Power P = 1/f, in dioptres. */
const power = page(
  "power",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "Power from the beam: shorten f and the parallel rays bend more sharply to meet closer to the lens; so how strongly a lens bends light goes with 1/f. P = 1/f with f in metres, in dioptres; + convex, − concave.",
    );
    const g = b.prop(lensDef, "lens", {
      kind: LensKind.Convex,
      focalLength: 20,
      object: { x: -30, height: 5 },
      rays: [],
      beam: true,
      showImage: false,
      showLabels: true,
      canSetFocal: true,
      span: 50,
    });
    b.studentOnly(g.action(LensAction.SetFocalLength));
    b.standsFor(g, "parallel rays through a convex lens whose focal length the learner can change");
    const which = choiceQuestion(b, {
      name: "which",
      prompt: t(
        "Make the focal length shorter. What happens to the rays?",
        "फोकस दूरी छोटी करो। किरणों का क्या होता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "They bend more sharply and meet closer to the lens",
            "वे ज़्यादा तीखी मुड़ती हैं और लेंस के पास मिलती हैं",
          ),
        },
        {
          id: "less",
          label: t("They bend less", "वे कम मुड़ती हैं"),
          feedback: t(
            "Watch the angle the rays turn through at the lens as f gets smaller.",
            "f छोटा होते समय देखो कि लेंस पर किरणें कितने कोण से मुड़ती हैं।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const rule = w.definition(
      t(
        r`**Power of a lens.** How strongly a lens bends light is its **power**, $P$. It is the reciprocal of the focal length: $$P = \frac{1}{f}$$ with $f$ in **metres**. The unit is the **dioptre**, D: **1 dioptre is the power of a lens of focal length 1 m**, so $$1 \text{ D} = \frac{1}{1 \text{ m}}$$ That's why the unit is also written $\text{m}^{-1}$, read **per metre**. A convex lens has a positive power and a concave lens a negative power.`,
        r`**लेंस की क्षमता।** लेंस प्रकाश को कितनी तेज़ी से मोड़ता है, यह उसकी **क्षमता** $P$ है। यह फोकस दूरी का व्युत्क्रम है: $$P = \frac{1}{f}$$ जहाँ $f$ **मीटर** में है। इकाई **डायोप्टर** D है: **1 डायोप्टर उस लेंस की क्षमता है जिसकी फोकस दूरी 1 मीटर हो**, इसलिए $$1 \text{ D} = \frac{1}{1 \text{ m}}$$ इसीलिए इकाई को $\text{m}^{-1}$ भी लिखते हैं, पढ़ते हैं **प्रति मीटर**। उत्तल लेंस की क्षमता धनात्मक और अवतल लेंस की ऋणात्मक होती है।`,
      ),
      "rule",
      { isHidden: true },
    );
    b.when(which.on(QuestionSignal.Correct), [theBoard.show(rule), theBoard.pass()]);
    return column([
      w.title(t("The power of a lens", "लेंस की क्षमता")),
      w.body(
        t(
          "Some lenses bend light only a little, and some bend it a lot. Below, parallel rays go through a convex lens. Change its focal length and watch how sharply the rays turn.",
          "कुछ लेंस प्रकाश को थोड़ा ही मोड़ते हैं, और कुछ बहुत। नीचे समानांतर किरणें एक उत्तल लेंस से गुज़रती हैं। उसकी फोकस दूरी बदलो और देखो कि किरणें कितनी तीखी मुड़ती हैं।",
        ),
      ),
      g,
      which,
      rule,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Opticians' examples both ways; NCERT in-text Q3, Ex 16 and 17. */
const examples = page(
  "examples",
  (b) => {
    const w = wordsOn(b);
    const unit = choiceQuestion(b, {
      name: "unit",
      prompt: t("What is 1 dioptre?", "1 डायोप्टर क्या है?"),
      options: [
        {
          id: "right",
          label: t("The power of a lens of focal length 1 m", "1 मीटर फोकस दूरी वाले लेंस की क्षमता"),
        },
        {
          id: "cm",
          label: t("The power of a lens of focal length 1 cm", "1 सेमी फोकस दूरी वाले लेंस की क्षमता"),
          feedback: t(
            "Power uses the focal length in metres. A 1 cm lens would be 100 D.",
            "क्षमता में फोकस दूरी मीटर में लेते हैं। 1 सेमी वाला लेंस 100 D होता।",
          ),
        },
        {
          id: "length",
          label: t("A focal length of 1 m", "1 मीटर की फोकस दूरी"),
          feedback: t(
            "A dioptre measures power, not length: it's 1 divided by a length in metres.",
            "डायोप्टर क्षमता नापता है, लंबाई नहीं: यह 1 भाग मीटर में एक लंबाई है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Reading a prescription", "नुस्ख़ा पढ़ना")),
      w.body(
        t(
          r`Opticians write lenses by their power. A lens of power +2.0 D is convex, with $$f = \frac{1}{P} = \frac{1}{2.0} = +0.50 \text{ m}$$ A lens of power −2.5 D is concave, with $$f = \frac{1}{-2.5} = -0.40 \text{ m}$$`,
          r`चश्मे वाले लेंस को उसकी क्षमता से लिखते हैं। +2.0 D क्षमता का लेंस उत्तल है, जिसकी $$f = \frac{1}{P} = \frac{1}{2.0} = +0.50 \text{ मीटर}$$ −2.5 D क्षमता का लेंस अवतल है, जिसकी $$f = \frac{1}{-2.5} = -0.40 \text{ मीटर}$$`,
        ),
      ),
      w.body(
        t(
          r`The other way: a convex lens of focal length 25 cm. First change to metres, 25 cm = 0.25 m: $$P = \frac{1}{0.25} = +4 \text{ D}$$`,
          r`उल्टी दिशा में: 25 सेमी फोकस दूरी का उत्तल लेंस। पहले मीटर में बदलो, 25 सेमी = 0.25 मीटर: $$P = \frac{1}{0.25} = +4 \text{ D}$$`,
        ),
      ),
      unit,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Lenses in contact: powers add. */
const contact = page(
  "contact",
  (b) => {
    const w = wordsOn(b);
    const add = choiceQuestion(b, {
      name: "add",
      prompt: t(
        "An optician puts lenses of +1.5 D and −0.5 D together in the testing frame. What single lens do they act like?",
        "चश्मे वाला जाँच के फ्रेम में +1.5 D और −0.5 D के लेंस साथ रखता है। वे किस अकेले लेंस की तरह काम करते हैं?",
      ),
      options: [
        { id: "right", label: t("+1.0 D", "+1.0 D") },
        {
          id: "two",
          label: t("+2.0 D", "+2.0 D"),
          feedback: t(
            "Add the powers with their signs: +1.5 + (−0.5).",
            "क्षमताएँ चिह्नों के साथ जोड़ो: +1.5 + (−0.5)।",
          ),
        },
        {
          id: "times",
          label: t("−0.75 D", "−0.75 D"),
          feedback: t(
            "Powers in contact add; they don't multiply.",
            "संपर्क में रखे लेंसों की क्षमताएँ जुड़ती हैं; गुणा नहीं होतीं।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Lenses in contact", "संपर्क में लेंस")),
      w.body(
        t(
          r`Put thin lenses together, touching, and they act like one lens whose power is the sum of their powers: $$P = P_1 + P_2 + P_3 + \cdots$$ For example, +2.0 D and +0.25 D together act like a single +2.25 D lens.`,
          r`पतले लेंसों को एक-दूसरे से सटाकर रखो, तो वे एक लेंस की तरह काम करते हैं जिसकी क्षमता उनकी क्षमताओं का योग है: $$P = P_1 + P_2 + P_3 + \cdots$$ जैसे, +2.0 D और +0.25 D साथ में एक +2.25 D लेंस की तरह काम करते हैं।`,
        ),
      ),
      w.body(
        t(
          "That's why opticians use power instead of focal length. During an eye test they slip lenses of known power into the frame and just add. Cameras, microscopes and telescopes also combine several lenses this way.",
          "इसीलिए चश्मे वाले फोकस दूरी की जगह क्षमता लेते हैं। आँखों की जाँच में वे फ्रेम में ज्ञात क्षमता के लेंस डालते हैं और बस जोड़ लेते हैं। कैमरे, सूक्ष्मदर्शी और दूरदर्शी भी कई लेंस ऐसे ही जोड़ते हैं।",
        ),
      ),
      add,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** Grandpa's offer: reading glasses (+2 D) instead of the magnifier (+10 D). Why they won't fit. */
const grandpa = page(
  "grandpa",
  (b) => {
    const w = wordsOn(b);
    const fit = choiceQuestion(b, {
      name: "fit",
      prompt: t(
        "Grandpa's reading glasses are +2 D. What is their focal length, and would they work in the 30 cm shoebox?",
        "दादाजी का पढ़ने का चश्मा +2 D है। उसकी फोकस दूरी क्या है, और क्या वह 30 सेमी के जूते के डिब्बे में काम करेगा?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "50 cm; no: the phone must be over 50 cm away",
            "50 सेमी; नहीं: फ़ोन 50 सेमी से ज़्यादा दूर होना चाहिए",
          ),
        },
        {
          id: "two",
          label: t(
            "2 cm; yes, it would fit easily inside the box",
            "2 सेमी; हाँ, वह डिब्बे में आराम से आ जाएगा",
          ),
          feedback: t(
            r`Power is the reciprocal of the focal length in metres: $f = \frac{1}{2} = 0.5$ m, which is 50 cm.`,
            r`क्षमता मीटर में फोकस दूरी का व्युत्क्रम है: $f = \frac{1}{2} = 0.5$ मीटर, यानी 50 सेमी।`,
          ),
        },
        {
          id: "fits",
          label: t("50 cm; yes, the phone can go anywhere", "50 सेमी; हाँ, फ़ोन कहीं भी रख सकते हैं"),
          feedback: t(
            "For a real picture on the wall the phone has to be beyond F₁, and F₁ is 50 cm from the lens. That's longer than the box.",
            "दीवार पर वास्तविक तस्वीर के लिए फ़ोन F₁ से परे होना चाहिए, और F₁ लेंस से 50 सेमी पर है। यह डिब्बे से लंबा है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const stop = w.definition(
      t(
        "**Stop 4 done.** The glasses are too weak: with f = 50 cm the phone would sit more than half a metre from the lens, and the box is only 30 cm long. The +10 D magnifying glass stays in the box, and Grandpa gets it back on Sunday. Every piece of the projector is now worked out.",
        "**पड़ाव 4 पूरा।** चश्मा बहुत कमज़ोर है: f = 50 सेमी के साथ फ़ोन लेंस से आधे मीटर से भी ज़्यादा दूर होता, और डिब्बा केवल 30 सेमी लंबा है। +10 D का आवर्धक काँच डिब्बे में ही रहेगा, और दादाजी को वह रविवार को वापस मिलेगा। प्रोजेक्टर का हर टुकड़ा अब तय है।",
      ),
      "stop",
      { isHidden: true },
    );
    b.when(fit.on(QuestionSignal.Correct), [theBoard.show(stop), theBoard.pass()]);
    return column([
      w.title(t("Back to Grandpa's offer", "फिर दादाजी का सुझाव")),
      w.body(
        t(
          r`Now Grandpa's **+2.0 D** makes sense: his reading glasses are a convex lens of power +2 dioptres. The magnifying glass has $f = 10$ cm $= 0.10$ m, so its power is $$P = \frac{1}{0.10} = +10 \text{ D}$$ It bends light five times as strongly as the glasses.`,
          r`अब दादाजी का **+2.0 D** समझ आता है: उनका पढ़ने का चश्मा +2 डायोप्टर क्षमता का उत्तल लेंस है। आवर्धक काँच की $f = 10$ सेमी $= 0.10$ मीटर है, इसलिए उसकी क्षमता है $$P = \frac{1}{0.10} = +10 \text{ D}$$ यह चश्मे से पाँच गुना तेज़ी से प्रकाश मोड़ता है।`,
        ),
      ),
      fit,
      stop,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** NCERT in-text Q3 and an optician's prescription, both ways. */
const practice = page(
  "practice",
  (b) => {
    const w = wordsOn(b);
    const concave = choiceQuestion(b, {
      name: "concave",
      prompt: t(
        "What is the power of a concave lens of focal length 2 m?",
        "2 मीटर फोकस दूरी वाले अवतल लेंस की क्षमता क्या है?",
      ),
      options: [
        { id: "right", label: t("−0.5 D", "−0.5 D") },
        {
          id: "plus",
          label: t("+0.5 D", "+0.5 D"),
          feedback: t(
            "A concave lens has a negative focal length, f = −2 m, so its power is negative.",
            "अवतल लेंस की फोकस दूरी ऋणात्मक है, f = −2 मीटर, इसलिए उसकी क्षमता ऋणात्मक है।",
          ),
        },
        {
          id: "two",
          label: t("−2 D", "−2 D"),
          feedback: t(
            r`Power is the reciprocal: $\frac{1}{-2} = -0.5$.`,
            r`क्षमता व्युत्क्रम है: $\frac{1}{-2} = -0.5$।`,
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const doctor = choiceQuestion(b, {
      name: "doctor",
      prompt: t(
        "A doctor prescribes a lens of power +1.5 D. What is its focal length, and what kind of lens is it?",
        "डॉक्टर +1.5 D क्षमता का लेंस लिखता है। उसकी फोकस दूरी क्या है, और वह किस तरह का लेंस है?",
      ),
      options: [
        { id: "right", label: t("+0.67 m, converging", "+0.67 मीटर, अभिसारी") },
        {
          id: "diverging",
          label: t("+0.67 m, diverging", "+0.67 मीटर, अपसारी"),
          feedback: t(
            "A positive power means a convex lens, and convex lenses converge.",
            "धनात्मक क्षमता का अर्थ है उत्तल लेंस, और उत्तल लेंस अभिसारी होते हैं।",
          ),
        },
        {
          id: "cm",
          label: t("+1.5 m, converging", "+1.5 मीटर, अभिसारी"),
          feedback: t(
            r`$f = \frac{1}{P} = \frac{1}{1.5} = 0.67$ m.`,
            r`$f = \frac{1}{P} = \frac{1}{1.5} = 0.67$ मीटर।`,
          ),
        },
      ],
      answer: "right",
      isHidden: true,
    });
    b.when(concave.on(QuestionSignal.Correct), [theBoard.show(doctor)]);
    return column([
      w.title(t("Practice", "अभ्यास")),
      w.body(
        t(
          r`Two steps every time: change the focal length to **metres**, then take the reciprocal with its sign. $$P = \frac{1}{f}, \qquad f = \frac{1}{P}$$`,
          r`हर बार दो क़दम: फोकस दूरी को **मीटर** में बदलो, फिर चिह्न सहित व्युत्क्रम लो। $$P = \frac{1}{f}, \qquad f = \frac{1}{P}$$`,
        ),
      ),
      concave,
      doctor,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** NCERT in-text Q2 of 10.3.8: a needle and its same-size image at 50 cm. */
const needle = page(
  "needle",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "A convex lens makes a real, inverted image of a needle 50 cm from the lens, the same size as the needle. Where is the needle, and what is the lens's power?",
        "एक उत्तल लेंस सुई का वास्तविक, उल्टा प्रतिबिंब लेंस से 50 सेमी पर बनाता है, सुई के बराबर आकार का। सुई कहाँ है, और लेंस की क्षमता क्या है?",
      ),
      options: [
        { id: "right", label: t("50 cm in front; +4 D", "50 सेमी सामने; +4 D") },
        {
          id: "two",
          label: t("50 cm in front; +2 D", "50 सेमी सामने; +2 D"),
          feedback: t(
            "Same size means the needle is at 2F₁ and the image at 2F₂. So 50 cm is 2f, and f = 25 cm = 0.25 m.",
            "बराबर आकार का अर्थ है सुई 2F₁ पर है और प्रतिबिंब 2F₂ पर। इसलिए 50 सेमी, 2f है, और f = 25 सेमी = 0.25 मीटर।",
          ),
        },
        {
          id: "twentyfive",
          label: t("25 cm in front; +4 D", "25 सेमी सामने; +4 D"),
          feedback: t(
            "Same size means object and image are both at 2F, each 50 cm from the lens.",
            "बराबर आकार का अर्थ है वस्तु और प्रतिबिंब दोनों 2F पर, हर एक लेंस से 50 सेमी पर।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ Power is how strongly a lens bends light: $P = \\frac{1}{f}$, in dioptres. ✓ The +10 D magnifying glass is strong enough to fit the box. ✓ The phone's position, the lens, the box: all worked out. Only one thing left. Wait for dark.",
        "**मिशन लॉग।** ✓ क्षमता बताती है कि लेंस प्रकाश को कितनी तेज़ी से मोड़ता है: $P = \\frac{1}{f}$, डायोप्टर में। ✓ +10 D का आवर्धक काँच इतना ताक़तवर है कि डिब्बे में आ जाए। ✓ फ़ोन की जगह, लेंस, डिब्बा: सब तय। बस एक काम बाक़ी है। अँधेरे का इंतज़ार।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(ask.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), ask, log, space()]);
  },
  { passOn: PassOn.Rules },
);

/** Saturday, 8 pm: movie night. Mission complete, and a look ahead to the eye. */
const finale = page("finale", (b) => {
  const w = wordsOn(b);
  const night = b.prop(lightSceneDef, "night", {
    scene: SceneKind.MovieNight,
    isLit: true,
    canToggle: false,
  });
  b.standsFor(
    night,
    "movie night: the family on the sofa, the shoebox projector on a stool, and the movie big and bright on the wall",
  );
  return column([
    w.title(t("Movie night", "मूवी नाइट")),
    w.body(
      t(
        "Saturday, 8 pm. The power's out again, of course, but this time nobody minds. Mom brings popcorn. Grandpa gets the comfy end of the sofa (he has been promised the magnifying glass back by Sunday). The phone goes into the box, upside down, 10.5 cm from the lens. Kabir switches it on, and there on the wall is the end of the movie: big, sharp and the right way up.",
        "शनिवार, रात 8 बजे। बिजली फिर चली गई, ज़ाहिर है, पर इस बार किसी को फ़र्क़ नहीं पड़ता। माँ पॉपकॉर्न लाती हैं। दादाजी को सोफ़े का आरामदायक कोना मिलता है (आवर्धक काँच रविवार तक लौटाने का वादा है)। फ़ोन डिब्बे में जाता है, उल्टा, लेंस से 10.5 सेमी पर। कबीर उसे चालू करता है, और दीवार पर फ़िल्म का अंत है: बड़ा, साफ़ और सीधा।",
      ),
    ),
    night,
    w.definition(
      t(
        "**Mission complete: all five stops.** (1) We see things by the light they reflect, light travels in straight lines, and it bounces with $i = r$; a flat mirror only gives a virtual copy. (2) A curved mirror that brings light together can put a real picture on a screen. (3) Light bends when it goes from one medium into another. (4) A convex lens uses that bending to bring light together on the far side: the lens formula told Riya where the phone goes, and the power told her which lens fits the box. (5) The projector, built: a shoebox, a phone and Grandpa's magnifying glass.",
        "**मिशन पूरा: पाँचों पड़ाव।** (1) हम चीज़ों को उनके परावर्तित प्रकाश से देखते हैं, प्रकाश सीधी रेखाओं में चलता है, और $i = r$ के साथ उछलता है; सपाट दर्पण केवल आभासी नक़ल देता है। (2) प्रकाश इकट्ठा करने वाला मुड़ा दर्पण पर्दे पर वास्तविक तस्वीर डाल सकता है। (3) एक माध्यम से दूसरे में जाते समय प्रकाश मुड़ता है। (4) उत्तल लेंस उसी मुड़ने से प्रकाश को दूसरी ओर इकट्ठा करता है: लेंस सूत्र ने रिया को बताया कि फ़ोन कहाँ जाए, और क्षमता ने बताया कि कौन-सा लेंस डिब्बे में आएगा। (5) प्रोजेक्टर, तैयार: एक जूते का डिब्बा, एक फ़ोन और दादाजी का आवर्धक काँच।",
      ),
    ),
    w.note(
      t(
        "One more thing. As the last twenty minutes play, Riya realises that the inside of her own eye works just like the shoebox: a convex lens at the front, and a real, upside-down picture on the back. That's the next chapter.",
        "एक और बात। जब आख़िरी बीस मिनट चल रहे होते हैं, रिया को एहसास होता है कि उसकी अपनी आँख का अंदर का हिस्सा ठीक जूते के डिब्बे जैसा काम करता है: आगे एक उत्तल लेंस, और पीछे एक वास्तविक, उल्टी तस्वीर। यही अगला अध्याय है।",
      ),
    ),
    space(),
  ]);
});

/** The pages, in reading order: hook, learn, see it in life, practice, finale. */
export const overview = [hook, power, examples, contact, grandpa, practice, needle, finale];

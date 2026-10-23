import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  ControlScene,
  HormoneAction,
  PlantAction,
  PlantHormone,
  PlantKind,
  Side,
  controlSceneDef,
  plantHormonesDef,
  plantMovementDef,
} from "@chalk/prop-control";

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** How does a shoot "know" where the light is? */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const beans = b.prop(controlSceneDef, "beans", { scene: ControlScene.BeanBox });
  b.standsFor(beans, "the shoebox with a window, the bean shoots leaning towards it");
  return column([
    w.title(t("A message without nerves", "तंत्रिकाओं के बिना संदेश")),
    beans,
    w.body(
      t(
        "**Stop 5.** Last time: plants move without nerves or muscles, either fast with no growth (the touch-me-not) or slowly by growing in a direction (tropisms).",
        "**पड़ाव 5।** पिछली बार: पौधे बिना तंत्रिकाओं या पेशियों के गति करते हैं, या तो बिना वृद्धि के तेज़ी से (छुई-मुई) या किसी दिशा में बढ़कर धीरे-धीरे (अनुवर्तन)।",
      ),
    ),
    w.body(
      t(
        "Grandpa's question is still on Riya's mind: the shoot bends at its middle, but light is detected at its tip. Something has to carry the message down, and plants have no neurons. Kabir guesses: \"Maybe the message just... spreads?\" This lesson finds out how plants, and many other living things, send messages by chemicals.",
        'दादाजी का सवाल अब भी रिया के मन में है: प्ररोह बीच से मुड़ता है, पर रोशनी उसके सिरे पर पहचानी जाती है। किसी चीज़ को संदेश नीचे ले जाना पड़ता है, और पौधों में तंत्रिका कोशिकाएँ नहीं होतीं। कबीर अंदाज़ा लगाता है: "शायद संदेश बस... फैल जाता है?" यह पाठ पता लगाता है कि पौधे, और दूसरे बहुत से जीव, रसायनों से संदेश कैसे भेजते हैं।',
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Why chemical messages: the limits of electrical impulses. */
const whyChemical = page(
  "why-chemical",
  (b) => {
    const w = wordsOn(b);
    const limit = choiceQuestion(b, {
      name: "limit",
      prompt: t("Which is a limitation of electrical impulses?", "विद्युत आवेगों की एक सीमा कौन सी है?"),
      options: [
        {
          id: "right",
          label: t(
            "They reach only cells connected by nervous tissue",
            "वे केवल उन कोशिकाओं तक पहुँचते हैं जो तंत्रिका ऊतक से जुड़ी हों",
          ),
        },
        {
          id: "slow",
          label: t("They are too slow", "वे बहुत धीमे हैं"),
          feedback: t(
            "Speed is their strength. Their limits are reach (only connected cells) and the reset time between impulses.",
            "तेज़ी उनकी ताक़त है। उनकी सीमाएँ पहुँच (केवल जुड़ी कोशिकाएँ) और आवेगों के बीच फिर से तैयार होने का समय हैं।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Why send chemicals?", "रसायन क्यों भेजें?")),
      w.body(
        t(
          "Electrical impulses are excellent for **fast** responses. But they have two limits. First, they reach **only** the cells connected by nervous tissue, not every cell in the body. Second, once a cell has made and sent an impulse, it needs time to **reset** before it can send another: cells can't keep making impulses all the time.",
          "**तेज़** अनुक्रिया के लिए विद्युत आवेग बेहतरीन हैं। पर उनकी दो सीमाएँ हैं। पहली, वे **केवल** तंत्रिका ऊतक से जुड़ी कोशिकाओं तक पहुँचते हैं, शरीर की हर कोशिका तक नहीं। दूसरी, कोई कोशिका एक आवेग बनाकर भेजने के बाद, दूसरा भेजने से पहले **फिर से तैयार** होने में समय लेती है: कोशिकाएँ लगातार आवेग नहीं बना सकतीं।",
        ),
      ),
      w.body(
        t(
          "So most many-celled living things also use **chemical communication**. A stimulated cell releases a chemical compound, which **diffuses** (spreads out) all around it. Other cells that have special molecules on their surface to detect it get the message, and can pass it on. This is **slower**, but it can reach **every** cell, nerves or not, and it can be done **steadily** for a long time.",
          "इसलिए ज़्यादातर बहुकोशिकीय जीव **रासायनिक संचार** भी इस्तेमाल करते हैं। उद्दीप्त कोशिका एक रासायनिक यौगिक छोड़ती है, जो उसके चारों ओर **विसरित** होता है (फैल जाता है)। जिन दूसरी कोशिकाओं की सतह पर उसे पहचानने के ख़ास अणु होते हैं, उन्हें संदेश मिल जाता है, और वे उसे आगे भेज सकती हैं। यह **धीमा** है, पर यह **हर** कोशिका तक पहुँच सकता है, तंत्रिका हो या न हो, और लंबे समय तक **लगातार** किया जा सकता है।",
        ),
      ),
      limit,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Plant hormones defined. */
const hormones = page(
  "hormones",
  (b) => {
    const w = wordsOn(b);
    const plant = b.prop(plantHormonesDef, "plant", {
      selected: null,
      showEffects: false,
      canPick: true,
    });
    b.standsFor(
      plant,
      "a plant with its shoot tip, stem, fruit and a wilting leaf; tapping a hormone shows where it acts and what it does",
    );
    const what = choiceQuestion(b, {
      name: "what",
      prompt: t("What are plant hormones?", "पादप हॉर्मोन क्या हैं?"),
      options: [
        {
          id: "right",
          label: t(
            "Chemicals made in one place that diffuse to another, where they coordinate growth, development and responses",
            "एक जगह बने रसायन जो दूसरी जगह विसरित होकर वृद्धि, विकास और अनुक्रियाओं का समन्वय करते हैं",
          ),
        },
        {
          id: "food",
          label: t("Food the plant makes in its leaves", "पत्तियों में पौधे का बनाया भोजन"),
          feedback: t(
            "They're messengers, not food: chemicals that carry information around the plant.",
            "वे संदेशवाहक हैं, भोजन नहीं: रसायन जो पौधे में सूचना ले जाते हैं।",
          ),
        },
      ],
      answer: "right",
    });
    b.witness(plant.learner(HormoneAction.Pick, { hormone: PlantHormone.Auxin }));
    return column([
      w.title(t("Plant hormones", "पादप हॉर्मोन")),
      w.definition(
        t(
          "**Hormone.** A chemical compound that a living thing uses to carry information for control and coordination is a **hormone**. **Plant hormones** help coordinate growth, development and responses to the surroundings. They are **made at places away from where they act**, and simply **diffuse** to the area of action.",
          "**हॉर्मोन।** वह रासायनिक यौगिक जिसे जीव नियंत्रण और समन्वय के लिए सूचना ले जाने में इस्तेमाल करता है, **हॉर्मोन** है। **पादप हॉर्मोन** वृद्धि, विकास और परिवेश पर अनुक्रियाओं का समन्वय करने में मदद करते हैं। वे **उस जगह से दूर बनते हैं जहाँ काम करते हैं**, और बस काम की जगह तक **विसरित** हो जाते हैं।",
        ),
      ),
      w.body(
        t(
          "Tap a hormone to see where it works. The next pages take them one by one.",
          "किसी हॉर्मोन को टैप करो और देखो वह कहाँ काम करता है। अगले पन्ने इन्हें एक-एक करके लेते हैं।",
        ),
      ),
      plant,
      what,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Auxin explains phototropism. */
const auxin = page(
  "auxin",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "NCERT: auxin, made at the shoot tip, helps cells grow longer. With light from one side, auxin diffuses to the shady side, the cells there grow longer, and the shoot bends towards the light. The learner grows the seedling with the auxin overlay on and moves the light.",
    );
    const box = b.prop(plantMovementDef, "box", {
      kind: PlantKind.Phototropism,
      side: Side.Right,
      days: 0,
      showAuxin: true,
      showNames: true,
      canTouch: false,
      canGrow: true,
      canSetSide: true,
      canTurn: false,
    });
    b.standsFor(
      box,
      "the bean seedling in its box with the auxin shown at the shoot tip, collecting on the side away from the light",
    );
    const side = choiceQuestion(b, {
      name: "side",
      prompt: t(
        "Light comes from the right. On which side of the shoot do the cells grow longer?",
        "रोशनी दाईं ओर से आती है। प्ररोह के किस ओर की कोशिकाएँ ज़्यादा लंबी होती हैं?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "The left side, the shady side, where auxin collects",
            "बाईं ओर, छाया वाली, जहाँ ऑक्सिन जमा होता है",
          ),
        },
        {
          id: "lit",
          label: t("The right side, facing the light", "दाईं ओर, रोशनी की तरफ़"),
          feedback: t(
            "If the lit side grew longer, the shoot would bend away from the light. Auxin goes to the shady side, which grows longer, so the shoot bends towards the light.",
            "अगर रोशनी वाली ओर लंबी होती, तो प्ररोह रोशनी से दूर मुड़ता। ऑक्सिन छाया वाली ओर जाता है, जो लंबी होती है, इसलिए प्ररोह रोशनी की ओर मुड़ता है।",
          ),
        },
      ],
      answer: "right",
    });
    b.witness(box.learner(PlantAction.Grow), box.learner(PlantAction.Grow));
    return column([
      w.title(t("Auxin bends the shoot", "ऑक्सिन प्ररोह को मोड़ता है")),
      w.definition(
        t(
          "**Auxin** is a hormone made at the **shoot tip**. It helps cells **grow longer**. When light comes from one side, auxin **diffuses towards the shady side** of the shoot. More auxin there makes the cells on the side away from the light grow longer, so the shoot **bends towards the light**.",
          "**ऑक्सिन** एक हॉर्मोन है जो **प्ररोह के सिरे** पर बनता है। यह कोशिकाओं को **लंबा बढ़ने** में मदद करता है। जब रोशनी एक ओर से आती है, तो ऑक्सिन प्ररोह की **छाया वाली ओर विसरित** हो जाता है। वहाँ ज़्यादा ऑक्सिन होने से रोशनी से दूर वाली ओर की कोशिकाएँ लंबी होती हैं, इसलिए प्ररोह **रोशनी की ओर मुड़ता** है।",
        ),
      ),
      w.body(
        t(
          "This is the explanation of the bean box. Grow the seedling, then move the light and watch where the auxin goes.",
          "यही सेम के डिब्बे की व्याख्या है। अंकुर को बढ़ाओ, फिर रोशनी हटाओ और देखो ऑक्सिन कहाँ जाता है।",
        ),
      ),
      box,
      side,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Gibberellins, cytokinins, abscisic acid. */
const others = page(
  "others",
  (b) => {
    const w = wordsOn(b);
    const plant = b.prop(plantHormonesDef, "plant", {
      selected: PlantHormone.AbscisicAcid,
      showEffects: true,
      canPick: true,
    });
    b.standsFor(
      plant,
      "the plant with abscisic acid picked at the wilting leaf; each hormone can be tapped, with arrows for promoting or inhibiting growth",
    );
    const stop = choiceQuestion(b, {
      name: "stop",
      prompt: t("Which of these hormones inhibits growth?", "इनमें से कौन सा हॉर्मोन वृद्धि रोकता है?"),
      options: [
        { id: "right", label: t("Abscisic acid", "एब्सिसिक अम्ल") },
        {
          id: "cyto",
          label: t("Cytokinin", "साइटोकाइनिन"),
          feedback: t(
            "Cytokinins promote cell division. The one that stops growth is abscisic acid.",
            "साइटोकाइनिन कोशिका विभाजन को बढ़ावा देते हैं। वृद्धि रोकने वाला एब्सिसिक अम्ल है।",
          ),
        },
        {
          id: "gib",
          label: t("Gibberellin", "जिबरेलिन"),
          feedback: t(
            "Gibberellins help the stem grow. The one that stops growth is abscisic acid.",
            "जिबरेलिन तने को बढ़ने में मदद करते हैं। वृद्धि रोकने वाला एब्सिसिक अम्ल है।",
          ),
        },
      ],
      answer: "right",
    });
    b.witness(plant.learner(HormoneAction.Pick, { hormone: PlantHormone.Cytokinin }));
    return column([
      w.title(t("Go and stop", "बढ़ो और रुको")),
      w.definition(
        t(
          "**More plant hormones.** **Gibberellins**, like auxins, help the **stem grow**. **Cytokinins** promote **cell division**, so they are found in greater amounts where cells divide fast, such as in **fruits and seeds**. These promote growth. But plants also need signals to **stop** growing: **abscisic acid** is a hormone that **inhibits growth**, and its effects include the **wilting** of leaves.",
          "**कुछ और पादप हॉर्मोन।** **जिबरेलिन**, ऑक्सिन की तरह, **तने की वृद्धि** में मदद करते हैं। **साइटोकाइनिन** **कोशिका विभाजन** को बढ़ावा देते हैं, इसलिए वे वहाँ ज़्यादा होते हैं जहाँ कोशिकाएँ तेज़ी से बँटती हैं, जैसे **फलों और बीजों** में। ये वृद्धि को बढ़ावा देते हैं। पर पौधों को बढ़ना **रोकने** के संकेत भी चाहिए: **एब्सिसिक अम्ल** एक हॉर्मोन है जो **वृद्धि रोकता** है, और इसके प्रभावों में पत्तियों का **मुरझाना** शामिल है।",
        ),
      ),
      plant,
      stop,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** Grandpa's question answered; and the tendril. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const tendril = choiceQuestion(b, {
      name: "tendril",
      prompt: t(
        "Riya adds the pea tendril to the auxin label. How can auxin help a tendril wind round a support?",
        "रिया ऑक्सिन वाले लेबल में मटर का प्रतान भी जोड़ती है। ऑक्सिन प्रतान को सहारे के चारों ओर लिपटने में कैसे मदद कर सकता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Auxin makes cells away from the support grow longer, so it curls round",
            "ऑक्सिन सहारे से दूर की कोशिकाओं को ज़्यादा लंबा करता है, इसलिए प्रतान लिपट जाता है",
          ),
        },
        {
          id: "shrink",
          label: t(
            "Auxin makes the side touching the support shrink, so it curls",
            "ऑक्सिन सहारे को छूने वाली ओर को सिकोड़ देता है, इसलिए प्रतान लिपटता है",
          ),
          feedback: t(
            "It's growth, not shrinking: the outer side grows faster than the side in contact.",
            "यह वृद्धि है, सिकुड़ना नहीं: बाहर की ओर संपर्क वाली ओर से तेज़ बढ़ती है।",
          ),
        },
        {
          id: "touch",
          label: t(
            "Auxin collects on the side touching the support, which grows faster",
            "ऑक्सिन सहारे को छूने वाली ओर जमा होता है, जो तेज़ बढ़ती है",
          ),
          feedback: t(
            "It's the other side: auxin collects on the side away from the support, just as it collects on the shady side of a shoot.",
            "उल्टी ओर: ऑक्सिन सहारे से दूर वाली ओर जमा होता है, जैसे प्ररोह की छाया वाली ओर जमा होता है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const stop = w.definition(
      t(
        '**Stop 5 done.** The bean box gets a new label: *"The tip makes auxin. Auxin slips to the shady side. The shady side grows longer, so the shoot bends to the light."* Riya realises the same trick, messages by chemicals, must work in animals too. That evening Grandpa takes his insulin injection, and she asks him what it is. Last stop: hormones in animals.',
        '**पड़ाव 5 पूरा।** सेम के डिब्बे पर नया लेबल लगता है: *"सिरा ऑक्सिन बनाता है। ऑक्सिन छाया वाली ओर खिसकता है। छाया वाली ओर लंबी होती है, इसलिए प्ररोह रोशनी की ओर मुड़ता है।"* रिया समझ जाती है कि यही तरकीब, रसायनों से संदेश, जंतुओं में भी चलती होगी। उस शाम दादाजी अपना इंसुलिन का इंजेक्शन लेते हैं, और वह उनसे पूछती है कि यह क्या है। आख़िरी पड़ाव: जंतुओं में हॉर्मोन।',
      ),
      "stop",
      { isHidden: true },
    );
    b.when(tendril.on(QuestionSignal.Correct), [theBoard.show(stop), theBoard.pass()]);
    return column([
      w.title(t("Grandpa's question", "दादाजी का सवाल")),
      w.body(
        t(
          '"How does the shoot *know* which side the light is on?" Now Riya can answer: the tip detects the light, and **auxin** carries the message down the shoot, not along nerves but by diffusing to the shady side. In a tendril, auxin collects on the side away from the support, just as it collects on the shady side of a shoot.',
          '"प्ररोह को कैसे *पता* चलता है कि रोशनी किस ओर है?" अब रिया जवाब दे सकती है: सिरा रोशनी पहचानता है, और **ऑक्सिन** संदेश को प्ररोह में नीचे ले जाता है, तंत्रिकाओं पर नहीं बल्कि छाया वाली ओर विसरित होकर। प्रतान में ऑक्सिन सहारे से दूर वाली ओर जमा होता है, जैसे प्ररोह की छाया वाली ओर जमा होता है।',
        ),
      ),
      tendril,
      stop,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** NCERT Exercise 1, in-text Q3, Exercise 8; then the log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const which = choiceQuestion(b, {
      name: "which",
      prompt: t("Which of the following is a plant hormone?", "इनमें से कौन सा पादप हॉर्मोन है?"),
      options: [
        { id: "right", label: t("Cytokinin", "साइटोकाइनिन") },
        {
          id: "insulin",
          label: t("Insulin", "इंसुलिन"),
          feedback: t(
            "Insulin is an animal hormone, made by the pancreas.",
            "इंसुलिन जंतु हॉर्मोन है, जो अग्न्याशय बनाता है।",
          ),
        },
        {
          id: "thyroxin",
          label: t("Thyroxin", "थायरॉक्सिन"),
          feedback: t(
            "Thyroxin is an animal hormone, made by the thyroid gland.",
            "थायरॉक्सिन जंतु हॉर्मोन है, जो थायरॉइड ग्रंथि बनाती है।",
          ),
        },
        {
          id: "oestrogen",
          label: t("Oestrogen", "एस्ट्रोजन"),
          feedback: t(
            "Oestrogen is an animal hormone, made by the ovaries.",
            "एस्ट्रोजन जंतु हॉर्मोन है, जो अंडाशय बनाते हैं।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const promote = choiceQuestion(b, {
      name: "promote",
      prompt: t(
        "Give an example of a plant hormone that promotes growth.",
        "वृद्धि को बढ़ावा देने वाले एक पादप हॉर्मोन का उदाहरण दो।",
      ),
      options: [
        { id: "right", label: t("Auxin", "ऑक्सिन") },
        {
          id: "aba",
          label: t("Abscisic acid", "एब्सिसिक अम्ल"),
          feedback: t(
            "Abscisic acid inhibits growth. Auxin, gibberellins and cytokinins promote it.",
            "एब्सिसिक अम्ल वृद्धि रोकता है। ऑक्सिन, जिबरेलिन और साइटोकाइनिन उसे बढ़ावा देते हैं।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const how = choiceQuestion(b, {
      name: "how",
      prompt: t(
        "How does chemical coordination occur in plants?",
        "पौधों में रासायनिक समन्वय कैसे होता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Hormones made in one part diffuse to another, where they promote or inhibit growth",
            "एक हिस्से में बने हॉर्मोन दूसरे हिस्से तक विसरित होकर वहाँ वृद्धि को बढ़ावा देते या रोकते हैं",
          ),
        },
        {
          id: "nerves",
          label: t("Through a simple nervous system", "एक सरल तंत्रिका तंत्र से"),
          feedback: t(
            "Plants have no nervous system. They coordinate with hormones that diffuse from cell to cell.",
            "पौधों में तंत्रिका तंत्र नहीं होता। वे कोशिका से कोशिका तक विसरित होने वाले हॉर्मोनों से समन्वय करते हैं।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ Electrical impulses are fast, but reach only connected cells and need reset time. ✓ **Chemical** messages are slower but reach every cell, steadily. ✓ **Plant hormones** are made in one place and diffuse to where they act. ✓ **Auxin** (shoot tip) makes cells grow longer: it collects on the shady side, so shoots bend to light. ✓ **Gibberellins** (stem growth) and **cytokinins** (cell division, fruits and seeds) promote growth; **abscisic acid** inhibits it (wilting). Next: hormones in animals.",
        "**मिशन लॉग।** ✓ विद्युत आवेग तेज़ हैं, पर केवल जुड़ी कोशिकाओं तक पहुँचते हैं और तैयार होने में समय लेते हैं। ✓ **रासायनिक** संदेश धीमे हैं पर हर कोशिका तक लगातार पहुँचते हैं। ✓ **पादप हॉर्मोन** एक जगह बनकर वहाँ तक विसरित होते हैं जहाँ काम करते हैं। ✓ **ऑक्सिन** (प्ररोह का सिरा) कोशिकाओं को लंबा बनाता है: यह छाया वाली ओर जमा होता है, इसलिए प्ररोह रोशनी की ओर मुड़ते हैं। ✓ **जिबरेलिन** (तने की वृद्धि) और **साइटोकाइनिन** (कोशिका विभाजन, फल और बीज) वृद्धि बढ़ाते हैं; **एब्सिसिक अम्ल** उसे रोकता है (मुरझाना)। आगे: जंतुओं में हॉर्मोन।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(how.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), which, promote, how, log, space()]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [hook, whyChemical, hormones, auxin, others, inLife, yourTurn];

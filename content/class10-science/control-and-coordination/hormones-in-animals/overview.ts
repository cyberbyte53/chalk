import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  Body,
  ControlScene,
  EndocrineAction,
  Gland,
  ResponseAction,
  ResponseMode,
  controlSceneDef,
  endocrineMapDef,
  hormoneResponseDef,
} from "@chalk/prop-control";

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** Stage fright at the rehearsal. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const stage = b.prop(controlSceneDef, "stage", { scene: ControlScene.StageFright });
  b.standsFor(
    stage,
    "Riya alone on a dark stage under a spotlight, a microphone in front of her, rows of seats beyond",
  );
  return column([
    w.title(t("Pounding heart", "धड़कता दिल")),
    stage,
    w.body(
      t(
        "**Stop 6, the last.** Last time: plants send messages with **hormones**, chemicals that spread from where they are made to where they act.",
        "**पड़ाव 6, आख़िरी।** पिछली बार: पौधे **हॉर्मोनों** से संदेश भेजते हैं, ऐसे रसायन जो बनने की जगह से काम की जगह तक फैल जाते हैं।",
      ),
    ),
    w.body(
      t(
        "The day before the fair, Riya rehearses her talk on the school stage. The moment the spotlight comes on, her heart pounds, she breathes fast, her stomach goes funny and her hands feel ready to grab something. She didn't decide any of that, and it happened **everywhere** in her body at once. This lesson finds out what message can reach the whole body at once, and what Grandpa's insulin has to do with it.",
        "मेले से एक दिन पहले रिया स्कूल के मंच पर अपनी बात का अभ्यास करती है। जैसे ही स्पॉटलाइट जलती है, उसका दिल धड़कने लगता है, साँस तेज़ हो जाती है, पेट अजीब सा हो जाता है और हाथ कुछ पकड़ने को तैयार लगते हैं। इनमें से कुछ भी उसने तय नहीं किया, और यह उसके शरीर में **हर जगह** एक साथ हुआ। यह पाठ पता लगाता है कि कौन सा संदेश पूरे शरीर तक एक साथ पहुँच सकता है, और दादाजी के इंसुलिन का इससे क्या लेना-देना है।",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Adrenaline: fight or flight. */
const adrenaline = page(
  "adrenaline",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "NCERT 7.3: in a scary situation the adrenal glands secrete adrenaline into the blood; it reaches the whole body: the heart beats faster, blood to the digestive system and skin is reduced and diverted to the skeletal muscles, and breathing speeds up.",
    );
    const body = b.prop(hormoneResponseDef, "body", {
      mode: ResponseMode.Adrenaline,
      isScared: false,
      canAct: true,
      canSetPancreas: false,
    });
    b.standsFor(
      body,
      "a body with the adrenal glands marked and readings for heartbeat, breathing and blood to the muscles and to the stomach and skin; a scare button releases adrenaline",
    );
    const effect = choiceQuestion(b, {
      name: "effect",
      prompt: t(
        "Tap 'A scare!'. How does the body respond when adrenaline is secreted into the blood?",
        "'डर!' दबाओ। जब रुधिर में एड्रीनलिन स्रावित होता है, तो शरीर कैसे अनुक्रिया करता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "The heart beats faster, breathing speeds up, and blood is sent from the gut and skin to the muscles",
            "दिल तेज़ धड़कता है, साँस तेज़ होती है, और रुधिर आहार नाल और त्वचा से पेशियों की ओर भेजा जाता है",
          ),
        },
        {
          id: "slow",
          label: t(
            "The heart slows down so the body can rest",
            "दिल धीमा हो जाता है ताकि शरीर आराम कर सके",
          ),
          feedback: t(
            "Adrenaline prepares the body to fight or run: the heart speeds up to send more oxygen to the muscles.",
            "एड्रीनलिन शरीर को लड़ने या भागने के लिए तैयार करता है: पेशियों तक ज़्यादा ऑक्सीजन भेजने के लिए दिल तेज़ होता है।",
          ),
        },
      ],
      answer: "right",
    });
    b.witness(body.learner(ResponseAction.Scare));
    return column([
      w.title(t("Ready to fight or run", "लड़ने या भागने को तैयार")),
      w.body(
        t(
          "Think of a squirrel that suddenly sees a cat. It has to get ready to **fight** or to **run away**. Both use a great deal of energy, and many tissues have to work together. If the body used only nerve impulses, only the tissues wired to those nerves would get ready. A **chemical** message can reach **every** cell.",
          "सोचो एक गिलहरी अचानक बिल्ली देखती है। उसे **लड़ने** या **भागने** के लिए तैयार होना है। दोनों में बहुत ऊर्जा लगती है, और बहुत से ऊतकों को साथ काम करना पड़ता है। अगर शरीर केवल तंत्रिका आवेग इस्तेमाल करता, तो केवल उन तंत्रिकाओं से जुड़े ऊतक तैयार होते। **रासायनिक** संदेश **हर** कोशिका तक पहुँच सकता है।",
        ),
      ),
      w.definition(
        t(
          "**Adrenaline.** In many animals, including us, the **adrenal glands** secrete a hormone called **adrenaline** directly into the **blood**, which carries it all over the body. The **heart** beats faster, sending more oxygen to the muscles. Muscles around the small arteries of the **digestive system** and **skin** contract, so less blood goes there and more goes to the **skeletal muscles**. **Breathing** speeds up as the diaphragm and rib muscles contract faster.",
          "**एड्रीनलिन।** हमारे समेत बहुत से जंतुओं में **अधिवृक्क ग्रंथियाँ** **एड्रीनलिन** नाम का हॉर्मोन सीधे **रुधिर** में स्रावित करती हैं, जो उसे पूरे शरीर में ले जाता है। **हृदय** तेज़ धड़कता है, और पेशियों तक ज़्यादा ऑक्सीजन भेजता है। **पाचन तंत्र** और **त्वचा** की छोटी धमनियों के चारों ओर की पेशियाँ सिकुड़ती हैं, इसलिए वहाँ कम रुधिर जाता है और **कंकाल पेशियों** तक ज़्यादा। डायाफ़्राम और पसलियों की पेशियों के तेज़ सिकुड़ने से **साँस** तेज़ होती है।",
        ),
      ),
      body,
      effect,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The endocrine system. */
const glands = page(
  "glands",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "NCERT Fig. 7.7 and Activity 7.3: the endocrine glands in males and females. Tapping a gland names its hormone and job.",
    );
    const map = b.prop(endocrineMapDef, "map", {
      body: Body.Male,
      selected: null,
      showNames: true,
      canTap: true,
      canSetBody: true,
    });
    b.standsFor(
      map,
      "a body outline with the endocrine glands marked, from the hypothalamus and pituitary in the head down to the testes or ovaries; tap a gland to read its hormone",
    );
    const where = choiceQuestion(b, {
      name: "where",
      prompt: t(
        "How does a hormone like adrenaline reach its target organs?",
        "एड्रीनलिन जैसा हॉर्मोन अपने लक्ष्य अंगों तक कैसे पहुँचता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "It is secreted into the blood and carried around",
            "वह रुधिर में स्रावित होकर पूरे शरीर में ले जाया जाता है",
          ),
        },
        {
          id: "nerve",
          label: t("Along nerves, as an impulse", "तंत्रिकाओं पर, आवेग के रूप में"),
          feedback: t(
            "That's the nervous system's way. Endocrine glands put their hormones straight into the blood.",
            "वह तंत्रिका तंत्र का तरीक़ा है। अंतःस्रावी ग्रंथियाँ अपने हॉर्मोन सीधे रुधिर में डालती हैं।",
          ),
        },
      ],
      answer: "right",
    });
    b.witness(map.learner(EndocrineAction.Tap, { gland: Gland.Adrenal }));
    return column([
      w.title(t("The endocrine system", "अंतःस्रावी तंत्र")),
      w.definition(
        t(
          "**Endocrine glands.** Glands that make hormones and release them **directly into the blood** are **endocrine glands**. Together they form the **endocrine system**: a **second way** of control and coordination in our body, alongside the nervous system. The organs or tissues a hormone acts on are its **targets**.",
          "**अंतःस्रावी ग्रंथियाँ।** जो ग्रंथियाँ हॉर्मोन बनाकर उन्हें **सीधे रुधिर में** छोड़ती हैं, वे **अंतःस्रावी ग्रंथियाँ** हैं। मिलकर वे **अंतःस्रावी तंत्र** बनाती हैं: तंत्रिका तंत्र के साथ, हमारे शरीर में नियंत्रण और समन्वय का **दूसरा तरीक़ा**। हॉर्मोन जिन अंगों या ऊतकों पर काम करता है, वे उसके **लक्ष्य** हैं।",
        ),
      ),
      w.body(
        t(
          "**Activity 7.3.** Find the glands on the body. Tap each to see its hormone; switch between the male and female body. The next pages take the ones NCERT describes.",
          "**क्रियाकलाप 7.3।** शरीर पर ग्रंथियाँ खोजो। हर एक को टैप करके उसका हॉर्मोन देखो; पुरुष और स्त्री शरीर के बीच बदलो। अगले पन्ने उन ग्रंथियों को लेते हैं जिनका वर्णन NCERT करती है।",
        ),
      ),
      map,
      where,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Thyroxin and iodine. */
const thyroid = page(
  "thyroid",
  (b) => {
    const w = wordsOn(b);
    const map = b.prop(endocrineMapDef, "map", {
      body: Body.Female,
      selected: Gland.Thyroid,
      showNames: true,
      canTap: true,
      canSetBody: true,
    });
    b.standsFor(
      map,
      "the body map with the thyroid gland in the neck picked, and its hormone, thyroxin",
    );
    const salt = b.prop(controlSceneDef, "salt", { scene: ControlScene.IodisedSalt });
    b.standsFor(
      salt,
      "Grandpa pointing at a packet marked IODISED SALT on the kitchen shelf, Riya beside him",
    );
    const iodised = choiceQuestion(b, {
      name: "iodised",
      prompt: t("Why is iodised salt advised?", "आयोडीन युक्त नमक की सलाह क्यों दी जाती है?"),
      options: [
        {
          id: "right",
          label: t(
            "Iodine is needed for the thyroid to make thyroxin; without it we may get goitre",
            "थायरॉइड को थायरॉक्सिन बनाने के लिए आयोडीन चाहिए; इसके बिना घेंघा हो सकता है",
          ),
        },
        {
          id: "taste",
          label: t("It makes food taste saltier", "इससे खाना ज़्यादा नमकीन लगता है"),
          feedback: t(
            "It isn't about taste. Iodine is the raw material for the hormone thyroxin.",
            "बात स्वाद की नहीं है। आयोडीन थायरॉक्सिन हॉर्मोन का कच्चा माल है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Thyroxin and iodine", "थायरॉक्सिन और आयोडीन")),
      w.definition(
        t(
          "**Thyroxin.** The **thyroid gland** in the neck makes the hormone **thyroxin**. Thyroxin regulates the use of carbohydrates, proteins and fats in the body (their **metabolism**) to give the best balance for growth. **Iodine** is essential for making thyroxin. If our food lacks iodine, we might suffer from **goitre**, in which one symptom is a **swollen neck**.",
          "**थायरॉक्सिन।** गर्दन में स्थित **थायरॉइड ग्रंथि** **थायरॉक्सिन** हॉर्मोन बनाती है। थायरॉक्सिन शरीर में कार्बोहाइड्रेट, प्रोटीन और वसा के उपयोग (उनके **उपापचय**) को नियमित करता है ताकि वृद्धि के लिए सबसे अच्छा संतुलन बने। थायरॉक्सिन बनाने के लिए **आयोडीन** ज़रूरी है। अगर हमारे भोजन में आयोडीन की कमी हो, तो **घेंघा** हो सकता है, जिसका एक लक्षण **सूजी हुई गर्दन** है।",
        ),
      ),
      map,
      w.body(
        t(
          "Look at where the thyroid sits in the neck: that's why goitre shows as a swollen neck. And that's why salt packets say **\"iodised\"**.",
          'देखो थायरॉइड गर्दन में कहाँ है: इसीलिए घेंघा सूजी हुई गर्दन के रूप में दिखता है। और इसीलिए नमक के पैकेटों पर **"आयोडीन युक्त"** लिखा होता है।',
        ),
      ),
      salt,
      iodised,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Growth hormone, releasing hormones, puberty. */
const growth = page(
  "growth",
  (b) => {
    const w = wordsOn(b);
    const map = b.prop(endocrineMapDef, "map", {
      body: Body.Male,
      selected: Gland.Pituitary,
      showNames: true,
      canTap: true,
      canSetBody: true,
    });
    b.standsFor(
      map,
      "the body map with the pituitary gland under the brain picked; the hypothalamus is just above it",
    );
    const dwarf = choiceQuestion(b, {
      name: "dwarf",
      prompt: t(
        "A deficiency of which hormone in childhood leads to dwarfism?",
        "बचपन में किस हॉर्मोन की कमी से बौनापन होता है?",
      ),
      options: [
        { id: "right", label: t("Growth hormone, from the pituitary", "वृद्धि हॉर्मोन, पीयूष ग्रंथि से") },
        {
          id: "thyroxin",
          label: t("Thyroxin, from the thyroid", "थायरॉक्सिन, अवटु ग्रंथि से"),
          feedback: t(
            "Thyroxin balances metabolism. Height is regulated by growth hormone from the pituitary.",
            "थायरॉक्सिन उपापचय संतुलित करता है। लंबाई पीयूष ग्रंथि का वृद्धि हॉर्मोन नियमित करता है।",
          ),
        },
        {
          id: "adrenaline",
          label: t("Adrenaline, from the adrenals", "एड्रीनलीन, अधिवृक्क से"),
          feedback: t(
            "Adrenaline prepares the body for an emergency. Growth is regulated by growth hormone.",
            "एड्रीनलिन शरीर को आपात स्थिति के लिए तैयार करता है। वृद्धि को वृद्धि हॉर्मोन नियमित करता है।",
          ),
        },
      ],
      answer: "right",
    });
    b.witness(map.learner(EndocrineAction.Tap, { gland: Gland.Hypothalamus }));
    return column([
      w.title(t("Hormones and growth", "हॉर्मोन और वृद्धि")),
      w.body(
        t(
          "Animals don't grow towards light, but their growth is carefully controlled too: we don't grow fingers on our faces. Hormones help keep the body's design during growth.",
          "जंतु रोशनी की ओर नहीं बढ़ते, पर उनकी वृद्धि भी सावधानी से नियंत्रित होती है: हमारे चेहरे पर उँगलियाँ नहीं उगतीं। वृद्धि के दौरान शरीर की बनावट बनाए रखने में हॉर्मोन मदद करते हैं।",
        ),
      ),
      w.definition(
        t(
          "**Growth hormone** is made by the **pituitary gland**. It regulates the growth and development of the body. If there is too little of it in childhood, it leads to **dwarfism**. The **hypothalamus**, just above the pituitary, releases **releasing hormones** that make the pituitary release its hormones: for example, when growth hormone is low, it releases growth hormone releasing factor.",
          "**वृद्धि हॉर्मोन** **पीयूष ग्रंथि** बनाती है। यह शरीर की वृद्धि और विकास को नियमित करता है। बचपन में इसकी कमी हो तो **बौनापन** होता है। पीयूष ग्रंथि के ठीक ऊपर का **हाइपोथैलेमस** **मोचक हॉर्मोन** छोड़ता है, जो पीयूष ग्रंथि से उसके हॉर्मोन छुड़वाते हैं: जैसे, जब वृद्धि हॉर्मोन कम हो, तो वह वृद्धि हॉर्मोन मोचक कारक छोड़ता है।",
        ),
      ),
      map,
      dwarf,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Puberty: testosterone and oestrogen. */
const puberty = page(
  "puberty",
  (b) => {
    const w = wordsOn(b);
    const girls = choiceQuestion(b, {
      name: "girls",
      prompt: t(
        "Which hormone brings the changes of puberty in girls?",
        "लड़कियों में यौवनारंभ के बदलाव कौन सा हॉर्मोन लाता है?",
      ),
      options: [
        { id: "right", label: t("Oestrogen, from the ovaries", "एस्ट्रोजन, अंडाशय से") },
        {
          id: "testosterone",
          label: t("Testosterone, from the testes", "टेस्टोस्टेरॉन, वृषण से"),
          feedback: t(
            "Testosterone brings the changes of puberty in boys. In girls it is oestrogen, made by the ovaries.",
            "टेस्टोस्टेरॉन लड़कों में यौवनारंभ के बदलाव लाता है। लड़कियों में यह एस्ट्रोजन है, जो अंडाशय बनाते हैं।",
          ),
        },
        {
          id: "growth",
          label: t("Growth hormone, from the pituitary", "वृद्धि हॉर्मोन, पीयूष ग्रंथि से"),
          feedback: t(
            "Growth hormone regulates growth through childhood. The changes of puberty come from oestrogen in girls and testosterone in boys.",
            "वृद्धि हॉर्मोन बचपन भर वृद्धि को नियमित करता है। यौवनारंभ के बदलाव लड़कियों में एस्ट्रोजन और लड़कों में टेस्टोस्टेरॉन से आते हैं।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Puberty", "यौवनारंभ")),
      w.definition(
        t(
          "**Puberty.** Around 10 to 12 years of age, you and your friends began to change in appearance. These changes of **puberty** come from **testosterone** (made by the **testes**) in boys and **oestrogen** (made by the **ovaries**) in girls.",
          "**यौवनारंभ।** लगभग 10 से 12 साल की उम्र में तुम्हारे और तुम्हारे दोस्तों के रूप-रंग में बदलाव शुरू हुए। **यौवनारंभ** के ये बदलाव लड़कों में **टेस्टोस्टेरॉन** (**वृषण** बनाते हैं) और लड़कियों में **एस्ट्रोजन** (**अंडाशय** बनाते हैं) से होते हैं।",
        ),
      ),
      girls,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Insulin and feedback. */
const insulin = page(
  "insulin",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "NCERT: insulin from the pancreas regulates blood sugar. Feedback: when blood sugar rises, cells of the pancreas detect it and make more insulin; as the sugar falls, insulin secretion is reduced.",
    );
    const sugar = b.prop(hormoneResponseDef, "sugar", {
      mode: ResponseMode.BloodSugar,
      hasInsulin: true,
      canAct: true,
      canSetPancreas: false,
    });
    b.standsFor(
      sugar,
      "a graph of blood sugar over time with a normal band, and the pancreas with its insulin level; eat to raise the sugar, wait to let time pass",
    );
    const feedback = choiceQuestion(b, {
      name: "feedback",
      prompt: t(
        "Eat, then wait a few times. What does the pancreas do as the sugar comes back down?",
        "खाओ, फिर कुछ बार रुको। जब शर्करा वापस नीचे आती है, तो अग्न्याशय क्या करता है?",
      ),
      options: [
        { id: "right", label: t("It makes less insulin", "वह कम इंसुलिन बनाता है") },
        {
          id: "more",
          label: t("It keeps making more insulin", "वह और ज़्यादा इंसुलिन बनाता रहता है"),
          feedback: t(
            "Then the sugar would keep falling, too low. As the sugar falls, insulin is cut down: that's feedback.",
            "तब शर्करा गिरती ही जाती, बहुत नीचे। जैसे-जैसे शर्करा गिरती है, इंसुलिन घटाया जाता है: यही पुनर्भरण है।",
          ),
        },
      ],
      answer: "right",
    });
    b.witness(
      sugar.learner(ResponseAction.Eat),
      sugar.learner(ResponseAction.Wait),
      sugar.learner(ResponseAction.Wait),
      sugar.learner(ResponseAction.Wait),
    );
    return column([
      w.title(t("Insulin and feedback", "इंसुलिन और पुनर्भरण")),
      w.definition(
        t(
          "**Insulin** is a hormone made by the **pancreas**. It helps **regulate the level of sugar in the blood**. If it is not secreted in the right amounts, the blood sugar rises and causes many harmful effects: this is **diabetes**.",
          "**इंसुलिन** **अग्न्याशय** का बनाया हॉर्मोन है। यह **रुधिर में शर्करा का स्तर नियमित** करने में मदद करता है। अगर यह सही मात्रा में स्रावित न हो, तो रुधिर शर्करा बढ़ जाती है और बहुत से हानिकारक प्रभाव होते हैं: यह **मधुमेह** है।",
        ),
      ),
      w.definition(
        t(
          "**Feedback mechanism.** Hormones must be released in **precise** amounts at the right time. This is regulated by **feedback**: the result of a hormone controls how much more is made. If blood sugar **rises**, cells of the pancreas detect it and make **more** insulin. As blood sugar **falls**, insulin secretion is **reduced**.",
          "**पुनर्भरण क्रियाविधि।** हॉर्मोन **सटीक** मात्रा में, सही समय पर छोड़े जाने चाहिए। इसे **पुनर्भरण** नियमित करता है: हॉर्मोन का नतीजा तय करता है कि और कितना बने। रुधिर शर्करा **बढ़े**, तो अग्न्याशय की कोशिकाएँ इसे पहचानकर **ज़्यादा** इंसुलिन बनाती हैं। रुधिर शर्करा **गिरे**, तो इंसुलिन का स्राव **घटा** दिया जाता है।",
        ),
      ),
      sugar,
      feedback,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Diabetes: switch the insulin off. */
const diabetes = page(
  "diabetes",
  (b) => {
    const w = wordsOn(b);
    const sugar = b.prop(hormoneResponseDef, "sugar", {
      mode: ResponseMode.BloodSugar,
      hasInsulin: true,
      canAct: true,
      canSetPancreas: true,
    });
    b.standsFor(
      sugar,
      "the same blood sugar graph, now with a switch that stops the pancreas making insulin",
    );
    const inject = choiceQuestion(b, {
      name: "inject",
      prompt: t(
        "Switch off the pancreas's insulin, then eat and wait. Why are some diabetes patients given insulin injections?",
        "अग्न्याशय का इंसुलिन बंद करो, फिर खाओ और रुको। कुछ मधुमेह रोगियों को इंसुलिन के इंजेक्शन क्यों दिए जाते हैं?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Their pancreas doesn't make enough insulin, so their blood sugar stays high; injected insulin brings it down",
            "उनका अग्न्याशय काफ़ी इंसुलिन नहीं बनाता, इसलिए उनकी रुधिर शर्करा ऊँची रहती है; इंजेक्शन का इंसुलिन उसे नीचे लाता है",
          ),
        },
        {
          id: "sugar",
          label: t("To give them more sugar", "उन्हें ज़्यादा शर्करा देने के लिए"),
          feedback: t(
            "The opposite: their sugar is already too high. Insulin brings blood sugar down.",
            "उल्टा: उनकी शर्करा पहले ही बहुत ऊँची है। इंसुलिन रुधिर शर्करा को नीचे लाता है।",
          ),
        },
      ],
      answer: "right",
    });
    b.witness(
      sugar.learner(ResponseAction.SetPancreas, { hasInsulin: false }),
      sugar.learner(ResponseAction.Eat),
      sugar.learner(ResponseAction.Wait),
      sugar.learner(ResponseAction.Wait),
    );
    return column([
      w.title(t("When insulin is missing", "जब इंसुलिन न हो")),
      w.body(
        t(
          "Now see what happens when the pancreas can't make enough insulin. Nothing brings the sugar back down after a meal, and it stays high. Doctors advise people with diabetes to take less sugar, and some take **injections of insulin** to do the job the pancreas can't.",
          "अब देखो क्या होता है जब अग्न्याशय काफ़ी इंसुलिन नहीं बना पाता। खाने के बाद शर्करा को वापस नीचे लाने वाला कोई नहीं, और वह ऊँची ही रहती है। डॉक्टर मधुमेह वाले लोगों को कम शक्कर लेने की सलाह देते हैं, और कुछ लोग वह काम करने के लिए **इंसुलिन के इंजेक्शन** लेते हैं जो अग्न्याशय नहीं कर पाता।",
        ),
      ),
      sugar,
      inject,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Table 7.1 (Activity 7.4). */
const table = page(
  "table",
  (b) => {
    const w = wordsOn(b);
    const thyroxin = choiceQuestion(b, {
      name: "thyroxin",
      prompt: t(
        "Table 7.1, row 2: the thyroid gland, which regulates metabolism for body growth. Its hormone is…",
        "तालिका 7.1, पंक्ति 2: थायरॉइड ग्रंथि, जो शरीर की वृद्धि के लिए उपापचय नियमित करती है। इसका हॉर्मोन है…",
      ),
      options: [
        { id: "right", label: t("Thyroxin", "थायरॉक्सिन") },
        {
          id: "growth",
          label: t("Growth hormone", "वृद्धि हॉर्मोन"),
          feedback: t("Growth hormone comes from the pituitary.", "वृद्धि हॉर्मोन पीयूष ग्रंथि से आता है।"),
        },
      ],
      answer: "right",
    });
    const pancreas = choiceQuestion(b, {
      name: "pancreas",
      prompt: t(
        "Row 3: insulin regulates blood sugar. Which gland makes it?",
        "पंक्ति 3: इंसुलिन रुधिर शर्करा नियमित करता है। इसे कौन सी ग्रंथि बनाती है?",
      ),
      options: [
        { id: "right", label: t("Pancreas", "अग्न्याशय") },
        {
          id: "adrenal",
          label: t("Adrenal gland", "अधिवृक्क ग्रंथि"),
          feedback: t(
            "The adrenal glands make adrenaline. Insulin is from the pancreas.",
            "अधिवृक्क ग्रंथियाँ एड्रीनलिन बनाती हैं। इंसुलिन अग्न्याशय से है।",
          ),
        },
      ],
      answer: "right",
    });
    const testosterone = choiceQuestion(b, {
      name: "testosterone",
      prompt: t(
        "Row 4: testosterone, made by the testes. Its function is…",
        "पंक्ति 4: टेस्टोस्टेरॉन, जिसे वृषण बनाते हैं। इसका काम है…",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Development of male sex organs and the changes of puberty in boys",
            "नर लैंगिक अंगों का विकास और लड़कों में यौवनारंभ के बदलाव",
          ),
        },
        {
          id: "sugar",
          label: t("Regulating blood sugar", "रुधिर शर्करा नियमित करना"),
          feedback: t("That's insulin's job.", "यह इंसुलिन का काम है।"),
        },
      ],
      answer: "right",
    });
    const adrenalineRow = choiceQuestion(b, {
      name: "adrenalineRow",
      prompt: t(
        "Row 6: adrenaline, from the adrenal gland. Its function is…",
        "पंक्ति 6: एड्रीनलिन, अधिवृक्क ग्रंथि से। इसका काम है…",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Preparing the body for an emergency: faster heartbeat and breathing, more blood to the muscles",
            "शरीर को आपात स्थिति के लिए तैयार करना: तेज़ धड़कन और साँस, पेशियों तक ज़्यादा रुधिर",
          ),
        },
        {
          id: "growth",
          label: t("Stimulating growth in all organs", "सब अंगों में वृद्धि को उद्दीप्त करना"),
          feedback: t(
            "That's growth hormone, from the pituitary.",
            "यह वृद्धि हॉर्मोन है, पीयूष ग्रंथि से।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Completing Table 7.1", "तालिका 7.1 पूरी करना")),
      w.body(
        t(
          "**Activity 7.4.** Each hormone comes from one endocrine gland and has its own job. Fill in the missing parts of the table.",
          "**क्रियाकलाप 7.4।** हर हॉर्मोन किसी एक अंतःस्रावी ग्रंथि से आता है और उसका अपना काम होता है। तालिका के छूटे हिस्से भरो।",
        ),
      ),
      thyroxin,
      pancreas,
      testosterone,
      adrenalineRow,
      w.note(
        t(
          "The other rows: growth hormone (pituitary) stimulates growth in all organs; oestrogen (ovaries) develops female sex organs and regulates the menstrual cycle; releasing hormones (hypothalamus) make the pituitary release its hormones.",
          "बाकी पंक्तियाँ: वृद्धि हॉर्मोन (पीयूष ग्रंथि) सब अंगों में वृद्धि उद्दीप्त करता है; एस्ट्रोजन (अंडाशय) मादा लैंगिक अंगों का विकास करता है और ऋतुस्राव चक्र नियमित करता है; मोचक हॉर्मोन (हाइपोथैलेमस) पीयूष ग्रंथि से उसके हॉर्मोन छुड़वाते हैं।",
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Nervous versus hormonal control. */
const compare = page(
  "compare",
  (b) => {
    const w = wordsOn(b);
    const pick = choiceQuestion(b, {
      name: "pick",
      prompt: t(
        "Which is true of hormonal control, compared with nervous control?",
        "तंत्रिका नियंत्रण की तुलना में हॉर्मोन वाले नियंत्रण के बारे में क्या सच है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "It is slower, but reaches every cell through the blood and can act steadily for long",
            "यह धीमा है, पर रुधिर से हर कोशिका तक पहुँचता है और लंबे समय तक लगातार काम कर सकता है",
          ),
        },
        {
          id: "faster",
          label: t("It is faster, through special wires", "यह ख़ास तारों से होकर, ज़्यादा तेज़ है"),
          feedback: t(
            "That's the nervous system: fast impulses along neurons. Hormones travel in the blood, more slowly.",
            "वह तंत्रिका तंत्र है: तंत्रिका कोशिकाओं पर तेज़ आवेग। हॉर्मोन रुधिर में, धीरे चलते हैं।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Two ways to coordinate", "समन्वय के दो तरीक़े")),
      w.definition(
        t(
          "**Nervous control:** messages are **electrical impulses** along neurons; they are **very fast**; they reach only the cells the nerves are connected to; each cell needs time to reset. **Hormonal control:** messages are **chemicals** carried in the **blood**; they are **slower**; they reach **all** cells, wherever the target is; they can act **steadily** over a long time. Hormone levels are kept precise by **feedback**.",
          "**तंत्रिका नियंत्रण:** संदेश तंत्रिका कोशिकाओं पर **विद्युत आवेग** हैं; ये **बहुत तेज़** हैं; ये केवल उन कोशिकाओं तक पहुँचते हैं जिनसे तंत्रिकाएँ जुड़ी हैं; हर कोशिका को फिर से तैयार होने में समय लगता है। **हॉर्मोन नियंत्रण:** संदेश **रुधिर** में ले जाए गए **रसायन** हैं; ये **धीमे** हैं; ये **सब** कोशिकाओं तक पहुँचते हैं, लक्ष्य जहाँ भी हो; ये लंबे समय तक **लगातार** काम कर सकते हैं। हॉर्मोनों का स्तर **पुनर्भरण** से सटीक रखा जाता है।",
        ),
      ),
      pick,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** Fair day: stage fright explained live. */
const fairDay = page(
  "fair-day",
  (b) => {
    const w = wordsOn(b);
    const fair = b.prop(controlSceneDef, "fair", { scene: ControlScene.FairDay });
    b.standsFor(
      fair,
      "fair day: the stall full of exhibits, Riya presenting, Kabir at the Fastest Hands board, visitors and family watching",
    );
    const fright = choiceQuestion(b, {
      name: "fright",
      prompt: t(
        "On fair day, Riya's heart pounds again as she starts her talk. What is happening, and why does it reach her whole body at once?",
        "मेले के दिन बात शुरू करते ही रिया का दिल फिर धड़कने लगता है। क्या हो रहा है, और यह एक साथ पूरे शरीर तक क्यों पहुँचता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Her adrenal glands are releasing adrenaline into her blood, which carries it everywhere",
            "उसकी अधिवृक्क ग्रंथियाँ रुधिर में एड्रीनलिन छोड़ रही हैं, जो उसे हर जगह ले जाता है",
          ),
        },
        {
          id: "reflex",
          label: t("It's a reflex arc in her spinal cord", "यह उसके मेरुरज्जु का प्रतिवर्ती चाप है"),
          feedback: t(
            "A reflex moves one muscle fast. A change all over the body at once is a hormone in the blood: adrenaline.",
            "प्रतिवर्त एक पेशी को तेज़ी से हिलाता है। पूरे शरीर में एक साथ बदलाव रुधिर में किसी हॉर्मोन का काम है: एड्रीनलिन।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const finale = w.definition(
      t(
        '**Mission complete.** Riya turns her nerves into the last exhibit: "Feel your heart? That\'s adrenaline, from two little glands above your kidneys, in your blood right now." The visitors go round the stall: (1) a **neuron** passing a message, electrical along it and chemical across the synapse; (2) the **reflex arc** beside the ruler game; (3) the **brain map**, fore, mid and hind; (4) the chhui-mui and the **bean box**; (5) **auxin** and the plant hormones; (6) the **endocrine** body map, with Grandpa explaining his insulin. Kabir\'s name tops the Fastest Hands board, and he has written underneath, in small letters: *"tested by my brain, not my reflexes"*.',
        '**मिशन पूरा।** रिया अपनी घबराहट को आख़िरी प्रदर्श बना देती है: "अपना दिल महसूस करो? यह एड्रीनलिन है, तुम्हारे गुर्दों के ऊपर की दो छोटी ग्रंथियों से, अभी तुम्हारे रुधिर में।" दर्शक स्टॉल पर घूमते हैं: (1) संदेश आगे बढ़ाती **तंत्रिका कोशिका**, उस पर विद्युत और सिनेप्स के पार रासायनिक; (2) रूलर के खेल के पास **प्रतिवर्ती चाप**; (3) **मस्तिष्क का नक्शा**, अग्र, मध्य और पश्च; (4) छुई-मुई और **सेम का डिब्बा**; (5) **ऑक्सिन** और पादप हॉर्मोन; (6) **अंतःस्रावी** शरीर का नक्शा, जहाँ दादाजी अपना इंसुलिन समझाते हैं। सबसे तेज़ हाथ बोर्ड पर सबसे ऊपर कबीर का नाम है, और नीचे उसने छोटे अक्षरों में लिखा है: *"मेरे मस्तिष्क ने परखा, प्रतिवर्त ने नहीं"*।',
      ),
      "finale",
      { isHidden: true },
    );
    b.when(fright.on(QuestionSignal.Correct), [theBoard.show(finale), theBoard.pass()]);
    return column([w.title(t("Fair day", "मेले का दिन")), fair, fright, finale, space()]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** NCERT in-text Q1, Exercises 9 and 11; then the log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const chemical = choiceQuestion(b, {
      name: "chemical",
      prompt: t(
        "How does chemical coordination take place in animals?",
        "जंतुओं में रासायनिक समन्वय कैसे होता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Endocrine glands secrete hormones into the blood, which carries them to target organs",
            "अंतःस्रावी ग्रंथियाँ रुधिर में हॉर्मोन स्रावित करती हैं, जो उन्हें लक्ष्य अंगों तक ले जाता है",
          ),
        },
        {
          id: "diffuse",
          label: t(
            "Hormones diffuse from cell to cell, as in plants",
            "पौधों की तरह, हॉर्मोन कोशिका से कोशिका तक विसरित होते हैं",
          ),
          feedback: t(
            "In animals, hormones go straight into the blood, which carries them all over the body.",
            "जंतुओं में हॉर्मोन सीधे रुधिर में जाते हैं, जो उन्हें पूरे शरीर में ले जाता है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const need = choiceQuestion(b, {
      name: "need",
      prompt: t(
        "What is the need for a system of control and coordination in a living thing?",
        "किसी जीव में नियंत्रण और समन्वय के तंत्र की क्या ज़रूरत है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "So that each change in the surroundings gets the right response, with all the body's parts working together",
            "ताकि परिवेश के हर बदलाव पर सही अनुक्रिया हो, और शरीर के सारे हिस्से साथ मिलकर काम करें",
          ),
        },
        {
          id: "grow",
          label: t("Only so that it can grow taller", "केवल ताकि वह लंबा हो सके"),
          feedback: t(
            "Growth is one thing it controls, but the main need is to respond correctly to changes, with every part working together.",
            "वृद्धि उन चीज़ों में से एक है जिन्हें यह नियंत्रित करता है, पर असली ज़रूरत बदलावों पर सही अनुक्रिया की है, हर हिस्से के साथ मिलकर।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ **Endocrine glands** release hormones straight into the blood: a second way of control, slower than nerves but reaching every cell. ✓ **Adrenaline** (adrenal glands): faster heart and breathing, blood to the muscles. ✓ **Thyroxin** (thyroid) needs iodine; lack of it can cause goitre. ✓ **Growth hormone** (pituitary), set off by **releasing hormones** (hypothalamus); too little causes dwarfism. ✓ **Testosterone** and **oestrogen** bring puberty. ✓ **Insulin** (pancreas) controls blood sugar, kept precise by **feedback**; too little causes diabetes. Chapter done: the stall is complete.",
        "**मिशन लॉग।** ✓ **अंतःस्रावी ग्रंथियाँ** हॉर्मोन सीधे रुधिर में छोड़ती हैं: नियंत्रण का दूसरा तरीक़ा, तंत्रिकाओं से धीमा पर हर कोशिका तक पहुँचने वाला। ✓ **एड्रीनलिन** (अधिवृक्क ग्रंथियाँ): तेज़ दिल और साँस, पेशियों तक रुधिर। ✓ **थायरॉक्सिन** (थायरॉइड) को आयोडीन चाहिए; इसकी कमी से घेंघा हो सकता है। ✓ **वृद्धि हॉर्मोन** (पीयूष ग्रंथि), जिसे **मोचक हॉर्मोन** (हाइपोथैलेमस) छुड़वाते हैं; कमी से बौनापन। ✓ **टेस्टोस्टेरॉन** और **एस्ट्रोजन** यौवनारंभ लाते हैं। ✓ **इंसुलिन** (अग्न्याशय) रुधिर शर्करा नियंत्रित करता है, जिसे **पुनर्भरण** सटीक रखता है; कमी से मधुमेह। अध्याय पूरा: स्टॉल तैयार है।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(need.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), chemical, need, log, space()]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [
  hook,
  adrenaline,
  glands,
  thyroid,
  growth,
  puberty,
  insulin,
  diabetes,
  table,
  compare,
  fairDay,
  yourTurn,
];

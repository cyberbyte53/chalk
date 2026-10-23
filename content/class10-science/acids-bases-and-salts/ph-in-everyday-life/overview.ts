import { type BoardKit, PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import { AcidSceneKind, LifeBand, PhAction, SubstanceId, phScaleDef } from "@chalk/prop-chemistry";
import { sceneOn } from "../kit";

/** A pH strip with one life band marked, and substances to place on it. */
function bandOn(
  b: BoardKit,
  name: string,
  band: (typeof LifeBand)[keyof typeof LifeBand],
  substances: (typeof SubstanceId)[keyof typeof SubstanceId][],
) {
  const prop = b.prop(phScaleDef, name, {
    substances,
    picked: null,
    probe: null,
    showColours: true,
    showRegions: true,
    showIons: false,
    showTested: true,
    tested: [],
    band,
    canPick: substances.length > 0,
    canProbe: substances.length === 0,
  });
  b.studentOnly(prop.action(PhAction.Pick));
  b.studentOnly(prop.action(PhAction.Probe));
  b.studentOnly(prop.action(PhAction.Clear));
  return prop;
}

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** Kabir and the party sweets; the dentist's warning. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const teeth = sceneOn(
    b,
    "teeth",
    AcidSceneKind.SweetTeeth,
    "Kabir grinning with a mouthful of party sweets, a toothbrush forgotten on the sink",
  );
  return column([
    w.title(t("A mouthful of sweets", "मुँह भर मिठाई")),
    teeth,
    w.body(
      t(
        'Kabir has been "testing" the party sweets all week, and skipping his toothbrush. Mom reminds him of the dentist\'s words: "Sugar doesn\'t make holes. What it turns into does." And outside, Grandpa\'s garden has bees buzzing round the flowers where the party games will be.',
        'कबीर पूरे हफ़्ते पार्टी की मिठाइयाँ "जाँचता" रहा है, और टूथब्रश छोड़ता रहा है। मम्मी उसे दाँतों के डॉक्टर की बात याद दिलाती हैं: "चीनी छेद नहीं करती। वह जिसमें बदलती है, वह करता है।" और बाहर, दादाजी के बग़ीचे में फूलों के आसपास मधुमक्खियाँ भिनभिना रही हैं, जहाँ पार्टी के खेल होंगे।',
      ),
    ),
    w.body(
      t(
        "Stop 6: why does pH matter to living things: our body, teeth, soil and rivers?",
        "पड़ाव 6: सजीवों के लिए pH क्यों मायने रखता है: हमारा शरीर, दाँत, मिट्टी और नदियाँ?",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Our body works at pH 7.0–7.8; acid rain. */
const body = page(
  "body",
  (b) => {
    const w = wordsOn(b);
    const strip = bandOn(b, "strip", LifeBand.AcidRain, [SubstanceId.RainWater, SubstanceId.Blood]);
    b.standsFor(
      strip,
      "the pH strip with the band below 5.6 marked as acid rain; rain water and blood can be placed on it",
    );
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "Rain with a pH of 4.5 falls on a lake. What happens to the fish?",
        "4.5 pH की वर्षा एक झील पर गिरती है। मछलियों का क्या होता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "It is acid rain: the lake's pH drops and survival gets harder",
            "यह अम्लीय वर्षा है: झील का pH गिरता है और जीना कठिन हो जाता है",
          ),
        },
        {
          id: "fine",
          label: t("Nothing: rain is just water", "कुछ नहीं: वर्षा बस पानी है"),
          feedback: t(
            "Below 5.6 counts as acid rain, and 4.5 is well below.",
            "5.6 से नीचे अम्लीय वर्षा मानी जाती है, और 4.5 काफ़ी नीचे है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Life lives in a narrow range", "जीवन एक तंग दायरे में")),
      w.body(
        t(
          "Our body works within the pH range **7.0 to 7.8**. Living things can survive only a small change in pH.",
          "हमारा शरीर **7.0 से 7.8** के pH दायरे में काम करता है। सजीव pH में केवल छोटा बदलाव सह पाते हैं।",
        ),
      ),
      w.definition(
        t(
          "**Acid rain.** When the pH of rain water is **less than 5.6**, it is called **acid rain**. When it flows into rivers, it lowers the river water's pH, and water life finds it hard to survive.",
          "**अम्लीय वर्षा।** जब वर्षा के जल का pH **5.6 से कम** हो, तो उसे **अम्लीय वर्षा** कहते हैं। जब यह नदियों में बहती है, तो नदी के जल का pH घटाती है, और जलीय जीवन के लिए जीना कठिन हो जाता है।",
        ),
      ),
      strip,
      w.note(
        t(
          "On Venus, the thick white and yellowish clouds are made of sulphuric acid. Could life as we know it survive there?",
          "शुक्र ग्रह पर घने सफ़ेद और पीले बादल सल्फ़्यूरिक अम्ल के बने हैं। क्या वहाँ हमारे जैसा जीवन बच सकता है?",
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Activity 2.12: soil pH, and lime for acidic soil. */
const soil = page(
  "soil",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "A farmer treats his field with quick lime, slaked lime or chalk. What must his soil be like?",
        "एक किसान अपने खेत में बिना बुझा चूना, बुझा चूना या खड़िया डालता है। उसकी मिट्टी कैसी होगी?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Too acidic: these bases neutralise the extra acid",
            "बहुत अम्लीय: ये क्षारक अतिरिक्त अम्ल को उदासीन करते हैं",
          ),
        },
        {
          id: "basic",
          label: t("Too basic", "बहुत क्षारकीय"),
          feedback: t(
            "Lime and chalk are bases (or carbonates): adding them to basic soil would make it worse.",
            "चूना और खड़िया क्षारक (या कार्बोनेट) हैं: क्षारकीय मिट्टी में डालने से वह और बिगड़ेगी।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("The soil in the garden", "बग़ीचे की मिट्टी")),
      w.body(
        t(
          "Plants also need a particular pH range to grow well. NCERT Activity 2.12: shake 2 g of soil with 5 mL of water, filter it, and test the clear liquid with universal indicator paper. Note which plants grow where the soil came from.",
          "पौधों को भी अच्छी बढ़त के लिए एक ख़ास pH दायरा चाहिए। NCERT क्रियाकलाप 2.12: 2 g मिट्टी को 5 mL पानी के साथ हिलाओ, छानो, और साफ़ द्रव को सार्वत्रिक सूचक पत्र से जाँचो। लिखो कि जहाँ से मिट्टी आई वहाँ कौन-से पौधे उगते हैं।",
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The stomach's acid and antacids. */
const stomach = page(
  "stomach",
  (b) => {
    const w = wordsOn(b);
    const strip = bandOn(b, "strip", LifeBand.Stomach, [
      SubstanceId.GastricJuice,
      SubstanceId.MilkOfMagnesia,
    ]);
    b.standsFor(
      strip,
      "the pH strip with the stomach's range marked very acidic; gastric juice and milk of magnesia can be placed on it",
    );
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "NCERT Exercise 4. Which kind of medicine is used for indigestion?",
        "NCERT अभ्यास 4। अपच के लिए किस तरह की दवा इस्तेमाल होती है?",
      ),
      options: [
        { id: "right", label: t("Antacid", "प्रतिअम्ल") },
        {
          id: "antibiotic",
          label: t("Antibiotic", "प्रतिजैविक"),
          feedback: t(
            "Antibiotics fight bacteria. Indigestion is too much acid: it needs a base.",
            "प्रतिजैविक जीवाणुओं से लड़ते हैं। अपच ज़्यादा अम्ल है: इसे क्षारक चाहिए।",
          ),
        },
        {
          id: "analgesic",
          label: t("Analgesic", "पीड़ाहारी"),
          feedback: t(
            "Painkillers don't remove the extra acid.",
            "दर्दनिवारक अतिरिक्त अम्ल नहीं हटाते।",
          ),
        },
        {
          id: "antiseptic",
          label: t("Antiseptic", "प्रतिरोधी"),
          feedback: t("Antiseptics stop germs on wounds.", "प्रतिरोधी घावों पर कीटाणु रोकते हैं।"),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Acid in the stomach", "पेट में अम्ल")),
      w.body(
        t(
          "Our stomach makes **hydrochloric acid**. It helps digest food without harming the stomach. During indigestion the stomach makes too much, which causes pain and irritation.",
          "हमारा पेट **हाइड्रोक्लोरिक अम्ल** बनाता है। यह पेट को नुक़सान पहुँचाए बिना खाना पचाने में मदद करता है। अपच में पेट बहुत ज़्यादा बना देता है, जिससे दर्द और जलन होती है।",
        ),
      ),
      strip,
      w.body(
        t(
          "**Antacids** are mild bases that neutralise the extra acid. **Milk of magnesia** (magnesium hydroxide) is a common one.",
          "**प्रतिअम्ल** हल्के क्षारक हैं जो अतिरिक्त अम्ल को उदासीन करते हैं। **मिल्क ऑफ़ मैग्नीशिया** (मैग्नीशियम हाइड्रॉक्साइड) एक आम प्रतिअम्ल है।",
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Tooth decay below pH 5.5; basic toothpaste. */
const teeth = page(
  "teeth",
  (b) => {
    const w = wordsOn(b);
    const strip = bandOn(b, "strip", LifeBand.ToothDecay, [
      SubstanceId.SalivaBeforeMeal,
      SubstanceId.SalivaAfterMeal,
      SubstanceId.Toothpaste,
    ]);
    b.standsFor(
      strip,
      "the pH strip with the band below 5.5 marked as tooth decay; saliva before a meal, saliva after a meal and toothpaste can be placed on it",
    );
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "Why does brushing with toothpaste after eating protect teeth?",
        "खाने के बाद टूथपेस्ट से ब्रश करने से दाँत कैसे बचते हैं?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Toothpaste is basic: it neutralises the acid that bacteria make",
            "टूथपेस्ट क्षारकीय है: यह जीवाणुओं के बनाए अम्ल को उदासीन करता है",
          ),
        },
        {
          id: "white",
          label: t("It paints the enamel white", "यह इनेमल को सफ़ेद रंग देता है"),
          feedback: t(
            "The danger is acid below pH 5.5; toothpaste fights it as a base.",
            "ख़तरा 5.5 pH से नीचे का अम्ल है; टूथपेस्ट क्षारक की तरह उससे लड़ता है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Acid and teeth", "अम्ल और दाँत")),
      w.body(
        t(
          "Tooth **enamel**, made of calcium hydroxyapatite (a form of calcium phosphate), is the hardest substance in the body. It does not dissolve in water, but it is corroded when the pH in the mouth falls **below 5.5**.",
          "दाँतों का **इनेमल**, कैल्सियम हाइड्रॉक्सीऐपेटाइट (कैल्सियम फ़ॉस्फ़ेट का एक रूप) का बना, शरीर का सबसे कठोर पदार्थ है। यह पानी में नहीं घुलता, पर जब मुँह का pH **5.5 से नीचे** गिरता है तो यह संक्षारित हो जाता है।",
        ),
      ),
      w.body(
        t(
          "Bacteria in the mouth break down sugar and bits of food left after eating, and make acids. The best defence is to clean the mouth after eating. Toothpastes are generally basic, so they neutralise the extra acid.",
          "मुँह के जीवाणु खाने के बाद बची चीनी और खाने के टुकड़ों को तोड़कर अम्ल बनाते हैं। सबसे अच्छा बचाव है खाने के बाद मुँह साफ़ करना। टूथपेस्ट आमतौर पर क्षारकीय होते हैं, इसलिए वे अतिरिक्त अम्ल को उदासीन करते हैं।",
        ),
      ),
      strip,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Stings, and acids found in nature (Table 2.3). */
const stings = page(
  "stings",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "Rubbing a dock leaf on a nettle sting helps. What must the dock leaf be?",
        "बिच्छू बूटी के डंक पर डॉक पत्ता रगड़ने से राहत मिलती है। डॉक पत्ता कैसा होगा?",
      ),
      options: [
        { id: "right", label: t("Basic", "क्षारकीय") },
        {
          id: "acidic",
          label: t("Acidic", "अम्लीय"),
          feedback: t(
            "The sting is methanoic acid. To cancel an acid, you need a base.",
            "डंक मेथेनॉइक अम्ल है। अम्ल का असर मिटाने के लिए क्षारक चाहिए।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Chemical warfare in nature", "प्रकृति का रासायनिक युद्ध")),
      w.body(
        t(
          "A **bee sting** leaves an acid that causes pain and irritation. A mild base like **baking soda** on the stung area gives relief. The stinging hairs of **nettle** leaves inject **methanoic acid**; the traditional remedy is to rub the area with a leaf of the **dock** plant, which often grows nearby.",
          "**मधुमक्खी का डंक** एक अम्ल छोड़ता है जिससे दर्द और जलन होती है। डंक वाली जगह पर **खाने का सोडा** जैसा हल्का क्षारक लगाने से राहत मिलती है। **बिच्छू बूटी** (नेटल) की पत्तियों के डंक वाले बाल **मेथेनॉइक अम्ल** डालते हैं; पारंपरिक इलाज है उस जगह पर **डॉक** पौधे का पत्ता रगड़ना, जो अक्सर पास ही उगता है।",
        ),
      ),
      w.definition(
        t(
          "**Acids in nature (Table 2.3).** Vinegar: acetic acid. Orange and lemon: citric acid. Tamarind: tartaric acid. Tomato: oxalic acid. Sour milk (curd): lactic acid. Ant sting and nettle sting: methanoic acid.",
          "**प्रकृति में अम्ल (तालिका 2.3)।** सिरका: ऐसीटिक अम्ल। संतरा और नींबू: साइट्रिक अम्ल। इमली: टार्टरिक अम्ल। टमाटर: ऑक्सैलिक अम्ल। खट्टा दूध (दही): लैक्टिक अम्ल। चींटी और बिच्छू बूटी का डंक: मेथेनॉइक अम्ल।",
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

/** Kabir's teeth and the bee sting at the party. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const sting = sceneOn(
      b,
      "sting",
      AcidSceneKind.BeeSting,
      "Kabir in Grandpa's garden holding his arm where a bee stung him; Riya comes running with a paste of baking soda",
    );
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "During the treasure hunt a bee stings Kabir. What should Riya put on it?",
        "ख़ज़ाने की खोज के दौरान एक मधुमक्खी कबीर को डंक मार देती है। रिया उस पर क्या लगाए?",
      ),
      options: [
        {
          id: "right",
          label: t("A paste of baking soda", "खाने के सोडे का लेप"),
        },
        {
          id: "lemon",
          label: t("Lemon juice", "नींबू का रस"),
          feedback: t(
            "The sting is already acidic: lemon would add more acid.",
            "डंक पहले से अम्लीय है: नींबू और अम्ल डालेगा।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const why = w.body(
      t(
        "Baking soda, a mild base, neutralises the acid of the sting. And Kabir's sweets? Bacteria turn sugar into acid; below pH 5.5 enamel starts to corrode. Brushing after eating, with basic toothpaste, keeps the pH up. Kabir brushes, grumbling.",
        "खाने का सोडा, एक हल्का क्षारक, डंक के अम्ल को उदासीन करता है। और कबीर की मिठाइयाँ? जीवाणु चीनी को अम्ल में बदलते हैं; 5.5 pH से नीचे इनेमल संक्षारित होने लगता है। खाने के बाद क्षारकीय टूथपेस्ट से ब्रश करना pH ऊपर रखता है। कबीर बड़बड़ाते हुए ब्रश करता है।",
      ),
      "why",
      { isHidden: true },
    );
    b.when(ask.on(QuestionSignal.Correct), [theBoard.show(why), theBoard.pass()]);
    return column([
      w.title(t("Party first aid", "पार्टी की प्राथमिक चिकित्सा")),
      sting,
      ask,
      why,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** NCERT in-text Q1–Q3; Exercises 11 and 12; the mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const ask1 = choiceQuestion(b, {
      name: "ask1",
      prompt: t(
        "Solution A has pH 6 and solution B has pH 8. Which has more hydrogen ions?",
        "विलयन A का pH 6 है और विलयन B का pH 8। किसमें ज़्यादा हाइड्रोजन आयन हैं?",
      ),
      options: [
        { id: "right", label: t("A, which is acidic (B is basic)", "A, जो अम्लीय है (B क्षारकीय है)") },
        {
          id: "b",
          label: t("B", "B"),
          feedback: t(
            "Higher H⁺ means lower pH. A has the lower pH.",
            "ज़्यादा H⁺ मतलब कम pH। A का pH कम है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const ask2 = choiceQuestion(b, {
      name: "ask2",
      prompt: t(
        "Do basic solutions also have H⁺(aq) ions?",
        "क्या क्षारकीय विलयनों में भी H⁺(aq) आयन होते हैं?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Yes, but far fewer than OH⁻ ions, so they are basic",
            "हाँ, पर OH⁻ आयनों से बहुत कम, इसलिए वे क्षारकीय हैं",
          ),
        },
        {
          id: "no",
          label: t("No, none at all", "नहीं, बिल्कुल नहीं"),
          feedback: t(
            "Water itself always has a few H⁺ ions. In a base, OH⁻ ions simply outnumber them.",
            "पानी में ख़ुद हमेशा कुछ H⁺ आयन होते हैं। क्षारक में बस OH⁻ आयन उनसे ज़्यादा होते हैं।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const ask3 = choiceQuestion(b, {
      name: "ask3",
      prompt: t(
        "NCERT Exercise 12. A milkman adds a little baking soda to fresh milk (pH 6), making it slightly alkaline. Why does this milk take longer to set as curd?",
        "NCERT अभ्यास 12। एक दूधवाला ताज़े दूध (pH 6) में थोड़ा खाने का सोडा मिलाता है, जिससे वह थोड़ा क्षारीय हो जाता है। यह दूध दही बनने में ज़्यादा समय क्यों लेता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "The lactic acid formed must first neutralise the baking soda before the pH can fall",
            "बनने वाले लैक्टिक अम्ल को pH गिराने से पहले खाने के सोडे को उदासीन करना पड़ता है",
          ),
        },
        {
          id: "cold",
          label: t("Baking soda cools the milk", "खाने का सोडा दूध को ठंडा करता है"),
          feedback: t(
            "As milk turns to curd, lactic acid forms and the pH falls. The base slows that fall.",
            "दूध के दही बनने में लैक्टिक अम्ल बनता है और pH गिरता है। क्षारक उस गिरावट को धीमा करता है।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ The body works at pH 7.0–7.8; rain below 5.6 is acid rain. ✓ Acidic soil is treated with lime or chalk. ✓ Antacids neutralise extra stomach acid. ✓ Teeth decay below pH 5.5; basic toothpaste protects them. ✓ Stings are acidic; baking soda soothes them. Next: salts, and why some salts aren't neutral.",
        "**मिशन लॉग।** ✓ शरीर 7.0–7.8 pH पर काम करता है; 5.6 से नीचे की वर्षा अम्लीय वर्षा है। ✓ अम्लीय मिट्टी को चूने या खड़िया से ठीक करते हैं। ✓ प्रतिअम्ल पेट के अतिरिक्त अम्ल को उदासीन करते हैं। ✓ 5.5 pH से नीचे दाँत सड़ते हैं; क्षारकीय टूथपेस्ट बचाता है। ✓ डंक अम्लीय होते हैं; खाने का सोडा आराम देता है। आगे: लवण, और कुछ लवण उदासीन क्यों नहीं होते।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(ask1.on(QuestionSignal.Correct), theBoard.show(ask2));
    b.when(ask2.on(QuestionSignal.Correct), theBoard.show(ask3));
    b.when(ask3.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), ask1, ask2, ask3, log, space()]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [hook, body, soil, stomach, teeth, stings, inLife, yourTurn];

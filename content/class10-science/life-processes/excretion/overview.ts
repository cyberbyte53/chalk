import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  Drink,
  LifeScene,
  NephronAction,
  NephronMode,
  lifeSceneDef,
  nephronDef,
} from "@chalk/prop-life";

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** A hot day: lots of water in, very little urine out. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const afternoon = b.prop(lifeSceneDef, "afternoon", { scene: LifeScene.HotDay });
  b.standsFor(
    afternoon,
    "a hot afternoon: Kabir, sweaty after practice, gulps from a big water bottle",
  );
  return column([
    w.title(t("Where does all the water go?", "सारा पानी जाता कहाँ है?")),
    afternoon,
    w.body(
      t(
        'The last stop before race day. On a scorching afternoon Kabir comes back from practice with his shirt soaked in sweat and drinks a whole litre, yet hardly needs the toilet all evening. On a cool rainy day he drinks much less but keeps running to the bathroom. "My body has no logic," he says.',
        'दौड़ के दिन से पहले का आख़िरी पड़ाव। एक झुलसाती दोपहर कबीर पसीने से तर कमीज़ में अभ्यास से लौटता है और पूरा एक लीटर पानी पी जाता है, फिर भी पूरी शाम उसे मुश्किल से बाथरूम जाना पड़ता है। ठंडे बरसाती दिन वह बहुत कम पीता है पर बार-बार बाथरूम भागता है। "मेरे शरीर का कोई तर्क ही नहीं," वह कहता है।',
      ),
    ),
    w.body(
      t(
        "It has a very good one. This stop: **how does the body get rid of waste, and decide how much water to keep?**",
        "बहुत अच्छा तर्क है। इस पड़ाव का सवाल: **शरीर अपशिष्ट से छुटकारा कैसे पाता है, और कितना पानी रखना है, यह कैसे तय करता है?**",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Excretion; the human excretory system. */
const system = page(
  "system",
  (b) => {
    const w = wordsOn(b);
    const organs = b.prop(nephronDef, "organs", {
      mode: NephronMode.System,
      showNames: true,
      canStep: false,
      canSetDrink: false,
    });
    b.standsFor(
      organs,
      "the human excretory system: two kidneys, two ureters, the urinary bladder and the urethra",
    );
    const kidneys = choiceQuestion(b, {
      name: "kidneys",
      prompt: t(
        "The kidneys in human beings are a part of the system for…",
        "मनुष्यों में वृक्क किस तंत्र का भाग हैं…",
      ),
      options: [
        { id: "right", label: t("excretion", "उत्सर्जन") },
        {
          id: "nutrition",
          label: t("nutrition", "पोषण"),
          feedback: t(
            "The kidneys remove wastes from the blood: excretion.",
            "वृक्क रुधिर से अपशिष्ट हटाते हैं: उत्सर्जन।",
          ),
        },
        {
          id: "respiration",
          label: t("respiration", "श्वसन"),
          feedback: t(
            "The kidneys remove nitrogen wastes from the blood: excretion.",
            "वृक्क रुधिर से नाइट्रोजनी अपशिष्ट हटाते हैं: उत्सर्जन।",
          ),
        },
        {
          id: "transport",
          label: t("transportation", "परिवहन"),
          feedback: t(
            "Blood brings waste to the kidneys, but the kidneys' own job is excretion.",
            "रुधिर अपशिष्ट को वृक्कों तक लाता है, पर वृक्कों का अपना काम उत्सर्जन है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Excretion: taking out the waste", "उत्सर्जन: अपशिष्ट बाहर निकालना")),
      w.definition(
        t(
          "**Excretion.** We've seen how carbon dioxide from respiration is removed. Other activities in the body make **nitrogen-containing wastes**, such as **urea** and **uric acid**, which are harmful. The biological process of removing these harmful wastes from the body is **excretion**. Many single-celled organisms simply let them diffuse out into the water around them; complex organisms use special organs.",
          "**उत्सर्जन।** हमने देखा कि श्वसन की कार्बन डाइऑक्साइड कैसे निकलती है। शरीर की दूसरी क्रियाएँ **नाइट्रोजन वाले अपशिष्ट** बनाती हैं, जैसे **यूरिया** और **यूरिक अम्ल**, जो हानिकारक हैं। इन हानिकारक अपशिष्टों को शरीर से निकालने का जैविक प्रक्रम **उत्सर्जन** है। कई एककोशिकीय जीव इन्हें बस आसपास के पानी में विसरित हो जाने देते हैं; जटिल जीव ख़ास अंगों का उपयोग करते हैं।",
        ),
      ),
      w.definition(
        t(
          "**The excretory system.** In humans it is a pair of **kidneys** (in the abdomen, one on each side of the backbone), a pair of **ureters**, a **urinary bladder** and a **urethra**. Urine made in the kidneys flows down the ureters into the bladder, where it is stored until it is passed out through the urethra. The bladder is muscular and under nervous control, so we can usually control the urge to urinate.",
          "**उत्सर्जन तंत्र।** मनुष्यों में यह एक जोड़ी **वृक्क** (उदर में, रीढ़ के दोनों ओर एक-एक), एक जोड़ी **मूत्रवाहिनी**, एक **मूत्राशय** और एक **मूत्रमार्ग** है। वृक्कों में बना मूत्र मूत्रवाहिनियों से मूत्राशय में जाता है, जहाँ वह तब तक रहता है जब तक मूत्रमार्ग से बाहर न निकाला जाए। मूत्राशय मांसल है और तंत्रिका नियंत्रण में है, इसलिए हम आमतौर पर पेशाब की इच्छा को रोक सकते हैं।",
        ),
      ),
      organs,
      kidneys,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The nephron: filter, then take back. */
const filter = page(
  "filter",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "NCERT Fig. 6.14: blood at the glomerulus; small substances filter into Bowman's capsule (cells and proteins stay); glucose, amino acids, salts and most water are selectively re-absorbed along the tubule; urine (urea in water) remains.",
    );
    const unit = b.prop(nephronDef, "unit", {
      mode: NephronMode.Filter,
      step: 0,
      showNames: true,
      canStep: true,
      canSetDrink: false,
    });
    b.studentOnly(unit.action(NephronAction.Next));
    b.studentOnly(unit.action(NephronAction.Reset));
    b.standsFor(
      unit,
      "a nephron, step by step: blood at the capillary cluster, filtering, re-absorption, urine",
    );
    const back = choiceQuestion(b, {
      name: "back",
      prompt: t(
        "Step through it. Which of these is taken back into the blood as the filtrate flows along the tube?",
        "कदम चलो। निस्यंद के नली में बहते समय इनमें से कौन-सा रुधिर में वापस लिया जाता है?",
      ),
      options: [
        { id: "right", label: t("Glucose", "ग्लूकोज़") },
        {
          id: "urea",
          label: t("Urea", "यूरिया"),
          feedback: t(
            "Urea is the waste: it stays in the tube and leaves as urine. Useful things like glucose, amino acids, salts and most of the water are taken back.",
            "यूरिया अपशिष्ट है: यह नली में रहकर मूत्र बनकर निकलता है। ग्लूकोज़, अमीनो अम्ल, लवण और ज़्यादातर पानी जैसी काम की चीज़ें वापस ली जाती हैं।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("The nephron: filter, then take back", "वृक्काणु: छानो, फिर वापस लो")),
      w.body(
        t(
          "Making urine filters waste out of the blood, the way the lungs remove carbon dioxide. So it's no surprise that, as in the lungs, the filter is a cluster of very **thin-walled capillaries**.",
          "मूत्र बनाना रुधिर से अपशिष्ट छानना है, जैसे फेफड़े कार्बन डाइऑक्साइड हटाते हैं। इसलिए कोई हैरानी नहीं कि फेफड़ों की तरह यहाँ भी छन्नी **पतली दीवार वाली केशिकाओं** का एक गुच्छा है।",
        ),
      ),
      w.definition(
        t(
          "**Nephron.** Each kidney is packed with huge numbers of filtering units called **nephrons**. In each, a capillary cluster (the **glomerulus**) sits in the cup-shaped end of a coiled tube, **Bowman's capsule**, which collects the filtered liquid (the **filtrate**). As the filtrate flows along the tube, useful substances (glucose, amino acids, salts and most of the water) are **selectively re-absorbed** into the blood. What is left is **urine**.",
          "**वृक्काणु।** हर वृक्क में बहुत बड़ी संख्या में छानने वाली इकाइयाँ होती हैं जिन्हें **वृक्काणु** कहते हैं। हर एक में केशिकाओं का गुच्छा (**केशिका गुच्छ**) एक कुंडलित नली के प्याले जैसे सिरे, **बोमन संपुट**, में होता है, जो छने हुए द्रव (**निस्यंद**) को इकट्ठा करता है। निस्यंद के नली में बहते समय काम के पदार्थ (ग्लूकोज़, अमीनो अम्ल, लवण और ज़्यादातर पानी) **चुनकर वापस सोखे** जाते हैं। जो बचता है वह **मूत्र** है।",
        ),
      ),
      unit,
      back,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** How the amount of urine is regulated. */
const water = page(
  "water",
  (b) => {
    const w = wordsOn(b);
    const daily = b.prop(nephronDef, "daily", {
      mode: NephronMode.Water,
      drink: Drink.Normal,
      showNames: true,
      canStep: false,
      canSetDrink: true,
    });
    b.studentOnly(daily.action(NephronAction.SetDrink));
    b.standsFor(
      daily,
      "a day's 180 L of filtrate against the litres of urine, for drinking little, normal or lots of water",
    );
    const amount = choiceQuestion(b, {
      name: "amount",
      prompt: t(
        "Try each setting. How is the amount of urine regulated?",
        "हर विकल्प आज़माओ। मूत्र की मात्रा कैसे नियंत्रित होती है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "By how much water the tubes take back, which depends on how much spare water and dissolved waste the body has",
            "नलियाँ कितना पानी वापस लेती हैं, इससे; जो इस पर निर्भर है कि शरीर में कितना अतिरिक्त पानी और घुला अपशिष्ट है",
          ),
        },
        {
          id: "filter",
          label: t("By filtering less blood", "कम रुधिर छानकर"),
          feedback: t(
            "Filtering goes on all the time, about 180 L a day. What changes is how much water is re-absorbed.",
            "छानना हर समय चलता है, लगभग 180 L प्रतिदिन। बदलता यह है कि कितना पानी वापस सोखा जाता है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("How much water to keep", "कितना पानी रखना है")),
      w.body(
        t(
          "In a healthy adult, the kidneys make about **180 L** of filtrate every day. Yet only **a litre or two** leaves as urine: the rest is re-absorbed along the tubes. The amount of water taken back depends on **how much excess water** is in the body, and **how much dissolved waste** there is to get rid of. Water lost in other ways, like sweat on a hot day, leaves less to spare.",
          "एक स्वस्थ वयस्क में वृक्क हर दिन लगभग **180 L** निस्यंद बनाते हैं। फिर भी केवल **एक-दो लीटर** मूत्र बनकर निकलता है: बाक़ी नलियों में वापस सोख लिया जाता है। कितना पानी वापस लिया जाए, यह इस पर निर्भर है कि शरीर में **कितना अतिरिक्त पानी** है, और **कितना घुला अपशिष्ट** निकालना है। दूसरे रास्तों से गया पानी, जैसे गर्म दिन का पसीना, अतिरिक्त पानी कम छोड़ता है।",
        ),
      ),
      daily,
      amount,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The artificial kidney; organ donation. */
const dialysis = page(
  "dialysis",
  (b) => {
    const w = wordsOn(b);
    const machine = b.prop(nephronDef, "machine", {
      mode: NephronMode.Dialysis,
      showNames: true,
      canStep: false,
      canSetDrink: false,
    });
    b.standsFor(
      machine,
      "an artificial kidney: blood flows through tubes in a tank of dialysing fluid and waste diffuses out",
    );
    const differ = choiceQuestion(b, {
      name: "differ",
      prompt: t(
        "How is an artificial kidney different from a real one?",
        "कृत्रिम वृक्क असली वृक्क से कैसे अलग है?",
      ),
      options: [
        {
          id: "right",
          label: t("There is no re-absorption in it", "उसमें वापस सोखना नहीं होता"),
        },
        {
          id: "filter",
          label: t("It doesn't remove the nitrogen wastes", "यह नाइट्रोजनी अपशिष्ट नहीं हटाता"),
          feedback: t(
            "Removing nitrogen wastes is exactly what it does. The difference is that nothing is taken back, as the kidney's tubes do.",
            "नाइट्रोजनी अपशिष्ट हटाना ही उसका काम है। अंतर यह है कि वृक्क की नलियों की तरह कुछ वापस नहीं लिया जाता।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("When kidneys fail", "जब वृक्क काम करना बंद करें")),
      w.body(
        t(
          "Kidneys are vital. Infection, injury or reduced blood flow can stop them working, and poisonous wastes build up in the body, which can even cause death. Then an **artificial kidney** can be used.",
          "वृक्क जीवन के लिए ज़रूरी हैं। संक्रमण, चोट या कम रुधिर प्रवाह से वे काम करना बंद कर सकते हैं, और शरीर में ज़हरीले अपशिष्ट जमा हो जाते हैं, जिससे मृत्यु तक हो सकती है। तब **कृत्रिम वृक्क** का उपयोग किया जा सकता है।",
        ),
      ),
      w.definition(
        t(
          "**Dialysis.** An artificial kidney removes nitrogen wastes from the blood by **dialysis** (haemodialysis). It has tubes with a **semi-permeable** lining (one that lets only small particles through), in a tank of **dialysing fluid**. This fluid is like blood but has no nitrogen wastes. The patient's blood flows through the tubes; the wastes diffuse out into the fluid, and the cleaned blood is pumped back.",
          "**अपोहन।** कृत्रिम वृक्क **अपोहन** (हीमोडायलिसिस) से रुधिर से नाइट्रोजनी अपशिष्ट हटाता है। इसमें **अर्धपारगम्य** परत (जो केवल छोटे कणों को पार जाने दे) वाली नलियाँ होती हैं, **अपोहन द्रव** से भरी टंकी में। यह द्रव रुधिर जैसा है पर इसमें नाइट्रोजनी अपशिष्ट नहीं। रोगी का रुधिर नलियों से बहता है; अपशिष्ट विसरित होकर द्रव में चले जाते हैं, और साफ़ रुधिर वापस पंप किया जाता है।",
        ),
      ),
      machine,
      w.note(
        t(
          "**Think it over: organ donation.** Donating an organ to someone whose organ has failed is a generous act, done with the consent of the donor and their family. Anyone, of any age or gender, can be a donor. Common transplants include corneas, kidneys, heart, liver, pancreas, lungs, intestines and bone marrow. Most donations happen just after the donor has died, but a kidney, part of a liver or lung, and some tissues can be given while the donor is alive.",
          "**सोचो: अंगदान।** जिसका अंग काम करना बंद कर चुका हो, उसे अंग दान करना एक उदार काम है, जो दाता और उसके परिवार की सहमति से होता है। कोई भी, किसी भी उम्र या लिंग का, दाता हो सकता है। आम प्रत्यारोपणों में कॉर्निया, वृक्क, हृदय, यकृत, अग्न्याशय, फेफड़े, आंत और अस्थि मज्जा हैं। ज़्यादातर दान दाता की मृत्यु के तुरंत बाद होते हैं, पर वृक्क, यकृत या फेफड़े का हिस्सा, और कुछ ऊतक दाता के जीवित रहते भी दिए जा सकते हैं।",
        ),
      ),
      differ,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Excretion in plants. */
const plants = page(
  "plants",
  (b) => {
    const w = wordsOn(b);
    const leaves = choiceQuestion(b, {
      name: "leaves",
      prompt: t(
        "Which of these is a way plants get rid of waste?",
        "इनमें से कौन-सा तरीक़ा पौधे अपशिष्ट से छुटकारा पाने के लिए अपनाते हैं?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Storing it in leaves that later fall off",
            "उसे उन पत्तियों में जमा करना जो बाद में गिर जाती हैं",
          ),
        },
        {
          id: "kidney",
          label: t("Filtering it through tiny kidneys in the roots", "जड़ों के नन्हे वृक्कों से छानना"),
          feedback: t(
            "Plants have no kidneys. They store wastes in vacuoles, in leaves that fall, as resins and gums, or release them into the soil.",
            "पौधों में वृक्क नहीं होते। वे अपशिष्ट रिक्तिकाओं में, गिरने वाली पत्तियों में, रेज़िन और गोंद के रूप में जमा करते हैं, या मिट्टी में छोड़ देते हैं।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("How plants get rid of waste", "पौधे अपशिष्ट से कैसे छुटकारा पाते हैं")),
      w.body(
        t(
          "Plants do it completely differently. Oxygen from photosynthesis can itself be thought of as a waste, given out through the stomata, and excess water is lost by transpiration. For other wastes, plants use the fact that many of their tissues are dead cells, and that they can shed parts:",
          "पौधे यह बिल्कुल अलग तरह से करते हैं। प्रकाश संश्लेषण की ऑक्सीजन को भी अपशिष्ट माना जा सकता है, जो रंध्रों से निकलती है, और अतिरिक्त पानी वाष्पोत्सर्जन से निकलता है। दूसरे अपशिष्टों के लिए पौधे इसका फ़ायदा उठाते हैं कि उनके कई ऊतक मृत कोशिकाएँ हैं, और वे अपने भाग गिरा सकते हैं:",
        ),
      ),
      w.definition(
        t(
          "**Plant excretion.** Many wastes are stored in the cell's **vacuoles**; some in **leaves that fall off**; others as **resins and gums**, especially in old xylem. Plants also release some wastes into the **soil** around them.",
          "**पौधों में उत्सर्जन।** कई अपशिष्ट कोशिका की **रिक्तिकाओं** में जमा होते हैं; कुछ **गिरने वाली पत्तियों** में; दूसरे **रेज़िन और गोंद** के रूप में, ख़ासकर पुराने जाइलम में। पौधे कुछ अपशिष्ट आसपास की **मिट्टी** में भी छोड़ते हैं।",
        ),
      ),
      leaves,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** The hot day explained. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const afternoon = b.prop(lifeSceneDef, "afternoon", { scene: LifeScene.HotDay });
    b.standsFor(afternoon, "Kabir gulping water on a hot afternoon");
    const hot = choiceQuestion(b, {
      name: "hot",
      prompt: t(
        "So why does Kabir pass so little urine on a scorching day, even after a litre of water?",
        "तो झुलसाते दिन, एक लीटर पानी पीने के बाद भी, कबीर इतना कम पेशाब क्यों करता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "He sweated a lot, so his kidney tubes take back more water",
            "उसे बहुत पसीना आया, इसलिए वृक्क नलिकाएँ ज़्यादा पानी वापस लेती हैं",
          ),
        },
        {
          id: "stop",
          label: t(
            "The heat makes his kidneys stop filtering his blood",
            "गर्मी से उसके वृक्क रुधिर छानना बंद कर देते हैं",
          ),
          feedback: t(
            "Filtering never stops. What changes is re-absorption: with no excess water to spare, the tubes keep almost all of it.",
            "छानना कभी नहीं रुकता। बदलता है वापस सोखना: अतिरिक्त पानी न होने पर नलियाँ लगभग सारा रख लेती हैं।",
          ),
        },
        {
          id: "bladder",
          label: t(
            "The water stays stored in his bladder until it cools",
            "ठंडक होने तक पानी उसके मूत्राशय में जमा रहता है",
          ),
          feedback: t(
            "The bladder only holds urine that is already made. On a hot day less urine is made, because sweat has taken water away.",
            "मूत्राशय केवल बन चुका मूत्र रखता है। गर्म दिन में मूत्र कम बनता है, क्योंकि पसीना पानी ले जा चुका है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const stop = w.definition(
      t(
        "**Stop 9 done.** Nephrons filter about 180 L a day and take back what's useful, keeping as much water as the body needs; the rest leaves as urine. Kabir's body has logic after all. That's every stop. Time to race.",
        "**पड़ाव 9 पूरा।** वृक्काणु दिन में लगभग 180 L छानते हैं और काम की चीज़ें वापस ले लेते हैं, शरीर को जितना पानी चाहिए उतना रखते हुए; बाक़ी मूत्र बनकर निकलता है। कबीर के शरीर में आख़िर तर्क है। सारे पड़ाव पूरे। अब दौड़ का समय।",
      ),
      "stop",
      { isHidden: true },
    );
    b.when(hot.on(QuestionSignal.Correct), [theBoard.show(stop), theBoard.pass()]);
    return column([
      w.title(t("Back to the water bottle", "फिर पानी की बोतल पर")),
      afternoon,
      hot,
      stop,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** NCERT in-text Q2 and Exercise 13. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const compare = choiceQuestion(b, {
      name: "compare",
      prompt: t(
        "How are alveoli in the lungs and nephrons in the kidneys alike?",
        "फेफड़ों की कूपिकाएँ और वृक्कों के वृक्काणु कैसे एक जैसे हैं?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Both are huge numbers of tiny units with thin-walled capillaries, giving a large surface for exchange with the blood",
            "दोनों बहुत बड़ी संख्या में नन्ही इकाइयाँ हैं जिनमें पतली दीवार वाली केशिकाएँ हैं, जो रुधिर के साथ आदान-प्रदान के लिए बड़ी सतह देती हैं",
          ),
        },
        {
          id: "same",
          label: t("Both make urine", "दोनों मूत्र बनाते हैं"),
          feedback: t(
            "Their jobs differ: alveoli exchange oxygen and carbon dioxide; nephrons filter wastes and re-absorb useful things. Their design is alike: many units, thin-walled capillaries, a large surface.",
            "उनके काम अलग हैं: कूपिकाएँ ऑक्सीजन और कार्बन डाइऑक्साइड बदलती हैं; वृक्काणु अपशिष्ट छानते और काम की चीज़ें वापस सोखते हैं। उनकी बनावट मिलती है: बहुत सी इकाइयाँ, पतली दीवार वाली केशिकाएँ, बड़ी सतह।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const nephron = choiceQuestion(b, {
      name: "nephron",
      prompt: t("In a nephron, where is the blood first filtered?", "वृक्काणु में रुधिर पहले कहाँ छनता है?"),
      options: [
        {
          id: "right",
          label: t("At the capillary cluster, into Bowman's capsule", "केशिका गुच्छ पर, बोमन संपुट में"),
        },
        {
          id: "bladder",
          label: t("In the urinary bladder", "मूत्राशय में"),
          feedback: t(
            "The bladder only stores urine. Filtering happens at the capillary cluster inside Bowman's capsule.",
            "मूत्राशय केवल मूत्र जमा करता है। छानना बोमन संपुट के अंदर केशिका गुच्छ पर होता है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ Excretion removes nitrogen wastes such as urea. ✓ Kidneys → ureters → bladder → urethra. ✓ Nephrons filter at the capillary cluster into Bowman's capsule, then re-absorb glucose, amino acids, salts and most water; urine is what's left. ✓ How much water is taken back depends on the body's spare water. ✓ Plants store wastes in vacuoles, falling leaves, resins and gums, or the soil.",
        "**मिशन लॉग।** ✓ उत्सर्जन यूरिया जैसे नाइट्रोजनी अपशिष्ट हटाता है। ✓ वृक्क → मूत्रवाहिनियाँ → मूत्राशय → मूत्रमार्ग। ✓ वृक्काणु केशिका गुच्छ पर बोमन संपुट में छानते हैं, फिर ग्लूकोज़, अमीनो अम्ल, लवण और ज़्यादातर पानी वापस सोखते हैं; जो बचता है वह मूत्र है। ✓ कितना पानी वापस लिया जाए, यह शरीर के अतिरिक्त पानी पर निर्भर है। ✓ पौधे अपशिष्ट रिक्तिकाओं, गिरती पत्तियों, रेज़िन और गोंद, या मिट्टी में रखते हैं।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(nephron.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), compare, nephron, log, space()]);
  },
  { passOn: PassOn.Rules },
);

/** Race day: the whole chapter, explained. */
const finale = page("finale", (b) => {
  const w = wordsOn(b);
  const race = b.prop(lifeSceneDef, "race", { scene: LifeScene.RaceDay });
  b.standsFor(
    race,
    "Sports Day: Kabir crosses the finish line of the 1500 m with his arms up; Riya, Mom and Grandpa cheer",
  );
  return column([
    w.title(t("Race day", "दौड़ का दिन")),
    race,
    w.body(
      t(
        "Sports Day. Kabir paces himself the way Riya planned, holds back for three rounds, then kicks on the last lap. He doesn't win, but he finishes strong, with no cramp. Afterwards, still panting, he explains it all to Grandpa.",
        "खेल दिवस। कबीर रिया की योजना के मुताबिक़ अपनी रफ़्तार रखता है, तीन चक्कर संभलकर दौड़ता है, फिर आख़िरी चक्कर में ज़ोर लगाता है। वह जीतता नहीं, पर दमदार तरीक़े से पूरा करता है, बिना किसी ऐंठन के। बाद में, अब भी हाँफते हुए, वह दादाजी को सब समझाता है।",
      ),
    ),
    w.definition(
      t(
        "**Mission complete.** (1) Being alive is non-stop maintenance: nutrition, respiration, transport, excretion. (2) Plants make food by photosynthesis. (3) Other organisms feed in many ways. (4) His breakfast was digested to glucose, amino acids, fatty acids and glycerol, and absorbed by the villi. (5) His cells burned glucose with oxygen for energy (ATP); short of oxygen, muscles make lactic acid. (6) He panted to bring air to his alveoli, where haemoglobin picked up oxygen. (7) His four-chambered heart pumped it to his legs: double circulation. (8) Grandpa's peas do it with xylem and phloem. (9) His kidneys cleaned his blood and kept the water he needed.",
        "**मिशन पूरा।** (1) ज़िंदा होना लगातार रखरखाव है: पोषण, श्वसन, परिवहन, उत्सर्जन। (2) पौधे प्रकाश संश्लेषण से भोजन बनाते हैं। (3) दूसरे जीव कई तरह से भोजन पाते हैं। (4) उसका नाश्ता पचकर ग्लूकोज़, अमीनो अम्ल, वसा अम्ल और ग्लिसरॉल बना, और दीर्घरोमों ने उसे सोखा। (5) उसकी कोशिकाओं ने ऑक्सीजन से ग्लूकोज़ जलाकर ऊर्जा (ATP) ली; ऑक्सीजन कम हो तो मांसपेशियाँ लैक्टिक अम्ल बनाती हैं। (6) वह कूपिकाओं तक हवा लाने को हाँफा, जहाँ हीमोग्लोबिन ने ऑक्सीजन उठाई। (7) उसके चार कक्षों वाले हृदय ने उसे पैरों तक पंप किया: दोहरा परिसंचरण। (8) दादाजी की मटर यह जाइलम और फ़्लोएम से करती है। (9) उसके वृक्कों ने उसका रुधिर साफ़ किया और ज़रूरत भर पानी रखा।",
      ),
    ),
    w.body(
      t(
        'Grandpa laughs. "All that, just to run four rounds?" "All that," says Kabir, "just to stay alive. Running only made it louder."',
        'दादाजी हँसते हैं। "इतना सब, बस चार चक्कर दौड़ने के लिए?" "इतना सब," कबीर कहता है, "बस ज़िंदा रहने के लिए। दौड़ ने बस उसे ज़ोर से सुना दिया।"',
      ),
    ),
    space(),
  ]);
});

/** The pages, in reading order: hook, learn, see it in life, practice, finale. */
export const overview = [hook, system, filter, water, dialysis, plants, inLife, yourTurn, finale];

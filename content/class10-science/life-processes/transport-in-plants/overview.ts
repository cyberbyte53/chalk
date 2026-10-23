import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  LifeScene,
  Season,
  TransportAction,
  TransportMode,
  lifeSceneDef,
  plantTransportDef,
} from "@chalk/prop-life";

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** Grandpa's peas droop at noon. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const terrace = b.prop(lifeSceneDef, "terrace", { scene: LifeScene.WiltingPeas });
  b.standsFor(
    terrace,
    "Grandpa's terrace at noon on a hot day: the pea plants droop; Grandpa holds a watering can",
  );
  return column([
    w.title(t("Drooping at noon", "दोपहर में मुरझाना")),
    terrace,
    w.body(
      t(
        "Kabir has a heart to push his blood around (stop 7). Grandpa's pea plants have no heart, yet water climbs from their roots to the top leaves, and the food made in the leaves reaches the roots and pods. On a blazing afternoon the peas droop, their leaves limp. By evening they stand up again.",
        "कबीर के पास अपना रुधिर घुमाने के लिए हृदय है (पड़ाव 7)। दादाजी के मटर के पौधों के पास कोई हृदय नहीं, फिर भी पानी उनकी जड़ों से सबसे ऊपर की पत्तियों तक चढ़ता है, और पत्तियों में बना भोजन जड़ों और फलियों तक पहुँचता है। एक तपती दोपहर में मटर मुरझा जाती है, पत्तियाँ ढीली पड़ जाती हैं। शाम तक वे फिर खड़ी हो जाती हैं।",
      ),
    ),
    w.body(
      t(
        "This stop: **how does a plant move water up and food around, with no pump?**",
        "इस पड़ाव का सवाल: **बिना पंप के पौधा पानी ऊपर और भोजन इधर-उधर कैसे ले जाता है?**",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Why plants need transport; xylem and phloem. */
const pipes = page(
  "pipes",
  (b) => {
    const w = wordsOn(b);
    const xylem = choiceQuestion(b, {
      name: "xylem",
      prompt: t(
        "The xylem in plants is responsible for transport of…",
        "पौधों में जाइलम किसके परिवहन के लिए ज़िम्मेदार है…",
      ),
      options: [
        { id: "right", label: t("water", "पानी") },
        {
          id: "food",
          label: t("food", "भोजन"),
          feedback: t(
            "Food travels in the phloem. Xylem carries water and minerals.",
            "भोजन फ़्लोएम में जाता है। जाइलम पानी और खनिज ले जाता है।",
          ),
        },
        {
          id: "amino",
          label: t("amino acids", "अमीनो अम्ल"),
          feedback: t(
            "Amino acids travel in the phloem with the food. Xylem carries water and minerals.",
            "अमीनो अम्ल भोजन के साथ फ़्लोएम में जाते हैं। जाइलम पानी और खनिज ले जाता है।",
          ),
        },
        {
          id: "oxygen",
          label: t("oxygen", "ऑक्सीजन"),
          feedback: t(
            "Plants exchange gases by diffusion through stomata and air spaces. Xylem carries water.",
            "पौधे रंध्रों और वायु-स्थानों से विसरण द्वारा गैसें बदलते हैं। जाइलम पानी ले जाता है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Two sets of pipes", "नलियों के दो समूह")),
      w.body(
        t(
          "A plant takes raw materials (water, nitrogen, phosphorus and other minerals) from the soil through its **roots**, and makes food in its **leaves**. If roots and leaves were close together, diffusion would do. But in a tall plant they can be metres apart, so it needs a proper transport system.",
          "पौधा कच्चा माल (पानी, नाइट्रोजन, फ़ॉस्फ़ोरस और दूसरे खनिज) मिट्टी से **जड़ों** द्वारा लेता है, और भोजन **पत्तियों** में बनाता है। अगर जड़ें और पत्तियाँ पास-पास होतीं, तो विसरण काफ़ी होता। पर ऊँचे पौधे में वे मीटरों दूर हो सकती हैं, इसलिए उसे एक उचित परिवहन तंत्र चाहिए।",
        ),
      ),
      w.body(
        t(
          "Plants don't move, and many of their tissues are made of dead cells, so they need little energy and can use **slow** transport systems. But the distances can be very large, as in tall trees.",
          "पौधे चलते-फिरते नहीं, और उनके कई ऊतक मृत कोशिकाओं से बने हैं, इसलिए उन्हें कम ऊर्जा चाहिए और वे **धीमे** परिवहन तंत्र से काम चला सकते हैं। पर दूरियाँ बहुत बड़ी हो सकती हैं, जैसे ऊँचे पेड़ों में।",
        ),
      ),
      w.definition(
        t(
          "**Xylem and phloem.** The plant's transport tissue has two kinds of separate conducting tubes. **Xylem** carries **water and minerals** from the soil upwards. **Phloem** carries the **products of photosynthesis** from the leaves to other parts of the plant.",
          "**जाइलम और फ़्लोएम।** पौधे के परिवहन ऊतक में दो तरह की अलग-अलग संवहन नलियाँ हैं। **जाइलम** मिट्टी से **पानी और खनिज** ऊपर ले जाता है। **फ़्लोएम** **प्रकाश संश्लेषण के उत्पादों** को पत्तियों से पौधे के दूसरे भागों तक ले जाता है।",
        ),
      ),
      xylem,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Water up the xylem: root pressure and transpiration pull. */
const water = page(
  "water",
  (b) => {
    const w = wordsOn(b);
    const plant = b.prop(plantTransportDef, "plant", {
      mode: TransportMode.Water,
      isDay: true,
      canToggle: true,
    });
    b.studentOnly(plant.action(TransportAction.SetDay));
    b.standsFor(plant, "water and minerals moving up a plant's xylem, by day or by night");
    const day = choiceQuestion(b, {
      name: "day",
      prompt: t(
        "Switch between day and night. What mainly moves water up the xylem during the day?",
        "दिन और रात के बीच बदलो। दिन में जाइलम में पानी को मुख्य रूप से कौन ऊपर ले जाता है?",
      ),
      options: [
        { id: "right", label: t("Transpiration pull", "वाष्पोत्सर्जन खिंचाव") },
        {
          id: "root",
          label: t("Root pressure from below", "नीचे से मूल दाब"),
          feedback: t(
            "Root pressure matters most at night. By day, with the stomata open, the pull from water evaporating from the leaves is the main force.",
            "मूल दाब रात में सबसे अहम है। दिन में, रंध्र खुले होने पर, पत्तियों से वाष्पित होते पानी का खिंचाव मुख्य बल है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Water: up the xylem", "पानी: जाइलम में ऊपर")),
      w.definition(
        t(
          "**Root pressure.** The xylem vessels and tracheids of roots, stem and leaves join into one continuous set of water channels. Root cells in contact with the soil actively take up **ions** (charged particles of minerals). This makes the ion concentration in the root higher than in the soil, so **water moves into the root** to even it out. Water keeps entering the root xylem, making a column of water that is pushed upwards: **root pressure**.",
          "**मूल दाब।** जड़, तने और पत्तियों की जाइलम वाहिकाएँ और वाहिनिकाएँ जुड़कर पानी की नालियों का एक लगातार तंत्र बनाती हैं। मिट्टी से सटी जड़ की कोशिकाएँ सक्रिय रूप से **आयन** (खनिजों के आवेशित कण) लेती हैं। इससे जड़ में आयनों की सांद्रता मिट्टी से ज़्यादा हो जाती है, इसलिए अंतर मिटाने के लिए **पानी जड़ में आता है**। पानी लगातार जड़ के जाइलम में आता रहता है, जिससे पानी का एक स्तंभ ऊपर धकेला जाता है: **मूल दाब**।",
        ),
      ),
      w.definition(
        t(
          "**Transpiration.** Root pressure alone can't lift water to the tops of tall plants. The loss of water as **vapour** from the parts of the plant above the ground, mainly through the stomata, is **transpiration**. As water evaporates from leaf cells, it creates a **suction** that pulls water up from the xylem below, all the way from the roots: the **transpiration pull**. Transpiration also helps keep the plant cool.",
          "**वाष्पोत्सर्जन।** अकेला मूल दाब पानी को ऊँचे पौधों के सिरे तक नहीं उठा सकता। ज़मीन से ऊपर के भागों से, मुख्यतः रंध्रों से, **वाष्प** के रूप में पानी का निकलना **वाष्पोत्सर्जन** है। जैसे-जैसे पत्ती की कोशिकाओं से पानी वाष्पित होता है, एक **चूषण** बनता है जो नीचे के जाइलम से, जड़ों तक से, पानी ऊपर खींचता है: **वाष्पोत्सर्जन खिंचाव**। वाष्पोत्सर्जन पौधे को ठंडा रखने में भी मदद करता है।",
        ),
      ),
      w.body(
        t(
          "At **night** the stomata are closed, so root pressure matters most. By **day** they are open, and the transpiration pull is the main force.",
          "**रात** में रंध्र बंद होते हैं, इसलिए मूल दाब सबसे अहम है। **दिन** में वे खुले होते हैं, और वाष्पोत्सर्जन खिंचाव मुख्य बल है।",
        ),
      ),
      plant,
      day,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The plant and the stick under plastic (Activity 6.8). */
const bag = page(
  "bag",
  (b) => {
    const w = wordsOn(b);
    const pots = b.prop(plantTransportDef, "pots", {
      mode: TransportMode.Bag,
      step: 0,
      canToggle: true,
    });
    b.studentOnly(pots.action(TransportAction.Next));
    b.studentOnly(pots.action(TransportAction.Reset));
    b.standsFor(
      pots,
      "a plant and a stick of the same height, each under a plastic sheet, before and after half an hour in the sun",
    );
    const mist = choiceQuestion(b, {
      name: "mist",
      prompt: t(
        "After half an hour, only the plant's sheet is misty. Where did that water come from?",
        "आधे घंटे बाद केवल पौधे वाली शीट धुँधली है। वह पानी कहाँ से आया?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Out of the plant's leaves, by transpiration",
            "पौधे की पत्तियों से, वाष्पोत्सर्जन द्वारा",
          ),
        },
        {
          id: "soil",
          label: t("Evaporated from the soil", "मिट्टी से वाष्पित हुआ"),
          feedback: t(
            "The soil in both pots was covered so nothing could evaporate from it, and the stick's sheet stayed dry. The water came out of the plant.",
            "दोनों गमलों की मिट्टी ढकी थी ताकि उससे कुछ वाष्पित न हो, और डंडी की शीट सूखी रही। पानी पौधे से निकला।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Catching transpiration", "वाष्पोत्सर्जन को पकड़ना")),
      w.body(
        t(
          "NCERT Activity 6.8: one pot has a plant; the other has a stick of the same height. Cover the soil in both with plastic so no moisture escapes from it. Then cover each whole set with a plastic sheet and leave them in bright sun for half an hour.",
          "NCERT क्रियाकलाप 6.8: एक गमले में पौधा है; दूसरे में उतनी ही ऊँची डंडी। दोनों की मिट्टी प्लास्टिक से ढक दो ताकि उससे नमी न निकले। फिर हर सेट को पूरी प्लास्टिक शीट से ढककर आधे घंटे तेज़ धूप में रखो।",
        ),
      ),
      pots,
      mist,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Food in the phloem: translocation. */
const food = page(
  "food",
  (b) => {
    const w = wordsOn(b);
    const plant = b.prop(plantTransportDef, "plant", {
      mode: TransportMode.Food,
      season: Season.Summer,
      canToggle: true,
    });
    b.studentOnly(plant.action(TransportAction.SetSeason));
    b.standsFor(
      plant,
      "sugar moving in a plant's phloem: down to the stores in summer, up to the buds in spring",
    );
    const spring = choiceQuestion(b, {
      name: "spring",
      prompt: t(
        "Switch to spring. Which way does sugar move in the phloem, and why?",
        "बसंत पर जाओ। फ़्लोएम में शर्करा किस दिशा में जाती है, और क्यों?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Up from the roots and stem to the buds, which need energy to grow",
            "जड़ों और तने से ऊपर कलियों तक, जिन्हें बढ़ने के लिए ऊर्जा चाहिए",
          ),
        },
        {
          id: "down",
          label: t("Only ever downwards, from the leaves", "हमेशा केवल नीचे, पत्तियों से"),
          feedback: t(
            "Phloem can move food both up and down, wherever the plant needs it. In spring, stored sugar goes up to the growing buds.",
            "फ़्लोएम भोजन को ऊपर और नीचे दोनों ओर ले जा सकता है, जहाँ पौधे को चाहिए। बसंत में जमा शर्करा बढ़ती कलियों तक ऊपर जाती है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Food: through the phloem", "भोजन: फ़्लोएम से")),
      w.definition(
        t(
          "**Translocation.** The transport of soluble products of photosynthesis from the leaves to other parts of the plant is **translocation**. It happens in the **phloem**, which also carries **amino acids** and other substances, especially to storage organs (roots, fruits, seeds) and to growing parts. It happens in the **sieve tubes** with the help of neighbouring **companion cells**, both **upwards and downwards**.",
          "**स्थानांतरण।** प्रकाश संश्लेषण के घुलनशील उत्पादों का पत्तियों से पौधे के दूसरे भागों तक जाना **स्थानांतरण** है। यह **फ़्लोएम** में होता है, जो **अमीनो अम्ल** और दूसरे पदार्थ भी ले जाता है, ख़ासकर भंडारण अंगों (जड़ों, फलों, बीजों) और बढ़ते भागों तक। यह **चालनी नलिकाओं** में पास की **सहचर कोशिकाओं** की मदद से होता है, **ऊपर और नीचे** दोनों ओर।",
        ),
      ),
      w.body(
        t(
          "Unlike the xylem, which works by simple physical forces, the phloem **uses energy**. Sugar (sucrose) is loaded into the phloem using energy from **ATP**. This raises the pressure there, water moves in, and the pressure pushes the material to tissues with lower pressure. So the plant can send food wherever it needs it.",
          "जाइलम सरल भौतिक बलों से काम करता है, पर फ़्लोएम **ऊर्जा का उपयोग** करता है। शर्करा (सुक्रोज़) को **ATP** की ऊर्जा से फ़्लोएम में भरा जाता है। इससे वहाँ दाब बढ़ता है, पानी अंदर आता है, और दाब पदार्थ को कम दाब वाले ऊतकों की ओर धकेलता है। इस तरह पौधा भोजन को जहाँ चाहे वहाँ भेज सकता है।",
        ),
      ),
      plant,
      spring,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** The drooping peas explained. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const terrace = b.prop(lifeSceneDef, "terrace", { scene: LifeScene.WiltingPeas });
    b.standsFor(terrace, "the drooping pea plants at noon");
    const droop = choiceQuestion(b, {
      name: "droop",
      prompt: t(
        "So why do Grandpa's peas droop on a blazing afternoon?",
        "तो तपती दोपहर में दादाजी की मटर क्यों मुरझा जाती है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "They lose water by transpiration faster than the roots can take it up",
            "वे वाष्पोत्सर्जन से पानी उतनी तेज़ी से खोती हैं जितनी तेज़ी से जड़ें उसे ले नहीं पातीं",
          ),
        },
        {
          id: "food",
          label: t("Their phloem stops carrying food", "उनका फ़्लोएम भोजन ले जाना बंद कर देता है"),
          feedback: t(
            "It's water, not food. In hot sun water evaporates from the leaves very fast; if the soil can't supply enough, the leaves go limp.",
            "बात पानी की है, भोजन की नहीं। तेज़ धूप में पत्तियों से पानी बहुत तेज़ी से वाष्पित होता है; मिट्टी पर्याप्त न दे सके तो पत्तियाँ ढीली पड़ जाती हैं।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const stop = w.definition(
      t(
        "**Stop 8 done.** A plant has no pump: water is pushed up by root pressure at night and pulled up by transpiration by day; food is moved in the phloem using energy from ATP. Grandpa waters in the evening so the roots can catch up. One stop left: getting rid of waste, and then race day.",
        "**पड़ाव 8 पूरा।** पौधे में कोई पंप नहीं: रात में मूल दाब पानी को ऊपर धकेलता है और दिन में वाष्पोत्सर्जन उसे ऊपर खींचता है; भोजन फ़्लोएम में ATP की ऊर्जा से जाता है। दादाजी शाम को पानी देते हैं ताकि जड़ें पूरा कर सकें। एक पड़ाव बाक़ी: अपशिष्ट से छुटकारा, और फिर दौड़ का दिन।",
      ),
      "stop",
      { isHidden: true },
    );
    b.when(droop.on(QuestionSignal.Correct), [theBoard.show(stop), theBoard.pass()]);
    return column([w.title(t("Back on the terrace", "फिर छत पर")), terrace, droop, stop, space()]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** NCERT in-text Q3–5 and Exercise 12. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const parts = choiceQuestion(b, {
      name: "parts",
      prompt: t(
        "What are the components of the transport system in highly organised plants?",
        "उच्च संगठित पौधों में परिवहन तंत्र के घटक क्या हैं?",
      ),
      options: [
        { id: "right", label: t("Xylem and phloem", "जाइलम और फ़्लोएम") },
        {
          id: "heart",
          label: t("A heart and blood vessels", "हृदय और रुधिर वाहिकाएँ"),
          feedback: t(
            "Plants have no heart. Their transport tissue is xylem and phloem.",
            "पौधों में हृदय नहीं होता। उनका परिवहन ऊतक जाइलम और फ़्लोएम है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const differ = choiceQuestion(b, {
      name: "differ",
      prompt: t(
        "Which is a correct difference between transport in xylem and in phloem?",
        "जाइलम और फ़्लोएम के परिवहन में कौन-सा अंतर सही है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Xylem moves water and minerals upwards by physical forces; phloem moves food up and down using energy",
            "जाइलम पानी और खनिजों को भौतिक बलों से ऊपर ले जाता है; फ़्लोएम भोजन को ऊर्जा से ऊपर-नीचे ले जाता है",
          ),
        },
        {
          id: "swap",
          label: t(
            "Xylem uses energy from ATP; phloem works only by transpiration",
            "जाइलम ATP की ऊर्जा लेता है; फ़्लोएम केवल वाष्पोत्सर्जन से चलता है",
          ),
          feedback: t(
            "Other way round: phloem loading uses ATP, while xylem is driven by root pressure and the transpiration pull.",
            "उलटा है: फ़्लोएम में भरने के लिए ATP लगता है, जबकि जाइलम मूल दाब और वाष्पोत्सर्जन खिंचाव से चलता है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ Xylem carries water and minerals up; phloem carries food. ✓ Water: root pressure (mostly at night) and transpiration pull (by day). ✓ Transpiration is water vapour lost from leaves; it also cools the plant. ✓ Translocation in phloem uses ATP and goes both ways. Next: excretion, and race day.",
        "**मिशन लॉग।** ✓ जाइलम पानी और खनिज ऊपर ले जाता है; फ़्लोएम भोजन। ✓ पानी: मूल दाब (ज़्यादातर रात में) और वाष्पोत्सर्जन खिंचाव (दिन में)। ✓ वाष्पोत्सर्जन पत्तियों से जलवाष्प का निकलना है; यह पौधे को ठंडा भी रखता है। ✓ फ़्लोएम में स्थानांतरण ATP लेता है और दोनों ओर होता है। आगे: उत्सर्जन, और दौड़ का दिन।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(differ.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), parts, differ, log, space()]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [hook, pipes, water, bag, food, inLife, yourTurn];

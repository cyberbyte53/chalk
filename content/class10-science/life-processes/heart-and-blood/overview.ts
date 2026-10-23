import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import { HeartAction, HeartMode, LifeScene, heartDef, lifeSceneDef } from "@chalk/prop-life";

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** Riya counts Kabir's pulse before and after a sprint. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const wrist = b.prop(lifeSceneDef, "wrist", { scene: LifeScene.Pulse });
  b.standsFor(
    wrist,
    "Riya holds two fingers on Kabir's wrist and counts his pulse against her watch",
  );
  return column([
    w.title(t("Counting the beats", "धड़कनें गिनना")),
    wrist,
    w.body(
      t(
        "Stop 6 got oxygen into Kabir's blood in the lungs. But his legs are a long way from his lungs. Riya presses two fingers on his wrist and counts against her watch: about 75 beats a minute while he sits. After one sprint, the beats come so fast she can barely count them.",
        "पड़ाव 6 ने ऑक्सीजन को फेफड़ों में कबीर के रुधिर तक पहुँचाया। पर उसके पैर फेफड़ों से बहुत दूर हैं। रिया उसकी कलाई पर दो उँगलियाँ रखकर घड़ी देखते हुए गिनती है: बैठे हुए लगभग 75 धड़कनें प्रति मिनट। एक तेज़ दौड़ के बाद धड़कनें इतनी तेज़ हैं कि वह मुश्किल से गिन पाती है।",
      ),
    ),
    w.body(
      t(
        "This stop: **what is she feeling, and how does blood reach every part of the body?**",
        "इस पड़ाव का सवाल: **वह क्या महसूस कर रही है, और रुधिर शरीर के हर हिस्से तक कैसे पहुँचता है?**",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Blood: plasma and red blood corpuscles; what a transport system needs. */
const blood = page(
  "blood",
  (b) => {
    const w = wordsOn(b);
    const plasma = choiceQuestion(b, {
      name: "plasma",
      prompt: t(
        "Which part of the blood carries digested food and nitrogen wastes?",
        "रुधिर का कौन-सा भाग पचा हुआ भोजन और नाइट्रोजनी अपशिष्ट ले जाता है?",
      ),
      options: [
        { id: "right", label: t("The plasma, dissolved in it", "प्लाज़्मा, उसमें घुले हुए") },
        {
          id: "rbc",
          label: t("The red blood corpuscles", "लाल रुधिर कणिकाएँ"),
          feedback: t(
            "Red blood corpuscles carry oxygen. Food, carbon dioxide and nitrogen wastes travel dissolved in the plasma.",
            "लाल रुधिर कणिकाएँ ऑक्सीजन ले जाती हैं। भोजन, कार्बन डाइऑक्साइड और नाइट्रोजनी अपशिष्ट प्लाज़्मा में घुलकर जाते हैं।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Blood: the delivery fluid", "रुधिर: पहुँचाने वाला द्रव")),
      w.definition(
        t(
          "**Blood.** **Blood** is a fluid connective tissue (Class 9). It has a fluid part, **plasma**, in which cells float. Plasma carries **food, carbon dioxide and nitrogen wastes** dissolved in it, along with salts. **Oxygen** is carried by the **red blood corpuscles**.",
          "**रुधिर।** **रुधिर** एक तरल संयोजी ऊतक है (कक्षा 9)। इसका एक तरल भाग, **प्लाज़्मा**, है जिसमें कोशिकाएँ तैरती हैं। प्लाज़्मा **भोजन, कार्बन डाइऑक्साइड और नाइट्रोजनी अपशिष्ट** को घोलकर ले जाता है, लवणों के साथ। **ऑक्सीजन** **लाल रुधिर कणिकाएँ** ले जाती हैं।",
        ),
      ),
      w.body(
        t(
          "To move blood around, the body needs three things: a **pump** to push it, a network of **tubes** to reach every tissue, and a way to **repair** the network if it leaks.",
          "रुधिर को घुमाने के लिए शरीर को तीन चीज़ें चाहिए: धकेलने के लिए एक **पंप**, हर ऊतक तक पहुँचने के लिए **नलियों** का जाल, और जाल में रिसाव होने पर उसकी **मरम्मत** का तरीक़ा।",
        ),
      ),
      w.note(
        t(
          "NCERT Activity 6.7: find out at a health centre the normal range of haemoglobin in children, men and women, and at a veterinary clinic for a cow or buffalo.",
          "NCERT क्रियाकलाप 6.7: किसी स्वास्थ्य केंद्र से बच्चों, पुरुषों और महिलाओं में हीमोग्लोबिन की सामान्य सीमा पता करो, और पशु चिकित्सालय से गाय या भैंस की।",
        ),
      ),
      plasma,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The heart's four chambers, step by step. */
const pump = page(
  "pump",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "NCERT Fig. 6.11, step by step: left atrium fills from the lungs, passes blood to the left ventricle, which pumps it to the body; right atrium fills from the body, passes it to the right ventricle, which pumps it to the lungs. Valves stop backflow; ventricles have thicker walls.",
    );
    const heart = b.prop(heartDef, "heart", {
      mode: HeartMode.Steps,
      step: 0,
      showNames: true,
      canStep: true,
    });
    b.studentOnly(heart.action(HeartAction.Next));
    b.studentOnly(heart.action(HeartAction.Back));
    b.studentOnly(heart.action(HeartAction.Reset));
    b.standsFor(
      heart,
      "the four chambers of the heart, stepping through how blood fills and is pumped out",
    );
    const left = choiceQuestion(b, {
      name: "left",
      prompt: t(
        "Step through all six. Where does the left ventricle pump its oxygen-rich blood?",
        "छहों कदम चलो। बायाँ निलय अपना ऑक्सीजन-भरा रुधिर कहाँ पंप करता है?",
      ),
      options: [
        { id: "right", label: t("To the rest of the body", "शरीर के बाक़ी हिस्सों में") },
        {
          id: "lungs",
          label: t("To the lungs", "फेफड़ों में"),
          feedback: t(
            "The *right* ventricle pumps blood to the lungs. The left ventricle sends oxygen-rich blood out to the body.",
            "*दायाँ* निलय रुधिर फेफड़ों में पंप करता है। बायाँ निलय ऑक्सीजन-भरा रुधिर शरीर में भेजता है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("The pump: the heart", "पंप: हृदय")),
      w.body(
        t(
          "The heart is a muscular organ about as big as your fist. Blood must carry both oxygen and carbon dioxide, so the heart has separate **chambers** to keep oxygen-rich blood from mixing with blood full of carbon dioxide.",
          "हृदय एक मांसल अंग है, लगभग तुम्हारी मुट्ठी जितना। रुधिर को ऑक्सीजन और कार्बन डाइऑक्साइड दोनों ले जानी होती हैं, इसलिए हृदय में अलग-अलग **कक्ष** हैं ताकि ऑक्सीजन-भरा रुधिर कार्बन डाइऑक्साइड वाले रुधिर से न मिले।",
        ),
      ),
      w.definition(
        t(
          "**Atria and ventricles.** The heart has four chambers: two thin-walled upper chambers that collect blood, the **atria** (one is an **atrium**), and two lower chambers that pump it out, the **ventricles**. The ventricles have **thicker muscular walls**, because they pump blood to whole organs. **Valves** stop blood flowing backwards when the chambers contract.",
          "**आलिंद और निलय।** हृदय में चार कक्ष हैं: ऊपर के दो पतली दीवार वाले कक्ष जो रुधिर इकट्ठा करते हैं, **आलिंद**, और नीचे के दो कक्ष जो उसे बाहर पंप करते हैं, **निलय**। निलयों की **मांसल दीवारें मोटी** होती हैं, क्योंकि वे पूरे अंगों तक रुधिर पंप करते हैं। कक्षों के सिकुड़ने पर **वाल्व** रुधिर को पीछे बहने से रोकते हैं।",
        ),
      ),
      w.body(
        t(
          "Blood from the lungs enters the **left** side; blood from the body enters the **right** side. Step through NCERT's six steps.",
          "फेफड़ों का रुधिर **बाईं** ओर आता है; शरीर का रुधिर **दाईं** ओर। NCERT के छह कदम चलो।",
        ),
      ),
      heart,
      w.note(
        t(
          "NCERT describes one side, then the other, to keep it clear. In a real heart both atria contract together, then both ventricles together.",
          "स्पष्टता के लिए NCERT पहले एक तरफ़, फिर दूसरी तरफ़ बताती है। असली हृदय में दोनों आलिंद एक साथ सिकुड़ते हैं, फिर दोनों निलय एक साथ।",
        ),
      ),
      left,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Double circulation; three- and two-chambered hearts. */
const double = page(
  "double",
  (b) => {
    const w = wordsOn(b);
    const loops = b.prop(heartDef, "loops", {
      mode: HeartMode.Circulation,
      step: 0,
      showNames: true,
      canStep: false,
    });
    b.standsFor(
      loops,
      "double circulation: one loop from the heart to the lungs and back, another to the body and back",
    );
    const fish = b.prop(heartDef, "fish", {
      mode: HeartMode.Fish,
      step: 0,
      showNames: true,
      canStep: false,
    });
    b.standsFor(
      fish,
      "a fish's two-chambered heart pumping blood to the gills and straight on to the body",
    );
    const separate = choiceQuestion(b, {
      name: "separate",
      prompt: t(
        "Why do birds and mammals need oxygen-rich and oxygen-poor blood kept separate?",
        "पक्षियों और स्तनधारियों में ऑक्सीजन-भरे और ऑक्सीजन-रहित रुधिर को अलग रखना क्यों ज़रूरी है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "They need a lot of energy, for example to keep their body warm, so they need a very efficient oxygen supply",
            "उन्हें बहुत ऊर्जा चाहिए, जैसे शरीर गर्म रखने के लिए, इसलिए ऑक्सीजन की बहुत कुशल आपूर्ति चाहिए",
          ),
        },
        {
          id: "size",
          label: t("Because they are bigger than fish", "क्योंकि वे मछलियों से बड़े हैं"),
          feedback: t(
            "It's about energy, not size: birds and mammals constantly use energy to keep their body temperature steady, so they need blood full of oxygen.",
            "बात ऊर्जा की है, आकार की नहीं: पक्षी और स्तनधारी शरीर का तापमान स्थिर रखने में लगातार ऊर्जा ख़र्च करते हैं, इसलिए उन्हें ऑक्सीजन से भरा रुधिर चाहिए।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Twice through the heart", "हृदय से दो बार")),
      w.definition(
        t(
          "**Double circulation.** In humans, blood passes through the heart **twice** in each round of the body: heart → lungs → heart, then heart → body → heart. This is **double circulation**. Keeping the two sides apart stops oxygen-rich and oxygen-poor blood mixing, giving a highly efficient oxygen supply.",
          "**दोहरा परिसंचरण।** मनुष्यों में शरीर के हर चक्कर में रुधिर हृदय से **दो बार** गुज़रता है: हृदय → फेफड़े → हृदय, फिर हृदय → शरीर → हृदय। यह **दोहरा परिसंचरण** है। दोनों तरफ़ अलग रखने से ऑक्सीजन-भरा और ऑक्सीजन-रहित रुधिर नहीं मिलता, जिससे ऑक्सीजन की बहुत कुशल आपूर्ति होती है।",
        ),
      ),
      loops,
      w.body(
        t(
          "This matters for animals with high energy needs, like **birds and mammals**, which constantly use energy to keep their body temperature steady. **Amphibians and many reptiles**, whose body temperature follows their surroundings, have **three-chambered** hearts and put up with some mixing. **Fish** have only **two** chambers: blood is pumped to the gills, picks up oxygen, and goes straight on to the body, passing through the heart only **once** per round.",
          "यह ऊँची ऊर्जा ज़रूरत वाले जंतुओं के लिए अहम है, जैसे **पक्षी और स्तनधारी**, जो शरीर का तापमान स्थिर रखने में लगातार ऊर्जा ख़र्च करते हैं। **उभयचर और कई सरीसृप**, जिनके शरीर का तापमान परिवेश के अनुसार बदलता है, **तीन कक्षों** वाले हृदय रखते हैं और कुछ मिलावट सह लेते हैं। **मछलियों** में केवल **दो** कक्ष हैं: रुधिर गलफड़ों तक पंप होता है, ऑक्सीजन लेता है, और सीधे शरीर में जाता है, हर चक्कर में हृदय से केवल **एक बार** गुज़रते हुए।",
        ),
      ),
      fish,
      separate,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Arteries, veins, capillaries; blood pressure. */
const vessels = page(
  "vessels",
  (b) => {
    const w = wordsOn(b);
    const tubes = b.prop(heartDef, "tubes", {
      mode: HeartMode.Vessels,
      step: 0,
      showNames: true,
      canStep: false,
    });
    b.standsFor(
      tubes,
      "an artery, a vein and capillaries side by side, showing their walls and valves",
    );
    const thick = choiceQuestion(b, {
      name: "thick",
      prompt: t(
        "Why do arteries have thick, elastic walls but veins don't?",
        "धमनियों की दीवारें मोटी और लचीली क्यों होती हैं, पर शिराओं की नहीं?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Blood leaves the heart under high pressure; in veins it is no longer under pressure",
            "रुधिर हृदय से ऊँचे दाब पर निकलता है; शिराओं में वह दाब में नहीं रहता",
          ),
        },
        {
          id: "more",
          label: t("Arteries carry more blood", "धमनियाँ ज़्यादा रुधिर ले जाती हैं"),
          feedback: t(
            "The same blood goes round. The difference is pressure: arteries take the heart's full push.",
            "वही रुधिर घूमता है। अंतर दाब का है: धमनियाँ हृदय का पूरा धक्का झेलती हैं।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("The tubes: blood vessels", "नलियाँ: रुधिर वाहिकाएँ")),
      w.definition(
        t(
          "**Arteries, veins and capillaries.** **Arteries** carry blood **away from the heart** to the organs. Blood leaves the heart under high pressure, so arteries have **thick, elastic walls**. **Veins** bring blood **back to the heart**. It's no longer under pressure, so they don't need thick walls; instead they have **valves** so blood flows only one way. In an organ, an artery divides into smaller and smaller vessels, ending in **capillaries**, whose walls are **one cell thick**. Materials pass between the blood and the cells across this thin wall. Capillaries then join up into veins.",
          "**धमनियाँ, शिराएँ और केशिकाएँ।** **धमनियाँ** रुधिर को **हृदय से दूर** अंगों तक ले जाती हैं। रुधिर हृदय से ऊँचे दाब पर निकलता है, इसलिए धमनियों की **दीवारें मोटी और लचीली** होती हैं। **शिराएँ** रुधिर को **हृदय तक वापस** लाती हैं। अब वह दाब में नहीं, इसलिए उन्हें मोटी दीवारों की ज़रूरत नहीं; इसके बजाय उनमें **वाल्व** होते हैं ताकि रुधिर एक ही दिशा में बहे। किसी अंग में धमनी छोटी-से-छोटी वाहिकाओं में बँटकर **केशिकाओं** में ख़त्म होती है, जिनकी दीवार **एक कोशिका मोटी** होती है। इसी पतली दीवार के आर-पार रुधिर और कोशिकाओं के बीच पदार्थ आते-जाते हैं। फिर केशिकाएँ जुड़कर शिराएँ बनाती हैं।",
        ),
      ),
      tubes,
      w.note(
        t(
          "**More to know: blood pressure.** The force of blood against a vessel's wall is **blood pressure**; it is much higher in arteries than in veins. When the ventricle contracts it is the **systolic** pressure, normally about 120 mm of mercury; when it relaxes, the **diastolic** pressure, about 80 mm. It is measured with a **sphygmomanometer**. High blood pressure (**hypertension**) comes from narrowed small arteries and can burst an artery, causing internal bleeding.",
          "**और जानो: रक्तचाप।** वाहिका की दीवार पर रुधिर का बल **रक्तचाप** है; यह धमनियों में शिराओं से बहुत ज़्यादा होता है। निलय के सिकुड़ने पर यह **प्रकुंचन** दाब है, सामान्यतः लगभग 120 mm पारा; उसके शिथिल होने पर **अनुशिथिलन** दाब, लगभग 80 mm। इसे **स्फिग्मोमैनोमीटर** से नापते हैं। उच्च रक्तचाप (**अतिरक्तदाब**) छोटी धमनियों के सिकुड़ने से होता है और धमनी फट सकती है, जिससे अंदरूनी रक्तस्राव होता है।",
        ),
      ),
      thick,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Platelets and lymph. */
const repair = page(
  "repair",
  (b) => {
    const w = wordsOn(b);
    const lymph = choiceQuestion(b, {
      name: "lymph",
      prompt: t(
        "Which fluid carries digested fat from the intestine and drains extra fluid back into the blood?",
        "कौन-सा द्रव आंत से पची हुई वसा ले जाता है और अतिरिक्त द्रव को वापस रुधिर में पहुँचाता है?",
      ),
      options: [
        { id: "right", label: t("Lymph", "लसीका") },
        {
          id: "plasma",
          label: t("Plasma", "प्लाज़्मा"),
          feedback: t(
            "Lymph forms from plasma that leaks out of capillaries, but it's lymph that carries absorbed fat and drains spare fluid back.",
            "लसीका केशिकाओं से रिसे प्लाज़्मा से बनती है, पर सोखी गई वसा ले जाने और अतिरिक्त द्रव लौटाने का काम लसीका करती है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Repairs, and a second fluid", "मरम्मत, और एक दूसरा द्रव")),
      w.definition(
        t(
          "**Platelets.** If a vessel is injured and leaks, blood is lost and pressure drops, making the pump less efficient. **Platelets** circulating in the blood plug such leaks by helping the blood **clot** at the injury.",
          "**प्लेटलेट्स।** अगर वाहिका चोटिल होकर रिसने लगे, तो रुधिर बहता है और दाब घटता है, जिससे पंप कम कुशल हो जाता है। रुधिर में घूमती **प्लेटलेट्स** चोट की जगह रुधिर का **थक्का** जमाने में मदद करके ऐसे रिसाव बंद करती हैं।",
        ),
      ),
      w.definition(
        t(
          "**Lymph.** Some plasma, proteins and blood cells escape through pores in capillary walls into the spaces between cells, forming **lymph** (tissue fluid). It is like plasma but colourless, with less protein. It drains into **lymphatic capillaries**, which join into larger **lymph vessels** that open into large veins. Lymph carries digested and absorbed **fat** from the intestine and drains excess fluid back into the blood.",
          "**लसीका।** कुछ प्लाज़्मा, प्रोटीन और रुधिर कोशिकाएँ केशिकाओं की दीवार के छिद्रों से कोशिकाओं के बीच के स्थानों में निकलकर **लसीका** (ऊतक द्रव) बनाती हैं। यह प्लाज़्मा जैसी पर रंगहीन होती है, कम प्रोटीन वाली। यह **लसीका केशिकाओं** में जाती है, जो जुड़कर बड़ी **लसीका वाहिकाएँ** बनाती हैं जो बड़ी शिराओं में खुलती हैं। लसीका आंत से पची और सोखी गई **वसा** ले जाती है और अतिरिक्त द्रव को वापस रुधिर में पहुँचाती है।",
        ),
      ),
      lymph,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** The pulse explained. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const wrist = b.prop(lifeSceneDef, "wrist", { scene: LifeScene.Pulse });
    b.standsFor(wrist, "Riya counting Kabir's pulse after a sprint");
    const beat = choiceQuestion(b, {
      name: "beat",
      prompt: t(
        "Each beat Riya feels in Kabir's wrist is a push of blood through an artery. Where does each push start?",
        "रिया कबीर की कलाई में जो हर धड़कन महसूस करती है, वह धमनी से रुधिर का एक धक्का है। हर धक्का कहाँ से शुरू होता है?",
      ),
      options: [
        {
          id: "right",
          label: t("The left ventricle contracting", "बाएँ निलय के सिकुड़ने से"),
        },
        {
          id: "lungs",
          label: t("The lungs breathing", "फेफड़ों के साँस लेने से"),
          feedback: t(
            "Breathing moves air, not blood. The push in an artery comes from the heart's left ventricle pumping blood to the body.",
            "साँस हवा चलाती है, रुधिर नहीं। धमनी में धक्का हृदय के बाएँ निलय से आता है जो शरीर में रुधिर पंप करता है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const faster = choiceQuestion(b, {
      name: "faster",
      prompt: t(
        "Why does his heart beat so much faster after the sprint?",
        "तेज़ दौड़ के बाद उसका दिल इतनी तेज़ी से क्यों धड़कता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "To deliver oxygen and glucose to his working muscles faster, and carry carbon dioxide away",
            "काम करती मांसपेशियों तक ऑक्सीजन और ग्लूकोज़ जल्दी पहुँचाने, और कार्बन डाइऑक्साइड दूर ले जाने के लिए",
          ),
        },
        {
          id: "scared",
          label: t("Because he is nervous", "क्योंकि वह घबराया हुआ है"),
          feedback: t(
            "His muscles are using oxygen and glucose fast. The heart speeds up so the blood delivers more, and takes away the carbon dioxide.",
            "उसकी मांसपेशियाँ ऑक्सीजन और ग्लूकोज़ तेज़ी से ख़र्च कर रही हैं। हृदय तेज़ होता है ताकि रुधिर ज़्यादा पहुँचाए, और कार्बन डाइऑक्साइड ले जाए।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const stop = w.definition(
      t(
        "**Stop 7 done.** The heart is a four-chambered double pump; arteries carry its pushes out, capillaries exchange, veins bring blood back. Every beat Riya counted was Kabir's left ventricle sending oxygen to his legs. Next stop: Grandpa's plants, which also move water and food over long distances, with no heart at all.",
        "**पड़ाव 7 पूरा।** हृदय चार कक्षों वाला दोहरा पंप है; धमनियाँ उसके धक्के बाहर ले जाती हैं, केशिकाएँ आदान-प्रदान करती हैं, शिराएँ रुधिर वापस लाती हैं। रिया ने जो हर धड़कन गिनी, वह कबीर के बाएँ निलय का उसके पैरों को ऑक्सीजन भेजना था। अगला पड़ाव: दादाजी के पौधे, जो भी पानी और भोजन लंबी दूरी तक ले जाते हैं, बिना किसी हृदय के।",
      ),
      "stop",
      { isHidden: true },
    );
    b.when(beat.on(QuestionSignal.Correct), theBoard.show(faster));
    b.when(faster.on(QuestionSignal.Correct), [theBoard.show(stop), theBoard.pass()]);
    return column([
      w.title(t("Back to the pulse", "फिर नब्ज़ पर")),
      wrist,
      beat,
      faster,
      stop,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** NCERT in-text Q1 and Exercise 11. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const parts = choiceQuestion(b, {
      name: "parts",
      prompt: t(
        "What are the components of the transport system in human beings?",
        "मनुष्यों में परिवहन तंत्र के घटक क्या हैं?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "The heart (pump), blood vessels (tubes), blood and lymph (fluids)",
            "हृदय (पंप), रुधिर वाहिकाएँ (नलियाँ), रुधिर और लसीका (द्रव)",
          ),
        },
        {
          id: "lungs",
          label: t("The lungs, nostrils and diaphragm", "फेफड़े, नासाद्वार और डायाफ़्राम"),
          feedback: t(
            "Those belong to breathing. Transport is the heart, the blood vessels, and the blood and lymph they carry.",
            "वे साँस लेने के अंग हैं। परिवहन है हृदय, रुधिर वाहिकाएँ, और उनमें बहने वाले रुधिर और लसीका।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const double = choiceQuestion(b, {
      name: "double",
      prompt: t("Describe double circulation in one line.", "दोहरे परिसंचरण को एक पंक्ति में बताओ।"),
      options: [
        {
          id: "right",
          label: t(
            "Right side pumps blood to the lungs and back to the left side, which pumps it to the body and back to the right: twice through the heart per round",
            "दायाँ भाग रुधिर फेफड़ों में भेजता है और वह बाएँ भाग में लौटता है, जो उसे शरीर में भेजता है और वह दाएँ में लौटता है: हर चक्कर में हृदय से दो बार",
          ),
        },
        {
          id: "once",
          label: t(
            "Blood goes heart → gills → body → heart, once per round",
            "रुधिर हृदय → गलफड़े → शरीर → हृदय जाता है, हर चक्कर में एक बार",
          ),
          feedback: t(
            "That's the fish's single circulation. Ours goes through the heart twice: once for the lungs, once for the body.",
            "यह मछली का एकल परिसंचरण है। हमारा रुधिर हृदय से दो बार गुज़रता है: एक बार फेफड़ों के लिए, एक बार शरीर के लिए।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ Blood: plasma carries food, carbon dioxide and wastes; red blood corpuscles carry oxygen. ✓ Heart: two atria collect, two thick-walled ventricles pump; valves stop backflow. ✓ Double circulation keeps oxygen-rich and oxygen-poor blood apart. ✓ Arteries (thick walls), veins (valves), capillaries (one cell thick); platelets clot; lymph drains. Next: transport in plants.",
        "**मिशन लॉग।** ✓ रुधिर: प्लाज़्मा भोजन, कार्बन डाइऑक्साइड और अपशिष्ट ले जाता है; लाल रुधिर कणिकाएँ ऑक्सीजन। ✓ हृदय: दो आलिंद इकट्ठा करते हैं, दो मोटी दीवार वाले निलय पंप करते हैं; वाल्व उलटा बहाव रोकते हैं। ✓ दोहरा परिसंचरण ऑक्सीजन-भरे और ऑक्सीजन-रहित रुधिर को अलग रखता है। ✓ धमनियाँ (मोटी दीवार), शिराएँ (वाल्व), केशिकाएँ (एक कोशिका मोटी); प्लेटलेट्स थक्का जमाती हैं; लसीका द्रव लौटाती है। आगे: पौधों में परिवहन।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(double.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), parts, double, log, space()]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [hook, blood, pump, double, vessels, repair, inLife, yourTurn];

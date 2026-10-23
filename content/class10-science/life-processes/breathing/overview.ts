import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  BreathingAction,
  BreathingMode,
  LifeScene,
  breathingDef,
  lifeSceneDef,
} from "@chalk/prop-life";

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** Kabir pants after the sprint. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const track = b.prop(lifeSceneDef, "track", { scene: LifeScene.FirstRun });
  b.standsFor(track, "Kabir bent over, panting, after a sprint; Riya with her stopwatch");
  return column([
    w.title(t("Panting", "हाँफना")),
    track,
    w.body(
      t(
        "Stop 5 ended on a problem: Kabir's muscles run short of oxygen in a sprint. After every hard lap he stands panting, breathing far faster and deeper than when he's sitting. \"I'm just out of shape,\" he says. Riya shakes her head. \"Your body is doing exactly what it should. It's fetching oxygen.\"",
        'पड़ाव 5 एक समस्या पर ख़त्म हुआ: तेज़ दौड़ में कबीर की मांसपेशियों में ऑक्सीजन कम पड़ जाती है। हर कड़े चक्कर के बाद वह हाँफता खड़ा रहता है, बैठे हुए की तुलना में कहीं तेज़ और गहरी साँसें लेते हुए। "मैं बस फ़िट नहीं हूँ," वह कहता है। रिया सिर हिलाती है। "तुम्हारा शरीर ठीक वही कर रहा है जो उसे करना चाहिए। ऑक्सीजन ला रहा है।"',
      ),
    ),
    w.body(
      t(
        "This stop: **how does oxygen get from the air into Kabir's blood?**",
        "इस पड़ाव का सवाल: **ऑक्सीजन हवा से कबीर के रुधिर तक कैसे पहुँचती है?**",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Water vs air: fish breathe faster (Activity 6.6). */
const water = page(
  "water",
  (b) => {
    const w = wordsOn(b);
    const fish = b.prop(breathingDef, "fish", {
      mode: BreathingMode.Fish,
      isIn: true,
      showNames: true,
      canBreathe: false,
    });
    b.standsFor(fish, "a fish taking water in through its mouth and forcing it over its gills");
    const advantage = choiceQuestion(b, {
      name: "advantage",
      prompt: t(
        "What advantage does a land animal have over a water animal in getting oxygen?",
        "ऑक्सीजन पाने में स्थलीय जंतु को जलीय जंतु पर क्या लाभ है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Air holds far more oxygen than water, so it needn't breathe as fast",
            "हवा में पानी से कहीं ज़्यादा ऑक्सीजन है, इसलिए उसे उतनी तेज़ साँस नहीं लेनी पड़ती",
          ),
        },
        {
          id: "none",
          label: t("Land animals need less oxygen", "स्थलीय जंतुओं को कम ऑक्सीजन चाहिए"),
          feedback: t(
            "Land animals often need *more* energy. The advantage is that air is rich in oxygen, while water has only a little dissolved in it.",
            "स्थलीय जंतुओं को अक्सर *ज़्यादा* ऊर्जा चाहिए। लाभ यह है कि हवा में ऑक्सीजन भरपूर है, जबकि पानी में उसकी थोड़ी ही मात्रा घुली होती है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Oxygen from water, oxygen from air", "पानी से ऑक्सीजन, हवा से ऑक्सीजन")),
      w.body(
        t(
          "Animals have different organs for taking oxygen in and getting carbon dioxide out. Land animals breathe the oxygen in the air; animals in water must use the **oxygen dissolved in water**.",
          "जंतुओं के पास ऑक्सीजन लेने और कार्बन डाइऑक्साइड निकालने के लिए अलग-अलग अंग हैं। स्थलीय जंतु हवा की ऑक्सीजन लेते हैं; पानी के जंतुओं को **पानी में घुली ऑक्सीजन** का उपयोग करना पड़ता है।",
        ),
      ),
      w.definition(
        t(
          "**Gills.** A fish takes water in through its mouth and forces it past its **gills**, behind its eyes, where the blood takes up the dissolved oxygen. Water holds much less oxygen than air, so water animals breathe much faster than land animals.",
          "**गलफड़े।** मछली मुँह से पानी अंदर लेकर उसे अपनी आँखों के पीछे के **गलफड़ों** पर से धकेलती है, जहाँ रुधिर घुली हुई ऑक्सीजन ले लेता है। पानी में हवा से बहुत कम ऑक्सीजन होती है, इसलिए जलीय जंतु स्थलीय जंतुओं से कहीं तेज़ साँस लेते हैं।",
        ),
      ),
      fish,
      w.note(
        t(
          "Try NCERT Activity 6.6: count how often a fish in an aquarium opens and closes its mouth in a minute, and compare it with your own breaths per minute.",
          "NCERT क्रियाकलाप 6.6 करो: गिनो कि एक्वेरियम की मछली एक मिनट में कितनी बार मुँह खोलती-बंद करती है, और उसकी तुलना अपनी प्रति मिनट साँसों से करो।",
        ),
      ),
      advantage,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The human respiratory system: passages, and how we breathe in. */
const chest = page(
  "chest",
  (b) => {
    const w = wordsOn(b);
    const body = b.prop(breathingDef, "body", {
      mode: BreathingMode.Chest,
      isIn: false,
      showNames: true,
      canBreathe: true,
    });
    b.studentOnly(body.action(BreathingAction.SetPhase));
    b.standsFor(
      body,
      "the human chest with nostrils, throat, lungs, ribs and diaphragm; the learner switches between breathing in and out",
    );
    b.witness(body.learner(BreathingAction.SetPhase, { in: true }));
    const inward = choiceQuestion(b, {
      name: "inward",
      prompt: t(
        "Breathe in. What makes the air rush into the lungs?",
        "साँस अंदर लो। हवा फेफड़ों में किस कारण तेज़ी से जाती है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "The ribs lift and the diaphragm flattens, so the chest gets bigger",
            "पसलियाँ ऊपर उठती हैं और डायाफ़्राम चपटा होता है, इसलिए छाती बड़ी हो जाती है",
          ),
        },
        {
          id: "push",
          label: t("The lungs pull the air in by themselves", "फेफड़े ख़ुद हवा खींचते हैं"),
          feedback: t(
            "The lungs have no muscles to pull with. The ribs and diaphragm make the chest bigger, and air is sucked in to fill the space.",
            "फेफड़ों में खींचने के लिए मांसपेशियाँ नहीं हैं। पसलियाँ और डायाफ़्राम छाती को बड़ा करते हैं, और जगह भरने को हवा अंदर खिंच आती है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("How we breathe", "हम साँस कैसे लेते हैं")),
      w.body(
        t(
          "Every breathing organ has a surface where oxygen passes in. It must be **large** (to take in enough), **very thin and delicate** (so gases cross easily), and therefore **protected inside the body**. So there must be passages to bring air to it, and a way of moving air in and out.",
          "हर श्वसन अंग में एक सतह होती है जहाँ से ऑक्सीजन अंदर जाती है। वह **बड़ी** (पर्याप्त ऑक्सीजन लेने के लिए), **बहुत पतली और नाज़ुक** (ताकि गैसें आसानी से पार हों) होनी चाहिए, और इसलिए **शरीर के अंदर सुरक्षित**। इसलिए वहाँ तक हवा ले जाने के रास्ते, और हवा को अंदर-बाहर करने का तरीक़ा चाहिए।",
        ),
      ),
      w.definition(
        t(
          "**The air passages.** Air enters through the **nostrils**, where fine **hairs** and **mucus** lining the passage filter it. It goes down the **throat**, held open by **rings of cartilage** so it doesn't collapse, into the **lungs**. There the passage branches into smaller and smaller tubes that end in tiny balloon-like sacs, the **alveoli**.",
          "**वायु मार्ग।** हवा **नासाद्वारों** से अंदर जाती है, जहाँ मार्ग में लगे महीन **बाल** और **श्लेष्मा** उसे छानते हैं। यह **गले** से नीचे जाती है, जिसे **उपास्थि के छल्ले** खुला रखते हैं ताकि वह पिचके नहीं, और **फेफड़ों** में पहुँचती है। वहाँ मार्ग छोटी-से-छोटी नलियों में बँटता है जो नन्ही ग़ुब्बारे जैसी थैलियों, **कूपिकाओं**, में ख़त्म होती हैं।",
        ),
      ),
      w.definition(
        t(
          "**Breathing in.** We lift our **ribs** and flatten our **diaphragm** (the sheet of muscle under the lungs). The chest cavity gets bigger, so air is sucked into the lungs and fills the expanded alveoli. Breathing out, they return and air is pushed out.",
          "**साँस अंदर लेना।** हम अपनी **पसलियाँ** उठाते हैं और **डायाफ़्राम** (फेफड़ों के नीचे की मांसपेशी की परत) को चपटा करते हैं। छाती की गुहा बड़ी हो जाती है, इसलिए हवा फेफड़ों में खिंचकर फैली हुई कूपिकाओं को भर देती है। साँस छोड़ते समय वे लौट आते हैं और हवा बाहर धकेली जाती है।",
        ),
      ),
      body,
      inward,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The alveoli: where the exchange happens. */
const alveoli = page(
  "alveoli",
  (b) => {
    const w = wordsOn(b);
    const sac = b.prop(breathingDef, "sac", {
      mode: BreathingMode.Alveolus,
      isIn: true,
      showNames: true,
      canBreathe: false,
    });
    b.standsFor(
      sac,
      "one alveolus wrapped in blood capillaries: oxygen passes into the blood, carbon dioxide out",
    );
    const design = choiceQuestion(b, {
      name: "design",
      prompt: t(
        "How are the alveoli designed to make the exchange of gases as efficient as possible?",
        "कूपिकाएँ गैसों के आदान-प्रदान को अधिक-से-अधिक कुशल बनाने के लिए कैसे बनी हैं?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Millions of thin-walled sacs give a huge surface, wrapped in a dense network of blood vessels",
            "करोड़ों पतली दीवार वाली थैलियाँ बहुत बड़ी सतह देती हैं, जो रुधिर वाहिकाओं के घने जाल से घिरी हैं",
          ),
        },
        {
          id: "thick",
          label: t("They have thick, strong walls", "उनकी दीवारें मोटी और मज़बूत हैं"),
          feedback: t(
            "Thick walls would slow gases down. The walls are very thin, and there are so many sacs that their surface adds up to about 80 m².",
            "मोटी दीवारें गैसों को धीमा कर देंगी। दीवारें बहुत पतली हैं, और थैलियाँ इतनी ज़्यादा हैं कि उनकी सतह मिलकर लगभग 80 m² बनती है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("The alveoli: where air meets blood", "कूपिकाएँ: जहाँ हवा रुधिर से मिलती है")),
      w.body(
        t(
          "The walls of the alveoli carry a dense network of tiny **blood vessels**. Blood brings **carbon dioxide** from the rest of the body and releases it into the alveoli, to be breathed out. **Oxygen** in the alveolar air is taken up by the blood and carried to every cell.",
          "कूपिकाओं की दीवारों पर नन्ही **रुधिर वाहिकाओं** का घना जाल होता है। रुधिर शरीर के बाक़ी हिस्सों से **कार्बन डाइऑक्साइड** लाकर कूपिकाओं में छोड़ता है, ताकि वह बाहर निकल जाए। कूपिकाओं की हवा की **ऑक्सीजन** रुधिर ले लेता है और हर कोशिका तक पहुँचाता है।",
        ),
      ),
      w.definition(
        t(
          "**Residual volume.** Even when we breathe out, the lungs always keep some air, the **residual volume**. This gives enough time for oxygen to be absorbed and carbon dioxide to be released.",
          "**अवशिष्ट आयतन।** साँस छोड़ने पर भी फेफड़ों में हमेशा कुछ हवा रहती है, **अवशिष्ट आयतन**। इससे ऑक्सीजन के सोखे जाने और कार्बन डाइऑक्साइड के निकलने के लिए पर्याप्त समय मिलता है।",
        ),
      ),
      sac,
      w.note(
        t(
          "If the surface of all your alveoli were spread out, it would cover about **80 m²**: roughly the size of a whole badminton court. Compare that with the surface of your skin.",
          "अगर तुम्हारी सारी कूपिकाओं की सतह फैलाई जाए, तो वह लगभग **80 m²** ढकेगी: लगभग एक पूरे बैडमिंटन कोर्ट जितनी। इसकी तुलना अपनी त्वचा की सतह से करो।",
        ),
      ),
      design,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Haemoglobin carries oxygen; carbon dioxide travels dissolved. */
const haemoglobin = page(
  "haemoglobin",
  (b) => {
    const w = wordsOn(b);
    const lack = choiceQuestion(b, {
      name: "lack",
      prompt: t(
        "What would happen if our bodies had too little haemoglobin?",
        "अगर हमारे शरीर में बहुत कम हीमोग्लोबिन हो तो क्या होगा?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Less oxygen would reach the cells, so they'd release less energy and we'd tire easily",
            "कोशिकाओं तक कम ऑक्सीजन पहुँचेगी, इसलिए वे कम ऊर्जा निकालेंगी और हम जल्दी थकेंगे",
          ),
        },
        {
          id: "co2",
          label: t(
            "We couldn't get rid of carbon dioxide at all",
            "हम कार्बन डाइऑक्साइड बिल्कुल नहीं निकाल पाएँगे",
          ),
          feedback: t(
            "Carbon dioxide travels mostly dissolved in the blood. Haemoglobin's job is carrying oxygen, so less of it means less oxygen for the cells.",
            "कार्बन डाइऑक्साइड ज़्यादातर रुधिर में घुलकर जाती है। हीमोग्लोबिन का काम ऑक्सीजन ले जाना है, इसलिए इसकी कमी का मतलब है कोशिकाओं के लिए कम ऑक्सीजन।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Haemoglobin: the oxygen carrier", "हीमोग्लोबिन: ऑक्सीजन का वाहक")),
      w.body(
        t(
          "In a large animal, diffusion alone can't deliver oxygen to every part of the body. If it had to, an oxygen molecule would take about **three years** to get from our lungs to our toes.",
          "बड़े जंतु में अकेला विसरण शरीर के हर हिस्से तक ऑक्सीजन नहीं पहुँचा सकता। अगर ऐसा करना पड़े, तो ऑक्सीजन के एक अणु को हमारे फेफड़ों से पैर की उँगलियों तक पहुँचने में लगभग **तीन साल** लगेंगे।",
        ),
      ),
      w.definition(
        t(
          "**Haemoglobin.** Instead, a **respiratory pigment** picks up oxygen in the lungs and carries it to the tissues that need it. In humans this pigment is **haemoglobin**, which holds on to oxygen very strongly. It is in the **red blood corpuscles** (red blood cells). **Carbon dioxide** dissolves in water more easily than oxygen, so it is mostly carried **dissolved** in the blood.",
          "**हीमोग्लोबिन।** इसके बजाय एक **श्वसन वर्णक** फेफड़ों में ऑक्सीजन उठाता है और उसे ज़रूरतमंद ऊतकों तक ले जाता है। मनुष्यों में यह वर्णक **हीमोग्लोबिन** है, जो ऑक्सीजन को बहुत मज़बूती से पकड़ता है। यह **लाल रुधिर कणिकाओं** (लाल रक्त कोशिकाओं) में होता है। **कार्बन डाइऑक्साइड** पानी में ऑक्सीजन से ज़्यादा आसानी से घुलती है, इसलिए वह ज़्यादातर रुधिर में **घुलकर** जाती है।",
        ),
      ),
      lack,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Tobacco and smoking. */
const tobacco = page(
  "tobacco",
  (b) => {
    const w = wordsOn(b);
    const cilia = choiceQuestion(b, {
      name: "cilia",
      prompt: t(
        "How does smoking let germs and dust reach the lungs?",
        "धूम्रपान से रोगाणु और धूल फेफड़ों तक कैसे पहुँच जाते हैं?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "It destroys the tiny hairs (cilia) in the air passages that sweep them out",
            "यह वायु मार्ग के उन नन्हे बालों (पक्ष्माभों) को नष्ट कर देता है जो उन्हें बाहर बुहारते हैं",
          ),
        },
        {
          id: "wide",
          label: t("It widens the nostrils", "यह नासाद्वारों को चौड़ा कर देता है"),
          feedback: t(
            "The damage is to the cilia lining the upper air passages: without them, germs, dust and smoke get into the lungs.",
            "नुकसान ऊपरी वायु मार्ग की परत के पक्ष्माभों का होता है: उनके बिना रोगाणु, धूल और धुआँ फेफड़ों में पहुँच जाते हैं।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Protecting the lungs", "फेफड़ों की रक्षा")),
      w.body(
        t(
          "The upper part of the air passage is lined with tiny hair-like **cilia** that help remove germs, dust and other harmful particles from the air we breathe in. **Smoking destroys these hairs**, so germs, dust, smoke and harmful chemicals get into the lungs and cause infection, cough and even **lung cancer**, one of the commonest causes of death in the world.",
          "वायु मार्ग का ऊपरी भाग नन्हे बाल जैसे **पक्ष्माभों** से ढका है जो साँस में आई हवा से रोगाणु, धूल और दूसरे हानिकारक कण हटाने में मदद करते हैं। **धूम्रपान इन बालों को नष्ट कर देता है**, जिससे रोगाणु, धूल, धुआँ और हानिकारक रसायन फेफड़ों में पहुँचकर संक्रमण, खाँसी और **फेफड़ों का कैंसर** तक पैदा करते हैं, जो दुनिया में मृत्यु के सबसे आम कारणों में से एक है।",
        ),
      ),
      w.note(
        t(
          "**More to know.** Tobacco in any form, cigars, cigarettes, bidis, hookah, gutkha, is harmful. It most commonly affects the tongue, lungs, heart and liver. Smokeless tobacco is also a major risk for heart attacks, strokes, lung diseases and several cancers; chewing gutkha causes much of India's oral cancer. Just say NO to tobacco.",
          "**और जानो।** किसी भी रूप में तंबाकू, सिगार, सिगरेट, बीड़ी, हुक्का, गुटखा, हानिकारक है। यह सबसे ज़्यादा जीभ, फेफड़ों, हृदय और यकृत पर असर डालता है। धुआँ-रहित तंबाकू भी दिल के दौरे, स्ट्रोक, फेफड़ों के रोगों और कई कैंसरों का बड़ा ख़तरा है; गुटखा चबाने से भारत में मुँह का बहुत सा कैंसर होता है। तंबाकू को बस ना कहो।",
        ),
      ),
      cilia,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** Panting explained. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const track = b.prop(lifeSceneDef, "track", { scene: LifeScene.FirstRun });
    b.standsFor(track, "Kabir panting after a sprint");
    const pant = choiceQuestion(b, {
      name: "pant",
      prompt: t(
        "So why does Kabir pant, fast and deep, after a sprint?",
        "तो तेज़ दौड़ के बाद कबीर तेज़ और गहरी साँसें क्यों लेता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "To bring more air to his alveoli, so more oxygen gets into his blood for his muscles",
            "अपनी कूपिकाओं तक ज़्यादा हवा लाने के लिए, ताकि उसकी मांसपेशियों के लिए रुधिर में ज़्यादा ऑक्सीजन जाए",
          ),
        },
        {
          id: "cool",
          label: t("To cool his lungs down", "अपने फेफड़ों को ठंडा करने के लिए"),
          feedback: t(
            "His working muscles need oxygen fast. Faster, deeper breaths change the air in the alveoli more often, so the blood can pick up more oxygen.",
            "उसकी काम करती मांसपेशियों को जल्दी ऑक्सीजन चाहिए। तेज़, गहरी साँसें कूपिकाओं की हवा बार-बार बदलती हैं, ताकि रुधिर ज़्यादा ऑक्सीजन ले सके।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const stop = w.definition(
      t(
        "**Stop 6 done.** Air comes in through filtered passages to the alveoli, a huge, thin surface where oxygen enters the blood and carbon dioxide leaves; haemoglobin carries the oxygen away. Kabir pants to speed this up. But who carries the blood from the lungs to his legs? Next stop: the heart.",
        "**पड़ाव 6 पूरा।** हवा छनकर मार्गों से कूपिकाओं तक आती है, एक विशाल, पतली सतह जहाँ ऑक्सीजन रुधिर में जाती है और कार्बन डाइऑक्साइड निकलती है; हीमोग्लोबिन ऑक्सीजन को आगे ले जाता है। कबीर इसे तेज़ करने को हाँफता है। पर रुधिर को फेफड़ों से उसके पैरों तक ले कौन जाता है? अगला पड़ाव: हृदय।",
      ),
      "stop",
      { isHidden: true },
    );
    b.when(pant.on(QuestionSignal.Correct), [theBoard.show(stop), theBoard.pass()]);
    return column([w.title(t("Back on the track", "फिर ट्रैक पर")), track, pant, stop, space()]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** NCERT in-text Q3 and Q4. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const carried = choiceQuestion(b, {
      name: "carried",
      prompt: t(
        "How are oxygen and carbon dioxide transported in human beings?",
        "मनुष्यों में ऑक्सीजन और कार्बन डाइऑक्साइड का परिवहन कैसे होता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Oxygen by haemoglobin in red blood corpuscles; carbon dioxide mostly dissolved in the blood",
            "ऑक्सीजन लाल रुधिर कणिकाओं के हीमोग्लोबिन द्वारा; कार्बन डाइऑक्साइड ज़्यादातर रुधिर में घुलकर",
          ),
        },
        {
          id: "swap",
          label: t(
            "Carbon dioxide by haemoglobin; oxygen dissolved in the blood",
            "कार्बन डाइऑक्साइड हीमोग्लोबिन द्वारा; ऑक्सीजन रुधिर में घुलकर",
          ),
          feedback: t(
            "The other way round: haemoglobin holds oxygen, and carbon dioxide, being more soluble in water, travels dissolved.",
            "उलटा है: हीमोग्लोबिन ऑक्सीजन पकड़ता है, और कार्बन डाइऑक्साइड, पानी में ज़्यादा घुलनशील होने से, घुलकर जाती है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const area = choiceQuestion(b, {
      name: "area",
      prompt: t(
        "How are the lungs designed to make the area for gas exchange as big as possible?",
        "फेफड़े गैस विनिमय का क्षेत्रफल अधिक-से-अधिक करने के लिए कैसे बने हैं?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Tubes branch into smaller and smaller tubes ending in millions of alveoli",
            "नलियाँ छोटी-से-छोटी नलियों में बँटती हैं जो करोड़ों कूपिकाओं में ख़त्म होती हैं",
          ),
        },
        {
          id: "one",
          label: t("Each lung is one big hollow bag", "हर फेफड़ा एक बड़ा खोखला थैला है"),
          feedback: t(
            "One big bag has little surface. Splitting the air into millions of tiny sacs multiplies the surface hugely.",
            "एक बड़े थैले की सतह कम होती है। हवा को करोड़ों नन्ही थैलियों में बाँटने से सतह बहुत बढ़ जाती है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ Water animals breathe faster than land animals: water holds less oxygen. ✓ Air: nostrils (hairs, mucus) → throat (cartilage rings) → lungs → alveoli. ✓ Ribs lift and diaphragm flattens to breathe in. ✓ Haemoglobin carries oxygen; carbon dioxide travels dissolved. ✓ Smoking destroys the cilia. Next: the heart.",
        "**मिशन लॉग।** ✓ जलीय जंतु स्थलीय जंतुओं से तेज़ साँस लेते हैं: पानी में कम ऑक्सीजन है। ✓ हवा: नासाद्वार (बाल, श्लेष्मा) → गला (उपास्थि के छल्ले) → फेफड़े → कूपिकाएँ। ✓ साँस लेने के लिए पसलियाँ उठती हैं और डायाफ़्राम चपटा होता है। ✓ हीमोग्लोबिन ऑक्सीजन ले जाता है; कार्बन डाइऑक्साइड घुलकर जाती है। ✓ धूम्रपान पक्ष्माभों को नष्ट करता है। आगे: हृदय।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(area.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), carried, area, log, space()]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [hook, water, chest, alveoli, haemoglobin, tobacco, inLife, yourTurn];

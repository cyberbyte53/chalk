import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, goalQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  Bin,
  Cup,
  CupAction,
  EnvScene,
  SortAction,
  SortDerived,
  WasteItem,
  cupChoiceDef,
  environmentSceneDef,
  wasteSorterDef,
} from "@chalk/prop-environment";

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** The garbage heap at the end of the lane. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const heap = b.prop(environmentSceneDef, "heap", { scene: EnvScene.GarbageHeap });
  b.standsFor(
    heap,
    "the family's overflowing bin: peels, paper, packets and an old slipper spilling out, Kabir beside it",
  );
  return column([
    w.title(t("The heap at the end of the lane", "गली के आख़िर का ढेर")),
    heap,
    w.body(
      t(
        "At the end of the lane there's a heap where everyone's garbage ends up, and the family's bin is always overflowing. Kabir weighs the family's bin: almost 2 kg in one day. To win the challenge it has to be 1 kg by the end of the week.",
        "गली के आख़िर में एक ढेर है जहाँ सबका कचरा पहुँचता है, और परिवार का कूड़ेदान हमेशा भरा रहता है। कबीर परिवार का कूड़ेदान तौलता है: एक दिन में लगभग 2 kg। चुनौती जीतने के लिए हफ़्ते के आख़िर तक इसे 1 kg होना है।",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Why there is more waste now. */
const more = page(
  "more",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "packaging",
      prompt: t(
        "According to NCERT, why is so much of our waste non-biodegradable today?",
        "NCERT के अनुसार, आज हमारा इतना कचरा जैव अनिम्नीकरणीय क्यों है?",
      ),
      options: [
        {
          id: "right",
          label: t("Packaging has changed to plastics", "पैकेजिंग प्लास्टिक में बदल गई है"),
        },
        {
          id: "food",
          label: t("We now eat far more food than before", "हम अब पहले से बहुत ज़्यादा खाते हैं"),
          feedback: t(
            "Food waste is biodegradable. The non-biodegradable part comes from packaging and disposables.",
            "भोजन का कचरा जैव निम्नीकरणीय है। जैव अनिम्नीकरणीय हिस्सा पैकेजिंग और एक बार की चीज़ों से आता है।",
          ),
        },
        {
          id: "decomposers",
          label: t("Decomposers have become less active", "अपघटक कम सक्रिय हो गए हैं"),
          feedback: t(
            "Decomposers work as before. They just can't act on plastics.",
            "अपघटक पहले जैसे ही काम करते हैं। वे बस प्लास्टिक पर काम नहीं कर सकते।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Why there's more garbage", "कचरा ज़्यादा क्यों है")),
      w.body(
        t(
          "Better lifestyles mean more things bought, and more thrown away. Our attitude has changed too: more and more things are **disposable**, used once and thrown. And changes in **packaging** mean much of our waste is now non-biodegradable.",
          "बेहतर जीवन-शैली का मतलब है ज़्यादा चीज़ें ख़रीदना, और ज़्यादा फेंकना। हमारा नज़रिया भी बदला है: ज़्यादा-से-ज़्यादा चीज़ें **एक बार इस्तेमाल** वाली हैं, इस्तेमाल करो और फेंको। और **पैकेजिंग** में बदलाव से हमारा बहुत सा कचरा अब जैव अनिम्नीकरणीय है।",
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Segregation: sort a bin into wet and dry. */
const sort = page(
  "sort",
  (b) => {
    const w = wordsOn(b);
    const bin = b.prop(wasteSorterDef, "bin", {
      items: [
        WasteItem.Peels,
        WasteItem.MilkPacket,
        WasteItem.Paper,
        WasteItem.Wrapper,
        WasteItem.TeaLeaves,
        WasteItem.GlassBottle,
        WasteItem.Cloth,
        WasteItem.Battery,
      ],
      placed: [],
    });
    b.studentOnly(bin.action(SortAction.Put));
    b.studentOnly(bin.action(SortAction.Reset));
    b.standsFor(
      bin,
      "a day's household waste, one thing at a time, to put in the biodegradable or the non-biodegradable bin",
    );
    const goal = goalQuestion(b, {
      about: bin,
      prompt: t(
        "Sort the whole day's waste into the right bins.",
        "पूरे दिन का कचरा सही कूड़ेदानों में छाँटो।",
      ),
      isMet: bin.derived(SortDerived.AllRight),
      solve: [
        bin.learner(SortAction.Put, { bin: Bin.Bio }),
        bin.learner(SortAction.Put, { bin: Bin.NonBio }),
        bin.learner(SortAction.Put, { bin: Bin.Bio }),
        bin.learner(SortAction.Put, { bin: Bin.NonBio }),
        bin.learner(SortAction.Put, { bin: Bin.Bio }),
        bin.learner(SortAction.Put, { bin: Bin.NonBio }),
        bin.learner(SortAction.Put, { bin: Bin.Bio }),
        bin.learner(SortAction.Put, { bin: Bin.NonBio }),
      ],
    });
    return column([
      w.title(t("Two bins", "दो कूड़ेदान")),
      w.definition(
        t(
          "**Segregation.** Keeping biodegradable and non-biodegradable waste apart from the start is **segregation**. Then the biodegradable part can be composted, and the rest can be recycled or disposed of safely.",
          "**पृथक्करण।** जैव निम्नीकरणीय और जैव अनिम्नीकरणीय कचरे को शुरू से अलग रखना **पृथक्करण** है। तब जैव निम्नीकरणीय हिस्से की खाद बन सकती है, और बाकी को पुनर्चक्रित या सुरक्षित रूप से निपटाया जा सकता है।",
        ),
      ),
      bin,
      goal,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Local bodies, sewage and industry (Activities 15.7–15.8). */
const local = page(
  "local",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "sewage",
      prompt: t(
        "Activity 15.8: what should happen to sewage before it reaches a river or lake?",
        "क्रियाकलाप 15.8: नदी या झील तक पहुँचने से पहले सीवेज के साथ क्या होना चाहिए?",
      ),
      options: [
        { id: "right", label: t("It should be treated first", "पहले उसका उपचार होना चाहिए") },
        {
          id: "dilute",
          label: t("It should be mixed with more water", "उसे और पानी में मिलाना चाहिए"),
          feedback: t(
            "Diluting it doesn't remove what pollutes the water. It needs to be treated.",
            "पतला करने से प्रदूषण नहीं हटता। उसका उपचार ज़रूरी है।",
          ),
        },
        {
          id: "bury",
          label: t("It should be poured into the soil", "उसे मिट्टी में डाल देना चाहिए"),
          feedback: t(
            "Untreated sewage pollutes soil too. It must be treated first.",
            "बिना उपचार का सीवेज मिट्टी को भी प्रदूषित करता है। पहले उसका उपचार ज़रूरी है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Who deals with it", "इसे कौन संभालता है")),
      w.body(
        t(
          "NCERT Activities 15.7 and 15.8: find out what happens to your home's waste. Does the local body (panchayat, municipal corporation or resident welfare association) collect biodegradable and non-biodegradable waste separately? How is the sewage in your area treated, and how do local industries treat their waste so the soil and water aren't polluted?",
          "NCERT क्रियाकलाप 15.7 और 15.8: पता करो कि तुम्हारे घर के कचरे का क्या होता है। क्या स्थानीय निकाय (पंचायत, नगर निगम या निवासी कल्याण संघ) जैव निम्नीकरणीय और जैव अनिम्नीकरणीय कचरा अलग-अलग इकट्ठा करता है? तुम्हारे इलाक़े में सीवेज का उपचार कैसे होता है, और स्थानीय उद्योग अपने कचरे का उपचार कैसे करते हैं ताकि मिट्टी और पानी प्रदूषित न हों?",
        ),
      ),
      w.body(
        t(
          "Sewage carries germs and harmful substances. It must be **treated** at a sewage plant before it is let into a river or lake: just adding more water doesn't clean it.",
          "सीवेज में रोगाणु और हानिकारक पदार्थ होते हैं। नदी या झील में छोड़ने से पहले उसे सीवेज प्लांट में **उपचारित** करना ज़रूरी है: बस और पानी मिलाने से वह साफ़ नहीं होता।",
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Think it over: disposable cups in trains. */
const cups = page(
  "cups",
  (b) => {
    const w = wordsOn(b);
    const train = b.prop(environmentSceneDef, "train", { scene: EnvScene.TrainChai });
    b.standsFor(
      train,
      "a train compartment: a tea vendor pouring chai, Grandpa remembering the old cups",
    );
    const table = b.prop(cupChoiceDef, "table", { selected: null, showAll: false });
    b.studentOnly(table.action(CupAction.Pick));
    b.studentOnly(table.action(CupAction.Clear));
    b.standsFor(
      table,
      "the four kinds of train tea cup in turn (returnable plastic, disposable plastic, kulhad, paper), each with what it costs the environment",
    );
    const ask = choiceQuestion(b, {
      name: "kulhad",
      prompt: t(
        "Tap the kulhad. Why were clay kulhads not a good answer on a large scale?",
        "कुल्हड़ पर टैप करो। बड़े पैमाने पर मिट्टी के कुल्हड़ अच्छा उपाय क्यों नहीं थे?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Making millions uses up fertile topsoil",
            "लाखों बनाने में उपजाऊ ऊपरी मिट्टी ख़त्म होती",
          ),
        },
        {
          id: "rot",
          label: t("Broken kulhads never break down at all", "टूटे कुल्हड़ कभी टूटते-घुलते नहीं"),
          feedback: t(
            "Clay goes back to soil. The problem is the fertile topsoil used to make them.",
            "मिट्टी फिर मिट्टी में मिल जाती है। समस्या उन्हें बनाने में लगी उपजाऊ ऊपरी मिट्टी है।",
          ),
        },
        {
          id: "hygiene",
          label: t("Tea in clay cups is never hygienic", "मिट्टी के कप में चाय स्वच्छ नहीं"),
          feedback: t(
            "Used once, a kulhad is hygienic. The cost is the topsoil they're made from.",
            "एक बार इस्तेमाल हो तो कुल्हड़ स्वच्छ है। क़ीमत वह ऊपरी मिट्टी है जिससे वे बनते हैं।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Tea on the train", "ट्रेन की चाय")),
      train,
      w.body(
        t(
          "Grandpa remembers tea on trains in plastic glasses you gave back to the vendor. Then came disposable cups, praised for hygiene, and nobody thought about millions thrown away every day. Clay kulhads were suggested next. Now it's paper cups.",
          "दादाजी को याद है कि ट्रेन में चाय प्लास्टिक के गिलासों में मिलती थी जिन्हें विक्रेता को लौटाना होता था। फिर एक बार वाले कप आए, स्वच्छता के लिए सराहे गए, और किसी ने रोज़ फेंके जाने वाले लाखों कपों के बारे में नहीं सोचा। उसके बाद मिट्टी के कुल्हड़ सुझाए गए। अब काग़ज़ के कप हैं।",
        ),
      ),
      table,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Activity 15.9: e-waste and recycling. */
const ewaste = page(
  "ewaste",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "recycle",
      prompt: t(
        "Does recycling plastic have any impact on the environment?",
        "क्या प्लास्टिक के पुनर्चक्रण का पर्यावरण पर कोई असर होता है?",
      ),
      options: [
        {
          id: "right",
          label: t("Yes: it uses energy and can pollute", "हाँ: इसमें ऊर्जा लगती है और प्रदूषण हो सकता है"),
        },
        {
          id: "none",
          label: t("No: recycling has no effect at all", "नहीं: पुनर्चक्रण का कोई असर नहीं होता"),
          feedback: t(
            "Recycling is better than dumping, but it isn't free: it uses energy and can pollute.",
            "पुनर्चक्रण फेंकने से बेहतर है, पर मुफ़्त नहीं: इसमें ऊर्जा लगती है और प्रदूषण हो सकता है।",
          ),
        },
        {
          id: "decomposer",
          label: t("Yes: it feeds bacteria in the soil", "हाँ: इससे मिट्टी के जीवाणुओं को भोजन मिलता है"),
          feedback: t(
            "Plastic can't be broken down by bacteria. Recycling is done in factories, using energy.",
            "प्लास्टिक को जीवाणु नहीं तोड़ सकते। पुनर्चक्रण कारख़ानों में होता है, ऊर्जा लगाकर।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Old phones and recycling", "पुराने फ़ोन और पुनर्चक्रण")),
      w.body(
        t(
          "NCERT Activity 15.9: old electronic items (**e-waste**) contain hazardous materials that have to be handled carefully when they're thrown away, or they harm the environment. And plastics can be recycled, but the recycling itself has an impact too.",
          "NCERT क्रियाकलाप 15.9: पुरानी इलेक्ट्रॉनिक चीज़ों (**ई-कचरा**) में ख़तरनाक पदार्थ होते हैं जिन्हें फेंकते समय सावधानी से संभालना होता है, वरना वे पर्यावरण को नुकसान पहुँचाते हैं। और प्लास्टिक पुनर्चक्रित हो सकता है, पर पुनर्चक्रण का भी असर होता है।",
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

/** The family's week: cloth bags, a compost pit, segregated bins. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const bag = b.prop(environmentSceneDef, "bag", { scene: EnvScene.ClothBag });
    b.standsFor(bag, "Mom at the vegetable cart with a cloth bag, refusing a plastic one");
    const ask = choiceQuestion(b, {
      name: "ex3",
      prompt: t(
        "Exercise 3: which of these are environment-friendly practices?",
        "अभ्यास 3: इनमें से कौन-सी पर्यावरण-अनुकूल आदतें हैं?",
      ),
      options: [
        {
          id: "bags",
          label: t("Carrying cloth bags to the shops", "दुकान पर कपड़े के थैले ले जाना"),
          feedback: t(
            "Yes, but so are the others: switching off fans and lights saves energy, and walking saves fuel.",
            "हाँ, पर बाकी भी हैं: पंखे और बत्तियाँ बंद करने से ऊर्जा बचती है, और पैदल चलने से ईंधन।",
          ),
        },
        {
          id: "lights",
          label: t("Switching off unneeded lights", "बेकार की बत्तियाँ बंद करना"),
          feedback: t(
            "Yes, but so are the others: cloth bags cut plastic waste, and walking saves fuel.",
            "हाँ, पर बाकी भी हैं: कपड़े के थैलों से प्लास्टिक कचरा घटता है, और पैदल चलने से ईंधन बचता है।",
          ),
        },
        {
          id: "walk",
          label: t("Walking to school, not the scooter", "स्कूटर की बजाय पैदल स्कूल जाना"),
          feedback: t(
            "Yes, but so are the others: cloth bags cut plastic, and switching things off saves energy.",
            "हाँ, पर बाकी भी हैं: कपड़े के थैलों से प्लास्टिक घटता है, और चीज़ें बंद करने से ऊर्जा बचती है।",
          ),
        },
        {
          id: "right",
          label: t("All of these", "ये सभी"),
        },
      ],
      answer: "right",
      keepOrder: true,
      passes: false,
    });
    const then = w.body(
      t(
        "The family's week: Mom takes cloth bags to the market, Grandpa's compost pit takes every peel and tea leaf, and the dry waste goes out separately. On Sunday the bin weighs 0.9 kg.",
        "परिवार का हफ़्ता: मम्मी बाज़ार कपड़े के थैले ले जाती हैं, दादाजी के खाद के गड्ढे में हर छिलका और चाय पत्ती जाती है, और सूखा कचरा अलग से जाता है। रविवार को कूड़ेदान का वज़न 0.9 kg है।",
      ),
      "then",
      { isHidden: true },
    );
    b.when(ask.on(QuestionSignal.Correct), [theBoard.show(then), theBoard.pass()]);
    return column([w.title(t("The family's week", "परिवार का हफ़्ता")), bag, ask, then, space()]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Exercises 7, 8 and in-text Q2. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const ex8 = choiceQuestion(b, {
      name: "ex8",
      prompt: t(
        "Exercise 8: if all our waste were biodegradable, would it have no impact on the environment?",
        "अभ्यास 8: अगर हमारा सारा कचरा जैव निम्नीकरणीय होता, तो क्या पर्यावरण पर कोई असर नहीं होता?",
      ),
      options: [
        {
          id: "right",
          label: t("It would: heaps would rot and spread germs", "होता: ढेर सड़ते और रोगाणु फैलाते"),
        },
        {
          id: "none",
          label: t("None: decomposers would handle it all", "कोई नहीं: अपघटक सब संभाल लेते"),
          feedback: t(
            "Decomposers take time. Huge heaps would rot, smell and breed flies and germs meanwhile.",
            "अपघटकों को समय लगता है। तब तक बड़े ढेर सड़ते, बदबू देते और मक्खियाँ व रोगाणु पैदा करते।",
          ),
        },
        {
          id: "soil",
          label: t("None: it would all just turn back into soil", "कोई नहीं: सब बस मिट्टी बन जाता"),
          feedback: t(
            "Eventually, yes, but piled-up waste smells and spreads disease while it rots.",
            "आख़िरकार हाँ, पर जमा कचरा सड़ते समय बदबू देता है और रोग फैलाता है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const q2 = choiceQuestion(b, {
      name: "q2",
      prompt: t(
        "Which of these helps reduce the problem of waste disposal?",
        "इनमें से कौन-सी बात कचरा निपटान की समस्या कम करने में मदद करती है?",
      ),
      options: [
        {
          id: "right",
          label: t("Segregating waste and composting peels", "कचरा अलग करना और छिलकों की खाद बनाना"),
        },
        {
          id: "burn",
          label: t("Burning all the plastic out in the lane", "गली में सारा प्लास्टिक जला देना"),
          feedback: t(
            "Burning plastic pollutes the air. Segregating and composting cut waste safely.",
            "प्लास्टिक जलाने से हवा प्रदूषित होती है। अलग करना और खाद बनाना कचरा सुरक्षित रूप से घटाते हैं।",
          ),
        },
        {
          id: "bury",
          label: t("Burying plastic bags deep in the soil", "प्लास्टिक की थैलियाँ मिट्टी में गहरा दबाना"),
          feedback: t(
            "Buried plastic just stays there: the pit showed that. Using less of it helps.",
            "दबाया गया प्लास्टिक बस वहीं रहता है: गड्ढे ने यही दिखाया। इसे कम इस्तेमाल करना मदद करता है।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    b.when(ex8.on(QuestionSignal.Correct), theBoard.show(q2));
    b.when(q2.on(QuestionSignal.Correct), theBoard.pass());
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), ex8, q2, space()]);
  },
  { passOn: PassOn.Rules },
);

/** Environment Day: every stop recapped. */
const finale = page("finale", (b) => {
  const w = wordsOn(b);
  const day = b.prop(environmentSceneDef, "day", { scene: EnvScene.EnvironmentDay });
  b.standsFor(
    day,
    "Environment Day at school: Kabir holding up the clear jar, the family's half-empty bin beside him",
  );
  return column([
    w.title(t("Environment Day", "पर्यावरण दिवस")),
    day,
    w.body(
      t(
        "Day 30. The jar is clear, the weed is green, the snails are busy and both fish are fine. The bin is half as full. Kabir stands up in front of the eco-club and explains every stop.",
        "दिन 30। जार साफ़ है, खरपतवार हरा है, घोंघे व्यस्त हैं और दोनों मछलियाँ ठीक हैं। कूड़ेदान आधा भरा है। कबीर इको-क्लब के सामने खड़ा होकर हर पड़ाव समझाता है।",
      ),
    ),
    w.definition(
      t(
        "**Mission complete.** (1) An **ecosystem** is living and non-living parts acting together: producers, consumers and decomposers. (2) **Food chains** and **webs**, with trophic levels. (3) Energy flows **one way**, and only about **10%** passes up each level. (4) Non-degradable chemicals build up along the chain: **biological magnification**. (5) The **ozone layer** shields us from UV, and CFCs thin it. (6) Waste is **biodegradable** or **non-biodegradable**. (7) Use less, segregate, compost and recycle.",
        "**मिशन पूरा।** (1) **पारितंत्र** जीवित और निर्जीव हिस्सों का साथ है: उत्पादक, उपभोक्ता और अपघटक। (2) **आहार श्रृंखला** और **जाल**, पोषी स्तरों के साथ। (3) ऊर्जा **एक ही दिशा** में बहती है, और हर स्तर पर केवल लगभग **10%** ऊपर जाती है। (4) अनिम्नीकरणीय रसायन श्रृंखला में ऊपर जमा होते हैं: **जैव आवर्धन**। (5) **ओज़ोन परत** हमें UV से बचाती है, और CFC उसे पतला करते हैं। (6) कचरा **जैव निम्नीकरणीय** या **जैव अनिम्नीकरणीय** होता है। (7) कम इस्तेमाल करो, अलग करो, खाद बनाओ और पुनर्चक्रण करो।",
      ),
    ),
    space(),
  ]);
});

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [hook, more, sort, local, cups, ewaste, inLife, yourTurn, finale];

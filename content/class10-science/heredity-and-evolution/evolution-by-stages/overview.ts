import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import { HeredityScene, heredityStoryDef } from "@chalk/prop-heredity";

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** The vegetable bag: five vegetables, one ancestor. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const cabbage = b.prop(heredityStoryDef, "cabbage", { scene: HeredityScene.WildCabbage });
  b.standsFor(
    cabbage,
    "a wild cabbage plant in the middle, with cabbage, broccoli, cauliflower, kohlrabi and kale around it",
  );
  return column([
    w.title(t("Five vegetables, one plant", "पाँच सब्ज़ियाँ, एक पौधा")),
    cabbage,
    w.body(
      t(
        '**Stop 9, the last.** Last time: shared characteristics and fossils let us trace the family tree of life. Kabir has a doubt. "An eye is so complicated. One small DNA change couldn\'t make an eye. So how could it ever evolve?"',
        '**पड़ाव 9, आख़िरी।** पिछली बार: साझी विशेषताएँ और जीवाश्म हमें जीवन का वंश-वृक्ष खोजने देते हैं। कबीर को शक है। "आँख इतनी जटिल है। DNA का एक छोटा बदलाव आँख नहीं बना सकता। तो वह कभी विकसित कैसे हुई?"',
      ),
    ),
    w.body(
      t(
        'Grandpa empties his market bag: cabbage, broccoli, cauliflower, kohlrabi, kale. "Would you believe all five came from one wild plant? Farmers did it, a little at a time." This lesson looks at evolution in stages, and at where we humans fit.',
        'दादाजी अपना बाज़ार का थैला खाली करते हैं: पत्तागोभी, ब्रोकली, फूलगोभी, गाँठगोभी, केल। "मानोगे कि ये पाँचों एक जंगली पौधे से आईं? किसानों ने यह किया, थोड़ा-थोड़ा करके।" यह पाठ चरणों में विकास को, और हम मनुष्यों की जगह को देखता है।',
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Complex organs bit by bit: eye-spots; feathers for warmth, then flight. */
const stages = page(
  "stages",
  (b) => {
    const w = wordsOn(b);
    const useful = choiceQuestion(b, {
      name: "useful",
      prompt: t(
        "How can a complicated organ like the eye be built up by natural selection, step by step?",
        "आँख जैसा जटिल अंग प्राकृतिक वरण से, कदम-दर-कदम, कैसे बन सकता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Even a simple stage, like an eye-spot that detects light, is useful enough to be selected",
            "एक सरल चरण भी, जैसे प्रकाश पहचानने वाला नेत्र-बिंदु, वरण होने लायक़ काम का है",
          ),
        },
        {
          id: "once",
          label: t(
            "It must appear all at once from one DNA change",
            "उसे एक DNA बदलाव से एक साथ बनना होगा",
          ),
          feedback: t(
            "That's the puzzle NCERT answers: it needn't. Each intermediate stage can give some advantage, so each can be selected.",
            "यही वह पहेली है जिसका उत्तर NCERT देता है: ज़रूरी नहीं। हर बीच का चरण कुछ लाभ दे सकता है, इसलिए हर एक का वरण हो सकता है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Evolution in stages", "चरणों में विकास")),
      w.body(
        t(
          'If complicated organs like the eye are selected for the advantage they give, they can\'t come from one DNA change. They must be built bit by bit over generations. But how can each in-between stage be selected? Because **even an intermediate stage can be useful**. The flatworm *Planaria* has very simple "eyes": just **eye-spots** that detect light. That alone helps it, enough to give a fitness advantage.',
          'अगर आँख जैसे जटिल अंगों का वरण उनके लाभ के लिए होता है, तो वे एक DNA बदलाव से नहीं आ सकते। उन्हें पीढ़ियों में थोड़ा-थोड़ा बनना होगा। पर हर बीच के चरण का वरण कैसे हो? क्योंकि **बीच का चरण भी काम का हो सकता है**। चपटे कृमि *प्लेनेरिया* की "आँखें" बहुत सरल हैं: बस प्रकाश पहचानने वाले **नेत्र-बिंदु**। इतना ही उसकी मदद करता है, उपयुक्तता का लाभ देने लायक़।',
        ),
      ),
      w.body(
        t(
          "The eye, like the wing, seems to be a very popular adaptation: insects, the octopus and vertebrates all have eyes, built differently enough to have separate evolutionary origins.",
          "आँख, पंख की तरह, बहुत लोकप्रिय अनुकूलन लगती है: कीटों, ऑक्टोपस और कशेरुकियों सबकी आँखें हैं, इतनी अलग बनी कि उनकी विकासीय उत्पत्ति अलग-अलग है।",
        ),
      ),
      w.body(
        t(
          "Also, a change that is useful for one job can later become useful for quite another. **Feathers** may have started out as insulation in cold weather, and later became useful for flight. Some dinosaurs had feathers but couldn't fly with them; birds later adapted feathers to flight. So birds are very closely related to reptiles, since dinosaurs were reptiles!",
          "साथ ही, एक काम के लिए उपयोगी बदलाव बाद में बिल्कुल दूसरे काम का हो सकता है। **पंख** शायद ठंड में गर्मी बचाने के लिए शुरू हुए, और बाद में उड़ने के काम आए। कुछ डायनासोर के पंख थे पर वे उनसे उड़ नहीं सकते थे; पक्षियों ने बाद में पंखों को उड़ने के लिए अपनाया। इसलिए पक्षी सरीसृपों के बहुत क़रीबी हैं, क्योंकि डायनासोर सरीसृप थे!",
        ),
      ),
      useful,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Artificial selection: wild cabbage (Fig. 9.13). */
const artificial = page(
  "artificial",
  (b) => {
    const w = wordsOn(b);
    const cabbage = b.prop(heredityStoryDef, "cabbage", { scene: HeredityScene.WildCabbage });
    b.standsFor(cabbage, "the wild cabbage and the five vegetables bred from it");
    const cauli = choiceQuestion(b, {
      name: "cauli",
      prompt: t(
        "Farmers who selected for sterile flowers produced…",
        "जिन किसानों ने बंध्य (बीज न बनाने वाले) फूलों का चयन किया, उन्होंने बनाई…",
      ),
      options: [
        { id: "right", label: t("cauliflower", "फूलगोभी") },
        {
          id: "cabbage",
          label: t("cabbage heads", "पत्तागोभी"),
          feedback: t(
            "Cabbage came from selecting very short distances between leaves. Sterile flowers gave cauliflower.",
            "पत्तागोभी पत्तियों के बीच बहुत कम दूरी चुनने से आई। बंध्य फूलों से फूलगोभी बनी।",
          ),
        },
        {
          id: "kale",
          label: t("kale leaves", "केल की पत्तियाँ"),
          feedback: t(
            "Kale came from selecting slightly larger leaves. Sterile flowers gave cauliflower.",
            "केल थोड़ी बड़ी पत्तियाँ चुनने से आई। बंध्य फूलों से फूलगोभी बनी।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Selection by people", "मनुष्यों का चयन")),
      w.body(
        t(
          "Is there a present-day example of very different structures coming from one ancestral design? The **wild cabbage**. Over more than two thousand years, people have grown it for food and bred different vegetables from it by choosing which plants to grow from.",
          "क्या आज का कोई उदाहरण है जहाँ बहुत अलग बनावटें एक पूर्वज ढाँचे से आई हों? **जंगली गोभी**। दो हज़ार से ज़्यादा सालों से लोग इसे भोजन के लिए उगाते रहे हैं और यह चुनकर कि किन पौधों से आगे उगाएँ, इससे अलग-अलग सब्ज़ियाँ बनाई हैं।",
        ),
      ),
      cabbage,
      w.body(
        t(
          "Very short distances between leaves gave **cabbage**. Arrested flower development gave **broccoli**. Sterile flowers gave **cauliflower**. Swollen parts gave **kohlrabi**. Slightly larger leaves gave **kale**.",
          "पत्तियों के बीच बहुत कम दूरी से **पत्तागोभी** बनी। फूलों के विकास के रुकने से **ब्रोकली**। बंध्य फूलों से **फूलगोभी**। फूले हुए भागों से **गाँठगोभी**। थोड़ी बड़ी पत्तियों से **केल**।",
        ),
      ),
      w.definition(
        t(
          "**Artificial selection.** When **people** choose which individuals breed, it is **artificial selection**, not natural selection. Would we ever have guessed that all these vegetables share one ancestor, if we hadn't done it ourselves?",
          "**कृत्रिम चयन।** जब **मनुष्य** चुनते हैं कि कौन से जीव जनन करें, तो यह **कृत्रिम चयन** है, प्राकृतिक वरण नहीं। अगर हमने ख़ुद यह न किया होता, तो क्या हम कभी अनुमान लगाते कि इन सब सब्ज़ियों का एक पूर्वज है?",
        ),
      ),
      cauli,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Comparing DNA: molecular phylogeny. */
const dna = page(
  "dna",
  (b) => {
    const w = wordsOn(b);
    const more = choiceQuestion(b, {
      name: "more",
      prompt: t(
        "Molecular phylogeny compares the DNA of species. Two species with many differences in their DNA are probably…",
        "आण्विक जातिवृत्त स्पीशीज़ के DNA की तुलना करता है। जिन दो स्पीशीज़ के DNA में बहुत अंतर हों, वे शायद…",
      ),
      options: [
        { id: "right", label: t("distantly related", "दूर के संबंधी") },
        {
          id: "close",
          label: t("closely related", "क़रीबी संबंधी"),
          feedback: t(
            "Differences pile up over generations, so the more differences, the longer since the two shared an ancestor: more distant.",
            "अंतर पीढ़ियों में जमा होते हैं, इसलिए जितने ज़्यादा अंतर, साझे पूर्वज से उतना ज़्यादा समय: ज़्यादा दूर के।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Reading the family tree in DNA", "DNA में वंश-वृक्ष पढ़ना")),
      w.body(
        t(
          "We started with the idea that changes in DNA during reproduction are the basic events of evolution. If so, comparing the DNA of different species should directly measure how much it has changed since they split.",
          "हमने इस विचार से शुरुआत की थी कि जनन के दौरान DNA के बदलाव जैव विकास की मूल घटनाएँ हैं। अगर ऐसा है, तो अलग स्पीशीज़ के DNA की तुलना सीधे बताएगी कि उनके अलग होने के बाद से वह कितना बदला।",
        ),
      ),
      w.definition(
        t(
          "**Molecular phylogeny.** Organisms that are more distantly related have piled up **more differences in their DNA**. Comparing DNA to trace evolutionary relationships is **molecular phylogeny**. Happily, the relationships it shows match the classification learnt in Class IX.",
          "**आण्विक जातिवृत्त।** दूर के संबंधी जीवों के **DNA में ज़्यादा अंतर** जमा होते हैं। विकासीय संबंध खोजने के लिए DNA की तुलना **आण्विक जातिवृत्त** है। अच्छी बात यह है कि इससे मिले संबंध कक्षा IX में सीखे वर्गीकरण से मेल खाते हैं।",
        ),
      ),
      more,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Evolution is a tree, not a ladder; it isn't "progress". */
const notProgress = page(
  "not-progress",
  (b) => {
    const w = wordsOn(b);
    const tree = b.prop(heredityStoryDef, "tree", { scene: HeredityScene.TreeNotLadder });
    b.standsFor(
      tree,
      "a crossed-out ladder from bacteria up to humans beside a branching tree where bacteria, spiders, fish, chimps and humans are all tips with common ancestors below",
    );
    const better = choiceQuestion(b, {
      name: "better",
      prompt: t(
        'In evolutionary terms, which of bacteria, spiders, fish and chimpanzees has the "better" body design?',
        'जैव विकास की दृष्टि से जीवाणु, मकड़ी, मछली और चिंपैंज़ी में किसकी शरीर-बनावट "बेहतर" है?',
      ),
      options: [
        {
          id: "right",
          label: t(
            "None: each suits its own surroundings; evolution isn't a ranking",
            "किसी की नहीं: हर एक अपने परिवेश के अनुकूल है; विकास कोई क्रम-सूची नहीं",
          ),
        },
        {
          id: "chimp",
          label: t("Chimpanzees, the most complex", "चिंपैंज़ी, सबसे जटिल"),
          feedback: t(
            "More complex isn't better. Bacteria, one of the simplest designs, thrive in hot springs, deep-sea vents and Antarctic ice.",
            "ज़्यादा जटिल का अर्थ बेहतर नहीं। जीवाणु, सबसे सरल बनावटों में से एक, गर्म झरनों, गहरे समुद्र के छिद्रों और अंटार्कटिक बर्फ़ में फलते-फूलते हैं।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("A tree, not a ladder", "सीढ़ी नहीं, एक पेड़")),
      tree,
      w.body(
        t(
          "When we trace family trees of species, remember: at every stage many branches are possible. A new species emerging doesn't mean the old one is wiped out; that depends on the environment. Nor is the new species \"better\": natural selection and drift have just produced a population that can't reproduce with the original.",
          'जब हम स्पीशीज़ के वंश-वृक्ष खोजते हैं, तो याद रखो: हर चरण पर कई शाखाएँ संभव हैं। नई स्पीशीज़ बनने का अर्थ यह नहीं कि पुरानी मिट जाती है; यह परिवेश पर निर्भर है। न ही नई स्पीशीज़ "बेहतर" है: प्राकृतिक वरण और अपवाह ने बस ऐसी आबादी बनाई है जो मूल वाली से जनन नहीं कर सकती।',
        ),
      ),
      w.body(
        t(
          "So it is **not true that human beings evolved from chimpanzees**. Rather, humans and chimpanzees share a **common ancestor** from long ago, which was probably neither human nor chimpanzee, and each line has evolved in its own way since.",
          "इसलिए **यह सच नहीं कि मनुष्य चिंपैंज़ी से विकसित हुए**। बल्कि मनुष्यों और चिंपैंज़ियों का बहुत पहले का एक **साझा पूर्वज** है, जो शायद न मनुष्य था न चिंपैंज़ी, और तब से हर शाखा अपने ढंग से विकसित हुई है।",
        ),
      ),
      w.definition(
        t(
          '**No "progress".** Evolution is simply the **generation of diversity** and its **shaping by the environment**. The only trend is that more complex body designs have appeared over time, but the older, simpler designs are not inefficient, and many still flourish. Human beings are not the pinnacle of evolution: just another species in the teeming spectrum of life.',
          '**कोई "प्रगति" नहीं।** जैव विकास बस **विविधता का बनना** और **परिवेश द्वारा उसे आकार देना** है। एकमात्र प्रवृत्ति यह है कि समय के साथ ज़्यादा जटिल शरीर-बनावटें आई हैं, पर पुरानी, सरल बनावटें अकुशल नहीं हैं, और कई अब भी फल-फूल रही हैं। मनुष्य विकास का शिखर नहीं: जीवन के भरे-पूरे विस्तार में बस एक और स्पीशीज़ हैं।',
        ),
      ),
      better,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Human evolution: one species, out of Africa, no biological races. */
const humans = page(
  "humans",
  (b) => {
    const w = wordsOn(b);
    const map = b.prop(heredityStoryDef, "map", { scene: HeredityScene.OutOfAfrica });
    b.standsFor(
      map,
      "a world map with dashed arrows from Africa to West and Central Asia, Europe, South and East Asia, Australia and the Americas",
    );
    const same = choiceQuestion(b, {
      name: "same",
      prompt: t(
        "Why are people who look so different in size, colour and looks said to belong to the same species?",
        "आकार, रंग और रूप में इतने अलग दिखने वाले लोग एक ही स्पीशीज़ के क्यों कहलाते हैं?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "All humans can reproduce with each other and share recent African ancestors",
            "सारे मनुष्य आपस में जनन कर सकते हैं और उनके हाल के अफ़्रीकी पूर्वज साझे हैं",
          ),
        },
        {
          id: "look",
          label: t("Because they all walk on two legs", "क्योंकि सब दो पैरों पर चलते हैं"),
          feedback: t(
            'A species is defined by being able to reproduce together. All humans can, and our DNA traces all of us back to Africa: there is no biological basis for separate "races".',
            'स्पीशीज़ इससे तय होती है कि आपस में जनन हो सके। सारे मनुष्य कर सकते हैं, और हमारा DNA हम सबको अफ़्रीका तक ले जाता है: अलग "नस्लों" का कोई जैविक आधार नहीं।',
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Where we humans fit", "हम मनुष्य कहाँ आते हैं")),
      w.body(
        t(
          'The same tools, digging up and dating fossils and reading DNA, have been used to study human evolution. People across the planet look very different, so for a long time people talked of human "races", most often sorted by skin colour. Did these groups evolve separately? The evidence is now very clear: **there is no biological basis to the idea of human races. All humans are a single species.**',
          'वही औज़ार, जीवाश्म खोदना और उनकी उम्र जानना, और DNA पढ़ना, मानव विकास के अध्ययन में भी लगे हैं। धरती भर के लोग बहुत अलग दिखते हैं, इसलिए लंबे समय तक लोग मानव "नस्लों" की बात करते रहे, ज़्यादातर त्वचा के रंग से बाँटकर। क्या ये समूह अलग-अलग विकसित हुए? सबूत अब बहुत साफ़ है: **मानव नस्लों के विचार का कोई जैविक आधार नहीं। सारे मनुष्य एक ही स्पीशीज़ हैं।**',
        ),
      ),
      map,
      w.body(
        t(
          "And wherever we have lived for the past few thousand years, **we all come from Africa**. The earliest members of our species, *Homo sapiens*, can be traced there. A couple of hundred thousand years ago some of our ancestors left Africa while others stayed. The migrants slowly spread: to West Asia, Central Asia, Eurasia, South Asia and East Asia, down the islands to Australia, and over the Bering land bridge to the Americas. Not in a single line, but forwards and backwards, separating and mixing again, just trying to live their lives as best they could.",
          "और पिछले कुछ हज़ार सालों में हम कहीं भी रहे हों, **हम सब अफ़्रीका से आए हैं**। हमारी स्पीशीज़, *होमो सेपियंस*, के सबसे पहले सदस्य वहीं मिलते हैं। कुछ लाख साल पहले हमारे कुछ पूर्वज अफ़्रीका से निकले जबकि कुछ वहीं रहे। प्रवासी धीरे-धीरे फैले: पश्चिम एशिया, मध्य एशिया, यूरेशिया, दक्षिण एशिया और पूर्वी एशिया तक, द्वीपों से होकर ऑस्ट्रेलिया तक, और बेरिंग भू-सेतु पार करके अमेरिका तक। एक सीधी रेखा में नहीं, आगे-पीछे, बिछड़ते और फिर मिलते, बस जितना हो सके अपना जीवन जीने की कोशिश में।",
        ),
      ),
      same,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** The finale: back on the terrace, the whole chapter tied up. */
const finale = page(
  "finale",
  (b) => {
    const w = wordsOn(b);
    const garden = b.prop(heredityStoryDef, "garden", { scene: HeredityScene.TerraceGarden });
    b.standsFor(garden, "Grandpa's terrace garden at the end of the season");
    const eye = choiceQuestion(b, {
      name: "eye",
      prompt: t(
        "So, Kabir's doubt: how could the eye evolve?",
        "तो, कबीर का शक: आँख विकसित कैसे हो सकी?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Bit by bit: each simple stage, from an eye-spot up, was useful and selected",
            "थोड़ा-थोड़ा करके: नेत्र-बिंदु से शुरू हर सरल चरण काम का था और उसका वरण हुआ",
          ),
        },
        {
          id: "design",
          label: t(
            "It couldn't: it must have appeared complete",
            "नहीं हो सकती: वह पूरी की पूरी ही आई होगी",
          ),
          feedback: t(
            "Planaria's eye-spots show a simple stage that is already useful. Selection can build on each useful stage.",
            "प्लेनेरिया के नेत्र-बिंदु एक सरल चरण दिखाते हैं जो पहले से काम का है। वरण हर काम के चरण पर आगे बना सकता है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const done = w.definition(
      t(
        "**Mission complete.** Grandpa's short peas: a recessive t hiding in tall Tt plants (stops 1–2). Seeds in every mix: traits inherited independently, because chromosomes are shuffled separately (stops 3–4). Boy or girl: the father's X or Y, by chance (stop 5). Green beetles: natural selection; blue ones: drift (stop 6). Two kinds of beetle in Grandpa's village: isolation and speciation (stop 7). One family tree for all life, read in shared organs, fossils and DNA (stop 8). And the eye, the feathers, the cabbages and us: evolution step by step, a branching tree with no top (stop 9). Grandpa, saving only seeds from plants whose children were all tall, grins: \"Next year, a tall row. Probably.\"",
        '**मिशन पूरा।** दादाजी की बौनी मटर: लंबे Tt पौधों में छिपा अप्रभावी t (पड़ाव 1–2)। हर मेल के बीज: लक्षण स्वतंत्र रूप से वंशानुगत, क्योंकि गुणसूत्र अलग-अलग फेंटे जाते हैं (पड़ाव 3–4)। लड़का या लड़की: पिता का X या Y, संयोग से (पड़ाव 5)। हरे भृंग: प्राकृतिक वरण; नीले: अपवाह (पड़ाव 6)। दादाजी के गाँव में दो तरह के भृंग: अलगाव और जाति-उद्भवन (पड़ाव 7)। सारे जीवन का एक वंश-वृक्ष, साझे अंगों, जीवाश्मों और DNA में पढ़ा (पड़ाव 8)। और आँख, पंख, गोभियाँ और हम: कदम-दर-कदम विकास, एक शाखाओं वाला पेड़ जिसका कोई शिखर नहीं (पड़ाव 9)। दादाजी, अब केवल उन पौधों के बीज बचाते हुए जिनके सारे बच्चे लंबे थे, मुस्कुराते हैं: "अगले साल, एक लंबी क्यारी। शायद।"',
      ),
      "done",
      { isHidden: true },
    );
    b.when(eye.on(QuestionSignal.Correct), [theBoard.show(done), theBoard.pass()]);
    return column([w.title(t("Back on the terrace", "फिर छत पर")), garden, eye, done, space()]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** NCERT Exercise 9 and a check; the final log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const origin = choiceQuestion(b, {
      name: "origin",
      prompt: t(
        "What evidence do we have for the origin of life from non-living matter?",
        "निर्जीव पदार्थ से जीवन की उत्पत्ति का हमारे पास क्या सबूत है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Miller and Urey made amino acids from early-earth gases with sparks",
            "मिलर और यूरे ने आदि-पृथ्वी की गैसों में चिंगारियों से अमीनो अम्ल बनाए",
          ),
        },
        {
          id: "fossils",
          label: t("Fossils of the very first cell", "सबसे पहली कोशिका के जीवाश्म"),
          feedback: t(
            "We have no fossil of the first cell. The evidence is experimental: simple gases and energy produced the carbon compounds life is made of.",
            "पहली कोशिका का कोई जीवाश्म हमारे पास नहीं। सबूत प्रायोगिक है: सरल गैसों और ऊर्जा से वे कार्बन यौगिक बने जिनसे जीवन बना है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const chimp = choiceQuestion(b, {
      name: "chimp",
      prompt: t("Which statement is correct?", "कौन सा कथन सही है?"),
      options: [
        {
          id: "right",
          label: t(
            "Humans and chimpanzees share a common ancestor",
            "मनुष्यों और चिंपैंज़ियों का एक साझा पूर्वज है",
          ),
        },
        {
          id: "from",
          label: t("Humans evolved from chimpanzees", "मनुष्य चिंपैंज़ियों से विकसित हुए"),
          feedback: t(
            "Chimpanzees are a branch beside ours, not below it. Both lines come from a common ancestor that was neither.",
            "चिंपैंज़ी हमारी बग़ल की शाखा हैं, हमारे नीचे की नहीं। दोनों शाखाएँ एक साझे पूर्वज से आई हैं जो दोनों में से कोई नहीं था।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        '**Mission log, final.** ✓ Complex organs evolve in stages; even simple stages are useful. ✓ A feature can be adapted to a new job (feathers: warmth, then flight). ✓ Artificial selection made five vegetables from wild cabbage. ✓ DNA differences measure relatedness (molecular phylogeny). ✓ Evolution is a tree, not a ladder: no species is the "top". ✓ All humans are one species, from Africa.',
        '**मिशन लॉग, अंतिम।** ✓ जटिल अंग चरणों में विकसित होते हैं; सरल चरण भी काम के होते हैं। ✓ कोई विशेषता नए काम के लिए अपनाई जा सकती है (पंख: गर्मी, फिर उड़ान)। ✓ कृत्रिम चयन ने जंगली गोभी से पाँच सब्ज़ियाँ बनाईं। ✓ DNA के अंतर संबंध नापते हैं (आण्विक जातिवृत्त)। ✓ विकास पेड़ है, सीढ़ी नहीं: कोई स्पीशीज़ "शिखर" नहीं। ✓ सारे मनुष्य एक स्पीशीज़ हैं, अफ़्रीका से।',
      ),
      "log",
      { isHidden: true },
    );
    b.when(chimp.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), origin, chimp, log, space()]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [hook, stages, artificial, dna, notProgress, humans, yourTurn, finale];

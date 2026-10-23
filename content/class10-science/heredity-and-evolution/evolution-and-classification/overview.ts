import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  FossilAction,
  FossilMode,
  HeredityScene,
  Limb,
  LimbAction,
  fossilLayersDef,
  heredityStoryDef,
  limbBonesDef,
} from "@chalk/prop-heredity";

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** The family album: siblings, cousins, and the family tree of all life. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const album = b.prop(heredityStoryDef, "album", { scene: HeredityScene.FamilyAlbum });
  b.standsFor(album, "the family photo album");
  return column([
    w.title(t("A family tree for all life", "सारे जीवन का वंश-वृक्ष")),
    album,
    w.body(
      t(
        "**Stop 8.** Last time one species split into two. Run that story backwards, again and again, and every species alive might trace back to shared ancestors. But how could anyone check?",
        "**पड़ाव 8।** पिछली बार एक स्पीशीज़ दो में बँटी। उस कहानी को बार-बार उल्टा चलाओ, तो हर जीवित स्पीशीज़ साझे पूर्वजों तक पहुँच सकती है। पर कोई इसकी जाँच कैसे करे?",
      ),
    ),
    w.body(
      t(
        'Riya is flipping through the family album with Grandpa, sorting out who is related to whom. "Kabir and I share parents. Our cousins share only grandparents with us. So we\'re closer to each other than to them." Grandpa smiles: "Biologists do the same thing, with animals."',
        'रिया दादाजी के साथ परिवार का एल्बम पलट रही है, यह समझते हुए कि कौन किससे संबंधित है। "कबीर और मेरे माता-पिता साझे हैं। हमारे चचेरे भाई-बहनों से हमारे केवल दादा-दादी साझे हैं। तो हम एक-दूसरे के उनसे ज़्यादा क़रीब हैं।" दादाजी मुस्कुराते हैं: "जीवविज्ञानी जंतुओं के साथ यही करते हैं।"',
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Characteristics and their hierarchy. */
const hierarchy = page(
  "hierarchy",
  (b) => {
    const w = wordsOn(b);
    const basic = choiceQuestion(b, {
      name: "basic",
      prompt: t(
        "Which characteristic marks a more basic (more fundamental) difference between organisms?",
        "कौन सी विशेषता जीवों के बीच ज़्यादा मूल अंतर दिखाती है?",
      ),
      options: [
        {
          id: "right",
          label: t("Whether the cells have a nucleus", "कोशिकाओं में केंद्रक है या नहीं"),
        },
        {
          id: "skeleton",
          label: t(
            "Whether the skeleton is inside or outside the body",
            "कंकाल शरीर के अंदर है या बाहर",
          ),
          feedback: t(
            "That splits only animals, which are multicellular and have nuclei already. Having a nucleus or not divides nearly all life, so it comes first.",
            "यह केवल जंतुओं को बाँटता है, जो पहले से बहुकोशिकीय और केंद्रक वाले हैं। केंद्रक होना या न होना लगभग सारे जीवन को बाँटता है, इसलिए वह पहले आता है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Sorting by characteristics", "विशेषताओं से छाँटना")),
      w.definition(
        t(
          "**Characteristic.** A detail of appearance or behaviour, a particular form or a particular function, is a **characteristic**. Having four limbs is one; plants being able to photosynthesise is another.",
          "**विशेषता।** रूप या व्यवहार का कोई ब्योरा, कोई ख़ास बनावट या ख़ास काम, एक **विशेषता** है। चार अंग होना एक है; पौधों का प्रकाश-संश्लेषण कर पाना दूसरी।",
        ),
      ),
      w.body(
        t(
          "Some characteristics are shared by almost all organisms: the **cell** is the basic unit of life. The next level is shared by most but not all: **does the cell have a nucleus?** Bacteria don't; most others do. Among organisms with nuclei: **one cell or many?** Among many-celled ones: **can they photosynthesise?** Among those that can't: **is the skeleton inside or around the body?** Each question splits a group into smaller groups: a **hierarchy** for classification.",
          "कुछ विशेषताएँ लगभग सारे जीवों में होती हैं: **कोशिका** जीवन की मूल इकाई है। अगला स्तर ज़्यादातर में है पर सब में नहीं: **क्या कोशिका में केंद्रक है?** जीवाणुओं में नहीं; ज़्यादातर दूसरों में है। केंद्रक वालों में: **एक कोशिका या कई?** बहुकोशिकीयों में: **क्या वे प्रकाश-संश्लेषण कर सकते हैं?** जो नहीं कर सकते उनमें: **कंकाल शरीर के अंदर है या उसके चारों ओर?** हर सवाल एक समूह को छोटे समूहों में बाँटता है: वर्गीकरण के लिए एक **पदानुक्रम**।",
        ),
      ),
      basic,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Common ancestors: the more in common, the closer, the more recent the ancestor. */
const ancestors = page(
  "ancestors",
  (b) => {
    const w = wordsOn(b);
    const closer = choiceQuestion(b, {
      name: "closer",
      prompt: t(
        "In evolutionary terms, we have the most in common with…",
        "जैव विकास की दृष्टि से हमारी सबसे ज़्यादा समानता किससे है…",
      ),
      options: [
        { id: "right", label: t("a schoolboy in China", "चीन का एक स्कूली लड़का") },
        {
          id: "chimp",
          label: t("a chimpanzee", "एक चिंपैंज़ी"),
          feedback: t(
            "Chimpanzees are close relatives, but a boy in China is a human being: the same species as us, with a far more recent common ancestor.",
            "चिंपैंज़ी क़रीबी संबंधी हैं, पर चीन का लड़का मनुष्य है: हमारी ही स्पीशीज़, जिसका साझा पूर्वज कहीं हाल का है।",
          ),
        },
        {
          id: "spider",
          label: t("a spider, which also has legs", "एक मकड़ी, जिसकी भी टाँगें हैं"),
          feedback: t(
            "A spider shares far fewer characteristics with us than another human does.",
            "मकड़ी हमसे किसी दूसरे मनुष्य की तुलना में बहुत कम विशेषताएँ साझा करती है।",
          ),
        },
        {
          id: "bacterium",
          label: t("a bacterium, made of cells like us", "एक जीवाणु, जो हमारी तरह कोशिकाओं से बना है"),
          feedback: t(
            "A bacterium doesn't even have a nucleus. It is the most distant of these.",
            "जीवाणु में तो केंद्रक भी नहीं होता। यह इनमें सबसे दूर का है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Siblings, cousins, species", "भाई-बहन, चचेरे, स्पीशीज़")),
      w.body(
        t(
          "The more characteristics two species have in common, the more closely they are related. And the more closely related, the more **recently** they had a **common ancestor**. A brother and sister share ancestors one generation back: their parents. A girl and her first cousin share ancestors two generations back: their grandparents. So the cousins are related, but less closely.",
          "दो स्पीशीज़ में जितनी ज़्यादा विशेषताएँ साझा हों, वे उतनी क़रीबी संबंधित हैं। और जितनी क़रीबी, उनका **साझा पूर्वज** उतना **हाल** का। भाई और बहन के पूर्वज एक पीढ़ी पीछे साझे हैं: उनके माता-पिता। एक लड़की और उसके चचेरे भाई के पूर्वज दो पीढ़ी पीछे साझे हैं: उनके दादा-दादी। तो चचेरे संबंधित हैं, पर कम क़रीबी।",
        ),
      ),
      w.body(
        t(
          "So **classification is really a reflection of evolutionary relationships**. Small groups of species with recent common ancestors, then super-groups with more distant ancestors, and so on back, perhaps to a single species at the very start of evolution: the point where non-living material gave rise to life.",
          "इसलिए **वर्गीकरण असल में विकासीय संबंधों का प्रतिबिंब है**। हाल के साझा पूर्वजों वाली स्पीशीज़ के छोटे समूह, फिर दूर के पूर्वजों वाले बड़े समूह, और ऐसे ही पीछे, शायद विकास की बिल्कुल शुरुआत की एक स्पीशीज़ तक: वह बिंदु जहाँ निर्जीव पदार्थ से जीवन बना।",
        ),
      ),
      closer,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Homologous organs. */
const homologous = page(
  "homologous",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "NCERT Fig. 9.8: the forelimbs of a human, a dog and a whale have the same bones in the same plan (upper arm, forearm, wrist, fingers), changed for different jobs: homologous organs, a sign of common ancestry.",
    );
    const limbs = b.prop(limbBonesDef, "limbs", {
      first: Limb.Human,
      second: Limb.Whale,
      showColours: true,
      canChoose: true,
    });
    b.standsFor(
      limbs,
      "two forelimbs side by side with their bones colour-coded; the learner taps limbs to compare any two",
    );
    const which = choiceQuestion(b, {
      name: "which",
      prompt: t(
        "Compare the human arm, the dog's foreleg and the whale's flipper. What is the same?",
        "मनुष्य की बाँह, कुत्ते की अगली टाँग और व्हेल के फ़्लिपर की तुलना करो। क्या एक जैसा है?",
      ),
      options: [
        {
          id: "right",
          label: t("The same set of bones in the same plan", "उसी क्रम में हड्डियों का वही समूह"),
        },
        {
          id: "job",
          label: t("They do the same job", "वे एक ही काम करते हैं"),
          feedback: t(
            "Their jobs are different: grasping, running, swimming. What's shared is the bone plan underneath.",
            "उनके काम अलग हैं: पकड़ना, दौड़ना, तैरना। जो साझा है वह अंदर का हड्डियों का ढाँचा है।",
          ),
        },
      ],
      answer: "right",
    });
    b.witness(limbs.learner(LimbAction.Choose, { limb: Limb.Dog }));
    return column([
      w.title(t("Same bones, different jobs", "वही हड्डियाँ, अलग काम")),
      w.body(
        t(
          "Mammals, birds, reptiles and amphibians all have four limbs. The basic structure of the limbs is similar, though changed to do different jobs. Tap two limbs to compare.",
          "स्तनधारी, पक्षी, सरीसृप और उभयचर सबके चार अंग होते हैं। अंगों की मूल बनावट एक जैसी है, भले ही अलग-अलग काम के लिए बदली हुई हो। तुलना के लिए दो अंग चुनो।",
        ),
      ),
      limbs,
      which,
      w.definition(
        t(
          "**Homologous organs.** Organs with the **same basic structure** (the same bones, the same plan) but **different jobs** are **homologous**. They are inherited from a common ancestor, so they reveal an evolutionary relationship between species that look very different. Other examples: an elephant's tusks are teeth, grown long for a new job; a potato and the runners of grass are both stems, one swollen to store food, one creeping along the ground.",
          "**समजात अंग।** **एक जैसी मूल बनावट** (वही हड्डियाँ, वही ढाँचा) पर **अलग काम** वाले अंग **समजात** हैं। वे एक साझे पूर्वज से आए हैं, इसलिए वे बहुत अलग दिखने वाली स्पीशीज़ के बीच विकासीय संबंध दिखाते हैं। और उदाहरण: हाथी के दाँत (टस्क) असल में दाँत ही हैं, जो नए काम के लिए लंबे हो गए; आलू और घास के उपरिभूस्तारी (रनर) दोनों तने हैं, एक भोजन जमा करने के लिए फूला हुआ, एक ज़मीन पर रेंगता हुआ।",
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Analogous organs: bird and bat wings; butterfly wings. */
const analogous = page(
  "analogous",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "NCERT Fig. 9.9: bat and bird wings both fly but are built differently (skin between long fingers vs feathers along the arm): analogous as wings, though the arm bones underneath are homologous. A butterfly's wing has no bones at all.",
    );
    const limbs = b.prop(limbBonesDef, "limbs", {
      first: Limb.Bat,
      second: Limb.Bird,
      showColours: true,
      canChoose: true,
    });
    b.standsFor(
      limbs,
      "a bat's wing and a bird's wing with their bones colour-coded; the learner can pick others, like a butterfly's wing",
    );
    const butterfly = choiceQuestion(b, {
      name: "butterfly",
      prompt: t(
        "Tap the butterfly. Can the wing of a butterfly and the wing of a bat be called homologous organs?",
        "तितली चुनो। क्या तितली के पंख और चमगादड़ के पंख को समजात अंग कह सकते हैं?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "No: they do the same job but are built completely differently",
            "नहीं: वे एक ही काम करते हैं पर बिल्कुल अलग बने हैं",
          ),
        },
        {
          id: "yes",
          label: t("Yes: both are wings for flying", "हाँ: दोनों उड़ने के पंख हैं"),
          feedback: t(
            "Doing the same job makes organs analogous, not homologous. A butterfly's wing has no bones at all; a bat's is skin stretched over finger bones.",
            "एक ही काम करना अंगों को समरूप बनाता है, समजात नहीं। तितली के पंख में कोई हड्डी नहीं; चमगादड़ का पंख उँगली की हड्डियों पर तनी त्वचा है।",
          ),
        },
      ],
      answer: "right",
    });
    b.witness(limbs.learner(LimbAction.Choose, { limb: Limb.Butterfly }));
    return column([
      w.title(t("Same job, different design", "वही काम, अलग बनावट")),
      w.body(
        t(
          "Not every similarity in shape means common ancestry. Birds and bats both have wings; squirrels and lizards don't. So are birds and bats more closely related to each other? Look closer: a bat's wing is a fold of **skin stretched between long fingers**; a bird's wing is a **feathery covering all along the arm**. Their designs are very different. They look alike because they do the same job: flying.",
          "आकार की हर समानता का अर्थ साझा पूर्वज नहीं। पक्षी और चमगादड़ दोनों के पंख हैं; गिलहरी और छिपकली के नहीं। तो क्या पक्षी और चमगादड़ एक-दूसरे के ज़्यादा क़रीबी हैं? ध्यान से देखो: चमगादड़ का पंख **लंबी उँगलियों के बीच तनी त्वचा** की तह है; पक्षी का पंख **पूरी बाँह पर पंखों का आवरण** है। उनकी बनावट बहुत अलग है। वे इसलिए एक जैसे दिखते हैं क्योंकि वे एक ही काम करते हैं: उड़ना।",
        ),
      ),
      limbs,
      w.definition(
        t(
          "**Analogous organs.** Organs that do the **same job** but have a **different design and origin** are **analogous**. They don't show common ancestry. (Bird and bat *arms*, though, have the same bones: as arms they are homologous; as wings, analogous.)",
          "**समरूप अंग।** **एक ही काम** करने वाले पर **अलग बनावट और उत्पत्ति** वाले अंग **समरूप** हैं। वे साझा पूर्वज नहीं दिखाते। (पर पक्षी और चमगादड़ की *बाँहों* में वही हड्डियाँ हैं: बाँह के रूप में वे समजात हैं; पंख के रूप में समरूप।)",
        ),
      ),
      butterfly,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Fossils: what they are and how they form, layer by layer. */
const fossils = page(
  "fossils",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "NCERT 9.5.2 and its box: fossils are preserved traces of organisms; they form layer upon layer over millions of years, shown step by step.",
    );
    const form = b.prop(fossilLayersDef, "form", {
      mode: FossilMode.Form,
      step: 0,
      canStep: true,
      canDig: false,
    });
    b.standsFor(
      form,
      "how fossils form, step by step: shells buried in sand, a dinosaur in mud above, horse-like animals above that, then erosion exposing the top",
    );
    const what = choiceQuestion(b, {
      name: "what",
      prompt: t("A fossil is…", "जीवाश्म है…"),
      options: [
        {
          id: "right",
          label: t(
            "any preserved trace of a living thing from the past",
            "बीते समय के किसी जीव का कोई भी संरक्षित निशान",
          ),
        },
        {
          id: "bone",
          label: t("only a bone of a dinosaur", "केवल डायनासोर की हड्डी"),
          feedback: t(
            "Bones, shells, impressions of an insect in hardened mud: all preserved traces of living things are fossils.",
            "हड्डियाँ, सीपियाँ, कठोर मिट्टी में कीट की छाप: जीवों के सारे संरक्षित निशान जीवाश्म हैं।",
          ),
        },
      ],
      answer: "right",
    });
    b.witness(
      form.learner(FossilAction.Next),
      form.learner(FossilAction.Next),
      form.learner(FossilAction.Next),
    );
    return column([
      w.title(t("Fossils", "जीवाश्म")),
      w.body(
        t(
          "We can compare organs not only of living species but of species no longer alive. How do we know those ever existed? Usually a dead body decomposes and is lost. But now and then it lands where it can't decompose completely: a dead insect caught in hot mud, say. The mud hardens and keeps the impression of its body parts.",
          "हम केवल जीवित स्पीशीज़ ही नहीं, उन स्पीशीज़ के अंगों की भी तुलना कर सकते हैं जो अब नहीं हैं। हमें कैसे पता कि वे कभी थीं? आमतौर पर मरा शरीर सड़कर ख़त्म हो जाता है। पर कभी-कभी वह ऐसी जगह पड़ता है जहाँ पूरा सड़ नहीं पाता: जैसे गर्म कीचड़ में फँसा मरा कीट। कीचड़ कठोर होकर उसके अंगों की छाप रख लेता है।",
        ),
      ),
      w.definition(
        t(
          "**Fossils.** All such preserved traces of living organisms are called **fossils**.",
          "**जीवाश्म।** जीवों के ऐसे सारे संरक्षित निशान **जीवाश्म** कहलाते हैं।",
        ),
      ),
      w.body(
        t(
          "Step through how a hillside of fossils builds up, layer upon layer, over 100 million years.",
          "आगे बढ़कर देखो कि 10 करोड़ सालों में, परत-दर-परत, जीवाश्मों वाली एक पहाड़ी कैसे बनती है।",
        ),
      ),
      form,
      what,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Dating fossils: deeper is older; isotopes. */
const dating = page(
  "dating",
  (b) => {
    const w = wordsOn(b);
    const dig = b.prop(fossilLayersDef, "dig", {
      mode: FossilMode.Dig,
      dug: 0,
      canDig: true,
      canStep: false,
    });
    b.standsFor(
      dig,
      "a cross-section of three rock layers; the learner digs down one layer at a time",
    );
    const older = choiceQuestion(b, {
      name: "older",
      prompt: t(
        "Dig to the bottom. Which fossils are the oldest?",
        "सबसे नीचे तक खोदो। कौन से जीवाश्म सबसे पुराने हैं?",
      ),
      options: [
        {
          id: "right",
          label: t("The sea shells, in the deepest layer", "समुद्री सीपियाँ, सबसे गहरी परत में"),
        },
        {
          id: "horse",
          label: t("The horse-like animals near the top", "ऊपर के पास घोड़े जैसे जंतु"),
          feedback: t(
            "Layers are laid down one on top of another, so the top ones are the most recent. Deeper is older.",
            "परतें एक के ऊपर एक जमती हैं, इसलिए ऊपर वाली सबसे नई हैं। जितना गहरा, उतना पुराना।",
          ),
        },
      ],
      answer: "right",
    });
    b.witness(
      dig.learner(FossilAction.Dig),
      dig.learner(FossilAction.Dig),
      dig.learner(FossilAction.Dig),
    );
    return column([
      w.title(t("How old is a fossil?", "जीवाश्म कितना पुराना है?")),
      w.body(
        t(
          "There are two ways to estimate. One is **relative**: dig into the earth, and the fossils closer to the surface are more recent than those in deeper layers. The other is by measuring the ratios of different **isotopes** (forms) of the same element in the fossil material, which change steadily with time.",
          "अनुमान के दो तरीक़े हैं। एक **सापेक्ष** है: धरती में खोदो, तो सतह के पास के जीवाश्म गहरी परतों वालों से नए हैं। दूसरा जीवाश्म के पदार्थ में एक ही तत्व के अलग **समस्थानिकों** (रूपों) का अनुपात नापकर, जो समय के साथ एक तय ढंग से बदलता है।",
        ),
      ),
      dig,
      older,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** Back to the album, and a Narmada valley fossil. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const narmada = choiceQuestion(b, {
      name: "narmada",
      prompt: t(
        "A dinosaur skull fossil was found a few years ago in the Narmada valley. What does a fossil like this tell us about evolution?",
        "कुछ साल पहले नर्मदा घाटी में डायनासोर की खोपड़ी का जीवाश्म मिला। ऐसा जीवाश्म हमें जैव विकास के बारे में क्या बताता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Which organisms lived when, and how their structures compare with living ones",
            "कौन से जीव कब थे, और उनकी बनावट आज के जीवों से कैसी मिलती है",
          ),
        },
        {
          id: "nothing",
          label: t("Nothing: dinosaurs are extinct", "कुछ नहीं: डायनासोर विलुप्त हैं"),
          feedback: t(
            "Extinct species are part of the family tree too. Their fossils, dated by their layers, show what lived when and how body plans changed.",
            "विलुप्त स्पीशीज़ भी वंश-वृक्ष का हिस्सा हैं। उनके जीवाश्म, परतों से दिनांकित, दिखाते हैं कि कब क्या था और शरीर की बनावट कैसे बदली।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const stop = w.definition(
      t(
        '**Stop 8 done.** "So the album is a tiny family tree," says Riya, "and classification is the giant one." Shared characteristics (especially homologous organs) show who is related, and fossils, deeper meaning older, show who lived when. Next stop: can something as complex as an eye really evolve, and where do humans fit?',
        '**पड़ाव 8 पूरा।** "तो एल्बम एक नन्हा वंश-वृक्ष है," रिया कहती है, "और वर्गीकरण विशाल वाला।" साझी विशेषताएँ (ख़ासकर समजात अंग) दिखाती हैं कि कौन संबंधित है, और जीवाश्म, जितने गहरे उतने पुराने, दिखाते हैं कि कब कौन था। अगला पड़ाव: क्या आँख जैसी जटिल चीज़ सचमुच विकसित हो सकती है, और मनुष्य कहाँ आते हैं?',
      ),
      "stop",
      { isHidden: true },
    );
    b.when(narmada.on(QuestionSignal.Correct), [theBoard.show(stop), theBoard.pass()]);
    return column([w.title(t("Back to the album", "फिर एल्बम पर")), narmada, stop, space()]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** NCERT Exercise 2 and the link between evolution and classification; then the log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const homo = choiceQuestion(b, {
      name: "homo",
      prompt: t("An example of homologous organs is…", "समजात अंगों का एक उदाहरण है…"),
      options: [
        { id: "right", label: t("all of these", "ये सभी") },
        {
          id: "arm",
          label: t("our arm and a dog's foreleg", "हमारी बाँह और कुत्ते की अगली टाँग"),
          feedback: t(
            "That one is homologous, but so are the others: teeth and tusks are both teeth, and a potato and grass runners are both stems, changed for different jobs.",
            "यह समजात है, पर बाकी भी हैं: दाँत और हाथी-दाँत दोनों दाँत हैं, और आलू और घास के उपरिभूस्तारी दोनों तने हैं, अलग कामों के लिए बदले हुए।",
          ),
        },
        {
          id: "teeth",
          label: t("our teeth and an elephant's tusks", "हमारे दाँत और हाथी के दाँत"),
          feedback: t(
            "Homologous, yes, but not the only one here. Look at all the pairs: each has the same basic structure doing a different job.",
            "हाँ, समजात, पर यहाँ अकेला नहीं। सारी जोड़ियाँ देखो: हर एक में एक जैसी मूल बनावट अलग काम कर रही है।",
          ),
        },
        {
          id: "potato",
          label: t("a potato and the runners of grass", "आलू और घास के उपरिभूस्तारी"),
          feedback: t(
            "Both are stems, so homologous: but the other pairs are too.",
            "दोनों तने हैं, इसलिए समजात: पर बाकी जोड़ियाँ भी हैं।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const link = choiceQuestion(b, {
      name: "link",
      prompt: t(
        "How are evolution and classification linked?",
        "जैव विकास और वर्गीकरण आपस में कैसे जुड़े हैं?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Classification groups species by shared characteristics, which come from common ancestors",
            "वर्गीकरण स्पीशीज़ को साझी विशेषताओं से समूहित करता है, जो साझे पूर्वजों से आती हैं",
          ),
        },
        {
          id: "none",
          label: t("They aren't: classification is just naming", "वे जुड़े नहीं: वर्गीकरण बस नाम देना है"),
          feedback: t(
            "Grouping by shared characteristics turns out to group by ancestry: classification reflects evolutionary relationships.",
            "साझी विशेषताओं से समूह बनाना असल में पूर्वजों से समूह बनाना निकलता है: वर्गीकरण विकासीय संबंधों को दिखाता है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ Characteristics form a hierarchy for classification. ✓ More shared characteristics = closer relatives = more recent common ancestor. ✓ Homologous organs (same plan, different jobs) show common ancestry; analogous ones (same job, different design) don't. ✓ Fossils are preserved traces; deeper layers are older. Next: evolution step by step.",
        "**मिशन लॉग।** ✓ विशेषताएँ वर्गीकरण के लिए पदानुक्रम बनाती हैं। ✓ ज़्यादा साझी विशेषताएँ = क़रीबी संबंधी = हाल का साझा पूर्वज। ✓ समजात अंग (वही ढाँचा, अलग काम) साझा पूर्वज दिखाते हैं; समरूप (वही काम, अलग बनावट) नहीं। ✓ जीवाश्म संरक्षित निशान हैं; गहरी परतें पुरानी। आगे: कदम-दर-कदम विकास।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(link.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), homo, link, log, space()]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [
  hook,
  hierarchy,
  ancestors,
  homologous,
  analogous,
  fossils,
  dating,
  inLife,
  yourTurn,
];

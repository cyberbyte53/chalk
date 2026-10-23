import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  DnaAction,
  DnaMode,
  ReproductionScene,
  dnaCopyDef,
  reproductionSceneDef,
} from "@chalk/prop-reproduction";

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** Who and where: Green Sunday, and Grandpa's promise. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const notice = b.prop(reproductionSceneDef, "notice", { scene: ReproductionScene.GreenSunday });
  b.standsFor(
    notice,
    "the society notice board with a Green Sunday plant-sale poster; Grandpa smiling, Riya and Kabir worried",
  );
  return column([
    w.title(t("Fifty plants, not one bought", "पचास पौधे, एक भी ख़रीदा नहीं")),
    notice,
    w.body(
      t(
        'A new notice on the housing society board: **Green Sunday**, a plant sale in three weeks, and every family should bring plants. Grandpa reads it twice and announces, "Our family will bring **fifty pots**. And I won\'t buy a single plant or a single seed. My garden will make them." Riya, in Class 10, and her little brother Kabir look at each other. Fifty?',
        'हाउसिंग सोसाइटी के बोर्ड पर नया नोटिस: **ग्रीन संडे**, तीन हफ़्ते बाद पौधों की बिक्री, और हर परिवार को पौधे लाने हैं। दादाजी उसे दो बार पढ़ते हैं और घोषणा करते हैं, "हमारा परिवार **पचास गमले** लाएगा। और मैं एक भी पौधा या एक भी बीज नहीं ख़रीदूँगा। मेरा बगीचा उन्हें बनाएगा।" दसवीं में पढ़ने वाली रिया और उसका छोटा भाई कबीर एक-दूसरे को देखते हैं। पचास?',
      ),
    ),
    space(),
  ]);
});

/** Why this chapter: the mission and the stops on the way. */
const why = page("why", (b) => {
  const w = wordsOn(b);
  const jars = b.prop(reproductionSceneDef, "jars", { scene: ReproductionScene.MoneyPlantJars });
  b.standsFor(jars, "money-plant pieces standing in jars of water on a windowsill; Kabir watches");
  return column([
    w.title(t("What this chapter is for", "यह अध्याय किसलिए है")),
    jars,
    w.body(
      t(
        'That\'s the mission: help Grandpa fill fifty pots by understanding how living things make more of themselves, and which way suits each plant. Grandpa has already put a few money-plant pieces in jars of water. "Watch," he says. "In a week they will have roots."',
        'यही मिशन है: समझना कि जीव अपने जैसे और जीव कैसे बनाते हैं, और कौन-सा तरीक़ा किस पौधे के लिए ठीक है, ताकि दादाजी के पचास गमले भर सकें। दादाजी ने पानी के जारों में मनी प्लांट के कुछ टुकड़े पहले ही रख दिए हैं। "देखना," वे कहते हैं। "एक हफ़्ते में इनमें जड़ें आ जाएँगी।"',
      ),
    ),
    w.definition(
      t(
        "**The stops on the way.** (1) Do living things make exact copies of themselves? *this lesson*. (2) One parent, one cell: fission, budding and regeneration. (3) One parent, a piece of a plant, and spores. (4) Why two parents? (5) Flowers, seeds and fruits. (6) Growing up: reproduction in human beings. (7) Reproductive health, and then the plant sale.",
        "**रास्ते के पड़ाव।** (1) क्या जीव अपनी हूबहू प्रतिकृति बनाते हैं? *यह पाठ*। (2) एक जनक, एक कोशिका: विखंडन, मुकुलन और पुनर्जनन। (3) एक जनक, पौधे का एक टुकड़ा, और बीजाणु। (4) दो जनक क्यों? (5) फूल, बीज और फल। (6) बड़ा होना: मानव में जनन। (7) जनन स्वास्थ्य, और फिर पौधों की बिक्री।",
      ),
    ),
    w.body(
      t(
        "First stop, starting from zero: when a living thing makes a new one, what exactly is being copied?",
        "पहला पड़ाव, बिल्कुल शुरू से: जब कोई जीव नया जीव बनाता है, तो असल में किस चीज़ की नक़ल बनती है?",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Why reproduce at all; species; reproduction defined. */
const whyReproduce = page(
  "why-reproduce",
  (b) => {
    const w = wordsOn(b);
    const need = choiceQuestion(b, {
      name: "need",
      prompt: t(
        "How is reproduction different from nutrition, respiration and excretion?",
        "जनन, पोषण, श्वसन और उत्सर्जन से कैसे अलग है?",
      ),
      options: [
        {
          id: "right",
          label: t("The organism itself can live without it", "जीव स्वयं इसके बिना जीवित रह सकता है"),
        },
        {
          id: "energy",
          label: t("It uses no energy from food", "इसमें भोजन की कोई ऊर्जा नहीं लगती"),
          feedback: t(
            "It uses a lot of energy. The difference is that an individual can stay alive without reproducing, but not without nutrition or respiration.",
            "इसमें बहुत ऊर्जा लगती है। अंतर यह है कि कोई जीव जनन के बिना ज़िंदा रह सकता है, पर पोषण या श्वसन के बिना नहीं।",
          ),
        },
        {
          id: "plants",
          label: t(
            "Only animals reproduce; plants just keep growing",
            "केवल जंतु जनन करते हैं; पौधे बस बढ़ते रहते हैं",
          ),
          feedback: t(
            "Plants reproduce too: Grandpa's garden is full of examples. The difference is that reproduction isn't needed to keep one individual alive.",
            "पौधे भी जनन करते हैं: दादाजी का बगीचा उदाहरणों से भरा है। अंतर यह है कि एक जीव को ज़िंदा रखने के लिए जनन ज़रूरी नहीं।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Why reproduce at all?", "जनन करें ही क्यों?")),
      w.definition(
        t(
          "**Reproduction.** The process by which living things (**organisms**) produce new individuals of their own kind is **reproduction**.",
          "**जनन।** वह प्रक्रम जिससे जीव अपनी ही तरह के नए जीव पैदा करते हैं, **जनन** है।",
        ),
      ),
      w.body(
        t(
          "Nutrition, respiration and excretion keep an individual alive. Reproduction doesn't: a plant that never makes seeds can still live a long life. Making new individuals even costs a lot of energy. So why do it?",
          "पोषण, श्वसन और उत्सर्जन किसी जीव को ज़िंदा रखते हैं। जनन नहीं रखता: जो पौधा कभी बीज नहीं बनाता, वह भी लंबा जीवन जी सकता है। नए जीव बनाने में तो बहुत ऊर्जा भी लगती है। तो फिर यह क्यों?",
        ),
      ),
      w.definition(
        t(
          "**Species.** A group of organisms of one kind, which look alike, is a **species**. We notice a species because there are *many* of them: if there were just one sparrow that never reproduced, we would hardly know sparrows existed. Reproducing organisms make new individuals that look very much like themselves.",
          "**स्पीशीज़।** एक ही तरह के जीवों का समूह, जो एक-दूसरे जैसे दिखते हैं, एक **स्पीशीज़** (जाति) है। हमें कोई स्पीशीज़ इसलिए दिखती है क्योंकि वे *बहुत सारे* होते हैं: अगर केवल एक ही गौरैया होती जो कभी जनन न करती, तो हमें शायद ही पता चलता कि गौरैया होती है। जनन करने वाले जीव ऐसे नए जीव बनाते हैं जो बिल्कुल उनके जैसे दिखते हैं।",
        ),
      ),
      need,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The blueprint: chromosomes, DNA, proteins; the copy step, with the dnaCopy prop. */
const copy = page(
  "copy",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "NCERT 8.1: the basic event in reproduction is making a DNA copy, along with extra cellular apparatus; then the cell divides. Step through the copy and notice one small change in the new DNA.",
    );
    const cell = b.prop(dnaCopyDef, "cell", {
      mode: DnaMode.Copy,
      step: 0,
      showNames: true,
      canStep: true,
    });
    b.studentOnly(cell.action(DnaAction.Next));
    b.studentOnly(cell.action(DnaAction.Reset));
    b.standsFor(
      cell,
      "a cell copying its DNA strip (one block comes out slightly changed), building extra apparatus, then dividing into two",
    );
    const apparatus = choiceQuestion(b, {
      name: "apparatus",
      prompt: t(
        "Step to the end. Why can't the cell just make a DNA copy and push it out?",
        "आख़िर तक चलो। कोशिका DNA की प्रति बनाकर उसे बस बाहर क्यों नहीं धकेल सकती?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "The copy needs its own cell apparatus to keep life processes going",
            "प्रति को जैव प्रक्रम चलाने के लिए अपना कोशिकीय उपकरण चाहिए",
          ),
        },
        {
          id: "big",
          label: t("DNA is too big to leave the cell", "DNA कोशिका से निकलने के लिए बहुत बड़ा है"),
          feedback: t(
            "Size isn't the problem. A bare DNA copy would have no organised cell around it to carry out the life processes, so the cell builds extra apparatus and divides.",
            "आकार समस्या नहीं है। अकेली DNA प्रति के चारों ओर कोई व्यवस्थित कोशिका नहीं होगी जो जैव प्रक्रम चलाए, इसलिए कोशिका अतिरिक्त उपकरण बनाती है और विभाजित होती है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("What gets copied: DNA", "किसकी नक़ल बनती है: DNA")),
      w.body(
        t(
          "Organisms of one species look alike because their **body designs** are alike. For the designs to be alike, the instructions for building them, their blueprints, must be alike. So reproduction, at its most basic, means copying the blueprint.",
          "एक स्पीशीज़ के जीव एक जैसे दिखते हैं क्योंकि उनकी **शारीरिक संरचना** एक जैसी होती है। संरचना एक जैसी हो, इसके लिए उसे बनाने के निर्देश, यानी उसका ख़ाका, एक जैसा होना चाहिए। इसलिए जनन का सबसे बुनियादी अर्थ है ख़ाके की नक़ल बनाना।",
        ),
      ),
      w.definition(
        t(
          "**Chromosomes and DNA.** (Recap from Class 9.) Every cell has a **nucleus**. In it are thread-like **chromosomes**, which carry the information for inheriting features from parents, in the form of **DNA** molecules (deoxyribonucleic acid). DNA is the information source for making **proteins**. Change the information, and different proteins are made; different proteins eventually lead to a different body design.",
          "**गुणसूत्र और DNA।** (कक्षा 9 की याद।) हर कोशिका में एक **केंद्रक** होता है। उसमें धागे जैसे **गुणसूत्र** होते हैं, जो माता-पिता से लक्षणों की वंशागति की सूचना **DNA** अणुओं (डीऑक्सीराइबोन्यूक्लिक अम्ल) के रूप में रखते हैं। DNA **प्रोटीन** बनाने की सूचना का स्रोत है। सूचना बदलो, तो दूसरे प्रोटीन बनते हैं; दूसरे प्रोटीन अंततः दूसरी शारीरिक संरचना बनाते हैं।",
        ),
      ),
      w.definition(
        t(
          "**DNA copying.** A basic event in reproduction is the creation of a **DNA copy**, by chemical reactions in the cell. Along with it the cell builds extra **cellular apparatus** (the parts that keep a cell alive). Then the two DNA copies separate, each with its own apparatus: the cell has divided into two.",
          "**DNA प्रतिकृति।** जनन की एक बुनियादी घटना है कोशिका में रासायनिक अभिक्रियाओं से **DNA की प्रतिकृति** बनना। इसके साथ कोशिका अतिरिक्त **कोशिकीय उपकरण** (वे भाग जो कोशिका को ज़िंदा रखते हैं) भी बनाती है। फिर दोनों DNA प्रतियाँ अलग होती हैं, हर एक अपने उपकरण के साथ: कोशिका दो में बँट गई।",
        ),
      ),
      w.body(t("Step through it.", "क़दम-दर-क़दम देखो।")),
      cell,
      apparatus,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** No copying is perfect: variations pile up; drastic ones die. */
const generations = page(
  "generations",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "NCERT 8.1: no biochemical reaction is absolutely reliable, so DNA copies are similar but not identical. Over generations small variations accumulate; a drastic one makes a cell that cannot work and dies. This inbuilt tendency for variation is the basis of evolution.",
    );
    const tree = b.prop(dnaCopyDef, "tree", {
      mode: DnaMode.Generations,
      step: 0,
      showNames: true,
      canStep: true,
    });
    b.studentOnly(tree.action(DnaAction.Next));
    b.studentOnly(tree.action(DnaAction.Reset));
    b.standsFor(
      tree,
      "a family tree of cells: 1, 2, 4, 8; small changes in the DNA pile up, and one cell with a drastic change dies",
    );
    const dies = choiceQuestion(b, {
      name: "dies",
      prompt: t(
        "Step to 8 cells. Why does one of the new cells die?",
        "8 कोशिकाओं तक चलो। नई कोशिकाओं में से एक क्यों मर जाती है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Its DNA changed too much to work with the cell",
            "इसका DNA इतना बदल गया कि वह कोशिका के साथ काम नहीं कर सकता",
          ),
        },
        {
          id: "old",
          label: t(
            "It is the oldest cell in the group, so its time is up",
            "यह समूह की सबसे पुरानी कोशिका है, इसलिए इसका समय पूरा हो गया",
          ),
          feedback: t(
            "All the cells in a generation are equally new. The one that dies got a drastic change in its DNA copy.",
            "एक पीढ़ी की सारी कोशिकाएँ बराबर नई हैं। जो मरती है, उसकी DNA प्रति में भारी बदलाव आया था।",
          ),
        },
        {
          id: "small",
          label: t("Any small change at all kills a cell", "कोई भी छोटा बदलाव कोशिका को मार देता है"),
          feedback: t(
            "Most cells in the tree carry small changes and are fine. Only a drastic change kills.",
            "पेड़ की ज़्यादातर कोशिकाओं में छोटे बदलाव हैं और वे ठीक हैं। केवल भारी बदलाव ही मारता है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Copies are similar, not identical", "प्रतियाँ मिलती-जुलती हैं, हूबहू नहीं")),
      w.body(
        t(
          "Are the two new cells absolutely identical? Only if the copying is perfect. But no chemical reaction in a living cell is absolutely reliable, so each DNA copy can come out slightly different.",
          "क्या दोनों नई कोशिकाएँ बिल्कुल एक जैसी होती हैं? तभी, जब नक़ल एकदम सही हो। पर जीवित कोशिका की कोई भी रासायनिक अभिक्रिया पूरी तरह भरोसेमंद नहीं होती, इसलिए हर DNA प्रति थोड़ी अलग निकल सकती है।",
        ),
      ),
      w.definition(
        t(
          "**Variation.** The small differences between individuals of the same kind are **variations**. Copying errors in DNA create them. Most are small and harmless. A few are so drastic that the new DNA can't work with the cell apparatus it inherits, and that new cell simply dies.",
          "**विभिन्नता।** एक ही तरह के जीवों के बीच छोटे-छोटे अंतर **विभिन्नताएँ** हैं। DNA की नक़ल की ग़लतियाँ इन्हें बनाती हैं। ज़्यादातर छोटी और हानिरहित होती हैं। कुछ इतनी भारी होती हैं कि नया DNA विरासत में मिले कोशिकीय उपकरण के साथ काम नहीं कर पाता, और वह नई कोशिका बस मर जाती है।",
        ),
      ),
      tree,
      w.note(
        t(
          "This built-in tendency to vary during reproduction is the basis for evolution: the next chapter.",
          "जनन के दौरान बदलने की यह अंतर्निहित प्रवृत्ति ही विकास का आधार है: अगला अध्याय।",
        ),
      ),
      dies,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Niches, stability, and why variation helps a species survive change. */
const niche = page(
  "niche",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "NCERT 8.1.1: consistent DNA copying keeps a population suited to its niche (stability); if the niche changes drastically (warming water), only the few heat-resistant variants survive and grow. Variation helps the species, not necessarily the individual.",
    );
    const pond = b.prop(dnaCopyDef, "pond", {
      mode: DnaMode.Niche,
      step: 0,
      showNames: true,
      canStep: true,
    });
    b.studentOnly(pond.action(DnaAction.Next));
    b.studentOnly(pond.action(DnaAction.Reset));
    b.standsFor(
      pond,
      "bacteria in temperate water; the water warms; only two heat-resistant variants survive, then multiply",
    );
    const species = choiceQuestion(b, {
      name: "species",
      prompt: t(
        "Step through the warming. Who gains from the variation: each bacterium, or the species?",
        "गरम होना क़दम-दर-क़दम देखो। विभिन्नता से फ़ायदा किसे होता है: हर जीवाणु को, या स्पीशीज़ को?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "The species: a few variants survive and carry it on",
            "स्पीशीज़ को: कुछ विभिन्न जीव बच जाते हैं और उसे आगे बढ़ाते हैं",
          ),
        },
        {
          id: "each",
          label: t("Every single bacterium", "हर एक जीवाणु को"),
          feedback: t(
            "Most bacteria die in the heat. Only the few heat-resistant variants survive, so the species survives, though most individuals don't.",
            "ज़्यादातर जीवाणु गर्मी में मर जाते हैं। केवल गर्मी सहने वाले कुछ जीवाणु बचते हैं, इसलिए स्पीशीज़ बच जाती है, भले ज़्यादातर जीव नहीं बचते।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Why variation is useful", "विभिन्नता क्यों उपयोगी है")),
      w.definition(
        t(
          "**Niche.** The particular place and way of life an organism is suited to in its surroundings, the living things and the place around it, like a frog's pond or a cactus's desert, is its **niche**.",
          "**निकेत।** अपने परिवेश, यानी आसपास के जीवों और जगह, में वह ख़ास जगह और जीने का ढंग जिसके लिए कोई जीव उपयुक्त है, जैसे मेंढक का तालाब या कैक्टस का रेगिस्तान, उसका **निकेत** है।",
        ),
      ),
      w.body(
        t(
          "Because DNA copying is *mostly* consistent, offspring keep the body design that suits their niche. So reproduction keeps populations of a species **stable**. But niches can change for reasons beyond the organisms' control: temperatures rise or fall, water levels change, a meteorite hits. If every individual were identical, one drastic change could wipe them all out. If a few are slightly different, some may survive.",
          "क्योंकि DNA की नक़ल *ज़्यादातर* एक जैसी होती है, संतान अपने निकेत के अनुकूल शारीरिक संरचना बनाए रखती है। इसलिए जनन स्पीशीज़ की समष्टि को **स्थिर** रखता है। पर निकेत ऐसे कारणों से बदल सकते हैं जो जीवों के बस में नहीं: तापमान बढ़ता या घटता है, जल-स्तर बदलता है, उल्का पिंड गिरता है। अगर हर जीव हूबहू एक जैसा होता, तो एक भारी बदलाव सबको मिटा सकता था। अगर कुछ थोड़े अलग हों, तो कुछ बच सकते हैं।",
        ),
      ),
      w.body(
        t(
          "NCERT's example: bacteria living in temperate (mild) water, and the water warms up through global warming.",
          "NCERT का उदाहरण: समशीतोष्ण (हल्के) पानी में रहने वाले जीवाणु, और वैश्विक ऊष्मण से पानी गरम हो जाता है।",
        ),
      ),
      pond,
      species,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** Grandpa's cuttings look exactly like the parent; a garden of copies is a risk. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const jars = b.prop(reproductionSceneDef, "jars", { scene: ReproductionScene.MoneyPlantJars });
    b.standsFor(jars, "the money-plant pieces in jars of water on the windowsill");
    const risk = choiceQuestion(b, {
      name: "risk",
      prompt: t(
        "Kabir: \"Let's fill all fifty pots with money-plant pieces from one plant. They'll be perfect copies!\" What's the risk, if this were a whole field of plants?",
        'कबीर: "पचासों गमले एक ही पौधे के मनी प्लांट के टुकड़ों से भर देते हैं। सब एकदम एक जैसे होंगे!" अगर यह पौधों का पूरा खेत होता, तो ख़तरा क्या है?',
      ),
      options: [
        {
          id: "right",
          label: t(
            "With almost no variation, one disease or change could kill them all",
            "लगभग कोई विभिन्नता नहीं, तो एक रोग या बदलाव सबको मार सकता है",
          ),
        },
        {
          id: "none",
          label: t("No risk: copies are always best", "कोई ख़तरा नहीं: प्रतियाँ हमेशा सबसे अच्छी"),
          feedback: t(
            "Copies keep a good design, which is useful. But if the surroundings change drastically, a population with hardly any variation has few individuals that might survive.",
            "प्रतियाँ अच्छी संरचना बनाए रखती हैं, जो उपयोगी है। पर अगर परिवेश बहुत बदल जाए, तो लगभग बिना विभिन्नता वाली समष्टि में बचने लायक जीव बहुत कम होते हैं।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const stop = w.definition(
      t(
        "**Stop 1 done.** Reproduction copies the DNA blueprint, so offspring look like the parent; copying is never perfect, so they are similar but not identical. That variation helps a species survive change. Next stop: how a single cell actually makes two, starting with Riya's yeast.",
        "**पड़ाव 1 पूरा।** जनन DNA के ख़ाके की नक़ल बनाता है, इसलिए संतान जनक जैसी दिखती है; नक़ल कभी एकदम सही नहीं होती, इसलिए वे मिलती-जुलती होती हैं, हूबहू नहीं। यही विभिन्नता स्पीशीज़ को बदलाव में बचने में मदद करती है। अगला पड़ाव: एक कोशिका असल में दो कैसे बनाती है, रिया के यीस्ट से शुरू करके।",
      ),
      "stop",
      { isHidden: true },
    );
    b.when(risk.on(QuestionSignal.Correct), [theBoard.show(stop), theBoard.pass()]);
    return column([
      w.title(t("Back at the windowsill", "फिर खिड़की के पास")),
      jars,
      w.body(
        t(
          "A week later, white roots are creeping out of the money-plant pieces. Each new plant will look just like the plant it came from: its DNA is a copy of the parent's, with hardly any change.",
          "एक हफ़्ते बाद मनी प्लांट के टुकड़ों से सफ़ेद जड़ें निकल रही हैं। हर नया पौधा ठीक उसी पौधे जैसा दिखेगा जिससे वह आया: उसका DNA जनक की प्रति है, लगभग बिना बदलाव के।",
        ),
      ),
      risk,
      stop,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** NCERT 8.1 in-text questions. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const importance = choiceQuestion(b, {
      name: "importance",
      prompt: t(
        "What is the importance of DNA copying in reproduction?",
        "जनन में DNA प्रतिकृति का क्या महत्व है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "It passes the body-design blueprint to the offspring, so they resemble the parent",
            "यह शारीरिक संरचना का ख़ाका संतान तक पहुँचाता है, ताकि वह जनक जैसी हो",
          ),
        },
        {
          id: "energy",
          label: t("It gives the cell energy", "यह कोशिका को ऊर्जा देता है"),
          feedback: t(
            "Energy comes from respiration. DNA copying passes on the information for making proteins, and so the body design.",
            "ऊर्जा श्वसन से आती है। DNA प्रतिकृति प्रोटीन बनाने की सूचना, और इसलिए शारीरिक संरचना, आगे पहुँचाती है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const individual = choiceQuestion(b, {
      name: "individual",
      prompt: t(
        "Why is variation beneficial to the species but not necessarily to the individual?",
        "विभिन्नता स्पीशीज़ के लिए तो लाभदायक है पर व्यक्तिगत जीव के लिए आवश्यक रूप से क्यों नहीं?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "When the niche changes, a few variants survive and keep the species going, though many individuals die",
            "निकेत बदलने पर कुछ विभिन्न जीव बचकर स्पीशीज़ को चलाते रहते हैं, भले बहुत से जीव मर जाएँ",
          ),
        },
        {
          id: "always",
          label: t(
            "Every variation makes an individual stronger",
            "हर विभिन्नता जीव को ज़्यादा मज़बूत बनाती है",
          ),
          feedback: t(
            "Some variations are harmless, some even kill the cell. Their value shows only when the surroundings change and a few variants happen to survive.",
            "कुछ विभिन्नताएँ हानिरहित हैं, कुछ तो कोशिका को मार देती हैं। उनका मूल्य तभी दिखता है जब परिवेश बदले और कुछ विभिन्न जीव संयोग से बच जाएँ।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const stable = choiceQuestion(b, {
      name: "stable",
      prompt: t(
        "How does reproduction help keep populations of a species stable?",
        "जनन स्पीशीज़ की समष्टि को स्थिर रखने में कैसे मदद करता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Consistent DNA copying keeps the body design that suits the species' niche",
            "DNA की एक जैसी नक़ल वह शारीरिक संरचना बनाए रखती है जो स्पीशीज़ के निकेत के अनुकूल है",
          ),
        },
        {
          id: "change",
          label: t("Each generation looks completely different", "हर पीढ़ी बिल्कुल अलग दिखती है"),
          feedback: t(
            "If every generation looked completely different, it would lose the design that suits its niche. Stability comes from copying being mostly consistent.",
            "अगर हर पीढ़ी बिल्कुल अलग दिखती, तो वह अपने निकेत के अनुकूल संरचना खो देती। स्थिरता नक़ल के ज़्यादातर एक जैसा होने से आती है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ Reproduction copies DNA, the blueprint for proteins and body design. ✓ A copy comes with new cell apparatus; the cell divides. ✓ Copies are similar, not identical: variation, useful for the species. Pots filled: the money-plant jars are rooting. Next: how single cells make more of themselves.",
        "**मिशन लॉग।** ✓ जनन DNA की नक़ल बनाता है, जो प्रोटीन और शारीरिक संरचना का ख़ाका है। ✓ प्रति के साथ नया कोशिकीय उपकरण बनता है; कोशिका बँटती है। ✓ प्रतियाँ मिलती-जुलती हैं, हूबहू नहीं: विभिन्नता, जो स्पीशीज़ के लिए उपयोगी है। गमले: मनी प्लांट के जारों में जड़ें आ रही हैं। आगे: एककोशिकीय जीव अपने जैसे और कैसे बनाते हैं।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(stable.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([
      w.title(t("Your turn", "अब तुम्हारी बारी")),
      importance,
      individual,
      stable,
      log,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [hook, why, whyReproduce, copy, generations, niche, inLife, yourTurn];

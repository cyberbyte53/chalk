import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  BeetleAction,
  BeetleMode,
  HeredityScene,
  beetlePopulationDef,
  heredityStoryDef,
} from "@chalk/prop-heredity";

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** Grandpa's village beetles look different: are they still the same kind? */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const bush = b.prop(heredityStoryDef, "bush", { scene: HeredityScene.BeetleBush });
  b.standsFor(bush, "a bush with beetles and a crow");
  return column([
    w.title(t("Still the same kind?", "क्या अब भी एक ही तरह के?")),
    bush,
    w.body(
      t(
        '**Stop 7.** Last time the beetles on the terrace changed colour over generations, but they stayed one kind of beetle. Grandpa remembers his village in the hills, where the same sort of beetle lived on bushes on both sides of a river. "After the river changed course and cut the hillside in two, the beetles on each side slowly became different. Today, people say, they are two separate kinds."',
        '**पड़ाव 7।** पिछली बार छत के भृंगों का रंग पीढ़ियों में बदला, पर वे एक ही तरह के भृंग रहे। दादाजी को पहाड़ों में अपना गाँव याद आता है, जहाँ इसी तरह के भृंग एक नदी के दोनों ओर की झाड़ियों पर रहते थे। "जब नदी ने रास्ता बदला और पहाड़ी को दो हिस्सों में काट दिया, तो दोनों ओर के भृंग धीरे-धीरे अलग होते गए। आज, लोग कहते हैं, वे दो अलग तरह के हैं।"',
      ),
    ),
    w.body(
      t(
        "How can one kind of living thing become two? This lesson finds out.",
        "एक तरह का जीव दो कैसे बन सकता है? यह पाठ पता लगाता है।",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Micro-evolution vs new species; what a species is. */
const micro = page(
  "micro",
  (b) => {
    const w = wordsOn(b);
    const species = choiceQuestion(b, {
      name: "species",
      prompt: t(
        "When can we say two groups of beetles have become two separate species?",
        "हम कब कह सकते हैं कि भृंगों के दो समूह दो अलग स्पीशीज़ बन गए हैं?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "When they can no longer reproduce with each other",
            "जब वे आपस में जनन नहीं कर सकते",
          ),
        },
        {
          id: "colour",
          label: t("When they are different colours", "जब उनके रंग अलग हों"),
          feedback: t(
            "Red and green beetles in one bush were still one species: they could breed together. The test is whether they can reproduce with each other.",
            "एक झाड़ी के लाल और हरे भृंग अब भी एक स्पीशीज़ थे: वे साथ जनन कर सकते थे। कसौटी यह है कि क्या वे आपस में जनन कर सकते हैं।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Small changes, and new species", "छोटे बदलाव, और नई स्पीशीज़")),
      w.definition(
        t(
          "**Micro-evolution.** The changes we have seen so far are small, though important: they change the common characteristics of one species. This is **micro-evolution**.",
          "**सूक्ष्म विकास।** अब तक देखे बदलाव छोटे हैं, भले ही महत्वपूर्ण: वे एक स्पीशीज़ की आम विशेषताएँ बदलते हैं। यह **सूक्ष्म विकास** है।",
        ),
      ),
      w.definition(
        t(
          "**Speciation.** A new species has come into being only when a group of beetles **splits into two populations that cannot reproduce with each other**. Then they are two independent species. The making of new species is **speciation**.",
          "**जाति-उद्भवन।** नई स्पीशीज़ तभी बनती है जब भृंगों का एक समूह **ऐसी दो आबादियों में बँट जाए जो आपस में जनन न कर सकें**। तब वे दो स्वतंत्र स्पीशीज़ हैं। नई स्पीशीज़ का बनना **जाति-उद्भवन** है।",
        ),
      ),
      species,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Sub-populations and gene flow. */
const geneFlow = page(
  "gene-flow",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "Beetles on two neighbouring hills breed mostly at home, but now and then one wanders across, so genes flow between the hills and they stay alike.",
    );
    const hills = b.prop(beetlePopulationDef, "hills", {
      mode: BeetleMode.Speciation,
      beetles: { red: 18, green: 0, blue: 0 },
      right: { red: 18, green: 2, blue: 0 },
      canBreed: true,
      canRiver: false,
      canMutate: false,
    });
    b.standsFor(
      hills,
      "two hills with beetle sub-populations, eagles on the left and crows on the right, with beetles crossing between them",
    );
    const flow = choiceQuestion(b, {
      name: "flow",
      prompt: t(
        "A beetle from the right hill is carried by a crow to the left hill and breeds there. What does this do?",
        "दाईं पहाड़ी का एक भृंग कौआ उठाकर बाईं पहाड़ी पर छोड़ देता है और वह वहाँ जनन करता है। इससे क्या होता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Its genes enter the left hill's population: gene flow",
            "उसके जीन बाईं आबादी में आ जाते हैं: जीन प्रवाह",
          ),
        },
        {
          id: "species",
          label: t("It makes a new species", "इससे नई स्पीशीज़ बनती है"),
          feedback: t(
            "The opposite: mixing genes between the hills keeps the two groups alike.",
            "उल्टा: पहाड़ियों के बीच जीन मिलना दोनों समूहों को एक जैसा रखता है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Neighbours, and gene flow", "पड़ोसी, और जीन प्रवाह")),
      w.body(
        t(
          "Suppose the bushes are spread over a whole mountain range and the beetle population becomes very large. Each beetle feeds on a few nearby bushes all its life and doesn't travel far. So the big population is really made of **sub-populations** in neighbourhoods, and most mating happens within them.",
          "मान लो झाड़ियाँ पूरी पर्वत-श्रृंखला पर फैली हैं और भृंगों की आबादी बहुत बड़ी हो जाती है। हर भृंग जीवन भर पास की कुछ झाड़ियों पर खाता है और दूर नहीं जाता। तो बड़ी आबादी असल में पड़ोस की **उप-आबादियों** से बनी है, और ज़्यादातर जनन उन्हीं के अंदर होता है।",
        ),
      ),
      w.definition(
        t(
          "**Gene flow.** Now and then an adventurous beetle wanders to another site, or a crow drops one there uneaten. It breeds with the locals, and its genes enter the new population. This is **gene flow**: it keeps partly separated populations alike.",
          "**जीन प्रवाह।** कभी-कभी कोई साहसी भृंग दूसरी जगह चला जाता है, या कौआ उसे बिना खाए वहाँ छोड़ देता है। वह वहाँ वालों के साथ जनन करता है, और उसके जीन नई आबादी में आ जाते हैं। यह **जीन प्रवाह** है: यह आंशिक रूप से अलग आबादियों को एक जैसा रखता है।",
        ),
      ),
      hills,
      flow,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** A river splits them; drift and selection pull apart; they can no longer interbreed. */
const river = page(
  "river",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "A river splits the hills, stopping gene flow. On the left eagles keep crows away, so green isn't selected; on the right crows select green. Over generations apart the two populations drift and are selected differently until they can no longer interbreed.",
    );
    const hills = b.prop(beetlePopulationDef, "hills", {
      mode: BeetleMode.Speciation,
      beetles: { red: 18, green: 0, blue: 0 },
      right: { red: 18, green: 2, blue: 0 },
      canBreed: true,
      canRiver: true,
      canMutate: false,
    });
    b.standsFor(
      hills,
      "the two hills; the learner lets a river split them and breeds generations until the two groups can no longer interbreed",
    );
    const apart = choiceQuestion(b, {
      name: "apart",
      prompt: t(
        "Split the hills with the river and breed several generations. Why do the two groups end up different?",
        "नदी से पहाड़ियाँ बाँटो और कई पीढ़ियाँ बनाओ। दोनों समूह आख़िर में अलग क्यों हो जाते हैं?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "No gene flow, plus different drift and different selection on each side",
            "जीन प्रवाह नहीं, ऊपर से हर ओर अलग अपवाह और अलग वरण",
          ),
        },
        {
          id: "river",
          label: t("The river water changes their genes", "नदी का पानी उनके जीन बदल देता है"),
          feedback: t(
            "The river only keeps them apart. The changes come from drift and selection, which now act separately on each side.",
            "नदी केवल उन्हें अलग रखती है। बदलाव अपवाह और वरण से आते हैं, जो अब हर ओर अलग-अलग काम करते हैं।",
          ),
        },
      ],
      answer: "right",
    });
    b.witness(
      hills.learner(BeetleAction.SetRiver, { on: true }),
      ...Array.from({ length: 6 }, () => hills.learner(BeetleAction.NextGeneration)),
    );
    return column([
      w.title(t("A river comes between", "बीच में एक नदी आती है")),
      w.body(
        t(
          "Now a large river comes into being between two sub-populations. Beetles can't cross it, so gene flow falls even further. Over generations, **genetic drift** piles up different changes on each side. **Natural selection** may act differently too: on the left hill eagles have killed off the crows, so green isn't selected there; on the right, crows are many and green is strongly selected.",
          "अब दो उप-आबादियों के बीच एक बड़ी नदी बन जाती है। भृंग उसे पार नहीं कर सकते, इसलिए जीन प्रवाह और भी घट जाता है। पीढ़ियों में **आनुवंशिक अपवाह** हर ओर अलग बदलाव जमा करता है। **प्राकृतिक वरण** भी अलग काम कर सकता है: बाईं पहाड़ी पर बाज़ों ने कौए ख़त्म कर दिए हैं, इसलिए वहाँ हरे का वरण नहीं होता; दाईं ओर कौए बहुत हैं और हरे का ज़ोरदार वरण होता है।",
        ),
      ),
      hills,
      apart,
      w.body(
        t(
          "Together, drift and selection make the two isolated groups more and more different, until their members **cannot reproduce with each other** even if they meet. Two species.",
          "अपवाह और वरण मिलकर दोनों अलग समूहों को और-और अलग बनाते हैं, जब तक कि उनके सदस्य मिलने पर भी **आपस में जनन न कर सकें**। दो स्पीशीज़।",
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** How they stop being able to breed: chromosome changes, or mating behaviour. */
const ways = page(
  "ways",
  (b) => {
    const w = wordsOn(b);
    const green = choiceQuestion(b, {
      name: "green",
      prompt: t(
        "A green female on the right hill will mate only with green males. She meets a red male from the left. What happens?",
        "दाईं पहाड़ी की एक हरी मादा केवल हरे नरों से जनन करती है। वह बाईं ओर के एक लाल नर से मिलती है। क्या होता है?",
      ),
      options: [
        {
          id: "right",
          label: t("No young: her behaviour prevents it", "कोई संतान नहीं: उसका व्यवहार इसे रोकता है"),
        },
        {
          id: "young",
          label: t("They have young, like always", "उनकी संतान होती है, हमेशा की तरह"),
          feedback: t(
            "She chooses only green males, so the two groups no longer breed: they are behaving as separate species.",
            "वह केवल हरे नर चुनती है, इसलिए दोनों समूह अब जनन नहीं करते: वे अलग स्पीशीज़ की तरह बरत रहे हैं।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("How they stop breeding together", "वे साथ जनन करना कैसे बंद करते हैं")),
      w.body(
        t(
          "There are several ways two groups can become unable to reproduce with each other. If the DNA changes are big enough, such as a **change in the number of chromosomes**, the germ cells of the two groups can no longer fuse. Or a new variation in **behaviour** can arise: green females that mate only with green males.",
          "दो समूहों के आपस में जनन न कर पाने के कई तरीक़े हैं। अगर DNA के बदलाव काफ़ी बड़े हों, जैसे **गुणसूत्रों की संख्या में बदलाव**, तो दोनों समूहों की जनन कोशिकाएँ मिल नहीं पातीं। या **व्यवहार** में एक नई विभिन्नता आ सकती है: हरी मादाएँ जो केवल हरे नरों से जनन करें।",
        ),
      ),
      green,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** Grandpa's village, explained; and plants that pollinate themselves. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const village = choiceQuestion(b, {
      name: "village",
      prompt: t(
        "So what made the beetles of Grandpa's village become two kinds?",
        "तो दादाजी के गाँव के भृंग दो तरह के क्यों बन गए?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "The river stopped gene flow, and drift and selection then changed each side separately",
            "नदी ने जीन प्रवाह रोका, फिर अपवाह और वरण ने हर ओर अलग बदलाव किए",
          ),
        },
        {
          id: "want",
          label: t("Each group wanted to be different", "हर समूह अलग होना चाहता था"),
          feedback: t(
            "Living things don't choose to evolve. Isolation plus variation, drift and selection did it, over many generations.",
            "जीव विकसित होना चुनते नहीं। अलगाव, और फिर विभिन्नता, अपवाह और वरण ने, बहुत सी पीढ़ियों में, यह किया।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const self = choiceQuestion(b, {
      name: "self",
      prompt: t(
        "Will geographical isolation (a river, a mountain) be a major factor in the speciation of a plant that pollinates itself?",
        "क्या भौगोलिक अलगाव (नदी, पहाड़) स्व-परागण करने वाले पौधे के जाति-उद्भवन में बड़ा कारक होगा?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "No: it hardly mixes genes with other plants anyway",
            "नहीं: वह वैसे भी दूसरे पौधों से जीन लगभग नहीं मिलाता",
          ),
        },
        {
          id: "yes",
          label: t("Yes, just as for the beetles", "हाँ, भृंगों की तरह ही"),
          feedback: t(
            "Isolation matters because it stops gene flow. A self-pollinating plant (or an asexual organism) has little gene flow to stop.",
            "अलगाव इसलिए मायने रखता है क्योंकि वह जीन प्रवाह रोकता है। स्व-परागण करने वाले पौधे (या अलैंगिक जीव) में रोकने लायक़ जीन प्रवाह कम ही होता है।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const stop = w.definition(
      t(
        "**Stop 7 done.** New species form when populations are cut off from each other (no gene flow) and drift and selection carry them apart until they can't interbreed. Run this backwards and you get a big idea: all species might be related, like branches of one family tree. Next stop.",
        "**पड़ाव 7 पूरा।** नई स्पीशीज़ तब बनती हैं जब आबादियाँ एक-दूसरे से कट जाएँ (जीन प्रवाह नहीं) और अपवाह व वरण उन्हें तब तक दूर ले जाएँ जब तक वे आपस में जनन न कर सकें। इसे उल्टा चलाओ तो एक बड़ा विचार मिलता है: सारी स्पीशीज़ आपस में संबंधित हो सकती हैं, एक वंश-वृक्ष की शाखाओं की तरह। अगला पड़ाव।",
      ),
      "stop",
      { isHidden: true },
    );
    b.when(village.on(QuestionSignal.Correct), theBoard.show(self));
    b.when(self.on(QuestionSignal.Correct), [theBoard.show(stop), theBoard.pass()]);
    return column([
      w.title(t("Grandpa's village, explained", "दादाजी का गाँव, समझा")),
      village,
      self,
      stop,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** NCERT in-text Q1 and Q3; then the log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const factors = choiceQuestion(b, {
      name: "factors",
      prompt: t(
        "Which set of factors could lead to the rise of a new species?",
        "कौन से कारक मिलकर नई स्पीशीज़ बना सकते हैं?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Geographical isolation, genetic drift, natural selection, and changes that stop interbreeding",
            "भौगोलिक अलगाव, आनुवंशिक अपवाह, प्राकृतिक वरण, और जनन रोकने वाले बदलाव",
          ),
        },
        {
          id: "acquired",
          label: t(
            "Changes each individual acquires during its life",
            "हर जीव के अपने जीवन में पाए बदलाव",
          ),
          feedback: t(
            "Acquired changes aren't inherited, so they can't build a new species.",
            "उपार्जित बदलाव वंशानुगत नहीं होते, इसलिए वे नई स्पीशीज़ नहीं बना सकते।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const asexual = choiceQuestion(b, {
      name: "asexual",
      prompt: t(
        "Will geographical isolation be a major factor in the speciation of an organism that reproduces asexually?",
        "क्या भौगोलिक अलगाव अलैंगिक जनन करने वाले जीव के जाति-उद्भवन में बड़ा कारक होगा?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "No: there is no gene flow between individuals to stop",
            "नहीं: जीवों के बीच रोकने को कोई जीन प्रवाह नहीं है",
          ),
        },
        {
          id: "yes",
          label: t("Yes", "हाँ"),
          feedback: t(
            "An asexual organism doesn't mix genes with others, so cutting it off from them changes little.",
            "अलैंगिक जीव दूसरों से जीन नहीं मिलाता, इसलिए उसे उनसे काटने से कम ही फ़र्क पड़ता है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ Micro-evolution changes one species; speciation makes new ones. ✓ A species: individuals that can reproduce with each other. ✓ Gene flow keeps populations alike; isolation stops it. ✓ Isolated groups drift and are selected apart until they can't interbreed. Next: the family tree of all life.",
        "**मिशन लॉग।** ✓ सूक्ष्म विकास एक स्पीशीज़ को बदलता है; जाति-उद्भवन नई बनाता है। ✓ स्पीशीज़: ऐसे जीव जो आपस में जनन कर सकें। ✓ जीन प्रवाह आबादियों को एक जैसा रखता है; अलगाव उसे रोकता है। ✓ अलग हुए समूह अपवाह और वरण से तब तक दूर जाते हैं जब तक आपस में जनन न कर सकें। आगे: सारे जीवन का वंश-वृक्ष।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(asexual.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), factors, asexual, log, space()]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [hook, micro, geneFlow, river, ways, inLife, yourTurn];

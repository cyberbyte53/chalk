import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  BeetleAction,
  BeetleColour,
  BeetleMode,
  HeredityScene,
  beetlePopulationDef,
  heredityStoryDef,
} from "@chalk/prop-heredity";

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** Who, where: Grandpa's terrace garden and his pride, the tall peas. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const garden = b.prop(heredityStoryDef, "garden", { scene: HeredityScene.TerraceGarden });
  b.standsFor(garden, "Grandpa's terrace garden: a row of tall pea plants with violet flowers");
  return column([
    w.title(t("Grandpa's terrace garden", "दादाजी का छत वाला बगीचा")),
    garden,
    w.body(
      t(
        'Every morning Grandpa waters the long bed of pea plants on the roof. Riya, in Class 10, and her little brother Kabir help when they can. Grandpa is proud of his peas: tall plants, violet flowers, fat pods. Last year, when the pods dried, he saved seeds only from his tallest plants. "Tall parents, tall children," he said. "Next year the whole row will be tall."',
        'हर सुबह दादाजी छत पर मटर की लंबी क्यारी को पानी देते हैं। दसवीं में पढ़ने वाली रिया और उसका छोटा भाई कबीर जब हो सके मदद करते हैं। दादाजी को अपनी मटर पर गर्व है: लंबे पौधे, बैंगनी फूल, भरी हुई फलियाँ। पिछले साल फलियाँ सूखने पर उन्होंने केवल सबसे लंबे पौधों के बीज बचाए। "लंबे माता-पिता, लंबे बच्चे," उन्होंने कहा। "अगले साल पूरी क्यारी लंबी होगी।"',
      ),
    ),
    space(),
  ]);
});

/** The mystery: short plants from tall parents. */
const mystery = page("mystery", (b) => {
  const w = wordsOn(b);
  const surprise = b.prop(heredityStoryDef, "surprise", { scene: HeredityScene.ShortSurprise });
  b.standsFor(surprise, "the new pea plants from the saved seeds: most tall, but a few short");
  return column([
    w.title(t("Then the seeds come up", "फिर बीज उगते हैं")),
    surprise,
    w.body(
      t(
        'This spring the saved seeds come up. Most plants shoot up tall. But here and there, about one in every four, a plant stays **short**. Grandpa is puzzled: "Not one of the parents was short. Where did short come from?"',
        'इस बसंत बचाए हुए बीज उगते हैं। ज़्यादातर पौधे लंबे हो जाते हैं। पर कहीं-कहीं, लगभग हर चार में से एक, पौधा **बौना** रह जाता है। दादाजी हैरान हैं: "माता-पिता में से एक भी बौना नहीं था। बौनापन आया कहाँ से?"',
      ),
    ),
    w.body(
      t(
        "Kabir has a question of his own. \"And why do I have Mom's ears, but Riya has Grandpa's?\"",
        'कबीर का अपना एक सवाल है। "और मेरे कान मम्मी जैसे क्यों हैं, पर रिया के दादाजी जैसे?"',
      ),
    ),
    space(),
  ]);
});

/** Why this chapter: heredity and evolution; the stops on the way. */
const why = page("why", (b) => {
  const w = wordsOn(b);
  const album = b.prop(heredityStoryDef, "album", { scene: HeredityScene.FamilyAlbum });
  b.standsFor(album, "the family photo album: Grandpa, Mom, Riya and Kabir side by side");
  return column([
    w.title(t("What this chapter is for", "यह अध्याय किसलिए है")),
    album,
    w.body(
      t(
        "Both questions are the same question: **how are features passed from parents to children?** That is **heredity**. And once you know that, a bigger question opens up: what happens to living things over thousands of generations? That is **evolution**. By the end of this chapter Riya and Kabir will solve Grandpa's mystery, and much more.",
        "दोनों सवाल असल में एक ही सवाल हैं: **माता-पिता से बच्चों तक विशेषताएँ कैसे पहुँचती हैं?** यह **आनुवंशिकता** है। और जब यह समझ आ जाए, तो एक बड़ा सवाल खुलता है: हज़ारों पीढ़ियों में जीवों के साथ क्या होता है? यह **जैव विकास** है। इस अध्याय के अंत तक रिया और कबीर दादाजी की पहेली सुलझा लेंगे, और बहुत कुछ।",
      ),
    ),
    w.definition(
      t(
        "**The stops on the way.** *Heredity:* (1) why children are similar but not the same: *this lesson*. (2) Mendel's peas: one feature. (3) Mendel's peas: two features. (4) What genes do inside a cell. (5) Boy or girl? *Evolution:* (6) The beetles in the bush, and how life may have begun. (7) How new kinds of living things arise. (8) The family tree of all life, and fossils. (9) Evolution step by step, and where humans fit.",
        "**रास्ते के पड़ाव।** *आनुवंशिकता:* (1) बच्चे माता-पिता जैसे क्यों होते हैं पर बिल्कुल वैसे नहीं: *यह पाठ*। (2) मेंडल की मटर: एक विशेषता। (3) मेंडल की मटर: दो विशेषताएँ। (4) कोशिका के भीतर जीन क्या करते हैं। (5) लड़का या लड़की? *जैव विकास:* (6) झाड़ी के भृंग, और जीवन शायद कैसे शुरू हुआ। (7) नए तरह के जीव कैसे बनते हैं। (8) सारे जीवन का वंश-वृक्ष, और जीवाश्म। (9) कदम-दर-कदम विकास, और मनुष्य कहाँ आते हैं।",
      ),
    ),
    w.body(
      t(
        "First stop, starting from zero: why does a child look like its parents, but never exactly the same?",
        "पहला पड़ाव, बिल्कुल शुरू से: बच्चा अपने माता-पिता जैसा क्यों दिखता है, पर कभी बिल्कुल वैसा नहीं?",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** The words we need: trait, DNA, reproduction, variation; asexual vs sexual. */
const basics = page(
  "basics",
  (b) => {
    const w = wordsOn(b);
    const more = choiceQuestion(b, {
      name: "more",
      prompt: t(
        "Which kind of reproduction makes children that differ more from each other?",
        "किस तरह का जनन ऐसे बच्चे बनाता है जो एक-दूसरे से ज़्यादा अलग हों?",
      ),
      options: [
        { id: "right", label: t("Sexual: two parents", "लैंगिक: दो जनक") },
        {
          id: "asexual",
          label: t("Asexual: one parent", "अलैंगिक: एक जनक"),
          feedback: t(
            "With one parent, the only differences come from small copying mistakes. Two parents mix two different sets of DNA, so far more variety appears.",
            "एक जनक में अंतर केवल नक़ल की छोटी ग़लतियों से आते हैं। दो जनक DNA के दो अलग सेट मिलाते हैं, इसलिए कहीं ज़्यादा विविधता आती है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Similar, but not the same", "मिलते-जुलते, पर एक जैसे नहीं")),
      w.definition(
        t(
          "**Trait.** A feature of a living thing, like height, the colour of a flower, or the shape of an ear lobe, is a **trait** (or characteristic).",
          "**लक्षण।** किसी जीव की कोई विशेषता, जैसे लंबाई, फूल का रंग, या कान की लौ का आकार, एक **लक्षण** (या विशेषता) है।",
        ),
      ),
      w.definition(
        t(
          "**DNA.** Inside the nucleus of every cell is **DNA**: a long molecule that carries the instructions for building and running the body. When living things **reproduce** (make new individuals like themselves), they pass copies of their DNA to their young.",
          "**DNA।** हर कोशिका के केंद्रक के अंदर **DNA** होता है: एक लंबा अणु जिसमें शरीर बनाने और चलाने के निर्देश होते हैं। जब जीव **जनन** करते हैं (अपने जैसे नए जीव बनाते हैं), तो वे अपने DNA की प्रतियाँ अपनी संतान को देते हैं।",
        ),
      ),
      w.definition(
        t(
          "**Variation.** The copying of DNA is never perfectly exact, so each new individual is a little different. Differences between individuals of the same kind are called **variations**.",
          "**विभिन्नता।** DNA की नक़ल कभी पूरी तरह सटीक नहीं होती, इसलिए हर नया जीव थोड़ा अलग होता है। एक ही तरह के जीवों के बीच के अंतर **विभिन्नताएँ** कहलाते हैं।",
        ),
      ),
      w.body(
        t(
          "In **asexual** reproduction one parent makes copies of itself, like one bacterium splitting into two. The young are almost identical; the only differences come from small copying mistakes. A field of sugarcane, grown from pieces of stem, looks very uniform. In **sexual** reproduction two parents each give half the DNA, so the child is a new mix. That is why people, who reproduce sexually, look so different from one another.",
          "**अलैंगिक** जनन में एक जनक अपनी प्रतियाँ बनाता है, जैसे एक जीवाणु का दो में बँटना। संतान लगभग एक जैसी होती है; अंतर केवल नक़ल की छोटी ग़लतियों से आते हैं। तने के टुकड़ों से उगाया गन्ने का खेत बहुत एक-सा दिखता है। **लैंगिक** जनन में दोनों जनक आधा-आधा DNA देते हैं, इसलिए बच्चा एक नया मिश्रण होता है। इसीलिए लैंगिक जनन करने वाले मनुष्य एक-दूसरे से इतने अलग दिखते हैं।",
        ),
      ),
      more,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Variations are inherited and pile up over generations (Fig. 9.1), shown with beetles. */
const pileUp = page(
  "pile-up",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "NCERT Fig. 9.1: a variation that appears in one generation is passed on, so the next generation inherits the old differences and adds new ones. Shown with a bush of red beetles (no crows): a green beetle is born and its colour is inherited.",
    );
    const bush = b.prop(beetlePopulationDef, "bush", {
      mode: BeetleMode.Selection,
      beetles: { red: 12, green: 0, blue: 0 },
      hasCrows: false,
      canBreed: true,
      canMutate: true,
      canElephant: false,
      canFood: false,
      canCrows: false,
    });
    b.standsFor(
      bush,
      "a bush of red beetles with no crows: the learner breeds generations and can make a green beetle be born",
    );
    const passed = w.body(
      t(
        "The green beetle's young are green too: the new variation is **inherited**. Each generation keeps the differences it got from its parents and adds a few new ones. Over many generations, variety piles up. A new variation starts in one individual; the more generations it has been passed on, the more of the population usually carries it.",
        "हरे भृंग की संतान भी हरी है: नई विभिन्नता **वंशानुगत** है। हर पीढ़ी अपने माता-पिता से मिले अंतर रखती है और कुछ नए जोड़ती है। बहुत सी पीढ़ियों में विविधता बढ़ती जाती है। नई विभिन्नता एक जीव से शुरू होती है; वह जितनी ज़्यादा पीढ़ियों तक आगे जाती है, आबादी के उतने ज़्यादा जीवों में आम तौर पर होती है।",
      ),
      "passed",
      { isHidden: true },
    );
    const kept = choiceQuestion(b, {
      name: "kept",
      prompt: t(
        "A green beetle is born to red parents and then has young of its own. What colour are most of its young?",
        "लाल माता-पिता से एक हरा भृंग पैदा होता है और फिर उसकी अपनी संतान होती है। उसकी ज़्यादातर संतान किस रंग की होगी?",
      ),
      options: [
        { id: "right", label: t("Green, like it", "हरी, उसकी तरह") },
        {
          id: "red",
          label: t("Red, like its grandparents", "लाल, उसके दादा-दादी की तरह"),
          feedback: t(
            "Try it: make a green beetle be born, then breed. Its young inherit its green colour.",
            "करके देखो: एक हरा भृंग पैदा करो, फिर अगली पीढ़ी बनाओ। उसकी संतान उसका हरा रंग पाती है।",
          ),
        },
      ],
      answer: "right",
    });
    b.when(kept.on(QuestionSignal.Correct), theBoard.show(passed));
    b.witness(
      bush.learner(BeetleAction.Mutate, { colour: BeetleColour.Green }),
      bush.learner(BeetleAction.NextGeneration),
    );
    return column([
      w.title(t("Variations pile up", "विभिन्नताएँ जमा होती हैं")),
      w.body(
        t(
          "Here is a bush with 12 red beetles, and no crows to bother them. Breed a few generations. Then tap **A green beetle is born**: a copying change makes one beetle green. Breed again and watch its colour.",
          "यह एक झाड़ी है जिसमें 12 लाल भृंग हैं, और उन्हें परेशान करने को कोई कौआ नहीं। कुछ पीढ़ियाँ बनाओ। फिर **एक हरा भृंग पैदा हुआ** दबाओ: नक़ल का एक बदलाव एक भृंग को हरा बना देता है। फिर से पीढ़ी बनाओ और उसका रंग देखो।",
        ),
      ),
      bush,
      kept,
      passed,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Not every variation survives equally: the heat-wave bacteria. */
const survive = page(
  "survive",
  (b) => {
    const w = wordsOn(b);
    const heat = choiceQuestion(b, {
      name: "heat",
      prompt: t(
        "A heat wave hits a pond full of bacteria. A few of them, by a copying change, can stand heat. After the heat wave, which bacteria are most common?",
        "जीवाणुओं से भरे तालाब पर लू चलती है। उनमें से कुछ, नक़ल के एक बदलाव से, गर्मी सह सकते हैं। लू के बाद कौन से जीवाणु सबसे ज़्यादा होंगे?",
      ),
      options: [
        { id: "right", label: t("The ones that can stand heat", "जो गर्मी सह सकते हैं") },
        {
          id: "same",
          label: t("All kinds, in the same shares as before", "हर तरह के, पहले जितने ही हिस्से में"),
          feedback: t(
            "The heat kills the ones that can't stand it. The survivors, and their young, are the heat-tolerant kind.",
            "गर्मी उन्हें मार देती है जो इसे नहीं सह सकते। बचे हुए, और उनकी संतान, गर्मी सहने वाले हैं।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Not every variation does equally well", "हर विभिन्नता बराबर काम की नहीं")),
      w.body(
        t(
          "Do all variations have an equal chance of surviving where the living thing finds itself? No. Depending on what the variation is, it can give an advantage, a disadvantage, or nothing at all.",
          "जहाँ जीव रहता है, क्या वहाँ सारी विभिन्नताओं के बचने का बराबर मौक़ा होता है? नहीं। विभिन्नता क्या है, इस पर निर्भर करता है कि वह लाभ दे, हानि दे, या कुछ भी न दे।",
        ),
      ),
      w.body(
        t(
          "So variation is useful to a **species** (a group of living things of the same kind that can breed with each other): if the surroundings change, some variants may survive even when most don't. We'll come back to this in the evolution half of the chapter.",
          "इसलिए विभिन्नता किसी **स्पीशीज़** (एक ही तरह के जीवों का समूह जो आपस में जनन कर सकते हैं) के काम की है: अगर परिवेश बदले, तो कुछ प्रकार बच सकते हैं, भले ही ज़्यादातर न बचें। अध्याय के जैव विकास वाले हिस्से में हम इस पर लौटेंगे।",
        ),
      ),
      heat,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Inherited traits: ear lobes (Activity 9.1). */
const earlobes = page(
  "earlobes",
  (b) => {
    const w = wordsOn(b);
    const ears = b.prop(heredityStoryDef, "ears", { scene: HeredityScene.EarlobesFamily });
    b.standsFor(
      ears,
      "close-ups of the family's ears: Grandpa free, Mom attached, Riya free, Kabir attached",
    );
    const which = choiceQuestion(b, {
      name: "which",
      prompt: t(
        "Kabir broke his arm last year and it healed with a small bump. Riya has free ear lobes. Which of these is an inherited trait?",
        "कबीर का हाथ पिछले साल टूटा था और एक छोटे उभार के साथ जुड़ा। रिया की कान की लौ स्वतंत्र है। इनमें से कौन वंशानुगत लक्षण है?",
      ),
      options: [
        { id: "right", label: t("The shape of the ear lobe", "कान की लौ का आकार") },
        {
          id: "bump",
          label: t("The bump on the healed arm", "जुड़े हाथ का उभार"),
          feedback: t(
            "The bump came from an accident during Kabir's life, not from his parents' DNA. It won't be passed to his children.",
            "उभार कबीर के जीवन में हुई दुर्घटना से आया, माता-पिता के DNA से नहीं। यह उसके बच्चों तक नहीं जाएगा।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Inherited traits", "वंशानुगत लक्षण")),
      w.definition(
        t(
          "**Inherited trait.** A trait that comes from the parents through their DNA is an **inherited** trait. **Heredity** is the passing of traits from parents to children.",
          "**वंशानुगत लक्षण।** जो लक्षण माता-पिता से उनके DNA के ज़रिए आता है, वह **वंशानुगत** लक्षण है। माता-पिता से बच्चों तक लक्षणों का पहुँचना **आनुवंशिकता** है।",
        ),
      ),
      w.body(
        t(
          "A child has all the basic features of a human being, yet doesn't look exactly like its parents. Look at the lowest part of the ear, the **ear lobe**. In some people it hangs **free**; in others it is **attached** closely to the side of the head. These are two variants found in people.",
          "बच्चे में मनुष्य की सारी मूल विशेषताएँ होती हैं, फिर भी वह अपने माता-पिता जैसा बिल्कुल नहीं दिखता। कान के सबसे निचले हिस्से, **कान की लौ**, को देखो। कुछ लोगों में यह **स्वतंत्र** लटकती है; दूसरों में यह सिर के किनारे से **जुड़ी** होती है। ये लोगों में पाए जाने वाले दो प्रकार हैं।",
        ),
      ),
      ears,
      w.note(
        t(
          "Try NCERT Activity 9.1: count free and attached ear lobes in your class, then ask about each person's parents. Can you guess a rule?",
          "NCERT क्रियाकलाप 9.1 करो: अपनी कक्षा में स्वतंत्र और जुड़ी कान की लौ गिनो, फिर हर एक के माता-पिता के बारे में पूछो। क्या तुम कोई नियम अनुमान लगा सकते हो?",
        ),
      ),
      which,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** Back to the family: ears explained, the peas still a mystery. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const ears = b.prop(heredityStoryDef, "ears", { scene: HeredityScene.EarlobesFamily });
    b.standsFor(
      ears,
      "the family's ears again: Grandpa free, Mom attached, Riya free, Kabir attached",
    );
    const kabir = choiceQuestion(b, {
      name: "kabir",
      prompt: t(
        "So why do Riya and Kabir have different ear lobes, though they have the same parents?",
        "तो रिया और कबीर की कान की लौ अलग क्यों है, जबकि उनके माता-पिता एक ही हैं?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Each child gets a different mix of the parents' DNA",
            "हर बच्चे को माता-पिता के DNA का अलग मिश्रण मिलता है",
          ),
        },
        {
          id: "copy",
          label: t("One of them is not inherited at all", "उनमें से एक वंशानुगत है ही नहीं"),
          feedback: t(
            "Ear-lobe shape is inherited for both. Sexual reproduction mixes DNA afresh for every child, so brothers and sisters differ.",
            "कान की लौ का आकार दोनों में वंशानुगत है। लैंगिक जनन हर बच्चे के लिए DNA नए सिरे से मिलाता है, इसलिए भाई-बहन अलग होते हैं।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const peas = w.definition(
      t(
        "**Stop 1 done.** Children inherit their parents' traits, but sexual reproduction mixes them, so every child is a new combination. But Grandpa's mystery is sharper than that: *both* parents were tall, so where did short come from? Next stop: the monk who grew peas and, for the first time, counted them.",
        "**पड़ाव 1 पूरा।** बच्चे माता-पिता के लक्षण पाते हैं, पर लैंगिक जनन उन्हें मिलाता है, इसलिए हर बच्चा एक नया मेल है। पर दादाजी की पहेली इससे गहरी है: *दोनों* जनक लंबे थे, तो बौनापन आया कहाँ से? अगला पड़ाव: वह साधु जिसने मटर उगाई और पहली बार उन्हें गिना।",
      ),
      "peas",
      { isHidden: true },
    );
    b.when(kabir.on(QuestionSignal.Correct), [theBoard.show(peas), theBoard.pass()]);
    return column([w.title(t("Back on the terrace", "फिर छत पर")), ears, kabir, peas, space()]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** NCERT 9.1 in-text questions. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const earlier = choiceQuestion(b, {
      name: "earlier",
      prompt: t(
        "In a species that reproduces asexually, trait A is found in 10% of the population and trait B in 60%. Which trait probably arose earlier?",
        "अलैंगिक जनन करने वाली एक स्पीशीज़ में लक्षण A 10% जीवों में है और लक्षण B 60% में। कौन सा लक्षण शायद पहले आया?",
      ),
      options: [
        { id: "right", label: t("Trait B", "लक्षण B") },
        {
          id: "a",
          label: t("Trait A", "लक्षण A"),
          feedback: t(
            "A variation starts in one individual and spreads as it is copied generation after generation. The one that has spread further (60%) has had more time.",
            "विभिन्नता एक जीव में शुरू होती है और पीढ़ी-दर-पीढ़ी नक़ल होकर फैलती है। जो ज़्यादा फैला है (60%), उसे ज़्यादा समय मिला है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const promote = choiceQuestion(b, {
      name: "promote",
      prompt: t(
        "How does variation help a species survive?",
        "विभिन्नता किसी स्पीशीज़ को बचे रहने में कैसे मदद करती है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "If conditions change, some variants may be able to survive them",
            "परिस्थितियाँ बदलें, तो कुछ प्रकार उन्हें झेलकर बच सकते हैं",
          ),
        },
        {
          id: "all",
          label: t(
            "Every variation makes each individual stronger",
            "हर विभिन्नता हर जीव को ज़्यादा मज़बूत बनाती है",
          ),
          feedback: t(
            "Most variations make no difference, and some harm. The point is that a varied population is likely to include *some* individuals that suit new conditions.",
            "ज़्यादातर विभिन्नताएँ कोई फ़र्क नहीं डालतीं, और कुछ नुकसान करती हैं। बात यह है कि विविध आबादी में नई परिस्थितियों के अनुकूल *कुछ* जीव होने की संभावना रहती है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ Traits are passed from parents to children through DNA. ✓ DNA copying is never exact, and sexual reproduction mixes two parents' DNA, so children vary. ✓ Variations are inherited and pile up over generations; some help survival. ? Short from tall parents: still unsolved. Next: Mendel's peas.",
        "**मिशन लॉग।** ✓ लक्षण DNA के ज़रिए माता-पिता से बच्चों तक पहुँचते हैं। ✓ DNA की नक़ल कभी सटीक नहीं होती, और लैंगिक जनन दो जनकों का DNA मिलाता है, इसलिए बच्चे अलग होते हैं। ✓ विभिन्नताएँ वंशानुगत होती हैं और पीढ़ियों में जमा होती हैं; कुछ बचे रहने में मदद करती हैं। ? लंबे माता-पिता से बौना: अभी अनसुलझा। आगे: मेंडल की मटर।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(promote.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), earlier, promote, log, space()]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [hook, mystery, why, basics, pileUp, survive, earlobes, inLife, yourTurn];

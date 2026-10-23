import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  BeetleAction,
  BeetleColour,
  BeetleMode,
  Food,
  HeredityScene,
  beetlePopulationDef,
  heredityStoryDef,
} from "@chalk/prop-heredity";

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** The beetles and the crows; the evolution half begins. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const bush = b.prop(heredityStoryDef, "bush", { scene: HeredityScene.BeetleBush });
  b.standsFor(bush, "a green bush with red beetles on it, and a crow flying overhead");
  return column([
    w.title(t("The beetles in the bush", "झाड़ी के भृंग")),
    bush,
    w.body(
      t(
        "**Stop 6: the evolution half begins.** The heredity half showed how traits pass from one generation to the next, and how variations arise: copying changes in DNA, and the mixing in sexual reproduction. Now look further ahead. What happens to those variations over **many** generations?",
        "**पड़ाव 6: जैव विकास का हिस्सा शुरू।** आनुवंशिकता वाले हिस्से ने दिखाया कि लक्षण एक पीढ़ी से अगली तक कैसे जाते हैं, और विभिन्नताएँ कैसे आती हैं: DNA की नक़ल में बदलाव, और लैंगिक जनन का मिश्रण। अब आगे देखो। **बहुत सी** पीढ़ियों में इन विभिन्नताओं का क्या होता है?",
      ),
    ),
    w.body(
      t(
        'Kabir has been watching the big bush at the corner of the terrace. Red beetles live on its green leaves, and every day the crows come and pick them off. "Grandpa," he says, "what if one beetle were green?"',
        'कबीर छत के कोने की बड़ी झाड़ी को देखता रहा है। उसकी हरी पत्तियों पर लाल भृंग रहते हैं, और हर दिन कौए आकर उन्हें चुन ले जाते हैं। "दादाजी," वह कहता है, "अगर एक भृंग हरा होता तो?"',
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Population, generation; the set-up: 12 red beetles, crows. Situation 1: green → natural selection. */
const selection = page(
  "selection",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "NCERT 9.3.1, situation 1: red beetles on green leaves, eaten by crows. A green beetle is born and passes its colour on. Crows can't see green beetles, so green spreads: natural selection.",
    );
    const bush = b.prop(beetlePopulationDef, "bush", {
      mode: BeetleMode.Selection,
      beetles: { red: 12, green: 0, blue: 0 },
      hasCrows: true,
      canBreed: true,
      canMutate: true,
      canElephant: false,
      canFood: false,
      canCrows: false,
      seed: 11,
    });
    b.standsFor(
      bush,
      "12 red beetles on a green bush with crows: the learner makes a green beetle be born and breeds generations",
    );
    const spread = choiceQuestion(b, {
      name: "spread",
      prompt: t(
        "Make a green beetle be born, then breed about 10 generations. What happens to the green beetles?",
        "एक हरा भृंग पैदा करो, फिर लगभग 10 पीढ़ियाँ बनाओ। हरे भृंगों का क्या होता है?",
      ),
      options: [
        { id: "right", label: t("They become more and more common", "वे बढ़ते-बढ़ते आम हो जाते हैं") },
        {
          id: "vanish",
          label: t("They die out", "वे ख़त्म हो जाते हैं"),
          feedback: t(
            "Breed more generations and watch the bars: the crows keep eating red beetles, which they can see, and miss the green ones.",
            "और पीढ़ियाँ बनाकर पट्टियाँ देखो: कौए लाल भृंगों को खाते रहते हैं, जो उन्हें दिखते हैं, और हरे छोड़ देते हैं।",
          ),
        },
      ],
      answer: "right",
    });
    b.witness(
      bush.learner(BeetleAction.Mutate, { colour: BeetleColour.Green }),
      ...Array.from({ length: 8 }, () => bush.learner(BeetleAction.NextGeneration)),
    );
    return column([
      w.title(t("Situation 1: a green beetle", "स्थिति 1: एक हरा भृंग")),
      w.definition(
        t(
          "**Population and generation.** All the beetles of one kind living together in a place make a **population**. Each round of parents having young is a **generation**.",
          "**आबादी और पीढ़ी।** एक जगह साथ रहने वाले एक ही तरह के सारे भृंग एक **आबादी** बनाते हैं। माता-पिता से संतान होने का हर दौर एक **पीढ़ी** है।",
        ),
      ),
      w.body(
        t(
          "Twelve red beetles live on green leaves. Their population grows by sexual reproduction, so variations appear. Crows eat beetles; the more beetles eaten, the fewer left to reproduce. Now suppose a copying change makes one beetle **green**, and it passes that colour to its young. Try it.",
          "बारह लाल भृंग हरी पत्तियों पर रहते हैं। उनकी आबादी लैंगिक जनन से बढ़ती है, इसलिए विभिन्नताएँ आती हैं। कौए भृंग खाते हैं; जितने ज़्यादा भृंग खाए जाएँ, जनन को उतने कम बचें। अब मान लो नक़ल के एक बदलाव से एक भृंग **हरा** हो जाता है, और वह यह रंग अपनी संतान को देता है। करके देखो।",
        ),
      ),
      bush,
      spread,
      w.definition(
        t(
          "**Natural selection.** Crows can't see green beetles on green leaves, so the green ones survive to breed and the red ones keep getting eaten. A variation that gives a **survival advantage** becomes common: it is **naturally selected**. Here the crows do the selecting. The result is an **adaptation**: the population comes to fit its surroundings better.",
          "**प्राकृतिक वरण।** कौए हरी पत्तियों पर हरे भृंग नहीं देख पाते, इसलिए हरे भृंग बचकर जनन करते हैं और लाल खाए जाते रहते हैं। जो विभिन्नता **बचे रहने का लाभ** दे, वह आम हो जाती है: उसका **प्राकृतिक वरण** होता है। यहाँ चुनाव कौए करते हैं। परिणाम एक **अनुकूलन** है: आबादी अपने परिवेश के ज़्यादा अनुकूल हो जाती है।",
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Situation 2: a blue beetle and an elephant: genetic drift. */
const drift = page(
  "drift",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "NCERT situation 2: a blue beetle arises; crows see blue as well as red, so no advantage. An elephant stamps on the bush and by chance the few survivors are mostly blue: genetic drift in a small population.",
    );
    const bush = b.prop(beetlePopulationDef, "bush", {
      mode: BeetleMode.Selection,
      beetles: { red: 30, green: 0, blue: 6 },
      hasCrows: true,
      canBreed: true,
      canMutate: false,
      canElephant: true,
      canFood: false,
      canCrows: false,
      seed: 5,
    });
    b.standsFor(
      bush,
      "a bush of mostly red beetles with a few blue ones; the learner can send an elephant that kills most of them at random",
    );
    const why = choiceQuestion(b, {
      name: "why",
      prompt: t(
        "After the elephant, blue can become common even though crows see blue just as well as red. Why?",
        "हाथी के बाद नीला आम हो सकता है, जबकि कौए नीला भी लाल जितना ही देखते हैं। क्यों?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "By pure chance, the few survivors happened to be mostly blue",
            "केवल संयोग से, बचे हुए थोड़े भृंग ज़्यादातर नीले निकले",
          ),
        },
        {
          id: "better",
          label: t("Blue beetles are better at surviving", "नीले भृंग बचे रहने में बेहतर हैं"),
          feedback: t(
            "Blue gives no advantage: the crows see it fine. The elephant killed beetles at random, and in a small group of survivors chance decides.",
            "नीला कोई लाभ नहीं देता: कौए उसे अच्छे से देखते हैं। हाथी ने बिना चुने भृंग मारे, और बचे हुए छोटे समूह में संयोग तय करता है।",
          ),
        },
      ],
      answer: "right",
    });
    b.witness(bush.learner(BeetleAction.Elephant), bush.learner(BeetleAction.NextGeneration));
    return column([
      w.title(t("Situation 2: blue, and an elephant", "स्थिति 2: नीला, और एक हाथी")),
      w.body(
        t(
          "Now suppose the new colour is **blue**. Crows see blue beetles on green leaves as easily as red ones, so blue gives no advantage, and at first only a few are blue. Then an elephant comes by and stamps on the bush, killing most beetles. Send the elephant, then breed. Try it a few times with **Start again**: it comes out differently each time.",
          "अब मान लो नया रंग **नीला** है। कौए हरी पत्तियों पर नीले भृंग भी लाल जितनी आसानी से देखते हैं, इसलिए नीला कोई लाभ नहीं देता, और शुरू में थोड़े ही नीले हैं। फिर एक हाथी आकर झाड़ी को रौंद देता है, और ज़्यादातर भृंग मर जाते हैं। हाथी भेजो, फिर पीढ़ी बनाओ। **फिर से** दबाकर कुछ बार आज़माओ: हर बार अलग नतीजा आता है।",
        ),
      ),
      bush,
      why,
      w.definition(
        t(
          "**Genetic drift.** In a **small population**, accidents can change how common a trait is even when it gives **no advantage**. This is **genetic drift**. It creates diversity without any adaptation. In a very large population, one elephant couldn't make such a difference.",
          "**आनुवंशिक अपवाह।** **छोटी आबादी** में दुर्घटनाएँ किसी लक्षण के आम होने को बदल सकती हैं, भले ही वह **कोई लाभ न** दे। यह **आनुवंशिक अपवाह** है। यह बिना किसी अनुकूलन के विविधता बनाता है। बहुत बड़ी आबादी में एक हाथी इतना फ़र्क नहीं डाल पाता।",
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Evolution defined: the frequency of inherited traits changes over generations. */
const evolution = page(
  "evolution",
  (b) => {
    const w = wordsOn(b);
    const both = choiceQuestion(b, {
      name: "both",
      prompt: t("What do situations 1 and 2 have in common?", "स्थिति 1 और 2 में क्या एक जैसा है?"),
      options: [
        {
          id: "right",
          label: t(
            "A rare inherited colour became common in the population",
            "एक दुर्लभ वंशानुगत रंग आबादी में आम हो गया",
          ),
        },
        {
          id: "advantage",
          label: t(
            "In both, the new colour helped beetles survive",
            "दोनों में नए रंग ने भृंगों को बचने में मदद की",
          ),
          feedback: t(
            "Only green helped. Blue spread by chance. What's common is the result: an inherited trait's share changed over generations.",
            "केवल हरे ने मदद की। नीला संयोग से फैला। एक जैसा है परिणाम: एक वंशानुगत लक्षण का हिस्सा पीढ़ियों में बदला।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("So what is evolution?", "तो जैव विकास क्या है?")),
      w.body(
        t(
          "In both situations, a variation that started out rare became a common characteristic. The **frequency** of an inherited trait (how common it is) changed over generations. Since genes control traits, the frequency of certain **genes** in the population changed.",
          "दोनों स्थितियों में, जो विभिन्नता शुरू में दुर्लभ थी, वह आम विशेषता बन गई। एक वंशानुगत लक्षण की **आवृत्ति** (वह कितना आम है) पीढ़ियों में बदली। चूँकि जीन लक्षणों को नियंत्रित करते हैं, आबादी में कुछ **जीनों** की आवृत्ति बदली।",
        ),
      ),
      w.definition(
        t(
          "**Evolution.** A change, over generations, in how common certain inherited traits (and so genes) are in a population is the essence of **evolution**. **Natural selection** directs it towards adaptation; **genetic drift** changes it by chance.",
          "**जैव विकास।** पीढ़ियों में किसी आबादी में कुछ वंशानुगत लक्षणों (और इसलिए जीनों) के आम होने में बदलाव **जैव विकास** का सार है। **प्राकृतिक वरण** इसे अनुकूलन की ओर ले जाता है; **आनुवंशिक अपवाह** इसे संयोग से बदलता है।",
        ),
      ),
      both,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Situation 3: starvation; acquired traits aren't inherited; the mice tails. */
const acquired = page(
  "acquired",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "NCERT situation 3 and 9.3.2: a plant disease makes food scarce, so beetles are small; when food returns, their young are normal size again. Weight lost by starving is acquired, not inherited.",
    );
    const bush = b.prop(beetlePopulationDef, "bush", {
      mode: BeetleMode.Selection,
      beetles: { red: 20, green: 0, blue: 0 },
      hasCrows: false,
      food: Food.Plenty,
      canBreed: true,
      canMutate: false,
      canElephant: false,
      canFood: true,
      canCrows: false,
    });
    b.standsFor(
      bush,
      "a bush of red beetles whose food the learner can make scarce or plentiful, then breed generations",
    );
    const weight = choiceQuestion(b, {
      name: "weight",
      prompt: t(
        "Make food scarce for a few generations, then bring it back and breed. What size are the new beetles?",
        "कुछ पीढ़ियों तक भोजन कम करो, फिर लौटाकर पीढ़ी बनाओ। नए भृंग किस आकार के हैं?",
      ),
      options: [
        { id: "right", label: t("Normal size again", "फिर से सामान्य आकार") },
        {
          id: "small",
          label: t("Still small, like their parents", "अब भी छोटे, अपने माता-पिता की तरह"),
          feedback: t(
            "Starving changed the beetles' bodies, not the DNA in their germ cells. With enough food, the young grow to normal size.",
            "भूख ने भृंगों के शरीर बदले, उनकी जनन कोशिकाओं का DNA नहीं। पर्याप्त भोजन मिलने पर संतान सामान्य आकार की होती है।",
          ),
        },
      ],
      answer: "right",
    });
    b.witness(
      bush.learner(BeetleAction.SetFood, { food: Food.Scarce }),
      bush.learner(BeetleAction.NextGeneration),
      bush.learner(BeetleAction.SetFood, { food: Food.Plenty }),
      bush.learner(BeetleAction.NextGeneration),
    );
    return column([
      w.title(t("Situation 3: hungry years", "स्थिति 3: भूख के साल")),
      w.body(
        t(
          "Now a plant disease strikes the bushes, and there are fewer leaves to eat. The beetles are poorly fed, and adult beetles weigh less than before. But no genetic change is happening. After a few generations the disease is gone and there is plenty of food again. What will the beetles weigh then?",
          "अब झाड़ियों पर एक पौधा-रोग आता है, और खाने को कम पत्तियाँ हैं। भृंगों को ठीक से खाना नहीं मिलता, और बड़े भृंगों का वज़न पहले से कम हो जाता है। पर कोई आनुवंशिक बदलाव नहीं हो रहा। कुछ पीढ़ियों बाद रोग चला जाता है और फिर भरपूर भोजन होता है। तब भृंगों का वज़न क्या होगा?",
        ),
      ),
      bush,
      weight,
      w.definition(
        t(
          "**Acquired and inherited traits.** A trait an individual gets during its lifetime, from its surroundings or experience, is **acquired**. Changes in non-reproductive tissues can't change the DNA of the germ cells, so acquired traits **are not inherited**, and they can't direct evolution. NCERT's other example: cut off the tails of mice by surgery for generation after generation, and their young are still born with tails.",
          "**उपार्जित और वंशानुगत लक्षण।** जो लक्षण किसी जीव को उसके जीवन में, परिवेश या अनुभव से मिले, वह **उपार्जित** है। जनन के अलावा अन्य ऊतकों के बदलाव जनन कोशिकाओं का DNA नहीं बदल सकते, इसलिए उपार्जित लक्षण **वंशानुगत नहीं होते**, और वे जैव विकास को दिशा नहीं दे सकते। NCERT का दूसरा उदाहरण: पीढ़ी-दर-पीढ़ी चूहों की पूँछ शल्य से काट दो, फिर भी उनकी संतान पूँछ के साथ ही पैदा होती है।",
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Darwin, Mendel, and the origin of life (boxes). */
const darwin = page(
  "darwin",
  (b) => {
    const w = wordsOn(b);
    const miller = choiceQuestion(b, {
      name: "miller",
      prompt: t(
        "What did the Miller–Urey experiment make, from a mix of gases like those on the early earth with sparks passed through it?",
        "मिलर-यूरे प्रयोग में आदि-पृथ्वी जैसी गैसों के मिश्रण में चिंगारियाँ गुज़ारने से क्या बना?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Simple carbon compounds, including amino acids (the building blocks of proteins)",
            "सरल कार्बन यौगिक, जिनमें अमीनो अम्ल भी थे (प्रोटीन की ईंटें)",
          ),
        },
        {
          id: "cells",
          label: t("Living cells", "जीवित कोशिकाएँ"),
          feedback: t(
            "No living thing came out of the flask. It made some of the molecules life is built from: amino acids.",
            "फ़्लास्क से कोई जीव नहीं निकला। उसने वे कुछ अणु बनाए जिनसे जीवन बनता है: अमीनो अम्ल।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Darwin, Mendel, and the start of life", "डार्विन, मेंडल, और जीवन की शुरुआत")),
      w.body(
        t(
          "Charles Darwin (1809–1882) sailed for five years around South America and later proposed that species evolve by **natural selection**. But he didn't know how variations arise or are inherited. Mendel's experiments held the answer, yet neither man knew of the other's work. That is why heredity and evolution are studied together.",
          "चार्ल्स डार्विन (1809–1882) ने पाँच साल दक्षिण अमेरिका के आसपास समुद्री यात्रा की और बाद में कहा कि स्पीशीज़ **प्राकृतिक वरण** से विकसित होती हैं। पर उन्हें नहीं पता था कि विभिन्नताएँ कैसे आती हैं या वंशानुगत कैसे होती हैं। उत्तर मेंडल के प्रयोगों में था, फिर भी दोनों एक-दूसरे के काम से अनजान थे। इसीलिए आनुवंशिकता और जैव विकास साथ पढ़े जाते हैं।",
        ),
      ),
      w.body(
        t(
          'Evolution explains how living things changed once there was life. But where did the very first life come from? Neither Darwin nor Mendel tells us. J.B.S. Haldane (a British scientist who later became an Indian citizen) suggested in 1929 that life arose from the simple molecules on the early earth. In 1953 Stanley Miller and Harold Urey made an "early earth" in a flask: ammonia, methane and hydrogen sulphide over water, no oxygen, just below 100°C, with sparks for lightning. After a week, 15% of the carbon had become simple carbon compounds, including amino acids.',
          'जैव विकास बताता है कि जीवन होने के बाद जीव कैसे बदले। पर सबसे पहला जीवन आया कहाँ से? न डार्विन यह बताते हैं, न मेंडल। जे.बी.एस. हाल्डेन (एक ब्रिटिश वैज्ञानिक जो बाद में भारत के नागरिक बने) ने 1929 में कहा कि जीवन आदि-पृथ्वी के सरल अणुओं से पैदा हुआ। 1953 में स्टैनली मिलर और हैरल्ड यूरे ने फ़्लास्क में एक "आदि पृथ्वी" बनाई: पानी के ऊपर अमोनिया, मीथेन और हाइड्रोजन सल्फ़ाइड, कोई ऑक्सीजन नहीं, 100°C से थोड़ा कम, और बिजली के लिए चिंगारियाँ। एक हफ़्ते बाद 15% कार्बन सरल कार्बन यौगिकों में बदल गया था, जिनमें अमीनो अम्ल भी थे।',
        ),
      ),
      miller,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** Grandpa's bush, a year on; and the tigers. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const green = choiceQuestion(b, {
      name: "green",
      prompt: t(
        "A year later, most beetles in Grandpa's bush are green. Kabir says, \"The beetles turned green to hide from the crows.\" What's wrong with that?",
        'एक साल बाद दादाजी की झाड़ी में ज़्यादातर भृंग हरे हैं। कबीर कहता है, "भृंग कौओं से छिपने के लिए हरे हो गए।" इसमें क्या ग़लत है?',
      ),
      options: [
        {
          id: "right",
          label: t(
            "No beetle changed colour: green ones were born by chance, and the crows ate more of the red",
            "किसी भृंग ने रंग नहीं बदला: हरे संयोग से पैदा हुए, और कौओं ने लाल ज़्यादा खाए",
          ),
        },
        {
          id: "nothing",
          label: t(
            "Nothing: beetles change colour when they need to",
            "कुछ नहीं: ज़रूरत पड़ने पर भृंग रंग बदल लेते हैं",
          ),
          feedback: t(
            "A beetle can't change its inherited colour by needing it. Variations arise by chance; selection keeps the useful ones.",
            "भृंग ज़रूरत से अपना वंशानुगत रंग नहीं बदल सकता। विभिन्नताएँ संयोग से आती हैं; वरण काम वाली को बचाए रखता है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const tigers = choiceQuestion(b, {
      name: "tigers",
      prompt: t(
        "Why is the small number of surviving tigers a worry from the point of view of genetics?",
        "बचे हुए बाघों की कम संख्या आनुवंशिकी की दृष्टि से चिंता क्यों है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "A small population has little variation and can be wiped out by chance",
            "छोटी आबादी में विभिन्नता कम होती है और वह संयोग से मिट सकती है",
          ),
        },
        {
          id: "food",
          label: t("They'll run out of food", "उनका भोजन ख़त्म हो जाएगा"),
          feedback: t(
            "Think of the elephant: in a small population, chance events and drift matter a lot, and there are few variants to cope with change.",
            "हाथी को याद करो: छोटी आबादी में संयोग की घटनाएँ और अपवाह बहुत मायने रखते हैं, और बदलाव से निपटने को कम प्रकार होते हैं।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const stop = w.definition(
      t(
        "**Stop 6 done.** Evolution is the change in how common inherited traits are over generations: steered by natural selection, nudged by drift, and never driven by what an individual acquires in its lifetime. But the beetles are still one species. How do *new* species come about? Next stop.",
        "**पड़ाव 6 पूरा।** जैव विकास पीढ़ियों में वंशानुगत लक्षणों के आम होने में बदलाव है: प्राकृतिक वरण से दिशा पाता, अपवाह से धकेला जाता, और कभी किसी जीव के जीवन में पाए लक्षणों से नहीं चलता। पर भृंग अब भी एक ही स्पीशीज़ हैं। *नई* स्पीशीज़ कैसे बनती हैं? अगला पड़ाव।",
      ),
      "stop",
      { isHidden: true },
    );
    b.when(green.on(QuestionSignal.Correct), theBoard.show(tigers));
    b.when(tigers.on(QuestionSignal.Correct), [theBoard.show(stop), theBoard.pass()]);
    return column([
      w.title(t("A year on, in the bush", "एक साल बाद, झाड़ी में")),
      green,
      tigers,
      stop,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** NCERT in-text Q1, Q2 and Exercise 12; then the log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const ways = choiceQuestion(b, {
      name: "ways",
      prompt: t(
        "In which ways can individuals with a particular trait increase in a population?",
        "किसी ख़ास लक्षण वाले जीव आबादी में किन तरीक़ों से बढ़ सकते हैं?",
      ),
      options: [
        {
          id: "right",
          label: t("By natural selection, or by genetic drift", "प्राकृतिक वरण से, या आनुवंशिक अपवाह से"),
        },
        {
          id: "acquired",
          label: t(
            "By individuals acquiring the trait during their lives",
            "जीवों के अपने जीवन में वह लक्षण पा लेने से",
          ),
          feedback: t(
            "Acquired traits aren't passed on. A trait spreads if it gives an advantage (selection) or by chance in a small population (drift).",
            "उपार्जित लक्षण आगे नहीं जाते। लक्षण तब फैलता है जब वह लाभ दे (वरण) या छोटी आबादी में संयोग से (अपवाह)।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const only = choiceQuestion(b, {
      name: "only",
      prompt: t(
        '"Only variations that give an advantage survive in a population." Do you agree?',
        '"आबादी में केवल वही विभिन्नताएँ बचती हैं जो लाभ देती हैं।" क्या तुम सहमत हो?',
      ),
      options: [
        {
          id: "right",
          label: t(
            "No: some spread by drift, with no advantage",
            "नहीं: कुछ अपवाह से, बिना लाभ के, फैलती हैं",
          ),
        },
        {
          id: "yes",
          label: t("Yes", "हाँ"),
          feedback: t(
            "Remember the blue beetles: no advantage at all, yet after the elephant they became common.",
            "नीले भृंग याद करो: कोई लाभ नहीं, फिर भी हाथी के बाद वे आम हो गए।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ Evolution: inherited traits (genes) change in frequency over generations. ✓ Natural selection spreads variations that help survival, giving adaptations. ✓ Genetic drift spreads variations by chance, mostly in small populations. ✓ Acquired traits are not inherited. Next: how new species arise.",
        "**मिशन लॉग।** ✓ जैव विकास: पीढ़ियों में वंशानुगत लक्षणों (जीनों) की आवृत्ति बदलती है। ✓ प्राकृतिक वरण बचे रहने में मदद करने वाली विभिन्नताएँ फैलाता है, जिससे अनुकूलन बनते हैं। ✓ आनुवंशिक अपवाह विभिन्नताओं को संयोग से फैलाता है, ज़्यादातर छोटी आबादियों में। ✓ उपार्जित लक्षण वंशानुगत नहीं होते। आगे: नई स्पीशीज़ कैसे बनती हैं।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(only.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), ways, only, log, space()]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [hook, selection, drift, evolution, acquired, darwin, inLife, yourTurn];

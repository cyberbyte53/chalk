import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, goalQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  EcoAction,
  EcoDerived,
  EcoThing,
  EnvScene,
  ecosystemDef,
  environmentSceneDef,
} from "@chalk/prop-environment";

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** Who and where: the eco-club's Environment Week challenge. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const notice = b.prop(environmentSceneDef, "notice", { scene: EnvScene.EcoClubNotice });
  b.standsFor(notice, "the school notice board: the eco-club's Environment Week challenge");
  return column([
    w.title(t("The eco-club's challenge", "इको-क्लब की चुनौती")),
    notice,
    w.body(
      t(
        "Environment Week is a month away. The school eco-club has pinned up a challenge with two halves. **One:** keep a sealed jar of pond life alive for 30 days, with nothing added after the lid goes on. **Two:** cut your family's garbage in half for a week. Riya, in Class 10, signs up her little brother Kabir and herself before he can say no.",
        "पर्यावरण सप्ताह एक महीना दूर है। स्कूल के इको-क्लब ने दो हिस्सों वाली एक चुनौती लगाई है। **पहला:** तालाब के जीवों वाले एक बंद जार को 30 दिन ज़िंदा रखो, ढक्कन लगने के बाद कुछ भी डाले बिना। **दूसरा:** एक हफ़्ते के लिए अपने परिवार का कचरा आधा करो। दसवीं में पढ़ने वाली रिया, अपने छोटे भाई कबीर के मना करने से पहले ही, दोनों का नाम लिखा देती है।",
      ),
    ),
    space(),
  ]);
});

/** The first jar fails: cloudy and smelly in four days. */
const firstJar = page("first-jar", (b) => {
  const w = wordsOn(b);
  const pond = b.prop(environmentSceneDef, "pond", { scene: EnvScene.TubPond });
  b.standsFor(pond, "Grandpa's tub-pond on the terrace, with water weed, snails and tiny fish");
  const jar = b.prop(environmentSceneDef, "jar", { scene: EnvScene.CloudyJar });
  b.standsFor(jar, "Kabir's first jar: cloudy, smelly water and fish gasping at the top");
  return column([
    w.title(t("The first jar", "पहला जार")),
    pond,
    w.body(
      t(
        "Grandpa keeps a little pond in an old tub on the terrace. Kabir scoops out six tiny fish, fills a big jar with pond water, screws the lid on and puts it on his shelf, away from the window so it won't get too hot.",
        "दादाजी छत पर एक पुराने टब में छोटा-सा तालाब रखते हैं। कबीर उसमें से छह नन्ही मछलियाँ निकालता है, एक बड़ा जार तालाब के पानी से भरता है, ढक्कन कसता है और उसे खिड़की से दूर अपनी अलमारी पर रख देता है, ताकि वह ज़्यादा गर्म न हो।",
      ),
    ),
    jar,
    w.body(
      t(
        'Four days later the water is cloudy and smells, and the fish are gulping at the top. "But Grandpa\'s tub has been fine for years," says Kabir, "and nobody ever cleans it."',
        'चार दिन बाद पानी धुँधला है और बदबू दे रहा है, और मछलियाँ ऊपर आकर हवा के लिए मुँह खोल रही हैं। "पर दादाजी का टब तो सालों से ठीक है," कबीर कहता है, "और उसे तो कोई कभी साफ़ भी नहीं करता।"',
      ),
    ),
    space(),
  ]);
});

/** Why this chapter: the mission and the stops on the way. */
const why = page("why", (b) => {
  const w = wordsOn(b);
  return column([
    w.title(t("What this chapter is for", "यह अध्याय किसलिए है")),
    w.body(
      t(
        "That's the mission: work out what Grandpa's tub has that Kabir's jar doesn't, and then what happens to everything we throw away. Each lesson fixes one thing about the jar, or the bin.",
        "यही मिशन है: पता करो कि दादाजी के टब में ऐसा क्या है जो कबीर के जार में नहीं, और फिर यह कि जो कुछ हम फेंकते हैं उसका क्या होता है। हर पाठ जार की, या कूड़ेदान की, एक बात ठीक करता है।",
      ),
    ),
    w.definition(
      t(
        "**The stops on the way.** (1) What a jar-world needs: *this lesson*. (2) Who eats whom. (3) Where the energy goes. (4) Poison that climbs up a food chain. (5) The sky's sunscreen: the ozone layer. (6) What rots and what stays. (7) Our garbage, and then Environment Day.",
        "**रास्ते के पड़ाव।** (1) जार-संसार को क्या चाहिए: *यह पाठ*। (2) कौन किसे खाता है। (3) ऊर्जा कहाँ जाती है। (4) आहार श्रृंखला में ऊपर चढ़ता ज़हर। (5) आसमान की सनस्क्रीन: ओज़ोन परत। (6) क्या सड़ता है और क्या बचा रहता है। (7) हमारा कचरा, और फिर पर्यावरण दिवस।",
      ),
    ),
    w.body(
      t(
        "First stop, starting from zero: what is a pond, or a jar, made of?",
        "पहला पड़ाव, बिल्कुल शुरू से: तालाब, या जार, किन चीज़ों से बना है?",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Environment, ecosystem, biotic and abiotic components. */
const parts = page(
  "parts",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "abiotic",
      prompt: t(
        "In a garden, which of these is an abiotic component?",
        "किसी बगीचे में, इनमें से कौन-सा अजैव घटक है?",
      ),
      options: [
        { id: "right", label: t("The rainfall", "वर्षा") },
        {
          id: "frog",
          label: t("A croaking frog", "टर्राता मेंढक"),
          feedback: t(
            "A frog is a living organism, so it is biotic.",
            "मेंढक एक जीवित जीव है, इसलिए वह जैव घटक है।",
          ),
        },
        {
          id: "grass",
          label: t("The long grass", "लंबी घास"),
          feedback: t(
            "Grass is alive, so it is biotic. Abiotic means a non-living, physical factor.",
            "घास जीवित है, इसलिए वह जैव घटक है। अजैव का अर्थ है एक निर्जीव, भौतिक कारक।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Living and non-living parts", "जीवित और निर्जीव हिस्से")),
      w.definition(
        t(
          "**Environment.** Everything around an organism: the other living things, and the non-living things like air, water, soil, light and temperature. All of these act on one another and keep a balance in nature.",
          "**पर्यावरण।** किसी जीव के आसपास की हर चीज़: दूसरे जीवित जीव, और निर्जीव चीज़ें जैसे हवा, पानी, मिट्टी, प्रकाश और ताप। ये सब एक-दूसरे पर असर डालते हैं और प्रकृति में संतुलन बनाए रखते हैं।",
        ),
      ),
      w.definition(
        t(
          "**Ecosystem.** All the organisms in an area that act on one another, **together with** the non-living things there, form an **ecosystem**. Its living parts are the **biotic components**. Its non-living, physical parts (temperature, rainfall, wind, soil, minerals) are the **abiotic components**.",
          "**पारितंत्र।** किसी क्षेत्र के सभी जीव जो एक-दूसरे पर असर डालते हैं, वहाँ की निर्जीव चीज़ों **के साथ मिलकर**, एक **पारितंत्र** बनाते हैं। इसके जीवित हिस्से **जैव घटक** हैं। इसके निर्जीव, भौतिक हिस्से (ताप, वर्षा, हवा, मिट्टी, खनिज) **अजैव घटक** हैं।",
        ),
      ),
      w.body(
        t(
          "A garden is an ecosystem: grasses, trees, roses, jasmine and sunflowers; frogs, insects and birds. Their growth and their activities depend on the sunlight, the rain and the soil.",
          "बगीचा एक पारितंत्र है: घास, पेड़, गुलाब, चमेली और सूरजमुखी; मेंढक, कीट और पक्षी। इनकी वृद्धि और इनकी गतिविधियाँ धूप, वर्षा और मिट्टी पर निर्भर हैं।",
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Natural and human-made ecosystems; designing an aquarium (Activity 15.1). */
const kinds = page(
  "kinds",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "kind",
      prompt: t("Which of these is a human-made ecosystem?", "इनमें से कौन-सा मानव-निर्मित पारितंत्र है?"),
      options: [
        { id: "right", label: t("A crop field", "फ़सल का खेत") },
        {
          id: "lake",
          label: t("A hill lake", "एक पहाड़ी झील"),
          feedback: t(
            "Nobody planned a lake: it is a natural ecosystem.",
            "झील किसी ने नहीं बनाई: यह प्राकृतिक पारितंत्र है।",
          ),
        },
        {
          id: "forest",
          label: t("A thick forest", "एक घना वन"),
          feedback: t(
            "A forest grows by itself: it is a natural ecosystem.",
            "वन अपने-आप उगता है: यह प्राकृतिक पारितंत्र है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Natural and human-made", "प्राकृतिक और मानव-निर्मित")),
      w.definition(
        t(
          "**Natural and artificial ecosystems.** Forests, ponds and lakes are **natural** ecosystems. Gardens, crop fields and aquariums are **human-made** (artificial) ecosystems: people set them up.",
          "**प्राकृतिक और कृत्रिम पारितंत्र।** वन, तालाब और झीलें **प्राकृतिक** पारितंत्र हैं। बगीचे, फ़सल के खेत और जलजीवशाला (एक्वेरियम) **मानव-निर्मित** (कृत्रिम) पारितंत्र हैं: इन्हें लोग बनाते हैं।",
        ),
      ),
      w.body(
        t(
          "NCERT Activity 15.1: design an aquarium. Fish need space to swim (a large jar will do), water, oxygen and food. A pump (aerator) can bubble in oxygen, and fish food can be bought. Add a few water plants and animals, and the jar can become **self-sustaining**: it keeps itself going.",
          "NCERT क्रियाकलाप 15.1: एक जलजीवशाला बनाओ। मछलियों को तैरने की जगह (बड़ा जार चलेगा), पानी, ऑक्सीजन और भोजन चाहिए। एक पंप (वातक) ऑक्सीजन के बुलबुले भेज सकता है, और मछली का भोजन ख़रीदा जा सकता है। कुछ जलीय पौधे और जंतु डालो, तो जार **स्वपोषी तंत्र** बन सकता है: वह ख़ुद चलता रहता है।",
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Producers, consumers, decomposers, tried on the jar. */
const roles = page(
  "roles",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "NCERT 15.1: producers (green plants and certain bacteria, by photosynthesis), consumers (herbivores, carnivores, omnivores, parasites) and decomposers (bacteria and fungi breaking down dead remains into simple substances for the soil).",
    );
    const jar = b.prop(ecosystemDef, "jar", {
      isSunny: true,
      hasPlants: true,
      hasDecomposers: true,
      fish: 2,
      snails: 2,
    });
    b.studentOnly(jar.action(EcoAction.Toggle));
    b.studentOnly(jar.action(EcoAction.SetFish));
    b.studentOnly(jar.action(EcoAction.SetSnails));
    b.standsFor(
      jar,
      "a jar-world: switch the sunlight, water plants, decomposers and pump on or off and set the fish and snails; a checklist shows each part's role and what goes wrong",
    );
    const ask = choiceQuestion(b, {
      name: "rot",
      prompt: t(
        "Switch the decomposers off. What would happen to dead fish and fallen leaves in the jar?",
        "अपघटकों को बंद करो। जार में मरी मछलियों और गिरी पत्तियों का क्या होगा?",
      ),
      options: [
        {
          id: "right",
          label: t("They would pile up, unbroken", "वे बिना टूटे जमा होते जाएँगे"),
        },
        {
          id: "plants",
          label: t("The plants would take them in", "पौधे उन्हें सोख लेंगे"),
          feedback: t(
            "Plants take in simple substances from the water or soil. Someone first has to break the dead remains down into those.",
            "पौधे पानी या मिट्टी से सरल पदार्थ लेते हैं। पहले किसी को मृत अवशेषों को उन पदार्थों में तोड़ना होता है।",
          ),
        },
        {
          id: "snails",
          label: t("The snails would eat them all up", "घोंघे उन सबको खा जाएँगे"),
          feedback: t(
            "Animals eat some of it, but the breaking down into simple substances is done by bacteria and fungi.",
            "जंतु कुछ खाते हैं, पर सरल पदार्थों में तोड़ने का काम जीवाणु और कवक करते हैं।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Who does what", "कौन क्या करता है")),
      w.definition(
        t(
          "**Producers.** Green plants and certain bacteria make food (sugar and starch) from simple substances, using the Sun's energy and chlorophyll: **photosynthesis**. They are the **producers**.",
          "**उत्पादक।** हरे पौधे और कुछ जीवाणु सूर्य की ऊर्जा और क्लोरोफ़िल की मदद से सरल पदार्थों से भोजन (शर्करा और मंड) बनाते हैं: **प्रकाश संश्लेषण**। ये **उत्पादक** हैं।",
        ),
      ),
      w.definition(
        t(
          "**Consumers.** Organisms that eat the food producers make, directly or by eating other consumers, are **consumers**: **herbivores** (eat plants), **carnivores** (eat animals), **omnivores** (eat both) and **parasites** (live on another organism and feed from it).",
          "**उपभोक्ता।** जो जीव उत्पादकों का बनाया भोजन सीधे, या दूसरे उपभोक्ताओं को खाकर, खाते हैं, वे **उपभोक्ता** हैं: **शाकाहारी** (पौधे खाते हैं), **मांसाहारी** (जंतु खाते हैं), **सर्वाहारी** (दोनों खाते हैं) और **परजीवी** (किसी दूसरे जीव पर रहकर उससे भोजन लेते हैं)।",
        ),
      ),
      w.definition(
        t(
          "**Decomposers.** Bacteria and fungi break down the dead remains and waste of organisms into simple substances that go into the soil (or water) and are used again by plants. They are the **decomposers**.",
          "**अपघटक।** जीवाणु और कवक जीवों के मृत अवशेषों और अपशिष्ट को सरल पदार्थों में तोड़ते हैं, जो मिट्टी (या पानी) में जाते हैं और पौधे उन्हें फिर से इस्तेमाल करते हैं। ये **अपघटक** हैं।",
        ),
      ),
      w.body(
        t(
          "Try the jar: switch each part off and on, and read the checklist.",
          "जार आज़माओ: हर हिस्से को बंद-चालू करो, और सूची पढ़ो।",
        ),
      ),
      jar,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Activity 15.1–15.2: why an aquarium needs cleaning and a pond doesn't; no predators. */
const aquarium = page(
  "aquarium",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "predator",
      prompt: t(
        "Activity 15.2: why should you not put a big carnivorous fish in a small aquarium?",
        "क्रियाकलाप 15.2: छोटी जलजीवशाला में बड़ी मांसाहारी मछली क्यों नहीं रखनी चाहिए?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "In a small jar it would soon eat all the others",
            "छोटे जार में वह जल्द ही बाकी सबको खा जाएगी",
          ),
        },
        {
          id: "oxygen",
          label: t(
            "Its large body would make the water cloudy fast",
            "उसका बड़ा शरीर पानी को जल्दी धुँधला कर देगा",
          ),
          feedback: t(
            "The problem is simpler: in a small jar there is nowhere to hide, so it would eat the others.",
            "समस्या ज़्यादा सीधी है: छोटे जार में छिपने की जगह नहीं, इसलिए वह दूसरों को खा जाएगा।",
          ),
        },
        {
          id: "plants",
          label: t("It would eat up all the plants in the jar", "वह जार के सारे पौधे खा जाएगी"),
          feedback: t(
            "An animal that eats other animals is a carnivore. It would eat the fish and snails.",
            "जो जंतु दूसरे जंतुओं को खाता है वह मांसाहारी है। वह मछलियों और घोंघों को खाएगा।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Jar or pond?", "जार या तालाब?")),
      w.body(
        t(
          "An aquarium has to be cleaned now and then, but nobody cleans a pond or a lake. A pond is big and has plenty of decomposers working all the time, so dead remains and waste are broken down as fast as they form. A small aquarium has few of them, and waste builds up faster than it is broken down. A small jar's plants can also feed, and give oxygen to, only a few animals.",
          "जलजीवशाला को समय-समय पर साफ़ करना पड़ता है, पर तालाब या झील को कोई साफ़ नहीं करता। तालाब बड़ा है और उसमें बहुत से अपघटक हर समय काम करते रहते हैं, इसलिए मृत अवशेष और अपशिष्ट जितनी तेज़ी से बनते हैं उतनी ही तेज़ी से टूट जाते हैं। छोटी जलजीवशाला में ये कम होते हैं, और अपशिष्ट टूटने से ज़्यादा तेज़ी से जमा होता है। छोटे जार के पौधे कुछ ही जंतुओं को भोजन और ऑक्सीजन दे सकते हैं।",
        ),
      ),
      w.body(
        t(
          "Every group depends on the others: consumers need the producers' food, producers need the simple substances decomposers return, and decomposers need the remains of both.",
          "हर समूह दूसरों पर निर्भर है: उपभोक्ताओं को उत्पादकों का भोजन चाहिए, उत्पादकों को वे सरल पदार्थ चाहिए जो अपघटक लौटाते हैं, और अपघटकों को दोनों के अवशेष चाहिए।",
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

/** Fix Kabir's jar. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const jar = b.prop(ecosystemDef, "jar", {
      isSunny: false,
      hasPlants: false,
      hasDecomposers: false,
      hasPump: false,
      fish: 6,
      snails: 0,
    });
    b.studentOnly(jar.action(EcoAction.Toggle));
    b.studentOnly(jar.action(EcoAction.SetFish));
    b.studentOnly(jar.action(EcoAction.SetSnails));
    b.standsFor(
      jar,
      "Kabir's first jar as he set it up: dark, no plants, no decomposers, six fish; the checklist shows what is wrong",
    );
    const goal = goalQuestion(b, {
      about: jar,
      prompt: t(
        "Fix Kabir's jar so that it keeps itself going.",
        "कबीर का जार ऐसा ठीक करो कि वह ख़ुद चलता रहे।",
      ),
      isMet: jar.derived(EcoDerived.IsSelfSustaining),
      solve: [
        jar.learner(EcoAction.Toggle, { thing: EcoThing.Sun, on: true }),
        jar.learner(EcoAction.Toggle, { thing: EcoThing.Plants, on: true }),
        jar.learner(EcoAction.Toggle, { thing: EcoThing.Decomposers, on: true }),
        jar.learner(EcoAction.SetFish, { n: 2 }),
        jar.learner(EcoAction.SetSnails, { n: 2 }),
      ],
    });
    const why = w.body(
      t(
        "That's what went wrong: no producers to make food and oxygen, no light for them anyway, too many fish, and nothing to break the waste down. Grandpa's tub has weed in the sun, snails, a few fish, and a muddy bottom full of decomposers. Kabir sets up jar number two with all four.",
        "यही गड़बड़ थी: भोजन और ऑक्सीजन बनाने वाले उत्पादक नहीं, उनके लिए वैसे भी रोशनी नहीं, बहुत ज़्यादा मछलियाँ, और अपशिष्ट तोड़ने वाला कोई नहीं। दादाजी के टब में धूप में खरपतवार है, घोंघे हैं, कुछ मछलियाँ हैं, और अपघटकों से भरी कीचड़ वाली तली है। कबीर इन चारों के साथ दूसरा जार बनाता है।",
      ),
      "why",
      { isHidden: true },
    );
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(why));
    return column([
      w.title(t("Back to the cloudy jar", "फिर धुँधले जार पर")),
      jar,
      goal,
      why,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** In-text Q2 (decomposers); the mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "decomposers",
      prompt: t(
        "What is the role of decomposers in an ecosystem?",
        "पारितंत्र में अपघटकों की क्या भूमिका है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "They break dead matter into simple substances",
            "वे मृत पदार्थ को सरल पदार्थों में तोड़ते हैं",
          ),
        },
        {
          id: "food",
          label: t(
            "They make food from sunlight for the consumers",
            "वे उपभोक्ताओं के लिए धूप से भोजन बनाते हैं",
          ),
          feedback: t(
            "That's the producers' job. Decomposers break down dead remains and waste.",
            "यह उत्पादकों का काम है। अपघटक मृत अवशेषों और अपशिष्ट को तोड़ते हैं।",
          ),
        },
        {
          id: "eat",
          label: t(
            "They hunt the herbivores so they don't overgrow",
            "वे शाकाहारियों का शिकार करते हैं ताकि वे बहुत न बढ़ें",
          ),
          feedback: t(
            "Hunting is what carnivores do. Decomposers work on what is already dead.",
            "शिकार मांसाहारी करते हैं। अपघटक जो पहले से मरा है उस पर काम करते हैं।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log, day 1.** ✓ An ecosystem is living things plus non-living things, acting on each other. ✓ Jar two has producers in the light, a few consumers, and decomposers. ✗ But how many fish can one bunch of weed feed? Next: who eats whom.",
        "**मिशन लॉग, दिन 1।** ✓ पारितंत्र = जीवित चीज़ें + निर्जीव चीज़ें, जो एक-दूसरे पर असर डालती हैं। ✓ दूसरे जार में रोशनी में उत्पादक, कुछ उपभोक्ता, और अपघटक हैं। ✗ पर खरपतवार का एक गुच्छा कितनी मछलियों को खिला सकता है? आगे: कौन किसे खाता है।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(ask.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), ask, log, space()]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [hook, firstJar, why, parts, kinds, roles, aquarium, inLife, yourTurn];

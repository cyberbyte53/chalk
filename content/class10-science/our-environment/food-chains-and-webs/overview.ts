import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  ChainAction,
  ChainMode,
  EnvScene,
  Habitat,
  environmentSceneDef,
  foodChainDef,
} from "@chalk/prop-environment";

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** Recap and the question: who eats whom in the tub? */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const pond = b.prop(environmentSceneDef, "pond", { scene: EnvScene.TubPond });
  b.standsFor(pond, "Grandpa's tub-pond: weed, snails and small fish");
  return column([
    w.title(t("Who eats whom?", "कौन किसे खाता है?")),
    pond,
    w.body(
      t(
        'Jar two has weed in the sunlight, snails, two fish and pond mud. It\'s clear on day 3. Kabir wants a big fish too, "to make it look cool". Riya stops him: "First write down who eats whom in Grandpa\'s tub. Then tell me where a big fish would fit."',
        'दूसरे जार में धूप में खरपतवार, घोंघे, दो मछलियाँ और तालाब की कीचड़ है। तीसरे दिन भी वह साफ़ है। कबीर एक बड़ी मछली भी डालना चाहता है, "ताकि अच्छा लगे"। रिया उसे रोकती है: "पहले लिखो कि दादाजी के टब में कौन किसे खाता है। फिर बताना कि बड़ी मछली कहाँ फ़िट होगी।"',
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Food chain: reveal Fig 15.1's grassland chain step by step. */
const chain = page(
  "chain",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "NCERT 15.1.1, Fig 15.1(b): a food chain is a series of organisms each feeding on the one before: grass → grasshopper → frog → snake.",
    );
    const grass = b.prop(foodChainDef, "grass", {
      habitat: Habitat.Grassland,
      mode: ChainMode.Chain,
      shown: 1,
      showEnergy: false,
      showLevelNames: false,
    });
    b.studentOnly(grass.action(ChainAction.Reveal));
    b.studentOnly(grass.action(ChainAction.ShowAll));
    b.studentOnly(grass.action(ChainAction.Reset));
    b.standsFor(
      grass,
      "a grassland food chain revealed one step at a time: grass, grasshopper, frog, snake",
    );
    const ask = choiceQuestion(b, {
      name: "frog",
      prompt: t(
        "Reveal the whole chain. What does the frog eat?",
        "पूरी श्रृंखला खोलो। मेंढक क्या खाता है?",
      ),
      options: [
        { id: "right", label: t("Grasshoppers", "टिड्डे") },
        {
          id: "grass",
          label: t("Grass", "घास"),
          feedback: t(
            "Follow the arrows: grass is eaten by the grasshopper, and the grasshopper by the frog.",
            "तीरों का पीछा करो: घास को टिड्डा खाता है, और टिड्डे को मेंढक।",
          ),
        },
        {
          id: "snake",
          label: t("Snakes", "साँप"),
          feedback: t(
            "The arrow goes from frog to snake: the snake eats the frog, not the other way.",
            "तीर मेंढक से साँप की ओर है: साँप मेंढक को खाता है, उल्टा नहीं।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("A food chain", "एक आहार श्रृंखला")),
      w.definition(
        t(
          "**Food chain.** A series of organisms in which each one feeds on the one before it is a **food chain**. We write it with arrows that point from the food to the eater: grass → grasshopper means the grasshopper eats the grass.",
          "**आहार श्रृंखला।** जीवों की ऐसी श्रृंखला जिसमें हर जीव अपने से पहले वाले को खाता है, **आहार श्रृंखला** कहलाती है। हम इसे तीरों से लिखते हैं जो भोजन से खाने वाले की ओर इशारा करते हैं: घास → टिड्डा का अर्थ है टिड्डा घास खाता है।",
        ),
      ),
      w.body(
        t(
          "Tap to reveal each step of a grassland chain.",
          "घास के मैदान की श्रृंखला का हर कदम खोलने के लिए टैप करो।",
        ),
      ),
      grass,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Trophic levels (Fig 15.2). */
const levels = page(
  "levels",
  (b) => {
    const w = wordsOn(b);
    const grass = b.prop(foodChainDef, "grass", {
      habitat: Habitat.Grassland,
      mode: ChainMode.Chain,
      shown: 4,
      showEnergy: false,
      showLevelNames: true,
      canReveal: false,
    });
    b.standsFor(grass, "the grassland chain with each step labelled as a trophic level");
    const ask = choiceQuestion(b, {
      name: "level",
      prompt: t("At which trophic level is the frog?", "मेंढक किस पोषी स्तर पर है?"),
      options: [
        { id: "right", label: t("Third: a small carnivore", "तीसरे: छोटा मांसाहारी") },
        {
          id: "second",
          label: t("Second: a herbivore", "दूसरे: शाकाहारी"),
          feedback: t(
            "The herbivore is the grasshopper, which eats the grass. The frog eats the grasshopper.",
            "शाकाहारी टिड्डा है, जो घास खाता है। मेंढक टिड्डे को खाता है।",
          ),
        },
        {
          id: "fourth",
          label: t("Fourth: a large carnivore", "चौथे: बड़ा मांसाहारी"),
          feedback: t(
            "Count from the grass: grass first, grasshopper second, frog third. The snake is fourth.",
            "घास से गिनो: घास पहला, टिड्डा दूसरा, मेंढक तीसरा। साँप चौथा है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Trophic levels", "पोषी स्तर")),
      w.definition(
        t(
          "**Trophic level.** Each step of a food chain is a **trophic level**. (1) Producers, the **autotrophs** that make their own food. (2) Herbivores, the **primary consumers**. (3) Small carnivores, the **secondary consumers**. (4) Large carnivores, the **tertiary consumers**.",
          "**पोषी स्तर।** आहार श्रृंखला का हर कदम एक **पोषी स्तर** है। (1) उत्पादक, यानी **स्वपोषी** जो अपना भोजन ख़ुद बनाते हैं। (2) शाकाहारी, यानी **प्राथमिक उपभोक्ता**। (3) छोटे मांसाहारी, यानी **द्वितीयक उपभोक्ता**। (4) बड़े मांसाहारी, यानी **तृतीयक उपभोक्ता**।",
        ),
      ),
      w.body(
        t(
          "Producers fix the Sun's energy and make it available to the **heterotrophs**, the consumers that can't make their own food.",
          "उत्पादक सूर्य की ऊर्जा को बाँधते हैं और उसे **विषमपोषियों** के लिए उपलब्ध कराते हैं, यानी उन उपभोक्ताओं के लिए जो अपना भोजन ख़ुद नहीं बना सकते।",
        ),
      ),
      grass,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The other chains of Fig 15.1: forest and pond. */
const habitats = page(
  "habitats",
  (b) => {
    const w = wordsOn(b);
    const chains = b.prop(foodChainDef, "chains", {
      habitat: Habitat.Pond,
      mode: ChainMode.Chain,
      shown: 4,
      showEnergy: false,
      showLevelNames: true,
      canReveal: false,
      canSetHabitat: true,
    });
    b.studentOnly(chains.action(ChainAction.SetHabitat));
    b.standsFor(chains, "NCERT's three food chains, switchable: forest, grassland and pond");
    const ask = choiceQuestion(b, {
      name: "forest",
      prompt: t(
        "Switch to the forest. How many steps does that chain have?",
        "वन पर जाओ। उस श्रृंखला में कितने कदम हैं?",
      ),
      options: [
        { id: "right", label: t("Three", "तीन") },
        {
          id: "four",
          label: t("Four", "चार"),
          feedback: t(
            "Look again: plants → deer → lion. The pond and grassland chains have four.",
            "फिर देखो: पौधे → हिरण → शेर। तालाब और घास के मैदान की श्रृंखलाओं में चार हैं।",
          ),
        },
        {
          id: "five",
          label: t("Five", "पाँच"),
          feedback: t("Count the organisms: plants, deer, lion.", "जीव गिनो: पौधे, हिरण, शेर।"),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Forest, grassland, pond", "वन, घास का मैदान, तालाब")),
      w.body(
        t(
          "Every ecosystem has its own chains. In a pond the producers are tiny floating plants (**phytoplankton**), eaten by tiny floating animals (**zooplankton**), eaten by small fish, eaten by big fish.",
          "हर पारितंत्र की अपनी श्रृंखलाएँ होती हैं। तालाब में उत्पादक नन्हे तैरते पौधे (**पादप प्लवक**) हैं, जिन्हें नन्हे तैरते जंतु (**जंतु प्लवक**) खाते हैं, जिन्हें छोटी मछलियाँ खाती हैं, जिन्हें बड़ी मछलियाँ खाती हैं।",
        ),
      ),
      chains,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Food web (Fig 15.3). */
const web = page(
  "web",
  (b) => {
    const w = wordsOn(b);
    const meadow = b.prop(foodChainDef, "meadow", {
      habitat: Habitat.Grassland,
      mode: ChainMode.Web,
      shown: 4,
      canTap: true,
      canReveal: false,
    });
    b.studentOnly(meadow.action(ChainAction.Tap));
    b.standsFor(
      meadow,
      "a small grassland food web; tap an organism to see what eats it and what it eats",
    );
    const ask = choiceQuestion(b, {
      name: "mouse",
      prompt: t("Tap the mouse. Which animals eat it?", "चूहे पर टैप करो। कौन-से जंतु उसे खाते हैं?"),
      options: [
        { id: "right", label: t("The snake and the hawk", "साँप और बाज़") },
        {
          id: "frog",
          label: t("The frog and the lizard", "मेंढक और छिपकली"),
          feedback: t(
            "The frog and the lizard eat the grasshopper. Tap the mouse and follow its arrows.",
            "मेंढक और छिपकली टिड्डे को खाते हैं। चूहे पर टैप करो और उसके तीरों का पीछा करो।",
          ),
        },
        {
          id: "rabbit",
          label: t("The rabbit and the hawk", "खरगोश और बाज़"),
          feedback: t(
            "A rabbit eats grass, not mice. Follow the arrows that leave the mouse.",
            "खरगोश घास खाता है, चूहे नहीं। चूहे से निकलने वाले तीरों का पीछा करो।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("From chains to a web", "श्रृंखलाओं से जाल तक")),
      w.definition(
        t(
          "**Food web.** Most organisms are eaten by two or more kinds of organisms, which are eaten by several others. So the feeding links form a network of branching chains: a **food web**.",
          "**आहार जाल।** ज़्यादातर जीवों को दो या ज़्यादा तरह के जीव खाते हैं, और उन्हें कई दूसरे खाते हैं। इसलिए भोजन के संबंध शाखाओं वाली श्रृंखलाओं का जाल बनाते हैं: एक **आहार जाल**।",
        ),
      ),
      meadow,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** The jar's chain; where would a big fish go? */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "bigFish",
      prompt: t(
        "Kabir's small fish nibble the weed and the tiny animals living on it, so his jar's chains are weed → snail and weed → small fish. Where would a big fish fit?",
        "कबीर की छोटी मछलियाँ खरपतवार और उस पर रहने वाले नन्हे जंतु कुतरती हैं, इसलिए उसके जार की श्रृंखलाएँ हैं खरपतवार → घोंघा और खरपतवार → छोटी मछली। बड़ी मछली कहाँ फ़िट होगी?",
      ),
      options: [
        {
          id: "right",
          label: t("Above the small fish: it would eat them", "छोटी मछलियों के ऊपर: वह उन्हें खाएगी"),
        },
        {
          id: "side",
          label: t("Beside the snails: it would eat weed", "घोंघों के बगल में: वह खरपतवार खाएगी"),
          feedback: t(
            "In the pond chain the big fish eats small fish. It sits one level above them.",
            "तालाब की श्रृंखला में बड़ी मछली छोटी मछलियों को खाती है। वह उनसे एक स्तर ऊपर है।",
          ),
        },
        {
          id: "bottom",
          label: t("At the start: it would feed the weed", "शुरुआत में: वह खरपतवार को भोजन देगी"),
          feedback: t(
            "Every chain starts with a producer. A fish is a consumer.",
            "हर श्रृंखला उत्पादक से शुरू होती है। मछली उपभोक्ता है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const then = w.body(
      t(
        "So the big fish would be a carnivore one level up, and Kabir's two small fish would be its dinner. Kabir decides the jar looks cool enough.",
        "तो बड़ी मछली एक स्तर ऊपर मांसाहारी होगी, और कबीर की दो छोटी मछलियाँ उसका खाना। कबीर तय करता है कि जार काफ़ी अच्छा दिख रहा है।",
      ),
      "then",
      { isHidden: true },
    );
    b.when(ask.on(QuestionSignal.Correct), [theBoard.show(then), theBoard.pass()]);
    return column([w.title(t("Kabir's jar chain", "कबीर के जार की श्रृंखला")), ask, then, space()]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Exercise 2 and in-text Q1; the mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const ex2 = choiceQuestion(b, {
      name: "ex2",
      prompt: t("Which of these is a food chain?", "इनमें से कौन-सी आहार श्रृंखला है?"),
      options: [
        { id: "right", label: t("Grass, goat and human", "घास, बकरी और मानव") },
        {
          id: "plants",
          label: t("Grass, wheat and mango", "घास, गेहूँ और आम"),
          feedback: t(
            "All three are producers: none of them eats another.",
            "तीनों उत्पादक हैं: इनमें से कोई दूसरे को नहीं खाता।",
          ),
        },
        {
          id: "grazers",
          label: t("Goat, cow and elephant", "बकरी, गाय और हाथी"),
          feedback: t(
            "All three are herbivores: there's no producer and nobody eats another.",
            "तीनों शाकाहारी हैं: कोई उत्पादक नहीं और कोई दूसरे को नहीं खाता।",
          ),
        },
        {
          id: "mix",
          label: t("Grass, fish and goat", "घास, मछली और बकरी"),
          feedback: t(
            "A fish doesn't eat grass, and a goat doesn't eat fish.",
            "मछली घास नहीं खाती, और बकरी मछली नहीं खाती।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const q1 = choiceQuestion(b, {
      name: "q1",
      prompt: t(
        "In grass → deer → lion, at which trophic level is the deer?",
        "घास → हिरण → शेर में, हिरण किस पोषी स्तर पर है?",
      ),
      options: [
        { id: "right", label: t("Second", "दूसरे") },
        {
          id: "first",
          label: t("First", "पहले"),
          feedback: t(
            "The first level is the producer, the grass.",
            "पहला स्तर उत्पादक, यानी घास, है।",
          ),
        },
        {
          id: "third",
          label: t("Third", "तीसरे"),
          feedback: t(
            "The lion is third. The deer eats the producer, so it's second.",
            "शेर तीसरे पर है। हिरण उत्पादक को खाता है, इसलिए वह दूसरे पर है।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log, day 5.** ✓ Food chains and trophic levels. ✓ The jar's chain is short: weed, then snails and small fish. ✗ But why can't the weed feed more fish? Next: where the energy goes.",
        "**मिशन लॉग, दिन 5।** ✓ आहार श्रृंखला और पोषी स्तर। ✓ जार की श्रृंखला छोटी है: खरपतवार, फिर घोंघे और छोटी मछलियाँ। ✗ पर खरपतवार ज़्यादा मछलियों को क्यों नहीं खिला सकता? आगे: ऊर्जा कहाँ जाती है।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(ex2.on(QuestionSignal.Correct), theBoard.show(q1));
    b.when(q1.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), ex2, q1, log, space()]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [hook, chain, levels, habitats, web, inLife, yourTurn];

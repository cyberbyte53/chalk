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

/** One weed, ten fish? */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const pond = b.prop(environmentSceneDef, "pond", { scene: EnvScene.TubPond });
  b.standsFor(pond, "Grandpa's tub-pond: lots of weed, many snails, only a few fish");
  return column([
    w.title(t("One weed, ten fish?", "एक खरपतवार, दस मछलियाँ?")),
    pond,
    w.body(
      t(
        '"The weed grows back, so it\'s endless food," says Kabir. "Let\'s put ten fish in." Riya points at the tub: a thick mat of weed, dozens of snails, and only four fish. "If the food were endless, why are there so few fish at the top?"',
        '"खरपतवार फिर उग आता है, तो भोजन कभी ख़त्म नहीं होगा," कबीर कहता है। "दस मछलियाँ डालते हैं।" रिया टब की ओर इशारा करती है: खरपतवार की मोटी परत, दर्जनों घोंघे, और सिर्फ़ चार मछलियाँ। "अगर भोजन कभी ख़त्म नहीं होता, तो ऊपर इतनी कम मछलियाँ क्यों हैं?"',
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Energy flows from the Sun into food; plants capture about 1%. */
const sun = page(
  "sun",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "share",
      prompt: t(
        "About how much of the sunlight falling on their leaves do green plants turn into food energy?",
        "अपनी पत्तियों पर पड़ने वाले सूर्य के प्रकाश का लगभग कितना भाग हरे पौधे भोजन ऊर्जा में बदलते हैं?",
      ),
      options: [
        { id: "right", label: t("About 1%", "लगभग 1%") },
        {
          id: "ten",
          label: t("About 10%", "लगभग 10%"),
          feedback: t(
            "10% is what passes from one trophic level to the next. Plants capture only about 1% of sunlight.",
            "10% वह है जो एक पोषी स्तर से अगले तक जाता है। पौधे सूर्य के प्रकाश का केवल लगभग 1% पकड़ते हैं।",
          ),
        },
        {
          id: "half",
          label: t("About 50%", "लगभग 50%"),
          feedback: t(
            "Far less: about 1%. Most sunlight is reflected or lost as heat.",
            "बहुत कम: लगभग 1%। ज़्यादातर प्रकाश परावर्तित हो जाता है या ऊष्मा बनकर खो जाता है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Energy comes in from the Sun", "ऊर्जा सूर्य से आती है")),
      w.body(
        t(
          "Food is fuel: it gives an organism energy to do work. So when one organism eats another, **energy flows** from one part of an ecosystem to the next. It all starts with sunlight.",
          "भोजन ईंधन है: यह जीव को काम करने की ऊर्जा देता है। इसलिए जब एक जीव दूसरे को खाता है, तो पारितंत्र के एक हिस्से से अगले तक **ऊर्जा बहती** है। यह सब सूर्य के प्रकाश से शुरू होता है।",
        ),
      ),
      w.definition(
        t(
          "**The first step.** Producers capture the energy of sunlight and change it into **chemical energy** in food. On land, green plants capture about **1%** of the sunlight that falls on their leaves. From the producers, energy goes on to the consumers and the decomposers.",
          "**पहला कदम।** उत्पादक सूर्य के प्रकाश की ऊर्जा को पकड़कर भोजन में **रासायनिक ऊर्जा** में बदलते हैं। ज़मीन पर, हरे पौधे अपनी पत्तियों पर पड़ने वाले प्रकाश का लगभग **1%** पकड़ते हैं। उत्पादकों से ऊर्जा आगे उपभोक्ताओं और अपघटकों तक जाती है।",
        ),
      ),
      w.body(
        t(
          "Whenever energy changes from one form to another, some of it is lost to the surroundings in a form that can't be used again, mostly as heat.",
          "जब भी ऊर्जा एक रूप से दूसरे में बदलती है, उसका कुछ भाग ऐसे रूप में परिवेश में खो जाता है जिसे फिर इस्तेमाल नहीं किया जा सकता, ज़्यादातर ऊष्मा के रूप में।",
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The 10% law, shown as a pyramid. */
const tenPercent = page(
  "ten-percent",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "NCERT 15.1.1 and Fig 15.4: at each step most energy is lost as heat, in digestion and in work; on average 10% of the food eaten becomes the eater's body and is available to the next level.",
    );
    const pyramid = b.prop(foodChainDef, "pyramid", {
      habitat: Habitat.Grassland,
      mode: ChainMode.Pyramid,
      shown: 1,
      showEnergy: true,
      showLevelNames: true,
    });
    b.studentOnly(pyramid.action(ChainAction.Reveal));
    b.studentOnly(pyramid.action(ChainAction.ShowAll));
    b.studentOnly(pyramid.action(ChainAction.Reset));
    b.standsFor(
      pyramid,
      "an energy pyramid: producers hold 10,000 kJ, and each level up holds a tenth of the one below",
    );
    const ask = choiceQuestion(b, {
      name: "third",
      prompt: t(
        "Reveal the levels. If the producers hold 10,000 kJ, how much reaches the third level?",
        "स्तर खोलो। अगर उत्पादकों में 10,000 kJ है, तो तीसरे स्तर तक कितनी पहुँचती है?",
      ),
      options: [
        { id: "right", label: t("100 kJ", "100 kJ") },
        {
          id: "thousand",
          label: t("1,000 kJ", "1,000 kJ"),
          feedback: t(
            "1,000 kJ is the second level. Take 10% once more for the third.",
            "1,000 kJ दूसरा स्तर है। तीसरे के लिए एक बार और 10% लो।",
          ),
        },
        {
          id: "ten",
          label: t("10 kJ", "10 kJ"),
          feedback: t(
            "10 kJ is the fourth level. The third gets 10% of 10% of 10,000.",
            "10 kJ चौथा स्तर है। तीसरे को 10,000 के 10% का 10% मिलता है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("The 10% law", "10% का नियम")),
      w.body(
        t(
          "When a herbivore eats a plant, a great deal of the energy is lost as heat, some goes into digestion and into doing work, and the rest goes into growth and reproduction.",
          "जब कोई शाकाहारी पौधा खाता है, तो ऊर्जा का बड़ा भाग ऊष्मा बनकर खो जाता है, कुछ पाचन और काम करने में जाता है, और बाकी वृद्धि और जनन में जाता है।",
        ),
      ),
      w.definition(
        t(
          "**The 10% law.** On average only about **10%** of the food eaten becomes the eater's own body, and so is available to the next level of consumers.",
          "**10% का नियम।** औसतन खाए गए भोजन का केवल लगभग **10%** खाने वाले के अपने शरीर में बदलता है, और इसलिए अगले स्तर के उपभोक्ताओं को उपलब्ध होता है।",
        ),
      ),
      pyramid,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Why chains are short; numbers at each level; one-way flow. */
const short = page(
  "short",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "short",
      prompt: t(
        "Why do food chains usually have only three or four steps?",
        "आहार श्रृंखलाओं में आमतौर पर केवल तीन या चार कदम क्यों होते हैं?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Too little energy is left after four levels",
            "चार स्तरों के बाद बहुत कम ऊर्जा बचती है",
          ),
        },
        {
          id: "food",
          label: t("Big animals don't eat other big animals", "बड़े जानवर दूसरे बड़े जानवरों को नहीं खाते"),
          feedback: t(
            "Some do. The real limit is energy: so much is lost at each step that little remains.",
            "कुछ खाते हैं। असली सीमा ऊर्जा है: हर कदम पर इतनी खो जाती है कि बहुत कम बचती है।",
          ),
        },
        {
          id: "back",
          label: t("Energy flows back down to the plants again", "ऊर्जा फिर से वापस पौधों तक बहती है"),
          feedback: t(
            "Energy never flows back: the flow is one-way. That's exactly why it runs out.",
            "ऊर्जा कभी वापस नहीं बहती: बहाव एक ही दिशा में है। इसी वजह से वह ख़त्म हो जाती है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Why chains are short", "श्रृंखलाएँ छोटी क्यों होती हैं")),
      w.body(
        t(
          "So little energy reaches each next level that food chains generally have only **three or four steps**: very little usable energy is left after four trophic levels.",
          "हर अगले स्तर तक इतनी कम ऊर्जा पहुँचती है कि आहार श्रृंखलाओं में आमतौर पर केवल **तीन या चार कदम** होते हैं: चार पोषी स्तरों के बाद बहुत कम उपयोगी ऊर्जा बचती है।",
        ),
      ),
      w.body(
        t(
          "That's also why there are generally more individuals at the lower levels, and the most of all are producers.",
          "इसी वजह से निचले स्तरों पर आमतौर पर ज़्यादा जीव होते हैं, और सबसे ज़्यादा उत्पादक होते हैं।",
        ),
      ),
      w.definition(
        t(
          "**One-way flow.** Energy flows in **one direction only**. Energy captured by producers never goes back to the Sun, and energy that passes to herbivores never comes back to the producers. At every level, the energy available gets **less and less**.",
          "**एक-दिशी बहाव।** ऊर्जा **केवल एक दिशा** में बहती है। उत्पादकों की पकड़ी ऊर्जा कभी सूर्य तक वापस नहीं जाती, और शाकाहारियों तक गई ऊर्जा कभी उत्पादकों तक नहीं लौटती। हर स्तर पर उपलब्ध ऊर्जा **कम-से-कम** होती जाती है।",
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Exercises 4–5: remove a trophic level. */
const remove = page(
  "remove",
  (b) => {
    const w = wordsOn(b);
    const grass = b.prop(foodChainDef, "grass", {
      habitat: Habitat.Grassland,
      mode: ChainMode.Chain,
      shown: 4,
      showEnergy: false,
      showLevelNames: true,
      canReveal: false,
      canRemove: true,
    });
    b.studentOnly(grass.action(ChainAction.Remove));
    b.standsFor(
      grass,
      "the grassland chain; remove any one level and see what happens to the levels above and below",
    );
    const ask = choiceQuestion(b, {
      name: "frogs",
      prompt: t(
        "Remove the frogs. What happens to the grasshoppers?",
        "मेंढकों को हटाओ। टिड्डों का क्या होता है?",
      ),
      options: [
        { id: "right", label: t("They grow in number", "उनकी संख्या बढ़ती है") },
        {
          id: "starve",
          label: t("They starve and die out", "वे भूखे मर जाते हैं"),
          feedback: t(
            "The snakes starve, because they ate the frogs. The grasshoppers lose the animal that ate them.",
            "साँप भूखे रहते हैं, क्योंकि वे मेंढक खाते थे। टिड्डों को खाने वाला जंतु ख़त्म हो जाता है।",
          ),
        },
        {
          id: "same",
          label: t("Nothing changes for them", "उनके लिए कुछ नहीं बदलता"),
          feedback: t(
            "Every level is linked: with nothing eating them, the grasshoppers increase.",
            "हर स्तर जुड़ा है: कोई उन्हें न खाए, तो टिड्डे बढ़ते हैं।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Take away one level", "एक स्तर हटाओ")),
      w.body(
        t(
          "NCERT Exercises 4 and 5: what if we killed all the organisms at one trophic level? Try removing each level in turn.",
          "NCERT अभ्यास 4 और 5: अगर हम किसी एक पोषी स्तर के सारे जीव मार दें तो? बारी-बारी से हर स्तर को हटाकर देखो।",
        ),
      ),
      grass,
      ask,
      w.body(
        t(
          "Removing **any** level upsets the ones above and below it. Removing the producers does the most damage, because every other level depends on them. No level can be removed without harming the ecosystem.",
          "**कोई भी** स्तर हटाने से उसके ऊपर और नीचे वाले स्तर गड़बड़ा जाते हैं। उत्पादकों को हटाने से सबसे ज़्यादा नुकसान होता है, क्योंकि बाकी हर स्तर उन पर निर्भर है। कोई भी स्तर पारितंत्र को नुकसान पहुँचाए बिना नहीं हटाया जा सकता।",
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** Why the tub has many snails and few fish. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "fewFish",
      prompt: t(
        "So why does Grandpa's tub have lots of weed, many snails, and only a few fish?",
        "तो दादाजी के टब में ढेर सारा खरपतवार, बहुत से घोंघे, और सिर्फ़ कुछ मछलियाँ क्यों हैं?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Each level up gets only about 10% of energy",
            "हर ऊपरी स्तर को ऊर्जा का केवल लगभग 10% मिलता है",
          ),
        },
        {
          id: "slow",
          label: t(
            "Fish breed much more slowly than the snails do",
            "मछलियाँ घोंघों से बहुत धीरे प्रजनन करती हैं",
          ),
          feedback: t(
            "The limit is food energy: each level can feed only about a tenth as much life above it.",
            "सीमा भोजन ऊर्जा है: हर स्तर अपने ऊपर लगभग दसवाँ हिस्सा जीवन ही पाल सकता है।",
          ),
        },
        {
          id: "weed",
          label: t(
            "The weed is poisonous to most kinds of pond fish",
            "खरपतवार ज़्यादातर मछलियों के लिए ज़हरीला है",
          ),
          feedback: t(
            "The weed is food, not poison. There just isn't enough energy left by the top.",
            "खरपतवार भोजन है, ज़हर नहीं। बस ऊपर तक पर्याप्त ऊर्जा नहीं बचती।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const then = w.body(
      t(
        "Ten fish would need about five times the food that two fish need, and the weed in a jar can't supply it: only about a tenth of the weed's energy ever reaches the fish. Kabir keeps two fish.",
        "दस मछलियों को दो मछलियों से लगभग पाँच गुना भोजन चाहिए, और जार का खरपतवार इतना नहीं दे सकता: खरपतवार की ऊर्जा का लगभग दसवाँ हिस्सा ही मछलियों तक पहुँचता है। कबीर दो ही मछलियाँ रखता है।",
      ),
      "then",
      { isHidden: true },
    );
    b.when(ask.on(QuestionSignal.Correct), [theBoard.show(then), theBoard.pass()]);
    return column([w.title(t("Back to the tub", "फिर टब पर")), ask, then, space()]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** A 10% calculation; the mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "lion",
      prompt: t(
        "In plants → deer → lion, the plants hold 20,000 kJ. About how much reaches the lion?",
        "पौधे → हिरण → शेर में, पौधों में 20,000 kJ है। शेर तक लगभग कितनी पहुँचती है?",
      ),
      options: [
        { id: "right", label: t("200 kJ", "200 kJ") },
        {
          id: "two",
          label: t("2,000 kJ", "2,000 kJ"),
          feedback: t(
            "2,000 kJ reaches the deer. The lion gets 10% of the deer's.",
            "2,000 kJ हिरण तक पहुँचती है। शेर को हिरण का 10% मिलता है।",
          ),
        },
        {
          id: "twenty",
          label: t("20 kJ", "20 kJ"),
          feedback: t(
            "That's one step too many: there are only two steps from plants to lion.",
            "यह एक कदम ज़्यादा है: पौधों से शेर तक केवल दो कदम हैं।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log, day 9.** ✓ Energy flows one way, and only about 10% passes up each level. ✓ Two fish, lots of weed, many snails: the jar's pyramid stands. ✗ Next door, the neighbour is spraying his vegetables. Next: poison that climbs.",
        "**मिशन लॉग, दिन 9।** ✓ ऊर्जा एक ही दिशा में बहती है, और हर स्तर पर केवल लगभग 10% ऊपर जाती है। ✓ दो मछलियाँ, ढेर सारा खरपतवार, बहुत से घोंघे: जार का पिरामिड टिका है। ✗ बगल में पड़ोसी अपनी सब्ज़ियों पर छिड़काव कर रहे हैं। आगे: ऊपर चढ़ता ज़हर।",
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
export const overview = [hook, sun, tenPercent, short, remove, inLife, yourTurn];

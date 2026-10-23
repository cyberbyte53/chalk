import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  FeedingAction,
  FeedingKind,
  LifeScene,
  cellFeedingDef,
  lifeSceneDef,
} from "@chalk/prop-life";

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** The yellow threads on Grandpa's hedge. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const hedge = b.prop(lifeSceneDef, "hedge", { scene: LifeScene.AmarBel });
  b.standsFor(
    hedge,
    "the hedge by Grandpa's gate wrapped in thin yellow leafless threads of amar-bel",
  );
  return column([
    w.title(t("The yellow threads on the hedge", "बाड़ पर पीले धागे")),
    hedge,
    w.body(
      t(
        "Plants make their own food: that was stop 2. So Kabir is puzzled by Grandpa's hedge. Thin yellow threads have wrapped themselves all over it. They have no green leaves at all, so they can't be making much food by photosynthesis. Yet they keep spreading. And in the kitchen, a forgotten slice of bread has grown a fuzzy grey-green coat.",
        "पौधे अपना भोजन ख़ुद बनाते हैं: यह पड़ाव 2 था। इसलिए कबीर दादाजी की बाड़ देखकर हैरान है। पतले पीले धागे पूरी बाड़ पर लिपट गए हैं। उनमें हरी पत्तियाँ हैं ही नहीं, इसलिए वे प्रकाश संश्लेषण से ज़्यादा भोजन नहीं बना सकते। फिर भी वे फैलते जा रहे हैं। और रसोई में भूली हुई डबलरोटी के टुकड़े पर रोएँदार धूसर-हरी परत उग आई है।",
      ),
    ),
    w.body(
      t(
        "This stop: **how do organisms that can't make food get it?**",
        "इस पड़ाव का सवाल: **जो जीव भोजन नहीं बना सकते, वे उसे कैसे पाते हैं?**",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Three strategies: break down outside, take in whole, parasites. */
const strategies = page(
  "strategies",
  (b) => {
    const w = wordsOn(b);
    const mushroom = choiceQuestion(b, {
      name: "mushroom",
      prompt: t(
        "A mushroom growing on a rotting log gets its food by…",
        "सड़ते लट्ठे पर उगा मशरूम अपना भोजन कैसे पाता है…",
      ),
      options: [
        {
          id: "right",
          label: t(
            "breaking food down outside, then absorbing it",
            "बाहर भोजन तोड़कर, फिर उसे सोखकर",
          ),
        },
        {
          id: "whole",
          label: t("swallowing small pieces of wood whole", "लकड़ी के छोटे टुकड़े पूरे निगलकर"),
          feedback: t(
            "Fungi like mushrooms, yeast and bread mould have no mouth. They break food down outside the body and absorb the simple products.",
            "मशरूम, यीस्ट और डबलरोटी की फफूँद जैसे कवकों का मुँह नहीं होता। वे भोजन को शरीर के बाहर तोड़ते हैं और सरल उत्पादों को सोख लेते हैं।",
          ),
        },
        {
          id: "photo",
          label: t("making food by photosynthesis", "प्रकाश संश्लेषण से भोजन बनाकर"),
          feedback: t(
            "Mushrooms have no chlorophyll. They are heterotrophs.",
            "मशरूम में क्लोरोफ़िल नहीं होता। वे विषमपोषी हैं।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Many ways to be a heterotroph", "विषमपोषी होने के कई तरीक़े")),
      w.body(
        t(
          "Every organism is suited to its surroundings, so the way it feeds depends on what its food is and how it gets it. Grass stays still; a deer runs away. So a cow and a lion have very different ways of feeding. NCERT groups the strategies into three.",
          "हर जीव अपने परिवेश के अनुकूल होता है, इसलिए उसके खाने का तरीक़ा इस पर निर्भर है कि उसका भोजन क्या है और वह उसे कैसे पाता है। घास एक जगह रहती है; हिरण भाग जाता है। इसलिए गाय और शेर के खाने के तरीक़े बहुत अलग हैं। NCERT इन तरीक़ों को तीन समूहों में बाँटती है।",
        ),
      ),
      w.definition(
        t(
          "**(1) Break down outside, then absorb.** Some organisms break food down outside their body and then absorb it: fungi such as **bread mould, yeast and mushrooms**. **(2) Take in whole.** Others take in whole food and break it down inside their body, like us. What they can take in depends on their body design.",
          "**(1) बाहर तोड़ो, फिर सोखो।** कुछ जीव भोजन को अपने शरीर के बाहर तोड़ते हैं और फिर सोखते हैं: कवक जैसे **डबलरोटी की फफूँद, यीस्ट और मशरूम**। **(2) पूरा अंदर लो।** दूसरे पूरा भोजन अंदर लेकर शरीर के अंदर तोड़ते हैं, हमारी तरह। वे क्या ले सकते हैं, यह उनके शरीर की बनावट पर निर्भर है।",
        ),
      ),
      w.definition(
        t(
          "**(3) Parasites.** A **parasite** gets its food from another living plant or animal, its **host**, without killing it. Examples: **cuscuta (amar-bel)**, **ticks, lice, leeches and tapeworms**.",
          "**(3) परजीवी।** **परजीवी** किसी दूसरे जीवित पौधे या जंतु, अपने **परपोषी**, से उसे मारे बिना भोजन पाता है। उदाहरण: **कस्कुटा (अमरबेल)**, **किलनी, जूँ, जोंक और फ़ीताकृमि**।",
        ),
      ),
      mushroom,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Amoeba: pseudopodia and food vacuole. */
const amoeba = page(
  "amoeba",
  (b) => {
    const w = wordsOn(b);
    const cell = b.prop(cellFeedingDef, "cell", {
      kind: FeedingKind.Amoeba,
      step: 0,
      showNames: true,
      canStep: true,
    });
    b.studentOnly(cell.action(FeedingAction.Next));
    b.studentOnly(cell.action(FeedingAction.Reset));
    b.standsFor(cell, "an Amoeba engulfing a food particle, in four steps");
    const vacuole = choiceQuestion(b, {
      name: "vacuole",
      prompt: t(
        "Step through it. Where is the food broken down in an Amoeba?",
        "कदम चलो। अमीबा में भोजन कहाँ तोड़ा जाता है?",
      ),
      options: [
        { id: "right", label: t("Inside the food vacuole", "खाद्य रिक्तिका के अंदर") },
        {
          id: "outside",
          label: t("Outside the cell, like a mushroom", "कोशिका के बाहर, मशरूम की तरह"),
          feedback: t(
            "Amoeba takes the food in first: its extensions close over it and make a food vacuole, and the food is broken down in there.",
            "अमीबा पहले भोजन अंदर लेता है: उसके प्रवर्ध उसके ऊपर बंद होकर खाद्य रिक्तिका बनाते हैं, और भोजन वहीं तोड़ा जाता है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("How a single cell eats: Amoeba", "एक कोशिका कैसे खाती है: अमीबा")),
      w.body(
        t(
          "In a single-celled organism, food may be taken in by the whole surface. **Amoeba** is a single cell with no fixed shape.",
          "एककोशिकीय जीव में भोजन पूरी सतह से लिया जा सकता है। **अमीबा** एक कोशिका है जिसका कोई निश्चित आकार नहीं।",
        ),
      ),
      w.definition(
        t(
          "**Pseudopodia and food vacuole.** Amoeba pushes out temporary finger-like extensions of its surface, **pseudopodia**, which flow round a food particle and fuse over it. The food is trapped in a bubble inside the cell, a **food vacuole**. There, complex substances are broken down into simpler ones, which diffuse into the **cytoplasm** (the jelly-like inside of the cell). Undigested remains move to the surface and are thrown out.",
          "**कूटपाद और खाद्य रिक्तिका।** अमीबा अपनी सतह से अस्थायी उँगली जैसे प्रवर्ध, **कूटपाद**, निकालता है, जो भोजन के कण के चारों ओर बहकर उसके ऊपर जुड़ जाते हैं। भोजन कोशिका के अंदर एक बुलबुले, **खाद्य रिक्तिका**, में फँस जाता है। वहाँ जटिल पदार्थ सरल पदार्थों में टूटते हैं, जो **कोशिकाद्रव्य** (कोशिका का जेली जैसा भीतरी भाग) में विसरित हो जाते हैं। बिना पचे अवशेष सतह पर आकर बाहर फेंक दिए जाते हैं।",
        ),
      ),
      cell,
      vacuole,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Paramoecium: cilia and a fixed spot. */
const paramoecium = page(
  "paramoecium",
  (b) => {
    const w = wordsOn(b);
    const cell = b.prop(cellFeedingDef, "cell", {
      kind: FeedingKind.Paramoecium,
      step: 0,
      showNames: true,
      canStep: true,
    });
    b.studentOnly(cell.action(FeedingAction.Next));
    b.studentOnly(cell.action(FeedingAction.Reset));
    b.standsFor(cell, "a Paramoecium whose cilia sweep food to one fixed spot");
    const differ = choiceQuestion(b, {
      name: "differ",
      prompt: t(
        "How is feeding in Paramoecium different from Amoeba?",
        "पैरामीशियम का भोजन लेना अमीबा से कैसे अलग है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "It has a fixed shape, and cilia sweep food to one particular spot",
            "इसका निश्चित आकार है, और पक्ष्माभ भोजन को एक ख़ास जगह तक ले जाते हैं",
          ),
        },
        {
          id: "many",
          label: t("It is made of many cells", "यह कई कोशिकाओं से बना है"),
          feedback: t(
            "Paramoecium is a single cell too. The difference is its definite shape and the one spot where food goes in.",
            "पैरामीशियम भी एक ही कोशिका है। अंतर इसका निश्चित आकार और वह एक जगह है जहाँ से भोजन अंदर जाता है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("A cell with a mouth-spot: Paramoecium", "मुँह जैसी जगह वाली कोशिका: पैरामीशियम")),
      w.definition(
        t(
          "**Cilia.** Tiny hair-like structures covering the surface of a cell are **cilia**. In **Paramoecium**, another single-celled organism, the cell has a definite shape, and food is taken in only at one specific spot. The beating cilia sweep food to that spot.",
          "**पक्ष्माभ।** कोशिका की सतह को ढकने वाली नन्ही बाल जैसी संरचनाएँ **पक्ष्माभ** हैं। **पैरामीशियम**, एक और एककोशिकीय जीव, की कोशिका का निश्चित आकार होता है, और भोजन केवल एक ख़ास जगह से अंदर लिया जाता है। हिलते पक्ष्माभ भोजन को उस जगह तक बुहारते हैं।",
        ),
      ),
      w.body(
        t(
          "This is a first step towards specialisation: as organisms get more complex, different parts take on different jobs.",
          "यह विशेषीकरण की ओर पहला कदम है: जैसे-जैसे जीव जटिल होते हैं, अलग-अलग हिस्से अलग-अलग काम सँभालने लगते हैं।",
        ),
      ),
      cell,
      differ,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** The amar-bel and the bread mould, explained. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const hedge = b.prop(lifeSceneDef, "hedge", { scene: LifeScene.AmarBel });
    b.standsFor(hedge, "the amar-bel threads on Grandpa's hedge; Kabir pulls at one");
    const bel = choiceQuestion(b, {
      name: "bel",
      prompt: t("So how does the leafless amar-bel live?", "तो बिना पत्तियों वाली अमरबेल जीती कैसे है?"),
      options: [
        {
          id: "right",
          label: t(
            "It is a parasite: it takes food from the hedge plant, its host",
            "यह परजीवी है: यह बाड़ के पौधे, अपने परपोषी, से भोजन लेती है",
          ),
        },
        {
          id: "photo",
          label: t(
            "It photosynthesises with its yellow threads",
            "यह अपने पीले धागों से प्रकाश संश्लेषण करती है",
          ),
          feedback: t(
            "Without green leaves it can't make its own food. It draws food from the plant it is wrapped round.",
            "हरी पत्तियों के बिना यह अपना भोजन नहीं बना सकती। यह उस पौधे से भोजन खींचती है जिस पर लिपटी है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const mould = choiceQuestion(b, {
      name: "mould",
      prompt: t("And the fuzzy mould on the bread?", "और डबलरोटी पर रोएँदार फफूँद?"),
      options: [
        {
          id: "right",
          label: t(
            "A fungus: it breaks the bread down outside its body and absorbs it",
            "एक कवक: यह डबलरोटी को अपने शरीर के बाहर तोड़कर सोखता है",
          ),
        },
        {
          id: "parasite",
          label: t("A parasite of the bread", "डबलरोटी का परजीवी"),
          feedback: t(
            "A parasite feeds on a *living* host. The bread is not alive; the mould digests it outside its body and absorbs the products.",
            "परजीवी *जीवित* परपोषी से भोजन लेता है। डबलरोटी जीवित नहीं; फफूँद उसे शरीर के बाहर पचाकर उत्पादों को सोखती है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const stop = w.definition(
      t(
        "**Stop 3 done.** Heterotrophs feed in many ways: fungi digest food outside the body, parasites live off a host, single cells like Amoeba and Paramoecium take food in and digest it inside. Kabir takes his food in whole and digests it inside, through a long tube. Next stop: what happens to his breakfast.",
        "**पड़ाव 3 पूरा।** विषमपोषी कई तरह से भोजन पाते हैं: कवक भोजन को शरीर के बाहर पचाते हैं, परजीवी परपोषी से जीते हैं, अमीबा और पैरामीशियम जैसी एकल कोशिकाएँ भोजन अंदर लेकर पचाती हैं। कबीर अपना भोजन पूरा अंदर लेता है और एक लंबी नली में पचाता है। अगला पड़ाव: उसके नाश्ते का क्या होता है।",
      ),
      "stop",
      { isHidden: true },
    );
    b.when(bel.on(QuestionSignal.Correct), theBoard.show(mould));
    b.when(mould.on(QuestionSignal.Correct), [theBoard.show(stop), theBoard.pass()]);
    return column([
      w.title(t("Back at the hedge", "फिर बाड़ के पास")),
      hedge,
      bel,
      mould,
      stop,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** NCERT 6.2 in-text Q1 and classifying feeders. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const differ = choiceQuestion(b, {
      name: "differ",
      prompt: t(
        "What is the main difference between autotrophic and heterotrophic nutrition?",
        "स्वपोषी और विषमपोषी पोषण में मुख्य अंतर क्या है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Autotrophs make food from simple inorganic materials; heterotrophs take in complex food made by others",
            "स्वपोषी सरल अकार्बनिक पदार्थों से भोजन बनाते हैं; विषमपोषी दूसरों का बनाया जटिल भोजन लेते हैं",
          ),
        },
        {
          id: "size",
          label: t("Autotrophs are small; heterotrophs are large", "स्वपोषी छोटे होते हैं; विषमपोषी बड़े"),
          feedback: t(
            "Size has nothing to do with it: a banyan tree is an autotroph and Amoeba a heterotroph. It's about who makes the food.",
            "आकार का इससे कोई लेना-देना नहीं: बरगद स्वपोषी है और अमीबा विषमपोषी। बात यह है कि भोजन कौन बनाता है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const tick = choiceQuestion(b, {
      name: "tick",
      prompt: t(
        "A tick clings to a dog and sucks its blood without killing it. The tick is…",
        "एक किलनी कुत्ते से चिपककर उसे मारे बिना उसका ख़ून चूसती है। किलनी है…",
      ),
      options: [
        { id: "right", label: t("a parasite", "परजीवी") },
        {
          id: "auto",
          label: t("an autotroph", "स्वपोषी"),
          feedback: t(
            "A tick makes no food of its own. It lives off its host.",
            "किलनी अपना कोई भोजन नहीं बनाती। वह अपने परपोषी से जीती है।",
          ),
        },
        {
          id: "outside",
          label: t("a fungus digesting food outside its body", "शरीर के बाहर भोजन पचाने वाला कवक"),
          feedback: t(
            "Ticks are animals, not fungi. Feeding on a living host without killing it is parasitism.",
            "किलनी जंतु है, कवक नहीं। जीवित परपोषी को मारे बिना उससे भोजन लेना परजीविता है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ Heterotrophs depend on food made by others. ✓ Fungi break food down outside, parasites live off a host, others take food in whole. ✓ Amoeba wraps food in a food vacuole; Paramoecium's cilia sweep it to one spot. Next: Kabir's own digestive tube.",
        "**मिशन लॉग।** ✓ विषमपोषी दूसरों के बनाए भोजन पर निर्भर हैं। ✓ कवक भोजन बाहर तोड़ते हैं, परजीवी परपोषी से जीते हैं, दूसरे भोजन पूरा अंदर लेते हैं। ✓ अमीबा भोजन को खाद्य रिक्तिका में लपेटता है; पैरामीशियम के पक्ष्माभ उसे एक जगह तक बुहारते हैं। आगे: कबीर की अपनी पाचन नली।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(tick.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), differ, tick, log, space()]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [hook, strategies, amoeba, paramoecium, inLife, yourTurn];

import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  DigestionAction,
  DigestionMode,
  LifeScene,
  STAGES,
  Stage,
  digestiveTractDef,
  lifeSceneDef,
} from "@chalk/prop-life";

const at = (stage: Stage) => STAGES.indexOf(stage);

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** Kabir's breakfast: what happens to it? */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const table = b.prop(lifeSceneDef, "table", { scene: LifeScene.Breakfast });
  b.standsFor(
    table,
    "the breakfast table: parathas, curd and a banana for Kabir; Grandpa reads the paper",
  );
  return column([
    w.title(t("Fuel for the run", "दौड़ के लिए ईंधन")),
    table,
    w.body(
      t(
        'Kabir takes his food in whole: stop 3 left him there. This morning Mom puts down two parathas shiny with ghee, a bowl of curd and a banana. "Eat now," says Riya, "so it\'s ready by practice." "Ready?" says Kabir. "It\'s in my stomach. Isn\'t that it?"',
        'कबीर अपना भोजन पूरा अंदर लेता है: पड़ाव 3 हमें यहीं छोड़ गया था। आज सुबह मम्मी घी लगे दो पराठे, दही की कटोरी और एक केला रखती हैं। "अभी खा लो," रिया कहती है, "ताकि अभ्यास तक तैयार हो जाए।" "तैयार?" कबीर कहता है। "पेट में तो पहुँच गया। बस इतना ही तो है?"',
      ),
    ),
    w.body(
      t(
        "Not even close. This stop: **what happens to the food on its way through Kabir's body?**",
        "बिल्कुल नहीं। इस पड़ाव का सवाल: **कबीर के शरीर से गुज़रते हुए भोजन का क्या होता है?**",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** The alimentary canal: one long tube, regions with different jobs. */
const canal = page(
  "canal",
  (b) => {
    const w = wordsOn(b);
    const tube = b.prop(digestiveTractDef, "tube", {
      mode: DigestionMode.Journey,
      step: 0,
      canStep: true,
    });
    b.studentOnly(tube.action(DigestionAction.Next));
    b.studentOnly(tube.action(DigestionAction.Back));
    b.studentOnly(tube.action(DigestionAction.Reset));
    b.standsFor(
      tube,
      "the human alimentary canal, with the food stepping through mouth, oesophagus, stomach, small intestine, villi, large intestine and anus",
    );
    const order = choiceQuestion(b, {
      name: "order",
      prompt: t(
        "Step through the journey. In what order does food pass?",
        "यात्रा के कदम चलो। भोजन किस क्रम में गुज़रता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Mouth → oesophagus → stomach → small intestine → large intestine → anus",
            "मुँह → ग्रसिका → आमाशय → क्षुद्रांत्र → बृहदांत्र → गुदा",
          ),
        },
        {
          id: "large",
          label: t(
            "Mouth → oesophagus → stomach → large intestine → small intestine → anus",
            "मुँह → ग्रसिका → आमाशय → बृहदांत्र → क्षुद्रांत्र → गुदा",
          ),
          feedback: t(
            "The small intestine comes first, straight after the stomach. The large intestine is near the end.",
            "आमाशय के ठीक बाद पहले क्षुद्रांत्र आती है। बृहदांत्र अंत के पास है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("One long tube", "एक लंबी नली")),
      w.definition(
        t(
          "**Alimentary canal.** The **alimentary canal** is a long tube from the **mouth** to the **anus**. Different regions of it are specialised for different jobs. **Digestion** is breaking big, complex food molecules into small, simple ones that can pass into the blood. It's done with the help of **enzymes**, the biological catalysts from stop 2.",
          "**आहार नाल।** **आहार नाल** **मुँह** से **गुदा** तक एक लंबी नली है। इसके अलग-अलग भाग अलग-अलग कामों के लिए विशेष हैं। **पाचन** बड़े, जटिल भोजन अणुओं को छोटे, सरल अणुओं में तोड़ना है जो रुधिर में जा सकें। यह **एंज़ाइमों** की मदद से होता है, पड़ाव 2 के जैव उत्प्रेरक।",
        ),
      ),
      w.body(
        t(
          "Watch three parts of a meal as they travel: **starch** (from parathas), **protein** (from curd) and **fat** (from ghee). The **oesophagus** is the food-pipe from the mouth to the stomach; the **villi** are coming up shortly.",
          "भोजन के तीन हिस्सों को यात्रा करते देखो: **मंड** (पराठों से), **प्रोटीन** (दही से) और **वसा** (घी से)। **ग्रसिका** मुँह से आमाशय तक की भोजन-नली है; **दीर्घरोम** थोड़ी देर में आएँगे।",
        ),
      ),
      tube,
      order,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The mouth: teeth, saliva, salivary amylase (Activity 6.3). */
const mouth = page(
  "mouth",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "NCERT Activity 6.3: starch solution with and without saliva, then iodine. Only the tube without saliva turns blue-black: salivary amylase has broken the starch down.",
    );
    const tubes = b.prop(digestiveTractDef, "tubes", {
      mode: DigestionMode.SalivaTest,
      step: 0,
      canStep: true,
    });
    b.studentOnly(tubes.action(DigestionAction.Next));
    b.studentOnly(tubes.action(DigestionAction.Reset));
    b.standsFor(
      tubes,
      "two test tubes of starch solution: A with saliva, B without; then iodine is added",
    );
    const which = choiceQuestion(b, {
      name: "which",
      prompt: t(
        "Step to the end. Tube B turns blue-black; tube A doesn't. What does that tell us?",
        "आख़िर तक चलो। नली B नीली-काली होती है; नली A नहीं। इससे क्या पता चलता है?",
      ),
      options: [
        {
          id: "right",
          label: t("Saliva broke down the starch in tube A", "लार ने नली A का मंड तोड़ दिया"),
        },
        {
          id: "added",
          label: t("Saliva added starch to tube A", "लार ने नली A में मंड मिला दिया"),
          feedback: t(
            "Blue-black means starch is present. Tube A *doesn't* turn blue-black, so its starch is gone: the saliva broke it down.",
            "नीला-काला मतलब मंड मौजूद है। नली A नीली-काली *नहीं* होती, इसलिए उसका मंड ख़त्म हो गया: लार ने उसे तोड़ दिया।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("In the mouth", "मुँह में")),
      w.body(
        t(
          "We eat many kinds of food, but they all go down the same tube, so they must be made into small particles of the same texture. The **teeth** crush the food. The lining of the canal is soft, so the food is also wetted to slide smoothly.",
          "हम कई तरह का भोजन खाते हैं, पर सब एक ही नली से जाता है, इसलिए उसे एक-सी बनावट के छोटे कणों में बदलना पड़ता है। **दाँत** भोजन को कुचलते हैं। नली की परत मुलायम है, इसलिए भोजन को गीला भी किया जाता है ताकि वह आसानी से फिसले।",
        ),
      ),
      w.definition(
        t(
          '**Saliva and salivary amylase.** When we eat something we like, our mouth "waters". This is **saliva**, made by the **salivary glands**. It contains an enzyme, **salivary amylase**, which breaks **starch**, a complex molecule, into simple **sugar**. The muscular **tongue** mixes the food with saliva while we chew.',
          '**लार और लार एमाइलेज़।** जब हम कुछ पसंद का खाते हैं तो मुँह में "पानी आ जाता है"। यह **लार** है, जो **लार ग्रंथियाँ** बनाती हैं। इसमें एक एंज़ाइम, **लार एमाइलेज़**, होता है जो **मंड**, एक जटिल अणु, को सरल **शर्करा** में तोड़ता है। चबाते समय मांसल **जीभ** भोजन को लार में मिलाती है।',
        ),
      ),
      w.body(
        t(
          "Test it the way NCERT Activity 6.3 does. Remember: **iodine turns blue-black where there is starch.**",
          "NCERT क्रियाकलाप 6.3 की तरह जाँचो। याद रखो: **जहाँ मंड होता है वहाँ आयोडीन नीला-काला हो जाता है।**",
        ),
      ),
      tubes,
      which,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Peristalsis, oesophagus, stomach: HCl, pepsin, mucus. */
const stomach = page(
  "stomach",
  (b) => {
    const w = wordsOn(b);
    const tube = b.prop(digestiveTractDef, "tube", {
      mode: DigestionMode.Journey,
      step: at(Stage.Stomach),
      canStep: true,
    });
    b.studentOnly(tube.action(DigestionAction.Next));
    b.studentOnly(tube.action(DigestionAction.Back));
    b.standsFor(tube, "the alimentary canal with the food in the stomach");
    const acid = choiceQuestion(b, {
      name: "acid",
      prompt: t(
        "What is the role of the hydrochloric acid in our stomach?",
        "हमारे आमाशय में हाइड्रोक्लोरिक अम्ल की क्या भूमिका है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "It makes the stomach acidic so pepsin can work",
            "यह आमाशय को अम्लीय बनाता है ताकि पेप्सिन काम करे",
          ),
        },
        {
          id: "digest",
          label: t("It digests the fat in our food", "यह भोजन की वसा पचाता है"),
          feedback: t(
            "Fat isn't digested in the stomach at all. The acid makes an acidic medium in which pepsin can digest protein.",
            "वसा आमाशय में पचती ही नहीं। अम्ल एक अम्लीय माध्यम बनाता है जिसमें पेप्सिन प्रोटीन पचा सकता है।",
          ),
        },
        {
          id: "mucus",
          label: t("It coats and protects the stomach's lining", "यह आमाशय के अस्तर को ढककर बचाता है"),
          feedback: t(
            "That's the mucus's job: it protects the lining *from* the acid.",
            "यह श्लेष्मा का काम है: वह परत की अम्ल *से* रक्षा करता है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Down to the stomach", "नीचे आमाशय तक")),
      w.definition(
        t(
          "**Peristalsis.** Food must move along the tube at a steady pace, so each part can do its job. Muscles in the lining of the canal contract in rhythmic waves that push the food forward. These **peristaltic movements** happen all along the gut.",
          "**क्रमाकुंचन।** भोजन को नली में एक नियमित गति से आगे बढ़ना चाहिए, ताकि हर भाग अपना काम कर सके। नली की परत की मांसपेशियाँ लयबद्ध लहरों में सिकुड़कर भोजन को आगे धकेलती हैं। ये **क्रमाकुंचन गतियाँ** पूरी आहार नाल में होती हैं।",
        ),
      ),
      w.body(
        t(
          "From the mouth, food goes down the **food-pipe (oesophagus)** to the **stomach**, a large organ that stretches as food enters. Its muscular walls mix the food thoroughly with more digestive juices.",
          "मुँह से भोजन **भोजन-नली (ग्रसिका)** से होकर **आमाशय** तक जाता है, एक बड़ा अंग जो भोजन आने पर फैल जाता है। इसकी मांसल दीवारें भोजन को और पाचक रसों के साथ अच्छी तरह मिलाती हैं।",
        ),
      ),
      w.definition(
        t(
          "**Gastric glands.** Glands in the stomach's wall, the **gastric glands**, release three things: **hydrochloric acid**, which makes the contents acidic; **pepsin**, an enzyme that digests protein, and works only in an acidic medium; and **mucus**, which protects the stomach's lining from the acid. When too much acid is made, adults complain of \"acidity\".",
          '**जठर ग्रंथियाँ।** आमाशय की दीवार की ग्रंथियाँ, **जठर ग्रंथियाँ**, तीन चीज़ें छोड़ती हैं: **हाइड्रोक्लोरिक अम्ल**, जो अंदर की चीज़ों को अम्लीय बनाता है; **पेप्सिन**, प्रोटीन पचाने वाला एंज़ाइम, जो केवल अम्लीय माध्यम में काम करता है; और **श्लेष्मा**, जो आमाशय की परत की अम्ल से रक्षा करता है। जब बहुत ज़्यादा अम्ल बनता है, तो बड़े "एसिडिटी" की शिकायत करते हैं।',
        ),
      ),
      tube,
      acid,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Small intestine: bile, pancreatic juice, intestinal juice. */
const smallIntestine = page(
  "small-intestine",
  (b) => {
    const w = wordsOn(b);
    const tube = b.prop(digestiveTractDef, "tube", {
      mode: DigestionMode.Journey,
      step: at(Stage.SmallIntestine),
      canStep: true,
    });
    b.studentOnly(tube.action(DigestionAction.Next));
    b.studentOnly(tube.action(DigestionAction.Back));
    b.standsFor(
      tube,
      "the alimentary canal with the food in the small intestine; the liver and pancreas pour in juices",
    );
    const bileJob = choiceQuestion(b, {
      name: "bileJob",
      prompt: t("What does bile do in the small intestine?", "क्षुद्रांत्र में पित्त क्या करता है?"),
      options: [
        {
          id: "right",
          label: t(
            "Makes the food alkaline and breaks fat into droplets",
            "भोजन को क्षारीय बनाता है और वसा को बूँदों में तोड़ता है",
          ),
        },
        {
          id: "digest",
          label: t(
            "Digests protein into amino acids all by itself",
            "अकेले ही प्रोटीन को अमीनो अम्ल में पचा देता है",
          ),
          feedback: t(
            "Bile has no digesting enzyme. It makes the food alkaline and breaks fat into small droplets, so enzymes can work.",
            "पित्त में पचाने वाला एंज़ाइम नहीं होता। वह भोजन को क्षारीय बनाता है और वसा को छोटी बूँदों में तोड़ता है, ताकि एंज़ाइम काम कर सकें।",
          ),
        },
        {
          id: "acid",
          label: t(
            "Makes the food more acidic so pepsin keeps working",
            "भोजन को और अम्लीय बनाता है ताकि पेप्सिन काम करता रहे",
          ),
          feedback: t(
            "It's the other way round: food from the stomach is acidic, and bile makes it alkaline for the next enzymes.",
            "उल्टा है: आमाशय से आया भोजन अम्लीय है, और पित्त उसे अगले एंज़ाइमों के लिए क्षारीय बनाता है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Into the small intestine", "क्षुद्रांत्र में")),
      w.body(
        t(
          "A ring of muscle at the stomach's exit, a **sphincter**, lets food into the **small intestine** a little at a time. It is the **longest** part of the canal, coiled up to fit. Its length depends on the food an animal eats: grass-eaters (herbivores) need a longer one to digest cellulose; meat is easier, so carnivores like tigers have a shorter one.",
          "आमाशय के निकास पर मांसपेशी का एक छल्ला, **अवरोधिनी**, भोजन को थोड़ा-थोड़ा करके **क्षुद्रांत्र** में जाने देता है। यह आहार नाल का **सबसे लंबा** भाग है, जो कुंडलित होकर समाया रहता है। इसकी लंबाई जंतु के भोजन पर निर्भर है: घास खाने वालों (शाकाहारियों) को सेल्यूलोज़ पचाने के लिए लंबी चाहिए; मांस पचाना आसान है, इसलिए बाघ जैसे मांसाहारियों की छोटी होती है।",
        ),
      ),
      w.definition(
        t(
          "**Bile.** The **liver** sends **bile** into the small intestine. Food arriving from the stomach is acidic; bile makes it **alkaline** so the next enzymes can work. Bile salts also break large fat globules into small droplets (**emulsify** them), just as soap breaks up grease, so enzymes can reach the fat more easily.",
          "**पित्त।** **यकृत** क्षुद्रांत्र में **पित्त** भेजता है। आमाशय से आया भोजन अम्लीय है; पित्त उसे **क्षारीय** बनाता है ताकि अगले एंज़ाइम काम कर सकें। पित्त लवण वसा की बड़ी गोलिकाओं को छोटी बूँदों में तोड़ते (**इमल्सीकृत** करते) हैं, जैसे साबुन चिकनाई को तोड़ता है, ताकि एंज़ाइम वसा तक आसानी से पहुँचें।",
        ),
      ),
      tube,
      bileJob,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Pancreatic and intestinal juice finish the job. */
const juices = page(
  "juices",
  (b) => {
    const w = wordsOn(b);
    const fat = choiceQuestion(b, {
      name: "fat",
      prompt: t("How are fats digested, and where?", "वसा कैसे और कहाँ पचती है?"),
      options: [
        {
          id: "right",
          label: t(
            "Small intestine: bile makes droplets, lipase breaks them down",
            "क्षुद्रांत्र: पित्त बूँदें बनाता है, लाइपेज़ उन्हें तोड़ता है",
          ),
        },
        {
          id: "stomach",
          label: t(
            "In the stomach, where pepsin breaks the fat down",
            "आमाशय में, जहाँ पेप्सिन वसा को तोड़ता है",
          ),
          feedback: t(
            "Pepsin digests protein. Fat waits until the small intestine, where bile and lipase deal with it.",
            "पेप्सिन प्रोटीन पचाता है। वसा क्षुद्रांत्र तक रुकी रहती है, जहाँ पित्त और लाइपेज़ उसे सँभालते हैं।",
          ),
        },
        {
          id: "bile",
          label: t(
            "Bile alone digests it fully in the gall bladder",
            "पित्ताशय में अकेला पित्त इसे पूरा पचाता है",
          ),
          feedback: t(
            "Bile only breaks big fat globules into small ones (emulsifies them). The enzyme lipase does the digesting.",
            "पित्त केवल वसा की बड़ी गोलिकाओं को छोटी में तोड़ता (इमल्सीकृत करता) है। पचाने का काम एंज़ाइम लाइपेज़ करता है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("The small intestine: where digestion finishes", "क्षुद्रांत्र: जहाँ पाचन पूरा होता है")),
      w.definition(
        t(
          "**Pancreatic and intestinal juice.** The **pancreas** sends **pancreatic juice**, with **trypsin** (digests protein) and **lipase** (breaks down the emulsified fat). Glands in the intestine's wall make **intestinal juice**, whose enzymes finish the job: proteins → **amino acids**, complex carbohydrates → **glucose**, fats → **fatty acids and glycerol**.",
          "**अग्न्याशयी और आंत्र रस।** **अग्न्याशय** **अग्न्याशयी रस** भेजता है, जिसमें **ट्रिप्सिन** (प्रोटीन पचाता है) और **लाइपेज़** (इमल्सीकृत वसा को तोड़ता है) हैं। आंत की दीवार की ग्रंथियाँ **आंत्र रस** बनाती हैं, जिसके एंज़ाइम काम पूरा करते हैं: प्रोटीन → **अमीनो अम्ल**, जटिल कार्बोहाइड्रेट → **ग्लूकोज़**, वसा → **वसा अम्ल और ग्लिसरॉल**।",
        ),
      ),
      fat,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Villi; the large intestine; the anus; dental caries. */
const villi = page(
  "villi",
  (b) => {
    const w = wordsOn(b);
    const tube = b.prop(digestiveTractDef, "tube", {
      mode: DigestionMode.Journey,
      step: at(Stage.Villi),
      canStep: true,
    });
    b.studentOnly(tube.action(DigestionAction.Next));
    b.studentOnly(tube.action(DigestionAction.Back));
    b.standsFor(
      tube,
      "a close-up of the villi lining the small intestine, carrying digested food into the blood",
    );
    const design = choiceQuestion(b, {
      name: "design",
      prompt: t(
        "How is the small intestine designed to absorb digested food?",
        "क्षुद्रांत्र पचे हुए भोजन को सोखने के लिए कैसे बनी है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Its lining has many finger-like villi, which increase the surface area and are rich in blood vessels",
            "इसकी परत में बहुत से उँगली जैसे दीर्घरोम हैं, जो सतह का क्षेत्रफल बढ़ाते हैं और जिनमें ख़ूब रुधिर वाहिकाएँ हैं",
          ),
        },
        {
          id: "wide",
          label: t("It is very wide and straight", "यह बहुत चौड़ी और सीधी है"),
          feedback: t(
            "It's long and coiled, and its lining is folded into villi: that's what gives a huge surface for absorption.",
            "यह लंबी और कुंडलित है, और इसकी परत दीर्घरोमों में मुड़ी है: इसी से सोखने के लिए बहुत बड़ी सतह मिलती है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const water = choiceQuestion(b, {
      name: "water",
      prompt: t(
        "What does the large intestine mainly do with the leftovers?",
        "बृहदांत्र बचे हुए पदार्थ के साथ मुख्य रूप से क्या करती है?",
      ),
      options: [
        { id: "right", label: t("Absorbs more water from them", "उनसे और पानी सोखती है") },
        {
          id: "digest",
          label: t("Digests the rest of the protein", "बचा हुआ प्रोटीन पचाती है"),
          feedback: t(
            "Digestion is complete in the small intestine. The large intestine takes back water from what's left.",
            "पाचन क्षुद्रांत्र में पूरा हो जाता है। बृहदांत्र बचे हुए पदार्थ से पानी वापस लेती है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    b.when(design.on(QuestionSignal.Correct), theBoard.show(water));
    b.when(water.on(QuestionSignal.Correct), theBoard.pass());
    return column([
      w.title(t("Into the blood, and out", "रुधिर में, और बाहर")),
      w.definition(
        t(
          "**Villi.** The inner lining of the small intestine has numerous finger-like projections called **villi** (one is a **villus**). They greatly increase the surface area for absorption. They are richly supplied with **blood vessels**, which take the absorbed food to every cell of the body, where it is used for energy, for building new tissue and for repairing old tissue.",
          "**दीर्घरोम।** क्षुद्रांत्र की भीतरी परत में बहुत से उँगली जैसे उभार होते हैं जिन्हें **दीर्घरोम** कहते हैं। ये सोखने के लिए सतह का क्षेत्रफल बहुत बढ़ा देते हैं। इनमें ख़ूब **रुधिर वाहिकाएँ** होती हैं, जो सोखे हुए भोजन को शरीर की हर कोशिका तक ले जाती हैं, जहाँ वह ऊर्जा के लिए, नए ऊतक बनाने और पुराने ऊतकों की मरम्मत में उपयोग होता है।",
        ),
      ),
      w.body(
        t(
          "What isn't absorbed goes on to the **large intestine**, whose walls absorb more water from it. The rest leaves the body through the **anus**, and a ring of muscle, the **anal sphincter**, controls when.",
          "जो सोखा नहीं जाता, वह **बृहदांत्र** में जाता है, जिसकी दीवारें उससे और पानी सोखती हैं। बाक़ी **गुदा** से शरीर से बाहर निकलता है, और मांसपेशी का एक छल्ला, **गुदा अवरोधिनी**, नियंत्रित करता है कि कब।",
        ),
      ),
      tube,
      design,
      water,
      w.note(
        t(
          "**More to know: dental caries.** Bacteria acting on sugars make acids that soften the tooth's enamel and dentine (tooth decay). Bacteria and food stick to the teeth as **plaque**, which stops saliva from reaching the tooth to neutralise the acid. Brushing after eating removes the plaque before the bacteria make acid. Left untreated, germs can reach the pulp and cause infection.",
          "**और जानो: दंत क्षरण।** शर्करा पर काम करने वाले जीवाणु अम्ल बनाते हैं जो दाँत के इनैमल और डेंटीन को नरम कर देते हैं (दाँतों की सड़न)। जीवाणु और भोजन दाँतों पर **प्लाक** के रूप में चिपकते हैं, जो लार को दाँत तक पहुँचकर अम्ल को उदासीन करने से रोकता है। खाने के बाद ब्रश करने से जीवाणुओं के अम्ल बनाने से पहले प्लाक हट जाता है। इलाज न हो तो रोगाणु मज्जा तक पहुँचकर संक्रमण कर सकते हैं।",
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

/** Kabir's breakfast, followed through. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const table = b.prop(lifeSceneDef, "table", { scene: LifeScene.Breakfast });
    b.standsFor(table, "Kabir's breakfast: parathas, curd and a banana");
    const ghee = choiceQuestion(b, {
      name: "ghee",
      prompt: t(
        "Where does the ghee on Kabir's parathas finally get digested, and into what?",
        "कबीर के पराठों का घी आख़िर कहाँ पचता है, और किसमें बदलता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "In the small intestine, into fatty acids and glycerol",
            "क्षुद्रांत्र में, वसा अम्ल और ग्लिसरॉल में",
          ),
        },
        {
          id: "mouth",
          label: t("In the mouth, into sugar", "मुँह में, शर्करा में"),
          feedback: t(
            "Saliva works on starch, not fat. Ghee is fat: bile and lipase in the small intestine break it into fatty acids and glycerol.",
            "लार मंड पर काम करती है, वसा पर नहीं। घी वसा है: क्षुद्रांत्र में पित्त और लाइपेज़ उसे वसा अम्ल और ग्लिसरॉल में तोड़ते हैं।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const curd = choiceQuestion(b, {
      name: "curd",
      prompt: t(
        "The protein in the curd starts being digested in the stomach. By which enzyme?",
        "दही के प्रोटीन का पाचन आमाशय में शुरू होता है। किस एंज़ाइम से?",
      ),
      options: [
        { id: "right", label: t("Pepsin", "पेप्सिन") },
        {
          id: "amylase",
          label: t("Salivary amylase", "लार एमाइलेज़"),
          feedback: t(
            "Salivary amylase works on starch. Protein digestion begins with pepsin in the stomach.",
            "लार एमाइलेज़ मंड पर काम करता है। प्रोटीन का पाचन आमाशय में पेप्सिन से शुरू होता है।",
          ),
        },
        {
          id: "lipase",
          label: t("Lipase", "लाइपेज़"),
          feedback: t(
            "Lipase breaks down fat, in the small intestine.",
            "लाइपेज़ क्षुद्रांत्र में वसा तोड़ता है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const stop = w.definition(
      t(
        "**Stop 4 done.** By practice time, Kabir's breakfast is glucose, amino acids, fatty acids and glycerol, carried by his blood to every cell. That's why Riya made him eat early: digestion takes time. But food in a cell isn't energy yet. Next stop: how cells burn it, and why Kabir's leg cramped.",
        "**पड़ाव 4 पूरा।** अभ्यास के समय तक कबीर का नाश्ता ग्लूकोज़, अमीनो अम्ल, वसा अम्ल और ग्लिसरॉल बन चुका है, जिसे उसका रुधिर हर कोशिका तक ले जाता है। इसीलिए रिया ने उसे जल्दी खिलाया: पाचन में समय लगता है। पर कोशिका में भोजन अभी ऊर्जा नहीं है। अगला पड़ाव: कोशिकाएँ उसे कैसे जलाती हैं, और कबीर के पैर में ऐंठन क्यों हुई।",
      ),
      "stop",
      { isHidden: true },
    );
    b.when(ghee.on(QuestionSignal.Correct), theBoard.show(curd));
    b.when(curd.on(QuestionSignal.Correct), [theBoard.show(stop), theBoard.pass()]);
    return column([
      w.title(t("Kabir's breakfast, followed through", "कबीर के नाश्ते का पूरा सफ़र")),
      table,
      w.body(
        t(
          "The parathas are mostly starch, the curd brings protein, and the ghee is fat. Each is dealt with by different juices in different parts of the canal.",
          "पराठे ज़्यादातर मंड हैं, दही प्रोटीन लाता है, और घी वसा है। हर एक को आहार नाल के अलग-अलग भागों में अलग-अलग रस सँभालते हैं।",
        ),
      ),
      ghee,
      curd,
      stop,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** NCERT in-text Q4 and Exercise 6. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const enzymes = choiceQuestion(b, {
      name: "enzymes",
      prompt: t("What is the function of digestive enzymes?", "पाचक एंज़ाइमों का क्या काम है?"),
      options: [
        {
          id: "right",
          label: t(
            "To break complex food molecules into simple ones that can be absorbed",
            "जटिल भोजन अणुओं को सरल अणुओं में तोड़ना, जिन्हें सोखा जा सके",
          ),
        },
        {
          id: "push",
          label: t("To push food along the canal", "भोजन को आहार नाल में आगे धकेलना"),
          feedback: t(
            "Pushing is done by muscles (peristalsis). Enzymes break food down chemically.",
            "धकेलने का काम मांसपेशियाँ (क्रमाकुंचन) करती हैं। एंज़ाइम भोजन को रासायनिक रूप से तोड़ते हैं।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const saliva = choiceQuestion(b, {
      name: "saliva",
      prompt: t(
        "What is the role of saliva in the digestion of food?",
        "भोजन के पाचन में लार की क्या भूमिका है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "It wets the food, and its salivary amylase starts breaking starch into sugar",
            "यह भोजन को गीला करती है, और इसका लार एमाइलेज़ मंड को शर्करा में तोड़ना शुरू करता है",
          ),
        },
        {
          id: "protein",
          label: t("It digests protein", "यह प्रोटीन पचाती है"),
          feedback: t(
            "Saliva works on starch. Protein is digested by pepsin and trypsin.",
            "लार मंड पर काम करती है। प्रोटीन पेप्सिन और ट्रिप्सिन से पचता है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ Food goes mouth → oesophagus → stomach → small intestine → large intestine → anus, pushed by peristalsis. ✓ Saliva (amylase) starts on starch; the stomach (HCl, pepsin, mucus) on protein. ✓ In the small intestine, bile, pancreatic juice and intestinal juice finish everything; villi absorb it into the blood. Next: turning food into energy.",
        "**मिशन लॉग।** ✓ भोजन मुँह → ग्रसिका → आमाशय → क्षुद्रांत्र → बृहदांत्र → गुदा जाता है, क्रमाकुंचन से धकेला जाकर। ✓ लार (एमाइलेज़) मंड पर, आमाशय (HCl, पेप्सिन, श्लेष्मा) प्रोटीन पर काम शुरू करते हैं। ✓ क्षुद्रांत्र में पित्त, अग्न्याशयी रस और आंत्र रस सब पूरा करते हैं; दीर्घरोम उसे रुधिर में सोखते हैं। आगे: भोजन को ऊर्जा में बदलना।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(saliva.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), enzymes, saliva, log, space()]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [
  hook,
  canal,
  mouth,
  stomach,
  smallIntestine,
  juices,
  villi,
  inLife,
  yourTurn,
];

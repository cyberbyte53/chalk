import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import { LeafAction, LeafMode, LifeScene, leafLabDef, lifeSceneDef } from "@chalk/prop-life";

const r = String.raw;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** Grandpa's money plant: it never eats, yet it grows. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const plant = b.prop(lifeSceneDef, "plant", { scene: LifeScene.MoneyPlant });
  b.standsFor(
    plant,
    "Grandpa's money plant with green-and-cream leaves, climbing a stick in the sun",
  );
  return column([
    w.title(t("A plant that never eats", "एक पौधा जो कभी खाता नहीं")),
    plant,
    w.body(
      t(
        "Stop 1 showed that every living thing needs food: it is the source of energy and of material to grow. Kabir eats three parathas after practice. But Grandpa's money plant has climbed from the pot to the top of its stick this year, and nobody has ever fed it anything except water.",
        "पड़ाव 1 ने दिखाया कि हर जीव को भोजन चाहिए: वह ऊर्जा का स्रोत है और बढ़ने के लिए सामग्री का भी। कबीर अभ्यास के बाद तीन पराठे खाता है। पर दादाजी का मनी प्लांट इस साल गमले से डंडी के सिरे तक चढ़ गया है, और किसी ने उसे पानी के अलावा कभी कुछ नहीं खिलाया।",
      ),
    ),
    w.body(
      t(
        '"So where does all that plant come from?" asks Kabir. That\'s this stop: **how a plant makes its own food**.',
        '"तो इतना सारा पौधा आया कहाँ से?" कबीर पूछता है। यही इस पड़ाव का सवाल है: **पौधा अपना भोजन ख़ुद कैसे बनाता है**।',
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Autotrophs and heterotrophs; enzymes. */
const kinds = page(
  "kinds",
  (b) => {
    const w = wordsOn(b);
    const cow = choiceQuestion(b, {
      name: "cow",
      prompt: t(
        "A cow eats grass. Which kind of organism is the cow?",
        "गाय घास खाती है। गाय किस तरह का जीव है?",
      ),
      options: [
        { id: "right", label: t("A heterotroph", "विषमपोषी") },
        {
          id: "auto",
          label: t("An autotroph", "स्वपोषी"),
          feedback: t(
            "The cow can't make food from carbon dioxide and water; it eats complex food the grass made. That makes it a heterotroph. The grass is the autotroph.",
            "गाय कार्बन डाइऑक्साइड और पानी से भोजन नहीं बना सकती; वह घास का बनाया जटिल भोजन खाती है। इसलिए वह विषमपोषी है। घास स्वपोषी है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Two ways to get food", "भोजन पाने के दो तरीक़े")),
      w.definition(
        t(
          '**Autotroph.** An organism that makes its own food from simple, non-living (inorganic) materials, **carbon dioxide** and **water**, is an **autotroph** ("self-feeder"). Green plants and some bacteria are autotrophs. Their way of feeding is **autotrophic nutrition**.',
          '**स्वपोषी।** जो जीव साधारण, निर्जीव (अकार्बनिक) पदार्थों, **कार्बन डाइऑक्साइड** और **पानी**, से अपना भोजन ख़ुद बनाता है, वह **स्वपोषी** ("ख़ुद को पोषित करने वाला") है। हरे पौधे और कुछ जीवाणु स्वपोषी हैं। उनका पोषण का तरीक़ा **स्वपोषी पोषण** है।',
        ),
      ),
      w.definition(
        t(
          '**Heterotroph.** An organism that takes in complex food made by other organisms is a **heterotroph** ("other-feeder"). Animals and fungi are heterotrophs. They must break complex food down into simpler substances first, using **enzymes**: substances made by the body that speed up a particular chemical reaction (biological catalysts).',
          '**विषमपोषी।** जो जीव दूसरे जीवों का बनाया जटिल भोजन लेता है, वह **विषमपोषी** ("दूसरों से पोषित") है। जंतु और कवक विषमपोषी हैं। उन्हें पहले जटिल भोजन को सरल पदार्थों में तोड़ना पड़ता है, **एंज़ाइमों** की मदद से: शरीर के बनाए वे पदार्थ जो किसी ख़ास रासायनिक अभिक्रिया को तेज़ करते हैं (जैव उत्प्रेरक)।',
        ),
      ),
      w.body(
        t(
          "So every heterotroph depends, directly or through others, on autotrophs. The lion eats the deer, the deer ate the grass, and the grass made the food.",
          "इसलिए हर विषमपोषी सीधे या दूसरों के ज़रिए स्वपोषियों पर निर्भर है। शेर हिरण खाता है, हिरण ने घास खाई, और घास ने भोजन बनाया।",
        ),
      ),
      cow,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Photosynthesis: the equation, three events, starch and glycogen. */
const equation = page(
  "equation",
  (b) => {
    const w = wordsOn(b);
    const store = choiceQuestion(b, {
      name: "store",
      prompt: t(
        "A plant makes more carbohydrate than it can use right now. In what form does it store the rest?",
        "पौधा जितना कार्बोहाइड्रेट अभी उपयोग कर सकता है, उससे ज़्यादा बनाता है। बाक़ी को वह किस रूप में जमा करता है?",
      ),
      options: [
        { id: "right", label: t("Starch", "मंड (स्टार्च)") },
        {
          id: "glycogen",
          label: t("Glycogen", "ग्लाइकोजन"),
          feedback: t(
            "Glycogen is how *our* bodies store energy. Plants store theirs as starch.",
            "ग्लाइकोजन वह रूप है जिसमें *हमारा* शरीर ऊर्जा जमा करता है। पौधे अपनी ऊर्जा मंड के रूप में जमा करते हैं।",
          ),
        },
        {
          id: "oxygen",
          label: t("Oxygen", "ऑक्सीजन"),
          feedback: t(
            "Oxygen is given out, not stored. The spare carbohydrate is kept as starch.",
            "ऑक्सीजन बाहर निकलती है, जमा नहीं होती। बचा हुआ कार्बोहाइड्रेट मंड के रूप में रखा जाता है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Photosynthesis", "प्रकाश संश्लेषण")),
      w.definition(
        t(
          '**Photosynthesis.** The process by which autotrophs take in **carbon dioxide** and **water** and, using **sunlight** and the green pigment **chlorophyll**, turn them into **carbohydrates** (food such as sugars and starch), giving out **oxygen**, is **photosynthesis** ("making with light").',
          '**प्रकाश संश्लेषण।** वह प्रक्रम जिसमें स्वपोषी **कार्बन डाइऑक्साइड** और **पानी** लेकर, **सूर्य के प्रकाश** और हरे वर्णक **क्लोरोफ़िल** की मदद से, उन्हें **कार्बोहाइड्रेट** (शर्करा और मंड जैसा भोजन) में बदलते हैं और **ऑक्सीजन** छोड़ते हैं, **प्रकाश संश्लेषण** ("प्रकाश से बनाना") है।',
        ),
      ),
      w.body(t("As an equation:", "समीकरण के रूप में:")),
      w.body(
        t(
          r`$$\begin{aligned} &\ce{6CO2 + 12H2O} \\ &\ce{->[Sunlight][Chlorophyll] C6H12O6 + 6O2 + 6H2O} \end{aligned}$$`,
          r`$$\begin{aligned} &\ce{6CO2 + 12H2O} \\ &\ce{->[\text{सूर्य का प्रकाश}][\text{क्लोरोफ़िल}] C6H12O6 + 6O2 + 6H2O} \end{aligned}$$`,
        ),
      ),
      w.body(
        t(
          r`$\ce{C6H12O6}$ is glucose, a simple carbohydrate.`,
          r`$\ce{C6H12O6}$ ग्लूकोज़ है, एक सरल कार्बोहाइड्रेट।`,
        ),
      ),
      w.definition(
        t(
          "**Three events.** (i) Chlorophyll **absorbs light energy**. (ii) Light energy is **converted to chemical energy**, and **water molecules are split** into hydrogen and oxygen. (iii) **Carbon dioxide is reduced** to carbohydrates.",
          "**तीन घटनाएँ।** (i) क्लोरोफ़िल **प्रकाश ऊर्जा अवशोषित** करता है। (ii) प्रकाश ऊर्जा **रासायनिक ऊर्जा में बदलती** है, और **पानी के अणु** हाइड्रोजन और ऑक्सीजन में **टूटते** हैं। (iii) **कार्बन डाइऑक्साइड का अपचयन** होकर कार्बोहाइड्रेट बनता है।",
        ),
      ),
      w.note(
        t(
          "More to know: the three events need not happen one right after the other. Desert plants take in carbon dioxide at night and store it as an in-between substance, which is then used in the day with the light the chlorophyll absorbs.",
          "और जानो: ज़रूरी नहीं कि ये तीनों घटनाएँ एक के ठीक बाद दूसरी हों। रेगिस्तानी पौधे रात में कार्बन डाइऑक्साइड लेकर एक बीच का पदार्थ बना लेते हैं, जिसका दिन में क्लोरोफ़िल के अवशोषित प्रकाश से उपयोग होता है।",
        ),
      ),
      w.body(
        t(
          "The plant uses carbohydrates for energy. What it doesn't need right away it stores as **starch**, an energy reserve to use later. We do something similar: some energy from our food is stored in our body as **glycogen**.",
          "पौधा ऊर्जा के लिए कार्बोहाइड्रेट का उपयोग करता है। जिसकी तुरंत ज़रूरत नहीं, उसे वह **मंड** के रूप में जमा कर लेता है, बाद में काम आने वाला ऊर्जा का भंडार। हम भी कुछ ऐसा ही करते हैं: भोजन की कुछ ऊर्जा हमारे शरीर में **ग्लाइकोजन** के रूप में जमा होती है।",
        ),
      ),
      store,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Chlorophyll is needed: chloroplasts, and the variegated leaf (Activity 6.1). */
const chlorophyll = page(
  "chlorophyll",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "NCERT Activity 6.1: a variegated leaf, destarched in the dark, kept in sunlight, decolourised in alcohol and tested with iodine, shows starch only where it was green: chlorophyll is essential for photosynthesis.",
    );
    const leaf = b.prop(leafLabDef, "leaf", {
      mode: LeafMode.Variegated,
      step: 0,
      canStep: true,
      canToggle: false,
    });
    b.studentOnly(leaf.action(LeafAction.Next));
    b.studentOnly(leaf.action(LeafAction.Reset));
    b.standsFor(
      leaf,
      "the variegated-leaf starch test, step by step: dark for 3 days, sunlight, boiling water, alcohol, iodine",
    );
    const where = choiceQuestion(b, {
      name: "where",
      prompt: t(
        "Step to the end. Which parts of the leaf turned blue-black with iodine, and what does that show?",
        "आख़िर तक चलो। पत्ती के कौन-से हिस्से आयोडीन से नीले-काले हुए, और इससे क्या पता चलता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Only the parts that were green: starch is made only where there is chlorophyll",
            "केवल वे हिस्से जो हरे थे: मंड केवल वहीं बनता है जहाँ क्लोरोफ़िल है",
          ),
        },
        {
          id: "all",
          label: t("The whole leaf: every part makes starch", "पूरी पत्ती: हर हिस्सा मंड बनाता है"),
          feedback: t(
            "Look at the last step: the cream parts stayed pale. They have no chlorophyll, so they made no starch.",
            "आख़िरी कदम देखो: मलाईदार हिस्से फीके ही रहे। उनमें क्लोरोफ़िल नहीं, इसलिए उन्होंने मंड नहीं बनाया।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Chlorophyll is needed", "क्लोरोफ़िल ज़रूरी है")),
      w.definition(
        t(
          "**Chloroplast.** Look at a thin slice of a leaf under a microscope and some cells contain green dots. These are **chloroplasts**, tiny parts of the cell (cell organelles) that contain **chlorophyll**.",
          "**क्लोरोप्लास्ट।** पत्ती की पतली परत को सूक्ष्मदर्शी से देखो तो कुछ कोशिकाओं में हरे बिंदु दिखते हैं। ये **क्लोरोप्लास्ट** हैं, कोशिका के नन्हे हिस्से (कोशिकांग) जिनमें **क्लोरोफ़िल** होता है।",
        ),
      ),
      w.body(
        t(
          "To test whether chlorophyll is needed, take a **variegated** leaf: one with green parts and cream parts, like a money plant or croton. **Iodine** turns blue-black wherever there is starch, so starch shows where photosynthesis happened. Step through NCERT Activity 6.1.",
          "क्लोरोफ़िल ज़रूरी है या नहीं, यह जाँचने के लिए एक **चितकबरी** पत्ती लो: जिसमें हरे और मलाईदार हिस्से हों, जैसे मनी प्लांट या क्रोटन। जहाँ मंड होता है वहाँ **आयोडीन** नीला-काला हो जाता है, इसलिए मंड दिखाता है कि प्रकाश संश्लेषण कहाँ हुआ। NCERT क्रियाकलाप 6.1 के कदम चलो।",
        ),
      ),
      leaf,
      where,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Stomata and guard cells. */
const stomata = page(
  "stomata",
  (b) => {
    const w = wordsOn(b);
    const pore = b.prop(leafLabDef, "pore", {
      mode: LeafMode.Stomata,
      step: 0,
      isOpen: true,
      canStep: false,
      canToggle: true,
    });
    b.studentOnly(pore.action(LeafAction.SetOpen));
    b.standsFor(
      pore,
      "a stoma on a leaf's surface between two guard cells, which can be opened or closed",
    );
    const close = choiceQuestion(b, {
      name: "close",
      prompt: t(
        "Why does a plant close its stomata when it doesn't need carbon dioxide?",
        "जब पौधे को कार्बन डाइऑक्साइड नहीं चाहिए, तो वह अपने रंध्र क्यों बंद करता है?",
      ),
      options: [
        {
          id: "right",
          label: t("Open pores let a lot of water escape", "खुले छिद्रों से बहुत पानी निकल जाता है"),
        },
        {
          id: "oxygen",
          label: t(
            "Open pores let oxygen escape unused",
            "खुले छिद्रों से ऑक्सीजन बिना काम आए निकल जाती है",
          ),
          feedback: t(
            "Oxygen is a by-product the plant gives out anyway. The real cost of open pores is water vapour escaping.",
            "ऑक्सीजन तो उपोत्पाद है जिसे पौधा वैसे भी छोड़ता है। खुले छिद्रों की असली क़ीमत जलवाष्प का निकल जाना है।",
          ),
        },
        {
          id: "dust",
          label: t("Open pores let dust clog the leaf", "खुले छिद्रों से धूल पत्ती को जाम कर देती है"),
          feedback: t(
            "The reason is water: open pores let water vapour escape, so the plant shuts them when it doesn't need carbon dioxide.",
            "कारण पानी है: खुले छिद्रों से जलवाष्प निकलती है, इसलिए जब कार्बन डाइऑक्साइड नहीं चाहिए तो पौधा उन्हें बंद कर देता है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("How carbon dioxide gets in", "कार्बन डाइऑक्साइड अंदर कैसे आती है")),
      w.definition(
        t(
          "**Stomata.** Tiny pores on the surface of leaves are **stomata** (one is a **stoma**). A huge amount of gas exchange for photosynthesis happens through them, though gases are also exchanged across the surface of stems, roots and leaves. Open stomata also let water vapour escape, and a plant can lose a lot of water this way.",
          "**रंध्र।** पत्तियों की सतह पर नन्हे छिद्र **रंध्र** कहलाते हैं। प्रकाश संश्लेषण के लिए गैसों का बहुत बड़ा आदान-प्रदान इन्हीं से होता है, हालाँकि तनों, जड़ों और पत्तियों की सतह से भी गैसें आती-जाती हैं। खुले रंध्रों से जलवाष्प भी निकलती है, और इस तरह पौधा बहुत पानी खो सकता है।",
        ),
      ),
      w.definition(
        t(
          "**Guard cells.** Each stoma sits between two **guard cells** that open and close it. When water flows into the guard cells they swell and the pore opens; when they shrink, the pore closes.",
          "**द्वार कोशिकाएँ।** हर रंध्र दो **द्वार कोशिकाओं** के बीच होता है जो उसे खोलती-बंद करती हैं। जब पानी द्वार कोशिकाओं में जाता है तो वे फूल जाती हैं और छिद्र खुल जाता है; जब वे सिकुड़ती हैं, छिद्र बंद हो जाता है।",
        ),
      ),
      pore,
      close,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Carbon dioxide is needed: the bell-jars with and without KOH (Activity 6.2). */
const carbonDioxide = page(
  "carbon-dioxide",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "NCERT Activity 6.2: two destarched plants under sealed bell-jars in sunlight, one with potassium hydroxide (which absorbs CO₂); only the plant that had CO₂ makes starch.",
    );
    const jars = b.prop(leafLabDef, "jars", {
      mode: LeafMode.BellJar,
      step: 0,
      canStep: true,
      canToggle: false,
    });
    b.studentOnly(jars.action(LeafAction.Next));
    b.studentOnly(jars.action(LeafAction.Reset));
    b.standsFor(
      jars,
      "two plants under sealed bell-jars; A has potassium hydroxide beside it, B doesn't",
    );
    const conclude = choiceQuestion(b, {
      name: "conclude",
      prompt: t(
        "Plant A (with potassium hydroxide) has no starch; plant B does. What do we conclude?",
        "पौधे A (पोटैशियम हाइड्रॉक्साइड वाले) में मंड नहीं है; पौधे B में है। हम क्या निष्कर्ष निकालते हैं?",
      ),
      options: [
        {
          id: "right",
          label: t("Photosynthesis needs carbon dioxide", "प्रकाश संश्लेषण को कार्बन डाइऑक्साइड चाहिए"),
        },
        {
          id: "light",
          label: t("Photosynthesis needs sunlight", "प्रकाश संश्लेषण को सूर्य का प्रकाश चाहिए"),
          feedback: t(
            "Both plants had the same sunlight. The only difference was the potassium hydroxide, which took away the carbon dioxide.",
            "दोनों पौधों को एक-सा प्रकाश मिला। अंतर केवल पोटैशियम हाइड्रॉक्साइड का था, जिसने कार्बन डाइऑक्साइड सोख ली।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const sunlight = choiceQuestion(b, {
      name: "sunlight",
      prompt: t(
        "Now design a test that sunlight is needed. Which set-up works?",
        "अब ऐसा परीक्षण बनाओ जो दिखाए कि सूर्य का प्रकाश ज़रूरी है। कौन-सा तरीक़ा सही है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Two destarched plants, one in sunlight and one kept in the dark, then a starch test",
            "मंड-रहित किए दो पौधे, एक धूप में और एक अँधेरे में, फिर मंड परीक्षण",
          ),
        },
        {
          id: "both",
          label: t(
            "Two plants both in sunlight, one watered and one not",
            "दो पौधे दोनों धूप में, एक को पानी देकर और एक को बिना",
          ),
          feedback: t(
            "That changes water, not light. Keep everything the same except the one thing you test: light.",
            "इससे पानी बदलता है, प्रकाश नहीं। जिस चीज़ को जाँच रहे हो (प्रकाश), उसके अलावा सब कुछ एक-सा रखो।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    b.when(conclude.on(QuestionSignal.Correct), theBoard.show(sunlight));
    b.when(sunlight.on(QuestionSignal.Correct), theBoard.pass());
    return column([
      w.title(t("Carbon dioxide is needed", "कार्बन डाइऑक्साइड ज़रूरी है")),
      w.body(
        t(
          "NCERT Activity 6.2. Two similar potted plants are kept in the dark for three days, so their leaves use up all their starch. Each is then covered with a bell-jar, sealed air-tight with vaseline. Beside plant A is a watch-glass of **potassium hydroxide**, which absorbs carbon dioxide from the air. Step through it.",
          "NCERT क्रियाकलाप 6.2। दो मिलते-जुलते गमले के पौधे तीन दिन अँधेरे में रखे जाते हैं, ताकि उनकी पत्तियाँ सारा मंड ख़र्च कर दें। फिर हर एक को बेल-जार से ढककर वैसलीन से हवाबंद किया जाता है। पौधे A के पास **पोटैशियम हाइड्रॉक्साइड** की एक वॉच-ग्लास रखी है, जो हवा से कार्बन डाइऑक्साइड सोख लेता है। कदम चलो।",
        ),
      ),
      jars,
      conclude,
      sunlight,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Water and minerals from the soil. */
const soil = page(
  "soil",
  (b) => {
    const w = wordsOn(b);
    const nitrogen = choiceQuestion(b, {
      name: "nitrogen",
      prompt: t(
        "In what form do plants usually take up nitrogen?",
        "पौधे आमतौर पर नाइट्रोजन किस रूप में लेते हैं?",
      ),
      options: [
        {
          id: "right",
          label: t("Nitrates or nitrites from the soil", "मिट्टी से नाइट्रेट या नाइट्राइट"),
        },
        {
          id: "air",
          label: t("Nitrogen gas straight from the air", "सीधे हवा से नाइट्रोजन गैस"),
          feedback: t(
            "Plants can't use nitrogen gas directly. They take it as nitrates or nitrites, or as compounds bacteria made from the air's nitrogen.",
            "पौधे नाइट्रोजन गैस का सीधे उपयोग नहीं कर सकते। वे उसे नाइट्रेट या नाइट्राइट के रूप में लेते हैं, या उन यौगिकों के रूप में जो जीवाणुओं ने हवा की नाइट्रोजन से बनाए।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Raw materials from the soil", "मिट्टी से कच्चा माल")),
      w.body(
        t(
          "Photosynthesis gives a plant energy, but it also needs material to build its body. In land plants, the **water** for photosynthesis is taken up from the soil by the **roots**. So are other materials such as **nitrogen, phosphorus, iron and magnesium**.",
          "प्रकाश संश्लेषण पौधे को ऊर्जा देता है, पर उसे शरीर बनाने के लिए सामग्री भी चाहिए। स्थलीय पौधों में प्रकाश संश्लेषण के लिए **पानी** मिट्टी से **जड़ें** लेती हैं। दूसरे पदार्थ भी, जैसे **नाइट्रोजन, फ़ॉस्फ़ोरस, लोहा और मैग्नीशियम**।",
        ),
      ),
      w.body(
        t(
          "Nitrogen is essential for making proteins and other compounds. It is taken up as inorganic **nitrates** or **nitrites**, or as organic compounds that **bacteria** have made from the nitrogen in the air.",
          "प्रोटीन और दूसरे यौगिक बनाने के लिए नाइट्रोजन ज़रूरी है। इसे अकार्बनिक **नाइट्रेट** या **नाइट्राइट** के रूप में लिया जाता है, या उन कार्बनिक यौगिकों के रूप में जो **जीवाणुओं** ने हवा की नाइट्रोजन से बनाए हैं।",
        ),
      ),
      nitrogen,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** Grandpa's plant explained, and where Kabir's parathas came from. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const plant = b.prop(lifeSceneDef, "plant", { scene: LifeScene.MoneyPlant });
    b.standsFor(plant, "Grandpa's money plant in the morning sun");
    const from = choiceQuestion(b, {
      name: "from",
      prompt: t(
        "So where did the material of Grandpa's money plant mostly come from?",
        "तो दादाजी के मनी प्लांट की सामग्री ज़्यादातर कहाँ से आई?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Carbon dioxide from the air and water from the soil, joined using sunlight",
            "हवा की कार्बन डाइऑक्साइड और मिट्टी का पानी, सूर्य के प्रकाश से जोड़े गए",
          ),
        },
        {
          id: "soil",
          label: t("It ate the soil in the pot", "उसने गमले की मिट्टी खा ली"),
          feedback: t(
            "From the soil it takes water and small amounts of minerals. The carbon in its body came from carbon dioxide in the air, through photosynthesis.",
            "मिट्टी से वह पानी और थोड़े खनिज लेता है। उसके शरीर का कार्बन हवा की कार्बन डाइऑक्साइड से, प्रकाश संश्लेषण के ज़रिए आया।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const paratha = choiceQuestion(b, {
      name: "paratha",
      prompt: t(
        "Kabir's parathas are made of wheat flour. Is Kabir an autotroph or a heterotroph, and who made his food in the first place?",
        "कबीर के पराठे गेहूँ के आटे से बने हैं। कबीर स्वपोषी है या विषमपोषी, और उसका भोजन असल में किसने बनाया?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "A heterotroph; the wheat plant made the starch by photosynthesis",
            "विषमपोषी; गेहूँ के पौधे ने प्रकाश संश्लेषण से मंड बनाया",
          ),
        },
        {
          id: "mom",
          label: t("An autotroph; Mom made the food", "स्वपोषी; मम्मी ने भोजन बनाया"),
          feedback: t(
            "Mom cooked it, but the starch in the flour was made by the wheat plant from carbon dioxide and water. Kabir eats food made by others: a heterotroph.",
            "मम्मी ने पकाया, पर आटे का मंड गेहूँ के पौधे ने कार्बन डाइऑक्साइड और पानी से बनाया। कबीर दूसरों का बनाया भोजन खाता है: विषमपोषी।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const stop = w.definition(
      t(
        "**Stop 2 done.** Plants are autotrophs: with sunlight and chlorophyll, they turn carbon dioxide and water into carbohydrates, and store the extra as starch. Every runner's energy starts there. Next stop: the organisms that can't make food, and the clever ways they get it.",
        "**पड़ाव 2 पूरा।** पौधे स्वपोषी हैं: सूर्य के प्रकाश और क्लोरोफ़िल से वे कार्बन डाइऑक्साइड और पानी को कार्बोहाइड्रेट में बदलते हैं, और अतिरिक्त को मंड के रूप में जमा करते हैं। हर धावक की ऊर्जा वहीं से शुरू होती है। अगला पड़ाव: वे जीव जो भोजन नहीं बना सकते, और उसे पाने के उनके चतुर तरीक़े।",
      ),
      "stop",
      { isHidden: true },
    );
    b.when(from.on(QuestionSignal.Correct), theBoard.show(paratha));
    b.when(paratha.on(QuestionSignal.Correct), [theBoard.show(stop), theBoard.pass()]);
    return column([
      w.title(t("Back on the terrace", "फिर छत पर")),
      plant,
      from,
      paratha,
      stop,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** NCERT 6.2 in-text Q1–2 and Exercises 3 and 7. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const needs = choiceQuestion(b, {
      name: "needs",
      prompt: t("The autotrophic mode of nutrition requires…", "स्वपोषी पोषण के लिए क्या चाहिए…"),
      options: [
        { id: "right", label: t("All of these", "ये सभी") },
        {
          id: "co2",
          label: t("Carbon dioxide and water", "कार्बन डाइऑक्साइड और पानी"),
          feedback: t(
            "Needed, but so are chlorophyll and sunlight.",
            "ज़रूरी हैं, पर क्लोरोफ़िल और सूर्य का प्रकाश भी।",
          ),
        },
        {
          id: "chl",
          label: t("Chlorophyll", "क्लोरोफ़िल"),
          feedback: t(
            "Needed, but so are carbon dioxide, water and sunlight.",
            "ज़रूरी है, पर कार्बन डाइऑक्साइड, पानी और सूर्य का प्रकाश भी।",
          ),
        },
        {
          id: "sun",
          label: t("Sunlight", "सूर्य का प्रकाश"),
          feedback: t(
            "Needed, but so are carbon dioxide, water and chlorophyll.",
            "ज़रूरी है, पर कार्बन डाइऑक्साइड, पानी और क्लोरोफ़िल भी।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const byProduct = choiceQuestion(b, {
      name: "byProduct",
      prompt: t(
        "What is the main by-product of photosynthesis, given out into the air?",
        "प्रकाश संश्लेषण का मुख्य उपोत्पाद क्या है, जो हवा में छोड़ा जाता है?",
      ),
      options: [
        { id: "right", label: t("Oxygen", "ऑक्सीजन") },
        {
          id: "co2",
          label: t("Carbon dioxide", "कार्बन डाइऑक्साइड"),
          feedback: t(
            "Carbon dioxide is taken *in*. Oxygen, from the split water, is given out.",
            "कार्बन डाइऑक्साइड *अंदर* ली जाती है। टूटे पानी से बनी ऑक्सीजन बाहर निकलती है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const raw = choiceQuestion(b, {
      name: "raw",
      prompt: t(
        "Where does a land plant get each raw material for photosynthesis?",
        "स्थलीय पौधा प्रकाश संश्लेषण का हर कच्चा माल कहाँ से लेता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Carbon dioxide from the air through stomata; water from the soil through roots; light from the Sun",
            "कार्बन डाइऑक्साइड हवा से रंध्रों द्वारा; पानी मिट्टी से जड़ों द्वारा; प्रकाश सूर्य से",
          ),
        },
        {
          id: "swap",
          label: t(
            "Carbon dioxide from the soil through roots; water from the air through stomata",
            "कार्बन डाइऑक्साइड मिट्टी से जड़ों द्वारा; पानी हवा से रंध्रों द्वारा",
          ),
          feedback: t(
            "Swapped round: the gas comes in through the stomata, and water comes up from the soil through the roots.",
            "उलटा हो गया: गैस रंध्रों से आती है, और पानी मिट्टी से जड़ों द्वारा ऊपर आता है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ Autotrophs make food; heterotrophs, like Kabir, eat it. ✓ Photosynthesis needs carbon dioxide, water, sunlight and chlorophyll, and gives out oxygen. ✓ Carbon dioxide comes in through stomata, opened and closed by guard cells. ✓ Spare food is stored as starch (glycogen in us). Next: how heterotrophs get their food.",
        "**मिशन लॉग।** ✓ स्वपोषी भोजन बनाते हैं; कबीर जैसे विषमपोषी उसे खाते हैं। ✓ प्रकाश संश्लेषण को कार्बन डाइऑक्साइड, पानी, सूर्य का प्रकाश और क्लोरोफ़िल चाहिए, और यह ऑक्सीजन छोड़ता है। ✓ कार्बन डाइऑक्साइड रंध्रों से आती है, जिन्हें द्वार कोशिकाएँ खोलती-बंद करती हैं। ✓ अतिरिक्त भोजन मंड के रूप में जमा होता है (हममें ग्लाइकोजन)। आगे: विषमपोषी अपना भोजन कैसे पाते हैं।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(raw.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), needs, byProduct, raw, log, space()]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [
  hook,
  kinds,
  equation,
  chlorophyll,
  stomata,
  carbonDioxide,
  soil,
  inLife,
  yourTurn,
];

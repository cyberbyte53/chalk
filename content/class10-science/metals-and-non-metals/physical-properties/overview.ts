import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, multiChoiceQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import { MetalSceneKind, PropertySample, PropertyTest, sceneOn, testerOn } from "../kit";

const METALS = [
  PropertySample.Iron,
  PropertySample.Copper,
  PropertySample.Aluminium,
  PropertySample.Magnesium,
  PropertySample.Sodium,
  PropertySample.Zinc,
  PropertySample.Lead,
  PropertySample.Gold,
] as const;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** Who, where, what: the man at the door who offers to make the old bangles shine. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const door = sceneOn(
    b,
    "door",
    MetalSceneKind.GoldsmithAtDoor,
    "a man at the front door holding up a gold bangle and a bowl of liquid; Mom and Kabir watching from inside",
  );
  return column([
    w.title(t("The man at the door", "दरवाज़े पर आदमी")),
    door,
    w.body(
      t(
        "It's a Sunday afternoon, a few weeks after Diwali. Riya (Class 10), her little brother Kabir, Mom and Grandpa are at home when the bell rings. A man with a small bag says he is a **goldsmith**: he goes door to door and makes old, dull gold ornaments shine like new.",
        "दिवाली के कुछ हफ़्ते बाद का एक रविवार दोपहर। रिया (दसवीं), उसका छोटा भाई कबीर, मम्मी और दादाजी घर पर हैं, तभी घंटी बजती है। एक छोटा थैला लिए आदमी कहता है कि वह **सुनार** है: घर-घर जाकर पुराने, फीके सोने के गहनों को नए जैसा चमका देता है।",
      ),
    ),
    w.body(
      t(
        "Mom brings out a pair of gold bangles that were Grandma's. They have gone dull over the years. The man dips them in a liquid from his bag, and in a minute they sparkle like new. He takes his fee and leaves in a hurry.",
        "मम्मी दादी की सोने की दो चूड़ियाँ ले आती हैं। सालों में वे फीकी पड़ गई हैं। आदमी अपने थैले से एक द्रव में उन्हें डुबोता है, और एक मिनट में वे नई जैसी चमकने लगती हैं। वह अपनी फ़ीस लेता है और जल्दी में चला जाता है।",
      ),
    ),
    space(),
  ]);
});

/** The kitchen scale: the bangles weigh less. The case file, and the stops. */
const caseFile = page("case", (b) => {
  const w = wordsOn(b);
  const scale = sceneOn(
    b,
    "scale",
    MetalSceneKind.LighterBangles,
    "the shining bangles on the kitchen scale reading 41 g, next to an old receipt that says 48 g, and Riya pointing at the receipt",
  );
  return column([
    w.title(t("Seven grams are missing", "सात ग्राम ग़ायब हैं")),
    scale,
    w.body(
      t(
        "That evening Riya puts the shining bangles on the kitchen scale: **41 g**. Grandma's old receipt from the jeweller says **48 g**. Seven grams of gold have gone, and the man has gone with them.",
        "उस शाम रिया चमकती चूड़ियों को रसोई के तराज़ू पर रखती है: **41 g**। सुनार की दादी वाली पुरानी रसीद कहती है **48 g**। सात ग्राम सोना चला गया, और उसके साथ वह आदमी भी।",
      ),
    ),
    w.body(
      t(
        'Kabir: **"He must have scraped it off."** Riya: "There isn\'t a scratch on them." Grandpa: **"Then the liquid did it. Find out what liquid can eat gold, and you\'ll know what he did."**',
        'कबीर: **"उसने खुरचकर निकाल लिया होगा।"** रिया: "इन पर एक खरोंच तक नहीं है।" दादाजी: **"तो वह द्रव ने किया। पता करो कौन-सा द्रव सोने को खा सकता है, फिर पता चल जाएगा कि उसने क्या किया।"**',
      ),
    ),
    w.body(
      t(
        "That's the mission for this chapter: solve the case of the shrinking bangles. To do it, you have to understand metals: what they are, how they react, where they come from, and why some never tarnish.",
        "यही इस अध्याय का मिशन है: सिकुड़ती चूड़ियों का मामला सुलझाना। इसके लिए धातुओं को समझना होगा: वे क्या हैं, कैसे अभिक्रिया करती हैं, कहाँ से आती हैं, और कुछ कभी फीकी क्यों नहीं पड़तीं।",
      ),
    ),
    w.definition(
      t(
        "**The clues on the way.** (1) What makes something a metal: *this lesson*. (2) Metals and oxygen: why gold never tarnishes. (3) Metals with water and acids: which liquid can eat gold. (4) The reactivity series: who beats whom. (5) How metals react with non-metals. (6) What those compounds are like. (7) Getting metals out of the ground. (8) The most reactive metals, and purifying metals. (9) Corrosion and alloys, and the case closed.",
        "**रास्ते के सुराग।** (1) कोई चीज़ धातु क्यों है: *यह पाठ*। (2) धातुएँ और ऑक्सीजन: सोना कभी फीका क्यों नहीं पड़ता। (3) धातुएँ, जल और अम्ल: कौन-सा द्रव सोने को खा सकता है। (4) सक्रियता श्रेणी: कौन किसको हराता है। (5) धातुएँ अधातुओं से कैसे अभिक्रिया करती हैं। (6) वे यौगिक कैसे होते हैं। (7) धरती से धातुएँ निकालना। (8) सबसे क्रियाशील धातुएँ, और धातुओं का शुद्धीकरण। (9) संक्षारण और मिश्रातु, और मामला बंद।",
      ),
    ),
    w.body(
      t(
        "First clue, from the very beginning: what exactly makes gold a **metal**?",
        "पहला सुराग, बिल्कुल शुरू से: सोना ठीक-ठीक **धातु** क्यों है?",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Class 9 recap: element, metal, non-metal. */
const elements = page(
  "elements",
  (b) => {
    const w = wordsOn(b);
    const which = choiceQuestion(b, {
      name: "which",
      prompt: t("Which of these is an element?", "इनमें से कौन-सा तत्व है?"),
      options: [
        { id: "right", label: t("Copper", "ताँबा") },
        {
          id: "brass",
          label: t("Brass", "पीतल"),
          feedback: t(
            "Brass is copper and zinc mixed together, so it is made of two elements.",
            "पीतल ताँबे और जस्ते का मिश्रण है, इसलिए यह दो तत्वों से बना है।",
          ),
        },
        {
          id: "salt",
          label: t("Common salt", "साधारण नमक"),
          feedback: t(
            "Salt is a compound of sodium and chlorine: two elements joined together.",
            "नमक सोडियम और क्लोरीन का यौगिक है: दो तत्व आपस में जुड़े हुए।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Elements: metals and non-metals", "तत्व: धातु और अधातु")),
      w.definition(
        t(
          "**Element.** From Class 9: an **element** is a substance made of only one kind of atom. It cannot be broken into anything simpler by chemical reactions. Iron, gold, oxygen, carbon and sulphur are elements.",
          "**तत्व।** कक्षा 9 से: **तत्व** वह पदार्थ है जो केवल एक प्रकार के परमाणुओं से बना है। रासायनिक अभिक्रियाओं से इसे किसी सरल चीज़ में नहीं तोड़ा जा सकता। लोहा, सोना, ऑक्सीजन, कार्बन और सल्फ़र तत्व हैं।",
        ),
      ),
      w.definition(
        t(
          "**Metals and non-metals.** Most elements are **metals**: iron, copper, aluminium, gold, silver, sodium. A much smaller group are **non-metals**: carbon, sulphur, iodine, oxygen, hydrogen. This chapter is about how to tell the two groups apart, and why they behave so differently.",
          "**धातु और अधातु।** अधिकतर तत्व **धातु** हैं: लोहा, ताँबा, ऐलुमिनियम, सोना, चाँदी, सोडियम। एक बहुत छोटा समूह **अधातुओं** का है: कार्बन, सल्फ़र, आयोडीन, ऑक्सीजन, हाइड्रोजन। यह अध्याय इसी बारे में है कि इन दोनों समूहों को कैसे पहचानें, और वे इतना अलग व्यवहार क्यों करते हैं।",
        ),
      ),
      w.body(
        t(
          "Start with what you can see and feel without any reaction: the **physical properties**, such as how a thing looks, how hard it is, and what a hammer does to it.",
          "उससे शुरू करो जो बिना किसी अभिक्रिया के देखा और महसूस किया जा सकता है: **भौतिक गुण**, जैसे कोई चीज़ कैसी दिखती है, कितनी कठोर है, और हथौड़ा उसके साथ क्या करता है।",
        ),
      ),
      which,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Activities 3.1–3.4: lustre, hardness, malleability, ductility. */
const shape = page(
  "shape",
  (b) => {
    const w = wordsOn(b);
    const bench = testerOn(b, "bench", {
      samples: METALS,
      tests: [
        PropertyTest.Lustre,
        PropertyTest.Hardness,
        PropertyTest.Malleability,
        PropertyTest.Ductility,
      ],
    });
    b.standsFor(
      bench,
      "a bench with samples of eight metals; the learner picks one and rubs it with sandpaper, cuts it with a knife, hammers it, or draws it into wire, and each result is written into a table",
    );
    const sodium = choiceQuestion(b, {
      name: "sodium",
      prompt: t("Try the knife on sodium. What happens?", "सोडियम पर चाकू आज़माओ। क्या होता है?"),
      options: [
        {
          id: "right",
          label: t("It cuts easily: sodium is soft", "आसानी से कट जाता है: सोडियम नरम है"),
        },
        {
          id: "hard",
          label: t("The knife only scratches it", "चाकू केवल खरोंच बनाता है"),
          feedback: t(
            "That's iron or copper. Try sodium: it's one of the exceptions.",
            "वह लोहा या ताँबा है। सोडियम आज़माओ: यह अपवादों में से एक है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Shine, hardness, and a hammer", "चमक, कठोरता, और एक हथौड़ा")),
      w.body(
        t(
          "NCERT Activities 3.1 to 3.4. Pick a metal and a test, and press **Try it**. The table fills in as you go.",
          "NCERT क्रियाकलाप 3.1 से 3.4। एक धातु और एक परीक्षण चुनो, और **करके देखो** दबाओ। जैसे-जैसे करते हो, तालिका भरती जाती है।",
        ),
      ),
      bench,
      w.definition(
        t(
          "**Metallic lustre.** Metals in their pure state have a **shining surface**. A dull metal shines again once its surface is rubbed clean with sandpaper. This shine is **metallic lustre**.",
          "**धात्विक चमक।** शुद्ध अवस्था में धातुओं की सतह **चमकीली** होती है। फीकी धातु रेगमाल से सतह साफ़ करने पर फिर चमकने लगती है। यह चमक **धात्विक चमक** है।",
        ),
      ),
      w.definition(
        t(
          "**Hardness.** Metals are generally **hard**, but the hardness varies from metal to metal. Sodium is so soft it cuts with a knife.",
          "**कठोरता।** धातुएँ सामान्यतः **कठोर** होती हैं, पर कठोरता अलग-अलग धातु में अलग होती है। सोडियम इतना नरम है कि चाकू से कट जाता है।",
        ),
      ),
      w.definition(
        t(
          "**Malleable and ductile.** A metal that can be beaten into thin sheets is **malleable**: gold and silver are the most malleable. A metal that can be drawn into thin wires is **ductile**: gold is the most ductile. About **2 km** of wire can be drawn from **1 g** of gold. Because metals are malleable and ductile, they can be shaped into whatever we need.",
          "**आघातवर्ध्य और तन्य।** जिस धातु को पीटकर पतली चादरें बनाई जा सकें, वह **आघातवर्ध्य** है: सोना और चाँदी सबसे अधिक आघातवर्ध्य हैं। जिस धातु को खींचकर पतले तार बनाए जा सकें, वह **तन्य** है: सोना सबसे अधिक तन्य है। **1 g** सोने से लगभग **2 km** लंबा तार खींचा जा सकता है। धातुएँ आघातवर्ध्य और तन्य हैं, इसलिए उन्हें मनचाहा आकार दिया जा सकता है।",
        ),
      ),
      sodium,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Activities 3.5–3.6 and sonority: heat, electricity, sound. */
const conduct = page(
  "conduct",
  (b) => {
    const w = wordsOn(b);
    const bench = testerOn(b, "bench", {
      samples: METALS,
      tests: [PropertyTest.Heat, PropertyTest.Electricity, PropertyTest.Sonority],
    });
    b.standsFor(
      bench,
      "the same metals; now the tests are heating a wire with a pin stuck on with wax, putting the metal in a circuit with a bulb, and striking it on a hard floor",
    );
    const wires = choiceQuestion(b, {
      name: "wires",
      prompt: t(
        "The wires that carry electricity in your home are coated with PVC or rubber. Why?",
        "तुम्हारे घर में बिजली ले जाने वाले तारों पर PVC या रबर की परत होती है। क्यों?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "The metal inside conducts electricity; the coating doesn't, so touching it is safe",
            "अंदर की धातु विद्युत की चालक है; परत नहीं, इसलिए उसे छूना सुरक्षित है",
          ),
        },
        {
          id: "rust",
          label: t("Only to stop the wire rusting", "केवल तार को ज़ंग से बचाने के लिए"),
          feedback: t(
            "The main reason is safety: metal conducts electricity, so a bare wire would pass current into your hand.",
            "मुख्य कारण सुरक्षा है: धातु विद्युत की चालक है, इसलिए नंगा तार करंट तुम्हारे हाथ में भेज देगा।",
          ),
        },
        {
          id: "colour",
          label: t("To show which wire is which", "यह दिखाने के लिए कि कौन-सा तार कौन-सा है"),
          feedback: t(
            "Colours help, but any coating would do that. The coating is there because it doesn't conduct.",
            "रंग मदद करते हैं, पर यह कोई भी परत कर सकती है। परत इसलिए है क्योंकि वह चालक नहीं है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Heat, electricity and sound", "ऊष्मा, विद्युत और ध्वनि")),
      w.body(
        t(
          "NCERT Activities 3.5 and 3.6. Heat a wire near one end: does the wax at the other end melt and drop the pin? Put the metal in a circuit: does the bulb glow? And strike it on the floor: does it ring?",
          "NCERT क्रियाकलाप 3.5 और 3.6। एक तार को एक सिरे के पास गर्म करो: क्या दूसरे सिरे का मोम पिघलकर पिन गिरा देता है? धातु को परिपथ में लगाओ: क्या बल्ब जलता है? और उसे फ़र्श पर मारो: क्या वह बजती है?",
        ),
      ),
      bench,
      w.definition(
        t(
          "**Conductors of heat.** A material that lets heat pass through it is a **conductor of heat**. Metals are good conductors of heat and have high melting points: the wire passes the heat along but does not melt. The best are **silver and copper**; **lead and mercury** are comparatively poor. That's why cooking pans are made of metal.",
          "**ऊष्मा के चालक।** जो पदार्थ ऊष्मा को अपने में से गुज़रने दे, वह **ऊष्मा का चालक** है। धातुएँ ऊष्मा की अच्छी चालक हैं और उनके गलनांक ऊँचे होते हैं: तार ऊष्मा आगे भेजता है पर पिघलता नहीं। सबसे अच्छे चालक **चाँदी और ताँबा** हैं; **लेड और पारा** तुलना में ख़राब चालक हैं। इसीलिए खाना पकाने के बर्तन धातु के बनते हैं।",
        ),
      ),
      w.definition(
        t(
          "**Conductors of electricity, and sonority.** Metals let electricity pass through them: they are **good conductors of electricity**, so the bulb glows. Metals that make a ringing sound when struck on a hard surface are **sonorous**. That's why school bells are made of metal.",
          "**विद्युत के चालक, और ध्वानिकता।** धातुएँ विद्युत को गुज़रने देती हैं: वे **विद्युत की अच्छी चालक** हैं, इसलिए बल्ब जलता है। जो धातुएँ कठोर सतह पर मारने पर बजने की आवाज़ करें, वे **ध्वानिक** हैं। इसीलिए स्कूल की घंटियाँ धातु की बनती हैं।",
        ),
      ),
      wires,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Activity 3.7: the non-metals on the same bench, and Table 3.1. */
const nonMetals = page(
  "non-metals",
  (b) => {
    const w = wordsOn(b);
    const bench = testerOn(b, "bench", {
      samples: [
        PropertySample.Coal,
        PropertySample.Sulphur,
        PropertySample.Iodine,
        PropertySample.Iron,
        PropertySample.Copper,
      ],
      tests: [
        PropertyTest.Lustre,
        PropertyTest.Hardness,
        PropertyTest.Malleability,
        PropertyTest.Ductility,
        PropertyTest.Electricity,
      ],
    });
    b.standsFor(
      bench,
      "the bench with coal, sulphur and iodine beside iron and copper; the same tests build up a table like NCERT's Table 3.1",
    );
    const hammer = choiceQuestion(b, {
      name: "hammer",
      prompt: t(
        "Hammer a lump of sulphur. What happens?",
        "सल्फ़र की एक डली पर हथौड़ा मारो। क्या होता है?",
      ),
      options: [
        { id: "right", label: t("It breaks into powder", "चूरा हो जाती है") },
        {
          id: "sheet",
          label: t("It flattens into a sheet", "चपटी चादर बन जाती है"),
          feedback: t(
            "Flattening into a sheet is what malleable metals do. Sulphur is a non-metal: it's brittle.",
            "चादर बनना आघातवर्ध्य धातुओं का काम है। सल्फ़र अधातु है: वह भंगुर है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Now the non-metals", "अब अधातुएँ")),
      w.body(
        t(
          "NCERT Activity 3.7: do the same tests on **carbon** (coal), **sulphur** and **iodine**, and compare them with the metals in one table, like NCERT's Table 3.1.",
          "NCERT क्रियाकलाप 3.7: वही परीक्षण **कार्बन** (कोयला), **सल्फ़र** और **आयोडीन** पर करो, और उन्हें धातुओं के साथ एक तालिका में मिलाओ, NCERT की तालिका 3.1 की तरह।",
        ),
      ),
      bench,
      w.definition(
        t(
          "**Non-metals.** There are very few non-metals compared with metals: carbon, sulphur, iodine, oxygen and hydrogen are some. They are either **solids or gases**; the only liquid non-metal is **bromine**. In general they are not lustrous, not malleable, not ductile, and do not conduct heat or electricity. A solid non-metal that shatters when hammered is **brittle**.",
          "**अधातु।** धातुओं की तुलना में अधातु बहुत कम हैं: कार्बन, सल्फ़र, आयोडीन, ऑक्सीजन और हाइड्रोजन इनमें से कुछ हैं। वे या तो **ठोस या गैस** होते हैं; एकमात्र द्रव अधातु **ब्रोमीन** है। सामान्यतः वे न चमकीले होते हैं, न आघातवर्ध्य, न तन्य, और न ऊष्मा या विद्युत का चालन करते हैं। जो ठोस अधातु हथौड़ा मारने पर बिखर जाए, वह **भंगुर** है।",
        ),
      ),
      hammer,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The exceptions: why physical properties alone can't decide. */
const exceptions = page(
  "exceptions",
  (b) => {
    const w = wordsOn(b);
    const bench = testerOn(b, "bench", {
      samples: [
        PropertySample.Iodine,
        PropertySample.Graphite,
        PropertySample.Diamond,
        PropertySample.Sodium,
      ],
      tests: [PropertyTest.Lustre, PropertyTest.Hardness, PropertyTest.Electricity],
      showTable: false,
    });
    b.standsFor(
      bench,
      "the bench with only the tricky samples: iodine, graphite, diamond and sodium, and the tests for shine, hardness and electricity",
    );
    const odd = multiChoiceQuestion(b, {
      name: "odd",
      prompt: t(
        "Which of these break the usual pattern? Tick all that do.",
        "इनमें से कौन-से सामान्य नियम तोड़ते हैं? सभी पर निशान लगाओ।",
      ),
      options: [
        {
          id: "graphite",
          label: t("Graphite conducts electricity", "ग्रेफ़ाइट विद्युत का चालन करता है"),
        },
        { id: "iodine", label: t("Iodine is lustrous", "आयोडीन चमकीला है") },
        { id: "mercury", label: t("Mercury is a liquid", "पारा द्रव है") },
        {
          id: "copper",
          label: t("Copper conducts heat", "ताँबा ऊष्मा का चालन करता है"),
          feedback: t(
            "That's exactly what a metal is expected to do, so it isn't an exception.",
            "धातु से ठीक यही अपेक्षा है, इसलिए यह अपवाद नहीं है।",
          ),
        },
      ],
      answers: ["graphite", "iodine", "mercury"],
      missing: t("Right so far. One more breaks the pattern.", "अब तक सही। एक और नियम तोड़ता है।"),
    });
    return column([
      w.title(t("The exceptions", "अपवाद")),
      w.body(
        t(
          "Try the tricky samples. Physical properties alone can't sort every element, because there are exceptions:",
          "मुश्किल नमूने आज़माओ। केवल भौतिक गुणों से हर तत्व को नहीं छाँटा जा सकता, क्योंकि अपवाद हैं:",
        ),
      ),
      bench,
      w.definition(
        t(
          "**Exceptions.** (i) All metals except **mercury** are solids at room temperature. **Gallium** and **caesium** melt so easily that they melt on your palm. (ii) **Iodine** is a non-metal, but it is lustrous. (iii) Carbon is a non-metal that exists in different forms; each form is an **allotrope**. **Diamond** is the hardest natural substance, with a very high melting point. **Graphite** conducts electricity. (iv) The **alkali metals** (lithium, sodium, potassium) are so soft they can be cut with a knife, and have low densities and low melting points.",
          "**अपवाद।** (i) **पारे** को छोड़कर सभी धातुएँ कमरे के ताप पर ठोस हैं। **गैलियम** और **सीज़ियम** इतनी आसानी से पिघलते हैं कि हथेली पर पिघल जाते हैं। (ii) **आयोडीन** अधातु है, पर चमकीला है। (iii) कार्बन एक अधातु है जो अलग-अलग रूपों में पाया जाता है; हर रूप एक **अपररूप** है। **हीरा** सबसे कठोर प्राकृतिक पदार्थ है, जिसका गलनांक बहुत ऊँचा है। **ग्रेफ़ाइट** विद्युत का चालन करता है। (iv) **क्षार धातुएँ** (लीथियम, सोडियम, पोटैशियम) इतनी नरम हैं कि चाकू से कट जाती हैं, और उनका घनत्व और गलनांक कम है।",
        ),
      ),
      w.body(
        t(
          "So elements are sorted more clearly by their **chemical properties**: how they react. That's the next lesson.",
          "इसलिए तत्वों को उनके **रासायनिक गुणों** से अधिक साफ़ छाँटा जाता है: वे कैसे अभिक्रिया करते हैं। यह अगला पाठ है।",
        ),
      ),
      odd,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const scale = sceneOn(
      b,
      "scale",
      MetalSceneKind.LighterBangles,
      "the bangles on the kitchen scale, lighter than the receipt says",
    );
    const still = choiceQuestion(b, {
      name: "still",
      prompt: t(
        "Riya checks the bangles: they shine, they bend a little without cracking, and they ring when tapped. What do these tests tell her?",
        "रिया चूड़ियाँ जाँचती है: वे चमकती हैं, थोड़ा मुड़ती हैं पर टूटतीं नहीं, और ठोकने पर बजती हैं। ये परीक्षण उसे क्या बताते हैं?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "They are still a metal: lustrous, malleable and sonorous",
            "वे अब भी धातु हैं: चमकीली, आघातवर्ध्य और ध्वानिक",
          ),
        },
        {
          id: "pure",
          label: t("They are pure 24-carat gold", "वे शुद्ध 24 कैरेट सोना हैं"),
          feedback: t(
            "These tests say metal or not, not which metal or how pure. That needs later clues.",
            "ये परीक्षण बताते हैं कि धातु है या नहीं, यह नहीं कि कौन-सी धातु या कितनी शुद्ध। उसके लिए आगे के सुराग चाहिए।",
          ),
        },
        {
          id: "fake",
          label: t("They have been swapped for plastic", "उन्हें प्लास्टिक से बदल दिया गया है"),
          feedback: t(
            "Plastic doesn't shine like this or ring when tapped. They are still metal.",
            "प्लास्टिक ऐसे नहीं चमकता और ठोकने पर नहीं बजता। वे अब भी धातु हैं।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const tools = choiceQuestion(b, {
      name: "tools",
      prompt: t(
        "Kabir has a hammer, a battery, a bulb, wires and a switch. Which test would tell a metal from a non-metal most reliably?",
        "कबीर के पास एक हथौड़ा, एक बैटरी, एक बल्ब, तार और एक स्विच है। कौन-सा परीक्षण धातु और अधातु को सबसे भरोसे से अलग करेगा?",
      ),
      options: [
        {
          id: "right",
          label: t("The hammer and the bulb together", "हथौड़ा और बल्ब दोनों साथ में"),
        },
        {
          id: "hammer",
          label: t("The hammer alone, every time", "हर बार अकेला हथौड़ा"),
          feedback: t(
            "Hammering helps, but one test alone can mislead. A second check, the circuit, makes the answer far more reliable.",
            "हथौड़ा मदद करता है, पर अकेला एक परीक्षण धोखा दे सकता है। दूसरी जाँच, परिपथ, उत्तर को कहीं ज़्यादा भरोसेमंद बनाती है।",
          ),
        },
        {
          id: "bulb",
          label: t("The bulb alone, every time", "हर बार अकेला बल्ब"),
          feedback: t(
            "Graphite is a non-metal that lights the bulb, so the bulb alone can be fooled.",
            "ग्रेफ़ाइट एक अधातु है जो बल्ब जला देता है, इसलिए अकेले बल्ब से धोखा हो सकता है।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const notes = w.definition(
      t(
        "**Case notes.** ✓ The bangles still behave like a metal. ✓ Gold is the most malleable and ductile metal, so a thin layer could be lost without the shape changing. ? Seven grams went, with no scratches. Physical tests can't explain it: next we need to see how metals **react**.",
        "**केस नोट्स।** ✓ चूड़ियाँ अब भी धातु की तरह व्यवहार करती हैं। ✓ सोना सबसे अधिक आघातवर्ध्य और तन्य धातु है, इसलिए आकार बदले बिना एक पतली परत जा सकती है। ? सात ग्राम गया, बिना किसी खरोंच के। भौतिक परीक्षण इसे नहीं समझा सकते: आगे देखना होगा कि धातुएँ **अभिक्रिया** कैसे करती हैं।",
      ),
      "notes",
      { isHidden: true },
    );
    b.when(still.on(QuestionSignal.Correct), theBoard.show(tools));
    b.when(tools.on(QuestionSignal.Correct), [theBoard.show(notes), theBoard.pass()]);
    return column([w.title(t("Still gold?", "अब भी सोना?")), scale, still, tools, notes, space()]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** NCERT in-text questions, p. 40. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const liquid = choiceQuestion(b, {
      name: "liquid",
      prompt: t(
        "Give an example of a metal which is a liquid at room temperature.",
        "ऐसी धातु का उदाहरण दो जो कमरे के ताप पर द्रव है।",
      ),
      options: [
        { id: "right", label: t("Mercury", "पारा") },
        {
          id: "bromine",
          label: t("Bromine", "ब्रोमीन"),
          feedback: t("Bromine is a liquid, but it is a non-metal.", "ब्रोमीन द्रव है, पर यह अधातु है।"),
        },
        {
          id: "gallium",
          label: t("Gallium", "गैलियम"),
          feedback: t(
            "Gallium melts on your palm, but at room temperature it is a solid.",
            "गैलियम हथेली पर पिघलता है, पर कमरे के ताप पर ठोस है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const heat = choiceQuestion(b, {
      name: "heat",
      prompt: t(
        "Which pair are the best conductors of heat, and which pair comparatively poor?",
        "कौन-सी जोड़ी ऊष्मा की सबसे अच्छी चालक है, और कौन-सी तुलना में ख़राब?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Best: silver and copper. Poor: lead and mercury",
            "सबसे अच्छी: चाँदी और ताँबा। ख़राब: लेड और पारा",
          ),
        },
        {
          id: "swap",
          label: t(
            "Best: lead and mercury. Poor: silver and copper",
            "सबसे अच्छी: लेड और पारा। ख़राब: चाँदी और ताँबा",
          ),
          feedback: t(
            "It's the other way round: silver and copper conduct heat best.",
            "उल्टा है: चाँदी और ताँबा ऊष्मा का सबसे अच्छा चालन करते हैं।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const meaning = choiceQuestion(b, {
      name: "meaning",
      prompt: t(
        "A metal is drawn out into a long thin wire. Which property is that?",
        "एक धातु को खींचकर लंबा पतला तार बनाया जाता है। यह कौन-सा गुण है?",
      ),
      options: [
        { id: "right", label: t("Ductility", "तन्यता") },
        {
          id: "malleable",
          label: t("Malleability", "आघातवर्धनीयता"),
          feedback: t(
            "Malleable means it can be beaten into thin sheets. Wires are ductility.",
            "आघातवर्ध्य का अर्थ है पीटकर पतली चादर बन सके। तार तन्यता है।",
          ),
        },
        {
          id: "sonorous",
          label: t("Sonority", "ध्वानिकता"),
          feedback: t("Sonority is about ringing when struck.", "ध्वानिकता मारने पर बजने के बारे में है।"),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const notes = w.definition(
      t(
        "**Case notes.** ✓ Metals: lustrous, generally hard, malleable, ductile, good conductors of heat and electricity, sonorous. ✓ Non-metals: mostly the opposite, with exceptions (graphite, iodine, diamond). Next clue: what happens when metals meet **oxygen**.",
        "**केस नोट्स।** ✓ धातुएँ: चमकीली, सामान्यतः कठोर, आघातवर्ध्य, तन्य, ऊष्मा और विद्युत की अच्छी चालक, ध्वानिक। ✓ अधातुएँ: अधिकतर उल्टी, अपवादों के साथ (ग्रेफ़ाइट, आयोडीन, हीरा)। अगला सुराग: जब धातुएँ **ऑक्सीजन** से मिलती हैं तो क्या होता है।",
      ),
      "notes",
      { isHidden: true },
    );
    b.when(liquid.on(QuestionSignal.Correct), theBoard.show(heat));
    b.when(heat.on(QuestionSignal.Correct), theBoard.show(meaning));
    b.when(meaning.on(QuestionSignal.Correct), [theBoard.show(notes), theBoard.pass()]);
    return column([
      w.title(t("Your turn", "अब तुम्हारी बारी")),
      liquid,
      heat,
      meaning,
      notes,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [
  hook,
  caseFile,
  elements,
  shape,
  conduct,
  nonMetals,
  exceptions,
  inLife,
  yourTurn,
];

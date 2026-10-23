import { PassOn, column, page, space, t } from "@chalk/author";
import { goalQuestion, wordsOn } from "@chalk/patterns";
import { CarbonScene, LabAction, LabDerived, LabKind } from "@chalk/prop-carbon";
import { ask, ce, ceOn, ceTwo, labOn, oneByOne, sceneOn } from "../kit";

/** A fruity smell for the soap. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const soap = sceneOn(
    b,
    "soap",
    CarbonScene.FruitySoap,
    "Riya sniffing a small test tube while Kabir holds up a bar of soap shaped like a fruit",
  );
  return column([
    w.title(t("A fruity smell", "फल जैसी खुशबू")),
    soap,
    w.body(
      t(
        "Last time: oil, not vanaspati, for the soap. Kabir wants the bars to **smell of fruit**. Riya finds that many fruity scents are made in factories from two everyday chemicals: the alcohol in hand sanitizer and the acid in vinegar.",
        "पिछली बार: साबुन के लिए तेल, वनस्पति नहीं। कबीर चाहता है कि साबुन की टिकियों से **फलों की खुशबू** आए। रिया पता करती है कि फलों जैसी कई खुशबुएँ कारख़ानों में दो आम रसायनों से बनती हैं: हैंड सैनिटाइज़र का ऐल्कोहॉल और सिरके का अम्ल।",
      ),
    ),
    w.body(
      t(
        "Stop 9: what are ethanol and ethanoic acid like, and what happens when they meet?",
        "पड़ाव 9: एथेनॉल और एथेनॉइक अम्ल कैसे हैं, और जब वे मिलते हैं तो क्या होता है?",
      ),
    ),
    space(),
  ]);
});

/** Ethanol: properties, uses, dangers. */
const ethanol = page(
  "ethanol",
  (b) => {
    const w = wordsOn(b);
    const q = ask(
      b,
      "q",
      ["Why is methanol so dangerous to drink?", "मेथेनॉल पीना इतना ख़तरनाक क्यों है?"],
      [
        "The liver turns it into methanal, which harms cells and can blind",
        "यकृत इसे मेथेनैल में बदलता है, जो कोशिकाओं को हानि पहुँचाता है और अंधा कर सकता है",
      ],
      [
        [
          "It evaporates too fast to be drunk safely",
          "यह इतनी तेज़ी से वाष्पित होता है कि सुरक्षित पिया न जा सके",
          "Evaporation isn't the problem. Read the health card: the danger is what the liver makes from it.",
          "वाष्पन समस्या नहीं है। स्वास्थ्य वाला कार्ड पढ़ो: ख़तरा उसमें है जो यकृत इससे बनाता है।",
        ],
        [
          "It is a strong acid",
          "यह प्रबल अम्ल है",
          "Methanol is an alcohol, not an acid. The danger is what the body turns it into.",
          "मेथेनॉल एक ऐल्कोहॉल है, अम्ल नहीं। ख़तरा उसमें है जो शरीर उसे बना देता है।",
        ],
      ],
      { passes: true },
    );
    return column([
      w.title(t("Ethanol", "एथेनॉल")),
      w.body(
        t(
          "Ethanol, C₂H₅OH, is a liquid at room temperature that dissolves in water in all proportions. It is commonly called **alcohol** and is the active part of alcoholic drinks. It is a good solvent, used in medicines such as tincture of iodine and cough syrups.",
          "एथेनॉल, C₂H₅OH, कमरे के ताप पर द्रव है जो जल में किसी भी अनुपात में घुलता है। इसे आम तौर पर **ऐल्कोहॉल** कहते हैं और यह मादक पेयों का सक्रिय भाग है। यह अच्छा विलायक है, टिंचर आयोडीन और कफ़ सिरप जैसी दवाओं में प्रयुक्त।",
        ),
      ),
      w.definition(
        t(
          "**Alcohol and health.** Even small amounts of dilute ethanol slow body processes and depress the nervous system: coordination is lost, judgement is impaired. Pure ethanol in large amounts can be lethal. **Methanol** is far worse: even small amounts cause death. In the liver it is oxidised to **methanal**, which reacts rapidly with the components of cells; methanol also affects the **optic nerve**, causing blindness. To stop industrial alcohol being drunk, it is made poisonous with methanol and coloured blue: **denatured alcohol**.",
          "**ऐल्कोहॉल और स्वास्थ्य।** तनु एथेनॉल की थोड़ी मात्रा भी शरीर की क्रियाओं को धीमा करती है और तंत्रिका तंत्र को दबाती है: तालमेल बिगड़ता है, निर्णय क्षमता घटती है। शुद्ध एथेनॉल अधिक मात्रा में जानलेवा हो सकता है। **मेथेनॉल** इससे बहुत बुरा है: थोड़ी-सी मात्रा भी मृत्यु का कारण बनती है। यकृत में यह **मेथेनैल** में ऑक्सीकृत होता है, जो कोशिकाओं के घटकों से तेज़ी से अभिक्रिया करता है; मेथेनॉल **दृष्टि तंत्रिका** को भी प्रभावित करता है, जिससे अंधापन होता है। औद्योगिक ऐल्कोहॉल को पीने से रोकने के लिए उसमें मेथेनॉल मिलाकर ज़हरीला और नीला किया जाता है: **विकृत ऐल्कोहॉल**।",
        ),
      ),
      w.note(
        t(
          "**Alcohol as a fuel.** Sugarcane converts sunlight into chemical energy; its molasses is fermented to ethanol. Ethanol burns in air to give only CO₂ and water, so some countries add it to petrol as a cleaner fuel.",
          "**ईंधन के रूप में ऐल्कोहॉल।** गन्ना सूर्य के प्रकाश को रासायनिक ऊर्जा में बदलता है; उसके शीरे से किण्वन करके एथेनॉल बनता है। एथेनॉल हवा में जलकर केवल CO₂ और जल देता है, इसलिए कुछ देश इसे स्वच्छ ईंधन के रूप में पेट्रोल में मिलाते हैं।",
        ),
      ),
      q,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Ethanol with sodium; dehydration. */
const reactions = page(
  "reactions",
  (b) => {
    const w = wordsOn(b);
    const na = labOn(b, "na", LabKind.Sodium);
    b.standsFor(
      na,
      "a small piece of sodium dropped into ethanol; it fizzes, and the gas pops near a flame",
    );
    const goal = goalQuestion(b, {
      about: na,
      prompt: t("Drop in the sodium and test the gas.", "सोडियम डालो और गैस जाँचो।"),
      isMet: na.derived(LabDerived.IsDone),
      solve: [na.learner(LabAction.Next), na.learner(LabAction.Next)],
    });
    return column([
      w.title(t("What ethanol does", "एथेनॉल क्या करता है")),
      w.body(
        t(
          "NCERT Activity 4.6 (teacher only). A small piece of sodium dropped into ethanol fizzes. The gas burns with a pop: **hydrogen**. The other product is sodium ethoxide:",
          "NCERT क्रियाकलाप 4.6 (केवल शिक्षक)। एथेनॉल में डाला सोडियम का छोटा टुकड़ा बुदबुदाता है। गैस 'पॉप' के साथ जलती है: **हाइड्रोजन**। दूसरा उत्पाद सोडियम एथॉक्साइड है:",
        ),
      ),
      w.body(ceTwo("2Na + 2CH3CH2OH", "2CH3CH2O^-Na^+ + H2")),
      na,
      goal,
      w.body(
        t(
          "Heated at 443 K with excess **concentrated sulphuric acid**, ethanol loses water and becomes ethene. The acid is a **dehydrating agent**: it removes water.",
          "443 K पर अधिक **सांद्र सल्फ़्यूरिक अम्ल** के साथ गर्म करने पर एथेनॉल जल खोकर एथीन बनता है। अम्ल **निर्जलीकारक** है: वह जल हटाता है।",
        ),
      ),
      w.body(
        ceOn("CH3-CH2OH", "CH2=CH2 + H2O", t("\\text{hot conc.} H2SO4", "\\text{गर्म सांद्र} H2SO4")),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Ethanoic acid: vinegar, glacial, weak acid. */
const acid = page(
  "acid",
  (b) => {
    const w = wordsOn(b);
    const lab = labOn(b, "lab", LabKind.AcidStrength);
    b.standsFor(
      lab,
      "dilute acetic acid and dilute hydrochloric acid side by side, each tested with litmus and universal indicator",
    );
    const goal = goalQuestion(b, {
      about: lab,
      prompt: t("Test both acids to the end.", "दोनों अम्ल अंत तक जाँचो।"),
      isMet: lab.derived(LabDerived.IsDone),
      solve: [lab.learner(LabAction.Next), lab.learner(LabAction.Next)],
    });
    return column([
      w.title(t("Ethanoic acid", "एथेनॉइक अम्ल")),
      w.body(
        t(
          "Ethanoic acid, CH₃COOH, is commonly called **acetic acid**. A 5–8% solution in water is **vinegar**, used to preserve pickles. Pure ethanoic acid melts at 290 K, so it often freezes in cold weather: that's why it is called **glacial acetic acid**.",
          "एथेनॉइक अम्ल, CH₃COOH, को आम तौर पर **ऐसीटिक अम्ल** कहते हैं। जल में इसका 5–8% घोल **सिरका** है, अचार को सुरक्षित रखने में प्रयुक्त। शुद्ध एथेनॉइक अम्ल 290 K पर पिघलता है, इसलिए ठंडे मौसम में अक्सर जम जाता है: इसीलिए इसे **ग्लेशियल ऐसीटिक अम्ल** कहते हैं।",
        ),
      ),
      w.body(
        t(
          "NCERT Activity 4.7. Compare dilute acetic acid with dilute hydrochloric acid using litmus and universal indicator.",
          "NCERT क्रियाकलाप 4.7। तनु ऐसीटिक अम्ल की तुलना तनु हाइड्रोक्लोरिक अम्ल से लिटमस और सार्वत्रिक सूचक से करो।",
        ),
      ),
      lab,
      goal,
      w.definition(
        t(
          "**Weak acid.** Both turn blue litmus red, but universal indicator shows acetic acid's pH is higher. Mineral acids like HCl are completely ionised in water; carboxylic acids are only partly ionised. They are **weak acids**.",
          "**दुर्बल अम्ल।** दोनों नीले लिटमस को लाल करते हैं, पर सार्वत्रिक सूचक दिखाता है कि ऐसीटिक अम्ल का pH अधिक है। HCl जैसे खनिज अम्ल जल में पूरी तरह आयनित होते हैं; कार्बोक्सिलिक अम्ल केवल आंशिक रूप से। वे **दुर्बल अम्ल** हैं।",
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Esterification and saponification. */
const ester = page(
  "ester",
  (b) => {
    const w = wordsOn(b);
    const lab = labOn(b, "lab", LabKind.Ester);
    b.standsFor(
      lab,
      "ethanol and glacial acetic acid with a few drops of concentrated sulphuric acid warmed in a water bath, then poured into water: a sweet, fruity smell",
    );
    const goal = goalQuestion(b, {
      about: lab,
      prompt: t(
        "Warm the mixture and pour it into water. Smell it.",
        "मिश्रण गर्म करो और पानी में डालो। सूँघो।",
      ),
      isMet: lab.derived(LabDerived.IsDone),
      solve: [
        lab.learner(LabAction.Next),
        lab.learner(LabAction.Next),
        lab.learner(LabAction.Next),
      ],
    });
    return column([
      w.title(t("Acid + alcohol: esters", "अम्ल + ऐल्कोहॉल: एस्टर")),
      w.body(
        t(
          "NCERT Activity 4.8. Warm 1 mL ethanol with 1 mL glacial acetic acid and a few drops of concentrated sulphuric acid for at least five minutes, then pour it into water.",
          "NCERT क्रियाकलाप 4.8। 1 mL एथेनॉल को 1 mL ग्लेशियल ऐसीटिक अम्ल और सांद्र सल्फ़्यूरिक अम्ल की कुछ बूँदों के साथ कम से कम पाँच मिनट गर्म करो, फिर पानी में डालो।",
        ),
      ),
      lab,
      goal,
      w.definition(
        t(
          "**Esterification.** A carboxylic acid and an alcohol react, with an acid catalyst, to give an **ester**: a sweet-smelling substance used in perfumes and flavourings:",
          "**एस्टरीकरण।** कार्बोक्सिलिक अम्ल और ऐल्कोहॉल, अम्ल उत्प्रेरक के साथ, अभिक्रिया करके **एस्टर** बनाते हैं: मीठी खुशबू वाला पदार्थ जो इत्र और स्वादकों में प्रयुक्त होता है:",
        ),
      ),
      w.body(ceTwo("CH3COOH + CH3CH2OH", "CH3COOCH2CH3 + H2O", t("acid", "\\text{अम्ल}"))),
      w.definition(
        t(
          "**Saponification.** An ester treated with an alkali, sodium hydroxide, gives back the alcohol and the **sodium salt of the acid**. With the right ester this reaction makes **soap**, which is why it's called saponification. A small ester shows how it works:",
          "**साबुनीकरण।** एस्टर को क्षार, सोडियम हाइड्रॉक्साइड, के साथ गर्म करने पर ऐल्कोहॉल और **अम्ल का सोडियम लवण** वापस मिलते हैं। सही एस्टर के साथ यही अभिक्रिया **साबुन** बनाती है, इसीलिए इसे साबुनीकरण कहते हैं। एक छोटा एस्टर दिखाता है कि यह कैसे होता है:",
        ),
      ),
      w.body(ceTwo("CH3COOC2H5 + NaOH", "C2H5OH + CH3COONa")),
      w.definition(
        t(
          "**Oils and fats are esters.** Cooking oil and animal fat are esters too, made from **long-chain** carboxylic acids (called **fatty acids**). Boil oil with sodium hydroxide and you get the **sodium salts of those long-chain acids**: that is **soap**. Sodium acetate, from the small ester above, has far too short a chain to clean.",
          "**तेल और वसा एस्टर हैं।** खाने का तेल और जंतु वसा भी एस्टर हैं, जो **लंबी शृंखला वाले** कार्बोक्सिलिक अम्लों (जिन्हें **वसा अम्ल** कहते हैं) से बने हैं। तेल को सोडियम हाइड्रॉक्साइड के साथ उबालो तो **उन लंबी शृंखला वाले अम्लों के सोडियम लवण** मिलते हैं: यही **साबुन** है। ऊपर के छोटे एस्टर से बने सोडियम ऐसीटेट की शृंखला सफ़ाई के लिए बहुत छोटी है।",
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** With bases and carbonates. */
const carbonate = page(
  "carbonate",
  (b) => {
    const w = wordsOn(b);
    const lab = labOn(b, "lab", LabKind.Carbonate);
    b.standsFor(
      lab,
      "ethanoic acid poured onto sodium carbonate; the gas is led through lime water, which turns milky",
    );
    const goal = goalQuestion(b, {
      about: lab,
      prompt: t(
        "Add the acid and pass the gas through lime water.",
        "अम्ल डालो और गैस को चूने के पानी से गुज़ारो।",
      ),
      isMet: lab.derived(LabDerived.IsDone),
      solve: [lab.learner(LabAction.Next), lab.learner(LabAction.Next)],
    });
    return column([
      w.title(t("With bases and carbonates", "क्षारकों और कार्बोनेटों के साथ")),
      w.body(
        t(
          "Like a mineral acid, ethanoic acid reacts with a base such as sodium hydroxide to give a salt, **sodium ethanoate** (sodium acetate), and water:",
          "खनिज अम्ल की तरह, एथेनॉइक अम्ल सोडियम हाइड्रॉक्साइड जैसे क्षारक के साथ अभिक्रिया करके लवण, **सोडियम एथेनोएट** (सोडियम ऐसीटेट), और जल देता है:",
        ),
      ),
      w.body(ce("NaOH + CH3COOH -> CH3COONa + H2O")),
      w.body(
        t(
          "NCERT Activity 4.9: with carbonates and hydrogencarbonates it gives a salt, water and **carbon dioxide**, which turns lime water milky:",
          "NCERT क्रियाकलाप 4.9: कार्बोनेटों और हाइड्रोजनकार्बोनेटों के साथ यह लवण, जल और **कार्बन डाइऑक्साइड** देता है, जो चूने के पानी को दूधिया करती है:",
        ),
      ),
      w.body(ceTwo("2CH3COOH + Na2CO3", "2CH3COONa + H2O + CO2")),
      w.body(ceTwo("CH3COOH + NaHCO3", "CH3COONa + H2O + CO2")),
      lab,
      goal,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Back to the scent; telling them apart. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const soap = sceneOn(
      b,
      "soap",
      CarbonScene.FruitySoap,
      "the fruit-shaped soap and the test tube again",
    );
    const q = ask(
      b,
      "q",
      [
        "Where does a fruity scent like Kabir wants come from?",
        "कबीर जैसी फल वाली खुशबू कहाँ से आती है?",
      ],
      ["An ester, made from an acid and an alcohol", "एक एस्टर, अम्ल और ऐल्कोहॉल से बना"],
      [
        [
          "Burning ethanol in plenty of air",
          "भरपूर हवा में एथेनॉल जलाना",
          "Burning gives CO₂ and water, no scent.",
          "जलने से CO₂ और जल मिलते हैं, खुशबू नहीं।",
        ],
        [
          "Ethanol reacting with a piece of sodium metal",
          "सोडियम धातु के टुकड़े से एथेनॉल की अभिक्रिया",
          "That gives hydrogen and sodium ethoxide.",
          "उससे हाइड्रोजन और सोडियम एथॉक्साइड मिलते हैं।",
        ],
      ],
    );
    const q2 = ask(
      b,
      "q2",
      [
        "NCERT Exercise: how would you tell an alcohol from a carboxylic acid by experiment?",
        "NCERT अभ्यास: प्रयोग से ऐल्कोहॉल और कार्बोक्सिलिक अम्ल में अंतर कैसे करोगे?",
      ],
      [
        "Add sodium hydrogencarbonate: only the acid fizzes",
        "सोडियम हाइड्रोजनकार्बोनेट डालो: केवल अम्ल में बुदबुदाहट होती है",
      ],
      [
        [
          "Smell both: only the acid smells of anything",
          "दोनों को सूँघो: केवल अम्ल में गंध होती है",
          "Smell isn't a reliable test. A carbonate gives a clear sign.",
          "गंध विश्वसनीय परीक्षण नहीं। कार्बोनेट साफ़ संकेत देता है।",
        ],
        [
          "Add sodium metal: only the acid gives off hydrogen",
          "सोडियम धातु डालो: केवल अम्ल हाइड्रोजन देता है",
          "Both give hydrogen with sodium, so it can't tell them apart.",
          "सोडियम के साथ दोनों हाइड्रोजन देते हैं, इसलिए अंतर नहीं बता सकता।",
        ],
      ],
      { isHidden: true },
    );
    const q3 = ask(
      b,
      "q3",
      ["And the soap itself: which reaction makes it?", "और ख़ुद साबुन: कौन-सी अभिक्रिया उसे बनाती है?"],
      [
        "Saponification: an ester heated with sodium hydroxide",
        "साबुनीकरण: सोडियम हाइड्रॉक्साइड के साथ गर्म किया एस्टर",
      ],
      [
        [
          "Esterification: an acid warmed with an alcohol",
          "एस्टरीकरण: अम्ल को ऐल्कोहॉल के साथ गर्म करना",
          "Esterification makes esters. Soap comes from breaking them with an alkali.",
          "एस्टरीकरण एस्टर बनाता है। साबुन उन्हें क्षार से तोड़ने पर बनता है।",
        ],
        [
          "Hydrogenation: oil with hydrogen and nickel",
          "हाइड्रोजनीकरण: निकेल के साथ तेल और हाइड्रोजन",
          "That turns oil into vanaspati, not soap.",
          "वह तेल को वनस्पति बनाता है, साबुन नहीं।",
        ],
      ],
      { isHidden: true },
    );
    const log = w.definition(
      t(
        "**Mission log.** ✓ Ethanol: solvent, fuel; sodium gives H₂; dehydration gives ethene. ✓ Ethanoic acid: a weak acid; with carbonates gives CO₂. ✓ Acid + alcohol → fruity ester (the scent). ✓ Ester + NaOH → soap (saponification). Next: why soap cleans, and fair day.",
        "**मिशन लॉग।** ✓ एथेनॉल: विलायक, ईंधन; सोडियम से H₂; निर्जलीकरण से एथीन। ✓ एथेनॉइक अम्ल: दुर्बल अम्ल; कार्बोनेटों से CO₂। ✓ अम्ल + ऐल्कोहॉल → फलों जैसा एस्टर (खुशबू)। ✓ एस्टर + NaOH → साबुन (साबुनीकरण)। आगे: साबुन साफ़ क्यों करता है, और मेले का दिन।",
      ),
      "log",
      { isHidden: true },
    );
    oneByOne(b, [q, q2, q3], [log]);
    return column([w.title(t("Scent and soap", "खुशबू और साबुन")), soap, q, q2, q3, log, space()]);
  },
  { passOn: PassOn.Rules },
);

const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const q1 = ask(
      b,
      "q1",
      [
        "Why is pure acetic acid called glacial acetic acid?",
        "शुद्ध ऐसीटिक अम्ल को ग्लेशियल ऐसीटिक अम्ल क्यों कहते हैं?",
      ],
      [
        "It freezes in cold weather (it melts at 290 K)",
        "यह ठंडे मौसम में जम जाता है (290 K पर पिघलता है)",
      ],
      [
        [
          "It comes from glaciers and must be kept cold",
          "यह हिमनदों से आता है और ठंडा रखना पड़ता है",
          "The name is about freezing like ice, not where it comes from.",
          "नाम बर्फ़ की तरह जमने के बारे में है, कहाँ से आता है उसके बारे में नहीं।",
        ],
        [
          "It is very strong, so it burns like ice",
          "यह बहुत तेज़ है, इसलिए बर्फ़ की तरह जलाता है",
          "It's a weak acid.",
          "यह दुर्बल अम्ल है।",
        ],
      ],
    );
    const q2 = ask(
      b,
      "q2",
      ["Why is dilute acetic acid called a weak acid?", "तनु ऐसीटिक अम्ल को दुर्बल अम्ल क्यों कहते हैं?"],
      ["It is only partly ionised in water", "यह जल में केवल आंशिक आयनित होता है"],
      [
        ["It is a gas", "यह गैस है", "It's a liquid.", "यह द्रव है।"],
        [
          "It does not turn blue litmus red at all",
          "वह नीले लिटमस को बिल्कुल लाल नहीं करता",
          "It does turn blue litmus red.",
          "यह नीले लिटमस को लाल करता है।",
        ],
      ],
      { isHidden: true },
    );
    const q3 = ask(
      b,
      "q3",
      ["What is denatured alcohol?", "विकृत ऐल्कोहॉल क्या है?"],
      [
        "Ethanol made poisonous with methanol and dyed blue",
        "मेथेनॉल से ज़हरीला बनाया और नीला रंगा एथेनॉल",
      ],
      [
        [
          "Pure ethanol, sold for drinking",
          "शुद्ध एथेनॉल, पीने के लिए बेचा जाने वाला",
          "Pure ethanol isn't marked or poisoned.",
          "शुद्ध एथेनॉल पर निशान या ज़हर नहीं होता।",
        ],
        [
          "Vinegar: dilute ethanoic acid coloured blue",
          "सिरका: नीला रंगा तनु एथेनॉइक अम्ल",
          "Vinegar is dilute ethanoic acid.",
          "सिरका तनु एथेनॉइक अम्ल है।",
        ],
      ],
      { isHidden: true },
    );
    oneByOne(b, [q1, q2, q3]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), q1, q2, q3, space()]);
  },
  { passOn: PassOn.Rules },
);

export const overview = [hook, ethanol, reactions, acid, ester, carbonate, inLife, yourTurn];

import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  BenchKind,
  ChemistrySceneKind,
  ElectrolysisAction,
  SwapAction,
  SwapKind,
  chemistrySceneDef,
  electrolysisCellDef,
  particleSwapDef,
} from "@chalk/prop-chemistry";
import { benchOn, equationOn } from "../kit";

const r = String.raw;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const wall = b.prop(chemistrySceneDef, "wall", { scene: ChemistrySceneKind.Whitewash });
  b.standsFor(wall, "the half-whitewashed wall and the bucket of lime");
  return column([
    w.title(t("Where does quick lime come from?", "बिना बुझा चूना कहाँ से आता है?")),
    wall,
    w.body(
      t(
        'Painting the last wall, Kabir asks where the quick lime came from. Grandpa remembers the lime kilns near his village: huge ovens where white **limestone** rock was heated for days until it crumbled into quick lime. Then he fetches his old album of black-and-white photographs. "These pictures were made by light breaking a chemical apart, too."',
        'आख़िरी दीवार रंगते हुए कबीर पूछता है कि बिना बुझा चूना कहाँ से आया। दादाजी को अपने गाँव के पास की चूने की भट्टियाँ याद आती हैं: बड़े-बड़े भट्टे जहाँ सफ़ेद **चूना-पत्थर** कई दिन गर्म किया जाता था, जब तक वह भुरभुराकर बिना बुझा चूना न बन जाए। फिर वे काली-सफ़ेद तस्वीरों वाला अपना पुराना एल्बम लाते हैं। "ये तस्वीरें भी प्रकाश द्वारा एक रसायन को तोड़ने से बनी थीं।"',
      ),
    ),
    w.body(
      t(
        "Stop 5: last lesson two substances became one. Can one substance be broken into several, and what does it take?",
        "पड़ाव 5: पिछले पाठ में दो पदार्थ एक बने। क्या एक पदार्थ कई में तोड़ा जा सकता है, और इसके लिए क्या चाहिए?",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Activity 1.5: heating ferrous sulphate. Decomposition defined; thermal decomposition. */
const heat = page(
  "heat",
  (b) => {
    const w = wordsOn(b);
    const tube = benchOn(b, "tube", BenchKind.FerrousSulphateHeat);
    b.standsFor(
      tube,
      "NCERT Activity 1.5: green ferrous sulphate crystals heated in a boiling tube turn reddish brown and give off fumes with a smell of burning sulphur",
    );
    const atoms = b.prop(particleSwapDef, "atoms", {
      kind: SwapKind.Decomposition,
      step: 0,
      canStep: true,
      showEquation: true,
      captions: [
        t("One CaCO₃ unit.", "एक CaCO₃ इकाई।"),
        t("Heat breaks it apart…", "ऊष्मा इसे तोड़ती है…"),
        t("…into CaO and CO₂: two simpler substances.", "…CaO और CO₂ में: दो सरल पदार्थ।"),
      ],
    });
    b.studentOnly(atoms.action(SwapAction.Next));
    b.standsFor(
      atoms,
      "calcium carbonate drawn as balls splitting into calcium oxide and carbon dioxide",
    );
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t("What makes this a decomposition reaction?", "इसे वियोजन अभिक्रिया क्या बनाता है?"),
      options: [
        {
          id: "right",
          label: t(
            "A single reactant breaks down into simpler products",
            "एक ही अभिकारक सरल उत्पादों में टूटता है",
          ),
        },
        {
          id: "heat",
          label: t("It is heated strongly in a burner", "उसे बर्नर में तेज़ गर्म किया जाता है"),
          feedback: t(
            "Heating is how it's done, not what it is. Count the reactants and products.",
            "गर्म करना तरीक़ा है, पहचान नहीं। अभिकारक और उत्पाद गिनो।",
          ),
        },
        {
          id: "gas",
          label: t("A gas is given off with a smell", "गंध के साथ एक गैस निकलती है"),
          feedback: t(
            "Many reactions give off gas. The key is one reactant giving several products.",
            "कई अभिक्रियाएँ गैस देती हैं। मुख्य बात है एक अभिकारक से कई उत्पाद।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("One substance breaks apart", "एक पदार्थ टूटता है")),
      w.body(
        t(
          "Activity 1.5. Heat about 2 g of green **ferrous sulphate** crystals in a dry boiling tube. Press start, and watch the colour.",
          "क्रियाकलाप 1.5। सूखी क्वथन नली में लगभग 2 g हरे **फ़ेरस सल्फ़ेट** क्रिस्टल गर्म करो। शुरू दबाओ, और रंग देखो।",
        ),
      ),
      tube,
      w.body(
        t(
          "The crystals first lose water, then break down into ferric oxide (a reddish-brown solid) and two gases, sulphur dioxide and sulphur trioxide:",
          "क्रिस्टल पहले पानी खोते हैं, फिर फ़ेरिक ऑक्साइड (लाल-भूरा ठोस) और दो गैसों, सल्फ़र डाइऑक्साइड और सल्फ़र ट्राइऑक्साइड, में टूट जाते हैं:",
        ),
      ),
      w.body(
        t(
          r`$$\ce{2FeSO4(s) ->[Heat] Fe2O3(s) + SO2(g) + SO3(g)}$$`,
          r`$$\ce{2FeSO4(s) ->[\text{ऊष्मा}] Fe2O3(s) + SO2(g) + SO3(g)}$$`,
        ),
      ),
      w.definition(
        t(
          "**Decomposition reaction.** A reaction in which a **single reactant breaks down** to give two or more simpler products is a **decomposition reaction**. It is the opposite of a combination. When it is done by heating, it is a **thermal decomposition**.",
          "**वियोजन अभिक्रिया।** वह अभिक्रिया जिसमें **एक ही अभिकारक टूटकर** दो या अधिक सरल उत्पाद देता है, **वियोजन अभिक्रिया** है। यह संयोजन की उलटी है। जब यह गर्म करके की जाए, तो **ऊष्मीय वियोजन** है।",
        ),
      ),
      w.body(
        t(
          "The lime kiln is a thermal decomposition. Limestone, calcium carbonate, gives quick lime and carbon dioxide; quick lime is also used to make cement:",
          "चूने की भट्टी ऊष्मीय वियोजन है। चूना-पत्थर, कैल्शियम कार्बोनेट, बिना बुझा चूना और कार्बन डाइऑक्साइड देता है; बिना बुझे चूने से सीमेंट भी बनता है:",
        ),
      ),
      w.body(
        t(
          r`$$\ce{CaCO3(s) ->[Heat] CaO(s) + CO2(g)}$$`,
          r`$$\ce{CaCO3(s) ->[\text{ऊष्मा}] CaO(s) + CO2(g)}$$`,
        ),
      ),
      atoms,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Activity 1.6: heating lead nitrate; brown fumes. */
const fumes = page(
  "fumes",
  (b) => {
    const w = wordsOn(b);
    const tube = benchOn(b, "tube", BenchKind.LeadNitrateHeat);
    b.standsFor(
      tube,
      "NCERT Activity 1.6: white lead nitrate powder heated in a boiling tube gives off brown fumes",
    );
    const lead = equationOn(b, "lead", "leadNitrateHeat", {
      balanced: true,
      showTally: true,
      showStates: true,
    });
    b.standsFor(
      lead,
      "2Pb(NO₃)₂(s) → 2PbO(s) + 4NO₂(g) + O₂(g) on heating, with the atom table balanced",
    );
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t("What are the brown fumes?", "भूरा धुआँ क्या है?"),
      options: [
        {
          id: "right",
          label: t(r`Nitrogen dioxide, $\ce{NO2}$`, r`नाइट्रोजन डाइऑक्साइड, $\ce{NO2}$`),
        },
        {
          id: "o2",
          label: t(r`Oxygen, $\ce{O2}$`, r`ऑक्सीजन, $\ce{O2}$`),
          feedback: t(
            "Oxygen is given off too, but it has no colour.",
            "ऑक्सीजन भी निकलती है, पर उसका कोई रंग नहीं।",
          ),
        },
        {
          id: "smoke",
          label: t("Smoke from the burning glass", "जलते काँच का धुआँ"),
          feedback: t(
            "Nothing is burning: the lead nitrate is breaking apart.",
            "कुछ जल नहीं रहा: लेड नाइट्रेट टूट रहा है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Brown fumes", "भूरा धुआँ")),
      w.body(
        t(
          "Activity 1.6. Heat about 2 g of **lead nitrate** powder in a boiling tube, held with tongs.",
          "क्रियाकलाप 1.6। चिमटे से पकड़ी क्वथन नली में लगभग 2 g **लेड नाइट्रेट** चूर्ण गर्म करो।",
        ),
      ),
      tube,
      w.body(t("Another thermal decomposition:", "एक और ऊष्मीय वियोजन:")),
      lead,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Activity 1.7: electrolysis of water; 2:1 volumes; the candle test. */
const electric = page(
  "electric",
  (b) => {
    const w = wordsOn(b);
    const cell = b.prop(electrolysisCellDef, "cell", {
      isOn: false,
      progress: 0,
      showGasNames: false,
      showElectrodes: true,
      showVolumes: true,
      tested: null,
      canSwitch: true,
      canTest: true,
    });
    b.studentOnly(cell.action(ElectrolysisAction.Switch));
    b.studentOnly(cell.action(ElectrolysisAction.TestGas));
    b.studentOnly(cell.action(ElectrolysisAction.Reset));
    b.standsFor(
      cell,
      "NCERT Activity 1.7: a mug of water with a few drops of acid, two carbon electrodes joined to a 6 V battery, a test tube of water upside down over each; switched on, bubbles fill one tube twice as fast as the other; a burning candle can be brought to each tube",
    );
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "Why does one tube collect twice as much gas as the other? Which gas is it?",
        "एक नली में दूसरी से दोगुनी गैस क्यों इकट्ठा होती है? वह कौन-सी गैस है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            r`Hydrogen: each $\ce{H2O}$ has two H atoms for one O`,
            r`हाइड्रोजन: हर $\ce{H2O}$ में एक O के लिए दो H परमाणु`,
          ),
        },
        {
          id: "oxygen",
          label: t(
            "Oxygen, because air has far more oxygen than hydrogen",
            "ऑक्सीजन, क्योंकि हवा में हाइड्रोजन से कहीं ज़्यादा ऑक्सीजन है",
          ),
          feedback: t(
            "The gas comes from the water, not the air. Count the atoms in H₂O.",
            "गैस पानी से आती है, हवा से नहीं। H₂O के परमाणु गिनो।",
          ),
        },
        {
          id: "battery",
          label: t(
            "Hydrogen, because that electrode is closer to the battery's terminal",
            "हाइड्रोजन, क्योंकि वह इलेक्ट्रोड बैटरी के टर्मिनल के पास है",
          ),
          feedback: t(
            "Distance doesn't matter. The 2 : 1 comes from the formula of water.",
            "दूरी मायने नहीं रखती। 2 : 1 पानी के सूत्र से आता है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Breaking water with electricity", "बिजली से पानी तोड़ना")),
      w.body(
        t(
          "Activity 1.7. Two carbon rods, called **electrodes**, stand in water with a few drops of dilute sulphuric acid, joined to a 6 volt battery. A test tube full of water is turned upside down over each. Switch on and watch both tubes. When they have filled, bring a burning candle to each one. (In a real lab, only the teacher does the candle test.)",
          "क्रियाकलाप 1.7। दो कार्बन छड़ें, जिन्हें **इलेक्ट्रोड** कहते हैं, तनु सल्फ़्यूरिक अम्ल की कुछ बूँदों वाले पानी में खड़ी हैं, 6 वोल्ट की बैटरी से जुड़ी। हर एक के ऊपर पानी से भरी परखनली उलटी रखी है। चालू करो और दोनों नलियाँ देखो। भर जाने पर हर एक के पास जलती मोमबत्ती लाओ। (असली प्रयोगशाला में मोमबत्ती वाली जाँच केवल शिक्षक करते हैं।)",
        ),
      ),
      cell,
      w.body(
        t(
          "Electricity breaks water into hydrogen and oxygen. Hydrogen burns with a pop; oxygen makes the candle burn brighter.",
          "बिजली पानी को हाइड्रोजन और ऑक्सीजन में तोड़ती है। हाइड्रोजन 'पॉप' की आवाज़ से जलती है; ऑक्सीजन मोमबत्ती को और तेज़ जलाती है।",
        ),
      ),
      w.body(
        t(
          r`$$\ce{2H2O(l) ->[Electricity] 2H2(g) + O2(g)}$$`,
          r`$$\ce{2H2O(l) ->[\text{विद्युत}] 2H2(g) + O2(g)}$$`,
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Activity 1.8: silver chloride in sunlight; photography. */
const light = page(
  "light",
  (b) => {
    const w = wordsOn(b);
    const dish = benchOn(b, "dish", BenchKind.SilverChlorideSun);
    b.standsFor(
      dish,
      "NCERT Activity 1.8: white silver chloride in a china dish in sunlight turns grey",
    );
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "What form of energy breaks down the silver chloride?",
        "सिल्वर क्लोराइड को कौन-सी ऊर्जा तोड़ती है?",
      ),
      options: [
        { id: "right", label: t("Sunlight", "धूप") },
        {
          id: "heat",
          label: t("Heat", "ऊष्मा"),
          feedback: t(
            "The dish isn't heated: keep it in the dark and nothing happens, even on a warm day.",
            "डिश गर्म नहीं की गई: इसे अँधेरे में रखो तो गर्म दिन में भी कुछ नहीं होता।",
          ),
        },
        {
          id: "electricity",
          label: t("Electricity", "विद्युत"),
          feedback: t(
            "No battery here: only sunlight falls on it.",
            "यहाँ कोई बैटरी नहीं: इस पर केवल धूप पड़ती है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Breaking apart with light", "प्रकाश से टूटना")),
      w.body(
        t(
          "Activity 1.8. Put about 2 g of white **silver chloride** in a china dish and leave it in sunlight.",
          "क्रियाकलाप 1.8। लगभग 2 g सफ़ेद **सिल्वर क्लोराइड** एक चीनी मिट्टी की डिश में रखकर धूप में छोड़ दो।",
        ),
      ),
      dish,
      w.body(
        t(
          "It turns grey: sunlight breaks it into grey silver metal and chlorine gas. Silver bromide does the same:",
          "यह स्लेटी हो जाता है: धूप इसे स्लेटी चाँदी धातु और क्लोरीन गैस में तोड़ देती है। सिल्वर ब्रोमाइड भी ऐसा ही करता है:",
        ),
      ),
      w.body(
        t(
          r`$$\ce{2AgCl(s) ->[Sunlight] 2Ag(s) + Cl2(g)}$$`,
          r`$$\ce{2AgCl(s) ->[\text{सूर्य का प्रकाश}] 2Ag(s) + Cl2(g)}$$`,
        ),
      ),
      w.body(
        t(
          r`$$\ce{2AgBr(s) ->[Sunlight] 2Ag(s) + Br2(g)}$$`,
          r`$$\ce{2AgBr(s) ->[\text{सूर्य का प्रकाश}] 2Ag(s) + Br2(g)}$$`,
        ),
      ),
      w.body(
        t(
          "These reactions are used in black-and-white photography: where light falls on the film, grains of silver form and darken it.",
          "ये अभिक्रियाएँ काली-सफ़ेद फ़ोटोग्राफ़ी में उपयोग होती हैं: फ़िल्म पर जहाँ प्रकाश पड़ता है, वहाँ चाँदी के कण बनकर उसे काला कर देते हैं।",
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Endothermic reactions: energy absorbed. The cold test tube. */
const endo = page(
  "endo",
  (b) => {
    const w = wordsOn(b);
    const cold = benchOn(b, "cold", BenchKind.BariumHydroxideCold, { showThermometer: true });
    b.standsFor(
      cold,
      "barium hydroxide mixed with ammonium chloride in a test tube; the thermometer falls and the tube turns cold",
    );
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "The test tube feels cold in your palm. Is the reaction exothermic or endothermic?",
        "परखनली हथेली में ठंडी लगती है। अभिक्रिया ऊष्माक्षेपी है या ऊष्माशोषी?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Endothermic: it takes heat from your hand",
            "ऊष्माशोषी: यह तुम्हारे हाथ से ऊष्मा लेती है",
          ),
        },
        {
          id: "exo",
          label: t("Exothermic", "ऊष्माक्षेपी"),
          feedback: t(
            "An exothermic reaction would feel warm. This one draws heat in.",
            "ऊष्माक्षेपी अभिक्रिया गर्म लगती। यह ऊष्मा अंदर खींचती है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Reactions that take energy in", "ऊर्जा लेने वाली अभिक्रियाएँ")),
      w.body(
        t(
          "Every decomposition so far needed energy to break the reactant apart: heat for ferrous sulphate, limestone and lead nitrate, electricity for water, light for silver chloride.",
          "अब तक हर वियोजन को अभिकारक तोड़ने के लिए ऊर्जा चाहिए थी: फ़ेरस सल्फ़ेट, चूना-पत्थर और लेड नाइट्रेट के लिए ऊष्मा, पानी के लिए विद्युत, सिल्वर क्लोराइड के लिए प्रकाश।",
        ),
      ),
      w.definition(
        t(
          "**Endothermic reaction.** A reaction in which **energy is absorbed** is an **endothermic** reaction. It is the opposite of exothermic.",
          "**ऊष्माशोषी अभिक्रिया।** वह अभिक्रिया जिसमें **ऊर्जा अवशोषित** होती है, **ऊष्माशोषी** अभिक्रिया है। यह ऊष्माक्षेपी की उलटी है।",
        ),
      ),
      w.body(
        t(
          "Try NCERT's quick test: mix about 2 g of barium hydroxide with 1 g of ammonium chloride and touch the bottom of the test tube.",
          "NCERT की छोटी जाँच आज़माओ: लगभग 2 g बेरियम हाइड्रॉक्साइड में 1 g अमोनियम क्लोराइड मिलाओ और परखनली की तली छुओ।",
        ),
      ),
      cold,
      ask,
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
    const kiln = equationOn(b, "kiln", "limestoneHeat", {
      balanced: true,
      showStates: true,
      showTally: true,
    });
    b.standsFor(kiln, "CaCO₃(s) → CaO(s) + CO₂(g) on heating, balanced");
    const kilnAsk = choiceQuestion(b, {
      name: "kilnAsk",
      prompt: t(
        "Grandpa's lime kiln and Riya's bucket: how are the two reactions related?",
        "दादाजी की चूने की भट्टी और रिया की बाल्टी: दोनों अभिक्रियाएँ कैसे जुड़ी हैं?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "The kiln is a decomposition that makes CaO; the bucket is a combination that uses it",
            "भट्टी एक वियोजन है जो CaO बनाता है; बाल्टी एक संयोजन है जो उसे उपयोग करता है",
          ),
        },
        {
          id: "same",
          label: t("They are the same reaction", "दोनों एक ही अभिक्रिया हैं"),
          feedback: t(
            "The kiln breaks CaCO₃ apart; the bucket joins CaO with water. Opposite kinds.",
            "भट्टी CaCO₃ तोड़ती है; बाल्टी CaO को पानी से जोड़ती है। उलटे प्रकार।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const photo = choiceQuestion(b, {
      name: "photo",
      prompt: t(
        "Why did old photographic film have to be kept in the dark until it was used?",
        "पुरानी फ़ोटो-फ़िल्म को उपयोग तक अँधेरे में क्यों रखना पड़ता था?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Light would break down its silver salts and darken it",
            "प्रकाश उसके सिल्वर लवणों को तोड़कर उसे काला कर देता",
          ),
        },
        {
          id: "heat",
          label: t("Warmth would melt it", "गर्मी से वह पिघल जाती"),
          feedback: t(
            "It's light, not heat, that decomposes silver chloride and silver bromide.",
            "सिल्वर क्लोराइड और ब्रोमाइड को ऊष्मा नहीं, प्रकाश तोड़ता है।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const stop = w.definition(
      t(
        "**Stop 5 done.** Decomposition is combination run backwards: one substance breaks into several, and it needs energy: heat, light or electricity. So decomposition reactions are endothermic. The whitewash started in a kiln, and Grandpa's photos were drawn in silver by light. Next stop: reactions where one element pushes another out of its compound.",
        "**पड़ाव 5 पूरा।** वियोजन उल्टा चलता संयोजन है: एक पदार्थ कई में टूटता है, और इसके लिए ऊर्जा चाहिए: ऊष्मा, प्रकाश या विद्युत। इसलिए वियोजन अभिक्रियाएँ ऊष्माशोषी होती हैं। सफ़ेदी एक भट्टी से शुरू हुई थी, और दादाजी की तस्वीरें प्रकाश ने चाँदी से बनाई थीं। अगला पड़ाव: ऐसी अभिक्रियाएँ जिनमें एक तत्व दूसरे को उसके यौगिक से बाहर धकेलता है।",
      ),
      "stop",
      { isHidden: true },
    );
    b.when(kilnAsk.on(QuestionSignal.Correct), theBoard.show(photo));
    b.when(photo.on(QuestionSignal.Correct), [theBoard.show(stop), theBoard.pass()]);
    return column([
      w.title(t("The kiln and the album", "भट्टी और एल्बम")),
      w.body(
        t(
          "Now Grandpa's stories make sense. The lime kiln heated limestone until it decomposed:",
          "अब दादाजी की कहानियाँ समझ आती हैं। चूने की भट्टी चूना-पत्थर को तब तक गर्म करती थी जब तक उसका वियोजन न हो जाए:",
        ),
      ),
      kiln,
      kilnAsk,
      photo,
      stop,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Exercise 8(b): zinc carbonate on heating, worked. */
const example = page("example", (b) => {
  const w = wordsOn(b);
  const zinc = equationOn(b, "zinc", "zincCarbonateHeat", {
    balanced: true,
    showStates: true,
    showTally: true,
  });
  b.standsFor(zinc, "ZnCO₃(s) → ZnO(s) + CO₂(g) on heating, balanced");
  return column([
    w.title(t("Example: name the type", "उदाहरण: प्रकार बताओ")),
    w.body(
      t(
        "**Zinc carbonate (s) → Zinc oxide (s) + Carbon dioxide (g). Write the balanced equation and name the type of reaction.**",
        "**जिंक कार्बोनेट (s) → जिंक ऑक्साइड (s) + कार्बन डाइऑक्साइड (g)। संतुलित समीकरण लिखो और अभिक्रिया का प्रकार बताओ।**",
      ),
    ),
    w.body(
      t(
        r`Formulae: zinc carbonate is $\ce{ZnCO3}$, zinc oxide $\ce{ZnO}$, carbon dioxide $\ce{CO2}$. Count: 1 Zn, 1 C and 3 O on each side, so no coefficients are needed:`,
        r`सूत्र: जिंक कार्बोनेट $\ce{ZnCO3}$, जिंक ऑक्साइड $\ce{ZnO}$, कार्बन डाइऑक्साइड $\ce{CO2}$। गिनो: हर ओर 1 Zn, 1 C और 3 O, इसलिए किसी गुणांक की ज़रूरत नहीं:`,
      ),
    ),
    zinc,
    w.body(
      t(
        "One reactant gives two products, on heating: a **thermal decomposition**.",
        "एक अभिकारक गर्म करने पर दो उत्पाद देता है: **ऊष्मीय वियोजन**।",
      ),
    ),
    space(),
  ]);
});

/** Your turn; then the mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const ask1 = choiceQuestion(b, {
      name: "ask1",
      prompt: t(
        "Why are decomposition reactions called the opposite of combination reactions?",
        "वियोजन अभिक्रियाओं को संयोजन अभिक्रियाओं की उलटी क्यों कहते हैं?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Combination makes one product from several substances; decomposition breaks one substance into several",
            "संयोजन कई पदार्थों से एक उत्पाद बनाता है; वियोजन एक पदार्थ को कई में तोड़ता है",
          ),
        },
        {
          id: "heat",
          label: t(
            "Combination uses heat and decomposition doesn't",
            "संयोजन ऊष्मा लेता है और वियोजन नहीं",
          ),
          feedback: t(
            "It's mostly the other way round: decompositions usually need energy put in.",
            "प्रायः उल्टा है: वियोजन को प्रायः ऊर्जा देनी पड़ती है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const ask2 = choiceQuestion(b, {
      name: "ask2",
      prompt: t("Which decomposition uses electricity?", "कौन-सा वियोजन विद्युत का उपयोग करता है?"),
      options: [
        { id: "right", label: t(r`$\ce{2H2O -> 2H2 + O2}$`, r`$\ce{2H2O -> 2H2 + O2}$`) },
        {
          id: "agcl",
          label: t(r`$\ce{2AgCl -> 2Ag + Cl2}$`, r`$\ce{2AgCl -> 2Ag + Cl2}$`),
          feedback: t("That one is done by sunlight.", "वह धूप से होता है।"),
        },
        {
          id: "caco3",
          label: t(r`$\ce{CaCO3 -> CaO + CO2}$`, r`$\ce{CaCO3 -> CaO + CO2}$`),
          feedback: t("That one is done by heating.", "वह गर्म करने से होता है।"),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ Decomposition: one reactant gives two or more simpler products. ✓ The energy can be heat (thermal decomposition), electricity or light. ✓ Endothermic: energy absorbed. ✓ Quick lime comes from heating limestone. Next: displacement.",
        "**मिशन लॉग।** ✓ वियोजन: एक अभिकारक दो या अधिक सरल उत्पाद देता है। ✓ ऊर्जा ऊष्मा (ऊष्मीय वियोजन), विद्युत या प्रकाश हो सकती है। ✓ ऊष्माशोषी: ऊर्जा अवशोषित। ✓ बिना बुझा चूना चूना-पत्थर गर्म करके बनता है। आगे: विस्थापन।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(ask1.on(QuestionSignal.Correct), theBoard.show(ask2));
    b.when(ask2.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), ask1, ask2, log, space()]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [hook, heat, fumes, electric, light, endo, inLife, example, yourTurn];

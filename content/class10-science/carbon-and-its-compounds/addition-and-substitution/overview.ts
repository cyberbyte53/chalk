import { PassOn, column, page, space, t } from "@chalk/author";
import { goalQuestion, wordsOn } from "@chalk/patterns";
import { CarbonScene, LabAction, LabDerived, LabKind } from "@chalk/prop-carbon";
import { ask, ceOn, ceTwo, labOn, oneByOne, sceneOn } from "../kit";

/** Vanaspati vs oil. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const tins = sceneOn(
    b,
    "tins",
    CarbonScene.Vanaspati,
    "a tin of solid vanaspati ghee next to a bottle of liquid groundnut oil, with Grandpa tapping the tin",
  );
  return column([
    w.title(t("Oil that turned solid", "तेल जो ठोस बन गया")),
    tins,
    w.body(
      t(
        'Last time: burning and oxidation. For the soap, Riya needs fat or oil. The kitchen has liquid groundnut oil and a tin of solid **vanaspati**. Grandpa: "That vanaspati was oil too, once. A factory turned it solid with hydrogen. Use the oil: it\'s better for you, and for soap too."',
        'पिछली बार: दहन और ऑक्सीकरण। साबुन के लिए रिया को वसा या तेल चाहिए। रसोई में द्रव मूँगफली का तेल है और ठोस **वनस्पति** का एक डिब्बा। दादाजी: "वह वनस्पति भी कभी तेल था। कारख़ाने ने हाइड्रोजन से उसे ठोस बना दिया। तेल लो: वह तुम्हारे लिए बेहतर है, और साबुन के लिए भी।"',
      ),
    ),
    w.body(
      t(
        "Stop 8: how can hydrogen turn an oil into a solid fat, and how can atoms in a molecule be swapped?",
        "पड़ाव 8: हाइड्रोजन तेल को ठोस वसा कैसे बना सकती है, और अणु के परमाणु कैसे बदले जा सकते हैं?",
      ),
    ),
    space(),
  ]);
});

/** Catalysts and hydrogenation. */
const addition = page(
  "addition",
  (b) => {
    const w = wordsOn(b);
    const lab = labOn(b, "lab", LabKind.Hydrogenation);
    b.standsFor(
      lab,
      "liquid vegetable oil heated with hydrogen over a nickel catalyst, stepping until it sets as a solid fat; the double bonds in the chain are drawn becoming single",
    );
    const goal = goalQuestion(b, {
      about: lab,
      prompt: t("Step through the hydrogenation to the end.", "हाइड्रोजनीकरण को अंत तक आगे बढ़ाओ।"),
      isMet: lab.derived(LabDerived.IsDone),
      solve: [lab.learner(LabAction.Next), lab.learner(LabAction.Next)],
    });
    return column([
      w.title(t("Adding hydrogen", "हाइड्रोजन जोड़ना")),
      w.definition(
        t(
          "**Catalyst.** A substance that makes a reaction go, or go faster, **without itself being changed**, is a **catalyst**. Nickel and palladium are catalysts for adding hydrogen.",
          "**उत्प्रेरक।** जो पदार्थ **स्वयं बदले बिना** किसी अभिक्रिया को होने दे, या तेज़ करे, वह **उत्प्रेरक** है। निकेल और पैलेडियम हाइड्रोजन जोड़ने के उत्प्रेरक हैं।",
        ),
      ),
      w.definition(
        t(
          "**Addition reaction.** Unsaturated hydrocarbons **add hydrogen** across a double bond in the presence of a catalyst, becoming saturated. This **hydrogenation** is used to turn vegetable oils into solid fats like vanaspati:",
          "**संकलन अभिक्रिया।** असंतृप्त हाइड्रोकार्बन उत्प्रेरक की उपस्थिति में द्विआबंध पर **हाइड्रोजन जोड़ते** हैं, और संतृप्त हो जाते हैं। इस **हाइड्रोजनीकरण** का उपयोग वनस्पति तेलों को वनस्पति घी जैसी ठोस वसा बनाने में होता है:",
        ),
      ),
      w.body(ceTwo("R-CH=CH-R + H2", "R-CH2-CH2-R", t("nickel catalyst", "\\text{निकेल उत्प्रेरक}"))),
      w.note(t("R stands for the rest of the chain.", "R शृंखला के बाक़ी हिस्से को दिखाता है।")),
      lab,
      goal,
      w.body(
        t(
          "Vegetable oils generally have long **unsaturated** carbon chains; animal fats have **saturated** chains. Saturated fats are said to be harmful for health: oils with unsaturated fatty acids are the better choice for cooking.",
          "वनस्पति तेलों में सामान्यतः लंबी **असंतृप्त** कार्बन शृंखलाएँ होती हैं; जंतु वसा में **संतृप्त** शृंखलाएँ। संतृप्त वसा को स्वास्थ्य के लिए हानिकारक बताया जाता है: खाना पकाने के लिए असंतृप्त वसीय अम्लों वाले तेल बेहतर विकल्प हैं।",
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Substitution: CH₄ + Cl₂ in sunlight. */
const substitution = page(
  "substitution",
  (b) => {
    const w = wordsOn(b);
    const lab = labOn(b, "lab", LabKind.Chlorination);
    b.standsFor(
      lab,
      "methane and chlorine mixed in a jar: in the dark nothing happens; in sunlight hydrogens on the carbon are swapped for chlorine one at a time",
    );
    const goal = goalQuestion(b, {
      about: lab,
      prompt: t("Put the jar in sunlight and step on.", "जार को धूप में रखो और आगे बढ़ो।"),
      isMet: lab.derived(LabDerived.Reacts),
      solve: [lab.learner(LabAction.SetSun, { isSunny: true }), lab.learner(LabAction.Next)],
    });
    return column([
      w.title(t("Swapping atoms", "परमाणु बदलना")),
      w.body(
        t(
          "Saturated hydrocarbons are fairly unreactive: most reagents leave them alone. But in **sunlight**, chlorine can replace the hydrogen atoms of methane, one at a time.",
          "संतृप्त हाइड्रोकार्बन काफ़ी अक्रियाशील होते हैं: अधिकांश अभिकर्मक उन्हें नहीं छेड़ते। पर **धूप** में क्लोरीन मेथेन के हाइड्रोजन परमाणुओं को एक-एक करके बदल सकती है।",
        ),
      ),
      lab,
      goal,
      w.definition(
        t(
          "**Substitution reaction.** A reaction in which one type of atom, or group of atoms, **takes the place of another** is a **substitution reaction**:",
          "**प्रतिस्थापन अभिक्रिया।** वह अभिक्रिया जिसमें एक प्रकार का परमाणु, या परमाणुओं का समूह, **दूसरे की जगह ले** लेता है, **प्रतिस्थापन अभिक्रिया** है:",
        ),
      ),
      w.body(ceOn("CH4 + Cl2", "CH3Cl + HCl", t("sunlight", "\\text{सूर्य का प्रकाश}"))),
      w.body(
        t(
          "With more chlorine, more hydrogens are replaced, giving a mixture of products.",
          "और क्लोरीन से और हाइड्रोजन बदलते हैं, जिससे उत्पादों का मिश्रण बनता है।",
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Back to the tins; welding. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const tins = sceneOn(
      b,
      "tins",
      CarbonScene.Vanaspati,
      "the vanaspati tin and the oil bottle again",
    );
    const q = ask(
      b,
      "q",
      [
        "Which chains does the solid vanaspati have, compared with the oil?",
        "तेल की तुलना में ठोस वनस्पति में कैसी शृंखलाएँ हैं?",
      ],
      [
        "More saturated: hydrogen was added to its double bonds",
        "ज़्यादा संतृप्त: उसके द्विबंधों में हाइड्रोजन जोड़ी गई",
      ],
      [
        [
          "More unsaturated: hydrogen was taken out of the oil",
          "ज़्यादा असंतृप्त: तेल से हाइड्रोजन निकाली गई",
          "Hydrogenation removes double bonds: the fat becomes more saturated.",
          "हाइड्रोजनीकरण द्विआबंध हटाता है: वसा ज़्यादा संतृप्त हो जाती है।",
        ],
        [
          "The same: only its colour changed",
          "वही: केवल रंग बदला",
          "Adding hydrogen changes the chains themselves, which is why it turns solid.",
          "हाइड्रोजन जोड़ने से शृंखलाएँ ही बदलती हैं, इसीलिए वह ठोस बनता है।",
        ],
      ],
    );
    const q2 = ask(
      b,
      "q2",
      [
        "NCERT in-text Q: a mixture of oxygen and ethyne is burnt for welding. Why not ethyne and air?",
        "NCERT पाठ्य प्रश्न: वेल्डिंग के लिए ऑक्सीजन और एथाइन का मिश्रण जलाया जाता है। एथाइन और हवा क्यों नहीं?",
      ],
      [
        "In air ethyne burns incompletely: sooty and not hot enough",
        "हवा में एथाइन अपूर्ण जलता है: कालिख भरा और कम गर्म",
      ],
      [
        [
          "Air would make the flame far too hot to control safely",
          "हवा से लौ इतनी गर्म हो जाती कि सुरक्षित नहीं सँभलती",
          "Air is free. The problem is too little oxygen in it.",
          "हवा मुफ़्त है। समस्या उसमें कम ऑक्सीजन की है।",
        ],
        [
          "Ethyne doesn't burn in air at all",
          "एथाइन हवा में बिल्कुल नहीं जलता",
          "It does burn, but sooty and cooler.",
          "जलती है, पर कालिख के साथ और कम गर्म।",
        ],
      ],
      { isHidden: true },
    );
    const log = w.definition(
      t(
        "**Mission log.** ✓ Addition: hydrogen adds across double bonds with a catalyst (oil to vanaspati). ✓ Substitution: chlorine swaps for hydrogen in sunlight. ✓ The soap will use oil. Next: the two most important carbon compounds, ethanol and ethanoic acid.",
        "**मिशन लॉग।** ✓ संकलन: उत्प्रेरक के साथ द्विआबंधों पर हाइड्रोजन जुड़ती है (तेल से वनस्पति)। ✓ प्रतिस्थापन: धूप में क्लोरीन हाइड्रोजन की जगह लेती है। ✓ साबुन में तेल लगेगा। आगे: दो सबसे महत्त्वपूर्ण कार्बन यौगिक, एथेनॉल और एथेनॉइक अम्ल।",
      ),
      "log",
      { isHidden: true },
    );
    oneByOne(b, [q, q2], [log]);
    return column([w.title(t("Back to the kitchen", "रसोई में वापस")), tins, q, q2, log, space()]);
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
      ["What does a catalyst do?", "उत्प्रेरक क्या करता है?"],
      ["Speeds up a reaction but isn't used up", "अभिक्रिया तेज़ करता है पर ख़र्च नहीं होता"],
      [
        [
          "Gets used up in the reaction",
          "अभिक्रिया में ख़र्च हो जाता है",
          "A catalyst is left unchanged at the end.",
          "अंत में उत्प्रेरक बिना बदले बचता है।",
        ],
        [
          "Stops a reaction from going too fast",
          "अभिक्रिया को बहुत तेज़ होने से रोकता है",
          "It makes a reaction go, or go faster.",
          "वह अभिक्रिया को होने देता है, या तेज़ करता है।",
        ],
      ],
    );
    const q2 = ask(
      b,
      "q2",
      [
        "Which kind of hydrocarbon takes part in addition reactions?",
        "किस तरह के हाइड्रोकार्बन संकलन अभिक्रिया करते हैं?",
      ],
      ["Unsaturated", "असंतृप्त"],
      [
        [
          "Saturated",
          "संतृप्त",
          "Saturated ones have no double bond to add across; they do substitution.",
          "संतृप्त में जोड़ने को द्विआबंध नहीं; वे प्रतिस्थापन करते हैं।",
        ],
      ],
      { isHidden: true },
    );
    const q3 = ask(
      b,
      "q3",
      [
        "CH₄ + Cl₂ → CH₃Cl + HCl in sunlight is which kind of reaction?",
        "धूप में CH₄ + Cl₂ → CH₃Cl + HCl किस तरह की अभिक्रिया है?",
      ],
      ["Substitution", "प्रतिस्थापन"],
      [
        [
          "Addition",
          "संकलन",
          "Nothing is added across a double bond: a hydrogen is replaced.",
          "द्विआबंध पर कुछ नहीं जुड़ता: एक हाइड्रोजन बदलता है।",
        ],
        ["Combustion", "दहन", "Nothing burns in oxygen here.", "यहाँ ऑक्सीजन में कुछ नहीं जलता।"],
      ],
      { isHidden: true },
    );
    oneByOne(b, [q1, q2, q3]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), q1, q2, q3, space()]);
  },
  { passOn: PassOn.Rules },
);

export const overview = [hook, addition, substitution, inLife, yourTurn];

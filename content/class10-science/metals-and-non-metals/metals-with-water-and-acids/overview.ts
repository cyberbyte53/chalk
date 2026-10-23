import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, multiChoiceQuestion, wordsOn } from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import { LabMetal, MetalSceneKind, Reagent, ce, ceHeat, labOn, sceneOn, wordEq } from "../kit";

const r = String.raw;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const desk = sceneOn(
    b,
    "desk",
    MetalSceneKind.CaseFile,
    "Riya and Kabir at the desk with the case file open, a magnifying glass and a checklist",
  );
  return column([
    w.title(t("What was in the bowl?", "कटोरे में क्या था?")),
    desk,
    w.body(
      t(
        'Riya writes in the case file: *not scraped, not burnt*. Kabir remembers the bowl. **"It fizzed a little when he dipped them, and it smelt sharp, like the cleaning acid under the sink."** Water? An acid? Something stronger?',
        'रिया केस फ़ाइल में लिखती है: *खुरचा नहीं, जलाया नहीं*। कबीर को कटोरा याद आता है। **"जब उसने उन्हें डुबोया तो थोड़ा झाग बना, और तीखी गंध आई, सिंक के नीचे रखे सफ़ाई वाले अम्ल जैसी।"** पानी? कोई अम्ल? कुछ और तेज़?',
      ),
    ),
    w.body(
      t(
        "Clue 3: what do water and acids do to metals, and is there any liquid that can dissolve gold?",
        "सुराग 3: पानी और अम्ल धातुओं के साथ क्या करते हैं, और क्या कोई ऐसा द्रव है जो सोने को घोल सके?",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Activity 3.10: cold water, hot water, steam. */
const water = page(
  "water",
  (b) => {
    const w = wordsOn(b);
    const lab = labOn(b, "lab", {
      metals: [
        LabMetal.Potassium,
        LabMetal.Sodium,
        LabMetal.Calcium,
        LabMetal.Magnesium,
        LabMetal.Aluminium,
        LabMetal.Zinc,
        LabMetal.Iron,
        LabMetal.Lead,
        LabMetal.Copper,
        LabMetal.Gold,
      ],
      reagents: [Reagent.ColdWater, Reagent.HotWater, Reagent.Steam],
      metal: LabMetal.Sodium,
    });
    b.standsFor(
      lab,
      "a beaker of cold water, hot water, or a tube of steam; the learner drops in a metal: potassium and sodium react violently and the hydrogen catches fire, calcium fizzes and floats, magnesium reacts only with hot water, aluminium, zinc and iron only with steam, lead, copper and gold not at all",
    );
    const mg = choiceQuestion(b, {
      name: "mg",
      prompt: t(
        "Magnesium does nothing in cold water. Put it in hot water: what happens, and why does it float?",
        "मैग्नीशियम ठंडे पानी में कुछ नहीं करता। उसे गर्म पानी में डालो: क्या होता है, और वह तैरता क्यों है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "It reacts to give magnesium hydroxide and hydrogen; bubbles of hydrogen stick to it and lift it",
            "यह अभिक्रिया करके मैग्नीशियम हाइड्रॉक्साइड और हाइड्रोजन देता है; हाइड्रोजन के बुलबुले उससे चिपककर उसे उठा देते हैं",
          ),
        },
        {
          id: "light",
          label: t("Hot water makes magnesium lighter", "गर्म पानी मैग्नीशियम को हल्का कर देता है"),
          feedback: t(
            "Its weight doesn't change. Bubbles of hydrogen cling to the metal and carry it up.",
            "उसका भार नहीं बदलता। हाइड्रोजन के बुलबुले धातु से चिपककर उसे ऊपर ले जाते हैं।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Metals and water", "धातुएँ और पानी")),
      w.body(
        t(
          "NCERT Activity 3.10 (with the teacher). Put small pieces of each metal in cold water. Try the ones that don't react in hot water, and the ones that still don't, in steam.",
          "NCERT क्रियाकलाप 3.10 (शिक्षक के साथ)। हर धातु के छोटे टुकड़े ठंडे पानी में डालो। जो अभिक्रिया न करें उन्हें गर्म पानी में, और जो तब भी न करें उन्हें भाप में आज़माओ।",
        ),
      ),
      lab,
      w.definition(
        t(
          "**Metal + water.** A metal that reacts with water gives a **metal oxide** and **hydrogen** gas. If the oxide dissolves in water, it goes on to form a **metal hydroxide**.",
          "**धातु + पानी।** जो धातु पानी से अभिक्रिया करती है, वह **धातु ऑक्साइड** और **हाइड्रोजन** गैस देती है। अगर ऑक्साइड पानी में घुल जाए, तो आगे **धातु हाइड्रॉक्साइड** बनता है।",
        ),
      ),
      w.body(
        wordEq("Metal + Water -> Metal oxide + Hydrogen", "धातु + पानी -> धातु ऑक्साइड + हाइड्रोजन"),
      ),
      w.body(
        wordEq("Metal oxide + Water -> Metal hydroxide", "धातु ऑक्साइड + पानी -> धातु हाइड्रॉक्साइड"),
      ),
      w.body(
        t(
          "Potassium and sodium react **violently** with cold water. The reaction gives out so much heat that the hydrogen catches fire:",
          "पोटैशियम और सोडियम ठंडे पानी से **बहुत तेज़ी** से अभिक्रिया करते हैं। अभिक्रिया इतनी ऊष्मा देती है कि हाइड्रोजन आग पकड़ लेती है:",
        ),
      ),
      w.body(ceHeat("2K(s) + 2H2O(l) -> 2KOH(aq) + H2(g)")),
      w.body(ceHeat("2Na(s) + 2H2O(l) -> 2NaOH(aq) + H2(g)")),
      w.body(
        t(
          "Calcium reacts less violently: the hydrogen doesn't catch fire, and calcium **floats** because hydrogen bubbles stick to it.",
          "कैल्शियम कम तेज़ी से अभिक्रिया करता है: हाइड्रोजन आग नहीं पकड़ती, और कैल्शियम **तैरने** लगता है क्योंकि हाइड्रोजन के बुलबुले उससे चिपक जाते हैं।",
        ),
      ),
      w.body(ce("Ca(s) + 2H2O(l) -> Ca(OH)2(aq) + H2(g)")),
      w.body(
        t(
          "Aluminium, iron and zinc don't react with cold or hot water, but they do with **steam**, giving the metal oxide and hydrogen:",
          "ऐलुमिनियम, लोहा और ज़िंक ठंडे या गर्म पानी से अभिक्रिया नहीं करते, पर **भाप** से करते हैं, और धातु ऑक्साइड और हाइड्रोजन देते हैं:",
        ),
      ),
      w.body(ce("2Al(s) + 3H2O(g) -> Al2O3(s) + 3H2(g)")),
      w.body(ce("3Fe(s) + 4H2O(g) -> Fe3O4(s) + 4H2(g)")),
      w.body(
        t(
          "Lead, copper, silver and gold don't react with water **at all**.",
          "लेड, ताँबा, चाँदी और सोना पानी से **बिल्कुल** अभिक्रिया नहीं करते।",
        ),
      ),
      mg,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Activity 3.11: dilute hydrochloric acid, with thermometers. */
const acids = page(
  "acids",
  (b) => {
    const w = wordsOn(b);
    const lab = labOn(b, "lab", {
      metals: [
        LabMetal.Magnesium,
        LabMetal.Aluminium,
        LabMetal.Zinc,
        LabMetal.Iron,
        LabMetal.Copper,
      ],
      reagents: [Reagent.DiluteAcid],
      metal: LabMetal.Magnesium,
      showThermometer: true,
    });
    b.standsFor(
      lab,
      "a test tube of dilute hydrochloric acid with a thermometer; the learner drops in magnesium, aluminium, zinc, iron or copper and watches how fast bubbles form and how hot it gets",
    );
    const order = choiceQuestion(b, {
      name: "order",
      prompt: t(
        "Try all five. Which order of reactivity with dilute acid do you see?",
        "पाँचों आज़माओ। तनु अम्ल के साथ क्रियाशीलता का कौन-सा क्रम दिखता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Mg > Al > Zn > Fe, and Cu doesn't react",
            "Mg > Al > Zn > Fe, और Cu अभिक्रिया नहीं करता",
          ),
        },
        {
          id: "fe",
          label: t(
            "Fe > Zn > Al > Mg, and Cu doesn't react",
            "Fe > Zn > Al > Mg, और Cu अभिक्रिया नहीं करता",
          ),
          feedback: t(
            "Look at the bubbles and the thermometer: magnesium is the fastest and hottest.",
            "बुलबुले और थर्मामीटर देखो: मैग्नीशियम सबसे तेज़ और सबसे गर्म है।",
          ),
        },
        {
          id: "cu",
          label: t("Cu > Mg > Al > Zn > Fe", "Cu > Mg > Al > Zn > Fe"),
          feedback: t(
            "Copper gives no bubbles at all and the temperature doesn't change: it doesn't react.",
            "ताँबा कोई बुलबुला नहीं देता और ताप नहीं बदलता: यह अभिक्रिया नहीं करता।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Metals and dilute acids", "धातुएँ और तनु अम्ल")),
      w.body(
        t(
          "NCERT Activity 3.11. Sodium and potassium are left out: they react too violently even with cold water. Drop each clean metal in dilute hydrochloric acid, with a thermometer in the tube, and watch how fast the bubbles come and how warm it gets.",
          "NCERT क्रियाकलाप 3.11। सोडियम और पोटैशियम छोड़ दिए गए हैं: वे ठंडे पानी से भी बहुत तेज़ी से अभिक्रिया करते हैं। हर साफ़ धातु को तनु हाइड्रोक्लोरिक अम्ल में डालो, परखनली में थर्मामीटर लगाकर, और देखो कि बुलबुले कितनी तेज़ी से आते हैं और कितनी गर्मी होती है।",
        ),
      ),
      lab,
      w.definition(
        t(
          "**Metal + dilute acid.** A metal that reacts with a dilute acid gives a **salt** and **hydrogen** gas. A **salt** is the compound made when the hydrogen of an acid is replaced by a metal. The faster the bubbles and the hotter the tube, the more reactive the metal.",
          "**धातु + तनु अम्ल।** जो धातु तनु अम्ल से अभिक्रिया करती है, वह **लवण** और **हाइड्रोजन** गैस देती है। **लवण** वह यौगिक है जो अम्ल के हाइड्रोजन की जगह धातु के आने से बनता है। बुलबुले जितने तेज़ और परखनली जितनी गर्म, धातु उतनी अधिक क्रियाशील।",
        ),
      ),
      w.body(wordEq("Metal + Dilute acid -> Salt + Hydrogen", "धातु + तनु अम्ल -> लवण + हाइड्रोजन")),
      w.body(
        t(
          "For example, with dilute hydrochloric acid:",
          "उदाहरण के लिए, तनु हाइड्रोक्लोरिक अम्ल के साथ:",
        ),
      ),
      w.body(ce("Mg + 2HCl -> MgCl2 + H2")),
      w.body(ce("Fe + 2HCl -> FeCl2 + H2")),
      order,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Nitric acid gives no hydrogen; aqua regia dissolves gold. */
const strong = page(
  "strong",
  (b) => {
    const w = wordsOn(b);
    const regia = choiceQuestion(b, {
      name: "regia",
      prompt: t("Which of these can dissolve gold?", "इनमें से कौन सोने को घोल सकता है?"),
      options: [
        {
          id: "right",
          label: t(
            "Aqua regia: concentrated hydrochloric and nitric acids, 3 : 1",
            "अम्लराज: सांद्र हाइड्रोक्लोरिक और नाइट्रिक अम्ल, 3 : 1",
          ),
        },
        {
          id: "hcl",
          label: t("Concentrated hydrochloric acid on its own", "अकेला सांद्र हाइड्रोक्लोरिक अम्ल"),
          feedback: t(
            "Neither acid can dissolve gold alone. Only the fresh mixture can.",
            "कोई भी अम्ल अकेले सोने को नहीं घोल सकता। केवल ताज़ा मिश्रण घोल सकता है।",
          ),
        },
        {
          id: "hno3",
          label: t("Concentrated nitric acid on its own", "अकेला सांद्र नाइट्रिक अम्ल"),
          feedback: t(
            "Neither acid can dissolve gold alone. Only the fresh mixture can.",
            "कोई भी अम्ल अकेले सोने को नहीं घोल सकता। केवल ताज़ा मिश्रण घोल सकता है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Two special cases", "दो विशेष मामले")),
      w.definition(
        t(
          "**Nitric acid.** Hydrogen gas is **not** given off when a metal reacts with nitric acid. Nitric acid is a strong **oxidising agent** (it gives oxygen to other substances): it oxidises the hydrogen produced to water, and is itself reduced to an oxide of nitrogen ($\\ce{N2O}$, $\\ce{NO}$ or $\\ce{NO2}$). The exceptions: **magnesium** and **manganese** react with **very dilute** nitric acid to give hydrogen.",
          "**नाइट्रिक अम्ल।** जब कोई धातु नाइट्रिक अम्ल से अभिक्रिया करती है, तो हाइड्रोजन गैस **नहीं** निकलती। नाइट्रिक अम्ल एक प्रबल **ऑक्सीकारक** (यह दूसरे पदार्थों को ऑक्सीजन देता है) है: यह बनी हाइड्रोजन को पानी में ऑक्सीकृत कर देता है, और ख़ुद नाइट्रोजन के किसी ऑक्साइड ($\\ce{N2O}$, $\\ce{NO}$ या $\\ce{NO2}$) में अपचयित हो जाता है। अपवाद: **मैग्नीशियम** और **मैंगनीज़** **बहुत तनु** नाइट्रिक अम्ल से अभिक्रिया करके हाइड्रोजन देते हैं।",
        ),
      ),
      w.definition(
        t(
          '**Aqua regia.** *Aqua regia* (Latin for "royal water") is a **freshly prepared** mixture of **concentrated hydrochloric acid** and **concentrated nitric acid** in the ratio **3 : 1**. It can **dissolve gold**, even though neither acid can do so alone. It is a highly corrosive, fuming liquid, one of the few that can dissolve **gold and platinum**.',
          '**अम्लराज।** *ऐक्वा रेजिया* (लैटिन में "शाही पानी"), यानी **अम्लराज**, **सांद्र हाइड्रोक्लोरिक अम्ल** और **सांद्र नाइट्रिक अम्ल** का **3 : 1** के अनुपात में **ताज़ा बनाया** मिश्रण है। यह **सोने को घोल** सकता है, जबकि कोई भी अम्ल अकेले ऐसा नहीं कर सकता। यह बहुत संक्षारक, धुआँ देने वाला द्रव है, उन गिने-चुने द्रवों में से एक जो **सोने और प्लैटिनम** को घोल सकते हैं।',
        ),
      ),
      regia,
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
    const lab = labOn(b, "lab", {
      metals: [LabMetal.Gold],
      reagents: [Reagent.ColdWater, Reagent.HotWater, Reagent.Steam, Reagent.DiluteAcid],
      metal: LabMetal.Gold,
      reagent: Reagent.DiluteAcid,
    });
    b.standsFor(
      lab,
      "gold tried in cold water, hot water, steam and dilute acid: nothing happens in any of them",
    );
    const liquid = choiceQuestion(b, {
      name: "liquid",
      prompt: t(
        'Gold ignores water, steam and dilute acid. So what must the "goldsmith\'s" liquid have been?',
        'सोना पानी, भाप और तनु अम्ल को अनदेखा करता है। तो "सुनार" का द्रव क्या रहा होगा?',
      ),
      options: [
        {
          id: "right",
          label: t("Aqua regia", "अम्लराज"),
        },
        {
          id: "water",
          label: t("Hot water with soap", "साबुन वाला गर्म पानी"),
          feedback: t(
            "Water can wash off dirt, but it can't take away seven grams of gold.",
            "पानी मैल धो सकता है, पर सात ग्राम सोना नहीं हटा सकता।",
          ),
        },
        {
          id: "dilute",
          label: t("Dilute hydrochloric acid", "तनु हाइड्रोक्लोरिक अम्ल"),
          feedback: t(
            "Try gold in dilute acid above: no bubbles, no change. Dilute acids don't touch gold.",
            "ऊपर तनु अम्ल में सोना आज़माओ: न बुलबुले, न बदलाव। तनु अम्ल सोने को नहीं छूते।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const weight = choiceQuestion(b, {
      name: "weight",
      prompt: t(
        "Why did the bangles come out shining, but lighter?",
        "चूड़ियाँ चमकती हुई, पर हल्की होकर क्यों निकलीं?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "The liquid dissolved the dull outer layer of gold, exposing fresh shiny gold, and the dissolved gold stayed in his bowl",
            "द्रव ने सोने की फीकी बाहरी परत घोल दी, नीचे का ताज़ा चमकता सोना दिखने लगा, और घुला हुआ सोना उसके कटोरे में रह गया",
          ),
        },
        {
          id: "polish",
          label: t("He polished them so hard they wore thin", "उसने इतना रगड़ा कि वे घिस गईं"),
          feedback: t(
            "There isn't a scratch on them, and he only dipped them for a minute.",
            "उन पर एक खरोंच तक नहीं है, और उसने उन्हें बस एक मिनट डुबोया था।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const notes = w.definition(
      t(
        "**Case notes.** ✓ The big clue: only something like **aqua regia** dissolves gold. The man dissolved away a layer of the bangles and walked off with the gold in his solution. ? Riya wants to be sure gold really is that unreactive compared with every other metal. Next clue: putting all the metals in order.",
        "**केस नोट्स।** ✓ बड़ा सुराग: केवल **अम्लराज** जैसी चीज़ ही सोने को घोलती है। आदमी ने चूड़ियों की एक परत घोल दी और घोल में सोना लेकर चला गया। ? रिया पक्का करना चाहती है कि सोना बाकी हर धातु की तुलना में सच में इतना अक्रियाशील है। अगला सुराग: सभी धातुओं को क्रम में लगाना।",
      ),
      "notes",
      { isHidden: true },
    );
    b.when(liquid.on(QuestionSignal.Correct), theBoard.show(weight));
    b.when(weight.on(QuestionSignal.Correct), [theBoard.show(notes), theBoard.pass()]);
    return column([
      w.title(t("The liquid in the bowl", "कटोरे का द्रव")),
      lab,
      liquid,
      weight,
      notes,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** In-text questions 2 and 4, Exercise 7. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const steam = choiceQuestion(b, {
      name: "steam",
      prompt: t("Which is the equation for iron with steam?", "लोहे और भाप का समीकरण कौन-सा है?"),
      options: [
        {
          id: "right",
          label: t(r`$\ce{3Fe + 4H2O -> Fe3O4 + 4H2}$`, r`$\ce{3Fe + 4H2O -> Fe3O4 + 4H2}$`),
        },
        {
          id: "hydroxide",
          label: t(r`$\ce{Fe + 2H2O -> Fe(OH)2 + H2}$`, r`$\ce{Fe + 2H2O -> Fe(OH)2 + H2}$`),
          feedback: t(
            "With steam, iron gives an oxide, Fe₃O₄, not a hydroxide.",
            "भाप के साथ लोहा ऑक्साइड, Fe₃O₄, देता है, हाइड्रॉक्साइड नहीं।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const gas = choiceQuestion(b, {
      name: "gas",
      prompt: t(
        r`Iron reacts with dilute sulphuric acid. Which gas is given off, and what is the equation?`,
        r`लोहा तनु सल्फ़्यूरिक अम्ल से अभिक्रिया करता है। कौन-सी गैस निकलती है, और समीकरण क्या है?`,
      ),
      options: [
        {
          id: "right",
          label: t(
            r`Hydrogen: $\ce{Fe + H2SO4 -> FeSO4 + H2}$`,
            r`हाइड्रोजन: $\ce{Fe + H2SO4 -> FeSO4 + H2}$`,
          ),
        },
        {
          id: "so2",
          label: t(
            r`Sulphur dioxide: $\ce{Fe + H2SO4 -> FeO + SO2 + H2O}$`,
            r`सल्फ़र डाइऑक्साइड: $\ce{Fe + H2SO4 -> FeO + SO2 + H2O}$`,
          ),
          feedback: t(
            "A reactive metal with a dilute acid gives a salt and hydrogen.",
            "क्रियाशील धातु तनु अम्ल के साथ लवण और हाइड्रोजन देती है।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const two = multiChoiceQuestion(b, {
      name: "two",
      prompt: t(
        "Which of these metals displace hydrogen from dilute acids? Tick all.",
        "इनमें से कौन-सी धातुएँ तनु अम्लों से हाइड्रोजन विस्थापित करती हैं? सभी पर निशान लगाओ।",
      ),
      options: [
        { id: "zn", label: t("Zinc", "ज़िंक") },
        { id: "mg", label: t("Magnesium", "मैग्नीशियम") },
        {
          id: "cu",
          label: t("Copper", "ताँबा"),
          feedback: t(
            "Copper gave no bubbles in Activity 3.11.",
            "क्रियाकलाप 3.11 में ताँबे ने कोई बुलबुला नहीं दिया।",
          ),
        },
        {
          id: "ag",
          label: t("Silver", "चाँदी"),
          feedback: t(
            "Silver, like copper and gold, doesn't react with dilute acids.",
            "चाँदी, ताँबे और सोने की तरह, तनु अम्लों से अभिक्रिया नहीं करती।",
          ),
        },
      ],
      answers: ["zn", "mg"],
      missing: t("Right so far: one more gives hydrogen.", "अब तक सही: एक और हाइड्रोजन देती है।"),
      isHidden: true,
      passes: false,
    });
    const notes = w.definition(
      t(
        "**Case notes.** ✓ Water: K, Na violently; Ca less; Mg with hot water; Al, Zn, Fe with steam; Pb, Cu, Ag, Au not at all. ✓ Dilute acid: Mg > Al > Zn > Fe give hydrogen; Cu doesn't. ✓ Aqua regia dissolves gold. Next clue: one list for all the metals.",
        "**केस नोट्स।** ✓ पानी: K, Na तेज़ी से; Ca कम; Mg गर्म पानी से; Al, Zn, Fe भाप से; Pb, Cu, Ag, Au बिल्कुल नहीं। ✓ तनु अम्ल: Mg > Al > Zn > Fe हाइड्रोजन देते हैं; Cu नहीं। ✓ अम्लराज सोने को घोलता है। अगला सुराग: सभी धातुओं की एक सूची।",
      ),
      "notes",
      { isHidden: true },
    );
    b.when(steam.on(QuestionSignal.Correct), theBoard.show(gas));
    b.when(gas.on(QuestionSignal.Correct), theBoard.show(two));
    b.when(two.on(QuestionSignal.Correct), [theBoard.show(notes), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), steam, gas, two, notes, space()]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [hook, water, acids, strong, inLife, yourTurn];

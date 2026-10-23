import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, multiChoiceQuestion, wordsOn } from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  BenchKind,
  ChemistrySceneKind,
  SwapAction,
  SwapKind,
  chemistrySceneDef,
  particleSwapDef,
} from "@chalk/prop-chemistry";
import { balanceGoal, benchOn, equationOn } from "../kit";

const r = String.raw;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const wall = b.prop(chemistrySceneDef, "wall", { scene: ChemistrySceneKind.Whitewash });
  b.standsFor(
    wall,
    "Riya on a stool whitewashing a wall, half done; beside her a bucket of lime and water steams and bubbles while Kabir leans away from it",
  );
  return column([
    w.title(t("The bucket that boils by itself", "अपने आप उबलने वाली बाल्टी")),
    wall,
    w.body(
      t(
        'Job 1: the whitewash. Mom brings home a bag of **quick lime** from the hardware shop. Riya tips it into a bucket and pours in water. The bucket hisses, bubbles and steams, though nobody lit a fire. "Stand back, and never put your hand in that," says Mom. Kabir touches the outside of the bucket and pulls his hand away: it\'s hot.',
        'काम 1: सफ़ेदी। मम्मी हार्डवेयर की दुकान से **बिना बुझे चूने** का थैला लाती हैं। रिया उसे बाल्टी में डालकर पानी उड़ेलती है। बाल्टी सनसनाती है, बुलबुले उठते हैं और भाप निकलती है, जबकि किसी ने आग नहीं जलाई। "पीछे हटो, और उसमें कभी हाथ मत डालना," मम्मी कहती हैं। कबीर बाल्टी का बाहरी हिस्सा छूता है और हाथ खींच लेता है: वह गर्म है।',
      ),
    ),
    w.body(
      t(
        "Stop 4: what reaction is in the bucket, and where does all that heat come from?",
        "पड़ाव 4: बाल्टी में कौन-सी अभिक्रिया हो रही है, और इतनी गर्मी कहाँ से आती है?",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Activity 1.4: quick lime and water; a combination reaction defined. */
const combine = page(
  "combine",
  (b) => {
    const w = wordsOn(b);
    const lime = benchOn(b, "lime", BenchKind.QuickLime, { showThermometer: true });
    b.standsFor(
      lime,
      "NCERT Activity 1.4: water added to quick lime in a beaker; it fizzes, steams and the thermometer rises sharply",
    );
    const atoms = b.prop(particleSwapDef, "atoms", {
      kind: SwapKind.Combination,
      step: 0,
      canStep: true,
      showEquation: true,
      captions: [
        t("One CaO and one H₂O.", "एक CaO और एक H₂O।"),
        t("They come together…", "वे पास आते हैं…"),
        t("…and become one substance: Ca(OH)₂.", "…और एक ही पदार्थ बनते हैं: Ca(OH)₂।"),
      ],
    });
    b.studentOnly(atoms.action(SwapAction.Next));
    b.standsFor(
      atoms,
      "calcium oxide and water drawn as balls joining into one calcium hydroxide unit",
    );
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t("How many products does this reaction have?", "इस अभिक्रिया के कितने उत्पाद हैं?"),
      options: [
        { id: "right", label: t("One: calcium hydroxide", "एक: कैल्शियम हाइड्रॉक्साइड") },
        {
          id: "two",
          label: t("Two: calcium hydroxide and heat", "दो: कैल्शियम हाइड्रॉक्साइड और ऊष्मा"),
          feedback: t(
            "Heat is energy, not a substance. Only one new substance forms.",
            "ऊष्मा ऊर्जा है, पदार्थ नहीं। केवल एक नया पदार्थ बनता है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Two substances become one", "दो पदार्थ एक बनते हैं")),
      w.body(
        t(
          "Activity 1.4. Put a little **calcium oxide** (quick lime) in a beaker and slowly add water. Press start and watch the thermometer.",
          "क्रियाकलाप 1.4। बीकर में थोड़ा **कैल्शियम ऑक्साइड** (बिना बुझा चूना) लो और धीरे-धीरे पानी डालो। शुरू दबाओ और थर्मामीटर देखो।",
        ),
      ),
      lime,
      w.body(
        t(
          "Calcium oxide reacts vigorously with water to give **slaked lime**, calcium hydroxide, and a lot of heat:",
          "कैल्शियम ऑक्साइड पानी से तेज़ी से अभिक्रिया करके **बुझा चूना**, कैल्शियम हाइड्रॉक्साइड, और बहुत ऊष्मा देता है:",
        ),
      ),
      w.body(
        t(
          r`$$\ce{CaO(s) + H2O(l) -> Ca(OH)2(aq)} + \text{Heat}$$`,
          r`$$\ce{CaO(s) + H2O(l) -> Ca(OH)2(aq)} + \text{ऊष्मा}$$`,
        ),
      ),
      w.definition(
        t(
          "**Combination reaction.** A reaction in which two or more substances (elements or compounds) combine to form a **single product** is a **combination reaction**.",
          "**संयोजन अभिक्रिया।** वह अभिक्रिया जिसमें दो या अधिक पदार्थ (तत्व या यौगिक) मिलकर **एक ही उत्पाद** बनाते हैं, **संयोजन अभिक्रिया** है।",
        ),
      ),
      atoms,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** More combination reactions: coal, water from hydrogen. */
const more = page(
  "more",
  (b) => {
    const w = wordsOn(b);
    const water = equationOn(b, "water", "waterFormation", {
      balanced: true,
      showMolecules: true,
      showTally: false,
      showStates: true,
    });
    b.standsFor(water, "2H₂(g) + O₂(g) → 2H₂O(l) with the molecules drawn");
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        r`Back in lesson 1, magnesium burned in air: $\ce{2Mg + O2 -> 2MgO}$. What type of reaction is that?`,
        r`पाठ 1 में मैग्नीशियम हवा में जला था: $\ce{2Mg + O2 -> 2MgO}$। वह किस प्रकार की अभिक्रिया है?`,
      ),
      options: [
        {
          id: "right",
          label: t("Combination: two reactants, one product", "संयोजन: दो अभिकारक, एक उत्पाद"),
        },
        {
          id: "not",
          label: t("Not combination: there are two magnesiums", "संयोजन नहीं: दो मैग्नीशियम हैं"),
          feedback: t(
            "The 2 counts how many of the same substance. Count the different substances: two in, one out.",
            "2 एक ही पदार्थ की गिनती है। अलग-अलग पदार्थ गिनो: दो अंदर, एक बाहर।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("More combinations", "और संयोजन")),
      w.body(
        t("Burning coal: carbon combines with oxygen.", "कोयले का जलना: कार्बन ऑक्सीजन से जुड़ता है।"),
      ),
      w.body(t(r`$$\ce{C(s) + O2(g) -> CO2(g)}$$`, r`$$\ce{C(s) + O2(g) -> CO2(g)}$$`)),
      w.body(
        t("Hydrogen and oxygen combine to form water.", "हाइड्रोजन और ऑक्सीजन मिलकर पानी बनाते हैं।"),
      ),
      water,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Exothermic reactions: heat given out. Natural gas, respiration, compost. */
const exo = page(
  "exo",
  (b) => {
    const w = wordsOn(b);
    const gas = equationOn(b, "gas", "methaneBurns", {
      balanced: true,
      showStates: true,
      showTally: false,
    });
    b.standsFor(gas, "CH₄(g) + 2O₂(g) → CO₂(g) + 2H₂O(g)");
    const resp = equationOn(b, "resp", "respiration", {
      balanced: true,
      showStates: true,
      showTally: false,
    });
    b.standsFor(resp, "respiration: C₆H₁₂O₆(aq) + 6O₂(aq) → 6CO₂(aq) + 6H₂O(l), giving out energy");
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "Why is respiration called an exothermic reaction?",
        "श्वसन को ऊष्माक्षेपी अभिक्रिया क्यों कहा जाता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Glucose combining with oxygen in our cells releases energy",
            "हमारी कोशिकाओं में ग्लूकोज़ के ऑक्सीजन से मिलने पर ऊर्जा निकलती है",
          ),
        },
        {
          id: "breath",
          label: t(
            "Because we breathe out warm air from our lungs",
            "क्योंकि हम फेफड़ों से गर्म हवा बाहर छोड़ते हैं",
          ),
          feedback: t(
            "Warm breath is a result. The reason is the reaction in the cells that gives out energy.",
            "गर्म साँस एक परिणाम है। कारण कोशिकाओं की वह अभिक्रिया है जो ऊर्जा देती है।",
          ),
        },
        {
          id: "food",
          label: t(
            "Because the food we eat was cooked with heat first",
            "क्योंकि जो खाना हम खाते हैं वह पहले गर्मी से पका था",
          ),
          feedback: t(
            "Cooking happens outside the body. Respiration is what happens to glucose inside it.",
            "खाना पकना शरीर के बाहर होता है। श्वसन वह है जो शरीर के अंदर ग्लूकोज़ के साथ होता है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Reactions that give out heat", "ऊष्मा देने वाली अभिक्रियाएँ")),
      w.definition(
        t(
          "**Exothermic reaction.** A reaction in which **heat is released** along with the products is an **exothermic** reaction. The quick lime reaction is one: that's why the bucket got hot.",
          "**ऊष्माक्षेपी अभिक्रिया।** वह अभिक्रिया जिसमें उत्पादों के साथ **ऊष्मा निकलती** है, **ऊष्माक्षेपी** अभिक्रिया है। बिना बुझे चूने वाली अभिक्रिया ऐसी ही है: इसीलिए बाल्टी गर्म हुई।",
        ),
      ),
      w.body(t("Burning natural gas (methane) on a stove:", "चूल्हे पर प्राकृतिक गैस (मेथेन) का जलना:")),
      gas,
      w.body(
        t(
          "Respiration is exothermic too. Rice, potatoes and bread contain carbohydrates, which digestion breaks down into glucose. In our cells glucose combines with oxygen, and the reaction gives out the energy that keeps us alive:",
          "श्वसन भी ऊष्माक्षेपी है। चावल, आलू और रोटी में कार्बोहाइड्रेट होते हैं, जिन्हें पाचन ग्लूकोज़ में तोड़ता है। हमारी कोशिकाओं में ग्लूकोज़ ऑक्सीजन से मिलता है, और यह अभिक्रिया वह ऊर्जा देती है जो हमें जीवित रखती है:",
        ),
      ),
      resp,
      w.body(
        t(
          "Vegetable waste rotting into compost is exothermic as well: a compost heap is warm inside.",
          "सब्ज़ियों के कचरे का सड़कर खाद बनना भी ऊष्माक्षेपी है: खाद का ढेर अंदर से गर्म होता है।",
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** Why the walls shine two days later: slaked lime takes CO₂ from the air. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const wall = b.prop(chemistrySceneDef, "wall", { scene: ChemistrySceneKind.Whitewash });
    b.standsFor(wall, "the whitewash in progress");
    const shine = equationOn(b, "shine", "whitewashSets", {
      balanced: true,
      showStates: true,
      showTally: false,
    });
    b.standsFor(shine, "Ca(OH)₂(aq) + CO₂(g) → CaCO₃(s) + H₂O(l)");
    const x = choiceQuestion(b, {
      name: "x",
      prompt: t(
        "NCERT asks: substance X is mixed with water to make the whitewash. What is X, and its formula?",
        "NCERT पूछता है: पदार्थ X को पानी में मिलाकर सफ़ेदी बनाई जाती है। X क्या है, और उसका सूत्र?",
      ),
      options: [
        {
          id: "right",
          label: t(
            r`Calcium oxide (quick lime), $\ce{CaO}$`,
            r`कैल्शियम ऑक्साइड (बिना बुझा चूना), $\ce{CaO}$`,
          ),
        },
        {
          id: "hydroxide",
          label: t(
            r`Calcium hydroxide (slaked lime), $\ce{Ca(OH)2}$`,
            r`कैल्शियम हाइड्रॉक्साइड (बुझा चूना), $\ce{Ca(OH)2}$`,
          ),
          feedback: t(
            "That is what forms in the bucket. X is what you put into it.",
            "वह बाल्टी में बनता है। X वह है जो तुम उसमें डालते हो।",
          ),
        },
        {
          id: "carbonate",
          label: t(r`Calcium carbonate, $\ce{CaCO3}$`, r`कैल्शियम कार्बोनेट, $\ce{CaCO3}$`),
          feedback: t(
            "Calcium carbonate is what forms on the wall days later. What goes into the bucket?",
            "कैल्शियम कार्बोनेट दीवार पर दिनों बाद बनता है। बाल्टी में क्या जाता है?",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const why = multiChoiceQuestion(b, {
      name: "why",
      prompt: t(
        "Which reaction in the whitewash job is a combination reaction? Tap it, then check.",
        "सफ़ेदी के काम की कौन-सी अभिक्रिया संयोजन अभिक्रिया है? उसे टैप करो, फिर जाँचो।",
      ),
      options: [
        { id: "slake", label: t(r`$\ce{CaO + H2O -> Ca(OH)2}$`, r`$\ce{CaO + H2O -> Ca(OH)2}$`) },
        {
          id: "set",
          label: t(r`$\ce{Ca(OH)2 + CO2 -> CaCO3 + H2O}$`, r`$\ce{Ca(OH)2 + CO2 -> CaCO3 + H2O}$`),
          feedback: t(
            "This one gives two products, CaCO₃ and water, so it isn't a combination.",
            "यह दो उत्पाद देती है, CaCO₃ और पानी, इसलिए यह संयोजन नहीं है।",
          ),
        },
      ],
      answers: ["slake"],
      missing: t("Pick the one with a single product.", "एक ही उत्पाद वाली चुनो।"),
      isHidden: true,
      passes: false,
    });
    const stop = w.definition(
      t(
        "**Stop 4 done.** The bucket held a combination reaction, and an exothermic one: that's where the heat came from. Two days after painting, the calcium hydroxide on the wall takes carbon dioxide from the air and becomes a thin, shiny layer of calcium carbonate, the same substance as marble. Job 1 ✓. Next stop: reactions that run the other way, and break one substance apart.",
        "**पड़ाव 4 पूरा।** बाल्टी में एक संयोजन अभिक्रिया थी, और ऊष्माक्षेपी: गर्मी वहीं से आई। पुताई के दो दिन बाद दीवार पर कैल्शियम हाइड्रॉक्साइड हवा से कार्बन डाइऑक्साइड लेकर कैल्शियम कार्बोनेट की पतली चमकदार परत बन जाता है, वही पदार्थ जिससे संगमरमर बना है। काम 1 ✓। अगला पड़ाव: उल्टी दिशा में चलने वाली अभिक्रियाएँ, जो एक पदार्थ को तोड़ती हैं।",
      ),
      "stop",
      { isHidden: true },
    );
    b.when(x.on(QuestionSignal.Correct), theBoard.show(why));
    b.when(why.on(QuestionSignal.Correct), [theBoard.show(stop), theBoard.pass()]);
    return column([
      w.title(t("Why the walls shine", "दीवारें क्यों चमकती हैं")),
      wall,
      w.body(
        t(
          "Now the bucket makes sense: quick lime combined with water, giving out heat. Riya paints the walls with the slaked lime. They look dull at first, but two to three days later they have a shiny finish. Slaked lime slowly reacts with carbon dioxide in the air:",
          "अब बाल्टी समझ में आती है: बिना बुझा चूना पानी से मिला, ऊष्मा देते हुए। रिया बुझे चूने से दीवारें पोतती है। पहले वे फीकी दिखती हैं, पर दो-तीन दिन बाद चमकने लगती हैं। बुझा चूना धीरे-धीरे हवा की कार्बन डाइऑक्साइड से अभिक्रिया करता है:",
        ),
      ),
      shine,
      x,
      why,
      stop,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Exercise 5(a): hydrogen and nitrogen to ammonia, a combination to balance. */
const example = page(
  "example",
  (b) => {
    const w = wordsOn(b);
    const { eq, goal } = balanceGoal(
      b,
      "eq",
      "ammonia",
      t(
        "Hydrogen gas combines with nitrogen to form ammonia. Balance it.",
        "हाइड्रोजन गैस नाइट्रोजन से मिलकर अमोनिया बनाती है। इसे संतुलित करो।",
      ),
      { showMolecules: true },
    );
    b.standsFor(eq, "N₂ + H₂ → NH₃ (or H₂ + N₂ → NH₃) with steppers and the atom table");
    return column([
      w.title(t("A combination to balance", "संतुलित करने को एक संयोजन")),
      w.body(
        t(
          "Two reactants, one product: a combination. Ammonia is $\\ce{NH3}$. Start with nitrogen, then hydrogen.",
          "दो अभिकारक, एक उत्पाद: संयोजन। अमोनिया $\\ce{NH3}$ है। नाइट्रोजन से शुरू करो, फिर हाइड्रोजन।",
        ),
      ),
      eq,
      goal,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Your turn; then the mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "Which of these is both a combination reaction and exothermic?",
        "इनमें से कौन-सी संयोजन अभिक्रिया भी है और ऊष्माक्षेपी भी?",
      ),
      options: [
        {
          id: "right",
          label: t(r`Coal burning: $\ce{C + O2 -> CO2}$`, r`कोयले का जलना: $\ce{C + O2 -> CO2}$`),
        },
        {
          id: "methane",
          label: t(
            r`Methane burning: $\ce{CH4 + 2O2 -> CO2 + 2H2O}$`,
            r`मेथेन का जलना: $\ce{CH4 + 2O2 -> CO2 + 2H2O}$`,
          ),
          feedback: t(
            "It's exothermic, but it gives two products, so it isn't a combination.",
            "यह ऊष्माक्षेपी है, पर दो उत्पाद देती है, इसलिए संयोजन नहीं है।",
          ),
        },
        {
          id: "melt",
          label: t("Ice melting", "बर्फ़ का पिघलना"),
          feedback: t(
            "Melting isn't a chemical reaction at all, and it takes heat in.",
            "पिघलना रासायनिक अभिक्रिया है ही नहीं, और यह ऊष्मा लेता है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ Combination: two or more substances form a single product. ✓ Exothermic: heat is released. ✓ The whitewash: CaO + H₂O → Ca(OH)₂ + heat, and later Ca(OH)₂ + CO₂ → CaCO₃ + H₂O makes the walls shine. Job 1 ✓. Next: decomposition.",
        "**मिशन लॉग।** ✓ संयोजन: दो या अधिक पदार्थ एक उत्पाद बनाते हैं। ✓ ऊष्माक्षेपी: ऊष्मा निकलती है। ✓ सफ़ेदी: CaO + H₂O → Ca(OH)₂ + ऊष्मा, और बाद में Ca(OH)₂ + CO₂ → CaCO₃ + H₂O दीवारें चमकाता है। काम 1 ✓। आगे: वियोजन।",
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
export const overview = [hook, combine, more, exo, inLife, example, yourTurn];

import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import { ChemistrySceneKind, chemistrySceneDef } from "@chalk/prop-chemistry";
import { balanceGoal, equationOn } from "../kit";

const r = String.raw;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const spark = b.prop(chemistrySceneDef, "spark", { scene: ChemistrySceneKind.Sparkler });
  b.standsFor(spark, "Kabir with a burning sparkler");
  return column([
    w.title(t("Fixing the line", "पंक्ति ठीक करना")),
    spark,
    w.body(
      t(
        r`Riya's sparkler line, $\ce{Mg + O2 -> MgO}$, has 2 oxygen atoms going in and 1 coming out. Kabir has an idea: "Just write $\ce{MgO2}$!" Grandpa stops him: "Then it's a different substance, one that isn't in the ash at all."`,
        r`रिया की फुलझड़ी वाली पंक्ति, $\ce{Mg + O2 -> MgO}$, में 2 ऑक्सीजन परमाणु जाते हैं और 1 निकलता है। कबीर को एक तरकीब सूझती है: "बस $\ce{MgO2}$ लिख दो!" दादाजी उसे रोकते हैं: "तब वह कोई और पदार्थ होगा, जो राख में है ही नहीं।"`,
      ),
    ),
    w.body(
      t(
        "Stop 3: how do you balance an equation without changing what the substances are?",
        "पड़ाव 3: पदार्थों को बदले बिना समीकरण संतुलित कैसे करें?",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** The one rule: coefficients, never subscripts. */
const rule = page(
  "rule",
  (b) => {
    const w = wordsOn(b);
    const water = equationOn(b, "water", "waterFormation", {
      balanced: true,
      showMolecules: true,
      showTally: true,
    });
    b.standsFor(
      water,
      "2H₂ + O₂ → 2H₂O drawn as molecules: two H₂ molecules and one O₂ molecule on the left, two water molecules on the right, all counts equal",
    );
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "To get four oxygen atoms from water, what may you write?",
        "पानी से चार ऑक्सीजन परमाणु पाने के लिए तुम क्या लिख सकते हो?",
      ),
      options: [
        { id: "right", label: t(r`$\ce{4H2O}$`, r`$\ce{4H2O}$`) },
        {
          id: "h2o4",
          label: t(r`$\ce{H2O4}$`, r`$\ce{H2O4}$`),
          feedback: t(
            "That changes the formula: it is no longer water. Only the number in front may change.",
            "इससे सूत्र बदल जाता है: वह पानी नहीं रहता। केवल आगे की संख्या बदल सकती है।",
          ),
        },
        {
          id: "brackets",
          label: t(r`$\ce{(H2O)4}$`, r`$\ce{(H2O)4}$`),
          feedback: t(
            "That writes one strange molecule, not four water molecules. Put the number in front instead.",
            "यह एक अजीब अणु लिखता है, पानी के चार अणु नहीं। संख्या आगे लगाओ।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("The one rule of balancing", "संतुलन का एक नियम")),
      w.definition(
        t(
          r`**Coefficient.** A number written **in front of** a formula is its **coefficient**: it says how many molecules of that substance take part. $\ce{2H2O}$ means two water molecules: 4 hydrogen atoms and 2 oxygen atoms. No coefficient means one.`,
          r`**गुणांक।** किसी सूत्र के **आगे** लिखी संख्या उसका **गुणांक** है: यह बताती है कि उस पदार्थ के कितने अणु भाग लेते हैं। $\ce{2H2O}$ मतलब पानी के दो अणु: 4 हाइड्रोजन परमाणु और 2 ऑक्सीजन परमाणु। कोई गुणांक न हो तो एक।`,
        ),
      ),
      w.definition(
        t(
          "**The rule.** To balance an equation, change **only the coefficients**. Never change the small numbers inside a formula: that would make it a different substance.",
          "**नियम।** समीकरण संतुलित करने के लिए **केवल गुणांक** बदलो। किसी सूत्र के अंदर की छोटी संख्याएँ कभी मत बदलो: इससे वह दूसरा पदार्थ बन जाएगा।",
        ),
      ),
      w.body(
        t(
          "Hydrogen burning to make water, balanced. The coefficients give two H₂ molecules and two H₂O molecules; the formulae are untouched.",
          "हाइड्रोजन जलकर पानी बनाता हुआ, संतुलित। गुणांक दो H₂ अणु और दो H₂O अणु देते हैं; सूत्र छुए नहीं गए।",
        ),
      ),
      water,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** NCERT's steps on Fe + H₂O → Fe₃O₄ + H₂, then the learner does it. */
const steps = page(
  "steps",
  (b) => {
    const w = wordsOn(b);
    const { eq, goal } = balanceGoal(
      b,
      "eq",
      "ironSteam",
      t(
        "Follow the steps: put 4 in front of H₂O, then 4 in front of H₂, then 3 in front of Fe. Use + and −.",
        "चरणों का पालन करो: H₂O के आगे 4, फिर H₂ के आगे 4, फिर Fe के आगे 3। + और − दबाओ।",
      ),
      { showMolecules: true },
    );
    b.standsFor(
      eq,
      "Fe + H₂O → Fe₃O₄ + H₂ with steppers under each formula, molecule pictures and the atom table",
    );
    return column([
      w.title(t("Balancing, step by step", "संतुलन, चरण दर चरण")),
      w.body(
        t(
          "Iron heated in steam gives iron oxide and hydrogen. The skeletal equation:",
          "भाप में गर्म किया लोहा आयरन ऑक्साइड और हाइड्रोजन देता है। कंकाली समीकरण:",
        ),
      ),
      w.body(t(r`$$\ce{Fe + H2O -> Fe3O4 + H2}$$`, r`$$\ce{Fe + H2O -> Fe3O4 + H2}$$`)),
      w.definition(
        t(
          "**NCERT's steps, 1 of 3.** (I) Draw a box round each formula: nothing inside a box ever changes. (II) Count the atoms of each element on both sides.",
          "**NCERT के चरण, 3 में से 1।** (I) हर सूत्र के चारों ओर एक डिब्बा बनाओ: डिब्बे के अंदर कभी कुछ नहीं बदलता। (II) दोनों ओर हर तत्व के परमाणु गिनो।",
        ),
      ),
      w.definition(
        t(
          "**2 of 3.** (III) Start with the biggest formula, Fe₃O₄, and its biggest count, oxygen: 4 on the right, 1 on the left. Put **4** in front of H₂O.",
          "**3 में से 2।** (III) सबसे बड़े सूत्र Fe₃O₄ और उसकी सबसे बड़ी गिनती, ऑक्सीजन, से शुरू करो: दाईं ओर 4, बाईं ओर 1। H₂O के आगे **4** लगाओ।",
        ),
      ),
      w.definition(
        t(
          "**3 of 3.** (IV) Hydrogen is now 8 on the left, 2 on the right: put **4** in front of H₂. (V) Iron is 1 on the left, 3 on the right: put **3** in front of Fe. (VI) Count every element again to check.",
          "**3 में से 3।** (IV) हाइड्रोजन अब बाईं ओर 8, दाईं ओर 2 है: H₂ के आगे **4** लगाओ। (V) लोहा बाईं ओर 1, दाईं ओर 3 है: Fe के आगे **3** लगाओ। (VI) जाँचने के लिए हर तत्व फिर से गिनो।",
        ),
      ),
      eq,
      goal,
      w.body(
        t(
          "This way of trying coefficients until every count matches, using the smallest whole numbers, is the **hit-and-trial method**.",
          "हर गिनती मेल खाने तक गुणांक आज़माने का यह तरीक़ा, सबसे छोटी पूर्ण संख्याओं के साथ, **हिट-एंड-ट्रायल विधि** (प्रयास और त्रुटि) कहलाता है।",
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** State symbols. */
const states = page(
  "states",
  (b) => {
    const w = wordsOn(b);
    const iron = equationOn(b, "iron", "ironSteam", {
      balanced: true,
      showStates: true,
      showTally: false,
    });
    b.standsFor(iron, "3Fe(s) + 4H₂O(g) → Fe₃O₄(s) + 4H₂(g)");
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        r`Why is water written $\ce{H2O(g)}$ here, not $\ce{H2O(l)}$?`,
        r`यहाँ पानी $\ce{H2O(g)}$ क्यों लिखा है, $\ce{H2O(l)}$ क्यों नहीं?`,
      ),
      options: [
        {
          id: "right",
          label: t("The water is used as steam, a gas", "पानी भाप, यानी गैस के रूप में लिया गया है"),
        },
        {
          id: "aq",
          label: t("Because it is a solution", "क्योंकि यह विलयन है"),
          feedback: t(
            "A solution in water would be (aq). Here the water itself is a gas: steam.",
            "पानी में विलयन (aq) होता। यहाँ पानी ख़ुद गैस है: भाप।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Writing the states", "अवस्थाएँ लिखना")),
      w.definition(
        t(
          "**State symbols.** To say what state each substance is in, write after its formula: **(s)** solid, **(l)** liquid, **(g)** gas, **(aq)** aqueous, meaning dissolved in water as a solution. Usually they are left out unless they matter.",
          "**अवस्था-प्रतीक।** हर पदार्थ किस अवस्था में है, यह बताने के लिए उसके सूत्र के बाद लिखो: **(s)** ठोस, **(l)** द्रव, **(g)** गैस, **(aq)** जलीय, यानी पानी में घुला विलयन। जब तक ज़रूरी न हो, इन्हें प्रायः छोड़ दिया जाता है।",
        ),
      ),
      iron,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Conditions on the arrow. */
const conditions = page("conditions", (b) => {
  const w = wordsOn(b);
  return column([
    w.title(t("Conditions on the arrow", "तीर पर शर्तें")),
    w.definition(
      t(
        "**Reaction conditions.** When a reaction needs something special, like heat, light, high pressure or a helper substance, it is written above or below the arrow.",
        "**अभिक्रिया की शर्तें।** जब अभिक्रिया को कुछ ख़ास चाहिए, जैसे ऊष्मा, प्रकाश, उच्च दाब या कोई सहायक पदार्थ, तो उसे तीर के ऊपर या नीचे लिखा जाता है।",
      ),
    ),
    w.body(
      t(
        "Making methanol from carbon monoxide and hydrogen needs a pressure of 340 atmospheres:",
        "कार्बन मोनोऑक्साइड और हाइड्रोजन से मेथनॉल बनाने के लिए 340 वायुमंडल दाब चाहिए:",
      ),
    ),
    w.body(
      t(
        r`$$\ce{CO(g) + 2H2(g) ->[340 atm] CH3OH(l)}$$`,
        r`$$\ce{CO(g) + 2H2(g) ->[340 atm] CH3OH(l)}$$`,
      ),
    ),
    w.body(
      t(
        "Plants make glucose from carbon dioxide and water only in sunlight, with the green substance chlorophyll:",
        "पौधे कार्बन डाइऑक्साइड और पानी से ग्लूकोज़ केवल सूर्य के प्रकाश में, हरे पदार्थ क्लोरोफ़िल के साथ बनाते हैं:",
      ),
    ),
    w.body(
      t(
        r`$$\ce{6CO2 + 12H2O ->[Sunlight][Chlorophyll] C6H12O6 + 6O2 + 6H2O}$$`,
        r`$$\ce{6CO2 + 12H2O ->[\text{सूर्य का प्रकाश}][\text{क्लोरोफ़िल}] C6H12O6 + 6O2 + 6H2O}$$`,
      ),
    ),
    w.body(
      t(
        r`The product $\ce{C6H12O6}$ is glucose. Water appears on both sides: the plant uses some and gives some out.`,
        r`उत्पाद $\ce{C6H12O6}$ ग्लूकोज़ है। पानी दोनों ओर है: पौधा कुछ लेता है और कुछ छोड़ता है।`,
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const { eq, goal } = balanceGoal(
      b,
      "eq",
      "magnesiumBurns",
      t("Balance Riya's sparkler line.", "रिया की फुलझड़ी वाली पंक्ति संतुलित करो।"),
      { showMolecules: true },
    );
    b.standsFor(eq, "Mg + O₂ → MgO with steppers, molecule pictures and the atom table");
    const stop = w.definition(
      t(
        r`**Stop 3 done.** $\ce{2Mg + O2 -> 2MgO}$: two magnesium atoms take one oxygen molecule and make two units of magnesium oxide. Nothing vanished; the line just needed coefficients. Kabir's $\ce{MgO2}$ would have been wrong. Now we can write any reaction properly, so it's time to start on Mom's list. Next stop: the whitewash.`,
        r`**पड़ाव 3 पूरा।** $\ce{2Mg + O2 -> 2MgO}$: दो मैग्नीशियम परमाणु एक ऑक्सीजन अणु लेकर मैग्नीशियम ऑक्साइड की दो इकाइयाँ बनाते हैं। कुछ ग़ायब नहीं हुआ; पंक्ति को बस गुणांक चाहिए थे। कबीर का $\ce{MgO2}$ ग़लत होता। अब हम कोई भी अभिक्रिया ठीक से लिख सकते हैं, तो मम्मी की सूची शुरू करने का समय है। अगला पड़ाव: सफ़ेदी।`,
      ),
      "stop",
      { isHidden: true },
    );
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(stop));
    return column([
      w.title(t("Riya's line, balanced", "रिया की पंक्ति, संतुलित")),
      w.body(
        t(
          "Oxygen first: there are 2 on the left. Then fix magnesium. Coefficients only.",
          "पहले ऑक्सीजन: बाईं ओर 2 हैं। फिर मैग्नीशियम ठीक करो। केवल गुणांक।",
        ),
      ),
      eq,
      goal,
      stop,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** NCERT in-text Q2 (i): hydrogen and chlorine. */
const practice1 = page(
  "practice-1",
  (b) => {
    const w = wordsOn(b);
    const { eq, goal } = balanceGoal(
      b,
      "eq",
      "hydrogenChlorine",
      t(
        "Balance: Hydrogen + Chlorine → Hydrogen chloride.",
        "संतुलित करो: हाइड्रोजन + क्लोरीन → हाइड्रोजन क्लोराइड।",
      ),
    );
    b.standsFor(eq, "H₂ + Cl₂ → HCl with steppers and the atom table");
    return column([w.title(t("Try one", "एक आज़माओ")), eq, goal, space()]);
  },
  { passOn: PassOn.Rules },
);

/** NCERT in-text Q2 (iii): sodium and water. */
const practice2 = page(
  "practice-2",
  (b) => {
    const w = wordsOn(b);
    const { eq, goal } = balanceGoal(
      b,
      "eq",
      "sodiumWater",
      t(
        "Balance: Sodium + Water → Sodium hydroxide + Hydrogen. Hint: hydrogen appears in two products.",
        "संतुलित करो: सोडियम + जल → सोडियम हाइड्रॉक्साइड + हाइड्रोजन। संकेत: हाइड्रोजन दो उत्पादों में है।",
      ),
    );
    b.standsFor(eq, "Na + H₂O → NaOH + H₂ with steppers and the atom table");
    return column([w.title(t("A harder one", "एक कठिन")), eq, goal, space()]);
  },
  { passOn: PassOn.Rules },
);

/** Your turn (NCERT in-text Q2 (ii)); then the mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const { eq, goal } = balanceGoal(
      b,
      "eq",
      "bariumChlorideAluminiumSulphate",
      t(
        "Balance: Barium chloride + Aluminium sulphate → Barium sulphate + Aluminium chloride. Treat SO₄ as one group.",
        "संतुलित करो: बेरियम क्लोराइड + ऐलुमिनियम सल्फ़ेट → बेरियम सल्फ़ेट + ऐलुमिनियम क्लोराइड। SO₄ को एक समूह मानो।",
      ),
    );
    b.standsFor(eq, "BaCl₂ + Al₂(SO₄)₃ → BaSO₄ + AlCl₃ with steppers and the atom table");
    const log = w.definition(
      t(
        "**Mission log.** ✓ Balance with coefficients only, never by changing a formula. ✓ Start with the biggest formula and its biggest atom count, then go element by element, then check. ✓ State symbols (s), (l), (g), (aq), and conditions on the arrow. ✓ The sparkler: 2Mg + O₂ → 2MgO. Next: the whitewash.",
        "**मिशन लॉग।** ✓ केवल गुणांकों से संतुलित करो, सूत्र बदलकर कभी नहीं। ✓ सबसे बड़े सूत्र और उसकी सबसे बड़ी परमाणु-गिनती से शुरू करो, फिर तत्व-दर-तत्व, फिर जाँचो। ✓ अवस्था-प्रतीक (s), (l), (g), (aq), और तीर पर शर्तें। ✓ फुलझड़ी: 2Mg + O₂ → 2MgO। आगे: सफ़ेदी।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(log));
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), eq, goal, log, space()]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [
  hook,
  rule,
  steps,
  states,
  conditions,
  inLife,
  practice1,
  practice2,
  yourTurn,
];

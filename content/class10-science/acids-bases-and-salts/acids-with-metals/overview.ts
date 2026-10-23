import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, goalQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  AcidBenchAction,
  AcidBenchDerived,
  AcidBenchKind,
  AcidSceneKind,
  PhysicalState,
} from "@chalk/prop-chemistry";
import { balanceGoal, benchOn, sceneOn, shownEquation, sp } from "../kit";

const r = String.raw;
const { Solid: s, Liquid: l, Gas: g, Aqueous: aq } = PhysicalState;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** Act 2 needs bubbles: the fizzing volcano and the balloon that fills itself. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const cake = sceneOn(
    b,
    "cake",
    AcidSceneKind.CakeRise,
    "Mom in the kitchen with a cake rising in the oven, Kabir watching bubbles in a glass of vinegar and baking soda",
  );
  return column([
    w.title(t("Act 2 needs bubbles", "करतब 2 को बुलबुले चाहिए")),
    cake,
    w.body(
      t(
        "Act 1 works: the cabbage potions change colour. For Act 2, Riya wants something louder: a **volcano** that fizzes over, and a **gas** that pops when a flame comes near. Kabir drops a spoon of baking soda into vinegar. It foams up the glass.",
        "करतब 1 चल गया: पत्तागोभी के घोल रंग बदलते हैं। करतब 2 के लिए रिया को कुछ और ज़ोरदार चाहिए: एक **ज्वालामुखी** जो उफनकर बहे, और एक **गैस** जो लौ पास आने पर 'पॉप' करे। कबीर सिरके में एक चम्मच खाने का सोडा डालता है। गिलास में झाग भर जाता है।",
      ),
    ),
    w.body(
      t(
        "Stop 2: what do acids do to metals, and to carbonates like baking soda? And what are those bubbles?",
        "पड़ाव 2: अम्ल धातुओं के साथ, और खाने के सोडे जैसे कार्बोनेटों के साथ क्या करते हैं? और वे बुलबुले क्या हैं?",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Activity 2.3: zinc and acid; hydrogen; acid + metal → salt + hydrogen. Salt defined. */
const zinc = page(
  "zinc",
  (b) => {
    const w = wordsOn(b);
    const bench = benchOn(b, "bench", AcidBenchKind.ZincAcid);
    b.standsFor(
      bench,
      "zinc granules in dilute sulphuric acid; the gas bubbles through soap solution and a bubble pops when a candle comes near",
    );
    const goal = goalQuestion(b, {
      about: bench,
      prompt: t(
        "Add the acid, then bring the candle near a soap bubble.",
        "अम्ल डालो, फिर मोमबत्ती को साबुन के एक बुलबुले के पास लाओ।",
      ),
      isMet: bench.derived(AcidBenchDerived.IsDone),
      solve: [bench.learner(AcidBenchAction.Next), bench.learner(AcidBenchAction.Next)],
    });
    const eq = shownEquation(
      b,
      "eq",
      [sp("Zn", s), sp("H2SO4", aq)],
      [sp("ZnSO4", aq), sp("H2", g)],
      {
        showStates: true,
      },
    );
    b.standsFor(eq, "Zn(s) + H₂SO₄(aq) → ZnSO₄(aq) + H₂(g)");
    return column([
      w.title(t("Acids and metals", "अम्ल और धातुएँ")),
      w.body(
        t(
          "NCERT Activity 2.3 (with a teacher). Drop zinc granules into dilute sulphuric acid and lead the gas through soap solution.",
          "NCERT क्रियाकलाप 2.3 (शिक्षक के साथ)। तनु सल्फ़्यूरिक अम्ल में जिंक के दाने डालो और गैस को साबुन के घोल से गुज़ारो।",
        ),
      ),
      bench,
      goal,
      w.body(
        t(
          "A gas that burns with a **pop** is **hydrogen**. The metal has pushed hydrogen out of the acid and taken its place:",
          "जो गैस **'पॉप'** के साथ जले वह **हाइड्रोजन** है। धातु ने अम्ल से हाइड्रोजन को बाहर धकेल कर उसकी जगह ले ली है:",
        ),
      ),
      eq,
      w.definition(
        t(
          "**Salt.** The new compound formed, here zinc sulphate, is called a **salt**: a compound made when the hydrogen of an acid is replaced by a metal. So:",
          "**लवण।** बना नया यौगिक, यहाँ जिंक सल्फ़ेट, **लवण** कहलाता है: वह यौगिक जो तब बनता है जब किसी अम्ल का हाइड्रोजन किसी धातु से बदल जाता है। तो:",
        ),
      ),
      w.body(
        t(
          r`$$\text{Acid} + \text{Metal} \rightarrow \text{Salt} + \text{Hydrogen gas}$$`,
          r`$$\text{अम्ल} + \text{धातु} \rightarrow \text{लवण} + \text{हाइड्रोजन गैस}$$`,
        ),
      ),
      w.note(
        t(
          "Repeat it with hydrochloric, nitric or acetic acid in place of sulphuric acid: you see bubbles of hydrogen every time.",
          "सल्फ़्यूरिक अम्ल की जगह हाइड्रोक्लोरिक, नाइट्रिक या ऐसीटिक अम्ल लो: हर बार हाइड्रोजन के बुलबुले दिखते हैं।",
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Activity 2.4: zinc with sodium hydroxide; sodium zincate; not all metals. */
const zincBase = page(
  "zinc-base",
  (b) => {
    const w = wordsOn(b);
    const bench = benchOn(b, "bench", AcidBenchKind.ZincBase);
    b.standsFor(
      bench,
      "zinc granules warmed with sodium hydroxide solution; the gas pops near a candle",
    );
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "The bubbles from zinc and sodium hydroxide also pop. Which gas is it?",
        "जिंक और सोडियम हाइड्रॉक्साइड के बुलबुले भी 'पॉप' करते हैं। यह कौन-सी गैस है?",
      ),
      options: [
        { id: "right", label: t("Hydrogen", "हाइड्रोजन") },
        {
          id: "o2",
          label: t("Oxygen", "ऑक्सीजन"),
          feedback: t(
            "Oxygen makes a flame burn brighter; it doesn't pop. The pop is hydrogen.",
            "ऑक्सीजन लौ को तेज़ करती है; वह 'पॉप' नहीं करती। 'पॉप' हाइड्रोजन है।",
          ),
        },
        {
          id: "co2",
          label: t("Carbon dioxide", "कार्बन डाइऑक्साइड"),
          feedback: t(
            "Carbon dioxide puts a flame out instead.",
            "कार्बन डाइऑक्साइड तो लौ बुझा देती है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("A metal and a base", "एक धातु और एक क्षारक")),
      w.body(
        t(
          "NCERT Activity 2.4: zinc granules warmed with sodium hydroxide solution.",
          "NCERT क्रियाकलाप 2.4: जिंक के दाने सोडियम हाइड्रॉक्साइड के घोल के साथ गर्म किए गए।",
        ),
      ),
      bench,
      w.body(
        t(
          "Hydrogen again. The other product is **sodium zincate**, Na₂ZnO₂. It too is counted as a salt: lesson 7 shows that salts can form in more ways than one.",
          "फिर हाइड्रोजन। दूसरा उत्पाद **सोडियम ज़िंकेट**, Na₂ZnO₂, है। इसे भी लवण माना जाता है: पाठ 7 दिखाता है कि लवण एक से ज़्यादा तरीक़ों से बन सकते हैं।",
        ),
      ),
      w.body(
        t(
          r`$$\ce{2NaOH(aq) + Zn(s) -> Na2ZnO2(s) + H2(g)}$$`,
          r`$$\ce{2NaOH(aq) + Zn(s) -> Na2ZnO2(s) + H2(g)}$$`,
        ),
      ),
      w.body(
        t(
          "But careful: most metals do **not** react with bases like this. Zinc is one of the few that do.",
          "पर ध्यान दो: ज़्यादातर धातुएँ क्षारकों से ऐसे **नहीं** जुड़तीं। जिंक उन गिनी-चुनी धातुओं में से है जो जुड़ती हैं।",
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Activity 2.5: carbonates and hydrogencarbonates with acid; CO2 through lime water. */
const carbonate = page(
  "carbonate",
  (b) => {
    const w = wordsOn(b);
    const bench = benchOn(b, "bench", AcidBenchKind.CarbonateAcid);
    b.standsFor(
      bench,
      "sodium carbonate and sodium hydrogencarbonate fizzing with dilute hydrochloric acid; the gas bubbles through lime water, which turns milky and then clear again",
    );
    const goal = goalQuestion(b, {
      about: bench,
      prompt: t(
        "Add the acid, then keep the gas bubbling through the lime water.",
        "अम्ल डालो, फिर गैस को चूने के पानी से गुज़रने दो।",
      ),
      isMet: bench.derived(AcidBenchDerived.IsDone),
      solve: [bench.learner(AcidBenchAction.Next), bench.learner(AcidBenchAction.Next)],
    });
    return column([
      w.title(t("Acids and carbonates", "अम्ल और कार्बोनेट")),
      w.definition(
        t(
          "**Carbonate, hydrogencarbonate.** A **carbonate** is a compound containing the group CO₃, like sodium carbonate, Na₂CO₃. A **hydrogencarbonate** contains HCO₃, like sodium hydrogencarbonate, NaHCO₃, which is baking soda. **Lime water** is a clear solution of calcium hydroxide, Ca(OH)₂, in water.",
          "**कार्बोनेट, हाइड्रोजनकार्बोनेट।** **कार्बोनेट** वह यौगिक है जिसमें CO₃ समूह हो, जैसे सोडियम कार्बोनेट, Na₂CO₃। **हाइड्रोजनकार्बोनेट** में HCO₃ होता है, जैसे सोडियम हाइड्रोजनकार्बोनेट, NaHCO₃, जो खाने का सोडा है। **चूने का पानी** पानी में कैल्सियम हाइड्रॉक्साइड, Ca(OH)₂, का साफ़ घोल है।",
        ),
      ),
      w.body(
        t(
          "NCERT Activity 2.5: dilute hydrochloric acid on each, and the gas led through lime water.",
          "NCERT क्रियाकलाप 2.5: हर एक पर तनु हाइड्रोक्लोरिक अम्ल, और गैस को चूने के पानी से गुज़ारा गया।",
        ),
      ),
      bench,
      goal,
      w.body(
        t("Both fizz and give **carbon dioxide**:", "दोनों सनसनाते हैं और **कार्बन डाइऑक्साइड** देते हैं:"),
      ),
      w.body(
        t(
          r`$$\begin{aligned}&\ce{Na2CO3 + 2HCl -> 2NaCl + H2O + CO2}\\&\ce{NaHCO3 + HCl -> NaCl + H2O + CO2}\end{aligned}$$`,
          r`$$\begin{aligned}&\ce{Na2CO3 + 2HCl -> 2NaCl + H2O + CO2}\\&\ce{NaHCO3 + HCl -> NaCl + H2O + CO2}\end{aligned}$$`,
        ),
      ),
      w.body(
        t(
          "Carbon dioxide turns lime water **milky**, because insoluble calcium carbonate forms:",
          "कार्बन डाइऑक्साइड चूने के पानी को **दूधिया** कर देती है, क्योंकि अघुलनशील कैल्सियम कार्बोनेट बनता है:",
        ),
      ),
      w.body(t(r`$$\ce{Ca(OH)2 + CO2 -> CaCO3 + H2O}$$`, r`$$\ce{Ca(OH)2 + CO2 -> CaCO3 + H2O}$$`)),
      w.body(
        t(
          "Keep bubbling and the milkiness **clears**: the extra carbon dioxide turns it into calcium hydrogencarbonate, which dissolves:",
          "गैस गुज़ारते रहो तो दूधियापन **साफ़** हो जाता है: अतिरिक्त कार्बन डाइऑक्साइड उसे कैल्सियम हाइड्रोजनकार्बोनेट में बदल देती है, जो घुल जाता है:",
        ),
      ),
      w.body(
        t(r`$$\ce{CaCO3 + H2O + CO2 -> Ca(HCO3)2}$$`, r`$$\ce{CaCO3 + H2O + CO2 -> Ca(HCO3)2}$$`),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The general rule, and limestone, chalk and marble. */
const rule = page(
  "rule",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "A piece of marble is dropped into dilute hydrochloric acid. What do you see?",
        "संगमरमर का एक टुकड़ा तनु हाइड्रोक्लोरिक अम्ल में डाला जाता है। क्या दिखता है?",
      ),
      options: [
        {
          id: "right",
          label: t("Fizzing: carbon dioxide is given off", "सनसनाहट: कार्बन डाइऑक्साइड निकलती है"),
        },
        {
          id: "nothing",
          label: t(
            "Nothing: marble is a stone and doesn't react",
            "कुछ नहीं: संगमरमर पत्थर है और अभिक्रिया नहीं करता",
          ),
          feedback: t(
            "Marble is calcium carbonate, and every carbonate reacts with acids.",
            "संगमरमर कैल्सियम कार्बोनेट है, और हर कार्बोनेट अम्लों से अभिक्रिया करता है।",
          ),
        },
        {
          id: "h2",
          label: t("Bubbles of hydrogen that pop", "हाइड्रोजन के बुलबुले जो पॉप करते हैं"),
          feedback: t(
            "Hydrogen comes from metals. A carbonate gives carbon dioxide.",
            "हाइड्रोजन धातुओं से आती है। कार्बोनेट कार्बन डाइऑक्साइड देता है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Every carbonate does it", "हर कार्बोनेट ऐसा करता है")),
      w.body(
        t(
          "All metal carbonates and metal hydrogencarbonates react with acids the same way:",
          "सभी धातु कार्बोनेट और धातु हाइड्रोजनकार्बोनेट अम्लों से एक ही तरह अभिक्रिया करते हैं:",
        ),
      ),
      w.body(
        t(
          r`$$\begin{aligned}&\text{Metal carbonate or hydrogencarbonate} + \text{Acid}\\&\quad \rightarrow \text{Salt} + \text{Carbon dioxide} + \text{Water}\end{aligned}$$`,
          r`$$\begin{aligned}&\text{धातु कार्बोनेट या हाइड्रोजनकार्बोनेट} + \text{अम्ल}\\&\quad \rightarrow \text{लवण} + \text{कार्बन डाइऑक्साइड} + \text{जल}\end{aligned}$$`,
        ),
      ),
      w.body(
        t(
          "**Limestone**, **chalk** and **marble** are all forms of the same carbonate: calcium carbonate, CaCO₃.",
          "**चूना पत्थर**, **खड़िया** और **संगमरमर** सब एक ही कार्बोनेट के रूप हैं: कैल्सियम कार्बोनेट, CaCO₃।",
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

/** The volcano and the popping balloon, explained; egg shells (Exercise 2). */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "Kabir's volcano: baking soda + vinegar. What gas makes the foam?",
        "कबीर का ज्वालामुखी: खाने का सोडा + सिरका। झाग कौन-सी गैस बनाती है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Carbon dioxide: vinegar is an acid, baking soda is a hydrogencarbonate",
            "कार्बन डाइऑक्साइड: सिरका एक अम्ल है, खाने का सोडा हाइड्रोजनकार्बोनेट",
          ),
        },
        {
          id: "h2",
          label: t("Hydrogen", "हाइड्रोजन"),
          feedback: t(
            "There's no metal here. Acid + hydrogencarbonate gives carbon dioxide.",
            "यहाँ कोई धातु नहीं है। अम्ल + हाइड्रोजनकार्बोनेट कार्बन डाइऑक्साइड देता है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const eggs = choiceQuestion(b, {
      name: "eggs",
      prompt: t(
        "NCERT Exercise 2. A solution reacts with crushed egg shells to give a gas that turns lime water milky. The solution contains:",
        "NCERT अभ्यास 2। एक विलयन पिसे अंडे के छिलकों से अभिक्रिया करके ऐसी गैस देता है जो चूने के पानी को दूधिया कर देती है। विलयन में है:",
      ),
      options: [
        { id: "right", label: t("HCl", "HCl") },
        {
          id: "nacl",
          label: t("NaCl", "NaCl"),
          feedback: t(
            "NaCl is a salt, not an acid. Egg shell is calcium carbonate: it needs an acid to give carbon dioxide.",
            "NaCl लवण है, अम्ल नहीं। अंडे का छिलका कैल्सियम कार्बोनेट है: कार्बन डाइऑक्साइड देने के लिए उसे अम्ल चाहिए।",
          ),
        },
        {
          id: "kcl",
          label: t("KCl", "KCl"),
          feedback: t(
            "KCl is a salt, not an acid. Only an acid frees carbon dioxide from a carbonate.",
            "KCl लवण है, अम्ल नहीं। कार्बोनेट से कार्बन डाइऑक्साइड केवल अम्ल निकालता है।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const both = w.body(
      t(
        "So Act 2 has two parts. The **volcano**: baking soda and vinegar give carbon dioxide foam. The **pop**: zinc pieces in dilute acid give hydrogen. Riya will leave that one to Grandpa, with the window open.",
        "तो करतब 2 के दो हिस्से हैं। **ज्वालामुखी**: खाने का सोडा और सिरका कार्बन डाइऑक्साइड का झाग देते हैं। **'पॉप'**: तनु अम्ल में जिंक के टुकड़े हाइड्रोजन देते हैं। वह हिस्सा रिया दादाजी पर छोड़ेगी, खिड़की खोलकर।",
      ),
      "both",
      { isHidden: true },
    );
    b.when(ask.on(QuestionSignal.Correct), theBoard.show(eggs));
    b.when(eggs.on(QuestionSignal.Correct), [theBoard.show(both), theBoard.pass()]);
    return column([
      w.title(t("The volcano, explained", "ज्वालामुखी, समझाया गया")),
      ask,
      eggs,
      both,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** NCERT Exercise 5: balance an acid + metal equation (one goal per page). */
function balancePage(
  name: string,
  title: ReturnType<typeof t>,
  left: ReturnType<typeof sp>[],
  right: ReturnType<typeof sp>[],
  prompt: ReturnType<typeof t>,
) {
  return page(
    name,
    (b) => {
      const w = wordsOn(b);
      const { eq, goal } = balanceGoal(b, "eq", left, right, prompt);
      return column([
        w.title(title),
        w.body(
          t(
            "Acid + Metal → Salt + Hydrogen. The formulae are given: change only the numbers in front.",
            "अम्ल + धातु → लवण + हाइड्रोजन। सूत्र दिए हैं: केवल आगे की संख्याएँ बदलो।",
          ),
        ),
        eq,
        goal,
        space(),
      ]);
    },
    { passOn: PassOn.Rules },
  );
}

const balanceMg = balancePage(
  "balance-mg",
  t("Balance it: magnesium", "संतुलित करो: मैग्नीशियम"),
  [sp("Mg"), sp("HCl")],
  [sp("MgCl2"), sp("H2")],
  t(
    "Exercise 5(b): magnesium ribbon with dilute hydrochloric acid. Balance it.",
    "अभ्यास 5(b): तनु हाइड्रोक्लोरिक अम्ल के साथ मैग्नीशियम रिबन। संतुलित करो।",
  ),
);

const balanceAl = balancePage(
  "balance-al",
  t("Balance it: aluminium", "संतुलित करो: ऐलुमिनियम"),
  [sp("Al"), sp("H2SO4")],
  [sp("Al2(SO4)3"), sp("H2")],
  t(
    "Exercise 5(c): aluminium powder with dilute sulphuric acid. Balance it.",
    "अभ्यास 5(c): तनु सल्फ़्यूरिक अम्ल के साथ ऐलुमिनियम चूर्ण। संतुलित करो।",
  ),
);

/** NCERT in-text Q2 and Q3; then the mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const ask1 = choiceQuestion(b, {
      name: "ask1",
      prompt: t(
        "Metal compound A fizzes with dilute hydrochloric acid. The gas puts out a burning candle, and one product is calcium chloride. What is A?",
        "धातु यौगिक A तनु हाइड्रोक्लोरिक अम्ल के साथ सनसनाता है। गैस जलती मोमबत्ती बुझा देती है, और एक उत्पाद कैल्सियम क्लोराइड है। A क्या है?",
      ),
      options: [
        { id: "right", label: t("Calcium carbonate, CaCO₃", "कैल्सियम कार्बोनेट, CaCO₃") },
        {
          id: "ca",
          label: t("Calcium metal, Ca", "कैल्सियम धातु, Ca"),
          feedback: t(
            "A metal gives hydrogen, which pops. A gas that puts the flame out is carbon dioxide, so A is a carbonate.",
            "धातु हाइड्रोजन देती है, जो 'पॉप' करती है। लौ बुझाने वाली गैस कार्बन डाइऑक्साइड है, तो A कार्बोनेट है।",
          ),
        },
        {
          id: "cao",
          label: t("Calcium oxide, CaO", "कैल्सियम ऑक्साइड, CaO"),
          feedback: t(
            "An oxide gives no gas with acid. The gas means a carbonate.",
            "ऑक्साइड अम्ल के साथ कोई गैस नहीं देता। गैस का अर्थ है कार्बोनेट।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const caco3 = balanceGoal(
      b,
      "caco3",
      [sp("CaCO3"), sp("HCl")],
      [sp("CaCl2"), sp("H2O"), sp("CO2")],
      t("Now balance its equation.", "अब इसका समीकरण संतुलित करो।"),
    );
    const log = w.definition(
      t(
        "**Mission log.** ✓ Acid + metal → salt + hydrogen (it pops). ✓ Acid + carbonate or hydrogencarbonate → salt + carbon dioxide + water (it turns lime water milky). ✓ Act 2, the volcano: ready. Next: acids and bases cancelling each other, and Grandpa's acidity.",
        "**मिशन लॉग।** ✓ अम्ल + धातु → लवण + हाइड्रोजन ('पॉप' करती है)। ✓ अम्ल + कार्बोनेट या हाइड्रोजनकार्बोनेट → लवण + कार्बन डाइऑक्साइड + जल (चूने के पानी को दूधिया करती है)। ✓ करतब 2, ज्वालामुखी: तैयार। आगे: अम्ल और क्षारक एक-दूसरे का असर मिटाना, और दादाजी की एसिडिटी।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(caco3.goal.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([
      w.title(t("Your turn", "अब तुम्हारी बारी")),
      ask1,
      caco3.eq,
      caco3.goal,
      log,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

void l;

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [
  hook,
  zinc,
  zincBase,
  carbonate,
  rule,
  inLife,
  balanceMg,
  balanceAl,
  yourTurn,
];

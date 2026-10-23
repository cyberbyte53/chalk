import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import { BenchKind, ChemistrySceneKind, chemistrySceneDef } from "@chalk/prop-chemistry";
import { benchOn, equationOn } from "../kit";

const r = String.raw;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** The sparkler packet, and Riya's very long sentence. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const spark = b.prop(chemistrySceneDef, "spark", { scene: ChemistrySceneKind.Sparkler });
  b.standsFor(
    spark,
    "Kabir at night holding a sparkler that burns with a blinding white star of light",
  );
  return column([
    w.title(t("A very long sentence", "एक बहुत लंबा वाक्य")),
    spark,
    w.body(
      t(
        'Kabir bought the sparklers. Grandpa reads the packet: the white light comes from **magnesium**, the same metal that burned in the lab. Riya writes in her notebook: "When magnesium burns in the oxygen of the air, it turns into a white powder called magnesium oxide." Grandpa shakes his head: "Chemists write that in one short line. And the line tells you even more than your sentence."',
        'कबीर फुलझड़ियाँ ले आया। दादाजी पैकेट पढ़ते हैं: सफ़ेद रोशनी **मैग्नीशियम** से आती है, वही धातु जो प्रयोगशाला में जली थी। रिया अपनी कॉपी में लिखती है: "जब मैग्नीशियम हवा की ऑक्सीजन में जलता है, तो वह मैग्नीशियम ऑक्साइड नामक सफ़ेद चूर्ण में बदल जाता है।" दादाजी सिर हिलाते हैं: "रसायनज्ञ इसे एक छोटी पंक्ति में लिखते हैं। और वह पंक्ति तुम्हारे वाक्य से भी ज़्यादा बताती है।"',
      ),
    ),
    w.body(
      t(
        "Stop 2: how do we write a reaction down, short and exact?",
        "पड़ाव 2: अभिक्रिया को छोटा और सटीक कैसे लिखें?",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** The word equation: reactants, products, the arrow. */
const words = page(
  "words",
  (b) => {
    const w = wordsOn(b);
    const zinc = benchOn(b, "zinc", BenchKind.ZincAcid);
    b.standsFor(zinc, "zinc granules in dilute sulphuric acid giving bubbles of hydrogen");
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "Zinc + Sulphuric acid → Zinc sulphate + Hydrogen. Which are the reactants?",
        "जिंक + सल्फ़्यूरिक अम्ल → जिंक सल्फ़ेट + हाइड्रोजन। अभिकारक कौन-से हैं?",
      ),
      options: [
        { id: "right", label: t("Zinc and sulphuric acid", "जिंक और सल्फ़्यूरिक अम्ल") },
        {
          id: "products",
          label: t("Zinc sulphate and hydrogen", "जिंक सल्फ़ेट और हाइड्रोजन"),
          feedback: t(
            "Those are on the right of the arrow, where the arrow points: they are the products, made by the reaction.",
            "ये तीर के दाईं ओर हैं, जिधर तीर इशारा करता है: ये उत्पाद हैं, अभिक्रिया से बने।",
          ),
        },
        {
          id: "hydrogen",
          label: t("Only hydrogen", "केवल हाइड्रोजन"),
          feedback: t(
            "Hydrogen is the gas that comes out: it's a product.",
            "हाइड्रोजन वह गैस है जो निकलती है: वह उत्पाद है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("The word equation", "शब्द-समीकरण")),
      w.body(
        t(
          "The simplest short form keeps the names and drops everything else:",
          "सबसे सरल छोटा रूप नाम रखता है और बाक़ी सब हटा देता है:",
        ),
      ),
      w.body(
        t(
          "$$\\text{Magnesium} + \\text{Oxygen} \\rightarrow \\text{Magnesium oxide}$$",
          "$$\\text{मैग्नीशियम} + \\text{ऑक्सीजन} \\rightarrow \\text{मैग्नीशियम ऑक्साइड}$$",
        ),
      ),
      w.definition(
        t(
          '**Reactants, products, word equation.** The substances that change in a reaction are the **reactants**. The new substances formed are the **products**. A **word equation** writes the reactants on the **left-hand side (LHS)** and the products on the **right-hand side (RHS)**, with a **+** between substances on the same side. The **arrow** points towards the products: it shows the direction of the reaction. Read it as "gives" or "turns into".',
          '**अभिकारक, उत्पाद, शब्द-समीकरण।** अभिक्रिया में जो पदार्थ बदलते हैं वे **अभिकारक** हैं। जो नए पदार्थ बनते हैं वे **उत्पाद** हैं। **शब्द-समीकरण** अभिकारकों को **बाएँ पक्ष (LHS)** पर और उत्पादों को **दाएँ पक्ष (RHS)** पर लिखता है, एक ही पक्ष के पदार्थों के बीच **+** के साथ। **तीर** उत्पादों की ओर इशारा करता है: यह अभिक्रिया की दिशा दिखाता है। इसे "देता है" या "में बदलता है" पढ़ो।',
        ),
      ),
      w.body(
        t(
          "The zinc and acid from the last lesson, once more. Watch it, then read its word equation in the question.",
          "पिछले पाठ के जिंक और अम्ल, एक बार फिर। इसे देखो, फिर प्रश्न में इसका शब्द-समीकरण पढ़ो।",
        ),
      ),
      zinc,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Formulae in place of words: a chemical equation. Counting atoms. */
const formulae = page(
  "formulae",
  (b) => {
    const w = wordsOn(b);
    const mg = equationOn(b, "mg", "magnesiumBurns", { showTally: true, showMolecules: true });
    b.standsFor(
      mg,
      "Mg + O₂ → MgO with each molecule drawn as balls and a table counting atoms: Mg 1 and 1, O 2 on the left and 1 on the right",
    );
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        r`In $\ce{Mg + O2 -> MgO}$, how many oxygen atoms are on each side?`,
        r`$\ce{Mg + O2 -> MgO}$ में हर पक्ष पर कितने ऑक्सीजन परमाणु हैं?`,
      ),
      options: [
        { id: "right", label: t("2 on the left, 1 on the right", "बाईं ओर 2, दाईं ओर 1") },
        {
          id: "same",
          label: t("1 on each side, one in each formula", "दोनों ओर 1, हर सूत्र में एक"),
          feedback: t(
            r`The little 2 in $\ce{O2}$ means two oxygen atoms joined in one molecule.`,
            r`$\ce{O2}$ में छोटा 2 मतलब एक अणु में जुड़े दो ऑक्सीजन परमाणु।`,
          ),
        },
        {
          id: "two",
          label: t("2 on each side: it's already balanced", "दोनों ओर 2: पहले से संतुलित है"),
          feedback: t(
            r`$\ce{MgO}$ has no number after O, so it holds only one oxygen atom.`,
            r`$\ce{MgO}$ में O के बाद कोई संख्या नहीं, इसलिए उसमें केवल एक ऑक्सीजन परमाणु है।`,
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Formulae instead of words", "शब्दों की जगह सूत्र")),
      w.body(
        t(
          "Swap each name for its formula and the word equation becomes a **chemical equation**. Oxygen in air exists as molecules of two atoms, so it is written O₂:",
          "हर नाम की जगह उसका सूत्र रखो और शब्द-समीकरण एक **रासायनिक समीकरण** बन जाता है। हवा में ऑक्सीजन दो परमाणुओं वाले अणुओं के रूप में होती है, इसलिए उसे O₂ लिखते हैं:",
        ),
      ),
      w.body(t(r`$$\ce{Mg + O2 -> MgO}$$`, r`$$\ce{Mg + O2 -> MgO}$$`)),
      w.definition(
        t(
          "**Chemical equation.** A chemical equation represents a reaction with the **formulae** of the reactants and products. Because formulae count atoms, an equation lets you check what happened to every atom.",
          "**रासायनिक समीकरण।** रासायनिक समीकरण अभिकारकों और उत्पादों के **सूत्रों** से अभिक्रिया दिखाता है। क्योंकि सूत्र परमाणु गिनते हैं, समीकरण से तुम हर परमाणु का हिसाब जाँच सकते हो।",
        ),
      ),
      w.body(
        t(
          "Below, each molecule is drawn as atoms, and the table counts the atoms of each element on the left and on the right.",
          "नीचे हर अणु परमाणुओं के रूप में बना है, और तालिका हर तत्व के परमाणु बाईं और दाईं ओर गिनती है।",
        ),
      ),
      mg,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Conservation of mass: atoms in = atoms out. Balanced and skeletal equations. */
const mass = page(
  "mass",
  (b) => {
    const w = wordsOn(b);
    const zn = equationOn(b, "zn", "zincSulphuricAcid", { showTally: true });
    b.standsFor(
      zn,
      "Zn + H₂SO₄ → ZnSO₄ + H₂ with the atom table: Zn 1 and 1, H 2 and 2, S 1 and 1, O 4 and 4, all equal",
    );
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(r`So which of these is a skeletal equation?`, r`तो इनमें से कौन-सा कंकाली समीकरण है?`),
      options: [
        { id: "right", label: t(r`$\ce{Mg + O2 -> MgO}$`, r`$\ce{Mg + O2 -> MgO}$`) },
        {
          id: "zn",
          label: t(r`$\ce{Zn + H2SO4 -> ZnSO4 + H2}$`, r`$\ce{Zn + H2SO4 -> ZnSO4 + H2}$`),
          feedback: t(
            "Check the table above: every element has the same count on both sides. This one is already balanced.",
            "ऊपर की तालिका देखो: हर तत्व की गिनती दोनों ओर बराबर है। यह पहले से संतुलित है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("No atom is lost", "कोई परमाणु खोता नहीं")),
      w.definition(
        t(
          "**Law of conservation of mass.** Mass can neither be created nor destroyed in a chemical reaction. The total mass of the products equals the total mass of the reactants. In atoms: a reaction only changes which atoms are joined to which. **The number of atoms of each element stays the same** before and after.",
          "**द्रव्यमान संरक्षण का नियम।** रासायनिक अभिक्रिया में द्रव्यमान न बनाया जा सकता है न नष्ट किया जा सकता है। उत्पादों का कुल द्रव्यमान अभिकारकों के कुल द्रव्यमान के बराबर होता है। परमाणुओं में: अभिक्रिया केवल यह बदलती है कि कौन-सा परमाणु किससे जुड़ा है। **हर तत्व के परमाणुओं की संख्या** पहले और बाद में **वही रहती है**।",
        ),
      ),
      w.definition(
        t(
          "**Balanced and skeletal equations.** If every element has the same number of atoms on both sides, the equation is **balanced**. If not, it is unbalanced: it names the right substances but breaks the law of conservation of mass. Such an unbalanced equation is called a **skeletal** chemical equation.",
          "**संतुलित और कंकाली समीकरण।** यदि हर तत्व के परमाणु दोनों ओर बराबर हों, तो समीकरण **संतुलित** है। नहीं तो वह असंतुलित है: वह सही पदार्थों के नाम देता है पर द्रव्यमान संरक्षण का नियम तोड़ता है। ऐसे असंतुलित समीकरण को **कंकाली** रासायनिक समीकरण कहते हैं।",
        ),
      ),
      w.body(
        t(
          "The zinc reaction as an equation. Count the table:",
          "जिंक की अभिक्रिया समीकरण के रूप में। तालिका गिनो:",
        ),
      ),
      zn,
      w.body(
        t(
          "Every element matches, so this equation is balanced as written. The magnesium one had 2 oxygen atoms on the left and only 1 on the right.",
          "हर तत्व मेल खाता है, इसलिए यह समीकरण जैसा लिखा है वैसा ही संतुलित है। मैग्नीशियम वाले में बाईं ओर 2 ऑक्सीजन परमाणु थे और दाईं ओर केवल 1।",
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

/** Riya's line for the sparkler, and Kabir's objection. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const mg = equationOn(b, "mg", "magnesiumBurns", { showTally: true });
    b.standsFor(
      mg,
      "Riya's line Mg + O₂ → MgO with the atom count showing 2 oxygen atoms on the left, 1 on the right",
    );
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        'Kabir: "One oxygen atom has vanished!" What really happened to it?',
        'कबीर: "एक ऑक्सीजन परमाणु ग़ायब हो गया!" असल में उसका क्या हुआ?',
      ),
      options: [
        {
          id: "right",
          label: t(
            "Nothing vanished: the line is skeletal and still needs balancing",
            "कुछ ग़ायब नहीं हुआ: पंक्ति कंकाली है और अभी संतुलित करनी है",
          ),
        },
        {
          id: "burnt",
          label: t("It burnt away in the flame", "वह लौ में जल गया"),
          feedback: t(
            "Atoms can't be burnt away: mass is conserved. The line just doesn't show enough magnesium oxide yet.",
            "परमाणु जलकर ख़त्म नहीं होते: द्रव्यमान संरक्षित रहता है। पंक्ति अभी पर्याप्त मैग्नीशियम ऑक्साइड नहीं दिखाती।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const stop = w.definition(
      t(
        "**Stop 2 done.** A reaction can be written as a word equation, and better as a chemical equation with formulae. Riya's sparkler line names the right substances, but it is skeletal. Next stop: how to balance it, without changing any formula.",
        "**पड़ाव 2 पूरा।** अभिक्रिया को शब्द-समीकरण में, और बेहतर, सूत्रों वाले रासायनिक समीकरण में लिखा जा सकता है। रिया की फुलझड़ी वाली पंक्ति सही पदार्थों के नाम देती है, पर कंकाली है। अगला पड़ाव: बिना कोई सूत्र बदले उसे संतुलित कैसे करें।",
      ),
      "stop",
      { isHidden: true },
    );
    b.when(ask.on(QuestionSignal.Correct), [theBoard.show(stop), theBoard.pass()]);
    return column([
      w.title(t("The sparkler in one line", "फुलझड़ी एक पंक्ति में")),
      w.body(
        t(
          "Riya rewrites her long sentence as one line, and Kabir counts the atoms.",
          "रिया अपना लंबा वाक्य एक पंक्ति में फिर से लिखती है, और कबीर परमाणु गिनता है।",
        ),
      ),
      mg,
      ask,
      stop,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Counting atoms in a formula, with brackets. */
const example = page("example", (b) => {
  const w = wordsOn(b);
  const lime = equationOn(b, "lime", "quickLimeWater", { showTally: true, showMolecules: true });
  b.standsFor(
    lime,
    "CaO + H₂O → Ca(OH)₂ with the molecules drawn and the atom table: Ca 1 and 1, O 2 and 2, H 2 and 2",
  );
  return column([
    w.title(t("Example: counting atoms", "उदाहरण: परमाणु गिनना")),
    w.body(
      t(
        r`**How many atoms of each element are in slaked lime, $\ce{Ca(OH)2}$?**`,
        r`**बुझे चूने, $\ce{Ca(OH)2}$, में हर तत्व के कितने परमाणु हैं?**`,
      ),
    ),
    w.body(
      t(
        "A number after a bracket multiplies everything inside it. OH appears twice:",
        "कोष्ठक के बाद की संख्या उसके अंदर की हर चीज़ को गुणा करती है। OH दो बार आता है:",
      ),
    ),
    w.body(
      t(
        r`$$\ce{Ca(OH)2} = \ce{Ca} + 2\times\ce{O} + 2\times\ce{H}$$`,
        r`$$\ce{Ca(OH)2} = \ce{Ca} + 2\times\ce{O} + 2\times\ce{H}$$`,
      ),
    ),
    w.body(
      t(
        "So 1 calcium, 2 oxygen and 2 hydrogen atoms. This is the whitewash reaction from Mom's list: quick lime and water give slaked lime. The table shows it is balanced as written.",
        "तो 1 कैल्शियम, 2 ऑक्सीजन और 2 हाइड्रोजन परमाणु। यह मम्मी की सूची वाली सफ़ेदी की अभिक्रिया है: बिना बुझा चूना और पानी बुझा चूना देते हैं। तालिका दिखाती है कि यह जैसा लिखा है वैसा ही संतुलित है।",
      ),
    ),
    lime,
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
        r`How many oxygen atoms are in $\ce{H2SO4}$?`,
        r`$\ce{H2SO4}$ में कितने ऑक्सीजन परमाणु हैं?`,
      ),
      options: [
        { id: "right", label: t("4", "4") },
        {
          id: "one",
          label: t("1", "1"),
          feedback: t("The 4 after O counts oxygen atoms.", "O के बाद का 4 ऑक्सीजन परमाणु गिनता है।"),
        },
        {
          id: "seven",
          label: t("7", "7"),
          feedback: t(
            "7 is all the atoms together (2 H + 1 S + 4 O). Count only oxygen.",
            "7 सारे परमाणु मिलाकर हैं (2 H + 1 S + 4 O)। केवल ऑक्सीजन गिनो।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const ask2 = choiceQuestion(b, {
      name: "ask2",
      prompt: t(r`Is $\ce{H2 + Cl2 -> HCl}$ balanced?`, r`क्या $\ce{H2 + Cl2 -> HCl}$ संतुलित है?`),
      options: [
        {
          id: "right",
          label: t(
            "No: 2 H and 2 Cl on the left, only 1 of each on the right",
            "नहीं: बाईं ओर 2 H और 2 Cl, दाईं ओर हर एक का केवल 1",
          ),
        },
        {
          id: "yes",
          label: t("Yes: the same substances appear on both sides", "हाँ: दोनों ओर वही पदार्थ हैं"),
          feedback: t(
            "The substances are different on each side. What must match is the count of each atom.",
            "दोनों ओर पदार्थ अलग हैं। जो मेल खाना चाहिए वह हर परमाणु की गिनती है।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ Reactants on the left, products on the right, an arrow between. ✓ Formulae count atoms, and atoms are never created or destroyed. ✓ An equation with unequal counts is skeletal. ✗ Riya's sparkler line is skeletal. Next: balancing it.",
        "**मिशन लॉग।** ✓ अभिकारक बाईं ओर, उत्पाद दाईं ओर, बीच में तीर। ✓ सूत्र परमाणु गिनते हैं, और परमाणु कभी न बनते हैं न नष्ट होते हैं। ✓ असमान गिनती वाला समीकरण कंकाली है। ✗ रिया की फुलझड़ी वाली पंक्ति कंकाली है। आगे: उसे संतुलित करना।",
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
export const overview = [hook, words, formulae, mass, inLife, example, yourTurn];

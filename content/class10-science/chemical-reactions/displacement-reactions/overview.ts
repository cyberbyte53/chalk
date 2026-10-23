import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import { BenchKind, SwapAction, SwapKind, particleSwapDef } from "@chalk/prop-chemistry";
import { balanceGoal, benchOn, equationOn } from "../kit";

const r = String.raw;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const jar = benchOn(b, "jar", BenchKind.IronNailCopperSulphate);
  b.standsFor(
    jar,
    "two test tubes of blue copper sulphate solution, iron nails hanging in one of them, and a clean nail kept aside",
  );
  return column([
    w.title(t("The nail in the blue jar", "नीले जार में कील")),
    w.body(
      t(
        "Before the rusty gate, Kabir finds Grandpa's jar of **neela thotha** on the terrace: blue copper sulphate crystals dissolved in water, which Grandpa sprays on his plants to stop fungus. Kabir drops a couple of clean iron nails in, just to see. Twenty minutes later the nails have a brown coat and the blue has gone paler. Press start to see what he saw.",
        "ज़ंग लगे गेट से पहले, कबीर को छत पर दादाजी का **नीला थोथा** वाला जार मिलता है: पानी में घुले नीले कॉपर सल्फ़ेट के क्रिस्टल, जिसे दादाजी फफूँद रोकने के लिए पौधों पर छिड़कते हैं। कबीर बस देखने के लिए उसमें लोहे की दो साफ़ कीलें डाल देता है। बीस मिनट बाद कीलों पर भूरी परत है और नीला रंग फीका पड़ गया है। उसने जो देखा, वह देखने के लिए शुरू दबाओ।",
      ),
    ),
    jar,
    w.body(
      t(
        "Stop 6: where did the brown coat come from, and where did the blue go?",
        "पड़ाव 6: भूरी परत कहाँ से आई, और नीला रंग कहाँ गया?",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Activity 1.9 explained: iron displaces copper. */
const displace = page(
  "displace",
  (b) => {
    const w = wordsOn(b);
    const atoms = b.prop(particleSwapDef, "atoms", {
      kind: SwapKind.Displacement,
      step: 0,
      canStep: true,
      showEquation: true,
      captions: [
        t(
          "An iron atom, and copper sulphate in solution.",
          "एक लोहे का परमाणु, और विलयन में कॉपर सल्फ़ेट।",
        ),
        t("Iron pushes copper out of its place…", "लोहा कॉपर को उसकी जगह से धकेलता है…"),
        t(
          "…iron sulphate stays in solution, copper metal is left on the nail.",
          "…आयरन सल्फ़ेट विलयन में रहता है, कॉपर धातु कील पर रह जाती है।",
        ),
      ],
    });
    b.studentOnly(atoms.action(SwapAction.Next));
    b.standsFor(
      atoms,
      "an iron atom and a copper sulphate unit drawn as balls; iron takes copper's place next to the sulphate, and a copper atom is left on its own",
    );
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "Why does the blue colour of the copper sulphate solution fade?",
        "कॉपर सल्फ़ेट विलयन का नीला रंग फीका क्यों पड़ता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Blue copper sulphate is replaced by pale green iron sulphate",
            "नीला कॉपर सल्फ़ेट हल्के हरे आयरन सल्फ़ेट से बदल जाता है",
          ),
        },
        {
          id: "rust",
          label: t(
            "Brown rust from the nail is mixing into the blue solution",
            "कील का भूरा ज़ंग नीले विलयन में मिल रहा है",
          ),
          feedback: t(
            "The brown coat isn't rust: it's copper metal. The solution changes because its substance changes.",
            "भूरी परत ज़ंग नहीं है: वह कॉपर धातु है। विलयन बदलता है क्योंकि उसका पदार्थ बदलता है।",
          ),
        },
        {
          id: "water",
          label: t(
            "The iron nail slowly soaks the blue colour out of the solution",
            "लोहे की कील धीरे-धीरे विलयन का नीला रंग सोख लेती है",
          ),
          feedback: t(
            "Iron doesn't soak up colour. A reaction is changing what's dissolved.",
            "लोहा रंग नहीं सोखता। एक अभिक्रिया घुले पदार्थ को बदल रही है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("One element pushes another out", "एक तत्व दूसरे को बाहर धकेलता है")),
      w.body(
        t(
          "This is NCERT Activity 1.9. The brown coat on the nail is **copper metal**. It came out of the copper sulphate, and iron went in to take its place:",
          "यह NCERT क्रियाकलाप 1.9 है। कील पर भूरी परत **कॉपर धातु** है। वह कॉपर सल्फ़ेट से निकली, और लोहा उसकी जगह लेने अंदर गया:",
        ),
      ),
      w.body(
        t(
          r`$$\ce{Fe(s) + CuSO4(aq) -> FeSO4(aq) + Cu(s)}$$`,
          r`$$\ce{Fe(s) + CuSO4(aq) -> FeSO4(aq) + Cu(s)}$$`,
        ),
      ),
      w.definition(
        t(
          "**Displacement reaction.** A reaction in which an element **displaces** (removes and takes the place of) another element from its compound is a **displacement reaction**.",
          "**विस्थापन अभिक्रिया।** वह अभिक्रिया जिसमें एक तत्व दूसरे तत्व को उसके यौगिक से **विस्थापित** करता है (हटाकर उसकी जगह लेता है), **विस्थापन अभिक्रिया** है।",
        ),
      ),
      atoms,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Which metal wins: more reactive displaces less reactive. */
const reactive = page(
  "reactive",
  (b) => {
    const w = wordsOn(b);
    const zinc = equationOn(b, "zinc", "zincCopperSulphate", {
      balanced: true,
      showStates: true,
      showTally: false,
    });
    b.standsFor(zinc, "Zn(s) + CuSO₄(aq) → ZnSO₄(aq) + Cu(s)");
    const lead = equationOn(b, "lead", "leadCopperChloride", {
      balanced: true,
      showStates: true,
      showTally: false,
    });
    b.standsFor(lead, "Pb(s) + CuCl₂(aq) → PbCl₂(aq) + Cu(s)");
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "A copper wire is dipped in iron sulphate solution. What happens?",
        "ताँबे का तार आयरन सल्फ़ेट विलयन में डुबोया जाता है। क्या होता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Nothing: copper is less reactive than iron, so it can't displace it",
            "कुछ नहीं: ताँबा लोहे से कम क्रियाशील है, इसलिए उसे विस्थापित नहीं कर सकता",
          ),
        },
        {
          id: "iron",
          label: t("Iron comes out on the wire", "तार पर लोहा निकल आता है"),
          feedback: t(
            "That would need copper to be more reactive than iron. It's the other way round: iron displaced copper.",
            "इसके लिए ताँबे को लोहे से ज़्यादा क्रियाशील होना पड़ता। उल्टा है: लोहे ने ताँबे को विस्थापित किया।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Which metal wins?", "कौन-सी धातु जीतती है?")),
      w.body(t("Zinc and lead displace copper too:", "जिंक और लेड भी ताँबे को विस्थापित करते हैं:")),
      zinc,
      lead,
      w.definition(
        t(
          "**Reactivity.** How readily an element reacts is its **reactivity**. A **more reactive** metal displaces a less reactive one from its compounds. Zinc, lead and iron are more reactive than copper, so they push copper out. A less reactive metal cannot displace a more reactive one.",
          "**क्रियाशीलता।** कोई तत्व कितनी आसानी से अभिक्रिया करता है, वह उसकी **क्रियाशीलता** है। **अधिक क्रियाशील** धातु कम क्रियाशील धातु को उसके यौगिकों से विस्थापित करती है। जिंक, लेड और लोहा ताँबे से अधिक क्रियाशील हैं, इसलिए वे ताँबे को बाहर धकेलते हैं। कम क्रियाशील धातु अधिक क्रियाशील को विस्थापित नहीं कर सकती।",
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Activity 1.10: a white precipitate; ions; double displacement. */
const swap = page(
  "swap",
  (b) => {
    const w = wordsOn(b);
    const tube = benchOn(b, "tube", BenchKind.BariumSulphatePrecipitate);
    b.standsFor(
      tube,
      "NCERT Activity 1.10: barium chloride solution poured into sodium sulphate solution gives a white precipitate",
    );
    const bal = equationOn(b, "bal", "sodiumSulphateBariumChloride", {
      balanced: true,
      showStates: true,
      showTally: false,
    });
    b.standsFor(bal, "Na₂SO₄(aq) + BaCl₂(aq) → BaSO₄(s) + 2NaCl(aq)");
    const atoms = b.prop(particleSwapDef, "atoms", {
      kind: SwapKind.DoubleDisplacement,
      step: 0,
      canStep: true,
      showEquation: true,
      captions: [
        t(
          "Sodium sulphate and barium chloride, each in solution.",
          "सोडियम सल्फ़ेट और बेरियम क्लोराइड, दोनों विलयन में।",
        ),
        t("The partners swap…", "साथी बदलते हैं…"),
        t(
          "…barium sulphate falls out as a solid; sodium chloride stays dissolved.",
          "…बेरियम सल्फ़ेट ठोस बनकर नीचे बैठता है; सोडियम क्लोराइड घुला रहता है।",
        ),
      ],
    });
    b.studentOnly(atoms.action(SwapAction.Next));
    b.standsFor(
      atoms,
      "sodium, sulphate, barium and chloride drawn as balls; barium and sulphate pair up and drop as a solid, sodium and chloride pair up and stay in solution",
    );
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t("What is the white precipitate?", "सफ़ेद अवक्षेप क्या है?"),
      options: [
        { id: "right", label: t(r`Barium sulphate, $\ce{BaSO4}$`, r`बेरियम सल्फ़ेट, $\ce{BaSO4}$`) },
        {
          id: "nacl",
          label: t(r`Sodium chloride, $\ce{NaCl}$`, r`सोडियम क्लोराइड, $\ce{NaCl}$`),
          feedback: t(
            "Sodium chloride is common salt: it dissolves in water, so it stays in the solution.",
            "सोडियम क्लोराइड साधारण नमक है: यह पानी में घुलता है, इसलिए विलयन में रहता है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Swapping partners", "साथी बदलना")),
      w.body(
        t(
          "Activity 1.10. Mix a solution of **sodium sulphate** with a solution of **barium chloride**.",
          "क्रियाकलाप 1.10। **सोडियम सल्फ़ेट** के विलयन में **बेरियम क्लोराइड** का विलयन मिलाओ।",
        ),
      ),
      tube,
      bal,
      w.definition(
        t(
          r`**Ion.** An atom or a group of atoms carrying an electric charge is an **ion**. In solution, these compounds exist as ions: barium as $\ce{Ba^2+}$, the sulphate group as $\ce{SO4^2-}$, sodium as $\ce{Na+}$, chloride as $\ce{Cl-}$.`,
          r`**आयन।** विद्युत आवेश वाला कोई परमाणु या परमाणुओं का समूह **आयन** है। विलयन में ये यौगिक आयनों के रूप में रहते हैं: बेरियम $\ce{Ba^2+}$, सल्फ़ेट समूह $\ce{SO4^2-}$, सोडियम $\ce{Na+}$, क्लोराइड $\ce{Cl-}$ के रूप में।`,
        ),
      ),
      w.definition(
        t(
          "**Double displacement and precipitation.** A reaction in which two reactants **exchange ions** is a **double displacement reaction**. Here Ba²⁺ and SO₄²⁻ meet and form insoluble barium sulphate. Any reaction that produces a precipitate is also called a **precipitation reaction**.",
          "**द्विविस्थापन और अवक्षेपण।** वह अभिक्रिया जिसमें दो अभिकारक **आयनों का आदान-प्रदान** करते हैं, **द्विविस्थापन अभिक्रिया** है। यहाँ Ba²⁺ और SO₄²⁻ मिलकर अघुलनशील बेरियम सल्फ़ेट बनाते हैं। अवक्षेप बनाने वाली किसी भी अभिक्रिया को **अवक्षेपण अभिक्रिया** भी कहते हैं।",
        ),
      ),
      atoms,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Recall Activity 1.2: the yellow precipitate. */
const recall = page(
  "recall",
  (b) => {
    const w = wordsOn(b);
    const { eq, goal } = balanceGoal(
      b,
      "eq",
      "leadNitratePotassiumIodide",
      t(
        "Balance the lead nitrate and potassium iodide reaction.",
        "लेड नाइट्रेट और पोटैशियम आयोडाइड की अभिक्रिया संतुलित करो।",
      ),
    );
    b.standsFor(eq, "Pb(NO₃)₂ + KI → PbI₂ + KNO₃ with steppers and the atom table");
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t("Is this also a double displacement reaction?", "क्या यह भी द्विविस्थापन अभिक्रिया है?"),
      options: [
        {
          id: "right",
          label: t(
            "Yes: lead and potassium exchange partners, and lead iodide precipitates",
            "हाँ: लेड और पोटैशियम साथी बदलते हैं, और लेड आयोडाइड अवक्षेपित होता है",
          ),
        },
        {
          id: "single",
          label: t("No: it's a displacement", "नहीं: यह विस्थापन है"),
          feedback: t(
            "In a displacement an element on its own pushes into a compound. Here two compounds swap partners.",
            "विस्थापन में एक अकेला तत्व यौगिक में घुसता है। यहाँ दो यौगिक साथी बदलते हैं।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(ask));
    return column([
      w.title(t("The yellow precipitate again", "फिर पीला अवक्षेप")),
      w.body(
        t(
          "Remember lesson 1: lead nitrate and potassium iodide gave a **yellow precipitate**. It is **lead iodide**, $\\ce{PbI2}$; potassium nitrate stays in solution.",
          "पाठ 1 याद करो: लेड नाइट्रेट और पोटैशियम आयोडाइड ने **पीला अवक्षेप** दिया था। वह **लेड आयोडाइड**, $\\ce{PbI2}$, है; पोटैशियम नाइट्रेट विलयन में रहता है।",
        ),
      ),
      eq,
      goal,
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
    const silver = equationOn(b, "silver", "copperSilverNitrate", {
      balanced: true,
      showStates: true,
      showTally: true,
    });
    b.standsFor(silver, "Cu(s) + 2AgNO₃(aq) → Cu(NO₃)₂(aq) + 2Ag(s), balanced");
    const nail = choiceQuestion(b, {
      name: "nail",
      prompt: t(
        "So what was the brown coat on Kabir's nails?",
        "तो कबीर की कीलों पर भूरी परत क्या थी?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Copper, displaced from copper sulphate by the more reactive iron",
            "ताँबा, जिसे अधिक क्रियाशील लोहे ने कॉपर सल्फ़ेट से विस्थापित किया",
          ),
        },
        {
          id: "rust",
          label: t("Rust", "ज़ंग"),
          feedback: t(
            "Rust takes days in damp air. This was copper metal, come out of the solution.",
            "ज़ंग नम हवा में दिनों में लगता है। यह विलयन से निकली कॉपर धातु थी।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const jeweller = choiceQuestion(b, {
      name: "jeweller",
      prompt: t(
        "Grandpa says the jeweller gets silver back from silver nitrate solution with copper scraps. What type of reaction is that?",
        "दादाजी कहते हैं कि सुनार ताँबे के टुकड़ों से सिल्वर नाइट्रेट विलयन से चाँदी वापस पाता है। वह किस प्रकार की अभिक्रिया है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Displacement: copper is more reactive than silver",
            "विस्थापन: ताँबा चाँदी से अधिक क्रियाशील है",
          ),
        },
        {
          id: "double",
          label: t("Double displacement", "द्विविस्थापन"),
          feedback: t(
            "Copper goes in as an element on its own, not as a compound: a single displacement.",
            "ताँबा अकेले तत्व के रूप में जाता है, यौगिक के रूप में नहीं: एकल विस्थापन।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const stop = w.definition(
      t(
        "**Stop 6 done.** In a displacement a more reactive element takes the place of a less reactive one in its compound. In a double displacement two compounds swap ions, often dropping a precipitate. Kabir accidentally plated his nails with copper, and the jeweller uses the same idea for silver. Next stop: what oxygen does to metals, and how to undo it: Mom's blackened pot.",
        "**पड़ाव 6 पूरा।** विस्थापन में अधिक क्रियाशील तत्व कम क्रियाशील की जगह उसके यौगिक में लेता है। द्विविस्थापन में दो यौगिक आयन बदलते हैं, प्रायः एक अवक्षेप गिराते हुए। कबीर ने अनजाने में अपनी कीलों पर ताँबे की परत चढ़ा दी, और सुनार चाँदी के लिए यही तरीक़ा अपनाता है। अगला पड़ाव: ऑक्सीजन धातुओं के साथ क्या करती है, और उसे कैसे पलटें: मम्मी का काला पड़ा बर्तन।",
      ),
      "stop",
      { isHidden: true },
    );
    b.when(nail.on(QuestionSignal.Correct), theBoard.show(jeweller));
    b.when(jeweller.on(QuestionSignal.Correct), [theBoard.show(stop), theBoard.pass()]);
    return column([
      w.title(t("Kabir's nails, explained", "कबीर की कीलें, समझाई गईं")),
      nail,
      jeweller,
      silver,
      stop,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Exercise 7(d): barium chloride and potassium sulphate. */
const example = page(
  "example",
  (b) => {
    const w = wordsOn(b);
    const { eq, goal } = balanceGoal(
      b,
      "eq",
      "bariumChloridePotassiumSulphate",
      t(
        "Barium chloride + Potassium sulphate → Barium sulphate + Potassium chloride. Balance it.",
        "बेरियम क्लोराइड + पोटैशियम सल्फ़ेट → बेरियम सल्फ़ेट + पोटैशियम क्लोराइड। संतुलित करो।",
      ),
    );
    b.standsFor(eq, "BaCl₂ + K₂SO₄ → BaSO₄ + KCl with steppers and the atom table");
    return column([
      w.title(t("A double displacement to balance", "संतुलित करने को एक द्विविस्थापन")),
      w.body(
        t(
          "Barium and potassium swap partners; barium sulphate is the precipitate. Count chlorine and potassium.",
          "बेरियम और पोटैशियम साथी बदलते हैं; बेरियम सल्फ़ेट अवक्षेप है। क्लोरीन और पोटैशियम गिनो।",
        ),
      ),
      eq,
      goal,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Exercise 2, and the mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        r`$\ce{Fe2O3 + 2Al -> Al2O3 + 2Fe}$ is an example of a…`,
        r`$\ce{Fe2O3 + 2Al -> Al2O3 + 2Fe}$ किसका उदाहरण है?`,
      ),
      options: [
        { id: "right", label: t("displacement reaction", "विस्थापन अभिक्रिया") },
        {
          id: "double",
          label: t("double displacement reaction", "द्विविस्थापन अभिक्रिया"),
          feedback: t(
            "Aluminium goes in as an element on its own and takes iron's place: single displacement.",
            "ऐलुमिनियम अकेले तत्व के रूप में जाकर लोहे की जगह लेता है: एकल विस्थापन।",
          ),
        },
        {
          id: "combination",
          label: t("combination reaction", "संयोजन अभिक्रिया"),
          feedback: t(
            "There are two products, so it isn't a combination.",
            "दो उत्पाद हैं, इसलिए यह संयोजन नहीं है।",
          ),
        },
        {
          id: "decomposition",
          label: t("decomposition reaction", "वियोजन अभिक्रिया"),
          feedback: t(
            "There are two reactants, so nothing is just breaking apart.",
            "दो अभिकारक हैं, इसलिए कुछ बस टूट नहीं रहा।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ Displacement: a more reactive element displaces a less reactive one from its compound. ✓ Double displacement: two compounds exchange ions; if a precipitate forms, it's also a precipitation reaction. ✓ Kabir's nails were plated with copper. Next: oxidation and reduction.",
        "**मिशन लॉग।** ✓ विस्थापन: अधिक क्रियाशील तत्व कम क्रियाशील को उसके यौगिक से विस्थापित करता है। ✓ द्विविस्थापन: दो यौगिक आयनों का आदान-प्रदान करते हैं; अवक्षेप बने तो यह अवक्षेपण अभिक्रिया भी है। ✓ कबीर की कीलों पर ताँबे की परत चढ़ी थी। आगे: उपचयन और अपचयन।",
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
export const overview = [hook, displace, reactive, swap, recall, inLife, example, yourTurn];

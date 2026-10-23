import type { BoardKit } from "@chalk/author";
import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import { BondAction, IonicCompound, ionicBondDef } from "@chalk/prop-chemistry";
import { MetalSceneKind, ce, sceneOn } from "../kit";

const r = String.raw;

/** An ionic bond to step through: atoms, the electrons moving, the ions, held together. */
function bondOn(
  b: BoardKit,
  name: string,
  compound: IonicCompound,
  options: { showAllShells?: boolean; compounds?: IonicCompound[] } = {},
) {
  const bond = b.prop(ionicBondDef, name, {
    compound,
    step: 0,
    canStep: true,
    showAllShells: options.showAllShells ?? true,
    showConfig: true,
    compounds: options.compounds ?? [],
  });
  b.studentOnly(bond.action(BondAction.Next));
  if ((options.compounds ?? []).length > 0) b.studentOnly(bond.action(BondAction.Choose));
  return bond;
}

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const desk = sceneOn(
    b,
    "desk",
    MetalSceneKind.CaseFile,
    "Riya at the desk with the case file and a salt shaker, Kabir peering through a magnifying glass",
  );
  return column([
    w.title(t("Eager and lazy", "उत्सुक और सुस्त")),
    desk,
    w.body(
      t(
        'Sodium catches fire in air; gold ignores even acid. Kabir shakes some salt onto the desk: **"And sodium plus a poison gas, chlorine, makes this, which we eat every day?"** Riya: "Something has to happen inside the atoms."',
        'सोडियम हवा में आग पकड़ लेता है; सोना अम्ल को भी अनदेखा करता है। कबीर मेज़ पर थोड़ा नमक छिड़कता है: **"और सोडियम और एक ज़हरीली गैस, क्लोरीन, मिलकर यह बनाते हैं, जो हम रोज़ खाते हैं?"** रिया: "परमाणुओं के अंदर कुछ होना चाहिए।"',
      ),
    ),
    w.body(
      t(
        "Clue 5: why do metals and non-metals react, and what do they make?",
        "सुराग 5: धातुएँ और अधातुएँ अभिक्रिया क्यों करती हैं, और क्या बनाती हैं?",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Class 9 recap: shells, valence shell, the noble gases' full shells (Table 3.3). */
const shells = page(
  "shells",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "Magnesium is 2, 8, 2. How many electrons are in its valence shell?",
        "मैग्नीशियम 2, 8, 2 है। इसके संयोजकता कोश में कितने इलेक्ट्रॉन हैं?",
      ),
      options: [
        { id: "right", label: t("2", "2") },
        {
          id: "eight",
          label: t("8", "8"),
          feedback: t(
            "8 is in the L shell, but the M shell is the outermost one here.",
            "8, L कोश में हैं, पर यहाँ सबसे बाहरी कोश M है।",
          ),
        },
        {
          id: "twelve",
          label: t("12", "12"),
          feedback: t(
            "12 is all its electrons. The valence shell is just the outermost.",
            "12 इसके सारे इलेक्ट्रॉन हैं। संयोजकता कोश केवल सबसे बाहरी है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Electrons in shells", "कोशों में इलेक्ट्रॉन")),
      w.definition(
        t(
          "**Shells and the valence shell.** From Class 9: an atom's electrons sit in **shells** around the nucleus, named K, L, M, N from the inside out. K holds up to 2 electrons, L up to 8. Sodium (11 electrons) is 2, 8, 1. The outermost shell is the **valence shell**.",
          "**कोश और संयोजकता कोश।** कक्षा 9 से: परमाणु के इलेक्ट्रॉन नाभिक के चारों ओर **कोशों** में रहते हैं, जिनके नाम अंदर से बाहर K, L, M, N हैं। K में अधिकतम 2 इलेक्ट्रॉन, L में अधिकतम 8। सोडियम (11 इलेक्ट्रॉन) 2, 8, 1 है। सबसे बाहरी कोश **संयोजकता कोश** है।",
        ),
      ),
      w.definition(
        t(
          "**Noble gases and the octet.** Helium (2), neon (2, 8) and argon (2, 8, 8) have a **completely filled valence shell**, and they hardly react at all. So chemists explain reactivity as an element's tendency to **reach a completely filled valence shell**. For most elements that means 8 electrons in the outermost shell, an **octet**.",
          "**उत्कृष्ट गैसें और अष्टक।** हीलियम (2), निऑन (2, 8) और आर्गन (2, 8, 8) का **संयोजकता कोश पूरा भरा** है, और वे लगभग कोई अभिक्रिया नहीं करतीं। इसलिए रसायनज्ञ क्रियाशीलता को किसी तत्व की **पूरा भरा संयोजकता कोश पाने** की प्रवृत्ति के रूप में समझाते हैं। अधिकतर तत्वों के लिए इसका अर्थ है सबसे बाहरी कोश में 8 इलेक्ट्रॉन, एक **अष्टक**।",
        ),
      ),
      w.body(
        t(
          "From NCERT's Table 3.3: metals like sodium (2, 8, 1), magnesium (2, 8, 2) and aluminium (2, 8, 3) have **few** electrons in their valence shell. Non-metals like oxygen (2, 6) and chlorine (2, 8, 7) are just **short** of eight.",
          "NCERT की तालिका 3.3 से: सोडियम (2, 8, 1), मैग्नीशियम (2, 8, 2) और ऐलुमिनियम (2, 8, 3) जैसी धातुओं के संयोजकता कोश में **कम** इलेक्ट्रॉन हैं। ऑक्सीजन (2, 6) और क्लोरीन (2, 8, 7) जैसी अधातुएँ आठ से बस **थोड़ी कम** हैं।",
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Fig 3.5: sodium gives an electron to chlorine. Cation and anion. */
const transfer = page(
  "transfer",
  (b) => {
    const w = wordsOn(b);
    const bond = bondOn(b, "bond", IonicCompound.SodiumChloride);
    b.standsFor(
      bond,
      "a sodium atom (2, 8, 1) and a chlorine atom (2, 8, 7) with their shells drawn; stepping on, sodium's one outer electron moves to chlorine, giving Na⁺ (2, 8) and Cl⁻ (2, 8, 8), which then sit together",
    );
    const charge = choiceQuestion(b, {
      name: "charge",
      prompt: t(
        "After giving away one electron, why does sodium have a charge of +1?",
        "एक इलेक्ट्रॉन देने के बाद सोडियम पर +1 आवेश क्यों है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Its nucleus still has 11 protons, but now only 10 electrons",
            "इसके नाभिक में अब भी 11 प्रोटॉन हैं, पर अब केवल 10 इलेक्ट्रॉन",
          ),
        },
        {
          id: "proton",
          label: t("It gained a proton", "इसने एक प्रोटॉन पाया"),
          feedback: t(
            "Reactions never change the nucleus. Only electrons move.",
            "अभिक्रियाएँ नाभिक को कभी नहीं बदलतीं। केवल इलेक्ट्रॉन चलते हैं।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Give and take", "लेन-देन")),
      w.body(
        t(
          "Step through: sodium has one electron to spare, chlorine needs one more.",
          "क़दम-दर-क़दम देखो: सोडियम के पास एक इलेक्ट्रॉन फ़ालतू है, क्लोरीन को एक और चाहिए।",
        ),
      ),
      bond,
      w.body(ce("Na -> Na+ + e-")),
      w.body(t("2, 8, 1 → 2, 8", "2, 8, 1 → 2, 8")),
      w.body(ce("Cl + e- -> Cl-")),
      w.body(t("2, 8, 7 → 2, 8, 8", "2, 8, 7 → 2, 8, 8")),
      w.definition(
        t(
          "**Ion, cation, anion.** An atom that has lost or gained electrons carries a charge: it is an **ion**. Sodium loses one electron, so its 11 protons outnumber its 10 electrons: it becomes the positive **sodium cation**, $\\ce{Na+}$. Chlorine gains one electron, so its 18 electrons outnumber its 17 protons: it becomes the negative **chloride anion**, $\\ce{Cl-}$. A positive ion is a **cation**; a negative ion is an **anion**.",
          "**आयन, धनायन, ऋणायन।** जिस परमाणु ने इलेक्ट्रॉन खोए या पाए हैं, उस पर आवेश होता है: वह **आयन** है। सोडियम एक इलेक्ट्रॉन खोता है, इसलिए उसके 11 प्रोटॉन 10 इलेक्ट्रॉनों से ज़्यादा हैं: वह धनात्मक **सोडियम धनायन**, $\\ce{Na+}$, बन जाता है। क्लोरीन एक इलेक्ट्रॉन पाता है, इसलिए उसके 18 इलेक्ट्रॉन 17 प्रोटॉनों से ज़्यादा हैं: वह ऋणात्मक **क्लोराइड ऋणायन**, $\\ce{Cl-}$, बन जाता है। धनात्मक आयन **धनायन** है; ऋणात्मक आयन **ऋणायन** है।",
        ),
      ),
      w.body(
        t(
          "Opposite charges attract, so the ions are held together by strong **electrostatic forces** as sodium chloride, $\\ce{NaCl}$. Sodium chloride doesn't exist as separate molecules: it is a large collection of oppositely charged ions.",
          "विपरीत आवेश एक-दूसरे को खींचते हैं, इसलिए आयन प्रबल **स्थिरवैद्युत बलों** से सोडियम क्लोराइड, $\\ce{NaCl}$, के रूप में बँधे रहते हैं। सोडियम क्लोराइड अलग-अलग अणुओं के रूप में नहीं रहता: यह विपरीत आवेश वाले आयनों का एक बड़ा समूह है।",
        ),
      ),
      charge,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Fig 3.6: magnesium chloride; ionic (electrovalent) compounds. */
const mgcl2 = page(
  "mgcl2",
  (b) => {
    const w = wordsOn(b);
    const bond = bondOn(b, "bond", IonicCompound.MagnesiumChloride);
    b.standsFor(
      bond,
      "a magnesium atom (2, 8, 2) and two chlorine atoms (2, 8, 7); each of magnesium's two outer electrons goes to one chlorine, giving Mg²⁺ and two Cl⁻",
    );
    const ions = choiceQuestion(b, {
      name: "ions",
      prompt: t(
        r`Name the cation and the anion in $\ce{MgCl2}$.`,
        r`$\ce{MgCl2}$ में धनायन और ऋणायन बताओ।`,
      ),
      options: [
        {
          id: "right",
          label: t(
            r`Cation $\ce{Mg^2+}$, anion $\ce{Cl-}$`,
            r`धनायन $\ce{Mg^2+}$, ऋणायन $\ce{Cl-}$`,
          ),
        },
        {
          id: "swap",
          label: t(
            r`Cation $\ce{Cl+}$, anion $\ce{Mg^2-}$`,
            r`धनायन $\ce{Cl+}$, ऋणायन $\ce{Mg^2-}$`,
          ),
          feedback: t(
            "The metal loses electrons and becomes the positive ion; the non-metal gains them and becomes negative.",
            "धातु इलेक्ट्रॉन खोकर धनात्मक आयन बनती है; अधातु उन्हें पाकर ऋणात्मक बनती है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Magnesium chloride", "मैग्नीशियम क्लोराइड")),
      w.body(
        t(
          "Magnesium has **two** electrons to give, and each chlorine takes one. So one magnesium needs **two** chlorines:",
          "मैग्नीशियम के पास देने को **दो** इलेक्ट्रॉन हैं, और हर क्लोरीन एक लेता है। इसलिए एक मैग्नीशियम को **दो** क्लोरीन चाहिए:",
        ),
      ),
      bond,
      w.body(ce("Mg -> Mg^2+ + 2e-")),
      w.body(t("2, 8, 2 → 2, 8", "2, 8, 2 → 2, 8")),
      w.definition(
        t(
          "**Ionic compounds.** Compounds formed by the **transfer of electrons from a metal to a non-metal** are **ionic compounds**, also called **electrovalent compounds**. In general, metals form positive ions by losing electrons, and non-metals form negative ions by gaining them.",
          "**आयनिक यौगिक।** **धातु से अधातु में इलेक्ट्रॉनों के स्थानांतरण** से बने यौगिक **आयनिक यौगिक** हैं, जिन्हें **वैद्युत संयोजक यौगिक** भी कहते हैं। सामान्यतः धातुएँ इलेक्ट्रॉन खोकर धनायन बनाती हैं, और अधातुएँ इलेक्ट्रॉन पाकर ऋणायन।",
        ),
      ),
      ions,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Electron-dot structures; Na₂O and MgO (in-text Q1). */
const dots = page(
  "dots",
  (b) => {
    const w = wordsOn(b);
    const bond = bondOn(b, "bond", IonicCompound.SodiumOxide, {
      showAllShells: false,
      compounds: [IonicCompound.SodiumOxide, IonicCompound.MagnesiumOxide],
    });
    b.standsFor(
      bond,
      "electron-dot drawings: only the outer electrons shown as dots around each symbol; switch between sodium oxide (two sodiums each giving one electron to one oxygen) and magnesium oxide (magnesium giving two electrons to oxygen)",
    );
    const na2o = choiceQuestion(b, {
      name: "na2o",
      prompt: t(
        r`Why does sodium oxide need **two** sodium atoms for one oxygen, $\ce{Na2O}$?`,
        r`सोडियम ऑक्साइड में एक ऑक्सीजन के लिए **दो** सोडियम परमाणु क्यों चाहिए, $\ce{Na2O}$?`,
      ),
      options: [
        {
          id: "right",
          label: t(
            "Oxygen (2, 6) needs two electrons; each sodium can give only one",
            "ऑक्सीजन (2, 6) को दो इलेक्ट्रॉन चाहिए; हर सोडियम केवल एक दे सकता है",
          ),
        },
        {
          id: "bigger",
          label: t("Oxygen atoms are bigger", "ऑक्सीजन के परमाणु बड़े हैं"),
          feedback: t(
            "Size doesn't decide it: count the electrons each atom gives or takes.",
            "आकार से यह तय नहीं होता: गिनो कि हर परमाणु कितने इलेक्ट्रॉन देता या लेता है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Dot pictures", "बिंदु चित्र")),
      w.definition(
        t(
          "**Electron-dot structure.** A quick way to draw an atom: write its symbol and show only its **valence electrons** as dots around it. Sodium is Na with one dot, magnesium Mg with two dots, oxygen O with six dots.",
          "**इलेक्ट्रॉन बिंदु संरचना।** परमाणु बनाने का एक आसान तरीक़ा: उसका प्रतीक लिखो और केवल उसके **संयोजकता इलेक्ट्रॉन** उसके चारों ओर बिंदुओं के रूप में दिखाओ। सोडियम एक बिंदु वाला Na है, मैग्नीशियम दो बिंदुओं वाला Mg, ऑक्सीजन छह बिंदुओं वाला O।",
        ),
      ),
      bond,
      w.body(
        t(
          r`In $\ce{Na2O}$ the ions are $\ce{Na+}$ and $\ce{O^2-}$. In $\ce{MgO}$ they are $\ce{Mg^2+}$ and $\ce{O^2-}$.`,
          r`$\ce{Na2O}$ में आयन $\ce{Na+}$ और $\ce{O^2-}$ हैं। $\ce{MgO}$ में $\ce{Mg^2+}$ और $\ce{O^2-}$ हैं।`,
        ),
      ),
      na2o,
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
    const salt = choiceQuestion(b, {
      name: "salt",
      prompt: t(
        "So what is the salt Kabir sprinkled on the desk, really?",
        "तो कबीर ने मेज़ पर जो नमक छिड़का, वह असल में क्या है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            r`A huge crowd of $\ce{Na+}$ and $\ce{Cl-}$ ions held together, not NaCl molecules`,
            r`$\ce{Na+}$ और $\ce{Cl-}$ आयनों की एक बहुत बड़ी भीड़ जो आपस में बँधी है, NaCl अणु नहीं`,
          ),
        },
        {
          id: "atoms",
          label: t("Sodium atoms and chlorine atoms mixed", "सोडियम परमाणु और क्लोरीन परमाणु मिले हुए"),
          feedback: t(
            "Sodium atoms would catch fire and chlorine atoms are a poison gas. In salt they've become ions.",
            "सोडियम परमाणु आग पकड़ लेते और क्लोरीन गैस ज़हरीली है। नमक में वे आयन बन चुके हैं।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const gold = choiceQuestion(b, {
      name: "gold",
      prompt: t(
        "Sodium readily gives away its single outer electron. What does it mean that gold is at the bottom of the series?",
        "सोडियम अपना एक बाहरी इलेक्ट्रॉन आसानी से दे देता है। सोने के श्रेणी में सबसे नीचे होने का क्या अर्थ है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Gold is very reluctant to lose electrons and form ions, so very few things can make it react",
            "सोना इलेक्ट्रॉन खोकर आयन बनाने को बहुत अनिच्छुक है, इसलिए बहुत कम चीज़ें उससे अभिक्रिया करा पाती हैं",
          ),
        },
        {
          id: "none",
          label: t("Gold has no electrons", "सोने में कोई इलेक्ट्रॉन नहीं"),
          feedback: t(
            "Every atom has electrons. Gold just holds on to its outer ones far more tightly.",
            "हर परमाणु में इलेक्ट्रॉन होते हैं। सोना बस अपने बाहरी इलेक्ट्रॉनों को कहीं अधिक कसकर पकड़ता है।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const notes = w.definition(
      t(
        "**Case notes.** ✓ Metals react by **losing** electrons to form positive ions; non-metals by **gaining** them. ✓ Reactive metals lose electrons easily; gold hardly at all, so it takes something as fierce as aqua regia. Next clue: what ionic compounds are like.",
        "**केस नोट्स।** ✓ धातुएँ इलेक्ट्रॉन **खोकर** धनायन बनाकर अभिक्रिया करती हैं; अधातुएँ उन्हें **पाकर**। ✓ क्रियाशील धातुएँ आसानी से इलेक्ट्रॉन खोती हैं; सोना लगभग नहीं, इसलिए उसके लिए अम्लराज जैसी तेज़ चीज़ चाहिए। अगला सुराग: आयनिक यौगिक कैसे होते हैं।",
      ),
      "notes",
      { isHidden: true },
    );
    b.when(salt.on(QuestionSignal.Correct), theBoard.show(gold));
    b.when(gold.on(QuestionSignal.Correct), [theBoard.show(notes), theBoard.pass()]);
    return column([w.title(t("Salt on the desk", "मेज़ पर नमक")), salt, gold, notes, space()]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const bond = bondOn(b, "bond", IonicCompound.CalciumOxide, {
      compounds: [IonicCompound.CalciumOxide, IonicCompound.PotassiumChloride],
    });
    b.standsFor(bond, "calcium oxide and potassium chloride, step by step, shell by shell");
    const cao = choiceQuestion(b, {
      name: "cao",
      prompt: t(
        "Calcium is 2, 8, 8, 2 and oxygen is 2, 6. In calcium oxide, how many electrons move, and from which atom?",
        "कैल्शियम 2, 8, 8, 2 है और ऑक्सीजन 2, 6। कैल्शियम ऑक्साइड में कितने इलेक्ट्रॉन चलते हैं, और किस परमाणु से?",
      ),
      options: [
        { id: "right", label: t("Two, from calcium to oxygen", "दो, कैल्शियम से ऑक्सीजन में") },
        {
          id: "six",
          label: t("Six, from oxygen to calcium", "छह, ऑक्सीजन से कैल्शियम में"),
          feedback: t(
            "Oxygen only needs two more to reach eight; calcium gives away its two outer electrons.",
            "ऑक्सीजन को आठ तक पहुँचने के लिए केवल दो और चाहिए; कैल्शियम अपने दो बाहरी इलेक्ट्रॉन दे देता है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const notes = w.definition(
      t(
        "**Case notes.** ✓ Valence shell, octet, cation, anion, ionic (electrovalent) compound. ✓ NaCl, MgCl₂, Na₂O, MgO by electron transfer. Next clue: the properties of ionic compounds.",
        "**केस नोट्स।** ✓ संयोजकता कोश, अष्टक, धनायन, ऋणायन, आयनिक (वैद्युत संयोजक) यौगिक। ✓ इलेक्ट्रॉन स्थानांतरण से NaCl, MgCl₂, Na₂O, MgO। अगला सुराग: आयनिक यौगिकों के गुण।",
      ),
      "notes",
      { isHidden: true },
    );
    b.when(cao.on(QuestionSignal.Correct), [theBoard.show(notes), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), bond, cao, notes, space()]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [hook, shells, transfer, mgcl2, dots, inLife, yourTurn];

import { PassOn, column, page, space, t } from "@chalk/author";
import { goalQuestion, wordsOn } from "@chalk/patterns";
import { CarbonScene, CovalentAction, CovalentDerived, Molecule } from "@chalk/prop-carbon";
import { ask, dotsOn, oneByOne, sceneOn } from "../kit";

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** Who, where, what: the Green Fair and the soap stall. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const fair = sceneOn(
    b,
    "fair",
    CarbonScene.GreenFair,
    "a school noticeboard announcing the Green Fair in three weeks, with Riya and Kabir reading it",
  );
  return column([
    w.title(t("The Soap Project", "साबुन प्रोजेक्ट")),
    fair,
    w.body(
      t(
        "Riya (Class 10) and her little brother Kabir read the notice twice: the school's **Green Fair** is in three weeks, and every class can run a stall that sells something made at home without waste. Kabir wants to sell lemonade. Riya has a better idea: **handmade soap**, made from leftover cooking oil.",
        "रिया (दसवीं) और उसका छोटा भाई कबीर सूचना दो बार पढ़ते हैं: स्कूल का **ग्रीन मेला** तीन हफ़्ते में है, और हर कक्षा एक स्टॉल लगा सकती है जिसमें घर पर बिना बर्बादी के बनी चीज़ बिके। कबीर नींबू पानी बेचना चाहता है। रिया के पास बेहतर विचार है: बचे हुए खाने के तेल से बना **हाथ का बना साबुन**।",
      ),
    ),
    w.body(
      t(
        'At home Grandpa laughs. **"Soap is chemistry. Make it wrong and it won\'t even lather in the village hand-pump water."** Mom adds one rule: nothing gets heated or mixed without her, and only she handles the sodium hydroxide, with gloves and goggles, because it burns skin.',
        'घर पर दादाजी हँसते हैं। **"साबुन रसायन है। ग़लत बना तो गाँव के हैंडपंप के पानी में झाग तक नहीं देगा।"** मम्मी एक नियम जोड़ती हैं: उनके बिना कुछ भी गर्म या मिलाया नहीं जाएगा, और सोडियम हाइड्रॉक्साइड सिर्फ़ वही दस्ताने और चश्मा पहनकर छुएँगी, क्योंकि वह त्वचा जला देता है।',
      ),
    ),
    space(),
  ]);
});

/** Kabir's supply list: everything on it is a carbon compound. The mission and the stops. */
const why = page("why", (b) => {
  const w = wordsOn(b);
  const list = sceneOn(
    b,
    "list",
    CarbonScene.SupplyList,
    "Kabir's supply list on the table beside the things on it: a bottle of cooking oil, sugar, a pencil, a plastic jug, a gas lighter and a cotton cloth",
  );
  return column([
    w.title(t("Everything on the list is carbon", "सूची की हर चीज़ में कार्बन है")),
    list,
    w.body(
      t(
        'Kabir writes the supply list: cooking oil, a plastic jug, a cotton cloth to strain with, a pencil for labels, sugar for Grandpa\'s tea while they work, and the cooking gas. Grandpa reads it and says: **"Every single thing here is made of one element, carbon, or its compounds."**',
        'कबीर सामान की सूची लिखता है: खाने का तेल, एक प्लास्टिक जग, छानने के लिए सूती कपड़ा, लेबल के लिए पेंसिल, काम के बीच दादाजी की चाय के लिए चीनी, और रसोई गैस। दादाजी पढ़कर कहते हैं: **"यहाँ की हर एक चीज़ एक ही तत्व, कार्बन, या उसके यौगिकों से बनी है।"**',
      ),
    ),
    w.body(
      t(
        "That's the mission for this chapter: make soap that really cleans, and understand why it works. Soap, the oil it is made from, the fuel that heats it and the scent added to it are all **carbon compounds**.",
        "यही इस अध्याय का मिशन है: ऐसा साबुन बनाना जो सचमुच साफ़ करे, और समझना कि वह काम क्यों करता है। साबुन, जिस तेल से वह बनता है, जो ईंधन उसे गर्म करता है और जो खुशबू उसमें डाली जाती है, सब **कार्बन यौगिक** हैं।",
      ),
    ),
    w.definition(
      t(
        "**The stops on the way.** (1) How carbon holds on to other atoms: *this lesson*. (2) Diamond, graphite and fullerene. (3) Why carbon makes so many compounds. (4) Chains, branches and rings. (5) Functional groups and families. (6) Naming them. (7) Burning and oxidation. (8) Adding and swapping atoms. (9) Ethanol and ethanoic acid. (10) Soaps and detergents, and fair day.",
        "**रास्ते के पड़ाव।** (1) कार्बन दूसरे परमाणुओं को कैसे पकड़ता है: *यह पाठ*। (2) हीरा, ग्रेफ़ाइट और फ़ुलरीन। (3) कार्बन इतने यौगिक क्यों बनाता है। (4) शृंखलाएँ, शाखाएँ और वलय। (5) प्रकार्यात्मक समूह और परिवार। (6) उनके नाम। (7) दहन और ऑक्सीकरण। (8) परमाणु जोड़ना और बदलना। (9) एथेनॉल और एथेनॉइक अम्ल। (10) साबुन और अपमार्जक, और मेले का दिन।",
      ),
    ),
    w.body(
      t(
        "First stop, from the very beginning: how does a carbon atom join other atoms at all?",
        "पहला पड़ाव, बिल्कुल शुरू से: कार्बन का परमाणु दूसरे परमाणुओं से जुड़ता ही कैसे है?",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Recap: atoms, shells, valence electrons, ionic bonds. Table 4.1: carbon compounds aren't ionic. */
const notIonic = page(
  "not-ionic",
  (b) => {
    const w = wordsOn(b);
    const q = ask(
      b,
      "q",
      [
        "Methane melts at −183 °C and does not conduct electricity. What does that suggest?",
        "मेथेन −183 °C पर पिघलती है और विद्युत का चालन नहीं करती। इससे क्या पता चलता है?",
      ],
      [
        "The forces between its molecules are weak, and it has no ions",
        "इसके अणुओं के बीच बल दुर्बल हैं, और इसमें आयन नहीं हैं",
      ],
      [
        [
          "It is an ionic compound",
          "यह एक आयनिक यौगिक है",
          "Ionic compounds have high melting points and conduct when molten or dissolved. Methane does neither.",
          "आयनिक यौगिकों के गलनांक ऊँचे होते हैं और वे पिघलकर या घुलकर चालन करते हैं। मेथेन दोनों नहीं करती।",
        ],
        [
          "Its atoms are held very weakly to each other inside each molecule",
          "हर अणु के अंदर उसके परमाणु एक-दूसरे से बहुत कमज़ोर बँधे हैं",
          "The bonds inside a molecule are strong. It's the pull between separate molecules that is weak.",
          "अणु के अंदर के आबंध प्रबल होते हैं। अलग-अलग अणुओं के बीच का खिंचाव दुर्बल है।",
        ],
      ],
      { passes: true },
    );
    return column([
      w.title(t("Not ionic", "आयनिक नहीं")),
      w.definition(
        t(
          "**Recap: atoms and electrons.** An atom has a small nucleus with **electrons** around it in **shells**. The electrons in the outermost shell are its **valence electrons**. An atom is most stable when its outermost shell is full, like the noble gases: 2 electrons for the first shell, 8 for the others.",
          "**दोहराव: परमाणु और इलेक्ट्रॉन।** परमाणु में एक छोटा नाभिक होता है जिसके चारों ओर **कोशों** में **इलेक्ट्रॉन** होते हैं। सबसे बाहरी कोश के इलेक्ट्रॉन उसके **संयोजकता इलेक्ट्रॉन** हैं। परमाणु तब सबसे स्थायी होता है जब उसका सबसे बाहरी कोश भरा हो, उत्कृष्ट गैसों की तरह: पहले कोश के लिए 2 इलेक्ट्रॉन, बाक़ियों के लिए 8।",
        ),
      ),
      w.body(
        t(
          "In the last chapter, sodium **gave** an electron to chlorine: that made ions, Na⁺ and Cl⁻, held by an **ionic bond**. Ionic compounds have high melting and boiling points, and conduct electricity when molten or dissolved in water, because their ions can move.",
          "पिछले अध्याय में सोडियम ने क्लोरीन को एक इलेक्ट्रॉन **दिया**: इससे आयन बने, Na⁺ और Cl⁻, जो **आयनिक आबंध** से जुड़े। आयनिक यौगिकों के गलनांक और क्वथनांक ऊँचे होते हैं, और पिघलने पर या जल में घुलने पर वे विद्युत का चालन करते हैं, क्योंकि उनके आयन चल सकते हैं।",
        ),
      ),
      w.body(
        t(
          "Carbon compounds are different. NCERT Table 4.1: methane melts at −183 °C and boils at −162 °C; ethanol melts at −117 °C and boils at 78 °C. Most carbon compounds are **poor conductors** of electricity. Low melting points and no conduction mean: weak forces between the molecules, and no ions.",
          "कार्बन यौगिक अलग हैं। NCERT तालिका 4.1: मेथेन −183 °C पर पिघलती है और −162 °C पर उबलती है; एथेनॉल −117 °C पर पिघलता है और 78 °C पर उबलता है। अधिकांश कार्बन यौगिक विद्युत के **कुचालक** हैं। कम गलनांक और चालन नहीं, इसका अर्थ है: अणुओं के बीच दुर्बल बल, और कोई आयन नहीं।",
        ),
      ),
      q,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Carbon's four valence electrons: why it can neither gain nor lose four. */
const four = page(
  "four",
  (b) => {
    const w = wordsOn(b);
    const q = ask(
      b,
      "q",
      ["Why doesn't carbon form a C⁴⁻ ion?", "कार्बन C⁴⁻ आयन क्यों नहीं बनाता?"],
      [
        "Six protons would struggle to hold ten electrons",
        "छह प्रोटॉन दस इलेक्ट्रॉनों को मुश्किल से पकड़ पाएँगे",
      ],
      [
        [
          "Carbon has no electrons to spare",
          "कार्बन के पास देने को इलेक्ट्रॉन नहीं हैं",
          "That's about losing electrons (C⁴⁺). C⁴⁻ would mean gaining four.",
          "वह इलेक्ट्रॉन खोने (C⁴⁺) की बात है। C⁴⁻ का अर्थ चार इलेक्ट्रॉन पाना होगा।",
        ],
        [
          "Carbon's outer shell is already full with four",
          "कार्बन का बाहरी कोश चार से पहले ही भरा है",
          "It has only 4 of the 8 it needs.",
          "इसमें ज़रूरी 8 में से केवल 4 हैं।",
        ],
      ],
      { passes: true },
    );
    return column([
      w.title(t("Carbon has four", "कार्बन के पास चार हैं")),
      w.body(
        t(
          "Carbon's atomic number is 6: its electrons are arranged 2, 4. So it has **four valence electrons** and needs four more, or four fewer, to look like a noble gas.",
          "कार्बन की परमाणु संख्या 6 है: इसके इलेक्ट्रॉन 2, 4 में व्यवस्थित हैं। इसलिए इसके **चार संयोजकता इलेक्ट्रॉन** हैं, और उत्कृष्ट गैस जैसा होने के लिए इसे चार और चाहिए, या चार कम।",
        ),
      ),
      w.definition(
        t(
          "**Why not an ion?** (i) To **gain** four electrons and become C⁴⁻: a nucleus of six protons would have to hold ten electrons, which is hard. (ii) To **lose** four and become C⁴⁺: removing four electrons takes a lot of energy, leaving six protons holding just two electrons. Neither happens easily.",
          "**आयन क्यों नहीं?** (i) चार इलेक्ट्रॉन **पाकर** C⁴⁻ बनना: छह प्रोटॉन वाले नाभिक को दस इलेक्ट्रॉन पकड़ने होंगे, जो कठिन है। (ii) चार **खोकर** C⁴⁺ बनना: चार इलेक्ट्रॉन हटाने में बहुत ऊर्जा लगती है, और छह प्रोटॉन केवल दो इलेक्ट्रॉन पकड़े रह जाते हैं। दोनों आसानी से नहीं होते।",
        ),
      ),
      w.body(
        t(
          "So carbon does something else: it **shares** its valence electrons with other atoms. And it isn't alone: many other elements share electrons too.",
          "तो कार्बन कुछ और करता है: वह अपने संयोजकता इलेक्ट्रॉनों को दूसरे परमाणुओं के साथ **साझा** करता है। और वह अकेला नहीं: कई दूसरे तत्व भी इलेक्ट्रॉन साझा करते हैं।",
        ),
      ),
      q,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Sharing: H₂ step by step; the covalent bond and the single bond. */
const sharing = page(
  "sharing",
  (b) => {
    const w = wordsOn(b);
    const h2 = dotsOn(b, "h2", Molecule.H2);
    b.standsFor(
      h2,
      "two hydrogen atoms, each with one electron (a dot and a cross), stepping together until they share the pair, then drawn as H–H",
    );
    const goal = goalQuestion(b, {
      about: h2,
      prompt: t(
        "Press next until the two atoms share their electrons.",
        "आगे दबाते रहो जब तक दोनों परमाणु अपने इलेक्ट्रॉन साझा न करें।",
      ),
      isMet: h2.derived(CovalentDerived.IsShared),
      solve: [h2.learner(CovalentAction.Next)],
    });
    return column([
      w.title(t("Sharing a pair", "एक जोड़ी की साझेदारी")),
      w.body(
        t(
          "Hydrogen has one electron and needs one more to fill its shell like helium. Two hydrogen atoms solve it together: each puts in its electron, and the **pair** belongs to both.",
          "हाइड्रोजन के पास एक इलेक्ट्रॉन है और हीलियम जैसा कोश भरने के लिए एक और चाहिए। दो हाइड्रोजन परमाणु मिलकर इसे हल करते हैं: हर एक अपना इलेक्ट्रॉन लगाता है, और वह **जोड़ी** दोनों की होती है।",
        ),
      ),
      h2,
      goal,
      w.definition(
        t(
          "**Covalent bond.** A bond formed by **sharing a pair of electrons** between two atoms is a **covalent bond**. One shared pair is a **single bond**, drawn as a single line: H–H. In the picture, one atom's electrons are dots and the other's are crosses, so you can see who gave what.",
          "**सहसंयोजक आबंध।** दो परमाणुओं के बीच **इलेक्ट्रॉन की एक जोड़ी साझा** करके बना आबंध **सहसंयोजक आबंध** है। एक साझा जोड़ी **एकल आबंध** है, जिसे एक रेखा से दिखाते हैं: H–H। चित्र में एक परमाणु के इलेक्ट्रॉन बिंदु हैं और दूसरे के क्रॉस, ताकि दिखे किसने क्या दिया।",
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** O₂ and N₂: double and triple bonds. */
const multiple = page(
  "multiple",
  (b) => {
    const w = wordsOn(b);
    const m = dotsOn(b, "m", Molecule.O2, [Molecule.Cl2, Molecule.O2, Molecule.N2]);
    b.standsFor(
      m,
      "electron-dot builder that switches between chlorine, oxygen and nitrogen molecules, showing one, two or three shared pairs",
    );
    const q = ask(
      b,
      "q",
      [
        "Pick nitrogen and step through. How many pairs do the two atoms share?",
        "नाइट्रोजन चुनो और आगे बढ़ो। दोनों परमाणु कितनी जोड़ियाँ साझा करते हैं?",
      ],
      ["Three: a triple bond", "तीन: एक त्रिआबंध"],
      [
        [
          "One: a single bond",
          "एक: एकल आबंध",
          "Each nitrogen has 5 valence electrons and needs 3 more. One pair isn't enough.",
          "हर नाइट्रोजन के 5 संयोजकता इलेक्ट्रॉन हैं और उसे 3 और चाहिए। एक जोड़ी काफ़ी नहीं।",
        ],
        [
          "Two: a double bond",
          "दो: द्विआबंध",
          "That's oxygen, with 6 valence electrons, needing 2. Nitrogen needs 3.",
          "वह ऑक्सीजन है, 6 संयोजकता इलेक्ट्रॉन, जिसे 2 चाहिए। नाइट्रोजन को 3 चाहिए।",
        ],
      ],
      { passes: true },
    );
    return column([
      w.title(t("Two pairs, three pairs", "दो जोड़ियाँ, तीन जोड़ियाँ")),
      w.body(
        t(
          "Chlorine has 7 valence electrons and needs 1: two chlorine atoms share one pair, like hydrogen. Oxygen has 6 and needs 2, so two oxygen atoms share **two** pairs. Nitrogen has 5 and needs 3.",
          "क्लोरीन के 7 संयोजकता इलेक्ट्रॉन हैं और उसे 1 चाहिए: दो क्लोरीन परमाणु हाइड्रोजन की तरह एक जोड़ी साझा करते हैं। ऑक्सीजन के 6 हैं और उसे 2 चाहिए, इसलिए दो ऑक्सीजन परमाणु **दो** जोड़ियाँ साझा करते हैं। नाइट्रोजन के 5 हैं और उसे 3 चाहिए।",
        ),
      ),
      m,
      w.definition(
        t(
          "**Double and triple bonds.** Two shared pairs make a **double bond**, drawn O=O. Three shared pairs make a **triple bond**, drawn N≡N.",
          "**द्विआबंध और त्रिआबंध।** दो साझा जोड़ियाँ **द्विआबंध** बनाती हैं, लिखा O=O। तीन साझा जोड़ियाँ **त्रिआबंध** बनाती हैं, लिखा N≡N।",
        ),
      ),
      q,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Water, ammonia, methane; strong bonds inside, weak forces between molecules. */
const compounds = page(
  "compounds",
  (b) => {
    const w = wordsOn(b);
    const m = dotsOn(b, "m", Molecule.CH4, [Molecule.H2O, Molecule.NH3, Molecule.CH4]);
    b.standsFor(
      m,
      "electron-dot builder for water, ammonia and methane: the central atom shares one pair with each hydrogen",
    );
    const q = ask(
      b,
      "q",
      [
        "In methane, how many electrons does carbon end up with in its outer shell?",
        "मेथेन में कार्बन के बाहरी कोश में अंत में कितने इलेक्ट्रॉन होते हैं?",
      ],
      ["8: its own 4 plus one from each hydrogen", "8: अपने 4 और हर हाइड्रोजन से एक"],
      [
        [
          "4: it keeps only its own four",
          "4: वह केवल अपने चार रखता है",
          "Each shared pair counts for both atoms, so carbon counts 4 pairs.",
          "हर साझा जोड़ी दोनों परमाणुओं के लिए गिनी जाती है, इसलिए कार्बन 4 जोड़ियाँ गिनता है।",
        ],
        [
          "2, like helium, the nearest noble gas",
          "2, सबसे पास की उत्कृष्ट गैस हीलियम की तरह",
          "That's what each hydrogen gets. Carbon's second shell holds 8.",
          "वह हर हाइड्रोजन को मिलता है। कार्बन का दूसरा कोश 8 रखता है।",
        ],
      ],
      { passes: true },
    );
    return column([
      w.title(t("Water, ammonia, methane", "जल, अमोनिया, मेथेन")),
      w.body(
        t(
          "Atoms of different elements share too. In water, oxygen shares one pair with each of two hydrogens. In ammonia, nitrogen shares with three. In **methane**, CH₄, carbon shares one pair with each of **four** hydrogens. Methane is the main part of biogas and of the CNG that runs buses.",
          "अलग-अलग तत्वों के परमाणु भी साझा करते हैं। जल में ऑक्सीजन दो हाइड्रोजनों में से हर एक के साथ एक जोड़ी साझा करती है। अमोनिया में नाइट्रोजन तीन के साथ। **मेथेन**, CH₄, में कार्बन **चार** हाइड्रोजनों में से हर एक के साथ एक जोड़ी साझा करता है। मेथेन बायोगैस और बसें चलाने वाली CNG का मुख्य भाग है।",
        ),
      ),
      m,
      w.definition(
        t(
          "**Valency.** Carbon forms four bonds, so its **valency** is 4: carbon is **tetravalent**. Covalent bonds hold the atoms **inside** a molecule strongly; the forces **between** separate molecules are small. That is why most covalent compounds have low melting and boiling points, and, having no ions, are poor conductors.",
          "**संयोजकता।** कार्बन चार आबंध बनाता है, इसलिए इसकी **संयोजकता** 4 है: कार्बन **चतुःसंयोजक** है। सहसंयोजक आबंध अणु के **अंदर** परमाणुओं को प्रबलता से जोड़ते हैं; अलग-अलग अणुओं **के बीच** के बल छोटे होते हैं। इसीलिए अधिकांश सहसंयोजक यौगिकों के गलनांक और क्वथनांक कम होते हैं, और आयन न होने से वे कुचालक होते हैं।",
        ),
      ),
      q,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** Back to the list: sugar water, oil, and why none of it conducts. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const list = sceneOn(
      b,
      "list",
      CarbonScene.SupplyList,
      "the supply list and the things on it again",
    );
    const q = ask(
      b,
      "q",
      [
        "Kabir tests sugar water with a battery and bulb: the bulb stays off. Salt water lights it. Why the difference?",
        "कबीर चीनी के पानी को बैटरी और बल्ब से जाँचता है: बल्ब बंद रहता है। नमक का पानी उसे जला देता है। अंतर क्यों?",
      ],
      [
        "Sugar is covalent: no ions in the water. Salt gives ions",
        "चीनी सहसंयोजक है: पानी में आयन नहीं। नमक आयन देता है",
      ],
      [
        [
          "Sugar water is too thick for current to pass",
          "चीनी का पानी धारा के लिए बहुत गाढ़ा है",
          "Thickness isn't it: electricity in a solution is carried by ions, and sugar makes none.",
          "गाढ़ापन कारण नहीं: घोल में विद्युत आयन ले जाते हैं, और चीनी कोई आयन नहीं बनाती।",
        ],
        [
          "Sugar has no carbon, so it can't carry a current",
          "चीनी में कार्बन नहीं है, इसलिए धारा नहीं ले जा सकती",
          "Sugar is a carbon compound, and that's why it's covalent.",
          "चीनी कार्बन यौगिक है, और इसीलिए वह सहसंयोजक है।",
        ],
      ],
    );
    const log = w.definition(
      t(
        "**Mission log.** ✓ Carbon has 4 valence electrons and **shares** them: covalent bonds. ✓ Single, double and triple bonds. ✓ Covalent compounds: low melting points, no ions, poor conductors. Next: carbon on its own, as diamond and graphite.",
        "**मिशन लॉग।** ✓ कार्बन के 4 संयोजकता इलेक्ट्रॉन हैं और वह उन्हें **साझा** करता है: सहसंयोजक आबंध। ✓ एकल, द्वि और त्रि आबंध। ✓ सहसंयोजक यौगिक: कम गलनांक, आयन नहीं, कुचालक। आगे: अकेला कार्बन, हीरा और ग्रेफ़ाइट के रूप में।",
      ),
      "log",
      { isHidden: true },
    );
    const co2 = dotsOn(b, "co2", Molecule.CO2);
    b.standsFor(
      co2,
      "electron-dot structure of carbon dioxide: carbon in the middle, an oxygen on each side",
    );
    const q2 = ask(
      b,
      "q2",
      [
        "NCERT in-text Q1: step through carbon dioxide, CO₂. What bonds join carbon to each oxygen?",
        "NCERT पाठ्य प्रश्न 1: कार्बन डाइऑक्साइड, CO₂, में आगे बढ़ो। कार्बन हर ऑक्सीजन से किन आबंधों से जुड़ा है?",
      ],
      ["A double bond to each: O=C=O", "हर एक से द्विआबंध: O=C=O"],
      [
        [
          "A single bond to each",
          "हर एक से एकल आबंध",
          "Then carbon would have only 6 electrons and each oxygen 7. Count again.",
          "तब कार्बन के पास केवल 6 और हर ऑक्सीजन के पास 7 इलेक्ट्रॉन होंगे। फिर से गिनो।",
        ],
        [
          "A triple bond to one, single to the other",
          "एक से त्रि, दूसरे से एकल",
          "The two oxygens are alike, so the two bonds are alike: two pairs each.",
          "दोनों ऑक्सीजन एक जैसी हैं, इसलिए दोनों आबंध एक जैसे: हर एक में दो जोड़ियाँ।",
        ],
      ],
      { isHidden: true },
    );
    oneByOne(b, [q, q2], [log]);
    return column([
      w.title(t("Back to the list", "सूची पर वापस")),
      list,
      w.body(
        t(
          "While Riya reads up, Kabir tries the old Class 8 test with a battery, a bulb and two wires dipped in a cup.",
          "जब रिया पढ़ रही है, कबीर कक्षा 8 वाला पुराना परीक्षण आज़माता है: एक बैटरी, एक बल्ब और कप में डूबे दो तार।",
        ),
      ),
      q,
      co2,
      q2,
      log,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** NCERT in-text Q2 (S₈) and a quick check. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const s8 = ask(
      b,
      "s8",
      [
        "NCERT in-text Q2: sulphur exists as S₈, eight atoms joined in a ring. Sulphur has 6 valence electrons. How many single bonds does each sulphur atom make?",
        "NCERT पाठ्य प्रश्न 2: सल्फ़र S₈ के रूप में होता है, आठ परमाणु एक वलय में जुड़े। सल्फ़र के 6 संयोजकता इलेक्ट्रॉन हैं। हर सल्फ़र परमाणु कितने एकल आबंध बनाता है?",
      ],
      ["Two: one to each neighbour in the ring", "दो: वलय में हर पड़ोसी से एक"],
      [
        [
          "Eight: it fills its outer shell",
          "आठ: यह अपना बाहरी कोश भरता है",
          "Eight is the number of atoms in the ring. Each atom needs only 2 more electrons.",
          "आठ वलय में परमाणुओं की संख्या है। हर परमाणु को केवल 2 और इलेक्ट्रॉन चाहिए।",
        ],
        [
          "Six: one to every other atom in the ring",
          "छह: वलय के हर दूसरे परमाणु से एक",
          "Six is how many valence electrons it has. It needs 8, so 2 shared pairs.",
          "छह उसके संयोजकता इलेक्ट्रॉन हैं। उसे 8 चाहिए, इसलिए 2 साझा जोड़ियाँ।",
        ],
      ],
    );
    const which = ask(
      b,
      "which",
      ["Which molecule has a triple bond?", "किस अणु में त्रिआबंध है?"],
      ["Nitrogen, N₂", "नाइट्रोजन, N₂"],
      [
        [
          "Oxygen, O₂",
          "ऑक्सीजन, O₂",
          "Oxygen shares two pairs: a double bond.",
          "ऑक्सीजन दो जोड़ियाँ साझा करती है: द्विआबंध।",
        ],
        ["Methane, CH₄", "मेथेन, CH₄", "Methane has four single bonds.", "मेथेन में चार एकल आबंध हैं।"],
      ],
      { isHidden: true },
    );
    const ionic = ask(
      b,
      "ionic",
      [
        "Why don't most carbon compounds conduct electricity?",
        "अधिकांश कार्बन यौगिक विद्युत का चालन क्यों नहीं करते?",
      ],
      ["Their bonds are covalent, so they have no ions", "उनके आबंध सहसंयोजक हैं, इसलिए उनमें आयन नहीं"],
      [
        [
          "Their melting points are too low to conduct",
          "उनके गलनांक चालन के लिए बहुत कम हैं",
          "Low melting points are another clue, but the reason for no conduction is no ions.",
          "कम गलनांक एक और सुराग है, पर चालन न होने का कारण आयन न होना है।",
        ],
        [
          "Carbon is a metal that holds its electrons",
          "कार्बन एक धातु है जो अपने इलेक्ट्रॉन रखती है",
          "Carbon is a non-metal.",
          "कार्बन एक अधातु है।",
        ],
      ],
      { isHidden: true },
    );
    oneByOne(b, [s8, which, ionic]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), s8, which, ionic, space()]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [hook, why, notIonic, four, sharing, multiple, compounds, inLife, yourTurn];

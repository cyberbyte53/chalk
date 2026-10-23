import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { goalQuestion, wordsOn } from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import { Layout, ModernAction, PeriodicScene } from "@chalk/prop-periodic";
import { ask, oneByOne, sceneOn, tableOn } from "../kit";

/** Grandpa: order by protons, not mass. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const numbers = sceneOn(
    b,
    "numbers",
    PeriodicScene.MoseleyNumbers,
    "Riya writing a big number in the corner of each card, 1, 2, 3 and on, while Grandpa points at the numbers",
  );
  return column([
    w.title(t("A better number", "एक बेहतर संख्या")),
    numbers,
    w.body(
      t(
        'Last time: hydrogen, isotopes and uneven masses all trouble a wall ordered by mass. Grandpa taps the corner of each card. **"Forget the mass. Write the number of protons here."** Riya starts renumbering: hydrogen 1, helium 2, lithium 3…',
        'पिछली बार: हाइड्रोजन, समस्थानिक और असमान द्रव्यमान, तीनों द्रव्यमान से सजी दीवार को परेशान करते हैं। दादाजी हर कार्ड के कोने पर उँगली रखते हैं। **"द्रव्यमान भूल जाओ। यहाँ प्रोटॉनों की संख्या लिखो।"** रिया फिर से नंबर लगाने लगती है: हाइड्रोजन 1, हीलियम 2, लीथियम 3…',
      ),
    ),
    w.body(
      t(
        "Stop 5: the modern periodic table, and what an element's place in it tells you.",
        "पड़ाव 5: आधुनिक आवर्त सारणी, और उसमें किसी तत्व की जगह क्या बताती है।",
      ),
    ),
    space(),
  ]);
});

/** Moseley: atomic number. The modern periodic law. */
const moseley = page(
  "moseley",
  (b) => {
    const w = wordsOn(b);
    const table = tableOn(b, "table", { layout: Layout.Full, showShells: false });
    b.standsFor(
      table,
      "the Modern Periodic Table, all 118 elements in 18 columns and 7 rows, each tile with its atomic number; tap a tile to see its card",
    );
    const q1 = ask(
      b,
      "q1",
      [
        "Cobalt is Z = 27 and nickel Z = 28. How does atomic number settle their order?",
        "कोबाल्ट Z = 27 और निकेल Z = 28 है। परमाणु संख्या उनका क्रम कैसे तय करती है?",
      ],
      ["Cobalt comes first: 27 is smaller", "कोबाल्ट पहले आता है: 27 छोटा है"],
      [
        [
          "Nickel comes first: it's lighter",
          "निकेल पहले आता है: वह हल्का है",
          "The modern table orders by atomic number, not mass.",
          "आधुनिक सारणी परमाणु संख्या से क्रम देती है, द्रव्यमान से नहीं।",
        ],
        [
          "They still share one slot",
          "वे अब भी एक खाना बाँटते हैं",
          "Different atomic numbers mean different slots.",
          "अलग परमाणु संख्या का मतलब अलग खाने।",
        ],
      ],
    );
    const q2 = ask(
      b,
      "q2",
      [
        "Cl-35 and Cl-37 both have 17 protons. Where do they go?",
        "Cl-35 और Cl-37 दोनों में 17 प्रोटॉन हैं। वे कहाँ जाते हैं?",
      ],
      ["In one place, at Z = 17", "एक ही जगह, Z = 17 पर"],
      [
        [
          "In two places, by their mass",
          "दो जगहों पर, द्रव्यमान से",
          "The modern table doesn't order by mass. Same Z, same place.",
          "आधुनिक सारणी द्रव्यमान से क्रम नहीं देती। एक Z, एक जगह।",
        ],
        [
          "Nowhere: isotopes aren't in the table",
          "कहीं नहीं: समस्थानिक सारणी में नहीं हैं",
          "They are: both are chlorine, element 17.",
          "हैं: दोनों क्लोरीन हैं, तत्व 17।",
        ],
      ],
      { isHidden: true },
    );
    const q3 = ask(
      b,
      "q3",
      [
        "Could an element with atomic number 1.5 sit between hydrogen and helium?",
        "क्या परमाणु संख्या 1.5 वाला कोई तत्व हाइड्रोजन और हीलियम के बीच आ सकता है?",
      ],
      ["No: protons come in whole numbers", "नहीं: प्रोटॉन पूरी संख्याओं में होते हैं"],
      [
        [
          "Yes: it just hasn't been found",
          "हाँ: वह बस अभी मिला नहीं",
          "Half a proton isn't possible, so there is no gap there.",
          "आधा प्रोटॉन संभव नहीं, इसलिए वहाँ कोई ख़ाली जगह नहीं।",
        ],
        [
          "Yes: if it is an isotope",
          "हाँ: अगर वह समस्थानिक हो",
          "Isotopes of an element share its atomic number.",
          "किसी तत्व के समस्थानिकों की परमाणु संख्या वही होती है।",
        ],
      ],
      { isHidden: true },
    );
    oneByOne(b, [q1, q2, q3]);
    return column([
      w.title(t("Atomic number", "परमाणु संख्या")),
      w.definition(
        t(
          "**Atomic number (Z).** The number of **protons** in the nucleus of an atom is its **atomic number**, Z. It goes up by exactly one from each element to the next: hydrogen 1, helium 2, lithium 3.",
          "**परमाणु संख्या (Z)।** किसी परमाणु के नाभिक में **प्रोटॉनों** की संख्या उसकी **परमाणु संख्या** Z है। यह हर तत्व से अगले तक ठीक एक बढ़ती है: हाइड्रोजन 1, हीलियम 2, लीथियम 3।",
        ),
      ),
      w.body(
        t(
          "In 1913 **Henry Moseley** showed that atomic number is a **more fundamental** property of an element than its atomic mass. So Mendeléev's law was changed.",
          "1913 में **हेनरी मोज़ले** ने दिखाया कि परमाणु संख्या किसी तत्व का परमाणु द्रव्यमान से **अधिक मूल** गुण है। इसलिए मेंडेलीफ़ का नियम बदला गया।",
        ),
      ),
      w.definition(
        t(
          "**Modern periodic law.** Properties of elements are a **periodic function of their atomic number**. Arranged in order of increasing atomic number, the elements make the **Modern Periodic Table**. Properties can be predicted more precisely this way.",
          "**आधुनिक आवर्त नियम।** तत्वों के गुण उनकी **परमाणु संख्या के आवर्ती फलन** हैं। बढ़ती परमाणु संख्या के क्रम में सजे तत्व **आधुनिक आवर्त सारणी** बनाते हैं। इस तरह गुणों का अनुमान अधिक सटीकता से लगता है।",
        ),
      ),
      table,
      q1,
      q2,
      q3,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Groups: same valence electrons. */
const groups = page(
  "groups",
  (b) => {
    const w = wordsOn(b);
    const table = tableOn(b, "table", { highlightGroup: 1 });
    b.standsFor(
      table,
      "the first 20 elements in 8 columns, group 1 (H, Li, Na, K) lit; tap an element to see its shells drawn as rings and its valence electrons",
    );
    const goal = goalQuestion(b, {
      about: table,
      prompt: t(
        "Tap sodium (Na, Z = 11). Count the electrons in its outermost shell.",
        "सोडियम (Na, Z = 11) पर टैप करो। उसके सबसे बाहरी कोश के इलेक्ट्रॉन गिनो।",
      ),
      isMet: table.field("selected").eq(11),
      solve: [table.learner(ModernAction.Tap, { z: 11 })],
    });
    const q = ask(
      b,
      "q",
      [
        "Fluorine and chlorine are both in group 17. How many electrons are in their outermost shells?",
        "फ़्लुओरीन और क्लोरीन दोनों समूह 17 में हैं। उनके सबसे बाहरी कोशों में कितने इलेक्ट्रॉन हैं?",
      ],
      ["7 each", "हर एक में 7"],
      [
        [
          "17 each",
          "हर एक में 17",
          "17 is the group number and chlorine's atomic number, not its outer electrons.",
          "17 समूह संख्या और क्लोरीन की परमाणु संख्या है, बाहरी इलेक्ट्रॉन नहीं।",
        ],
        [
          "9 and 17",
          "9 और 17",
          "Those are their atomic numbers, all their electrons.",
          "वे उनकी परमाणु संख्याएँ हैं, सारे इलेक्ट्रॉन।",
        ],
      ],
      { isHidden: true },
    );
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(q));
    return column([
      w.title(t("Groups and periods", "समूह और आवर्त")),
      w.definition(
        t(
          "**Groups and periods.** The Modern Periodic Table has **18** vertical columns called **groups** and **7** horizontal rows called **periods**. Two things decide an element's place: its **valence electrons** (the electrons in its outermost shell) and its **number of shells**.",
          "**समूह और आवर्त।** आधुनिक आवर्त सारणी में **18** ऊर्ध्व स्तंभ हैं जिन्हें **समूह** कहते हैं, और **7** क्षैतिज पंक्तियाँ जिन्हें **आवर्त** कहते हैं। किसी तत्व की जगह दो चीज़ें तय करती हैं: उसके **संयोजकता इलेक्ट्रॉन** (सबसे बाहरी कोश के इलेक्ट्रॉन) और उसके **कोशों की संख्या**।",
        ),
      ),
      w.body(
        t(
          "Group 1 holds lithium (2, 1), sodium (2, 8, 1) and potassium (2, 8, 8, 1). Their electronic configurations end the same way: each has **one** valence electron.",
          "समूह 1 में लीथियम (2, 1), सोडियम (2, 8, 1) और पोटैशियम (2, 8, 8, 1) हैं। उनके इलेक्ट्रॉनिक विन्यास एक जैसे ख़त्म होते हैं: हर एक में **एक** संयोजकता इलेक्ट्रॉन है।",
        ),
      ),
      w.body(
        t(
          "The table below shows only the first 20 elements, so the middle groups (3 to 12) are hidden. Its 8 columns are groups **1, 2, 13, 14, 15, 16, 17 and 18**.",
          "नीचे की सारणी में केवल पहले 20 तत्व हैं, इसलिए बीच के समूह (3 से 12) छिपे हैं। इसके 8 स्तंभ समूह **1, 2, 13, 14, 15, 16, 17 और 18** हैं।",
        ),
      ),
      table,
      goal,
      w.body(
        t(
          "Elements in the same group have **the same number of valence electrons**, an identical outer-shell configuration. Going **down** a group, the **number of shells increases**.",
          "एक ही समूह के तत्वों में **संयोजकता इलेक्ट्रॉनों की संख्या समान** होती है, बाहरी कोश का विन्यास एक जैसा। समूह में **नीचे** जाने पर **कोशों की संख्या बढ़ती है**।",
        ),
      ),
      q,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Periods: same number of shells; 2n². */
const periods = page(
  "periods",
  (b) => {
    const w = wordsOn(b);
    const table = tableOn(b, "table", { highlightPeriod: 2 });
    b.standsFor(
      table,
      "the first 20 elements with period 2 (Li to Ne) lit; tap any of them to see two shells, the outer one filling up one electron at a time",
    );
    const q1 = ask(
      b,
      "q1",
      [
        "Li, Be, B, C, N, O, F and Ne are all in period 2. What do they share?",
        "Li, Be, B, C, N, O, F और Ne सभी आवर्त 2 में हैं। उनमें क्या समान है?",
      ],
      ["The same number of shells: two", "कोशों की समान संख्या: दो"],
      [
        [
          "The same number of valence electrons",
          "संयोजकता इलेक्ट्रॉनों की समान संख्या",
          "That's what a group shares. Across a period the valence electrons go up by one.",
          "वह समूह में समान होता है। आवर्त में संयोजकता इलेक्ट्रॉन एक-एक बढ़ते हैं।",
        ],
        [
          "The same atomic mass, about 10 u",
          "समान परमाणु द्रव्यमान, लगभग 10 u",
          "Their masses run from 6.9 u to 20.2 u.",
          "उनके द्रव्यमान 6.9 u से 20.2 u तक हैं।",
        ],
      ],
    );
    const q2 = ask(
      b,
      "q2",
      [
        "Hydrogen has one electron. Why can it go in group 1 or group 17?",
        "हाइड्रोजन में एक इलेक्ट्रॉन है। यह समूह 1 या समूह 17 में क्यों जा सकता है?",
      ],
      [
        "One electron, like group 1; one short of full, like 17",
        "एक इलेक्ट्रॉन, समूह 1 जैसा; भरने में एक कम, 17 जैसा",
      ],
      [
        [
          "Its mass sits between the masses of the two groups",
          "इसका द्रव्यमान दोनों समूहों के द्रव्यमानों के बीच है",
          "The modern table doesn't use mass. It's about electrons.",
          "आधुनिक सारणी द्रव्यमान इस्तेमाल नहीं करती। बात इलेक्ट्रॉनों की है।",
        ],
        [
          "It has two isotopes that need two separate places",
          "इसके दो समस्थानिक हैं जिन्हें दो अलग जगहें चाहिए",
          "Isotopes share one place. The puzzle is hydrogen's one electron.",
          "समस्थानिक एक जगह बाँटते हैं। पहेली हाइड्रोजन का एक इलेक्ट्रॉन है।",
        ],
      ],
      { isHidden: true },
    );
    oneByOne(b, [q1, q2]);
    return column([
      w.title(t("Rows mean shells", "पंक्तियाँ मतलब कोश")),
      table,
      w.body(
        t(
          "Elements in the same period do **not** have the same valence electrons, but they have **the same number of shells**. Moving left to right, the valence electrons **increase by one** as the atomic number goes up by one. Na to Ar in period 3 all fill the K, L and M shells. **Each period marks a new shell being filled.**",
          "एक ही आवर्त के तत्वों में संयोजकता इलेक्ट्रॉन समान **नहीं** होते, पर **कोशों की संख्या समान** होती है। बाएँ से दाएँ जाने पर, परमाणु संख्या एक बढ़ने पर संयोजकता इलेक्ट्रॉन **एक बढ़ते** हैं। आवर्त 3 में Na से Ar तक, सभी K, L और M कोश भरते हैं। **हर आवर्त एक नए कोश के भरने को दिखाता है।**",
        ),
      ),
      w.body(
        t(
          "A shell can hold at most 2n² electrons, where n is the shell's number counting out from the nucleus.",
          "एक कोश में अधिकतम 2n² इलेक्ट्रॉन आ सकते हैं, जहाँ n नाभिक से गिनकर कोश की संख्या है।",
        ),
      ),
      w.body(
        t(
          "$$\\text{K shell: } 2 \\times 1^2 = 2 \\qquad \\text{L shell: } 2 \\times 2^2 = 8$$",
          "$$\\text{K कोश: } 2 \\times 1^2 = 2 \\qquad \\text{L कोश: } 2 \\times 2^2 = 8$$",
        ),
      ),
      w.body(
        t(
          "So the first period has 2 elements and the second has 8. The third to seventh periods have 8, 18, 18, 32 and 32 elements; why, you'll see in higher classes.",
          "इसलिए पहले आवर्त में 2 तत्व हैं और दूसरे में 8। तीसरे से सातवें आवर्त में 8, 18, 18, 32 और 32 तत्व हैं; क्यों, यह तुम आगे की कक्षाओं में देखोगे।",
        ),
      ),
      q1,
      q2,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Why Mendeléev's choice of formulae was a good one. */
const whyGood = page(
  "why-good",
  (b) => {
    const w = wordsOn(b);
    const q = ask(
      b,
      "q",
      [
        "Why did grouping by oxide and hydride formulae work so well for Mendeléev?",
        "मेंडेलीफ़ के लिए ऑक्साइड और हाइड्राइड के सूत्रों से समूह बनाना इतना अच्छा क्यों चला?",
      ],
      [
        "Formulae depend on valence electrons, like groups",
        "सूत्र संयोजकता इलेक्ट्रॉनों पर निर्भर हैं, समूहों जैसे",
      ],
      [
        [
          "Formulae depend on atomic mass, like his law",
          "सूत्र परमाणु द्रव्यमान पर निर्भर हैं, उनके नियम जैसे",
          "Two elements of very different mass can share a formula (LiCl, KCl).",
          "बहुत अलग द्रव्यमान वाले दो तत्व एक सूत्र बाँट सकते हैं (LiCl, KCl)।",
        ],
        [
          "Formulae show the number of shells, like periods",
          "सूत्र कोशों की संख्या दिखाते हैं, आवर्तों जैसे",
          "Li and K have different shells but the same formula type, so it's not shells.",
          "Li और K के कोश अलग हैं पर सूत्र एक प्रकार का है, इसलिए बात कोशों की नहीं।",
        ],
      ],
      { passes: true },
    );
    return column([
      w.title(t("Mendeléev was onto something", "मेंडेलीफ़ सही दिशा में थे")),
      w.body(
        t(
          "An element's place in the table tells you about its **chemical reactivity**, because its valence electrons decide the kind and number of bonds it forms. That's why the formulae of its compounds follow its group.",
          "सारणी में किसी तत्व की जगह उसकी **रासायनिक क्रियाशीलता** के बारे में बताती है, क्योंकि उसके संयोजकता इलेक्ट्रॉन तय करते हैं कि वह किस प्रकार के और कितने आबंध बनाएगा। इसीलिए उसके यौगिकों के सूत्र उसके समूह के अनुसार चलते हैं।",
        ),
      ),
      q,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Back to Riya's numbers. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const numbers = sceneOn(b, "numbers", PeriodicScene.MoseleyNumbers, "the renumbered cards");
    const q = ask(
      b,
      "q",
      [
        "With the cards in order of Z, which of Kabir's old problems is still left?",
        "Z के क्रम में कार्डों के साथ, कबीर की पुरानी समस्याओं में से कौन-सी अब भी बची है?",
      ],
      ["Hydrogen: group 1 or group 17?", "हाइड्रोजन: समूह 1 या समूह 17?"],
      [
        [
          "Cobalt and nickel: which comes first?",
          "कोबाल्ट और निकेल: कौन पहले?",
          "Z settles it: cobalt 27, nickel 28.",
          "Z इसे तय करता है: कोबाल्ट 27, निकेल 28।",
        ],
        [
          "Cl-35 and Cl-37: one slot or two?",
          "Cl-35 और Cl-37: एक खाना या दो?",
          "Both are Z = 17: one slot.",
          "दोनों Z = 17 हैं: एक खाना।",
        ],
      ],
      { passes: true },
    );
    return column([
      w.title(t("Two problems gone", "दो समस्याएँ ग़ायब")),
      numbers,
      w.body(
        t(
          "Riya rebuilds the wall in order of atomic number, 18 columns wide. Cobalt slides in before nickel without any special excuse. Both chlorine cards stack in one slot. Kabir grins, then holds up hydrogen again.",
          "रिया दीवार को परमाणु संख्या के क्रम में, 18 स्तंभ चौड़ी, फिर से बनाती है। कोबाल्ट बिना किसी ख़ास बहाने के निकेल से पहले आ जाता है। क्लोरीन के दोनों कार्ड एक खाने में रख दिए जाते हैं। कबीर मुस्कुराता है, फिर हाइड्रोजन फिर से उठा लेता है।",
        ),
      ),
      q,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Practice: Exercises 3 and 5; the log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const q1 = ask(
      b,
      "q1",
      [
        "Which element has the electronic configuration 2, 8, 2?",
        "किस तत्व का इलेक्ट्रॉनिक विन्यास 2, 8, 2 है?",
      ],
      ["Magnesium (Z = 12)", "मैग्नीशियम (Z = 12)"],
      [
        [
          "Beryllium (Z = 4)",
          "बेरिलियम (Z = 4)",
          "Beryllium is 2, 2: two shells, not three.",
          "बेरिलियम 2, 2 है: दो कोश, तीन नहीं।",
        ],
        [
          "Calcium (Z = 20)",
          "कैल्सियम (Z = 20)",
          "Calcium is 2, 8, 8, 2: four shells.",
          "कैल्सियम 2, 8, 8, 2 है: चार कोश।",
        ],
      ],
    );
    const q2 = ask(
      b,
      "q2",
      [
        "Which element has two shells, both completely filled?",
        "किस तत्व के दो कोश हैं, दोनों पूरे भरे हुए?",
      ],
      ["Neon (2, 8)", "नियॉन (2, 8)"],
      [
        ["Helium (2)", "हीलियम (2)", "Helium has only one shell.", "हीलियम में केवल एक कोश है।"],
        [
          "Fluorine (2, 7)",
          "फ़्लुओरीन (2, 7)",
          "Its second shell is one short of 8.",
          "इसका दूसरा कोश 8 से एक कम है।",
        ],
      ],
      { isHidden: true },
    );
    const q3 = ask(
      b,
      "q3",
      [
        "An atom is 2, 8, 7. What is its atomic number, and which of N, F, P, Ar is it like?",
        "एक परमाणु 2, 8, 7 है। उसकी परमाणु संख्या क्या है, और वह N, F, P, Ar में से किस जैसा है?",
      ],
      ["17, like fluorine (2, 7)", "17, फ़्लुओरीन (2, 7) जैसा"],
      [
        [
          "17, like argon (2, 8, 8)",
          "17, आर्गन (2, 8, 8) जैसा",
          "Same period isn't the same family. Argon's outer shell is full.",
          "एक आवर्त का मतलब एक परिवार नहीं। आर्गन का बाहरी कोश भरा है।",
        ],
        [
          "7, like nitrogen (2, 5)",
          "7, नाइट्रोजन (2, 5) जैसा",
          "Add all the electrons: 2 + 8 + 7 = 17.",
          "सारे इलेक्ट्रॉन जोड़ो: 2 + 8 + 7 = 17।",
        ],
      ],
      { isHidden: true },
    );
    const log = w.definition(
      t(
        "**Mission log.** ✓ Order by atomic number Z, not mass: Co/Ni and isotopes are solved. ✓ A group shares its valence electrons; a period shares its number of shells. ✓ 2n² explains periods of 2 and 8. ✗ Hydrogen still sits awkwardly. Next: reading trends off the wall, and Quiz Night.",
        "**मिशन लॉग।** ✓ द्रव्यमान नहीं, परमाणु संख्या Z से क्रम: Co/Ni और समस्थानिक सुलझे। ✓ एक समूह अपने संयोजकता इलेक्ट्रॉन बाँटता है; एक आवर्त अपने कोशों की संख्या। ✓ 2n² से 2 और 8 के आवर्त समझ आते हैं। ✗ हाइड्रोजन अब भी उलझा है। आगे: दीवार से प्रवृत्तियाँ पढ़ना, और क्विज़ नाइट।",
      ),
      "log",
      { isHidden: true },
    );
    oneByOne(b, [q1, q2, q3], [log]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), q1, q2, q3, log, space()]);
  },
  { passOn: PassOn.Rules },
);

export const overview = [hook, moseley, groups, periods, whyGood, inLife, yourTurn];

import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { goalQuestion, wordsOn } from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  Anomaly,
  Gap,
  MendeleevAction,
  MendeleevDerived,
  MendeleevMode,
  PeriodicScene,
} from "@chalk/prop-periodic";
import { ask, mendeleevOn, oneByOne, sceneOn } from "../kit";

/** Grandpa's idea: a wall, with room for gaps. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const wall = sceneOn(
    b,
    "wall",
    PeriodicScene.CardWall,
    "element cards pinned on the bedroom wall in rows and columns, with a few empty spaces left between them",
  );
  return column([
    w.title(t("A wall with gaps", "ख़ाली जगहों वाली दीवार")),
    wall,
    w.body(
      t(
        "Last time: the octaves worked up to calcium, then broke. Grandpa clears a wall in the bedroom. **\"Mendeléev didn't force every card into the next slot. When a card didn't fit, he left a space and said: an element we haven't found yet goes here.\"** Kabir is doubtful. Leaving holes on purpose?",
        'पिछली बार: अष्टक कैल्सियम तक चले, फिर टूट गए। दादाजी कमरे की एक दीवार ख़ाली करते हैं। **"मेंडेलीफ़ ने हर कार्ड को ज़बरदस्ती अगले खाने में नहीं डाला। जब कोई कार्ड फ़िट नहीं हुआ, उन्होंने जगह ख़ाली छोड़ी और कहा: यहाँ वह तत्व आएगा जो अभी मिला नहीं है।"** कबीर को शक है। जानबूझकर छेद छोड़ना?',
      ),
    ),
    w.body(
      t(
        "Stop 3: how did Mendeléev build his table, and why were the gaps its greatest success?",
        "पड़ाव 3: मेंडेलीफ़ ने अपनी सारणी कैसे बनाई, और ख़ाली जगहें उसकी सबसे बड़ी सफलता क्यों थीं?",
      ),
    ),
    space(),
  ]);
});

/** Oxides and hydrides; the periodic law; groups and periods. */
const basis = page(
  "basis",
  (b) => {
    const w = wordsOn(b);
    const table = mendeleevOn(b, "table", MendeleevMode.Table);
    b.standsFor(
      table,
      "Mendeléev's 1872 table: groups I to VIII across the top with their oxide and hydride formulae (R₂O, RO, … and RH, RH₂, …), the elements in rows by atomic mass; tap a card to see its group, oxide and hydride",
    );
    const goal = goalQuestion(b, {
      about: table,
      prompt: t(
        "Tap carbon (C). Read its group and the formula of its oxide.",
        "कार्बन (C) पर टैप करो। उसका समूह और उसके ऑक्साइड का सूत्र पढ़ो।",
      ),
      isMet: table.field("selected").eq("C"),
      solve: [table.learner(MendeleevAction.Tap, { symbol: "C" })],
    });
    return column([
      w.title(t("Mendeléev's table", "मेंडेलीफ़ की सारणी")),
      w.body(
        t(
          "The main credit for classifying the elements goes to a Russian chemist, **Dmitri Ivanovich Mendeléev**. When he started, **63 elements** were known. He looked at each element's atomic mass and its properties, especially the **compounds it forms with oxygen and hydrogen**. He chose these two because they are very reactive and combine with most elements.",
          "तत्वों के वर्गीकरण का मुख्य श्रेय एक रूसी रसायनज्ञ, **दिमित्री इवानोविच मेंडेलीफ़**, को जाता है। जब उन्होंने शुरू किया, **63 तत्व** ज्ञात थे। उन्होंने हर तत्व का परमाणु द्रव्यमान और उसके गुण देखे, ख़ासकर **ऑक्सीजन और हाइड्रोजन से बनने वाले उसके यौगिक**। उन्होंने ये दोनों इसलिए चुने क्योंकि ये बहुत क्रियाशील हैं और ज़्यादातर तत्वों से जुड़ते हैं।",
        ),
      ),
      w.definition(
        t(
          "**Oxide, hydride.** A compound of an element with oxygen is its **oxide**; with hydrogen, its **hydride**. At the top of each column Mendeléev wrote the formulae with the letter **R** standing for any element of that column. Carbon's hydride CH₄ is written RH₄, and its oxide CO₂ is written RO₂.",
          "**ऑक्साइड, हाइड्राइड।** किसी तत्व का ऑक्सीजन के साथ यौगिक उसका **ऑक्साइड** है; हाइड्रोजन के साथ, उसका **हाइड्राइड**। हर स्तंभ के ऊपर मेंडेलीफ़ ने सूत्र लिखे, जिनमें अक्षर **R** उस स्तंभ के किसी भी तत्व के लिए है। कार्बन का हाइड्राइड CH₄, RH₄ लिखा जाता है, और उसका ऑक्साइड CO₂, RO₂।",
        ),
      ),
      w.body(
        t(
          "He wrote each element's properties on a card, sorted cards with similar properties, and pinned them on a wall. Most elements fell into place in order of increasing atomic mass, and similar properties kept coming back at regular intervals.",
          "उन्होंने हर तत्व के गुण एक कार्ड पर लिखे, समान गुणों वाले कार्ड छाँटे, और उन्हें दीवार पर लगाया। ज़्यादातर तत्व बढ़ते परमाणु द्रव्यमान के क्रम में अपनी जगह आ गए, और समान गुण नियमित अंतराल पर लौटते रहे।",
        ),
      ),
      w.definition(
        t(
          "**Mendeléev's periodic law.** The properties of elements are a **periodic function of their atomic masses**: they repeat at regular intervals as the atomic mass increases. In his table the vertical columns are **groups** and the horizontal rows are **periods**.",
          "**मेंडेलीफ़ का आवर्त नियम।** तत्वों के गुण उनके **परमाणु द्रव्यमानों के आवर्ती फलन** हैं: परमाणु द्रव्यमान बढ़ने पर वे नियमित अंतराल पर दोहराते हैं। उनकी सारणी में ऊर्ध्व स्तंभ **समूह** हैं और क्षैतिज पंक्तियाँ **आवर्त** हैं।",
        ),
      ),
      table,
      goal,
      w.body(
        t(
          "Carbon is in group IV, whose oxide is RO₂: put C for R and you get CO₂.",
          "कार्बन समूह IV में है, जिसका ऑक्साइड RO₂ है: R की जगह C रखो तो CO₂ मिलता है।",
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Cobalt before nickel: likeness over mass. */
const order = page(
  "order",
  (b) => {
    const w = wordsOn(b);
    const p = mendeleevOn(b, "p", MendeleevMode.Anomalies, { anomaly: Anomaly.CoNi });
    b.standsFor(
      p,
      "cobalt (58.9) and nickel (58.7) side by side: by mass nickel should come first, but Mendeléev placed cobalt first so that each sits with elements it resembles",
    );
    const q = ask(
      b,
      "q",
      [
        "Why did Mendeléev put cobalt (58.9) before nickel (58.7)?",
        "मेंडेलीफ़ ने कोबाल्ट (58.9) को निकेल (58.7) से पहले क्यों रखा?",
      ],
      ["To group elements with similar properties", "समान गुणों वाले तत्वों को एक साथ रखने के लिए"],
      [
        [
          "Because he misread their atomic masses",
          "क्योंकि उन्होंने उनके द्रव्यमान ग़लत पढ़े",
          "He knew the masses. He swapped them on purpose.",
          "वे द्रव्यमान जानते थे। उन्होंने जानबूझकर अदला-बदली की।",
        ],
        [
          "Because heavier elements always come first",
          "क्योंकि भारी तत्व हमेशा पहले आते हैं",
          "His table runs from light to heavy. This was a deliberate exception.",
          "उनकी सारणी हल्के से भारी की ओर चलती है। यह जानबूझकर किया अपवाद था।",
        ],
      ],
      { passes: true },
    );
    return column([
      w.title(t("Likeness beats mass", "समानता द्रव्यमान से ऊपर")),
      w.body(
        t(
          "In a few places Mendeléev put a slightly heavier element **before** a slightly lighter one. He **inverted** the order so that elements with similar properties stay in the same group.",
          "कुछ जगहों पर मेंडेलीफ़ ने थोड़े भारी तत्व को थोड़े हल्के तत्व से **पहले** रखा। उन्होंने क्रम **उलट** दिया ताकि समान गुणों वाले तत्व एक ही समूह में रहें।",
        ),
      ),
      p,
      w.body(
        t(
          "With today's masses there is another such pair: tellurium (127.6) comes before iodine (126.9), so that iodine sits with chlorine and bromine.",
          "आज के द्रव्यमानों से एक और ऐसी जोड़ी है: टेल्यूरियम (127.6), आयोडीन (126.9) से पहले आता है, ताकि आयोडीन क्लोरीन और ब्रोमीन के साथ रहे।",
        ),
      ),
      q,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The gaps: eka-aluminium and gallium. */
const gaps = page(
  "gaps",
  (b) => {
    const w = wordsOn(b);
    const p = mendeleevOn(b, "p", MendeleevMode.Predict);
    b.standsFor(
      p,
      "Mendeléev's prediction for eka-aluminium (atomic mass 68, oxide E₂O₃, chloride ECl₃) beside gallium's real values, hidden until revealed",
    );
    const goal = goalQuestion(b, {
      about: p,
      prompt: t(
        "Reveal gallium. How close was the prediction?",
        "गैलियम दिखाओ। अनुमान कितना पास था?",
      ),
      isMet: p.derived(MendeleevDerived.RevealedCount).ge(1),
      solve: [p.learner(MendeleevAction.Reveal, { gap: Gap.EkaAluminium })],
    });
    const q = ask(
      b,
      "q",
      [
        "Besides gallium, which elements filled Mendeléev's other gaps?",
        "गैलियम के अलावा, मेंडेलीफ़ की दूसरी ख़ाली जगहें किन तत्वों ने भरीं?",
      ],
      ["Scandium and germanium", "स्कैंडियम और जर्मेनियम"],
      [
        [
          "Sodium and potassium",
          "सोडियम और पोटैशियम",
          "Those were already known and already in his table.",
          "वे पहले से ज्ञात थे और उनकी सारणी में थे।",
        ],
        [
          "Helium and neon",
          "हीलियम और नियॉन",
          "The noble gases got a new group of their own; they didn't fill gaps.",
          "उत्कृष्ट गैसों को अपना नया समूह मिला; उन्होंने ख़ाली जगहें नहीं भरीं।",
        ],
      ],
      { isHidden: true },
    );
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(q));
    return column([
      w.title(t("Predicting the missing", "जो नहीं मिले उनका अनुमान")),
      w.body(
        t(
          "Mendeléev left **gaps** in his table. He didn't treat them as mistakes: he boldly said that elements not yet discovered would fill them. He named each one by putting the Sanskrit numeral **eka** (one) before the element above it in the same group: **eka-boron**, **eka-aluminium**, **eka-silicon**.",
          "मेंडेलीफ़ ने अपनी सारणी में **ख़ाली जगहें** छोड़ीं। उन्होंने इन्हें ग़लती नहीं माना: साहस से कहा कि जो तत्व अभी खोजे नहीं गए वे इन्हें भरेंगे। उन्होंने हर एक का नाम उसी समूह में ऊपर वाले तत्व के आगे संस्कृत अंक **एका** (एक) लगाकर रखा: **एका-बोरॉन**, **एका-ऐलुमिनियम**, **एका-सिलिकॉन**।",
        ),
      ),
      p,
      goal,
      w.body(
        t(
          "Gallium, found later, matched eka-aluminium almost exactly: atomic mass 69.7 against the predicted 68, oxide Ga₂O₃ against E₂O₃, chloride GaCl₃ against ECl₃. **Scandium** and **germanium**, also found later, matched eka-boron and eka-silicon. This convinced chemists that his table was both correct and useful, and made Mendeléev known as its originator.",
          "बाद में मिला गैलियम एका-ऐलुमिनियम से लगभग पूरा मिला: परमाणु द्रव्यमान 69.7, अनुमान 68; ऑक्साइड Ga₂O₃, अनुमान E₂O₃; क्लोराइड GaCl₃, अनुमान ECl₃। बाद में मिले **स्कैंडियम** और **जर्मेनियम** एका-बोरॉन और एका-सिलिकॉन से मिले। इससे रसायनज्ञों को विश्वास हुआ कि उनकी सारणी सही भी है और उपयोगी भी, और मेंडेलीफ़ इसके जनक माने गए।",
        ),
      ),
      q,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The noble gases fit in without disturbing anything. */
const noble = page(
  "noble",
  (b) => {
    const w = wordsOn(b);
    const p = mendeleevOn(b, "p", MendeleevMode.Table, { showNoble: true });
    b.standsFor(
      p,
      "Mendeléev's table with a new column added at the edge for the noble gases He, Ne, Ar, Kr, Xe, the rest of the table unchanged",
    );
    const q = ask(
      b,
      "q",
      ["Why do the noble gases sit in a separate group?", "उत्कृष्ट गैसें एक अलग समूह में क्यों हैं?"],
      ["They are very inert, unlike every other group", "वे बहुत अक्रिय हैं, किसी और समूह जैसी नहीं"],
      [
        [
          "They are the lightest elements in each row",
          "वे हर पंक्ति के सबसे हल्के तत्व हैं",
          "They come at the end of each row, not the start. They are grouped by how they behave.",
          "वे हर पंक्ति के अंत में आती हैं, शुरू में नहीं। उन्हें व्यवहार के आधार पर रखा गया।",
        ],
        [
          "They react fastest of all with oxygen",
          "वे ऑक्सीजन से सबसे तेज़ अभिक्रिया करती हैं",
          "They hardly react at all; that's why they were found so late.",
          "वे मुश्किल से अभिक्रिया करती हैं; इसीलिए इतनी देर से मिलीं।",
        ],
      ],
      { passes: true },
    );
    return column([
      w.title(t("Room for the noble gases", "उत्कृष्ट गैसों के लिए जगह")),
      w.body(
        t(
          "Helium, neon and argon were discovered very late: they are very **inert** (they hardly react) and present in only tiny amounts in the air. When they were found, they fitted into a **new group** at the edge of Mendeléev's table without disturbing the existing order. That too was a strength of his table.",
          "हीलियम, नियॉन और आर्गन बहुत देर से खोजी गईं: वे बहुत **अक्रिय** हैं (मुश्किल से अभिक्रिया करती हैं) और हवा में बहुत कम मात्रा में हैं। जब वे मिलीं, तो मेंडेलीफ़ की सारणी के किनारे एक **नए समूह** में फ़िट हो गईं, मौजूदा क्रम को बिना छेड़े। यह भी उनकी सारणी की एक ताक़त थी।",
        ),
      ),
      p,
      q,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Back to the wall: Kabir's gap. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const wall = sceneOn(b, "wall", PeriodicScene.CardWall, "the card wall with its gaps again");
    const q = ask(
      b,
      "q",
      [
        "Kabir's quiz card asks for the oxide of gallium. Gallium is in group III, under aluminium (Al₂O₃). What does the wall predict?",
        "कबीर का क्विज़-कार्ड गैलियम का ऑक्साइड पूछता है। गैलियम समूह III में, ऐलुमिनियम (Al₂O₃) के नीचे है। दीवार क्या अनुमान लगाती है?",
      ],
      ["Ga₂O₃, like aluminium's", "Ga₂O₃, ऐलुमिनियम जैसा"],
      [
        [
          "GaO, like magnesium's",
          "GaO, मैग्नीशियम जैसा",
          "Magnesium is in group II. Gallium follows its own group, III: R₂O₃.",
          "मैग्नीशियम समूह II में है। गैलियम अपने समूह III को मानता है: R₂O₃।",
        ],
        [
          "GaO₂, like carbon's",
          "GaO₂, कार्बन जैसा",
          "RO₂ is group IV's oxide. Gallium is in group III.",
          "RO₂ समूह IV का ऑक्साइड है। गैलियम समूह III में है।",
        ],
      ],
      { passes: true },
    );
    return column([
      w.title(t("The gap that answers", "जवाब देने वाली ख़ाली जगह")),
      wall,
      w.body(
        t(
          "Kabir pins the cards in columns that behave alike, leaving holes where nothing fits. Then he tries a practice quiz card about an element he's never studied. He doesn't need to know it: the wall tells him what its neighbours do.",
          "कबीर कार्डों को ऐसे स्तंभों में लगाता है जो एक जैसा व्यवहार करते हैं, और जहाँ कुछ फ़िट नहीं होता वहाँ छेद छोड़ता है। फिर वह एक ऐसे तत्व पर अभ्यास-क्विज़ कार्ड आज़माता है जिसे उसने कभी नहीं पढ़ा। उसे उसे जानने की ज़रूरत नहीं: दीवार बताती है कि उसके पड़ोसी क्या करते हैं।",
        ),
      ),
      q,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Practice: oxides from the table; the criteria; the log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const q1 = ask(
      b,
      "q1",
      [
        "Use the table: what is the formula of the oxide of aluminium (group III)?",
        "सारणी से: ऐलुमिनियम (समूह III) के ऑक्साइड का सूत्र क्या है?",
      ],
      ["Al₂O₃", "Al₂O₃"],
      [
        [
          "AlO₃",
          "AlO₃",
          "Group III's oxide is R₂O₃: two R for three O.",
          "समूह III का ऑक्साइड R₂O₃ है: तीन O के लिए दो R।",
        ],
        ["AlO", "AlO", "RO is group II's oxide.", "RO समूह II का ऑक्साइड है।"],
      ],
    );
    const q2 = ask(
      b,
      "q2",
      [
        "And barium (group II), potassium (group I) and silicon (group IV)?",
        "और बेरियम (समूह II), पोटैशियम (समूह I) और सिलिकॉन (समूह IV)?",
      ],
      ["BaO, K₂O, SiO₂", "BaO, K₂O, SiO₂"],
      [
        [
          "Ba₂O, KO, SiO₂",
          "Ba₂O, KO, SiO₂",
          "Group I is R₂O and group II is RO; you swapped them.",
          "समूह I का R₂O और समूह II का RO है; तुमने अदला-बदली कर दी।",
        ],
        ["BaO, K₂O, Si₂O", "BaO, K₂O, Si₂O", "Group IV's oxide is RO₂.", "समूह IV का ऑक्साइड RO₂ है।"],
      ],
      { isHidden: true },
    );
    const q3 = ask(
      b,
      "q3",
      [
        "What did Mendeléev use to place the elements?",
        "मेंडेलीफ़ ने तत्वों को रखने के लिए क्या इस्तेमाल किया?",
      ],
      [
        "Atomic mass, and formulae of oxides and hydrides",
        "परमाणु द्रव्यमान, और ऑक्साइडों व हाइड्राइडों के सूत्र",
      ],
      [
        [
          "Atomic number, and electrons in the outer shell",
          "परमाणु संख्या, और बाहरी कोश के इलेक्ट्रॉन",
          "Those came later: they are the basis of the modern table.",
          "वे बाद में आए: वे आधुनिक सारणी का आधार हैं।",
        ],
        [
          "Atomic mass only, with every eighth element alike",
          "केवल परमाणु द्रव्यमान, हर आठवाँ तत्व समान",
          "That's Newlands' idea. Mendeléev also used chemical properties.",
          "यह न्यूलैंड्स का विचार है। मेंडेलीफ़ ने रासायनिक गुण भी इस्तेमाल किए।",
        ],
      ],
      { isHidden: true },
    );
    const log = w.definition(
      t(
        "**Mission log.** ✓ Mendeléev: elements in order of atomic mass, grouped by their oxides and hydrides. ✓ Likeness beats mass (Co before Ni). ✓ Gaps predicted gallium, scandium and germanium; the noble gases fitted in as a new group. ✗ Next we find the cards that still won't sit still.",
        "**मिशन लॉग।** ✓ मेंडेलीफ़: तत्व परमाणु द्रव्यमान के क्रम में, उनके ऑक्साइडों और हाइड्राइडों से समूहबद्ध। ✓ समानता द्रव्यमान से ऊपर (Co, Ni से पहले)। ✓ ख़ाली जगहों ने गैलियम, स्कैंडियम और जर्मेनियम का अनुमान लगाया; उत्कृष्ट गैसें नए समूह में फ़िट हुईं। ✗ आगे वे कार्ड जो अब भी अपनी जगह नहीं टिकते।",
      ),
      "log",
      { isHidden: true },
    );
    oneByOne(b, [q1, q2, q3], [log]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), q1, q2, q3, log, space()]);
  },
  { passOn: PassOn.Rules },
);

export const overview = [hook, basis, order, gaps, noble, inLife, yourTurn];

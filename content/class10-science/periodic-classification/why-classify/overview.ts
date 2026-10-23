import { PassOn, column, page, space, t } from "@chalk/author";
import { goalQuestion, wordsOn } from "@chalk/patterns";
import { PeriodicScene, TriadAction, TriadDerived, TriadSet } from "@chalk/prop-periodic";
import { ask, oneByOne, sceneOn, triadOn } from "../kit";

/** Quiz Night is coming, and Kabir's 118 cards are a heap. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const heap = sceneOn(
    b,
    "heap",
    PeriodicScene.CardHeap,
    "Kabir tipping a shoebox of element cards onto the floor: a jumbled heap of symbols, with Riya frowning at it",
  );
  return column([
    w.title(t("A heap of 118 cards", "118 कार्डों का ढेर")),
    heap,
    w.body(
      t(
        "The school is holding an **Element Quiz Night**, and every class has to bring a display. Kabir has the perfect thing: a shoebox of 118 element cards from a science magazine. Each card has a symbol, an atomic mass and a few facts. He tips them out on the floor. They land in a jumbled heap.",
        "स्कूल में **तत्व क्विज़ नाइट** होने वाली है, और हर कक्षा को एक प्रदर्शनी लानी है। कबीर के पास बिल्कुल सही चीज़ है: एक विज्ञान पत्रिका से मिले 118 तत्व-कार्डों का जूते का डिब्बा। हर कार्ड पर एक प्रतीक, एक परमाणु द्रव्यमान और कुछ तथ्य हैं। वह उन्हें फ़र्श पर उलट देता है। वे एक बेतरतीब ढेर में गिरते हैं।",
      ),
    ),
    w.body(
      t(
        'Riya picks up one card, then another. **"A heap is useless in a quiz. We need an order where knowing one card tells you about its neighbours."**',
        'रिया एक कार्ड उठाती है, फिर दूसरा। **"क्विज़ में ढेर बेकार है। हमें ऐसा क्रम चाहिए जिसमें एक कार्ड को जानने से उसके पड़ोसियों के बारे में पता चल जाए।"**',
      ),
    ),
    space(),
  ]);
});

/** Why classify: the shop, the mission, the stops. */
const why = page("why", (b) => {
  const w = wordsOn(b);
  const shop = sceneOn(
    b,
    "shop",
    PeriodicScene.ShopShelves,
    "a shop with its shelves in order: bathing soaps on one shelf, washing soaps on the next, biscuits further along",
  );
  return column([
    w.title(t("What this chapter is for", "यह अध्याय किसलिए है")),
    shop,
    w.body(
      t(
        'Grandpa laughs. **"Chemists had exactly your problem, and they used cards too."** About 150 years ago a Russian chemist, Mendeléev, wrote one element on each card and pinned the cards on a wall until a pattern appeared. Before him, others tried simpler ideas. Each idea worked a little, then broke.',
        'दादाजी हँसते हैं। **"रसायनज्ञों की भी ठीक यही समस्या थी, और उन्होंने भी कार्ड इस्तेमाल किए।"** लगभग 150 साल पहले एक रूसी रसायनज्ञ, मेंडेलीफ़, ने हर कार्ड पर एक तत्व लिखा और कार्डों को दीवार पर तब तक लगाया जब तक एक पैटर्न नहीं दिखा। उनसे पहले दूसरों ने सरल तरीक़े आज़माए। हर तरीक़ा थोड़ा चला, फिर टूट गया।',
      ),
    ),
    w.body(
      t(
        "That's the mission: **build a card wall for Quiz Night** by trying each idea in history, the way the chemists did, until the wall can answer questions about cards nobody has studied.",
        "यही मिशन है: **क्विज़ नाइट के लिए एक कार्ड-दीवार बनाना**, इतिहास के हर तरीक़े को आज़माकर, जैसे रसायनज्ञों ने किया, जब तक दीवार उन कार्डों के बारे में भी सवालों के जवाब न दे सके जिन्हें किसी ने पढ़ा नहीं।",
      ),
    ),
    w.definition(
      t(
        "**The stops on the way.** (1) Why sort at all, and piles of three: *this lesson*. (2) Newlands' octaves, like the notes of music. (3) Mendeléev's wall, with gaps. (4) Where Mendeléev's wall falls short. (5) The modern table. (6) The trends that answer questions, and Quiz Night.",
        "**रास्ते के पड़ाव।** (1) छाँटना क्यों, और तीन-तीन के ढेर: *यह पाठ*। (2) न्यूलैंड्स के अष्टक, संगीत के स्वरों जैसे। (3) मेंडेलीफ़ की दीवार, ख़ाली जगहों के साथ। (4) मेंडेलीफ़ की दीवार कहाँ चूकती है। (5) आधुनिक सारणी। (6) वे प्रवृत्तियाँ जो सवालों के जवाब देती हैं, और क्विज़ नाइट।",
      ),
    ),
    w.body(
      t(
        "First stop: why sort the elements at all, and what was the very first try?",
        "पहला पड़ाव: तत्वों को छाँटना ही क्यों, और सबसे पहला प्रयास क्या था?",
      ),
    ),
    space(),
  ]);
});

/** Class IX recap: element, atom, atomic mass. Why chemists wanted order. */
const recap = page(
  "recap",
  (b) => {
    const w = wordsOn(b);
    const q = ask(
      b,
      "q",
      [
        "How many elements are known today, and how many occur naturally?",
        "आज कितने तत्व ज्ञात हैं, और कितने प्राकृतिक रूप से मिलते हैं?",
      ],
      ["118 known, 94 of them natural", "118 ज्ञात, उनमें से 94 प्राकृतिक"],
      [
        [
          "94 known, 118 of them natural",
          "94 ज्ञात, उनमें से 118 प्राकृतिक",
          "It's the other way round: more are known than occur naturally.",
          "उल्टा है: प्राकृतिक से ज़्यादा ज्ञात हैं।",
        ],
        [
          "63 known, all of them natural",
          "63 ज्ञात, सब प्राकृतिक",
          "63 were known in Mendeléev's time. Today we know 118.",
          "63 मेंडेलीफ़ के समय ज्ञात थे। आज हम 118 जानते हैं।",
        ],
      ],
      { passes: true },
    );
    return column([
      w.title(t("A quick recap", "एक छोटा दोहराव")),
      w.definition(
        t(
          "**Element, atom, atomic mass.** An **element** is a substance made of only one kind of **atom**: iron, oxygen, sodium. The **atomic mass** of an element is the mass of one of its atoms, measured in **atomic mass units (u)**. A hydrogen atom is about 1 u; a sodium atom about 23 u.",
          "**तत्व, परमाणु, परमाणु द्रव्यमान।** **तत्व** ऐसा पदार्थ है जो केवल एक प्रकार के **परमाणुओं** से बना हो: लोहा, ऑक्सीजन, सोडियम। किसी तत्व का **परमाणु द्रव्यमान** उसके एक परमाणु का द्रव्यमान है, जिसे **परमाणु द्रव्यमान इकाई (u)** में मापते हैं। हाइड्रोजन का एक परमाणु लगभग 1 u है; सोडियम का लगभग 23 u।",
        ),
      ),
      w.body(
        t(
          "Today **118 elements** are known, and **94** of them occur in nature. As more were discovered, chemists collected so many facts about them that it became hard to keep track. They began looking for a **pattern**: a way to arrange the elements so that studying a few tells you about the rest.",
          "आज **118 तत्व** ज्ञात हैं, और उनमें से **94** प्रकृति में मिलते हैं। जैसे-जैसे और तत्व खोजे गए, रसायनज्ञों ने उनके बारे में इतने तथ्य जमा कर लिए कि सब याद रखना कठिन हो गया। वे एक **पैटर्न** खोजने लगे: तत्वों को ऐसे सजाने का तरीक़ा कि कुछ को पढ़ने से बाक़ी के बारे में पता चल जाए।",
        ),
      ),
      w.definition(
        t(
          "**Classification.** Putting things into groups by their properties is **classification**. A shop does it: soaps in one place, biscuits in another, and bathing soaps apart from washing soaps. The first classification of elements was into **metals** and **non-metals**.",
          "**वर्गीकरण।** चीज़ों को उनके गुणों के आधार पर समूहों में रखना **वर्गीकरण** है। एक दुकान यही करती है: साबुन एक जगह, बिस्कुट दूसरी जगह, और नहाने के साबुन कपड़े धोने के साबुनों से अलग। तत्वों का पहला वर्गीकरण **धातुओं** और **अधातुओं** में था।",
        ),
      ),
      q,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Döbereiner's triads: the middle mass is the average of the outer two. */
const triads = page(
  "triads",
  (b) => {
    const w = wordsOn(b);
    const p = triadOn(b, "p", TriadSet.LiNaK);
    b.standsFor(
      p,
      "three element cards, lithium 6.9, sodium 23.0 and potassium 39.0, with a step button that works out the average of the first and last and compares it with the middle",
    );
    const goal = goalQuestion(b, {
      about: p,
      prompt: t(
        "Step through: find the average of lithium and potassium, then compare it with sodium.",
        "आगे बढ़ो: लीथियम और पोटैशियम का औसत निकालो, फिर उसकी तुलना सोडियम से करो।",
      ),
      isMet: p.derived(TriadDerived.IsDone).eq(true),
      solve: [p.learner(TriadAction.Next), p.learner(TriadAction.Next)],
    });
    return column([
      w.title(t("Döbereiner's triads", "डॉबेराइनर के त्रिक")),
      w.body(
        t(
          "In 1817 a German chemist, **Johann Wolfgang Döbereiner**, sorted elements with similar properties into groups of three. Lithium, sodium and potassium are all soft, shiny metals that react with water. Write them in order of increasing atomic mass: 6.9, 23.0, 39.0.",
          "1817 में एक जर्मन रसायनज्ञ, **योहान वोल्फ़गैंग डॉबेराइनर**, ने समान गुणों वाले तत्वों को तीन-तीन के समूहों में रखा। लीथियम, सोडियम और पोटैशियम, तीनों नरम, चमकीली धातुएँ हैं जो पानी से अभिक्रिया करती हैं। उन्हें बढ़ते परमाणु द्रव्यमान के क्रम में लिखो: 6.9, 23.0, 39.0।",
        ),
      ),
      p,
      goal,
      w.definition(
        t(
          "**Döbereiner's triad.** A group of three elements with similar properties, written in order of increasing atomic mass, in which the **middle element's atomic mass is roughly the average** of the other two.",
          "**डॉबेराइनर का त्रिक।** समान गुणों वाले तीन तत्वों का समूह, बढ़ते परमाणु द्रव्यमान के क्रम में लिखा हुआ, जिसमें **बीच वाले तत्व का परमाणु द्रव्यमान लगभग बाक़ी दो का औसत** होता है।",
        ),
      ),
      w.body(t("For lithium and potassium:", "लीथियम और पोटैशियम के लिए:")),
      w.body(t("$$\\frac{6.9 + 39.0}{2} = 22.95$$", "$$\\frac{6.9 + 39.0}{2} = 22.95$$")),
      w.body(
        t(
          "That's very close to sodium's 23.0, so Li, Na, K is a triad.",
          "यह सोडियम के 23.0 के बहुत पास है, इसलिए Li, Na, K एक त्रिक है।",
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Table 5.1: which groups are triads? Then the limitation. */
const which = page(
  "which",
  (b) => {
    const w = wordsOn(b);
    const p = triadOn(b, "p", TriadSet.NPAs, [TriadSet.NPAs, TriadSet.CaSrBa, TriadSet.ClBrI]);
    b.standsFor(
      p,
      "the triad checker with three groups to try: N, P, As; Ca, Sr, Ba; Cl, Br, I. Each shows its masses, the average of the outer two and a verdict",
    );
    const q1 = ask(
      b,
      "q1",
      [
        "Try all three groups. Which one is NOT a Döbereiner triad?",
        "तीनों समूह आज़माओ। कौन-सा डॉबेराइनर त्रिक नहीं है?",
      ],
      ["N, P, As: 44.5 is far from 31.0", "N, P, As: 44.5, 31.0 से बहुत दूर है"],
      [
        [
          "Ca, Sr, Ba: 88.7 is far from 87.6",
          "Ca, Sr, Ba: 88.7, 87.6 से बहुत दूर है",
          "88.7 and 87.6 are close: that group is a triad.",
          "88.7 और 87.6 पास-पास हैं: वह समूह त्रिक है।",
        ],
        [
          "Cl, Br, I: 81.2 is far from 79.9",
          "Cl, Br, I: 81.2, 79.9 से बहुत दूर है",
          "81.2 and 79.9 are close: that group is a triad.",
          "81.2 और 79.9 पास-पास हैं: वह समूह त्रिक है।",
        ],
      ],
    );
    const q2 = ask(
      b,
      "q2",
      ["Why wasn't sorting into triads found useful?", "त्रिकों में छाँटना उपयोगी क्यों नहीं माना गया?"],
      ["Only three triads were ever found", "केवल तीन त्रिक ही मिल पाए"],
      [
        [
          "The averages were never close to the middle mass",
          "औसत कभी बीच वाले द्रव्यमान के पास नहीं थे",
          "For Li-Na-K, Ca-Sr-Ba and Cl-Br-I they were very close.",
          "Li-Na-K, Ca-Sr-Ba और Cl-Br-I के लिए वे बहुत पास थे।",
        ],
        [
          "Triads mixed metals and non-metals in one group",
          "त्रिकों ने एक समूह में धातु और अधातु मिला दिए",
          "Each of his triads had three similar elements.",
          "उनके हर त्रिक में तीन समान तत्व थे।",
        ],
      ],
      { isHidden: true },
    );
    oneByOne(b, [q1, q2]);
    return column([
      w.title(t("Is every three a triad?", "क्या हर तीन एक त्रिक है?")),
      w.body(
        t(
          "Here are three more groups, each written downwards in order of increasing atomic mass. Check each one.",
          "यहाँ तीन और समूह हैं, हर एक बढ़ते परमाणु द्रव्यमान के क्रम में नीचे की ओर लिखा है। हर एक की जाँच करो।",
        ),
      ),
      p,
      q1,
      q2,
      w.body(
        t(
          "Döbereiner found only three triads: Li, Na, K; Ca, Sr, Ba; and Cl, Br, I. Most elements didn't fit into any, so the idea couldn't sort them all.",
          "डॉबेराइनर को केवल तीन त्रिक मिले: Li, Na, K; Ca, Sr, Ba; और Cl, Br, I। ज़्यादातर तत्व किसी में फ़िट नहीं हुए, इसलिए यह तरीक़ा सबको नहीं छाँट सका।",
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Back to the floor: piles of three. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const piles = sceneOn(
      b,
      "piles",
      PeriodicScene.CardTriads,
      "the cards sorted into a few neat piles of three, with most of the cards still in a big leftover heap beside them",
    );
    const q = ask(
      b,
      "q",
      [
        "Riya makes the three triad piles. What happens to the other 109 cards?",
        "रिया तीन त्रिक-ढेर बनाती है। बाक़ी 109 कार्डों का क्या होता है?",
      ],
      ["They stay in the heap, fitting no triad", "वे ढेर में रहते हैं, किसी त्रिक में फ़िट नहीं"],
      [
        [
          "They sort into about 36 more triads",
          "वे छँटकर लगभग 36 और त्रिक बनाते हैं",
          "Döbereiner looked hard and found only three.",
          "डॉबेराइनर ने खूब खोजा और केवल तीन पाए।",
        ],
        [
          "They all go on the lithium pile",
          "वे सब लीथियम वाले ढेर में चले जाते हैं",
          "Only elements like lithium belong with it.",
          "केवल लीथियम जैसे तत्व ही उसके साथ हो सकते हैं।",
        ],
      ],
      { passes: true },
    );
    return column([
      w.title(t("Piles of three", "तीन-तीन के ढेर")),
      piles,
      w.body(
        t(
          "Kabir sorts out lithium, sodium and potassium, then calcium, strontium and barium, then chlorine, bromine and iodine. Three neat piles. He looks at the heap. It's barely smaller.",
          "कबीर लीथियम, सोडियम और पोटैशियम छाँटता है, फिर कैल्सियम, स्ट्रॉन्शियम और बेरियम, फिर क्लोरीन, ब्रोमीन और आयोडीन। तीन साफ़-सुथरे ढेर। वह ढेर की ओर देखता है। वह मुश्किल से छोटा हुआ है।",
        ),
      ),
      q,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Practice: an average check, then the log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const q1 = ask(
      b,
      "q1",
      [
        "Calcium is 40.1, strontium 87.6 and barium 137.3. What is the average of calcium and barium?",
        "कैल्सियम 40.1, स्ट्रॉन्शियम 87.6 और बेरियम 137.3 है। कैल्सियम और बेरियम का औसत क्या है?",
      ],
      ["88.7, close to strontium", "88.7, स्ट्रॉन्शियम के पास"],
      [
        [
          "177.4, close to nothing",
          "177.4, किसी के पास नहीं",
          "That's the sum. The average is half of it.",
          "यह योग है। औसत उसका आधा है।",
        ],
        [
          "97.2, far from strontium",
          "97.2, स्ट्रॉन्शियम से दूर",
          "That's 137.3 − 40.1. Add them and halve.",
          "यह 137.3 − 40.1 है। जोड़ो और आधा करो।",
        ],
      ],
    );
    const log = w.definition(
      t(
        "**Mission log.** ✓ We sort elements to study many at once; the first sort was metals and non-metals. ✓ Döbereiner's triads: the middle mass is about the average of the other two. ✗ Only three triads exist, so 109 cards are still in the heap. Next: a rule for *all* the cards, from music class.",
        "**मिशन लॉग।** ✓ हम तत्वों को इसलिए छाँटते हैं कि कई को एक साथ पढ़ सकें; पहली छँटाई धातु और अधातु थी। ✓ डॉबेराइनर के त्रिक: बीच का द्रव्यमान बाक़ी दो के औसत के लगभग बराबर। ✗ केवल तीन त्रिक हैं, इसलिए 109 कार्ड अब भी ढेर में हैं। आगे: *सभी* कार्डों के लिए एक नियम, संगीत की कक्षा से।",
      ),
      "log",
      { isHidden: true },
    );
    oneByOne(b, [q1], [log]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), q1, log, space()]);
  },
  { passOn: PassOn.Rules },
);

export const overview = [hook, why, recap, triads, which, inLife, yourTurn];

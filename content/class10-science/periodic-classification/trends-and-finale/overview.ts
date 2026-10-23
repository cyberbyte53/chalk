import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { goalQuestion, wordsOn } from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import { Layout, ModernAction, PeriodicScene, Trend } from "@chalk/prop-periodic";
import { ask, oneByOne, sceneOn, tableOn } from "../kit";

/** Quiz Night is tomorrow: can the wall answer what nobody memorised? */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const wall = sceneOn(
    b,
    "wall",
    PeriodicScene.CardWall,
    "the finished card wall in 18 columns, Riya and Kabir quizzing each other in front of it the night before Quiz Night",
  );
  return column([
    w.title(t("The night before", "एक रात पहले")),
    wall,
    w.body(
      t(
        'Last time: ordered by atomic number, the wall puts elements with the same valence electrons in one column and the same number of shells in one row. Quiz Night is tomorrow. Riya fires a question at Kabir about an element neither of them has studied. **"Bigger or smaller than its neighbour? More metallic or less?"** Kabir stares at the wall.',
        'पिछली बार: परमाणु संख्या से सजी दीवार समान संयोजकता इलेक्ट्रॉनों वाले तत्वों को एक स्तंभ में और समान कोशों वाले तत्वों को एक पंक्ति में रखती है। क्विज़ नाइट कल है। रिया कबीर से एक ऐसे तत्व पर सवाल दागती है जिसे दोनों में से किसी ने नहीं पढ़ा। **"अपने पड़ोसी से बड़ा या छोटा? ज़्यादा धात्विक या कम?"** कबीर दीवार को घूरता है।',
      ),
    ),
    w.body(
      t(
        "Stop 6: the trends that let the wall answer for you.",
        "पड़ाव 6: वे प्रवृत्तियाँ जिनसे दीवार तुम्हारे लिए जवाब देती है।",
      ),
    ),
    space(),
  ]);
});

/** Valency across a period and down a group. */
const valency = page(
  "valency",
  (b) => {
    const w = wordsOn(b);
    const table = tableOn(b, "table", { trends: [Trend.None, Trend.Valency] });
    b.standsFor(
      table,
      "the first 20 elements, with buttons to colour them by valency; tap an element to see its shells, valence electrons and valency",
    );
    const goal = goalQuestion(b, {
      about: table,
      prompt: t(
        "Colour the table by valency. How does it change across period 3?",
        "सारणी को संयोजकता से रंगो। आवर्त 3 में यह कैसे बदलती है?",
      ),
      isMet: table.field("trend").eq(Trend.Valency),
      solve: [table.learner(ModernAction.SetTrend, { trend: Trend.Valency })],
    });
    const q = ask(
      b,
      "q",
      [
        "Magnesium is 2, 8, 2 and sulphur is 2, 8, 6. What are their valencies?",
        "मैग्नीशियम 2, 8, 2 और सल्फ़र 2, 8, 6 है। उनकी संयोजकताएँ क्या हैं?",
      ],
      ["2 and 2", "2 और 2"],
      [
        [
          "2 and 6",
          "2 और 6",
          "Sulphur gains 2 to reach 8 more easily than it loses 6: valency 8 − 6 = 2.",
          "सल्फ़र के लिए 6 खोने से 2 लेकर 8 तक पहुँचना आसान है: संयोजकता 8 − 6 = 2।",
        ],
        ["12 and 16", "12 और 16", "Those are their atomic numbers.", "वे उनकी परमाणु संख्याएँ हैं।"],
      ],
      { isHidden: true },
    );
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(q));
    return column([
      w.title(t("Valency", "संयोजकता")),
      w.definition(
        t(
          "**Valency.** The combining capacity of an element. It is decided by its **valence electrons**: with 1, 2 or 3 outer electrons, the valency is that number (they are lost). With 5, 6 or 7, the valency is **8 minus** that number (that many are gained to make 8). With 4, the valency is 4 (carbon shares them). With 8, the shell is full, so the valency is 0.",
          "**संयोजकता।** किसी तत्व की संयोजन क्षमता। यह उसके **संयोजकता इलेक्ट्रॉनों** से तय होती है: 1, 2 या 3 बाहरी इलेक्ट्रॉन हों तो संयोजकता वही संख्या है (वे खोए जाते हैं)। 5, 6 या 7 हों तो संयोजकता **8 में से** वह संख्या घटाकर है (8 बनाने के लिए उतने लिए जाते हैं)। 4 हों तो संयोजकता 4 है (कार्बन उन्हें साझा करता है)। 8 हों तो कोश भरा है, इसलिए संयोजकता 0 है।",
        ),
      ),
      table,
      goal,
      w.body(
        t(
          "Across a period the valency goes 1, 2, 3, 4, 3, 2, 1, 0. Down a group it stays the same, because the valence electrons stay the same.",
          "आवर्त में बाएँ से दाएँ संयोजकता 1, 2, 3, 4, 3, 2, 1, 0 चलती है। समूह में नीचे यह वही रहती है, क्योंकि संयोजकता इलेक्ट्रॉन वही रहते हैं।",
        ),
      ),
      q,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Atomic size: smaller across, bigger down. */
const size = page(
  "size",
  (b) => {
    const w = wordsOn(b);
    const table = tableOn(b, "table", { trends: [Trend.None, Trend.Size] });
    b.standsFor(
      table,
      "the first 20 elements, with a button to show atomic size: the radii in pm on the tiles of period 2 and group 1, shading larger to the left and lower down",
    );
    const q1 = ask(
      b,
      "q1",
      [
        "Period 2 radii: Li 152, Be 111, B 88, C 77, N 74, O 66 pm. What happens left to right?",
        "आवर्त 2 की त्रिज्याएँ: Li 152, Be 111, B 88, C 77, N 74, O 66 pm। बाएँ से दाएँ क्या होता है?",
      ],
      [
        "The radius decreases: more nuclear charge pulls tighter",
        "त्रिज्या घटती है: बढ़ता नाभिकीय आवेश कसकर खींचता है",
      ],
      [
        [
          "The radius increases: more electrons take more room",
          "त्रिज्या बढ़ती है: ज़्यादा इलेक्ट्रॉन ज़्यादा जगह लेते हैं",
          "Read the numbers: 152 down to 66. The extra electrons go into the same shell.",
          "संख्याएँ पढ़ो: 152 से 66 तक। अतिरिक्त इलेक्ट्रॉन उसी कोश में जाते हैं।",
        ],
        [
          "The radius stays the same: one shell for all",
          "त्रिज्या वही रहती है: सबका एक ही कोश",
          "Same number of shells, but the radius still shrinks from 152 to 66.",
          "कोशों की संख्या वही, पर त्रिज्या फिर भी 152 से 66 तक सिकुड़ती है।",
        ],
      ],
    );
    const q2 = ask(
      b,
      "q2",
      [
        "Group 1 radii: Li 152, Na 186, K 231, Rb 244, Cs 262 pm. Why does size grow down the group?",
        "समूह 1 की त्रिज्याएँ: Li 152, Na 186, K 231, Rb 244, Cs 262 pm। समूह में नीचे आकार क्यों बढ़ता है?",
      ],
      ["A new shell is added at each step", "हर क़दम पर एक नया कोश जुड़ता है"],
      [
        [
          "The nuclear charge gets weaker",
          "नाभिकीय आवेश कमज़ोर होता जाता है",
          "The nuclear charge actually increases; the new shells win anyway.",
          "नाभिकीय आवेश असल में बढ़ता है; फिर भी नए कोश भारी पड़ते हैं।",
        ],
        [
          "The atoms take in extra protons from outside",
          "परमाणु बाहर से अतिरिक्त प्रोटॉन ले लेते हैं",
          "Atoms don't take in protons. Each element simply has more, and more shells.",
          "परमाणु प्रोटॉन नहीं लेते। हर तत्व में बस ज़्यादा हैं, और ज़्यादा कोश।",
        ],
      ],
      { isHidden: true },
    );
    oneByOne(b, [q1, q2]);
    return column([
      w.title(t("Atomic size", "परमाणु आकार")),
      w.definition(
        t(
          "**Atomic size.** The **radius** of an atom: the distance from the centre of the nucleus to the outermost shell of an isolated atom. It is measured in **picometres** (pm). A hydrogen atom's radius is 37 pm.",
          "**परमाणु आकार।** परमाणु की **त्रिज्या**: किसी अकेले परमाणु के नाभिक के केंद्र से सबसे बाहरी कोश तक की दूरी। इसे **पिकोमीटर** (pm) में मापते हैं। हाइड्रोजन परमाणु की त्रिज्या 37 pm है।",
        ),
      ),
      w.body(
        t("$$1\\ \\text{pm} = 10^{-12}\\ \\text{m}$$", "$$1\\ \\text{pm} = 10^{-12}\\ \\text{m}$$"),
      ),
      table,
      q1,
      q2,
      w.body(
        t(
          "**Across a period** the atomic radius **decreases**: the nuclear charge grows and pulls the electrons closer. **Down a group** it **increases**: each new shell puts the outer electrons farther from the nucleus, even though the nuclear charge also grows.",
          "**आवर्त में** परमाणु त्रिज्या **घटती** है: नाभिकीय आवेश बढ़ता है और इलेक्ट्रॉनों को पास खींचता है। **समूह में नीचे** यह **बढ़ती** है: हर नया कोश बाहरी इलेक्ट्रॉनों को नाभिक से दूर कर देता है, भले नाभिकीय आवेश भी बढ़ता है।",
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Metals, metalloids, non-metals; metallic character. */
const metals = page(
  "metals",
  (b) => {
    const w = wordsOn(b);
    const table = tableOn(b, "table", {
      layout: Layout.Full,
      showShells: false,
      trends: [Trend.Kind, Trend.Metallic],
      trend: Trend.Kind,
    });
    b.standsFor(
      table,
      "the full Modern Periodic Table coloured as metals (left), non-metals (top right) and metalloids along a zig-zag between them; a second button shades metallic character, strongest at the bottom left",
    );
    const goal = goalQuestion(b, {
      about: table,
      prompt: t(
        "Switch to metallic character. Where is it strongest?",
        "धात्विक गुण पर बदलो। यह सबसे प्रबल कहाँ है?",
      ),
      isMet: table.field("trend").eq(Trend.Metallic),
      solve: [table.learner(ModernAction.SetTrend, { trend: Trend.Metallic })],
    });
    const q = ask(
      b,
      "q",
      ["Which of these is a metalloid?", "इनमें से कौन-सा उपधातु है?"],
      ["Silicon", "सिलिकॉन"],
      [
        ["Sodium", "सोडियम", "Sodium is a metal, on the far left.", "सोडियम धातु है, सबसे बाईं ओर।"],
        ["Chlorine", "क्लोरीन", "Chlorine is a non-metal, on the right.", "क्लोरीन अधातु है, दाईं ओर।"],
      ],
      { isHidden: true },
    );
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(q));
    return column([
      w.title(t("Metals and non-metals", "धातु और अधातु")),
      w.body(
        t(
          "In period 3, sodium and magnesium are metals, on the **left**. Sulphur and chlorine are non-metals, on the **right**. Silicon, in the middle, shows some properties of both.",
          "आवर्त 3 में सोडियम और मैग्नीशियम धातुएँ हैं, **बाईं** ओर। सल्फ़र और क्लोरीन अधातुएँ हैं, **दाईं** ओर। बीच में सिलिकॉन, दोनों के कुछ गुण दिखाता है।",
        ),
      ),
      w.definition(
        t(
          "**Metalloids.** A **zig-zag line** in the table separates metals from non-metals. The borderline elements, **boron, silicon, germanium, arsenic, antimony, tellurium and polonium**, have properties in between and are called **metalloids** or **semi-metals**.",
          "**उपधातु।** सारणी में एक **टेढ़ी-मेढ़ी रेखा** धातुओं को अधातुओं से अलग करती है। सीमा पर के तत्व, **बोरॉन, सिलिकॉन, जर्मेनियम, आर्सेनिक, ऐन्टिमनी, टेल्यूरियम और पोलोनियम**, बीच के गुण रखते हैं और **उपधातु** या **अर्धधातु** कहलाते हैं।",
        ),
      ),
      w.definition(
        t(
          "**Electropositive.** Metals tend to **lose** electrons when they form bonds: they are **electropositive**. The easier an element loses electrons, the more **metallic** it is.",
          "**विद्युत धनात्मक।** धातुएँ आबंध बनाते समय इलेक्ट्रॉन **खोती** हैं: वे **विद्युत धनात्मक** हैं। कोई तत्व जितनी आसानी से इलेक्ट्रॉन खोता है, उतना **धात्विक** है।",
        ),
      ),
      table,
      goal,
      w.body(
        t(
          "Across a period, the pull of the nucleus on the valence electrons grows, so losing them gets harder: **metallic character decreases**. Down a group, the outer electrons are farther away and easier to lose: **metallic character increases**.",
          "आवर्त में, संयोजकता इलेक्ट्रॉनों पर नाभिक का खिंचाव बढ़ता है, इसलिए उन्हें खोना कठिन होता जाता है: **धात्विक गुण घटता है**। समूह में नीचे, बाहरी इलेक्ट्रॉन दूर होते हैं और आसानी से खोते हैं: **धात्विक गुण बढ़ता है**।",
        ),
      ),
      q,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Electronegativity and oxides. */
const gain = page(
  "gain",
  (b) => {
    const w = wordsOn(b);
    const table = tableOn(b, "table", {
      layout: Layout.Full,
      showShells: false,
      trends: [Trend.Electronegativity],
      trend: Trend.Electronegativity,
    });
    b.standsFor(
      table,
      "the full table shaded by the tendency to gain electrons: strongest at the top right, near fluorine, weakest at the bottom left",
    );
    const q = ask(
      b,
      "q",
      [
        "Nitrogen (2, 5) and phosphorus (2, 8, 5) are both in group 15. Which is more electronegative?",
        "नाइट्रोजन (2, 5) और फ़ॉस्फ़ोरस (2, 8, 5) दोनों समूह 15 में हैं। कौन अधिक विद्युत ऋणात्मक है?",
      ],
      [
        "Nitrogen: its outer shell is closer to the nucleus",
        "नाइट्रोजन: उसका बाहरी कोश नाभिक के पास है",
      ],
      [
        [
          "Phosphorus: it has more electrons to attract with",
          "फ़ॉस्फ़ोरस: उसके पास खींचने को ज़्यादा इलेक्ट्रॉन हैं",
          "Electrons don't pull electrons. Phosphorus's extra shell keeps its outer shell farther away.",
          "इलेक्ट्रॉन इलेक्ट्रॉन नहीं खींचते। फ़ॉस्फ़ोरस का अतिरिक्त कोश उसके बाहरी कोश को दूर रखता है।",
        ],
        [
          "Equal: they have the same five valence electrons",
          "बराबर: दोनों में वही पाँच संयोजकता इलेक्ट्रॉन हैं",
          "Same valence electrons, but going down a group the pull gets weaker.",
          "संयोजकता इलेक्ट्रॉन वही, पर समूह में नीचे खिंचाव कमज़ोर होता है।",
        ],
      ],
      { passes: true },
    );
    return column([
      w.title(t("Gaining electrons", "इलेक्ट्रॉन लेना")),
      w.definition(
        t(
          "**Electronegative.** Non-metals tend to **gain** electrons when they form bonds: they are **electronegative**. This tendency **increases across a period** and **decreases down a group**, the opposite of metallic character. So non-metals sit on the **right** of the table, towards the **top**.",
          "**विद्युत ऋणात्मक।** अधातुएँ आबंध बनाते समय इलेक्ट्रॉन **लेती** हैं: वे **विद्युत ऋणात्मक** हैं। यह प्रवृत्ति **आवर्त में बढ़ती** है और **समूह में नीचे घटती** है, धात्विक गुण के उलट। इसलिए अधातुएँ सारणी में **दाईं** ओर, **ऊपर** की तरफ़ हैं।",
        ),
      ),
      table,
      w.body(
        t(
          "These trends also predict **oxides**: oxides of metals are generally **basic**, and oxides of non-metals are generally **acidic**. So across a period the oxides become more acidic.",
          "ये प्रवृत्तियाँ **ऑक्साइडों** का भी अनुमान देती हैं: धातुओं के ऑक्साइड सामान्यतः **क्षारीय** होते हैं, और अधातुओं के ऑक्साइड सामान्यतः **अम्लीय**। इसलिए आवर्त में ऑक्साइड अधिक अम्लीय होते जाते हैं।",
        ),
      ),
      q,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Quiz Night: the wall answers. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const night = sceneOn(
      b,
      "night",
      PeriodicScene.QuizNight,
      "Quiz Night in the school hall: the class card wall on stage, Riya and Kabir at the buzzer, Grandpa in the audience",
    );
    const q = ask(
      b,
      "q",
      [
        'The quizmaster: "Calcium is Z = 20. Of the elements with Z = 12, 19, 21 and 38, which behave like calcium?" (Z = 38 is strontium, from Döbereiner\'s Ca–Sr–Ba triad.)',
        'क्विज़-मास्टर: "कैल्सियम Z = 20 है। Z = 12, 19, 21 और 38 वाले तत्वों में से कौन कैल्सियम जैसे हैं?" (Z = 38 स्ट्रॉन्शियम है, डॉबेराइनर के Ca–Sr–Ba त्रिक वाला।)',
      ],
      ["12 and 38: they share its group", "12 और 38: वे उसके समूह में हैं"],
      [
        [
          "19 and 21: they're its neighbours",
          "19 और 21: वे उसके पड़ोसी हैं",
          "Neighbours in a period differ; it's the group that shares properties.",
          "आवर्त के पड़ोसी अलग होते हैं; गुण समूह बाँटता है।",
        ],
        [
          "19 and 38: both are metals",
          "19 और 38: दोनों धातुएँ हैं",
          "19 (potassium) is in group 1, with one valence electron. Calcium has two.",
          "19 (पोटैशियम) समूह 1 में है, एक संयोजकता इलेक्ट्रॉन के साथ। कैल्सियम में दो हैं।",
        ],
      ],
      { passes: true },
    );
    return column([
      w.title(t("Quiz Night", "क्विज़ नाइट")),
      night,
      w.body(
        t(
          "The hall is packed. The class card wall stands on stage, 18 columns wide. The final round is about elements nobody was told to memorise. Kabir doesn't panic. He finds the card, looks at its column and its row, and reads the answer off the wall.",
          "हॉल भरा हुआ है। कक्षा की कार्ड-दीवार मंच पर है, 18 स्तंभ चौड़ी। अंतिम दौर उन तत्वों पर है जिन्हें याद करने को किसी ने नहीं कहा था। कबीर घबराता नहीं। वह कार्ड ढूँढता है, उसका स्तंभ और पंक्ति देखता है, और जवाब दीवार से पढ़ लेता है।",
        ),
      ),
      q,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Worked example: most metallic of Ga, Ge, As, Se, Be. */
const example = page("example", (b) => {
  const w = wordsOn(b);
  const table = tableOn(b, "table", {
    layout: Layout.Full,
    showShells: false,
    highlightPeriod: 4,
  });
  b.standsFor(
    table,
    "the full table with period 4 lit, where Ga, Ge, As and Se sit side by side; Be is two rows higher, in group 2",
  );
  return column([
    w.title(t("Worked example", "हल किया उदाहरण")),
    w.body(
      t(
        "**Which of Ga, Ge, As, Se and Be would you expect to be most metallic?**",
        "**Ga, Ge, As, Se और Be में से तुम किसे सबसे अधिक धात्विक मानोगे?**",
      ),
    ),
    table,
    w.body(
      t(
        "Ga, Ge, As and Se are in the same period (4), in that order from left to right. Metallic character decreases across a period, so among these four, **gallium** is the most metallic. Beryllium is far to the left, in group 2, but it is two periods higher. So Be and Ga pull opposite ways: Be is further left, but Ga has **two more shells**. Its outer electrons are much farther from the nucleus and easier to lose. **When the two trends disagree, the extra shells usually win**, so **gallium (Ga)** is the answer.",
        "Ga, Ge, As और Se एक ही आवर्त (4) में हैं, बाएँ से दाएँ इसी क्रम में। आवर्त में धात्विक गुण घटता है, इसलिए इन चारों में **गैलियम** सबसे धात्विक है। बेरिलियम बहुत बाईं ओर, समूह 2 में है, पर दो आवर्त ऊपर। तो Be और Ga उलटी दिशाओं में खींचते हैं: Be ज़्यादा बाईं ओर है, पर Ga में **दो कोश अधिक** हैं। उसके बाहरी इलेक्ट्रॉन नाभिक से बहुत दूर हैं और आसानी से खोते हैं। **जब दोनों प्रवृत्तियाँ टकराएँ, तो अतिरिक्त कोश प्रायः जीतते हैं**, इसलिए उत्तर **गैलियम (Ga)** है।",
      ),
    ),
    space(),
  ]);
});

/** Practice: the exercises; the finale. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const q1 = ask(
      b,
      "q1",
      [
        "Going left to right across a period, which statement is NOT correct?",
        "आवर्त में बाएँ से दाएँ जाने पर कौन-सा कथन सही नहीं है?",
      ],
      ["The atoms lose electrons more easily", "परमाणु अधिक आसानी से इलेक्ट्रॉन खोते हैं"],
      [
        [
          "The elements become less metallic",
          "तत्व कम धात्विक होते जाते हैं",
          "That is correct: metallic character decreases across a period.",
          "यह सही है: आवर्त में धात्विक गुण घटता है।",
        ],
        [
          "The oxides become more acidic",
          "ऑक्साइड अधिक अम्लीय होते जाते हैं",
          "That is correct: the non-metals on the right form acidic oxides.",
          "यह सही है: दाईं ओर की अधातुएँ अम्लीय ऑक्साइड बनाती हैं।",
        ],
      ],
    );
    const q2 = ask(
      b,
      "q2",
      [
        "Element X forms a chloride XCl₂, a solid with a high melting point. X is most likely in the same group as:",
        "तत्व X एक क्लोराइड XCl₂ बनाता है, जो ऊँचे गलनांक वाला ठोस है। X संभवतः किसके समूह में है:",
      ],
      ["Mg, which forms MgCl₂", "Mg, जो MgCl₂ बनाता है"],
      [
        [
          "Na, which forms NaCl",
          "Na, जो NaCl बनाता है",
          "Na takes one chlorine. XCl₂ needs a valency of 2.",
          "Na एक क्लोरीन लेता है। XCl₂ के लिए संयोजकता 2 चाहिए।",
        ],
        [
          "Al, which forms AlCl₃",
          "Al, जो AlCl₃ बनाता है",
          "Al takes three chlorines. XCl₂ needs a valency of 2.",
          "Al तीन क्लोरीन लेता है। XCl₂ के लिए संयोजकता 2 चाहिए।",
        ],
      ],
      { isHidden: true },
    );
    const q3 = ask(
      b,
      "q3",
      [
        "In group 17, element A is above element C. Which is more reactive, and which ion does A form?",
        "समूह 17 में तत्व A, तत्व C के ऊपर है। कौन अधिक क्रियाशील है, और A कौन-सा आयन बनाता है?",
      ],
      ["A is more reactive; it forms an anion", "A अधिक क्रियाशील; वह ऋणायन बनाता है"],
      [
        [
          "C is more reactive; A forms an anion",
          "C अधिक क्रियाशील; A ऋणायन बनाता है",
          "Down group 17 the pull for an extra electron weakens, so the upper one reacts more.",
          "समूह 17 में नीचे एक अतिरिक्त इलेक्ट्रॉन का खिंचाव घटता है, इसलिए ऊपर वाला अधिक क्रिया करता है।",
        ],
        [
          "A is more reactive; it forms a cation",
          "A अधिक क्रियाशील; वह धनायन बनाता है",
          "Group 17 elements gain an electron: that makes a negative ion, an anion.",
          "समूह 17 के तत्व एक इलेक्ट्रॉन लेते हैं: इससे ऋणात्मक आयन, ऋणायन, बनता है।",
        ],
      ],
      { isHidden: true },
    );
    const finale = w.definition(
      t(
        "**Mission complete.** The card wall won Quiz Night, and every answer came from its order. (1) We sort elements to study them together; Döbereiner found triads. (2) Newlands' octaves worked only up to calcium. (3) Mendeléev ordered by mass and chemistry, and his gaps predicted new elements. (4) Hydrogen, isotopes and uneven masses broke a mass-based law. (5) Ordering by atomic number fixed that: groups share valence electrons, periods share shells. (6) Trends across and down the table predict valency, size, metallic character and oxides.",
        "**मिशन पूरा।** कार्ड-दीवार ने क्विज़ नाइट जीती, और हर जवाब उसके क्रम से आया। (1) हम तत्वों को साथ पढ़ने के लिए छाँटते हैं; डॉबेराइनर ने त्रिक खोजे। (2) न्यूलैंड्स के अष्टक केवल कैल्सियम तक चले। (3) मेंडेलीफ़ ने द्रव्यमान और रसायन से क्रम दिया, और उनकी ख़ाली जगहों ने नए तत्वों का अनुमान लगाया। (4) हाइड्रोजन, समस्थानिकों और असमान द्रव्यमानों ने द्रव्यमान-आधारित नियम तोड़ा। (5) परमाणु संख्या से क्रम ने इसे ठीक किया: समूह संयोजकता इलेक्ट्रॉन बाँटते हैं, आवर्त कोश। (6) सारणी में आड़ी और खड़ी प्रवृत्तियाँ संयोजकता, आकार, धात्विक गुण और ऑक्साइडों का अनुमान देती हैं।",
      ),
      "finale",
      { isHidden: true },
    );
    oneByOne(b, [q1, q2, q3], [finale]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), q1, q2, q3, finale, space()]);
  },
  { passOn: PassOn.Rules },
);

export const overview = [hook, valency, size, metals, gain, inLife, example, yourTurn];

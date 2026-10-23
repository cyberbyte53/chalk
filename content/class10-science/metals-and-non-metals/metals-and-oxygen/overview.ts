import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, multiChoiceQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import { BenchAction, BenchKind, reactionBenchDef } from "@chalk/prop-chemistry";
import { LabMetal, MetalSceneKind, Reagent, ce, labOn, sceneOn } from "../kit";

const r = String.raw;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const pans = sceneOn(
    b,
    "pans",
    MetalSceneKind.KitchenPans,
    "Mom at the stove with a black-bottomed copper pot and a dull aluminium kadhai; Kabir holding up a shiny steel ladle",
  );
  return column([
    w.title(t("Black pots, dull pans, bright gold", "काले बर्तन, फीकी कड़ाही, चमकता सोना")),
    pans,
    w.body(
      t(
        "Kabir looks around the kitchen. The copper pot has a black bottom from the flame. The aluminium kadhai has gone dull grey. At Diwali the silver anklets went black. But Grandma's bangles, sixty years old, were only a little dull: no black coat, no green, no rust.",
        "कबीर रसोई में चारों ओर देखता है। ताँबे के बर्तन का तला आँच से काला है। ऐलुमिनियम की कड़ाही फीकी स्लेटी हो गई है। दिवाली पर चाँदी की पायलें काली पड़ गई थीं। पर दादी की साठ साल पुरानी चूड़ियाँ बस थोड़ी फीकी थीं: न काली परत, न हरापन, न ज़ंग।",
      ),
    ),
    w.body(
      t(
        "Clue 2: what does the oxygen in the air do to metals, and why does it leave gold alone?",
        "सुराग 2: हवा की ऑक्सीजन धातुओं के साथ क्या करती है, और सोने को क्यों छोड़ देती है?",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Activity 3.8: magnesium ash is basic, burnt sulphur is acidic. */
const twoOxides = page(
  "two-oxides",
  (b) => {
    const w = wordsOn(b);
    const mg = b.prop(reactionBenchDef, "mg", {
      kind: BenchKind.MagnesiumBurns,
      isStarted: false,
      showThermometer: false,
      showNames: true,
      showObservations: true,
      canStart: true,
    });
    b.studentOnly(mg.action(BenchAction.Start));
    b.studentOnly(mg.action(BenchAction.Reset));
    b.standsFor(
      mg,
      "a magnesium ribbon held in tongs over a flame burns with a dazzling white light and leaves white ash",
    );
    const sulphur = choiceQuestion(b, {
      name: "sulphur",
      prompt: t(
        "The fumes of burning sulphur are dissolved in water. The solution turns blue litmus red. What kind of oxide did sulphur make?",
        "जलते सल्फ़र का धुआँ पानी में घोला जाता है। विलयन नीले लिटमस को लाल कर देता है। सल्फ़र ने किस प्रकार का ऑक्साइड बनाया?",
      ),
      options: [
        { id: "right", label: t("An acidic oxide", "एक अम्लीय ऑक्साइड") },
        {
          id: "basic",
          label: t("A basic oxide", "एक क्षारकीय ऑक्साइड"),
          feedback: t(
            "Blue litmus turning red means acid. A basic solution turns red litmus blue instead.",
            "नीले लिटमस का लाल होना अम्ल बताता है। क्षारकीय विलयन उल्टा लाल लिटमस को नीला करता है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Two oxides, two kinds", "दो ऑक्साइड, दो प्रकार")),
      w.definition(
        t(
          "**Oxide, acid, base.** A compound of an element with oxygen is its **oxide**. From Chapter 2: an **acid** turns blue litmus red, and a **base** turns red litmus blue. Litmus is a dye that changes colour this way.",
          "**ऑक्साइड, अम्ल, क्षारक।** किसी तत्व का ऑक्सीजन के साथ यौगिक उसका **ऑक्साइड** है। अध्याय 2 से: **अम्ल** नीले लिटमस को लाल करता है, और **क्षारक** लाल लिटमस को नीला करता है। लिटमस एक रंजक है जो इसी तरह रंग बदलता है।",
        ),
      ),
      w.body(
        t(
          "NCERT Activity 3.8. Burn a magnesium ribbon and dissolve the ash in water: the solution turns **red litmus blue**, so magnesium oxide is **basic**. Now burn sulphur powder, collect the fumes in a test tube and shake them with water: that solution turns **blue litmus red**.",
          "NCERT क्रियाकलाप 3.8। मैग्नीशियम रिबन जलाओ और उसकी राख पानी में घोलो: विलयन **लाल लिटमस को नीला** करता है, इसलिए मैग्नीशियम ऑक्साइड **क्षारकीय** है। अब सल्फ़र चूर्ण जलाओ, धुआँ एक परखनली में इकट्ठा करो और पानी के साथ हिलाओ: वह विलयन **नीले लिटमस को लाल** करता है।",
        ),
      ),
      mg,
      w.definition(
        t(
          "**Metal oxides and non-metal oxides.** Most **metals** give **basic oxides**. Most **non-metals** give **acidic oxides** when dissolved in water. This is a chemical property, and it sorts elements more clearly than the physical tests did.",
          "**धातु ऑक्साइड और अधातु ऑक्साइड।** अधिकतर **धातुएँ** **क्षारकीय ऑक्साइड** बनाती हैं। अधिकतर **अधातुएँ** पानी में घोलने पर **अम्लीय ऑक्साइड** देती हैं। यह एक रासायनिक गुण है, और यह तत्वों को भौतिक परीक्षणों से अधिक साफ़ छाँटता है।",
        ),
      ),
      sulphur,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Metal + oxygen → metal oxide; amphoteric oxides; soluble oxides make alkalis. */
const metalOxides = page(
  "metal-oxides",
  (b) => {
    const w = wordsOn(b);
    const both = choiceQuestion(b, {
      name: "both",
      prompt: t(
        "Aluminium oxide reacts with hydrochloric acid and also with sodium hydroxide. What is it called?",
        "ऐलुमिनियम ऑक्साइड हाइड्रोक्लोरिक अम्ल से भी अभिक्रिया करता है और सोडियम हाइड्रॉक्साइड से भी। इसे क्या कहते हैं?",
      ),
      options: [
        { id: "right", label: t("An amphoteric oxide", "एक उभयधर्मी ऑक्साइड") },
        {
          id: "acidic",
          label: t("An acidic oxide", "एक अम्लीय ऑक्साइड"),
          feedback: t(
            "An acidic oxide reacts with bases only. This one reacts with acids too.",
            "अम्लीय ऑक्साइड केवल क्षारकों से अभिक्रिया करता है। यह अम्लों से भी करता है।",
          ),
        },
        {
          id: "basic",
          label: t("A basic oxide", "एक क्षारकीय ऑक्साइड"),
          feedback: t(
            "A basic oxide reacts with acids only. This one reacts with a base too.",
            "क्षारकीय ऑक्साइड केवल अम्लों से अभिक्रिया करता है। यह एक क्षारक से भी करता है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Metal + oxygen → metal oxide", "धातु + ऑक्सीजन → धातु ऑक्साइड")),
      w.body(
        t(
          "Almost all metals combine with oxygen to form metal oxides. Copper heated in air gives black copper(II) oxide:",
          "लगभग सभी धातुएँ ऑक्सीजन से मिलकर धातु ऑक्साइड बनाती हैं। हवा में गर्म किया ताँबा काला कॉपर(II) ऑक्साइड देता है:",
        ),
      ),
      w.body(ce("2Cu + O2 -> 2CuO")),
      w.body(t("Aluminium gives aluminium oxide:", "ऐलुमिनियम, ऐलुमिनियम ऑक्साइड देता है:")),
      w.body(ce("4Al + 3O2 -> 2Al2O3")),
      w.definition(
        t(
          "**Amphoteric oxides.** Most metal oxides are basic: they react with acids to give a salt and water. But some, like **aluminium oxide** and **zinc oxide**, react with **both acids and bases** to give salts and water. These are **amphoteric oxides**.",
          "**उभयधर्मी ऑक्साइड।** अधिकतर धातु ऑक्साइड क्षारकीय हैं: वे अम्लों से अभिक्रिया करके लवण और पानी देते हैं। पर कुछ, जैसे **ऐलुमिनियम ऑक्साइड** और **ज़िंक ऑक्साइड**, **अम्लों और क्षारकों दोनों** से अभिक्रिया करके लवण और पानी देते हैं। ये **उभयधर्मी ऑक्साइड** हैं।",
        ),
      ),
      w.body(
        t(
          "Aluminium oxide with an acid, and with a base:",
          "ऐलुमिनियम ऑक्साइड, एक अम्ल के साथ, और एक क्षारक के साथ:",
        ),
      ),
      w.body(ce("Al2O3 + 6HCl -> 2AlCl3 + 3H2O")),
      w.body(ce("Al2O3 + 2NaOH -> 2NaAlO2 + H2O")),
      w.body(
        t(
          r`The second product, $\ce{NaAlO2}$, is sodium aluminate.`,
          r`दूसरा उत्पाद, $\ce{NaAlO2}$, सोडियम ऐलुमिनेट है।`,
        ),
      ),
      w.definition(
        t(
          "**Alkalis.** Most metal oxides don't dissolve in water. A few do, and make a **base that dissolves in water**, called an **alkali**. Sodium oxide and potassium oxide are two:",
          "**क्षार।** अधिकतर धातु ऑक्साइड पानी में नहीं घुलते। कुछ घुलते हैं, और **पानी में घुलने वाला क्षारक** बनाते हैं, जिसे **क्षार** कहते हैं। सोडियम ऑक्साइड और पोटैशियम ऑक्साइड दो ऐसे हैं:",
        ),
      ),
      w.body(ce("Na2O(s) + H2O(l) -> 2NaOH(aq)")),
      w.body(ce("K2O(s) + H2O(l) -> 2KOH(aq)")),
      both,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Activity 3.9: metals in a flame; different reactivities; kerosene; protective layers. */
const flame = page(
  "flame",
  (b) => {
    const w = wordsOn(b);
    const lab = labOn(b, "lab", {
      metals: [
        LabMetal.Sodium,
        LabMetal.Magnesium,
        LabMetal.Aluminium,
        LabMetal.Zinc,
        LabMetal.Iron,
        LabMetal.Copper,
        LabMetal.Silver,
        LabMetal.Gold,
      ],
      reagents: [Reagent.Air],
      metal: LabMetal.Sodium,
    });
    b.standsFor(
      lab,
      "a flame; the learner picks a metal and heats it in air: sodium catches fire, magnesium burns dazzling white, iron filings sparkle, copper goes black, silver and gold don't change",
    );
    const kerosene = choiceQuestion(b, {
      name: "kerosene",
      prompt: t(
        "Why is sodium kept immersed in kerosene oil?",
        "सोडियम को केरोसिन तेल में डुबोकर क्यों रखा जाता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "It reacts so vigorously with oxygen that it catches fire in the open; kerosene keeps the air away",
            "यह ऑक्सीजन से इतनी तेज़ी से अभिक्रिया करता है कि खुले में आग पकड़ लेता है; केरोसिन हवा को दूर रखता है",
          ),
        },
        {
          id: "melt",
          label: t("To stop it melting", "इसे पिघलने से रोकने के लिए"),
          feedback: t(
            "The danger is not melting but reacting with the air: sodium catches fire.",
            "ख़तरा पिघलने का नहीं, हवा से अभिक्रिया का है: सोडियम आग पकड़ लेता है।",
          ),
        },
        {
          id: "soft",
          label: t("Because it is soft", "क्योंकि यह नरम है"),
          feedback: t(
            "It is soft, but oil doesn't fix that. Oil keeps oxygen and moisture away.",
            "यह नरम है, पर तेल उसे ठीक नहीं करता। तेल ऑक्सीजन और नमी को दूर रखता है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Not all metals burn alike", "सभी धातुएँ एक-सी नहीं जलतीं")),
      w.body(
        t(
          "NCERT Activity 3.9 (with the teacher's help). Hold each metal in a flame with tongs and watch.",
          "NCERT क्रियाकलाप 3.9 (शिक्षक की मदद से)। हर धातु को चिमटे से आँच में पकड़ो और देखो।",
        ),
      ),
      lab,
      w.definition(
        t(
          "**Reactivity with oxygen.** How readily a metal reacts is its **reactivity**, and it differs a lot. (i) **Potassium and sodium** react so vigorously that they catch fire in the open, so they are kept under **kerosene**. (ii) **Magnesium, aluminium, zinc and lead** get a thin **oxide layer** at ordinary temperature, which protects the metal from further oxidation. (iii) **Iron** doesn't burn as a lump, but iron **filings** burn vigorously in a flame. (iv) **Copper** doesn't burn, but gets a black coat of copper(II) oxide. (v) **Silver and gold** don't react with oxygen even at high temperatures.",
          "**ऑक्सीजन के साथ क्रियाशीलता।** कोई धातु कितनी आसानी से अभिक्रिया करती है, वह उसकी **क्रियाशीलता** है, और यह बहुत अलग होती है। (i) **पोटैशियम और सोडियम** इतनी तेज़ी से अभिक्रिया करते हैं कि खुले में आग पकड़ लेते हैं, इसलिए उन्हें **केरोसिन** में रखा जाता है। (ii) **मैग्नीशियम, ऐलुमिनियम, ज़िंक और लेड** पर सामान्य ताप पर एक पतली **ऑक्साइड परत** बन जाती है, जो धातु को आगे ऑक्सीकरण से बचाती है। (iii) **लोहा** डली के रूप में नहीं जलता, पर लोहे का **बुरादा** आँच में तेज़ी से जलता है। (iv) **ताँबा** नहीं जलता, पर उस पर कॉपर(II) ऑक्साइड की काली परत चढ़ जाती है। (v) **चाँदी और सोना** ऊँचे ताप पर भी ऑक्सीजन से अभिक्रिया नहीं करते।",
        ),
      ),
      kerosene,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Anodising: a thicker oxide layer on purpose. */
const anodise = page(
  "anodise",
  (b) => {
    const w = wordsOn(b);
    const why = choiceQuestion(b, {
      name: "why",
      prompt: t(
        "Aluminium is a highly reactive metal, yet it is used for cooking pans. Why doesn't the pan get eaten away?",
        "ऐलुमिनियम बहुत क्रियाशील धातु है, फिर भी इसके खाना पकाने के बर्तन बनते हैं। बर्तन घुलकर ख़त्म क्यों नहीं होता?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "A layer of aluminium oxide forms on it and protects the metal underneath",
            "उस पर ऐलुमिनियम ऑक्साइड की परत बन जाती है जो नीचे की धातु को बचाती है",
          ),
        },
        {
          id: "unreactive",
          label: t("Aluminium is actually unreactive", "ऐलुमिनियम असल में अक्रियाशील है"),
          feedback: t(
            "It is reactive. It's the oxide layer that stops further reaction.",
            "यह क्रियाशील है। आगे की अभिक्रिया को ऑक्साइड परत रोकती है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("A useful oxide layer", "एक काम की ऑक्साइड परत")),
      w.definition(
        t(
          "**Anodising.** Aluminium gets a thin oxide layer in air, which resists further corrosion. **Anodising** makes that layer thicker on purpose: a clean aluminium article is made the **anode** (the positive electrode) and a current is passed through dilute sulphuric acid (this is called electrolysis: more in clue 8). The oxygen given off at the anode reacts with the aluminium to build a thicker protective oxide layer, which can also be dyed in attractive colours.",
          "**ऐनोडीकरण।** हवा में ऐलुमिनियम पर एक पतली ऑक्साइड परत बनती है, जो आगे के संक्षारण को रोकती है। **ऐनोडीकरण** इस परत को जान-बूझकर मोटा करता है: साफ़ ऐलुमिनियम की वस्तु को **ऐनोड** (धन इलेक्ट्रोड) बनाकर तनु सल्फ़्यूरिक अम्ल में से विद्युत धारा प्रवाहित की जाती है (इसे विद्युत अपघटन कहते हैं: सुराग 8 में और)। ऐनोड पर निकली ऑक्सीजन ऐलुमिनियम से अभिक्रिया करके एक मोटी सुरक्षात्मक ऑक्साइड परत बनाती है, जिसे आकर्षक रंगों में रंगा भी जा सकता है।",
        ),
      ),
      w.body(
        t(
          "Burning shows sodium is the most reactive of these metals, and magnesium less so. But it can't decide between zinc, iron, copper and lead. The next lesson uses water and acids to sort them.",
          "जलाने से पता चलता है कि इन धातुओं में सोडियम सबसे क्रियाशील है, और मैग्नीशियम उससे कम। पर इससे ज़िंक, लोहा, ताँबा और लेड में फ़ैसला नहीं होता। अगला पाठ उन्हें छाँटने के लिए पानी और अम्लों का उपयोग करता है।",
        ),
      ),
      why,
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
    const lab = labOn(b, "lab", {
      metals: [LabMetal.Copper, LabMetal.Gold],
      reagents: [Reagent.Air],
      metal: LabMetal.Gold,
    });
    b.standsFor(
      lab,
      "gold and copper heated in a flame: copper goes black, gold stays exactly as it was",
    );
    const gold = choiceQuestion(b, {
      name: "gold",
      prompt: t(
        "Why did Grandma's bangles stay gold-coloured for sixty years, while the copper pot went black?",
        "दादी की चूड़ियाँ साठ साल तक सुनहरी क्यों रहीं, जबकि ताँबे का बर्तन काला पड़ गया?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Gold doesn't react with oxygen even when heated; copper forms black copper oxide",
            "सोना गर्म करने पर भी ऑक्सीजन से अभिक्रिया नहीं करता; ताँबा काला कॉपर ऑक्साइड बनाता है",
          ),
        },
        {
          id: "layer",
          label: t("Gold has a protective oxide layer", "सोने पर एक सुरक्षात्मक ऑक्साइड परत है"),
          feedback: t(
            "That's how aluminium and zinc are protected. Gold doesn't form an oxide at all.",
            "ऐलुमिनियम और ज़िंक ऐसे बचते हैं। सोना ऑक्साइड बनाता ही नहीं।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const fire = choiceQuestion(b, {
      name: "fire",
      prompt: t(
        "Could the man have burnt seven grams of gold off the bangles with a hidden flame?",
        "क्या वह आदमी किसी छिपी लौ से चूड़ियों से सात ग्राम सोना जला सकता था?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "No: gold doesn't react with oxygen, even when hot",
            "नहीं: सोना गर्म होने पर भी ऑक्सीजन से अभिक्रिया नहीं करता",
          ),
        },
        {
          id: "yes",
          label: t("Yes, gold burns like magnesium", "हाँ, सोना मैग्नीशियम की तरह जलता है"),
          feedback: t(
            "Try gold in the flame above: nothing happens.",
            "ऊपर की आँच में सोना आज़माओ: कुछ नहीं होता।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const notes = w.definition(
      t(
        "**Case notes.** ✓ Gold sits at the bottom for reactivity with oxygen: it never tarnishes, and fire can't remove it. ✗ So the missing gold wasn't burnt off. ? And the anklets? Silver ignores oxygen too, yet it went black: it reacts with sulphur compounds in the air instead, forming black silver sulphide (more in the last clue). ? The bangles went into a **liquid**. Next clue: what water and acids do to metals.",
        "**केस नोट्स।** ✓ ऑक्सीजन के साथ क्रियाशीलता में सोना सबसे नीचे है: यह कभी फीका नहीं पड़ता, और आग इसे नहीं हटा सकती। ✗ इसलिए ग़ायब सोना जलाकर नहीं निकाला गया। ? और पायलें? चाँदी भी ऑक्सीजन को अनदेखा करती है, फिर भी काली पड़ी: वह इसके बजाय हवा के सल्फ़र यौगिकों से अभिक्रिया करके काला सिल्वर सल्फ़ाइड बनाती है (आख़िरी सुराग में और)। ? चूड़ियाँ एक **द्रव** में गई थीं। अगला सुराग: पानी और अम्ल धातुओं के साथ क्या करते हैं।",
      ),
      "notes",
      { isHidden: true },
    );
    b.when(gold.on(QuestionSignal.Correct), theBoard.show(fire));
    b.when(fire.on(QuestionSignal.Correct), [theBoard.show(notes), theBoard.pass()]);
    return column([
      w.title(t("Why gold stays gold", "सोना सोना क्यों रहता है")),
      lab,
      gold,
      fire,
      notes,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Exercises 6, 9 and 11. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const amph = multiChoiceQuestion(b, {
      name: "amph",
      prompt: t(
        "Which of these are amphoteric oxides? Tick all.",
        "इनमें से कौन-से उभयधर्मी ऑक्साइड हैं? सभी पर निशान लगाओ।",
      ),
      options: [
        { id: "al", label: t(r`$\ce{Al2O3}$`, r`$\ce{Al2O3}$`) },
        { id: "zn", label: t(r`$\ce{ZnO}$`, r`$\ce{ZnO}$`) },
        {
          id: "mg",
          label: t(r`$\ce{MgO}$`, r`$\ce{MgO}$`),
          feedback: t("Magnesium oxide is basic.", "मैग्नीशियम ऑक्साइड क्षारकीय है।"),
        },
        {
          id: "so2",
          label: t(r`$\ce{SO2}$`, r`$\ce{SO2}$`),
          feedback: t("A non-metal oxide: acidic.", "एक अधातु ऑक्साइड: अम्लीय।"),
        },
      ],
      answers: ["al", "zn"],
      missing: t("Right so far: there's one more.", "अब तक सही: एक और है।"),
      passes: false,
    });
    const litmus = choiceQuestion(b, {
      name: "litmus",
      prompt: t(
        "Pratyush heats sulphur powder and collects the gas in a test tube. What does the gas do to **dry** litmus, and to **moist** blue litmus?",
        "प्रत्यूष सल्फ़र चूर्ण गर्म करके गैस एक परखनली में इकट्ठा करता है। गैस **सूखे** लिटमस के साथ, और **नम** नीले लिटमस के साथ क्या करती है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Dry: no change. Moist blue: turns red, because the gas dissolves in water to give an acid",
            "सूखा: कोई बदलाव नहीं। नम नीला: लाल हो जाता है, क्योंकि गैस पानी में घुलकर अम्ल देती है",
          ),
        },
        {
          id: "both",
          label: t("Both turn red", "दोनों लाल हो जाते हैं"),
          feedback: t(
            "Sulphur dioxide shows its acid nature only once it dissolves in water. Dry litmus has no water.",
            "सल्फ़र डाइऑक्साइड अपना अम्लीय स्वभाव पानी में घुलने पर ही दिखाती है। सूखे लिटमस में पानी नहीं है।",
          ),
        },
        {
          id: "blue",
          label: t("Moist red litmus turns blue", "नम लाल लिटमस नीला हो जाता है"),
          feedback: t(
            "That would be a base. Sulphur is a non-metal, so its oxide is acidic.",
            "वह क्षारक होता। सल्फ़र अधातु है, इसलिए उसका ऑक्साइड अम्लीय है।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const eq = w.body(t("The reaction in the spatula:", "चम्मच में अभिक्रिया:"), "eq", {
      isHidden: true,
    });
    const eqLine = w.body(ce("S + O2 -> SO2"), "eqLine", { isHidden: true });
    const notes = w.definition(
      t(
        "**Case notes.** ✓ Metal oxides are basic (some amphoteric); non-metal oxides are acidic. ✓ Reactivity with oxygen: K, Na catch fire; Mg, Al, Zn, Pb get a protective layer; iron filings burn; copper blackens; silver and gold don't react. Next clue: water and acids.",
        "**केस नोट्स।** ✓ धातु ऑक्साइड क्षारकीय हैं (कुछ उभयधर्मी); अधातु ऑक्साइड अम्लीय हैं। ✓ ऑक्सीजन के साथ क्रियाशीलता: K, Na आग पकड़ते हैं; Mg, Al, Zn, Pb पर सुरक्षात्मक परत बनती है; लोहे का बुरादा जलता है; ताँबा काला पड़ता है; चाँदी और सोना अभिक्रिया नहीं करते। अगला सुराग: पानी और अम्ल।",
      ),
      "notes",
      { isHidden: true },
    );
    b.when(amph.on(QuestionSignal.Correct), theBoard.show(litmus));
    b.when(litmus.on(QuestionSignal.Correct), [
      theBoard.show(eq),
      theBoard.show(eqLine),
      theBoard.show(notes),
      theBoard.pass(),
    ]);
    return column([
      w.title(t("Your turn", "अब तुम्हारी बारी")),
      amph,
      litmus,
      eq,
      eqLine,
      notes,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [hook, twoOxides, metalOxides, flame, anodise, inLife, yourTurn];

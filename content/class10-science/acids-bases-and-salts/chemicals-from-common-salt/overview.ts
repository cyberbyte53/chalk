import { type BoardKit, PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, goalQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  AcidBenchAction,
  AcidBenchDerived,
  AcidBenchKind,
  AcidSceneKind,
  Product,
  Route,
  SaltFactoryAction,
  saltFactoryDef,
} from "@chalk/prop-chemistry";
import { benchOn, sceneOn } from "../kit";

const r = String.raw;

/** The common-salt map, with the routes the lesson has reached so far. */
function factoryOn(
  b: BoardKit,
  name: string,
  routes: (typeof Route)[keyof typeof Route][],
  showCell: boolean,
) {
  const prop = b.prop(saltFactoryDef, name, {
    routes,
    picked: null,
    showEquation: true,
    showUses: true,
    showCell,
    canPick: true,
  });
  b.studentOnly(prop.action(SaltFactoryAction.Pick));
  b.studentOnly(prop.action(SaltFactoryAction.Close));
  return prop;
}

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** The finale needs a fire extinguisher, and the cake needs to rise. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const ext = sceneOn(
    b,
    "ext",
    AcidSceneKind.Extinguisher,
    "Riya holding a wash-bottle rigged as a fire extinguisher, pointing its nozzle at a candle flame",
  );
  return column([
    w.title(t("A fire in a bottle", "बोतल में आग बुझाना")),
    ext,
    w.body(
      t(
        'For the finale, Riya wants to blow out a row of candles with a **home-made fire extinguisher**. Mom has her own worry: last time the birthday cake rose, but tasted bitter and soapy. Grandpa taps the salt jar. "The answer to both starts here."',
        'समापन के लिए रिया एक **घर पर बने अग्निशामक** से मोमबत्तियों की एक पंक्ति बुझाना चाहती है। मम्मी की अपनी चिंता है: पिछली बार जन्मदिन का केक फूला तो, पर कड़वा और साबुन जैसा लगा। दादाजी नमक के डिब्बे को थपथपाते हैं। "दोनों का उत्तर यहीं से शुरू होता है।"',
      ),
    ),
    w.body(
      t(
        "Stop 8: which useful chemicals are made from common salt?",
        "पड़ाव 8: साधारण नमक से कौन-से उपयोगी रसायन बनते हैं?",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** The chlor-alkali process. */
const chlorAlkali = page(
  "chlor-alkali",
  (b) => {
    const w = wordsOn(b);
    const map = factoryOn(b, "map", [Route.ChlorAlkali], true);
    b.standsFor(
      map,
      "a cell with brine and two electrodes: chlorine bubbles at the anode, hydrogen at the cathode, and sodium hydroxide forms near the cathode; tapping a product shows its uses",
    );
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "Why is it called the *chlor-alkali* process?",
        "इसे *क्लोर-क्षार* प्रक्रिया क्यों कहते हैं?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "It gives chlorine (chlor) and sodium hydroxide, an alkali",
            "यह क्लोरीन (क्लोर) और सोडियम हाइड्रॉक्साइड, एक क्षार, देती है",
          ),
        },
        {
          id: "uses",
          label: t("It uses chlorine and an alkali", "इसमें क्लोरीन और क्षार डाले जाते हैं"),
          feedback: t(
            "It starts from brine. Chlorine and the alkali are what it makes.",
            "यह लवण-जल से शुरू होती है। क्लोरीन और क्षार वह बनाती है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Electricity through salt water", "नमक के पानी से बिजली")),
      w.definition(
        t(
          "**Brine; chlor-alkali process.** A solution of sodium chloride in water is called **brine**. Passing electricity through brine breaks it down: this is the **chlor-alkali process**, named after its products: **chlor** for chlorine, **alkali** for sodium hydroxide.",
          "**लवण-जल; क्लोर-क्षार प्रक्रिया।** पानी में सोडियम क्लोराइड के घोल को **लवण-जल** (ब्राइन) कहते हैं। लवण-जल में से बिजली गुज़ारने पर वह टूट जाता है: यह **क्लोर-क्षार प्रक्रिया** है, जिसका नाम इसके उत्पादों से है: **क्लोर** क्लोरीन के लिए, **क्षार** सोडियम हाइड्रॉक्साइड के लिए।",
        ),
      ),
      w.body(
        t(
          r`$$\begin{aligned}&\ce{2NaCl(aq) + 2H2O(l)}\\&\quad\ce{-> 2NaOH(aq) + Cl2(g) + H2(g)}\end{aligned}$$`,
          r`$$\begin{aligned}&\ce{2NaCl(aq) + 2H2O(l)}\\&\quad\ce{-> 2NaOH(aq) + Cl2(g) + H2(g)}\end{aligned}$$`,
        ),
      ),
      w.body(
        t(
          "Chlorine gas comes off at the **anode** (the positive electrode), hydrogen at the **cathode** (the negative one), and sodium hydroxide solution forms near the cathode. All three are useful: tap each.",
          "क्लोरीन गैस **ऐनोड** (धनात्मक इलेक्ट्रोड) पर निकलती है, हाइड्रोजन **कैथोड** (ऋणात्मक) पर, और सोडियम हाइड्रॉक्साइड का घोल कैथोड के पास बनता है। तीनों उपयोगी हैं: हर एक पर टैप करो।",
        ),
      ),
      map,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Bleaching powder. */
const bleaching = page(
  "bleaching",
  (b) => {
    const w = wordsOn(b);
    const map = factoryOn(b, "map", [Route.ChlorAlkali, Route.Bleaching], false);
    b.standsFor(
      map,
      "the common-salt map with a new branch: chlorine plus dry slaked lime gives bleaching powder",
    );
    const goal = goalQuestion(b, {
      about: map,
      prompt: t("Tap bleaching powder to read its uses.", "विरंजक चूर्ण पर टैप करके उसके उपयोग पढ़ो।"),
      isMet: map.field("picked").eq(Product.BleachingPowder),
      solve: [map.learner(SaltFactoryAction.Pick, { product: Product.BleachingPowder })],
    });
    return column([
      w.title(t("Bleaching powder", "विरंजक चूर्ण")),
      w.body(
        t(
          "The chlorine from the chlor-alkali process is passed over **dry slaked lime**, Ca(OH)₂, to make **bleaching powder**. It is written CaOCl₂, though its real make-up is more complex.",
          "क्लोर-क्षार प्रक्रिया की क्लोरीन को **सूखे बुझे चूने**, Ca(OH)₂, पर से गुज़ारकर **विरंजक चूर्ण** बनाते हैं। इसे CaOCl₂ लिखा जाता है, हालाँकि इसकी असली बनावट ज़्यादा जटिल है।",
        ),
      ),
      w.body(
        t(r`$$\ce{Ca(OH)2 + Cl2 -> CaOCl2 + H2O}$$`, r`$$\ce{Ca(OH)2 + Cl2 -> CaOCl2 + H2O}$$`),
      ),
      map,
      goal,
      w.body(
        t(
          "Its uses: bleaching cotton and linen in textile mills, wood pulp in paper factories, and washed clothes in laundries; as an oxidising agent (a substance that oxidises others) in chemical industries; and to make drinking water free from germs.",
          "इसके उपयोग: कपड़ा मिलों में सूती और लिनन, काग़ज़ के कारख़ानों में लकड़ी की लुगदी, और धोबीघाट में धुले कपड़ों का विरंजन; रसायन उद्योगों में ऑक्सीकारक (ऐसा पदार्थ जो दूसरों का उपचयन करे) की तरह; और पीने के पानी को कीटाणु-मुक्त करने में।",
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Baking soda: made, heated, and used. */
const bakingSoda = page(
  "baking-soda",
  (b) => {
    const w = wordsOn(b);
    const map = factoryOn(b, "map", [Route.ChlorAlkali, Route.Bleaching, Route.BakingSoda], false);
    b.standsFor(
      map,
      "the map with a new branch: salt, water, carbon dioxide and ammonia give baking soda",
    );
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "Why does baking powder make a cake soft and spongy?",
        "बेकिंग पाउडर केक को नरम और स्पंजी क्यों बनाता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Heated or wet, it gives carbon dioxide, whose bubbles make the cake rise",
            "गर्म या गीला होने पर यह कार्बन डाइऑक्साइड देता है, जिसके बुलबुले केक को फुलाते हैं",
          ),
        },
        {
          id: "fat",
          label: t("It adds fat to the batter", "यह घोल में वसा मिलाता है"),
          feedback: t(
            "It's a gas, not fat: carbon dioxide from the hydrogencarbonate.",
            "यह गैस है, वसा नहीं: हाइड्रोजनकार्बोनेट से कार्बन डाइऑक्साइड।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Baking soda", "खाने का सोडा")),
      w.body(
        t(
          "**Baking soda** is sodium hydrogencarbonate, NaHCO₃, used in the kitchen for crisp pakoras and faster cooking. It is made with sodium chloride as a raw material:",
          "**खाने का सोडा** सोडियम हाइड्रोजनकार्बोनेट, NaHCO₃, है, जो रसोई में करारे पकौड़ों और जल्दी पकाने में इस्तेमाल होता है। इसे सोडियम क्लोराइड को कच्चे माल की तरह लेकर बनाते हैं:",
        ),
      ),
      w.body(
        t(
          r`$$\begin{aligned}&\ce{NaCl + H2O + CO2 + NH3}\\&\quad\ce{-> NH4Cl + NaHCO3}\end{aligned}$$`,
          r`$$\begin{aligned}&\ce{NaCl + H2O + CO2 + NH3}\\&\quad\ce{-> NH4Cl + NaHCO3}\end{aligned}$$`,
        ),
      ),
      w.body(
        t(
          "It is a mild, non-corrosive **basic** salt. When heated during cooking, it gives off carbon dioxide:",
          "यह एक हल्का, असंक्षारक **क्षारकीय** लवण है। पकाते समय गर्म होने पर यह कार्बन डाइऑक्साइड छोड़ता है:",
        ),
      ),
      w.body(
        t(
          r`$$\ce{2NaHCO3 ->[heat] Na2CO3 + H2O + CO2}$$`,
          r`$$\ce{2NaHCO3 ->[\text{ऊष्मा}] Na2CO3 + H2O + CO2}$$`,
        ),
      ),
      w.body(
        t(
          "The carbon dioxide makes a cake rise. But the sodium carbonate left behind tastes bitter, which is what spoilt last year's cake.",
          "कार्बन डाइऑक्साइड केक को फुलाती है। पर पीछे बचा सोडियम कार्बोनेट कड़वा लगता है, और पिछले साल के केक को इसी ने बिगाड़ा।",
        ),
      ),
      map,
      w.definition(
        t(
          "**Uses of baking soda.** (1) **Baking powder** is baking soda mixed with a mild edible acid such as tartaric acid. Heated or mixed with water, the acid's H⁺ meets the hydrogencarbonate and frees carbon dioxide, so the cake rises without the bitter sodium carbonate. (2) It is an ingredient in **antacids**. (3) It is used in **soda-acid fire extinguishers**.",
          "**खाने के सोडे के उपयोग।** (1) **बेकिंग पाउडर** खाने का सोडा और टार्टरिक अम्ल जैसे किसी हल्के खाद्य अम्ल का मिश्रण है। गर्म करने या पानी मिलाने पर अम्ल का H⁺ हाइड्रोजनकार्बोनेट से मिलकर कार्बन डाइऑक्साइड निकालता है, जिससे केक कड़वे सोडियम कार्बोनेट के बिना फूलता है। (2) यह **प्रतिअम्लों** का एक घटक है। (3) यह **सोडा-अम्ल अग्निशामकों** में इस्तेमाल होता है।",
        ),
      ),
      w.body(
        t(
          r`$$\ce{NaHCO3 + H+ -> CO2 + H2O} + \text{sodium salt of the acid}$$`,
          r`$$\ce{NaHCO3 + H+ -> CO2 + H2O} + \text{अम्ल का सोडियम लवण}$$`,
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Washing soda. */
const washingSoda = page(
  "washing-soda",
  (b) => {
    const w = wordsOn(b);
    const map = factoryOn(
      b,
      "map",
      [Route.ChlorAlkali, Route.Bleaching, Route.Acid, Route.BakingSoda, Route.WashingSoda],
      false,
    );
    b.standsFor(
      map,
      "the full common-salt map: brine to sodium hydroxide, chlorine and hydrogen; on to bleaching powder and hydrochloric acid; salt to baking soda, then sodium carbonate, then washing soda",
    );
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "Which sodium compound is used to soften hard water?",
        "कठोर जल को मृदु करने में कौन-सा सोडियम यौगिक इस्तेमाल होता है?",
      ),
      options: [
        { id: "right", label: t("Washing soda, Na₂CO₃·10H₂O", "धावन सोडा, Na₂CO₃·10H₂O") },
        {
          id: "nacl",
          label: t("Sodium chloride", "सोडियम क्लोराइड"),
          feedback: t(
            "Common salt doesn't remove hardness. Washing soda removes permanent hardness.",
            "साधारण नमक कठोरता नहीं हटाता। धावन सोडा स्थायी कठोरता हटाता है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Washing soda", "धावन सोडा")),
      w.body(
        t(
          "Heating baking soda gives sodium carbonate. Dissolve it and let it crystallise again (**recrystallisation**), and you get **washing soda**, Na₂CO₃·10H₂O. It is also a basic salt.",
          "खाने के सोडे को गर्म करने से सोडियम कार्बोनेट मिलता है। इसे घोलकर फिर से क्रिस्टल बनने दो (**पुनःक्रिस्टलन**), तो **धावन सोडा**, Na₂CO₃·10H₂O, मिलता है। यह भी क्षारकीय लवण है।",
        ),
      ),
      w.body(
        t(r`$$\ce{Na2CO3 + 10H2O -> Na2CO3.10H2O}$$`, r`$$\ce{Na2CO3 + 10H2O -> Na2CO3.10H2O}$$`),
      ),
      w.note(
        t(
          "What does the 10H₂O mean? Is washing soda wet? The next lesson answers that.",
          "10H₂O का क्या अर्थ है? क्या धावन सोडा गीला है? अगला पाठ इसका उत्तर देता है।",
        ),
      ),
      map,
      w.definition(
        t(
          "**Uses of washing soda.** (1) In the glass, soap and paper industries. (2) To make other sodium compounds, such as borax. (3) As a cleaning agent at home. (4) To remove the permanent hardness of water.",
          "**धावन सोडे के उपयोग।** (1) काँच, साबुन और काग़ज़ उद्योगों में। (2) बोरैक्स जैसे दूसरे सोडियम यौगिक बनाने में। (3) घर में सफ़ाई के लिए। (4) जल की स्थायी कठोरता हटाने में।",
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

/** The cake rises, and the extinguisher works. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const bench = benchOn(b, "bench", AcidBenchKind.SodaAcidExtinguisher);
    b.standsFor(
      bench,
      "a wash-bottle of sodium hydrogencarbonate solution with a small tube of dilute sulphuric acid hanging inside; tilted, it sprays foam from the nozzle onto a burning candle",
    );
    const goal = goalQuestion(b, {
      about: bench,
      prompt: t(
        "Tilt the bottle and aim the spray at the candle.",
        "बोतल को झुकाओ और फुहार को मोमबत्ती पर डालो।",
      ),
      isMet: bench.derived(AcidBenchDerived.IsDone),
      solve: [bench.learner(AcidBenchAction.Next), bench.learner(AcidBenchAction.Next)],
    });
    const why = w.body(
      t(
        "The acid meets the hydrogencarbonate and makes carbon dioxide, which pushes liquid out of the nozzle and smothers the flame: carbon dioxide doesn't let things burn. Mom's cake rises too: she used baking powder this time, not plain baking soda, so no bitter taste and plenty of carbon dioxide bubbles.",
        "अम्ल हाइड्रोजनकार्बोनेट से मिलकर कार्बन डाइऑक्साइड बनाता है, जो नोज़ल से द्रव बाहर धकेलती है और लौ को ढक देती है: कार्बन डाइऑक्साइड चीज़ों को जलने नहीं देती। मम्मी का केक भी फूलता है: इस बार उन्होंने सादे खाने के सोडे के बजाय बेकिंग पाउडर डाला, तो कोई कड़वापन नहीं और ढेरों कार्बन डाइऑक्साइड के बुलबुले।",
      ),
      "why",
      { isHidden: true },
    );
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(why));
    return column([
      w.title(t("The extinguisher, tested", "अग्निशामक, जाँचा गया")),
      w.body(
        t(
          "NCERT's group activity: a soda-acid fire extinguisher from a wash-bottle.",
          "NCERT का सामूहिक क्रियाकलाप: वॉश-बोतल से बना सोडा-अम्ल अग्निशामक।",
        ),
      ),
      bench,
      goal,
      why,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** NCERT in-text Q1–Q4 and Exercise 15; the mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const ask1 = choiceQuestion(b, {
      name: "ask1",
      prompt: t(
        "What is the common name of CaOCl₂, and what is treated with chlorine to make it?",
        "CaOCl₂ का सामान्य नाम क्या है, और इसे बनाने के लिए क्लोरीन से किसकी अभिक्रिया कराते हैं?",
      ),
      options: [
        {
          id: "right",
          label: t("Bleaching powder, made from dry slaked lime", "विरंजक चूर्ण, सूखे बुझे चूने से बना"),
        },
        {
          id: "soda",
          label: t("Washing soda, made from baking soda", "धावन सोडा, खाने के सोडे से बना"),
          feedback: t(
            "Washing soda is Na₂CO₃·10H₂O. CaOCl₂ contains calcium and chlorine.",
            "धावन सोडा Na₂CO₃·10H₂O है। CaOCl₂ में कैल्सियम और क्लोरीन है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const ask2 = choiceQuestion(b, {
      name: "ask2",
      prompt: t(
        "What happens when a solution of sodium hydrogencarbonate is heated?",
        "सोडियम हाइड्रोजनकार्बोनेट का घोल गर्म करने पर क्या होता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "It gives sodium carbonate, water and carbon dioxide",
            "यह सोडियम कार्बोनेट, जल और कार्बन डाइऑक्साइड देता है",
          ),
        },
        {
          id: "nothing",
          label: t("Nothing happens", "कुछ नहीं होता"),
          feedback: t(
            r`It breaks down: $\ce{2NaHCO3 -> Na2CO3 + H2O + CO2}$.`,
            r`यह टूटता है: $\ce{2NaHCO3 -> Na2CO3 + H2O + CO2}$।`,
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const ask3 = choiceQuestion(b, {
      name: "ask3",
      prompt: t(
        "NCERT Exercise 15. Which is a use of baking soda, not washing soda?",
        "NCERT अभ्यास 15। इनमें से कौन खाने के सोडे का उपयोग है, धावन सोडे का नहीं?",
      ),
      options: [
        { id: "right", label: t("In antacids", "प्रतिअम्लों में") },
        {
          id: "glass",
          label: t("Making glass", "काँच बनाना"),
          feedback: t("Glass-making uses washing soda.", "काँच बनाने में धावन सोडा लगता है।"),
        },
        {
          id: "hard",
          label: t("Removing hardness of water", "जल की कठोरता हटाना"),
          feedback: t("That's washing soda too.", "वह भी धावन सोडा है।"),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ Brine + electricity → sodium hydroxide, chlorine, hydrogen (chlor-alkali). ✓ Chlorine + dry slaked lime → bleaching powder. ✓ Baking soda, NaHCO₃: baking powder, antacids, extinguishers. ✓ Washing soda, Na₂CO₃·10H₂O: glass, soap, paper, hard water. ✓ Act 4, the extinguisher: ready. Last stop: what is that 10H₂O, and the handprint keepsake.",
        "**मिशन लॉग।** ✓ लवण-जल + बिजली → सोडियम हाइड्रॉक्साइड, क्लोरीन, हाइड्रोजन (क्लोर-क्षार)। ✓ क्लोरीन + सूखा बुझा चूना → विरंजक चूर्ण। ✓ खाने का सोडा, NaHCO₃: बेकिंग पाउडर, प्रतिअम्ल, अग्निशामक। ✓ धावन सोडा, Na₂CO₃·10H₂O: काँच, साबुन, काग़ज़, कठोर जल। ✓ करतब 4, अग्निशामक: तैयार। आख़िरी पड़ाव: वह 10H₂O क्या है, और हाथ की छाप।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(ask1.on(QuestionSignal.Correct), theBoard.show(ask2));
    b.when(ask2.on(QuestionSignal.Correct), theBoard.show(ask3));
    b.when(ask3.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), ask1, ask2, ask3, log, space()]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [hook, chlorAlkali, bleaching, bakingSoda, washingSoda, inLife, yourTurn];

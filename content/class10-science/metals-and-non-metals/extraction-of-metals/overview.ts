import type { BoardKit } from "@chalk/author";
import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, multiChoiceQuestion, wordsOn } from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  ExtractMetal,
  FlowAction,
  OreKind,
  ThermitAction,
  extractionFlowDef,
  thermitWeldDef,
} from "@chalk/prop-chemistry";
import { MetalSceneKind, ce, ceHeat, ceOn, sceneOn } from "../kit";

const r = String.raw;
const HEAT = t("Heat", "ऊष्मा");

/** The extraction path for a metal, with the series bands beside it. */
function flowOn(
  b: BoardKit,
  name: string,
  metal: ExtractMetal,
  options: { ore?: OreKind; metals?: ExtractMetal[] } = {},
) {
  const flow = b.prop(extractionFlowDef, name, {
    metal,
    ore: options.ore ?? OreKind.Sulphide,
    step: 0,
    canStep: true,
    showSeries: true,
    metals: options.metals ?? [],
  });
  b.studentOnly(flow.action(FlowAction.Next));
  if ((options.metals ?? []).length > 0) b.studentOnly(flow.action(FlowAction.ChooseMetal));
  b.studentOnly(flow.action(FlowAction.ChooseOre));
  return flow;
}

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const jeweller = sceneOn(
    b,
    "jeweller",
    MetalSceneKind.Jeweller,
    "Mom and Riya at a jeweller's counter; the jeweller weighs a bangle on a small balance",
  );
  return column([
    w.title(t("Where does gold come from?", "सोना कहाँ से आता है?")),
    jeweller,
    w.body(
      t(
        'Mom takes the bangles to the family jeweller, who has known them for years. He confirms the weight loss and says: **"Gold is found as gold, in the ground. Iron, zinc, aluminium: those take real work to get out."** Kabir wants to know what "real work" means.',
        'मम्मी चूड़ियाँ परिवार के सुनार के पास ले जाती हैं, जो उन्हें सालों से जानता है। वह भार कम होने की पुष्टि करता है और कहता है: **"सोना ज़मीन में सोने के रूप में ही मिलता है। लोहा, ज़िंक, ऐलुमिनियम: इन्हें निकालने में असली मेहनत लगती है।"** कबीर जानना चाहता है कि "असली मेहनत" का मतलब क्या है।',
      ),
    ),
    w.body(
      t(
        "Clue 7: where are metals found, and how are they got out of the ground?",
        "सुराग 7: धातुएँ कहाँ मिलती हैं, और उन्हें धरती से कैसे निकाला जाता है?",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Minerals, ores, gangue; Fig 3.9: three groups by reactivity. */
const occurrence = page(
  "occurrence",
  (b) => {
    const w = wordsOn(b);
    const flow = flowOn(b, "flow", ExtractMetal.Gold, {
      metals: [ExtractMetal.Sodium, ExtractMetal.Zinc, ExtractMetal.Gold],
    });
    b.standsFor(
      flow,
      "the reactivity series in three bands, high, middle and low; choosing gold, zinc or sodium highlights its band and shows the first step of getting it out",
    );
    const free = choiceQuestion(b, {
      name: "free",
      prompt: t(
        "Which metals can be found in the free state?",
        "कौन-सी धातुएँ मुक्त अवस्था में मिल सकती हैं?",
      ),
      options: [
        { id: "right", label: t("Gold and silver", "सोना और चाँदी") },
        {
          id: "na",
          label: t("Sodium and potassium", "सोडियम और पोटैशियम"),
          feedback: t(
            "They are so reactive they're never found free in nature.",
            "वे इतने क्रियाशील हैं कि प्रकृति में कभी मुक्त नहीं मिलते।",
          ),
        },
        {
          id: "zn",
          label: t("Zinc and iron", "ज़िंक और लोहा"),
          feedback: t(
            "Middle metals are found mainly as oxides, sulphides or carbonates.",
            "बीच की धातुएँ मुख्यतः ऑक्साइड, सल्फ़ाइड या कार्बोनेट के रूप में मिलती हैं।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Minerals and ores", "खनिज और अयस्क")),
      w.definition(
        t(
          "**Mineral, ore, gangue.** The **earth's crust** is the major source of metals; seawater also holds some salts, such as sodium chloride and magnesium chloride. Elements or compounds that occur naturally in the earth's crust are **minerals**. A mineral with a high enough percentage of a metal for the metal to be profitably extracted is an **ore**. Ores dug from the ground are mixed with impurities such as soil and sand, called **gangue**.",
          "**खनिज, अयस्क, गैंग।** **भूपर्पटी** धातुओं का मुख्य स्रोत है; समुद्री जल में भी कुछ लवण होते हैं, जैसे सोडियम क्लोराइड और मैग्नीशियम क्लोराइड। भूपर्पटी में प्राकृतिक रूप से मिलने वाले तत्व या यौगिक **खनिज** हैं। जिस खनिज में किसी धातु का प्रतिशत इतना ऊँचा हो कि उससे धातु लाभ के साथ निकाली जा सके, वह **अयस्क** है। धरती से खोदे गए अयस्कों में मिट्टी और रेत जैसी अशुद्धियाँ मिली होती हैं, जिन्हें **गैंग** कहते हैं।",
        ),
      ),
      flow,
      w.definition(
        t(
          "**Three groups.** Metals at the **bottom** of the series (gold, silver, platinum, and sometimes copper) are so unreactive that they're often found **free**, as the metal itself: the **native** state. Metals at the **top** (K, Na, Ca, Mg, Al) are so reactive they are **never** found free. Metals in the **middle** (Zn, Fe, Pb) are found mainly as **oxides, sulphides or carbonates**. Many ores are oxides, because oxygen is very reactive and very abundant.",
          "**तीन समूह।** श्रेणी में **सबसे नीचे** की धातुएँ (सोना, चाँदी, प्लैटिनम, और कभी-कभी ताँबा) इतनी अक्रियाशील हैं कि प्रायः **मुक्त** रूप में, यानी धातु के रूप में ही, मिलती हैं: **प्राकृत** अवस्था। **सबसे ऊपर** की धातुएँ (K, Na, Ca, Mg, Al) इतनी क्रियाशील हैं कि **कभी** मुक्त नहीं मिलतीं। **बीच** की धातुएँ (Zn, Fe, Pb) मुख्यतः **ऑक्साइड, सल्फ़ाइड या कार्बोनेट** के रूप में मिलती हैं। कई अयस्क ऑक्साइड हैं, क्योंकि ऑक्सीजन बहुत क्रियाशील और बहुत प्रचुर है।",
        ),
      ),
      w.body(
        t(
          "The first step for any ore is to **enrich** it: remove the gangue, using differences between the physical or chemical properties of the gangue and the ore. Then the method depends on the group.",
          "किसी भी अयस्क का पहला क़दम उसका **समृद्धीकरण** है: गैंग और अयस्क के भौतिक या रासायनिक गुणों के अंतर का उपयोग करके गैंग हटाना। फिर तरीक़ा समूह पर निर्भर करता है।",
        ),
      ),
      free,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Low in the series: heating alone (HgS, Cu₂S). */
const low = page(
  "low",
  (b) => {
    const w = wordsOn(b);
    const flow = flowOn(b, "flow", ExtractMetal.Mercury, {
      metals: [ExtractMetal.Mercury, ExtractMetal.Copper],
    });
    b.standsFor(
      flow,
      "the path for mercury from cinnabar, or copper from copper sulphide: heated in air, then heated further, giving the metal",
    );
    const how = choiceQuestion(b, {
      name: "how",
      prompt: t(
        "How is copper got from copper sulphide, Cu₂S?",
        "कॉपर सल्फ़ाइड, Cu₂S, से ताँबा कैसे प्राप्त होता है?",
      ),
      options: [
        { id: "right", label: t("By just heating it in air", "बस हवा में गर्म करके") },
        {
          id: "electro",
          label: t("By electrolysis", "विद्युत अपघटन से"),
          feedback: t(
            "Electrolysis is for the most reactive metals. Copper is low in the series.",
            "विद्युत अपघटन सबसे क्रियाशील धातुओं के लिए है। ताँबा श्रेणी में नीचे है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Metals low in the series", "श्रेणी में नीचे की धातुएँ")),
      w.body(
        t(
          "Metals low in the series are very unreactive: their oxides turn back into metal by **heating alone**. **Cinnabar**, $\\ce{HgS}$, is an ore of mercury. Heated in air, it first becomes mercuric oxide, which on further heating gives mercury:",
          "श्रेणी में नीचे की धातुएँ बहुत अक्रियाशील हैं: उनके ऑक्साइड **केवल गर्म करने** से वापस धातु बन जाते हैं। **सिनेबार**, $\\ce{HgS}$, पारे का एक अयस्क है। हवा में गर्म करने पर यह पहले मरक्यूरिक ऑक्साइड बनता है, जो और गर्म करने पर पारा देता है:",
        ),
      ),
      flow,
      w.body(ceOn("2HgS(s) + 3O2(g)", "2HgO(s) + 2SO2(g)", HEAT)),
      w.body(ceOn("2HgO(s)", "2Hg(l) + O2(g)", HEAT)),
      w.body(
        t(
          "Copper, found as $\\ce{Cu2S}$, is got the same way, just by heating in air:",
          "$\\ce{Cu2S}$ के रूप में मिलने वाला ताँबा भी इसी तरह, बस हवा में गर्म करके, मिलता है:",
        ),
      ),
      w.body(ceOn("2Cu2S + 3O2(g)", "2Cu2O(s) + 2SO2(g)", HEAT)),
      w.body(ceOn("2Cu2O + Cu2S", "6Cu(s) + SO2(g)", HEAT)),
      how,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The middle: roasting and calcination, then reduction with carbon. */
const middle = page(
  "middle",
  (b) => {
    const w = wordsOn(b);
    const flow = flowOn(b, "flow", ExtractMetal.Zinc);
    b.standsFor(
      flow,
      "the path for zinc: choose a sulphide or a carbonate ore; the sulphide is roasted in plenty of air, the carbonate calcined in limited air, both giving zinc oxide, which is then heated with carbon to give zinc",
    );
    const which = choiceQuestion(b, {
      name: "which",
      prompt: t(
        r`Zinc carbonate, $\ce{ZnCO3}$, is heated strongly in limited air. What is this step called?`,
        r`ज़िंक कार्बोनेट, $\ce{ZnCO3}$, को सीमित हवा में तेज़ गर्म किया जाता है। इस क़दम को क्या कहते हैं?`,
      ),
      options: [
        { id: "right", label: t("Calcination", "निस्तापन") },
        {
          id: "roast",
          label: t("Roasting", "भर्जन"),
          feedback: t(
            "Roasting is for sulphide ores, in excess air. Carbonates are calcined.",
            "भर्जन सल्फ़ाइड अयस्कों के लिए है, अधिक हवा में। कार्बोनेटों का निस्तापन होता है।",
          ),
        },
        {
          id: "reduce",
          label: t("Reduction", "अपचयन"),
          feedback: t(
            "Reduction comes after, when the oxide is turned into metal.",
            "अपचयन उसके बाद आता है, जब ऑक्साइड को धातु में बदला जाता है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Metals in the middle", "बीच की धातुएँ")),
      w.body(
        t(
          "Iron, zinc, lead and copper are usually found as **sulphides** or **carbonates**. It is easier to get a metal from its **oxide**, so these are first turned into oxides. Choose the ore and step through:",
          "लोहा, ज़िंक, लेड और ताँबा प्रायः **सल्फ़ाइड** या **कार्बोनेट** के रूप में मिलते हैं। धातु को उसके **ऑक्साइड** से निकालना आसान है, इसलिए इन्हें पहले ऑक्साइड में बदला जाता है। अयस्क चुनो और क़दम-दर-क़दम चलो:",
        ),
      ),
      flow,
      w.definition(
        t(
          "**Roasting and calcination.** Heating a **sulphide** ore strongly in **excess air** to turn it into the oxide is **roasting**. Heating a **carbonate** ore strongly in **limited air** to turn it into the oxide is **calcination**.",
          "**भर्जन और निस्तापन।** **सल्फ़ाइड** अयस्क को **अधिक हवा** में तेज़ गर्म करके ऑक्साइड में बदलना **भर्जन** है। **कार्बोनेट** अयस्क को **सीमित हवा** में तेज़ गर्म करके ऑक्साइड में बदलना **निस्तापन** है।",
        ),
      ),
      w.body(t("Roasting:", "भर्जन:")),
      w.body(ceOn("2ZnS(s) + 3O2(g)", "2ZnO(s) + 2SO2(g)", HEAT)),
      w.body(t("Calcination:", "निस्तापन:")),
      w.body(ceOn("ZnCO3(s)", "ZnO(s) + CO2(g)", HEAT)),
      w.definition(
        t(
          "**Reduction with carbon.** The oxide is then **reduced** to the metal with a reducing agent such as **carbon** (coke). Getting a metal out of its compound is a **reduction**: the oxide loses its oxygen.",
          "**कार्बन से अपचयन।** फिर ऑक्साइड को **कार्बन** (कोक) जैसे अपचायक से धातु में **अपचयित** किया जाता है। धातु को उसके यौगिक से निकालना एक **अपचयन** है: ऑक्साइड अपनी ऑक्सीजन खोता है।",
        ),
      ),
      w.body(ce("ZnO(s) + C(s) -> Zn(s) + CO(g)")),
      which,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Displacement as reduction: MnO₂ + Al; the thermit reaction. */
const thermit = page(
  "thermit",
  (b) => {
    const w = wordsOn(b);
    const weld = b.prop(thermitWeldDef, "weld", {
      isIgnited: false,
      showEquation: true,
      canIgnite: true,
    });
    b.studentOnly(weld.action(ThermitAction.Ignite));
    b.studentOnly(weld.action(ThermitAction.Reset));
    b.standsFor(
      weld,
      "two railway rail ends with a gap between them and a crucible of iron(III) oxide and aluminium powder above; lighting it, molten iron pours into the gap and joins the rails",
    );
    const ox = choiceQuestion(b, {
      name: "ox",
      prompt: t(
        r`In $\ce{3MnO2 + 4Al -> 3Mn + 2Al2O3}$, which substance is oxidised and which is reduced?`,
        r`$\ce{3MnO2 + 4Al -> 3Mn + 2Al2O3}$ में कौन-सा पदार्थ ऑक्सीकृत होता है और कौन-सा अपचयित?`,
      ),
      options: [
        {
          id: "right",
          label: t(
            r`Aluminium is oxidised; $\ce{MnO2}$ is reduced`,
            r`ऐलुमिनियम ऑक्सीकृत होता है; $\ce{MnO2}$ अपचयित होता है`,
          ),
        },
        {
          id: "swap",
          label: t(
            r`$\ce{MnO2}$ is oxidised; aluminium is reduced`,
            r`$\ce{MnO2}$ ऑक्सीकृत होता है; ऐलुमिनियम अपचयित होता है`,
          ),
          feedback: t(
            "Aluminium gains oxygen (oxidised); manganese dioxide loses it (reduced).",
            "ऐलुमिनियम ऑक्सीजन पाता है (ऑक्सीकृत); मैंगनीज़ डाइऑक्साइड उसे खोता है (अपचयित)।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Displacement does the reducing", "विस्थापन अपचयन करता है")),
      w.body(
        t(
          "Besides carbon, a **more reactive metal** can reduce an oxide by displacement. Sodium, calcium and aluminium are used this way. Manganese dioxide heated with aluminium powder:",
          "कार्बन के अलावा, एक **अधिक क्रियाशील धातु** विस्थापन द्वारा ऑक्साइड का अपचयन कर सकती है। सोडियम, कैल्शियम और ऐलुमिनियम ऐसे उपयोग होते हैं। मैंगनीज़ डाइऑक्साइड को ऐलुमिनियम चूर्ण के साथ गर्म करने पर:",
        ),
      ),
      w.body(ceHeat("3MnO2(s) + 4Al(s) -> 3Mn(l) + 2Al2O3(s)")),
      w.definition(
        t(
          "**The thermit reaction.** These displacement reactions are so **exothermic** that the metal comes out **molten**. Iron(III) oxide with aluminium is used to **join railway tracks** and cracked machine parts: this is the **thermit reaction**.",
          "**थर्मिट अभिक्रिया।** ये विस्थापन अभिक्रियाएँ इतनी **ऊष्माक्षेपी** हैं कि धातु **पिघली** हुई निकलती है। आयरन(III) ऑक्साइड और ऐलुमिनियम का उपयोग **रेल की पटरियाँ जोड़ने** और टूटे मशीनी पुर्ज़े जोड़ने में होता है: यह **थर्मिट अभिक्रिया** है।",
        ),
      ),
      weld,
      w.body(ceHeat("Fe2O3(s) + 2Al(s) -> 2Fe(l) + Al2O3(s)")),
      ox,
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
    const rails = sceneOn(
      b,
      "rails",
      MetalSceneKind.RailwayWeld,
      "a railway track being joined with a glowing thermit crucible; Grandpa and Kabir watching from behind a fence",
    );
    const why = choiceQuestion(b, {
      name: "why",
      prompt: t(
        "On the way home they see workers joining a railway track with a fierce glow. Why aluminium and iron oxide, and not just a flame?",
        "घर लौटते समय वे मज़दूरों को एक तेज़ चमक के साथ रेल की पटरी जोड़ते देखते हैं। केवल लौ नहीं, ऐलुमिनियम और आयरन ऑक्साइड क्यों?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Aluminium displaces iron from its oxide, giving out so much heat that the iron comes out molten and fills the gap",
            "ऐलुमिनियम लोहे को उसके ऑक्साइड से विस्थापित करता है, और इतनी ऊष्मा देता है कि लोहा पिघला हुआ निकलकर खाली जगह भर देता है",
          ),
        },
        {
          id: "glue",
          label: t("Aluminium is a strong glue", "ऐलुमिनियम एक मज़बूत गोंद है"),
          feedback: t(
            "It isn't glue: it's a displacement reaction that makes molten iron.",
            "यह गोंद नहीं है: यह एक विस्थापन अभिक्रिया है जो पिघला लोहा बनाती है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const gold = choiceQuestion(b, {
      name: "gold",
      prompt: t(
        'Why did the jeweller say gold is "found as gold"?',
        'सुनार ने यह क्यों कहा कि सोना "सोने के रूप में मिलता है"?',
      ),
      options: [
        {
          id: "right",
          label: t(
            "Gold is at the bottom of the series, so it's found free, in the native state",
            "सोना श्रेणी में सबसे नीचे है, इसलिए यह मुक्त, प्राकृत अवस्था में मिलता है",
          ),
        },
        {
          id: "ore",
          label: t("Gold has no ores", "सोने का कोई अयस्क नहीं"),
          feedback: t(
            "The point is that gold doesn't need reducing: it's found as the metal itself.",
            "बात यह है कि सोने का अपचयन नहीं करना पड़ता: यह धातु के रूप में ही मिलता है।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const notes = w.definition(
      t(
        "**Case notes.** ✓ Gold is found free in nature, because it's so unreactive. ✓ Middle metals are roasted or calcined to oxides, then reduced with carbon or a more reactive metal. ? But gold and other metals still have to be **purified**. Next clue: refining.",
        "**केस नोट्स।** ✓ सोना प्रकृति में मुक्त मिलता है, क्योंकि यह बहुत अक्रियाशील है। ✓ बीच की धातुओं का भर्जन या निस्तापन करके ऑक्साइड बनाया जाता है, फिर कार्बन या किसी अधिक क्रियाशील धातु से अपचयन। ? पर सोने और दूसरी धातुओं को फिर भी **शुद्ध** करना पड़ता है। अगला सुराग: परिष्करण।",
      ),
      "notes",
      { isHidden: true },
    );
    b.when(why.on(QuestionSignal.Correct), theBoard.show(gold));
    b.when(gold.on(QuestionSignal.Correct), [theBoard.show(notes), theBoard.pass()]);
    return column([
      w.title(t("Sparks on the tracks", "पटरियों पर चिंगारियाँ")),
      rails,
      why,
      gold,
      notes,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** In-text questions p. 53, Exercise 12(d). */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const gangue = choiceQuestion(b, {
      name: "gangue",
      prompt: t("What is gangue?", "गैंग क्या है?"),
      options: [
        {
          id: "right",
          label: t(
            "The soil, sand and other impurities mixed with an ore",
            "अयस्क में मिली मिट्टी, रेत और दूसरी अशुद्धियाँ",
          ),
        },
        {
          id: "ore",
          label: t("A mineral rich in a metal", "धातु से भरपूर एक खनिज"),
          feedback: t(
            "That's an ore. Gangue is what has to be removed from it.",
            "वह अयस्क है। गैंग वह है जिसे उससे हटाना होता है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const why = choiceQuestion(b, {
      name: "why",
      prompt: t(
        "Why are carbonate and sulphide ores usually turned into oxides during extraction?",
        "निष्कर्षण के दौरान कार्बोनेट और सल्फ़ाइड अयस्कों को प्रायः ऑक्साइड में क्यों बदला जाता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "It is easier to get a metal from its oxide than from its sulphide or carbonate",
            "धातु को उसके सल्फ़ाइड या कार्बोनेट की तुलना में उसके ऑक्साइड से निकालना आसान है",
          ),
        },
        {
          id: "weight",
          label: t(
            "Oxides weigh less, so they're easier to carry",
            "ऑक्साइड हल्के होते हैं, इसलिए ले जाना आसान है",
          ),
          feedback: t(
            "The reason is chemical: oxides are easier to reduce to the metal.",
            "कारण रासायनिक है: ऑक्साइडों का धातु में अपचयन आसान है।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const process = multiChoiceQuestion(b, {
      name: "process",
      prompt: t(
        "Which can reduce a metal oxide to the metal? Tick all.",
        "कौन-से धातु ऑक्साइड को धातु में अपचयित कर सकते हैं? सभी पर निशान लगाओ।",
      ),
      options: [
        {
          id: "carbon",
          label: t(
            "Heating with carbon (for middle metals)",
            "कार्बन के साथ गर्म करना (बीच की धातुओं के लिए)",
          ),
        },
        {
          id: "al",
          label: t(
            "Heating with a more reactive metal such as aluminium",
            "ऐलुमिनियम जैसी अधिक क्रियाशील धातु के साथ गर्म करना",
          ),
        },
        {
          id: "heat",
          label: t(
            "Heating alone (for metals low in the series)",
            "केवल गर्म करना (श्रेणी में नीचे की धातुओं के लिए)",
          ),
        },
        {
          id: "water",
          label: t("Dissolving in water", "पानी में घोलना"),
          feedback: t(
            "Water doesn't remove oxygen from an oxide.",
            "पानी किसी ऑक्साइड से ऑक्सीजन नहीं हटाता।",
          ),
        },
      ],
      answers: ["carbon", "al", "heat"],
      missing: t("Right so far: there's another way.", "अब तक सही: एक और तरीक़ा है।"),
      isHidden: true,
      passes: false,
    });
    const notes = w.definition(
      t(
        "**Case notes.** ✓ Mineral, ore, gangue. ✓ Low metals: heat alone. Middle metals: roast or calcine, then reduce with carbon or a more reactive metal (thermit). Next clue: the top of the series, and refining.",
        "**केस नोट्स।** ✓ खनिज, अयस्क, गैंग। ✓ नीचे की धातुएँ: केवल गर्म करना। बीच की धातुएँ: भर्जन या निस्तापन, फिर कार्बन या अधिक क्रियाशील धातु से अपचयन (थर्मिट)। अगला सुराग: श्रेणी का सबसे ऊपरी भाग, और परिष्करण।",
      ),
      "notes",
      { isHidden: true },
    );
    b.when(gangue.on(QuestionSignal.Correct), theBoard.show(why));
    b.when(why.on(QuestionSignal.Correct), theBoard.show(process));
    b.when(process.on(QuestionSignal.Correct), [theBoard.show(notes), theBoard.pass()]);
    return column([
      w.title(t("Your turn", "अब तुम्हारी बारी")),
      gangue,
      why,
      process,
      notes,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [hook, occurrence, low, middle, thermit, inLife, yourTurn];

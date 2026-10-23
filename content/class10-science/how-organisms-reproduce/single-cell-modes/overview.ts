import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  AsexualAction,
  Organism,
  ReproductionScene,
  asexualModesDef,
  reproductionSceneDef,
} from "@chalk/prop-reproduction";

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** Riya's yeast tube, Kabir's pond jar, and Mom's mouldy bread. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const tube = b.prop(reproductionSceneDef, "tube", { scene: ReproductionScene.YeastTube });
  b.standsFor(
    tube,
    "Riya holds up a test tube of sugar water with a pinch of yeast and a cotton plug",
  );
  const jar = b.prop(reproductionSceneDef, "jar", { scene: ReproductionScene.PondJar });
  b.standsFor(jar, "Kabir by a pond, holding a jar of green water with thread-like strands");
  return column([
    w.title(t("Three experiments on the kitchen table", "रसोई की मेज़ पर तीन प्रयोग")),
    tube,
    w.body(
      t(
        "Recap: Grandpa's money-plant pieces are rooting, copies of their parent. Riya wants to see copying happen in something tiny. She stirs a spoon of sugar into water, adds a pinch of baker's yeast, plugs the tube with cotton and leaves it somewhere warm (NCERT Activity 8.1).",
        "पिछली बार: दादाजी के मनी प्लांट के टुकड़ों में जड़ें आ रही हैं, अपने जनक की प्रतियाँ। रिया किसी बहुत छोटी चीज़ में नक़ल होते देखना चाहती है। वह पानी में एक चम्मच चीनी घोलती है, चुटकी भर यीस्ट डालती है, नली को रुई से बंद करती है और किसी गरम जगह रख देती है (NCERT क्रियाकलाप 8.1)।",
      ),
    ),
    jar,
    w.body(
      t(
        "Kabir comes back from the park pond with a jar of dark green water full of slimy threads. And Mom finds a forgotten slice of bread growing grey fuzz (Activity 8.2). Three living things, all making more of themselves. Do they all do it the same way?",
        "कबीर पार्क के तालाब से गहरे हरे पानी का एक जार लाता है, जिसमें चिपचिपे धागे भरे हैं। और मम्मी को भूली हुई ब्रेड की एक स्लाइस मिलती है जिस पर धूसर रोएँ उग आए हैं (क्रियाकलाप 8.2)। तीन जीव, तीनों अपने जैसे और बना रहे हैं। क्या सब एक ही तरह से?",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Modes depend on body design; fission: binary in Amoeba (any plane) and Leishmania. */
const binary = page(
  "binary",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "NCERT 8.2.1: unicellular organisms reproduce by fission. Binary fission: Amoeba splits in any plane (Activity 8.3); Leishmania, with a whip-like structure, splits in a definite orientation.",
    );
    const cell = b.prop(asexualModesDef, "cell", {
      organism: Organism.Amoeba,
      step: 0,
      showNames: true,
      canStep: true,
      choices: [Organism.Amoeba, Organism.Leishmania],
    });
    b.studentOnly(cell.action(AsexualAction.Next));
    b.studentOnly(cell.action(AsexualAction.Reset));
    b.studentOnly(cell.action(AsexualAction.Choose));
    b.standsFor(
      cell,
      "binary fission step by step: Amoeba splitting in any plane, or Leishmania splitting along its length beside its whip-like flagellum",
    );
    const plane = choiceQuestion(b, {
      name: "plane",
      prompt: t(
        "Watch both. What is different about how Leishmania splits?",
        "दोनों देखो। लीशमैनिया के बँटने में क्या अलग है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "It splits in a definite direction, set by its whip-like structure",
            "यह एक निश्चित दिशा में बँटता है, जो उसकी चाबुक जैसी संरचना तय करती है",
          ),
        },
        {
          id: "many",
          label: t("It splits into many cells at once", "यह एक साथ कई कोशिकाओं में बँटता है"),
          feedback: t(
            "That is multiple fission, as in Plasmodium. Leishmania still splits into two, but always in a definite orientation.",
            "वह बहुखंडन है, जैसे प्लाज़्मोडियम में। लीशमैनिया भी दो में ही बँटता है, पर हमेशा एक निश्चित दिशा में।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Splitting in two: fission", "दो में बँटना: विखंडन")),
      w.body(
        t(
          "How an organism reproduces depends on its **body design**. The simplest designs are single cells.",
          "कोई जीव कैसे जनन करता है, यह उसकी **शारीरिक संरचना** पर निर्भर है। सबसे सरल संरचनाएँ एककोशिकीय हैं।",
        ),
      ),
      w.definition(
        t(
          "**Unicellular and fission.** An organism made of just one cell is **unicellular**; one made of many cells is **multicellular**. In a unicellular organism, cell division itself makes new individuals: this is **fission**. When the cell splits into two equal halves, it is **binary fission** (*binary* means two). Many bacteria and protozoa (single-celled animal-like organisms) reproduce this way.",
          "**एककोशिकीय और विखंडन।** केवल एक कोशिका से बना जीव **एककोशिकीय** है; बहुत सी कोशिकाओं से बना **बहुकोशिकीय**। एककोशिकीय जीव में कोशिका का बँटना ही नए जीव बनाता है: यह **विखंडन** है। जब कोशिका दो बराबर हिस्सों में बँटती है, तो यह **द्विखंडन** है। बहुत से जीवाणु और प्रोटोज़ोआ (एककोशिकीय जंतु जैसे जीव) इसी तरह जनन करते हैं।",
        ),
      ),
      w.body(
        t(
          "In **Amoeba** the split can happen in any plane (Activity 8.3). **Leishmania**, which causes the disease kala-azar, is a little more organised: it has a whip-like structure at one end, and it splits in a definite orientation to it. Switch between them.",
          "**अमीबा** में बँटवारा किसी भी तल में हो सकता है (क्रियाकलाप 8.3)। **लीशमैनिया**, जो काला-अज़ार रोग फैलाता है, थोड़ा ज़्यादा व्यवस्थित है: इसके एक सिरे पर चाबुक जैसी संरचना होती है, और यह उसके सापेक्ष एक निश्चित दिशा में बँटता है। दोनों के बीच बदलकर देखो।",
        ),
      ),
      cell,
      plane,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Multiple fission (Plasmodium) and budding in yeast. */
const multiple = page(
  "multiple",
  (b) => {
    const w = wordsOn(b);
    const cell = b.prop(asexualModesDef, "cell", {
      organism: Organism.Plasmodium,
      step: 0,
      showNames: true,
      canStep: true,
      choices: [Organism.Plasmodium, Organism.Yeast],
    });
    b.studentOnly(cell.action(AsexualAction.Next));
    b.studentOnly(cell.action(AsexualAction.Reset));
    b.studentOnly(cell.action(AsexualAction.Choose));
    b.standsFor(
      cell,
      "multiple fission in Plasmodium, the nucleus dividing into many and the cell breaking into many daughter cells; or yeast putting out a small bud",
    );
    const differ = choiceQuestion(b, {
      name: "differ",
      prompt: t(
        "How does binary fission differ from multiple fission?",
        "द्विखंडन, बहुखंडन से कैसे भिन्न है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Binary fission makes two cells; multiple fission makes many at once",
            "द्विखंडन दो कोशिकाएँ बनाता है; बहुखंडन एक साथ कई",
          ),
        },
        {
          id: "parents",
          label: t("Multiple fission needs two parents", "बहुखंडन में दो जनक चाहिए"),
          feedback: t(
            "Both are done by a single cell alone. The difference is how many daughter cells come out at once: two, or many.",
            "दोनों अकेली एक कोशिका करती है। अंतर यह है कि एक साथ कितनी संतति कोशिकाएँ निकलती हैं: दो, या कई।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Many at once, or a small bud", "एक साथ कई, या एक छोटी कली")),
      w.definition(
        t(
          "**Multiple fission and budding.** Some single cells divide into many daughter cells at the same time: **multiple fission**. The malaria parasite, **Plasmodium**, does this. **Yeast** does something else: it puts out a small outgrowth, a **bud**, which separates and grows on its own. That is **budding**.",
          "**बहुखंडन और मुकुलन।** कुछ एककोशिकीय जीव एक ही समय पर कई संतति कोशिकाओं में बँट जाते हैं: **बहुखंडन**। मलेरिया परजीवी, **प्लाज़्मोडियम**, ऐसा करता है। **यीस्ट** कुछ और करता है: उससे एक छोटा उभार, एक **कली** (मुकुल), निकलती है, जो अलग होकर अपने आप बढ़ती है। यह **मुकुलन** है।",
        ),
      ),
      cell,
      differ,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Fragmentation in Spirogyra; why most multicellular bodies can't split cell by cell. */
const fragments = page(
  "fragments",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "NCERT 8.2.2: Spirogyra simply breaks into fragments that grow into new individuals (Activity 8.4: all its cells are alike, no separate tissues). Most multicellular organisms can't divide cell-by-cell, because specialised cells form tissues and organs in definite positions; reproduction is the job of one cell type that can make the others.",
    );
    const alga = b.prop(asexualModesDef, "alga", {
      organism: Organism.Spirogyra,
      step: 0,
      showNames: true,
      canStep: true,
      choices: [],
    });
    b.studentOnly(alga.action(AsexualAction.Next));
    b.studentOnly(alga.action(AsexualAction.Reset));
    b.standsFor(
      alga,
      "a Spirogyra filament, a chain of alike cells, breaking into pieces that each grow into a new filament",
    );
    const why = choiceQuestion(b, {
      name: "why",
      prompt: t(
        "Why can't Kabir's body just split up cell by cell to make new Kabirs?",
        "कबीर का शरीर कोशिका-दर-कोशिका बँटकर नए कबीर क्यों नहीं बना सकता?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "His cells are specialised into tissues and organs that must sit in definite places",
            "उसकी कोशिकाएँ ऊतकों और अंगों में विशिष्ट हैं, जिन्हें निश्चित जगहों पर होना चाहिए",
          ),
        },
        {
          id: "size",
          label: t("He is too big", "वह बहुत बड़ा है"),
          feedback: t(
            "Size isn't the reason. A Spirogyra piece works because all its cells are alike; Kabir's body is an organised set of different tissues and organs.",
            "आकार कारण नहीं है। स्पाइरोगाइरा का टुकड़ा इसलिए चलता है क्योंकि उसकी सारी कोशिकाएँ एक जैसी हैं; कबीर का शरीर अलग-अलग ऊतकों और अंगों का व्यवस्थित समूह है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Breaking into pieces: fragmentation", "टुकड़ों में टूटना: खंडन")),
      w.body(
        t(
          "Kabir's green threads are **Spirogyra**, a simple multicellular alga (a plant-like water organism). Under a microscope (Activity 8.4) each thread is just a chain of cells that all look alike: there are no separate tissues.",
          "कबीर के हरे धागे **स्पाइरोगाइरा** हैं, एक सरल बहुकोशिकीय शैवाल (पानी में रहने वाला पौधे जैसा जीव)। सूक्ष्मदर्शी में (क्रियाकलाप 8.4) हर धागा बस कोशिकाओं की एक श्रृंखला है, सब एक जैसी: अलग-अलग ऊतक नहीं हैं।",
        ),
      ),
      w.definition(
        t(
          "**Fragmentation.** When a mature organism simply breaks up into smaller pieces (**fragments**), and each piece grows into a new individual, it is **fragmentation**.",
          "**खंडन।** जब कोई परिपक्व जीव बस छोटे-छोटे टुकड़ों (**खंडों**) में टूट जाता है, और हर टुकड़ा नए जीव में बढ़ता है, तो यह **खंडन** है।",
        ),
      ),
      alga,
      w.body(
        t(
          "Most multicellular organisms can't do this. They aren't a random heap of cells: specialised cells form **tissues**, tissues form **organs**, and organs must sit in definite places in the body. Dividing cell by cell would be impractical. Instead, reproduction becomes the job of one particular cell type, one that can grow, multiply and make the other cell types under the right conditions.",
          "ज़्यादातर बहुकोशिकीय जीव ऐसा नहीं कर सकते। वे कोशिकाओं का बेतरतीब ढेर नहीं हैं: विशिष्ट कोशिकाएँ **ऊतक** बनाती हैं, ऊतक **अंग** बनाते हैं, और अंगों को शरीर में निश्चित जगहों पर होना होता है। कोशिका-दर-कोशिका बँटना अव्यावहारिक होगा। इसके बजाय जनन एक ख़ास तरह की कोशिका का काम बन जाता है, जो सही परिस्थितियों में बढ़ सके, गुणन कर सके और बाक़ी तरह की कोशिकाएँ बना सके।",
        ),
      ),
      why,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Regeneration (Planaria) and budding in Hydra. */
const regrow = page(
  "regrow",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "NCERT 8.2.3–8.2.4: Hydra and Planaria cut into pieces regrow each piece into a whole organism (regeneration, by specialised cells; the organised sequence of changes is development). Regeneration is not reproduction. Hydra uses regenerative cells to reproduce by budding.",
    );
    const worm = b.prop(asexualModesDef, "worm", {
      organism: Organism.Planaria,
      step: 0,
      showNames: true,
      canStep: true,
      choices: [Organism.Planaria, Organism.Hydra],
    });
    b.studentOnly(worm.action(AsexualAction.Next));
    b.studentOnly(worm.action(AsexualAction.Reset));
    b.studentOnly(worm.action(AsexualAction.Choose));
    b.standsFor(
      worm,
      "a Planaria cut into pieces, each regrowing into a whole worm; or a Hydra growing a bud that detaches as a new Hydra",
    );
    const notRepro = choiceQuestion(b, {
      name: "notRepro",
      prompt: t(
        "Why is regeneration not counted as reproduction?",
        "पुनर्जनन को जनन क्यों नहीं माना जाता?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Organisms don't normally depend on being cut up to make new ones",
            "जीव सामान्य रूप से नए जीव बनाने के लिए कटने पर निर्भर नहीं रहते",
          ),
        },
        {
          id: "slow",
          label: t("It is too slow", "यह बहुत धीमा है"),
          feedback: t(
            "Speed isn't the point. Regeneration happens when an organism is accidentally cut or broken; normal reproduction doesn't rely on that.",
            "गति बात नहीं है। पुनर्जनन तब होता है जब जीव संयोग से कट या टूट जाए; सामान्य जनन इस पर निर्भर नहीं करता।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Growing back: regeneration, and budding", "फिर से उगना: पुनर्जनन, और मुकुलन")),
      w.definition(
        t(
          "**Regeneration.** Some simple animals, like **Hydra** and **Planaria** (a flatworm), can be cut into many pieces, and each piece grows into a complete organism. This is **regeneration**. Specialised cells multiply into a mass of cells, and from this mass, cells change into the different cell types and tissues in an organised order called **development**. But regeneration is **not the same as reproduction**: Planaria and Hydra don't normally depend on being cut up to make new individuals; it happens only when a body is accidentally broken. Spirogyra, on the other hand, breaks up on its own as its normal way of reproducing.",
          "**पुनर्जनन।** कुछ सरल जंतुओं, जैसे **हाइड्रा** और **प्लेनेरिया** (एक चपटा कृमि), को कई टुकड़ों में काटा जा सकता है, और हर टुकड़ा एक पूरे जीव में बढ़ जाता है। यह **पुनर्जनन** है। विशिष्ट कोशिकाएँ गुणन करके कोशिकाओं का एक समूह बनाती हैं, और इस समूह से कोशिकाएँ एक व्यवस्थित क्रम में अलग-अलग तरह की कोशिकाओं और ऊतकों में बदलती हैं, जिसे **परिवर्धन** कहते हैं। पर पुनर्जनन **जनन जैसा नहीं** है: प्लेनेरिया और हाइड्रा नए जीव बनाने के लिए सामान्यतः कटने पर निर्भर नहीं रहते; यह तभी होता है जब शरीर संयोग से टूट जाए। दूसरी ओर, स्पाइरोगायरा जनन के अपने सामान्य तरीक़े के रूप में अपने आप टूटता है।",
        ),
      ),
      w.definition(
        t(
          "**Budding in Hydra.** Hydra uses its regenerative cells to reproduce: repeated cell division at one spot makes an outgrowth, a **bud**. The bud develops into a tiny Hydra and, when fully mature, detaches as a new individual.",
          "**हाइड्रा में मुकुलन।** हाइड्रा अपनी पुनर्जनन वाली कोशिकाओं से जनन करता है: एक जगह बार-बार कोशिका विभाजन से एक उभार, एक **मुकुल** (कली), बनता है। मुकुल एक नन्हे हाइड्रा में विकसित होता है और पूरी तरह परिपक्व होने पर नए जीव की तरह अलग हो जाता है।",
        ),
      ),
      worm,
      notRepro,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** The school microscope: yeast with buds, Spirogyra in pieces. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const yeast = b.prop(asexualModesDef, "yeast", {
      organism: Organism.Yeast,
      step: 0,
      showNames: true,
      canStep: true,
      choices: [],
    });
    b.studentOnly(yeast.action(AsexualAction.Next));
    b.studentOnly(yeast.action(AsexualAction.Reset));
    b.standsFor(yeast, "yeast cells under the microscope, one putting out a bud");
    const mode = choiceQuestion(b, {
      name: "mode",
      prompt: t(
        "Riya's yeast cells have small round bulges stuck to them. Which mode is this?",
        "रिया की यीस्ट कोशिकाओं से छोटे गोल उभार चिपके हैं। यह कौन-सी विधि है?",
      ),
      options: [
        { id: "right", label: t("Budding", "मुकुलन") },
        {
          id: "binary",
          label: t("Binary fission", "द्विखंडन"),
          feedback: t(
            "In binary fission a cell splits into two equal halves. A small bulge that grows and separates is a bud.",
            "द्विखंडन में कोशिका दो बराबर हिस्सों में बँटती है। एक छोटा उभार जो बढ़कर अलग हो, वह मुकुल है।",
          ),
        },
        {
          id: "fragment",
          label: t("Fragmentation", "खंडन"),
          feedback: t(
            "Fragmentation is a many-celled body breaking into pieces, like Kabir's Spirogyra. Yeast is single-celled and buds.",
            "खंडन बहुकोशिकीय शरीर का टुकड़ों में टूटना है, जैसे कबीर का स्पाइरोगाइरा। यीस्ट एककोशिकीय है और मुकुलन करता है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const stop = w.definition(
      t(
        "**Stop 2 done.** One parent can make more of itself in many ways, chosen by its body design: binary or multiple fission, budding, fragmentation. Regeneration regrows lost parts but isn't reproduction. Mom's mouldy bread is still a mystery: next stop, along with Grandpa's potatoes.",
        "**पड़ाव 2 पूरा।** एक जनक कई तरीक़ों से अपने जैसे और बना सकता है, जो उसकी शारीरिक संरचना तय करती है: द्विखंडन या बहुखंडन, मुकुलन, खंडन। पुनर्जनन खोए भाग फिर से उगाता है पर जनन नहीं है। मम्मी की फफूँद लगी ब्रेड अभी भी रहस्य है: अगला पड़ाव, दादाजी के आलुओं के साथ।",
      ),
      "stop",
      { isHidden: true },
    );
    b.when(mode.on(QuestionSignal.Correct), [theBoard.show(stop), theBoard.pass()]);
    return column([
      w.title(t("Under the school microscope", "स्कूल के सूक्ष्मदर्शी में")),
      w.body(
        t(
          "Next day, Riya takes a drop from her yeast tube to the school lab, puts it on a slide under a coverslip and looks through the microscope. Kabir's Spirogyra threads are on the next slide, some already in broken lengths.",
          "अगले दिन रिया अपनी यीस्ट नली से एक बूँद स्कूल की प्रयोगशाला ले जाती है, उसे स्लाइड पर कवर-स्लिप के नीचे रखती है और सूक्ष्मदर्शी से देखती है। अगली स्लाइड पर कबीर के स्पाइरोगाइरा के धागे हैं, कुछ पहले से ही टूटे हुए टुकड़ों में।",
        ),
      ),
      yeast,
      mode,
      stop,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** NCERT in-text Q3, Exercises 1 and 9. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const budding = choiceQuestion(b, {
      name: "budding",
      prompt: t(
        "Asexual reproduction takes place through budding in:",
        "मुकुलन द्वारा अलैंगिक जनन होता है:",
      ),
      options: [
        { id: "right", label: t("yeast", "यीस्ट में") },
        {
          id: "amoeba",
          label: t("Amoeba", "अमीबा में"),
          feedback: t(
            "Amoeba splits into two: binary fission. Yeast puts out buds.",
            "अमीबा दो में बँटता है: द्विखंडन। यीस्ट से मुकुल निकलते हैं।",
          ),
        },
        {
          id: "plasmodium",
          label: t("Plasmodium", "प्लाज़्मोडियम में"),
          feedback: t(
            "Plasmodium divides into many cells at once: multiple fission.",
            "प्लाज़्मोडियम एक साथ कई कोशिकाओं में बँटता है: बहुखंडन।",
          ),
        },
        {
          id: "leishmania",
          label: t("Leishmania", "लीशमैनिया में"),
          feedback: t(
            "Leishmania splits into two in a definite orientation: binary fission.",
            "लीशमैनिया एक निश्चित दिशा में दो में बँटता है: द्विखंडन।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const complex = choiceQuestion(b, {
      name: "complex",
      prompt: t(
        "Why can't more complex organisms give rise to new individuals through regeneration?",
        "ज़्यादा जटिल जीव पुनर्जनन द्वारा नए जीव क्यों नहीं बना सकते?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Their bodies are organised into many specialised tissues and organs; a piece can't rebuild all of that",
            "उनका शरीर बहुत से विशिष्ट ऊतकों और अंगों में व्यवस्थित है; एक टुकड़ा यह सब फिर से नहीं बना सकता",
          ),
        },
        {
          id: "food",
          label: t("They don't eat enough", "वे पर्याप्त नहीं खाते"),
          feedback: t(
            "Food isn't the reason. A complex body has many specialised tissues and organs in definite places; a cut-off piece can't build all of them again.",
            "भोजन कारण नहीं है। जटिल शरीर में निश्चित जगहों पर बहुत से विशिष्ट ऊतक और अंग होते हैं; कटा हुआ टुकड़ा वे सब फिर से नहीं बना सकता।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const uni = choiceQuestion(b, {
      name: "uni",
      prompt: t(
        "How do the modes of reproduction differ in unicellular and multicellular organisms?",
        "एककोशिकीय और बहुकोशिकीय जीवों में जनन की विधियाँ कैसे भिन्न हैं?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "In unicellular ones cell division makes new individuals; multicellular ones need specialised cells or parts",
            "एककोशिकीय में कोशिका विभाजन से नए जीव बनते हैं; बहुकोशिकीय को विशिष्ट कोशिकाएँ या भाग चाहिए",
          ),
        },
        {
          id: "same",
          label: t("There is no difference", "कोई अंतर नहीं है"),
          feedback: t(
            "A single cell simply divides (fission, budding). Most many-celled bodies can't split cell by cell; they use special cells for budding, regeneration or reproductive organs.",
            "एक कोशिका बस बँट जाती है (विखंडन, मुकुलन)। ज़्यादातर बहुकोशिकीय शरीर कोशिका-दर-कोशिका नहीं बँट सकते; वे मुकुलन, पुनर्जनन या जनन अंगों के लिए विशिष्ट कोशिकाओं का उपयोग करते हैं।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ Fission: binary (Amoeba, Leishmania) and multiple (Plasmodium). ✓ Budding: yeast, Hydra. ✓ Fragmentation: Spirogyra. ✓ Regeneration regrows a whole Planaria, but isn't reproduction. Pots filled: none yet from these! Next: plants that grow from their own parts.",
        "**मिशन लॉग।** ✓ विखंडन: द्विखंडन (अमीबा, लीशमैनिया) और बहुखंडन (प्लाज़्मोडियम)। ✓ मुकुलन: यीस्ट, हाइड्रा। ✓ खंडन: स्पाइरोगाइरा। ✓ पुनर्जनन पूरा प्लेनेरिया फिर से उगाता है, पर जनन नहीं है। गमले: इनसे तो एक भी नहीं! आगे: वे पौधे जो अपने ही भागों से उगते हैं।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(uni.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), budding, complex, uni, log, space()]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [hook, binary, multiple, fragments, regrow, inLife, yourTurn];

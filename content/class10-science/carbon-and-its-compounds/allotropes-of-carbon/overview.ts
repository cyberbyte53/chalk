import { PassOn, column, page, space, t } from "@chalk/author";
import { goalQuestion, wordsOn } from "@chalk/patterns";
import { Allotrope, AllotropeAction, CarbonScene } from "@chalk/prop-carbon";
import { allotropesOn, ask, oneByOne, sceneOn } from "../kit";

/** Mom's nose-pin and Kabir's pencil: the same element? */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const pin = sceneOn(
    b,
    "pin",
    CarbonScene.NosePinPencil,
    "Mom's tiny diamond nose-pin sparkling on the table next to Kabir's grey pencil, and Grandpa pointing from one to the other",
  );
  return column([
    w.title(t("A diamond and a pencil", "एक हीरा और एक पेंसिल")),
    pin,
    w.body(
      t(
        "Last time: carbon shares its four electrons, and almost everything on the supply list is a carbon compound. While labelling bottles, Kabir's pencil breaks. Grandpa holds up Mom's diamond nose-pin next to it: **\"These two are the same element. Both are pure carbon.\"**",
        'पिछली बार: कार्बन अपने चार इलेक्ट्रॉन साझा करता है, और सामान की सूची की लगभग हर चीज़ कार्बन यौगिक है। बोतलों पर लेबल लगाते हुए कबीर की पेंसिल टूट जाती है। दादाजी उसके पास मम्मी की हीरे की लौंग रखते हैं: **"ये दोनों एक ही तत्व हैं। दोनों शुद्ध कार्बन हैं।"**',
      ),
    ),
    w.body(
      t(
        "Stop 2: how can one element be the hardest thing known and also soft enough to leave marks on paper?",
        "पड़ाव 2: एक ही तत्व सबसे कठोर ज्ञात पदार्थ और कागज़ पर निशान छोड़ने जितना नरम, दोनों कैसे हो सकता है?",
      ),
    ),
    space(),
  ]);
});

/** Allotropes defined; diamond, graphite, fullerene explored. */
const forms = page(
  "forms",
  (b) => {
    const w = wordsOn(b);
    const a = allotropesOn(b, "a");
    b.standsFor(
      a,
      "the three forms of carbon side by side to tap: diamond's 3-D network, graphite's flat hexagon layers, and the football-shaped C-60",
    );
    const goal = goalQuestion(b, {
      about: a,
      prompt: t(
        "Tap graphite and look at how its atoms are arranged.",
        "ग्रेफ़ाइट पर टैप करो और देखो इसके परमाणु कैसे व्यवस्थित हैं।",
      ),
      isMet: a.field("kind").eq(Allotrope.Graphite),
      solve: [a.learner(AllotropeAction.Pick, { kind: Allotrope.Graphite })],
    });
    return column([
      w.title(t("One element, different forms", "एक तत्व, अलग-अलग रूप")),
      w.definition(
        t(
          "**Allotropes.** Different forms of the same element, with the same atoms joined in different arrangements, are its **allotropes**. Carbon has several: **diamond**, **graphite** and **fullerenes**.",
          "**अपररूप।** एक ही तत्व के अलग-अलग रूप, जिनमें वही परमाणु अलग व्यवस्था में जुड़े हों, उसके **अपररूप** हैं। कार्बन के कई हैं: **हीरा**, **ग्रेफ़ाइट** और **फ़ुलरीन**।",
        ),
      ),
      a,
      goal,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Diamond vs graphite: bonding explains hardness and conduction; C-60. */
const why = page(
  "why",
  (b) => {
    const w = wordsOn(b);
    const q = ask(
      b,
      "q",
      ["Why is graphite smooth and slippery?", "ग्रेफ़ाइट चिकना और फिसलन भरा क्यों है?"],
      [
        "Its carbon atoms form flat layers that slide",
        "उसके कार्बन परमाणु सपाट परतें बनाते हैं जो फिसलती हैं",
      ],
      [
        [
          "It contains oil trapped between the carbons",
          "उसमें कार्बनों के बीच फँसा तेल है",
          "Graphite is pure carbon. The slipperiness comes from its layers.",
          "ग्रेफ़ाइट शुद्ध कार्बन है। फिसलन उसकी परतों से आती है।",
        ],
        [
          "Each carbon is bonded to four others in a 3-D net",
          "हर कार्बन त्रिविम जाल में चार अन्य से जुड़ा है",
          "That's diamond, and it makes diamond hard, not slippery.",
          "वह हीरा है, और वह हीरे को कठोर बनाता है, फिसलन भरा नहीं।",
        ],
      ],
      { passes: true },
    );
    return column([
      w.title(t("Why they are so different", "वे इतने अलग क्यों हैं")),
      w.definition(
        t(
          "**Diamond.** Each carbon atom is bonded to **four** other carbon atoms, making a rigid three-dimensional structure. That's why diamond is the **hardest substance known**.",
          "**हीरा।** हर कार्बन परमाणु **चार** अन्य कार्बन परमाणुओं से जुड़ा है, जिससे एक कठोर त्रि-आयामी संरचना बनती है। इसीलिए हीरा **सबसे कठोर ज्ञात पदार्थ** है।",
        ),
      ),
      w.definition(
        t(
          "**Graphite.** Each carbon atom is bonded to **three** others in the same plane, giving a **hexagonal array**. One of the bonds is a double bond, so each carbon's valency is still four. The hexagons form flat **layers**, placed one above the other: they slide easily, so graphite is **smooth and slippery**. Graphite is also a very good **conductor of electricity**, unlike most non-metals.",
          "**ग्रेफ़ाइट।** हर कार्बन परमाणु उसी तल में **तीन** अन्य से जुड़ा है, जिससे **षट्कोणीय** जाल बनता है। आबंधों में से एक द्विआबंध है, इसलिए हर कार्बन की संयोजकता फिर भी चार है। षट्कोण समतल **परतें** बनाते हैं, एक के ऊपर एक: वे आसानी से फिसलती हैं, इसलिए ग्रेफ़ाइट **चिकना और फिसलन भरा** है। ग्रेफ़ाइट विद्युत का बहुत अच्छा **चालक** भी है, जबकि अधिकांश अधातुएँ नहीं।",
        ),
      ),
      w.definition(
        t(
          "**Fullerenes.** Another class of allotropes. The first one found, **C-60**, has 60 carbon atoms arranged like a football. It looked like the geodesic domes of the American architect Buckminster Fuller, so it was named **fullerene**.",
          "**फ़ुलरीन।** अपररूपों का एक और वर्ग। सबसे पहले मिला **C-60** है, जिसमें 60 कार्बन परमाणु फ़ुटबॉल की तरह व्यवस्थित हैं। यह अमेरिकी वास्तुकार बकमिन्स्टर फ़ुलर के गुंबदों जैसा दिखता था, इसलिए इसका नाम **फ़ुलरीन** रखा गया।",
        ),
      ),
      w.body(
        t(
          "Same atoms, same chemistry: burn any of them in oxygen and you get only carbon dioxide. Different arrangements give different physical properties. Diamonds can also be **made**: pure carbon under very high pressure and temperature. Synthetic diamonds are small but hard to tell from natural ones.",
          "वही परमाणु, वही रसायन: इनमें से किसी को भी ऑक्सीजन में जलाओ तो केवल कार्बन डाइऑक्साइड मिलती है। अलग व्यवस्था से अलग भौतिक गुण मिलते हैं। हीरे **बनाए** भी जा सकते हैं: शुद्ध कार्बन को बहुत ऊँचे दाब और ताप पर रखकर। कृत्रिम हीरे छोटे होते हैं पर प्राकृतिक हीरों से अलग पहचानना कठिन है।",
        ),
      ),
      q,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Back to the nose-pin and the pencil. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const pin = sceneOn(b, "pin", CarbonScene.NosePinPencil, "the nose-pin and the pencil again");
    const q = ask(
      b,
      "q",
      [
        "Kabir says the pencil 'lead' must be the metal lead. Riya disagrees. Who's right?",
        "कबीर कहता है कि पेंसिल का 'लेड' धातु लेड होगा। रिया असहमत है। कौन सही है?",
      ],
      [
        "Riya: pencil 'lead' is graphite, a form of carbon",
        "रिया: पेंसिल का 'लेड' ग्रेफ़ाइट है, कार्बन का एक रूप",
      ],
      [
        [
          "Kabir: it's the metal lead",
          "कबीर: यह धातु लेड है",
          "Pencils have no lead metal at all. The grey marks are graphite layers rubbing off.",
          "पेंसिलों में लेड धातु बिल्कुल नहीं होती। धूसर निशान ग्रेफ़ाइट की परतें हैं जो घिसकर उतरती हैं।",
        ],
      ],
    );
    const q2 = ask(
      b,
      "q2",
      [
        "Which form of carbon would you use for an electrode that must carry current?",
        "धारा ले जाने वाले इलेक्ट्रोड के लिए कार्बन का कौन-सा रूप लोगे?",
      ],
      ["Graphite", "ग्रेफ़ाइट"],
      [
        [
          "Diamond",
          "हीरा",
          "Diamond doesn't conduct electricity: all four electrons of each carbon are in bonds.",
          "हीरा विद्युत का चालन नहीं करता: हर कार्बन के चारों इलेक्ट्रॉन आबंधों में हैं।",
        ],
      ],
      { isHidden: true },
    );
    const log = w.definition(
      t(
        "**Mission log.** ✓ Allotropes: diamond (4 bonds each, hardest), graphite (3 bonds each, layers, slippery, conducts), C-60. ✓ The pencil is graphite. Next: why carbon makes millions of compounds.",
        "**मिशन लॉग।** ✓ अपररूप: हीरा (हर एक के 4 आबंध, सबसे कठोर), ग्रेफ़ाइट (हर एक के 3 आबंध, परतें, फिसलन भरा, चालक), C-60। ✓ पेंसिल ग्रेफ़ाइट है। आगे: कार्बन लाखों यौगिक क्यों बनाता है।",
      ),
      "log",
      { isHidden: true },
    );
    oneByOne(b, [q, q2], [log]);
    return column([w.title(t("The pencil's secret", "पेंसिल का रहस्य")), pin, q, q2, log, space()]);
  },
  { passOn: PassOn.Rules },
);

/** Practice. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const q1 = ask(
      b,
      "q1",
      ["What are allotropes?", "अपररूप क्या हैं?"],
      [
        "Forms of one element with atoms arranged differently",
        "एक तत्व के रूप जिनमें परमाणु अलग ढंग से जमे हैं",
      ],
      [
        [
          "Different elements with the same properties",
          "एक जैसे गुणों वाले अलग-अलग तत्व",
          "Allotropes are all the same element.",
          "सभी अपररूप एक ही तत्व हैं।",
        ],
        [
          "Compounds of carbon with hydrogen and oxygen",
          "हाइड्रोजन और ऑक्सीजन के साथ कार्बन के यौगिक",
          "Those are hydrocarbons. Allotropes contain only one element.",
          "वे हाइड्रोकार्बन हैं। अपररूपों में केवल एक तत्व होता है।",
        ],
      ],
    );
    const q2 = ask(
      b,
      "q2",
      [
        "How many carbon atoms does a fullerene football like C-60 have?",
        "C-60 जैसी फ़ुलरीन फ़ुटबॉल में कितने कार्बन परमाणु हैं?",
      ],
      ["60", "60"],
      [
        [
          "6",
          "6",
          "6 is a hexagon's corners. The name C-60 gives the count.",
          "6 षट्कोण के कोने हैं। नाम C-60 संख्या बताता है।",
        ],
        ["4", "4", "4 is carbon's valency.", "4 कार्बन की संयोजकता है।"],
      ],
      { isHidden: true },
    );
    const q3 = ask(
      b,
      "q3",
      [
        "Diamond and graphite are burnt in oxygen. What do you get?",
        "हीरे और ग्रेफ़ाइट को ऑक्सीजन में जलाया जाता है। क्या मिलता है?",
      ],
      ["Carbon dioxide from both", "दोनों से कार्बन डाइऑक्साइड"],
      [
        [
          "Carbon dioxide from graphite only; diamond doesn't burn",
          "केवल ग्रेफ़ाइट से कार्बन डाइऑक्साइड; हीरा नहीं जलता",
          "Both are pure carbon, so both burn to carbon dioxide.",
          "दोनों शुद्ध कार्बन हैं, इसलिए दोनों जलकर कार्बन डाइऑक्साइड बनाते हैं।",
        ],
        [
          "Different gases, because they are different substances",
          "अलग गैसें, क्योंकि वे अलग पदार्थ हैं",
          "Their chemistry is the same; only the arrangement differs.",
          "उनका रसायन एक ही है; केवल व्यवस्था अलग है।",
        ],
      ],
      { isHidden: true },
    );
    oneByOne(b, [q1, q2, q3]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), q1, q2, q3, space()]);
  },
  { passOn: PassOn.Rules },
);

export const overview = [hook, forms, why, inLife, yourTurn];

import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { goalQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  ResScene,
  Scheme,
  WaterAction,
  WaterDerived,
  WaterMode,
  waterHarvestDef,
} from "@chalk/prop-resources";
import { ask, sceneOn } from "../kit";

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** The old well that dries up by March. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const well = sceneOn(
    b,
    "well",
    ResScene.DryWell,
    "the village's old stone well, its bucket hitting a dry bottom",
  );
  return column([
    w.title(t("The well that dries up", "सूखता कुआँ")),
    well,
    w.body(
      t(
        'Grandpa drops the bucket into the old well and it clunks on stone. "In my time this well never went dry," he says. "The monsoon here is just as heavy. Where does all that rain go?" Kabir looks at the bare slopes above the village, and the gully where the water rushes away in July.',
        'दादाजी पुराने कुएँ में बाल्टी डालते हैं और वह पत्थर से टकराती है। "मेरे ज़माने में यह कुआँ कभी नहीं सूखा," वे कहते हैं। "यहाँ मानसून उतना ही भारी है। वह सारी बारिश जाती कहाँ है?" कबीर गाँव के ऊपर की नंगी ढलानों को देखता है, और उस नाले को जहाँ जुलाई में पानी तेज़ी से बह जाता है।',
      ),
    ),
    w.body(
      t(
        "Stop 6: how do you catch the rain where it falls?",
        "पड़ाव 6: बारिश को वहीं कैसे पकड़ें जहाँ वह गिरती है?",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Watershed management. */
const watershed = page(
  "watershed",
  (b) => {
    const w = wordsOn(b);
    const q = ask(b, {
      name: "gain",
      prompt: t(
        "Which is a benefit of watershed management, according to NCERT?",
        "NCERT के अनुसार जलसंभर प्रबंधन का कौन-सा लाभ है?",
      ),
      right: t("It eases droughts and floods", "यह सूखे और बाढ़ को कम करता है"),
      wrong: [
        [
          t("It makes the monsoon start earlier", "यह मानसून को जल्दी शुरू करता है"),
          t(
            "It can't change the weather; it helps the land hold the rain that falls.",
            "यह मौसम नहीं बदल सकता; यह ज़मीन को गिरी बारिश थामने में मदद करता है।",
          ),
        ],
        [
          t("It replaces the need for any crops", "यह फ़सलों की ज़रूरत ही ख़त्म कर देता है"),
          t(
            "It increases biomass production, including crops; it doesn't replace them.",
            "यह फ़सलों समेत जैव-भार उत्पादन बढ़ाता है; उनकी जगह नहीं लेता।",
          ),
        ],
      ],
    });
    return column([
      w.title(t("Managing a watershed", "जलसंभर का प्रबंधन")),
      w.definition(
        t(
          "**Watershed management.** Scientific conservation of soil and water in an area so that it produces more biomass. Land and water are developed first, to produce plants and animals for use without upsetting the ecological balance.",
          "**जलसंभर प्रबंधन।** किसी क्षेत्र में मिट्टी और पानी का वैज्ञानिक संरक्षण, ताकि वह ज़्यादा जैव-भार पैदा करे। पहले ज़मीन और पानी विकसित किए जाते हैं, ताकि पारिस्थितिक संतुलन बिगाड़े बिना उपयोग के लिए पौधे और जंतु पैदा हों।",
        ),
      ),
      w.body(
        t(
          "It raises the production and income of the people of the watershed, eases droughts and floods, and lengthens the life of dams and reservoirs downstream. Many groups are reviving India's ancient water-harvesting systems as an alternative to mega-projects: small pits and lakes, small earthen dams, dykes, sand and limestone reservoirs, rooftop collectors. This has recharged groundwater and even brought rivers back to life.",
          "यह जलसंभर के लोगों का उत्पादन और आय बढ़ाता है, सूखे और बाढ़ को कम करता है, और नीचे के बाँधों और जलाशयों की उम्र बढ़ाता है। कई संगठन महा-परियोजनाओं के विकल्प के रूप में भारत की प्राचीन जल-संग्रहण प्रणालियों को फिर जीवित कर रहे हैं: छोटे गड्ढे और तालाब, छोटे मिट्टी के बाँध, तटबंध, रेत और चूना-पत्थर के जलाशय, छत पर पानी इकट्ठा करने की व्यवस्था। इससे भूजल फिर भरा है और नदियाँ तक फिर जी उठी हैं।",
        ),
      ),
      q,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** India's ancient water-harvesting systems. */
const systems = page(
  "systems",
  (b) => {
    const w = wordsOn(b);
    const q = ask(b, {
      name: "where",
      prompt: t(
        "Khadins, tanks and nadis are traditional water-harvesting systems of which state?",
        "खादिन, तालाब और नाड़ी किस राज्य की पारंपरिक जल-संग्रहण प्रणालियाँ हैं?",
      ),
      right: t("Rajasthan", "राजस्थान"),
      wrong: [
        [
          t("Kerala", "केरल"),
          t(
            "Kerala's system in NCERT's list is the surangam. Khadins, tanks and nadis are Rajasthan's.",
            "NCERT की सूची में केरल की प्रणाली सुरंगम है। खादिन, तालाब और नाड़ी राजस्थान के हैं।",
          ),
        ],
        [
          t("Bihar", "बिहार"),
          t(
            "Bihar has ahars and pynes. Khadins, tanks and nadis are Rajasthan's.",
            "बिहार में आहर और पाइन हैं। खादिन, तालाब और नाड़ी राजस्थान के हैं।",
          ),
        ],
      ],
    });
    return column([
      w.title(t("An age-old idea", "एक बहुत पुराना विचार")),
      w.definition(
        t(
          "**Water harvesting.** Catching and storing rainwater where it falls, so it can be used and can recharge the ground. It is an age-old idea in India.",
          "**जल संग्रहण।** बारिश के पानी को वहीं पकड़ना और जमा करना जहाँ वह गिरता है, ताकि वह इस्तेमाल हो सके और ज़मीन को फिर से भर सके। भारत में यह बहुत पुराना विचार है।",
        ),
      ),
      w.body(
        t(
          "Some systems still in use: khadins, tanks and nadis in **Rajasthan**; bandharas and tals in **Maharashtra**; bundhis in **Madhya Pradesh** and **Uttar Pradesh**; ahars and pynes in **Bihar**; kulhs in **Himachal Pradesh**; ponds in the Kandi belt of **Jammu**; eris (tanks) in **Tamil Nadu**; surangams in **Kerala**; kattas in **Karnataka**.",
          "कुछ प्रणालियाँ जो अब भी चलती हैं: **राजस्थान** में खादिन, तालाब और नाड़ी; **महाराष्ट्र** में बंधारा और ताल; **मध्य प्रदेश** और **उत्तर प्रदेश** में बुंधी; **बिहार** में आहर और पाइन; **हिमाचल प्रदेश** में कुल्ह; **जम्मू** के कांडी क्षेत्र में तालाब; **तमिलनाडु** में एरी (तालाब); **केरल** में सुरंगम; **कर्नाटक** में कट्टा।",
        ),
      ),
      w.body(
        t(
          "These techniques are very **local**: each suits its own place, and the benefits stay local too. Giving people control over their local water reduces mismanagement and over-use.",
          "ये तकनीकें बहुत **स्थानीय** हैं: हर एक अपनी जगह के हिसाब से है, और लाभ भी वहीं रहते हैं। लोगों को अपने स्थानीय पानी पर नियंत्रण देने से कुप्रबंधन और ज़रूरत से ज़्यादा उपयोग घटता है।",
        ),
      ),
      q,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** A khadin, stepped (Fig 16.4). */
const khadin = page(
  "khadin",
  (b) => {
    const w = wordsOn(b);
    const field = b.prop(waterHarvestDef, "field", {
      mode: WaterMode.Khadin,
      step: 0,
      canStep: true,
      canPick: false,
    });
    b.studentOnly(field.action(WaterAction.Next));
    b.studentOnly(field.action(WaterAction.Reset));
    b.standsFor(
      field,
      "a khadin: rain runs down a slope and collects behind an earthen embankment, soaks into the ground, fills the well, then a crop grows on the moist bed",
    );
    const goal = goalQuestion(b, {
      about: field,
      prompt: t(
        "Step the khadin through the season until the well is full and the crop grows.",
        "खादिन को मौसम भर आगे बढ़ाओ जब तक कुआँ भर न जाए और फ़सल न उगे।",
      ),
      isMet: field.derived(WaterDerived.IsDone),
      solve: [
        field.learner(WaterAction.Next),
        field.learner(WaterAction.Next),
        field.learner(WaterAction.Next),
      ],
    });
    return column([
      w.title(t("A khadin", "खादिन")),
      w.body(
        t(
          "On fairly level land the structures are mainly **crescent-shaped earthen embankments**, or low straight concrete-and-rubble **check dams** built across gullies that flood in the monsoon. Rain fills ponds behind them. Only the biggest hold water all year; most dry up within six months. That's fine, because their main job is **not** to hold water on the surface but to **recharge the groundwater** beneath.",
          "काफ़ी समतल ज़मीन पर ये ढाँचे ज़्यादातर **अर्धचंद्राकार मिट्टी के तटबंध** होते हैं, या मानसून में भरने वाले नालों के आर-पार बने नीचे, सीधे कंक्रीट-और-पत्थर के **रोक बाँध (चेक डैम)**। बारिश इनके पीछे तालाब भर देती है। केवल सबसे बड़े ही साल भर पानी रखते हैं; ज़्यादातर छह महीने में सूख जाते हैं। यह ठीक है, क्योंकि इनका मुख्य काम सतह पर पानी रखना **नहीं**, बल्कि नीचे के **भूजल को फिर भरना** है।",
        ),
      ),
      field,
      goal,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Why water stored in the ground is better. */
const ground = page(
  "ground",
  (b) => {
    const w = wordsOn(b);
    const table = b.prop(waterHarvestDef, "table", {
      mode: WaterMode.Compare,
      step: 0,
      choice: null,
      canStep: false,
      canPick: true,
    });
    b.studentOnly(table.action(WaterAction.Pick));
    b.standsFor(
      table,
      "a big dam and canal compared with local check dams, point by point; pick one to see its points",
    );
    const goal = goalQuestion(b, {
      about: table,
      prompt: t(
        "Now pick the check dams and compare their points with the big dam's.",
        "अब रोक बाँध चुनो और उनके बिंदुओं की बड़े बाँध से तुलना करो।",
      ),
      isMet: table.field("choice").eq(Scheme.CheckDam),
      solve: [table.learner(WaterAction.Pick, { scheme: Scheme.CheckDam })],
    });
    const q = ask(b, {
      name: "mosquito",
      prompt: t(
        "Why doesn't groundwater breed mosquitoes, unlike a pond?",
        "तालाब के उलट, भूजल में मच्छर क्यों नहीं पनपते?",
      ),
      right: t("It isn't open, stagnant water", "यह खुला, रुका हुआ पानी नहीं है"),
      wrong: [
        [
          t("It's always far too cold to drink", "यह पीने के लिए हमेशा बहुत ठंडा होता है"),
          t(
            "Mosquitoes breed in open stagnant water like ponds and lakes; groundwater isn't open.",
            "मच्छर तालाब-झील जैसे खुले रुके पानी में पनपते हैं; भूजल खुला नहीं होता।",
          ),
        ],
        [
          t("It is mixed with salt", "इसमें नमक मिला होता है"),
          t(
            "The reason is that it isn't open, stagnant water at the surface.",
            "कारण यह है कि यह सतह पर खुला, रुका हुआ पानी नहीं है।",
          ),
        ],
      ],
      isHidden: true,
    });
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(q));
    return column([
      w.title(t("Water kept underground", "ज़मीन के नीचे सहेजा पानी")),
      w.body(
        t(
          "Water stored in the ground has many advantages. It **doesn't evaporate**. It **spreads out** to recharge wells and keeps vegetation moist over a wide area. It gives **no breeding ground for mosquitoes**, unlike stagnant water in ponds or artificial lakes. And it is fairly **protected from contamination** by human and animal waste.",
          "ज़मीन में जमा पानी के कई फ़ायदे हैं। यह **भाप बनकर नहीं उड़ता**। यह **फैलकर** कुओं को फिर भरता है और बड़े इलाक़े में वनस्पति को नमी देता है। तालाबों या कृत्रिम झीलों के रुके पानी के उलट, यह **मच्छरों को पनपने की जगह नहीं देता**। और यह मनुष्यों और पशुओं के मल से होने वाले **प्रदूषण से काफ़ी बचा** रहता है।",
        ),
      ),
      table,
      goal,
      q,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Rajendra Singh, India's 'waterman'. */
const waterman = page(
  "waterman",
  (b) => {
    const w = wordsOn(b);
    const q = ask(b, {
      name: "johads",
      prompt: t(
        "About how many villages did Rajendra Singh's johads bring water back to?",
        "राजेंद्र सिंह के जोहड़ों से लगभग कितने गाँवों में पानी लौटा?",
      ),
      right: t("1,000 villages", "1,000 गाँव"),
      wrong: [
        [
          t("8,600 villages", "8,600 गाँव"),
          t(
            "8,600 is the number of johads and other structures built. Water came back to about 1,000 villages.",
            "8,600 बने जोहड़ों और दूसरे ढाँचों की संख्या है। पानी लगभग 1,000 गाँवों में लौटा।",
          ),
        ],
        [
          t("100 villages", "100 गाँव"),
          t(
            "It was far more: water was brought back to about 1,000 villages across Rajasthan.",
            "यह कहीं ज़्यादा था: राजस्थान भर में लगभग 1,000 गाँवों में पानी लौटा।",
          ),
        ],
      ],
    });
    return column([
      w.title(t("India's 'waterman'", "भारत के 'जलपुरुष'")),
      w.body(
        t(
          "A traditional technology is saving parched villages in one of India's driest regions. In two decades of work by **Dr Rajendra Singh**, **8,600 johads** (small earthen check dams that hold back rainwater so it soaks into the ground) and other water-collecting structures were built in Rajasthan, and water was brought back to about **1,000 villages**. In **2015** he won the **Stockholm Water Prize**, the most prestigious award for protecting water resources.",
          "एक पारंपरिक तकनीक भारत के सबसे सूखे इलाक़ों में से एक में प्यासे गाँवों को बचा रही है। **डॉ राजेंद्र सिंह** के दो दशकों के काम में राजस्थान में **8,600 जोहड़** (मिट्टी के छोटे रोक बाँध जो बारिश का पानी रोकते हैं ताकि वह ज़मीन में रिसे) और पानी इकट्ठा करने के दूसरे ढाँचे बने, और लगभग **1,000 गाँवों** में पानी लौट आया। **2015** में उन्हें जल संसाधनों की रक्षा का सबसे प्रतिष्ठित पुरस्कार, **स्टॉकहोम जल पुरस्कार**, मिला।",
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

/** A check dam for the dry well. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const dam = sceneOn(
      b,
      "dam",
      ResScene.CheckDam,
      "a low check dam across the gully above the village, with water held behind it",
    );
    const q = ask(b, {
      name: "where",
      prompt: t(
        "Where should the village build its check dam to fill the old well?",
        "पुराना कुआँ भरने के लिए गाँव अपना रोक बाँध कहाँ बनाए?",
      ),
      right: t(
        "Across the gully above the well, where rain runs off",
        "कुएँ के ऊपर उस नाले के आर-पार, जहाँ से बारिश बह जाती है",
      ),
      wrong: [
        [
          t(
            "Downstream of the village, after the water has gone by",
            "गाँव के नीचे, जहाँ से पानी गाँव से आगे निकल चुका हो",
          ),
          t(
            "Water held below the village can't soak back up into its well. Catch it above.",
            "गाँव के नीचे रुका पानी उसके कुएँ में वापस नहीं रिसेगा। ऊपर पकड़ो।",
          ),
        ],
        [
          t("On the big dam's canal, to make it run fuller", "बड़े बाँध की नहर पर, ताकि वह और भरी चले"),
          t(
            "The point is to catch the local rain where it falls and recharge the ground here.",
            "बात यह है कि स्थानीय बारिश वहीं पकड़ी जाए जहाँ गिरे और यहाँ की ज़मीन भरे।",
          ),
        ],
      ],
    });
    const row = w.body(
      t(
        "**Audit sheet, row 5: the well.** What's wrong: the bare slopes let July's rain rush away down the gully, so the ground never fills. What would fix it: a check dam across the gully above the village, built and looked after by the villagers, and trees back on the slope. The rain stays, soaks in, and the well rises.",
        "**ऑडिट शीट, पंक्ति 5: कुआँ।** क्या गड़बड़ है: नंगी ढलानों से जुलाई की बारिश नाले में बह जाती है, इसलिए ज़मीन कभी नहीं भरती। क्या ठीक करेगा: गाँव के ऊपर नाले के आर-पार एक रोक बाँध, जिसे गाँव वाले बनाएँ और सँभालें, और ढलान पर फिर से पेड़। बारिश रुकेगी, रिसेगी, और कुआँ ऊपर आएगा।",
      ),
      "row",
      { isHidden: true },
    );
    b.when(q.on(QuestionSignal.Correct), theBoard.show(row));
    return column([w.title(t("A dam for the well", "कुएँ के लिए बाँध")), dam, q, row, space()]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** In-text Q2–Q3 on water; the mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const hills = ask(b, {
      name: "hills",
      prompt: t(
        "In-text Q2: in a hilly area with streams, which system suits best?",
        "पाठ्य प्रश्न 2: नालों वाले पहाड़ी इलाक़े में कौन-सी प्रणाली सबसे ठीक है?",
      ),
      right: t(
        "Channels that lead stream water downhill, like kulhs",
        "नालियाँ जो नाले का पानी नीचे ले जाएँ, जैसे कुल्ह",
      ),
      wrong: [
        [
          t("Wide khadins on a flat desert plain", "समतल रेगिस्तानी मैदान पर चौड़े खादिन"),
          t(
            "Khadins suit fairly level land. Hills use their slope: channels like the kulhs.",
            "खादिन काफ़ी समतल ज़मीन के लिए हैं। पहाड़ अपनी ढलान का उपयोग करते हैं: कुल्ह जैसी नालियाँ।",
          ),
        ],
        [
          t(
            "A single huge dam far down in the plains, fed by canals",
            "मैदान में बहुत नीचे एक ही विशाल बाँध, नहरों के साथ",
          ),
          t(
            "Water harvesting is local and suits the place; hills divert streams into channels.",
            "जल संग्रहण स्थानीय और जगह के हिसाब से होता है; पहाड़ नालों को नालियों में मोड़ते हैं।",
          ),
        ],
      ],
      passes: false,
    });
    const log = w.definition(
      t(
        "**Audit log, stop 6.** ✓ Watershed management and water harvesting catch rain where it falls. ✓ Groundwater doesn't evaporate, spreads to wells, breeds no mosquitoes and stays cleaner. ✓ The well gets a check dam. ✗ One row left: the queue of scooters. Next: coal and petroleum.",
        "**ऑडिट लॉग, पड़ाव 6।** ✓ जलसंभर प्रबंधन और जल संग्रहण बारिश को वहीं पकड़ते हैं जहाँ वह गिरती है। ✓ भूजल भाप नहीं बनता, कुओं तक फैलता है, मच्छर नहीं पनपते और ज़्यादा साफ़ रहता है। ✓ कुएँ को रोक बाँध मिला। ✗ एक पंक्ति बाक़ी: स्कूटरों की क़तार। आगे: कोयला और पेट्रोलियम।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(hills.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), hills, log, space()]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [hook, watershed, systems, khadin, ground, waterman, inLife, yourTurn];

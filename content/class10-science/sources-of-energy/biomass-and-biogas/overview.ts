import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, goalQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  BiogasAction,
  BiogasDerived,
  EnergyScene,
  Fuel,
  FuelAction,
  Place,
  biogasPlantDef,
  fuelCompareDef,
} from "@chalk/prop-energy";
import { sceneOn } from "../kit";

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** The neighbour's cows and the dung-cake wall. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const pic = sceneOn(
    b,
    "pic",
    EnergyScene.CowShed,
    "a village cow shed with eight cows, and a wall covered in round dung cakes drying in the sun",
  );
  return column([
    w.title(t("Eight cows and a wall", "आठ गायें और एक दीवार")),
    pic,
    w.body(
      t(
        "Grandpa's neighbour, Shanti Aunty, has **eight cows**. Every morning she pats their dung into round cakes and slaps them onto her wall to dry. That is her cooking fuel, and it fills her kitchen with smoke. Kabir watches a fresh cake slide down the wall and asks the obvious question: isn't there a better way to get energy out of all that dung?",
        "दादाजी की पड़ोसन, शांति आंटी, के पास **आठ गायें** हैं। हर सुबह वे गोबर के गोल उपले थापकर सूखने के लिए दीवार पर चिपकाती हैं। यही उनका खाना पकाने का ईंधन है, और यह उनकी रसोई को धुएँ से भर देता है। कबीर एक ताज़ा उपला दीवार से फिसलते देखता है और साफ़ सवाल पूछता है: क्या इस सारे गोबर से ऊर्जा निकालने का कोई बेहतर तरीका नहीं है?",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Biomass: wood and dung cakes; low heat, lots of smoke. */
const biomass = page(
  "biomass",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      prompt: t("Which of these is NOT a biomass fuel?", "इनमें से कौन जैव मात्रा ईंधन नहीं है?"),
      options: [
        { id: "right", label: t("Coal", "कोयला") },
        {
          id: "wood",
          label: t("Firewood", "जलावन लकड़ी"),
          feedback: t(
            "Wood comes from plants, so it is biomass. Coal formed underground over millions of years: it is a fossil fuel.",
            "लकड़ी पौधों से आती है, इसलिए वह जैव मात्रा है। कोयला लाखों वर्षों में ज़मीन के नीचे बना: वह जीवाश्म ईंधन है।",
          ),
        },
        {
          id: "dung",
          label: t("Dung cakes", "उपले"),
          feedback: t(
            "Dung comes from animals, so it is biomass. Coal is a fossil fuel.",
            "गोबर जानवरों से आता है, इसलिए वह जैव मात्रा है। कोयला जीवाश्म ईंधन है।",
          ),
        },
        {
          id: "gobar",
          label: t("Gobar-gas", "गोबर गैस"),
          feedback: t(
            "Gobar-gas is made from dung, so its source is biomass. Coal is a fossil fuel.",
            "गोबर गैस गोबर से बनती है, इसलिए उसका स्रोत जैव मात्रा है। कोयला जीवाश्म ईंधन है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Fuel from living things", "जीवों से ईंधन")),
      w.definition(
        t(
          "**Biomass.** Fuels that are **plant and animal products**, like firewood, cow-dung cakes and crop waste, come from **biomass**. If enough trees are planted, firewood keeps coming; with India's large number of cattle, so does dung. But these fuels **give little heat and a lot of smoke** when burnt, so we need better ways to use them.",
          "**जैव मात्रा।** जो ईंधन **पौधों और जानवरों के उत्पाद** हैं, जैसे जलावन लकड़ी, उपले और फ़सल का कचरा, वे **जैव मात्रा** से आते हैं। अगर पर्याप्त पेड़ लगाए जाएँ, तो लकड़ी मिलती रहती है; भारत में पशुओं की बड़ी संख्या से गोबर भी। पर ये ईंधन जलने पर **कम ऊष्मा और बहुत धुआँ** देते हैं, इसलिए इन्हें बेहतर ढंग से उपयोग करने के तरीके चाहिए।",
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Charcoal: wood burnt with little oxygen. */
const charcoal = page(
  "charcoal",
  (b) => {
    const w = wordsOn(b);
    const chart = b.prop(fuelCompareDef, "chart", {
      fuels: [Fuel.CowDung, Fuel.Wood, Fuel.Charcoal, Fuel.Biogas],
      picked: Fuel.Wood,
      place: Place.Village,
      showChecks: true,
      showSmoke: true,
      canPick: true,
      canSetPlace: false,
    });
    b.studentOnly(chart.action(FuelAction.Pick));
    b.standsFor(
      chart,
      "the fuel chart with dung cakes, wood, charcoal and biogas; tapping each shows its heat per gram and smoke",
    );
    const ask = choiceQuestion(b, {
      prompt: t("How is charcoal made from wood?", "लकड़ी से काठ-कोयला कैसे बनता है?"),
      options: [
        {
          id: "right",
          label: t("By burning wood with little oxygen", "लकड़ी को कम ऑक्सीजन में जलाकर"),
        },
        {
          id: "water",
          label: t("By soaking wood in water for days", "लकड़ी को कई दिन पानी में भिगोकर"),
          feedback: t(
            "Charcoal is made by heating: burning wood in a limited supply of oxygen drives off the water and volatile parts.",
            "काठ-कोयला गर्म करके बनता है: लकड़ी को सीमित ऑक्सीजन में जलाने से पानी और वाष्पशील भाग निकल जाते हैं।",
          ),
        },
        {
          id: "air",
          label: t("By burning wood in plenty of air", "लकड़ी को भरपूर हवा में जलाकर"),
          feedback: t(
            "In plenty of air wood burns away to ash. With little oxygen, charcoal is left behind.",
            "भरपूर हवा में लकड़ी जलकर राख हो जाती है। कम ऑक्सीजन में काठ-कोयला बचता है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("A better way to burn wood", "लकड़ी जलाने का बेहतर तरीका")),
      w.definition(
        t(
          "**Charcoal.** When wood is burnt in a **limited supply of oxygen**, the water and volatile substances in it are driven off and **charcoal** is left behind. Charcoal **burns without flames**, is **almost smokeless**, and gives **more heat**.",
          "**काठ-कोयला।** जब लकड़ी को **सीमित ऑक्सीजन** में जलाया जाता है, तो उसका पानी और वाष्पशील पदार्थ निकल जाते हैं और **काठ-कोयला** बच जाता है। काठ-कोयला **बिना लौ के जलता** है, **लगभग धुआँरहित** है, और **अधिक ऊष्मा** देता है।",
        ),
      ),
      chart,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The biogas plant (Fig. 14.4). */
const plant = page(
  "plant",
  (b) => {
    const w = wordsOn(b);
    const gas = b.prop(biogasPlantDef, "gas", {
      step: 0,
      hasLeak: false,
      showNames: true,
      showGases: true,
      canStep: true,
      canLeak: false,
    });
    b.studentOnly(gas.action(BiogasAction.Next));
    b.studentOnly(gas.action(BiogasAction.Back));
    b.studentOnly(gas.action(BiogasAction.Reset));
    b.standsFor(
      gas,
      "a biogas plant: a mixing tank, a sealed brick digester with a dome-shaped gas tank above, a pipe to a stove and an outlet for spent slurry; next steps through how it works",
    );
    const goal = goalQuestion(b, {
      about: gas,
      prompt: t(
        "Step through the biogas plant until the spent slurry comes out.",
        "बायोगैस संयंत्र को तब तक आगे बढ़ाओ जब तक बचा घोल बाहर न आ जाए।",
      ),
      isMet: gas.derived(BiogasDerived.IsDone),
      solve: [
        gas.learner(BiogasAction.Next),
        gas.learner(BiogasAction.Next),
        gas.learner(BiogasAction.Next),
        gas.learner(BiogasAction.Next),
        gas.learner(BiogasAction.Next),
      ],
    });
    return column([
      w.title(t("The biogas plant", "बायोगैस संयंत्र")),
      w.body(
        t(
          "Cow dung, crop waste, vegetable waste and sewage can be broken down **without oxygen** to make a gas fuel. Since the starting material is mainly cow dung, it is called **gobar-gas**.",
          "गोबर, फ़सल का कचरा, सब्ज़ियों का कचरा और सीवेज **बिना ऑक्सीजन के** तोड़कर गैस ईंधन बनाया जा सकता है। चूँकि शुरुआती सामग्री मुख्यतः गोबर है, इसे **गोबर गैस** कहते हैं।",
        ),
      ),
      w.definition(
        t(
          "**Biogas plant.** A slurry of cow dung and water is made in the **mixing tank** and fed into the **digester**, a sealed brick chamber with **no oxygen**. There, **anaerobic micro-organisms** (ones that don't need oxygen) break down the slurry over a few days, giving **methane, carbon dioxide, hydrogen and hydrogen sulphide**. The gas collects in the **gas tank** above the digester and is piped away for use.",
          "**बायोगैस संयंत्र।** **मिश्रण टंकी** में गोबर और पानी का घोल बनाकर **पाचक** में डाला जाता है, जो **बिना ऑक्सीजन** का एक बंद ईंटों का कक्ष है। वहाँ **अवायवीय सूक्ष्मजीव** (जिन्हें ऑक्सीजन नहीं चाहिए) कुछ दिनों में घोल को तोड़कर **मीथेन, कार्बन डाइऑक्साइड, हाइड्रोजन और हाइड्रोजन सल्फ़ाइड** बनाते हैं। गैस पाचक के ऊपर **गैस टंकी** में जमा होती है और पाइप से उपयोग के लिए ले जाई जाती है।",
        ),
      ),
      gas,
      goal,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Why biogas is an excellent fuel, and why no air may get in. */
const excellent = page(
  "excellent",
  (b) => {
    const w = wordsOn(b);
    const gas = b.prop(biogasPlantDef, "gas", {
      step: 3,
      hasLeak: false,
      showNames: true,
      showGases: true,
      canStep: false,
      canLeak: true,
    });
    b.studentOnly(gas.action(BiogasAction.SetLeak));
    b.standsFor(gas, "the biogas plant making gas; the learner can let air leak into the digester");
    const ask = choiceQuestion(b, {
      prompt: t(
        "Let air leak into the digester. Why does the methane stop?",
        "पाचक में हवा जाने दो। मीथेन क्यों रुक जाती है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "The microbes that make it work only without oxygen",
            "उसे बनाने वाले सूक्ष्मजीव केवल बिना ऑक्सीजन काम करते हैं",
          ),
        },
        {
          id: "blow",
          label: t(
            "The air blows all the methane out through the pipe",
            "हवा सारी मीथेन को पाइप से बाहर उड़ा देती है",
          ),
          feedback: t(
            "It is about the microbes: they are anaerobic and stop working when oxygen gets in.",
            "बात सूक्ष्मजीवों की है: वे अवायवीय हैं और ऑक्सीजन आने पर काम करना बंद कर देते हैं।",
          ),
        },
        {
          id: "cold",
          label: t(
            "The air cools the slurry too much for any gas to form",
            "हवा घोल को इतना ठंडा कर देती है कि गैस बन ही न सके",
          ),
          feedback: t(
            "Temperature isn't the problem. The digester must be sealed because the microbes are anaerobic.",
            "तापमान समस्या नहीं है। पाचक बंद होना चाहिए क्योंकि सूक्ष्मजीव अवायवीय हैं।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Why biogas is so good", "बायोगैस इतनी अच्छी क्यों है")),
      w.definition(
        t(
          "**An excellent fuel.** Biogas contains **up to 75% methane**. It **burns without smoke**, leaves **no ash**, gives **a lot of heat**, and can also be used for **lighting**. The slurry left behind is an excellent **manure, rich in nitrogen and phosphorus**. Using bio-waste and sewage this way is also a **safe way of disposing of waste**.",
          "**एक उत्कृष्ट ईंधन।** बायोगैस में **75% तक मीथेन** होती है। यह **बिना धुएँ के जलती** है, **कोई राख नहीं** छोड़ती, **बहुत ऊष्मा** देती है, और **रोशनी** के लिए भी उपयोग हो सकती है। बचा घोल **नाइट्रोजन और फ़ॉस्फ़ोरस से भरपूर** उत्कृष्ट **खाद** है। जैव-कचरे और सीवेज को ऐसे उपयोग करना **कचरा निपटाने का सुरक्षित तरीका** भी है।",
        ),
      ),
      gas,
      ask,
      w.note(
        t(
          "Is biomass renewable? Yes, as long as we plant trees to replace those cut and the cattle keep producing dung.",
          "क्या जैव मात्रा नवीकरणीय है? हाँ, जब तक हम काटे गए पेड़ों की जगह नए लगाते हैं और पशु गोबर देते रहते हैं।",
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** Plan item 1: a gobar-gas plant for Shanti Aunty's kitchen. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const pic = sceneOn(
      b,
      "pic",
      EnergyScene.CowShed,
      "Shanti Aunty's cow shed and the dung-cake wall",
    );
    const ask = choiceQuestion(b, {
      prompt: t(
        'Shanti Aunty asks: "If I put my dung into a gas plant, what do I lose?" What should Riya say?',
        'शांति आंटी पूछती हैं: "अगर मैं अपना गोबर गैस संयंत्र में डालूँ, तो मुझे क्या खोना पड़ेगा?" रिया क्या कहे?',
      ),
      options: [
        {
          id: "right",
          label: t(
            "Nothing: you get smokeless gas and the slurry as manure",
            "कुछ नहीं: धुआँरहित गैस मिलेगी और घोल खाद बनेगा",
          ),
        },
        {
          id: "manure",
          label: t(
            "Your manure: the plant uses up all the dung completely",
            "आपकी खाद: संयंत्र सारा गोबर पूरी तरह ख़त्म कर देता है",
          ),
          feedback: t(
            "The spent slurry comes out as excellent manure, rich in nitrogen and phosphorus.",
            "बचा घोल नाइट्रोजन और फ़ॉस्फ़ोरस से भरपूर उत्कृष्ट खाद बनकर निकलता है।",
          ),
        },
        {
          id: "heat",
          label: t(
            "Heat: biogas cooks more slowly than your dung cakes",
            "ऊष्मा: बायोगैस आपके उपलों से धीमे पकाती है",
          ),
          feedback: t(
            "Biogas has a high heating capacity, much more than dung cakes, and without the smoke.",
            "बायोगैस की ऊष्मा क्षमता ऊँची है, उपलों से कहीं ज़्यादा, और बिना धुएँ के।",
          ),
        },
      ],
      answer: "right",
    });
    const note = w.body(
      t(
        "Eight cows give enough dung for a small family plant. Riya writes plan item 1: **a gobar-gas plant for Shanti Aunty, and others who keep cattle; charcoal or better chulhas for the rest.** Stop 4 done.",
        "आठ गायें एक छोटे पारिवारिक संयंत्र के लिए काफ़ी गोबर देती हैं। रिया योजना का पहला बिंदु लिखती है: **शांति आंटी और पशु रखने वाले दूसरों के लिए गोबर गैस संयंत्र; बाक़ी के लिए काठ-कोयला या बेहतर चूल्हे।** पड़ाव 4 पूरा।",
      ),
      "note",
      { isHidden: true },
    );
    b.when(ask.on(QuestionSignal.Correct), theBoard.show(note));
    return column([w.title(t("Plan item 1", "योजना का पहला बिंदु")), pic, ask, note, space()]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Exercise 2 and more, then the mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const q1 = choiceQuestion(b, {
      name: "q1",
      prompt: t(
        "Which of these is NOT an example of a biomass energy source?",
        "इनमें से कौन जैव मात्रा ऊर्जा स्रोत का उदाहरण नहीं है?",
      ),
      options: [
        { id: "right", label: t("Nuclear energy", "नाभिकीय ऊर्जा") },
        {
          id: "wood",
          label: t("Wood from trees", "पेड़ों की लकड़ी"),
          feedback: t(
            "Wood is a plant product, so it is biomass.",
            "लकड़ी पौधे का उत्पाद है, इसलिए जैव मात्रा है।",
          ),
        },
        {
          id: "gobar",
          label: t("Gobar-gas", "गोबर गैस"),
          feedback: t(
            "Gobar-gas is made from dung, so it is biomass.",
            "गोबर गैस गोबर से बनती है, इसलिए जैव मात्रा है।",
          ),
        },
        {
          id: "dung",
          label: t("Crop waste from fields", "फ़सल का कचरा"),
          feedback: t(
            "Crop waste from fields is a plant product, so it is biomass.",
            "फ़सल का कचरा पौधे का उत्पाद है, इसलिए जैव मात्रा है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const q2 = choiceQuestion(b, {
      name: "q2",
      prompt: t(
        "Which gas makes up most of biogas, giving it its heat?",
        "बायोगैस का ज़्यादातर भाग कौन-सी गैस है, जो उसे ऊष्मा देती है?",
      ),
      options: [
        { id: "right", label: t("Methane", "मीथेन") },
        {
          id: "co2",
          label: t("Carbon dioxide", "कार्बन डाइऑक्साइड"),
          feedback: t(
            "Carbon dioxide is in it, but doesn't burn. Biogas is up to 75% methane.",
            "कार्बन डाइऑक्साइड उसमें है, पर जलती नहीं। बायोगैस में 75% तक मीथेन होती है।",
          ),
        },
        {
          id: "h2s",
          label: t("Hydrogen sulphide", "हाइड्रोजन सल्फ़ाइड"),
          feedback: t(
            "There is only a little of it. Most of biogas is methane, up to 75%.",
            "वह थोड़ी ही होती है। बायोगैस का ज़्यादातर भाग मीथेन है, 75% तक।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const q3 = choiceQuestion(b, {
      name: "q3",
      prompt: t(
        "Comparing biomass and hydroelectricity, which is true?",
        "जैव मात्रा और जल विद्युत की तुलना करें, तो क्या सही है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Both are renewable; hydro burns nothing but drowns land",
            "दोनों नवीकरणीय हैं; जल विद्युत कुछ नहीं जलाती पर ज़मीन डुबोती है",
          ),
        },
        {
          id: "hydrono",
          label: t(
            "Only biomass is renewable; hydro will run out like coal",
            "केवल जैव मात्रा नवीकरणीय है; जल विद्युत कोयले की तरह ख़त्म होगी",
          ),
          feedback: t(
            "Rain refills reservoirs, so hydro is renewable too. Its cost is the land and ecosystems it drowns.",
            "बारिश जलाशय भरती है, इसलिए जल विद्युत भी नवीकरणीय है। उसकी क़ीमत वह ज़मीन और पारितंत्र हैं जो वह डुबोती है।",
          ),
        },
        {
          id: "smoke",
          label: t(
            "Both are smokeless, and neither changes the environment",
            "दोनों धुआँरहित हैं, और कोई भी पर्यावरण नहीं बदलता",
          ),
          feedback: t(
            "Burning wood and dung gives lots of smoke, and dams drown land. Both change the environment.",
            "लकड़ी और उपले जलाने से बहुत धुआँ होता है, और बाँध ज़मीन डुबोते हैं। दोनों पर्यावरण बदलते हैं।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    b.when(q1.on(QuestionSignal.Correct), theBoard.show(q2));
    b.when(q2.on(QuestionSignal.Correct), theBoard.show(q3));
    const log = w.definition(
      t(
        "**Mission log.** ✓ Biomass (wood, dung, crop waste) is renewable if replaced, but burns with little heat and much smoke. ✓ Charcoal: wood burnt with little oxygen; hotter and almost smokeless. ✓ Biogas: dung slurry digested without oxygen by microbes; up to 75% methane, smokeless, no ash, and manure left over. Plan item 1 is written. Next stop: the windy ridge.",
        "**मिशन लॉग।** ✓ जैव मात्रा (लकड़ी, गोबर, फ़सल का कचरा) फिर उगाई जाए तो नवीकरणीय है, पर कम ऊष्मा और बहुत धुएँ से जलती है। ✓ काठ-कोयला: कम ऑक्सीजन में जली लकड़ी; ज़्यादा गर्म और लगभग धुआँरहित। ✓ बायोगैस: बिना ऑक्सीजन के सूक्ष्मजीवों द्वारा पचाया गोबर का घोल; 75% तक मीथेन, धुआँरहित, राख नहीं, और खाद बचती है। योजना का पहला बिंदु लिखा गया। अगला पड़ाव: हवादार चोटी।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(q3.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), q1, q2, q3, log, space()]);
  },
  { passOn: PassOn.Rules },
);

export const overview = [hook, biomass, charcoal, plant, excellent, inLife, yourTurn];

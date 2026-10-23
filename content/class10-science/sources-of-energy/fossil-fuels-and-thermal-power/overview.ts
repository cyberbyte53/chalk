import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, goalQuestion, wordsOn } from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  EnergyScene,
  PlantAction,
  PlantDerived,
  PlantKind,
  powerPlantDef,
} from "@chalk/prop-energy";
import { sceneOn } from "../kit";

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** The high-tension line on the hill: where is the electricity made? */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const pic = sceneOn(
    b,
    "pic",
    EnergyScene.PowerLine,
    "Riya and Kabir on a hillside looking at tall pylons carrying a high-tension line away into the distance",
  );
  return column([
    w.title(t("Where the wires go", "तार कहाँ जाते हैं")),
    pic,
    w.body(
      t(
        'On a walk, Kabir follows the tall pylons along the hill with his eyes. "These wires bring the village its four hours of electricity," says Grandpa. "From a power station far, far away." Kabir wants to know what happens at the other end: how is the electricity actually made, and why so far away?',
        'सैर पर कबीर पहाड़ी पर लगे ऊँचे खंभों को आँखों से दूर तक देखता है। "यही तार गाँव में चार घंटे बिजली लाते हैं," दादाजी कहते हैं। "बहुत दूर के एक बिजलीघर से।" कबीर जानना चाहता है कि दूसरे सिरे पर क्या होता है: बिजली असल में बनती कैसे है, और इतनी दूर क्यों?',
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Fossil fuels: formed over millions of years, limited, non-renewable. */
const fossil = page(
  "fossil",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      prompt: t(
        "Why are coal and petroleum called non-renewable?",
        "कोयले और पेट्रोलियम को अनवीकरणीय क्यों कहते हैं?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "They took millions of years to form, so used reserves aren't replaced",
            "उन्हें बनने में लाखों वर्ष लगे, इसलिए ख़र्च भंडार फिर नहीं भरते",
          ),
        },
        {
          id: "burn",
          label: t(
            "They can be burnt only once, so the ash can't be burnt a second time",
            "वे केवल एक बार जलाए जा सकते हैं, इसलिए राख दोबारा नहीं जल सकती",
          ),
          feedback: t(
            "Every fuel burns only once. Coal and petroleum are non-renewable because new reserves take millions of years to form.",
            "हर ईंधन एक ही बार जलता है। कोयला और पेट्रोलियम इसलिए अनवीकरणीय हैं क्योंकि नए भंडार बनने में लाखों वर्ष लगते हैं।",
          ),
        },
        {
          id: "costly",
          label: t(
            "They cost a lot of money, so poorer countries can't renew their stock",
            "वे बहुत महँगे हैं, इसलिए ग़रीब देश अपना भंडार फिर नहीं भर सकते",
          ),
          feedback: t(
            "Cost isn't what the word means. Non-renewable means nature can't replace them in our lifetimes.",
            "इस शब्द का अर्थ क़ीमत नहीं है। अनवीकरणीय का अर्थ है कि प्रकृति उन्हें हमारे जीवनकाल में फिर नहीं बना सकती।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Fossil fuels", "जीवाश्म ईंधन")),
      w.body(
        t(
          "In ancient times wood was the most common source of heat, and flowing water and wind did a little work. Then coal made the industrial revolution possible, and the world's demand for energy grew enormously.",
          "प्राचीन समय में लकड़ी ऊष्मा का सबसे आम स्रोत थी, और बहता पानी और पवन थोड़ा काम करते थे। फिर कोयले ने औद्योगिक क्रांति संभव की, और दुनिया की ऊर्जा की माँग बहुत बढ़ गई।",
        ),
      ),
      w.definition(
        t(
          "**Fossil fuels.** **Coal and petroleum** formed from the remains of living things buried **millions of years ago**. There are only **limited reserves** of them. Sources that will one day run out like this are **non-renewable**, so we need to conserve them. Yet most of India's energy still comes from fossil fuels.",
          "**जीवाश्म ईंधन।** **कोयला और पेट्रोलियम** **लाखों वर्ष पहले** दबे जीवों के अवशेषों से बने। उनके केवल **सीमित भंडार** हैं। जो स्रोत ऐसे एक दिन ख़त्म हो जाएँगे, वे **अनवीकरणीय** हैं, इसलिए हमें उन्हें बचाना चाहिए। फिर भी भारत की ज़्यादातर ऊर्जा अब भी जीवाश्म ईंधनों से आती है।",
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Pollution from burning fossil fuels, and how to reduce it. */
const pollution = page(
  "pollution",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      prompt: t(
        "Burning coal releases oxides of carbon, nitrogen and sulphur. What do these oxides cause?",
        "कोयला जलने पर कार्बन, नाइट्रोजन और सल्फ़र के ऑक्साइड निकलते हैं। ये ऑक्साइड क्या करते हैं?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Acid rain, which harms our water and soil",
            "अम्लीय वर्षा, जो पानी और मिट्टी को नुक़सान पहुँचाती है",
          ),
        },
        {
          id: "ozone",
          label: t(
            "More ozone, which protects us from UV rays",
            "ज़्यादा ओज़ोन, जो हमें UV किरणों से बचाती है",
          ),
          feedback: t(
            "These oxides are acidic: they dissolve in rain and make it acidic.",
            "ये ऑक्साइड अम्लीय हैं: वे वर्षा में घुलकर उसे अम्लीय बना देते हैं।",
          ),
        },
        {
          id: "fog",
          label: t(
            "Morning fog, which is just harmless water",
            "सुबह का कोहरा, जो बस हानिरहित पानी है",
          ),
          feedback: t(
            "Fog is water droplets. Acidic oxides make rain acidic, which damages water and soil.",
            "कोहरा पानी की बूँदें है। अम्लीय ऑक्साइड वर्षा को अम्लीय बनाते हैं, जो पानी और मिट्टी को नुक़सान पहुँचाती है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("The price of burning", "जलाने की क़ीमत")),
      w.definition(
        t(
          "**Pollution from fossil fuels.** The **oxides of carbon, nitrogen and sulphur** given off on burning are **acidic oxides**. They cause **acid rain**, which affects our water and soil. Carbon dioxide also adds to the **greenhouse effect**: gases like carbon dioxide and methane let sunlight through to the ground but trap the heat the Earth gives off, the way the glass of a greenhouse does. More of these gases means a warmer Earth.",
          "**जीवाश्म ईंधनों से प्रदूषण।** जलने पर निकलने वाले **कार्बन, नाइट्रोजन और सल्फ़र के ऑक्साइड** **अम्लीय ऑक्साइड** हैं। ये **अम्लीय वर्षा** करते हैं, जो हमारे पानी और मिट्टी को प्रभावित करती है। कार्बन डाइऑक्साइड **ग्रीनहाउस प्रभाव** भी बढ़ाती है: कार्बन डाइऑक्साइड और मीथेन जैसी गैसें धूप को ज़मीन तक आने देती हैं, पर पृथ्वी से निकलती ऊष्मा को रोक लेती हैं, जैसे ग्रीनहाउस का काँच करता है। ये गैसें जितनी ज़्यादा, पृथ्वी उतनी गर्म।",
        ),
      ),
      w.body(
        t(
          "This pollution can be reduced somewhat by **burning the fuel more efficiently** and by using techniques that **stop harmful gases and ash escaping** into the air.",
          "यह प्रदूषण कुछ हद तक **ईंधन को अधिक दक्षता से जलाकर** और ऐसी तकनीकों से कम किया जा सकता है जो **हानिकारक गैसों और राख को हवा में निकलने से रोकें**।",
        ),
      ),
      w.note(
        t(
          "Think it over: how would our lives change if we could no longer get electricity? How much electricity each person gets is one measure of how a country is growing.",
          "सोचो: अगर हमें बिजली मिलना बंद हो जाए तो हमारा जीवन कैसे बदलेगा? हर व्यक्ति को कितनी बिजली मिलती है, यह किसी देश की प्रगति का एक पैमाना है।",
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The turbine: Activity 14.3's model. */
const turbine = page(
  "turbine",
  (b) => {
    const w = wordsOn(b);
    const model = b.prop(powerPlantDef, "model", {
      kind: PlantKind.Model,
      step: 0,
      isOn: false,
      level: 3,
      showChain: true,
      canStep: true,
      canSwitch: true,
      canSetLevel: false,
    });
    b.studentOnly(model.action(PlantAction.Next));
    b.studentOnly(model.action(PlantAction.Switch));
    b.studentOnly(model.action(PlantAction.Reset));
    b.standsFor(
      model,
      "Activity 14.3's model: a pressure cooker's steam jet spins a table-tennis ball with fins, turning a cycle dynamo that lights a bulb; next steps through the energy chain",
    );
    const goal = goalQuestion(b, {
      about: model,
      prompt: t(
        "Step through the model's energy chain to the end.",
        "मॉडल की ऊर्जा शृंखला को अंत तक आगे बढ़ाओ।",
      ),
      isMet: model.derived(PlantDerived.IsDone),
      solve: [
        model.learner(PlantAction.Next),
        model.learner(PlantAction.Next),
        model.learner(PlantAction.Next),
        model.learner(PlantAction.Next),
        model.learner(PlantAction.Next),
      ],
    });
    return column([
      w.title(t("A power station on a table", "मेज़ पर एक बिजलीघर")),
      w.body(
        t(
          "Activity 14.3. Cut three slits in a table-tennis ball and fix curved metal fins in them. Put the ball on an axle so it spins freely, connect a cycle dynamo to it, and a bulb to the dynamo. Now aim a jet of steam from a pressure cooker at the fins.",
          "क्रियाकलाप 14.3। टेबल-टेनिस की गेंद में तीन चीरे लगाओ और उनमें धातु के मुड़े पंख लगाओ। गेंद को एक धुरी पर लगाओ ताकि वह आसानी से घूमे, उससे साइकिल का डायनेमो और डायनेमो से एक बल्ब जोड़ो। अब प्रेशर कुकर की भाप की धार पंखों पर डालो।",
        ),
      ),
      model,
      goal,
      w.definition(
        t(
          "**Turbine.** The spinning ball with fins is a simple **turbine**: a **rotor with blades** that a moving fluid (steam, water or air) pushes round. The turning shaft drives a **generator** (here the dynamo), which changes **mechanical energy into electrical energy**. Every power station in this chapter is a different way of **spinning a turbine**.",
          "**टरबाइन।** पंखों वाली घूमती गेंद एक सरल **टरबाइन** है: **पंखुड़ियों वाला एक घूर्णक** जिसे कोई गतिशील तरल (भाप, पानी या हवा) धकेलकर घुमाता है। घूमती धुरी एक **जनित्र** (यहाँ डायनेमो) चलाती है, जो **यांत्रिक ऊर्जा को विद्युत ऊर्जा में** बदलता है। इस अध्याय का हर बिजलीघर **टरबाइन घुमाने** का एक अलग तरीका है।",
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The thermal power plant (14.2.2). */
const thermal = page(
  "thermal",
  (b) => {
    const w = wordsOn(b);
    const plant = b.prop(powerPlantDef, "plant", {
      kind: PlantKind.Thermal,
      step: 0,
      isOn: false,
      level: 3,
      showChain: true,
      canStep: true,
      canSwitch: true,
      canSetLevel: false,
    });
    b.studentOnly(plant.action(PlantAction.Next));
    b.studentOnly(plant.action(PlantAction.Switch));
    b.studentOnly(plant.action(PlantAction.Reset));
    b.standsFor(
      plant,
      "a thermal power plant: coal burns in a furnace, the heat boils water to steam, the steam spins a turbine that turns a generator; next steps through the chain",
    );
    const ask = choiceQuestion(b, {
      prompt: t(
        "Why are many thermal power plants built near coal or oil fields?",
        "कई तापीय विद्युत संयंत्र कोयला या तेल क्षेत्रों के पास क्यों बनाए जाते हैं?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Sending electricity by wire is more efficient than carrying the fuel",
            "तार से बिजली भेजना ईंधन ढोने से अधिक दक्ष है",
          ),
        },
        {
          id: "cool",
          label: t(
            "The ground near a coal field keeps the boilers from getting too hot",
            "कोयला क्षेत्र के पास की ज़मीन बॉयलरों को ज़्यादा गर्म होने से बचाती है",
          ),
          feedback: t(
            "The reason is transport: moving electricity along wires is more efficient than moving coal or oil the same distance.",
            "कारण परिवहन है: उतनी ही दूरी तक बिजली तारों से भेजना कोयला या तेल ढोने से अधिक दक्ष है।",
          ),
        },
        {
          id: "law",
          label: t(
            "Electricity can only be made in the same place the fuel came from",
            "बिजली केवल उसी जगह बन सकती है जहाँ से ईंधन आया",
          ),
          feedback: t(
            "Fuel can be carried anywhere, at a cost. It is cheaper to carry the electricity instead.",
            "ईंधन कहीं भी ले जाया जा सकता है, ख़र्च पर। बिजली ले जाना सस्ता पड़ता है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("The thermal power plant", "तापीय विद्युत संयंत्र")),
      w.definition(
        t(
          "**Thermal power plant.** In a power station, large amounts of fossil fuel are burnt every day to **heat water and make steam**. The steam **runs a turbine**, which turns a **generator**. It is called *thermal* because the fuel is burnt to make **heat**, which is then turned into electrical energy.",
          "**तापीय विद्युत संयंत्र।** बिजलीघर में रोज़ भारी मात्रा में जीवाश्म ईंधन जलाकर **पानी गर्म करके भाप बनाई जाती है**। भाप **टरबाइन चलाती है**, जो **जनित्र** घुमाता है। इसे *तापीय* इसलिए कहते हैं क्योंकि ईंधन जलाकर **ऊष्मा** बनाई जाती है, जिसे फिर विद्युत ऊर्जा में बदला जाता है।",
        ),
      ),
      plant,
      w.body(
        t(
          "Follow the chain: chemical energy in coal → heat in the furnace → steam → spinning turbine → electrical energy.",
          "शृंखला देखो: कोयले में रासायनिक ऊर्जा → भट्टी में ऊष्मा → भाप → घूमता टरबाइन → विद्युत ऊर्जा।",
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

/** The village's line comes from a coal plant far away. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const pic = sceneOn(
      b,
      "pic",
      EnergyScene.PowerLine,
      "the pylons on the hill again, carrying the line away towards the plains",
    );
    const ask = choiceQuestion(b, {
      prompt: t(
        'Kabir suggests: "Let\'s build a small coal power station right here in the village." What is the strongest reason against it?',
        'कबीर सुझाता है: "चलो गाँव में ही एक छोटा कोयला बिजलीघर बनाते हैं।" इसके ख़िलाफ़ सबसे मज़बूत कारण क्या है?',
      ),
      options: [
        {
          id: "right",
          label: t(
            "Coal must be hauled up the hills, it pollutes, and it will run out",
            "कोयला पहाड़ों पर ढोना पड़ेगा, वह प्रदूषण करता है, और ख़त्म हो जाएगा",
          ),
        },
        {
          id: "noturbine",
          label: t(
            "A turbine can't spin at this height above sea level",
            "इतनी ऊँचाई पर टरबाइन घूम ही नहीं सकता",
          ),
          feedback: t(
            "Turbines work at any height. The problems are carrying coal so far, the pollution, and limited reserves.",
            "टरबाइन किसी भी ऊँचाई पर चलते हैं। दिक़्क़तें हैं कोयला इतनी दूर ढोना, प्रदूषण, और सीमित भंडार।",
          ),
        },
        {
          id: "nowater",
          label: t(
            "A coal station makes too little electricity for a whole village",
            "कोयला बिजलीघर पूरे गाँव के लिए बहुत कम बिजली बनाता है",
          ),
          feedback: t(
            "Coal stations can be very large. Here the trouble is hauling coal up the hills, the smoke, and that coal will run out.",
            "कोयला बिजलीघर बहुत बड़े हो सकते हैं। यहाँ दिक़्क़त है कोयला पहाड़ों पर ढोना, धुआँ, और कि कोयला ख़त्म हो जाएगा।",
          ),
        },
      ],
      answer: "right",
    });
    const note = w.body(
      t(
        'That is exactly why the station is far away, next to the coal, and the electricity travels up the hill by wire. Riya crosses "more coal" off the list: the village needs sources it can find **nearby**. Stop 2 done.',
        'ठीक इसीलिए बिजलीघर दूर, कोयले के पास है, और बिजली तार से पहाड़ी पर चढ़ती है। रिया सूची से "और कोयला" काट देती है: गाँव को ऐसे स्रोत चाहिए जो उसे **पास में** मिल सकें। पड़ाव 2 पूरा।',
      ),
      "note",
      { isHidden: true },
    );
    b.when(ask.on(QuestionSignal.Correct), theBoard.show(note));
    return column([
      w.title(t("Coal for the village?", "गाँव के लिए कोयला?")),
      pic,
      ask,
      note,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** In-text Q1–2 and Exercise 4, then the mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const q1 = choiceQuestion(b, {
      name: "q1",
      prompt: t(
        "Why are we looking for alternate sources of energy?",
        "हम ऊर्जा के वैकल्पिक स्रोत क्यों खोज रहे हैं?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Fossil fuels are limited and pollute, and demand keeps growing",
            "जीवाश्म ईंधन सीमित हैं और प्रदूषण करते हैं, और माँग बढ़ती जा रही है",
          ),
        },
        {
          id: "weak",
          label: t(
            "Fossil fuels give too little heat to run modern power stations",
            "जीवाश्म ईंधन आधुनिक बिजलीघर चलाने के लिए बहुत कम ऊष्मा देते हैं",
          ),
          feedback: t(
            "Coal and petroleum give plenty of heat. The trouble is that they are limited and polluting while demand grows.",
            "कोयला और पेट्रोलियम काफ़ी ऊष्मा देते हैं। दिक़्क़त यह है कि वे सीमित और प्रदूषक हैं जबकि माँग बढ़ रही है।",
          ),
        },
        {
          id: "law",
          label: t(
            "Fossil fuels have been banned for use in power stations",
            "बिजलीघरों में जीवाश्म ईंधनों पर प्रतिबंध लग गया है",
          ),
          feedback: t(
            "They are still the main fuel for electricity. We look elsewhere because they are limited and polluting.",
            "वे अब भी बिजली का मुख्य ईंधन हैं। हम इसलिए दूसरे स्रोत खोजते हैं क्योंकि वे सीमित और प्रदूषक हैं।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const q2 = choiceQuestion(b, {
      name: "q2",
      prompt: t(
        "Comparing fossil fuels and the Sun as direct sources of energy, which is true?",
        "जीवाश्म ईंधनों और सूर्य को ऊर्जा के प्रत्यक्ष स्रोत के रूप में तुलना करें, तो क्या सही है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Fossil fuels store easily but are limited; sunlight lasts but varies",
            "जीवाश्म ईंधन आसानी से रखे जाते पर सीमित हैं; सूर्य ख़त्म नहीं होगा पर बदलता रहता है",
          ),
        },
        {
          id: "sun",
          label: t(
            "Both are easy to store, but only the Sun will one day run out on us",
            "दोनों आसानी से रखे जाते हैं, पर केवल सूर्य एक दिन हमारे लिए ख़त्म होगा",
          ),
          feedback: t(
            "It's the other way round: fossil fuels are limited, while the Sun will last billions of years. Sunlight can't be stored directly.",
            "बात उल्टी है: जीवाश्म ईंधन सीमित हैं, जबकि सूर्य अरबों वर्ष चलेगा। धूप को सीधे संचित नहीं किया जा सकता।",
          ),
        },
        {
          id: "clean",
          label: t(
            "Both are clean and unlimited, so it makes no real difference which we use",
            "दोनों साफ़ और असीमित हैं, इसलिए कोई फ़र्क़ नहीं पड़ता कि किसका उपयोग करें",
          ),
          feedback: t(
            "Fossil fuels pollute and will run out. The Sun is clean and lasting, but not available at night or on cloudy days.",
            "जीवाश्म ईंधन प्रदूषण करते हैं और ख़त्म होंगे। सूर्य साफ़ और टिकाऊ है, पर रात या बादल वाले दिन उपलब्ध नहीं।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    b.when(q1.on(QuestionSignal.Correct), theBoard.show(q2));
    const log = w.definition(
      t(
        "**Mission log.** ✓ Fossil fuels formed over millions of years; they are limited and non-renewable. ✓ Burning them gives acidic oxides (acid rain) and CO₂ (greenhouse effect). ✓ Every power station spins a turbine that turns a generator; a thermal plant does it with steam from burning fuel, near the coal fields. ✗ More coal is not the answer up here. Next stop: the river and the dam.",
        "**मिशन लॉग।** ✓ जीवाश्म ईंधन लाखों वर्षों में बने; वे सीमित और अनवीकरणीय हैं। ✓ उन्हें जलाने से अम्लीय ऑक्साइड (अम्लीय वर्षा) और CO₂ (ग्रीनहाउस प्रभाव) बनते हैं। ✓ हर बिजलीघर एक टरबाइन घुमाता है जो जनित्र चलाता है; तापीय संयंत्र यह जलते ईंधन की भाप से करता है, कोयला क्षेत्रों के पास। ✗ यहाँ ऊपर और कोयला हल नहीं है। अगला पड़ाव: नदी और बाँध।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(q2.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), q1, q2, log, space()]);
  },
  { passOn: PassOn.Rules },
);

export const overview = [hook, fossil, pollution, turbine, thermal, inLife, yourTurn];

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

/** The dam upstream, and a temple top in the water. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const pic = sceneOn(
    b,
    "pic",
    EnergyScene.DamTrip,
    "a tall dam across a river valley, a wide reservoir behind it, and the top of an old temple sticking out of the water",
  );
  return column([
    w.title(t("The temple in the lake", "झील में मंदिर")),
    pic,
    w.body(
      t(
        'Grandpa takes everyone upstream to see the big dam. Behind it lies a huge, still lake. Out in the water, Kabir spots something strange: the **pointed top of a temple** sticking up above the surface. "That was my uncle\'s village," Grandpa says quietly. "The water came up and covered it." Why build a wall that drowns a village, and how does a lake make electricity?',
        'दादाजी सबको ऊपर की ओर बड़ा बाँध दिखाने ले जाते हैं। उसके पीछे एक विशाल, शांत झील है। पानी में कबीर को कुछ अजीब दिखता है: सतह से ऊपर निकला **एक मंदिर का नुकीला शिखर**। "वह मेरे चाचा का गाँव था," दादाजी धीरे से कहते हैं। "पानी ऊपर आया और उसे ढक गया।" ऐसी दीवार क्यों बनाई जाए जो गाँव डुबो दे, और झील बिजली कैसे बनाती है?',
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** How a hydro power plant works (Fig. 14.3). */
const how = page(
  "how",
  (b) => {
    const w = wordsOn(b);
    const plant = b.prop(powerPlantDef, "plant", {
      kind: PlantKind.Hydro,
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
      "a hydro power plant: a river held back by a dam, water falling through pipes to a turbine at the dam's foot that turns a generator; next steps through the chain",
    );
    const goal = goalQuestion(b, {
      about: plant,
      prompt: t(
        "Step through the hydro plant's energy chain to the end.",
        "जल विद्युत संयंत्र की ऊर्जा शृंखला को अंत तक आगे बढ़ाओ।",
      ),
      isMet: plant.derived(PlantDerived.IsDone),
      solve: [
        plant.learner(PlantAction.Next),
        plant.learner(PlantAction.Next),
        plant.learner(PlantAction.Next),
        plant.learner(PlantAction.Next),
        plant.learner(PlantAction.Next),
      ],
    });
    return column([
      w.title(t("Electricity from falling water", "गिरते पानी से बिजली")),
      w.body(
        t(
          "Flowing water has **kinetic energy**, and water held high up has **potential energy**. Waterfalls that could be used are very few, so hydro power plants are built with **dams**.",
          "बहते पानी में **गतिज ऊर्जा** होती है, और ऊँचाई पर रोके गए पानी में **स्थितिज ऊर्जा**। उपयोग लायक़ जलप्रपात बहुत कम हैं, इसलिए जल विद्युत संयंत्र **बाँधों** के साथ बनाए जाते हैं।",
        ),
      ),
      w.definition(
        t(
          "**Hydro power plant.** A high dam is built across a river to **stop its flow and collect water in a large reservoir**. As the water level rises, the **kinetic energy of the flowing water becomes potential energy**. Water from high up in the dam is carried down **through pipes to a turbine at the bottom of the dam**, which turns a generator.",
          "**जल विद्युत संयंत्र।** नदी पर ऊँचा बाँध बनाकर **उसका बहाव रोका जाता है और पानी एक बड़े जलाशय में इकट्ठा किया जाता है**। जलस्तर बढ़ने पर **बहते पानी की गतिज ऊर्जा स्थितिज ऊर्जा बन जाती है**। बाँध में ऊपर का पानी **पाइपों से नीचे बाँध की तली पर लगे टरबाइन तक** ले जाया जाता है, जो जनित्र घुमाता है।",
        ),
      ),
      plant,
      goal,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Higher water, more output; renewable because rain refills it. */
const level = page(
  "level",
  (b) => {
    const w = wordsOn(b);
    const plant = b.prop(powerPlantDef, "plant", {
      kind: PlantKind.Hydro,
      step: 5,
      isOn: true,
      level: 1,
      showChain: false,
      canStep: false,
      canSwitch: false,
      canSetLevel: true,
    });
    b.studentOnly(plant.action(PlantAction.SetLevel));
    b.standsFor(
      plant,
      "the hydro plant running; the learner sets how high the water stands behind the dam and the output changes",
    );
    const goal = goalQuestion(b, {
      about: plant,
      prompt: t(
        "Raise the water behind the dam until the plant gives its full output.",
        "बाँध के पीछे पानी तब तक बढ़ाओ जब तक संयंत्र पूरा उत्पादन न दे।",
      ),
      isMet: plant.derived(PlantDerived.Output).eq(1),
      solve: [plant.learner(PlantAction.SetLevel, { level: 3 })],
    });
    const ask = choiceQuestion(b, {
      name: "renew",
      prompt: t(
        "Why is hydro power called a renewable source of energy?",
        "जल विद्युत को नवीकरणीय ऊर्जा स्रोत क्यों कहते हैं?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Rain refills the reservoir each time it falls",
            "हर बार बारिश होने पर जलाशय फिर भर जाता है",
          ),
        },
        {
          id: "reuse",
          label: t(
            "The same water is pumped back up after use",
            "उपयोग के बाद वही पानी वापस ऊपर पंप होता है",
          ),
          feedback: t(
            "Pumping it up would cost as much energy as it gives. It is renewable because the rain refills the reservoir.",
            "उसे ऊपर पंप करने में उतनी ही ऊर्जा लगेगी जितनी वह देता है। यह नवीकरणीय है क्योंकि बारिश जलाशय भर देती है।",
          ),
        },
        {
          id: "nofuel",
          label: t(
            "The dam itself lasts for ever without repairs",
            "बाँध स्वयं बिना मरम्मत के हमेशा चलता है",
          ),
          feedback: t(
            "Dams need upkeep. Renewable refers to the water, which the rain keeps refilling.",
            "बाँधों को देखभाल चाहिए। नवीकरणीय पानी के बारे में है, जिसे बारिश भरती रहती है।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
    });
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(ask));
    return column([
      w.title(t("The higher the water…", "पानी जितना ऊँचा…")),
      plant,
      goal,
      w.definition(
        t(
          "**Renewable.** The higher the water stands, the more potential energy it has, so the more electricity the plant can make. And since **the reservoir is refilled each time it rains**, hydro power is a **renewable source of energy**: it won't get used up the way fossil fuels will. About **a quarter** of India's energy needs are met by hydro power plants.",
          "**नवीकरणीय।** पानी जितना ऊँचा होता है, उसमें उतनी ज़्यादा स्थितिज ऊर्जा होती है, इसलिए संयंत्र उतनी ज़्यादा बिजली बना सकता है। और चूँकि **हर बार बारिश होने पर जलाशय फिर भर जाता है**, जल विद्युत एक **नवीकरणीय ऊर्जा स्रोत** है: वह जीवाश्म ईंधनों की तरह ख़र्च नहीं होगा। भारत की ऊर्जा ज़रूरतों का लगभग **एक-चौथाई** जल विद्युत संयंत्र पूरा करते हैं।",
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The problems with big dams. */
const problems = page(
  "problems",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      prompt: t(
        "Plants drowned under a reservoir rot without oxygen. Why is that a problem?",
        "जलाशय में डूबे पौधे बिना ऑक्सीजन के सड़ते हैं। यह समस्या क्यों है?",
      ),
      options: [
        {
          id: "right",
          label: t("They give off methane, a greenhouse gas", "वे मीथेन छोड़ते हैं, एक ग्रीनहाउस गैस"),
        },
        {
          id: "oxygen",
          label: t(
            "They give off oxygen, which harms the fish",
            "वे ऑक्सीजन छोड़ते हैं, जो मछलियों को नुक़सान पहुँचाती है",
          ),
          feedback: t(
            "Rotting without oxygen gives methane, not oxygen. Methane is a greenhouse gas.",
            "बिना ऑक्सीजन सड़ने से मीथेन बनती है, ऑक्सीजन नहीं। मीथेन एक ग्रीनहाउस गैस है।",
          ),
        },
        {
          id: "block",
          label: t(
            "They block the pipes leading to the turbine",
            "वे टरबाइन तक जाने वाले पाइप रोक देते हैं",
          ),
          feedback: t(
            "The trouble is chemical: rotting under water without oxygen releases methane, a greenhouse gas.",
            "दिक़्क़त रासायनिक है: पानी में बिना ऑक्सीजन सड़ने से मीथेन निकलती है, एक ग्रीनहाउस गैस।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("The cost of a big dam", "बड़े बाँध की क़ीमत")),
      w.definition(
        t(
          "**Problems with big dams.** (1) Dams can be built **only in a few places**, mostly in hilly land. (2) **Large areas of farmland and homes are submerged.** (3) **Whole ecosystems are destroyed** under the water. (4) Submerged plants **rot without oxygen and give off methane**, a greenhouse gas. (5) **Rehabilitating the people who are moved** is hard to do well.",
          "**बड़े बाँधों की समस्याएँ।** (1) बाँध **केवल कुछ जगहों** पर बन सकते हैं, ज़्यादातर पहाड़ी इलाक़ों में। (2) **खेतों और घरों के बड़े इलाक़े डूब जाते हैं।** (3) पानी के नीचे **पूरे पारितंत्र नष्ट हो जाते हैं।** (4) डूबे पौधे **बिना ऑक्सीजन सड़कर मीथेन छोड़ते हैं**, एक ग्रीनहाउस गैस। (5) **हटाए गए लोगों का पुनर्वास** ठीक से करना कठिन है।",
        ),
      ),
      w.body(
        t(
          "These problems are why people opposed the **Tehri Dam** on the Ganga and the **Sardar Sarovar** project on the Narmada.",
          "इन्हीं समस्याओं के कारण लोगों ने गंगा पर **टिहरी बाँध** और नर्मदा पर **सरदार सरोवर** परियोजना का विरोध किया।",
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

/** The drowned temple explained; a dam for the village? */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const pic = sceneOn(
      b,
      "pic",
      EnergyScene.DamTrip,
      "the dam and the reservoir with the temple top in the water",
    );
    const ask = choiceQuestion(b, {
      prompt: t(
        "Kabir wants a second, smaller dam on the stream below Grandpa's village. Which point should go in the plan?",
        "कबीर दादाजी के गाँव के नीचे वाली धारा पर दूसरा, छोटा बाँध चाहता है। योजना में कौन-सी बात जानी चाहिए?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "It would drown fields and homes; ask who loses first",
            "वह खेत और घर डुबोएगा; बनाने से पहले पूछो कि किसका नुक़सान होगा",
          ),
        },
        {
          id: "free",
          label: t(
            "It is renewable, so it can cause no harm to anyone at all here",
            "वह नवीकरणीय है, इसलिए किसी को कोई नुक़सान नहीं कर सकता",
          ),
          feedback: t(
            "Renewable doesn't mean harmless: the temple in the lake shows what a reservoir can drown.",
            "नवीकरणीय का अर्थ हानिरहित नहीं: झील में मंदिर दिखाता है कि जलाशय क्या-क्या डुबो सकता है।",
          ),
        },
        {
          id: "fuel",
          label: t(
            "It will need a lot of coal brought up to keep it running",
            "उसे चलाने के लिए बहुत कोयला ऊपर लाना पड़ेगा",
          ),
          feedback: t(
            "A hydro plant burns nothing. Its cost is the land it drowns.",
            "जल विद्युत संयंत्र कुछ नहीं जलाता। उसकी क़ीमत वह ज़मीन है जो वह डुबोता है।",
          ),
        },
      ],
      answer: "right",
    });
    const note = w.body(
      t(
        "The temple was drowned because the reservoir had to rise high to store potential energy. Riya writes: **no new dam; the village would pay with its own fields.** Stop 3 done.",
        "मंदिर इसलिए डूबा क्योंकि स्थितिज ऊर्जा संचित करने के लिए जलाशय को ऊँचा उठना था। रिया लिखती है: **कोई नया बाँध नहीं; गाँव को अपने ही खेतों से क़ीमत चुकानी पड़ेगी।** पड़ाव 3 पूरा।",
      ),
      "note",
      { isHidden: true },
    );
    b.when(ask.on(QuestionSignal.Correct), theBoard.show(note));
    return column([
      w.title(t("A dam for the village?", "गाँव के लिए बाँध?")),
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

/** In-text Q3 and Exercise 5, then the mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const q1 = choiceQuestion(b, {
      name: "q1",
      prompt: t(
        "How has the traditional use of flowing water been changed for our convenience?",
        "बहते पानी के पारंपरिक उपयोग को हमारी सुविधा के लिए कैसे बदला गया है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Dams store it and turbines turn its energy into electricity",
            "बाँध उसे रोकते हैं और टरबाइन उसकी ऊर्जा को बिजली में बदलते हैं",
          ),
        },
        {
          id: "boats",
          label: t(
            "It is now used only to carry boats and logs down rivers",
            "अब उसका उपयोग केवल नदी में नावें और लट्ठे बहाने में होता है",
          ),
          feedback: t(
            "Those are old uses. Today dams store the water and turbines make electricity from it.",
            "वे पुराने उपयोग हैं। आज बाँध पानी रोकते हैं और टरबाइन उससे बिजली बनाते हैं।",
          ),
        },
        {
          id: "burn",
          label: t(
            "It is boiled in furnaces to make steam for thermal plants",
            "उसे भट्टियों में उबालकर तापीय संयंत्रों के लिए भाप बनाई जाती है",
          ),
          feedback: t(
            "That uses the heat of burning fuel. Hydro plants use the energy of the water itself to turn turbines.",
            "वह जलते ईंधन की ऊष्मा का उपयोग है। जल विद्युत संयंत्र टरबाइन घुमाने के लिए पानी की अपनी ऊर्जा उपयोग करते हैं।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const q2 = choiceQuestion(b, {
      name: "q2",
      prompt: t(
        "Why does a dam turn a river into stored energy?",
        "बाँध नदी को संचित ऊर्जा में क्यों बदल देता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Raising the water gives it potential energy, which falls through the turbine",
            "पानी को ऊँचा उठाने से उसे स्थितिज ऊर्जा मिलती है, जो टरबाइन से होकर गिरती है",
          ),
        },
        {
          id: "heavy",
          label: t("The dam makes the water heavier", "बाँध पानी को भारी बना देता है"),
          feedback: t(
            "The water weighs the same. What changes is its height: high water has potential energy.",
            "पानी का भार उतना ही रहता है। बदलती है उसकी ऊँचाई: ऊँचे पानी में स्थितिज ऊर्जा होती है।",
          ),
        },
        {
          id: "heat",
          label: t("The dam heats the water", "बाँध पानी को गर्म करता है"),
          feedback: t(
            "Nothing is heated in a hydro plant. The water is held high, and its fall spins the turbine.",
            "जल विद्युत संयंत्र में कुछ गर्म नहीं होता। पानी ऊँचाई पर रोका जाता है, और उसका गिरना टरबाइन घुमाता है।",
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
        "**Mission log.** ✓ A dam turns the river's kinetic energy into potential energy; falling through pipes, the water spins a turbine. ✓ Hydro power is renewable: rain refills the reservoir. It meets about a quarter of India's needs. ✗ Big dams drown farms, homes and ecosystems, give off methane and displace people. Next stop: the cow shed.",
        "**मिशन लॉग।** ✓ बाँध नदी की गतिज ऊर्जा को स्थितिज ऊर्जा में बदलता है; पाइपों से गिरता पानी टरबाइन घुमाता है। ✓ जल विद्युत नवीकरणीय है: बारिश जलाशय भरती है। यह भारत की लगभग एक-चौथाई ज़रूरतें पूरी करती है। ✗ बड़े बाँध खेत, घर और पारितंत्र डुबोते हैं, मीथेन छोड़ते हैं और लोगों को विस्थापित करते हैं। अगला पड़ाव: गौशाला।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(q2.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), q1, q2, log, space()]);
  },
  { passOn: PassOn.Rules },
);

export const overview = [hook, how, level, problems, inLife, yourTurn];

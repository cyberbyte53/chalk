import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, multiChoiceQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  BenchAction,
  BenchKind,
  ChemistrySceneKind,
  SwapAction,
  SwapKind,
  chemistrySceneDef,
  particleSwapDef,
  reactionBenchDef,
} from "@chalk/prop-chemistry";

const r = String.raw;

/** A bench the learner can run, with or without its thermometer. */
const bench = (kind: (typeof BenchKind)[keyof typeof BenchKind], showThermometer = false) => ({
  kind,
  isStarted: false,
  showThermometer,
  showNames: true,
  showObservations: true,
  canStart: true,
});

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** Who, where, what: ten days to Diwali and Mom's list on the fridge. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const list = b.prop(chemistrySceneDef, "list", { scene: ChemistrySceneKind.DiwaliList });
  b.standsFor(
    list,
    "Riya and her little brother Kabir in the kitchen, Riya ticking a Diwali to-do list stuck on the fridge",
  );
  return column([
    w.title(t("Ten days to Diwali", "दिवाली में दस दिन")),
    list,
    w.body(
      t(
        "Diwali is ten days away, and Mom has stuck a list on the fridge. Riya, who is in Class 10, and her little brother Kabir have been put in charge of it. Grandpa has promised to help, which mostly means telling stories.",
        "दिवाली दस दिन दूर है, और मम्मी ने फ़्रिज पर एक सूची चिपका दी है। दसवीं में पढ़ने वाली रिया और उसके छोटे भाई कबीर को इसकी ज़िम्मेदारी मिली है। दादाजी ने मदद का वादा किया है, जिसका मतलब ज़्यादातर कहानियाँ सुनाना है।",
      ),
    ),
    w.definition(
      t(
        "**Mom's list.** (1) Whitewash the walls with lime. (2) Do something about the rusty gate. (3) Polish the black silver anklets and the green copper diyas. (4) Keep the namkeen fresh till the guests come. (5) Buy sparklers.",
        "**मम्मी की सूची।** (1) दीवारों पर चूने की सफ़ेदी। (2) ज़ंग लगे गेट का कुछ करो। (3) काली पड़ी चाँदी की पायलें और हरे पड़े ताँबे के दीये चमकाओ। (4) मेहमानों के आने तक नमकीन ताज़ा रखो। (5) फुलझड़ियाँ लाओ।",
      ),
    ),
    space(),
  ]);
});

/** Grandpa's remark: every job on the list is chemistry. Why the chapter, and the stops. */
const why = page("why", (b) => {
  const w = wordsOn(b);
  const night = b.prop(chemistrySceneDef, "night", { scene: ChemistrySceneKind.DiwaliNight });
  b.standsFor(
    night,
    "the goal: the house on Diwali night, shiny white walls, diyas glowing, a sparkler in Kabir's hand",
  );
  return column([
    w.title(t("Every job is chemistry", "हर काम रसायन है")),
    w.body(
      t(
        'Grandpa reads the list over Riya\'s shoulder and laughs. **"Every job on that list is chemistry."** Lime that fizzes and gets hot in water. Iron that turns into crumbly brown rust. Silver that goes black, copper that goes green, oil in the namkeen that starts to smell. A sparkler that burns with a blinding white light. In each one, a substance is turning into a **new substance**.',
        'दादाजी रिया के कंधे के ऊपर से सूची पढ़कर हँसते हैं। **"इस सूची का हर काम रसायन है।"** चूना जो पानी में सनसनाता और गर्म होता है। लोहा जो भुरभुरे भूरे ज़ंग में बदल जाता है। चाँदी जो काली पड़ती है, ताँबा जो हरा पड़ता है, नमकीन का तेल जिससे बदबू आने लगती है। फुलझड़ी जो चौंधियाने वाली सफ़ेद रोशनी से जलती है। हर एक में कोई पदार्थ एक **नए पदार्थ** में बदल रहा है।',
      ),
    ),
    night,
    w.body(
      t(
        "That's the mission for this chapter: get the house ready for Diwali, and understand what is actually happening in every job, so each one is done right.",
        "यही इस अध्याय का मिशन है: घर को दिवाली के लिए तैयार करना, और समझना कि हर काम में असल में क्या हो रहा है, ताकि हर काम ठीक से हो।",
      ),
    ),
    w.definition(
      t(
        "**The stops on the way.** (1) Spotting a chemical reaction: *this lesson*. (2) Writing one down as an equation. (3) Balancing the equation. (4) Combination reactions: the whitewash. (5) Decomposition reactions. (6) Displacement reactions. (7) Oxidation and reduction. (8) Rust and stale namkeen: the last jobs on the list.",
        "**रास्ते के पड़ाव।** (1) रासायनिक अभिक्रिया पहचानना: *यह पाठ*। (2) उसे समीकरण के रूप में लिखना। (3) समीकरण को संतुलित करना। (4) संयोजन अभिक्रियाएँ: सफ़ेदी। (5) वियोजन अभिक्रियाएँ। (6) विस्थापन अभिक्रियाएँ। (7) उपचयन और अपचयन। (8) ज़ंग और बासी नमकीन: सूची के आख़िरी काम।",
      ),
    ),
    w.body(
      t(
        "First stop, from the very beginning: what does it mean for one substance to turn into another, and how can you tell it has happened?",
        "पहला पड़ाव, बिल्कुल शुरू से: एक पदार्थ का दूसरे में बदलना क्या होता है, और कैसे पता चले कि ऐसा हो गया है?",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Class 9 recap: substance, element, compound, atom, molecule. */
const matter = page(
  "matter",
  (b) => {
    const w = wordsOn(b);
    const water = b.prop(particleSwapDef, "water", {
      kind: SwapKind.WaterFormation,
      step: 0,
      canStep: true,
      showEquation: false,
      captions: [
        t(
          "Hydrogen molecules (two H atoms each) and an oxygen molecule (two O atoms).",
          "हाइड्रोजन अणु (हर एक में दो H परमाणु) और एक ऑक्सीजन अणु (दो O परमाणु)।",
        ),
        t("The atoms let go of their partners…", "परमाणु अपने साथी छोड़ते हैं…"),
        t(
          "…and join up differently: two water molecules, each H₂O.",
          "…और अलग तरह से जुड़ते हैं: पानी के दो अणु, हर एक H₂O।",
        ),
      ],
    });
    b.studentOnly(water.action(SwapAction.Next));
    b.standsFor(
      water,
      "two hydrogen molecules and one oxygen molecule drawn as coloured balls; stepping on, the same atoms rearrange into two water molecules",
    );
    const which = choiceQuestion(b, {
      name: "which",
      prompt: t("Which of these is a compound?", "इनमें से कौन-सा यौगिक है?"),
      options: [
        { id: "right", label: t("Water, H₂O", "पानी, H₂O") },
        {
          id: "o2",
          label: t("Oxygen, O₂", "ऑक्सीजन, O₂"),
          feedback: t(
            "O₂ has two atoms, but both are oxygen: it is an element.",
            "O₂ में दो परमाणु हैं, पर दोनों ऑक्सीजन के: यह तत्व है।",
          ),
        },
        {
          id: "mg",
          label: t("Magnesium, Mg", "मैग्नीशियम, Mg"),
          feedback: t(
            "Magnesium is made of one kind of atom only: it is an element.",
            "मैग्नीशियम केवल एक ही तरह के परमाणुओं से बना है: यह तत्व है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("What things are made of", "चीज़ें किससे बनी हैं")),
      w.body(
        t(
          "A quick recap from Class 9, because this whole chapter is built on it.",
          "कक्षा 9 की एक छोटी दोहराई, क्योंकि यह पूरा अध्याय इसी पर बना है।",
        ),
      ),
      w.definition(
        t(
          "**Substance, atom, element.** Any particular kind of matter, like water, iron or salt, is a **substance**. All matter is made of tiny particles called **atoms**. A substance made of only one kind of atom is an **element**: iron, magnesium, oxygen. Each element has a **symbol**: Fe, Mg, O.",
          "**पदार्थ, परमाणु, तत्व।** किसी भी ख़ास तरह का द्रव्य, जैसे पानी, लोहा या नमक, एक **पदार्थ** है। सारा द्रव्य **परमाणु** कहे जाने वाले नन्हे कणों से बना है। जो पदार्थ केवल एक तरह के परमाणुओं से बना हो, वह **तत्व** है: लोहा, मैग्नीशियम, ऑक्सीजन। हर तत्व का एक **प्रतीक** होता है: Fe, Mg, O।",
        ),
      ),
      w.definition(
        t(
          r`**Molecule, compound, formula.** Atoms join together in small groups called **molecules**. A substance whose molecules hold two or more *different* kinds of atom, joined in a fixed ratio, is a **compound**. Its **formula** says which atoms and how many: water is $\ce{H2O}$, two hydrogen atoms and one oxygen atom. The small number after a symbol counts that atom; no number means one.`,
          r`**अणु, यौगिक, सूत्र।** परमाणु छोटे समूहों में जुड़ते हैं जिन्हें **अणु** कहते हैं। जिस पदार्थ के अणुओं में दो या अधिक *अलग-अलग* तरह के परमाणु एक निश्चित अनुपात में जुड़े हों, वह **यौगिक** है। उसका **सूत्र** बताता है कौन-से परमाणु और कितने: पानी $\ce{H2O}$ है, दो हाइड्रोजन परमाणु और एक ऑक्सीजन परमाणु। प्रतीक के बाद की छोटी संख्या उस परमाणु को गिनती है; कोई संख्या न हो तो एक।`,
        ),
      ),
      w.body(
        t(
          "Below, the balls are atoms. Tap next and watch: no atom appears or disappears, they only change partners. Keep that picture in mind for the whole chapter.",
          "नीचे गेंदें परमाणु हैं। आगे दबाओ और देखो: कोई परमाणु न बनता है न ग़ायब होता है, वे बस साथी बदलते हैं। यह चित्र पूरे अध्याय में याद रखना।",
        ),
      ),
      water,
      which,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Physical and chemical change; a chemical reaction defined. Burning magnesium. */
const change = page(
  "change",
  (b) => {
    const w = wordsOn(b);
    const mg = b.prop(reactionBenchDef, "mg", bench(BenchKind.MagnesiumBurns));
    b.studentOnly(mg.action(BenchAction.Start));
    b.studentOnly(mg.action(BenchAction.Reset));
    b.standsFor(
      mg,
      "NCERT Activity 1.1: a cleaned magnesium ribbon held in tongs in a flame burns with a dazzling white flame and leaves a white powder in a watch-glass",
    );
    const kind = choiceQuestion(b, {
      name: "kind",
      prompt: t("Which of these is a chemical change?", "इनमें से कौन-सा रासायनिक परिवर्तन है?"),
      options: [
        { id: "right", label: t("Paper burning to ash", "कागज़ का जलकर राख होना") },
        {
          id: "ice",
          label: t("Ice melting", "बर्फ़ का पिघलना"),
          feedback: t(
            "Melted ice is still water: same substance, new state. That's a physical change.",
            "पिघली बर्फ़ अब भी पानी है: वही पदार्थ, नई अवस्था। यह भौतिक परिवर्तन है।",
          ),
        },
        {
          id: "sugar",
          label: t("Sugar dissolving in water", "चीनी का पानी में घुलना"),
          feedback: t(
            "The sugar is still sugar: dry the water and you get it back. That's a physical change.",
            "चीनी अब भी चीनी है: पानी सुखाओ और वह वापस मिल जाती है। यह भौतिक परिवर्तन है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("A change that makes something new", "ऐसा परिवर्तन जो कुछ नया बनाए")),
      w.definition(
        t(
          "**Physical and chemical change.** In a **physical change** the substance stays the same substance: ice melts into water, sugar dissolves. In a **chemical change** the substance becomes a *new* substance, with new properties. Whenever a chemical change happens, we say a **chemical reaction** has taken place.",
          "**भौतिक और रासायनिक परिवर्तन।** **भौतिक परिवर्तन** में पदार्थ वही पदार्थ रहता है: बर्फ़ पिघलकर पानी बनती है, चीनी घुलती है। **रासायनिक परिवर्तन** में पदार्थ एक *नया* पदार्थ बन जाता है, नए गुणों के साथ। जब भी रासायनिक परिवर्तन होता है, हम कहते हैं कि एक **रासायनिक अभिक्रिया** हुई है।",
        ),
      ),
      w.body(
        t(
          "NCERT's first experiment: a strip of shiny magnesium metal, rubbed clean with sandpaper, is held in a flame with tongs. Press start. (This needs a teacher and safety glasses in a real lab: the light is very bright.)",
          "NCERT का पहला प्रयोग: चमकदार मैग्नीशियम धातु की एक पट्टी, रेगमाल से रगड़कर साफ़ की हुई, चिमटे से लौ में पकड़ी जाती है। शुरू दबाओ। (असली प्रयोगशाला में इसके लिए शिक्षक और सुरक्षा चश्मा चाहिए: रोशनी बहुत तेज़ होती है।)",
        ),
      ),
      mg,
      w.body(
        t(
          "The ribbon burns with a dazzling white flame and turns into a white powder. That powder is not magnesium any more: it is **magnesium oxide**, a new substance made when magnesium joins with oxygen from the air.",
          "पट्टी चौंधियाने वाली सफ़ेद लौ से जलती है और सफ़ेद चूर्ण में बदल जाती है। वह चूर्ण अब मैग्नीशियम नहीं है: वह **मैग्नीशियम ऑक्साइड** है, एक नया पदार्थ जो मैग्नीशियम के हवा की ऑक्सीजन से जुड़ने पर बनता है।",
        ),
      ),
      kind,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Why clean the ribbon first (NCERT in-text Q1). */
const clean = page(
  "clean",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "Why is the magnesium ribbon rubbed with sandpaper before burning?",
        "जलाने से पहले मैग्नीशियम पट्टी को रेगमाल से क्यों रगड़ा जाता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "To remove its dull oxide coating, so the metal itself can burn",
            "उसकी फीकी ऑक्साइड परत हटाने के लिए, ताकि धातु ख़ुद जल सके",
          ),
        },
        {
          id: "shine",
          label: t("To make it shine for the photo", "फ़ोटो के लिए चमकाने को"),
          feedback: t(
            "The shine matters only because it means the coating is gone. Think about what that dull coating is.",
            "चमक केवल इसलिए मायने रखती है कि परत हट गई। सोचो वह फीकी परत क्या है।",
          ),
        },
        {
          id: "thin",
          label: t(
            "To make it thinner and lighter, so it catches fire faster",
            "उसे पतला और हल्का करने के लिए, ताकि जल्दी आग पकड़े",
          ),
          feedback: t(
            "Sandpaper hardly changes its thickness. It removes something from the surface.",
            "रेगमाल इसकी मोटाई लगभग नहीं बदलता। यह सतह से कुछ हटाता है।",
          ),
        },
      ],
      answer: "right",
    });
    const why = w.body(
      t(
        "Magnesium kept in air slowly reacts with oxygen and gets a thin dull layer of magnesium oxide. That layer has already reacted, so it gets in the way. Sandpaper exposes fresh metal.",
        "हवा में रखा मैग्नीशियम धीरे-धीरे ऑक्सीजन से अभिक्रिया करके मैग्नीशियम ऑक्साइड की पतली फीकी परत बना लेता है। वह परत पहले ही अभिक्रिया कर चुकी है, इसलिए रास्ते में आती है। रेगमाल ताज़ी धातु खोल देता है।",
      ),
      "why",
      { isHidden: true },
    );
    b.when(ask.on(QuestionSignal.Correct), theBoard.show(why));
    return column([
      w.title(t("Why clean it first?", "पहले साफ़ क्यों करें?")),
      w.body(
        t(
          "A magnesium ribbon straight from the bottle looks dull grey, not shiny.",
          "बोतल से सीधी निकली मैग्नीशियम पट्टी चमकदार नहीं, फीकी स्लेटी दिखती है।",
        ),
      ),
      ask,
      why,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Activity 1.2: lead nitrate and potassium iodide; a precipitate and a colour change. */
const yellow = page(
  "yellow",
  (b) => {
    const w = wordsOn(b);
    const tube = b.prop(reactionBenchDef, "tube", bench(BenchKind.LeadIodide));
    b.studentOnly(tube.action(BenchAction.Start));
    b.studentOnly(tube.action(BenchAction.Reset));
    b.standsFor(
      tube,
      "NCERT Activity 1.2: potassium iodide solution dropped into colourless lead nitrate solution; a yellow solid forms and settles",
    );
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "Both liquids were colourless. What tells you a new substance has formed?",
        "दोनों द्रव रंगहीन थे। किससे पता चलता है कि नया पदार्थ बना?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "A yellow solid appears: a change in colour and in state",
            "एक पीला ठोस दिखता है: रंग और अवस्था दोनों में परिवर्तन",
          ),
        },
        {
          id: "mix",
          label: t("Nothing: they just mixed", "कुछ नहीं: वे बस मिल गए"),
          feedback: t(
            "Two colourless liquids mixing would stay colourless. A yellow solid wasn't in either of them.",
            "दो रंगहीन द्रव मिलकर रंगहीन ही रहते। पीला ठोस दोनों में से किसी में नहीं था।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Two clear liquids, one yellow solid", "दो साफ़ द्रव, एक पीला ठोस")),
      w.body(
        t(
          "Activity 1.2. Take a little **lead nitrate** solution in a test tube, then add **potassium iodide** solution. Both look like plain water.",
          "क्रियाकलाप 1.2। एक परखनली में थोड़ा **लेड नाइट्रेट** विलयन लो, फिर **पोटैशियम आयोडाइड** विलयन डालो। दोनों सादे पानी जैसे दिखते हैं।",
        ),
      ),
      tube,
      w.definition(
        t(
          "**Solution and precipitate.** A **solution** is a substance dissolved evenly in a liquid, usually water. An insoluble solid that forms inside a solution, and makes it cloudy or settles at the bottom, is a **precipitate**.",
          "**विलयन और अवक्षेप।** **विलयन** किसी द्रव, प्रायः पानी, में एकसमान घुला पदार्थ है। जो अघुलनशील ठोस विलयन के अंदर बनकर उसे धुँधला कर दे या नीचे बैठ जाए, वह **अवक्षेप** है।",
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Activity 1.3: zinc and dilute acid; gas and warmth. */
const fizz = page(
  "fizz",
  (b) => {
    const w = wordsOn(b);
    const tube = b.prop(reactionBenchDef, "tube", bench(BenchKind.ZincAcid, true));
    b.studentOnly(tube.action(BenchAction.Start));
    b.studentOnly(tube.action(BenchAction.Reset));
    b.standsFor(
      tube,
      "NCERT Activity 1.3: zinc granules in dilute acid; bubbles of gas rise and the thermometer beside it rises",
    );
    const ask = multiChoiceQuestion(b, {
      name: "ask",
      prompt: t(
        "What did you notice? Tap every one that happened.",
        "तुमने क्या देखा? जो-जो हुआ, सब पर टैप करो।",
      ),
      options: [
        { id: "gas", label: t("Bubbles of a gas", "गैस के बुलबुले") },
        { id: "warm", label: t("The tube got warm", "परखनली गर्म हुई") },
        {
          id: "colour",
          label: t("The liquid turned blue", "द्रव नीला हो गया"),
          feedback: t(
            "The liquid stayed colourless. Watch it again.",
            "द्रव रंगहीन ही रहा। फिर से देखो।",
          ),
        },
      ],
      answers: ["gas", "warm"],
      missing: t("There's one more: look at the thermometer.", "एक और है: थर्मामीटर देखो।"),
    });
    return column([
      w.title(t("Bubbles and warmth", "बुलबुले और गर्मी")),
      w.body(
        t(
          "Activity 1.3. Drop a few **zinc** granules into dilute **hydrochloric acid** or **sulphuric acid**. (Acids burn skin: handle with care.) Press start, and watch the zinc and the thermometer.",
          "क्रियाकलाप 1.3। तनु **हाइड्रोक्लोरिक अम्ल** या **सल्फ़्यूरिक अम्ल** में **जिंक** के कुछ दाने डालो। (अम्ल त्वचा जलाते हैं: सावधानी से संभालो।) शुरू दबाओ, और जिंक व थर्मामीटर देखो।",
        ),
      ),
      tube,
      w.body(
        t(
          "The gas is **hydrogen**, a new substance. It wasn't there before: the zinc and the acid made it.",
          "यह गैस **हाइड्रोजन** है, एक नया पदार्थ। यह पहले नहीं थी: जिंक और अम्ल ने इसे बनाया।",
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The four signs, gathered. */
const signs = page(
  "signs",
  (b) => {
    const w = wordsOn(b);
    const lime = b.prop(reactionBenchDef, "lime", bench(BenchKind.QuickLime, true));
    b.studentOnly(lime.action(BenchAction.Start));
    b.studentOnly(lime.action(BenchAction.Reset));
    b.standsFor(
      lime,
      "quick lime in a beaker; water is added and it fizzes, steams and the thermometer shoots up",
    );
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "Water is poured on quick lime. Which sign of a reaction is the easiest to feel?",
        "बिना बुझे चूने पर पानी डाला जाता है। अभिक्रिया का कौन-सा संकेत सबसे आसानी से महसूस होता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "A change in temperature: the beaker gets hot",
            "ताप में परिवर्तन: बीकर गर्म हो जाता है",
          ),
        },
        {
          id: "colour",
          label: t("A change in colour: it turns grey", "रंग में बदलाव: वह स्लेटी हो जाता है"),
          feedback: t(
            "White lime stays whitish. Touch the beaker instead.",
            "सफ़ेद चूना सफ़ेद-सा ही रहता है। इसकी जगह बीकर छूकर देखो।",
          ),
        },
        {
          id: "none",
          label: t(
            "None: the lime is only dissolving, like sugar",
            "कोई नहीं: चूना बस चीनी की तरह घुल रहा है",
          ),
          feedback: t(
            "Dissolving doesn't make a beaker too hot to hold. Something new is forming.",
            "घुलने से बीकर इतना गर्म नहीं होता कि पकड़ न सको। कुछ नया बन रहा है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("How to tell a reaction happened", "कैसे पता चले कि अभिक्रिया हुई")),
      w.definition(
        t(
          "**The signs of a chemical reaction.** Any one of these tells you a reaction has probably taken place: (1) a **change in state** (like a solid forming in a liquid), (2) a **change in colour**, (3) a **gas given off** (bubbles, fumes), (4) a **change in temperature** (it gets hot or cold).",
          "**रासायनिक अभिक्रिया के संकेत।** इनमें से कोई भी एक बताता है कि शायद अभिक्रिया हुई है: (1) **अवस्था में परिवर्तन** (जैसे द्रव में ठोस बनना), (2) **रंग में परिवर्तन**, (3) **गैस का निकलना** (बुलबुले, धुआँ), (4) **ताप में परिवर्तन** (गर्म या ठंडा होना)।",
        ),
      ),
      w.body(
        t(
          "Magnesium showed a change in temperature (it gave out heat, and light) and a change in state (a white solid). Lead nitrate showed a colour and a solid. Zinc showed a gas and warmth. Now try the one on Mom's list.",
          "मैग्नीशियम ने ताप में परिवर्तन (उसने गर्मी और रोशनी दी) और अवस्था में परिवर्तन (एक सफ़ेद ठोस) दिखाया। लेड नाइट्रेट ने रंग और ठोस दिखाया। जिंक ने गैस और गर्मी दिखाई। अब मम्मी की सूची वाला आज़माओ।",
        ),
      ),
      lime,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** Back to the list: which jobs are chemical reactions? */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const list = b.prop(chemistrySceneDef, "list", { scene: ChemistrySceneKind.DiwaliList });
    b.standsFor(list, "the Diwali list on the fridge again");
    const ask = multiChoiceQuestion(b, {
      name: "ask",
      prompt: t(
        "Kabir adds jobs to the list. Which of them are chemical reactions?",
        "कबीर सूची में काम जोड़ता है। इनमें से कौन-से रासायनिक अभिक्रियाएँ हैं?",
      ),
      options: [
        {
          id: "lime",
          label: t(
            "Lime fizzing hot in a bucket of water",
            "बाल्टी के पानी में चूने का गर्म होकर सनसनाना",
          ),
        },
        { id: "sparkler", label: t("A sparkler burning", "फुलझड़ी का जलना") },
        {
          id: "curd",
          label: t("Milk left out in summer turning sour", "गर्मी में बाहर रखे दूध का खट्टा होना"),
        },
        {
          id: "wax",
          label: t("Melting wax to make new candles", "नई मोमबत्ती बनाने के लिए मोम पिघलाना"),
          feedback: t(
            "Melted wax sets back into the same wax. Same substance, new state: physical.",
            "पिघला मोम फिर वही मोम बनकर जम जाता है। वही पदार्थ, नई अवस्था: भौतिक।",
          ),
        },
        {
          id: "dust",
          label: t("Dusting the fan", "पंखे की धूल झाड़ना"),
          feedback: t(
            "No substance changes into another: the dust just moves.",
            "कोई पदार्थ दूसरे में नहीं बदलता: धूल बस हटती है।",
          ),
        },
      ],
      answers: ["lime", "sparkler", "curd"],
      missing: t(
        "There's another: think about what sour milk tastes and smells like.",
        "एक और है: सोचो खट्टे दूध का स्वाद और गंध कैसी होती है।",
      ),
      passes: false,
    });
    const stop = w.definition(
      t(
        '**Stop 1 done.** A chemical reaction makes new substances, and we can spot one by a change in state, colour or temperature, or a gas given off. But a sentence like "magnesium burns in oxygen to give magnesium oxide" is long. Next stop: a short, exact way to write a reaction down.',
        '**पड़ाव 1 पूरा।** रासायनिक अभिक्रिया नए पदार्थ बनाती है, और हम उसे अवस्था, रंग या ताप में परिवर्तन, या गैस निकलने से पहचान सकते हैं। पर "मैग्नीशियम ऑक्सीजन में जलकर मैग्नीशियम ऑक्साइड देता है" जैसा वाक्य लंबा है। अगला पड़ाव: अभिक्रिया लिखने का छोटा, सटीक तरीक़ा।',
      ),
      "stop",
      { isHidden: true },
    );
    b.when(ask.on(QuestionSignal.Correct), [theBoard.show(stop), theBoard.pass()]);
    return column([
      w.title(t("Back to the list", "फिर सूची पर")),
      list,
      w.body(
        t(
          "Grandpa's claim, tested. Lime and water get so hot that you must never put your hand in the bucket. Sour milk tastes and smells different from fresh milk: it is a new substance. The sparkler gives light and heat and leaves something new behind.",
          "दादाजी की बात, परखी हुई। चूना और पानी इतने गर्म हो जाते हैं कि बाल्टी में कभी हाथ नहीं डालना चाहिए। खट्टे दूध का स्वाद और गंध ताज़े दूध से अलग है: वह नया पदार्थ है। फुलझड़ी रोशनी और गर्मी देती है और पीछे कुछ नया छोड़ जाती है।",
        ),
      ),
      ask,
      stop,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** NCERT's opening list, and a last check; then the mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const ask1 = choiceQuestion(b, {
      name: "ask1",
      prompt: t(
        "An iron tawa left in a damp kitchen gets a reddish-brown coating. What kind of change is this?",
        "नम रसोई में छोड़े लोहे के तवे पर लाल-भूरी परत जम जाती है। यह किस तरह का परिवर्तन है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Chemical: a new substance (rust) has formed",
            "रासायनिक: एक नया पदार्थ (ज़ंग) बना है",
          ),
        },
        {
          id: "physical",
          label: t("Physical: it's only dirt on the iron", "भौतिक: यह बस लोहे पर गंदगी है"),
          feedback: t(
            "Rust isn't dirt sitting on the iron: it's the iron itself that has changed, and it flakes away.",
            "ज़ंग लोहे पर बैठी गंदगी नहीं है: ख़ुद लोहा बदला है, और वह झड़ता है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const ask2 = choiceQuestion(b, {
      name: "ask2",
      prompt: t(
        "Which sign shows that grapes left for a few days have fermented?",
        "कुछ दिन रखे अंगूरों के किण्वित होने का कौन-सा संकेत है?",
      ),
      options: [
        { id: "right", label: t("Bubbles of gas and a new smell", "गैस के बुलबुले और नई गंध") },
        {
          id: "shape",
          label: t("They are still round", "वे अब भी गोल हैं"),
          feedback: t(
            "Shape alone tells you nothing about the substance inside.",
            "केवल आकार से अंदर के पदार्थ के बारे में कुछ पता नहीं चलता।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ A chemical reaction turns substances into new ones. ✓ The signs: change in state, change in colour, gas given off, change in temperature. ✓ Lime in water, sparklers and sour milk are reactions; melting wax is not. Next: writing a reaction down.",
        "**मिशन लॉग।** ✓ रासायनिक अभिक्रिया पदार्थों को नए पदार्थों में बदलती है। ✓ संकेत: अवस्था में परिवर्तन, रंग में परिवर्तन, गैस निकलना, ताप में परिवर्तन। ✓ पानी में चूना, फुलझड़ी और खट्टा दूध अभिक्रियाएँ हैं; मोम पिघलना नहीं। आगे: अभिक्रिया को लिखना।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(ask1.on(QuestionSignal.Correct), theBoard.show(ask2));
    b.when(ask2.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), ask1, ask2, log, space()]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [hook, why, matter, change, clean, yellow, fizz, signs, inLife, yourTurn];

import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, goalQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  CookerPart,
  EnergyScene,
  Sky,
  SolarAction,
  SolarDerived,
  SolarMode,
  solarLabDef,
} from "@chalk/prop-energy";
import { sceneOn } from "../kit";

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** The hot flat roof of the school. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const pic = sceneOn(
    b,
    "pic",
    EnergyScene.SchoolRoof,
    "the village school's flat roof under a blazing midday Sun; Riya and Kabir shading their eyes",
  );
  return column([
    w.title(t("A roof in the Sun", "धूप में एक छत")),
    pic,
    w.body(
      t(
        "At noon Riya and Kabir climb onto the village school's flat roof. The concrete is so hot that Kabir hops from foot to foot. Down below, the cook is lighting a wood fire for the children's mid-day meal, in the full glare of the Sun. Riya stops: all this sunshine, every day, falling on a roof that nobody uses. What could it do?",
        "दोपहर में रिया और कबीर गाँव के स्कूल की सपाट छत पर चढ़ते हैं। कंक्रीट इतना गर्म है कि कबीर एक पैर से दूसरे पर उछलता है। नीचे रसोइया बच्चों के मध्याह्न भोजन के लिए लकड़ी की आग जला रहा है, सूरज की पूरी चमक में। रिया रुक जाती है: इतनी सारी धूप, हर दिन, ऐसी छत पर पड़ती है जिसका कोई उपयोग नहीं करता। यह क्या कर सकती है?",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** The Sun as a source; Activity 14.5's black and white flasks. */
const black = page(
  "black",
  (b) => {
    const w = wordsOn(b);
    const lab = b.prop(solarLabDef, "lab", {
      mode: SolarMode.Flasks,
      sky: Sky.Sunny,
      minutes: 0,
      hasBlack: true,
      hasGlass: true,
      hasMirror: true,
      cells: 4,
      showNames: true,
      canWait: true,
      canSetParts: false,
      canSetSky: false,
      canSetCells: false,
    });
    b.studentOnly(lab.action(SolarAction.Wait));
    b.studentOnly(lab.action(SolarAction.Reset));
    b.standsFor(
      lab,
      "Activity 14.5: a black flask and a white flask of water in the Sun, each with a thermometer; the learner lets time pass",
    );
    const ask = choiceQuestion(b, {
      prompt: t(
        "Leave the flasks in the Sun for an hour. Which gets hotter, and why?",
        "फ़्लास्कों को एक घंटे धूप में छोड़ो। कौन ज़्यादा गर्म होता है, और क्यों?",
      ),
      options: [
        {
          id: "right",
          label: t("The black one: black absorbs more heat", "काला: काला रंग ज़्यादा ऊष्मा सोखता है"),
        },
        {
          id: "white",
          label: t("The white one: white absorbs more heat", "सफ़ेद: सफ़ेद रंग ज़्यादा ऊष्मा सोखता है"),
          feedback: t(
            "Look at the thermometers: white reflects much of the sunlight, while black absorbs it.",
            "थर्मामीटर देखो: सफ़ेद बहुत-सी धूप लौटा देता है, जबकि काला उसे सोख लेता है।",
          ),
        },
        {
          id: "same",
          label: t("Neither: they get the same sunlight", "कोई नहीं: दोनों को समान धूप मिलती है"),
          feedback: t(
            "Same sunlight falls on both, but the black surface absorbs more of it.",
            "दोनों पर समान धूप पड़ती है, पर काली सतह उसका ज़्यादा भाग सोखती है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Energy from the Sun", "सूर्य से ऊर्जा")),
      w.body(
        t(
          "The Sun has been giving out an enormous amount of energy at its present rate for nearly **5 billion years**, and will go on for about 5 billion more. Only a small part reaches the outer edge of our atmosphere; nearly half of that is absorbed on the way down, and the rest reaches the ground.",
          "सूर्य लगभग **5 अरब वर्षों** से अपनी वर्तमान दर पर अपार ऊर्जा दे रहा है, और लगभग 5 अरब वर्ष और देता रहेगा। उसका छोटा-सा भाग ही हमारे वायुमंडल के बाहरी किनारे तक पहुँचता है; उसका लगभग आधा नीचे आते समय सोख लिया जाता है, और बाक़ी ज़मीन तक पहुँचता है।",
        ),
      ),
      w.note(
        t(
          "Do you know? India receives energy equal to more than 5,000 trillion kWh a year. The energy reaching each square metre at the outer edge of the atmosphere, facing the Sun, is the **solar constant**: about 1.4 kJ per second per square metre, or 1.4 kW/m².",
          "क्या तुम जानते हो? भारत को साल में 5,000 खरब kWh से अधिक के बराबर ऊर्जा मिलती है। वायुमंडल के बाहरी किनारे पर सूर्य की ओर हर वर्ग मीटर तक पहुँचने वाली ऊर्जा **सौर स्थिरांक** है: लगभग 1.4 kJ प्रति सेकंड प्रति वर्ग मीटर, यानी 1.4 kW/m²।",
        ),
      ),
      w.body(
        t(
          "Activity 14.5. Paint one conical flask black and one white, fill both with water, and leave them in direct sunlight.",
          "क्रियाकलाप 14.5। एक शंक्वाकार फ़्लास्क को काला और एक को सफ़ेद रंगो, दोनों में पानी भरो, और सीधी धूप में छोड़ दो।",
        ),
      ),
      lab,
      ask,
      w.definition(
        t(
          "**Black absorbs.** A **black surface absorbs more heat** than a white or shiny (reflecting) surface under the same conditions. Solar cookers and solar water heaters use this.",
          "**काला सोखता है।** समान परिस्थितियों में **काली सतह सफ़ेद या चमकीली (परावर्तक) सतह से ज़्यादा ऊष्मा सोखती** है। सौर कुकर और सौर जल तापक इसी का उपयोग करते हैं।",
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The solar cooker: black box, glass lid, mirror. */
const cooker = page(
  "cooker",
  (b) => {
    const w = wordsOn(b);
    const lab = b.prop(solarLabDef, "lab", {
      mode: SolarMode.Cooker,
      sky: Sky.Sunny,
      minutes: 0,
      hasBlack: true,
      hasGlass: false,
      hasMirror: true,
      cells: 4,
      showNames: true,
      canWait: true,
      canSetParts: true,
      canSetSky: false,
      canSetCells: false,
    });
    b.studentOnly(lab.action(SolarAction.Wait));
    b.studentOnly(lab.action(SolarAction.Reset));
    b.studentOnly(lab.action(SolarAction.SetPart));
    b.standsFor(
      lab,
      "a box-type solar cooker: a black-painted box, a glass lid and a plane mirror, each of which can be added or removed; a thermometer shows the temperature inside as time passes",
    );
    const goal = goalQuestion(b, {
      about: lab,
      prompt: t(
        "This cooker is missing a part. Get it hot enough to cook (100 °C): add what it needs and wait.",
        "इस कुकर में एक भाग नहीं है। इसे पकाने लायक़ गर्म (100 °C) करो: जो चाहिए वह जोड़ो और प्रतीक्षा करो।",
      ),
      isMet: lab.derived(SolarDerived.CanCook),
      solve: [
        lab.learner(SolarAction.SetPart, { part: CookerPart.Glass, has: true }),
        lab.learner(SolarAction.Wait),
        lab.learner(SolarAction.Wait),
        lab.learner(SolarAction.Wait),
        lab.learner(SolarAction.Wait),
      ],
    });
    const ask = choiceQuestion(b, {
      name: "glass",
      prompt: t(
        "Why is a solar cooker covered with a glass plate?",
        "सौर कुकर को काँच की प्लेट से क्यों ढका जाता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "It lets sunlight in but traps the heat inside",
            "यह धूप अंदर आने देता है पर ऊष्मा अंदर रोक लेता है",
          ),
        },
        {
          id: "clean",
          label: t("It keeps dust and insects out of the food", "यह भोजन से धूल और कीड़े दूर रखता है"),
          feedback: t(
            "It may do that too, but its job is the greenhouse effect: light gets in, heat can't get out.",
            "यह ऐसा भी कर सकता है, पर इसका काम ग्रीनहाउस प्रभाव है: प्रकाश अंदर आता है, ऊष्मा बाहर नहीं जा पाती।",
          ),
        },
        {
          id: "focus",
          label: t(
            "It focuses the sunlight onto the cooking pots",
            "यह धूप को खाना पकाने के बर्तनों पर फ़ोकस करता है",
          ),
          feedback: t(
            "A flat glass plate doesn't focus light; that is the mirror's job. The glass traps the heat.",
            "सपाट काँच की प्लेट प्रकाश फ़ोकस नहीं करती; वह दर्पण का काम है। काँच ऊष्मा रोकता है।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
    });
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(ask));
    return column([
      w.title(t("The solar cooker", "सौर कुकर")),
      w.definition(
        t(
          "**Solar cooker.** A box whose inside is **painted black** to absorb heat, covered with a **glass plate** to trap it (the **greenhouse effect** from stop 2: sunlight passes in through the glass, but the heat can't easily get out), and fitted with a **mirror** to reflect more sunlight into the box. Some cookers use mirrors to **focus** the Sun's rays and reach higher temperatures.",
          "**सौर कुकर।** एक बक्सा जिसका अंदरूनी भाग ऊष्मा सोखने के लिए **काला रंगा** है, उसे रोकने के लिए **काँच की प्लेट** से ढका है (दूसरे पड़ाव वाला **ग्रीनहाउस प्रभाव**: धूप काँच से अंदर जाती है, पर ऊष्मा आसानी से बाहर नहीं निकल पाती), और बक्से में ज़्यादा धूप डालने के लिए **दर्पण** लगा है। कुछ कुकर ऊँचा ताप पाने के लिए दर्पणों से सूर्य की किरणें **फ़ोकस** करते हैं।",
        ),
      ),
      lab,
      goal,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Solar cells and panels. */
const cells = page(
  "cells",
  (b) => {
    const w = wordsOn(b);
    const lab = b.prop(solarLabDef, "lab", {
      mode: SolarMode.Panel,
      sky: Sky.Sunny,
      minutes: 0,
      hasBlack: true,
      hasGlass: true,
      hasMirror: true,
      cells: 4,
      showNames: true,
      canWait: false,
      canSetParts: false,
      canSetSky: true,
      canSetCells: true,
    });
    b.studentOnly(lab.action(SolarAction.SetCells));
    b.studentOnly(lab.action(SolarAction.SetSky));
    b.standsFor(
      lab,
      "a solar cell panel: the learner sets the number of cells in a row and the sky (sunny, cloudy, night) and reads the volts and watts",
    );
    const goal = goalQuestion(b, {
      about: lab,
      prompt: t(
        "Each cell gives about 0.5 V. Build a panel that gives 12 V for the school's lamps.",
        "हर सेल लगभग 0.5 V देता है। ऐसा पैनल बनाओ जो स्कूल के लैंपों के लिए 12 V दे।",
      ),
      isMet: lab.derived(SolarDerived.Volts).eq(12),
      solve: [lab.learner(SolarAction.SetCells, { cells: 24 })],
    });
    const ask = choiceQuestion(b, {
      name: "night",
      prompt: t(
        "Set the sky to night. What does the panel give?",
        "आसमान को रात पर करो। पैनल क्या देता है?",
      ),
      options: [
        { id: "right", label: t("Nothing at all", "बिल्कुल कुछ नहीं") },
        {
          id: "half",
          label: t("About half its power", "अपनी लगभग आधी शक्ति"),
          feedback: t(
            "With no sunlight, a solar cell gives no electricity. Night needs a storage battery.",
            "धूप न हो तो सौर सेल बिजली नहीं देता। रात के लिए संचायक बैटरी चाहिए।",
          ),
        },
        {
          id: "full",
          label: t("Its full power", "अपनी पूरी शक्ति"),
          feedback: t(
            "Solar cells turn sunlight into electricity, so at night they give nothing.",
            "सौर सेल धूप को बिजली में बदलते हैं, इसलिए रात में कुछ नहीं देते।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
    });
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(ask));
    return column([
      w.title(t("Solar cells", "सौर सेल")),
      w.body(
        t(
          "Cookers and water heaters work only at certain times of day. **Solar cells** get round this by turning sunlight straight into electricity.",
          "कुकर और जल तापक दिन के कुछ ही समय काम करते हैं। **सौर सेल** धूप को सीधे बिजली में बदलकर इस कमी को दूर करते हैं।",
        ),
      ),
      w.definition(
        t(
          "**Solar cell and panel.** A **solar cell** converts **solar energy into electricity**. A typical cell gives **0.5–1 V** and about **0.7 W** in the Sun. Many cells combined in a **solar cell panel** give enough electricity for practical use.",
          "**सौर सेल और पैनल।** **सौर सेल** **सौर ऊर्जा को बिजली में** बदलता है। एक आम सेल धूप में **0.5–1 V** और लगभग **0.7 W** देता है। **सौर सेल पैनल** में जुड़े कई सेल उपयोग लायक़ बिजली देते हैं।",
        ),
      ),
      lab,
      goal,
      ask,
      w.definition(
        t(
          "**Good and bad points.** Solar cells have **no moving parts**, need **little maintenance**, work **without any focusing device**, and can be set up in **remote hamlets** where laying a power line would be too costly. But the special-grade **silicon** they need is limited, making them is **expensive**, and **silver** for joining them adds to the cost. They power **satellites and Mars orbiters**, remote **radio and TV relay stations**, **traffic signals, calculators** and toys. At home their use is still limited by the high cost.",
          "**अच्छे और बुरे पहलू।** सौर सेलों में **कोई चलने वाला भाग नहीं**, उन्हें **कम रखरखाव** चाहिए, वे **बिना किसी फ़ोकस करने वाली युक्ति के** काम करते हैं, और उन्हें **दूर-दराज़ की बस्तियों** में लगाया जा सकता है जहाँ बिजली की लाइन बिछाना बहुत महँगा होगा। पर उनके लिए ज़रूरी विशेष श्रेणी का **सिलिकॉन** सीमित है, उन्हें बनाना **महँगा** है, और उन्हें जोड़ने वाली **चाँदी** ख़र्च बढ़ाती है। वे **उपग्रहों और मंगल यानों**, दूर के **रेडियो और टीवी रिले स्टेशनों**, **ट्रैफ़िक सिग्नलों, कैलकुलेटरों** और खिलौनों को चलाते हैं। घरों में ऊँची क़ीमत के कारण इनका उपयोग अभी सीमित है।",
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

/** Plan item 2: panels on the school roof, a cooker for the mid-day meal. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const pic = sceneOn(
      b,
      "pic",
      EnergyScene.SchoolRoof,
      "the school's flat roof in the blazing Sun",
    );
    const ask = choiceQuestion(b, {
      prompt: t(
        "The evening classes run after dark. What must go with the roof panels?",
        "शाम की कक्षाएँ अँधेरा होने के बाद चलती हैं। छत के पैनलों के साथ क्या ज़रूर होना चाहिए?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Storage batteries charged by the panels during the day",
            "दिन में पैनलों से चार्ज होने वाली संचायक बैटरियाँ",
          ),
        },
        {
          id: "mirror",
          label: t(
            "Mirrors to catch the moonlight and focus it onto the panels",
            "चाँदनी पकड़कर पैनलों पर फ़ोकस करने वाले दर्पण",
          ),
          feedback: t(
            "Moonlight is far too weak. The panels charge batteries by day, and the batteries light the class at night.",
            "चाँदनी बहुत कमज़ोर है। पैनल दिन में बैटरियाँ चार्ज करते हैं, और बैटरियाँ रात में कक्षा रोशन करती हैं।",
          ),
        },
        {
          id: "nothing",
          label: t(
            "Nothing: the panels go on working after dark on stored sunlight",
            "कुछ नहीं: पैनल संचित धूप से अँधेरे के बाद भी चलते रहते हैं",
          ),
          feedback: t(
            "A solar cell gives nothing without light. The energy must be stored in batteries during the day.",
            "सौर सेल प्रकाश के बिना कुछ नहीं देता। ऊर्जा को दिन में बैटरियों में संचित करना होगा।",
          ),
        },
      ],
      answer: "right",
    });
    const note = w.body(
      t(
        "The school is far from any town, and the roof sits in the Sun all day. Riya writes plan item 2: **solar panels on the school roof with batteries for the evening classes, and a solar cooker for the mid-day meal on sunny days.** Stop 6 done.",
        "स्कूल किसी भी शहर से दूर है, और छत दिन भर धूप में रहती है। रिया योजना का दूसरा बिंदु लिखती है: **शाम की कक्षाओं के लिए बैटरियों के साथ स्कूल की छत पर सौर पैनल, और धूप वाले दिनों में मध्याह्न भोजन के लिए एक सौर कुकर।** पड़ाव 6 पूरा।",
      ),
      "note",
      { isHidden: true },
    );
    b.when(ask.on(QuestionSignal.Correct), theBoard.show(note));
    return column([w.title(t("Plan item 2", "योजना का दूसरा बिंदु")), pic, ask, note, space()]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** In-text Q1, Exercises 1 and 9, then the mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const q1 = choiceQuestion(b, {
      name: "q1",
      prompt: t(
        "Which mirror is best suited for use in a solar cooker?",
        "सौर कुकर में किस दर्पण का उपयोग सबसे उपयुक्त है?",
      ),
      options: [
        {
          id: "right",
          label: t("Concave: it focuses the rays", "अवतल: यह किरणें फ़ोकस करता है"),
        },
        {
          id: "convex",
          label: t("Convex: it spreads the rays", "उत्तल: यह किरणें फैलाता है"),
          feedback: t(
            "Spreading the rays out is the opposite of what we want. A concave mirror brings them together.",
            "किरणें फैलाना वही नहीं जो हम चाहते हैं। अवतल दर्पण उन्हें एक साथ लाता है।",
          ),
        },
        {
          id: "plane",
          label: t("Plane: it bends the rays", "समतल: यह किरणें मोड़ता है"),
          feedback: t(
            "A plane mirror reflects light but doesn't focus it. A concave mirror concentrates the heat.",
            "समतल दर्पण प्रकाश परावर्तित करता है पर फ़ोकस नहीं करता। अवतल दर्पण ऊष्मा केंद्रित करता है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const q2 = choiceQuestion(b, {
      name: "q2",
      prompt: t(
        "A solar water heater cannot be used to get hot water on…",
        "सौर जल तापक से गर्म पानी नहीं मिल सकता…",
      ),
      options: [
        { id: "right", label: t("a cloudy day", "बादल वाले दिन") },
        {
          id: "sunny",
          label: t("a sunny day", "धूप वाले दिन"),
          feedback: t("Sunny days are when it works best.", "धूप वाले दिन यह सबसे अच्छा काम करता है।"),
        },
        {
          id: "hot",
          label: t("a hot day", "गर्म दिन"),
          feedback: t("A hot, bright day suits it well.", "गर्म, चमकीला दिन इसके लिए अच्छा है।"),
        },
        {
          id: "windy",
          label: t("a windy day", "हवादार दिन"),
          feedback: t(
            "Wind doesn't stop the Sun's rays. Clouds do.",
            "हवा सूर्य की किरणें नहीं रोकती। बादल रोकते हैं।",
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
        "Where would a solar cooker be of limited use?",
        "सौर कुकर कहाँ सीमित उपयोग का होगा?",
      ),
      options: [
        {
          id: "right",
          label: t("Where the sky is cloudy for months", "जहाँ महीनों आसमान बादलों से घिरा रहे"),
        },
        {
          id: "desert",
          label: t("In a sunny desert far from any town", "किसी शहर से दूर धूप वाले रेगिस्तान में"),
          feedback: t(
            "A sunny, remote place suits a solar cooker perfectly. Cloudy or foggy places don't.",
            "धूप वाली, दूर की जगह सौर कुकर के लिए एकदम सही है। बादल या कोहरे वाली जगहें नहीं।",
          ),
        },
        {
          id: "village",
          label: t("In a village where wood is costly", "ऐसे गाँव में जहाँ लकड़ी महँगी हो"),
          feedback: t(
            "That's where a solar cooker helps most. It is limited where there is little sunshine.",
            "वहीं सौर कुकर सबसे ज़्यादा मदद करता है। यह वहाँ सीमित है जहाँ धूप कम हो।",
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
        "**Mission log.** ✓ The Sun will shine for 5 billion more years. ✓ Black absorbs heat; a solar cooker uses a black box, a glass lid (greenhouse effect) and a mirror; it works only in sunshine. ✓ Solar cells (0.5–1 V, about 0.7 W each) turn sunlight into electricity, with no moving parts, ideal far from power lines, but costly. Plan item 2 is written. Next stop: the sea and the earth's heat.",
        "**मिशन लॉग।** ✓ सूर्य 5 अरब वर्ष और चमकेगा। ✓ काला ऊष्मा सोखता है; सौर कुकर काला बक्सा, काँच का ढक्कन (ग्रीनहाउस प्रभाव) और दर्पण उपयोग करता है; यह केवल धूप में चलता है। ✓ सौर सेल (हर एक 0.5–1 V, लगभग 0.7 W) धूप को बिजली में बदलते हैं, बिना चलने वाले भागों के, बिजली लाइनों से दूर के लिए आदर्श, पर महँगे। योजना का दूसरा बिंदु लिखा गया। अगला पड़ाव: समुद्र और पृथ्वी की ऊष्मा।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(q3.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), q1, q2, q3, log, space()]);
  },
  { passOn: PassOn.Rules },
);

export const overview = [hook, black, cooker, cells, inLife, yourTurn];

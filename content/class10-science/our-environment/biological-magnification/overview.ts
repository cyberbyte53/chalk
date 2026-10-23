import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  EnvScene,
  MagAction,
  MagSetting,
  bioMagnificationDef,
  environmentSceneDef,
} from "@chalk/prop-environment";

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** The neighbour sprays; Grandpa won't. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const spray = b.prop(environmentSceneDef, "spray", { scene: EnvScene.Sprayer });
  b.standsFor(
    spray,
    "the neighbour spraying pesticide on his vegetable patch; Grandpa watching from the terrace",
  );
  return column([
    w.title(t("Grandpa says no", "दादाजी मना करते हैं")),
    spray,
    w.body(
      t(
        'Insects are eating Grandpa\'s spinach. The neighbour offers his sprayer: "One spray of this and the bugs are gone." Grandpa shakes his head and picks the insects off by hand. "The bugs die," he says, "but the spray doesn\'t. It just moves house, and the last house is us." Kabir has no idea what he means.',
        'कीड़े दादाजी का पालक खा रहे हैं। पड़ोसी अपना छिड़काव यंत्र देते हैं: "इसका एक छिड़काव, और कीड़े ग़ायब।" दादाजी सिर हिलाते हैं और कीड़ों को हाथ से चुनते हैं। "कीड़े मर जाते हैं," वे कहते हैं, "पर दवा नहीं मरती। वह बस घर बदलती है, और आख़िरी घर हम हैं।" कबीर को कुछ समझ नहीं आता।',
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** How pesticides enter a food chain. */
const enter = page(
  "enter",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "enter",
      prompt: t(
        "How does a pesticide sprayed on a field first get into a food chain?",
        "खेत पर छिड़का गया कीटनाशक सबसे पहले आहार श्रृंखला में कैसे पहुँचता है?",
      ),
      options: [
        {
          id: "right",
          label: t("Plants take it up with water", "पौधे उसे पानी के साथ सोख लेते हैं"),
        },
        {
          id: "air",
          label: t("Animals breathe it in from air", "जंतु उसे हवा से साँस में लेते हैं"),
          feedback: t(
            "NCERT's route: washed into the soil and water, then taken up by plants with water and minerals.",
            "NCERT का रास्ता: मिट्टी और पानी में बहकर, फिर पौधे उसे पानी और खनिजों के साथ लेते हैं।",
          ),
        },
        {
          id: "rain",
          label: t("Rain breaks it into food", "बारिश उसे भोजन में तोड़ देती है"),
          feedback: t(
            "These chemicals are not broken down. They are washed into the soil and taken up by plants.",
            "ये रसायन टूटते नहीं। ये मिट्टी में बहकर पौधों द्वारा ले लिए जाते हैं।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("How a pesticide gets in", "कीटनाशक अंदर कैसे पहुँचता है")),
      w.definition(
        t(
          "**Pesticide.** A chemical used to protect crops from pests and diseases. Farmers spray many of them.",
          "**कीटनाशक।** फ़सलों को कीटों और रोगों से बचाने के लिए इस्तेमाल होने वाला रसायन। किसान इनमें से कई का छिड़काव करते हैं।",
        ),
      ),
      w.body(
        t(
          "These chemicals are washed down into the soil or into ponds and rivers. From the soil, plants take them up along with water and minerals. From the water, water plants and animals take them up. That's how they enter a food chain.",
          "ये रसायन बहकर मिट्टी में या तालाबों और नदियों में चले जाते हैं। मिट्टी से पौधे इन्हें पानी और खनिजों के साथ ले लेते हैं। पानी से जलीय पौधे और जंतु इन्हें ले लेते हैं। इसी तरह ये आहार श्रृंखला में पहुँचते हैं।",
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Biological magnification, stepped up the chain. */
const climb = page(
  "climb",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "NCERT 15.1.1: the chemicals are not degradable, so they build up at each trophic level; humans at the top get the highest concentration. This is biological magnification.",
    );
    const field = b.prop(bioMagnificationDef, "field", {
      setting: MagSetting.Field,
      isSprayed: false,
      step: 0,
      canSetSetting: true,
    });
    b.studentOnly(field.action(MagAction.Spray));
    b.studentOnly(field.action(MagAction.Next));
    b.studentOnly(field.action(MagAction.Reset));
    b.studentOnly(field.action(MagAction.SetSetting));
    b.standsFor(
      field,
      "a pesticide sprayed on a field, then stepped up the chain from soil to wheat to goat to human, with more dots of chemical in each body",
    );
    const ask = choiceQuestion(b, {
      name: "most",
      prompt: t(
        "Spray, then step to the top. Which level ends up with the most pesticide in each body?",
        "छिड़काव करो, फिर सबसे ऊपर तक जाओ। किस स्तर के हर शरीर में सबसे ज़्यादा कीटनाशक होता है?",
      ),
      options: [
        { id: "right", label: t("The humans at the top", "सबसे ऊपर के मनुष्य") },
        {
          id: "wheat",
          label: t("The wheat that was sprayed", "छिड़का गया गेहूँ"),
          feedback: t(
            "The wheat gets it first, but each eater collects it from many bodies below. The top collects the most.",
            "गेहूँ को यह सबसे पहले मिलता है, पर हर खाने वाला नीचे के कई शरीरों से इसे जमा करता है। सबसे ऊपर वाला सबसे ज़्यादा जमा करता है।",
          ),
        },
        {
          id: "soil",
          label: t("The soil and the water", "मिट्टी और पानी"),
          feedback: t(
            "It's thinly spread in the soil. It gets more concentrated at every step up.",
            "मिट्टी में यह पतला फैला होता है। हर ऊपरी कदम पर यह और गाढ़ा होता जाता है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Poison that climbs", "ऊपर चढ़ता ज़हर")),
      w.definition(
        t(
          "**Biological magnification.** These chemicals are **not degradable**: nothing breaks them down. So they build up, more and more, at each trophic level. Humans are at the top of most food chains, so the highest amounts collect in our bodies. This build-up is **biological magnification**.",
          "**जैव आवर्धन।** ये रसायन **अनिम्नीकरणीय** हैं: कोई इन्हें तोड़ता नहीं। इसलिए ये हर पोषी स्तर पर अधिक-से-अधिक जमा होते जाते हैं। मनुष्य ज़्यादातर आहार श्रृंखलाओं में सबसे ऊपर हैं, इसलिए सबसे ज़्यादा मात्रा हमारे शरीर में जमा होती है। इस जमाव को **जैव आवर्धन** कहते हैं।",
        ),
      ),
      field,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Residues in food. */
const residues = page(
  "residues",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "wash",
      prompt: t(
        "Can pesticide residues in grains and vegetables always be washed off?",
        "क्या अनाज और सब्ज़ियों में कीटनाशक के अवशेष हमेशा धोकर हटाए जा सकते हैं?",
      ),
      options: [
        {
          id: "right",
          label: t("No: some is inside the plant", "नहीं: कुछ पौधे के अंदर होता है"),
        },
        {
          id: "yes",
          label: t("Yes: it sits only on the skin", "हाँ: यह सिर्फ़ छिलके पर रहता है"),
          feedback: t(
            "The plant took it up with water from the soil, so some is inside the food itself.",
            "पौधे ने इसे मिट्टी से पानी के साथ लिया, इसलिए कुछ भोजन के अंदर ही है।",
          ),
        },
        {
          id: "cook",
          label: t("Yes: cooking always destroys it", "हाँ: पकाने से यह हमेशा नष्ट होता है"),
          feedback: t(
            "These chemicals are not broken down easily; washing and cooking can't always remove them.",
            "ये रसायन आसानी से नहीं टूटते; धोने और पकाने से ये हमेशा नहीं हटते।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("It's in our food", "यह हमारे भोजन में है")),
      w.body(
        t(
          "That's why food grains like wheat and rice, vegetables, fruits and even meat contain varying amounts of **pesticide residues**. They cannot always be removed by washing or other means.",
          "इसी वजह से गेहूँ और चावल जैसे अनाज, सब्ज़ियाँ, फल और मांस तक में अलग-अलग मात्रा में **कीटनाशक के अवशेष** होते हैं। इन्हें धोकर या दूसरे तरीक़ों से हमेशा नहीं हटाया जा सकता।",
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

/** The pond version; Grandpa's riddle explained. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const pond = b.prop(bioMagnificationDef, "pond", {
      setting: MagSetting.Pond,
      isSprayed: true,
      step: 0,
    });
    b.studentOnly(pond.action(MagAction.Next));
    b.studentOnly(pond.action(MagAction.Reset));
    b.standsFor(
      pond,
      "spray washed into a pond, stepped from pond water to plants to fish to the people who eat the fish",
    );
    const ask = choiceQuestion(b, {
      name: "lastHouse",
      prompt: t(
        'What did Grandpa mean by "the last house is us"?',
        'दादाजी के "आख़िरी घर हम हैं" का क्या मतलब था?',
      ),
      options: [
        {
          id: "right",
          label: t("It collects most at the top: in us", "यह सबसे ऊपर सबसे ज़्यादा जमा होता है: हममें"),
        },
        {
          id: "drift",
          label: t("Spray drifts into houses on the wind", "छिड़काव हवा से घरों में उड़कर आता है"),
          feedback: t(
            "He meant the food chain: the chemical moves from body to body and piles up at the top.",
            "उनका मतलब आहार श्रृंखला था: रसायन शरीर से शरीर में जाता है और सबसे ऊपर जमा होता है।",
          ),
        },
        {
          id: "bugs",
          label: t("Insects run from fields to our houses", "कीड़े खेतों से भागकर हमारे घरों में आते हैं"),
          feedback: t(
            "It's the chemical that moves, not the bugs: up the chain, into us.",
            "जो चलता है वह रसायन है, कीड़े नहीं: श्रृंखला में ऊपर, हम तक।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const then = w.body(
      t(
        "Even the jar is safe only because Grandpa's tub was never sprayed. Kabir starts picking bugs off the spinach too.",
        "जार भी सिर्फ़ इसलिए सुरक्षित है क्योंकि दादाजी के टब में कभी छिड़काव नहीं हुआ। कबीर भी पालक से कीड़े चुनने लगता है।",
      ),
      "then",
      { isHidden: true },
    );
    b.when(ask.on(QuestionSignal.Correct), [theBoard.show(then), theBoard.pass()]);
    return column([
      w.title(t("The last house", "आख़िरी घर")),
      w.body(
        t(
          "The same thing happens in water. Step this pond up to the people who eat its fish.",
          "पानी में भी यही होता है। इस तालाब को उसकी मछली खाने वाले लोगों तक आगे बढ़ाओ।",
        ),
      ),
      pond,
      ask,
      then,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Exercise 6; the mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "ex6",
      prompt: t(
        "Exercise 6: is the amount of a magnified chemical the same at every level of an ecosystem?",
        "अभ्यास 6: क्या आवर्धित रसायन की मात्रा पारितंत्र के हर स्तर पर एक जैसी होती है?",
      ),
      options: [
        {
          id: "right",
          label: t("No: it is highest at the top", "नहीं: यह सबसे ऊपर सबसे ज़्यादा है"),
        },
        {
          id: "same",
          label: t("Yes: every level gets an equal share", "हाँ: हर स्तर को बराबर हिस्सा मिलता है"),
          feedback: t(
            "It builds up at every step, so each level up has more than the one below.",
            "यह हर कदम पर जमा होता है, इसलिए हर ऊपरी स्तर में नीचे वाले से ज़्यादा होता है।",
          ),
        },
        {
          id: "bottom",
          label: t("No: it is highest at the bottom", "नहीं: यह सबसे नीचे सबसे ज़्यादा है"),
          feedback: t(
            "The bottom gets it first but the least concentrated. It climbs and builds up.",
            "नीचे वाले को यह पहले मिलता है पर सबसे कम गाढ़ा। यह ऊपर चढ़ता और जमा होता है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log, day 12.** ✓ Non-degradable chemicals build up at each level: biological magnification. ✓ Grandpa's no-spray tub keeps the jar safe. ✗ Today the scrap dealer is taking the old fridge. Grandpa wants to know what's inside its pipes. Next: the ozone layer.",
        "**मिशन लॉग, दिन 12।** ✓ अनिम्नीकरणीय रसायन हर स्तर पर जमा होते हैं: जैव आवर्धन। ✓ दादाजी का बिना छिड़काव वाला टब जार को सुरक्षित रखता है। ✗ आज कबाड़ी पुराना फ़्रिज ले जा रहा है। दादाजी जानना चाहते हैं कि उसकी नलियों में क्या है। आगे: ओज़ोन परत।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(ask.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), ask, log, space()]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [hook, enter, climb, residues, inLife, yourTurn];

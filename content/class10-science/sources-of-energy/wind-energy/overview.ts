import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, goalQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import { EnergyScene, Supply, WindAction, WindDerived, windFarmDef } from "@chalk/prop-energy";
import { sceneOn } from "../kit";

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** The windy ridge, and Grandpa's old windmill. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const pic = sceneOn(
    b,
    "pic",
    EnergyScene.WindyRidge,
    "a windy ridge above the village; an old wooden windmill stands over a well, and Kabir's cap is blowing off",
  );
  return column([
    w.title(t("The windy ridge", "हवादार चोटी")),
    pic,
    w.body(
      t(
        'Above the village is a bare ridge where the wind never seems to stop. Kabir\'s cap blows off twice. Up there stands a broken wooden windmill over an old well. "When I was your age," says Grandpa, "that windmill pulled up all our water." Riya looks at the wind tugging her dupatta and wonders: could this same wind light the school?',
        'गाँव के ऊपर एक नंगी चोटी है जहाँ हवा कभी रुकती नहीं लगती। कबीर की टोपी दो बार उड़ जाती है। वहाँ एक पुराने कुएँ पर एक टूटी लकड़ी की पवनचक्की खड़ी है। "जब मैं तुम्हारी उम्र का था," दादाजी कहते हैं, "वही पवनचक्की हमारा सारा पानी खींचती थी।" रिया हवा को अपना दुपट्टा खींचते देखती है और सोचती है: क्या यही हवा स्कूल रोशन कर सकती है?',
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Wind and the windmill. */
const windmill = page(
  "windmill",
  (b) => {
    const w = wordsOn(b);
    const farm = b.prop(windFarmDef, "farm", {
      speed: 5,
      mills: 1,
      hasBattery: false,
      showReadout: true,
      canSetSpeed: true,
      canSetMills: false,
      canSetBattery: false,
    });
    b.studentOnly(farm.action(WindAction.SetSpeed));
    b.standsFor(
      farm,
      "one windmill on a tower with a wind-speed control in km/h; the blades turn only when the wind is fast enough",
    );
    const goal = goalQuestion(b, {
      about: farm,
      prompt: t(
        "Raise the wind speed until the windmill's blades start to turn.",
        "हवा की गति तब तक बढ़ाओ जब तक पवनचक्की की पंखुड़ियाँ घूमने न लगें।",
      ),
      isMet: farm.derived(WindDerived.IsTurning),
      solve: [farm.learner(WindAction.SetSpeed, { speed: 20 })],
    });
    const found = w.body(
      t(
        "The blades turn only when the wind is **faster than 15 km/h**. Below that, the turbine can't keep up the speed it needs.",
        "पंखुड़ियाँ तभी घूमती हैं जब हवा **15 km/h से तेज़** हो। उससे कम पर टरबाइन अपनी ज़रूरी गति नहीं बनाए रख सकता।",
      ),
      "found",
      { isHidden: true },
    );
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(found));
    return column([
      w.title(t("Electricity from the wind", "पवन से बिजली")),
      w.body(
        t(
          "The Sun heats land and water bodies unequally, and this makes the air move: **wind**. Its kinetic energy can do work. Windmills once did mechanical work, like lifting water from a well.",
          "सूर्य स्थल और जलाशयों को असमान रूप से गर्म करता है, और इससे हवा चलती है: **पवन**। इसकी गतिज ऊर्जा कार्य कर सकती है। पवनचक्कियाँ कभी यांत्रिक कार्य करती थीं, जैसे कुएँ से पानी खींचना।",
        ),
      ),
      w.definition(
        t(
          "**Windmill.** A windmill is like a **large electric fan on a tall, rigid support**. To make electricity, its turning motion **spins the turbine of a generator**.",
          "**पवनचक्की।** पवनचक्की **एक ऊँचे, मज़बूत आधार पर लगे बड़े बिजली के पंखे** जैसी होती है। बिजली बनाने के लिए इसकी घूर्णन गति **एक जनित्र का टरबाइन घुमाती** है।",
        ),
      ),
      farm,
      goal,
      found,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** A wind energy farm: many mills, land and back-up. */
const farmPage = page(
  "farm",
  (b) => {
    const w = wordsOn(b);
    const farm = b.prop(windFarmDef, "farm", {
      speed: 30,
      mills: 1,
      hasBattery: false,
      showReadout: true,
      canSetSpeed: true,
      canSetMills: true,
      canSetBattery: true,
    });
    b.studentOnly(farm.action(WindAction.SetSpeed));
    b.studentOnly(farm.action(WindAction.SetMills));
    b.studentOnly(farm.action(WindAction.SetBattery));
    b.standsFor(
      farm,
      "a wind farm: the learner sets the wind speed, the number of windmills and whether there is battery back-up, and reads the output and the land needed",
    );
    const goal = goalQuestion(b, {
      about: farm,
      prompt: t(
        "The wind dies down. Keep the lights on: make sure the supply doesn't drop to nothing.",
        "हवा धीमी हो जाती है। बत्तियाँ जलती रखो: पक्का करो कि आपूर्ति शून्य न हो।",
      ),
      isMet: farm.derived(WindDerived.Supply).eq(Supply.Battery),
      solve: [
        farm.learner(WindAction.SetBattery, { hasBattery: true }),
        farm.learner(WindAction.SetSpeed, { speed: 5 }),
      ],
    });
    const ask = choiceQuestion(b, {
      name: "land",
      prompt: t(
        "About how much land does a wind farm need for a 1 MW generator?",
        "1 MW जनित्र के लिए पवन फ़ार्म को लगभग कितनी ज़मीन चाहिए?",
      ),
      options: [
        { id: "right", label: t("About 2 hectares", "लगभग 2 हेक्टेयर") },
        {
          id: "small",
          label: t("About 2 square metres", "लगभग 2 वर्ग मीटर"),
          feedback: t(
            "Far more: about 2 hectares, because the mills must stand well apart.",
            "कहीं ज़्यादा: लगभग 2 हेक्टेयर, क्योंकि चक्कियाँ काफ़ी दूर-दूर खड़ी करनी पड़ती हैं।",
          ),
        },
        {
          id: "huge",
          label: t("About 200 hectares", "लगभग 200 हेक्टेयर"),
          feedback: t(
            "NCERT gives about 2 hectares per MW.",
            "NCERT प्रति MW लगभग 2 हेक्टेयर बताती है।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
    });
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(ask));
    return column([
      w.title(t("A wind energy farm", "पवन ऊर्जा फ़ार्म")),
      w.definition(
        t(
          "**Wind energy farm.** The output of a **single windmill is quite small**. So **many windmills are set up over a large area**, and their outputs are **coupled together** to give electricity on a commercial scale. This is a **wind energy farm**.",
          "**पवन ऊर्जा फ़ार्म।** **एक पवनचक्की का उत्पादन काफ़ी कम** होता है। इसलिए **बड़े क्षेत्र में कई पवनचक्कियाँ लगाई जाती हैं**, और उनका उत्पादन **आपस में जोड़कर** व्यावसायिक पैमाने पर बिजली पाई जाती है। यह **पवन ऊर्जा फ़ार्म** है।",
        ),
      ),
      w.note(
        t(
          "1 MW (megawatt) = 1000 kW = a million watts. 1 hectare = 10 000 m², about two football fields.",
          "1 MW (मेगावाट) = 1000 kW = दस लाख वाट। 1 हेक्टेयर = 10 000 m², लगभग दो फ़ुटबॉल मैदान।",
        ),
      ),
      farm,
      goal,
      w.definition(
        t(
          "**Limits of wind energy.** Wind energy is **renewable and clean**, with **no running costs**. But: (1) farms work only where the **wind blows for most of the year**; (2) the wind must be **faster than 15 km/h**; (3) **back-up** such as storage cells is needed for windless days; (4) they need **a lot of land**, about **2 hectares for 1 MW**; (5) they are **costly to set up**; and (6) towers and blades exposed to rain, Sun, storms and cyclones need **a lot of maintenance**.",
          "**पवन ऊर्जा की सीमाएँ।** पवन ऊर्जा **नवीकरणीय और स्वच्छ** है, और इसमें **कोई चालू ख़र्च नहीं**। पर: (1) फ़ार्म वहीं चलते हैं जहाँ **साल के ज़्यादातर समय हवा चले**; (2) हवा **15 km/h से तेज़** होनी चाहिए; (3) बिना हवा वाले दिनों के लिए संचायक सेल जैसा **बैक-अप** चाहिए; (4) उन्हें **बहुत ज़मीन** चाहिए, **1 MW के लिए लगभग 2 हेक्टेयर**; (5) उन्हें **लगाना महँगा** है; और (6) बारिश, धूप, आँधी और चक्रवात झेलते टावरों और पंखुड़ियों को **बहुत रखरखाव** चाहिए।",
        ),
      ),
      ask,
      w.note(
        t(
          'Do you know? Denmark, the "country of winds", gets over 25% of its electricity from windmills. Germany leads in total output; India ranks fifth. India\'s wind could give nearly 45,000 MW. The largest wind farm, near Kanyakumari in Tamil Nadu, generates 380 MW.',
          'क्या तुम जानते हो? "पवनों का देश" डेनमार्क अपनी 25% से ज़्यादा बिजली पवनचक्कियों से पाता है। कुल उत्पादन में जर्मनी आगे है; भारत पाँचवें स्थान पर है। भारत की पवन लगभग 45,000 MW दे सकती है। सबसे बड़ा पवन फ़ार्म, तमिलनाडु में कन्याकुमारी के पास, 380 MW बनाता है।',
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

/** Is the ridge windy enough all year? */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const pic = sceneOn(
      b,
      "pic",
      EnergyScene.WindyRidge,
      "the windy ridge with the old windmill over the well",
    );
    const ask = choiceQuestion(b, {
      prompt: t(
        "Grandpa says the ridge is very windy in summer but calm for most of the winter. What does that mean for a windmill there?",
        "दादाजी कहते हैं कि चोटी गर्मी में बहुत हवादार पर ज़्यादातर सर्दी में शांत रहती है। वहाँ पवनचक्की के लिए इसका क्या अर्थ है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Calm months need back-up, so it can only help, not replace",
            "शांत महीनों में बैक-अप चाहिए, इसलिए यह बस मदद कर सकती है, जगह नहीं ले सकती",
          ),
        },
        {
          id: "store",
          label: t(
            "Summer wind can be stored in the blades for the winter",
            "गर्मी की हवा पंखुड़ियों में सर्दी के लिए संचित की जा सकती है",
          ),
          feedback: t(
            "Blades can't store energy. Calm spells need back-up such as storage cells, or another source.",
            "पंखुड़ियाँ ऊर्जा संचित नहीं कर सकतीं। शांत समय के लिए संचायक सेल जैसा बैक-अप या कोई दूसरा स्रोत चाहिए।",
          ),
        },
        {
          id: "fine",
          label: t(
            "It will give full power all year, since wind is renewable",
            "यह साल भर पूरी शक्ति देगी, क्योंकि पवन नवीकरणीय है",
          ),
          feedback: t(
            "Renewable doesn't mean steady. Farms need wind for most of the year, faster than 15 km/h.",
            "नवीकरणीय का अर्थ स्थिर नहीं। फ़ार्मों को साल के ज़्यादातर समय 15 km/h से तेज़ हवा चाहिए।",
          ),
        },
      ],
      answer: "right",
    });
    const note = w.body(
      t(
        "Riya notes: **wind only as a help in summer, with batteries; not the main source.** The village needs something that works every day. Stop 5 done.",
        "रिया लिखती है: **पवन केवल गर्मी में मदद के रूप में, बैटरियों के साथ; मुख्य स्रोत नहीं।** गाँव को कुछ ऐसा चाहिए जो हर दिन काम करे। पड़ाव 5 पूरा।",
      ),
      "note",
      { isHidden: true },
    );
    b.when(ask.on(QuestionSignal.Correct), theBoard.show(note));
    return column([w.title(t("Wind for the village?", "गाँव के लिए पवन?")), pic, ask, note, space()]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Exercise 6(a) and the wind numbers, then the mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const q1 = choiceQuestion(b, {
      name: "q1",
      prompt: t(
        "Which is a limitation of extracting energy from the wind?",
        "पवन से ऊर्जा निकालने की एक सीमा कौन-सी है?",
      ),
      options: [
        {
          id: "right",
          label: t("It needs steady wind above 15 km/h", "इसे 15 km/h से ऊपर स्थिर हवा चाहिए"),
        },
        {
          id: "smoke",
          label: t("It gives off smoke as the blades turn", "पंखुड़ियाँ घूमते समय धुआँ निकलता है"),
          feedback: t(
            "Windmills burn nothing, so there is no smoke. Their limits: steady wind, land, back-up, cost and upkeep.",
            "पवनचक्कियाँ कुछ नहीं जलातीं, इसलिए धुआँ नहीं। इनकी सीमाएँ: स्थिर हवा, ज़मीन, बैक-अप, ख़र्च और रखरखाव।",
          ),
        },
        {
          id: "run",
          label: t("Its wind will one day be used up", "इसकी हवा एक दिन ख़त्म हो जाएगी"),
          feedback: t(
            "Wind is renewable: the Sun keeps making it. The limits are about where and when it blows.",
            "पवन नवीकरणीय है: सूर्य उसे बनाता रहता है। सीमाएँ इस बारे में हैं कि हवा कहाँ और कब चलती है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const q2 = choiceQuestion(b, {
      name: "q2",
      prompt: t(
        "A village wants a 5 MW wind farm. About how much land will it need?",
        "एक गाँव 5 MW का पवन फ़ार्म चाहता है। उसे लगभग कितनी ज़मीन चाहिए?",
      ),
      options: [
        { id: "right", label: t("10 hectares", "10 हेक्टेयर") },
        {
          id: "five",
          label: t("5 hectares", "5 हेक्टेयर"),
          feedback: t(
            "Each MW needs about 2 hectares: 5 × 2 = 10 hectares.",
            "हर MW को लगभग 2 हेक्टेयर चाहिए: 5 × 2 = 10 हेक्टेयर।",
          ),
        },
        {
          id: "two",
          label: t("2.5 hectares", "2.5 हेक्टेयर"),
          feedback: t(
            "Multiply, don't divide: 5 MW × 2 hectares per MW = 10 hectares.",
            "गुणा करो, भाग नहीं: 5 MW × 2 हेक्टेयर प्रति MW = 10 हेक्टेयर।",
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
        "**Mission log.** ✓ Unequal heating by the Sun makes wind; a windmill turns a generator. ✓ One mill is small, so a wind farm couples many. ✗ It needs wind most of the year, faster than 15 km/h, back-up, about 2 hectares per MW, a high set-up cost and much upkeep. Next stop: the Sun beating down on the school roof.",
        "**मिशन लॉग।** ✓ सूर्य के असमान तापन से पवन बनती है; पवनचक्की जनित्र घुमाती है। ✓ एक चक्की छोटी है, इसलिए पवन फ़ार्म कई को जोड़ता है। ✗ इसे साल के ज़्यादातर समय 15 km/h से तेज़ हवा, बैक-अप, प्रति MW लगभग 2 हेक्टेयर, ऊँचा स्थापना ख़र्च और बहुत रखरखाव चाहिए। अगला पड़ाव: स्कूल की छत पर तपता सूरज।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(q2.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), q1, q2, log, space()]);
  },
  { passOn: PassOn.Rules },
);

export const overview = [hook, windmill, farmPage, inLife, yourTurn];

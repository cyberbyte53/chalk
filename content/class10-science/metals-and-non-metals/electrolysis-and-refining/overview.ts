import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  ExtractMetal,
  FlowAction,
  OreKind,
  RefiningAction,
  extractionFlowDef,
  refiningCellDef,
} from "@chalk/prop-chemistry";
import { MetalSceneKind, ce, sceneOn } from "../kit";

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const jeweller = sceneOn(
    b,
    "jeweller",
    MetalSceneKind.Jeweller,
    "the jeweller at his counter with his balance, Mom and Riya listening",
  );
  return column([
    w.title(t("Too reactive for carbon", "कार्बन के लिए बहुत क्रियाशील")),
    jeweller,
    w.body(
      t(
        'Riya asks the jeweller the obvious next question: **"If carbon gets zinc and iron out, why not aluminium or sodium?"** And Kabir asks his own: "Is the gold you sell exactly as it came out of the ground?" The jeweller smiles: "Both answers need electricity."',
        'रिया सुनार से अगला सीधा सवाल पूछती है: **"अगर कार्बन ज़िंक और लोहा निकाल लेता है, तो ऐलुमिनियम या सोडियम क्यों नहीं?"** और कबीर अपना पूछता है: "आप जो सोना बेचते हैं, क्या वह ठीक वैसा ही है जैसा ज़मीन से निकला था?" सुनार मुस्कराता है: "दोनों जवाबों में बिजली लगती है।"',
      ),
    ),
    w.body(
      t(
        "Clue 8: how are the most reactive metals extracted, and how are metals made pure?",
        "सुराग 8: सबसे अधिक क्रियाशील धातुएँ कैसे निकाली जाती हैं, और धातुओं को शुद्ध कैसे बनाया जाता है?",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Electrolytic reduction of molten chlorides; aluminium from its oxide. */
const top = page(
  "top",
  (b) => {
    const w = wordsOn(b);
    const flow = b.prop(extractionFlowDef, "flow", {
      metal: ExtractMetal.Sodium,
      ore: OreKind.Sulphide,
      step: 0,
      canStep: true,
      showSeries: true,
      metals: [ExtractMetal.Sodium, ExtractMetal.Magnesium, ExtractMetal.Aluminium],
    });
    b.studentOnly(flow.action(FlowAction.Next));
    b.studentOnly(flow.action(FlowAction.ChooseMetal));
    b.standsFor(
      flow,
      "the path for sodium, magnesium or aluminium: the ore is melted and electricity passed through it; the metal collects at the cathode",
    );
    const carbon = choiceQuestion(b, {
      name: "carbon",
      prompt: t(
        "Why can't carbon reduce sodium oxide or aluminium oxide to the metal?",
        "कार्बन सोडियम ऑक्साइड या ऐलुमिनियम ऑक्साइड को धातु में अपचयित क्यों नहीं कर सकता?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "These metals have more affinity for oxygen than carbon has",
            "इन धातुओं का ऑक्सीजन के प्रति आकर्षण कार्बन से अधिक है",
          ),
        },
        {
          id: "hot",
          label: t("Carbon would melt first", "कार्बन पहले पिघल जाएगा"),
          feedback: t(
            "It's about which holds oxygen more strongly: the metal wins, so carbon can't pull the oxygen away.",
            "बात यह है कि ऑक्सीजन को कौन अधिक कसकर पकड़ता है: धातु जीतती है, इसलिए कार्बन ऑक्सीजन को नहीं खींच सकता।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Metals at the top of the series", "श्रेणी में सबसे ऊपर की धातुएँ")),
      w.body(
        t(
          "Sodium, magnesium, calcium and aluminium hold on to oxygen **more strongly than carbon does**, so heating their oxides with carbon gets nowhere.",
          "सोडियम, मैग्नीशियम, कैल्शियम और ऐलुमिनियम ऑक्सीजन को **कार्बन से अधिक कसकर** पकड़ते हैं, इसलिए उनके ऑक्साइड को कार्बन के साथ गर्म करने से कुछ नहीं होता।",
        ),
      ),
      w.definition(
        t(
          "**Electrolytic reduction.** These metals are got by passing electricity through their **molten** compounds: **electrolytic reduction**. Sodium, magnesium and calcium come from their molten **chlorides**. The **cathode** is the negatively charged electrode; the **anode** is the positively charged one. The metal is deposited at the **cathode**, and chlorine is given off at the **anode**.",
          "**विद्युत अपघटनी अपचयन।** ये धातुएँ अपने **पिघले** यौगिकों में से विद्युत गुज़ारकर प्राप्त होती हैं: **विद्युत अपघटनी अपचयन**। सोडियम, मैग्नीशियम और कैल्शियम अपने पिघले **क्लोराइडों** से आते हैं। **कैथोड** ऋणावेशित इलेक्ट्रोड है; **ऐनोड** धनावेशित। धातु **कैथोड** पर जमा होती है, और क्लोरीन **ऐनोड** पर निकलती है।",
        ),
      ),
      flow,
      w.body(t("At the cathode:", "कैथोड पर:")),
      w.body(ce("Na+ + e- -> Na")),
      w.body(t("At the anode:", "ऐनोड पर:")),
      w.body(ce("2Cl- -> Cl2 + 2e-")),
      w.body(
        t(
          "Aluminium is got in the same way, by the electrolytic reduction of aluminium oxide.",
          "ऐलुमिनियम भी इसी तरह, ऐलुमिनियम ऑक्साइड के विद्युत अपघटनी अपचयन से, प्राप्त होता है।",
        ),
      ),
      carbon,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Fig 3.12: electrolytic refining of copper; anode mud. */
const refining = page(
  "refining",
  (b) => {
    const w = wordsOn(b);
    const cell = b.prop(refiningCellDef, "cell", {
      isOn: false,
      progress: 0,
      showLabels: true,
      canSwitch: true,
    });
    b.studentOnly(cell.action(RefiningAction.Switch));
    b.studentOnly(cell.action(RefiningAction.Reset));
    b.standsFor(
      cell,
      "a tank of acidified copper sulphate with a thick impure copper anode and a thin pure copper cathode; switching on, the anode thins, the cathode thickens, copper ions move across, and anode mud settles below the anode",
    );
    const mud = choiceQuestion(b, {
      name: "mud",
      prompt: t("What is anode mud?", "ऐनोड पंक क्या है?"),
      options: [
        {
          id: "right",
          label: t(
            "The insoluble impurities that settle at the bottom under the anode",
            "अघुलनशील अशुद्धियाँ जो ऐनोड के नीचे तली में बैठ जाती हैं",
          ),
        },
        {
          id: "copper",
          label: t("Pure copper that fell off the cathode", "कैथोड से गिरा शुद्ध ताँबा"),
          feedback: t(
            "Pure copper builds up on the cathode. The mud is what's left over from the impure anode.",
            "शुद्ध ताँबा कैथोड पर जमता है। पंक अशुद्ध ऐनोड से बचा हुआ है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Making a metal pure", "धातु को शुद्ध बनाना")),
      w.body(
        t(
          "Metals from all these processes are **not very pure**. The most widely used way to purify them is **electrolytic refining**. Copper, zinc, tin, nickel, **silver and gold** are refined this way. Switch on the cell:",
          "इन सभी प्रक्रमों से मिली धातुएँ **बहुत शुद्ध नहीं** होतीं। उन्हें शुद्ध करने का सबसे अधिक प्रचलित तरीक़ा **विद्युत अपघटनी परिष्करण** है। ताँबा, ज़िंक, टिन, निकेल, **चाँदी और सोना** इसी तरह परिष्कृत किए जाते हैं। सेल चालू करो:",
        ),
      ),
      cell,
      w.definition(
        t(
          "**Electrolytic refining.** The **impure metal** is made the **anode**, and a thin strip of the **pure metal** is made the **cathode**. A solution of a salt of the metal is the **electrolyte** (for copper: acidified copper sulphate). When current flows, metal from the anode **dissolves** into the electrolyte, and an equal amount of **pure metal** from the electrolyte is **deposited** on the cathode. Soluble impurities go into the solution; insoluble impurities settle at the bottom under the anode as **anode mud**.",
          "**विद्युत अपघटनी परिष्करण।** **अशुद्ध धातु** को **ऐनोड** बनाया जाता है, और **शुद्ध धातु** की एक पतली पट्टी को **कैथोड**। उस धातु के किसी लवण का विलयन **विद्युत अपघट्य** होता है (ताँबे के लिए: अम्लीय कॉपर सल्फ़ेट)। धारा बहने पर ऐनोड की धातु विद्युत अपघट्य में **घुलती** है, और उतनी ही **शुद्ध धातु** विद्युत अपघट्य से कैथोड पर **जमा** होती है। घुलनशील अशुद्धियाँ विलयन में चली जाती हैं; अघुलनशील अशुद्धियाँ ऐनोड के नीचे तली में **ऐनोड पंक** के रूप में बैठ जाती हैं।",
        ),
      ),
      mud,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const sold = choiceQuestion(b, {
      name: "sold",
      prompt: t(
        "So is the gold in the jeweller's shop exactly as it came out of the ground?",
        "तो क्या सुनार की दुकान का सोना ठीक वैसा ही है जैसा ज़मीन से निकला था?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "No: it has been refined electrolytically, with impure gold as the anode and pure gold building up on the cathode",
            "नहीं: इसका विद्युत अपघटनी परिष्करण हुआ है, जिसमें अशुद्ध सोना ऐनोड था और शुद्ध सोना कैथोड पर जमा",
          ),
        },
        {
          id: "yes",
          label: t("Yes: native gold is already pure", "हाँ: प्राकृत सोना पहले से शुद्ध है"),
          feedback: t(
            "Native gold is found as the metal, but still with impurities. It's refined before use.",
            "प्राकृत सोना धातु के रूप में मिलता है, पर फिर भी अशुद्धियों के साथ। उपयोग से पहले उसका परिष्करण होता है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const back = choiceQuestion(b, {
      name: "back",
      prompt: t(
        "The gold the fake goldsmith dissolved is now in his bowl as a solution. Could he get it back as metal?",
        "नक़ली सुनार ने जो सोना घोला, वह अब उसके कटोरे में विलयन के रूप में है। क्या वह उसे वापस धातु के रूप में पा सकता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Yes: gold is so unreactive that it is easily recovered from the solution, for example by displacement with a more reactive metal",
            "हाँ: सोना इतना अक्रियाशील है कि विलयन से आसानी से वापस मिल जाता है, जैसे किसी अधिक क्रियाशील धातु से विस्थापन द्वारा",
          ),
        },
        {
          id: "lost",
          label: t("No, it's gone for ever", "नहीं, यह हमेशा के लिए गया"),
          feedback: t(
            "Remember Kabir's nails: a more reactive metal displaces a less reactive one. Every metal is above gold.",
            "कबीर की कीलें याद करो: अधिक क्रियाशील धातु कम क्रियाशील को विस्थापित करती है। हर धातु सोने से ऊपर है।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const notes = w.definition(
      t(
        "**Case notes.** ✓ The fake goldsmith's trick was profitable: the gold he dissolved could be recovered from his solution. ✓ Gold is refined electrolytically before it is sold. ? Why is jewellery 22 carat and not pure gold? Last clue: corrosion and alloys.",
        "**केस नोट्स।** ✓ नक़ली सुनार की चाल फ़ायदे की थी: उसने जो सोना घोला, वह उसके विलयन से वापस निकाला जा सकता था। ✓ बेचने से पहले सोने का विद्युत अपघटनी परिष्करण होता है। ? गहने 22 कैरेट के क्यों होते हैं, शुद्ध सोने के क्यों नहीं? आख़िरी सुराग: संक्षारण और मिश्रातु।",
      ),
      "notes",
      { isHidden: true },
    );
    b.when(sold.on(QuestionSignal.Correct), theBoard.show(back));
    b.when(back.on(QuestionSignal.Correct), [theBoard.show(notes), theBoard.pass()]);
    return column([w.title(t("The jeweller's gold", "सुनार का सोना")), sold, back, notes, space()]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Exercise 8. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const setup = choiceQuestion(b, {
      name: "setup",
      prompt: t(
        "In the electrolytic refining of a metal M, what do you take as the anode, the cathode and the electrolyte?",
        "किसी धातु M के विद्युत अपघटनी परिष्करण में ऐनोड, कैथोड और विद्युत अपघट्य किसे लेते हो?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Anode: impure M. Cathode: a thin strip of pure M. Electrolyte: a solution of a salt of M",
            "ऐनोड: अशुद्ध M। कैथोड: शुद्ध M की पतली पट्टी। विद्युत अपघट्य: M के किसी लवण का विलयन",
          ),
        },
        {
          id: "swap",
          label: t(
            "Anode: pure M. Cathode: impure M. Electrolyte: water",
            "ऐनोड: शुद्ध M। कैथोड: अशुद्ध M। विद्युत अपघट्य: पानी",
          ),
          feedback: t(
            "The impure metal dissolves away, so it must be the anode; pure metal collects on the cathode. And the solution must contain the metal's ions.",
            "अशुद्ध धातु घुलकर जाती है, इसलिए वह ऐनोड होनी चाहिए; शुद्ध धातु कैथोड पर जमती है। और विलयन में धातु के आयन होने चाहिए।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const cathode = choiceQuestion(b, {
      name: "cathode",
      prompt: t(
        "In the electrolysis of molten sodium chloride, what is given off at the anode?",
        "पिघले सोडियम क्लोराइड के विद्युत अपघटन में ऐनोड पर क्या निकलता है?",
      ),
      options: [
        { id: "right", label: t("Chlorine gas", "क्लोरीन गैस") },
        {
          id: "na",
          label: t("Sodium metal", "सोडियम धातु"),
          feedback: t(
            "Sodium is deposited at the cathode, the negative electrode.",
            "सोडियम कैथोड, यानी ऋण इलेक्ट्रोड, पर जमा होता है।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const notes = w.definition(
      t(
        "**Case notes.** ✓ Top metals (K, Na, Ca, Mg, Al): electrolysis of the molten compound; metal at the cathode. ✓ Refining: impure anode, pure cathode, salt solution, anode mud. Last clue: corrosion and alloys.",
        "**केस नोट्स।** ✓ ऊपर की धातुएँ (K, Na, Ca, Mg, Al): पिघले यौगिक का विद्युत अपघटन; धातु कैथोड पर। ✓ परिष्करण: अशुद्ध ऐनोड, शुद्ध कैथोड, लवण विलयन, ऐनोड पंक। आख़िरी सुराग: संक्षारण और मिश्रातु।",
      ),
      "notes",
      { isHidden: true },
    );
    b.when(setup.on(QuestionSignal.Correct), theBoard.show(cathode));
    b.when(cathode.on(QuestionSignal.Correct), [theBoard.show(notes), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), setup, cathode, notes, space()]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [hook, top, refining, inLife, yourTurn];

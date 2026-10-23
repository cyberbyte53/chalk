import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  CircuitSymbol,
  ElectricityScene,
  SymbolsAction,
  SymbolsMode,
  circuitSymbolsDef,
} from "@chalk/prop-electricity";
import { figure121, sceneOn } from "../kit";

/* Hook */

const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const pic = sceneOn(
    b,
    "pic",
    ElectricityScene.MessyWiring,
    "a switchboard on the wall with tangled red and green wires behind it; Kabir holds up a messy drawing of it and Riya a neat diagram",
  );
  return column([
    w.title(t("Drawing it quickly", "जल्दी से बनाना")),
    pic,
    w.body(
      t(
        "To find where the electricity goes, Riya and Kabir decide to map every circuit in the house. Kabir starts drawing the switchboard as it looks: wires, screws, the plastic cover. Twenty minutes later he has one messy picture. Riya draws the same thing in a minute with a few neat signs. How? Third stop: **circuit diagrams**.",
        "बिजली कहाँ जाती है यह जानने के लिए रिया और कबीर घर के हर परिपथ का नक्शा बनाने का तय करते हैं। कबीर स्विचबोर्ड को जैसा दिखता है वैसा बनाने लगता है: तार, पेंच, प्लास्टिक का ढक्कन। बीस मिनट बाद उसके पास एक उलझा हुआ चित्र है। रिया वही चीज़ कुछ साफ़ निशानों से एक मिनट में बना देती है। कैसे? तीसरा पड़ाव: **परिपथ आरेख**।",
      ),
    ),
    space(),
  ]);
});

/* Learn */

/** Table 12.1: the symbols. */
const symbols = page(
  "symbols",
  (b) => {
    const w = wordsOn(b);
    const table = b.prop(circuitSymbolsDef, "table", { mode: SymbolsMode.Table });
    b.standsFor(table, "NCERT Table 12.1: the eleven circuit symbols, each with its name");
    const ask = choiceQuestion(b, {
      prompt: t(
        "In the symbol for a cell, which line is the positive (+) terminal?",
        "सेल के प्रतीक में कौन-सी रेखा धनात्मक (+) सिरा है?",
      ),
      options: [
        { id: "right", label: t("The longer, thinner line", "लंबी, पतली रेखा") },
        {
          id: "short",
          label: t("The shorter, thicker line", "छोटी, मोटी रेखा"),
          feedback: t(
            "The short thick line is the negative terminal. The long line is +.",
            "छोटी मोटी रेखा ऋणात्मक सिरा है। लंबी रेखा + है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("The symbols", "प्रतीक")),
      w.definition(
        t(
          "**Circuit diagram.** A **circuit diagram** is a drawing of a circuit in which each part is shown by an agreed **symbol** instead of a picture, joined by straight lines for the connecting wires. Everyone uses the same symbols, so anyone can read anyone's diagram.",
          "**परिपथ आरेख।** **परिपथ आरेख** परिपथ का ऐसा चित्र है जिसमें हर भाग को चित्र की जगह एक तय **प्रतीक** से दिखाया जाता है, और जोड़ने वाले तारों को सीधी रेखाओं से। सब एक ही प्रतीक इस्तेमाल करते हैं, इसलिए कोई भी किसी का भी आरेख पढ़ सकता है।",
        ),
      ),
      table,
      w.note(
        t(
          "In the cell symbol the long line is the + terminal and the short, thick line the − terminal. A battery is several cells drawn side by side. A **rheostat** is a resistor whose resistance can be changed: you'll meet it at stop 4.",
          "सेल के प्रतीक में लंबी रेखा + सिरा है और छोटी मोटी रेखा − सिरा। बैटरी कई सेलों को अगल-बगल बनाकर दिखाई जाती है। **धारा नियंत्रक** (रिओस्टेट) ऐसा प्रतिरोधक है जिसका प्रतिरोध बदला जा सकता है: पड़ाव 4 में मिलेगा।",
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** A tap-to-reveal quiz on the symbols. */
const quiz = page(
  "quiz",
  (b) => {
    const w = wordsOn(b);
    const cards = b.prop(circuitSymbolsDef, "cards", {
      mode: SymbolsMode.Quiz,
      symbols: [
        CircuitSymbol.KeyClosed,
        CircuitSymbol.Crossing,
        CircuitSymbol.Joint,
        CircuitSymbol.Rheostat,
        CircuitSymbol.Voltmeter,
        CircuitSymbol.Battery,
      ],
      revealed: [],
    });
    b.studentOnly(cards.action(SymbolsAction.Reveal));
    b.studentOnly(cards.action(SymbolsAction.Reset));
    b.standsFor(
      cards,
      "six circuit symbols with their names hidden; tapping a symbol shows its name",
    );
    const ask = choiceQuestion(b, {
      prompt: t(
        "Two wires are drawn crossing. How does the diagram show that they are **not** joined?",
        "दो तार एक-दूसरे को काटते हुए बने हैं। आरेख कैसे दिखाता है कि वे **जुड़े नहीं** हैं?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "One wire hops over the other with a little bend, and there's no dot",
            "एक तार छोटे मोड़ से दूसरे के ऊपर से कूदता है, और कोई बिंदु नहीं होता",
          ),
        },
        {
          id: "dot",
          label: t("A dot where they cross", "जहाँ वे काटते हैं वहाँ एक बिंदु"),
          feedback: t(
            "A dot means a joint: the wires are connected there.",
            "बिंदु का अर्थ जोड़ है: तार वहाँ जुड़े हैं।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Test yourself", "ख़ुद को परखो")),
      w.body(
        t(
          "Say each name to yourself, then tap the symbol to check.",
          "हर नाम मन में बोलो, फिर जाँचने के लिए प्रतीक को टैप करो।",
        ),
      ),
      cards,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Reading a diagram: Fig 12.1 again. */
const reading = page(
  "reading",
  (b) => {
    const w = wordsOn(b);
    const c = figure121(b, "circuit", { isClosed: false });
    b.standsFor(
      c,
      "Fig 12.1 as a circuit diagram: a cell, a bulb, an ammeter and an open plug key in one loop",
    );
    const ask = choiceQuestion(b, {
      prompt: t(
        "In this diagram, is the switch open or closed, and how can you tell?",
        "इस आरेख में स्विच खुला है या बंद, और तुम कैसे बता सकते हो?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Open: its arm is lifted, leaving a gap in the line",
            "खुला: उसकी भुजा उठी हुई है, जिससे रेखा में खाली जगह है",
          ),
        },
        {
          id: "closed",
          label: t("Closed: the line runs through it", "बंद: रेखा उसमें से होकर जाती है"),
          feedback: t(
            "Look at the bottom wire: the switch's arm is tilted up and doesn't touch the far side. Tap it and watch it close.",
            "नीचे का तार देखो: स्विच की भुजा ऊपर झुकी है और दूसरी तरफ़ को नहीं छूती। टैप करो और इसे बंद होते देखो।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Reading a diagram", "आरेख पढ़ना")),
      w.body(
        t(
          "Read a diagram by following the loop from the cell's + terminal, naming each symbol you pass. This is NCERT's Fig. 12.1: from the cell, through the bulb, through the ammeter, through the plug key, and back to the cell. Tap the switch to close it.",
          "आरेख पढ़ने के लिए सेल के + सिरे से लूप का पीछा करो, रास्ते में मिलने वाले हर प्रतीक का नाम लेते हुए। यह NCERT का चित्र 12.1 है: सेल से, बल्ब से होकर, ऐमीटर से होकर, प्लग कुंजी से होकर, वापस सेल तक। स्विच को टैप करके उसे बंद करो।",
        ),
      ),
      c,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* See it in life */

const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const pic = sceneOn(
      b,
      "pic",
      ElectricityScene.MessyWiring,
      "the switchboard with Kabir's messy drawing and Riya's neat diagram",
    );
    const ask = choiceQuestion(b, {
      prompt: t(
        "Kabir redraws his torch as a diagram: two cells, a slide switch and a bulb in one loop. Which symbols does he need?",
        "कबीर अपनी टॉर्च को आरेख की तरह फिर बनाता है: एक लूप में दो सेल, एक स्लाइड स्विच और एक बल्ब। उसे कौन-से प्रतीक चाहिए?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "A battery of two cells, a key (switch) and a bulb, joined by lines",
            "दो सेलों की बैटरी, एक कुंजी (स्विच) और एक बल्ब, रेखाओं से जुड़े",
          ),
        },
        {
          id: "meters",
          label: t("A battery, an ammeter and a voltmeter", "एक बैटरी, एक ऐमीटर और एक वोल्टमीटर"),
          feedback: t(
            "A torch has no meters in it. Draw only what's really in the circuit.",
            "टॉर्च में कोई मीटर नहीं होता। केवल वही बनाओ जो सचमुच परिपथ में है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const done = w.body(
      t(
        "With symbols, Kabir maps the torch, the doorbell and the switchboard in ten minutes. Now they can talk about any circuit in the house on one page.",
        "प्रतीकों से कबीर दस मिनट में टॉर्च, घंटी और स्विचबोर्ड का नक्शा बना लेता है। अब वे घर के किसी भी परिपथ पर एक पन्ने में बात कर सकते हैं।",
      ),
      "done",
      { isHidden: true },
    );
    b.when(ask.on(QuestionSignal.Correct), [theBoard.show(done), theBoard.pass()]);
    return column([
      w.title(t("Kabir tries again", "कबीर फिर कोशिश करता है")),
      pic,
      ask,
      done,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* Practice */

const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const cells = choiceQuestion(b, {
      name: "cells",
      prompt: t(
        "A circuit has a battery of three cells of 2 V each, a 5 Ω resistor, an 8 Ω resistor, a 12 Ω resistor and a plug key, all in one loop. How many resistor symbols does its diagram have?",
        "एक परिपथ में 2 V के तीन सेलों की बैटरी, 5 Ω, 8 Ω और 12 Ω के प्रतिरोधक और एक प्लग कुंजी, सब एक लूप में हैं। उसके आरेख में कितने प्रतिरोधक प्रतीक होंगे?",
      ),
      options: [
        { id: "right", label: t("3", "3") },
        {
          id: "six",
          label: t("6", "6"),
          feedback: t(
            "That counts the cells too. Cells have their own symbol; there are three resistors.",
            "इसमें सेल भी गिन लिए। सेलों का अपना प्रतीक है; प्रतिरोधक तीन हैं।",
          ),
        },
        {
          id: "one",
          label: t("1", "1"),
          feedback: t(
            "Each resistor gets its own symbol, labelled with its value.",
            "हर प्रतिरोधक का अपना प्रतीक होता है, उसके मान के साथ।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ A circuit diagram uses agreed symbols for cells, keys, bulbs, resistors and meters. ✓ Read it by following the loop from the cell's + terminal. Next stop: how much current a given push drives, and what holds it back.",
        "**मिशन लॉग।** ✓ परिपथ आरेख सेल, कुंजी, बल्ब, प्रतिरोधक और मीटरों के लिए तय प्रतीकों का उपयोग करता है। ✓ इसे सेल के + सिरे से लूप का पीछा करके पढ़ो। अगला पड़ाव: कोई धक्का कितनी धारा बहाता है, और उसे क्या रोकता है।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(cells.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), cells, log, space()]);
  },
  { passOn: PassOn.Rules },
);

export const overview = [hook, symbols, quiz, reading, inLife, yourTurn];

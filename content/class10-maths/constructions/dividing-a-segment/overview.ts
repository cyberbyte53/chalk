import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import { CirclesSceneKind, ConstructionKind } from "@chalk/prop-circles";
import { constructionOn, sceneOn } from "../kit";

const r = String.raw;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** The poster is next: Riya draws it with compass and ruler, starting with a tube split 3 : 2. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const desk = sceneOn(
    b,
    "desk",
    CirclesSceneKind.CompassBox,
    "Riya at the study table with an open geometry box, drawing with a compass beside the chart paper",
  );
  return column([
    w.title(t("Drawing the poster", "पोस्टर बनाना")),
    desk,
    w.body(
      t(
        'The tangent chapter told Riya and Kabir **why** a cycle\'s chain and wheels touch the way they do. Now the poster "How a cycle works" has to be drawn, and the science teacher has one rule: **compass and ruler only**, every line exact, no guessing.',
        'स्पर्श रेखा वाले अध्याय ने रिया और कबीर को बताया कि साइकिल की चेन और पहिए **क्यों** वैसे छूते हैं। अब "साइकिल कैसे चलती है" पोस्टर बनाना है, और विज्ञान की टीचर का एक नियम है: **सिर्फ़ परकार और रूलर**, हर रेखा सटीक, कोई अंदाज़ा नहीं।',
      ),
    ),
    w.definition(
      t(
        "**The stops on the way.** (1) Splitting a frame tube in a given ratio: *this lesson*. (2) Copying Kabir's sketch smaller, for the handout. (3) Copying it larger, for the poster. (4) Drawing the chain's straight runs as tangents to the sprockets.",
        "**रास्ते के पड़ाव।** (1) फ़्रेम की एक नली को दिए गए अनुपात में बाँटना: *यह पाठ*। (2) कबीर के स्केच की छोटी नक़ल, पर्चे के लिए। (3) उसकी बड़ी नक़ल, पोस्टर के लिए। (4) चेन के सीधे हिस्सों को स्प्रॉकेट की स्पर्श रेखाओं की तरह खींचना।",
      ),
    ),
    w.body(
      t(
        "First job: the frame's top tube must be marked so the seat post joins it at a point that splits it **3 : 2**. Riya's ruler is old and its millimetre marks have worn away. How can she find that point exactly, without measuring?",
        "पहला काम: फ़्रेम की ऊपरी नली पर वह बिंदु चिह्नित करना है जहाँ सीट वाली नली जुड़ती है, जो उसे **3 : 2** में बाँटे। रिया का रूलर पुराना है और उसके मिलीमीटर के निशान घिस गए हैं। बिना नापे वह बिंदु ठीक-ठीक कैसे मिले?",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** The words this chapter leans on, and the BPT recalled. */
const words = page("words", (b) => {
  const w = wordsOn(b);
  return column([
    w.title(t("What a construction is", "रचना क्या है")),
    w.definition(
      t(
        "**Construction.** A **construction** is a drawing made with only a **ruler** (a straight edge, for drawing lines) and a **compass** (for drawing circles and arcs, and for copying a length). Every step must be one of these two moves, and each construction comes with a **justification**: the reason it gives exactly what we wanted.",
        "**रचना।** **रचना** ऐसी आकृति है जो केवल **रूलर** (सीधा किनारा, रेखाएँ खींचने के लिए) और **परकार** (वृत्त और चाप खींचने, और कोई लंबाई उतारने के लिए) से बनाई जाए। हर चरण इन्हीं दो में से एक होना चाहिए, और हर रचना के साथ एक **औचित्य** होता है: वह कारण कि इससे ठीक वही क्यों मिलता है जो हमें चाहिए।",
      ),
    ),
    w.definition(
      t(
        "**Dividing in a ratio.** A point C on a segment AB **divides AB in the ratio m : n** if AC : CB = m : n. Here m and n are positive whole numbers. For 3 : 2, AC is three equal parts and CB is two of the same parts.",
        "**अनुपात में बाँटना।** रेखाखंड AB पर बिंदु C, **AB को m : n में बाँटता है** यदि AC : CB = m : n हो। यहाँ m और n धनात्मक पूर्ण संख्याएँ हैं। 3 : 2 के लिए AC तीन बराबर भाग है और CB उन्हीं में से दो भाग।",
      ),
    ),
    w.definition(
      t(
        r`**Recall: the basic proportionality theorem (Chapter 6).** If a line is drawn parallel to one side of a triangle, cutting the other two sides, it divides those two sides in the same ratio. In $\triangle AXB$, a line parallel to XB cutting AX at P and AB at C gives $$\frac{AP}{PX} = \frac{AC}{CB}$$`,
        r`**याद करो: आधारभूत समानुपातिकता प्रमेय (अध्याय 6)।** यदि त्रिभुज की एक भुजा के समांतर रेखा बाक़ी दो भुजाओं को काटे, तो वह उन दोनों को एक ही अनुपात में बाँटती है। $\triangle AXB$ में, XB के समांतर रेखा AX को P पर और AB को C पर काटे, तो $$\frac{AP}{PX} = \frac{AC}{CB}$$`,
      ),
    ),
    w.body(
      t(
        "So the plan: make equal steps along a spare ray, where equal lengths are easy to copy with a compass, and let a parallel line carry the ratio across to AB.",
        "तो योजना यह: एक अलग किरण पर बराबर कदम बनाओ, जहाँ परकार से बराबर लंबाई उतारना आसान है, और एक समांतर रेखा उस अनुपात को AB तक पहुँचा दे।",
      ),
    ),
    space(),
  ]);
});

/** Construction 11.1, stepped, then the justification by the BPT. */
const construct = page(
  "construct",
  (b) => {
    const w = wordsOn(b);
    const { figure, goal } = constructionOn(
      b,
      "divide",
      { kind: ConstructionKind.Divide, length: 7.6, m: 3, n: 2 },
      "Construction 11.1 on AB = 7.6 cm, ratio 3 : 2, drawn step by step: ray AX, five equal compass steps A₁ to A₅, A₅B joined, the parallel through A₃ meeting AB at C",
      t(
        "Tap next to make each step, until C is found.",
        "हर चरण बनाने के लिए आगे दबाओ, जब तक C न मिल जाए।",
      ),
    );
    const why = w.body(
      t(
        r`**Why it works.** A₃C was drawn parallel to A₅B, so in $\triangle AA_5B$, by the basic proportionality theorem, $$\frac{AA_3}{A_3A_5} = \frac{AC}{CB}$$ By construction, AA₃ is 3 equal steps and A₃A₅ is 2 of them, so $$\frac{AA_3}{A_3A_5} = \frac{3}{2}$$ Therefore $$\frac{AC}{CB} = \frac{3}{2}$$ So C divides AB in the ratio 3 : 2.`,
        r`**यह क्यों काम करता है।** A₃C को A₅B के समांतर खींचा, तो $\triangle AA_5B$ में, आधारभूत समानुपातिकता प्रमेय से, $$\frac{AA_3}{A_3A_5} = \frac{AC}{CB}$$ रचना से, AA₃ तीन बराबर कदम है और A₃A₅ उनमें से दो, इसलिए $$\frac{AA_3}{A_3A_5} = \frac{3}{2}$$ अतः $$\frac{AC}{CB} = \frac{3}{2}$$ यानी C, AB को 3 : 2 में बाँटता है।`,
      ),
      "why",
      { isHidden: true },
    );
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(why));
    return column([
      w.title(t("Construction 11.1: divide AB in m : n", "रचना 11.1: AB को m : n में बाँटो")),
      w.body(
        t(
          r`Take AB = 7.6 cm and the ratio 3 : 2. The steps, in the textbook's words: draw any ray AX making an acute angle with AB; mark $3 + 2 = 5$ equal steps on it; join the last mark to B; through the 3rd mark, draw a line parallel to that join. (In the exam AB is given, e.g. 7.6 cm. Riya's tube is just whatever length she drew.)`,
          r`AB = 7.6 cm और अनुपात 3 : 2 लो। पाठ्यपुस्तक के शब्दों में चरण: AB के साथ न्यून कोण बनाती कोई किरण AX खींचो; उस पर $3 + 2 = 5$ बराबर कदम लगाओ; आख़िरी निशान को B से मिलाओ; तीसरे निशान से उस जोड़ के समांतर रेखा खींचो। (परीक्षा में AB दिया होता है, जैसे 7.6 cm। रिया की नली बस उतनी लंबी है जितनी उसने खींची।)`,
        ),
      ),
      figure,
      goal,
      why,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The alternative method: two parallel rays, justified by similar triangles. */
const alternative = page(
  "alternative",
  (b) => {
    const w = wordsOn(b);
    const { figure, goal } = constructionOn(
      b,
      "alt",
      { kind: ConstructionKind.DivideAlt, length: 7.6, m: 3, n: 2 },
      "the alternative method on AB = 7.6 cm, ratio 3 : 2: ray AX, ray BY parallel to it, three equal steps on AX and two on BY, A₃B₂ joined, meeting AB at C",
      t("Tap next through the alternative method.", "वैकल्पिक विधि के चरणों में आगे बढ़ो।"),
    );
    const why = w.body(
      t(
        r`**Why it works.** In $\triangle AA_3C$ and $\triangle BB_2C$: $\angle A_3AC = \angle B_2BC$, because AX ∥ BY makes them alternate angles; and $\angle ACA_3 = \angle BCB_2$, because they are vertically opposite. So by AA similarity, $$\triangle AA_3C \sim \triangle BB_2C$$ which gives $$\frac{AC}{BC} = \frac{AA_3}{BB_2} = \frac{3}{2}$$`,
        r`**यह क्यों काम करता है।** $\triangle AA_3C$ और $\triangle BB_2C$ में: $\angle A_3AC = \angle B_2BC$, क्योंकि AX ∥ BY होने से ये एकांतर कोण हैं; और $\angle ACA_3 = \angle BCB_2$, क्योंकि ये शीर्षाभिमुख कोण हैं। तो AA समरूपता से, $$\triangle AA_3C \sim \triangle BB_2C$$ जिससे $$\frac{AC}{BC} = \frac{AA_3}{BB_2} = \frac{3}{2}$$`,
      ),
      "why",
      { isHidden: true },
    );
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(why));
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "In the alternative method for 3 : 2, how many equal steps go on each ray?",
        "3 : 2 की वैकल्पिक विधि में, हर किरण पर कितने बराबर कदम लगते हैं?",
      ),
      options: [
        { id: "right", label: t("3 on AX and 2 on BY", "AX पर 3 और BY पर 2") },
        {
          id: "five",
          label: t("5 on AX and none on BY", "AX पर 5 और BY पर कोई नहीं"),
          feedback: t(
            "That's the first method. Here each ray carries its own part of the ratio.",
            "वह पहली विधि है। यहाँ हर किरण अनुपात का अपना हिस्सा लेती है।",
          ),
        },
        {
          id: "swap",
          label: t("2 on AX and 3 on BY", "AX पर 2 और BY पर 3"),
          feedback: t(
            "Then C would be nearer A, giving AC : CB = 2 : 3. The 3 goes on A's ray.",
            "तब C, A के पास होता और AC : CB = 2 : 3 बनता। 3 कदम A वाली किरण पर लगते हैं।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    return column([
      w.title(t("Another way: two parallel rays", "दूसरा तरीक़ा: दो समांतर किरणें")),
      w.body(
        t(
          "Draw ray AX at an acute angle to AB, and ray BY on the other side, parallel to AX (make ∠ABY equal to ∠BAX). Mark 3 equal steps on AX and 2 steps of the same size on BY. Join A₃ to B₂: where it crosses AB is C.",
          "AB के साथ न्यून कोण पर किरण AX खींचो, और दूसरी ओर AX के समांतर किरण BY (∠ABY को ∠BAX के बराबर बनाकर)। AX पर 3 बराबर कदम और BY पर उसी नाप के 2 कदम लगाओ। A₃ को B₂ से मिलाओ: जहाँ यह AB को काटे, वही C है।",
        ),
      ),
      figure,
      goal,
      why,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** Riya's worn ruler: the tube split 3 : 2 without a measurement. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "Riya's top tube is drawn 9 cm long. After the construction for 3 : 2, how long is AC?",
        "रिया की ऊपरी नली 9 cm लंबी खींची है। 3 : 2 की रचना के बाद AC कितना लंबा है?",
      ),
      options: [
        { id: "right", label: t("5.4 cm", "5.4 cm") },
        {
          id: "three",
          label: t("3 cm", "3 cm"),
          feedback: t(
            "3 is the number of parts, not centimetres. AC is 3 parts out of 5: 9 × 3/5.",
            "3 भागों की संख्या है, सेंटीमीटर नहीं। AC, 5 में से 3 भाग है: 9 × 3/5।",
          ),
        },
        {
          id: "third",
          label: t("6 cm", "6 cm"),
          feedback: t(
            "That would be 2 : 1. For 3 : 2 the whole is 5 parts, so AC = 9 × 3/5.",
            "वह 2 : 1 होता। 3 : 2 में पूरा 5 भाग है, तो AC = 9 × 3/5।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("No ruler marks needed", "रूलर के निशान की ज़रूरत नहीं")),
      w.body(
        t(
          "Riya only needs her ruler as a straight edge. She opens the compass to any small width and walks it five times down a spare ray, joins the fifth mark to the tube's far end, and copies that slant through the third mark. The seat post goes exactly where that line meets the tube. Neither the compass width nor the tube's length was ever measured.",
          "रिया को रूलर बस सीधे किनारे की तरह चाहिए। वह परकार को कोई भी छोटी चौड़ाई पर खोलकर एक अलग किरण पर पाँच बार चलाती है, पाँचवें निशान को नली के दूर वाले सिरे से मिलाती है, और वही तिरछापन तीसरे निशान से दोहराती है। सीट वाली नली ठीक वहाँ जुड़ती है जहाँ यह रेखा नली से मिलती है। न परकार की चौड़ाई नापी गई, न नली की लंबाई।",
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Exercise 11.1 Q1: 7.6 cm in 5 : 8. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "Exercise 11.1 Q1: divide a 7.6 cm segment in 5 : 8. How many equal steps go on AX, and through which mark is the parallel drawn?",
        "प्रश्नावली 11.1 प्र.1: 7.6 cm के रेखाखंड को 5 : 8 में बाँटो। AX पर कितने बराबर कदम लगते हैं, और समांतर रेखा किस निशान से खींची जाती है?",
      ),
      options: [
        { id: "right", label: t("13 steps; through A₅", "13 कदम; A₅ से") },
        {
          id: "eight",
          label: t("13 steps; through A₈", "13 कदम; A₈ से"),
          feedback: t(
            "Through A₈ gives AC : CB = 8 : 5. The parallel goes through the mark for the first number, 5.",
            "A₈ से AC : CB = 8 : 5 बनता है। समांतर रेखा पहली संख्या, 5, वाले निशान से जाती है।",
          ),
        },
        {
          id: "eightSteps",
          label: t("8 steps; through A₅", "8 कदम; A₅ से"),
          feedback: t(
            "The steps must cover the whole ratio: 5 + 8 = 13.",
            "कदमों में पूरा अनुपात आना चाहिए: 5 + 8 = 13।",
          ),
        },
      ],
      answer: "right",
    });
    const parts = w.body(
      t(
        r`Measuring the two parts: $$AC = 7.6 \times \frac{5}{13} \approx 2.9 \text{ cm}$$ $$CB = 7.6 \times \frac{8}{13} \approx 4.7 \text{ cm}$$ Justification: as before, by the basic proportionality theorem, $AC : CB = AA_5 : A_5A_{13} = 5 : 8$.`,
        r`दोनों भाग नापने पर: $$AC = 7.6 \times \frac{5}{13} \approx 2.9 \text{ cm}$$ $$CB = 7.6 \times \frac{8}{13} \approx 4.7 \text{ cm}$$ औचित्य: पहले की तरह, आधारभूत समानुपातिकता प्रमेय से, $AC : CB = AA_5 : A_5A_{13} = 5 : 8$।`,
      ),
      "parts",
      { isHidden: true },
    );
    const log = w.definition(
      t(
        "**Mission log.** ✓ The top tube is split 3 : 2, exactly, with a worn-out ruler. ✓ Two ways: one ray with m + n steps, or two parallel rays. Next: Kabir's sketch, copied smaller for the handout.",
        "**मिशन लॉग।** ✓ घिसे रूलर से ही ऊपरी नली ठीक 3 : 2 में बँट गई। ✓ दो तरीक़े: m + n कदमों वाली एक किरण, या दो समांतर किरणें। आगे: कबीर का स्केच, पर्चे के लिए छोटा।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(ask.on(QuestionSignal.Correct), [theBoard.show(parts), theBoard.show(log)]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), ask, parts, log, space()]);
  },
  { passOn: PassOn.Rules },
);

export const overview = [hook, words, construct, alternative, inLife, yourTurn];

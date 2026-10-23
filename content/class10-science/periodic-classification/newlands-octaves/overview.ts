import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { goalQuestion, wordsOn } from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import { OctaveAction, PeriodicScene, octaveTableDef } from "@chalk/prop-periodic";
import { ask, oneByOne, sceneOn } from "../kit";

/** Riya's music class gives her an idea. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const music = sceneOn(
    b,
    "music",
    PeriodicScene.MusicClass,
    "Riya at a harmonium in music class, the notes sa re ga ma pa da ni written on the board, an element card sticking out of her bag",
  );
  return column([
    w.title(t("Every eighth note", "हर आठवाँ स्वर")),
    music,
    w.body(
      t(
        'Last time: Döbereiner\'s triads sorted only nine of the 118 cards. The next morning, in music class, the teacher plays sa, re, ga, ma, pa, da, ni, and then sa again, one step higher. Riya sits up. **"Every eighth note sounds like the first. What if every eighth element is like the first?"**',
        'पिछली बार: डॉबेराइनर के त्रिकों ने 118 में से केवल नौ कार्ड छाँटे। अगली सुबह, संगीत की कक्षा में शिक्षक सा, रे, ग, म, प, ध, नि बजाते हैं, और फिर एक सप्तक ऊपर सा। रिया सीधी बैठ जाती है। **"हर आठवाँ स्वर पहले जैसा लगता है। अगर हर आठवाँ तत्व पहले जैसा हो तो?"**',
      ),
    ),
    w.body(
      t(
        "Stop 2: can one rule, like the notes of a scale, sort every card?",
        "पड़ाव 2: क्या सरगम के स्वरों जैसा एक नियम हर कार्ड को छाँट सकता है?",
      ),
    ),
    space(),
  ]);
});

/** The law of octaves, with the notes and Table 5.3. */
const law = page(
  "law",
  (b) => {
    const w = wordsOn(b);
    const table = b.prop(octaveTableDef, "table", {
      note: null,
      showBreaks: false,
      canPick: true,
      canShowBreaks: false,
    });
    b.studentOnly(table.action(OctaveAction.PickNote));
    b.standsFor(
      table,
      "Newlands' table: the notes sa, re, ga, ma, pa, da, ni across the top, the elements from H to Fe and on in rows under them; tap a note to light its column",
    );
    const goal = goalQuestion(b, {
      about: table,
      prompt: t(
        "Light the column under re. Which elements are in it?",
        "रे के नीचे का स्तंभ जलाओ। उसमें कौन-से तत्व हैं?",
      ),
      isMet: table.field("note").eq(1),
      solve: [table.learner(OctaveAction.PickNote, { note: 1 })],
    });
    return column([
      w.title(t("Newlands' law of octaves", "न्यूलैंड्स का अष्टक नियम")),
      w.definition(
        t(
          "**Notes of a scale.** In Indian music a scale has seven notes: **sa, re, ga, ma, pa, da, ni**. In the West they are do, re, mi, fa, so, la, ti. After ni the scale starts again, and the eighth note is like the first: it is the first note of the next scale. Eight notes from one sa to the next make an **octave**.",
          "**सप्तक के स्वर।** भारतीय संगीत में एक सप्तक में सात स्वर हैं: **सा, रे, ग, म, प, ध, नि**। पश्चिम में ये डो, रे, मी, फ़ा, सो, ला, टी हैं। नि के बाद सप्तक फिर शुरू होता है, और आठवाँ स्वर पहले जैसा होता है: वह अगले सप्तक का पहला स्वर है। एक सा से अगले सा तक के आठ स्वर एक **अष्टक** बनाते हैं।",
        ),
      ),
      w.body(
        t(
          "In 1866 an English scientist, **John Newlands**, arranged the elements known then in order of **increasing atomic mass**, from hydrogen (the lightest) to thorium, the 56th. He found that **every eighth element had properties like the first**, just as every eighth note is like the first.",
          "1866 में एक अंग्रेज़ वैज्ञानिक, **जॉन न्यूलैंड्स**, ने उस समय ज्ञात तत्वों को **बढ़ते परमाणु द्रव्यमान** के क्रम में सजाया, हाइड्रोजन (सबसे हल्का) से थोरियम तक, जो 56वाँ था। उन्होंने पाया कि **हर आठवें तत्व के गुण पहले जैसे थे**, जैसे हर आठवाँ स्वर पहले जैसा होता है।",
        ),
      ),
      w.definition(
        t(
          "**Newlands' law of octaves.** When elements are arranged in order of increasing atomic mass, every eighth element has properties similar to the first.",
          "**न्यूलैंड्स का अष्टक नियम।** जब तत्वों को बढ़ते परमाणु द्रव्यमान के क्रम में सजाया जाता है, तो हर आठवें तत्व के गुण पहले तत्व के समान होते हैं।",
        ),
      ),
      table,
      goal,
      w.body(
        t(
          "Sodium is the eighth element after lithium, and the two are alike. Beryllium and magnesium sit under the same note and are alike too.",
          "सोडियम, लीथियम के बाद आठवाँ तत्व है, और दोनों समान हैं। बेरिलियम और मैग्नीशियम एक ही स्वर के नीचे हैं और वे भी समान हैं।",
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Where the law breaks. */
const breaks = page(
  "breaks",
  (b) => {
    const w = wordsOn(b);
    const table = b.prop(octaveTableDef, "table", {
      note: null,
      showBreaks: false,
      canPick: true,
      canShowBreaks: true,
    });
    b.studentOnly(table.action(OctaveAction.PickNote));
    b.studentOnly(table.action(OctaveAction.ShowBreaks));
    b.standsFor(
      table,
      "Newlands' table with a button that marks where it breaks: two elements squeezed into one slot, iron placed far from cobalt and nickel, and every row after calcium",
    );
    const goal = goalQuestion(b, {
      about: table,
      prompt: t("Show where the law breaks.", "दिखाओ कि नियम कहाँ टूटता है।"),
      isMet: table.field("showBreaks").eq(true),
      solve: [table.learner(OctaveAction.ShowBreaks, { isOn: true })],
    });
    const q = ask(
      b,
      "q",
      [
        "Cobalt and nickel share one slot under sa. Who else is under sa?",
        "कोबाल्ट और निकेल सा के नीचे एक खाने में हैं। सा के नीचे और कौन है?",
      ],
      ["F, Cl, Br: gases and liquids unlike them", "F, Cl, Br: उनसे बिल्कुल अलग गैसें और द्रव"],
      [
        [
          "Fe: a metal much like them",
          "Fe: उनसे बहुत मिलती धातु",
          "Iron resembles cobalt and nickel, but Newlands put it far away, under ni.",
          "लोहा कोबाल्ट और निकेल जैसा है, पर न्यूलैंड्स ने उसे दूर, नि के नीचे रखा।",
        ],
        [
          "Li, Na, K: soft metals like them",
          "Li, Na, K: उन जैसी नरम धातुएँ",
          "Those are under re, not sa.",
          "वे रे के नीचे हैं, सा के नीचे नहीं।",
        ],
      ],
      { isHidden: true },
    );
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(q));
    return column([
      w.title(t("Where the octaves break", "अष्टक कहाँ टूटते हैं")),
      table,
      goal,
      w.definition(
        t(
          "**Limits of the law of octaves.** (1) It worked only up to **calcium**: after calcium, every eighth element is not like the first. (2) Newlands assumed only **56 elements** existed. Elements found later did not fit. (3) To make elements fit, he put **two elements in one slot**, and put unlike elements under the same note. Cobalt and nickel share a slot under fluorine, chlorine and bromine, which are very different, while **iron**, which is like cobalt and nickel, sits far away. (4) When the **noble gases** were discovered, the law stopped making sense. So the law worked well only for the **lighter elements**.",
          "**अष्टक नियम की सीमाएँ।** (1) यह केवल **कैल्सियम** तक चला: कैल्सियम के बाद हर आठवाँ तत्व पहले जैसा नहीं है। (2) न्यूलैंड्स ने माना कि केवल **56 तत्व** हैं। बाद में मिले तत्व फ़िट नहीं हुए। (3) तत्वों को फ़िट करने के लिए उन्होंने **एक खाने में दो तत्व** रखे, और असमान तत्वों को एक ही स्वर के नीचे रखा। कोबाल्ट और निकेल एक खाने में फ़्लुओरीन, क्लोरीन और ब्रोमीन के नीचे हैं, जो बहुत अलग हैं, जबकि **लोहा**, जो कोबाल्ट और निकेल जैसा है, दूर बैठा है। (4) जब **उत्कृष्ट गैसें** खोजी गईं, तो नियम का कोई अर्थ नहीं रहा। इसलिए नियम केवल **हल्के तत्वों** के लिए अच्छा चला।",
        ),
      ),
      q,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Back to Riya's rows of seven. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const music = sceneOn(
      b,
      "music",
      PeriodicScene.MusicClass,
      "Riya at the harmonium again, thinking about rows of seven cards",
    );
    const q = ask(
      b,
      "q",
      [
        "Riya lays the cards in rows of seven, lightest first. Where does her wall start to go wrong?",
        "रिया कार्डों को सात-सात की पंक्तियों में, सबसे हल्के पहले, रखती है। उसकी दीवार कहाँ से ग़लत होने लगती है?",
      ],
      ["After calcium, in the third row", "कैल्सियम के बाद, तीसरी पंक्ति में"],
      [
        [
          "Right at the start, after lithium",
          "शुरू में ही, लीथियम के बाद",
          "Li, Na and K line up well under re: the start works.",
          "Li, Na और K रे के नीचे ठीक बैठते हैं: शुरुआत चलती है।",
        ],
        [
          "Nowhere, with all 118 cards",
          "कहीं नहीं, सभी 118 कार्डों के साथ",
          "Newlands' table had only 56 elements and still broke after calcium.",
          "न्यूलैंड्स की सारणी में केवल 56 तत्व थे और फिर भी कैल्सियम के बाद टूटी।",
        ],
      ],
      { passes: true },
    );
    return column([
      w.title(t("Rows of seven", "सात-सात की पंक्तियाँ")),
      music,
      w.body(
        t(
          "That evening Riya puts aside the noble gas cards (helium, neon, argon), which nobody knew in Newlands' time, and lays the rest in rows of seven, lightest first. H, Li, Be, B, C, N, O. Then F, Na, Mg, Al, Si, P, S. Lithium and sodium line up, and so do beryllium and magnesium. It's working! Then the third row, and the fourth…",
          "उस शाम रिया उत्कृष्ट गैसों के कार्ड (हीलियम, नियॉन, आर्गन) अलग रखती है, जिन्हें न्यूलैंड्स के समय कोई नहीं जानता था, और बाकी कार्डों को सात-सात की पंक्तियों में, सबसे हल्के पहले, रखती है। H, Li, Be, B, C, N, O। फिर F, Na, Mg, Al, Si, P, S। लीथियम और सोडियम एक सीध में आते हैं, और बेरिलियम और मैग्नीशियम भी। यह चल रहा है! फिर तीसरी पंक्ति, और चौथी…",
        ),
      ),
      q,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Practice: triads in the octaves; the limits; the log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const q1 = ask(
      b,
      "q1",
      [
        "Did Döbereiner's triads also appear in the columns of Newlands' octaves?",
        "क्या डॉबेराइनर के त्रिक न्यूलैंड्स के अष्टकों के स्तंभों में भी दिखते हैं?",
      ],
      ["Yes: Li, Na and K are all under re", "हाँ: Li, Na और K सभी रे के नीचे हैं"],
      [
        [
          "No: each triad is split across notes",
          "नहीं: हर त्रिक अलग-अलग स्वरों में बँटा है",
          "Light the re column: Li, Na and K are all in it.",
          "रे का स्तंभ जलाओ: Li, Na और K सभी उसमें हैं।",
        ],
        [
          "Yes: Li, Na and K are all under sa",
          "हाँ: Li, Na और K सभी सा के नीचे हैं",
          "Under sa are H, F, Cl and Br.",
          "सा के नीचे H, F, Cl और Br हैं।",
        ],
      ],
    );
    const q2 = ask(
      b,
      "q2",
      ["Which is a limit of Newlands' law of octaves?", "न्यूलैंड्स के अष्टक नियम की एक सीमा कौन-सी है?"],
      ["It worked only up to calcium", "यह केवल कैल्सियम तक चला"],
      [
        [
          "It worked only for heavy elements",
          "यह केवल भारी तत्वों के लिए चला",
          "It was the other way round: it worked for the lighter ones.",
          "उल्टा था: यह हल्के तत्वों के लिए चला।",
        ],
        [
          "It found only three groups of elements",
          "इसे तत्वों के केवल तीन समूह मिले",
          "That was Döbereiner's limit, not Newlands'.",
          "वह डॉबेराइनर की सीमा थी, न्यूलैंड्स की नहीं।",
        ],
      ],
      { isHidden: true },
    );
    const log = w.definition(
      t(
        "**Mission log.** ✓ Newlands: in order of atomic mass, every eighth element is like the first. ✓ It works for the light elements: Li and Na, Be and Mg. ✗ After calcium it breaks: unlike elements share a note, two share a slot, and new elements don't fit. Next: a wall where the cards can leave gaps.",
        "**मिशन लॉग।** ✓ न्यूलैंड्स: परमाणु द्रव्यमान के क्रम में हर आठवाँ तत्व पहले जैसा है। ✓ यह हल्के तत्वों के लिए चलता है: Li और Na, Be और Mg। ✗ कैल्सियम के बाद यह टूटता है: असमान तत्व एक स्वर बाँटते हैं, दो एक खाना बाँटते हैं, और नए तत्व फ़िट नहीं होते। आगे: एक दीवार जिसमें कार्ड ख़ाली जगह छोड़ सकें।",
      ),
      "log",
      { isHidden: true },
    );
    oneByOne(b, [q1, q2], [log]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), q1, q2, log, space()]);
  },
  { passOn: PassOn.Rules },
);

export const overview = [hook, law, breaks, inLife, yourTurn];

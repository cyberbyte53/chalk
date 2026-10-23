import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import { FieldAction, MagnetismScene, Source, magneticFieldDef } from "@chalk/prop-magnetism";
import { sceneOn } from "../kit";

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** Who, where, what: the third power cut this month. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const pic = sceneOn(
    b,
    "pic",
    MagnetismScene.PowerCutAgain,
    "the family sitting round a single candle in a dark room during a power cut, a dead torch on the table",
  );
  return column([
    w.title(t("Dark again", "फिर अँधेरा")),
    pic,
    w.body(
      t(
        'A few weeks after the bill came down, the lights go out again: the third power cut this month. Kabir finds the torch. Its cells are flat. Mom lights a candle, and Grandpa laughs: **"My father had a bicycle lamp that lit itself, with no cell inside. You just pedalled."**',
        'बिल कम होने के कुछ हफ़्ते बाद बत्ती फिर चली जाती है: इस महीने तीसरी बार। कबीर टॉर्च ढूँढता है। उसके सेल ख़त्म हैं। मम्मी मोमबत्ती जलाती हैं, और दादाजी हँसते हैं: **"मेरे पिताजी के पास साइकिल का एक लैंप था जो अपने आप जलता था, अंदर कोई सेल नहीं। बस पैडल मारो।"**',
      ),
    ),
    w.body(
      t(
        "Kabir stares at him. Light, with no cell? Riya has a better idea: **a torch you crank by hand, that never needs charging.** Never again in the dark.",
        "कबीर उन्हें घूरता है। बिना सेल के रोशनी? रिया के पास एक बेहतर विचार है: **एक टॉर्च जिसे हाथ से घुमाकर चलाओ, जिसे कभी चार्ज न करना पड़े।** फिर कभी अँधेरा नहीं।",
      ),
    ),
    space(),
  ]);
});

/** Why this chapter: electricity and magnetism are linked; the eight stops. */
const why = page("why", (b) => {
  const w = wordsOn(b);
  const pic = sceneOn(
    b,
    "pic",
    MagnetismScene.CrankTorch,
    "the goal: Kabir turning the handle of a home-made torch that shines a beam across a dark room",
  );
  return column([
    w.title(t("What this chapter is for", "यह अध्याय किसलिए है")),
    pic,
    w.body(
      t(
        "Last chapter, a current made heat. This chapter shows two more surprises: **a current makes a magnet**, and **a moving magnet makes a current**. The second one is how Grandpa's bicycle lamp worked, and how a hand-crank torch can work. On the way, Riya and Kabir will also open Grandpa's old mixer and make the house wiring safe.",
        "पिछले अध्याय में धारा ने गर्मी बनाई। यह अध्याय दो और अचंभे दिखाता है: **धारा चुंबक बनाती है**, और **चलता हुआ चुंबक धारा बनाता है**। दूसरी बात से ही दादाजी का साइकिल लैंप चलता था, और ऐसे ही हाथ से घुमाने वाली टॉर्च चल सकती है। रास्ते में रिया और कबीर दादाजी का पुराना मिक्सर भी खोलेंगे और घर की वायरिंग सुरक्षित करेंगे।",
      ),
    ),
    w.definition(
      t(
        "**The stops on the way.** (1) Magnets and field lines: *this lesson*. (2) The field of a current in a straight wire. (3) Loops, solenoids and electromagnets. (4) The force on a current. (5) The electric motor. (6) Electromagnetic induction. (7) The generator. (8) The wiring at home.",
        "**रास्ते के पड़ाव।** (1) चुंबक और क्षेत्र रेखाएँ: *यह पाठ*। (2) सीधे तार में धारा का क्षेत्र। (3) पाश, परिनालिका और विद्युत चुंबक। (4) धारा पर बल। (5) विद्युत मोटर। (6) विद्युत चुंबकीय प्रेरण। (7) जनित्र। (8) घर की वायरिंग।",
      ),
    ),
    space(),
  ]);
});

/** The first puzzle: Kabir's compass by the wire of his battery circuit. */
const puzzle = page("puzzle", (b) => {
  const w = wordsOn(b);
  const pic = sceneOn(
    b,
    "pic",
    MagnetismScene.CompassJumps,
    "Kabir's compass lying beside the single long wire of his battery circuit; the switch is closed, the bulb glows, and the needle has swung round",
  );
  return column([
    w.title(t("The jumping needle", "उछलती सुई")),
    pic,
    w.body(
      t(
        "Next morning the power is back. Kabir is wiring his science-kit bulb to a fresh 4.5 V battery, with one long loose wire across the floor, and his school compass is lying right beside it. When he closes the switch, the needle **swings round**. Open it: it swings back. There is no magnet anywhere near. So what is pushing the needle? To answer that, we first need to know exactly what a magnet does to the space around it.",
        "अगली सुबह बिजली लौट आती है। कबीर अपनी विज्ञान-किट का बल्ब 4.5 V की नई बैटरी से जोड़ रहा है, फ़र्श पर एक लंबे ढीले तार से, और उसका स्कूल वाला दिक्सूचक ठीक उसी तार के पास पड़ा है। जब वह स्विच बंद करता है, सुई **घूम जाती है**। स्विच खोलो: वापस घूम जाती है। आसपास कोई चुंबक नहीं है। तो सुई को कौन धकेल रहा है? इसका उत्तर पाने के लिए पहले जानना होगा कि चुंबक अपने आसपास की जगह के साथ ठीक-ठीक क्या करता है।",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** A compass needle is a small magnet; its poles; like poles repel. */
const needle = page(
  "needle",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      prompt: t(
        "Why does a compass needle turn when it is brought near a bar magnet?",
        "दिक्सूचक की सुई किसी छड़ चुंबक के पास लाने पर क्यों घूमती है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "The needle is a small magnet, so the poles push and pull its ends",
            "सुई एक छोटा चुंबक है, इसलिए ध्रुव उसके सिरों को धकेलते-खींचते हैं",
          ),
        },
        {
          id: "iron",
          label: t(
            "Any metal near a magnet turns to point at it, so the needle does too",
            "चुंबक के पास कोई भी धातु उसकी ओर मुड़ती है, इसलिए सुई भी",
          ),
          feedback: t(
            "Copper or aluminium don't turn at all. The needle turns because it is a magnet, with its own N and S ends.",
            "ताँबा या ऐलुमिनियम बिल्कुल नहीं मुड़ते। सुई इसलिए मुड़ती है क्योंकि वह एक चुंबक है, अपने N और S सिरों के साथ।",
          ),
        },
        {
          id: "earth",
          label: t(
            "It is still pointing north; the magnet doesn't matter",
            "वह अब भी उत्तर दिखा रही है; चुंबक से फ़र्क नहीं पड़ता",
          ),
          feedback: t(
            "Close to a bar magnet the magnet's pull is far stronger than the Earth's, so the needle turns towards it.",
            "छड़ चुंबक के पास उसका खिंचाव पृथ्वी के खिंचाव से कहीं ज़्यादा होता है, इसलिए सुई उसकी ओर मुड़ती है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("A compass is a small magnet", "दिक्सूचक एक छोटा चुंबक है")),
      w.definition(
        t(
          "**Magnet and poles.** A **magnet** attracts iron. Its pull is strongest at its two ends, its **poles**. Hung freely, a magnet turns until one end points roughly north: that end is the **north-seeking pole**, or simply the **north pole (N)**. The other end is the **south pole (S)**.",
          "**चुंबक और ध्रुव।** **चुंबक** लोहे को आकर्षित करता है। उसका खिंचाव उसके दोनों सिरों पर सबसे तेज़ होता है, जो उसके **ध्रुव** हैं। खुला लटकाने पर चुंबक घूमता है जब तक एक सिरा लगभग उत्तर की ओर न हो जाए: वह सिरा **उत्तरोमुखी ध्रुव** या सीधे **उत्तर ध्रुव (N)** है। दूसरा सिरा **दक्षिण ध्रुव (S)** है।",
        ),
      ),
      w.definition(
        t(
          "**Compass.** A **compass** is a small, light magnet (the needle) balanced so it can turn freely. Its N end points north. **Like poles repel, unlike poles attract**: N pushes N away, and N pulls S.",
          "**दिक्सूचक।** **दिक्सूचक** एक छोटा, हल्का चुंबक (सुई) है जो इस तरह टिका होता है कि आसानी से घूम सके। उसका N सिरा उत्तर दिखाता है। **सजातीय ध्रुव प्रतिकर्षित करते हैं, विजातीय ध्रुव आकर्षित**: N, N को धकेलता है, और N, S को खींचता है।",
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Iron filings: the magnetic field and its field lines (Activity 13.2). */
const filings = page(
  "filings",
  (b) => {
    const w = wordsOn(b);
    const field = b.prop(magneticFieldDef, "field", {
      source: Source.BarMagnet,
      showFilings: true,
      showLines: false,
      showArrows: false,
      canPlace: false,
    });
    b.standsFor(
      field,
      "a bar magnet on a board with iron filings sprinkled round it, lined up in curves from one pole to the other",
    );
    const ask = choiceQuestion(b, {
      prompt: t(
        "Why do the filings arrange themselves in curves instead of lying anyhow?",
        "बुरादा अपने आप वक्रों में क्यों सज जाता है, कहीं भी क्यों नहीं पड़ा रहता?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "The magnet exerts a force on each filing in the space around it",
            "चुंबक अपने आसपास की जगह में हर कण पर बल लगाता है",
          ),
        },
        {
          id: "tap",
          label: t(
            "Tapping the board makes any powder form curves",
            "बोर्ड थपथपाने से कोई भी चूर्ण वक्र बना लेता है",
          ),
          feedback: t(
            "Sprinkle salt and tap: no pattern. Tapping only frees the filings to move where the magnet pulls them.",
            "नमक छिड़ककर थपथपाओ: कोई पैटर्न नहीं। थपथपाने से बुरादा बस खुलकर वहाँ जा पाता है जहाँ चुंबक उसे खींचता है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("The magnet's invisible pattern", "चुंबक का अदृश्य पैटर्न")),
      w.body(
        t(
          "Activity 13.2. Put a bar magnet on a sheet of paper, sprinkle **iron filings** (tiny bits of iron) round it, and tap the board gently.",
          "क्रियाकलाप 13.2। एक छड़ चुंबक को काग़ज़ पर रखो, उसके चारों ओर **लोहे का बुरादा** (लोहे के नन्हे टुकड़े) छिड़को, और बोर्ड को धीरे से थपथपाओ।",
        ),
      ),
      field,
      w.definition(
        t(
          "**Magnetic field and field lines.** The region around a magnet in which its force can be detected is its **magnetic field**. The lines along which iron filings line up are **magnetic field lines**: they show the shape of the field.",
          "**चुंबकीय क्षेत्र और क्षेत्र रेखाएँ।** चुंबक के आसपास का वह क्षेत्र जिसमें उसका बल महसूस किया जा सकता है, उसका **चुंबकीय क्षेत्र** है। जिन रेखाओं पर लोहे का बुरादा सजता है, वे **चुंबकीय क्षेत्र रेखाएँ** हैं: वे क्षेत्र का आकार दिखाती हैं।",
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Drawing field lines with a compass (Activity 13.3): direction N to S. */
const draw = page(
  "draw",
  (b) => {
    const w = wordsOn(b);
    const field = b.prop(magneticFieldDef, "field", {
      source: Source.BarMagnet,
      showLines: true,
      showArrows: true,
      compass: { x: 4.2, y: 0 },
      canPlace: true,
    });
    b.studentOnly(field.action(FieldAction.PlaceCompass));
    b.standsFor(
      field,
      "a bar magnet with its field lines and arrows; a compass the learner can tap anywhere to place, its needle following the field",
    );
    const ask = choiceQuestion(b, {
      prompt: t(
        "The compass sits just beyond the magnet's N pole. Which way does the needle's north end point?",
        "दिक्सूचक चुंबक के N ध्रुव के ठीक आगे रखा है। सुई का उत्तर सिरा किधर इशारा करता है?",
      ),
      options: [
        {
          id: "right",
          label: t("Away from the magnet's N pole", "चुंबक के N ध्रुव से दूर"),
        },
        {
          id: "towards",
          label: t("Towards the magnet's N pole", "चुंबक के N ध्रुव की ओर"),
          feedback: t(
            "Like poles repel: the needle's N end is pushed away from the magnet's N pole, and its S end is pulled towards it.",
            "सजातीय ध्रुव प्रतिकर्षित करते हैं: सुई का N सिरा चुंबक के N ध्रुव से दूर धकेला जाता है, और उसका S सिरा उसकी ओर खिंचता है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Drawing a field line with a compass", "दिक्सूचक से क्षेत्र रेखा खींचना")),
      w.body(
        t(
          "Activity 13.3. Place a small compass near the N pole and mark both ends of its needle. Move it so its S end sits where its N end was, mark again, and keep going until you reach the S pole. Join the marks: that curve is one field line. **Tap anywhere in the picture to put the compass there.**",
          "क्रियाकलाप 13.3। एक छोटा दिक्सूचक N ध्रुव के पास रखो और उसकी सुई के दोनों सिरे चिह्नित करो। उसे ऐसे खिसकाओ कि उसका S सिरा वहाँ आ जाए जहाँ N सिरा था, फिर चिह्नित करो, और ऐसे ही S ध्रुव तक पहुँचो। चिह्नों को जोड़ो: वह वक्र एक क्षेत्र रेखा है। **चित्र में कहीं भी टैप करके दिक्सूचक वहाँ रखो।**",
        ),
      ),
      field,
      w.definition(
        t(
          "**The direction of the field.** The field at a point points the way the **north pole of a compass** placed there would move. So field lines come **out of the N pole** and go **into the S pole**. Inside the magnet they run from S back to N, so every field line is a **closed curve**.",
          "**क्षेत्र की दिशा।** किसी बिंदु पर क्षेत्र उस दिशा में होता है जिसमें वहाँ रखे **दिक्सूचक का उत्तर ध्रुव** चलेगा। इसलिए क्षेत्र रेखाएँ **N ध्रुव से निकलती** हैं और **S ध्रुव में जाती** हैं। चुंबक के अंदर वे S से वापस N तक चलती हैं, इसलिए हर क्षेत्र रेखा एक **बंद वक्र** है।",
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Strength from crowding; lines never cross. */
const rules = page(
  "rules",
  (b) => {
    const w = wordsOn(b);
    const field = b.prop(magneticFieldDef, "field", {
      source: Source.BarMagnet,
      showLines: true,
      showArrows: true,
      showStrength: true,
      compass: { x: -8, y: 4.5 },
      canPlace: true,
    });
    b.studentOnly(field.action(FieldAction.PlaceCompass));
    b.standsFor(
      field,
      "a bar magnet's field lines with a compass and a strength meter beside it; the learner can move the compass",
    );
    const strong = choiceQuestion(b, {
      name: "strong",
      prompt: t(
        "Move the compass around and watch the meter. Where is the field strongest?",
        "दिक्सूचक को इधर-उधर ले जाओ और मीटर देखो। क्षेत्र सबसे प्रबल कहाँ है?",
      ),
      options: [
        {
          id: "right",
          label: t("Near the poles, where the lines are crowded", "ध्रुवों के पास, जहाँ रेखाएँ घनी हैं"),
        },
        {
          id: "far",
          label: t("Far away, where the lines spread out", "दूर, जहाँ रेखाएँ फैल जाती हैं"),
          feedback: t(
            "Far away the meter barely moves. Spread-out lines mean a weak field.",
            "दूर मीटर मुश्किल से हिलता है। फैली हुई रेखाएँ यानी कमज़ोर क्षेत्र।",
          ),
        },
        {
          id: "middle",
          label: t("Beside the middle of the magnet", "चुंबक के बीच के बगल में"),
          feedback: t(
            "Beside the middle the lines are farther apart than at the ends. The pull is strongest at the poles.",
            "बीच के बगल में रेखाएँ सिरों की तुलना में दूर-दूर हैं। खिंचाव ध्रुवों पर सबसे तेज़ होता है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const cross = choiceQuestion(b, {
      name: "cross",
      prompt: t("Why do two field lines never cross?", "दो क्षेत्र रेखाएँ कभी एक-दूसरे को क्यों नहीं काटतीं?"),
      options: [
        {
          id: "right",
          label: t(
            "At the crossing a compass would have to point two ways at once",
            "काटने वाले बिंदु पर दिक्सूचक को एक साथ दो दिशाओं में इशारा करना पड़ता",
          ),
        },
        {
          id: "room",
          label: t("There isn't enough room near the magnet", "चुंबक के पास पर्याप्त जगह नहीं है"),
          feedback: t(
            "Room isn't the issue. A field line gives the one direction of the field at each point, and a needle can point only one way.",
            "जगह की बात नहीं है। क्षेत्र रेखा हर बिंदु पर क्षेत्र की एक ही दिशा बताती है, और सुई केवल एक ओर इशारा कर सकती है।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
    });
    b.when(strong.on(QuestionSignal.Correct), theBoard.show(cross));
    return column([
      w.title(t("Reading field lines", "क्षेत्र रेखाएँ पढ़ना")),
      w.definition(
        t(
          "**Strength.** A magnetic field has a **direction** and a **size**. Where the field lines are **crowded together** the field is **stronger**: a magnet placed there feels a bigger force.",
          "**प्रबलता।** चुंबकीय क्षेत्र की एक **दिशा** और एक **परिमाण** होता है। जहाँ क्षेत्र रेखाएँ **पास-पास** हैं, वहाँ क्षेत्र **प्रबल** है: वहाँ रखा चुंबक अधिक बल महसूस करता है।",
        ),
      ),
      field,
      strong,
      cross,
      w.definition(
        t(
          "**Properties of field lines.** (1) They leave the N pole and enter the S pole, and inside the magnet run S to N: closed curves. (2) They are closer together where the field is stronger. (3) **No two field lines cross.**",
          "**क्षेत्र रेखाओं के गुण।** (1) वे N ध्रुव से निकलती हैं और S ध्रुव में जाती हैं, और चुंबक के अंदर S से N चलती हैं: बंद वक्र। (2) जहाँ क्षेत्र प्रबल है वहाँ वे पास-पास होती हैं। (3) **कोई दो क्षेत्र रेखाएँ एक-दूसरे को नहीं काटतीं।**",
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

/** The worn-out magnet from Grandpa's drawer; the compass names its poles. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const field = b.prop(magneticFieldDef, "field", {
      source: Source.BarMagnet,
      isFlipped: true,
      showLines: false,
      showArrows: false,
      showPoles: false,
      compass: { x: 4.2, y: 0 },
      canPlace: true,
    });
    b.studentOnly(field.action(FieldAction.PlaceCompass));
    b.standsFor(
      field,
      "an old bar magnet whose N and S labels have worn off, with a compass the learner can place round it",
    );
    const ask = choiceQuestion(b, {
      name: "which",
      prompt: t(
        "Grandpa finds an old bar magnet in a drawer; its labels have worn off. Kabir holds the compass beside its right end and the needle's N end points **towards** that end. Which pole is the right end?",
        "दादाजी को दराज़ में एक पुराना छड़ चुंबक मिलता है; उसके निशान मिट गए हैं। कबीर दिक्सूचक को उसके दाएँ सिरे के पास रखता है और सुई का N सिरा उस सिरे की **ओर** इशारा करता है। दायाँ सिरा कौन-सा ध्रुव है?",
      ),
      options: [
        { id: "right", label: t("A south pole", "दक्षिण ध्रुव") },
        {
          id: "north",
          label: t("A north pole", "उत्तर ध्रुव"),
          feedback: t(
            "A needle's N end is pulled towards an unlike pole. It points at the end that attracts north: a south pole.",
            "सुई का N सिरा विजातीय ध्रुव की ओर खिंचता है। वह उस सिरे की ओर है जो उत्तर को खींचता है: दक्षिण ध्रुव।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const next = w.note(
      t(
        "That's how a compass reads a magnet. But by Kabir's wire there was **no magnet at all**, and the needle still swung. Next stop: what a current does.",
        "दिक्सूचक ऐसे चुंबक को पढ़ता है। पर कबीर के तार के पास **कोई चुंबक था ही नहीं**, फिर भी सुई घूमी। अगला पड़ाव: धारा क्या करती है।",
      ),
      "next",
      { isHidden: true },
    );
    b.when(ask.on(QuestionSignal.Correct), [theBoard.show(next), theBoard.pass()]);
    return column([
      w.title(t("Naming an unlabelled magnet", "बिना निशान वाले चुंबक का नाम")),
      field,
      ask,
      next,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Worked: NCERT's questions on field lines. */
const examples = page("examples", (b) => {
  const w = wordsOn(b);
  const field = b.prop(magneticFieldDef, "field", {
    source: Source.BarMagnet,
    showLines: true,
    showArrows: true,
    canPlace: false,
  });
  b.standsFor(field, "the field lines round a bar magnet with arrows from N to S");
  return column([
    w.title(t("Worked answers", "हल किए गए उत्तर")),
    w.body(
      t(
        "**Draw the magnetic field lines around a bar magnet.**",
        "**एक छड़ चुंबक के चारों ओर चुंबकीय क्षेत्र रेखाएँ खींचो।**",
      ),
    ),
    field,
    w.body(
      t(
        "Draw closed curves that leave the N end and enter the S end, with arrows pointing from N to S outside the magnet. Draw them crowded near the poles and spreading out away from the magnet, and never let two cross.",
        "ऐसे बंद वक्र बनाओ जो N सिरे से निकलें और S सिरे में जाएँ, चुंबक के बाहर N से S की ओर तीर के साथ। ध्रुवों के पास उन्हें घना बनाओ और चुंबक से दूर फैलता हुआ, और दो को कभी कटने मत दो।",
      ),
    ),
    w.body(
      t(
        "**List the properties of magnetic field lines.** They run from N to S outside the magnet and S to N inside, so they are closed curves; they are closer where the field is stronger; and no two of them ever cross.",
        "**चुंबकीय क्षेत्र रेखाओं के गुण लिखो।** वे चुंबक के बाहर N से S और अंदर S से N चलती हैं, इसलिए बंद वक्र हैं; जहाँ क्षेत्र प्रबल है वहाँ पास-पास होती हैं; और कोई दो कभी नहीं कटतीं।",
      ),
    ),
    space(),
  ]);
});

/** Your turn, then the mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      prompt: t(
        "Inside a bar magnet, which way do its field lines run?",
        "छड़ चुंबक के अंदर उसकी क्षेत्र रेखाएँ किस ओर चलती हैं?",
      ),
      options: [
        { id: "right", label: t("From S to N", "S से N") },
        {
          id: "ns",
          label: t("From N to S", "N से S"),
          feedback: t(
            "N to S is outside. To close the loop, inside the magnet they go back from S to N.",
            "N से S बाहर है। लूप पूरा करने के लिए चुंबक के अंदर वे S से वापस N जाती हैं।",
          ),
        },
        {
          id: "none",
          label: t("There are none inside", "अंदर कोई रेखा नहीं होती"),
          feedback: t(
            "Field lines are closed curves, so they must continue through the magnet.",
            "क्षेत्र रेखाएँ बंद वक्र हैं, इसलिए उन्हें चुंबक के अंदर से होकर जाना ही है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ A compass is a small magnet; like poles repel. ✓ A magnet has a field, shown by field lines from N to S. ✓ Crowded lines mean a strong field; lines never cross. ✗ Still unexplained: why the needle swings by Kabir's wire. Next stop: the field of a current.",
        "**मिशन लॉग।** ✓ दिक्सूचक एक छोटा चुंबक है; सजातीय ध्रुव प्रतिकर्षित करते हैं। ✓ चुंबक का एक क्षेत्र होता है, जिसे N से S की क्षेत्र रेखाएँ दिखाती हैं। ✓ घनी रेखाएँ यानी प्रबल क्षेत्र; रेखाएँ कभी नहीं कटतीं। ✗ अब भी अनसुलझा: कबीर के तार के पास सुई क्यों घूमती है। अगला पड़ाव: धारा का क्षेत्र।",
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
export const overview = [
  hook,
  why,
  puzzle,
  needle,
  filings,
  draw,
  rules,
  inLife,
  examples,
  yourTurn,
];

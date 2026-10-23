import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, goalQuestion, wordsOn } from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  PlaneMirrorAction,
  PlaneMirrorDerived,
  TORCH_HEIGHT,
  planeMirrorDef,
} from "@chalk/prop-light";

const r = String.raw;

/** The story: Riya's torch, a mirror on the floor, a star sticker to light on the far wall. */
const story = page(
  "story",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "Feel the law of reflection before it is named: the beam leaves the mirror at exactly the angle it arrived, so the one strike point that lights a star at the torch's height is halfway between them.",
    );
    const room = b.prop(planeMirrorDef, "room", {
      torchX: 20,
      strike: 35,
      target: { x: 80, y: TORCH_HEIGHT },
      showNormal: false,
      showAngles: false,
    });
    b.studentOnly(room.action(PlaneMirrorAction.Aim));
    b.standsFor(
      room,
      "Riya's dark room: her torch 20 cm from the left wall, a mirror along the floor, the star sticker 80 cm from the left at the torch's height",
    );
    const guess = choiceQuestion(b, {
      name: "guess",
      prompt: t(
        "Where on the mirror should the beam land to light the star?",
        "तारे को रोशन करने के लिए किरण दर्पण पर कहाँ पड़नी चाहिए?",
      ),
      options: [
        {
          id: "near",
          label: t("Close to the torch", "टॉर्च के पास"),
          feedback: t(
            "Then the beam bounces back up steeply and comes down near the torch again.",
            "तब किरण तीखी उछलकर टॉर्च के पास ही लौट आती है।",
          ),
        },
        { id: "half", label: t("Exactly halfway", "ठीक बीच में") },
        {
          id: "far",
          label: t("Close to the star", "तारे के पास"),
          feedback: t(
            "Then the beam arrives almost flat and skims on past the star.",
            "तब किरण लगभग सपाट आती है और तारे के पास से आगे निकल जाती है।",
          ),
        },
      ],
      answer: "half",
      passes: false,
    });
    const goal = goalQuestion(b, {
      about: room,
      prompt: t(
        "Drag the beam along the mirror until the star lights up.",
        "किरण को दर्पण पर खिसकाओ, जब तक तारा जल न जाए।",
      ),
      isMet: room.derived(PlaneMirrorDerived.IsLit),
      solve: [room.learner(PlaneMirrorAction.Aim, { strike: 50 })],
      notes: [
        {
          when: room.field("strike").lt(48),
          say: t(
            "The beam is bouncing back too steeply: it comes down before it reaches the star. Move it to the right.",
            "किरण बहुत तीखी उछल रही है: वह तारे तक पहुँचने से पहले नीचे आ जाती है। इसे दाईं ओर खिसकाओ।",
          ),
          reach: [room.learner(PlaneMirrorAction.Aim, { strike: 35 })],
        },
        {
          when: room.field("strike").gt(52),
          say: t(
            "The beam is too flat: it flies on past the star. Move it to the left.",
            "किरण बहुत सपाट है: वह तारे के पार निकल जाती है। इसे बाईं ओर खिसकाओ।",
          ),
          reach: [room.learner(PlaneMirrorAction.Aim, { strike: 65 })],
        },
      ],
    });
    const wrap = w.definition(
      t(
        "**Halfway, at 50 cm.** The star and the torch are the same height, and the beam left the mirror at **exactly the angle it arrived**. A mirror never bends light more, or less, than that.",
        "**ठीक बीच में, 50 सेमी पर।** तारा और टॉर्च एक ही ऊँचाई पर हैं, और किरण दर्पण से **ठीक उसी कोण पर निकली जिस कोण पर आई थी**। दर्पण प्रकाश को इससे ज़्यादा या कम कभी नहीं मोड़ता।",
      ),
      "wrap",
      { isHidden: true },
    );
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(wrap));
    return column([
      w.title(t("The laws of reflection", "परावर्तन के नियम")),
      w.body(
        t(
          "Riya is in a dark room with a torch. A long mirror lies along the floor, and her friend has stuck a **star sticker** on the far wall, exactly as high as Riya holds the torch. She wants to light the star **without pointing the torch at it**: she will shine the torch down at the mirror and let the mirror do the rest.",
          "रिया एक अँधेरे कमरे में टॉर्च लिए खड़ी है। फ़र्श पर एक लंबा दर्पण पड़ा है, और उसकी सहेली ने सामने की दीवार पर एक **तारे का स्टिकर** चिपकाया है, ठीक उतनी ऊँचाई पर जितनी ऊँचाई पर रिया टॉर्च पकड़े है। वह तारे को **टॉर्च उस पर तानें बिना** रोशन करना चाहती है: वह टॉर्च को दर्पण पर नीचे की ओर चमकाएगी और बाकी काम दर्पण पर छोड़ देगी।",
        ),
      ),
      guess,
      room,
      goal,
      wrap,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** From the star to the laws: the normal, the two angles, the two laws. */
const laws = page("laws", (b) => {
  const w = wordsOn(b);
  const room = b.prop(planeMirrorDef, "room", {
    torchX: 20,
    strike: 50,
    target: null,
    showNormal: true,
    showAngles: true,
  });
  b.standsFor(room, "the same beam, now with the normal and both angles drawn in");
  return column([
    w.title(t("Naming what you saw", "जो देखा, उसके नाम")),
    w.body(
      t(
        "Draw a line **at right angles to the mirror** at the point where the beam lands. This line is the **normal**. The beam coming in is the **incident ray**; the beam going out is the **reflected ray**. Angles are measured **from the normal**, never from the mirror.",
        "जहाँ किरण दर्पण पर पड़ती है, वहाँ दर्पण पर **समकोण बनाती एक रेखा** खींचो। यह रेखा **अभिलंब** है। आने वाली किरण **आपतित किरण** है; जाने वाली किरण **परावर्तित किरण** है। कोण हमेशा **अभिलंब से** नापे जाते हैं, दर्पण से कभी नहीं।",
      ),
    ),
    room,
    w.body(
      t(
        r`The angle between the incident ray and the normal is the **angle of incidence**, $i$. The angle between the reflected ray and the normal is the **angle of reflection**, $r$. Drag the beam: however you aim it, the two stay equal.`,
        r`आपतित किरण और अभिलंब के बीच का कोण **आपतन कोण** $i$ है। परावर्तित किरण और अभिलंब के बीच का कोण **परावर्तन कोण** $r$ है। किरण को खिसकाओ: जैसे भी तानो, दोनों बराबर रहते हैं।`,
      ),
    ),
    w.definition(
      t(
        r`**The laws of reflection.** (1) The angle of incidence is equal to the angle of reflection: $i = r$. (2) The incident ray, the normal at the point of incidence and the reflected ray all lie in the same plane.`,
        r`**परावर्तन के नियम।** (1) आपतन कोण परावर्तन कोण के बराबर होता है: $i = r$। (2) आपतित किरण, आपतन बिंदु पर अभिलंब और परावर्तित किरण, तीनों एक ही तल में होते हैं।`,
      ),
    ),
    w.body(
      t(
        "The second law says the bounce has no sideways twist: a beam that comes in from the left goes out to the right, in the same flat sheet. That is why a ray diagram on a page is enough to find where light goes.",
        "दूसरा नियम कहता है कि उछाल में कोई बग़ल का मोड़ नहीं होता: बाईं ओर से आई किरण दाईं ओर जाती है, उसी सपाट तल में। इसीलिए कागज़ पर बना किरण आरेख यह बताने के लिए काफ़ी है कि प्रकाश कहाँ जाएगा।",
      ),
    ),
    w.body(
      t(
        r`One case to remember: a ray that comes **along the normal** has $i = 0$, so $r = 0$ too. It goes straight back the way it came.`,
        r`एक बात याद रखो: जो किरण **अभिलंब के साथ-साथ** आती है, उसका $i = 0$ है, इसलिए $r = 0$ भी। वह जिस रास्ते आई थी, उसी रास्ते सीधी लौट जाती है।`,
      ),
    ),
    space(),
  ]);
});

/** Free play: the torch moved to the middle, angles shown, nothing asked. */
const play = page("play", (b) => {
  const w = wordsOn(b);
  const room = b.prop(planeMirrorDef, "room", {
    torchX: 50,
    strike: 50,
    target: null,
    showNormal: true,
    showAngles: true,
  });
  b.standsFor(
    room,
    "a sandbox: the torch in the middle, the beam free to aim either way, with i and r shown",
  );
  return column([
    w.title(t("Try it yourself", "ख़ुद आज़माओ")),
    w.body(
      t(
        r`Aim the beam anywhere. Try to make $i$ bigger than $r$. Try the beam straight down. Try sending it to the left.`,
        r`किरण को कहीं भी तानो। $i$ को $r$ से बड़ा बनाने की कोशिश करो। किरण को सीधे नीचे भेजो। उसे बाईं ओर भेजकर देखो।`,
      ),
    ),
    room,
    space(),
  ]);
});

/** What a plane mirror shows: the image and its five properties. */
const image = page("image", (b) => {
  const w = wordsOn(b);
  return column([
    w.title(t("The image in a plane mirror", "समतल दर्पण में प्रतिबिंब")),
    w.body(
      t(
        "Light from every point of your face reaches the mirror and bounces off by the same law. The reflected rays spread apart, so they never meet in front of the mirror. Your eye follows them **straight back behind the mirror**, where they seem to come from: that is where you see your face.",
        "तुम्हारे चेहरे के हर बिंदु से प्रकाश दर्पण तक पहुँचता है और उसी नियम से उछलता है। परावर्तित किरणें फैलती जाती हैं, इसलिए वे दर्पण के सामने कभी नहीं मिलतीं। तुम्हारी आँख उन्हें **सीधे पीछे, दर्पण के पार** तक खींचती है, जहाँ से वे आती हुई लगती हैं: वहीं तुम्हें अपना चेहरा दिखता है।",
      ),
    ),
    w.definition(
      t(
        "**The image formed by a plane mirror** is **virtual** (no light actually reaches it, so it can't be caught on a screen), **erect** (the right way up), **the same size** as the object, **as far behind the mirror as the object is in front**, and **laterally inverted** (your right hand becomes the image's left).",
        "**समतल दर्पण से बना प्रतिबिंब** **आभासी** होता है (वहाँ प्रकाश सचमुच नहीं पहुँचता, इसलिए इसे पर्दे पर नहीं लिया जा सकता), **सीधा** होता है, वस्तु के **बराबर आकार** का होता है, **दर्पण के पीछे उतनी ही दूरी पर** होता है जितनी दूरी पर वस्तु सामने है, और **पार्श्व परिवर्तित** होता है (तुम्हारा दायाँ हाथ प्रतिबिंब का बायाँ बन जाता है)।",
      ),
    ),
    w.body(
      t(
        "A **real** image is one the reflected rays actually meet at: it can be caught on a screen, like the picture a projector throws on a wall. A plane mirror never makes one.",
        "**वास्तविक** प्रतिबिंब वह है जहाँ परावर्तित किरणें सचमुच मिलती हैं: इसे पर्दे पर लिया जा सकता है, जैसे प्रोजेक्टर की तस्वीर दीवार पर। समतल दर्पण कभी ऐसा प्रतिबिंब नहीं बनाता।",
      ),
    ),
    space(),
  ]);
});

/** Example: the angle given from the normal. */
const exampleNormal = page("example-normal", (b) => {
  const w = wordsOn(b);
  return column([
    w.title(t("Example", "उदाहरण")),
    w.body(
      t(
        "**A ray of light strikes a plane mirror at an angle of 30° to the normal. Find the angle of reflection, and the angle between the incident and reflected rays.**",
        "**प्रकाश की एक किरण समतल दर्पण पर अभिलंब से 30° का कोण बनाती हुई पड़ती है। परावर्तन कोण, और आपतित व परावर्तित किरणों के बीच का कोण ज्ञात करो।**",
      ),
    ),
    w.body(
      t(
        r`The angle is already measured from the normal, so $i = 30°$. By the first law, $r = i = 30°$. The two rays sit on either side of the normal, so the angle between them is $i + r = 30° + 30° = 60°$.`,
        r`कोण पहले से अभिलंब से नापा हुआ है, इसलिए $i = 30°$। पहले नियम से, $r = i = 30°$। दोनों किरणें अभिलंब के दोनों ओर हैं, इसलिए उनके बीच का कोण $i + r = 30° + 30° = 60°$ है।`,
      ),
    ),
    space(),
  ]);
});

/** Example: the angle given from the mirror's surface, the usual trap. */
const exampleSurface = page("example-surface", (b) => {
  const w = wordsOn(b);
  return column([
    w.title(t("Example", "उदाहरण")),
    w.body(
      t(
        "**A ray of light makes an angle of 25° with the surface of a plane mirror. Find the angle of reflection.**",
        "**प्रकाश की एक किरण समतल दर्पण की सतह से 25° का कोण बनाती है। परावर्तन कोण ज्ञात करो।**",
      ),
    ),
    w.body(
      t(
        r`The angle given is with the **surface**, not the normal. The normal is at $90°$ to the surface, so the angle of incidence is $i = 90° - 25° = 65°$. Then $r = i = 65°$.`,
        r`दिया गया कोण **सतह** से है, अभिलंब से नहीं। अभिलंब सतह से $90°$ पर है, इसलिए आपतन कोण $i = 90° - 25° = 65°$ है। तब $r = i = 65°$।`,
      ),
    ),
    w.body(
      t(
        'Whenever a question says "with the mirror" or "with the surface", subtract from 90° first. Angles of incidence and reflection are always from the normal.',
        'जब भी प्रश्न "दर्पण से" या "सतह से" कहे, पहले 90° में से घटाओ। आपतन और परावर्तन कोण हमेशा अभिलंब से ही होते हैं।',
      ),
    ),
    space(),
  ]);
});

/** Question: an angle with the surface. */
const questionAngle = page(
  "question-angle",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "angle",
      prompt: t(
        "A ray strikes a plane mirror making 40° with the mirror's surface. The angle of reflection is…",
        "एक किरण समतल दर्पण पर पड़ती है और दर्पण की सतह से 40° बनाती है। परावर्तन कोण है…",
      ),
      options: [
        {
          id: "forty",
          label: t("40°", "40°"),
          feedback: t(
            "40° is the angle with the surface. Angles of reflection are measured from the normal: 90° − 40°.",
            "40° सतह से बना कोण है। परावर्तन कोण अभिलंब से नापा जाता है: 90° − 40°।",
          ),
        },
        { id: "fifty", label: t("50°", "50°") },
        {
          id: "eighty",
          label: t("80°", "80°"),
          feedback: t(
            "80° is the angle between the incident and reflected rays if i were 40°. The question asks for r alone, and i is 90° − 40°.",
            "यदि i 40° होता तो 80° आपतित और परावर्तित किरणों के बीच का कोण होता। प्रश्न अकेले r पूछता है, और i है 90° − 40°।",
          ),
        },
      ],
      answer: "fifty",
    });
    return column([w.title(t("Question", "प्रश्न")), ask, space()]);
  },
  { passOn: PassOn.Rules },
);

/** Question: where the image is. */
const questionImage = page(
  "question-image",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "image",
      prompt: t(
        "Riya stands 2 m in front of a plane mirror. How far is she from her image?",
        "रिया समतल दर्पण के सामने 2 मीटर पर खड़ी है। वह अपने प्रतिबिंब से कितनी दूर है?",
      ),
      options: [
        {
          id: "two",
          label: t("2 m", "2 मीटर"),
          feedback: t(
            "2 m is her distance from the mirror. The image is 2 m behind the mirror, so add the two.",
            "2 मीटर उसकी दर्पण से दूरी है। प्रतिबिंब दर्पण के पीछे 2 मीटर है, इसलिए दोनों जोड़ो।",
          ),
        },
        { id: "four", label: t("4 m", "4 मीटर") },
        {
          id: "one",
          label: t("1 m", "1 मीटर"),
          feedback: t(
            "The image is as far behind the mirror as she is in front, not half as far.",
            "प्रतिबिंब दर्पण के पीछे उतनी ही दूर है जितनी वह सामने है, आधी दूर नहीं।",
          ),
        },
      ],
      answer: "four",
    });
    return column([w.title(t("Question", "प्रश्न")), ask, space()]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order. */
export const overview = [
  story,
  laws,
  play,
  image,
  exampleNormal,
  exampleSurface,
  questionAngle,
  questionImage,
];

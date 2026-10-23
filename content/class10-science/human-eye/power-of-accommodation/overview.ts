import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, goalQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import { EyeAction, EyeDerived, EyeSceneKind, eyeModelDef, eyeSceneDef } from "@chalk/prop-eye";

const r = String.raw;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** Book, then window: one lens, two distances, no waiting. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const board = b.prop(eyeSceneDef, "classroom", { scene: EyeSceneKind.Blackboard });
  b.standsFor(
    board,
    "the classroom from the back, the blackboard far ahead, a notebook on each desk",
  );
  return column([
    w.title(t("One lens, two distances", "एक लेंस, दो दूरियाँ")),
    board,
    w.body(
      t(
        "**Stop 2.** In the front row, Riya copies from the blackboard: look up at the board, look down at her notebook, look up again. Each time, the picture is sharp almost at once. A camera lens has to be moved to focus at a new distance. Her eye lens doesn't move at all.",
        "**पड़ाव 2।** आगे की पंक्ति में रिया ब्लैकबोर्ड से नकल कर रही है: ऊपर बोर्ड को देखो, नीचे कॉपी को, फिर ऊपर। हर बार तस्वीर लगभग तुरंत साफ़ हो जाती है। कैमरे के लेंस को नई दूरी पर फ़ोकस करने के लिए खिसकाना पड़ता है। उसका नेत्र लेंस तो हिलता ही नहीं।",
      ),
    ),
    w.body(
      t(
        "So how does one eye focus on a board 1.5 m away and a notebook 30 cm away? And is there a limit to how close it can manage?",
        "तो एक ही आँख 1.5 मीटर दूर बोर्ड और 30 सेमी दूर कॉपी पर फ़ोकस कैसे करती है? और क्या इसकी कोई सीमा है कि वह कितने पास तक संभाल सकती है?",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** The ciliary muscles change the lens: thin for far, thick for near. */
const shape = page(
  "shape",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "NCERT 11.1.1: the eye lens is jelly-like; the ciliary muscles change its curvature. Relaxed: thin lens, longer focal length, far objects in focus. Contracted: thicker lens, shorter focal length, near objects in focus.",
    );
    const eye = b.prop(eyeModelDef, "eye", {
      objectCm: null,
      showNames: true,
      showRays: true,
      showSees: true,
      canMoveObject: true,
    });
    b.studentOnly(eye.action(EyeAction.MoveObject));
    b.standsFor(
      eye,
      "the eye with an object that can be moved from far away to near: as it comes nearer, the ciliary muscles contract and the eye lens grows thicker, keeping the rays meeting on the retina",
    );
    b.witness(eye.learner(EyeAction.MoveObject, { cm: 50 }));
    const near = choiceQuestion(b, {
      name: "near",
      prompt: t(
        "Bring the object from far away to 50 cm. What happens to the eye lens?",
        "वस्तु को बहुत दूर से 50 सेमी तक लाओ। नेत्र लेंस का क्या होता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "The ciliary muscles contract, the lens gets thicker and its focal length shorter",
            "पक्ष्माभी पेशियाँ सिकुड़ती हैं, लेंस मोटा और उसकी फ़ोकस दूरी छोटी हो जाती है",
          ),
        },
        {
          id: "thin",
          label: t(
            "The ciliary muscles relax, the lens gets thinner and its focal length longer",
            "पक्ष्माभी पेशियाँ ढीली होती हैं, लेंस पतला और उसकी फ़ोकस दूरी लंबी होती है",
          ),
          feedback: t(
            "Watch the lens as the object comes in: it bulges. A thinner lens is for far things.",
            "वस्तु पास आते समय लेंस देखो: वह फूलता है। पतला लेंस दूर की चीज़ों के लिए है।",
          ),
        },
        {
          id: "move",
          label: t(
            "The lens slides forward, closer to the cornea, the way a camera lens moves",
            "लेंस आगे, कॉर्निया के पास खिसकता है, जैसे कैमरे का लेंस चलता है",
          ),
          feedback: t(
            "The lens stays where it is. Unlike a camera, the eye changes the lens's shape, not its place.",
            "लेंस अपनी जगह रहता है। कैमरे के उलट, आँख लेंस का आकार बदलती है, उसकी जगह नहीं।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("A lens that changes shape", "आकार बदलने वाला लेंस")),
      w.body(
        t(
          "Recall from the light chapter: a **thicker** convex lens, more curved, bends light more and has a **shorter focal length**. A thinner one bends less and has a longer focal length.",
          "प्रकाश वाले अध्याय से याद करो: **मोटा** उत्तल लेंस, ज़्यादा वक्रित, प्रकाश को ज़्यादा मोड़ता है और उसकी **फ़ोकस दूरी छोटी** होती है। पतला लेंस कम मोड़ता है और उसकी फ़ोकस दूरी लंबी होती है।",
        ),
      ),
      w.definition(
        t(
          "**How the eye focuses.** The eye lens is made of a soft, jelly-like material, so its curvature can be changed. The **ciliary muscles** around it do this. When they are **relaxed**, the lens is thin, its focal length is long, and **far** things are in focus. When they **contract**, the lens becomes thicker, its focal length shorter, and **near** things are in focus.",
          "**आँख फ़ोकस कैसे करती है।** नेत्र लेंस एक नरम, जेली जैसे पदार्थ का बना है, इसलिए उसकी वक्रता बदली जा सकती है। उसके चारों ओर की **पक्ष्माभी पेशियाँ** यह करती हैं। जब वे **ढीली** होती हैं, लेंस पतला, फ़ोकस दूरी लंबी, और **दूर** की चीज़ें फ़ोकस में होती हैं। जब वे **सिकुड़ती** हैं, लेंस मोटा, फ़ोकस दूरी छोटी, और **पास** की चीज़ें फ़ोकस में होती हैं।",
        ),
      ),
      eye,
      near,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Accommodation, and its limit: the near point. */
const nearPoint = page(
  "near-point",
  (b) => {
    const w = wordsOn(b);
    const eye = b.prop(eyeModelDef, "eye", {
      objectCm: 10,
      showNames: false,
      showRays: true,
      showSees: true,
      showReadout: true,
      canMoveObject: true,
    });
    b.studentOnly(eye.action(EyeAction.MoveObject));
    b.standsFor(
      eye,
      "a normal eye with the chart only 10 cm away: even with the ciliary muscles fully contracted the rays would meet behind the retina, so the chart is blurred; it can be moved farther",
    );
    const goal = goalQuestion(b, {
      about: eye,
      prompt: t(
        "At 10 cm the chart is a blur. Move it away, one step at a time, until it is **just** sharp. Then Check.",
        "10 सेमी पर चार्ट धुँधला है। उसे एक-एक कदम दूर ले जाओ, जब तक वह **बस** साफ़ न हो जाए। फिर जाँचो।",
      ),
      isMet: eye.derived(EyeDerived.IsSharp),
      solve: [eye.learner(EyeAction.MoveObject, { cm: 25 })],
      notes: [
        {
          when: eye.derived(EyeDerived.ImageAt).eq("behind"),
          say: t(
            "Still blurred: the lens is as thick as it can get and the rays would still meet behind the retina. Move the chart farther.",
            "अब भी धुँधला: लेंस जितना मोटा हो सकता है उतना है, फिर भी किरणें दृष्टिपटल के पीछे मिलतीं। चार्ट को और दूर ले जाओ।",
          ),
          reach: [eye.learner(EyeAction.MoveObject, { cm: 15 })],
        },
      ],
    });
    const found = w.definition(
      t(
        "**Accommodation and the near point.** The eye's ability to adjust the focal length of its lens is called its **power of accommodation**. It has a limit: the focal length can't go below a certain minimum. The smallest distance at which the eye sees things clearly without strain is the **near point**, or the **least distance of distinct vision**. For a young adult with normal eyes it is about **25 cm**. That is the standard value used in science: children and teenagers can often focus a little closer, and the near point moves farther away with age.",
        "**समंजन और निकट बिंदु।** अपने लेंस की फ़ोकस दूरी बदलने की आँख की क्षमता को **समंजन क्षमता** कहते हैं। इसकी एक सीमा है: फ़ोकस दूरी एक न्यूनतम से कम नहीं हो सकती। वह सबसे कम दूरी जिस पर आँख बिना तनाव के साफ़ देखती है, **निकट बिंदु** या **स्पष्ट दृष्टि की न्यूनतम दूरी** है। सामान्य आँखों वाले युवा के लिए यह लगभग **25 सेमी** है। विज्ञान में यही मानक मान लिया जाता है: बच्चे और किशोर अक्सर थोड़ा और पास तक देख लेते हैं, और उम्र के साथ निकट बिंदु दूर खिसकता जाता है।",
      ),
      "found",
      { isHidden: true },
    );
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(found));
    return column([
      w.title(t("How close can you see?", "कितने पास तक देख सकते हो?")),
      w.body(
        t(
          "Hold a page very close to your eyes and try to read it. It blurs, and your eyes feel strained. The ciliary muscles are already squeezing as hard as they can.",
          "किसी पन्ने को आँखों के बहुत पास रखकर पढ़ने की कोशिश करो। वह धुँधला हो जाता है, और आँखों पर ज़ोर पड़ता है। पक्ष्माभी पेशियाँ पहले से ही पूरी ताक़त से सिकुड़ रही हैं।",
        ),
      ),
      eye,
      goal,
      found,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The far point: infinity for a normal eye; and the image stays on the retina. */
const farPoint = page(
  "far-point",
  (b) => {
    const w = wordsOn(b);
    const eye = b.prop(eyeModelDef, "eye", {
      objectCm: 100,
      showNames: false,
      showRays: true,
      showSees: true,
      showReadout: true,
      canMoveObject: true,
    });
    b.studentOnly(eye.action(EyeAction.MoveObject));
    b.standsFor(
      eye,
      "a normal eye looking at an object that can be moved out to far away: the rays always meet on the retina, the muscles relaxing as the object goes farther",
    );
    const image = choiceQuestion(b, {
      name: "image",
      prompt: t(
        "Move the object farther and farther. What happens to the image distance inside the eye (lens to image)?",
        "वस्तु को और दूर, और दूर ले जाओ। आँख के अंदर प्रतिबिंब दूरी (लेंस से प्रतिबिंब तक) का क्या होता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "It stays the same: the lens changes its focal length instead",
            "वही रहती है: बदले में लेंस अपनी फ़ोकस दूरी बदलता है",
          ),
        },
        {
          id: "grows",
          label: t(
            "It gets longer: the retina moves back to catch the sharp image",
            "बढ़ जाती है: साफ़ प्रतिबिंब पकड़ने के लिए दृष्टिपटल पीछे खिसकता है",
          ),
          feedback: t(
            "The retina can't move, so the image can't either. To keep it there, the lens gets thinner.",
            "दृष्टिपटल हिल नहीं सकता, इसलिए प्रतिबिंब भी नहीं। उसे वहीं रखने के लिए लेंस पतला होता है।",
          ),
        },
        {
          id: "shrinks",
          label: t(
            "It gets shorter: the eyeball squeezes the retina forward",
            "घट जाती है: नेत्र गोलक दृष्टिपटल को आगे दबा देता है",
          ),
          feedback: t(
            "The distance from lens to retina is fixed by the size of the eyeball, about 2 cm. It's the focal length that changes.",
            "लेंस से दृष्टिपटल की दूरी नेत्र गोलक के आकार से तय है, लगभग 2 सेमी। बदलती फ़ोकस दूरी है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("How far can you see?", "कितनी दूर तक देख सकते हो?")),
      w.definition(
        t(
          "**Far point.** The farthest point up to which the eye can see things clearly is its **far point**. For a normal eye it is at **infinity**: very far away, like the stars. So a normal eye sees clearly everything from **25 cm to infinity**.",
          "**दूर बिंदु।** वह सबसे दूर बिंदु जहाँ तक आँख चीज़ों को साफ़ देख सकती है, उसका **दूर बिंदु** है। सामान्य आँख के लिए यह **अनंत** पर है: बहुत दूर, तारों की तरह। तो सामान्य आँख **25 सेमी से अनंत** तक सब कुछ साफ़ देखती है।",
        ),
      ),
      eye,
      image,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Cataract: the lens goes cloudy. */
const cataract = page(
  "cataract",
  (b) => {
    const w = wordsOn(b);
    const cloudy = choiceQuestion(b, {
      name: "cloudy",
      prompt: t(
        "In a cataract, which part of the eye goes milky and cloudy?",
        "मोतियाबिंद में आँख का कौन-सा हिस्सा दूधिया और धुँधला हो जाता है?",
      ),
      options: [
        { id: "right", label: t("The eye lens", "नेत्र लेंस") },
        {
          id: "retina",
          label: t("The retina", "दृष्टिपटल"),
          feedback: t(
            "The retina is the screen. In a cataract the light is blocked before it gets there, in the lens.",
            "दृष्टिपटल पर्दा है। मोतियाबिंद में प्रकाश वहाँ पहुँचने से पहले, लेंस में ही रुक जाता है।",
          ),
        },
        {
          id: "cornea",
          label: t("The cornea", "कॉर्निया"),
          feedback: t(
            "A cataract is in the crystalline lens behind the pupil, not in the clear cornea at the front.",
            "मोतियाबिंद पुतली के पीछे क्रिस्टलीय लेंस में होता है, आगे के पारदर्शी कॉर्निया में नहीं।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("When the lens clouds over", "जब लेंस धुँधला पड़ जाए")),
      w.definition(
        t(
          "**Cataract.** In some older people the crystalline lens becomes milky and cloudy, so light can't pass through it clearly. This is a **cataract**. It causes partial or complete loss of vision. Sight can be restored by **cataract surgery**, which replaces the cloudy lens.",
          "**मोतियाबिंद।** कुछ बुज़ुर्गों में क्रिस्टलीय लेंस दूधिया और धुँधला हो जाता है, इसलिए प्रकाश उसमें से साफ़ नहीं गुज़र पाता। यह **मोतियाबिंद** है। इससे आंशिक या पूरी दृष्टि जा सकती है। **मोतियाबिंद की शल्य-चिकित्सा** से, जो धुँधले लेंस को बदल देती है, दृष्टि लौट सकती है।",
        ),
      ),
      cloudy,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** Kabir's phone, held at his nose. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const eye = b.prop(eyeModelDef, "eye", {
      objectCm: 5,
      showNames: false,
      showRays: true,
      showSees: true,
      showReadout: false,
      canMoveObject: false,
    });
    b.standsFor(
      eye,
      "a normal eye with a phone held about 5 cm away: blurred, the muscles fully contracted",
    );
    const phone = choiceQuestion(b, {
      name: "phone",
      prompt: t(
        "Kabir plays a game with the phone about 5 cm from his eyes and complains the screen is fuzzy. Why can't his normal eye see it clearly?",
        "कबीर फ़ोन को आँखों से लगभग 5 सेमी दूर रखकर गेम खेलता है और शिकायत करता है कि स्क्रीन धुँधली है। उसकी सामान्य आँख इसे साफ़ क्यों नहीं देख पाती?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "It's nearer than his near point, so even his fully thickened lens can't focus it",
            "वह उसके निकट बिंदु से भी पास है, इसलिए पूरा मोटा हुआ लेंस भी उसे फ़ोकस नहीं कर पाता",
          ),
        },
        {
          id: "bright",
          label: t(
            "The screen is too bright, and the glare blurs it",
            "स्क्रीन बहुत चमकीली है, और चकाचौंध उसे धुँधला करती है",
          ),
          feedback: t(
            "Brightness is handled by the iris and pupil. Sharpness is about distance.",
            "चमक को परितारिका और पुतली संभालती हैं। साफ़ दिखना दूरी की बात है।",
          ),
        },
        {
          id: "defect",
          label: t(
            "He must have myopia, so he needs concave glasses for reading",
            "उसे निकट-दृष्टिता है, इसलिए पढ़ने के लिए अवतल चश्मा चाहिए",
          ),
          feedback: t(
            "Even a perfect eye can't focus closer than about 25 cm. Move the phone back and he'll see it fine.",
            "एक पूरी तरह सही आँख भी लगभग 25 सेमी से पास फ़ोकस नहीं कर सकती। फ़ोन पीछे करो और वह ठीक देख लेगा।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const after = w.body(
      t(
        "Riya, meanwhile, reads in bed and looks up at the moon through the window: the ciliary muscles relax, the lens thins, and the moon is sharp at once. That switch is **accommodation**, and her eyes do it hundreds of times a day without being asked.",
        "इस बीच रिया बिस्तर पर पढ़ते हुए खिड़की से चाँद की ओर देखती है: पक्ष्माभी पेशियाँ ढीली होती हैं, लेंस पतला होता है, और चाँद तुरंत साफ़ दिखता है। यही बदलाव **समंजन** है, और उसकी आँखें इसे दिन में सैकड़ों बार बिना कहे करती हैं।",
      ),
      "after",
      { isHidden: true },
    );
    b.when(phone.on(QuestionSignal.Correct), [theBoard.show(after), theBoard.pass()]);
    return column([
      w.title(t("Too close to see", "देखने के लिए बहुत पास")),
      eye,
      phone,
      after,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** NCERT Exercises 1, 3 and 4. */
const practice = page(
  "practice",
  (b) => {
    const w = wordsOn(b);
    const by = choiceQuestion(b, {
      name: "by",
      prompt: t(
        "The human eye can focus on objects at different distances by adjusting the focal length of the eye lens. This is due to…",
        "मानव नेत्र नेत्र लेंस की फ़ोकस दूरी समायोजित करके अलग-अलग दूरी की वस्तुओं पर फ़ोकस कर सकता है। ऐसा … के कारण है",
      ),
      options: [
        { id: "right", label: t("accommodation", "समंजन") },
        {
          id: "presbyopia",
          label: t("presbyopia", "जरा-दूरदृष्टिता"),
          feedback: t(
            "Presbyopia is when this ability weakens with age. The ability itself has another name.",
            "जरा-दूरदृष्टिता तब है जब उम्र के साथ यह क्षमता कमज़ोर पड़ती है। क्षमता का अपना नाम कुछ और है।",
          ),
        },
        {
          id: "near",
          label: t("near-sightedness", "निकट-दृष्टिता"),
          feedback: t(
            "Near-sightedness is a defect, not the eye's normal ability.",
            "निकट-दृष्टिता एक दोष है, आँख की सामान्य क्षमता नहीं।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const muscles = choiceQuestion(b, {
      name: "muscles",
      prompt: t(
        "The change in focal length of the eye lens is caused by the action of the…",
        "नेत्र लेंस की फ़ोकस दूरी में बदलाव … की क्रिया से होता है",
      ),
      options: [
        { id: "right", label: t("ciliary muscles", "पक्ष्माभी पेशियों") },
        {
          id: "iris",
          label: t("iris", "परितारिका"),
          feedback: t(
            "The iris changes the pupil, not the lens.",
            "परितारिका पुतली बदलती है, लेंस नहीं।",
          ),
        },
        {
          id: "pupil",
          label: t("pupil", "पुतली"),
          feedback: t(
            "The pupil is just a hole: it can't act on anything.",
            "पुतली बस एक छेद है: वह किसी पर क्रिया नहीं कर सकती।",
          ),
        },
        {
          id: "retina",
          label: t("retina", "दृष्टिपटल"),
          feedback: t("The retina only receives the picture.", "दृष्टिपटल केवल तस्वीर ग्रहण करता है।"),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const range = choiceQuestion(b, {
      name: "range",
      prompt: t(
        "What are the near point and the far point of a normal human eye?",
        "सामान्य मानव नेत्र का निकट बिंदु और दूर बिंदु क्या हैं?",
      ),
      options: [
        { id: "right", label: t(r`About 25 cm, and infinity`, "लगभग 25 सेमी, और अनंत") },
        {
          id: "metres",
          label: t("About 25 m, and 100 m", "लगभग 25 मीटर, और 100 मीटर"),
          feedback: t(
            "You can read a book much closer than 25 m! The near point is about 25 cm, and a normal eye sees the stars, so its far point is infinity.",
            "किताब तो तुम 25 मीटर से कहीं पास पढ़ लेते हो! निकट बिंदु लगभग 25 सेमी है, और सामान्य आँख तारे देखती है, इसलिए उसका दूर बिंदु अनंत है।",
          ),
        },
        {
          id: "small",
          label: t("About 2.5 cm, and 25 cm", "लगभग 2.5 सेमी, और 25 सेमी"),
          feedback: t(
            "Try reading at 2.5 cm: impossible. And you can see much farther than 25 cm.",
            "2.5 सेमी पर पढ़कर देखो: असंभव। और तुम 25 सेमी से कहीं दूर देख सकते हो।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ The eye focuses by changing the shape of its lens: accommodation. ✓ A normal eye sees clearly from its near point, about 25 cm, to its far point at infinity. ? Riya can't see the far blackboard, and Grandpa can't see the near newspaper. Next stop: what has gone wrong, and which glasses fix it.",
        "**मिशन लॉग।** ✓ आँख अपने लेंस का आकार बदलकर फ़ोकस करती है: समंजन। ✓ सामान्य आँख अपने निकट बिंदु, लगभग 25 सेमी, से अनंत पर स्थित दूर बिंदु तक साफ़ देखती है। ? रिया को दूर का ब्लैकबोर्ड नहीं दिखता, और दादाजी को पास का अख़बार। अगला पड़ाव: क्या गड़बड़ है, और कौन-से चश्मे इसे ठीक करते हैं।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(by.on(QuestionSignal.Correct), theBoard.show(muscles));
    b.when(muscles.on(QuestionSignal.Correct), theBoard.show(range));
    b.when(range.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), by, muscles, range, log, space()]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [hook, shape, nearPoint, farPoint, cataract, inLife, practice];

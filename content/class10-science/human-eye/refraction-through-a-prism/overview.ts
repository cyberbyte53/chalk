import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import { EyeSceneKind, PrismAction, PrismMode, eyeSceneDef, prismDef } from "@chalk/prop-eye";

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** Part B begins: the drive, the notebook, and Grandpa's glass prism. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const drive = b.prop(eyeSceneDef, "drive", { scene: EyeSceneKind.HillDrive });
  b.standsFor(
    drive,
    "the family car winding up a hill road, Kabir in the back holding up his 'why?' notebook",
  );
  return column([
    w.title(t("Part B: the notebook", "भाग B: कॉपी")),
    drive,
    w.body(
      t(
        "**Stop 4.** Riya has her new glasses, and the family is on the road to the hills. Kabir sits in the back with his WHY? notebook. Grandpa hands him something he found in an old drawer: a three-sided block of glass from a broken chandelier. Kabir holds it in the sunlight from the window and squints through it.",
        "**पड़ाव 4।** रिया के पास नया चश्मा है, और परिवार पहाड़ों की राह पर है। कबीर पीछे अपनी क्यों? वाली कॉपी लेकर बैठा है। दादाजी उसे पुरानी दराज़ में मिली एक चीज़ देते हैं: टूटे झाड़-फ़ानूस का तीन भुजाओं वाला काँच का टुकड़ा। कबीर उसे खिड़की से आती धूप में पकड़ता है और उसके आर-पार देखता है।",
      ),
    ),
    w.body(
      t(
        "Things seen through it jump sideways, out of place. Question 1 in the notebook: **why does this glass bend everything so much?**",
        "इसके आर-पार दिखती चीज़ें बग़ल में, अपनी जगह से हटकर दिखती हैं। कॉपी में सवाल 1: **यह काँच हर चीज़ को इतना क्यों मोड़ता है?**",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** What a prism is, and the path of a ray through it. */
const path = page(
  "path",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "NCERT 11.3 and Activity 11.1: a triangular glass prism (two triangular bases, three rectangular faces, the angle of the prism A); a ray bends towards the normal entering at the first face and away from the normal leaving at the second; incident ray, refracted ray, emergent ray; angles i, r, e.",
    );
    const prism = b.prop(prismDef, "prism", {
      mode: PrismMode.Ray,
      incidence: 50,
      showNormals: true,
      showAngles: true,
      showNames: true,
      canSetIncidence: true,
      canSetMode: false,
    });
    b.studentOnly(prism.action(PrismAction.SetIncidence));
    b.standsFor(
      prism,
      "a ray striking the left face of a glass prism (A = 60°), bending towards the normal inside, then bending away from the normal as it leaves the right face; the angles i, r, e and D are marked and the angle of incidence can be changed",
    );
    const second = choiceQuestion(b, {
      name: "second",
      prompt: t(
        "At the second face the ray goes from glass back into air. Which way does it bend there?",
        "दूसरे फलक पर किरण काँच से फिर हवा में जाती है। वहाँ वह किस ओर मुड़ती है?",
      ),
      options: [
        { id: "right", label: t("Away from the normal", "अभिलंब से दूर") },
        {
          id: "towards",
          label: t("Towards the normal", "अभिलंब की ओर"),
          feedback: t(
            "That happens going into the glass, into the optically denser medium. Coming out into air it bends the other way.",
            "ऐसा काँच में, यानी प्रकाशतः सघन माध्यम में जाते समय होता है। हवा में निकलते समय वह उल्टी ओर मुड़ती है।",
          ),
        },
        {
          id: "straight",
          label: t("It doesn't bend", "वह नहीं मुड़ती"),
          feedback: t(
            "It only goes straight on if it meets the face along the normal. Look at the picture: it bends.",
            "वह केवल तब सीधी जाती है जब फलक से अभिलंब के साथ मिले। चित्र देखो: वह मुड़ती है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("A ray through a prism", "प्रिज़्म से होकर एक किरण")),
      w.definition(
        t(
          "**Prism.** A **triangular glass prism** is a block of glass with two triangular ends (its **bases**) and three rectangular sides (its **lateral faces**). The faces are inclined to each other, not parallel. The angle between the two faces the light passes through is the **angle of the prism**, $A$.",
          "**प्रिज़्म।** **त्रिभुजाकार काँच का प्रिज़्म** काँच का एक टुकड़ा है जिसके दो त्रिभुजाकार सिरे (**आधार**) और तीन आयताकार बगलें (**पार्श्व फलक**) होते हैं। फलक एक-दूसरे की ओर झुके हैं, समानांतर नहीं। जिन दो फलकों से प्रकाश गुज़रता है उनके बीच का कोण **प्रिज़्म कोण** $A$ है।",
        ),
      ),
      w.definition(
        t(
          "**The three rays.** The ray arriving at the first face is the **incident ray**; its angle with the normal there is the **angle of incidence**, $i$. Inside the glass it is the **refracted ray**, at the **angle of refraction**, $r$. The ray leaving the second face is the **emergent ray**, at the **angle of emergence**, $e$, with the normal there.",
          "**तीन किरणें।** पहले फलक पर पहुँचने वाली किरण **आपतित किरण** है; वहाँ अभिलंब से उसका कोण **आपतन कोण** $i$ है। काँच के अंदर वह **अपवर्तित किरण** है, **अपवर्तन कोण** $r$ पर। दूसरे फलक से निकलने वाली किरण **निर्गत किरण** है, वहाँ के अभिलंब से **निर्गत कोण** $e$ पर।",
        ),
      ),
      w.body(
        t(
          "As in the light chapter, going from air into glass the ray bends **towards** the normal. Change the angle of incidence and watch both faces.",
          "प्रकाश वाले अध्याय की तरह, हवा से काँच में जाते समय किरण अभिलंब की **ओर** मुड़ती है। आपतन कोण बदलो और दोनों फलक देखो।",
        ),
      ),
      prism,
      second,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The angle of deviation; why a prism turns light but a slab doesn't. */
const deviation = page(
  "deviation",
  (b) => {
    const w = wordsOn(b);
    const prism = b.prop(prismDef, "prism", {
      mode: PrismMode.Ray,
      incidence: 40,
      showNormals: true,
      showAngles: true,
      showNames: false,
      canSetIncidence: true,
      canSetMode: false,
    });
    b.studentOnly(prism.action(PrismAction.SetIncidence));
    b.standsFor(
      prism,
      "a ray through a prism with the angle of deviation D marked between the incident ray's direction and the emergent ray",
    );
    const slab = choiceQuestion(b, {
      name: "slab",
      prompt: t(
        "Through a glass slab, the emergent ray comes out parallel to the incident ray. Through a prism it comes out turned. Why?",
        "काँच के गुटके से निर्गत किरण आपतित किरण के समानांतर निकलती है। प्रिज़्म से वह मुड़कर निकलती है। क्यों?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "A slab's faces are parallel, so the bends cancel; a prism's are inclined",
            "स्लैब के फलक समानांतर हैं, इसलिए मोड़ मिट जाते हैं; प्रिज़्म के झुके हैं",
          ),
        },
        {
          id: "glass",
          label: t(
            "Prism glass bends light more than slab glass",
            "प्रिज़्म का काँच गुटके के काँच से ज़्यादा मोड़ता है",
          ),
          feedback: t(
            "Both can be the same glass. What differs is the shape: whether the faces are parallel.",
            "दोनों एक ही काँच के हो सकते हैं। फ़र्क़ आकार का है: फलक समानांतर हैं या नहीं।",
          ),
        },
        {
          id: "thick",
          label: t(
            "The prism is thicker, so light spends longer inside the glass and bends more",
            "प्रिज़्म मोटा है, इसलिए प्रकाश काँच में ज़्यादा देर रहकर ज़्यादा मुड़ता है",
          ),
          feedback: t(
            "A thicker slab only shifts the ray further sideways; it still comes out parallel. It's the tilt of the faces that turns it.",
            "मोटा गुटका किरण को बस और बग़ल में खिसकाता है; वह फिर भी समानांतर निकलती है। फलकों का झुकाव ही उसे मोड़ता है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("How much is the ray turned?", "किरण कितनी मुड़ती है?")),
      w.definition(
        t(
          "**Angle of deviation.** Because of the prism's shape, the emergent ray leaves at an angle to the direction of the incident ray. This angle is the **angle of deviation**, $D$.",
          "**विचलन कोण।** प्रिज़्म के आकार के कारण निर्गत किरण आपतित किरण की दिशा से एक कोण पर निकलती है। यह कोण **विचलन कोण** $D$ है।",
        ),
      ),
      prism,
      w.body(
        t(
          "Recall the glass slab from the light chapter: it bends the ray in at one face and out at the other, and because those faces are parallel the two bends undo each other. The ray comes out parallel, just shifted sideways. In a prism both bends turn the ray the **same way**, towards the prism's base.",
          "प्रकाश वाले अध्याय से काँच का गुटका याद करो: वह किरण को एक फलक पर अंदर और दूसरे पर बाहर मोड़ता है, और क्योंकि फलक समानांतर हैं, दोनों मोड़ एक-दूसरे को उलट देते हैं। किरण समानांतर निकलती है, बस बग़ल में खिसकी हुई। प्रिज़्म में दोनों मोड़ किरण को **एक ही ओर** मोड़ते हैं, प्रिज़्म के आधार की ओर।",
        ),
      ),
      slab,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** Kabir's chandelier crystal, explained. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const jump = choiceQuestion(b, {
      name: "jump",
      prompt: t(
        "So why does the road sign, seen through Kabir's chandelier crystal, look as if it has jumped to one side?",
        "तो कबीर के झाड़-फ़ानूस वाले क्रिस्टल से देखने पर सड़क का बोर्ड एक ओर उछला हुआ क्यों दिखता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Its light is turned at both faces of the prism, so it reaches his eye from a new direction, and he sees the sign there",
            "उसका प्रकाश प्रिज़्म के दोनों फलकों पर मुड़ता है, इसलिए वह नई दिशा से उसकी आँख तक पहुँचता है, और उसे बोर्ड वहीं दिखता है",
          ),
        },
        {
          id: "magnify",
          label: t("The crystal magnifies it", "क्रिस्टल उसे बड़ा करता है"),
          feedback: t(
            "A prism isn't a lens: it doesn't make things bigger, it turns their light.",
            "प्रिज़्म लेंस नहीं है: वह चीज़ों को बड़ा नहीं करता, उनके प्रकाश को मोड़ता है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const next = w.body(
      t(
        "Remember from the light chapter: the eye always traces light back in a straight line. Turn the light, and the thing seems to move. Then Kabir tilts the crystal, and a strip of colours appears on the car seat. He writes question 2 in the notebook: **where did those colours come from?**",
        "प्रकाश वाले अध्याय से याद करो: आँख प्रकाश को हमेशा सीधी रेखा में पीछे ले जाती है। प्रकाश मोड़ो, और चीज़ खिसकी हुई लगती है। फिर कबीर क्रिस्टल को झुकाता है, और कार की सीट पर रंगों की एक पट्टी आ जाती है। वह कॉपी में सवाल 2 लिखता है: **ये रंग कहाँ से आए?**",
      ),
      "next",
      { isHidden: true },
    );
    b.when(jump.on(QuestionSignal.Correct), [theBoard.show(next), theBoard.pass()]);
    return column([w.title(t("The jumping road sign", "उछलता सड़क का बोर्ड")), jump, next, space()]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Name the angles; then the mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const prism = b.prop(prismDef, "prism", {
      mode: PrismMode.Ray,
      incidence: 60,
      showNormals: true,
      showAngles: true,
      showNames: true,
      canSetIncidence: false,
      canSetMode: false,
    });
    b.standsFor(prism, "a ray through a prism at i = 60°, with i, r, e, A and D marked");
    const which = choiceQuestion(b, {
      name: "which",
      prompt: t(
        "In the picture, which angle is between the emergent ray and the normal at the second face?",
        "चित्र में निर्गत किरण और दूसरे फलक के अभिलंब के बीच कौन-सा कोण है?",
      ),
      options: [
        { id: "right", label: t("The angle of emergence, e", "निर्गत कोण, e") },
        {
          id: "d",
          label: t("The angle of deviation, D", "विचलन कोण, D"),
          feedback: t(
            "D is between the emergent ray and the incident ray's direction, not the normal.",
            "D निर्गत किरण और आपतित किरण की दिशा के बीच है, अभिलंब से नहीं।",
          ),
        },
        {
          id: "a",
          label: t("The angle of the prism, A", "प्रिज़्म कोण, A"),
          feedback: t(
            "A is between the two faces of the prism. It's part of the glass, not of the ray.",
            "A प्रिज़्म के दोनों फलकों के बीच है। यह काँच का हिस्सा है, किरण का नहीं।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ Notebook Q1: a prism bends light in at one face and out at the other; its faces are inclined, so the ray is turned through the angle of deviation. ? Notebook Q2: where do the colours come from? Next stop: colours and the rainbow.",
        "**मिशन लॉग।** ✓ कॉपी का सवाल 1: प्रिज़्म प्रकाश को एक फलक पर अंदर और दूसरे पर बाहर मोड़ता है; उसके फलक झुके हैं, इसलिए किरण विचलन कोण से मुड़ जाती है। ? कॉपी का सवाल 2: रंग कहाँ से आते हैं? अगला पड़ाव: रंग और इंद्रधनुष।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(which.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), prism, which, log, space()]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [hook, path, deviation, inLife, yourTurn];

import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, goalQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  Medium,
  RefractionAction,
  RefractionDerived,
  RefractionMode,
  SceneKind,
  lightSceneDef,
  refractionDef,
} from "@chalk/prop-light";

const r = String.raw;

/** Hook: the mirrors are done; at dinner the lemon looks bigger and the straw looks broken. */
const dinner = page("dinner", (b) => {
  const w = wordsOn(b);
  const table = b.prop(lightSceneDef, "table", {
    scene: SceneKind.GlassOfWater,
    isLit: true,
    canToggle: false,
  });
  b.standsFor(
    table,
    "a glass of water on the dinner table with a lemon inside that looks bigger than the lemon next to it, and a straw that looks broken at the water's surface",
  );
  return column([
    w.title(t("The giant lemon", "बड़ा नींबू")),
    w.body(
      t(
        "Mirrors are done, and they can't make our projector: every mirror throws the picture **back**, towards the phone and the people watching. We need something light goes **through**. Welcome to **stop 3: bending**.",
        "दर्पण पूरे हुए, और वे हमारा प्रोजेक्टर नहीं बना सकते: हर दर्पण तस्वीर को **वापस** फेंकता है, फ़ोन और देखने वालों की ओर। हमें ऐसी चीज़ चाहिए जिसके **आर-पार** प्रकाश जाए। स्वागत है **पड़ाव 3: मुड़ना** पर।",
      ),
    ),
    table,
    w.body(
      t(
        'Wednesday dinner. Kabir drops a slice of lemon into his water and stops chewing. **"Riya. Look at this."** The lemon in his glass looks **bigger** than the one on the plate. The straw looks snapped in two, right where it enters the water. Nobody touched either of them. What does water do to light on its way through?',
        'बुधवार का खाना। कबीर अपने पानी में नींबू डालता है और चबाना रोक देता है। **"रिया। यह देखो।"** उसके गिलास वाला नींबू प्लेट वाले से **बड़ा** दिखता है। स्ट्रॉ ठीक वहाँ से टूटा लगता है जहाँ वह पानी में घुसता है। किसी ने किसी को छुआ तक नहीं। रास्ते में पानी प्रकाश के साथ क्या करता है?',
      ),
    ),
    space(),
  ]);
});

/** NCERT Activity 10.8: the coin hidden by the bowl's rim reappears when water is poured in. */
const coin = page(
  "coin",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "NCERT Activity 10.8: the coin hidden by the bowl's rim reappears when water is poured in, because light from it bends at the water's surface, and the eye traces it back straight to a raised coin.",
    );
    const bowl = b.prop(refractionDef, "bowl", {
      mode: RefractionMode.Coin,
      top: Medium.Air,
      bottom: Medium.Water,
      water: 0,
    });
    b.studentOnly(bowl.action(RefractionAction.SetWater));
    b.standsFor(
      bowl,
      "a bowl with a coin at the bottom, seen from the side, and an eye placed where the rim just hides the coin",
    );
    const goal = goalQuestion(b, {
      about: bowl,
      prompt: t(
        "Drag the water level up until the eye can see the coin again.",
        "पानी का तल ऊपर खिसकाओ जब तक आँख को सिक्का फिर से न दिखे।",
      ),
      isMet: bowl.derived(RefractionDerived.CoinSeen),
      solve: [bowl.learner(RefractionAction.SetWater, { level: 1 })],
    });
    const why = w.body(
      t(
        "There it is! The coin hasn't moved. Light from it now bends where it leaves the water, and the bent ray clears the rim and reaches the eye. The eye traces it back **in a straight line**, so the coin seems **higher** than it really is. For the same reason the bottom of a pond or a tank looks raised: it is deeper than it looks.",
        "यह रहा! सिक्का नहीं हिला। उससे आता प्रकाश अब पानी से निकलते समय मुड़ता है, और मुड़ी किरण किनारे के ऊपर से आँख तक पहुँचती है। आँख उसे **सीधी रेखा में** पीछे ले जाती है, इसलिए सिक्का असल से **ऊँचा** लगता है। इसी कारण तालाब या टंकी की तली उठी हुई लगती है: वह जितना दिखता है उससे गहरा है।",
      ),
      "why",
      { isHidden: true },
    );
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(why));
    return column([
      w.title(t("The coin in the bowl", "कटोरे में सिक्का")),
      w.body(
        t(
          "NCERT Activity 10.8. Put a coin in an empty bowl. Step back until the rim just hides the coin, and stay there. Then a friend gently pours water into the bowl, without moving the coin. Try it below.",
          "NCERT क्रियाकलाप 10.8। एक ख़ाली कटोरे में सिक्का रखो। तब तक पीछे हटो जब तक किनारा सिक्के को ठीक छिपा न ले, और वहीं रुको। फिर एक दोस्त सिक्के को हिलाए बिना धीरे से कटोरे में पानी डालता है। नीचे आज़माओ।",
        ),
      ),
      bowl,
      goal,
      why,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Medium and interface; what looks wrong; refraction defined; air into glass bends towards the normal. */
const bend = page(
  "bend",
  (b) => {
    const w = wordsOn(b);
    const edge = b.prop(refractionDef, "edge", {
      mode: RefractionMode.Boundary,
      top: Medium.Air,
      bottom: Medium.CrownGlass,
      incidence: 40,
      showNormal: true,
      showAngles: true,
      showIncidentExtension: true,
    });
    b.studentOnly(edge.action(RefractionAction.SetIncidence));
    b.standsFor(
      edge,
      "a ray going from air into glass at an interface, with the normal, i and r, and a dotted line showing where it would have gone straight on",
    );
    const along = choiceQuestion(b, {
      name: "along",
      prompt: t(
        "Drag the ray until it comes in along the normal (i = 0°). What happens?",
        "किरण को तब तक खिसकाओ जब तक वह अभिलंब के साथ (i = 0°) न आए। क्या होता है?",
      ),
      options: [
        {
          id: "right",
          label: t("It goes straight on, without bending", "वह बिना मुड़े सीधी चली जाती है"),
        },
        {
          id: "bends",
          label: t("It bends towards the normal", "वह अभिलंब की ओर मुड़ती है"),
          feedback: t(
            "It is already along the normal, so there is nowhere to bend towards. Look at r: it is 0° too.",
            "वह पहले से अभिलंब के साथ है, इसलिए मुड़ने की कोई जगह नहीं। r देखो: वह भी 0° है।",
          ),
        },
        {
          id: "back",
          label: t("It reflects straight back", "वह सीधी वापस परावर्तित होती है"),
          feedback: t(
            "Glass is transparent: the light goes into it. Look below the interface.",
            "काँच पारदर्शी है: प्रकाश उसमें जाता है। अंतरापृष्ठ के नीचे देखो।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Refraction", "अपवर्तन")),
      w.definition(
        t(
          "**Two new words.** A material that light travels through is a **medium**. Air, water and glass are all media. (You met **transparent** in lesson 1: a medium you can see clearly through.) The surface where two media meet, like the top of the water in a glass, is the **interface**.",
          "**दो नए शब्द।** जिस पदार्थ से होकर प्रकाश चलता है, वह **माध्यम** है। वायु, पानी और काँच सब माध्यम हैं। (**पारदर्शी** तुम पाठ 1 में मिल चुके हो: ऐसा माध्यम जिसके आर-पार साफ़ दिखे।) जिस सतह पर दो माध्यम मिलते हैं, जैसे गिलास में पानी की ऊपरी सतह, वह **अंतरापृष्ठ** है।",
        ),
      ),
      w.body(
        t(
          "In a transparent medium, light travels in straight lines. But look at what happens where it crosses from one medium into another. The bottom of a pond looks raised. Letters under a thick glass slab look raised. A pencil standing in a glass of water looks displaced at the water's surface. A lemon in a glass of water looks bigger from the side. In each case the light reaching your eye seems to come from a different direction than it really did.",
          "पारदर्शी माध्यम में प्रकाश सीधी रेखाओं में चलता है। पर देखो, जहाँ वह एक माध्यम से दूसरे में जाता है वहाँ क्या होता है। तालाब की तली उठी हुई लगती है। मोटे काँच के गुटके के नीचे अक्षर उठे हुए लगते हैं। पानी के गिलास में खड़ी पेंसिल पानी की सतह पर खिसकी हुई लगती है। पानी के गिलास में नींबू बग़ल से बड़ा दिखता है। हर बार आँख तक पहुँचता प्रकाश किसी और दिशा से आता हुआ लगता है।",
        ),
      ),
      w.definition(
        t(
          "**Refraction.** When light goes **slantwise** from one transparent medium into another, it changes direction at the interface. This bending of light is **refraction**. The ray in the second medium is the **refracted ray**. The angle between it and the normal is the **angle of refraction**, $r$.",
          "**अपवर्तन।** जब प्रकाश एक पारदर्शी माध्यम से दूसरे में **तिरछा** जाता है, तो अंतरापृष्ठ पर उसकी दिशा बदल जाती है। प्रकाश का यह मुड़ना **अपवर्तन** है। दूसरे माध्यम में किरण **अपवर्तित किरण** है। उसके और अभिलंब के बीच का कोण **अपवर्तन कोण** $r$ है।",
        ),
      ),
      w.body(
        t(
          "Here light goes from air into glass. The dotted line shows where the ray would have gone if nothing happened. Drag the ray: it always bends **towards the normal** in the glass, so $r$ is smaller than $i$.",
          "यहाँ प्रकाश वायु से काँच में जाता है। बिंदुदार रेखा दिखाती है कि कुछ न होता तो किरण कहाँ जाती। किरण को खिसकाओ: काँच में वह हमेशा **अभिलंब की ओर** मुड़ती है, इसलिए $r$, $i$ से छोटा है।",
        ),
      ),
      edge,
      along,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** NCERT Activity 10.10: the glass slab. Towards, then away; emergent ray parallel, shifted sideways. */
const slab = page(
  "slab",
  (b) => {
    const w = wordsOn(b);
    const block = b.prop(refractionDef, "block", {
      mode: RefractionMode.Slab,
      top: Medium.Air,
      bottom: Medium.CrownGlass,
      incidence: 40,
      showNormal: true,
      showAngles: true,
      showIncidentExtension: true,
    });
    b.studentOnly(block.action(RefractionAction.SetIncidence));
    b.standsFor(
      block,
      "a ray through a rectangular glass slab: incident ray at O, refracted ray across the slab, emergent ray at O′, normals at both faces, and a dotted line continuing the incident ray",
    );
    const parallel = choiceQuestion(b, {
      name: "parallel",
      prompt: t(
        "Drag the ray to different angles. How does the emergent ray compare with the incident ray?",
        "किरण को अलग-अलग कोणों पर खिसकाओ। निर्गत किरण, आपतित किरण की तुलना में कैसी है?",
      ),
      options: [
        {
          id: "right",
          label: t("Parallel to it, shifted a little sideways", "उसके समानांतर, थोड़ी बग़ल में खिसकी हुई"),
        },
        {
          id: "same",
          label: t(
            "On the same straight line as the incoming ray",
            "आने वाली किरण की ही सीधी रेखा पर",
          ),
          feedback: t(
            "Look at the dotted line: the emergent ray runs beside it, not on it.",
            "बिंदुदार रेखा देखो: निर्गत किरण उसके साथ-साथ चलती है, उस पर नहीं।",
          ),
        },
        {
          id: "steeper",
          label: t("Bent more steeply, towards the slab", "स्लैब की ओर ज़्यादा तीखी मुड़ी हुई"),
          feedback: t(
            "Compare the angle at the bottom face with the angle at the top face: they are equal.",
            "नीचे की सतह पर कोण की तुलना ऊपर की सतह के कोण से करो: वे बराबर हैं।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const reason = w.body(
      t(
        "At O, light goes from air into glass and bends **towards** the normal. At O′, it goes from glass back into air and bends **away** from the normal, by exactly as much: the angle of emergence equals the angle of incidence. The two faces are parallel, so the two bends cancel: the emergent ray comes out **parallel to the incident ray**, only shifted sideways a little. That sideways shift is why the ink line looked broken.",
        "O पर प्रकाश वायु से काँच में जाता है और अभिलंब की **ओर** मुड़ता है। O′ पर वह काँच से वापस वायु में जाता है और अभिलंब से **दूर**, ठीक उतना ही, मुड़ता है: निर्गत कोण आपतन कोण के बराबर है। दोनों सतहें समानांतर हैं, इसलिए दोनों मोड़ एक-दूसरे को काट देते हैं: निर्गत किरण **आपतित किरण के समानांतर** निकलती है, बस थोड़ी बग़ल में खिसकी हुई। इसी खिसकाव से स्याही की रेखा टूटी दिखी थी।",
      ),
      "reason",
      { isHidden: true },
    );
    b.when(parallel.on(QuestionSignal.Correct), [theBoard.show(reason), theBoard.pass()]);
    return column([
      w.title(t("Through a glass slab", "काँच के गुटके से होकर")),
      w.body(
        t(
          "NCERT Activity 10.9: draw a thick ink line on paper and put a rectangular glass slab over it, slanting. From the side, the line seems **broken** at the slab's edges. From straight above, the part under the glass seems **raised**. To see why, follow one ray through the slab (Activity 10.10).",
          "NCERT क्रियाकलाप 10.9: कागज़ पर स्याही की मोटी रेखा खींचो और उस पर काँच का आयताकार गुटका तिरछा रखो। बग़ल से देखने पर रेखा गुटके के किनारों पर **टूटी** लगती है। ठीक ऊपर से देखने पर काँच के नीचे वाला हिस्सा **उठा हुआ** लगता है। क्यों, यह देखने के लिए गुटके से होकर एक किरण का पीछा करो (क्रियाकलाप 10.10)।",
        ),
      ),
      w.definition(
        t(
          "**Names for the slab.** The ray coming in is the **incident ray**; it meets the top face at O. Inside the glass, the **refracted ray** goes across to O′ on the bottom face. The ray that comes out into the air again is the **emergent ray**. The angle between the emergent ray and the normal at O′ is the **angle of emergence**, $e$.",
          "**गुटके के नाम।** आती किरण **आपतित किरण** है; वह ऊपरी सतह से O पर मिलती है। काँच के अंदर **अपवर्तित किरण** नीचे की सतह पर O′ तक जाती है। जो किरण फिर से वायु में निकलती है, वह **निर्गत किरण** है। O′ पर निर्गत किरण और अभिलंब के बीच का कोण **निर्गत कोण** $e$ है।",
        ),
      ),
      block,
      parallel,
      reason,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Why light bends: its speed changes. Slower: towards the normal. Faster: away. */
const speed = page(
  "speed",
  (b) => {
    const w = wordsOn(b);
    const edge = b.prop(refractionDef, "edge", {
      mode: RefractionMode.Boundary,
      top: Medium.Air,
      bottom: Medium.Water,
      incidence: 40,
      showNormal: true,
      showAngles: true,
      showSpeeds: true,
      canChooseMedium: true,
    });
    b.studentOnly(edge.action(RefractionAction.SetIncidence));
    b.studentOnly(edge.action(RefractionAction.SetMedium));
    b.standsFor(
      edge,
      "a ray crossing from one medium into another, each labelled with the speed of light in it; the learner can change either medium",
    );
    const out = choiceQuestion(b, {
      name: "out",
      prompt: t(
        "Light goes from water into air. Which way does it bend?",
        "प्रकाश पानी से वायु में जाता है। वह किस ओर मुड़ता है?",
      ),
      options: [
        { id: "right", label: t("Away from the normal", "अभिलंब से दूर") },
        {
          id: "towards",
          label: t("Towards the normal", "अभिलंब की ओर"),
          feedback: t(
            "Light speeds up going from water into air, so it bends away from the normal. Swap the two media above to see it.",
            "पानी से वायु में जाते समय प्रकाश तेज़ होता है, इसलिए वह अभिलंब से दूर मुड़ता है। ऊपर दोनों माध्यम बदलकर देखो।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Why light bends", "प्रकाश क्यों मुड़ता है")),
      w.body(t("Why does light bend at all?", "प्रकाश मुड़ता ही क्यों है?")),
      w.definition(
        t(
          r`**The speed of light.** Light doesn't travel at the same speed everywhere. It is fastest in a **vacuum**: completely empty space, with no air at all. There its speed is $$3 \times 10^8 \text{ m/s}$$ that is, 300 000 km every second. In air it is only a tiny bit slower. In water and glass it is a lot slower. **Refraction happens because the speed of light changes** when it goes from one medium into another.`,
          r`**प्रकाश की चाल।** प्रकाश हर जगह एक ही चाल से नहीं चलता। वह **निर्वात** में सबसे तेज़ है: बिल्कुल ख़ाली जगह, जहाँ वायु भी नहीं। वहाँ उसकी चाल है $$3 \times 10^8 \text{ मीटर/सेकंड}$$ यानी हर सेकंड 3 लाख किलोमीटर। वायु में वह बस थोड़ा धीमा है। पानी और काँच में बहुत धीमा। **अपवर्तन इसलिए होता है क्योंकि प्रकाश की चाल बदलती है** जब वह एक माध्यम से दूसरे में जाता है।`,
        ),
      ),
      w.definition(
        t(
          "**Which way.** Going into a medium where it is **slower**, light bends **towards** the normal. Going into a medium where it is **faster**, it bends **away** from the normal.",
          "**किस ओर।** ऐसे माध्यम में जाते समय जहाँ वह **धीमा** है, प्रकाश अभिलंब की **ओर** मुड़ता है। ऐसे माध्यम में जाते समय जहाँ वह **तेज़** है, वह अभिलंब से **दूर** मुड़ता है।",
        ),
      ),
      edge,
      w.body(
        t(
          "Use the two pickers under the picture (light comes from, light goes into) and watch the speeds. Every time the second speed is lower, the ray bends towards the normal.",
          "चित्र के नीचे दोनों चुनने वाले बटन (प्रकाश यहाँ से आता है, प्रकाश यहाँ जाता है) से माध्यम बदलो और चालें देखो। हर बार जब दूसरी चाल कम होती है, किरण अभिलंब की ओर मुड़ती है।",
        ),
      ),
      out,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The laws of refraction: sin i / sin r is the same at every angle. Worked numbers first. */
const laws = page(
  "laws",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "Find Snell's law from readings: at i = 40° into crown glass, r = 25.0°, and sin 40° / sin 25.0° = 0.643 / 0.423 = 1.52; the learner drags to other angles and the ratio stays 1.52. Then the two laws of refraction.",
    );
    const edge = b.prop(refractionDef, "edge", {
      mode: RefractionMode.Boundary,
      top: Medium.Air,
      bottom: Medium.CrownGlass,
      incidence: 40,
      showNormal: true,
      showAngles: true,
      showSines: true,
    });
    b.studentOnly(edge.action(RefractionAction.SetIncidence));
    b.standsFor(
      edge,
      "a ray from air into crown glass with i, r, sin i, sin r, sin i / sin r and i / r read out",
    );
    const same = choiceQuestion(b, {
      name: "same",
      prompt: t(
        "Drag the ray to three or four different angles. What stays the same?",
        "किरण को तीन-चार अलग कोणों पर खिसकाओ। क्या वही रहता है?",
      ),
      options: [
        { id: "right", label: t("sin i / sin r", "sin i / sin r") },
        {
          id: "diff",
          label: t("i − r (how much it bends)", "i − r (कितना मुड़ा)"),
          feedback: t(
            "Check the readout at a small angle and at a large one: the difference grows. Look at the ratio of the sines.",
            "छोटे और बड़े कोण पर रीडआउट देखो: अंतर बढ़ता है। ज्याओं का अनुपात देखो।",
          ),
        },
        {
          id: "ratio",
          label: t("i / r (the angles themselves)", "i / r (स्वयं कोण)"),
          feedback: t(
            "Watch i / r in the readout as you drag: about 1.5 at small angles, but about 1.8 at 70°. It creeps up. sin i / sin r stays at 1.52.",
            "खिसकाते समय रीडआउट में i / r देखो: छोटे कोणों पर लगभग 1.5, पर 70° पर लगभग 1.8। यह बढ़ता जाता है। sin i / sin r 1.52 पर ही रहता है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const rule = w.definition(
      t(
        r`**The laws of refraction.** (1) The incident ray, the refracted ray and the normal at the point of incidence all lie in the same flat sheet (the same **plane**), like the page of a book. (2) For light of a given colour and a given pair of media, $$\frac{\sin i}{\sin r} = \text{constant}$$ This is **Snell's law**.`,
        r`**अपवर्तन के नियम।** (1) आपतित किरण, अपवर्तित किरण और आपतन बिंदु पर अभिलंब, तीनों एक ही सपाट सतह (एक ही **तल**) में होते हैं, जैसे किताब का एक पन्ना। (2) किसी दिए गए रंग के प्रकाश और माध्यमों की किसी दी गई जोड़ी के लिए $$\frac{\sin i}{\sin r} = \text{स्थिरांक}$$ यह **स्नेल का नियम** है।`,
      ),
      "rule",
      { isHidden: true },
    );
    const next = w.body(
      t(
        "That constant gets its own name in the next lesson: the refractive index.",
        "इस स्थिरांक को अगले पाठ में अपना नाम मिलता है: अपवर्तनांक।",
      ),
      "next",
      { isHidden: true },
    );
    b.when(same.on(QuestionSignal.Correct), [
      theBoard.show(rule),
      theBoard.show(next),
      theBoard.pass(),
    ]);
    return column([
      w.title(t("The laws of refraction", "अपवर्तन के नियम")),
      w.body(
        t(
          "How much does a ray bend? We want a number for it. Comparing the two angles directly doesn't give a steady number. Scientists found that comparing their **sines** does.",
          "किरण कितना मुड़ती है? हमें इसके लिए एक संख्या चाहिए। दोनों कोणों की सीधी तुलना से कोई स्थिर संख्या नहीं मिलती। वैज्ञानिकों ने पाया कि उनकी **ज्याओं** (sin) की तुलना से मिलती है।",
        ),
      ),
      w.definition(
        t(
          r`**What is sin?** Every angle has a number called its **sine**, written $\sin$. A calculator gives it, and the readout below shows it for you. (You'll meet it properly in maths, in trigonometry.) For angles from 0° to 90°, the sine goes from 0 up to 1: a bigger angle has a bigger sine. For example, $$\sin 40° = 0.643, \qquad \sin 25° = 0.423$$`,
          r`**sin क्या है?** हर कोण की एक संख्या होती है जिसे उसकी **ज्या** कहते हैं, लिखते हैं $\sin$। कैलकुलेटर इसे देता है, और नीचे का रीडआउट तुम्हें दिखाता है। (गणित में त्रिकोणमिति में तुम इसे ठीक से पढ़ोगे।) 0° से 90° तक के कोणों के लिए ज्या 0 से 1 तक जाती है: बड़े कोण की ज्या बड़ी। जैसे, $$\sin 40° = 0.643, \qquad \sin 25° = 0.423$$`,
        ),
      ),
      w.body(
        t(
          r`Light goes from air into crown glass at $i = 40°$ and comes out at $r = 25.0°$. Compare the sines: $$\frac{\sin 40°}{\sin 25.0°} = \frac{0.643}{0.423} = 1.52$$ The readout also shows $i / r$, the plain angles divided, so you can compare the two.`,
          r`प्रकाश वायु से क्राउन काँच में $i = 40°$ पर जाता है और $r = 25.0°$ पर निकलता है। ज्याओं की तुलना करो: $$\frac{\sin 40°}{\sin 25.0°} = \frac{0.643}{0.423} = 1.52$$ रीडआउट $i / r$ भी दिखाता है, यानी सीधे कोणों का भाग, ताकि तुम दोनों की तुलना कर सको।`,
        ),
      ),
      edge,
      same,
      rule,
      next,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** See it in life: back to dinner: the straw, the coin in the bucket, and the lemon. */
const table = page(
  "table",
  (b) => {
    const w = wordsOn(b);
    const glass = b.prop(lightSceneDef, "glass", {
      scene: SceneKind.GlassOfWater,
      isLit: true,
      canToggle: false,
    });
    b.standsFor(
      glass,
      "the glass of water again: a lemon inside looking bigger than the one beside it, and a straw that looks broken at the water's surface",
    );
    const straw = choiceQuestion(b, {
      name: "straw",
      prompt: t(
        "The straw isn't broken: Kabir pulls it out and it's fine. So why does it look snapped at the water's surface?",
        "स्ट्रॉ टूटा नहीं है: कबीर उसे निकालता है और वह ठीक है। तो वह पानी की सतह पर टूटा क्यों दिखता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Light from the part under water bends as it comes out",
            "पानी के नीचे वाले हिस्से से आता प्रकाश बाहर निकलते समय मुड़ता है",
          ),
        },
        {
          id: "swell",
          label: t(
            "The water pushes the straw sideways where it enters",
            "जहाँ स्ट्रॉ घुसती है, पानी उसे बग़ल में धकेलता है",
          ),
          feedback: t(
            "Pull it out and it's perfectly straight. Nothing happened to the straw, only to its light.",
            "निकालो तो वह बिल्कुल सीधा है। स्ट्रॉ को कुछ नहीं हुआ, बस उसके प्रकाश को।",
          ),
        },
        {
          id: "mirror",
          label: t("The glass reflects it, like a mirror", "गिलास उसे दर्पण की तरह परावर्तित करता है"),
          feedback: t(
            "You're looking through the glass, not into it. The light comes through to your eyes.",
            "तुम गिलास के आर-पार देख रहे हो, उसमें नहीं। प्रकाश आर-पार होकर तुम्हारी आँखों तक आता है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const strawWhy = w.body(
      t(
        "Refraction. Light from the bottom part of the straw speeds up as it leaves the water and bends away from the normal. Your eye traces it back in a straight line, as always, so that part seems to be somewhere else: the straw looks snapped.",
        "अपवर्तन। स्ट्रॉ के निचले हिस्से से आता प्रकाश पानी से निकलते समय तेज़ होता है और अभिलंब से दूर मुड़ता है। तुम्हारी आँख हमेशा की तरह उसे सीधी रेखा में पीछे ले जाती है, इसलिए वह हिस्सा कहीं और लगता है: स्ट्रॉ टूटा दिखता है।",
      ),
      "strawWhy",
      { isHidden: true },
    );
    const bucket = choiceQuestion(b, {
      name: "bucket",
      prompt: t(
        "After dinner Kabir drops a coin into a bucket of water and dares Riya to grab it in one go. She reaches for where she sees it, and misses. Where is the coin really?",
        "खाने के बाद कबीर पानी की बाल्टी में एक सिक्का डालता है और रिया को एक बार में उठाने की चुनौती देता है। वह जहाँ सिक्का दिखता है वहाँ हाथ डालती है, और चूक जाती है। सिक्का असल में कहाँ है?",
      ),
      options: [
        { id: "right", label: t("Deeper than it looks", "जितना दिखता है उससे गहरा") },
        {
          id: "higher",
          label: t("Higher than it looks", "जितना दिखता है उससे ऊँचा"),
          feedback: t(
            "Remember the bowl: water made the coin look raised. So the real coin is lower.",
            "कटोरा याद करो: पानी से सिक्का उठा हुआ दिखा था। तो असली सिक्का नीचे है।",
          ),
        },
        {
          id: "same",
          label: t("Exactly where it looks", "ठीक जहाँ दिखता है"),
          feedback: t(
            "Then she wouldn't have missed. Light from the coin bends as it leaves the water.",
            "तब वह चूकती नहीं। सिक्के से आता प्रकाश पानी से निकलते समय मुड़ता है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
      isHidden: true,
    });
    const lemon = w.body(
      t(
        "And the giant lemon? The round glass of water is **curved**, and a curved piece of water or glass bends the light from the lemon in a special way that makes it look bigger. That is exactly what our projector needs: something curved that light goes through. Before we get there, one question: which materials bend light the most?",
        "और बड़ा नींबू? पानी का गोल गिलास **मुड़ा हुआ** है, और पानी या काँच का मुड़ा हुआ टुकड़ा नींबू से आते प्रकाश को एक ख़ास तरह से मोड़कर उसे बड़ा दिखाता है। हमारे प्रोजेक्टर को ठीक यही चाहिए: कुछ मुड़ा हुआ जिसके आर-पार प्रकाश जाए। वहाँ पहुँचने से पहले एक सवाल: कौन-से पदार्थ प्रकाश को सबसे ज़्यादा मोड़ते हैं?",
      ),
      "lemon",
      { isHidden: true },
    );
    b.when(straw.on(QuestionSignal.Correct), [theBoard.show(strawWhy), theBoard.show(bucket)]);
    b.when(bucket.on(QuestionSignal.Correct), [theBoard.show(lemon), theBoard.pass()]);
    return column([
      w.title(t("Back to dinner", "वापस खाने पर")),
      glass,
      straw,
      strawWhy,
      bucket,
      lemon,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Practice: a worked slab example with its figure. */
const example = page("example", (b) => {
  const w = wordsOn(b);
  const block = b.prop(refractionDef, "block", {
    mode: RefractionMode.Slab,
    top: Medium.Air,
    bottom: Medium.CrownGlass,
    incidence: 50,
    showNormal: true,
    showAngles: true,
    showIncidentExtension: true,
  });
  b.standsFor(
    block,
    "a ray hitting a rectangular glass slab at 50°, bending towards the normal inside and coming out parallel to the incident ray at the angle of emergence",
  );
  return column([
    w.title(t("Example: through the slab", "उदाहरण: गुटके से होकर")),
    w.body(
      t(
        "**A ray of light strikes one face of a rectangular glass slab at an angle of incidence of 50°. What is the angle of emergence at the opposite face, and in which direction does the emergent ray travel?**",
        "**प्रकाश की एक किरण काँच के आयताकार गुटके की एक सतह पर 50° के आपतन कोण पर पड़ती है। सामने की सतह पर निर्गत कोण क्या है, और निर्गत किरण किस दिशा में जाती है?**",
      ),
    ),
    block,
    w.body(
      t(
        "At the top face, light goes from air into glass, slows down and bends **towards** the normal. At the bottom face it goes from glass into air, speeds up and bends **away** from the normal by exactly as much, because the two faces are parallel. So the angle of emergence equals the angle of incidence:",
        "ऊपरी सतह पर प्रकाश वायु से काँच में जाता है, धीमा होता है और अभिलंब की **ओर** मुड़ता है। निचली सतह पर वह काँच से वायु में जाता है, तेज़ होता है और अभिलंब से ठीक उतना ही **दूर** मुड़ता है, क्योंकि दोनों सतहें समानांतर हैं। इसलिए निर्गत कोण आपतन कोण के बराबर है:",
      ),
    ),
    w.body(t(r`$$e = i = 50°$$`, r`$$e = i = 50°$$`)),
    w.body(
      t(
        "The emergent ray travels **parallel** to the incident ray, shifted a little sideways.",
        "निर्गत किरण आपतित किरण के **समानांतर** चलती है, थोड़ी बग़ल में खिसकी हुई।",
      ),
    ),
    space(),
  ]);
});

/** NCERT in-text Q1. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "A ray of light in air enters water slantwise. Does it bend towards the normal or away from it, and why?",
        "वायु में चलती प्रकाश की एक किरण पानी में तिरछी प्रवेश करती है। वह अभिलंब की ओर मुड़ती है या उससे दूर, और क्यों?",
      ),
      options: [
        {
          id: "right",
          label: t("Towards: light is slower in water", "ओर: पानी में प्रकाश धीमा है"),
        },
        {
          id: "away",
          label: t("Away: light is slower in water", "दूर: पानी में प्रकाश धीमा है"),
          feedback: t(
            "Slower means towards the normal. Away is for light speeding up.",
            "धीमा होने का अर्थ है अभिलंब की ओर। दूर तब, जब प्रकाश तेज़ हो।",
          ),
        },
        {
          id: "faster",
          label: t("Towards: light is faster in water", "ओर: पानी में प्रकाश तेज़ है"),
          feedback: t(
            "Light is slower in water than in air, not faster. That's why it bends towards the normal.",
            "पानी में प्रकाश वायु से धीमा है, तेज़ नहीं। इसीलिए वह अभिलंब की ओर मुड़ता है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log, stop 3.** ✓ Water and glass let light **through**, and bend it where it crosses a surface: towards the normal going in, away coming out. ✗ A flat slab bends it in and straight back out again, so nothing comes to a point. ? A **curved** piece of glass might bend all the rays to one point, like the concave mirror did. But which material bends light the most?",
        "**मिशन लॉग, पड़ाव 3।** ✓ पानी और काँच प्रकाश को **आर-पार** जाने देते हैं, और सतह पार करते समय उसे मोड़ते हैं: अंदर जाते समय अभिलंब की ओर, बाहर आते समय दूर। ✗ सपाट गुटका उसे अंदर मोड़कर फिर वापस सीधा कर देता है, इसलिए कुछ भी एक बिंदु पर नहीं आता। ? काँच का एक **मुड़ा हुआ** टुकड़ा शायद सारी किरणों को एक बिंदु पर मोड़ दे, जैसे अवतल दर्पण ने किया था। पर कौन-सा पदार्थ प्रकाश को सबसे ज़्यादा मोड़ता है?",
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
export const overview = [dinner, bend, coin, slab, speed, laws, table, example, yourTurn];

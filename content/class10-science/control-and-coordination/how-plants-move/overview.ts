import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  ControlScene,
  PlantAction,
  PlantKind,
  Side,
  controlSceneDef,
  plantMovementDef,
} from "@chalk/prop-control";

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** Grandpa's chhui-mui folds at a touch. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const terrace = b.prop(controlSceneDef, "terrace", { scene: ControlScene.ChhuiMui });
  b.standsFor(
    terrace,
    "on the terrace, Kabir touches the leaves of Grandpa's chhui-mui while Grandpa watches",
  );
  return column([
    w.title(t("A plant that flinches", "एक पौधा जो सिहर जाता है")),
    terrace,
    w.body(
      t(
        "**Stop 4.** So far: animals detect changes with receptors, carry messages along neurons, and move with muscles, controlled by the brain and spinal cord.",
        "**पड़ाव 4।** अब तक: जंतु ग्राहियों से बदलाव पहचानते हैं, तंत्रिका कोशिकाओं पर संदेश ले जाते हैं, और पेशियों से हिलते हैं, जिन्हें मस्तिष्क और मेरुरज्जु नियंत्रित करते हैं।",
      ),
    ),
    w.body(
      t(
        "On the terrace, Kabir touches one leaf of Grandpa's **chhui-mui**, and the leaflets fold up one after another and the leaf droops. Grandpa smiles: \"No brain. No nerves. No muscles. And yet it moved.\" Riya decides the fourth exhibit will be plants. This lesson finds out how a plant can respond to a stimulus with none of an animal's equipment.",
        'छत पर कबीर दादाजी की **छुई-मुई** की एक पत्ती छूता है, और पत्रक एक के बाद एक सिमट जाते हैं और पत्ती झुक जाती है। दादाजी मुस्कुराते हैं: "न मस्तिष्क। न तंत्रिकाएँ। न पेशियाँ। फिर भी यह हिली।" रिया तय करती है कि चौथा प्रदर्श पौधों पर होगा। यह पाठ पता लगाता है कि जंतुओं का कोई साधन न होने पर भी पौधा उद्दीपन पर अनुक्रिया कैसे कर सकता है।',
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Two kinds of plant movement. */
const twoKinds = page(
  "two-kinds",
  (b) => {
    const w = wordsOn(b);
    const kind = choiceQuestion(b, {
      name: "kind",
      prompt: t(
        "A seedling's root goes down and its stem comes up. If its growth is stopped, will it still move like this?",
        "अंकुर की जड़ नीचे जाती है और तना ऊपर आता है। अगर उसकी वृद्धि रोक दी जाए, तो क्या वह फिर भी ऐसे हिलेगा?",
      ),
      options: [
        {
          id: "right",
          label: t("No: this movement depends on growth", "नहीं: यह गति वृद्धि पर निर्भर है"),
        },
        {
          id: "yes",
          label: t("Yes, like the touch-me-not's leaves", "हाँ, छुई-मुई की पत्तियों की तरह"),
          feedback: t(
            "The touch-me-not moves without growing. A seedling's turning comes from growth, and stops if growth stops.",
            "छुई-मुई बिना बढ़े हिलती है। अंकुर का मुड़ना वृद्धि से होता है, और वृद्धि रुकने पर रुक जाता है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Two ways a plant moves", "पौधा दो तरह से गति करता है")),
      w.body(
        t(
          "Plants have **neither a nervous system nor muscles**. Yet they respond to stimuli. Look at two examples: the leaves of the sensitive plant fold **very quickly** when touched, and nothing grows. A seedling's root goes down and its stem comes up, but that only happens **as it grows**.",
          "पौधों में **न तंत्रिका तंत्र है, न पेशियाँ**। फिर भी वे उद्दीपनों पर अनुक्रिया करते हैं। दो उदाहरण देखो: छूने पर संवेदी पौधे की पत्तियाँ **बहुत जल्दी** सिमटती हैं, और कुछ बढ़ता नहीं। अंकुर की जड़ नीचे जाती है और तना ऊपर आता है, पर यह केवल **बढ़ते हुए** होता है।",
        ),
      ),
      w.definition(
        t(
          "**Two types of plant movement.** Some movements are **independent of growth**, like the touch-me-not folding. Others **depend on growth**: the plant moves only by growing in a direction, and if its growth is prevented, it shows no movement.",
          "**पौधों की गति के दो प्रकार।** कुछ गतियाँ **वृद्धि से स्वतंत्र** हैं, जैसे छुई-मुई का सिमटना। दूसरी **वृद्धि पर निर्भर** हैं: पौधा केवल किसी दिशा में बढ़कर गति करता है, और अगर उसकी वृद्धि रोक दी जाए, तो कोई गति नहीं दिखती।",
        ),
      ),
      kind,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The touch-me-not: fast, no growth, water. */
const touch = page(
  "touch",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "NCERT 7.2.1, Fig. 7.4: the sensitive plant moves at a point different from where it is touched, so the information is passed on, by electrical-chemical means from cell to cell, with no special tissue for it; cells change shape by changing the amount of water in them.",
    );
    const plant = b.prop(plantMovementDef, "plant", {
      kind: PlantKind.TouchMeNot,
      isFolded: false,
      showNames: true,
      canTouch: true,
      canGrow: false,
      canSetSide: false,
      canTurn: false,
    });
    b.standsFor(
      plant,
      "a chhui-mui in a pot; touching a leaf makes the leaflets fold as the message spreads; it can be left to reopen",
    );
    const how = choiceQuestion(b, {
      name: "how",
      prompt: t(
        "Touch a leaf. How do the plant's cells make the leaflets fold?",
        "एक पत्ती छुओ। पौधे की कोशिकाएँ पत्रकों को कैसे सिमटाती हैं?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Some cells change their water content, so they shrink",
            "कुछ कोशिकाएँ अपने पानी की मात्रा बदलकर सिकुड़ती हैं",
          ),
        },
        {
          id: "muscle",
          label: t(
            "Tiny muscles at the base pull the leaflets shut",
            "आधार पर नन्ही पेशियाँ पत्रकों को खींचकर बंद करती हैं",
          ),
          feedback: t(
            "Plants have no muscles. Their cells swell or shrink by gaining or losing water.",
            "पौधों में पेशियाँ नहीं होतीं। उनकी कोशिकाएँ पानी पाकर या खोकर फूलती या सिकुड़ती हैं।",
          ),
        },
        {
          id: "grow",
          label: t("The leaflets quickly grow in a new direction", "पत्रक तेज़ी से नई दिशा में बढ़ते हैं"),
          feedback: t(
            "It's far too fast for growth. No growth is involved: the cells change shape.",
            "यह वृद्धि के लिए बहुत तेज़ है। इसमें कोई वृद्धि नहीं: कोशिकाएँ आकार बदलती हैं।",
          ),
        },
      ],
      answer: "right",
    });
    b.witness(plant.learner(PlantAction.Touch));
    return column([
      w.title(t("The touch-me-not", "छुई-मुई")),
      w.body(
        t(
          "Watch carefully where the plant is touched, and which part moves: they are **not the same place**. So the information that a touch has happened must be **passed on**. Plants also pass it from cell to cell by electrical-chemical means, but unlike animals they have **no special tissue** for carrying information.",
          "ध्यान से देखो कि पौधे को कहाँ छुआ गया, और कौन सा हिस्सा हिला: ये **एक ही जगह नहीं** हैं। यानी छुए जाने की सूचना को **आगे पहुँचाया** जाना चाहिए। पौधे भी इसे कोशिका से कोशिका तक विद्युत-रासायनिक तरीक़े से पहुँचाते हैं, पर जंतुओं के उलट उनमें सूचना ले जाने के लिए **कोई ख़ास ऊतक नहीं** होता।",
        ),
      ),
      w.body(
        t(
          "Finally, as in animals, some cells must **change shape** for movement to happen. Instead of the special proteins of muscle cells, plant cells change shape by **changing the amount of water** in them: they swell or shrink.",
          "आख़िर में, जंतुओं की तरह, गति के लिए कुछ कोशिकाओं को **आकार बदलना** पड़ता है। पेशी कोशिकाओं के ख़ास प्रोटीनों की जगह, पादप कोशिकाएँ अपने अंदर **पानी की मात्रा बदलकर** आकार बदलती हैं: वे फूलती या सिकुड़ती हैं।",
        ),
      ),
      plant,
      how,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Tendrils coil by growing unevenly. */
const tendril = page(
  "tendril",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "NCERT 7.2.2: a pea tendril touching a support grows more slowly on the side in contact than on the side away from it, so it circles round the support and clings.",
    );
    const pea = b.prop(plantMovementDef, "pea", {
      kind: PlantKind.Tendril,
      days: 0,
      showNames: true,
      canTouch: false,
      canGrow: true,
      canSetSide: false,
      canTurn: false,
    });
    b.standsFor(
      pea,
      "a pea tendril that has just touched a stick; growing it day by day makes it coil round the stick",
    );
    const coil = choiceQuestion(b, {
      name: "coil",
      prompt: t(
        "Grow it a few days. Why does the tendril wind round the stick?",
        "इसे कुछ दिन बढ़ाओ। प्रतान डंडी के चारों ओर क्यों लिपटता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "The side touching the stick grows more slowly than the side away from it",
            "डंडी को छूने वाला भाग दूर वाले भाग से धीरे बढ़ता है",
          ),
        },
        {
          id: "faster",
          label: t("The side touching the stick grows faster", "डंडी को छूने वाला भाग तेज़ बढ़ता है"),
          feedback: t(
            "The other way round: the outer side, away from the stick, grows faster, so the tendril curls inwards round it.",
            "उल्टा: बाहर का, डंडी से दूर वाला भाग तेज़ बढ़ता है, इसलिए प्रतान अंदर की ओर उसके चारों ओर मुड़ता है।",
          ),
        },
      ],
      answer: "right",
    });
    b.witness(...Array.from({ length: 3 }, () => pea.learner(PlantAction.Grow)));
    return column([
      w.title(t("Tendrils: moving by growing", "प्रतान: बढ़कर गति करना")),
      w.body(
        t(
          "Some plants, like the pea plant, climb up other plants or fences with **tendrils**: thin, thread-like parts that are sensitive to touch. When a tendril touches a support, the part **in contact** does not grow as fast as the part **away from** it. So the tendril circles around the support and clings to it.",
          "कुछ पौधे, जैसे मटर, **प्रतानों** की मदद से दूसरे पौधों या बाड़ पर चढ़ते हैं: ये पतले, धागे जैसे हिस्से हैं जो स्पर्श के प्रति संवेदी हैं। जब प्रतान किसी सहारे को छूता है, तो **संपर्क वाला** भाग उतना तेज़ नहीं बढ़ता जितना उससे **दूर वाला** भाग। इसलिए प्रतान सहारे के चारों ओर घूमकर उससे लिपट जाता है।",
        ),
      ),
      pea,
      coil,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Tropism; phototropism with Activity 7.2. */
const light = page(
  "light",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "NCERT Activity 7.2, Fig. 7.5: bean seedlings in a box open on one side face a window; shoots bend towards light, roots away. Turn the flask: old growth keeps its direction, new growth bends again towards the light.",
    );
    const box = b.prop(plantMovementDef, "box", {
      kind: PlantKind.Phototropism,
      side: Side.Right,
      days: 0,
      showAuxin: false,
      showNames: true,
      canTouch: false,
      canGrow: true,
      canSetSide: true,
      canTurn: false,
    });
    b.standsFor(
      box,
      "bean seedlings on a flask in a box open on one side, light from a window; grow them day by day and move the light to the other side",
    );
    const old = choiceQuestion(b, {
      name: "old",
      prompt: t(
        "Grow the seedlings for a few days, then move the light to the other side and grow again. Do the old parts of the shoot change direction?",
        "अंकुरों को कुछ दिन बढ़ाओ, फिर रोशनी को दूसरी ओर करो और फिर बढ़ाओ। क्या प्ररोह के पुराने हिस्से दिशा बदलते हैं?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "No: only the new growth bends towards the light",
            "नहीं: केवल नई वृद्धि रोशनी की ओर मुड़ती है",
          ),
        },
        {
          id: "yes",
          label: t("Yes: the whole shoot swings round", "हाँ: पूरा प्ररोह घूम जाता है"),
          feedback: t(
            "Look at the old part: it stays bent the old way. The movement comes from growth, so only new growth follows the light.",
            "पुराना हिस्सा देखो: वह पुरानी तरह ही मुड़ा रहता है। गति वृद्धि से होती है, इसलिए केवल नई वृद्धि रोशनी के पीछे जाती है।",
          ),
        },
      ],
      answer: "right",
    });
    b.witness(
      box.learner(PlantAction.Grow),
      box.learner(PlantAction.Grow),
      box.learner(PlantAction.SetSide, { side: Side.Left }),
      box.learner(PlantAction.Grow),
      box.learner(PlantAction.Grow),
    );
    return column([
      w.title(t("Growing towards the light", "रोशनी की ओर बढ़ना")),
      w.definition(
        t(
          "**Tropism.** More often, plants respond to a stimulus slowly, by **growing in a particular direction**. Because the growth has a direction, the plant seems to move. Such a directional growth movement is a **tropism** (tropic movement). It can be **towards** the stimulus or **away** from it.",
          "**अनुवर्तन।** ज़्यादातर पौधे किसी उद्दीपन पर धीरे-धीरे, **किसी ख़ास दिशा में बढ़कर** अनुक्रिया करते हैं। चूँकि वृद्धि की एक दिशा होती है, पौधा हिलता हुआ लगता है। ऐसी दिशा वाली वृद्धि-गति **अनुवर्तन** कहलाती है। यह उद्दीपन की **ओर** हो सकती है, या उससे **दूर**।",
        ),
      ),
      w.body(
        t(
          "**Activity 7.2.** Bean seeds that have just sprouted sit on a wire mesh over a flask of water, inside a box that is open on one side only, facing a window. After two or three days, look at the shoots and the roots. Then turn things round so the light comes from the other side, and wait a few more days.",
          "**क्रियाकलाप 7.2।** अभी-अभी अंकुरित हुए सेम के बीज पानी भरे फ़्लास्क पर तार की जाली पर रखे हैं, एक डिब्बे के अंदर जो केवल एक ओर से खुला है, खिड़की की ओर। दो-तीन दिन बाद प्ररोहों और जड़ों को देखो। फिर चीज़ों को घुमाओ ताकि रोशनी दूसरी ओर से आए, और कुछ दिन और रुको।",
        ),
      ),
      box,
      w.definition(
        t(
          "**Phototropism.** A response to **light** (*photo* means light) is **phototropism**. **Shoots** bend **towards** light, and **roots** bend **away** from it. The light is sensed at the very **tip** of the shoot, yet the bending happens lower down: keep that puzzle in mind.",
          "**प्रकाशानुवर्तन।** **प्रकाश** के प्रति अनुक्रिया **प्रकाशानुवर्तन** है। **प्ररोह** प्रकाश की **ओर** मुड़ते हैं, और **जड़ें** उससे **दूर** मुड़ती हैं। रोशनी तने के ठीक **शीर्ष** पर महसूस होती है, फिर भी मुड़ना नीचे होता है: यह पहेली याद रखना।",
        ),
      ),
      old,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Geotropism: turn the pot. */
const gravity = page(
  "gravity",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "NCERT Fig. 7.6: roots grow downwards and shoots upwards in response to gravity (geotropism). Turning the pot on its side shows the new root growth turning down and the new shoot turning up.",
    );
    const pot = b.prop(plantMovementDef, "pot", {
      kind: PlantKind.Geotropism,
      days: 0,
      potAngle: 0,
      showNames: true,
      canTouch: false,
      canGrow: true,
      canSetSide: false,
      canTurn: true,
    });
    b.standsFor(
      pot,
      "a seedling in a pot; it can be grown day by day and the pot laid on its side",
    );
    const turned = choiceQuestion(b, {
      name: "turned",
      prompt: t(
        "Lay the pot on its side and grow it. Which way does the new root grow?",
        "गमले को करवट लिटाओ और बढ़ाओ। नई जड़ किस ओर बढ़ती है?",
      ),
      options: [
        { id: "right", label: t("Down, towards the earth", "नीचे, पृथ्वी की ओर") },
        {
          id: "side",
          label: t("Sideways, the way it was pointing", "बग़ल में, जिधर वह पहले था"),
          feedback: t(
            "The old root stays pointing sideways, but new root growth bends down: roots respond to gravity.",
            "पुरानी जड़ बग़ल की ओर ही रहती है, पर नई जड़ नीचे मुड़ती है: जड़ें गुरुत्व पर अनुक्रिया करती हैं।",
          ),
        },
      ],
      answer: "right",
    });
    b.witness(
      pot.learner(PlantAction.Grow),
      pot.learner(PlantAction.Turn),
      pot.learner(PlantAction.Grow),
      pot.learner(PlantAction.Grow),
    );
    return column([
      w.title(t("Responding to gravity", "गुरुत्व पर अनुक्रिया")),
      w.definition(
        t(
          "**Geotropism.** The roots of a plant always grow **downwards** and the shoots usually grow **upwards**, away from the earth. This growth in response to the pull of the earth, **gravity** (*geo* means earth), is **geotropism**. Roots grow towards gravity; shoots grow away from it.",
          "**गुरुत्वानुवर्तन।** पौधे की जड़ें हमेशा **नीचे** बढ़ती हैं और प्ररोह प्रायः पृथ्वी से दूर **ऊपर** बढ़ते हैं। पृथ्वी के खिंचाव, **गुरुत्व**, के जवाब में यह वृद्धि **गुरुत्वानुवर्तन** है। जड़ें गुरुत्व की ओर बढ़ती हैं; प्ररोह उससे दूर।",
        ),
      ),
      pot,
      turned,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Hydrotropism and chemotropism. */
const waterChem = page(
  "water-chem",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "NCERT: 'hydro' means water and 'chemo' chemicals, so hydrotropism is growth towards water, and chemotropism growth in response to chemicals; the pollen tube growing towards the ovule is an example of chemotropism.",
    );
    const soil = b.prop(plantMovementDef, "soil", {
      kind: PlantKind.Hydrotropism,
      side: Side.Left,
      days: 0,
      showNames: true,
      canTouch: false,
      canGrow: true,
      canSetSide: true,
      canTurn: false,
    });
    b.standsFor(
      soil,
      "a seedling in soil with water on one side; growing it shows the root turning towards the water",
    );
    const flower = b.prop(plantMovementDef, "flower", {
      kind: PlantKind.PollenTube,
      days: 0,
      showNames: true,
      canTouch: false,
      canGrow: true,
      canSetSide: false,
      canTurn: false,
    });
    b.standsFor(
      flower,
      "a flower cut open: a pollen grain on the stigma; growing it sends a pollen tube down to the ovule",
    );
    const tube = choiceQuestion(b, {
      name: "tube",
      prompt: t(
        "A pollen tube grows down towards the ovule. This is an example of…",
        "पराग नलिका बीजांड की ओर नीचे बढ़ती है। यह उदाहरण है…",
      ),
      options: [
        { id: "right", label: t("chemotropism", "रसायनानुवर्तन का") },
        {
          id: "hydro",
          label: t("hydrotropism", "जलानुवर्तन का"),
          feedback: t(
            "Hydrotropism is growth towards water. The pollen tube follows chemicals from the ovule: chemotropism.",
            "जलानुवर्तन पानी की ओर वृद्धि है। पराग नलिका बीजांड के रसायनों का पीछा करती है: रसायनानुवर्तन।",
          ),
        },
        {
          id: "geo",
          label: t("geotropism", "गुरुत्वानुवर्तन का"),
          feedback: t(
            "It's not following gravity but chemicals: chemotropism.",
            "यह गुरुत्व का नहीं बल्कि रसायनों का पीछा कर रही है: रसायनानुवर्तन।",
          ),
        },
      ],
      answer: "right",
    });
    b.witness(
      ...Array.from({ length: 3 }, () => soil.learner(PlantAction.Grow)),
      ...Array.from({ length: 3 }, () => flower.learner(PlantAction.Grow)),
    );
    return column([
      w.title(t("Towards water, towards chemicals", "पानी की ओर, रसायनों की ओर")),
      w.definition(
        t(
          "**Hydrotropism and chemotropism.** *Hydro* means water, so **hydrotropism** is directional growth in response to **water**: roots grow towards it. *Chemo* refers to chemicals, so **chemotropism** is directional growth in response to **chemicals**.",
          "**जलानुवर्तन और रसायनानुवर्तन।** *जल* यानी पानी, इसलिए **जलानुवर्तन** **पानी** के जवाब में दिशा वाली वृद्धि है: जड़ें उसकी ओर बढ़ती हैं। *रसायन* यानी रासायनिक पदार्थ, इसलिए **रसायनानुवर्तन** **रसायनों** के जवाब में दिशा वाली वृद्धि है।",
        ),
      ),
      soil,
      w.body(
        t(
          "An example of chemotropism: when a pollen grain lands on the stigma of a flower, a **pollen tube** grows down towards the **ovule**. You'll learn more about this with reproduction.",
          "रसायनानुवर्तन का एक उदाहरण: जब कोई परागकण फूल के वर्तिकाग्र पर गिरता है, तो एक **पराग नलिका** नीचे **बीजांड** की ओर बढ़ती है। जनन के साथ तुम इसके बारे में और पढ़ोगे।",
        ),
      ),
      flower,
      tube,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Fast and slow movements. */
const speeds = page(
  "speeds",
  (b) => {
    const w = wordsOn(b);
    const slowest = choiceQuestion(b, {
      name: "slowest",
      prompt: t(
        "Which of these plant movements is the slowest?",
        "पौधों की इनमें से कौन सी गति सबसे धीमी है?",
      ),
      options: [
        {
          id: "right",
          label: t("A shoot bending towards a window over days", "दिनों में खिड़की की ओर मुड़ता प्ररोह"),
        },
        {
          id: "touch",
          label: t("A touch-me-not folding", "छुई-मुई का सिमटना"),
          feedback: t(
            "That's the fastest: it happens in moments. Growth movements take days.",
            "वह सबसे तेज़ है: पल भर में होता है। वृद्धि वाली गतियाँ दिनों लेती हैं।",
          ),
        },
        {
          id: "sun",
          label: t("A sunflower turning between day and night", "दिन और रात के बीच घूमता सूरजमुखी"),
          feedback: t(
            "That's slow, but movement by growth is even slower.",
            "वह धीमा है, पर वृद्धि वाली गति उससे भी धीमी है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Fast and slow", "तेज़ और धीमा")),
      w.body(
        t(
          "The touch-me-not responds **very quickly**. A sunflower turning with day and night is **quite slow**. Movements that come from growth are **slower still**. Even in animals, growth has carefully controlled directions: our arms and fingers grow in certain directions, not just anyhow.",
          "छुई-मुई **बहुत जल्दी** अनुक्रिया करती है। दिन और रात के साथ घूमता सूरजमुखी **काफ़ी धीमा** है। वृद्धि से होने वाली गतियाँ **और भी धीमी** हैं। जंतुओं में भी वृद्धि की दिशाएँ सावधानी से नियंत्रित होती हैं: हमारी बाँहें और उँगलियाँ कुछ तय दिशाओं में बढ़ती हैं, कैसे भी नहीं।",
        ),
      ),
      w.body(
        t(
          "So controlled movements can be slow or fast. For a fast response, information must travel very quickly. How plants send their slower messages is the next stop.",
          "यानी नियंत्रित गतियाँ धीमी या तेज़ हो सकती हैं। तेज़ अनुक्रिया के लिए सूचना को बहुत जल्दी पहुँचना पड़ता है। पौधे अपने धीमे संदेश कैसे भेजते हैं, यह अगला पड़ाव है।",
        ),
      ),
      slowest,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** The bean box exhibit. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const beans = b.prop(controlSceneDef, "beans", { scene: ControlScene.BeanBox });
    b.standsFor(
      beans,
      "Riya's shoebox with a window cut in one side; bean shoots inside lean towards the window",
    );
    const help = choiceQuestion(b, {
      name: "help",
      prompt: t(
        "How does bending towards the window help the bean shoots?",
        "खिड़की की ओर मुड़ना सेम के प्ररोहों की कैसे मदद करता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Their leaves get more light, which they need to make food",
            "उनकी पत्तियों को ज़्यादा रोशनी मिलती है, जो उन्हें भोजन बनाने के लिए चाहिए",
          ),
        },
        {
          id: "warm",
          label: t("They get away from the soil", "वे मिट्टी से दूर हो जाते हैं"),
          feedback: t(
            "The point is the light: leaves use it to make food, so growing towards it helps the plant.",
            "बात रोशनी की है: पत्तियाँ उससे भोजन बनाती हैं, इसलिए उसकी ओर बढ़ना पौधे की मदद करता है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const stop = w.definition(
      t(
        '**Stop 4 done.** The fourth exhibit is ready: Grandpa\'s chhui-mui in a pot ("Touch me!"), a pea tendril round a pencil, and Riya\'s shoebox with a window, where a week\'s bean shoots all lean the same way. Grandpa, admiring it, asks the obvious question: "But how does the shoot *know* which side the light is on?" Next stop: plant hormones.',
        '**पड़ाव 4 पूरा।** चौथा प्रदर्श तैयार है: गमले में दादाजी की छुई-मुई ("मुझे छुओ!"), पेंसिल पर लिपटा मटर का प्रतान, और रिया का खिड़की वाला जूते का डिब्बा, जिसमें एक हफ़्ते के सेम के प्ररोह सब एक ही ओर झुके हैं। उसे देखते हुए दादाजी ज़ाहिर सवाल पूछते हैं: "पर प्ररोह को कैसे *पता* चलता है कि रोशनी किस ओर है?" अगला पड़ाव: पादप हॉर्मोन।',
      ),
      "stop",
      { isHidden: true },
    );
    b.when(help.on(QuestionSignal.Correct), [theBoard.show(stop), theBoard.pass()]);
    return column([w.title(t("The bean box", "सेम का डिब्बा")), beans, help, stop, space()]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** NCERT in-text Q2, Q5 and Exercise 12; then the log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const differ = choiceQuestion(b, {
      name: "differ",
      prompt: t(
        "How is the movement of the sensitive plant's leaves different from the movement of a shoot towards light?",
        "संवेदी पौधे की पत्तियों की गति, प्रकाश की ओर प्ररोह की गति से कैसे अलग है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "The leaves move fast with no growth; the shoot moves slowly, by growing in one direction",
            "पत्तियाँ बिना वृद्धि के तेज़ी से हिलती हैं; प्ररोह एक दिशा में बढ़कर धीरे-धीरे गति करता है",
          ),
        },
        {
          id: "same",
          label: t("Both are growth movements", "दोनों वृद्धि वाली गतियाँ हैं"),
          feedback: t(
            "Only the shoot's is. The touch-me-not folds in moments, with no growth.",
            "केवल प्ररोह वाली है। छुई-मुई पल भर में, बिना वृद्धि के सिमटती है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const design = choiceQuestion(b, {
      name: "design",
      prompt: t(
        "Which experiment would best show hydrotropism?",
        "जलानुवर्तन दिखाने के लिए कौन सा प्रयोग सबसे अच्छा होगा?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Grow a seedling in dry soil with water kept on one side only, and see which way the root grows",
            "सूखी मिट्टी में अंकुर उगाओ, पानी केवल एक ओर रखो, और देखो जड़ किस ओर बढ़ती है",
          ),
        },
        {
          id: "box",
          label: t(
            "Put a seedling in a box with a window and water it",
            "खिड़की वाले डिब्बे में अंकुर रखकर पानी दो",
          ),
          feedback: t(
            "That tests light. To test water, water must be the only thing that differs from side to side.",
            "वह रोशनी को परखता है। पानी को परखने के लिए, केवल पानी ही एक ओर से दूसरी ओर अलग होना चाहिए।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const legs = choiceQuestion(b, {
      name: "legs",
      prompt: t(
        "What is the difference between how a sensitive plant moves and how our legs move?",
        "संवेदी पौधे के हिलने और हमारे पैरों के हिलने में क्या अंतर है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "The plant's cells change shape by gaining or losing water, with no nerves; our leg muscles shorten when nerve impulses make their proteins rearrange",
            "पौधे की कोशिकाएँ पानी पाकर या खोकर आकार बदलती हैं, बिना तंत्रिकाओं के; हमारी पैर की पेशियाँ तंत्रिका आवेग से प्रोटीनों की व्यवस्था बदलने पर छोटी होती हैं",
          ),
        },
        {
          id: "same",
          label: t("Both use muscles and nerves", "दोनों में पेशियाँ और तंत्रिकाएँ लगती हैं"),
          feedback: t(
            "The plant has neither. It passes the message from cell to cell and moves its cells with water.",
            "पौधे में दोनों नहीं हैं। वह संदेश कोशिका से कोशिका तक पहुँचाता है और पानी से अपनी कोशिकाएँ हिलाता है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ Plants have no nerves or muscles, but they respond. ✓ Some movements need **no growth**: the touch-me-not passes the message cell to cell and its cells change shape by changing their water. ✓ Others **depend on growth**: tendrils coil; **tropisms** are directional growth, towards or away from light (**photo**), gravity (**geo**), water (**hydro**) and chemicals (**chemo**). Next: how the plant sends these messages.",
        "**मिशन लॉग।** ✓ पौधों में तंत्रिकाएँ या पेशियाँ नहीं, फिर भी वे अनुक्रिया करते हैं। ✓ कुछ गतियों में **वृद्धि नहीं** होती: छुई-मुई संदेश कोशिका से कोशिका तक पहुँचाती है और उसकी कोशिकाएँ पानी बदलकर आकार बदलती हैं। ✓ दूसरी **वृद्धि पर निर्भर** हैं: प्रतान लिपटते हैं; **अनुवर्तन** दिशा वाली वृद्धि है, प्रकाश (**प्रकाशानुवर्तन**), गुरुत्व (**गुरुत्वानुवर्तन**), पानी (**जलानुवर्तन**) और रसायनों (**रसायनानुवर्तन**) की ओर या उनसे दूर। आगे: पौधा ये संदेश कैसे भेजता है।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(legs.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), differ, design, legs, log, space()]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [
  hook,
  twoKinds,
  touch,
  tendril,
  light,
  gravity,
  waterChem,
  speeds,
  inLife,
  yourTurn,
];

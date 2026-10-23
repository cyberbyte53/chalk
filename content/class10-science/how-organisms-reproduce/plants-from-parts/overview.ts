import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  AsexualAction,
  Organism,
  PropagationAction,
  PropagationMethod,
  ReproductionScene,
  asexualModesDef,
  plantPropagationDef,
  reproductionSceneDef,
} from "@chalk/prop-reproduction";

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** Grandpa's tray of potato pieces. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const tray = b.prop(reproductionSceneDef, "tray", { scene: ReproductionScene.PotatoTray });
  b.standsFor(tray, "Grandpa sets potato pieces on wet cotton in a tray; Kabir watches");
  return column([
    w.title(t("Grandpa cuts up a potato", "दादाजी आलू काटते हैं")),
    tray,
    w.body(
      t(
        'Recap: single cells split, bud or break into pieces. But Grandpa needs fifty pots, and none of that fills one. So he does something strange: he cuts a potato into small pieces, some with a little dent on the skin and some without, and sets them on wet cotton in a tray. "A potato is a seed shop," he says. Kabir doesn\'t believe him.',
        'पिछली बार: एककोशिकीय जीव बँटते हैं, मुकुलन करते हैं या टुकड़ों में टूटते हैं। पर दादाजी को पचास गमले चाहिए, और इनमें से कोई भी एक गमला नहीं भरता। तो वे कुछ अजीब करते हैं: एक आलू को छोटे टुकड़ों में काटते हैं, कुछ में छिलके पर छोटा गड्ढा है और कुछ में नहीं, और उन्हें गीली रुई पर एक ट्रे में रख देते हैं। "आलू तो बीज की दुकान है," वे कहते हैं। कबीर को यक़ीन नहीं होता।',
      ),
    ),
    w.body(
      t(
        "And Mom's mouldy bread from last time is now covered in grey fuzz. Can a plant make new plants without seeds? And what is that fuzz doing?",
        "और पिछली बार वाली मम्मी की फफूँद लगी ब्रेड अब धूसर रोओं से ढक गई है। क्या कोई पौधा बिना बीज के नए पौधे बना सकता है? और वे रोएँ क्या कर रहे हैं?",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Vegetative propagation: definition, layering and grafting, advantages; potato (Activity 8.5). */
const vegetative = page(
  "vegetative",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "NCERT 8.2.5, Activity 8.5: roots, stems and leaves can grow into new plants (vegetative propagation). Only potato pieces with a bud (an 'eye' in a notch) give shoots and roots.",
    );
    const potato = b.prop(plantPropagationDef, "potato", {
      method: PropagationMethod.Potato,
      step: 0,
      showNames: true,
      canStep: true,
      choices: [],
    });
    b.studentOnly(potato.action(PropagationAction.Next));
    b.studentOnly(potato.action(PropagationAction.Reset));
    b.standsFor(
      potato,
      "potato pieces on wet cotton over several days: pieces with a bud in a notch sprout shoots and roots, pieces without stay bare",
    );
    const bud = choiceQuestion(b, {
      name: "bud",
      prompt: t(
        "Step through the days. Which potato pieces give fresh shoots and roots?",
        "दिन-ब-दिन देखो। आलू के कौन-से टुकड़े नए अंकुर और जड़ें देते हैं?",
      ),
      options: [
        { id: "right", label: t("Only the pieces with a bud", "केवल कली वाले टुकड़े") },
        {
          id: "all",
          label: t("Every piece", "हर टुकड़ा"),
          feedback: t(
            "Look again: the pieces without a bud stay bare. The new plant grows from the bud in the notch.",
            "फिर देखो: बिना कली वाले टुकड़े ख़ाली रहते हैं। नया पौधा गड्ढे वाली कली से उगता है।",
          ),
        },
        {
          id: "big",
          label: t("Only the biggest, heaviest pieces", "केवल सबसे बड़े, भारी टुकड़े"),
          feedback: t(
            "Size doesn't decide it. A small piece with a bud sprouts; a big piece without one doesn't.",
            "आकार तय नहीं करता। कली वाला छोटा टुकड़ा अंकुरित होता है; बिना कली वाला बड़ा टुकड़ा नहीं।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("New plants from roots, stems and leaves", "जड़, तने और पत्तियों से नए पौधे")),
      w.definition(
        t(
          "**Vegetative propagation.** In many plants, parts like the **root**, **stem** and **leaves** (the non-flowering, or *vegetative*, parts) can develop into new plants under the right conditions. This is **vegetative propagation**. Most animals can't do this; plants can.",
          "**कायिक प्रवर्धन।** बहुत से पौधों में **जड़**, **तना** और **पत्तियाँ** (फूल न देने वाले, यानी *कायिक*, भाग) सही परिस्थितियों में नए पौधों में विकसित हो सकते हैं। यह **कायिक प्रवर्धन** है। ज़्यादातर जंतु ऐसा नहीं कर सकते; पौधे कर सकते हैं।",
        ),
      ),
      w.body(
        t(
          "A potato is a swollen underground stem. Look closely and its skin has small notches, each holding a **bud** (an 'eye'). NCERT's Activity 8.5: cut pieces with and without a bud, keep them on wet cotton, and watch.",
          "आलू ज़मीन के नीचे फूला हुआ तना है। ध्यान से देखो तो इसके छिलके पर छोटे गड्ढे हैं, हर एक में एक **कली** (एक 'आँख')। NCERT का क्रियाकलाप 8.5: कली वाले और बिना कली वाले टुकड़े काटो, उन्हें गीली रुई पर रखो, और देखो।",
        ),
      ),
      potato,
      bud,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Bryophyllum leaf buds and money-plant cuttings (Activity 8.6). */
const leavesAndNodes = page(
  "leaves-and-nodes",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "NCERT Fig 8.5 and Activity 8.6: buds in the notches of a Bryophyllum leaf fall on soil and grow into new plants; money-plant pieces with a leaf (a node) root and grow, pieces cut between two leaves don't.",
    );
    const plant = b.prop(plantPropagationDef, "plant", {
      method: PropagationMethod.Bryophyllum,
      step: 0,
      showNames: true,
      canStep: true,
      choices: [PropagationMethod.Bryophyllum, PropagationMethod.MoneyPlant],
    });
    b.studentOnly(plant.action(PropagationAction.Next));
    b.studentOnly(plant.action(PropagationAction.Reset));
    b.studentOnly(plant.action(PropagationAction.Choose));
    b.standsFor(
      plant,
      "a Bryophyllum leaf with buds along its edge that drop and grow; or money-plant pieces in water, those with a leaf rooting and those between leaves not",
    );
    const money = choiceQuestion(b, {
      name: "money",
      prompt: t(
        "Switch to the money plant. Which pieces grow fresh leaves?",
        "मनी प्लांट पर जाओ। कौन-से टुकड़े नई पत्तियाँ देते हैं?",
      ),
      options: [
        {
          id: "right",
          label: t("The pieces cut with at least one leaf", "वे टुकड़े जिनमें कम से कम एक पत्ती है"),
        },
        {
          id: "between",
          label: t("The pieces cut between two leaves", "दो पत्तियों के बीच से कटे टुकड़े"),
          feedback: t(
            "Those stay bare. New growth comes from the place where a leaf joins the stem, so the piece must include one.",
            "वे ख़ाली रहते हैं। नई बढ़त उस जगह से होती है जहाँ पत्ती तने से जुड़ती है, इसलिए टुकड़े में वह होनी चाहिए।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Buds on a leaf, roots on a stem", "पत्ती पर कलियाँ, तने पर जड़ें")),
      w.body(
        t(
          "Grandpa's **Bryophyllum** (patharchatta) has buds in the notches along the edge of its leaves. They fall on the soil and grow into new plants: a leaf making plants.",
          "दादाजी के **ब्रायोफ़िलम** (पत्थरचट्टा) की पत्तियों के किनारे के गड्ढों में कलियाँ होती हैं। वे मिट्टी पर गिरकर नए पौधों में बढ़ जाती हैं: पत्ती पौधे बना रही है।",
        ),
      ),
      w.body(
        t(
          "Activity 8.6: cut a money plant into pieces, some with at least one leaf, some from between two leaves, and stand one end of each in water. Switch between the two plants and step through.",
          "क्रियाकलाप 8.6: मनी प्लांट के टुकड़े काटो, कुछ में कम से कम एक पत्ती हो, कुछ दो पत्तियों के बीच से हों, और हर एक का एक सिरा पानी में रखो। दोनों पौधों के बीच बदलो और क़दम-दर-क़दम देखो।",
        ),
      ),
      plant,
      money,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Layering and grafting, advantages; tissue culture. */
const farms = page(
  "farms",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "NCERT 8.2.5 and the tissue-culture box: layering and grafting grow sugarcane, roses and grapes; vegetative plants flower and fruit earlier, let seedless plants (banana, orange, rose, jasmine) be grown, and keep all the parent's characteristics. Tissue culture: tip cells → callus → hormones → plantlets → soil; many disease-free plants from one parent.",
    );
    const lab = b.prop(plantPropagationDef, "lab", {
      method: PropagationMethod.Grafting,
      step: 0,
      showNames: true,
      canStep: true,
      choices: [
        PropagationMethod.Layering,
        PropagationMethod.Grafting,
        PropagationMethod.TissueCulture,
      ],
    });
    b.studentOnly(lab.action(PropagationAction.Next));
    b.studentOnly(lab.action(PropagationAction.Reset));
    b.studentOnly(lab.action(PropagationAction.Choose));
    b.standsFor(
      lab,
      "layering (a bent branch rooting in soil), grafting (a cut shoot joined onto a rooted stem) and tissue culture (tip cells, callus, plantlets, soil), step by step",
    );
    const seedless = choiceQuestion(b, {
      name: "seedless",
      prompt: t(
        "Why must bananas and jasmine be grown by vegetative propagation?",
        "केले और चमेली को कायिक प्रवर्धन से ही क्यों उगाना पड़ता है?",
      ),
      options: [
        {
          id: "right",
          label: t("They have lost the capacity to produce seeds", "वे बीज बनाने की क्षमता खो चुके हैं"),
        },
        {
          id: "fast",
          label: t("Their seeds grow too fast", "उनके बीज बहुत तेज़ी से उगते हैं"),
          feedback: t(
            "They don't make seeds at all. Without seeds, the only way to get new plants is from their parts.",
            "वे बीज बनाते ही नहीं। बीज के बिना नए पौधे पाने का एकमात्र तरीक़ा उनके भागों से है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("How farmers and gardeners use it", "किसान और माली इसका उपयोग कैसे करते हैं")),
      w.definition(
        t(
          "**Layering and grafting.** In **layering**, a branch is bent down and covered with soil while still on the parent; it roots, and is then cut free. In **grafting**, a cut shoot of one plant is joined onto the rooted stem of another so that they grow as one. Sugarcane, roses and grapes are grown this way.",
          "**दाब कलम और रोपण।** **दाब कलम** में एक शाखा को मोड़कर, जनक पौधे से जुड़े रहते ही, मिट्टी से ढक दिया जाता है; उसमें जड़ें आ जाती हैं, फिर उसे काटकर अलग कर देते हैं। **रोपण** (ग्राफ़्टिंग) में एक पौधे की कटी शाखा को दूसरे पौधे के जड़ वाले तने से जोड़ दिया जाता है ताकि वे एक साथ बढ़ें। गन्ना, गुलाब और अंगूर ऐसे ही उगाए जाते हैं।",
        ),
      ),
      w.body(
        t(
          "Why bother? Three advantages. Plants grown this way **flower and fruit earlier** than plants from seed. Plants that have **lost the capacity to make seeds**, like banana, orange, rose and jasmine, can still be grown. And every new plant is **genetically similar enough to the parent** to have all its characteristics.",
          "यह झंझट क्यों? तीन लाभ। इस तरह उगाए पौधे बीज वाले पौधों से **पहले फूल और फल देते हैं**। जो पौधे **बीज बनाने की क्षमता खो चुके हैं**, जैसे केला, संतरा, गुलाब और चमेली, उन्हें भी उगाया जा सकता है। और हर नया पौधा **आनुवंशिक रूप से जनक जैसा** होता है, उसके सारे लक्षणों के साथ।",
        ),
      ),
      w.definition(
        t(
          "**Tissue culture.** New plants are grown from tissue or cells taken from the **growing tip** of a plant. In an artificial medium the cells divide fast into a small group of cells, a **callus**. Moved to a medium with hormones for growth, the callus forms **plantlets**, which are then planted in soil. Many disease-free plants come from one parent; it is common for ornamental plants.",
          "**ऊतक संवर्धन।** पौधे की **बढ़ती हुई नोक** से लिए गए ऊतक या कोशिकाओं से नए पौधे उगाए जाते हैं। एक कृत्रिम पोषक माध्यम में कोशिकाएँ तेज़ी से बँटकर कोशिकाओं का एक छोटा समूह, **कैलस**, बनाती हैं। वृद्धि के हॉर्मोन वाले माध्यम में ले जाने पर कैलस से **पादपक** बनते हैं, जिन्हें फिर मिट्टी में लगाया जाता है। एक जनक से बहुत से रोग-मुक्त पौधे मिलते हैं; यह सजावटी पौधों के लिए आम है।",
        ),
      ),
      lab,
      seedless,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Spore formation in Rhizopus; asexual reproduction defined. */
const spores = page(
  "spores",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "NCERT 8.2.6: the thread-like hyphae of bread mould (Rhizopus) are not reproductive; the blob-on-a-stick sporangia hold spores with thick protective walls, which grow on a moist surface. All modes so far make a new generation from a single individual: asexual reproduction.",
    );
    const mould = b.prop(asexualModesDef, "mould", {
      organism: Organism.Rhizopus,
      step: 0,
      showNames: true,
      canStep: true,
      choices: [],
    });
    b.studentOnly(mould.action(AsexualAction.Next));
    b.studentOnly(mould.action(AsexualAction.Reset));
    b.standsFor(
      mould,
      "bread mould: thread-like hyphae, upright stalks with round sporangia, which burst and release spores",
    );
    const blob = choiceQuestion(b, {
      name: "blob",
      prompt: t(
        "Which part of the bread mould is involved in reproduction?",
        "ब्रेड की फफूँद का कौन-सा भाग जनन में भाग लेता है?",
      ),
      options: [
        {
          id: "right",
          label: t("The blobs on stalks, the sporangia", "डंठलों पर लगी गोलियाँ, बीजाणुधानियाँ"),
        },
        {
          id: "hyphae",
          label: t("The thread-like hyphae", "धागे जैसे कवक तंतु"),
          feedback: t(
            "The hyphae spread over the bread but aren't reproductive parts. The spores are made in the sporangia, the blobs on stalks.",
            "कवक तंतु ब्रेड पर फैलते हैं पर जनन भाग नहीं हैं। बीजाणु बीजाणुधानियों में बनते हैं, डंठलों पर लगी गोलियों में।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("The fuzz on the bread: spores", "ब्रेड पर रोएँ: बीजाणु")),
      w.body(
        t(
          "Even in many simple multicellular organisms, special reproductive parts can be seen. Mom's bread mould is **Rhizopus**.",
          "बहुत से सरल बहुकोशिकीय जीवों में भी ख़ास जनन भाग दिखते हैं। मम्मी की ब्रेड वाली फफूँद **राइज़ोपस** है।",
        ),
      ),
      w.definition(
        t(
          "**Hyphae, sporangia and spores.** The thread-like structures spreading over the bread are **hyphae**: they are not reproductive parts. The tiny blob-on-a-stick structures are: each blob is a **sporangium** (plural **sporangia**), holding cells called **spores**. Spores have **thick walls** that protect them until they land on another moist surface, where they grow into new Rhizopus.",
          "**कवक तंतु, बीजाणुधानी और बीजाणु।** ब्रेड पर फैले धागे जैसे ढाँचे **कवक तंतु** हैं: ये जनन भाग नहीं हैं। डंठल पर लगी नन्ही गोली जैसी संरचनाएँ जनन भाग हैं: हर गोली एक **बीजाणुधानी** है, जिसमें **बीजाणु** नाम की कोशिकाएँ होती हैं। बीजाणुओं की **मोटी दीवारें** उनकी तब तक रक्षा करती हैं जब तक वे किसी दूसरी नम सतह पर न पहुँचें, जहाँ वे नए राइज़ोपस में बढ़ते हैं।",
        ),
      ),
      mould,
      w.definition(
        t(
          "**Asexual reproduction.** Every mode so far, fission, budding, fragmentation, vegetative propagation and spores, creates a new generation from a **single individual**. This is **asexual reproduction**.",
          "**अलैंगिक जनन।** अब तक की हर विधि, विखंडन, मुकुलन, खंडन, कायिक प्रवर्धन और बीजाणु, एक **अकेले जीव** से नई पीढ़ी बनाती है। यह **अलैंगिक जनन** है।",
        ),
      ),
      blob,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** Which methods fill most of the fifty pots; why the rose is grafted. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const rose = b.prop(reproductionSceneDef, "rose", { scene: ReproductionScene.RoseGraft });
    b.standsFor(rose, "Grandpa and Riya beside a potted rose with a grafted joint on its stem");
    const graft = choiceQuestion(b, {
      name: "graft",
      prompt: t(
        "Grandpa grafts a cutting of his best red rose onto a hardy rooted stem. Why not just sow rose seeds?",
        "दादाजी अपने सबसे अच्छे लाल गुलाब की कलम को एक मज़बूत जड़ वाले तने पर रोपते हैं। गुलाब के बीज ही क्यों नहीं बोते?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Roses have lost the capacity to make seeds, and a graft keeps all the parent's features and flowers sooner",
            "गुलाब बीज बनाने की क्षमता खो चुके हैं, और रोपण जनक के सारे लक्षण रखता है और जल्दी फूल देता है",
          ),
        },
        {
          id: "cheap",
          label: t("Seeds cost money", "बीजों में पैसे लगते हैं"),
          feedback: t(
            "Grandpa isn't buying anything anyway. The reasons are biological: roses have lost the capacity to make seeds, and vegetative plants keep the parent's characteristics and flower earlier.",
            "दादाजी तो वैसे भी कुछ नहीं ख़रीद रहे। कारण जैविक हैं: गुलाब बीज बनाने की क्षमता खो चुके हैं, और कायिक पौधे जनक के लक्षण रखते हैं और जल्दी फूल देते हैं।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const stop = w.definition(
      t(
        "**Stop 3 done.** Plants can grow from roots, stems and leaves: potato buds, Bryophyllum leaf buds, money-plant cuttings, layering, grafting and tissue culture. Moulds spread by thick-walled spores. All of it is asexual: one parent. Pots so far: 12 money plants, 9 potatoes, 6 Bryophyllum, 2 roses. Next stop: why Grandpa's peas need flowers and bees at all.",
        "**पड़ाव 3 पूरा।** पौधे जड़, तने और पत्तियों से उग सकते हैं: आलू की कलियाँ, ब्रायोफ़िलम की पत्ती की कलियाँ, मनी प्लांट की कलमें, दाब कलम, रोपण और ऊतक संवर्धन। फफूँद मोटी दीवार वाले बीजाणुओं से फैलती है। यह सब अलैंगिक है: एक जनक। अब तक गमले: 12 मनी प्लांट, 9 आलू, 6 ब्रायोफ़िलम, 2 गुलाब। अगला पड़ाव: दादाजी की मटर को फूलों और मधुमक्खियों की ज़रूरत ही क्यों है।",
      ),
      "stop",
      { isHidden: true },
    );
    b.when(graft.on(QuestionSignal.Correct), [theBoard.show(stop), theBoard.pass()]);
    return column([
      w.title(t("Counting pots", "गमले गिनना")),
      w.body(
        t(
          "Ten days later the tray has sprouted: every piece with an eye has a green shoot. The Bryophyllum buds have dropped into a pot of soil, and the money-plant pieces with leaves are full of roots. Grandpa is now working on his roses.",
          "दस दिन बाद ट्रे में अंकुर फूट आए हैं: आँख वाले हर टुकड़े में हरा अंकुर है। ब्रायोफ़िलम की कलियाँ मिट्टी के गमले में गिर चुकी हैं, और पत्ती वाले मनी प्लांट के टुकड़ों में जड़ें भरी हैं। दादाजी अब अपने गुलाबों पर लगे हैं।",
        ),
      ),
      rose,
      graft,
      stop,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** NCERT in-text Q2 and Q4. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const sporesQ = choiceQuestion(b, {
      name: "sporesQ",
      prompt: t(
        "How will an organism benefit if it reproduces through spores?",
        "बीजाणुओं द्वारा जनन करने से जीव को क्या लाभ होगा?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Thick-walled spores survive until they reach a moist surface, and many are made",
            "मोटी दीवार वाले बीजाणु नम सतह तक पहुँचने तक बचे रहते हैं, और बहुत सारे बनते हैं",
          ),
        },
        {
          id: "partner",
          label: t("It gets a partner's DNA", "उसे साथी का DNA मिलता है"),
          feedback: t(
            "Spores are made by one individual: asexual reproduction. Their benefit is protection by thick walls, and large numbers.",
            "बीजाणु एक ही जीव बनाता है: अलैंगिक जनन। इनका लाभ है मोटी दीवारों से सुरक्षा, और बड़ी संख्या।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const why = choiceQuestion(b, {
      name: "why",
      prompt: t(
        "Why is vegetative propagation practised for growing some types of plants?",
        "कुछ तरह के पौधों को उगाने के लिए कायिक प्रवर्धन क्यों अपनाया जाता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Earlier flowers and fruit, seedless plants can be grown, and plants keep the parent's features",
            "जल्दी फूल और फल, बीज रहित पौधे उगाए जा सकते हैं, और पौधे जनक के लक्षण रखते हैं",
          ),
        },
        {
          id: "variety",
          label: t("To get as much variation as possible", "ज़्यादा से ज़्यादा विभिन्नता पाने के लिए"),
          feedback: t(
            "It's the opposite: the new plants are almost exact copies of the parent. That's why it is used: to keep a good plant's features.",
            "उल्टा है: नए पौधे जनक की लगभग हूबहू प्रतियाँ होते हैं। इसीलिए इसका उपयोग होता है: अच्छे पौधे के लक्षण बनाए रखने के लिए।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ Vegetative propagation: potato, Bryophyllum, money plant, layering, grafting, tissue culture. ✓ Rhizopus: hyphae spread, sporangia make spores. ✓ All these are asexual: one parent. Pots filled: 29 of 50. Next: why some plants use two parents.",
        "**मिशन लॉग।** ✓ कायिक प्रवर्धन: आलू, ब्रायोफ़िलम, मनी प्लांट, दाब कलम, रोपण, ऊतक संवर्धन। ✓ राइज़ोपस: कवक तंतु फैलते हैं, बीजाणुधानियाँ बीजाणु बनाती हैं। ✓ ये सब अलैंगिक हैं: एक जनक। गमले भरे: 50 में से 29। आगे: कुछ पौधे दो जनक क्यों इस्तेमाल करते हैं।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(why.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), sporesQ, why, log, space()]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [hook, vegetative, leavesAndNodes, farms, spores, inLife, yourTurn];

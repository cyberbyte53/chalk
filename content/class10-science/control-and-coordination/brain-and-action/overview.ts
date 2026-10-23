import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, goalQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  BrainAction,
  BrainDerived,
  BrainRegion,
  BrainTask,
  ControlScene,
  NeuronAction,
  NeuronTarget,
  brainMapDef,
  controlSceneDef,
  neuronSignalDef,
} from "@chalk/prop-control";

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** Grandpa's questions for the brain-map exhibit. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const stall = b.prop(controlSceneDef, "stall", { scene: ControlScene.ScienceFair });
  b.standsFor(
    stall,
    "Riya and Kabir at the stall, now with a neuron model and a chart of two paths",
  );
  return column([
    w.title(t("What is the brain doing?", "मस्तिष्क क्या कर रहा है?")),
    stall,
    w.body(
      t(
        "**Stop 3.** Last time: a reflex like pulling your hand away goes through the spinal cord without waiting for thought, while catching a ruler needs the brain to see and decide.",
        "**पड़ाव 3।** पिछली बार: प्रतिवर्त मस्तिष्क का इंतज़ार किए बिना मेरुरज्जु से होकर जाता है, जबकि रूलर पकड़ने में मस्तिष्क को देखना और तय करना पड़ता है।",
      ),
    ),
    w.body(
      t(
        'Riya is making the third exhibit, a brain map. Grandpa tests her with three questions: "When you ride your cycle, do you think about balancing? When your heart beats, do you tell it to? And when you write, who moves the pen?" This lesson finds out which parts of the nervous system handle which kind of action.',
        'रिया तीसरा प्रदर्श बना रही है, मस्तिष्क का नक्शा। दादाजी तीन सवालों से उसे परखते हैं: "जब तुम साइकिल चलाती हो, क्या संतुलन के बारे में सोचती हो? जब तुम्हारा दिल धड़कता है, क्या तुम उसे कहती हो? और जब तुम लिखती हो, क़लम कौन चलाता है?" यह पाठ पता लगाता है कि तंत्रिका तंत्र के कौन से हिस्से किस तरह की क्रिया सँभालते हैं।',
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Central and peripheral nervous systems. */
const systems = page(
  "systems",
  (b) => {
    const w = wordsOn(b);
    const map = b.prop(brainMapDef, "map", {
      selected: null,
      ask: null,
      showNames: true,
      showDivisions: false,
      canTap: true,
    });
    b.standsFor(
      map,
      "the human brain from the side, running down into the spinal cord; any part can be tapped to read about it",
    );
    const cns = choiceQuestion(b, {
      name: "cns",
      prompt: t("The central nervous system is made of…", "केंद्रीय तंत्रिका तंत्र बना है…"),
      options: [
        { id: "right", label: t("the brain and the spinal cord", "मस्तिष्क और मेरुरज्जु से") },
        {
          id: "nerves",
          label: t("the cranial and spinal nerves", "कपाल और मेरु तंत्रिकाओं से"),
          feedback: t(
            "Those nerves make up the peripheral nervous system, which links the central one to the rest of the body.",
            "ये तंत्रिकाएँ परिधीय तंत्रिका तंत्र बनाती हैं, जो केंद्रीय तंत्र को बाकी शरीर से जोड़ता है।",
          ),
        },
        {
          id: "brain",
          label: t("the brain only", "केवल मस्तिष्क से"),
          feedback: t(
            "The spinal cord is part of it too: it receives information and makes reflex arcs.",
            "मेरुरज्जु भी इसका हिस्सा है: वह सूचना पाता है और प्रतिवर्ती चाप बनाता है।",
          ),
        },
      ],
      answer: "right",
    });
    b.witness(map.learner(BrainAction.Tap, { region: BrainRegion.SpinalCord }));
    return column([
      w.title(t("The two halves of the nervous system", "तंत्रिका तंत्र के दो हिस्से")),
      w.body(
        t(
          "Reflexes aren't the spinal cord's only job. It is made of nerves that carry information to the brain for thinking. Thinking needs more complex connections, and these are packed into the **brain**, the main coordinating centre of the body.",
          "प्रतिवर्त मेरुरज्जु का अकेला काम नहीं। वह उन तंत्रिकाओं से बना है जो सोचने के लिए सूचना मस्तिष्क तक ले जाती हैं। सोचने के लिए ज़्यादा जटिल जोड़ चाहिए, और ये **मस्तिष्क** में भरे हैं, जो शरीर का मुख्य समन्वय केंद्र है।",
        ),
      ),
      w.definition(
        t(
          "**Central and peripheral nervous systems.** The **brain** and the **spinal cord** together are the **central nervous system**: they receive information from all parts of the body and put it together. The nerves that connect them to the rest of the body are the **peripheral nervous system**: **cranial nerves** come out of the brain, and **spinal nerves** come out of the spinal cord.",
          "**केंद्रीय और परिधीय तंत्रिका तंत्र।** **मस्तिष्क** और **मेरुरज्जु** मिलकर **केंद्रीय तंत्रिका तंत्र** हैं: वे शरीर के सब हिस्सों से सूचना पाते हैं और उसे जोड़ते हैं। उन्हें बाकी शरीर से जोड़ने वाली तंत्रिकाएँ **परिधीय तंत्रिका तंत्र** हैं: **कपाल तंत्रिकाएँ** मस्तिष्क से निकलती हैं, और **मेरु तंत्रिकाएँ** मेरुरज्जु से।",
        ),
      ),
      map,
      cns,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Voluntary, involuntary and reflex actions. */
const kinds = page(
  "kinds",
  (b) => {
    const w = wordsOn(b);
    const heart = choiceQuestion(b, {
      name: "heart",
      prompt: t("Your heart beating is…", "तुम्हारे दिल का धड़कना है…"),
      options: [
        { id: "right", label: t("an involuntary action", "एक अनैच्छिक क्रिया") },
        {
          id: "voluntary",
          label: t("a voluntary action we control", "हमारे नियंत्रण वाली ऐच्छिक क्रिया"),
          feedback: t(
            "You can't decide to stop or start your heart. It happens without your thinking control.",
            "तुम दिल को रोकने या चलाने का निर्णय नहीं ले सकते। यह तुम्हारे सोचने के नियंत्रण के बिना होता है।",
          ),
        },
        {
          id: "reflex",
          label: t("a reflex action", "एक प्रतिवर्ती क्रिया"),
          feedback: t(
            "A reflex is a sudden reply to a stimulus, like pulling away from a flame. The heart beats all the time on its own: involuntary.",
            "प्रतिवर्त किसी उद्दीपन पर अचानक जवाब है, जैसे लौ से हाथ हटाना। दिल हर समय अपने आप धड़कता है: अनैच्छिक।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Three kinds of action", "तीन तरह की क्रियाएँ")),
      w.definition(
        t(
          "**Voluntary actions** are the ones we decide on: writing, talking, moving a chair, clapping at the end of a programme. For these the brain sends messages to the muscles. **Involuntary actions** happen without our thinking control, and we can't easily control them even if we try: the heart beating, breathing, digesting food, the mouth watering when we see food we like. **Reflex actions** are sudden replies to a stimulus, like the pupil shrinking or a hand leaving a flame.",
          "**ऐच्छिक क्रियाएँ** वे हैं जिनका हम निर्णय लेते हैं: लिखना, बोलना, कुर्सी खिसकाना, कार्यक्रम के अंत में ताली बजाना। इनके लिए मस्तिष्क पेशियों को संदेश भेजता है। **अनैच्छिक क्रियाएँ** हमारे सोचने के नियंत्रण के बिना होती हैं, और कोशिश करें तब भी हम उन्हें आसानी से नियंत्रित नहीं कर पाते: दिल धड़कना, साँस लेना, खाना पचाना, पसंद का खाना देखकर मुँह में पानी आना। **प्रतिवर्ती क्रियाएँ** किसी उद्दीपन पर अचानक जवाब हैं, जैसे पुतली छोटी होना या लौ से हाथ हटना।",
        ),
      ),
      heart,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The fore-brain: the thinking part. */
const foreBrain = page(
  "fore-brain",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "NCERT 7.1.2, Fig. 7.3: the brain's three regions, fore-, mid- and hind-brain. The fore-brain is the main thinking part: sensory areas, association areas and motor areas; a separate part holds the centre that tells us we have eaten enough.",
    );
    const map = b.prop(brainMapDef, "map", {
      selected: BrainRegion.Cerebrum,
      ask: null,
      showNames: true,
      showDivisions: true,
      canTap: true,
    });
    b.standsFor(
      map,
      "the brain with its three divisions coloured (fore, mid, hind); the cerebrum is picked and its job shown; any part can be tapped",
    );
    const thinking = choiceQuestion(b, {
      name: "thinking",
      prompt: t(
        "You hear your name and turn to look. Which part puts the sound together with what you already know, so you recognise it?",
        "तुम अपना नाम सुनते हो और देखने मुड़ते हो। कौन सा हिस्सा उस आवाज़ को तुम्हारी पहले की जानकारी से जोड़ता है, ताकि तुम पहचान लो?",
      ),
      options: [
        {
          id: "right",
          label: t("The association areas of the fore-brain", "अग्रमस्तिष्क के साहचर्य क्षेत्र"),
        },
        {
          id: "medulla",
          label: t("The medulla", "मेडुला"),
          feedback: t(
            "The medulla runs involuntary actions. Recognising and deciding is the fore-brain's work.",
            "मेडुला अनैच्छिक क्रियाएँ चलाता है। पहचानना और निर्णय लेना अग्रमस्तिष्क का काम है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("The fore-brain: the thinking part", "अग्रमस्तिष्क: सोचने वाला हिस्सा")),
      w.body(
        t(
          "The brain has three major regions: the **fore-brain**, the **mid-brain** and the **hind-brain**. Each is in charge of putting together different inputs and outputs.",
          "मस्तिष्क के तीन मुख्य भाग हैं: **अग्रमस्तिष्क**, **मध्यमस्तिष्क** और **पश्चमस्तिष्क**। हर एक अलग-अलग आने वाली और जाने वाली सूचनाओं को जोड़ने का ज़िम्मेदार है।",
        ),
      ),
      w.definition(
        t(
          "**The fore-brain** is the main thinking part. It has **sensory areas** that receive impulses from the receptors, with separate areas for hearing, smell, sight and so on. **Association areas** make sense of this information by putting it together with information from other receptors and with what is already stored in the brain. A decision is made, and passed to the **motor areas**, which control the voluntary muscles, such as our leg muscles. A separate part of the fore-brain has the centre that tells us we have **eaten enough**.",
          "**अग्रमस्तिष्क** मुख्य सोचने वाला हिस्सा है। इसमें **संवेदी क्षेत्र** हैं जो ग्राहियों से आवेग पाते हैं, सुनने, सूँघने, देखने वग़ैरह के लिए अलग क्षेत्र। **साहचर्य क्षेत्र** इस सूचना को दूसरे ग्राहियों की सूचना और मस्तिष्क में पहले से रखी जानकारी से जोड़कर उसका अर्थ निकालते हैं। एक निर्णय लिया जाता है, और **प्रेरक क्षेत्रों** तक भेजा जाता है, जो ऐच्छिक पेशियों को नियंत्रित करते हैं, जैसे हमारे पैर की पेशियाँ। अग्रमस्तिष्क के एक अलग हिस्से में वह केंद्र है जो बताता है कि **पेट भर गया**।",
        ),
      ),
      map,
      thinking,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The medulla: involuntary actions. */
const medulla = page(
  "medulla",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "NCERT: many involuntary actions are controlled by the mid-brain and hind-brain; blood pressure, salivation and vomiting are controlled by the medulla in the hind-brain. The learner taps the part in charge of the mouth watering.",
    );
    const map = b.prop(brainMapDef, "map", {
      selected: null,
      ask: BrainTask.MouthWaters,
      showNames: true,
      showDivisions: true,
      canTap: true,
    });
    b.standsFor(
      map,
      "the brain map in ask mode: which part is in charge of your mouth watering at the smell of food?",
    );
    const goal = goalQuestion(b, {
      about: map,
      prompt: t(
        "Tap the part of the brain in charge of your mouth watering.",
        "मस्तिष्क का वह हिस्सा टैप करो जो मुँह में पानी आने का ज़िम्मेदार है।",
      ),
      isMet: map.derived(BrainDerived.IsRight).eq(true),
      solve: [map.learner(BrainAction.Tap, { region: BrainRegion.Medulla })],
    });
    return column([
      w.title(t("The medulla: actions you don't think about", "मेडुला: बिना सोचे होने वाली क्रियाएँ")),
      w.body(
        t(
          "Between the simple reflexes and the thought-out actions lies a set of muscle movements we have no thinking control over: the heart beating, the mouth watering, food moving through the gut. Many of these **involuntary actions** are controlled by the **mid-brain** and **hind-brain**.",
          "सरल प्रतिवर्तों और सोचकर की गई क्रियाओं के बीच पेशियों की ऐसी गतियाँ हैं जिन पर हमारा सोचने वाला नियंत्रण नहीं: दिल धड़कना, मुँह में पानी आना, आहार नाल में भोजन का आगे बढ़ना। इनमें से बहुत सी **अनैच्छिक क्रियाएँ** **मध्यमस्तिष्क** और **पश्चमस्तिष्क** नियंत्रित करते हैं।",
        ),
      ),
      w.definition(
        t(
          "**Medulla.** A part of the hind-brain, the **medulla**, controls involuntary actions including **blood pressure**, **salivation** (the mouth watering) and **vomiting**.",
          "**मेडुला।** पश्चमस्तिष्क का एक हिस्सा, **मेडुला**, अनैच्छिक क्रियाओं को नियंत्रित करता है, जिनमें **रक्तचाप**, **लार आना** (मुँह में पानी आना) और **उल्टी** शामिल हैं।",
        ),
      ),
      map,
      goal,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The cerebellum: precision, posture and balance. */
const cerebellum = page(
  "cerebellum",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "NCERT: walking in a straight line, riding a bicycle, picking up a pencil are possible because of the cerebellum, a part of the hind-brain responsible for the precision of voluntary actions and keeping posture and balance.",
    );
    const map = b.prop(brainMapDef, "map", {
      selected: null,
      ask: BrainTask.RideBicycle,
      showNames: true,
      showDivisions: true,
      canTap: true,
    });
    b.standsFor(
      map,
      "the brain map in ask mode: which part keeps you balanced while riding a bicycle?",
    );
    const goal = goalQuestion(b, {
      about: map,
      prompt: t(
        "Tap the part that keeps you balanced on a bicycle.",
        "वह हिस्सा टैप करो जो साइकिल पर तुम्हारा संतुलन बनाए रखता है।",
      ),
      isMet: map.derived(BrainDerived.IsRight).eq(true),
      solve: [map.learner(BrainAction.Tap, { region: BrainRegion.Cerebellum })],
      notes: [
        {
          when: map.field("selected").eq(BrainRegion.Medulla),
          say: t(
            "The medulla runs actions like salivation and blood pressure. Balance and precision are another part of the hind-brain.",
            "मेडुला लार आने और रक्तचाप जैसी क्रियाएँ चलाता है। संतुलन और सटीकता पश्चमस्तिष्क का दूसरा हिस्सा सँभालता है।",
          ),
          reach: [map.learner(BrainAction.Tap, { region: BrainRegion.Medulla })],
        },
      ],
    });
    return column([
      w.title(t("The cerebellum: precision and balance", "अनुमस्तिष्क: सटीकता और संतुलन")),
      w.definition(
        t(
          "**Cerebellum.** Walking in a straight line, riding a bicycle, picking up a pencil: these are possible because of the **cerebellum**, a part of the hind-brain. It is responsible for the **precision** of voluntary actions and for keeping the **posture** and **balance** of the body.",
          "**अनुमस्तिष्क।** सीधी रेखा में चलना, साइकिल चलाना, पेंसिल उठाना: ये **अनुमस्तिष्क** के कारण संभव हैं, जो पश्चमस्तिष्क का एक हिस्सा है। यह ऐच्छिक क्रियाओं की **सटीकता** और शरीर की **मुद्रा** और **संतुलन** बनाए रखने का ज़िम्मेदार है।",
        ),
      ),
      w.body(
        t(
          "Imagine having to think about every one of these: each step, every wobble of the cycle. The cerebellum does it for you.",
          "सोचो अगर तुम्हें इनमें से हर एक के बारे में सोचना पड़ता: हर क़दम, साइकिल की हर डगमगाहट। अनुमस्तिष्क यह तुम्हारे लिए करता है।",
        ),
      ),
      map,
      goal,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** How these tissues are protected. */
const protect = page(
  "protect",
  (b) => {
    const w = wordsOn(b);
    const backbone = choiceQuestion(b, {
      name: "backbone",
      prompt: t("What protects the spinal cord?", "मेरुरज्जु की रक्षा कौन करता है?"),
      options: [
        { id: "right", label: t("The vertebral column (backbone)", "कशेरुक दंड (रीढ़ की हड्डी)") },
        {
          id: "skull",
          label: t("The skull", "खोपड़ी"),
          feedback: t(
            "The skull is the bony box for the brain. The spinal cord runs inside the backbone.",
            "खोपड़ी मस्तिष्क के लिए हड्डियों का डिब्बा है। मेरुरज्जु रीढ़ की हड्डी के अंदर चलता है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Keeping it safe", "इसे सुरक्षित रखना")),
      w.body(
        t(
          "An organ as delicate and important as the brain needs careful protection. The brain sits inside a **bony box**, the skull. Inside the box it is held in a **fluid-filled balloon**, which absorbs shocks.",
          "मस्तिष्क जैसे नाज़ुक और ज़रूरी अंग को सावधानी से बचाना पड़ता है। मस्तिष्क एक **हड्डियों के डिब्बे**, खोपड़ी, के अंदर रहता है। डिब्बे के अंदर वह **द्रव से भरे गुब्बारे** में रहता है, जो झटके सोख लेता है।",
        ),
      ),
      w.body(
        t(
          "Run your hand down the middle of your back: you'll feel a hard, bumpy structure. This is the **vertebral column**, or backbone, and it protects the spinal cord.",
          "अपनी पीठ के बीच में हाथ फेरो: तुम्हें एक सख़्त, उभरी हुई संरचना महसूस होगी। यह **कशेरुक दंड**, या रीढ़ की हड्डी है, और यह मेरुरज्जु की रक्षा करती है।",
        ),
      ),
      backbone,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** How a muscle actually moves. */
const muscles = page(
  "muscles",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "NCERT 7.1.4: when a nerve impulse reaches a muscle, muscle cells shorten: special proteins in them change their shape and arrangement in response to the impulse.",
    );
    const cell = b.prop(neuronSignalDef, "cell", {
      step: 0,
      target: NeuronTarget.Muscle,
      showNames: true,
      canStep: true,
      canSetTarget: false,
    });
    b.standsFor(
      cell,
      "a neuron ending on a muscle cell; stepping the message across shortens the muscle cell",
    );
    const how = choiceQuestion(b, {
      name: "how",
      prompt: t(
        "How does a muscle cell change its shape when the impulse arrives?",
        "आवेग पहुँचने पर पेशी कोशिका अपना आकार कैसे बदलती है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Special proteins in it change their shape and arrangement, making the cell shorter",
            "उसमें मौजूद ख़ास प्रोटीन अपना आकार और व्यवस्था बदलते हैं, जिससे कोशिका छोटी हो जाती है",
          ),
        },
        {
          id: "water",
          label: t("It loses water and shrinks", "वह पानी खोकर सिकुड़ जाती है"),
          feedback: t(
            "That's how plant cells change shape. Animal muscle cells use special proteins.",
            "पादप कोशिकाएँ ऐसे आकार बदलती हैं। जंतुओं की पेशी कोशिकाएँ ख़ास प्रोटीन इस्तेमाल करती हैं।",
          ),
        },
      ],
      answer: "right",
    });
    b.witness(...Array.from({ length: 6 }, () => cell.learner(NeuronAction.Next)));
    return column([
      w.title(t("How a muscle moves", "पेशी कैसे हिलती है")),
      w.body(
        t(
          "All this collecting, carrying and deciding ends with one job: a **muscle** has to move. The simplest way for a muscle cell to move is to change its shape so that it becomes **shorter**.",
          "यह सारा इकट्ठा करना, ले जाना और निर्णय लेना एक काम पर ख़त्म होता है: किसी **पेशी** को हिलना है। पेशी कोशिका के हिलने का सबसे सरल तरीक़ा है अपना आकार बदलकर **छोटी** हो जाना।",
        ),
      ),
      w.body(
        t(
          "Muscle cells have **special proteins** that change both their shape and their arrangement in the cell when a nerve impulse arrives. The new arrangement makes the cell shorter. Step the message across to the muscle.",
          "पेशी कोशिकाओं में **ख़ास प्रोटीन** होते हैं जो तंत्रिका आवेग पहुँचने पर कोशिका में अपना आकार और व्यवस्था दोनों बदल देते हैं। नई व्यवस्था कोशिका को छोटा कर देती है। संदेश को पेशी तक ले जाओ।",
        ),
      ),
      cell,
      w.body(
        t(
          "In Class IX you met **voluntary muscles** (like those in your arms and legs, which move when you decide) and **involuntary muscles** (like those in the gut, which move on their own). The difference is in which kind of action controls them.",
          "कक्षा IX में तुमने **ऐच्छिक पेशियाँ** (जैसे हाथ-पैर की, जो तुम्हारे तय करने पर हिलती हैं) और **अनैच्छिक पेशियाँ** (जैसे आहार नाल की, जो अपने आप हिलती हैं) पढ़ी थीं। अंतर इसमें है कि उन्हें किस तरह की क्रिया नियंत्रित करती है।",
        ),
      ),
      how,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** Grandpa's three questions, answered. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const pen = choiceQuestion(b, {
      name: "pen",
      prompt: t(
        "Grandpa's third question: when Riya writes, which part decides and sends the order to the muscles of her hand?",
        "दादाजी का तीसरा सवाल: जब रिया लिखती है, तो कौन सा हिस्सा निर्णय लेकर उसके हाथ की पेशियों को आदेश भेजता है?",
      ),
      options: [
        {
          id: "right",
          label: t("The fore-brain, through its motor areas", "अग्रमस्तिष्क, अपने प्रेरक क्षेत्रों से"),
        },
        {
          id: "cord",
          label: t("The spinal cord, as a reflex", "मेरुरज्जु, प्रतिवर्त के रूप में"),
          feedback: t(
            "Writing is decided on: a voluntary action. The decision is made in the fore-brain and sent through its motor areas.",
            "लिखने का निर्णय लिया जाता है: यह ऐच्छिक क्रिया है। निर्णय अग्रमस्तिष्क में होता है और उसके प्रेरक क्षेत्रों से भेजा जाता है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const stop = w.definition(
      t(
        '**Stop 3 done.** Riya answers all three: balancing on the cycle is the **cerebellum**; the heartbeat is involuntary, run by the **hind-brain**; writing is voluntary, decided in the **fore-brain**. The brain map goes up with sticky notes of everyday actions to match to each part. Kabir points at Grandpa\'s chhui-mui on the terrace: "Plants have no brain at all. So how does that one fold up when I touch it?" Next stop: plants.',
        '**पड़ाव 3 पूरा।** रिया तीनों के जवाब देती है: साइकिल पर संतुलन **अनुमस्तिष्क** है; दिल की धड़कन अनैच्छिक है, जिसे **पश्चमस्तिष्क** चलाता है; लिखना ऐच्छिक है, जिसका निर्णय **अग्रमस्तिष्क** में होता है। मस्तिष्क का नक्शा रोज़ की क्रियाओं की पर्चियों के साथ लगता है, जिन्हें हर हिस्से से मिलाना है। कबीर छत पर दादाजी की छुई-मुई की ओर इशारा करता है: "पौधों के तो मस्तिष्क होता ही नहीं। तो वह छूते ही कैसे सिकुड़ जाती है?" अगला पड़ाव: पौधे।',
      ),
      "stop",
      { isHidden: true },
    );
    b.when(pen.on(QuestionSignal.Correct), [theBoard.show(stop), theBoard.pass()]);
    return column([
      w.title(t("Grandpa's three questions", "दादाजी के तीन सवाल")),
      pen,
      stop,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** NCERT in-text Q3, Exercise 3 and Exercise 10; then the log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const posture = choiceQuestion(b, {
      name: "posture",
      prompt: t(
        "Which part of the brain maintains the posture and balance of the body?",
        "मस्तिष्क का कौन सा हिस्सा शरीर की मुद्रा और संतुलन बनाए रखता है?",
      ),
      options: [
        { id: "right", label: t("The cerebellum", "अनुमस्तिष्क") },
        {
          id: "medulla",
          label: t("The medulla", "मेडुला"),
          feedback: t(
            "The medulla controls involuntary actions like blood pressure. Posture and balance are the cerebellum's job.",
            "मेडुला रक्तचाप जैसी अनैच्छिक क्रियाएँ नियंत्रित करता है। मुद्रा और संतुलन अनुमस्तिष्क का काम है।",
          ),
        },
        {
          id: "fore",
          label: t("The fore-brain", "अग्रमस्तिष्क"),
          feedback: t(
            "The fore-brain thinks and decides. Balance is kept without thinking, by the cerebellum.",
            "अग्रमस्तिष्क सोचता और तय करता है। संतुलन बिना सोचे अनुमस्तिष्क बनाए रखता है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const all = choiceQuestion(b, {
      name: "all",
      prompt: t("The brain is responsible for…", "मस्तिष्क ज़िम्मेदार है…"),
      options: [
        {
          id: "thinking",
          label: t("thinking only", "केवल सोचने के लिए"),
          feedback: t(
            "Thinking is the fore-brain's job, but the hind-brain also regulates the heartbeat and keeps balance.",
            "सोचना अग्रमस्तिष्क का काम है, पर पश्चमस्तिष्क दिल की धड़कन भी नियमित करता है और संतुलन भी बनाए रखता है।",
          ),
        },
        {
          id: "heart",
          label: t("regulating the heartbeat only", "केवल दिल की धड़कन नियमित करने के लिए"),
          feedback: t(
            "That's one of its jobs, along with thinking and balancing the body.",
            "यह उसके कामों में से एक है, सोचने और शरीर का संतुलन बनाने के साथ।",
          ),
        },
        {
          id: "balance",
          label: t("balancing the body only", "केवल शरीर का संतुलन बनाने के लिए"),
          feedback: t(
            "That's one of its jobs, along with thinking and regulating the heartbeat.",
            "यह उसके कामों में से एक है, सोचने और दिल की धड़कन नियमित करने के साथ।",
          ),
        },
        { id: "right", label: t("all of these", "इन सबके लिए") },
      ],
      answer: "right",
      keepOrder: true,
      passes: false,
    });
    const differ = choiceQuestion(b, {
      name: "differ",
      prompt: t(
        "How are involuntary actions and reflex actions different?",
        "अनैच्छिक क्रियाएँ और प्रतिवर्ती क्रियाएँ कैसे अलग हैं?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Involuntary actions go on all the time under the mid- and hind-brain; a reflex is a sudden reply to a stimulus, made without thinking (often through the spinal cord)",
            "अनैच्छिक क्रियाएँ मध्य और पश्चमस्तिष्क के नियंत्रण में लगातार चलती हैं; प्रतिवर्त किसी उद्दीपन पर बिना सोचे अचानक जवाब है (अक्सर मेरुरज्जु से)",
          ),
        },
        {
          id: "same",
          label: t("They are the same thing", "दोनों एक ही चीज़ हैं"),
          feedback: t(
            "Neither is thought out, but a heartbeat goes on all the time, while a reflex is a sudden reply to a particular stimulus.",
            "दोनों सोचकर नहीं होतीं, पर दिल की धड़कन लगातार चलती है, जबकि प्रतिवर्त किसी ख़ास उद्दीपन पर अचानक जवाब है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ Brain + spinal cord = **central nervous system**; cranial and spinal nerves = **peripheral nervous system**. ✓ **Voluntary** actions are decided in the **fore-brain**, which also has sensory, association and motor areas. ✓ **Involuntary** actions are run by the mid- and hind-brain; the **medulla** controls blood pressure, salivation and vomiting. ✓ The **cerebellum** gives precision, posture and balance. ✓ Skull, fluid and backbone protect it all; muscles shorten when their proteins rearrange. Next: plants, with no nerves at all.",
        "**मिशन लॉग।** ✓ मस्तिष्क + मेरुरज्जु = **केंद्रीय तंत्रिका तंत्र**; कपाल और मेरु तंत्रिकाएँ = **परिधीय तंत्रिका तंत्र**। ✓ **ऐच्छिक** क्रियाओं का निर्णय **अग्रमस्तिष्क** में होता है, जिसमें संवेदी, साहचर्य और प्रेरक क्षेत्र भी हैं। ✓ **अनैच्छिक** क्रियाएँ मध्य और पश्चमस्तिष्क चलाते हैं; **मेडुला** रक्तचाप, लार और उल्टी नियंत्रित करता है। ✓ **अनुमस्तिष्क** सटीकता, मुद्रा और संतुलन देता है। ✓ खोपड़ी, द्रव और रीढ़ इन सबकी रक्षा करते हैं; पेशियाँ तब छोटी होती हैं जब उनके प्रोटीन नई व्यवस्था में आते हैं। आगे: पौधे, जिनमें तंत्रिकाएँ ही नहीं।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(differ.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), posture, all, differ, log, space()]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [
  hook,
  systems,
  kinds,
  foreBrain,
  medulla,
  cerebellum,
  protect,
  muscles,
  inLife,
  yourTurn,
];

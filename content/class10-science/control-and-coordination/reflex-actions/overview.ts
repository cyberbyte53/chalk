import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  ControlScene,
  ReflexAction,
  ReflexPath,
  controlSceneDef,
  reflexArcDef,
} from "@chalk/prop-control";
import { EyeAction, Light, eyeModelDef } from "@chalk/prop-eye";

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** The hot tawa: a hand that moved before anyone decided. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const tawa = b.prop(controlSceneDef, "tawa", { scene: ControlScene.HotTawa });
  b.standsFor(
    tawa,
    "Kabir snatching his hand back from a hot tawa in the kitchen, with Mom behind him",
  );
  return column([
    w.title(t("Faster than thinking", "सोचने से भी तेज़")),
    tawa,
    w.body(
      t(
        "**Stop 2.** Last time: a message travels along neurons as electrical impulses, and crosses each gap, the synapse, as chemicals.",
        "**पड़ाव 2।** पिछली बार: संदेश तंत्रिका कोशिकाओं पर विद्युत आवेगों के रूप में चलता है, और हर अंतराल, सिनेप्स, को रसायनों के रूप में पार करता है।",
      ),
    ),
    w.body(
      t(
        'That evening Kabir sneaks into the kitchen for a paratha and his fingers brush the hot tawa. His hand is back at his chest before he even says "ouch". "I didn\'t decide to do that," he says, shaking his fingers. "My hand just did it." This lesson finds out how a body can reply before the brain has thought about it, and why that\'s a good idea.',
        'उस शाम कबीर पराठे के लिए चुपके से रसोई में जाता है और उसकी उँगलियाँ गरम तवे को छू जाती हैं। "आउच" कहने से पहले ही उसका हाथ वापस सीने पर होता है। "मैंने यह तय नहीं किया," वह उँगलियाँ झटकते हुए कहता है। "मेरे हाथ ने बस कर दिया।" यह पाठ पता लगाता है कि शरीर मस्तिष्क के सोचने से पहले जवाब कैसे दे सकता है, और यह अच्छी बात क्यों है।',
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** What if the brain had to think first? */
const thinkFirst = page(
  "think-first",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "NCERT 7.1.1: if a hot touch had to be thought about by the brain first, the message would go all the way up to the thinking part of the brain and back; thinking involves many impulses and takes time, enough to get burnt.",
    );
    const arc = b.prop(reflexArcDef, "arc", {
      path: ReflexPath.Brain,
      step: 0,
      canChoose: false,
      canStep: true,
      showNames: true,
    });
    b.standsFor(
      arc,
      "a hand on a hot tawa; the message is stepped up the spinal cord to the brain, through thinking, and back down to the arm muscle, while a time bar fills past the burn line",
    );
    const late = choiceQuestion(b, {
      name: "late",
      prompt: t(
        "Step the message all the way. What goes wrong when the brain has to think first?",
        "संदेश को पूरा आगे बढ़ाओ। जब मस्तिष्क को पहले सोचना पड़े तो क्या गड़बड़ होती है?",
      ),
      options: [
        {
          id: "right",
          label: t("It takes so long that the hand gets burnt", "इतना समय लगता है कि हाथ जल जाता है"),
        },
        {
          id: "never",
          label: t("The hand never moves at all", "हाथ बिल्कुल नहीं हिलता"),
          feedback: t(
            "The hand does move in the end. The trouble is the time the long trip and the thinking take.",
            "हाथ आख़िर में हिलता है। परेशानी उस समय की है जो लंबी यात्रा और सोचने में लगता है।",
          ),
        },
      ],
      answer: "right",
    });
    b.witness(...Array.from({ length: 7 }, () => arc.learner(ReflexAction.Next)));
    return column([
      w.title(t("If the brain had to think first", "अगर मस्तिष्क को पहले सोचना पड़े")),
      w.body(
        t(
          "The **thinking** part of our body is a dense network of neurons at the front of the skull. It receives signals from all over the body and thinks about them before replying. To do that, nerves must carry signals up to it, and other nerves must carry its orders back down to the muscles.",
          "हमारे शरीर का **सोचने** वाला हिस्सा खोपड़ी के अगले भाग में तंत्रिका कोशिकाओं का घना जाल है। उसे पूरे शरीर से संकेत मिलते हैं और जवाब देने से पहले वह उन पर सोचता है। इसके लिए तंत्रिकाओं को संकेत उस तक ऊपर ले जाने पड़ते हैं, और दूसरी तंत्रिकाओं को उसके आदेश नीचे पेशियों तक लाने पड़ते हैं।",
        ),
      ),
      w.body(
        t(
          'Thinking is complex: many impulses from many neurons. So imagine thinking about a hot tawa: "hot... pain... I might get burnt... move the hand!" Step the message along this path and watch the time bar.',
          'सोचना जटिल है: बहुत सी तंत्रिका कोशिकाओं से बहुत से आवेग। तो गरम तवे के बारे में सोचने की कल्पना करो: "गरम... दर्द... मैं जल सकता हूँ... हाथ हटाओ!" इस रास्ते पर संदेश आगे बढ़ाओ और समय की पट्टी देखो।',
        ),
      ),
      arc,
      late,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The reflex arc, through the spinal cord. */
const arc = page(
  "arc",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "NCERT Fig. 7.2: the reflex arc. Receptor in the skin → sensory neuron → relay neuron in the spinal cord → motor neuron → arm muscle (the effector). The connection is made in the spinal cord, where the nerves first meet; the information also goes on up to the brain.",
    );
    const reflex = b.prop(reflexArcDef, "reflex", {
      path: ReflexPath.Reflex,
      step: 0,
      canChoose: true,
      canStep: true,
      showNames: true,
    });
    b.standsFor(
      reflex,
      "the same hand on the tawa; on the reflex path the message goes from the skin along a sensory neuron into the spinal cord, straight to a motor neuron and back to the arm muscle, with a copy going up to the brain; the learner can also switch to the think-first path",
    );
    const where = choiceQuestion(b, {
      name: "where",
      prompt: t(
        "Where is the connection between the input nerve and the output nerve made in a reflex arc?",
        "प्रतिवर्ती चाप में आने वाली और जाने वाली तंत्रिका का जोड़ कहाँ बनता है?",
      ),
      options: [
        { id: "right", label: t("In the spinal cord", "मेरुरज्जु में") },
        {
          id: "brain",
          label: t("In the thinking part of the brain", "मस्तिष्क के सोचने वाले हिस्से में"),
          feedback: t(
            "That's the slow path. A reflex arc is joined where the nerves first meet: in the spinal cord.",
            "वह धीमा रास्ता है। प्रतिवर्ती चाप वहाँ जुड़ता है जहाँ तंत्रिकाएँ पहली बार मिलती हैं: मेरुरज्जु में।",
          ),
        },
        {
          id: "hand",
          label: t("In the hand itself", "ख़ुद हाथ में"),
          feedback: t(
            "The hand has the receptor and the muscle, but the link between the two nerves is in the spinal cord.",
            "हाथ में ग्राही और पेशी हैं, पर दोनों तंत्रिकाओं का जोड़ मेरुरज्जु में है।",
          ),
        },
      ],
      answer: "right",
    });
    b.witness(...Array.from({ length: 4 }, () => reflex.learner(ReflexAction.Next)));
    return column([
      w.title(t("The short cut: a reflex arc", "छोटा रास्ता: प्रतिवर्ती चाप")),
      w.definition(
        t(
          "**Reflex action.** A sudden response to something in the surroundings, made **without thinking** about it and without feeling in control, is a **reflex action**: pulling your hand from a flame, jumping out of the way of a bus.",
          "**प्रतिवर्ती क्रिया।** परिवेश की किसी चीज़ पर अचानक अनुक्रिया, जो उसके बारे में **बिना सोचे** और बिना नियंत्रण का एहसास किए हो, **प्रतिवर्ती क्रिया** है: लौ से हाथ खींच लेना, बस के रास्ते से कूदकर हट जाना।",
        ),
      ),
      w.body(
        t(
          "The body's solution: connect the nerve that **detects** the heat to the nerve that **moves** the muscle in a simple way, without waiting for thought. Nerves from all over the body meet in a bundle in the **spinal cord** on their way to the brain, so that's where the link is made.",
          "शरीर का हल: गर्मी **पहचानने** वाली तंत्रिका को पेशी **हिलाने** वाली तंत्रिका से सीधे तरीक़े से जोड़ दो, सोच का इंतज़ार किए बिना। पूरे शरीर की तंत्रिकाएँ मस्तिष्क तक जाते हुए **मेरुरज्जु** में एक बंडल में मिलती हैं, इसलिए जोड़ वहीं बनता है।",
        ),
      ),
      w.definition(
        t(
          "**Reflex arc.** The path of a reflex: **receptor** (in the skin) → **sensory neuron** (carries the message in) → **relay neuron** in the spinal cord → **motor neuron** (carries the order out) → **effector**, the muscle that acts. The information **also goes on up to the brain**, which is how you know it hurt. For most reflexes, like pulling your hand away, the link is made in the spinal cord; some reflexes of the head, like the eye's, link in the brain instead, still without thinking.",
          "**प्रतिवर्ती चाप।** प्रतिवर्त का रास्ता: **ग्राही** (त्वचा में) → **संवेदी तंत्रिका कोशिका** (संदेश अंदर लाती है) → मेरुरज्जु में **प्रसारण तंत्रिका कोशिका** → **प्रेरक तंत्रिका कोशिका** (आदेश बाहर ले जाती है) → **कार्यकर**, वह पेशी जो काम करती है। सूचना **आगे मस्तिष्क तक भी जाती है**, इसी से तुम्हें पता चलता है कि दर्द हुआ। ज़्यादातर प्रतिवर्तों में, जैसे हाथ झट से हटाना, जोड़ मेरुरज्जु में बनता है; सिर के कुछ प्रतिवर्त, जैसे आँख का, बिना सोचे ही मस्तिष्क में जुड़ते हैं।",
        ),
      ),
      reflex,
      where,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Why reflex arcs evolved. */
const evolved = page(
  "evolved",
  (b) => {
    const w = wordsOn(b);
    const why = choiceQuestion(b, {
      name: "why",
      prompt: t(
        "Why do reflex arcs still matter in animals like us, who can think?",
        "हम जैसे सोच सकने वाले जंतुओं में भी प्रतिवर्ती चाप क्यों ज़रूरी हैं?",
      ),
      options: [
        {
          id: "right",
          label: t("They give quicker responses than thinking can", "वे सोच से तेज़ अनुक्रिया देते हैं"),
        },
        {
          id: "smart",
          label: t("They are smarter than the brain", "वे मस्तिष्क से ज़्यादा समझदार हैं"),
          feedback: t(
            "A reflex arc doesn't think at all. Its strength is speed.",
            "प्रतिवर्ती चाप बिल्कुल नहीं सोचता। उसकी ताक़त तेज़ी है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Why reflexes exist", "प्रतिवर्त क्यों होते हैं")),
      w.body(
        t(
          "Reflex arcs evolved in animals because the brain's thinking is **not fast enough**. In fact many animals have very little, or none, of the complex network of neurons needed for thinking. For them, reflex arcs are an efficient way to work without true thought.",
          "जंतुओं में प्रतिवर्ती चाप इसलिए विकसित हुए क्योंकि मस्तिष्क का सोचना **काफ़ी तेज़ नहीं** है। सच तो यह है कि बहुत से जंतुओं में सोचने के लिए ज़रूरी तंत्रिका कोशिकाओं का जटिल जाल बहुत कम है, या है ही नहीं। उनके लिए प्रतिवर्ती चाप बिना असली सोच के काम करने का कुशल तरीक़ा हैं।",
        ),
      ),
      w.body(
        t(
          "Even after complex networks for thinking came into existence, reflex arcs stayed, because they are still more efficient for **quick responses**.",
          "सोचने के जटिल जाल बन जाने के बाद भी प्रतिवर्ती चाप बने रहे, क्योंकि **तेज़ अनुक्रिया** के लिए वे अब भी ज़्यादा कुशल हैं।",
        ),
      ),
      why,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Bright light and the pupil: another reflex. */
const pupil = page(
  "pupil",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "NCERT asks: trace the sequence when bright light is focused on your eyes. The pupil shrinks without our deciding: receptors in the eye detect the light, a message goes in, and the muscles round the pupil make it small.",
    );
    const eye = b.prop(eyeModelDef, "eye", {
      light: Light.Dim,
      showNames: true,
      showRays: false,
      showSees: false,
      showReadout: false,
      canMoveObject: false,
      canSetLight: true,
    });
    b.standsFor(
      eye,
      "an eye seen from the side, with its pupil; the learner switches between dim and bright light and the pupil changes size",
    );
    const order = choiceQuestion(b, {
      name: "order",
      prompt: t(
        "A torch is shone into your eyes. Which sequence is right?",
        "तुम्हारी आँखों में टॉर्च चमकाई जाती है। कौन सा क्रम सही है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Receptors detect bright light → sensory neuron → brain, without thinking → motor neuron → muscles round the pupil shrink it",
            "ग्राही तेज़ रोशनी पहचानते हैं → संवेदी तंत्रिका कोशिका → बिना सोचे मस्तिष्क → प्रेरक तंत्रिका कोशिका → पुतली के चारों ओर की पेशियाँ उसे छोटा करती हैं",
          ),
        },
        {
          id: "think",
          label: t(
            "You notice the glare and choose to shrink your pupil",
            "तुम तय करते हो कि रोशनी बहुत तेज़ है और पुतली बंद कर लेते हो",
          ),
          feedback: t(
            "You can't make your pupil small by deciding to. It happens by itself: a reflex.",
            "तुम सोचकर अपनी पुतली छोटी नहीं कर सकते। यह अपने आप होता है: एक प्रतिवर्त।",
          ),
        },
        {
          id: "spinal",
          label: t(
            "Light hits the eye → message to the spinal cord → arm moves up to shade the eyes",
            "रोशनी आँख पर पड़ती है → संदेश मेरुरज्जु तक → हाथ आँखों को ढकने ऊपर उठता है",
          ),
          feedback: t(
            "The pupil changes by itself, through a link in the brain, and the effector is the muscle round the pupil, not the arm.",
            "पुतली अपने आप बदलती है, मस्तिष्क में बने जोड़ से, और कार्यकर पुतली के चारों ओर की पेशी है, हाथ नहीं।",
          ),
        },
      ],
      answer: "right",
    });
    b.witness(eye.learner(EyeAction.SetLight, { light: Light.Bright }));
    return column([
      w.title(t("Another reflex: the pupil", "एक और प्रतिवर्त: पुतली")),
      w.body(
        t(
          "The **pupil** is the dark opening in the middle of the eye that lets light in. In bright light it becomes small; in dim light it opens wide. You don't decide this: it's a reflex that protects the eye. Switch the light and watch.",
          "**पुतली** आँख के बीच का काला छेद है जिससे रोशनी अंदर आती है। तेज़ रोशनी में वह छोटी हो जाती है; मंद रोशनी में खुल जाती है। यह तुम तय नहीं करते: यह एक प्रतिवर्त है जो आँख की रक्षा करता है। रोशनी बदलो और देखो।",
        ),
      ),
      eye,
      order,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** The tawa versus the ruler. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const ruler = b.prop(controlSceneDef, "ruler", { scene: ControlScene.RulerDrop });
    b.standsFor(ruler, "Riya drops the ruler; Kabir's fingers wait below it");
    const which = choiceQuestion(b, {
      name: "which",
      prompt: t(
        "Kabir's hand left the tawa in a flash, but catching the ruler takes him longer. Why?",
        "कबीर का हाथ पल भर में तवे से हट गया, पर रूलर पकड़ने में उसे ज़्यादा समय लगता है। क्यों?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "The tawa was a reflex through the spinal cord; catching the ruler needs the brain to see and decide",
            "तवे वाला मेरुरज्जु से होकर प्रतिवर्त था; रूलर पकड़ने में मस्तिष्क को देखना और तय करना पड़ता है",
          ),
        },
        {
          id: "lucky",
          label: t("The tawa was just luck", "तवे वाला बस किस्मत थी"),
          feedback: t(
            "Not luck: a hot touch takes the short path through the spinal cord every time.",
            "किस्मत नहीं: गरम स्पर्श हर बार मेरुरज्जु वाला छोटा रास्ता लेता है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const stop = w.definition(
      t(
        '**Stop 2 done.** The second exhibit is a chart with two paths drawn in two colours: the reflex arc, short and fast, and the thinking path, up to the brain and back. Kabir writes the rule under his Fastest Hands board: *"The ruler game tests your brain, not your reflexes!"* But Riya wonders what the brain is actually doing up there. Next stop: the brain.',
        '**पड़ाव 2 पूरा।** दूसरा प्रदर्श दो रंगों में बने दो रास्तों वाला एक चार्ट है: प्रतिवर्ती चाप, छोटा और तेज़, और सोचने वाला रास्ता, मस्तिष्क तक जाकर वापस। कबीर अपने सबसे तेज़ हाथ बोर्ड के नीचे नियम लिखता है: *"रूलर का खेल तुम्हारे मस्तिष्क को परखता है, प्रतिवर्त को नहीं!"* पर रिया सोचती है कि मस्तिष्क वहाँ ऊपर असल में करता क्या है। अगला पड़ाव: मस्तिष्क।',
      ),
      "stop",
      { isHidden: true },
    );
    b.when(which.on(QuestionSignal.Correct), [theBoard.show(stop), theBoard.pass()]);
    return column([
      w.title(t("The tawa and the ruler", "तवा और रूलर")),
      ruler,
      which,
      stop,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** NCERT in-text Q1, Q5 and Exercise 7; then the log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const walking = choiceQuestion(b, {
      name: "walking",
      prompt: t(
        "What is the difference between a reflex action and walking?",
        "प्रतिवर्ती क्रिया और चलने में क्या अंतर है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "A reflex happens without thinking, through the spinal cord; walking is voluntary: we decide to do it",
            "प्रतिवर्त बिना सोचे, मेरुरज्जु से होता है; चलना ऐच्छिक है: हम उसे करने का निर्णय लेते हैं",
          ),
        },
        {
          id: "same",
          label: t("There is no difference: both use muscles", "कोई अंतर नहीं: दोनों में पेशियाँ लगती हैं"),
          feedback: t(
            "Both use muscles, but walking is decided on, and a reflex isn't.",
            "दोनों में पेशियाँ लगती हैं, पर चलने का निर्णय लिया जाता है, और प्रतिवर्त का नहीं।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const brainRole = choiceQuestion(b, {
      name: "brainRole",
      prompt: t(
        "What is the role of the brain in a reflex action?",
        "प्रतिवर्ती क्रिया में मस्तिष्क की क्या भूमिका है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "It isn't needed for the quick response, but the information still reaches it, so we know what happened",
            "तेज़ अनुक्रिया के लिए उसकी ज़रूरत नहीं, पर सूचना फिर भी उस तक पहुँचती है, इसलिए हमें पता चलता है कि क्या हुआ",
          ),
        },
        {
          id: "decides",
          label: t("It decides to move the muscle", "वह पेशी हिलाने का निर्णय लेता है"),
          feedback: t(
            "If the brain had to decide, it would be too slow. The spinal cord makes the link; the brain is told afterwards.",
            "अगर मस्तिष्क को तय करना पड़ता, तो बहुत देर होती। जोड़ मेरुरज्जु बनाता है; मस्तिष्क को बाद में बताया जाता है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const injury = choiceQuestion(b, {
      name: "injury",
      prompt: t(
        "Which signals will be disrupted if the spinal cord is injured?",
        "मेरुरज्जु में चोट लगने पर कौन से संकेत बाधित होंगे?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Reflex arcs through it, and messages between the brain and the body below the injury",
            "उससे होकर जाने वाले प्रतिवर्ती चाप, और मस्तिष्क व चोट के नीचे के शरीर के बीच के संदेश",
          ),
        },
        {
          id: "none",
          label: t("None: the brain does everything", "कोई नहीं: सब कुछ मस्तिष्क करता है"),
          feedback: t(
            "The spinal cord makes reflex arcs and carries messages to and from the brain, so both are hit.",
            "मेरुरज्जु प्रतिवर्ती चाप बनाता है और मस्तिष्क से आने-जाने वाले संदेश ले जाता है, इसलिए दोनों पर असर पड़ता है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ A **reflex action** is a quick reply made without thinking. ✓ Its path is the **reflex arc**: receptor → sensory neuron → relay in the **spinal cord** → motor neuron → muscle; the information also reaches the brain. ✓ Reflexes evolved because thinking is too slow for danger. Next: what the brain itself does.",
        "**मिशन लॉग।** ✓ **प्रतिवर्ती क्रिया** बिना सोचे दिया गया तेज़ जवाब है। ✓ उसका रास्ता **प्रतिवर्ती चाप** है: ग्राही → संवेदी तंत्रिका कोशिका → **मेरुरज्जु** में प्रसारण → प्रेरक तंत्रिका कोशिका → पेशी; सूचना मस्तिष्क तक भी पहुँचती है। ✓ प्रतिवर्त इसलिए विकसित हुए क्योंकि ख़तरे के लिए सोचना बहुत धीमा है। आगे: मस्तिष्क ख़ुद क्या करता है।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(injury.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([
      w.title(t("Your turn", "अब तुम्हारी बारी")),
      walking,
      brainRole,
      injury,
      log,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [hook, thinkFirst, arc, evolved, pupil, inLife, yourTurn];

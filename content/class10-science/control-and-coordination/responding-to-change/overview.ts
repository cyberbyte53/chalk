import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  ControlScene,
  NeuronAction,
  NeuronTarget,
  controlSceneDef,
  neuronSignalDef,
} from "@chalk/prop-control";

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** Who, where, what: the science fair stall and Kabir's ruler game. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const stall = b.prop(controlSceneDef, "stall", { scene: ControlScene.ScienceFair });
  b.standsFor(
    stall,
    "Riya and Kabir at an empty stall table under a banner: How does your body know what to do?",
  );
  return column([
    w.title(t("Two weeks to the science fair", "विज्ञान मेले में दो हफ़्ते")),
    stall,
    w.body(
      t(
        "Riya's class has a stall at the school science fair, and she has picked the theme: **\"How does your body know what to do?\"** Her little brother Kabir has only one plan for it: a reaction game. Drop a ruler between someone's fingers and see how fast they catch it. He wants a sign that says **Fastest Hands**, and he wants his name at the top of the board.",
        'रिया की कक्षा का स्कूल विज्ञान मेले में एक स्टॉल है, और उसने विषय चुन लिया है: **"तुम्हारे शरीर को कैसे पता चलता है कि क्या करना है?"** उसके छोटे भाई कबीर की बस एक योजना है: एक प्रतिक्रिया का खेल। किसी की उँगलियों के बीच से रूलर गिराओ और देखो वह कितनी जल्दी पकड़ता है। उसे **सबसे तेज़ हाथ** लिखा बोर्ड चाहिए, और बोर्ड पर सबसे ऊपर अपना नाम।',
      ),
    ),
    w.body(
      t(
        'Grandpa, watching from his chair, asks the question that starts everything: "And how does your hand know the ruler is falling?"',
        'अपनी कुर्सी से देख रहे दादाजी वह सवाल पूछते हैं जिससे सब शुरू होता है: "और तुम्हारे हाथ को कैसे पता चलता है कि रूलर गिर रहा है?"',
      ),
    ),
    space(),
  ]);
});

/** Why this chapter, and the stops on the way. */
const why = page("why", (b) => {
  const w = wordsOn(b);
  const fair = b.prop(controlSceneDef, "fair", { scene: ControlScene.FairDay });
  b.standsFor(
    fair,
    "the goal: fair day, the stall full of exhibits and visitors, a Fastest Hands board",
  );
  return column([
    w.title(t("What this chapter is for", "यह अध्याय किसलिए है")),
    fair,
    w.body(
      t(
        "That's the mission: build the stall, one exhibit at a time, and be able to explain every one of them to the visitors. Each exhibit answers one part of the big question: how does a living thing notice a change around it, and do exactly the right thing in reply?",
        "यही मिशन है: स्टॉल बनाना, एक-एक प्रदर्श करके, और हर एक को आने वालों को समझा पाना। हर प्रदर्श बड़े सवाल का एक हिस्सा हल करता है: कोई जीव अपने आसपास के बदलाव को कैसे पहचानता है, और बदले में ठीक वही काम कैसे करता है?",
      ),
    ),
    w.definition(
      t(
        "**The stops on the way.** (1) How a message travels in the body: *this lesson*, the neuron model. (2) Reflex actions: the ruler game and the hot tawa. (3) The brain: the brain map. (4) How plants move without nerves: Grandpa's chhui-mui and a bean box. (5) Plant hormones. (6) Hormones in animals, and fair day.",
        "**रास्ते के पड़ाव।** (1) शरीर में संदेश कैसे चलता है: *यह पाठ*, तंत्रिका कोशिका का मॉडल। (2) प्रतिवर्ती क्रियाएँ: रूलर का खेल और गरम तवा। (3) मस्तिष्क: मस्तिष्क का नक्शा। (4) बिना तंत्रिकाओं के पौधे कैसे हिलते हैं: दादाजी की छुई-मुई और सेम का डिब्बा। (5) पादप हॉर्मोन। (6) जंतुओं में हॉर्मोन, और मेले का दिन।",
      ),
    ),
    w.body(
      t(
        "First stop, from the very beginning: what does it mean to respond to a change, and how does a message get from your eyes to your hand?",
        "पहला पड़ाव, बिल्कुल शुरू से: किसी बदलाव पर अनुक्रिया करने का मतलब क्या है, और कोई संदेश तुम्हारी आँखों से हाथ तक कैसे पहुँचता है?",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Stimulus, response, control and coordination. */
const change = page(
  "change",
  (b) => {
    const w = wordsOn(b);
    const growth = choiceQuestion(b, {
      name: "growth",
      prompt: t(
        "Which of these movements is caused by growth?",
        "इनमें से कौन सी गति वृद्धि के कारण होती है?",
      ),
      options: [
        {
          id: "right",
          label: t("A seedling pushing up through the soil", "मिट्टी को हटाकर ऊपर आता अंकुर"),
        },
        {
          id: "cat",
          label: t("A cat running fast after a mouse", "चूहे के पीछे तेज़ दौड़ती बिल्ली"),
          feedback: t(
            "The cat doesn't grow while it runs. The seedling only moves because it is growing.",
            "दौड़ते समय बिल्ली बढ़ती नहीं। अंकुर इसलिए हिलता है क्योंकि वह बढ़ रहा है।",
          ),
        },
        {
          id: "cud",
          label: t("A buffalo chewing cud in the field", "खेत में जुगाली करती भैंस"),
          feedback: t(
            "Chewing is not growth. The seedling's movement stops if its growth stops.",
            "चबाना वृद्धि नहीं है। अंकुर की वृद्धि रुके तो उसकी गति भी रुक जाती है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Noticing a change, and replying", "बदलाव पहचानना, और जवाब देना")),
      w.body(
        t(
          "We think of movement as a sign of life. Some movements come from **growth**: a seed sprouts, and over a few days the seedling pushes the soil aside. Others have nothing to do with growth: a cat running, children on a swing, a buffalo chewing cud.",
          "हम गति को जीवन का संकेत मानते हैं। कुछ गतियाँ **वृद्धि** से होती हैं: बीज अंकुरित होता है, और कुछ दिनों में अंकुर मिट्टी हटाकर बाहर आ जाता है। बाकी का वृद्धि से कोई लेना-देना नहीं: दौड़ती बिल्ली, झूले पर बच्चे, जुगाली करती भैंस।",
        ),
      ),
      w.definition(
        t(
          "**Stimulus and response.** A change around a living thing that it can detect is a **stimulus** (plural: stimuli): a mouse appearing, a bright light, a hot object. What the living thing does in reply is its **response**. The cat runs **because** it has seen a mouse.",
          "**उद्दीपन और अनुक्रिया।** किसी जीव के आसपास का वह बदलाव जिसे वह पहचान सके, **उद्दीपन** है: चूहा दिखना, तेज़ रोशनी, कोई गरम चीज़। जवाब में जीव जो करता है, वह उसकी **अनुक्रिया** है। बिल्ली **इसलिए** दौड़ती है क्योंकि उसने चूहा देखा है।",
        ),
      ),
      w.body(
        t(
          "And the reply is never random. Each change gets the right movement: when you want to talk to a friend in class you **whisper**, you don't shout. To do that, a living body has to recognise what has happened and then make only the correct movement.",
          "और जवाब कभी बेतरतीब नहीं होता। हर बदलाव पर सही गति होती है: कक्षा में दोस्त से बात करनी हो तो तुम **फुसफुसाते** हो, चिल्लाते नहीं। इसके लिए शरीर को पहचानना होता है कि क्या हुआ, और फिर केवल सही गति करनी होती है।",
        ),
      ),
      w.definition(
        t(
          "**Control and coordination.** Making sure each change in the surroundings gets the right response, with all the parts of the body working together, is **control and coordination**. In many-celled living things, special tissues do this job. In animals they are **nervous tissue** and **muscle tissue**, which you met in Class IX.",
          "**नियंत्रण और समन्वय।** यह पक्का करना कि परिवेश के हर बदलाव पर सही अनुक्रिया हो, और शरीर के सारे हिस्से साथ मिलकर काम करें, **नियंत्रण और समन्वय** है। बहुकोशिकीय जीवों में ख़ास ऊतक यह काम करते हैं। जंतुओं में ये **तंत्रिका ऊतक** और **पेशी ऊतक** हैं, जो तुमने कक्षा IX में पढ़े थे।",
        ),
      ),
      growth,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Receptors: where information enters. Activity 7.1. */
const receptors = page(
  "receptors",
  (b) => {
    const w = wordsOn(b);
    const nose = choiceQuestion(b, {
      name: "nose",
      prompt: t(
        "Activity 7.1: you block your nose and eat. The food seems to taste of less. Why?",
        "क्रियाकलाप 7.1: तुम नाक दबाकर खाते हो। खाने का स्वाद फीका लगता है। क्यों?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Part of what we call taste is smell, picked up by olfactory receptors in the nose",
            "जिसे हम स्वाद कहते हैं, उसका कुछ हिस्सा गंध है, जिसे नाक के घ्राणग्राही पकड़ते हैं",
          ),
        },
        {
          id: "tongue",
          label: t(
            "Blocking the nose stops the tongue working",
            "नाक दबाने से जीभ काम करना बंद कर देती है",
          ),
          feedback: t(
            "The tongue still works: sugar still tastes sweet. What's missing is the smell, which the nose's receptors add.",
            "जीभ तब भी काम करती है: चीनी अब भी मीठी लगती है। जो कमी है वह गंध की है, जिसे नाक के ग्राही जोड़ते हैं।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Where information gets in", "सूचना कहाँ से अंदर आती है")),
      w.definition(
        t(
          "**Neuron and receptor.** A **neuron** (or nerve cell) is a cell built to carry messages. The **receptors** are the special tips of some neurons that **detect** information from our surroundings. They are usually in our sense organs: the inner ear, the nose, the tongue, the eyes, the skin.",
          "**तंत्रिका कोशिका और ग्राही।** **तंत्रिका कोशिका** (न्यूरॉन) संदेश ले जाने के लिए बनी कोशिका है। **ग्राही** कुछ तंत्रिका कोशिकाओं के ख़ास सिरे हैं, जो हमारे परिवेश से सूचना **पहचानते** हैं। ये प्रायः हमारी ज्ञानेंद्रियों में होते हैं: भीतरी कान, नाक, जीभ, आँखें, त्वचा।",
        ),
      ),
      w.body(
        t(
          "Different receptors pick up different things. **Gustatory receptors** on the tongue detect **taste**. **Olfactory receptors** in the nose detect **smell**.",
          "अलग ग्राही अलग चीज़ें पकड़ते हैं। जीभ के **स्वादग्राही** **स्वाद** पहचानते हैं। नाक के **घ्राणग्राही** **गंध** पहचानते हैं।",
        ),
      ),
      w.body(
        t(
          "**Activity 7.1.** Put a little sugar in your mouth. Now block your nose between your thumb and finger and eat sugar again. Try it at lunch too. Have you noticed food tastes of very little when you have a cold?",
          "**क्रियाकलाप 7.1।** मुँह में थोड़ी चीनी रखो। अब अँगूठे और उँगली से नाक दबाकर फिर चीनी खाओ। दोपहर के खाने में भी आज़माओ। क्या तुमने ध्यान दिया है कि ज़ुकाम में खाने का स्वाद बहुत कम लगता है?",
        ),
      ),
      nose,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The neuron and how a message travels along it. */
const neuron = page(
  "neuron",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "NCERT Fig. 7.1(a): the parts of a neuron and how a message travels: information at the dendrite tip sets off a chemical reaction that makes an electrical impulse; it runs to the cell body, along the axon to its end, where it sets off the release of chemicals.",
    );
    const cell = b.prop(neuronSignalDef, "cell", {
      step: 0,
      target: NeuronTarget.Neuron,
      showNames: true,
      canStep: true,
      canSetTarget: false,
    });
    b.standsFor(
      cell,
      "one neuron (dendrites, cell body with nucleus, a long axon, nerve endings) and the start of the next; tapping next moves a message along it step by step",
    );
    const where = choiceQuestion(b, {
      name: "where",
      prompt: t(
        "Step the message through. Along which part does it travel as an electrical impulse over the longest distance?",
        "संदेश को आगे बढ़ाओ। किस हिस्से पर वह सबसे लंबी दूरी विद्युत आवेग के रूप में चलता है?",
      ),
      options: [
        { id: "right", label: t("The axon", "तंत्रिकाक्ष (एक्सॉन)") },
        {
          id: "dendrite",
          label: t("The dendrite", "द्रुमिका"),
          feedback: t(
            "The dendrite's tip is where the information is picked up. The long fibre the impulse runs along is the axon.",
            "द्रुमिका का सिरा वह जगह है जहाँ सूचना पकड़ी जाती है। आवेग जिस लंबे रेशे पर दौड़ता है, वह तंत्रिकाक्ष है।",
          ),
        },
        {
          id: "body",
          label: t("The cell body", "कोशिका काय"),
          feedback: t(
            "The cell body holds the nucleus; the long fibre is the axon.",
            "कोशिका काय में केंद्रक होता है; लंबा तंतु तंत्रिकाक्ष है।",
          ),
        },
      ],
      answer: "right",
    });
    b.witness(...Array.from({ length: 4 }, () => cell.learner(NeuronAction.Next)));
    return column([
      w.title(t("A message along a neuron", "तंत्रिका कोशिका पर संदेश")),
      w.definition(
        t(
          "**The parts of a neuron.** The branched, thread-like ends that pick up information are the **dendrites**. They lead to the **cell body**, which has the nucleus. From the cell body runs one long fibre, the **axon**, which ends in **nerve endings**.",
          "**तंत्रिका कोशिका के हिस्से।** सूचना पकड़ने वाले शाखाओं वाले, धागे जैसे सिरे **द्रुमिकाएँ** हैं। वे **कोशिका काय** तक जाती हैं, जिसमें केंद्रक होता है। कोशिका काय से एक लंबा रेशा निकलता है, **तंत्रिकाक्ष** (एक्सॉन), जो **तंत्रिका सिरों** में ख़त्म होता है।",
        ),
      ),
      w.body(
        t(
          "Information picked up at the tip of a dendrite sets off a chemical reaction there, and that creates an **electrical impulse**: a tiny electrical signal. The impulse travels from the dendrite to the cell body, then along the axon to its end. Tap **next** and follow it.",
          "द्रुमिका के सिरे पर पकड़ी गई सूचना वहाँ एक रासायनिक अभिक्रिया शुरू करती है, और उससे एक **विद्युत आवेग** बनता है: एक बहुत छोटा विद्युत संकेत। आवेग द्रुमिका से कोशिका काय तक, फिर तंत्रिकाक्ष के साथ उसके अंत तक जाता है। **आगे** दबाओ और उसके साथ चलो।",
        ),
      ),
      cell,
      where,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The synapse; and the last synapse, onto a muscle. */
const synapse = page(
  "synapse",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "NCERT Fig. 7.1: at the end of the axon the impulse releases chemicals; they cross the synapse and start a new impulse in the next neuron's dendrite. A similar synapse passes the message to a muscle cell (the neuromuscular junction).",
    );
    const cell = b.prop(neuronSignalDef, "cell", {
      step: 4,
      target: NeuronTarget.Neuron,
      showNames: true,
      canStep: true,
      canSetTarget: true,
    });
    b.standsFor(
      cell,
      "the end of a neuron, the synapse, and what comes next: another neuron or a muscle cell (the learner can switch); the message can be stepped across the gap",
    );
    const gap = choiceQuestion(b, {
      name: "gap",
      prompt: t(
        "What happens at the synapse between two neurons?",
        "दो तंत्रिका कोशिकाओं के बीच के सिनेप्स पर क्या होता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Chemicals released by the impulse cross the gap and start a new one",
            "आवेग से निकले रसायन अंतराल पार कर नया आवेग शुरू करते हैं",
          ),
        },
        {
          id: "jump",
          label: t(
            "The electrical impulse jumps straight across the gap as a spark",
            "विद्युत आवेग चिंगारी की तरह सीधे अंतराल पार कर जाता है",
          ),
          feedback: t(
            "The impulse can't cross the gap itself. At the end of the axon it releases chemicals, and they carry the message across.",
            "आवेग ख़ुद अंतराल पार नहीं कर सकता। तंत्रिकाक्ष के अंत में वह रसायन छोड़ता है, और वे संदेश को पार ले जाते हैं।",
          ),
        },
        {
          id: "stop",
          label: t(
            "The message stops there and goes back to the dendrite",
            "संदेश वहीं रुककर द्रुमिका की ओर लौट जाता है",
          ),
          feedback: t(
            "Then nothing would ever reach a muscle. The chemicals cross the gap and the message goes on.",
            "तब कुछ भी कभी पेशी तक नहीं पहुँचता। रसायन अंतराल पार करते हैं और संदेश आगे बढ़ता है।",
          ),
        },
      ],
      answer: "right",
    });
    b.witness(
      cell.learner(NeuronAction.SetTarget, { target: NeuronTarget.Muscle }),
      ...Array.from({ length: 6 }, () => cell.learner(NeuronAction.Next)),
    );
    return column([
      w.title(t("Crossing the gap", "अंतराल पार करना")),
      w.definition(
        t(
          "**Synapse.** Two neurons don't quite touch. The tiny gap between the nerve ending of one and a dendrite of the next is a **synapse**. At the end of the axon, the electrical impulse sets off the release of some **chemicals**. These cross the gap and start a similar electrical impulse in a dendrite of the next neuron.",
          "**सिनेप्स (अंतर्ग्रथन)।** दो तंत्रिका कोशिकाएँ ठीक से छूती नहीं। एक के तंत्रिका सिरे और अगली की द्रुमिका के बीच के छोटे से अंतराल को **सिनेप्स** कहते हैं। तंत्रिकाक्ष के अंत में विद्युत आवेग कुछ **रसायन** छोड़ता है। ये अंतराल पार करते हैं और अगली तंत्रिका कोशिका की द्रुमिका में वैसा ही विद्युत आवेग शुरू करते हैं।",
        ),
      ),
      w.body(
        t(
          "So a message is **electrical** along a neuron and **chemical** across a gap. A similar synapse at the very end passes the message from a neuron to a **muscle cell** or a **gland**. Where a neuron meets a muscle is called the **neuromuscular junction**. Switch the picture to a muscle and step the message across.",
          "यानी संदेश तंत्रिका कोशिका पर **विद्युत** होता है और अंतराल के पार **रासायनिक**। बिल्कुल अंत में ऐसा ही सिनेप्स संदेश को तंत्रिका कोशिका से **पेशी कोशिका** या **ग्रंथि** तक पहुँचाता है। जहाँ तंत्रिका कोशिका पेशी से मिलती है, उसे **तंत्रिका-पेशी संधि** कहते हैं। चित्र को पेशी पर बदलो और संदेश को पार ले जाओ।",
        ),
      ),
      cell,
      gap,
      w.body(
        t(
          "Nervous tissue is an organised network of neurons, built to carry information as electrical impulses from one part of the body to another.",
          "तंत्रिका ऊतक तंत्रिका कोशिकाओं का एक व्यवस्थित जाल है, जो शरीर के एक हिस्से से दूसरे तक सूचना को विद्युत आवेगों के रूप में ले जाने के लिए बना है।",
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

/** The ruler game, explained so far. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const ruler = b.prop(controlSceneDef, "ruler", { scene: ControlScene.RulerDrop });
    b.standsFor(ruler, "Riya holds a ruler up; Kabir waits with his fingers open below it");
    const order = choiceQuestion(b, {
      name: "order",
      prompt: t(
        "Riya lets go of the ruler. Which is the right order for the message to reach Kabir's hand?",
        "रिया रूलर छोड़ देती है। कबीर के हाथ तक संदेश पहुँचने का सही क्रम कौन सा है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Receptors in the eye → impulses along neurons, chemicals across each synapse → muscles of the hand",
            "आँख के ग्राही → तंत्रिका कोशिकाओं पर आवेग, हर सिनेप्स पर रसायन → हाथ की पेशियाँ",
          ),
        },
        {
          id: "hand",
          label: t(
            "The hand's muscles feel the ruler and move by themselves",
            "हाथ की पेशियाँ रूलर को महसूस करके अपने आप हिलती हैं",
          ),
          feedback: t(
            "Muscles don't detect anything: receptors do. The falling ruler is first seen by the receptors in the eye.",
            "पेशियाँ कुछ नहीं पहचानतीं: ग्राही पहचानते हैं। गिरता रूलर पहले आँख के ग्राही देखते हैं।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const stop = w.definition(
      t(
        '**Stop 1 done.** Riya builds the first exhibit: a neuron out of pipe cleaners, with a bead that slides along the axon and jumps to a second neuron as a puff of glitter, "the chemicals". Kabir is still unhappy: "Fine, but sometimes my hand moves before I have even decided anything. How?" Next stop: reflexes.',
        '**पड़ाव 1 पूरा।** रिया पहला प्रदर्श बनाती है: पाइप-क्लीनर से एक तंत्रिका कोशिका, जिसमें एक मोती तंत्रिकाक्ष पर सरकता है और चमकी के झोंके के रूप में, "रसायन" बनकर, दूसरी तंत्रिका कोशिका तक जाता है। कबीर अब भी ख़ुश नहीं: "ठीक है, पर कभी-कभी मेरा हाथ मेरे कुछ तय करने से पहले ही हिल जाता है। कैसे?" अगला पड़ाव: प्रतिवर्त।',
      ),
      "stop",
      { isHidden: true },
    );
    b.when(order.on(QuestionSignal.Correct), [theBoard.show(stop), theBoard.pass()]);
    return column([
      w.title(t("Back to the ruler", "फिर रूलर पर")),
      ruler,
      w.body(
        t(
          "Kabir waits, fingers open. Riya lets go. Somewhere between the ruler falling and his fingers closing, a message has to travel through his body.",
          "कबीर उँगलियाँ खोले इंतज़ार करता है। रिया रूलर छोड़ती है। रूलर गिरने और उसकी उँगलियाँ बंद होने के बीच, एक संदेश को उसके शरीर में यात्रा करनी होती है।",
        ),
      ),
      order,
      stop,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** NCERT in-text questions and exercises; then the log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const gapName = choiceQuestion(b, {
      name: "gapName",
      prompt: t(
        "The gap between two neurons is called a…",
        "दो तंत्रिका कोशिकाओं के बीच के अंतराल को कहते हैं…",
      ),
      options: [
        { id: "right", label: t("synapse", "सिनेप्स") },
        {
          id: "dendrite",
          label: t("dendrite", "द्रुमिका"),
          feedback: t(
            "A dendrite is a branch of a neuron, not a gap.",
            "द्रुमिका तंत्रिका कोशिका की शाखा है, अंतराल नहीं।",
          ),
        },
        {
          id: "axon",
          label: t("axon", "तंत्रिकाक्ष"),
          feedback: t(
            "The axon is the neuron's long fibre.",
            "तंत्रिकाक्ष तंत्रिका कोशिका का लंबा रेशा है।",
          ),
        },
        {
          id: "impulse",
          label: t("impulse", "आवेग"),
          feedback: t("An impulse is the electrical message itself.", "आवेग ख़ुद विद्युत संदेश है।"),
        },
      ],
      answer: "right",
      passes: false,
    });
    const agarbatti = choiceQuestion(b, {
      name: "agarbatti",
      prompt: t(
        "How do we detect the smell of an agarbatti (incense stick)?",
        "हम अगरबत्ती की गंध कैसे पहचानते हैं?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Olfactory receptors in the nose detect it and send impulses on towards the brain",
            "नाक के घ्राणग्राही उसे पहचानते हैं और आवेग आगे मस्तिष्क की ओर भेजते हैं",
          ),
        },
        {
          id: "gustatory",
          label: t("Gustatory receptors on the tongue detect it", "जीभ के स्वादग्राही उसे पहचानते हैं"),
          feedback: t(
            "Gustatory receptors detect taste. Smell is detected by olfactory receptors in the nose.",
            "स्वादग्राही स्वाद पहचानते हैं। गंध नाक के घ्राणग्राही पहचानते हैं।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const broken = choiceQuestion(b, {
      name: "broken",
      prompt: t(
        "Suppose the receptors in someone's skin stopped working. What problem is likely?",
        "मान लो किसी की त्वचा के ग्राही काम करना बंद कर दें। क्या समस्या होने की संभावना है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "They might not notice touching something hot, and get burnt",
            "शायद उन्हें गरम चीज़ छूने का पता न चले, और वे जल जाएँ",
          ),
        },
        {
          id: "nothing",
          label: t("Nothing: the muscles would still move", "कुछ नहीं: पेशियाँ तब भी हिलेंगी"),
          feedback: t(
            "The muscles can still move, but no message would tell them to: the change would never be detected.",
            "पेशियाँ हिल तो सकती हैं, पर कोई संदेश उन्हें कहेगा ही नहीं: बदलाव पहचाना ही नहीं जाएगा।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ A **stimulus** is a change we can detect; the **response** is what we do. ✓ **Receptors** in the sense organs detect information. ✓ Along a neuron (dendrite → cell body → axon → nerve ending) the message is an **electrical impulse**; across a **synapse** it is **chemical**; a last synapse passes it to a muscle or gland. Next: why some replies need no thinking at all.",
        "**मिशन लॉग।** ✓ **उद्दीपन** वह बदलाव है जिसे हम पहचान सकते हैं; **अनुक्रिया** वह है जो हम करते हैं। ✓ ज्ञानेंद्रियों के **ग्राही** सूचना पहचानते हैं। ✓ तंत्रिका कोशिका पर (द्रुमिका → कोशिका काय → तंत्रिकाक्ष → तंत्रिका सिरा) संदेश **विद्युत आवेग** है; **सिनेप्स** के पार वह **रासायनिक** है; आख़िरी सिनेप्स उसे पेशी या ग्रंथि तक पहुँचाता है। आगे: कुछ जवाबों में सोचने की ज़रूरत ही क्यों नहीं होती।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(broken.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([
      w.title(t("Your turn", "अब तुम्हारी बारी")),
      gapName,
      agarbatti,
      broken,
      log,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [hook, why, change, receptors, neuron, synapse, inLife, yourTurn];

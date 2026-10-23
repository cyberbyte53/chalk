import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, goalQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import { Colour, DataSceneKind, Experiment, RunAction, chanceRunDef } from "@chalk/prop-data";
import { sceneOn } from "../kit";

const r = String.raw;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** Where the story stands after Ch14, and Kabir's first game. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const toss = sceneOn(
    b,
    "toss",
    DataSceneKind.CoinToss,
    "the verandah: Grandpa flicks a coin into the air while Kabir calls 'Heads!'; a tally of H and T marks is chalked on the wall",
  );
  return column([
    w.title(t("Call the toss, win a toffee", "टॉस बताओ, टॉफ़ी जीतो")),
    toss,
    w.body(
      t(
        "Fun Fair Week, part two. Riya's poster, \"10B in Numbers\", is up on the notice board: the class's marks, heights and cricket scores, all summed up with means, medians and modes. Now it's Kabir's turn. His games stall opens on Saturday, and every game promises a prize.",
        'फ़न फ़ेयर हफ़्ता, दूसरा भाग। रिया का पोस्टर, "10B आँकड़ों में", नोटिस बोर्ड पर लग चुका है: कक्षा के अंक, लंबाइयाँ और क्रिकेट के स्कोर, सब माध्य, माध्यक और बहुलक में समेटे हुए। अब कबीर की बारी है। उसका खेलों का स्टॉल शनिवार को खुलता है, और हर खेल में इनाम का वादा है।',
      ),
    ),
    w.body(
      t(
        'His first game is the simplest: Grandpa tosses a coin, you call it, and if you\'re right you win a toffee. Kabir tries it himself ten times on the verandah, calling heads every time. He wins only 4 times. "The coin is cheating!" he says. Is it?',
        'उसका पहला खेल सबसे आसान है: दादाजी सिक्का उछालते हैं, तुम बताते हो, और सही हुए तो टॉफ़ी जीतते हो। कबीर बरामदे में ख़ुद दस बार आज़माता है, हर बार चित बोलता है। वह केवल 4 बार जीतता है। "सिक्का बेईमानी कर रहा है!" वह कहता है। क्या सच में?',
      ),
    ),
    space(),
  ]);
});

/** Why this chapter: every game needs a number for "how likely". The stops. */
const why = page("why", (b) => {
  const w = wordsOn(b);
  const stall = sceneOn(
    b,
    "stall",
    DataSceneKind.GameStall,
    "Kabir's fun fair stall: a striped awning, a spinner on a board and a glass jar of red, blue and white marbles; a sign says 'Win a prize!'; Riya in front with her notebook",
  );
  return column([
    w.title(t("What this chapter is for", "यह अध्याय किसलिए है")),
    stall,
    w.body(
      t(
        'Riya\'s job before Saturday: for every game on the stall, work out the **chance of winning**, and decide whether the game is fair. Too easy and Kabir runs out of prizes by noon; too hard and nobody plays twice. To do that she needs a way to put a number on "how likely". That number is called **probability**, and this chapter is about finding it.',
        'शनिवार से पहले रिया का काम: स्टॉल के हर खेल के लिए **जीतने की संभावना** निकालना, और तय करना कि खेल उचित है या नहीं। बहुत आसान हुआ तो कबीर के इनाम दोपहर तक ख़त्म, बहुत कठिन हुआ तो कोई दोबारा नहीं खेलेगा। इसके लिए उसे "कितना संभव" पर एक संख्या रखने का तरीक़ा चाहिए। उस संख्या को **प्रायिकता** कहते हैं, और यह अध्याय उसे निकालने के बारे में है।',
      ),
    ),
    w.definition(
      t(
        "**The stops on the way.** (1) Try it many times, then count the outcomes: *this lesson*. (2) The complement, and events that are impossible or sure. (3) Cards, bags and choosing. (4) Two coins and two dice. (5) Beyond counting: chances from lengths and areas. Then Saturday: the fair.",
        "**रास्ते के पड़ाव।** (1) कई बार करके देखना, फिर परिणाम गिनना: *यह पाठ*। (2) पूरक घटना, और असंभव या निश्चित घटनाएँ। (3) ताश, थैले और चुनाव। (4) दो सिक्के और दो पासे। (5) गिनती से आगे: लंबाई और क्षेत्रफल से संभावना। फिर शनिवार: मेला।",
      ),
    ),
    w.body(
      t(
        'First stop: what does "the chance of a head" actually mean, and how can we find it?',
        'पहला पड़ाव: "चित आने की संभावना" का असल में क्या मतलब है, और हम इसे कैसे निकालें?',
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Class IX recap: experiment, trial, outcome, event; experimental probability. */
const recap = page(
  "recap",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "A coin is tossed 1000 times and lands heads 455 times. What is the experimental probability of a head?",
        "एक सिक्का 1000 बार उछाला गया और 455 बार चित आया। चित की प्रायोगिक प्रायिकता क्या है?",
      ),
      options: [
        { id: "right", label: t("0.455", "0.455") },
        {
          id: "tails",
          label: t("0.545", "0.545"),
          feedback: t(
            "0.545 is 545 ÷ 1000, the tails. The event here is a head: 455 ÷ 1000.",
            "0.545 तो 545 ÷ 1000 है, यानी पट। यहाँ घटना चित है: 455 ÷ 1000।",
          ),
        },
        {
          id: "half",
          label: t("0.5", "0.5"),
          feedback: t(
            "0.5 is what we expect, not what happened. Experimental probability uses the actual count: 455 ÷ 1000.",
            "0.5 वह है जिसकी हम उम्मीद करते हैं, जो हुआ वह नहीं। प्रायोगिक प्रायिकता असली गिनती लेती है: 455 ÷ 1000।",
          ),
        },
        {
          id: "count",
          label: t("455", "455"),
          feedback: t(
            "455 is how many times it happened. Probability divides that by the number of trials: 455 ÷ 1000.",
            "455 तो यह है कि कितनी बार हुआ। प्रायिकता इसे परीक्षणों की संख्या से भाग देती है: 455 ÷ 1000।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("A recap from Class IX", "कक्षा IX से दोहराव")),
      w.definition(
        t(
          "**Experiment, trial, outcome, event.** An **experiment** is something whose result we can't be sure of in advance, like tossing a coin. Doing it once is a **trial**. Each possible result (head, tail) is an **outcome**. An **event** is the result we're interested in, such as \"getting a head\".",
          '**प्रयोग, परीक्षण, परिणाम, घटना।** **प्रयोग** ऐसा काम है जिसका नतीजा हम पहले से पक्का नहीं जान सकते, जैसे सिक्का उछालना। इसे एक बार करना एक **परीक्षण** है। हर संभव नतीजा (चित, पट) एक **परिणाम** है। **घटना** वह नतीजा है जिसमें हमारी रुचि है, जैसे "चित आना"।',
        ),
      ),
      w.definition(
        t(
          "**Experimental probability.** Do the experiment many times and count. The experimental (or empirical) probability of an event E is",
          "**प्रायोगिक प्रायिकता।** प्रयोग कई बार करो और गिनो। किसी घटना E की प्रायोगिक (या आनुभविक) प्रायिकता है",
        ),
      ),
      w.body(
        t(
          r`$$P(E) = \dfrac{\text{number of trials in which E happened}}{\text{total number of trials}}$$`,
          r`$$P(E) = \dfrac{\text{जितने परीक्षणों में E हुई}}{\text{कुल परीक्षण}}$$`,
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** It changes with the trials; Buffon, Kerrich, Pearson; it settles near 1/2. */
const settle = page(
  "settle",
  (b) => {
    const w = wordsOn(b);
    const run = b.prop(chanceRunDef, "run", {
      kind: Experiment.Coin,
      favourable: ["H"],
      eventLabel: { en: "a head", hi: "चित" },
      showTheory: false,
      seed: 21,
    });
    b.studentOnly(run.action(RunAction.Run));
    b.studentOnly(run.action(RunAction.Reset));
    b.standsFor(
      run,
      "a coin tossed in batches of 1, 10, 100 or 1000; the counts of heads and the running fraction of heads are graphed against the number of tosses",
    );
    const goal = goalQuestion(b, {
      about: run,
      prompt: t(
        "Toss the coin until you have at least 1000 tosses. Watch the fraction of heads as you go.",
        "सिक्का तब तक उछालो जब तक कम से कम 1000 उछाल न हो जाएँ। चलते-चलते चित के भिन्न पर नज़र रखो।",
      ),
      isMet: run.field("trials").ge(1000),
      solve: [run.learner(RunAction.Run, { times: 1000 })],
    });
    const seen = w.body(
      t(
        "With a few tosses the fraction jumps about; with many, it hardly moves and stays close to 0.5. People who tossed real coins found the same. Comte de Buffon got 2048 heads in 4040 tosses (0.507), J. E. Kerrich 5067 in 10000 (0.5067), and Karl Pearson 12012 in 24000 (0.5005).",
        "कुछ उछालों में भिन्न इधर-उधर उछलता है; बहुत सारे उछालों में वह मुश्किल से हिलता है और 0.5 के पास रहता है। असली सिक्के उछालने वालों ने भी यही पाया। कॉम्टे डी बफ़न को 4040 उछालों में 2048 चित मिले (0.507), जे. ई. केरिख़ को 10000 में 5067 (0.5067), और कार्ल पियर्सन को 24000 में 12012 (0.5005)।",
      ),
      "seen",
      { isHidden: true },
    );
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(seen));
    return column([
      w.title(t("More tosses, a steadier answer", "ज़्यादा उछाल, टिकाऊ उत्तर")),
      w.body(
        t(
          "An experimental probability is only an estimate: toss the coin another 1000 times and you'll get a slightly different number. Try it.",
          "प्रायोगिक प्रायिकता केवल एक अनुमान है: सिक्के को फिर 1000 बार उछालो और थोड़ी अलग संख्या मिलेगी। करके देखो।",
        ),
      ),
      run,
      goal,
      seen,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Equally likely outcomes; the theoretical probability; Laplace; Example 1. */
const theory = page(
  "theory",
  (b) => {
    const w = wordsOn(b);
    const bag = choiceQuestion(b, {
      name: "bag",
      prompt: t(
        'A bag has 4 red balls and 1 blue ball. You draw one without looking. Are "red" and "blue" equally likely?',
        'एक थैले में 4 लाल गेंदें और 1 नीली गेंद है। तुम बिना देखे एक निकालते हो। क्या "लाल" और "नीली" समप्रायिक हैं?',
      ),
      options: [
        {
          id: "right",
          label: t("No: there are more red balls to grab", "नहीं: पकड़ने को लाल गेंदें ज़्यादा हैं"),
        },
        {
          id: "two",
          label: t("Yes: there are just two colours", "हाँ: रंग तो बस दो ही हैं"),
          feedback: t(
            "Two colours, but not two equally likely results: 4 of the 5 balls you could grab are red.",
            "दो रंग हैं, पर दो समप्रायिक नतीजे नहीं: जो 5 गेंदें तुम पकड़ सकते हो उनमें 4 लाल हैं।",
          ),
        },
        {
          id: "blind",
          label: t("Yes: you draw it without looking", "हाँ: तुम बिना देखे निकालते हो"),
          feedback: t(
            "Not looking makes each **ball** equally likely. But 4 balls are red and only 1 is blue, so the colours are not.",
            "बिना देखे निकालने से हर **गेंद** समप्रायिक होती है। पर 4 गेंदें लाल हैं और केवल 1 नीली, इसलिए रंग समप्रायिक नहीं हैं।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const head = choiceQuestion(b, {
      name: "head",
      prompt: t(
        "Example 1. A coin is tossed once. What is the probability of getting a head?",
        "उदाहरण 1. एक सिक्का एक बार उछाला जाता है। चित आने की प्रायिकता क्या है?",
      ),
      options: [
        { id: "right", label: t(r`$\dfrac{1}{2}$`, r`$\dfrac{1}{2}$`) },
        {
          id: "one",
          label: t("1", "1"),
          feedback: t(
            "1 would mean a head is certain. One outcome (H) is favourable out of 2 possible: 1/2.",
            "1 का मतलब होगा कि चित पक्का है। 2 संभव परिणामों में से 1 (H) अनुकूल है: 1/2।",
          ),
        },
        {
          id: "count",
          label: t(r`$\dfrac{2}{1}$`, r`$\dfrac{2}{1}$`),
          feedback: t(
            "That's upside down: favourable outcomes go on top, all outcomes below. 1/2.",
            "यह उल्टा है: अनुकूल परिणाम ऊपर जाते हैं, सारे परिणाम नीचे। 1/2।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
    });
    b.when(bag.on(QuestionSignal.Correct), theBoard.show(head));
    return column([
      w.title(t("Probability without tossing", "बिना उछाले प्रायिकता")),
      w.body(
        t(
          "Tossing 1000 times is fine for a coin, but not for everything: you can't launch a satellite 1000 times to see how often it fails. If we're willing to make an assumption, we can work the probability out instead.",
          "सिक्के के लिए 1000 बार उछालना ठीक है, पर हर चीज़ के लिए नहीं: यह देखने के लिए कि उपग्रह कितनी बार विफल होता है, उसे 1000 बार नहीं छोड़ा जा सकता। अगर हम एक मान्यता लेने को तैयार हों, तो प्रायिकता गणना से निकाल सकते हैं।",
        ),
      ),
      w.definition(
        t(
          "**Equally likely.** Outcomes are **equally likely** if none has any reason to happen more often than another. A fair coin's head and tail are equally likely; so are a fair die's six faces. From now on, all the experiments in this chapter have equally likely outcomes.",
          "**समप्रायिक।** परिणाम **समप्रायिक** होते हैं जब किसी के दूसरे से ज़्यादा बार होने का कोई कारण न हो। एक न्यायसंगत सिक्के का चित और पट समप्रायिक हैं; एक न्यायसंगत पासे के छह फलक भी। अब से, इस अध्याय के सारे प्रयोगों के परिणाम समप्रायिक हैं।",
        ),
      ),
      bag,
      w.definition(
        t(
          '**Theoretical probability.** When the outcomes are equally likely, the theoretical (or classical) probability of an event E is the number of outcomes **favourable** to E (the ones in which E happens) divided by the number of all possible outcomes. Laplace gave this definition in 1795. From now on, "probability" means this one.',
          '**सैद्धांतिक प्रायिकता।** जब परिणाम समप्रायिक हों, तो घटना E की सैद्धांतिक (या क्लासिकी) प्रायिकता, E के **अनुकूल** परिणामों (जिनमें E होती है) की संख्या को सारे संभव परिणामों की संख्या से भाग देने पर मिलती है। यह परिभाषा लाप्लास ने 1795 में दी। अब से "प्रायिकता" का मतलब यही है।',
        ),
      ),
      w.body(
        t(
          r`$$P(E) = \dfrac{\text{number of outcomes favourable to E}}{\text{number of all possible outcomes}}$$`,
          r`$$P(E) = \dfrac{\text{E के अनुकूल परिणामों की संख्या}}{\text{सभी संभव परिणामों की संख्या}}$$`,
        ),
      ),
      head,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Example 2 (Kritika's bag), elementary events, and their probabilities add to 1. */
const elementary = page(
  "elementary",
  (b) => {
    const w = wordsOn(b);
    const run = b.prop(chanceRunDef, "run", {
      kind: Experiment.Bag,
      marbles: [
        { colour: Colour.Red, count: 1 },
        { colour: Colour.Blue, count: 1 },
        { colour: Colour.Yellow, count: 1 },
      ],
      favourable: ["yellow"],
      eventLabel: { en: "the yellow ball", hi: "पीली गेंद" },
      seed: 5,
    });
    b.studentOnly(run.action(RunAction.Run));
    b.standsFor(
      run,
      "Kritika's bag of one red, one blue and one yellow ball, drawn from again and again; the fraction of yellow draws beside the theoretical 1/3",
    );
    const sum = choiceQuestion(b, {
      name: "sum",
      prompt: t(
        r`In Example 2, what is $P(\text{yellow}) + P(\text{red}) + P(\text{blue})$?`,
        r`उदाहरण 2 में $P(\text{पीली}) + P(\text{लाल}) + P(\text{नीली})$ क्या है?`,
      ),
      options: [
        { id: "right", label: t("1", "1") },
        {
          id: "third",
          label: t(r`$\dfrac{1}{3}$`, r`$\dfrac{1}{3}$`),
          feedback: t(
            "That is each one alone. Added, they make 1/3 + 1/3 + 1/3 = 1.",
            "यह तो हर एक अकेले की है। जोड़ने पर 1/3 + 1/3 + 1/3 = 1।",
          ),
        },
        {
          id: "three",
          label: t("3", "3"),
          feedback: t(
            "3 is the number of outcomes. Each probability is 1/3, so the three add to 1.",
            "3 तो परिणामों की संख्या है। हर प्रायिकता 1/3 है, तो तीनों का योग 1 है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("One outcome at a time", "एक बार में एक परिणाम")),
      w.body(
        t(
          "**Example 2.** Kritika's bag has a red ball, a blue ball and a yellow ball, all the same size. She takes one out without looking. There are 3 equally likely outcomes, and just one of them is yellow, so",
          "**उदाहरण 2।** कृतिका के थैले में एक लाल, एक नीली और एक पीली गेंद है, सब एक ही आकार की। वह बिना देखे एक निकालती है। 3 समप्रायिक परिणाम हैं, और उनमें से केवल एक पीला है, इसलिए",
        ),
      ),
      w.body(t(r`$$P(\text{yellow}) = \dfrac{1}{3}$$`, r`$$P(\text{पीली}) = \dfrac{1}{3}$$`)),
      w.body(
        t(
          "In the same way the red and the blue each have probability 1/3. Draw from the bag many times and watch the yellow fraction settle near 1/3.",
          "इसी तरह लाल और नीली की प्रायिकता भी 1/3 है। थैले से कई बार निकालो और पीली का भिन्न 1/3 के पास टिकता देखो।",
        ),
      ),
      run,
      w.definition(
        t(
          '**Elementary event.** An event with exactly one outcome is an **elementary event**: "a head", or "the yellow ball". The probabilities of all the elementary events of an experiment always add up to 1.',
          '**प्रारंभिक घटना।** ठीक एक परिणाम वाली घटना **प्रारंभिक घटना** है: "चित", या "पीली गेंद"। किसी प्रयोग की सारी प्रारंभिक घटनाओं की प्रायिकताओं का योग हमेशा 1 होता है।',
        ),
      ),
      sum,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** Back to the toss: four heads in ten is not cheating. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const run = b.prop(chanceRunDef, "run", {
      kind: Experiment.Coin,
      favourable: ["H"],
      eventLabel: { en: "a head", hi: "चित" },
      seed: 3,
      batches: [10, 100, 1000],
    });
    b.studentOnly(run.action(RunAction.Run));
    b.studentOnly(run.action(RunAction.Reset));
    b.standsFor(
      run,
      "Grandpa's coin tossed in batches of 10, 100 or 1000, with the fraction of heads graphed beside the theoretical 1/2",
    );
    const fair = choiceQuestion(b, {
      name: "fair",
      prompt: t(
        "So, is Grandpa's coin cheating Kabir?",
        "तो, क्या दादाजी का सिक्का कबीर के साथ बेईमानी कर रहा है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "No: 10 tosses are too few to judge a coin",
            "नहीं: सिक्का परखने के लिए 10 उछाल बहुत कम हैं",
          ),
        },
        {
          id: "yes",
          label: t(
            "Yes: a fair coin gives exactly 5 heads in 10",
            "हाँ: न्यायसंगत सिक्का 10 में ठीक 5 चित देता है",
          ),
          feedback: t(
            "A fair coin gives a head with probability 1/2, not exactly half the time in every 10. Toss 10 and 4, 5 or 6 heads are all ordinary.",
            "न्यायसंगत सिक्के पर चित की प्रायिकता 1/2 है, पर हर 10 में ठीक आधा नहीं। 10 उछालों में 4, 5 या 6 चित, सब आम बात है।",
          ),
        },
        {
          id: "luck",
          label: t("Yes: calling heads every time is unlucky", "हाँ: हर बार चित बोलना अशुभ होता है"),
          feedback: t(
            "The coin doesn't know what Kabir called: each toss is still 1/2 heads, whatever he says.",
            "सिक्के को पता नहीं कि कबीर ने क्या बोला: हर उछाल में चित अब भी 1/2 है, वह कुछ भी कहे।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Back on the verandah", "वापस बरामदे पर")),
      w.body(
        t(
          "Riya runs Grandpa's coin 10 times, then 100, then 1000. In the first 10 the fraction of heads can be anything from 0.3 to 0.7. By 1000 it sits close to 1/2, the theoretical probability.",
          "रिया दादाजी के सिक्के को 10 बार, फिर 100, फिर 1000 बार चलाती है। पहले 10 में चित का भिन्न 0.3 से 0.7 तक कुछ भी हो सकता है। 1000 तक वह 1/2 के पास बैठ जाता है, जो सैद्धांतिक प्रायिकता है।",
        ),
      ),
      run,
      fair,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Ex 15.1 Q1 (complete the statements, first parts) and Q2 (equally likely?). */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const car = choiceQuestion(b, {
      name: "car",
      prompt: t(
        "Exercise 15.1 Q2. Which of these experiments has equally likely outcomes?",
        "प्रश्नावली 15.1 प्रश्न 2. इनमें से किस प्रयोग के परिणाम समप्रायिक हैं?",
      ),
      options: [
        {
          id: "right",
          label: t("A baby is born: a boy or a girl", "एक बच्चा पैदा होता है: लड़का या लड़की"),
        },
        {
          id: "car",
          label: t(
            "A driver tries to start a car: starts or not",
            "चालक कार चालू करता है: चालू हो या न हो",
          ),
          feedback: t(
            'A working car usually starts: "starts" is far more likely than "doesn\'t start".',
            'ठीक-ठाक कार आमतौर पर चालू हो जाती है: "चालू होना" "न होने" से कहीं ज़्यादा संभव है।',
          ),
        },
        {
          id: "shot",
          label: t(
            "A player shoots a basketball: in or a miss",
            "खिलाड़ी बास्केटबॉल फेंकता है: अंदर या चूक",
          ),
          feedback: t(
            "It depends on the player's skill: a good player scores more often than they miss.",
            "यह खिलाड़ी के कौशल पर निर्भर है: अच्छा खिलाड़ी चूकने से ज़्यादा बार अंक बनाता है।",
          ),
        },
        {
          id: "rain",
          label: t("Tomorrow's weather: rain or no rain", "कल का मौसम: बारिश हो या न हो"),
          feedback: t(
            "Rain depends on the season and the sky; the two aren't equally likely.",
            "बारिश मौसम और आसमान पर निर्भर है; दोनों समप्रायिक नहीं हैं।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const sum = choiceQuestion(b, {
      name: "sum",
      prompt: t(
        "Exercise 15.1 Q1 (iv). The sum of the probabilities of all the elementary events of an experiment is …",
        "प्रश्नावली 15.1 प्रश्न 1 (iv). किसी प्रयोग की सारी प्रारंभिक घटनाओं की प्रायिकताओं का योग … है",
      ),
      options: [
        { id: "right", label: t("1", "1") },
        {
          id: "zero",
          label: t("0", "0"),
          feedback: t(
            "Each probability is at least 0, and one of the elementary events always happens, so together they make 1.",
            "हर प्रायिकता कम से कम 0 है, और कोई न कोई प्रारंभिक घटना होती ही है, तो सब मिलकर 1 बनाती हैं।",
          ),
        },
        {
          id: "n",
          label: t("the number of outcomes", "परिणामों की संख्या"),
          feedback: t(
            "That counts outcomes; it doesn't add probabilities. Each is 1/n, and n of them add to 1.",
            "यह परिणाम गिनता है, प्रायिकताएँ नहीं जोड़ता। हर एक 1/n है, और ऐसी n का योग 1 है।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const log = w.definition(
      t(
        '**Mission log.** ✓ The toss game is fair: P(head) = 1/2, and four heads in ten was just a short run. ✓ Probability = favourable outcomes ÷ all outcomes, when they\'re equally likely. ✗ The die game claims "more than 4 wins" is a fair bet. Next stop: what are the chances of **not** winning?',
        '**मिशन लॉग।** ✓ टॉस का खेल उचित है: P(चित) = 1/2, और दस में चार चित बस एक छोटी लहर थी। ✓ प्रायिकता = अनुकूल परिणाम ÷ सारे परिणाम, जब वे समप्रायिक हों। ✗ पासे का खेल दावा करता है कि "4 से ज़्यादा पर जीत" उचित दाँव है। अगला पड़ाव: **न** जीतने की संभावना क्या है?',
      ),
      "log",
      { isHidden: true },
    );
    const guess = w.note(
      t(
        "NCERT also counts a true-false question as equally likely, assuming the answer is a pure guess.",
        "NCERT सही-ग़लत प्रश्न को भी समप्रायिक मानती है, यह मानकर कि उत्तर बस अंदाज़ा है।",
      ),
      "guess",
      { isHidden: true },
    );
    b.when(car.on(QuestionSignal.Correct), [theBoard.show(guess), theBoard.show(sum)]);
    b.when(sum.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), car, guess, sum, log, space()]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [hook, why, recap, settle, theory, elementary, inLife, yourTurn];

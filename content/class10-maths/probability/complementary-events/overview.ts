import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, goalQuestion, wordsOn } from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  DataSceneKind,
  Experiment,
  RunAction,
  ScaleAction,
  SpaceAction,
  SpaceDerived,
  chanceRunDef,
  chanceScaleDef,
  outcomeSpaceDef,
} from "@chalk/prop-data";
import { sceneOn } from "../kit";

const r = String.raw;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** The die game and Kabir's "half the faces are big" claim. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const stall = sceneOn(
    b,
    "stall",
    DataSceneKind.GameStall,
    "Kabir's stall with its 'Win a prize!' sign; Riya in front with her notebook, checking the next game",
  );
  return column([
    w.title(t("Roll more than 4", "4 से ज़्यादा फेंको")),
    stall,
    w.body(
      t(
        "The toss game passed Riya's check. Kabir's second game uses a die: throw it once, and if it shows **more than 4** you win a pencil box. \"It's fair,\" says Kabir. \"Big numbers and small numbers, half each.\" Riya isn't sure. How often will a player actually win, and how often will they lose?",
        'टॉस का खेल रिया की जाँच में पास हो गया। कबीर का दूसरा खेल पासे का है: एक बार फेंको, और अगर **4 से ज़्यादा** आए तो पेंसिल बॉक्स जीतो। "यह उचित है," कबीर कहता है। "बड़ी संख्याएँ और छोटी संख्याएँ, आधी-आधी।" रिया को यक़ीन नहीं। खिलाड़ी असल में कितनी बार जीतेगा, और कितनी बार हारेगा?',
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Example 3: P(more than 4) and P(at most 4) by counting outcomes. */
const count = page(
  "count",
  (b) => {
    const w = wordsOn(b);
    const die = b.prop(outcomeSpaceDef, "die", {
      kind: Experiment.Die,
      favourable: ["5", "6"],
      eventLabel: { en: "more than 4", hi: "4 से ज़्यादा" },
      isEventShown: false,
      canPick: true,
    });
    b.studentOnly(die.action(SpaceAction.Toggle));
    b.studentOnly(die.action(SpaceAction.Clear));
    b.standsFor(
      die,
      "the six faces of a die, 1 to 6; the learner taps the faces that are more than 4, and the count and probability show",
    );
    const goal = goalQuestion(b, {
      about: die,
      prompt: t("Tap every face that is **more than 4**.", "हर वह फलक टैप करो जो **4 से ज़्यादा** है।"),
      isMet: die.derived(SpaceDerived.IsMatched).eq(true),
      solve: [
        die.learner(SpaceAction.Toggle, { id: "5" }),
        die.learner(SpaceAction.Toggle, { id: "6" }),
      ],
    });
    const worked = w.body(
      t(
        r`Two faces, 5 and 6, out of six. So $P(\text{more than 4}) = \dfrac{2}{6} = \dfrac{1}{3}$. The faces 1, 2, 3, 4 are "4 or less": $P(\text{4 or less}) = \dfrac{4}{6} = \dfrac{2}{3}$.`,
        r`छह में से दो फलक, 5 और 6। तो $P(\text{4 से ज़्यादा}) = \dfrac{2}{6} = \dfrac{1}{3}$। फलक 1, 2, 3, 4 "4 या कम" हैं: $P(\text{4 या कम}) = \dfrac{4}{6} = \dfrac{2}{3}$।`,
      ),
      "worked",
      { isHidden: true },
    );
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(worked));
    return column([
      w.title(t("Count the winning faces", "जीतने वाले फलक गिनो")),
      w.body(
        t(
          '**Example 3.** A die is thrown once. Its six faces are equally likely outcomes. Which of them are favourable to "more than 4"?',
          '**उदाहरण 3।** एक पासा एक बार फेंका जाता है। इसके छह फलक समप्रायिक परिणाम हैं। इनमें से कौन-से "4 से ज़्यादा" के अनुकूल हैं?',
        ),
      ),
      die,
      goal,
      worked,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The complement: P(E) + P(not E) = 1. */
const complement = page(
  "complement",
  (b) => {
    const w = wordsOn(b);
    const die = b.prop(outcomeSpaceDef, "die", {
      kind: Experiment.Die,
      favourable: ["5", "6"],
      eventLabel: { en: "more than 4", hi: "4 से ज़्यादा" },
      isEventShown: true,
      isComplementShown: false,
    });
    b.studentOnly(die.action(SpaceAction.ShowComplement));
    b.standsFor(
      die,
      "the die's faces with 5 and 6 lit as the event; a button lights the complement, faces 1 to 4",
    );
    const ace = choiceQuestion(b, {
      name: "ace",
      prompt: t(
        'If P(E) = 0.05, what is the probability of "not E"? (Exercise 15.1 Q5)',
        'अगर P(E) = 0.05, तो "E नहीं" की प्रायिकता क्या है? (प्रश्नावली 15.1 प्रश्न 5)',
      ),
      options: [
        { id: "right", label: t("0.95", "0.95") },
        {
          id: "same",
          label: t("0.05", "0.05"),
          feedback: t(
            "That's P(E) itself. The complement is the rest of 1: 1 − 0.05 = 0.95.",
            "यह तो ख़ुद P(E) है। पूरक 1 का बाक़ी हिस्सा है: 1 − 0.05 = 0.95।",
          ),
        },
        {
          id: "neg",
          label: t("−0.05", "−0.05"),
          feedback: t(
            "A probability can't be negative. Subtract from 1, not from 0: 1 − 0.05 = 0.95.",
            "प्रायिकता ऋणात्मक नहीं हो सकती। 0 से नहीं, 1 से घटाओ: 1 − 0.05 = 0.95।",
          ),
        },
        {
          id: "nine",
          label: t("0.5", "0.5"),
          feedback: t(
            "0.5 + 0.05 is 0.55, not 1. The two must add to 1: 1 − 0.05 = 0.95.",
            "0.5 + 0.05 तो 0.55 है, 1 नहीं। दोनों का योग 1 होना चाहिए: 1 − 0.05 = 0.95।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Everything that isn't E", "जो कुछ E नहीं है")),
      w.body(
        t(
          'Getting "4 or less" is exactly the same as **not** getting "more than 4". Every face is in one group or the other, never both, so the two probabilities fill up the whole:',
          '"4 या कम" आना ठीक वही है जो "4 से ज़्यादा" का **न** आना। हर फलक या तो एक समूह में है या दूसरे में, दोनों में कभी नहीं, इसलिए दोनों प्रायिकताएँ मिलकर पूरा बनाती हैं:',
        ),
      ),
      w.body(t(r`$$\dfrac{1}{3} + \dfrac{2}{3} = 1$$`, r`$$\dfrac{1}{3} + \dfrac{2}{3} = 1$$`)),
      die,
      w.definition(
        t(
          r`**Complement.** For an event E, the event "not E" is its **complement**, written $\overline{E}$. E and $\overline{E}$ are **complementary events**. Their probabilities always add to 1:`,
          r`**पूरक।** किसी घटना E के लिए, घटना "E नहीं" उसकी **पूरक** है, जिसे $\overline{E}$ लिखते हैं। E और $\overline{E}$ **पूरक घटनाएँ** हैं। इनकी प्रायिकताओं का योग हमेशा 1 होता है:`,
        ),
      ),
      w.body(
        t(
          r`$$P(E) + P(\overline{E}) = 1, \quad\text{so}\quad P(\overline{E}) = 1 - P(E)$$`,
          r`$$P(E) + P(\overline{E}) = 1, \quad\text{इसलिए}\quad P(\overline{E}) = 1 - P(E)$$`,
        ),
      ),
      ace,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Impossible (P = 0) and sure (P = 1) events; 0 ≤ P(E) ≤ 1 on the probability line. */
const sure = page(
  "sure",
  (b) => {
    const w = wordsOn(b);
    const line = b.prop(chanceScaleDef, "line", {
      items: [
        { label: { en: "a die shows 8", hi: "पासे पर 8 आए" }, num: 0, den: 6 },
        { label: { en: "more than 4", hi: "4 से ज़्यादा" }, num: 2, den: 6 },
        { label: { en: "a head", hi: "चित आए" }, num: 1, den: 2 },
        { label: { en: "4 or less", hi: "4 या कम" }, num: 4, den: 6 },
        { label: { en: "less than 7", hi: "7 से कम" }, num: 6, den: 6 },
      ],
    });
    b.studentOnly(line.action(ScaleAction.Next));
    b.studentOnly(line.action(ScaleAction.Back));
    b.studentOnly(line.action(ScaleAction.Focus));
    b.studentOnly(line.action(ScaleAction.ShowComplement));
    b.standsFor(
      line,
      "the probability line from 0 (impossible) to 1 (sure); the learner places five events on it one at a time: a die showing 8, more than 4, a head, 4 or less, less than 7",
    );
    const goal = goalQuestion(b, {
      about: line,
      prompt: t("Place all five events on the line.", "पाँचों घटनाएँ रेखा पर रखो।"),
      isMet: line.field("shown").eq(5),
      solve: Array.from({ length: 5 }, () => line.learner(ScaleAction.Next)),
    });
    const which = choiceQuestion(b, {
      name: "which",
      prompt: t(
        "Exercise 15.1 Q4. Which of these **cannot** be the probability of an event?",
        "प्रश्नावली 15.1 प्रश्न 4. इनमें से कौन-सी किसी घटना की प्रायिकता **नहीं** हो सकती?",
      ),
      options: [
        { id: "right", label: t("−1.5", "−1.5") },
        {
          id: "third",
          label: t(r`$\dfrac{2}{3}$`, r`$\dfrac{2}{3}$`),
          feedback: t(
            "2/3 is between 0 and 1, so it can be a probability.",
            "2/3, 0 और 1 के बीच है, इसलिए यह प्रायिकता हो सकती है।",
          ),
        },
        {
          id: "pct",
          label: t("15%", "15%"),
          feedback: t(
            "15% is 0.15, between 0 and 1, so it can be a probability.",
            "15% यानी 0.15, जो 0 और 1 के बीच है, इसलिए यह प्रायिकता हो सकती है।",
          ),
        },
        {
          id: "dec",
          label: t("0.7", "0.7"),
          feedback: t(
            "0.7 is between 0 and 1, so it can be a probability.",
            "0.7, 0 और 1 के बीच है, इसलिए यह प्रायिकता हो सकती है।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
    });
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(which));
    return column([
      w.title(t("From impossible to sure", "असंभव से निश्चित तक")),
      w.definition(
        t(
          '**Impossible and sure events.** No face of a die shows 8, so no outcome is favourable to "a die shows 8". Its probability is 0/6 = 0: it is an **impossible event**. Every face shows a number less than 7, so all 6 outcomes are favourable and the probability is 6/6 = 1: "less than 7" is a **sure** (or certain) **event**.',
          '**असंभव और निश्चित घटनाएँ।** पासे के किसी फलक पर 8 नहीं है, इसलिए "पासे पर 8 आए" के अनुकूल कोई परिणाम नहीं। इसकी प्रायिकता 0/6 = 0 है: यह **असंभव घटना** है। हर फलक पर 7 से कम संख्या है, इसलिए सारे 6 परिणाम अनुकूल हैं और प्रायिकता 6/6 = 1 है: "7 से कम" एक **निश्चित घटना** है।',
        ),
      ),
      w.body(
        t(
          "The favourable outcomes are never fewer than none, and never more than all of them. So every probability lies between these two:",
          "अनुकूल परिणाम कभी शून्य से कम नहीं होते, और कभी सबसे ज़्यादा नहीं। इसलिए हर प्रायिकता इन दोनों के बीच होती है:",
        ),
      ),
      w.body(t(r`$$0 \le P(E) \le 1$$`, r`$$0 \le P(E) \le 1$$`)),
      line,
      goal,
      which,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Examples 5 and 6: using the complement when only one side is given. */
const examples = page(
  "examples",
  (b) => {
    const w = wordsOn(b);
    const birthday = choiceQuestion(b, {
      name: "birthday",
      prompt: t(
        "Exercise 15.1 Q7. In a group of 3 students, the probability that 2 of them do **not** share a birthday is 0.992. What is the probability that they do?",
        "प्रश्नावली 15.1 प्रश्न 7. 3 विद्यार्थियों के समूह में, 2 के जन्मदिन एक **न** होने की प्रायिकता 0.992 है। उनके जन्मदिन एक होने की प्रायिकता क्या है?",
      ),
      options: [
        { id: "right", label: t("0.008", "0.008") },
        {
          id: "point08",
          label: t("0.08", "0.08"),
          feedback: t(
            "Check the subtraction: 1 − 0.992 = 0.008, not 0.08.",
            "घटाना जाँचो: 1 − 0.992 = 0.008, 0.08 नहीं।",
          ),
        },
        {
          id: "same",
          label: t("0.992", "0.992"),
          feedback: t(
            '"Same birthday" and "not the same" are complements, so they add to 1: 1 − 0.992 = 0.008.',
            '"एक जन्मदिन" और "एक नहीं" पूरक हैं, तो उनका योग 1 है: 1 − 0.992 = 0.008।',
          ),
        },
        {
          id: "third",
          label: t(r`$\dfrac{1}{3}$`, r`$\dfrac{1}{3}$`),
          feedback: t(
            "There are 3 students, but that doesn't make the chance 1/3. Use the complement: 1 − 0.992.",
            "विद्यार्थी 3 हैं, पर इससे संभावना 1/3 नहीं हो जाती। पूरक लो: 1 − 0.992।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("When you only know one side", "जब केवल एक पक्ष पता हो")),
      w.body(
        t(
          '**Example 5.** Sangeeta and Reshma play a tennis match. The probability that Sangeeta wins is 0.62. One of them must win, so "Reshma wins" is the complement of "Sangeeta wins":',
          '**उदाहरण 5।** संगीता और रेशमा एक टेनिस मैच खेलती हैं। संगीता के जीतने की प्रायिकता 0.62 है। दोनों में से एक को जीतना ही है, इसलिए "रेशमा जीते" "संगीता जीते" की पूरक है:',
        ),
      ),
      w.body(
        t(
          r`$$P(\text{Reshma wins}) = 1 - 0.62 = 0.38$$`,
          r`$$P(\text{रेशमा जीते}) = 1 - 0.62 = 0.38$$`,
        ),
      ),
      w.body(
        t(
          "**Example 6.** Savita and Hamida are friends. Leaving out leap years, a year has 365 days, all equally likely as a birthday. Hamida's birthday can fall on 364 days other than Savita's, so",
          "**उदाहरण 6।** सविता और हमीदा सहेलियाँ हैं। लीप वर्ष छोड़कर, एक वर्ष में 365 दिन हैं, सब जन्मदिन के लिए समप्रायिक। हमीदा का जन्मदिन सविता के जन्मदिन के अलावा 364 दिनों में से किसी पर हो सकता है, इसलिए",
        ),
      ),
      w.body(
        t(
          r`$$P(\text{different birthdays}) = \dfrac{364}{365}, \qquad P(\text{same birthday}) = 1 - \dfrac{364}{365} = \dfrac{1}{365}$$`,
          r`$$P(\text{अलग जन्मदिन}) = \dfrac{364}{365}, \qquad P(\text{एक जन्मदिन}) = 1 - \dfrac{364}{365} = \dfrac{1}{365}$$`,
        ),
      ),
      birthday,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** The die game wins only a third of the time. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const run = b.prop(chanceRunDef, "run", {
      kind: Experiment.Die,
      favourable: ["5", "6"],
      eventLabel: { en: "more than 4 (a win)", hi: "4 से ज़्यादा (जीत)" },
      seed: 13,
      batches: [10, 100, 1000],
    });
    b.studentOnly(run.action(RunAction.Run));
    b.studentOnly(run.action(RunAction.Reset));
    b.standsFor(
      run,
      "Kabir's die game played in batches of 10, 100 or 1000; the fraction of wins graphed beside the theoretical 1/3",
    );
    const fix = choiceQuestion(b, {
      name: "fix",
      prompt: t(
        "Kabir wants a die game that players win half the time. Which rule does it?",
        "कबीर ऐसा पासे का खेल चाहता है जिसे खिलाड़ी आधी बार जीतें। कौन-सा नियम यह करेगा?",
      ),
      options: [
        {
          id: "right",
          label: t("Win if it shows more than 3", "3 से ज़्यादा आए तो जीत"),
        },
        {
          id: "four",
          label: t("Win if it shows more than 4", "4 से ज़्यादा आए तो जीत"),
          feedback: t(
            "That's the old rule: only 5 and 6 win, so P(win) = 2/6 = 1/3.",
            "यह पुराना नियम है: केवल 5 और 6 जीतते हैं, तो P(जीत) = 2/6 = 1/3।",
          ),
        },
        {
          id: "two",
          label: t("Win if it shows more than 2", "2 से ज़्यादा आए तो जीत"),
          feedback: t(
            "3, 4, 5, 6 win: 4 faces of 6, so P(win) = 2/3. That's too easy.",
            "3, 4, 5, 6 जीतते हैं: 6 में से 4 फलक, तो P(जीत) = 2/3। यह बहुत आसान है।",
          ),
        },
        {
          id: "six",
          label: t("Win if it shows a 6", "6 आए तो जीत"),
          feedback: t(
            "Only one face wins: P(win) = 1/6. That's far too hard.",
            "केवल एक फलक जीतता है: P(जीत) = 1/6। यह बहुत कठिन है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("A third, not a half", "आधा नहीं, एक-तिहाई")),
      w.body(
        t(
          'Riya plays Kabir\'s die game a thousand times on her tablet. The wins settle near 1/3, so a player loses 2 times in every 3: P(lose) = 1 − 1/3 = 2/3. Kabir\'s "half each" mixed up the numbers 4, 5, 6 with the rule "more than 4", which leaves out the 4.',
          'रिया अपने टैबलेट पर कबीर का पासे का खेल हज़ार बार खेलती है। जीतें 1/3 के पास टिकती हैं, तो खिलाड़ी हर 3 में 2 बार हारता है: P(हार) = 1 − 1/3 = 2/3। कबीर के "आधा-आधा" ने संख्याओं 4, 5, 6 को "4 से ज़्यादा" के नियम से मिला दिया, जिसमें 4 नहीं आता।',
        ),
      ),
      run,
      fix,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Ex 15.1 Q3 and Q6, then the mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const toss = choiceQuestion(b, {
      name: "toss",
      prompt: t(
        "Exercise 15.1 Q3. Why is tossing a coin a fair way to decide which team gets the ball at the start of a football game?",
        "प्रश्नावली 15.1 प्रश्न 3. फ़ुटबॉल मैच की शुरुआत में गेंद किस टीम को मिले, यह तय करने के लिए सिक्का उछालना उचित तरीक़ा क्यों है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Head and tail are equally likely: each team has 1/2",
            "चित और पट समप्रायिक हैं: हर टीम को 1/2",
          ),
        },
        {
          id: "captain",
          label: t(
            "The captain who calls first usually wins the toss",
            "जो कप्तान पहले बोलता है वह आमतौर पर टॉस जीतता है",
          ),
          feedback: t(
            "Calling first changes nothing: the coin lands heads or tails with probability 1/2 each.",
            "पहले बोलने से कुछ नहीं बदलता: सिक्का चित या पट 1/2-1/2 प्रायिकता से गिरता है।",
          ),
        },
        {
          id: "rule",
          label: t(
            "Because the referee's rule book says so",
            "क्योंकि रेफ़री की नियम-पुस्तिका ऐसा कहती है",
          ),
          feedback: t(
            "The rule exists *because* the toss is fair: both outcomes are equally likely.",
            "नियम इसीलिए है *क्योंकि* टॉस उचित है: दोनों परिणाम समप्रायिक हैं।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const candy = choiceQuestion(b, {
      name: "candy",
      prompt: t(
        "Exercise 15.1 Q6. A bag holds only lemon candies. Malini takes one without looking. What is P(an orange candy)?",
        "प्रश्नावली 15.1 प्रश्न 6. एक थैले में केवल नींबू वाली टॉफ़ियाँ हैं। मालिनी बिना देखे एक निकालती है। P(संतरे वाली टॉफ़ी) क्या है?",
      ),
      options: [
        { id: "right", label: t("0: it is impossible", "0: यह असंभव है") },
        {
          id: "one",
          label: t("1: it is sure", "1: यह निश्चित है"),
          feedback: t(
            "Sure is P(a lemon candy) = 1. There are no orange ones, so P(orange) = 0.",
            "निश्चित तो P(नींबू वाली) = 1 है। संतरे वाली कोई नहीं, तो P(संतरे वाली) = 0।",
          ),
        },
        {
          id: "half",
          label: t("1/2: it's orange or not", "1/2: संतरे वाली है या नहीं"),
          feedback: t(
            '"Orange" and "not orange" aren\'t equally likely here: no candy is orange. P = 0.',
            '"संतरे वाली" और "संतरे वाली नहीं" यहाँ समप्रायिक नहीं: कोई टॉफ़ी संतरे वाली नहीं। P = 0।',
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const log = w.definition(
      t(
        '**Mission log.** ✓ The die game is not half-and-half: P(win) = 1/3, P(lose) = 2/3. Kabir changes the rule to "more than 3". ✓ P(not E) = 1 − P(E); impossible is 0, sure is 1, and everything else lies between. ✗ Grandpa\'s card trick and the marble jar are still unchecked. Next stop: cards, bags and choosing.',
        '**मिशन लॉग।** ✓ पासे का खेल आधा-आधा नहीं है: P(जीत) = 1/3, P(हार) = 2/3। कबीर नियम बदलकर "3 से ज़्यादा" कर देता है। ✓ P(E नहीं) = 1 − P(E); असंभव 0 है, निश्चित 1, और बाक़ी सब बीच में। ✗ दादाजी की ताश की चाल और कंचों का जार अभी जाँचे नहीं गए। अगला पड़ाव: ताश, थैले और चुनाव।',
      ),
      "log",
      { isHidden: true },
    );
    b.when(toss.on(QuestionSignal.Correct), theBoard.show(candy));
    b.when(candy.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), toss, candy, log, space()]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [hook, count, complement, sure, examples, inLife, yourTurn];

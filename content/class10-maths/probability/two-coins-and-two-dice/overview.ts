import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, goalQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  DataSceneKind,
  Experiment,
  RunAction,
  SpaceAction,
  SpaceDerived,
  chanceRunDef,
  outcomeSpaceDef,
  twoDiceIds,
} from "@chalk/prop-data";
import { sceneOn } from "../kit";

const r = String.raw;

const SUM_8 = twoDiceIds((a, b) => a + b === 8);
const AT_LEAST_ONE_HEAD = ["HH", "HT", "TH"];

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** The big game: two dice, a sum of 8 wins. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const dice = sceneOn(
    b,
    "dice",
    DataSceneKind.DiceGame,
    "a table at the fair: two dice of different colours have just been thrown, showing a 3 and a 5; Kabir and Mom lean in to see the sum",
  );
  return column([
    w.title(t("The big game: a sum of 8", "बड़ा खेल: योग 8")),
    dice,
    w.body(
      t(
        'The star of Kabir\'s stall is the big game. Throw two dice at once; if the two numbers add up to **8**, you win the grand prize, a cricket bat. "8 is near the middle of 2 and 12," says Kabir, "so it\'ll come up a lot, maybe one throw in three. About 72 people will play, so I\'d better buy 24 bats."',
        'कबीर के स्टॉल का सितारा बड़ा खेल है। दो पासे एक साथ फेंको; अगर दोनों संख्याओं का योग **8** हो, तो बड़ा इनाम, क्रिकेट बैट, जीतो। "8, 2 और 12 के बीच के पास है," कबीर कहता है, "तो यह खूब आएगा, शायद हर तीन फेंक में एक बार। लगभग 72 लोग खेलेंगे, तो मुझे 24 बैट ख़रीद लेने चाहिए।"',
      ),
    ),
    w.body(
      t(
        "With two dice, what even are the outcomes? Riya starts with something smaller: two coins.",
        "दो पासों में परिणाम हैं क्या? रिया कुछ छोटे से शुरू करती है: दो सिक्के।",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Example 9: two coins, at least one head. */
const coins = page(
  "coins",
  (b) => {
    const w = wordsOn(b);
    const space2 = b.prop(outcomeSpaceDef, "coins", {
      kind: Experiment.TwoCoins,
      favourable: AT_LEAST_ONE_HEAD,
      eventLabel: { en: "at least one head", hi: "कम से कम एक चित" },
      isEventShown: false,
      canPick: true,
    });
    b.studentOnly(space2.action(SpaceAction.Toggle));
    b.studentOnly(space2.action(SpaceAction.Clear));
    b.studentOnly(space2.action(SpaceAction.ShowComplement));
    b.standsFor(
      space2,
      "the four outcomes of tossing two coins, (H, H), (H, T), (T, H), (T, T); the learner taps those with at least one head",
    );
    const goal = goalQuestion(b, {
      about: space2,
      prompt: t(
        "Tap every outcome with **at least one head**.",
        "हर वह परिणाम टैप करो जिसमें **कम से कम एक चित** हो।",
      ),
      isMet: space2.derived(SpaceDerived.IsMatched).eq(true),
      solve: AT_LEAST_ONE_HEAD.map((id) => space2.learner(SpaceAction.Toggle, { id })),
    });
    const worked = w.body(
      t(
        r`Three of the four outcomes have a head: $P(\text{at least one head}) = \dfrac{3}{4}$. Or use the complement: "no head" is only (T, T), so $1 - \dfrac{1}{4} = \dfrac{3}{4}$.`,
        r`चार में से तीन परिणामों में चित है: $P(\text{कम से कम एक चित}) = \dfrac{3}{4}$। या पूरक लो: "कोई चित नहीं" केवल (T, T) है, तो $1 - \dfrac{1}{4} = \dfrac{3}{4}$।`,
      ),
      "worked",
      { isHidden: true },
    );
    const three = w.body(
      t(
        "**Three coins.** Each of the four pairs can be followed by H or T, so there are 4 × 2 = 8 outcomes: HHH, HHT, HTH, HTT, THH, THT, TTH, TTT.",
        "**तीन सिक्के।** चारों युग्मों के बाद H या T आ सकता है, तो 4 × 2 = 8 परिणाम हैं: HHH, HHT, HTH, HTT, THH, THT, TTH, TTT।",
      ),
      "three",
      { isHidden: true },
    );
    b.when(goal.on(QuestionSignal.Correct), [theBoard.show(worked), theBoard.show(three)]);
    return column([
      w.title(t("Two coins at once", "एक साथ दो सिक्के")),
      w.definition(
        t(
          "**Outcomes as ordered pairs.** When two things happen together, write each outcome as a pair: (first coin, second coin). Harpreet's two coins give four equally likely outcomes: (H, H), (H, T), (T, H) and (T, T).",
          "**क्रमित युग्मों के रूप में परिणाम।** जब दो चीज़ें एक साथ हों, तो हर परिणाम को युग्म की तरह लिखो: (पहला सिक्का, दूसरा सिक्का)। हरप्रीत के दो सिक्के चार समप्रायिक परिणाम देते हैं: (H, H), (H, T), (T, H) और (T, T)।",
        ),
      ),
      w.body(
        t(
          "**Example 9.** Harpreet tosses two different coins at once (a ₹1 and a ₹2 coin). What is the probability of at least one head?",
          "**उदाहरण 9।** हरप्रीत दो अलग सिक्के (₹1 और ₹2 का) एक साथ उछालती है। कम से कम एक चित की प्रायिकता क्या है?",
        ),
      ),
      space2,
      goal,
      worked,
      three,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Example 13: the 6 × 6 grid of two dice; why (1, 4) and (4, 1) are different. */
const grid = page(
  "grid",
  (b) => {
    const w = wordsOn(b);
    const dice = b.prop(outcomeSpaceDef, "dice", {
      kind: Experiment.TwoDice,
      favourable: SUM_8,
      eventLabel: { en: "the sum is 8", hi: "योग 8 है" },
      isEventShown: false,
      canPick: true,
    });
    b.studentOnly(dice.action(SpaceAction.Toggle));
    b.studentOnly(dice.action(SpaceAction.Clear));
    b.standsFor(
      dice,
      "the 36 outcomes of throwing a blue and a grey die, as a 6 × 6 grid (blue die down, grey die across); the learner taps every pair whose sum is 8",
    );
    const why = choiceQuestion(b, {
      name: "why",
      prompt: t(
        "Why are (2, 6) and (6, 2) two different outcomes?",
        "(2, 6) और (6, 2) दो अलग परिणाम क्यों हैं?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "The 1st die shows 2 in one, and the 2nd in the other",
            "एक में पहले पासे पर 2 है, दूसरे में दूसरे पर",
          ),
        },
        {
          id: "same",
          label: t(
            'They aren\'t: both are just "a 2 and a 6"',
            'अलग नहीं: दोनों बस "एक 2 और एक 6" हैं',
          ),
          feedback: t(
            "The dice are different dice. 1st die 2 with 2nd die 6 can happen, and so can 1st 6 with 2nd 2: two separate ways.",
            "पासे अलग-अलग हैं। पहले पर 2 और दूसरे पर 6 हो सकता है, और पहले पर 6 और दूसरे पर 2 भी: दो अलग तरीक़े।",
          ),
        },
        {
          id: "sum",
          label: t("Because the two sums are different", "क्योंकि दोनों के योग अलग हैं"),
          feedback: t(
            "Both add to 8. They differ in which die shows which number.",
            "दोनों का योग 8 है। फ़र्क़ इसमें है कि कौन-सा पासा कौन-सी संख्या दिखाता है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const goal = goalQuestion(b, {
      about: dice,
      prompt: t("Tap every outcome whose **sum is 8**.", "हर वह परिणाम टैप करो जिसका **योग 8** है।"),
      isMet: dice.derived(SpaceDerived.IsMatched).eq(true),
      solve: SUM_8.map((id) => dice.learner(SpaceAction.Toggle, { id })),
    });
    const worked = w.body(
      t(
        r`Five pairs add to 8: (2, 6), (3, 5), (4, 4), (5, 3), (6, 2). So $P(\text{sum } 8) = \dfrac{5}{36}$. No pair adds to 13, so $P(\text{sum } 13) = 0$; every pair adds to 12 or less, so $P(\text{sum} \le 12) = 1$.`,
        r`पाँच युग्मों का योग 8 है: (2, 6), (3, 5), (4, 4), (5, 3), (6, 2)। तो $P(\text{योग } 8) = \dfrac{5}{36}$। किसी युग्म का योग 13 नहीं, तो $P(\text{योग } 13) = 0$; हर युग्म का योग 12 या कम है, तो $P(\text{योग} \le 12) = 1$।`,
      ),
      "worked",
      { isHidden: true },
    );
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(worked));
    return column([
      w.title(t("Two dice: 36 outcomes", "दो पासे: 36 परिणाम")),
      w.body(
        t(
          "**Example 13.** A blue die and a grey die are thrown together. Call the blue one the 1st die and the grey one the 2nd. Whatever the 1st die shows (1 to 6), the 2nd can show any of 1 to 6. That makes",
          "**उदाहरण 13।** एक नीला और एक धूसर पासा एक साथ फेंके जाते हैं। नीले को पहला पासा और धूसर को दूसरा कहो। पहला पासा जो भी दिखाए (1 से 6), दूसरा 1 से 6 में से कुछ भी दिखा सकता है। इससे बनते हैं",
        ),
      ),
      w.body(
        t(
          r`$$6 \times 6 = 36 \text{ equally likely outcomes}$$`,
          r`$$6 \times 6 = 36 \text{ समप्रायिक परिणाम}$$`,
        ),
      ),
      why,
      dice,
      goal,
      worked,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Sums are not outcomes: Exercise 15.1 Q22 (ii) and Q25. */
const slip = page(
  "slip",
  (b) => {
    const w = wordsOn(b);
    const eleven = choiceQuestion(b, {
      name: "eleven",
      prompt: t(
        'Exercise 15.1 Q22 (ii). A student says: "The sum of two dice can be 2, 3, …, 12, which is 11 outcomes, so each sum has probability 1/11." Is that right?',
        'प्रश्नावली 15.1 प्रश्न 22 (ii). एक विद्यार्थी कहता है: "दो पासों का योग 2, 3, …, 12 हो सकता है, यानी 11 परिणाम, तो हर योग की प्रायिकता 1/11 है।" क्या यह सही है?',
      ),
      options: [
        {
          id: "right",
          label: t("No: the 11 sums are not equally likely", "नहीं: 11 योग समप्रायिक नहीं हैं"),
        },
        {
          id: "yes",
          label: t("Yes: there are exactly 11 possible sums", "हाँ: ठीक 11 संभव योग हैं"),
          feedback: t(
            "There are 11 sums, but sum 2 comes only from (1, 1) while sum 7 comes from 6 pairs. P = favourable ÷ all needs equally likely outcomes: the 36 pairs.",
            "योग 11 हैं, पर योग 2 केवल (1, 1) से आता है जबकि योग 7, 6 युग्मों से। P = अनुकूल ÷ सारे के लिए समप्रायिक परिणाम चाहिए: 36 युग्म।",
          ),
        },
        {
          id: "half",
          label: t("No: each sum has probability 1/12", "नहीं: हर योग की प्रायिकता 1/12 है"),
          feedback: t(
            "No sum has 1/12. Sum 2 is 1/36, sum 7 is 6/36: they're all different.",
            "किसी योग की 1/12 नहीं। योग 2, 1/36 है, योग 7, 6/36: सब अलग हैं।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Count pairs, not sums", "युग्म गिनो, योग नहीं")),
      w.body(
        t(
          "The most common slip with two dice is to treat the sums as the outcomes. Sum 2 can happen in only one way, (1, 1), but sum 7 in six ways: (1, 6), (2, 5), (3, 4), (4, 3), (5, 2), (6, 1). So",
          "दो पासों में सबसे आम ग़लती है योगों को परिणाम मान लेना। योग 2 केवल एक तरह से हो सकता है, (1, 1), पर योग 7 छह तरह से: (1, 6), (2, 5), (3, 4), (4, 3), (5, 2), (6, 1)। इसलिए",
        ),
      ),
      w.body(
        t(
          r`$$P(\text{sum } 2) = \dfrac{1}{36}, \qquad P(\text{sum } 7) = \dfrac{6}{36} = \dfrac{1}{6}$$`,
          r`$$P(\text{योग } 2) = \dfrac{1}{36}, \qquad P(\text{योग } 7) = \dfrac{6}{36} = \dfrac{1}{6}$$`,
        ),
      ),
      w.body(
        t(
          "The equally likely outcomes are the 36 pairs; a sum is an **event**, made of however many pairs add up to it.",
          "समप्रायिक परिणाम 36 युग्म हैं; योग एक **घटना** है, जो उन सारे युग्मों से बनती है जिनका जोड़ उतना हो।",
        ),
      ),
      eleven,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** The sum-8 game wins only 5 times in 36. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const run = b.prop(chanceRunDef, "run", {
      kind: Experiment.TwoDice,
      favourable: SUM_8,
      eventLabel: { en: "a sum of 8 (a bat)", hi: "योग 8 (बैट)" },
      seed: 29,
      batches: [10, 100, 1000],
    });
    b.studentOnly(run.action(RunAction.Run));
    b.studentOnly(run.action(RunAction.Reset));
    b.standsFor(
      run,
      "the big game played in batches with two dice; the fraction of sums of 8 graphed beside the theoretical 5/36",
    );
    const bats = choiceQuestion(b, {
      name: "bats",
      prompt: t(
        "About 72 people are expected to play the big game. How many bats should Kabir expect to give away?",
        "बड़ा खेल लगभग 72 लोगों के खेलने की उम्मीद है। कबीर को कितने बैट देने की उम्मीद रखनी चाहिए?",
      ),
      options: [
        { id: "right", label: t("About 10", "लगभग 10") },
        {
          id: "six",
          label: t("About 6 (one in 11 sums)", "लगभग 6 (11 योगों में एक)"),
          feedback: t(
            "That treats the sums as outcomes. P(sum 8) = 5/36, and 5/36 of 72 is 10.",
            "यह योगों को परिणाम मानता है। P(योग 8) = 5/36, और 72 का 5/36 है 10।",
          ),
        },
        {
          id: "half",
          label: t("About 24 (one in three)", "लगभग 24 (तीन में एक)"),
          feedback: t(
            "Being near the middle doesn't make 8 come up one time in three. 5 pairs of 36 give 8: 5/36 of 72 is 10.",
            "बीच के पास होने से 8 हर तीन में एक बार नहीं आता। 36 में से 5 युग्म 8 देते हैं: 72 का 5/36 है 10।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("How many bats?", "कितने बैट?")),
      w.body(
        t(
          r`Riya runs the big game on her tablet. A sum of 8 comes up a little under once in every 7 throws, close to $\dfrac{5}{36} \approx 0.14$, not "a lot".`,
          r`रिया अपने टैबलेट पर बड़ा खेल चलाती है। योग 8 हर 7 फेंकों में एक बार से थोड़ा कम आता है, $\dfrac{5}{36} \approx 0.14$ के पास, "खूब" नहीं।`,
        ),
      ),
      run,
      bats,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Ex 15.1 Q24 and Q23, then the log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const five = choiceQuestion(b, {
      name: "five",
      prompt: t(
        "Exercise 15.1 Q24. A die is thrown twice. What is the probability that 5 does **not** come up either time?",
        "प्रश्नावली 15.1 प्रश्न 24. एक पासा दो बार फेंका जाता है। प्रायिकता क्या है कि 5 किसी भी बार **न** आए?",
      ),
      options: [
        { id: "right", label: t(r`$\dfrac{25}{36}$`, r`$\dfrac{25}{36}$`) },
        {
          id: "eleven",
          label: t(r`$\dfrac{11}{36}$`, r`$\dfrac{11}{36}$`),
          feedback: t(
            '11/36 is "5 at least once": the row and column of 5 share (5, 5). Its complement is 25/36.',
            '11/36 तो "कम से कम एक बार 5" है: 5 की पंक्ति और स्तंभ (5, 5) बाँटते हैं। इसकी पूरक 25/36 है।',
          ),
        },
        {
          id: "ten",
          label: t(r`$\dfrac{10}{12}$`, r`$\dfrac{10}{12}$`),
          feedback: t(
            "Throwing twice gives 36 pairs, not 12. Without a 5 each throw has 5 choices: 5 × 5 = 25 of 36.",
            "दो बार फेंकने पर 36 युग्म होते हैं, 12 नहीं। 5 के बिना हर फेंक में 5 विकल्प: 36 में 5 × 5 = 25।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const hanif = choiceQuestion(b, {
      name: "hanif",
      prompt: t(
        "Exercise 15.1 Q23. Hanif tosses a coin 3 times and wins if all three show the same face. What is the probability that he **loses**?",
        "प्रश्नावली 15.1 प्रश्न 23. हनीफ़ सिक्का 3 बार उछालता है और तीनों में एक ही फलक आए तो जीतता है। उसके **हारने** की प्रायिकता क्या है?",
      ),
      options: [
        { id: "right", label: t(r`$\dfrac{3}{4}$`, r`$\dfrac{3}{4}$`) },
        {
          id: "quarter",
          label: t(r`$\dfrac{1}{4}$`, r`$\dfrac{1}{4}$`),
          feedback: t(
            "1/4 is his chance of winning: HHH and TTT are 2 of the 8 outcomes. He loses in the other 6: 6/8 = 3/4.",
            "1/4 उसके जीतने की संभावना है: 8 परिणामों में HHH और TTT दो हैं। बाक़ी 6 में वह हारता है: 6/8 = 3/4।",
          ),
        },
        {
          id: "half",
          label: t(r`$\dfrac{1}{2}$`, r`$\dfrac{1}{2}$`),
          feedback: t(
            "Win and lose aren't equally likely. List all 8 outcomes: only 2 are all-same, so he loses 6/8 = 3/4.",
            "जीत और हार समप्रायिक नहीं। सारे 8 परिणाम लिखो: केवल 2 में सब एक जैसे हैं, तो वह 6/8 = 3/4 हारता है।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const log = w.definition(
      t(
        '**Mission log.** ✓ The big game pays out 5 times in 36: Kabir buys about 10 bats, not 24. ✓ With two coins or two dice, list ordered pairs; a sum or "at least one head" is an event made of pairs. ✗ One game has no list of outcomes at all: musical chairs, where the music can stop at any moment. Next stop: beyond counting.',
        '**मिशन लॉग।** ✓ बड़ा खेल 36 में 5 बार इनाम देता है: कबीर 24 नहीं, लगभग 10 बैट ख़रीदता है। ✓ दो सिक्कों या दो पासों में क्रमित युग्म लिखो; योग या "कम से कम एक चित" युग्मों से बनी घटना है। ✗ एक खेल में परिणामों की कोई सूची ही नहीं: म्यूज़िकल चेयर, जहाँ संगीत किसी भी पल रुक सकता है। अगला पड़ाव: गिनती से आगे।',
      ),
      "log",
      { isHidden: true },
    );
    b.when(five.on(QuestionSignal.Correct), theBoard.show(hanif));
    b.when(hanif.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), five, hanif, log, space()]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [hook, coins, grid, slip, inLife, yourTurn];

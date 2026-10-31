import { type At, page, t, theBoard } from "@chalk/author";
import { choice, choiceQuestion, wordsOn } from "@chalk/patterns";
import { AnswerStatus } from "@chalk/prop";
import { sweetShareDef } from "@chalk/prop-primes";

const r = String.raw;

/** The words the sweets use on every page. */
const shareWords = {
  shareLabel: t("Give everyone one", "सबको एक दो"),
  roundsLabel: t("Rounds", "बारियाँ"),
  boxLabel: t("Left in the box", "डिब्बे में बचीं"),
};

/** The story: Riya shares 20 sweets among 6 friends, a round at a time, until a round isn't possible. */
const story = page("story", (b) => {
  const w = wordsOn(b);
  b.purpose(
    "Feel division with a remainder: a round is given while the box has a sweet for every friend, so 20 among 6 ends at 3 each and 2 left, in exactly one place.",
  );
  const game = b.prop(sweetShareDef, "game", {
    sweets: 20,
    friends: 6,
    showLog: true,
    ...shareWords,
  });
  b.standsFor(game, "Riya's 20 sweets shared among 6 friends, a round at a time");
  b.witness(game.learner.giveRound(), game.learner.giveRound(), game.learner.giveRound());
  // The counts read in order (0, 1, 2), so they are written in order, not shuffled.
  const last = choiceQuestion(b, {
    name: "last",
    prompt: t(
      "Riya has given 2 rounds, and 8 sweets are left in the box. How many more rounds can she give?",
      "रिया 2 बारियाँ दे चुकी है, और डिब्बे में 8 मिठाइयाँ बची हैं। वह और कितनी बारियाँ दे सकती है?",
    ),
    options: [
      {
        id: "none",
        label: t("0", "0"),
        feedback: t(
          "8 is more than 6, so there's still a sweet for every friend: one more round.",
          "8, 6 से ज़्यादा है, तो अभी हर दोस्त के लिए एक मिठाई है: एक और बारी।",
        ),
      },
      { id: "right", label: t("1", "1") },
      {
        id: "two",
        label: t("2", "2"),
        feedback: t(
          "After one more round, 8 − 6 = 2 are left. 2 aren't enough for 6 friends.",
          "एक और बारी के बाद 8 − 6 = 2 बचती हैं। 6 दोस्तों के लिए 2 काफ़ी नहीं।",
        ),
      },
    ],
    answer: "right",
    keepOrder: true,
  });
  const wrap = w.definition(
    t(
      r`**Each friend gets 3 sweets, and 2 are left in the box.** 2 aren't enough for another round.`,
      r`**हर दोस्त को 3 मिठाइयाँ मिलीं, और 2 डिब्बे में बचीं।** 2 एक और बारी के लिए काफ़ी नहीं।`,
    ),
    "wrap",
  );
  // Asked after the second round, before the screen shows the game ending.
  b.after(game.on.round, last, { if: (at) => at(game).rounds === 2 });
  // The wrap-up once both are done: the answer given and the last round played.
  b.after(last, wrap, { if: (at) => at(game).rounds >= 3 });
  const isAnswered = (at: At) => at(last).status === AnswerStatus.Correct;
  b.when(game.on.over, theBoard.show(wrap), isAnswered);
  // On only when both are done, too.
  b.passWhen(game.on.over, { if: isAnswered });
  b.passWhen(last.on.correct, { if: (at) => at(game).rounds >= 3 });
  return [
    w.title(t("Euclid's division lemma", "यूक्लिड विभाजन प्रमेयिका")),
    w.body(
      t(
        "Riya has **20 sweets** and **6 friends**. She wants to give her friends as many sweets as she can, but **every friend must get the same number**. Whatever can't be shared fairly stays in the box. She hands them out in **rounds**: in each round, every friend gets one sweet. She starts another round only if there's a sweet for everyone.",
        "रिया के पास **20 मिठाइयाँ** और **6 दोस्त** हैं। वह अपने दोस्तों को जितनी हो सके उतनी मिठाइयाँ देना चाहती है, पर **हर दोस्त को बराबर मिलनी चाहिए**। जो बराबर नहीं बँट सकतीं, वे डिब्बे में रहती हैं। वह उन्हें **बारी-बारी** देती है: हर बार, हर दोस्त को एक मिठाई मिलती है। वह अगली बारी तभी शुरू करती है जब सबके लिए एक मिठाई हो।",
      ),
    ),
    w.body(t("Be Riya: tap **Give everyone one**.", "रिया बनो: **सबको एक दो** दबाओ।")),
    game,
    last,
    wrap,
  ];
});

/** From the sweets to the lemma: one sum with its words, the letters, the two facts, the statement. */
const lemma = page("lemma", (b) => {
  const w = wordsOn(b);
  const qr = choice(b, {
    name: "qr",
    prompt: t(
      r`Divide 38 by 7. What are the quotient $q$ and the remainder $r$?`,
      r`38 को 7 से भाग दो। भागफल $q$ और शेषफल $r$ क्या हैं?`,
    ),
    right: t(r`$q = 5, \; r = 3$`, r`$q = 5, \; r = 3$`),
    wrong: {
      big: {
        label: t(r`$q = 4, \; r = 10$`, r`$q = 4, \; r = 10$`),
        feedback: t(
          "10 is more than 7: one more 7 fits. The remainder must be less than 7.",
          "10, 7 से ज़्यादा है: एक और 7 आ जाता है। शेषफल 7 से कम होना चाहिए।",
        ),
      },
      swap: {
        label: t(r`$q = 3, \; r = 5$`, r`$q = 3, \; r = 5$`),
        feedback: t(
          r`That swaps them. The quotient is how many 7s fit in 38, and the remainder is what is left: $$38 = 7 \times 5 + 3$$`,
          r`इसमें दोनों उलट गए। भागफल यह है कि 38 में कितने 7 आते हैं, और शेषफल जो बचता है: $$38 = 7 \times 5 + 3$$`,
        ),
      },
    },
  });
  return [
    w.title(t("From sweets to numbers", "मिठाइयों से संख्याओं तक")),
    w.body(
      t(
        r`After every round, each sweet is on a plate or in the box: $$\begin{array}{ccccccc} \scriptsize\text{sweets} & & \scriptsize\text{friends} & & \scriptsize\text{rounds} & & \scriptsize\text{box} \\ 20 & = & 6 & \times & 0 & + & 20 \\ 20 & = & 6 & \times & 1 & + & 14 \\ 20 & = & 6 & \times & 2 & + & 8 \\ 20 & = & 6 & \times & 3 & + & \mathbf{2} \end{array}$$ 2 is fewer than 6, so the sharing stops: 2 are left over.`,
        r`हर बारी के बाद, हर मिठाई या तो प्लेट पर है या डिब्बे में: $$\begin{array}{ccccccc} \scriptsize\text{मिठाइयाँ} & & \scriptsize\text{दोस्त} & & \scriptsize\text{बारियाँ} & & \scriptsize\text{डिब्बे में} \\ 20 & = & 6 & \times & 0 & + & 20 \\ 20 & = & 6 & \times & 1 & + & 14 \\ 20 & = & 6 & \times & 2 & + & 8 \\ 20 & = & 6 & \times & 3 & + & \mathbf{2} \end{array}$$ 2, 6 से कम है, तो बँटवारा रुक जाता है: 2 बचती हैं।`,
      ),
    ),
    w.body(
      t(
        r`**It's long division** $$20 \div 6 = \underbrace{3}_{\text{quotient}}, \text{ remainder } \underbrace{2}_{\text{left over}}$$`,
        r`**यह लंबी विभाजन विधि है** $$20 \div 6 = \underbrace{3}_{\text{भागफल}}, \text{ शेषफल } \underbrace{2}_{\text{बचा}}$$`,
      ),
    ),
    w.body(
      t(
        r`**In letters** $$\underbrace{a}_{\text{sweets}} = \underbrace{b}_{\text{friends}} \times \underbrace{q}_{\text{rounds}} + \underbrace{r}_{\text{left over}}$$`,
        r`**अक्षरों में** $$\underbrace{a}_{\text{मिठाइयाँ}} = \underbrace{b}_{\text{दोस्त}} \times \underbrace{q}_{\text{बारियाँ}} + \underbrace{r}_{\text{बचा}}$$`,
      ),
    ),
    w.body(
      t(
        r`**What's left over is always less than the number of friends.** If 6 or more sweets were left, Riya could give everyone one more. So $$0 \le r < b.$$`,
        r`**बचा हुआ हमेशा दोस्तों की संख्या से कम होता है।** अगर 6 या ज़्यादा मिठाइयाँ बचतीं, तो रिया सबको एक और दे सकती। तो $$0 \le r < b.$$`,
      ),
    ),
    w.body(
      t(
        r`**Could the sharing stop anywhere else?** Each round takes 6 sweets out of the box. Riya keeps going while there are at least 6 left, and stops as soon as there are fewer than 6. Look at what's in the box after each round: 20, 14, 8, 2.`,
        r`**क्या बँटवारा कहीं और रुक सकता है?** हर बारी डिब्बे से 6 मिठाइयाँ निकालती है। रिया तब तक बाँटती है जब तक कम से कम 6 बची हों, और 6 से कम होते ही रुक जाती है। हर बारी के बाद डिब्बे में देखो: 20, 14, 8, 2।`,
      ),
    ),
    w.body(
      t(
        r`No. Only one of those is less than 6, so the sharing always stops in the same place: 3 rounds, 2 left over. There's only one possible $q$ and one possible $r$: they are **unique**.`,
        r`नहीं। उनमें से केवल एक संख्या 6 से कम है, तो बँटवारा हमेशा एक ही जगह रुकता है: 3 बारियाँ, 2 बचीं। $q$ और $r$ केवल एक-एक ही हो सकते हैं: वे **अद्वितीय** हैं।`,
      ),
    ),
    w.definition(
      t(
        r`**Euclid's division lemma.** Given positive integers $a$ and $b$, there are **unique** whole numbers $q$ and $r$ such that $$a = bq + r, \qquad 0 \le r < b.$$ $q$ and $r$ are the **quotient** and **remainder** when $a$ is divided by $b$.`,
        r`**यूक्लिड विभाजन प्रमेयिका।** धनात्मक पूर्णांक $a$ और $b$ दिए हों, तो ऐसी **अद्वितीय** पूर्ण संख्याएँ $q$ और $r$ होती हैं कि $$a = bq + r, \qquad 0 \le r < b.$$ $a$ को $b$ से भाग देने पर $q$ **भागफल** और $r$ **शेषफल** है।`,
      ),
    ),
    w.body(
      t("So to find $q$ and $r$, do the long division.", "तो $q$ और $r$ निकालने के लिए लंबा भाग करो।"),
    ),
    qr,
  ];
});

/** The sweets handed over: any a among any b, with the sum written underneath. */
const play = page("play", (b) => {
  const w = wordsOn(b);
  const sandbox = b.prop(sweetShareDef, "sandbox", {
    sweets: 27,
    friends: 6,
    isEditable: true,
    showSum: true,
    showLog: true,
    ...shareWords,
  });
  b.standsFor(sandbox, "a sandbox: any a sweets among b friends, with a = b × q + r underneath");
  return [
    w.title(t("Try it yourself", "ख़ुद आज़माओ")),
    w.body(
      t(
        r`Set any number of sweets $a$ and friends $b$, and share them.`,
        r`कितनी भी मिठाइयाँ $a$ और दोस्त $b$ रखो, और बाँटो।`,
      ),
    ),
    sandbox,
  ];
});

/** Example: every positive odd integer is 4q + 1 or 4q + 3 (NCERT Example 4). */
const exampleOdd = page("example-odd", (b) => {
  const w = wordsOn(b);
  return [
    w.title(t("Example", "उदाहरण")),
    w.body(
      t(
        r`**Q.** Show that every positive odd integer is of the form $4q + 1$ or $4q + 3$, where $q$ is some integer.`,
        r`**प्र.** दिखाओ कि हर धनात्मक विषम पूर्णांक $4q + 1$ या $4q + 3$ के रूप का होता है, जहाँ $q$ कोई पूर्णांक है।`,
      ),
    ),
    w.body(
      t(
        r`**A.** Let $a$ be any positive integer. Divided by 4, it leaves a remainder of 0, 1, 2 or 3, so by Euclid's division lemma with $b = 4$, $$a = 4q + r, \qquad r = 0, 1, 2 \text{ or } 3.$$ Check each remainder:`,
        r`**उत्तर।** मान लो $a$ कोई धनात्मक पूर्णांक है। 4 से भाग देने पर शेषफल 0, 1, 2 या 3 बचता है, तो $b = 4$ लेकर यूक्लिड विभाजन प्रमेयिका से $$a = 4q + r, \qquad r = 0, 1, 2 \text{ या } 3.$$ हर शेषफल जाँचो:`,
      ),
    ),
    w.body(
      t(
        r`$$\begin{aligned} r = 0: \quad a &= 4q = 2(2q) && \text{even} \\ r = 1: \quad a &= 4q + 1 && \text{odd} \\ r = 2: \quad a &= 4q + 2 = 2(2q + 1) && \text{even} \\ r = 3: \quad a &= 4q + 3 && \text{odd} \end{aligned}$$`,
        r`$$\begin{aligned} r = 0: \quad a &= 4q = 2(2q) && \text{सम} \\ r = 1: \quad a &= 4q + 1 && \text{विषम} \\ r = 2: \quad a &= 4q + 2 = 2(2q + 1) && \text{सम} \\ r = 3: \quad a &= 4q + 3 && \text{विषम} \end{aligned}$$`,
      ),
    ),
    w.body(
      t(
        r`So every positive odd integer is of the form $4q + 1$ or $4q + 3$.`,
        r`इसलिए हर धनात्मक विषम पूर्णांक $4q + 1$ या $4q + 3$ के रूप का होता है।`,
      ),
    ),
  ];
});

/** Example: every positive square is 4m or 4m + 1. */
const exampleSquare = page("example-square", (b) => {
  const w = wordsOn(b);
  return [
    w.title(t("Example", "उदाहरण")),
    w.body(
      t(
        r`**Q.** Show that the square of any positive integer is of the form $4m$ or $4m + 1$ for some integer $m$.`,
        r`**प्र.** दिखाओ कि किसी भी धनात्मक पूर्णांक का वर्ग किसी पूर्णांक $m$ के लिए $4m$ या $4m + 1$ के रूप का होता है।`,
      ),
    ),
    w.body(
      t(
        r`**A.** Let $n$ be any positive integer. By Euclid's division lemma, dividing $n$ by some $b$ gives $$n = bq + r, \qquad 0 \le r < b$$ Which $b$ should we pick? Square it and see: $$n^2 = b^2q^2 + 2bqr + r^2$$ We want a 4 in front. With $b = 2$, the first two terms both get a 4.`,
        r`**उत्तर।** मान लो $n$ कोई धनात्मक पूर्णांक है। यूक्लिड विभाजन प्रमेयिका से, $n$ को किसी $b$ से भाग देने पर $$n = bq + r, \qquad 0 \le r < b$$ कौन-सा $b$ चुनें? वर्ग करके देखो: $$n^2 = b^2q^2 + 2bqr + r^2$$ हमें आगे 4 चाहिए। $b = 2$ लेने पर पहले दोनों पदों में 4 आ जाता है।`,
      ),
    ),
    w.body(
      t(
        r`So take $b = 2$, which leaves $r = 0$ or $1$: $$\begin{aligned} n^2 &= (2q + r)^2 \\ &= 4q^2 + 4qr + r^2 \\ &= 4(q^2 + qr) + r^2 \\ &= 4m + r^2, \quad \text{where } m = q^2 + qr. \end{aligned}$$`,
        r`तो $b = 2$ लो, जिससे $r = 0$ या $1$ बचता है: $$\begin{aligned} n^2 &= (2q + r)^2 \\ &= 4q^2 + 4qr + r^2 \\ &= 4(q^2 + qr) + r^2 \\ &= 4m + r^2, \quad \text{जहाँ } m = q^2 + qr. \end{aligned}$$`,
      ),
    ),
    w.body(
      t(
        r`$$\begin{aligned} r = 0: \quad n^2 &= 4m \\ r = 1: \quad n^2 &= 4m + 1 \end{aligned}$$`,
        r`$$\begin{aligned} r = 0: \quad n^2 &= 4m \\ r = 1: \quad n^2 &= 4m + 1 \end{aligned}$$`,
      ),
    ),
    w.body(
      t(
        r`So the square of any positive integer is of the form $4m$ or $4m + 1$.`,
        r`इसलिए किसी भी धनात्मक पूर्णांक का वर्ग $4m$ या $4m + 1$ के रूप का होता है।`,
      ),
    ),
  ];
});

/** The pages, in reading order. */
export const overview = [story, lemma, play, exampleOdd, exampleSquare];

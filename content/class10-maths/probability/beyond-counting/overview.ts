import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, goalQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  DataSceneKind,
  Experiment,
  RegionAction,
  RegionMode,
  SpaceAction,
  SpaceDerived,
  outcomeSpaceDef,
  regionChanceDef,
  twoDiceIds,
} from "@chalk/prop-data";
import { sceneOn } from "../kit";

const r = String.raw;

/** Exercise 15.2 Q2: a die numbered 1, 2, 2, 3, 3, 6. */
const ODD_FACES = [1, 2, 2, 3, 3, 6];
const TOTAL_6 = twoDiceIds((a, b) => a + b === 6, ODD_FACES);

const NOT_FOR_EXAM = t(
  "*(Not from the examination point of view: an idea to understand, not one to be tested.)*",
  "*(परीक्षा की दृष्टि से नहीं: समझने का विचार, परखने का नहीं।)*",
);

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** Musical chairs: the music can stop at any moment, so there's no list to count. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const stall = sceneOn(
    b,
    "stall",
    DataSceneKind.GameStall,
    "Kabir's fun fair stall at the end of the day, the spinner and the jar of marbles on the board, Riya with her notebook",
  );
  return column([
    w.title(t("When the music stops", "जब संगीत रुकता है")),
    stall,
    w.body(
      t(
        "Last game of the fair: musical chairs. Mom plays the music and has promised to stop it at some moment within 2 minutes. Kabir bets that it stops in the first half-minute.",
        "मेले का आख़िरी खेल: म्यूज़िकल चेयर। मम्मी संगीत बजाती हैं और उन्होंने वादा किया है कि 2 मिनट के अंदर किसी पल रोक देंगी। कबीर शर्त लगाता है कि संगीत पहले आधे मिनट में रुकेगा।",
      ),
    ),
    w.body(
      t(
        "Riya opens her notebook to list the outcomes and stops. 0.5 seconds, 0.51, 0.511, …: there are endless moments. You can't count them. So what is the chance?",
        "रिया परिणाम लिखने के लिए नोटबुक खोलती है और रुक जाती है। 0.5 सेकंड, 0.51, 0.511, …: अनगिनत पल हैं। उन्हें गिन नहीं सकते। तो संभावना क्या है?",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Example 10*: probability as a ratio of lengths. */
const line = page(
  "line",
  (b) => {
    const w = wordsOn(b);
    const music = b.prop(regionChanceDef, "music", {
      mode: RegionMode.Line,
      width: 2,
      x0: 0,
      x1: 0.5,
      unit: { en: "min", hi: "मिनट" },
      wholeLabel: { en: "0 to 2 minutes", hi: "0 से 2 मिनट" },
      partLabel: { en: "first half-minute", hi: "पहला आधा मिनट" },
      startSeed: 13,
      seed: 13,
    });
    b.studentOnly(music.action(RegionAction.Drop));
    b.studentOnly(music.action(RegionAction.Reset));
    b.studentOnly(music.action(RegionAction.ShowAnswer));
    b.standsFor(
      music,
      "the number line from 0 to 2 minutes with the first half-minute (0 to 0.5) shaded; random stopping moments are dropped on it and the fraction landing in the shaded stretch is counted",
    );
    const goal = goalQuestion(b, {
      about: music,
      prompt: t(
        "Stop the music at random at least 1000 times. What fraction land in the first half-minute?",
        "संगीत को कम से कम 1000 बार यादृच्छया रोको। कितना भिन्न पहले आधे मिनट में पड़ता है?",
      ),
      isMet: music.field("trials").ge(1000),
      solve: [music.learner(RegionAction.Drop, { times: 1000 })],
    });
    const worked = w.body(
      t(
        r`About a quarter. Every moment from 0 to 2 is equally likely, so the chance is the favourable **length** over the whole length: $P = \dfrac{0.5}{2} = \dfrac{1}{4}$. Tap "show the answer" to see the working.`,
        r`लगभग एक-चौथाई। 0 से 2 तक हर पल समप्रायिक है, तो संभावना अनुकूल **लंबाई** बटा पूरी लंबाई है: $P = \dfrac{0.5}{2} = \dfrac{1}{4}$। हल देखने के लिए "उत्तर दिखाओ" टैप करो।`,
      ),
      "worked",
      { isHidden: true },
    );
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(worked));
    return column([
      w.title(t("Measure instead of count", "गिनने की जगह नापो")),
      w.body(
        t(
          "**Example 10*.** The music stops at some moment between 0 and 2 minutes, every moment equally likely. Find the probability that it stops within the first half-minute.",
          "**उदाहरण 10*।** संगीत 0 और 2 मिनट के बीच किसी पल रुकता है, हर पल समप्रायिक। प्रायिकता ज्ञात करो कि वह पहले आधे मिनट में रुके।",
        ),
      ),
      w.note(NOT_FOR_EXAM),
      music,
      goal,
      worked,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Example 11*: probability as a ratio of areas; then Exercise 15.1 Q20*. */
const area = page(
  "area",
  (b) => {
    const w = wordsOn(b);
    const region = b.prop(regionChanceDef, "region", {
      mode: RegionMode.Rect,
      width: 9,
      height: 4.5,
      x0: 4,
      x1: 7,
      y0: 1,
      y1: 3.5,
      unit: { en: "km²", hi: "km²" },
      wholeLabel: { en: "the whole region", hi: "पूरा क्षेत्र" },
      partLabel: { en: "lake", hi: "झील" },
      startSeed: 17,
      seed: 17,
      batches: [10, 100, 1000],
    });
    b.studentOnly(region.action(RegionAction.Drop));
    b.studentOnly(region.action(RegionAction.Reset));
    b.studentOnly(region.action(RegionAction.ShowAnswer));
    b.standsFor(
      region,
      "a 9 km by 4.5 km rectangular region with a 3 km by 2.5 km lake inside it; random crash points are dropped and the fraction landing in the lake is counted",
    );
    const lake = choiceQuestion(b, {
      name: "lake",
      prompt: t(
        "What is the probability that the helicopter crashed inside the lake?",
        "हेलीकॉप्टर के झील के अंदर गिरने की प्रायिकता क्या है?",
      ),
      options: [
        { id: "right", label: t(r`$\dfrac{5}{27}$`, r`$\dfrac{5}{27}$`) },
        {
          id: "third",
          label: t(r`$\dfrac{1}{3}$`, r`$\dfrac{1}{3}$`),
          feedback: t(
            "That's the lake's width over the region's (3 out of 9). Areas count, not widths: 7.5 ÷ 40.5 = 5/27.",
            "यह झील की चौड़ाई बटा क्षेत्र की (9 में 3) है। क्षेत्रफल गिनते हैं, चौड़ाई नहीं: 7.5 ÷ 40.5 = 5/27।",
          ),
        },
        {
          id: "sides",
          label: t(r`$\dfrac{5.5}{13.5}$`, r`$\dfrac{5.5}{13.5}$`),
          feedback: t(
            "Adding the sides (3 + 2.5 and 9 + 4.5) doesn't give areas. Multiply: 7.5 ÷ 40.5 = 5/27.",
            "भुजाएँ जोड़ने (3 + 2.5 और 9 + 4.5) से क्षेत्रफल नहीं मिलता। गुणा करो: 7.5 ÷ 40.5 = 5/27।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const circle = choiceQuestion(b, {
      name: "circle",
      prompt: t(
        "Exercise 15.1 Q20*. A die is dropped at random on a 3 m × 2 m rectangle with a circle of diameter 1 m inside it. What is the probability that it lands inside the circle?",
        "प्रश्नावली 15.1 प्रश्न 20*. 3 m × 2 m के आयत पर, जिसमें 1 m व्यास का एक वृत्त है, एक पासा यादृच्छया गिराया जाता है। उसके वृत्त के अंदर गिरने की प्रायिकता क्या है?",
      ),
      options: [
        { id: "right", label: t(r`$\dfrac{\pi}{24}$`, r`$\dfrac{\pi}{24}$`) },
        {
          id: "radius",
          label: t(r`$\dfrac{\pi}{6}$`, r`$\dfrac{\pi}{6}$`),
          feedback: t(
            r`$\pi \times 1^2$ uses the diameter as the radius. The radius is $\frac{1}{2}$ m, so the circle is $\frac{\pi}{4}$ m², and $\frac{\pi}{4} \div 6 = \frac{\pi}{24}$.`,
            r`$\pi \times 1^2$ में व्यास को त्रिज्या ले लिया। त्रिज्या $\frac{1}{2}$ m है, तो वृत्त $\frac{\pi}{4}$ m² है, और $\frac{\pi}{4} \div 6 = \frac{\pi}{24}$।`,
          ),
        },
        {
          id: "fifth",
          label: t(r`$\dfrac{\pi}{20}$`, r`$\dfrac{\pi}{20}$`),
          feedback: t(
            r`The rectangle is $3 \times 2 = 6$ m², not $2(3 + 2) = 10$ m² (that's its perimeter). $\frac{\pi}{4} \div 6 = \frac{\pi}{24}$.`,
            r`आयत $3 \times 2 = 6$ m² है, $2(3 + 2) = 10$ m² नहीं (वह परिमाप है)। $\frac{\pi}{4} \div 6 = \frac{\pi}{24}$।`,
          ),
        },
      ],
      answer: "right",
      isHidden: true,
    });
    b.when(lake.on(QuestionSignal.Correct), theBoard.show(circle));
    return column([
      w.title(t("Measure an area", "क्षेत्रफल नापो")),
      w.body(
        t(
          "**Example 11*.** A missing helicopter crashed somewhere in a rectangular region 9 km by 4.5 km, equally likely anywhere. Inside the region is a lake 3 km by 2.5 km. Now the chance is the favourable **area** over the whole area:",
          "**उदाहरण 11*।** एक लापता हेलीकॉप्टर 9 km × 4.5 km के आयताकार क्षेत्र में कहीं गिरा, हर जगह समप्रायिक। क्षेत्र के अंदर 3 km × 2.5 km की एक झील है। अब संभावना अनुकूल **क्षेत्रफल** बटा पूरा क्षेत्रफल है:",
        ),
      ),
      w.body(
        t(
          r`$$P(\text{lake}) = \dfrac{\text{area of the lake}}{\text{area of the region}}$$`,
          r`$$P(\text{झील}) = \dfrac{\text{झील का क्षेत्रफल}}{\text{क्षेत्र का क्षेत्रफल}}$$`,
        ),
      ),
      w.note(NOT_FOR_EXAM),
      region,
      lake,
      circle,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Exercise 15.2 Q2: a die numbered 1, 2, 2, 3, 3, 6, thrown twice. */
const faces = page(
  "faces",
  (b) => {
    const w = wordsOn(b);
    const grid = b.prop(outcomeSpaceDef, "grid", {
      kind: Experiment.TwoDice,
      faces: ODD_FACES,
      favourable: TOTAL_6,
      eventLabel: { en: "a total of 6", hi: "कुल 6" },
      isEventShown: false,
      canPick: true,
    });
    b.studentOnly(grid.action(SpaceAction.Toggle));
    b.studentOnly(grid.action(SpaceAction.Clear));
    b.standsFor(
      grid,
      "the 36 outcomes of throwing a die numbered 1, 2, 2, 3, 3, 6 twice, as a 6 × 6 grid; the learner taps every pair whose total is 6",
    );
    const goal = goalQuestion(b, {
      about: grid,
      prompt: t("Tap every pair whose **total is 6**.", "हर वह युग्म टैप करो जिसका **कुल 6** है।"),
      isMet: grid.derived(SpaceDerived.IsMatched).eq(true),
      solve: TOTAL_6.map((id) => grid.learner(SpaceAction.Toggle, { id })),
    });
    const atLeast = choiceQuestion(b, {
      name: "atLeast",
      prompt: t(
        "The total 6 comes from 3 + 3, and there are two 3s on each throw: 4 of 36, so 1/9. Now: what is the probability that the total is **at least 6**?",
        "कुल 6, 3 + 3 से आता है, और हर फेंक में दो 3 हैं: 36 में 4, तो 1/9। अब: कुल **कम से कम 6** होने की प्रायिकता क्या है?",
      ),
      options: [
        { id: "right", label: t(r`$\dfrac{5}{12}$`, r`$\dfrac{5}{12}$`) },
        {
          id: "seven",
          label: t(r`$\dfrac{11}{36}$`, r`$\dfrac{11}{36}$`),
          feedback: t(
            "11 pairs include a 6 (totals 7 to 12), but don't forget the 4 pairs of 3 + 3 = 6: 15 of 36 = 5/12.",
            "11 युग्मों में 6 है (कुल 7 से 12), पर 3 + 3 = 6 वाले 4 युग्म मत भूलो: 36 में 15 = 5/12।",
          ),
        },
        {
          id: "plain",
          label: t(r`$\dfrac{13}{18}$`, r`$\dfrac{13}{18}$`),
          feedback: t(
            "That's for an ordinary die (26 of 36). This die has only one face above 3: count on its own grid, 15 of 36 = 5/12.",
            "यह साधारण पासे के लिए है (36 में 26)। इस पासे पर 3 से बड़ा केवल एक फलक है: इसकी अपनी तालिका में गिनो, 36 में 15 = 5/12।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
    });
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(atLeast));
    return column([
      w.title(t("A strange die", "एक अनोखा पासा")),
      w.body(
        t(
          "Back to counting, for one last puzzle. **Exercise 15.2 Q2*.** Kabir's prize die has faces 1, 2, 2, 3, 3, 6. It is thrown twice and the scores are added. Each face is still equally likely, so the 36 pairs are too; only the totals change.",
          "आख़िरी पहेली के लिए वापस गिनती पर। **प्रश्नावली 15.2 प्रश्न 2*।** कबीर के इनाम वाले पासे के फलक 1, 2, 2, 3, 3, 6 हैं। इसे दो बार फेंककर अंक जोड़े जाते हैं। हर फलक अब भी समप्रायिक है, तो 36 युग्म भी; केवल कुल बदलते हैं।",
        ),
      ),
      w.body(
        t(
          "Half the faces are odd (1, 3, 3) and half even (2, 2, 6). Odd + odd and even + even are even: 9 + 9 = 18 pairs, so",
          "आधे फलक विषम (1, 3, 3) और आधे सम (2, 2, 6) हैं। विषम + विषम और सम + सम सम होते हैं: 9 + 9 = 18 युग्म, तो",
        ),
      ),
      w.body(
        t(
          r`$$P(\text{even total}) = \dfrac{18}{36} = \dfrac{1}{2}$$`,
          r`$$P(\text{सम कुल}) = \dfrac{18}{36} = \dfrac{1}{2}$$`,
        ),
      ),
      grid,
      goal,
      atLeast,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** The finale: Saturday evening, the poster full, the maths book closed. */
const finale = page(
  "finale",
  (b) => {
    const w = wordsOn(b);
    const day = sceneOn(
      b,
      "day",
      DataSceneKind.Finale,
      "Saturday evening after the fair: the '10B in Numbers' poster full of charts (a histogram, an ogive, a 6 × 6 dice grid), the whole family and Kabir's stall banner behind, everyone cheering",
    );
    const fair = choiceQuestion(b, {
      name: "fair",
      prompt: t(
        "Riya's last check. Which game at Kabir's stall gives a prize with probability exactly 1/4?",
        "रिया की आख़िरी जाँच। कबीर के स्टॉल का कौन-सा खेल ठीक 1/4 प्रायिकता से इनाम देता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Musical chairs: stop in the first half-minute",
            "म्यूज़िकल चेयर: पहले आधे मिनट में रुकना",
          ),
        },
        {
          id: "eight",
          label: t("The big game: two dice adding to 8", "बड़ा खेल: दो पासों का योग 8"),
          feedback: t(
            "That one pays 5 times in 36, about 0.14. The music game is 0.5 ÷ 2 = 1/4.",
            "वह 36 में 5 बार देता है, लगभग 0.14। संगीत वाला खेल 0.5 ÷ 2 = 1/4 है।",
          ),
        },
        {
          id: "ace",
          label: t(
            "Grandpa's cards: drawing an ace from a pack",
            "दादाजी के पत्ते: गड्डी से इक्का निकालना",
          ),
          feedback: t(
            "4 aces in 52 cards is 1/13. The music game is 0.5 ÷ 2 = 1/4.",
            "52 पत्तों में 4 इक्के 1/13 है। संगीत वाला खेल 0.5 ÷ 2 = 1/4 है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Saturday evening", "शनिवार की शाम")),
      day,
      w.body(
        t(
          "Back at school, the poster from Annual Day still hangs on the wall. \"10B in Numbers\" is full: the class's average, its most common family size, its middle height, and in the corner Riya's report on the stall: every game priced by its probability, every prize box stocked to match. Kabir bought 10 bats, not 24, and by evening there was one left on the shelf.",
          'स्कूल में वार्षिकोत्सव का पोस्टर अब भी दीवार पर टँगा है। "10B आँकड़ों में" भर गया है: कक्षा का औसत, परिवार का सबसे आम आकार, बीच की ऊँचाई, और कोने में स्टॉल पर रिया की रिपोर्ट: हर खेल की क़ीमत उसकी प्रायिकता से, हर इनाम का डिब्बा उसी हिसाब से भरा। कबीर ने 24 नहीं, 10 बैट ख़रीदे, और शाम तक शेल्फ़ पर एक ही बचा।',
        ),
      ),
      w.body(
        t(
          "And that's the year's maths book, start to finish. The mela cash box and the bigger stall, Kabir's cycle fund, Grandpa's treasure hunt in the park, the Republic Day water-tank lights, Kite Hill, the Sunday market stall, the cycle poster, and now Fun Fair Week: each time a real question, and each time maths that answered it. Well done.",
          "और यह रहा साल भर की गणित की किताब, शुरू से अंत तक। मेले का गल्ला और बड़ा स्टॉल, कबीर का साइकिल फ़ंड, पार्क में दादाजी की ख़ज़ाने की खोज, गणतंत्र दिवस पर पानी की टंकी की रोशनी, पतंग पहाड़ी, रविवार बाज़ार का स्टॉल, साइकिल का पोस्टर, और अब फ़न फ़ेयर वीक: हर बार एक असली सवाल, और हर बार उसका जवाब देने वाला गणित। शाबाश।",
        ),
      ),
      fair,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Exercise 15.2 Q1, Q3, Q4 and Q5, then the last log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const shop = choiceQuestion(b, {
      name: "shop",
      prompt: t(
        "Exercise 15.2 Q1*. Shyam and Ekta each visit a shop on one day from Tuesday to Saturday, every day equally likely. What is the probability that they visit on **consecutive** days?",
        "प्रश्नावली 15.2 प्रश्न 1*. श्याम और एकता मंगलवार से शनिवार तक किसी एक दिन दुकान जाते हैं, हर दिन समप्रायिक। उनके **लगातार** दिनों पर जाने की प्रायिकता क्या है?",
      ),
      options: [
        { id: "right", label: t(r`$\dfrac{8}{25}$`, r`$\dfrac{8}{25}$`) },
        {
          id: "four",
          label: t(r`$\dfrac{4}{25}$`, r`$\dfrac{4}{25}$`),
          feedback: t(
            "There are 4 pairs of neighbouring days, but either of them can go first: (Tue, Wed) and (Wed, Tue). 8 of 25.",
            "पड़ोसी दिनों के 4 जोड़े हैं, पर दोनों में से कोई भी पहले जा सकता है: (मंगल, बुध) और (बुध, मंगल)। 25 में 8।",
          ),
        },
        {
          id: "same",
          label: t(r`$\dfrac{1}{5}$`, r`$\dfrac{1}{5}$`),
          feedback: t(
            "1/5 is the same day (5 of 25). Consecutive days are 8 of the 25 pairs.",
            "1/5 एक ही दिन है (25 में 5)। लगातार दिन 25 युग्मों में 8 हैं।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const blue = choiceQuestion(b, {
      name: "blue",
      prompt: t(
        "Exercise 15.2 Q3*. A bag has 5 red balls and some blue ones. P(blue) is double P(red). How many blue balls are there?",
        "प्रश्नावली 15.2 प्रश्न 3*. एक थैले में 5 लाल गेंदें और कुछ नीली हैं। P(नीली), P(लाल) की दुगुनी है। कितनी नीली गेंदें हैं?",
      ),
      options: [
        { id: "right", label: t("10", "10") },
        {
          id: "fifteen",
          label: t("15", "15"),
          feedback: t(
            "15 is the total of all balls. Both probabilities share that total, so blue = 2 × red = 10.",
            "15 सारी गेंदों का कुल है। दोनों प्रायिकताओं का कुल एक ही है, तो नीली = 2 × लाल = 10।",
          ),
        },
        {
          id: "seven",
          label: t("7", "7"),
          feedback: t(
            "Double means times 2, not plus 2. Blue = 2 × 5 = 10.",
            "दुगुना मतलब 2 से गुणा, 2 जोड़ना नहीं। नीली = 2 × 5 = 10।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const black = choiceQuestion(b, {
      name: "black",
      prompt: t(
        "Exercise 15.2 Q4*. A box has 12 balls, x of them black. After 6 more black balls are added, P(black) is double what it was. Find x.",
        "प्रश्नावली 15.2 प्रश्न 4*. एक डिब्बे में 12 गेंदें हैं, जिनमें x काली हैं। 6 और काली गेंदें डालने पर P(काली) पहले की दुगुनी हो जाती है। x ज्ञात करो।",
      ),
      options: [
        { id: "right", label: t("x = 3", "x = 3") },
        {
          id: "six",
          label: t("x = 6", "x = 6"),
          feedback: t(
            r`The box now holds 18 balls, not 12. $\dfrac{x + 6}{18} = \dfrac{2x}{12}$ gives $x = 3$.`,
            r`डिब्बे में अब 18 गेंदें हैं, 12 नहीं। $\dfrac{x + 6}{18} = \dfrac{2x}{12}$ से $x = 3$।`,
          ),
        },
        {
          id: "two",
          label: t("x = 2", "x = 2"),
          feedback: t(
            r`Check it: 2 of 12 is $\frac{1}{6}$, and 8 of 18 is $\frac{4}{9}$, not double. $\dfrac{x + 6}{18} = \dfrac{2x}{12}$ gives $x = 3$.`,
            r`जाँचो: 12 में 2, $\frac{1}{6}$ है, और 18 में 8, $\frac{4}{9}$, दुगुना नहीं। $\dfrac{x + 6}{18} = \dfrac{2x}{12}$ से $x = 3$।`,
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const green = choiceQuestion(b, {
      name: "green",
      prompt: t(
        r`Exercise 15.2 Q5*. A jar has 24 marbles, green and blue. $P(\text{green}) = \dfrac{2}{3}$. How many marbles are blue?`,
        r`प्रश्नावली 15.2 प्रश्न 5*. एक जार में 24 कंचे हैं, हरे और नीले। $P(\text{हरा}) = \dfrac{2}{3}$। कितने कंचे नीले हैं?`,
      ),
      options: [
        { id: "right", label: t("8", "8") },
        {
          id: "sixteen",
          label: t("16", "16"),
          feedback: t(
            "16 is the green marbles, 2/3 of 24. The rest are blue: 24 − 16 = 8.",
            "16 हरे कंचे हैं, 24 का 2/3। बाक़ी नीले हैं: 24 − 16 = 8।",
          ),
        },
        {
          id: "twelve",
          label: t("12", "12"),
          feedback: t(
            "Half would be 12, but green is 2/3. Blue is 1/3 of 24 = 8.",
            "आधे 12 होते, पर हरे 2/3 हैं। नीले 24 का 1/3 = 8।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log: Fun Fair Week, complete.** ✓ Experimental probability settles as trials grow; theoretical probability counts equally likely outcomes. ✓ P(not E) = 1 − P(E), and every probability lies from 0 to 1. ✓ Cards, bags and \"at random\": count the favourable, count them all. ✓ Two coins, two dice: ordered pairs, never bare sums. ✓ When outcomes can't be listed, measure lengths and areas instead. That's the last mission of the maths book. See you in Class 11.",
        '**मिशन लॉग: फ़न फ़ेयर वीक, पूरा।** ✓ प्रयोग बढ़ने पर प्रायोगिक प्रायिकता टिक जाती है; सैद्धांतिक प्रायिकता समप्रायिक परिणाम गिनती है। ✓ P(E नहीं) = 1 − P(E), और हर प्रायिकता 0 से 1 के बीच है। ✓ पत्ते, थैले और "यादृच्छया": अनुकूल गिनो, सारे गिनो। ✓ दो सिक्के, दो पासे: क्रमित युग्म, कभी अकेले योग नहीं। ✓ जब परिणाम सूची में न आएँ, तो लंबाई और क्षेत्रफल नापो। यह गणित की किताब का आख़िरी मिशन है। कक्षा 11 में मिलेंगे।',
      ),
      "log",
      { isHidden: true },
    );
    b.when(shop.on(QuestionSignal.Correct), theBoard.show(blue));
    b.when(blue.on(QuestionSignal.Correct), theBoard.show(black));
    b.when(black.on(QuestionSignal.Correct), theBoard.show(green));
    b.when(green.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([
      w.title(t("Your turn", "अब तुम्हारी बारी")),
      w.note(NOT_FOR_EXAM),
      shop,
      blue,
      black,
      green,
      log,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [hook, line, area, faces, yourTurn, finale];

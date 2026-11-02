import { hidden, page, place, scene, t, tap } from "@chalk/author";
import { choice, plane, words } from "@chalk/patterns";
import {
  Axes,
  Choosing,
  Marks,
  PlaceKind,
  Reading,
  Roads,
  Scene,
  Tone,
  coordinatePlane,
} from "@chalk/prop-coordinates";

const { setup, walkTo } = plane;

/** The x- and y-axes' names, as the lesson gives them once they are defined. */
const XY: [ReturnType<typeof t>, ReturnType<typeof t>] = [t("x", "x"), t("y", "y")];

/**
 * The grown town: from −5 to 5 each way around Riya's corner, the same size in every direction
 * (lesson 1's Streets 1–5 and Houses 1–5, Aman's at (4, 5), and as many new ones west and south),
 * on the same window as the axes it becomes.
 */
const GROWN = { xMin: -5.5, xMax: 5.5, yMin: -5.5, yMax: 5.5 };
/** How strongly the town shows behind the axes: there, but the axes' numbers still read over it. */
const TOWN_BEHIND = 0.4;
/** The two number lines as one picture (Fig. 3.7, 3.8), on the grown town's window: −5 to 5. */
const AXES = GROWN;

/** The recap the lesson builds on: a number line, its origin, and a distance either side of it. */
const numberLine = page(
  "number-line",
  scene({
    pieces: {
      title: words.title(t("Back to the number line", "फिर से संख्या रेखा")),
      link: words.body(
        t(
          "Riya's town, the dot on the page and the desks in class each took two numbers, along two lines at right angles. To give the place of **any** point that way, each line will be a **number line**. First, what a number line says.",
          "रिया का शहर, पन्ने पर बिंदु और कक्षा के डेस्क, हर एक के लिए दो समकोण रेखाओं के साथ दो संख्याएँ लगीं। **किसी भी** बिंदु का स्थान इस तरह बताने के लिए, हर रेखा एक **संख्या रेखा** होगी। पहले देखें कि संख्या रेखा क्या बताती है।",
        ),
      ),
      recap: words.body(
        t(
          "A number line has a fixed point, the **origin**, marked 0. Equal units are marked from it: 1, 2, 3, … on one side, the positive side, and −1, −2, −3, … on the other, the negative side.",
          "संख्या रेखा पर एक निश्चित बिंदु होता है, **मूल बिंदु**, जिस पर 0 लिखा होता है। उससे बराबर इकाइयाँ लगाई जाती हैं: एक ओर, धनात्मक ओर, 1, 2, 3, … और दूसरी ओर, ऋणात्मक ओर, −1, −2, −3, …।",
        ),
        {
          says: t(
            "A number line has a fixed point, the origin, marked 0. Equal units are marked from it: 1, 2, 3, and so on, on one side, the positive side, and minus 1, minus 2, minus 3, and so on, on the other, the negative side.",
            "संख्या रेखा पर एक निश्चित बिंदु होता है, मूल बिंदु, जिस पर 0 लिखा होता है। उससे बराबर इकाइयाँ लगाई जाती हैं: एक ओर, धनात्मक ओर, 1, 2, 3, और आगे, और दूसरी ओर, ऋणात्मक ओर, माइनस 1, माइनस 2, माइनस 3, और आगे।",
          ),
        },
      ),
      line: place(
        coordinatePlane,
        setup({
          plane: {
            axes: Axes.Horizontal,
            marks: Marks.Numbers,
            window: { xMin: -5.5, xMax: 5.5, yMin: -0.5, yMax: 0.5 },
            numbered: ["x"],
            showAxisNames: false,
            // 0, not O: the letter is the axes' name for their crossing, a page on.
            showOrigin: false,
          },
          // The point alone: where it stands on the line says its number.
          reading: { point: { x: 2, y: 0 }, pointStep: 1, reading: Reading.None, unit: "" },
        }),
      ),
      ask: words.body(
        t(
          "The point is at 2: **2 units from 0**, on the positive side. Drag it to **−3**.",
          "बिंदु 2 पर है: **0 से 2 इकाई**, धनात्मक ओर। उसे **−3** पर खींचो।",
        ),
        {
          says: t(
            "The point is at 2: 2 units from 0, on the positive side. Drag it to minus 3.",
            "बिंदु 2 पर है: 0 से 2 इकाई, धनात्मक ओर। उसे माइनस 3 पर खींचो।",
          ),
        },
      ),
      rule: hidden(
        words.definition(
          t(
            "**−3 is 3 units from 0, on the negative side.** So a point at distance r from 0 is the number r on the positive side, and −r on the negative side: the sign says which side.",
            "**−3, 0 से 3 इकाई दूर है, ऋणात्मक ओर।** इसलिए 0 से r दूरी पर एक बिंदु धनात्मक ओर संख्या r है, और ऋणात्मक ओर −r: चिह्न बताता है कि किस ओर।",
          ),
          null,
          {
            says: t(
              "Minus 3 is 3 units from 0, on the negative side. So a point at distance r from 0 is the number r on the positive side, and minus r on the negative side: the sign says which side.",
              "माइनस 3, 0 से 3 इकाई दूर है, ऋणात्मक ओर। इसलिए 0 से आर दूरी पर एक बिंदु धनात्मक ओर संख्या आर है, और ऋणात्मक ओर माइनस आर: चिह्न बताता है कि किस ओर।",
            ),
          },
        ),
      ),
    },
    passBy: "rules",
    hear: {
      "line.reading.moved": (_, p, t) =>
        p.x === -3 && [t.self.show({ name: "rule" }), t.self.pass()],
    },
    witness: [tap("line.reading", "movePoint", { x: -3, y: 0 })],
  }),
);

const STREETS: [ReturnType<typeof t>, ReturnType<typeof t>] = [
  t("Street number", "गली नंबर"),
  t("House number", "मकान नंबर"),
];
/** What a tapped house is called once any house may be tapped: not his aunt's. */
const TAPPED = t("The house you tapped", "तुम्हारा चुना मकान");

/** Counting the new streets from her corner, as she counted the old: the other way, so −1. */
const firstWest = choice({
  name: "firstWest",
  prompt: t(
    "Riya numbered the old streets 1, 2, 3, … going **east** from her corner. Counting from her corner the same way, what number should the first new street **west** of it get?",
    "रिया ने पुरानी गलियाँ अपने कोने से **पूर्व** की ओर 1, 2, 3, … गिनी थीं। अपने कोने से उसी तरह गिनते हुए, उसके **पश्चिम** में पहली नई गली को कौन-सी संख्या मिलनी चाहिए?",
  ),
  options: [
    { id: "minus", label: t("−1", "−1") },
    {
      id: "next",
      label: t("6, the next number", "6, अगली संख्या"),
      feedback: t(
        "Street 6 would come after Street 5, on the east side. This street is 1 street from her corner, the other way.",
        "गली 6 तो गली 5 के बाद, पूर्व की ओर आती। यह गली उसके कोने से 1 गली दूर है, दूसरी ओर।",
      ),
    },
    {
      id: "one",
      label: t("1", "1"),
      feedback: t(
        "Street 1 is already there, 1 street east. Two streets can't have one number: this one is 1 street west.",
        "गली 1 पहले से है, 1 गली पूर्व में। दो गलियों का एक ही नंबर नहीं हो सकता: यह 1 गली पश्चिम में है।",
      ),
    },
    {
      id: "zero",
      label: t("0", "0"),
      feedback: t(
        "0 is the street through her corner itself, 0 streets from it. This one is 1 street away.",
        "0 तो उसके कोने से गुज़रने वाली गली है, उससे 0 गली दूर। यह गली 1 गली दूर है।",
      ),
    },
  ],
  answer: "minus",
});

/** Riya's town past her corner: the streets west and the houses south get negative numbers. */
const townGrows = page(
  "town-grows",
  scene({
    pieces: {
      title: words.title(t("The town grows", "शहर बढ़ता है")),
      story: words.body(
        t(
          "Riya's town has grown. New streets were built **west** of her corner (to the left on the map), and new houses **south** of the main road (down the map). A new street also runs through her corner, with no houses on it.",
          "रिया का शहर बढ़ गया है। उसके कोने के **पश्चिम** में (नक्शे पर बाईं ओर) नई गलियाँ बनीं, और मुख्य सड़क के **दक्षिण** में (नक्शे पर नीचे) नए मकान। उसके कोने से होकर भी एक नई गली जाती है, जिस पर कोई मकान नहीं है।",
        ),
      ),
      before: place(
        coordinatePlane,
        setup({
          plane: {
            window: GROWN,
            marks: Marks.Numbers,
            scene: Scene.Town,
            upLines: null,
            showOrigin: false,
            numbered: [],
            showAxisNames: false,
          },
          places: { places: houses(GROWN), placeKind: PlaceKind.House, choosing: Choosing.Never },
          // Riya at her corner, where the counting starts; she walks once the town is numbered.
          walker: {
            walkFrom: { x: 0, y: 0 },
            at: { x: 0, y: 0 },
            roads: Roads.Town,
            canStep: false,
            showWhere: false,
          },
        }),
      ),
      firstWest: firstWest.piece,
      town: hidden(
        place(
          coordinatePlane,
          setup({
            plane: {
              window: GROWN,
              marks: Marks.Numbers,
              scene: Scene.Town,
              upLines: null,
              showOrigin: false,
              axisNames: STREETS,
            },
            places: {
              places: houses(GROWN),
              placeKind: PlaceKind.House,
              choosing: Choosing.OnceOpen,
              showAddress: true,
              // Marked once the rule is said and her line comes (onSaid below).
              target: null,
              targetName: t("Aman's aunt's house", "अमन की मौसी का घर"),
            },
            walker: {
              showWhere: true,
              walkFrom: { x: 0, y: 0 },
              at: { x: 0, y: 0 },
              roads: Roads.Town,
            },
          }),
        ),
      ),
      signs: hidden(
        words.body(
          t(
            "Each road is a number line now. Her corner is **0 on both**, and the street through it is Street 0. Going west, the streets are −1, −2, −3; going south, the houses are −1, −2, −3. **The minus sign says which way:** west along the main road, south down a street.",
            "अब हर सड़क एक संख्या रेखा है। उसका कोना **दोनों पर 0** है, और उससे होकर जाने वाली गली, गली 0 है। पश्चिम की ओर गलियाँ −1, −2, −3 हैं; दक्षिण की ओर मकान −1, −2, −3 हैं। **माइनस का चिह्न बताता है कि किस ओर:** मुख्य सड़क पर पश्चिम, गली में दक्षिण।",
          ),
          {
            says: t(
              "Each road is a number line now. Her corner is 0 on both, and the street through it is Street 0. Going west, the streets are minus 1, minus 2, minus 3; going south, the houses are minus 1, minus 2, minus 3. The minus sign says which way: west along the main road, south down a street.",
              "अब हर सड़क एक संख्या रेखा है। उसका कोना दोनों पर 0 है, और उससे होकर जाने वाली गली, गली 0 है। पश्चिम की ओर गलियाँ माइनस 1, माइनस 2, माइनस 3 हैं; दक्षिण की ओर मकान माइनस 1, माइनस 2, माइनस 3 हैं। माइनस का चिह्न बताता है कि किस ओर: मुख्य सड़क पर पश्चिम, गली में दक्षिण।",
            ),
          },
        ),
      ),
      aunt: hidden(
        words.body(
          t(
            "For their stall at the fair, Aman's aunt is lending them a table. She lives in the new part of town, at **Street −2, House −3**. Walk Riya there to fetch it.",
            "मेले में उनके स्टॉल के लिए अमन की मौसी उन्हें एक मेज़ दे रही हैं। वे शहर के नए हिस्से में, **गली −2, मकान −3** पर रहती हैं। उसे लाने के लिए रिया को वहाँ ले चलो।",
          ),
          {
            says: t(
              "For their stall at the fair, Aman's aunt is lending them a table. She lives in the new part of town, at Street minus 2, House minus 3. Walk Riya there to fetch it.",
              "मेले में उनके स्टॉल के लिए अमन की मौसी उन्हें एक मेज़ दे रही हैं। वे शहर के नए हिस्से में, गली माइनस 2, मकान माइनस 3 पर रहती हैं। उसे लाने के लिए रिया को वहाँ ले चलो।",
            ),
          },
        ),
      ),
      there: hidden(
        words.definition(
          t(
            "**Street −2, House −3: 2 streets west along the main road, then 3 houses south.** Each number says how far from her corner; its sign says which way.",
            "**गली −2, मकान −3: मुख्य सड़क पर 2 गली पश्चिम, फिर 3 मकान दक्षिण।** हर संख्या बताती है कि उसके कोने से कितनी दूर; उसका चिह्न बताता है कि किस ओर।",
          ),
          null,
          {
            says: t(
              "Street minus 2, House minus 3: 2 streets west along the main road, then 3 houses south. Each number says how far from her corner; its sign says which way.",
              "गली माइनस 2, मकान माइनस 3: मुख्य सड़क पर 2 गली पश्चिम, फिर 3 मकान दक्षिण। हर संख्या बताती है कि उसके कोने से कितनी दूर; उसका चिह्न बताता है कि किस ओर।",
            ),
          },
        ),
      ),
      anyHouse: hidden(
        words.body(
          t(
            "**Tap any house** to see its address, in the new town or the old: Aman's own house is at Street 4, House 5.",
            "किसी भी मकान का पता देखने के लिए उसे **दबाओ**, नए शहर में या पुराने में: अमन का अपना घर गली 4, मकान 5 पर है।",
          ),
        ),
      ),
    },
    // The situation first (the rule), then the errand: her address, marked on the map.
    onSaid: {
      signs: (_, t) => [
        t.self.show({ name: "aunt" }),
        t.to.town.places.markTarget({ x: -2, y: -3 }),
      ],
    },
    passBy: "rules",
    hear: {
      "firstWest.correct": (_, __, t) => [
        t.self.hide({ name: "before" }),
        t.self.show({ name: "town" }),
        t.self.show({ name: "signs" }),
      ],
      "town.walker.arrived": (_, p, t) =>
        p.x === -2 &&
        p.y === -3 && [
          t.self.show({ name: "there" }),
          t.self.show({ name: "anyHouse" }),
          t.self.pass(),
        ],
      // A house tapped once she has arrived is any house, not his aunt's.
      // (The lesson's own marking of her house comes first, with no house before it.)
      "town.places.targetChosen": (_, p, t) =>
        p.isAnother && t.to.town.places.nameTarget({ name: TAPPED }),
    },
    uses: [firstWest.use],
    witness: [
      tap("firstWest", "select", { option: "minus" }),
      tap("firstWest", "check"),
      ...walkTo("town", -2, -3),
    ],
  }),
);

/** Two perpendicular number lines, one across and one up, brought together at their zeroes. */
const twoNumberLines = page(
  "two-number-lines",
  scene({
    pieces: {
      title: words.title(t("Two number lines", "दो संख्या रेखाएँ")),
      any: words.body(
        t(
          "Descartes located points with two perpendicular lines. Lines at right angles can point any way: both tilted, or one across and one up. **In this chapter, we take one horizontal and one vertical.**",
          "देकार्त ने दो लंब रेखाओं से बिंदुओं का स्थान बताया। समकोण पर मिलने वाली रेखाएँ किसी भी ओर हो सकती हैं: दोनों तिरछी, या एक आड़ी और एक खड़ी। **इस अध्याय में, हम एक क्षैतिज और एक ऊर्ध्वाधर रेखा लेते हैं।**",
        ),
      ),
      lines: words.body(
        t(
          "Here are two number lines: **X′X** across and **Y′Y** up. Their zeroes are apart. Bring them together so the lines cross at their zeroes.",
          "ये दो संख्या रेखाएँ हैं: **X′X** आड़ी और **Y′Y** खड़ी। इनके शून्य अलग-अलग हैं। इन्हें पास लाओ ताकि रेखाएँ अपने शून्यों पर एक-दूसरे को काटें।",
        ),
        {
          says: t(
            "Here are two number lines: X dash X across and Y dash Y up. Their zeroes are apart. Bring them together so the lines cross at their zeroes.",
            "ये दो संख्या रेखाएँ हैं: X डैश X आड़ी और Y डैश Y खड़ी। इनके शून्य अलग-अलग हैं। इन्हें पास लाओ ताकि रेखाएँ अपने शून्यों पर एक-दूसरे को काटें।",
          ),
        },
      ),
      sheet: place(
        coordinatePlane,
        setup({
          plane: {
            window: AXES,
            marks: Marks.Numbers,
            // The vertical line's zero starts off the horizontal one's, between marks each way, so
            // none of its numbers lies on the horizontal line.
            apart: { x: 2.5, y: 2.5 },
            numbered: ["x", "y"],
            axisNames: XY,
            showAxisNames: false,
            showOrigin: false,
            showDirections: true,
            // The grown town, behind and unseen until the lines cross.
            scene: Scene.Town,
            upLines: null,
            backdrop: 0,
          },
          places: { places: houses(GROWN), placeKind: PlaceKind.House, choosing: Choosing.Never },
        }),
      ),
      axes: hidden(
        words.definition(
          t(
            "**The horizontal line X′X is the x-axis, and the vertical line Y′Y is the y-axis. The point where they cross is the origin, O.**",
            "**क्षैतिज रेखा X′X, x-अक्ष है, और ऊर्ध्वाधर रेखा Y′Y, y-अक्ष है। जिस बिंदु पर ये काटती हैं, वह मूल बिंदु O है।**",
          ),
          null,
          {
            says: t(
              "The horizontal line X dash X is the x-axis, and the vertical line Y dash Y is the y-axis. The point where they cross is the origin, O.",
              "क्षैतिज रेखा X डैश X, एक्स-अक्ष है, और ऊर्ध्वाधर रेखा Y डैश Y, वाई-अक्ष है। जिस बिंदु पर ये काटती हैं, वह मूल बिंदु O है।",
            ),
          },
        ),
      ),
      town: hidden(
        words.body(
          t(
            "In Riya's town, the x-axis is the main road and the y-axis is the street through her corner. **O is the corner she started from**, 0 on both.",
            "रिया के शहर में, x-अक्ष मुख्य सड़क है और y-अक्ष उसके कोने से गुज़रती गली। **O वही कोना है जहाँ से वह चली थी**, दोनों पर 0।",
          ),
          {
            says: t(
              "In Riya's town, the x-axis is the main road and the y-axis is the street through her corner. O is the corner she started from, 0 on both.",
              "रिया के शहर में, एक्स-अक्ष मुख्य सड़क है और वाई-अक्ष उसके कोने से गुज़रती गली। O वही कोना है जहाँ से वह चली थी, दोनों पर 0।",
            ),
          },
        ),
      ),
    },
    passBy: "rules",
    // The town fades in behind the axes it was walked on (below), and out once that is said.
    onSaid: { town: (_, t) => t.to.sheet.plane.fadeBackdrop({ to: 0, seconds: 1 }) },
    hear: {
      "sheet.plane.crossed": (_, __, t) => [
        t.to.sheet.plane.fadeBackdrop({ to: TOWN_BEHIND, seconds: 1 }),
        t.self.show({ name: "axes" }),
        t.self.show({ name: "town" }),
        t.self.pass(),
      ],
    },
    witness: [tap("sheet.plane", "bringTogether", {})],
  }),
);

/** OX and OY positive, OX′ and OY′ negative: each half of each axis named by a tap. */
const axesAndDirections = page(
  "axes-and-directions",
  scene({
    pieces: {
      title: words.title(t("Positive and negative directions", "धनात्मक और ऋणात्मक दिशाएँ")),
      directions: words.definition(
        t(
          "**OX and OY are the positive directions** of the x-axis and the y-axis: the positive numbers lie along them. **OX′ and OY′ are the negative directions:** the negative numbers lie along them.",
          "**OX और OY, x-अक्ष और y-अक्ष की धनात्मक दिशाएँ हैं:** धनात्मक संख्याएँ इन पर होती हैं। **OX′ और OY′ ऋणात्मक दिशाएँ हैं:** ऋणात्मक संख्याएँ इन पर होती हैं।",
        ),
        null,
        {
          says: t(
            "O X and O Y are the positive directions of the x-axis and the y-axis: the positive numbers lie along them. O X dash and O Y dash are the negative directions: the negative numbers lie along them.",
            "O X और O Y, एक्स-अक्ष और वाई-अक्ष की धनात्मक दिशाएँ हैं: धनात्मक संख्याएँ इन पर होती हैं। O X डैश और O Y डैश ऋणात्मक दिशाएँ हैं: ऋणात्मक संख्याएँ इन पर होती हैं।",
          ),
        },
      ),
      sheet: place(
        coordinatePlane,
        setup({
          plane: {
            window: AXES,
            marks: Marks.Numbers,
            numbered: ["x", "y"],
            axisNames: XY,
            // X, X′, Y, Y′ name the ends, as in Fig. 3.8: the small x and y would be a second name.
            showAxisNames: false,
            showDirections: true,
          },
        }),
      ),
      tapHalves: words.body(
        t(
          "**Tap each half of each axis**, and O, to see its name.",
          "हर अक्ष के हर आधे भाग को, और O को, उसका नाम देखने के लिए **दबाओ**।",
        ),
      ),
    },
  }),
);

/** The axes cut the plane into four quadrants, numbered I to IV anticlockwise from OX. */
const quadrants = page(
  "quadrants",
  scene({
    pieces: {
      title: words.title(t("Four quadrants", "चार चतुर्थांश")),
      parts: words.body(
        t(
          "The axes divide the plane into four parts. Each is called a **quadrant**: one fourth part. They are numbered I, II, III and IV, going **anticlockwise** from OX. Press **Number the quadrants**.",
          "अक्ष तल को चार भागों में बाँटते हैं। हर भाग को **चतुर्थांश** कहते हैं: एक चौथाई भाग। इन्हें OX से **वामावर्त** (घड़ी की सुइयों की उलटी दिशा में) चलते हुए पहला (I), दूसरा (II), तीसरा (III) और चौथा (IV) गिना जाता है। **चतुर्थांशों को गिनो** दबाओ।",
        ),
        {
          says: t(
            "The axes divide the plane into four parts. Each is called a quadrant: one fourth part. They are numbered one, two, three and four, going anticlockwise from O X. Press Number the quadrants.",
            "अक्ष तल को चार भागों में बाँटते हैं। हर भाग को चतुर्थांश कहते हैं: एक चौथाई भाग। इन्हें O X से वामावर्त, यानी घड़ी की सुइयों की उलटी दिशा में, चलते हुए पहला, दूसरा, तीसरा और चौथा गिना जाता है। चतुर्थांशों को गिनो दबाओ।",
          ),
        },
      ),
      sheet: place(
        coordinatePlane,
        setup({
          plane: {
            window: AXES,
            marks: Marks.Numbers,
            numbered: ["x", "y"],
            axisNames: XY,
            // X, X′, Y, Y′ name the ends, as in Fig. 3.8: the small x and y would be a second name.
            showAxisNames: false,
            showDirections: true,
            canNumberQuadrants: true,
            // Once numbered: each quadrant tinted, the town fading in behind, two houses marked.
            tintsQuadrants: true,
            scene: Scene.Town,
            upLines: null,
            backdrop: 0,
            points: [
              { name: "A", x: 4, y: 5, isShown: false, hasDropLines: false, tone: Tone.Main },
              { name: "B", x: -2, y: -3, isShown: false, hasDropLines: false, tone: Tone.Main },
            ],
          },
          places: { places: houses(GROWN), placeKind: PlaceKind.House, choosing: Choosing.Never },
        }),
      ),
      town: hidden(
        words.body(
          t(
            "In Riya's town, the quadrants are its four parts around her corner. Aman's house, A, at Street 4, House 5, is in quadrant I; his aunt's, B, at Street −2, House −3, is in quadrant III. **Tap a quadrant** to see its name.",
            "रिया के शहर में, चतुर्थांश उसके कोने के चारों ओर शहर के चार भाग हैं। अमन का घर, A, गली 4, मकान 5 पर, पहले चतुर्थांश (I) में है; उसकी मौसी का, B, गली −2, मकान −3 पर, तीसरे चतुर्थांश (III) में। उसका नाम देखने के लिए **किसी चतुर्थांश को दबाओ**।",
          ),
          {
            says: t(
              "In Riya's town, the quadrants are its four parts around her corner. Aman's house, A, at Street 4, House 5, is in quadrant one; his aunt's, B, at Street minus 2, House minus 3, is in quadrant three. Tap a quadrant to see its name.",
              "रिया के शहर में, चतुर्थांश उसके कोने के चारों ओर शहर के चार भाग हैं। अमन का घर, A, गली 4, मकान 5 पर, पहले चतुर्थांश में है; उसकी मौसी का, B, गली माइनस 2, मकान माइनस 3 पर, तीसरे चतुर्थांश में। उसका नाम देखने के लिए किसी चतुर्थांश को दबाओ।",
            ),
          },
        ),
      ),
      plane: hidden(
        words.definition(
          t(
            "**The plane, with its axes and its quadrants, is called the Cartesian plane, or the coordinate plane, or the xy-plane. The axes are called the coordinate axes.**",
            "**अपने अक्षों और चतुर्थांशों के साथ इस तल को कार्तीय तल, या निर्देशांक तल, या xy-तल कहते हैं। अक्षों को निर्देशांक अक्ष कहते हैं।**",
          ),
          null,
          {
            says: t(
              "The plane, with its axes and its quadrants, is called the Cartesian plane, or the coordinate plane, or the x y plane. The axes are called the coordinate axes.",
              "अपने अक्षों और चतुर्थांशों के साथ इस तल को कार्तीय तल, या निर्देशांक तल, या एक्स वाई तल कहते हैं। अक्षों को निर्देशांक अक्ष कहते हैं।",
            ),
          },
        ),
      ),
      summary: hidden(
        words.body(
          t(
            "**In short:** a point in a plane is located with two perpendicular lines, the coordinate axes. The **x-axis** is horizontal and the **y-axis** is vertical. They cross at the **origin**, O, and divide the **Cartesian plane** into four **quadrants**.",
            "**संक्षेप में:** तल में एक बिंदु का स्थान दो लंब रेखाओं, निर्देशांक अक्षों, से बताया जाता है। **x-अक्ष** क्षैतिज है और **y-अक्ष** ऊर्ध्वाधर। ये **मूल बिंदु** O पर काटते हैं, और **कार्तीय तल** को चार **चतुर्थांशों** में बाँटते हैं।",
          ),
          {
            says: t(
              "In short: a point in a plane is located with two perpendicular lines, the coordinate axes. The x-axis is horizontal and the y-axis is vertical. They cross at the origin, O, and divide the Cartesian plane into four quadrants.",
              "संक्षेप में: तल में एक बिंदु का स्थान दो लंब रेखाओं, निर्देशांक अक्षों, से बताया जाता है। एक्स-अक्ष क्षैतिज है और वाई-अक्ष ऊर्ध्वाधर। ये मूल बिंदु O पर काटते हैं, और कार्तीय तल को चार चतुर्थांशों में बाँटते हैं।",
            ),
          },
        ),
      ),
    },
    passBy: "rules",
    hear: {
      "sheet.plane.quadrantsNumbered": (_, __, t) => [
        t.to.sheet.plane.fadeBackdrop({ to: TOWN_BEHIND, seconds: 1 }),
        t.to.sheet.plane.showPoint({ name: "A" }),
        t.to.sheet.plane.showPoint({ name: "B" }),
        t.self.show({ name: "town" }),
        t.self.show({ name: "plane" }),
        t.self.show({ name: "summary" }),
        t.self.pass(),
      ],
    },
    witness: [tap("sheet.plane", "numberQuadrants", {})],
  }),
);

/**
 * The grown town's houses: every whole-number point in the window but those on the main road, and
 * none on the street through Riya's corner, which carries the house numbers.
 */
function houses(w: typeof GROWN) {
  const out: { x: number; y: number }[] = [];
  for (let x = Math.ceil(w.xMin); x <= w.xMax; x++)
    for (let y = Math.ceil(w.yMin); y <= w.yMax; y++) if (x !== 0 && y !== 0) out.push({ x, y });
  return out;
}

/** The pages, in reading order. */
export const overview = [numberLine, townGrows, twoNumberLines, axesAndDirections, quadrants];

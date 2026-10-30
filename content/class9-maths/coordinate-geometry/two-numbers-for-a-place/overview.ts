import { hidden, page, place, scene, t, tap } from "@chalk/author";
import { gridOf, scenePlane, sceneWith } from "@chalk/patterns";
import {
  Axes,
  Marks,
  PlaceKind,
  Reading,
  Roads,
  Tone,
  WalkerKind,
  sceneCoordinatePlane as plane,
} from "@chalk/prop-coordinates";

const { words } = sceneWith;
const { sceneSetup: setup, sceneTown, sceneNotebook, sceneClassroom, walkTo } = scenePlane;

/** A bus on a straight road: the number line they know, its own short story. */
const side = sceneWith.choice({
  name: "side",
  prompt: t("The bus is at −2. Where is it?", "बस −2 पर है। वह कहाँ है?"),
  speak: t("The bus is at minus 2. Where is it?", "बस माइनस 2 पर है। वह कहाँ है?"),
  options: [
    { id: "left", label: t("2 stops from the stand, to the left", "अड्डे से 2 स्टॉप, बाईं ओर") },
    {
      id: "right",
      label: t("2 stops from the stand, to the right", "अड्डे से 2 स्टॉप, दाईं ओर"),
      feedback: t(
        "Look at the bus: it went left from 0. The minus sign says which side.",
        "बस को देखो: वह 0 से बाईं ओर गई। ऋण चिह्न बताता है कि किस ओर।",
      ),
    },
    {
      id: "minus",
      label: t("−2 stops from the stand", "अड्डे से −2 स्टॉप"),
      feedback: t(
        "It is 2 stops away; the − only says which way, left.",
        "वह 2 स्टॉप दूर है; − केवल दिशा बताता है, बाईं ओर।",
      ),
    },
  ],
  answer: "left",
});

const busStops = page(
  "bus-stops",
  scene({
    purpose:
      "A refresher on the number line: from the bus stand at 0, the bus moves stop by stop either way, and one number (how far, and which side) fixes where it is.",
    pieces: {
      title: words.title(t("A bus on a straight road", "सीधी सड़क पर एक बस")),
      road: words.body(
        t(
          "A bus runs on a straight road. Its stand is at **0**. The stops to the right are 1, 2, 3, …, and the stops to the left are −1, −2, −3, …: a number line.",
          "एक बस सीधी सड़क पर चलती है। उसका अड्डा **0** पर है। दाईं ओर के स्टॉप 1, 2, 3, … हैं, और बाईं ओर के −1, −2, −3, …: एक संख्या रेखा।",
        ),
        {
          speak: t(
            "A bus runs on a straight road. Its stand is at 0. The stops to the right are 1, 2, 3, and so on, and the stops to the left are minus 1, minus 2, minus 3, and so on: a number line.",
            "एक बस सीधी सड़क पर चलती है। उसका अड्डा 0 पर है। दाईं ओर के स्टॉप 1, 2, 3, और आगे हैं, और बाईं ओर के माइनस 1, माइनस 2, माइनस 3, और आगे: एक संख्या रेखा।",
          ),
        },
      ),
      move: words.body(
        t(
          "Move the bus one stop at a time with ← and →. Take it to stop **3**.",
          "बस को ← और → से एक-एक स्टॉप चलाओ। इसे स्टॉप **3** पर ले जाओ।",
        ),
        {
          speak: t(
            "Move the bus one stop at a time with the left and right arrows. Take it to stop 3.",
            "बस को बाएँ और दाएँ तीर से एक-एक स्टॉप चलाओ। इसे स्टॉप 3 पर ले जाओ।",
          ),
        },
      ),
      line: place(plane, {
        plane: {
          window: { xMin: -6, xMax: 6, yMin: 0, yMax: 0.5 },
          axes: Axes.Horizontal,
          marks: Marks.Numbers,
          showAxisNames: false,
          showOrigin: false,
        },
        places: {
          places: [
            { x: 0, y: 0, label: t("bus stand", "बस अड्डा") },
            ...[-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6].map((x) => ({ x, y: 0 })),
          ],
          placeKind: PlaceKind.Crossing,
          canChooseTarget: false,
        },
        walker: {
          walkFrom: { x: 0, y: 0 },
          at: { x: 0, y: 0 },
          roads: Roads.Grid,
          walkerKind: WalkerKind.Bus,
          walkerName: t("The bus", "बस"),
        },
      }),
      atThree: hidden(
        words.body(
          t(
            "The bus is at **3**: three stops from the stand, to the right. Now take it to **−2**.",
            "बस **3** पर है: अड्डे से तीन स्टॉप, दाईं ओर। अब इसे **−2** पर ले जाओ।",
          ),
          {
            speak: t(
              "The bus is at 3: three stops from the stand, to the right. Now take it to minus 2.",
              "बस 3 पर है: अड्डे से तीन स्टॉप, दाईं ओर। अब इसे माइनस 2 पर ले जाओ।",
            ),
          },
        ),
      ),
      side: hidden(side.piece),
      enough: hidden(
        words.definition(
          t(
            "**The bus can only go along the road, so one number tells you exactly where it is:** how far from the stand, and which side.",
            "**बस केवल सड़क के साथ-साथ चल सकती है, इसलिए एक संख्या ठीक-ठीक बता देती है कि वह कहाँ है:** अड्डे से कितनी दूर, और किस ओर।",
          ),
        ),
      ),
    },
    standsFor: { line: "a straight road as a number line: the bus stand at 0, stops both ways" },
    hear: {
      "line.walker.stepped": (_, p, t) => [
        ...(p.x === 3 ? [t.self.show({ name: "atThree" })] : []),
        ...(p.x === -2 ? [t.self.show({ name: "side" })] : []),
      ],
      "side.correct": (_, __, t) => t.self.show({ name: "enough" }),
    },
    uses: [side.use],
    witness: [...walkTo("line", 3, 0), ...walkTo("line", -5, 0)],
  }),
);

/** Riya walks to Aman's house: "Street 4" on the road; Street 4 rises; "House 5" on it. */
const streetAndHouse = page(
  "street-and-house",
  scene({
    purpose:
      "The main road is a number line, and 'Street 4' is one number on it. Then Street 4 rises from the 4, a second number line with five houses, and one number can't say which: 'House 5' is a number on the line that rose. A pair is how far along, then how far up the line that rises there.",
    pieces: {
      title: words.title(t("Finding Aman's house", "अमन का घर ढूँढना")),
      story: words.body(
        t(
          "Riya and Aman are in class 9, and their class is holding a stall fair. They will plan their stall at Aman's house, but Riya has never been there. She asks him where he lives. He replies: **Street 4**.",
          "रिया और अमन कक्षा 9 में हैं, और उनकी कक्षा एक स्टॉल मेला लगा रही है। वे अपना स्टॉल अमन के घर पर तय करेंगे, पर रिया वहाँ कभी नहीं गई। वह उससे पूछती है कि वह कहाँ रहता है। वह जवाब देता है: **गली 4**।",
        ),
      ),
      road: words.body(
        t(
          "Their town has a main road, and the streets leave it numbered 1, 2, 3, … from Riya's corner: like a number line. Move her along it with →.",
          "उनके शहर में एक मुख्य सड़क है, और गलियाँ उससे रिया के कोने से 1, 2, 3, … गिनकर निकलती हैं: एक संख्या रेखा जैसी। उसे → से उस पर चलाओ।",
        ),
        {
          speak: t(
            "Their town has a main road, and the streets leave it numbered 1, 2, 3, and so on, from Riya's corner: like a number line. Move her along it with the right arrow.",
            "उनके शहर में एक मुख्य सड़क है, और गलियाँ उससे रिया के कोने से 1, 2, 3, और आगे गिनकर निकलती हैं: एक संख्या रेखा जैसी। उसे दाएँ तीर से उस पर चलाओ।",
          ),
        },
      ),
      town: place(
        plane,
        setup(sceneTown(), {
          plane: { upLines: [] },
          places: { showAddress: true, canChooseTarget: true },
          walker: { showWhere: true },
        }),
      ),
      fiveHouses: hidden(
        words.body(
          t(
            "Street 4 rises from the 4: a second number line, going up, with **five houses** on it. Which one is Aman's?",
            "4 से गली 4 ऊपर उठती है: एक दूसरी संख्या रेखा, ऊपर की ओर, जिस पर **पाँच मकान** हैं। अमन का कौन-सा है?",
          ),
        ),
      ),
      reply: hidden(
        words.body(
          t(
            "Riya messages him again. He replies: **House 5**, a number on the street that rose. Walk her up to it.",
            "रिया उसे फिर संदेश भेजती है। वह जवाब देता है: **मकान 5**, उठी हुई गली पर एक संख्या। उसे वहाँ तक ऊपर चलाओ।",
          ),
        ),
      ),
      found: hidden(
        words.definition(
          t(
            "**Aman's house isn't on one line: it's along the main road and then up a street, so one number couldn't say where it is.** It took two numbers: how far along the main road (Street 4), then how far up the street that rises there (House 5).",
            "**अमन का घर एक रेखा पर नहीं है: वह मुख्य सड़क पर आगे और फिर एक गली में ऊपर है, इसलिए एक संख्या नहीं बता सकी कि वह कहाँ है।** इसके लिए दो संख्याएँ लगीं: मुख्य सड़क पर कितना आगे (गली 4), फिर वहाँ से उठती गली में कितना ऊपर (मकान 5)।",
          ),
        ),
      ),
      anyHouse: hidden(
        words.body(
          t(
            "Now every street rises, and the town is there. **Tap any house** to make it Aman's: Riya goes back to the corner. Say how she gets there, then walk her and check.",
            "अब हर गली उठती है, और शहर बन जाता है। **किसी भी मकान को दबाओ** ताकि वह अमन का घर बन जाए: रिया कोने पर लौट जाती है। बोलो कि वह वहाँ कैसे पहुँचेगी, फिर उसे चलाकर जाँचो।",
          ),
        ),
      ),
    },
    standsFor: {
      town: "the town's main road, a number line from Riya's corner; the streets not risen yet",
    },
    passBy: "rules",
    hear: {
      // At the foot of Street 4, the street rises from the road, with its houses.
      "town.walker.stepped": (_, p, t) =>
        p.x === 4 && p.y === 0 && t.to.town.plane.raiseUpLine({ at: 4 }),
      // Its five houses light up, and once that is said, Aman's reply marks his house.
      "town.plane.risen": (me, p, t) =>
        p.at === 4 &&
        me.hidden.includes("fiveHouses") && [
          t.self.show({ name: "fiveHouses" }),
          t.to.town.places.lightLine({ axis: "x", value: 4 }),
        ],
      "fiveHouses.said": (_, __, t) => t.to.town.places.chooseTarget({ x: 4, y: 5 }),
      "town.places.targetChosen": (_, p, t) => p.x === 4 && t.self.show({ name: "reply" }),
      "town.walker.arrived": (_, p, t) =>
        p.x === 4 &&
        p.y === 5 && [
          t.self.show({ name: "found" }),
          t.self.show({ name: "anyHouse" }),
          t.to.town.plane.raiseAllUpLines(),
          t.self.pass(),
        ],
    },
    witness: [...walkTo("town", 4, 0), ...walkTo("town", 0, 5)],
  }),
);

/** A dot on a notebook page: the book's ways of saying where it is narrow it to a patch, a line, then one point. */
const dotOnPaper = page(
  "dot-on-paper",
  scene({
    purpose:
      'A dot on a notebook page, which has no roads. The book\'s ways of saying where it is, one at a time, each shading where it could still be: "upper half" half the page, "near the left edge" a patch, 5 cm from the left edge a whole line, and 9 cm above the bottom one point, where the two lines cross.',
    pieces: {
      title: words.title(t("A dot on a page", "पन्ने पर एक बिंदु")),
      ask: words.body(
        t(
          "Here is a dot on a page of your notebook, and each small square is 1 cm across. How would you say exactly where the dot is? Try these, one at a time, and watch where it could still be.",
          "यह तुम्हारी कॉपी के पन्ने पर एक बिंदु है, और हर छोटा खाना 1 cm चौड़ा है। तुम ठीक-ठीक कैसे बताओगे कि बिंदु कहाँ है? ये एक-एक करके आज़माओ, और देखो कि वह अब भी कहाँ हो सकता है।",
        ),
      ),
      sheet: place(
        plane,
        setup(sceneNotebook(), {
          // No numbers on the edges at first: they would say where the dot is. An edge becomes a
          // ruler once a distance along it is given (the rules below).
          plane: { numbered: [] },
          reading: { point: null, reading: Reading.None },
          clues: {
            // The dot is on the page from the start: the question is how to say where it is.
            hidden: { x: 5, y: 9 },
            isHiddenShown: true,
            clueChoices: [
              {
                words: t("It is in the upper half", "यह ऊपरी आधे भाग में है"),
                region: { xMin: 0, xMax: 15, yMin: 6, yMax: 12 },
              },
              {
                words: t("It is near the left edge", "यह बाएँ किनारे के पास है"),
                region: { xMin: 0, xMax: 6, yMin: 0, yMax: 12 },
              },
              { words: t("It is 5 cm from the left edge", "यह बाएँ किनारे से 5 cm पर है"), x: 5 },
              { words: t("It is 9 cm above the bottom", "यह नीचे के किनारे से 9 cm ऊपर है"), y: 9 },
            ],
          },
        }),
      ),
      patch: hidden(
        words.body(
          t(
            "Both are true, and the dot could still be anywhere in that patch.",
            "दोनों सही हैं, और बिंदु अब भी उस हिस्से में कहीं भी हो सकता है।",
          ),
        ),
      ),
      line: hidden(
        words.body(
          t(
            "Closer, but every spot on that line is 5 cm from the left edge.",
            "पास आ गए, पर उस रेखा की हर जगह बाएँ किनारे से 5 cm पर है।",
          ),
        ),
      ),
      fixed: hidden(
        words.definition(
          t(
            "**Two distances fixed the dot:** 5 cm from the left edge and 9 cm above the bottom. Only one point is at both distances: where the two lines cross. Each distance is measured from a fixed line: the left edge and the bottom.",
            "**दो दूरियों ने बिंदु तय कर दिया:** बाएँ किनारे से 5 cm और नीचे के किनारे से 9 cm ऊपर। दोनों दूरियों पर केवल एक बिंदु है: जहाँ दोनों रेखाएँ कटती हैं। हर दूरी एक तय रेखा से नापी गई: बायाँ किनारा और नीचे का किनारा।",
          ),
        ),
      ),
    },
    standsFor: {
      sheet:
        "a notebook page squared in centimetres, with a dot on it, and the ways of saying where it is",
    },
    passBy: "rules",
    hear: {
      "sheet.clues.clueGiven": (me, _, t) => {
        const given = me.sheet.clues.given;
        return [
          ...(given.length === 2 ? [t.self.show({ name: "patch" })] : []),
          ...(given.length === 3 ? [t.self.show({ name: "line" })] : []),
          // "5 cm from the left edge" numbers the bottom edge; "9 cm above the bottom", the left.
          ...(given.includes(2) ? [t.to.sheet.plane.numberLine({ axis: "x" })] : []),
          ...(given.includes(3) ? [t.to.sheet.plane.numberLine({ axis: "y" })] : []),
        ];
      },
      "sheet.clues.pinned": (_, __, t) => [t.self.show({ name: "fixed" }), t.self.pass()],
    },
    witness: [0, 1, 2, 3].map((clue) => tap("sheet.clues", "giveClue", { clue })),
  }),
);

/** A desk is (column, row), column first: (5, 3) and (3, 5) are two different desks. */
const same = sceneWith.choice({
  name: "same",
  prompt: t(
    "Are the desks (5, 3) and (3, 5) the same desk?",
    "क्या डेस्क (5, 3) और (3, 5) एक ही डेस्क हैं?",
  ),
  options: [
    { id: "no", label: t("No: they are two different desks", "नहीं: वे दो अलग डेस्क हैं") },
    {
      id: "yes",
      label: t("Yes: they are the same desk", "हाँ: वे एक ही डेस्क हैं"),
      feedback: t(
        "The column comes first. Tap (5, 3), then (3, 5): they are in different places.",
        "स्तंभ पहले आता है। (5, 3) दबाओ, फिर (3, 5): वे अलग जगह हैं।",
      ),
    },
  ],
  answer: "no",
});

const seatingPlan = page(
  "seating-plan",
  scene({
    purpose:
      "A desk is named by its column, then its row: (5, 3) and (3, 5) use the same numbers and are two different desks. The one place the lesson asks about the order.",
    pieces: {
      title: words.title(t("Desks in a classroom", "कक्षा में डेस्क")),
      desks: words.body(
        t(
          "For the fair, the class plans who sits where to make the posters. Their classroom has 10 columns of desks and 7 rows. A desk is named by two numbers: its **column**, counted from the left, then its **row**, counted from the front (row 1 is the front row). Sonia sits in column 4, row 1, so her desk is **(4, 1)**.",
          "मेले के लिए कक्षा तय करती है कि पोस्टर बनाने कौन कहाँ बैठेगा। उनकी कक्षा में डेस्क के 10 स्तंभ और 7 पंक्तियाँ हैं। एक डेस्क दो संख्याओं से पहचानी जाती है: पहले उसका **स्तंभ**, बाईं ओर से गिना हुआ, फिर उसकी **पंक्ति**, आगे से गिनी हुई (पंक्ति 1 सबसे आगे की है)। सोनिया स्तंभ 4, पंक्ति 1 में बैठती है, तो उसकी डेस्क **(4, 1)** है।",
        ),
      ),
      tap: words.body(
        t(
          "Tap the desk at **(5, 3)**, then the one at **(3, 5)**.",
          "**(5, 3)** वाली डेस्क दबाओ, फिर **(3, 5)** वाली।",
        ),
      ),
      room: place(
        plane,
        setup(sceneClassroom(), {
          plane: {
            points: [
              {
                name: "(5, 3)",
                x: 5,
                y: 3,
                isShown: false,
                hasDropLines: false,
                tone: Tone.Accent,
              },
              {
                name: "(3, 5)",
                x: 3,
                y: 5,
                isShown: false,
                hasDropLines: false,
                tone: Tone.Accent,
              },
            ],
          },
          places: {
            places: gridOf(10, 7).map((p) =>
              p.x === 4 && p.y === 1 ? { ...p, label: t("Sonia", "सोनिया") } : p,
            ),
            showAddress: true,
            targetName: t("This desk", "यह डेस्क"),
          },
        }),
      ),
      same: hidden(same.piece),
    },
    standsFor: {
      room: "the classroom's 10 columns and 7 rows of desks, Sonia's at column 4, row 1",
    },
    hear: {
      // The desk tapped is marked with its pair; once both are marked, the question.
      "room.places.targetChosen": (me, p, t) => {
        const isAt = (q: { x: number; y: number }) => q.x === p.x && q.y === p.y;
        const marked = me.room.plane.points.find(isAt);
        const isBoth = me.room.plane.points.every((q) => q.isShown || isAt(q));
        return [
          ...(marked !== undefined ? [t.to.room.plane.showPoint({ name: marked.name })] : []),
          ...(isBoth ? [t.self.show({ name: "same" })] : []),
        ];
      },
    },
    uses: [same.use],
    witness: [
      tap("room.places", "chooseTarget", { x: 5, y: 3 }),
      tap("room.places", "chooseTarget", { x: 3, y: 5 }),
    ],
  }),
);

/** Every time, two lines at right angles did it: one across, one up. Descartes, and summary point 1. */
const route = (x: number, y: number) => [
  ...Array.from({ length: x }, (_, i) => ({ x: i + 1, y: 0 })),
  ...Array.from({ length: y }, (_, j) => ({ x, y: j + 1 })),
];
const still = { size: { maxHeight: 0.35 } } as const;

const twoLines = page(
  "two-lines",
  scene({
    purpose:
      "The house, the dot and the desk were each found with two lines at right angles, one across and one up, and two numbers: how far across, then how far up. That idea, Descartes', starts coordinate geometry.",
    pieces: {
      title: words.title(t("Two lines did it every time", "हर बार दो रेखाओं ने काम किया")),
      look: words.body(t("Look back at the three places:", "उन तीन जगहों को फिर देखो:")),
      theHouse: words.body(
        t(
          "**The house:** along the main road to Street 4, then up Street 4 to House 5.",
          "**घर:** मुख्य सड़क पर गली 4 तक, फिर गली 4 में मकान 5 तक।",
        ),
      ),
      house: place(
        plane,
        setup(sceneTown(5, 5), {
          plane: { showAxisNames: false },
          places: { showAddress: true, target: { x: 4, y: 5 } },
          walker: { at: { x: 4, y: 5 }, trail: route(4, 5), canStep: false },
        }),
        {
          ...still,
          still: t(
            "The town: Riya's route along the main road to Street 4, then up it to House 5.",
            "शहर: रिया का रास्ता, मुख्य सड़क पर गली 4 तक, फिर उसमें मकान 5 तक।",
          ),
        },
      ),
      theDot: words.body(
        t(
          "**The dot:** 5 cm across from the left edge, then 9 cm up from the bottom.",
          "**बिंदु:** बाएँ किनारे से 5 cm आड़े, फिर नीचे के किनारे से 9 cm ऊपर।",
        ),
      ),
      spot: place(
        plane,
        setup(sceneNotebook(), {
          reading: { point: null },
          clues: {
            // The dot as the student left it on dot-on-paper: both distances given, their lines crossing.
            hidden: { x: 5, y: 9 },
            isHiddenShown: true,
            clueChoices: [
              {
                words: t("The dot: 5 cm from the left edge", "बिंदु: बाएँ किनारे से 5 cm"),
                x: 5,
              },
              { words: t("9 cm above the bottom", "नीचे के किनारे से 9 cm ऊपर"), y: 9 },
            ],
            given: [0, 1],
            canGiveClues: false,
          },
        }),
        {
          ...still,
          still: t(
            "The notebook page: the dot 5 cm from the left edge and 9 cm above the bottom, each distance drawn.",
            "कॉपी का पन्ना: बिंदु बाएँ किनारे से 5 cm और नीचे के किनारे से 9 cm ऊपर, हर दूरी खिंची हुई।",
          ),
        },
      ),
      theDesk: words.body(
        t(
          "**The desk:** column 5 across, then row 3 up from the front.",
          "**डेस्क:** स्तंभ 5 आड़े, फिर आगे से पंक्ति 3 ऊपर।",
        ),
      ),
      desk: place(
        plane,
        setup(sceneClassroom(6, 4), {
          plane: {
            points: [
              { name: "(5, 3)", x: 5, y: 3, isShown: true, hasDropLines: true, tone: Tone.Accent },
            ],
          },
          places: {
            showAddress: true,
            targetName: t("The desk", "डेस्क"),
            target: { x: 5, y: 3 },
            canChooseTarget: false,
          },
        }),
        {
          ...still,
          still: t(
            "The classroom: the desk at column 5, row 3, with its distances to the front row and the first column drawn.",
            "कक्षा: स्तंभ 5, पंक्ति 3 वाली डेस्क, आगे की पंक्ति और पहले स्तंभ से उसकी दूरियाँ खिंची हुई।",
          ),
        },
      ),
      notOne: words.body(
        t(
          "The bus stayed on one line, the road, and one number said where it was. These three places are not on one line: each took **two distances, along two lines at right angles**. The first says how far along, the second how far up.",
          "बस एक ही रेखा, यानी सड़क, पर रही, और एक संख्या ने बता दिया कि वह कहाँ है। ये तीनों जगहें एक रेखा पर नहीं हैं: हर एक के लिए **दो समकोण रेखाओं के साथ दो दूरियाँ** लगीं। पहली बताती है कि कितना आगे, दूसरी कि कितना ऊपर।",
        ),
      ),
      locate: words.definition(
        t(
          "**To locate a point in a plane, we need two perpendicular lines: one horizontal, one vertical.** The point is then given by two numbers, in order: how far along the horizontal line, then how far up the vertical one.",
          "**किसी तल में एक बिंदु का स्थान बताने के लिए हमें दो लंब रेखाएँ चाहिए: एक क्षैतिज, एक ऊर्ध्वाधर।** तब बिंदु क्रम से दो संख्याओं से बताया जाता है: क्षैतिज रेखा पर कितनी दूर, फिर ऊर्ध्वाधर रेखा पर कितना ऊपर।",
        ),
      ),
      descartes: words.body(
        t(
          "This idea is the start of **coordinate geometry**. It grew from **René Descartes** (1596–1650), a French mathematician who liked to think lying in bed. He worked out how to describe the position of a point in a plane, building on the older idea of latitude and longitude. In his honour, the system of giving a point's position this way is called the **Cartesian system**.",
          "यही विचार **निर्देशांक ज्यामिति** की शुरुआत है। यह **रेने देकार्त** (1596–1650) से आया, एक फ़्रांसीसी गणितज्ञ जिन्हें लेटे-लेटे सोचना पसंद था। उन्होंने तल में किसी बिंदु का स्थान बताने का तरीका निकाला, अक्षांश और देशांतर के पुराने विचार को आगे बढ़ाकर। उनके सम्मान में, बिंदु का स्थान इस तरह बताने की पद्धति को **कार्तीय पद्धति** कहते हैं।",
        ),
      ),
    },
  }),
);

/** The pages, in reading order. */
export const overview = [busStops, streetAndHouse, dotOnPaper, seatingPlan, twoLines];

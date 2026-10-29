import { type At, page, t, wait } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/patterns";
import {
  Marks,
  PlaceKind,
  Scene,
  Tone,
  coordinatePlaneDef,
  walkerAt,
} from "@chalk/prop-coordinates";

/** Every whole-number point from (1, 1) to (across, up): the houses of a town, the desks of a class. */
const grid = (across: number, up: number) =>
  Array.from({ length: across }, (_, i) =>
    Array.from({ length: up }, (_, j) => ({ x: i + 1, y: j + 1 })),
  ).flat();

/** Where Riya stands now on this plane, and whether it is (x, y). */
type Walking = Parameters<typeof walkerAt>[0];
const isAt = (s: Walking, x: number, y: number) => {
  const p = walkerAt(s);
  return p !== null && p.x === x && p.y === y && s.walked > 0;
};

/** The town of Fig. 3.1: streets 1 to 8 leave the main road, five houses up each. */
const town = {
  // To half past the last street and house, so no number is written for a street that isn't there.
  window: { xMin: 0, xMax: 8.5, yMin: 0, yMax: 5.5 },
  marks: Marks.Counts,
  scene: Scene.Town,
  axisNames: [t("Street number", "गली नंबर"), t("House number", "मकान नंबर")] as [
    ReturnType<typeof t>,
    ReturnType<typeof t>,
  ],
  places: grid(8, 5),
  placeKind: PlaceKind.House,
  walkFrom: { x: 0, y: 0 },
};

/** Riya walks to Aman's house by his address: along the main road to his street, then up it. */
const streetAndHouse = page("street-and-house", (b) => {
  const w = wordsOn(b);
  b.purpose(
    "Find, by walking Riya there, that an address needs two numbers in a fixed order: along the main road to the street, then up it to the house. The swapped pair reaches someone else's house; the street alone leaves five houses.",
  );
  const plane = b.prop(coordinatePlaneDef, "town", { ...town, target: { x: 4, y: 5 } });
  b.standsFor(plane, "the town's map: Riya at the corner, Aman's house at Street 4, House 5");
  b.witness(
    plane.learner.setAlong({ value: 4 }),
    plane.learner.setUp({ value: 5 }),
    plane.learner.walk(),
    wait(5),
  );
  const swapped = choiceQuestion(b, {
    name: "swapped",
    prompt: t(
      "Riya mixes up the two numbers: she walks along the main road to Street 5, then up it to House 4. Where does she end up?",
      "रिया दोनों संख्याएँ उलट देती है: वह मुख्य सड़क पर गली 5 तक जाती है, फिर उसमें मकान 4 तक। वह कहाँ पहुँचती है?",
    ),
    options: [
      {
        id: "other",
        label: t("At Street 5, House 4: somebody else's house", "गली 5, मकान 4 पर: किसी और के घर"),
      },
      {
        id: "same",
        label: t(
          "At Aman's house: she used the same two numbers",
          "अमन के घर: उसने वही दो संख्याएँ इस्तेमाल कीं",
        ),
        feedback: t(
          "The first number is the street and the second is the house. Street 5, House 4 is on a different street. Set → to 5 and ↑ to 4 and walk to see.",
          "पहली संख्या गली है और दूसरी मकान। गली 5, मकान 4 दूसरी गली पर है। → को 5 और ↑ को 4 करके चलाकर देखो।",
        ),
      },
      {
        id: "lost",
        label: t("Nowhere: there is no Street 5", "कहीं नहीं: गली 5 है ही नहीं"),
        feedback: t(
          "Look under the main road: the streets go from 1 to 8, so Street 5 is there. She reaches its 4th house.",
          "मुख्य सड़क के नीचे देखो: गलियाँ 1 से 8 तक हैं, तो गली 5 है। वह उसके चौथे मकान पर पहुँचती है।",
        ),
      },
    ],
    answer: "other",
  });
  const found = w.definition(
    t(
      "**Two numbers, in order, found the house.** The first says how far along the main road: the street. The second says how far up the street: the house.",
      "**दो संख्याओं ने, क्रम से, घर ढूँढ दिया।** पहली बताती है कि मुख्य सड़क पर कितनी दूर: गली। दूसरी बताती है कि गली में कितनी दूर: मकान।",
    ),
    "found",
  );
  const anyHouse = w.body(
    t(
      "Now **tap any house** to make it Aman's. Before you walk, say the two steps out loud. Then check by walking Riya there.",
      "अब **किसी भी मकान को दबाओ** ताकि वह अमन का घर बन जाए। चलाने से पहले दोनों कदम ज़ोर से बोलो। फिर रिया को वहाँ चलाकर जाँचो।",
    ),
    "anyHouse",
  );
  const oneNumber = w.body(
    t(
      "What if Aman had said only **Street 4**? Tap the **4** under the main road.",
      "अगर अमन ने केवल **गली 4** कहा होता? मुख्य सड़क के नीचे **4** दबाओ।",
    ),
    "oneNumber",
  );
  const five = w.body(
    t(
      "**Five houses** stand on Street 4, and any of them could be his. One number isn't enough: we need both.",
      "गली 4 पर **पाँच मकान** हैं, और उनमें से कोई भी उसका हो सकता है। एक संख्या काफ़ी नहीं: हमें दोनों चाहिए।",
    ),
    "five",
  );
  const atAmans = (at: At) => isAt(at(plane), 4, 5);
  b.after(plane.on.arrived, [found, swapped], { if: atAmans });
  b.after(swapped, [anyHouse, oneNumber]);
  b.after(plane.on.lineLit, five, {
    if: (at) => at(plane).lit?.axis === "x" && at(plane).lit?.value === 4,
  });
  return [
    w.title(t("Two numbers for a place", "एक जगह के लिए दो संख्याएँ")),
    w.body(
      t(
        "Riya and Aman are in class 9, and their class is holding a stall fair. They will plan their stall at Aman's house, but Riya has never been there. Aman sends her his address: **Street 4, House 5**.",
        "रिया और अमन कक्षा 9 में हैं, और उनकी कक्षा एक स्टॉल मेला लगा रही है। वे अपना स्टॉल अमन के घर पर तय करेंगे, पर रिया वहाँ कभी नहीं गई। अमन उसे अपना पता भेजता है: **गली 4, मकान 5**।",
      ),
    ),
    w.body(
      t(
        "In their town a main road runs from west to east. Streets leave it going north, numbered 1, 2, 3, … from the west. On each street the houses are numbered 1, 2, 3, … from the main road. Riya starts at the corner where the main road begins, and she can walk only on roads.",
        "उनके शहर में एक मुख्य सड़क पश्चिम से पूर्व जाती है। उससे गलियाँ उत्तर की ओर निकलती हैं, पश्चिम से 1, 2, 3, … गिनी हुई। हर गली में मकान मुख्य सड़क से 1, 2, 3, … गिने जाते हैं। रिया उस कोने से चलती है जहाँ मुख्य सड़क शुरू होती है, और वह केवल सड़कों पर चल सकती है।",
      ),
    ),
    w.body(
      t(
        "Set how far she goes **along** the main road (→) and how far **up** the street (↑), then tap **Walk**.",
        "तय करो कि वह मुख्य सड़क पर कितना **आगे** जाए (→) और गली में कितना **ऊपर** (↑), फिर **चलो** दबाओ।",
      ),
    ),
    plane,
    found,
    swapped,
    anyHouse,
    oneNumber,
    five,
  ];
});

/** The fair ground has no roads: distances from its two fences do the job of the street and the house. */
const dotOnPaper = page("dot-on-paper", (b) => {
  const w = wordsOn(b);
  b.purpose(
    "On ground with no roads, a phrase leaves a patch and one distance leaves a whole line; two distances, from the west fence and the south fence, fix one spot. The fences do what the main road and the street did.",
  );
  const ground = b.prop(coordinatePlaneDef, "ground", {
    window: { xMin: 0, xMax: 60, yMin: 0, yMax: 40 },
    marks: Marks.None,
    scene: Scene.FairGround,
    axisNames: [t("south fence", "दक्षिणी बाड़"), t("west fence", "पश्चिमी बाड़")],
    hidden: { x: 30, y: 20 },
    clueChoices: [
      {
        words: t("In the middle of the ground", "मैदान के बीच में"),
        region: { xMin: 15, xMax: 45, yMin: 10, yMax: 30 },
      },
      { words: t("30 m from the west fence", "पश्चिमी बाड़ से 30 m"), x: 30 },
      { words: t("20 m from the south fence", "दक्षिणी बाड़ से 20 m"), y: 20 },
    ],
  });
  b.standsFor(
    ground,
    "the fair ground, with its west and south fences; the snacks stall's spot is 30 m from the west fence and 20 m from the south fence",
  );
  b.witness(
    ground.learner.giveClue({ clue: 0 }),
    ground.learner.giveClue({ clue: 1 }),
    ground.learner.giveClue({ clue: 2 }),
  );
  const fixed = w.definition(
    t(
      "**Two distances fixed the spot:** 30 m from the west fence and 20 m from the south fence. *In the middle* left a whole patch, and one distance left a whole line of spots.",
      "**दो दूरियों ने जगह तय कर दी:** पश्चिमी बाड़ से 30 m और दक्षिणी बाड़ से 20 m। *बीच में* से पूरा इलाका बचा, और एक दूरी से जगहों की पूरी रेखा।",
    ),
    "fixed",
  );
  const lamp = choiceQuestion(b, {
    name: "lamp",
    prompt: t(
      "At home, Riya wants to tell her brother exactly where her table lamp stands on her study table. Which tells him?",
      "घर पर रिया अपने भाई को बताना चाहती है कि उसका टेबल लैंप पढ़ाई की मेज़ पर ठीक कहाँ है। कौन-सा बताता है?",
    ),
    options: [
      {
        id: "two",
        label: t(
          "20 cm from the left edge and 15 cm from the front edge",
          "बाएँ किनारे से 20 cm और आगे के किनारे से 15 cm",
        ),
      },
      {
        id: "one",
        label: t("20 cm from the left edge", "बाएँ किनारे से 20 cm"),
        feedback: t(
          "Every spot 20 cm from the left edge fits: a whole line of them, like the line on the fair ground. It needs a second distance.",
          "बाएँ किनारे से 20 cm पर हर जगह ठीक बैठती है: उनकी पूरी रेखा, जैसे मेले के मैदान पर। दूसरी दूरी चाहिए।",
        ),
      },
      {
        id: "near",
        label: t("Near the back, on the left", "पीछे की ओर, बाईं तरफ़"),
        feedback: t(
          "That is a patch, like *in the middle of the ground*: many spots fit it. Distances from two edges fix one spot.",
          "यह एक इलाका है, जैसे *मैदान के बीच में*: कई जगहें ठीक बैठती हैं। दो किनारों से दूरियाँ एक जगह तय करती हैं।",
        ),
      },
    ],
    answer: "two",
  });
  b.after(ground.on.pinned, [fixed, lamp]);
  return [
    w.title(t("A spot on the fair ground", "मेले के मैदान पर एक जगह")),
    w.body(
      t(
        "Back at school, the stalls go up on the fair ground. It has no roads: just a fence along the west side and one along the south side. So how does Riya tell the volunteers where the snacks stall goes?",
        "स्कूल लौटकर, मेले के मैदान पर स्टॉल लगने हैं। वहाँ कोई सड़क नहीं: बस पश्चिम की ओर एक बाड़ और दक्षिण की ओर एक। तो रिया स्वयंसेवकों को कैसे बताए कि नाश्ते का स्टॉल कहाँ लगेगा?",
      ),
    ),
    w.body(
      t(
        "Give her messages one at a time, and watch where the stall could still go.",
        "उसके संदेश एक-एक करके दो, और देखो कि स्टॉल अब भी कहाँ लग सकता है।",
      ),
    ),
    ground,
    fixed,
    lamp,
  ];
});

/** A desk is (column, row), column first: (5, 3) and (3, 5) are two different desks. */
const seatingPlan = page("seating-plan", (b) => {
  const w = wordsOn(b);
  b.purpose(
    "A desk is named by its column, then its row: (5, 3) and (3, 5) use the same numbers and are two different desks.",
  );
  const room = b.prop(coordinatePlaneDef, "room", {
    window: { xMin: 0, xMax: 10.5, yMin: 0, yMax: 7.5 },
    marks: Marks.Counts,
    scene: Scene.Classroom,
    axisNames: [t("Column", "स्तंभ"), t("Row", "पंक्ति")],
    places: grid(10, 7).map((p) =>
      p.x === 4 && p.y === 1 ? { ...p, label: t("Sonia", "सोनिया") } : p,
    ),
    placeKind: PlaceKind.Desk,
    targetName: t("This desk", "यह डेस्क"),
    // (5, 3) and (3, 5), each marked once tapped, so both stay in view.
    points: [
      { name: "P", x: 5, y: 3, isShown: false, hasDropLines: false, tone: Tone.Accent },
      { name: "Q", x: 3, y: 5, isShown: false, hasDropLines: false, tone: Tone.Accent },
    ],
  });
  for (const [name, x, y] of [
    ["P", 5, 3],
    ["Q", 3, 5],
  ] as const)
    b.when(room.on.targetChosen, room.call.showPoint({ name }), (at) => {
      const target = at(room).target;
      return target !== null && target.x === x && target.y === y;
    });
  b.standsFor(room, "the classroom's 10 columns and 7 rows of desks, Sonia's at column 4, row 1");
  b.witness(room.learner.chooseTarget({ x: 5, y: 3 }), room.learner.chooseTarget({ x: 3, y: 5 }));
  const same = choiceQuestion(b, {
    name: "same",
    prompt: t(
      "Are the desks (5, 3) and (3, 5) the same desk?",
      "क्या डेस्क (5, 3) और (3, 5) एक ही डेस्क हैं?",
    ),
    options: [
      {
        id: "no",
        label: t(
          "No: one is in column 5, row 3; the other in column 3, row 5",
          "नहीं: एक स्तंभ 5, पंक्ति 3 में है; दूसरी स्तंभ 3, पंक्ति 5 में",
        ),
      },
      {
        id: "yes",
        label: t("Yes: both are made of the numbers 3 and 5", "हाँ: दोनों 3 और 5 से बनी हैं"),
        feedback: t(
          "The column comes first. Tap (5, 3), then (3, 5): they are in different places.",
          "स्तंभ पहले आता है। (5, 3) दबाओ, फिर (3, 5): वे अलग जगह हैं।",
        ),
      },
    ],
    answer: "no",
  });
  // Asked once both desks are marked.
  b.after(room.on.targetChosen, same, {
    if: (at) =>
      at(room).points.every(
        (p) => p.isShown || (at(room).target?.x === p.x && at(room).target?.y === p.y),
      ),
  });
  return [
    w.title(t("Desks in a classroom", "कक्षा में डेस्क")),
    w.body(
      t(
        "For the fair, the class plans who sits where to make the posters. Their classroom has 10 columns of desks and 7 rows. A desk is named by two numbers: its **column**, counted from the left, then its **row**, counted from the front. Sonia sits in column 4, row 1, so her desk is **(4, 1)**. The teacher's desk stands in front, outside the plan.",
        "मेले के लिए कक्षा तय करती है कि पोस्टर बनाने कौन कहाँ बैठेगा। उनकी कक्षा में डेस्क के 10 स्तंभ और 7 पंक्तियाँ हैं। एक डेस्क दो संख्याओं से पहचानी जाती है: पहले उसका **स्तंभ**, बाईं ओर से गिना हुआ, फिर उसकी **पंक्ति**, आगे से गिनी हुई। सोनिया स्तंभ 4, पंक्ति 1 में बैठती है, तो उसकी डेस्क **(4, 1)** है। शिक्षक की मेज़ आगे है, योजना से बाहर।",
      ),
    ),
    w.body(
      t(
        "Tap the desk at **(5, 3)**, then the one at **(3, 5)**.",
        "**(5, 3)** वाली डेस्क दबाओ, फिर **(3, 5)** वाली।",
      ),
    ),
    room,
    same,
  ];
});

/** Ex 3.1 Q2: in a city of crossing streets, (4, 3) and (3, 4) are one crossing each, and different. */
const crossStreets = page("cross-streets", (b) => {
  const w = wordsOn(b);
  b.purpose(
    "In a city of 5 streets each way, only one crossing is (4, 3) and only one is (3, 4), and they are different crossings.",
  );
  const city = b.prop(coordinatePlaneDef, "city", {
    window: { xMin: 0, xMax: 5.5, yMin: 0, yMax: 5.5 },
    marks: Marks.Counts,
    hasGrid: true,
    axisNames: [t("North–south street", "उत्तर–दक्षिण गली"), t("East–west street", "पूर्व–पश्चिम गली")],
    places: grid(5, 5),
    placeKind: PlaceKind.Crossing,
    canChooseTarget: false,
    walkFrom: { x: 0, y: 0 },
    points: [
      { name: "A", x: 2, y: 5, isShown: false, hasDropLines: false, tone: Tone.Accent },
      { name: "B", x: 4, y: 3, isShown: false, hasDropLines: false, tone: Tone.Accent },
      { name: "C", x: 3, y: 4, isShown: false, hasDropLines: false, tone: Tone.Accent },
    ],
  });
  b.standsFor(
    city,
    "the city: 5 north–south and 5 east–west streets, 200 m apart, Riya at the centre",
  );
  // Each crossing she reaches stays marked.
  for (const [name, x, y] of [
    ["A", 2, 5],
    ["B", 4, 3],
    ["C", 3, 4],
  ] as const)
    b.when(city.on.arrived, city.call.showPoint({ name }), (at) => isAt(at(city), x, y));
  b.witness(
    city.learner.setAlong({ value: 2 }),
    city.learner.setUp({ value: 5 }),
    city.learner.walk(),
    wait(5),
    city.learner.setAlong({ value: 4 }),
    city.learner.setUp({ value: 3 }),
    city.learner.walk(),
    wait(5),
  );
  const one = choiceQuestion(b, {
    name: "one",
    prompt: t(
      "How many cross-streets in this city can be called (4, 3)?",
      "इस शहर में कितने चौराहों को (4, 3) कहा जा सकता है?",
    ),
    options: [
      { id: "one", label: t("One", "एक") },
      {
        id: "two",
        label: t("Two: (4, 3) and (3, 4)", "दो: (4, 3) और (3, 4)"),
        feedback: t(
          "(4, 3) means the 4th north–south street and the 3rd east–west street. Those two streets cross only once.",
          "(4, 3) का मतलब है चौथी उत्तर–दक्षिण गली और तीसरी पूर्व–पश्चिम गली। ये दो गलियाँ केवल एक बार मिलती हैं।",
        ),
      },
      {
        id: "five",
        label: t("Five: every crossing on the 4th street", "पाँच: चौथी गली का हर चौराहा"),
        feedback: t(
          "That is what 4 alone would leave. The 3 picks one of those five crossings.",
          "यह केवल 4 से बचता। 3 उन पाँच चौराहों में से एक चुनता है।",
        ),
      },
    ],
    answer: "one",
    keepOrder: true,
  });
  b.after(city.on.arrived, one, { if: (at) => isAt(at(city), 4, 3) });
  b.witness(
    city.learner.setAlong({ value: 3 }),
    city.learner.setUp({ value: 4 }),
    city.learner.walk(),
    wait(5),
  );
  const other = choiceQuestion(b, {
    name: "other",
    prompt: t(
      "And how many can be called (3, 4)? Is it the same crossing as (4, 3)?",
      "और कितनों को (3, 4) कहा जा सकता है? क्या यह (4, 3) वाला ही चौराहा है?",
    ),
    options: [
      { id: "oneOther", label: t("One, and a different crossing", "एक, और अलग चौराहा") },
      {
        id: "oneSame",
        label: t("One, the same crossing as (4, 3)", "एक, (4, 3) वाला ही चौराहा"),
        feedback: t(
          "Look where Riya stopped: B is on the 4th north–south street, C on the 3rd. Two crossings.",
          "देखो रिया कहाँ रुकी: B चौथी उत्तर–दक्षिण गली पर है, C तीसरी पर। दो चौराहे।",
        ),
      },
      {
        id: "none",
        label: t("None: (3, 4) is (4, 3) written wrongly", "कोई नहीं: (3, 4) तो (4, 3) गलत लिखा है"),
        feedback: t(
          "(3, 4) is a crossing of its own: the 3rd north–south street meets the 4th east–west street there.",
          "(3, 4) अपना अलग चौराहा है: वहाँ तीसरी उत्तर–दक्षिण गली चौथी पूर्व–पश्चिम गली से मिलती है।",
        ),
      },
    ],
    answer: "oneOther",
  });
  b.after(city.on.arrived, other, { if: (at) => isAt(at(city), 3, 4) });
  return [
    w.title(t("Cross-streets", "चौराहे")),
    w.body(
      t(
        "Aman's cousin lives in a city where two main roads cross at the centre, one north–south and one east–west. Other streets run beside them, 200 m apart: 5 each way. Where the 2nd north–south street meets the 5th east–west street is the cross-street **(2, 5)**.",
        "अमन का चचेरा भाई एक ऐसे शहर में रहता है जहाँ दो मुख्य सड़कें बीच में मिलती हैं, एक उत्तर–दक्षिण और एक पूर्व–पश्चिम। उनके साथ-साथ और गलियाँ हैं, 200 m दूर: हर तरफ़ 5। जहाँ दूसरी उत्तर–दक्षिण गली पाँचवीं पूर्व–पश्चिम गली से मिलती है, वह चौराहा **(2, 5)** है।",
      ),
    ),
    w.body(
      t(
        "Riya starts at the centre. Walk her to **(2, 5)**, then to **(4, 3)**, then to **(3, 4)**. Each crossing she reaches stays marked.",
        "रिया बीच से चलती है। उसे **(2, 5)** तक चलाओ, फिर **(4, 3)** तक, फिर **(3, 4)** तक। जिस चौराहे पर वह पहुँचती है, वह चिह्नित रहता है।",
      ),
    ),
    city,
    one,
    other,
  ];
});

/** Every time, two lines at right angles did it: one across, one up. Descartes, and summary point 1. */
const twoLines = page("two-lines", (b) => {
  const w = wordsOn(b);
  b.purpose(
    "The house, the stall's spot and the desk were each found with two lines at right angles, one across and one up, and two numbers: how far across, then how far up. That idea, Descartes', starts coordinate geometry.",
  );
  /** A picture of one place found earlier: its plane, still, with the place's two distances drawn. */
  const still = (
    name: string,
    given: Parameters<typeof b.prop<typeof coordinatePlaneDef>>[2],
    says: ReturnType<typeof t>,
  ) => b.prop(coordinatePlaneDef, name, given, { still: says, size: { maxHeight: 0.35 } });
  const mark = (x: number, y: number) => [
    { name: "", x, y, isShown: true, hasDropLines: true, tone: Tone.Accent },
  ];
  const house = still(
    "house",
    {
      window: { xMin: 0, xMax: 5.5, yMin: 0, yMax: 5.5 },
      marks: Marks.Counts,
      scene: Scene.Town,
      axisNames: town.axisNames,
      showAxisNames: false,
      places: [{ x: 4, y: 5 }],
      target: { x: 4, y: 5 },
      canChooseTarget: false,
    },
    t(
      "The town: the main road across, the street up, and Aman's house at Street 4, House 5.",
      "शहर: मुख्य सड़क आड़ी, गली खड़ी, और अमन का घर गली 4, मकान 5 पर।",
    ),
  );
  const spot = still(
    "spot",
    {
      window: { xMin: 0, xMax: 60, yMin: 0, yMax: 40 },
      marks: Marks.None,
      scene: Scene.FairGround,
      showAxisNames: false,
      points: mark(30, 20).map((p) => ({ ...p, name: "S" })),
    },
    t(
      "The fair ground: the south fence across, the west fence up, and the stall 30 m from one and 20 m from the other.",
      "मेले का मैदान: दक्षिणी बाड़ आड़ी, पश्चिमी बाड़ खड़ी, और स्टॉल एक से 30 m और दूसरी से 20 m पर।",
    ),
  );
  const desk = still(
    "desk",
    {
      window: { xMin: 0, xMax: 6.5, yMin: 0, yMax: 4.5 },
      marks: Marks.Counts,
      scene: Scene.Classroom,
      showAxisNames: false,
      places: [{ x: 5, y: 3 }],
      placeKind: PlaceKind.Desk,
      axisNames: [t("Column", "स्तंभ"), t("Row", "पंक्ति")],
      targetName: t("The desk", "डेस्क"),
      target: { x: 5, y: 3 },
      canChooseTarget: false,
    },
    t(
      "The classroom: the front row across, the first column up, and the desk at column 5, row 3.",
      "कक्षा: आगे की पंक्ति आड़ी, पहला स्तंभ खड़ा, और डेस्क स्तंभ 5, पंक्ति 3 पर।",
    ),
  );
  return [
    w.title(t("Two lines did it every time", "हर बार दो रेखाओं ने काम किया")),
    w.body(t("Look back at the three places you found:", "उन तीन जगहों को फिर देखो जो तुमने ढूँढीं:")),
    w.body(
      t(
        "**The house:** the main road across, the street up. Street 4, House 5.",
        "**घर:** मुख्य सड़क आड़ी, गली खड़ी। गली 4, मकान 5।",
      ),
    ),
    house,
    w.body(
      t(
        "**The stall:** the south fence across, the west fence up. 30 m, then 20 m.",
        "**स्टॉल:** दक्षिणी बाड़ आड़ी, पश्चिमी बाड़ खड़ी। 30 m, फिर 20 m।",
      ),
    ),
    spot,
    w.body(
      t(
        "**The desk:** the front row across, the first column up. Column 5, row 3.",
        "**डेस्क:** आगे की पंक्ति आड़ी, पहला स्तंभ खड़ा। स्तंभ 5, पंक्ति 3।",
      ),
    ),
    desk,
    w.body(
      t(
        "Each time, two lines at right angles did it: **one across** and **one up**. The first number says how far across, the second how far up.",
        "हर बार दो समकोण रेखाओं ने काम किया: **एक आड़ी** और **एक खड़ी**। पहली संख्या बताती है कि आड़े कितनी दूर, दूसरी कि ऊपर कितनी।",
      ),
    ),
    w.definition(
      t(
        "**To locate a point in a plane, we need two perpendicular lines: one horizontal, one vertical.** The point is then given by two numbers, in order: how far along the horizontal line, then how far up the vertical one.",
        "**किसी तल में एक बिंदु का स्थान बताने के लिए हमें दो लंब रेखाएँ चाहिए: एक क्षैतिज, एक ऊर्ध्वाधर।** तब बिंदु क्रम से दो संख्याओं से बताया जाता है: क्षैतिज रेखा पर कितनी दूर, फिर ऊर्ध्वाधर रेखा पर कितना ऊपर।",
      ),
    ),
    w.body(
      t(
        "This idea is the start of **coordinate geometry**. It grew from **René Descartes** (1596–1650), a French mathematician who liked to think lying in bed. He worked out how to describe the position of a point in a plane, building on the older idea of latitude and longitude. In his honour, the system of giving a point's position this way is called the **Cartesian system**.",
        "यही विचार **निर्देशांक ज्यामिति** की शुरुआत है। यह **रेने देकार्त** (1596–1650) से आया, एक फ़्रांसीसी गणितज्ञ जिन्हें लेटे-लेटे सोचना पसंद था। उन्होंने तल में किसी बिंदु का स्थान बताने का तरीका निकाला, अक्षांश और देशांतर के पुराने विचार को आगे बढ़ाकर। उनके सम्मान में, बिंदु का स्थान इस तरह बताने की पद्धति को **कार्तीय पद्धति** कहते हैं।",
      ),
    ),
  ];
});

/** The pages, in reading order. */
export const overview = [streetAndHouse, dotOnPaper, seatingPlan, crossStreets, twoLines];

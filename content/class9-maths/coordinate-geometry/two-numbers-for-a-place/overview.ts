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

/** On paper there are no roads: the same two numbers are distances from two edges. */
const dotOnPaper = page("dot-on-paper", (b) => {
  const w = wordsOn(b);
  b.purpose(
    "On a sheet with no roads, words like 'upper half' leave a region and one distance leaves a whole line; two distances, from the left edge and the bottom edge, fix the dot.",
  );
  const sheet = b.prop(coordinatePlaneDef, "sheet", {
    window: { xMin: 0, xMax: 12, yMin: 0, yMax: 16 },
    marks: Marks.None,
    scene: Scene.Paper,
    axisNames: [t("bottom edge", "नीचे का किनारा"), t("left edge", "बायाँ किनारा")],
    hidden: { x: 5, y: 9 },
    clueChoices: [
      {
        words: t("In the upper half", "ऊपरी आधे में"),
        region: { xMin: 0, xMax: 12, yMin: 8, yMax: 16 },
      },
      {
        words: t("Near the left edge", "बाएँ किनारे के पास"),
        region: { xMin: 0, xMax: 6, yMin: 0, yMax: 16 },
      },
      { words: t("5 cm from the left edge", "बाएँ किनारे से 5 cm"), x: 5 },
      { words: t("9 cm above the bottom edge", "नीचे के किनारे से 9 cm ऊपर"), y: 9 },
    ],
    canHide: true,
  });
  b.standsFor(
    sheet,
    "a sheet of paper with a dot hidden 5 cm from the left edge and 9 cm above the bottom edge",
  );
  b.witness(sheet.learner.giveClue({ clue: 2 }), sheet.learner.giveClue({ clue: 3 }));
  const fixed = w.definition(
    t(
      "**Two distances fixed the dot:** 5 cm from the left edge and 9 cm above the bottom edge. Words like *upper half* left a whole region, and one distance left a whole line.",
      "**दो दूरियों ने बिंदु तय कर दिया:** बाएँ किनारे से 5 cm और नीचे के किनारे से 9 cm ऊपर। *ऊपरी आधा* जैसे शब्दों से पूरा इलाका बचा, और एक दूरी से पूरी रेखा।",
    ),
    "fixed",
  );
  const message = choiceQuestion(b, {
    name: "message",
    prompt: t(
      "The fair is on the school ground, which has a fence on the west side and one on the south side. Which message puts the snacks stall in exactly one place?",
      "मेला स्कूल के मैदान में है, जिसकी पश्चिम और दक्षिण ओर बाड़ है। कौन-सा संदेश नाश्ते के स्टॉल को ठीक एक जगह रखता है?",
    ),
    options: [
      {
        id: "two",
        label: t(
          "30 m from the west fence and 20 m from the south fence",
          "पश्चिमी बाड़ से 30 m और दक्षिणी बाड़ से 20 m",
        ),
      },
      {
        id: "one",
        label: t("30 m from the west fence", "पश्चिमी बाड़ से 30 m"),
        feedback: t(
          "Every spot 30 m from the west fence fits: a whole line of them, like the upright line on the sheet. It needs a second distance.",
          "पश्चिमी बाड़ से 30 m पर हर जगह ठीक बैठती है: उनकी पूरी रेखा, जैसे कागज़ पर खड़ी रेखा। दूसरी दूरी चाहिए।",
        ),
      },
      {
        id: "near",
        label: t("Near the gate, in the north-east corner", "गेट के पास, उत्तर-पूर्वी कोने में"),
        feedback: t(
          "'Near the gate' is a region, like 'upper half' on the sheet: many spots fit it. Distances from the two fences fix one spot.",
          "'गेट के पास' एक इलाका है, जैसे कागज़ पर 'ऊपरी आधा': कई जगहें ठीक बैठती हैं। दोनों बाड़ों से दूरियाँ एक जगह तय करती हैं।",
        ),
      },
    ],
    answer: "two",
  });
  const yours = w.body(
    t(
      "Now hide a dot of your own: tap anywhere on the sheet. Tell a friend where it is with two distances, and let them find it.",
      "अब अपना एक बिंदु छिपाओ: कागज़ पर कहीं भी दबाओ। किसी दोस्त को दो दूरियों से बताओ कि वह कहाँ है, और उसे ढूँढने दो।",
    ),
    "yours",
  );
  b.after(sheet.on.pinned, [fixed, message]);
  b.after(message, yours);
  return [
    w.title(t("A dot on a sheet", "कागज़ पर एक बिंदु")),
    w.body(
      t(
        "Back at school, Riya sends the class group a message: *Our stall goes near the gate.* Three friends carry tables to three different places. The message didn't fix the place.",
        "स्कूल लौटकर रिया कक्षा के ग्रुप में संदेश भेजती है: *हमारा स्टॉल गेट के पास लगेगा।* तीन दोस्त तीन अलग जगह मेज़ ले जाते हैं। संदेश से जगह तय नहीं हुई।",
      ),
    ),
    w.body(
      t(
        "A sheet of paper has no streets. A dot is hidden on this one. Give the clues one at a time, and watch where the dot could still be.",
        "कागज़ पर कोई गली नहीं होती। इस कागज़ पर एक बिंदु छिपा है। सुराग एक-एक करके दो, और देखो कि बिंदु अब भी कहाँ हो सकता है।",
      ),
    ),
    sheet,
    fixed,
    message,
    yours,
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
  });
  b.standsFor(room, "the classroom's 10 columns and 7 rows of desks, Sonia's at column 4, row 1");
  b.witness(room.learner.chooseTarget({ x: 5, y: 3 }));
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
  b.after(room.on.targetChosen, same);
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

/** Every time, two perpendicular lines did it. Descartes, and summary point 1. */
const twoLines = page("two-lines", (b) => {
  const w = wordsOn(b);
  b.purpose(
    "The house, the dot and the desk were each found with two lines at right angles and two numbers in order: that idea, Descartes', starts coordinate geometry.",
  );
  return [
    w.title(t("Two lines did it every time", "हर बार दो रेखाओं ने काम किया")),
    w.body(t("Look back at how each place was found:", "देखो हर जगह कैसे मिली:")),
    w.body(
      t(
        "**The house:** the main road and the street, at right angles. Street 4, House 5.",
        "**घर:** मुख्य सड़क और गली, एक-दूसरे से समकोण पर। गली 4, मकान 5।",
      ),
    ),
    w.body(
      t(
        "**The dot:** the bottom edge and the left edge of the sheet, at right angles. 5 cm from one, 9 cm from the other.",
        "**बिंदु:** कागज़ का नीचे का और बायाँ किनारा, समकोण पर। एक से 5 cm, दूसरे से 9 cm।",
      ),
    ),
    w.body(
      t(
        "**The desk:** the columns and the rows, at right angles. Column 5, row 3.",
        "**डेस्क:** स्तंभ और पंक्तियाँ, समकोण पर। स्तंभ 5, पंक्ति 3।",
      ),
    ),
    w.definition(
      t(
        "**To locate a point in a plane, we need two perpendicular lines.** Its position is then given by two numbers, in order.",
        "**किसी तल में एक बिंदु का स्थान बताने के लिए हमें दो लंब रेखाएँ चाहिए।** तब उसका स्थान क्रम से दो संख्याओं से बताया जाता है।",
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

import { page, t } from "@chalk/author";
import { wordsOn } from "@chalk/patterns";
import { coordinatePlaneDef } from "@chalk/prop-coordinates";

const r = String.raw;

/**
 * NCERT 3.1 (with Fig 3.5 from 3.2 first, as the chapter's first line asks): on a line one number
 * fixes a point; in a plane it takes two, measured from two perpendicular lines. Discover → state:
 * the number line, then a dot on paper, a house on a street and a cinema seat, each needing two
 * numbers; then the idea named: coordinate geometry, the Cartesian system.
 */

/** Fig 3.5: the number line the student already knows. One number is enough on a line. */
const numberLine = page("number-line", (b) => {
  const w = wordsOn(b);
  b.purpose(
    "Start from what the class knows: on a number line, distances from O are marked in equal units, positive one way and negative the other; 3 is 3 units right of O and −3 is 3 units left. On a line, one number fixes a point.",
  );
  const line = b.prop(coordinatePlaneDef, "line", {
    isNumberLine: true,
    canSetNumbers: true,
    x: 0,
    y: 0,
    showQuadrants: false,
    // The point's own name on the stepper: x isn't defined yet.
    xName: t("P", "P"),
  });
  b.standsFor(line, "a number line with P on it, moved by drag or stepper");
  return [
    w.title(t("Two numbers for a place", "एक जगह के लिए दो संख्याएँ")),
    w.body(
      t(
        "You already know how to find a point on a **number line**. Pick a point O, the **origin**, and mark equal units from it: positive numbers to the right, negative numbers to the left.",
        "तुम **संख्या रेखा** पर बिंदु ढूँढना जानते हो। एक बिंदु O चुनो, **मूलबिंदु**, और उससे बराबर इकाइयाँ अंकित करो: धनात्मक संख्याएँ दाईं ओर, ऋणात्मक संख्याएँ बाईं ओर।",
      ),
    ),
    w.body(
      t(
        "Move P to 3, then to −3. Both are 3 units from O, on opposite sides.",
        "P को 3 पर ले जाओ, फिर −3 पर। दोनों O से 3 इकाई दूर हैं, उलटी ओर।",
      ),
    ),
    line,
    w.note(
      t(
        "On a line, **one number** is enough to say exactly where a point is.",
        "रेखा पर, बिंदु कहाँ है, यह बताने के लिए **एक संख्या** काफ़ी है।",
      ),
    ),
  ];
});

/** Fig 3.2: a dot on a sheet; one distance is a whole line of places, two fix the dot. */
const paper = page("paper", (b) => {
  const w = wordsOn(b);
  b.purpose(
    "A dot on a sheet: 'near the left edge' fixes nothing; '5 cm from the left edge' is a whole line of places; '9 cm from the bottom' as well fixes it exactly (Fig 3.2). Two distances, from two fixed lines.",
  );
  const sheet = b.prop(coordinatePlaneDef, "sheet", {
    xMin: 0,
    xMax: 10,
    yMin: 0,
    yMax: 12,
    scene: "notebook",
    x: 5,
    y: 9,
    isXKnown: false,
    isYKnown: false,
    canSetNumbers: true,
    showLines: true,
    showPerpendiculars: false,
    showQuadrants: false,
    pointName: "D",
    xName: t("from left", "बाएँ से"),
    yName: t("from bottom", "नीचे से"),
  });
  b.standsFor(
    sheet,
    "a sheet of paper in cm: give the distance from the left edge, then from the bottom",
  );
  return [
    w.title(t("A dot on a page", "पन्ने पर एक बिंदु")),
    w.body(
      t(
        "A sheet of paper is not a line. Put a dot D on it. How would you tell a friend exactly where it is?",
        "काग़ज़ का पन्ना रेखा नहीं है। उस पर एक बिंदु D लगाओ। किसी दोस्त को ठीक-ठीक कैसे बताओगे कि वह कहाँ है?",
      ),
    ),
    w.body(
      t(
        '"Near the left edge" doesn\'t fix it. Give its distance from the **left edge**, 5 cm. That is still a whole line of places. Now give its distance from the **bottom**, 9 cm.',
        '"बाएँ किनारे के पास" से वह तय नहीं होता। **बाएँ किनारे** से उसकी दूरी दो, 5 cm। यह अब भी जगहों की एक पूरी रेखा है। अब **नीचे** से उसकी दूरी दो, 9 cm।',
      ),
    ),
    sheet,
    w.note(
      t(
        "Two distances, measured from **two fixed lines** (the left edge and the bottom), fix the dot exactly.",
        "**दो तय रेखाओं** (बायाँ किनारा और नीचे का किनारा) से नापी गई दो दूरियाँ बिंदु को ठीक-ठीक तय करती हैं।",
      ),
    ),
  ];
});

/** Fig 3.1: a street and a house number. */
const street = page("street", (b) => {
  const w = wordsOn(b);
  b.purpose(
    "Street 2 alone is a whole line of houses; street 2 and house 5 is one house, H (Fig 3.1). Two pieces of information, and the street comes first.",
  );
  const map = b.prop(coordinatePlaneDef, "map", {
    xMin: 0,
    xMax: 8,
    yMin: 0,
    yMax: 8,
    scene: "colony",
    marks: [{ x: 7, y: 4, name: "P" }],
    x: 2,
    y: 5,
    isXKnown: false,
    isYKnown: false,
    canSetNumbers: true,
    showLines: true,
    showPerpendiculars: false,
    showQuadrants: false,
    pointName: "H",
    xName: t("Street", "गली"),
    yName: t("House", "मकान"),
  });
  b.standsFor(map, "streets numbered across and houses numbered along each street");
  return [
    w.title(t("A house in a colony", "कॉलोनी में एक मकान")),
    w.body(
      t(
        "A friend lives on **Street 2**. Can you find her house? Set the street, then her **house number, 5**.",
        "एक दोस्त **गली 2** में रहती है। क्या तुम उसका मकान ढूँढ सकते हो? गली चुनो, फिर उसका **मकान नंबर, 5**।",
      ),
    ),
    map,
    w.note(
      t(
        "Street 2 alone is a whole row of houses. Street 2 **and** house 5 is one house, H. Street 7, house 4 is another, P.",
        "केवल गली 2 मकानों की पूरी कतार है। गली 2 **और** मकान 5 एक मकान है, H। गली 7, मकान 4 दूसरा है, P।",
      ),
    ),
  ];
});

/** Activity 1, the seating plan, as a cinema ticket: the order of the two numbers matters. */
const cinema = page("cinema", (b) => {
  const w = wordsOn(b);
  b.purpose(
    "A seat needs two numbers, its seat number and its row (Activity 1's seating plan; a cinema ticket in the student's world). Swapping them gives another seat: which number comes first matters.",
  );
  const hall = b.prop(coordinatePlaneDef, "hall", {
    xMin: 0,
    xMax: 10,
    yMin: 0,
    yMax: 8,
    scene: "cinema",
    x: 7,
    y: 4,
    canSetNumbers: true,
    canWalk: true,
    isMovable: false,
    showPerpendiculars: false,
    showQuadrants: false,
    pointName: "T",
    xName: t("Seat", "सीट"),
    yName: t("Row", "पंक्ति"),
    walkLabel: t("Find my seat", "मेरी सीट ढूँढो"),
    swapLabel: t("Swap seat and row", "सीट और पंक्ति की अदला-बदली करो"),
  });
  b.standsFor(
    hall,
    "a cinema hall: seat numbers across, rows going back; find the seat on the ticket",
  );
  return [
    w.title(t("Which number first?", "पहले कौन-सी संख्या?")),
    w.body(
      t(
        "A cinema ticket says **Seat 7, Row 4**. Call that seat T. Find it: first along the seats, then back along the rows.",
        "सिनेमा टिकट पर लिखा है **सीट 7, पंक्ति 4**। उस सीट को T कहो। उसे ढूँढो: पहले सीटों के साथ-साथ, फिर पंक्तियों में पीछे।",
      ),
    ),
    hall,
    w.body(
      t(
        "Now swap the two numbers: Seat 4, Row 7 is somebody else's seat. In your classroom too, the desk in column 5 and row 3 is written $(5, 3)$, column first. It is not the desk at $(3, 5)$.",
        "अब दोनों संख्याओं की अदला-बदली करो: सीट 4, पंक्ति 7 किसी और की सीट है। तुम्हारी कक्षा में भी, स्तंभ 5 और पंक्ति 3 वाली डेस्क $(5, 3)$ लिखी जाती है, स्तंभ पहले। यह $(3, 5)$ वाली डेस्क नहीं है।",
      ),
    ),
    w.note(
      t(
        "Two numbers fix a place, and **which comes first** matters.",
        "दो संख्याएँ जगह तय करती हैं, और **कौन-सी पहले आती है**, यह मायने रखता है।",
      ),
    ),
  ];
});

/** The idea named; Exercise 3.1 Q2 (cross-streets) worked. */
const descartes = page("coordinate-geometry", (b) => {
  const w = wordsOn(b);
  b.purpose(
    "Name the idea: the position of a point in a plane is described by two perpendicular reference lines; this is coordinate geometry, also called the Cartesian system after Descartes. Exercise 3.1 Q2 worked: (4, 3) and (3, 4) are each one cross-street, and different ones.",
  );
  return [
    w.title(t("Coordinate geometry", "निर्देशांक ज्यामिति")),
    w.definition(
      t(
        "To describe the position of a point in a plane, we use **two perpendicular lines** as references, and give its distance from each. This idea is the start of **coordinate geometry**.",
        "समतल में किसी बिंदु की स्थिति बताने के लिए हम **दो लंब रेखाओं** को आधार बनाते हैं, और हर एक से उसकी दूरी बताते हैं। यही विचार **निर्देशांक ज्यामिति** की शुरुआत है।",
      ),
      "idea",
    ),
    w.body(
      t(
        "The French mathematician René Descartes (1596–1650) worked it out, building on latitude and longitude. So this way of describing points is also called the **Cartesian system**.",
        "फ़्रांसीसी गणितज्ञ रेने देकार्त (1596–1650) ने इसे खोजा, अक्षांश और देशांतर के विचार से आगे बढ़कर। इसलिए बिंदुओं को बताने के इस तरीक़े को **कार्तीय पद्धति** भी कहते हैं।",
      ),
    ),
    w.body(
      t(
        "**Example.** A city has 5 streets running North–South and 5 running East–West. The crossing of the 2nd North–South street and the 5th East–West street is called the cross-street $(2, 5)$.",
        "**उदाहरण।** एक शहर में 5 गलियाँ उत्तर–दक्षिण और 5 पूर्व–पश्चिम चलती हैं। दूसरी उत्तर–दक्षिण गली और पाँचवीं पूर्व–पश्चिम गली का चौराहा $(2, 5)$ कहलाता है।",
      ),
    ),
    w.body(
      t(
        r`How many cross-streets are $(4, 3)$? Only **one**: the 4th North–South street meets the 3rd East–West street at one place. And $(3, 4)$? Also only one, but a **different** crossing: the 3rd North–South street and the 4th East–West street.`,
        r`$(4, 3)$ कितने चौराहे हैं? केवल **एक**: चौथी उत्तर–दक्षिण गली तीसरी पूर्व–पश्चिम गली से एक ही जगह मिलती है। और $(3, 4)$? वह भी एक, पर **अलग** चौराहा: तीसरी उत्तर–दक्षिण गली और चौथी पूर्व–पश्चिम गली।`,
      ),
    ),
  ];
});

/** The pages, in reading order. */
export const overview = [numberLine, paper, street, cinema, descartes];

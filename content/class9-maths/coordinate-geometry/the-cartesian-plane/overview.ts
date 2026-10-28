import { page, t } from "@chalk/author";
import { wordsOn } from "@chalk/patterns";
import { coordinatePlaneDef } from "@chalk/prop-coordinates";

/**
 * NCERT 3.2 to Fig 3.9: two number lines placed perpendicular, crossing at their zeros, are the
 * axes; their crossing is the origin; they cut the plane into four quadrants. State → see it hold:
 * the student builds the plane from a number line, then meets each name on it.
 */

/** Figs 3.6–3.8: a second number line through O, upright, makes the plane. */
const twoLines = page("two-number-lines", (b) => {
  const w = wordsOn(b);
  b.purpose(
    "Descartes' idea: take two number lines, one horizontal and one vertical, and make them cross at their zeros (Figs 3.7–3.8). The plane is built from two number lines the student already knows.",
  );
  const line = b.prop(coordinatePlaneDef, "line", {
    isNumberLine: true,
    canAddYAxis: true,
    x: 0,
    y: 0,
    isXKnown: false,
    isYKnown: false,
    showAxisEnds: true,
    isMovable: false,
    showQuadrants: false,
    showPerpendiculars: false,
    showReadout: false,
  });
  b.standsFor(line, "a number line; a button puts a second number line through O, upright");
  return [
    w.title(t("The Cartesian plane", "कार्तीय तल")),
    w.body(
      t(
        "A place in a plane needs two numbers from two perpendicular lines. Descartes' idea: make both lines **number lines**.",
        "समतल में एक जगह के लिए दो लंब रेखाओं से दो संख्याएँ चाहिए। देकार्त का विचार: दोनों रेखाओं को **संख्या रेखाएँ** बना दो।",
      ),
    ),
    w.body(
      t(
        "Take one number line, horizontal: call it X′X. Then add a second one, vertical, Y′Y, so that the two cross at their zeros. Two perpendicular lines could point any way; in this chapter one is always horizontal and the other vertical.",
        "एक संख्या रेखा लो, क्षैतिज: उसे X′X कहो। फिर दूसरी जोड़ो, ऊर्ध्वाधर, Y′Y, ऐसे कि दोनों एक-दूसरे को अपने शून्यों पर काटें। दो लंब रेखाएँ किसी भी दिशा में हो सकती हैं; इस अध्याय में एक हमेशा क्षैतिज और दूसरी ऊर्ध्वाधर है।",
      ),
    ),
    line,
  ];
});

/** Fig 3.8: the names: x-axis, y-axis, origin, positive and negative directions. */
const axes = page("axes", (b) => {
  const w = wordsOn(b);
  b.purpose(
    "Name the parts (Fig 3.8): the horizontal line X′X is the x-axis, the vertical line Y′Y the y-axis, their crossing the origin O; OX and OY are the positive directions, OX′ and OY′ the negative ones.",
  );
  const plane = b.prop(coordinatePlaneDef, "plane", {
    isXKnown: false,
    isYKnown: false,
    showQuadrants: false,
    showPerpendiculars: false,
    showReadout: false,
    showAxisEnds: true,
  });
  b.standsFor(plane, "the two axes, X′X and Y′Y, crossing at O");
  return [
    w.title(t("Axes and origin", "अक्ष और मूलबिंदु")),
    plane,
    w.definition(
      t(
        "The horizontal line X′X is the **x-axis**. The vertical line Y′Y is the **y-axis**. The point where they cross is the **origin**, O. Together they are the **coordinate axes**.",
        "क्षैतिज रेखा X′X **x-अक्ष** है। ऊर्ध्वाधर रेखा Y′Y **y-अक्ष** है। जहाँ वे काटती हैं, वह बिंदु **मूलबिंदु** O है। दोनों मिलकर **निर्देशांक अक्ष** हैं।",
      ),
      "axes",
    ),
    w.body(
      t(
        "The positive numbers lie along OX and OY, so these are the **positive directions** of the x-axis and the y-axis. OX′ and OY′ are the **negative directions**.",
        "धनात्मक संख्याएँ OX और OY की ओर हैं, इसलिए ये x-अक्ष और y-अक्ष की **धनात्मक दिशाएँ** हैं। OX′ और OY′ **ऋणात्मक दिशाएँ** हैं।",
      ),
    ),
  ];
});

/** Fig 3.9: the four quadrants, numbered anticlockwise; the plane's names; Exercise 3.2 Q1. */
const quadrants = page("quadrants", (b) => {
  const w = wordsOn(b);
  b.purpose(
    "The axes cut the plane into four quadrants, numbered I, II, III, IV anticlockwise from OX (Fig 3.9). Dragging P shows which quadrant it is in. The plane is the Cartesian plane, coordinate plane or xy-plane. Exercise 3.2 Q1 answered.",
  );
  const plane = b.prop(coordinatePlaneDef, "plane", {
    x: 4,
    y: 3,
    showPerpendiculars: false,
  });
  b.standsFor(plane, "the plane in four quadrants; drag P and the quadrant it is in lights up");
  return [
    w.title(t("Four quadrants", "चार चतुर्थांश")),
    w.body(
      t(
        "The axes cut the plane into four parts. Drag P around: which part is it in?",
        "अक्ष समतल को चार भागों में बाँटते हैं। P को खिसकाओ: वह किस भाग में है?",
      ),
    ),
    plane,
    w.definition(
      t(
        "The four parts are the **quadrants**, numbered **I, II, III, IV anticlockwise**, starting from OX. The plane with its axes is the **Cartesian plane**, also called the **coordinate plane** or the **xy-plane**.",
        "चारों भाग **चतुर्थांश** हैं, जिन्हें OX से शुरू करके **वामावर्त I, II, III, IV** क्रमांक दिए जाते हैं। अक्षों सहित तल **कार्तीय तल** है, जिसे **निर्देशांक तल** या **xy-तल** भी कहते हैं।",
      ),
      "quadrants",
    ),
    w.body(
      t(
        "**Q.** What are the horizontal and vertical lines called? **A.** The x-axis and the y-axis.",
        "**प्र.** क्षैतिज और ऊर्ध्वाधर रेखाओं को क्या कहते हैं? **उ.** x-अक्ष और y-अक्ष।",
      ),
    ),
    w.body(
      t(
        "**Q.** What is each of the four parts called? **A.** A quadrant.",
        "**प्र.** चारों भागों में से हर एक को क्या कहते हैं? **उ.** चतुर्थांश।",
      ),
    ),
    w.body(
      t(
        "**Q.** What is the point where the axes cross called? **A.** The origin.",
        "**प्र.** जहाँ अक्ष काटते हैं, उस बिंदु को क्या कहते हैं? **उ.** मूलबिंदु।",
      ),
    ),
  ];
});

/** The pages, in reading order. */
export const overview = [twoLines, axes, quadrants];

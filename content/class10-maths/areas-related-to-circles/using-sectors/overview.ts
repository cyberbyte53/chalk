import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, goalQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  CirclesSceneKind,
  PiValue,
  SectorAction,
  SectorShow,
  sectorSegmentDef,
} from "@chalk/prop-circles";
import { sceneOn } from "../kit";

const r = String.raw;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** Riya's "circles everywhere" corner of the poster. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const desk = sceneOn(
    b,
    "desk",
    CirclesSceneKind.PosterDesk,
    "the chart paper on the study table, with the cycle drawing and space left in one corner for a new panel",
  );
  return column([
    w.title(t("Sectors everywhere", "हर जगह त्रिज्यखंड")),
    desk,
    w.body(
      t(
        "Riya has a corner of the poster left. \"Let's show that sectors aren't only on cycles.\" Kabir starts a list: the wall clock's minute hand, the car wipers in the rain, Grandpa's cow grazing on a rope, the lighthouse on the TV documentary, Mom's silver brooch.",
        'रिया के पास पोस्टर का एक कोना बचा है। "दिखाते हैं कि त्रिज्यखंड सिर्फ़ साइकिल पर नहीं होते।" कबीर एक सूची बनाने लगता है: दीवार घड़ी की मिनट की सुई, बारिश में कार के वाइपर, रस्सी से बँधी दादाजी की गाय, टीवी डॉक्यूमेंट्री वाला प्रकाश-स्तंभ, मम्मी का चाँदी का ब्रोच।',
      ),
    ),
    w.body(
      t(
        "Each one sweeps or covers a slice of a circle. For each, the question is the same: what is the radius, and what is the angle?",
        "हर एक वृत्त का एक टुकड़ा घेरता या ढकता है। हर एक के लिए सवाल एक ही है: त्रिज्या क्या है, और कोण क्या है?",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Exercise 12.2 Q3: the minute hand in 5 minutes sweeps 30°. */
const clock = page(
  "clock",
  (b) => {
    const w = wordsOn(b);
    const hand = b.prop(sectorSegmentDef, "hand", {
      r: 14,
      theta: 0,
      step: 6,
      show: SectorShow.Sector,
      showMajor: false,
      showArc: false,
      pi: PiValue.Sevenths,
      canTurn: true,
      showWorking: true,
    });
    b.studentOnly(hand.action(SectorAction.Turn));
    b.standsFor(
      hand,
      "a clock face of radius 14 cm; each tap moves the minute hand one minute, 6°, and the sector it has swept is shaded with its area",
    );
    const goal = goalQuestion(b, {
      about: hand,
      prompt: t("Move the minute hand on by 5 minutes.", "मिनट की सुई को 5 मिनट आगे बढ़ाओ।"),
      isMet: hand.field("theta").eq(30),
      solve: Array.from({ length: 5 }, () => hand.learner(SectorAction.Turn, { by: 1 })),
    });
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "What area does a 14 cm minute hand sweep in 5 minutes?",
        "14 cm लंबी मिनट की सुई 5 मिनट में कितना क्षेत्रफल घेरती है?",
      ),
      options: [
        { id: "right", label: t(r`$51\tfrac{1}{3}$ cm²`, r`$51\tfrac{1}{3}$ cm²`) },
        {
          id: "5deg",
          label: t(r`$8\tfrac{5}{9}$ cm²`, r`$8\tfrac{5}{9}$ cm²`),
          feedback: t(
            "That uses an angle of 5°. In 5 minutes the hand turns 5 × 6° = 30°, since 60 minutes make 360°.",
            "इसमें कोण 5° लिया। 5 मिनट में सुई 5 × 6° = 30° घूमती है, क्योंकि 60 मिनट में 360° होते हैं।",
          ),
        },
        {
          id: "arc",
          label: t(r`$7\tfrac{1}{3}$ cm²`, r`$7\tfrac{1}{3}$ cm²`),
          feedback: t(
            r`$7\frac{1}{3}$ is the arc the tip travels, $\frac{30}{360} \times 2\pi r$, in cm. The area uses $\pi r^2$.`,
            r`$7\frac{1}{3}$ नोक द्वारा तय चाप है, $\frac{30}{360} \times 2\pi r$, cm में। क्षेत्रफल में $\pi r^2$ लगता है।`,
          ),
        },
      ],
      answer: "right",
      isHidden: true,
    });
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(ask));
    return column([
      w.title(t("The minute hand", "मिनट की सुई")),
      w.body(
        t(
          "In 60 minutes the minute hand goes once round: 360°. So each minute it turns 360° ÷ 60 = 6°, sweeping a thin sector. The hand is the radius.",
          "60 मिनट में मिनट की सुई एक बार पूरा घूमती है: 360°। तो हर मिनट वह 360° ÷ 60 = 6° घूमती है, एक पतला त्रिज्यखंड घेरते हुए। सुई त्रिज्या है।",
        ),
      ),
      hand,
      goal,
      ask,
      w.body(
        t(
          r`**Exercise 12.2, Q3.** $$\frac{30}{360} \times \frac{22}{7} \times 14 \times 14 = \frac{154}{3} = 51\tfrac{1}{3} \text{ cm}^2$$`,
          r`**प्रश्नावली 12.2, प्र 3।** $$\frac{30}{360} \times \frac{22}{7} \times 14 \times 14 = \frac{154}{3} = 51\tfrac{1}{3} \text{ cm}^2$$`,
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Exercise 12.2 Q8: a horse tied at the corner of a square field grazes a quarter circle. */
const horse = page(
  "horse",
  (b) => {
    const w = wordsOn(b);
    const field = b.prop(sectorSegmentDef, "field", {
      r: 5,
      theta: 90,
      step: 15,
      show: SectorShow.Sector,
      showMajor: false,
      showArc: false,
      pi: PiValue.Decimal,
      canTurn: false,
      showWorking: true,
    });
    b.standsFor(
      field,
      "a quarter circle of radius 5 m: the grass a horse tied at the corner of a square field can reach",
    );
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "With a 10 m rope instead of 5 m, how much more can the horse graze?",
        "5 m की जगह 10 m रस्सी हो, तो घोड़ा कितना ज़्यादा चर सकता है?",
      ),
      options: [
        { id: "right", label: t("58.875 m²", "58.875 m²") },
        {
          id: "double",
          label: t("19.625 m²", "19.625 m²"),
          feedback: t(
            "That assumes doubling the rope doubles the area. Area goes with r², so it becomes four times as big: 78.5 m². The increase is 78.5 − 19.625.",
            "इसमें माना कि रस्सी दुगुनी तो क्षेत्रफल दुगुना। क्षेत्रफल r² के साथ चलता है, तो यह चार गुना हो जाता है: 78.5 m²। बढ़त है 78.5 − 19.625।",
          ),
        },
        {
          id: "78",
          label: t("78.500 m²", "78.500 m²"),
          feedback: t(
            "78.5 m² is the new grazing area. The question asks how much more: 78.5 − 19.625.",
            "78.5 m² नया चराई क्षेत्रफल है। प्रश्न पूछता है कितना ज़्यादा: 78.5 − 19.625।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("A horse on a rope", "रस्सी से बँधा घोड़ा")),
      w.body(
        t(
          r`**Exercise 12.2, Q8.** A horse is tied with a 5 m rope to the peg at one corner of a square field of side 15 m. It can reach any point within 5 m of the peg, and the corner is a right angle, so it grazes a quarter circle. ($\pi = 3.14$) $$\frac{90}{360} \times 3.14 \times 5 \times 5 = 19.625 \text{ m}^2$$`,
          r`**प्रश्नावली 12.2, प्र 8।** 15 m भुजा वाले वर्गाकार खेत के एक कोने की खूँटी से एक घोड़ा 5 m रस्सी से बँधा है। वह खूँटी से 5 m के अंदर किसी भी बिंदु तक पहुँच सकता है, और कोना समकोण है, तो वह एक चौथाई वृत्त चरता है। ($\pi = 3.14$) $$\frac{90}{360} \times 3.14 \times 5 \times 5 = 19.625 \text{ m}^2$$`,
        ),
      ),
      field,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Exercise 12.2 Q11 (wipers) worked, Q12 (lighthouse) to try. */
const sweeps = page(
  "sweeps",
  (b) => {
    const w = wordsOn(b);
    const beam = b.prop(sectorSegmentDef, "beam", {
      r: 16.5,
      theta: 80,
      step: 10,
      show: SectorShow.Sector,
      showMajor: false,
      showArc: false,
      pi: PiValue.Decimal,
      canTurn: false,
      showWorking: true,
    });
    b.standsFor(
      beam,
      "a lighthouse's red warning light spread over a sector of angle 80° and radius 16.5 km",
    );
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        r`A lighthouse spreads red light over a sector of angle 80° to 16.5 km. Over what area of sea are ships warned? ($\pi = 3.14$)`,
        r`एक प्रकाश-स्तंभ 80° कोण के त्रिज्यखंड में 16.5 km तक लाल रोशनी फैलाता है। समुद्र के कितने क्षेत्रफल पर जहाज़ों को चेतावनी मिलती है? ($\pi = 3.14$)`,
      ),
      options: [
        { id: "right", label: t("189.97 km²", "189.97 km²") },
        {
          id: "arc",
          label: t("23.03 km²", "23.03 km²"),
          feedback: t(
            r`23.03 is the arc, $\frac{80}{360} \times 2\pi r$, a length in km. The sea covered is an area: $\frac{80}{360} \times \pi r^2$.`,
            r`23.03 चाप है, $\frac{80}{360} \times 2\pi r$, km में लंबाई। ढका समुद्र क्षेत्रफल है: $\frac{80}{360} \times \pi r^2$।`,
          ),
        },
        {
          id: "whole",
          label: t("854.87 km²", "854.87 km²"),
          feedback: t(
            r`854.87 km² is the whole circle round the lighthouse. The light covers only $\frac{80}{360} = \frac{2}{9}$ of it.`,
            r`854.87 km² प्रकाश-स्तंभ के चारों ओर पूरा वृत्त है। रोशनी उसका सिर्फ़ $\frac{80}{360} = \frac{2}{9}$ ढकती है।`,
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Wipers and a lighthouse", "वाइपर और प्रकाश-स्तंभ")),
      w.body(
        t(
          r`**Exercise 12.2, Q11.** A car has two wipers that don't overlap. Each blade is 25 cm long and sweeps 115°. Each sweeps a sector, so together: $$2 \times \frac{115}{360} \times \frac{22}{7} \times 25 \times 25$$ $$= \frac{158125}{126} \approx 1254.96 \text{ cm}^2$$`,
          r`**प्रश्नावली 12.2, प्र 11।** एक कार में दो वाइपर हैं जो एक-दूसरे पर नहीं चढ़ते। हर ब्लेड 25 cm लंबा है और 115° घूमता है। हर एक एक त्रिज्यखंड घेरता है, तो दोनों मिलकर: $$2 \times \frac{115}{360} \times \frac{22}{7} \times 25 \times 25$$ $$= \frac{158125}{126} \approx 1254.96 \text{ cm}^2$$`,
        ),
      ),
      beam,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Exercise 12.2 Q9 (brooch) worked, Q10 (umbrella) to try. */
const equalParts = page(
  "equal-parts",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "An umbrella has 8 equally spaced ribs. As a flat circle of radius 45 cm, what is the area between two neighbouring ribs?",
        "एक छाते में 8 बराबर दूरी पर तीलियाँ हैं। 45 cm त्रिज्या का सपाट वृत्त मानें, तो दो पास की तीलियों के बीच का क्षेत्रफल क्या है?",
      ),
      options: [
        { id: "right", label: t(r`$\frac{22275}{28}$ cm²`, r`$\frac{22275}{28}$ cm²`) },
        {
          id: "quarter",
          label: t(r`$\frac{22275}{14}$ cm²`, r`$\frac{22275}{14}$ cm²`),
          feedback: t(
            "That's a quarter of the circle, as if there were 4 gaps. 8 ribs make 8 gaps, each 360° ÷ 8 = 45°.",
            "यह वृत्त का एक चौथाई है, मानो 4 हिस्से हों। 8 तीलियाँ 8 हिस्से बनाती हैं, हर एक 360° ÷ 8 = 45°।",
          ),
        },
        {
          id: "arc",
          label: t(r`$\frac{495}{14}$ cm²`, r`$\frac{495}{14}$ cm²`),
          feedback: t(
            r`$\frac{495}{14}$ is the length of the arc between two ribs, in cm. The area is $\frac{45}{360} \times \pi \times 45^2$.`,
            r`$\frac{495}{14}$ दो तीलियों के बीच के चाप की लंबाई है, cm में। क्षेत्रफल $\frac{45}{360} \times \pi \times 45^2$ है।`,
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Equal slices", "बराबर टुकड़े")),
      w.body(
        t(
          r`**Exercise 12.2, Q9.** A brooch is a circle of silver wire of diameter 35 mm, with 5 diameters dividing it into 10 equal sectors. The wire is the circumference plus 5 diameters: $$\frac{22}{7} \times 35 + 5 \times 35 = 110 + 175 = 285 \text{ mm}$$ Each sector has angle $360° \div 10 = 36°$: $$\frac{36}{360} \times \frac{22}{7} \times \frac{35}{2} \times \frac{35}{2} = \frac{385}{4} \text{ mm}^2$$`,
          r`**प्रश्नावली 12.2, प्र 9।** एक ब्रोच 35 mm व्यास के चाँदी के तार का वृत्त है, जिसमें 5 व्यास उसे 10 बराबर त्रिज्यखंडों में बाँटते हैं। तार परिधि और 5 व्यासों का योग है: $$\frac{22}{7} \times 35 + 5 \times 35 = 110 + 175 = 285 \text{ mm}$$ हर त्रिज्यखंड का कोण $360° \div 10 = 36°$ है: $$\frac{36}{360} \times \frac{22}{7} \times \frac{35}{2} \times \frac{35}{2} = \frac{385}{4} \text{ mm}^2$$`,
        ),
      ),
      w.note(
        t(
          "When a circle is cut into n equal sectors, each has angle 360° ÷ n and area πr² ÷ n.",
          "जब वृत्त n बराबर त्रिज्यखंडों में कटे, तो हर एक का कोण 360° ÷ n और क्षेत्रफल πr² ÷ n होता है।",
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Exercise 12.2 Q13: six segment-shaped designs on a table cover. */
const tableCover = page(
  "table-cover",
  (b) => {
    const w = wordsOn(b);
    const design = b.prop(sectorSegmentDef, "design", {
      r: 28,
      theta: 60,
      step: 15,
      show: SectorShow.Segment,
      showMajor: false,
      showArc: false,
      pi: PiValue.Sevenths,
      canTurn: false,
      showWorking: true,
    });
    b.standsFor(
      design,
      "one of the six designs on a round table cover of radius 28 cm: the segment cut off by a 60° chord",
    );
    const ask = choiceQuestion(b, {
      name: "ask",
      prompt: t(
        "Why is the triangle under each 60° design equilateral?",
        "हर 60° डिज़ाइन के नीचे वाला त्रिभुज समबाहु क्यों है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "OA = OB are radii, so the other two angles are each 60°",
            "OA = OB त्रिज्याएँ हैं, तो बाक़ी दो कोण भी 60° के हैं",
          ),
        },
        {
          id: "six",
          label: t(
            "There are six designs, and a hexagon has six sides",
            "छह डिज़ाइन हैं, और षट्भुज की छह भुजाएँ होती हैं",
          ),
          feedback: t(
            "Six designs give the 60° angle, but the reason the triangle is equilateral is that two of its sides are equal radii.",
            "छह डिज़ाइन 60° कोण देते हैं, पर त्रिभुज समबाहु इसलिए है कि उसकी दो भुजाएँ बराबर त्रिज्याएँ हैं।",
          ),
        },
        {
          id: "chord",
          label: t(
            "Every chord of a circle is as long as the radius",
            "वृत्त की हर जीवा त्रिज्या जितनी लंबी होती है",
          ),
          feedback: t(
            "Chords can be any length up to the diameter. Only the chord of a 60° sector equals the radius.",
            "जीवा व्यास तक कितनी भी लंबी हो सकती है। सिर्फ़ 60° त्रिज्यखंड की जीवा त्रिज्या के बराबर होती है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("The table cover", "मेज़पोश")),
      w.body(
        t(
          r`**Exercise 12.2, Q13.** A round table cover of radius 28 cm has six equal segment-shaped designs. Making them costs ₹0.35 per cm². ($\sqrt{3} = 1.7$) Each design is a 60° segment: $$\text{sector} = \frac{60}{360} \times \frac{22}{7} \times 28 \times 28 = \frac{1232}{3}$$ The triangle is equilateral with side 28: $$\frac{\sqrt{3}}{4} \times 28^2 = 196 \times 1.7 = 333.2$$ Six designs: $$6 \times \left(\frac{1232}{3} - 333.2\right) = 464.8 \text{ cm}^2$$ $$\text{cost} = 464.8 \times 0.35 = 162.68$$ So the designs cost ₹162.68.`,
          r`**प्रश्नावली 12.2, प्र 13।** 28 cm त्रिज्या के गोल मेज़पोश पर छह बराबर वृत्तखंड-आकार की डिज़ाइनें हैं। इन्हें बनाने में ₹0.35 प्रति cm² लगता है। ($\sqrt{3} = 1.7$) हर डिज़ाइन 60° का वृत्तखंड है: $$\text{त्रिज्यखंड} = \frac{60}{360} \times \frac{22}{7} \times 28 \times 28 = \frac{1232}{3}$$ त्रिभुज 28 भुजा का समबाहु है: $$\frac{\sqrt{3}}{4} \times 28^2 = 196 \times 1.7 = 333.2$$ छह डिज़ाइनें: $$6 \times \left(\frac{1232}{3} - 333.2\right) = 464.8 \text{ cm}^2$$ $$\text{ख़र्च} = 464.8 \times 0.35 = 162.68$$ तो डिज़ाइनों का ख़र्च ₹162.68 है।`,
        ),
      ),
      design,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** The poster panel: length or area? */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const desk = sceneOn(
      b,
      "desk",
      CirclesSceneKind.PosterDesk,
      "the poster's new corner panel of everyday sectors",
    );
    const which = choiceQuestion(b, {
      name: "which",
      prompt: t(
        "For Mom's brooch, is the silver wire a length or an area?",
        "मम्मी के ब्रोच के लिए, चाँदी का तार लंबाई है या क्षेत्रफल?",
      ),
      options: [
        {
          id: "right",
          label: t("A length: once round plus 5 diameters", "लंबाई: एक बार चारों ओर और 5 व्यास"),
        },
        {
          id: "area",
          label: t("An area: ten sectors of the circle", "क्षेत्रफल: वृत्त के दस त्रिज्यखंड"),
          feedback: t(
            "The sectors' areas tell you the silver sheet, not the wire. Wire is a length: once round, plus 5 diameters.",
            "त्रिज्यखंडों के क्षेत्रफल चाँदी की चादर बताते हैं, तार नहीं। तार एक लंबाई है: एक बार चारों ओर, और 5 व्यास।",
          ),
        },
        {
          id: "segment",
          label: t("An area: segments under each chord", "क्षेत्रफल: हर जीवा के नीचे वृत्तखंड"),
          feedback: t(
            "There are no chords in the brooch other than diameters, and wire is a length, not an area.",
            "ब्रोच में व्यासों के सिवा कोई जीवा नहीं है, और तार लंबाई है, क्षेत्रफल नहीं।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("The poster panel", "पोस्टर का पैनल")),
      desk,
      w.body(
        t(
          "Riya draws each example small in the corner with its numbers: the minute hand's 51⅓ cm², the horse's 19.625 m², the wipers' 1255 cm². Kabir notices they all ask the same two things, radius and angle, but some want a length and some an area.",
          "रिया कोने में हर उदाहरण छोटा-सा बनाती है उसकी संख्याओं के साथ: मिनट की सुई के 51⅓ cm², घोड़े के 19.625 m², वाइपर के 1255 cm²। कबीर ध्यान देता है कि सब दो ही बातें पूछते हैं, त्रिज्या और कोण, पर कुछ में लंबाई चाहिए और कुछ में क्षेत्रफल।",
        ),
      ),
      which,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Exercise 12.2 Q14 (the formula check), then the mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const formula = choiceQuestion(b, {
      name: "formula",
      prompt: t(
        "The area of a sector of angle p (in degrees) of a circle of radius R is:",
        "त्रिज्या R वाले वृत्त के p (डिग्री में) कोण वाले त्रिज्यखंड का क्षेत्रफल है:",
      ),
      options: [
        {
          id: "right",
          label: t(r`$\frac{p}{720} \times 2\pi R^2$`, r`$\frac{p}{720} \times 2\pi R^2$`),
        },
        {
          id: "a",
          label: t(r`$\frac{p}{180} \times 2\pi R$`, r`$\frac{p}{180} \times 2\pi R$`),
          feedback: t(
            "This has R, not R², so it's a length, and it's twice the arc length too.",
            "इसमें R है, R² नहीं, तो यह एक लंबाई है, और चाप की लंबाई का दुगुना भी।",
          ),
        },
        {
          id: "b",
          label: t(r`$\frac{p}{180} \times \pi R^2$`, r`$\frac{p}{180} \times \pi R^2$`),
          feedback: t(
            r`That's twice the sector: the fraction of the circle is $\frac{p}{360}$, not $\frac{p}{180}$.`,
            r`यह त्रिज्यखंड का दुगुना है: वृत्त का भिन्न $\frac{p}{360}$ है, $\frac{p}{180}$ नहीं।`,
          ),
        },
        {
          id: "c",
          label: t(r`$\frac{p}{360} \times 2\pi R$`, r`$\frac{p}{360} \times 2\pi R$`),
          feedback: t(
            "That's the arc length, a length. The area needs R².",
            "यह चाप की लंबाई है, एक लंबाई। क्षेत्रफल में R² चाहिए।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ Every sector in life is a radius and an angle: clocks, ropes, wipers, beams, brooches. ✓ Length or area: read what the question wants. ✗ The poster's border designs mix squares and circles. Next stop: combined figures.",
        "**मिशन लॉग।** ✓ जीवन का हर त्रिज्यखंड एक त्रिज्या और एक कोण है: घड़ी, रस्सी, वाइपर, किरणें, ब्रोच। ✓ लंबाई या क्षेत्रफल: पढ़ो कि प्रश्न क्या चाहता है। ✗ पोस्टर के किनारे की डिज़ाइनें वर्ग और वृत्त मिलाती हैं। अगला पड़ाव: संयुक्त आकृतियाँ।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(formula.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([
      w.title(t("Your turn", "अब तुम्हारी बारी")),
      w.body(
        t(
          "Exercise 12.2, Q14. Rewrite each option until it looks like θ/360 × πR², or see that it can't.",
          "प्रश्नावली 12.2, प्र 14। हर विकल्प को तब तक बदलो जब तक वह θ/360 × πR² जैसा न दिखे, या देखो कि नहीं बन सकता।",
        ),
      ),
      formula,
      log,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [hook, clock, horse, sweeps, equalParts, tableCover, inLife, yourTurn];

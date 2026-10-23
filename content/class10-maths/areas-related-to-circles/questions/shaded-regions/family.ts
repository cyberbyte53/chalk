import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { bankFamily, numItem } from "../../kit";

const r = String.raw;

const flipped = t(
  "That adds what should be taken away (or the other way round). Ask: is this piece inside the shaded part or cut out of it?",
  "इसमें जो घटाना था वह जोड़ दिया (या उलटा)। पूछो: यह टुकड़ा छायांकित भाग में है या उससे कटा है?",
);
const unshaded = t(
  "That's the unshaded part. The shaded part is the whole minus it.",
  "यह बिना छायांकित भाग है। छायांकित भाग = पूरा − यह।",
);
const radius = t(
  "Check the radius: a diameter or a side was used as the radius.",
  "त्रिज्या जाँचो: व्यास या भुजा को त्रिज्या मान लिया।",
);

/** Examples 4–6 and Exercise 12.3 Q1–Q16, figures described in words. Use π = 22/7 unless stated. */
const items = {
  ex4: numItem(
    t(
      "A square lawn ABCD of side 56 m has a flower bed on two opposite sides: each is the region between a side and the arc of a circle centred at O, where the diagonals meet. Find the total area of lawn and beds.",
      "56 m भुजा वाले वर्गाकार लॉन ABCD की दो सम्मुख भुजाओं पर फूलों की क्यारियाँ हैं: हर एक भुजा और O (विकर्णों का कटान बिंदु) केंद्र वाले वृत्त के चाप के बीच का भाग है। लॉन और क्यारियों का कुल क्षेत्रफल ज्ञात करो।",
    ),
    "4032 m²",
    [
      [
        "3136 m²",
        t(
          "That's the square alone. Add the two beds, 448 m² each.",
          "यह केवल वर्ग है। दोनों क्यारियाँ, हर एक 448 m², जोड़ो।",
        ),
      ],
      ["2240 m²", flipped],
    ],
  ),
  ex5: numItem(
    t(
      "A square ABCD of side 14 cm has four equal circles inside, each touching two sides and two other circles. Find the area left shaded around them.",
      "14 cm भुजा वाले वर्ग ABCD में चार बराबर वृत्त हैं, हर एक दो भुजाओं और दो अन्य वृत्तों को छूता है। उनके चारों ओर छायांकित भाग का क्षेत्रफल ज्ञात करो।",
    ),
    "42 cm²",
    [
      ["154 cm²", unshaded],
      ["350 cm²", flipped],
    ],
  ),
  ex6: numItem(
    t(
      "ABCD is a square of side 10 cm, with a semicircle drawn inward on each side. Find the area of the four-petal shaded design (π = 3.14).",
      "ABCD 10 cm भुजा का वर्ग है, जिसकी हर भुजा पर अंदर की ओर अर्धवृत्त बना है। चार पंखुड़ियों वाले छायांकित डिज़ाइन का क्षेत्रफल ज्ञात करो (π = 3.14)।",
    ),
    "57 cm²",
    [
      ["43 cm²", unshaded],
      [
        "157 cm²",
        t(
          "That's the four semicircles added up; the petals are where they overlap.",
          "यह चारों अर्धवृत्तों का योग है; पंखुड़ियाँ वहाँ हैं जहाँ वे एक-दूसरे पर आते हैं।",
        ),
      ],
    ],
  ),
  q1: numItem(
    t(
      "PQ = 24 cm, PR = 7 cm; P lies on a circle with diameter QR and centre O. Find the area outside triangle PQR but inside the semicircle on QR's side of P.",
      "PQ = 24 cm, PR = 7 cm; P उस वृत्त पर है जिसका व्यास QR और केंद्र O है। P की ओर के अर्धवृत्त में, त्रिभुज PQR के बाहर का क्षेत्रफल ज्ञात करो।",
    ),
    r`$\frac{4523}{28}$ cm²`,
    [
      [
        r`$\frac{6875}{28}$ cm²`,
        t(
          "That's the semicircle alone. Subtract the right triangle, 84 cm².",
          "यह केवल अर्धवृत्त है। समकोण त्रिभुज, 84 cm², घटाओ।",
        ),
      ],
      [r`$\frac{9227}{28}$ cm²`, flipped],
    ],
  ),
  q2: numItem(
    t(
      "Two concentric circles have radii 7 cm and 14 cm, and ∠AOC = 40°. Find the area of the shaded band between them inside that angle.",
      "दो संकेंद्रीय वृत्तों की त्रिज्याएँ 7 cm और 14 cm हैं, और ∠AOC = 40°। उस कोण के अंदर दोनों के बीच की छायांकित पट्टी का क्षेत्रफल ज्ञात करो।",
    ),
    r`$\frac{154}{3}$ cm²`,
    [
      [
        r`$\frac{616}{9}$ cm²`,
        t(
          "That's the outer sector. Subtract the inner 40° sector.",
          "यह बाहरी त्रिज्यखंड है। भीतरी 40° त्रिज्यखंड घटाओ।",
        ),
      ],
      [r`$\frac{770}{9}$ cm²`, flipped],
    ],
  ),
  q3: numItem(
    t(
      "ABCD is a square of side 14 cm; APD and BPC are semicircles inside it. Find the shaded area outside the semicircles.",
      "ABCD 14 cm भुजा का वर्ग है; APD और BPC उसके अंदर अर्धवृत्त हैं। अर्धवृत्तों के बाहर का छायांकित क्षेत्रफल ज्ञात करो।",
    ),
    "42 cm²",
    [
      ["154 cm²", unshaded],
      [
        "119 cm²",
        t("That subtracts only one semicircle. There are two.", "इसमें केवल एक अर्धवृत्त घटाया। दो हैं।"),
      ],
    ],
  ),
  q4: numItem(
    t(
      "An equilateral triangle OAB of side 12 cm has a circular arc of radius 6 cm drawn with centre at vertex O. Find the shaded area: the triangle plus the circle outside it.",
      "12 cm भुजा वाले समबाहु त्रिभुज OAB के शीर्ष O को केंद्र मानकर 6 cm त्रिज्या का वृत्त बना है। छायांकित क्षेत्रफल ज्ञात करो: त्रिभुज और उसके बाहर का वृत्त।",
    ),
    r`$\left(\frac{660}{7} + 36\sqrt{3}\right)$ cm²`,
    [
      [
        r`$\left(\frac{792}{7} + 36\sqrt{3}\right)$ cm²`,
        t(
          "That adds the whole circle. The 60° inside the triangle is already counted.",
          "इसमें पूरा वृत्त जोड़ा। त्रिभुज के अंदर का 60° पहले ही गिना है।",
        ),
      ],
      [
        r`$\left(\frac{660}{7} + 72\sqrt{3}\right)$ cm²`,
        t(
          r`The triangle is $\frac{\sqrt{3}}{4} \times 144 = 36\sqrt{3}$.`,
          r`त्रिभुज $\frac{\sqrt{3}}{4} \times 144 = 36\sqrt{3}$ है।`,
        ),
      ],
    ],
  ),
  q5: numItem(
    t(
      "From each corner of a 4 cm square, a quadrant of radius 1 cm is cut, and a circle of diameter 2 cm is cut from the middle. Find the remaining area.",
      "4 cm भुजा वाले वर्ग के हर कोने से 1 cm त्रिज्या का चतुर्थांश, और बीच से 2 cm व्यास का वृत्त काटा गया। बचा हुआ क्षेत्रफल ज्ञात करो।",
    ),
    r`$\frac{68}{7}$ cm²`,
    [
      [
        r`$\frac{90}{7}$ cm²`,
        t(
          "That cuts out only the four quadrants. Also remove the middle circle.",
          "इसमें केवल चार चतुर्थांश काटे। बीच का वृत्त भी हटाओ।",
        ),
      ],
      [r`$\frac{2}{7}$ cm²`, radius],
    ],
  ),
  q6: numItem(
    t(
      "A round table cover of radius 32 cm has an equilateral triangle ABC inscribed in it as a design. Find the area of the cover outside the design.",
      "32 cm त्रिज्या वाले गोल मेज़पोश में डिज़ाइन के रूप में समबाहु त्रिभुज ABC अंतर्निहित है। डिज़ाइन के बाहर मेज़पोश का क्षेत्रफल ज्ञात करो।",
    ),
    r`$\left(\frac{22528}{7} - 768\sqrt{3}\right)$ cm²`,
    [
      [
        r`$\left(\frac{22528}{7} - 256\sqrt{3}\right)$ cm²`,
        t(
          r`The triangle's side is $32\sqrt{3}$, not 32, so its area is $768\sqrt{3}$.`,
          r`त्रिभुज की भुजा $32\sqrt{3}$ है, 32 नहीं, तो क्षेत्रफल $768\sqrt{3}$।`,
        ),
      ],
      [r`$\left(\frac{22528}{7} + 768\sqrt{3}\right)$ cm²`, flipped],
    ],
  ),
  q7: numItem(
    t(
      "ABCD is a square of side 14 cm. Circles centred at A, B, C, D each touch the two neighbouring circles. Find the shaded area of the square they leave.",
      "ABCD 14 cm भुजा का वर्ग है। A, B, C, D केंद्र वाले वृत्त अपने दोनों पड़ोसी वृत्तों को छूते हैं। उनके द्वारा छोड़ा गया वर्ग का छायांकित क्षेत्रफल ज्ञात करो।",
    ),
    "42 cm²",
    [
      ["154 cm²", unshaded],
      ["350 cm²", flipped],
    ],
  ),
  q8dist: numItem(
    t(
      "A racing track: two straights of 106 m with semicircular ends; the inner edge's ends have diameter 60 m, and the track is 10 m wide. Find the distance round the inner edge.",
      "एक दौड़ पथ: 106 m के दो सीधे भाग, सिरों पर अर्धवृत्त; भीतरी किनारे के सिरों का व्यास 60 m है, और पथ 10 m चौड़ा है। भीतरी किनारे के चारों ओर की दूरी ज्ञात करो।",
    ),
    r`$\frac{2804}{7}$ m`,
    [
      [
        r`$\frac{2062}{7}$ m`,
        t("That counts one straight. There are two.", "इसमें एक सीधा भाग गिना। दो हैं।"),
      ],
      [
        r`$\frac{3244}{7}$ m`,
        t("That uses the outer edge's diameter, 80 m.", "इसमें बाहरी किनारे का व्यास, 80 m, लिया।"),
      ],
    ],
  ),
  q8area: numItem(
    t(
      "Same track: straights 106 m, inner ends of diameter 60 m, width 10 m. Find the area of the track.",
      "वही पथ: सीधे भाग 106 m, भीतरी सिरों का व्यास 60 m, चौड़ाई 10 m। पथ का क्षेत्रफल ज्ञात करो।",
    ),
    "4320 m²",
    [
      [
        "2200 m²",
        t(
          "That's only the curved ends. Add the two straight strips, 1060 m² each.",
          "यह केवल मुड़े सिरे हैं। दोनों सीधी पट्टियाँ, हर एक 1060 m², जोड़ो।",
        ),
      ],
      [
        "5380 m²",
        t("That counts three straight strips. There are two.", "इसमें तीन सीधी पट्टियाँ गिनीं। दो हैं।"),
      ],
    ],
  ),
  q9: numItem(
    t(
      "AB and CD are perpendicular diameters of a circle with centre O and OA = 7 cm. OD is the diameter of a small circle. Find the shaded area: the small circle, plus the part of semicircle ACB outside triangle ABC.",
      "AB और CD, O केंद्र वाले वृत्त के लंबवत व्यास हैं, OA = 7 cm। OD एक छोटे वृत्त का व्यास है। छायांकित क्षेत्रफल ज्ञात करो: छोटा वृत्त, और अर्धवृत्त ACB का त्रिभुज ABC के बाहर का भाग।",
    ),
    "66.5 cm²",
    [
      [
        "115.5 cm²",
        t(
          "That adds the half circle without taking out triangle ABC (49 cm²).",
          "इसमें अर्धवृत्त जोड़ा पर त्रिभुज ABC (49 cm²) नहीं घटाया।",
        ),
      ],
      ["28 cm²", t("That forgot the small circle, 38.5 cm².", "इसमें छोटा वृत्त, 38.5 cm², भूल गए।")],
    ],
  ),
  q10: numItem(
    t(
      "An equilateral triangle has area 17320.5 cm². Circles of radius half the side are drawn at each vertex. Find the area of the triangle outside them (π = 3.14, √3 = 1.73205).",
      "एक समबाहु त्रिभुज का क्षेत्रफल 17320.5 cm² है। हर शीर्ष पर भुजा की आधी त्रिज्या के वृत्त बने हैं। उनके बाहर त्रिभुज का क्षेत्रफल ज्ञात करो (π = 3.14, √3 = 1.73205)।",
    ),
    "1620.5 cm²",
    [
      ["15700 cm²", unshaded],
      [
        "12087.17 cm²",
        t(
          "That removes one corner sector. There are three, one at each vertex.",
          "इसमें एक कोने का त्रिज्यखंड हटाया। तीन हैं, हर शीर्ष पर एक।",
        ),
      ],
    ],
  ),
  q11: numItem(
    t(
      "A square handkerchief has nine circular designs of radius 7 cm in 3 rows, touching each other and the edges. Find the area left.",
      "एक वर्गाकार रूमाल पर 7 cm त्रिज्या के नौ वृत्ताकार डिज़ाइन 3 पंक्तियों में हैं, जो एक-दूसरे और किनारों को छूते हैं। बचा हुआ क्षेत्रफल ज्ञात करो।",
    ),
    "378 cm²",
    [
      ["1386 cm²", unshaded],
      ["3150 cm²", flipped],
    ],
  ),
  q12quad: numItem(
    t(
      "OACB is a quadrant of a circle with centre O and radius 3.5 cm. Find the area of the quadrant.",
      "OACB, O केंद्र और 3.5 cm त्रिज्या वाले वृत्त का चतुर्थांश है। चतुर्थांश का क्षेत्रफल ज्ञात करो।",
    ),
    r`$\frac{77}{8}$ cm²`,
    [
      [
        r`$\frac{77}{2}$ cm²`,
        t("That's the whole circle. A quadrant is a quarter.", "यह पूरा वृत्त है। चतुर्थांश चौथाई है।"),
      ],
      [
        r`$\frac{11}{2}$ cm²`,
        t("That's the quadrant's arc, a length.", "यह चतुर्थांश का चाप है, एक लंबाई।"),
      ],
    ],
  ),
  q12shade: numItem(
    t(
      "Same quadrant OACB, radius 3.5 cm, with D on OA so that OD = 2 cm. Find the shaded area: the quadrant minus triangle BOD.",
      "वही चतुर्थांश OACB, त्रिज्या 3.5 cm, और OA पर D ऐसा कि OD = 2 cm। छायांकित क्षेत्रफल ज्ञात करो: चतुर्थांश − त्रिभुज BOD।",
    ),
    r`$\frac{49}{8}$ cm²`,
    [
      [r`$\frac{105}{8}$ cm²`, flipped],
      [
        r`$\frac{21}{8}$ cm²`,
        t(
          r`Triangle BOD is $\frac{1}{2} \times 3.5 \times 2 = 3.5$, not 7.`,
          r`त्रिभुज BOD $\frac{1}{2} \times 3.5 \times 2 = 3.5$ है, 7 नहीं।`,
        ),
      ],
    ],
  ),
  q13: numItem(
    t(
      "Square OABC is inscribed in quadrant OPBQ, with OA = 20 cm. Find the area between the quadrant and the square (π = 3.14).",
      "वर्ग OABC चतुर्थांश OPBQ में अंतर्निहित है, OA = 20 cm। चतुर्थांश और वर्ग के बीच का क्षेत्रफल ज्ञात करो (π = 3.14)।",
    ),
    "228 cm²",
    [
      [
        "314 cm²",
        t(
          r`That's a quadrant of radius 20. The quadrant's radius is the diagonal OB, $20\sqrt{2}$, not 20.`,
          r`यह 20 त्रिज्या का चतुर्थांश है। चतुर्थांश की त्रिज्या विकर्ण OB, $20\sqrt{2}$, है, 20 नहीं।`,
        ),
      ],
      [
        "628 cm²",
        t(
          "That's the quadrant alone. Subtract the square, 400 cm².",
          "यह केवल चतुर्थांश है। वर्ग, 400 cm², घटाओ।",
        ),
      ],
    ],
  ),
  q14: numItem(
    t(
      "AB and CD are arcs of concentric circles of radii 21 cm and 7 cm with centre O, and ∠AOB = 30°. Find the shaded area between the arcs.",
      "AB और CD, O केंद्र वाले 21 cm और 7 cm त्रिज्या के संकेंद्रीय वृत्तों के चाप हैं, और ∠AOB = 30°। चापों के बीच का छायांकित क्षेत्रफल ज्ञात करो।",
    ),
    r`$\frac{308}{3}$ cm²`,
    [
      [r`$\frac{385}{3}$ cm²`, flipped],
      [
        r`$\frac{231}{2}$ cm²`,
        t(
          "That's the outer sector alone. Subtract the inner one.",
          "यह केवल बाहरी त्रिज्यखंड है। भीतरी घटाओ।",
        ),
      ],
    ],
  ),
  q15: numItem(
    t(
      "ABC is a quadrant of a circle of radius 14 cm, and a semicircle is drawn with BC as diameter. Find the shaded area inside the semicircle but outside the quadrant.",
      "ABC, 14 cm त्रिज्या वाले वृत्त का चतुर्थांश है, और BC को व्यास मानकर अर्धवृत्त बना है। अर्धवृत्त के अंदर पर चतुर्थांश के बाहर का छायांकित क्षेत्रफल ज्ञात करो।",
    ),
    "98 cm²",
    [
      [
        "56 cm²",
        t(
          "That's the quadrant's segment. The shaded part is the semicircle minus that segment.",
          "यह चतुर्थांश का वृत्तखंड है। छायांकित भाग = अर्धवृत्त − वह वृत्तखंड।",
        ),
      ],
      ["154 cm²", t("That's the whole semicircle on BC.", "यह BC पर पूरा अर्धवृत्त है।")],
    ],
  ),
  q16: numItem(
    t(
      "Two quadrants of circles of radius 8 cm, centred at opposite corners of an 8 cm square, overlap in a leaf shape. Find the leaf's area.",
      "8 cm भुजा वाले वर्ग के सम्मुख कोनों पर केंद्र वाले 8 cm त्रिज्या के दो चतुर्थांश पत्ती के आकार में एक-दूसरे पर आते हैं। पत्ती का क्षेत्रफल ज्ञात करो।",
    ),
    r`$\frac{256}{7}$ cm²`,
    [
      [
        r`$\frac{128}{7}$ cm²`,
        t(
          "That's one half of the leaf, a single segment. There are two.",
          "यह पत्ती का आधा, एक वृत्तखंड है। दो हैं।",
        ),
      ],
      [
        r`$\frac{704}{7}$ cm²`,
        t(
          "That's two whole quadrants. Take the triangle out of each.",
          "यह दो पूरे चतुर्थांश हैं। हर एक से त्रिभुज निकालो।",
        ),
      ],
    ],
  ),
} as const;

export const shadedRegions = bankFamily(items, {
  level: Level.Hard,
  tests: [Concept.CombinationsOfFigures],
});

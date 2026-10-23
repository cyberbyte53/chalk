import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, goalQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  FrustumAction,
  FrustumMeasure,
  Measure,
  Pi,
  Solid,
  SolidsSceneKind,
  ViewerAction,
} from "@chalk/prop-solids";
import { frustumOn, sceneOn, viewerOn } from "../kit";

const r = String.raw;

/** Unused dims for a viewer (the viewer keeps every measure; only the solid's own are read). */
const dims = (d: Partial<Record<"l" | "b" | "h" | "a" | "r" | "r1" | "r2", number>>) => ({
  l: 6,
  b: 4,
  h: 10,
  a: 5,
  r: 3.5,
  r1: 6,
  r2: 3,
  ...d,
});

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** Grandpa's challenge before market day. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const shop = sceneOn(
    b,
    "shop",
    SolidsSceneKind.Workshop,
    "Grandpa's workshop the night before market day, the painted lattus drying on the bench",
  );
  return column([
    w.title(t("Grandpa's challenge", "दादाजी की चुनौती")),
    shop,
    w.body(
      t(
        "The night before market day, the lattus are drying and the syrup is cooling. Grandpa has one more set of puzzles: copper wire wound round a cylinder, a triangle spun into a double cone, bricks soaking up water, an oil funnel.",
        "बाज़ार के दिन से पहले की रात, लट्टू सूख रहे हैं और चाशनी ठंडी हो रही है। दादाजी के पास पहेलियों का एक और सेट है: बेलन पर लिपटा तांबे का तार, घुमाकर दोहरा शंकु बना त्रिभुज, पानी सोखती ईंटें, तेल की कीप।",
      ),
    ),
    w.body(
      t(
        "These are NCERT's Exercise 13.5 (optional). Each mixes the ideas of the last four stops; the trick is seeing which solids are hiding inside.",
        "यह NCERT की प्रश्नावली 13.5 (ऐच्छिक) है। हर एक पिछले चार पड़ावों के विचार मिलाती है; तरकीब यह देखना है कि अंदर कौन-से ठोस छिपे हैं।",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn: the challenges                                                */
/* ------------------------------------------------------------------ */

/** Exercise 13.5 Q1: wire wound round a cylinder. */
const wire = page(
  "wire",
  (b) => {
    const w = wordsOn(b);
    const drum = viewerOn(
      b,
      "drum",
      {
        solid: Solid.Cylinder,
        dims: dims({ r: 5, h: 12 }),
        pi: Pi.Sevenths,
        measures: [Measure.Curved, Measure.Volume],
      },
      "a cylinder 12 cm long and 10 cm across, the drum the copper wire is wound on",
    );
    const turns = choiceQuestion(b, {
      name: "turns",
      prompt: t(
        "Wire 3 mm thick is wound side by side along the 12 cm cylinder. How many turns fit?",
        "3 mm मोटा तार 12 cm के बेलन पर सटाकर लपेटा जाता है। कितने चक्कर आएँगे?",
      ),
      options: [
        { id: "right", label: t("40 turns", "40 चक्कर") },
        {
          id: "4",
          label: t("4 turns", "4 चक्कर"),
          feedback: t(
            "12 cm is 120 mm. Change both to one unit before dividing.",
            "12 cm, 120 mm है। भाग देने से पहले दोनों को एक इकाई में बदलो।",
          ),
        },
        {
          id: "80",
          label: t("80 turns", "80 चक्कर"),
          feedback: t(
            "That used the radius, 1.5 mm. Side by side, each turn takes the wire's full thickness, 3 mm.",
            "इसमें त्रिज्या, 1.5 mm, ली। सटाकर लपेटने पर हर चक्कर तार की पूरी मोटाई, 3 mm, लेता है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Challenge 1: the copper wire", "चुनौती 1: तांबे का तार")),
      w.body(
        t(
          "Copper wire 3 mm across is wound round a cylinder 12 cm long and 10 cm across, covering its curved surface. How long is the wire, and how heavy (copper is 8.88 g per cm³)?",
          "3 mm चौड़ा तांबे का तार 12 cm लंबे और 10 cm चौड़े बेलन पर लपेटा जाता है, उसका वक्र पृष्ठ ढकते हुए। तार कितना लंबा है, और कितना भारी (तांबा 8.88 g प्रति cm³ है)?",
        ),
      ),
      drum,
      turns,
      w.body(
        t(
          r`Each turn goes once round the cylinder: its circumference. $$\text{length} = 40 \times \tfrac{22}{7} \times 10 = 1257.14 \text{ cm}$$ The wire is itself a long thin cylinder of radius 0.15 cm (with $\pi = 3.14$): $$V = 3.14 \times 0.15^2 \times 1257.14$$ $$\approx 88.83 \text{ cm}^3$$ $$\text{mass} = 88.83 \times 8.88 \approx 788 \text{ g}$$`,
          r`हर चक्कर बेलन के एक बार चारों ओर जाता है: उसकी परिधि। $$\text{लंबाई} = 40 \times \tfrac{22}{7} \times 10 = 1257.14 \text{ cm}$$ तार ख़ुद त्रिज्या 0.15 cm का लंबा पतला बेलन है ($\pi = 3.14$ से): $$V = 3.14 \times 0.15^2 \times 1257.14$$ $$\approx 88.83 \text{ cm}^3$$ $$\text{द्रव्यमान} = 88.83 \times 8.88 \approx 788 \text{ g}$$`,
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Exercise 13.5 Q2: a right triangle spun about its hypotenuse. */
const doubleCone = page(
  "double-cone",
  (b) => {
    const w = wordsOn(b);
    const cone = viewerOn(
      b,
      "cone",
      {
        solid: Solid.Cone,
        dims: dims({ r: 2.4, h: 3.2 }),
        pi: Pi.Hundredths,
        measures: [Measure.Curved, Measure.Volume],
      },
      "one of the two cones of the double cone: radius 2.4 cm, height 3.2 cm, slant height 4 cm",
    );
    const radius = choiceQuestion(b, {
      name: "radius",
      prompt: t(
        "The 3-4-5 triangle spins about its 5 cm side. The circle it sweeps out has radius",
        "3-4-5 त्रिभुज अपनी 5 cm भुजा के परितः घूमता है। जो वृत्त वह बनाता है उसकी त्रिज्या है",
      ),
      options: [
        { id: "right", label: t("2.4 cm", "2.4 cm") },
        {
          id: "3",
          label: t("3.0 cm", "3.0 cm"),
          feedback: t(
            "3 cm is a side, which becomes a slant height. The radius is the height from the right angle onto the hypotenuse.",
            "3 cm एक भुजा है, जो तिर्यक ऊँचाई बनती है। त्रिज्या समकोण से कर्ण पर डाला लंब है।",
          ),
        },
        {
          id: "25",
          label: t("2.5 cm", "2.5 cm"),
          feedback: t(
            "That's half the hypotenuse. Use the area two ways: ½ × 3 × 4 = ½ × 5 × r.",
            "यह कर्ण का आधा है। क्षेत्रफल दो तरह से लो: ½ × 3 × 4 = ½ × 5 × r।",
          ),
        },
      ],
      answer: "right",
    });
    const goal = goalQuestion(b, {
      about: cone,
      prompt: t("Light up one cone's volume.", "एक शंकु का आयतन दिखाओ।"),
      isMet: cone.field("measure").eq(Measure.Volume),
      solve: [cone.learner(ViewerAction.Pick, { measure: Measure.Volume })],
    });
    return column([
      w.title(t("Challenge 2: the double cone", "चुनौती 2: दोहरा शंकु")),
      w.body(
        t(
          "A right triangle with sides 3 cm and 4 cm (and hypotenuse 5 cm) spins about its hypotenuse. It sweeps out two cones joined base to base: a **double cone**. Their slant heights are 3 cm and 4 cm, and their heights add up to 5 cm.",
          "3 cm और 4 cm भुजाओं (और 5 cm कर्ण) वाला समकोण त्रिभुज अपने कर्ण के परितः घूमता है। वह आधार से आधार जुड़े दो शंकु बनाता है: एक **दोहरा शंकु**। उनकी तिर्यक ऊँचाइयाँ 3 cm और 4 cm हैं, और ऊँचाइयों का योग 5 cm है।",
        ),
      ),
      radius,
      cone,
      goal,
      w.body(
        t(
          r`Both cones share the radius $r = 2.4$ cm, and their heights add to 5 cm, so (with $\pi = 3.14$): $$V = \tfrac{1}{3}\pi r^2 h_1 + \tfrac{1}{3}\pi r^2 h_2$$ $$= \tfrac{1}{3} \times 3.14 \times 2.4^2 \times 5 \approx 30.14 \text{ cm}^3$$ The surface area is the two curved surfaces, $\pi r \times 3 + \pi r \times 4$: that one is yours in a moment.`,
          r`दोनों शंकुओं की त्रिज्या $r = 2.4$ cm एक है, और ऊँचाइयों का योग 5 cm है, तो ($\pi = 3.14$ से): $$V = \tfrac{1}{3}\pi r^2 h_1 + \tfrac{1}{3}\pi r^2 h_2$$ $$= \tfrac{1}{3} \times 3.14 \times 2.4^2 \times 5 \approx 30.14 \text{ cm}^3$$ पृष्ठीय क्षेत्रफल दो वक्र पृष्ठ हैं, $\pi r \times 3 + \pi r \times 4$: वह थोड़ी देर में तुम निकालोगे।`,
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Exercise 13.5 Q3: bricks in a cistern. */
const bricks = page(
  "bricks",
  (b) => {
    const w = wordsOn(b);
    const cistern = viewerOn(
      b,
      "cistern",
      {
        solid: Solid.Cuboid,
        dims: dims({ l: 150, b: 120, h: 110 }),
        unit: "cm",
        pi: Pi.Sevenths,
        measures: [Measure.Total, Measure.Volume],
      },
      "a cistern 150 cm × 120 cm × 110 cm inside",
    );
    const goal = goalQuestion(b, {
      about: cistern,
      prompt: t(
        "How much can the cistern hold? Light up that measure.",
        "टंकी में कितना आ सकता है? वह माप दिखाओ।",
      ),
      isMet: cistern.field("measure").eq(Measure.Volume),
      solve: [cistern.learner(ViewerAction.Pick, { measure: Measure.Volume })],
    });
    return column([
      w.title(t("Challenge 3: water that hides", "चुनौती 3: छिपता पानी")),
      w.body(
        t(
          "A cistern 150 cm × 120 cm × 110 cm inside has 129600 cm³ of water. Porous bricks, each 22.5 cm × 7.5 cm × 6.5 cm, are put in until it is full to the brim. Each brick soaks up one-seventeenth of its own volume of water. How many bricks go in?",
          "अंदर से 150 cm × 120 cm × 110 cm की एक टंकी में 129600 cm³ पानी है। छिद्रयुक्त ईंटें, हर एक 22.5 cm × 7.5 cm × 6.5 cm, तब तक डाली जाती हैं जब तक टंकी लबालब न भर जाए। हर ईंट अपने आयतन का सत्रहवाँ भाग पानी सोखती है। कितनी ईंटें जाएँगी?",
        ),
      ),
      cistern,
      goal,
      w.body(
        t(
          r`A brick that soaks up $\tfrac{1}{17}$ of its volume in water only pushes the level up by $\tfrac{16}{17}$ of its volume. So with $n$ bricks: $$129600 + n \times \tfrac{16}{17} \times 1096.875$$ $$= 1980000$$ $$n = \frac{1850400 \times 17}{16 \times 1096.875}$$ $$\approx 1792.4$$ $$\text{so } 1792 \text{ bricks}$$`,
          r`जो ईंट अपने आयतन का $\tfrac{1}{17}$ पानी सोखती है, वह स्तर को अपने आयतन के केवल $\tfrac{16}{17}$ जितना उठाती है। तो $n$ ईंटों से: $$129600 + n \times \tfrac{16}{17} \times 1096.875$$ $$= 1980000$$ $$n = \frac{1850400 \times 17}{16 \times 1096.875}$$ $$\approx 1792.4$$ $$\text{तो } 1792 \text{ ईंटें}$$`,
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Exercise 13.5 Q4: rain in a valley. */
const rain = page("rain", (b) => {
  const w = wordsOn(b);
  return column([
    w.title(t("Challenge 4: rain in a valley", "चुनौती 4: घाटी में वर्षा")),
    w.body(
      t(
        "**Challenge 4 (Exercise 13.5 Q4).** In one fortnight, 10 cm of rain fell on a river valley of area 7280 km². Show that this is about the same as the water in three rivers, each 1072 km long, 75 m wide and 3 m deep.",
        "**चुनौती 4 (प्रश्नावली 13.5 प्र4)।** एक पखवाड़े में 7280 km² क्षेत्रफल वाली एक नदी घाटी में 10 cm वर्षा हुई। दिखाओ कि यह लगभग उतना ही पानी है जितना तीन नदियों में, जिनमें हर एक 1072 km लंबी, 75 m चौड़ी और 3 m गहरी है।",
      ),
    ),
    w.body(
      t(
        "Put everything in km first: 10 cm = 0.0001 km, 75 m = 0.075 km, 3 m = 0.003 km.",
        "पहले सब कुछ km में बदलो: 10 cm = 0.0001 km, 75 m = 0.075 km, 3 m = 0.003 km।",
      ),
    ),
    w.body(
      t(
        r`The rain is a very flat cuboid on the valley: $$\text{rain} = 7280 \times 0.0001 = 0.728 \text{ km}^3$$ Each river is a long cuboid: $$\text{three rivers} = 3 \times 1072 \times 0.075 \times 0.003$$ $$= 0.7236 \text{ km}^3$$ 0.728 and 0.7236 are about the same, which is what we had to show.`,
        r`वर्षा घाटी पर एक बहुत चपटा घनाभ है: $$\text{वर्षा} = 7280 \times 0.0001 = 0.728 \text{ km}^3$$ हर नदी एक लंबा घनाभ है: $$\text{तीन नदियाँ} = 3 \times 1072 \times 0.075 \times 0.003$$ $$= 0.7236 \text{ km}^3$$ 0.728 और 0.7236 लगभग बराबर हैं, यही दिखाना था।`,
      ),
    ),
    space(),
  ]);
});

/** Exercise 13.5 Q5: the oil funnel. */
const funnel = page(
  "funnel",
  (b) => {
    const w = wordsOn(b);
    const top = frustumOn(
      b,
      "top",
      { r1: 9, r2: 4, h: 12, step: 0 },
      "the funnel's top part: a frustum 18 cm across at the top, 8 cm at the bottom and 12 cm high, shown as a big cone with a small cone removed",
    );
    const goal = goalQuestion(b, {
      about: top,
      prompt: t(
        "Make the frustum from its cone, to see the two cones the formulas come from.",
        "छिन्नक को उसके शंकु से बनाओ, ताकि वे दो शंकु दिखें जिनसे सूत्र आते हैं।",
      ),
      isMet: top.field("step").eq(3),
      solve: [0, 1, 2].map(() => top.learner(FrustumAction.Step, {})),
    });
    return column([
      w.title(t("Challenge 5: the oil funnel", "चुनौती 5: तेल की कीप")),
      w.body(
        t(
          "An oil funnel of tin sheet is a cylinder 10 cm long and 8 cm across, with a frustum on top. The whole funnel is 22 cm tall, and 18 cm across at the top. So the frustum is 22 − 10 = 12 cm high, with radii 9 cm and 4 cm.",
          "टिन की चादर की तेल की कीप 10 cm लंबा और 8 cm चौड़ा बेलन है, जिसके ऊपर छिन्नक है। पूरी कीप 22 cm ऊँची है, और ऊपर 18 cm चौड़ी। तो छिन्नक 22 − 10 = 12 cm ऊँचा है, त्रिज्याएँ 9 cm और 4 cm।",
        ),
      ),
      top,
      goal,
      w.body(
        t(
          r`$$l = \sqrt{12^2 + (9 - 4)^2} = \sqrt{169} = 13 \text{ cm}$$ The sheet is open at both ends, so it is only the two curved surfaces: the frustum's $\pi(r_1 + r_2)l$ and the cylinder's $2\pi r h$. Finish it in a moment.`,
          r`$$l = \sqrt{12^2 + (9 - 4)^2} = \sqrt{169} = 13 \text{ cm}$$ चादर दोनों सिरों पर खुली है, इसलिए यह केवल दो वक्र पृष्ठ हैं: छिन्नक का $\pi(r_1 + r_2)l$ और बेलन का $2\pi r h$। थोड़ी देर में पूरा करो।`,
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Exercise 13.5 Q6–Q7: where the frustum formulas come from. */
const derive = page("derive", (b) => {
  const w = wordsOn(b);
  const cones = frustumOn(
    b,
    "cones",
    { r1: 9, r2: 4, h: 12, step: 2 },
    "the funnel's frustum (r₁ = 9 cm, r₂ = 4 cm, h = 12 cm) as a big cone with the small cone lifted off its top, with h₂ = 9.6 cm worked out by similar triangles",
  );
  return column([
    w.title(t("Challenges 6 and 7: deriving the formulas", "चुनौती 6 और 7: सूत्र निकालना")),
    w.body(
      t(
        "Do the big-cone-minus-small-cone working once, with letters. Let the big cone have height h₁ and slant l₁, the small one h₂ and l₂. The frustum has height h = h₁ − h₂ and slant l = l₁ − l₂. The picture does it with the funnel's numbers (r₁ = 9, r₂ = 4, h = 12); below, the same with letters.",
        "बड़ा-शंकु-घटा-छोटा-शंकु वाला काम एक बार अक्षरों से करो। मान लो बड़े शंकु की ऊँचाई h₁ और तिर्यक l₁ है, छोटे की h₂ और l₂। छिन्नक की ऊँचाई h = h₁ − h₂ और तिर्यक l = l₁ − l₂ है। चित्र यही कीप की संख्याओं (r₁ = 9, r₂ = 4, h = 12) से करता है; नीचे वही अक्षरों से।",
      ),
    ),
    cones,
    w.body(
      t(
        r`By similar triangles $\tfrac{h_1}{h_2} = \tfrac{l_1}{l_2} = \tfrac{r_1}{r_2}$, so $$h_1 = \frac{h r_1}{r_1 - r_2}, \quad h_2 = \frac{h r_2}{r_1 - r_2}$$ $$l_1 = \frac{l r_1}{r_1 - r_2}, \quad l_2 = \frac{l r_2}{r_1 - r_2}$$`,
        r`समरूप त्रिभुजों से $\tfrac{h_1}{h_2} = \tfrac{l_1}{l_2} = \tfrac{r_1}{r_2}$, इसलिए $$h_1 = \frac{h r_1}{r_1 - r_2}, \quad h_2 = \frac{h r_2}{r_1 - r_2}$$ $$l_1 = \frac{l r_1}{r_1 - r_2}, \quad l_2 = \frac{l r_2}{r_1 - r_2}$$`,
      ),
    ),
    w.body(
      t(
        r`$$\text{CSA} = \pi r_1 l_1 - \pi r_2 l_2 = \frac{\pi l (r_1^2 - r_2^2)}{r_1 - r_2}$$ $$= \pi(r_1 + r_2)\,l$$ $$V = \tfrac{1}{3}\pi r_1^2 h_1 - \tfrac{1}{3}\pi r_2^2 h_2 = \tfrac{1}{3}\pi h\,\frac{r_1^3 - r_2^3}{r_1 - r_2}$$ $$= \tfrac{1}{3}\pi h\left(r_1^2 + r_2^2 + r_1 r_2\right)$$ using $r_1^3 - r_2^3 = (r_1 - r_2)(r_1^2 + r_1 r_2 + r_2^2)$. Adding the two end circles to the CSA gives the TSA.`,
        r`$$\text{CSA} = \pi r_1 l_1 - \pi r_2 l_2 = \frac{\pi l (r_1^2 - r_2^2)}{r_1 - r_2}$$ $$= \pi(r_1 + r_2)\,l$$ $$V = \tfrac{1}{3}\pi r_1^2 h_1 - \tfrac{1}{3}\pi r_2^2 h_2 = \tfrac{1}{3}\pi h\,\frac{r_1^3 - r_2^3}{r_1 - r_2}$$ $$= \tfrac{1}{3}\pi h\left(r_1^2 + r_2^2 + r_1 r_2\right)$$ $r_1^3 - r_2^3 = (r_1 - r_2)(r_1^2 + r_1 r_2 + r_2^2)$ का उपयोग करके। CSA में दोनों सिरों के वृत्त जोड़ने पर TSA मिलता है।`,
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* See it in life: market day                                           */
/* ------------------------------------------------------------------ */

/** The stall on market day, and the four stops looked back on. */
const marketDay = page("market-day", (b) => {
  const w = wordsOn(b);
  const day = sceneOn(
    b,
    "day",
    SolidsSceneKind.StallDay,
    "market day: the busy stall, its table full of painted lattus, toy rockets, kulfi cones and glasses of juice, customers crowding round",
  );
  return column([
    w.title(t("Market day", "बाज़ार का दिन")),
    day,
    w.body(
      t(
        "Sunday comes. The lattus are painted with not a drop of paint wasted, the syrup was just enough, every can of kulfi fills its ten cones, and the jaggery sits in neat 14 kg blocks. Every line on the list was a maths question, and each one is answered.",
        "रविवार आता है। लट्टू रंगे जा चुके हैं, पेंट की एक बूँद बर्बाद नहीं हुई, चाशनी ठीक पूरी पड़ी, कुल्फ़ी का हर डिब्बा अपने दस कोन भरता है, और गुड़ 14 kg के साफ़ ढेलों में रखा है। सूची की हर पंक्ति एक गणित का प्रश्न थी, और हर एक का उत्तर मिल गया।",
      ),
    ),
    w.definition(
      t(
        "**The four stops.** (1) **Surface of joined solids:** add the parts' surfaces that still show; glued faces go, covered circles are taken away. (2) **Volume of joined solids:** volumes simply add; hollows are taken away. (3) **Changing shape:** volume before = volume after. (4) **Frustum:** a cone with a smaller cone cut off parallel to its base, with its own formulas.",
        "**चार पड़ाव।** (1) **जुड़े ठोसों का पृष्ठ:** भागों के वे पृष्ठ जोड़ो जो अब भी दिखते हैं; चिपके फलक हटते हैं, ढके वृत्त घटते हैं। (2) **जुड़े ठोसों का आयतन:** आयतन सीधे जुड़ते हैं; गड्ढे घटाए जाते हैं। (3) **आकार बदलना:** पहले का आयतन = बाद का आयतन। (4) **छिन्नक:** वह शंकु जिसमें से आधार के समांतर एक छोटा शंकु काटा गया हो, अपने सूत्रों के साथ।",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Finish challenges 2 and 5, then the last mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const surface = choiceQuestion(b, {
      name: "surface",
      prompt: t(
        "Challenge 2, finished. The double cone (r = 2.4 cm, slant heights 3 cm and 4 cm, π = 3.14) has surface area",
        "चुनौती 2, पूरी। दोहरे शंकु (r = 2.4 cm, तिर्यक ऊँचाइयाँ 3 cm और 4 cm, π = 3.14) का पृष्ठीय क्षेत्रफल है",
      ),
      options: [
        { id: "right", label: t("52.75 cm²", "52.75 cm²") },
        {
          id: "70",
          label: t("70.83 cm²", "70.83 cm²"),
          feedback: t(
            "A base circle was added. The two bases are glued together inside the double cone: no circles show.",
            "एक आधार वृत्त जोड़ा गया। दोनों आधार दोहरे शंकु के अंदर चिपके हैं: कोई वृत्त नहीं दिखता।",
          ),
        },
        {
          id: "37",
          label: t("37.68 cm²", "37.68 cm²"),
          feedback: t(
            "That's 3.14 × 2.4 × 5: the hypotenuse was used as a slant height. The slant heights are the sides, 3 and 4.",
            "इसमें कर्ण को तिर्यक ऊँचाई लिया: 3.14 × 2.4 × 5। तिर्यक ऊँचाइयाँ भुजाएँ हैं, 3 और 4।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const sheet = choiceQuestion(b, {
      name: "sheet",
      prompt: t(
        "Challenge 5, finished. The funnel's tin sheet (frustum r₁ = 9, r₂ = 4, l = 13; cylinder r = 4, h = 10, all in cm) is",
        "चुनौती 5, पूरी। कीप की टिन की चादर (छिन्नक r₁ = 9, r₂ = 4, l = 13; बेलन r = 4, h = 10, सब cm में) है",
      ),
      options: [
        { id: "right", label: t(r`$782\tfrac{4}{7}$ cm²`, r`$782\tfrac{4}{7}$ cm²`) },
        {
          id: "1087",
          label: t(r`$1087\tfrac{3}{7}$ cm²`, r`$1087\tfrac{3}{7}$ cm²`),
          feedback: t(
            "The funnel is open at both ends: no circles. Only the two curved surfaces are sheet.",
            "कीप दोनों सिरों पर खुली है: कोई वृत्त नहीं। केवल दो वक्र पृष्ठ चादर हैं।",
          ),
        },
        {
          id: "531",
          label: t(r`$531\tfrac{1}{7}$ cm²`, r`$531\tfrac{1}{7}$ cm²`),
          feedback: t(
            r`That's the frustum alone, $169\pi$. Add the cylinder's curved surface, $80\pi$.`,
            r`यह केवल छिन्नक है, $169\pi$। बेलन का वक्र पृष्ठ, $80\pi$, जोड़ो।`,
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ Paint for the lattus and rockets. ✓ Syrup for the gulab jamuns. ✓ Cones for the kulfi. ✓ Jaggery in the moulds. ✓ Grandpa's challenge. The stall is open: chapter complete.",
        "**मिशन लॉग।** ✓ लट्टुओं और रॉकेटों का पेंट। ✓ गुलाब जामुनों की चाशनी। ✓ कुल्फ़ी के कोन। ✓ साँचों में गुड़। ✓ दादाजी की चुनौती। स्टॉल खुल गया: अध्याय पूरा।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(surface.on(QuestionSignal.Correct), theBoard.show(sheet));
    b.when(sheet.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), surface, sheet, log, space()]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, the challenges, market day, practice. */
export const overview = [hook, wire, doubleCone, bricks, rain, funnel, derive, marketDay, yourTurn];

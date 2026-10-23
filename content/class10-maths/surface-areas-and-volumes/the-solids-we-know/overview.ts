import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, goalQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import { Measure, Pi, Solid, SolidsSceneKind, ViewerAction } from "@chalk/prop-solids";
import { sceneOn, viewerOn } from "../kit";

const r = String.raw;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** Who, where, what: a stall at the Sunday market, and what they will sell. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const stall = sceneOn(
    b,
    "stall",
    SolidsSceneKind.Stall,
    "an empty wooden market stall with a hand-painted board; Riya and Kabir unpacking boxes",
  );
  return column([
    w.title(t("The weekend stall", "हफ़्ते के आख़िर का स्टॉल")),
    stall,
    w.body(
      t(
        "The Sunday market near the bus stand is starting a children's row, and Riya and Kabir have got a stall. Grandpa will give them his wooden toys: spinning tops (lattus), a toy rocket, blocks with a dome on top. Mom will send her sweets: gulab jamuns, kulfi in cones, and juice. And Grandpa's village is sending jaggery, set in moulds.",
        "बस अड्डे के पास का रविवार बाज़ार बच्चों की एक क़तार शुरू कर रहा है, और रिया और कबीर को एक स्टॉल मिला है। दादाजी अपने लकड़ी के खिलौने देंगे: लट्टू, एक खिलौना रॉकेट, ऊपर गुंबद वाले ब्लॉक। मम्मी अपनी मिठाइयाँ भेजेंगी: गुलाब जामुन, कोन में कुल्फ़ी, और जूस। और दादाजी के गाँव से साँचों में जमा गुड़ आ रहा है।",
      ),
    ),
    w.body(
      t(
        'Kabir makes a list of what they will need. Paint for the toys. Syrup for the jamuns. Enough cones for the kulfi. Riya reads it and laughs: "Every line on your list is a maths question."',
        'कबीर एक सूची बनाता है कि उन्हें क्या-क्या चाहिए। खिलौनों के लिए पेंट। जामुन के लिए चाशनी। कुल्फ़ी के लिए काफ़ी कोन। रिया सूची पढ़कर हँसती है: "तुम्हारी सूची की हर पंक्ति एक गणित का सवाल है।"',
      ),
    ),
    space(),
  ]);
});

/** Why this chapter: paint is surface, syrup is volume; the stops. */
const why = page("why", (b) => {
  const w = wordsOn(b);
  const shop = sceneOn(
    b,
    "shop",
    SolidsSceneKind.Workshop,
    "Grandpa in his workshop with a row of wooden lattus, each a cone with a rounded bottom",
  );
  return column([
    w.title(t("What this chapter is for", "यह अध्याय किसलिए है")),
    shop,
    w.body(
      t(
        "Grandpa's lattu is not a cone and not a hemisphere: it is a cone **joined** to a hemisphere. Most real things are made like that, from two or more basic solids put together. Paint covers the outside of a thing, so it is a question of **surface area**. Syrup, juice and kulfi fill the inside, so they are questions of **volume**.",
        "दादाजी का लट्टू न शंकु है न अर्धगोला: यह एक अर्धगोले से **जुड़ा** शंकु है। ज़्यादातर असली चीज़ें ऐसे ही बनती हैं, दो या ज़्यादा मूल ठोसों को जोड़कर। पेंट किसी चीज़ के बाहर को ढकता है, इसलिए यह **पृष्ठीय क्षेत्रफल** का सवाल है। चाशनी, जूस और कुल्फ़ी अंदर भरते हैं, इसलिए ये **आयतन** के सवाल हैं।",
      ),
    ),
    w.definition(
      t(
        "**The stops on the way.** (1) The basic solids and their formulas: *this lesson*. (2) Painting joined solids: surface area. (3) Filling joined solids: volume. (4) Melt it, pour it, make something new. (5) The cone with its top cut off: the frustum. Then a few challenges, and market day.",
        "**रास्ते के पड़ाव।** (1) मूल ठोस और उनके सूत्र: *यह पाठ*। (2) जुड़े ठोसों को रंगना: पृष्ठीय क्षेत्रफल। (3) जुड़े ठोसों को भरना: आयतन। (4) पिघलाओ, उड़ेलो, कुछ नया बनाओ। (5) ऊपर से कटा शंकु: छिन्नक। फिर कुछ चुनौतियाँ, और बाज़ार का दिन।",
      ),
    ),
    w.body(
      t(
        "First stop: a quick recap of the basic solids from Class IX, because everything in this chapter is built from them.",
        "पहला पड़ाव: कक्षा IX के मूल ठोसों की एक झटपट दोहराई, क्योंकि इस अध्याय में सब कुछ इन्हीं से बनता है।",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** The words: solid, surface area (curved and total), volume. */
const words = page(
  "words",
  (b) => {
    const w = wordsOn(b);
    const box = viewerOn(
      b,
      "box",
      {
        solid: Solid.Cuboid,
        dims: { l: 6, b: 4, h: 3, a: 5, r: 3.5, r1: 6, r2: 3 },
        canTurn: true,
      },
      "a cuboid 6 cm long, 4 cm wide and 3 cm high, which the learner can turn",
    );
    const which = choiceQuestion(b, {
      name: "which",
      prompt: t(
        "Kabir wants to know how much paint covers a closed wooden box. Which does he need?",
        "कबीर जानना चाहता है कि लकड़ी के एक बंद डिब्बे को कितना पेंट ढकेगा। उसे क्या चाहिए?",
      ),
      options: [
        { id: "right", label: t("Its total surface area", "उसका कुल पृष्ठीय क्षेत्रफल") },
        {
          id: "volume",
          label: t("Its volume, the space inside", "उसका आयतन, अंदर की जगह"),
          feedback: t(
            "Paint goes on the outside faces, not into the space inside: that's surface area.",
            "पेंट बाहरी फलकों पर लगता है, अंदर की जगह में नहीं: यह पृष्ठीय क्षेत्रफल है।",
          ),
        },
        {
          id: "lateral",
          label: t("Only its four side faces", "केवल उसके चार बगल वाले फलक"),
          feedback: t(
            "A closed box is painted on top and bottom too: every face, so the total surface area.",
            "बंद डिब्बा ऊपर और नीचे भी रंगा जाता है: हर फलक, यानी कुल पृष्ठीय क्षेत्रफल।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Surface and volume", "पृष्ठ और आयतन")),
      w.definition(
        t(
          "**Solid.** A **solid** is a shape that takes up space in three directions: it has length, breadth and height. A brick, a ball and a can are solids.",
          "**ठोस।** **ठोस** वह आकार है जो तीनों दिशाओं में जगह घेरता है: उसकी लंबाई, चौड़ाई और ऊँचाई होती है। ईंट, गेंद और डिब्बा ठोस हैं।",
        ),
      ),
      w.definition(
        t(
          "**Surface area and volume.** The **surface area** of a solid is the area of all its outside, measured in square units (cm²). Its **volume** is the space it takes up, measured in cubic units (cm³). The amount a hollow thing can hold is its **capacity**.",
          "**पृष्ठीय क्षेत्रफल और आयतन।** किसी ठोस का **पृष्ठीय क्षेत्रफल** उसके पूरे बाहरी भाग का क्षेत्रफल है, जो वर्ग इकाइयों (cm²) में मापा जाता है। उसका **आयतन** वह जगह है जो वह घेरता है, जो घन इकाइयों (cm³) में मापा जाता है। कोई खोखली चीज़ जितना भर सकती है, वह उसकी **धारिता** है।",
        ),
      ),
      w.definition(
        t(
          "**Curved and total.** The **total surface area** (TSA) counts every face. The **curved surface area** (CSA) counts only the round, curved part, without the flat ends. For a cuboid, the four side faces are called its **lateral surface**.",
          "**वक्र और कुल।** **कुल पृष्ठीय क्षेत्रफल** (TSA) हर फलक को गिनता है। **वक्र पृष्ठीय क्षेत्रफल** (CSA) केवल गोल, मुड़े हुए भाग को गिनता है, सपाट सिरों के बिना। घनाभ के लिए चार बगल वाले फलक उसका **पार्श्व पृष्ठ** कहलाते हैं।",
        ),
      ),
      box,
      w.body(
        t(
          r`For a cuboid of length $l$, breadth $b$ and height $h$: $$\text{TSA} = 2(lb + bh + hl)$$ $$V = lbh$$ A cube is a cuboid with every edge $a$, so its TSA is $6a^2$ and its volume is $a^3$.`,
          r`लंबाई $l$, चौड़ाई $b$ और ऊँचाई $h$ वाले घनाभ के लिए: $$\text{TSA} = 2(lb + bh + hl)$$ $$V = lbh$$ घन ऐसा घनाभ है जिसका हर किनारा $a$ है, इसलिए उसका TSA $6a^2$ और आयतन $a^3$ है।`,
        ),
      ),
      which,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The cylinder: open its net, a rectangle 2πr by h. */
const cylinder = page(
  "cylinder",
  (b) => {
    const w = wordsOn(b);
    const can = viewerOn(
      b,
      "can",
      {
        solid: Solid.Cylinder,
        dims: { l: 6, b: 4, h: 10, a: 5, r: 3.5, r1: 6, r2: 3 },
        canUnfold: true,
        canTurn: true,
      },
      "a cylinder of radius 3.5 cm and height 10 cm, which the learner can open into its net",
    );
    const goal = goalQuestion(b, {
      about: can,
      prompt: t(
        "Open the cylinder out flat. What shape does its curved surface become?",
        "बेलन को खोलकर सपाट करो। उसका वक्र पृष्ठ किस आकार का बन जाता है?",
      ),
      isMet: can.field("isNet").eq(true),
      solve: [can.learner(ViewerAction.Unfold, { on: true })],
    });
    return column([
      w.title(t("The cylinder", "बेलन")),
      w.definition(
        t(
          "**Cylinder.** A **(right circular) cylinder** has two equal circles as its flat ends, joined by a curved surface, like a can. Its **radius** $r$ is the radius of an end, and its **height** $h$ is the distance between the ends.",
          "**बेलन।** **(लंब वृत्तीय) बेलन** के दोनों सपाट सिरे बराबर वृत्त होते हैं, जो एक वक्र पृष्ठ से जुड़े होते हैं, जैसे डिब्बा। उसकी **त्रिज्या** $r$ एक सिरे की त्रिज्या है, और उसकी **ऊँचाई** $h$ दोनों सिरों के बीच की दूरी है।",
        ),
      ),
      can,
      goal,
      w.body(
        t(
          r`The curved surface unrolls into a **rectangle**. One side is the height $h$; the other went once round the circle, so it is the circumference $2\pi r$. So $$\text{CSA} = 2\pi r h$$ Add the two circles for the total: $$\text{TSA} = 2\pi r h + 2\pi r^2 = 2\pi r(h + r)$$ The volume is base area times height: $$V = \pi r^2 h$$`,
          r`वक्र पृष्ठ खुलकर एक **आयत** बन जाता है। एक भुजा ऊँचाई $h$ है; दूसरी एक बार वृत्त के चारों ओर गई थी, इसलिए वह परिधि $2\pi r$ है। तो $$\text{CSA} = 2\pi r h$$ कुल के लिए दोनों वृत्त जोड़ो: $$\text{TSA} = 2\pi r h + 2\pi r^2 = 2\pi r(h + r)$$ आयतन आधार का क्षेत्रफल गुणा ऊँचाई है: $$V = \pi r^2 h$$`,
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The cone: slant height, and its net is a sector. */
const cone = page(
  "cone",
  (b) => {
    const w = wordsOn(b);
    const kulfi = viewerOn(
      b,
      "kulfi",
      {
        solid: Solid.Cone,
        dims: { l: 6, b: 4, h: 4, a: 5, r: 3, r1: 6, r2: 3 },
        canUnfold: true,
        canSetDims: true,
        dimStep: 1,
      },
      "a cone of radius 3 cm and height 4 cm, its slant height labelled; it can be opened into a sector",
    );
    const goal = goalQuestion(b, {
      about: kulfi,
      prompt: t(
        "Open the cone out flat to see what its curved surface is.",
        "शंकु को खोलकर सपाट करो और देखो कि उसका वक्र पृष्ठ क्या है।",
      ),
      isMet: kulfi.field("isNet").eq(true),
      solve: [kulfi.learner(ViewerAction.Unfold, { on: true })],
    });
    return column([
      w.title(t("The cone", "शंकु")),
      w.definition(
        t(
          "**Cone.** A **(right circular) cone** has a circle as its base and comes to a point, its **vertex**, straight above the centre. Its height $h$ goes from the vertex to the centre of the base. Its **slant height** $l$ goes from the vertex to the edge of the base, along the surface.",
          "**शंकु।** **(लंब वृत्तीय) शंकु** का आधार एक वृत्त होता है और वह एक बिंदु पर, अपने **शीर्ष** पर, ख़त्म होता है जो केंद्र के ठीक ऊपर होता है। उसकी ऊँचाई $h$ शीर्ष से आधार के केंद्र तक जाती है। उसकी **तिर्यक ऊँचाई** $l$ पृष्ठ पर चलते हुए शीर्ष से आधार के किनारे तक जाती है।",
        ),
      ),
      w.body(
        t(
          r`The height, the radius and the slant height make a right triangle, with $l$ as the hypotenuse. By Pythagoras: $$l = \sqrt{r^2 + h^2}$$ For $r = 3$ cm and $h = 4$ cm, $l = \sqrt{9 + 16} = 5$ cm.`,
          r`ऊँचाई, त्रिज्या और तिर्यक ऊँचाई एक समकोण त्रिभुज बनाते हैं, जिसका कर्ण $l$ है। पाइथागोरस से: $$l = \sqrt{r^2 + h^2}$$ $r = 3$ cm और $h = 4$ cm के लिए $l = \sqrt{9 + 16} = 5$ cm।`,
        ),
      ),
      kulfi,
      goal,
      w.body(
        t(
          r`The curved surface opens into a **sector** of a circle of radius $l$, whose arc is the base's circumference $2\pi r$. Its area is $$\text{CSA} = \pi r l$$ With the base: $$\text{TSA} = \pi r l + \pi r^2 = \pi r(l + r)$$ A cone holds a third of the cylinder with the same base and height: $$V = \tfrac{1}{3}\pi r^2 h$$`,
          r`वक्र पृष्ठ खुलकर त्रिज्या $l$ वाले वृत्त का एक **त्रिज्यखंड** बन जाता है, जिसका चाप आधार की परिधि $2\pi r$ है। इसका क्षेत्रफल है $$\text{CSA} = \pi r l$$ आधार के साथ: $$\text{TSA} = \pi r l + \pi r^2 = \pi r(l + r)$$ शंकु उसी आधार और ऊँचाई वाले बेलन का एक-तिहाई भरता है: $$V = \tfrac{1}{3}\pi r^2 h$$`,
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The sphere and the hemisphere. */
const sphere = page(
  "sphere",
  (b) => {
    const w = wordsOn(b);
    const ball = viewerOn(
      b,
      "ball",
      {
        solid: Solid.Sphere,
        dims: { l: 6, b: 4, h: 10, a: 5, r: 3.5, r1: 6, r2: 3 },
        canUnfold: true,
      },
      "a sphere of radius 3.5 cm; opened, its surface is shown as four circles of the same radius",
    );
    const half = viewerOn(
      b,
      "half",
      { solid: Solid.Hemisphere, dims: { l: 6, b: 4, h: 10, a: 5, r: 3.5, r1: 6, r2: 3 } },
      "a hemisphere of radius 3.5 cm, with its flat circular face on top",
    );
    const flat = choiceQuestion(b, {
      name: "flat",
      prompt: t(
        "A solid hemisphere's **total** surface area is",
        "ठोस अर्धगोले का **कुल** पृष्ठीय क्षेत्रफल है",
      ),
      options: [
        { id: "right", label: t(r`$3\pi r^2$`, r`$3\pi r^2$`) },
        {
          id: "two",
          label: t(r`$2\pi r^2$`, r`$2\pi r^2$`),
          feedback: t(
            r`That's only the curved part. A solid hemisphere also has its flat circle, $\pi r^2$.`,
            r`यह केवल वक्र भाग है। ठोस अर्धगोले का सपाट वृत्त $\pi r^2$ भी होता है।`,
          ),
        },
        {
          id: "four",
          label: t(r`$4\pi r^2$`, r`$4\pi r^2$`),
          feedback: t(
            r`That's the whole sphere. Half of it is $2\pi r^2$, plus the flat circle $\pi r^2$.`,
            r`यह पूरा गोला है। उसका आधा $2\pi r^2$ है, और सपाट वृत्त $\pi r^2$।`,
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("The sphere and the hemisphere", "गोला और अर्धगोला")),
      w.definition(
        t(
          "**Sphere and hemisphere.** A **sphere** is a perfectly round ball: every point on it is the same distance $r$ from its centre. Cut it through the centre and each half is a **hemisphere**, with a curved part and one flat circle.",
          "**गोला और अर्धगोला।** **गोला** एक पूरी तरह गोल गेंद है: उसका हर बिंदु केंद्र से समान दूरी $r$ पर होता है। उसे केंद्र से काटो तो हर आधा भाग एक **अर्धगोला** है, जिसका एक वक्र भाग और एक सपाट वृत्त होता है।",
        ),
      ),
      ball,
      w.body(
        t(
          r`A sphere's surface is exactly four circles of its own radius: $$\text{SA} = 4\pi r^2$$ $$V = \tfrac{4}{3}\pi r^3$$`,
          r`गोले का पृष्ठ ठीक अपनी ही त्रिज्या के चार वृत्तों जितना है: $$\text{SA} = 4\pi r^2$$ $$V = \tfrac{4}{3}\pi r^3$$`,
        ),
      ),
      half,
      w.body(
        t(
          r`A hemisphere is half of that: $$\text{CSA} = 2\pi r^2$$ $$V = \tfrac{2}{3}\pi r^3$$ A solid hemisphere also has its flat circle.`,
          r`अर्धगोला उसका आधा है: $$\text{CSA} = 2\pi r^2$$ $$V = \tfrac{2}{3}\pi r^3$$ ठोस अर्धगोले का सपाट वृत्त भी होता है।`,
        ),
      ),
      flat,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** Grandpa's log of wood: its curved surface and volume. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const log = viewerOn(
      b,
      "log",
      {
        solid: Solid.Cylinder,
        dims: { l: 6, b: 4, h: 10, a: 5, r: 3.5, r1: 6, r2: 3 },
        pi: Pi.Sevenths,
        measures: [Measure.Curved, Measure.Total, Measure.Volume],
      },
      "Grandpa's piece of wood, a cylinder of radius 3.5 cm and height 10 cm, with buttons for its curved surface, total surface and volume",
    );
    const goal = goalQuestion(b, {
      about: log,
      prompt: t(
        "How much wood is in it? Pick the measure that answers that.",
        "इसमें कितनी लकड़ी है? वह माप चुनो जो इसका जवाब देता है।",
      ),
      isMet: log.field("measure").eq(Measure.Volume),
      solve: [log.learner(ViewerAction.Pick, { measure: Measure.Volume })],
      notes: [
        {
          when: log.field("measure").eq(Measure.Curved),
          say: t(
            "That's the area of the round outside, in cm². How much wood is the space it takes up.",
            "यह गोल बाहरी भाग का क्षेत्रफल है, cm² में। कितनी लकड़ी, यानी वह कितनी जगह घेरती है।",
          ),
          reach: [log.learner(ViewerAction.Pick, { measure: Measure.Curved })],
        },
      ],
    });
    return column([
      w.title(t("Grandpa's piece of wood", "दादाजी का लकड़ी का टुकड़ा")),
      w.body(
        t(
          r`Grandpa starts every toy from a round piece of wood, a cylinder of radius 3.5 cm and height 10 cm. Its curved surface is $$2\pi r h = 2 \times \tfrac{22}{7} \times 3.5 \times 10 = 220 \text{ cm}^2$$`,
          r`दादाजी हर खिलौना लकड़ी के एक गोल टुकड़े से शुरू करते हैं, जो त्रिज्या 3.5 cm और ऊँचाई 10 cm का बेलन है। उसका वक्र पृष्ठ है $$2\pi r h = 2 \times \tfrac{22}{7} \times 3.5 \times 10 = 220 \text{ cm}^2$$`,
        ),
      ),
      log,
      goal,
      w.body(
        t(
          r`$$V = \pi r^2 h = \tfrac{22}{7} \times 3.5 \times 3.5 \times 10$$ $$= 385 \text{ cm}^3$$ That's the wood. But Grandpa's toys are not single solids: a lattu is a cone *and* a hemisphere. Kabir's question, \"how much paint for one lattu?\", needs the next stop.`,
          r`$$V = \pi r^2 h = \tfrac{22}{7} \times 3.5 \times 3.5 \times 10$$ $$= 385 \text{ cm}^3$$ यह लकड़ी है। पर दादाजी के खिलौने अकेले ठोस नहीं हैं: लट्टू एक शंकु *और* एक अर्धगोला है। कबीर का सवाल, \"एक लट्टू के लिए कितना पेंट?\", अगले पड़ाव पर हल होगा।`,
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** Quick recall, then the mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const slant = choiceQuestion(b, {
      name: "slant",
      prompt: t(
        "A cone has radius 6 cm and height 8 cm. Its slant height is",
        "एक शंकु की त्रिज्या 6 cm और ऊँचाई 8 cm है। उसकी तिर्यक ऊँचाई है",
      ),
      options: [
        { id: "right", label: t("10 cm", "10 cm") },
        {
          id: "14",
          label: t("14 cm", "14 cm"),
          feedback: t(
            r`Sides of a right triangle don't add. $l = \sqrt{6^2 + 8^2} = \sqrt{100}$.`,
            r`समकोण त्रिभुज की भुजाएँ जुड़ती नहीं। $l = \sqrt{6^2 + 8^2} = \sqrt{100}$।`,
          ),
        },
        {
          id: "2",
          label: t("2 cm", "2 cm"),
          feedback: t(
            r`The slant is the longest side, the hypotenuse: $\sqrt{36 + 64}$, not $8 - 6$.`,
            r`तिर्यक ऊँचाई सबसे लंबी भुजा, कर्ण, है: $\sqrt{36 + 64}$, $8 - 6$ नहीं।`,
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const fill = choiceQuestion(b, {
      name: "fill",
      prompt: t(
        "A cone and a cylinder have the same base and the same height. How many cones of water fill the cylinder?",
        "एक शंकु और एक बेलन का आधार और ऊँचाई एक जैसी है। बेलन भरने में शंकु भर पानी कितनी बार लगेगा?",
      ),
      options: [
        { id: "right", label: t("3", "3") },
        {
          id: "2",
          label: t("2", "2"),
          feedback: t(
            r`The cone's volume is $\tfrac{1}{3}\pi r^2 h$, a third of the cylinder's, not a half.`,
            r`शंकु का आयतन $\tfrac{1}{3}\pi r^2 h$ है, बेलन का एक-तिहाई, आधा नहीं।`,
          ),
        },
        {
          id: "4",
          label: t("4", "4"),
          feedback: t(
            r`$\tfrac{4}{3}$ belongs to the sphere. The cone is $\tfrac{1}{3}$ of the cylinder.`,
            r`$\tfrac{4}{3}$ गोले का है। शंकु बेलन का $\tfrac{1}{3}$ है।`,
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ Paint is surface area; syrup and juice are volume. ✓ We have the formulas for the cuboid, cylinder, cone, sphere and hemisphere. ✗ Grandpa's toys are joined solids, and Kabir still doesn't know how much paint a lattu needs. Next stop: painting joined solids.",
        "**मिशन लॉग।** ✓ पेंट पृष्ठीय क्षेत्रफल है; चाशनी और जूस आयतन हैं। ✓ हमारे पास घनाभ, बेलन, शंकु, गोले और अर्धगोले के सूत्र हैं। ✗ दादाजी के खिलौने जुड़े हुए ठोस हैं, और कबीर अभी नहीं जानता कि लट्टू के लिए कितना पेंट चाहिए। अगला पड़ाव: जुड़े ठोसों को रंगना।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(slant.on(QuestionSignal.Correct), theBoard.show(fill));
    b.when(fill.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), slant, fill, log, space()]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [hook, why, words, cylinder, cone, sphere, inLife, yourTurn];

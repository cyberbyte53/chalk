import { type BoardKit, PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, goalQuestion, wordsOn } from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  ElectricityScene,
  Material,
  WireAction,
  WireDerived,
  wireResistanceDef,
} from "@chalk/prop-electricity";
import { sceneOn } from "../kit";

const r = String.raw;

/** A wire on the bench, compared with nichrome wire (1): length l, area A. */
function wireOn(
  b: BoardKit,
  name: string,
  options: {
    canSetMaterial?: boolean;
    canSetLength?: boolean;
    canSetArea?: boolean;
    showTable?: boolean;
  } = {},
) {
  const wire = b.prop(wireResistanceDef, name, {
    material: Material.Nichrome,
    length: 1,
    area: 1,
    reference: { material: Material.Nichrome, length: 1, area: 1 },
    showFormula: false,
    showCurrent: true,
    showTable: options.showTable ?? false,
    canSetMaterial: options.canSetMaterial ?? false,
    canSetLength: options.canSetLength ?? false,
    canSetArea: options.canSetArea ?? false,
  });
  if (options.canSetMaterial === true) b.studentOnly(wire.action(WireAction.SetMaterial));
  if (options.canSetLength === true) b.studentOnly(wire.action(WireAction.SetLength));
  if (options.canSetArea === true) b.studentOnly(wire.action(WireAction.SetArea));
  return wire;
}

/* Hook */

const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const pic = sceneOn(
    b,
    "pic",
    ElectricityScene.BillShock,
    "the family at home with the bill; Grandpa's room heater stands in the corner",
  );
  return column([
    w.title(t("Coil and cord", "कुंडली और तार")),
    pic,
    w.body(
      t(
        "Stop 4 found that the heater draws a big current because its resistance is small. Kabir unscrews the heater's back (with Grandpa watching). Inside, a long, thin coil of grey wire: **nichrome**. The cord that brings the current in is thick and made of shiny **copper**. Why two different wires? What decides how much a wire resists? Fifth stop: **what resistance depends on**.",
        "पड़ाव 4 ने पाया कि हीटर बड़ी धारा लेता है क्योंकि उसका प्रतिरोध कम है। कबीर (दादाजी की निगरानी में) हीटर का पिछला हिस्सा खोलता है। अंदर स्लेटी तार की एक लंबी, पतली कुंडली है: **नाइक्रोम**। धारा अंदर लाने वाला तार मोटा है और चमकीले **ताँबे** का बना है। दो अलग तार क्यों? किसी तार का प्रतिरोध कौन तय करता है? पाँचवाँ पड़ाव: **प्रतिरोध किन बातों पर निर्भर है**।",
      ),
    ),
    space(),
  ]);
});

/* Learn */

/** Length: double l, double R, half the current. */
const length = page(
  "length",
  (b) => {
    const w = wordsOn(b);
    const wire = wireOn(b, "wire", { canSetLength: true });
    b.standsFor(
      wire,
      "NCERT Activity 12.3: a nichrome wire on one cell, drawn to its length and thickness, compared with wire (1) of length l and area A; the length can be changed",
    );
    const goal = goalQuestion(b, {
      about: wire,
      prompt: t(
        "Make the wire twice as long as wire (1), keeping it as thick. What happens to the current?",
        "तार को तार (1) से दोगुना लंबा करो, मोटाई वही रखते हुए। धारा का क्या होता है?",
      ),
      isMet: wire
        .derived(WireDerived.RatioToReference)
        .ge(1.99)
        .and(wire.derived(WireDerived.RatioToReference).le(2.01)),
      solve: [wire.learner(WireAction.SetLength, { length: 2 })],
    });
    const found = w.body(
      t(
        "Twice the length, **twice the resistance**, so half the current. The electrons have twice as far to push through the crowd of atoms.",
        "दोगुनी लंबाई, **दोगुना प्रतिरोध**, इसलिए आधी धारा। इलेक्ट्रॉनों को परमाणुओं की भीड़ में दोगुनी दूरी तक धकेलना होता है।",
      ),
      "found",
      { isHidden: true },
    );
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(found));
    return column([
      w.title(t("Longer wire", "लंबा तार")),
      w.body(
        t(
          "NCERT Activity 12.3. One cell drives a current through a nichrome wire. Wire (1) has length l and cross-sectional area A (the area of the slice straight across it; a thicker wire has a bigger area). Change one thing at a time and read the current.",
          "NCERT क्रियाकलाप 12.3। एक सेल नाइक्रोम तार में धारा बहाता है। तार (1) की लंबाई l और अनुप्रस्थ काट का क्षेत्रफल A है (उसके आर-पार टुकड़े का क्षेत्रफल; मोटे तार का क्षेत्रफल बड़ा होता है)। एक बार में एक चीज़ बदलो और धारा पढ़ो।",
        ),
      ),
      wire,
      goal,
      found,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Area: a thicker wire passes more current. */
const thick = page(
  "thick",
  (b) => {
    const w = wordsOn(b);
    const wire = wireOn(b, "wire", { canSetArea: true });
    b.standsFor(
      wire,
      "the nichrome wire again, now with its thickness (area of cross-section) adjustable, compared with wire (1)",
    );
    const ask = choiceQuestion(b, {
      prompt: t(
        "Make the wire thicker (twice the area). Will current flow more easily through the thick wire or the thin one, on the same cell?",
        "तार को मोटा करो (दोगुना क्षेत्रफल)। एक ही सेल पर, धारा मोटे तार में आसानी से बहेगी या पतले में?",
      ),
      options: [
        {
          id: "right",
          label: t("The thick one", "मोटे में"),
        },
        {
          id: "thin",
          label: t("The thin one", "पतले में"),
          feedback: t(
            "Read the current: the thick wire carries more. A wider wire is like a wider road: more room for charge to flow.",
            "धारा पढ़ो: मोटा तार ज़्यादा ले जाता है। चौड़ा तार चौड़ी सड़क जैसा है: आवेश के बहने के लिए ज़्यादा जगह।",
          ),
        },
      ],
      answer: "right",
    });
    const halved = w.body(
      t(
        "Twice the area, **half the resistance**, so twice the current. A wider wire is like a wider road: more room for charge to flow side by side.",
        "दोगुना क्षेत्रफल, **आधा प्रतिरोध**, इसलिए दोगुनी धारा। चौड़ा तार चौड़ी सड़क जैसा है: आवेश के साथ-साथ बहने के लिए ज़्यादा जगह।",
      ),
      "halved",
      { isHidden: true },
    );
    b.when(ask.on(QuestionSignal.Correct), theBoard.show(halved));
    return column([w.title(t("Thicker wire", "मोटा तार")), wire, ask, halved, space()]);
  },
  { passOn: PassOn.Rules },
);

/** Material, and R = ρl/A. */
const material = page(
  "material",
  (b) => {
    const w = wordsOn(b);
    const wire = wireOn(b, "wire", { canSetMaterial: true, showTable: true });
    b.standsFor(
      wire,
      "the wire with its material changeable among the metals and alloys of NCERT Table 12.2, the table of resistivities shown below it",
    );
    const ask = choiceQuestion(b, {
      prompt: t(
        "Using the table, which of these is the best conductor?",
        "तालिका से, इनमें सबसे अच्छा चालक कौन है?",
      ),
      options: [
        { id: "right", label: t("Silver", "चाँदी") },
        {
          id: "nichrome",
          label: t("Nichrome", "नाइक्रोम"),
          feedback: t(
            "Nichrome has the largest resistivity in the table: the worst conductor of these.",
            "तालिका में नाइक्रोम की प्रतिरोधकता सबसे ज़्यादा है: इनमें सबसे ख़राब चालक।",
          ),
        },
        {
          id: "mercury",
          label: t("Mercury", "पारा"),
          feedback: t(
            "The best conductor has the smallest resistivity. Mercury's is about 60 times silver's.",
            "सबसे अच्छे चालक की प्रतिरोधकता सबसे कम होती है। पारे की चाँदी से लगभग 60 गुना है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("The material matters too", "पदार्थ भी मायने रखता है")),
      w.definition(
        t(
          r`**What resistance depends on.** For a uniform metal wire, the resistance is directly proportional to its length $l$ and inversely proportional to its area of cross-section $A$: $$R \propto l \qquad R \propto \frac{1}{A}$$ Together: $$R = \rho \frac{l}{A}$$`,
          r`**प्रतिरोध किस पर निर्भर है।** एक समान धातु के तार का प्रतिरोध उसकी लंबाई $l$ के अनुक्रमानुपाती और अनुप्रस्थ काट के क्षेत्रफल $A$ के व्युत्क्रमानुपाती होता है: $$R \propto l \qquad R \propto \frac{1}{A}$$ मिलाकर: $$R = \rho \frac{l}{A}$$`,
        ),
      ),
      w.definition(
        t(
          r`**Resistivity.** The constant $\rho$ (rho) is the **resistivity** of the material. It depends only on what the wire is made of (and its temperature), not on its shape. Its unit is the ohm metre ($\Omega$ m). Metals and alloys have resistivities from $10^{-8}$ to $10^{-6}\ \Omega$ m; insulators like rubber and glass have $10^{12}$ to $10^{17}\ \Omega$ m.`,
          r`**प्रतिरोधकता।** स्थिरांक $\rho$ (रो) पदार्थ की **प्रतिरोधकता** है। यह केवल इस पर निर्भर है कि तार किस चीज़ का बना है (और उसके ताप पर), उसके आकार पर नहीं। इसका मात्रक ओम मीटर ($\Omega$ m) है। धातुओं और मिश्रातुओं की प्रतिरोधकता $10^{-8}$ से $10^{-6}\ \Omega$ m होती है; रबड़ और काँच जैसे विद्युतरोधियों की $10^{12}$ से $10^{17}\ \Omega$ m।`,
        ),
      ),
      w.body(
        t(
          "Swap the material, keeping the same length and thickness, and watch the current.",
          "लंबाई और मोटाई वही रखते हुए पदार्थ बदलो, और धारा देखो।",
        ),
      ),
      wire,
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Alloys, tungsten, copper and aluminium: what each is used for. */
const uses = page(
  "uses",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      prompt: t(
        "Why are the coils of toasters and irons made of an alloy rather than a pure metal?",
        "टोस्टर और इस्त्री की कुंडलियाँ शुद्ध धातु की जगह मिश्रातु की क्यों बनाई जाती हैं?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "An alloy has a higher resistivity and doesn't oxidise (burn) readily when hot",
            "मिश्रातु की प्रतिरोधकता ज़्यादा होती है और वह गर्म होने पर आसानी से ऑक्सीकृत नहीं होती (जलती नहीं)",
          ),
        },
        {
          id: "cheap",
          label: t("Alloys conduct better than metals", "मिश्रातु धातुओं से बेहतर चालक हैं"),
          feedback: t(
            "Check the table: alloys have higher resistivity than the metals they're made from. That's exactly why they heat up.",
            "तालिका देखो: मिश्रातुओं की प्रतिरोधकता उनकी धातुओं से ज़्यादा है। इसीलिए वे गर्म होते हैं।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("The right wire for the job", "काम के लिए सही तार")),
      w.definition(
        t(
          '**Alloys.** An **alloy** is a mixture of metals. Its resistivity is generally higher than that of the metals it is made from, and it does not **oxidise** (react with oxygen, "burn") readily at high temperatures. So alloys like nichrome are used in heating devices: irons, toasters, heaters.',
          '**मिश्रातु।** **मिश्रातु** धातुओं का मिश्रण है। इसकी प्रतिरोधकता आम तौर पर उन धातुओं से ज़्यादा होती है जिनसे यह बनी है, और यह ऊँचे ताप पर आसानी से **ऑक्सीकृत** नहीं होती (ऑक्सीजन से अभिक्रिया, "जलना")। इसलिए नाइक्रोम जैसी मिश्रातुएँ तापन युक्तियों में लगती हैं: इस्त्री, टोस्टर, हीटर।',
        ),
      ),
      w.definition(
        t(
          "**Other choices.** **Tungsten** is used almost only for the filaments of bulbs (it survives very high temperatures, stop 8). **Copper** and **aluminium**, with very low resistivity, are used for wires and electricity transmission lines, so little energy is wasted in them.",
          "**दूसरे विकल्प।** **टंगस्टन** लगभग केवल बल्बों के तंतु के लिए उपयोग होता है (यह बहुत ऊँचे ताप सह लेता है, पड़ाव 8)। **ताँबा** और **ऐलुमिनियम**, जिनकी प्रतिरोधकता बहुत कम है, तारों और बिजली की संचरण लाइनों में लगते हैं, ताकि उनमें कम ऊर्जा बर्बाद हो।",
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* See it in life */

const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      prompt: t(
        "So why is the heater's coil long, thin nichrome, while its cord is thick copper?",
        "तो हीटर की कुंडली लंबा, पतला नाइक्रोम क्यों है, जबकि उसका तार मोटा ताँबा है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "The coil should have a large resistance and not burn; the cord should have almost none",
            "कुंडली का प्रतिरोध बड़ा होना चाहिए और वह जले नहीं; तार का प्रतिरोध लगभग शून्य होना चाहिए",
          ),
        },
        {
          id: "same",
          label: t("It doesn't matter; any wire would do", "फ़र्क नहीं पड़ता; कोई भी तार चलेगा"),
          feedback: t(
            "A copper coil would have a tiny resistance, and a nichrome cord would get hot. Each wire has its job.",
            "ताँबे की कुंडली का प्रतिरोध बहुत कम होगा, और नाइक्रोम का तार गर्म होगा। हर तार का अपना काम है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const answer = w.body(
      t(
        'Long, thin and high resistivity: everything about the coil gives it resistance, and nichrome doesn\'t burn when red hot. The cord is short, thick copper: as little resistance as possible. Kabir: "So the coil is where the electricity turns into heat?" Exactly. Stop 8 measures how much.',
        'लंबा, पतला और ज़्यादा प्रतिरोधकता: कुंडली की हर बात उसे प्रतिरोध देती है, और नाइक्रोम लाल-गर्म होने पर भी नहीं जलता। तार छोटा, मोटा ताँबा है: जितना हो सके कम प्रतिरोध। कबीर: "तो कुंडली वह जगह है जहाँ बिजली गर्मी बनती है?" बिल्कुल। पड़ाव 8 मापता है कितनी।',
      ),
      "answer",
      { isHidden: true },
    );
    b.when(ask.on(QuestionSignal.Correct), [theBoard.show(answer), theBoard.pass()]);
    return column([
      w.title(t("Coil and cord, explained", "कुंडली और तार, समझाकर")),
      ask,
      answer,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* Practice */

/** Worked: NCERT Examples 12.5 and 12.6. */
const examples = page("examples", (b) => {
  const w = wordsOn(b);
  return column([
    w.title(t("Two worked examples", "दो हल किए गए उदाहरण")),
    w.body(
      t(
        "**A metal wire 1 m long has a resistance of 26 Ω at 20 °C. Its diameter is 0.3 mm. Find the resistivity, and use Table 12.2 to name the metal.**",
        "**1 m लंबे धातु के तार का 20 °C पर प्रतिरोध 26 Ω है। उसका व्यास 0.3 mm है। प्रतिरोधकता निकालो, और तालिका 12.2 से धातु पहचानो।**",
      ),
    ),
    w.body(
      t(
        r`The area of a circle of diameter $d$ is $A = \pi d^2/4$, with $d = 3 \times 10^{-4}$ m. From $R = \rho l / A$: $$\rho = \frac{RA}{l} = \frac{R \pi d^2}{4l}$$ $$\rho = \frac{26 \times 3.14 \times (3 \times 10^{-4})^2}{4 \times 1}$$ $$\rho \approx 1.84 \times 10^{-6}\ \Omega \text{ m}$$ That is the resistivity of **manganese**.`,
        r`व्यास $d$ वाले वृत्त का क्षेत्रफल $A = \pi d^2/4$ है, जहाँ $d = 3 \times 10^{-4}$ m। $R = \rho l / A$ से: $$\rho = \frac{RA}{l} = \frac{R \pi d^2}{4l}$$ $$\rho = \frac{26 \times 3.14 \times (3 \times 10^{-4})^2}{4 \times 1}$$ $$\rho \approx 1.84 \times 10^{-6}\ \Omega \text{ m}$$ यह **मैंगनीज़** की प्रतिरोधकता है।`,
      ),
    ),
    w.body(
      t(
        "**A wire of length l and area A has resistance 4 Ω. What is the resistance of a wire of the same material, length l/2 and area 2A?**",
        "**लंबाई l और क्षेत्रफल A वाले तार का प्रतिरोध 4 Ω है। उसी पदार्थ के, लंबाई l/2 और क्षेत्रफल 2A वाले तार का प्रतिरोध कितना है?**",
      ),
    ),
    w.body(
      t(
        r`Half the length halves $R$; twice the area halves it again: $$R_2 = \rho \frac{l/2}{2A} = \frac{1}{4} \rho \frac{l}{A} = \frac{1}{4} \times 4\ \Omega = 1\ \Omega$$`,
        r`आधी लंबाई $R$ को आधा करती है; दोगुना क्षेत्रफल उसे फिर आधा करता है: $$R_2 = \rho \frac{l/2}{2A} = \frac{1}{4} \rho \frac{l}{A} = \frac{1}{4} \times 4\ \Omega = 1\ \Omega$$`,
      ),
    ),
    space(),
  ]);
});

/** Your turn (Exercise 6), then the mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      name: "length",
      prompt: t(
        "A copper wire (ρ = 1.6 × 10⁻⁸ Ω m) has a diameter of 0.5 mm. About how long must it be to have a resistance of 10 Ω?",
        "ताँबे के एक तार (ρ = 1.6 × 10⁻⁸ Ω m) का व्यास 0.5 mm है। 10 Ω प्रतिरोध के लिए उसे लगभग कितना लंबा होना चाहिए?",
      ),
      options: [
        { id: "right", label: t("About 123 m", "लगभग 123 m") },
        {
          id: "radius",
          label: t("About 31 m", "लगभग 31 m"),
          feedback: t(
            r`That put the radius (0.25 mm) into a formula meant for the diameter. With $d = 0.5$ mm: $A = \pi d^2/4 = 1.96 \times 10^{-7}$ m², then $l = RA/\rho$.`,
            r`इसमें व्यास वाले सूत्र में त्रिज्या (0.25 mm) लगा दी गई। $d = 0.5$ mm लेकर: $A = \pi d^2/4 = 1.96 \times 10^{-7}$ m², फिर $l = RA/\rho$।`,
          ),
        },
        {
          id: "mm",
          label: t("About 0.12 m", "लगभग 0.12 m"),
          feedback: t(
            "Change 0.5 mm into metres before squaring: 5 × 10⁻⁴ m.",
            "वर्ग करने से पहले 0.5 mm को मीटर में बदलो: 5 × 10⁻⁴ m।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const doubled = choiceQuestion(b, {
      name: "doubled",
      prompt: t(
        "If that wire's diameter is doubled (same length), what does its resistance become?",
        "यदि उस तार का व्यास दोगुना कर दिया जाए (लंबाई वही), तो उसका प्रतिरोध कितना हो जाएगा?",
      ),
      options: [
        { id: "right", label: t("2.5 Ω, a quarter", "2.5 Ω, एक चौथाई") },
        {
          id: "half",
          label: t("5 Ω, half", "5 Ω, आधा"),
          feedback: t(
            "Area goes with the diameter squared: double d, four times A, a quarter of R.",
            "क्षेत्रफल व्यास के वर्ग के साथ चलता है: d दोगुना, A चार गुना, R एक चौथाई।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ R = ρl/A: longer wire, more resistance; thicker wire, less. ✓ Resistivity ρ belongs to the material. ✓ Alloys like nichrome make heating coils; copper and aluminium carry current with little loss. Next stop: joining resistors one after another.",
        "**मिशन लॉग।** ✓ R = ρl/A: लंबा तार, ज़्यादा प्रतिरोध; मोटा तार, कम। ✓ प्रतिरोधकता ρ पदार्थ की है। ✓ नाइक्रोम जैसी मिश्रातुएँ तापन कुंडलियाँ बनाती हैं; ताँबा और ऐलुमिनियम कम हानि से धारा ले जाते हैं। अगला पड़ाव: प्रतिरोधकों को एक के बाद एक जोड़ना।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(ask.on(QuestionSignal.Correct), theBoard.show(doubled));
    b.when(doubled.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), ask, doubled, log, space()]);
  },
  { passOn: PassOn.Rules },
);

export const overview = [hook, length, thick, material, uses, inLife, examples, yourTurn];

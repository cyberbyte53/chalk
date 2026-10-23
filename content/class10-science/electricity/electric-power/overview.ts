import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, goalQuestion, wordsOn } from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  Appliance,
  BillAction,
  BillDerived,
  ElectricityScene,
  electricityBillDef,
} from "@chalk/prop-electricity";
import { sceneOn } from "../kit";

const r = String.raw;

/**
 * The family's January: 18 units a day, 540 units in 30 days, ₹3,240 at ₹6 a unit.
 * Rows: 0 bulbs, 1 fans, 2 fridge, 3 TV, 4 iron, 5 heater, 6 geyser, 7 chargers.
 */
const januaryRows = [
  { appliance: Appliance.Bulb, count: 4, hours: 6 },
  { appliance: Appliance.Fan, count: 3, hours: 8 },
  { appliance: Appliance.Fridge, count: 1, hours: 8 },
  { appliance: Appliance.Tv, count: 1, hours: 4 },
  { appliance: Appliance.Iron, count: 1, hours: 0.5 },
  { appliance: Appliance.Heater, count: 1, hours: 3 },
  { appliance: Appliance.Geyser, count: 1, hours: 1.5 },
  { appliance: Appliance.Charger, count: 2, hours: 10 },
];

/* Hook */

const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const pic = sceneOn(
    b,
    "pic",
    ElectricityScene.MeterBox,
    "the electricity meter by the front door reading 04172 kW h; Riya with her notebook",
  );
  return column([
    w.title(t("What the meter counts", "मीटर क्या गिनता है")),
    pic,
    w.body(
      t(
        "Back to where it started: the meter by the door. Under its numbers it says **kW h**. Riya now knows charge isn't used up (stop 1), the bill must be for energy (stop 2), and the heater, iron and geyser turn it into heat fastest (stop 8). Last stop: **electric power**, how fast energy is used, and how to read the bill.",
        "वहीं वापस जहाँ से शुरू हुआ था: दरवाज़े के पास का मीटर। उसके अंकों के नीचे **kW h** लिखा है। रिया अब जानती है कि आवेश ख़र्च नहीं होता (पड़ाव 1), बिल ऊर्जा का होना चाहिए (पड़ाव 2), और हीटर, इस्त्री और गीज़र उसे सबसे तेज़ी से गर्मी में बदलते हैं (पड़ाव 8)। आख़िरी पड़ाव: **विद्युत शक्ति**, ऊर्जा कितनी तेज़ी से ख़र्च होती है, और बिल कैसे पढ़ें।",
      ),
    ),
    space(),
  ]);
});

/* Learn */

/** Power: P = VI = I²R = V²/R; the watt. */
const power = page(
  "power",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      prompt: t(
        "A bulb on 220 V draws 0.50 A. What is its power?",
        "220 V पर एक बल्ब 0.50 A लेता है। उसकी शक्ति कितनी है?",
      ),
      options: [
        { id: "right", label: t("110 W", "110 W") },
        {
          id: "div",
          label: t("440 W", "440 W"),
          feedback: t("That's 220 ÷ 0.5. Power is V × I.", "यह 220 ÷ 0.5 है। शक्ति V × I है।"),
        },
        {
          id: "ohms",
          label: t("440 Ω", "440 Ω"),
          feedback: t(
            "V ÷ I is the resistance. Power is V × I, in watts.",
            "V ÷ I प्रतिरोध है। शक्ति V × I है, वाट में।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Electric power", "विद्युत शक्ति")),
      w.definition(
        t(
          "**Power.** From Class 9: **power** is the rate of doing work, which is the same as the rate of using energy. **Electric power** is the rate at which electrical energy is used (dissipated) in a circuit.",
          "**शक्ति।** कक्षा 9 से: **शक्ति** कार्य करने की दर है, जो ऊर्जा ख़र्च करने की दर के बराबर है। **विद्युत शक्ति** वह दर है जिससे परिपथ में विद्युत ऊर्जा ख़र्च (क्षय) होती है।",
        ),
      ),
      w.definition(
        t(
          r`**In symbols.** The energy used in time $t$ is $VIt$ (stop 8), so the energy per second is $$P = VI$$ Using $V = IR$ or $I = V/R$, the same power can be written $$P = I^2R = \frac{V^2}{R}$$`,
          r`**प्रतीकों में।** समय $t$ में ख़र्च ऊर्जा $VIt$ है (पड़ाव 8), इसलिए प्रति सेकंड ऊर्जा है $$P = VI$$ $V = IR$ या $I = V/R$ लगाकर वही शक्ति ऐसे लिखी जा सकती है $$P = I^2R = \frac{V^2}{R}$$`,
        ),
      ),
      w.definition(
        t(
          "**The watt.** Power is measured in **watts** (W). One watt is the power of a device that carries 1 A at a potential difference of 1 V: 1 W = 1 V × 1 A. A watt is small, so we often use the **kilowatt**: 1 kW = 1000 W.",
          "**वाट।** शक्ति **वाट** (W) में मापी जाती है। एक वाट उस युक्ति की शक्ति है जो 1 V विभवांतर पर 1 A धारा लेती है: 1 W = 1 V × 1 A। वाट छोटा है, इसलिए अक्सर **किलोवाट** का उपयोग करते हैं: 1 kW = 1000 W।",
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Energy = power × time; the kW h, the "unit". */
const units = page(
  "units",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      prompt: t(
        "Which uses more energy: a 250 W TV in 1 hour, or a 1200 W toaster in 10 minutes?",
        "कौन ज़्यादा ऊर्जा लेता है: 1 घंटे में 250 W का टीवी, या 10 मिनट में 1200 W का टोस्टर?",
      ),
      options: [
        { id: "right", label: t("The TV: 250 W h against 200 W h", "टीवी: 250 W h बनाम 200 W h") },
        {
          id: "toaster",
          label: t("The toaster, because its power is bigger", "टोस्टर, क्योंकि उसकी शक्ति ज़्यादा है"),
          feedback: t(
            "Energy is power × time. The toaster runs only 1/6 of an hour: 1200 × 1/6 = 200 W h.",
            "ऊर्जा = शक्ति × समय। टोस्टर केवल 1/6 घंटा चलता है: 1200 × 1/6 = 200 W h।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("The unit on the bill", "बिल की यूनिट")),
      w.definition(
        t(
          r`**Energy from power.** Electrical energy is power multiplied by time: $$E = P \times t$$ So its unit can be the **watt hour** (W h): the energy used when 1 W of power is used for 1 hour.`,
          r`**शक्ति से ऊर्जा।** विद्युत ऊर्जा शक्ति गुणा समय है: $$E = P \times t$$ इसलिए इसका मात्रक **वाट घंटा** (W h) हो सकता है: 1 W शक्ति 1 घंटे तक ख़र्च होने पर ख़र्च ऊर्जा।`,
        ),
      ),
      w.definition(
        t(
          r`**The kilowatt hour.** The commercial unit of electrical energy is the **kilowatt hour** (kW h), the "unit" on the bill: $$1 \text{ kW h} = 1000 \text{ W} \times 3600 \text{ s} = 3.6 \times 10^6 \text{ J}$$`,
          r`**किलोवाट घंटा।** विद्युत ऊर्जा का व्यावसायिक मात्रक **किलोवाट घंटा** (kW h) है, बिल की "यूनिट": $$1 \text{ kW h} = 1000 \text{ W} \times 3600 \text{ s} = 3.6 \times 10^6 \text{ J}$$`,
        ),
      ),
      w.note(
        t(
          "Many people think electrons are used up in a circuit. They aren't. We pay the electricity company for the **energy** that moves the electrons through our fans, bulbs and heaters.",
          "बहुत लोग सोचते हैं कि परिपथ में इलेक्ट्रॉन ख़र्च हो जाते हैं। ऐसा नहीं है। हम बिजली कंपनी को उस **ऊर्जा** का भुगतान करते हैं जो हमारे पंखों, बल्बों और हीटरों में इलेक्ट्रॉनों को चलाती है।",
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Reading the family's bill. */
const bill = page(
  "bill",
  (b) => {
    const w = wordsOn(b);
    const sheet = b.prop(electricityBillDef, "sheet", {
      rows: januaryRows,
      rate: 6,
      days: 30,
      showWorking: true,
      showBars: true,
      canEdit: false,
      canSwap: false,
    });
    b.standsFor(
      sheet,
      "the family's appliances in January with their watts, how many and hours a day; each row's kW h a day, and the month's total of 540 units costing ₹3,240 at ₹6 a unit",
    );
    const ask = choiceQuestion(b, {
      prompt: t(
        "Which single appliance uses the most energy each day?",
        "कौन-सा अकेला उपकरण हर दिन सबसे ज़्यादा ऊर्जा लेता है?",
      ),
      options: [
        { id: "right", label: t("The room heater", "रूम हीटर") },
        {
          id: "fridge",
          label: t("The fridge", "फ़्रिज"),
          feedback: t(
            "The fridge is 3.2 kW h a day. The heater is 2000 W for 3 hours: 6 kW h.",
            "फ़्रिज दिन में 3.2 kW h है। हीटर 3 घंटे तक 2000 W: 6 kW h।",
          ),
        },
        {
          id: "bulbs",
          label: t("The bulbs, since they're on longest", "बल्ब, क्योंकि वे सबसे देर जलते हैं"),
          feedback: t(
            "Hours matter, but so does power: 4 × 100 W × 6 h is 2.4 kW h. The heater's 2000 W wins.",
            "घंटे मायने रखते हैं, पर शक्ति भी: 4 × 100 W × 6 h = 2.4 kW h। हीटर के 2000 W आगे हैं।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Reading the bill", "बिल पढ़ना")),
      w.body(
        t(
          "Riya and Kabir list every appliance, its power, how many there are and how long each runs a day. For each row, energy = power × time. Add the rows for a day, multiply by 30 days, then by the price of a unit (₹6).",
          "रिया और कबीर हर उपकरण, उसकी शक्ति, वे कितने हैं और रोज़ कितनी देर चलते हैं, सबकी सूची बनाते हैं। हर पंक्ति के लिए ऊर्जा = शक्ति × समय। एक दिन की पंक्तियाँ जोड़ो, 30 दिनों से गुणा करो, फिर एक यूनिट के दाम (₹6) से।",
        ),
      ),
      sheet,
      w.note(
        t(
          "18 kW h a day × 30 days = 540 units. 540 × ₹6 = ₹3,240: exactly Mom's bill.",
          "रोज़ 18 kW h × 30 दिन = 540 यूनिट। 540 × ₹6 = ₹3,240: ठीक मम्मी का बिल।",
        ),
      ),
      ask,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* See it in life */

/** The audit: bring the bill under ₹2,000. */
const audit = page(
  "audit",
  (b) => {
    const w = wordsOn(b);
    const sheet = b.prop(electricityBillDef, "sheet", {
      rows: januaryRows,
      rate: 6,
      days: 30,
      showWorking: true,
      showBars: true,
      canEdit: true,
      canSwap: true,
    });
    b.studentOnly(sheet.action(BillAction.SetHours));
    b.studentOnly(sheet.action(BillAction.Swap));
    b.standsFor(
      sheet,
      "the family's appliance list, now editable: hours a day can be changed and 100 W bulbs swapped for 9 W LEDs; the month's bill updates",
    );
    const goal = goalQuestion(b, {
      about: sheet,
      prompt: t(
        "The audit: bring the month's bill below ₹2,000 without giving up anything the family needs. (Fewer heater hours? A timer on the geyser? LEDs?)",
        "जाँच: परिवार की ज़रूरत की कोई चीज़ छोड़े बिना महीने का बिल ₹2,000 से नीचे लाओ। (हीटर के कम घंटे? गीज़र पर टाइमर? LED?)",
      ),
      isMet: sheet.derived(BillDerived.Cost).lt(2000),
      solve: [
        sheet.learner(BillAction.Swap, { index: 0 }),
        sheet.learner(BillAction.SetHours, { index: 5, hours: 1 }),
        sheet.learner(BillAction.SetHours, { index: 6, hours: 1 }),
      ],
    });
    const found = w.body(
      t(
        "Swapping four 100 W bulbs for 9 W LEDs saves over 2 units a day. But the big savings come from the **high-power** gadgets: every hour the 2000 W heater doesn't run saves 2 units, ₹12. The fridge, which runs all day, can't be cut much; the heater and geyser can.",
        "चार 100 W बल्बों की जगह 9 W के LED लगाने से रोज़ 2 से ज़्यादा यूनिट बचती हैं। पर बड़ी बचत **ज़्यादा शक्ति** वाले उपकरणों से आती है: 2000 W का हीटर जितने घंटे नहीं चलता, हर घंटे 2 यूनिट, ₹12 बचते हैं। फ़्रिज, जो दिन भर चलता है, ज़्यादा नहीं घटाया जा सकता; हीटर और गीज़र घटाए जा सकते हैं।",
      ),
      "found",
      { isHidden: true },
    );
    b.when(goal.on(QuestionSignal.Correct), [theBoard.show(found)]);
    return column([w.title(t("The audit", "जाँच")), sheet, goal, found, space()]);
  },
  { passOn: PassOn.Rules },
);

/* Practice */

/** Worked: NCERT Example 12.13 and in-text Q2. */
const examples = page("examples", (b) => {
  const w = wordsOn(b);
  return column([
    w.title(t("Two worked examples", "दो हल किए गए उदाहरण")),
    w.body(
      t(
        "**A refrigerator rated 400 W runs 8 hours a day. What does it cost to run for 30 days at ₹3.00 per kW h?**",
        "**400 W रेटिंग का एक फ़्रिज रोज़ 8 घंटे चलता है। ₹3.00 प्रति kW h की दर से 30 दिन चलाने का ख़र्च कितना है?**",
      ),
    ),
    w.body(
      t(
        r`Energy in 30 days: $$400 \text{ W} \times 8 \text{ h} \times 30 = 96\,000 \text{ W h}$$ $$96\,000 \text{ W h} = 96 \text{ kW h}$$ So the cost is 96 × ₹3.00 = **₹288**.`,
        r`30 दिन में ऊर्जा: $$400 \text{ W} \times 8 \text{ h} \times 30 = 96\,000 \text{ W h}$$ $$96\,000 \text{ W h} = 96 \text{ kW h}$$ इसलिए ख़र्च 96 × ₹3.00 = **₹288** है।`,
      ),
    ),
    w.body(
      t(
        "**A motor takes 5 A from a 220 V line. Find its power and the energy it uses in 2 hours.**",
        "**एक मोटर 220 V लाइन से 5 A लेती है। उसकी शक्ति और 2 घंटे में ख़र्च ऊर्जा निकालो।**",
      ),
    ),
    w.body(
      t(
        r`$$P = VI = 220 \text{ V} \times 5 \text{ A} = 1100 \text{ W}$$ $$E = P \times t = 1.1 \text{ kW} \times 2 \text{ h} = 2.2 \text{ kW h}$$ $$2.2 \times 3.6 \times 10^6 \text{ J} = 7.92 \times 10^6 \text{ J}$$`,
        r`$$P = VI = 220 \text{ V} \times 5 \text{ A} = 1100 \text{ W}$$ $$E = P \times t = 1.1 \text{ kW} \times 2 \text{ h} = 2.2 \text{ kW h}$$ $$2.2 \times 3.6 \times 10^6 \text{ J} = 7.92 \times 10^6 \text{ J}$$`,
      ),
    ),
    space(),
  ]);
});

/** Exercises 2, 3, 15, 12. */
const practice = page(
  "practice",
  (b) => {
    const w = wordsOn(b);
    const q1 = choiceQuestion(b, {
      name: "q1",
      prompt: t(
        "Which of these does **not** represent electrical power in a circuit?",
        "इनमें से कौन परिपथ में विद्युत शक्ति को **नहीं** दर्शाता?",
      ),
      options: [
        { id: "right", label: t("IR²", "IR²") },
        {
          id: "i2r",
          label: t("I²R", "I²R"),
          feedback: t("I²R is power: P = VI with V = IR.", "I²R शक्ति है: P = VI, जहाँ V = IR।"),
        },
        {
          id: "vi",
          label: t("VI", "VI"),
          feedback: t("VI is the definition of power.", "VI शक्ति की परिभाषा है।"),
        },
        {
          id: "v2r",
          label: t("V²/R", "V²/R"),
          feedback: t("V²/R is power: P = VI with I = V/R.", "V²/R शक्ति है: P = VI, जहाँ I = V/R।"),
        },
      ],
      answer: "right",
      passes: false,
    });
    const q2 = choiceQuestion(b, {
      name: "q2",
      prompt: t(
        "A bulb is rated 220 V, 100 W. What power does it use on 110 V?",
        "एक बल्ब की रेटिंग 220 V, 100 W है। 110 V पर वह कितनी शक्ति लेता है?",
      ),
      options: [
        { id: "right", label: t("25 W", "25 W") },
        {
          id: "half",
          label: t("50 W", "50 W"),
          feedback: t(
            "Its resistance stays the same, and P = V²/R: half the voltage gives a quarter of the power.",
            "उसका प्रतिरोध वही रहता है, और P = V²/R: आधा वोल्टेज, एक चौथाई शक्ति।",
          ),
        },
        {
          id: "same",
          label: t("100 W", "100 W"),
          feedback: t(
            "100 W is the power at its rated 220 V. At 110 V it's much dimmer.",
            "100 W उसके रेटेड 220 V पर शक्ति है। 110 V पर वह काफ़ी धीमा जलता है।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const q3 = choiceQuestion(b, {
      name: "q3",
      prompt: t(
        "Lamps of 100 W and 60 W (both rated for 220 V) are in parallel on the 220 V mains. What current is drawn from the line?",
        "100 W और 60 W के लैंप (दोनों 220 V के लिए) 220 V मेन्स पर पार्श्वक्रम में हैं। लाइन से कितनी धारा ली जाती है?",
      ),
      options: [
        { id: "right", label: t("About 0.73 A", "लगभग 0.73 A") },
        {
          id: "one",
          label: t("About 0.45 A", "लगभग 0.45 A"),
          feedback: t(
            "That's the 100 W lamp alone. In parallel the currents add: (100 + 60) ÷ 220.",
            "यह अकेला 100 W का लैंप है। पार्श्वक्रम में धाराएँ जुड़ती हैं: (100 + 60) ÷ 220।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    const q4 = choiceQuestion(b, {
      name: "q4",
      prompt: t(
        "How many 10 W lamps (for 220 V) can be connected in parallel on a 220 V line if the most current allowed is 5 A?",
        "यदि अधिकतम 5 A धारा की अनुमति हो, तो 220 V लाइन पर 10 W के (220 V वाले) कितने लैंप पार्श्वक्रम में जोड़े जा सकते हैं?",
      ),
      options: [
        { id: "right", label: t("110", "110") },
        {
          id: "fifty",
          label: t("50", "50"),
          feedback: t(
            "The line can supply 220 V × 5 A = 1100 W. Each lamp needs 10 W.",
            "लाइन 220 V × 5 A = 1100 W दे सकती है। हर लैंप को 10 W चाहिए।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    b.when(q1.on(QuestionSignal.Correct), theBoard.show(q2));
    b.when(q2.on(QuestionSignal.Correct), theBoard.show(q3));
    b.when(q3.on(QuestionSignal.Correct), theBoard.show(q4));
    b.when(q4.on(QuestionSignal.Correct), theBoard.pass());
    return column([w.title(t("Practice", "अभ्यास")), q1, q2, q3, q4, space()]);
  },
  { passOn: PassOn.Rules },
);

/** The finale: the next bill, and all nine stops. */
const finale = page("finale", (b) => {
  const w = wordsOn(b);
  const pic = sceneOn(
    b,
    "pic",
    ElectricityScene.BillHalved,
    "Mom holding up the new bill for ₹1,650, smiling; Riya with new earphones and Kabir with a cricket bat",
  );
  return column([
    w.title(t("The next bill", "अगला बिल")),
    pic,
    w.body(
      t(
        "February's bill arrives: **₹1,650**. LEDs everywhere, the geyser on a timer, the heater only when Grandpa is in his room (and a warmer blanket instead), and never the heater, iron and geyser together. Mom keeps her word: half of ₹1,590 saved. Riya gets her earphones. Kabir gets his bat, and a lecture about not playing cricket indoors.",
        "फ़रवरी का बिल आता है: **₹1,650**। हर जगह LED, गीज़र पर टाइमर, हीटर तभी जब दादाजी अपने कमरे में हों (और उसकी जगह एक गर्म कंबल), और हीटर, इस्त्री और गीज़र कभी एक साथ नहीं। मम्मी अपना वादा निभाती हैं: बचाए ₹1,590 का आधा। रिया को उसके ईयरफ़ोन मिलते हैं। कबीर को उसका बैट, और घर के अंदर क्रिकेट न खेलने पर एक भाषण।",
      ),
    ),
    w.definition(
      t(
        "**Mission complete.** (1) A **current** is a flow of charge: I = Q/t, in amperes, round a closed circuit. (2) A **potential difference** pushes it: V = W/Q, in volts. (3) **Circuit diagrams** use agreed symbols. (4) **Ohm's law**: V = IR. (5) **Resistance** R = ρl/A depends on length, thickness and material. (6) **In series**, resistances add and one break stops all. (7) **In parallel**, reciprocals add, each branch gets the full voltage: how homes are wired. (8) The **heating effect**: H = I²Rt, used in heaters and fuses. (9) **Power** P = VI; we pay for energy, in kW h.",
        "**मिशन पूरा।** (1) **धारा** आवेश का प्रवाह है: I = Q/t, ऐम्पियर में, बंद परिपथ में घूमता। (2) **विभवांतर** उसे धकेलता है: V = W/Q, वोल्ट में। (3) **परिपथ आरेख** तय प्रतीकों का उपयोग करते हैं। (4) **ओम का नियम**: V = IR। (5) **प्रतिरोध** R = ρl/A लंबाई, मोटाई और पदार्थ पर निर्भर है। (6) **श्रेणीक्रम** में प्रतिरोध जुड़ते हैं और एक टूटन सब रोक देती है। (7) **पार्श्वक्रम** में व्युत्क्रम जुड़ते हैं, हर शाखा को पूरा वोल्टेज मिलता है: घरों की वायरिंग ऐसे होती है। (8) **तापीय प्रभाव**: H = I²Rt, हीटरों और फ़्यूज़ में। (9) **शक्ति** P = VI; हम ऊर्जा का भुगतान करते हैं, kW h में।",
      ),
    ),
    space(),
  ]);
});

/** Your turn (Exercise 14), then the mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      prompt: t(
        "Compare the power used in the 2 Ω resistor in (i) a 6 V battery in series with 1 Ω and 2 Ω, and (ii) a 4 V battery in parallel with 12 Ω and 2 Ω.",
        "2 Ω के प्रतिरोधक में ख़र्च शक्ति की तुलना करो: (i) 6 V की बैटरी 1 Ω और 2 Ω के साथ श्रेणीक्रम में, और (ii) 4 V की बैटरी 12 Ω और 2 Ω के साथ पार्श्वक्रम में।",
      ),
      options: [
        { id: "right", label: t("The same: 8 W in both", "बराबर: दोनों में 8 W") },
        {
          id: "first",
          label: t("More in (i)", "(i) में ज़्यादा"),
          feedback: t(
            "(i) I = 6 ÷ 3 = 2 A, P = 2² × 2 = 8 W. (ii) The 2 Ω has the full 4 V: P = 4² ÷ 2 = 8 W.",
            "(i) I = 6 ÷ 3 = 2 A, P = 2² × 2 = 8 W। (ii) 2 Ω पर पूरे 4 V हैं: P = 4² ÷ 2 = 8 W।",
          ),
        },
        {
          id: "second",
          label: t("More in (ii)", "(ii) में ज़्यादा"),
          feedback: t(
            "Work both out: (i) 2² × 2 = 8 W; (ii) 4² ÷ 2 = 8 W.",
            "दोनों निकालो: (i) 2² × 2 = 8 W; (ii) 4² ÷ 2 = 8 W।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ Power P = VI = I²R = V²/R, in watts. ✓ Energy = power × time; the bill's unit is 1 kW h = 3.6 × 10⁶ J. ✓ High-power gadgets running for hours make the bill; cut those first. Chapter done. Now wait for February's bill…",
        "**मिशन लॉग।** ✓ शक्ति P = VI = I²R = V²/R, वाट में। ✓ ऊर्जा = शक्ति × समय; बिल की यूनिट 1 kW h = 3.6 × 10⁶ J। ✓ घंटों चलने वाले ज़्यादा शक्ति के उपकरण बिल बनाते हैं; पहले उन्हें घटाओ। अध्याय पूरा। अब फ़रवरी के बिल का इंतज़ार…",
      ),
      "log",
      { isHidden: true },
    );
    b.when(ask.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), ask, log, space()]);
  },
  { passOn: PassOn.Rules },
);

export const overview = [hook, power, units, bill, audit, examples, practice, yourTurn, finale];

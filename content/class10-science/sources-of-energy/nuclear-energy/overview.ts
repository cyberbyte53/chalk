import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, goalQuestion, wordsOn } from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  EnergyScene,
  FissionAction,
  FissionDerived,
  PlantAction,
  PlantKind,
  fissionDef,
  powerPlantDef,
} from "@chalk/prop-energy";
import { sceneOn } from "../kit";

const r = String.raw;

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** The news on Grandpa's radio. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const pic = sceneOn(
    b,
    "pic",
    EnergyScene.RadioNews,
    "Grandpa and the children listening to an old radio on a charpai in the evening",
  );
  return column([
    w.title(t("News on the radio", "रेडियो पर ख़बर")),
    pic,
    w.body(
      t(
        'During the evening power cut, Grandpa\'s old radio crackles with the news: a new unit at the **Tarapur nuclear power station**. "A few kilograms of uranium," says the announcer, "can give as much energy as thousands of tonnes of coal." Kabir sits up. Thousands of tonnes from a few kilograms? Then why isn\'t every village running on it?',
        'शाम की बिजली कटौती में दादाजी का पुराना रेडियो ख़बर सुनाता है: **तारापुर नाभिकीय बिजलीघर** में एक नई इकाई। "कुछ किलोग्राम यूरेनियम," उद्घोषक कहता है, "हज़ारों टन कोयले जितनी ऊर्जा दे सकता है।" कबीर सीधा बैठ जाता है। कुछ किलोग्राम से हज़ारों टन? तो फिर हर गाँव इससे क्यों नहीं चलता?',
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** Nuclear fission and the chain reaction. */
const fissionPage = page(
  "fission",
  (b) => {
    const w = wordsOn(b);
    const chain = b.prop(fissionDef, "chain", {
      generation: 0,
      isControlled: false,
      massLost: 0.2,
      showCalculator: false,
      canStep: true,
      canControl: false,
      canSetMass: false,
    });
    b.studentOnly(chain.action(FissionAction.Next));
    b.studentOnly(chain.action(FissionAction.Reset));
    b.standsFor(
      chain,
      "a slow neutron heading for a uranium nucleus; each split gives two lighter nuclei, energy and 3 neutrons, and next lets the neutrons hit more nuclei",
    );
    const goal = goalQuestion(b, {
      about: chain,
      prompt: t(
        "Let the neutrons hit, generation by generation, until 9 nuclei split at once.",
        "न्यूट्रॉनों को पीढ़ी दर पीढ़ी टकराने दो, जब तक 9 नाभिक एक साथ न टूटें।",
      ),
      isMet: chain.derived(FissionDerived.Fissions).eq(9),
      solve: [
        chain.learner(FissionAction.Next),
        chain.learner(FissionAction.Next),
        chain.learner(FissionAction.Next),
      ],
    });
    const found = w.body(
      t(
        "1, then 3, then 9: each split frees neutrons that split more nuclei. Left alone, the number keeps multiplying. This is a **chain reaction**.",
        "1, फिर 3, फिर 9: हर विखंडन न्यूट्रॉन छोड़ता है जो और नाभिक तोड़ते हैं। अकेला छोड़ने पर संख्या गुणा होती जाती है। यह **शृंखला अभिक्रिया** है।",
      ),
      "found",
      { isHidden: true },
    );
    b.when(goal.on(QuestionSignal.Correct), theBoard.show(found));
    return column([
      w.title(t("Splitting the nucleus", "नाभिक को तोड़ना")),
      w.definition(
        t(
          "**Nuclear fission.** The **nucleus** is the tiny centre of an atom. In **nuclear fission**, the nucleus of a heavy atom (such as **uranium, plutonium or thorium**) is hit by **low-energy neutrons** and **splits into lighter nuclei**. A tremendous amount of energy is released, because the original nucleus has **slightly more mass** than all the products together. The fission of one uranium atom gives **10 million times** the energy of burning one carbon atom from coal.",
          "**नाभिकीय विखंडन।** **नाभिक** परमाणु का नन्हा केंद्र है। **नाभिकीय विखंडन** में किसी भारी परमाणु (जैसे **यूरेनियम, प्लूटोनियम या थोरियम**) के नाभिक पर **कम ऊर्जा वाले न्यूट्रॉन** टकराते हैं और वह **हल्के नाभिकों में टूट जाता** है। अपार ऊर्जा निकलती है, क्योंकि मूल नाभिक का द्रव्यमान सब उत्पादों के कुल द्रव्यमान से **थोड़ा अधिक** होता है। यूरेनियम के एक परमाणु का विखंडन कोयले के एक कार्बन परमाणु को जलाने से **1 करोड़ गुना** ऊर्जा देता है।",
        ),
      ),
      chain,
      goal,
      found,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** A reactor controls the chain reaction. */
const reactor = page(
  "reactor",
  (b) => {
    const w = wordsOn(b);
    const chain = b.prop(fissionDef, "chain", {
      generation: 0,
      isControlled: true,
      massLost: 0.2,
      showCalculator: false,
      canStep: true,
      canControl: true,
      canSetMass: false,
    });
    b.studentOnly(chain.action(FissionAction.Next));
    b.studentOnly(chain.action(FissionAction.Reset));
    b.studentOnly(chain.action(FissionAction.SetControl));
    b.standsFor(
      chain,
      "the chain reaction with a controlled / uncontrolled switch; controlled, all neutrons but one are absorbed after each split",
    );
    const plant = b.prop(powerPlantDef, "plant", {
      kind: PlantKind.Nuclear,
      step: 0,
      isOn: false,
      level: 3,
      showChain: true,
      canStep: true,
      canSwitch: true,
      canSetLevel: false,
    });
    b.studentOnly(plant.action(PlantAction.Next));
    b.studentOnly(plant.action(PlantAction.Switch));
    b.studentOnly(plant.action(PlantAction.Reset));
    b.standsFor(
      plant,
      "a nuclear power plant: uranium fuel, fission heat in the reactor, steam, turbine, generator; next steps through the chain",
    );
    const ask = choiceQuestion(b, {
      prompt: t(
        "Step the controlled chain a few times. How is it different from the uncontrolled one?",
        "नियंत्रित शृंखला को कुछ बार आगे बढ़ाओ। यह अनियंत्रित से कैसे अलग है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Each split leads to just one more, so energy comes steadily",
            "हर विखंडन से बस एक और होता है, इसलिए ऊर्जा स्थिर दर से आती है",
          ),
        },
        {
          id: "none",
          label: t(
            "No nuclei split at all, so no energy comes out of it",
            "कोई नाभिक नहीं टूटता, इसलिए इससे कोई ऊर्जा नहीं निकलती",
          ),
          feedback: t(
            "Nuclei still split, one per generation. That gives energy at a steady, controlled rate.",
            "नाभिक अब भी टूटते हैं, हर पीढ़ी में एक। इससे स्थिर, नियंत्रित दर से ऊर्जा मिलती है।",
          ),
        },
        {
          id: "faster",
          label: t(
            "The splits multiply faster, so it gives more power each step",
            "विखंडन तेज़ी से गुणा होते हैं, इसलिए हर कदम पर ज़्यादा शक्ति",
          ),
          feedback: t(
            "The opposite: control keeps it to one split per generation, never multiplying.",
            "उल्टा: नियंत्रण इसे हर पीढ़ी में एक विखंडन पर रखता है, कभी गुणा नहीं।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("A controlled chain", "एक नियंत्रित शृंखला")),
      w.definition(
        t(
          '**Nuclear reactor.** In a reactor built to make electricity, the nuclear "fuel" takes part in a **self-sustaining chain reaction that releases energy at a controlled rate**. The heat makes **steam**, which runs a **turbine and generator**, just as in a thermal plant.',
          '**नाभिकीय रिएक्टर।** बिजली बनाने वाले रिएक्टर में नाभिकीय "ईंधन" एक **स्वपोषी शृंखला अभिक्रिया** में भाग लेता है **जो नियंत्रित दर से ऊर्जा छोड़ती** है। ऊष्मा से **भाप** बनती है, जो तापीय संयंत्र की तरह **टरबाइन और जनित्र** चलाती है।',
        ),
      ),
      chain,
      ask,
      plant,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** E = Δm c² (Do You Know?). */
const einstein = page(
  "einstein",
  (b) => {
    const w = wordsOn(b);
    const calc = b.prop(fissionDef, "calc", {
      generation: 1,
      isControlled: true,
      massLost: 0.1,
      showCalculator: true,
      canStep: false,
      canControl: false,
      canSetMass: true,
    });
    b.studentOnly(calc.action(FissionAction.SetMass));
    b.standsFor(
      calc,
      "a calculator that turns the mass lost in a fission, in atomic mass units, into energy in MeV",
    );
    const goal = goalQuestion(b, {
      about: calc,
      prompt: t(
        "Set the mass lost to 0.2 u, about what one uranium fission loses, and read the energy.",
        "खोया द्रव्यमान 0.2 u रखो, लगभग उतना जितना यूरेनियम का एक विखंडन खोता है, और ऊर्जा पढ़ो।",
      ),
      isMet: calc.field("massLost").eq(0.2),
      solve: [calc.learner(FissionAction.SetMass, { massLost: 0.2 })],
    });
    return column([
      w.title(t("Mass becomes energy", "द्रव्यमान ऊर्जा बनता है")),
      w.definition(
        t(
          "**Tiny units.** Atoms are so light that their masses are measured in **atomic mass units (u)**: 1 u is about the mass of one proton or one neutron. Their energies are tiny too, so they are measured in **electron volts (eV)**; **MeV** means a million electron volts.",
          "**नन्ही इकाइयाँ।** परमाणु इतने हल्के हैं कि उनका द्रव्यमान **परमाणु द्रव्यमान इकाई (u)** में मापा जाता है: 1 u लगभग एक प्रोटॉन या एक न्यूट्रॉन का द्रव्यमान है। उनकी ऊर्जाएँ भी नन्ही हैं, इसलिए वे **इलेक्ट्रॉन वोल्ट (eV)** में मापी जाती हैं; **MeV** का अर्थ है दस लाख इलेक्ट्रॉन वोल्ट।",
        ),
      ),
      w.definition(
        t(
          '**E = Δmc².** In fission, the **difference in mass, Δm**, between the original nucleus and the products is converted to **energy E**, by Einstein\'s equation (1905), where **c** is the speed of light in vacuum, 3 × 10⁸ m/s. **Δm** (read "delta m") means the small *change* in mass. Because c² is enormous, a tiny lost mass gives a huge energy.',
          '**E = Δmc²।** विखंडन में मूल नाभिक और उत्पादों के **द्रव्यमान का अंतर, Δm**, आइंस्टीन के समीकरण (1905) से **ऊर्जा E** में बदलता है, जहाँ **c** निर्वात में प्रकाश की चाल है, 3 × 10⁸ m/s। **Δm** (पढ़ो "डेल्टा m") का अर्थ है द्रव्यमान में छोटा *बदलाव*। c² बहुत बड़ा है, इसलिए थोड़ा-सा खोया द्रव्यमान भी बहुत बड़ी ऊर्जा देता है।',
        ),
      ),
      w.body(t("In joules, one electron volt is:", "जूल में, एक इलेक्ट्रॉन वोल्ट है:")),
      w.body(
        t(
          r`$$1\ \text{eV} = 1.602 \times 10^{-19}\ \text{J}$$`,
          r`$$1\ \text{eV} = 1.602 \times 10^{-19}\ \text{J}$$`,
        ),
      ),
      w.body(
        t(
          "From the equation, one atomic mass unit (u) of mass is equivalent to about 931 million electron volts:",
          "समीकरण से, एक परमाणु द्रव्यमान इकाई (u) द्रव्यमान लगभग 931 मिलियन इलेक्ट्रॉन वोल्ट के बराबर है:",
        ),
      ),
      w.body(
        t(r`$$1\ \text{u} \approx 931\ \text{MeV}$$`, r`$$1\ \text{u} \approx 931\ \text{MeV}$$`),
      ),
      calc,
      goal,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Indian plants, hazards, and fusion. */
const hazards = page(
  "hazards",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      prompt: t(
        "What is the major hazard of nuclear power generation?",
        "नाभिकीय विद्युत उत्पादन का सबसे बड़ा ख़तरा क्या है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Storing used fuel that keeps giving off radiation",
            "विकिरण छोड़ते रहने वाले प्रयुक्त ईंधन का भंडारण",
          ),
        },
        {
          id: "smoke",
          label: t(
            "Thick smoke from burning uranium in the reactor",
            "रिएक्टर में जलते यूरेनियम का घना धुआँ",
          ),
          feedback: t(
            "Uranium isn't burnt; its nuclei split. The danger is radioactive waste and leaks.",
            "यूरेनियम जलाया नहीं जाता; उसके नाभिक टूटते हैं। ख़तरा रेडियोधर्मी कचरा और रिसाव है।",
          ),
        },
        {
          id: "flood",
          label: t(
            "Large areas of land drowned behind the reactor",
            "रिएक्टर के पीछे डूबी ज़मीन के बड़े इलाक़े",
          ),
          feedback: t(
            "That is a problem of dams. For nuclear power it is used fuel that stays radioactive.",
            "वह बाँधों की समस्या है। नाभिकीय ऊर्जा के लिए यह प्रयुक्त ईंधन है जो रेडियोधर्मी रहता है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Why not everywhere?", "हर जगह क्यों नहीं?")),
      w.body(
        t(
          "India has nuclear power stations at **Tarapur** (Maharashtra), **Rana Pratap Sagar** (Rajasthan), **Kalpakkam** (Tamil Nadu), **Narora** (UP), **Kakrapar** (Gujarat) and **Kaiga** (Karnataka). Together they are **less than 3%** of our electricity capacity, while some industrialised countries get over 30% of their electricity this way.",
          "भारत में **तारापुर** (महाराष्ट्र), **राणा प्रताप सागर** (राजस्थान), **कलपक्कम** (तमिलनाडु), **नरौरा** (उ.प्र.), **काकरापार** (गुजरात) और **कैगा** (कर्नाटक) में नाभिकीय बिजलीघर हैं। मिलकर ये हमारी बिजली क्षमता का **3% से कम** हैं, जबकि कुछ औद्योगिक देश अपनी 30% से ज़्यादा बिजली ऐसे पाते हैं।",
        ),
      ),
      w.definition(
        t(
          "**Hazards.** The major hazard is **storing and disposing of used fuel**, which keeps decaying and giving off harmful **radiation**. Poor storage **contaminates the environment**, and there is a risk of **accidental leaks**. The **high cost** of building a plant, these risks, and the **limited supply of uranium** make large-scale use of nuclear energy difficult. Nuclear energy was first used for destruction, before power stations were designed.",
          "**ख़तरे।** सबसे बड़ा ख़तरा **प्रयुक्त ईंधन का भंडारण और निपटान** है, जो क्षय होता रहता है और हानिकारक **विकिरण** छोड़ता है। ख़राब भंडारण **पर्यावरण को दूषित** करता है, और **दुर्घटना से रिसाव** का ख़तरा है। संयंत्र बनाने की **ऊँची लागत**, ये ख़तरे, और **यूरेनियम की सीमित उपलब्धता** नाभिकीय ऊर्जा के बड़े पैमाने पर उपयोग को कठिन बनाते हैं। बिजलीघर बनने से पहले नाभिकीय ऊर्जा का पहला उपयोग विनाश के लिए हुआ था।",
        ),
      ),
      ask,
      w.note(
        t(
          "Do you know? Joining light nuclei into a heavier one is **nuclear fusion**, for example two hydrogen-2 nuclei making helium-3 (plus a neutron). The product has a little less mass, so energy is released. Fusion powers the **Sun and the stars**, but it needs extreme conditions, millions of degrees and millions of pascals, so today's reactors all use fission.",
          "क्या तुम जानते हो? हल्के नाभिकों को जोड़कर भारी नाभिक बनाना **नाभिकीय संलयन** है, जैसे दो हाइड्रोजन-2 नाभिकों से हीलियम-3 (और एक न्यूट्रॉन)। उत्पाद का द्रव्यमान थोड़ा कम होता है, इसलिए ऊर्जा निकलती है। संलयन **सूर्य और तारों** को ऊर्जा देता है, पर इसके लिए चरम परिस्थितियाँ चाहिए, करोड़ों डिग्री और करोड़ों पास्कल, इसलिए आज के सभी रिएक्टर विखंडन उपयोग करते हैं।",
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** Not for the village, and why. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const pic = sceneOn(
      b,
      "pic",
      EnergyScene.RadioNews,
      "Grandpa's radio on the charpai in the evening",
    );
    const ask = choiceQuestion(b, {
      prompt: t(
        "Kabir asks again: so why isn't every village running on uranium?",
        "कबीर फिर पूछता है: तो हर गाँव यूरेनियम से क्यों नहीं चलता?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Plants are huge and costly, and the waste needs safe storage",
            "संयंत्र विशाल और महँगे हैं, और कचरे को सुरक्षित भंडारण चाहिए",
          ),
        },
        {
          id: "weak",
          label: t(
            "Uranium gives far less energy per kilogram than coal does",
            "यूरेनियम प्रति किलोग्राम कोयले से कम ऊर्जा देता है",
          ),
          feedback: t(
            "It gives far more, 10 million times per atom. The problems are cost, waste and safety.",
            "यह कहीं ज़्यादा देता है, प्रति परमाणु 1 करोड़ गुना। समस्याएँ लागत, कचरा और सुरक्षा हैं।",
          ),
        },
        {
          id: "renew",
          label: t(
            "Uranium is renewable, so there is no hurry at all to use it",
            "यूरेनियम नवीकरणीय है, इसलिए उपयोग की कोई जल्दी नहीं",
          ),
          feedback: t(
            "Uranium is limited, not renewable. Plants aren't built everywhere because of cost and risk.",
            "यूरेनियम सीमित है, नवीकरणीय नहीं। लागत और ख़तरे के कारण संयंत्र हर जगह नहीं बनते।",
          ),
        },
      ],
      answer: "right",
    });
    const note = w.body(
      t(
        "A nuclear plant is a huge, costly, carefully guarded station; the village's electricity may already come partly from one far away. Riya writes: **nuclear energy, not for a village.** Stop 8 done.",
        "नाभिकीय संयंत्र एक विशाल, महँगा, बहुत सावधानी से सुरक्षित स्टेशन है; गाँव की बिजली शायद पहले से ही कुछ हद तक दूर के किसी संयंत्र से आती हो। रिया लिखती है: **नाभिकीय ऊर्जा, गाँव के लिए नहीं।** पड़ाव 8 पूरा।",
      ),
      "note",
      { isHidden: true },
    );
    b.when(ask.on(QuestionSignal.Correct), theBoard.show(note));
    return column([
      w.title(t("Uranium for the village?", "गाँव के लिए यूरेनियम?")),
      pic,
      ask,
      note,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** In-text Q4 and a mass-energy calculation, then the mission log. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const q1 = choiceQuestion(b, {
      name: "q1",
      prompt: t("What is an advantage of nuclear energy?", "नाभिकीय ऊर्जा का एक लाभ क्या है?"),
      options: [
        {
          id: "right",
          label: t("A little fuel gives a huge amount of energy", "थोड़ा ईंधन अपार ऊर्जा देता है"),
        },
        {
          id: "waste",
          label: t("Its used fuel is safe to throw away anywhere", "इसका प्रयुक्त ईंधन फेंकना सुरक्षित है"),
          feedback: t(
            "The opposite: used fuel stays radioactive and is its major hazard.",
            "उल्टा: प्रयुक्त ईंधन रेडियोधर्मी रहता है और यही इसका सबसे बड़ा ख़तरा है।",
          ),
        },
        {
          id: "cheap",
          label: t(
            "Its plants are cheap and quick to build anywhere",
            "इसके संयंत्र कहीं भी सस्ते में बनते हैं",
          ),
          feedback: t(
            "Nuclear plants cost a great deal to build. Its advantage is the energy from a little fuel.",
            "नाभिकीय संयंत्र बनाना बहुत महँगा है। इसका लाभ थोड़े ईंधन से मिलने वाली ऊर्जा है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const q2 = choiceQuestion(b, {
      name: "q2",
      prompt: t(
        "In a nuclear reaction, 0.1 u of mass is lost. About how much energy is released?",
        "एक नाभिकीय अभिक्रिया में 0.1 u द्रव्यमान खोता है। लगभग कितनी ऊर्जा निकलती है?",
      ),
      options: [
        { id: "right", label: t("About 93 MeV", "लगभग 93 MeV") },
        {
          id: "931",
          label: t("About 931 MeV", "लगभग 931 MeV"),
          feedback: t(
            "That is for 1 u. For 0.1 u: 0.1 × 931 ≈ 93 MeV.",
            "वह 1 u के लिए है। 0.1 u के लिए: 0.1 × 931 ≈ 93 MeV।",
          ),
        },
        {
          id: "9310",
          label: t("About 9310 MeV", "लगभग 9310 MeV"),
          feedback: t(
            "Multiply, don't divide: 0.1 × 931 ≈ 93 MeV.",
            "गुणा करो, भाग नहीं: 0.1 × 931 ≈ 93 MeV।",
          ),
        },
      ],
      answer: "right",
      isHidden: true,
      passes: false,
    });
    b.when(q1.on(QuestionSignal.Correct), theBoard.show(q2));
    const log = w.definition(
      t(
        "**Mission log.** ✓ In fission, a slow neutron splits a heavy nucleus; the small mass lost becomes energy (E = Δmc², 1 u ≈ 931 MeV), 10 million times that of burning a carbon atom. ✓ A reactor keeps the chain reaction controlled; the heat drives a steam turbine. ✗ Used fuel stays radioactive, leaks are a risk, plants are costly, and uranium is limited: under 3% of India's capacity. ✓ Fusion powers the Sun. Next stop: the panchayat meeting.",
        "**मिशन लॉग।** ✓ विखंडन में धीमा न्यूट्रॉन भारी नाभिक तोड़ता है; खोया थोड़ा द्रव्यमान ऊर्जा बनता है (E = Δmc², 1 u ≈ 931 MeV), कार्बन परमाणु जलाने से 1 करोड़ गुना। ✓ रिएक्टर शृंखला अभिक्रिया नियंत्रित रखता है; ऊष्मा भाप टरबाइन चलाती है। ✗ प्रयुक्त ईंधन रेडियोधर्मी रहता है, रिसाव का ख़तरा है, संयंत्र महँगे हैं, और यूरेनियम सीमित है: भारत की क्षमता का 3% से कम। ✓ संलयन सूर्य को ऊर्जा देता है। अगला पड़ाव: पंचायत की बैठक।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(q2.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), q1, q2, log, space()]);
  },
  { passOn: PassOn.Rules },
);

export const overview = [hook, fissionPage, reactor, einstein, hazards, inLife, yourTurn];

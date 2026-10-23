import { PassOn, column, page, space, t } from "@chalk/author";
import { goalQuestion, wordsOn } from "@chalk/patterns";
import { CarbonScene, ChainAction, Group } from "@chalk/prop-carbon";
import { ask, chainOn, oneByOne, sceneOn } from "../kit";

/** Reading a name like a sentence. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const bottles = sceneOn(
    b,
    "bottles",
    CarbonScene.BottleLabels,
    "the three labelled bottles, with Riya underlining parts of each name",
  );
  return column([
    w.title(t("A name is a description", "नाम एक विवरण है")),
    bottles,
    w.body(
      t(
        'Last time: functional groups decide how a compound behaves. Riya notices the names on the bottles share pieces: **eth**-anol, **eth**-anoic acid, **meth**-anol. Grandpa: "Chemists name compounds the way you\'d give an address. Read the name, and you can draw the molecule."',
        'पिछली बार: प्रकार्यात्मक समूह तय करते हैं कि यौगिक कैसा व्यवहार करेगा। रिया देखती है कि बोतलों के नामों में टुकड़े मिलते हैं: **एथ**-ेनॉल, **एथ**-ेनॉइक अम्ल, **मेथ**-ेनॉल। दादाजी: "रसायनज्ञ यौगिकों के नाम वैसे रखते हैं जैसे तुम पता बताते हो। नाम पढ़ो, और अणु बना सकते हो।"',
      ),
    ),
    w.body(t("Stop 6: how do the names work?", "पड़ाव 6: नाम कैसे बनते हैं?")),
    space(),
  ]);
});

/** The four rules. */
const rules = page(
  "rules",
  (b) => {
    const w = wordsOn(b);
    const q = ask(
      b,
      "q",
      ["Which stem means a chain of four carbons?", "कौन-सा मूल शब्द चार कार्बनों की शृंखला बताता है?"],
      ["But-", "ब्यूट-"],
      [
        ["Prop-", "प्रोप-", "Prop- is three carbons.", "प्रोप- तीन कार्बन है।"],
        ["Pent-", "पेंट-", "Pent- is five carbons.", "पेंट- पाँच कार्बन है।"],
      ],
      { passes: true },
    );
    return column([
      w.title(t("The rules", "नियम")),
      w.definition(
        t(
          "**(i) Count the carbons.** The number of carbons gives the stem: meth- (1), eth- (2), prop- (3), but- (4), pent- (5), hex- (6). A chain of three carbons is named from **propane**.",
          "**(i) कार्बन गिनो।** कार्बनों की संख्या मूल शब्द देती है: मेथ- (1), एथ- (2), प्रोप- (3), ब्यूट- (4), पेंट- (5), हेक्स- (6)। तीन कार्बनों की शृंखला का नाम **प्रोपेन** से बनता है।",
        ),
      ),
      w.definition(
        t(
          "**(ii) Add the functional group**, as a prefix or a suffix (NCERT Table 4.4): halogen, a **prefix**: **chloro**propane, **bromo**propane. Alcohol, suffix **-ol**: propan**ol**. Aldehyde, suffix **-al**: propan**al**. Ketone, suffix **-one**: propan**one**. Carboxylic acid, suffix **-oic acid**: propan**oic acid**.",
          "**(ii) प्रकार्यात्मक समूह जोड़ो**, उपसर्ग या प्रत्यय के रूप में (NCERT तालिका 4.4): हैलोजन, **उपसर्ग**: **क्लोरो**प्रोपेन, **ब्रोमो**प्रोपेन। ऐल्कोहॉल, प्रत्यय **-ॉल**: प्रोपेन**ॉल**। ऐल्डिहाइड, प्रत्यय **-ैल**: प्रोपेन**ैल**। कीटोन, प्रत्यय **-ोन**: प्रोपेन**ोन**। कार्बोक्सिलिक अम्ल, प्रत्यय **-ोइक अम्ल**: प्रोपेन**ोइक अम्ल**।",
        ),
      ),
      w.definition(
        t(
          "**(iii) Drop the final 'e'** of the alkane name when the suffix starts with a vowel: propane + one → propan**one**.",
          "**(iii) अंतिम 'e' हटाओ** (अंग्रेज़ी नाम में) जब प्रत्यय स्वर से शुरू हो: propane + one → propan**one**।",
        ),
      ),
      w.definition(
        t(
          "**(iv) Unsaturated chains:** a double bond changes -ane to **-ene** (propene); a triple bond to **-yne** (propyne).",
          "**(iv) असंतृप्त शृंखलाएँ:** द्विआबंध -ेन को **-ीन** बना देता है (प्रोपीन); त्रिआबंध **-ाइन** (प्रोपाइन)।",
        ),
      ),
      q,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Build propanone with the builder. */
const build = page(
  "build",
  (b) => {
    const w = wordsOn(b);
    const c = chainOn(b, "c", {
      carbons: 2,
      canSetCarbons: true,
      canSetGroup: true,
      canSetBonds: true,
      showFormula: true,
      showName: true,
    });
    b.standsFor(
      c,
      "a compound builder: set the number of carbons, the carbon–carbon bond and a functional group; the name and formula update",
    );
    const goal = goalQuestion(b, {
      about: c,
      prompt: t(
        "Build propanone: three carbons with a ketone group.",
        "प्रोपेनोन बनाओ: तीन कार्बन और एक कीटोन समूह।",
      ),
      isMet: c.field("carbons").eq(3).and(c.field("group").eq(Group.Ketone)),
      solve: [
        c.learner(ChainAction.SetCarbons, { carbons: 3 }),
        c.learner(ChainAction.SetGroup, { group: Group.Ketone }),
      ],
    });
    return column([
      w.title(t("Name it by building it", "बनाकर नाम दो")),
      w.body(
        t(
          "Use the rules backwards: read the name, then build. Propan-one means three carbons (prop-), all single bonds (-an-), and a ketone (-one).",
          "नियमों को उल्टा इस्तेमाल करो: नाम पढ़ो, फिर बनाओ। प्रोपेन-ोन का अर्थ है तीन कार्बन (प्रोप-), सब एकल आबंध (-ेन-), और एक कीटोन (-ोन)।",
        ),
      ),
      c,
      goal,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Back to the labels. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const q = ask(
      b,
      "q",
      [
        "Read the name 'ethanol' like an address. What does it describe?",
        "'एथेनॉल' नाम को पते की तरह पढ़ो। यह क्या बताता है?",
      ],
      ["Two carbons, single bond, an –OH group", "दो कार्बन, एकल आबंध, एक –OH समूह"],
      [
        [
          "Two carbons, a double bond and a –COOH group",
          "दो कार्बन, एक द्विबंध और एक –COOH समूह",
          "–COOH would end in '-oic acid': that's the vinegar.",
          "–COOH का नाम '-ोइक अम्ल' पर ख़त्म होता: वह सिरका है।",
        ],
        [
          "One carbon and an –OH group",
          "एक कार्बन और एक –OH समूह",
          "One carbon would be meth-: methanol, the poison.",
          "एक कार्बन होता तो मेथ-: मेथेनॉल, ज़हर।",
        ],
      ],
    );
    const q2 = ask(
      b,
      "q2",
      ["NCERT in-text Q: name CH₃–CH₂–Br.", "NCERT पाठ्य प्रश्न: CH₃–CH₂–Br का नाम बताओ।"],
      ["Bromoethane", "ब्रोमोएथेन"],
      [
        [
          "Ethyl bromide acid",
          "एथिल ब्रोमाइड अम्ल",
          "Halogens go as a prefix: bromo + ethane.",
          "हैलोजन उपसर्ग बनते हैं: ब्रोमो + एथेन।",
        ],
        [
          "Bromomethane",
          "ब्रोमोमेथेन",
          "There are two carbons: eth-, not meth-.",
          "दो कार्बन हैं: एथ-, मेथ- नहीं।",
        ],
      ],
      { isHidden: true },
    );
    const log = w.definition(
      t(
        "**Mission log.** ✓ A name = number of carbons + bond type + functional group (prefix or suffix). ✓ Ethanol: two carbons, –OH. Ethanoic acid: two carbons, –COOH. Next: what happens when these compounds burn.",
        "**मिशन लॉग।** ✓ नाम = कार्बनों की संख्या + आबंध का प्रकार + प्रकार्यात्मक समूह (उपसर्ग या प्रत्यय)। ✓ एथेनॉल: दो कार्बन, –OH। एथेनॉइक अम्ल: दो कार्बन, –COOH। आगे: जब ये यौगिक जलते हैं तो क्या होता है।",
      ),
      "log",
      { isHidden: true },
    );
    oneByOne(b, [q, q2], [log]);
    return column([w.title(t("Reading the labels", "लेबल पढ़ना")), q, q2, log, space()]);
  },
  { passOn: PassOn.Rules },
);

const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const q1 = ask(
      b,
      "q1",
      ["NCERT in-text Q: name HCHO.", "NCERT पाठ्य प्रश्न: HCHO का नाम बताओ।"],
      ["Methanal", "मेथेनैल"],
      [
        [
          "Methanol",
          "मेथेनॉल",
          "-ol is the –OH group. –CHO is an aldehyde: -al.",
          "-ॉल –OH समूह है। –CHO ऐल्डिहाइड है: -ैल।",
        ],
        ["Ethanal", "एथेनैल", "HCHO has only one carbon: meth-.", "HCHO में केवल एक कार्बन है: मेथ-।"],
      ],
    );
    const q2 = ask(
      b,
      "q2",
      [
        "NCERT in-text Q: what is the name of a six-carbon chain with a triple bond?",
        "NCERT पाठ्य प्रश्न: त्रिआबंध वाली छह-कार्बन शृंखला का नाम क्या है?",
      ],
      ["Hexyne", "हेक्साइन"],
      [
        ["Hexene", "हेक्सीन", "-ene is a double bond. Triple is -yne.", "-ीन द्विआबंध है। त्रि -ाइन है।"],
        ["Hexane", "हेक्सेन", "-ane means all single bonds.", "-ेन का अर्थ है सब एकल आबंध।"],
      ],
      { isHidden: true },
    );
    const q3 = ask(
      b,
      "q3",
      ["Which is the formula of propanoic acid?", "प्रोपेनोइक अम्ल का सूत्र कौन-सा है?"],
      ["CH₃CH₂COOH", "CH₃CH₂COOH"],
      [
        ["CH₃COOH", "CH₃COOH", "That's two carbons: ethanoic acid.", "वह दो कार्बन है: एथेनॉइक अम्ल।"],
        ["CH₃CH₂CH₂OH", "CH₃CH₂CH₂OH", "That's propanol, an alcohol.", "वह प्रोपेनॉल है, एक ऐल्कोहॉल।"],
      ],
      { isHidden: true },
    );
    oneByOne(b, [q1, q2, q3]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), q1, q2, q3, space()]);
  },
  { passOn: PassOn.Rules },
);

export const overview = [hook, rules, build, inLife, yourTurn];

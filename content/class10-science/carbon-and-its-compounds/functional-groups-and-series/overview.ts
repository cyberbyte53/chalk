import { PassOn, column, page, space, t } from "@chalk/author";
import { goalQuestion, wordsOn } from "@chalk/content-source/patterns";
import { CarbonScene, ChainAction, Group, Series, SeriesAction } from "@chalk/prop-carbon";
import { ask, chainOn, oneByOne, sceneOn, seriesOn } from "../kit";

/** Bottle labels: sanitizer, vinegar, and a warning. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const bottles = sceneOn(
    b,
    "bottles",
    CarbonScene.BottleLabels,
    "three bottles on the shelf: a hand sanitizer labelled ethanol, a vinegar bottle labelled ethanoic acid, and a paint thinner with a red methanol warning",
  );
  return column([
    w.title(t("What the labels say", "लेबल क्या कहते हैं")),
    bottles,
    w.body(
      t(
        'Last time: chains, branches and rings of carbon and hydrogen. Riya wants a scent and a cleaner for the soap stall, so she reads the bottles on the shelf: hand sanitizer, **ethanol**; vinegar, **ethanoic acid**; paint thinner, **methanol: poison**. Kabir: "They all sound like ethane and methane. Why are they so different?"',
        'पिछली बार: कार्बन और हाइड्रोजन की शृंखलाएँ, शाखाएँ और वलय। रिया को साबुन स्टॉल के लिए खुशबू और सफ़ाई का सामान चाहिए, इसलिए वह शेल्फ़ की बोतलें पढ़ती है: हैंड सैनिटाइज़र, **एथेनॉल**; सिरका, **एथेनॉइक अम्ल**; पेंट थिनर, **मेथेनॉल: ज़हर**। कबीर: "ये सब एथेन और मेथेन जैसे लगते हैं। फिर इतने अलग क्यों?"',
      ),
    ),
    w.body(
      t(
        "Stop 5: what changes when other atoms join a carbon chain?",
        "पड़ाव 5: कार्बन शृंखला से दूसरे परमाणु जुड़ने पर क्या बदलता है?",
      ),
    ),
    space(),
  ]);
});

/** Heteroatoms and functional groups (Table 4.3). */
const groups = page(
  "groups",
  (b) => {
    const w = wordsOn(b);
    const c = chainOn(b, "c", { carbons: 2, canSetGroup: true, showFormula: true, showName: true });
    b.standsFor(
      c,
      "a two-carbon chain where one hydrogen can be replaced by a functional group: chlorine, bromine, –OH, –CHO, a ketone C=O or –COOH; the name and formula update",
    );
    const goal = goalQuestion(b, {
      about: c,
      prompt: t(
        "Give the chain an –OH group. What does the name become?",
        "शृंखला को –OH समूह दो। नाम क्या हो जाता है?",
      ),
      isMet: c.field("group").eq(Group.Alcohol),
      solve: [c.learner(ChainAction.SetGroup, { group: Group.Alcohol })],
    });
    return column([
      w.title(t("Functional groups", "प्रकार्यात्मक समूह")),
      w.definition(
        t(
          "**Heteroatom.** In a hydrocarbon chain, a hydrogen can be replaced by another element, such as chlorine, oxygen, nitrogen or sulphur. The element that replaces hydrogen is a **heteroatom**.",
          "**विषम परमाणु।** हाइड्रोकार्बन शृंखला में एक हाइड्रोजन को कोई दूसरा तत्व, जैसे क्लोरीन, ऑक्सीजन, नाइट्रोजन या सल्फ़र, बदल सकता है। हाइड्रोजन को बदलने वाला तत्व **विषम परमाणु** है।",
        ),
      ),
      w.definition(
        t(
          "**Functional group.** A heteroatom, or a group containing it, that gives a compound its particular properties is a **functional group**. NCERT Table 4.3: **halo** (–Cl, –Br), **alcohol** (–OH), **aldehyde** (–CHO), **ketone** (>C=O inside the chain), **carboxylic acid** (–COOH). The properties depend on the group, whatever the chain's length.",
          "**प्रकार्यात्मक समूह।** विषम परमाणु, या उसे रखने वाला समूह, जो यौगिक को उसके विशेष गुण देता है, **प्रकार्यात्मक समूह** है। NCERT तालिका 4.3: **हैलो** (–Cl, –Br), **ऐल्कोहॉल** (–OH), **ऐल्डिहाइड** (–CHO), **कीटोन** (शृंखला के अंदर >C=O), **कार्बोक्सिलिक अम्ल** (–COOH)। गुण समूह पर निर्भर करते हैं, शृंखला की लंबाई चाहे जो हो।",
        ),
      ),
      c,
      goal,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Homologous series: CH₂ and 14 u, general formulae, gradual physical change. */
const series = page(
  "series",
  (b) => {
    const w = wordsOn(b);
    const s = seriesOn(b, "s", {
      series: Series.Alkanes,
      upTo: 5,
      choices: [Series.Alkanes, Series.Alkenes, Series.Alcohols],
      showGeneral: true,
    });
    b.standsFor(
      s,
      "a ladder of compounds in a homologous series: each row one carbon longer, with its formula and mass, the CH₂ and 14 u step between rows, and the general formula; the series can be switched",
    );
    const goal = goalQuestion(b, {
      about: s,
      prompt: t(
        "Tap ethane's row to compare it with methane above it.",
        "एथेन की पंक्ति पर टैप करो ताकि उसकी तुलना ऊपर की मेथेन से हो।",
      ),
      isMet: s.field("highlight").eq(2),
      solve: [s.learner(SeriesAction.Highlight, { n: 2 })],
    });
    return column([
      w.title(t("Families: homologous series", "परिवार: समजातीय श्रेणी")),
      s,
      goal,
      w.definition(
        t(
          "**Homologous series.** A series of compounds in which the **same functional group** replaces hydrogen in a carbon chain, and each member differs from the next by **–CH₂–**. Each step adds 12 u + 2 × 1 u = **14 u** to the molecular mass. Alkanes are $\\mathrm{C_nH_{2n+2}}$, alkenes $\\mathrm{C_nH_{2n}}$, alkynes $\\mathrm{C_nH_{2n-2}}$.",
          "**समजातीय श्रेणी।** यौगिकों की वह श्रेणी जिसमें कार्बन शृंखला में **एक ही प्रकार्यात्मक समूह** हाइड्रोजन को बदलता है, और हर सदस्य अगले से **–CH₂–** से अलग होता है। हर क़दम आण्विक द्रव्यमान में 12 u + 2 × 1 u = **14 u** जोड़ता है। ऐल्केन $\\mathrm{C_nH_{2n+2}}$ हैं, ऐल्कीन $\\mathrm{C_nH_{2n}}$, ऐल्काइन $\\mathrm{C_nH_{2n-2}}$।",
        ),
      ),
      w.body(
        t(
          "As the chain grows, **physical properties** change gradually: melting and boiling points rise, and solubility in a given solvent changes. **Chemical properties**, set by the functional group, stay similar through the series.",
          "शृंखला बढ़ने पर **भौतिक गुण** धीरे-धीरे बदलते हैं: गलनांक और क्वथनांक बढ़ते हैं, और किसी विलायक में विलेयता बदलती है। **रासायनिक गुण**, जो प्रकार्यात्मक समूह तय करता है, पूरी श्रेणी में एक जैसे रहते हैं।",
        ),
      ),
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Back to the shelf. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const bottles = sceneOn(b, "bottles", CarbonScene.BottleLabels, "the three bottles again");
    const q = ask(
      b,
      "q",
      [
        "Ethanol (sanitizer) and ethanoic acid (vinegar) both have two carbons. Why do they behave so differently?",
        "एथेनॉल (सैनिटाइज़र) और एथेनॉइक अम्ल (सिरका) दोनों में दो कार्बन हैं। वे इतना अलग व्यवहार क्यों करते हैं?",
      ],
      ["Different functional groups: –OH and –COOH", "अलग प्रकार्यात्मक समूह: –OH और –COOH"],
      [
        [
          "One of them has more carbons",
          "उनमें से एक में ज़्यादा कार्बन हैं",
          "Both have two carbons. The functional group makes the difference.",
          "दोनों में दो कार्बन हैं। अंतर प्रकार्यात्मक समूह से है।",
        ],
        [
          "Vinegar is a liquid and sanitizer a gel",
          "सिरका द्रव है और सैनिटाइज़र जैल",
          "That's how they're sold. Their chemistry differs because of the groups.",
          "वे ऐसे बिकते हैं। उनका रसायन समूहों के कारण अलग है।",
        ],
      ],
    );
    const q2 = ask(
      b,
      "q2",
      [
        "Methanol and ethanol are neighbours in the alcohol series. How do their formulae differ?",
        "मेथेनॉल और एथेनॉल ऐल्कोहॉल श्रेणी में पड़ोसी हैं। उनके सूत्र कैसे अलग हैं?",
      ],
      ["By one CH₂ unit", "एक CH₂ इकाई से"],
      [
        [
          "By one oxygen",
          "एक ऑक्सीजन से",
          "Both have one –OH. Neighbours differ by CH₂.",
          "दोनों में एक –OH है। पड़ोसी CH₂ से अलग होते हैं।",
        ],
        [
          "By one hydrogen",
          "एक हाइड्रोजन से",
          "The step is a whole CH₂: one carbon and two hydrogens.",
          "क़दम पूरा CH₂ है: एक कार्बन और दो हाइड्रोजन।",
        ],
      ],
      { isHidden: true },
    );
    const log = w.definition(
      t(
        "**Mission log.** ✓ Heteroatoms and functional groups set a compound's properties. ✓ Homologous series: –CH₂– and 14 u per step; similar chemistry, gradually changing physical properties. Next: how chemists name these compounds.",
        "**मिशन लॉग।** ✓ विषम परमाणु और प्रकार्यात्मक समूह यौगिक के गुण तय करते हैं। ✓ समजातीय श्रेणी: हर क़दम पर –CH₂– और 14 u; एक जैसा रसायन, धीरे बदलते भौतिक गुण। आगे: रसायनज्ञ इन यौगिकों के नाम कैसे रखते हैं।",
      ),
      "log",
      { isHidden: true },
    );
    oneByOne(b, [q, q2], [log]);
    return column([w.title(t("Back to the shelf", "शेल्फ़ पर वापस")), bottles, q, q2, log, space()]);
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
      [
        "What is the molecular mass difference between two neighbours in a homologous series?",
        "समजातीय श्रेणी के दो पड़ोसियों के आण्विक द्रव्यमान में अंतर कितना है?",
      ],
      ["14 u", "14 u"],
      [
        [
          "12 u",
          "12 u",
          "12 u is one carbon. Add the two hydrogens of CH₂.",
          "12 u एक कार्बन है। CH₂ के दो हाइड्रोजन जोड़ो।",
        ],
        [
          "16 u",
          "16 u",
          "16 u is CH₄ or one oxygen. The step is CH₂.",
          "16 u CH₄ या एक ऑक्सीजन है। क़दम CH₂ है।",
        ],
      ],
    );
    const q2 = ask(
      b,
      "q2",
      ["Which formula belongs to an alkene?", "कौन-सा सूत्र ऐल्कीन का है?"],
      ["C₃H₆", "C₃H₆"],
      [
        [
          "C₃H₈",
          "C₃H₈",
          "C₃H₈ fits $\\mathrm{C_nH_{2n+2}}$: an alkane.",
          "C₃H₈, $\\mathrm{C_nH_{2n+2}}$ में आता है: ऐल्केन।",
        ],
        [
          "C₃H₄",
          "C₃H₄",
          "C₃H₄ fits $\\mathrm{C_nH_{2n-2}}$: an alkyne.",
          "C₃H₄, $\\mathrm{C_nH_{2n-2}}$ में आता है: ऐल्काइन।",
        ],
      ],
      { isHidden: true },
    );
    const q3 = ask(
      b,
      "q3",
      [
        "In a homologous series, what changes gradually as the chain gets longer?",
        "समजातीय श्रेणी में शृंखला लंबी होने पर क्या धीरे-धीरे बदलता है?",
      ],
      ["Physical properties, like boiling point", "भौतिक गुण, जैसे क्वथनांक"],
      [
        [
          "The functional group, which changes each step",
          "प्रकार्यात्मक समूह, जो हर क़दम पर बदलता है",
          "The functional group is the same all through the series.",
          "प्रकार्यात्मक समूह पूरी श्रेणी में वही रहता है।",
        ],
        [
          "The chemical properties",
          "रासायनिक गुण",
          "Chemical properties stay similar: they are set by the functional group.",
          "रासायनिक गुण एक जैसे रहते हैं: उन्हें प्रकार्यात्मक समूह तय करता है।",
        ],
      ],
      { isHidden: true },
    );
    oneByOne(b, [q1, q2, q3]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), q1, q2, q3, space()]);
  },
  { passOn: PassOn.Rules },
);

export const overview = [hook, groups, series, inLife, yourTurn];

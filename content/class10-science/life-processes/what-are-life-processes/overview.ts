import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/patterns";
import { QuestionSignal } from "@chalk/prop";
import { DiffusionAction, LifeScene, diffusionReachDef, lifeSceneDef } from "@chalk/prop-life";

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** Who and where: Kabir signs up for the 1500 m. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const notice = b.prop(lifeSceneDef, "notice", { scene: LifeScene.SignUp });
  b.standsFor(notice, "the school notice board: Kabir writes his name on the 1500 m sign-up sheet");
  return column([
    w.title(t("Kabir signs up", "कबीर नाम लिखाता है")),
    notice,
    w.body(
      t(
        'Sports Day is three weeks away. Kabir, Riya\'s little brother, has just written his name on the sign-up sheet for the **1500 m race**: almost four rounds of the school track. Riya, in Class 10, reads it over his shoulder and raises an eyebrow. "Four rounds? You get tired climbing the stairs." "I\'ll train," says Kabir. "How hard can it be?"',
        'खेल दिवस तीन हफ़्ते दूर है। रिया के छोटे भाई कबीर ने अभी-अभी **1500 मीटर दौड़** की सूची में अपना नाम लिखा है: स्कूल के ट्रैक के लगभग चार चक्कर। दसवीं में पढ़ने वाली रिया उसके कंधे के ऊपर से पढ़ती है और भौंहें चढ़ाती है। "चार चक्कर? तुम तो सीढ़ियाँ चढ़कर थक जाते हो।" "मैं अभ्यास करूँगा," कबीर कहता है। "कितना मुश्किल होगा?"',
      ),
    ),
    space(),
  ]);
});

/** The first practice run goes badly; Riya's challenge. */
const firstRun = page("first-run", (b) => {
  const w = wordsOn(b);
  const track = b.prop(lifeSceneDef, "track", { scene: LifeScene.FirstRun });
  b.standsFor(track, "the track at dawn: Kabir bent over, out of breath, Riya with a stopwatch");
  return column([
    w.title(t("The first practice run", "पहला अभ्यास")),
    track,
    w.body(
      t(
        'Next morning, two rounds in, Kabir is bent over with his hands on his knees, gasping. His heart is thumping and his calf feels tight. At home he eats three parathas, drinks a whole bottle of water, and flops on the sofa. "My body is useless," he groans.',
        'अगली सुबह, दो चक्कर बाद ही कबीर घुटनों पर हाथ रखे झुका हुआ हाँफ रहा है। उसका दिल धड़-धड़ कर रहा है और पिंडली में खिंचाव है। घर आकर वह तीन पराठे खाता है, पानी की पूरी बोतल पी जाता है, और सोफ़े पर पसर जाता है। "मेरा शरीर किसी काम का नहीं," वह कराहता है।',
      ),
    ),
    w.body(
      t(
        '"Your body is amazing," says Riya. "It has been working every second since you were born, even while you sleep. Before you can train it, find out what it does all day."',
        '"तुम्हारा शरीर कमाल का है," रिया कहती है। "यह तुम्हारे जन्म से हर पल काम कर रहा है, सोते हुए भी। इसे तैयार करने से पहले पता करो कि यह दिन भर करता क्या है।"',
      ),
    ),
    space(),
  ]);
});

/** Why this chapter: the mission and the stops on the way. */
const why = page("why", (b) => {
  const w = wordsOn(b);
  const plant = b.prop(lifeSceneDef, "plant", { scene: LifeScene.MoneyPlant });
  b.standsFor(
    plant,
    "Grandpa's terrace: a money plant with green-and-cream leaves; Grandpa points at a leaf",
  );
  return column([
    w.title(t("What this chapter is for", "यह अध्याय किसलिए है")),
    plant,
    w.body(
      t(
        'That\'s the mission: get Kabir ready for the 1500 m by understanding what keeps a body alive and running. Grandpa, listening from the terrace, points at his money plant. "This one does all the same jobs," he says, "and it never even moves." So at every stop we\'ll look at Kabir, and at Grandpa\'s plants.',
        'यही मिशन है: समझना कि शरीर को कौन-सी चीज़ें ज़िंदा और चलता रखती हैं, ताकि कबीर 1500 मीटर के लिए तैयार हो सके। छत से सुन रहे दादाजी अपने मनी प्लांट की ओर इशारा करते हैं। "यह भी यही सारे काम करता है," वे कहते हैं, "और यह तो कभी हिलता भी नहीं।" इसलिए हर पड़ाव पर हम कबीर को भी देखेंगे, और दादाजी के पौधों को भी।',
      ),
    ),
    w.definition(
      t(
        "**The stops on the way.** (1) What being alive needs: *this lesson*. (2) How plants make their own food. (3) How other living things get food. (4) What happens to Kabir's breakfast. (5) Burning food for energy, and cramps. (6) Breathing. (7) The heart and blood. (8) The pipes inside a plant. (9) Clean-up: the kidneys, and then race day.",
        "**रास्ते के पड़ाव।** (1) ज़िंदा रहने के लिए क्या चाहिए: *यह पाठ*। (2) पौधे अपना भोजन ख़ुद कैसे बनाते हैं। (3) दूसरे जीव भोजन कैसे पाते हैं। (4) कबीर के नाश्ते का क्या होता है। (5) ऊर्जा के लिए भोजन का टूटना, और ऐंठन। (6) साँस लेना। (7) हृदय और रुधिर। (8) पौधे के अंदर की नलियाँ। (9) सफ़ाई: वृक्क, और फिर दौड़ का दिन।",
      ),
    ),
    w.body(
      t(
        "First stop, starting from zero: what does it even mean to be alive?",
        "पहला पड़ाव, बिल्कुल शुरू से: ज़िंदा होने का असल मतलब क्या है?",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** How do we tell alive from not alive? Visible movement isn't enough; molecules move. */
const alive = page(
  "alive",
  (b) => {
    const w = wordsOn(b);
    const virus = choiceQuestion(b, {
      name: "virus",
      prompt: t(
        "Why do biologists argue about whether viruses are truly alive?",
        "जीवविज्ञानी इस पर बहस क्यों करते हैं कि वायरस सचमुच जीवित हैं या नहीं?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "No molecular movement until they infect a cell",
            "कोशिका को संक्रमित करने तक कोई आण्विक गति नहीं",
          ),
        },
        {
          id: "small",
          label: t("They are far too small to see with our eyes", "वे आँखों से देखने के लिए बहुत छोटे हैं"),
          feedback: t(
            "Size isn't the test: bacteria are tiny too, and clearly alive. The test is whether molecules are being moved about inside.",
            "आकार कसौटी नहीं है: जीवाणु भी बहुत छोटे होते हैं, और साफ़ तौर पर जीवित हैं। कसौटी यह है कि अंदर अणुओं को इधर-उधर ले जाया जा रहा है या नहीं।",
          ),
        },
        {
          id: "walk",
          label: t("They can't walk, run or move about at all", "वे चल, दौड़ या हिल-डुल नहीं सकते"),
          feedback: t(
            "Plants can't walk either, and they are alive. Visible movement is not enough to decide.",
            "पौधे भी नहीं चल सकते, और वे जीवित हैं। दिखने वाली गति से फ़ैसला नहीं होता।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("How do we know something is alive?", "कैसे पता चले कि कुछ जीवित है?")),
      w.definition(
        t(
          "**Organism.** Any living thing, a plant, an animal, a mushroom or a single bacterium, is an **organism**. Every organism is made of **cells**, the tiny units of life; in a big organism, cells of the same kind work together as a **tissue**.",
          "**जीव।** कोई भी जीवित चीज़, पौधा, जंतु, मशरूम या एक अकेला जीवाणु, एक **जीव** है। हर जीव **कोशिकाओं** से बना है, जो जीवन की नन्ही इकाइयाँ हैं; बड़े जीव में एक ही तरह की कोशिकाएँ मिलकर एक **ऊतक** की तरह काम करती हैं।",
        ),
      ),
      w.body(
        t(
          "A dog running or a cow chewing is clearly alive. A sleeping dog is too: we see it breathing. So we usually look for some movement. But a plant that isn't visibly growing is still alive, and some animals breathe with no movement you can see. Visible movement is not enough.",
          "दौड़ता कुत्ता या जुगाली करती गाय साफ़ तौर पर जीवित है। सोता हुआ कुत्ता भी: हम उसे साँस लेते देखते हैं। इसलिए हम आमतौर पर किसी गति को खोजते हैं। पर जो पौधा बढ़ता नहीं दिख रहा, वह भी जीवित है, और कुछ जंतु बिना किसी दिखने वाली गति के साँस लेते हैं। दिखने वाली गति काफ़ी नहीं है।",
        ),
      ),
      w.definition(
        t(
          "**Molecular movement.** Inside every living cell, **molecules** (the tiny particles everything is made of) are moved about all the time, far too small to see. Biologists say this invisible movement of molecules is necessary for life. Viruses are a puzzle: outside a cell they show no molecular movement at all, and only once they infect a cell do their molecules start moving. That's why biologists argue about whether viruses are truly alive.",
          "**आण्विक गति।** हर जीवित कोशिका के अंदर **अणु** (वे नन्हे कण जिनसे हर चीज़ बनी है) हर समय इधर-उधर ले जाए जाते हैं, इतने छोटे कि दिखते नहीं। जीवविज्ञानी कहते हैं कि अणुओं की यह अदृश्य गति जीवन के लिए ज़रूरी है। वायरस एक पहेली हैं: कोशिका के बाहर उनमें अणुओं की कोई गति नहीं दिखती, और किसी कोशिका को संक्रमित करने के बाद ही उनके अणु चलने लगते हैं। इसीलिए जीवविज्ञानी बहस करते हैं कि वायरस सचमुच जीवित हैं या नहीं।",
        ),
      ),
      virus,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Order breaks down, so it must be maintained: the life processes. */
const maintain = page(
  "maintain",
  (b) => {
    const w = wordsOn(b);
    const energy = choiceQuestion(b, {
      name: "energy",
      prompt: t(
        "Which life process brings a source of energy into the body from outside?",
        "कौन-सा जैव प्रक्रम बाहर से ऊर्जा का स्रोत शरीर के अंदर लाता है?",
      ),
      options: [
        { id: "right", label: t("Nutrition", "पोषण") },
        {
          id: "excretion",
          label: t("Excretion", "उत्सर्जन"),
          feedback: t(
            "Excretion takes harmful wastes out. Food, the source of energy, comes in by nutrition.",
            "उत्सर्जन हानिकारक अपशिष्ट बाहर निकालता है। भोजन, ऊर्जा का स्रोत, पोषण से अंदर आता है।",
          ),
        },
        {
          id: "transport",
          label: t("Transport", "परिवहन"),
          feedback: t(
            "Transport carries things around inside the body. Getting food in from outside is nutrition.",
            "परिवहन चीज़ों को शरीर के अंदर इधर-उधर ले जाता है। बाहर से भोजन अंदर लाना पोषण है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Life is a maintenance job", "जीवन एक रखरखाव का काम है")),
      w.body(
        t(
          "A living body is highly organised: cells make tissues, tissues make organs. Left alone, this order keeps breaking down, the way a house falls apart if no one repairs it. If the order breaks down completely, the organism dies. So living things must keep repairing and maintaining themselves, all the time, even while asleep. Since everything is made of molecules, that means moving molecules about all the time.",
          "जीवित शरीर बहुत व्यवस्थित है: कोशिकाएँ ऊतक बनाती हैं, ऊतक अंग बनाते हैं। अपने आप छोड़ दें तो यह व्यवस्था टूटती रहती है, जैसे मरम्मत न हो तो घर ढह जाता है। व्यवस्था पूरी टूट जाए तो जीव मर जाता है। इसलिए जीवों को हर समय, सोते हुए भी, अपनी मरम्मत और रखरखाव करते रहना पड़ता है। हर चीज़ अणुओं से बनी है, इसलिए इसका मतलब है हर समय अणुओं को इधर-उधर ले जाना।",
        ),
      ),
      w.definition(
        t(
          "**Life processes.** The processes which together do this maintenance job are the **life processes**. Four of them: **nutrition**, taking in food from outside (food is the source of energy, and of raw material for growing); **respiration**, breaking down food inside cells to release energy, usually using oxygen taken in from outside; **transport**, carrying food and oxygen to every part of the body; and **excretion**, removing the harmful waste by-products from the body.",
          "**जैव प्रक्रम।** जो प्रक्रम मिलकर यह रखरखाव का काम करते हैं, वे **जैव प्रक्रम** हैं। ये चार हैं: **पोषण**, बाहर से भोजन लेना (भोजन ऊर्जा का स्रोत है, और बढ़ने के लिए कच्चे माल का भी); **श्वसन**, कोशिकाओं के अंदर भोजन तोड़कर ऊर्जा निकालना, आम तौर पर बाहर से ली गई ऑक्सीजन की मदद से; **परिवहन**, भोजन और ऑक्सीजन को शरीर के हर हिस्से तक पहुँचाना; और **उत्सर्जन**, शरीर से हानिकारक अपशिष्ट उत्पादों को बाहर निकालना।",
        ),
      ),
      w.note(
        t(
          "Life on Earth is built from carbon-based molecules, so most food sources are carbon-based too.",
          "पृथ्वी पर जीवन कार्बन-आधारित अणुओं से बना है, इसलिए भोजन के ज़्यादातर स्रोत भी कार्बन-आधारित हैं।",
        ),
      ),
      energy,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Diffusion is enough for one cell, not for a big body: hence organs and transport. */
const diffusion = page(
  "diffusion",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "Why diffusion is not enough for a big body (NCERT 6.1, in-text Q1): oxygen diffusing in from the surface reaches only the outer cells; inner cells starve unless a transport system brings it. Hence specialised organs plus transport.",
    );
    const body = b.prop(diffusionReachDef, "body", {
      layers: 1,
      hasTransport: false,
      canSetLayers: true,
      canSetTransport: true,
    });
    b.studentOnly(body.action(DiffusionAction.SetLayers));
    b.studentOnly(body.action(DiffusionAction.SetTransport));
    b.standsFor(
      body,
      "a body drawn as cells, 1 to 5 cells deep, with oxygen diffusing in from the water around it; blood vessels can be added",
    );
    const inner = choiceQuestion(b, {
      name: "inner",
      prompt: t(
        "Cells that get oxygen are coloured; cells that get none stay grey. Make the body 5 cells deep, with no blood vessels. Which cells get no oxygen?",
        "जिन कोशिकाओं को ऑक्सीजन मिलती है वे रंगीन हैं; जिन्हें नहीं मिलती वे स्लेटी रहती हैं। शरीर को 5 कोशिका गहरा बनाओ, बिना रुधिर वाहिकाओं के। किन कोशिकाओं को ऑक्सीजन नहीं मिलती?",
      ),
      options: [
        { id: "right", label: t("The ones deep inside", "जो अंदर गहराई में हैं") },
        {
          id: "outer",
          label: t("The ones on the surface", "जो सतह पर हैं"),
          feedback: t(
            "The surface cells touch the water, so oxygen reaches them first. It's the inner cells, far from the surface, that miss out.",
            "सतह की कोशिकाएँ पानी को छूती हैं, इसलिए ऑक्सीजन सबसे पहले उन तक पहुँचती है। वंचित तो अंदर की कोशिकाएँ रहती हैं, जो सतह से दूर हैं।",
          ),
        },
        {
          id: "none",
          label: t("Every cell gets some", "हर कोशिका को कुछ मिलती है"),
          feedback: t(
            "Count the grey cells: diffusion only reaches the outer layer. Try adding blood vessels and see what changes.",
            "धूसर कोशिकाएँ गिनो: विसरण केवल बाहरी परत तक पहुँचता है। रुधिर वाहिकाएँ जोड़कर देखो क्या बदलता है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const so = w.body(
      t(
        "Diffusion is too slow to carry oxygen far into a thick body. So in a big organism, special tissues take in food and oxygen at one place (the gut, the lungs), and a **transport system** carries them to every cell. Waste must also be carried away, to special tissues that throw it out: **excretion**.",
        "विसरण इतना धीमा है कि ऑक्सीजन को मोटे शरीर में दूर तक नहीं ले जा सकता। इसलिए बड़े जीव में ख़ास ऊतक एक जगह (आहार नाल, फेफड़े) भोजन और ऑक्सीजन लेते हैं, और एक **परिवहन तंत्र** उन्हें हर कोशिका तक पहुँचाता है। अपशिष्ट को भी बाहर फेंकने वाले ख़ास ऊतकों तक ले जाना पड़ता है: **उत्सर्जन**।",
      ),
      "so",
      { isHidden: true },
    );
    b.when(inner.on(QuestionSignal.Correct), [theBoard.show(so), theBoard.pass()]);
    return column([
      w.title(
        t("Why one cell is easy and a big body isn't", "एक कोशिका आसान क्यों, बड़ा शरीर क्यों नहीं"),
      ),
      w.definition(
        t(
          "**Diffusion.** A substance spreading out by itself from where there is more of it to where there is less, like the smell of incense filling a room, is **diffusion**. Oxygen gets into cells this way.",
          "**विसरण।** किसी पदार्थ का अपने आप ज़्यादा मात्रा वाली जगह से कम मात्रा वाली जगह की ओर फैलना, जैसे अगरबत्ती की ख़ुशबू का कमरे में भर जाना, **विसरण** है। ऑक्सीजन इसी तरह कोशिकाओं में जाती है।",
        ),
      ),
      w.body(
        t(
          "A single-celled organism has its whole surface touching the water around it, so food and oxygen simply diffuse in and wastes diffuse out. It needs no special organs. Now make the body thicker, one layer of cells at a time.",
          "एककोशिकीय जीव की पूरी सतह आसपास के पानी को छूती है, इसलिए भोजन और ऑक्सीजन बस विसरित होकर अंदर आ जाते हैं और अपशिष्ट बाहर चले जाते हैं। उसे किसी ख़ास अंग की ज़रूरत नहीं। अब शरीर को एक-एक परत करके मोटा करो।",
        ),
      ),
      body,
      inner,
      so,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* See it in life                                                       */
/* ------------------------------------------------------------------ */

/** Why Kabir needs lungs and a heart, and an Amoeba doesn't. */
const inLife = page(
  "in-life",
  (b) => {
    const w = wordsOn(b);
    const track = b.prop(lifeSceneDef, "track", { scene: LifeScene.FirstRun });
    b.standsFor(track, "Kabir out of breath on the track, Riya with her stopwatch");
    const amoeba = choiceQuestion(b, {
      name: "amoeba",
      prompt: t(
        "An Amoeba in a pond has no lungs, no heart and no blood. Why does Kabir need all three?",
        "तालाब के अमीबा के पास न फेफड़े हैं, न हृदय, न रुधिर। कबीर को तीनों क्यों चाहिए?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Most of his cells are far from the outside, beyond the reach of diffusion",
            "उसकी ज़्यादातर कोशिकाएँ बाहर से दूर हैं, विसरण की पहुँच से परे",
          ),
        },
        {
          id: "active",
          label: t("Only because he runs", "केवल इसलिए कि वह दौड़ता है"),
          feedback: t(
            "Even asleep, his inner cells need oxygen all the time. A single cell touches the water all over; Kabir's cells are buried deep inside.",
            "सोते हुए भी उसकी अंदर की कोशिकाओं को हर समय ऑक्सीजन चाहिए। एक कोशिका हर तरफ़ से पानी को छूती है; कबीर की कोशिकाएँ अंदर गहरे दबी हैं।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const stop = w.definition(
      t(
        "**Stop 1 done.** Being alive means non-stop maintenance, and that needs four life processes: nutrition, respiration, transport and excretion. Kabir's body does all four every second, even asleep; running just asks for much more of each. Next stop: where food comes from in the first place, starting with Grandpa's money plant.",
        "**पड़ाव 1 पूरा।** ज़िंदा होने का मतलब है लगातार रखरखाव, और इसके लिए चार जैव प्रक्रम चाहिए: पोषण, श्वसन, परिवहन और उत्सर्जन। कबीर का शरीर ये चारों हर पल करता है, सोते हुए भी; दौड़ना बस हर एक से कहीं ज़्यादा माँगता है। अगला पड़ाव: भोजन आता कहाँ से है, दादाजी के मनी प्लांट से शुरू करके।",
      ),
      "stop",
      { isHidden: true },
    );
    b.when(amoeba.on(QuestionSignal.Correct), [theBoard.show(stop), theBoard.pass()]);
    return column([
      w.title(t("Back on the track", "फिर ट्रैक पर")),
      track,
      w.body(
        t(
          "Kabir is gasping because his muscles are asking for far more oxygen and food than usual, and his lungs, heart and blood are racing to deliver them.",
          "कबीर इसलिए हाँफ रहा है क्योंकि उसकी मांसपेशियाँ सामान्य से कहीं ज़्यादा ऑक्सीजन और भोजन माँग रही हैं, और उसके फेफड़े, हृदय और रुधिर उन्हें पहुँचाने के लिए दौड़ रहे हैं।",
        ),
      ),
      amoeba,
      stop,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** NCERT 6.1 in-text questions 2–4. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const criteria = choiceQuestion(b, {
      name: "criteria",
      prompt: t(
        "What do biologists use to decide whether something is alive?",
        "कुछ जीवित है या नहीं, यह तय करने के लिए जीवविज्ञानी क्या देखते हैं?",
      ),
      options: [
        {
          id: "right",
          label: t("Molecules moving inside it", "इसके भीतर अणुओं की गति"),
        },
        {
          id: "green",
          label: t("Whether it is green or not", "यह हरा है या नहीं"),
          feedback: t(
            "Many living things aren't green, and some plants have leaves of other colours. The test is molecular movement.",
            "बहुत से जीव हरे नहीं होते, और कुछ पौधों की पत्तियाँ दूसरे रंग की होती हैं। कसौटी आण्विक गति है।",
          ),
        },
        {
          id: "visible",
          label: t("Movement we can see with our eyes", "आँखों से दिखने वाली गति"),
          feedback: t(
            "A plant that isn't visibly growing is still alive. Visible movement isn't enough; molecular movement is the test.",
            "जो पौधा बढ़ता नहीं दिख रहा, वह भी जीवित है। दिखने वाली गति काफ़ी नहीं; कसौटी आण्विक गति है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const raw = choiceQuestion(b, {
      name: "raw",
      prompt: t(
        "What does an organism use the raw materials it takes in from outside for?",
        "जीव बाहर से लिए गए कच्चे माल का उपयोग किसके लिए करता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "For energy, and to build its body as it grows",
            "ऊर्जा के लिए, और बढ़ते हुए अपना शरीर बनाने के लिए",
          ),
        },
        {
          id: "energy",
          label: t("Only for energy", "केवल ऊर्जा के लिए"),
          feedback: t(
            "Energy, yes, but a growing body also needs extra material to build new cells and tissues.",
            "ऊर्जा, हाँ, पर बढ़ते शरीर को नई कोशिकाएँ और ऊतक बनाने के लिए अतिरिक्त सामग्री भी चाहिए।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const which = choiceQuestion(b, {
      name: "which",
      prompt: t(
        "Which processes are essential for maintaining life?",
        "जीवन बनाए रखने के लिए कौन-से प्रक्रम ज़रूरी हैं?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Nutrition, respiration, transport and excretion",
            "पोषण, श्वसन, परिवहन और उत्सर्जन",
          ),
        },
        {
          id: "move",
          label: t("Walking, running and talking", "चलना, दौड़ना और बोलना"),
          feedback: t(
            "Those are things an animal can do, not maintenance. A sleeping body still needs all four life processes.",
            "ये वे काम हैं जो जंतु कर सकता है, रखरखाव नहीं। सोते हुए शरीर को भी चारों जैव प्रक्रम चाहिए।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        "**Mission log.** ✓ Alive means molecules are being moved all the time, to repair and maintain the body. ✓ Four life processes do this: nutrition, respiration, transport, excretion. ✓ Diffusion works for one cell; a big body needs organs and a transport system. Next: how a plant feeds itself.",
        "**मिशन लॉग।** ✓ जीवित होने का मतलब है कि शरीर की मरम्मत और रखरखाव के लिए अणु हर समय गति में हैं। ✓ चार जैव प्रक्रम यह करते हैं: पोषण, श्वसन, परिवहन, उत्सर्जन। ✓ एक कोशिका के लिए विसरण काफ़ी है; बड़े शरीर को अंग और परिवहन तंत्र चाहिए। आगे: पौधा अपना भोजन कैसे बनाता है।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(which.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([w.title(t("Your turn", "अब तुम्हारी बारी")), criteria, raw, which, log, space()]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, see it in life, practice. */
export const overview = [hook, firstRun, why, alive, maintain, diffusion, inLife, yourTurn];

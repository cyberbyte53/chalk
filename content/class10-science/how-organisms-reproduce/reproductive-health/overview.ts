import { PassOn, column, page, space, t, theBoard } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/content-source/patterns";
import { QuestionSignal } from "@chalk/prop";
import {
  ContraceptionAction,
  CycleAction,
  ReproductionScene,
  contraceptionChartDef,
  menstrualCycleDef,
  reproductionSceneDef,
} from "@chalk/prop-reproduction";

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */

/** The health class continues. */
const hook = page("hook", (b) => {
  const w = wordsOn(b);
  const room = b.prop(reproductionSceneDef, "room", { scene: ReproductionScene.HealthClass });
  b.standsFor(room, "the classroom again: a teacher at the blackboard, students seen from behind");
  return column([
    w.title(t("Menstruation and reproductive health", "ऋतुस्राव और जनन स्वास्थ्य")),
    room,
    w.body(
      t(
        "Recap: from puberty an ovary releases one egg a month, and the uterus prepares every month to receive a fertilised egg. Two questions for this lesson. What happens when the egg is not fertilised? And how do we keep the body and mind healthy as we mature?",
        "पिछली बार: यौवनारंभ से अंडाशय हर महीने एक अंड छोड़ता है, और गर्भाशय हर महीने निषेचित अंड को लेने की तैयारी करता है। इस पाठ के दो प्रश्न। जब अंड निषेचित नहीं होता तब क्या होता है? और परिपक्व होते हुए हम शरीर और मन को स्वस्थ कैसे रखें?",
      ),
    ),
    space(),
  ]);
});

/* ------------------------------------------------------------------ */
/* Learn                                                                */
/* ------------------------------------------------------------------ */

/** NCERT 8.3.3(c): menstruation. */
const menstruation = page(
  "menstruation",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "NCERT 8.3.3(c): if the egg is not fertilised it lives about one day; the uterus lining, thick and spongy to nourish an embryo, is not needed and slowly breaks down, coming out through the vagina as blood and mucus. This happens roughly every month and lasts about two to eight days: menstruation.",
    );
    const cycle = b.prop(menstrualCycleDef, "cycle", { step: 0, showNames: true, canStep: true });
    b.studentOnly(cycle.action(CycleAction.Next));
    b.studentOnly(cycle.action(CycleAction.Reset));
    b.standsFor(
      cycle,
      "a monthly cycle diagram: the uterus lining thickens, an ovary releases one egg, the egg is not fertilised and lives about a day, the lining breaks down for 2 to 8 days",
    );
    const why = choiceQuestion(b, {
      name: "why",
      prompt: t(
        "Step through the cycle. Why does menstruation occur?",
        "चक्र क़दम-दर-क़दम देखो। ऋतुस्राव क्यों होता है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "The egg is not fertilised, so the thickened uterus lining isn't needed and breaks down",
            "अंड निषेचित नहीं होता, इसलिए गर्भाशय की मोटी भित्ति की ज़रूरत नहीं रहती और वह टूट जाती है",
          ),
        },
        {
          id: "illness",
          label: t("It is a sign of illness", "यह बीमारी का संकेत है"),
          feedback: t(
            "Menstruation is a normal monthly cycle, not an illness. It happens because the lining prepared for an embryo isn't needed when the egg is not fertilised.",
            "ऋतुस्राव एक सामान्य मासिक चक्र है, बीमारी नहीं। यह इसलिए होता है क्योंकि अंड निषेचित न होने पर भ्रूण के लिए तैयार भित्ति की ज़रूरत नहीं रहती।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("When the egg is not fertilised", "जब अंड निषेचित नहीं होता")),
      w.body(
        t(
          "Since the ovary releases one egg every month, the uterus also prepares itself every month to receive a fertilised egg: its lining becomes thick and spongy, to nourish an embryo if fertilisation takes place.",
          "क्योंकि अंडाशय हर महीने एक अंड छोड़ता है, गर्भाशय भी हर महीने निषेचित अंड को लेने की तैयारी करता है: उसकी भित्ति मोटी और स्पंजी हो जाती है, ताकि निषेचन होने पर भ्रूण को पोषण दे सके।",
        ),
      ),
      w.definition(
        t(
          "**Menstruation.** If the egg is not fertilised, it lives for about **one day**. The thick lining is then not needed, so it slowly breaks down and comes out through the vagina as blood and mucus. This cycle takes place **roughly every month** and usually lasts about **two to eight days**. It is called **menstruation**.",
          "**ऋतुस्राव।** अगर अंड निषेचित नहीं होता, तो वह लगभग **एक दिन** जीवित रहता है। तब मोटी भित्ति की ज़रूरत नहीं रहती, इसलिए वह धीरे-धीरे टूटकर योनि से रुधिर और श्लेष्मा के रूप में बाहर आती है। यह चक्र **लगभग हर महीने** होता है और आमतौर पर लगभग **दो से आठ दिन** चलता है। इसे **ऋतुस्राव** कहते हैं।",
        ),
      ),
      cycle,
      why,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** NCERT 8.3.3(d): maturation is not readiness; pressures; diseases. */
const ready = page(
  "ready",
  (b) => {
    const w = wordsOn(b);
    const ready = choiceQuestion(b, {
      name: "ready",
      prompt: t(
        "According to the textbook, does some degree of sexual maturation mean a person is ready for sexual acts or for having children?",
        "पाठ्यपुस्तक के अनुसार, क्या कुछ लैंगिक परिपक्वता का अर्थ है कि व्यक्ति लैंगिक क्रियाओं या बच्चे पैदा करने के लिए तैयार है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "No: maturation is gradual and happens while the body is still growing",
            "नहीं: परिपक्वता धीरे-धीरे होती है, जब शरीर अभी बढ़ ही रहा होता है",
          ),
        },
        {
          id: "yes",
          label: t("Yes, once puberty begins", "हाँ, यौवनारंभ शुरू होते ही"),
          feedback: t(
            "The textbook says the opposite: maturation is gradual and happens while general growth is still going on, so it does not mean the body or the mind is ready for this major responsibility.",
            "पाठ्यपुस्तक इसका उल्टा कहती है: परिपक्वता धीरे-धीरे होती है, जब सामान्य वृद्धि अभी चल रही होती है, इसलिए इसका अर्थ यह नहीं कि शरीर या मन इस बड़ी ज़िम्मेदारी के लिए तैयार है।",
          ),
        },
      ],
      answer: "right",
    });
    const condom = choiceQuestion(b, {
      name: "condom",
      prompt: t(
        "Which of these, according to the textbook, helps prevent the transmission of many sexually transmitted infections to some extent?",
        "पाठ्यपुस्तक के अनुसार, इनमें से कौन कई यौन संचारित संक्रमणों के फैलाव को कुछ हद तक रोकने में मदद करता है?",
      ),
      options: [
        { id: "right", label: t("Using a condom", "कंडोम का उपयोग") },
        {
          id: "pill",
          label: t("Washing with soap afterwards", "बाद में साबुन से धोना"),
          feedback: t(
            "Washing doesn't stop infections passing between bodies; the textbook names the condom.",
            "धोने से शरीरों के बीच संक्रमण फैलना नहीं रुकता; पाठ्यपुस्तक कंडोम का नाम लेती है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Maturing is not the same as being ready", "परिपक्व होना तैयार होने जैसा नहीं")),
      w.body(
        t(
          "Sexual maturation is gradual and takes place while general body growth is still going on. So some degree of maturation does not mean that the body or the mind is ready for sexual acts, or for having and bringing up children.",
          "लैंगिक परिपक्वता धीरे-धीरे होती है, जब शरीर की सामान्य वृद्धि अभी चल रही होती है। इसलिए कुछ परिपक्वता का अर्थ यह नहीं कि शरीर या मन लैंगिक क्रियाओं, या बच्चे पैदा करने और पालने के लिए तैयार है।",
        ),
      ),
      w.body(
        t(
          "How do we decide when we are ready for this major responsibility? We are all under different kinds of pressure: from friends to take part in activities whether we want to or not, from families to marry and have children, and from government agencies to avoid having children. Making choices can become very difficult.",
          "हम कैसे तय करें कि हम इस बड़ी ज़िम्मेदारी के लिए कब तैयार हैं? हम सब पर अलग-अलग तरह के दबाव होते हैं: दोस्तों से, ऐसे कामों में भाग लेने का जो हम चाहें या न चाहें; परिवार से, विवाह करने और बच्चे पैदा करने का; और सरकारी संस्थाओं से, बच्चे न पैदा करने का। चुनाव करना बहुत मुश्किल हो सकता है।",
        ),
      ),
      ready,
      w.definition(
        t(
          "**Sexually transmitted diseases (STDs).** Since the sexual act is a very intimate connection of bodies, many diseases can be passed on through it. These include **bacterial** infections such as **gonorrhoea** and **syphilis**, and **viral** infections such as **warts** and **HIV-AIDS**. Using a covering called a **condom** for the penis during sex helps to prevent the transmission of many of these infections to some extent.",
          "**यौन संचारित रोग।** क्योंकि लैंगिक क्रिया शरीरों का बहुत निकट संबंध है, इसके ज़रिए कई रोग फैल सकते हैं। इनमें **जीवाणु** संक्रमण जैसे **गोनोरिया** और **सिफ़लिस**, और **वायरस** संक्रमण जैसे **मस्से** और **HIV-AIDS** शामिल हैं। लैंगिक क्रिया के समय शिश्न के लिए **कंडोम** नाम के आवरण का उपयोग इनमें से कई संक्रमणों के फैलाव को कुछ हद तक रोकने में मदद करता है।",
        ),
      ),
      condom,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Contraceptive methods, by category. */
const contraception = page(
  "contraception",
  (b) => {
    const w = wordsOn(b);
    b.purpose(
      "NCERT 8.3.3(d): pregnancy makes major demands on a woman's body and mind, so methods to avoid it have been devised. Categories: mechanical barrier (condom, or similar coverings in the vagina); hormonal (oral pills, which can have side effects); devices in the uterus (loop, copper-T; irritation); surgical (blocking the vas deferens or fallopian tube; safe long-run, but surgery can cause infections if not done properly). Tap each method.",
    );
    const chart = b.prop(contraceptionChartDef, "chart", {
      selected: null,
      canTap: true,
      showStd: true,
    });
    b.studentOnly(chart.action(ContraceptionAction.Tap));
    b.standsFor(
      chart,
      "four cards: condom (barrier), oral pills (hormonal), loop or copper-T (device in the uterus), surgical method; tap one to read how it works, its drawback and whether it helps against STDs",
    );
    const which = choiceQuestion(b, {
      name: "which",
      prompt: t(
        "Tap the cards. If a woman is using a copper-T, will it protect her from sexually transmitted diseases?",
        "कार्ड पर टैप करो। अगर कोई महिला कॉपर-T का उपयोग कर रही है, तो क्या यह उसे यौन संचारित रोगों से बचाएगा?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "No: it prevents pregnancy, but doesn't stop infections passing between bodies",
            "नहीं: यह गर्भधारण रोकता है, पर शरीरों के बीच संक्रमण फैलना नहीं रोकता",
          ),
        },
        {
          id: "yes",
          label: t("Yes, it protects against all of them", "हाँ, यह सबसे बचाता है"),
          feedback: t(
            "A copper-T sits inside the uterus to prevent pregnancy. It is not a covering, so it does not stop the transmission of infections.",
            "कॉपर-T गर्भधारण रोकने के लिए गर्भाशय के अंदर रहता है। यह आवरण नहीं है, इसलिए संक्रमण का फैलाव नहीं रोकता।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Avoiding pregnancy: contraception", "गर्भधारण से बचाव: गर्भनिरोधन")),
      w.body(
        t(
          "The sexual act always has the potential to lead to pregnancy. Pregnancy makes major demands on the body and mind of the woman, and if she is not ready for it, her health will be adversely affected. So many ways have been devised to avoid pregnancy.",
          "लैंगिक क्रिया से हमेशा गर्भधारण की संभावना रहती है। गर्भधारण महिला के शरीर और मन से बहुत कुछ माँगता है, और अगर वह इसके लिए तैयार नहीं है, तो उसके स्वास्थ्य पर बुरा असर पड़ेगा। इसलिए गर्भधारण से बचने के कई तरीक़े बनाए गए हैं।",
        ),
      ),
      w.definition(
        t(
          "**Contraceptive methods.** Methods to avoid pregnancy are **contraceptive methods**. NCERT groups them in four kinds.",
          "**गर्भनिरोधक विधियाँ।** गर्भधारण से बचने की विधियाँ **गर्भनिरोधक विधियाँ** हैं। NCERT इन्हें चार प्रकारों में बाँटती है।",
        ),
      ),
      w.body(
        t(
          "**Barrier** (condom, or a similar covering worn in the vagina): stops sperm reaching the egg; also helps against some sexually transmitted infections.",
          "**अवरोध** (कंडोम, या योनि में पहना जाने वाला ऐसा ही आवरण): शुक्राणु को अंड तक पहुँचने से रोकता है; कुछ यौन संचारित संक्रमणों से भी बचाता है।",
        ),
      ),
      w.body(
        t(
          "**Hormonal** (pills taken by mouth): stop eggs being released; can have side effects.",
          "**हॉर्मोनी** (मुख से ली जाने वाली गोलियाँ): अंड निकलना रोकती हैं; इनके दुष्प्रभाव हो सकते हैं।",
        ),
      ),
      w.body(
        t(
          "**Device in the uterus** (loop, copper-T): can cause side effects by irritating the uterus.",
          "**गर्भाशय में युक्ति** (लूप, कॉपर-T): गर्भाशय में जलन से दुष्प्रभाव हो सकते हैं।",
        ),
      ),
      w.body(
        t(
          "**Surgical** (the **vas deferens** in the male or the **fallopian tube** in the female is blocked): fertilisation can't happen; safe in the long run, but surgery itself can cause infections if not done properly.",
          "**शल्य** (पुरुष में **शुक्रवाहिका** या महिला में **फ़ैलोपियन नलिका** अवरुद्ध की जाती है): निषेचन नहीं हो सकता; लंबे समय में सुरक्षित, पर ठीक से न की जाए तो शल्यक्रिया से ही संक्रमण हो सकते हैं।",
        ),
      ),
      chart,
      which,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** Sex-selective abortion and the law; population and inequality. */
const society = page(
  "society",
  (b) => {
    const w = wordsOn(b);
    const law = choiceQuestion(b, {
      name: "law",
      prompt: t(
        "What does the law in India say about prenatal sex determination?",
        "प्रसवपूर्व लिंग निर्धारण के बारे में भारत का क़ानून क्या कहता है?",
      ),
      options: [
        { id: "right", label: t("It is prohibited", "यह प्रतिबंधित है") },
        {
          id: "allowed",
          label: t("It is allowed on request", "माँगने पर इसकी अनुमति है"),
          feedback: t(
            "Prenatal sex determination is prohibited by law, because it has been misused for illegal sex-selective abortion of female foetuses.",
            "प्रसवपूर्व लिंग निर्धारण क़ानून द्वारा प्रतिबंधित है, क्योंकि इसका दुरुपयोग मादा भ्रूणों के अवैध लिंग-चयनात्मक गर्भपात के लिए हुआ है।",
          ),
        },
      ],
      answer: "right",
    });
    return column([
      w.title(t("Health, society and the law", "स्वास्थ्य, समाज और क़ानून")),
      w.body(
        t(
          "Surgery can also be used to remove unwanted pregnancies. This may be misused by people who do not want a particular child, as happens in **illegal sex-selective abortion of female foetuses**. For a healthy society, the female-male sex ratio must be maintained. Because of reckless female foeticide, the **child sex ratio** is declining at an alarming rate in some sections of our society, although **prenatal sex determination has been prohibited by law**.",
          "शल्यक्रिया का उपयोग अनचाहे गर्भ को हटाने के लिए भी हो सकता है। इसका दुरुपयोग वे लोग कर सकते हैं जो कोई ख़ास बच्चा नहीं चाहते, जैसा **मादा भ्रूणों के अवैध लिंग-चयनात्मक गर्भपात** में होता है। एक स्वस्थ समाज के लिए स्त्री-पुरुष लिंग अनुपात बना रहना चाहिए। अंधाधुंध मादा भ्रूण हत्या के कारण हमारे समाज के कुछ वर्गों में **शिशु लिंग अनुपात** चिंताजनक दर से घट रहा है, जबकि **प्रसवपूर्व लिंग निर्धारण क़ानून द्वारा प्रतिबंधित है**।",
        ),
      ),
      w.body(
        t(
          "Reproduction is how organisms increase their populations, and birth and death rates decide a population's size. Many people are concerned about the size of the human population, because an expanding population makes it harder to improve everybody's standard of living. But if **inequality** in society is the main reason for poor living standards, population size is relatively unimportant. Look around you: what do you think are the most important reasons for poor living standards?",
          "जनन वह तरीक़ा है जिससे जीव अपनी समष्टि बढ़ाते हैं, और जन्म और मृत्यु दरें समष्टि का आकार तय करती हैं। बहुत से लोग मानव जनसंख्या के आकार को लेकर चिंतित हैं, क्योंकि बढ़ती जनसंख्या में सबका जीवन-स्तर सुधारना कठिन हो जाता है। पर अगर समाज में **असमानता** ही ख़राब जीवन-स्तर का मुख्य कारण है, तो जनसंख्या का आकार अपेक्षाकृत कम महत्वपूर्ण है। अपने आसपास देखो: तुम्हें ख़राब जीवन-स्तर के सबसे महत्वपूर्ण कारण क्या लगते हैं?",
        ),
      ),
      law,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

/** NCERT Exercises 6, 8 and 11. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const lining = choiceQuestion(b, {
      name: "lining",
      prompt: t(
        "About how long does an unfertilised egg live, and how long does menstruation usually last?",
        "निषेचित न हुआ अंड लगभग कितने समय जीवित रहता है, और ऋतुस्राव आमतौर पर कितने दिन चलता है?",
      ),
      options: [
        {
          id: "right",
          label: t("About one day; about two to eight days", "लगभग एक दिन; लगभग दो से आठ दिन"),
        },
        {
          id: "month",
          label: t("About a month; about one day", "लगभग एक महीना; लगभग एक दिन"),
          feedback: t(
            "The cycle repeats roughly monthly, but the unfertilised egg lives about one day, and menstruation lasts about two to eight days.",
            "चक्र लगभग हर महीने दोहराता है, पर निषेचित न हुआ अंड लगभग एक दिन जीवित रहता है, और ऋतुस्राव लगभग दो से आठ दिन चलता है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const methods = choiceQuestion(b, {
      name: "methods",
      prompt: t(
        "Which list gives the categories of contraceptive methods in the textbook?",
        "कौन-सी सूची पाठ्यपुस्तक में दी गई गर्भनिरोधक विधियों की श्रेणियाँ बताती है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Barrier, hormonal (pills), devices in the uterus, surgical",
            "अवरोध, हॉर्मोनी (गोलियाँ), गर्भाशय में युक्तियाँ, शल्य",
          ),
        },
        {
          id: "wrong",
          label: t("Vaccines, antibiotics, exercise", "टीके, प्रतिजैविक, व्यायाम"),
          feedback: t(
            "None of these are contraceptive methods. The textbook's categories are barrier, hormonal, devices in the uterus and surgical.",
            "इनमें से कोई गर्भनिरोधक विधि नहीं है। पाठ्यपुस्तक की श्रेणियाँ हैं: अवरोध, हॉर्मोनी, गर्भाशय में युक्तियाँ और शल्य।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const reasons = choiceQuestion(b, {
      name: "reasons",
      prompt: t(
        "Which is a reason, given in the textbook, for adopting contraceptive methods?",
        "पाठ्यपुस्तक में गर्भनिरोधक विधियाँ अपनाने का कौन-सा कारण दिया गया है?",
      ),
      options: [
        {
          id: "right",
          label: t(
            "Pregnancy makes major demands on a woman's body and mind; if she isn't ready, her health suffers",
            "गर्भधारण महिला के शरीर और मन से बहुत कुछ माँगता है; अगर वह तैयार नहीं, तो उसका स्वास्थ्य बिगड़ता है",
          ),
        },
        {
          id: "growth",
          label: t("To make the body grow taller", "शरीर को लंबा करने के लिए"),
          feedback: t(
            "Contraception has nothing to do with growth. The textbook's reasons are the woman's health and readiness; condoms also help reduce the spread of some infections.",
            "गर्भनिरोधन का वृद्धि से कोई संबंध नहीं। पाठ्यपुस्तक के कारण महिला का स्वास्थ्य और तैयारी हैं; कंडोम कुछ संक्रमणों का फैलाव कम करने में भी मदद करता है।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const log = w.definition(
      t(
        "**Lesson log.** ✓ Menstruation: the unfertilised egg lives about a day; the lining breaks down, roughly monthly, for 2–8 days. ✓ Maturing isn't the same as being ready. ✓ STDs: gonorrhoea, syphilis (bacterial); warts, HIV-AIDS (viral); a condom helps to some extent. ✓ Contraception: barrier, hormonal, devices, surgical. ✓ Prenatal sex determination is prohibited by law.",
        "**पाठ लॉग।** ✓ ऋतुस्राव: निषेचित न हुआ अंड लगभग एक दिन जीता है; भित्ति लगभग हर महीने टूटती है, 2–8 दिन तक। ✓ परिपक्व होना तैयार होने जैसा नहीं। ✓ यौन संचारित रोग: गोनोरिया, सिफ़लिस (जीवाणु); मस्से, HIV-AIDS (वायरस); कंडोम कुछ हद तक मदद करता है। ✓ गर्भनिरोधन: अवरोध, हॉर्मोनी, युक्तियाँ, शल्य। ✓ प्रसवपूर्व लिंग निर्धारण क़ानूनन प्रतिबंधित है।",
      ),
      "log",
      { isHidden: true },
    );
    b.when(reasons.on(QuestionSignal.Correct), [theBoard.show(log), theBoard.pass()]);
    return column([
      w.title(t("Your turn", "अब तुम्हारी बारी")),
      lining,
      methods,
      reasons,
      log,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/* ------------------------------------------------------------------ */
/* Finale: back to the story                                           */
/* ------------------------------------------------------------------ */

/** Green Sunday: the plant sale, all stops recapped, and the pea seeds that lead to Ch9. */
const finale = page(
  "finale",
  (b) => {
    const w = wordsOn(b);
    const sale = b.prop(reproductionSceneDef, "sale", { scene: ReproductionScene.PlantSale });
    b.standsFor(
      sale,
      "the society's Green Sunday: a long table of potted plants under bunting, neighbours buying",
    );
    const seeds = b.prop(reproductionSceneDef, "seeds", { scene: ReproductionScene.SavingSeeds });
    b.standsFor(
      seeds,
      "Grandpa on the terrace putting dried pea seeds from his tallest plants into a jar; Kabir watches",
    );
    const tall = choiceQuestion(b, {
      name: "tall",
      prompt: t(
        'Grandpa saves seeds only from his tallest pea plants: "Tall parents, tall children." Each seed came from a flower, so how many parents does each seed have?',
        'दादाजी केवल अपने सबसे लंबे मटर के पौधों से बीज बचाते हैं: "लंबे जनक, लंबी संतान।" हर बीज एक फूल से आया है, तो हर बीज के कितने जनक हैं?',
      ),
      options: [
        {
          id: "right",
          label: t(
            "Two: the pollen's plant and the ovule's plant (sometimes the same plant)",
            "दो: पराग वाला पौधा और बीजांड वाला पौधा (कभी-कभी एक ही पौधा)",
          ),
        },
        {
          id: "one",
          label: t("One, like a cutting", "एक, कलम की तरह"),
          feedback: t(
            "A seed comes from fertilisation: a male germ cell from pollen and an egg in the ovule. So each seed has a mix from two germ cells, unlike a cutting.",
            "बीज निषेचन से आता है: पराग की नर जनन कोशिका और बीजांड का अंड। इसलिए हर बीज में दो जनन कोशिकाओं का मेल है, कलम से अलग।",
          ),
        },
      ],
      answer: "right",
      passes: false,
    });
    const done = w.definition(
      t(
        "**Mission complete.** Fifty pots, not one bought. (1) Reproduction copies DNA, with small variations. (2) Single cells: fission, budding; Hydra and Planaria regenerate. (3) Plants from parts: potatoes, Bryophyllum, money plant, grafting, tissue culture; moulds by spores. (4) Two parents mix DNA; germ cells carry half. (5) Flowers: pollination, fertilisation, seeds, fruits. (6) Humans: puberty, the reproductive systems, the placenta. (7) Menstruation and reproductive health. Next chapter: will Grandpa's tall parents really give tall children?",
        "**मिशन पूरा।** पचास गमले, एक भी ख़रीदा नहीं। (1) जनन DNA की नक़ल बनाता है, छोटी विभिन्नताओं के साथ। (2) एककोशिकीय: विखंडन, मुकुलन; हाइड्रा और प्लेनेरिया पुनर्जनन करते हैं। (3) भागों से पौधे: आलू, ब्रायोफ़िलम, मनी प्लांट, रोपण, ऊतक संवर्धन; फफूँद बीजाणुओं से। (4) दो जनक DNA मिलाते हैं; जनन कोशिकाओं में आधा। (5) फूल: परागण, निषेचन, बीज, फल। (6) मनुष्य: यौवनारंभ, जनन तंत्र, अपरा। (7) ऋतुस्राव और जनन स्वास्थ्य। अगला अध्याय: क्या दादाजी के लंबे जनक सचमुच लंबी संतान देंगे?",
      ),
      "done",
      { isHidden: true },
    );
    b.when(tall.on(QuestionSignal.Correct), [theBoard.show(done), theBoard.pass()]);
    return column([
      w.title(t("Green Sunday", "ग्रीन संडे")),
      sale,
      w.body(
        t(
          "Sunday morning. The society courtyard is lined with plants, and Grandpa's corner has exactly fifty pots: money plants, potato shoots, Bryophyllum babies, two grafted roses and rows of pea and chana seedlings. Everything is sold by noon.",
          "रविवार की सुबह। सोसाइटी का आँगन पौधों से भरा है, और दादाजी के कोने में ठीक पचास गमले हैं: मनी प्लांट, आलू के अंकुर, ब्रायोफ़िलम के नन्हे पौधे, दो रोपे हुए गुलाब और मटर और चने की कतारें। दोपहर तक सब बिक जाता है।",
        ),
      ),
      seeds,
      w.body(
        t(
          "That evening Grandpa sits on the terrace, picking dry pods from his tallest pea plants and dropping the seeds into a jar for next year.",
          "उस शाम दादाजी छत पर बैठकर अपने सबसे लंबे मटर के पौधों से सूखी फलियाँ तोड़ते हैं और अगले साल के लिए बीज एक जार में डालते हैं।",
        ),
      ),
      tall,
      done,
      space(),
    ]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order: hook, learn, practice, then the story's finale. */
export const overview = [hook, menstruation, ready, contraception, society, yourTurn, finale];

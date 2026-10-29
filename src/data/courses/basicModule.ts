import { CourseModule, CourseTopic, LocalizedText } from './types';

function loc(en: string, hi: string, mr: string): LocalizedText {
  return { en, hi, mr };
}

interface TopicSeed {
  id: string;
  unitId: string;
  number: number;
  title: LocalizedText;
  subtitle: LocalizedText;
  estimatedMinutes: number;
  xpReward: number;
  intro: LocalizedText;
  concepts: { heading: LocalizedText; body: LocalizedText }[];
  caseStudy: LocalizedText;
  formula?: { name: string; formula: string; explanation: string };
  visTitle: LocalizedText;
  visSteps: { title: LocalizedText; description: LocalizedText }[];
  gameType: 'SLIDER_SIMULATION' | 'DECISION_CHOICE' | 'ORDER_TICKET';
  gameTitle: LocalizedText;
  gameInst: LocalizedText;
  choices?: { text: LocalizedText; isOptimal: boolean; feedback: LocalizedText }[];
  questions: {
    id: string;
    q: LocalizedText;
    opts: { text: LocalizedText; isCorrect: boolean; exp: LocalizedText }[];
  }[];
}

export function buildTopic(
  moduleId: 'basic' | 'intermediate' | 'advanced',
  s: TopicSeed
): CourseTopic {
  const makeTheory = (lang: 'en' | 'hi' | 'mr') => ({
    introduction: s.intro[lang],
    coreConcepts: s.concepts.map((c) => ({
      heading: c.heading[lang],
      body: c.body[lang],
    })),
    realWorldExample: s.caseStudy[lang],
    ...(s.formula ? { formulas: [s.formula] } : {}),
  });

  return {
    id: s.id,
    moduleId,
    unitId: s.unitId,
    number: s.number,
    title: s.title,
    subtitle: s.subtitle,
    estimatedMinutes: s.estimatedMinutes,
    xpReward: s.xpReward,
    theory: {
      en: makeTheory('en'),
      hi: makeTheory('hi'),
      mr: makeTheory('mr'),
    },
    visualizer: {
      title: s.visTitle,
      steps: s.visSteps,
    },
    miniGame: {
      type: s.gameType,
      title: s.gameTitle,
      instructions: s.gameInst,
      data: s.choices ? { choices: s.choices } : undefined,
    },
    test: {
      passingScorePercent: 70,
      questions: s.questions.map((q) => ({
        id: q.id,
        question: q.q,
        options: q.opts.map((o) => ({
          text: o.text,
          isCorrect: o.isCorrect,
          explanation: o.exp,
        })),
      })),
    },
  };
}

const BASIC_TOPICS: TopicSeed[] = [
  {
    id: 'topic-1-1',
    unitId: 'b-u1',
    number: 1,
    title: loc('Inflation vs Investing', 'महंगाई बनाम निवेश', 'महागाई विरुद्ध गुंतवणूक'),
    subtitle: loc('Why idle cash loses purchasing power over time', 'खाली रखा पैसा समय के साथ क्रय शक्ति क्यों खोता है', 'निष्क्रिय रोख रक्कम काळानुसार क्रयशक्ती का गमावते'),
    estimatedMinutes: 5,
    xpReward: 100,
    intro: loc(
      'Inflation silently raises the cost of everyday goods by ~6% annually in India. Keeping all savings idle in a locker shrinks what your rupees can buy, whereas investing in productive businesses grows real wealth.',
      'भारत में महंगाई हर साल लगभग 6% की दर से बढ़ती है। तिजोरी में रखा नकद धीरे-धीरे अपनी क्रय शक्ति खो देता है, जबकि उत्पादक व्यवसायों में निवेश वास्तविक संपत्ति बढ़ाता है।',
      'भारतात महागाई दरवर्षी सुमारे ६% दराने वाढते. कपाटात ठेवलेली रोख रक्कम आपली खरेदी क्षमता गमावते, तर व्यवसायांमधील गुंतवणूक खरी संपत्ती वाढवते.'
    ),
    concepts: [
      {
        heading: loc('Real Rate of Return', 'वास्तविक रिटर्न दर', 'वास्तविक परतावा दर'),
        body: loc(
          'Your true wealth growth equals nominal return minus inflation. A 4% savings return during 6% inflation yields a -2% real loss.',
          'आपकी वास्तविक वृद्धि = नाममात्र रिटर्न घटाव महंगाई। 6% महंगाई में 4% ब्याज वास्तव में क्रय शक्ति घटाता है।',
          'तुमची खरी वाढ म्हणजे नाममात्र परतावा वजा महागाई. ६% महागाईत ४% व्याज म्हणजे प्रत्यक्षात नुकसान होय.'
        ),
      },
      {
        heading: loc('Productive Equity Assets', 'उत्पादक इक्विटी संपत्ति', 'उत्पादक समभाग मालमत्ता'),
        body: loc(
          'Leading NSE companies raise prices and expand earnings faster than inflation, compounding shareholder capital over decades.',
          'प्रमुख NSE कंपनियां महंगाई से तेज़ मुनाफ़ा बढ़ाती हैं और दीर्घकाल में निवेशकों की पूंजी को चक्रवृद्धि करती हैं।',
          'प्रमुख NSE कंपन्या महागाईपेक्षा वेगाने नफा वाढवतात आणि दीर्घकाळात भांडवल वाढवतात.'
        ),
      },
    ],
    caseStudy: loc(
      '₹1,00,000 invested in the NIFTY 50 index at ~12% CAGR grows to ~₹3,10,585 in 10 years, outpacing 6% inflation (~₹1,79,085).',
      'निफ्टी 50 में 12% CAGR पर लगाया गया ₹1,00,000 10 वर्षों में ~₹3,10,585 बनता है, जो 6% महंगाई से कहीं आगे है।',
      'निफ्टी ५० मध्ये १२% दराने गुंतवलेले ₹१,००,००० दहा वर्षांत ~₹३,१०,५८५ होतात आणि महागाईवर मात करतात.'
    ),
    formula: {
      name: 'Real Return Formula',
      formula: 'Real Return = ((1 + Nominal Rate) / (1 + Inflation Rate)) - 1',
      explanation: 'Adjusts investment gains for rising living costs.',
    },
    visTitle: loc('10-Year Purchasing Power Race', '10-वर्षीय क्रय शक्ति तुलना', '१० वर्षांची क्रयशक्ती स्पर्धा'),
    visSteps: [
      {
        title: loc('Year 1: ₹10,000 Starting Basket', 'वर्ष 1: ₹10,000 की शुरुआत', 'वर्ष १: ₹१०,००० सुरुवात'),
        description: loc('Both Saver and Investor start with ₹10,000.', 'बचतकर्ता और निवेशक दोनों ₹10,000 से शुरू करते हैं।', 'बचतकर्ता आणि गुंतवणूकदार दोघे ₹१०,००० ने सुरुवात करतात.'),
      },
      {
        title: loc('Year 5: Inflation Bites', 'वर्ष 5: महंगाई का असर', 'वर्ष ५: महागाईचा परिणाम'),
        description: loc('Goods costing ₹10,000 now cost ₹13,382; equity grows to ₹17,623.', '₹10,000 का सामान अब ₹13,382 का है; इक्विटी ₹17,623 पर पहुँचती है।', '₹१०,००० च्या वस्तू आता ₹१३,३८२ ला मिळतात; समभाग ₹१७,६२३ होतात.'),
      },
      {
        title: loc('Year 10: Compounding Gap', 'वर्ष 10: चक्रवृद्धि का अंतर', 'वर्ष १०: चक्रवाढीचा फरक'),
        description: loc('Equity reaches ₹31,058 while idle cash buys nearly half as much.', 'इक्विटी ₹31,058 तक पहुँचती है जबकि नकद आधी क्षमता खो देता है।', 'इक्विटी ₹३१,०५८ वर पोहोचते तर रोख रकमेची क्षमता निम्मी होते.'),
      },
    ],
    gameType: 'SLIDER_SIMULATION',
    gameTitle: loc('Wealth & Inflation Simulator', 'संपत्ति और महंगाई सिम्युलेटर', 'संपत्ती आणि महागाई सिम्युलेटर'),
    gameInst: loc('Adjust monthly SIP and annual return to see 10-year compounded wealth.', 'मासिक निवेश और वार्षिक रिटर्न सेट करके 10 साल का परिणाम देखें।', 'मासिक गुंतवणूक आणि परतावा दर निवडून १० वर्षांचा निकाल पहा.'),
    questions: [
      {
        id: 'q-1-1-a',
        q: loc('If inflation is 6% and your bank locker earns 0%, what happens to your purchasing power?', 'यदि महंगाई 6% है और लॉकर में 0% ब्याज मिलता है, तो क्रय शक्ति का क्या होता है?', 'जर महागाई ६% असेल आणि लॉकरमध्ये ०% व्याज मिळत असेल तर क्रयशक्तीचे काय होते?'),
        opts: [
          { text: loc('It decreases every year', 'यह हर साल घटती है', 'ती दरवर्षी कमी होते'), isCorrect: true, exp: loc('Rising prices erode idle cash.', 'बढ़ती कीमतें नकदी का मूल्य घटाती हैं।', 'वाढत्या किमतींमुळे रोख रकमेचे मूल्य कमी होते.') },
          { text: loc('It doubles in 5 years', '5 साल में दोगुनी होती है', '५ वर्षांत दुप्पट होते'), isCorrect: false, exp: loc('0% return cannot grow nominal rupees.', '0% रिटर्न से पैसा नहीं बढ़ता।', '०% परताव्याने पैसे वाढत नाहीत.') },
        ],
      },
      {
        id: 'q-1-1-b',
        q: loc('Which asset class has historically outpaced inflation best over 10+ years in India?', 'भारत में 10+ वर्षों में किस संपत्ति वर्ग ने महंगाई को सबसे बेहतर पछाड़ा है?', 'भारतात १०+ वर्षांत कोणत्या मालमत्तेने महागाईवर सर्वोत्तम मात केली आहे?'),
        opts: [
          { text: loc('Productive Equities (NIFTY / Sensex)', 'उत्पादक इक्विटी (निफ्टी / सेंसेक्स)', 'उत्पादक समभाग (निफ्टी / सेन्सेक्स)'), isCorrect: true, exp: loc('Corporate earnings compound faster than CPI inflation.', 'कंपनियों की आय महंगाई से तेज़ बढ़ती है।', 'कंपन्यांचे उत्पन्न महागाईपेक्षा वेगाने वाढते.') },
          { text: loc('Idle currency notes at home', 'घर में रखे नोट', 'घरात ठेवलेली रोख रक्कम'), isCorrect: false, exp: loc('Currency notes earn 0% yield.', 'नोटों पर कोई ब्याज नहीं मिलता।', 'रोख नोटांवर कोणताही परतावा मिळत नाही.') },
        ],
      },
    ],
  },
  {
    id: 'topic-1-2',
    unitId: 'b-u1',
    number: 2,
    title: loc('Power of Compounding & SIP', 'चक्रवृद्धि और SIP की शक्ति', 'चक्रवाढ आणि SIP ची ताकद'),
    subtitle: loc('How reinvesting returns creates exponential growth', 'रिटर्न का पुनर्निवेश घातीय वृद्धि कैसे बनाता है', 'परताव्याची पुनर्गुंतवणूक प्रचंड वाढ कशी करते'),
    estimatedMinutes: 5,
    xpReward: 100,
    intro: loc(
      'Compounding happens when your investment earnings start generating their own earnings. Starting early matters far more than timing every market dip.',
      'चक्रवृद्धि तब होती है जब आपके निवेश से मिली कमाई खुद नई कमाई पैदा करने लगती है। जल्दी शुरुआत करना सबसे महत्वपूर्ण है।',
      'जेव्हा तुमच्या गुंतवणुकीवरील नफा स्वतः नवीन नफा मिळवू लागतो तेव्हा चक्रवाढ होते. लवकर सुरुवात करणे अत्यंत महत्त्वाचे आहे.'
    ),
    concepts: [
      {
        heading: loc('Rule of 72', '72 का नियम', '७२ चा नियम'),
        body: loc('Divide 72 by your annual return percentage to estimate how many years it takes to double your money (at 12%, ~6 years).', 'पूंजी दोगुनी होने के वर्ष जानने के लिए 72 को वार्षिक रिटर्न प्रतिशत से भाग दें (12% पर लगभग 6 वर्ष)।', 'पैसे दुप्पट होण्यासाठी लागणारी वर्षे काढण्यासाठी ७२ ला वार्षिक परतावा दराने भागा (१२% दराने ~६ वर्षे).'),
      },
      {
        heading: loc('Rupee Cost Averaging via SIP', 'SIP से रुपया लागत औसत', 'SIP द्वारे रुपया खर्च सरासरी'),
        body: loc('Investing a fixed sum monthly buys more units when markets dip and fewer when high, smoothing volatility.', 'हर महीने निश्चित राशि निवेश करने से बाजार गिरने पर अधिक यूनिट मिलती हैं और उतार-चढ़ाव संतुलित रहता है।', 'दरमहा ठराविक रक्कम गुंतवल्याने बाजार घसरल्यावर जास्त युनिट्स मिळतात.'),
      },
    ],
    caseStudy: loc(
      'A ₹5,000 monthly SIP in an Indian index fund from age 20 to 40 builds a much larger corpus than ₹15,000 monthly started at age 32.',
      '20 वर्ष की उम्र से ₹5,000 मासिक SIP, 32 वर्ष की उम्र से शुरू किए गए ₹15,000 मासिक SIP से बड़ा फंड बना सकती है।',
      'वयाच्या २० व्या वर्षापासून ₹५,००० ची मासिक SIP उशिरा सुरू केलेल्या मोठ्या गुंतवणुकीपेक्षा जास्त निधी उभारते.'
    ),
    formula: {
      name: 'Rule of 72',
      formula: 'Years to Double ≈ 72 / Annual Return (%)',
      explanation: 'At 12% CAGR, capital doubles roughly every 6 years.',
    },
    visTitle: loc('Snowball Effect of Compounding', 'चक्रवृद्धि का स्नोबॉल प्रभाव', 'चक्रवाढीचा स्नोबॉल परिणाम'),
    visSteps: [
      { title: loc('Years 1–3: Base Building', 'वर्ष 1–3: आधार निर्माण', 'वर्ष १–३: पायाभरणी'), description: loc('Principal contributions dominate early corpus.', 'शुरुआत में आपकी मूल राशि मुख्य भूमिका निभाती है।', 'सुरुवातीला मूळ मुद्दल मुख्य असते.') },
      { title: loc('Years 4–7: Inflection Point', 'वर्ष 4–7: मोड़ बिंदु', 'वर्ष ४–७: कलाटणी बिंदू'), description: loc('Annual investment gains rival fresh deposits.', 'सालाना मुनाफा नई किस्तों के बराबर होने लगता है।', 'वार्षिक नफा नवीन ठेवींइतका होऊ लागतो.') },
      { title: loc('Years 8+: Exponential Curve', 'वर्ष 8+: तेज़ उछाल', 'वर्ष ८+: वेगवान वाढ'), description: loc('Compounded gains exceed total principal invested.', 'चक्रवृद्धि लाभ कुल जमा मूलधन से आगे निकल जाता है।', 'चक्रवाढ नफा एकूण मुद्दलापेक्षा जास्त होतो.') },
    ],
    gameType: 'SLIDER_SIMULATION',
    gameTitle: loc('SIP Snowball Calculator', 'SIP स्नोबॉल कैलकुलेटर', 'SIP स्नोबॉल कॅल्क्युलेटर'),
    gameInst: loc('Slide monthly SIP and annual rate to test the Rule of 72.', 'नियम 72 परखने के लिए मासिक SIP और दर बदलें।', '७२ चा नियम तपासण्यासाठी स्लाइडर बदला.'),
    questions: [
      {
        id: 'q-1-2-a',
        q: loc('Using the Rule of 72, how many years will ₹50,000 take to become ₹1,00,000 at 12% annual return?', '72 के नियम के अनुसार 12% वार्षिक रिटर्न पर ₹50,000 कितने वर्षों में ₹1,00,000 हो जाएगा?', '७२ च्या नियमानुसार १२% दराने ₹५०,००० चे ₹१,००,००० किती वर्षांत होतील?'),
        opts: [
          { text: loc('Approximately 6 years', 'लगभग 6 वर्ष', 'अंदाजे ६ वर्षे'), isCorrect: true, exp: loc('72 ÷ 12 = 6 years.', '72 ÷ 12 = 6 वर्ष।', '७२ ÷ १२ = ६ वर्षे.') },
          { text: loc('Approximately 18 years', 'लगभग 18 वर्ष', 'अंदाजे १८ वर्षे'), isCorrect: false, exp: loc('72 divided by 12 equals 6, not 18.', '72 को 12 से भाग देने पर 6 आता है।', '७२ भागिले १२ म्हणजे ६ येते.') },
        ],
      },
    ],
  },
  {
    id: 'topic-1-3',
    unitId: 'b-u1',
    number: 3,
    title: loc('What Is a Share & Equity Ownership?', 'शेयर और इक्विटी स्वामित्व क्या है?', 'शेअर आणि समभाग मालकी म्हणजे काय?'),
    subtitle: loc('Becoming a fractional business owner in Indian companies', 'भारतीय कंपनियों में आंशिक हिस्सेदार बनना', 'भारतीय कंपन्यांमध्ये आंशिक मालक होणे'),
    estimatedMinutes: 5,
    xpReward: 100,
    intro: loc(
      'A share is the smallest unit of ownership in a company. When you buy shares of TCS or ITC, you become a shareholder entitled to voting rights and a proportional claim on profits.',
      'शेयर किसी कंपनी के स्वामित्व की सबसे छोटी इकाई है। जब आप TCS या ITC के शेयर खरीदते हैं, तो आप कंपनी के हिस्सेदार बनते हैं।',
      'शेअर म्हणजे कंपनीच्या मालकीचा सर्वात लहान भाग. TCS किंवा ITC चे शेअर खरेदी केल्यास तुम्ही कंपनीचे भागीदार होता.'
    ),
    concepts: [
      {
        heading: loc('Capital Appreciation & Dividends', 'पूंजी वृद्धि और लाभांश', 'भांडवली वाढ आणि लाभांश'),
        body: loc('Shareholders earn in two ways: rising share price as business grows, and cash dividends paid out of profits.', 'शेयरधारक दो तरह से कमाते हैं: शेयर की कीमत बढ़ना और मुनाफे से मिलने वाला नकद लाभांश (Dividend)।', 'भागधारक दोन प्रकारे कमावतात: शेअरची किंमत वाढणे आणि नफ्यातून मिळणारा लाभांश.'),
      },
      {
        heading: loc('Limited Liability Protection', 'सीमित देयता सुरक्षा', 'मर्यादित जबाबदारी संरक्षण'),
        body: loc('Your maximum downside in an unleveraged share is limited to the amount you invested—never your personal assets.', 'बिना उधार के शेयर खरीदने पर आपका अधिकतम जोखिम केवल निवेशित राशि तक सीमित रहता है।', 'कर्जाशिवाय घेतलेल्या शेअरमध्ये तुमची जोखीम फक्त गुंतवलेल्या रकमेइतकीच असते.'),
      },
    ],
    caseStudy: loc(
      'Infosys went public in 1993; long-term shareholders benefited from decades of global software growth, bonus issues, and consistent dividends.',
      'इन्फोसिस 1993 में सूचीबद्ध हुई; दीर्घकालिक शेयरधारकों को बोनस शेयरों और लगातार लाभांश से भारी लाभ मिला।',
      'इन्फोसिस १९९३ मध्ये सूचिबद्ध झाली; दीर्घकालीन भागधारकांना बोनस शेअर्स आणि लाभांशाचा मोठा फायदा झाला.'
    ),
    visTitle: loc('Slicing Business Ownership', 'कंपनी हिस्सेदारी का विभाजन', 'व्यवसाय मालकीचे विभाजन'),
    visSteps: [
      { title: loc('Step 1: Company Needs Expansion Capital', 'चरण 1: विस्तार के लिए पूंजी', 'टप्पा १: विस्तारासाठी भांडवल'), description: loc('A company divides its equity into 10,00,000 equal shares.', 'कंपनी अपनी पूंजी को 10,00,000 बराबर शेयरों में बांटती है।', 'कंपनी आपले भांडवल १०,००,००० समान भागांत विभागते.') },
      { title: loc('Step 2: Investors Subscribe', 'चरण 2: निवेशकों की भागीदारी', 'टप्पा २: गुंतवणूकदारांचा सहभाग'), description: loc('Public investors buy shares and fund new factories & R&D.', 'निवेशक शेयर खरीदते हैं जिससे नए कारखाने और अनुसंधान शुरू होते हैं।', 'गुंतवणूकदार शेअर्स खरेदी करतात आणि व्यवसायाला गती मिळते.') },
      { title: loc('Step 3: Shared Prosperity', 'चरण 3: साझा मुनाफा', 'टप्पा ३: सामायिक नफा'), description: loc('Higher profits reward shareholders via dividends and valuation growth.', 'बढ़ता मुनाफा लाभांश और उच्च मूल्यांकन के रूप में लौटता है।', 'वाढता नफा लाभांश आणि शेअर दरवाढीच्या रूपात मिळतो.') },
    ],
    gameType: 'DECISION_CHOICE',
    gameTitle: loc('Shareholder Governance Vote', 'शेयरधारक मतदान निर्णय', 'भागधारक मतदान निर्णय'),
    gameInst: loc('Choose what owning 100 equity shares of an NSE company entitles you to.', 'चुनें कि NSE कंपनी के 100 इक्विटी शेयर रखने पर आपको क्या अधिकार मिलता है।', 'NSE कंपनीचे १०० समभाग असल्यास तुम्हाला कोणता अधिकार मिळतो ते निवडा.'),
    choices: [
      {
        text: loc('Fractional ownership, voting rights & proportional dividends', 'आंशिक स्वामित्व, मताधिकार और लाभांश का अधिकार', 'आंशिक मालकी, मतदानाचा हक्क आणि लाभांश'),
        isOptimal: true,
        feedback: loc('Correct! Equity represents real business ownership.', 'सही! इक्विटी का अर्थ कंपनी में वास्तविक हिस्सेदारी है।', 'बरोबर! समभाग म्हणजे व्यवसायातील खरी भागीदारी.'),
      },
      {
        text: loc('Guaranteed fixed 15% monthly interest from RBI', 'RBI से हर महीने 15% निश्चित ब्याज की गारंटी', 'RBI कडून दरमहा १५% निश्चित व्याजाची हमी'),
        isOptimal: false,
        feedback: loc('Equities do not pay fixed guaranteed interest; returns depend on business performance.', 'शेयरों पर निश्चित ब्याज की गारंटी नहीं होती।', 'शेअर्सवर निश्चित व्याजाची हमी नसते.'),
      },
    ],
    questions: [
      {
        id: 'q-1-3-a',
        q: loc('What does buying an equity share of Reliance Industries make you?', 'रिलायंस इंडस्ट्रीज का एक इक्विटी शेयर खरीदने से आप क्या बनते हैं?', 'रिलायन्स इंडस्ट्रीजचा समभाग घेतल्याने तुम्ही काय बनता?'),
        opts: [
          { text: loc('A fractional owner (shareholder) of the company', 'कंपनी का आंशिक मालिक (शेयरधारक)', 'कंपनीचे आंशिक मालक (भागधारक)'), isCorrect: true, exp: loc('Each share represents proportional equity ownership.', 'हर शेयर आंशिक स्वामित्व दर्शाता है।', 'प्रत्येक समभाग मालकी हक्क दर्शवतो.') },
          { text: loc('A bank lender collecting fixed EMI', 'निश्चित ब्याज लेने वाला बैंक ऋणदाता', 'निश्चित हप्ता घेणारा सावकार'), isCorrect: false, exp: loc('Bondholders lend money; shareholders own equity.', 'बॉन्डधारक ऋण देते हैं, शेयरधारक मालिक होते हैं।', 'रोखेधारक कर्ज देतात, भागधारक मालक असतात.') },
        ],
      },
    ],
  },
  {
    id: 'topic-1-4',
    unitId: 'b-u1',
    number: 4,
    title: loc('Asset Classes: Equity, Debt, Gold & Cash', 'संपत्ति वर्ग: इक्विटी, डेट, सोना और नकद', 'मालमत्ता प्रकार: समभाग, रोखे, सोने आणि रोख'),
    subtitle: loc('Comparing risk, liquidity, and return across Indian assets', 'विभिन्न भारतीय संपत्तियों के जोखिम और रिटर्न की तुलना', 'विविध मालमत्तांमधील जोखीम आणि परताव्याची तुलना'),
    estimatedMinutes: 5,
    xpReward: 100,
    intro: loc(
      'Every asset plays a distinct role: Equities drive long-term growth, Debt/Bonds provide stability, Gold hedges currency/crisis shocks, and Liquid Cash covers emergencies.',
      'हर संपत्ति की अलग भूमिका होती है: इक्विटी वृद्धि देती है, डेट स्थिरता देता है, सोना संकट से बचाता है और नकद आपातकाल में काम आता है।',
      'प्रत्येक मालमत्तेची वेगळी भूमिका असते: समभाग वाढ देतात, रोखे स्थिरता देतात, सोने संकटात संरक्षण देते आणि रोख रक्कम तातडीच्या गरजेसाठी असते.'
    ),
    concepts: [
      {
        heading: loc('Risk-Return Tradeoff', 'जोखिम-रिटर्न संतुलन', 'जोखीम-परतावा समतोल'),
        body: loc('Higher expected long-term return comes with higher short-term volatility. Never invest emergency funds in volatile equities.', 'उच्च दीर्घकालिक रिटर्न के साथ अल्पकालिक उतार-चढ़ाव आता है। आपातकालीन निधि को शेयरों में न लगाएं।', 'जास्त परताव्यासोबत अल्पकालीन चढ-उतार येतात. आपत्कालीन निधी शेअर्समध्ये गुंतवू नका.'),
      },
    ],
    caseStudy: loc(
      'During the March 2020 market drop, NIFTY fell ~35% briefly while Sovereign Gold and Government Gilts held firm, cushioning diversified Indian investors.',
      'मार्च 2020 की गिरावट में जब निफ्टी फिसला, तब सोने और सरकारी बॉन्ड्स ने संतुलित पोर्टफोलियो की रक्षा की।',
      'मार्च २०२० च्या घसरणीत सोने आणि सरकारी रोख्यांनी संतुलित पोर्टफोलिओचे रक्षण केले.'
    ),
    visTitle: loc('4 Pillars of Wealth Allocation', 'निवेश के 4 स्तंभ', 'गुंतवणुकीचे ४ स्तंभ'),
    visSteps: [
      { title: loc('Emergency Fund (Liquid Cash)', 'आपातकालीन निधि', 'आपत्कालीन निधी'), description: loc('6 months of expenses in liquid/FD accounts.', '6 महीने का खर्च सुरक्षित तरल खाते में।', '६ महिन्यांचा खर्च सुरक्षित खात्यात.') },
      { title: loc('Stability Anchor (Debt & Bonds)', 'स्थिरता कवच (बॉन्ड्स)', 'स्थिरता कवच (रोखे)'), description: loc('Predictable coupon income with low volatility.', 'कम उतार-चढ़ाव के साथ नियमित ब्याज आय।', 'कमी चढ-उतारासह नियमित उत्पन्न.') },
      { title: loc('Growth Engine (NSE/BSE Equities)', 'वृद्धि इंजन (इक्विटी)', 'वाढीचे इंजिन (समभाग)'), description: loc('Compounds wealth over 5–15+ year horizons.', '5–15+ वर्षों में संपत्ति को तेजी से बढ़ाता है।', '५–१५+ वर्षांत संपत्ती वेगाने वाढवते.') },
    ],
    gameType: 'DECISION_CHOICE',
    gameTitle: loc('Match Goal to Asset Class', 'लक्ष्य के अनुसार संपत्ति चुनें', 'उद्दिष्टानुसार मालमत्ता निवडा'),
    gameInst: loc('You need ₹50,000 for college tuition fees due in 2 months. Where should it sit?', 'आपको 2 महीने बाद कॉलेज फीस के लिए ₹50,000 चाहिए। इसे कहाँ रखना चाहिए?', 'तुम्हाला २ महिन्यांनी कॉलेज फीसाठी ₹५०,००० हवे आहेत. ते कुठे ठेवावेत?'),
    choices: [
      { text: loc('Liquid Fund / Short-Term Bank Deposit', 'लिक्विड फंड / बैंक जमा', 'लिक्विड फंड / बँक ठेव'), isOptimal: true, feedback: loc('Capital safety comes first for ultra-short-term goals!', 'अल्पकालिक लक्ष्यों के लिए पूंजी सुरक्षा सर्वोपरि है!', 'अल्पकालीन गरजेसाठी भांडवल सुरक्षितता महत्त्वाची!') },
      { text: loc('High-beta smallcap stocks', 'हाई-बीटा स्मॉलकैप शेयर', 'स्मॉलकॅप शेअर्स'), isOptimal: false, feedback: loc('Equities are too volatile for a 60-day deadline.', '2 महीने की अवधि के लिए शेयर अत्यंत जोखिमभरे हैं।', '२ महिन्यांच्या कालावधीसाठी शेअर्स खूप जोखमीचे असतात.') },
    ],
    questions: [
      {
        id: 'q-1-4-a',
        q: loc('Where should a 6-month emergency medical buffer be parked?', '6 महीने का आपातकालीन मेडिकल फंड कहाँ रखना चाहिए?', '६ महिन्यांचा आपत्कालीन वैद्यकीय निधी कुठे ठेवावा?'),
        opts: [
          { text: loc('Instant-access Liquid Fund / Sweep Savings', 'लिक्विड फंड / सेविंग्स स्वीप खाता', 'लिक्विड फंड / बचत खाते'), isCorrect: true, exp: loc('Emergency money requires instant liquidity and zero drawdown risk.', 'आपातकालीन धन तुरंत उपलब्ध और सुरक्षित होना चाहिए।', 'आपत्कालीन निधी त्वरित उपलब्ध आणि सुरक्षित असावा.') },
          { text: loc('Speculative weekly options', 'साप्ताहिक ऑप्शंस ट्रेडिंग', 'साप्ताहिक ऑप्शन्स ट्रेडिंग'), isCorrect: false, exp: loc('Options can lose 100% of premium rapidly.', 'ऑप्शंस में पूरी पूंजी डूब सकती है।', 'ऑप्शन्समध्ये संपूर्ण भांडवल बुडू शकते.') },
        ],
      },
    ],
  },
  {
    id: 'topic-1-5',
    unitId: 'b-u2',
    number: 5,
    title: loc('NSE, BSE & SEBI Ecosystem', 'NSE, BSE और SEBI की व्यवस्था', 'NSE, BSE आणि SEBI यंत्रणा'),
    subtitle: loc('How India’s stock exchanges and regulator protect investors', 'भारत के स्टॉक एक्सचेंज और नियामक निवेशकों की रक्षा कैसे करते हैं', 'भारतातील शेअर बाजार आणि नियामक गुंतवणूकदारांचे रक्षण कसे करतात'),
    estimatedMinutes: 5,
    xpReward: 110,
    intro: loc(
      'India’s equity market runs on two premier electronic exchanges—NSE (National Stock Exchange) and BSE (Bombay Stock Exchange)—regulated strictly by SEBI (Securities and Exchange Board of India).',
      'भारतीय शेयर बाजार दो प्रमुख इलेक्ट्रॉनिक एक्सचेंजों—NSE और BSE—पर चलता है, जिनकी निगरानी SEBI करता है।',
      'भारतीय शेअर बाजार NSE आणि BSE या दोन प्रमुख इलेक्ट्रॉनिक एक्सचेंजेसवर चालतो आणि SEBI त्यावर नियंत्रण ठेवते.'
    ),
    concepts: [
      {
        heading: loc('Role of SEBI', 'SEBI की भूमिका', 'SEBI ची भूमिका'),
        body: loc('SEBI enforces transparent disclosures, bans insider trading, regulates brokers, and mandates T+1 settlement.', 'SEBI पारदर्शिता सुनिश्चित करता है, इनसाइडर ट्रेडिंग रोकता है और निवेशकों के हितों की रक्षा करता है।', 'SEBI पारदर्शकता राखते, इनसाइडर ट्रेडिंग रोखते आणि गुंतवणूकदारांचे हित जपते.'),
      },
    ],
    caseStudy: loc(
      'India pioneered T+1 rolling settlement globally—shares bought on Monday are credited to your Demat account by Tuesday!',
      'भारत ने दुनिया में सबसे पहले T+1 निपटान प्रणाली लागू की—सोमवार को खरीदे गए शेयर मंगलवार को डीमैट खाते में आ जाते हैं!',
      'भारताने जगात सर्वप्रथम T+1 सेटलमेंट लागू केले—सोमवारी घेतलेले शेअर्स मंगळवारी डिमॅट खात्यात जमा होतात!'
    ),
    visTitle: loc('Indian Market Infrastructure', 'भारतीय बाजार संरचना', 'भारतीय बाजार रचना'),
    visSteps: [
      { title: loc('Investor & Broker', 'निवेशक और ब्रोकर', 'गुंतवणूकदार आणि ब्रोकर'), description: loc('Order placed via SEBI-registered broker terminal.', 'SEBI-पंजीकृत ब्रोकर ऐप के माध्यम से ऑर्डर दिया जाता है।', 'SEBI-नोंदणीकृत ब्रोकरद्वारे ऑर्डर दिली जाते.') },
      { title: loc('NSE / BSE Matching Engine', 'NSE / BSE मैचिंग इंजन', 'NSE / BSE मॅचिंग इंजिन'), description: loc('Electronic price-time priority matches buyers and sellers.', 'इलेक्ट्रॉनिक इंजन खरीदार और विक्रेता का मिलान करता है।', 'इलेक्ट्रॉनिक इंजिन खरेदीदार आणि विक्रेत्यांची सांगड घालते.') },
      { title: loc('CDSL / NSDL Depository (T+1)', 'CDSL / NSDL डिपॉजिटरी', 'CDSL / NSDL डिपॉझिटरी'), description: loc('Shares settle safely in your Demat account on T+1.', 'T+1 दिन शेयर सुरक्षित रूप से डीमैट खाते में जमा होते हैं।', 'T+1 दिवशी शेअर्स सुरक्षितपणे डिमॅट खात्यात जमा होतात.') },
    ],
    gameType: 'DECISION_CHOICE',
    gameTitle: loc('Regulator Check', 'नियामक पहचानें', 'नियामक ओळखा'),
    gameInst: loc('Which statutory body regulates stock exchanges and protects retail investors in India?', 'भारत में स्टॉक एक्सचेंजों का नियमन और खुदरा निवेशकों की सुरक्षा कौन करता है?', 'भारतात शेअर बाजारांचे नियंत्रण आणि गुंतवणूकदारांचे रक्षण कोण करते?'),
    choices: [
      { text: loc('SEBI (Securities and Exchange Board of India)', 'SEBI (भारतीय प्रतिभूति और विनिमय बोर्ड)', 'SEBI (भारतीय रोखे आणि विनिमय मंडळ)'), isOptimal: true, feedback: loc('Spot on! SEBI is the capital markets regulator.', 'बिल्कुल सही! SEBI पूंजी बाजार का नियामक है।', 'अगदी बरोबर! SEBI ही भांडवली बाजाराची नियामक संस्था आहे.') },
      { text: loc('Private Telegram tip groups', 'टेलीग्राम टिप ग्रुप', 'टेलिग्राम टिप ग्रुप्स'), isOptimal: false, feedback: loc('Unregistered tip groups are illegal and risky.', 'अपंजीकृत टिप ग्रुप अवैध और खतरनाक हैं।', 'अनोंदणीकृत टिप ग्रुप्स बेकायदेशीर आणि जोखमीचे आहेत.') },
    ],
    questions: [
      {
        id: 'q-1-5-a',
        q: loc('Who regulates the Indian stock market (NSE & BSE)?', 'भारतीय शेयर बाजार (NSE और BSE) का नियामक कौन है?', 'भारतीय शेअर बाजाराचे (NSE आणि BSE) नियंत्रण कोण करते?'),
        opts: [
          { text: loc('SEBI', 'SEBI', 'SEBI'), isCorrect: true, exp: loc('SEBI regulates securities markets in India.', 'SEBI भारत में प्रतिभूति बाजार का नियमन करता है।', 'SEBI भारतातील रोखे बाजाराचे नियमन करते.') },
          { text: loc('IRDAI', 'IRDAI', 'IRDAI'), isCorrect: false, exp: loc('IRDAI regulates insurance, not stock exchanges.', 'IRDAI बीमा क्षेत्र का नियामक है।', 'IRDAI विमा क्षेत्राचे नियमन करते.') },
        ],
      },
    ],
  },
  {
    id: 'topic-1-6',
    unitId: 'b-u2',
    number: 6,
    title: loc('Primary Market (IPO) vs Secondary Market', 'प्राइमरी मार्केट (IPO) बनाम सेकेंडरी मार्केट', 'प्रायमरी मार्केट (IPO) विरुद्ध सेकंडरी मार्केट'),
    subtitle: loc('How companies list via IPO and trade daily afterward', 'कंपनियां IPO कैसे लाती हैं और बाद में रोज़ ट्रेडिंग कैसे होती है', 'कंपन्या IPO द्वारे कशा सूचिबद्ध होतात आणि नंतर व्यवहार कसे चालतात'),
    estimatedMinutes: 5,
    xpReward: 110,
    intro: loc(
      'In the Primary Market (IPO), investors buy shares directly from the company raising capital. Once listed, shares trade among investors every weekday (9:15 AM – 3:30 PM IST) in the Secondary Market.',
      'प्राइमरी मार्केट (IPO) में निवेशक सीधे कंपनी से शेयर खरीदते हैं। लिस्टिंग के बाद सेकेंडरी मार्केट में निवेशक आपस में शेयर खरीदते-बेचते हैं।',
      'प्रायमरी मार्केटमध्ये (IPO) गुंतवणूकदार थेट कंपनीकडून शेअर्स घेतात. सूचिबद्ध झाल्यानंतर सेकंडरी मार्केटमध्ये गुंतवणूकदार आपापसांत व्यवहार करतात.'
    ),
    concepts: [
      {
        heading: loc('DRHP Prospectus Due Diligence', 'DRHP प्रॉस्पेक्टस जांच', 'DRHP माहितीपत्रक तपासणी'),
        body: loc('Before bidding in any IPO, read the Draft Red Herring Prospectus (DRHP) for business risks, profitability, and use of proceeds.', 'किसी भी IPO में पैसा लगाने से पहले DRHP में कंपनी के मुनाफे और कर्ज की जांच करें।', 'कोणत्याही IPO मध्ये अर्ज करण्यापूर्वी DRHP मधील नफा आणि जोखीम तपासा.'),
      },
    ],
    caseStudy: loc(
      'Not every hyped IPO makes money—disciplined investors evaluate valuation multiples (P/E) rather than grey-market rumors.',
      'हर चर्चित IPO मुनाफा नहीं देता—समझदार निवेशक अफवाहों के बजाय मूल्यांकन (P/E) देखते हैं।',
      'प्रत्येक गाजलेला IPO नफा देत नाही—जाणकार गुंतवणूकदार मूल्यांकन तपासतात.'
    ),
    visTitle: loc('IPO to Exchange Listing Lifecycle', 'IPO से लिस्टिंग तक का सफर', 'IPO ते एक्सचेंज लिस्टिंग प्रवास'),
    visSteps: [
      { title: loc('1. SEBI Filing (DRHP)', '1. SEBI के पास DRHP', '१. SEBI कडे DRHP'), description: loc('Company discloses audited financials and risk factors.', 'कंपनी अपने वित्तीय आंकड़े और जोखिम सार्वजनिक करती है।', 'कंपनी आर्थिक ताळेबंद आणि जोखीम जाहीर करते.') },
      { title: loc('2. IPO Subscription Window', '2. IPO बोली अवधि', '२. IPO अर्ज कालावधी'), description: loc('Retail & institutional investors bid within price band.', 'निवेशक प्राइस बैंड में आवेदन करते हैं।', 'गुंतवणूकदार प्राइस बँडमध्ये बोली लावतात.') },
      { title: loc('3. Secondary Trading on NSE/BSE', '3. NSE/BSE पर लाइव ट्रेडिंग', '३. NSE/BSE वर दैनंदिन व्यवहार'), description: loc('Listed shares trade freely 9:15 AM – 3:30 PM IST.', 'सुबह 9:15 से दोपहर 3:30 बजे तक लाइव खरीद-बिक्री।', 'सकाळी ९:१५ ते दुपारी ३:३० दरम्यान थेट खरेदी-विक्री.') },
    ],
    gameType: 'DECISION_CHOICE',
    gameTitle: loc('IPO Evaluation Test', 'IPO मूल्यांकन निर्णय', 'IPO मूल्यांकन निर्णय'),
    gameInst: loc('A loss-making company launches an IPO at 150x revenue with heavy social media hype. What do you do?', 'एक घाटे में चल रही कंपनी भारी सोशल मीडिया प्रचार के साथ महंगे दाम पर IPO लाती है। आप क्या करेंगे?', 'तोट्यात असलेली कंपनी सोशल मीडियाच्या गाजावाजासह महागडा IPO आणते. तुम्ही काय कराल?'),
    choices: [
      { text: loc('Read the DRHP financials & skip if valuation is unjustified', 'DRHP पढ़ें और मूल्यांकन महंगा होने पर छोड़ दें', 'DRHP तपासा आणि मूल्यांकन महाग असल्यास टाळा'), isOptimal: true, feedback: loc('Smart! Avoiding overpriced hype protects capital.', 'बढ़िया! महंगे प्रचार से बचना पूंजी बचाता है।', 'छान! महागड्या जाहिरातींपासून दूर राहणे भांडवल वाचवते.') },
      { text: loc('Borrow money to apply blindly on hype', 'उधार लेकर बिना पढ़े आवेदन करें', 'कर्ज काढून डोळे झाकून अर्ज करा'), isOptimal: false, feedback: loc('Never borrow to chase unverified IPO hype.', 'अफवाहों पर उधार लेकर निवेश कभी न करें।', 'अफवांवर विश्वास ठेवून कर्ज काढून गुंतवणूक करू नका.') },
    ],
    questions: [
      {
        id: 'q-1-6-a',
        q: loc('What are regular NSE equity trading hours (Monday–Friday)?', 'NSE इक्विटी बाजार का सामान्य ट्रेडिंग समय (सोमवार–शुक्रवार) क्या है?', 'NSE शेअर बाजाराची नियमित वेळ (सोमवार–शुक्रवार) काय आहे?'),
        opts: [
          { text: loc('9:15 AM to 3:30 PM IST', 'सुबह 9:15 से दोपहर 3:30 बजे IST', 'सकाळी ९:१५ ते दुपारी ३:३० IST'), isCorrect: true, exp: loc('Regular continuous trading runs 9:15 AM – 3:30 PM IST.', 'सामान्य सत्र 9:15 AM से 3:30 PM तक चलता है।', 'नियमित सत्र सकाळी ९:१५ ते दुपारी ३:३० चालते.') },
          { text: loc('24 hours including Sundays', 'रविवार सहित 24 घंटे', 'रविवारसह २४ तास'), isCorrect: false, exp: loc('Indian equity exchanges close on weekends and after 3:30 PM.', 'सप्ताहांत पर शेयर बाजार बंद रहता है।', 'शनिवार-रविवारी शेअर बाजार बंद असतो.') },
        ],
      },
    ],
  },
  {
    id: 'topic-1-7',
    unitId: 'b-u2',
    number: 7,
    title: loc('Demat, Trading & Bank Account Trio', 'डीमैट, ट्रेडिंग और बैंक खातों की तिकड़ी', 'डिमॅट, ट्रेडिंग आणि बँक खात्यांची त्रिसूत्री'),
    subtitle: loc('How CDSL, NSDL, and brokers store and transfer shares safely', 'CDSL, NSDL और ब्रोकर शेयरों को सुरक्षित कैसे रखते हैं', 'CDSL, NSDL आणि ब्रोकर शेअर्स कसे सुरक्षित ठेवतात'),
    estimatedMinutes: 5,
    xpReward: 110,
    intro: loc(
      'Physical paper certificates were replaced by electronic Dematerialized (Demat) accounts held with NSDL or CDSL. Your Bank holds rupees, your Trading account executes orders, and your Demat vault holds shares.',
      'कागजी शेयर प्रमाणपत्रों की जगह अब इलेक्ट्रॉनिक डीमैट खाते (NSDL/CDSL) हैं। बैंक में पैसा रहता है, ट्रेडिंग खाते से ऑर्डर लगता है और डीमैट में शेयर सुरक्षित रहते हैं।',
      'कागदी प्रमाणपत्रांऐवजी आता इलेक्ट्रॉनिक डिमॅट खाती (NSDL/CDSL) वापरली जातात. बँकेत पैसे, ट्रेडिंग खात्यातून व्यवहार आणि डिमॅटमध्ये शेअर्स सुरक्षित राहतात.'
    ),
    concepts: [
      {
        heading: loc('Depository Safety (CDSL & NSDL)', 'डिपॉजिटरी सुरक्षा (CDSL व NSDL)', 'डिपॉझिटरी सुरक्षा (CDSL आणि NSDL)'),
        body: loc('Even if a stockbroker shuts down, your long-term shares remain safe inside central depositories CDSL or NSDL.', 'यदि कोई ब्रोकर बंद भी हो जाए, तो भी आपके शेयर केंद्रीय डिपॉजिटरी CDSL या NSDL में सुरक्षित रहते हैं।', 'ब्रोकर बंद पडला तरी तुमचे शेअर्स CDSL किंवा NSDL मध्ये पूर्णपणे सुरक्षित असतात.'),
      },
    ],
    caseStudy: loc(
      'SEBI’s ASBA and UPI block mechanisms keep investor funds in their own bank accounts until shares are allotted.',
      'SEBI की UPI ब्लॉक सुविधा निवेशकों का पैसा उनके अपने बैंक खाते में सुरक्षित रखती है।',
      'SEBI च्या UPI ब्लॉक सुविधेमुळे गुंतवणूकदारांचे पैसे त्यांच्याच बँक खात्यात सुरक्षित राहतात.'
    ),
    visTitle: loc('3-in-1 Account Flow', '3-इन-1 खाता प्रवाह', '३-इन-१ खाते प्रवाह'),
    visSteps: [
      { title: loc('Bank Account (₹ Rupees)', 'बैंक खाता (₹ रुपये)', 'बँक खाते (₹ रुपये)'), description: loc('Transfers funds via UPI / Netbanking.', 'UPI या नेटबैंकिंग से फंड ट्रांसफर करता है।', 'UPI द्वारे निधी पाठवते.') },
      { title: loc('Trading Account (Broker)', 'ट्रेडिंग खाता (ब्रोकर)', 'ट्रेडिंग खाते (ब्रोकर)'), description: loc('Routes BUY/SELL orders to NSE/BSE.', 'NSE/BSE पर खरीद/बिक्री ऑर्डर भेजता है।', 'NSE/BSE वर खरेदी/विक्री ऑर्डर पाठवते.') },
      { title: loc('Demat Account (CDSL/NSDL)', 'डीमैट खाता (CDSL/NSDL)', 'डिमॅट खाते (CDSL/NSDL)'), description: loc('Stores electronic shares under your PAN.', 'आपके PAN के तहत डिजिटल शेयर रखता है।', 'तुमच्या PAN अंतर्गत डिजिटल शेअर्स साठवते.') },
    ],
    gameType: 'ORDER_TICKET',
    gameTitle: loc('Practice Ticket & Cost Preview', 'ट्रेड टिकट अभ्यास', 'ट्रेड तिकीट सराव'),
    gameInst: loc('Enter share quantity and execute a simulated trade ticket.', 'शेयर मात्रा दर्ज करें और अभ्यास ट्रेड निष्पादित करें।', 'शेअर संख्या टाका आणि सराव ट्रेड पूर्ण करा.'),
    questions: [
      {
        id: 'q-1-7-a',
        q: loc('Where are your electronic shares actually stored in India?', 'भारत में आपके डिजिटल शेयर वास्तव में कहाँ सुरक्षित रहते हैं?', 'भारतात तुमचे डिजिटल शेअर्स प्रत्यक्षात कुठे साठवले जातात?'),
        opts: [
          { text: loc('In a Demat account with CDSL or NSDL', 'CDSL या NSDL के डीमैट खाते में', 'CDSL किंवा NSDL मधील डिमॅट खात्यात'), isCorrect: true, exp: loc('Depositories NSDL and CDSL hold dematerialized securities.', 'NSDL और CDSL इलेक्ट्रॉनिक प्रतिभूतियां रखते हैं।', 'NSDL आणि CDSL डिजिटल शेअर्स सांभाळतात.') },
          { text: loc('Inside a WhatsApp chat backup', 'व्हाट्सएप चैट बैकअप में', 'व्हॉट्सॲप बॅकअपमध्ये'), isCorrect: false, exp: loc('Shares are regulated depository records.', 'शेयर आधिकारिक डिपॉजिटरी में दर्ज होते हैं।', 'शेअर्स अधिकृत डिपॉझिटरीमध्ये असतात.') },
        ],
      },
    ],
  },
  {
    id: 'topic-1-8',
    unitId: 'b-u2',
    number: 8,
    title: loc('Market Indices: NIFTY 50 & SENSEX', 'बाजार सूचकांक: निफ्टी 50 और सेंसेक्स', 'बाजार निर्देशांक: निफ्टी ५० आणि सेन्सेक्स'),
    subtitle: loc('How benchmark indices measure India’s economic pulse', 'बेंचमार्क इंडेक्स भारतीय अर्थव्यवस्था की नब्ज कैसे मापते हैं', 'बेंचमार्क निर्देशांक भारतीय अर्थव्यवस्थेची नाडी कशी मोजतात'),
    estimatedMinutes: 5,
    xpReward: 110,
    intro: loc(
      'NIFTY 50 tracks the top 50 large, liquid Indian companies across 13+ sectors on NSE, while SENSEX tracks 30 blue-chip leaders on BSE using free-float market capitalization.',
      'निफ्टी 50 NSE की शीर्ष 50 बड़ी कंपनियों का प्रतिनिधित्व करता है, जबकि सेंसेक्स BSE की 30 प्रमुख कंपनियों को ट्रैक करता है।',
      'निफ्टी ५० हा NSE वरील टॉप ५० कंपन्यांचा निर्देशांक आहे, तर सेन्सेक्स BSE वरील ३० आघाडीच्या कंपन्यांचे प्रतिनिधित्व करतो.'
    ),
    concepts: [
      {
        heading: loc('Free-Float Market Cap Weighting', 'फ्री-फ्लोट मार्केट कैप भारांक', 'फ्री-फ्लोट मार्केट कॅप वेटिंग'),
        body: loc('Indices weight companies by publicly tradable shares (excluding locked-in promoter holdings).', 'सूचकांक में वजन केवल आम जनता के पास उपलब्ध शेयरों (Free-Float) के आधार पर तय होता है।', 'निर्देशांकात फक्त सार्वजनिकरीत्या व्यवहार होणाऱ्या शेअर्सचे (Free-Float) वजन मोजले जाते.'),
      },
    ],
    caseStudy: loc(
      'Weak companies that lose market share get replaced in NIFTY 50 semi-annually by rising sector leaders—creating a self-cleansing index.',
      'कमजोर पड़ने वाली कंपनियां निफ्टी 50 से बाहर हो जाती हैं और नई मजबूत कंपनियां शामिल होती रहती हैं।',
      'कमकुवत कंपन्या निफ्टी ५० मधून बाहेर पडतात आणि नवीन सक्षम कंपन्या त्यांत सामील होतात.'
    ),
    visTitle: loc('Inside NIFTY 50 Sector Weights', 'निफ्टी 50 का सेक्टर संतुलन', 'निफ्टी ५० मधील क्षेत्रनिहाय रचना'),
    visSteps: [
      { title: loc('Financial Services (~33%)', 'वित्तीय सेवाएं (~33%)', 'वित्तीय सेवा (~३३%)'), description: loc('HDFC Bank, ICICI Bank, SBI, Bajaj Finance.', 'प्रमुख बैंक और वित्तीय संस्थान।', 'प्रमुख बँका आणि वित्तीय संस्था.') },
      { title: loc('IT & Energy (~25%)', 'आईटी और ऊर्जा (~25%)', 'आयटी आणि ऊर्जा (~२५%)'), description: loc('TCS, Infosys, Reliance Industries, ONGC.', 'सॉफ्टवेयर निर्यातक और ऊर्जा दिग्गज।', 'सॉफ्टवेअर आणि ऊर्जा क्षेत्रातील कंपन्या.') },
      { title: loc('Auto, FMCG & Pharma', 'ऑटो, FMCG और फार्मा', 'ऑटो, FMCG आणि फार्मा'), description: loc('ITC, HUL, Tata Motors, Sun Pharma.', 'उपभोक्ता, वाहन और स्वास्थ्य कंपनियां।', 'ग्राहकोपयोगी वस्तू, वाहन आणि औषध कंपन्या.') },
    ],
    gameType: 'SLIDER_SIMULATION',
    gameTitle: loc('Index Fund Compounder', 'इंडेक्स फंड ग्रोथ सिम्युलेटर', 'इंडेक्स फंड वाढ सिम्युलेटर'),
    gameInst: loc('Simulate passive NIFTY 50 index investing over time.', 'निफ्टी 50 इंडेक्स निवेश की वृद्धि की गणना करें।', 'निफ्टी ५० निर्देशांक गुंतवणुकीची वाढ पहा.'),
    questions: [
      {
        id: 'q-1-8-a',
        q: loc('How many flagship companies make up the NSE NIFTY 50 index?', 'NSE निफ्टी 50 सूचकांक में कितनी प्रमुख कंपनियां शामिल हैं?', 'NSE निफ्टी ५० निर्देशांकात किती प्रमुख कंपन्या आहेत?'),
        opts: [
          { text: loc('50 companies across major Indian sectors', 'प्रमुख भारतीय क्षेत्रों की 50 कंपनियां', 'विविध क्षेत्रांतील ५० कंपन्या'), isCorrect: true, exp: loc('NIFTY 50 comprises 50 top NSE stocks.', 'निफ्टी 50 में 50 प्रमुख कंपनियां होती हैं।', 'निफ्टी ५० मध्ये ५० आघाडीच्या कंपन्या असतात.') },
          { text: loc('5,000 penny stocks', '5,000 पेनी स्टॉक्स', '५,००० पेनी स्टॉक्स'), isCorrect: false, exp: loc('Only the top 50 liquid large-caps are included.', 'केवल शीर्ष 50 बड़ी कंपनियां शामिल होती हैं।', 'फक्त टॉप ५० मोठ्या कंपन्या समाविष्ट असतात.') },
        ],
      },
    ],
  },
  {
    id: 'topic-1-9',
    unitId: 'b-u3',
    number: 9,
    title: loc('Bid, Ask, Spread & Market Liquidity', 'बिड, आस्क, स्प्रेड और लिक्विडिटी', 'बिड, आस्क, स्प्रेड आणि तरलता'),
    subtitle: loc('Reading the live NSE Level-2 order book like a pro', 'लाइव NSE ऑर्डर बुक को समझना', 'लाइव्ह NSE ऑर्डर बुक समजून घेणे'),
    estimatedMinutes: 6,
    xpReward: 120,
    intro: loc(
      'The Bid is the highest price a buyer offers; the Ask (Offer) is the lowest price a seller accepts. The gap between them is the Bid-Ask Spread—tight in liquid stocks like Reliance, wide in illiquid penny stocks.',
      'बिड वह उच्चतम कीमत है जो खरीदार देना चाहता है; आस्क वह न्यूनतम कीमत है जो विक्रेता मांगता है। दोनों का अंतर स्प्रेड कहलाता है।',
      'बिड म्हणजे खरेदीदाराची कमाल किंमत आणि आस्क म्हणजे विक्रेत्याची किमान किंमत. यांतील फरकाला स्प्रेड म्हणतात.'
    ),
    concepts: [
      {
        heading: loc('Slippage Hazard in Illiquid Stocks', 'कम लिक्विड शेयरों में स्लिपेज जोखिम', 'कमी तरल शेअर्समधील स्लिपेज जोखीम'),
        body: loc('Large market orders in low-volume stocks sweep multiple ask levels, inflating your actual buy price.', 'कम वॉल्यूम वाले शेयरों में मार्केट ऑर्डर डालने से कीमत अचानक उछलकर महंगी खरीद होती है।', 'कमी व्यवहारांच्या शेअर्समध्ये मार्केट ऑर्डर दिल्यास जास्त किंमत मोजावी लागते.'),
      },
    ],
    caseStudy: loc(
      'NIFTY 50 heavyweights trade with ₹0.05–₹0.10 spreads, whereas thinly traded micro-caps can have 2% instant spread cost.',
      'निफ्टी 50 के शेयरों में स्प्रेड मात्र ₹0.05–₹0.10 होता है, जबकि छोटे शेयरों में 2% तक नुकसान हो सकता है।',
      'निफ्टी ५० मधील शेअर्समध्ये स्प्रेड फक्त ₹०.०५–₹०.१० असतो, तर छोट्या शेअर्समध्ये २% पर्यंत असतो.'
    ),
    formula: {
      name: 'Bid-Ask Spread',
      formula: 'Spread = Lowest Ask Price − Highest Bid Price',
      explanation: 'Tighter spreads indicate deep market liquidity.',
    },
    visTitle: loc('Order Book Matching Mechanics', 'ऑर्डर बुक मिलान प्रक्रिया', 'ऑर्डर बुक जुळणी प्रक्रिया'),
    visSteps: [
      { title: loc('Best Bid: ₹1,500.00', 'बेस्ट बिड: ₹1,500.00', 'बेस्ट बिड: ₹१,५००.००'), description: loc('Highest waiting limit buyer on the book.', 'ऑर्डर बुक में सबसे ऊँचा खरीदार।', 'ऑर्डर बुकवरील सर्वोच्च खरेदीदार.') },
      { title: loc('Best Ask: ₹1,500.20', 'बेस्ट आस्क: ₹1,500.20', 'बेस्ट आस्क: ₹१,५००.२०'), description: loc('Lowest waiting limit seller; spread is ₹0.20.', 'सबसे सस्ता विक्रेता; स्प्रेड ₹0.20 है।', 'सर्वात स्वस्त विक्रेता; स्प्रेड ₹०.२० आहे.') },
      { title: loc('Trade Prints!', 'सौदा निष्पादित!', 'व्यवहार पूर्ण!'), description: loc('When a buyer crosses ₹1,500.20, a trade executes.', 'जब खरीदार ₹1,500.20 स्वीकार करता है, सौदा पूरा होता है।', 'खरेदीदाराने ₹१,५००.२० मान्य करताच व्यवहार होतो.') },
    ],
    gameType: 'ORDER_TICKET',
    gameTitle: loc('Execute Clean Order', 'ऑर्डर बुक अभ्यास', 'ऑर्डर बुक सराव'),
    gameInst: loc('Simulate placing an order without suffering spread slippage.', 'बिना स्लिपेज के ऑर्डर निष्पादित करने का अभ्यास करें।', 'स्लिपेज टाळून ऑर्डर देण्याचा सराव करा.'),
    questions: [
      {
        id: 'q-1-9-a',
        q: loc('If TCS has a Best Bid of ₹4,180.00 and Best Ask of ₹4,180.50, what is the Bid-Ask Spread?', 'यदि TCS का बेस्ट बिड ₹4,180.00 और बेस्ट आस्क ₹4,180.50 है, तो स्प्रेड कितना है?', 'जर TCS चा बेस्ट बिड ₹४,१८०.०० आणि बेस्ट आस्क ₹४,१८०.५० असेल तर स्प्रेड किती आहे?'),
        opts: [
          { text: loc('₹0.50', '₹0.50', '₹०.५०'), isCorrect: true, exp: loc('4180.50 − 4180.00 = ₹0.50.', '4180.50 − 4180.00 = ₹0.50।', '४१८०.५० − ४१८०.०० = ₹०.५०.') },
          { text: loc('₹4,180.00', '₹4,180.00', '₹४,१८०.००'), isCorrect: false, exp: loc('Spread is the difference between Ask and Bid.', 'स्प्रेड आस्क और बिड का अंतर होता है।', 'स्प्रेड म्हणजे आस्क आणि बिडमधील फरक.') },
        ],
      },
    ],
  },
  {
    id: 'topic-1-10',
    unitId: 'b-u3',
    number: 10,
    title: loc('Order Types: Market, Limit & Stop-Loss', 'ऑर्डर के प्रकार: मार्केट, लिमिट और स्टॉप-लॉस', 'ऑर्डरचे प्रकार: मार्केट, लिमिट आणि स्टॉप-लॉस'),
    subtitle: loc('Controlling entry price and automating downside protection', 'खरीद मूल्य नियंत्रित करना और नुकसान को सीमित करना', 'खरेदी किंमत नियंत्रित करणे आणि तोटा मर्यादित ठेवणे'),
    estimatedMinutes: 6,
    xpReward: 120,
    intro: loc(
      'Market orders guarantee speed but not exact price. Limit orders guarantee your price or better. Stop-Loss orders automatically exit a losing position if price hits your invalidation trigger.',
      'मार्केट ऑर्डर तुरंत ट्रेड करता है पर कीमत तय नहीं होती। लिमिट ऑर्डर आपकी तय कीमत या बेहतर देता है। स्टॉप-लॉस ऑर्डर नुकसान बढ़ने से पहले सौदा काट देता है।',
      'मार्केट ऑर्डर तात्काळ व्यवहार करते. लिमिट ऑर्डर तुमची ठरलेली किंमत देते. स्टॉप-लॉस ऑर्डर मोठा तोटा होण्याआधी बाहेर पडण्यास मदत करते.'
    ),
    concepts: [
      {
        heading: loc('Why Stop-Loss Is Non-Negotiable', 'स्टॉप-लॉस क्यों अनिवार्य है', 'स्टॉप-लॉस का आवश्यक आहे'),
        body: loc('A 10% loss needs an 11% gain to recover, whereas a 50% loss needs a 100% gain just to break even!', '10% नुकसान की भरपाई के लिए 11% लाभ चाहिए, पर 50% नुकसान के बाद बराबर आने के लिए 100% लाभ चाहिए!', '१०% तोटा भरून काढायला ११% नफा लागतो, पण ५०% तोटा भरून काढायला १००% नफा लागतो!'),
      },
    ],
    caseStudy: loc(
      'Disciplined traders on NSE always enter a Limit entry alongside a Stop-Loss order before checking potential profits.',
      'अनुशासित ट्रेडर मुनाफा गिनने से पहले हमेशा अपना स्टॉप-लॉस तय करते हैं।',
      'शिस्तबद्ध ट्रेडर नफा मोजण्यापूर्वी नेहमी स्टॉप-लॉस लावतात.'
    ),
    visTitle: loc('3 Essential Order Tools', '3 प्रमुख ऑर्डर प्रकार', '३ महत्त्वाचे ऑर्डर प्रकार'),
    visSteps: [
      { title: loc('Market Order: Instant Fill', 'मार्केट ऑर्डर: तुरंत खरीद', 'मार्केट ऑर्डर: तात्काळ व्यवहार'), description: loc('Matches immediately against best available ask/bid.', 'उपलब्ध सर्वोत्तम भाव पर तुरंत निष्पादित।', 'उपलब्ध भावावर लगेच पूर्ण होते.') },
      { title: loc('Limit Order: Price Control', 'लिमिट ऑर्डर: भाव नियंत्रण', 'लिमिट ऑर्डर: किंमत नियंत्रण'), description: loc('Waits in queue until your target price is met.', 'आपकी तय कीमत आने तक प्रतीक्षा करता है।', 'तुमची ठरलेली किंमत येईपर्यंत थांबते.') },
      { title: loc('Stop-Loss: Capital Shield', 'स्टॉप-लॉस: पूंजी सुरक्षा कवच', 'स्टॉप-लॉस: भांडवल सुरक्षा कवच'), description: loc('Triggers automatic exit if support breaks.', 'सपोर्ट टूटने पर स्वतः बाहर निकालता है।', 'सपोर्ट तुटल्यास आपोआप बाहेर काढते.') },
    ],
    gameType: 'ORDER_TICKET',
    gameTitle: loc('Order Execution Sandbox', 'ऑर्डर निष्पादन अभ्यास', 'ऑर्डर सराव'),
    gameInst: loc('Place a simulated trade ticket and review brokerage + STT costs.', 'सौदा लगाएं और ब्रोकरेज व STT शुल्क देखें।', 'ऑर्डर द्या आणि ब्रोकरेज व STT खर्च पहा.'),
    questions: [
      {
        id: 'q-1-10-a',
        q: loc('Which order automatically exits a trade if the stock falls below your risk threshold?', 'शेयर आपके जोखिम स्तर से नीचे गिरने पर कौन सा ऑर्डर स्वतः सौदा काट देता है?', 'शेअर ठराविक पातळीखाली घसरल्यास कोणती ऑर्डर आपोआप बाहेर काढते?'),
        opts: [
          { text: loc('Stop-Loss Order', 'स्टॉप-लॉस ऑर्डर', 'स्टॉप-लॉस ऑर्डर'), isCorrect: true, exp: loc('Stop-loss caps downside losses automatically.', 'स्टॉप-लॉस अधिकतम नुकसान को सीमित करता है।', 'स्टॉप-लॉस तोटा मर्यादित ठेवतो.') },
          { text: loc('Bonus Issue Request', 'बोनस शेयर अनुरोध', 'बोनस शेअर विनंती'), isCorrect: false, exp: loc('Bonus shares are corporate actions, not risk orders.', 'बोनस शेयर कॉर्पोरेट एक्शन है।', 'बोनस शेअर ही कंपनीची कृती आहे.') },
        ],
      },
    ],
  },
  {
    id: 'topic-1-11',
    unitId: 'b-u3',
    number: 11,
    title: loc('Corporate Actions: Dividends, Splits & Bonus', 'कॉर्पोरेट एक्शन: डिविडेंड, स्प्लिट और बोनस', 'कॉर्पोरेट कृती: लाभांश, स्प्लिट आणि बोनस'),
    subtitle: loc('Why share price adjusts on ex-dates without hurting shareholder value', 'एक्स-डेट पर शेयर का भाव क्यों समायोजित होता है', 'एक्स-डेटला शेअरची किंमत का समायोजित होते'),
    estimatedMinutes: 5,
    xpReward: 120,
    intro: loc(
      'In a 1:1 Bonus or 2-for-1 Stock Split, your share count doubles while the price per share halves—keeping your total investment value unchanged while improving liquidity.',
      '1:1 बोनस या स्टॉक स्प्लिट में आपके शेयरों की संख्या दोगुनी हो जाती है और प्रति शेयर कीमत आधी—आपका कुल निवेश मूल्य समान रहता है।',
      '१:१ बोनस किंवा स्टॉक स्प्लिटमध्ये शेअर्सची संख्या दुप्पट होते आणि किंमत निम्मी होते—एकूण मूल्य तेवढेच राहते.'
    ),
    concepts: [
      {
        heading: loc('Record Date & Ex-Date', 'रिकॉर्ड डेट और एक्स-डेट', 'रेकॉर्ड डेट आणि एक्स-डेट'),
        body: loc('To qualify for a dividend or bonus, you must buy the stock BEFORE the Ex-Date.', 'लाभांश या बोनस पाने के लिए आपको एक्स-डेट से पहले शेयर खरीदना अनिवार्य है।', 'लाभांश किंवा बोनस मिळवण्यासाठी एक्स-डेटपूर्वी शेअर खरेदी करणे आवश्यक असते.'),
      },
    ],
    caseStudy: loc(
      'Bajaj Finance and Infosys have executed multiple stock splits and bonuses over decades so retail students and savers can afford individual shares.',
      'बजाज फाइनेंस और इन्फोसिस ने कई बार स्प्लिट व बोनस दिए ताकि छोटे निवेशक भी आसानी से शेयर खरीद सकें।',
      'बजाज फायनान्स आणि इन्फोसिसने अनेकदा बोनस व स्प्लिट दिल्यामुळे सामान्य गुंतवणूकदारांना शेअर्स घेणे सोपे झाले.'
    ),
    visTitle: loc('2-for-1 Stock Split Math', '2-फॉर-1 स्टॉक स्प्लिट गणित', '२-फॉर-१ स्टॉक स्प्लिट गणित'),
    visSteps: [
      { title: loc('Before Split: 10 Shares @ ₹2,000', 'स्प्लिट से पहले: 10 शेयर @ ₹2,000', 'स्प्लिटपूर्वी: १० शेअर्स @ ₹२,०००'), description: loc('Total portfolio value = ₹20,000.', 'कुल पोर्टफोलियो मूल्य = ₹20,000।', 'एकूण मूल्य = ₹२०,०००.') },
      { title: loc('After Split: 20 Shares @ ₹1,000', 'स्प्लिट के बाद: 20 शेयर @ ₹1,000', 'स्प्लिटनंतर: २० शेअर्स @ ₹१,०००'), description: loc('Total value is still ₹20,000—like cutting a pizza into more slices!', 'कुल मूल्य अभी भी ₹20,000 है—जैसे पिज्जा के अधिक टुकड़े करना!', 'एकूण मूल्य अजूनही ₹२०,००० राहते!') },
    ],
    gameType: 'DECISION_CHOICE',
    gameTitle: loc('Stock Split Quiz Decision', 'स्टॉक स्प्लिट पहेली', 'स्टॉक स्प्लिट निर्णय'),
    gameInst: loc('A ₹1,000 stock announces a 1:1 bonus issue and now trades at ₹500 on Ex-Date. Did it crash 50%?', '₹1,000 का शेयर 1:1 बोनस के बाद एक्स-डेट पर ₹500 पर दिखता है। क्या कंपनी 50% डूब गई?', '₹१,००० चा शेअर १:१ बोनसनंतर एक्स-डेटला ₹५०० दिसतो. कंपनी ५०% कोसळली का?'),
    choices: [
      { text: loc('No — share count doubled, so total net worth is unchanged', 'नहीं — शेयर दोगुने हो गए हैं, कुल संपत्ति समान है', 'नाही — शेअर्स दुप्पट झाल्यामुळे एकूण मूल्य समान आहे'), isOptimal: true, feedback: loc('Exactly! Never confuse a bonus/split price adjustment with a crash.', 'सही! बोनस/स्प्लिट समायोजन को क्रैश न समझें।', 'अगदी बरोबर! बोनस/स्प्लिट समायोजनाला घसरण समजू नका.') },
      { text: loc('Yes — panic sell immediately', 'हाँ — तुरंत घबराकर बेच दें', 'हो — लगेच घाबरून विका'), isOptimal: false, feedback: loc('Your bonus shares credit separately; total value did not fall.', 'बोनस शेयर अलग से मिलते हैं, कुल मूल्य नहीं घटा।', 'बोनस शेअर्स जमा होतात, मूल्य कमी होत नाही.') },
    ],
    questions: [
      {
        id: 'q-1-11-a',
        q: loc('If you hold 5 shares at ₹1,000 (₹5,000 total) and a 1:1 Bonus executes, what do you own?', 'यदि आपके पास ₹1,000 के 5 शेयर हैं और 1:1 बोनस मिलता है, तो आपके पास क्या होगा?', 'तुमच्याकडे ₹१,००० चे ५ शेअर्स असतील आणि १:१ बोनस मिळाल्यास काय होईल?'),
        opts: [
          { text: loc('10 shares at ~₹500 each (₹5,000 total value)', '₹500 के 10 शेयर (कुल मूल्य ₹5,000)', 'प्रत्येकी ₹५०० चे १० शेअर्स (एकूण ₹५,०००)'), isCorrect: true, exp: loc('Quantity doubles and price halves proportionally.', 'मात्रा दोगुनी और भाव आधा हो जाता है।', 'संख्या दुप्पट आणि भाव निम्मा होतो.') },
          { text: loc('5 shares at ₹0', '₹0 के 5 शेयर', '₹० चे ५ शेअर्स'), isCorrect: false, exp: loc('Bonus issues preserve total market capitalization.', 'बोनस से कुल बाजार मूल्य समान रहता है।', 'बोनसमुळे एकूण बाजारमूल्य कायम राहते.') },
        ],
      },
    ],
  },
  {
    id: 'topic-1-12',
    unitId: 'b-u3',
    number: 12,
    title: loc('Brokerage, STT, Taxes & Beginner Mistakes', 'ब्रोकरेज, STT, टैक्स और शुरुआती गलतियां', 'ब्रोकरेज, STT, कर आणि नवशिक्यांच्या चुका'),
    subtitle: loc('Why overtrading erodes returns via friction costs and taxes', 'अत्यधिक ट्रेडिंग से शुल्क और टैक्स मुनाफा कैसे खा जाते हैं', 'अतिरेकी ट्रेडिंगमुळे शुल्क आणि करात नफा कसा जातो'),
    estimatedMinutes: 6,
    xpReward: 130,
    intro: loc(
      'Every trade incurs Securities Transaction Tax (STT), exchange charges, GST, SEBI turnover fees, stamp duty, and capital gains tax (STCG vs LTCG). Frequent impulsive trading enriches intermediaries while draining your capital.',
      'हर सौदे पर STT, एक्सचेंज शुल्क, GST, स्टाम्प ड्यूटी और कैपिटल गेन टैक्स लगता है। बार-बार बिना सोचे ट्रेडिंग करने से शुल्क आपकी पूंजी को घटा देते हैं।',
      'प्रत्येक व्यवहारावर STT, एक्सचेंज शुल्क, GST, मुद्रांक शुल्क आणि भांडवली नफा कर लागतो. वारंवार विनाकारण ट्रेडिंग केल्यास नफा शुल्कातच जातो.'
    ),
    concepts: [
      {
        heading: loc('STCG vs LTCG Holding Discipline', 'STCG बनाम LTCG टैक्स अंतर', 'STCG विरुद्ध LTCG कर फरक'),
        body: loc('Holding Indian listed equities over 12 months qualifies as Long-Term Capital Gains (LTCG) with an annual exemption threshold and lower tax rate than short-term churn.', 'शेयरों को 12 महीने से अधिक रखने पर LTCG लागू होता है जो अल्पकालिक टैक्स (STCG) की तुलना में किफायती होता है।', '१२ महिन्यांपेक्षा जास्त काळ शेअर्स ठेवल्यास दीर्घकालीन भांडवली नफा (LTCG) लागू होतो.'),
      },
    ],
    caseStudy: loc(
      'SEBI studies show ~9 out of 10 impulsive retail intraday/F&O traders lose money largely due to overtrading and transaction costs.',
      'SEBI के अध्ययन बताते हैं कि अत्यधिक ट्रेडिंग और शुल्कों के कारण ~90% आवेगी इंट्राडे/F&O ट्रेडर नुकसान उठाते हैं।',
      'SEBI च्या अभ्यासानुसार ~९०% घाईगडबडीत इंट्राडे/F&O करणारे ट्रेडर्स शुल्क आणि चुकांमुळे तोटा सहन करतात.'
    ),
    visTitle: loc('Friction Cost Leak vs Patient Compounding', 'शुल्क रिसाव बनाम धैर्यवान निवेश', 'शुल्क गळती विरुद्ध संयमी गुंतवणूक'),
    visSteps: [
      { title: loc('Overtrader: 200 Impulsive Trades', 'ओवरट्रेडर: 200 आवेगी सौदे', 'ओव्हरट्रेडर: २०० घाईचे व्यवहार'), description: loc('Thousands of rupees lost to STT, brokerage, and slippage.', 'हजारों रुपये STT, ब्रोकरेज और स्लिपेज में नष्ट।', 'हजारो रुपये STT आणि ब्रोकरेजमध्ये खर्च होतात.') },
      { title: loc('Disciplined Investor: High-Conviction Setups', 'अनुशासित निवेशक: चुनिंदा उच्च-गुणवत्ता सौदे', 'शिस्तबद्ध गुंतवणूकदार: निवडक दर्जेदार गुंतवणूक'), description: loc('Minimal friction lets compounding work uninterrupted.', 'न्यूनतम शुल्क के साथ चक्रवृद्धि निरंतर बढ़ती है।', 'कमी खर्चात चक्रवाढ अखंडपणे काम करते.') },
    ],
    gameType: 'ORDER_TICKET',
    gameTitle: loc('Inspect Trade Charges (Brokerage & STT)', 'ट्रेड शुल्क निरीक्षक', 'व्यवहार शुल्क तपासा'),
    gameInst: loc('Run a trade simulation to inspect exact brokerage and STT charges.', 'सौदा चलाकर ब्रोकरेज और STT शुल्क की जांच करें।', 'व्यवहार करून ब्रोकरेज आणि STT किती लागतो ते पहा.'),
    questions: [
      {
        id: 'q-1-12-a',
        q: loc('What is a major hidden reason impulsive overtraders lose money even with a 50% win rate?', '50% जीत दर होने पर भी बार-बार ओवरट्रेडिंग करने वाले पैसा क्यों गँवाते हैं?', '५०% यश मिळूनही वारंवार ओव्हरट्रेडिंग करणारे पैसे का गमावतात?'),
        opts: [
          { text: loc('Cumulative STT, brokerage, taxes, and bid-ask slippage', 'संचयी STT, ब्रोकरेज, टैक्स और बिड-आस्क स्लिपेज', 'एकत्रित STT, ब्रोकरेज, कर आणि स्लिपेज खर्च'), isCorrect: true, exp: loc('Transaction friction compounds against hyperactive traders.', 'लगातार सौदों का शुल्क मुनाफा खत्म कर देता है।', 'सततच्या व्यवहारांचे शुल्क नफा संपवते.') },
          { text: loc('Demat accounts delete shares every Friday', 'डीमैट खाता हर शुक्रवार शेयर मिटा देता है', 'डिमॅट खाते दर शुक्रवारी शेअर्स पुसून टाकते'), isCorrect: false, exp: loc('Demat holdings never expire.', 'डीमैट होल्डिंग कभी समाप्त नहीं होती।', 'डिमॅटमधील शेअर्स कधीही नष्ट होत नाहीत.') },
        ],
      },
    ],
  },
];

export const BASIC_MODULE: CourseModule = {
  id: 'basic',
  title: loc('Module 1: Basic Stock Market', 'मॉड्यूल 1: बेसिक स्टॉक मार्केट', 'मॉड्यूल १: मूलभूत शेअर बाजार'),
  description: loc(
    'Build rock-solid foundations: inflation, compounding, NSE/BSE mechanics, Demat accounts, indices, order types, and market costs.',
    'महंगाई, चक्रवृद्धि, NSE/BSE कार्यप्रणाली, डीमैट खाते, सूचकांक और ऑर्डर प्रकारों की मजबूत नींव बनाएं।',
    'महागाई, चक्रवाढ, NSE/BSE कार्यपद्धती, डिमॅट खाते, निर्देशांक आणि ऑर्डर प्रकारांचा भक्कम पाया तयार करा.'
  ),
  units: [
    {
      id: 'b-u1',
      unitNumber: 1,
      title: loc('Wealth Foundations & Equity Ownership', 'संपत्ति की नींव और हिस्सेदारी', 'संपत्तीचा पाया आणि समभाग मालकी'),
      description: loc('Inflation, SIP compounding, fractional share ownership, and asset classes.', 'महंगाई, SIP चक्रवृद्धि, शेयर स्वामित्व और संपत्ति वर्ग।', 'महागाई, SIP चक्रवाढ, समभाग मालकी आणि मालमत्ता प्रकार.'),
      topics: BASIC_TOPICS.slice(0, 4).map((t) => buildTopic('basic', t)),
    },
    {
      id: 'b-u2',
      unitNumber: 2,
      title: loc('Indian Market Ecosystem (NSE, BSE & SEBI)', 'भारतीय बाजार तंत्र (NSE, BSE व SEBI)', 'भारतीय बाजार व्यवस्था (NSE, BSE व SEBI)'),
      description: loc('Regulators, IPOs vs Secondary markets, Demat depositories, and NIFTY/SENSEX.', 'नियामक, IPO, डीमैट डिपॉजिटरी और निफ्टी/सेंसेक्स।', 'नियामक, IPO, डिमॅट डिपॉझिटरी आणि निफ्टी/सेन्सेक्स.'),
      topics: BASIC_TOPICS.slice(4, 8).map((t) => buildTopic('basic', t)),
    },
    {
      id: 'b-u3',
      unitNumber: 3,
      title: loc('Order Execution, Corporate Actions & Costs', 'ऑर्डर निष्पादन, कॉर्पोरेट एक्शन व शुल्क', 'ऑर्डर अंमलबजावणी, कॉर्पोरेट कृती आणि खर्च'),
      description: loc('Bid-ask spreads, Market/Limit/Stop-Loss orders, splits/bonuses, and STT/taxes.', 'बिड-आस्क स्प्रेड, ऑर्डर प्रकार, बोनस/स्प्लिट और टैक्स।', 'बिड-आस्क स्प्रेड, ऑर्डर प्रकार, बोनस/स्प्लिट आणि कर.'),
      topics: BASIC_TOPICS.slice(8, 12).map((t) => buildTopic('basic', t)),
    },
  ],
};

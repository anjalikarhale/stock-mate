import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Play,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Award,
  Gamepad2,
  BarChart3,
  Sliders,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Check,
  X,
  Volume2,
  AlertCircle,
  Lightbulb,
  ArrowRight,
  Lock,
  Sparkles,
  Layers,
  ArrowLeft
} from 'lucide-react';
import { useGame } from '../../context/GameContext';
import {
  COURSE_MODULES,
  CourseLanguage,
  CourseTopic,
  CourseUnit,
  CourseModule,
  StageType,
  getAllCourseTopics,
  getCourseTopicById,
  getAdjacentTopic,
} from '../../data/courses';
import { AICartoonGuide, GuideMood } from './AICartoonGuide';
import { soundEffects } from '../../utils/audio';

interface StudentLearnHubProps {
  onLaunchMission?: (missionId: string) => void;
  initialTopicId?: string;
}

type ViewMode = 'modules' | 'topics' | 'detail';

export const StudentLearnHub: React.FC<StudentLearnHubProps> = ({
  onLaunchMission,
  initialTopicId,
}) => {
  const { profile, completeCourseTopic, resetLearningProgress } = useGame();

  // Selected language: English ('en'), Hindi ('hi'), Marathi ('mr')
  const [language, setLanguage] = useState<CourseLanguage>(() => {
    return (localStorage.getItem('stockmate_course_lang') as CourseLanguage) || 'en';
  });

  const handleLanguageChange = (newLang: CourseLanguage) => {
    setLanguage(newLang);
    localStorage.setItem('stockmate_course_lang', newLang);
    soundEffects.click();
  };

  // Completed topics list from profile
  const completedTopics = useMemo(() => {
    return profile.completedCourseTopics || [];
  }, [profile.completedCourseTopics]);

  // Current view mode: 'modules' -> 'topics' -> 'detail'
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (initialTopicId && getCourseTopicById(initialTopicId)) {
      return 'detail';
    }
    return 'modules';
  });

  // Selected module: basic, intermediate, advanced
  const [selectedModuleId, setSelectedModuleId] = useState<string>('basic');

  // Active module object
  const activeModule = useMemo(() => {
    return COURSE_MODULES.find((m) => m.id === selectedModuleId) || COURSE_MODULES[0];
  }, [selectedModuleId]);

  // All topics in the system
  const allTopics = useMemo(() => getAllCourseTopics(), []);

  // Determine current active topic
  const [activeTopicId, setActiveTopicId] = useState<string>(() => {
    if (initialTopicId && getCourseTopicById(initialTopicId)) {
      return initialTopicId;
    }
    return 'topic-1-1';
  });

  // Current topic object
  const activeTopic = useMemo(() => {
    return getCourseTopicById(activeTopicId) || allTopics[0];
  }, [activeTopicId, allTopics]);

  // Active stage inside topic: 'theory' | 'visualizer' | 'minigame' | 'test'
  const [activeStage, setActiveStage] = useState<StageType>('theory');

  // Reset confirmation modal
  const [showResetModal, setShowResetModal] = useState(false);

  // -------------------------------------------------------------
  // MODULE UNLOCK PROGRESSION LOGIC (1st -> 2nd -> 3rd)
  // -------------------------------------------------------------
  const basicTopics = useMemo(() => {
    return COURSE_MODULES[0].units.flatMap((u) => u.topics);
  }, []);

  const intermediateTopics = useMemo(() => {
    return COURSE_MODULES[1].units.flatMap((u) => u.topics);
  }, []);

  const advancedTopics = useMemo(() => {
    return COURSE_MODULES[2].units.flatMap((u) => u.topics);
  }, []);

  const basicCompletedCount = useMemo(() => {
    return basicTopics.filter((t) => completedTopics.includes(t.id)).length;
  }, [basicTopics, completedTopics]);

  const intermediateCompletedCount = useMemo(() => {
    return intermediateTopics.filter((t) => completedTopics.includes(t.id)).length;
  }, [intermediateTopics, completedTopics]);

  const advancedCompletedCount = useMemo(() => {
    return advancedTopics.filter((t) => completedTopics.includes(t.id)).length;
  }, [advancedTopics, completedTopics]);

  // Module 1 is always unlocked
  // Module 2 requires at least 8 topics from Module 1 (or all if shorter)
  const isModule1Unlocked = true;
  const isModule2Unlocked = basicCompletedCount >= Math.min(8, basicTopics.length);
  // Module 3 requires Module 2 progress
  const isModule3Unlocked = isModule2Unlocked && intermediateCompletedCount >= Math.min(8, intermediateTopics.length);

  const isModuleUnlocked = (moduleId: string): boolean => {
    if (moduleId === 'basic') return isModule1Unlocked;
    if (moduleId === 'intermediate') return isModule2Unlocked;
    if (moduleId === 'advanced') return isModule3Unlocked;
    return false;
  };

  // Check if topic is completed
  const isTopicCompleted = (topicId: string) => completedTopics.includes(topicId);

  // Check if topic within a module is unlocked sequentially
  const isTopicUnlocked = (topic: CourseTopic, mod: CourseModule): boolean => {
    if (!isModuleUnlocked(mod.id)) return false;
    const modTopics = mod.units.flatMap((u) => u.topics);
    const index = modTopics.findIndex((t) => t.id === topic.id);
    if (index === 0) return true; // First topic is always unlocked
    // Unlocked if previous topic is completed
    const prevTopic = modTopics[index - 1];
    return completedTopics.includes(prevTopic.id);
  };

  // Next recommended topic in the entire course
  const nextRecommendedTopic = useMemo(() => {
    return allTopics.find((t) => !completedTopics.includes(t.id)) || allTopics[0];
  }, [allTopics, completedTopics]);

  // -------------------------------------------------------------
  // Visualizer Animation State
  // -------------------------------------------------------------
  const [visualizerStepIndex, setVisualizerStepIndex] = useState(0);
  const [isPlayingVisualizer, setIsPlayingVisualizer] = useState(false);

  useEffect(() => {
    setVisualizerStepIndex(0);
    setIsPlayingVisualizer(false);
  }, [activeTopicId]);

  useEffect(() => {
    if (!isPlayingVisualizer || !activeTopic?.visualizer?.steps?.length) return;
    const interval = setInterval(() => {
      setVisualizerStepIndex((prev) => {
        if (prev >= activeTopic.visualizer.steps.length - 1) {
          setIsPlayingVisualizer(false);
          return prev;
        }
        return prev + 1;
      });
    }, 3200);
    return () => clearInterval(interval);
  }, [isPlayingVisualizer, activeTopic]);

  // -------------------------------------------------------------
  // Mini-Game State
  // -------------------------------------------------------------
  const [miniGameInputs, setMiniGameInputs] = useState<Record<string, any>>({});
  const [miniGameResult, setMiniGameResult] = useState<any>(null);
  const [isMiniGameCompleted, setIsMiniGameCompleted] = useState(false);

  useEffect(() => {
    setMiniGameInputs({});
    setMiniGameResult(null);
    setIsMiniGameCompleted(false);
  }, [activeTopicId]);

  // -------------------------------------------------------------
  // Test State
  // -------------------------------------------------------------
  const [testAnswers, setTestAnswers] = useState<Record<string, number>>({});
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [testScorePercent, setTestScorePercent] = useState<number | null>(null);

  useEffect(() => {
    setTestAnswers({});
    setTestSubmitted(false);
    setTestScorePercent(null);
  }, [activeTopicId]);

  // -------------------------------------------------------------
  // Navigation Handlers
  // -------------------------------------------------------------
  const handleOpenModule = (moduleId: string) => {
    if (!isModuleUnlocked(moduleId)) return;
    soundEffects.click();
    setSelectedModuleId(moduleId);
    setViewMode('topics');
  };

  const handleOpenTopic = (topic: CourseTopic) => {
    soundEffects.click();
    setActiveTopicId(topic.id);
    setSelectedModuleId(topic.moduleId);
    setActiveStage('theory');
    setViewMode('detail');
  };

  const handleBackToModules = () => {
    soundEffects.click();
    setViewMode('modules');
  };

  const handleBackToTopics = () => {
    soundEffects.click();
    setViewMode('topics');
  };

  // Adjacent navigation inside detail
  const { prev: prevTopic, next: nextTopic } = useMemo(() => {
    return getAdjacentTopic(activeTopicId);
  }, [activeTopicId]);

  const handleNextTopic = () => {
    if (nextTopic) {
      soundEffects.click();
      setActiveTopicId(nextTopic.id);
      setSelectedModuleId(nextTopic.moduleId);
      setActiveStage('theory');
    }
  };

  // Language helper
  const t = (obj?: { en: string; hi: string; mr: string }) => {
    if (!obj) return '';
    return obj[language] || obj.en || '';
  };

  // -------------------------------------------------------------
  // Mini-Game Actions
  // -------------------------------------------------------------
  const handleMiniGameAction = (type: string, payload?: any) => {
    soundEffects.click();
    if (type === 'SLIDER_SIMULATION') {
      const p = payload || miniGameInputs;
      const initial = Number(p.initial || 5000);
      const monthly = Number(p.monthly || 2000);
      const rate = Number(p.rate || 12) / 100;
      const inflation = Number(p.inflation || 6) / 100;
      const years = Number(p.years || 10);

      const r = rate / 12;
      const n = years * 12;
      const futureNominal = initial * Math.pow(1 + r, n) + (monthly * (Math.pow(1 + r, n) - 1)) / r;
      const totalInvested = initial + monthly * n;
      const wealthGain = futureNominal - totalInvested;
      const realRate = (1 + rate) / (1 + inflation) - 1;
      const rReal = realRate / 12;
      const futureReal = initial * Math.pow(1 + rReal, n) + (monthly * (Math.pow(1 + rReal, n) - 1)) / rReal;

      setMiniGameResult({
        totalInvested: Math.round(totalInvested),
        futureNominal: Math.round(futureNominal),
        futureReal: Math.round(futureReal),
        wealthGain: Math.round(wealthGain),
        success: true,
      });
      setIsMiniGameCompleted(true);
      soundEffects.correct();
    } else if (type === 'DECISION_CHOICE') {
      const selectedIndex = payload;
      const choice = activeTopic.miniGame?.data?.choices?.[selectedIndex];
      if (choice) {
        setMiniGameResult({
          choice,
          isBest: choice.isOptimal,
          feedback: choice.feedback?.[language] || choice.feedback?.en,
        });
        if (choice.isOptimal) {
          setIsMiniGameCompleted(true);
          soundEffects.correct();
        } else {
          soundEffects.wrong();
        }
      }
    } else if (type === 'ORDER_TICKET') {
      const orderType = payload?.orderType || 'LIMIT';
      const quantity = Number(payload?.quantity || 10);
      const price = Number(payload?.price || 1500);
      const totalValue = quantity * price;
      const brokerage = Math.min(20, totalValue * 0.0003);
      const stt = totalValue * 0.001;

      setMiniGameResult({
        success: true,
        orderType,
        quantity,
        price,
        totalValue: Math.round(totalValue),
        brokerage: Math.round(brokerage * 100) / 100,
        stt: Math.round(stt * 100) / 100,
        status: 'EXECUTED',
      });
      setIsMiniGameCompleted(true);
      soundEffects.correct();
    } else if (type === 'CANDLE_FORGE') {
      const open = Number(payload?.open || 100);
      const high = Number(payload?.high || 115);
      const low = Number(payload?.low || 95);
      const close = Number(payload?.close || 110);

      const isBullish = close >= open;
      const body = Math.abs(close - open);
      const upperWick = high - Math.max(open, close);
      const lowerWick = Math.min(open, close) - low;

      let candleName = isBullish ? 'Bullish Candle' : 'Bearish Candle';
      if (body < 2) candleName = 'Doji (Indecision)';
      else if (lowerWick >= 2 * body && upperWick <= body * 0.3) candleName = 'Bullish Hammer (Reversal)';
      else if (upperWick >= 2 * body && lowerWick <= body * 0.3) candleName = 'Shooting Star (Bearish)';

      setMiniGameResult({
        success: true,
        candleName,
        isBullish,
        body: Math.round(body * 10) / 10,
        upperWick: Math.round(upperWick * 10) / 10,
        lowerWick: Math.round(lowerWick * 10) / 10,
      });
      setIsMiniGameCompleted(true);
      soundEffects.correct();
    }
  };

  // Test grading
  const handleTestOptionSelect = (qId: string, optionIndex: number) => {
    if (testSubmitted) return;
    soundEffects.click();
    setTestAnswers((prev) => ({
      ...prev,
      [qId]: optionIndex,
    }));
  };

  const handleTestSubmit = () => {
    if (!activeTopic?.test?.questions?.length) return;
    const questions = activeTopic.test.questions;
    let correctCount = 0;

    questions.forEach((q) => {
      const selectedIdx = testAnswers[q.id];
      if (selectedIdx !== undefined && q.options[selectedIdx]?.isCorrect) {
        correctCount++;
      }
    });

    const percent = Math.round((correctCount / questions.length) * 100);
    setTestScorePercent(percent);
    setTestSubmitted(true);

    const isPassed = percent >= (activeTopic.test.passingScorePercent || 70);
    if (isPassed) {
      soundEffects.levelUp();
      completeCourseTopic(activeTopic.id, activeTopic.xpReward);
    } else {
      soundEffects.wrong();
    }
  };

  const handleTestRetry = () => {
    soundEffects.click();
    setTestAnswers({});
    setTestSubmitted(false);
    setTestScorePercent(null);
  };

  // -------------------------------------------------------------
  // AI CARTOON GUIDE CONTEXT MESSAGE COMPUTATION
  // -------------------------------------------------------------
  const guideState = useMemo<{
    message: { en: string; hi: string; mr: string };
    mood: GuideMood;
    actionText?: { en: string; hi: string; mr: string };
    onActionClick?: () => void;
  }>(() => {
    // 1. In Modules Screen
    if (viewMode === 'modules') {
      if (basicCompletedCount === 0) {
        return {
          mood: 'happy',
          message: {
            en: 'Welcome! Start with Module 1: Basic Stock Market to build your wealth foundation. Click "Enter Module 1" to begin!',
            hi: 'नमस्ते! अपना सफर शुरू करने के लिए मॉड्यूल 1: बेसिक स्टॉक मार्केट चुनें। "Enter Module 1" पर क्लिक करें!',
            mr: 'स्वागत आहे! आपल्या प्रवासाची सुरुवात करण्यासाठी मॉड्यूल 1 निवडा. "Enter Module 1" वर क्लिक करा!',
          },
          actionText: {
            en: 'Start Module 1',
            hi: 'मॉड्यूल 1 शुरू करें',
            mr: 'मॉड्यूल 1 सुरू करा',
          },
          onActionClick: () => handleOpenModule('basic'),
        };
      } else if (!isModule2Unlocked) {
        return {
          mood: 'pointing',
          message: {
            en: `You've finished ${basicCompletedCount} of ${basicTopics.length} basic topics! Keep going to unlock Module 2: Intermediate!`,
            hi: `आपने ${basicCompletedCount}/${basicTopics.length} बेसिक टॉपिक्स पूरे कर लिए हैं! मॉड्यूल 2 अनलॉक करने के लिए जारी रखें!`,
            mr: `तुम्ही ${basicCompletedCount}/${basicTopics.length} बेसिक टॉपिक्स पूर्ण केले आहेत! मॉड्यूल 2 अनलॉक करण्यासाठी पुढे सुरू ठेवा!`,
          },
          actionText: {
            en: 'Continue Module 1',
            hi: 'मॉड्यूल 1 जारी रखें',
            mr: 'मॉड्यूल 1 सुरू ठेवा',
          },
          onActionClick: () => handleOpenModule('basic'),
        };
      } else if (!isModule3Unlocked) {
        return {
          mood: 'cheering',
          message: {
            en: 'Great job unlocking Module 2: Intermediate! Now explore financial statements, charts, and indicators.',
            hi: 'बहुत बढ़िया! मॉड्यूल 2 अनलॉक हो गया है। अब फाइनेंशियल स्टेटमेंट्स और चार्ट्स सीखें।',
            mr: 'छान! मॉड्यूल 2 अनलॉक झाले आहे. आता ताळेबंद आणि चार्ट्स शिका.',
          },
          actionText: {
            en: 'Enter Module 2',
            hi: 'मॉड्यूल 2 में जाएं',
            mr: 'मॉड्यूल 2 उघडा',
          },
          onActionClick: () => handleOpenModule('intermediate'),
        };
      } else {
        return {
          mood: 'celebrating',
          message: {
            en: 'Master trader status! All 3 modules are unlocked. Dive into Advanced Valuation & Derivatives!',
            hi: 'शानदार! तीनों मॉड्यूल अनलॉक हैं। एडवांस्ड डेरिवेटिव्स और वैल्यूएशन में महारत हासिल करें!',
            mr: 'उत्कृष्ट! तिन्ही मॉड्यूल्स अनलॉक आहेत. प्रगत डेरिव्हेटिव्ह्ज शिका!',
          },
          actionText: {
            en: 'Enter Module 3',
            hi: 'मॉड्यूल 3 में जाएं',
            mr: 'मॉड्यूल 3 उघडा',
          },
          onActionClick: () => handleOpenModule('advanced'),
        };
      }
    }

    // 2. In Topics Screen
    if (viewMode === 'topics') {
      const activeModTopics = activeModule.units.flatMap((u) => u.topics);
      const nextInMod = activeModTopics.find((t) => !completedTopics.includes(t.id)) || activeModTopics[0];

      return {
        mood: 'pointing',
        message: {
          en: `You are in ${t(activeModule.title)}. Ready for "${t(nextInMod.title)}"? Click it to start!`,
          hi: `आप ${t(activeModule.title)} में हैं। क्या आप "${t(nextInMod.title)}" के लिए तैयार हैं? शुरू करने के लिए क्लिक करें!`,
          mr: `तुम्ही ${t(activeModule.title)} मध्ये आहात. "${t(nextInMod.title)}" सुरू करण्यासाठी क्लिक करा!`,
        },
        actionText: {
          en: 'Start Next Topic',
          hi: 'अगला टॉपिक शुरू करें',
          mr: 'पुढचा टॉपिक सुरू करा',
        },
        onActionClick: () => handleOpenTopic(nextInMod),
      };
    }

    // 3. In Detail Screen (Topic Stages)
    if (viewMode === 'detail') {
      if (activeStage === 'theory') {
        return {
          mood: 'thinking',
          message: {
            en: 'Read through the concepts and case study above. When you feel ready, click "Next: Watch Visualizer"!',
            hi: 'ऊपर दी गई थ्योरी और केस स्टडी पढ़ें। तैयार होने पर "Next: Watch Visualizer" पर क्लिक करें!',
            mr: 'वरील संकल्पना आणि उदाहरणे वाचा. समजल्यावर "Next: Watch Visualizer" वर क्लिक करा!',
          },
          actionText: {
            en: 'Next: Visualizer',
            hi: 'आगे: दृश्य देखें',
            mr: 'पुढे: दृश्य बघा',
          },
          onActionClick: () => setActiveStage('visualizer'),
        };
      }

      if (activeStage === 'visualizer') {
        return {
          mood: 'happy',
          message: {
            en: 'Watch how this concept animates! Once you grasp the flow, jump into the hands-on mini-game.',
            hi: 'देखें कि यह कैसे एनिमेट होता है! इसके बाद व्यावहारिक मिनी-गेम खेलें।',
            mr: 'ही संकल्पना कशी काम करते ते बघा! नंतर मिनी-गेम खेळा.',
          },
          actionText: {
            en: 'Next: Play Mini-Game',
            hi: 'आगे: मिनी-गेम खेलें',
            mr: 'पुढे: मिनी-गेम खेळा',
          },
          onActionClick: () => setActiveStage('minigame'),
        };
      }

      if (activeStage === 'minigame') {
        if (!isMiniGameCompleted) {
          return {
            mood: 'pointing',
            message: {
              en: 'Adjust the sliders or choose your decision to simulate real market results!',
              hi: 'वास्तविक बाज़ार परिणाम देखने के लिए स्लाइडर समायोजित करें या अपना निर्णय चुनें!',
              mr: 'खरे बाजार परिणाम पाहण्यासाठी स्लाइडर हलवा किंवा निर्णय निवडा!',
            },
          };
        } else {
          return {
            mood: 'cheering',
            message: {
              en: 'Great job completing the mini-game! Now take the quick test to prove your mastery and earn XP!',
              hi: 'मिनी-गेम शानदार तरीके से पूरा हुआ! अब अपनी समझ परखने के लिए टेस्ट दें!',
              mr: 'छान! मिनी-गेम पूर्ण झाला! आता ज्ञान तपासण्यासाठी चाचणी द्या!',
            },
            actionText: {
              en: 'Take Topic Test',
              hi: 'टेस्ट दें',
              mr: 'चाचणी द्या',
            },
            onActionClick: () => setActiveStage('test'),
          };
        }
      }

      if (activeStage === 'test') {
        if (testSubmitted && testScorePercent !== null && testScorePercent >= (activeTopic.test.passingScorePercent || 70)) {
          return {
            mood: 'celebrating',
            message: {
              en: `Awesome job! You passed with ${testScorePercent}% and earned +${activeTopic.xpReward} XP! Ready for the next topic?`,
              hi: `शानदार! आपने ${testScorePercent}% के साथ टेस्ट पास किया और +${activeTopic.xpReward} XP अर्जित किए!`,
              mr: `अभिनंदन! तुम्ही ${testScorePercent}% मिळवून चाचणी उत्तीर्ण केली आणि +${activeTopic.xpReward} XP जिंकले!`,
            },
            actionText: nextTopic
              ? {
                  en: 'Next Topic →',
                  hi: 'अगला टॉपिक →',
                  mr: 'पुढचा टॉपिक →',
                }
              : undefined,
            onActionClick: nextTopic ? handleNextTopic : undefined,
          };
        } else if (testSubmitted) {
          return {
            mood: 'thinking',
            message: {
              en: 'You were close! Review the explanations above, then click "Retry Test" to pass!',
              hi: 'आप बहुत करीब थे! ऊपर दिए गए स्पष्टीकरण देखें और दोबारा प्रयास करें!',
              mr: 'तुम्ही अगदी जवळ होता! वरील उत्तरे तपासा आणि पुन्हा प्रयत्न करा!',
            },
          };
        } else {
          return {
            mood: 'pointing',
            message: {
              en: 'Answer the questions below to test your understanding. Score 70% or more to pass!',
              hi: 'नीचे दिए गए प्रश्नों के उत्तर दें। पास होने के लिए 70% या अधिक अंक प्राप्त करें!',
              mr: 'खालील प्रश्नांची उत्तरे द्या. उत्तीर्ण होण्यासाठी 70% किंवा अधिक गुण मिळवा!',
            },
          };
        }
      }
    }

    return {
      mood: 'happy',
      message: {
        en: 'Hello! I am your AI stock mentor Bulli. Follow along step-by-step!',
        hi: 'नमस्ते! मैं आपका AI मेंटर बूली हूँ। कदम दर कदम सीखें!',
        mr: 'नमस्कार! मी तुमचा AI मार्गदर्शक बुली आहे. टप्प्याटप्प्याने शिका!',
      },
    };
  }, [
    viewMode,
    basicCompletedCount,
    basicTopics.length,
    isModule2Unlocked,
    isModule3Unlocked,
    activeModule,
    completedTopics,
    activeTopic,
    activeStage,
    isMiniGameCompleted,
    testSubmitted,
    testScorePercent,
    nextTopic,
    language,
  ]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-28 text-slate-100">
      {/* ==================================================================== */}
      {/* GLOBAL TOP NAV BAR: TITLE + LANGUAGE SWITCHER + RESET                */}
      {/* ==================================================================== */}
      <header className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-indigo-400 tracking-wider uppercase">
              3-Step Guided Learning
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-xs text-slate-400">
              {completedTopics.length} of {allTopics.length} Topics Completed
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white mt-0.5">
            Stock Market Mastery
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => handleLanguageChange('en')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                language === 'en'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🇬🇧 English
            </button>
            <button
              onClick={() => handleLanguageChange('hi')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                language === 'hi'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🇮🇳 हिन्दी
            </button>
            <button
              onClick={() => handleLanguageChange('mr')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                language === 'mr'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🚩 मराठी
            </button>
          </div>

          {/* Reset progress */}
          <button
            onClick={() => setShowResetModal(true)}
            className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-rose-300 hover:border-rose-900 transition-colors"
            title="Reset progress to zero"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ==================================================================== */}
      {/* SCREEN 1: 3 MODULES OVERVIEW (SIMPLE & CLEAR)                         */}
      {/* ==================================================================== */}
      {viewMode === 'modules' && (
        <div className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2 py-2">
            <h2 className="text-2xl font-black text-white">Choose Your Learning Stage</h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Complete each stage sequentially: Master the basics first, then unlock intermediate analysis, followed by advanced quantitative tools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {COURSE_MODULES.map((mod, index) => {
              const isUnlocked = isModuleUnlocked(mod.id);
              const modTopics = mod.units.flatMap((u) => u.topics);
              const completedCount = modTopics.filter((t) => completedTopics.includes(t.id)).length;
              const isFinished = completedCount === modTopics.length && modTopics.length > 0;
              const progressPct = modTopics.length > 0 ? Math.round((completedCount / modTopics.length) * 100) : 0;

              return (
                <div
                  key={mod.id}
                  className={`rounded-3xl border p-6 flex flex-col justify-between transition-all duration-300 relative overflow-hidden ${
                    isUnlocked
                      ? 'bg-slate-900 border-slate-800 hover:border-indigo-500/60 shadow-xl'
                      : 'bg-slate-950/70 border-slate-850 opacity-70'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Module Header Badge */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-400 font-mono">
                        STAGE {index + 1}
                      </span>
                      {isFinished ? (
                        <span className="flex items-center gap-1 text-xs text-emerald-400 font-semibold bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800/60">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mastered</span>
                        </span>
                      ) : !isUnlocked ? (
                        <span className="flex items-center gap-1 text-xs text-slate-400 font-semibold bg-slate-900 px-2.5 py-1 rounded-full border border-slate-800">
                          <Lock className="w-3.5 h-3.5" />
                          <span>Locked</span>
                        </span>
                      ) : (
                        <span className="text-xs text-amber-400 font-bold bg-amber-950/40 px-2.5 py-1 rounded-full border border-amber-800/40">
                          In Progress
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-xl font-black text-white">{t(mod.title)}</h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-3 leading-relaxed">
                        {t(mod.description)}
                      </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5 pt-2">
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>Progress</span>
                        <span className="font-semibold text-slate-200">
                          {completedCount} / {modTopics.length} Topics ({progressPct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(progressPct, 0)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action CTA */}
                  <div className="pt-6">
                    {isUnlocked ? (
                      <button
                        onClick={() => handleOpenModule(mod.id)}
                        className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>{completedCount === 0 ? 'Enter Module' : 'Continue Module'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
                        <Lock className="w-3.5 h-3.5" />
                        <span>
                          {mod.id === 'intermediate'
                            ? 'Complete Module 1: Basic first'
                            : 'Complete Module 2: Intermediate first'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SCREEN 2: TOPICS ROADMAP LIST (WITHIN SELECTED MODULE)               */}
      {/* ==================================================================== */}
      {viewMode === 'topics' && (
        <div className="space-y-6">
          {/* Back button & Module details */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <div className="space-y-2">
              <button
                onClick={handleBackToModules}
                className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-bold transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to 3 Modules</span>
              </button>
              <h2 className="text-2xl font-black text-white">{t(activeModule.title)}</h2>
              <p className="text-xs text-slate-300 max-w-xl">
                {t(activeModule.description)}
              </p>
            </div>

            <div className="text-left sm:text-right bg-slate-950 p-4 rounded-2xl border border-slate-800 shrink-0">
              <div className="text-xs text-slate-400">Completed in this module:</div>
              <div className="text-lg font-black text-emerald-400 font-mono">
                {activeModule.units.flatMap((u) => u.topics).filter((t) => completedTopics.includes(t.id)).length} /{' '}
                {activeModule.units.flatMap((u) => u.topics).length} Topics
              </div>
            </div>
          </div>

          {/* Simple step-by-step topic cards list */}
          <div className="space-y-4">
            {activeModule.units.map((unit) => (
              <div
                key={unit.id}
                className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4"
              >
                <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
                  <span className="w-6 h-6 rounded-lg bg-indigo-900/60 text-indigo-300 font-bold text-xs flex items-center justify-center">
                    {unit.unitNumber}
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-white">{t(unit.title)}</h3>
                    <p className="text-xs text-slate-400">{t(unit.description)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {unit.topics.map((topic) => {
                    const isDone = isTopicCompleted(topic.id);
                    const isUnlocked = isTopicUnlocked(topic, activeModule);

                    return (
                      <div
                        key={topic.id}
                        className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                          isDone
                            ? 'bg-slate-950/80 border-emerald-900/50 text-slate-300'
                            : isUnlocked
                            ? 'bg-slate-950 border-indigo-500/50 text-white shadow-md'
                            : 'bg-slate-950/40 border-slate-850 opacity-60 text-slate-400'
                        }`}
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <span className="mt-0.5 shrink-0">
                            {isDone ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                            ) : isUnlocked ? (
                              <div className="w-5 h-5 rounded-full border-2 border-indigo-400 flex items-center justify-center text-[10px] font-bold text-indigo-300">
                                {topic.number}
                              </div>
                            ) : (
                              <Lock className="w-4 h-4 text-slate-500 mt-0.5" />
                            )}
                          </span>

                          <div className="min-w-0">
                            <div className="text-xs font-bold truncate">{t(topic.title)}</div>
                            <div className="text-[11px] text-slate-400 truncate mt-0.5">
                              {t(topic.subtitle)}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                              <span>~{topic.estimatedMinutes}m</span>
                              <span>•</span>
                              <span className="text-amber-400 font-semibold">+{topic.xpReward} XP</span>
                            </div>
                          </div>
                        </div>

                        {isUnlocked ? (
                          <button
                            onClick={() => handleOpenTopic(topic)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1 ${
                              isDone
                                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
                            }`}
                          >
                            <span>{isDone ? 'Review' : 'Start'}</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-500 font-semibold shrink-0">
                            Locked
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SCREEN 3: TOPIC EXPERIENCE (THEORY -> VISUALIZER -> GAME -> TEST)     */}
      {/* ==================================================================== */}
      {viewMode === 'detail' && activeTopic && (
        <div className="space-y-6">
          {/* Header Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <button
                  onClick={handleBackToTopics}
                  className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-bold transition-colors cursor-pointer mb-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to {t(activeModule.title)} Topics</span>
                </button>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  {t(activeTopic.title)}
                </h2>
                <p className="text-xs text-slate-300">{t(activeTopic.subtitle)}</p>
              </div>

              {/* Topic meta badge */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="text-xs text-slate-400">~{activeTopic.estimatedMinutes} Mins</span>
                <span className="text-slate-500">•</span>
                <span className="text-xs text-amber-400 font-bold">+{activeTopic.xpReward} XP</span>
              </div>
            </div>

            {/* 4-Stage Stepper Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'theory', label: { en: '1. Theory', hi: '१. थ्योरी', mr: '१. सिद्धांत' }, icon: BookOpen },
                { id: 'visualizer', label: { en: '2. Visualizer', hi: '२. दृश्य', mr: '२. दृश्य' }, icon: BarChart3 },
                { id: 'minigame', label: { en: '3. Mini-Game', hi: '३. मिनी-गेम', mr: '३. मिनी-गेम' }, icon: Gamepad2 },
                { id: 'test', label: { en: '4. Test', hi: '४. टेस्ट', mr: '४. चाचणी' }, icon: Award },
              ].map((stage) => {
                const isCurrent = activeStage === stage.id;
                const IconComponent = stage.icon;

                return (
                  <button
                    key={stage.id}
                    onClick={() => {
                      soundEffects.click();
                      setActiveStage(stage.id as StageType);
                    }}
                    className={`p-3 rounded-2xl border text-center transition-all flex items-center justify-center gap-2 text-xs font-bold cursor-pointer ${
                      isCurrent
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/20'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{stage.label[language] || stage.label.en}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STAGE 1: THEORY */}
          {activeStage === 'theory' && activeTopic.theory && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
              {/* Introduction */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider">
                  <Lightbulb className="w-4 h-4" />
                  <span>Introduction & Why It Matters</span>
                </div>
                <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
                  {activeTopic.theory[language]?.introduction || activeTopic.theory.en.introduction}
                </p>
              </div>

              {/* Core Concepts */}
              <div className="space-y-3 pt-2">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Key Concepts
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {(activeTopic.theory[language]?.coreConcepts || activeTopic.theory.en.coreConcepts).map(
                    (concept, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5"
                      >
                        <h4 className="text-sm font-bold text-indigo-300 flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-indigo-900/60 text-indigo-300 flex items-center justify-center text-xs">
                            {idx + 1}
                          </span>
                          {concept.heading}
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                          {concept.body}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Real World Example */}
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-800/40 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Real Indian Market Case</span>
                </div>
                <p className="text-xs sm:text-sm text-emerald-200 leading-relaxed">
                  {activeTopic.theory[language]?.realWorldExample || activeTopic.theory.en.realWorldExample}
                </p>
              </div>

              {/* Formulas (if any) */}
              {(activeTopic.theory[language]?.formulas || activeTopic.theory.en.formulas) && (
                <div className="space-y-2 pt-1">
                  <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    Calculations & Formula
                  </div>
                  {(activeTopic.theory[language]?.formulas || activeTopic.theory.en.formulas)!.map(
                    (item, fIdx) => (
                      <div
                        key={fIdx}
                        className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/30 space-y-1"
                      >
                        <div className="text-xs font-semibold text-amber-300">{item.name}</div>
                        <div className="font-mono text-xs text-white bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                          {item.formula}
                        </div>
                        <p className="text-[11px] text-slate-400">{item.explanation}</p>
                      </div>
                    )
                  )}
                </div>
              )}

              {/* Bottom Step Forward */}
              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => {
                    soundEffects.click();
                    setActiveStage('visualizer');
                  }}
                  className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Next: Watch Visualizer</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STAGE 2: VISUALIZER */}
          {activeStage === 'visualizer' && activeTopic.visualizer && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {t(activeTopic.visualizer.title)}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Step {visualizerStepIndex + 1} of {activeTopic.visualizer.steps.length}
                  </p>
                </div>

                <button
                  onClick={() => setIsPlayingVisualizer(!isPlayingVisualizer)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                    isPlayingVisualizer ? 'bg-amber-600 text-white' : 'bg-indigo-600 text-white'
                  }`}
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{isPlayingVisualizer ? 'Pause' : 'Auto Play'}</span>
                </button>
              </div>

              {/* Animated Display Area */}
              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 min-h-[220px] flex flex-col justify-between space-y-4">
                <div className="flex items-center gap-1.5">
                  {activeTopic.visualizer.steps.map((_, sIdx) => (
                    <button
                      key={sIdx}
                      onClick={() => setVisualizerStepIndex(sIdx)}
                      className={`h-1.5 flex-1 rounded-full transition-all ${
                        sIdx === visualizerStepIndex
                          ? 'bg-indigo-400'
                          : sIdx < visualizerStepIndex
                          ? 'bg-indigo-800'
                          : 'bg-slate-800'
                      }`}
                    />
                  ))}
                </div>

                <div className="text-center py-6 space-y-3">
                  <div className="text-base sm:text-lg font-bold text-white">
                    {t(activeTopic.visualizer.steps[visualizerStepIndex]?.title)}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
                    {t(activeTopic.visualizer.steps[visualizerStepIndex]?.description)}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => setVisualizerStepIndex((prev) => Math.max(0, prev - 1))}
                    disabled={visualizerStepIndex === 0}
                    className="px-3 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-300 disabled:opacity-40"
                  >
                    Previous Step
                  </button>
                  <button
                    onClick={() =>
                      setVisualizerStepIndex((prev) =>
                        Math.min(activeTopic.visualizer.steps.length - 1, prev + 1)
                      )
                    }
                    disabled={visualizerStepIndex >= activeTopic.visualizer.steps.length - 1}
                    className="px-3 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-300 disabled:opacity-40"
                  >
                    Next Step
                  </button>
                </div>
              </div>

              {/* Bottom Nav */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => setActiveStage('theory')}
                  className="px-4 py-2 rounded-xl border border-slate-800 text-xs text-slate-400 hover:text-white"
                >
                  Back to Theory
                </button>
                <button
                  onClick={() => {
                    soundEffects.click();
                    setActiveStage('minigame');
                  }}
                  className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Next: Play Mini-Game</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STAGE 3: MINI-GAME */}
          {activeStage === 'minigame' && activeTopic.miniGame && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                  <Gamepad2 className="w-4 h-4" />
                  <span>Hands-on Activity</span>
                </div>
                <h3 className="text-xl font-bold text-white mt-1">
                  {t(activeTopic.miniGame.title)}
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  {t(activeTopic.miniGame.instructions)}
                </p>
              </div>

              {/* Mini-Game Interaction Box */}
              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                {activeTopic.miniGame.type === 'SLIDER_SIMULATION' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Monthly Investment (₹)</span>
                          <span className="font-mono text-indigo-300 font-bold">
                            ₹{miniGameInputs.monthly || 5000}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="1000"
                          max="25000"
                          step="1000"
                          value={miniGameInputs.monthly || 5000}
                          onChange={(e) =>
                            setMiniGameInputs((prev) => ({ ...prev, monthly: Number(e.target.value) }))
                          }
                          className="w-full accent-indigo-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Annual Return (%)</span>
                          <span className="font-mono text-emerald-400 font-bold">
                            {miniGameInputs.rate || 12}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="6"
                          max="18"
                          step="1"
                          value={miniGameInputs.rate || 12}
                          onChange={(e) =>
                            setMiniGameInputs((prev) => ({ ...prev, rate: Number(e.target.value) }))
                          }
                          className="w-full accent-emerald-500"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => handleMiniGameAction('SLIDER_SIMULATION')}
                      className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Calculate Results</span>
                    </button>

                    {miniGameResult && (
                      <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-800/60 grid grid-cols-2 gap-3 text-center text-xs">
                        <div>
                          <div className="text-[10px] text-slate-400">Invested</div>
                          <div className="font-bold text-white font-mono mt-0.5">
                            ₹{miniGameResult.totalInvested?.toLocaleString('en-IN')}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400">Future Wealth</div>
                          <div className="font-bold text-emerald-400 font-mono mt-0.5">
                            ₹{miniGameResult.futureNominal?.toLocaleString('en-IN')}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTopic.miniGame.type === 'DECISION_CHOICE' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 gap-2">
                      {activeTopic.miniGame.data?.choices?.map((choice: any, cIdx: number) => {
                        const isSelected = miniGameInputs.selectedChoiceIndex === cIdx;
                        return (
                          <button
                            key={cIdx}
                            onClick={() => {
                              setMiniGameInputs({ selectedChoiceIndex: cIdx });
                              handleMiniGameAction('DECISION_CHOICE', cIdx);
                            }}
                            className={`p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                              isSelected
                                ? choice.isOptimal
                                  ? 'bg-emerald-950 border-emerald-500 text-white'
                                  : 'bg-rose-950 border-rose-500 text-white'
                                : 'bg-slate-900 border-slate-800 text-slate-300'
                            }`}
                          >
                            <span>{choice.text?.[language] || choice.text?.en}</span>
                            {isSelected && (
                              <span>{choice.isOptimal ? '✓ Correct' : '✗ Try again'}</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {activeTopic.miniGame.type === 'ORDER_TICKET' && (
                  <div className="space-y-3 max-w-sm mx-auto">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Quantity</label>
                      <input
                        type="number"
                        value={miniGameInputs.quantity || 10}
                        onChange={(e) =>
                          setMiniGameInputs((prev) => ({ ...prev, quantity: Number(e.target.value) }))
                        }
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <button
                      onClick={() => handleMiniGameAction('ORDER_TICKET', miniGameInputs)}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                    >
                      Execute Trade
                    </button>
                    {miniGameResult && (
                      <div className="p-3 rounded-xl bg-emerald-950 border border-emerald-800 text-xs text-emerald-300 text-center font-bold">
                        Trade Executed at ₹{miniGameResult.totalValue}!
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Nav */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => setActiveStage('visualizer')}
                  className="px-4 py-2 rounded-xl border border-slate-800 text-xs text-slate-400 hover:text-white"
                >
                  Back to Visualizer
                </button>
                <button
                  onClick={() => {
                    soundEffects.click();
                    setActiveStage('test');
                  }}
                  className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Next: Take Test</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STAGE 4: TEST */}
          {activeStage === 'test' && activeTopic.test && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-xl font-bold text-white">Topic Knowledge Test</h3>
                  <p className="text-xs text-slate-400">
                    Pass with {activeTopic.test.passingScorePercent || 70}% to complete this topic and unlock the next!
                  </p>
                </div>
                {isTopicCompleted(activeTopic.id) && (
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-3 py-1 rounded-full">
                    Completed ✓
                  </span>
                )}
              </div>

              <div className="space-y-4">
                {activeTopic.test.questions.map((q, qIdx) => {
                  const selectedOption = testAnswers[q.id];

                  return (
                    <div
                      key={q.id}
                      className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3"
                    >
                      <div className="text-xs sm:text-sm font-semibold text-white">
                        {qIdx + 1}. {q.question[language] || q.question.en}
                      </div>

                      <div className="grid grid-cols-1 gap-2 pt-1">
                        {q.options.map((opt, oIdx) => {
                          const isSelected = selectedOption === oIdx;
                          let btnStyle = 'bg-slate-900 border-slate-800 text-slate-300';
                          if (testSubmitted) {
                            if (opt.isCorrect) btnStyle = 'bg-emerald-950 border-emerald-500 text-emerald-200';
                            else if (isSelected) btnStyle = 'bg-rose-950 border-rose-500 text-rose-200';
                          } else if (isSelected) {
                            btnStyle = 'bg-indigo-600/30 border-indigo-500 text-white font-semibold';
                          }

                          return (
                            <button
                              key={oIdx}
                              disabled={testSubmitted}
                              onClick={() => handleTestOptionSelect(q.id, oIdx)}
                              className={`p-3 rounded-xl border text-left text-xs transition-all ${btnStyle}`}
                            >
                              {opt.text[language] || opt.text.en}
                            </button>
                          );
                        })}
                      </div>

                      {testSubmitted && selectedOption !== undefined && (
                        <div className="text-xs text-slate-300 pt-1">
                          {q.options[selectedOption]?.explanation?.[language] ||
                            q.options[selectedOption]?.explanation?.en}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Test summary banner */}
              {testSubmitted && testScorePercent !== null && (
                <div
                  className={`p-5 rounded-2xl border text-center space-y-2 ${
                    testScorePercent >= (activeTopic.test.passingScorePercent || 70)
                      ? 'bg-emerald-950/40 border-emerald-500/60'
                      : 'bg-amber-950/40 border-amber-500/60'
                  }`}
                >
                  <div className="text-2xl font-black text-white">{testScorePercent}%</div>
                  <p className="text-xs font-semibold text-slate-200">
                    {testScorePercent >= (activeTopic.test.passingScorePercent || 70)
                      ? `Passed! You earned +${activeTopic.xpReward} XP!`
                      : 'Review the topics and try again!'}
                  </p>
                  <div className="flex justify-center gap-3 pt-2">
                    <button
                      onClick={handleTestRetry}
                      className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-white"
                    >
                      Retry
                    </button>
                    {testScorePercent >= (activeTopic.test.passingScorePercent || 70) && nextTopic && (
                      <button
                        onClick={handleNextTopic}
                        className="px-5 py-2 rounded-xl bg-emerald-600 text-xs font-bold text-white shadow-lg flex items-center gap-1.5"
                      >
                        <span>Next Topic: {t(nextTopic.title)}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {!testSubmitted && (
                <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                  <button
                    onClick={() => setActiveStage('minigame')}
                    className="px-4 py-2 rounded-xl border border-slate-800 text-xs text-slate-400 hover:text-white"
                  >
                    Back to Mini-Game
                  </button>
                  <button
                    onClick={handleTestSubmit}
                    disabled={Object.keys(testAnswers).length < activeTopic.test.questions.length}
                    className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>Submit & Claim XP</span>
                    <Award className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* 4. AI CARTOON GUIDE (BULLI THE STOCK MENTOR)                        */}
      {/* ==================================================================== */}
      <AICartoonGuide
        message={guideState.message}
        mood={guideState.mood}
        language={language}
        actionText={guideState.actionText}
        onActionClick={guideState.onActionClick}
      />

      {/* ==================================================================== */}
      {/* 5. RESET CONFIRMATION MODAL                                          */}
      {/* ==================================================================== */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5 text-rose-400">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <h3 className="text-base font-bold text-white">Reset Learning Progress?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              This will reset your completed course topics to 0% so you can start fresh from Module 1.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-800 text-xs text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetLearningProgress();
                  setShowResetModal(false);
                  setViewMode('modules');
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-lg"
              >
                Yes, Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

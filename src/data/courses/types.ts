export type CourseLanguage = 'en' | 'hi' | 'mr';

export type StageType = 'theory' | 'visualizer' | 'minigame' | 'test';

export interface LocalizedText {
  en: string;
  hi: string;
  mr: string;
}

export interface CourseTheoryContent {
  introduction: string;
  coreConcepts: {
    heading: string;
    body: string;
  }[];
  realWorldExample: string;
  formulas?: {
    name: string;
    formula: string;
    explanation: string;
  }[];
}

export interface CourseVisualizer {
  title: LocalizedText;
  steps: {
    title: LocalizedText;
    description: LocalizedText;
  }[];
}

export interface CourseMiniGame {
  type: 'SLIDER_SIMULATION' | 'DECISION_CHOICE' | 'ORDER_TICKET' | 'CANDLE_FORGE';
  title: LocalizedText;
  instructions: LocalizedText;
  data?: {
    choices?: {
      text: LocalizedText;
      isOptimal: boolean;
      feedback: LocalizedText;
    }[];
  };
}

export interface CourseTestQuestion {
  id: string;
  question: LocalizedText;
  options: {
    text: LocalizedText;
    isCorrect: boolean;
    explanation?: LocalizedText;
  }[];
}

export interface CourseTopic {
  id: string;
  moduleId: 'basic' | 'intermediate' | 'advanced';
  unitId: string;
  number: number;
  title: LocalizedText;
  subtitle: LocalizedText;
  estimatedMinutes: number;
  xpReward: number;
  theory: Record<CourseLanguage, CourseTheoryContent>;
  visualizer: CourseVisualizer;
  miniGame: CourseMiniGame;
  test: {
    passingScorePercent: number;
    questions: CourseTestQuestion[];
  };
}

export interface CourseUnit {
  id: string;
  unitNumber: number;
  title: LocalizedText;
  description: LocalizedText;
  topics: CourseTopic[];
}

export interface CourseModule {
  id: 'basic' | 'intermediate' | 'advanced';
  title: LocalizedText;
  description: LocalizedText;
  units: CourseUnit[];
}

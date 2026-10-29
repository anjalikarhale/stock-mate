import React, { useState } from 'react';
import { Volume2, ChevronDown, ChevronUp, Sparkles, MessageCircle } from 'lucide-react';
import { CourseLanguage } from '../../data/courses/types';
import { soundEffects } from '../../utils/audio';

export type GuideMood = 'happy' | 'cheering' | 'thinking' | 'pointing' | 'celebrating';

interface AICartoonGuideProps {
  message: {
    en: string;
    hi: string;
    mr: string;
  };
  mood?: GuideMood;
  language: CourseLanguage;
  actionText?: {
    en: string;
    hi: string;
    mr: string;
  };
  onActionClick?: () => void;
}

export const AICartoonGuide: React.FC<AICartoonGuideProps> = ({
  message,
  mood = 'happy',
  language,
  actionText,
  onActionClick,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const textToRead = message[language] || message.en;

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) return;
    soundEffects.click();
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToRead);
    if (language === 'hi') {
      utterance.lang = 'hi-IN';
    } else if (language === 'mr') {
      utterance.lang = 'mr-IN';
    } else {
      utterance.lang = 'en-US';
    }
    utterance.rate = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const getGuideName = () => {
    if (language === 'hi') return 'बूली AI मेंटर';
    if (language === 'mr') return 'बुली AI मार्गदर्शक';
    return 'Bulli AI Mentor';
  };

  return (
    <aside aria-label="AI Cartoon Mentor Guide" className="fixed bottom-4 right-4 z-40 max-w-sm sm:max-w-md w-[calc(100%-2rem)] sm:w-auto transition-all duration-300">
      <div className="bg-slate-900/95 backdrop-blur-md border-2 border-indigo-500/50 rounded-3xl p-4 shadow-2xl flex items-start gap-3.5 relative overflow-hidden group">
        {/* Soft background ambient glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none" />

        {/* ================================================================ */}
        {/* ANIMATED CARTOON MASCOT (SVG BULL "BULLI")                        */}
        {/* ================================================================ */}
        <div className="shrink-0 relative">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-amber-600 p-1 flex items-center justify-center shadow-lg transform transition-transform hover:scale-105 active:scale-95 animate-bounce-subtle">
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full drop-shadow-md"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Bull Horns */}
              <path
                d="M18 36 C10 24, 18 10, 30 14 C28 22, 28 28, 32 34 Z"
                fill="#FBBF24"
                stroke="#D97706"
                strokeWidth="2"
              />
              <path
                d="M82 36 C90 24, 82 10, 70 14 C72 22, 72 28, 68 34 Z"
                fill="#FBBF24"
                stroke="#D97706"
                strokeWidth="2"
              />

              {/* Head Body */}
              <ellipse cx="50" cy="52" rx="34" ry="30" fill="#3B82F6" />
              <ellipse cx="50" cy="50" rx="32" ry="28" fill="#60A5FA" />

              {/* Cheeks */}
              <circle cx="28" cy="58" r="5" fill="#F472B6" opacity="0.6" />
              <circle cx="72" cy="58" r="5" fill="#F472B6" opacity="0.6" />

              {/* Snout */}
              <ellipse cx="50" cy="62" rx="20" ry="14" fill="#FDE68A" stroke="#F59E0B" strokeWidth="2" />
              <circle cx="44" cy="61" r="2.5" fill="#78350F" />
              <circle cx="56" cy="61" r="2.5" fill="#78350F" />
              {/* Smile */}
              <path
                d="M42 67 Q50 73 58 67"
                stroke="#78350F"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />

              {/* Expressive Eyes */}
              {mood === 'cheering' || mood === 'celebrating' ? (
                // Happy curved eyes
                <>
                  <path d="M34 44 Q40 38 46 44" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" fill="none" />
                  <path d="M54 44 Q60 38 66 44" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" fill="none" />
                </>
              ) : (
                // Big cartoon eyes with sparkling reflections
                <>
                  <circle cx="40" cy="42" r="7" fill="#FFFFFF" />
                  <circle cx="41" cy="42" r="4.5" fill="#1E293B" />
                  <circle cx="39" cy="40" r="1.8" fill="#FFFFFF" />

                  <circle cx="60" cy="42" r="7" fill="#FFFFFF" />
                  <circle cx="61" cy="42" r="4.5" fill="#1E293B" />
                  <circle cx="59" cy="40" r="1.8" fill="#FFFFFF" />
                </>
              )}

              {/* Tiny Graduation / Trader Cap */}
              <path d="M32 26 L50 18 L68 26 L50 32 Z" fill="#1E1B4B" stroke="#818CF8" strokeWidth="1.5" />
              <polygon points="50,18 50,30 46,28" fill="#4338CA" />
              <path d="M68 26 L72 36" stroke="#FBBF24" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="72" cy="37" r="2" fill="#FBBF24" />
            </svg>
          </div>

          {/* Status pulse badge */}
          <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-slate-900" />
          </span>
        </div>

        {/* ================================================================ */}
        {/* SPEECH BUBBLE & GUIDANCE CONTENT                                 */}
        {/* ================================================================ */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-amber-400 tracking-wide">
                {getGuideName()}
              </span>
              <span className="text-[10px] text-indigo-300 bg-indigo-950 px-1.5 py-0.5 rounded-md font-mono border border-indigo-800/60">
                LIVE GUIDE
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleSpeak}
                className={`p-1 rounded-lg text-xs transition-colors ${
                  isSpeaking
                    ? 'text-amber-400 bg-amber-950/60'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title={isSpeaking ? 'Stop voice' : 'Listen with voice'}
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title={isMinimized ? 'Expand guide' : 'Minimize guide'}
              >
                {isMinimized ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {!isMinimized ? (
            <div className="space-y-2">
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                {textToRead}
              </p>

              {actionText && onActionClick && (
                <button
                  onClick={() => {
                    soundEffects.click();
                    onActionClick();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>{actionText[language] || actionText.en}</span>
                </button>
              )}
            </div>
          ) : (
            <div className="text-[11px] text-slate-400 truncate cursor-pointer" onClick={() => setIsMinimized(false)}>
              {textToRead}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

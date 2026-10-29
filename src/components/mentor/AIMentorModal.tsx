import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  X,
  Minus,
  Send,
  Sparkles,
  RotateCcw,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { soundEffects } from '../../utils/audio';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  isFallback?: boolean;
}

export const AIMentorModal: React.FC = () => {
  const {
    isAIMentorOpen,
    setAIMentorOpen,
    isAIMentorMinimized,
    setAIMentorMinimized,
    profile,
    mentorContext,
    aiMentorInitialPrompt,
    clearAIMentorInitialPrompt,
  } = useGame();

  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'init-1',
      role: 'model',
      text: `Namaste! I am Arya, your Indian Stock Market Socratic Mentor.\n\nAsk me about any of the 16 curriculum modules (NSE/BSE plumbing, P/E vs ROCE, DCF/DDM, candlesticks, Price + OI, Option Greeks, or position sizing). I never give stock tips—we reason from rules and risk!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAIMentorOpen && !isAIMentorMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isAIMentorOpen, isAIMentorMinimized]);

  useEffect(() => {
    if (isAIMentorOpen && aiMentorInitialPrompt) {
      const prompt = aiMentorInitialPrompt;
      clearAIMentorInitialPrompt();
      setAIMentorMinimized(false);
      handleSendMessage(prompt);
    }
  }, [isAIMentorOpen, aiMentorInitialPrompt]);

  const quickPrompts = [
    mentorContext.activeModuleTitle
      ? `Quiz me on ${mentorContext.activeModuleTitle}`
      : 'Explain T+1 settlement & CDSL/NSDL',
    'How do I calculate Position Size = Max Loss / (Entry - Stop)?',
    'Why did 93% of retail F&O traders lose money in SEBI’s study?',
    'Difference between ROE and ROCE with debt?',
  ];

  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputMessage).trim();
    if (!textToSend || loading) return;

    soundEffects.click();
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputMessage('');
    setLoading(true);
    setStatusNotice(null);

    try {
      const response = await fetch('/api/ai/mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          context: {
            level: profile.level,
            cash: profile.virtualCash,
            completedModulesCount: (profile.completedModules || []).length,
            activeTab: mentorContext.currentTab,
            activeModuleTitle: mentorContext.activeModuleTitle,
            activeLessonTitle: mentorContext.activeLessonTitle,
            selectedSymbol: mentorContext.selectedSymbol,
            tradingMode: mentorContext.tradingMode,
            mistakes: profile.mistakes,
          },
          chatHistory: messages.slice(-8).map((m) => ({ role: m.role, text: m.text })),
        }),
      });

      const data = await response.json();
      if (data.notice) {
        setStatusNotice(data.notice);
      }

      const modelMsg: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        text:
          data.reply ||
          'Let us examine the risk, invalidation level, and underlying cash flows step by step.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isFallback: Boolean(data.aiConfigured === false || data.fallback),
      };

      setMessages((prev) => [...prev, modelMsg]);
    } catch {
      setStatusNotice('Mentor service unreachable right now—showing offline curriculum guidance.');
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'model',
          text: 'Offline Study Tip: Before placing any paper trade, check (1) Market structure & S/R zone, (2) Hard invalidation Stop-Loss, and (3) Position Size = Max ₹ Risk ÷ (Entry − Stop).',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isFallback: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `reset-${Date.now()}`,
        role: 'model',
        text: 'Chat cleared! Which Indian market module, chart setup, or valuation formula should we explore next?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setStatusNotice(null);
  };

  // 1. CLOSED STATE: Compact Floating Bottom-Right Launcher Button
  if (!isAIMentorOpen) {
    return (
      <button
        type="button"
        onClick={() => {
          soundEffects.click();
          setAIMentorMinimized(false);
          setAIMentorOpen(true);
        }}
        aria-label="Open Arya Market Mentor"
        className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 inline-flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-indigo-950/60 border border-indigo-400/40 transition-transform hover:scale-[1.02] cursor-pointer"
      >
        <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
        <span>Ask Arya</span>
      </button>
    );
  }

  // 2. MINIMIZED DOCK BAR STATE (Non-blocking)
  if (isAIMentorMinimized) {
    return (
      <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 w-72 rounded-2xl bg-slate-900 border border-indigo-500/40 shadow-2xl px-4 py-3 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setAIMentorMinimized(false)}
          className="flex items-center gap-2 text-left flex-1 cursor-pointer"
        >
          <MessageSquare className="w-4 h-4 text-indigo-400 shrink-0" />
          <div className="truncate">
            <div className="text-xs font-bold text-white truncate">Arya — Market Mentor</div>
            <div className="text-[10px] text-slate-400">Click to expand chat</div>
          </div>
        </button>
        <button
          type="button"
          onClick={() => setAIMentorOpen(false)}
          aria-label="Close Mentor"
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // 3. OPEN NON-BLOCKING COMPACT PANEL (~380px wide on desktop, constrained height)
  return (
    <aside
      aria-label="Arya Market Mentor Chat"
      className="fixed bottom-20 md:bottom-6 right-3 sm:right-6 z-40 w-[calc(100vw-1.5rem)] sm:w-[390px] max-h-[min(560px,calc(100vh-7rem))] bg-slate-900/98 border border-slate-700/90 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
    >
      {/* Compact Header */}
      <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center shrink-0">
            <Bot className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-black text-white truncate">
              Arya — Socratic Mentor
            </h3>
            <p className="text-[10px] text-slate-400 truncate">
              {mentorContext.currentTab === 'TRADE' && mentorContext.selectedSymbol
                ? `Context: ${mentorContext.selectedSymbol} (${mentorContext.tradingMode || 'EQUITY'})`
                : mentorContext.activeModuleTitle || '16-Module NSE/BSE Tutor • No Tips'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={handleClearHistory}
            title="Reset conversation"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setAIMentorMinimized(true)}
            title="Minimize panel"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setAIMentorOpen(false)}
            title="Close panel"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Missing API Key / Fallback Notice */}
      {statusNotice && (
        <div className="px-3.5 py-2 bg-amber-500/10 border-b border-amber-500/30 flex items-center gap-2 text-[11px] text-amber-200 shrink-0">
          <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="truncate">{statusNotice}</span>
        </div>
      )}

      {/* Scrollable Message History */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3 min-h-[220px]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-sm font-medium'
                  : 'bg-slate-950 text-slate-200 border border-slate-800 rounded-bl-sm'
              }`}
            >
              {msg.text}
            </div>
            <span className="text-[10px] text-slate-500 mt-0.5 font-mono px-1">
              {msg.timestamp}
            </span>
          </div>
        ))}

        {loading && (
          <div className="inline-flex items-center gap-2 text-indigo-300 text-xs px-3 py-2 bg-slate-950 rounded-xl border border-slate-800">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            <span>Thinking through market concepts...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Chips */}
      <div className="px-3 py-2 bg-slate-950/90 border-t border-slate-800 overflow-x-auto flex gap-1.5 shrink-0">
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            disabled={loading}
            onClick={() => handleSendMessage(prompt)}
            className="text-[10px] whitespace-nowrap px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-indigo-950/70 text-slate-300 hover:text-indigo-200 border border-slate-800 cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-2.5 bg-slate-950 border-t border-slate-800 flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          placeholder="Ask about modules, ratios, charts, options..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          disabled={loading}
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 placeholder:text-slate-500"
        />
        <button
          type="submit"
          disabled={!inputMessage.trim() || loading}
          aria-label="Send message"
          className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </aside>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  X,
  Send,
  Sparkles,
  HelpCircle,
  BrainCircuit,
  MessageSquare,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { soundEffects } from '../../utils/audio';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export const AIMentorModal: React.FC = () => {
  const { isAIMentorOpen, setAIMentorOpen, profile, aiMentorInitialPrompt, clearAIMentorInitialPrompt } = useGame();

  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'model',
      text: `Greetings, **${profile.username}**! I am **Arya**, your Socratic Market Mentor.

I am here to guide your journey from **Level 1 Market Newbie** to **Level 11 Market Master**. I will challenge your assumptions and help you reason like a disciplined market practitioner.

What market concept, trade setup, or risk dilemma would you like to investigate together?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAIMentorOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isAIMentorOpen]);

  // If opened with a specific prompt (e.g. from chart analysis or mistake breakdown), auto-send
  useEffect(() => {
    if (isAIMentorOpen && aiMentorInitialPrompt) {
      const prompt = aiMentorInitialPrompt;
      clearAIMentorInitialPrompt();
      handleSendMessage(prompt);
    }
  }, [isAIMentorOpen, aiMentorInitialPrompt]);

  if (!isAIMentorOpen) return null;

  const quickPrompts = [
    'Why is a 1:2 Risk-to-Reward ratio critical?',
    'What does a Hammer candle with a long lower shadow indicate?',
    'How does inflation destroy uninvested idle cash?',
    'How do I overcome FOMO when a stock shoots up 10%?'
  ];

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage.trim();
    if (!textToSend || loading) return;

    soundEffects.click();
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai/mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          context: {
            level: profile.level,
            cash: profile.virtualCash,
            mistakes: profile.mistakes,
          },
          chatHistory: messages.map(m => ({ role: m.role, text: m.text })),
        }),
      });

      const data = await response.json();
      const aiReply = data.reply || "Let's examine the underlying supply and demand dynamics together.";

      const modelMsg: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        text: aiReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, modelMsg]);
      soundEffects.correct();
    } catch (err) {
      const fallbackMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        text: `### 📈 Socratic Wisdom
Remember the golden rule of trading: *Never risk more than 2% of your virtual ₹1,00,000 on a single idea.* What is your stop loss plan before you execute?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl flex flex-col h-[600px] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-teal-500 p-0.5 flex items-center justify-center shadow-lg shadow-indigo-950/40">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Bot className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white text-base">Arya — Socratic Market Mentor</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Gemini AI
                </span>
              </div>
              <p className="text-xs text-slate-400">Guiding reasoning & discipline • No stock tips</p>
            </div>
          </div>

          <button
            onClick={() => setAIMentorOpen(false)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 scrollbar-thin">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-950/30 font-medium'
                    : 'bg-slate-950 text-slate-200 border border-slate-800 rounded-bl-none shadow-inner'
                }`}
              >
                {msg.text}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 font-mono px-1">
                {msg.timestamp}
              </span>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold p-3 bg-slate-950/60 rounded-2xl border border-slate-800 w-fit animate-pulse">
              <Sparkles className="w-4 h-4" />
              <span>Arya is formulating a Socratic inquiry...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts Bar */}
        <div className="px-4 py-2 bg-slate-950/90 border-t border-slate-800 overflow-x-auto flex gap-2 scrollbar-none">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              disabled={loading}
              onClick={() => handleSendMessage(prompt)}
              className="text-[11px] whitespace-nowrap px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-indigo-950/60 text-slate-300 hover:text-indigo-300 border border-slate-800 hover:border-indigo-500/40 transition-colors font-medium"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask Arya about price action, risk rules, or financial ratios..."
            value={inputMessage}
            onChange={e => setInputMessage(e.target.value)}
            disabled={loading}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500 placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || loading}
            className="p-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-md disabled:opacity-50 transition-transform active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

import React from 'react';

interface QuizQuestionVisualProps {
  visualType?: 'none' | 'trend_up' | 'trend_down' | 'trend_sideways' | 'doji' | 'hammer' | 'higher_highs' | 'lower_lows';
  visualData?: any;
}

export const QuizQuestionVisual: React.FC<QuizQuestionVisualProps> = ({ visualType }) => {
  if (!visualType || visualType === 'none') {
    return null;
  }

  return (
    <div className="w-full flex justify-center my-3 sm:my-4">
      <div className="w-full max-w-sm sm:max-w-md bg-slate-950/80 rounded-2xl border border-slate-800/90 p-3 sm:p-4 shadow-inner flex flex-col items-center">
        {visualType === 'trend_up' && (
          <div className="w-full">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2 px-2">
              <span className="text-emerald-400 font-bold">Step 1: ₹100</span>
              <span>→ ₹105</span>
              <span>→ ₹110</span>
              <span className="text-emerald-400 font-bold">Step 4: ₹115</span>
            </div>
            <svg viewBox="0 0 320 120" className="w-full h-28 sm:h-32 overflow-visible">
              <defs>
                <linearGradient id="upGrad" x1="0" y1="1" x2="0" y2="0">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.05" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.3" />
                </linearGradient>
              </defs>
              {/* Grid lines */}
              <line x1="20" y1="100" x2="300" y2="100" stroke="#1e293b" strokeDasharray="3,3" />
              <line x1="20" y1="75" x2="300" y2="75" stroke="#1e293b" strokeDasharray="3,3" />
              <line x1="20" y1="50" x2="300" y2="50" stroke="#1e293b" strokeDasharray="3,3" />
              <line x1="20" y1="25" x2="300" y2="25" stroke="#1e293b" strokeDasharray="3,3" />

              {/* Shaded Area */}
              <polygon points="30,95 110,72 190,48 270,22 270,105 30,105" fill="url(#upGrad)" />

              {/* Line */}
              <path d="M 30 95 L 110 72 L 190 48 L 270 22" fill="none" stroke="#10b981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

              {/* Points */}
              <circle cx="30" cy="95" r="5" fill="#10b981" />
              <text x="30" y="115" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="monospace">₹100</text>

              <circle cx="110" cy="72" r="5" fill="#10b981" />
              <text x="110" y="90" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="monospace">₹105</text>

              <circle cx="190" cy="48" r="5" fill="#10b981" />
              <text x="190" y="66" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="monospace">₹110</text>

              <circle cx="270" cy="22" r="6" fill="#34d399" />
              <text x="270" y="14" textAnchor="middle" fill="#34d399" fontSize="11" fontWeight="bold" fontFamily="monospace">₹115</text>
            </svg>
          </div>
        )}

        {visualType === 'trend_down' && (
          <div className="w-full">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2 px-2">
              <span className="text-rose-400 font-bold">Step 1: ₹115</span>
              <span>→ ₹110</span>
              <span>→ ₹105</span>
              <span className="text-rose-400 font-bold">Step 4: ₹100</span>
            </div>
            <svg viewBox="0 0 320 120" className="w-full h-28 sm:h-32 overflow-visible">
              <defs>
                <linearGradient id="downGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.05" />
                </linearGradient>
              </defs>
              {/* Grid lines */}
              <line x1="20" y1="25" x2="300" y2="25" stroke="#1e293b" strokeDasharray="3,3" />
              <line x1="20" y1="50" x2="300" y2="50" stroke="#1e293b" strokeDasharray="3,3" />
              <line x1="20" y1="75" x2="300" y2="75" stroke="#1e293b" strokeDasharray="3,3" />
              <line x1="20" y1="100" x2="300" y2="100" stroke="#1e293b" strokeDasharray="3,3" />

              {/* Shaded Area */}
              <polygon points="30,22 110,48 190,72 270,95 270,105 30,105" fill="url(#downGrad)" />

              {/* Line */}
              <path d="M 30 22 L 110 48 L 190 72 L 270 95" fill="none" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

              {/* Points */}
              <circle cx="30" cy="22" r="6" fill="#fb7185" />
              <text x="30" y="14" textAnchor="middle" fill="#fb7185" fontSize="11" fontWeight="bold" fontFamily="monospace">₹115</text>

              <circle cx="110" cy="48" r="5" fill="#f43f5e" />
              <text x="110" y="40" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="monospace">₹110</text>

              <circle cx="190" cy="72" r="5" fill="#f43f5e" />
              <text x="190" y="64" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="monospace">₹105</text>

              <circle cx="270" cy="95" r="5" fill="#f43f5e" />
              <text x="270" y="115" textAnchor="middle" fill="#f43f5e" fontSize="10" fontFamily="monospace">₹100</text>
            </svg>
          </div>
        )}

        {visualType === 'trend_sideways' && (
          <div className="w-full">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2 px-2">
              <span className="text-amber-400 font-medium">Upper Bound: ₹102</span>
              <span className="text-slate-500">Fluctuating in range</span>
              <span className="text-amber-400 font-medium">Lower Bound: ₹99</span>
            </div>
            <svg viewBox="0 0 320 120" className="w-full h-28 sm:h-32 overflow-visible">
              {/* Range Bounds */}
              <line x1="20" y1="35" x2="300" y2="35" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4,4" opacity="0.6" />
              <text x="305" y="38" fill="#f59e0b" fontSize="9" fontFamily="monospace">₹102</text>

              <line x1="20" y1="85" x2="300" y2="85" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4,4" opacity="0.6" />
              <text x="305" y="88" fill="#f59e0b" fontSize="9" fontFamily="monospace">₹99</text>

              {/* Oscillating Line */}
              <path
                d="M 30 60 L 70 38 L 120 82 L 170 42 L 220 80 L 270 58"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              <circle cx="30" cy="60" r="4" fill="#38bdf8" />
              <circle cx="70" cy="38" r="4" fill="#38bdf8" />
              <circle cx="120" cy="82" r="4" fill="#38bdf8" />
              <circle cx="170" cy="42" r="4" fill="#38bdf8" />
              <circle cx="220" cy="80" r="4" fill="#38bdf8" />
              <circle cx="270" cy="58" r="4" fill="#38bdf8" />
            </svg>
          </div>
        )}

        {visualType === 'doji' && (
          <div className="w-full flex flex-col items-center">
            <div className="text-xs text-slate-400 font-mono mb-2">Candlestick Structure</div>
            <svg viewBox="0 0 160 140" className="w-36 h-36 overflow-visible">
              {/* Upper Shadow Wick */}
              <line x1="80" y1="20" x2="80" y2="68" stroke="#e2e8f0" strokeWidth="3" strokeLinecap="round" />
              <text x="100" y="24" fill="#94a3b8" fontSize="10" fontFamily="sans-serif">High</text>

              {/* Doji Body: Extremely thin horizontal bar representing Open ≈ Close */}
              <rect x="55" y="68" width="50" height="4" fill="#38bdf8" rx="2" />
              <text x="110" y="73" fill="#38bdf8" fontSize="10" fontWeight="bold" fontFamily="sans-serif">Open ≈ Close</text>

              {/* Lower Shadow Wick */}
              <line x1="80" y1="72" x2="80" y2="120" stroke="#e2e8f0" strokeWidth="3" strokeLinecap="round" />
              <text x="100" y="122" fill="#94a3b8" fontSize="10" fontFamily="sans-serif">Low</text>
            </svg>
          </div>
        )}

        {visualType === 'hammer' && (
          <div className="w-full flex flex-col items-center">
            <div className="text-xs text-slate-400 font-mono mb-2">Candlestick Structure</div>
            <svg viewBox="0 0 180 150" className="w-40 h-40 overflow-visible">
              {/* Very tiny upper shadow (optional) */}
              <line x1="90" y1="20" x2="90" y2="28" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
              <text x="105" y="24" fill="#94a3b8" fontSize="9">Tiny / No upper wick</text>

              {/* Small real body at the top */}
              <rect x="65" y="28" width="50" height="24" fill="#10b981" rx="4" stroke="#34d399" strokeWidth="1.5" />
              <text x="120" y="44" fill="#34d399" fontSize="10" fontWeight="bold">Small real body</text>

              {/* Long lower shadow (≥ 2x body height) */}
              <line x1="90" y1="52" x2="90" y2="135" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" />
              <text x="105" y="95" fill="#10b981" fontSize="10" fontWeight="bold">Long lower shadow (≥ 2x body)</text>
              <text x="105" y="137" fill="#94a3b8" fontSize="9">Low</text>
            </svg>
          </div>
        )}

        {visualType === 'higher_highs' && (
          <div className="w-full">
            <div className="flex items-center justify-between text-xs text-emerald-400 font-mono mb-2 px-2 font-bold">
              <span>HH: Higher High</span>
              <span>HL: Higher Low</span>
            </div>
            <svg viewBox="0 0 320 130" className="w-full h-32 overflow-visible">
              {/* Uptrend Channel Reference */}
              <line x1="25" y1="95" x2="290" y2="35" stroke="#10b981" strokeWidth="1" strokeDasharray="3,3" opacity="0.4" />
              
              {/* Price Swing Line */}
              <path
                d="M 25 105 L 75 60 L 125 85 L 185 40 L 235 65 L 290 20"
                fill="none"
                stroke="#10b981"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* High 1 */}
              <circle cx="75" cy="60" r="4.5" fill="#34d399" />
              <text x="75" y="50" textAnchor="middle" fill="#34d399" fontSize="10" fontWeight="bold">High 1</text>

              {/* Low 1 */}
              <circle cx="125" cy="85" r="4.5" fill="#38bdf8" />
              <text x="125" y="102" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="bold">HL 1</text>

              {/* Higher High 2 */}
              <circle cx="185" cy="40" r="5" fill="#34d399" />
              <text x="185" y="30" textAnchor="middle" fill="#34d399" fontSize="10" fontWeight="bold">HH 2</text>

              {/* Higher Low 2 */}
              <circle cx="235" cy="65" r="4.5" fill="#38bdf8" />
              <text x="235" y="82" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="bold">HL 2</text>

              {/* Higher High 3 */}
              <circle cx="290" cy="20" r="5.5" fill="#34d399" />
              <text x="290" y="12" textAnchor="middle" fill="#34d399" fontSize="11" fontWeight="bold">HH 3</text>
            </svg>
          </div>
        )}

        {visualType === 'lower_lows' && (
          <div className="w-full">
            <div className="flex items-center justify-between text-xs text-rose-400 font-mono mb-2 px-2 font-bold">
              <span>LH: Lower High</span>
              <span>LL: Lower Low</span>
            </div>
            <svg viewBox="0 0 320 130" className="w-full h-32 overflow-visible">
              {/* Downtrend Channel Reference */}
              <line x1="25" y1="35" x2="290" y2="105" stroke="#f43f5e" strokeWidth="1" strokeDasharray="3,3" opacity="0.4" />

              {/* Price Swing Line */}
              <path
                d="M 25 25 L 75 75 L 125 50 L 185 95 L 235 70 L 290 115"
                fill="none"
                stroke="#f43f5e"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* High 1 */}
              <circle cx="25" cy="25" r="4.5" fill="#fb7185" />
              <text x="25" y="15" textAnchor="middle" fill="#fb7185" fontSize="10" fontWeight="bold">High 1</text>

              {/* Lower Low 1 */}
              <circle cx="75" cy="75" r="4.5" fill="#f43f5e" />
              <text x="75" y="92" textAnchor="middle" fill="#f43f5e" fontSize="10" fontWeight="bold">LL 1</text>

              {/* Lower High 1 */}
              <circle cx="125" cy="50" r="5" fill="#fb7185" />
              <text x="125" y="40" textAnchor="middle" fill="#fb7185" fontSize="10" fontWeight="bold">LH 1</text>

              {/* Lower Low 2 */}
              <circle cx="185" cy="95" r="5" fill="#f43f5e" />
              <text x="185" y="112" textAnchor="middle" fill="#f43f5e" fontSize="10" fontWeight="bold">LL 2</text>

              {/* Lower High 2 */}
              <circle cx="235" cy="70" r="4.5" fill="#fb7185" />
              <text x="235" y="60" textAnchor="middle" fill="#fb7185" fontSize="10" fontWeight="bold">LH 2</text>

              {/* Lower Low 3 */}
              <circle cx="290" cy="115" r="5.5" fill="#f43f5e" />
              <text x="290" y="128" textAnchor="middle" fill="#f43f5e" fontSize="11" fontWeight="bold">LL 3</text>
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};

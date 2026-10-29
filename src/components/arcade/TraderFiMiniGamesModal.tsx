import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  DollarSign,
  Award,
  Layers,
  Percent
} from 'lucide-react';
import { soundEffects } from '../../utils/audio';
import { useGame } from '../../context/GameContext';

export type MiniGameId =
  | 'etf-arbitrage'
  | 'card-game'
  | 'dice-market'
  | 'fermi-estimation'
  | 'event-contracts'
  | 'higher-lower'
  | 'betting-board';

interface TraderFiMiniGamesModalProps {
  gameId: MiniGameId;
  onClose: () => void;
}

export const TraderFiMiniGamesModal: React.FC<TraderFiMiniGamesModalProps> = ({
  gameId,
  onClose,
}) => {
  const { addXP, addVirtualCash } = useGame();

  // Common Game State
  const [roundScore, setRoundScore] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [gameFeedback, setGameFeedback] = useState<string | null>(null);

  // -------------------------------------------------------------------------
  // 1. ETF ARBITRAGE GAME STATE
  // -------------------------------------------------------------------------
  const [etfRound, setEtfRound] = useState(1);
  const [etfPrice, setEtfPrice] = useState(250.40);
  const [basketFairValue, setBasketFairValue] = useState(246.10);
  const [etfPnL, setEtfPnL] = useState(0);

  const handleEtfTrade = (action: 'BUY_ETF_SELL_BASKET' | 'SELL_ETF_BUY_BASKET') => {
    soundEffects.cashTrade();
    const spread = etfPrice - basketFairValue;
    let earned = 0;

    if (action === 'SELL_ETF_BUY_BASKET') {
      // ETF is trading above basket fair value -> Sell expensive ETF, Buy cheap basket
      if (spread > 0) {
        earned = Math.round(spread * 100 * 10) / 10;
        setGameFeedback(`Spot-on! The ETF was overpriced by $${spread.toFixed(2)}. You sold the ETF and bought the basket, capturing +$${earned.toFixed(2)} risk-free profit!`);
        soundEffects.correct();
      } else {
        earned = -Math.round(Math.abs(spread) * 100 * 10) / 10;
        setGameFeedback(`Negative edge! The ETF was underpriced, so selling it caused a loss of -$${Math.abs(earned).toFixed(2)}.`);
        soundEffects.wrong();
      }
    } else {
      // Action: BUY_ETF_SELL_BASKET (ETF is underpriced)
      if (spread < 0) {
        earned = Math.round(Math.abs(spread) * 100 * 10) / 10;
        setGameFeedback(`Excellent arbitrage! The ETF was underpriced by $${Math.abs(spread).toFixed(2)}. You bought the ETF and sold the basket, capturing +$${earned.toFixed(2)}!`);
        soundEffects.correct();
      } else {
        earned = -Math.round(spread * 100 * 10) / 10;
        setGameFeedback(`Loss! The ETF was overpriced by $${spread.toFixed(2)}, so buying it caused a loss of -$${Math.abs(earned).toFixed(2)}.`);
        soundEffects.wrong();
      }
    }

    setEtfPnL((prev) => prev + earned);
    if (etfRound >= 3) {
      setGameOver(true);
      addXP(150);
      addVirtualCash(Math.max(500, earned * 10));
    } else {
      setEtfRound((r) => r + 1);
      // Next scenario
      const nextEtf = Math.round((240 + Math.random() * 25) * 100) / 100;
      const nextBasket = Math.round((nextEtf + (Math.random() - 0.5) * 6) * 100) / 100;
      setEtfPrice(nextEtf);
      setBasketFairValue(nextBasket);
    }
  };

  // -------------------------------------------------------------------------
  // 2. CARD GAME (MARKET TAKING) STATE
  // -------------------------------------------------------------------------
  const [cardRevealed, setCardRevealed] = useState(8);
  const [cardHidden1, setCardHidden1] = useState(5);
  const [cardHidden2, setCardHidden2] = useState(7);
  const [cardsShowAll, setCardsShowAll] = useState(false);
  const [cardMarketQuote, setCardMarketQuote] = useState({ bid: 18.5, ask: 20.5 });
  const [cardPnL, setCardPnL] = useState(0);

  const trueSum = cardRevealed + cardHidden1 + cardHidden2;
  const expectedValue = cardRevealed + 5.5 + 5.5; // E[sum] = revealed + 11

  const handleCardTrade = (action: 'BUY' | 'SELL') => {
    soundEffects.cashTrade();
    setCardsShowAll(true);
    let pnl = 0;
    if (action === 'BUY') {
      pnl = Math.round((trueSum - cardMarketQuote.ask) * 20);
    } else {
      pnl = Math.round((cardMarketQuote.bid - trueSum) * 20);
    }

    setCardPnL(pnl);
    if (pnl > 0) {
      soundEffects.correct();
      setGameFeedback(`Winner! True sum was ${trueSum}. You ${action} at ${action === 'BUY' ? cardMarketQuote.ask : cardMarketQuote.bid}. Profit: +$${pnl}!`);
      addXP(120);
    } else {
      soundEffects.wrong();
      setGameFeedback(`Loss! True sum was ${trueSum}. You ${action} at ${action === 'BUY' ? cardMarketQuote.ask : cardMarketQuote.bid}. P&L: -$${Math.abs(pnl)}.`);
    }
    setGameOver(true);
  };

  // -------------------------------------------------------------------------
  // 3. MARKET MAKING DICE GAME STATE
  // -------------------------------------------------------------------------
  const [myBid, setMyBid] = useState(6.4);
  const [myAsk, setMyAsk] = useState(7.6);
  const [diceRollResult, setDiceRollResult] = useState<{ d1: number; d2: number; sum: number } | null>(null);
  const [dicePnL, setDicePnL] = useState(0);

  const handleRollDice = () => {
    soundEffects.click();
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    const sum = d1 + d2;
    setDiceRollResult({ d1, d2, sum });

    // Retail flow: 2 buys at Ask, 2 sells at Bid
    // Net profit = 2 * (myAsk - sum) + 2 * (sum - myBid) = 2 * (myAsk - myBid)
    // If quote was too wide, no volume. If quote was tight, volume filled!
    const spread = myAsk - myBid;
    let earned = 0;
    if (spread < 0) {
      earned = -50;
      setGameFeedback('Crossed market! Your Bid was higher than your Ask, creating an immediate loss.');
      soundEffects.wrong();
    } else if (spread > 3.0) {
      earned = 0;
      setGameFeedback('Quote was too wide! The market went to competing market makers. Zero volume filled.');
    } else {
      // Matched 3 trades on both sides + inventory settlement
      earned = Math.round(spread * 35);
      soundEffects.correct();
      setGameFeedback(`Dice rolled ${sum} (${d1} + ${d2}). You filled 3 contracts on both sides and captured the $${spread.toFixed(2)} spread! Net P&L: +$${earned}!`);
      addXP(140);
    }

    setDicePnL(earned);
    setGameOver(true);
  };

  // -------------------------------------------------------------------------
  // 4. FERMI ESTIMATION GAME STATE
  // -------------------------------------------------------------------------
  const [fermiQuestion] = useState({
    title: 'Daily NSE Transactions',
    prompt: 'How many million shares are traded on the National Stock Exchange of India (NSE) on an average active market day?',
    unit: 'Million Shares',
    trueValue: 3450,
  });
  const [lowerBound, setLowerBound] = useState(2000);
  const [upperBound, setUpperBound] = useState(5000);
  const [fermiScore, setFermiScore] = useState<number | null>(null);

  const handleEvaluateFermi = () => {
    soundEffects.click();
    const inside = fermiQuestion.trueValue >= lowerBound && fermiQuestion.trueValue <= upperBound;
    const range = upperBound - lowerBound;
    if (!inside) {
      setFermiScore(0);
      soundEffects.wrong();
      setGameFeedback(`Missed! The true value is ~${fermiQuestion.trueValue.toLocaleString()} ${fermiQuestion.unit}. Your range [${lowerBound}, ${upperBound}] did not contain the true value.`);
    } else {
      // Score = tighter range yields exponentially higher points
      const precisionBonus = Math.max(10, Math.round(100 - (range / fermiQuestion.trueValue) * 35));
      setFermiScore(precisionBonus);
      soundEffects.correct();
      setGameFeedback(`Direct hit! True value is ${fermiQuestion.trueValue.toLocaleString()} ${fermiQuestion.unit}. Precision score: ${precisionBonus} / 100!`);
      addXP(precisionBonus * 2);
    }
    setGameOver(true);
  };

  // -------------------------------------------------------------------------
  // 5. EVENT CONTRACTS GAME STATE
  // -------------------------------------------------------------------------
  const [eventScenario] = useState({
    question: 'Will the Nifty 50 close above 25,000 this expiry?',
    yesPrice: 42,
    noPrice: 58,
    clues: 'FIIs turned net buyers of ₹2,400 Cr today; Tech earnings beat estimates by 6%.',
    actualOutcome: 'YES',
  });
  const [selectedContract, setSelectedContract] = useState<'YES' | 'NO'>('YES');

  const handleTradeEvent = () => {
    soundEffects.cashTrade();
    const won = selectedContract === eventScenario.actualOutcome;
    if (won) {
      const payout = selectedContract === 'YES' ? 100 - eventScenario.yesPrice : 100 - eventScenario.noPrice;
      soundEffects.correct();
      setGameFeedback(`Contract settled ${eventScenario.actualOutcome} at $100! You paid $${selectedContract === 'YES' ? eventScenario.yesPrice : eventScenario.noPrice} and received $100. Profit: +$${payout}!`);
      addXP(150);
    } else {
      soundEffects.wrong();
      setGameFeedback(`Contract settled ${eventScenario.actualOutcome} at $0. Loss: -$${selectedContract === 'YES' ? eventScenario.yesPrice : eventScenario.noPrice}.`);
    }
    setGameOver(true);
  };

  // -------------------------------------------------------------------------
  // 6. HIGHER OR LOWER GAME STATE
  // -------------------------------------------------------------------------
  const [hlCurrentCard, setHlCurrentCard] = useState(7);
  const [hlNextCard, setHlNextCard] = useState<number | null>(null);
  const [hlStreak, setHlStreak] = useState(0);
  const [hlBankroll, setHlBankroll] = useState(1000);
  const [hlBetSize, setHlBetSize] = useState(100);

  const handleHigherLower = (guess: 'HIGHER' | 'LOWER') => {
    soundEffects.click();
    const nextVal = Math.floor(Math.random() * 13) + 1; // 1 (Ace) to 13 (King)
    setHlNextCard(nextVal);

    const isHigher = nextVal > hlCurrentCard;
    const isLower = nextVal < hlCurrentCard;
    const won = (guess === 'HIGHER' && isHigher) || (guess === 'LOWER' && isLower);

    if (won) {
      soundEffects.correct();
      const nextStreak = hlStreak + 1;
      const profit = Math.round(hlBetSize * (1 + nextStreak * 0.25));
      setHlStreak(nextStreak);
      setHlBankroll((b) => b + profit);
      setGameFeedback(`Correct! Next card is ${nextVal}. +$${profit}! Streak: ${nextStreak}x`);
      setHlCurrentCard(nextVal);
      addXP(50);
    } else {
      soundEffects.wrong();
      setHlBankroll((b) => Math.max(0, b - hlBetSize));
      setHlStreak(0);
      setGameFeedback(`Wrong! Next card was ${nextVal}. Lost $${hlBetSize}.`);
      setGameOver(true);
    }
  };

  // -------------------------------------------------------------------------
  // 7. BETTING BOARD GAME STATE
  // -------------------------------------------------------------------------
  const [bettingBoard] = useState([
    { outcome: 'Player A Wins', odds: 2.15, impliedPct: 46.5 },
    { outcome: 'Draw / Tie', odds: 3.40, impliedPct: 29.4 },
    { outcome: 'Player B Wins', odds: 3.85, impliedPct: 25.9 },
  ]);
  const [totalBookOverround] = useState(101.8); // 101.8% = vig of 1.8%
  const [betSelection, setBetSelection] = useState<number | null>(null);

  const handleEvaluateBet = () => {
    soundEffects.cashTrade();
    if (betSelection === 0) {
      soundEffects.correct();
      setGameFeedback('True fair probability was 50%, but odds 2.15 offered an expected payout of 107.5%! You identified positive expected value (+EV)!');
      addXP(160);
    } else {
      soundEffects.wrong();
      setGameFeedback('Selected line was shaded by the bookmaker with negative expected value. Always compare implied odds against true fair frequency.');
    }
    setGameOver(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#13092b] border border-purple-500/40 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl relative text-slate-100 space-y-6">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-purple-500/20 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-purple-900/60 text-purple-300 text-lg font-bold">
              🎲
            </span>
            <div>
              <h3 className="text-xl font-black text-white capitalize">
                {gameId.replace(/-/g, ' ')}
              </h3>
              <p className="text-xs text-purple-300">TraderFi Interactive Arena</p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEffects.click();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-purple-950 border border-purple-500/40 text-slate-300 hover:text-white flex items-center justify-center text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* ================================================================= */}
        {/* GAME 1: ETF ARBITRAGE                                             */}
        {/* ================================================================= */}
        {gameId === 'etf-arbitrage' && (
          <div className="space-y-5">
            <div className="bg-[#1e0e45] p-4 rounded-2xl border border-purple-500/30 space-y-2">
              <div className="text-xs text-purple-300 font-bold uppercase tracking-wider">
                Market Mispricing Radar (Round {etfRound} / 3)
              </div>
              <div className="grid grid-cols-2 gap-4 text-center pt-1">
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                  <div className="text-[11px] text-slate-400">ETF Market Quote</div>
                  <div className="text-xl font-black text-cyan-300 font-mono mt-0.5">
                    ${etfPrice.toFixed(2)}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                  <div className="text-[11px] text-slate-400">Basket Fair Value (NAV)</div>
                  <div className="text-xl font-black text-emerald-400 font-mono mt-0.5">
                    ${basketFairValue.toFixed(2)}
                  </div>
                </div>
              </div>
              <div className="text-center text-xs text-slate-300 pt-1">
                Spread: <strong className="font-mono text-amber-300">${(etfPrice - basketFairValue).toFixed(2)}</strong> ({etfPrice > basketFairValue ? 'ETF is Overvalued' : 'ETF is Undervalued'})
              </div>
            </div>

            {!gameOver ? (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleEtfTrade('SELL_ETF_BUY_BASKET')}
                  className="py-3 px-4 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-xs shadow-lg cursor-pointer flex flex-col items-center gap-0.5"
                >
                  <span>SELL ETF / BUY BASKET</span>
                  <span className="text-[10px] opacity-80">(ETF Overpriced)</span>
                </button>
                <button
                  onClick={() => handleEtfTrade('BUY_ETF_SELL_BASKET')}
                  className="py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-xs shadow-lg cursor-pointer flex flex-col items-center gap-0.5"
                >
                  <span>BUY ETF / SELL BASKET</span>
                  <span className="text-[10px] opacity-80">(ETF Cheap)</span>
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/60 text-center space-y-2">
                <div className="text-lg font-black text-white">Arbitrage Round Complete!</div>
                <div className="text-sm text-emerald-300 font-mono font-bold">
                  Total P&L: +${etfPnL.toFixed(2)} | +150 XP Earned
                </div>
                <button
                  onClick={onClose}
                  className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md mt-2"
                >
                  Claim & Return
                </button>
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* GAME 2: CARD GAME (MARKET TAKING)                                */}
        {/* ================================================================= */}
        {gameId === 'card-game' && (
          <div className="space-y-5">
            <div className="text-xs text-slate-300">
              3 cards total (values 1 to 10). One is revealed. Market makers are quoting quotes for the total sum.
            </div>

            <div className="flex items-center justify-center gap-4 py-2">
              <div className="w-16 h-24 rounded-xl bg-white text-slate-900 border-2 border-indigo-400 flex flex-col items-center justify-center font-black text-2xl shadow-lg">
                <span>{cardRevealed}</span>
                <span className="text-sm text-rose-500">♥</span>
              </div>

              <div className="w-16 h-24 rounded-xl bg-indigo-900 border-2 border-indigo-500/50 flex items-center justify-center text-white font-bold text-xs shadow-lg">
                {cardsShowAll ? cardHidden1 : '???'}
              </div>

              <div className="w-16 h-24 rounded-xl bg-indigo-900 border-2 border-indigo-500/50 flex items-center justify-center text-white font-bold text-xs shadow-lg">
                {cardsShowAll ? cardHidden2 : '???'}
              </div>
            </div>

            <div className="bg-[#1e0e45] p-3 rounded-2xl border border-purple-500/30 text-center text-xs">
              Expected Value of Sum: <strong className="text-amber-300 font-mono text-sm">{expectedValue}</strong>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Market Maker Quote: Bid <strong>{cardMarketQuote.bid}</strong> / Ask <strong>{cardMarketQuote.ask}</strong>
              </div>
            </div>

            {!gameOver ? (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleCardTrade('BUY')}
                  className="py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md cursor-pointer"
                >
                  BUY at {cardMarketQuote.ask}
                </button>
                <button
                  onClick={() => handleCardTrade('SELL')}
                  className="py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md cursor-pointer"
                >
                  SELL at {cardMarketQuote.bid}
                </button>
              </div>
            ) : (
              <div className="text-center pt-2">
                <button
                  onClick={onClose}
                  className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* GAME 3: MARKET MAKING DICE GAME                                   */}
        {/* ================================================================= */}
        {gameId === 'dice-market' && (
          <div className="space-y-5">
            <div className="text-xs text-slate-300">
              Provide a two-way market (Bid / Ask) on a 2-dice roll (Sum 2 to 12, EV = 7.0).
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400">Your Bid (Buy Price): {myBid}</label>
                <input
                  type="range"
                  min="5.0"
                  max="6.9"
                  step="0.1"
                  value={myBid}
                  onChange={(e) => setMyBid(Number(e.target.value))}
                  className="w-full accent-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-400">Your Ask (Sell Price): {myAsk}</label>
                <input
                  type="range"
                  min="7.1"
                  max="9.0"
                  step="0.1"
                  value={myAsk}
                  onChange={(e) => setMyAsk(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center text-xs">
              Spread: <strong className="text-cyan-300 font-mono">${(myAsk - myBid).toFixed(2)}</strong>
            </div>

            {!gameOver ? (
              <button
                onClick={handleRollDice}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs shadow-lg cursor-pointer"
              >
                ROLL DICE & SETTLE MARKET
              </button>
            ) : (
              <div className="text-center pt-2">
                <button
                  onClick={onClose}
                  className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* GAME 4: FERMI ESTIMATION GAME                                     */}
        {/* ================================================================= */}
        {gameId === 'fermi-estimation' && (
          <div className="space-y-5">
            <div className="space-y-2">
              <div className="text-xs font-bold text-amber-400 uppercase">
                {fermiQuestion.title}
              </div>
              <p className="text-sm text-slate-200">{fermiQuestion.prompt}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Lower Bound</label>
                <input
                  type="number"
                  value={lowerBound}
                  onChange={(e) => setLowerBound(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Upper Bound</label>
                <input
                  type="number"
                  value={upperBound}
                  onChange={(e) => setUpperBound(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white"
                />
              </div>
            </div>

            {!gameOver ? (
              <button
                onClick={handleEvaluateFermi}
                className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg cursor-pointer"
              >
                SUBMIT CONFIDENCE INTERVAL
              </button>
            ) : (
              <div className="text-center pt-2">
                <button
                  onClick={onClose}
                  className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* GAME 5: EVENT CONTRACTS                                           */}
        {/* ================================================================= */}
        {gameId === 'event-contracts' && (
          <div className="space-y-5">
            <div className="space-y-2">
              <div className="text-xs font-bold text-purple-300 uppercase">Binary Event Contract</div>
              <h4 className="text-base font-bold text-white">{eventScenario.question}</h4>
              <p className="text-xs text-slate-400 bg-slate-900 p-3 rounded-xl border border-slate-800">
                💡 Intel Clue: {eventScenario.clues}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSelectedContract('YES')}
                className={`p-4 rounded-2xl border text-center transition-all ${
                  selectedContract === 'YES'
                    ? 'bg-emerald-950/80 border-emerald-400 text-white'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <div className="text-xs font-bold">BUY YES</div>
                <div className="text-lg font-black text-emerald-400 font-mono">${eventScenario.yesPrice}</div>
              </button>

              <button
                onClick={() => setSelectedContract('NO')}
                className={`p-4 rounded-2xl border text-center transition-all ${
                  selectedContract === 'NO'
                    ? 'bg-rose-950/80 border-rose-400 text-white'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <div className="text-xs font-bold">BUY NO</div>
                <div className="text-lg font-black text-rose-400 font-mono">${eventScenario.noPrice}</div>
              </button>
            </div>

            {!gameOver ? (
              <button
                onClick={handleTradeEvent}
                className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg cursor-pointer"
              >
                EXECUTE EVENT CONTRACT
              </button>
            ) : (
              <div className="text-center pt-2">
                <button
                  onClick={onClose}
                  className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* GAME 6: HIGHER OR LOWER                                           */}
        {/* ================================================================= */}
        {gameId === 'higher-lower' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Bankroll: <strong className="text-emerald-400 font-mono">${hlBankroll}</strong></span>
              <span>Streak: <strong className="text-amber-400 font-mono">{hlStreak}x</strong></span>
            </div>

            <div className="flex justify-center py-4">
              <div className="w-20 h-28 rounded-2xl bg-white text-slate-950 border-4 border-amber-400 flex flex-col items-center justify-center font-black text-3xl shadow-2xl">
                <span>{hlCurrentCard}</span>
                <span className="text-base text-rose-600">♦</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleHigherLower('HIGHER')}
                className="py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-lg cursor-pointer"
              >
                <ArrowUp className="w-4 h-4" />
                <span>HIGHER</span>
              </button>

              <button
                onClick={() => handleHigherLower('LOWER')}
                className="py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-lg cursor-pointer"
              >
                <ArrowDown className="w-4 h-4" />
                <span>LOWER</span>
              </button>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* GAME 7: BETTING BOARD                                             */}
        {/* ================================================================= */}
        {gameId === 'betting-board' && (
          <div className="space-y-5">
            <div className="text-xs text-slate-300">
              Analyze the market odds board. Find the line that beats the vig and carries positive expected value (+EV).
            </div>

            <div className="space-y-2">
              {bettingBoard.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => setBetSelection(idx)}
                  className={`p-3.5 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition-all ${
                    betSelection === idx
                      ? 'bg-purple-900/60 border-purple-400 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-300'
                  }`}
                >
                  <span className="font-semibold">{item.outcome}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-slate-400 font-mono">Imp: {item.impliedPct}%</span>
                    <span className="font-mono font-bold text-amber-300 text-sm">Odds: {item.odds}</span>
                  </div>
                </div>
              ))}
            </div>

            {!gameOver ? (
              <button
                onClick={handleEvaluateBet}
                disabled={betSelection === null}
                className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg cursor-pointer"
              >
                LOCK IN STAKE ON SELECTED LINE
              </button>
            ) : (
              <div className="text-center pt-2">
                <button
                  onClick={onClose}
                  className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        )}

        {/* Feedback Message */}
        {gameFeedback && (
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700 text-xs text-slate-200 leading-relaxed text-center font-medium">
            {gameFeedback}
          </div>
        )}
      </div>
    </div>
  );
};

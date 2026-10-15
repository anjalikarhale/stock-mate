// Server-side scoring engine for StockMate classroom activities
import { ActivityRound, ActivitySubmission } from './types.ts';

export interface ScoreBreakdown {
  decisionScore: number;       // max 40
  riskScore: number;           // max 25
  analysisScore: number;       // max 20
  timingScore: number;         // max 10
  participationScore: number;  // max 5
  totalScore: number;          // max 100
  accuracyPercent: number;
  riskPercent: number;
  feedback: string;
}

export function calculateRoundScore(
  round: ActivityRound,
  submission: {
    decision: 'BUY' | 'SELL' | 'HOLD';
    quantity: number;
    stopLoss: number;
    target: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    reasoning?: string;
    submittedTimestamp: number;
    roundStartTime: number;
    roundEndTime: number;
  }
): ScoreBreakdown {
  const currentPrice = round.price;
  const optimalAction = round.optimalAction;

  // 1. Decision Score (max 40)
  let decisionScore = 0;
  if (submission.decision === optimalAction) {
    decisionScore = 40;
  } else if (
    (optimalAction === 'HOLD' && (submission.decision === 'BUY' || submission.decision === 'SELL')) ||
    (optimalAction === 'BUY' && submission.decision === 'HOLD')
  ) {
    // Partial alignment with market direction
    decisionScore = 24;
  } else {
    // Contrary move against prevailing risk context
    decisionScore = 12;
  }

  // 2. Risk Management Score (max 25)
  // Evaluates Stop-Loss and Target discipline
  let riskScore = 5; // Base points for setting values
  const hasSL = submission.stopLoss > 0;
  const hasTarget = submission.target > 0;

  if (hasSL && hasTarget) {
    if (submission.decision === 'BUY') {
      const riskAmount = currentPrice - submission.stopLoss;
      const rewardAmount = submission.target - currentPrice;

      if (riskAmount > 0 && rewardAmount > 0) {
        const rrRatio = rewardAmount / riskAmount;
        if (rrRatio >= 2.0) {
          riskScore = 25; // Textbook 1:2+ R:R
        } else if (rrRatio >= 1.5) {
          riskScore = 22; // Good 1:1.5 R:R
        } else if (rrRatio >= 1.0) {
          riskScore = 17; // Neutral 1:1 R:R
        } else {
          riskScore = 10; // Negative R:R (risking more than reward)
        }
      } else {
        riskScore = 8; // Inverted SL or Target
      }
    } else if (submission.decision === 'SELL') {
      const riskAmount = submission.stopLoss - currentPrice;
      const rewardAmount = currentPrice - submission.target;

      if (riskAmount > 0 && rewardAmount > 0) {
        const rrRatio = rewardAmount / riskAmount;
        if (rrRatio >= 2.0) {
          riskScore = 25;
        } else if (rrRatio >= 1.5) {
          riskScore = 22;
        } else {
          riskScore = 15;
        }
      } else {
        riskScore = 8;
      }
    } else {
      // HOLD decision: Stop loss should be placed near support
      const slDist = Math.abs(currentPrice - submission.stopLoss);
      if (slDist < currentPrice * 0.05) {
        riskScore = 24; // Prudent trailing stop
      } else {
        riskScore = 18;
      }
    }
  } else if (hasSL || hasTarget) {
    riskScore = 12; // Incomplete risk bracket
  } else {
    riskScore = 4; // Unprotected trade
  }

  // 3. Analysis & Reasoning Score (max 20)
  let analysisScore = 10; // Default for selecting risk level
  const reasoning = (submission.reasoning || '').trim();
  const wordCount = reasoning.split(/\s+/).filter(Boolean).length;

  if (wordCount >= 15) {
    analysisScore = 20; // Detailed rationale
  } else if (wordCount >= 6) {
    analysisScore = 16;
  } else if (wordCount >= 1) {
    analysisScore = 12;
  }

  // 4. Timing Score (max 10)
  // Submitting comfortably within time without rushing or missing deadline
  const totalWindowMs = Math.max(submission.roundEndTime - submission.roundStartTime, 10000);
  const elapsedMs = Math.max(submission.submittedTimestamp - submission.roundStartTime, 0);
  const timeFraction = elapsedMs / totalWindowMs;

  let timingScore = 10;
  if (timeFraction <= 0.85) {
    timingScore = 10; // Prompt, measured decision
  } else if (timeFraction <= 0.98) {
    timingScore = 8; // Near the wire
  } else {
    timingScore = 5; // Last-second scramble
  }

  // 5. Participation Score (max 5)
  const participationScore = 5;

  const totalScore = Math.min(
    100,
    decisionScore + riskScore + analysisScore + timingScore + participationScore
  );

  const accuracyPercent = Math.round((decisionScore / 40) * 100);
  const riskPercent = Math.round((riskScore / 25) * 100);

  // Generate automated pedagogical feedback
  let feedback = '';
  if (submission.decision === optimalAction) {
    feedback = `Excellent market alignment! Your decision to ${submission.decision} matched the institutional flow. `;
  } else {
    feedback = `Cautious note: The market trend favored ${optimalAction}. `;
  }

  if (riskScore >= 20) {
    feedback += `Strong risk management: your Stop-Loss and Target maintained a healthy Risk-to-Reward ratio.`;
  } else {
    feedback += `Review your Stop-Loss: ensure you never risk more than your potential reward.`;
  }

  return {
    decisionScore,
    riskScore,
    analysisScore,
    timingScore,
    participationScore,
    totalScore,
    accuracyPercent,
    riskPercent,
    feedback,
  };
}

export interface QuizScoreResult {
  isCorrect: boolean;
  score: number; // 100 or 0
  explanation: string;
  correctOption: 'A' | 'B' | 'C' | 'D';
}

/**
 * Evaluates StockMate Market Challenge quiz question answer.
 * RULE: Correct = 100, Wrong = 0. STRICTLY NO SPEED BONUS.
 */
export function evaluateQuizAnswer(
  selectedOption: 'A' | 'B' | 'C' | 'D',
  correctOption: 'A' | 'B' | 'C' | 'D',
  explanation: string
): QuizScoreResult {
  const isCorrect = selectedOption.toUpperCase() === correctOption.toUpperCase();
  const score = isCorrect ? 100 : 0;
  return {
    isCorrect,
    score,
    explanation,
    correctOption,
  };
}


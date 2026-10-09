import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  Trophy,
  ShieldAlert,
  Sparkles,
  Info
} from 'lucide-react';

interface QuizItem {
  id: number;
  category: string;
  scenario: string;
  senderOrUrl: string;
  isPhishing: boolean;
  question: string;
  explanation: string;
  keyIndicators: string[];
}

const QUIZ_QUESTIONS: QuizItem[] = [
  {
    id: 1,
    category: 'Parcel & Delivery Scam',
    scenario: 'You receive an SMS: "USPS: Package ID #92019 is on hold due to missing street number. Please confirm your address and settle the $1.20 redelivery fee within 12 hours."',
    senderOrUrl: 'http://usps-redelivery-address.xyz/package/update',
    isPhishing: true,
    question: 'Is this message Legitimate or Phishing?',
    explanation: 'PHISHING: USPS and official postal carriers do not use .xyz domains to collect redelivery fees over SMS. Attackers use nominal fees ($1.20) as bait to harvest credit card CVVs and numbers.',
    keyIndicators: ['.xyz top-level domain', 'Artificial 12-hour deadline', 'Request for redelivery credit card payment via SMS']
  },
  {
    id: 2,
    category: 'Official Government Advisory',
    scenario: 'An email alert arrives informing administrators of a critical security vulnerability in Apache Log4j with guidance to apply version updates.',
    senderOrUrl: 'https://www.cisa.gov/news-events/cybersecurity-advisories/aa21-356a',
    isPhishing: false,
    question: 'Is this communication Legitimate or Phishing?',
    explanation: 'LEGITIMATE: The link leads directly to cisa.gov (the official apex domain of the U.S. Cybersecurity and Infrastructure Security Agency) over valid HTTPS. It does not solicit credentials or payments.',
    keyIndicators: ['Legitimate .gov apex domain', 'Encrypted HTTPS', 'No solicitation of credentials or funds']
  },
  {
    id: 3,
    category: 'Telegram Job Offer Fraud',
    scenario: 'A WhatsApp recruiter writes: "Greetings! We selected your resume for a part-time hotel rating assistant position paying $300/day. You only need 30 mins a day. Join our Telegram to deposit $50 and receive your task bundle."',
    senderOrUrl: 'Telegram: @vip_hotel_ratings_hr',
    isPhishing: true,
    question: 'Is this offer Legitimate or a Scam?',
    explanation: 'SCAM: Legitimate employers never ask candidates to deposit money to receive work or activate earnings. This is a classic prepaid task scam.',
    keyIndicators: ['Unsolicited cold message', 'Unrealistic pay for trivial effort', 'Requirement to pay upfront deposit']
  },
  {
    id: 4,
    category: 'Banking / UPI QR Manipulation',
    scenario: 'A buyer on an online marketplace wants to pay you $150 for your used bicycle. They send a QR code image saying: "Please scan this QR code and approve the transaction in your bank app to receive the money into your balance."',
    senderOrUrl: 'Payment Gateway Collect QR',
    isPhishing: true,
    question: 'Is this payment flow Safe or Fraudulent?',
    explanation: 'FRAUDULENT: Entering a UPI PIN or scanning a collect QR code always DEBITS funds from your bank account. You NEVER need to scan a QR code or enter a PIN to receive funds.',
    keyIndicators: ['Claim that scanning a QR code is required to receive funds', 'Requesting authorization for an incoming payment']
  },
  {
    id: 5,
    category: 'Corporate IT Single Sign-On',
    scenario: 'An internal corporate calendar reminder redirects you to your company single sign-on portal on Microsoft Entra ID.',
    senderOrUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    isPhishing: false,
    question: 'Is this authentication endpoint Legitimate or Phishing?',
    explanation: 'LEGITIMATE: login.microsoftonline.com is the genuine authentication domain for Microsoft 365 and Entra ID SSO services.',
    keyIndicators: ['Official Microsoft root domain', 'Signed SSL certificate', 'Standard OAuth 2.0 flow']
  }
];

export const LearnLabPage: React.FC = () => {
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  const currentQ = QUIZ_QUESTIONS[currentIndex];

  const handleAnswer = (choice: boolean) => {
    if (answered) return;
    setSelectedAnswer(choice);
    setAnswered(true);
    if (choice === currentQ.isPhishing) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < QUIZ_QUESTIONS.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setAnswered(false);
    } else {
      setCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setAnswered(false);
    setScore(0);
    setCompleted(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono">
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Interactive Cyber Awareness Lab</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Phishing & Scam Detection Lab
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
          Test your instincts on simulated real-world scenarios. All samples are harmless mock cases.
        </p>
      </div>

      {!completed ? (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Scenario {currentIndex + 1} of {QUIZ_QUESTIONS.length}</span>
              <span>Category: <strong className="text-cyan-400">{currentQ.category}</strong></span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-cyan-500 h-full rounded-full transition-all duration-300 shadow-[0_0_10px_#06b6d4]"
                style={{ width: `${((currentIndex + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Scenario description card */}
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800/90 space-y-3">
            <div className="text-[11px] font-mono uppercase text-slate-400 tracking-wider">
              Simulated Scenario Observation:
            </div>
            <p className="text-sm text-white font-sans leading-relaxed">
              {currentQ.scenario}
            </p>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-300 break-all">
              Target / Artifact: {currentQ.senderOrUrl}
            </div>
          </div>

          {/* Question & Choices */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white text-center">
              {currentQ.question}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                disabled={answered}
                onClick={() => handleAnswer(false)}
                className={`p-4 rounded-2xl border text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  answered && !currentQ.isPhishing
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                    : answered && selectedAnswer === false && currentQ.isPhishing
                    ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                    : 'bg-slate-950/80 border-slate-800 text-slate-200 hover:border-emerald-500/40 hover:bg-slate-900'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Legitimate / Safe</span>
              </button>

              <button
                disabled={answered}
                onClick={() => handleAnswer(true)}
                className={`p-4 rounded-2xl border text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  answered && currentQ.isPhishing
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                    : answered && selectedAnswer === true && !currentQ.isPhishing
                    ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                    : 'bg-slate-950/80 border-slate-800 text-slate-200 hover:border-rose-500/40 hover:bg-slate-900'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>Phishing / Scam</span>
              </button>
            </div>
          </div>

          {/* Explanation reveal */}
          {answered && (
            <div className="p-5 rounded-2xl bg-slate-950/90 border border-slate-800 animate-in fade-in space-y-3">
              <div className="flex items-center gap-2">
                {selectedAnswer === currentQ.isPhishing ? (
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Correct Analysis!
                  </span>
                ) : (
                  <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                    <XCircle className="w-4 h-4" /> Incorrect Assessment
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {currentQ.explanation}
              </p>

              <div>
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                  Forensic Indicators:
                </span>
                <ul className="list-disc list-inside text-xs text-slate-400 space-y-0.5">
                  {currentQ.keyIndicators.map((ind, i) => (
                    <li key={i}>{ind}</li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleNext}
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                >
                  <span>{currentIndex + 1 < QUIZ_QUESTIONS.length ? 'Next Scenario' : 'View Results'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Completion Score Screen */
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-8 text-center space-y-6 shadow-2xl animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mx-auto flex items-center justify-center shadow-[0_0_25px_rgba(6,182,212,0.3)]">
            <Trophy className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-white">Lab Module Completed!</h2>
            <p className="text-sm text-slate-400">
              You scored <strong className="text-cyan-400 font-mono text-base">{score}</strong> out of <strong className="text-white font-mono">{QUIZ_QUESTIONS.length}</strong>.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 max-w-sm mx-auto text-xs text-slate-300">
            {score === QUIZ_QUESTIONS.length ? (
              <p className="text-emerald-400 font-semibold">Outstanding! You identified all malicious vectors and legitimate endpoints with 100% precision.</p>
            ) : score >= 3 ? (
              <p className="text-cyan-300">Good defensive awareness. Review the explanations to spot subtle domain spoofs and QR traps.</p>
            ) : (
              <p className="text-amber-300">We recommend reviewing our Threat News advisories and re-running the lab module.</p>
            )}
          </div>

          <button
            onClick={handleRestart}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retake Awareness Lab</span>
          </button>
        </div>
      )}
    </div>
  );
};

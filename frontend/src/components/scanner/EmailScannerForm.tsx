import React, { useState } from 'react';
import { Mail, MessageSquare, Briefcase, Smartphone, ArrowRight, Loader2, Sparkles, ShieldCheck } from 'lucide-react';

interface EmailScannerFormProps {
  onScan: (text: string, channel: string) => Promise<void>;
  loading: boolean;
}

export const EmailScannerForm: React.FC<EmailScannerFormProps> = ({ onScan, loading }) => {
  const [text, setText] = useState('');
  const [channel, setChannel] = useState('email');

  const channels = [
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'sms', label: 'SMS / Text', icon: Smartphone },
    { id: 'messaging', label: 'WhatsApp / Telegram', icon: MessageSquare },
    { id: 'job_offer', label: 'Job Offer', icon: Briefcase }
  ];

  const sampleMessages = [
    {
      label: 'Courier Smishing',
      channel: 'sms',
      content: 'URGENT USPS: Your package US-892147 cannot be delivered due to incomplete address. Please update your details and pay $1.85 fee at: http://usps-redelivery-fee.xyz/track'
    },
    {
      label: 'Task Job Scheme',
      channel: 'job_offer',
      content: 'Hello! I am Sarah from Global HR. We have a part-time remote job rating 5-star hotels for $200-$400 daily. Join our Telegram @hotel_tasks_vip. Deposit $100 to activate Level 2 earnings.'
    },
    {
      label: 'Security Alert Phish',
      channel: 'email',
      content: 'SECURITY NOTICE: Your bank account will be suspended within 24 hours due to unverified KYC. Enter your password and OTP immediately to verify your identity: http://bit.ly/bank-auth'
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || loading) return;
    onScan(text.trim(), channel);
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-6 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="mb-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Mail className="w-5 h-5 text-cyan-400" />
          <span>Suspicious Email & Message Analyzer</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Detects urgency intimidation, fake courier tracking, payment QR manipulation, credential solicitations, and job scams.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Channel Selection Buttons */}
        <div className="flex flex-wrap gap-2">
          {channels.map((c) => {
            const Icon = c.icon;
            const isSelected = channel === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setChannel(c.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                  isSelected
                    ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                    : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{c.label}</span>
              </button>
            );
          })}
        </div>

        {/* Text Area */}
        <div className="relative">
          <textarea
            rows={5}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste suspicious email text, SMS message, WhatsApp offer, or scam email headers here..."
            className="w-full p-4 bg-slate-950/80 border border-slate-800 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all shadow-inner leading-relaxed resize-y"
            required
          />
        </div>

        {/* Privacy Note & Submit */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Privacy Guard: We never store complete sensitive messages permanently.</span>
          </div>

          <button
            type="submit"
            disabled={loading || !text.trim()}
            className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-semibold text-xs rounded-xl transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Analyzing Indicators...</span>
              </>
            ) : (
              <>
                <span>Scan Message</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>

        {/* Sample pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/60">
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>Load Scam Examples:</span>
          </span>
          {sampleMessages.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setText(s.content);
                setChannel(s.channel);
              }}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800/80 transition-colors"
            >
              {s.label}
            </button>
          ))}
        </div>
      </form>
    </div>
  );
};

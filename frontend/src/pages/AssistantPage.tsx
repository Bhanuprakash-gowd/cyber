import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../services/api';
import {
  Bot,
  Send,
  User,
  ShieldAlert,
  Sparkles,
  Loader2,
  AlertCircle,
  HelpCircle,
  CornerDownLeft,
  Terminal
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  source?: string;
}

export const AssistantPage: React.FC = () => {
  const location = useLocation();
  const scanContext = (location.state as any)?.scanContext || null;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial welcome message
    const initialGreeting = scanContext
      ? `Hello! I have loaded your scan report for **\`${scanContext.target || scanContext.input_target}\`** (Risk Level: **${scanContext.risk_level.toUpperCase()}**, Score: ${scanContext.risk_score}/100).\n\nWhat would you like me to explain about these findings or recommended safety actions?`
      : `Hello! I am your **CyberSentry AI Cyber Safety Agent**.\n\nI can explain phishing indicators, help you recover if you interacted with a suspected scam, or clarify tactics like UPI payment manipulation, fake courier texts, and task fraud.\n\nHow can I help protect you today?`;

    setMessages([
      {
        id: 'msg-0',
        sender: 'assistant',
        content: initialGreeting,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'CyberSentry Expert Engine'
      }
    ]);
  }, [scanContext]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (messageText?: string) => {
    const textToSend = (messageText || input).trim();
    if (!textToSend || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.slice(-4).map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.content
      }));

      const res = await api.sendChatMessage(textToSend, scanContext, history);

      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        content: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: res.source
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        content: `Error contacting assistant engine: ${err.message}. Please check local API connectivity.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'System Fallback'
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    'What should I do if I entered my password on a fake site?',
    'How do UPI / QR code payment scams work?',
    'Explain how fake postal parcel SMS scams operate',
    'How do I spot task-based Telegram job offers?'
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Bot className="w-5 h-5 text-cyan-400" />
            <span>AI Cyber Safety Assistant</span>
          </h1>
          <p className="text-xs text-slate-400">
            Interactive threat comprehension, recovery protocols, and fraud mitigation guidance.
          </p>
        </div>

        {scanContext && (
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
            Context: Scan {scanContext.id.slice(0, 8)}...
          </span>
        )}
      </div>

      {/* Privacy Guard Notice */}
      <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
        <span>
          <strong>Privacy Rule:</strong> Never send current passwords, SMS OTP codes, or credit card numbers in this chat.
        </span>
      </div>

      {/* Chat Messages Frame */}
      <div className="h-[480px] rounded-3xl border border-slate-800 bg-slate-950/80 backdrop-blur-xl p-4 sm:p-6 overflow-y-auto custom-scrollbar space-y-4 shadow-2xl">
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <div
              key={m.id}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 flex-shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 space-y-2 text-xs leading-relaxed ${
                isUser
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-none'
                  : 'bg-slate-900/90 border border-slate-800/90 text-slate-200 rounded-tl-none'
              }`}>
                <div className="whitespace-pre-wrap font-sans">{m.content}</div>

                <div className="flex items-center justify-between text-[10px] opacity-60 font-mono pt-1 border-t border-white/10">
                  <span>{m.timestamp}</span>
                  {!isUser && m.source && <span>{m.source}</span>}
                </div>
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 flex-shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-cyan-400 font-mono py-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Consulting cybersecurity knowledge engine...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar text-[11px]">
        <span className="text-slate-500 text-[10px] uppercase font-mono mr-1">Suggestions:</span>
        {quickPrompts.map((q, i) => (
          <button
            key={i}
            onClick={() => handleSend(q)}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-cyan-300 whitespace-nowrap transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything about security, suspicious messages, or incident recovery..."
          className="flex-1 px-4 py-3 bg-slate-900/90 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
        />

        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-5 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] disabled:opacity-50 flex items-center gap-1.5"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};

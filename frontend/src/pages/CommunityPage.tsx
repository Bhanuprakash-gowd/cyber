import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CommunityReport } from '../types';
import { SkeletonCard } from '../components/common/SkeletonLoader';
import { EmptyState } from '../components/common/EmptyState';
import {
  Users,
  PlusCircle,
  Flag,
  Search,
  Filter,
  DollarSign,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2
} from 'lucide-react';

export const CommunityPage: React.FC = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Form State
  const [category, setCategory] = useState('Delivery / Courier Scam');
  const [channelType, setChannelType] = useState('SMS');
  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().split('T')[0]);
  const [claimedOrg, setClaimedOrg] = useState('');
  const [amountLost, setAmountLost] = useState<number>(0);
  const [currency, setCurrency] = useState('USD');
  const [description, setDescription] = useState('');
  const [evidence, setEvidence] = useState('');
  const [consent, setConsent] = useState(true);

  // Filters
  const [filterCategory, setFilterCategory] = useState('All');
  const [search, setSearch] = useState('');

  const categories = [
    'All',
    'Delivery / Courier Scam',
    'Fake Job Offer',
    'UPI / Payment Fraud',
    'Tech Support Impersonation',
    'Phishing Link',
    'Crypto / Investment Scheme',
    'Other'
  ];

  useEffect(() => {
    loadReports();
  }, [filterCategory]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const res = await api.getCommunityReports('approved', filterCategory);
      setReports(res.reports);
    } catch (err) {
      console.error('Failed to load community reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !consent) return;

    setSubmitting(true);
    try {
      await api.submitCommunityReport({
        category,
        channel_type: channelType,
        incident_date: incidentDate,
        claimed_org: claimedOrg,
        amount_lost: amountLost,
        currency,
        description,
        evidence_summary: evidence,
        consent_published: consent
      }, user?.id);

      setShowSubmitModal(false);
      setSuccessNotice('Report submitted successfully! It is queued for moderator review before public display.');
      // Reset form
      setDescription('');
      setEvidence('');
      setClaimedOrg('');
      setAmountLost(0);
      setTimeout(() => setSuccessNotice(null), 5000);
    } catch (err: any) {
      alert(`Submission failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFlag = async (id: string) => {
    try {
      await api.flagCommunityReport(id);
      alert('Report has been flagged for administrative review.');
    } catch (err: any) {
      alert('Flagging failed: ' + err.message);
    }
  };

  const filteredReports = reports.filter(r => {
    const q = search.toLowerCase();
    return r.description.toLowerCase().includes(q) ||
           (r.claimed_org || '').toLowerCase().includes(q) ||
           r.category.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-cyan-400" />
            <span>Community Scam Telemetry & Reports</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Anonymous, moderated intelligence submitted by vigilant citizens to prevent collective fraud.
          </p>
        </div>

        <button
          onClick={() => setShowSubmitModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black text-xs font-bold transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)]"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Report a Scam Encounter</span>
        </button>
      </div>

      {/* Success Notification Alert */}
      {successNotice && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reports by description or claimed brand..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 custom-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                filterCategory === cat
                  ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(6,182,212,0.3)] font-semibold'
                  : 'bg-slate-950/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Reports Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : filteredReports.length === 0 ? (
        <EmptyState
          title="No Community Reports Found"
          description="Be the first to report an encounter or adjust your current filter criteria."
          actionText="Submit Incident Report"
          onAction={() => setShowSubmitModal(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReports.map((rep) => (
            <div
              key={rep.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-5 flex flex-col justify-between hover:border-cyan-500/40 transition-all shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] mb-3">
                  <span className="font-mono px-2 py-0.5 rounded bg-slate-950 text-cyan-400 border border-slate-800">
                    {rep.channel_type}
                  </span>
                  <span className="font-mono text-[10px] text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {rep.incident_date}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white mb-2 leading-snug">
                  {rep.category}
                </h3>

                {rep.claimed_org && (
                  <p className="text-xs text-amber-300/90 font-medium mb-2">
                    Claimed Impersonation: <span className="text-white">{rep.claimed_org}</span>
                  </p>
                )}

                <p className="text-xs text-slate-300 leading-relaxed font-sans line-clamp-4 mb-3">
                  {rep.description}
                </p>

                {rep.evidence_summary && (
                  <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[11px] font-mono text-slate-400 mb-3 break-all">
                    Evidence: {rep.evidence_summary}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                {rep.amount_lost > 0 ? (
                  <span className="font-mono text-rose-400 font-semibold">
                    Loss: ${rep.amount_lost} {rep.currency}
                  </span>
                ) : (
                  <span className="text-emerald-400 font-medium">
                    No Financial Loss
                  </span>
                )}

                <button
                  onClick={() => handleFlag(rep.id)}
                  className="flex items-center gap-1 text-slate-500 hover:text-amber-400 transition-colors"
                  title="Flag report as inappropriate or duplicate"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>Flag</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submission Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-xl rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                <span>Submit Fraud / Scam Incident</span>
              </h2>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Privacy Warning */}
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Privacy Protocol:</strong> Do NOT include passwords, banking PINs, your real phone numbers, or account credentials. All entries are anonymized and reviewed before publication.
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Scam Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Delivery / Courier Scam">Delivery / Courier Scam</option>
                    <option value="Fake Job Offer">Fake Job Offer</option>
                    <option value="UPI / Payment Fraud">UPI / Payment Fraud</option>
                    <option value="Tech Support Impersonation">Tech Support Impersonation</option>
                    <option value="Phishing Link">Phishing Link</option>
                    <option value="Crypto / Investment Scheme">Crypto / Investment Scheme</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Contact Channel</label>
                  <select
                    value={channelType}
                    onChange={(e) => setChannelType(e.target.value)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="SMS">SMS / Text Message</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Telegram">Telegram</option>
                    <option value="Email">Email</option>
                    <option value="Phone Call">Phone Call</option>
                    <option value="Website">Fraudulent Website</option>
                    <option value="Social Media">Social Media</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Claimed Organization / Brand</label>
                  <input
                    type="text"
                    value={claimedOrg}
                    onChange={(e) => setClaimedOrg(e.target.value)}
                    placeholder="e.g. USPS, Amazon, Microsoft, Bank of America"
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Approximate Incident Date</label>
                  <input
                    type="date"
                    value={incidentDate}
                    onChange={(e) => setIncidentDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Incident Narrative / Description *</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe how they contacted you, what they claimed, and what steps were attempted..."
                  className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 leading-relaxed"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Optional Amount Lost ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={amountLost}
                    onChange={(e) => setAmountLost(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Redacted Evidence / Link Snippet</label>
                  <input
                    type="text"
                    value={evidence}
                    onChange={(e) => setEvidence(e.target.value)}
                    placeholder="e.g. sender: +1-833-XXX, link: parcel-track[.]top"
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="consent"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-500"
                />
                <label htmlFor="consent" className="text-slate-300 text-[11px]">
                  I consent to having this anonymized report displayed to the public after moderator verification.
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !description.trim() || !consent}
                  className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl transition-all shadow-[0_0_12px_rgba(6,182,212,0.3)] disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Submit for Moderation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

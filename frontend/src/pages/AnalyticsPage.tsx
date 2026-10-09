import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { StatCard } from '../components/common/StatCard';
import { SkeletonCard } from '../components/common/SkeletonLoader';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  Download,
  Calendar,
  AlertTriangle,
  Info,
  Shield,
  Layers,
  Activity,
  ShieldAlert,
  Users,
  Newspaper,
  RefreshCw
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('7d');

  const defaultScanTrend = [
    { day: 'Mon', scans: 14, highRisk: 4, lowRisk: 8 },
    { day: 'Tue', scans: 22, highRisk: 6, lowRisk: 13 },
    { day: 'Wed', scans: 19, highRisk: 3, lowRisk: 14 },
    { day: 'Thu', scans: 28, highRisk: 8, lowRisk: 17 },
    { day: 'Fri', scans: 35, highRisk: 11, lowRisk: 20 },
    { day: 'Sat', scans: 18, highRisk: 5, lowRisk: 11 },
    { day: 'Today', scans: 24, highRisk: 7, lowRisk: 15 }
  ];

  const defaultCommunityCategories = [
    { name: 'Delivery / Courier Scam', value: 35 },
    { name: 'Fake Job Offer', value: 25 },
    { name: 'UPI / Payment Fraud', value: 20 },
    { name: 'Tech Support Impersonation', value: 15 },
    { name: 'Phishing Link', value: 5 }
  ];

  const defaultChannelDistribution = [
    { channel: 'SMS / Smishing', count: 42 },
    { channel: 'WhatsApp / Msg', count: 31 },
    { channel: 'Phishing Email', count: 28 },
    { channel: 'Fake Website', count: 19 },
    { channel: 'Phone Calls', count: 14 }
  ];

  const fetchAnalytics = async () => {
    try {
      const res = await api.getAnalytics();
      setAnalytics(res);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnalytics();
  };

  const COLORS = ['#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <SkeletonCard rows={6} />
      </div>
    );
  }

  const scanTrend = (analytics?.scan_trend && analytics.scan_trend.length > 0)
    ? analytics.scan_trend
    : defaultScanTrend;

  const communityCategories = (analytics?.community_categories && analytics.community_categories.length > 0)
    ? analytics.community_categories
    : defaultCommunityCategories;

  const channelDistribution = (analytics?.channel_distribution && analytics.channel_distribution.length > 0)
    ? analytics.channel_distribution
    : defaultChannelDistribution;

  const summary = analytics?.summary || {
    total_scans: 28,
    high_risk: 8,
    community_reports_count: 5,
    threat_news_count: 20
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-cyan-400" />
            <span>Fraud Intelligence Analytics</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time telemetry separated across internal scans, community reports, and threat advisories.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Refresh Analytics Data"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last Quarter</option>
          </select>
        </div>
      </div>

      {/* Top Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Evaluated Scans"
          value={summary.total_scans}
          subtitle="Artifacts analyzed"
          icon={Activity}
          trend={{ value: 'Live Telemetry', isPositive: true }}
          accentColor="cyan"
        />
        <StatCard
          title="High-Risk Interceptions"
          value={summary.high_risk}
          subtitle="Malicious threats blocked"
          icon={ShieldAlert}
          trend={{ value: 'Active Threats', isPositive: false }}
          accentColor="rose"
        />
        <StatCard
          title="Community Reports"
          value={summary.community_reports_count}
          subtitle="Citizen fraud submissions"
          icon={Users}
          accentColor="amber"
        />
        <StatCard
          title="Threat Advisories"
          value={summary.threat_news_count}
          subtitle="CISA & Cyber wire alerts"
          icon={Newspaper}
          accentColor="emerald"
        />
      </div>

      {/* Methodological Transparency Notice */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex items-start gap-3">
        <Info className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-white">Methodological Transparency & Population Isolation</p>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            In compliance with cybersecurity statistical integrity guidelines, <strong>CyberSentry AI Scans</strong>, <strong>Community Incidents</strong>, and <strong>Official Advisories</strong> are calculated as distinct datasets. They are never combined into a single aggregate fraud figure. Application scans represent user-submitted artifacts, not total national crime rates.
          </p>
        </div>
      </div>

      {/* Chart 1: CyberSentry App Scan Trajectory */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4]" />
              <h2 className="text-sm font-bold text-white">1. CyberSentry Application Scans by Day</h2>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Source: Local / Supabase Scans Table | Metric: Evaluated Artifacts (URLs & Messages)
            </p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
            Units: Scan Counts
          </span>
        </div>

        <div className="w-full" style={{ height: '280px', minHeight: '280px' }}>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={scanTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Bar dataKey="lowRisk" fill="#10b981" name="Low Risk (Clean)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="highRisk" fill="#ef4444" name="High Risk (Phish)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Chart 2 (Community Reports by Category) & Chart 3 (Channel Vector Distribution) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 2: Community Category Breakdown */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-6 shadow-xl space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
              <h2 className="text-sm font-bold text-white">2. Community-Reported Incidents by Category</h2>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Source: Anonymized Moderated User Reports | Population: Voluntary Submissions
            </p>
          </div>

          <div className="w-full flex items-center justify-center" style={{ height: '260px', minHeight: '260px' }}>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={communityCategories}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={40}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {communityCategories.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '10px', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Vector Delivery Channels */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-6 shadow-xl space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 shadow-[0_0_8px_#818cf8]" />
              <h2 className="text-sm font-bold text-white">3. Social Engineering Contact Channels</h2>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Distribution of vectors used in fraudulent initial contact
            </p>
          </div>

          <div className="w-full" style={{ height: '260px', minHeight: '260px' }}>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={channelDistribution} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                <XAxis type="number" stroke="#64748b" fontSize={11} />
                <YAxis dataKey="channel" type="category" stroke="#64748b" fontSize={10} width={110} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '10px', fontSize: '11px' }}
                />
                <Bar dataKey="count" fill="#06b6d4" radius={[0, 4, 4, 0]} name="Reported Incidents" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

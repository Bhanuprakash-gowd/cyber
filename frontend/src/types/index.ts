export type RiskLevel = 'low' | 'suspicious' | 'high';

export interface ThreatIndicator {
  type: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  evidence: string;
  weight?: number;
}

export interface ScanResult {
  id: string;
  user_id?: string | null;
  scan_type: 'url' | 'email' | 'message';
  target: string;
  input_target?: string;
  normalized_url?: string;
  risk_level: RiskLevel;
  risk_score: number;
  confidence: number;
  model_version: string;
  model_used?: boolean;
  indicators: ThreatIndicator[];
  feature_breakdown: Record<string, any>;
  summary: string;
  recommended_actions: string[];
  extracted_urls?: string[];
  extracted_features?: Record<string, any>;
  is_guest?: boolean;
  created_at: string;
}

export interface ThreatArticle {
  id: string;
  title: string;
  summary: string;
  content?: string;
  source_name: string;
  source_url: string;
  category: string;
  affected_sector: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  published_at: string;
  fetched_at: string;
  is_featured: boolean;
}

export interface CommunityReport {
  id: string;
  user_id?: string | null;
  category: string;
  incident_date: string;
  description: string;
  channel_type: string;
  claimed_org?: string;
  amount_lost: number;
  currency: string;
  evidence_summary?: string;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  flag_count: number;
  consent_published: boolean;
  created_at: string;
}

export interface SystemStats {
  total_scans: number;
  high_risk: number;
  suspicious: number;
  low_risk: number;
  url_scans: number;
  email_scans: number;
  community_reports_count: number;
  threat_news_count: number;
  mode: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'alert' | 'moderation' | 'system' | 'advisory';
  link?: string;
  is_read: boolean;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'user' | 'moderator' | 'admin';
  avatar_url?: string;
}

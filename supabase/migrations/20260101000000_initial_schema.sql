-- CyberSentry AI - Supabase PostgreSQL Schema Migration
-- Migration: 20260101000000_initial_schema.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Linked with Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin')),
    avatar_url TEXT,
    preferences JSONB DEFAULT '{"theme": "dark", "email_alerts": false, "digest": "weekly"}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SCANS TABLE (URL & Email threat analyses)
CREATE TABLE IF NOT EXISTS public.scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    scan_type TEXT NOT NULL CHECK (scan_type IN ('url', 'email', 'message')),
    input_target TEXT NOT NULL, -- Normalized URL or sanitized preview
    risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'suspicious', 'high')),
    risk_score NUMERIC(5, 2) NOT NULL, -- 0.00 to 100.00
    confidence NUMERIC(5, 2) NOT NULL, -- 0.00 to 100.00
    model_version TEXT NOT NULL DEFAULT '1.2.0',
    indicators JSONB DEFAULT '[]'::jsonb,
    feature_breakdown JSONB DEFAULT '{}'::jsonb,
    summary TEXT,
    recommended_actions JSONB DEFAULT '[]'::jsonb,
    is_guest BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. THREAT NEWS TABLE (Curated and ingested threat intelligence)
CREATE TABLE IF NOT EXISTS public.threat_news (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    content TEXT,
    source_name TEXT NOT NULL,
    source_url TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'Phishing Campaigns',
        'Banking & UPI Scams',
        'Fake Jobs & Recruitment',
        'Parcel & Delivery Scams',
        'Investment & Impersonation',
        'Malware & Ransomware',
        'Zero-Day Advisories',
        'General Security'
    )),
    affected_sector TEXT DEFAULT 'Global / Consumers',
    severity TEXT NOT NULL DEFAULT 'Medium' CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')),
    published_at TIMESTAMPTZ NOT NULL,
    fetched_at TIMESTAMPTZ DEFAULT NOW(),
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. COMMUNITY REPORTS TABLE (User-submitted fraud reports)
CREATE TABLE IF NOT EXISTS public.community_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    category TEXT NOT NULL CHECK (category IN (
        'Phishing Link',
        'Fake Job Offer',
        'UPI / Payment Fraud',
        'Delivery / Courier Scam',
        'Tech Support Impersonation',
        'Crypto / Investment Scheme',
        'Lottery / Prize Fraud',
        'Other'
    )),
    incident_date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT NOT NULL,
    channel_type TEXT NOT NULL CHECK (channel_type IN ('SMS', 'WhatsApp', 'Email', 'Telegram', 'Phone Call', 'Website', 'Social Media')),
    claimed_org TEXT,
    amount_lost NUMERIC(12, 2) DEFAULT 0.00,
    currency TEXT DEFAULT 'USD',
    evidence_summary TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'flagged')),
    flag_count INTEGER DEFAULT 0,
    consent_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. THREAT INDICATORS TABLE (Known suspicious domains, keywords, patterns)
CREATE TABLE IF NOT EXISTS public.threat_indicators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    indicator_type TEXT NOT NULL CHECK (indicator_type IN ('domain', 'ip', 'keyword', 'regex_pattern', 'sender_domain')),
    pattern TEXT NOT NULL UNIQUE,
    threat_category TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')),
    description TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. USER BOOKMARKS TABLE (Saved news and reports)
CREATE TABLE IF NOT EXISTS public.user_bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL CHECK (item_type IN ('news', 'report')),
    item_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, item_type, item_id)
);

-- 7. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'advisory' CHECK (type IN ('alert', 'moderation', 'system', 'advisory')),
    link TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. LEARNING PROGRESS TABLE (Phishing Awareness Lab)
CREATE TABLE IF NOT EXISTS public.learning_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    module_id TEXT NOT NULL,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, module_id)
);

-- 9. FEED SOURCES TABLE (RSS/Atom sources configured by admins)
CREATE TABLE IF NOT EXISTS public.feed_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    url TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    last_fetched_at TIMESTAMPTZ,
    status TEXT DEFAULT 'idle',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. INGESTION LOGS TABLE
CREATE TABLE IF NOT EXISTS public.ingestion_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feed_id UUID REFERENCES public.feed_sources(id) ON DELETE CASCADE,
    articles_fetched INTEGER DEFAULT 0,
    status TEXT NOT NULL,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_scans_user_id ON public.scans(user_id);
CREATE INDEX IF NOT EXISTS idx_scans_created_at ON public.scans(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scans_risk_level ON public.scans(risk_level);
CREATE INDEX IF NOT EXISTS idx_threat_news_published ON public.threat_news(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_threat_news_category ON public.threat_news(category);
CREATE INDEX IF NOT EXISTS idx_community_reports_status ON public.community_reports(status, consent_published);
CREATE INDEX IF NOT EXISTS idx_community_reports_created ON public.community_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON public.user_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, is_read);

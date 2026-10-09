-- CyberSentry AI - Row Level Security (RLS) & Triggers
-- Migration: 20260101000001_rls_policies.sql

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.threat_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.threat_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingestion_logs ENABLE ROW LEVEL SECURITY;

-- Helper function: Is Current User Admin or Moderator?
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('admin', 'moderator')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. PROFILES POLICIES
CREATE POLICY "Public profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Trigger to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        'user'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. SCANS POLICIES
-- Anyone (guest or authenticated) can insert scans
CREATE POLICY "Anyone can create a scan"
    ON public.scans FOR INSERT
    WITH CHECK (true);

-- Authenticated users can view their own scans, or public can view by specific scan ID
CREATE POLICY "Users can view their own scans or guests can view their recent scan"
    ON public.scans FOR SELECT
    USING (
        (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
        (user_id IS NULL) OR
        public.is_admin()
    );

CREATE POLICY "Users can delete their own scans"
    ON public.scans FOR DELETE
    USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- 3. THREAT NEWS POLICIES
-- Everyone can read threat news
CREATE POLICY "Anyone can view threat news"
    ON public.threat_news FOR SELECT
    USING (true);

-- Only admins/moderators can create/update/delete threat news
CREATE POLICY "Only admins can manage threat news"
    ON public.threat_news FOR ALL
    USING (public.is_admin());

-- 4. COMMUNITY REPORTS POLICIES
-- Public can view approved reports with consent
CREATE POLICY "Approved reports with consent are public"
    ON public.community_reports FOR SELECT
    USING (
        (status = 'approved' AND consent_published = true) OR
        (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
        public.is_admin()
    );

-- Any user (authenticated or anonymous) can submit a community report
CREATE POLICY "Anyone can submit a community report"
    ON public.community_reports FOR INSERT
    WITH CHECK (true);

-- Users can flag reports or admins can update status
CREATE POLICY "Users can update flags, admins can moderate"
    ON public.community_reports FOR UPDATE
    USING (
        public.is_admin() OR
        auth.uid() = user_id
    );

CREATE POLICY "Admins can delete community reports"
    ON public.community_reports FOR DELETE
    USING (public.is_admin());

-- 5. THREAT INDICATORS POLICIES
CREATE POLICY "Public can view active threat indicators"
    ON public.threat_indicators FOR SELECT
    USING (active = true OR public.is_admin());

CREATE POLICY "Only admins can modify threat indicators"
    ON public.threat_indicators FOR ALL
    USING (public.is_admin());

-- 6. USER BOOKMARKS POLICIES
CREATE POLICY "Users manage their own bookmarks"
    ON public.user_bookmarks FOR ALL
    USING (auth.uid() = user_id);

-- 7. NOTIFICATIONS POLICIES
CREATE POLICY "Users view and manage their own notifications"
    ON public.notifications FOR ALL
    USING (auth.uid() = user_id);

-- 8. LEARNING PROGRESS POLICIES
CREATE POLICY "Users view and manage their learning progress"
    ON public.learning_progress FOR ALL
    USING (auth.uid() = user_id);

-- 9. FEED SOURCES & INGESTION LOGS POLICIES
CREATE POLICY "Feed sources readable by public or admins"
    ON public.feed_sources FOR SELECT
    USING (true);

CREATE POLICY "Admins manage feed sources"
    ON public.feed_sources FOR ALL
    USING (public.is_admin());

CREATE POLICY "Admins view ingestion logs"
    ON public.ingestion_logs FOR ALL
    USING (public.is_admin());

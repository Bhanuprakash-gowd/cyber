-- CyberSentry AI - Seed Script (Sample Demonstration Data)
-- File: supabase/seed.sql
-- Note: All sample records are clearly labeled as demonstration data.

-- 1. SEED FEED SOURCES
INSERT INTO public.feed_sources (id, name, url, category, active, status)
VALUES 
    ('11111111-1111-1111-1111-111111111101', 'CISA Cyber Advisories', 'https://www.cisa.gov/cybersecurity-advisories/all.xml', 'Advisories', true, 'active'),
    ('11111111-1111-1111-1111-111111111102', 'The Hacker News', 'https://feeds.feedburner.com/TheHackersNews', 'Threat Intelligence', true, 'active'),
    ('11111111-1111-1111-1111-111111111103', 'BleepingComputer Alerts', 'https://www.bleepingcomputer.com/feed/', 'Malware & Scams', true, 'active')
ON CONFLICT (url) DO NOTHING;

-- 2. SEED THREAT NEWS (Sample Real-World Threat Advisories)
INSERT INTO public.threat_news (id, title, summary, content, source_name, source_url, category, affected_sector, severity, published_at, is_featured)
VALUES
(
    '22222222-2222-2222-2222-222222222201',
    'Massive Phishing Wave Exploits Urgent Tax and Refund Deadlines',
    'Threat actors are distributing spoofed financial authority emails urging users to submit identity credentials and bank tokens before an artificial deadline.',
    'Security researchers detected thousands of phishing domains masquerading as official revenue portals. Victims are redirected to lookalike authentication forms designed to harvest two-factor authentication codes in real time.',
    'CISA Alert Hub',
    'https://www.cisa.gov/news-events/cybersecurity-advisories',
    'Phishing Campaigns',
    'Banking & Consumers',
    'High',
    NOW() - INTERVAL '2 days',
    true
),
(
    '22222222-2222-2222-2222-222222222202',
    'Fake Courier Delivery SMS Scam Infiltrates Messaging Apps with Malicious APKs',
    'Smishing campaigns impersonating USPS, FedEx, and DHL trick recipients into downloading fake tracking apps that contain banking trojans.',
    'Attackers send messages claiming "Your parcel could not be delivered due to incomplete address. Update now: hxxps://track-parcel-verify[.]top". Clicking leads to malicious Android APK downloads that siphon SMS one-time pins.',
    'BleepingComputer',
    'https://www.bleepingcomputer.com',
    'Parcel & Delivery Scams',
    'Logistics & E-Commerce',
    'Critical',
    NOW() - INTERVAL '3 days',
    true
),
(
    '22222222-2222-2222-2222-222222222203',
    'Global Wave of Fake Remote Work Offers Target Job Seekers via Telegram',
    'Scammers impersonate reputable HR recruitment firms offering high daily wages for trivial tasks, requiring victims to deposit cryptocurrency for "task level upgrades".',
    'Victims are initially rewarded small amounts to build trust before being coerced into transferring thousands of dollars into fraudulent escrow wallets that cannot be withdrawn.',
    'The Hacker News',
    'https://thehackernews.com',
    'Fake Jobs & Recruitment',
    'Employment & Gig Economy',
    'High',
    NOW() - INTERVAL '5 days',
    false
),
(
    '22222222-2222-2222-2222-222222222204',
    'Urgent UPI & Instant Payment QR Code Scams Target Marketplace Sellers',
    'Cybercriminals trick digital payment users into scanning "Receive Money" QR codes which actually initiate payment authorization and deduction from victim accounts.',
    'Frauds capitalize on confusion regarding payment flows: victims believe scanning a QR code is required to receive funds for second-hand items sold online.',
    'National Cyber Fraud Watch',
    'https://www.cybercrime.gov.in',
    'Banking & UPI Scams',
    'Retail & Peer-to-Peer Payments',
    'High',
    NOW() - INTERVAL '6 days',
    false
),
(
    '22222222-2222-2222-2222-222222222205',
    'Critical Zero-Day Vulnerability Disclosed in Commercial SSL-VPN Appliances',
    'Vendors issue emergency patches for an unauthenticated remote code execution flaw actively exploited by ransomware syndicates.',
    'Administrators are advised to immediately verify patch levels and inspect network perimeters for anomalous outbound reverse shell traffic.',
    'US-CERT',
    'https://www.cisa.gov',
    'Zero-Day Advisories',
    'Enterprise Infrastructure',
    'Critical',
    NOW() - INTERVAL '7 days',
    true
)
ON CONFLICT (id) DO NOTHING;

-- 3. SEED COMMUNITY REPORTS (User-Submitted Moderated Scam Reports)
INSERT INTO public.community_reports (id, category, incident_date, description, channel_type, claimed_org, amount_lost, currency, evidence_summary, status, flag_count, consent_published)
VALUES
(
    '33333333-3333-3333-3333-333333333301',
    'Delivery / Courier Scam',
    CURRENT_DATE - INTERVAL '1 day',
    'Received an SMS claiming my postal package had an incomplete house number. The link opened a page nearly identical to the national postal portal asking for a $1.85 redelivery fee and credit card CVV.',
    'SMS',
    'USPS / National Post',
    0.00,
    'USD',
    'Sender: +1-833-294-XXXX, URL: usps-post-redelivery[.]info',
    'approved',
    0,
    true
),
(
    '33333333-3333-3333-3333-333333333302',
    'Fake Job Offer',
    CURRENT_DATE - INTERVAL '3 days',
    'Contacted on WhatsApp for a remote hotel rating job promising $200/day. After rating 3 hotels, they asked me to deposit $150 to unlock tier 2 payout. Realized it was a task scam and stopped before paying.',
    'WhatsApp',
    'Global Hospitality Ratings Ltd',
    0.00,
    'USD',
    'Telegram group: @hotel-tasks-vip, recruiter name: Sarah HR',
    'approved',
    1,
    true
),
(
    '33333333-3333-3333-3333-333333333303',
    'UPI / Payment Fraud',
    CURRENT_DATE - INTERVAL '4 days',
    'Listed a camera on marketplace. Buyer said he paid via QR code and told me to accept the transaction on my banking app. It debited $250 instead of crediting. Bank reported transaction cannot be reversed.',
    'Phone Call',
    'Online Marketplace Buyer',
    250.00,
    'USD',
    'Payment gateway handle: fastpay-merchant-9831',
    'approved',
    0,
    true
),
(
    '33333333-3333-3333-3333-333333333304',
    'Tech Support Impersonation',
    CURRENT_DATE - INTERVAL '5 days',
    'Browser locked with loud alarm sound and full-screen warning claiming Windows Defender detected Zeus Trojan. Told to call toll-free support number. The person requested AnyDesk remote access.',
    'Website',
    'Microsoft Support Impersonator',
    0.00,
    'USD',
    'Phone: 1-888-555-0199, Web pop-up: security-alert-err0x8024[.]top',
    'approved',
    0,
    true
),
(
    '33333333-3333-3333-3333-333333333305',
    'Phishing Link',
    CURRENT_DATE - INTERVAL '2 days',
    'Email claiming my Netflix account was suspended due to billing error. Link led to netflx-member-billing-update[.]com with identical branding and login form.',
    'Email',
    'Netflix',
    0.00,
    'USD',
    'Sender: account-notice@netflx-support-billing.com',
    'pending',
    0,
    true
)
ON CONFLICT (id) DO NOTHING;

-- 4. SEED THREAT INDICATORS
INSERT INTO public.threat_indicators (id, indicator_type, pattern, threat_category, severity, description)
VALUES
    ('44444444-4444-4444-4444-444444444401', 'domain', 'login-appleid-verify.com', 'Phishing', 'Critical', 'Harvests Apple credentials'),
    ('44444444-4444-4444-4444-444444444402', 'keyword', 'kyc-update-blocked', 'Banking Scam', 'High', 'Common in SMS banking phishing campaigns'),
    ('44444444-4444-4444-4444-444444444403', 'regex_pattern', '.*(?:\.top|\.xyz|\.click)\/login.*', 'Credential Harvesting', 'Medium', 'Abused cheap TLDs targeting auth paths'),
    ('44444444-4444-4444-4444-444444444404', 'keyword', 'congratulations-claim-prize', 'Lottery Scam', 'High', 'Prize winning scam lure')
ON CONFLICT (pattern) DO NOTHING;

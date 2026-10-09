import { ScanResult, ThreatArticle, CommunityReport, SystemStats } from '../types';

export const MOCK_STATS: SystemStats = {
  total_scans: 86,
  high_risk: 22,
  suspicious: 14,
  low_risk: 50,
  url_scans: 58,
  email_scans: 28,
  community_reports_count: 18,
  threat_news_count: 12,
  mode: 'Supabase & Heuristic Defense Grid'
};

export const MOCK_SCANS: ScanResult[] = [
  {
    id: 'scan-sample-001',
    scan_type: 'url',
    target: 'https://paypal-account-verification-alert.xyz/auth/login',
    input_target: 'https://paypal-account-verification-alert.xyz/auth/login',
    risk_level: 'high',
    risk_score: 94,
    confidence: 0.96,
    model_version: '1.2.0',
    model_used: true,
    summary: 'Malicious Phishing Portal Impersonating PayPal Credential Ingestion Flow',
    indicators: [
      {
        type: 'Suspicious TLD (.xyz)',
        severity: 'High',
        evidence: "High-risk domain extension '.xyz' frequently exploited in disposable credential harvesting infrastructure."
      },
      {
        type: 'Brand Impersonation & Keyword Squatting',
        severity: 'High',
        evidence: "Keywords 'paypal', 'account', 'verification' used outside of official root domain paypal.com."
      },
      {
        type: 'High Shannon Entropy',
        severity: 'Medium',
        evidence: 'Domain entropy is 4.12 bits, indicating randomized algorithmic hostname registration.'
      }
    ],
    feature_breakdown: {
      url_length: 58,
      hostname_length: 39,
      num_dots: 2,
      num_hyphens: 3,
      is_https: 1,
      entropy: 4.12
    },
    recommended_actions: [
      'Do NOT enter your PayPal email, password, or 2FA credentials on this site.',
      'Report this URL to the official PayPal Anti-Phishing Center (spoof@paypal.com).',
      'If you already provided login details, change your PayPal password immediately and enable hardware-based 2FA.'
    ],
    created_at: new Date(Date.now() - 1000 * 60 * 18).toISOString()
  },
  {
    id: 'scan-sample-002',
    scan_type: 'message',
    target: 'Urgent: USPS package #928394 is on hold due to missing address. Pay $1.99 redelivery fee: usps-track-now.top',
    input_target: 'Urgent: USPS package #928394 is on hold due to missing address. Pay $1.99 redelivery fee: usps-track-now.top',
    risk_level: 'high',
    risk_score: 91,
    confidence: 0.93,
    model_version: '1.2.0',
    model_used: true,
    summary: 'Parcel Delivery Smishing Attack (USPS Impersonation)',
    indicators: [
      {
        type: 'High-Urgency Pressure Trigger',
        severity: 'High',
        evidence: "Uses artificial emergency language ('package on hold', 'pay $1.99 fee') to induce hasty victim compliance."
      },
      {
        type: 'Impersonated Courier Brand',
        severity: 'High',
        evidence: "Claims to represent USPS while linking to unverified top-level domain 'usps-track-now.top'."
      }
    ],
    feature_breakdown: {
      urgency_score: 95,
      extracted_urls_count: 1
    },
    extracted_urls: ['usps-track-now.top'],
    recommended_actions: [
      'Never click tracking links received in unsolicited text messages.',
      'Forward the SMS to 7726 (SPAM) to block the originating sender number.',
      'Track parcels solely through the official USPS mobile app or usps.com.'
    ],
    created_at: new Date(Date.now() - 1000 * 60 * 55).toISOString()
  },
  {
    id: 'scan-sample-003',
    scan_type: 'url',
    target: 'https://github.com/microsoft/vscode/releases',
    input_target: 'https://github.com/microsoft/vscode/releases',
    risk_level: 'low',
    risk_score: 4,
    confidence: 0.98,
    model_version: '1.2.0',
    model_used: true,
    summary: 'Authentic Verified Domain (GitHub, Inc.)',
    indicators: [],
    feature_breakdown: {
      url_length: 46,
      hostname_length: 10,
      num_dots: 1,
      num_hyphens: 0,
      is_https: 1,
      entropy: 2.89
    },
    recommended_actions: [
      'The scanned destination matches official Microsoft and GitHub release channels.',
      'Always confirm SHA256 checksums when downloading binaries.'
    ],
    created_at: new Date(Date.now() - 1000 * 60 * 140).toISOString()
  },
  {
    id: 'scan-sample-004',
    scan_type: 'url',
    target: 'http://netflix-billing-update-reactivate.biz/session/account',
    input_target: 'http://netflix-billing-update-reactivate.biz/session/account',
    risk_level: 'high',
    risk_score: 96,
    confidence: 0.98,
    model_version: '1.2.0',
    model_used: true,
    summary: 'Insecure Credit Card Extortion Phishing Site',
    indicators: [
      {
        type: 'Insecure HTTP Protocol',
        severity: 'High',
        evidence: 'Site does not provide HTTPS encryption. Legitimate billing portals always enforce SSL/TLS.'
      },
      {
        type: 'Credential Harvesting Pattern',
        severity: 'High',
        evidence: "Impersonates Netflix subscription billing to extract credit card numbers and CVV codes."
      }
    ],
    feature_breakdown: {
      url_length: 59,
      hostname_length: 37,
      num_dots: 1,
      num_hyphens: 3,
      is_https: 0,
      entropy: 3.95
    },
    recommended_actions: [
      'Do NOT enter credit card or banking information on insecure HTTP domains.',
      'Check active Netflix billing exclusively through the official Netflix mobile application.'
    ],
    created_at: new Date(Date.now() - 1000 * 60 * 240).toISOString()
  }
];

export const MOCK_ARTICLES: ThreatArticle[] = [
  {
    id: 'art-sample-001',
    title: 'Massive Phishing Wave Exploits Urgent Tax and Refund Deadlines',
    summary: 'Threat actors are distributing spoofed revenue authority emails urging victims to submit tax credentials before an artificial countdown.',
    content: 'Security researchers detected thousands of phishing domains masquerading as official revenue portals. Victims are redirected to lookalike authentication forms designed to harvest two-factor authentication codes in real time.',
    source_name: 'CISA Alert Hub',
    source_url: 'https://www.cisa.gov/news-events/cybersecurity-advisories',
    category: 'Phishing Campaigns',
    affected_sector: 'Banking & Consumers',
    severity: 'High',
    published_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    fetched_at: new Date().toISOString(),
    is_featured: true
  },
  {
    id: 'art-sample-002',
    title: 'Fake Courier Delivery SMS Scam Infiltrates Messaging Apps with Malicious APKs',
    summary: 'Smishing campaigns impersonating USPS, FedEx, and DHL trick recipients into downloading fake tracking apps containing banking trojans.',
    content: 'Attackers send messages claiming "Your parcel could not be delivered due to incomplete address. Update now: track-parcel-verify.top". Clicking leads to malicious Android APK downloads that siphon SMS one-time pins.',
    source_name: 'BleepingComputer',
    source_url: 'https://www.bleepingcomputer.com',
    category: 'Parcel & Delivery Scams',
    affected_sector: 'Logistics & E-Commerce',
    severity: 'Critical',
    published_at: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
    fetched_at: new Date().toISOString(),
    is_featured: true
  },
  {
    id: 'art-sample-003',
    title: 'Global Wave of Fake Remote Work Offers Target Job Seekers via Telegram',
    summary: 'Scammers impersonate reputable recruitment agencies offering high daily wages for trivial tasks, requiring victims to deposit crypto for level upgrades.',
    content: 'Victims are initially rewarded small token amounts to build trust before being coerced into transferring thousands of dollars into fraudulent escrow wallets that cannot be withdrawn.',
    source_name: 'The Hacker News',
    source_url: 'https://thehackernews.com',
    category: 'Fake Jobs & Recruitment',
    affected_sector: 'Employment & Gig Economy',
    severity: 'High',
    published_at: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
    fetched_at: new Date().toISOString(),
    is_featured: false
  }
];

export const MOCK_COMMUNITY_REPORTS: CommunityReport[] = [
  {
    id: 'rep-sample-001',
    category: 'Parcel & Delivery Scam',
    incident_date: 'Today',
    description: "Received text claiming USPS couldn't deliver a priority package due to incorrect street number. Provided a link to 'usps-redelivery-address.top' asking for $1.50 handling fee.",
    channel_type: 'SMS',
    claimed_org: 'USPS / National Post',
    amount_lost: 0,
    currency: 'USD',
    evidence_summary: 'Sender: +1-833-294-XXXX, URL: usps-redelivery-address.top',
    status: 'approved',
    flag_count: 0,
    consent_published: true,
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString()
  },
  {
    id: 'rep-sample-002',
    category: 'Fake Job Offer',
    incident_date: 'Yesterday',
    description: 'Contacted on WhatsApp for a remote hotel rating job promising $200/day. Asked to deposit $150 to unlock tier 2 payout. Stopped before paying.',
    channel_type: 'WhatsApp',
    claimed_org: 'Global Hospitality Ratings Ltd',
    amount_lost: 0,
    currency: 'USD',
    evidence_summary: 'Telegram: @hotel-tasks-vip, recruiter: Sarah HR',
    status: 'approved',
    flag_count: 1,
    consent_published: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString()
  },
  {
    id: 'rep-sample-003',
    category: 'UPI / Payment Fraud',
    incident_date: '2 days ago',
    description: 'Buyer said he paid via QR code on online marketplace and told me to scan code and enter PIN to accept money. It debited $250 instead.',
    channel_type: 'Phone Call',
    claimed_org: 'Marketplace Buyer Impersonator',
    amount_lost: 250,
    currency: 'USD',
    evidence_summary: 'Handle: fastpay-merchant-9831',
    status: 'approved',
    flag_count: 0,
    consent_published: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString()
  },
  {
    id: 'rep-sample-004',
    category: 'Banking Phishing Call',
    incident_date: '3 days ago',
    description: 'Caller claimed to be from bank security and warned my card was blocked. Asked to confirm 16-digit card number and OTP received on SMS.',
    channel_type: 'Phone Call',
    claimed_org: 'National Bank Fraud Unit',
    amount_lost: 0,
    currency: 'USD',
    evidence_summary: 'Caller ID: +1-800-BANK-XXX spoofed',
    status: 'approved',
    flag_count: 0,
    consent_published: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString()
  }
];

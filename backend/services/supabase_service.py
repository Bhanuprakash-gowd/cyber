import os
import uuid
import logging
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
import requests
from config import Config

logger = logging.getLogger(__name__)

class SupabaseService:
    def __init__(self):
        self.url = Config.SUPABASE_URL.rstrip('/')
        # Use service_role JWT if valid JWT, otherwise fallback to anon JWT
        if Config.SUPABASE_SECRET_KEY and Config.SUPABASE_SECRET_KEY.startswith("eyJ"):
            self.key = Config.SUPABASE_SECRET_KEY
        else:
            self.key = Config.SUPABASE_ANON_KEY or Config.SUPABASE_SECRET_KEY
        
        # In-memory local fallback store (populated with demo data)
        self._local_scans: List[Dict[str, Any]] = []
        self._local_news: List[Dict[str, Any]] = []
        self._local_reports: List[Dict[str, Any]] = []
        self._local_notifications: List[Dict[str, Any]] = []
        self._local_feed_sources: List[Dict[str, Any]] = []
        
        self._init_local_demo_data()
        self._check_supabase_connection()

    def _init_local_demo_data(self):
        """Initializes high-fidelity sample records matching seed.sql for development mode."""
        now_iso = datetime.now(timezone.utc).isoformat()

        self._local_feed_sources = [
            {"id": "feed-001", "name": "CISA Cyber Advisories", "url": "https://www.cisa.gov/cybersecurity-advisories/all.xml", "category": "Advisories", "active": True, "status": "active"},
            {"id": "feed-002", "name": "The Hacker News", "url": "https://feeds.feedburner.com/TheHackersNews", "category": "Threat Intelligence", "active": True, "status": "active"},
            {"id": "feed-003", "name": "BleepingComputer Alerts", "url": "https://www.bleepingcomputer.com/feed/", "category": "Malware & Scams", "active": True, "status": "active"}
        ]

        self._local_news = [
            {
                "id": "22222222-2222-2222-2222-222222222201",
                "title": "Massive Phishing Wave Exploits Urgent Tax and Refund Deadlines",
                "summary": "Threat actors are distributing spoofed revenue authority emails urging victims to submit tax credentials before an artificial countdown.",
                "content": "Security researchers detected thousands of phishing domains masquerading as official revenue portals. Victims are redirected to lookalike authentication forms designed to harvest two-factor authentication codes in real time.",
                "source_name": "CISA Alert Hub",
                "source_url": "https://www.cisa.gov/news-events/cybersecurity-advisories",
                "category": "Phishing Campaigns",
                "affected_sector": "Banking & Consumers",
                "severity": "High",
                "published_at": "2026-03-28T10:00:00Z",
                "fetched_at": now_iso,
                "is_featured": True
            },
            {
                "id": "22222222-2222-2222-2222-222222222202",
                "title": "Fake Courier Delivery SMS Scam Infiltrates Messaging Apps with Malicious APKs",
                "summary": "Smishing campaigns impersonating USPS, FedEx, and DHL trick recipients into downloading fake tracking apps containing banking trojans.",
                "content": "Attackers send messages claiming 'Your parcel could not be delivered due to incomplete address. Update now: track-parcel-verify.top'. Clicking leads to malicious Android APK downloads that siphon SMS one-time pins.",
                "source_name": "BleepingComputer",
                "source_url": "https://www.bleepingcomputer.com",
                "category": "Parcel & Delivery Scams",
                "affected_sector": "Logistics & E-Commerce",
                "severity": "Critical",
                "published_at": "2026-03-27T14:30:00Z",
                "fetched_at": now_iso,
                "is_featured": True
            },
            {
                "id": "22222222-2222-2222-2222-222222222203",
                "title": "Global Wave of Fake Remote Work Offers Target Job Seekers via Telegram",
                "summary": "Scammers impersonate reputable recruitment agencies offering high daily wages for trivial tasks, requiring victims to deposit crypto for level upgrades.",
                "content": "Victims are initially rewarded small token amounts to build trust before being coerced into transferring thousands of dollars into fraudulent escrow wallets that cannot be withdrawn.",
                "source_name": "The Hacker News",
                "source_url": "https://thehackernews.com",
                "category": "Fake Jobs & Recruitment",
                "affected_sector": "Employment & Gig Economy",
                "severity": "High",
                "published_at": "2026-03-25T09:15:00Z",
                "fetched_at": now_iso,
                "is_featured": False
            },
            {
                "id": "22222222-2222-2222-2222-222222222204",
                "title": "Urgent UPI & Instant Payment QR Code Scams Target Marketplace Sellers",
                "summary": "Cybercriminals trick marketplace vendors into scanning 'Receive Money' QR codes which debit funds instead of receiving them.",
                "content": "Frauds capitalize on confusion regarding payment flows: victims believe scanning a QR code is required to receive funds for second-hand items sold online.",
                "source_name": "National Cyber Watch",
                "source_url": "https://www.cybercrime.gov.in",
                "category": "Banking & UPI Scams",
                "affected_sector": "Peer-to-Peer Payments",
                "severity": "High",
                "published_at": "2026-03-24T16:45:00Z",
                "fetched_at": now_iso,
                "is_featured": False
            },
            {
                "id": "22222222-2222-2222-2222-222222222205",
                "title": "Critical Zero-Day Vulnerability Disclosed in Commercial SSL-VPN Appliances",
                "summary": "Vendors issue emergency patches for an unauthenticated remote code execution flaw actively exploited by ransomware syndicates.",
                "content": "Administrators are advised to immediately verify patch levels and inspect network perimeters for anomalous outbound reverse shell traffic.",
                "source_name": "US-CERT",
                "source_url": "https://www.cisa.gov",
                "category": "Zero-Day Advisories",
                "affected_sector": "Enterprise Infrastructure",
                "severity": "Critical",
                "published_at": "2026-03-22T08:00:00Z",
                "fetched_at": now_iso,
                "is_featured": True
            }
        ]

        self._local_reports = [
            {
                "id": "33333333-3333-3333-3333-333333333301",
                "category": "Delivery / Courier Scam",
                "incident_date": "2026-03-29",
                "description": "Received an SMS claiming postal parcel had incomplete address. Link opened lookalike page asking for $1.85 redelivery charge and CVV.",
                "channel_type": "SMS",
                "claimed_org": "USPS / National Post",
                "amount_lost": 0.0,
                "currency": "USD",
                "evidence_summary": "Sender: +1-833-294-XXXX, URL: usps-post-redelivery.info",
                "status": "approved",
                "flag_count": 0,
                "consent_published": True,
                "created_at": now_iso
            },
            {
                "id": "33333333-3333-3333-3333-333333333302",
                "category": "Fake Job Offer",
                "incident_date": "2026-03-27",
                "description": "Contacted on WhatsApp for a remote hotel rating job promising $200/day. Asked to deposit $150 to unlock tier 2 payout. Stopped before paying.",
                "channel_type": "WhatsApp",
                "claimed_org": "Global Hospitality Ratings Ltd",
                "amount_lost": 0.0,
                "currency": "USD",
                "evidence_summary": "Telegram: @hotel-tasks-vip, recruiter name: Sarah HR",
                "status": "approved",
                "flag_count": 1,
                "consent_published": True,
                "created_at": now_iso
            },
            {
                "id": "33333333-3333-3333-3333-333333333303",
                "category": "UPI / Payment Fraud",
                "incident_date": "2026-03-26",
                "description": "Buyer said he paid via QR code on online marketplace and told me to enter PIN to accept. It debited $250 instead.",
                "channel_type": "Phone Call",
                "claimed_org": "Marketplace Buyer Impersonator",
                "amount_lost": 250.0,
                "currency": "USD",
                "evidence_summary": "Handle: fastpay-merchant-9831",
                "status": "approved",
                "flag_count": 0,
                "consent_published": True,
                "created_at": now_iso
            },
            {
                "id": "33333333-3333-3333-3333-333333333304",
                "category": "Tech Support Impersonation",
                "incident_date": "2026-03-25",
                "description": "Browser screen froze with siren sound claiming Windows Defender detected Trojan. Requested AnyDesk access.",
                "channel_type": "Website",
                "claimed_org": "Microsoft Support Impersonator",
                "amount_lost": 0.0,
                "currency": "USD",
                "evidence_summary": "Phone: 1-888-555-0199, Pop-up: security-alert-err0x8024.top",
                "status": "approved",
                "flag_count": 0,
                "consent_published": True,
                "created_at": now_iso
            }
        ]

        self._local_notifications = [
            {
                "id": "notif-001",
                "title": "System Active",
                "message": "CyberSentry AI threat engine version 1.2.0 initialized and ready.",
                "type": "system",
                "is_read": False,
                "link": "/scanner",
                "created_at": now_iso
            },
            {
                "id": "notif-002",
                "title": "Advisory Alert",
                "message": "High-risk parcel smishing campaigns detected globally. Exercise caution with SMS delivery links.",
                "type": "advisory",
                "is_read": False,
                "link": "/threat-news",
                "created_at": now_iso
            }
        ]

        # Initial demo scans
        self._local_scans = [
            {
                "id": "scan-demo-01",
                "user_id": None,
                "scan_type": "url",
                "input_target": "http://paypal-security-update-verification.com.top/login",
                "risk_level": "high",
                "risk_score": 92.5,
                "confidence": 98.0,
                "model_version": "1.2.0",
                "indicators": [
                    {"type": "High-Risk Top Level Domain (TLD)", "severity": "Medium", "evidence": "TLD '.top' heavily abused in credential scams."},
                    {"type": "Unencrypted HTTP Protocol", "severity": "Medium", "evidence": "Cleartext HTTP connection lacking TLS."},
                    {"type": "Sensitive Authentication / Lure Keywords", "severity": "High", "evidence": "Detected keywords: ['login', 'verify', 'paypal', 'security']."}
                ],
                "feature_breakdown": {"entropy": 4.12, "url_length": 56, "subdomains": 2, "has_https": False, "has_ip": False},
                "summary": "High-risk brand impersonation phishing domain.",
                "recommended_actions": ["Do not click or enter credentials.", "Block domain at DNS/firewall."],
                "is_guest": True,
                "created_at": now_iso
            },
            {
                "id": "scan-demo-02",
                "user_id": None,
                "scan_type": "url",
                "input_target": "https://www.cisa.gov/cybersecurity-advisories",
                "risk_level": "low",
                "risk_score": 5.0,
                "confidence": 95.0,
                "model_version": "1.2.0",
                "indicators": [],
                "feature_breakdown": {"entropy": 3.82, "url_length": 45, "subdomains": 1, "has_https": True, "has_ip": False},
                "summary": "Standard secure domain with valid HTTPS and no suspicious heuristics.",
                "recommended_actions": ["Verified authority site."],
                "is_guest": True,
                "created_at": now_iso
            }
        ]

    def _check_supabase_connection(self):
        if not self.url or not self.key or "your-project" in self.url:
            logger.info("Supabase credentials not configured. Running in Local Persistence Mode.")
            self.is_connected = False
            return

        try:
            headers = {
                "apikey": self.key,
                "Authorization": f"Bearer {self.key}"
            }
            res = requests.get(f"{self.url}/rest/v1/profiles?select=count", headers=headers, timeout=3)
            if res.status_code in [200, 206]:
                self.is_connected = True
                logger.info("Successfully connected to Supabase PostgreSQL at %s", self.url)
            else:
                logger.warning("Supabase connection returned status %s. Fallback to local mode.", res.status_code)
                self.is_connected = False
        except Exception as e:
            logger.warning("Could not reach Supabase endpoint (%s). Fallback to local mode.", str(e))
            self.is_connected = False

    # Scans API
    def save_scan(self, scan_data: Dict[str, Any], user_id: Optional[str] = None) -> Dict[str, Any]:
        scan_id = str(uuid.uuid4())
        record = {
            "id": scan_id,
            "user_id": user_id,
            "scan_type": scan_data.get("scan_type", "url"),
            "input_target": scan_data.get("target") or scan_data.get("normalized_url", "unknown"),
            "risk_level": scan_data.get("risk_level", "low"),
            "risk_score": scan_data.get("risk_score", 0.0),
            "confidence": scan_data.get("confidence", 80.0),
            "model_version": scan_data.get("model_version", "1.2.0"),
            "indicators": scan_data.get("indicators", []),
            "feature_breakdown": scan_data.get("feature_breakdown", {}),
            "summary": scan_data.get("summary", ""),
            "recommended_actions": scan_data.get("recommended_actions", []),
            "is_guest": user_id is None,
            "created_at": datetime.now(timezone.utc).isoformat()
        }

        if self.is_connected:
            try:
                headers = {"apikey": self.key, "Authorization": f"Bearer {self.key}", "Content-Type": "application/json"}
                res = requests.post(f"{self.url}/rest/v1/scans", json=record, headers=headers, timeout=4)
                if res.status_code in [200, 201]:
                    return record
            except Exception as e:
                logger.error("Supabase insert error: %s", str(e))

        # Local storage fallback
        self._local_scans.insert(0, record)
        return record

    def get_scans(self, user_id: Optional[str] = None, limit: int = 50) -> List[Dict[str, Any]]:
        if self.is_connected:
            try:
                headers = {"apikey": self.key, "Authorization": f"Bearer {self.key}"}
                query = f"order=created_at.desc&limit={limit}"
                if user_id:
                    query += f"&user_id=eq.{user_id}"
                res = requests.get(f"{self.url}/rest/v1/scans?{query}", headers=headers, timeout=4)
                if res.status_code == 200:
                    return res.json()
            except Exception as e:
                logger.error("Supabase fetch error: %s", str(e))

        if user_id:
            return [s for s in self._local_scans if s.get("user_id") == user_id][:limit]
        return self._local_scans[:limit]

    def get_scan_by_id(self, scan_id: str) -> Optional[Dict[str, Any]]:
        if self.is_connected:
            try:
                headers = {"apikey": self.key, "Authorization": f"Bearer {self.key}"}
                res = requests.get(f"{self.url}/rest/v1/scans?id=eq.{scan_id}", headers=headers, timeout=4)
                if res.status_code == 200 and res.json():
                    return res.json()[0]
            except Exception as e:
                logger.error("Supabase fetch scan error: %s", str(e))

        for s in self._local_scans:
            if s.get("id") == scan_id:
                return s
        return None

    def delete_scan(self, scan_id: str, user_id: Optional[str] = None) -> bool:
        if self.is_connected:
            try:
                headers = {"apikey": self.key, "Authorization": f"Bearer {self.key}"}
                query = f"id=eq.{scan_id}"
                if user_id:
                    query += f"&user_id=eq.{user_id}"
                res = requests.delete(f"{self.url}/rest/v1/scans?{query}", headers=headers, timeout=4)
                return res.status_code in [200, 204]
            except Exception as e:
                logger.error("Supabase delete scan error: %s", str(e))

        self._local_scans = [s for s in self._local_scans if s.get("id") != scan_id]
        return True

    # News API
    def get_threat_news(self, category: Optional[str] = None, search: Optional[str] = None, limit: int = 50) -> List[Dict[str, Any]]:
        items = list(self._local_news)
        if category and category != "All":
            items = [item for item in items if item.get("category") == category]
        if search:
            q = search.lower()
            items = [item for item in items if q in item.get("title", "").lower() or q in item.get("summary", "").lower()]
        return items[:limit]

    def get_news_by_id(self, news_id: str) -> Optional[Dict[str, Any]]:
        for n in self._local_news:
            if n.get("id") == news_id:
                return n
        return None

    def add_threat_news(self, news_items: List[Dict[str, Any]]) -> int:
        added = 0
        existing_urls = {item.get("source_url") for item in self._local_news}
        for item in news_items:
            if item.get("source_url") not in existing_urls:
                if not item.get("id"):
                    item["id"] = str(uuid.uuid4())
                self._local_news.insert(0, item)
                existing_urls.add(item.get("source_url"))
                added += 1
        return added

    # Community Reports API
    def get_community_reports(self, status: Optional[str] = None, category: Optional[str] = None, limit: int = 50) -> List[Dict[str, Any]]:
        items = list(self._local_reports)
        if status:
            items = [r for r in items if r.get("status") == status]
        else:
            # Public feed: approved only
            items = [r for r in items if r.get("status") == "approved" and r.get("consent_published")]
        if category and category != "All":
            items = [r for r in items if r.get("category") == category]
        return items[:limit]

    def submit_community_report(self, data: Dict[str, Any], user_id: Optional[str] = None) -> Dict[str, Any]:
        report_id = str(uuid.uuid4())
        record = {
            "id": report_id,
            "user_id": user_id,
            "category": data.get("category", "Other"),
            "incident_date": data.get("incident_date", datetime.now(timezone.utc).strftime("%Y-%m-%d")),
            "description": data.get("description", "").strip(),
            "channel_type": data.get("channel_type", "Email"),
            "claimed_org": data.get("claimed_org", "").strip(),
            "amount_lost": float(data.get("amount_lost", 0.0) or 0.0),
            "currency": data.get("currency", "USD"),
            "evidence_summary": data.get("evidence_summary", "").strip(),
            "status": "pending", # Pending moderation
            "flag_count": 0,
            "consent_published": bool(data.get("consent_published", True)),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        self._local_reports.insert(0, record)
        return record

    def flag_community_report(self, report_id: str) -> bool:
        for r in self._local_reports:
            if r.get("id") == report_id:
                r["flag_count"] = r.get("flag_count", 0) + 1
                if r["flag_count"] >= 3:
                    r["status"] = "flagged"
                return True
        return False

    def moderate_community_report(self, report_id: str, new_status: str) -> bool:
        for r in self._local_reports:
            if r.get("id") == report_id:
                r["status"] = new_status
                return True
        return False

    # Stats & Analytics
    def get_stats(self) -> Dict[str, Any]:
        total_scans = len(self._local_scans)
        high_risk = sum(1 for s in self._local_scans if s.get("risk_level") == "high")
        suspicious = sum(1 for s in self._local_scans if s.get("risk_level") == "suspicious")
        low_risk = sum(1 for s in self._local_scans if s.get("risk_level") == "low")
        url_scans = sum(1 for s in self._local_scans if s.get("scan_type") == "url")
        email_scans = sum(1 for s in self._local_scans if s.get("scan_type") != "url")
        total_reports = len(self._local_reports)

        return {
            "total_scans": total_scans,
            "high_risk": high_risk,
            "suspicious": suspicious,
            "low_risk": low_risk,
            "url_scans": url_scans,
            "email_scans": email_scans,
            "community_reports_count": total_reports,
            "threat_news_count": len(self._local_news),
            "mode": "supabase_cloud" if self.is_connected else "local_resilient_store"
        }

    def get_notifications(self) -> List[Dict[str, Any]]:
        return self._local_notifications

    def mark_notification_read(self, notif_id: str) -> bool:
        for n in self._local_notifications:
            if n.get("id") == notif_id:
                n["is_read"] = True
                return True
        return False

    def get_feed_sources(self) -> List[Dict[str, Any]]:
        return self._local_feed_sources

supabase_service = SupabaseService()

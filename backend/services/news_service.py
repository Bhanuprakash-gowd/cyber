import re
import uuid
import logging
from datetime import datetime, timezone
from typing import List, Dict, Any
import feedparser
from config import Config
from services.supabase_service import supabase_service

logger = logging.getLogger(__name__)

CATEGORY_MAP = {
    "phish": "Phishing Campaigns",
    "scam": "Banking & UPI Scams",
    "fraud": "Banking & UPI Scams",
    "delivery": "Parcel & Delivery Scams",
    "package": "Parcel & Delivery Scams",
    "job": "Fake Jobs & Recruitment",
    "telegram": "Fake Jobs & Recruitment",
    "ransomware": "Malware & Ransomware",
    "malware": "Malware & Ransomware",
    "trojan": "Malware & Ransomware",
    "zero-day": "Zero-Day Advisories",
    "vulnerability": "Zero-Day Advisories",
    "cve": "Zero-Day Advisories"
}

def clean_html(raw_html: str) -> str:
    cleanr = re.compile('<.*?>')
    cleantext = re.sub(cleanr, '', raw_html or '')
    return " ".join(cleantext.split())

class ThreatNewsService:
    def __init__(self):
        self.last_sync = None

    def fetch_feeds(self) -> Dict[str, Any]:
        """Fetches and ingests articles from configured RSS/Atom threat intelligence feeds."""
        total_fetched = 0
        new_articles = []
        errors = []

        feed_urls = Config.RSS_FEEDS

        for feed_url in feed_urls:
            url_clean = feed_url.strip()
            if not url_clean:
                continue

            try:
                logger.info("Fetching feed: %s", url_clean)
                parsed = feedparser.parse(url_clean)

                source_name = parsed.feed.get("title", "Threat Intelligence Wire")
                if "cisa" in url_clean.lower():
                    source_name = "CISA Advisories"
                elif "hackernews" in url_clean.lower():
                    source_name = "The Hacker News"
                elif "bleeping" in url_clean.lower():
                    source_name = "BleepingComputer"

                for entry in parsed.entries[:10]: # Process latest 10 items per feed
                    title = entry.get("title", "Threat Advisory").strip()
                    link = entry.get("link", "").strip()
                    summary = clean_html(entry.get("summary", entry.get("description", "")))[:300]
                    content = clean_html(entry.get("content", [{}])[0].get("value", summary)) if "content" in entry else summary

                    # Parse publication date
                    pub_date = datetime.now(timezone.utc).isoformat()
                    if hasattr(entry, "published_parsed") and entry.published_parsed:
                        try:
                            dt = datetime(*entry.published_parsed[:6], tzinfo=timezone.utc)
                            pub_date = dt.isoformat()
                        except Exception:
                            pass

                    # Detect category based on title & summary keywords
                    combined_text = (title + " " + summary).lower()
                    assigned_category = "General Security"
                    for kw, cat in CATEGORY_MAP.items():
                        if kw in combined_text:
                            assigned_category = cat
                            break

                    severity = "Critical" if any(w in combined_text for w in ["critical", "zero-day", "ransomware", "emergency"]) else \
                               "High" if any(w in combined_text for w in ["phishing", "trojan", "exploit", "breach"]) else "Medium"

                    article = {
                        "id": str(uuid.uuid4()),
                        "title": title,
                        "summary": summary,
                        "content": content,
                        "source_name": source_name,
                        "source_url": link,
                        "category": assigned_category,
                        "affected_sector": "Global Infrastructure & Consumers",
                        "severity": severity,
                        "published_at": pub_date,
                        "fetched_at": datetime.now(timezone.utc).isoformat(),
                        "is_featured": severity == "Critical"
                    }
                    new_articles.append(article)
                    total_fetched += 1

            except Exception as e:
                err_msg = f"Failed to ingest from {url_clean}: {str(e)}"
                logger.error(err_msg)
                errors.append(err_msg)

        if new_articles:
            added = supabase_service.add_threat_news(new_articles)
            self.last_sync = datetime.now(timezone.utc).isoformat()
            return {
                "status": "success",
                "fetched": total_fetched,
                "new_added": added,
                "errors": errors,
                "timestamp": self.last_sync
            }
        else:
            return {
                "status": "partial",
                "fetched": 0,
                "new_added": 0,
                "errors": errors,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }

threat_news_service = ThreatNewsService()

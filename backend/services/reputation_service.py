import logging
from typing import Dict, Any, List, Optional
from services.domain_analyzer import DomainAnalyzer

logger = logging.getLogger(__name__)

class ReputationService:
    """
    Extensible threat reputation provider.
    Evaluates domain reputation, known feed indicators, and malicious host lists.
    CRITICAL: Never performs arbitrary network requests or follows redirects to user-submitted targets.
    """

    def __init__(self):
        # Known threat host list / local cache
        self._blocklist: Dict[str, Dict[str, Any]] = {
            "usps-track-now.top": {
                "source": "CISA / Threat Intelligence Wire",
                "category": "Smishing / Banking Trojan Drop",
                "confidence": 98.0
            },
            "paypal-account-verification-alert.xyz": {
                "source": "APWG Phishing Feed",
                "category": "Credential Harvesting",
                "confidence": 99.0
            },
            "track-parcel-verify.top": {
                "source": "Spamhaus / PhishTank",
                "category": "Malware APK Distribution",
                "confidence": 95.0
            }
        }

    def check_reputation(self, hostname: str, registered_domain: str) -> Optional[Dict[str, Any]]:
        """
        Looks up domain in threat intelligence feeds.
        Returns indicator if present, else None.
        """
        host_clean = hostname.strip().lower()
        domain_clean = registered_domain.strip().lower()

        match = self._blocklist.get(host_clean) or self._blocklist.get(domain_clean)
        if match:
            return {
                "type": "Known Threat Intelligence Match",
                "severity": "Critical",
                "evidence": f"Host '{hostname}' is actively cataloged in {match['source']} ({match['category']}).",
                "weight": 55,
                "confidence": match["confidence"]
            }

        return None

    def add_mock_threat(self, domain: str, category: str, source: str = "Test Mock Feed"):
        """Utility for test suite to mock external reputation hits deterministically."""
        self._blocklist[domain.strip().lower()] = {
            "source": source,
            "category": category,
            "confidence": 95.0
        }

reputation_service = ReputationService()

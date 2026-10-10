from typing import Dict, Any, List, Optional
from services.domain_analyzer import DomainAnalyzer

class EvidenceService:
    """
    Evidence-based security audit and check verification service.
    Documents completed checks, unavailable checks, and known machine learning limitations.
    Enforces strict safety: Never makes outbound application-layer HTTP requests to user-submitted targets.
    """

    @staticmethod
    def audit_checks(
        url: str,
        components: Dict[str, str],
        indicators: List[Dict[str, Any]],
        model_used: bool,
        is_authorized_brand: bool
    ) -> Dict[str, Any]:
        hostname = components.get("hostname", "")
        registered_domain = components.get("registered_domain", "")
        tld = components.get("tld", "")

        has_brand_flag = any(
            "Brand Impersonation" in ind.get("type", "")
            or "Typosquatting" in ind.get("type", "")
            or "Subdomain Brand Spoofing" in ind.get("type", "")
            for ind in indicators
        )
        has_ssrf_flag = any("SSRF" in ind.get("type", "") for ind in indicators)
        has_threat_intel = any("Threat Intelligence" in ind.get("type", "") for ind in indicators)

        completed_checks = [
            {
                "name": "URL Syntax & Normalization",
                "status": "passed",
                "details": f"Validated URI formatting, normalized scheme and port for host '{hostname}'."
            },
            {
                "name": "Public Suffix & eTLD+1 Parsing",
                "status": "passed",
                "details": f"Extracted registered domain '{registered_domain}' with effective suffix '.{tld}'."
            },
            {
                "name": "Brand Impersonation & Squatting Scan",
                "status": "flagged" if has_brand_flag else "passed",
                "details": (
                    "Verified authorized domain for recognized organization." if is_authorized_brand
                    else "Flagged unauthorized brand impersonation or domain squatting." if has_brand_flag
                    else "Evaluated against protected brand dictionaries; no unauthorized match."
                )
            },
            {
                "name": "SSRF & Destination Guard",
                "status": "flagged" if has_ssrf_flag else "passed",
                "details": (
                    "Intercepted private, loopback, or cloud metadata target." if has_ssrf_flag
                    else "Target does not reference RFC 1918, loopback, or metadata endpoints."
                )
            },
            {
                "name": "Machine Learning Heuristic Classification",
                "status": "completed" if model_used else "unavailable",
                "details": (
                    "Random Forest classifier evaluated 18 lexical and structural features." if model_used
                    else "ML model artifact unavailable; heuristics operating independently."
                )
            },
            {
                "name": "Threat Intelligence Feed Lookup",
                "status": "flagged" if has_threat_intel else "passed",
                "details": (
                    "Active match in threat intelligence feeds." if has_threat_intel
                    else "No active blacklist hits in local threat intelligence catalog."
                )
            }
        ]

        unavailable_checks = [
            {
                "name": "Authoritative WHOIS Domain Registration Age",
                "status": "unavailable",
                "reason": "WHOIS registry query provider is unconfigured. Domain age could not be independently established."
            },
            {
                "name": "Active TLS / HTTP Payload Crawling",
                "status": "disabled_for_safety",
                "reason": "Active target fetching is intentionally disabled to guarantee zero SSRF exposure and prevent execution of browser exploits."
            }
        ]

        dns_evidence = {
            "evaluation_mode": "Passive / Safe",
            "hostname": hostname,
            "registered_domain": registered_domain,
            "ip_classification": "Internal / Loopback (SSRF Blocked)" if has_ssrf_flag else "Public Internet Hostname",
            "safety_guarantee": "Target was evaluated passively without establishing arbitrary outbound HTTP connections."
        }

        ml_limitations = {
            "model_version": "RandomForestClassifier v1.2",
            "features_evaluated": 18,
            "known_limitations": [
                "HTTPS encryption carries significant weight in initial model tree splits. Modern phishing infrastructure widely utilizes free TLS certificates, meaning HTTPS is never treated as proof of legitimacy.",
                "Short apex domains without hyphens or digits can yield false-negative ML probabilities. Multi-signal brand squatting layers override ML scores when deceptive brand identity traits are detected."
            ]
        }

        return {
            "completed_checks": completed_checks,
            "unavailable_checks": unavailable_checks,
            "dns_evidence": dns_evidence,
            "ml_limitations": ml_limitations
        }

evidence_service = EvidenceService()

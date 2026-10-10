import os
import re
import math
import json
import logging
from urllib.parse import urlparse
import joblib
import warnings
import numpy as np
from config import Config
from services.domain_analyzer import DomainAnalyzer
from services.reputation_service import reputation_service
from services.evidence_service import evidence_service

logger = logging.getLogger(__name__)

FEATURE_NAMES = [
    "url_length",
    "hostname_length",
    "path_length",
    "num_dots",
    "num_hyphens",
    "num_at",
    "num_subdomains",
    "has_ip",
    "is_https",
    "num_digits",
    "num_special_chars",
    "has_punycode",
    "entropy",
    "suspicious_tld",
    "suspicious_keywords_count",
    "has_redirect_param",
    "has_hex_encoding",
    "path_depth"
]

SUSPICIOUS_TLDS = {
    "top", "xyz", "click", "buzz", "fit", "work", "rest",
    "gq", "cf", "ml", "tk", "ga", "racing", "date", "icu", "to", "country"
}

SUSPICIOUS_KEYWORDS = [
    "login", "verify", "banking", "secure", "update", "account",
    "wallet", "paypal", "apple", "support", "signin", "password",
    "confirm", "security", "webscr", "ebayisapi", "auth", "claim",
    "refund", "parcel", "bonus", "reward", "urgent"
]

class MLThreatService:
    def __init__(self):
        self.model = None
        self.metadata = {}
        self.feature_names = FEATURE_NAMES
        self.load_model()

    def load_model(self):
        try:
            if os.path.exists(Config.MODEL_PATH):
                self.model = joblib.load(Config.MODEL_PATH)
                logger.info("Loaded Random Forest model from %s", Config.MODEL_PATH)
            else:
                logger.warning("Model file not found at %s. Using heuristic analysis mode.", Config.MODEL_PATH)

            if os.path.exists(Config.MODEL_METADATA_PATH):
                with open(Config.MODEL_METADATA_PATH, "r") as f:
                    self.metadata = json.load(f)
        except Exception as e:
            logger.error("Error loading ML model: %s", str(e))
            self.model = None

    def calculate_entropy(self, text: str) -> float:
        if not text:
            return 0.0
        probabilities = [float(text.count(c)) / len(text) for c in set(text)]
        return -sum(p * math.log2(p) for p in probabilities if p > 0)

    def extract_features(self, url: str) -> dict:
        url_clean = str(url).strip()
        if not url_clean.startswith(("http://", "https://")):
            parsed = urlparse("http://" + url_clean)
        else:
            parsed = urlparse(url_clean)

        hostname = parsed.hostname or ""
        path = parsed.path or ""
        query = parsed.query or ""

        url_length = len(url_clean)
        hostname_length = len(hostname)
        path_length = len(path)

        num_dots = url_clean.count(".")
        num_hyphens = url_clean.count("-")
        num_at = url_clean.count("@")

        parts = hostname.split(".")
        num_subdomains = max(0, len(parts) - 2) if len(parts) > 1 else 0

        ip_pattern = r"^(\d{1,3}\.){3}\d{1,3}$"
        has_ip = 1 if re.match(ip_pattern, hostname) else 0

        is_https = 1 if url_clean.lower().startswith("https://") else 0
        num_digits = sum(c.isdigit() for c in url_clean)

        special_chars = set("?=&%_~;,+!$*()'")
        num_special_chars = sum(c in special_chars for c in url_clean)

        has_punycode = 1 if "xn--" in hostname.lower() else 0
        entropy = round(self.calculate_entropy(url_clean), 4)

        tld = parts[-1].lower() if parts else ""
        suspicious_tld = 1 if tld in SUSPICIOUS_TLDS else 0

        url_lower = url_clean.lower()
        matched_keywords = [kw for kw in SUSPICIOUS_KEYWORDS if kw in url_lower]
        keywords_count = len(matched_keywords)

        has_redirect = 1 if any(p in query.lower() for p in ["redirect", "url=", "next=", "dest=", "return="]) else 0
        has_hex = 1 if bool(re.search(r"%[0-9a-fA-F]{2}", url_clean)) else 0
        path_depth = path.count("/")

        features = {
            "url_length": url_length,
            "hostname_length": hostname_length,
            "path_length": path_length,
            "num_dots": num_dots,
            "num_hyphens": num_hyphens,
            "num_at": num_at,
            "num_subdomains": num_subdomains,
            "has_ip": has_ip,
            "is_https": is_https,
            "num_digits": num_digits,
            "num_special_chars": num_special_chars,
            "has_punycode": has_punycode,
            "entropy": entropy,
            "suspicious_tld": suspicious_tld,
            "suspicious_keywords_count": keywords_count,
            "has_redirect_param": has_redirect,
            "has_hex_encoding": has_hex,
            "path_depth": path_depth
        }

        return features, {
            "hostname": hostname,
            "tld": tld,
            "matched_keywords": matched_keywords,
            "scheme": parsed.scheme or "http"
        }

    def analyze_url(self, raw_url: str) -> dict:
        raw_url = raw_url.strip()
        if not raw_url:
            raise ValueError("URL cannot be empty")

        # Normalize URL without fetching it over network (strict SSRF prevention)
        normalized = raw_url
        if not normalized.startswith(("http://", "https://")):
            normalized = "https://" + normalized

        features, meta = self.extract_features(normalized)
        hostname = meta.get("hostname", "")

        # 1. Advanced Domain Components Parsing (eTLD+1)
        components = DomainAnalyzer.parse_domain_components(hostname)
        registered_domain = components["registered_domain"]
        sld = components["sld"]
        tld = components["tld"]
        subdomains = components["subdomains"]

        indicators = []
        severity_score = 0.0

        # 2. SSRF Guard (Check for private/loopback/metadata IP ranges)
        ssrf_flag = DomainAnalyzer.check_ssrf_risk(hostname)
        if ssrf_flag:
            indicators.append(ssrf_flag)
            severity_score += ssrf_flag["weight"]

        # 3. Brand Impersonation & Squatting Engine
        brand_flags, is_authorized_brand = DomainAnalyzer.evaluate_brand_impersonation(components)
        for flag in brand_flags:
            indicators.append(flag)
            severity_score += flag["weight"]

        # 4. Reputation & Evidence Service
        rep_flag = reputation_service.check_reputation(hostname, registered_domain)
        if rep_flag:
            indicators.append(rep_flag)
            severity_score += rep_flag["weight"]

        # 5. ML Model Prediction
        model_used = False
        ml_prob = 0.0
        if self.model is not None:
            try:
                feature_row = np.array([[features[name] for name in self.feature_names]])
                with warnings.catch_warnings():
                    warnings.simplefilter("ignore")
                    probs = self.model.predict_proba(feature_row)[0]
                ml_prob = float(probs[1]) # probability of phishing
                model_used = True
            except Exception as e:
                logger.error("ML model prediction error: %s", str(e))
                model_used = False

        # 6. Lexical & Structural Heuristic Evidence
        if features["has_ip"] == 1 and not ssrf_flag:
            indicators.append({
                "type": "Raw IP Hostname",
                "severity": "High",
                "evidence": f"Hostname '{hostname}' uses a direct IP address rather than a domain name, commonly used to bypass domain reputation blocklists.",
                "weight": 35
            })
            severity_score += 35

        if features["has_punycode"] == 1:
            indicators.append({
                "type": "Punycode / Homoglyph Attack",
                "severity": "High",
                "evidence": f"Domain '{hostname}' uses Punycode encoding ('xn--'), frequently used in internationalized homograph phishing to impersonate brands.",
                "weight": 30
            })
            severity_score += 30

        if features["suspicious_tld"] == 1:
            indicators.append({
                "type": "High-Risk Top Level Domain (TLD)",
                "severity": "Medium",
                "evidence": f"TLD '.{tld}' is recognized on threat-intelligence watchlists as heavily abused for disposable scam infrastructure.",
                "weight": 20
            })
            severity_score += 20

        if features["is_https"] == 0:
            indicators.append({
                "type": "Unencrypted HTTP Protocol",
                "severity": "Medium",
                "evidence": "URL transmits data via cleartext HTTP without TLS encryption. Authentic services handling authentication or payment require HTTPS.",
                "weight": 15
            })
            severity_score += 15

        if features["num_subdomains"] >= 3:
            indicators.append({
                "type": "Excessive Subdomains",
                "severity": "Medium",
                "evidence": f"Host contains {features['num_subdomains']} subdomains. Attackers often chain subdomains over disposable apex domains.",
                "weight": 18
            })
            severity_score += 18

        if meta["matched_keywords"] and not brand_flags and not is_authorized_brand:
            kws = ", ".join(meta["matched_keywords"])
            indicators.append({
                "type": "Sensitive Authentication / Lure Keywords",
                "severity": "Medium",
                "evidence": f"Found sensitive keywords frequently targeted by credential harvest attacks: [{kws}].",
                "weight": min(25, len(meta["matched_keywords"]) * 10)
            })
            severity_score += min(25, len(meta["matched_keywords"]) * 10)

        if features["has_redirect_param"] == 1:
            indicators.append({
                "type": "Open Redirect Parameter",
                "severity": "Medium",
                "evidence": "Detected redirection parameter ('redirect', 'next', 'url='), which can be chained to obscure destination fraud pages.",
                "weight": 15
            })
            severity_score += 15

        if features["entropy"] > 4.6:
            indicators.append({
                "type": "High Entropy / Random Characters",
                "severity": "Low",
                "evidence": f"URL exhibits high Shannon entropy ({features['entropy']}), consistent with algorithmic domain generation (DGA) or session obfuscation.",
                "weight": 10
            })
            severity_score += 10

        # 7. Multi-Signal Scoring Calculation
        has_critical_indicator = any(ind.get("severity") == "Critical" for ind in indicators)
        has_brand_squatting = any("Brand Impersonation" in ind.get("type", "") or "Brand Deception" in ind.get("type", "") or "Subdomain Brand Spoofing" in ind.get("type", "") for ind in indicators)
        is_verified_safe = is_authorized_brand or DomainAnalyzer.is_verified_safe_domain(registered_domain)

        if model_used:
            combined_score = (ml_prob * 45.0) + min(55.0, (severity_score / 100.0) * 55.0)
            confidence = round(max(70.0, min(99.0, abs(ml_prob - 0.5) * 100.0 + 50.0)), 1)
        else:
            combined_score = min(100.0, severity_score)
            confidence = 82.0

        if has_critical_indicator or has_brand_squatting or ssrf_flag:
            combined_score = max(combined_score, 85.0)
            confidence = max(confidence, 94.0)

        risk_score = round(min(100.0, max(0.0, combined_score)), 1)

        # 8. Four Outcomes Determination: low, suspicious, high, unverified
        # Rule: NEVER automatically label a URL as "low" just because it uses HTTPS or has no threat reports!
        if (
            has_critical_indicator
            or has_brand_squatting
            or ssrf_flag
            or features["has_ip"] == 1
            or features["has_punycode"] == 1
            or risk_score >= 65.0
            or ml_prob >= 0.65
        ):
            risk_level = "high"
        elif (
            risk_score >= 35.0
            or len(indicators) >= 2
            or any(ind.get("severity") == "High" for ind in indicators)
            or (features["suspicious_tld"] == 1 and meta["matched_keywords"])
        ):
            risk_level = "suspicious"
        elif is_verified_safe and len(indicators) == 0 and risk_score < 25.0:
            risk_level = "low"
        else:
            # Domain is syntactically valid and has no critical threats,
            # but is NOT on verified authoritative brand registries.
            risk_level = "unverified"
            # ZERO-TRUST DEFENSE: Absence of blacklist hits does NOT mean safe!
            # An attacker could own this newly registered or untrusted domain.
            # Enforce a baseline uncertainty risk floor (35.0) and inject explicit Zero-Trust indicator.
            risk_score = round(max(35.0, risk_score), 1)
            indicators.append({
                "type": "Unverified Domain / Zero-Trust Caution",
                "severity": "Medium",
                "evidence": f"Domain '{registered_domain}' lacks verified enterprise provenance or established reputation history. Attackers frequently register fresh, clean-looking domains to bypass legacy blacklists and distribute targeted phishing or malware.",
                "weight": 25
            })

        # 9. Tailored Actionable Recommendations
        if risk_level == "high":
            affected_brand = next((ind.get("brand_affected") for ind in indicators if ind.get("brand_affected")), None)
            if affected_brand:
                recommended_actions = [
                    f"CRITICAL: Do NOT enter credentials or OTPs on this site. It impersonates {affected_brand}.",
                    f"Report this domain to {affected_brand}'s official fraud reporting center.",
                    "If credentials were submitted, change your account password immediately and revoke active sessions.",
                    "Block the domain on your organization's perimeter DNS and web gateway."
                ]
            else:
                recommended_actions = [
                    "DO NOT visit or interact with this URL.",
                    "Never enter passwords, two-factor authentication OTPs, or financial credentials.",
                    "If received via email or SMS, report it as a malicious communication to IT security.",
                    "Block or blacklist the destination hostname across your network firewall."
                ]
        elif risk_level == "suspicious":
            recommended_actions = [
                "Exercise extreme caution; destination exhibits structural or lexical risk traits.",
                "Inspect the SSL certificate and registered apex domain manually before proceeding.",
                "Look for deceptive subdomains masquerading as trusted organizations.",
                "Do not download attachments, executables, or profile configuration files from this source."
            ]
        elif risk_level == "low":
            recommended_actions = [
                "Destination matches an officially recognized, verified organization domain.",
                "Verify standard HTTPS padlock when submitting sensitive personal or billing information.",
                "Always access sensitive services through known bookmarks or official mobile applications."
            ]
        else: # unverified
            recommended_actions = [
                "ZERO-TRUST CAUTION: Domain lacks verified organizational credentials. If an unknown person sent you this link, do NOT trust it.",
                "Zero known blacklist reports does NOT equal safety. Fresh attacker domains often evade blocklists for the first 24-48 hours.",
                "Never enter passwords, two-factor OTPs, or financial information on an unverified destination.",
                "If this is an unexpected email or SMS claiming to be an urgent invoice or login, verify through a trusted secondary channel."
            ]

        # 10. Summary Text
        if risk_level == "high":
            if has_brand_squatting:
                brand_name = next((ind.get("brand_affected") for ind in indicators if ind.get("brand_affected")), "a recognized brand")
                summary = f"High-risk threat detected: Unauthorized brand impersonation / domain squatting targeting {brand_name}."
            elif ssrf_flag:
                summary = "Critical security alert: Internal network / Cloud metadata SSRF probe detected."
            else:
                summary = f"High probability of malicious intent. Detected {len(indicators)} significant risk indicator(s)."
        elif risk_level == "suspicious":
            summary = "Suspicious characteristics identified. URL exhibits abnormal structural traits or keywords warranting caution."
        elif risk_level == "low":
            summary = "Verified authentic domain matching official organization records with clean threat telemetry."
        else: # unverified
            summary = f"Unverified destination ({registered_domain}). Zero known blacklist hits does NOT mean safe—adversaries often use newly registered or untrusted domains to conduct targeted attacks."

        feature_breakdown = {
            "entropy": features["entropy"],
            "url_length": features["url_length"],
            "subdomains": features["num_subdomains"],
            "special_chars": features["num_special_chars"],
            "has_https": bool(features["is_https"]),
            "has_ip": bool(features["has_ip"]),
            "suspicious_tld": bool(features["suspicious_tld"]),
            "keyword_count": features["suspicious_keywords_count"],
            "registered_domain": registered_domain,
            "sld": sld,
            "tld": tld,
            "is_authorized_brand": is_authorized_brand
        }

        evidence_audit = evidence_service.audit_checks(
            url=normalized,
            components=components,
            indicators=indicators,
            model_used=model_used,
            is_authorized_brand=is_authorized_brand
        )

        return {
            "target": raw_url,
            "normalized_url": normalized,
            "scan_type": "url",
            "risk_level": risk_level,
            "risk_score": risk_score,
            "confidence": confidence,
            "model_version": self.metadata.get("version", "1.2.0"),
            "model_used": model_used,
            "indicators": indicators,
            "feature_breakdown": feature_breakdown,
            "summary": summary,
            "recommended_actions": recommended_actions,
            "extracted_features": features,
            "domain_details": components,
            "evidence_audit": evidence_audit
        }

ml_service = MLThreatService()

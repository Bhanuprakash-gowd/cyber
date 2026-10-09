import re
import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

URL_REGEX = r'https?://(?:[-\w.]|(?:%[\da-fA-F]{2}))+[^\s]*'

SHORTENED_DOMAINS = {
    "bit.ly", "tinyurl.com", "t.co", "is.gd", "buff.ly", "ow.ly",
    "cutt.ly", "rb.gy", "shorturl.at", "soo.gd", "rebrand.ly"
}

SCAM_PATTERNS = [
    {
        "category": "High Urgency & Coercion",
        "severity": "High",
        "weight": 25,
        "keywords": [
            r"\bimmediate(?:ly)?\b", r"\bwithin 24 hours\b", r"\baccount (?:suspended|terminated|locked)\b",
            r"\bfinal notice\b", r"\blegal action\b", r"\bwarrant\b", r"\barrest\b", r"\baction required immediately\b"
        ],
        "explanation": "Threat actors use artificial deadlines and intimidation to pressure victims into bypassing caution."
    },
    {
        "category": "Credential & Sensitive Data Harvesting",
        "severity": "Critical",
        "weight": 35,
        "keywords": [
            r"\bpassword\b", r"\b(?:one[\s-]?time\s*pin|otp|passcode)\b", r"\bcvv\b",
            r"\bcard number\b", r"\bseed phrase\b", r"\bprivate key\b", r"\bverify your identity\b",
            r"\bconfirm your credentials\b", r"\benter your pin\b"
        ],
        "explanation": "Direct solicitations for security credentials, one-time passwords, or encryption recovery keys are hallmark phishing signs."
    },
    {
        "category": "Financial Lure, Prize or Lottery Scam",
        "severity": "High",
        "weight": 25,
        "keywords": [
            r"\bcongratulations\b.*\bwon\b", r"\blottery winner\b", r"\bclaim your (?:reward|prize|grant)\b",
            r"\btax refund approved\b", r"\bcashback voucher\b", r"\bunclaimed funds\b", r"\bgiveaway\b"
        ],
        "explanation": "Promises of unsolicited windfalls, refunds, or sweepstakes designed to extract advance-fee payments or banking details."
    },
    {
        "category": "Fake Courier & Parcel Delivery",
        "severity": "High",
        "weight": 25,
        "keywords": [
            r"\bparcel (?:pending|held|failed)\b", r"\bincomplete address\b", r"\bredelivery fee\b",
            r"\bcustoms fee\b", r"\btrack your package\b", r"\bshipment exception\b"
        ],
        "explanation": "Impersonates postal services (USPS, FedEx, DHL) demanding address updates or nominal redelivery fees."
    },
    {
        "category": "Fake Job & Task Scheme Fraud",
        "severity": "High",
        "weight": 30,
        "keywords": [
            r"\bdaily (?:salary|income|payout)\b", r"\btelegram (?:channel|recruiter|hr)\b",
            r"\bdeposit to upgrade\b", r"\brating hotels?\b", r"\blike youtube videos?\b",
            r"\bpart[\s-]?time remote job\b", r"\bearn \$?\d+00 daily\b"
        ],
        "explanation": "Classic task/job scam where victims are induced to deposit money into bogus trading or task escrow platforms."
    },
    {
        "category": "Payment / UPI QR Code Manipulation",
        "severity": "High",
        "weight": 30,
        "keywords": [
            r"\bscan (?:this )?qr code to receive\b", r"\benter upi pin to receive money\b",
            r"\benter pin to credit\b", r"\baccept payment request\b"
        ],
        "explanation": "Deceptive payment manipulation: entering a PIN or approving a collect request always transfers money OUT, never receives funds."
    }
]

class EmailThreatAnalyzer:
    def analyze_message(self, text: str, channel: str = "email") -> Dict[str, Any]:
        text_clean = str(text or "").strip()
        if not text_clean:
            raise ValueError("Message body cannot be empty")

        total_length = len(text_clean)
        extracted_urls = re.findall(URL_REGEX, text_clean)
        shortened_links = []
        for u in extracted_urls:
            domain_match = re.search(r'https?://([^/]+)', u)
            if domain_match and domain_match.group(1).lower() in SHORTENED_DOMAINS:
                shortened_links.append(u)

        indicators: List[Dict[str, Any]] = []
        score = 0.0

        # Run heuristic scanners
        for rule in SCAM_PATTERNS:
            matched_snippets = []
            for pattern in rule["keywords"]:
                found = re.findall(pattern, text_clean, flags=re.IGNORECASE)
                if found:
                    matched_snippets.extend(found[:2])

            if matched_snippets:
                indicators.append({
                    "type": rule["category"],
                    "severity": rule["severity"],
                    "evidence": f"Found phrases matching scam pattern: '{', '.join(set(matched_snippets))}'. {rule['explanation']}",
                    "weight": rule["weight"]
                })
                score += rule["weight"]

        # URL Analysis inside message
        if shortened_links:
            indicators.append({
                "type": "Shortened Link Detected",
                "severity": "Medium",
                "evidence": f"Contains URL shortener link ({', '.join(shortened_links)}), which conceals the destination URL from recipients.",
                "weight": 20
            })
            score += 20
        elif extracted_urls:
            indicators.append({
                "type": "Embedded Links",
                "severity": "Low",
                "evidence": f"Message contains {len(extracted_urls)} hyperlink(s). Phishing campaigns often link to lookalike login forms.",
                "weight": 10
            })
            score += 10

        # Excessive punctuation / caps
        caps_ratio = sum(1 for c in text_clean if c.isupper()) / max(1, len(text_clean))
        if caps_ratio > 0.35 and total_length > 40:
            indicators.append({
                "type": "Aggressive Capitalization",
                "severity": "Low",
                "evidence": f"Message uses excessive uppercase lettering ({int(caps_ratio*100)}% of characters), a pressure tactic.",
                "weight": 8
            })
            score += 8

        # Normalize Risk Score
        risk_score = round(min(100.0, max(0.0, score)), 1)
        confidence = 85.0 if len(indicators) > 0 else 75.0

        if risk_score >= 60.0 or any(ind["severity"] == "Critical" for ind in indicators):
            risk_level = "high"
        elif risk_score >= 25.0:
            risk_level = "suspicious"
        else:
            risk_level = "low"

        # Actions
        if risk_level == "high":
            recommended_actions = [
                "DO NOT reply, click any embedded links, or call the contact number provided.",
                "Never share OTPs, passwords, bank account details, or identity documents.",
                "If the message claims to be from a bank or employer, contact them directly through their official application or verified website.",
                "Block the sender and report as spam/fraud in your messaging client."
            ]
        elif risk_level == "suspicious":
            recommended_actions = [
                "Treat this message with caution. Verify the sender's actual email header or phone number.",
                "Independently verify any claims (such as an undelivered parcel or account issue) on the vendor's official portal.",
                "Do not forward the message to colleagues or family members."
            ]
        else:
            recommended_actions = [
                "No critical threat patterns or credential harvesting requests detected.",
                "Always remain alert if sender identity cannot be verified or requests money unexpectedly."
            ]

        # Sanitized preview snippet for display (privacy-safe, never store sensitive data)
        preview_length = min(120, len(text_clean))
        sanitized_preview = text_clean[:preview_length] + ("..." if len(text_clean) > preview_length else "")

        summary = (
            f"High-risk message detected. Found {len(indicators)} severe indicator(s)." if risk_level == "high"
            else f"Suspicious message. Contains {len(indicators)} indicator(s) suggesting potential fraud." if risk_level == "suspicious"
            else "Low-risk text. No standard fraud heuristics triggered."
        )

        return {
            "target": sanitized_preview,
            "scan_type": channel or "email",
            "risk_level": risk_level,
            "risk_score": risk_score,
            "confidence": confidence,
            "indicators": indicators,
            "extracted_urls": extracted_urls,
            "feature_breakdown": {
                "message_length": total_length,
                "url_count": len(extracted_urls),
                "shortened_url_count": len(shortened_links),
                "indicators_count": len(indicators)
            },
            "summary": summary,
            "recommended_actions": recommended_actions
        }

email_analyzer = EmailThreatAnalyzer()

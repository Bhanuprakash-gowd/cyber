import logging
from typing import List, Dict, Any, Optional
import requests
from config import Config

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are CyberSentry AI, an elite cybersecurity defense assistant and safety educator.
Your role:
1. Explain suspicious URLs, email lures, and social engineering indicators in clear, accessible language.
2. Provide immediate, actionable recovery steps if a user suspects they entered credentials or sent money to a scammer.
3. Clarify threat mechanisms (such as QR payment manipulation, reverse phishing, homograph attacks, and task scams).
4. Emphasize defensive precautions: never share OTPs, passwords, or seed phrases.
5. Base explanations on factual cybersecurity standards (NIST, CISA, OWASP). Never invent statistics or facts.
"""

KNOWLEDGE_BASE = {
    "upi": """**UPI / QR Code Scam Defense:**
- **Core Rule:** Entering your UPI PIN or approving a collect request in a payment app ALWAYS debits money from your account. You NEVER need to enter a PIN to receive money.
- **Common Trick:** Scammers send a "Request Money" link disguised as an advance payment on OLX or marketplace listings, asking you to click "Pay" to "claim" the balance.
- **Action:** Reject the payment request immediately. If funds were debited, contact your bank's fraud desk within 2 hours to freeze the transaction and register a complaint at cybercrime.gov.in (or national portal).""",

    "parcel": """**Parcel Delivery Smishing (SMS Phishing):**
- **How it works:** Attackers mass-send SMS texts claiming 'Your parcel has an incomplete house number. Update your details within 12 hours to avoid return: [fake link]'.
- **The Catch:** The landing page mimics USPS, FedEx, or DHL and demands a tiny 'redelivery fee' (e.g. $1.50) to steal full credit card details (card number, CVV, expiry) plus an OTP.
- **Action:** Postal couriers do not text asking for card payments via random non-official domains. Go directly to usps.com, fedex.com, or dhl.com with your original tracking ID.""",

    "job": """**Fake Job & Telegram Task Fraud:**
- **How it works:** Recruiters reach out on WhatsApp/Telegram offering $100–$500/day for 'rating hotels', 'subscribing to YouTube channels', or 'placing e-commerce orders'.
- **The Trap:** They give you small real payouts ($10-$20) first to build trust. Then they require you to 'recharge' or deposit $100+ to unlock higher tiers or withdraw earnings. Once deposited, withdrawal is locked forever with demands for more 'taxes'.
- **Action:** Real employers NEVER require candidates to pay or deposit cryptocurrency to work. Cease contact immediately and do not send funds.""",

    "compromised": """**Immediate Action Plan if You Clicked a Phishing Link or Entered Credentials:**
1. **Change Passwords Immediately:** From a known clean device, change passwords for the affected account (email, bank, social media).
2. **Revoke Active Sessions:** Go to account security settings and click 'Log out of all devices / Revoke all sessions'.
3. **Turn on Multi-Factor Authentication (MFA):** Use an Authenticator App (Google Authenticator, Microsoft Authenticator) or hardware security key instead of SMS.
4. **Notify Your Bank:** If banking details or cards were entered, call the 24/7 fraud helpline on the back of your card to lock the card and reverse pending authorizations.
5. **Scan for Malware:** If you downloaded any file (.apk, .exe, .zip), run a full scan with Windows Defender / reputable antivirus.
6. **File an Official Report:** File an incident report with your national cybercrime portal or local authorities."""
}

class AssistantService:
    def chat(self, message: str, context: Optional[Dict[str, Any]] = None, conversation_history: Optional[List[Dict[str, str]]] = None) -> Dict[str, Any]:
        message_clean = (message or "").strip()
        if not message_clean:
            return {"reply": "Please ask a question about cybersecurity, a scan report, or an ongoing scam attempt."}

        # Check if external LLM API is configured
        if Config.LLM_API_KEY and Config.LLM_PROVIDER == "openai":
            try:
                headers = {
                    "Authorization": f"Bearer {Config.LLM_API_KEY}",
                    "Content-Type": "application/json"
                }
                messages = [{"role": "system", "content": SYSTEM_PROMPT}]
                if context:
                    messages.append({
                        "role": "system",
                        "content": f"User context: Currently reviewing scan target '{context.get('target')}', risk level: {context.get('risk_level')}, score: {context.get('risk_score')}."
                    })
                if conversation_history:
                    for h in conversation_history[-4:]:
                        messages.append({"role": h.get("role", "user"), "content": h.get("content", "")})
                messages.append({"role": "user", "content": message_clean})

                payload = {
                    "model": Config.LLM_MODEL or "gpt-4o-mini",
                    "messages": messages,
                    "max_tokens": 500,
                    "temperature": 0.3
                }
                res = requests.post("https://api.openai.com/v1/chat/completions", json=payload, headers=headers, timeout=10)
                if res.status_code == 200:
                    reply_text = res.json()["choices"][0]["message"]["content"]
                    return {"reply": reply_text, "source": "llm_openai", "model": Config.LLM_MODEL}
            except Exception as e:
                logger.warning("LLM API failed (%s). Falling back to expert security rules.", str(e))

        # Built-in Expert Rule-based Engine Fallback
        reply = self._generate_expert_reply(message_clean, context)
        return {
            "reply": reply,
            "source": "cybersentry_expert_engine",
            "model": "CyberSentry Knowledge Engine v1.2"
        }

    def _generate_expert_reply(self, message: str, context: Optional[Dict[str, Any]] = None) -> str:
        q = message.lower()

        # Check for emergency/compromised keywords
        if any(w in q for w in ["scammed", "clicked", "hacked", "entered password", "sent money", "compromised", "help me"]):
            return (
                "🚨 **Urgent Security Incident Guidance**\n\n"
                + KNOWLEDGE_BASE["compromised"]
                + "\n\n💡 *CyberSentry Reminder: Never share current passwords, OTPs, or financial details in any chat.*"
            )

        # UPI / QR Payment query
        if any(w in q for w in ["upi", "qr code", "receive money", "gpay", "phonepe", "paytm"]):
            return (
                "💳 **UPI & Payment QR Code Scam Analysis**\n\n"
                + KNOWLEDGE_BASE["upi"]
            )

        # Parcel / delivery query
        if any(w in q for w in ["parcel", "package", "delivery", "usps", "fedex", "dhl", "redelivery"]):
            return (
                "📦 **Courier & Delivery Smishing Warning**\n\n"
                + KNOWLEDGE_BASE["parcel"]
            )

        # Job / telegram fraud query
        if any(w in q for w in ["job", "salary", "telegram", "task", "hotel rating", "part time"]):
            return (
                "💼 **Fake Job & Task Scheme Intelligence**\n\n"
                + KNOWLEDGE_BASE["job"]
            )

        # If analyzing context from scan
        if context and context.get("target"):
            risk = context.get("risk_level", "unknown").upper()
            score = context.get("risk_score", 0)
            target = context.get("target")
            return (
                f"🔍 **Analysis for Scan Target: `{target}`**\n\n"
                f"- **Risk Level:** **{risk}** (Score: {score}/100)\n"
                f"- **Model Findings:** {context.get('summary', 'Standard heuristic evaluation.')}\n\n"
                "**Recommended Safety Steps:**\n"
                + "\n".join(f"- {act}" for act in context.get("recommended_actions", ["Verify official domain name carefully."]))
            )

        # General password & MFA guidance
        if any(w in q for w in ["password", "mfa", "2fa", "two-factor", "safe", "protect"]):
            return (
                "🛡️ **Essential Account Defense Best Practices:**\n\n"
                "1. **Passphrase Length:** Use unique passwords of 14+ characters (preferably a randomized 4-word passphrase) stored in a password manager.\n"
                "2. **Hardware or App-Based 2FA:** Switch from SMS-based verification to Time-Based One-Time Password (TOTP) apps like Google Authenticator or YubiKey.\n"
                "3. **Zero Trust Browsing:** Do not log into sensitive portals via links sent over text or unverified emails. Always type the verified URL directly.\n"
                "4. **Email Header Inspection:** Inspect the actual sender domain behind display names."
            )

        # Default cybersecurity consultation reply
        return (
            "Hello! I am your **CyberSentry AI Safety Assistant**.\n\n"
            "I can help you with:\n"
            "- 🔎 Explaining indicators found during URL or email scans\n"
            "- 🛡️ Understanding common scams (UPI QR frauds, fake delivery SMS, task jobs)\n"
            "- 🚨 Emergency recovery steps if you clicked a suspicious link\n"
            "- 🔒 Fortifying your passwords, MFA, and online privacy\n\n"
            "Feel free to ask a specific question or describe any suspicious message you received!"
        )

assistant_service = AssistantService()

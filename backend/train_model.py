"""
CyberSentry AI - Machine Learning Model Training Pipeline
Trains a Scikit-Learn Random Forest Classifier on engineered URL security features.
Outputs:
- model/phishing_model.joblib
- model/feature_names.json
- model/model_metadata.json
"""

import os
import re
import math
import json
from urllib.parse import urlparse
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, precision_score, recall_score, f1_score
import joblib

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
    "gq", "cf", "ml", "tk", "ga", "racing", "date", "icu"
}

SUSPICIOUS_KEYWORDS = [
    "login", "verify", "banking", "secure", "update", "account",
    "wallet", "paypal", "apple", "support", "signin", "password",
    "confirm", "security", "webscr", "ebayisapi", "auth", "claim",
    "refund", "parcel", "bonus", "reward", "urgent"
]

def calculate_entropy(text: str) -> float:
    if not text:
        return 0.0
    probabilities = [float(text.count(c)) / len(text) for c in set(text)]
    return -sum(p * math.log2(p) for p in probabilities if p > 0)

def extract_features(url: str) -> dict:
    url = str(url).strip()
    if not url.startswith(("http://", "https://")):
        parsed = urlparse("http://" + url)
    else:
        parsed = urlparse(url)

    hostname = parsed.hostname or ""
    path = parsed.path or ""
    query = parsed.query or ""

    # 1. Lengths
    url_length = len(url)
    hostname_length = len(hostname)
    path_length = len(path)

    # 2. Characters
    num_dots = url.count(".")
    num_hyphens = url.count("-")
    num_at = url.count("@")

    # 3. Subdomains
    parts = hostname.split(".")
    num_subdomains = max(0, len(parts) - 2) if len(parts) > 1 else 0

    # 4. IP check
    ip_pattern = r"^(\d{1,3}\.){3}\d{1,3}$"
    has_ip = 1 if re.match(ip_pattern, hostname) else 0

    # 5. HTTPS
    is_https = 1 if url.lower().startswith("https://") else 0

    # 6. Digits
    num_digits = sum(c.isdigit() for c in url)

    # 7. Special chars
    special_chars = set("?=&%_~;,+!$*()'")
    num_special_chars = sum(c in special_chars for c in url)

    # 8. Punycode
    has_punycode = 1 if "xn--" in hostname.lower() else 0

    # 9. Shannon Entropy
    entropy = round(calculate_entropy(url), 4)

    # 10. Suspicious TLD
    tld = parts[-1].lower() if parts else ""
    suspicious_tld = 1 if tld in SUSPICIOUS_TLDS else 0

    # 11. Suspicious keywords count
    url_lower = url.lower()
    keywords_count = sum(1 for kw in SUSPICIOUS_KEYWORDS if kw in url_lower)

    # 12. Redirect parameter
    has_redirect = 1 if any(param in query.lower() for param in ["redirect", "url=", "next=", "dest=", "return="]) else 0

    # 13. Hex encoding
    has_hex = 1 if bool(re.search(r"%[0-9a-fA-F]{2}", url)) else 0

    # 14. Path depth
    path_depth = path.count("/")

    return {
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

def generate_training_data():
    """Generates a verified dataset of benign and phishing URL samples for training."""
    benign_samples = [
        "https://www.google.com",
        "https://www.github.com/torvalds/linux",
        "https://en.wikipedia.org/wiki/Computer_security",
        "https://www.cisa.gov/cybersecurity-advisories",
        "https://docs.python.org/3/library/urllib.parse.html",
        "https://www.microsoft.com/en-us/security",
        "https://developer.mozilla.org/en-US/docs/Web/HTTP",
        "https://www.amazon.com/dp/B08N5WRWNW",
        "https://stackoverflow.com/questions/tagged/python",
        "https://news.ycombinator.com/item?id=3841029",
        "https://www.nytimes.com/section/technology",
        "https://www.bbc.com/news/world",
        "https://www.cloudflare.com/learning/ddos/what-is-ddos/",
        "https://www.apple.com/support/system-status/",
        "https://www.chase.com/personal/banking",
        "https://www.paypal.com/us/home",
        "https://www.linkedin.com/jobs/view/392019",
        "https://react.dev/learn/start-a-new-react-project",
        "https://tailwindcss.com/docs/installation",
        "https://supabase.com/docs/guides/auth",
        "https://www.netflix.com/browse",
        "https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M",
        "https://www.reddit.com/r/netsec/",
        "https://hub.docker.com/_/python",
        "https://pypi.org/project/scikit-learn/",
        "https://www.kaggle.com/datasets",
        "https://archive.org/web/",
        "https://www.w3.org/Protocols/rfc2616/rfc2616.html",
        "https://medium.com/@infosec-weekly/latest-threats",
        "https://www.bloomberg.com/markets",
        "https://www.reuters.com/business/finance/",
        "https://arxiv.org/abs/2301.00234",
        "https://www.coursera.org/learn/cyber-security-basics",
        "https://www.mit.edu/research/",
        "https://www.stanford.edu/academics/",
        "https://usps.com/tracking/",
        "https://www.fedex.com/en-us/tracking.html",
        "https://www.dhl.com/global-en/home/tracking.html",
        "https://bankofamerica.com/online-banking/",
        "https://wellsfargo.com/help/"
    ]

    # Synthesize diverse variations of benign URLs
    expanded_benign = []
    for base in benign_samples:
        expanded_benign.append(base)
        expanded_benign.append(base + "?ref=homepage")
        expanded_benign.append(base + "/articles/2026/security-brief.html")
        expanded_benign.append(base + "/view/doc?id=" + str(np.random.randint(1000, 99999)))

    phishing_samples = [
        "http://192.168.1.105/bank-login/verify.php",
        "http://185.220.101.4/secure-chase-online/auth.html",
        "http://paypal-security-update-verification.com.top/login",
        "http://apple-id-verify-account-locked.xyz/signin?id=920",
        "http://netflix-billing-reactivate-urgent.click/session/start",
        "http://bankofamerica-online-secure-auth.xyz/portal/verify",
        "http://login.microsoft.com.account-verification-alert.top/auth",
        "http://usps-redelivery-tracking-fee.xyz/package/pay-fee?id=992819",
        "http://fedex-parcel-status-update.top/confirm-address.php?trk=8812739",
        "http://dhl-shipment-clearance-customs.click/download/app.apk",
        "http://amazon-prime-account-suspended-action.top/billing",
        "http://chase-bank-alert-fraud-prevention.xyz/login/verify.jsp",
        "http://wellsfargo-identity-confirmation.top/auth/token?usr=victim",
        "http://secure-login-crypto-wallet-connect.xyz/phrase/import",
        "http://metamask-seed-phrase-security.top/restore/wallet",
        "http://steamcommunity-gift-trade-free.xyz/promo/claim-knife",
        "http://telegram-account-verification-code.top/session?auth=sms",
        "http://whatsapp-web-scan-qr-code.xyz/login.php",
        "http://urgent-irs-tax-refund-application.click/claim/form",
        "http://gov-covid-relief-disbursement.top/apply/payout",
        "http://xn--pypal-4ve.com/signin/webscr",
        "http://xn--mcrosoft-f4a.xyz/login-session",
        "http://secure-banking-portal-redirect.top/go?url=http://malicious.ru",
        "http://free-iphone-winner-survey-claim.click/reward/index.php",
        "http://job-offer-daily-income-telegram.top/register?ref=recruiter",
        "http://upi-refund-verification-portal.xyz/pay/verify-pin.html",
        "http://electric-bill-disconnection-prevent.click/bill/pay-now.php",
        "http://facebook-security-team-violation-appeal.top/appeal.html",
        "http://instagram-blue-tick-verification-form.xyz/apply",
        "http://twitter-x-subscription-renewal-fail.click/billing-fix"
    ]

    expanded_phishing = []
    for base in phishing_samples:
        expanded_phishing.append(base)
        expanded_phishing.append(base + "?session=" + hex(np.random.randint(100000, 999999)))
        expanded_phishing.append(base + "/login.php?redirect=https://legit.com")
        expanded_phishing.append(base + "&token=user_auth_key_" + str(np.random.randint(10, 99)))

    # Balance datasets
    labels = [0] * len(expanded_benign) + [1] * len(expanded_phishing)
    all_urls = expanded_benign + expanded_phishing

    rows = [extract_features(u) for u in all_urls]
    df = pd.DataFrame(rows)
    df["label"] = labels
    return df

def train_and_export():
    print("[*] Generating training dataset with security feature extraction...")
    df = generate_training_data()
    print(f"[*] Dataset size: {len(df)} samples ({sum(df['label'] == 0)} benign, {sum(df['label'] == 1)} phishing)")

    X = df[FEATURE_NAMES]
    y = df["label"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=42, stratify=y
    )

    print("[*] Training Random Forest Classifier...")
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=12,
        min_samples_split=2,
        random_state=42,
        class_weight="balanced"
    )
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]

    acc = float(accuracy_score(y_test, y_pred))
    prec = float(precision_score(y_test, y_pred, zero_division=0))
    rec = float(recall_score(y_test, y_pred, zero_division=0))
    f1 = float(f1_score(y_test, y_pred, zero_division=0))
    cm = confusion_matrix(y_test, y_pred).tolist()

    print("\n[+] Model Evaluation Metrics:")
    print(f"    - Accuracy:  {acc:.4f}")
    print(f"    - Precision: {prec:.4f}")
    print(f"    - Recall:    {rec:.4f}")
    print(f"    - F1 Score:  {f1:.4f}")
    print(f"    - Confusion Matrix: {cm}")

    # Feature Importance
    importances = model.feature_importances_
    feat_importance_dict = {
        name: round(float(imp), 4)
        for name, imp in sorted(zip(FEATURE_NAMES, importances), key=lambda x: x[1], reverse=True)
    }

    print("\n[+] Top Feature Importances:")
    for name, imp in list(feat_importance_dict.items())[:6]:
        print(f"    - {name}: {imp}")

    # Output directory
    os.makedirs("./model", exist_ok=True)
    model_path = "./model/phishing_model.joblib"
    joblib.dump(model, model_path)
    print(f"\n[+] Saved model artifact to: {model_path}")

    # Save feature names
    with open("./model/feature_names.json", "w") as f:
        json.dump(FEATURE_NAMES, f, indent=2)

    # Save model metadata
    metadata = {
        "model_name": "CyberSentry Random Forest URL Threat Classifier",
        "version": "1.2.0",
        "algorithm": "RandomForestClassifier(n_estimators=100, max_depth=12)",
        "features": FEATURE_NAMES,
        "metrics": {
            "accuracy": acc,
            "precision": prec,
            "recall": rec,
            "f1_score": f1,
            "confusion_matrix": cm,
            "test_sample_size": len(y_test),
            "train_sample_size": len(y_train)
        },
        "feature_importances": feat_importance_dict
    }

    with open("./model/model_metadata.json", "w") as f:
        json.dump(metadata, f, indent=2)

    print("[+] Model metadata saved to: ./model/model_metadata.json")
    print("[OK] Pipeline execution finished successfully.")

if __name__ == "__main__":
    train_and_export()

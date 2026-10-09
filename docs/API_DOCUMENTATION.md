# CyberSentry AI — REST API Documentation

Base URL: `http://localhost:5000` (or configured deployment URL)

All endpoints accept and return `application/json` unless otherwise specified.

---

### 1. Health Check
- **Endpoint:** `GET /api/health`
- **Description:** Verifies service health, loaded ML models, and database mode.
- **Response:**
  ```json
  {
    "status": "healthy",
    "service": "CyberSentry AI Backend",
    "version": "1.2.0",
    "ml_engine": "RandomForestClassifier",
    "ml_model_loaded": true,
    "database_mode": "Local Resilient Store",
    "llm_provider": "Internal Expert Heuristic Engine"
  }
  ```

---

### 2. Analyze URL
- **Endpoint:** `POST /api/analyze-url`
- **Request Body:**
  ```json
  {
    "url": "http://paypal-security-update-verification.com.top/login",
    "user_id": "optional-uuid"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "id": "28f250dd-9131-41c6-bcec-96a178c5f347",
    "scan_type": "url",
    "target": "http://paypal-security-update-verification.com.top/login",
    "risk_level": "high",
    "risk_score": 83.4,
    "confidence": 99.0,
    "model_version": "1.2.0",
    "indicators": [
      {
        "type": "High-Risk Top Level Domain (TLD)",
        "severity": "Medium",
        "evidence": "TLD '.top' is recognized on threat-intelligence watchlists...",
        "weight": 20
      }
    ],
    "feature_breakdown": {
      "entropy": 4.27,
      "has_https": false,
      "has_ip": false,
      "keyword_count": 4,
      "subdomains": 1,
      "suspicious_tld": true,
      "url_length": 56
    },
    "summary": "High probability of malicious intent...",
    "recommended_actions": [
      "DO NOT visit or interact with this URL.",
      "Never enter passwords, two-factor authentication OTPs..."
    ]
  }
  ```

---

### 3. Analyze Email / Message
- **Endpoint:** `POST /api/analyze-email`
- **Request Body:**
  ```json
  {
    "text": "URGENT USPS: Your package US-892147 cannot be delivered...",
    "channel": "sms",
    "user_id": "optional-uuid"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "id": "f2e5e316-016a-415f-a3b2-c76790497d0d",
    "scan_type": "sms",
    "risk_level": "suspicious",
    "risk_score": 35.0,
    "confidence": 85.0,
    "indicators": [...],
    "recommended_actions": [...]
  }
  ```

---

### 4. Scan History & Lookup
- **`GET /api/history?user_id=<optional>&limit=50`**: List recent scans.
- **`GET /api/report/<scan_id>`**: Retrieve complete scan report.
- **`DELETE /api/history/<scan_id>?user_id=<optional>`**: Remove scan record.

---

### 5. Threat News & Community Reports
- **`GET /api/news?category=<optional>&search=<optional>`**: Fetch news wire articles.
- **`GET /api/community/reports?status=approved&category=<optional>`**: Public approved reports.
- **`POST /api/community/reports`**: Submit user scam encounter for moderation.
- **`POST /api/community/reports/<id>/flag`**: Flag report for review.
- **`POST /api/community/reports/<id>/moderate`**:
  - Headers: `X-Admin-Secret: <token>`
  - Body: `{"status": "approved" | "rejected" | "flagged"}`

---

### 6. AI Assistant Chat
- **Endpoint:** `POST /api/assistant/chat`
- **Request Body:**
  ```json
  {
    "message": "What should I do if I entered credentials on a phishing page?",
    "context": { "target": "https://fake.xyz", "risk_level": "high" }
  }
  ```
- **Response:**
  ```json
  {
    "reply": "Immediate Action Plan if You Clicked a Phishing Link...",
    "source": "cybersentry_expert_engine",
    "model": "CyberSentry Knowledge Engine v1.2"
  }
  ```

---

### 7. Report Export Endpoints
- **`GET /api/export/csv?user_id=<optional>`**: Returns attachment `cybersentry_scan_history.csv`.
- **`GET /api/export/pdf/<scan_id>`**: Returns attachment `cybersentry_report_<id>.pdf`.

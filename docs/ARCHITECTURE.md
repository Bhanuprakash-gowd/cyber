# CyberSentry AI — System Architecture & Design

## 1. High-Level Architecture Overview

CyberSentry AI is a full-stack cybersecurity defense and threat intelligence platform designed for zero-trust inspection of suspicious links, emails, and scam solicitations.

```
                      +---------------------------------------+
                      |          React + Vite + TS            |
                      |   (Tailwind CSS + Lucide + Recharts)  |
                      +-------------------+-------------------+
                                          |
                        HTTPS / JSON REST | Supabase JS Client (Auth/Data)
                                          v
                      +-------------------+-------------------+
                      |         Flask REST API Engine         |
                      |           (Python 3.13)               |
                      +-----+-------------+-------------+-----+
                            |             |             |
           +----------------+             |             +-----------------+
           v                              v                               v
+-----------------------+     +-----------------------+     +---------------------------+
|  Scikit-Learn ML      |     |  Ingestion Pipeline   |     |  Export & Report Engine   |
|  Random Forest Engine |     |  RSS / Atom Feeds     |     |  ReportLab PDF / CSV      |
|  - 18 Feature Vectors |     |  - CISA Advisories    |     +---------------------------+
|  - Threat Heuristics  |     |  - The Hacker News    |                   |
+-----------------------+     |  - BleepingComputer   |                   v
                              +-----------------------+     +---------------------------+
                                          |                 |  AI Safety Assistant      |
                                          v                 |  Configurable LLM or      |
                              +-----------------------+     |  Local Expert Engine      |
                              |  Supabase PostgreSQL  |     +---------------------------+
                              |  - Row Level Security |
                              |  - Auth & Profiles    |
                              |  - Scans & Reports    |
                              +-----------------------+
```

## 2. Core Architectural Pillars

### A. Zero-Trust Web & Artifact Inspection
- Target URLs are normalized and decomposed into mathematical feature representations (entropy, subdomains, token sequences, character distributions).
- The server never visits arbitrary target URLs or downloads executable payloads during routine scanning, eliminating SSRF and drive-by malware exposure.

### B. Machine Learning Engine & Explainability
- **Model:** `RandomForestClassifier` with 100 balanced decision trees trained on structured URL indicator vectors.
- **Explainable Evidence:** In addition to the continuous risk score (0–100), the engine pinpoints specific forensic reasons (e.g. Punycode homoglyphs, high-abuse TLDs, raw IP addressing, open redirect parameters, cleartext HTTP transport).

### C. Threat News & Feed Ingestion
- Ingestion engine consumes structured RSS/Atom feeds from verified authorities:
  - CISA Cybersecurity Advisories
  - The Hacker News
  - BleepingComputer
- Deduplication is enforced based on source URL hashes with automated categorization and severity scoring.

### D. Community Scam Telemetry & Moderation
- Citizens voluntarily report fraudulent messages and tactics.
- Submissions require explicit publishing consent and enter a private moderation queue before public display.
- Data privacy guard: All records are sanitized; sensitive information (PII, passwords, OTPs) is prohibited.

### E. Database Layer & Multi-Tenant Security
- Supabase PostgreSQL with 10 core tables and Row Level Security (RLS) enabled.
- User data isolation ensures private scans remain accessible only to the originating user.
- Resilient local persistence mode enables instant out-of-the-box local development without requiring cloud credentials immediately.

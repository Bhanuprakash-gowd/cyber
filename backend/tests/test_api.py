import unittest
import json
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app import app
from services.ml_service import ml_service
from services.email_analyzer import email_analyzer

class CyberSentryBackendTests(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()
        self.client.testing = True

    def test_health_check(self):
        res = self.client.get("/api/health")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["status"], "healthy")
        self.assertTrue(data["ml_model_loaded"])

    def test_analyze_legitimate_url(self):
        res = self.client.post("/api/analyze-url", json={"url": "https://www.google.com"})
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("risk_score", data)
        self.assertIn("risk_level", data)
        self.assertEqual(data["risk_level"], "low")
        self.assertIn("recommended_actions", data)

    def test_analyze_suspicious_url(self):
        res = self.client.post("/api/analyze-url", json={"url": "http://paypal-verification-account-update.top/login.php"})
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn(data["risk_level"], ["suspicious", "high"])
        self.assertGreater(len(data["indicators"]), 0)

    def test_analyze_email_scam(self):
        res = self.client.post("/api/analyze-email", json={
            "text": "URGENT: Your account will be locked within 24 hours. Enter your password and OTP immediately to verify: http://bit.ly/xyz",
            "channel": "email"
        })
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["risk_level"], "high")
        self.assertGreater(data["risk_score"], 50.0)

    def test_threat_news(self):
        res = self.client.get("/api/news")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertGreater(data["count"], 0)

    def test_community_reports(self):
        res = self.client.get("/api/community/reports")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("reports", data)

    def test_assistant_chat(self):
        res = self.client.post("/api/assistant/chat", json={"message": "What should I do if I gave my UPI PIN?"})
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("reply", data)
        self.assertIn("UPI", data["reply"])

    def test_stats_and_analytics(self):
        res = self.client.get("/api/stats")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("total_scans", data)

if __name__ == "__main__":
    unittest.main()

import unittest
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app import app
from services.ml_service import ml_service
from services.domain_analyzer import DomainAnalyzer
from services.reputation_service import reputation_service


class SecurityEnhancedRegressionTests(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()
        self.client.testing = True

    def test_paypal_uk_regression(self):
        """Regression test for paypal.uk: MUST be flagged as brand impersonation/squatting, NEVER low risk."""
        res = self.client.post("/api/analyze-url", json={"url": "https://paypal.uk"})
        self.assertEqual(res.status_code, 200)
        data = res.get_json()

        self.assertEqual(data["risk_level"], "high", "paypal.uk must be high risk")
        self.assertGreaterEqual(data["risk_score"], 65.0)

        indicator_types = [ind["type"] for ind in data["indicators"]]
        self.assertIn("Brand Impersonation / Unauthorized Domain Squatting", indicator_types)

    def test_paypal_canonical_safe(self):
        """Canonical PayPal domain (paypal.com) with HTTPS must be classified as low risk."""
        res = self.client.post("/api/analyze-url", json={"url": "https://www.paypal.com"})
        self.assertEqual(res.status_code, 200)
        data = res.get_json()

        self.assertEqual(data["risk_level"], "low")
        self.assertLess(data["risk_score"], 25.0)
        self.assertEqual(len(data["indicators"]), 0)

    def test_subdomain_brand_spoofing(self):
        """Subdomain embedding a brand name on unrelated apex domain must be high risk."""
        res = self.client.post("/api/analyze-url", json={"url": "https://paypal.com.account-update.info/login"})
        self.assertEqual(res.status_code, 200)
        data = res.get_json()

        self.assertEqual(data["risk_level"], "high")
        indicator_types = [ind["type"] for ind in data["indicators"]]
        self.assertTrue(any("Subdomain Brand Spoofing" in t for t in indicator_types))

    def test_typosquatting_brand_detection(self):
        """Near-identical lookalike domain (paypa1.com) must be detected as typosquatting."""
        res = self.client.post("/api/analyze-url", json={"url": "https://paypa1.com/login"})
        self.assertEqual(res.status_code, 200)
        data = res.get_json()

        self.assertEqual(data["risk_level"], "high")
        indicator_types = [ind["type"] for ind in data["indicators"]]
        self.assertIn("Typosquatting Brand Impersonation", indicator_types)

    def test_unverified_outcome_for_unknown_domain(self):
        """Unknown domain without verified reputation must be UNVERIFIED, never automatically low risk."""
        res = self.client.post("/api/analyze-url", json={"url": "https://peaceful-local-hiking-journal.org/trails"})
        self.assertEqual(res.status_code, 200)
        data = res.get_json()

        self.assertEqual(data["risk_level"], "unverified", "Unknown domain must not default to low risk")
        self.assertIn("Unverified destination", data["summary"])

    def test_https_never_automatically_safe(self):
        """HTTPS alone does not make an unverified domain low risk."""
        res = self.client.post("/api/analyze-url", json={"url": "https://generic-arbitrary-shopping-deal-99.net"})
        self.assertEqual(res.status_code, 200)
        data = res.get_json()

        self.assertNotEqual(data["risk_level"], "low", "Unverified domain must never be low risk")
        self.assertIn(data["risk_level"], ["unverified", "suspicious"])

    def test_ssrf_loopback_blocked(self):
        """Loopback address target must be intercepted as SSRF without making network calls."""
        res = self.client.post("/api/analyze-url", json={"url": "http://127.0.0.1:8000/internal-api"})
        self.assertEqual(res.status_code, 200)
        data = res.get_json()

        self.assertEqual(data["risk_level"], "high")
        indicator_types = [ind["type"] for ind in data["indicators"]]
        self.assertTrue(any("SSRF" in t for t in indicator_types))

    def test_ssrf_metadata_blocked(self):
        """Cloud metadata endpoint (169.254.169.254) must be flagged as high-risk SSRF."""
        res = self.client.post("/api/analyze-url", json={"url": "http://169.254.169.254/latest/meta-data"})
        self.assertEqual(res.status_code, 200)
        data = res.get_json()

        self.assertEqual(data["risk_level"], "high")
        indicator_types = [ind["type"] for ind in data["indicators"]]
        self.assertTrue(any("SSRF" in t for t in indicator_types))

    def test_mocked_reputation_evidence(self):
        """External threat intelligence feed hits must be evaluated deterministically via mock."""
        mock_domain = "malicious-test-drop-site.com"
        reputation_service.add_mock_threat(mock_domain, "Automated Threat Test Hit", "Security Test Feed")

        res = self.client.post("/api/analyze-url", json={"url": f"https://{mock_domain}/payload"})
        self.assertEqual(res.status_code, 200)
        data = res.get_json()

        self.assertEqual(data["risk_level"], "high")
        indicator_types = [ind["type"] for ind in data["indicators"]]
        self.assertIn("Known Threat Intelligence Match", indicator_types)

    def test_raw_ip_and_punycode_detection(self):
        """Raw public IP and Punycode homoglyphs must be elevated to high risk."""
        res_ip = self.client.post("/api/analyze-url", json={"url": "http://198.51.100.25/login"})
        self.assertEqual(res_ip.status_code, 200)
        self.assertEqual(res_ip.get_json()["risk_level"], "high")

        res_puny = self.client.post("/api/analyze-url", json={"url": "https://xn--pypal-4ve.com/verify"})
        self.assertEqual(res_puny.status_code, 200)
        self.assertEqual(res_puny.get_json()["risk_level"], "high")


if __name__ == "__main__":
    unittest.main()

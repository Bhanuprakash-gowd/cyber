import re
import ipaddress
from typing import Dict, Any, List, Optional, Tuple, Set

# Standard multi-level public suffixes / ccTLDs
KNOWN_MULTI_SUFFIXES: Set[str] = {
    "co.uk", "org.uk", "gov.uk", "ac.uk", "net.uk", "me.uk", "ltd.uk", "plc.uk",
    "com.au", "net.au", "org.au", "edu.au", "gov.au",
    "co.in", "net.in", "org.in", "gen.in", "firm.in", "ind.in", "gov.in",
    "co.nz", "net.nz", "org.nz", "govt.nz",
    "co.za", "org.za", "gov.za",
    "co.jp", "ne.jp", "or.jp", "ac.jp", "go.jp",
    "com.br", "net.br", "org.br", "gov.br",
    "com.sg", "edu.sg", "gov.sg", "net.sg",
    "com.mx", "edu.mx", "gob.mx", "org.mx",
    "co.kr", "ne.kr", "or.kr", "re.kr",
    "com.tr", "edu.tr", "gov.tr", "org.tr",
    "com.tw", "org.tw", "gov.tw",
    "co.il", "org.il", "gov.il"
}

# Authoritative directory of high-profile protected brands & their verified domains
PROTECTED_BRANDS: Dict[str, Dict[str, Any]] = {
    "paypal": {
        "brand_name": "PayPal",
        "canonical_brand": "paypal",
        "authorized_domains": {
            "paypal.com", "paypal.me", "paypal.co.uk", "paypal-corp.com",
            "paypal-community.com", "paypal-objects.com"
        },
        "critical_keywords": ["paypal"]
    },
    "google": {
        "brand_name": "Google",
        "canonical_brand": "google",
        "authorized_domains": {
            "google.com", "google.co.uk", "google.co.in", "google.ca", "google.de",
            "google.fr", "google.org", "youtube.com", "gmail.com", "gstatic.com",
            "googleusercontent.com", "googleapis.com", "goo.gl"
        },
        "critical_keywords": ["google", "youtube", "gmail"]
    },
    "microsoft": {
        "brand_name": "Microsoft",
        "canonical_brand": "microsoft",
        "authorized_domains": {
            "microsoft.com", "live.com", "office.com", "azure.com", "github.com",
            "bing.com", "outlook.com", "windows.com", "microsoftonline.com", "msn.com"
        },
        "critical_keywords": ["microsoft", "office365", "azure", "outlook"]
    },
    "apple": {
        "brand_name": "Apple",
        "canonical_brand": "apple",
        "authorized_domains": {
            "apple.com", "icloud.com", "itunes.com", "apple-support.com"
        },
        "critical_keywords": ["apple", "icloud"]
    },
    "amazon": {
        "brand_name": "Amazon",
        "canonical_brand": "amazon",
        "authorized_domains": {
            "amazon.com", "amazon.co.uk", "amazon.in", "amazon.de", "amazon.ca",
            "aws.amazon.com", "primevideo.com", "media-amazon.com"
        },
        "critical_keywords": ["amazon", "primevideo"]
    },
    "netflix": {
        "brand_name": "Netflix",
        "canonical_brand": "netflix",
        "authorized_domains": {
            "netflix.com", "nflxext.com", "nflximg.net"
        },
        "critical_keywords": ["netflix"]
    },
    "meta": {
        "brand_name": "Meta / Facebook",
        "canonical_brand": "meta",
        "authorized_domains": {
            "facebook.com", "instagram.com", "whatsapp.com", "meta.com",
            "messenger.com", "fb.com"
        },
        "critical_keywords": ["facebook", "instagram", "whatsapp", "messenger"]
    },
    "usps": {
        "brand_name": "United States Postal Service",
        "canonical_brand": "usps",
        "authorized_domains": {
            "usps.com", "tools.usps.com"
        },
        "critical_keywords": ["usps"]
    },
    "dhl": {
        "brand_name": "DHL Express",
        "canonical_brand": "dhl",
        "authorized_domains": {
            "dhl.com", "dhl.de"
        },
        "critical_keywords": ["dhl"]
    },
    "fedex": {
        "brand_name": "FedEx",
        "canonical_brand": "fedex",
        "authorized_domains": {
            "fedex.com"
        },
        "critical_keywords": ["fedex"]
    },
    "chase": {
        "brand_name": "JPMorgan Chase",
        "canonical_brand": "chase",
        "authorized_domains": {
            "chase.com"
        },
        "critical_keywords": ["chase"]
    },
    "bofa": {
        "brand_name": "Bank of America",
        "canonical_brand": "bankofamerica",
        "authorized_domains": {
            "bankofamerica.com", "bofa.com"
        },
        "critical_keywords": ["bankofamerica", "bofa"]
    },
    "wellsfargo": {
        "brand_name": "Wells Fargo",
        "canonical_brand": "wellsfargo",
        "authorized_domains": {
            "wellsfargo.com"
        },
        "critical_keywords": ["wellsfargo"]
    }
}

# Known verified safe domains that qualify for LOW RISK when clean
VERIFIED_SAFE_DOMAINS: Set[str] = {
    "wikipedia.org", "wikimedia.org", "github.com", "gitlab.com",
    "stackoverflow.com", "stackexchange.com", "cloudflare.com",
    "mozilla.org", "python.org", "npmjs.com", "gov.uk", "usa.gov"
}


class DomainAnalyzer:
    """
    Advanced domain parsing, SSRF validation, and brand impersonation detection engine.
    """

    @staticmethod
    def parse_domain_components(hostname: str) -> Dict[str, str]:
        """
        Extracts subdomains, second-level domain (SLD), registered domain (eTLD+1),
        and public suffix (TLD) using accurate multi-level suffix parsing.
        """
        host_clean = hostname.strip().lower().rstrip(".")
        if not host_clean:
            return {
                "hostname": "",
                "subdomains": "",
                "registered_domain": "",
                "sld": "",
                "tld": ""
            }

        parts = host_clean.split(".")
        if len(parts) == 1:
            return {
                "hostname": host_clean,
                "subdomains": "",
                "registered_domain": host_clean,
                "sld": host_clean,
                "tld": ""
            }

        # Check for multi-part suffix (e.g. .co.uk, .com.au)
        if len(parts) >= 3:
            potential_multi = f"{parts[-2]}.{parts[-1]}"
            if potential_multi in KNOWN_MULTI_SUFFIXES:
                tld = potential_multi
                sld = parts[-3]
                registered_domain = f"{sld}.{tld}"
                subdomains = ".".join(parts[:-3])
                return {
                    "hostname": host_clean,
                    "subdomains": subdomains,
                    "registered_domain": registered_domain,
                    "sld": sld,
                    "tld": tld
                }

        # Standard single TLD
        tld = parts[-1]
        sld = parts[-2]
        registered_domain = f"{sld}.{tld}"
        subdomains = ".".join(parts[:-2])

        return {
            "hostname": host_clean,
            "subdomains": subdomains,
            "registered_domain": registered_domain,
            "sld": sld,
            "tld": tld
        }

    @staticmethod
    def check_ssrf_risk(hostname: str) -> Optional[Dict[str, Any]]:
        """
        Validates whether hostname points to internal, loopback, private,
        or cloud metadata IP addresses to prevent Server-Side Request Forgery (SSRF).
        """
        host_clean = hostname.strip().lower()

        # Reject loopback and local domain labels
        if host_clean in ["localhost", "127.0.0.1", "::1", "0.0.0.0"]:
            return {
                "type": "Internal Loopback Target (SSRF)",
                "severity": "Critical",
                "evidence": f"Target '{hostname}' references internal loopback address. Potential SSRF probe.",
                "weight": 50
            }

        if any(host_clean.endswith(ext) for ext in [".localhost", ".local", ".internal", ".lan", ".localdomain"]):
            return {
                "type": "Internal Network Domain (SSRF)",
                "severity": "Critical",
                "evidence": f"Domain '{hostname}' resides in a reserved private/local namespace.",
                "weight": 45
            }

        # IP address check
        ip_candidate = host_clean.strip("[]")
        try:
            ip_obj = ipaddress.ip_address(ip_candidate)
            if ip_obj.is_loopback:
                return {
                    "type": "Loopback IP Host (SSRF)",
                    "severity": "Critical",
                    "evidence": f"Direct loopback IP {ip_obj} prohibited.",
                    "weight": 50
                }
            if ip_obj.is_private:
                return {
                    "type": "Private RFC 1918 Address (SSRF)",
                    "severity": "Critical",
                    "evidence": f"Private intranet IP {ip_obj} blocked from external evaluation.",
                    "weight": 50
                }
            if ip_obj.is_link_local or str(ip_obj) == "169.254.169.254":
                return {
                    "type": "Cloud Metadata IP (SSRF)",
                    "severity": "Critical",
                    "evidence": f"Cloud metadata endpoint {ip_obj} detected.",
                    "weight": 55
                }
        except ValueError:
            pass

        return None

    @staticmethod
    def _levenshtein_distance(s1: str, s2: str) -> int:
        """Computes edit distance between two strings."""
        if len(s1) < len(s2):
            return DomainAnalyzer._levenshtein_distance(s2, s1)
        if len(s2) == 0:
            return len(s1)

        previous_row = range(len(s2) + 1)
        for i, c1 in enumerate(s1):
            current_row = [i + 1]
            for j, c2 in enumerate(s2):
                insertions = previous_row[j + 1] + 1
                deletions = current_row[j] + 1
                substitutions = previous_row[j] + (c1 != c2)
                current_row.append(min(insertions, deletions, substitutions))
            previous_row = current_row
        return previous_row[-1]

    @classmethod
    def evaluate_brand_impersonation(cls, components: Dict[str, str]) -> Tuple[List[Dict[str, Any]], bool]:
        """
        Evaluates brand squatting, subdomain spoofing, and typosquatting.
        Returns (list of threat indicators, is_authorized_brand_domain).
        """
        indicators: List[Dict[str, Any]] = []
        is_authorized = False

        registered_domain = components["registered_domain"]
        sld = components["sld"]
        subdomains = components["subdomains"]
        hostname = components["hostname"]

        # Check if this registered domain is officially authorized by a recognized brand
        for brand_key, brand_info in PROTECTED_BRANDS.items():
            if registered_domain in brand_info["authorized_domains"]:
                is_authorized = True
                return indicators, True

        # Check for brand squatting across all protected brands
        for brand_key, brand_info in PROTECTED_BRANDS.items():
            brand_name = brand_info["brand_name"]
            auth_domains = brand_info["authorized_domains"]
            keywords = brand_info["critical_keywords"]

            for kw in keywords:
                # 1. Exact brand SLD squatting on unauthorized TLD (e.g. paypal.uk, paypal.io, paypal.xyz)
                if sld == kw and registered_domain not in auth_domains:
                    indicators.append({
                        "type": "Brand Impersonation / Unauthorized Domain Squatting",
                        "severity": "Critical",
                        "evidence": (
                            f"Domain '{registered_domain}' uses registered name '{sld}' impersonating {brand_name}, "
                            f"but is NOT an authorized domain for this organization. Official domains: "
                            f"{', '.join(sorted(list(auth_domains))[:3])}."
                        ),
                        "weight": 50,
                        "brand_affected": brand_name
                    })
                    break

                # 2. Compound brand lure in SLD (e.g. paypal-security.com, login-paypal.net, verify-apple.com)
                if (kw in sld) and (sld != kw) and (registered_domain not in auth_domains):
                    indicators.append({
                        "type": "Brand Deception in Apex Domain",
                        "severity": "High",
                        "evidence": (
                            f"Apex domain '{registered_domain}' embeds brand keyword '{kw}' ({brand_name}) "
                            f"in an unauthorized registration to deceive users."
                        ),
                        "weight": 40,
                        "brand_affected": brand_name
                    })
                    break

                # 3. Subdomain Brand Spoofing (e.g. paypal.com.attacker.org, login.paypal.verify-server.top)
                if subdomains:
                    sub_parts = subdomains.split(".")
                    if any(kw == p or p.startswith(kw + "-") or p.endswith("-" + kw) for p in sub_parts):
                        indicators.append({
                            "type": "Subdomain Brand Spoofing Phishing",
                            "severity": "Critical",
                            "evidence": (
                                f"Host '{hostname}' prepends brand keyword '{kw}' ({brand_name}) into subdomains "
                                f"over an unrelated apex domain '{registered_domain}' to create a false impression of legitimacy."
                            ),
                            "weight": 45,
                            "brand_affected": brand_name
                        })
                        break

                # 4. Typosquatting / Lookalike Levenshtein Distance & Homoglyphs
                normalized_sld = sld.replace("1", "l").replace("0", "o").replace("vv", "w")
                if len(kw) >= 4 and len(sld) >= 4 and registered_domain not in auth_domains:
                    raw_dist = cls._levenshtein_distance(sld, kw)
                    norm_dist = cls._levenshtein_distance(normalized_sld, kw)
                    is_homoglyph_match = (normalized_sld == kw and sld != kw)
                    is_typosquat = (raw_dist == 1 or norm_dist == 1 or is_homoglyph_match)

                    if is_typosquat:
                        indicators.append({
                            "type": "Typosquatting Brand Impersonation",
                            "severity": "High",
                            "evidence": (
                                f"Domain '{registered_domain}' is a near-identical typosquat/homoglyph ({sld}) "
                                f"mimicking protected brand '{brand_name}'."
                            ),
                            "weight": 42,
                            "brand_affected": brand_name
                        })
                        break

        return indicators, False

    @classmethod
    def is_verified_safe_domain(cls, registered_domain: str) -> bool:
        """Checks if registered domain is in the verified trusted domains list."""
        if registered_domain in VERIFIED_SAFE_DOMAINS:
            return True
        for brand in PROTECTED_BRANDS.values():
            if registered_domain in brand["authorized_domains"]:
                return True
        return False

import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    PORT = int(os.getenv("PORT", 5000))
    DEBUG = os.getenv("FLASK_ENV", "development") == "development"
    FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")

    # Supabase Configuration
    SUPABASE_URL = os.getenv("SUPABASE_URL", "")
    SUPABASE_SECRET_KEY = os.getenv("SUPABASE_SECRET_KEY", "")
    SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")

    # ML Model Configuration
    MODEL_PATH = os.getenv("MODEL_PATH", "./model/phishing_model.joblib")
    MODEL_METADATA_PATH = "./model/model_metadata.json"
    MODEL_FEATURES_PATH = "./model/feature_names.json"

    # LLM Assistant Configuration
    LLM_PROVIDER = os.getenv("LLM_PROVIDER", "openai").lower()
    LLM_API_KEY = os.getenv("LLM_API_KEY", "")
    LLM_MODEL = os.getenv("LLM_MODEL", "gpt-4o-mini")

    # RSS Feeds
    RSS_FEEDS = os.getenv(
        "RSS_FEEDS",
        "https://www.cisa.gov/cybersecurity-advisories/all.xml,https://feeds.feedburner.com/TheHackersNews,https://www.bleepingcomputer.com/feed/"
    ).split(",")

    # Admin Master Secret Key
    ADMIN_SECRET_KEY = os.getenv("ADMIN_SECRET_KEY", "cybersentry-admin-secret-dev-2026")

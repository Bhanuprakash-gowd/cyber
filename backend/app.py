import os
import logging
from flask import Flask, request, jsonify, Response, send_file
from flask_cors import CORS
from config import Config
from services.ml_service import ml_service
from services.email_analyzer import email_analyzer
from services.supabase_service import supabase_service
from services.news_service import threat_news_service
from services.assistant_service import assistant_service
from services.export_service import export_service
import io

# Setup Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("CyberSentryAPI")

app = Flask(__name__)

# Configure CORS with credentials support
CORS(app, resources={
    r"/api/*": {
        "origins": [Config.FRONTEND_ORIGIN, "http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "X-Admin-Secret"]
    }
})

# 1. HEALTH & METRICS
@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "healthy",
        "service": "CyberSentry AI Backend",
        "version": "1.2.0",
        "ml_engine": "RandomForestClassifier",
        "ml_model_loaded": ml_service.model is not None,
        "database_mode": "Supabase PostgreSQL" if supabase_service.is_connected else "Local Resilient Store",
        "llm_provider": Config.LLM_PROVIDER if Config.LLM_API_KEY else "Internal Expert Heuristic Engine"
    }), 200

# 2. URL THREAT ANALYZER
@app.route("/api/analyze-url", methods=["POST"])
def analyze_url_endpoint():
    data = request.get_json(silent=True) or {}
    url = data.get("url", "").strip()
    if not url:
        return jsonify({"error": "Target URL is required"}), 400

    try:
        user_id = data.get("user_id") # Optional authenticated user id
        analysis = ml_service.analyze_url(url)
        saved_record = supabase_service.save_scan(analysis, user_id=user_id)
        analysis["id"] = saved_record["id"]
        analysis["created_at"] = saved_record["created_at"]
        return jsonify(analysis), 200
    except Exception as e:
        logger.error("URL analysis failure: %s", str(e), exc_info=True)
        return jsonify({"error": f"Analysis failed: {str(e)}"}), 500

# 3. SUSPICIOUS EMAIL / MESSAGE ANALYZER
@app.route("/api/analyze-email", methods=["POST"])
def analyze_email_endpoint():
    data = request.get_json(silent=True) or {}
    message_text = data.get("text", "").strip()
    channel = data.get("channel", "email")
    if not message_text:
        return jsonify({"error": "Message content is required"}), 400

    try:
        user_id = data.get("user_id")
        analysis = email_analyzer.analyze_message(message_text, channel=channel)
        saved_record = supabase_service.save_scan(analysis, user_id=user_id)
        analysis["id"] = saved_record["id"]
        analysis["created_at"] = saved_record["created_at"]
        return jsonify(analysis), 200
    except Exception as e:
        logger.error("Message analysis failure: %s", str(e), exc_info=True)
        return jsonify({"error": f"Analysis failed: {str(e)}"}), 500

# 4. SCAN HISTORY
@app.route("/api/history", methods=["GET"])
def get_history_endpoint():
    user_id = request.args.get("user_id")
    limit = int(request.args.get("limit", 50))
    scans = supabase_service.get_scans(user_id=user_id, limit=limit)
    return jsonify({"scans": scans, "count": len(scans)}), 200

@app.route("/api/history/<scan_id>", methods=["DELETE"])
def delete_history_endpoint(scan_id):
    user_id = request.args.get("user_id")
    success = supabase_service.delete_scan(scan_id, user_id=user_id)
    if success:
        return jsonify({"message": "Scan deleted successfully"}), 200
    return jsonify({"error": "Scan not found"}), 404

# 5. DETAILED REPORT LOOKUP
@app.route("/api/report/<scan_id>", methods=["GET"])
def get_report_endpoint(scan_id):
    scan = supabase_service.get_scan_by_id(scan_id)
    if scan:
        return jsonify(scan), 200
    return jsonify({"error": "Report not found"}), 404

# 6. APPLICATION STATS & OVERVIEW
@app.route("/api/stats", methods=["GET"])
def get_stats_endpoint():
    stats = supabase_service.get_stats()
    return jsonify(stats), 200

# 7. THREAT NEWS INTELLIGENCE
@app.route("/api/news", methods=["GET"])
def get_news_endpoint():
    category = request.args.get("category")
    search = request.args.get("search")
    limit = int(request.args.get("limit", 50))
    articles = supabase_service.get_threat_news(category=category, search=search, limit=limit)
    return jsonify({
        "articles": articles,
        "count": len(articles),
        "last_sync": threat_news_service.last_sync
    }), 200

@app.route("/api/news/<news_id>", methods=["GET"])
def get_single_news_endpoint(news_id):
    article = supabase_service.get_news_by_id(news_id)
    if article:
        return jsonify(article), 200
    return jsonify({"error": "Article not found"}), 404

# 8. COMMUNITY SCAM REPORTS
@app.route("/api/community/reports", methods=["GET"])
def get_community_reports_endpoint():
    status = request.args.get("status")
    category = request.args.get("category")
    limit = int(request.args.get("limit", 50))
    reports = supabase_service.get_community_reports(status=status, category=category, limit=limit)
    return jsonify({"reports": reports, "count": len(reports)}), 200

@app.route("/api/community/reports", methods=["POST"])
def submit_community_report_endpoint():
    data = request.get_json(silent=True) or {}
    description = data.get("description", "").strip()
    if not description:
        return jsonify({"error": "Description is required"}), 400

    user_id = data.get("user_id")
    report = supabase_service.submit_community_report(data, user_id=user_id)
    return jsonify({
        "message": "Report submitted successfully for moderation review",
        "report": report
    }), 201

@app.route("/api/community/reports/<report_id>/flag", methods=["POST"])
def flag_report_endpoint(report_id):
    success = supabase_service.flag_community_report(report_id)
    if success:
        return jsonify({"message": "Report flagged for review"}), 200
    return jsonify({"error": "Report not found"}), 404

@app.route("/api/community/reports/<report_id>/moderate", methods=["POST"])
def moderate_report_endpoint(report_id):
    # Admin verification
    admin_token = request.headers.get("X-Admin-Secret")
    if admin_token != Config.ADMIN_SECRET_KEY:
        return jsonify({"error": "Unauthorized. Admin privileges required."}), 403

    data = request.get_json(silent=True) or {}
    new_status = data.get("status", "approved")
    if new_status not in ["approved", "rejected", "flagged"]:
        return jsonify({"error": "Invalid status value"}), 400

    success = supabase_service.moderate_community_report(report_id, new_status)
    if success:
        return jsonify({"message": f"Report status changed to {new_status}"}), 200
    return jsonify({"error": "Report not found"}), 404

# 9. FRAUD INTELLIGENCE ANALYTICS
@app.route("/api/analytics", methods=["GET"])
def get_analytics_endpoint():
    stats = supabase_service.get_stats()
    reports = supabase_service.get_community_reports(status=None)
    news = supabase_service.get_threat_news()

    # Time series scan distribution (mocked realistic baseline curve combined with real counts)
    scan_trend = [
        {"day": "Mon", "scans": 14, "highRisk": 4, "lowRisk": 8},
        {"day": "Tue", "scans": 22, "highRisk": 6, "lowRisk": 13},
        {"day": "Wed", "scans": 19, "highRisk": 3, "lowRisk": 14},
        {"day": "Thu", "scans": 28, "highRisk": 8, "lowRisk": 17},
        {"day": "Fri", "scans": 35, "highRisk": 11, "lowRisk": 20},
        {"day": "Sun", "scans": max(stats.get("total_scans", 0), 15), "highRisk": max(stats.get("high_risk", 0), 4), "lowRisk": max(stats.get("low_risk", 0), 9)}
    ]

    # Category breakdowns
    category_counts = {}
    for r in reports:
        cat = r.get("category", "Other")
        category_counts[cat] = category_counts.get(cat, 0) + 1

    community_categories = [
        {"name": k, "value": v} for k, v in category_counts.items()
    ]

    news_categories = {}
    for n in news:
        cat = n.get("category", "General Security")
        news_categories[cat] = news_categories.get(cat, 0) + 1

    return jsonify({
        "summary": stats,
        "scan_trend": scan_trend,
        "community_categories": community_categories,
        "news_categories": [{"name": k, "value": v} for k, v in news_categories.items()],
        "channel_distribution": [
            {"channel": "SMS / Smishing", "count": 42},
            {"channel": "WhatsApp / Messaging", "count": 31},
            {"channel": "Phishing Email", "count": 28},
            {"channel": "Fake Website", "count": 19},
            {"channel": "Phone Calls", "count": 14}
        ]
    }), 200

# 10. AI CYBER SAFETY ASSISTANT
@app.route("/api/assistant/chat", methods=["POST"])
def assistant_chat_endpoint():
    data = request.get_json(silent=True) or {}
    message = data.get("message", "").strip()
    context = data.get("context")
    history = data.get("history")

    if not message:
        return jsonify({"error": "Message is required"}), 400

    response = assistant_service.chat(message, context=context, conversation_history=history)
    return jsonify(response), 200

# 11. NOTIFICATIONS
@app.route("/api/notifications", methods=["GET"])
def get_notifications_endpoint():
    notifs = supabase_service.get_notifications()
    return jsonify({"notifications": notifs, "count": len(notifs)}), 200

@app.route("/api/notifications/<notif_id>/read", methods=["POST"])
def read_notification_endpoint(notif_id):
    supabase_service.mark_notification_read(notif_id)
    return jsonify({"message": "Marked as read"}), 200

# 12. ADMIN FEED SOURCES & SYNC
@app.route("/api/feed-sources", methods=["GET"])
def get_feed_sources_endpoint():
    return jsonify({"sources": supabase_service.get_feed_sources()}), 200

@app.route("/api/feed-sources/sync", methods=["POST"])
def sync_feed_sources_endpoint():
    res = threat_news_service.fetch_feeds()
    return jsonify(res), 200

# 13. ML MODEL INFO
@app.route("/api/model/info", methods=["GET"])
def get_model_info_endpoint():
    return jsonify({
        "metadata": ml_service.metadata,
        "loaded": ml_service.model is not None,
        "features": ml_service.feature_names
    }), 200

# 14. EXPORT REPORTS (CSV & PDF)
@app.route("/api/export/csv", methods=["GET"])
def export_csv_endpoint():
    user_id = request.args.get("user_id")
    scans = supabase_service.get_scans(user_id=user_id, limit=200)
    csv_data = export_service.export_scans_csv(scans)
    return Response(
        csv_data,
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment;filename=cybersentry_scan_history.csv"}
    )

@app.route("/api/export/pdf/<scan_id>", methods=["GET"])
def export_pdf_endpoint(scan_id):
    scan = supabase_service.get_scan_by_id(scan_id)
    if not scan:
        return jsonify({"error": "Scan record not found"}), 404

    try:
        pdf_bytes = export_service.generate_pdf_report(scan)
        return send_file(
            io.BytesIO(pdf_bytes),
            mimetype="application/pdf",
            as_attachment=True,
            download_name=f"cybersentry_report_{scan_id[:8]}.pdf"
        )
    except Exception as e:
        logger.error("PDF generation failed: %s", str(e), exc_info=True)
        return jsonify({"error": f"PDF generation error: {str(e)}"}), 500

if __name__ == "__main__":
    logger.info("Starting CyberSentry AI Backend on port %d...", Config.PORT)
    app.run(host="0.0.0.0", port=Config.PORT, debug=Config.DEBUG)

import io
import csv
from typing import List, Dict, Any
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

class ExportService:
    def export_scans_csv(self, scans: List[Dict[str, Any]]) -> str:
        output = io.StringIO()
        fieldnames = ["id", "scan_type", "input_target", "risk_level", "risk_score", "confidence", "model_version", "created_at"]
        writer = csv.DictWriter(output, fieldnames=fieldnames)
        writer.writeheader()
        for s in scans:
            writer.writerow({
                "id": s.get("id"),
                "scan_type": s.get("scan_type"),
                "input_target": s.get("input_target"),
                "risk_level": s.get("risk_level"),
                "risk_score": s.get("risk_score"),
                "confidence": s.get("confidence"),
                "model_version": s.get("model_version"),
                "created_at": s.get("created_at")
            })
        return output.getvalue()

    def generate_pdf_report(self, scan: Dict[str, Any]) -> bytes:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
        styles = getSampleStyleSheet()

        title_style = ParagraphStyle(
            'ReportTitle',
            parent=styles['Heading1'],
            fontSize=22,
            leading=26,
            textColor=colors.HexColor('#0F172A'),
            spaceAfter=12
        )
        subtitle_style = ParagraphStyle(
            'ReportSubtitle',
            parent=styles['Normal'],
            fontSize=11,
            leading=15,
            textColor=colors.HexColor('#475569'),
            spaceAfter=15
        )
        h2_style = ParagraphStyle(
            'H2',
            parent=styles['Heading2'],
            fontSize=14,
            leading=18,
            textColor=colors.HexColor('#1E293B'),
            spaceBefore=14,
            spaceAfter=6
        )
        body_style = ParagraphStyle(
            'Body',
            parent=styles['Normal'],
            fontSize=10,
            leading=14,
            textColor=colors.HexColor('#334155')
        )

        elements = []

        # Title & Meta
        elements.append(Paragraph("CyberSentry AI — Threat Intelligence Audit", title_style))
        elements.append(Paragraph(f"Scan ID: {scan.get('id', 'N/A')} | Generated: {scan.get('created_at', 'N/A')}", subtitle_style))
        elements.append(Spacer(1, 10))

        # Risk Banner Table
        risk_level = str(scan.get('risk_level', 'UNKNOWN')).upper()
        risk_color = colors.HexColor('#EF4444') if risk_level == "HIGH" else \
                     colors.HexColor('#F59E0B') if risk_level == "SUSPICIOUS" else colors.HexColor('#10B981')

        summary_data = [
            ["Target Analyzed", scan.get('input_target', 'N/A')],
            ["Scan Type", str(scan.get('scan_type', 'N/A')).upper()],
            ["Risk Classification", risk_level],
            ["Risk Score", f"{scan.get('risk_score', 0)} / 100"],
            ["Model Confidence", f"{scan.get('confidence', 0)}%"],
            ["ML Engine Version", f"Random Forest v{scan.get('model_version', '1.2.0')}"]
        ]

        t = Table(summary_data, colWidths=[160, 360])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#F1F5F9')),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#0F172A')),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
        ]))
        elements.append(t)
        elements.append(Spacer(1, 15))

        # Summary Description
        elements.append(Paragraph("Executive Summary", h2_style))
        elements.append(Paragraph(scan.get('summary', 'Standard heuristic and machine learning scan completed.'), body_style))
        elements.append(Spacer(1, 10))

        # Indicators
        indicators = scan.get('indicators', [])
        if indicators:
            elements.append(Paragraph(f"Identified Risk Indicators ({len(indicators)})", h2_style))
            for ind in indicators:
                ind_text = f"<b>[{ind.get('severity', 'Alert')}] {ind.get('type', 'Indicator')}:</b> {ind.get('evidence', '')}"
                elements.append(Paragraph(ind_text, body_style))
                elements.append(Spacer(1, 4))
        else:
            elements.append(Paragraph("No anomalous risk indicators triggered during automated evaluation.", body_style))

        elements.append(Spacer(1, 10))

        # Safe Recommended Actions
        actions = scan.get('recommended_actions', [])
        if actions:
            elements.append(Paragraph("Recommended Safe Actions", h2_style))
            for act in actions:
                elements.append(Paragraph(f"• {act}", body_style))
                elements.append(Spacer(1, 3))

        elements.append(Spacer(1, 20))
        elements.append(Paragraph("<i>Disclaimer: Automated threat evaluation is preliminary. Low risk does not guarantee complete security against novel zero-days. Always verify certificate authority and credentials.</i>", subtitle_style))

        doc.build(elements)
        buffer.seek(0)
        return buffer.getvalue()

export_service = ExportService()

#!/usr/bin/env python3
"""
audit_webs.py — Audit websites for technical SEO and contact information

Reads output/places_results.json and audits each website.
Outputs to output/audit_results.json and output/leads_auditados_YYYYMMDD_HHMMSS.xlsx
"""

import os
import sys
import json
import time
import re
from datetime import datetime
from typing import Dict, Any, List, Optional

import requests
from bs4 import BeautifulSoup
import pandas as pd


def get_env(key: str, default: str = "") -> str:
    """Get environment variable with optional default."""
    return os.getenv(key, default)


def audit_website(
    url: str,
    timeout: int = 10,
    delay: float = 0.2
) -> Dict[str, Any]:
    """Audit a website for technical SEO and contact information."""
    
    audit = {
        "url": url,
        "estado_web_auditado": "sin_web",
        "http_status": None,
        "tiene_https": False,
        "email_visible": None,
        "telefonos_visibles": [],
        "tiene_whatsapp": False,
        "tiene_formulario": False,
        "instagram": None,
        "facebook": None,
        "tiene_meta_description": False,
        "tiene_h1": False,
        "tiene_viewport_movil": False,
        "tiene_analytics": False,
        "tiempo_carga_ms": None,
    }
    
    if not url:
        return audit
    
    try:
        # Add scheme if missing
        if not url.startswith("http"):
            url = "https://" + url
        
        print(f"[audit_webs.py] Auditing: {url}")
        
        # Check HTTPS
        audit["tiene_https"] = url.startswith("https://")
        
        # Fetch page
        start_time = time.time()
        response = requests.get(url, timeout=timeout, allow_redirects=True)
        load_time_ms = int((time.time() - start_time) * 1000)
        
        audit["http_status"] = response.status_code
        audit["tiempo_carga_ms"] = load_time_ms
        
        if response.status_code != 200:
            audit["estado_web_auditado"] = "web_no_operativa"
            return audit
        
        # Parse HTML
        soup = BeautifulSoup(response.content, "html.parser")
        html_text = response.text.lower()
        
        # Meta description
        meta = soup.find("meta", attrs={"name": "description"})
        if meta and meta.get("content"):
            audit["tiene_meta_description"] = True
        
        # H1
        if soup.find("h1"):
            audit["tiene_h1"] = True
        
        # Viewport mobile
        viewport = soup.find("meta", attrs={"name": "viewport"})
        if viewport:
            audit["tiene_viewport_movil"] = True
        
        # Analytics / GTM
        if "google-analytics" in html_text or "gtag" in html_text or "gtm" in html_text:
            audit["tiene_analytics"] = True
        
        # Extract text for searching
        text = soup.get_text().lower()
        
        # Email (regex)
        emails = re.findall(r"[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}", text)
        if emails:
            audit["email_visible"] = emails[0]
        
        # Phones (Spanish format)
        phones = re.findall(r"(?:\+34|0034|34)?[\s.-]?[6789]\d{2}[\s.-]?\d{3}[\s.-]?\d{3}", text)
        if phones:
            audit["telefonos_visibles"] = list(set(phones))[:3]
        
        # WhatsApp
        if "whatsapp" in html_text or "wa.me" in html_text:
            audit["tiene_whatsapp"] = True
        
        # Form
        if soup.find("form"):
            audit["tiene_formulario"] = True
        
        # Social media
        for link in soup.find_all("a", href=True):
            href = link.get("href", "").lower()
            if "instagram.com" in href:
                audit["instagram"] = href
            elif "facebook.com" in href:
                audit["facebook"] = href
        
        audit["estado_web_auditado"] = "web_auditada"
        
    except requests.exceptions.Timeout:
        audit["estado_web_auditado"] = "timeout"
        print(f"[audit_webs.py] Timeout: {url}")
    except requests.exceptions.ConnectionError:
        audit["estado_web_auditado"] = "sin_conexion"
        print(f"[audit_webs.py] Connection error: {url}")
    except Exception as e:
        audit["estado_web_auditado"] = "error_auditoria"
        print(f"[audit_webs.py] Error auditing {url}: {e}", file=sys.stderr)
    
    time.sleep(delay)
    return audit


def main():
    """Main execution."""
    try:
        # Read environment variables
        enable_email = get_env("ENABLE_EMAIL_EXTRACTION", "true").lower() == "true"
        enable_social = get_env("ENABLE_SOCIAL_EXTRACTION", "true").lower() == "true"
        audit_timeout = int(get_env("AUDIT_TIMEOUT_SECONDS", "10"))
        audit_delay = float(get_env("AUDIT_DELAY_SECONDS", "0.2"))
        audit_limit = int(get_env("WEBSITE_AUDIT_LIMIT", "100"))
        only_with_website = get_env("AUDIT_ONLY_WITH_WEBSITE", "false").lower() == "true"
        
        print(f"[audit_webs.py] Starting website audit...")
        print(f"[audit_webs.py] Enable email extraction: {enable_email}")
        print(f"[audit_webs.py] Enable social extraction: {enable_social}")
        
        # Read input
        input_file = "output/places_results.json"
        if not os.path.exists(input_file):
            print(f"[audit_webs.py] ERROR: Input file not found: {input_file}", file=sys.stderr)
            return 1
        
        with open(input_file, "r", encoding="utf-8") as f:
            data = json.load(f)
        
        places = data.get("places", [])
        print(f"[audit_webs.py] Loaded {len(places)} places")
        
        # Create output directory
        os.makedirs("output", exist_ok=True)
        
        # Audit websites
        audits = []
        for i, place in enumerate(places[:audit_limit]):
            website = place.get("web")
            
            if only_with_website and not website:
                continue
            
            audit = {
                **place,
                **audit_website(website, timeout=audit_timeout, delay=audit_delay)
            }
            
            # Clear sensitive data if not enabled
            if not enable_email:
                audit["email_visible"] = None
            if not enable_social:
                audit["instagram"] = None
                audit["facebook"] = None
            
            audits.append(audit)
            
            if (i + 1) % 10 == 0:
                print(f"[audit_webs.py] Audited {i + 1}/{min(len(places), audit_limit)} websites")
        
        print(f"[audit_webs.py] Audited {len(audits)} websites")
        
        # Save results
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # JSON output
        output_json = {
            "timestamp": datetime.now().isoformat(),
            "total_audited": len(audits),
            "audits": audits,
        }
        
        json_file = "output/audit_results.json"
        with open(json_file, "w", encoding="utf-8") as f:
            json.dump(output_json, f, indent=2, ensure_ascii=False)
        print(f"[audit_webs.py] Saved results to {json_file}")
        
        # Excel output
        if audits:
            df = pd.DataFrame(audits)
            excel_file = f"output/leads_auditados_{timestamp}.xlsx"
            df.to_excel(excel_file, index=False, engine="openpyxl")
            print(f"[audit_webs.py] Saved Excel to {excel_file}")
        
        print(f"[audit_webs.py] Audit completed successfully")
        return 0
        
    except Exception as e:
        print(f"[audit_webs.py] ERROR: {str(e)}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())

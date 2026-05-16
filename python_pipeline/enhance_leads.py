#!/usr/bin/env python3
"""
enhance_leads.py — Calculate scores and generate final leads JSON

Reads output/audit_results.json, calculates scores, and generates:
- output/final_leads.json (required by backend)
- output/leads_mejorados_YYYYMMDD_HHMMSS.xlsx
- output/leads_mejorados_YYYYMMDD_HHMMSS.csv
"""

import os
import sys
import json
import hashlib
from datetime import datetime
from typing import Dict, Any, List, Optional

import pandas as pd


def get_env(key: str, default: str = "") -> str:
    """Get environment variable with optional default."""
    return os.getenv(key, default)


def generate_place_id(name: str, address: str = "", phone: str = "") -> str:
    """Generate stable place_id if not provided."""
    combined = f"{name}|{address}|{phone}"
    hash_obj = hashlib.md5(combined.encode())
    return f"generated_{hash_obj.hexdigest()[:16]}"


def calculate_seo_score(audit: Dict[str, Any]) -> int:
    """Calculate SEO score (0-100)."""
    score = 50  # Base score
    
    if audit.get("tiene_meta_description"):
        score += 15
    if audit.get("tiene_h1"):
        score += 15
    if audit.get("tiene_viewport_movil"):
        score += 10
    if audit.get("tiene_https"):
        score += 10
    
    return min(100, score)


def calculate_speed_score(audit: Dict[str, Any]) -> int:
    """Calculate speed score based on load time (0-100)."""
    load_time = audit.get("tiempo_carga_ms", 3000)
    
    if load_time is None:
        return 50
    
    # Fast: < 1s = 100, Slow: > 5s = 20
    if load_time < 1000:
        return 100
    elif load_time < 2000:
        return 85
    elif load_time < 3000:
        return 70
    elif load_time < 4000:
        return 55
    elif load_time < 5000:
        return 40
    else:
        return 20


def calculate_contact_score(audit: Dict[str, Any]) -> int:
    """Calculate contact availability score (0-100)."""
    score = 30  # Base score
    
    if audit.get("email_visible"):
        score += 30
    if audit.get("telefonos_visibles"):
        score += 20
    if audit.get("tiene_formulario"):
        score += 20
    
    return min(100, score)


def calculate_social_score(audit: Dict[str, Any]) -> int:
    """Calculate social media presence score (0-100)."""
    score = 20  # Base score
    
    if audit.get("facebook"):
        score += 25
    if audit.get("instagram"):
        score += 25
    if audit.get("tiene_whatsapp"):
        score += 15
    if audit.get("tiene_analytics"):
        score += 15
    
    return min(100, score)


def calculate_total_score(seo: int, speed: int, contact: int, social: int) -> int:
    """Calculate weighted total score."""
    return int((seo * 0.25 + speed * 0.25 + contact * 0.30 + social * 0.20))


def determine_priority(total_score: int, has_website: bool, has_contact: bool) -> str:
    """Determine priority based on scores and availability."""
    if not has_website:
        return "low"
    if total_score >= 75 and has_contact:
        return "high"
    elif total_score >= 60:
        return "medium"
    else:
        return "low"


def determine_temperature(total_score: int, contact_score: int) -> str:
    """Determine temperature (hot/warm/cold)."""
    if total_score >= 75 and contact_score >= 70:
        return "hot"
    elif total_score >= 60 or contact_score >= 50:
        return "warm"
    else:
        return "cold"


def detect_issues(audit: Dict[str, Any]) -> List[str]:
    """Detect issues and return list."""
    issues = []
    
    if not audit.get("web"):
        issues.append("Sin sitio web")
    else:
        if audit.get("http_status") != 200:
            issues.append("Sitio web no operativo")
        if not audit.get("tiene_https"):
            issues.append("No tiene HTTPS")
        if not audit.get("tiene_meta_description"):
            issues.append("Sin meta description")
        if not audit.get("tiene_h1"):
            issues.append("Sin H1 visible")
        if not audit.get("tiene_viewport_movil"):
            issues.append("No es responsive")
        
        load_time = audit.get("tiempo_carga_ms")
        if load_time and load_time > 3000:
            issues.append(f"Carga lenta ({load_time}ms)")
    
    if not audit.get("email_visible") and not audit.get("telefonos_visibles"):
        issues.append("Sin contacto visible")
    
    if not audit.get("facebook") and not audit.get("instagram"):
        issues.append("Sin presencia en redes sociales")
    
    return issues


def get_recommended_action(issues: List[str], total_score: int) -> str:
    """Get recommended action based on issues."""
    if not issues:
        return "Mantener estrategia actual"
    
    if total_score >= 75:
        return "Mejorar presencia en redes sociales"
    elif total_score >= 60:
        return "Optimizar velocidad y contactabilidad"
    else:
        return "Revisar completamente la presencia digital"


def transform_audit_to_lead(audit: Dict[str, Any]) -> Dict[str, Any]:
    """Transform audit result to final lead format."""
    
    # Calculate scores
    score_seo = calculate_seo_score(audit)
    score_speed = calculate_speed_score(audit)
    score_contact = calculate_contact_score(audit)
    score_social = calculate_social_score(audit)
    score_total = calculate_total_score(score_seo, score_speed, score_contact, score_social)
    
    # Determine priority and temperature
    has_website = bool(audit.get("web"))
    has_contact = bool(audit.get("email_visible")) or bool(audit.get("telefonos_visibles"))
    
    priority = determine_priority(score_total, has_website, has_contact)
    temperature = determine_temperature(score_total, score_contact)
    
    # Detect issues and recommendations
    issues = detect_issues(audit)
    recommended_action = get_recommended_action(issues, score_total)
    
    # Generate place_id if missing
    place_id = audit.get("place_id")
    if not place_id:
        place_id = generate_place_id(
            audit.get("nombre_negocio", ""),
            audit.get("direccion", ""),
            audit.get("telefono", "")
        )
    
    # Build final lead
    lead = {
        "place_id": place_id,
        "name": audit.get("nombre_negocio", ""),
        "sector": audit.get("sector", "Unknown"),
        "zone": audit.get("zona_busqueda", "Unknown"),
        "address": audit.get("direccion", ""),
        "website": audit.get("web") or None,
        "email": audit.get("email_visible") or None,
        "phone": audit.get("telefono") or None,
        "rating": float(audit.get("rating", 0)) or 0,
        "review_count": int(audit.get("reseñas", 0)) or 0,
        "facebook": audit.get("facebook") or None,
        "instagram": audit.get("instagram") or None,
        "linkedin": None,
        "twitter": None,
        "score_seo": score_seo,
        "score_speed": score_speed,
        "score_contact": score_contact,
        "score_social": score_social,
        "score_total": score_total,
        "priority": priority,
        "temperature": temperature,
        "detected_issues": issues,
        "recommended_action": recommended_action,
        "pagespeed_score": None,
        "load_time_ms": audit.get("tiempo_carga_ms"),
        "has_meta": audit.get("tiene_meta_description", False),
        "has_h1": audit.get("tiene_h1", False),
        "has_sitemap": False,
        "has_https": audit.get("tiene_https", False),
        "is_mobile_friendly": audit.get("tiene_viewport_movil", False),
        "emails_found": [audit.get("email_visible")] if audit.get("email_visible") else [],
        "phones_found": audit.get("telefonos_visibles", []),
    }
    
    return lead


def validate_final_leads(data: Dict[str, Any]) -> bool:
    """Validate final_leads.json structure."""
    errors = []
    
    if "timestamp" not in data:
        errors.append("Missing 'timestamp'")
    if "total_leads" not in data:
        errors.append("Missing 'total_leads'")
    if "leads" not in data or not isinstance(data["leads"], list):
        errors.append("Missing or invalid 'leads' array")
    
    for i, lead in enumerate(data.get("leads", [])):
        required_fields = [
            "place_id", "name", "score_seo", "score_speed",
            "score_contact", "score_social", "score_total",
            "priority", "temperature", "detected_issues", "recommended_action"
        ]
        
        for field in required_fields:
            if field not in lead:
                errors.append(f"Lead {i}: missing '{field}'")
        
        if lead.get("priority") not in ["high", "medium", "low"]:
            errors.append(f"Lead {i}: invalid priority '{lead.get('priority')}'")
        
        if lead.get("temperature") not in ["hot", "warm", "cold"]:
            errors.append(f"Lead {i}: invalid temperature '{lead.get('temperature')}'")
        
        if not isinstance(lead.get("detected_issues"), list):
            errors.append(f"Lead {i}: detected_issues must be array")
        
        for score_field in ["score_seo", "score_speed", "score_contact", "score_social", "score_total"]:
            if not isinstance(lead.get(score_field), (int, float)):
                errors.append(f"Lead {i}: {score_field} must be number")
    
    if errors:
        for error in errors:
            print(f"[enhance_leads.py] Validation error: {error}", file=sys.stderr)
        return False
    
    return True


def main():
    """Main execution."""
    try:
        print(f"[enhance_leads.py] Starting lead enhancement...")
        
        # Read input
        input_file = "output/audit_results.json"
        if not os.path.exists(input_file):
            print(f"[enhance_leads.py] ERROR: Input file not found: {input_file}", file=sys.stderr)
            return 1
        
        with open(input_file, "r", encoding="utf-8") as f:
            data = json.load(f)
        
        audits = data.get("audits", [])
        print(f"[enhance_leads.py] Loaded {len(audits)} audits")
        
        # Create output directory
        os.makedirs("output", exist_ok=True)
        
        # Transform audits to leads
        leads = []
        for audit in audits:
            lead = transform_audit_to_lead(audit)
            leads.append(lead)
        
        print(f"[enhance_leads.py] Transformed {len(leads)} leads")
        
        # Create final output
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        final_output = {
            "timestamp": datetime.now().isoformat(),
            "total_leads": len(leads),
            "leads": leads,
        }
        
        # Validate
        if not validate_final_leads(final_output):
            print(f"[enhance_leads.py] ERROR: Validation failed", file=sys.stderr)
            return 1
        
        # Save JSON (REQUIRED BY BACKEND)
        json_file = "output/final_leads.json"
        with open(json_file, "w", encoding="utf-8") as f:
            json.dump(final_output, f, indent=2, ensure_ascii=False)
        print(f"[enhance_leads.py] Saved final leads to {json_file}")
        
        # Save Excel
        if leads:
            df = pd.DataFrame(leads)
            excel_file = f"output/leads_mejorados_{timestamp}.xlsx"
            df.to_excel(excel_file, index=False, engine="openpyxl")
            print(f"[enhance_leads.py] Saved Excel to {excel_file}")
            
            # Save CSV
            csv_file = f"output/leads_mejorados_{timestamp}.csv"
            df.to_csv(csv_file, index=False, encoding="utf-8")
            print(f"[enhance_leads.py] Saved CSV to {csv_file}")
        
        print(f"[enhance_leads.py] Enhancement completed successfully")
        return 0
        
    except Exception as e:
        print(f"[enhance_leads.py] ERROR: {str(e)}", file=sys.stderr)
        import traceback
        traceback.print_exc(file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())

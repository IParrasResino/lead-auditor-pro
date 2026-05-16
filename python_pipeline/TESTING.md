# Testing the Python Pipeline

## Setup

### 1. Create virtual environment

```bash
cd python_pipeline
python3 -m venv .venv
```

### 2. Activate virtual environment

**Linux/macOS:**
```bash
source .venv/bin/activate
```

**Windows:**
```bash
.venv\Scripts\activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

## Running the Pipeline

### Full pipeline (all 3 scripts)

```bash
# Set environment variables
export GOOGLE_PLACES_API_KEY="your-api-key-here"
export CITY="Madrid"
export ZONES="Centro,Salamanca"
export SECTORS="restaurantes,clínicas"
export MAX_PAGES=1
export MIN_RATING=4.0
export MIN_REVIEWS=75
export ONLY_WITHOUT_WEBSITE=false
export REQUEST_DELAY_SECONDS=0.5
export NEXT_PAGE_DELAY_SECONDS=0.5
export AUDIT_TIMEOUT_SECONDS=10
export AUDIT_DELAY_SECONDS=0.2
export ENABLE_EMAIL_EXTRACTION=true
export ENABLE_SOCIAL_EXTRACTION=true
export WEBSITE_AUDIT_LIMIT=100
export AUDIT_ONLY_WITH_WEBSITE=false

# Run scripts sequentially
python3 main.py && python3 audit_webs.py && python3 enhance_leads.py
```

### Individual scripts

**1. Search for businesses:**
```bash
python3 main.py
```
Output: `output/places_results.json`, `output/leads_base_YYYYMMDD_HHMMSS.xlsx`

**2. Audit websites:**
```bash
python3 audit_webs.py
```
Output: `output/audit_results.json`, `output/leads_auditados_YYYYMMDD_HHMMSS.xlsx`

**3. Enhance and score leads:**
```bash
python3 enhance_leads.py
```
Output: `output/final_leads.json`, `output/leads_mejorados_YYYYMMDD_HHMMSS.xlsx`, `output/leads_mejorados_YYYYMMDD_HHMMSS.csv`

## Output Files

### final_leads.json (REQUIRED BY BACKEND)

**Location:** `output/final_leads.json`

**Structure:**
```json
{
  "timestamp": "2026-05-16T12:34:56.789Z",
  "total_leads": 42,
  "leads": [
    {
      "place_id": "ChIJ1234567890",
      "name": "Business Name",
      "sector": "restaurants",
      "zone": "Centro",
      "address": "Street 123, City",
      "website": "https://example.com",
      "email": "info@example.com",
      "phone": "+34 91 234 5678",
      "rating": 4.5,
      "review_count": 127,
      "facebook": "https://facebook.com/...",
      "instagram": "https://instagram.com/...",
      "linkedin": null,
      "twitter": null,
      "score_seo": 65,
      "score_speed": 72,
      "score_contact": 85,
      "score_social": 45,
      "score_total": 67,
      "priority": "high",
      "temperature": "hot",
      "detected_issues": ["Issue 1", "Issue 2"],
      "recommended_action": "Action to take",
      "pagespeed_score": null,
      "load_time_ms": 2400,
      "has_meta": true,
      "has_h1": true,
      "has_sitemap": false,
      "has_https": true,
      "is_mobile_friendly": true,
      "emails_found": ["info@example.com"],
      "phones_found": ["+34 91 234 5678"]
    }
  ]
}
```

### Excel files

- `leads_base_YYYYMMDD_HHMMSS.xlsx` — Raw business data from Google Places
- `leads_auditados_YYYYMMDD_HHMMSS.xlsx` — Audit results
- `leads_mejorados_YYYYMMDD_HHMMSS.xlsx` — Final leads with scores

### CSV file

- `leads_mejorados_YYYYMMDD_HHMMSS.csv` — Final leads in CSV format

## Testing with Mock Data

If you don't have a Google Places API key, you can test the pipeline with mock data:

### 1. Create mock output/places_results.json

```json
{
  "timestamp": "2026-05-16T12:34:56.789Z",
  "city": "Madrid",
  "zones": ["Centro"],
  "sectors": ["restaurantes"],
  "total_places": 2,
  "places": [
    {
      "place_id": "ChIJ1234567890",
      "nombre_negocio": "Restaurante El Patio",
      "sector": "restaurantes",
      "zona_busqueda": "Centro",
      "direccion": "Calle Mayor 45, Madrid",
      "web": "https://elpatio.es",
      "telefono": "+34 91 234 5678",
      "rating": 4.5,
      "reseñas": 127,
      "estado_negocio": "OPERATIONAL"
    },
    {
      "place_id": "ChIJ9876543210",
      "nombre_negocio": "Pizzería La Nonna",
      "sector": "restaurantes",
      "zona_busqueda": "Centro",
      "direccion": "Calle Alcalá 100, Madrid",
      "web": "https://lanonna.es",
      "telefono": "+34 91 987 6543",
      "rating": 4.2,
      "reseñas": 89,
      "estado_negocio": "OPERATIONAL"
    }
  ]
}
```

### 2. Create mock output/audit_results.json

```json
{
  "timestamp": "2026-05-16T12:34:56.789Z",
  "total_audited": 2,
  "audits": [
    {
      "place_id": "ChIJ1234567890",
      "nombre_negocio": "Restaurante El Patio",
      "sector": "restaurantes",
      "zona_busqueda": "Centro",
      "direccion": "Calle Mayor 45, Madrid",
      "web": "https://elpatio.es",
      "telefono": "+34 91 234 5678",
      "rating": 4.5,
      "reseñas": 127,
      "estado_negocio": "OPERATIONAL",
      "estado_web_auditado": "web_auditada",
      "http_status": 200,
      "tiene_https": true,
      "email_visible": "info@elpatio.es",
      "telefonos_visibles": ["+34 91 234 5678"],
      "tiene_whatsapp": true,
      "tiene_formulario": true,
      "instagram": "https://instagram.com/elpatio",
      "facebook": "https://facebook.com/elpatio",
      "tiene_meta_description": true,
      "tiene_h1": true,
      "tiene_viewport_movil": true,
      "tiene_analytics": true,
      "tiempo_carga_ms": 1200
    },
    {
      "place_id": "ChIJ9876543210",
      "nombre_negocio": "Pizzería La Nonna",
      "sector": "restaurantes",
      "zona_busqueda": "Centro",
      "direccion": "Calle Alcalá 100, Madrid",
      "web": "https://lanonna.es",
      "telefono": "+34 91 987 6543",
      "rating": 4.2,
      "reseñas": 89,
      "estado_negocio": "OPERATIONAL",
      "estado_web_auditado": "web_auditada",
      "http_status": 200,
      "tiene_https": true,
      "email_visible": "info@lanonna.es",
      "telefonos_visibles": ["+34 91 987 6543"],
      "tiene_whatsapp": false,
      "tiene_formulario": false,
      "instagram": null,
      "facebook": "https://facebook.com/lanonna",
      "tiene_meta_description": false,
      "tiene_h1": true,
      "tiene_viewport_movil": true,
      "tiene_analytics": false,
      "tiempo_carga_ms": 2800
    }
  ]
}
```

### 3. Run enhance_leads.py

```bash
python3 enhance_leads.py
```

This will generate `output/final_leads.json` with proper scores and validation.

## Troubleshooting

### Missing API key
```
ERROR: Missing required environment variable: GOOGLE_PLACES_API_KEY
```
Solution: Set the `GOOGLE_PLACES_API_KEY` environment variable

### File not found
```
ERROR: Input file not found: output/places_results.json
```
Solution: Run `main.py` first to generate the input file

### Validation failed
```
ERROR: Validation failed
```
Solution: Check the error messages above. Ensure all required fields are present in the JSON.

### JSON parse error
```
Failed to parse output file: ...
```
Solution: Ensure the JSON file is valid. Use a JSON validator.

## Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `GOOGLE_PLACES_API_KEY` | (required) | Google Places API key |
| `CITY` | Madrid | City to search in |
| `ZONES` | Centro | Comma-separated zones |
| `SECTORS` | restaurantes | Comma-separated sectors |
| `MAX_PAGES` | 1 | Max pages to fetch (1-10) |
| `MIN_RATING` | 4.0 | Minimum rating filter |
| `MIN_REVIEWS` | 75 | Minimum reviews filter |
| `ONLY_WITHOUT_WEBSITE` | false | Only businesses without website |
| `REQUEST_DELAY_SECONDS` | 0.5 | Delay between API requests |
| `NEXT_PAGE_DELAY_SECONDS` | 0.5 | Delay between pages |
| `AUDIT_TIMEOUT_SECONDS` | 10 | Timeout for website audit |
| `AUDIT_DELAY_SECONDS` | 0.2 | Delay between audits |
| `ENABLE_EMAIL_EXTRACTION` | true | Extract emails from websites |
| `ENABLE_SOCIAL_EXTRACTION` | true | Extract social media links |
| `WEBSITE_AUDIT_LIMIT` | 100 | Max websites to audit |
| `AUDIT_ONLY_WITH_WEBSITE` | false | Only audit businesses with website |

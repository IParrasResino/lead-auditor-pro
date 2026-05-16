# Python Pipeline Output Contract

## Archivo de salida requerido

**Ubicación:** `python_pipeline/output/final_leads.json`

**Generado por:** `enhance_leads.py` (último script del pipeline)

---

## Estructura JSON

```json
{
  "timestamp": "2026-05-16T12:34:56.789Z",
  "total_leads": 42,
  "leads": [
    {
      "place_id": "ChIJ1234567890abcdefghij",
      "name": "Clínica Dental Sonrisa",
      "sector": "clínicas dentales",
      "zone": "Centro",
      "address": "Calle Mayor 45, Madrid",
      "website": "https://www.clinica-sonrisa.es",
      "email": "info@clinica-sonrisa.es",
      "phone": "+34 91 234 5678",
      "rating": 4.5,
      "review_count": 127,
      "facebook": "https://facebook.com/clinicasonrisa",
      "instagram": "https://instagram.com/clinicasonrisa",
      "linkedin": null,
      "twitter": null,
      "score_seo": 65,
      "score_speed": 72,
      "score_contact": 85,
      "score_social": 45,
      "score_total": 67,
      "priority": "high",
      "temperature": "hot",
      "detected_issues": [
        "Velocidad de carga lenta",
        "Sin presencia en redes sociales"
      ],
      "recommended_action": "Optimizar imágenes y mejorar estrategia de redes sociales",
      "pagespeed_score": 68,
      "load_time_ms": 2400,
      "has_meta": true,
      "has_h1": true,
      "has_sitemap": false,
      "has_https": true,
      "is_mobile_friendly": true,
      "emails_found": ["info@clinica-sonrisa.es", "contacto@clinica-sonrisa.es"],
      "phones_found": ["+34 91 234 5678"]
    }
  ]
}
```

---

## Campos requeridos (OBLIGATORIOS)

Estos campos **DEBEN** estar presentes en cada lead. Si falta alguno, la importación fallará:

| Campo | Tipo | Descripción | Ejemplo |
|-------|------|-------------|---------|
| `place_id` | string | ID único de Google Places | `"ChIJ1234567890abcdefghij"` |
| `name` | string | Nombre del negocio | `"Clínica Dental Sonrisa"` |
| `score_seo` | number | Score SEO (0-100) | `65` |
| `score_speed` | number | Score velocidad (0-100) | `72` |
| `score_contact` | number | Score contacto (0-100) | `85` |
| `score_social` | number | Score redes sociales (0-100) | `45` |
| `score_total` | number | Score total (0-100) | `67` |
| `priority` | string | Prioridad comercial | `"high"` \| `"medium"` \| `"low"` |
| `temperature` | string | Temperatura del lead | `"hot"` \| `"warm"` \| `"cold"` |
| `detected_issues` | array | Lista de problemas detectados | `["Velocidad lenta", "Sin HTTPS"]` |
| `recommended_action` | string | Acción recomendada | `"Optimizar imágenes"` |

---

## Campos opcionales (RECOMENDADOS)

Estos campos son opcionales. Si faltan, se rellenarán con valores por defecto:

| Campo | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| `sector` | string | `"Unknown"` | Sector del negocio |
| `zone` | string | `"Unknown"` | Zona/barrio |
| `address` | string | `""` | Dirección completa |
| `website` | string \| null | `null` | URL del sitio web |
| `email` | string \| null | `null` | Email principal |
| `phone` | string | `null` | Teléfono |
| `rating` | number \| string | `"0"` | Rating en Google (0-5) |
| `review_count` | number | `0` | Cantidad de reseñas |
| `facebook` | string \| null | `null` | URL de Facebook |
| `instagram` | string \| null | `null` | URL de Instagram |
| `linkedin` | string \| null | `null` | URL de LinkedIn |
| `twitter` | string \| null | `null` | URL de Twitter |
| `pagespeed_score` | number \| null | `null` | Score de PageSpeed Insights |
| `load_time_ms` | number \| null | `null` | Tiempo de carga en ms |
| `has_meta` | boolean | `false` | ¿Tiene metadescripción? |
| `has_h1` | boolean | `false` | ¿Tiene H1 visible? |
| `has_sitemap` | boolean | `false` | ¿Tiene sitemap.xml? |
| `has_https` | boolean | `false` | ¿Tiene HTTPS? |
| `is_mobile_friendly` | boolean | `false` | ¿Es mobile-friendly? |
| `emails_found` | array | `[]` | Emails encontrados |
| `phones_found` | array | `[]` | Teléfonos encontrados |

---

## Estructura raíz

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `timestamp` | string | ISO 8601 timestamp de generación |
| `total_leads` | number | Total de leads en el array |
| `leads` | array | Array de leads (puede estar vacío) |

---

## Validaciones que hace el backend

### 1. Archivo no existe
**Error:** `Output file not found: /path/to/python_pipeline/output/final_leads.json`
**Acción:** Campaña marcada como `error`

### 2. JSON mal formado
**Error:** `Failed to parse output file: Unexpected token } in JSON at position 123`
**Acción:** Campaña marcada como `error`

### 3. Estructura raíz inválida
**Error:** `Invalid output format: missing 'leads' array`
**Acción:** Campaña marcada como `error`

### 4. Lead sin `place_id` o `name`
**Error:** `Lead at index 5 missing required fields: place_id or name`
**Acción:** Campaña marcada como `error`

### 5. Lead con scores inválidos
**Error:** `Lead at index 5 missing or invalid score fields`
**Acción:** Campaña marcada como `error`

### 6. Leads no creados en BD
**Error:** `No leads were created in database`
**Acción:** Campaña marcada como `error`

### 7. Mismatch entre leads esperados y creados
**Warning:** `Created 40 leads but expected 42`
**Acción:** Campaña continúa (warning en logs)

---

## Ejemplo mínimo (todos los campos obligatorios)

```json
{
  "timestamp": "2026-05-16T12:34:56.789Z",
  "total_leads": 1,
  "leads": [
    {
      "place_id": "ChIJ1234567890",
      "name": "Mi Negocio",
      "score_seo": 50,
      "score_speed": 50,
      "score_contact": 50,
      "score_social": 50,
      "score_total": 50,
      "priority": "medium",
      "temperature": "warm",
      "detected_issues": ["Necesita mejoras"],
      "recommended_action": "Revisar web"
    }
  ]
}
```

---

## Ejemplo completo (con campos opcionales)

```json
{
  "timestamp": "2026-05-16T12:34:56.789Z",
  "total_leads": 1,
  "leads": [
    {
      "place_id": "ChIJ1234567890abcdefghij",
      "name": "Clínica Dental Sonrisa",
      "sector": "clínicas dentales",
      "zone": "Centro",
      "address": "Calle Mayor 45, Madrid",
      "website": "https://www.clinica-sonrisa.es",
      "email": "info@clinica-sonrisa.es",
      "phone": "+34 91 234 5678",
      "rating": 4.5,
      "review_count": 127,
      "facebook": "https://facebook.com/clinicasonrisa",
      "instagram": "https://instagram.com/clinicasonrisa",
      "linkedin": null,
      "twitter": null,
      "score_seo": 65,
      "score_speed": 72,
      "score_contact": 85,
      "score_social": 45,
      "score_total": 67,
      "priority": "high",
      "temperature": "hot",
      "detected_issues": [
        "Velocidad de carga lenta",
        "Sin presencia en redes sociales"
      ],
      "recommended_action": "Optimizar imágenes y mejorar estrategia de redes sociales",
      "pagespeed_score": 68,
      "load_time_ms": 2400,
      "has_meta": true,
      "has_h1": true,
      "has_sitemap": false,
      "has_https": true,
      "is_mobile_friendly": true,
      "emails_found": [
        "info@clinica-sonrisa.es",
        "contacto@clinica-sonrisa.es"
      ],
      "phones_found": ["+34 91 234 5678"]
    }
  ]
}
```

---

## Cómo generar este archivo

1. **main.py** busca negocios → genera `output/places_results.json`
2. **audit_webs.py** audita webs → genera `output/audit_results.json`
3. **enhance_leads.py** extrae contactos → **genera `output/final_leads.json`** ← ESTE ARCHIVO

---

## Notas importantes

- Los scores deben ser números entre 0 y 100
- `priority` solo acepta: `"high"`, `"medium"`, `"low"`
- `temperature` solo acepta: `"hot"`, `"warm"`, `"cold"`
- `detected_issues` debe ser un array (puede estar vacío)
- `emails_found` y `phones_found` deben ser arrays
- Si no hay website, dejar `website: null`
- Si no hay email, dejar `email: null`
- El `place_id` debe ser único por campaña
- El `timestamp` debe ser ISO 8601 válido

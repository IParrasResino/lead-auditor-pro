# Python Pipeline — Lead Auditor Pro

Esta carpeta contiene los scripts Python que ejecutan el pipeline de auditoría de leads.

## Estructura

```
python_pipeline/
├── main.py                 # Búsqueda de negocios en Google Places
├── audit_webs.py          # Auditoría de sitios web
├── enhance_leads.py       # Extracción de contactos y mejora de datos
├── requirements.txt       # Dependencias Python
├── output/                # Carpeta de salida (resultados)
└── .venv/                 # Virtual environment (crear localmente)
```

## Instalación

### 1. Crear virtual environment

```bash
cd python_pipeline
python -m venv .venv
```

### 2. Activar virtual environment

**En Linux/Mac:**
```bash
source .venv/bin/activate
```

**En Windows:**
```bash
.venv\Scripts\activate
```

### 3. Instalar dependencias

```bash
pip install -r requirements.txt
```

## Scripts

### main.py
**Búsqueda de negocios en Google Places**

Entrada: Variables de entorno (CITY, ZONES, SECTORS, etc.)
Salida: `output/places_results.json`

Variables de entorno esperadas:
- `GOOGLE_PLACES_API_KEY` — API key de Google Places
- `CITY` — Ciudad principal
- `ZONES` — Zonas/barrios (separadas por coma)
- `SECTORS` — Sectores/rubros (separados por coma)
- `MAX_PAGES` — Máximo de páginas de resultados
- `MIN_RATING` — Rating mínimo
- `MIN_REVIEWS` — Mínimo de reseñas
- `REQUEST_DELAY_SECONDS` — Delay entre requests

### audit_webs.py
**Auditoría de sitios web**

Entrada: `output/places_results.json`
Salida: `output/audit_results.json`

Variables de entorno esperadas:
- `PAGESPEED_API_KEY` — API key de PageSpeed
- `ENABLE_WEBSITE_AUDIT` — ¿Auditar webs?
- `ENABLE_PAGESPEED` — ¿Ejecutar PageSpeed?
- `WEBSITE_TIMEOUT_SECONDS` — Timeout para auditoría
- `AUDIT_DELAY_SECONDS` — Delay entre auditorías

### enhance_leads.py
**Extracción de contactos y mejora de datos**

Entrada: `output/audit_results.json`
Salida: `output/final_leads.json` (importado a BD)

Variables de entorno esperadas:
- `HUNTER_API_KEY` — API key de Hunter.io
- `ENABLE_EMAIL_EXTRACTION` — ¿Extraer emails?
- `ENABLE_SOCIAL_EXTRACTION` — ¿Extraer redes?
- `CONTACT_PAGE_LIMIT` — Límite de páginas de contacto

## Flujo de ejecución

El backend ejecuta secuencialmente:

1. **main.py** (10 min timeout)
   - Busca negocios en Google Places
   - Genera `output/places_results.json`

2. **audit_webs.py** (15 min timeout)
   - Lee `output/places_results.json`
   - Audita cada sitio web
   - Genera `output/audit_results.json`

3. **enhance_leads.py** (10 min timeout)
   - Lee `output/audit_results.json`
   - Extrae contactos y redes sociales
   - Genera `output/final_leads.json`
   - Backend importa a la base de datos

## Logs

Todos los logs se capturan en tiempo real y se envían al frontend:
- Stdout se muestra como logs normales
- Stderr se prefija con `[stderr]`
- Errores de Python causan que la campaña falle con status "error"

## Desarrollo local

Para probar los scripts localmente:

```bash
cd python_pipeline
source .venv/bin/activate

# Configurar variables de entorno
export GOOGLE_PLACES_API_KEY="tu_key_aqui"
export CITY="Madrid"
export ZONES="Centro,Carabanchel"
export SECTORS="clínicas dentales"

# Ejecutar scripts
python main.py
python audit_webs.py
python enhance_leads.py
```

## Notas importantes

- Los scripts deben leer variables de entorno, no argumentos de línea de comandos
- Todos los outputs deben ir a la carpeta `output/`
- Los logs deben escribirse en stdout (se capturan automáticamente)
- Los errores deben escribirse en stderr
- El código de salida debe ser 0 si todo va bien, distinto de 0 si hay error
- Los scripts deben ser idempotentes (pueden ejecutarse múltiples veces)

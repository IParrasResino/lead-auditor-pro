# Lead Auditor Pro — Railway Deployment Guide

## Overview

Railway es una plataforma moderna que detecta automáticamente Dockerfile y lo usa para desplegar. Este proyecto funciona perfectamente en Railway porque:

- ✓ Dockerfile instala Node.js + Python 3 + dependencias
- ✓ Código usa rutas relativas (funciona en cualquier directorio)
- ✓ Railway gestiona variables de entorno fácilmente
- ✓ Railway soporta bases de datos MySQL/TiDB

## Prerequisites

- Cuenta en [Railway.app](https://railway.app)
- Repositorio GitHub con el código
- Google Places API key (opcional, para búsquedas reales)

## Step 1: Preparar el repositorio en GitHub

### 1.1 Crear repositorio en GitHub

```bash
cd /home/ubuntu/lead-auditor-pro
git init
git add .
git commit -m "Initial commit: Lead Auditor Pro with Python pipeline"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/lead-auditor-pro.git
git push -u origin main
```

### 1.2 Archivos requeridos en GitHub

Asegúrate de que estos archivos están en la raíz del repositorio:

```
lead-auditor-pro/
├── Dockerfile              ✓ (detectado automáticamente)
├── .dockerignore            ✓ (optimiza build)
├── package.json             ✓ (dependencias Node)
├── pnpm-lock.yaml           ✓ (lock file)
├── python_pipeline/
│   ├── main.py              ✓
│   ├── audit_webs.py        ✓
│   ├── enhance_leads.py     ✓
│   ├── requirements.txt      ✓
│   └── output/              ✓ (carpeta para resultados)
├── server/                  ✓ (backend tRPC)
├── client/                  ✓ (frontend React)
├── drizzle/                 ✓ (schema BD)
└── vite.config.ts           ✓
```

## Step 2: Conectar Railway con GitHub

### 2.1 Crear proyecto en Railway

1. Ve a [Railway.app](https://railway.app)
2. Click en "New Project"
3. Selecciona "GitHub Repo"
4. Autoriza Railway en GitHub
5. Selecciona tu repositorio `lead-auditor-pro`
6. Railway detectará automáticamente el Dockerfile

### 2.2 Verificar que Railway usa Dockerfile

En el panel de Railway:
1. Ve a "Deployments"
2. Verifica que el build log muestra:
   ```
   Building from Dockerfile
   FROM node:22-alpine
   Installing Python 3...
   ```

Si no aparece "Building from Dockerfile", ve a "Settings" → "Build" y cambia:
- Build Command: (dejar vacío o `pnpm build`)
- Dockerfile: `./Dockerfile`

## Step 3: Configurar variables de entorno

En el panel de Railway:

1. Ve a "Variables"
2. Añade estas variables:

### Variables requeridas (Manus OAuth)

```
VITE_APP_ID=SJXbZnbd9PEjpv7mNc86Bj
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://manus.im
JWT_SECRET=your-random-secret-key-here
NODE_ENV=production
```

### Variables para Google Places (opcional, para búsquedas reales)

```
GOOGLE_PLACES_API_KEY=your-google-places-api-key
PAGESPEED_API_KEY=your-pagespeed-api-key
HUNTER_API_KEY=your-hunter-api-key
```

### Variables de base de datos

Railway puede provisionar MySQL automáticamente. Opción A (Recomendada):

1. En Railway, click "Add" → "MySQL"
2. Railway inyectará `DATABASE_URL` automáticamente
3. Verifica en "Variables" que existe `DATABASE_URL`

Opción B (Base de datos externa):

```
DATABASE_URL=mysql://user:password@host:port/database?ssl={...}
```

### Variables opcionales

```
VITE_APP_TITLE=Lead Auditor Pro
VITE_APP_LOGO=
OWNER_NAME=Tu Nombre
OWNER_OPEN_ID=tu-open-id
```

## Step 4: Desplegar

### 4.1 Trigger deployment

```bash
git push origin main
```

Railway detectará los cambios y desplegará automáticamente.

### 4.2 Monitorear el build

En el panel de Railway:
1. Ve a "Deployments"
2. Espera a que el build complete (5-10 minutos)
3. Verifica que no hay errores en los logs

Build log esperado:
```
[1/2] Building from Dockerfile...
FROM node:22-alpine
RUN apk add --no-cache python3 py3-pip python3-dev build-base
...
Successfully built image
Deploying...
```

### 4.3 Obtener URL pública

Una vez desplegado:
1. Ve a "Deployments" → "Settings"
2. Copia la URL pública (ej: `https://lead-auditor-pro-production.up.railway.app`)
3. Accede a esa URL en el navegador

## Step 5: Configurar base de datos

### 5.1 Ejecutar migraciones

Railway ejecuta automáticamente el comando en `package.json`:

```json
"start": "NODE_ENV=production node dist/index.js"
```

Si necesitas ejecutar migraciones manualmente:

1. En Railway, ve a "Shell"
2. Ejecuta:
   ```bash
   pnpm db:push
   ```

### 5.2 Verificar conexión BD

En el panel de Railway:
1. Ve a "MySQL" (si lo añadiste)
2. Verifica que está "Connected"
3. Copia `DATABASE_URL` y úsalo en tu app

## Step 6: Validar Python en producción

### 6.1 Acceder a la shell de Railway

En el panel de Railway:
1. Ve a "Deployments" → tu deployment actual
2. Click en "Shell"
3. Ejecuta:

```bash
which python3
python3 --version
ls -la python_pipeline/.venv/bin/python
python_pipeline/.venv/bin/python --version
```

Salida esperada:
```
/usr/bin/python3
Python 3.11.0
lrwxrwxrwx 1 root root 7 python_pipeline/.venv/bin/python -> python3
Python 3.11.0
```

### 6.2 Si Python no existe

Si ves error "python3: not found", significa que el Dockerfile no se ejecutó correctamente:

1. Ve a "Settings" → "Build"
2. Verifica que "Dockerfile" está configurado a `./Dockerfile`
3. Redeploy:
   ```bash
   git commit --allow-empty -m "Trigger redeploy"
   git push origin main
   ```

## Step 7: Lanzar campaña de prueba

### 7.1 Acceder a la app

1. Abre tu URL pública (ej: `https://lead-auditor-pro-production.up.railway.app`)
2. Click "Iniciar sesión" (Manus OAuth)
3. Inicia sesión con tu cuenta Manus

### 7.2 Configurar API keys (opcional)

1. Ve a "Ajustes"
2. Configura:
   - Google Places API key (si tienes)
   - PageSpeed API key (opcional)
   - Hunter.io API key (opcional)

### 7.3 Crear campaña de prueba

1. Click "Crear campaña"
2. Completa el formulario:
   - Nombre: "Prueba Railway"
   - Ciudad: Madrid
   - Zonas: Leganés
   - Sectores: clínicas dentales
   - Rating mínimo: 4.0
   - Reseñas mínimas: 75
   - Max pages: 1
   - Max audit leads: 5
   - PageSpeed: false

3. Click "Comenzar campaña"

### 7.4 Monitorear progreso

1. Ve a "Dashboard"
2. Verifica que la campaña aparece en "Campañas activas"
3. Click en la campaña para ver:
   - Progreso (%)
   - Logs en tiempo real
   - Estado actual

Progreso esperado:
```
5% Preparando campaña
25% Buscando negocios en Google Places
55% Auditando webs
85% Generando Excel comercial final
90% Importando resultados
100% Campaña finalizada
```

### 7.5 Ver resultados

1. Una vez completada (100%), ve a "Resultados"
2. Verifica que aparecen los leads importados
3. Revisa los scores (SEO, velocidad, contacto, redes)

## Step 8: Descargar resultados

### 8.1 Exportar a Excel

1. Ve a "Resultados"
2. Click "Descargar Excel"
3. Se descargará `leads_YYYY-MM-DD.xlsx` con todos los datos y scoring

### 8.2 Exportar a CSV

1. Ve a "Resultados"
2. Click "Descargar CSV"
3. Se descargará `leads_YYYY-MM-DD.csv`

## Step 9: Troubleshooting

### Error: "Python is not available"

**Causa:** El Dockerfile no se ejecutó o Python 3 no se instaló.

**Solución:**

1. Verifica que `Dockerfile` existe en la raíz del repositorio
2. En Railway → "Settings" → "Build", asegúrate que:
   - Build Command: (vacío o `pnpm build`)
   - Dockerfile: `./Dockerfile`
3. Redeploy:
   ```bash
   git commit --allow-empty -m "Force redeploy"
   git push origin main
   ```

### Error: "Module not found (pandas, requests, etc.)"

**Causa:** Las dependencias Python no se instalaron correctamente.

**Solución:**

1. Verifica que `python_pipeline/requirements.txt` existe
2. Verifica que el Dockerfile ejecuta:
   ```dockerfile
   RUN cd python_pipeline && \
       python3 -m venv .venv && \
       .venv/bin/python -m pip install -r requirements.txt
   ```
3. Redeploy

### Error: "DATABASE_URL not found"

**Causa:** La base de datos no está configurada.

**Solución:**

1. En Railway, click "Add" → "MySQL"
2. Espera a que se provisione (1-2 minutos)
3. Verifica en "Variables" que `DATABASE_URL` existe
4. Redeploy

### Error: "Build failed"

**Causa:** Error en el build del Dockerfile.

**Solución:**

1. En Railway → "Deployments", ve al deployment fallido
2. Expande los logs y busca el error
3. Errores comunes:
   - `pnpm: not found` → Verifica que `package.json` existe
   - `python3: not found` → Verifica que el Dockerfile instala Python
   - `Module not found` → Verifica `requirements.txt`
4. Corrige el error en GitHub y haz push

### Error: "Port 3000 already in use"

**Causa:** Otro proceso usa el puerto 3000.

**Solución:**

Railway asigna automáticamente el puerto. No necesitas hacer nada. La app debería funcionar.

### Campaña se ejecuta pero no importa resultados

**Causa:** El archivo `output/final_leads.json` no se generó correctamente.

**Solución:**

1. En Railway → "Shell", ejecuta:
   ```bash
   ls -la python_pipeline/output/
   cat python_pipeline/output/final_leads.json | head -50
   ```
2. Verifica que el JSON tiene la estructura correcta
3. Consulta `python_pipeline/OUTPUT_CONTRACT.md` para el formato esperado

## Step 10: Monitoreo en producción

### 10.1 Logs

En Railway:
1. Ve a "Deployments" → tu deployment
2. Click "Logs"
3. Busca errores o warnings

### 10.2 Métricas

En Railway:
1. Ve a "Metrics"
2. Monitorea:
   - CPU usage
   - Memory usage
   - Network I/O

### 10.3 Alertas

En Railway:
1. Ve a "Settings" → "Alerts"
2. Configura alertas para:
   - Build failures
   - Deployment failures
   - High CPU/Memory

## Step 11: Actualizaciones

### 11.1 Hacer cambios en el código

```bash
# Haz cambios localmente
git add .
git commit -m "Descripción del cambio"
git push origin main
```

Railway detectará los cambios y desplegará automáticamente.

### 11.2 Actualizar dependencias

```bash
# Node
pnpm add nombre-paquete

# Python
echo "nuevo-paquete==version" >> python_pipeline/requirements.txt

# Commit y push
git add .
git commit -m "Update dependencies"
git push origin main
```

## Step 12: Dominio personalizado (Opcional)

En Railway:
1. Ve a "Settings" → "Domains"
2. Click "Add Domain"
3. Opción A: Usar dominio de Railway (gratis)
4. Opción B: Conectar dominio personalizado
   - Añade record CNAME en tu registrador DNS
   - Apunta a `*.railway.app`

## Resumen

| Paso | Acción |
|------|--------|
| 1 | Push código a GitHub |
| 2 | Conectar Railway con GitHub |
| 3 | Configurar variables de entorno |
| 4 | Esperar a que build complete |
| 5 | Acceder a URL pública |
| 6 | Validar Python en shell |
| 7 | Lanzar campaña de prueba |
| 8 | Descargar resultados |

## Support

- Railway Docs: https://docs.railway.app
- Dockerfile Reference: https://docs.docker.com/engine/reference/builder/
- Este proyecto: `DEPLOYMENT.md`, `SETUP.md`, `python_pipeline/README.md`

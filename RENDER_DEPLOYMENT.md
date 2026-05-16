# Lead Auditor Pro — Render Deployment Guide (Alternativa)

## Overview

Render es una alternativa a Railway con soporte completo para Dockerfile. Proceso similar pero con algunas diferencias en la interfaz.

## Quick Start

### 1. Preparar GitHub

```bash
git push origin main
```

### 2. Crear servicio en Render

1. Ve a [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Selecciona tu repositorio GitHub
4. Configura:
   - **Name:** lead-auditor-pro
   - **Environment:** Docker
   - **Region:** Frankfurt (EU) o us-east-1
   - **Branch:** main

### 3. Configurar variables de entorno

En Render → "Environment":

```
VITE_APP_ID=SJXbZnbd9PEjpv7mNc86Bj
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://manus.im
JWT_SECRET=your-random-secret
NODE_ENV=production
GOOGLE_PLACES_API_KEY=your-key (opcional)
```

Para DATABASE_URL:
1. Render → "Add PostgreSQL" (o MySQL)
2. Render inyectará `DATABASE_URL` automáticamente

### 4. Deploy

1. Click "Create Web Service"
2. Render construirá la imagen Docker (5-10 minutos)
3. Una vez completado, obtén la URL pública

### 5. Validar Python

En Render → "Shell":

```bash
which python3
python3 --version
ls -la python_pipeline/.venv/bin/python
```

### 6. Lanzar campaña

Accede a tu URL pública y sigue los mismos pasos que en Railway.

## Diferencias con Railway

| Aspecto | Railway | Render |
|--------|---------|--------|
| Detección Dockerfile | Automática | Automática |
| Variables de entorno | UI simple | UI simple |
| Base de datos | MySQL/PostgreSQL | PostgreSQL/MySQL |
| Dominio personalizado | Gratis | Gratis |
| Escalado | Automático | Manual |
| Precio | Pago por uso | Pago por uso |
| Build time | 5-10 min | 5-10 min |

## Troubleshooting

### Python no disponible

Mismo que Railway:
1. Verifica `Dockerfile` en GitHub
2. Redeploy forzado:
   ```bash
   git commit --allow-empty -m "Redeploy"
   git push origin main
   ```

### Build falla

En Render → "Logs", busca el error y corrige en GitHub.

## Recomendación

**Usa Railway como primera opción** porque:
- ✓ Interfaz más intuitiva
- ✓ Mejor soporte para Python + Node
- ✓ Mejor documentación
- ✓ Comunidad más activa

**Usa Render como alternativa** si:
- Railway tiene downtime
- Prefieres PostgreSQL
- Necesitas escalado manual más fino

## Pasos completos para Render

1. GitHub push
2. Render: New Web Service → GitHub
3. Seleccionar repo
4. Environment: Docker
5. Añadir variables de entorno
6. Añadir PostgreSQL/MySQL
7. Click "Create Web Service"
8. Esperar build (5-10 min)
9. Validar Python en Shell
10. Lanzar campaña

¡Listo! Render desplegará automáticamente con Python 3 incluido.

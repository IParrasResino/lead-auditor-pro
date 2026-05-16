# Lead Auditor Pro — Deployment Guide

## Deployment to Manus Platform

Lead Auditor Pro incluye un `Dockerfile` que configura automáticamente el entorno con Python 3 para ejecutar el pipeline de campañas.

### Requisitos

- Dockerfile en la raíz del proyecto ✓
- Todas las dependencias en `requirements.txt` ✓
- Variables de entorno configuradas ✓

### Proceso de Deployment

1. **Commit y push** — Asegúrate de que todos los cambios están commiteados:

```bash
git add .
git commit -m "Lead Auditor Pro with Python pipeline"
git push
```

2. **Publicar en Manus** — Desde el panel de gestión:
   - Click en "Publish" button
   - Manus detectará el Dockerfile
   - Construirá la imagen con Node.js + Python 3
   - Desplegará automáticamente

3. **Verificar deployment** — Una vez desplegado:
   - Accede a tu dominio (ej: `leadauditor-xxx.manus.space`)
   - Inicia sesión
   - Ve a Ajustes y configura tu Google Places API key
   - Crea una campaña de prueba

### Lo que Dockerfile hace automáticamente

```dockerfile
# 1. Instala Node.js 22
# 2. Instala Python 3 y pip
# 3. Compila frontend (React + Vite)
# 4. Compila backend (Express + tRPC)
# 5. Crea virtual environment en python_pipeline/
# 6. Instala todas las dependencias Python
# 7. Expone puerto 3000
# 8. Inicia el servidor
```

### Variables de entorno en Manus

Manus inyecta automáticamente estas variables:

- `DATABASE_URL` — Conexión a TiDB
- `JWT_SECRET` — Firma de sesiones
- `VITE_APP_ID` — OAuth app ID
- `OAUTH_SERVER_URL` — OAuth backend
- `VITE_OAUTH_PORTAL_URL` — OAuth portal
- `OWNER_OPEN_ID` — ID del propietario
- `OWNER_NAME` — Nombre del propietario
- `BUILT_IN_FORGE_API_KEY` — API key interna
- `BUILT_IN_FORGE_API_URL` — API URL interna

### Variables de entorno adicionales (opcional)

Puedes configurar en el panel de Manus:

- `GOOGLE_PLACES_API_KEY` — Google Places API key (o configura desde Ajustes en la app)
- `PAGESPEED_API_KEY` — PageSpeed API key (opcional)
- `HUNTER_API_KEY` — Hunter.io API key (opcional)

### Solución de problemas

#### Error: "Python is not available"

**Causa:** El Dockerfile no se ejecutó correctamente durante el build.

**Solución:**
1. Verifica que `Dockerfile` existe en la raíz del proyecto
2. Verifica que `python_pipeline/requirements.txt` existe
3. Redeploy desde el panel de Manus
4. Revisa los logs de build en el panel

#### Error: "Module not found (pandas, requests, etc.)"

**Causa:** Las dependencias Python no se instalaron correctamente.

**Solución:**
1. Verifica `python_pipeline/requirements.txt` tiene todas las dependencias
2. Redeploy
3. Si persiste, contacta al soporte de Manus

#### Campaña se ejecuta pero no importa resultados

**Causa:** El archivo `output/final_leads.json` no se generó correctamente.

**Solución:**
1. Revisa los logs de la campaña en el dashboard
2. Verifica que `enhance_leads.py` genera el archivo JSON correcto
3. Consulta `python_pipeline/OUTPUT_CONTRACT.md` para el formato esperado

### Monitoreo en producción

Una vez desplegado, monitorea:

1. **Logs del servidor** — Panel de Manus → Logs
2. **Métricas** — Panel de Manus → Dashboard
3. **Errores de campaña** — App → Dashboard → Campaña → Logs

### Rollback

Si algo falla después de publicar:

1. Panel de Manus → Version history
2. Selecciona versión anterior
3. Click "Rollback"

### Actualizaciones futuras

Para actualizar el código:

1. Haz cambios localmente
2. Commit y push
3. Publish desde Manus
4. El Dockerfile se ejecutará nuevamente con el código actualizado

## Deployment a otros proveedores

### Docker Hub + Cloud Run (Google)

1. **Build y push a Docker Hub:**

```bash
docker build -t yourusername/lead-auditor-pro:latest .
docker push yourusername/lead-auditor-pro:latest
```

2. **Deploy a Cloud Run:**

```bash
gcloud run deploy lead-auditor-pro \
  --image yourusername/lead-auditor-pro:latest \
  --platform managed \
  --region us-central1 \
  --set-env-vars DATABASE_URL=your-db-url,JWT_SECRET=your-secret
```

### AWS ECS

1. **Push a ECR:**

```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin your-account.dkr.ecr.us-east-1.amazonaws.com
docker build -t lead-auditor-pro:latest .
docker tag lead-auditor-pro:latest your-account.dkr.ecr.us-east-1.amazonaws.com/lead-auditor-pro:latest
docker push your-account.dkr.ecr.us-east-1.amazonaws.com/lead-auditor-pro:latest
```

2. **Deploy con ECS:**
   - Crea task definition con la imagen ECR
   - Crea service
   - Configura load balancer

### Heroku (Legacy)

```bash
heroku login
heroku create lead-auditor-pro
git push heroku main
heroku config:set DATABASE_URL=your-db-url
heroku config:set JWT_SECRET=your-secret
```

## Checklist pre-deployment

- [ ] Dockerfile existe en raíz
- [ ] `.dockerignore` existe
- [ ] `python_pipeline/requirements.txt` actualizado
- [ ] `python_pipeline/main.py` existe
- [ ] `python_pipeline/audit_webs.py` existe
- [ ] `python_pipeline/enhance_leads.py` existe
- [ ] `pnpm build` compila sin errores localmente
- [ ] Tests pasan: `pnpm test`
- [ ] TypeScript sin errores: `pnpm check`
- [ ] Variables de entorno configuradas en Manus
- [ ] Google Places API key disponible

## Post-deployment checklist

- [ ] App carga en el navegador
- [ ] Login funciona (Manus OAuth)
- [ ] Dashboard muestra métricas
- [ ] Puedo crear una campaña
- [ ] Puedo ver progreso en tiempo real
- [ ] Campaña se completa exitosamente
- [ ] Leads se importan a la BD
- [ ] Puedo descargar resultados en Excel/CSV
- [ ] Logs de campaña son visibles

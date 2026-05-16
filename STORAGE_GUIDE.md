# Guía de almacenamiento de datos — Lead Auditor Pro

## Base de datos: TiDB (MySQL-compatible)

Todos los datos de **Lead Auditor Pro** se almacenan en **TiDB**, una base de datos MySQL-compatible integrada en Manus. No requiere configuración manual: está lista para usar.

### Tablas principales

#### 1. **`users`** — Usuarios del sistema
Almacena la información de cada usuario autenticado vía Manus OAuth.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | INT | ID único (clave primaria) |
| `openId` | VARCHAR(64) | Identificador único de Manus OAuth |
| `name` | TEXT | Nombre del usuario |
| `email` | VARCHAR(320) | Email del usuario |
| `loginMethod` | VARCHAR(64) | Método de login (ej: "manus") |
| `role` | ENUM | "user" o "admin" |
| `createdAt` | TIMESTAMP | Fecha de creación |
| `updatedAt` | TIMESTAMP | Última actualización |
| `lastSignedIn` | TIMESTAMP | Último acceso |

**Ejemplo:**
```
id: 1
openId: "user_abc123xyz"
name: "Juan García"
email: "juan@agencia.com"
role: "user"
createdAt: 2026-05-15 23:28:00
```

---

#### 2. **`campaigns`** — Campañas de auditoría
Cada fila representa una campaña de búsqueda y auditoría de leads que el usuario ha creado.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | INT | ID único (clave primaria) |
| `userId` | INT | ID del usuario propietario (FK → users.id) |
| `name` | VARCHAR(255) | Nombre de la campaña |
| `businessType` | VARCHAR(255) | Tipo de negocio (ej: "clínicas dentales") |
| `city` | VARCHAR(255) | Ciudad principal |
| `zones` | JSON | Array de zonas/barrios a buscar |
| `sectors` | JSON | Array de sectores/rubros |
| `searchRadius` | INT | Radio de búsqueda en metros (default: 5000) |
| `minRating` | DECIMAL(3,1) | Rating mínimo requerido (ej: 4.0) |
| `minReviews` | INT | Mínimo de reseñas requeridas |
| `maxPages` | INT | Máximo de páginas de resultados |
| `enableWebsiteAudit` | BOOLEAN | ¿Auditar webs? |
| `enableEmailExtraction` | BOOLEAN | ¿Extraer emails? |
| `enableSocialExtraction` | BOOLEAN | ¿Extraer redes sociales? |
| `maxAuditLeads` | INT | Máximo de leads a auditar |
| `status` | ENUM | "pending", "running", "completed", "error" |
| `progress` | INT | Porcentaje de progreso (0-100) |
| `currentStep` | VARCHAR(255) | Etapa actual (ej: "Auditando webs") |
| `totalLeads` | INT | Total de leads encontrados |
| `auditedLeads` | INT | Total de leads auditados |
| `logs` | JSON | Array de mensajes de log |
| `errorMessage` | TEXT | Mensaje de error si falló |
| `createdAt` | TIMESTAMP | Fecha de creación |
| `updatedAt` | TIMESTAMP | Última actualización |
| `completedAt` | TIMESTAMP | Fecha de finalización |

**Ejemplo:**
```
id: 42
userId: 1
name: "Clínicas dentales Madrid - Abril 2026"
businessType: "clínicas dentales"
city: "Madrid"
zones: ["Carabanchel", "Usera", "San Blas"]
sectors: ["clínicas dentales", "odontología"]
status: "completed"
progress: 100
totalLeads: 28
auditedLeads: 28
createdAt: 2026-05-15 23:30:00
completedAt: 2026-05-15 23:45:00
```

---

#### 3. **`leads`** — Leads/negocios encontrados
Cada fila es un negocio local encontrado durante la búsqueda de una campaña.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | INT | ID único (clave primaria) |
| `campaignId` | INT | ID de la campaña (FK → campaigns.id) |
| `businessName` | VARCHAR(255) | Nombre del negocio |
| `sector` | VARCHAR(255) | Sector/rubro |
| `zone` | VARCHAR(255) | Zona/barrio |
| `address` | TEXT | Dirección completa |
| `phone` | VARCHAR(64) | Teléfono de contacto |
| `website` | VARCHAR(500) | URL del sitio web |
| `email` | VARCHAR(320) | Email de contacto |
| `rating` | DECIMAL(3,1) | Rating en Google (ej: 4.5) |
| `reviewCount` | INT | Número de reseñas |
| `hasWebsite` | BOOLEAN | ¿Tiene sitio web? |
| `websiteStatus` | VARCHAR(64) | Estado: "ok", "slow", "broken", "none" |
| `facebook` | VARCHAR(500) | URL de Facebook |
| `instagram` | VARCHAR(500) | URL de Instagram |
| `linkedin` | VARCHAR(500) | URL de LinkedIn |
| `twitter` | VARCHAR(500) | URL de Twitter |
| `googlePlaceId` | VARCHAR(255) | ID de Google Places |
| `createdAt` | TIMESTAMP | Fecha de creación |

**Ejemplo:**
```
id: 1
campaignId: 42
businessName: "Clínica Dental Sonrisa Perfecta"
sector: "clínicas dentales"
zone: "Carabanchel"
address: "Calle Mayor 45, 28005 Madrid"
phone: "+34 91 234 5678"
website: "https://www.clinicasonrisa.es"
email: "info@clinicasonrisa.es"
rating: 4.7
reviewCount: 156
hasWebsite: true
websiteStatus: "ok"
facebook: "https://facebook.com/clinicasonrisa"
instagram: "https://instagram.com/clinicasonrisa"
```

---

#### 4. **`audit_results`** — Resultados de auditoría y scoring
Cada fila contiene el análisis y scoring de un lead específico.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | INT | ID único (clave primaria) |
| `leadId` | INT | ID del lead (FK → leads.id, UNIQUE) |
| `campaignId` | INT | ID de la campaña (FK → campaigns.id) |
| **`scoreSeo`** | INT | Score SEO (0-100) |
| **`scoreSpeed`** | INT | Score velocidad web (0-100) |
| **`scoreContact`** | INT | Score contacto/accesibilidad (0-100) |
| **`scoreSocial`** | INT | Score redes sociales (0-100) |
| **`scoreTotal`** | INT | Promedio de los 4 scores (0-100) |
| `priority` | ENUM | "high", "medium", "low" |
| `temperature` | ENUM | "hot", "warm", "cold" |
| `detectedIssues` | JSON | Array de problemas encontrados |
| `recommendedAction` | TEXT | Acción recomendada |
| `pagespeedScore` | INT | Score de PageSpeed Insights |
| `loadTimeMs` | INT | Tiempo de carga en ms |
| `hasMeta` | BOOLEAN | ¿Tiene metadescripción? |
| `hasH1` | BOOLEAN | ¿Tiene H1 visible? |
| `hasSitemap` | BOOLEAN | ¿Tiene sitemap XML? |
| `hasHttps` | BOOLEAN | ¿Usa HTTPS? |
| `isMobileFriendly` | BOOLEAN | ¿Es responsive? |
| `emailsFound` | JSON | Array de emails encontrados |
| `phonesFound` | JSON | Array de teléfonos encontrados |
| `createdAt` | TIMESTAMP | Fecha de creación |

**Ejemplo:**
```
id: 1
leadId: 1
campaignId: 42
scoreSeo: 72
scoreSpeed: 65
scoreContact: 80
scoreSocial: 45
scoreTotal: 65
priority: "low"
temperature: "cold"
detectedIssues: ["Sin presencia en redes sociales", "Velocidad de carga lenta"]
recommendedAction: "Implementar estrategia de redes sociales"
pagespeedScore: 68
loadTimeMs: 2100
hasMeta: true
hasH1: true
hasSitemap: false
hasHttps: true
isMobileFriendly: true
emailsFound: ["info@clinicasonrisa.es", "contacto@clinicasonrisa.es"]
```

---

#### 5. **`user_settings`** — Configuración de usuario
Almacena las preferencias y API keys de cada usuario.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | INT | ID único (clave primaria) |
| `userId` | INT | ID del usuario (FK → users.id, UNIQUE) |
| `googlePlacesApiKey` | VARCHAR(500) | API key de Google Places |
| `pagespeedApiKey` | VARCHAR(500) | API key de PageSpeed |
| `hunterApiKey` | VARCHAR(500) | API key de Hunter.io |
| `defaultMinRating` | DECIMAL(3,1) | Rating mínimo por defecto |
| `defaultMinReviews` | INT | Reseñas mínimas por defecto |
| `defaultMaxPages` | INT | Máximo de páginas por defecto |
| `defaultMaxAuditLeads` | INT | Máximo de leads a auditar por defecto |
| `defaultEnableWebsiteAudit` | BOOLEAN | ¿Auditar webs por defecto? |
| `defaultEnableEmailExtraction` | BOOLEAN | ¿Extraer emails por defecto? |
| `defaultEnableSocialExtraction` | BOOLEAN | ¿Extraer redes por defecto? |
| `ownerName` | VARCHAR(255) | Nombre del propietario/agencia |
| `ownerEmail` | VARCHAR(320) | Email de contacto |
| `agencyName` | VARCHAR(255) | Nombre de la agencia |
| `createdAt` | TIMESTAMP | Fecha de creación |
| `updatedAt` | TIMESTAMP | Última actualización |

**Ejemplo:**
```
id: 1
userId: 1
googlePlacesApiKey: "AIzaSyD..." (enmascarado en la UI)
defaultMinRating: 4.0
defaultMinReviews: 75
defaultMaxAuditLeads: 100
ownerName: "Juan García"
ownerEmail: "juan@agencia.com"
agencyName: "Agencia Digital García"
```

---

## Flujo de datos

### 1. **Creación de campaña**
```
Usuario → Form → tRPC campaigns.create 
  → INSERT campaigns (userId, name, businessType, etc.)
  → Retorna campaign.id
```

### 2. **Ejecución de campaña**
```
Usuario → Botón "Iniciar" → tRPC campaigns.start
  → campaignEngine.runCampaignEngine() (async, fire-and-forget)
    → INSERT leads (businessName, phone, website, etc.)
    → UPDATE campaigns (progress, currentStep, logs)
    → INSERT audit_results (scoreSeo, scoreSpeed, etc.)
  → Finaliza y UPDATE campaigns (status: "completed")
```

### 3. **Consulta de progreso**
```
Usuario (polling cada 1.5s) → tRPC campaigns.progress
  → SELECT campaigns WHERE id = ? AND userId = ?
  → Retorna { status, progress, currentStep, logs, etc. }
```

### 4. **Ver resultados**
```
Usuario → tRPC audit.fullResults
  → SELECT leads WHERE campaignId = ?
  → SELECT audit_results WHERE campaignId = ?
  → JOIN por leadId
  → Retorna array de leads con audit anidado
```

### 5. **Exportar a Excel/CSV**
```
Usuario → Botón "Descargar Excel" → tRPC export.excel
  → SELECT leads + audit_results
  → generateExcelBuffer() → Buffer
  → Retorna base64 + filename
  → Cliente descarga archivo
```

---

## Acceso a los datos

### Desde el panel de gestión Manus
1. Ve a **Management UI** → **Database**
2. Verás todas las tablas y podrás hacer CRUD directo
3. Puedes ver, editar, eliminar registros manualmente

### Desde el código (backend)
Los helpers en `server/db.ts` manejan todo:

```typescript
// Listar campañas de un usuario
const campaigns = await getCampaignsByUser(userId);

// Obtener una campaña específica
const campaign = await getCampaignById(campaignId, userId);

// Listar leads de una campaña
const leads = await getLeadsByCampaign(campaignId);

// Obtener resultados de auditoría
const audits = await getAuditResultsByCampaign(campaignId);

// Guardar ajustes
await upsertUserSettings({ userId, googlePlacesApiKey, ... });
```

### Desde el frontend (tRPC)
```typescript
// Listar campañas
const { data: campaigns } = trpc.campaigns.list.useQuery();

// Obtener progreso
const { data: progress } = trpc.campaigns.progress.useQuery({ id: 42 });

// Obtener resultados con scoring
const { data: results } = trpc.audit.fullResults.useQuery({ campaignId: 42 });

// Exportar
const { data: excel } = await trpc.export.excel.mutate({ campaignId: 42 });
```

---

## Retención y privacidad

- **Datos de usuario**: Se guardan indefinidamente (nombre, email, role)
- **Datos de campaña**: Se guardan indefinidamente (puedes eliminar manualmente)
- **API keys**: Se almacenan enmascaradas en la UI (solo últimos 4 caracteres visibles)
- **Logs**: Se guardan como JSON en la columna `logs` de campaigns

---

## Conexión a la base de datos

Si necesitas conectarte directamente (para análisis, backups, etc.):

1. Ve a **Management UI** → **Database**
2. En la esquina inferior izquierda, verás los detalles de conexión:
   - **Host**
   - **Port**
   - **User**
   - **Password**
   - **Database name**

3. Usa cualquier cliente MySQL:
```bash
mysql -h <host> -u <user> -p<password> -D <database>
```

---

## Próximas mejoras

- **Backups automáticos**: Configurar snapshots periódicos
- **Análisis de datos**: Crear dashboards con métricas agregadas (leads por sector, scoring promedio, etc.)
- **Auditoría de cambios**: Registrar quién modificó qué y cuándo
- **Archivado de campañas**: Mover campañas antiguas a un estado "archived" para no saturar la UI

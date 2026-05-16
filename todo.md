# Lead Auditor Pro — TODO

## Base de datos y esquema
- [x] Tabla `campaigns` con todos los campos del modelo de datos
- [x] Tabla `leads` con datos de negocio y contacto
- [x] Tabla `audit_results` con scoring SEO, velocidad, contacto, redes sociales
- [x] Tabla `user_settings` con API keys y preferencias de auditoría
- [x] Migración SQL aplicada correctamente

## Backend tRPC
- [x] Router `campaigns`: crear, listar, obtener por ID, actualizar estado, eliminar
- [x] Router `campaigns.progress`: consultar progreso y logs en tiempo real
- [x] Router `leads`: listar por campaña, obtener detalle
- [x] Router `auditResults`: obtener resultados con scoring por campaña
- [x] Router `settings`: obtener y guardar configuración de usuario (API keys, preferencias)
- [x] Endpoint de exportación Excel (xlsx) con todos los datos y scoring
- [x] Endpoint de exportación CSV con todos los datos y scoring
- [x] Simulación de proceso de campaña (etapas: búsqueda, auditoría, extracción, scoring)
- [x] Generación de leads de demostración para campañas

## Landing page
- [x] Sección Hero con título, subtítulo y CTAs (Crear campaña / Ver demo)
- [x] Bloque de características (6 beneficios principales)
- [x] Sección "Cómo funciona" (3 pasos)
- [x] Tabla de precios (Starter, Pro, Agency)
- [x] Sección de casos de uso
- [x] FAQ
- [x] CTA final con registro/login
- [x] Navbar con logo, links y botón de acceso

## Dashboard (área privada)
- [x] Layout con sidebar y header usando DashboardLayout
- [x] Cards de métricas: campañas, leads totales, leads auditados, prioridad alta, con email, sin web
- [x] Tabla de campañas recientes con estado, fecha, leads y acciones
- [x] Accesos rápidos a nueva campaña y resultados

## Nueva campaña
- [x] Formulario multi-bloque: datos básicos, zonas, sectores, filtros de calidad
- [x] Bloque de API keys en el formulario
- [x] Validación de campos obligatorios
- [x] Modal de confirmación antes de lanzar
- [x] Redirección a vista de progreso al iniciar

## Vista de progreso
- [x] Barra de progreso animada
- [x] Etapas diferenciadas: búsqueda, auditoría web, extracción de contactos, scoring
- [x] Log de actividad en tiempo real (polling)
- [x] Mensajes descriptivos por etapa
- [x] Redirección automática a resultados al finalizar

## Resultados
- [x] Tabla de leads con columnas: nombre, sector, zona, rating, web, email, score SEO, score velocidad, score contacto, score redes, score total, prioridad, temperatura
- [x] Filtros interactivos (sector, prioridad, temperatura, con/sin web)
- [x] Badges de prioridad (Alta/Media/Baja) y temperatura (Caliente/Templado/Frío)
- [x] Top 20 oportunidades destacadas
- [x] Botones de exportación Excel y CSV

## Ajustes
- [x] Sección API Keys (Google Places, PageSpeed, Hunter)
- [x] Preferencias de auditoría por defecto
- [x] Gestión de perfil de usuario
- [x] Mensajes de advertencia legal

## Autenticación y rutas
- [x] Manus OAuth integrado en todas las rutas privadas
- [x] Redirección al login si no autenticado
- [x] Rutas: /, /dashboard, /campaigns/new, /campaigns/:id/progress, /campaigns/:id/results, /settings

## Diseño y UX
- [x] Paleta de colores: azul/índigo profesional con acentos violeta
- [x] Tipografía Inter con jerarquía clara
- [x] Componentes con sombras suaves y bordes redondeados
- [x] Diseño responsive (desktop y tablet prioritario)
- [x] Animaciones sutiles con framer-motion
- [x] Toast notifications para acciones
- [x] Estados de carga y vacío en todas las vistas

## Tests
- [x] Test de router campaigns (crear, listar, progreso)
- [x] Test de router audit.fullResults (scoring por columnas)
- [x] Test de router settings (obtener)
- [x] Test de exportación Excel y CSV
- [x] Test de auth.logout


## Integración Python (Nueva)
- [x] Crear server/pythonRunner.ts con spawn, detección de SO y redacción de API keys
- [x] Modificar server/campaignEngine.ts para leer API keys desde user_settings
- [x] Crear estructura python_pipeline/ con carpetas, requirements.txt y README
- [x] Implementar tests para pythonRunner con redacción de secretos
- [x] Mapear hitos de progreso correctos (5%, 25%, 55%, 85%, 90%, 100%)
- [x] Implementar importResultsFromPython() para importar output/final_leads.json

# Lead Auditor Pro — Setup Guide

## Prerequisites

- Node.js 22+ (for backend/frontend)
- Python 3.8+ (for Python pipeline)
- npm or pnpm (for Node package management)

## Quick Setup

### 1. Install Node dependencies

```bash
pnpm install
```

### 2. Setup Python environment

The Python pipeline requires a virtual environment with dependencies installed.

**Option A: Automatic (Recommended)**

```bash
pnpm setup:python
```

This command will:
- Create `python_pipeline/.venv/`
- Install Python dependencies from `python_pipeline/requirements.txt`

**Option B: Manual**

```bash
cd python_pipeline
python3 -m venv .venv
.venv/bin/python -m pip install --upgrade pip
.venv/bin/python -m pip install -r requirements.txt
cd ..
```

### 3. Verify Python setup

```bash
ls -la python_pipeline/.venv/bin/python
```

You should see the Python executable symlink.

### 4. Setup database (if needed)

```bash
pnpm db:push
```

### 5. Start development server

```bash
pnpm dev
```

The app will be available at `http://localhost:3000`

## Full Setup (All-in-One)

```bash
pnpm setup:all
```

This runs `pnpm install && pnpm setup:python`

## Docker Setup

### Build Docker image

```bash
docker build -t lead-auditor-pro:latest .
```

The Dockerfile will:
1. Install Node.js and Python 3
2. Build the frontend and backend
3. Setup Python virtual environment
4. Install Python dependencies

### Run Docker container

```bash
docker run -p 3000:3000 \
  -e DATABASE_URL="your-database-url" \
  -e JWT_SECRET="your-jwt-secret" \
  lead-auditor-pro:latest
```

### Docker Compose (Optional)

Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: ${DATABASE_URL}
      JWT_SECRET: ${JWT_SECRET}
      VITE_APP_ID: ${VITE_APP_ID}
      OAUTH_SERVER_URL: ${OAUTH_SERVER_URL}
    volumes:
      - ./python_pipeline/output:/app/python_pipeline/output
```

Then run:

```bash
docker-compose up
```

## Troubleshooting

### Python virtual environment not found

**Error:** `spawn /path/to/python_pipeline/.venv/bin/python ENOENT`

**Solution:**

```bash
cd python_pipeline
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
cd ..
```

Then restart the backend server.

### Python 3 not found

**Error:** `Python is not available on this system`

**Solution:** 

**Local development:**
- **macOS:** `brew install python3`
- **Ubuntu/Debian:** `sudo apt-get install python3 python3-venv`
- **Windows:** Download from https://www.python.org/downloads/

**Production (Docker):**
The Dockerfile automatically installs Python 3. Just build and run the Docker image.

### Module not found (pandas, requests, etc.)

**Error:** `ModuleNotFoundError: No module named 'pandas'`

**Solution:** Reinstall Python dependencies:

```bash
cd python_pipeline
.venv/bin/python -m pip install -r requirements.txt
cd ..
```

## Environment Variables

The following environment variables are required for the Python pipeline:

| Variable | Default | Description |
|----------|---------|-------------|
| `GOOGLE_PLACES_API_KEY` | (required) | Google Places API key for business search |
| `CITY` | Madrid | City to search in |
| `ZONES` | Centro | Comma-separated zones |
| `SECTORS` | restaurantes | Comma-separated business sectors |
| `MAX_PAGES` | 1 | Max pages to fetch (1-10) |
| `MIN_RATING` | 4.0 | Minimum rating filter |
| `MIN_REVIEWS` | 75 | Minimum reviews filter |

Set these in the app's Settings page or as environment variables.

## Production Deployment

### Option 1: Traditional Server (with Python 3 installed)

1. Install Node.js and Python 3 on your server
2. Clone the repository
3. Run setup:

```bash
pnpm install
pnpm setup:python
pnpm build
pnpm start
```

### Option 2: Docker (Recommended)

1. Build the Docker image:

```bash
docker build -t lead-auditor-pro:latest .
```

2. Push to your registry (Docker Hub, ECR, etc.)
3. Deploy using your container orchestration platform (Docker Compose, Kubernetes, Cloud Run, etc.)

### Option 3: Manus Platform

When deploying to Manus:

1. Ensure the Dockerfile is in the project root
2. The platform will automatically:
   - Build the Docker image
   - Install Python 3 and dependencies
   - Setup the Python virtual environment
   - Deploy the container

## Testing

### Run unit tests

```bash
pnpm test
```

### Run end-to-end campaign test

```bash
npx tsx server/test-e2e-campaign.ts
```

This will:
1. Create a test campaign
2. Execute the full Python pipeline
3. Import results to database
4. Verify data integrity

## Development

### Type checking

```bash
pnpm check
```

### Format code

```bash
pnpm format
```

### Database migrations

```bash
pnpm db:push
```

## Project Structure

```
lead-auditor-pro/
├── client/              # React frontend
├── server/              # Express backend + tRPC
├── python_pipeline/     # Python scripts for campaign execution
│   ├── .venv/          # Virtual environment (auto-created)
│   ├── main.py         # Business search (Google Places)
│   ├── audit_webs.py   # Website audit
│   ├── enhance_leads.py # Scoring and lead enhancement
│   └── requirements.txt # Python dependencies
├── drizzle/            # Database schema
├── Dockerfile          # Docker build configuration
├── .dockerignore       # Docker build exclusions
├── package.json        # Node dependencies and scripts
└── README.md           # Project documentation
```

## Next Steps

1. **Get Google Places API key** — Visit https://cloud.google.com/maps/billing-and-pricing/pricing
2. **Configure in app** — Go to Settings and enter your API key
3. **Create a campaign** — Test the full pipeline with real data
4. **Monitor logs** — Check the campaign progress page for detailed logs
5. **Deploy to production** — Use Docker for consistent environments

## Support

For issues or questions, refer to:
- `python_pipeline/README.md` — Python pipeline documentation
- `python_pipeline/TESTING.md` — Testing guide with mock data
- `python_pipeline/OUTPUT_CONTRACT.md` — Data format specification
- `Dockerfile` — Container build configuration

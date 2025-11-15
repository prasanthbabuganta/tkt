# GCP Deployment Files - Summary

All files created for deploying TKT Backend to Google Cloud Platform (India region).

## Created Files Overview

### Docker Configuration Files

#### 1. `Dockerfile`
Multi-stage Dockerfile optimized for production deployment:
- **Stage 1:** Maven build with dependency caching
- **Stage 2:** Minimal JRE runtime (Alpine-based)
- **Features:**
  - Non-root user for security
  - India timezone (Asia/Kolkata) configured
  - Health check enabled
  - JVM optimized with G1GC
  - Size: ~200MB final image

**Build:**
```bash
docker build -t tkt-backend .
```

#### 2. `.dockerignore`
Excludes unnecessary files from Docker build context:
- Maven build artifacts (except JAR)
- IDE files (.idea, .vscode)
- Documentation files
- Git files
- Test files

**Result:** Faster builds, smaller context size

#### 3. `docker-compose.yml`
Complete local development stack:
- **PostgreSQL 15** with IST timezone
- **Spring Boot Application** with hot reload
- **pgAdmin** (optional) for database management
- **Features:**
  - Health checks for all services
  - Persistent volumes for data
  - Custom network
  - Environment variables for configuration

**Usage:**
```bash
# Start all services
docker-compose up -d

# With pgAdmin
docker-compose --profile with-pgadmin up -d
```

---

### Application Configuration Files

#### 4. `application.properties` (Updated)
Base configuration with environment variable support:
- All sensitive values use `${ENV_VAR:default}` syntax
- Database connection pooling (HikariCP)
- Actuator endpoints enabled
- Structured logging
- IST timezone configured
- Graceful shutdown support

**Key Updates:**
- Environment variable placeholders
- Improved connection pooling
- Production-ready defaults

#### 5. `application-dev.properties`
Development environment configuration:
- Verbose logging (DEBUG level)
- SQL logging enabled
- Show full stack traces
- Smaller connection pool
- Local PostgreSQL defaults

**Activate:**
```bash
SPRING_PROFILES_ACTIVE=dev
```

#### 6. `application-staging.properties`
Staging environment configuration (GCP):
- Moderate logging (INFO/DEBUG)
- Cloud SQL Socket Factory enabled
- No SQL logging
- VPC connector support
- Environment variable secrets
- Graceful shutdown for Cloud Run

**Activate:**
```bash
SPRING_PROFILES_ACTIVE=staging
```

#### 7. `application-prod.properties`
Production environment configuration (GCP):
- Minimal logging (INFO/WARN)
- Schema validation only (`ddl-auto=validate`)
- No stack traces exposed
- Optimized connection pool
- Cloud SQL with private IP
- Compression enabled
- Liveness/readiness probes

**Activate:**
```bash
SPRING_PROFILES_ACTIVE=prod
```

---

### Dependencies

#### 8. `pom.xml` (Updated)
Added Google Cloud SQL PostgreSQL Socket Factory:
```xml
<dependency>
    <groupId>com.google.cloud.sql</groupId>
    <artifactId>postgres-socket-factory</artifactId>
    <version>1.15.0</version>
</dependency>
```

**Purpose:** Enables secure connection to Cloud SQL using Unix sockets

---

### Deployment Scripts

#### 9. `deploy-to-gcp-india.sh`
Automated deployment script for GCP (India region):
- **Features:**
  - Color-coded output
  - Error handling
  - Health check after deployment
  - Confirmation prompt
  - Environment selection (dev/staging/prod)
  - Docker build and push
  - Cloud Run deployment
  - Service URL retrieval

**Usage:**
```bash
# Production
./deploy-to-gcp-india.sh prod

# Staging
./deploy-to-gcp-india.sh staging

# With environment variables
export GCP_PROJECT_ID="tkt-backend-prod"
export CLOUD_SQL_INSTANCE="tkt-backend-prod:asia-south1:tkt-db-prod"
./deploy-to-gcp-india.sh prod
```

**What it does:**
1. Validates prerequisites
2. Sets GCP project and region
3. Builds Docker image
4. Pushes to Artifact Registry (Mumbai)
5. Deploys to Cloud Run (Mumbai)
6. Configures secrets from Secret Manager
7. Sets up VPC connector
8. Tests health endpoint
9. Displays service URL

---

### CI/CD Configuration

#### 10. `cloudbuild.yaml`
Google Cloud Build configuration for automated CI/CD:
- **Steps:**
  1. Run unit tests
  2. Build JAR with Maven
  3. Build Docker image
  4. Push to Artifact Registry
  5. Deploy to Cloud Run
  6. Verify deployment

- **Configuration:**
  - Machine type: E2_HIGHCPU_8
  - Region: asia-south1
  - Timeout: 20 minutes
  - Artifacts stored in Cloud Storage
  - Deployment verification included

**Trigger:**
```bash
gcloud builds triggers create github \
  --name="tkt-backend-prod" \
  --repo-name=tkt \
  --branch-pattern="^main$" \
  --build-config=cloudbuild.yaml \
  --region=asia-south1
```

---

### Environment & Secrets

#### 11. `.env.gcp.example`
Template for GCP environment variables:
- GCP project configuration
- Cloud SQL connection details
- JWT secrets
- Encryption keys
- Admin credentials
- VPC connector settings
- Database pool configuration

**Includes:**
- Security best practices
- Key generation commands
- Usage instructions

**Setup:**
```bash
cp .env.gcp.example .env.gcp
# Edit .env.gcp with actual values
# DO NOT commit .env.gcp to git
```

---

### Documentation

#### 12. `DEPLOYMENT_GUIDE.md`
Comprehensive deployment guide covering:
1. Prerequisites and tool installation
2. Local testing with Docker
3. GCP project setup (step-by-step)
4. Database creation and configuration
5. Secrets management
6. Manual deployment steps
7. CI/CD pipeline setup
8. Monitoring and logging
9. Troubleshooting common issues
10. Cost optimization tips
11. Security checklist

**Sections:**
- ✅ Prerequisites
- ✅ Local Testing
- ✅ GCP Setup
- ✅ Database Setup
- ✅ Secrets Management
- ✅ Deployment
- ✅ CI/CD
- ✅ Monitoring
- ✅ Troubleshooting
- ✅ Cost Optimization
- ✅ Security

#### 13. `DOCKER_QUICK_START.md`
Quick reference for Docker commands:
- Starting/stopping services
- Viewing logs
- Database operations
- Troubleshooting
- Development workflow
- Clean up commands
- Useful aliases

**Perfect for:** Developers new to Docker or the project

#### 14. `GCP_DEPLOYMENT_FILES.md` (This file)
Summary of all deployment-related files with usage instructions.

---

## File Structure

```
tkt-backend/
├── Dockerfile                      # Multi-stage Docker build
├── .dockerignore                   # Docker build context exclusions
├── docker-compose.yml              # Local development stack
├── deploy-to-gcp-india.sh         # Deployment script (executable)
├── cloudbuild.yaml                 # CI/CD configuration
├── .env.gcp.example                # Environment variables template
├── DEPLOYMENT_GUIDE.md             # Complete deployment guide
├── DOCKER_QUICK_START.md           # Docker quick reference
├── GCP_DEPLOYMENT_FILES.md         # This file
├── pom.xml                         # Updated with GCP dependencies
└── src/main/resources/
    ├── application.properties      # Base config (updated)
    ├── application-dev.properties  # Development config
    ├── application-staging.properties # Staging config
    └── application-prod.properties # Production config
```

---

## Deployment Workflows

### Local Development

```bash
# 1. Start services
docker-compose up -d

# 2. View logs
docker-compose logs -f app

# 3. Test API
curl http://localhost:8080/api/actuator/health

# 4. Make changes and rebuild
docker-compose up -d --build app

# 5. Stop services
docker-compose down
```

### GCP Deployment (Manual)

```bash
# 1. Set environment variables
export GCP_PROJECT_ID="tkt-backend-prod"
export CLOUD_SQL_INSTANCE="tkt-backend-prod:asia-south1:tkt-db-prod"

# 2. Run deployment script
./deploy-to-gcp-india.sh prod

# 3. Verify deployment
curl https://YOUR_SERVICE_URL/api/actuator/health

# 4. View logs
gcloud run services logs tail tkt-backend --region=asia-south1
```

### GCP Deployment (CI/CD)

```bash
# 1. Push to main branch
git add .
git commit -m "Update application"
git push origin main

# 2. Cloud Build automatically triggers
# 3. Check build status
gcloud builds list --limit=1 --region=asia-south1

# 4. Monitor deployment
gcloud builds log --region=asia-south1 BUILD_ID
```

---

## Environment Variables Required

### For Local Development (docker-compose)
- ✅ Pre-configured in docker-compose.yml
- No additional setup needed

### For GCP Deployment (Cloud Run)
Store these in GCP Secret Manager:

1. **JWT_SECRET** - JWT signing key (256-bit)
2. **ENCRYPTION_SECRET_KEY** - AES-256 encryption key (32 bytes)
3. **DB_PASSWORD** - Database password
4. **ADMIN_SEED_MOBILE** - Admin mobile number
5. **ADMIN_SEED_PIN** - Admin PIN

Set these as environment variables:

1. **DB_URL** - Cloud SQL connection string
2. **DB_USERNAME** - Database username
3. **SPRING_PROFILES_ACTIVE** - Active profile (prod/staging/dev)
4. **TZ** - Timezone (Asia/Kolkata)

---

## Security Features Implemented

### Docker Security
- ✅ Non-root user (appuser:1001)
- ✅ Minimal base image (Alpine)
- ✅ Multi-stage build (no build tools in final image)
- ✅ .dockerignore to exclude sensitive files

### Application Security
- ✅ All secrets from environment variables
- ✅ No hardcoded credentials
- ✅ Graceful shutdown support
- ✅ Health checks enabled
- ✅ Compression enabled
- ✅ Error details hidden in production

### GCP Security
- ✅ Secrets in Secret Manager
- ✅ Private Cloud SQL (no public IP)
- ✅ VPC connector for private networking
- ✅ IAM-based access control
- ✅ Audit logging enabled
- ✅ Data residency in India

---

## Region Configuration

All resources are configured for **asia-south1 (Mumbai, India)**:

| Resource | Location |
|----------|----------|
| Cloud Run | asia-south1 |
| Cloud SQL | asia-south1 |
| Artifact Registry | asia-south1 |
| Cloud Build | asia-south1 |
| Secret Manager | asia-south1 |
| VPC Network | asia-south1 |
| Backups | asia-south1 |
| Logs | asia-south1 |

**Benefits:**
- ✅ Low latency for Indian users (5-40ms)
- ✅ Data residency compliance
- ✅ Reduced bandwidth costs
- ✅ Faster deployments

---

## Next Steps

### 1. Local Testing
```bash
cd tkt-backend
docker-compose up -d
# Test the application
docker-compose down
```

### 2. GCP Setup
Follow `DEPLOYMENT_GUIDE.md` step-by-step:
1. Create GCP project
2. Enable APIs
3. Create VPC network
4. Set up Cloud SQL
5. Configure secrets
6. Deploy application

### 3. CI/CD Setup
1. Connect GitHub repository
2. Create Cloud Build trigger
3. Test automated deployment

### 4. Monitoring
1. Set up alerts
2. Configure uptime checks
3. Review logs regularly

---

## Support & Resources

### Documentation
- `DEPLOYMENT_GUIDE.md` - Complete setup guide
- `DOCKER_QUICK_START.md` - Docker commands
- `.env.gcp.example` - Configuration template
- `README.md` - Application overview
- `API_GUIDE.md` - API documentation

### GCP Resources
- Cloud Run: https://console.cloud.google.com/run
- Cloud SQL: https://console.cloud.google.com/sql
- Secret Manager: https://console.cloud.google.com/security/secret-manager
- Artifact Registry: https://console.cloud.google.com/artifacts
- Cloud Build: https://console.cloud.google.com/cloud-build

### Commands Cheat Sheet
```bash
# Local
docker-compose up -d
docker-compose logs -f app
docker-compose down

# GCP Deploy
./deploy-to-gcp-india.sh prod

# GCP Logs
gcloud run services logs tail tkt-backend --region=asia-south1

# GCP Status
gcloud run services describe tkt-backend --region=asia-south1
```

---

**Created:** 2025-11-14
**Region:** asia-south1 (Mumbai, India)
**Total Files:** 14 files created/updated
**Ready for:** Development, Staging, Production deployment

# TKT Backend - GCP Deployment Guide (India Region)

Complete guide for deploying TKT Backend to Google Cloud Platform in India (Mumbai region).

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Testing with Docker](#local-testing-with-docker)
3. [GCP Project Setup](#gcp-project-setup)
4. [Database Setup](#database-setup)
5. [Secrets Management](#secrets-management)
6. [Manual Deployment](#manual-deployment)
7. [CI/CD Setup](#cicd-setup)
8. [Monitoring & Logging](#monitoring--logging)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Tools

1. **Google Cloud SDK**
   ```bash
   # Install gcloud CLI
   curl https://sdk.cloud.google.com | bash
   exec -l $SHELL
   gcloud init
   ```

2. **Docker Desktop**
   - Download from: https://www.docker.com/products/docker-desktop
   - Ensure Docker is running

3. **Java 21** (for local development)
   ```bash
   # macOS
   brew install openjdk@21

   # Ubuntu
   sudo apt install openjdk-21-jdk
   ```

4. **Maven 3.9+** (optional - Maven Wrapper included)
   ```bash
   mvn --version
   ```

### GCP Account Setup

1. Create a GCP account at https://cloud.google.com
2. Enable billing for your project
3. Install and authenticate gcloud CLI:
   ```bash
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```

---

## Local Testing with Docker

### 1. Test with Docker Compose

```bash
# Start all services (PostgreSQL + Application + pgAdmin)
docker-compose up -d

# View logs
docker-compose logs -f app

# Test the API
curl http://localhost:8080/api/actuator/health

# Stop all services
docker-compose down

# Stop and remove volumes (clean database)
docker-compose down -v
```

### 2. Access Services

- **API:** http://localhost:8080/api
- **Health Check:** http://localhost:8080/api/actuator/health
- **pgAdmin:** http://localhost:5050 (admin@tkt.local / admin)

### 3. Test Login

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "mobileNumber": "9133733197",
    "pin": "777777"
  }'
```

---

## GCP Project Setup

### 1. Create GCP Project

```bash
# Set variables
export PROJECT_ID="tkt-backend-prod"
export REGION="asia-south1"

# Create project
gcloud projects create $PROJECT_ID --name="TKT Backend Production"

# Set as active project
gcloud config set project $PROJECT_ID
gcloud config set compute/region $REGION

# Link billing account (replace with your billing account ID)
gcloud billing projects link $PROJECT_ID \
  --billing-account=YOUR_BILLING_ACCOUNT_ID
```

### 2. Enable Required APIs

```bash
gcloud services enable \
  compute.googleapis.com \
  run.googleapis.com \
  sqladmin.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com \
  secretmanager.googleapis.com \
  vpcaccess.googleapis.com \
  logging.googleapis.com \
  monitoring.googleapis.com
```

### 3. Create VPC Network

```bash
# Create VPC
gcloud compute networks create tkt-vpc \
  --subnet-mode=custom \
  --bgp-routing-mode=regional

# Create subnet
gcloud compute networks subnets create tkt-subnet-mumbai \
  --network=tkt-vpc \
  --region=$REGION \
  --range=10.0.0.0/24

# Create VPC connector for Cloud Run
gcloud compute networks vpc-access connectors create tkt-connector \
  --network=tkt-vpc \
  --region=$REGION \
  --range=10.8.0.0/28
```

### 4. Create Artifact Registry

```bash
gcloud artifacts repositories create tkt-backend \
  --repository-format=docker \
  --location=$REGION \
  --description="TKT Backend Docker images"

# Configure Docker authentication
gcloud auth configure-docker ${REGION}-docker.pkg.dev
```

---

## Database Setup

### 1. Create Cloud SQL Instance

**Development/Staging:**
```bash
gcloud sql instances create tkt-db-staging \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=$REGION \
  --network=projects/$PROJECT_ID/global/networks/tkt-vpc \
  --no-assign-ip \
  --backup-start-time=03:00 \
  --backup-location=$REGION \
  --database-flags=timezone=Asia/Kolkata
```

**Production:**
```bash
gcloud sql instances create tkt-db-prod \
  --database-version=POSTGRES_15 \
  --tier=db-custom-2-7680 \
  --region=$REGION \
  --availability-type=REGIONAL \
  --network=projects/$PROJECT_ID/global/networks/tkt-vpc \
  --no-assign-ip \
  --backup-start-time=03:00 \
  --backup-location=$REGION \
  --enable-bin-log \
  --database-flags=timezone=Asia/Kolkata
```

### 2. Create Database and User

```bash
# Set root password
gcloud sql users set-password postgres \
  --instance=tkt-db-prod \
  --password=SECURE_ROOT_PASSWORD

# Create database
gcloud sql databases create tkt --instance=tkt-db-prod

# Create application user
gcloud sql users create tkt-app-user \
  --instance=tkt-db-prod \
  --password=SECURE_APP_PASSWORD
```

### 3. Grant Permissions

```bash
# Connect to Cloud SQL instance
gcloud sql connect tkt-db-prod --user=postgres

# In psql shell:
GRANT ALL PRIVILEGES ON DATABASE tkt TO "tkt-app-user";
\c tkt
GRANT ALL ON SCHEMA public TO "tkt-app-user";
\q
```

---

## Secrets Management

### 1. Generate Secure Keys

```bash
# JWT Secret (256-bit)
JWT_SECRET=$(openssl rand -base64 32)
echo "JWT_SECRET: $JWT_SECRET"

# Encryption Key (exactly 32 bytes)
ENCRYPTION_KEY=$(head -c 32 /dev/urandom | base64 | cut -c1-32)
echo "ENCRYPTION_KEY: $ENCRYPTION_KEY"

# Database Password
DB_PASSWORD=$(openssl rand -base64 24)
echo "DB_PASSWORD: $DB_PASSWORD"
```

### 2. Store Secrets in Secret Manager

```bash
# JWT Secret
echo -n "$JWT_SECRET" | gcloud secrets create jwt-secret \
  --data-file=- \
  --replication-policy=user-managed \
  --locations=$REGION

# Encryption Key
echo -n "$ENCRYPTION_KEY" | gcloud secrets create encryption-key \
  --data-file=- \
  --replication-policy=user-managed \
  --locations=$REGION

# Database Password
echo -n "$DB_PASSWORD" | gcloud secrets create db-password \
  --data-file=- \
  --replication-policy=user-managed \
  --locations=$REGION

# Admin Seed Mobile
echo -n "9876543210" | gcloud secrets create admin-seed-mobile \
  --data-file=- \
  --replication-policy=user-managed \
  --locations=$REGION

# Admin Seed PIN
echo -n "123456" | gcloud secrets create admin-seed-pin \
  --data-file=- \
  --replication-policy=user-managed \
  --locations=$REGION
```

### 3. Grant Access to Cloud Run

```bash
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")

for secret in jwt-secret encryption-key db-password admin-seed-mobile admin-seed-pin; do
  gcloud secrets add-iam-policy-binding $secret \
    --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"
done
```

---

## Manual Deployment

### Option 1: Using Deployment Script

```bash
# Make script executable
chmod +x deploy-to-gcp-india.sh

# Set environment variables
export GCP_PROJECT_ID="tkt-backend-prod"
export CLOUD_SQL_INSTANCE="tkt-backend-prod:asia-south1:tkt-db-prod"
export VPC_CONNECTOR="tkt-connector"

# Deploy to production
./deploy-to-gcp-india.sh prod

# Deploy to staging
./deploy-to-gcp-india.sh staging
```

### Option 2: Manual Steps

```bash
# 1. Build Docker image
IMAGE_TAG="asia-south1-docker.pkg.dev/$PROJECT_ID/tkt-backend/app:v1.0.0"
docker build -t $IMAGE_TAG .

# 2. Push to Artifact Registry
docker push $IMAGE_TAG

# 3. Deploy to Cloud Run
gcloud run deploy tkt-backend \
  --image=$IMAGE_TAG \
  --region=$REGION \
  --platform=managed \
  --allow-unauthenticated \
  --set-env-vars="SPRING_PROFILES_ACTIVE=prod,TZ=Asia/Kolkata" \
  --set-secrets="JWT_SECRET=jwt-secret:latest,ENCRYPTION_SECRET_KEY=encryption-key:latest,DB_PASSWORD=db-password:latest,ADMIN_SEED_MOBILE=admin-seed-mobile:latest,ADMIN_SEED_PIN=admin-seed-pin:latest" \
  --set-env-vars="DB_URL=jdbc:postgresql:///tkt?cloudSqlInstance=$PROJECT_ID:$REGION:tkt-db-prod&socketFactory=com.google.cloud.sql.postgres.SocketFactory,DB_USERNAME=tkt-app-user" \
  --vpc-connector=tkt-connector \
  --vpc-egress=private-ranges-only \
  --cpu=1 \
  --memory=512Mi \
  --min-instances=1 \
  --max-instances=10 \
  --timeout=300 \
  --concurrency=80
```

### 4. Verify Deployment

```bash
# Get service URL
SERVICE_URL=$(gcloud run services describe tkt-backend \
  --region=$REGION \
  --format='value(status.url)')

echo "Service URL: $SERVICE_URL"

# Test health endpoint
curl $SERVICE_URL/api/actuator/health

# Test login
curl -X POST $SERVICE_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"mobileNumber": "9876543210", "pin": "123456"}'
```

---

## CI/CD Setup

### 1. Connect GitHub Repository

```bash
# Install GitHub app
gcloud alpha builds connections create github tkt-github-connection \
  --region=$REGION

# Follow the prompts to authorize GitHub
```

### 2. Create Cloud Build Trigger

```bash
gcloud builds triggers create github \
  --name="tkt-backend-prod" \
  --repo-name=tkt \
  --repo-owner=YOUR_GITHUB_USERNAME \
  --branch-pattern="^main$" \
  --build-config=cloudbuild.yaml \
  --region=$REGION
```

### 3. Test Trigger

```bash
# Manual trigger
gcloud builds triggers run tkt-backend-prod --region=$REGION

# View build logs
gcloud builds log --region=$REGION $(gcloud builds list --limit=1 --format='value(id)')
```

---

## Monitoring & Logging

### 1. View Logs

```bash
# Stream logs
gcloud run services logs tail tkt-backend --region=$REGION

# View recent logs
gcloud run services logs read tkt-backend \
  --region=$REGION \
  --limit=100

# Filter by severity
gcloud run services logs read tkt-backend \
  --region=$REGION \
  --filter="severity>=ERROR"
```

### 2. Set Up Alerts

```bash
# Create notification channel
gcloud alpha monitoring channels create \
  --display-name="TKT Alerts Email" \
  --type=email \
  --channel-labels=email_address=alerts@yourdomain.com

# Create alert for high error rate
# (Use GCP Console for easier configuration)
```

### 3. Create Uptime Check

```bash
SERVICE_URL=$(gcloud run services describe tkt-backend \
  --region=$REGION \
  --format='value(status.url)')

gcloud monitoring uptime create tkt-backend-health \
  --resource-type=uptime-url \
  --host=${SERVICE_URL#https://} \
  --path=/api/actuator/health \
  --check-interval=60s
```

---

## Troubleshooting

### Common Issues

#### 1. Cloud SQL Connection Timeout

**Problem:** Application can't connect to Cloud SQL

**Solution:**
```bash
# Verify VPC connector exists
gcloud compute networks vpc-access connectors list --region=$REGION

# Check Cloud SQL instance is using same VPC
gcloud sql instances describe tkt-db-prod --format="value(ipAddresses[0].ipAddress)"

# Verify Cloud Run is using VPC connector
gcloud run services describe tkt-backend \
  --region=$REGION \
  --format="value(spec.template.spec.vpcAccess)"
```

#### 2. Secret Access Denied

**Problem:** Cloud Run can't access secrets

**Solution:**
```bash
# Grant permissions again
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")

gcloud secrets add-iam-policy-binding jwt-secret \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

#### 3. Image Pull Errors

**Problem:** Cloud Run can't pull Docker image

**Solution:**
```bash
# Verify image exists
gcloud artifacts docker images list \
  asia-south1-docker.pkg.dev/$PROJECT_ID/tkt-backend

# Grant Cloud Run access to Artifact Registry
gcloud artifacts repositories add-iam-policy-binding tkt-backend \
  --location=$REGION \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/artifactregistry.reader"
```

#### 4. Out of Memory

**Problem:** Application crashes with OOM

**Solution:**
```bash
# Increase memory
gcloud run services update tkt-backend \
  --region=$REGION \
  --memory=1Gi
```

### Debug Commands

```bash
# View service configuration
gcloud run services describe tkt-backend --region=$REGION

# View revision details
gcloud run revisions list --service=tkt-backend --region=$REGION

# Shell into Cloud SQL
gcloud sql connect tkt-db-prod --user=tkt-app-user --database=tkt

# View recent builds
gcloud builds list --limit=10 --region=$REGION
```

---

## Cost Optimization

1. **Use minimum instances wisely:**
   - Production: min=1 (no cold starts, ~₹1,200/month)
   - Staging: min=0 (cost savings, accepts cold starts)

2. **Right-size Cloud SQL:**
   - Start with db-f1-micro for dev/staging
   - Scale up based on metrics

3. **Enable committed use discounts:**
   - 1-year: 25% discount
   - 3-year: 52% discount

4. **Set budget alerts:**
   ```bash
   gcloud billing budgets create \
     --billing-account=BILLING_ACCOUNT_ID \
     --display-name="TKT Monthly Budget" \
     --budget-amount=8000INR \
     --threshold-rule=percent=90
   ```

---

## Security Checklist

- [ ] All secrets stored in Secret Manager
- [ ] No hardcoded credentials in code
- [ ] Cloud SQL uses private IP only
- [ ] VPC egress set to private-ranges-only
- [ ] CORS configured for specific domains
- [ ] Rate limiting implemented
- [ ] Regular security updates
- [ ] Audit logging enabled
- [ ] IAM follows principle of least privilege
- [ ] Admin credentials changed from defaults

---

## Support

For issues or questions:
- Check Cloud Run logs: `gcloud run services logs tail tkt-backend --region=asia-south1`
- Review application logs in Cloud Logging
- Test locally with Docker Compose first
- Verify all environment variables are set correctly

---

**Last Updated:** 2025-11-14
**Region:** asia-south1 (Mumbai, India)
**Maintained by:** TKT Backend Team

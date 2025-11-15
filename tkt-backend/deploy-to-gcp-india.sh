#!/bin/bash

# ================================================================
# TKT Backend - GCP Deployment Script (India Region)
# Region: asia-south1 (Mumbai, India)
# ================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="${GCP_PROJECT_ID:-tkt-backend-prod}"
REGION="asia-south1"
SERVICE_NAME="tkt-backend"
REPOSITORY="tkt-backend"
IMAGE_NAME="app"
CLOUD_SQL_INSTANCE="${CLOUD_SQL_INSTANCE:-$PROJECT_ID:$REGION:tkt-db-prod}"
VPC_CONNECTOR="${VPC_CONNECTOR:-tkt-connector}"

# Environment (prod, staging, or dev)
ENVIRONMENT="${1:-prod}"

# Service account (optional)
SERVICE_ACCOUNT="${SERVICE_ACCOUNT:-}"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}TKT Backend - GCP Deployment (India)${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "Project ID: ${GREEN}$PROJECT_ID${NC}"
echo -e "Region: ${GREEN}$REGION${NC}"
echo -e "Environment: ${GREEN}$ENVIRONMENT${NC}"
echo -e "Service: ${GREEN}$SERVICE_NAME${NC}"
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}Error: gcloud CLI is not installed${NC}"
    echo "Please install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed${NC}"
    echo "Please install it from: https://docs.docker.com/get-docker/"
    exit 1
fi

# Confirm deployment
echo -e "${YELLOW}You are about to deploy to ${ENVIRONMENT} environment in ${REGION}${NC}"
read -p "Do you want to continue? (yes/no): " -r
echo
if [[ ! $REPLY =~ ^[Yy]es$ ]]; then
    echo -e "${RED}Deployment cancelled${NC}"
    exit 1
fi

# Set project
echo -e "${BLUE}[1/7] Setting GCP project...${NC}"
gcloud config set project "$PROJECT_ID"

# Set region
echo -e "${BLUE}[2/7] Setting region to $REGION...${NC}"
gcloud config set run/region "$REGION"

# Build Docker image
echo -e "${BLUE}[3/7] Building Docker image...${NC}"
IMAGE_TAG="$REGION-docker.pkg.dev/$PROJECT_ID/$REPOSITORY/$IMAGE_NAME:$(date +%Y%m%d-%H%M%S)"
IMAGE_LATEST="$REGION-docker.pkg.dev/$PROJECT_ID/$REPOSITORY/$IMAGE_NAME:latest"

docker build -t "$IMAGE_TAG" -t "$IMAGE_LATEST" .

if [ $? -ne 0 ]; then
    echo -e "${RED}Docker build failed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker image built successfully${NC}"

# Configure Docker authentication
echo -e "${BLUE}[4/7] Configuring Docker authentication...${NC}"
gcloud auth configure-docker "$REGION-docker.pkg.dev" --quiet

# Push Docker image
echo -e "${BLUE}[5/7] Pushing Docker image to Artifact Registry...${NC}"
docker push "$IMAGE_TAG"
docker push "$IMAGE_LATEST"

if [ $? -ne 0 ]; then
    echo -e "${RED}Docker push failed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker image pushed successfully${NC}"
echo -e "Image: ${GREEN}$IMAGE_TAG${NC}"

# Deploy to Cloud Run
echo -e "${BLUE}[6/7] Deploying to Cloud Run...${NC}"

DEPLOY_CMD="gcloud run deploy $SERVICE_NAME \
  --image=$IMAGE_TAG \
  --region=$REGION \
  --platform=managed \
  --allow-unauthenticated \
  --set-env-vars=SPRING_PROFILES_ACTIVE=$ENVIRONMENT,TZ=Asia/Kolkata \
  --set-secrets=JWT_SECRET=jwt-secret:latest,ENCRYPTION_SECRET_KEY=encryption-key:latest,DB_PASSWORD=db-password:latest,ADMIN_SEED_MOBILE=admin-seed-mobile:latest,ADMIN_SEED_PIN=admin-seed-pin:latest \
  --cpu=1 \
  --memory=512Mi \
  --timeout=300 \
  --concurrency=80"

# Add Cloud SQL connection if VPC connector exists
if [ -n "$VPC_CONNECTOR" ]; then
    DEPLOY_CMD="$DEPLOY_CMD --vpc-connector=$VPC_CONNECTOR --vpc-egress=private-ranges-only"
fi

# Add Cloud SQL instance connection
if [ -n "$CLOUD_SQL_INSTANCE" ]; then
    DEPLOY_CMD="$DEPLOY_CMD --set-env-vars=DB_URL=jdbc:postgresql:///tkt?cloudSqlInstance=$CLOUD_SQL_INSTANCE&socketFactory=com.google.cloud.sql.postgres.SocketFactory,DB_USERNAME=tkt-app-user"
fi

# Add service account if specified
if [ -n "$SERVICE_ACCOUNT" ]; then
    DEPLOY_CMD="$DEPLOY_CMD --service-account=$SERVICE_ACCOUNT"
fi

# Set instance scaling based on environment
if [ "$ENVIRONMENT" == "prod" ]; then
    DEPLOY_CMD="$DEPLOY_CMD --min-instances=1 --max-instances=10"
elif [ "$ENVIRONMENT" == "staging" ]; then
    DEPLOY_CMD="$DEPLOY_CMD --min-instances=0 --max-instances=5"
else
    DEPLOY_CMD="$DEPLOY_CMD --min-instances=0 --max-instances=3"
fi

# Execute deployment
eval "$DEPLOY_CMD"

if [ $? -ne 0 ]; then
    echo -e "${RED}Cloud Run deployment failed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Deployment successful${NC}"

# Get service URL
echo -e "${BLUE}[7/7] Retrieving service information...${NC}"
SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" --region="$REGION" --format='value(status.url)')

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "Service URL: ${GREEN}$SERVICE_URL${NC}"
echo -e "Health Check: ${GREEN}$SERVICE_URL/api/actuator/health${NC}"
echo -e "Environment: ${GREEN}$ENVIRONMENT${NC}"
echo -e "Region: ${GREEN}$REGION${NC}"
echo ""
echo -e "${YELLOW}Testing the deployment...${NC}"

# Wait for service to be ready
sleep 10

# Test health endpoint
HEALTH_URL="$SERVICE_URL/api/actuator/health"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL")

if [ "$HTTP_STATUS" == "200" ]; then
    echo -e "${GREEN}✓ Health check passed (HTTP $HTTP_STATUS)${NC}"
else
    echo -e "${RED}✗ Health check failed (HTTP $HTTP_STATUS)${NC}"
    echo -e "${YELLOW}Please check Cloud Run logs for details${NC}"
fi

echo ""
echo -e "${BLUE}View logs:${NC}"
echo -e "gcloud run services logs read $SERVICE_NAME --region=$REGION --limit=50"
echo ""
echo -e "${BLUE}Useful commands:${NC}"
echo -e "View service details: gcloud run services describe $SERVICE_NAME --region=$REGION"
echo -e "Stream logs: gcloud run services logs tail $SERVICE_NAME --region=$REGION"
echo -e "Update service: gcloud run services update $SERVICE_NAME --region=$REGION"
echo ""

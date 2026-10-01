#!/bin/bash

set -e

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Disable AWS CLI pager
export AWS_PAGER=""

# Configuration
AWS_REGION=${AWS_REGION:-"us-east-1"}
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query "Account" --output text)
ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
ECR_REPOSITORY_BACKEND="atelier-backend"
ECR_REPOSITORY_FRONTEND="atelier-frontend"
IMAGE_TAG="latest"

login_ecr() {
  aws ecr get-login-password --region "$AWS_REGION" | docker login --username AWS --password-stdin "$ECR_REGISTRY"
}

echo -e "${YELLOW}AWS Deployment Setup${NC}"
echo -e "${YELLOW}===================${NC}"
echo "AWS Account: $AWS_ACCOUNT_ID"
echo "AWS Region: $AWS_REGION"
echo "ECR Registry: $ECR_REGISTRY"

# Create ECR repositories if they don't exist
echo -e "\n${YELLOW}Creating ECR repositories...${NC}"

for repo in $ECR_REPOSITORY_BACKEND $ECR_REPOSITORY_FRONTEND; do
  if aws ecr describe-repositories --repository-names $repo --region $AWS_REGION 2>/dev/null; then
    echo -e "${GREEN}✓${NC} ECR repository $repo already exists"
  else
    echo -e "${YELLOW}→${NC} Creating ECR repository $repo..."
    aws ecr create-repository \
      --repository-name $repo \
      --region $AWS_REGION \
      --image-tag-mutability MUTABLE \
      --image-scanning-configuration scanOnPush=true
    echo -e "${GREEN}✓${NC} Created ECR repository $repo"
  fi
done

# Login to ECR
echo -e "\n${YELLOW}Logging in to ECR...${NC}"
login_ecr
echo -e "${GREEN}✓${NC} Logged in to ECR"

# Build and push backend image
echo -e "\n${YELLOW}Building backend image...${NC}"
cd backend
# Refresh auth immediately before buildx push to avoid intermittent 403 on layer HEAD checks.
login_ecr
docker buildx build --platform linux/amd64 --provenance=false --sbom=false -t ${ECR_REGISTRY}/${ECR_REPOSITORY_BACKEND}:${IMAGE_TAG} --push .
echo -e "${GREEN}✓${NC} Backend image pushed: ${ECR_REGISTRY}/${ECR_REPOSITORY_BACKEND}:${IMAGE_TAG}"
cd ..

# Build and push frontend image
echo -e "\n${YELLOW}Building frontend image...${NC}"
cd frontend
# Refresh auth immediately before buildx push to avoid intermittent 403 on layer HEAD checks.
login_ecr
docker buildx build --platform linux/amd64 --provenance=false --sbom=false -t ${ECR_REGISTRY}/${ECR_REPOSITORY_FRONTEND}:${IMAGE_TAG} --push .
echo -e "${GREEN}✓${NC} Frontend image pushed: ${ECR_REGISTRY}/${ECR_REPOSITORY_FRONTEND}:${IMAGE_TAG}"
cd ..

echo -e "\n${GREEN}Docker images successfully built and pushed to ECR!${NC}"
echo -e "\n${YELLOW}Next steps:${NC}"
echo "1. Update infrastructure/terraform/terraform.tfvars with the following:"
echo "   backend_image_uri  = \"${ECR_REGISTRY}/${ECR_REPOSITORY_BACKEND}:${IMAGE_TAG}\""
echo "   frontend_image_uri = \"${ECR_REGISTRY}/${ECR_REPOSITORY_FRONTEND}:${IMAGE_TAG}\""
echo "2. cd infrastructure/terraform"
echo "3. terraform init"
echo "4. terraform plan"
echo "5. terraform apply"

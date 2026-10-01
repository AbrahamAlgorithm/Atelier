#!/bin/bash

set -e

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}ECS Service Update${NC}"
echo -e "${YELLOW}==================${NC}"

AWS_REGION=${AWS_REGION:-"us-east-1"}
CLUSTER_NAME=${CLUSTER_NAME:-"atelier-cluster"}
SERVICE_NAME=${1:?"Usage: ./update-ecs-service.sh <service-name>"}

echo "Region: $AWS_REGION"
echo "Cluster: $CLUSTER_NAME"
echo "Service: $SERVICE_NAME"

# Force a new deployment
echo -e "\n${YELLOW}Forcing new ECS deployment...${NC}"
aws ecs update-service \
  --cluster $CLUSTER_NAME \
  --service $SERVICE_NAME \
  --force-new-deployment \
  --region $AWS_REGION

echo -e "\n${GREEN}✓${NC} ECS service update initiated"
echo -e "${YELLOW}Waiting for deployment to complete...${NC}"

# Wait for service to stabilize
aws ecs wait services-stable \
  --cluster $CLUSTER_NAME \
  --services $SERVICE_NAME \
  --region $AWS_REGION

echo -e "\n${GREEN}✓${NC} ECS service updated successfully"

# Get service info
aws ecs describe-services \
  --cluster $CLUSTER_NAME \
  --services $SERVICE_NAME \
  --region $AWS_REGION \
  --query 'services[0].[serviceName,status,runningCount,desiredCount]' \
  --output table

#!/bin/bash

set -e

# Color output
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${YELLOW}Making scripts executable...${NC}"

chmod +x build-and-push.sh
chmod +x deploy.sh
chmod +x destroy.sh
chmod +x update-ecs-service.sh

echo -e "${GREEN}✓${NC} All scripts are now executable"
echo -e "\n${YELLOW}Available scripts:${NC}"
echo "  ./build-and-push.sh          - Build Docker images and push to ECR"
echo "  ./deploy.sh                   - Deploy infrastructure with Terraform"
echo "  ./destroy.sh                  - Destroy AWS infrastructure"
echo "  ./update-ecs-service.sh       - Update ECS service with new deployment"

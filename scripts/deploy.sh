#!/bin/bash

set -e

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}AWS Terraform Deployment${NC}"
echo -e "${YELLOW}========================${NC}"

ENVIRONMENT=${1:-prod}
TF_DIR="infrastructure/terraform"

# Validate inputs
if [ ! -d "$TF_DIR" ]; then
  echo -e "${RED}Error: Terraform directory not found at $TF_DIR${NC}"
  exit 1
fi

cd $TF_DIR

# Check if backend needs to be initialized
if [ ! -d ".terraform" ]; then
  echo -e "${YELLOW}Initializing Terraform...${NC}"
  terraform init
fi

# Format check
echo -e "\n${YELLOW}Checking Terraform formatting...${NC}"
terraform fmt -recursive . || true

# Validation
echo -e "\n${YELLOW}Validating Terraform configuration...${NC}"
terraform validate

# Plan
echo -e "\n${YELLOW}Planning Terraform deployment...${NC}"
terraform plan -out=tfplan

# Ask for confirmation
echo -e "\n${YELLOW}Review the plan above. Do you want to proceed? (yes/no)${NC}"
read -r confirmation

if [ "$confirmation" != "yes" ]; then
  echo -e "${YELLOW}Deployment cancelled.${NC}"
  exit 0
fi

# Apply
echo -e "\n${YELLOW}Applying Terraform configuration...${NC}"
terraform apply tfplan

echo -e "\n${GREEN}Terraform deployment completed!${NC}"
echo -e "\n${YELLOW}Outputs:${NC}"
terraform output

# Cleanup
rm -f tfplan

cd - > /dev/null

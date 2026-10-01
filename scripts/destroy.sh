#!/bin/bash

set -e

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}AWS Terraform Destroy${NC}"
echo -e "${YELLOW}====================​${NC}"

TF_DIR="infrastructure/terraform"

if [ ! -d "$TF_DIR" ]; then
  echo -e "${RED}Error: Terraform directory not found at $TF_DIR${NC}"
  exit 1
fi

cd $TF_DIR

echo -e "${RED}WARNING: This will destroy all AWS resources managed by Terraform!${NC}"
echo -e "${RED}This action cannot be undone.${NC}"
echo -e "\n${YELLOW}Type 'destroy' to confirm:${NC}"
read -r confirmation

if [ "$confirmation" != "destroy" ]; then
  echo -e "${YELLOW}Destroy cancelled.${NC}"
  exit 0
fi

echo -e "\n${YELLOW}Running terraform destroy...${NC}"
terraform destroy

echo -e "\n${GREEN}Terraform resources destroyed!${NC}"

cd - > /dev/null

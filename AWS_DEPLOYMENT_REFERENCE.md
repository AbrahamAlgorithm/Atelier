# AWS Deployment Configuration Reference

## Quick Start Checklist

- [ ] AWS Account created and configured
- [ ] IAM user with appropriate permissions
- [ ] AWS CLI installed and configured (`aws configure`)
- [ ] Docker installed and running
- [ ] Terraform installed
- [ ] Repository cloned locally
- [ ] Environment variables set

## Setup Scripts

### Make Scripts Executable

```bash
chmod +x scripts/setup-scripts.sh
./scripts/setup-scripts.sh
```

Or manually:

```bash
chmod +x scripts/build-and-push.sh
chmod +x scripts/deploy.sh
chmod +x scripts/destroy.sh
chmod +x scripts/update-ecs-service.sh
```

## Environment Variables

### AWS Credentials

```bash
export AWS_ACCESS_KEY_ID="AKIA..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_DEFAULT_REGION="us-east-1"
```

### Terraform Variables (Set Before Apply)

```bash
export TF_VAR_db_password="your-secure-password"
export TF_VAR_jwt_secret="..."
export TF_VAR_jwt_refresh_secret="..."
export TF_VAR_gemini_api_key="..."
export TF_VAR_replicate_api_token="..."
```

## Common Commands

### Build and Push Docker Images

```bash
./scripts/build-and-push.sh
```

Output will show:
```
Backend: ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/atelier-backend:latest
Frontend: ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/atelier-frontend:latest
```

### Deploy Infrastructure

```bash
./scripts/deploy.sh
```

### Update ECS Service

```bash
./scripts/update-ecs-service.sh atelier-backend-service
./scripts/update-ecs-service.sh atelier-frontend-service
```

### View Deployment Status

```bash
cd infrastructure/terraform
terraform output
```

### Destroy Resources

```bash
./scripts/destroy.sh
```

## Terraform State

By default, Terraform state is stored locally. For production, use S3 backend:

1. Create S3 bucket and DynamoDB table:
```bash
aws s3api create-bucket --bucket atelier-terraform-state --region us-east-1
aws dynamodb create-table \
  --table-name atelier-terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5
```

2. Uncomment backend configuration in `infrastructure/terraform/provider.tf`

3. Run `terraform init` again

## GitHub Actions Secrets

For CI/CD pipeline, set these secrets in your GitHub repository:

- `AWS_ACCESS_KEY_ID`: Your AWS access key
- `AWS_SECRET_ACCESS_KEY`: Your AWS secret key
- `AWS_ROLE_ARN`: (Optional) IAM role for OIDC

## File Structure

```
.
├── backend/
│   ├── Dockerfile
│   ├── .dockerignore
│   └── ...
├── frontend/
│   ├── Dockerfile
│   ├── .dockerignore
│   └── ...
├── infrastructure/
│   └── terraform/
│       ├── provider.tf
│       ├── variables.tf
│       ├── vpc.tf
│       ├── security_groups.tf
│       ├── rds.tf
│       ├── ecs.tf
│       ├── alb.tf
│       ├── ecs_tasks.tf
│       ├── secrets.tf
│       ├── outputs.tf
│       └── terraform.tfvars.example
├── scripts/
│   ├── build-and-push.sh
│   ├── deploy.sh
│   ├── destroy.sh
│   ├── update-ecs-service.sh
│   └── setup-scripts.sh
├── .github/workflows/
│   ├── deploy.yml
│   └── test.yml
├── docker-compose.yml
└── DEPLOYMENT.md
```

## Monitoring URLs

After deployment:

- Application: `http://<ALB_DNS_NAME>`
- Backend API: `http://<ALB_DNS_NAME>/api`
- AWS Console: https://console.aws.amazon.com/
- ECS Cluster: https://console.aws.amazon.com/ecs/
- RDS Database: https://console.aws.amazon.com/rds/
- CloudWatch Logs: https://console.aws.amazon.com/cloudwatch/

## Cost Estimation

Approximate monthly cost (minimal config):

- ECS Fargate: ~$20-30
- RDS db.t4g.micro: ~$15-20
- ALB: ~$15-20
- NAT Gateway: ~$35
- Data Transfer: Variable

**Total: ~$90-120/month**

To reduce costs:
- Use RDS Spot instances
- Use Fargate Spot for non-critical services
- Implement aggressive auto-scaling policies
- Use free tier where possible

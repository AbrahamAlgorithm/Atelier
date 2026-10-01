# AWS Deployment Guide for Atelier

This guide walks you through deploying the Atelier full-stack application to AWS.

## Architecture Overview

The deployment uses the following AWS services:

- **ECS Fargate**: Container orchestration for backend and frontend
- **RDS PostgreSQL**: Managed relational database
- **Application Load Balancer (ALB)**: Distributes traffic across ECS tasks
- **S3**: File storage (already configured)
- **CloudWatch**: Monitoring and logging
- **Secrets Manager**: Secure credential storage
- **ECR**: Container image registry

## Prerequisites

### Required Tools

1. **AWS CLI** - [Install](https://aws.amazon.com/cli/)
   ```bash
   aws --version
   ```

2. **Terraform** - [Install](https://www.terraform.io/downloads)
   ```bash
   terraform version
   ```

3. **Docker** - [Install](https://docs.docker.com/get-docker/)
   ```bash
   docker --version
   ```

### AWS Account Setup

1. Create an AWS account
2. Create an IAM user with appropriate permissions:
   - ECS, ECR, RDS, ALB, VPC, CloudWatch, Secrets Manager, IAM
3. Generate AWS Access Key ID and Secret Access Key
4. Configure AWS CLI:
   ```bash
   aws configure
   ```

### Environment Variables

Set up your AWS credentials:

```bash
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key"
export AWS_DEFAULT_REGION="us-east-1"
```

## Step 1: Prepare Credentials

Create a `.env` file in the project root with your sensitive data:

```bash
# backend/.env
PORT=8080
JWT_SECRET=U6LRsiSgNXfEdGIVzVJtvhyfW5pPLzwMeMqRnFoid6w=
JWT_REFRESH_SECRET=dlFWtDx0YwoKoYs5xcyCxNjQwQwpv405BsBMyID5HWg=
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
S3_BUCKET=atelier-uploads
GEMINI_API_KEY=your-gemini-key
REPLICATE_API_TOKEN=your-replicate-token
FRONTEND_URL=http://localhost:3000
```

⚠️ **Never commit `.env` to version control!**

## Step 2: Build and Push Docker Images to ECR

1. Make the build script executable:
   ```bash
   chmod +x scripts/build-and-push.sh
   ```

2. Run the build script:
   ```bash
   ./scripts/build-and-push.sh
   ```

   This script will:
   - Create ECR repositories (if they don't exist)
   - Build Docker images for backend and frontend
   - Push images to ECR
   - Output the image URIs needed for Terraform

3. Note the output image URIs - you'll need these in the next step.

## Step 3: Configure Terraform

1. Copy the example Terraform variables file:
   ```bash
   cp infrastructure/terraform/terraform.tfvars.example infrastructure/terraform/terraform.tfvars
   ```

2. Edit `infrastructure/terraform/terraform.tfvars`:
   ```bash
   vim infrastructure/terraform/terraform.tfvars
   ```

3. Update the following variables with values from Step 2:
   ```hcl
   backend_image_uri  = "ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/atelier-backend:latest"
   frontend_image_uri = "ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/atelier-frontend:latest"
   ```

4. Set environment variables for sensitive values:
   ```bash
   export TF_VAR_db_password="your-secure-password"
   export TF_VAR_jwt_secret="U6LRsiSgNXfEdGIVzVJtvhyfW5pPLzwMeMqRnFoid6w="
   export TF_VAR_jwt_refresh_secret="dlFWtDx0YwoKoYs5xcyCxNjQwQwpv405BsBMyID5HWg="
   export TF_VAR_gemini_api_key="your-gemini-key"
   export TF_VAR_replicate_api_token="your-replicate-token"
   ```

## Step 4: Initialize Terraform

```bash
cd infrastructure/terraform
terraform init
```

This command will:
- Download required provider plugins
- Initialize the backend
- Create `.terraform` directory

## Step 5: Plan the Deployment

```bash
terraform plan -out=tfplan
```

This will show all resources that will be created. Review carefully.

## Step 6: Deploy to AWS

```bash
./scripts/deploy.sh
```

Or manually:

```bash
terraform apply tfplan
```

Terraform will create:
- VPC with public and private subnets across 2 availability zones
- Internet Gateway and NAT Gateways
- RDS PostgreSQL database with Multi-AZ
- ECS Cluster with Fargate launch type
- Application Load Balancer
- CloudWatch Log Groups
- Secrets Manager entries
- Security Groups and IAM roles

The deployment takes approximately **10-15 minutes**.

## Step 7: Get Deployment Information

After deployment, retrieve the outputs:

```bash
cd infrastructure/terraform
terraform output
```

Key outputs:
- `alb_dns_name`: Public DNS name of the load balancer
- `rds_endpoint`: Database connection endpoint
- `ecs_cluster_name`: ECS cluster name

## Access Your Application

Once deployed, access your application at:

```
http://<alb_dns_name>
```

The backend API is at:

```
http://<alb_dns_name>/api
```

## Environment Configuration

### Frontend Environment Variables

The frontend uses `NEXT_PUBLIC_API_URL` to connect to the backend. This is automatically set by Terraform to:

```
https://<alb_dns_name>/api
```

To update it in production, modify the frontend task definition or redeploy with new environment variables.

### Backend Environment Variables

All backend environment variables are managed through:

1. **Direct environment variables** in the ECS task definition
2. **AWS Secrets Manager** for sensitive data:
   - JWT_SECRET
   - JWT_REFRESH_SECRET
   - GEMINI_API_KEY
   - REPLICATE_API_TOKEN

## Updating the Application

### Option 1: Manual Rebuild and Redeploy

1. Make code changes
2. Rebuild and push Docker images:
   ```bash
   ./scripts/build-and-push.sh
   ```
3. Update ECS service:
   ```bash
   ./scripts/update-ecs-service.sh atelier-backend-service
   ./scripts/update-ecs-service.sh atelier-frontend-service
   ```

### Option 2: GitHub Actions (Recommended)

1. Set up GitHub repository secrets:
   - `AWS_ROLE_ARN`: IAM role for OIDC federation (optional, or use access keys)
   - `AWS_ACCESS_KEY_ID`: AWS access key
   - `AWS_SECRET_ACCESS_KEY`: AWS secret key

2. Push changes to `main` branch
3. GitHub Actions will:
   - Run tests
   - Build Docker images
   - Push to ECR
   - Trigger ECS deployment

## Database Management

### Connect to Database

```bash
# Get RDS endpoint from terraform output
RDS_ENDPOINT=$(terraform output -raw rds_endpoint)

# Connect using psql
psql -h $RDS_ENDPOINT -U atelieradmin -d atelier -W
```

### Database Backups

RDS automatically creates backups with a 7-day retention period. To restore:

1. Go to AWS RDS Console
2. Select the database instance
3. Click "Actions" → "Restore to Point in Time"

### Database Monitoring

Monitor database performance in CloudWatch:

1. Go to AWS CloudWatch Console
2. Select "Logs" → `/rds/instance/atelier-db/postgresql`

## Monitoring and Logging

### CloudWatch Logs

View application logs:

```bash
# Backend logs
aws logs tail /ecs/atelier-backend --follow

# Frontend logs
aws logs tail /ecs/atelier-frontend --follow
```

### CloudWatch Metrics

1. Go to AWS CloudWatch Console
2. Select "Metrics"
3. View ECS, RDS, and ALB metrics

### ECS Service Status

```bash
aws ecs describe-services \
  --cluster atelier-cluster \
  --services atelier-backend-service atelier-frontend-service \
  --query 'services[*].[serviceName,status,runningCount,desiredCount]' \
  --output table
```

## Troubleshooting

### Services Not Starting

1. Check ECS task definitions:
   ```bash
   aws ecs describe-tasks \
     --cluster atelier-cluster \
     --tasks <task-arn>
   ```

2. Check CloudWatch logs for error messages

3. Verify environment variables and secrets are set correctly

### Database Connection Issues

1. Check RDS security group allows connections from ECS security group
2. Verify DATABASE_URL is correct
3. Check RDS is in the correct VPC and subnets

### High CPU/Memory Usage

1. Scale up task resources in `terraform.tfvars`
2. Or enable auto-scaling (already configured)

### Cannot Access Application

1. Verify ALB is healthy: `aws elbv2 describe-target-health --target-group-arn <arn>`
2. Check security groups allow inbound traffic on port 80/443
3. Verify ECS tasks are running: `aws ecs list-tasks --cluster atelier-cluster`

## Cost Optimization

To reduce AWS costs:

1. **RDS**: Change instance class to `db.t4g.micro` (already set)
2. **ECS**: Use Fargate Spot instances (adjust `capacity_providers` in Terraform)
3. **Data Transfer**: Use CloudFront for static assets
4. **ALB**: Consider NLB if only handling API traffic

## Security Best Practices

1. ✓ RDS encryption enabled (KMS)
2. ✓ Database backups enabled
3. ✓ Secrets stored in AWS Secrets Manager
4. ✓ Security groups restrict traffic
5. ✓ Multi-AZ deployment for high availability

Additional recommendations:

- Enable CloudTrail for audit logging
- Use VPC Flow Logs for network monitoring
- Set up AWS Config for compliance monitoring
- Use AWS WAF for application protection
- Enable MFA on AWS account
- Regularly rotate credentials

## Scaling

### Horizontal Scaling

Auto-scaling is configured to scale based on CPU and memory. To modify:

```hcl
# In infrastructure/terraform/alb.tf
resource "aws_appautoscaling_target" "backend_target" {
  max_capacity = 4  # Change this
  min_capacity = 1  # Or this
  ...
}
```

### Vertical Scaling

Update task resources:

```hcl
# In infrastructure/terraform/variables.tf
backend_cpu    = 512   # Change to 1024, 2048, etc.
backend_memory = 1024  # Change to 2048, 3072, etc.
```

Then re-apply Terraform:

```bash
terraform apply
```

## Cleanup and Destruction

⚠️ **WARNING: This will delete all AWS resources**

```bash
./scripts/destroy.sh
```

Or manually:

```bash
cd infrastructure/terraform
terraform destroy
```

Confirm by typing "destroy" when prompted.

## Support and Resources

- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [AWS RDS Documentation](https://docs.aws.amazon.com/rds/)
- [Application Load Balancer](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/)

## Next Steps

1. Set up custom domain with Route 53
2. Configure HTTPS/TLS certificates with ACM
3. Enable CloudFront CDN for static assets
4. Set up automated backups to S3
5. Configure SNS alerts for critical metrics
6. Set up CI/CD pipeline with GitHub Actions

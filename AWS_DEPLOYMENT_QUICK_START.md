# Quick AWS Deployment Summary

## 🚀 In 5 Minutes

```bash
# 1. Configure AWS
aws configure

# 2. Build and push Docker images
./scripts/build-and-push.sh

# 3. Set environment variables for Terraform
export TF_VAR_db_password="secure_password_here"
export TF_VAR_jwt_secret="your_jwt_secret"
export TF_VAR_jwt_refresh_secret="your_jwt_refresh_secret"
export TF_VAR_gemini_api_key="your_gemini_key"
export TF_VAR_replicate_api_token="your_replicate_token"

# 4. Update Terraform variables
cp infrastructure/terraform/terraform.tfvars.example infrastructure/terraform/terraform.tfvars
# Edit terraform.tfvars and add the Docker image URIs from step 2

# 5. Deploy
./scripts/deploy.sh
```

## 📋 What Gets Created

✓ VPC with public/private subnets  
✓ RDS PostgreSQL database (Multi-AZ)  
✓ ECS Fargate cluster with auto-scaling  
✓ Application Load Balancer  
✓ CloudWatch monitoring and logging  
✓ AWS Secrets Manager  

## 🔗 After Deployment

```bash
# Get ALB DNS name
terraform output alb_dns_name

# Get database endpoint
terraform output rds_endpoint

# View logs
aws logs tail /ecs/atelier-backend --follow
aws logs tail /ecs/atelier-frontend --follow
```

## 📖 Full Guides

- [Detailed Deployment Guide](DEPLOYMENT.md) - Step-by-step instructions
- [AWS Reference](AWS_DEPLOYMENT_REFERENCE.md) - Configuration reference and commands

## ⚠️ Important

1. **Secure your secrets** - Never commit `.env` files
2. **Enable backups** - RDS backups are enabled with 7-day retention
3. **Monitor costs** - Estimated ~$100/month for this setup
4. **Set up custom domain** - Update ALB DNS to your domain via Route 53
5. **Enable HTTPS** - Add SSL certificates via ACM

## 💰 Cost Breakdown

- ECS Fargate: ~$25/month
- RDS db.t4g.micro: ~$18/month
- ALB: ~$16/month
- NAT Gateway: ~$35/month
- **Total: ~$94/month**

## 🔧 Common Tasks

### Update Application
```bash
./scripts/build-and-push.sh
./scripts/update-ecs-service.sh atelier-backend-service
./scripts/update-ecs-service.sh atelier-frontend-service
```

### Connect to Database
```bash
psql -h $(terraform output -raw rds_endpoint) -U atelieradmin -d atelier
```

### View Service Status
```bash
aws ecs describe-services \
  --cluster atelier-cluster \
  --services atelier-backend-service atelier-frontend-service \
  --query 'services[*].[serviceName,status,runningCount,desiredCount]' \
  --output table
```

### Scale Services
```bash
# Edit infrastructure/terraform/terraform.tfvars
backend_desired_count = 3    # Change this
frontend_desired_count = 3   # Or this

terraform apply
```

### Destroy Everything
```bash
./scripts/destroy.sh
```

## 🐛 Troubleshooting

**Services won't start?**
```bash
aws logs tail /ecs/atelier-backend --follow
```

**Can't connect to database?**
- Check RDS security group
- Verify DATABASE_URL environment variable
- Confirm ECS security group is in RDS ingress rules

**High costs?**
- Use Fargate Spot instances
- Reduce task resources
- Set up auto-scaling policies

## 📚 Architecture Diagram

```
┌─────────────────────────────────────────────┐
│              AWS Region (us-east-1)         │
├─────────────────────────────────────────────┤
│                                             │
│  Internet Gateway                           │
│         ↓                                   │
│  Application Load Balancer (ALB)            │
│    /api → backend  /  → frontend           │
│         ↓              ↓                    │
│  ┌─────────────┐  ┌─────────────┐         │
│  │ ECS Tasks   │  │ ECS Tasks   │         │
│  │ Backend     │  │ Frontend    │         │
│  │ Fargate     │  │ Fargate     │         │
│  └─────────────┘  └─────────────┘         │
│         ↓              ↓                    │
│  ┌──────────────────────────────┐          │
│  │   RDS PostgreSQL Database    │          │
│  │   (Multi-AZ)                 │          │
│  └──────────────────────────────┘          │
│         ↓                                   │
│  ┌──────────────────────────────┐          │
│  │   S3 Bucket (Uploads)        │          │
│  └──────────────────────────────┘          │
│                                             │
└─────────────────────────────────────────────┘
```

## 🎯 Next Steps

1. Set custom domain in Route 53
2. Configure SSL/TLS with ACM
3. Set up CloudFront CDN
4. Enable WAF for security
5. Configure backup automation to S3
6. Set up SNS alerts
7. Enable VPC Flow Logs
8. Configure CloudTrail for auditing

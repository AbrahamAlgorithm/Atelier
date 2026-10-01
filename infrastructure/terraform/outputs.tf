output "alb_dns_name" {
  description = "DNS name of the load balancer"
  value       = aws_lb.main.dns_name
}

output "cloudfront_url" {
  description = "HTTPS CloudFront URL — use this to access the app"
  value       = "https://${aws_cloudfront_distribution.main.domain_name}"
}

output "rds_endpoint" {
  description = "RDS database endpoint"
  value       = aws_db_instance.main.endpoint
}

output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = aws_ecs_cluster.main.name
}

output "backend_service_name" {
  description = "Backend ECS service name"
  value       = aws_ecs_service.backend.name
}

output "frontend_service_name" {
  description = "Frontend ECS service name"
  value       = aws_ecs_service.frontend.name
}

output "cloudwatch_log_group_backend" {
  description = "Backend CloudWatch log group"
  value       = aws_cloudwatch_log_group.backend.name
}

output "cloudwatch_log_group_frontend" {
  description = "Frontend CloudWatch log group"
  value       = aws_cloudwatch_log_group.frontend.name
}

output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

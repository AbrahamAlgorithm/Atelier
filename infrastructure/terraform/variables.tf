variable "aws_region" {
  description = "AWS region for deployment"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "prod"
}

variable "app_name" {
  description = "Application name"
  type        = string
  default     = "atelier"
}

variable "container_port_backend" {
  description = "Backend container port"
  type        = number
  default     = 8080
}

variable "container_port_frontend" {
  description = "Frontend container port"
  type        = number
  default     = 3000
}

variable "backend_image_uri" {
  description = "ECR image URI for backend"
  type        = string
}

variable "frontend_image_uri" {
  description = "ECR image URI for frontend"
  type        = string
}

variable "backend_cpu" {
  description = "Backend task CPU"
  type        = number
  default     = 512
}

variable "backend_memory" {
  description = "Backend task memory in MB"
  type        = number
  default     = 1024
}

variable "backend_desired_count" {
  description = "Desired number of backend tasks"
  type        = number
  default     = 2
}

variable "frontend_cpu" {
  description = "Frontend task CPU"
  type        = number
  default     = 256
}

variable "frontend_memory" {
  description = "Frontend task memory in MB"
  type        = number
  default     = 512
}

variable "frontend_desired_count" {
  description = "Desired number of frontend tasks"
  type        = number
  default     = 2
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "atelier"
}

variable "db_username" {
  description = "Database username"
  type        = string
  default     = "atelieradmin"
}

variable "db_password" {
  description = "Database password (use AWS Secrets Manager)"
  type        = string
  sensitive   = true
}

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t4g.micro"
}

variable "db_allocated_storage" {
  description = "Database allocated storage in GB"
  type        = number
  default     = 20
}

variable "s3_bucket_name" {
  description = "S3 bucket name for uploads"
  type        = string
}

variable "jwt_secret" {
  description = "JWT secret"
  type        = string
  sensitive   = true
}

variable "jwt_refresh_secret" {
  description = "JWT refresh secret"
  type        = string
  sensitive   = true
}

variable "gemini_api_key" {
  description = "Google Gemini API key"
  type        = string
  sensitive   = true
}

variable "replicate_api_token" {
  description = "Replicate API token"
  type        = string
  sensitive   = true
}

variable "enable_database_deletion_protection" {
  description = "Enable deletion protection for RDS database"
  type        = bool
  default     = true
}

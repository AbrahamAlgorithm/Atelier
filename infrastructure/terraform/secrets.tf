# Secrets Manager secrets
resource "aws_secretsmanager_secret" "jwt_secret" {
  name = "${var.app_name}/jwt-secret"

  tags = {
    Name = "${var.app_name}-jwt-secret"
  }
}

resource "aws_secretsmanager_secret_version" "jwt_secret" {
  secret_id     = aws_secretsmanager_secret.jwt_secret.id
  secret_string = var.jwt_secret
}

resource "aws_secretsmanager_secret" "jwt_refresh_secret" {
  name = "${var.app_name}/jwt-refresh-secret"

  tags = {
    Name = "${var.app_name}-jwt-refresh-secret"
  }
}

resource "aws_secretsmanager_secret_version" "jwt_refresh_secret" {
  secret_id     = aws_secretsmanager_secret.jwt_refresh_secret.id
  secret_string = var.jwt_refresh_secret
}

resource "aws_secretsmanager_secret" "gemini_api_key" {
  name = "${var.app_name}/gemini-api-key"

  tags = {
    Name = "${var.app_name}-gemini-api-key"
  }
}

resource "aws_secretsmanager_secret_version" "gemini_api_key" {
  secret_id     = aws_secretsmanager_secret.gemini_api_key.id
  secret_string = var.gemini_api_key
}

resource "aws_secretsmanager_secret" "replicate_api_token" {
  name = "${var.app_name}/replicate-api-token"

  tags = {
    Name = "${var.app_name}-replicate-api-token"
  }
}

resource "aws_secretsmanager_secret_version" "replicate_api_token" {
  secret_id     = aws_secretsmanager_secret.replicate_api_token.id
  secret_string = var.replicate_api_token
}

# IAM policy for accessing secrets
resource "aws_iam_role_policy" "ecs_task_secrets_policy" {
  name = "${var.app_name}-ecs-task-secrets-policy"
  role = aws_iam_role.ecs_task_execution_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue"
        ]
        Resource = [
          aws_secretsmanager_secret.jwt_secret.arn,
          aws_secretsmanager_secret.jwt_refresh_secret.arn,
          aws_secretsmanager_secret.gemini_api_key.arn,
          aws_secretsmanager_secret.replicate_api_token.arn
        ]
      }
    ]
  })
}

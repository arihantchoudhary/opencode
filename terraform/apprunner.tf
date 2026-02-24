resource "aws_apprunner_service" "backend" {
  service_name = "${var.project}-backend-${var.environment}"

  source_configuration {
    authentication_configuration {
      connection_arn = var.github_connection_arn
    }

    code_repository {
      repository_url = var.github_repo_url

      source_code_version {
        type  = "BRANCH"
        value = var.github_branch
      }

      code_configuration {
        configuration_source = "API"

        code_configuration_values {
          runtime       = "PYTHON_311"
          build_command = "pip3 install --target . -r requirements.txt"
          start_command = "python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000"
          port          = "8000"

          runtime_environment_variables = {
            DYNAMODB_TABLE_NAME          = aws_dynamodb_table.users.name
            DYNAMODB_SESSIONS_TABLE_NAME = aws_dynamodb_table.sessions.name
            AWS_REGION                   = var.aws_region
            ENVIRONMENT                  = var.environment
            CORS_ORIGINS                 = var.cors_origins
            GITHUB_APP_ID                = var.github_app_id
            GITHUB_APP_PRIVATE_KEY       = var.github_app_private_key
            TWITTER_BEARER_TOKEN         = var.twitter_bearer_token
          }
        }
      }

      source_directory = "/backend"
    }

    auto_deployments_enabled = true
  }

  instance_configuration {
    cpu               = "1024"
    memory            = "2048"
    instance_role_arn = aws_iam_role.apprunner_instance.arn
  }

  health_check_configuration {
    protocol            = "HTTP"
    path                = "/health"
    interval            = 10
    timeout             = 5
    healthy_threshold   = 1
    unhealthy_threshold = 5
  }

  tags = {
    Project     = var.project
    Environment = var.environment
  }
}

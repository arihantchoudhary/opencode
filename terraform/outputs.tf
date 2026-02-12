output "apprunner_url" {
  value       = aws_apprunner_service.backend.service_url
  description = "App Runner service URL for the FastAPI backend"
}

output "dynamodb_table_name" {
  value       = aws_dynamodb_table.users.name
  description = "DynamoDB users table name"
}

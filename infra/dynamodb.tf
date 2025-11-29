# DynamoDB Tables for Cerebras Usage Tracking

# Users Table
resource "aws_dynamodb_table" "users" {
  name           = "${var.environment}-cerebras-users"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "PK"
  range_key      = "SK"

  attribute {
    name = "PK"
    type = "S"
  }

  attribute {
    name = "SK"
    type = "S"
  }

  attribute {
    name = "GSI1PK"
    type = "S"
  }

  attribute {
    name = "GSI1SK"
    type = "S"
  }

  global_secondary_index {
    name            = "GSI1"
    hash_key        = "GSI1PK"
    range_key       = "GSI1SK"
    projection_type = "ALL"
  }

  tags = {
    Name        = "cerebras-users"
    Environment = var.environment
    Service     = "cerebras"
  }
}

# API Keys Table
resource "aws_dynamodb_table" "api_keys" {
  name           = "${var.environment}-cerebras-api-keys"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "PK"
  range_key      = "SK"

  attribute {
    name = "PK"
    type = "S"
  }

  attribute {
    name = "SK"
    type = "S"
  }

  attribute {
    name = "GSI1PK"
    type = "S"
  }

  attribute {
    name = "GSI1SK"
    type = "S"
  }

  global_secondary_index {
    name            = "GSI1"
    hash_key        = "GSI1PK"
    range_key       = "GSI1SK"
    projection_type = "ALL"
  }

  tags = {
    Name        = "cerebras-api-keys"
    Environment = var.environment
    Service     = "cerebras"
  }
}

# Usage Sessions Table
resource "aws_dynamodb_table" "usage_sessions" {
  name           = "${var.environment}-cerebras-usage-sessions"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "PK"
  range_key      = "SK"

  attribute {
    name = "PK"
    type = "S"
  }

  attribute {
    name = "SK"
    type = "S"
  }

  attribute {
    name = "GSI1PK"
    type = "S"
  }

  attribute {
    name = "GSI1SK"
    type = "N"
  }

  global_secondary_index {
    name            = "GSI1"
    hash_key        = "GSI1PK"
    range_key       = "GSI1SK"
    projection_type = "ALL"
  }

  ttl {
    attribute_name = "ttl"
    enabled        = true
  }

  tags = {
    Name        = "cerebras-usage-sessions"
    Environment = var.environment
    Service     = "cerebras"
  }
}

# Usage Events Table
resource "aws_dynamodb_table" "usage_events" {
  name           = "${var.environment}-cerebras-usage-events"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "PK"
  range_key      = "SK"

  attribute {
    name = "PK"
    type = "S"
  }

  attribute {
    name = "SK"
    type = "S"
  }

  attribute {
    name = "GSI1PK"
    type = "S"
  }

  attribute {
    name = "GSI1SK"
    type = "N"
  }

  global_secondary_index {
    name            = "GSI1"
    hash_key        = "GSI1PK"
    range_key       = "GSI1SK"
    projection_type = "ALL"
  }

  ttl {
    attribute_name = "ttl"
    enabled        = true
  }

  tags = {
    Name        = "cerebras-usage-events"
    Environment = var.environment
    Service     = "cerebras"
  }
}

# Outputs
output "users_table_name" {
  value       = aws_dynamodb_table.users.name
  description = "Name of the users DynamoDB table"
}

output "api_keys_table_name" {
  value       = aws_dynamodb_table.api_keys.name
  description = "Name of the API keys DynamoDB table"
}

output "usage_sessions_table_name" {
  value       = aws_dynamodb_table.usage_sessions.name
  description = "Name of the usage sessions DynamoDB table"
}

output "usage_events_table_name" {
  value       = aws_dynamodb_table.usage_events.name
  description = "Name of the usage events DynamoDB table"
}

resource "aws_dynamodb_table" "users" {
  name         = "${var.project}-users-${var.environment}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "user_id"

  attribute {
    name = "user_id"
    type = "S"
  }

  attribute {
    name = "email"
    type = "S"
  }

  global_secondary_index {
    name            = "email-index"
    hash_key        = "email"
    projection_type = "ALL"
  }

  tags = {
    Project     = var.project
    Environment = var.environment
  }
}

resource "aws_dynamodb_table" "tweets" {
  name         = "${var.project}-tweets-${var.environment}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "cache_key"

  attribute {
    name = "cache_key"
    type = "S"
  }

  tags = {
    Project     = var.project
    Environment = var.environment
  }
}

resource "aws_dynamodb_table" "sessions" {
  name         = "${var.project}-sessions-${var.environment}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "session_id"

  attribute {
    name = "session_id"
    type = "S"
  }

  attribute {
    name = "user_id"
    type = "S"
  }

  global_secondary_index {
    name            = "user-id-index"
    hash_key        = "user_id"
    projection_type = "ALL"
  }

  tags = {
    Project     = var.project
    Environment = var.environment
  }
}

variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "environment" {
  type    = string
  default = "dev"
}

variable "project" {
  type    = string
  default = "stardrop"
}

variable "cors_origins" {
  type        = string
  default     = "http://localhost:3000"
  description = "Comma-separated list of allowed CORS origins"
}

variable "github_connection_arn" {
  type        = string
  description = "ARN of the AWS App Runner GitHub connection (create in AWS console under App Runner > GitHub connections)"
}

variable "github_repo_url" {
  type        = string
  default     = "https://github.com/arihantchoudhary/stardrop"
  description = "GitHub repository URL"
}

variable "github_branch" {
  type    = string
  default = "dev"
}

variable "github_app_id" {
  type        = string
  description = "GitHub App ID for stardrop-agent"
}

variable "github_app_private_key" {
  type        = string
  sensitive   = true
  description = "GitHub App private key for stardrop-agent"
}

variable "twitter_bearer_token" {
  type        = string
  sensitive   = true
  description = "Twitter API v2 Bearer Token for @Stardropper mentions"
}

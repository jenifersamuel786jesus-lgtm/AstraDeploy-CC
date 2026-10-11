# AstraDeploy Baseline Terraform Infrastructure Template
# Safe Plan-Only Mode Enforced by Default

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.40.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
  default_tags {
    tags = {
      ManagedBy   = "AstraDeploy"
      Environment = var.environment
      BillingMode = "SafePlanOnly"
    }
  }
}

# Private VPC Network
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "astradeploy-${var.environment}-vpc"
  }
}

# Private Isolated Subnet
resource "aws_subnet" "private" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.1.0/24"
  availability_zone = "${var.aws_region}a"

  tags = {
    Name = "astradeploy-private-subnet-1"
  }
}

# ECS Cluster
resource "aws_ecs_cluster" "primary" {
  name = "astradeploy-${var.environment}-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

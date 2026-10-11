output "vpc_id" {
  value       = aws_vpc.main.id
  description = "The ID of the provisioned private VPC"
}

output "ecs_cluster_name" {
  value       = aws_ecs_cluster.primary.name
  description = "Name of the AstraDeploy ECS cluster"
}

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }
}

provider "aws" {
  region = var.region
}
data "aws_region" "current" {}
data "aws_caller_identity" "current" {}


resource "aws_s3_bucket" "anguchat-bucket" {
  bucket = var.s3_bucket_name

}

resource "aws_instance" "anguchat-ec2" {
  instance_type        = "t2.micro"
  ami                  = "ami-0df4b2961410d4cff"
  iam_instance_profile = aws_iam_instance_profile.anguchat_instance_profile.name
  tags = {
    "Name" = "Project server"
  }
}

resource "aws_ssm_parameter" "db_connection_param" {
  name  = "anguchat/db_connection"
  type  = "SecureString"
  value = var.db_connection
}
resource "aws_ssm_parameter" "bucket_config_param" {
  name  = "anguchat/bucket_config_param"
  type  = "SecureString"
  value = var.s3_bucket_name
}


resource "aws_iam_role" "anguchat_ec2_access_role" {
  name        = "Anguchat-ec2-access-role"
  description = "Role to allow EC2 instances to access require services"
  assume_role_policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement" : [
      {
        "Effect" : "Allow",
        "Action" : [
          "sts:AssumeRole"
        ],
        "Principal" : {
          "Service" : [
            "ec2.amazonaws.com"
          ]
        }
      }
    ]
  })
}


resource "aws_iam_instance_profile" "anguchat_instance_profile" {
  name = "Anguchat_instance_profile"
  role = aws_iam_role.anguchat_ec2_access_role.name
}
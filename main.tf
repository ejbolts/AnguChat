terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }
}

provider "aws" {
  region = "ap-southeast-2"
}

   

resource "aws_s3_bucket" "anguchat-bucket" {
  bucket = var.s3_bucket_name

}

resource "aws_instance" "anguchat-ec2" {
  instance_type = "t2.micro"
  ami           = "ami-0df4b2961410d4cff"
  iam_instance_profile = aws_iam_instance_profile.Anguchat_s3_profile.name
  tags = {
    "Name" = "Project server"
  }
}




resource "aws_iam_role" "Anguchat-s3-access" {
  name        = "Anguchat-s3-access-role"
  description = "Role to allow EC2 instances to access S3 buckets"
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

resource "aws_iam_role_policy_attachment" "attach_anguchat_s3_policy" {
  role       = aws_iam_role.Anguchat-s3-access.name
  policy_arn = aws_iam_policy.anguchat_s3_policy.arn
}

resource "aws_iam_policy" "anguchat_s3_policy" {
  name = "Anguchat-s3-access-policy"
  

  policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement" : [
      {
        "Effect" : "Allow",
        "Action" : [
          "s3:ListBucket",
          "s3:GetObject",
          "s3:PutObject"
        ],
        "Resource" : [
          aws_s3_bucket.anguchat-bucket.arn,
          "${aws_s3_bucket.anguchat-bucket.arn}/*"
        ]
      }
    ]
  })
}



resource "aws_iam_instance_profile" "Anguchat_s3_profile" {
  name = "Anguchat_s3_profile"
  role = aws_iam_role.Anguchat-s3-access.name
}
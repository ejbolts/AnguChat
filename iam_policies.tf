resource "aws_iam_role_policy_attachment" "attach_anguchat_s3_policy" {
  role       = aws_iam_role.anguchat_ec2_access_role.name
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
          "${aws_s3_bucket.anguchat-bucket.arn}",
          "${aws_s3_bucket.anguchat-bucket.arn}/*"
        ]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "attach_rek_policy" {
  role       = aws_iam_role.anguchat_ec2_access_role.name
  policy_arn = aws_iam_policy.anguchat_image_rekonition_policy.arn
}
resource "aws_iam_policy" "anguchat_image_rekonition_policy" {
  name = "Anguchat-image-rekognition-policy"
  policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement" : [
      {
        "Effect" : "Allow",
        "Action" : [
          "rekognition:DetectLabels",
          "rekognition:DetectModerationLabels",
          "rekognition:DetectFaces"
        ],
        "Resource" : "*"
      }
    ]
  })

}

resource "aws_iam_role_policy_attachment" "attach_ssm_read" {
  role       = aws_iam_role.anguchat_ec2_access_role.name
  policy_arn = aws_iam_policy.anguchat_ssm_read.arn
}
resource "aws_iam_policy" "anguchat_ssm_read" {
  name        = "Anguchat_SSM_Config_ReadPolicy"
  description = "Allow EC2 to read app configs from SSM Parameter Store"

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "ssm:GetParameter",
          "ssm:GetParameters"
        ],
        Resource = [
          "arn:aws:ssm:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:parameter/anguchat/*"
        ]
      }
    ]
  })
}
resource "aws_s3_bucket" "cards_backup" {
  bucket        = "vocably-${terraform.workspace}-cards-backup"
  force_destroy = true
}

resource "aws_s3_bucket_versioning" "cards-backup" {
  bucket = aws_s3_bucket.cards_backup.bucket

  versioning_configuration {
    status = "Suspended"
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "bucket-config" {
  bucket = aws_s3_bucket.cards_backup.id

  rule {
    id = "backup"
    filter {}
    expiration {
      days = 30
    }
    status = "Enabled"
  }
}

resource "aws_iam_role" "cards_backupper_lambda_execution" {
  name               = "vocably-${terraform.workspace}-cards-backupper-lambda-execution"
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

resource "aws_iam_policy" "cards_backupper_lambda_execution" {
  name = "vocably-${terraform.workspace}-cards-backupper-lambda-execution-policy"
  policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement" : [
      {
        "Sid" : "DefaultLogging",
        "Effect" : "Allow",
        "Action" : [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ],
        "Resource" : "*"
      },
      {
        "Sid" : "S3CardsAccess",
        "Effect" : "Allow",
        "Action" : [
          "s3:*",
        ],
        "Resource" : [
          aws_s3_bucket.cards.arn,
          "${aws_s3_bucket.cards.arn}/*",
        ]
      },
      {
        "Sid" : "S3BackupCardsAccess",
        "Effect" : "Allow",
        "Action" : [
          "s3:*"
        ],
        "Resource" : [
          aws_s3_bucket.cards_backup.arn,
          "${aws_s3_bucket.cards_backup.arn}/*",
        ]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "cards_backupper_lambda_execution" {
  role       = aws_iam_role.cards_backupper_lambda_execution.name
  policy_arn = aws_iam_policy.cards_backupper_lambda_execution.arn
}

resource "aws_lambda_function" "cards_backupper" {
  filename         = data.archive_file.backend_build.output_path
  function_name    = "vocably-${terraform.workspace}-cards-backupper"
  role             = aws_iam_role.cards_backupper_lambda_execution.arn
  handler          = "cards-backupper.cardsBackupper"
  source_code_hash = data.archive_file.backend_build.output_base64sha256
  runtime          = "nodejs22.x"
  timeout          = 300
  memory_size      = 256
}

resource "aws_cloudwatch_log_group" "cards_backupper" {
  name              = "/aws/lambda/${aws_lambda_function.cards_backupper.function_name}"
  retention_in_days = 14
}

resource "aws_cloudwatch_event_rule" "cards_backupper" {
  name                = "vocably-${terraform.workspace}-cards-backupper"
  schedule_expression = "cron(0 4 * * ? *)" // At 4:00 every day
}

resource "aws_cloudwatch_event_target" "cards_backupper" {
  arn  = aws_lambda_function.cards_backupper.arn
  rule = aws_cloudwatch_event_rule.cards_backupper.name
}

resource "aws_lambda_permission" "allow_cloudwatch_to_call_cards_backupper_lambda" {
  statement_id  = "AllowExecutionFromCloudWatch"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.cards_backupper.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.cards_backupper.arn
}

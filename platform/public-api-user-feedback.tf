resource "aws_iam_role" "public_user_feedback_lambda_execution" {
  name               = "vocably-${terraform.workspace}-public-user-feedback-lambda-execution"
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

resource "aws_iam_policy" "public_user_feedback_lambda_execution" {
  name = "vocably-${terraform.workspace}-public-user-feedback-lambda-execution-policy"
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
        "Sid" : "SendEmails",
        "Effect" : "Allow",
        "Action" : [
          "ses:SendEmail",
          "ses:SendRawEmail"
        ],
        "Resource" : "*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "public_user_feedback_lambda_execution" {
  role       = aws_iam_role.public_user_feedback_lambda_execution.name
  policy_arn = aws_iam_policy.public_user_feedback_lambda_execution.arn
}

resource "aws_lambda_function" "public_user_feedback" {
  filename         = data.archive_file.public_backend_build.output_path
  function_name    = "vocably-${terraform.workspace}-public-user-feedback"
  role             = aws_iam_role.public_user_feedback_lambda_execution.arn
  handler          = "user-feedback.userFeedback"
  source_code_hash = data.archive_file.public_backend_build.output_base64sha256
  runtime          = "nodejs22.x"
}

resource "aws_cloudwatch_log_group" "public_user_feedback" {
  name              = "/aws/lambda/${aws_lambda_function.public_user_feedback.function_name}"
  retention_in_days = 14
}

resource "aws_apigatewayv2_integration" "public_user_feedback" {
  api_id = aws_apigatewayv2_api.public_api.id

  integration_uri    = aws_lambda_function.public_user_feedback.invoke_arn
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
}

resource "aws_apigatewayv2_route" "public_user_feedback" {
  api_id = aws_apigatewayv2_api.public_api.id

  route_key = "POST /feedback"
  target    = "integrations/${aws_apigatewayv2_integration.public_user_feedback.id}"
}

resource "aws_lambda_permission" "public_user_feedback" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.public_user_feedback.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_apigatewayv2_api.public_api.execution_arn}/*/*"
}

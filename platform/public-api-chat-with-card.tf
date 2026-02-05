resource "aws_iam_role" "public_chat_with_card_lambda" {
  name               = "vocably-${terraform.workspace}-public-chat-with-card-lambda"
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

resource "aws_iam_policy" "public_chat_with_card_lambda" {
  name = "vocably-${terraform.workspace}-public-chat-with-card-lambda-logs-policy"
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
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "public_chat_with_card_lambda" {
  role       = aws_iam_role.public_chat_with_card_lambda.name
  policy_arn = aws_iam_policy.public_chat_with_card_lambda.arn
}

resource "aws_lambda_function" "public_chat_with_card" {
  filename         = data.archive_file.public_backend_build.output_path
  function_name    = "vocably-${terraform.workspace}-public-chat-with-card"
  role             = aws_iam_role.public_chat_with_card_lambda.arn
  handler          = "chat-with-card.chatWithCard"
  source_code_hash = data.archive_file.public_backend_build.output_base64sha256
  runtime          = "nodejs22.x"
  timeout          = 10
}

resource "aws_cloudwatch_log_group" "public_chat_with_card" {
  name              = "/aws/lambda/${aws_lambda_function.public_chat_with_card.function_name}"
  retention_in_days = 14
}

resource "aws_apigatewayv2_integration" "public_chat_with_card" {
  api_id = aws_apigatewayv2_api.public_api.id

  integration_uri    = aws_lambda_function.public_chat_with_card.invoke_arn
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
}

resource "aws_apigatewayv2_route" "public_chat_with_card" {
  api_id = aws_apigatewayv2_api.public_api.id

  route_key = "POST /chat-with-card"
  target    = "integrations/${aws_apigatewayv2_integration.public_chat_with_card.id}"
}

resource "aws_lambda_permission" "public_chat_with_card" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.public_chat_with_card.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_apigatewayv2_api.public_api.execution_arn}/*/*"
}

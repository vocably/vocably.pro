resource "aws_iam_role" "public_fix_grammar_lambda" {
  name               = "vocably-${terraform.workspace}-public-fix-grammar-lambda"
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

resource "aws_iam_policy" "public_fix_grammar_lambda" {
  name = "vocably-${terraform.workspace}-public-fix-grammar-lambda-logs-policy"
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
    ]
  })
}

resource "aws_iam_role_policy_attachment" "public_fix_grammar_lambda" {
  role       = aws_iam_role.public_fix_grammar_lambda.name
  policy_arn = aws_iam_policy.public_fix_grammar_lambda.arn
}

resource "aws_lambda_function" "public_fix_grammar" {
  filename         = data.archive_file.public_backend_build.output_path
  function_name    = "vocably-${terraform.workspace}-public-fix-grammar"
  role             = aws_iam_role.public_fix_grammar_lambda.arn
  handler          = "fix-grammar.fixGrammar"
  source_code_hash = data.archive_file.public_backend_build.output_base64sha256
  runtime          = "nodejs22.x"
  timeout          = 10
}

resource "aws_cloudwatch_log_group" "public_fix_grammar" {
  name              = "/aws/lambda/${aws_lambda_function.public_fix_grammar.function_name}"
  retention_in_days = 14
}

resource "aws_apigatewayv2_integration" "public_fix_grammar" {
  api_id = aws_apigatewayv2_api.public_api.id

  integration_uri    = aws_lambda_function.public_fix_grammar.invoke_arn
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
}

resource "aws_apigatewayv2_route" "public_fix_grammar" {
  api_id = aws_apigatewayv2_api.public_api.id

  route_key = "POST /fix-grammar"
  target    = "integrations/${aws_apigatewayv2_integration.public_fix_grammar.id}"
}

resource "aws_lambda_permission" "public_fix_grammar" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.public_fix_grammar.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_apigatewayv2_api.public_api.execution_arn}/*/*"
}

resource "aws_iam_role" "public_predefined_options_lambda" {
  name               = "vocably-${terraform.workspace}-public-predefined-options-lambda"
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

resource "aws_iam_policy" "public_predefined_options_lambda" {
  name = "vocably-${terraform.workspace}-public-predefined-options-lambda-logs-policy"
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
        "Sid" : "UnitsOfSpeechS3",
        "Effect" : "Allow",
        "Action" : [
          "s3:*",
        ],
        "Resource" : [
          aws_s3_bucket.units_of_speech.arn,
          "${aws_s3_bucket.units_of_speech.arn}/*",
        ]
      },
      {
        "Sid" : "PublicStaticFilesBucket",
        "Effect" : "Allow",
        "Action" : [
          "s3:GetObject",
          "s3:PutObject"
        ],
        "Resource" : [
          aws_s3_bucket.public_static_files.arn,
          "${aws_s3_bucket.public_static_files.arn}/*",
        ]
      },
    ]
  })
}

resource "aws_iam_role_policy_attachment" "public_predefined_options_lambda" {
  role       = aws_iam_role.public_predefined_options_lambda.name
  policy_arn = aws_iam_policy.public_predefined_options_lambda.arn
}

resource "aws_lambda_function" "public_predefined_options" {
  filename         = data.archive_file.public_backend_build.output_path
  function_name    = "vocably-${terraform.workspace}-public-predefined-options"
  role             = aws_iam_role.public_predefined_options_lambda.arn
  handler          = "predefined-options.predefinedOptions"
  source_code_hash = data.archive_file.public_backend_build.output_base64sha256
  runtime          = "nodejs22.x"
  timeout          = 120
}

resource "aws_cloudwatch_log_group" "public_predefined_options" {
  name              = "/aws/lambda/${aws_lambda_function.public_predefined_options.function_name}"
  retention_in_days = 14
}

resource "aws_apigatewayv2_integration" "public_predefined_options" {
  api_id = aws_apigatewayv2_api.public_api.id

  integration_uri    = aws_lambda_function.public_predefined_options.invoke_arn
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
}

resource "aws_apigatewayv2_route" "public_predefined_options" {
  api_id = aws_apigatewayv2_api.public_api.id

  route_key = "GET /predefined-options"
  target    = "integrations/${aws_apigatewayv2_integration.public_predefined_options.id}"
}

resource "aws_lambda_permission" "public_predefined_options" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.public_predefined_options.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_apigatewayv2_api.public_api.execution_arn}/*/*"
}

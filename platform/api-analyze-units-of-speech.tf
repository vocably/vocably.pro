resource "aws_iam_role" "analyze_units_of_speech_lambda" {
  name               = "vocably-${terraform.workspace}-analyze-units-of-speech-lambda"
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

resource "aws_iam_policy" "analyze_units_of_speech_lambda" {
  name = "vocably-${terraform.workspace}-analyze-units-of-speech-lambda-logs-policy"
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
    ]
  })
}

resource "aws_iam_role_policy_attachment" "analyze_units_of_speech_lambda" {
  role       = aws_iam_role.analyze_units_of_speech_lambda.name
  policy_arn = aws_iam_policy.analyze_units_of_speech_lambda.arn
}

resource "aws_lambda_function" "analyze_units_of_speech" {
  filename         = data.archive_file.backend_build.output_path
  function_name    = "vocably-${terraform.workspace}-analyze-units-of-speech"
  role             = aws_iam_role.analyze_units_of_speech_lambda.arn
  handler          = "analyze-units-of-speech.analyzeUnitsOfSpeech"
  source_code_hash = data.archive_file.backend_build.output_base64sha256
  runtime          = "nodejs22.x"
  timeout          = 10
}

resource "aws_lambda_permission" "analyze_units_of_speech" {
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.analyze_units_of_speech.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_api_gateway_rest_api.rest_api.execution_arn}/*/*/*"
}

resource "aws_cloudwatch_log_group" "analyze_units_of_speech" {
  name              = "/aws/lambda/${aws_lambda_function.analyze_units_of_speech.function_name}"
  retention_in_days = 14
}

resource "aws_api_gateway_resource" "analyze_units_of_speech" {
  rest_api_id = aws_api_gateway_rest_api.rest_api.id
  parent_id   = aws_api_gateway_rest_api.rest_api.root_resource_id
  path_part   = "analyze-units-of-speech"
}

resource "aws_api_gateway_method" "analyze_units_of_speech" {
  rest_api_id   = aws_api_gateway_rest_api.rest_api.id
  resource_id   = aws_api_gateway_resource.analyze_units_of_speech.id
  http_method   = "POST"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.rest_api_cognito.id
}

module "analyze_units_of_speech_cors" {
  source  = "squidfunk/api-gateway-enable-cors/aws"
  version = "0.3.3"

  api_id          = aws_api_gateway_rest_api.rest_api.id
  api_resource_id = aws_api_gateway_method.analyze_units_of_speech.resource_id
}

resource "aws_api_gateway_integration" "analyze_units_of_speech" {
  rest_api_id = aws_api_gateway_rest_api.rest_api.id
  resource_id = aws_api_gateway_method.analyze_units_of_speech.resource_id
  http_method = aws_api_gateway_method.analyze_units_of_speech.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.analyze_units_of_speech.invoke_arn
  passthrough_behavior    = "WHEN_NO_MATCH"
}

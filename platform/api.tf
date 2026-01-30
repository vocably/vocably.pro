resource "aws_iam_role" "lambda_execution" {
  name               = "vocably-${terraform.workspace}-lambda-execution"
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

resource "aws_iam_policy" "lambda_execution" {
  name = "vocably-${terraform.workspace}-lambda-execution-policy"
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

resource "aws_iam_role_policy_attachment" "lambda_logging" {
  role       = aws_iam_role.lambda_execution.name
  policy_arn = aws_iam_policy.lambda_execution.arn
}

data "external" "backend_build" {
  depends_on = [local_file.backend_environment, data.external.app_build]
  program = ["bash", "-lc", <<EOT
(NODE_OPTIONS=--max-old-space-size=1024 npm run build --loglevel verbose) >&2 && echo "{\"dest\": \"dist\"}"
EOT
  ]
  working_dir = local.backend_root
}

data "archive_file" "backend_build" {
  depends_on = [
    data.external.backend_build
  ]
  type        = "zip"
  source_dir  = "${data.external.backend_build.working_dir}/${data.external.backend_build.result.dest}"
  output_path = "backend_build.zip"
}

resource "aws_api_gateway_rest_api" "rest_api" {
  name                     = "vocably-${terraform.workspace}-app-api"
  minimum_compression_size = "0"
}

resource "aws_api_gateway_authorizer" "rest_api_cognito" {
  name          = "CognitoUserPoolAuthorizer"
  type          = "COGNITO_USER_POOLS"
  rest_api_id   = aws_api_gateway_rest_api.rest_api.id
  provider_arns = [aws_cognito_user_pool.users.arn]
}

resource "aws_api_gateway_deployment" "deployment" {
  rest_api_id = aws_api_gateway_rest_api.rest_api.id
  triggers = {
    redeployment = sha1(jsonencode([
      md5(file("${path.module}/api.tf")),
      md5(file("${path.module}/api-analyze.tf")),
      md5(file("${path.module}/api-analyze-units-of-speech.tf")),
      md5(file("${path.module}/api-generate-units-of-speech.tf")),
      md5(file("${path.module}/api-bulk-analyze.tf")),
      md5(file("${path.module}/api-explain.tf")),
      md5(file("${path.module}/api-onboard.tf")),
      md5(file("${path.module}/api-cards.tf")),
      md5(file("${path.module}/api-user-files.tf")),
      md5(file("${path.module}/api-user-static-files.tf")),
      md5(file("${path.module}/api-play-sound.tf")),
      md5(file("${path.module}/user-feedback.tf")),
      md5(file("${path.module}/api-notification-time.tf")),
      md5(file("${path.module}/api-recalibrate-notifications.tf")),
      md5(file("${path.module}/api-chat-with-card.tf")),
      aws_lambda_function.analyze.last_modified,
      aws_lambda_function.analyze_units_of_speech.last_modified,
      aws_lambda_function.generate_units_of_speech.last_modified,
      aws_lambda_function.bulk_analyze.last_modified,
      aws_lambda_function.explain.last_modified,
      aws_lambda_function.onboard.last_modified,
      aws_lambda_function.play_sound.last_modified,
      aws_lambda_function.user_feedback.last_modified,
      aws_lambda_function.get_notification_time.last_modified,
      aws_lambda_function.set_notification_time.last_modified,
      aws_lambda_function.delete_notification_time.last_modified,
      aws_lambda_function.recalibrate_notifications.last_modified,
      aws_lambda_function.chat_with_card.last_modified,
    ]))
  }
  depends_on = [
    aws_api_gateway_integration.analyze,
    aws_api_gateway_integration.analyze_units_of_speech,
    aws_api_gateway_integration.generate_units_of_speech,
    aws_api_gateway_integration.bulk_analyze,
    aws_api_gateway_integration.explain,
    aws_api_gateway_integration.onboard,
    aws_api_gateway_integration.get_notification_time,
    aws_api_gateway_integration.set_notification_time,
    aws_api_gateway_integration.delete_notification_time,
    aws_api_gateway_integration.recalibrate_notifications,
    aws_api_gateway_integration.play_sound,
    aws_api_gateway_integration.user_feedback,
    aws_api_gateway_integration.put_language,
    aws_api_gateway_integration.get_language,
    aws_api_gateway_integration.delete_language,
    aws_api_gateway_integration.list_languages,
    aws_api_gateway_integration_response.put_language_200,
    aws_api_gateway_integration_response.delete_language_200,
    aws_api_gateway_integration_response.get_language_200,
    aws_api_gateway_integration_response.get_language_4xx,
    aws_api_gateway_integration_response.list_languages_200,
    aws_api_gateway_integration.put_user_file,
    aws_api_gateway_integration.get_user_file,
    aws_api_gateway_integration.delete_user_file,
    aws_api_gateway_integration_response.put_user_file_200,
    aws_api_gateway_integration_response.delete_user_file_200,
    aws_api_gateway_integration_response.get_user_file_200,
    aws_api_gateway_integration_response.get_user_file_4xx,
    aws_api_gateway_integration.get_static_user_file,
    aws_api_gateway_integration_response.get_static_user_file_200,
    aws_api_gateway_integration_response.get_static_user_file_4xx,
    aws_api_gateway_integration.chat_with_card,
    aws_lambda_function.analyze,
    aws_lambda_function.analyze_units_of_speech,
    aws_lambda_function.generate_units_of_speech,
    aws_lambda_function.bulk_analyze,
    aws_lambda_function.explain,
    aws_lambda_function.onboard,
    aws_lambda_function.play_sound,
    aws_lambda_function.user_feedback,
    aws_lambda_function.get_notification_time,
    aws_lambda_function.set_notification_time,
    aws_lambda_function.delete_notification_time,
    aws_lambda_function.recalibrate_notifications,
    aws_lambda_function.chat_with_card,
  ]
  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_api_gateway_stage" "stage" {
  deployment_id = aws_api_gateway_deployment.deployment.id
  rest_api_id   = aws_api_gateway_rest_api.rest_api.id
  stage_name    = "v1"
}

resource "aws_api_gateway_domain_name" "api" {
  certificate_arn = aws_acm_certificate.primary-global.arn
  domain_name     = local.api_domain
}

resource "aws_route53_record" "api" {
  name    = aws_api_gateway_domain_name.api.domain_name
  type    = "A"
  zone_id = data.aws_route53_zone.primary.id

  alias {
    evaluate_target_health = true
    name                   = aws_api_gateway_domain_name.api.cloudfront_domain_name
    zone_id                = aws_api_gateway_domain_name.api.cloudfront_zone_id
  }
}

resource "aws_api_gateway_base_path_mapping" "deployment" {
  api_id      = aws_api_gateway_rest_api.rest_api.id
  stage_name  = aws_api_gateway_stage.stage.stage_name
  domain_name = aws_api_gateway_domain_name.api.domain_name
}

output "app_api_url" {
  value = "https://${aws_api_gateway_domain_name.api.domain_name}"
}

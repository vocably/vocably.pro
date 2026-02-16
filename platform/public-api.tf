data "external" "public_backend_build" {
  depends_on = [local_file.public_backend_environment]
  program = ["bash", "-lc", <<EOT
(NODE_OPTIONS=--max-old-space-size=1024 npm run build --loglevel verbose) >&2 && echo "{\"dest\": \"dist\"}"
EOT
  ]
  working_dir = local.public_backend_root
}

data "archive_file" "public_backend_build" {
  depends_on = [
    data.external.public_backend_build
  ]
  type        = "zip"
  source_dir  = "${data.external.public_backend_build.working_dir}/${data.external.public_backend_build.result.dest}"
  output_path = "public_backend_build.zip"
}

resource "aws_apigatewayv2_api" "public_api" {
  name          = "vocably-${terraform.workspace}-public-api"
  protocol_type = "HTTP"

  cors_configuration {
    allow_credentials = true
    allow_headers     = ["*"]
    allow_methods     = ["*"]
    allow_origins = [
      "https://${var.root_domain}",
      "https://${local.app_domain}",
      "http://localhost:8050"
    ]
  }
}

resource "aws_apigatewayv2_stage" "public_api" {
  api_id = aws_apigatewayv2_api.public_api.id

  name        = "v1"
  auto_deploy = true

  default_route_settings {
    throttling_burst_limit = var.public_api_throttle_burst_limit
    throttling_rate_limit  = var.public_api_throttle_rate_limit
  }

  route_settings {
    route_key              = "POST /analyze"
    throttling_burst_limit = var.public_api_analyze_throttle_burst_limit
    throttling_rate_limit  = var.public_api_analyze_throttle_rate_limit
  }

  route_settings {
    route_key              = "GET /audio"
    throttling_burst_limit = var.public_api_audio_throttle_burst_limit
    throttling_rate_limit  = var.public_api_audio_throttle_rate_limit
  }

  route_settings {
    route_key              = "POST /feedback"
    throttling_burst_limit = var.public_api_feedback_throttle_burst_limit
    throttling_rate_limit  = var.public_api_feedback_throttle_rate_limit
  }

  route_settings {
    route_key              = "POST /generate-units-of-speech"
    throttling_burst_limit = var.public_api_generate_units_of_speech_throttle_burst_limit
    throttling_rate_limit  = var.public_api_generate_units_of_speech_throttle_rate_limit
  }

  route_settings {
    route_key              = "POST /analyze-units-of-speech"
    throttling_burst_limit = var.public_api_analyze_units_of_speech_throttle_burst_limit
    throttling_rate_limit  = var.public_api_analyze_units_of_speech_throttle_rate_limit
  }

  route_settings {
    route_key              = "POST /chat-with-card"
    throttling_burst_limit = var.public_api_chat_with_card_throttle_burst_limit
    throttling_rate_limit  = var.public_api_chat_with_card_throttle_rate_limit
  }

  route_settings {
    route_key              = "GET /predefined-options"
    throttling_burst_limit = var.public_api_predefined_options_throttle_burst_limit
    throttling_rate_limit  = var.public_api_predefined_options_throttle_rate_limit
  }

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.public_api.arn

    format = jsonencode({
      requestId               = "$context.requestId"
      sourceIp                = "$context.identity.sourceIp"
      requestTime             = "$context.requestTime"
      protocol                = "$context.protocol"
      httpMethod              = "$context.httpMethod"
      resourcePath            = "$context.resourcePath"
      routeKey                = "$context.routeKey"
      status                  = "$context.status"
      responseLength          = "$context.responseLength"
      integrationErrorMessage = "$context.integrationErrorMessage"
      }
    )
  }
}

resource "aws_cloudwatch_log_group" "public_api" {
  name = "/aws/public_api/${aws_apigatewayv2_api.public_api.name}"

  retention_in_days = 30
}

resource "aws_apigatewayv2_domain_name" "public_api" {
  domain_name = local.public_api_domain
  domain_name_configuration {
    certificate_arn = aws_acm_certificate.primary.arn
    endpoint_type   = "REGIONAL"
    security_policy = "TLS_1_2"
  }
  depends_on = [aws_acm_certificate_validation.primary]
}

resource "aws_route53_record" "public_api" {
  name    = aws_apigatewayv2_domain_name.public_api.domain_name
  type    = "A"
  zone_id = data.aws_route53_zone.primary.id

  alias {
    evaluate_target_health = true
    name                   = aws_apigatewayv2_domain_name.public_api.domain_name_configuration[0].target_domain_name
    zone_id                = aws_apigatewayv2_domain_name.public_api.domain_name_configuration[0].hosted_zone_id
  }
}

resource "aws_apigatewayv2_api_mapping" "public_api" {
  api_id      = aws_apigatewayv2_api.public_api.id
  stage       = aws_apigatewayv2_stage.public_api.name
  domain_name = aws_apigatewayv2_domain_name.public_api.domain_name
}

output "public_api_url" {
  value = "https://${aws_apigatewayv2_domain_name.public_api.domain_name}"
}

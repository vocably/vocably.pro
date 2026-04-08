locals {
  auth_lambdas_content = <<EOT
BREVO_API_KEY="${var.brevo_api_key}"
USER_FILES_BUCKET="${aws_s3_bucket.user_files.bucket}"
  EOT
}

resource "local_file" "auth_lambdas_environment" {
  content  = local.auth_lambdas_content
  filename = "${local.auth_lambdas_root}/.env.local"
}

data "external" "auth_lambdas_build" {
  depends_on = [local_file.auth_lambdas_environment]

  program = ["bash", "-lc", <<EOT
(NODE_OPTIONS=--max-old-space-size=1024 npm run build --loglevel verbose) >&2 && echo "{\"dest\": \"dist\"}"
EOT
  ]
  working_dir = local.auth_lambdas_root
}

data "archive_file" "auth_lambdas_build" {
  depends_on = [
    data.external.auth_lambdas_build
  ]
  type        = "zip"
  source_dir  = "${data.external.auth_lambdas_build.working_dir}/${data.external.auth_lambdas_build.result.dest}"
  output_path = "auth_lambdas_build.zip"
}

resource "aws_iam_role" "auth_post_confirmation_lambda_execution" {
  name               = "vocably-${terraform.workspace}-auth_post_confirmation-lambda-execution"
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

resource "aws_iam_policy" "auth_post_confirmation_lambda_execution" {
  name = "vocably-${terraform.workspace}-auth_post_confirmation-lambda-execution-policy"
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
        "Sid" : "Cognito",
        "Effect" : "Allow",
        "Action" : [
          "cognito-idp:AdminGetUser",
          "cognito-idp:AdminUpdateUserAttributes",
          "cognito-idp:AdminAddUserToGroup",
          "cognito-idp:AdminRemoveUserFromGroup",
          "cognito-idp:AdminListGroupsForUser",
          "logs:PutLogEvents"
        ],
        "Resource" : "*"
      },
      {
        "Sid" : "S3UserFiles",
        "Effect" : "Allow",
        "Action" : [
          "s3:*"
        ],
        "Resource" : [
          aws_s3_bucket.user_files.arn,
          "${aws_s3_bucket.user_files.arn}/*",
        ]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "auth_post_confirmation_lambda_execution" {
  role       = aws_iam_role.auth_post_confirmation_lambda_execution.name
  policy_arn = aws_iam_policy.auth_post_confirmation_lambda_execution.arn
}

resource "aws_lambda_function" "auth_post_confirmation" {
  filename         = data.archive_file.auth_lambdas_build.output_path
  function_name    = "vocably-${terraform.workspace}-auth-post_confirmation"
  role             = aws_iam_role.auth_post_confirmation_lambda_execution.arn
  handler          = "auth-post-confirmation.authPostConfirmation"
  source_code_hash = data.archive_file.auth_lambdas_build.output_base64sha256
  runtime          = "nodejs22.x"
  timeout          = 10
}

resource "aws_lambda_permission" "auth_post_confirmation" {
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.auth_post_confirmation.function_name
  principal     = "cognito-idp.amazonaws.com"

  source_arn = aws_cognito_user_pool.users.arn
}

resource "aws_cloudwatch_log_group" "auth_post_confirmation" {
  name              = "/aws/lambda/${aws_lambda_function.auth_post_confirmation.function_name}"
  retention_in_days = 14
}

resource "aws_cloudwatch_log_metric_filter" "auth_post_confirmation_error" {
  name           = "error"
  pattern        = "error"
  log_group_name = aws_cloudwatch_log_group.auth_post_confirmation.name

  metric_transformation {
    name      = "vocably-${terraform.workspace}-auth-post-confirmation-error"
    namespace = "vocably-metrics"
    value     = "1"
  }
}

resource "aws_cloudwatch_metric_alarm" "auth_post_confirmation_error" {
  alarm_name                = "vocably-${terraform.workspace}-auth-post-confirmation-error"
  comparison_operator       = "GreaterThanThreshold"
  evaluation_periods        = "1"
  metric_name               = aws_cloudwatch_log_metric_filter.auth_post_confirmation_error.metric_transformation[0].name
  namespace                 = aws_cloudwatch_log_metric_filter.auth_post_confirmation_error.metric_transformation[0].namespace
  period                    = "3600"
  statistic                 = "Average"
  threshold                 = "0"
  alarm_description         = "${terraform.workspace}: auth post confirmation lambda error"
  alarm_actions             = [aws_sns_topic.alarm.arn]
  insufficient_data_actions = []
}

// The rest of the auth

resource "aws_cognito_user_pool" "users" {
  name                     = "vocably-${terraform.workspace}-user-pool"
  auto_verified_attributes = ["email"]
  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }

  admin_create_user_config {
    allow_admin_create_user_only = true
  }

  lifecycle {
    ignore_changes = [
      schema
    ]
  }

  lambda_config {
    post_confirmation = aws_lambda_function.auth_post_confirmation.arn
  }

  schema {
    attribute_data_type = "String"
    name                = "status"
    mutable             = true
    required            = false
  }

  schema {
    attribute_data_type = "String"
    name                = "update_url"
    mutable             = true
    required            = false
  }

  schema {
    attribute_data_type = "String"
    name                = "cancel_url"
    mutable             = true
    required            = false
  }

  schema {
    attribute_data_type = "String"
    name                = "next_bill_date"
    mutable             = true
    required            = false
  }

  schema {
    attribute_data_type = "String"
    name                = "cancellation_date"
    mutable             = true
    required            = false
  }

  schema {
    attribute_data_type = "Number"
    name                = "unit_price"
    mutable             = true
    required            = false
  }

  schema {
    attribute_data_type = "Number"
    name                = "product_id"
    mutable             = true
    required            = false
  }

  schema {
    attribute_data_type = "String"
    name                = "plan_name"
    mutable             = true
    required            = false
  }
}

resource "aws_cognito_user_group" "paid" {
  name         = "paid"
  user_pool_id = aws_cognito_user_pool.users.id
  description  = "Paid customers"
}

resource "aws_cognito_identity_provider" "google" {
  user_pool_id  = aws_cognito_user_pool.users.id
  provider_name = "Google"
  provider_type = "Google"

  provider_details = {
    authorize_scopes              = "profile email openid"
    client_id                     = var.google_oauth2_client_id
    client_secret                 = var.google_oauth2_client_secret
    token_url                     = "https://www.googleapis.com/oauth2/v4/token"
    token_request_method          = "POST"
    oidc_issuer                   = "https://accounts.google.com"
    authorize_url                 = "https://accounts.google.com/o/oauth2/v2/auth"
    attributes_url                = "https://people.googleapis.com/v1/people/me?personFields="
    attributes_url_add_attributes = "true"
  }

  attribute_mapping = {
    email    = "email"
    username = "sub"
  }
}

resource "aws_cognito_identity_provider" "apple" {
  user_pool_id  = aws_cognito_user_pool.users.id
  provider_name = "SignInWithApple"
  provider_type = "SignInWithApple"

  provider_details = {
    authorize_scopes = "email name"
    client_id        = var.apple_sign_in_service_id
    team_id          = var.apple_team_id
    key_id           = var.apple_sign_in_key_id
    private_key      = var.apple_sign_in_key

    attributes_url_add_attributes = "ignored"
    authorize_url                 = "ignored"
    oidc_issuer                   = "ignored"
    token_request_method          = "ignored"
    token_url                     = "ignored"
  }

  attribute_mapping = {
    email    = "email"
    username = "sub"
    name     = "name"
  }

  lifecycle {
    ignore_changes = [
      provider_details["attributes_url_add_attributes"],
      provider_details["authorize_url"],
      provider_details["oidc_issuer"],
      provider_details["token_request_method"],
      provider_details["token_url"]
    ]
  }
}

resource "aws_cognito_user_pool_domain" "auth" {
  domain          = local.auth_domain
  certificate_arn = aws_acm_certificate.primary-global.arn
  user_pool_id    = aws_cognito_user_pool.users.id

  depends_on = [aws_route53_record.www]
}

resource "aws_route53_record" "auth-cognito-A" {
  name    = aws_cognito_user_pool_domain.auth.domain
  type    = "A"
  zone_id = data.aws_route53_zone.primary.zone_id
  alias {
    evaluate_target_health = false
    name                   = aws_cognito_user_pool_domain.auth.cloudfront_distribution_arn
    # This zone_id is fixed
    zone_id = "Z2FDTNDATAQYW2"
  }
}

locals {
  auto_sign_in_confirmation_url   = "https://${local.app_domain}/${local.auto_sign_in_confirmation_path}"
  manual_sign_in_confurmation_url = "https://${local.app_domain}/${local.manual_sign_in_confirmation_path}"
  mobile_app_auth_url             = "vocably-pro://auth"
}

locals {
  available_urls = concat(
    [
      "https://${local.app_domain}",
      local.auto_sign_in_confirmation_url,
      local.manual_sign_in_confurmation_url,
      local.mobile_app_auth_url
    ],
    local.dev_urls
  )
}

resource "aws_cognito_user_pool_client" "client" {
  name                                 = "vocably-${terraform.workspace}-web"
  user_pool_id                         = aws_cognito_user_pool.users.id
  callback_urls                        = local.available_urls
  logout_urls                          = local.available_urls
  allowed_oauth_flows                  = ["code", "implicit"]
  allowed_oauth_scopes                 = ["profile", "email", "openid", "aws.cognito.signin.user.admin"]
  allowed_oauth_flows_user_pool_client = true
  supported_identity_providers         = ["Google", "SignInWithApple"]
  depends_on                           = [aws_cognito_identity_provider.google]
}

resource "aws_cognito_identity_pool" "users" {
  identity_pool_name               = "vocably-${terraform.workspace}-users"
  allow_unauthenticated_identities = true

  cognito_identity_providers {
    client_id     = aws_cognito_user_pool_client.client.id
    provider_name = aws_cognito_user_pool.users.endpoint
  }
}

resource "aws_iam_role" "user_authenticated" {
  name = "vocably-${terraform.workspace}-cognito-user-authenticated"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "cognito-identity.amazonaws.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "cognito-identity.amazonaws.com:aud": "${aws_cognito_identity_pool.users.id}"
        },
        "ForAnyValue:StringLike": {
          "cognito-identity.amazonaws.com:amr": "authenticated"
        }
      }
    }
  ]
}
EOF
}

resource "aws_iam_role_policy" "user_authenticated" {
  name = "vocably-${terraform.workspace}-user-authenticated"
  role = aws_iam_role.user_authenticated.id

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "cognito-identity:*"
      ],
      "Resource": [
        "*"
      ]
    },
    {
        "Effect": "Allow",
        "Action": [
            "mobiletargeting:UpdateEndpoint",
            "mobiletargeting:PutEvents"
        ],
        "Resource": [
            "${aws_pinpoint_app.mobile_app.arn}*"
        ]
    }
  ]
}
EOF
}

resource "aws_iam_role" "user_unauthenticated" {
  name = "vocably-${terraform.workspace}-cognito-user-unauthenticated"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "cognito-identity.amazonaws.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "cognito-identity.amazonaws.com:aud": "${aws_cognito_identity_pool.users.id}"
        },
        "ForAnyValue:StringLike": {
          "cognito-identity.amazonaws.com:amr": "unauthenticated"
        }
      }
    }
  ]
}
EOF
}

resource "aws_iam_role_policy" "user_unauthenticated" {
  name = "vocably-${terraform.workspace}-user-unauthenticated"
  role = aws_iam_role.user_unauthenticated.id

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "cognito-identity:*"
      ],
      "Resource": [
        "*"
      ]
    },
    {
        "Effect": "Allow",
        "Action": [
            "mobiletargeting:UpdateEndpoint",
            "mobiletargeting:PutEvents"
        ],
        "Resource": [
            "${aws_pinpoint_app.mobile_app.arn}*"
        ]
    }
  ]
}
EOF
}

resource "aws_cognito_identity_pool_roles_attachment" "user" {
  identity_pool_id = aws_cognito_identity_pool.users.id

  roles = {
    authenticated   = aws_iam_role.user_authenticated.arn
    unauthenticated = aws_iam_role.user_unauthenticated.arn
  }
}

resource "aws_cognito_user_pool_ui_customization" "auth" {
  image_file = filebase64("www-logo.png")

  css = file("hosted-ui.css")

  # Refer to the aws_cognito_user_pool_domain resource's
  # user_pool_id attribute to ensure it is in an 'Active' state
  user_pool_id = aws_cognito_user_pool_domain.auth.user_pool_id
}


output "auth_user_pool_id" {
  value = aws_cognito_user_pool.users.id
}

output "auth_client_id" {
  value = aws_cognito_user_pool_client.client.id
}

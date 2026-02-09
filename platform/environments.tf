data "aws_region" "current" {}

locals {
  api_base_url        = "https://${aws_api_gateway_domain_name.api.domain_name}"
  public_api_base_url = "https://${aws_apigatewayv2_domain_name.public_api.domain_name}"
}

locals {
  app_env_content = <<EOT
export const environmentLocal = {
  chromeExtensionId: '${var.chrome_extension_id}',
  safariExtensionId: '${var.safari_extension_id}',
  iosSafariExtensionId: '${var.ios_safari_extension_id}',
  sentryEnvironment: '${var.sentry_environment}',
  wwwBaseUrl: '${local.www_base_url}',
  paddleClientSideToken: '${var.paddle_client_side_token}',
  paddleMonthlyPriceId: '${var.paddle_monthly_premium_id}',
  paddleYearlyPriceId: '${var.paddle_yearly_premium_id}',
  paddleLifetimePriceId: '${var.paddle_lifetime_premium_id}',
  auth: {
    region: '${data.aws_region.current.name}',
    userPoolId: '${aws_cognito_user_pool.users.id}',
    userPoolWebClientId: '${aws_cognito_user_pool_client.client.id}',
    oauth: {
      domain: '${local.auth_domain}',
      scope: ['email', 'profile', 'openid', 'aws.cognito.signin.user.admin'],
      responseType: 'code',
      options: {
        AdvancedSecurityDataCollectionFlag: true,
      },
    },
  },
  api: {
    baseUrl: '${local.api_base_url}',
    publicBaseUrl: '${local.public_api_base_url}',
    region: '${data.aws_region.current.name}',
    cardsBucket: '${aws_s3_bucket.cards.bucket}'
  },
};
  EOT
}

resource "local_file" "app_environment" {
  content  = local.app_env_content
  filename = "${local.app_root}/src/environments/environmentLocal.ts"
}

locals {
  extension_key_json_param = "'\"key\": \"${var.extension_key}\",'"
}

locals {
  extension_env_content = <<EOT
NAME="${var.extension_name}"
KEY=${local.extension_key_json_param}
AUTH_REGION="${data.aws_region.current.name}"
AUTH_USER_POOL_ID="${aws_cognito_user_pool.users.id}"
AUTH_USER_POOL_WEB_CLIENT_ID="${aws_cognito_user_pool_client.client.id}"
APP_BASE_URL="${local.app_url}"
API_BASE_URL="${local.api_base_url}"
PUBLIC_API_BASE_URL="${local.public_api_base_url}"
API_REGION="${data.aws_region.current.name}"
API_CARDS_BUCKET="${aws_s3_bucket.cards.bucket}"
CONTENT_SCRIPT_EXCLUDED_MATCHES='${var.extension_content_script_excluded_matches}'
EXTERNALLY_CONNECTABLE_MATCHES='${var.extension_externally_connectable_matches}'
EXTRA_PERMISSIONS='${var.extension_extra_permissions}'
HOST_PERMISSIONS='${var.extension_host_permissions}'
AUTO_RELOAD="${var.extension_auto_reload}"
  EOT
}

resource "local_file" "extension_environment" {
  content  = local.extension_env_content
  filename = "${local.extension_root}/.env.local"
}

locals {
  google_key_filename = "google-key.json"
}

resource "local_file" "backend_google_key" {
  content  = base64decode(google_service_account_key.credentials.private_key)
  filename = "${local.backend_root}/${local.google_key_filename}"
}

resource "local_file" "analyze_google_key" {
  content  = base64decode(google_service_account_key.credentials.private_key)
  filename = "${local.analyze_root}/${local.google_key_filename}"
}

resource "local_file" "public_backend_key" {
  content  = base64decode(google_service_account_key.credentials.private_key)
  filename = "${local.public_backend_root}/${local.google_key_filename}"
}

locals {
  backend_env_content = <<EOT
GOOGLE_APPLICATION_CREDENTIALS="${local.google_key_filename}"
GOOGLE_PROJECT_ID="${var.gcloud_project_id}"
CONGINOT_USER_POOL_ID="${aws_cognito_user_pool.users.id}"
CANCELLED_SUBCRIPTIONS_TABLE="${aws_dynamodb_table.cancelled_subscriptions.name}"
CARDS_BUCKET="${aws_s3_bucket.cards.bucket}"
CARDS_BACKUP_BUCKET="${aws_s3_bucket.cards_backup.bucket}"
OPENAI_API_KEY="${var.openai_api_key}"
GEMINI_API_KEY="${var.gemini_api_key}"
USER_FILES_BUCKET="${aws_s3_bucket.user_files.bucket}"
BREVO_API_KEY="${var.brevo_api_key}"
NOTIFICATIONS_DYNAMO_TABLE="${aws_dynamodb_table.notifications.name}"
MOBILE_APP_PINPOINT_PROJECT_ID="${aws_pinpoint_app.mobile_app.id}"
UNITS_OF_SPEECH_BUCKET="${aws_s3_bucket.units_of_speech.bucket}"
  EOT
}

resource "local_file" "backend_environment" {
  content  = local.backend_env_content
  filename = "${local.backend_root}/.env.local"
}

locals {
  backend_test_env_content = <<EOT
${local.backend_env_content}
TEST_SKIP_SPEC="false"
  EOT
}

resource "local_file" "backend_test_environment" {
  content  = local.backend_test_env_content
  filename = "${local.backend_root}/.env.test.local"
}

resource "local_file" "analyze_test_environment" {
  content  = local.backend_test_env_content
  filename = "${local.analyze_root}/.env.test.local"
}

locals {
  www_backend_env_content = <<EOT
USER_POOL_ID="${aws_cognito_user_pool.users.id}"
STATIC_USER_FILES_BUCKET="${aws_s3_bucket.user_static_files.bucket}"
REVENUE_CAT_AUTHORIZATION_HEADER="${var.revenue_cat_auth_header}"
PADDLE_API_KEY="${var.paddle_api_key}"
PADDLE_WEBHOOK_SECRET_KEY="${var.paddle_webhook_secret_key}"
  EOT
}

resource "local_file" "www_backend_environment" {
  content  = local.www_backend_env_content
  filename = "${local.www_backend_root}/.env.local"
}

resource "local_file" "www_backend_test_environment" {
  content  = local.www_backend_env_content
  filename = "${local.www_backend_root}/.env.test.local"
}

locals {
  extension_popup_env_content = <<EOT
export const environmentLocal = {
  appBaseUrl: '${local.app_url}',
};
  EOT
}

resource "local_file" "extension_popup_environment" {
  content  = local.extension_popup_env_content
  filename = "${local.extension_popup_root}/src/environments/environmentLocal.ts"
}

locals {
  scripts_environment_content = <<EOT
USERNAME="${var.test_user_username}"
AWS_REGION="${data.aws_region.current.name}"
USER_POOL_ID="${aws_cognito_user_pool.users.id}"
DECKS_BUCKET="${aws_s3_bucket.cards.bucket}"
ENDTEST_APP_ID="${var.endtest_app_id}"
ENDTEST_APP_CODE="${var.endtest_app_code}"
ENDTEST_LATEST_ENV_SUITE="${var.endtest_latest_env_suite}"
  EOT
}

resource "local_file" "e2e_environment" {
  content  = local.scripts_environment_content
  filename = "${local.scripts_root}/.env.local"
}

resource "local_file" "public_backend_google_key" {
  content  = base64decode(google_service_account_key.credentials.private_key)
  filename = "${local.public_backend_root}/${local.google_key_filename}"
}

locals {
  public_backend_env_content = <<EOT
OPENAI_API_KEY="${var.openai_api_key}"
GEMINI_API_KEY="${var.gemini_api_key}"
UNITS_OF_SPEECH_BUCKET="${aws_s3_bucket.units_of_speech.bucket}"
GOOGLE_APPLICATION_CREDENTIALS="${local.google_key_filename}"
GOOGLE_PROJECT_ID="${var.gcloud_project_id}"
  EOT
}

resource "local_file" "public_backend_environment" {
  content  = local.public_backend_env_content
  filename = "${local.public_backend_root}/.env.local"
}

resource "local_file" "public_backend_test_environment" {
  content  = local.public_backend_env_content
  filename = "${local.public_backend_root}/.env.test.local"
}

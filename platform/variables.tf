variable "root_domain" {
  type = string
}

variable "gcloud_project_id" {
  type = string
}

variable "google_oauth2_client_id" {
  type = string
}

variable "google_oauth2_client_secret" {
  type = string
}

variable "apple_sign_in_service_id" {
  type = string
}

variable "apple_team_id" {
  type = string
}

variable "apple_sign_in_key_id" {
  type      = string
  sensitive = true
}

variable "apple_sign_in_key" {
  type      = string
  sensitive = true
}

variable "extension_name_prefix" {
  type = string
}

variable "extension_key" {
  type = string
}

variable "extension_content_script_excluded_matches" {
  type = string
}

variable "extension_externally_connectable_matches" {
  type = string
}

variable "extension_extra_permissions" {
  type = string
}

variable "extension_host_permissions" {
  type = string
}

variable "extension_auto_reload" {
  type = string
}

variable "chrome_extension_id" {
  type = string
}

variable "safari_extension_id" {
  type    = string
  default = "pro.vocably.Vocably.Extension (789D8NRAM6)"
}

variable "ios_safari_extension_id" {
  type    = string
  default = "pro.vocably.app.Vocably-for-Safari (789D8NRAM6)"
}

variable "sentry_environment" {
  type = string
}

variable "umami_website_id" {
  type = string
}

variable "alarm_email" {
  type = string
}

variable "test_user_username" {
  type    = string
  default = "test_dev"
}

variable "test_user_email" {
  type    = string
  default = "test_dev@vocably.pro"
}

variable "test_user_password" {
  type = string
}

variable "endtest_app_id" {
  type    = string
  default = "51386087"
}

variable "endtest_app_code" {
  type = string
}

variable "endtest_latest_env_suite" {
  type = string
}

variable "brevo_api_key" {
  type      = string
  sensitive = true
}

variable "openai_api_key" {
  type      = string
  sensitive = true
}

variable "gemini_api_key" {
  type      = string
  sensitive = true
}

variable "revenue_cat_auth_header" {
  type      = string
  sensitive = true
}

variable "revenue_cat_web_link" {
  type = string
}

variable "paddle_client_side_token" {
  type    = string
  default = "live_813a7ee9405b281277af57927a0"
}

variable "paddle_monthly_premium_id" {
  type    = string
  default = "pri_01jym0ssdz54dmmhk15se4a171"
}

variable "paddle_yearly_premium_id" {
  type    = string
  default = "pri_01jz0q88xn4ba9rnqhq61vhaxf"
}

variable "paddle_lifetime_premium_id" {
  type    = string
  default = "pri_01jz0qapwnkm9xjsjbhd54nr44"
}

variable "paddle_api_key" {
  type      = string
  sensitive = true
}

variable "paddle_webhook_secret_key" {
  type      = string
  sensitive = true
}

variable "public_api_throttle_rate_limit" {
  type    = string
  default = 20
}

variable "public_api_throttle_burst_limit" {
  type    = string
  default = 20
}

# Public API route-specific throttle limits

variable "public_api_analyze_throttle_rate_limit" {
  type    = number
  default = 20
}

variable "public_api_analyze_throttle_burst_limit" {
  type    = number
  default = 20
}

variable "public_api_audio_throttle_rate_limit" {
  type    = number
  default = 20
}

variable "public_api_audio_throttle_burst_limit" {
  type    = number
  default = 20
}

variable "public_api_feedback_throttle_rate_limit" {
  type    = number
  default = 20
}

variable "public_api_feedback_throttle_burst_limit" {
  type    = number
  default = 20
}

variable "public_api_generate_units_of_speech_throttle_rate_limit" {
  type    = number
  default = 20
}

variable "public_api_generate_units_of_speech_throttle_burst_limit" {
  type    = number
  default = 20
}

variable "public_api_analyze_units_of_speech_throttle_rate_limit" {
  type    = number
  default = 20
}

variable "public_api_analyze_units_of_speech_throttle_burst_limit" {
  type    = number
  default = 20
}

variable "public_api_chat_with_card_throttle_rate_limit" {
  type    = number
  default = 20
}

variable "public_api_chat_with_card_throttle_burst_limit" {
  type    = number
  default = 20
}

variable "public_api_predefined_options_throttle_rate_limit" {
  type    = number
  default = 20
}

variable "public_api_predefined_options_throttle_burst_limit" {
  type    = number
  default = 20
}

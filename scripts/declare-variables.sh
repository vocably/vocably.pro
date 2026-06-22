#!/usr/bin/env bash

declare -a variables=(
  "AWS_ACCESS_KEY_ID"
  "AWS_SECRET_ACCESS_KEY"
  "GOOGLE_CREDENTIALS"
  "TF_VAR_google_oauth2_client_secret"
  "TF_VAR_test_user_password"
  "TF_VAR_endtest_app_code"
  "TF_VAR_apple_sign_in_key_id"
  "TF_VAR_apple_sign_in_key"
  "TF_VAR_brevo_api_key"
  "TF_VAR_openai_api_key"
  "TF_VAR_gemini_api_key"
  "TF_VAR_revenue_cat_auth_header"
  "TF_VAR_revenue_cat_web_link"
  "TF_VAR_paddle_api_key"
  "TF_VAR_paddle_webhook_secret_key"
  "TF_VAR_google_tts_api_key"
  "APP_STORE_CONNECT_API_KEY_KEY_ID"
  "APP_STORE_CONNECT_API_KEY_ISSUER_ID"
  "APP_STORE_CONNECT_API_KEY_KEY"
  "APP_STORE_CONNECT_API_KEY_IN_HOUSE"
  "FASTFILE_APP_IDENTIFIER"
  "FASTFILE_GIT_URL"
  "FASTFILE_GYM_EXPORT_METHOD"
  "FASTFILE_ITC_TEAM_ID"
  "FASTFILE_MATCH_TYPE"
  "FASTFILE_TEAM_ID"
  "FASTFILE_USERNAME"
)

for variable in "${variables[@]}"
do
   envVar="${ENV_NAME}_${variable}"
   echo "export ${variable}='${!envVar}'" >> $BASH_ENV
done

env_name=$(echo "$ENV_NAME" | tr '[:upper:]' '[:lower:]')
echo "export env_name=${env_name}" >> $BASH_ENV

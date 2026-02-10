#!/usr/bin/env bash

cd ./platform
terraform init -backend-config=./env-${env_name}.remote
terraform workspace select ${env_name}
terraform apply \
  -target=aws_apigatewayv2_api_mapping.public_api \
  -target=aws_api_gateway_base_path_mapping.deployment \
  -var-file="env-${env_name}.tfvars" \
  -auto-approve

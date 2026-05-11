resource "aws_s3_bucket" "user_static_files" {
  bucket = "vocably-${terraform.workspace}-user-static-files"
}

resource "aws_s3_bucket_acl" "user_static_files" {
  bucket = aws_s3_bucket.user_static_files.bucket

  acl = "private"

  depends_on = [aws_s3_bucket_ownership_controls.user_static_files]
}

resource "aws_s3_bucket_ownership_controls" "user_static_files" {
  bucket = aws_s3_bucket.user_static_files.id
  rule {
    object_ownership = "ObjectWriter"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "user_static_files" {
  bucket = aws_s3_bucket.user_static_files.bucket

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_versioning" "user_static_files" {
  bucket = aws_s3_bucket.user_static_files.bucket

  versioning_configuration {
    status = "Suspended"
  }
}

resource "aws_s3_bucket_cors_configuration" "user_static_files" {
  bucket = aws_s3_bucket.user_static_files.bucket

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "HEAD"]
    allowed_origins = ["*"]
  }
}

resource "aws_iam_role" "user_static_files_api_bucket" {
  name               = "vocably-${terraform.workspace}-api-gw-user-statis-files-bucket"
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": [
          "s3.amazonaws.com",
          "apigateway.amazonaws.com"
        ]
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

resource "aws_iam_policy" "user_static_files_api_bucket" {
  name = "vocably-${terraform.workspace}-api-gw-user-statis-files-bucket-policy"
  policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement" : [
      {
        "Sid" : "UserFilesBucket",
        "Effect" : "Allow",
        "Action" : [
          "s3:*"
        ],
        "Resource" : [
          aws_s3_bucket.user_static_files.arn,
          "${aws_s3_bucket.user_static_files.arn}/*"
        ]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "user_static_files_api_bucket" {
  role       = aws_iam_role.user_static_files_api_bucket.name
  policy_arn = aws_iam_policy.user_static_files_api_bucket.arn
}

resource "aws_api_gateway_resource" "user_static_files" {
  rest_api_id = aws_api_gateway_rest_api.rest_api.id
  parent_id   = aws_api_gateway_rest_api.rest_api.root_resource_id
  path_part   = "static-files"
}

module "user_static_files_cors" {
  source  = "squidfunk/api-gateway-enable-cors/aws"
  version = "0.3.3"

  api_id          = aws_api_gateway_rest_api.rest_api.id
  api_resource_id = aws_api_gateway_resource.user_static_files.id
}

resource "aws_api_gateway_resource" "static_user_file" {
  rest_api_id = aws_api_gateway_rest_api.rest_api.id
  parent_id   = aws_api_gateway_resource.user_static_files.id
  path_part   = "{userFile}"
}

module "static_user_file_cors" {
  source  = "squidfunk/api-gateway-enable-cors/aws"
  version = "0.3.3"

  api_id          = aws_api_gateway_rest_api.rest_api.id
  api_resource_id = aws_api_gateway_resource.static_user_file.id
}

// Get static_user_file:

resource "aws_api_gateway_method" "get_static_user_file" {
  rest_api_id   = aws_api_gateway_rest_api.rest_api.id
  resource_id   = aws_api_gateway_resource.static_user_file.id
  http_method   = "GET"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.rest_api_cognito.id

  request_parameters = {
    "method.request.path.userFile" = true
  }
}

resource "aws_api_gateway_method_response" "get_static_user_file_200" {
  rest_api_id = aws_api_gateway_rest_api.rest_api.id
  resource_id = aws_api_gateway_method.get_static_user_file.resource_id
  http_method = aws_api_gateway_method.get_static_user_file.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
    "method.response.header.Timestamp"                   = true
    "method.response.header.Content-Length"              = true
    "method.response.header.Content-Type"                = true
  }

  response_models = {
    "application/json" = "Empty"
  }
}

resource "aws_api_gateway_method_response" "get_static_user_file_204" {
  rest_api_id = aws_api_gateway_rest_api.rest_api.id
  resource_id = aws_api_gateway_method.get_static_user_file.resource_id
  http_method = aws_api_gateway_method.get_static_user_file.http_method
  status_code = "204"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
    "method.response.header.Timestamp"                   = true
    "method.response.header.Content-Length"              = true
    "method.response.header.Content-Type"                = true
  }

  response_models = {
    "text/plain" = "Empty"
  }
}

resource "aws_api_gateway_integration" "get_static_user_file" {
  rest_api_id             = aws_api_gateway_rest_api.rest_api.id
  resource_id             = aws_api_gateway_method.get_static_user_file.resource_id
  http_method             = aws_api_gateway_method.get_static_user_file.http_method
  type                    = "AWS"
  integration_http_method = "GET"
  uri                     = "arn:aws:apigateway:${data.aws_region.current.region}:s3:path/${aws_s3_bucket.user_static_files.bucket}/{userId}/{userFile}"
  credentials             = aws_iam_role.user_static_files_api_bucket.arn

  request_parameters = {
    "integration.request.path.userId"   = "context.authorizer.claims.sub",
    "integration.request.path.userFile" = "method.request.path.userFile"
  }
}

resource "aws_api_gateway_integration_response" "get_static_user_file_200" {
  depends_on = [aws_api_gateway_integration.get_static_user_file]

  rest_api_id = aws_api_gateway_rest_api.rest_api.id
  resource_id = aws_api_gateway_method.get_static_user_file.resource_id
  http_method = aws_api_gateway_method.get_static_user_file.http_method
  status_code = aws_api_gateway_method_response.get_static_user_file_200.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
    "method.response.header.Timestamp"                   = "integration.response.header.Date"
    "method.response.header.Content-Length"              = "integration.response.header.Content-Length"
    "method.response.header.Content-Type"                = "integration.response.header.Content-Type"
  }
}

resource "aws_api_gateway_integration_response" "get_static_user_file_4xx" {
  depends_on = [aws_api_gateway_integration.get_static_user_file]

  rest_api_id = aws_api_gateway_rest_api.rest_api.id
  resource_id = aws_api_gateway_method.get_static_user_file.resource_id
  http_method = aws_api_gateway_method.get_static_user_file.http_method
  status_code = aws_api_gateway_method_response.get_static_user_file_204.status_code

  selection_pattern = "4\\d{2}"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
  }
}

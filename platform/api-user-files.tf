locals {
  user_files_bucket_name = "vocably-${terraform.workspace}-user-files"
}

resource "aws_s3_bucket" "user_files" {
  bucket = local.user_files_bucket_name
}

resource "aws_s3_bucket_acl" "user_files" {
  bucket = aws_s3_bucket.user_files.bucket

  acl = "private"

  depends_on = [aws_s3_bucket_ownership_controls.user_files]
}

resource "aws_s3_bucket_ownership_controls" "user_files" {
  bucket = aws_s3_bucket.user_files.id
  rule {
    object_ownership = "ObjectWriter"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "user_files" {
  bucket = aws_s3_bucket.user_files.bucket

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_versioning" "user_files" {
  bucket = aws_s3_bucket.user_files.bucket

  versioning_configuration {
    status = "Suspended"
  }
}

resource "aws_s3_bucket_cors_configuration" "user_files" {
  bucket = aws_s3_bucket.user_files.bucket

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["PUT", "POST", "GET", "DELETE", "HEAD"]
    allowed_origins = ["*"]
  }
}

resource "aws_iam_role" "user_files_api_bucket" {
  name               = "vocably-${terraform.workspace}-api-gw-user-files-bucket"
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

resource "aws_iam_policy" "user_files_api_bucket" {
  name = "vocably-${terraform.workspace}-api-gw-user-files-bucket-policy"
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
          aws_s3_bucket.user_files.arn,
          "${aws_s3_bucket.user_files.arn}/*"
        ]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "user_files_api_bucket" {
  role       = aws_iam_role.user_files_api_bucket.name
  policy_arn = aws_iam_policy.user_files_api_bucket.arn
}

resource "aws_api_gateway_resource" "user_files" {
  rest_api_id = aws_api_gateway_rest_api.rest_api.id
  parent_id   = aws_api_gateway_rest_api.rest_api.root_resource_id
  path_part   = "files"
}

module "user_files_cors" {
  source  = "squidfunk/api-gateway-enable-cors/aws"
  version = "0.3.3"

  api_id          = aws_api_gateway_rest_api.rest_api.id
  api_resource_id = aws_api_gateway_resource.user_files.id
}

resource "aws_api_gateway_resource" "user_file" {
  rest_api_id = aws_api_gateway_rest_api.rest_api.id
  parent_id   = aws_api_gateway_resource.user_files.id
  path_part   = "{userFile}"
}

module "user_file_cors" {
  source  = "squidfunk/api-gateway-enable-cors/aws"
  version = "0.3.3"

  api_id          = aws_api_gateway_rest_api.rest_api.id
  api_resource_id = aws_api_gateway_resource.user_file.id
}

// Put user_file:

resource "aws_api_gateway_method" "put_user_file" {
  rest_api_id   = aws_api_gateway_rest_api.rest_api.id
  resource_id   = aws_api_gateway_resource.user_file.id
  http_method   = "PUT"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.rest_api_cognito.id

  request_parameters = {
    "method.request.path.userFile" = true
  }
}

resource "aws_api_gateway_method_response" "put_user_file_200" {
  rest_api_id = aws_api_gateway_rest_api.rest_api.id
  resource_id = aws_api_gateway_method.put_user_file.resource_id
  http_method = aws_api_gateway_method.put_user_file.http_method
  status_code = "200"

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

resource "aws_api_gateway_integration" "put_user_file" {
  rest_api_id             = aws_api_gateway_rest_api.rest_api.id
  resource_id             = aws_api_gateway_method.put_user_file.resource_id
  http_method             = aws_api_gateway_method.put_user_file.http_method
  type                    = "AWS"
  integration_http_method = "PUT"
  uri                     = "arn:aws:apigateway:${data.aws_region.current.region}:s3:path/${aws_s3_bucket.user_files.bucket}/{userId}/files/{userFile}"
  credentials             = aws_iam_role.user_files_api_bucket.arn

  request_parameters = {
    "integration.request.path.userId"   = "context.authorizer.claims.sub",
    "integration.request.path.userFile" = "method.request.path.userFile"
  }
}

resource "aws_api_gateway_integration_response" "put_user_file_200" {
  depends_on = [aws_api_gateway_integration.put_user_file]

  rest_api_id = aws_api_gateway_rest_api.rest_api.id
  resource_id = aws_api_gateway_method.put_user_file.resource_id
  http_method = aws_api_gateway_method.put_user_file.http_method
  status_code = aws_api_gateway_method_response.put_user_file_200.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
    "method.response.header.Timestamp"                   = "integration.response.header.Date"
    "method.response.header.Content-Length"              = "integration.response.header.Content-Length"
    "method.response.header.Content-Type"                = "integration.response.header.Content-Type"
  }
}

// Get user_file:

resource "aws_api_gateway_method" "get_user_file" {
  rest_api_id   = aws_api_gateway_rest_api.rest_api.id
  resource_id   = aws_api_gateway_resource.user_file.id
  http_method   = "GET"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.rest_api_cognito.id

  request_parameters = {
    "method.request.path.userFile" = true
  }
}

resource "aws_api_gateway_method_response" "get_user_file_200" {
  rest_api_id = aws_api_gateway_rest_api.rest_api.id
  resource_id = aws_api_gateway_method.get_user_file.resource_id
  http_method = aws_api_gateway_method.get_user_file.http_method
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

resource "aws_api_gateway_method_response" "get_user_file_204" {
  rest_api_id = aws_api_gateway_rest_api.rest_api.id
  resource_id = aws_api_gateway_method.get_user_file.resource_id
  http_method = aws_api_gateway_method.get_user_file.http_method
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

resource "aws_api_gateway_integration" "get_user_file" {
  rest_api_id             = aws_api_gateway_rest_api.rest_api.id
  resource_id             = aws_api_gateway_method.get_user_file.resource_id
  http_method             = aws_api_gateway_method.get_user_file.http_method
  type                    = "AWS"
  integration_http_method = "GET"
  uri                     = "arn:aws:apigateway:${data.aws_region.current.region}:s3:path/${aws_s3_bucket.user_files.bucket}/{userId}/files/{userFile}"
  credentials             = aws_iam_role.user_files_api_bucket.arn

  request_parameters = {
    "integration.request.path.userId"   = "context.authorizer.claims.sub",
    "integration.request.path.userFile" = "method.request.path.userFile"
  }
}

resource "aws_api_gateway_integration_response" "get_user_file_200" {
  depends_on = [aws_api_gateway_integration.get_user_file]

  rest_api_id = aws_api_gateway_rest_api.rest_api.id
  resource_id = aws_api_gateway_method.get_user_file.resource_id
  http_method = aws_api_gateway_method.get_user_file.http_method
  status_code = aws_api_gateway_method_response.get_user_file_200.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
    "method.response.header.Timestamp"                   = "integration.response.header.Date"
    "method.response.header.Content-Length"              = "integration.response.header.Content-Length"
    "method.response.header.Content-Type"                = "integration.response.header.Content-Type"
  }
}

resource "aws_api_gateway_integration_response" "get_user_file_4xx" {
  depends_on = [aws_api_gateway_integration.get_user_file]

  rest_api_id = aws_api_gateway_rest_api.rest_api.id
  resource_id = aws_api_gateway_method.get_user_file.resource_id
  http_method = aws_api_gateway_method.get_user_file.http_method
  status_code = aws_api_gateway_method_response.get_user_file_204.status_code

  selection_pattern = "4\\d{2}"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
  }
}

// Delete user_file:

resource "aws_api_gateway_method" "delete_user_file" {
  rest_api_id   = aws_api_gateway_rest_api.rest_api.id
  resource_id   = aws_api_gateway_resource.user_file.id
  http_method   = "DELETE"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.rest_api_cognito.id

  request_parameters = {
    "method.request.path.userFile" = true
  }
}

resource "aws_api_gateway_method_response" "delete_user_file_200" {
  rest_api_id = aws_api_gateway_rest_api.rest_api.id
  resource_id = aws_api_gateway_method.delete_user_file.resource_id
  http_method = aws_api_gateway_method.delete_user_file.http_method
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

resource "aws_api_gateway_integration" "delete_user_file" {
  rest_api_id             = aws_api_gateway_rest_api.rest_api.id
  resource_id             = aws_api_gateway_method.delete_user_file.resource_id
  http_method             = aws_api_gateway_method.delete_user_file.http_method
  type                    = "AWS"
  integration_http_method = "DELETE"
  uri                     = "arn:aws:apigateway:${data.aws_region.current.region}:s3:path/${aws_s3_bucket.user_files.bucket}/{userId}/files/{userFile}"
  credentials             = aws_iam_role.user_files_api_bucket.arn

  request_parameters = {
    "integration.request.path.userId"   = "context.authorizer.claims.sub",
    "integration.request.path.userFile" = "method.request.path.userFile"
  }
}

resource "aws_api_gateway_integration_response" "delete_user_file_200" {
  depends_on = [aws_api_gateway_integration.delete_user_file]

  rest_api_id = aws_api_gateway_rest_api.rest_api.id
  resource_id = aws_api_gateway_method.delete_user_file.resource_id
  http_method = aws_api_gateway_method.delete_user_file.http_method
  status_code = aws_api_gateway_method_response.delete_user_file_200.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
    "method.response.header.Timestamp"                   = "integration.response.header.Date"
    "method.response.header.Content-Length"              = "integration.response.header.Content-Length"
    "method.response.header.Content-Type"                = "integration.response.header.Content-Type"
  }
}


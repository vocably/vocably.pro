resource "aws_s3_bucket" "public_static_files" {
  bucket = "vocably-${terraform.workspace}-public-static-files"
}

resource "aws_s3_bucket_acl" "public_static_files" {
  bucket = aws_s3_bucket.public_static_files.bucket

  acl = "private"

  depends_on = [aws_s3_bucket_ownership_controls.public_static_files]
}

resource "aws_s3_bucket_ownership_controls" "public_static_files" {
  bucket = aws_s3_bucket.public_static_files.id
  rule {
    object_ownership = "ObjectWriter"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "public_static_files" {
  bucket = aws_s3_bucket.public_static_files.bucket

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_versioning" "public_static_files" {
  bucket = aws_s3_bucket.public_static_files.bucket

  versioning_configuration {
    status = "Suspended"
  }
}

resource "aws_s3_bucket_cors_configuration" "public_static_files" {
  bucket = aws_s3_bucket.public_static_files.bucket

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "HEAD"]
    allowed_origins = ["*"]
  }
}

resource "aws_iam_role" "public_static_files_api_bucket" {
  name               = "vocably-${terraform.workspace}-api-gw-public-static-files-bucket"
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

resource "aws_iam_policy" "public_static_files_api_bucket" {
  name = "vocably-${terraform.workspace}-api-gw-public-static-files-bucket-policy"
  policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement" : [
      {
        "Sid" : "PublicFilesBucket",
        "Effect" : "Allow",
        "Action" : [
          "s3:GetObject"
        ],
        "Resource" : [
          aws_s3_bucket.public_static_files.arn,
          "${aws_s3_bucket.public_static_files.arn}/*"
        ]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "public_static_files_api_bucket" {
  role       = aws_iam_role.public_static_files_api_bucket.name
  policy_arn = aws_iam_policy.public_static_files_api_bucket.arn
}

resource "aws_api_gateway_resource" "public_static_files" {
  rest_api_id = aws_api_gateway_rest_api.rest_api.id
  parent_id   = aws_api_gateway_rest_api.rest_api.root_resource_id
  path_part   = "public-static-files"
}

module "public_static_files_cors" {
  source  = "squidfunk/api-gateway-enable-cors/aws"
  version = "0.3.3"

  api_id          = aws_api_gateway_rest_api.rest_api.id
  api_resource_id = aws_api_gateway_resource.public_static_files.id
}

resource "aws_api_gateway_resource" "public_static_file" {
  rest_api_id = aws_api_gateway_rest_api.rest_api.id
  parent_id   = aws_api_gateway_resource.public_static_files.id
  path_part   = "{proxy+}"
}

module "public_static_file_cors" {
  source  = "squidfunk/api-gateway-enable-cors/aws"
  version = "0.3.3"

  api_id          = aws_api_gateway_rest_api.rest_api.id
  api_resource_id = aws_api_gateway_resource.public_static_file.id
}

// Get public_static_file:

resource "aws_api_gateway_method" "get_public_static_file" {
  rest_api_id   = aws_api_gateway_rest_api.rest_api.id
  resource_id   = aws_api_gateway_resource.public_static_file.id
  http_method   = "GET"
  authorization = "NONE"

  request_parameters = {
    "method.request.path.proxy" = true
  }
}

resource "aws_api_gateway_method_response" "get_public_static_file_200" {
  rest_api_id = aws_api_gateway_rest_api.rest_api.id
  resource_id = aws_api_gateway_method.get_public_static_file.resource_id
  http_method = aws_api_gateway_method.get_public_static_file.http_method
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

resource "aws_api_gateway_method_response" "get_public_static_file_404" {
  rest_api_id = aws_api_gateway_rest_api.rest_api.id
  resource_id = aws_api_gateway_method.get_public_static_file.resource_id
  http_method = aws_api_gateway_method.get_public_static_file.http_method
  status_code = "404"

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

resource "aws_api_gateway_integration" "get_public_static_file" {
  rest_api_id             = aws_api_gateway_rest_api.rest_api.id
  resource_id             = aws_api_gateway_method.get_public_static_file.resource_id
  http_method             = aws_api_gateway_method.get_public_static_file.http_method
  type                    = "AWS"
  integration_http_method = "GET"
  uri                     = "arn:aws:apigateway:${data.aws_region.current.name}:s3:path/${aws_s3_bucket.public_static_files.bucket}/{file}"
  credentials             = aws_iam_role.public_static_files_api_bucket.arn

  request_parameters = {
    "integration.request.path.file" = "method.request.path.proxy"
  }
}

resource "aws_api_gateway_integration_response" "get_public_static_file_200" {
  depends_on = [aws_api_gateway_integration.get_public_static_file]

  rest_api_id = aws_api_gateway_rest_api.rest_api.id
  resource_id = aws_api_gateway_method.get_public_static_file.resource_id
  http_method = aws_api_gateway_method.get_public_static_file.http_method
  status_code = aws_api_gateway_method_response.get_public_static_file_200.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
    "method.response.header.Timestamp"                   = "integration.response.header.Date"
    "method.response.header.Content-Length"              = "integration.response.header.Content-Length"
    "method.response.header.Content-Type"                = "integration.response.header.Content-Type"
  }
}

resource "aws_api_gateway_integration_response" "get_public_static_file_404" {
  depends_on = [aws_api_gateway_integration.get_public_static_file]

  rest_api_id = aws_api_gateway_rest_api.rest_api.id
  resource_id = aws_api_gateway_method.get_public_static_file.resource_id
  http_method = aws_api_gateway_method.get_public_static_file.http_method
  status_code = aws_api_gateway_method_response.get_public_static_file_404.status_code

  selection_pattern = "4\\d{2}"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
  }
}

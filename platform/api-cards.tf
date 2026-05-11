locals {
  cards_bucket_name = "vocably-${terraform.workspace}-cards"
}

resource "aws_s3_bucket" "cards" {
  bucket = local.cards_bucket_name
}

resource "aws_s3_bucket_acl" "cards" {
  bucket = aws_s3_bucket.cards.bucket

  acl = "private"
}

resource "aws_s3_bucket_server_side_encryption_configuration" "cards" {
  bucket = aws_s3_bucket.cards.bucket

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_versioning" "cards" {
  bucket = aws_s3_bucket.cards.bucket

  versioning_configuration {
    status = "Suspended"
  }
}

resource "aws_s3_bucket_cors_configuration" "cards" {
  bucket = aws_s3_bucket.cards.bucket

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["PUT", "POST", "GET", "DELETE", "HEAD"]
    allowed_origins = ["*"]
  }
}

resource "aws_iam_role" "cards_api_bucket" {
  name               = "vocably-${terraform.workspace}-api-gw-cards-bucket"
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

resource "aws_iam_policy" "cards_api_bucket" {
  name = "vocably-${terraform.workspace}-api-gw-cards-bucket-policy"
  policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement" : [
      {
        "Sid" : "CardsBucket",
        "Effect" : "Allow",
        "Action" : [
          "s3:*"
        ],
        "Resource" : [
          aws_s3_bucket.cards.arn,
          "${aws_s3_bucket.cards.arn}/*"
        ]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "cards_api_bucket" {
  role       = aws_iam_role.cards_api_bucket.name
  policy_arn = aws_iam_policy.cards_api_bucket.arn
}

resource "aws_api_gateway_resource" "all_languages" {
  rest_api_id = aws_api_gateway_rest_api.rest_api.id
  parent_id   = aws_api_gateway_rest_api.rest_api.root_resource_id
  path_part   = "languages"
}

module "all_languages_cors" {
  source  = "squidfunk/api-gateway-enable-cors/aws"
  version = "0.3.3"

  api_id          = aws_api_gateway_rest_api.rest_api.id
  api_resource_id = aws_api_gateway_resource.all_languages.id
}

resource "aws_api_gateway_resource" "language" {
  rest_api_id = aws_api_gateway_rest_api.rest_api.id
  parent_id   = aws_api_gateway_resource.all_languages.id
  path_part   = "{language}"
}

module "language_cors" {
  source  = "squidfunk/api-gateway-enable-cors/aws"
  version = "0.3.3"

  api_id          = aws_api_gateway_rest_api.rest_api.id
  api_resource_id = aws_api_gateway_resource.language.id
  allow_headers = [
    "Content-Encoding",
    "Authorization",
    "Content-Type",
    "X-Amz-Date",
    "X-Amz-Security-Token",
    "X-Api-Key",
  ]
}

// Put language:

resource "aws_api_gateway_method" "put_language" {
  rest_api_id   = aws_api_gateway_rest_api.rest_api.id
  resource_id   = aws_api_gateway_resource.language.id
  http_method   = "PUT"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.rest_api_cognito.id

  request_parameters = {
    "method.request.path.language" = true
  }
}

resource "aws_api_gateway_method_response" "put_language_200" {
  rest_api_id = aws_api_gateway_rest_api.rest_api.id
  resource_id = aws_api_gateway_method.put_language.resource_id
  http_method = aws_api_gateway_method.put_language.http_method
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

resource "aws_api_gateway_integration" "put_language" {
  rest_api_id             = aws_api_gateway_rest_api.rest_api.id
  resource_id             = aws_api_gateway_method.put_language.resource_id
  http_method             = aws_api_gateway_method.put_language.http_method
  type                    = "AWS"
  integration_http_method = "PUT"
  uri                     = "arn:aws:apigateway:${data.aws_region.current.region}:s3:path/${aws_s3_bucket.cards.bucket}/{userId}/languages/{language}"
  credentials             = aws_iam_role.cards_api_bucket.arn

  request_parameters = {
    "integration.request.path.userId"   = "context.authorizer.claims.sub",
    "integration.request.path.language" = "method.request.path.language"
  }
}

resource "aws_api_gateway_integration_response" "put_language_200" {
  depends_on = [aws_api_gateway_integration.put_language]

  rest_api_id = aws_api_gateway_rest_api.rest_api.id
  resource_id = aws_api_gateway_method.put_language.resource_id
  http_method = aws_api_gateway_method.put_language.http_method
  status_code = aws_api_gateway_method_response.put_language_200.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
    "method.response.header.Timestamp"                   = "integration.response.header.Date"
    "method.response.header.Content-Length"              = "integration.response.header.Content-Length"
    "method.response.header.Content-Type"                = "integration.response.header.Content-Type"
  }
}

// Get language:

resource "aws_api_gateway_method" "get_language" {
  rest_api_id   = aws_api_gateway_rest_api.rest_api.id
  resource_id   = aws_api_gateway_resource.language.id
  http_method   = "GET"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.rest_api_cognito.id

  request_parameters = {
    "method.request.path.language" = true
  }
}

resource "aws_api_gateway_method_response" "get_language_200" {
  rest_api_id = aws_api_gateway_rest_api.rest_api.id
  resource_id = aws_api_gateway_method.get_language.resource_id
  http_method = aws_api_gateway_method.get_language.http_method
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

resource "aws_api_gateway_method_response" "get_language_204" {
  rest_api_id = aws_api_gateway_rest_api.rest_api.id
  resource_id = aws_api_gateway_method.get_language.resource_id
  http_method = aws_api_gateway_method.get_language.http_method
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

resource "aws_api_gateway_integration" "get_language" {
  rest_api_id             = aws_api_gateway_rest_api.rest_api.id
  resource_id             = aws_api_gateway_method.get_language.resource_id
  http_method             = aws_api_gateway_method.get_language.http_method
  type                    = "AWS"
  integration_http_method = "GET"
  uri                     = "arn:aws:apigateway:${data.aws_region.current.region}:s3:path/${aws_s3_bucket.cards.bucket}/{userId}/languages/{language}"
  credentials             = aws_iam_role.cards_api_bucket.arn

  request_parameters = {
    "integration.request.path.userId"   = "context.authorizer.claims.sub",
    "integration.request.path.language" = "method.request.path.language"
  }
}

resource "aws_api_gateway_integration_response" "get_language_200" {
  depends_on = [aws_api_gateway_integration.get_language]

  rest_api_id = aws_api_gateway_rest_api.rest_api.id
  resource_id = aws_api_gateway_method.get_language.resource_id
  http_method = aws_api_gateway_method.get_language.http_method
  status_code = aws_api_gateway_method_response.get_language_200.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
    "method.response.header.Timestamp"                   = "integration.response.header.Date"
    "method.response.header.Content-Length"              = "integration.response.header.Content-Length"
    "method.response.header.Content-Type"                = "integration.response.header.Content-Type"
  }
}

resource "aws_api_gateway_integration_response" "get_language_4xx" {
  depends_on = [aws_api_gateway_integration.get_language]

  rest_api_id = aws_api_gateway_rest_api.rest_api.id
  resource_id = aws_api_gateway_method.get_language.resource_id
  http_method = aws_api_gateway_method.get_language.http_method
  status_code = aws_api_gateway_method_response.get_language_204.status_code

  selection_pattern = "4\\d{2}"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
  }
}

// Delete language:

resource "aws_api_gateway_method" "delete_language" {
  rest_api_id   = aws_api_gateway_rest_api.rest_api.id
  resource_id   = aws_api_gateway_resource.language.id
  http_method   = "DELETE"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.rest_api_cognito.id

  request_parameters = {
    "method.request.path.language" = true
  }
}

resource "aws_api_gateway_method_response" "delete_language_200" {
  rest_api_id = aws_api_gateway_rest_api.rest_api.id
  resource_id = aws_api_gateway_method.delete_language.resource_id
  http_method = aws_api_gateway_method.delete_language.http_method
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

resource "aws_api_gateway_integration" "delete_language" {
  rest_api_id             = aws_api_gateway_rest_api.rest_api.id
  resource_id             = aws_api_gateway_method.delete_language.resource_id
  http_method             = aws_api_gateway_method.delete_language.http_method
  type                    = "AWS"
  integration_http_method = "DELETE"
  uri                     = "arn:aws:apigateway:${data.aws_region.current.region}:s3:path/${aws_s3_bucket.cards.bucket}/{userId}/languages/{language}"
  credentials             = aws_iam_role.cards_api_bucket.arn

  request_parameters = {
    "integration.request.path.userId"   = "context.authorizer.claims.sub",
    "integration.request.path.language" = "method.request.path.language"
  }
}

resource "aws_api_gateway_integration_response" "delete_language_200" {
  depends_on = [aws_api_gateway_integration.delete_language]

  rest_api_id = aws_api_gateway_rest_api.rest_api.id
  resource_id = aws_api_gateway_method.delete_language.resource_id
  http_method = aws_api_gateway_method.delete_language.http_method
  status_code = aws_api_gateway_method_response.delete_language_200.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
    "method.response.header.Timestamp"                   = "integration.response.header.Date"
    "method.response.header.Content-Length"              = "integration.response.header.Content-Length"
    "method.response.header.Content-Type"                = "integration.response.header.Content-Type"
  }
}

// List languages:

resource "aws_api_gateway_method" "list_languages" {
  rest_api_id   = aws_api_gateway_rest_api.rest_api.id
  resource_id   = aws_api_gateway_resource.all_languages.id
  http_method   = "GET"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.rest_api_cognito.id

  request_parameters = {
    "method.request.path.language" = true
  }
}

resource "aws_api_gateway_method_response" "list_languages_200" {
  rest_api_id = aws_api_gateway_rest_api.rest_api.id
  resource_id = aws_api_gateway_method.list_languages.resource_id
  http_method = aws_api_gateway_method.list_languages.http_method
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

resource "aws_api_gateway_integration" "list_languages" {
  rest_api_id             = aws_api_gateway_rest_api.rest_api.id
  resource_id             = aws_api_gateway_method.list_languages.resource_id
  http_method             = aws_api_gateway_method.list_languages.http_method
  type                    = "AWS"
  integration_http_method = "GET"
  uri                     = "arn:aws:apigateway:${data.aws_region.current.region}:s3:path/${aws_s3_bucket.cards.bucket}"
  credentials             = aws_iam_role.cards_api_bucket.arn

  request_parameters = {
    "integration.request.querystring.prefix" = "context.authorizer.claims.sub"
  }
}

resource "aws_api_gateway_integration_response" "list_languages_200" {
  depends_on = [aws_api_gateway_integration.list_languages]

  rest_api_id = aws_api_gateway_rest_api.rest_api.id
  resource_id = aws_api_gateway_method.list_languages.resource_id
  http_method = aws_api_gateway_method.list_languages.http_method
  status_code = aws_api_gateway_method_response.list_languages_200.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
    "method.response.header.Timestamp"                   = "integration.response.header.Date"
    "method.response.header.Content-Length"              = "integration.response.header.Content-Length"
    "method.response.header.Content-Type"                = "integration.response.header.Content-Type"
  }
}

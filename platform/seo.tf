# SEO search pages: /<source>-<target>/<word>-in-<language>.html, e.g.
# /de-en/apple-in-german.html.
#
# The pages are rendered on demand by the seo-render lambda from the data the
# analyze lambdas have stored in the units-of-speech bucket (never with AI)
# and cached by the www CloudFront distribution until they are invalidated:
#
# - by the www deploy (www_upload invalidates "/*"), since every page embeds
#   the search page template and its hashed assets;
# - by the seo-invalidate lambda, when a units-of-speech key that a page was
#   built from (or looked for and didn't find) is written or deleted.
#
# Language pairs and their word lists are configured in
# scripts/seo/language-pairs.json, which the www build reads as well to
# generate the sitemaps.

locals {
  seo_backend_root = abspath("../packages/seo-backend")
  seo_bucket       = "vocably-${terraform.workspace}-seo-pages"

  seo_language_pairs = {
    for pair in jsondecode(file("${local.scripts_root}/seo/language-pairs.json")) :
    "${pair.sourceLanguage}-${pair.targetLanguage}" => pair
  }

  seo_source_languages = distinct([
    for pair in values(local.seo_language_pairs) : pair.sourceLanguage
  ])

  # The units-of-speech keys the pages are built from (see
  # packages/seo-backend/src/buildTranslationCards.ts). S3 rejects overlapping
  # notification prefixes, hence distinct source languages.
  seo_dependency_prefixes = concat(
    [
      for pair in values(local.seo_language_pairs) :
      "_reverse-translations/${lower(pair.sourceLanguage)}/${lower(pair.targetLanguage)}/"
    ],
    flatten([
      for language in local.seo_source_languages : [
        "${lower(language)}/units-of-speech/",
        "${lower(language)}/translations/",
      ]
    ]),
  )
}

data "external" "seo_backend_build" {
  # Chained after the www build so the builds don't compete for memory.
  depends_on = [data.external.www_build]
  program = ["bash", "-lc", <<EOT
(NODE_OPTIONS=--max-old-space-size=1024 npm run build --loglevel verbose) >&2 && echo "{\"dest\": \"dist\"}"
EOT
  ]
  working_dir = local.seo_backend_root
}

data "archive_file" "seo_backend_build" {
  depends_on  = [data.external.seo_backend_build]
  type        = "zip"
  source_dir  = "${data.external.seo_backend_build.working_dir}/${data.external.seo_backend_build.result.dest}"
  output_path = "seo_backend_build.zip"
}

# Word lists and the dependency index of the rendered pages. Nothing here is
# public.
resource "aws_s3_bucket" "seo" {
  bucket        = local.seo_bucket
  force_destroy = true
}

resource "aws_s3_bucket_public_access_block" "seo" {
  bucket = aws_s3_bucket.seo.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_object" "seo_words" {
  for_each = local.seo_language_pairs

  bucket       = aws_s3_bucket.seo.id
  key          = "words/${each.key}.json"
  source       = "${local.scripts_root}/seo/${each.value.words}"
  etag         = filemd5("${local.scripts_root}/seo/${each.value.words}")
  content_type = "application/json"
}

# Renderer

resource "aws_iam_role" "seo_render_lambda" {
  name = "vocably-${terraform.workspace}-seo-render-lambda"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy" "seo_render_lambda" {
  name = "vocably-${terraform.workspace}-seo-render-lambda"
  role = aws_iam_role.seo_render_lambda.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid      = "Logging"
        Effect   = "Allow"
        Action   = ["logs:CreateLogStream", "logs:PutLogEvents"]
        Resource = "${aws_cloudwatch_log_group.seo_render.arn}:*"
      },
      {
        # Read-only: the renderer never adds to the data.
        Sid      = "ReadUnitsOfSpeech"
        Effect   = "Allow"
        Action   = ["s3:GetObject", "s3:ListBucket"]
        Resource = [aws_s3_bucket.units_of_speech.arn, "${aws_s3_bucket.units_of_speech.arn}/*"]
      },
      {
        Sid      = "ReadTemplate"
        Effect   = "Allow"
        Action   = ["s3:GetObject"]
        Resource = ["${aws_s3_bucket.www.arn}/search.html"]
      },
      {
        Sid      = "SeoBucket"
        Effect   = "Allow"
        Action   = ["s3:GetObject", "s3:PutObject", "s3:DeleteObject", "s3:ListBucket"]
        Resource = [aws_s3_bucket.seo.arn, "${aws_s3_bucket.seo.arn}/*"]
      },
    ]
  })
}

resource "aws_cloudwatch_log_group" "seo_render" {
  name              = "/aws/lambda/vocably-${terraform.workspace}-seo-render"
  retention_in_days = 14
}

resource "aws_lambda_function" "seo_render" {
  depends_on = [aws_cloudwatch_log_group.seo_render]

  filename         = data.archive_file.seo_backend_build.output_path
  function_name    = "vocably-${terraform.workspace}-seo-render"
  role             = aws_iam_role.seo_render_lambda.arn
  handler          = "render.handler"
  source_code_hash = data.archive_file.seo_backend_build.output_base64sha256
  runtime          = "nodejs22.x"
  memory_size      = 1024
  timeout          = 20

  environment {
    variables = {
      UNITS_OF_SPEECH_BUCKET = aws_s3_bucket.units_of_speech.bucket
      SEO_BUCKET             = aws_s3_bucket.seo.bucket
      WWW_BUCKET             = aws_s3_bucket.www.bucket
    }
  }
}

# Only CloudFront can call the URL: it signs its requests through the origin
# access control below.
resource "aws_lambda_function_url" "seo_render" {
  function_name      = aws_lambda_function.seo_render.function_name
  authorization_type = "AWS_IAM"
}

resource "aws_cloudfront_origin_access_control" "seo_render" {
  name                              = "vocably-${terraform.workspace}-seo-render"
  description                       = "CloudFront access to the SEO page renderer"
  origin_access_control_origin_type = "lambda"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_lambda_permission" "seo_render_cloudfront_url" {
  statement_id           = "AllowCloudFrontInvokeFunctionUrl"
  action                 = "lambda:InvokeFunctionUrl"
  function_name          = aws_lambda_function.seo_render.function_name
  principal              = "cloudfront.amazonaws.com"
  source_arn             = aws_cloudfront_distribution.www.arn
  function_url_auth_type = "AWS_IAM"
}

# Function URLs created since October 2025 also need lambda:InvokeFunction.
resource "aws_lambda_permission" "seo_render_cloudfront_invoke" {
  statement_id             = "AllowCloudFrontInvokeFunction"
  action                   = "lambda:InvokeFunction"
  function_name            = aws_lambda_function.seo_render.function_name
  principal                = "cloudfront.amazonaws.com"
  source_arn               = aws_cloudfront_distribution.www.arn
  invoked_via_function_url = true
}

locals {
  seo_render_origin_domain = trimsuffix(trimprefix(aws_lambda_function_url.seo_render.function_url, "https://"), "/")
}

# Invalidation

resource "aws_sqs_queue" "seo_invalidate_dlq" {
  name                      = "vocably-${terraform.workspace}-seo-invalidate-dlq"
  message_retention_seconds = 1209600
}

resource "aws_sqs_queue" "seo_invalidate" {
  name = "vocably-${terraform.workspace}-seo-invalidate"
  # Six times the lambda timeout, as AWS recommends for event source mappings.
  visibility_timeout_seconds = 360
  message_retention_seconds  = 86400

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.seo_invalidate_dlq.arn
    maxReceiveCount     = 5
  })
}

resource "aws_sqs_queue_policy" "seo_invalidate" {
  queue_url = aws_sqs_queue.seo_invalidate.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "s3.amazonaws.com" }
      Action    = "sqs:SendMessage"
      Resource  = aws_sqs_queue.seo_invalidate.arn
      Condition = {
        ArnEquals = { "aws:SourceArn" = aws_s3_bucket.units_of_speech.arn }
      }
    }]
  })
}

resource "aws_s3_bucket_notification" "units_of_speech" {
  bucket = aws_s3_bucket.units_of_speech.id

  dynamic "queue" {
    for_each = local.seo_dependency_prefixes

    content {
      queue_arn     = aws_sqs_queue.seo_invalidate.arn
      events        = ["s3:ObjectCreated:*", "s3:ObjectRemoved:*"]
      filter_prefix = queue.value
    }
  }

  depends_on = [aws_sqs_queue_policy.seo_invalidate]
}

resource "aws_iam_role" "seo_invalidate_lambda" {
  name = "vocably-${terraform.workspace}-seo-invalidate-lambda"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy" "seo_invalidate_lambda" {
  name = "vocably-${terraform.workspace}-seo-invalidate-lambda"
  role = aws_iam_role.seo_invalidate_lambda.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid      = "Logging"
        Effect   = "Allow"
        Action   = ["logs:CreateLogStream", "logs:PutLogEvents"]
        Resource = "${aws_cloudwatch_log_group.seo_invalidate.arn}:*"
      },
      {
        Sid      = "Queue"
        Effect   = "Allow"
        Action   = ["sqs:ReceiveMessage", "sqs:DeleteMessage", "sqs:GetQueueAttributes"]
        Resource = aws_sqs_queue.seo_invalidate.arn
      },
      {
        Sid      = "DependencyIndex"
        Effect   = "Allow"
        Action   = ["s3:ListBucket"]
        Resource = aws_s3_bucket.seo.arn
      },
      {
        Sid      = "Invalidate"
        Effect   = "Allow"
        Action   = ["cloudfront:CreateInvalidation"]
        Resource = aws_cloudfront_distribution.www.arn
      },
    ]
  })
}

resource "aws_cloudwatch_log_group" "seo_invalidate" {
  name              = "/aws/lambda/vocably-${terraform.workspace}-seo-invalidate"
  retention_in_days = 14
}

resource "aws_lambda_function" "seo_invalidate" {
  depends_on = [aws_cloudwatch_log_group.seo_invalidate]

  filename         = data.archive_file.seo_backend_build.output_path
  function_name    = "vocably-${terraform.workspace}-seo-invalidate"
  role             = aws_iam_role.seo_invalidate_lambda.arn
  handler          = "invalidate.handler"
  source_code_hash = data.archive_file.seo_backend_build.output_base64sha256
  runtime          = "nodejs22.x"
  timeout          = 60

  environment {
    variables = {
      SEO_BUCKET      = aws_s3_bucket.seo.bucket
      DISTRIBUTION_ID = aws_cloudfront_distribution.www.id
    }
  }
}

# Changes are collected for up to five minutes, so a burst of writes (e.g. a
# batch import) ends up in a few invalidations instead of one per key.
resource "aws_lambda_event_source_mapping" "seo_invalidate" {
  event_source_arn = aws_sqs_queue.seo_invalidate.arn
  function_name    = aws_lambda_function.seo_invalidate.arn
  # S3 notifications are ~1.5 KB, so this stays far below the 6 MB payload
  # limit of a lambda invocation.
  batch_size                         = 1000
  maximum_batching_window_in_seconds = 300

  scaling_config {
    maximum_concurrency = 2
  }
}

resource "aws_cloudwatch_metric_alarm" "seo_invalidate_dlq" {
  alarm_name          = "vocably-${terraform.workspace}-seo-invalidate-dlq"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "ApproximateNumberOfMessagesVisible"
  namespace           = "AWS/SQS"
  period              = 3600
  statistic           = "Maximum"
  threshold           = 0
  alarm_description   = "${terraform.workspace}: SEO pages could not be invalidated"
  alarm_actions       = [aws_sns_topic.alarm.arn]
  dimensions = {
    QueueName = aws_sqs_queue.seo_invalidate_dlq.name
  }
}

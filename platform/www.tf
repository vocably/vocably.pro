locals {
  www_env_content = <<EOT
module.exports = {
  environment: {
    baseUrl: '${local.www_base_url}',
    apiBaseUrl: 'https://${local.api_domain}',
    umamiWebsiteId: '${var.umami_website_id}',
    publicApiBaseUrl: 'https://${local.public_api_domain}',
    paddleClientSideToken: '${var.paddle_client_side_token}',
    paddleMonthlyPriceId: '${var.paddle_monthly_premium_id}',
    paddleYearlyPriceId: '${var.paddle_yearly_premium_id}',
    paddleLifetimePriceId: '${var.paddle_lifetime_premium_id}',
    searchSeoDataFolder: '${var.www_search_seo_data_folder}',
  },
};
  EOT
}

resource "local_file" "www_environment" {
  content  = local.www_env_content
  filename = "${local.www_root}/environment.js"
}

locals {
  www_bucket = "vocably-${terraform.workspace}-www"
}

data "external" "www_build" {
  depends_on = [local_file.www_environment, data.external.backend_build]
  program = ["bash", "-lc", <<EOT
(NODE_OPTIONS=--max-old-space-size=1024 npm run build --loglevel verbose) >&2 && echo "{\"dest\": \"$(pwd)/dist\"}"
EOT
  ]
  working_dir = local.www_root
}

resource "aws_s3_bucket" "www" {
  bucket        = local.www_bucket
  force_destroy = true
}

resource "aws_s3_bucket_acl" "www" {
  bucket = aws_s3_bucket.www.bucket

  acl = "public-read"
}

resource "aws_s3_bucket_versioning" "www" {
  bucket = aws_s3_bucket.www.bucket

  versioning_configuration {
    status = "Suspended"
  }
}

resource "aws_s3_bucket_policy" "www" {
  bucket = aws_s3_bucket.www.bucket

  policy = <<EOF
{
  "Version":"2012-10-17",
  "Statement":[{
        "Sid":"PublicReadForGetBucketObjects",
        "Effect":"Allow",
          "Principal": "*",
      "Action":["s3:GetObject"],
      "Resource":["arn:aws:s3:::${local.www_bucket}/*"]
    }
  ]
}
EOF
}

resource "aws_s3_bucket_cors_configuration" "www" {
  bucket = aws_s3_bucket.www.bucket

  cors_rule {
    allowed_methods = ["GET"]
    allowed_origins = ["*"]
  }
}

resource "aws_s3_bucket_website_configuration" "www" {
  bucket = aws_s3_bucket.www.bucket

  index_document {
    suffix = "index.html"
  }
  error_document {
    key = "index.html"
  }
}

resource "aws_cloudfront_origin_access_identity" "www" {
  comment = "${local.www_bucket}-cloudfront-origin-access-identity"
}

resource "aws_cloudfront_function" "www_app" {
  name    = "vocably-${terraform.workspace}-www-app"
  runtime = "cloudfront-js-2.0"
  comment = "Serves the app bucket under /${local.app_path} of ${var.root_domain}"
  publish = true

  code = templatefile("${path.module}/cloudfront-functions/www-app.js", {
    app_path = local.app_path
  })
}

# Non-prod environments are real, publicly reachable hosts serving the full
# production SEO corpus, so they have to be kept out of the search index.
resource "aws_cloudfront_response_headers_policy" "www" {
  count = terraform.workspace == "prod" ? 0 : 1

  name = "vocably-${terraform.workspace}-www"

  custom_headers_config {
    items {
      header   = "X-Robots-Tag"
      value    = "noindex, nofollow"
      override = true
    }
  }
}

locals {
  # Prod gets no policy at all rather than an empty one.
  www_response_headers_policy_id = try(
    aws_cloudfront_response_headers_policy.www[0].id,
    null
  )
}

resource "aws_cloudfront_distribution" "www" {
  origin {
    domain_name = aws_s3_bucket.www.bucket_regional_domain_name
    origin_id   = aws_s3_bucket.www.bucket_regional_domain_name

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.www.cloudfront_access_identity_path
    }
  }

  origin {
    domain_name = aws_s3_bucket.app.bucket_regional_domain_name
    origin_id   = aws_s3_bucket.app.bucket_regional_domain_name

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.app.cloudfront_access_identity_path
    }
  }

  enabled             = true
  is_ipv6_enabled     = true
  http_version        = "http2and3"
  default_root_object = "index.html"

  aliases = [var.root_domain]

  default_cache_behavior {
    allowed_methods            = ["HEAD", "GET"]
    cached_methods             = ["HEAD", "GET"]
    target_origin_id           = aws_s3_bucket.www.bucket_regional_domain_name
    viewer_protocol_policy     = "redirect-to-https"
    compress                   = true
    response_headers_policy_id = local.www_response_headers_policy_id

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }
  }

  # Two patterns instead of a single "/app*", which would also swallow www
  # pages such as /apple-shortcuts.
  ordered_cache_behavior {
    path_pattern               = "/${local.app_path}"
    allowed_methods            = ["HEAD", "GET"]
    cached_methods             = ["HEAD", "GET"]
    target_origin_id           = aws_s3_bucket.app.bucket_regional_domain_name
    viewer_protocol_policy     = "redirect-to-https"
    compress                   = true
    response_headers_policy_id = local.www_response_headers_policy_id

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.www_app.arn
    }

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }
  }

  ordered_cache_behavior {
    path_pattern               = "/${local.app_path}/*"
    allowed_methods            = ["HEAD", "GET"]
    cached_methods             = ["HEAD", "GET"]
    target_origin_id           = aws_s3_bucket.app.bucket_regional_domain_name
    viewer_protocol_policy     = "redirect-to-https"
    compress                   = true
    response_headers_policy_id = local.www_response_headers_policy_id

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.www_app.arn
    }

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate.primary-global.arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  # The S3 REST origin answers a missing key with 403 (the OAI may read objects
  # but not list the bucket), so both codes have to become an honest 404.
  # Returning 200 + the homepage here made every typo an indexable duplicate
  # of "/".
  custom_error_response {
    error_code            = 404
    response_code         = 404
    response_page_path    = "/404.html"
    error_caching_min_ttl = 300
  }

  custom_error_response {
    error_code            = 403
    response_code         = 404
    response_page_path    = "/404.html"
    error_caching_min_ttl = 300
  }

  depends_on = [aws_acm_certificate_validation.primary-global]
}

resource "aws_route53_record" "www" {
  zone_id = data.aws_route53_zone.primary.zone_id
  name    = data.aws_route53_zone.primary.name
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.www.domain_name
    zone_id                = aws_cloudfront_distribution.www.hosted_zone_id
    evaluate_target_health = false
  }
}

locals {
  www_dist = data.external.www_build.result.dest
}

resource "null_resource" "www_upload" {
  depends_on = [
    data.external.www_build,
    aws_s3_bucket.www,
    aws_cloudfront_distribution.www,
  ]

  triggers = {
    sha1 = sha1(join("", [for f in fileset(local.www_dist, "**") : filesha1("${local.www_dist}/${f}")]))
  }

  provisioner "local-exec" {
    # Three passes whose filters partition the dist, so "--delete" on each one
    # still removes everything that disappeared from the build.
    #
    # Only the webpack-emitted files carry a content hash in their name, so only
    # they can be immutable. src/assets is copied verbatim by CopyPlugin and
    # keeps stable paths, hence a day rather than a year. HTML must revalidate
    # on every request or a deploy would not be visible until the edge TTL
    # expired.
    #
    # apple-app-site-association has no extension, so it has to be re-uploaded
    # with an explicit content type for Apple to accept it.
    command = <<EOT
aws s3 sync ${local.www_dist} s3://${aws_s3_bucket.www.id} --delete \
  --exclude "*" --include "*.js" --include "*.css" --include "*.js.map" \
  --cache-control "public, max-age=31536000, immutable"

aws s3 sync ${local.www_dist}/assets s3://${aws_s3_bucket.www.id}/assets --delete \
  --cache-control "public, max-age=86400"

aws s3 sync ${local.www_dist} s3://${aws_s3_bucket.www.id} --delete \
  --exclude "assets/*" --exclude "*.js" --exclude "*.css" --exclude "*.js.map" \
  --cache-control "public, max-age=0, must-revalidate"

aws s3 cp ${local.www_dist}/.well-known/apple-app-site-association s3://${aws_s3_bucket.www.id}/.well-known/apple-app-site-association --content-type application/json --cache-control "public, max-age=0, must-revalidate"

aws cloudfront create-invalidation --distribution-id ${aws_cloudfront_distribution.www.id} --paths '/*'
EOT
  }
}

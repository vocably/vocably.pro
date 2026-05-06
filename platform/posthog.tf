resource "aws_route53_record" "posthog_reverse_proxy" {
  zone_id = data.aws_route53_zone.primary.id
  name    = "api-b"
  type    = "CNAME"
  ttl     = 300
  records = ["3ec91268995519503ea6.cf-prod-us-proxy.proxyhog.com."]
}

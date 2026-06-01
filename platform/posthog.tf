resource "aws_route53_record" "posthog_reverse_proxy" {
  zone_id = data.aws_route53_zone.primary.id
  name    = "api-b"
  type    = "CNAME"
  ttl     = 300
  records = ["3ec91268995519503ea6.cf-prod-us-proxy.proxyhog.com."]
}

resource "aws_route53_record" "posthog_reverse_proxy_eu" {
  zone_id = data.aws_route53_zone.primary.id
  name    = "api-e"
  type    = "CNAME"
  ttl     = 300
  records = ["543c520dfdd003a08aa4.cf-prod-eu-proxy.europehog.com."]
}

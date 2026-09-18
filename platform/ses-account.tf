// Transactional email identity for Cognito auth messages (verification codes,
// password resets).
//
// Deliberately a subdomain of its own rather than the apex: vocably.pro is
// already authenticated with Brevo for onboarding/marketing mail (brevo-code
// TXT, mail._domainkey DKIM, Brevo-managed DMARC), and auth mail must not share
// a sending reputation with anything a user can unsubscribe from or mark as
// spam. A password reset that silently fails to arrive locks a user out.
//
// The identity has to exist and pass DKIM before SES production access can
// even be requested for the account.

resource "aws_sesv2_email_identity" "account" {
  email_identity = local.account_domain

  dkim_signing_attributes {
    next_signing_key_length = "RSA_2048_BIT"
  }
}

// count rather than for_each: the tokens are only known after apply, which
// for_each cannot plan around. Easy DKIM always issues exactly three.
resource "aws_route53_record" "account_dkim" {
  count = 3

  zone_id = data.aws_route53_zone.primary.zone_id
  name    = "${aws_sesv2_email_identity.account.dkim_signing_attributes[0].tokens[count.index]}._domainkey.${local.account_domain}"
  type    = "CNAME"
  ttl     = 600
  records = ["${aws_sesv2_email_identity.account.dkim_signing_attributes[0].tokens[count.index]}.dkim.amazonses.com"]
}

// A custom MAIL FROM keeps the Return-Path on our own domain, which is what
// aligns SPF for DMARC. Without it the envelope sender is an amazonses.com
// subdomain and only DKIM aligns.
resource "aws_sesv2_email_identity_mail_from_attributes" "account" {
  email_identity         = aws_sesv2_email_identity.account.email_identity
  mail_from_domain       = local.account_bounce_domain
  behavior_on_mx_failure = "USE_DEFAULT_VALUE"

  depends_on = [
    aws_route53_record.account_mail_from_mx,
    aws_route53_record.account_mail_from_spf,
  ]
}

resource "aws_route53_record" "account_mail_from_mx" {
  zone_id = data.aws_route53_zone.primary.zone_id
  name    = local.account_bounce_domain
  type    = "MX"
  ttl     = 600
  records = ["10 feedback-smtp.${data.aws_region.current.region}.amazonses.com"]
}

resource "aws_route53_record" "account_mail_from_spf" {
  zone_id = data.aws_route53_zone.primary.zone_id
  name    = local.account_bounce_domain
  type    = "TXT"
  ttl     = 600
  records = ["v=spf1 include:amazonses.com ~all"]
}

resource "aws_route53_record" "account_dmarc" {
  zone_id = data.aws_route53_zone.primary.zone_id
  name    = "_dmarc.${local.account_domain}"
  type    = "TXT"
  ttl     = 600
  records = ["v=DMARC1; p=none; rua=mailto:${var.alarm_email}"]
}

resource "aws_sesv2_configuration_set" "account" {
  configuration_set_name = "vocably-${terraform.workspace}-account"

  delivery_options {
    tls_policy = "REQUIRE"
  }

  reputation_options {
    reputation_metrics_enabled = true
  }

  sending_options {
    sending_enabled = true
  }
}

// Without this, a bounced or rejected verification code is invisible - SES
// accepts the send and the user simply never receives anything.
resource "aws_sesv2_configuration_set_event_destination" "account_cloudwatch" {
  configuration_set_name = aws_sesv2_configuration_set.account.configuration_set_name
  event_destination_name = "cloudwatch"

  event_destination {
    enabled              = true
    matching_event_types = ["BOUNCE", "COMPLAINT", "REJECT", "RENDERING_FAILURE"]

    cloud_watch_destination {
      dimension_configuration {
        default_dimension_value = "none"
        dimension_name          = "ses:configuration-set"
        dimension_value_source  = "MESSAGE_TAG"
      }
    }
  }
}

output "account_email_identity" {
  value = aws_sesv2_email_identity.account.email_identity
}

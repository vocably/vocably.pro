resource "null_resource" "auth_users_status" {
  depends_on = [
    aws_cognito_user_pool.users,
  ]

  provisioner "local-exec" {
    command = "aws cognito-idp add-custom-attributes --user-pool-id ${aws_cognito_user_pool.users.id} --region ${data.aws_region.current.region} --custom-attributes Name=status,AttributeDataType=String,Mutable=true,Required=false || exit 0"
  }
}

resource "null_resource" "auth_users_update_url" {
  depends_on = [
    aws_cognito_user_pool.users,
  ]

  provisioner "local-exec" {
    command = "aws cognito-idp add-custom-attributes --user-pool-id ${aws_cognito_user_pool.users.id} --region ${data.aws_region.current.region} --custom-attributes Name=update_url,AttributeDataType=String,Mutable=true,Required=false || exit 0"
  }
}

resource "null_resource" "auth_users_cancel_url" {
  depends_on = [
    aws_cognito_user_pool.users,
  ]

  provisioner "local-exec" {
    command = "aws cognito-idp add-custom-attributes --user-pool-id ${aws_cognito_user_pool.users.id} --region ${data.aws_region.current.region} --custom-attributes Name=cancel_url,AttributeDataType=String,Mutable=true,Required=false || exit 0"
  }
}

resource "null_resource" "auth_users_next_bill_date" {
  depends_on = [
    aws_cognito_user_pool.users,
  ]

  provisioner "local-exec" {
    command = "aws cognito-idp add-custom-attributes --user-pool-id ${aws_cognito_user_pool.users.id} --region ${data.aws_region.current.region} --custom-attributes Name=next_bill_date,AttributeDataType=String,Mutable=true,Required=false || exit 0"
  }
}

resource "null_resource" "auth_users_cancellation_date" {
  depends_on = [
    aws_cognito_user_pool.users,
  ]

  provisioner "local-exec" {
    command = "aws cognito-idp add-custom-attributes --user-pool-id ${aws_cognito_user_pool.users.id} --region ${data.aws_region.current.region} --custom-attributes Name=cancellation_date,AttributeDataType=String,Mutable=true,Required=false || exit 0"
  }
}

resource "null_resource" "auth_users_unit_price" {
  depends_on = [
    aws_cognito_user_pool.users,
  ]

  provisioner "local-exec" {
    command = "aws cognito-idp add-custom-attributes --user-pool-id ${aws_cognito_user_pool.users.id} --region ${data.aws_region.current.region} --custom-attributes Name=unit_price,AttributeDataType=Number,Mutable=true,Required=false,NumberAttributeConstraints=\"{MinValue=0,MaxValue=1000}\" || exit 0"
  }
}

resource "null_resource" "auth_users_product_id" {
  depends_on = [
    aws_cognito_user_pool.users,
  ]

  provisioner "local-exec" {
    command = "aws cognito-idp add-custom-attributes --user-pool-id ${aws_cognito_user_pool.users.id} --region ${data.aws_region.current.region} --custom-attributes Name=product_id,AttributeDataType=Number,Mutable=true,Required=false,NumberAttributeConstraints=\"{MinValue=0,MaxValue=2147483647}\" || exit 0"
  }
}

resource "null_resource" "auth_users_plan_name" {
  depends_on = [
    aws_cognito_user_pool.users,
  ]

  provisioner "local-exec" {
    command = "aws cognito-idp add-custom-attributes --user-pool-id ${aws_cognito_user_pool.users.id} --region ${data.aws_region.current.region} --custom-attributes Name=plan_name,AttributeDataType=String,Mutable=true,Required=false || exit 0"
  }
}

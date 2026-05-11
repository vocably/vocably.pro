terraform {
  backend "s3" {
    bucket         = "vocably-dev-tf-state"
    region         = "eu-central-1"
    key            = "vocably"
    dynamodb_table = "vocably-dev-tf-state-lock"
    encrypt        = true
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

provider "aws" {
  region = "eu-central-1"
}

provider "aws" {
  alias  = "global"
  region = "us-east-1"
}

provider "google" {
  region  = "europe-central2"
  project = var.gcloud_project_id
}

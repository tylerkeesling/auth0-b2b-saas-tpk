terraform {
  required_providers {
    auth0 = {
      source  = "auth0/auth0"
      version = "~> 1.0"
    }
  }
}

provider "auth0" {
  domain        = var.auth0_domain
  client_id     = var.auth0_client_id
  client_secret = var.auth0_client_secret
}

resource "auth0_tenant" "tenant" {
  customize_mfa_in_postlogin_action = true

  flags {
    mfa_show_factor_list_on_enrollment = true
  }
}

resource "auth0_action" "security_policies" {
  name    = "Security Policies"
  runtime = "node22"
  deploy  = true
  code    = file("../actions/security-policies.js")

  supported_triggers {
    id      = "post-login"
    version = "v3"
  }

  secrets {
    name  = "DASHBOARD_CLIENT_ID"
    value = var.dashboard_client_id
  }
}

resource "auth0_trigger_action" "post_login_security_policies" {
  trigger   = "post-login"
  action_id = auth0_action.security_policies.id
}

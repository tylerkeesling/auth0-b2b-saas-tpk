variable "auth0_domain" {
  description = "Auth0 tenant domain (e.g. example.us.auth0.com)"
  type        = string
}

variable "auth0_client_id" {
  description = "Client ID for the Auth0 Terraform M2M application"
  type        = string
}

variable "auth0_client_secret" {
  description = "Client secret for the Auth0 Terraform M2M application"
  type        = string
  sensitive   = true
}

variable "dashboard_client_id" {
  description = "Client ID of the dashboard app checked by the security-policies action"
  type        = string
}

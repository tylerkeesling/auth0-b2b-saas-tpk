import { describe, it, expect } from "vitest"
import { resolveBreadcrumbs } from "@/components/sidebar-breadcrumbs"

describe("resolveBreadcrumbs", () => {
  // Exact route matches
  it("resolves /dashboard to Home", () => {
    expect(resolveBreadcrumbs("/dashboard")).toEqual([{ label: "Home" }])
  })

  it("resolves /dashboard/account/profile with group", () => {
    expect(resolveBreadcrumbs("/dashboard/account/profile")).toEqual([
      { label: "My Account" },
      { label: "Profile" },
    ])
  })

  it("resolves /dashboard/organization/general with group", () => {
    expect(resolveBreadcrumbs("/dashboard/organization/general")).toEqual([
      { label: "My Organization" },
      { label: "General Settings" },
    ])
  })

  it("resolves /dashboard/organization/members", () => {
    expect(resolveBreadcrumbs("/dashboard/organization/members")).toEqual([
      { label: "My Organization" },
      { label: "Members" },
    ])
  })

  it("resolves /dashboard/organization/sso", () => {
    expect(resolveBreadcrumbs("/dashboard/organization/sso")).toEqual([
      { label: "My Organization" },
      { label: "SSO" },
    ])
  })

  it("resolves /dashboard/account/security", () => {
    expect(resolveBreadcrumbs("/dashboard/account/security")).toEqual([
      { label: "My Account" },
      { label: "Multifactor Authentication" },
    ])
  })

  it("resolves /dashboard/event-stream without group", () => {
    expect(resolveBreadcrumbs("/dashboard/event-stream")).toEqual([
      { label: "Event Stream" },
    ])
  })

  // SSO sub-routes
  it("resolves SSO OIDC new page", () => {
    expect(resolveBreadcrumbs("/dashboard/organization/sso/oidc/new")).toEqual([
      { label: "My Organization" },
      { label: "SSO", href: "/dashboard/organization/sso" },
      { label: "New" },
    ])
  })

  it("resolves SSO SAML edit settings page", () => {
    expect(
      resolveBreadcrumbs(
        "/dashboard/organization/sso/saml/edit/abc123/settings"
      )
    ).toEqual([
      { label: "My Organization" },
      { label: "SSO", href: "/dashboard/organization/sso" },
      { label: "Settings" },
    ])
  })

  it("resolves SSO OIDC edit provisioning page", () => {
    expect(
      resolveBreadcrumbs(
        "/dashboard/organization/sso/oidc/edit/conn-id/provisioning"
      )
    ).toEqual([
      { label: "My Organization" },
      { label: "SSO", href: "/dashboard/organization/sso" },
      { label: "Provisioning" },
    ])
  })

  // Fallback
  it("falls back to Home for unknown routes", () => {
    expect(resolveBreadcrumbs("/dashboard/unknown")).toEqual([
      { label: "Home" },
    ])
  })

  it("falls back to Home for completely unknown paths", () => {
    expect(resolveBreadcrumbs("/something/else")).toEqual([{ label: "Home" }])
  })
})

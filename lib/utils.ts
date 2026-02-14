import { NextRequest } from 'next/server'
import { ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/*  
 if host has no subdomain and no org param present, return orgName=undefined, domain=host
 if host has no subdomain and org param present, return orgName=orgQueryParam, domain=host
 if host has subdomain and no org param present, return orgName=subdomain, domain=host
 if host has subdomain, the org param is present, and the subdomain ≠ org param, return orgName=orgQueryParam, domain=orgQueryParam.domain.tld
 
 Needs to return the organization name AND the FQND domain 
 */
export const generateOrgAndFQDN = (
  request: NextRequest,
  baseDomain: string = process.env.AUTH0_BASE_URL || '' // Single known base domain with protocol (e.g., "https://example.com")
): { orgName: string | undefined; domain: string } => {
  let orgName: string | undefined
  let domain: string

  const host = request.headers.get('host') || ''
  const protocol = request.headers.get('x-forwarded-proto')
  const orgQueryParam = request.nextUrl.searchParams.get('organization')

  // Normalize baseDomain by removing protocol if present
  const normalizedBaseDomain = baseDomain.replace(/https?:\/\//, '')

  // Ensure the host matches the normalized base domain
  if (host.endsWith(normalizedBaseDomain)) {
    const subdomain = host.replace(`.${normalizedBaseDomain}`, '') // Extract subdomain by removing the base domain

    if (subdomain === host) {
      // No subdomain present
      domain = host
      orgName = orgQueryParam || undefined
    } else {
      // Subdomain exists
      if (orgQueryParam && orgQueryParam !== subdomain) {
        orgName = orgQueryParam
        domain = `${orgQueryParam}.${normalizedBaseDomain}`
      } else {
        orgName = subdomain
        domain = host
      }
    }
  } else {
    // Host doesn't match the specified base domain, treat it as a standalone domain
    domain = host
    orgName = orgQueryParam || undefined
  }

  return {
    orgName,
    domain: `${protocol}://${domain}`,
  }
}

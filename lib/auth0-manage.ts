import { ManagementClient } from 'auth0'

const requiredEnvVars = {
  AUTH0_MANAGEMENT_API_DOMAIN: process.env.AUTH0_MANAGEMENT_API_DOMAIN,
  AUTH0_MANAGEMENT_CLIENT_ID: process.env.AUTH0_MANAGEMENT_CLIENT_ID,
  AUTH0_MANAGEMENT_CLIENT_SECRET: process.env.AUTH0_MANAGEMENT_CLIENT_SECRET,
  AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
}

const missingVars = Object.entries(requiredEnvVars)
  .filter(([, value]) => !value)
  .map(([key]) => key)

if (missingVars.length > 0) {
  throw new Error(
    `Missing required Auth0 management environment variables: ${missingVars.join(', ')}`
  )
}

export const managementClient = new ManagementClient({
  domain: requiredEnvVars.AUTH0_MANAGEMENT_API_DOMAIN!,
  clientId: requiredEnvVars.AUTH0_MANAGEMENT_CLIENT_ID!,
  clientSecret: requiredEnvVars.AUTH0_MANAGEMENT_CLIENT_SECRET!,
  headers: {
    'auth0-custom-domain': requiredEnvVars.AUTH0_DOMAIN!,
  },
})

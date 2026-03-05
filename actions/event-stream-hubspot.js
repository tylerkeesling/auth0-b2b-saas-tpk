const hubspot = require('@hubspot/api-client')
const { ManagementClient } = require('auth0')

/**
 * Create a new HubSpot contact and store the HubSpot ID in Auth0 app_metadata.
 * @param {object} user - The Auth0 user object from the event payload.
 * @param {import('@hubspot/api-client').Client} hubspotClient
 * @param {import('auth0').ManagementClient} managementClient
 */
async function handleUserCreated(user, hubspotClient, managementClient) {
  const response = await hubspotClient.crm.contacts.basicApi.create({
    properties: {
      user_id: user.user_id,
      email: user.email,
      firstname: user.given_name,
      lastname: user.family_name,
    },
  })

  const hubspotId = response.id

  await managementClient.users.update(
    { id: user.user_id },
    { app_metadata: { hubspot_id: hubspotId } }
  )

  console.log(`Created HubSpot contact ${hubspotId} for user ${user.user_id}`)
}

/**
 * Update an existing HubSpot contact using the stored HubSpot ID.
 * @param {object} user - The Auth0 user object from the event payload.
 * @param {import('@hubspot/api-client').Client} hubspotClient
 */
async function handleUserUpdated(user, hubspotClient) {
  const hubspotId = user.app_metadata?.hubspot_id

  if (!hubspotId) {
    console.log(
      `No hubspot_id in app_metadata for user ${user.user_id}, skipping update`
    )
    return
  }

  await hubspotClient.crm.contacts.basicApi.update(hubspotId, {
    properties: {
      user_id: user.user_id,
      email: user.email,
      firstname: user.given_name,
      lastname: user.family_name,
    },
  })

  console.log(`Updated HubSpot contact ${hubspotId} for user ${user.user_id}`)
}

/**
 * Archive a HubSpot contact when the Auth0 user is deleted.
 * @param {object} user - The Auth0 user object from the event payload.
 * @param {import('@hubspot/api-client').Client} hubspotClient
 */
async function handleUserDeleted(user, hubspotClient) {
  const hubspotId = user.app_metadata?.hubspot_id

  if (!hubspotId) {
    console.log(
      `No hubspot_id in app_metadata for user ${user.user_id}, skipping delete`
    )
    return
  }

  await hubspotClient.crm.contacts.basicApi.archive(hubspotId)

  console.log(`Archived HubSpot contact ${hubspotId} for user ${user.user_id}`)
}

/**
 * Handler that will be called during the execution of an Event Stream.
 * @param {Event} event - Details about the Cloud Event.
 * @param {EventStreamAPI} api - Interface whose methods can be used to handle the event.
 */
exports.onExecuteEventStream = async (event, api) => {
  const eventType = event.message.type
  const user = event.message.data.data.object

  console.log(`Received event: ${eventType}`)

  const hubspotClient = new hubspot.Client({
    accessToken: event.secrets.HUBSPOT_API_KEY,
  })

  const managementClient = new ManagementClient({
    domain: event.secrets.AUTH0_DOMAIN,
    clientId: event.secrets.AUTH0_CLIENT_ID,
    clientSecret: event.secrets.AUTH0_CLIENT_SECRET,
  })

  try {
    switch (eventType) {
      case 'user.created':
        await handleUserCreated(user, hubspotClient, managementClient)
        break
      case 'user.updated':
        await handleUserUpdated(user, hubspotClient)
        break
      case 'user.deleted':
        await handleUserDeleted(user, hubspotClient)
        break
      default:
        console.log(`Unhandled event type: ${eventType}`)
    }
  } catch (error) {
    console.log(`Error handling ${eventType}:`, error)
    api.message.fail(`Failed to process ${eventType}: ${error.message}`)
  }
}

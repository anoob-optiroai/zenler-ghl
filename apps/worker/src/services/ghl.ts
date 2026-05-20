import axios from 'axios'

const GHL_BASE = 'https://services.leadconnectorhq.com'
const VERSION = '2021-07-28'

function ghlClient(apiKey: string) {
  return axios.create({
    baseURL: GHL_BASE,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Version: VERSION,
      'Content-Type': 'application/json',
    },
  })
}

export async function ghlCreateContact(apiKey: string, locationId: string, data: {
  email?: string
  firstName?: string
  lastName?: string
  phone?: string
  tags?: string[]
  customFields?: Record<string, any>
}) {
  const client = ghlClient(apiKey)
  const res = await client.post('/contacts/', { ...data, locationId })
  return res.data
}

export async function ghlGetContactByEmail(apiKey: string, locationId: string, email: string) {
  const client = ghlClient(apiKey)
  const res = await client.get(`/contacts/search/duplicate?locationId=${locationId}&email=${encodeURIComponent(email)}`)
  return res.data?.contact || null
}

export async function ghlUpdateContact(apiKey: string, contactId: string, data: Record<string, any>) {
  const client = ghlClient(apiKey)
  const res = await client.put(`/contacts/${contactId}`, data)
  return res.data
}

export async function ghlAddTags(apiKey: string, contactId: string, tags: string[]) {
  const client = ghlClient(apiKey)
  const res = await client.post(`/contacts/${contactId}/tags`, { tags })
  return res.data
}

export async function ghlRemoveTags(apiKey: string, contactId: string, tags: string[]) {
  const client = ghlClient(apiKey)
  const res = await client.delete(`/contacts/${contactId}/tags`, { data: { tags } })
  return res.data
}

export async function ghlCreateOpportunity(apiKey: string, locationId: string, data: {
  pipelineId?: string
  pipelineStageId?: string
  contactId: string
  name: string
  status: string
  monetaryValue?: number
}) {
  const client = ghlClient(apiKey)
  const res = await client.post('/opportunities/', { ...data, locationId })
  return res.data
}

export async function ghlUpsertContact(apiKey: string, locationId: string, data: {
  email?: string
  firstName?: string
  lastName?: string
  phone?: string
  tags?: string[]
}) {
  // Try to find existing contact first
  if (data.email) {
    const existing = await ghlGetContactByEmail(apiKey, locationId, data.email)
    if (existing?.id) {
      return ghlUpdateContact(apiKey, existing.id, data)
    }
  }
  return ghlCreateContact(apiKey, locationId, data)
}

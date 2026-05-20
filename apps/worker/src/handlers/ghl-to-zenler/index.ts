interface Connection {
  ghlApiKey: string
  ghlLocationId: string
  zenlerApiKey?: string | null
  zenlerDomain?: string | null
}
import {
  zenlerRegisterUser,
  zenlerEnrollUser,
  zenlerUnenrollUser,
  zenlerGetUser,
} from '../../services/zenler'

// Map GHL tags to Zenler course IDs (configurable per user — extend later)
// For now, tags like "enroll-course-abc123" are parsed automatically
function parseCourseIdFromTag(tag: string): string | null {
  const match = tag.match(/^enroll-course-(.+)$/)
  return match ? match[1] : null
}

function parseUnenrollCourseFromTag(tag: string): string | null {
  const match = tag.match(/^unenroll-course-(.+)$/)
  return match ? match[1] : null
}

export async function handleGhlToZenler(
  eventKey: string,
  payload: any,
  connection: Connection
) {
  const { zenlerApiKey, zenlerDomain } = connection

  if (!zenlerApiKey || !zenlerDomain) {
    throw new Error('Zenler API key and domain are required for GHL → Zenler events')
  }

  // Extract contact info from GHL payload
  const email = payload.email || payload.contact?.email
  const firstName = payload.firstName || payload.first_name || payload.contact?.firstName || ''
  const lastName = payload.lastName || payload.last_name || payload.contact?.lastName || ''

  switch (eventKey) {
    case 'contact.created':
      return zenlerRegisterUser(zenlerApiKey, zenlerDomain, {
        email,
        firstName,
        lastName,
      })

    case 'contact.updated': {
      const user = await zenlerGetUser(zenlerApiKey, zenlerDomain, email)
      if (!user) {
        // Register if not found
        return zenlerRegisterUser(zenlerApiKey, zenlerDomain, { email, firstName, lastName })
      }
      return { updated: true, user }
    }

    case 'contact.deleted': {
      // Zenler doesn't support deletion via API — log it
      return { action: 'logged', note: 'Zenler does not support user deletion via API' }
    }

    case 'tag.added': {
      const tag = payload.tag || payload.tags?.[0]
      if (!tag) return { skipped: 'no tag in payload' }

      const courseId = parseCourseIdFromTag(tag)
      if (!courseId) return { skipped: `tag "${tag}" doesn't match enroll-course-{id} pattern` }

      // Ensure user exists in Zenler
      try {
        await zenlerGetUser(zenlerApiKey, zenlerDomain, email)
      } catch {
        await zenlerRegisterUser(zenlerApiKey, zenlerDomain, { email, firstName, lastName })
      }

      return zenlerEnrollUser(zenlerApiKey, zenlerDomain, { email, courseId })
    }

    case 'tag.removed': {
      const tag = payload.tag || payload.tags?.[0]
      if (!tag) return { skipped: 'no tag in payload' }

      const courseId = parseUnenrollCourseFromTag(tag)
      if (!courseId) return { skipped: `tag "${tag}" doesn't match unenroll-course-{id} pattern` }

      return zenlerUnenrollUser(zenlerApiKey, zenlerDomain, { email, courseId })
    }

    case 'opportunity.created': {
      // Register user if they don't exist
      try {
        await zenlerGetUser(zenlerApiKey, zenlerDomain, email)
      } catch {
        await zenlerRegisterUser(zenlerApiKey, zenlerDomain, { email, firstName, lastName })
      }
      return { registered: true, email }
    }

    case 'opportunity.won': {
      const courseId = payload.customFields?.zenler_course_id || payload.zenlerCourseId
      if (!courseId) return { skipped: 'no zenler_course_id in opportunity custom fields' }

      try {
        await zenlerGetUser(zenlerApiKey, zenlerDomain, email)
      } catch {
        await zenlerRegisterUser(zenlerApiKey, zenlerDomain, { email, firstName, lastName })
      }

      return zenlerEnrollUser(zenlerApiKey, zenlerDomain, { email, courseId })
    }

    case 'opportunity.status_changed': {
      const newStatus = payload.status || payload.pipelineStage
      return { logged: true, newStatus, note: 'Status change logged — configure stage mapping to trigger Zenler actions' }
    }

    default:
      throw new Error(`Unknown GHL event: ${eventKey}`)
  }
}

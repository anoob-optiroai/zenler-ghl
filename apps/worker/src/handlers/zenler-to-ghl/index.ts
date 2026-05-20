// Connection type inlined to avoid Prisma client version mismatch
interface Connection {
  ghlApiKey: string
  ghlLocationId: string
  zenlerApiKey?: string | null
  zenlerDomain?: string | null
}
import {
  ghlUpsertContact,
  ghlAddTags,
  ghlRemoveTags,
  ghlUpdateContact,
  ghlCreateOpportunity,
  ghlGetContactByEmail,
} from '../../services/ghl'

export async function handleZenlerToGhl(
  eventKey: string,
  payload: any,
  connection: Connection
) {
  const { ghlApiKey, ghlLocationId } = connection

  // Extract common user fields from Zenler payload
  const email = payload.email || payload.user?.email
  const firstName = payload.first_name || payload.user?.first_name || ''
  const lastName = payload.last_name || payload.user?.last_name || ''

  switch (eventKey) {
    case 'user.registered':
      return ghlUpsertContact(ghlApiKey, ghlLocationId, {
        email,
        firstName,
        lastName,
        tags: ['zenler-registered'],
      })

    case 'enrollment.created': {
      const courseName = payload.course?.title || payload.course_title || 'Unknown Course'
      const contact = await ghlUpsertContact(ghlApiKey, ghlLocationId, { email, firstName, lastName })
      const contactId = contact?.contact?.id || contact?.id
      if (contactId) {
        await ghlAddTags(ghlApiKey, contactId, [
          `zenler-enrolled`,
          `course-${slugify(courseName)}`,
        ])
      }
      return contact
    }

    case 'enrollment.cancelled': {
      const contact = await ghlGetContactByEmail(ghlApiKey, ghlLocationId, email)
      if (contact?.id) {
        const courseName = payload.course?.title || payload.course_title || ''
        await ghlRemoveTags(ghlApiKey, contact.id, [
          'zenler-enrolled',
          `course-${slugify(courseName)}`,
        ])
        await ghlAddTags(ghlApiKey, contact.id, ['zenler-unenrolled'])
      }
      return { contactId: contact?.id }
    }

    case 'lesson.completed': {
      const contact = await ghlGetContactByEmail(ghlApiKey, ghlLocationId, email)
      if (contact?.id) {
        const progress = payload.progress_percentage || ''
        await ghlUpdateContact(ghlApiKey, contact.id, {
          customFields: [{ key: 'zenler_lesson_progress', field_value: String(progress) }],
        })
        await ghlAddTags(ghlApiKey, contact.id, ['zenler-lesson-completed'])
      }
      return { contactId: contact?.id }
    }

    case 'course.completed': {
      const contact = await ghlGetContactByEmail(ghlApiKey, ghlLocationId, email)
      if (contact?.id) {
        const courseName = payload.course?.title || ''
        await ghlAddTags(ghlApiKey, contact.id, [
          'zenler-course-completed',
          `completed-${slugify(courseName)}`,
        ])
      }
      return { contactId: contact?.id }
    }

    case 'payment.received': {
      const contact = await ghlUpsertContact(ghlApiKey, ghlLocationId, { email, firstName, lastName })
      const contactId = contact?.contact?.id || contact?.id
      if (contactId) {
        await ghlAddTags(ghlApiKey, contactId, ['zenler-paid'])
        await ghlCreateOpportunity(ghlApiKey, ghlLocationId, {
          contactId,
          name: payload.product_name || 'Zenler Purchase',
          status: 'won',
          monetaryValue: payload.amount || 0,
        })
      }
      return { contactId }
    }

    case 'payment.failed': {
      const contact = await ghlGetContactByEmail(ghlApiKey, ghlLocationId, email)
      if (contact?.id) {
        await ghlAddTags(ghlApiKey, contact.id, ['zenler-payment-failed'])
      }
      return { contactId: contact?.id }
    }

    case 'subscription.cancelled': {
      const contact = await ghlGetContactByEmail(ghlApiKey, ghlLocationId, email)
      if (contact?.id) {
        await ghlRemoveTags(ghlApiKey, contact.id, ['zenler-paid'])
        await ghlAddTags(ghlApiKey, contact.id, ['zenler-churned'])
      }
      return { contactId: contact?.id }
    }

    case 'certificate.issued': {
      const contact = await ghlGetContactByEmail(ghlApiKey, ghlLocationId, email)
      if (contact?.id) {
        const courseName = payload.course?.title || ''
        await ghlAddTags(ghlApiKey, contact.id, [
          'zenler-certified',
          `certified-${slugify(courseName)}`,
        ])
      }
      return { contactId: contact?.id }
    }

    case 'quiz.passed': {
      const contact = await ghlGetContactByEmail(ghlApiKey, ghlLocationId, email)
      if (contact?.id) {
        await ghlAddTags(ghlApiKey, contact.id, ['zenler-quiz-passed'])
        await ghlUpdateContact(ghlApiKey, contact.id, {
          customFields: [{ key: 'zenler_quiz_score', field_value: String(payload.score || '') }],
        })
      }
      return { contactId: contact?.id }
    }

    default:
      throw new Error(`Unknown Zenler event: ${eventKey}`)
  }
}

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export type EventDirection = 'ZENLER_TO_GHL' | 'GHL_TO_ZENLER'

export interface EventDefinition {
  key: string
  label: string
  description: string
  direction: EventDirection
  ghlAction?: string
  zenlerAction?: string
}

export const ZENLER_TO_GHL_EVENTS: EventDefinition[] = [
  {
    key: 'user.registered',
    label: 'User Registered',
    description: 'New user signs up on Zenler',
    direction: 'ZENLER_TO_GHL',
    ghlAction: 'Create contact in GHL',
  },
  {
    key: 'enrollment.created',
    label: 'Course Enrollment',
    description: 'Student enrolls in a course',
    direction: 'ZENLER_TO_GHL',
    ghlAction: 'Add tag + trigger workflow',
  },
  {
    key: 'enrollment.cancelled',
    label: 'Enrollment Cancelled',
    description: 'Student unenrolled from a course',
    direction: 'ZENLER_TO_GHL',
    ghlAction: 'Remove tag, trigger offboarding',
  },
  {
    key: 'lesson.completed',
    label: 'Lesson Completed',
    description: 'Student completes a lesson',
    direction: 'ZENLER_TO_GHL',
    ghlAction: 'Update custom field (progress %)',
  },
  {
    key: 'course.completed',
    label: 'Course Completed',
    description: 'Student finishes entire course',
    direction: 'ZENLER_TO_GHL',
    ghlAction: 'Add tag, move pipeline stage',
  },
  {
    key: 'payment.received',
    label: 'Payment Received',
    description: 'Successful payment on Zenler',
    direction: 'ZENLER_TO_GHL',
    ghlAction: 'Create opportunity (won)',
  },
  {
    key: 'payment.failed',
    label: 'Payment Failed',
    description: 'Payment attempt failed',
    direction: 'ZENLER_TO_GHL',
    ghlAction: 'Add tag, trigger follow-up',
  },
  {
    key: 'subscription.cancelled',
    label: 'Subscription Cancelled',
    description: 'Recurring subscription cancelled',
    direction: 'ZENLER_TO_GHL',
    ghlAction: 'Update contact, trigger churn flow',
  },
  {
    key: 'certificate.issued',
    label: 'Certificate Issued',
    description: 'Completion certificate generated',
    direction: 'ZENLER_TO_GHL',
    ghlAction: 'Add tag, update custom field',
  },
  {
    key: 'quiz.passed',
    label: 'Quiz Passed',
    description: 'Student passes a quiz',
    direction: 'ZENLER_TO_GHL',
    ghlAction: 'Update custom field, add tag',
  },
]

export const GHL_TO_ZENLER_EVENTS: EventDefinition[] = [
  {
    key: 'contact.created',
    label: 'Contact Created',
    description: 'New contact added in GHL',
    direction: 'GHL_TO_ZENLER',
    zenlerAction: 'Register user in Zenler',
  },
  {
    key: 'contact.updated',
    label: 'Contact Updated',
    description: 'Contact profile updated in GHL',
    direction: 'GHL_TO_ZENLER',
    zenlerAction: 'Update Zenler user profile',
  },
  {
    key: 'contact.deleted',
    label: 'Contact Deleted',
    description: 'Contact removed from GHL',
    direction: 'GHL_TO_ZENLER',
    zenlerAction: 'Deactivate Zenler account',
  },
  {
    key: 'tag.added',
    label: 'Tag Added',
    description: 'Tag applied to GHL contact',
    direction: 'GHL_TO_ZENLER',
    zenlerAction: 'Enroll in mapped course',
  },
  {
    key: 'tag.removed',
    label: 'Tag Removed',
    description: 'Tag removed from GHL contact',
    direction: 'GHL_TO_ZENLER',
    zenlerAction: 'Unenroll from mapped course',
  },
  {
    key: 'opportunity.created',
    label: 'Opportunity Created',
    description: 'New deal created in GHL pipeline',
    direction: 'GHL_TO_ZENLER',
    zenlerAction: 'Register user, add to waitlist',
  },
  {
    key: 'opportunity.won',
    label: 'Opportunity Won',
    description: 'Deal marked as won in GHL',
    direction: 'GHL_TO_ZENLER',
    zenlerAction: 'Enroll contact in course',
  },
  {
    key: 'opportunity.status_changed',
    label: 'Opportunity Status Changed',
    description: 'Pipeline stage changed in GHL',
    direction: 'GHL_TO_ZENLER',
    zenlerAction: 'Update Zenler enrollment status',
  },
]

export const ALL_EVENTS = [...ZENLER_TO_GHL_EVENTS, ...GHL_TO_ZENLER_EVENTS]

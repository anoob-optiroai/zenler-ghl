import axios from 'axios'

function zenlerClient(apiKey: string, domain: string) {
  return axios.create({
    baseURL: `https://${domain}/api/v1`,
    headers: {
      'X-API-KEY': apiKey,
      'Content-Type': 'application/json',
    },
  })
}

export async function zenlerRegisterUser(
  apiKey: string,
  domain: string,
  data: { email: string; firstName?: string; lastName?: string; password?: string }
) {
  const client = zenlerClient(apiKey, domain)
  const res = await client.post('/users', {
    email: data.email,
    first_name: data.firstName,
    last_name: data.lastName,
    password: data.password || generateTempPassword(),
  })
  return res.data
}

export async function zenlerEnrollUser(
  apiKey: string,
  domain: string,
  data: { email: string; courseId: string }
) {
  const client = zenlerClient(apiKey, domain)
  const res = await client.post('/enrollments', {
    email: data.email,
    course_id: data.courseId,
  })
  return res.data
}

export async function zenlerUnenrollUser(
  apiKey: string,
  domain: string,
  data: { email: string; courseId: string }
) {
  const client = zenlerClient(apiKey, domain)
  const res = await client.delete('/enrollments', {
    data: { email: data.email, course_id: data.courseId },
  })
  return res.data
}

export async function zenlerGetUser(apiKey: string, domain: string, email: string) {
  const client = zenlerClient(apiKey, domain)
  const res = await client.get(`/users?email=${encodeURIComponent(email)}`)
  return res.data
}

function generateTempPassword() {
  return Math.random().toString(36).slice(2, 10) + 'Aa1!'
}

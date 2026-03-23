const BACKEND_ORIGIN = (import.meta.env.VITE_BACKEND_ORIGIN || 'http://localhost:8000').replace(/\/+$/, '')

function toAbsoluteMediaUrl(url: string): string {
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) return url
  return `${BACKEND_ORIGIN}${url.startsWith('/') ? '' : '/'}${url}`
}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${BACKEND_ORIGIN}${path}`, {
    headers: { Accept: 'application/json' }
  })

  if (!response.ok) {
    throw new Error(`API ${path} failed: ${response.status}`)
  }

  return (await response.json()) as T
}

function asList<T>(payload: T[] | { results?: T[] } | null | undefined): T[] {
  if (Array.isArray(payload)) return payload
  if (payload && Array.isArray(payload.results)) return payload.results
  return []
}

export interface ApiProjectListItem {
  id: number
  title: string
  image: string
  category: string
  vehicle: string
  order: number
}

export interface ApiProjectDetail extends ApiProjectListItem {
  description: string
  published: boolean
  gallery: { id: number; image: string; order: number }[]
  created_at?: string
  updated_at?: string
}

export interface ApiAccordionItem {
  id: number
  title: string
  description: string
  image: string
  order: number
}

export interface ApiServiceGalleryItem {
  id: number
  image: string
  order: number
}

export async function fetchProjects(): Promise<ApiProjectListItem[]> {
  const payload = await getJson<ApiProjectListItem[] | { results?: ApiProjectListItem[] }>('/api/projects/')
  return asList(payload).map((item) => ({ ...item, image: toAbsoluteMediaUrl(item.image) }))
}

export async function fetchProjectById(id: string): Promise<ApiProjectDetail> {
  const data = await getJson<ApiProjectDetail>(`/api/projects/${id}/`)
  return {
    ...data,
    image: toAbsoluteMediaUrl(data.image),
    gallery: (data.gallery || []).map((g) => ({ ...g, image: toAbsoluteMediaUrl(g.image) }))
  }
}

export async function fetchAccordionItems(): Promise<ApiAccordionItem[]> {
  const payload = await getJson<ApiAccordionItem[] | { results?: ApiAccordionItem[] }>('/api/projects/accordion/')
  return asList(payload).map((item) => ({ ...item, image: toAbsoluteMediaUrl(item.image) }))
}

export async function fetchServiceGalleryImages(): Promise<ApiServiceGalleryItem[]> {
  const payload = await getJson<
    ApiServiceGalleryItem[] | { results?: ApiServiceGalleryItem[] }
  >('/api/projects/service-gallery/')
  return asList(payload).map((item) => ({
    ...item,
    image: toAbsoluteMediaUrl(item.image)
  }))
}

export interface BookingRequestPayload {
  name: string
  phone: string
  email: string
  brand: string
  model: string
  service: string
  message: string
  /** Honeypot: должен оставаться пустым */
  website?: string
}

export interface BookingRequestResponse {
  id: number
  status: string
  email_delivered: boolean
}

function formatBookingApiErrors(data: unknown): string {
  if (!data || typeof data !== 'object') {
    return 'Не удалось отправить заявку. Попробуйте позже.'
  }
  const o = data as Record<string, unknown>
  if (typeof o.detail === 'string') return o.detail
  const parts: string[] = []
  for (const [, val] of Object.entries(o)) {
    if (Array.isArray(val) && val.length && typeof val[0] === 'string') {
      parts.push(val[0])
    } else if (typeof val === 'string') {
      parts.push(val)
    }
  }
  return parts.length
    ? parts.join(' ')
    : 'Проверьте поля формы.'
}

export async function submitBookingRequest(
  payload: BookingRequestPayload
): Promise<BookingRequestResponse> {
  const response = await fetch(`${BACKEND_ORIGIN}/api/projects/booking/`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: payload.name,
      phone: payload.phone,
      email: payload.email,
      brand: payload.brand,
      model: payload.model,
      service: payload.service,
      message: payload.message,
      website: payload.website ?? ''
    })
  })

  const text = await response.text()
  let data: unknown = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = null
  }

  if (!response.ok) {
    const msg = formatBookingApiErrors(data)
    throw new Error(msg)
  }

  return data as BookingRequestResponse
}


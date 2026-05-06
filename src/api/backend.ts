const BACKEND_ORIGIN = (import.meta.env.VITE_BACKEND_ORIGIN || 'http://localhost:8000').replace(/\/+$/, '')

/** Не дергать accordion/service-gallery (например, если nginx не проксирует эти пути на проде). */
const SKIP_OPTIONAL_API =
  import.meta.env.VITE_SKIP_OPTIONAL_API === 'true' || import.meta.env.VITE_SKIP_OPTIONAL_API === '1'

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

/** GET JSON без исключения при 404/5xx — для опциональных эндпоинтов. */
async function getJsonOptional<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${BACKEND_ORIGIN}${path}`, {
      headers: { Accept: 'application/json' }
    })
    if (!response.ok) return null
    return (await response.json()) as T
  } catch {
    return null
  }
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
  preparation_stages?: { id: number; title: string; text: string; photo: string | null; order: number }[]
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

export interface ApiContactSettings {
  email: string
  phone_display: string
  phone_tel: string
  telegram_url: string
  whatsapp_url: string
  vk_url: string
  map_embed_url: string
  coordinates_label: string
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
    gallery: (data.gallery || []).map((g) => ({ ...g, image: toAbsoluteMediaUrl(g.image) })),
    preparation_stages: (data.preparation_stages || []).map((s) => ({
      ...s,
      photo: s.photo ? toAbsoluteMediaUrl(s.photo) : null
    }))
  }
}

/**
 * Пункты аккордеона «Чем мы занимаемся» / страница «Сервис».
 * - `null` — эндпоинт отключён (VITE_SKIP_OPTIONAL_API), недоступен или ошибка сети → на странице остаётся статический запас.
 * - `[]` — с бэка пришёл пустой список (например, нет опубликованных записей) → показываем только его.
 */
export async function fetchAccordionItems(): Promise<ApiAccordionItem[] | null> {
  if (SKIP_OPTIONAL_API) return null
  const payload = await getJsonOptional<ApiAccordionItem[] | { results?: ApiAccordionItem[] }>(
    '/api/projects/accordion/'
  )
  if (!payload) return null
  return asList(payload).map((item) => ({ ...item, image: toAbsoluteMediaUrl(item.image) }))
}

export async function fetchServiceGalleryImages(): Promise<ApiServiceGalleryItem[]> {
  if (SKIP_OPTIONAL_API) return []
  const payload = await getJsonOptional<
    ApiServiceGalleryItem[] | { results?: ApiServiceGalleryItem[] }
  >('/api/projects/service-gallery/')
  if (!payload) return []
  return asList(payload).map((item) => ({
    ...item,
    image: toAbsoluteMediaUrl(item.image)
  }))
}

export async function fetchContactSettings(): Promise<ApiContactSettings> {
  return await getJson<ApiContactSettings>('/api/projects/contact/')
}

export interface ApiTestimonial {
  id: number
  quote: string
  name: string
  car: string
  rating: number | null
  source: string
  yandex_author_url: string
  order: number
  created_at?: string
}

export interface ApiTestimonialsSettings {
  mode: string
  yandex_widget_url: string
}

export interface ApiTestimonialsResponse {
  settings: ApiTestimonialsSettings
  results: ApiTestimonial[]
}

/**
 * Отзывы для блока на главной + настройки (ссылка «все отзывы» с Яндекс.Карт).
 */
export async function fetchTestimonials(): Promise<ApiTestimonialsResponse | null> {
  try {
    return await getJson<ApiTestimonialsResponse>('/api/projects/testimonials/')
  } catch {
    return null
  }
}

/** Активные новинки с бэка (GET /api/projects/novinki/). */
export interface ApiNovelty {
  id: number
  title: string
  description: string
  image: string
  starts_at: string
  ends_at: string
  order: number
}

function formatNoveltyDate(iso: string): string {
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return ''
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
  } catch {
    return ''
  }
}

function excerptFromDescription(text: string, maxLen = 220): string {
  const t = (text || '').trim()
  if (t.length <= maxLen) return t
  return `${t.slice(0, maxLen).trimEnd()}…`
}

/**
 * Главная новость / новинка для виджета на главной.
 * 1) GET /api/projects/novinki/ — первая активная новинка (как в Django).
 * 2) при отсутствии — GET /api/projects/news/featured/ (если когда-то появится).
 */
export interface ApiNewsFeatured {
  id: number
  title: string
  date_display: string
  excerpt: string
  content: string
  image: string | null
}

export async function fetchNovinki(): Promise<ApiNovelty[]> {
  const raw = await getJsonOptional<ApiNovelty[]>('/api/projects/novinki/')
  if (!raw || !Array.isArray(raw)) return []
  return raw.map((n) => ({
    ...n,
    image: n.image ? toAbsoluteMediaUrl(n.image) : ''
  }))
}

export async function fetchFeaturedNews(): Promise<ApiNewsFeatured | null> {
  const list = await fetchNovinki()
  if (list.length > 0) {
    const n = list[0]
    return {
      id: n.id,
      title: n.title,
      date_display: formatNoveltyDate(n.starts_at),
      excerpt: excerptFromDescription(n.description),
      content: n.description,
      image: n.image?.trim() ? n.image : null
    }
  }

  const legacy = await getJsonOptional<ApiNewsFeatured>('/api/projects/news/featured/')
  if (!legacy) return null
  return {
    ...legacy,
    image: legacy.image ? toAbsoluteMediaUrl(legacy.image) : null
  }
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

export interface CallbackRequestPayload {
  name: string
  phone: string
  /** Honeypot: должен оставаться пустым */
  website?: string
}

export interface CallbackRequestResponse {
  id: number
  status: string
  email_delivered: boolean
}

export async function submitCallbackRequest(
  payload: CallbackRequestPayload
): Promise<CallbackRequestResponse> {
  const response = await fetch(`${BACKEND_ORIGIN}/api/projects/callback/`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: payload.name,
      phone: payload.phone,
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

  return data as CallbackRequestResponse
}


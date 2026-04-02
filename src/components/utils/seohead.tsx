import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const BASE_URL = (
  import.meta.env.VITE_SITE_URL ||
  (typeof window !== 'undefined' ? window.location.origin : 'https://pickupservice.moscow')
).replace(/\/+$/, '')

type SeoConfig = {
  title: string
  description: string
}

const DEFAULT_SEO: SeoConfig = {
  title: 'Пикап Сервис Москва — ремонт и тюнинг пикапов и внедорожников',
  description:
    'Пикап Сервис (ПикапСервис) в Москве: обслуживание, ремонт и тюнинг пикапов, джипов и внедорожников. Подготовка к экспедициям, трофи-рейды, диагностика и ТО.'
}

const SEO_BY_ROUTE: Record<string, SeoConfig> = {
  '/': {
    title: 'Пикап Сервис — ремонт, тюнинг и обслуживание внедорожников в Москве | pickupservice.moscow',
    description:
      'Официальный сайт Пикап Сервис в Москве: сервис пикапов и джипов, ремонт и модификация внедорожников, экспедиционная подготовка. Запись и контакты на pickupservice.moscow.'
  },
  '/service': {
    title: 'Услуги ПикапСервис - обслуживание и ремонт внедорожников',
    description:
      'Направления сервиса: модификации, техническое обслуживание и ремонт внедорожников. Работаем с японскими пикапами и джипами.'
  },
  '/portfolio': {
    title: 'Портфолио ПикапСервис - проекты и работы',
    description:
      'Изучите проекты ПикапСервис: подготовка внедорожников, инженерные доработки, экспедиционные решения и авторские сборки.'
  },
  '/contact': {
    title: 'Контакты ПикапСервис - как нас найти',
    description:
      'Контакты и координаты ПикапСервис в Москве. Свяжитесь с нами по телефону или почте и приезжайте на диагностику.'
  },
  '/booking': {
    title: 'Запись в ПикапСервис - заявка на обслуживание',
    description:
      'Оставьте заявку на обслуживание, диагностику, ремонт или тюнинг внедорожника. Быстрая запись в ПикапСервис.'
  }
}

function setMeta(name: string, content: string): void {
  let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('name', name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setOg(property: string, content: string): void {
  let el = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('property', property)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setCanonical(url: string): void {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
  if (!link) {
    link = document.createElement('link')
    link.setAttribute('rel', 'canonical')
    document.head.appendChild(link)
  }
  link.setAttribute('href', url)
}

export default function SeoHead() {
  const { pathname } = useLocation()

  useEffect(() => {
    const config =
      SEO_BY_ROUTE[pathname] ??
      (pathname.startsWith('/portfolio/')
        ? {
            title: 'Проект ПикапСервис - портфолио внедорожников',
            description:
              'Детальный кейс по подготовке внедорожника: этапы работ, технические решения и итоговый результат от ПикапСервис.'
          }
        : DEFAULT_SEO)

    const canonicalUrl = `${BASE_URL}${pathname === '/' ? '/' : pathname}`

    document.title = config.title
    setMeta('description', config.description)
    setOg('og:title', config.title)
    setOg('og:description', config.description)
    setOg('og:url', canonicalUrl)
    setCanonical(canonicalUrl)

    const keywords =
      pathname === '/'
        ? 'Пикап Сервис, ПикапСервис, пикап сервис Москва, ремонт пикапов Москва, тюнинг внедорожников, сервис джипов, обслуживание пикапов, pickupservice.moscow'
        : 'Пикап Сервис, ПикапСервис, ремонт внедорожников Москва, тюнинг пикапов'
    setMeta('keywords', keywords)
  }, [pathname])

  return null
}

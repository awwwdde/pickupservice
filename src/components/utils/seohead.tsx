import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { isPrerenderEnv } from '../../utils/isPrerender'

const BASE_URL = (
  import.meta.env.VITE_SITE_URL ||
  (isPrerenderEnv() ? 'https://pickupservice.moscow' : typeof window !== 'undefined' ? window.location.origin : 'https://pickupservice.moscow')
).replace(/\/+$/, '')

const DEFAULT_OG_IMAGE = `${BASE_URL}/pickup.png`

type SeoConfig = {
  title: string
  description: string
}

const DEFAULT_SEO: SeoConfig = {
  title: 'ПикапсервисМСК — ремонт и тюнинг пикапов и внедорожников',
  description:
    'ПикапсервисМСК в Москве: ремонт и тюнинг пикапов, джипов и внедорожников (Toyota, Nissan, Mitsubishi, Ford, УАЗ). 4x4 experience: off-road service, expedition build, suspension lift, winch, snorkel, armor.'
}

const SEO_BY_ROUTE: Record<string, SeoConfig> = {
  '/': {
    title: 'ПикапсервисМСК — ремонт, тюнинг и обслуживание внедорожников в Москве | pickupservice.moscow',
    description:
      'Автосервис для пикапов и внедорожников в Москве: ремонт Toyota Hilux, Land Cruiser, Prado, Nissan Patrol и Navara, Mitsubishi Pajero, Ford Ranger, УАЗ; тюнинг 4x4, ТО, диагностика, экспедиционная подготовка, трофи, лебёдки, силовые бамперы, шноркели, подвеска. 4x4 experience на русском и английском.'
  },
  '/service': {
    title: 'Услуги ПикапСервис — ремонт, тюнинг и доработка внедорожников и пикапов',
    description:
      'Услуги: ремонт и тюнинг внедорожников и пикапов, ТО и диагностика полного привода, усиление подвески и лифт, лебёдки и силовые бамперы, шноркели, защита, экспедиционная подготовка, детейлинг, подготовка к трофи и бездорожью.'
  },
  '/portfolio': {
    title: 'Портфолио ПикапСервис — проекты по подготовке внедорожников и пикапов',
    description:
      'Реализованные проекты: тюнинг и ремонт внедорожников, экспедиционные сборки, доработки для трофи и путешествий, инженерные решения для пикапов и джипов.'
  },
  '/contact': {
    title: 'Контакты ПикапсервисМСК Москва — адрес, телефон, как добраться',
    description:
      'Контакты автосервиса ПикапсервисМСК в Москве: телефон, почта, адрес на карте. Диагностика, ремонт и тюнинг пикапов и внедорожников.'
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

function setHreflang(hreflang: string, href: string): void {
  let link = document.querySelector(
    `link[rel="alternate"][hreflang="${hreflang}"]`
  ) as HTMLLinkElement | null
  if (!link) {
    link = document.createElement('link')
    link.setAttribute('rel', 'alternate')
    link.setAttribute('hreflang', hreflang)
    document.head.appendChild(link)
  }
  link.setAttribute('href', href)
}

export default function SeoHead() {
  const { pathname } = useLocation()

  useEffect(() => {
    const config =
      SEO_BY_ROUTE[pathname] ??
      (pathname.startsWith('/portfolio/')
        ? {
            title: 'Проект ПикапСервис — кейс по ремонту и тюнингу внедорожника',
            description:
              'Проект автосервиса ПикапСервис: ремонт или тюнинг внедорожника или пикапа, этапы работ, доработки для экспедиции или трофи, фото и описание результата.'
          }
        : DEFAULT_SEO)

    const canonicalUrl = `${BASE_URL}${pathname === '/' ? '/' : pathname}`

    document.title = config.title
    setMeta('description', config.description)
    setOg('og:title', config.title)
    setOg('og:description', config.description)
    setOg('og:url', canonicalUrl)
    setOg('og:image', DEFAULT_OG_IMAGE)
    setOg('og:image:type', 'image/png')
    setMeta('twitter:image', DEFAULT_OG_IMAGE)
    setCanonical(canonicalUrl)
    setHreflang('ru', canonicalUrl)
    setHreflang('x-default', `${BASE_URL}/`)

    const keywords =
      pathname === '/'
        ? 'ПикапсервисМСК, Пикап Сервис МСК, pickupservice.moscow, pickup service moscow, 4x4 experience, 4x4 experience москва, off-road service moscow, repair pickup truck moscow, suv tuning moscow, ремонт пикапов, тюнинг внедорожников, сервис джипов 4x4, Toyota Hilux Land Cruiser Prado, Nissan Patrol Navara, Mitsubishi Pajero, Ford Ranger, УАЗ, экспедиционная подготовка, трофи рейд бездорожье, лебёдка шноркель бампер, лифт подвеска, диагностика ТО'
        : pathname === '/service'
          ? 'услуги автосервиса внедорожников, ремонт пикапа Москва, тюнинг 4x4, 4x4 workshop moscow, offroad preparation, ТО полный привод, диагностика ходовой, усиление подвески, лебёдка установка, шноркель силовой бампер, защита картера, экспедиция трофи, детейлинг внедорожник'
          : pathname === '/portfolio'
            ? 'портфолио тюнинг внедорожников, проекты пикапов, ремонт джипов примеры, expedition project cars, doborudovanie 4x4, экспедиционные машины, доработки 4x4 фото, трофи подготовка кейсы'
            : pathname === '/contact'
              ? 'ПикапсервисМСК адрес телефон, автосервис внедорожников Москва контакты, как добраться, yandex maps pickupservice'
              : pathname.startsWith('/portfolio/')
                ? 'проект ремонт внедорожник, тюнинг кейс, подготовка экспедиция, трофи доработки, offroad build case'
                : 'ПикапсервисМСК, ремонт внедорожников Москва, тюнинг пикапов, сервис 4x4, pickupservice.moscow'
    setMeta('keywords', keywords)
  }, [pathname])

  return null
}

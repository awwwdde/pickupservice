import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()
const rawUrl = process.env.VITE_SITE_URL || 'https://pickupservice.moscow/'
const siteUrl = rawUrl.replace(/\/+$/, '')
const host = siteUrl.replace(/^https?:\/\//, '')

// Если VITE_BACKEND_ORIGIN не задан, пробуем считать backend тем же доменом, что и сайт.
// Это помогает собрать sitemap по /portfolio/:id в прод/стейдж окружениях.
const BACKEND_ORIGIN = (process.env.VITE_BACKEND_ORIGIN || siteUrl || 'http://localhost:8000').replace(/\/+$/, '')

async function fetchJson(path) {
  const response = await fetch(`${BACKEND_ORIGIN}${path}`, {
    headers: { Accept: 'application/json' }
  })
  if (!response.ok) throw new Error(`API ${path} failed: ${response.status}`)
  return await response.json()
}

function asList(payload) {
  if (Array.isArray(payload)) return payload
  if (payload && Array.isArray(payload.results)) return payload.results
  return []
}

async function buildRoutes() {
  const baseRoutes = ['/', '/service', '/portfolio', '/contact', '/booking']
  const featured = ['/portfolio/f1', '/portfolio/f2', '/portfolio/f3']

  try {
    const projects = await fetchJson('/api/projects/')
    const list = asList(projects)
    const projectRoutes = list
      .map((p) => String(p.id))
      .filter(Boolean)
      .map((id) => `/portfolio/${id}`)

    // Убираем дубли, сохраняем порядок: базовые -> featured -> остальные
    const uniq = [...baseRoutes, ...featured, ...projectRoutes]
    return Array.from(new Set(uniq))
  } catch {
    return [...baseRoutes, ...featured]
  }
}

function buildSitemap() {
  // Важно: функция ниже вызывается синхронно в текущем скрипте.
  // Поэтому routes вычисляем заранее в топ-левеле через async IIFE (см. ниже).
  throw new Error('buildSitemap() must be called with prepared routes')
}

function buildSitemapWithRoutes(routes) {
  const priorities = {
    '/': '1.0',
    '/service': '0.9',
    '/portfolio': '0.9',
    '/contact': '0.8',
    '/booking': '0.9',
    '/portfolio/f1': '0.7',
    '/portfolio/f2': '0.7',
    '/portfolio/f3': '0.7'
  }

  const freq = {
    '/': 'weekly',
    '/service': 'weekly',
    '/portfolio': 'weekly',
    '/contact': 'monthly',
    '/booking': 'weekly',
    '/portfolio/f1': 'monthly',
    '/portfolio/f2': 'monthly',
    '/portfolio/f3': 'monthly'
  }

  const urls = routes
    .map((route) => {
      const loc = `${siteUrl}${route}`
      return [
        '  <url>',
        `    <loc>${loc}</loc>`,
        `    <changefreq>${freq[route] ?? 'monthly'}</changefreq>`,
        `    <priority>${priorities[route] ?? '0.7'}</priority>`,
        '  </url>'
      ].join('\n')
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
}

function buildRobots() {
  return [
    'User-agent: *',
    'Allow: /',
    '',
    'User-agent: Googlebot',
    'Allow: /',
    '',
    'User-agent: Bingbot',
    'Allow: /',
    '',
    'User-agent: Yandex',
    'Allow: /',
    '',
    `Host: ${host}`,
    `Sitemap: ${siteUrl}/sitemap.xml`,
    ''
  ].join('\n')
}

function patchIndexHtml() {
  const indexPath = resolve(root, 'index.html')
  let html = readFileSync(indexPath, 'utf8')

  html = html
    .replace(/<link rel="canonical" href="https?:\/\/[^"]*"\s*\/?>/, `<link rel="canonical" href="${siteUrl}/" />`)
    .replace(
      /<link rel="alternate" hreflang="ru" href="https?:\/\/[^"]*"\s*\/?>/,
      `<link rel="alternate" hreflang="ru" href="${siteUrl}/" />`
    )
    .replace(
      /<link rel="alternate" hreflang="x-default" href="https?:\/\/[^"]*"\s*\/?>/,
      `<link rel="alternate" hreflang="x-default" href="${siteUrl}/" />`
    )
    .replace(/<meta property="og:url" content="https?:\/\/[^"]*"\s*\/?>/, `<meta property="og:url" content="${siteUrl}/" />`)
    .replace(/<meta property="og:image" content="https?:\/\/[^"]*"\s*\/?>/, `<meta property="og:image" content="${siteUrl}/pickup.png" />`)
    .replace(/<meta name="twitter:image" content="https?:\/\/[^"]*"\s*\/?>/, `<meta name="twitter:image" content="${siteUrl}/pickup.png" />`)
    .replace(/"url":\s*"https?:\/\/[^"]*\/"/, `"url": "${siteUrl}/"`)
    .replace(/"image":\s*"https?:\/\/[^"]*"/, `"image": "${siteUrl}/pickup.png"`)

  writeFileSync(indexPath, html)
}

;(async () => {
  const routes = await buildRoutes()
  routes.sort((a, b) => {
    if (a === '/') return -1
    if (b === '/') return 1
    return a.localeCompare(b)
  })
  writeFileSync(resolve(root, 'public', 'sitemap.xml'), buildSitemapWithRoutes(routes))
  writeFileSync(resolve(root, 'public', 'robots.txt'), buildRobots())
  patchIndexHtml()

  console.log(`SEO files generated for ${siteUrl} (${routes.length} routes)`)
})()

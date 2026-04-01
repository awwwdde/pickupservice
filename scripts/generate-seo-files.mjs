import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()
const rawUrl = process.env.VITE_SITE_URL || 'https://pickupservice.moscow/'
const siteUrl = rawUrl.replace(/\/+$/, '')
const host = siteUrl.replace(/^https?:\/\//, '')

const routes = ['/', '/service', '/portfolio', '/contact', '/booking', '/portfolio/f1', '/portfolio/f2', '/portfolio/f3']

function buildSitemap() {
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
        `    <changefreq>${freq[route]}</changefreq>`,
        `    <priority>${priorities[route]}</priority>`,
        '  </url>'
      ].join('\n')
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
}

function buildRobots() {
  return `User-agent: *\nAllow: /\n\nHost: ${host}\nSitemap: ${siteUrl}/sitemap.xml\n`
}

function patchIndexHtml() {
  const indexPath = resolve(root, 'index.html')
  let html = readFileSync(indexPath, 'utf8')

  html = html
    .replace(/<link rel="canonical" href="https?:\/\/[^"]*"\s*\/?>/, `<link rel="canonical" href="${siteUrl}/" />`)
    .replace(/<meta property="og:url" content="https?:\/\/[^"]*"\s*\/?>/, `<meta property="og:url" content="${siteUrl}/" />`)
    .replace(/<meta property="og:image" content="https?:\/\/[^"]*"\s*\/?>/, `<meta property="og:image" content="${siteUrl}/vite.svg" />`)
    .replace(/<meta name="twitter:image" content="https?:\/\/[^"]*"\s*\/?>/, `<meta name="twitter:image" content="${siteUrl}/vite.svg" />`)
    .replace(/"url":\s*"https?:\/\/[^"]*\/"/, `"url": "${siteUrl}/"`)
    .replace(/"image":\s*"https?:\/\/[^"]*"/, `"image": "${siteUrl}/vite.svg"`)

  writeFileSync(indexPath, html)
}

writeFileSync(resolve(root, 'public', 'sitemap.xml'), buildSitemap())
writeFileSync(resolve(root, 'public', 'robots.txt'), buildRobots())
patchIndexHtml()

console.log(`SEO files generated for ${siteUrl}`)

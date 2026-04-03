/// <reference types="vite/client" />
import { defineConfig } from 'vite'
import type { PluginOption } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import fs from 'node:fs'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
type VitePrerenderFn = ((options: unknown) => PluginOption) & {
  PuppeteerRenderer: new (options: unknown) => unknown
}
const vitePrerender = require('vite-plugin-prerender') as VitePrerenderFn

// https://vite.dev/config/
function readSitemapRoutes() {
  const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml')
  try {
    const xml = fs.readFileSync(sitemapPath, 'utf8')
    const locs = Array.from(xml.matchAll(/<loc>(.*?)<\/loc>/g), (m: RegExpMatchArray) => m[1])
    const routes = locs
      .map((loc) => {
        try {
          const u = new URL(loc)
          return u.pathname
        } catch {
          return null
        }
      })
      .filter((p): p is string => Boolean(p))

    // На всякий случай уберём пустышку и дубли
    return Array.from(new Set(routes)).filter(Boolean)
  } catch {
    return ['/']
  }
}

const prerenderRoutes = readSitemapRoutes()
const PuppeteerRenderer = vitePrerender.PuppeteerRenderer

/**
 * Prerender требует скачанный Chromium (puppeteer). В CI/на сервере без браузера
 * сборка падала. Включите вручную: VITE_PRERENDER=1 pnpm run build
 */
const enablePrerender =
  process.env.VITE_PRERENDER === 'true' || process.env.VITE_PRERENDER === '1'

export default defineConfig({
  build: {
    // Понижаем таргет сборки, чтобы даже старый Chromium Puppeteer смог
    // распарсить итоговый JS (иначе `Unexpected token '?'`).
    target: 'es2018',
  },
  plugins: [
    react(),
    ...(enablePrerender
      ? [
          vitePrerender({
            staticDir: path.join(process.cwd(), 'dist'),
            routes: prerenderRoutes,
            renderer: new PuppeteerRenderer({
              headless: true,
              injectProperty: '__PRERENDER_INJECTED',
              inject: { isPrerender: true },
              renderAfterTime: 8000
            }),
            server: {
              host: '127.0.0.1',
              port: 8001
            }
          })
        ]
      : [])
  ]
})

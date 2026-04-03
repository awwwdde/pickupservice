import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import fs from 'node:fs'
import vitePrerender from 'vite-plugin-prerender'

// https://vite.dev/config/
function readSitemapRoutes() {
  const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml')
  try {
    const xml = fs.readFileSync(sitemapPath, 'utf8')
    const locs = Array.from(xml.matchAll(/<loc>(.*?)<\/loc>/g)).map((m) => m[1])
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
const PuppeteerRenderer = (vitePrerender as unknown as {
  PuppeteerRenderer: new (options: unknown) => unknown
}).PuppeteerRenderer

export default defineConfig({
  build: {
    // Понижаем таргет сборки, чтобы даже старый Chromium Puppeteer смог
    // распарсить итоговый JS (иначе `Unexpected token '?'`).
    target: 'es2018',
  },
  plugins: [
    react(),
    vitePrerender({
      staticDir: path.join(process.cwd(), 'dist'),
      routes: prerenderRoutes,
      // Ждём, пока React реально отрисует контент (минимум один h1).
      // Иначе prerenderer сохраняет пустой root.
      renderer: new PuppeteerRenderer({
        headless: true,
        injectProperty: '__PRERENDER_INJECTED',
        inject: { isPrerender: true },
        // Ждём немного времени, чтобы React успел смонтировать контент.
        // Тег h1 на главной может отсутствовать на текущем этапе, поэтому не ждём его.
        renderAfterTime: 8000,
      }),
      server: {
        host: '127.0.0.1',
        port: 8001
      }
    })
  ],
})

/// <reference types="vite/client" />

declare module '*.png' {
  const src: string
  export default src
}
declare module '*.jpg' {
  const src: string
  export default src
}
declare module '*.jpeg' {
  const src: string
  export default src
}
declare module '*.svg' {
  const src: string
  export default src
}
declare module '*.webp' {
  const src: string
  export default src
}
declare module '*.webm' {
  const src: string
  export default src
}

interface ImportMetaEnv {
  readonly VITE_SITE_URL?: string
  readonly VITE_BACKEND_ORIGIN?: string
  /** "1" или "true" — не запрашивать accordion и service-gallery (см. .env.example) */
  readonly VITE_SKIP_OPTIONAL_API?: string
  /** Включить prerender при сборке (нужен Chromium / puppeteer) */
  readonly VITE_PRERENDER?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

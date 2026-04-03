export function isPrerenderEnv(): boolean {
  return typeof window !== 'undefined' && Boolean(window.__PRERENDER_INJECTED)
}


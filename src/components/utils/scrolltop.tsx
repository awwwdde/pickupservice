import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { isPrerenderEnv } from '../../utils/isPrerender'

const ScrollToTop = () => {
  const { pathname } = useLocation()
  const isPrerender = isPrerenderEnv()

  useEffect(() => {
    if (isPrerender) return
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
  }, [isPrerender])

  useEffect(() => {
    if (isPrerender) return
    const doScrollTop = () => {
      window.scrollTo(0, 0)
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
    }
    doScrollTop()
    const raf1 = requestAnimationFrame(() => {
      doScrollTop()
      const raf2 = requestAnimationFrame(doScrollTop)
      ;(ScrollToTop as unknown as { __raf2?: number }).__raf2 = raf2
    })

    return () => {
      cancelAnimationFrame(raf1)
      const maybe = (ScrollToTop as unknown as { __raf2?: number }).__raf2
      if (typeof maybe === 'number') cancelAnimationFrame(maybe)
    }
  }, [pathname, isPrerender])

  return null
}

export default ScrollToTop
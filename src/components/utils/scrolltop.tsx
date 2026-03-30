import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const ScrollToTop = () => {
  const { pathname } = useLocation()

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
  }, [])

  useEffect(() => {
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
  }, [pathname])

  return null
}

export default ScrollToTop
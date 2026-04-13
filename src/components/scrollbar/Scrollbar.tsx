import type { FC } from 'react'
import { useCallback, useEffect, useRef } from 'react'
import { motion, useScroll, useSpring } from 'framer-motion'
import { isPrerenderEnv } from '../../utils/isPrerender'

const Scrollbar: FC = () => {
  const isPrerender = isPrerenderEnv()
  const { scrollYProgress } = useScroll()
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })

  const draggingRef = useRef(false)

  const getScrollMetrics = useCallback(() => {
    const doc = document.documentElement
    const scrollTop = window.scrollY || doc.scrollTop || 0
    const scrollHeight = doc.scrollHeight || 0
    const clientHeight = doc.clientHeight || window.innerHeight || 0
    const maxScrollTop = Math.max(0, scrollHeight - clientHeight)
    return { scrollTop, scrollHeight, clientHeight, maxScrollTop }
  }, [])

  const scrollToProgress = useCallback(
    (p: number) => {
      const { maxScrollTop } = getScrollMetrics()
      window.scrollTo({ top: Math.round(maxScrollTop * Math.min(1, Math.max(0, p))) })
    },
    [getScrollMetrics],
  )

  const onPointerMove = useCallback(
    (e: PointerEvent) => {
      if (!draggingRef.current) return
      const h = window.innerHeight || document.documentElement.clientHeight || 1
      const p = h > 0 ? e.clientY / h : 0
      scrollToProgress(p)
    },
    [scrollToProgress],
  )

  const endDrag = useCallback(() => {
    draggingRef.current = false
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', endDrag)
    window.removeEventListener('pointercancel', endDrag)
  }, [onPointerMove])

  const startDrag = useCallback(() => {
    draggingRef.current = true
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerup', endDrag)
    window.addEventListener('pointercancel', endDrag)
  }, [endDrag, onPointerMove])

  const onBarPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.button !== 0) return
      const h = window.innerHeight || document.documentElement.clientHeight || 1
      const p = h > 0 ? e.clientY / h : 0
      scrollToProgress(p)
      startDrag()
    },
    [scrollToProgress, startDrag],
  )

  useEffect(() => {
    if (isPrerender) return
    return () => endDrag()
  }, [endDrag, isPrerender])

  if (isPrerender) return null
  return (
    <div className="fixed top-0 right-0 bottom-0 z-[900] pointer-events-none">
      {/* Широкая зона захвата для мыши/пальца, чтобы было удобно тянуть */}
      <div
        className="absolute top-0 right-0 bottom-0 w-[16px] pointer-events-auto"
        style={{ touchAction: 'none' }}
        onPointerDown={onBarPointerDown}
        aria-hidden
      />

      {/* Визуально — как было: тонкая полоска 3px, растёт по scaleY */}
      <motion.div
        style={{ scaleY }}
        className="absolute top-0 right-0 bottom-0 w-[3px] bg-[#FF8201] origin-top pointer-events-none"
        aria-hidden
      />
    </div>
  )
}

export default Scrollbar
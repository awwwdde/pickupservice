import { useEffect, useState } from 'react'
import { isPrerenderEnv } from '../utils/isPrerender'

export type TabletLayoutMode = 'none' | 'portrait' | 'landscape'

/**
 * Книжный / альбомный планшет (согласовано с @custom-variant в index.css).
 * ≥1280px → 'none' (PC-версия), <1280px → 'landscape', touch portrait → 'portrait'
 */
export function useTabletLayoutMode(): TabletLayoutMode {
  const isPrerender = isPrerenderEnv()
  const [mode, setMode] = useState<TabletLayoutMode>('none')

  useEffect(() => {
    if (isPrerender) return
    const portraitMq = window.matchMedia(
      '(min-width: 768px) and (max-width: 1024px) and (orientation: portrait) and (hover: none) and (pointer: coarse)',
    )
    // Любой экран 768–1279px (включая ноутбуки) → планшетный режим
    const landscapeMq = window.matchMedia('(min-width: 768px) and (max-width: 1279px)')
    const sync = () => {
      if (portraitMq.matches) setMode('portrait')
      else if (landscapeMq.matches) setMode('landscape')
      else setMode('none')
    }
    sync()
    const add = (mq: MediaQueryList, fn: () => void) => {
      if (typeof mq.addEventListener === 'function') mq.addEventListener('change', fn)
      else mq.addListener(fn)
    }
    const remove = (mq: MediaQueryList, fn: () => void) => {
      if (typeof mq.removeEventListener === 'function') mq.removeEventListener('change', fn)
      else mq.removeListener(fn)
    }
    add(portraitMq, sync)
    add(landscapeMq, sync)
    return () => {
      remove(portraitMq, sync)
      remove(landscapeMq, sync)
    }
  }, [isPrerender])

  return mode
}

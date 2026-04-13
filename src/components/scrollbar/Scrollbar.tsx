import type { FC } from 'react'
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
  if (isPrerender) return null
  return (
    <motion.div
      style={{ scaleY }}
      className="
        fixed
        top-0
        right-0
        bottom-0
        w-[3px]
        bg-[#FF8201]
        origin-top
        z-[9999]
      "
    />
  )
}

export default Scrollbar
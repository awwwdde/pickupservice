import type { FC } from 'react'
import { motion, cubicBezier } from 'framer-motion'

import { useTabletLayoutMode } from '../../hooks/useTabletLayoutMode'

const customEase = cubicBezier(0.22, 1, 0.36, 1)

interface ServiceCardProps {
  index: number
  title: string
  subtitle: string
  image: string
  isActive: boolean
  onClick: () => void
  /** На мобильной — все карточки сразу раскрыты, без аккордеона */
  alwaysExpanded?: boolean
  /** Узкий desktop 1000-1439: более компактные высоты */
  compactDesktop?: boolean
}

export const ServiceCard: FC<ServiceCardProps> = ({
  index,
  title,
  subtitle,
  image,
  isActive,
  onClick,
  alwaysExpanded = false,
  compactDesktop = false,
}) => {
  const open = alwaysExpanded || isActive
  const tabletMode = useTabletLayoutMode()

  const rowOpenHeight =
    tabletMode === 'portrait'
      ? 'min(340px,52vh)'
      : tabletMode === 'landscape'
        ? 'min(260px,38vh)'
        : compactDesktop
          ? 'min(300px,42vh)'
          : 'min(400px,60vh)'
  const rowClosedHeight =
    tabletMode === 'portrait'
      ? 'min(112px,17vh)'
      : tabletMode === 'landscape'
        ? 'min(85px,12vh)'
        : compactDesktop
          ? 'min(92px,13vh)'
          : 'min(130px,20vh)'
  const imageColWidth = tabletMode === 'portrait' ? '38%' : tabletMode === 'landscape' ? '32%' : '35%'

  return (
    <motion.div
      onClick={alwaysExpanded ? undefined : onClick}
      initial={false}
      animate={{
        height: open ? rowOpenHeight : rowClosedHeight,
        backgroundColor: open ? '#ffffff' : '#f3f3f1',
      }}
      transition={{ duration: 0.8, ease: customEase }}
      className={`group relative flex w-full flex-col items-stretch overflow-hidden border-b border-black/10 transition-colors md:flex-row md:items-center ${
        alwaysExpanded ? '' : 'cursor-pointer'
      }`}
    >
      <motion.div
        initial={false}
        animate={{ height: open ? '58%' : '44%' }}
        transition={{ duration: 0.8, ease: customEase }}
        className="relative w-full overflow-hidden md:hidden"
      >
        <div className="h-full w-full p-[12px]">
          <div className="h-full w-full overflow-hidden rounded-sm bg-neutral-200">
            <motion.img
              src={image}
              alt={title}
              animate={{ scale: open ? 1 : 1.08 }}
              transition={{ duration: 0.9, ease: customEase }}
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        <div className="absolute right-3 top-3">
          <span className={`text-5xl font-black ${open ? 'text-[#FF8201]' : 'text-black/30'}`}>0{index + 1}</span>
        </div>
      </motion.div>

      <motion.div
        initial={false}
        animate={{
          width: open ? imageColWidth : '0%',
          opacity: open ? 1 : 0,
        }}
        transition={{ duration: 0.8, ease: customEase }}
        className="hidden h-full flex-shrink-0 overflow-hidden md:block"
      >
        <div className="h-full w-full p-[15px]">
          <div className="h-full w-full overflow-hidden rounded-sm bg-neutral-200">
            <motion.img
              src={image}
              alt={title}
              animate={{ scale: open ? 1 : 1.2 }}
              transition={{ duration: 1, ease: customEase }}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </motion.div>

      <div className="relative z-10 hidden flex-1 flex-col justify-center px-6 sm:px-10 min-[1000px]:max-[1439px]:px-6 tablet-portrait:px-5 tablet-landscape:px-5 md:flex">
        <h3 className="text-3xl font-black uppercase tracking-tighter text-black md:text-[clamp(1.55rem,3.1vw,2.8rem)] min-[1440px]:text-5xl tablet-portrait:text-[clamp(1.25rem,3.4vw,1.8rem)] tablet-landscape:text-[clamp(1.15rem,2.5vw,1.6rem)]">
          {title}
        </h3>

        <motion.p
          aria-hidden={!open}
          initial={false}
          animate={{
            opacity: open ? 1 : 0,
            maxHeight: open ? (tabletMode === 'landscape' ? 220 : tabletMode === 'portrait' ? 260 : 320) : 0,
            marginTop: open ? (tabletMode === 'landscape' ? 16 : 24) : 0,
          }}
          transition={{ duration: 0.55, ease: customEase }}
          className="max-w-xl overflow-hidden text-lg font-medium leading-tight text-black/50 min-[1000px]:max-[1439px]:max-w-[min(28rem,42vw)] min-[1000px]:max-[1439px]:text-base tablet-portrait:max-w-[min(24rem,48vw)] tablet-portrait:text-[0.95rem] tablet-landscape:max-w-[min(20rem,36vw)] tablet-landscape:text-[0.9rem] tablet-landscape:leading-snug"
        >
          {subtitle}
        </motion.p>
      </div>

      <div className="relative z-10 flex flex-1 flex-col justify-start px-5 pb-4 md:hidden">
        <h3 className="w-full break-words text-base font-black uppercase leading-tight tracking-tighter text-black sm:text-lg">
          {title}
        </h3>

        <motion.p
          aria-hidden={!open}
          initial={false}
          animate={{
            opacity: open ? 1 : 0,
            maxHeight: open ? 480 : 0,
            marginTop: open ? 12 : 0,
          }}
          transition={{ duration: 0.5, ease: customEase }}
          className="overflow-hidden break-words text-base font-medium leading-tight text-black/50"
        >
          {subtitle}
        </motion.p>
      </div>

      <div className="hidden flex-shrink-0 items-center justify-end pr-6 min-[1000px]:max-[1439px]:pr-5 tablet-portrait:pr-4 tablet-landscape:pr-4 sm:pr-10 md:flex">
        <span
          className={`text-6xl font-black transition-colors duration-500 md:text-[clamp(3.25rem,7vw,5rem)] min-[1440px]:text-8xl tablet-portrait:text-[clamp(2.5rem,6vw,3.5rem)] tablet-landscape:text-[clamp(2.25rem,5vw,3rem)] ${
            open ? 'text-[#FF8201]' : 'text-black/5'
          }`}
        >
          0{index + 1}
        </span>
      </div>

      {!open && (
        <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-[#FF8201] transition-all duration-500 md:group-hover:w-full" />
      )}
    </motion.div>
  )
}

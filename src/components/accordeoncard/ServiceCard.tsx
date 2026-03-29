import type { FC } from 'react'
import { motion, cubicBezier } from 'framer-motion'

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
}

export const ServiceCard: FC<ServiceCardProps> = ({
  index,
  title,
  subtitle,
  image,
  isActive,
  onClick,
  alwaysExpanded = false,
}) => {
  const open = alwaysExpanded || isActive

  return (
    <motion.div
      onClick={alwaysExpanded ? undefined : onClick}
      initial={false}
      animate={{
        height: open ? 'min(400px,60vh)' : 'min(130px,20vh)',
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
          width: open ? '35%' : '0%',
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

      <div className="relative z-10 hidden flex-1 flex-col justify-center px-6 sm:px-10 md:flex">
        <h3 className="text-4xl font-black uppercase tracking-tighter text-black md:text-6xl">{title}</h3>

        <motion.p
          aria-hidden={!open}
          initial={false}
          animate={{
            opacity: open ? 1 : 0,
            maxHeight: open ? 320 : 0,
            marginTop: open ? 24 : 0,
          }}
          transition={{ duration: 0.55, ease: customEase }}
          className="max-w-xl overflow-hidden text-lg font-medium leading-tight text-black/50"
        >
          {subtitle}
        </motion.p>
      </div>

      <div className="relative z-10 flex flex-1 flex-col justify-start px-5 pb-4 md:hidden">
        <h3 className="w-full break-words text-lg font-black uppercase leading-tight tracking-tighter text-black sm:text-xl">
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

      <div className="hidden flex-shrink-0 items-center justify-end pr-6 sm:pr-10 md:flex">
        <span
          className={`text-6xl font-black transition-colors duration-500 md:text-8xl ${
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

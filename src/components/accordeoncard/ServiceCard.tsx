import type { FC } from 'react'
import { motion, AnimatePresence, cubicBezier } from 'framer-motion'

interface ServiceCardProps {
  index: number
  title: string
  subtitle: string
  image: string
  isActive: boolean
  onClick: () => void
}

// Создаем функцию Безье, чтобы TS не ругался на массив
const customEase = cubicBezier(0.22, 1, 0.36, 1)

export const ServiceCard: FC<ServiceCardProps> = ({
  index,
  title,
  subtitle,
  image,
  isActive,
  onClick
}) => {
  return (
    <motion.div
      layout
      onClick={onClick}
      initial={false}
      animate={{ 
        // Подстраиваем высоту карточки под высоту экрана, чтобы на телефонах не было переполнения
        height: isActive ? 'min(400px,60vh)' : 'min(130px,20vh)',
        backgroundColor: isActive ? "#ffffff" : "#f3f3f1" 
      }}
      transition={{ duration: 0.8, ease: customEase }}
      className="group relative flex w-full cursor-pointer flex-col md:flex-row items-stretch md:items-center overflow-hidden border-b border-black/10 transition-colors"
    >
      {/* Mobile: картинка сверху + раскрытие по height */}
      <motion.div
        initial={false}
        animate={{ height: isActive ? '58%' : '44%' }}
        transition={{ duration: 0.8, ease: customEase }}
        className="relative w-full overflow-hidden md:hidden"
      >
        <div className="h-full w-full p-[12px]">
          <div className="h-full w-full overflow-hidden rounded-sm bg-neutral-200">
            <motion.img
              src={image}
              alt={title}
              animate={{ scale: isActive ? 1 : 1.08 }}
              transition={{ duration: 0.9, ease: customEase }}
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        <div className="absolute right-3 top-3">
          <span className={`text-5xl font-black ${isActive ? 'text-[#FF8201]' : 'text-black/30'}`}>
            0{index + 1}
          </span>
        </div>
      </motion.div>

      {/* Desktop: картинка слева с раскрытием ширины */}
      <motion.div
        layout
        initial={false}
        animate={{
          width: isActive ? '35%' : '0%',
          opacity: isActive ? 1 : 0
        }}
        transition={{ duration: 0.8, ease: customEase }}
        className="hidden md:block h-full flex-shrink-0 overflow-hidden"
      >
        <div className="h-full w-full p-[15px]">
          <div className="h-full w-full overflow-hidden rounded-sm bg-neutral-200">
            <motion.img
              src={image}
              alt={title}
              animate={{ scale: isActive ? 1 : 1.2 }}
              transition={{ duration: 1, ease: customEase }}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </motion.div>

      {/* Desktop text */}
      <motion.div
        layout
        className="hidden md:flex flex-1 flex-col justify-center px-6 sm:px-10 z-10"
      >
        <motion.h3
          layout
          className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-black"
        >
          {title}
        </motion.h3>

        <AnimatePresence>
          {isActive && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5, delay: 0.2, ease: customEase }}
              className="mt-6 max-w-xl text-lg text-black/50 leading-tight font-medium"
            >
              {subtitle}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Mobile text */}
      <motion.div className="md:hidden flex-1 flex flex-col justify-start px-5 pb-4 z-10">
        <motion.h3
          layout
          className="text-lg sm:text-xl font-black uppercase tracking-tighter text-black leading-tight break-words w-full"
        >
          {title}
        </motion.h3>

        <AnimatePresence>
          {isActive && (
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.45, delay: 0.05, ease: customEase }}
              className="mt-3 text-base text-black/50 leading-tight font-medium break-words"
            >
              {subtitle}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Desktop index */}
      <motion.div
        layout
        className="hidden md:flex items-center justify-end pr-6 sm:pr-10 flex-shrink-0"
      >
        <motion.span
          layout
          className={`text-6xl md:text-8xl font-black transition-colors duration-500 ${
            isActive ? 'text-[#FF8201]' : 'text-black/5'
          }`}
        >
          0{index + 1}
        </motion.span>
      </motion.div>

      {!isActive && (
        <motion.div
          className="absolute bottom-0 left-0 h-[2px] bg-[#FF8201] w-0 md:group-hover:w-full transition-all duration-500"
        />
      )}
    </motion.div>
  )
}
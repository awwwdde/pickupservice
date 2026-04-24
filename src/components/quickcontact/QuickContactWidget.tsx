import { useEffect, useState, type FC } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { MessageCircle, X } from 'lucide-react'

const QuickContactWidget: FC = () => {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen])

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              className="w-[min(92vw,430px)] rounded-2xl border border-white/15 bg-[#0a0a0a]/95 p-6 shadow-[0_24px_70px_-24px_rgba(0,0,0,0.9)]"
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 14, scale: 0.96 }}
              transition={{ duration: 0.22 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-4 flex justify-center">
                <img
                  src="/pickup.png"
                  alt="ПикапСервис"
                  className="h-14 w-14 rounded-full border border-white/20 object-cover"
                />
              </div>

              <div className="flex items-start justify-between gap-3">
                <p className="text-sm leading-relaxed text-white/90">
                  Для записи к нам напиши в мессенджере или по телефону
                </p>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-1 text-white/70 transition-colors hover:text-white"
                  aria-label="Закрыть окно"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <a href="tel:+79859234777" className="mt-4 block text-lg font-semibold text-white transition-opacity hover:opacity-80">
                +7 (985) 923-47-77
              </a>

              <div className="mt-5 flex flex-col gap-2.5">
                <a
                  href="https://t.me/Pickupservice_Moscow"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-xl bg-white px-3 py-2.5 text-sm font-semibold text-black transition-opacity hover:opacity-85"
                >
                  Telegram
                </a>
                <a
                  href="https://max.ru/join/59jJOJzaZzcmPjaHHXVgMIzq9YUShK916qO09lWobWE"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-xl bg-[#FF8201] px-3 py-2.5 text-sm font-semibold text-black transition-opacity hover:opacity-90"
                >
                  MAX
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-5 right-5 z-[1210] sm:bottom-7 sm:right-7">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FF8201] text-black shadow-[0_16px_40px_-16px_rgba(255,130,1,0.9)] transition-transform hover:scale-105"
          aria-label="Открыть быстрое окно контактов"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      </div>
    </>
  )
}

export default QuickContactWidget

import { useEffect, useState, type FC } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Phone, Send, X } from 'lucide-react'
import { fetchContactSettings } from '../../api/backend'
import bookingIcon from '../../assets/записаться.svg'

const QuickContactWidget: FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [contact, setContact] = useState({
    phoneDisplay: '+7 (985) 923-47-77',
    phoneTel: '+79859234777',
    telegramUrl: 'https://t.me/Pickupservice_Moscow',
    maxUrl: 'https://max.ru/join/59jJOJzaZzcmPjaHHXVgMIzq9YUShK916qO09lWobWE',
  })

  useEffect(() => {
    let cancelled = false

    fetchContactSettings()
      .then((data) => {
        if (cancelled) return
        setContact((prev) => ({
          phoneDisplay: data.phone_display || prev.phoneDisplay,
          phoneTel: data.phone_tel || prev.phoneTel,
          telegramUrl: data.telegram_url || prev.telegramUrl,
          maxUrl: prev.maxUrl,
        }))
      })
      .catch(() => {
        // Keep default values if API request fails.
      })

    return () => {
      cancelled = true
    }
  }, [])

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
            className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              className="relative w-[min(92vw,430px)] overflow-hidden rounded-2xl border border-white/15 bg-[#0a0a0a]/95 p-6 shadow-[0_24px_70px_-24px_rgba(0,0,0,0.9)] sm:p-7"
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 14, scale: 0.96 }}
              transition={{ duration: 0.22 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF8201] to-transparent" />

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="absolute right-4 top-4 cursor-pointer rounded-full border border-white/15 bg-white/5 p-1.5 text-white/75 transition-colors hover:text-white"
                aria-label="Закрыть окно"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="mb-4 flex justify-center">
                <img
                  src="/pickup.png"
                  alt="ПикапСервис"
                  className="h-16 w-16 rounded-full border border-white/20 object-cover"
                />
              </div>

              <div className="text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#FF8201]">Быстрая запись</p>
                <p className="mt-2 text-sm leading-relaxed text-white/85">
                  Выберите удобный способ связи - перезвоним и согласуем время.
                </p>
              </div>

              <a
                href={`tel:${contact.phoneTel}`}
                className="mt-5 inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 text-base font-semibold text-white transition-colors hover:bg-white/10"
                title="Позвонить"
              >
                <Phone className="h-4 w-4" />
                {contact.phoneDisplay}
              </a>

              <div className="mt-4 grid grid-cols-1 gap-2.5">
                <a
                  href={contact.telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-white px-3 text-sm font-semibold text-black transition-opacity hover:opacity-85"
                >
                  <Send className="h-4 w-4" />
                  Telegram
                </a>
                <a
                  href={contact.maxUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 cursor-pointer items-center justify-center rounded-xl bg-[#FF8201] px-3 text-sm font-semibold text-black transition-opacity hover:opacity-90"
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
          className="flex h-16 w-28 cursor-pointer items-center justify-center bg-transparent transition-transform hover:scale-105"
          aria-label="Открыть быстрое окно контактов"
        >
          <span
            className="block h-12 w-full bg-[#FF8201]"
            style={{
              WebkitMaskImage: `url(${bookingIcon})`,
              maskImage: `url(${bookingIcon})`,
              WebkitMaskRepeat: 'no-repeat',
              maskRepeat: 'no-repeat',
              WebkitMaskPosition: 'center',
              maskPosition: 'center',
              WebkitMaskSize: 'contain',
              maskSize: 'contain',
            }}
          />
        </button>
      </div>
    </>
  )
}

export default QuickContactWidget

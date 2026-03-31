import type { FC, InputHTMLAttributes } from 'react'
import { motion } from 'framer-motion'

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export const InputField: FC<InputFieldProps> = ({ label, ...props }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full"
    >
      <input
        {...props}
        // Важно: плейсхолдер должен быть хотя бы пробелом, чтобы работал :placeholder-shown
        placeholder=" " 
        className="peer w-full border-b border-white/20 bg-transparent py-3 sm:py-4 text-base sm:text-lg text-white focus:border-white focus:outline-none transition-colors"
      />
      <label className="
        pointer-events-none absolute left-0 transition-all duration-200
        /* Состояние, когда текст введен или поле в фокусе (Лейбл вверху) */
        -top-3 text-xs text-[#FF8201] opacity-100
        
        /* Состояние, когда поле пустое И не в фокусе (Лейбл внутри инпута) */
        peer-placeholder-shown:top-3 
        peer-placeholder-shown:sm:top-4 
        peer-placeholder-shown:text-base 
        peer-placeholder-shown:sm:text-lg 
        peer-placeholder-shown:text-white/40
        
        /* Возвращаем лейбл наверх при фокусе, даже если поле пустое */
        peer-focus:-top-3 
        peer-focus:text-xs 
        peer-focus:text-[#FF8201]
      ">
        {label}
      </label>
    </motion.div>
  )
}
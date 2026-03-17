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
        className="peer w-full border-b border-white/20 bg-transparent py-4 text-lg text-white placeholder-transparent focus:border-white focus:outline-none transition-colors"
        placeholder={label}
      />
      <label className="pointer-events-none absolute left-0 top-4 text-lg text-white/40 transition-all peer-focus:-top-4 peer-focus:text-xs peer-focus:text-[#FF8201] peer-focus:opacity-100 peer-[-moz-placeholder-shown]:top-4 peer-[-moz-placeholder-shown]:text-lg peer-[-webkit-placeholder-shown]:top-4 peer-[-webkit-placeholder-shown]:text-lg">
        {label}
      </label>
    </motion.div>
  )
}
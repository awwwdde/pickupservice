import type { FC } from 'react'
import { motion, type Variants } from 'framer-motion'

const services = [
  {
    title: 'Модифицируем внедорожники',
    description:
      'Мы проводим полный спектр модификаций: подвеска, защитные элементы, тюнинг двигателя и кузова.',
    image: 'https://images.unsplash.com/photo-1503376760367-1b61b4d08ce1?q=80&w=1600',
  },
  {
    title: 'Ремонтируем внедорожники',
    description:
      'Любые виды ремонта: от мелкого кузовного до капитального технического обслуживания.',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=1600',
  },
  {
    title: 'Обслуживаем внедорожники',
    description:
      'Плановое ТО и диагностика, чтобы ваш внедорожник всегда был в идеальном состоянии.',
    image: 'https://images.unsplash.com/photo-1598551292182-48a52e391b1f?q=80&w=1600',
  },
]

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
}

const staggerContainer = (stagger: number = 0.1): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: stagger },
  },
})

const ServicePage: FC = () => {
  return (
    <main className="bg-white text-black min-h-screen antialiased">
      {/* HERO */}
      <section className="w-[90%] mx-auto pt-40 pb-32">
        <motion.h1
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-[6vw] font-bold leading-tight md:text-[5vw]"
        >
          Мастерская внедорожников,
          <br />
          <span className="text-[#FF8201]">которая любит своё дело</span>
        </motion.h1>
      </section>

      {/* INTRO */}
      <section className="w-[90%] mx-auto flex flex-col md:flex-row gap-16 mb-32">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="flex-1 flex flex-col gap-6"
        >
          <h2 className="text-3xl font-bold">ПикапСервис</h2>
          <p className="text-lg text-black/70">
            Мы специализируемся на внедорожниках: модифицируем, ремонтируем и обслуживаем автомобили с
            максимальным вниманием к деталям.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer(0.1)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="flex-1 grid grid-cols-2 gap-4"
        >
          {[1, 2, 3, 4].map((i) => (
            <motion.img
              key={i}
              src="https://images.unsplash.com/photo-1606148281133-3119f868212e?q=80&w=1000"
              alt="Service image"
              className="w-full h-40 object-cover"
              variants={fadeUp}
            />
          ))}
        </motion.div>
      </section>

      {/* SERVICES LIST */}
      <section className="w-[90%] mx-auto mb-32 flex flex-col gap-12">
        {services.map((service, index) => (
          <motion.div
            key={index}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-col md:flex-row gap-6 items-center"
          >
            <img
              src={service.image}
              alt={service.title}
              className="w-full md:w-1/3 h-48 object-cover rounded-md shadow-lg"
            />
            <div className="flex-1">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-2xl font-bold">{service.title}</h3>
                <span className="text-2xl font-mono text-black/40">{`0${index + 1}`}</span>
              </div>
              <p className="text-black/70">{service.description}</p>
            </div>
          </motion.div>
        ))}
      </section>

      {/* CTA */}
      <section className="w-[90%] mx-auto mb-40 flex flex-col items-center gap-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          className="bg-[#FF8201] text-white py-5 px-12 text-lg font-semibold uppercase"
        >
          Записаться
        </motion.button>
        <p className="text-black/50 text-center max-w-xl">
          Свяжитесь с нами, и мы сделаем ваш внедорожник идеальным!
        </p>
      </section>
    </main>
  )
}

export default ServicePage
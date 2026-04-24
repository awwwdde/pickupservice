import type { FC } from 'react';
import { motion } from 'framer-motion';

const Footer: FC = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { name: 'MAX', href: 'https://max.ru/join/59jJOJzaZzcmPjaHHXVgMIzq9YUShK916qO09lWobWE' },
    { name: 'Телеграм', href: 'https://t.me/Pickupservice_Moscow' },
  ];
  const workingHours = [
    'Понедельник: 10:00 - 20:00',
    'Вторник: 10:00 - 20:00',
    'Среда: 10:00 - 20:00',
    'Четверг: 10:00 - 20:00',
    'Пятница: 10:00 - 20:00',
    'Суббота: 10:00 - 20:00',
    'Воскресенье: выходной',
  ];

  return (
    <footer className="bg-[#0a0a0a] text-white pt-20 pb-10 px-6 md:px-12 tablet-portrait:px-10 tablet-portrait:pt-16 tablet-landscape:px-10 tablet-landscape:pt-20 font-sans">
      <div className="max-w-10xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 tablet-portrait:grid-cols-3 tablet-landscape:grid-cols-3 gap-12 tablet-portrait:gap-8 tablet-landscape:gap-10 mb-20 tablet-portrait:mb-14 tablet-landscape:mb-16">
          <div className="flex flex-col items-start md:items-end lg:items-start tablet-portrait:items-start tablet-landscape:items-start">
            <div className="space-y-4 text-sm md:text-base tablet-portrait:text-[13px] tablet-landscape:text-[13px]">
              <p className="text-gray-500 mb-2">Как нас найти</p>
              
              <div className="flex items-center gap-3 group cursor-pointer">
                <span className="text-gray-600">•</span>
                <a href="tel:84959991122" className="hover:text-gray-300 transition-colors">+7 (985) 923-47-77</a>
              </div>
              
              <div className="flex items-center gap-3 group cursor-pointer">
                <span className="text-gray-600">•</span>
                <a href="mailto:info@pickupservice.moscow" className="hover:text-gray-300 transition-colors">info@pickupservice.moscow</a>
              </div>

              <div className="flex items-center gap-3 group cursor-pointer">
                <span className="text-gray-600">•</span>
                <span>Москва, улица Самокатная 3/8, с1А</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-xl mb-6 font-medium tablet-portrait:text-lg tablet-portrait:mb-4 tablet-landscape:text-lg tablet-landscape:mb-4">Социальные сети</h3>
            <ul className="space-y-4 tablet-portrait:space-y-3 tablet-landscape:space-y-3">
              {socialLinks.map((link) => (
                <li key={link.name}>
                  <motion.a
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors duration-300 tablet-portrait:text-[13px] tablet-landscape:text-[13px]"
                    whileHover={{ x: 5 }}
                  >
                    {link.name}
                  </motion.a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xl mb-6 font-medium tablet-portrait:text-lg tablet-portrait:mb-4 tablet-landscape:text-lg tablet-landscape:mb-4">Часы работы</h3>
            <ul className="space-y-4 tablet-portrait:space-y-2 tablet-landscape:space-y-2 text-gray-400 text-sm md:text-base tablet-portrait:text-[12.5px] tablet-landscape:text-[12.5px]">
              {workingHours.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <motion.h2
        initial={{ opacity: 0, y: 52 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
        className="w-full py-10 text-center text-[clamp(2.4rem,9vw,11rem)] font-black uppercase leading-[0.95] tracking-tight text-white"
      >
        Мы делаем вещи
      </motion.h2>
      <div className="mt-4 pt-8 flex flex-col gap-3 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left text-[clamp(9px,1.2vw,10px)] uppercase tracking-widest text-gray-600">
        <p>© {currentYear} ПИКАПСЕРВИС. ВСЕ ПРАВА ЗАЩИЩЕНЫ</p>
        <p>Разработано
          <a href="https://bitluna.ru" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-300 transition-colors"> KiTLuna </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;

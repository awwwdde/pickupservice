import type { FC } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

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
    'Воскресенье: 10:00 - 20:00',
  ];

  return (
    <footer className="bg-[#0a0a0a] text-white pt-20 pb-10 px-6 md:px-12 overflow-hidden font-sans">
      <div className="max-w-10xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-20">
        <div className="flex flex-col items-start md:items-end lg:items-start">
            <motion.button
              whileHover={{ scale: 1 }}
              whileTap={{ scale: 1 }}
              className="w-full bg-[#FF8201] text-black border border-white/5 p-8 mb-8 group transition-colors hover:bg-[#252525] cursor-pointer"
            >
              <Link to="/booking">
              <div className="flex items-center justify-between group-hover:text-white">
                <span className="uppercase tracking-[0.2em] text-sm">Записаться</span>
                <Plus size={20} strokeWidth={1} />
              </div>
              </Link>
            </motion.button>

            <div className="space-y-4 text-sm md:text-base">
              <p className="text-gray-500 mb-2">Как нас найти</p>
              
              <div className="flex items-center gap-3 group cursor-pointer">
                <Plus size={14} className="text-gray-600 group-hover:rotate-90 transition-transform" />
                <a href="tel:84959991122" className="hover:text-gray-300 transition-colors">8 (985) 923-47-77</a>
              </div>
              
              <div className="flex items-center gap-3 group cursor-pointer">
                <Plus size={14} className="text-gray-600 group-hover:rotate-90 transition-transform" />
                <a href="mailto:pickupservice@moscow.com" className="hover:text-gray-300 transition-colors">pickupservice@moscow.com</a>
              </div>

              <div className="flex items-center gap-3 group cursor-pointer">
                <Plus size={14} className="text-gray-600 group-hover:rotate-90 transition-transform" />
                <span>Москва, улица Самокатная 3/8, с1А</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-xl mb-6 font-medium">Социальные сети</h3>
            <ul className="space-y-4">
              {socialLinks.map((link) => (
                <li key={link.name}>
                  <motion.a
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors duration-300"
                    whileHover={{ x: 5 }}
                  >
                    {link.name}
                  </motion.a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xl mb-6 font-medium">Часы работы</h3>
            <ul className="space-y-4 text-gray-400 text-sm md:text-base">
              {workingHours.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="mt-10 pt-8 border-t border-white/5 flex flex-col gap-3 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left text-[clamp(9px,1.2vw,10px)] uppercase tracking-widest text-gray-600">
        <p>© {currentYear} ПИКАПСЕРВИС. ВСЕ ПРАВА ЗАЩИЩЕНЫ</p>
        <p>Разработано
          <a href="https://bitluna.ru" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-300 transition-colors"> KiTLuna </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
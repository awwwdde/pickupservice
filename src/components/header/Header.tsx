import type { FC } from 'react'
import { Link } from 'react-router-dom'

const header: FC = () => {
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center text-white">
      <nav className="mx-auto flex items-center gap-8 px-4 py-3">
        <div className="text-sm font-semibold uppercase tracking-widest">
          PickupService
        </div>
        <ul className="flex items-center gap-4 text-sm">
          <li>
            <Link to="/">Главная</Link>
          </li>
          <li>
            <Link to="/service">Сервис</Link>
          </li>
          <li>
            <Link to="/portfolio">Портфолио</Link>
          </li>
          <li>
            <Link to="/contact">Контакты</Link>
          </li>
          <li>
            <Link to="/booking">Записаться</Link>
          </li>
        </ul>
      </nav>
    </header>
  )
}

export default header

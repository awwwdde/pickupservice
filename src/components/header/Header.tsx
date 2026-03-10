import type { FC } from 'react'
import { Link } from 'react-router-dom'

const Header: FC = () => {
  return (
    <header>
      <nav>
        <ul>
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

export default Header

# Django Backend для Pickup Service

Этот backend реализует админку и API для управления проектами, которые отображаются на фронтенде (React/Vite).

## Стек

- Django 5
- Django REST Framework
- django-cors-headers
- Pillow
- django-filter
- python-telegram-bot

## Установка и запуск (Windows)

```bash
cd "c:\\Users\\Egor\\Documents\\site pickup service\\backend"

python -m venv venv
venv\\Scripts\\activate

pip install -r requirements.txt

python manage.py makemigrations
python manage.py migrate

python manage.py createsuperuser

python manage.py runserver
```

Админка: `http://localhost:8000/admin/`  
API (список проектов): `http://localhost:8000/api/projects/`  
API (детали проекта): `http://localhost:8000/api/projects/<id>/`

## Telegram-бот для заявок

Бот работает как отдельный процесс (long polling) и отправляет новые заявки из форм сайта в Telegram, а также умеет показывать последние 20 заявок каждого типа по кнопкам.

### Переменные окружения (на сервере)

- `TELEGRAM_BOT_TOKEN` — токен бота (секрет).
- `TELEGRAM_WHITELIST_USER_IDS` — user_id, кому разрешены команды (через запятую).
- `TELEGRAM_WHITELIST_CHAT_IDS` — chat_id разрешённых групп/каналов (через запятую).
- `TELEGRAM_NOTIFY_CHAT_IDS` — куда слать авто-уведомления о новых заявках (через запятую). Если пусто, используется фолбэк на whitelist.

### Запуск

```bash
python manage.py run_telegram_bot
```

## Модели

- `Project`
  - `title` — название проекта
  - `description` — описание
  - `image` — обложка (фото для карточки)
  - `gallery` — связь ManyToMany с `ProjectImage` (дополнительные фото)
  - `category` — категория (Подготовка, Ремонт, Тюнинг, Обслуживание)
  - `vehicle` — модель автомобиля
  - `order` — порядок отображения
  - `published` — флаг опубликован/черновик
  - `created_at`, `updated_at`

- `ProjectImage`
  - `image` — фото
  - `order` — порядок в галерее

## Админка

- Удобная форма проекта:
  - обложка + превью
  - галерея через inline
  - фильтры по категории, статусу, дате
  - поиск по названию, описанию, модели авто
  - массовая публикация/снятие через стандартные действия

## Интеграция с фронтендом

Фронт ничего не знает о Django: он просто ходит в API.

### Пример для секции \"Наши проекты\" (общий принцип)

- `GET http://localhost:8000/api/projects/` возвращает список опубликованных проектов.
- Каждый объект содержит:
  - `id`, `title`, `image`, `category`, `vehicle`, `order`

Фронтенд может:

1. Держать первую карточку (`Наши Проекты`) как статическую.
2. Остальные карточки брать из API, подставляя `image` в `src` для `<img>`.


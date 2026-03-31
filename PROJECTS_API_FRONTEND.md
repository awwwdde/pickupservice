# Проекты: спецификация для фронтенда

Этот документ описывает, как фронтенду забирать данные о проектах из Django‑бэкенда и как они соотносятся с текущими блоками на главной (секция «Наши проекты») и страницами портфолио.

## Базовая информация

- Бэкенд: Django + Django REST Framework
- База: SQLite (для разработки; можно заменить на другую без изменения API)
- URL бэкенда в деве: `http://127.0.0.1:8000`
- CORS разрешён для локального фронта (`http://localhost:5173`, `http://127.0.0.1:5173`) и для дополнительных origin из переменной окружения бэкенда `CORS_ALLOWED_ORIGINS` (список через запятую, например прод-домен на Netlify)

Все ответы API — в формате JSON.

---

## Модели на стороне бэкенда (упрощённо)

### Project

Проект — это сущность, которая должна отображаться:

- в блоке карточек на главной,
- в списке проектов,
- на детальной странице проекта.

Поля:

- `id: integer` — уникальный идентификатор проекта.
- `title: string` — название проекта.
- `description: string` — текстовое описание (может быть длинным).
- `image: string (URL)` — URL обложки проекта (основное фото для карточки).
- `category: string` — категория проекта, одно из:
  - `"prep"` — Подготовка,
  - `"repair"` — Ремонт,
  - `"tuning"` — Тюнинг,
  - `"service"` — Обслуживание.
- `vehicle: string` — модель автомобиля (отображаемая строка, без ограничений по формату).
- `order: integer` — порядок сортировки на сайте; чем меньше число, тем выше в выдаче.
- `published: boolean` — флаг публикации (только опубликованные проекты попадают в публичный API).
- `created_at: string (datetime)` — дата создания.
- `updated_at: string (datetime)` — дата последнего обновления.

### ProjectImage

Дополнительное фото проекта (используется для галерей на детальной странице).

Поля:

- `id: integer`
- `image: string (URL)` — путь к картинке.
- `order: integer` — порядок в галерее (0, 1, 2, …).

---

## Эндпоинты

### 1. Список проектов (для карточек / списка)

**URL:**  
`GET /api/projects/`

**Пример запроса:**

```http
GET http://127.0.0.1:8000/api/projects/
Accept: application/json
```

**Ответ:**

Бэкенд использует пагинацию DRF, поэтому корневой объект — с полями `count`, `next`, `previous`, `results`.

```json
{
  "count": 1,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "title": "Пример проекта",
      "image": "http://127.0.0.1:8000/media/projects/covers/example.jpg",
      "category": "tuning",
      "vehicle": "Toyota Land Cruiser 200",
      "order": 0
    }
  ]
}
```

Гарантии со стороны бэкенда:

- В `results` попадают **только проекты с `published = true`**.
- Результаты отсортированы по `order ASC`, потом по дате создания (новые выше среди одинакового `order`).
- `image` — всегда абсолютный URL.

**Назначение:**

- Использовать для:
  - блока карточек «Наши проекты» на главной (кроме самой первой информационной карточки),
  - страниц списка проектов / портфолио.

Тип для фронта (пример на TypeScript):

```ts
export type ProjectListItem = {
  id: number;
  title: string;
  image: string;      // URL
  category: "prep" | "repair" | "tuning" | "service";
  vehicle: string;
  order: number;
};

export type ProjectListResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: ProjectListItem[];
};
```

### 2. Детальная страница проекта (с галереей)

**URL:**  
`GET /api/projects/<id>/`

**Пример запроса:**

```http
GET http://127.0.0.1:8000/api/projects/1/
Accept: application/json
```

**Ответ:**

```json
{
  "id": 1,
  "title": "Пример проекта",
  "description": "Подробное описание проекта...",
  "image": "http://127.0.0.1:8000/media/projects/covers/example.jpg",
  "category": "tuning",
  "vehicle": "Toyota Land Cruiser 200",
  "order": 0,
  "published": true,
  "gallery": [
    {
      "id": 10,
      "image": "http://127.0.0.1:8000/media/projects/gallery/photo1.jpg",
      "order": 0
    },
    {
      "id": 11,
      "image": "http://127.0.0.1:8000/media/projects/gallery/photo2.jpg",
      "order": 1
    }
  ],
  "created_at": "2026-03-16T12:00:00Z",
  "updated_at": "2026-03-16T12:05:00Z"
}
```

Тип для фронта:

```ts
export type ProjectImage = {
  id: number;
  image: string;  // URL
  order: number;
};

export type ProjectDetail = {
  id: number;
  title: string;
  description: string;
  image: string;  // URL
  category: "prep" | "repair" | "tuning" | "service";
  vehicle: string;
  order: number;
  published: boolean;
  gallery: ProjectImage[];
  created_at: string;
  updated_at: string;
};
```

**Назначение:**

- Детальная страница проекта (роут вида `/portfolio/:id`).
- Можно использовать для:
  - заголовка и основного текста,
  - главного фото,
  - слайдера / галереи из `gallery`.

---

## Связь с текущим фронтом

Ниже — только логика, без конкретных реализаций/хуков, чтобы не ломать существующую верстку и анимации.

### Главная страница: секция «Наши проекты»

Сейчас в `src/pages/main.tsx` есть статический массив `projectsData` с первой информационной карточкой и четырьмя картинками.

Предлагаемый подход:

1. Оставить первую карточку (с заголовком «Наши Проекты» и кнопкой «Все работы») статической, как сейчас.
2. Остальные карточки строить из `GET /api/projects/`:
   - Для каждой записи из `results` делать карточку с картинкой `image`.
   - Ширина/анимации можно оставить как есть — важно только подставить `src` из API.

Пример рабочей схемы:

- Начальное состояние:
  - массив содержит только первую карточку `type: "info"`.
- После загрузки данных:
  - к массиву добавляются проекты из API (каждый — карточка с фото).

Таким образом бэкенд управляет:

- порядком карточек (через `order`),
- набором проектов (через `published`),
- содержимым картинок.

Верстка и анимации при этом не зависят от бэкенда.

### Страница списка проектов (`/portfolio`)

Для списка проектов можно использовать тот же `GET /api/projects/`:

- рендерить список `results`,
- использовать `title` как имя проекта,
- по `id` строить ссылку на детальную страницу (`/portfolio/:id`),
- при желании показывать мини-обложку (`image`) и `vehicle`.

### Детальная страница (`/portfolio/:id`)

Для детальной страницы:

1. Забрать `id` из параметров роутера.
2. Сходить в `GET /api/projects/<id>/`.
3. Отобразить:
   - `title`, `description`, `vehicle`, `category` и т.п.
   - `image` — как главное фото.
   - `gallery` — массив картинок для слайдера/ленты.

Если проект не найден (`404`), можно показать стандартную страницу «Проект не найден».

---

## Поведение при ошибках

Рекомендации для фронта:

- Если запрос к списку проектов (`/api/projects/`) упал или вернул пустой `results`:
  - можно оставить текущий статический набор картинок как фолбэк,
  - либо показать заглушку/скелетон.
- Если детальная страница (`/api/projects/<id>/`) вернула `404`:
  - отобразить страницу «Проект не найден» или редиректнуть на список проектов.

Бэкенд не вводит дополнительных полей статуса в JSON, всё стандартно по DRF: HTTP‑коды + тело ответа.

---

## Итог

- Все данные для карточек и страниц проектов приходят из двух эндпоинтов:
  - список: `GET /api/projects/`,
  - детали: `GET /api/projects/<id>/`.
- В админке можно:
  - добавлять/редактировать проекты,
  - управлять порядком отображения,
  - добавлять несколько фото в галерею,
  - включать/выключать проекты из публикации.
- Фронт может полностью контролировать верстку и анимации, опираясь только на JSON‑ответы, описанные выше.

---

## Меню-аккордеон на главной

Меню-аккордеон используется как отдельный блок на главной странице. Данные для него полностью управляются через Django‑админку и отдаются отдельным API‑эндпоинтом.

### Модель AccordionItem

Поля:

- `id: integer` — уникальный идентификатор пункта (можно использовать как номер и как ключ в списке).
- `title: string` — заголовок пункта аккордеона.
- `description: string` — текст описания, показывается в раскрытом состоянии.
- `image: string (URL)` — URL картинки/фото для этого пункта (можно использовать как иконку или фоновое изображение).
- `order: integer` — порядок отображения в списке (0, 1, 2, …); чем меньше число, тем выше в списке.
- `published: boolean` — флаг публикации (только опубликованные пункты попадают в публичный API).
- `created_at: string (datetime)` — дата создания.
- `updated_at: string (datetime)` — дата последнего обновления.

Гарантии:

- В публичное API попадают только элементы с `published = true`.
- Элементы отсортированы по `order ASC`, затем по `created_at DESC`.
- `image` — всегда абсолютный URL.

### Эндпоинт меню-аккордеона

**URL:**  
`GET /api/projects/accordion/`

**Пример запроса:**

```http
GET http://127.0.0.1:8000/api/projects/accordion/
Accept: application/json
```

**Ответ:**

Ответ **без пагинации** — сразу массив объектов:

```json
[
  {
    "id": 1,
    "title": "Подготовка автомобиля к сезону",
    "description": "Краткое описание услуги или блока информации, которое разворачивается при клике по заголовку.",
    "image": "http://127.0.0.1:8000/media/accordion/items/example1.jpg",
    "order": 0
  },
  {
    "id": 2,
    "title": "Диагностика перед покупкой",
    "description": "Развёрнутое описание того, что именно входит в услугу и почему это важно.",
    "image": "http://127.0.0.1:8000/media/accordion/items/example2.jpg",
    "order": 1
  }
]
```

### Типы для фронта

Тип для одного пункта аккордеона:

```ts
export type AccordionItem = {
  id: number;
  title: string;
  description: string;
  image: string; // URL
  order: number;
};
```

Ответ от API — просто массив этих объектов:

```ts
export type AccordionListResponse = AccordionItem[];
```

### Использование на фронтенде

- При монтировании главной страницы сделать запрос к `GET /api/projects/accordion/`.
- Полученный массив `AccordionItem[]` использовать для отрисовки списка пунктов аккордеона:
  - заголовок — `title`,
  - тело/контент при раскрытии — `description`,
  - картинка (если нужна) — `image`.
- Порядок элементов уже задан на бэкенде (`order`), но при желании фронт может дополнительно отсортировать массив по этому полю.

Поведение при ошибках:

- Если запрос упал или вернулся пустой массив:
  - можно скрыть блок аккордеона,
  - либо показать заглушку/скелетон с текстом о временной недоступности данных.

---

## Галерея страницы «Сервис»

Фотографии для ленты (два горизонтальных ряда с параллаксом на десктопе и горизонтальная карусель на мобильных) и для фона hero-блока на странице `/service` задаются через Django-админку и отдаются отдельным API.

### Модель ServiceGalleryImage

Поля:

- `id: integer` — идентификатор записи.
- `image: string (URL)` — URL изображения (файл загружается в админке).
- `order: integer` — порядок в ленте (0, 1, 2, …); чем меньше число, тем левее в первом ряду.
- `published: boolean` — флаг публикации (только опубликованные записи попадают в публичный API).

Гарантии:

- В публичное API попадают только элементы с `published = true`.
- Элементы отсортированы по `order ASC`, затем по `created_at DESC`.
- `image` в JSON — абсолютный URL (как у других эндпоинтов с медиа).

### Эндпоинт галереи сервиса

**URL:**  
`GET /api/projects/service-gallery/`

**Пример запроса:**

```http
GET http://127.0.0.1:8000/api/projects/service-gallery/
Accept: application/json
```

**Ответ:**

Ответ **без пагинации** — сразу массив объектов:

```json
[
  {
    "id": 1,
    "image": "http://127.0.0.1:8000/media/service/gallery/photo1.jpg",
    "order": 0
  },
  {
    "id": 2,
    "image": "http://127.0.0.1:8000/media/service/gallery/photo2.jpg",
    "order": 1
  }
]
```

### Типы для фронта

```ts
export type ServiceGalleryItem = {
  id: number;
  image: string; // URL
  order: number;
};

export type ServiceGalleryListResponse = ServiceGalleryItem[];
```

### Использование на фронтенде

- При монтировании страницы `/service` запросить `GET /api/projects/service-gallery/`.
- Отсортировать элементы по `order` (если нужно гарантировать порядок на клиенте) и собрать массив URL из поля `image`.
- **Первый ряд** — эти URL по возрастанию `order`.
- **Второй ряд** — тот же список в **обратном** порядке (как зеркальная лента).
- **Hero** на той же странице: фон можно брать как **первое изображение** в этом порядке (первый элемент после сортировки по `order`).
- Если запрос не удался или список пустой, разумный фолбэк — статические изображения из сборки, чтобы вёрстка и анимации не ломались.

---

## Отзывы на главной (`/`)

Блок отзывов поддерживает три источника, управляемых из Django-админки:

- **Только из админки** — вручную добавленные отзывы (`source = "admin"`).
- **Только Яндекс.Карты** — отзывы, загруженные командой `sync_yandex_reviews` (`source = "yandex"`).
- **Смешанный** — сначала яндексовые, потом ручные.

Режим задаётся в записи «Настройки отзывов» в Django-админке.

### Модель Testimonial

Поля:

- `id: integer` — идентификатор записи.
- `quote: string` — полный текст отзыва.
- `name: string` — имя автора (в БД — `author_name`).
- `car: string` — модель автомобиля (может быть пустой строкой у яндексовых отзывов).
- `rating: integer | null` — рейтинг 1–5 (приходит с Яндекса; у ручных обычно `null`).
- `source: "admin" | "yandex"` — источник отзыва.
- `yandex_author_url: string` — ссылка на профиль автора на Яндексе (пустая строка для ручных).
- `order: integer` — порядок в блоке.

Гарантии:

- В публичное API попадают только записи с `published = true`.
- В режиме `mixed`: сначала яндексовые (`order ASC, created_at DESC`), затем ручные (тот же порядок).

### Эндпоинт отзывов

**URL:**
`GET /api/projects/testimonials/`

**Пример запроса:**

```http
GET http://127.0.0.1:8000/api/projects/testimonials/
Accept: application/json
```

**Ответ:**

```json
{
  "settings": {
    "mode": "mixed",
    "yandex_widget_url": "https://yandex.ru/maps/org/pickupservice/reviews/"
  },
  "results": [
    {
      "id": 5,
      "quote": "Отличная работа, всё по уму!",
      "name": "Иван П.",
      "car": "",
      "rating": 5,
      "source": "yandex",
      "yandex_author_url": "https://yandex.ru/maps/user/abc123/",
      "order": 0
    },
    {
      "id": 1,
      "quote": "Ребята из Пикапсервис превратили мой обычный крузак...",
      "name": "Алексей Смирнов",
      "car": "Toyota Land Cruiser 200",
      "rating": null,
      "source": "admin",
      "yandex_author_url": "",
      "order": 0
    }
  ]
}
```

Если нет опубликованных отзывов, `results` — пустой массив `[]`.

Поле `settings.yandex_widget_url` — используйте для кнопки «Все отзывы на Яндекс.Картах» (показывайте кнопку только если строка не пустая).

### Эндпоинт только настроек

**URL:**
`GET /api/projects/testimonials/settings/`

Возвращает только объект настроек (без списка отзывов):

```json
{
  "mode": "mixed",
  "yandex_widget_url": "https://yandex.ru/maps/org/pickupservice/reviews/"
}
```

### Типы для фронта

```ts
export type TestimonialItem = {
  id: number;
  quote: string;
  name: string;
  car: string;
  rating: number | null;
  source: "admin" | "yandex";
  yandex_author_url: string;
  order: number;
};

export type TestimonialsMode = "admin_only" | "yandex_only" | "mixed";

export type TestimonialsSettings = {
  mode: TestimonialsMode;
  yandex_widget_url: string;
};

export type TestimonialsResponse = {
  settings: TestimonialsSettings;
  results: TestimonialItem[];
};
```

### Использование на фронтенде

- Базовый URL API — через `VITE_BACKEND_ORIGIN`.
- При монтировании главной страницы выполнить `GET /api/projects/testimonials/`.
- Подставить `results` в карусель / горизонтальную ленту: поля `quote`, `name`, `car` совпадают с пропсами `TestimonialCard`.
- Если `settings.yandex_widget_url` не пустой — показать кнопку «Все отзывы» со ссылкой на него.
- Если у отзыва `rating` не `null` — можно показывать звёзды.
- При пустом `results` или ошибке сети — разумный фолбэк: статические отзывы из сборки.

### Синхронизация с Яндекс.Картами (бэкенд)

Парсер использует **Playwright** (управляет реальным браузером Chromium).

#### Первичная установка (один раз на сервере)

```bash
pip install playwright
playwright install chromium
```

#### Запуск из Django-админки (рекомендуется)

1. В разделе **«Настройки отзывов»** заполнить поле **«ID организации на Яндекс.Картах»** — числовой ID из URL страницы организации.
2. Нажать кнопку **«▶ Запустить синхронизацию»**.
3. Статус и лог — в разделе **«Логи синхронизации (Яндекс)»**.

> Если Яндекс показывает капчу — парсер откроет видимый браузер на сервере и будет ждать (до 3 минут). В headless-режиме при капче упадёт с ошибкой.

#### Запуск из терминала

```bash
python manage.py sync_yandex_reviews
python manage.py sync_yandex_reviews --org-id 123456789
python manage.py sync_yandex_reviews --max-reviews 50
python manage.py sync_yandex_reviews --headless        # без GUI (не работает при капче)
python manage.py sync_yandex_reviews --dry-run         # без записи в БД
python manage.py sync_yandex_reviews --no-unpublish    # не снимать исчезнувшие
```

Команда:
- добавляет новые отзывы (`published=True`, `source=yandex`),
- обновляет текст и рейтинг изменившихся,
- снимает с публикации отзывы, которых больше нет на Яндексе (если не передан `--no-unpublish`).

ID организации также можно задать через переменную окружения `YANDEX_MAPS_ORG_ID`.

---

## Заявка на странице «Запись» (`/booking`)

Публичная форма записи отправляет данные на бэкенд; заявка сохраняется в БД, на указанный в настройках адрес уходит письмо (если задан SMTP и получатель).

### Модель BookingRequest

Поля (хранятся в админке, правка с фронта недоступна):

- `name: string` — имя.
- `phone: string` — телефон.
- `email: string` — почта.
- `brand: string` — марка автомобиля.
- `model: string` — модель и год.
- `service: string` — выбранная услуга (строка с фронта).
- `message: string` — сообщение (может быть пустым).
- `created_at` — время создания записи.
- `email_sent: boolean` — удалось ли отправить письмо.
- `email_error: string` — текст ошибки доставки почты (если была), либо подсказка, что не задан `BOOKING_TO_EMAIL`.

Дополнительно в теле **POST** можно передать поле `website` — это **honeypot**: оно должно быть пустым; если заполнено, бэкенд вернёт ошибку валидации.

### Эндпоинт заявки

**URL:**  
`POST /api/projects/booking/`

**Заголовки:**

```http
POST /api/projects/booking/
Content-Type: application/json
Accept: application/json
```

**Тело запроса (пример):**

```json
{
  "name": "Иван",
  "phone": "+79991234567",
  "email": "client@example.com",
  "brand": "Toyota",
  "model": "Land Cruiser 200, 2018",
  "service": "Диагностика",
  "message": "Нужна запись на выходных",
  "website": ""
}
```

**Ответ при успехе (201):**

```json
{
  "id": 1,
  "status": "created",
  "email_delivered": true
}
```

Поле `email_delivered` — `true`, если письмо ушло на SMTP; `false`, если получатель не настроен или произошла ошибка отправки (заявка в БД всё равно сохранена).

**Ответ при ошибке валидации (400):**

Типичный формат DRF — объект с полями и списками строк, например:

```json
{
  "phone": ["Укажите корректный номер телефона."]
}
```

### Переменные окружения бэкенда (почта и CORS)

| Переменная | Назначение |
|------------|------------|
| `BOOKING_TO_EMAIL` | Адрес, на который слать уведомления о новой заявке. Если пусто, письмо не отправляется, в ответе `email_delivered: false`. |
| `DEFAULT_FROM_EMAIL` | Отправитель письма (по умолчанию в коде задан запасной локальный адрес). |
| `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`, `EMAIL_USE_TLS` | SMTP. Если `EMAIL_HOST` не задан, используется **console**-бэкенд: текст письма выводится в консоль сервера (удобно для разработки). |
| `CORS_ALLOWED_ORIGINS` | Дополнительные разрешённые origin через запятую (например `https://pickupservicetest.netlify.app`). |

### Типы для фронта

```ts
export type BookingRequestPayload = {
  name: string;
  phone: string;
  email: string;
  brand: string;
  model: string;
  service: string;
  message: string;
  website?: string;
};

export type BookingRequestResponse = {
  id: number;
  status: string;
  email_delivered: boolean;
};
```

### Использование на фронтенде

- Базовый URL API задаётся через `VITE_BACKEND_ORIGIN` (см. корень проекта).
- На странице `/booking` вызвать `POST` с JSON; при успехе показать пользователю подтверждение; при 400 — показать сообщения из ответа.
- Для продакшена на Netlify: задать на бэкенде `CORS_ALLOWED_ORIGINS` с URL фронта и настроить SMTP + `BOOKING_TO_EMAIL`.

---

## Заявка на звонок (CTA формы на `/` и `/portfolio/:id`)

Короткая форма «Оставьте заявку и мы вам позвоним» отправляет на бэкенд только имя и телефон; заявка сохраняется в БД и (если настроено) отправляет уведомление по почте.

### Модель CallbackRequest

Поля (хранятся в админке, правка с фронта недоступна):

- `name: string` — имя.
- `phone: string` — телефон.
- `created_at` — время создания записи.
- `email_sent: boolean` — удалось ли отправить письмо.
- `email_error: string` — текст ошибки доставки почты (если была), либо подсказка, что не задан `BOOKING_TO_EMAIL`.

Дополнительно в теле **POST** можно передать поле `website` — это **honeypot**: оно должно быть пустым; если заполнено, бэкенд вернёт ошибку валидации.

### Эндпоинт заявки на звонок

**URL:**  
`POST /api/projects/callback/`

**Заголовки:**

```http
POST /api/projects/callback/
Content-Type: application/json
Accept: application/json
```

**Тело запроса (пример):**

```json
{
  "name": "Иван",
  "phone": "+79991234567",
  "website": ""
}
```

**Ответ при успехе (201):**

```json
{
  "id": 1,
  "status": "created",
  "email_delivered": true
}
```

Поле `email_delivered` — `true`, если письмо ушло на SMTP; `false`, если получатель не настроен или произошла ошибка отправки (заявка в БД всё равно сохранена).

**Ответ при ошибке валидации (400):**

Типичный формат DRF — объект с полями и списками строк, например:

```json
{
  "phone": ["Укажите корректный номер телефона."]
}
```

### Переменные окружения бэкенда (почта и CORS)

Используются те же переменные, что и для `/booking`:

| Переменная | Назначение |
|------------|------------|
| `BOOKING_TO_EMAIL` | Адрес, на который слать уведомления о новой заявке. Если пусто, письмо не отправляется, в ответе `email_delivered: false`. |
| `DEFAULT_FROM_EMAIL` | Отправитель письма. |
| `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`, `EMAIL_USE_TLS` | SMTP (в деве может быть console-backend). |
| `CORS_ALLOWED_ORIGINS` | Дополнительные разрешённые origin через запятую. |

### Типы для фронта

```ts
export type CallbackRequestPayload = {
  name: string;
  phone: string;
  website?: string;
};

export type CallbackRequestResponse = {
  id: number;
  status: string;
  email_delivered: boolean;
};
```

### Использование на фронтенде

- Базовый URL API задаётся через `VITE_BACKEND_ORIGIN` (см. корень проекта).
- На главной (`/`) и странице проекта (`/portfolio/:id`) вызвать `POST` с JSON; при успехе показать пользователю подтверждение; при `400` — показать сообщения из ответа.
- Рекомендуется добавлять скрытое поле `website` (honeypot) и отправлять его пустым.

---

## Контакты и карта (`/contact`)

Телефон, почта, ссылки на Telegram / WhatsApp / ВКонтакте и параметры встраиваемой карты задаются **одной записью** в Django-админке («Контакты на сайте») и отдаются публичным GET без пагинации.

### Модель ContactSettings

Поля:

- `email: string` — почта для `mailto:` и отображения.
- `phone_display: string` — телефон как текст на странице (например «+7 999 000 00 00»).
- `phone_tel: string` — значение для ссылки `tel:` **без** префикса `tel:` (например `+79990000000`).
- `telegram_url: string` — полный URL; может быть пустым.
- `whatsapp_url: string` — полный URL; может быть пустым.
- `vk_url: string` — полный URL; может быть пустым.
- `map_embed_url: string` — полный `src` для `<iframe>` (ссылка «Встроить карту» из Google / Яндекс и т.д.).
- `coordinates_label: string` — подпись координат под картой / в HUD (может быть пустой).

В API всегда одна логическая конфигурация; вторая запись в админке создать нельзя.

### Эндпоинт контактов

**URL:**  
`GET /api/projects/contact/`

**Пример запроса:**

```http
GET http://127.0.0.1:8000/api/projects/contact/
Accept: application/json
```

**Ответ при успехе (200):**

```json
{
  "email": "info@pickupservice.ru",
  "phone_display": "+7 999 000 00 00",
  "phone_tel": "+79990000000",
  "telegram_url": "",
  "whatsapp_url": "",
  "vk_url": "",
  "map_embed_url": "https://www.google.com/maps/embed?pb=...",
  "coordinates_label": "55.7558° N, 37.5366° E"
}
```

Пустые URL соцсетей приходят как пустые строки — на фронте можно скрывать соответствующие ссылки.

**Ответ, если записи нет (404):**

```json
{
  "detail": "Настройки контактов не заданы."
}
```

После первой миграции бэкенд создаёт запись с дефолтами, совпадающими с прежней вёрсткой страницы контактов.

### Типы для фронта

```ts
export type ContactSettingsResponse = {
  email: string;
  phone_display: string;
  phone_tel: string;
  telegram_url: string;
  whatsapp_url: string;
  vk_url: string;
  map_embed_url: string;
  coordinates_label: string;
};
```

### Использование на фронтенде

- Базовый URL API — через `VITE_BACKEND_ORIGIN` (см. корень проекта).
- На странице `/contact` выполнить `GET /api/projects/contact/` при монтировании.
- Подставить `email` в `mailto:` и текст ссылки; `phone_display` — видимый номер, `href` телефона — `tel:` + `phone_tel`.
- Ссылки Telegram / WhatsApp / ВКонтакте — из `telegram_url`, `whatsapp_url`, `vk_url` (если строка не пустая).
- Карта: `iframe` с `src={map_embed_url}`; подпись координат — `coordinates_label`.
- При 404 или ошибке сети разумный фолбэк — статический текст из сборки, чтобы страница не ломалась.

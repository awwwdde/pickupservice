# Деплой Pickup Service на pickupservice.moscow (72.56.7.171)

Репозиторий: [github.com/awwwdde/pickupservice](https://github.com/awwwdde/pickupservice) — если страница 404, репозиторий приватный: используйте SSH-ключ или Personal Access Token, либо залейте код с вашей машины (`git push` в свой форк/оригинал).

Архитектура на сервере:

- **Nginx** — HTTPS, статика фронта (`dist/`), `/static/` и `/media/`, прокси на Gunicorn для `/api/` и `/admin/`.
- **Gunicorn** (unix-socket) — Django + REST API.
- **SQLite** — файл `server/db.sqlite3` (достаточно для старта; при росте нагрузки можно перейти на PostgreSQL).

---

## 1. DNS и доступ

1. В панели домена **pickupservice.moscow** создайте записи:
   - **A** `@` → `72.56.7.171`
   - **A** `www` → `72.56.7.171` (если нужен www)
2. Дождитесь распространения DNS (часто 5–30 минут, иногда дольше).
3. На сервере откройте порты **22** (SSH), **80** (HTTP), **443** (HTTPS), например:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

---

## 2. ПО на сервере (Ubuntu 22.04/24.04)

```bash
sudo apt update && sudo apt install -y git nginx python3-venv python3-dev build-essential certbot python3-certbot-nginx
```

Node.js для сборки фронта (вариант через NodeSource LTS — актуальная команда с [nodejs.org](https://nodejs.org/)):

```bash
# Пример для Node 20 LTS (проверьте актуальную инструкцию на сайте NodeSource)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v && npm -v
```

---

## 3. Каталог проекта и код

```bash
sudo mkdir -p /var/www/pickupservice
sudo chown $USER:$USER /var/www/pickupservice
cd /var/www/pickupservice
```

### Вариант A — у вас уже есть папка проекта на ПК (вы не владелец чужого GitHub)

Так можно выкладывать сайт без доступа к репозиторию awwwdde.

**1) Архив (проще всего на Windows)**

На своём компьютере заархивируйте папку проекта (ZIP). Исключите тяжёлые/лишние каталоги, чтобы файл был меньше:

- `node_modules`
- `server/venv` или `server/.venv`
- `dist`
- `.git` (не обязателен на сервере, если не пользуетесь git там)

Загрузите архив на сервер любым способом: **WinSCP**, **FileZilla** (SFTP к `user@72.56.7.171`), или через веб-панель хостинга.

На сервере:

```bash
cd /var/www/pickupservice
unzip -q ~/pickupservice.zip -d .
# при необходимости: перенесите содержимое из вложенной папки в текущий каталог
```

**2) Команда `scp` из PowerShell или CMD (Windows 10/11)**

На ПК откройте терминал в **родительской** папке проекта (не внутри `site pickup service`, а уровнем выше) и выполните (подставьте пользователя SSH и путь):

```powershell
scp -r "site pickup service" user@72.56.7.171:/var/www/pickupservice/
```

На сервере получится `/var/www/pickupservice/site pickup service/` — либо переименуйте в `pickupservice`, либо в инструкции ниже замените путь на фактический.

Если `scp` нет — установите **OpenSSH Client** (Параметры Windows → Приложения → Дополнительные компоненты) или используйте **WinSCP**.

**3) Свой GitHub / GitLab**

Создайте **свой** пустой репозиторий, на ПК в папке проекта выполните `git init`, добавьте `origin` на свой URL и `git push`. На сервере тогда: `git clone https://github.com/ВАШ_ЛОГИН/pickupservice.git .` — так проще обновлять сайт командой `git pull`.

### Вариант B — клонирование чужого репозитория (нужен доступ)

Если вам дали доступ к [github.com/awwwdde/pickupservice](https://github.com/awwwdde/pickupservice):

```bash
git clone https://github.com/awwwdde/pickupservice.git .
# или: git clone git@github.com:awwwdde/pickupservice.git .
```

---

## 4. Фронтенд (Vite)

Переменные **вшиваются в сборку** — задайте их перед `npm run build`:

```bash
cd /var/www/pickupservice
export VITE_SITE_URL=https://pickupservice.moscow
export VITE_BACKEND_ORIGIN=https://pickupservice.moscow
npm ci
npm run build
```

Появится каталог `dist/` — его отдаёт Nginx как корень сайта.

---

## 5. Бэкенд (Django)

```bash
cd /var/www/pickupservice/server
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

Окружение Django (скопируйте пример и отредактируйте):

```bash
sudo cp /var/www/pickupservice/deploy/pickupservice.django.env.example /etc/default/pickupservice.django.env
sudo nano /etc/default/pickupservice.django.env
```

Обязательно:

- `DJANGO_SECRET_KEY` — сгенерируйте, например:

  ```bash
  python3 -c "import secrets; print(secrets.token_urlsafe(50))"
  ```

- `DJANGO_DEBUG=false`
- `DJANGO_ALLOWED_HOSTS=pickupservice.moscow,www.pickupservice.moscow,72.56.7.171`
- `DJANGO_BEHIND_PROXY=true`
- `CSRF_TRUSTED_ORIGINS=https://pickupservice.moscow,https://www.pickupservice.moscow`
- `BOOKING_TO_EMAIL` — куда слать заявки с формы
- Настройте **SMTP** (`EMAIL_*`), иначе письма не уйдут (ошибки попадут в логи Gunicorn).

Миграции и статика:

```bash
cd /var/www/pickupservice/server
source venv/bin/activate
set -a && source /etc/default/pickupservice.django.env && set +a
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py createsuperuser
```

Права на файлы, чтобы Gunicorn (пользователь `www-data`) мог писать БД и медиа:

```bash
sudo chown -R www-data:www-data /var/www/pickupservice/server/db.sqlite3 /var/www/pickupservice/server/media 2>/dev/null || true
sudo chown -R www-data:www-data /var/www/pickupservice/server
```

(Если `db.sqlite3` ещё не создан — он появится после `migrate`; затем снова `chown` при необходимости.)

---

## 6. Gunicorn (systemd)

```bash
sudo cp /var/www/pickupservice/deploy/pickupservice.service /etc/systemd/system/pickupservice.service
sudo systemctl daemon-reload
sudo systemctl enable --now pickupservice
sudo systemctl status pickupservice
```

При ошибках смотрите: `journalctl -u pickupservice -e`.

Убедитесь, что сокет создаётся:

```bash
ls -la /run/gunicorn/pickupservice.sock
```

Nginx должен читать сокет: пользователь `www-data` и для nginx, и для gunicorn — обычно ок.

---

## 7. Nginx

### Этап A — только HTTP (до сертификата)

```bash
sudo cp /var/www/pickupservice/deploy/nginx-pickupservice-http-only.conf /etc/nginx/sites-available/pickupservice.moscow
sudo ln -sf /etc/nginx/sites-available/pickupservice.moscow /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

Проверьте в браузере: `http://pickupservice.moscow` — должен открываться сайт (возможен редирект браузера на https позже).

### Этап B — Let's Encrypt

```bash
sudo certbot --nginx -d pickupservice.moscow -d www.pickupservice.moscow
```

Certbot изменит конфиг Nginx и добавит HTTPS.

### Этап C — привести конфиг к эталону (прокси `/api/`, `/admin/`, `/static/`, `/media/`)

После certbot откройте активный конфиг сайта в `/etc/nginx/sites-enabled/` и убедитесь, что:

- для `443` заданы те же `location`, что в файле `deploy/nginx-pickupservice.conf` в репозитории (upstream, `/api/`, `/admin/`, `/static/`, `/media/`, SPA `try_files`);
- в `proxy_set_header` есть `X-Forwarded-Proto $scheme`.

Проще всего: **сравнить** ваш активный конфиг с `deploy/nginx-pickupservice.conf` и **вручную перенести** блоки `upstream`, `location /api/`, `location /admin/`, `location /static/`, `location /media/`, корневой `location /` с `try_files`, подставив **реальные пути** к `ssl_certificate` от certbot (они уже будут в файле).

Если certbot создал отдельный файл только с SSL — объедините логику в один `server { listen 443 ssl; ... }`.

Проверка:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

---

## 8. Что проверить после запуска

| Проверка | Ожидание |
|----------|----------|
| `https://pickupservice.moscow` | Главная SPA |
| `https://pickupservice.moscow/api/projects/` | JSON от API |
| `https://pickupservice.moscow/admin/` | Django Admin (логин superuser) |
| Форма бронирования | Письмо на `BOOKING_TO_EMAIL` (если SMTP настроен) |
| Картинки портфолио | Загружены через админку, отдаются с `/media/` |

---

## 9. Обновление сайта (повторный деплой)

```bash
cd /var/www/pickupservice
git pull
export VITE_SITE_URL=https://pickupservice.moscow
export VITE_BACKEND_ORIGIN=https://pickupservice.moscow
npm ci && npm run build
cd server && source venv/bin/activate
set -a && source /etc/default/pickupservice.django.env && set +a
python manage.py migrate
python manage.py collectstatic --noinput
sudo systemctl restart pickupservice
sudo systemctl reload nginx
```

---

## 10. Частые проблемы

- **502 Bad Gateway** — Gunicorn не запущен или неверный путь к сокету; смотрите `journalctl -u pickupservice`.
- **Статика админки не грузится** — не выполнен `collectstatic` или неверный `alias` для `/static/`.
- **Картинки 404** — проверьте `location /media/` и права на `server/media/`.
- **CSRF / редиректы** — должны быть заданы `CSRF_TRUSTED_ORIGINS` и `DJANGO_BEHIND_PROXY=true`.
- **Репозиторий GitHub 404** — нет доступа к приватному репо; используйте deploy key или загрузите архив вручную.

---

Файлы в каталоге `deploy/` репозитория:

| Файл | Назначение |
|------|------------|
| `nginx-pickupservice-http-only.conf` | Nginx до SSL |
| `nginx-pickupservice.conf` | Эталон с HTTPS (пути к сертификатам — как у Let's Encrypt) |
| `pickupservice.service` | systemd для Gunicorn |
| `gunicorn.conf.py` | воркеры и unix-socket |
| `pickupservice.django.env.example` | шаблон переменных окружения |

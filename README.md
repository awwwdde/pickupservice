<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&height=220&color=0:0B0B0B,50:FF8201,100:111111&text=PickupService&fontColor=FFFFFF&fontSize=58&fontAlignY=38&desc=Off-road%20Workshop%20Digital%20Experience&descAlignY=60" alt="PickupService Hero" />
</p>

<p align="center">
  <a href="https://github.com/awwwdde/pickupservice"><img src="https://img.shields.io/badge/repo-pickupservice-111111?style=for-the-badge&logo=github&logoColor=white" alt="Repo"/></a>
  <img src="https://img.shields.io/badge/react-19-111111?style=for-the-badge&logo=react" alt="React 19"/>
  <img src="https://img.shields.io/badge/vite-6-111111?style=for-the-badge&logo=vite" alt="Vite 6"/>
  <img src="https://img.shields.io/badge/typescript-5.8-111111?style=for-the-badge&logo=typescript" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/framer_motion-animations-FF8201?style=for-the-badge" alt="Framer Motion"/>
</p>

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Inter&weight=600&size=22&pause=900&center=true&vCenter=true&width=820&height=60&color=FF8201&lines=Award-inspired+UI+for+an+off-road+workshop;Bold+Typography+%E2%80%A2+Smooth+Motion+%E2%80%A2+Mobile-First+UX;React+%2B+TypeScript+%2B+Vite+%2B+Framer+Motion+%2B+Lenis" alt="Typing intro"/>
</p>

---

## Why This Project Feels Premium

`PickupService` is crafted like a digital showroom:

- cinematic hero transitions
- motion-led storytelling blocks
- sticky sections with depth and rhythm
- strong typography and contrast-driven visual language
- custom mobile behavior tuned for readability and performance

This is not just a website.  
It is a **brand experience layer** for an off-road workshop.

---

## Live Architecture

```mermaid
flowchart LR
    A[Visitor] --> B[React App]
    B --> C[Pages + Motion Layout]
    C --> D[API Layer]
    D --> E[Django Backend / server]
    C --> F[SEO Generator Script]
```

---

## Visual Stack

<p align="center">
  <img src="https://skillicons.dev/icons?i=react,ts,vite,tailwind,python,django" alt="Tech stack icons"/>
</p>

### Frontend

- React 19
- TypeScript
- Vite 6
- Framer Motion
- Lenis
- Tailwind CSS 4
- React Router

### Backend (optional, `server/`)

- Django 5
- Django REST Framework
- django-cors-headers
- Pillow

---

## Routes

| Route | Purpose |
|---|---|
| `/` | Main landing experience |
| `/service` | Services presentation |
| `/portfolio` | Projects gallery |
| `/portfolio/:id` | Project detail page |
| `/contact` | Contact section |
| `/booking` | Booking form |

---

## Quick Start

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

Lint:

```bash
npm run lint
```

> `seo:generate` runs automatically before `dev`, `build`, and `preview`.

---

## Project Scripts

```json
{
  "dev": "vite",
  "build": "tsc -b && vite build",
  "preview": "vite preview",
  "lint": "eslint .",
  "seo:generate": "node ./scripts/generate-seo-files.mjs"
}
```

---

## Folder Blueprint

```text
pickupservice/
├─ src/
│  ├─ components/
│  │  ├─ header/
│  │  ├─ footer/
│  │  ├─ accordeoncard/
│  │  ├─ reviewcard/
│  │  └─ utils/
│  ├─ pages/
│  │  ├─ main.tsx
│  │  ├─ service.tsx
│  │  ├─ portfolio.tsx
│  │  ├─ project.tsx
│  │  ├─ contact.tsx
│  │  └─ booking.tsx
│  └─ api/
├─ scripts/
│  └─ generate-seo-files.mjs
└─ server/
   ├─ manage.py
   └─ README.md
```

---

## Motion & UX Notes

- Smooth-scroll effects are powered by `Lenis`.
- Route changes enforce scroll reset to top for predictable navigation.
- Mobile layouts are tuned to avoid text overlaps and preserve hierarchy.
- Header behavior adapts to background luminance for better contrast.

---

## Backend Setup (Optional)

```bash
cd server
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Details in `server/README.md`.

---

## Design Direction

If you want to keep the same visual quality while extending the app, follow this rule:

> **Typography first. Motion second. Effects last.**

Clean structure + smooth transitions + intentional accents (`#FF8201`) = the signature style.

---

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&section=footer&height=140&color=0:111111,50:FF8201,100:111111" alt="Footer wave" />
</p>

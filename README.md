# EduDrop — School Donation Platform

> *"Every Drop Counts for Education"*

**Live Demo:** [https://edudrop-platform.vercel.app/](https://edudrop-platform.vercel.app/)

**EduDrop** is a full-stack school donation and sponsorship platform operated by the **EduDrop Foundation**. It connects alumni, parents, and community donors directly with verified partner schools so they can sponsor pure spring water cases, classroom hydration stations, sanitization products, and essential paper supplies with 100% transparency.

---

## Key Features

- **Public School Directory, Galleries & Leaderboards**: Browse verified partner schools (`/schools`), explore active campus needs and photo galleries (`/schools/[slug]`), and view top community donors on each school's leaderboard.
- **Direct Product Sponsorship & Cart**: Sponsor cases of EduDrop Spring Water, hot & cold classroom dispensers, sanitizers, and paper supplies (`/products`, `/products/[slug]`) with one-time or monthly recurring contributions.
- **Self-Contained Sandbox Checkout & PDF Invoices**: Complete one-time and recurring sponsorships (`/checkout`, `/transaction`, `/monthly-transaction`) seamlessly without external payment gateway credentials, and download formatted PDF invoices (`jsPDF`).
- **Donor Dashboard (`/donar-dashboard`)**: View verified sponsorship impact KPIs, school support allocation charts, upcoming monthly renewals, order tracking (`Pending` → `Processing` → `On the way` → `Received`), profile management, and downloadable PDF invoices.
- **Bursar Portal (`/bursar-dashboard`)**: Monitor verified campus funding totals, incoming shipment pipeline stages, and Campus Needs fulfillment progress alongside profile/gallery editing, order confirmation, and the school inbox.
- **Admin Console (`/dashboard`)**: Executive analytics dashboard (KPI strip, `All Active`/`12M`/`6M` Sponsorship Volume Trend, Order Pipeline Donut, ranked `By School`/`By Category` allocation charts, and latest orders) plus full management for partner schools, bursars, catalog products, categories, orders, user accounts, form submissions, **Site Content CMS (`/dashboard/site-content`)**, and **Platform Settings (`/dashboard/settings`)**.
- **In-App Notifications & Portfolio Demo Guard**: Polling notification bell with unread counts and read/dismiss controls; production `demoGuard` middleware with **1-Click Tabbed Demo Sign-In** (`Donor`, `Bursar`, `Admin`), scheduled database/upload resets, and passkey-protected **Owner Mode** unlock.

---

## Tech Stack

- **Frontend (`frontend/`)**: Next.js 16 (App Router, `proxy.ts`), React 19, TypeScript, Tailwind CSS v4, Radix UI, TanStack React Query & React Table, React Hook Form, ApexCharts, jsPDF.
- **Backend (`backend/`)**: Node.js (`>=20 <25`), Express, TypeScript, MongoDB & Mongoose 8, JWT Authentication (`jsonwebtoken` / `jose`), Multer + Sharp (`.webp` image optimization & EXIF stripping), Nodemailer, Zod validation, Phusion Passenger (`app.js`).
- **Database Seed (`backend/seed/`)**: **13** pre-populated MongoDB collection snapshots with fictional US partner schools, USD product catalog, CMS content, notifications, and sanitized demo accounts.

---

## Project Structure

```text
├── .agents/skills/           # Workspace agent runbooks (e.g., edudrop-seed-and-verify)
├── GEMINI.md                 # Project-wide context, URLs & README maintenance rules
├── backend/                  # Express + TypeScript + Mongoose REST API
│   ├── app.js                # Phusion Passenger / cPanel Node.js entry point
│   ├── GEMINI.md             # Backend architecture & security invariants
│   ├── scripts/              # Deployment automation (cpanel-auto-deploy.sh)
│   ├── seed/                 # 13 sanitized MongoDB JSON seed collections
│   ├── src/
│   │   ├── app/modules/      # Feature modules (admin, auth, bursar, category, cms, donar,
│   │   │                     # notification, order, product, school, schoolInbox, schoolInfo,
│   │   │                     # submissions, user)
│   │   ├── config/           # Environment & runtime mode configuration
│   │   ├── helper/           # Seed reset, media cleanup, and owner bypass helpers
│   │   ├── seed.ts           # Database seeding script (npm run seed)
│   │   └── server.ts         # Server entry point (Port 5000, demo reset & storage GC)
│   └── uploads/              # Static .webp assets served at /uploads
└── frontend/                 # Next.js 16 App Router application (Port 3000)
    ├── GEMINI.md             # Frontend design tokens & engineering invariants
    ├── proxy.ts              # Role-based route guard for dashboards & auth pages
    ├── app/
    │   ├── (primary)/        # Public pages, schools, products, checkout, login portals, contact
    │   ├── (dashboard)/      # Admin console (/dashboard, /dashboard/site-content, /dashboard/settings)
    │   ├── (bursar-dashboard)/ # School Bursar portal (/bursar-dashboard)
    │   └── (donar-dashboard)/  # Donor portal (/donar-dashboard)
    └── public/               # Branded EduDrop logos, banners, and vector assets
```

---

## Getting Started

### Prerequisites

- **Node.js** `>=20 <25` (v20 or v22 LTS recommended)
- **MongoDB** v6+ running locally (`mongodb://127.0.0.1:27017/edudrop`) or a MongoDB Atlas connection string

### 1. Backend Setup

```bash
cd backend
cp .env.example .env
npm install
```

Configure `backend/.env` as needed (defaults to `PORT=5000` and `DATABASE_URL=mongodb://127.0.0.1:27017/edudrop`). See `backend/.env.example` for optional production settings (`CORS_ORIGINS`, `ALLOW_VERCEL_PREVIEWS`, `DEMO_MODE`, `DEMO_RESET_INTERVAL_MINUTES`, `OWNER_BYPASS_KEY`, `CRON_SECRET`, and `SMTP_*`).

To seed the database with the **13** pre-configured collections in `backend/seed/`:

```bash
npm run seed
```

Start the backend development server:

```bash
npm run dev
```

The API will be available at `http://localhost:5000/api/v1` (with health checks at `/health` and `/api/v1/health`).

### 2. Frontend Setup

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

The web application will be available at `http://localhost:3000`. Configure `NEXT_PUBLIC_EDUDROP_SERVER_URL`, `NEXT_PUBLIC_EDUDROP_API_URL`, `NEXT_PUBLIC_EDUDROP_DOMAIN`, and optional `NEXT_PUBLIC_MEDIA_DOMAINS` in `frontend/.env.local` for deployed environments.

---

## Demo Credentials

All seeded demo accounts use the password: **`Password123!`** (and **1-Click Demo Sign-In** tabs are available on `/login` when Demo Mode is enabled).

| Role | Login URL | Email | Associated School / Profile |
| :--- | :--- | :--- | :--- |
| **Admin** | `/admin-login` | `admin@edudrop.org` | EduDrop Foundation Admin |
| **Bursar** | `/bursar-login` | `bursar@oakridge.edu` | Oakridge Technical High School (Austin, TX) |
| **Bursar** | `/bursar-login` | `bursar@stclara.edu` | St. Clara Academy (Denver, CO) |
| **Bursar** | `/bursar-login` | `bursar@westfield.edu` | Westfield Collegiate Institute (Seattle, WA) |
| **Bursar** | `/bursar-login` | `bursar@crestview.edu` | Crestview Preparatory School (Boston, MA) |
| **Donor** | `/login` | `donor@edudrop.org` | Maya Lin (Austin, TX) |
| **Donor** | `/login` | `alex.rivera@example.com` | Alex Rivera (Denver, CO) |
| **Donor** | `/login` | `jordan.taylor@example.com` | Jordan Taylor (Seattle, WA) |

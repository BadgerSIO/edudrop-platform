# EduDrop — School Donation Platform

> *"Every Drop Counts for Education"*

**EduDrop** is a full-stack school donation and sponsorship platform operated by the **EduDrop Foundation**. It connects alumni, parents, and community donors directly with verified partner schools so they can sponsor pure spring water cases, classroom hydration stations, sanitization products, and essential paper supplies with 100% transparency.

---

## Key Features

- **Public School Directory & Leaderboards**: Browse verified partner schools, explore their current campus needs, view photo galleries, and see top community donors on each school's leaderboard.
- **Direct Product Sponsorship & Cart**: Sponsor cases of EduDrop Spring Water, hot & cold classroom dispensers, sanitizers, and paper supplies with one-time or monthly recurring contributions.
- **Self-Contained Sandbox Checkout**: Complete one-time and recurring sponsorships seamlessly in local/demo environments without external payment gateway credentials.
- **Donor Dashboard (`/donar-dashboard`)**: Track order delivery status (`Pending` -> `Processing` -> `On the way` -> `Delivered`), manage recurring monthly sponsorships, and update donor profile details.
- **Bursar Portal (`/bursar-dashboard`)**: Dedicated portal for school bursars to update school profiles, manage campus needs lists, upload gallery photos, and read donor messages.
- **Admin Dashboard (`/dashboard`)**: Operations dashboard to manage partner schools, bursars, product catalog, categories, orders, user accounts, and incoming form submissions. (Homepage sections, testimonials, and contact settings are rendered statically on the frontend).

---

## Tech Stack

- **Frontend (`frontend/`)**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Radix UI, TanStack React Query & Table, React Hook Form, Swiper, ApexCharts.
- **Backend (`backend/`)**: Node.js, Express, TypeScript, MongoDB & Mongoose, JWT Authentication, Multer, Nodemailer, Zod validation.
- **Database Seed (`backend/seed/`)**: Pre-populated MongoDB collection snapshots with fictional US partner schools, USD product catalog, and sanitized demo accounts.

---

## Project Structure

```text
├── backend/                  # Express + TypeScript + Mongoose REST API
│   ├── seed/                 # Sanitized MongoDB JSON seed collections
│   ├── src/
│   │   ├── app/modules/      # Feature modules (auth, school, product, order, bursar, donar, submissions, etc.)
│   │   ├── config/           # Environment configuration
│   │   ├── seed.ts           # Database seeding script (npm run seed)
│   │   └── server.ts         # Server entry point (Port 5000)
│   └── uploads/              # Static uploaded assets served at /uploads
└── frontend/                 # Next.js 14 App Router application (Port 3000)
    ├── app/
    │   ├── (primary)/        # Public pages, checkout, login, bursar-login, admin-login
    │   ├── (dashboard)/      # Admin dashboard (/dashboard)
    │   ├── (bursar-dashboard)/ # School Bursar portal (/bursar-dashboard)
    │   └── (donar-dashboard)/  # Donor portal (/donar-dashboard)
    └── public/               # Branded EduDrop logos, banners, and vector assets
```

---

## Getting Started

### Prerequisites

- **Node.js** v18+ (v20 LTS recommended)
- **MongoDB** v6+ running locally (`mongodb://127.0.0.1:27017/edudrop`) or a MongoDB Atlas connection string

### 1. Backend Setup

```bash
cd backend
cp .env.example .env
npm install
```

Configure `backend/.env` as needed (defaults to `PORT=5000` and `DATABASE_URL=mongodb://127.0.0.1:27017/edudrop`).

To seed the database with the 12 pre-configured collections in `backend/seed/`:

```bash
npm run seed
```

Start the backend development server:

```bash
npm run dev
```

The API will be available at `http://localhost:5000/api/v1`.

### 2. Frontend Setup

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

The web application will be available at `http://localhost:3000`.

---

## Demo Credentials

All seeded demo accounts use the password: **`Password123!`**

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

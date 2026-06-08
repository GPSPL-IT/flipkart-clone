# Flipkart Clone

A full-stack e-commerce application inspired by Flipkart.

**Stack:** React 19 + Vite · Node.js 20 + Express · MongoDB 7 · Tailwind CSS · Stripe (mocked)

---

## 🚀 Quick Start with Docker

```bash
# 1. Pehle docker/ folder mein jao
cd filpkart/docker

# 2. Sab 3 containers build aur start karo
docker compose up --build

# 3. Wait karo ~30 sec jab tak backend "healthy" ho jaye
docker compose ps

# 4. Database mein sample data daalo
docker compose exec backend node seed.js
```

> **Note:** Saare docker commands `docker/` folder ke andar se chalao, root se nahi!

| Service  | URL                      |
|----------|--------------------------|
| Frontend | http://localhost:5173    |
| Backend  | http://localhost:5000    |
| Health   | http://localhost:5000/health |

---

## 🔑 Test Credentials

| Role  | Email                  | Password      |
|-------|------------------------|---------------|
| User  | user@flipkart.com      | userpassword  |
| Admin | admin@flipkart.com     | adminpassword |

---

## 🏗️ Project Structure

```
filpkart/
├── docker-compose.yml        # 3-service orchestration
├── .env                      # Root env vars (Docker)
├── backend/
│   ├── Dockerfile
│   ├── server.js             # Express entry point
│   ├── seed.js               # Database seeder
│   ├── config/db.js          # MongoDB connection (with retry)
│   ├── middleware/           # auth + error handlers
│   ├── models/               # Mongoose schemas
│   ├── controllers/          # Business logic
│   └── routes/               # Express routers
└── frontend/
    ├── Dockerfile            # Multi-stage: Vite build → nginx
    ├── nginx.conf            # SPA routing + /api proxy
    └── src/
        ├── App.jsx           # Routes + Providers
        ├── services/api.js   # Axios + JWT interceptor
        ├── context/          # Auth, Cart, Wishlist
        ├── components/       # Navbar, Footer, etc.
        └── pages/            # All page components
```

---

## ⚙️ Environment Variables

Copy `.env` and update values as needed:

| Variable          | Description                                 |
|-------------------|---------------------------------------------|
| `PORT`            | Backend port (default: 5000)                |
| `MONGODB_URI`     | MongoDB connection string                   |
| `JWT_SECRET`      | Secret for signing JWT tokens               |
| `STRIPE_SECRET_KEY` | Stripe key (auto-mocked if placeholder)  |
| `FRONTEND_URL`    | Used for CORS + password reset links        |
| `NODE_ENV`        | `development` or `production`               |

---

## 📡 Key API Routes

| Method | Route | Access |
|--------|-------|--------|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/products` | Public |
| GET | `/api/products/trending` | Public |
| GET | `/api/cart` | Private |
| POST | `/api/orders` | Private |
| GET | `/api/admin/stats` | Admin |

---

## 🛠️ Local Development (without Docker)

```bash
# Backend
cd backend && npm install && npm run dev

# Frontend (new terminal)
cd frontend && npm install && npm run dev
```

> In local dev, Vite auto-proxies `/api` → `http://localhost:5000` via `vite.config.js`.
"# flipkart-clone" 

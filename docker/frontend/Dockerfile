# ============================================================
#  Frontend Dockerfile — Multi-stage build
#  📁 Location: docker/frontend/Dockerfile
#  🔧 Build context: project root (filpkart/)
#
#  Stage 1: Vite se React app build karo
#  Stage 2: nginx se dist/ serve karo
# ============================================================

# ── Stage 1: Builder ─────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Package files pehle — caching ke liye
COPY frontend/package.json frontend/package-lock.json ./

# Sab deps chahiye (Vite build ke liye devDeps bhi)
# --legacy-peer-deps zaroori hai kyunki @stripe/react-stripe-js
# abhi React 19 ko officially support nahi karta (sirf 16/17/18)
RUN npm ci --legacy-peer-deps

# Source code copy karo
COPY frontend/ .

# Production build — /api nginx proxy karega backend tak
RUN VITE_API_URL=/api npm run build

# ── Stage 2: nginx se serve karo ─────────────────────────
FROM nginx:alpine AS production

# Default nginx site remove karo
RUN rm /etc/nginx/conf.d/default.conf

# Hamari custom nginx config copy karo
# (context root hai, isliye docker/ se copy kar sakte hain)
COPY docker/frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Builder stage se built app copy karo
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

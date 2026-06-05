# ============================================================
#  Backend Dockerfile
#  📁 Location: docker/backend/Dockerfile
#  🔧 Build context: project root (filpkart/)
#     isliye sab COPY commands "backend/" se shuru hote hain
# ============================================================

FROM node:20-alpine

WORKDIR /app

# Package files pehle copy karo — better Docker layer caching ke liye
# Agar package.json nahi badla to npm ci dobara nahi chalega
COPY backend/package.json backend/package-lock.json ./

# Sirf production dependencies install karo (no nodemon, no devDeps)
RUN npm ci --omit=dev

# Baaki saara source code copy karo
COPY backend/ .

EXPOSE 5000

CMD ["node", "server.js"]

# ── Stage 1: Build ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copia o package.json e o schema do Prisma antes do npm ci
# (o postinstall script roda 'prisma generate' e precisa do schema)
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

# Copia o restante e compila o TypeScript
COPY . .
RUN npm run build

# ── Stage 2: Production ──────────────────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

# Copia o package.json e o schema do Prisma antes do npm ci --omit=dev
# (o postinstall script roda 'prisma generate' e precisa do schema)
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --omit=dev

# Copia o build compilado do stage de build
COPY --from=builder /app/dist ./dist

EXPOSE 3001

CMD ["node", "dist/main"]

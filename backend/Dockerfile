# ── Stage 1: Build ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Instala dependências (incluindo devDeps para poder compilar TypeScript)
COPY package*.json ./
RUN npm ci

# Gera o Prisma Client
COPY prisma ./prisma/
RUN npx prisma generate

# Copia o restante e compila o TypeScript
COPY . .
RUN npm run build

# ── Stage 2: Production ──────────────────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

# Copia apenas o necessário para produção
COPY package*.json ./
RUN npm ci --omit=dev

# Gera o Prisma Client no container de produção
COPY prisma ./prisma/
RUN npx prisma generate

# Copia o build compilado
COPY --from=builder /app/dist ./dist

EXPOSE 3001

CMD ["node", "dist/main"]

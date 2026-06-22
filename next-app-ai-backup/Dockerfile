FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
COPY prisma ./prisma/
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
RUN apk add --no-cache openssl
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client specifically for Linux
RUN npx prisma generate

# Next.js build
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
RUN apk add --no-cache openssl
WORKDIR /app

ENV NODE_ENV production

# You only need to copy next.config.mjs if you are NOT using the standalone build
# Or you can copy the standalone output:
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Run migrations and start server
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && npm start"]

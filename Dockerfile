# Stage 1: Install all dependencies (including devDeps for drizzle-kit)
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Compile TypeScript
FROM deps AS builder
COPY tsconfig.json ./tsconfig.json
COPY src ./src
RUN npm run build

# Stage 3: Production image
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY package.json ./
COPY drizzle.config.ts ./drizzle.config.ts
COPY drizzle ./drizzle
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 3333

# Run migrations then start the server
CMD ["sh", "-c", "/app/node_modules/.bin/drizzle-kit migrate && exec node /app/dist/server.js"]

# Build stage
FROM node:22.6.0-alpine AS builder
WORKDIR /app


# Install dependencies
COPY package.json ./
COPY package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copy source files
COPY . .

# Build the app
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Production stage
FROM node:22.6.0-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
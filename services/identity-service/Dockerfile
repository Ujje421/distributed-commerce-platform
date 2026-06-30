FROM node:22-alpine AS builder

WORKDIR /app

# Copy monorepo config
COPY package*.json ./
COPY tsconfig.json ./

# Copy shared packages
COPY packages/common/package.json ./packages/common/
COPY packages/database/package.json ./packages/database/
COPY packages/kafka/package.json ./packages/kafka/
COPY packages/resilience/package.json ./packages/resilience/
COPY packages/observability/package.json ./packages/observability/

# Copy service package
COPY services/identity-service/package.json ./services/identity-service/

# Install dependencies
RUN npm install

# Copy source code
COPY packages/ ./packages/
COPY services/identity-service/ ./services/identity-service/

# Generate Prisma Client
WORKDIR /app/services/identity-service
RUN npx prisma generate

# Build shared packages and service
WORKDIR /app
RUN npm run build:packages
RUN npm run build -w services/identity-service

# Production image
FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

# Copy built artifacts from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/common/dist ./packages/common/dist
COPY --from=builder /app/packages/common/package.json ./packages/common/
COPY --from=builder /app/packages/database/dist ./packages/database/dist
COPY --from=builder /app/packages/database/package.json ./packages/database/
COPY --from=builder /app/packages/kafka/dist ./packages/kafka/dist
COPY --from=builder /app/packages/kafka/package.json ./packages/kafka/
COPY --from=builder /app/packages/resilience/dist ./packages/resilience/dist
COPY --from=builder /app/packages/resilience/package.json ./packages/resilience/
COPY --from=builder /app/packages/observability/dist ./packages/observability/dist
COPY --from=builder /app/packages/observability/package.json ./packages/observability/
COPY --from=builder /app/services/identity-service/dist ./services/identity-service/dist
COPY --from=builder /app/services/identity-service/package.json ./services/identity-service/
COPY --from=builder /app/services/identity-service/prisma ./services/identity-service/prisma
COPY --from=builder /app/services/identity-service/node_modules/.prisma ./services/identity-service/node_modules/.prisma

# Non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 3001
EXPOSE 50051

WORKDIR /app/services/identity-service

CMD ["node", "dist/main"]

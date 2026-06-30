FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
COPY packages/common/package.json ./packages/common/
COPY packages/database/package.json ./packages/database/
COPY packages/kafka/package.json ./packages/kafka/
COPY packages/resilience/package.json ./packages/resilience/
COPY packages/observability/package.json ./packages/observability/
COPY services/user-service/package.json ./services/user-service/
RUN npm install
COPY packages/ ./packages/
COPY services/user-service/ ./services/user-service/
WORKDIR /app/services/user-service
RUN npx prisma generate
WORKDIR /app
RUN npm run build:packages
RUN npm run build -w services/user-service

FROM node:22-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/common/dist ./packages/common/dist
COPY --from=builder /app/packages/database/dist ./packages/database/dist
COPY --from=builder /app/packages/kafka/dist ./packages/kafka/dist
COPY --from=builder /app/packages/resilience/dist ./packages/resilience/dist
COPY --from=builder /app/packages/observability/dist ./packages/observability/dist
COPY --from=builder /app/services/user-service/dist ./services/user-service/dist
COPY --from=builder /app/services/user-service/package.json ./services/user-service/
COPY --from=builder /app/services/user-service/prisma ./services/user-service/prisma
COPY --from=builder /app/services/user-service/node_modules/.prisma ./services/user-service/node_modules/.prisma

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser
EXPOSE 3002
WORKDIR /app/services/user-service
CMD ["node", "dist/main"]
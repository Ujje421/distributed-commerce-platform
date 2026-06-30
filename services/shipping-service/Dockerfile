FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
COPY packages/common/package.json ./packages/common/
COPY packages/database/package.json ./packages/database/
COPY packages/kafka/package.json ./packages/kafka/
COPY packages/resilience/package.json ./packages/resilience/
COPY packages/observability/package.json ./packages/observability/
COPY services/shipping-service/package.json ./services/shipping-service/
RUN npm install
COPY packages/ ./packages/
COPY services/shipping-service/ ./services/shipping-service/
WORKDIR /app/services/shipping-service
RUN npx prisma generate
WORKDIR /app
RUN npm run build:packages
RUN npm run build -w services/shipping-service

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
COPY --from=builder /app/services/shipping-service/dist ./services/shipping-service/dist
COPY --from=builder /app/services/shipping-service/package.json ./services/shipping-service/
COPY --from=builder /app/services/shipping-service/prisma ./services/shipping-service/prisma
COPY --from=builder /app/services/shipping-service/node_modules/.prisma ./services/shipping-service/node_modules/.prisma

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser
EXPOSE 3008
WORKDIR /app/services/shipping-service
CMD ["node", "dist/main"]
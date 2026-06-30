FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./

COPY packages/common/package.json ./packages/common/
COPY packages/database/package.json ./packages/database/
COPY packages/kafka/package.json ./packages/kafka/
COPY packages/resilience/package.json ./packages/resilience/
COPY packages/observability/package.json ./packages/observability/
COPY services/product-catalog-service/package.json ./services/product-catalog-service/

RUN npm install

COPY packages/ ./packages/
COPY services/product-catalog-service/ ./services/product-catalog-service/

WORKDIR /app/services/product-catalog-service
RUN npx prisma generate

WORKDIR /app
RUN npm run build:packages
RUN npm run build -w services/product-catalog-service

FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

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
COPY --from=builder /app/services/product-catalog-service/dist ./services/product-catalog-service/dist
COPY --from=builder /app/services/product-catalog-service/package.json ./services/product-catalog-service/
COPY --from=builder /app/services/product-catalog-service/prisma ./services/product-catalog-service/prisma
COPY --from=builder /app/services/product-catalog-service/node_modules/.prisma ./services/product-catalog-service/node_modules/.prisma

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 3003
EXPOSE 50055

WORKDIR /app/services/product-catalog-service

CMD ["node", "dist/main"]

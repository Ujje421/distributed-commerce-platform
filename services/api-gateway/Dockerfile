FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./

COPY packages/common/package.json ./packages/common/
COPY packages/observability/package.json ./packages/observability/
COPY packages/resilience/package.json ./packages/resilience/
COPY services/api-gateway/package.json ./services/api-gateway/

RUN npm install

COPY packages/ ./packages/
COPY services/api-gateway/ ./services/api-gateway/

RUN npm run build:packages
RUN npm run build -w services/api-gateway

FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/common/dist ./packages/common/dist
COPY --from=builder /app/packages/common/package.json ./packages/common/
COPY --from=builder /app/packages/observability/dist ./packages/observability/dist
COPY --from=builder /app/packages/observability/package.json ./packages/observability/
COPY --from=builder /app/packages/resilience/dist ./packages/resilience/dist
COPY --from=builder /app/packages/resilience/package.json ./packages/resilience/
COPY --from=builder /app/services/api-gateway/dist ./services/api-gateway/dist
COPY --from=builder /app/services/api-gateway/package.json ./services/api-gateway/

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 3000

WORKDIR /app/services/api-gateway

CMD ["node", "dist/main"]

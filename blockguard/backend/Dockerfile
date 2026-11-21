# Multi-stage Dockerfile for BlockGuard Backend
FROM node:20-alpine AS builder

WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package*.json tsconfig.json ./
RUN npm ci

COPY src ./src
RUN npm run build

# Production Runner
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001

RUN apk add --no-cache python3 make g++
COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

# Create persistent storage directories and assign ownership
RUN mkdir -p /app/data /app/logs && chown -R node:node /app

EXPOSE 3001
USER node

CMD ["node", "dist/index.js"]

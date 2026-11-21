FROM node:22-bookworm-slim

WORKDIR /app

# Install native build tools for compiling better-sqlite3 C++ addon
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json tsconfig.json ./

# Install dependencies and rebuild better-sqlite3 for Node 22
RUN npm install
RUN npm rebuild better-sqlite3 --build-from-source

COPY src ./src
RUN npm run build

# Ensure persistent directories exist
RUN mkdir -p /app/data /app/logs

ENV NODE_ENV=production
ENV PORT=10000

EXPOSE 10000

CMD ["node", "dist/index.js"]

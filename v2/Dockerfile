# Sasha V2 on a server (Easypanel or any Docker host).
# Build from the REPO ROOT so the shared catalog in data/ is included:
#   docker build -f v2/Dockerfile .
# Easypanel: source = this repo, branch v2, path "/", build = Dockerfile at v2/Dockerfile.
# The same image runs either part, chosen by the start command:
#   agent (default):   node agent.ts start
#   token server:      node server.ts        (listens on $V2_PORT, default 8790)
# Keys come from the service's environment (LIVEKIT_*, GOOGLE_API_KEY, ...), never from files in the image.
FROM node:24-slim

WORKDIR /app/v2
COPY v2/package.json v2/package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# The catalog the store reads (store.ts loads ../data/catalog/products.json).
COPY data/catalog/products.json /app/data/catalog/products.json
COPY v2/ ./

ENV NODE_ENV=production GEMINI=google
EXPOSE 8790 8081
CMD ["node", "agent.ts", "start"]

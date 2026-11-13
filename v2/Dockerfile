# Sasha V2 on a server (Easypanel or any Docker host).
# Build from the REPO ROOT so the shared catalog in data/ is included:
#   docker build -f v2/Dockerfile .
# Easypanel: source = this repo, branch v2, path "/", build = Dockerfile at v2/Dockerfile.
# By default it runs both parts: the agent, and server.ts on port 8790, which serves the store page at /
# plus tokens and try-on pictures. Point a domain at port 8790 to open the site.
# Keys come from the service's environment (LIVEKIT_*, GOOGLE_API_KEY, ...), never from files in the image.
FROM node:24-slim

# The LiveKit room connection (native code in @livekit/rtc-node) needs the system's root certificates,
# which the slim image leaves out. Without them every call fails with "no native root CA certificates found".
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app/v2
COPY v2/package.json v2/package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# The catalog the store reads (store.ts loads ../data/catalog/products.json).
COPY data/catalog/products.json data/catalog/outfits.json /app/data/catalog/
# The store page itself (owned by the main site; served as-is by server.ts).
COPY site/ /app/site/
COPY v2/ ./

ENV NODE_ENV=production GEMINI=google
EXPOSE 8790 8081
CMD ["sh", "-c", "node server.ts & exec node agent.ts start"]

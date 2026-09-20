# SourCode — a deliberately vulnerable sweet shop. Build small, run local.
FROM node:22-slim

LABEL org.opencontainers.image.title="SourCode" \
      org.opencontainers.image.description="A deliberately vulnerable sweet shop for practising web application security." \
      org.opencontainers.image.source="https://github.com/bad-adventure/freefungi" \
      org.opencontainers.image.url="https://freefungi.com" \
      org.opencontainers.image.licenses="MIT"

# better-sqlite3 needs a toolchain to build its native binding
RUN apt-get update && apt-get install -y --no-install-recommends python3 build-essential \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependencies from the lockfile for a reproducible build
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .

# The reseeded database is written at runtime, so let the unprivileged user own /app
RUN chown -R node:node /app
USER node

# Inside the container we bind wide; `docker run -p` maps it to your host.
ENV FF_HOST=0.0.0.0 FF_I_KNOW_WHAT_IM_DOING=1 NODE_ENV=production
EXPOSE 3000

# Liveness probe: the container is unhealthy if /healthz stops answering
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "src/server.js"]

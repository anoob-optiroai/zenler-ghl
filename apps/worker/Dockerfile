FROM node:20-alpine

WORKDIR /app

# Copy root workspace manifest + worker manifest
COPY package.json ./
COPY apps/worker/package.json ./apps/worker/

# Copy Prisma schema (shared between web + worker)
COPY apps/web/prisma ./apps/web/prisma/

# Install worker dependencies
RUN npm install --workspace=apps/worker

# Generate Prisma client pointing at the web schema
RUN npx prisma generate --schema=./apps/web/prisma/schema.prisma

# Copy source & build
COPY apps/worker/src ./apps/worker/src
COPY apps/worker/tsconfig.json ./apps/worker/

RUN cd apps/worker && npx tsc

EXPOSE 3001

CMD ["node", "apps/worker/dist/index.js"]

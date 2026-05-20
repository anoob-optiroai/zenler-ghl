FROM node:20-alpine

WORKDIR /app

# Copy root workspace files
COPY package.json ./
COPY apps/worker/package.json ./apps/worker/
COPY apps/web/prisma ./apps/web/prisma/

# Install deps
RUN npm install --workspace=apps/worker

# Generate Prisma client
RUN npx prisma generate --schema=./apps/web/prisma/schema.prisma

# Copy worker source
COPY apps/worker/src ./apps/worker/src
COPY apps/worker/tsconfig.json ./apps/worker/

# Build
RUN cd apps/worker && npx tsc

EXPOSE 3001

CMD ["node", "apps/worker/dist/index.js"]

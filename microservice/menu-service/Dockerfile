FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY drizzle.config.ts ./
COPY drizzle ./drizzle
COPY src ./src
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/drizzle ./drizzle
COPY --from=build /app/dist ./dist
CMD ["sh", "-c", "node --enable-source-maps dist/db/migrate.js && node --enable-source-maps dist/server.js"]

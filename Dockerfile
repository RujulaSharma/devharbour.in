# Dev Harbour Full-Stack Production Container
FROM node:22-alpine

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install dependencies
RUN npm ci --include=dev

# Copy application code and database
COPY . .

# Generate the additive profile client without applying any database migration.
RUN npm run profile:generate && npm prune --omit=dev

# Expose server port
EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

# Start server
CMD ["node", "server/index.js"]

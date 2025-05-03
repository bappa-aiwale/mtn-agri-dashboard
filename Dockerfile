 # Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy necessary files
# COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Expose the port Cloud Run will use
EXPOSE 8080

# Set the host to 0.0.0.0 to accept connections from Cloud Run
ENV HOSTNAME="0.0.0.0"
ENV PORT=8080

# Start the application
CMD ["node", "server.js"] 

# Multi-stage build for Next.js application
FROM node:18-alpine AS base

# Install dependencies needed for building
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for building)
RUN npm ci

# Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build Next.js application
RUN npm run build

# Production image - run the app with minimal dependencies
FROM base AS runner
WORKDIR /app

# Install security updates and dumb-init for proper signal handling
RUN apk update && apk upgrade && \
    apk add --no-cache dumb-init && \
    rm -rf /var/cache/apk/*

# Create a non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copy built application from builder stage
# Only copy public directory if it exists
COPY --from=builder /app/public* ./
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.js ./next.config.js
# Copy server.js if it exists, otherwise we'll use next start
COPY --from=builder /app/server.js* ./

# Create necessary directories with proper permissions
RUN mkdir -p /app/org-files/work /app/org-files/home && \
    chown -R nextjs:nodejs /app/org-files && \
    chmod 755 /app/org-files

# Set proper permissions
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose the port the app runs on
EXPOSE 3000

# Environment variables
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# For production, use Next.js start command
CMD ["npm", "start"]

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1
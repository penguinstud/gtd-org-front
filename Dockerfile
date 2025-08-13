# Use an official Node.js runtime as a parent image
FROM node:18-alpine AS base

# Install security updates and dumb-init for proper signal handling
RUN apk update && apk upgrade && \
    apk add --no-cache dumb-init && \
    rm -rf /var/cache/apk/*

# Create a non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Set the working directory
WORKDIR /app

# Copy package files with proper ownership
COPY --chown=nextjs:nodejs package*.json ./

# Install dependencies as root, then clean up
RUN npm ci --only=production && \
    npm cache clean --force && \
    rm -rf /tmp/*

# Copy the rest of the application's code with proper ownership
COPY --chown=nextjs:nodejs . .

# Create necessary directories with proper permissions
RUN mkdir -p /app/org-files/work /app/org-files/home && \
    chown -R nextjs:nodejs /app/org-files && \
    chmod 755 /app/org-files

# Set security-focused file permissions
RUN chmod -R 644 /app && \
    chmod 755 /app/server.js && \
    chmod 755 /app/node_modules/.bin/* 2>/dev/null || true

# Switch to non-root user
USER nextjs

# Expose the port the app runs on
EXPOSE 3000

# Use dumb-init for proper signal handling and run as non-root
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1
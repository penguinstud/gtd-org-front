# GTD Org Front - macOS Deployment Guide

## Prerequisites

### Required Software
1. **Docker Desktop for Mac** (includes Docker Compose)
   - Download from: https://www.docker.com/products/docker-desktop/
   - Minimum version: Docker Desktop 4.0+
   - Ensure you allocate at least 2GB RAM in Docker Desktop preferences

2. **Git** (for cloning the repository)
   - Install via Homebrew: `brew install git`
   - Or download from: https://git-scm.com/download/mac

### System Requirements
- macOS 10.15 (Catalina) or later
- 4GB RAM minimum (8GB recommended)
- 2GB free disk space

## Installation Steps

### 1. Clone the Repository
```bash
# Navigate to your preferred directory
cd ~/Documents

# Clone the repository
git clone https://github.com/penguinstud/gtd-org-front.git

# Enter the project directory
cd gtd-org-front
```

### 2. Prepare Org Files Directory
```bash
# Create the org-files directories for your data
mkdir -p org-files/work org-files/home

# Optional: Copy existing org files if you have them
# cp ~/your-existing-org-files/*.org org-files/work/
# cp ~/your-existing-org-files/*.org org-files/home/
```

### 3. Configure Environment (Optional)
Create a `.env.local` file for custom configuration:
```bash
# Create environment file
touch .env.local

# Add custom configuration (example)
echo "NODE_ENV=production" >> .env.local
echo "ORG_WORK_DIR=/app/org-files/work" >> .env.local
echo "ORG_HOME_DIR=/app/org-files/home" >> .env.local
```

## Important Configuration Notes

### Build Configuration
The application now builds successfully without ignoring errors:
```javascript
typescript: {
  ignoreBuildErrors: false,  // All TypeScript errors have been fixed
},
eslint: {
  ignoreDuringBuilds: false, // All ESLint errors have been fixed
}
```

**Note:** All build errors have been resolved. The application compiles cleanly without any TypeScript or ESLint issues.

## Deployment Methods

### Method 1: Docker Compose (Recommended)

#### Production Deployment
```bash
# Build and start the production container
docker-compose -f docker-compose.prod.yml up -d --build

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# The application will be available at http://localhost:3000
```

#### Development Mode
```bash
# For development with hot-reload (uses Dockerfile.dev)
docker-compose up -d --build

# View logs
docker-compose logs -f

# The application will be available at http://localhost:3000
```

#### Stop the Application
```bash
# Stop the container
docker-compose down

# Stop and remove volumes (WARNING: this will delete your org files)
# docker-compose down -v
```

#### Restart the Application
```bash
# Restart after changes
docker-compose restart

# Rebuild after code changes
docker-compose up -d --build
```

### Method 2: Docker Run (Alternative)

#### Build the Image
```bash
# Build the Docker image
docker build -t gtd-org-front .
```

#### Run the Container
```bash
# Run with volume mounts for persistent data
docker run -d \
  --name gtd-org-front \
  -p 3000:3000 \
  -v $(pwd)/org-files:/app/org-files:rw \
  -v $(pwd):/app:ro \
  -v /app/node_modules \
  --user 1001:1001 \
  --cap-drop ALL \
  --cap-add CHOWN \
  --cap-add DAC_OVERRIDE \
  --cap-add SETGID \
  --cap-add SETUID \
  --security-opt no-new-privileges:true \
  --memory="512m" \
  --cpus="0.5" \
  gtd-org-front
```

#### Manage the Container
```bash
# Stop the container
docker stop gtd-org-front

# Start the container
docker start gtd-org-front

# Remove the container
docker rm gtd-org-front

# View logs
docker logs -f gtd-org-front
```

## Accessing the Application

Once running, access the application at:
- **URL**: http://localhost:3000
- **Work Context**: http://localhost:3000/work
- **Home Context**: http://localhost:3000/home

## Data Management

### Org Files Location
Your org-mode files are stored in:
```
gtd-org-front/
├── org-files/
│   ├── work/     # Work-related tasks and projects
│   └── home/     # Personal tasks and projects
```

### Backup Your Data
```bash
# Create a backup
tar -czf gtd-backup-$(date +%Y%m%d).tar.gz org-files/

# Restore from backup
tar -xzf gtd-backup-20250114.tar.gz
```

### Import Existing Org Files
```bash
# Copy your existing org files to the appropriate context
cp ~/Documents/work-tasks.org org-files/work/
cp ~/Documents/personal-tasks.org org-files/home/
```

## Troubleshooting

### Port Already in Use
If port 3000 is already in use:
```bash
# Check what's using port 3000
lsof -i :3000

# Use a different port in docker-compose.yml
# Change "3000:3000" to "3001:3000"
# Then access at http://localhost:3001
```

### Permission Issues
If you encounter permission errors with org files:
```bash
# Fix permissions
chmod -R 755 org-files/
```

### Container Won't Start
```bash
# Check Docker Desktop is running
docker version

# Check container logs
docker-compose logs

# Rebuild the container
docker-compose down
docker-compose up --build
```

### Memory Issues
If the application runs slowly:
1. Open Docker Desktop
2. Go to Preferences → Resources
3. Increase Memory allocation to at least 4GB
4. Apply & Restart

## Updating the Application

### Pull Latest Changes
```bash
# Stop the current container
docker-compose down

# Pull latest code
git pull origin main

# Rebuild and start
docker-compose up -d --build
```

### Preserve Your Data
Your org files in `org-files/` directory are preserved during updates. They are mounted as volumes and won't be affected by container rebuilds.

## Advanced Configuration

### Custom Port
Edit `docker-compose.yml`:
```yaml
services:
  web:
    ports:
      - "8080:3000"  # Access at http://localhost:8080
```

### Resource Limits
Adjust in `docker-compose.yml`:
```yaml
deploy:
  resources:
    limits:
      memory: 1G      # Increase memory
      cpus: '1.0'     # Increase CPU allocation
```

### Development Mode
For development with hot-reload:
```bash
# Run in development mode
docker-compose up

# Or modify docker-compose.yml
environment:
  - NODE_ENV=development
  - WATCHPACK_POLLING=true
```

## Security Notes

- The application runs as a non-root user (UID 1001) for security
- Application code is mounted read-only
- Only the org-files directory has write permissions
- Security capabilities are minimized (cap_drop: ALL)
- Memory and CPU limits prevent resource exhaustion

## Verified Deployment

This deployment guide has been tested on macOS with the following results:
- ✅ Docker Desktop 28.3.2 with Docker Compose v2.38.2
- ✅ Application builds and runs successfully in Docker
- ✅ Health check endpoint works: `/api/health`
- ✅ Data persistence verified in `org-files/` directory
- ✅ Stop/start/restart procedures work correctly
- ✅ Resource limits and security settings applied

## Support

### Check Application Health
```bash
# Using Docker Compose
docker-compose ps

# Check health status (container name may vary)
docker inspect $(docker-compose ps -q web) --format='{{.State.Health.Status}}'

# Test health endpoint
curl http://localhost:3000/api/health
```

### View Logs
```bash
# All logs
docker-compose logs

# Follow logs in real-time
docker-compose logs -f

# Last 100 lines
docker-compose logs --tail=100
```

### Reset Everything
```bash
# WARNING: This will delete all containers and volumes
docker-compose down -v
docker system prune -a

# Then rebuild
docker-compose up -d --build
```

## Quick Reference

| Command | Description |
|---------|-------------|
| `docker-compose up -d` | Start application in background |
| `docker-compose down` | Stop application |
| `docker-compose logs -f` | View real-time logs |
| `docker-compose restart` | Restart application |
| `docker-compose up -d --build` | Rebuild and start |
| `docker-compose ps` | Check container status |

## Next Steps

1. Access the application at http://localhost:3000
2. Create your first tasks in the Work or Home context
3. Organize with GTD methodology (Inbox, Next Actions, Projects, etc.)
4. Customize your workflow with tags and priorities

For more information, see:
- [Architecture Documentation](ARCHITECTURE-REQUIREMENTS.md)
- [Feature Development Plan](FEATURE_DEVELOPMENT_PLAN.md)
- [Security Architecture](docs/SECURITY-ARCHITECTURE.md)
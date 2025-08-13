# Automation Scripts

## Overview
The scripts directory contains automation tools and utilities to streamline development, deployment, and maintenance tasks. These scripts help maintain consistency across development environments and simplify complex operations.

## Current Scripts
```
scripts/
└── rebuild-container.sh    → Docker container rebuild utility
```

## Script Specifications

### Container Rebuild Script (`rebuild-container.sh`)
- **Purpose**: Rebuild Docker containers with proper cleanup
- **Usage**: `./scripts/rebuild-container.sh`
- **Features**:
  - Stops existing containers
  - Removes old images
  - Rebuilds with fresh dependencies
  - Preserves org-files data
  - Validates build success

#### Script Workflow
```bash
#!/bin/bash
# 1. Stop running containers
docker-compose down

# 2. Remove existing images (optional)
docker rmi gtd-org-front_web

# 3. Rebuild containers
docker-compose build --no-cache

# 4. Start services
docker-compose up -d

# 5. Show logs
docker-compose logs -f
```

## Common Operations

### Development Workflow
```bash
# Full rebuild (clean slate)
./scripts/rebuild-container.sh

# Quick restart (preserves cache)
docker-compose restart

# View logs
docker-compose logs -f web

# Enter container shell
docker-compose exec web sh
```

### Deployment Scripts (Planned)
```bash
# Production deployment
./scripts/deploy-production.sh

# Staging deployment
./scripts/deploy-staging.sh

# Backup data
./scripts/backup-org-files.sh
```

## Script Guidelines

### Best Practices
1. **Error Handling**: Always check command success
2. **Logging**: Provide clear output messages
3. **Idempotency**: Scripts should be safe to run multiple times
4. **Documentation**: Include usage instructions in script
5. **Validation**: Verify prerequisites before execution

### Script Template
```bash
#!/bin/bash
set -e  # Exit on error

# Script: script-name.sh
# Purpose: Brief description
# Usage: ./scripts/script-name.sh [options]

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Validate prerequisites
check_requirements() {
    command -v docker >/dev/null 2>&1 || {
        log_error "Docker is required but not installed."
        exit 1
    }
}

# Main execution
main() {
    log_info "Starting script execution..."
    check_requirements
    
    # Script logic here
    
    log_info "Script completed successfully!"
}

# Run main function
main "$@"
```

## Future Scripts (Planned)

### Development Tools
- `setup-dev-env.sh` - Initialize development environment
- `run-tests.sh` - Execute test suites with coverage
- `lint-check.sh` - Run linting and type checking
- `format-code.sh` - Apply code formatting

### Deployment Tools
- `deploy.sh` - Universal deployment script
- `rollback.sh` - Revert to previous version
- `health-check.sh` - Verify deployment health
- `scale.sh` - Adjust container resources

### Maintenance Tools
- `backup-data.sh` - Backup org files
- `restore-data.sh` - Restore from backup
- `cleanup-logs.sh` - Remove old log files
- `update-deps.sh` - Update dependencies safely

### Security Tools
- `security-scan.sh` - Run security audits
- `update-secrets.sh` - Rotate secrets
- `check-vulnerabilities.sh` - Scan for CVEs

## Environment Variables
Scripts may use these environment variables:
```bash
# Docker settings
DOCKER_BUILDKIT=1
COMPOSE_DOCKER_CLI_BUILD=1

# Application settings
NODE_ENV=development
ORG_WORK_DIR=/app/org-files/work
ORG_HOME_DIR=/app/org-files/home

# Script settings
VERBOSE=true
DRY_RUN=false
```

## Error Handling

### Exit Codes
- `0` - Success
- `1` - General error
- `2` - Missing dependencies
- `3` - Invalid arguments
- `4` - Permission denied
- `5` - Network error

### Error Recovery
```bash
# Cleanup on error
trap cleanup EXIT

cleanup() {
    if [ $? -ne 0 ]; then
        log_error "Script failed, cleaning up..."
        # Cleanup logic
    fi
}
```

## Integration with CI/CD

### GitHub Actions Example
```yaml
- name: Rebuild Container
  run: |
    chmod +x ./scripts/rebuild-container.sh
    ./scripts/rebuild-container.sh
```

### GitLab CI Example
```yaml
rebuild:
  script:
    - ./scripts/rebuild-container.sh
  only:
    - main
```

## Script Testing

### Test Framework
```bash
# test-scripts.sh
#!/bin/bash

# Test individual scripts
test_rebuild_container() {
    ./scripts/rebuild-container.sh --dry-run
    assert_equals $? 0 "Rebuild script should succeed"
}

# Run all tests
run_tests() {
    test_rebuild_container
    # Add more tests
}
```

## Troubleshooting

### Common Issues
1. **Permission Denied**: Make scripts executable with `chmod +x`
2. **Command Not Found**: Ensure Docker/dependencies installed
3. **Port Conflicts**: Check for services using port 3000
4. **Disk Space**: Ensure adequate space for Docker images

### Debug Mode
```bash
# Enable debug output
DEBUG=1 ./scripts/rebuild-container.sh

# Or use bash debug mode
bash -x ./scripts/rebuild-container.sh
```

## Contributing Scripts

### Checklist for New Scripts
- [ ] Clear purpose and documentation
- [ ] Error handling and validation
- [ ] Follows naming convention
- [ ] Includes usage examples
- [ ] Tested on multiple platforms
- [ ] Added to this documentation

### Naming Convention
- Use lowercase with hyphens
- Be descriptive but concise
- Include action verb
- Examples: `build-app.sh`, `deploy-staging.sh`

## Dependencies
- **Bash**: Shell scripting (4.0+)
- **Docker**: Container management
- **Docker Compose**: Multi-container orchestration
- **Git**: Version control operations

## Related Modules
- **Docker Config**: [`/Dockerfile`](../Dockerfile), [`/docker-compose.yml`](../docker-compose.yml)
- **Documentation**: [`/docs/CONTAINER_REBUILD_GUIDE.md`](../docs/CONTAINER_REBUILD_GUIDE.md)
- **Root Docs**: [`/CLAUDE.md`](../CLAUDE.md) - Project overview
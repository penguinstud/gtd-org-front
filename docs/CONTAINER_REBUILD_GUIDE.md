# Container Rebuild Guide

This guide provides instructions for using the container rebuild script to quickly rebuild and restart the GTD Org Front Docker container during development.

## Quick Start

The simplest way to rebuild the container:

```bash
./scripts/rebuild-container.sh
```

## Installation

First, make the script executable:

```bash
chmod +x scripts/rebuild-container.sh
```

## Usage

### Basic Commands

```bash
# Basic rebuild - stops, rebuilds, and starts container
./scripts/rebuild-container.sh

# Rebuild with resource cleanup
./scripts/rebuild-container.sh --clean

# Rebuild with deep cleanup (removes all unused Docker resources)
./scripts/rebuild-container.sh --deep-clean

# Show logs after rebuild
./scripts/rebuild-container.sh --logs

# Quick rebuild (skips stopping if container not running)
./scripts/rebuild-container.sh --quick
```

### Command Options

| Option | Short | Description |
|--------|-------|-------------|
| `--help` | `-h` | Display help information |
| `--clean` | `-c` | Clean dangling Docker resources before rebuild |
| `--deep-clean` | `-d` | Perform deep clean (removes ALL unused Docker resources) |
| `--logs` | `-l` | Show container logs after rebuild |
| `--quick` | `-q` | Skip stopping containers if not running |
| `--verbose` | `-v` | Show detailed build output |

### Common Use Cases

#### 1. Development Rebuild
When you've made changes to the code and need to rebuild:
```bash
./scripts/rebuild-container.sh
```

#### 2. Clean Rebuild
When you want to ensure a fresh build without cached layers:
```bash
./scripts/rebuild-container.sh --clean
```

#### 3. Troubleshooting Build
When you need to see what's happening during the build:
```bash
./scripts/rebuild-container.sh --verbose --logs
```

#### 4. Full Reset
When you want to completely reset Docker state:
```bash
./scripts/rebuild-container.sh --deep-clean
```

## What the Script Does

1. **Pre-flight Checks**
   - Verifies Docker is running
   - Changes to project root directory

2. **Container Management**
   - Stops existing containers (unless `--quick` mode)
   - Removes associated volumes and orphan containers

3. **Optional Cleanup**
   - Basic clean: Removes dangling images and stopped containers
   - Deep clean: Removes all unused Docker resources

4. **Build Process**
   - Builds container with `--no-cache` flag
   - Shows progress during build
   - Uses docker-compose configuration

5. **Container Startup**
   - Starts the container in detached mode
   - Waits for health check to pass
   - Displays success message with access URL

6. **Optional Log Display**
   - Shows last 50 lines of container logs

## Script Features

### Safety Features
- Uses `set -euo pipefail` for error handling
- Validates Docker daemon is running
- Provides clear error messages
- Non-destructive by default

### Developer Experience
- Colored output for better readability
- Progress indicators during operations
- Health check monitoring
- Clear success/failure messages

### Performance
- Quick mode for faster rebuilds
- Configurable cleanup options
- Efficient resource management

## Troubleshooting

### Common Issues

#### Docker Not Running
```
[ERROR] Docker is not running. Please start Docker and try again.
```
**Solution**: Start Docker Desktop or Docker daemon

#### Build Failures
```
[ERROR] Container build failed
```
**Solution**: 
1. Check Dockerfile syntax
2. Review recent code changes
3. Run with `--verbose` for detailed output
4. Check available disk space

#### Health Check Timeout
```
[WARNING] Health check timeout - container may still be starting
```
**Solution**: 
1. Check application logs with `docker-compose logs`
2. Verify the application starts correctly
3. Check port 3000 is not in use

### Manual Recovery

If the script fails, you can manually recover:

```bash
# Stop all containers
docker-compose down

# Remove all containers and volumes
docker-compose down -v

# Rebuild manually
docker-compose build --no-cache

# Start containers
docker-compose up -d
```

## Integration with Development Workflow

### Pre-commit Hook
Add to `.git/hooks/pre-commit`:
```bash
#!/bin/bash
echo "Rebuilding container for testing..."
./scripts/rebuild-container.sh --quick
```

### VS Code Task
Add to `.vscode/tasks.json`:
```json
{
    "label": "Rebuild Container",
    "type": "shell",
    "command": "./scripts/rebuild-container.sh",
    "group": "build",
    "presentation": {
        "reveal": "always",
        "panel": "new"
    }
}
```

### Makefile Integration
Add to `Makefile`:
```makefile
rebuild:
	./scripts/rebuild-container.sh

rebuild-clean:
	./scripts/rebuild-container.sh --clean

rebuild-full:
	./scripts/rebuild-container.sh --deep-clean --logs
```

## Best Practices

1. **Regular Rebuilds**: Rebuild after significant dependency changes
2. **Clean Builds**: Use `--clean` weekly to prevent cache bloat
3. **Deep Clean**: Use `--deep-clean` monthly or when experiencing issues
4. **Quick Mode**: Use for rapid iteration during development
5. **Logs**: Always check logs when debugging issues

## Security Considerations

The rebuild script maintains security best practices:
- Runs containers with non-root user (nextjs:1001)
- Preserves security contexts from docker-compose.yml
- Maintains read-only mounts where appropriate
- Respects resource limits defined in configuration

## Performance Tips

1. **Use Quick Mode**: Skip unnecessary stops during development
2. **Avoid Deep Clean**: Only use when necessary as it's resource-intensive
3. **Cache Strategy**: Let Docker cache layers when possible
4. **Resource Limits**: Adjust in docker-compose.yml if needed

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [Project README](../README.md)
- [Development Guide](../DEVELOPMENT.md)
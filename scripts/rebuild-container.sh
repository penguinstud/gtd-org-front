#!/bin/bash

# GTD Org Front - Container Rebuild Script
# This script provides a fast and safe way to rebuild the Docker container

set -euo pipefail

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
COMPOSE_FILE="docker-compose.yml"
SERVICE_NAME="web"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Function to stop running containers
stop_containers() {
    print_status "Stopping existing containers..."
    docker-compose -f "$PROJECT_ROOT/$COMPOSE_FILE" down --volumes --remove-orphans || true
    print_success "Containers stopped"
}

# Function to clean Docker resources
clean_docker() {
    if [[ "$1" == "--deep-clean" ]]; then
        print_warning "Performing deep clean..."
        docker system prune -af --volumes
        print_success "Deep clean completed"
    else
        print_status "Cleaning dangling images and containers..."
        docker container prune -f
        docker image prune -f
        print_success "Basic clean completed"
    fi
}

# Function to rebuild container
rebuild_container() {
    print_status "Building container with no-cache option..."
    
    # Build with progress and no cache
    if docker-compose -f "$PROJECT_ROOT/$COMPOSE_FILE" build --no-cache --progress=plain; then
        print_success "Container built successfully"
    else
        print_error "Container build failed"
        exit 1
    fi
}

# Function to start container
start_container() {
    print_status "Starting container..."
    
    if docker-compose -f "$PROJECT_ROOT/$COMPOSE_FILE" up -d; then
        print_success "Container started successfully"
        
        # Wait for health check
        print_status "Waiting for health check..."
        local max_attempts=30
        local attempt=0
        
        while [ $attempt -lt $max_attempts ]; do
            if docker-compose -f "$PROJECT_ROOT/$COMPOSE_FILE" ps | grep -q "healthy"; then
                print_success "Container is healthy"
                break
            fi
            
            if [ $attempt -eq $((max_attempts - 1)) ]; then
                print_warning "Health check timeout - container may still be starting"
                break
            fi
            
            sleep 2
            attempt=$((attempt + 1))
        done
    else
        print_error "Failed to start container"
        exit 1
    fi
}

# Function to show container logs
show_logs() {
    if [[ "$1" == "--logs" ]]; then
        print_status "Showing container logs (last 50 lines)..."
        docker-compose -f "$PROJECT_ROOT/$COMPOSE_FILE" logs --tail=50 "$SERVICE_NAME"
    fi
}

# Function to display help
show_help() {
    cat << EOF
GTD Org Front - Container Rebuild Script

Usage: $(basename "$0") [OPTIONS]

OPTIONS:
    -h, --help          Show this help message
    -c, --clean         Clean Docker resources before rebuild
    -d, --deep-clean    Perform deep clean (removes all unused Docker resources)
    -l, --logs          Show container logs after rebuild
    -q, --quick         Skip stopping containers if not running
    -v, --verbose       Show detailed build output

EXAMPLES:
    # Basic rebuild
    $(basename "$0")
    
    # Rebuild with clean
    $(basename "$0") --clean
    
    # Rebuild with deep clean and logs
    $(basename "$0") --deep-clean --logs
    
    # Quick rebuild (skip stop if not running)
    $(basename "$0") --quick

EOF
}

# Main script logic
main() {
    local do_clean=false
    local deep_clean=false
    local show_logs_flag=false
    local quick_mode=false
    local verbose=false
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -c|--clean)
                do_clean=true
                shift
                ;;
            -d|--deep-clean)
                do_clean=true
                deep_clean=true
                shift
                ;;
            -l|--logs)
                show_logs_flag=true
                shift
                ;;
            -q|--quick)
                quick_mode=true
                shift
                ;;
            -v|--verbose)
                verbose=true
                shift
                ;;
            *)
                print_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # Change to project root
    cd "$PROJECT_ROOT"
    
    print_status "Starting container rebuild process..."
    echo -e "${BLUE}Project:${NC} GTD Org Front"
    echo -e "${BLUE}Location:${NC} $PROJECT_ROOT"
    echo ""
    
    # Check Docker
    check_docker
    
    # Stop containers unless in quick mode
    if [[ "$quick_mode" == false ]]; then
        stop_containers
    else
        print_status "Quick mode: Skipping container stop"
    fi
    
    # Clean if requested
    if [[ "$do_clean" == true ]]; then
        if [[ "$deep_clean" == true ]]; then
            clean_docker "--deep-clean"
        else
            clean_docker ""
        fi
    fi
    
    # Rebuild container
    rebuild_container
    
    # Start container
    start_container
    
    # Show logs if requested
    if [[ "$show_logs_flag" == true ]]; then
        show_logs "--logs"
    fi
    
    echo ""
    print_success "Container rebuild completed!"
    echo -e "${GREEN}Access the application at:${NC} http://localhost:3000"
}

# Run main function
main "$@"
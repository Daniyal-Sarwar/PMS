#!/bin/bash
# entrypoint.sh for Patient Management System backend

set -e

# Function to log messages
log() {
    echo "$(date +'%Y-%m-%d %H:%M:%S') - $1"
}

# Function to handle exit
cleanup() {
    log "Stopping Patient Management System API"
    pkill -f "uvicorn main:app" || true
    exit 0
}

# Set trap for graceful shutdown
trap cleanup SIGTERM SIGINT

# Create data directory if it doesn't exist
if [ ! -d "/app/data" ]; then
    log "Creating data directory"
    mkdir -p /app/data
    echo "{}" > /app/data/patients.json
    log "Created patients.json with empty object"
fi

# Ensure data directory exists and has proper permissions
# This is especially important for K8s deployments
if [ -d "/app/data" ]; then
    log "Setting data directory permissions for current user"
    # Ensure the current user can write to the data directory
    if [ -w "/app/data" ]; then
        log "Data directory is writable"
    else
        log "Warning: Data directory is not writable by current user"
        # Try to fix permissions if possible
        chmod 755 /app/data 2>/dev/null || log "Could not change directory permissions"
    fi
    
    # Ensure patients.json exists and is writable
    if [ ! -f "/app/data/patients.json" ]; then
        echo "{}" > /app/data/patients.json || log "Could not create patients.json"
    fi
    
    if [ -f "/app/data/patients.json" ]; then
        chmod 644 /app/data/patients.json 2>/dev/null || log "Could not change file permissions"
    fi
fi

# Check if application is healthy
check_health() {
    if curl -s -f http://localhost:${PORT:-8000}/health > /dev/null; then
        return 0
    else
        return 1
    fi
}

# Wait for any dependent services if needed
wait_for_service() {
    local host="$1"
    local port="$2"
    local service_name="$3"
    local timeout="${4:-30}"
    
    log "Waiting for $service_name at $host:$port to be available"
    for i in $(seq 1 $timeout); do
        if nc -z "$host" "$port"; then
            log "$service_name is available after $i seconds"
            return 0
        fi
        sleep 1
    done
    log "Timeout after $timeout seconds waiting for $service_name"
    return 1
}

# Handle command line arguments
if [ "$1" = "uvicorn" ]; then
    log "Starting Patient Management System API with uvicorn"
    exec "$@"
elif [ "$1" = "gunicorn" ]; then
    log "Starting Patient Management System API with gunicorn"
    exec gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:${PORT:-8000} --forwarded-allow-ips="*" --access-logfile - --error-logfile -
else
    log "Starting Patient Management System API with default settings"
    exec uvicorn main:app --host ${HOST:-0.0.0.0} --port ${PORT:-8000} --proxy-headers
fi

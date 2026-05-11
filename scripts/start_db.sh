#!/usr/bin/env bash
# Start (or re-use) the local PostgreSQL container for Energy Community.
set -euo pipefail

NAME="${PG_CONTAINER:-energy-community-pg}"
PORT="${PG_PORT:-5433}"
USER="${PG_USER:-energy}"
PASSWORD="${PG_PASSWORD:-energy}"
DB="${PG_DB:-energy_community}"
IMAGE="${PG_IMAGE:-docker.io/library/postgres:16-alpine}"

if podman container exists "$NAME"; then
    state=$(podman inspect -f '{{.State.Status}}' "$NAME")
    if [ "$state" != "running" ]; then
        echo "Starting existing container $NAME"
        podman start "$NAME" >/dev/null
    else
        echo "Container $NAME already running"
    fi
else
    echo "Creating container $NAME on port $PORT"
    podman run -d \
        --name "$NAME" \
        -e POSTGRES_USER="$USER" \
        -e POSTGRES_PASSWORD="$PASSWORD" \
        -e POSTGRES_DB="$DB" \
        -p "$PORT":5432 \
        "$IMAGE" >/dev/null
fi

echo "Waiting for Postgres to accept connections..."
for i in $(seq 1 30); do
    if podman exec "$NAME" pg_isready -U "$USER" -d "$DB" >/dev/null 2>&1; then
        echo "Postgres ready at localhost:$PORT"
        exit 0
    fi
    sleep 1
done
echo "Postgres did not become ready in time" >&2
exit 1

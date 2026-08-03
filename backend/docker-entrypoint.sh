#!/bin/sh
set -e

# Migrations run before the app starts.
#
# Startup seeding queries admin_user, so on a fresh database the API would
# crash-loop before anyone could run migrations by hand — and `docker compose
# exec` needs a running container, so there would be no way out.
#
# This is safe here because exactly one API container runs. With several
# replicas this would race and migrations would belong in a separate job.
echo "Applying database migrations…"
alembic upgrade head

exec "$@"

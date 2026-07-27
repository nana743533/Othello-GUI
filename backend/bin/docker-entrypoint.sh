#!/bin/bash
set -e

# Remove a potentially pre-existing server.pid for Rails.
rm -f /app/backend/tmp/pids/server.pid

cd /app/backend

if [ "$RAILS_ENV" = "production" ]; then
  echo "Preparing production database..."
  bundle exec rails db:prepare
else
  # Compile Othello AI binaries at dev startup (production uses pre-built binaries from the builder stage)
  for version in v1 v2 v3; do
    echo "Compiling Othello AI (${version})..."
    if [ -f "othelloai_logic/${version}/othello.cpp" ]; then
      g++ -O3 -o "othelloai_logic/${version}/othello" "othelloai_logic/${version}/othello.cpp"
      chmod +x "othelloai_logic/${version}/othello"
      echo "Compilation successful (${version})."
    else
      echo "Warning: othelloai_logic/${version}/othello.cpp not found."
    fi
  done
fi

exec "$@"

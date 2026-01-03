#!/bin/bash
set -e

# Remove a potentially pre-existing server.pid for Rails.
rm -f /app/backend/tmp/pids/server.pid

# Compile Othello AI binary
echo "Compiling Othello AI (v1)..."
cd /app/backend
if [ -f "othelloai_logic/v1/othello.cpp" ]; then
    g++ -O3 -o othelloai_logic/v1/othello othelloai_logic/v1/othello.cpp
    chmod +x othelloai_logic/v1/othello
    echo "Compilation successful (v1)."
else
    echo "Warning: othelloai_logic/v1/othello.cpp not found."
fi

# Compile Othello AI binary (v2)
echo "Compiling Othello AI (v2)..."
if [ -f "othelloai_logic/v2/othello.cpp" ]; then
    g++ -O3 -o othelloai_logic/v2/othello othelloai_logic/v2/othello.cpp
    chmod +x othelloai_logic/v2/othello
    echo "Compilation successful (v2)."
else
    echo "Warning: othelloai_logic/v2/othello.cpp not found."
fi

# Compile Othello AI binary (v3)
echo "Compiling Othello AI (v3)..."
if [ -f "othelloai_logic/v3/othello.cpp" ]; then
    g++ -O3 -o othelloai_logic/v3/othello othelloai_logic/v3/othello.cpp
    chmod +x othelloai_logic/v3/othello
    echo "Compilation successful (v3)."
else
    echo "Warning: othelloai_logic/v3/othello.cpp not found."
fi

# Then exec the container's main process (what's set as CMD in the Dockerfile).
exec "$@"
